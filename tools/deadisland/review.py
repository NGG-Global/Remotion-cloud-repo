"""Review sheets of the cut: for every shot, its first and last displayed frame, stamped with the shot number and
timeline time. Writes media/deadisland/review/NN.jpg (24 shots per sheet). Usage: review.py [from_shot to_shot]"""
import json, os, subprocess, sys
TL = json.load(open("src/deadisland/data/timeline.json")); S = TL["shots"]; OUT = "media/deadisland/review"
os.makedirs(OUT, exist_ok=True)
a = int(sys.argv[1]) if len(sys.argv) > 1 else 1; b = int(sys.argv[2]) if len(sys.argv) > 2 else len(S)
tiles = []
for k in range(a - 1, b):
    s = S[k]; end = S[k + 1]["at"] if k + 1 < len(S) else TL["narration"] + TL["tail"]; d = end - s["at"]
    clip = f"public/deadisland/clips/{s['id']}.mp4"
    for tag, t in (("A", 0.15), ("B", max(0.15, d - 0.15))):
        o = f"{OUT}/.t_{k}_{tag}.jpg"
        lab = f"{k + 1}{tag} {int(s['at'] // 60)}\\:{s['at'] % 60:04.1f} {d:.1f}s"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", clip, "-frames:v", "1", "-vf",
                        f"scale=320:180,drawtext=text='{lab}':x=4:y=4:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.65", "-q:v", "4", o])
        if os.path.exists(o): tiles.append(o)
        else: print("MISSING FRAME", s["id"], tag)
PER = 48
for n in range(0, len(tiles), PER):
    grp = tiles[n:n + PER]; ins = sum([["-i", t] for t in grp], [])
    out = f"{OUT}/{a + n // 2:03d}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", f"concat=n={len(grp)}:v=1:a=0,tile=6x8:padding=2", "-frames:v", "1", "-q:v", "4", out])
    print(out)
for t in tiles: os.remove(t)
