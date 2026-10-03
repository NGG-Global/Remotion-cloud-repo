# Tiny Tempo launch trailer

Three cuts of one edit, built from the game's own footage and its own title theme.

| Composition ID | Frame | Length | For |
| --- | --- | --- | --- |
| `TinyTempoTrailer` | 1920×1080, 30 fps | 28.0 s (840 frames) | YouTube, store listing, press |
| `TinyTempoTrailerVertical` | 1080×1920, 30 fps | 28.0 s (840 frames) | Shorts, Reels, TikTok |
| `TinyTempoTeaser` | 1080×1920, 30 fps | 8.0 s (240 frames) | Social teasers |

## Status

**The compositions are complete; the gameplay recordings are not yet in the repository.**
`src/tiny-tempo-trailer/clipData.ts` is a labelled stub, and `public/tiny-tempo/clips/` is
empty, so rendering any of the three compositions fails until the capture has been run and
the manifest generated (the two commands under *How the gameplay was recorded*). The
music, the fonts, the badge and the game's rendered one-shots are in place.

In the cloud container the capture crashed Chromium's renderer with a V8 out-of-memory
after roughly 45–60 s of game time on a page, in three runs — first during level 1's
plaque, then during the fast-forward of levels 20 and 28. The page's own JS heap, DOM
counts and renderer RSS stay flat under the same scenario in isolation, and the same level
runs for 100 s on a real clock without incident, so the cause has not been pinned down; it
appeared only with three browsers recording at 3× device scale. Things to try on a machine
with a GPU: `WORKERS=1`, `DSF=2`, and dropping `--use-gl=swiftshader` from the launch
arguments in `tools/tiny-tempo/capture.mjs` so Chromium uses the host GPU.

Until the clips exist, the crops in `src/tiny-tempo-trailer/shots.ts` (`REGION`) and the
`at` offsets of the menu and map shots are first estimates from a frame of each screen and
need one review pass against the recordings. Nothing has been rendered or reviewed.

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
```

On a machine without Remotion's own Chrome, `remotion.config.ts` falls back to Playwright's
headless shell when it is present at the path written there; elsewhere pass
`--browser-executable`.

## Sources

Everything on screen is the game or Google's badge; nothing is drawn to look like the game.

| Asset | Origin | In this repository |
| --- | --- | --- |
| Music | `HOME_PAGE.wav`, the game's title theme as delivered (48 kHz, 24-bit, 64.000 s seamless loop) | `public/tiny-tempo/audio/home-page.wav` — the same audio at 16-bit, untrimmed |
| Gameplay | Tiny Tempo's dev build (`TinyTempo` checkout, `main` at b3a44fe), recorded by `tools/tiny-tempo/capture.mjs` | `public/tiny-tempo/clips/*.mp4`, with `*.json` sidecars of the game's own event times |
| Title screen | The game's `MenuScene`, recorded with its controls hidden | `public/tiny-tempo/clips/menuClean.mp4` |
| Act tiles (mosaic) | The game's website gallery, `legal/acts/{bongos,popcorn,barber,slushy,bell,doorbell}.mp4` at 4575832, recorded by the game's own `scripts/capture-acts.mjs` (432×532, 8 s, one task each, chrome hidden) | `public/tiny-tempo/clips/tile*.mp4`, byte-identical copies |
| Fonts | Fredoka and Nunito, the game's faces (OFL, from the game's `public/fonts/`) | `public/fonts/fredoka`, `public/fonts/nunito` |
| Google Play badge | Google's official `en_badge_web_generic.png` from play.google.com/intl/en_us/badges/ | `public/tiny-tempo/google-play-badge.png`, unmodified |
| App icon | `assets/icon/tiny-tempo-1024.jpg` from the game | `public/tiny-tempo/icon-1024.jpg` (reference only; not placed in the cut) |

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

| Clip | What it is |
| --- | --- |
| `level1` | Level 1, Hammer & nail, 120 BPM: the whole level from the first count-in to its plaque |
| `level5` | Level 5, Knife & tomato, 120 BPM: the first two tasks |
| `level9` | Level 9, Scissors & paper: tasks 4–5 at 125–126 BPM, tier 2 |
| `level19` | Level 19, DJ scratch: tasks 5–6 at 133–136 BPM, eight- and nine-hit phrases |
| `level28` | Level 28, Bug & shoe (second look): tasks 5–6 at 136–140 BPM, tier 4 |
| `level20` | Level 20, Trombone, the Pavement area's finale: its last two tasks at 134–138 BPM, then the plaque |
| `map` | The road at a seeded save (levels 1–19 cleared, 56 stars): the level-20 finale stage |
| `menu`, `menuClean` | The title screen, with and without its controls |
| `plaque20` | Level 20's result as a flawless clear: the Area complete plaque, through the debug panel's "Mastery result", which calls the same `showSummary` a played level reaches |

The mosaic uses the website's existing act tiles rather than new recordings: at the size
a mosaic tile is drawn (about 480 px wide on the 16:9 canvas, 460 on the 9:16) they are
within 1.1× of native, and the game's own recorder made them.

Regenerate with the game checked out beside this repository:

```bash
cd ../TinyTempo && npm ci && npm i --no-save playwright
cd ../Remotion-cloud-repo
TINY_TEMPO=../TinyTempo node tools/tiny-tempo/capture.mjs      # all shots, ~1 h on 4 cores
node tools/tiny-tempo/manifest.mjs                               # -> src/tiny-tempo-trailer/clipData.ts
```

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

| Bars | Wide (16:9) | Vertical (9:16) |
| --- | --- | --- |
| 1 | The hammer's demonstration, a 16:9 window on the act | Pushed in on the act and block |
| 2 | The whole screen: three taps, three Perfects; WATCH. REMEMBER. TAP. strike on beats 2, 4 and the fill's downbeat | The same, words in the paper above the act |
| 3–5 | One whole loop on the tomato — shown, copied, the slice falls — then the next task starts; a chip says Watch, then Tap | Full screen |
| 6 | Scissors at 125 BPM | Full screen |
| 7 | DJ scratch: the turn block fills the frame | Pushed in |
| 8 | Bug & shoe at 136 BPM, a tempo chip | Full screen |
| 9 | Six more acts land one per eighth note | 2×3 |
| 10 | The road: the finale stage, bunting, stars | Full screen |
| 11 | The finale's last task at 138 BPM; HOW FAR / CAN YOU / KEEP UP? | Words above |
| 12 | The plaque: medals, Area complete | Full screen |
| 13–14 | The title screen itself; Available now, the badge, on bar 14 | Badge on the bench |

Motion comes from the recordings. The trailer adds four things, all from the game's own
vocabulary: the stamped word (how the game strikes "3, 2, 1, Go!"), the cream chip (its
threshold chips), the slab with ink edge and thickness around a framed shot (its panels),
and the sheared paper curtain between the hook and the teach and before the title (its
scene curtain). No particles, no glow, no camera moves beyond a fixed crop.
