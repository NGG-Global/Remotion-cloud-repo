# Tiny Tempo launch trailer

Three cuts of one edit, built from the game's own footage and its own title theme.

| Composition ID             | Frame             | Length              | For                           |
| -------------------------- | ----------------- | ------------------- | ----------------------------- |
| `TinyTempoTrailer`         | 1920×1080, 30 fps | 28.0 s (840 frames) | YouTube, store listing, press |
| `TinyTempoTrailerVertical` | 1080×1920, 30 fps | 28.0 s (840 frames) | Shorts, Reels, TikTok         |
| `TinyTempoTeaser`          | 1080×1920, 30 fps | 8.0 s (240 frames)  | Social teasers                |

## Status

All three cuts are rendered and reviewed frame by frame. The footage is in
`public/tiny-tempo/clips/` and `clipData.ts` is generated from it.

Two faults in this repository were found on the way, and both affect any composition here,
not only this one.

- **A bare `import "./fonts"` is dropped by the bundler.** `package.json` declares
  `"sideEffects": ["*.css"]`, so a TypeScript module imported only for what it does on load
  is tree-shaken out, and every word renders in the browser's fallback serif. The trailer
  loads its faces through `useTrailerFonts()`, which holds each frame until both are in.
  `src/tiny-tempo/TinyTempoAd.tsx` still uses the bare import and is affected.
- **Tailwind's preflight caps every `img` at `max-width: 100%`.** `OffthreadVideo` renders
  an `img`, so a recording drawn wider than its box — any push-in — was shrunk and left
  bare paper at the edge. `GameClip` sets `maxWidth: "none"`.

## Render

```bash
# Review-quality H.264
npx remotion render TinyTempoTrailer out/tiny-tempo-trailer.mp4
npx remotion render TinyTempoTrailerVertical out/tiny-tempo-trailer-vertical.mp4
npx remotion render TinyTempoTeaser out/tiny-tempo-teaser.mp4

# Delivery quality (PNG frames, CRF 16)
npm run render:hq -- TinyTempoTrailer out/tiny-tempo-trailer.mp4

# One frame
npx remotion still TinyTempoTrailer out/frame.png --frame=600

# Review stills of several frames from one bundle (scale 0.5 unless SCALE is set)
node tools/tiny-tempo/stills.mjs out/stills TinyTempoTrailer:30,445 TinyTempoTeaser:150

# Delivery loudness: -16 LUFS, true peaks under -1 dBTP; the picture is copied untouched
node tools/tiny-tempo/master-audio.mjs out/tiny-tempo-trailer.mp4
```

The render keeps the title theme at the level it was delivered, about -21.5 LUFS. Platforms
turn loud uploads down but not quiet ones up, so the delivery files are the `-master.mp4`
versions: +5.7 dB of gain, with a limiter that takes about 3 dB off the few transients the
gain pushes over. Each 28 s cut takes about 20 minutes to render on 4 cores.

On a machine without Remotion's own Chrome, `remotion.config.ts` falls back to Playwright's
headless shell when it is present at the path written there; elsewhere pass
`--browser-executable`.

## Sources

Everything on screen is the game or Google's badge; nothing is drawn to look like the game.

| Asset              | Origin                                                                                                                                                                                                   | In this repository                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Music              | `HOME_PAGE.wav`, the game's title theme as delivered (48 kHz, 24-bit, 64.000 s seamless loop)                                                                                                            | `public/tiny-tempo/audio/home-page.wav` — the same audio at 16-bit, untrimmed         |
| Gameplay           | Tiny Tempo's dev build (`TinyTempo` checkout, `main` at b3a44fe), recorded by `tools/tiny-tempo/capture.mjs`                                                                                             | `public/tiny-tempo/clips/*.mp4`, with `*.json` sidecars of the game's own event times |
| Title screen       | The game's `MenuScene`, recorded with its controls hidden                                                                                                                                                | `public/tiny-tempo/clips/menuClean.mp4`                                               |
| Act tiles (mosaic) | The game's website gallery, `legal/acts/{bongos,popcorn,barber,slushy,bell,doorbell}.mp4` at 4575832, recorded by the game's own `scripts/capture-acts.mjs` (432×532, 8 s, one task each, chrome hidden) | `public/tiny-tempo/clips/tile*.mp4`, byte-identical copies                            |
| Fonts              | Fredoka and Nunito, the game's faces (OFL, from the game's `public/fonts/`)                                                                                                                              | `public/fonts/fredoka`, `public/fonts/nunito`                                         |
| Google Play badge  | Google's official `en_badge_web_generic.png` from play.google.com/intl/en_us/badges/                                                                                                                     | `public/tiny-tempo/google-play-badge.png`, unmodified                                 |
| App icon           | `assets/icon/tiny-tempo-1024.jpg` from the game                                                                                                                                                          | `public/tiny-tempo/icon-1024.jpg` (reference only; not placed in the cut)             |

### How the gameplay was recorded

The game draws every frame from its audio clock and a headless browser renders far below
30 fps, so real-time screen recording would drop most frames. `tools/tiny-tempo/capture.mjs`
runs the game's Vite dev build in headless Chromium on a virtual clock — Playwright's fake
timers drive `performance.now` and `requestAnimationFrame`, `AudioContext.currentTime` is
made to read the same clock — and steps exactly 1/30 s per screenshot. It is the technique
the game's own `scripts/capture-acts.mjs` uses for its website. The debug auto-player
(`?debug&level=N`, DEV builds only) answers each target on time, so the verdicts, the
flourishes, the plaque and the "Area complete" ribbon are what the shipped game draws for a
clean round. Nothing is composited into the frames.

Recorded at a 9:16 viewport (404×718 CSS px at 3×, so 1212×2154), where the game's logical
box is exactly its 720×1280 design box.

| Clip                | What it is                                                                                                                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level1`            | Level 1, Hammer & nail, 120 BPM: the whole level from the first count-in to its plaque                                                                                                                                                              |
| `level5`            | Level 5, Knife & tomato, 120 BPM: its first three tasks                                                                                                                                                                                             |
| `level9`            | Level 9, Scissors & paper: task 4 at 125 BPM, then task 5                                                                                                                                                                                           |
| `level19`           | Level 19, DJ scratch: task 4 at 130 BPM, then task 5 at 133                                                                                                                                                                                         |
| `level20`           | Level 20, Trombone, the Pavement area's finale: task 4 at 131 BPM, then task 5 at 134                                                                                                                                                               |
| `level28`           | Level 28, Bug & shoe (second look): task 4 at 132 BPM, nine hits over two bars, then task 5 at 136                                                                                                                                                  |
| `plaque20`          | Level 20's result as a flawless clear — the Area complete plaque — through the debug panel's "Mastery result", which calls the same `showSummary` a played level reaches; raised after the first demonstration, so the finale's title card has left |
| `map`               | The road at a seeded save (levels 1–19 cleared, 56 stars): the level-20 finale stage                                                                                                                                                                |
| `menu`, `menuClean` | The title screen, with and without its controls                                                                                                                                                                                                     |

The recorder starts on the first task it can reach a moment ahead of, which was sometimes a
task later than asked for; every shot reads the task its recording holds (`first()` in
`shots.ts`), so the trailers follow what was recorded, not what was requested.

The mosaic uses the website's existing act tiles rather than new recordings: at the size
a mosaic tile is drawn (about 480 px wide on the 16:9 canvas, 460 on the 9:16) they are
within 1.1× of native, and the game's own recorder made them.

Regenerate with the game checked out beside this repository:

```bash
cd ../TinyTempo && npm ci && npm i --no-save playwright
cd ../Remotion-cloud-repo
TINY_TEMPO=../TinyTempo node tools/tiny-tempo/capture.mjs      # all shots, about 1 h on 4 cores
node tools/tiny-tempo/manifest.mjs                               # -> src/tiny-tempo-trailer/clipData.ts
```

Three things the recorder works around, each of which cost a run to find:

- **The game's `dashes()` can loop for ever at this viewport's scale.** In `ui/path.ts` the
  last sliver of a dash can fall under the floating-point precision of the position it is
  added to; `along` stops moving and the loop pushes spans until V8 runs out of heap. The
  result plaque's threshold chips call it, so every recording that reached a plaque
  crashed the renderer. The recorder serves `ui/path.ts` with a one-line guard; the game
  itself is untouched, and the same stall is presumably reachable on a device whose scale
  lands on the same values. Worth a fix in the game.
- **Frames go through `Page.captureScreenshot`.** The switch from Playwright's
  `page.screenshot` was made while chasing the crash above, before its cause was found;
  `page.screenshot` was never shown to be at fault, and either should work.
- **A task's plan can appear only a beat ahead of its demonstration**, under half a second
  at 125 BPM, so the lead a shot waits for is set per shot (level 9's is 0.2 s).

## The music, and why the cut is where it is

The theme is exactly 120.00 BPM (measured by onset autocorrelation across the whole file,
with the beat phase stable to ±4 ms over 64 s), its beats on the 0.5 s grid from sample 0,
downbeats on even seconds: 32 bars. By bar: 1–6 a sparse intro with bass hits on the odd
bars; 7–8 a build, bar 8 the fill; 9–16 the drop, full groove; 17–24 a second section with
a lead melody from bar 19; 25–30 a breakdown with the track's loudest hits; 31–32 the
turnaround into the loop.

The trailers take **bars 7–20** (12.0–40.0 s of the file): the two-bar build makes the
hook, the drop at bar 9 lands on the teach, the groove carries the escalation, and the
lead's entry at bar 19 is where the title card arrives. The teaser takes **bars 8–11**
(14.0–22.0 s): the fill under the demonstration, the drop under the answer. Nothing is
time-stretched or pitch-shifted; the only edit to the music is a trim in and a fade over
the last beat and a half, after the badge is on screen.

Tiny Tempo is itself authored at 120 BPM and every level starts there, so the hook and
teach shots are placed with the game's downbeat on the music's: the hammer's three blows
and the player's three Perfects fall on the beat. Faster tasks (125–138 BPM) drift against
the track, so those shots are short — one or two bars, starting on a downbeat.

## The edit

| Bars  | Wide (16:9)                                                                                                                                          | Vertical (9:16)                                                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1     | The hammer's demonstration, a 16:9 window on the act; WATCH. on beat 2, REMEMBER. on beat 4                                                          | The full screen, words in the paper above the act                                          |
| 2     | The answer on the full screen, right of centre: three taps, three Perfects; TAP. on the downbeat                                                     | The same shot continuing                                                                   |
| 3–5   | One whole loop on the tomato at 120 BPM — shown, copied, the slice falls, _Flawless!_ — a chip says Watch, then Tap; cut on the next task's downbeat | Full screen                                                                                |
| 6     | Scissors & paper at 125 BPM                                                                                                                          | Full screen                                                                                |
| 7     | DJ scratch at 130 BPM: the turn block fills the frame                                                                                                | Pushed in on deck and block                                                                |
| 8     | Bug & shoe at 132 BPM, nine hits, a tempo chip                                                                                                       | Full screen                                                                                |
| 9     | Six more acts land one per eighth note, 3×2                                                                                                          | 2×3                                                                                        |
| 10    | The road: the level 20 finale stage                                                                                                                  | Full screen                                                                                |
| 11    | The finale's task at 131 BPM; HOW FAR / CAN YOU / KEEP UP?                                                                                           | Two lines between the bunting and the act                                                  |
| 12    | The plaque drops, three medals strike, Area complete                                                                                                 | Full screen                                                                                |
| 13–14 | The title screen as a slab; Available now and the badge on bar 14                                                                                    | The full title screen; the CTA on the bench, above the bottom fifth Shorts and Reels cover |

The teaser is bars 8–11 of the track: the hammer's demonstration under the fill (WATCH.),
the answer on the drop (TAP.), the bug at 132 BPM (KEEP UP.), then the title and the badge.

Motion comes from the recordings. The trailer adds four things, all from the game's own
vocabulary: the stamped word (how the game strikes "3, 2, 1, Go!"), the cream chip (its
threshold chips), the slab with ink edge and thickness around a framed shot (its panels),
and the sheared paper curtain between the hook and the teach and before the title (its
scene curtain). No particles, no glow, no camera moves beyond a fixed crop.
