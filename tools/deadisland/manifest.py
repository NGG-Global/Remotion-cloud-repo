"""Write docs/deadisland/SOURCES.md and docs/deadisland/TIMELINE.md from the data files.
Usage: python3 tools/deadisland/manifest.py"""
import glob, json, os, subprocess
SRC = json.load(open("src/deadisland/data/sources.json")); TL = json.load(open("src/deadisland/data/timeline.json"))
S = TL["shots"]; END = TL["narration"] + TL["tail"]
use, secs = {}, {}
for k, s in enumerate(S):
    d = (S[k + 1]["at"] if k + 1 < len(S) else END) - s["at"]
    use[s["src"]] = use.get(s["src"], 0) + 1; secs[s["src"]] = secs.get(s["src"], 0) + d
def probe(i):
    m = [p for p in glob.glob(f"media/deadisland/raw/{i}.*")]
    if not m: return "", ""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", m[0]], capture_output=True, text=True).stdout.strip().split("\n")[0]
    return os.path.basename(m[0]), r.replace(",", "x")
out = ["# Dead Island documentary: source manifest", "",
       "Every source video considered for the cut. `Shots` and `Seconds` say how much of each is in the film; sources with 0 shots were",
       "downloaded and reviewed but not used. Files were fetched over plain HTTPS from the Steam store CDN, the Internet Archive and",
       "Dailymotion (no login, DRM or bot-check was bypassed; YouTube refused this machine and was not used). Local copies live in",
       "`media/deadisland/raw/` and are not committed.", "",
       "Rights: the producer has stated that usage rights for footage and archival material are arranged. The `Holder / origin` column records",
       "who made or published each item so that coverage can be checked item by item. Items marked **check** are third-party recordings",
       "(press outlets, players, streamers) rather than publisher-issued material.", "",
       "| Id | Title | Era | Kind | Holder / origin | Source page | Local file | Size | Shots | Seconds | Coverage |", "|---|---|---|---|---|---|---|---|---|---|---|"]
tot = 0
for s in sorted(SRC, key=lambda s: -secs.get(s["id"], 0)):
    f, wh = probe(s["id"]); n = use.get(s["id"], 0); sec = secs.get(s["id"], 0); tot += sec
    official = any(k in s["rights"] for k in ("Steam store", "official", "Deep Silver /", "Techland", "GDC"))
    cov = "publisher/official" if official and "recording" not in s["rights"] else "**check**"
    out.append(f"| `{s['id']}` | {s['title']} | {s['era']} | {s['kind']} | {s['rights']} | {s['page']} | `{f}` | {wh} | {n} | {sec:.0f} | {cov} |")
missing = sorted(set(use) - {s["id"] for s in SRC})
assert not missing, missing
open("docs/deadisland/SOURCES.md", "w").write("\n".join(out) + "\n")
def tc(t): return f"{int(t // 60):02d}:{t % 60:05.2f}"
ch = {}
for k, s in enumerate(S):
    d = (S[k + 1]["at"] if k + 1 < len(S) else END) - s["at"]
    ch.setdefault(s["chapter"], []).append((s, d))
o = ["# Dead Island documentary: editing timeline", "", f"{len(S)} shots over {tc(END)}. Times are on the narration clock. The machine-readable version is",
     "`src/deadisland/data/timeline.json` (compiled from `tools/deadisland/edit/*.edl`); the per-shot source in/out points are also in",
     "`docs/deadisland/footage-registry.csv`.", ""]
for name, items in ch.items():
    o += [f"## {name} ({tc(items[0][0]['at'])}–{tc(items[-1][0]['at'] + items[-1][1])})", "", "| At | Length | Source | Source in | Speed | Transition | Shows |", "|---|---|---|---|---|---|---|"]
    for s, d in items:
        o.append(f"| {tc(s['at'])} | {d:.1f}s | `{s['src']}` | {s['in']:.2f} | {s.get('speed', 1)} | {s.get('transition', 'cut')} | {s['subject']}{' (callback)' if s.get('reuse') and 'callback' not in s['subject'] else ''} |")
    o.append("")
o += ["## On-screen labels", "", "| At | Length | Line | Second line |", "|---|---|---|---|"] + [f"| {tc(l['at'])} | {l['dur']}s | {l['line']} | {l.get('sub', '')} |" for l in TL["labels"]]
open("docs/deadisland/TIMELINE.md", "w").write("\n".join(o) + "\n")
print(f"{len(SRC)} sources, {sum(1 for s in SRC if use.get(s['id']))} used, {tot:.0f}s")
