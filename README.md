# Claude explainer videos

Animated explainer videos built as React components with Remotion. Compositions
are written in TypeScript, previewed in the Remotion Studio, and rendered to MP4
from the command line or CI.

Currently holds episodes 1 to 6 of a Hebrew-narrated series on using Claude,
plus the scene library, graphics and interface-callout machinery the episodes
share.

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

### Higher-quality export

The default `render` captures frames as JPEG (fast, small). For a
delivery-quality file, render from PNG frames at a low CRF instead:

```bash
# High-quality H.264 (PNG frames, CRF 16) — best for sharing and upload
npm run render:hq -- ClaudeReach out/claude-explainer-ep6.mp4

# ProRes 422 HQ master (10-bit 4:2:2, PCM audio) — for archival or re-editing
npm run render:master -- ClaudeReach out/claude-explainer-ep6.mov
```

Both render the full 1920x1080, 30 fps timeline with audio.

### Download from GitHub (no local render)

The [`Render video`](.github/workflows/render-video.yml) GitHub Actions workflow
renders on demand and publishes the file as a downloadable artifact:

1. Open the repository's **Actions** tab and pick **Render video**.
2. Click **Run workflow**, choose a composition and a quality (`high` or
   `master`), and run it.
3. When the run finishes, download the file from its **Artifacts** section.

The **Run workflow** button only appears once this workflow exists on the
repository's default branch, so merge it there first.

## Scripts

| Script                     | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Open the Remotion Studio                              |
| `npm run render:showreel`  | Render the Remotion capability showreel               |
| `npm run render`           | Render a composition (`npm run render -- <id> <out>`) |
| `npm run render:hq`        | High-quality H.264 render (PNG frames, CRF 16)        |
| `npm run render:master`    | ProRes 422 HQ master (10-bit, for archival)           |
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
  graphics/         Line icons and the bespoke scene illustrations.
  scenes/           The scene types the video is assembled from.
  ui/               The screenshot registry and the machinery for filming it.
  compositions/     One file per video.
  showreel/         Remotion capability showreel (`RemotionShowreel`).
  dev/              Development-only compositions. Not delivered.
public/
  audio/            Narration tracks, one per episode.
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

| Composition     | Episode | Length | Subject                                                               |
| --------------- | ------- | ------ | --------------------------------------------------------------------- |
| `ClaudeIntro`   | 1       | 3:40   | What Claude is for, which tasks suit it, where not to use it          |
| `ClaudeSetup`   | 2       | 6:54   | Installing, signing in, the screen, choosing a model, settings        |
| `ClaudeConnect` | 3       | 4:37   | Connecting to Microsoft 365, and what Claude can and cannot see       |
| `ClaudeContext` | 4       | 5:05   | Giving Claude context, and treating the first answer as a draft       |
| `ClaudeFiles`   | 5       | 3:56   | Files in a conversation, and where Chat stops and Cowork starts       |
| `ClaudeReach`   | 6       | 3:04   | Pulling from Microsoft 365 by asking, and the Teams-transcript caveat |

```bash
npx remotion render ClaudeIntro out/claude-explainer-ep1.mp4
npx remotion render ClaudeSetup out/claude-explainer-ep2.mp4
npx remotion render ClaudeConnect out/claude-explainer-ep3.mp4
npx remotion render ClaudeContext out/claude-explainer-ep4.mp4
npx remotion render ClaudeFiles out/claude-explainer-ep5.mp4
npx remotion render ClaudeReach out/claude-explainer-ep6.mp4
```

### How it is put together

**Timings come from the narration, not from guesswork.** `src/script.ts` holds
one entry per beat of each episode's voice-over with the second it starts at,
transcribed from the tracks in `public/audio`. Scenes are placed by beat id and
their lengths are derived from the gaps between beats, so re-timing one beat
cannot leave a scene overlapping its neighbour.

Each episode gets its lookups from `timeline()` — `EP1`, `EP2` — rather than
from shared free functions, so a composition cannot accidentally read the other
episode's timings and place its scenes against the wrong voice track.

To re-derive the timings after a narration change:

```bash
npm run transcribe -- public/audio/narration.mp3 he
```

That runs `tools/transcribe.mjs`, which transcribes locally through
whisper.cpp — the audio never leaves the machine, which matters when the
narration discusses internal material.

**Scenes are types, not one-offs.** `src/scenes/` holds the eight shapes the
video uses — a title, a chapter divider, a full-frame statement, a staggered
list, a not-this-but-that contrast, a row of cards, a staged walkthrough, and
the interface showcase. Episode 2 should reuse these rather than add more.
Every one of them takes an illustration slot, so a new beat gets a graphic
without a new scene type.

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

### Graphics

The narration is mostly abstract, so the text scenes carry illustration rather
than typography alone. `src/graphics/` holds two kinds:

**A line-icon set** (`LineIcon.tsx`) used as row markers throughout the lists.
Icons are stored as path sets and draw themselves on stroke by stroke. Every
path carries `pathLength="1"`, which normalises its length whatever its
geometry — so one dash offset animates any path without measuring it, and a
new icon can be added by appending its `d` strings and nothing else.

**Bespoke illustrations** for the beats that earn one:

| Graphic                          | Beat it carries                                                    |
| -------------------------------- | ------------------------------------------------------------------ |
| `ClickMaze`                      | The opening: a pointer hunting a wall of controls, hitting nothing |
| `SearchResults` / `ReadMaterial` | The contrast: links crossed off, versus a document being read      |
| `PageStack`                      | A long document fanning open and being read through                |
| `DraftEdit`                      | A draft with lines struck and rewritten in place                   |
| `IdeaToOutputs`                  | One idea branching into a document, a table and a deck             |
| `FunnelRule`                     | Text, data and an idea dropping into a funnel that returns a tick  |
| `EffortCompare`                  | Explaining the task versus doing it, to scale                      |
| `PathShortcut`                   | A winding route and a direct one to the same destination           |
| `PlatformGrid`                   | One account reaching browser, desktop and mobile                   |
| `ModelLadder`                    | The model line-up on a speed-to-depth axis                         |
| `Overkill`                       | A small task sent to a large model, and what it costs              |
| `EffortDial`                     | The effort control sweeping its three levels                       |
| `ABCompare`                      | The same task on two models, marking what one missed               |
| `PermissionGate`                 | Material reaching Claude only through existing permissions         |
| `ConnectFlow`                    | The connection as four steps landing in turn                       |
| `ChatAsk`                        | A short exchange as chat bubbles                                   |
| `SystemRouter`                   | One request routed to whichever system holds the answer            |
| `PermissionMirror`               | Your access and Claude's, side by side and identical               |
| `SameToolSplit`                  | One request down two branches, and the gap between the results     |
| `AimAtInput`                     | Ruling out the model, and landing on what it was given             |
| `VagueReply`                     | A reply that is right about everything and addressed to no one     |
| `BriefSlots`                     | The brief filling in, and the deliverable resolving because of it  |
| `NoSecretLanguage`               | An incantation crossed out, and a plain briefing in its place      |
| `ProjectBlanks`                  | General knowledge beside an empty project, filled with guesses     |
| `AttachInstead`                  | Describing a document, next to handing one over                    |
| `ConstraintNarrows`              | A rejected proposal, and the approaches it rules out               |
| `BriefBoth`                      | The same briefing delivered to a colleague and to Claude           |
| `NotFinalStamp`                  | A “final” stamp that will not take                                 |
| `RetypeLoop`                     | Starting over, drawn as the loop it is, with the context gauge     |
| `RoundsConverge`                 | Three passes closing on a fixed target                             |
| `LiveEdits`                      | Blunt corrections, each answered by the page itself                |
| `ContextStack`                   | What a conversation holds, and what a new one does not             |
| `SharedDraft`                    | Two bubbles becoming one document worked on from both sides        |
| `FeedbackAim`                    | The same note worded two ways, and the edit each produces          |
| `OneThreadFiveGoals`             | Five goals, five outputs, one thread that never changes            |
| `SameChat`                       | Five features collapsing into one conversation                     |
| `NextLayer`                      | Files settling onto the conversation as another layer              |
| `PdfHunt`                        | The slog through a long PDF for the one paragraph that matters     |
| `StructuredRead`                 | A deck read as slides, and a sheet read as a table                 |
| `PurposeSplit`                   | One file, two reasons for opening it, two different answers        |
| `MaterialTransform`              | Material you already have, becoming something else                 |
| `ModeAnatomy`                    | Where the files sit in Chat, and where they sit in Cowork          |
| `HandOff`                        | Handing over a whole task instead of steering every step           |
| `ModeChoice`                     | The two cases, and which mode each one is                          |

Two things keep them from looking like clip art:

- **Motion is derived from the thing being shown, not bolted on.** The click
  maze routes its pointer through the buttons' own positions rather than
  through fixed coordinates, so every stab lands on a control — which is the
  whole joke. Fixed coordinates missed the buttons entirely.
- **Layout follows the writing direction.** In an RTL row the first child sits
  rightmost, so scenes put the text block first and the illustration second.
  Getting that backwards reads as a Latin layout with Hebrew dropped into it.
- **Never mix CSS `right` with SVG coordinates in an RTL container.** SVG uses
  left-origin coordinates and CSS `right` measures from the other edge, so the
  two mirror each other. This bit three times — a reversed card order, two
  labels on each other's elements, and a row of step numbers on the opposite
  side from the rail they belong to. Position against an SVG with `left`.
  `right: 0` paired with `left: 0` is a full-width span and is fine.

**When the animation is the argument, give it the frame.** Episode 4 was
briefed as animation carrying the narration rather than scenes captioning it,
which changed how it is built. `CanvasScene` hands almost the whole frame to
one graphic and keeps text to a single line beneath it, and `BezierFlow`
supplies the motion those graphics keep needing — tokens travelling a cubic
bezier, evaluated from its control points rather than measured off a rendered
path, because a `getPointAtLength()` reading needs a ref and an effect and a
frame that depends on a previous frame's measurement cannot be rendered out of
order.

Two habits from that episode are worth keeping:

- **Hold a causal chain in one take.** Where the narration is one argument
  rather than several claims — the brief filling in and the output resolving
  because of it, the blanks being guessed and the answer coming out nearly
  right — the beats are rendered by a single graphic using `extend`, so the
  cause stays on screen with its effect. Cutting between them turns one
  argument into a list of complaints.
- **Animate the consequence, not the advice.** The feedback passage does not
  set two phrasings side by side and label one better; it shows the edit each
  one produces, precise against diffuse. The constraint passage does not state
  that time is saved; it draws the candidate approaches and prunes them.

**Film what the interface shows; draw what it cannot.** Episode 5 is the
clearest case. Its narration is almost entirely about things visible in the
home screenshot — the composer, attaching a file, the question you type, the
Chat and Cowork pills — so ten of its twenty-one beats are filmed on that
screenshot, and the composer carries the first half as one continuous shot.
Two overlays make that possible:

- `AttachedChips` draws files sitting in the composer, in screenshot
  coordinates, covering the baked-in placeholder the way `TypedPrompt` does.
  The screenshot was captured with an empty composer, so without this an
  episode about bringing files in has nothing to point at. Chips arrive one at
  a time; `newestFirst` keeps the most recent arrival at the right-hand end so
  a long run of formats stays on screen.
- `StruckLine` crosses out something in the interface, for the beats that show
  a wrong way before the right one.

The counterpart rule still holds: the second half of that episode is about
where files sit on your own machine, and no screenshot of the web app shows a
local folder, so `ModeAnatomy` draws it.

**A tight shot needs its own framing.** Two lessons from episode 5's
showcase beats. `useFocus` frames on `frameOn` whether or not a `region` is
given, while `ShowcaseScene` only draws an indicator when there is a
`region` — so omitting `region` holds the shot and leaves the frame to the
overlay, which is what you want when the overlay _is_ the content. And
because `fill` is capped by `MAX_UPSCALE`, asking for a very tight shot on a
small control just pins it at the cap: to pull back from a control you have
to drop `fill` below the cap, not raise it.

**Where a screen would leak, draw it instead.** Episode 3's narration walks
through the Microsoft sign-in and consent screens. Those carry a real
organisational address and tenant name, so `ConnectFlow` draws the four steps
rather than showing captures of them — the sequence is what the viewer needs,
and the credentials are not.

**Claims about the product come from the product.** `ModelLadder` uses the
picker's own one-line descriptions rather than written-up ones, so the video
cannot assert more about a model than the interface does. Its depth axis is a
relative position for reading the picture, not a measured score.

`StagedScene` swaps one illustration and caption at a time in step with the
voice, for the stretches that walk through several examples in a row. A list
would put them all on screen at once and let the viewer read ahead of the
narration.

### Check every frame before rendering

```bash
npm run smoke -- ClaudeSetup /tmp/smoke.mp4
```

A quarter-scale muted render of the whole timeline. It takes a few minutes and
it evaluates every frame, which is the point: a scene's _first_ frames are where
frame-derived arithmetic breaks, and spot-checking stills walks straight past
them.

The bug that prompted this: a graphic computed `Math.floor(local / hold)` as an
array index. Before its delay elapsed, `local` was negative, the index was −1,
and the render died 7,226 frames in — at a scene whose middle frames had all
been checked by hand and looked fine. Clamp both ends of any frame-derived
index, and smoke the timeline rather than sampling it.

### Redaction

The supplied screenshot contains real conversation titles and an account name.
`ShowcaseScene` blurs the conversation list and the account row by default —
see `DEFAULT_REDACTIONS`. The navigation items stay legible because the video
teaches them. Pass `redact={[]}` to turn it off, or add regions to cover more.

### Recalibrating after a screenshot change

`src/dev/` holds two development-only compositions, not part of the video:

- `Calibration` renders a screenshot under a labelled percentage grid, so
  coordinates can be read straight off it.
- `RegionCheck` draws every region of a screen as a labelled box over the
  screenshot, so a whole map is verified in one still rather than by rendering
  the video and watching where the rings land.
- `UIKitDemo` exercises every indicator at once.

Both take a screen name, so any screenshot in the registry can be checked:

```bash
npx remotion still Calibration out/grid.png --props='{"screen":"settings"}'
npx remotion still RegionCheck out/map.png  --props='{"screen":"settings"}'
```

## Platform showreels

Two capability films live in this repo — one per authoring model.

| Film                          | How to render                                                                             | Length                     |
| ----------------------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| Remotion (`RemotionShowreel`) | `npm run render:showreel`                                                                 | ~2:48 · 1920×1080 · 30 fps |
| HyperFrames                   | `cd hyperframes-showreel && npx hyperframes render --output out/hyperframes-showreel.mp4` | 2:48 · 1920×1080           |

The Remotion reel walks `spring` / `interpolate`, `@remotion/transitions`, shapes and paths, noise, motion-blur trails, React Three Fiber, `@remotion/effects`, captions, audio visualization, Lottie, and GIF. The HyperFrames reel is a nested-composition project under `hyperframes-showreel/` that mixes custom GSAP scenes with catalog blocks (`code-typing`, `data-chart`, `world-map`, `flowchart`, `yt-lower-third`).

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
