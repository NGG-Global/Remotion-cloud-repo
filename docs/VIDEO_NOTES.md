# Gacy documentary: video notes

Illustrated episode for the Hebrew narration of *מאחורי הסיוט: John Wayne Gacy*.

## Composition

| | |
| --- | --- |
| Composition ID | `GacyDocumentary` |
| Source narration | `ElevenLabs_John_Wayne_Gacy_מאחורי_הסיוט.mp3` (repo root, untouched) |
| Audio used by Remotion | `public/audio/gacy-narration.mp3` (byte-identical copy of that file) |
| Source script | `John_Wayne_Gacy_ElevenLabs.pdf` (untouched) |
| FPS | 30 |
| Composition size | 1920×1080 |
| Duration | 645.30 seconds (the narration), 19360 frames |

## Render

Full resolution:

```bash
npx remotion render GacyDocumentary out/gacy-documentary.mp4
```

A 720p delivery file (720/1080 is exactly 2/3):

```bash
npx remotion render GacyDocumentary out/gacy-documentary-720p.mp4 --scale=0.6666666666666666
```

A section, for review (frames are seconds × 30):

```bash
npx remotion render GacyDocumentary out/piest.mp4 --frames=8904-9939 --scale=0.5
```

A single frame:

```bash
npx remotion still GacyDocumentary out/gacy-frame.png --frame=900
```

Render cost: in the 4-core cloud container used for this repair, a 1080p frame took about 1.6 s as a still. `docs/VIDEO_QA.md` has the measured clip render times. Allow several hours for a full 1080p render on similar hardware.

Preview: `npm run dev`, then open `GacyDocumentary`. The two helper compositions `GacyRigSheet` (the cast and their poses) and `GacySetTest` (sets under the camera) are for development and are not part of the film.

## How the cut is organised

- **Timeline:** `src/gacy/data/timeline.ts`. `SHOTS` lists every shot: its id, its start in seconds (`at`), its component, and an optional entrance (`dissolve`, `fromBlack`) and exit (`toBlack`). A shot runs until the next shot's `at`. `WIPES` are objects crossing the lens, centred on a cut. `LABELS` are the only on-screen type. Every time is seconds into the MP3, and every cut sits inside a measured pause of the voice.
- **Shots:** `src/gacy/shots/`, one file per act. Inside a shot, `useShot()` gives `t`, seconds since the shot's narration start, so beats are written against the voice (for example `ramp(t, 2.5, 3.1)` for an action that starts 2.5 s after the shot's first word).
- **Camera:** `src/gacy/engine/camera.tsx`. `<Stage cam={{ x, y, zoom }}>` with `<Plane d={…}>` children. World units are 200 per metre. `d` is a plane's depth relative to the character plane (positive is farther away). A plane that ends up behind the lens is not drawn.
- **Characters:** `src/gacy/rig/`. `Person` takes a `look` from `cast.ts` and a `pose` built from `pose.ts` (`STAND`, `SIT`, `CARRY`… plus `idle`, `talk`, `gesture`, `walk`, `walkBetween`, `reachAngles` for aiming a hand).
- **Sets and props:** `src/gacy/kit/`.
- **Look:** `src/gacy/engine/look.tsx` (`Finish` for grain and vignette, `HomeMovie` for Super 8, `Haze`) and `color.ts` (`lit()` applies a shot's light to a colour).
- **Type:** `src/gacy/type/Label.tsx`. Hebrew text runs right to left; a label with no Hebrew letters (a date, a Latin name) runs left to right, so ranges like "1972 – 1978" read correctly.
- **Entry:** `src/gacy/GacyDocumentary.tsx`.

The draft that this cut replaced is kept, unused, in `src/gacy/legacy/` (see `docs/VIDEO_REPAIR_AUDIT.md`).

## Picture rules

- The voice is the only audio. There is no score.
- On-screen type is limited to 15 labels: names, places, dates and one number, one to three words each. There are no subtitles and no sentences.
- No murder, body or execution is shown. No victim is drawn with a face.
- The clown appears only where the narration is about the costume or its image. Everywhere else Gacy is an ordinary man.
- Everything is deterministic: no `Math.random`, no network requests, no CSS animation. Randomness comes from the seeded `hash()` and `noise()` in `engine/time.ts`.

## Related documents

- `docs/GACY_STORYBOARD.md`: the shot list with the narration beat for every shot.
- `docs/VIDEO_REPAIR_AUDIT.md`: what was wrong with the draft, what changed, and what is still limited.
- `docs/VIDEO_QA.md`: what was rendered and checked.
