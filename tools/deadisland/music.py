"""Original score bed for the Dead Island documentary, synthesised here (no third-party recordings).

A restrained ambient bed: slow minor-key pads, a low drone, and sparse soft piano-like tones in the
reflective passages. Moods follow the chapters in MOODS (seconds on the narration clock). The bed is
mixed low and is ducked further under speech by the level set in the composition.

Usage: python3 tools/deadisland/music.py <duration_seconds> <out.m4a>
"""
import subprocess, sys
import numpy as np
SR = 48000
rng = np.random.default_rng(2011)

def note(n): return 440.0 * 2 ** ((n - 69) / 12)

# (start_second, mood)
MOODS = [(0, "calm"), (19, "dread"), (55, "investigate"), (127, "piano"), (272, "investigate"), (316, "calm"), (412, "dread"),
         (518, "investigate"), (591, "dread"), (697, "investigate"), (860, "dread"), (1100, "investigate"), (1250, "calm"),
         (1400, "dread"), (1560, "piano")]
if len(sys.argv) > 3:
    import json
    MOODS = [tuple(m) for m in json.load(open(sys.argv[3]))]

# Chord sets (MIDI notes), all around D minor so that mood changes cross-fade without clashing.
CHORDS = {
    "calm":        [[50, 57, 62, 65, 69], [48, 55, 60, 64, 67], [46, 53, 58, 62, 65], [45, 52, 57, 60, 64]],
    "dread":       [[38, 45, 50, 53], [37, 44, 49, 53], [38, 45, 51, 53], [36, 43, 48, 51]],
    "investigate": [[50, 57, 60, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 60]],
    "piano":       [[50, 57, 62, 65], [46, 53, 58, 65], [41, 48, 57, 60], [45, 52, 57, 61]],
}
LEVEL = {"calm": 0.8, "dread": 1.0, "investigate": 0.75, "piano": 0.7}
BAR = 16.0  # seconds per chord

def pad(freqs, dur, bright):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros((2, t.size))
    for f in freqs:
        for det, pan in ((-0.35, 0.25), (0.0, 0.5), (0.4, 0.75)):
            ff = f * 2 ** (det / 100 / 12 * 12 / 12)
            ph = rng.uniform(0, 2 * np.pi)
            lfo = 1 + 0.15 * np.sin(2 * np.pi * rng.uniform(0.05, 0.13) * t + ph)
            sig = np.sin(2 * np.pi * ff * t + ph) + bright * 0.35 * np.sin(2 * np.pi * 2 * ff * t + ph * 1.7) + bright * 0.12 * np.sin(2 * np.pi * 3 * ff * t)
            sig *= lfo / (1 + f / 220)
            out[0] += sig * (1 - pan); out[1] += sig * pan
    env = np.minimum(1, np.minimum(t / 5.0, (dur - t) / 5.0))
    return out * np.sin(np.clip(env, 0, 1) * np.pi / 2) ** 2

def piano(f, dur=7.0):
    t = np.arange(int(dur * SR)) / SR
    sig = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (0.7 + 0.5 * h)) for h, a in ((1, 1.0), (2, 0.35), (3, 0.12), (4, 0.05)))
    return sig * np.minimum(1, t / 0.012)

def render(total):
    n = int(total * SR)
    mix = np.zeros((2, n + SR * 30))
    bounds = MOODS + [(total, None)]
    for k, (start, mood) in enumerate(MOODS):
        end = bounds[k + 1][0]
        if start >= total: break
        t, c = start, 0
        while t < end:
            chord = CHORDS[mood][c % 4]
            seg = pad([note(m) for m in chord], BAR + 5.0, 0.5 if mood != "dread" else 0.15) * LEVEL[mood] * 0.05
            i = int(t * SR); mix[:, i:i + seg.shape[1]] += seg
            if mood == "dread":   # slow sub pulse
                tt = np.arange(int(BAR * SR)) / SR
                sub = np.sin(2 * np.pi * note(chord[0] - 12) * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 8 - np.pi / 2)) * 0.05
                mix[:, i:i + sub.size] += sub
            if mood in ("piano", "calm"):
                beats = [0, 4, 6, 10] if mood == "piano" else [2, 10]
                for b in beats:
                    m = rng.choice(chord[1:]) + 12
                    p = piano(note(m)) * (0.085 if mood == "piano" else 0.05) * rng.uniform(0.7, 1.0)
                    j = int((t + b + rng.uniform(-0.05, 0.05)) * SR); pan = rng.uniform(0.35, 0.65)
                    mix[0, j:j + p.size] += p * (1 - pan); mix[1, j:j + p.size] += p * pan
            t += BAR; c += 1
    mix = mix[:, :n]
    # Simple diffuse tail: a few long feedback-free delays.
    wet = np.zeros_like(mix)
    for d, g in ((0.19, 0.35), (0.37, 0.28), (0.61, 0.2), (0.97, 0.14)):
        k = int(d * SR); wet[:, k:] += mix[:, :-k][::-1 if int(d * 100) % 2 else 1] * g
    mix = mix + wet
    fade = int(4 * SR); mix[:, :fade] *= np.linspace(0, 1, fade); mix[:, -fade:] *= np.linspace(1, 0, fade)
    return mix / max(1e-9, np.abs(mix).max()) * 0.5

if __name__ == "__main__":
    total, out = float(sys.argv[1]), sys.argv[2]
    pcm = (render(total).T * 32767).astype("<i2").tobytes()
    # Gentle low-pass keeps the bed out of the speech band's upper range.
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "lowpass=f=3200,highpass=f=35,loudnorm=I=-30:TP=-6:LRA=7",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out], input=pcm, check=True)
    print("wrote", out)
