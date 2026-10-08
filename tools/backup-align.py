"""
Word timings for the backup video, measured from the audio.

Two passes:

1. A Whisper transcript with word timestamps (any tool that writes the JSON
   shape below) places every card roughly. Whisper is good inside running
   speech but pulls the first word after a pause early by up to half a
   second, which is visible when a word is meant to land on the voice.
2. Each card is then force-aligned on its own stretch of audio with the
   multilingual MMS aligner from torchaudio, on uroman romanisation of the
   card text. That gives each word a start and end to the 20 ms frame.

Usage (Python 3.11+, in a virtualenv):
    pip install torch==2.8.0 torchaudio==2.8.0 \
        --index-url https://download.pytorch.org/whl/cpu
    pip install uroman numpy
    python tools/backup-align.py <audio 16k mono wav> <whisper.json>

whisper.json: [{"words": [{"w": str, "s": float, "e": float}, ...]}, ...]

Writes src/backup/data/timing.ts. Everything runs locally; the first run
downloads the MMS aligner weights (about 1.2 GB) from the PyTorch hub.
"""

import difflib
import json
import re
import subprocess
import sys
import wave

import numpy as np
import torch
import torchaudio
import uroman

AUDIO, WHISPER = sys.argv[1], sys.argv[2]
OUT = "src/backup/data/timing.ts"

# How tokens that are not plain Hebrew words are said in the narration.
SPOKEN = {
    "15": "חמש עשרה",
    "25": "עשרים וחמש",
    "35": "שלושים וחמש",
    "24": "עשרים וארבע",
    "18": "שמונה עשרה",
    "4": "ארבע",
    "10": "עשר",
    "146": "מאה ארבעים ושש",
    "30": "שלושים",
    "40": "ארבעים",
    "ה40": "הארבעים",
    "20": "עשרים",
    "22": "עשרים ושתיים",
    "36": "שלושים ושש",
    "70": "שבעים",
    "24000": "עשרים וארבעה אלף",
    "ב2005": "באלפיים וחמש",
    "AI": "ei ai",
    "MSN": "em es en",
}


def bare(token: str) -> str:
    return re.sub(r"[^\w]", "", token.replace("־", "").replace(",", ""))


def spoken(token: str) -> str:
    b = bare(token)
    return SPOKEN.get(b, b)


ur = uroman.Uroman()


def romanise(text: str) -> list[str]:
    words = []
    for w in text.split():
        r = w if re.fullmatch(r"[a-z]+", w) else ur.romanize_string(w)
        r = re.sub(r"[^a-z']", "", r.lower())
        if r:
            words.append(r)
    return words


def norm(token: str) -> str:
    """Spelling-tolerant key for matching the script against Whisper."""
    s = spoken(token)
    return s.replace("ך", "כ").replace("ם", "מ").replace("ן", "נ").replace("ף", "פ").replace("ץ", "צ")


# ---- inputs ---------------------------------------------------------------
cards = json.loads(
    subprocess.run(
        ["node", "tools/backup-words.mjs"], capture_output=True, text=True, check=True
    ).stdout
)
whisper = [w for seg in json.load(open(WHISPER)) for w in seg["words"]]

with wave.open(AUDIO) as f:
    assert f.getframerate() == 16000 and f.getnchannels() == 1
    audio = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
SR = 16000

# ---- pass 1: place each script word on the Whisper timeline ---------------
script = [(c["id"], i, w) for c in cards for i, w in enumerate(c["words"])]
a = [norm(w) for _, _, w in script]
b = [norm(w["w"]) for w in whisper]
approx: list[tuple[float, float] | None] = [None] * len(script)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            approx[i1 + k] = (whisper[j1 + k]["s"], whisper[j1 + k]["e"])
    elif tag == "replace":
        s, e = whisper[j1]["s"], whisper[j2 - 1]["e"]
        n = i2 - i1
        for k in range(n):
            approx[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
# Fill any script word Whisper missed from its neighbours.
for k in range(len(approx)):
    if approx[k] is None:
        prev = next((approx[j] for j in range(k - 1, -1, -1) if approx[j]), (0.0, 0.0))
        nxt = next((approx[j] for j in range(k + 1, len(approx)) if approx[j]), prev)
        approx[k] = (prev[1], max(prev[1], nxt[0]))
        print(f"  unmatched: {script[k][0]} #{script[k][1]} {script[k][2]}")

# ---- pass 2: force-align each card on its own stretch ----------------------
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=True)
tokenizer = bundle.get_tokenizer()
aligner = bundle.get_aligner()

timing: dict[str, list[list[float]]] = {}
cursor = 0
last_end = 0.0
worst = []
for card in cards:
    n = len(card["words"])
    spans = approx[cursor : cursor + n]
    # The previous card's measured end is a hard floor: words never overlap.
    prev_end = last_end if cursor > 0 else 0.0
    # A little either side, never far into a neighbouring card.
    w0 = max(prev_end, spans[0][0] - 0.6)
    w1 = min(len(audio) / SR, spans[-1][1] + 0.6)
    chunk = torch.from_numpy(audio[int(w0 * SR) : int(w1 * SR)]).unsqueeze(0)

    pieces = [romanise(spoken(w)) for w in card["words"]]
    flat = [p for ps in pieces for p in ps]
    # The window opens where the previous card ended, so only its tail can
    # hold someone else's words: "*" absorbs them there.
    result = None
    try:
        with torch.inference_mode():
            emission, _ = model(chunk)
        token_spans = aligner(emission[0], tokenizer([*flat, "*"]))[:-1]
        ratio = chunk.shape[1] / emission.shape[1] / SR
        result = []
        k = 0
        for ps in pieces:
            group = token_spans[k : k + len(ps)]
            k += len(ps)
            s = w0 + group[0][0].start * ratio
            e = w0 + group[-1][-1].end * ratio
            result.append([round(s, 3), round(e, 3)])
    except Exception as exc:  # noqa: BLE001 - fall back to Whisper, and say so
        print(f"  {card['id']}: aligner failed ({exc}); keeping Whisper timings")

    if result is None:
        result = [[round(s, 3), round(e, 3)] for s, e in spans]
    else:
        for (s, _), (ws, _) in zip(result, spans):
            worst.append((abs(s - ws), card["id"]))
    timing[card["id"]] = result
    last_end = result[-1][1]
    cursor += n

worst.sort(reverse=True)
print("largest shifts from Whisper:", [(round(d, 2), c) for d, c in worst[:12]])

ts = (
    "/**\n"
    " * Start and end of every spoken word, in seconds, keyed by card id.\n"
    " * Generated by tools/backup-align.py from the narration; do not edit by\n"
    " * hand. Re-run the tool after changing a card's text.\n"
    " */\n\n"
    "export const TIMING: Record<string, ReadonlyArray<readonly [number, number]>> = "
    + json.dumps(timing, separators=(",", ":"))
    + ";\n"
)
open(OUT, "w").write(ts)
print(f"wrote {OUT}: {len(timing)} cards, {sum(len(v) for v in timing.values())} words")
