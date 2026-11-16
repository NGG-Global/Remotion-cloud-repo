# The Basement: horror motion comic

Illustrated motion comic over the Hebrew narration `basement_full.mp3` (18:57).

| | |
| --- | --- |
| Composition ID | `BasementComic` |
| Format | 1280×720, 24 fps, H.264 + AAC |
| Duration | 1137.19 s (the narration), 27,293 frames |
| Narration | `public/basement/narration.mp3` (byte-identical copy of the upload) |
| Added sound | `public/basement/drone.mp3`: synthesised low room tone, 328.6 s to 1069.3 s, about 18 dB under the voice, silent during "and then... silence" |

## Render

```bash
npx remotion render BasementComic out/basement-motion-comic-720p.mp4 \
  --config=remotion.basement.config.ts \
  --crf=22 --x264-preset=medium --concurrency=4 --jpeg-quality=90 \
  --audio-codec=aac --audio-bitrate=192k
```

Use the dedicated config: the default remotion.config.ts forces SwiftShader GL
(needed only by the three.js documentary), which made this 2D film about 3.5x
slower to render in a 4-core container.

## How it is built

1. **Narration analysis.** Transcribed locally with the ivrit-ai Hebrew
   Whisper model (`ivrit-ai/whisper-large-v3-turbo-ct2` through
   faster-whisper). The audio never left the machine. Shot times come from the
   segment timestamps; cuts sit in the pauses between phrases.
2. **Art.** `tools/basement/` paints every plate as layered SVG (ink wobble,
   brush texture, paper grain, chiaroscuro light maps), and
   `tools/basement/bake.mjs` bakes them once to JPEG (opaque plates) or PNG
   (character and prop layers) in `public/basement/art/`. A manifest keyed by a
   hash of each layer's source skips unchanged layers, so accepted art is never
   re-baked by accident.
   - `lib.mjs`: filters, figure rig, hand rig, environment kit.
   - `act1.mjs`, `act2.mjs`, `act3.mjs`: the plates, act by act.
3. **Composition.** `src/basement/`
   - `engine.tsx`: the shot renderer. A shot is a base plate plus layers with
     parallax depth, seen through a keyframed 2D camera with handheld drift and
     impact shakes. Flashlight reveals lay a dark plate over a lit one and cut
     moving holes with CSS masks. Effects (flashes, muzzle flashes, steam,
     drips, police lights, heartbeat vignette) are cheap DOM overlays.
   - `timeline.ts`: the cut, one entry per shot, each commented with the beat
     of the narration it covers.
   - `BasementComic.tsx`: sequences the shots and mixes the audio.

## Picture rules

- No character has a face. The figure rig has no facial geometry at all:
  heads are hair masses, hoods and silhouettes, backlit or seen from behind.
- Violence is carried by silhouettes, off-screen action, reaction shots and
  aftermath details. The paintings and photographs in the coin room are
  deliberately indistinct.
- Crimson enters with the photographs (Act II) and grows through Act III.
- Everything is deterministic: seeded randomness, no network requests during
  rendering, no CSS animation.

## Rebuilding art

```bash
node tools/basement/bake.mjs            # bake what changed
node tools/basement/bake.mjs chamber    # only layers whose name contains "chamber"
```

The bake uses the Playwright Chromium already installed in the environment.
