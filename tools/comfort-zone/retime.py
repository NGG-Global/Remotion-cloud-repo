#!/usr/bin/env python3
"""
Re-times the Comfort Zone subtitle cues to the narration.

The cues in src/comfort-zone/data/subtitles.json were read off the burned-in
Hebrew subtitles, whose timing follows the picture edit rather than the voice.
This script moves every cue onto the speech:

  1. The Hebrew cue text is aligned word by word with a whisper.cpp
     transcript of the narration (banded longest-common-subsequence, tolerant
     of prefix letters), which gives each cue a start and end measured from
     the transcript's sentence timings.
  2. Those boundaries are then snapped to the nearest speech onset / offset
     found in the audio energy envelope, since whisper's sentence timings are
     only accurate to a few hundred milliseconds.

Usage:
  python3 tools/comfort-zone/retime.py <narration.wav (16 kHz mono)> \
      <transcript.json> [--write]

Without --write it prints the old and new timings; with it the JSON is updated
in place (the English text is kept).
"""
import argparse
import json
import os
import re
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CUES_PATH = os.path.join(HERE, "..", "..", "src", "comfort-zone", "data", "subtitles.json")

HEB = re.compile(r"[^֐-׿\w\s]")


def words(s):
    s = HEB.sub(" ", s).replace("'", "").replace("׳", "").replace("״", "")
    return [w for w in s.lower().split() if w]


def similar(a, b):
    if a == b:
        return 1.0
    if len(a) >= 4 and len(b) >= 4 and (a.startswith(b) or b.startswith(a)):
        return 0.8
    if len(a) >= 3 and len(b) >= 3 and (a[1:] == b or b[1:] == a or a[1:] == b[1:]):
        return 0.6  # ו/ה/ב/ש prefix differs
    return 0.0


def align(cue_words, asr_words):
    """Banded LCS between the two word lists; returns (cue index -> asr index)."""
    n, m = len(cue_words), len(asr_words)
    band = max(80, abs(n - m) * 2 + 80)
    score = np.zeros((n + 1, m + 1), np.float32)
    back = np.zeros((n + 1, m + 1), np.int8)
    for i in range(1, n + 1):
        jc = round(i * m / n)
        for j in range(max(1, jc - band), min(m, jc + band) + 1):
            s = similar(cue_words[i - 1], asr_words[j - 1])
            best, d = score[i - 1, j], 1
            if score[i, j - 1] > best:
                best, d = score[i, j - 1], 2
            if s > 0 and score[i - 1, j - 1] + s > best:
                best, d = score[i - 1, j - 1] + s, 3
            score[i, j], back[i, j] = best, d
    pairs = {}
    i, j = n, m
    while i > 0 and j > 0:
        d = back[i, j]
        if d == 3:
            pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif d == 2:
            j -= 1
        else:
            i -= 1
    return pairs


def envelope(wav_path, hop=0.01):
    with wave.open(wav_path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    n = int(sr * hop)
    frames = len(x) // n
    e = np.sqrt((x[: frames * n].reshape(frames, n) ** 2).mean(1))
    # Smooth a little and express relative to the quiet floor.
    k = np.ones(5) / 5
    e = np.convolve(e, k, mode="same")
    floor = np.percentile(e, 20)
    return e / max(floor, 1e-5), hop


def snap(t, env, hop, want, window=0.35, thr=3.0):
    """Move t to the nearest speech onset ("start") or offset ("end") within the window."""
    i = int(round(t / hop))
    lo, hi = max(1, i - int(window / hop)), min(len(env) - 2, i + int(window / hop))
    loud = env > thr
    best, bestd = None, 1e9
    for k in range(lo, hi + 1):
        edge = (not loud[k - 1] and loud[k]) if want == "start" else (loud[k - 1] and not loud[k])
        if edge and abs(k - i) < bestd:
            best, bestd = k, abs(k - i)
    return t if best is None else best * hop


def main():
    p = argparse.ArgumentParser()
    p.add_argument("wav")
    p.add_argument("transcript")
    p.add_argument("--write", action="store_true")
    a = p.parse_args()

    cues = json.load(open(CUES_PATH, encoding="utf-8"))
    raw = json.load(open(a.transcript, encoding="utf-8"))
    segs = raw if isinstance(raw, list) else [
        {"from": s["offsets"]["from"] / 1000, "to": s["offsets"]["to"] / 1000, "text": s["text"]} for s in raw["transcription"]
    ]

    asr = []  # (word, start, end)
    for s in segs:
        ws = words(s["text"])
        if not ws:
            continue
        span = max(0.05, s["to"] - s["from"])
        total = sum(len(w) + 1 for w in ws)
        acc = 0.0
        for w in ws:
            t0 = s["from"] + span * acc / total
            t1 = s["from"] + span * (acc + len(w) + 1) / total
            asr.append((w, t0, t1))
            acc += len(w) + 1

    cue_words, owner = [], []
    for ci, c in enumerate(cues):
        for w in words(c["he"]):
            cue_words.append(w)
            owner.append(ci)
    pairs = align(cue_words, [w for w, _, _ in asr])

    env, hop = envelope(a.wav)
    out = []
    last_end = 0.0
    for ci, c in enumerate(cues):
        idx = [k for k in range(len(cue_words)) if owner[k] == ci]
        hits = [pairs[k] for k in idx if k in pairs]
        if not hits:
            out.append({**c, "note": "no match"})
            continue
        first, last = asr[min(hits)], asr[max(hits)]
        start = snap(first[1], env, hop, "start")
        end = snap(last[2], env, hop, "end")
        start = max(start - 0.08, last_end + 0.05)  # a touch early, never overlapping
        end = max(end + 0.25, start + 0.7)
        last_end = end
        out.append({**c, "from": round(start, 2), "to": round(end, 2), "matched": f"{len(hits)}/{len(idx)}"})

    for c, o in zip(cues, out):
        flag = "" if "note" not in o else "  <-- " + o["note"]
        print(f"{c['from']:7.2f}-{c['to']:7.2f} -> {o['from']:7.2f}-{o['to']:7.2f}  {o.get('matched', ''):6}  {c['he']}{flag}")

    if a.write:
        clean = [{k: v for k, v in o.items() if k in ("from", "to", "he", "en")} for o in out]
        json.dump(clean, open(CUES_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        with open(CUES_PATH, "a", encoding="utf-8") as f:
            f.write("\n")
        print(f"wrote {CUES_PATH}")


if __name__ == "__main__":
    main()
