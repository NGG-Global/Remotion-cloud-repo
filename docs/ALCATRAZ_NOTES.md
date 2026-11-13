# Alcatraz documentary: notes

"מאחורי הסיוט: אלקטרז", a Hebrew-narrated documentary episode cut to the supplied voice track, with archival film and photographs and drawn sequences where the record has no picture.

## Composition

| | |
| --- | --- |
| Composition ID | `AlcatrazDocumentary` |
| Narration | `public/alcatraz/audio/narration.mp3` (byte-identical copy of the supplied `alcatraz_combined.mp3`, 964.65 s) |
| Format | 1920×1080, 30 fps |
| Length | 31172 frames, 17:19. The narration plus 71.9 s of archival inserts and a 2.5 s tail. |
| Entry | `src/alcatraz/AlcatrazDocumentary.tsx` |

## How the edit works

- **Timings come from the narration.** The voice was transcribed locally with a Hebrew Whisper model (`ivrit-ai/whisper-large-v3-turbo-ct2`, word timestamps). Every shot in the shot list is placed at the narration second of the sentence it illustrates, and the animated graphics cue their beats by the second of the word (`useNarr()` in `components/Shot.tsx`).
- **Six inserts open the narration for archival sound** (`src/alcatraz/edit.ts`): the 1962 Universal Newsreel headline, the 1932 Hearst newsreel of Capone going to prison, the newsreel description of the dummy heads, the 1962 manhunt, and two passages from the 1963 closing-day newsreel. Each plays whole, 4:3, with its own sound and Hebrew subtitles, and the narration resumes exactly where it stopped. Cut points sit in measured pauses (below 2% of speech level). `toFilm()` converts narration time to film time, so the shot list never has to account for the inserts.
- **No picture is used twice.** Every still and clip goes through `claim()` in the composition, which throws at load time if an id repeats. The 45 B-roll clips and 6 inserts are separate, non-overlapping cuts of their sources (`tools/alcatraz-media.json`).
- **Loudness.** The narration measures -19.7 LUFS; the newsreels -14.4 to -20.0. Each insert has a gain that brings it to about -20.5 LUFS, just under the voice.

## Picture

- Archive where the record exists: U.S. National Archives (Universal Newsreel reels and outtakes, the warden's notebook mug shots, Bureau of Prisons photographs, aerials, the D block plan), Library of Congress (HABS survey of the cellhouse, New York World-Telegram & Sun photographs, Carol M. Highsmith aerials), National Park Service, Prelinger Archives and others. Full list with record links: `public/alcatraz/SOURCES.md`.
- Drawn where it does not: the bay map from OpenStreetMap coastline data (distance to the city, the strait the island guards, the ebb current on the night of the escape), the cell to scale, the cellhouse blocks, the dungeon section, the 1962 route, timelines and counts.
- No body or wound is shown. The 1946 morgue photographs were deliberately not used.
- On-screen type: names, places and dates as lower thirds, a few date cards, and Hebrew subtitles under the archival sound.

## Files

```
src/alcatraz/
  AlcatrazDocumentary.tsx   shot list and assembly
  edit.ts                   inserts, subtitles, narration-to-film mapping
  theme.ts                  palette and easing
  components/               Still (Ken Burns), Clip, Insert, Type, Shot clock
  graphics/                 BayMap, Diagrams, Cards, Notebook, Extras
  data/                     generated: bay coastline, image sizes, clip lengths
public/alcatraz/
  audio/narration.mp3
  clips/                    prepared footage (cut, framed 16:9, 30 fps)
  img/                      prepared stills
  SOURCES.md                credits and record links
tools/
  alcatraz-media.json       every clip: source, in/out, crop
  alcatraz-prep.mjs         cuts the clips from the downloaded sources
  alcatraz-images.json      every still: source file and record
  alcatraz-images.mjs       normalises the stills
  alcatraz-coast.py         OSM coastline -> data/bay.ts
```

The raw downloads (about 3.5 GB of newsreel transfers and master TIFFs) are not in the repository. Their archive pages are in the two manifests and in `SOURCES.md`.

## Render

Rendering is about twice as fast with SwiftShader than with the project-wide `swangle` backend, and nothing in this film needs WebGL:

```bash
npx remotion render AlcatrazDocumentary out/alcatraz.mp4 --gl=swiftshader --concurrency=4
```

The delivered file was rendered as four muted video chunks plus a WAV of the mix, then joined and encoded with ffmpeg:

```bash
npx remotion render AlcatrazDocumentary chunk0.mp4 --frames=0-7799 --muted --gl=swiftshader --concurrency=4 --crf=17 --jpeg-quality=92
# ... chunks 7800-15599, 15600-23399, 23400-31171
npx remotion render AlcatrazDocumentary audio.wav --codec=wav --timeout=240000 --gl=swiftshader
```

Measured in the 4-core cloud container: 20 to 23 minutes per 7800-frame chunk (about 0.16 s a frame, 87 minutes for the film) and 18 minutes for the audio. The audio-only render still opens every clip, and with the default 30-second timeout it failed on the first one; `--timeout=240000` fixed it. The chunks join with `ffmpeg -f concat -c copy` (31172 frames checked), and the WAV is normalised for YouTube to -14 LUFS / -1.5 dBTP with a two-pass `loudnorm` before the final H.264/AAC encode.

Measured on the WAV: each insert sits 2 to 4 dB (RMS) under the narration around it, and the narration lines up with the transcript to within 25 ms (the MP3's own start offset, under one frame).

Stills for review (one bundle, one browser):

```bash
GL=swiftshader node tools/stills.mjs AlcatrazDocumentary out/qa 0.5 1290,13560 .cache/bundle
```

## QA done

- `npx tsc` and `npx eslint src/alcatraz`: clean.
- A still from every shot (149 shots) at two points in the shot, reviewed on contact sheets; fixes made for framing, a scanner border, a highlight box, the window view and the brightness of the 1946 reels.
- Audio sync: a rendered section was cross-correlated with the source narration before and after an insert. Same offset on both sides (no drift); the offset measured is the MP3 encoder delay plus AAC priming, about 2 frames, and is not visible against narration.

## Facts added on screen

Labels add a little to what the narration says. Each was checked against the archive record or a standard reference: Capone's Alcatraz number 85 and arrival in August 1934 (warden's notebook), James A. Johnston as first warden 1934–1948, the Hopi prisoners of 1895 (NPS), the key 107 the 1946 escapers could not find, Coy and Cretzer as the 1946 leaders, the executions of Shockley and Thompson at San Quentin in December 1948, the items found after the 1962 escape, Scott found at Fort Point. Worth a second check before publishing, as with any documentary.
