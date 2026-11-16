"""Conform every shot of the timeline to public/deadisland/clips/<id>.mp4 (1920x1080, 30 fps, H.264).

The composition only places clips; all trimming, cropping, scaling and speed changes happen here, with FFmpeg.
A clip is re-cut only when its parameters change (hash stored beside it). Also writes the footage usage registry.

Usage: python3 tools/deadisland/cut.py [--check]
"""
import csv, glob, hashlib, json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
RAW, OUT = "media/deadisland/raw", "public/deadisland/clips"
TL = json.load(open("src/deadisland/data/timeline.json"))
SRC = {s["id"]: s for s in json.load(open("src/deadisland/data/sources.json"))}
W, H, FPS = TL["width"], TL["height"], TL["fps"]
END = TL["narration"] + TL["tail"]

def raw(i):
    m = [p for p in glob.glob(f"{RAW}/{i}.*") if ".part" not in p]
    if not m: raise SystemExit(f"missing source file for {i}")
    return m[0]

def plan():
    shots = TL["shots"]
    jobs = []
    for k, s in enumerate(shots):
        nxt = shots[k + 1] if k + 1 < len(shots) else None
        end = nxt["at"] if nxt else END
        overlap = nxt.get("transitionDur", 0.5) if nxt and nxt.get("transition") == "dissolve" else 0
        dur = end - s["at"] + overlap + 0.2          # 0.2 s safety handle
        jobs.append((s, round(dur, 3), end))
    return jobs

def cut(job):
    s, dur, _ = job
    out = f"{OUT}/{s['id']}.mp4"
    speed = s.get("speed", 1)
    key = hashlib.sha1(json.dumps([s["src"], s["in"], dur, speed, s.get("crop"), s.get("freeze"), s.get("nat", 0), W, H, FPS]).encode()).hexdigest()
    if os.path.exists(out) and os.path.exists(out + ".key") and open(out + ".key").read() == key:
        return s["id"], "kept"
    vf = []
    if s.get("crop"):
        x, y, w, h = s["crop"]
        vf.append(f"crop=iw*{w}:ih*{h}:iw*{x}:ih*{y}")
    if s.get("freeze"):
        vf.append(f"select=eq(n\\,0),loop=loop=-1:size=1,trim=duration={dur}")
    elif speed != 1:
        vf.append(f"setpts=PTS/{speed}")
    # Fit inside the frame without changing the aspect ratio; bars are black.
    vf += [f"scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos", f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:black", f"fps={FPS}", "setsar=1", "format=yuv420p"]
    nat = s.get("nat", 0) > 0 and speed == 1 and not s.get("freeze")
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(s["in"]), "-i", raw(s["src"]), "-t", str(dur), "-vf", ",".join(vf),
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "15", "-g", "15", "-movflags", "+faststart"]
    cmd += ["-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2"] if nat else ["-an"]
    r = subprocess.run(cmd + [out], capture_output=True, text=True)
    if r.returncode != 0: return s["id"], "FAILED " + r.stderr[-400:]
    got = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout or 0)
    if got < dur - 0.25: return s["id"], f"SHORT got {got:.2f}s need {dur:.2f}s (source ran out)"
    open(out + ".key", "w").write(key)
    return s["id"], "cut"

def registry(jobs):
    os.makedirs("docs/deadisland", exist_ok=True)
    count = {}
    for s, _, _ in jobs: count[s["src"]] = count.get(s["src"], 0) + 1
    with open("docs/deadisland/footage-registry.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["shot", "timeline_start", "timeline_end", "duration", "source_id", "source_file", "source_url", "source_in", "source_out", "speed", "subject", "chapter", "shots_from_this_source"])
        for s, dur, end in jobs:
            sp = s.get("speed", 1); d = end - s["at"]
            w.writerow([s["id"], f"{s['at']:.2f}", f"{end:.2f}", f"{d:.2f}", s["src"], os.path.basename(raw(s["src"])), SRC[s["src"]]["page"],
                        f"{s['in']:.2f}", f"{s['in'] + (0 if s.get('freeze') else d * sp):.2f}", sp, s["subject"], s["chapter"], count[s["src"]]])

def check(jobs):
    """Editorial sanity: order, minimum length, and overlapping reuse of the same source range."""
    bad = 0
    spans = {}
    for k, (s, dur, end) in enumerate(jobs):
        d = end - s["at"]
        if d <= 0: print("ORDER", s["id"]); bad += 1
        if d < 1.0: print("SHORT SHOT", s["id"], f"{d:.2f}s"); bad += 1
        a, b = s["in"], s["in"] + d * s.get("speed", 1)
        for (oa, ob, oid) in spans.get(s["src"], []):
            if a < ob and oa < b: print(f"REUSE {s['id']} overlaps {oid} in {s['src']} ({max(a,oa):.1f}-{min(b,ob):.1f})"); bad += 1
        spans.setdefault(s["src"], []).append((a, b, s["id"]))
    ids = [s["id"] for s, _, _ in jobs]
    if len(set(ids)) != len(ids): print("DUPLICATE IDS"); bad += 1
    print(f"{len(jobs)} shots, {bad} problems")
    return bad

if __name__ == "__main__":
    jobs = plan()
    bad = check(jobs)
    if "--check" in sys.argv: sys.exit(1 if bad else 0)
    os.makedirs(OUT, exist_ok=True)
    with ThreadPoolExecutor(3) as ex:
        for i, st in ex.map(cut, jobs):
            if st != "kept": print(i, st, flush=True)
    registry(jobs)
    keep = {s["id"] for s, _, _ in jobs}
    for p in glob.glob(f"{OUT}/*.mp4"):
        if os.path.splitext(os.path.basename(p))[0] not in keep:
            os.remove(p); os.path.exists(p + ".key") and os.remove(p + ".key")
