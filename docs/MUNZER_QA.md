# Münzer documentary: QA record

What was checked on `MunzerDocumentary`, how, and with what result. All
checks ran in the 4-core Linux cloud container the film was built in
(Remotion 4.0.526, Chrome Headless Shell, `--gl=angle`).

How the material was reviewed: I cannot watch video or listen to audio.
Every picture check below was done on rendered frames; every sound check was
done numerically. A person should watch the film once end to end for pacing.

## 1. Static checks

| Check | Result |
| --- | --- |
| `npx tsc` | Passes. |
| `npx eslint src/munzer` | Passes. |
| `node tools/munzer-ledger.mjs` | 173 shots, 1053.03 s, 0 problems: no two shots or stills share source time, no range runs past the end of its clip, every insert's sound matches its picture, every scene name resolves. |
| Determinism | No `Math.random`, no network fetches at render time; variation comes from the seeded `hash()` and `noise()` in `engine/time.ts`. |

## 2. Picture

Three still passes, each reviewed as contact sheets:

1. One frame at the middle of every shot (173 frames, quarter size).
2. 66 frames at the narration beats the graphics are keyed to (half size):
   each number, label and organ change checked against the word it lands on.
3. A re-check of every frame changed by passes 1 and 2.

Found and fixed:

- Uploader watermarks and the 1995 network bug in the corners of several
  clips: each clip now has a safe rectangle (`media.ts`) the framing cannot
  leave.
- An "Arnold's Angle" caption box and an ESPN lower third left in frame:
  tighter framing on both shots.
- Two shots that landed on a dissolve in the source (1994 at 15 s and
  120 s): replaced.
- Three shots of the same 1994 set (the Weider box) in a row near the end:
  two replaced.
- Hebrew bidi: number ranges and approximate values ("300–350", "~300",
  "~2.9", "~4", "1990–1996") rendered reversed inside right-to-left lines.
  Wrapped in left-to-right isolates. "×2" replaced by "פי 2", the
  narration's own wording.
- Two kidneys drawn on top of each other; the fat layer's drawing poking out
  of its block; a scale that read "0 g" before it counted; maps too dark to
  read; a flat Alpine scene and an unconvincing corridor: redrawn.
- X-ray organ glows that did not line up with the body on two shots:
  removed there, kept on the one where they sit on the torso.

## 3. Sound

The soundtrack was rendered alone (`--codec=wav`) and compared with the
narration MP3 by cross-correlation (8 kHz mono), two 3-second probes in
each of the six narration pieces:

| Measure | Result |
| --- | --- |
| Film length | 1053.033 s, as the composition |
| Narration placement | +25.0 ms in all 12 probes (correlation 0.980–0.993). The constant 25 ms is the MP3's own start offset; there is no drift and no misplaced piece. |
| Narration loudness (source) | −19.9 LUFS |
| Inserts, raw | I1 −13.7, I4 −9.8, I5 −12.4 LUFS: too loud against the voice. Gains set in `timeline.ts` (0.43, 0.28, 0.37) to about −21 LUFS. |
| Delivered mix | −14.0 LUFS integrated, true peak −1.5 dBTP, LRA 3.8 LU (ffmpeg `loudnorm`, two-pass, linear). |

The delivered soundtrack was made from the rendered WAV by applying the
three insert gains to the insert windows (where nothing else plays, so the
result is identical to rendering with the new gains) and then normalising.

## 4. Render

See section 5 once the delivery render is complete.
