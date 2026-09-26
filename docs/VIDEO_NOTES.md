# Gacy documentary — video notes

Illustrated episode for the Hebrew narration of *מאחורי הסיוט: John Wayne Gacy*.

## Composition

| | |
| --- | --- |
| Composition ID | `GacyDocumentary` |
| Source narration | `ElevenLabs_John_Wayne_Gacy_מאחורי_הסיוט.mp3` (repo root, untouched) |
| Audio used by Remotion | `public/audio/gacy-narration.mp3` (copy of that file) |
| Source script | `John_Wayne_Gacy_ElevenLabs.pdf` (untouched) |
| FPS | 30 |
| Resolution | 1920×1080 |
| Duration | 645.30 seconds (the narration), 19360 frames |

## Render

```bash
npx remotion render GacyDocumentary out/gacy-documentary.mp4
```

Preview:

```bash
npm run dev
```

Then open the `GacyDocumentary` composition.

A single frame:

```bash
npx remotion still GacyDocumentary out/gacy-frame.png --frame=900
```

## Where things live

- Scene timing: `src/gacy/data/timeline.ts`. Change a `start` / `end` and the sequence follows. Times are seconds into the MP3.
- Storyboard: `docs/GACY_STORYBOARD.md`.
- Character appearance: `src/gacy/characters/presets.ts` (Gacy, workers, Piest, police, court). The rig itself is `src/gacy/characters/Character.tsx` (`pose`, `expression`, `hair`, `outfit`, `body`, `facing`).
- Global color: `src/gacy/theme.ts` (`PAL`).
- Scenes: `src/gacy/scenes/`.
- Entry: `src/gacy/GacyDocumentary.tsx`.

## Picture rules already in the cut

The voice is the only audio. There is no score. On-screen type is limited to names, years, places, and a few words. The crawl space, the search, and the trial imply what happened; they do not show remains or an execution.
