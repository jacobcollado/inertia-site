import type * as Three from "three";

// The site's technical drawings, shared by the homepage's opening plate
// (movement-plate.tsx) and the work's logo plates (work-plates.tsx), so they
// read as one set: the same view, the same line, the same ink.
//
// Things are modelled as real geometry and rendered as a hidden-line
// drawing, not shaded: each surface is drawn into a buffer of depth, normal
// and part id, then a second pass draws a line wherever any of those break,
// so only edges you could actually see are drawn. True lines (axes and the
// like) are drawn after, hidden where a surface stands in front of them.
// Everything is drawn at twice the CSS size: crisp on retina screens and
// downsampled into smooth lines on standard ones. Colours come from the
// stylesheet's --ink and --signal, and follow the theme.

type ThreeModule = typeof import("three");

// The one angle every drawing is seen from, looking down on things.
export const ELEVATION = (30 * Math.PI) / 180;
export const AZIMUTH = (-18 * Math.PI) / 180;

// Part ids at or above this are drawn in the drawing's accent (the signal
// blue unless it names another), and at or above the second in sage.
export const ACCENT_ID = 200;
export const ACCENT2_ID = 230;
// With `fill`, parts from here are filled solid in ink (hair, eyes), and
// accent parts are tinted, lightly on faces toward the viewer and deeper on
// the walls, so a filled drawing still reads its depth.
export const INK_FILL_ID = 240;
// And parts from here to the second accent are filled with the paper.
export const PAPER_FILL_ID = 210;

// --motion-ease, cubic-bezier(0.22, 1, 0.36, 1), solved for x.
export function ease(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 6; i++) {
    const cx = 3 * 0.22 * t * (1 - t) ** 2 + 3 * 0.36 * t * t * (1 - t) + t ** 3 - x;
    const dx = 3 * 0.22 * (1 - t) ** 2 + 6 * (0.36 - 0.22) * t * (1 - t) + 3 * (1 - 0.36) * t * t;
    if (Math.abs(dx) < 1e-6) break;
    t -= cx / dx;
  }
  return 3 * t * (1 - t) ** 2 + 3 * t * t * (1 - t) + t ** 3;
}

// For things lifted or lowered from rest: they gather speed, then settle,
// instead of leaving at full speed.
export function easeInOut(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
}

// With `smooth`, the geometry is drawn at twice the density and each pixel
// of the drawing averages the four under it, so lines are antialiased and
// slow motion glides between pixels instead of stepping a whole pixel at a
// time. Four times the work: for small drawings that move slowly.
export function lineDrawing(
  THREE: ThreeModule,
  host: HTMLElement,
  onTheme: () => void,
  { smooth = false, accent = "--signal", fill = false }: { smooth?: boolean; accent?: string; fill?: boolean } = {},
) {
  const density = smooth ? 2 : 1;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(2);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 40, 160);

  // The geometry buffer: surface normals in rgb, the part id in alpha, and
  // depth.
  const target = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthTexture: new THREE.DepthTexture(1, 1),
  });
  // One texel of the geometry buffer, and one pixel of the canvas, in uv.
  const texel = new THREE.Vector2();
  const screen = new THREE.Vector2();
  const ink = new THREE.Vector3();
  const signal = new THREE.Vector3();
  const sage = new THREE.Vector3();
  const paper = new THREE.Vector3();

  const materials: Three.Material[] = [];
  const geometries: Three.BufferGeometry[] = [];

  const surfaceVert = /* glsl */ `
    varying vec3 vView;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;
  const surfaceFrag = /* glsl */ `
    uniform float uId;
    varying vec3 vView;
    void main() {
      vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
      gl_FragColor = vec4(n * 0.5 + 0.5, uId / 255.0);
    }
  `;
  // A surface's material. Parts with different ids are always parted by a
  // line, even where they meet flush.
  const surface = (id: number) => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uId: { value: id } },
      vertexShader: surfaceVert,
      fragmentShader: surfaceFrag,
      side: THREE.DoubleSide,
    });
    materials.push(m);
    return m;
  };

  // A true line's material, at some strength, in ink or the accent.
  const lineMats: Three.ShaderMaterial[] = [];
  const lineMat = (alpha: number, accent = false) => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        tDepth: { value: target.depthTexture },
        uScreen: { value: screen },
        uColor: { value: accent ? signal : ink },
        uAlpha: { value: alpha },
      },
      vertexShader: /* glsl */ `
        void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDepth;
        uniform vec2 uScreen;
        uniform vec3 uColor;
        uniform float uAlpha;
        void main() {
          float d = texture2D(tDepth, gl_FragCoord.xy * uScreen).r;
          if (gl_FragCoord.z > d + 0.0004) discard;
          gl_FragColor = vec4(uColor * uAlpha, uAlpha);
        }
      `,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
    });
    lineMats.push(m);
    materials.push(m);
    return m;
  };

  // The drawing pass: a line wherever depth folds or steps, the surface
  // turns, or one part meets another. Each line takes the colour of the
  // nearest part it borders.
  const draw = new THREE.ShaderMaterial({
    uniforms: {
      tNormal: { value: target.texture },
      tDepth: { value: target.depthTexture },
      uTexel: { value: texel },
      uInk: { value: ink },
      uSignal: { value: signal },
      uSage: { value: sage },
      uPaper: { value: paper },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tNormal;
      uniform sampler2D tDepth;
      uniform vec2 uTexel;
      uniform vec3 uInk;
      uniform vec3 uSignal;
      uniform vec3 uSage;
      uniform vec3 uPaper;
      varying vec2 vUv;

      // Neighbours are a canvas pixel away, however dense the buffer, so a
      // line is as wide smooth or not.
      float depthAt(vec2 uv, vec2 o) { return texture2D(tDepth, uv + o * uTexel * ${density.toFixed(1)}).r; }
      vec4 surfAt(vec2 uv, vec2 o) { return texture2D(tNormal, uv + o * uTexel * ${density.toFixed(1)}); }

      // The line at one place in the buffer, premultiplied.
      vec4 shade(vec2 uv) {
        float d0 = depthAt(uv, vec2(0.0));
        float dl = depthAt(uv, vec2(-1.0, 0.0));
        float dr = depthAt(uv, vec2(1.0, 0.0));
        float dd = depthAt(uv, vec2(0.0, -1.0));
        float du = depthAt(uv, vec2(0.0, 1.0));
        float da = depthAt(uv, vec2(-1.0, -1.0));
        float db = depthAt(uv, vec2(1.0, 1.0));
        float dc = depthAt(uv, vec2(-1.0, 1.0));
        float de = depthAt(uv, vec2(1.0, -1.0));
        // Planar faces are linear in depth under an orthographic camera, so
        // their second difference is zero; edges and folds are not.
        float lap = max(max(abs(dl + dr - 2.0 * d0), abs(dd + du - 2.0 * d0)),
                        max(abs(da + db - 2.0 * d0), abs(dc + de - 2.0 * d0)));
        float edge = smoothstep(0.00035, 0.0011, lap);

        vec4 s0 = surfAt(uv, vec2(0.0));
        vec4 sn[4];
        sn[0] = surfAt(uv, vec2(-1.0, 0.0));
        sn[1] = surfAt(uv, vec2(1.0, 0.0));
        sn[2] = surfAt(uv, vec2(0.0, -1.0));
        sn[3] = surfAt(uv, vec2(0.0, 1.0));
        float dn[4];
        dn[0] = dl; dn[1] = dr; dn[2] = dd; dn[3] = du;

        float nearest = d0;
        float nearId = s0.a;
        for (int i = 0; i < 4; i++) {
          bool both = d0 < 1.0 && dn[i] < 1.0;
          if (both) {
            float turn = 1.0 - dot(s0.rgb * 2.0 - 1.0, sn[i].rgb * 2.0 - 1.0);
            edge = max(edge, smoothstep(0.08, 0.25, turn));
            if (abs(sn[i].a - s0.a) > 0.002) edge = 1.0;
          }
          if (dn[i] < nearest) { nearest = dn[i]; nearId = sn[i].a; }
        }

        float nid = nearId * 255.0;
        vec3 col = nid > ${INK_FILL_ID - 0.5} ? uInk : nid > ${ACCENT2_ID - 0.5} ? uSage : nid > ${PAPER_FILL_ID - 0.5} ? uInk : nid > ${ACCENT_ID - 0.5} ? uSignal : uInk;
        float a = edge * 0.92;
        return vec4(col * a, a);
      }

      // The fill under the lines, premultiplied: ink parts solid, accent
      // parts tinted by how squarely they face the viewer.
      vec4 fillAt(vec2 uv) {
        if (texture2D(tDepth, uv).r >= 1.0) return vec4(0.0);
        vec4 s = texture2D(tNormal, uv);
        float id = s.a * 255.0;
        float front = smoothstep(0.7, 0.95, abs(s.b * 2.0 - 1.0));
        if (id > ${INK_FILL_ID - 0.5}) return vec4(uInk, 1.0);
        if (id > ${PAPER_FILL_ID - 0.5} && id < ${ACCENT2_ID - 0.5}) return vec4(uPaper, 1.0);
        if (id > ${ACCENT_ID - 0.5} && id < ${PAPER_FILL_ID - 0.5}) {
          float a = mix(0.42, 0.14, front);
          return vec4(uSignal * a, a);
        }
        return vec4(0.0);
      }

      void main() {
        ${
          smooth
            ? `// The four buffer texels under this pixel, averaged.
        vec4 lines = 0.25 * (shade(vUv + vec2(-0.5, -0.5) * uTexel) + shade(vUv + vec2(0.5, -0.5) * uTexel) +
                               shade(vUv + vec2(-0.5, 0.5) * uTexel) + shade(vUv + vec2(0.5, 0.5) * uTexel));`
            : "vec4 lines = shade(vUv);"
        }
        ${fill ? "gl_FragColor = lines + fillAt(vUv) * (1.0 - lines.a);" : "gl_FragColor = lines;"}
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  materials.push(draw);
  const drawScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), draw);
  quad.frustumCulled = false;
  drawScene.add(quad);
  geometries.push(quad.geometry);
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Colours, from the stylesheet, as raw sRGB.
  const cssRgb = (name: string, fallback: string) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name}, ${fallback})`;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    probe.remove();
    return [c[0] / 255, c[1] / 255, c[2] / 255] as const;
  };
  const applyTheme = () => {
    ink.set(...cssRgb("--ink", "#1a1a1a"));
    signal.set(...cssRgb(accent, "#2a5cff"));
    sage.set(...cssRgb("--sage", "#7c9672"));
    paper.set(...cssRgb("--paper", "#ffffff"));
  };
  applyTheme();
  const themeObs = new MutationObserver(() => {
    applyTheme();
    onTheme();
  });
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

  return {
    THREE,
    scene,
    camera,
    surface,
    lineMat,
    // Keeps a geometry to be disposed with the drawing.
    keep<G extends Three.BufferGeometry>(g: G) {
      geometries.push(g);
      return g;
    },
    // Sizes the drawing to its box, in CSS pixels.
    setSize(width: number, height: number) {
      renderer.setSize(width, height, false);
      target.setSize(width * 2 * density, height * 2 * density);
      texel.set(1 / (width * 2 * density), 1 / (height * 2 * density));
      screen.set(1 / (width * 2), 1 / (height * 2));
    },
    // Looks at a point from the shared angle, `scale` CSS pixels to the
    // unit, in a box of the given size.
    aim(look: Three.Vector3, width: number, height: number, scale: number) {
      camera.position
        .set(Math.sin(AZIMUTH) * Math.cos(ELEVATION), Math.sin(ELEVATION), Math.cos(AZIMUTH) * Math.cos(ELEVATION))
        .multiplyScalar(100)
        .add(look);
      camera.lookAt(look);
      camera.left = -width / scale / 2;
      camera.right = width / scale / 2;
      camera.top = height / scale / 2;
      camera.bottom = -height / scale / 2;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    },
    // Surfaces on layer 0 make the drawing; true lines go on layer 1.
    render() {
      renderer.setRenderTarget(target);
      renderer.clear();
      camera.layers.set(0);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(drawScene, flat);
      camera.layers.set(1);
      renderer.render(scene, camera);
    },
    dispose() {
      themeObs.disconnect();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      target.depthTexture?.dispose();
      target.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}

export type LineDrawing = ReturnType<typeof lineDrawing>;
