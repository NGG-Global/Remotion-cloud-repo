#!/usr/bin/env python3
"""
Builds the English subtitles of ComfortZoneEN from the narration itself.

The film's voice-over is in English; only the burned-in subtitles were
Hebrew. So the cues are the spoken words, timed from the audio:

  transcribe  Runs faster-whisper (large-v3, English, word timestamps) and
              Silero VAD on the master's audio and stores the results in
              src/comfort-zone/data/narration.words.json and
              narration.speech.json. Only needed if the audio changes.
              Needs: pip install faster-whisper silero-vad
                     pip install torch --index-url https://download.pytorch.org/whl/cpu

  build       Reads the cue lines in src/comfort-zone/data/subtitle-lines.txt
              (one cue per line, worded as spoken), walks them along the
              transcript word by word, and writes subtitles.json with each
              cue's timing. No ML dependencies.

Usage:
  python3 tools/comfort-zone/retime.py transcribe public/video/comfort-zone-he.mp4
  python3 tools/comfort-zone/retime.py build
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "src", "comfort-zone", "data")
WORDS = os.path.join(DATA, "narration.words.json")
SPEECH = os.path.join(DATA, "narration.speech.json")
LINES = os.path.join(DATA, "subtitle-lines.txt")
OUT = os.path.join(DATA, "subtitles.json")

LEAD = 0.05  # cue appears this long before the first word
TAIL = 0.15  # and holds at least this long after the last one
HOLD = 0.6  # extra hold allowed when the next cue is far away
MIN_DUR = 0.8  # shortest cue, room permitting
GAP = 0.04  # never closer than this to the next cue
SNAP = 0.6  # how far a boundary in silence may move to the speech edge


def load_audio(path):
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "a.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-ac", "1", "-ar", "16000",
                        "-c:a", "pcm_s16le", wav], check=True)
        import numpy as np

        with wave.open(wav) as w:
            return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def transcribe(media):
    import torch
    from faster_whisper import WhisperModel
    from silero_vad import get_speech_timestamps, load_silero_vad

    x = load_audio(media)
    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(x, language="en", word_timestamps=True, beam_size=5, vad_filter=True,
                               vad_parameters={"min_silence_duration_ms": 200}, condition_on_previous_text=False)
    words = [{"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2), "p": round(w.probability, 2)}
             for s in segs for w in s.words]
    with open(WORDS, "w") as f:
        json.dump(words, f, indent=0)
    speech = get_speech_timestamps(torch.from_numpy(x.copy()), load_silero_vad(), sampling_rate=16000,
                                   threshold=0.5, min_speech_duration_ms=150, min_silence_duration_ms=120,
                                   speech_pad_ms=30, return_seconds=True)
    with open(SPEECH, "w") as f:
        json.dump([[round(s["start"], 2), round(s["end"], 2)] for s in speech], f)
    print(f"{len(words)} words, {len(speech)} speech runs")


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


def build():
    words = json.load(open(WORDS))
    # whisper repeats the last word of a window at the start of the next one,
    # with near-zero confidence: drop those echoes.
    words = [w for i, w in enumerate(words)
             if not (i and w["p"] < 0.2 and norm(w["w"]) == norm(words[i - 1]["w"]))]
    speech = json.load(open(SPEECH))
    # whisper also lets a word swallow the pause after it ("is" running on
    # into the silence before "me"): clip each word to the speech inside it.
    for w in words:
        pieces = [(max(a, w["start"]), min(b, w["end"])) for a, b in speech if b > w["start"] and a < w["end"]]
        if pieces and w["end"] - w["start"] > 0.4:
            w["start"], w["end"] = pieces[0][0], pieces[-1][1]
    lines = [l.strip() for l in open(LINES, encoding="utf-8") if l.strip() and not l.startswith("#")]

    def in_speech(t):
        return any(a <= t <= b for a, b in speech)

    cues, k = [], 0
    for line in lines:
        n = len(line.split())
        span = words[k:k + n]
        if len(span) < n:
            sys.exit(f"ran out of transcript words at: {line}")
        said = " ".join(w["w"] for w in span)
        same = sum(norm(a) == norm(b["w"]) for a, b in zip(line.split(), span))
        if same < max(1, n - 2):
            sys.exit(f"line does not match the speech:\n  line:   {line}\n  speech: {said}")
        t0, t1 = span[0]["start"], span[-1]["end"]
        # Word edges that fall in silence move to the edge of the speech.
        if not in_speech(t0):
            nxt = [a for a, _ in speech if t0 < a <= t0 + SNAP]
            t0 = nxt[0] if nxt else t0
        if not in_speech(t1):
            prv = [b for _, b in speech if t1 - SNAP <= b < t1]
            t1 = prv[-1] if prv else t1
        cues.append({"from": t0 - LEAD, "to": t1 + TAIL, "voice_end": t1, "en": line,
                     "said": said if same < n else None})
        k += n
    if k != len(words):
        sys.exit(f"{len(words) - k} transcript words left over after the last line")

    for i, c in enumerate(cues):
        nxt = cues[i + 1]["from"] if i + 1 < len(cues) else c["to"] + 2
        c["to"] = min(max(c["to"], c["from"] + MIN_DUR, c["voice_end"] + HOLD), nxt - GAP)
        c["to"] = max(c["to"], c["voice_end"] + 0.05) if c["voice_end"] + 0.05 < nxt else c["to"]
    out = [{"from": round(c["from"], 2), "to": round(c["to"], 2), "en": c["en"]} for c in cues]
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    for c in cues:
        note = f"   (heard: {c['said']})" if c["said"] else ""
        print(f"{c['from']:7.2f} {c['to']:7.2f}  {c['en']}{note}")
    print(f"wrote {len(out)} cues to {os.path.relpath(OUT)}")


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "transcribe":
        transcribe(sys.argv[2])
    elif len(sys.argv) == 2 and sys.argv[1] == "build":
        build()
    else:
        sys.exit(__doc__)
