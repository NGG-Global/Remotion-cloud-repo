"""Stitch OSM coastline ways into land polygons clipped to a bbox; emit SVG path data."""
import json, math, sys
S, W, N, E = 37.70, -122.56, 37.93, -122.28
LAT0 = (S + N) / 2; K = 4000 / (E - W)  # 4000 px wide
def proj(lat, lon): return ((lon - W) * K, (N - lat) * K / math.cos(math.radians(LAT0)))
WIDTH, HEIGHT = proj(S, E)
d = json.load(open(sys.argv[1]))
ways = [[(p["lat"], p["lon"]) for p in e["geometry"]] for e in d["elements"]]
# merge chains end-to-start (coastline ways are directed: land on the left)
chains = [w[:] for w in ways]
merged = True
while merged:
    merged = False
    ends = {}
    for i, c in enumerate(chains): ends.setdefault(c[0], []).append(i)
    for i, c in enumerate(chains):
        if c is None or c[0] == c[-1]: continue
        for j in ends.get(c[-1], []):
            if j != i and chains[j] is not None and chains[j][0] != chains[j][-1]:
                chains[i] = c + chains[j][1:]; chains[j] = None; merged = True; break
        if merged: break
    chains = [c for c in chains if c is not None]
rings = [c for c in chains if c[0] == c[-1]]
opens = [c for c in chains if c[0] != c[-1]]
print("rings", len(rings), "open", len(opens), file=sys.stderr)
def inside(p): return S <= p[0] <= N and W <= p[1] <= E
def edge_pos(p):
    # perimeter parameter going clockwise in screen space from top-left: top(W->E), right(N->S), bottom(E->W), left(S->N)
    lat, lon = p
    eps = 1e-6
    if abs(lat - N) < 1e-4: return (lon - W) / (E - W)
    if abs(lon - E) < 1e-4: return 1 + (N - lat) / (N - S)
    if abs(lat - S) < 1e-4: return 2 + (E - lon) / (E - W)
    return 3 + (lat - S) / (N - S)
def clip_to_box(c):
    # keep the inside part; project crossing points onto the bbox edge (chains are clipped by overpass to bbox-touching ways, so ends are near edges)
    out = []
    for p in c:
        out.append((min(max(p[0], S), N), min(max(p[1], W), E)))
    return out
corner_at = {0: (N, W), 1: (N, E), 2: (S, E), 3: (S, W)}
polys = []
# open chains: snap ends to bbox, then close by walking the box perimeter. Land is on the left of the way direction;
# in screen coords (y down) that means walking from end back to start counter-clockwise... we walk clockwise from end to start.
segs = []
for c in opens:
    c = clip_to_box(c)
    segs.append(c)
used = [False] * len(segs)
for i in range(len(segs)):
    if used[i]: continue
    ring = []; k = i
    while True:
        used[k] = True; ring += segs[k]
        t_end = edge_pos(segs[k][-1])
        # find next segment start going counter-clockwise (decreasing perimeter param) from t_end
        best, bestd = None, 9
        for j in range(len(segs)):
            ts = edge_pos(segs[j][0])
            dd = (t_end - ts) % 4
            if dd < bestd and (not used[j] or j == i): best, bestd = j, dd
        # add corners passed while walking counter-clockwise from t_end to start of best
        t = t_end
        for _ in range(4):
            corner_t = math.floor(t - 1e-9) if t % 1 > 1e-9 else t - 1
            corner_t = math.floor(t) if t % 1 > 1e-9 else t - 1
            if (t_end - corner_t) % 4 >= bestd or (t_end - corner_t) % 4 == 0 and bestd == 0: break
            ring.append(corner_at[int(corner_t) % 4]); t = corner_t
        if best == i or best is None: break
        k = best
    polys.append(ring)
polys += rings
def rdp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]; dist = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L
        if dist > dmax: dmax, idx = dist, i
    if dmax > eps: return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]
paths = []
for poly in polys:
    pts = [proj(*p) for p in poly]
    if pts[0] == pts[-1] or math.dist(pts[0], pts[-1]) < 1e-6:
        far = max(range(len(pts)), key=lambda i: math.dist(pts[0], pts[i]))
        pts = rdp(pts[:far + 1], 0.9)[:-1] + rdp(pts[far:], 0.9)
    else:
        pts = rdp(pts, 0.9)
    if len(pts) < 3: continue
    paths.append("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z")
places = {"alcatraz": (37.8267, -122.4230), "aquaticPark": (37.8077, -122.4217), "pier39": (37.8087, -122.4098),
          "goldenGate": (37.8199, -122.4783), "angelIsland": (37.8609, -122.4326), "fortPoint": (37.8105, -122.4772),
          "littleAlcatraz": (37.8286, -122.4262), "treasureIsland": (37.8235, -122.3706), "sausalito": (37.8591, -122.4853),
          "bayBridge": (37.7983, -122.3778), "downtown": (37.7920, -122.4000), "gateMouth": (37.8100, -122.5300)}
out = {"width": round(WIDTH), "height": round(HEIGHT), "kmPerPx": (E - W) * 111.32 * math.cos(math.radians(LAT0)) / WIDTH,
       "land": paths, "places": {k: [round(v, 1) for v in proj(*p)] for k, p in places.items()}}
json.dump(out, open(sys.argv[2], "w"))
print("paths", len(paths), "chars", sum(map(len, paths)), "size", out["width"], out["height"], file=sys.stderr)
