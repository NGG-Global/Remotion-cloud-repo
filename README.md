# Claude explainer videos

Animated explainer videos built as React components with Remotion. Compositions
are written in TypeScript, previewed in the Remotion Studio, and rendered to MP4
from the command line or CI.

Currently holds episode 1 of a Hebrew-narrated series on using Claude, plus the
scene library and interface-callout machinery the rest of the series reuses.

Remotion version: **4.0.522** · Output format: **1920x1080, 30 fps, H.264**

## Requirements

- Node.js — this project has been verified on Node 22. The Remotion packages do
  not declare an `engines` range, so if you need to run an older runtime, check
  the current requirement in the Remotion docs rather than assuming.
- No separate FFmpeg install — Remotion ships its own renderer and downloads a
  Chrome Headless Shell on first render (roughly 92 MB, cached afterwards).

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` opens the Remotion Studio: pick a composition in the sidebar,
scrub the timeline, and edit props live in the right-hand panel.

## Rendering

```bash
# Render a composition by its id
npx remotion render ClaudeIntro out/claude-explainer-ep1.mp4

# A single frame, e.g. for a thumbnail
npx remotion still ClaudeIntro out/thumbnail.png --frame=270

# Override props at render time (validated against the composition's schema)
npx remotion render TitleCard out/custom.mp4 \
  --props='{"title":"Q4 results","subtitle":"Full year review","accentColor":"#10b981"}'
```

Rendered files land in `out/`, which is git-ignored.

## Scripts

| Script                     | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Open the Remotion Studio                              |
| `npm run render`           | Render a composition (`npm run render -- <id> <out>`) |
| `npm run still`            | Render a single frame                                 |
| `npm run compositions`     | List every registered composition with its length     |
| `npm run bundle`           | Build a static Remotion bundle for a render service   |
| `npm run lint`             | ESLint plus a TypeScript check                        |
| `npm run typecheck`        | TypeScript only                                       |
| `npm run format`           | Format with Prettier                                  |
| `npm run upgrade-remotion` | Upgrade every Remotion package together               |

## Project layout

```
src/
  index.ts          Entry point. Calls registerRoot() — rarely needs changing.
  Root.tsx          Every renderable video is registered here.
  script.ts         The narration timeline: one entry per beat of the voice-over.
  theme.ts          Format and design tokens (dimensions, fps, colours, type scale).
  fonts.ts          Self-hosted font loading.
  components/       Animation building blocks (kinetic text, stage, motif).
  scenes/           The scene types the video is assembled from.
  ui/               Machinery for filming the interface screenshot.
  compositions/     One file per video.
  dev/              Development-only compositions. Not delivered.
public/
  audio/            Narration tracks.
  img/              Interface screenshots.
  fonts/            Self-hosted font files and their licences.
tools/
  transcribe.mjs    Narration -> timed script, locally via whisper.cpp.
out/                Render output (git-ignored).
remotion.config.ts  CLI and Studio configuration.
```

### Adding a video

1. Create a component in `src/compositions/`.
2. Register it in `src/Root.tsx` with a `<Composition>` entry — the `id` you give
   it is the name you pass to `remotion render`.
3. Spread `{...FORMAT}` from `src/theme.ts` so it inherits the project's
   dimensions and frame rate.

## Conventions worth knowing

**Animate from the frame number, never from wall-clock time.** Values come from
`useCurrentFrame()` fed through `interpolate()` or `spring()`. `setTimeout`,
`requestAnimationFrame` and CSS transitions do not work: the renderer captures
frames out of real time, so anything driven by a clock produces a different
result on every render. Frame-derived animation is deterministic — frame 42 looks
identical whether it is scrubbed in the Studio or rendered on a build server.

**Express timings in seconds.** Use the `seconds()` helper from `src/theme.ts`
rather than raw frame counts, so timings survive a change of frame rate.

**Clamp your interpolations.** `interpolate()` extends the line past the input
range unless you pass `extrapolateLeft: "clamp"` and `extrapolateRight: "clamp"`.
Unclamped values overshoot — a common cause of elements flickering past full
opacity.

**Fonts are self-hosted.** `src/fonts.ts` loads Rubik (Hebrew and Latin) and
Inter from `public/fonts` with `loadFont()` from `@remotion/fonts`, which holds
the render open until the face is ready. `@remotion/google-fonts` is
deliberately not used: it fetches font files over the network mid-render, so an
offline runner or one behind a proxy either fails or silently substitutes a
different face and changes the output.

Rubik ships one file per script, registered under one family with the unicode
range each covers. Without the Hebrew file, Hebrew text falls back to a system
face and the layout breaks. To add a brand font, drop the files in
`public/fonts` and load them the same way.

**Hebrew lays out RTL at the container.** Splitting a Hebrew string on spaces
gives words in logical order; only `direction: rtl` on the flex container puts
the first word on the right. Setting direction on the words themselves renders
them reversed.

**Static assets go through `staticFile()`.** Put images, video and audio in
`public/` and reference them as `staticFile("logo.png")`. Relative paths and
imports do not resolve reliably during a render.

**Per-frame values stay in inline styles.** Tailwind is configured and available
for static layout, but anything that changes every frame (opacity, transform,
interpolated colour) has to be an inline style.

## The Claude explainer series

`ClaudeIntro` is episode 1: a Hebrew-narrated explainer on what Claude is for,
which tasks suit it, and where not to use it. It runs 3:40 against the supplied
narration track.

```bash
npx remotion render ClaudeIntro out/claude-explainer-ep1.mp4
```

### How it is put together

**Timings come from the narration, not from guesswork.** `src/script.ts` holds
one entry per beat of the voice-over with the second it starts at, transcribed
from `public/audio/narration.mp3`. Scenes are placed by beat id and their
lengths are derived from the gaps between beats, so re-timing one beat cannot
leave a scene overlapping its neighbour. To re-derive the timings after a
narration change:

```bash
npm run transcribe -- public/audio/narration.mp3 he
```

That runs `tools/transcribe.mjs`, which transcribes locally through
whisper.cpp — the audio never leaves the machine, which matters when the
narration discusses internal material.

**Scenes are types, not one-offs.** `src/scenes/` holds the seven shapes the
video uses — a title, a chapter divider, a full-frame statement, a staggered
list, a not-this-but-that contrast, a row of cards, and the interface
showcase. Episode 2 should reuse these rather than add more.

**The interface screenshot is treated as a set.** `src/ui/` holds the
machinery for filming it:

| Piece             | What it does                                                       |
| ----------------- | ------------------------------------------------------------------ |
| `regions.ts`      | Every interface element's position, in fractions of the screenshot |
| `useFocus.ts`     | Camera path across a list of targets, eased and edge-clamped       |
| `UIShowcase.tsx`  | The window itself, and the projection overlays draw against        |
| `Highlight.tsx`   | Focus ring, with the rest of the interface dimmed                  |
| `Callout.tsx`     | Hebrew label tethered to an element, flipping side near an edge    |
| `Cursor.tsx`      | Pointer that travels between elements and clicks                   |
| `TypedPrompt.tsx` | Types a request into the composer                                  |

Two decisions in there are worth keeping:

- **The camera is capped** at a little over the screenshot's own resolution.
  Past that a close-up is just a blown-up screenshot. Where an element is too
  small to fill the frame sharply — a toggle inside the composer — the camera
  frames its container via `frameOn` and the ring still lands on the element.
- **The camera clamps at the image edges.** Centring an element near a corner
  would otherwise slide blank window into frame.

### Redaction

The supplied screenshot contains real conversation titles and an account name.
`ShowcaseScene` blurs the conversation list and the account row by default —
see `DEFAULT_REDACTIONS`. The navigation items stay legible because the video
teaches them. Pass `redact={[]}` to turn it off, or add regions to cover more.

### Recalibrating after a screenshot change

`src/dev/` holds two development-only compositions, not part of the video:

- `Calibration` renders the screenshot under a labelled percentage grid, so
  `regions.ts` can be re-measured. Render it as a still.
- `UIKitDemo` exercises every indicator at once, for checking the kit from a
  few stills instead of a full render.

## Starter examples

`TitleCard` and `Explainer` are the minimal compositions this project started
from. They are not part of the series; they are kept because they demonstrate
two features the explainer does not use — Zod-schema props editable in the
Studio, and `<TransitionSeries>`.

## Cloud rendering

`npm run bundle` produces a static bundle that any render service can serve.
For rendering on AWS Lambda, `@remotion/lambda` is the first-party option; it
needs an AWS account, a deployed render function and a policy setup, so it has
been left out until those decisions are made. See
https://remotion.dev/docs/lambda.

## Licensing

Remotion is free for individuals and for teams of up to three people, but larger
companies need a paid licence. Review the terms at https://remotion.pro/license
before rolling this out more widely.

Inter is bundled under the SIL Open Font License 1.1 — see
`public/fonts/Inter-LICENSE.txt`.
