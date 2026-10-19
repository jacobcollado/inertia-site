# Traces a logo mark (a one-colour PNG in public/work/marks) into vector
# outlines for the homepage's logo plates (components/work-plates.tsx):
# outer shapes with their holes, normalised to a height of 1, y up.
#
#   python scripts/trace-marks.py public/work/marks/aether.png public/work/marks/aether.json [preview.png]
#
# Needs numpy, Pillow and potrace (pip install potracer).
import sys, json, math
import numpy as np, potrace
from PIL import Image, ImageDraw, ImageFilter

def bez(p0, c1, c2, p3, tol):
    # adaptive-ish: sample by estimated length
    L = math.dist(p0, c1) + math.dist(c1, c2) + math.dist(c2, p3)
    n = max(2, int(L / tol))
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p3[0],
                    u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p3[1]))
    return out

def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy)
    best, idx = -1, 0
    for i in range(1, len(pts)-1):
        p = pts[i]
        d = abs(dy*p[0] - dx*p[1] + b[0]*a[1] - b[1]*a[0]) / L if L else math.dist(p, a)
        if d > best: best, idx = d, i
    if best <= eps: return [a, b]
    return rdp(pts[:idx+1], eps)[:-1] + rdp(pts[idx:], eps)

def area(poly):
    return sum(poly[i][0]*poly[i-1][1] - poly[i-1][0]*poly[i][1] for i in range(len(poly))) / 2

def inside(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        x1, y1 = poly[i - 1]; x2, y2 = poly[i]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c

def trace(png, scale=3, tol=1.2):
    im = Image.open(png).convert("RGBA").getchannel("A")
    im = im.resize((im.width * scale, im.height * scale), Image.LANCZOS).filter(ImageFilter.GaussianBlur(scale * 0.5))
    a = np.array(im) > 127
    pad = np.zeros((a.shape[0] + 4, a.shape[1] + 4), bool); pad[2:-2, 2:-2] = a
    paths = potrace.Bitmap(~pad).trace(turdsize=int(4 * scale * scale), alphamax=1.0, opticurve=True, opttolerance=0.2)
    polys = []
    for c in paths:
        pts = []; p = (c.start_point.x, c.start_point.y)
        for s in c.segments:
            e = (s.end_point.x, s.end_point.y)
            if s.is_corner:
                pts += [(s.c.x, s.c.y), e]
            else:
                pts += bez(p, (s.c1.x, s.c1.y), (s.c2.x, s.c2.y), e, tol * scale)
            p = e
        pts = rdp(pts + [pts[0]], 0.35 * scale)[:-1]
        if len(pts) >= 3 and abs(area(pts)) > 6 * scale * scale: polys.append(pts)
    # drop the frame around the whole image
    W, H = pad.shape[1], pad.shape[0]
    polys = [p for p in polys if not (min(q[0] for q in p) < 1 and max(q[0] for q in p) > W - 1 and min(q[1] for q in p) < 1)]
    depth = [sum(1 for j, q in enumerate(polys) if j != i and abs(area(q)) > abs(area(p)) and inside(p[0], q)) for i, p in enumerate(polys)]
    outers = [i for i in range(len(polys)) if depth[i] % 2 == 0]
    shapes = []
    for o in outers:
        holes = [h for h in range(len(polys)) if depth[h] == depth[o] + 1 and inside(polys[h][0], polys[o])]
        shapes.append((polys[o], [polys[h] for h in holes]))
    xs = [q[0] for s in shapes for q in s[0]]; ys = [q[1] for s in shapes for q in s[0]]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys); h = y1 - y0
    norm = lambda poly: [[round((q[0] - x0) / h, 4), round((y1 - q[1]) / h, 4)] for q in poly]
    return {"ratio": round((x1 - x0) / h, 4), "shapes": [{"o": norm(o), "h": [norm(x) for x in hs]} for o, hs in shapes]}, shapes, (x0, y0, x1, y1)

if __name__ == "__main__":
    src, out = sys.argv[1:3]
    preview = sys.argv[3] if len(sys.argv) > 3 else None
    data, shapes, (x0, y0, x1, y1) = trace(src)
    json.dump(data, open(out, "w"), separators=(",", ":"))
    if not preview: sys.exit()
    s = 600 / (y1 - y0) if (x1 - x0) / (y1 - y0) < 2.5 else 1400 / (x1 - x0)
    img = Image.new("RGB", (int((x1 - x0) * s) + 20, int((y1 - y0) * s) + 20), "white"); d = ImageDraw.Draw(img)
    for o, hs in shapes:
        for poly in [o] + hs:
            d.line([((q[0] - x0) * s + 10, (q[1] - y0) * s + 10) for q in poly + [poly[0]]], fill="black", width=2)
    img.save(preview)
    print(src.split("/")[-1], "shapes", len(data["shapes"]), "holes", sum(len(x["h"]) for x in data["shapes"]), "pts", sum(len(x["o"]) + sum(len(h) for h in x["h"]) for x in data["shapes"]), "ratio", data["ratio"])
