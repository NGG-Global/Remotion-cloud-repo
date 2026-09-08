# Remotion video project

Animated videos built as React components. Compositions are written in TypeScript,
previewed in the Remotion Studio, and rendered to MP4 from the command line or CI.

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
npx remotion render TitleCard out/title-card.mp4
npx remotion render Explainer out/explainer.mp4

# A single frame, e.g. for a thumbnail
npx remotion still TitleCard out/thumbnail.png --frame=100

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
  theme.ts          Format and design tokens (dimensions, fps, colours, type scale).
  fonts.ts          Self-hosted font loading.
  components/       Reusable animation building blocks.
  compositions/     One file per video.
public/             Static assets reachable via staticFile(). Fonts live here.
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

**Fonts are self-hosted.** `src/fonts.ts` loads Inter from `public/fonts` with
`loadFont()` from `@remotion/fonts`, which holds the render open until the font
is ready. `@remotion/google-fonts` is deliberately not used: it fetches font
files over the network mid-render, so an offline runner or one behind a proxy
either fails or silently substitutes a different face and changes the output.

To add a brand font, drop the files in `public/fonts` and load them the same way.

**Static assets go through `staticFile()`.** Put images, video and audio in
`public/` and reference them as `staticFile("logo.png")`. Relative paths and
imports do not resolve reliably during a render.

**Per-frame values stay in inline styles.** Tailwind is configured and available
for static layout, but anything that changes every frame (opacity, transform,
interpolated colour) has to be an inline style.

## What is in the repository now

Two compositions, both intended as patterns to copy rather than finished assets:

- **`TitleCard`** — a five second title card. Shows word-by-word `spring()`
  entrances, a clamped fade-out, `<Sequence>` for offsetting a child's timeline,
  and a Zod schema that makes the props editable in the Studio and validated on
  the command line.
- **`Explainer`** — a three scene piece assembled with `<TransitionSeries>` from
  `@remotion/transitions`, using a slide and a fade between scenes. Its total
  length is computed from the scene and transition constants instead of being
  hand-counted, so edits to the timing cannot drift out of sync with the
  registered duration.

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
