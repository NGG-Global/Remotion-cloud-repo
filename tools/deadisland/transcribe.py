"""Hebrew transcription of the narration with word timestamps (faster-whisper, local CPU)."""
import json, sys, wave
import numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
model = WhisperModel("ivrit-ai/whisper-large-v3-turbo-ct2", device="cpu", compute_type="int8", cpu_threads=4)
w = wave.open(src); audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
segs, info = model.transcribe(audio, language="he", word_timestamps=True, vad_filter=True, beam_size=5)
res = []
for s in segs:
    res.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                "words": [{"s": round(w.start, 2), "e": round(w.end, 2), "w": w.word} for w in (s.words or [])]})
    print(f"[{s.start:7.2f} - {s.end:7.2f}] {s.text.strip()}", flush=True)
json.dump({"duration": info.duration, "segments": res}, open(out, "w"), ensure_ascii=False, indent=1)
