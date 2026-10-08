"use client";

import { useEffect, useRef } from "react";

// A Newton's cradle rendered in WebGL (three.js), lit like a studio product
// shot: chrome balls on fine threads under a polished frame, on a matte
// black stone base with "Inertia" set into its front edge. The chrome
// reflects a custom studio of soft light panels, which gives it crisp
// highlight streaks and dark edges; an overhead key light and a soft
// contact shadow seat it on the tile behind.
//
// The balls run on a small physics simulation: pendulums under gravity, and
// equal-mass elastic collisions resolved along the chain, so momentum hands
// on the way it does on a real one. Grab an end ball (or one beside it, to
// pull two or three together), let go, and the chain answers; a flick
// carries its speed. Left alone it slowly loses energy, and every so often
// an end ball is lifted and let go again. With reduced motion nothing moves
// on its own, but the balls can still be pulled.
//
// The canvas is transparent, so the tile shows through and the piece
// follows the light / dark theme. Rendering pauses off screen and in hidden
// tabs. three.js is imported on mount, so it never weighs on first load.

const BALLS = 5;
const R = 0.22; // ball radius
const STRING = 1.35; // pivot to ball centre
const RAIL_Y = 2.0; // height of the rails the threads hang from
const RAIL_Z = 0.42; // rails sit this far in front of and behind the balls
const BASE_H = 0.22;
const GRAVITY = 11; // tuned so one swing out and back takes about 2.2s
const LIFT = 0.62; // how far an end ball is lifted between rests, in radians
const MAX_PULL = 1.05;
const SPACING = R * 2.005;

export function CradleScene({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      await document.fonts?.ready;
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
      const canvas = renderer.domElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.touchAction = "pan-y";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      let env: InstanceType<typeof THREE.Texture> | null = null;

      // The studio the chrome reflects: soft light panels (a long strip
      // overhead, tall strips either side, a low fill in front) in a dark
      // room, over a floor the colour of the tile.
      const buildStudio = (dark: boolean) => {
        const studio = new THREE.Scene();
        studio.background = new THREE.Color(dark ? 0x2c2c2c : 0x6a6a6a);
        const panel = (w: number, h: number, power: number, pos: [number, number, number], rot: [number, number, number]) => {
          const m = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(power), side: THREE.DoubleSide, toneMapped: false })
          );
          m.position.set(...pos);
          m.rotation.set(...rot);
          studio.add(m);
        };
        panel(9, 1.6, 4, [0, 6, 0.5], [Math.PI / 2, 0, 0]);
        panel(1.6, 6, 2.6, [-6, 2.5, 1.5], [0, Math.PI / 2, 0]);
        panel(1.2, 6, 1.4, [6, 2.5, -1], [0, -Math.PI / 2, 0]);
        panel(7, 1.2, 0.7, [0, 1.6, 7], [0, Math.PI, 0]);
        panel(30, 30, dark ? 0.12 : 0.6, [0, -0.5, 0], [-Math.PI / 2, 0, 0]);
        const next = pmrem.fromScene(studio, 0.02).texture;
        studio.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          if (m.geometry) m.geometry.dispose();
          if (m.material) (m.material as InstanceType<typeof THREE.Material>).dispose();
        });
        env?.dispose();
        env = next;
        scene.environment = next;
      };

      const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

      // Key light from nearly overhead, so shadows fall close under things.
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(-1.5, 9, 3);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5 });
      key.shadow.radius = 4;
      key.shadow.bias = -0.0004;
      scene.add(key);

      // The floor only catches shadow; the tile is the surface.
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.22 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // A soft contact shadow under the base, so it sits rather than floats.
      const blur = document.createElement("canvas");
      blur.width = blur.height = 256;
      const bctx = blur.getContext("2d")!;
      const grad = bctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(0,0,0,0.85)");
      grad.addColorStop(0.55, "rgba(0,0,0,0.35)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      bctx.fillStyle = grad;
      bctx.fillRect(0, 0, 256, 256);
      const contactMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blur), transparent: true, depthWrite: false });
      const contact = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.3), contactMat);
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = 0.002;
      scene.add(contact);

      const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04 });
      const steel = new THREE.MeshPhysicalMaterial({ color: 0xe6e6e6, metalness: 1, roughness: 0.16 });
      const stone = new THREE.MeshPhysicalMaterial({ color: 0x121212, metalness: 0, roughness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.45 });
      const thread = new THREE.MeshBasicMaterial({ color: 0x8a8a8a });

      const cradle = new THREE.Group();
      scene.add(cradle);

      const slab = new THREE.Mesh(new RoundedBoxGeometry(4.4, BASE_H, 1.5, 6, 0.08), stone);
      slab.position.y = BASE_H / 2;
      slab.castShadow = slab.receiveShadow = true;
      cradle.add(slab);

      // "Inertia" set into the base's front edge, in the site's typeface.
      const word = document.createElement("canvas");
      word.width = 1024;
      word.height = 160;
      const wctx = word.getContext("2d")!;
      const family = getComputedStyle(document.body).fontFamily;
      wctx.font = `450 112px ${family}`;
      wctx.textAlign = "center";
      wctx.textBaseline = "middle";
      wctx.fillStyle = "#ffffff";
      wctx.fillText("Inertia", 512, 84);
      const wordMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(word), transparent: true, opacity: 0.5, depthWrite: false });
      wordMat.map!.colorSpace = THREE.SRGBColorSpace;
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.15), wordMat);
      mark.position.set(0, BASE_H / 2, 0.7505);
      cradle.add(mark);

      // Frame: two arches (posts and a rail), one in front, one behind,
      // wide enough that a ball at full pull stays inside the posts.
      const halfW = 1.95;
      const tubes: InstanceType<typeof THREE.TubeGeometry>[] = [];
      for (const z of [-RAIL_Z, RAIL_Z]) {
        const pts: [number, number, number][] = [
          [-halfW, BASE_H, z],
          [-halfW, RAIL_Y - 0.14, z],
          [-halfW + 0.14, RAIL_Y, z],
          [halfW - 0.14, RAIL_Y, z],
          [halfW, RAIL_Y - 0.14, z],
          [halfW, BASE_H, z],
        ];
        const path = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0);
        const geo = new THREE.TubeGeometry(path, 96, 0.03, 16, false);
        tubes.push(geo);
        const m = new THREE.Mesh(geo, steel);
        m.castShadow = true;
        cradle.add(m);
      }

      // Balls, each on a V of two threads from the rails, hung from a pivot
      // on the centre line. Rotating a pendulum group swings its ball.
      const pivots: number[] = [];
      const pendulums: InstanceType<typeof THREE.Group>[] = [];
      const balls: InstanceType<typeof THREE.Mesh>[] = [];
      const ballGeo = new THREE.SphereGeometry(R, 64, 48);
      const threadGeo: InstanceType<typeof THREE.CylinderGeometry>[] = [];
      for (let i = 0; i < BALLS; i++) {
        const x = (i - (BALLS - 1) / 2) * SPACING;
        pivots.push(x);
        const p = new THREE.Group();
        p.position.set(x, RAIL_Y, 0);
        const ball = new THREE.Mesh(ballGeo, chrome);
        ball.position.y = -STRING;
        ball.castShadow = true;
        ball.userData.index = i;
        p.add(ball);
        balls.push(ball);
        for (const z of [-RAIL_Z, RAIL_Z]) {
          const from = new THREE.Vector3(0, 0, z);
          const to = new THREE.Vector3(0, -STRING + R * 0.9, 0);
          const g = new THREE.CylinderGeometry(0.004, 0.004, from.distanceTo(to), 6);
          threadGeo.push(g);
          const t = new THREE.Mesh(g, thread);
          t.position.copy(from).add(to).multiplyScalar(0.5);
          t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
          p.add(t);
        }
        cradle.add(p);
        pendulums.push(p);
      }

      // Theme: the studio, base, threads and shadows follow the page; the
      // metals don't.
      const applyTheme = () => {
        const dark = document.documentElement.dataset.theme === "dark" && document.documentElement.classList.contains("themed");
        buildStudio(dark);
        stone.color.set(dark ? 0x1e1e1e : 0x121212);
        thread.color.set(dark ? 0x5c5c5c : 0x8a8a8a);
        floor.material.opacity = dark ? 0.5 : 0.22;
        contactMat.opacity = dark ? 0.9 : 0.55;
        wordMat.opacity = dark ? 0.5 : 0.6;
        renderer.toneMappingExposure = dark ? 0.9 : 1;
      };
      applyTheme();
      const themeObs = new MutationObserver(applyTheme);
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

      // Close and a little low, so the piece fills the panel.
      const fit = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const dist = camera.aspect < 1.6 ? 8.4 : 6.4;
        camera.position.set(0, 1.9, dist);
        camera.lookAt(0, 0.98, 0);
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);

      // --- Physics -------------------------------------------------------
      // Each ball is a pendulum (angle, angular velocity). Contacts are
      // resolved along the chain: equal masses swap velocities when they
      // close on each other, and overlaps are pushed apart. A "held" group
      // (dragged, or being lifted) follows its target and pushes as if it
      // were infinitely heavy.
      const theta = new Array(BALLS).fill(0);
      const omega = new Array(BALLS).fill(0);
      // `rate` is how quickly the held group follows its target: closely for a
      // hand, slowly for the automatic lift.
      let held: { from: number; to: number; target: number; prev: number; vel: number; rate: number } | null = null;
      const isHeld = (i: number) => !!held && i >= held.from && i <= held.to;
      const xOf = (i: number) => pivots[i] + STRING * Math.sin(theta[i]);

      const step = (dt: number) => {
        if (held) {
          const g = held;
          const next = g.prev + (g.target - g.prev) * Math.min(1, dt * g.rate);
          g.vel = (next - g.prev) / dt;
          g.prev = next;
          for (let i = g.from; i <= g.to; i++) {
            theta[i] = next;
            omega[i] = g.vel;
          }
        }
        for (let i = 0; i < BALLS; i++) {
          if (isHeld(i)) continue;
          omega[i] += -(GRAVITY / STRING) * Math.sin(theta[i]) * dt;
          omega[i] *= 0.99995; // air and string losses
          theta[i] += omega[i] * dt;
        }
        for (let pass = 0; pass < 6; pass++) {
          const order = pass % 2 ? [3, 2, 1, 0] : [0, 1, 2, 3];
          for (const i of order) {
            const j = i + 1;
            const overlap = 2 * R - (xOf(j) - xOf(i));
            if (overlap <= 0) continue;
            const hi = isHeld(i);
            const hj = isHeld(j);
            if (hi && hj) continue;
            // Push apart along the arc.
            if (hi) theta[j] += overlap / STRING;
            else if (hj) theta[i] -= overlap / STRING;
            else {
              theta[i] -= overlap / (2 * STRING);
              theta[j] += overlap / (2 * STRING);
            }
            // Closing on each other: exchange, or be struck by the held one.
            if (omega[i] > omega[j]) {
              if (hi) omega[j] = 2 * omega[i] - omega[j];
              else if (hj) omega[i] = 2 * omega[j] - omega[i];
              else [omega[i], omega[j]] = [omega[j], omega[i]];
            }
          }
        }
      };

      // --- Pulling the balls --------------------------------------------
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const local = new THREE.Vector3();
      const toNdc = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
      };
      const pick = () => {
        const hit = raycaster.intersectObjects(balls, false)[0];
        return hit ? (hit.object.userData.index as number) : -1;
      };
      // Where the pointer meets the cradle's own plane, as a pull angle
      // around the grabbed ball's pivot.
      let grabPivot = 0;
      let grabSide = -1;
      const pullAngle = () => {
        const ray = raycaster.ray.clone().applyMatrix4(cradle.matrixWorld.clone().invert());
        if (!ray.intersectPlane(plane, local)) return null;
        const a = Math.atan2(local.x - grabPivot, RAIL_Y - local.y);
        return grabSide < 0 ? Math.max(-MAX_PULL, Math.min(0, a)) : Math.min(MAX_PULL, Math.max(0, a));
      };
      let dragging = false;
      let lifting = false;
      let lastTouch = -Infinity;
      const onDown = (e: PointerEvent) => {
        toNdc(e);
        const i = pick();
        if (i < 0) return;
        // A ball and everything outboard of it come up together.
        const left = i <= (BALLS - 1) / 2;
        grabSide = left ? -1 : 1;
        grabPivot = pivots[i];
        held = left
          ? { from: 0, to: i, target: theta[i], prev: theta[i], vel: 0, rate: 30 }
          : { from: i, to: BALLS - 1, target: theta[i], prev: theta[i], vel: 0, rate: 30 };
        lifting = false;
        dragging = true;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
        e.preventDefault();
      };
      const onCanvasMove = (e: PointerEvent) => {
        toNdc(e);
        if (dragging && held) {
          const a = pullAngle();
          if (a !== null) held.target = a;
        } else {
          canvas.style.cursor = pick() >= 0 ? "grab" : "";
        }
      };
      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        held = null; // Let go: the balls keep the speed they were moving at.
        lastTouch = performance.now();
        canvas.style.cursor = "";
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onCanvasMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);

      // A slight tilt toward the cursor, eased; it holds still mid-pull.
      const tilt = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        if (dragging) return;
        const r = el.getBoundingClientRect();
        tilt.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        tilt.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);

      // Left alone, the swing dies down; then an end ball (alternating) is
      // lifted and let go again. The first lift starts right away.
      let liftSide = -1;
      const maybeLift = (now: number) => {
        if (reduced || dragging || now - lastTouch < 2500) return;
        if (lifting && held) {
          // Up: let go from rest.
          if (Math.abs(held.prev - held.target) < 0.004) {
            for (let i = held.from; i <= held.to; i++) omega[i] = 0;
            held = null;
            lifting = false;
          }
          return;
        }
        const energy = Math.max(...theta.map(Math.abs), ...omega.map((w) => Math.abs(w) * 0.3));
        if (energy > 0.12) return;
        const i = liftSide < 0 ? 0 : BALLS - 1;
        held = { from: i, to: i, target: liftSide * LIFT, prev: theta[i], vel: 0, rate: 2.6 };
        lifting = true;
        liftSide = -liftSide;
      };

      const clock = new THREE.Clock();
      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 1 / 30);
        if (!visible || document.hidden) return;
        maybeLift(performance.now());
        const sub = 12;
        for (let k = 0; k < sub; k++) step(dt / sub);
        for (let i = 0; i < BALLS; i++) pendulums[i].rotation.z = theta[i];
        cradle.rotation.y += (tilt.x * 0.2 - 0.32 - cradle.rotation.y) * 0.05;
        cradle.rotation.x += (tilt.y * 0.04 - cradle.rotation.x) * 0.05;
        renderer.render(scene, camera);
      };
      cradle.rotation.y = -0.32;
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        themeObs.disconnect();
        window.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onCanvasMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        [ballGeo, slab.geometry, floor.geometry, contact.geometry, mark.geometry, ...tubes, ...threadGeo].forEach((g) => g.dispose());
        [chrome, steel, stone, thread, floor.material, contactMat, wordMat].forEach((m) => m.dispose());
        contactMat.map?.dispose();
        wordMat.map?.dispose();
        env?.dispose();
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} aria-hidden="true" className={className} />;
}
