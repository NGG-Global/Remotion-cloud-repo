# Gacy documentary: QA record

What was rendered and checked for the repaired `GacyDocumentary`, how, and with what result. The defects found and fixed are listed at the end of each section.

All checks ran in the 4-core Linux cloud container used for the repair: Remotion 4.0.522, Chrome Headless Shell, SwiftShader GL (`--gl=swangle`). The stills and clips were written to `.cache/qa/`, which is git-ignored, so they are not in the repository. Section 5 has the commands to regenerate them.

**How the rendered material was reviewed.** I cannot watch video or listen to audio directly. Every visual check below was done on rendered frames: stills rendered from the composition, and frames decoded from the rendered MP4 clips (one per second, plus runs of consecutive frames to check motion). Every audio check was done numerically, by cross-correlating the clips' audio with the source MP3. A person should still watch the film once end to end for pacing, and on the target display (see section 7).

---

## 1. Static checks

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npx tsc` | Passes, no errors. |
| Lint | `npx eslint src/gacy` | Passes, no warnings. |
| Registration | `npx remotion compositions` | `GacyDocumentary`: 30 fps, 1920×1080, 19360 frames (645.33 s). Also registered: the dev helpers `GacySetTest` and `GacyRigSheet`. |
| Determinism | search `src/gacy` (outside `legacy/`) for `Math.random`, `http://`, `https://`, `@keyframes`, CSS `animation:` | No matches. Variation comes from the seeded `hash()` and `noise()`. |
| Browser console | the final 500-still pass, rendered with `LOGS=1` | Nothing logged: no errors, no warnings. (During the build, this is how an SVG `rect` with a negative height was found and fixed.) |

## 2. Audio and sync

### Source files

| Check | Result |
| --- | --- |
| `ElevenLabs_John_Wayne_Gacy_מאחורי_הסיוט.mp3` vs `public/audio/gacy-narration.mp3` | Byte-identical (MD5 `a63f058d67e32bbda3b7375c5c1770a9`). |
| Source MP3 and PDF in the repo root | Unchanged across the whole repair (`git diff` against the commit before the audit shows no change). |
| Narration length (ffprobe) | 645.302857 s, MP3, 44.1 kHz, mono. |
| Composition length | `ceil(645.302857 × 30)` = 19360 frames = 645.33 s. The narration ends inside the last frame. |
| Speech span | First speech at 0.10 s, last at 644.60 s (voice envelope). The last shot fades to black over its final 0.8 s, which starts as the last word ends. |
| Cut placement | Measured on the decoded narration (20 ms RMS, every 10 ms) at all 99 cuts. The first run found eight cuts on speech: `driveway` 37.4, `parade` 135.75, `flyers` 175.75, `cabinet` 342.4, `record` 344.9, `police-return` 406.2, `knew-exactly` 514.5 and `verdict` 527.4 s. Each was moved into the nearest pause (38.25, 136.1, 175.84, 343.2, 345.25, 406.8, 514.95 and 527.9 s), with its wipe, and the notebook's "GACY" was retimed onto the word "name". After the move, the voice is below 12 % of speech level at every cut, inside a quiet stretch of at least 90 ms (`flyers`, a word boundary) and 860 ms at the median. |

### Rendered sync

Each review clip's audio was decoded and cross-correlated, sample by sample, with the same span of the source MP3.

| Clip | Offset (clip audio vs source) | Correlation |
| --- | --- | --- |
| 01-opening | +42.7 ms | 0.984 |
| 02-descent | +42.7 ms | 0.977 |
| 03-public-life | +42.7 ms | 0.980 |
| 04-pogo-mirror | +42.7 ms | 0.986 |
| 05-crawl-space | +42.7 ms | 0.981 |
| 06-piest | +42.7 ms | 0.986 |
| 07-investigation | +42.7 ms | 0.976 |
| 08-discovery | +42.7 ms | 0.980 |
| 09-trial | +42.7 ms | 0.982 |
| 10-names | +42.7 ms | 0.981 |
| 11-ending | +42.7 ms | 0.983 |

The offset is the same in every clip, including clips that start deep into the file, so there is no drift and no timeline error. Two controls isolate the cause:

- The same span of the MP3 encoded directly to AAC with ffmpeg: **0 ms** offset.
- A 4-second render of the composition to ProRes with PCM audio (`--codec=prores --audio-codec=pcm-16`): **0 ms** offset, correlation 1.000. The composition's audio is sample-exact.

So the 42.7 ms (2048 samples at 48 kHz, the size of the AAC encoder's priming) is added when Remotion encodes AAC into the H.264 MP4. ffmpeg, which applies MP4 edit lists by default, still decodes it 42.7 ms late, so the file most likely does not signal the priming. Decoded this way, the voice in an H.264/AAC file from this setup runs about 43 ms (1.3 frames) behind the picture. Other players were not tested. There is no lip movement to sync to, and every cut sits in a quiet stretch of at least 90 ms (median 860 ms), so no cut lands visibly off a word. For a sample-exact master, render with `npm run render:master` (ProRes + PCM). The repo-wide render settings were not changed, because they affect every composition.

## 3. Stills: five per shot

- **What:** 500 stills at half size (960×540), five per shot, at 3 %, 25 %, 50 %, 75 % and 97 % of each of the 100 shots.
- **How:** `tools/stills.mjs`, one bundle and one browser, four frames at a time. The batch took 10 min 38 s.
- **Review:** one contact sheet per act (one row per shot), plus follow-up stills of anything that looked wrong.
- **Final pass:** after all the fixes in this document, the 500 stills were rendered again on the final code (10 min 33 s, with the browser console logged; see section 1), at each shot's final times. The sheets of the 20 shots that changed after the first pass were reviewed again; no new defects.
- **Looked for:** void or black frames outside the intended fades; set edges in frame; people or cars at the wrong scale or depth; objects cut by the lens; shots that don't change across their five frames; label legibility and placement; any victim drawn with a face; any on-screen text beyond the 15 labels and in-picture props.

| Act | Shots | Result |
| --- | --- | --- |
| Cold open | 11 | Two fixes (below, items 1 and 4). Every other shot changes across its frames. The descent reaches the crawl space and rises to the title as designed. |
| Early life | 11 | No defects. `nowhere` is dark and sparse by design (the "middle of nowhere" beat). |
| Public life and Pogo | 7 | No defects. |
| Disappearances and crawl space | 12 | One fix (below, item 5). Crawl-space shots are dark, but the subject stays lit. |
| Robert Piest | 7 | No defects. Nothing violent is shown; the sequence ends on the clock and the empty entrance. |
| Investigation | 14 | No defects. |
| Discovery | 7 | No defects. "33" is on screen for about two seconds, then the silhouettes. |
| Scoreboard and trial | 14 | One fix (below, item 2). |
| Names | 6 | No defects. The three names are legible on the files when typed. |
| How he is remembered, and the end | 11 | One fix (below, item 3). The last frames are the five blank files under the lamp, then black. |

Fixed from this pass:

1. **`screens` (16.9 s):** after the TV is switched off, the room was near black for about 5 s. A lamp now comes on, so the dead screen and the viewer's reflection read.
2. **`jack` (495.4 s):** the court sketch left most of the page empty and cropped the figure. It is now framed on Gacy at the defence table, with the second figure and "Jack" beside him.
3. **`saw-ordinary` (618.2 s):** the home-movie clip started on a wide shot where Gacy was a few pixels tall. It now starts where the camera is on him with the paper.
4. **`descent` (46.55 s), title section:** about 8 s over the dark suburb with little change. The neighbours' windows now go dark one by one, so the shot ends with only the Gacy house lit.
5. **`burials` (237.7 s):** the three "another" beats (a new mound and a puff of dust each) were too faint to register. Each beat is now a jump in time: the bulb dips, the camera moves to the newest mound, and the shovel lies beside it. (Found on the crawl-space clip, section 4.)

Also found and fixed while each act was being built, from the same kind of stills:

- A ground plane behind the lens was projected onto the horizon and painted over the house.
- Neighbouring houses overlapped each other's garages.
- Hair was drawn behind the skull, so characters looked bald.
- Crawl-space vent light beams rendered as white slashes, and soil patches read as manholes.
- The dressing table was about three times real size, so the mirror framed nothing.
- Vans, cars and a cyclist placed on road planes behind the lens were invisible, or filled the frame.
- The Chicago elevated train was out of frame, and a drive-in window hid Gacy.
- Handcuffs and a close-up hand were 2.4 times real size.
- Foreground trees in the castle shot swelled into the lens.
- A handwriting font fell back to a system font that may not be present on another machine (it now uses the loaded serif).
- "1972 – 1978" rendered reversed in the right-to-left label (digit-only labels now run left to right).
- In the trial act, people were too small in the courtroom, jury-room and scoreboard shots, the prison vigil was too dark, and the CLOSED stamp was hard to see.
- In the ending: a seated character had no chair, the door exterior was crude, the mother and child passed before the camera could see them, one home-movie clip repeated another, and two characters in the handshake wore near-identical shirts.

## 4. Review clips

Eleven clips, rendered with sound, at half size (960×540, H.264/AAC), four frames in parallel. They cover the eight sections the brief asks for (opening, suburban and business life, Pogo, crawl space, Robert Piest, investigation, trial, ending), plus the descent and the discovery, which carries the crawl-space callback. The ending is in two clips.

| Clip | Span (s) | Frames | Render time | Shots covered |
| --- | --- | --- | --- | --- |
| 01-opening | 0–16.9 | 0–506 | 209 s | street, pogo-film, makeup |
| 02-descent | 43.6–66.95 | 1308–2007 | 332 s; 356 s re-render | crew, descent (house, cross-section, crawl space, title) |
| 03-public-life | 128.3–142.9 | 3849–4286 | 147 s; 146 s re-render | in-front, business, parade, big-party |
| 04-pogo-mirror | 142.9–158.2 | 4287–4745 | 204 s | mirror, photo-op |
| 05-crawl-space | 237.7–262.0 | 7131–7859 | 251 s; 246 s re-render | burials, trenches, smell |
| 06-piest | 310.6–331.3 | 9318–9938 | 170 s | mother-arrives to waiting |
| 07-investigation | 362.8–392.8 | 10884–11783 | 458 s | not-let-go, stakeout, invite, smell-moment, need-to-return |
| 08-discovery | 421.3–454.8 | 12639–13643 | 718 s | dig-begins (the trench callback), first-find, more-finds, all-finds, river, thirty-three |
| 09-trial | 490.9–517.4 | 14727–15521 | 397 s | defense, jack, prosecution, exhibits, knew-exactly |
| 10-names | 572.9–594.9 | 17187–17846 | 119 s | dna, names, five-remain |
| 11-ending | 624.7–645.33 | 18741–19359 | 216 s | handshake, less-cinematic, final-archive |

Clips 02, 03 and 05 were rendered a second time after the fixes they exposed (or, for 03, after the `parade` cut moved), and the second renders were reviewed the same way. Render speed: 0.18–0.71 s per half-size frame with four frames in parallel, depending on the shot, and 0.44 s on average (3239 s for 7433 frames). At that average, a full-length half-size render would take about 2.3 hours in this container; 1080p will take longer.

For each clip:

- **Picture:** frames decoded at one per second and laid out on a sheet; for the opening, ten consecutive frames at 8 s as well. Checked that the encoded clip starts and ends on the right shots, has no black or frozen stretches beyond the intended fades, and that motion between consecutive frames is continuous (walks, arm moves, camera moves). The Super 8 gate weave steps at about 18 fps by design.
- **Sound:** the offset and correlation in section 2.

Results:

- 01: the push down the street, the Super 8 park and fair, the makeup table. Continuous.
- 02: the flash and trunk wipes, the house, the cut-away party, the dive into the crawl space and back up to the title. First render: the title section was static (section 3, item 4). Second render: the neighbours' windows go out one by one.
- 03, 04: the suburban and business beats (03 re-rendered with the `parade` cut in its pause); the dark wipe into the mirror; the reflection turning into Pogo; the parade and the newspaper.
- 05: first render: the burials beats did not register (section 3, item 5). Second render: each beat reads as a dip, a move to the new mound, and the shovel beside it. Trenches and smell play as designed.
- 06: the mother arrives, the summer-job conversation, Robert leaving, the clock and the empty entrance.
- 07: receipt and file, stakeout, the invitation, the smell (colour drains, camera drops to the register), the return decision.
- 08: police digging in the same framing as the workers' trenches; one marker, then more, then the pull back over the whole house; the river; the plan, "33" for about two seconds, then the 33 silhouettes, which hold still for about seven seconds under the voice. That hold is deliberate.
- 09: defence, the court sketch and "Jack", the prosecutor at the easel, the four exhibit boards on their phrases, and the new `knew-exactly` cut, now in the pause after "he".
- 10: the pipette, the DNA traces, the family tree with three lit nodes, each name typed on its phrase, the case board and the push in on the blank cards. The "5 / לא מזוהים" label was also checked at full size on the office wall: legible.
- 11: the handshake, the house at dusk lowering to the vent and fading to black, the Pogo photo turned face down and slid away, the backyard snapshot, the pull back to the five blank files, and black at the end.

## 5. How to regenerate

Stills (five per shot come from each shot's `at` in `src/gacy/data/timeline.ts`, at 3/25/50/75/97 % of its length):

```bash
node tools/stills.mjs GacyDocumentary out/qa 0.5 6,48,96,144,186 .cache/bundle
```

A clip:

```bash
npx remotion render GacyDocumentary out/piest.mp4 --frames=9318-9938 --scale=0.5 --concurrency=4
```

A sample-exact audio check needs a PCM render:

```bash
npx remotion render GacyDocumentary out/check.mov --frames=1308-1427 --codec=prores --audio-codec=pcm-16
```

## 6. Full-length 720p render

The finished film was rendered once at 720p, after all the fixes above:

```bash
npx remotion render GacyDocumentary out/gacy-documentary-720p.mp4 --scale=0.6666666666666666 --concurrency=4
```

| Check | Result |
| --- | --- |
| Render time | 2 h 49 min (0.52 s per frame on average, four frames in parallel). |
| File | `out/gacy-documentary-720p.mp4` (git-ignored), 1.57 GB, about 19.4 Mbit/s. The film grain makes the video expensive to compress at the default quality. |
| Video | H.264, 1280×720, 30 fps, 19360 frames, 645.33 s. All 19360 frames were decoded without error. |
| Audio | AAC, 48 kHz, stereo, 645.35 s. |
| Sync | Cross-correlated with the source MP3 at 0–30 s, 300–330 s and 615–645 s: +42.7 ms in all three windows (correlation 0.981–0.984). The offset is constant across the whole film, so there is no drift. It is the AAC encoding delay described in section 2. |
| Picture | One frame every 30 s decoded and checked against the shot list. Every frame shows the expected shot. Sampled once per second (mean brightness below 4 of 255), the only near-black frame is the fade up at 0 s. |

## 7. Framing pass

The 720p render (section 6) showed shots where the subject sat off centre, or where a head, a body or the set itself was cut by the frame edge in a way that looked like a mistake. This pass fixed the framing without a new full render. Every check below used stills.

### Method

- **Measurement.** With the input prop `framingDebug`, every character logs where its head lands on screen: centre, radius and feet, in pixels. People drawn inside a picture (a photo, a TV, a monitor, a poster) are excluded. `tools/framing-report.mjs` reads the log and lists four cases: a head crossing a frame edge; a head above the frame while the body is in it; a head just past a side edge while the shoulders are in it; and a foreground head at an edge (listed separately). Commands are in `docs/VIDEO_NOTES.md`.
- **Head height.** For each shot, the height of the main head in each of the five stills, as a fraction of frame height. Medium shots of standing people were brought to about 0.35–0.5. Before the pass, many interiors sat at 0.55–0.7 because the camera was aimed too high.
- **Visual review.** Contact sheets of every changed shot, then of all 100 shots on the final code.

### What was fixed

| Problem | Shots |
| --- | --- |
| Camera aimed too high: heads low in the frame, too much empty wall above | `party`, `crew`, `cell`, `release`, `parade`, `mirror`, `photo-op`, `path-diner`, `path-station`, `tells-mom`, `summer-job`, `cabinet`, `court-wide`, `defense`, `prosecution`, `knew-exactly`, `verdict`, `appeals`, `jury-room`, `handshake`, `saw-neighbor` |
| The room above the crawl space filled 40 % of the frame, and the people standing in it were cut at the chest | `trenches`, `dig-begins`, `hatch`: reframed on the crawl space; the room above now shows only lower legs |
| Searchers' heads touching the top of the frame; the second searcher cut by the edge | `first-find`, `more-finds`, `all-finds` |
| The set ran out inside the frame | `mother-arrives`, `few-minutes`, `waiting` (black beyond the pharmacy's front wall: the camera now stays inside the store, and the floor runs under the wall); `search`, `smell-moment`, `station` and the kitchen at the end of `photo-op` showed black above the wall, because the frame was taller than the room. The shared room set now has a ceiling, which covers every interior built on it |
| A person or a hand sliced by the frame edge in a held frame | `morning` (wide), `party` and `saw-host` (guests, picnic table), `big-party`, `hall` (foreground audience), `iowa` (counter worker), `conviction` (start of the crane), `handcuffs` (the hand now enters from outside the frame), `station` (the detective stopped just outside the frame; he now walks into it), `waiting` (a customer), `search` (an officer), `smell-moment` (Gacy's arm at the edge while the camera holds on the officer), `pogo-film` (guests), `mirror` (his arm at the start of the move: the move now starts with him and his reflection outside the frame, and the reflection's change to Pogo is tied to the camera position, so it still happens while his head hides it), `in-front` (the crane ended with Gacy cut at the knees and a neighbour at the chest; it now stops with both whole), `jury-room`, `court-wide`, `defense`, `prosecution`, `verdict` (front-bench spectators are now placed per shot; the judge in `defense` and the end jurors in `defense` and `prosecution` are clear of the edge; in `defense` the prosecutor's seat, which fell on the frame edge, is left empty) |
| Subject pushed to one side, or the camera resting on an empty frame | `shift` (the camera paused mid-move on the shelf end with Robert at the edge; it is now one move, ending centred on the counter), `ordinary-house` (ends on the whole house over the crawl space), `search` (ends on the officer at the wastebasket, which is now in frame), `need-to-return`, `signs-map`, `final-archive` |
| A prop cut by the frame edge | `appeals` and `cell` (the wall calendar), `jury-room` (the clock) |
| Cards and files not centred | `eight-files`, `names`, `five-remain` (the push now ends on two blank cards, with no neighbouring card cut) |
| Other | `warrant` (the document re-centred), `ordinary-street` (camera height, and the path of the mother and child), `thirty-three` (silhouette spacing), the kneeling searcher's pose |

### Result

- **Final check:** all 100 shots, five stills each (500 stills), on the final code. Shots changed while the check was running were rendered and reviewed again.
- **Head height** (the largest head in frame, median over the five stills, on the 72 shots with people): 49 shots at 0.3–0.55 of frame height (0 is the top edge), 7 at 0.2–0.3 or 0.55–0.58, and none in the top fifth of the frame. The 16 with the head lower than 0.58 are wide shots with people in the lower part of the frame under a building or street (`descent`, `in-front`, `chicago-1942`, `big-party`, `pharmacy-night`, `river` and others), or shots with an audience in the foreground (`hall`, `screens`, `theater`).
- **Frame edges:** the report on the final code lists 24 items. Each was checked on the stills and kept, for one of these reasons:
  - People enter or leave the frame during a camera move (`driveway`, `iowa`, the start of `mirror`, `ordinary-house`, `station`, `search`, `all-finds`, `court-wide`, `prosecution`).
  - A head just past the side edge where the stills show nothing of the person in frame; the check assumes an arm might reach in (the first frames of `in-front` and `search`).
  - The legs of people standing in the room above the crawl space (`trenches`, `smell`, `smell-moment`, `hatch`, `dig-begins`, and the floor in `descent`).
  - A crowd that runs past the frame edge (`prison-night`, and the lit windows at the bottom of the title in `descent`).
  - Foreground heads in over-the-shoulder shots (`screens`, `mirror`, `photo-op`).
- **Browser console:** apart from the framing log itself, nothing was logged while the stills rendered.
- **Static checks:** `npx tsc` and `npx eslint src/gacy` pass.

### Kept on purpose

- **Wipes.** Foreground objects that cross the lens at a cut (a van, a doorway, a silhouette, a sheet of paper) fill part of the frame for a few frames by design.
- **Legs in the room above.** In the crawl-space framing, anyone standing in the room above shows only the lower legs. That framing is reused for the police dig.
- **Motion.** In pans and push-ins, people enter and leave through the frame edges during the move. The checks were applied to the held frames at the start and end of each move.
- **Over-the-shoulder and close-up framing.** The mirror, the newspaper photo, the court sketch and the close-ups of hands and photos crop on purpose.

### Not re-rendered

`out/gacy-documentary-720p.mp4` (section 6) was rendered before this pass and does not include these fixes. Render again with the commands in `docs/VIDEO_NOTES.md`.

## 8. Not covered

- **No 1080p render.** The film was rendered in full at 720p (section 6), before the framing pass (section 7). At 1080p, expect the render to take longer than the 2 h 49 min it took at 720p.
- **No full render after the framing pass.** The framing fixes were checked on stills only.
- **No human viewing.** Pacing, how the voice sits against the picture, and the feel of the transitions need one watch-through by a person.
- **Display.** Night, crawl-space and prison shots are dark by design. They were judged on stills, not on a calibrated display.
- **Facts.** The count of unidentified victims (five) and the three names follow the script. Identifications have continued since 2011, so check the current count with the Cook County Sheriff's Office before publishing.
