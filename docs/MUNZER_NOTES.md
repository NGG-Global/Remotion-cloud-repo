# Münzer documentary: production notes

The "מאחורי הסיוט" episode on Andreas Münzer: the user's Hebrew narration,
cut to archive footage, photographs and Remotion graphics.

| | |
| --- | --- |
| Composition ID | `MunzerDocumentary` |
| Narration | `public/munzer/narration.mp3` (the upload, unchanged; 17:05.8) |
| Transcript | `docs/MUNZER_TRANSCRIPT.md` |
| QA record | `docs/MUNZER_QA.md` |
| Archive sources | `public/munzer/SOURCES.md` |
| Format | 1920×1080, 30 fps |
| Length | 1053.0 s (17:33): the narration plus 27.2 s of inserts |

## Render

The film uses no WebGL, and software rendering is about twice as fast with
the `angle` backend than with the repo's default `swangle`:

```bash
npx remotion render MunzerDocumentary out/munzer.mp4 --gl=angle --crf=18
```

Sample-exact sound: Remotion's H.264/AAC output decodes about 43 ms late
(measured on the Gacy episode, `docs/VIDEO_QA.md`). For the delivered file
the picture and the sound are rendered separately and muxed with ffmpeg,
whose AAC encoder signals its priming:

```bash
npx remotion render MunzerDocumentary out/munzer-video.mp4 --gl=angle --crf=18 --muted
npx remotion render MunzerDocumentary out/munzer-audio.wav --codec=wav
# Loudness for YouTube: -14 LUFS, true peak -1.5 dBTP (measure first, then
# pass the measured values; see docs/MUNZER_QA.md for the numbers used).
ffmpeg -i out/munzer-audio.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
ffmpeg -i out/munzer-audio.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=...:measured_TP=...:measured_LRA=...:measured_thresh=...:offset=...:linear=true,aresample=48000" out/munzer-audio-final.wav
ffmpeg -i out/munzer-video.mp4 -i out/munzer-audio-final.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 192k -movflags +faststart out/munzer-final.mp4
```

Checks before rendering:

```bash
npx tsc                          # types
node tools/munzer-ledger.mjs     # no archive used twice, no range past a clip's end
node tools/munzer-ledger.mjs --list   # every source range, clip by clip
```

Stills for review (one per shot, quarter size):

```bash
node tools/munzer-ledger.mjs --mid      # writes out/munzer-mid-frames.txt
GL=angle node tools/stills.mjs MunzerDocumentary out/qa 0.25 $(cat out/munzer-mid-frames.txt)
```

Rebuild the derived assets: `tools/munzer-sfx.sh` (sound effects) and
`node tools/munzer-stills.mjs` (stills).

## How it is put together

**The narration is the clock.** Every time in the edit is a second of the
narration MP3. `src/munzer/engine/timeline.ts` lists the inserts, the only
places the voice pauses, and maps narration time to film time (`outT`), so
shots, labels and graphics placed by narration time cannot drift from the
voice. Inside a shot, `useShot()` gives `n`, the narration time being heard,
and every graphic keys its beats to the word that names them, for example
the heart's weight counting up on "636" at 45.6 s.

**Inserts** (each in a measured silence of the voice):

| Insert | At (narration s) | Length | What plays |
| --- | --- | --- | --- |
| I1 | 111.80 (silence 111.48–112.21) | 2.8 s | ESPN 1995: "Andreas Munzer, from Germany." |
| I2 | 138.95 (138.73–139.15) | 1.7 s | The 1996 stage, its own sound, before "אף אחד מהצופים" |
| TITLE | 156.40 (156.03–156.79) | 5.4 s | Series title |
| I4 | 221.10 (220.59–221.79) | 6.7 s | MC, Austria 1988: "...die große Hoffnung für die Zukunft, nach Arnold Schwarzenegger sicherlich das größte Talent Österreichs." |
| I5 | 299.30 (298.77–299.87) | 6.4 s | ESPN 1995: "There's no body fat there. I'm absolutely convinced he must have less than 6% body fat." |
| END | 1025.83 | 4.2 s | End card holds |

The three sound bites are subtitled in Hebrew. Their wording was checked
with Whisper large-v3 on the isolated passages. The 1995 commentator is not
named on screen: the broadcast does not identify him, so neither does the
film.

**The edit** is `src/munzer/data/edl.ts`: 173 shots, each with the narration
line it carries as a comment. Shot types: archive clip (`shots/Clip.tsx`:
framing inside the clip's safe rectangle, grade, slow motion, X-ray,
pulse and drain effects), photograph or still (`shots/Photo.tsx`: Ken Burns,
mounted on a blurred copy when the picture is too small to fill the frame,
or shown as a print), and drawn scene (`anim/`, by name through
`anim/index.ts`).

**No archive is used twice.** `tools/munzer-ledger.mjs` resolves every shot
exactly as the composition does and fails if two shots, or a shot and a
still, draw on overlapping source time. Current state: 0 overlaps. Footage
used: 66 s of a95, 86 s of o90, 62 s of a96, and smaller amounts of the
rest (`--list`).

**Graphics** (`src/munzer/anim/`): medical plates drawn as line art that
draws itself (heart, liver, kidneys, lungs, the body as a figure with its
organs), and story graphics (maps from Natural Earth outlines, dates, the
results board, the interview notebook and cassette, the weight chart, the
risk and fat diagrams, the drug ledger, the feedback loop, the wreath).

**On-screen type**: labels for names, places and dates only, in the series'
serif with the amber rule (same treatment as the Gacy episode); Hebrew
subtitles only under the three foreign-language sound bites. Number ranges
and approximate values are wrapped in left-to-right isolates (U+2066/U+2069)
so they do not reverse inside a right-to-left line.

## Picture rules

- The narration is never subtitled and never cut mid-word.
- The body is never shown. The autopsy is told with drawn plates.
- The archive is graded, not restored: 480p broadcast video is upscaled and
  kept soft rather than sharpened.
- Claims on screen are only those the narration makes, plus the names,
  dates and places of the footage itself (verified against the broadcast
  graphics in the clips, and for the 1996 result against Wikipedia).
- Deterministic: no `Math.random`, no network access at render time.

## Known limits

- The archive is 480p; close framings are soft.
- Wikimedia Commons was rate-limiting this environment, so no
  public-domain photographs (of Austria, Munich or hospitals) could be
  fetched; those beats are drawn instead.
- The photographs' original photographers are not identified (see
  `public/munzer/SOURCES.md`).
