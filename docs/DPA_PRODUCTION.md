# The Dark Pictures Anthology documentary: production notes

A 32-minute, picture-only documentary cut to a Hebrew narration: game footage,
no titles, captions or graphics. Output is 1280x720, 30 fps, H.264 with AAC.

## Status

| Item                                                             | State                                                                                           |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Narration (`public/audio/dpa-narration.mp3`, 32:17.21)           | In place, unmodified                                                                            |
| Timed transcript (`src/dpa/data/transcript.json`, 689 sentences) | Done                                                                                            |
| Edit decision list (`src/dpa/data/edl.json`, `docs/DPA_EDL.md`)  | Timing, topic, required picture and transition set for all 225 beats; source and in/out pending |
| Remotion composition `DarkPictures`                              | Done                                                                                            |
| Inventory, clip preparation, segmented render, QA tooling        | Done, verified on synthetic test footage                                                        |
| Hebrew script PDF                                                | Not received                                                                                    |
| Game footage                                                     | Not received. This is what the final render is waiting on                                       |
| Final MP4                                                        | Not rendered                                                                                    |

## Footage: sources and licensing

No footage is in the repository and none has been downloaded.

- The four games and The Curator are, to my knowledge, the intellectual
  property of Supermassive Games, with the first season published by Bandai
  Namco Entertainment. Until Dawn (27 seconds of narration) is a Sony
  Interactive Entertainment title. Directive 8020 (19 seconds) is a later
  Supermassive title. These attributions should be confirmed before publishing.
- I searched for a published video or content-creator policy from Supermassive
  Games and from Bandai Namco that would permit reuse of their trailers or of
  gameplay recordings in a third-party video. I did not find one. The only
  Bandai Namco page located covers its sponsored creator programme, not general
  reuse. I do not have a verified source that grants permission.
- Official trailers on YouTube carry the standard YouTube licence, which does
  not grant reuse, and downloading them is outside YouTube's terms of service.
  They also carry burned-in logos, ratings and press quotes, which conflicts
  with the no-text rule, and they do not contain most of the specific story
  scenes the narration describes.
- The route with the least exposure is gameplay captured from owned copies of
  the games, with subtitles and interface switched off, and with the publisher's
  position on monetised commentary videos confirmed in writing or accepted as a
  known risk by whoever publishes the film. That decision belongs to the
  publisher of the video, not to this pipeline.

## Footage required

`docs/DPA_EDL.md` lists every beat with the picture it needs. In total:

| Game                                                                  | Screen time to cover |
| --------------------------------------------------------------------- | -------------------: |
| House of Ashes                                                        |                 7:44 |
| The Devil in Me                                                       |                 6:44 |
| Little Hope                                                           |                 5:31 |
| Man of Medan                                                          |                 5:09 |
| The Curator (library scenes from all four games, plus in-game cameos) |                 3:55 |
| Mixed montage across the four games                                   |                 2:32 |
| Until Dawn                                                            |                 0:23 |
| Directive 8020                                                        |                 0:19 |

Full story playthroughs with subtitles and interface off cover nearly all of
it. Recordings should include each game's prologue, the Curator interludes and
the endings. Source files of 1080p or 720p at any frame rate are fine.

## Working with footage

```bash
# 1. Put source videos under footage/dpa/ (git-ignored), then index them.
npm run dpa:inventory      # metadata, contact sheets, source cut points

# 2. Assign footage: set "source" and "in" on shots in src/dpa/data/edl.json.
#    Split a long beat into several shots by adding entries; keep them contiguous.

# 3. Trim and normalise only what the edit uses. Cached per shot.
npm run dpa:prep

# 4. Check a passage, then render the film. Segments are cached.
npm run dpa:render -- --from 440 --to 520
npm run dpa:render

# 5. Automated checks on the delivery file.
npm run dpa:qa
```

`npm run dpa:edl` rebuilds the EDL from `tools/dpa/plan.txt` and refreshes
`docs/DPA_EDL.md`; footage already assigned to an unchanged beat is kept.

## Technical notes

- The narration is the master clock and is never re-timed. Every cut is placed
  on a sentence boundary taken from the transcript, 0.15 s ahead of the first
  word.
- Segments are frame ranges of a single composition, rendered muted with
  identical encoder settings and joined by stream copy. The audio is mixed and
  encoded once and muxed without touching the picture.
- A shot can carry its own game audio under the narration by setting `gain`
  (in dB, for example `-24`). It is ducked automatically while the narrator
  speaks. Shots without `gain` are silent.
- Clips are converted to BT.709 limited range and tagged. Frames are captured
  as PNG: with JPEG capture, Remotion 4.0.526 tags BT.601 data as BT.709 and
  colours shift visibly.
- Measured on the 4-core cloud machine with a 3-minute test passage: about
  16 frames per second where every shot has footage, so roughly an hour for
  the whole film on a first render. Later renders only redo changed segments.
- The render refuses to produce a delivery file while any shot is unsourced,
  unless `--allow-pending` is passed for a check render.

## Points to confirm

- The narration introduces Directive 8020 as the next announced game. Its
  release status may have changed since the narration was recorded.
- The narration says the Ourang Medan "caught fire and exploded". The game
  does not show this, so that beat is planned on storm footage.
- The transcript was produced by speech recognition, since the script PDF was
  not available. Sentence timing is reliable; spelling of names in the
  transcript text is not authoritative.
