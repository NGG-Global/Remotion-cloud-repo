# Dead Island: Behind the Nightmare — production report

## Delivery

| | |
| --- | --- |
| File | `out/deadisland/Dead-Island-Behind-the-Nightmare.mp4` |
| Runtime | 27:52.07 (narration 27:48.88, then a 3.2 s tail and fade) |
| Picture | 1920×1080, 30 fps, H.264 (CRF 18), 50,162 frames |
| Sound | AAC 256 kb/s, 48 kHz stereo; integrated loudness −18.9 LUFS, loudness range 3.6 LU |
| Size | about 2.64 GB |
| Watermark / subtitles | none / none |

1080p rather than 4K: most of the authentic sources are 720p or 1080p (several are 540p or lower), so a 4K master would only
have been an upscale.

## What is in the cut

471 shots, average 3.55 s (shortest 1.0 s, longest 10.7 s), 34 small corner labels, no text cards and no chapter titles.
20 shots are deliberate callbacks to footage seen earlier (mostly the 2011 trailer in the reflective ending); every other
source range is used once, which `cut.py --check` enforces.

| Kind of picture | Screen time | Share |
| --- | --- | --- |
| Recorded gameplay (walkthroughs, quick looks, developer captures) | 601 s | 35.9% |
| In-engine footage taken from official gameplay and launch trailers | 553 s | 33.1% |
| CGI trailers and cinematics (2011 trailer, E3 2014, Gamescom 2022, Riptide) | 370 s | 22.2% |
| Archival: studio talk, show-floor footage, interview, studio logos | 80 s | 4.8% |
| In-game cutscenes | 68 s | 4.1% |

So about 69% is in-engine game footage and 22% official CGI trailers. Half of that in-engine footage comes from official
trailers rather than long gameplay recordings, because the usual source of long recordings was not reachable (see below).

50 of the 76 catalogued sources appear in the film. `docs/deadisland/SOURCES.md` lists all of them with origin, page, local
file, resolution and screen time; `docs/deadisland/footage-registry.csv` has every shot's source in/out point;
`docs/deadisland/TIMELINE.md` is the readable timeline.

## Sound

- Narration: the supplied recording, unmodified and at its original level; measured offset against the original at four points
  across the film is 0.0 ms.
- Score: an original ambient bed synthesised for this film (`tools/deadisland/music.py`); no third-party music. It sits about
  13 dB under the voice.
- The 2011 trailer's own soundtrack is audible, quietly, under the passage that describes that trailer (2:43–3:44). It is the
  only source sound in the film. If the trailer's music is not covered by the arranged rights, delete the single `B |` line in
  `tools/deadisland/edit/01_open_trailer.edl` and re-render the sound.
- All other footage is silent under the narration.

## Checks run on the delivered file

| Check | Result |
| --- | --- |
| Frame count and duration | 50,162 frames, 1672.07 s, matches the composition |
| Black passages ≥ 0.2 s | two: 10:15.2 (0.33 s, a dark cut inside the Riptide storm footage) and the closing fade |
| Frozen picture ≥ 2 s | only the intended holds on logo and slide cards (Yager, Dead Island 2 logo, GDC title slide, "Spring 2015", Sumo Digital, studio logos) |
| Silence ≥ 3 s | none |
| Narration sync | 0.0 ms at 0:10, 10:00, 20:00 and 27:20 |
| Missing media | none (all 471 clips present and long enough) |
| Shot-by-shot review | first and last frame of every shot inspected; every clip scanned for black and frozen frames |

## Limitations and things to verify

1. **YouTube could not be used.** It demanded a sign-in / bot check from this cloud machine and that was not bypassed. All
   footage comes from the Steam store CDN (official trailers), the Internet Archive and Dailymotion. Two Dailymotion items that
   needed browser impersonation and one Internet Archive item that needed a login were also left out.
2. **Haus is low resolution.** Apart from two 1080p passages from the Ultimate Edition trailer, Haus is covered by a 480p
   streamer recording cropped to remove the streamer's camera (about 615×346 before scaling). Spanish quest text is visible in
   a corner of some of those shots. Konstantin himself could not be identified in the available footage; the passage about him
   shows the cult's hall and machinery instead.
3. **The first game's late areas are thin.** No footage of the jungle laboratory, the prison interior, the final boss or the
   helicopter ending was obtainable. Those lines are covered by the Ryder White DLC trailer and its cutscenes, official trailer
   shots and aerial cutscene footage. The transformed Ryder White is not shown.
4. **Yager-era Dead Island 2 gameplay is scarce.** It rests on the 480p "Sunshine & Slaughter" trailer, four official
   screenshots shown on Yager's GDC Europe 2014 slides and show-floor footage from Paris Games Week 2014. Each such passage
   carries a "Yager build" label. No Sumo Digital-era footage exists publicly; that passage uses the studio's logo and its
   earlier game.
5. **Not illustrated literally:** the narration's mention of The Walking Dead television series (Dead Rising 2 footage stays
   on screen), a zombie stuck in a wall (an ordinary ragdoll fall is shown), Riptide's John Morgan (not identifiable in the
   footage) and Riptide's final scene (the boat arriving is from gameplay; the closing images are from Riptide's CGI trailer).
6. **Some low-resolution material** is upscaled to 1080p without sharpening: the Left 4 Dead intro (452×254), G4 recordings of
   the first game (960×540) and the Yager trailer (848×480).
7. **Rights.** Per the brief, usage rights are arranged by the producer. Items in `SOURCES.md` marked **check** are recordings
   by third parties (Giant Bomb, G4, PlayStation, jeuxvideo.com, Game Informer, a Twitch streamer, a GDC recording, a French
   YouTuber's show-floor report) rather than publisher-issued material, and deserve an explicit look. Context trailers of other
   publishers' games (Left 4 Dead, Resident Evil 5, Dead Rising 2, Spec Ops: The Line, Sonic & All-Stars Racing Transformed,
   Homefront: The Revolution) are used for a few seconds each.
8. **Facts on labels** (dates, studios, the FLESH acronym, Axis Animation and its director, the Lionsgate option, Yager
   Productions' insolvency) come from the narration and general knowledge of the franchise's history; they were not checked
   against primary sources in this session and should be verified before publication.
9. **Transcript.** Machine transcription (ivrit-ai Whisper large-v3-turbo, run locally). It was used for timing and is not
   proofread; a few words are mis-heard (for example "השוט" for "משוט").
