"""
Slow a narration track so a fast read sounds natural, and remap its word
timings to the new track.

Two things make a fast read feel rushed: the syllable rate, and the missing
breath between sentences. Stretching uniformly fixes only the first and makes
the voice sound drawn out long before the pauses feel right. So this does both,
gently:

1. Time-stretch the whole track with Rubber Band (pitch and formants kept), by
   --tempo (0.92 = 8% slower).
2. Lengthen the pauses that already exist after sentences (and, less, after
   commas) by inserting silence in the middle of each pause. Nothing is
   inserted mid-word, and a pause is only lengthened where its level is
   already near-silent, so no room tone is chopped.
3. Normalise loudness (EBU R128) to --loudness LUFS with a -1.5 dBTP ceiling,
   so the voice holds up on a phone speaker. This changes level only, never
   timing.

Word timings come in as JSON (whisper output, seconds on the original track)
and go out mapped onto the new track.

Usage:
  python3 tools/slow-narration.py <in.mp3> <words.json> <out.mp3> <out-words.json>
      [--tempo 0.92] [--sentence-gap 0.22] [--clause-gap 0.08] [--loudness -16]
"""

import argparse
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 44100


def run(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read_wav(path):
    with wave.open(str(path), "rb") as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return data.astype(np.float32) / 32768.0


def write_wav(path, samples):
    clipped = np.clip(samples, -1.0, 1.0)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((clipped * 32767).astype(np.int16).tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("words")
    ap.add_argument("out")
    ap.add_argument("out_words")
    ap.add_argument("--tempo", type=float, default=0.92)
    ap.add_argument("--sentence-gap", type=float, default=0.22)
    ap.add_argument("--clause-gap", type=float, default=0.08)
    ap.add_argument("--loudness", type=float, default=-16.0)
    args = ap.parse_args()

    words = json.loads(Path(args.words).read_text())
    tempo = args.tempo

    with tempfile.TemporaryDirectory() as tmp:
        stretched = Path(tmp) / "stretched.wav"
        run([
            "ffmpeg", "-y", "-i", args.src, "-ac", "1", "-ar", str(SR),
            "-af",
            f"rubberband=tempo={tempo}:transients=mixed:detector=soft:"
            "window=standard:formant=preserved:pitchq=quality",
            "-c:a", "pcm_s16le", str(stretched),
        ])
        audio = read_wav(stretched)

        # Candidate insertion points, in stretched time.
        inserts = []
        for i, word in enumerate(words[:-1]):
            nxt = words[i + 1]
            gap = nxt["start"] - word["end"]
            text = word["text"]
            if text.endswith((".", "?", "!")) and gap >= 0.12:
                extra = args.sentence_gap
            elif text.endswith((",", ";", ":", "—")) and gap >= 0.08:
                extra = args.clause_gap
            else:
                continue
            if extra <= 0:
                continue
            a = word["end"] / tempo
            b = nxt["start"] / tempo
            mid = (a + b) / 2
            # Find the quietest 30 ms inside the pause and cut there.
            lo, hi = int(a * SR), int(b * SR)
            win = int(0.03 * SR)
            if hi - lo < win * 2:
                continue
            seg = audio[lo:hi]
            energy = np.convolve(seg ** 2, np.ones(win) / win, mode="valid")
            k = int(np.argmin(energy))
            level_db = 10 * np.log10(energy[k] + 1e-12)
            if level_db > -45:
                continue
            cut = lo + k + win // 2
            inserts.append((cut, extra, mid))

        pieces = []
        last = 0
        fade = int(0.008 * SR)
        offsets = []  # (stretched-time seconds of cut, cumulative extra after it)
        total = 0.0
        for cut, extra, _ in inserts:
            chunk = audio[last:cut].copy()
            if len(chunk) > fade:
                chunk[-fade:] *= np.linspace(1, 0, fade)
            if pieces and len(chunk) > fade:
                chunk[:fade] *= np.linspace(0, 1, fade)
            pieces.append(chunk)
            pieces.append(np.zeros(int(extra * SR), dtype=np.float32))
            total += extra
            offsets.append((cut / SR, total))
            last = cut
        tail = audio[last:].copy()
        if pieces and len(tail) > fade:
            tail[:fade] *= np.linspace(0, 1, fade)
        pieces.append(tail)
        result = np.concatenate(pieces)

        out_wav = Path(tmp) / "out.wav"
        write_wav(out_wav, result)
        run([
            "ffmpeg", "-y", "-i", str(out_wav),
            "-af", f"loudnorm=I={args.loudness}:TP=-1.5:LRA=11",
            "-ar", str(SR), "-ac", "1", "-c:a", "libmp3lame",
            "-b:a", "128k", args.out,
        ])

    def remap(t):
        s = t / tempo
        shift = 0.0
        for at, cumulative in offsets:
            if s >= at:
                shift = cumulative
            else:
                break
        return round(s + shift, 3)

    mapped = [
        {"text": w["text"], "start": remap(w["start"]), "end": remap(w["end"])}
        for w in words
    ]
    Path(args.out_words).write_text(json.dumps(mapped, indent=1))

    src_dur = len(audio) / SR * tempo
    print(
        f"tempo {tempo}: {src_dur:.1f}s -> {len(result) / SR:.1f}s, "
        f"{len(offsets)} pauses lengthened (+{total:.1f}s)"
    )


if __name__ == "__main__":
    main()
