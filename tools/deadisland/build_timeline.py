"""The edit decision list of the Dead Island documentary, compiled to src/deadisland/data/timeline.json.

Each chapter file in tools/deadisland/edit/ holds lines of the form

    at | source id | source in | subject | options

`at` is seconds on the narration clock; a shot runs until the next shot's `at`. Options (space separated):
  x0.75           playback speed
  dis / dis0.8    dissolve in (default 0.5 s);  fb1.0  fade from black
  crop=x,y,w,h    crop inside the source (fractions)
  nat=0.1         level of the source's own sound
  freeze          hold the first frame
  reuse           this shot deliberately repeats footage used elsewhere (callback)
Label lines:  L | at | duration | line | sub | tone      (tone 'dark' for a label over a white card)
Bed lines:    B | at | source id | source in | duration | level     (continuous source sound under several shots)

Usage: python3 tools/deadisland/build_timeline.py
"""
import glob, json, re
NARRATION, TAIL = 1668.88, 3.2
CHAPTERS = [(0, "Cold open"), (55.5, "Introduction"), (127.6, "The 2011 trailer"), (272.3, "The game behind the trailer"), (316.0, "Banoi"),
            (518.3, "Combat"), (591.6, "Riptide"), (697.5, "Techland and Dying Light"), (779.2, "Spin-offs"), (838.9, "E3 2014"),
            (905.3, "Yager"), (980.5, "Sumo Digital and the silent years"), (1084.9, "Gamescom 2022"), (1133.5, "Dead Island 2: design"),
            (1261.2, "Release"), (1314.0, "Haus and SoLA"), (1415.2, "The recurring idea"), (1480.4, "Reflection"), (1635.3, "Outro")]
def chapter(t): return [n for a, n in CHAPTERS if a <= t + 1e-6][-1]
shots, labels, beds = [], [], []
for f in sorted(glob.glob("tools/deadisland/edit/*.edl")):
    for ln, line in enumerate(open(f, encoding="utf-8"), 1):
        line = line.split("#")[0].strip()
        if not line: continue
        p = [x.strip() for x in line.split("|")]
        try:
            if p[0] == "L":
                labels.append({"at": float(p[1]), "dur": float(p[2]), "line": p[3], **({"sub": p[4]} if len(p) > 4 and p[4] else {}), **({"tone": p[5]} if len(p) > 5 and p[5] else {})}); continue
            if p[0] == "B":
                beds.append({"at": float(p[1]), "src": p[2], "in": float(p[3]), "dur": float(p[4]), "volume": float(p[5])}); continue
            s = {"at": float(p[0]), "src": p[1], "in": float(p[2]), "subject": p[3]}
            for o in (p[4].split() if len(p) > 4 else []):
                if o.startswith("x"): s["speed"] = float(o[1:])
                elif o.startswith("dis"): s["transition"] = "dissolve"; s["transitionDur"] = float(o[3:] or 0.5)
                elif o.startswith("fb"): s["transition"] = "fadeFromBlack"; s["transitionDur"] = float(o[2:] or 1.0)
                elif o.startswith("crop="): s["crop"] = [float(v) for v in o[5:].split(",")]
                elif o.startswith("nat="): s["nat"] = float(o[4:])
                elif o == "freeze": s["freeze"] = True
                elif o == "reuse": s["reuse"] = True   # deliberate, narratively motivated repeat
                else: raise ValueError(f"unknown option {o}")
            shots.append(s)
        except Exception as e:
            raise SystemExit(f"{f}:{ln}: {e}: {line}")
shots.sort(key=lambda s: s["at"])
seen = {}
for s in shots:
    # Ids depend only on the source and in-point, so inserting a shot does not force every clip to be re-cut.
    base = f"{re.sub(r'[^a-z0-9]+', '', s['src'])}_{round(s['in'] * 100):06d}"
    seen[base] = seen.get(base, 0) + 1
    s["id"] = base if seen[base] == 1 else f"{base}_{seen[base]}"
    s["chapter"] = chapter(s["at"])
for b in beds: b["id"] = f"bed_{b['src']}_{int(b['in'])}"
json.dump({"fps": 30, "width": 1920, "height": 1080, "narration": NARRATION, "tail": TAIL, "shots": shots, "labels": sorted(labels, key=lambda l: l["at"]), "beds": beds},
          open("src/deadisland/data/timeline.json", "w"), ensure_ascii=False, indent=1)
print(len(shots), "shots,", len(labels), "labels,", len(beds), "beds; last shot at", shots[-1]["at"] if shots else None)
