# Lizzie Borden documentary: video notes

Illustrated episode for the Hebrew narration of *מאחורי הסיוט: Lizzie Borden*, built on the same machinery as the Gacy episode.

## Composition

| | |
| --- | --- |
| Composition ID | `LizzieBorden` |
| Source narration | `ElevenLabs_Lizzie_Borden_ElevenLabs_v4_HE.mp3` (as delivered; the repository holds it as `public/audio/lizzie-narration.mp3`, a byte-identical copy, MD5 `f3f2c5db2b3fbb170b02db6d22642b30`) |
| Source script | `docs/Lizzie_Borden_ElevenLabs_v4_HE.pdf` (untouched) |
| FPS | 30 |
| Composition size | 1920×1080 |
| Duration | 948.19 seconds (the narration), 28446 frames, 15:48 |
| Shots | 161, in `src/borden/data/timeline.ts` |

## Render

Full resolution (H.264, the default settings):

```bash
npm ci
npx remotion render LizzieBorden out/lizzie-borden.mp4
```

Delivery quality (PNG frames, CRF 16) or a ProRes master with PCM audio:

```bash
npm run render:hq -- LizzieBorden out/lizzie-borden.mp4
npm run render:master -- LizzieBorden out/lizzie-borden.mov
```

A 720p file (720/1080 is exactly 2/3), which renders in about half the time:

```bash
npx remotion render LizzieBorden out/lizzie-borden-720p.mp4 --scale=0.6666666666666666
```

A section, for review (frames are seconds × 30; this is the first murder, 235–276 s):

```bash
npx remotion render LizzieBorden out/first-murder.mp4 --frames=7052-8273 --scale=0.5
```

A single frame:

```bash
npx remotion still LizzieBorden out/frame.png --frame=1800
```

Render cost: the film is 28,446 frames of vector SVG with grain and vignette finishes. On the 4-core container this was built in, a half-size still takes 0.3–0.7 s and a full-size frame about 1.6 s, so allow **several hours** for a full 1080p render on a laptop (roughly 2–3 hours at 720p, 4–6 hours at 1080p on four cores; a machine with more cores is proportionally faster, pass `--concurrency`). The GitHub Actions workflow (`.github/workflows/render-video.yml`) renders on demand and publishes the file as a downloadable artifact; its timeout is set to six hours for this reason.

Audio in H.264 files: the default MP4 output encodes the voice as AAC. As measured on the Gacy episode (`docs/VIDEO_QA.md`), the voice in such a file decodes about 43 ms (1.3 frames) behind the picture with ffmpeg, because the AAC encoder's priming samples are not signalled. The composition itself is sample-exact; for an exact master use `npm run render:master`.

Preview: `npm run dev`, then open `LizzieBorden`. Two helper compositions, `BordenRigSheet` (the cast) and `BordenSetTest` (one set per frame), are for development and are not part of the film.

## How the cut is organised

- **Timeline:** `src/borden/data/timeline.ts`. `SHOTS` lists every shot: its id, its start in seconds (`at`), its component, and an optional entrance (`dissolve`, `fromBlack`) and exit (`toBlack`). A shot runs until the next shot's `at`. `WIPES` are objects crossing the lens, centred on a cut. `LABELS` are the only on-screen type. Every time is seconds into the MP3, and every cut sits inside a measured pause of the voice.
- **How the times were found.** The narration was transcribed locally (faster-whisper, `large-v3`, Hebrew, word timestamps; the audio did not leave the machine) to get the second every word starts. The voice envelope was measured from the decoded audio (20 ms RMS every 10 ms) to find the pauses. Each planned cut was then snapped into the nearest pause. The result: 160 cuts, none on speech, the shortest quiet stretch 0.20 s, the median 0.67 s.
- **Shots:** `src/borden/shots/`, one file per act. Inside a shot, `useShot()` gives `t`, seconds since the shot's narration start, so beats are written against the voice (for example `ramp(t, 2.6, 3.4)` for an action that starts 2.6 s after the shot's first word). The cue times are noted in comments in each shot.
- **Shared machinery** (`src/gacy/engine`, `src/gacy/rig`): the multiplane camera, the shot clock, the character rig, the grain and vignette finish. The rig gained a few things for the 1890s: a `bun` hair style, `beard`, `hat` (bowler, top, straw, bonnet, police helmet), `hem` (the flare of a long skirt) and `apron`. Every Gacy look renders exactly as before.
- **Sets:** `src/borden/kit/`. `house.tsx` is the Borden house in three views on one coordinate system: the street facade, the long side from the yard, and the dollhouse cutaway (`BordenSection`) with every room drawn once (`rooms.tsx`) and placed in its cell; a close shot puts the camera inside a room of the same cutaway, which is why a camera can rise through a ceiling without a cut. `town.tsx` has the mills, the Hill, Second Street, Main Street, the church, the courthouse, Maplecroft and the cemetery. `interiors.tsx` has the drugstore, the church, the New Bedford courtroom, the inquest room, the barn loft, a chemist's bench and the lantern hall. `paper.tsx` and `props.tsx` hold the newspapers, ledgers, deeds, the calendar, the scale, the hatchets and the rest.
- **Cast:** `src/borden/rig/cast.ts`.
- **Entry:** `src/borden/BordenDocumentary.tsx`.

## Picture rules

- The voice is the only audio. There is no score.
- On-screen type is limited to 14 labels: places, dates, names, one to three words each. There are no subtitles and no sentences. The channel plug is a lantern slide of the series mark, inside the picture.
- No murder or body is shown. The first murder is a shadow on a floor, a doorway, and a picture frame that will not stay straight. The most the picture allows itself afterwards is a hem and a shoe beyond a bed.
- The killer is only ever a silhouette. Where the film walks through the prosecution's theory it draws the house in blueprint blue, so the theory reads as a theory.
- Lizzie is drawn plainly, never sinister. The film does not know whether she did it, and the pictures do not decide for it.
- Everything is deterministic: no `Math.random`, no network requests, no CSS animation. Randomness comes from the seeded `hash()` and `noise()` in `src/gacy/engine/time.ts`.

## Related documents

- `docs/BORDEN_STORYBOARD.md`: the shot list with the narration beat for every shot.
- `docs/BORDEN_QA.md`: what was rendered and checked.
