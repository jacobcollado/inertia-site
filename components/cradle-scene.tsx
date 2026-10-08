"use client";

import { useEffect, useRef } from "react";

// A Newton's cradle rendered in WebGL (three.js): chrome balls on fine
// strings under a brushed-metal frame, on a matte base, lit like a studio
// product shot with real reflections and soft shadows falling on the tile
// behind it. The end balls trade a swing back and forth on a slow loop, the
// middle three hold still, and the whole piece tilts a little toward the
// cursor. The canvas is transparent, so the tile shows through and the
// piece follows the light / dark theme. Rendering pauses off screen and in
// hidden tabs; with reduced motion it holds still. three.js is imported on
// mount, so it never weighs on the first load.

const BALLS = 5;
const R = 0.22; // ball radius
const STRING = 1.35; // pivot to ball centre
const RAIL_Y = 1.9; // height of the rails the strings hang from
const RAIL_Z = 0.42; // rails sit this far in front of and behind the balls
const SWING = 0.62; // end ball's swing, in radians
const PERIOD = 2.6; // seconds for one ball's out-and-back

export function CradleScene({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // No WebGL: the tile alone shows.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;

      const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

      // Key light from above front left, casting the shadow onto the floor.
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-3, 7, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.camera.left = -4;
      key.shadow.camera.right = 4;
      key.shadow.camera.top = 4;
      key.shadow.camera.bottom = -4;
      key.shadow.radius = 8;
      key.shadow.bias = -0.0004;
      scene.add(key);
      scene.add(new THREE.AmbientLight(0xffffff, 0.25));

      // The floor only catches shadow; the tile is the surface.
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.18 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.06, envMapIntensity: 1.2 });
      const brushed = new THREE.MeshPhysicalMaterial({ color: 0xd8d8d8, metalness: 1, roughness: 0.32 });
      const base = new THREE.MeshPhysicalMaterial({ color: 0xe9e9e9, metalness: 0, roughness: 0.75, clearcoat: 0.2 });
      const thread = new THREE.MeshBasicMaterial({ color: 0x9a9a9a });

      const cradle = new THREE.Group();
      scene.add(cradle);

      // Base: a low rounded slab.
      const slab = new THREE.Mesh(new RoundedBoxGeometry(4.4, 0.16, 1.5, 4, 0.06), base);
      slab.position.y = 0.08;
      slab.castShadow = slab.receiveShadow = true;
      cradle.add(slab);

      // Frame: two arches (posts and a rail), one in front, one behind.
      // Wide enough that an end ball at full swing stays inside the posts.
      const halfW = 1.95;
      const tube = (pts: [number, number, number][]) => {
        const path = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0);
        const m = new THREE.Mesh(new THREE.TubeGeometry(path, 64, 0.025, 12, false), brushed);
        m.castShadow = true;
        return m;
      };
      for (const z of [-RAIL_Z, RAIL_Z]) {
        cradle.add(
          tube([
            [-halfW, 0.16, z],
            [-halfW, RAIL_Y - 0.12, z],
            [-halfW + 0.12, RAIL_Y, z],
            [halfW - 0.12, RAIL_Y, z],
            [halfW, RAIL_Y - 0.12, z],
            [halfW, 0.16, z],
          ])
        );
      }

      // Balls, each on a V of two threads, hung from a pivot on the centre
      // line between the rails. Rotating a pendulum group swings its ball.
      const pendulums: InstanceType<typeof THREE.Group>[] = [];
      const ballGeo = new THREE.SphereGeometry(R, 64, 48);
      for (let i = 0; i < BALLS; i++) {
        const x = (i - (BALLS - 1) / 2) * R * 2.02;
        const p = new THREE.Group();
        p.position.set(x, RAIL_Y, 0);
        const ball = new THREE.Mesh(ballGeo, chrome);
        ball.position.y = -STRING;
        ball.castShadow = true;
        p.add(ball);
        for (const z of [-RAIL_Z, RAIL_Z]) {
          const from = new THREE.Vector3(0, 0, z);
          const to = new THREE.Vector3(0, -STRING + R * 0.9, 0);
          const len = from.distanceTo(to);
          const t = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, len, 6), thread);
          t.position.copy(from).add(to).multiplyScalar(0.5);
          t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
          p.add(t);
        }
        cradle.add(p);
        pendulums.push(p);
      }

      // Theme: the base and thread follow the page; the metals don't.
      const applyTheme = () => {
        const dark = document.documentElement.dataset.theme === "dark" && document.documentElement.classList.contains("themed");
        base.color.set(dark ? 0x1c1c1c : 0xeaeaea);
        thread.color.set(dark ? 0x5a5a5a : 0x9a9a9a);
        (floor.material as InstanceType<typeof THREE.ShadowMaterial>).opacity = dark ? 0.45 : 0.18;
        renderer.toneMappingExposure = dark ? 0.85 : 1;
      };
      applyTheme();
      const themeObs = new MutationObserver(applyTheme);
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

      // Fit the camera to the container.
      const fit = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Pull back on narrow panels so the whole cradle fits.
        const dist = camera.aspect < 1.6 ? 9.4 : 7.6;
        camera.position.set(0, 2.6, dist);
        camera.lookAt(0, 0.95, 0);
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);

      // A slight tilt toward the cursor, eased.
      const target = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);

      const clock = new THREE.Clock();
      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        const t = clock.getElapsedTime();
        if (!reduced) {
          // One full cycle is two swings: the right ball out and back, then
          // the left. Each swing follows a sine, a pendulum's own easing.
          const phase = (t / (PERIOD * 2)) % 1;
          const s = Math.sin((phase % 0.5) * 2 * Math.PI);
          pendulums[BALLS - 1].rotation.z = phase < 0.5 ? s * SWING : 0;
          pendulums[0].rotation.z = phase < 0.5 ? 0 : -s * SWING;
        }
        cradle.rotation.y += (target.x * 0.22 - 0.35 - cradle.rotation.y) * 0.05;
        cradle.rotation.x += (target.y * 0.04 - cradle.rotation.x) * 0.05;
        renderer.render(scene, camera);
      };
      cradle.rotation.y = -0.35;
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        themeObs.disconnect();
        window.removeEventListener("pointermove", onMove);
        scene.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          if (m.geometry) m.geometry.dispose();
        });
        [chrome, brushed, base, thread].forEach((m) => m.dispose());
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} aria-hidden="true" className={className} />;
}
