# The Dark Pictures Anthology documentary: production notes

A 32-minute, picture-only documentary cut to a Hebrew narration: game footage,
no titles, captions or graphics. Output is 1280x720, 30 fps, H.264 with AAC.

## Status

| Item                                                             | State                                                          |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Narration (`public/audio/dpa-narration.mp3`, 32:17.21)           | In place, unmodified                                           |
| Timed transcript (`src/dpa/data/transcript.json`, 689 sentences) | Done                                                           |
| Edit decision list (`src/dpa/data/edl.json`, `docs/DPA_EDL.md`)  | Complete: 225 beats cut into 582 shots, every shot sourced     |
| Remotion composition `DarkPictures`                              | Done                                                           |
| Selection, fetch, clip preparation, segmented render, QA tooling | Done                                                           |
| Picture quality                                                  | 49 shots from 1080p footage, 533 from 288p proxies (see below) |
| Hebrew script PDF                                                | Not received; the transcript stands in for it                  |

## Footage: sources and licensing

The publisher of the film confirmed that rights for the footage are handled and
authorised downloading gameplay from the internet. That clearance is theirs to
hold; nothing here verifies it independently.

- All footage comes from one uploader's playthrough series on Dailymotion,
  recorded without commentary overlays or a facecam: Man of Medan (11 of 12
  parts available), Little Hope (13 of 14), House of Ashes (13 of 16) and The
  Devil in Me (18 of 18), all "Curator's Cut" runs. `src/dpa/data/parts.tsv`
  lists each part and its video id.
- Until Dawn (23 seconds) comes from the same uploader's Until Dawn series.
  Directive 8020 (19 seconds) comes from a published 13-minute prologue
  gameplay video, which carries a "work in progress" watermark that the crop
  removes.
- YouTube refused downloads from the cloud machine with a sign-in challenge,
  and Odysee answered 401; neither was worked around. The Internet Archive had
  clean footage for only one of the four games.
- The games and The Curator are, to my knowledge, the property of Supermassive
  Games, the first season published by Bandai Namco Entertainment; Until Dawn
  is a Sony Interactive Entertainment title. I found no published policy from
  either company permitting reuse, so the publisher's own clearance is what
  the film rests on.

## Picture quality

Shots were chosen on 288p proxies of every part. The host offered the matching
1080p streams at first and then stopped offering them to the cloud machine
altogether, so only 49 shots were fetched at 1080p before the fetch was
stopped. The other 533 shots are cut from the proxies and are visibly soft at
720p. They are marked `"quality": "proxy"` in the EDL.

To upgrade them once the 1080p streams are reachable again, from this machine
or another:

```bash
node tools/dpa/fetch-selects.mjs --jobs 2   # only fetches what is missing
node tools/dpa/apply-selects.mjs            # repoints shots at the 1080p files
npm run dpa:prep && npm run dpa:render && npm run dpa:qa
```

Timing, shot choice and crops do not change; only the affected segments are
re-rendered.

## Where the footage does not match the narration exactly

The recordings are single playthroughs, so some described moments were never
captured. The closest true footage is used instead. The main cases:

- Man of Medan: no military helicopters (neither recorded ending includes
  them); documents appear mostly on the collectible reading screen, so in-world
  crates and a manifest on a table are used; the "girl in the corridor"
  hallucination is absent.
- Little Hope: the 1692 hanging and the hanged demon are absent (possibly in
  the missing part); the arrest ending was not recorded, so the bleak ending is
  represented by Andrew alone at the ruin, before any weapon appears.
- House of Ashes: Salim's son never appears on screen; Rachel is not cocooned
  in this run; three survivors reach the surface, not five.
- The Devil in Me: no shot of the killer going under water; the epilogue shows
  the new family at home, not arriving on the island.
- The Curator's in-game cameos could not be located on contact sheets, so that
  passage uses him seen at a distance in his library.

Each selection agent's full list is kept with its working notes; the EDL
records what is on screen for every shot.

## Crops

Three of the games are recorded letterboxed with subtitles on. Every shot is
punched in to remove both: 1.32x for Man of Medan and Little Hope, 1.45x for
House of Ashes (subtitles sit inside the picture), 1.25x for The Devil in Me.
No game audio is used; the soundtrack is the narration alone.

## Working with footage

```bash
npm run dpa:inventory -- --only proxy --every 12 --tile 8x8 --thumb 240x135
                                   # contact sheets and cut points for proxies
node tools/dpa/strip.mjs proxy/<part>.mp4 <from> <to> out.jpg   # close look
# Edit src/dpa/data/selects.json: beat id -> ranges of part footage
node tools/dpa/fetch-selects.mjs   # full-quality footage for the chosen ranges
node tools/dpa/apply-selects.mjs   # cut the beats into timed shots
npm run dpa:prep                   # trim and normalise, cached per shot
npm run dpa:render -- --from 440 --to 520    # check a passage
npm run dpa:render                 # the film; segments are cached
npm run dpa:qa                     # automated checks on the delivery file
```

`footage/` and `public/dpa/clips/` are not in the repository. On a fresh
machine the proxies are re-downloaded from the ids in `parts.tsv`.

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
