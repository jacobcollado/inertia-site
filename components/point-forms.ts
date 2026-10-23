// The forms the point fields settle into (point-field.tsx), and the
// outlines they're spread along: each a set of targets in a unit box, -1 to 1.

export type V = [number, number];
export type Form = (n: number) => V[];

// Points spread evenly along a polyline.
export function along(path: V[], n: number): V[] {
  const len: number[] = [0];
  for (let i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const total = len[len.length - 1];
  const out: V[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const d = (k / n) * total;
    while (j < len.length - 1 && len[j] < d) j++;
    const f = (d - len[j - 1]) / (len[j] - len[j - 1] || 1);
    out.push([path[j - 1][0] + (path[j][0] - path[j - 1][0]) * f, path[j - 1][1] + (path[j][1] - path[j - 1][1]) * f]);
  }
  return out;
}

export const arc = (cx: number, cy: number, r: number, a0: number, a1: number, steps = 96): V[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

export function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number): V[] {
  return [
    ...arc(x1 - r, y0 + r, r, -Math.PI / 2, 0, 12),
    ...arc(x1 - r, y1 - r, r, 0, Math.PI / 2, 12),
    ...arc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, 12),
    ...arc(x0 + r, y0 + r, r, Math.PI, (3 * Math.PI) / 2, 12),
    [x1 - r, y0],
  ];
}

// An upright triangle, radius `r` to its corners, its corners rounded by `c`.
export function roundedTriangle(r: number, c: number): V[] {
  const corners = [0, 1, 2].map((i): V => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    return [Math.cos(a) * r, Math.sin(a) * r + r * 0.15];
  });
  const out: V[] = [];
  corners.forEach((p, i) => {
    const towards = (q: V, d: number): V => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      return [p[0] + ((q[0] - p[0]) * d) / l, p[1] + ((q[1] - p[1]) * d) / l];
    };
    const a = towards(corners[(i + 2) % 3], c * 1.7);
    const b = towards(corners[(i + 1) % 3], c * 1.7);
    for (let k = 0; k <= 8; k++) {
      const f = k / 8;
      // A quadratic round through the corner.
      out.push([(1 - f) ** 2 * a[0] + 2 * (1 - f) * f * p[0] + f ** 2 * b[0], (1 - f) ** 2 * a[1] + 2 * (1 - f) * f * p[1] + f ** 2 * b[1]]);
    }
  });
  out.push(out[0]);
  return out;
}

// Splits n points across several outlines by their lengths.
export function across(paths: V[][], n: number): V[] {
  const lens = paths.map((p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0));
  const total = lens.reduce((a, b) => a + b, 0);
  let left = n;
  return paths.flatMap((p, i) => {
    const k = i === paths.length - 1 ? left : Math.round((lens[i] / total) * n);
    left -= k;
    return along(p, k);
  });
}
