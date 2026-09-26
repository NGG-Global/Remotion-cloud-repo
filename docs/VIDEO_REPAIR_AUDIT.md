# Gacy documentary: repair audit

Composition: `GacyDocumentary` (1920×1080, 30 fps).
Master timeline: `public/audio/gacy-narration.mp3` (byte-identical copy of `ElevenLabs_John_Wayne_Gacy_מאחורי_הסיוט.mp3`, 645.30 s).
Master script: `John_Wayne_Gacy_ElevenLabs.pdf` (3 pages, Hebrew).
Audited draft: branch `cursor/gacy-documentary-6cf7`, commits `aad28f4` and `240aa9e`. This branch is fast-forwarded onto it, so the history is kept.

This document has two parts. **Part 1** is the audit of the draft as found, written before any code changed. **Part 2** records what changed, and what is still limited. Part 2 is updated at the end of the work.

---

## Part 1: The draft as found

### How it was inspected

- Read every file under `src/gacy/` (18 scene components in 9 files, the character rig, presets, scenery, stage, motion, timeline, fonts).
- `npx tsc`: passes. `npx eslint src/gacy`: passes. `npx remotion compositions`: `GacyDocumentary` registers at 19360 frames.
- Rendered 90 stills at half scale: five per scene, at 2 %, 25 %, 50 %, 75 % and 98 % of each scene. Built three contact sheets. Rendered two frames at full scale to check type.
- Transcribed the MP3 locally with faster-whisper (`large-v3-turbo`, Hebrew, word timestamps; the audio did not leave the machine). The transcript matches the PDF script almost word for word, which gives 1364 timed words to check scene boundaries against.
- Measured the voice envelope from the decoded audio. The first speech is at 0.10 s and the last at 644.60 s.

### Severity scale

- **CRITICAL**: the video is visibly broken, or the story cannot be followed.
- **HIGH**: it looks like a slideshow, or it contradicts the narration or the brief.
- **MEDIUM**: it weakens a sequence noticeably, but the sequence still works.
- **LOW**: polish.

### Technical failures

| # | Severity | Finding |
| --- | --- | --- |
| T1 | CRITICAL | **Black frames.** In `Crawl`, the camera moves to `camY = 640` at zoom 1.05 while the cutaway only reaches y ≈ 1200 on one side. Around 247 s (frame 7416) the whole frame is void black for several seconds. |
| T2 | CRITICAL | **Visible world edges.** Scenes draw finite background rectangles and then zoom or pan past them. The edge of the world shows as a hard black band in `Search2` (the "33" beat sits inside a visible box), `Piest` (right edge), `Ending` (lawn stops mid-frame, left side is void), and `Suburb`. |
| T3 | HIGH | **Scene boundaries off the voice.** The comments say the edges were "mapped onto detected speech", but measured against the transcript several are wrong. Chicago→Iowa is 3.9 s late ("in the sixties he moved to Iowa" plays over the Chicago skyline). Iowa→business is 5.0 s late. Suburb→Piest is **7 s early**: the pharmacy appears while the voice is still saying "people came in, ate, talked, worked there". The reveal "…John Wayne Gacy" (326.8–330.8 s) plays over the police scene instead of the pharmacy. |
| T4 | HIGH | **Hard cuts inside scenes.** Most scenes switch sub-shots with boolean flags (`t < dur * 0.22 ? …`). Every internal change is a one-frame pop, and each lands at an arbitrary fraction of the scene rather than on a word. |
| T5 | HIGH | **Z-order errors.** In `Ending`, the house is drawn after the characters, so Gacy's head pokes out above the roof. In `Opening`, a dirt "crawl space" block is drawn on top of the lawn in front of the houses for the whole scene. |
| T6 | MEDIUM | **Scale.** People are drawn about as tall as the ranch houses behind them. A sedan in `Piest` is smaller than a person's torso and is parked *inside* the pharmacy. |
| T7 | MEDIUM | **Contrast.** White captions sit on the off-white pharmacy wall and can't be read. |
| T8 | MEDIUM | **Parallax is defined but hardly used.** `Layer` exists, but only the opening sky uses it. Every other element sits on one plane. |
| T9 | LOW | **Wheel spin ignores speed.** `Car` rotates its wheels at a constant rate whether or not the car is moving. |
| T10 | LOW | `Ranch` keeps an invisible `focus` rectangle (`opacity={0.0}`); `Cuffs` draws a dead stroke. Dead geometry. |
| OK | — | Composition length is `ceil(645.302857 × 30) = 19360` frames = 645.33 s. That matches the narration, and the MP3 plays from frame 0 with no offset. The file carries a 0.025 s encoder delay, which is normal for MP3 and inaudible. No `Math.random`, no network requests, no CSS animations. Fonts are self-hosted and load correctly (Hebrew renders). |

### Visual failures

| # | Severity | Finding |
| --- | --- | --- |
| V1 | CRITICAL | **It reads as a slideshow.** Almost every shot is a flat colour field with two to four small figures standing in a row on one ground line, and 60–80 % of the frame is empty sky or wall. In `Business` and `Trial`, the five sample frames are nearly identical. |
| V2 | CRITICAL | **Characters are frozen cutouts.** The rig is rectangles for limbs and a circle head with child proportions (the head is about 1/4 of the body). Poses are fixed per shot. Only a sine "breath" and a sine arm swing move. Nobody walks anywhere: `pose="walk"` animates legs while `x` stays constant, so people moonwalk on the spot. Nobody looks at anyone. |
| V3 | HIGH | **No depth.** There is no foreground, no occlusion, no light falloff, and no atmosphere beyond a vignette. The sets are one plane. |
| V4 | HIGH | **Symbols instead of events.** Evidence is a floating document with a stamp, the verdict is a "GUILTY" stamp, the Pogo photo is a red square with a white dot, the DNA is a sine ladder, and the execution is a dark rectangle. |
| V5 | HIGH | **Crude sets.** The pharmacy is a white wall with a shelf and a black bar. The courtroom is two brown bands. The crawl space is a brown rectangle with five dark rounded boxes. |
| V6 | MEDIUM | **Too much empty darkness.** Several stretches of 5–15 s (`missing` phases 2–3, `people`, `execution`) are near-black frames with one tiny prop in the centre. |
| V7 | MEDIUM | **Repetitive staging.** The same side-on "house on a ground line with people beside it" composition is used for opening, suburb, watch, subscribe, ending, police-at-house and Iowa-return. |

### Storytelling failures

| # | Severity | Finding |
| --- | --- | --- |
| S1 | CRITICAL | **The opening doesn't do its job.** The first 68 s are one long sideways pan past a costume on a stand, people and a mixer, then a dip to black. The camera never goes down through the house into the crawl space, so the core idea (ordinary life above, horror beneath) is never shown. |
| S2 | HIGH | **The ending contradicts the brief.** The final shot brings Pogo *back* into frame beside Gacy and ends on Gacy in front of the house. The five unidentified victims appear only as dark squares with a "—" and one caption. |
| S3 | HIGH | **The Piest sequence has no clarity.** Robert, Gacy and his mother stand in a row in a white room with a car inside it. There is no arrival, no conversation, no exit, no waiting and no empty doorway. The clock spins, but nothing else reads as time passing. |
| S4 | HIGH | **The investigation doesn't escalate.** It is two figures and two floating papers, then two figures by the house. There is no notebook, record, warrant service, receipt, search, stakeout car or following. The shots are as long as everywhere else. |
| S5 | HIGH | **There is no smell beat.** Gacy and a detective stand in a brown room, and the only change is `expression="uneasy"`. |
| S6 | HIGH | **Discovery and "33" are a grid of triangles.** The markers pop onto a flat brown field in a 6×3 grid, and "33" is typed above them. There is no access panel, no flashlight searching, and no build of scale. The narration then says the number mustn't become a scoreboard, while the picture is a scoreboard. |
| S7 | HIGH | **No visual callback.** The workers digging "drainage" trenches and the police digging later are not in the same space or framing. |
| S8 | MEDIUM | **Weak Pogo section.** Makeup is a white ellipse floating over a face. The performance is a clown in front of three black silhouettes. The "retroactive creepiness" beat is a red square. |
| S9 | MEDIUM | **The subscribe caption.** "הירשמו" is typed on screen during the channel ask, which the brief rules out. |
| S10 | MEDIUM | **Minor facts get equal weight.** The fast-food restaurants, the 1968 conviction and the 1970 release each get a flat equal slice (`dur * 0.22` …). The key turn ("he did it in front of everyone") gets no picture. |
| S11 | LOW | Captions show dates the voice has already said, several of them twice ("1968" as a stamp and as a caption at once). |

### What was worth keeping

- The idea of the MP3 as the only clock, with times in seconds (`data/timeline.ts`). Kept, but re-timed from measured word times.
- The self-hosted fonts (`fonts.ts`). Kept as is.
- The deterministic `hash()` and the eased `keys()` keyframe helper (`motion.ts`). Kept and extended.
- The palette direction (`theme.ts`): warm practical light against a cold night. Kept, but expanded into a lit, layered set.
- The editorial rules in `docs/VIDEO_NOTES.md`: voice only, no gore, the clown kept rare. Kept.

Everything else under `src/gacy/` failed on the rendered result, and the rig and sets are the root cause of V1–V5. The rendered frames show that patching them would not remove the slideshow look, so they are replaced (see Part 2).

---

## Part 2: What changed

_Filled in at the end of the repair; see below._
