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

### Approach

Part 1 traced the slideshow look (V1–V5) to the rig and the sets. Patching them would not have fixed it, so the picture was rebuilt: a new camera, a new character rig, new sets, and one component per shot. The timeline idea, the fonts and the editorial rules were kept.

The draft's code is kept in the tree, unchanged, under `src/gacy/legacy/` for before-and-after comparison. Nothing imports it, and no composition renders it. It can be removed in review.

### What the film is built from now

| Layer | Where | What it does |
| --- | --- | --- |
| Timeline | `src/gacy/data/timeline.ts` | `SHOTS` (100 shots: id, start in seconds, component, entrance, exit), `WIPES` (35 object wipes), `LABELS` (15 labels). Every time is seconds into the MP3. |
| Shot clock | `src/gacy/engine/shot.tsx` | Each shot gets `t` = seconds since its narration start, so every beat inside a shot is written against the voice, not against a fraction of the scene. |
| Camera | `src/gacy/engine/camera.tsx` | A multiplane pinhole camera at world scale (200 units per metre). Planes scale and move by their depth, so parallax, occlusion and push-ins come from one camera move. Ground is projected between depths, not drawn as a flat band. |
| Look | `src/gacy/engine/look.tsx`, `color.ts` | Per-shot light (`lit()`), grain, vignette, haze, and a Super 8 treatment for home-movie material. |
| Wipes | `src/gacy/engine/wipes.tsx` | Transitions carried by objects crossing the lens (a van, a passer-by, a car trunk, a folder, a floorboard, a door, a torch beam, a camera flash, darkness). |
| Characters | `src/gacy/rig/` | A forward-kinematics rig with two-bone IK arms. Three views, builds from child to heavy, hair and clothing, idle breathing and blinks, talking, gestures, a walk cycle whose stride matches the distance covered (no foot sliding), sitting, kneeling, crawling, carrying, digging. Silhouette and court-sketch modes. The cast is in `cast.ts`. |
| Sets and props | `src/gacy/kit/` | The suburb and the Gacy house, the house cross-section with the crawl space, interiors, the pharmacy, the police station, a car interior, the courtroom, the archive and the DNA lab, paper inserts (files, photos, receipt, notebook), vehicles, sky and light. |
| Shots | `src/gacy/shots/` | Eleven files, one per act: `Opening`, `EarlyLife`, `PublicLife`, `Vanishings`, `Underneath`, `Piest`, `Investigation`, `Discovery`, `Trial`, `Ending`. |

### Timing

- The cut is re-timed from the local word timestamps and the measured voice envelope (Part 1). The final check measured the decoded audio at every one of the 99 cuts: at each cut the voice is below 12 % of its speech level, inside a quiet stretch of at least 90 ms (median 860 ms). No shot changes in the middle of a word. That check found eight cuts that had landed on speech; they were moved into the nearest pause (`docs/VIDEO_QA.md`, section 2).
- Shots average 6.45 s. The shortest (0.9–1.7 s) are the home-movie run at 10:18 ("ordinary man, contractor, employer, neighbour, host"), cut word by word. The longest (15–22 s) are the continuous camera moves: the descent into the crawl space, the crawl-space tour, the smell sequence.
- Transitions: 35 object wipes, 7 dissolves, 15 fades up from black (most after a fade to black at the end of an act), and straight cuts elsewhere.
- The composition is still `ceil(645.302857 × 30) = 19360` frames, and `public/audio/gacy-narration.mp3` is still a byte-identical copy of the root MP3. Neither source file in the repo root was modified.

### Status of each finding

| # | Status | What changed |
| --- | --- | --- |
| T1 | Fixed | Sets extend past every camera move. 500 stills (five per shot) show no void frames. The only near-black frames are the deliberate fades at act breaks. |
| T2 | Fixed | No finite backdrop is framed past its edge. Ground planes are projected and clipped at the lens. |
| T3 | Fixed | All boundaries moved into measured pauses. The pharmacy now appears at 296.8 s, after "…worked there". The Chicago, Iowa and business beats follow the words. |
| T4 | Fixed | Every beat is its own shot with a defined entrance. Motion inside a shot is keyed to narration time and eased. |
| T5 | Fixed | The stage draws planes back to front by depth. Characters are placed on planes, not drawn over sets. |
| T6 | Fixed | One world scale: 2.5 m walls, people 1.3–1.9 m, cars and vans at real size, paper at insert scale. |
| T7 | Fixed | Labels are light serif type in the bottom-right title-safe area. Every label has a soft shadow, so it also holds on light backgrounds. |
| T8 | Fixed | Most shots have three to six depth planes: background, set, characters, foreground and atmosphere. |
| T9 | Fixed | Wheels rotate by the distance the vehicle travels. |
| T10 | Fixed | The draft's dead geometry is no longer rendered. |
| V1 | Fixed | Shots are staged with a camera move, a foreground and a lit set. Five-frame checks per shot show change within every shot. |
| V2 | Fixed | New rig (see above). People walk to places, reach for things, carry boxes, shake hands, turn their heads, sit, kneel and dig. |
| V3 | Fixed | Depth planes, occlusion, light pools, haze and vignettes. |
| V4 | Fixed | Events are staged instead of symbolised: a receipt found in a kitchen, a warrant signed, a hatch opened with a torch, a verdict slip passed, a file stamped and boxed, a DNA trace and a family tree on a lab screen. |
| V5 | Fixed | Sets rebuilt with furniture, fixtures and practical light: the pharmacy (counter, shelves, clock, door), the courtroom (bench, witness box, jury box, counsel tables, gallery), the crawl space (joists, soil, vents, trenches). |
| V6 | Fixed | Dark passages now carry a lit subject: a lamp, a torch beam, a window or a vigil candle. |
| V7 | Fixed | The suburb set is reused for continuity, but at different times of day, seasons, heights and distances. |
| S1 | Fixed | The opening pushes down a night street to the house, sees the ordinary day (paper, van, party, handshake, job site), then drops through the floor, past the pipes, into the crawl space, and rises back to the lit street under the title. |
| S2 | Fixed | The ending is the identification work: the file reopened in 2011, eight blank files, the DNA lab, three names typed, five files left blank. The last shot is those five files under a lamp. The Pogo photo is turned face down before it. |
| S3 | Fixed | Robert Piest at work, his mother arriving, the conversation, the summer job, "a few minutes", then the wait: the clock, the counter and the empty entrance. Nothing that happened to him is shown. |
| S4 | Fixed | The investigation is 14 shots, most of them short: report, notebook, filing cabinet, the Iowa record, warrant, search, receipt, "not letting go", stakeout, the invitation inside, the smell, the decision to go back, the police return. |
| S5 | Fixed | The smell is its own quiet beat: one officer stops mid-conversation, the room loses colour and darkens around him, and the camera drops to the heating register, where a faint haze rises. |
| S6 | Fixed | The hatch is opened and searched by torchlight. Markers appear one at a time, then more, then the full count across the plan. "33" appears briefly and dissolves into 33 standing silhouettes. |
| S7 | Fixed | The workers digging the "drainage" trenches and the police dig use the same framing (`TRENCH_CAM` in `shots/Underneath.tsx`). |
| S8 | Fixed | The makeup is applied by hand at a dressing table. The Pogo section is built on the mirror: the camera finds Gacy's reflection turning into Pogo. |
| S9 | Fixed | There is no subscribe caption. The channel ask plays over the cinema sequence, with no text. |
| S10 | Fixed | Minor facts get short shots, and the turn "he did it in front of everyone" gets its own shot (`in-front`). |
| S11 | Fixed | Each date appears once, as a label, on the beat where the voice says it. |

### Editorial choices

- **Text.** 15 labels in the whole film, each one to three words: names, places, dates, the number 5. Other words on screen are props inside the picture (a shop sign, a folder tab, a stamp, the three names typed on files). There are no subtitles and no sentences.
- **The clown.** Pogo appears only where the narration talks about the costume or its image: the opening home movie and makeup, the Hollywood version on TV, the costume in the closet, the mirror, the public appearances, the corkboard of 1970s clowns, the drive-in, the news graphic and posters near the end, and the photo turned face down. Everywhere else Gacy is an ordinary heavyset man.
- **Victims.** No victim has a face. Missing-person flyers carry a blank silhouette, the "33" beat is anonymous silhouettes, and the unidentified victims appear only as files with a blank card. A card warms when a name is typed on it.
- **Violence.** No murder, no body and no execution is shown. The crawl space shows soil, trenches and markers. The execution is a candle vigil outside the prison wall on 10 May 1994.

### Framing pass

The first full render (720p) showed framing faults: subjects off centre; heads, arms and bodies cut by the frame edge in held frames; the room above the crawl space cutting people at the chest; and sets ending inside the frame (the pharmacy's front wall, and black above the wall in interiors taller than the room). 53 shots were reframed, and the shared interior set now has a ceiling. Two home-movie clips near the end (`saw-ordinary`, `saw-employer`) replay changed shots and inherit their fixes. A debug mode now logs where every character's head lands on screen, and `tools/framing-report.mjs` lists the cut heads. The method, the shots changed and the checks are in `docs/VIDEO_QA.md`, section 7. The 720p file rendered before this pass does not include the fixes.

### Limitations

- **Illustration, not reconstruction.** Sets, floor plans, the hatch position, the police-car livery, the courtroom, the archive, the lab and every face are illustrative. None of them is based on a photograph or a record. The 2011 investigator is a composite character.
- **Facts that may have changed.** The count of unidentified victims (five) and the three names follow the script. Identifications have continued since 2011, so these should be checked against the Cook County Sheriff's Office before publication. The DNA trace and the family tree on the lab screen are generic illustrations, not case data.
- **No stated times.** Clocks in the pharmacy and the jury room have no numerals and do not show a particular time, because the script gives none.
- **Lip movement.** Mouths move when a character talks, but they are not synced to any speech. No dialogue is heard; the narration is voice-over.
- **Reused shots.** The home-movie run at 10:18 deliberately replays four opening shots through the Super 8 filter, as a callback. One clip (the neighbour at the fence) is new.
- **Render cost.** A 1080p frame takes about 1.6 s to render in this 4-core container. The full film is 19360 frames, so a full-resolution render takes several hours here. `docs/VIDEO_QA.md` lists what was rendered and how long it took.
- **Dark passages.** Night, crawl-space and prison shots are dark by design. They were checked on the stills, but they should also be watched on the target display.
- **Draft code.** The draft is kept in `src/gacy/legacy/` (see Approach). It still passes the type check and the linter, but no composition uses it.

