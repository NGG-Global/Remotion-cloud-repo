"""Print a shot log compactly: python3 tools/deadisland/showlog.py <group> [source id ...] [--minq N]"""
import json, sys
a = [x for x in sys.argv[2:] if not x.startswith("--")]
minq = int(sys.argv[sys.argv.index("--minq") + 1]) if "--minq" in sys.argv else 0
a = [x for x in a if not x.isdigit()]
for s in json.load(open(f".cache/di/shotlogs/{sys.argv[1]}.json"))["sources"]:
    if a and s["id"] not in a: continue
    print(f"## {s['id']} [{s.get('resolution')}, q{s.get('overall_quality')}] {s.get('summary','')[:400]}")
    for g in s["segments"]:
        if g.get("quality", 5) < minq: continue
        ov = "" if str(g.get("overlay", "none")).lower() in ("none", "") else f" OV:{str(g['overlay'])[:50]}"
        cr = f" crop{g['crop']}" if g.get("crop") else ""
        print(f"{g['in']:.1f}-{g['out']:.1f} q{g.get('quality','?')}{' H' if g.get('hud') else ''} {g['desc'][:170]}{ov}{cr}")
