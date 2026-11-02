#!/usr/bin/env python3
"""
Re-times the Comfort Zone subtitle cues to the narration.

The cues in src/comfort-zone/data/subtitles.json were read off the burned-in
Hebrew subtitles, whose timing follows the picture edit and drifts a few
hundred milliseconds from the voice. This script moves every cue onto the
speech itself:

  1. Silero VAD finds the speech segments in the narration (it is robust to
     the music bed, which defeats energy thresholds; whisper.cpp large-v3
     hallucinates on this mix, so speech recognition is not used).
  2. Each speech segment is given to the cue it overlaps most. A cue that owns
     several segments spans all of them. Several cues sharing one unbroken
     run of speech keep their relative split and are stretched to the run.
  3. Cues start a hair before the voice and hold briefly after it, and never
     overlap the next cue.

Usage:
  python3 tools/comfort-zone/retime.py <narration.wav (16 kHz mono)> [--write]

Needs `pip install torch --index-url https://download.pytorch.org/whl/cpu`
and `pip install silero-vad`. Without --write it only prints the old and new
timings; with it the JSON is updated in place (the English text is kept).
"""
import argparse
import json
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CUES_PATH = os.path.join(HERE, "..", "..", "src", "comfort-zone", "data", "subtitles.json")

LEAD = 0.06  # seconds the cue appears before the voice
TAIL = 0.25  # seconds it holds after the voice
GAP = 0.05  # minimum gap between cues
MIN_DUR = 0.6
SEARCH = 0.6  # how far from the original window a segment may be claimed


def speech_segments(wav_path):
    import torch
    from silero_vad import get_speech_timestamps, load_silero_vad

    with wave.open(wav_path) as w:
        assert w.getframerate() == 16000 and w.getnchannels() == 1, "need 16 kHz mono"
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    model = load_silero_vad()
    segs = get_speech_timestamps(
        torch.from_numpy(x.copy()), model, sampling_rate=16000, threshold=0.5,
        min_speech_duration_ms=150, min_silence_duration_ms=120, speech_pad_ms=30, return_seconds=True,
    )
    return [(s["start"], s["end"]) for s in segs]


def overlap(a0, a1, b0, b1):
    return max(0.0, min(a1, b1) - max(a0, b0))


def retime(cues, segs):
    # 1. Which cues does each speech segment belong to? A cue claims a segment
    #    when the segment lies mostly inside the cue's window, or covers most
    #    of the cue. Several claimants share one unbroken run of speech and
    #    split it in proportion to their original timing.
    pieces = {}  # cue index -> [(t0, t1), ...]
    for s0, s1 in segs:
        seg_dur = s1 - s0
        cands = []
        for ci, c in enumerate(cues):
            ov = overlap(s0, s1, c["from"], c["to"])
            if ov >= 0.6 * seg_dur or ov >= 0.4 * (c["to"] - c["from"]):
                cands.append(ci)
        if not cands:
            continue  # a noise the VAD took for speech, between lines
        if len(cands) == 1:
            pieces.setdefault(cands[0], []).append((s0, s1))
            continue
        first, last = cues[cands[0]], cues[cands[-1]]
        span = last["to"] - first["from"]
        for ci in cands:
            c = cues[ci]
            t0 = s0 + (c["from"] - first["from"]) / span * seg_dur
            t1 = s0 + (c["to"] - first["from"]) / span * seg_dur
            pieces.setdefault(ci, []).append((t0, t1))

    # 2. Padding, ordering, no overlaps.
    out = []
    for ci, c in enumerate(cues):
        if ci not in pieces:
            out.append({**c, "note": "no speech found; kept"})
            continue
        t0 = min(p[0] for p in pieces[ci])
        t1 = max(p[1] for p in pieces[ci])
        out.append({**c, "from": t0 - LEAD, "to": max(t1 + TAIL, t0 + MIN_DUR)})
    for i in range(len(out) - 1):
        limit = out[i + 1]["from"] - GAP
        if out[i]["to"] > limit:
            out[i]["to"] = max(limit, out[i]["from"] + MIN_DUR)
    for o in out:
        o["from"], o["to"] = round(o["from"], 2), round(o["to"], 2)
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("wav")
    p.add_argument("--write", action="store_true")
    a = p.parse_args()

    cues = json.load(open(CUES_PATH, encoding="utf-8"))
    segs = speech_segments(a.wav)
    out = retime(cues, segs)
    for c, o in zip(cues, out):
        d0, d1 = o["from"] - c["from"], o["to"] - c["to"]
        flag = "   <-- " + o["note"] if "note" in o else ""
        print(f"{c['from']:7.2f}-{c['to']:7.2f} -> {o['from']:7.2f}-{o['to']:7.2f}  ({d0:+.2f} {d1:+.2f})  {c['he']}{flag}")
    if a.write:
        clean = [{k: o[k] for k in ("from", "to", "he", "en")} for o in out]
        with open(CUES_PATH, "w", encoding="utf-8") as f:
            json.dump(clean, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"wrote {CUES_PATH}")


if __name__ == "__main__":
    main()
