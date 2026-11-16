"""Scan the displayed part of every clip for black passages and frozen picture.
Usage: python3 tools/deadisland/qa_clips.py"""
import json, re, subprocess
from concurrent.futures import ThreadPoolExecutor
TL = json.load(open("src/deadisland/data/timeline.json")); S = TL["shots"]
def scan(k):
    s = S[k]; end = S[k + 1]["at"] if k + 1 < len(S) else TL["narration"] + TL["tail"]; d = end - s["at"]
    r = subprocess.run(["ffmpeg", "-hide_banner", "-t", f"{d:.2f}", "-i", f"public/deadisland/clips/{s['id']}.mp4", "-vf",
                        "blackdetect=d=0.12:pix_th=0.08,freezedetect=n=0.001:d=1.2", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    out = []
    for m in re.finditer(r"black_start:([\d.]+) black_end:([\d.]+)", r): out.append(f"black {m.group(1)}-{m.group(2)}")
    for m in re.finditer(r"freeze_start: ([\d.]+)", r):
        if not s.get("freeze"): out.append(f"freeze from {m.group(1)}")
    return k, s, d, out
with ThreadPoolExecutor(4) as ex:
    n = 0
    for k, s, d, out in ex.map(scan, range(len(S))):
        if out: n += 1; print(f"#{k + 1} at {s['at']} ({d:.1f}s) {s['src']} in {s['in']}: {'; '.join(out)} | {s['subject'][:50]}")
print(n, "clips flagged")
