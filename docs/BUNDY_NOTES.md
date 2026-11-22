# Faces of Evil: Ted Bundy — production notes

Documentary cut to the three-part Hebrew narration of _פני הרוע: טד בנדי_, delivered for YouTube at 720p.

|                      |                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Composition ID       | `TedBundy`                                                                                                        |
| Entry                | `src/bundy/BundyDocumentary.tsx`                                                                                  |
| Shot list            | `src/bundy/data/edit.ts`                                                                                          |
| Narration            | `public/bundy/audio/narration-{1,2,3}.mp3` (byte-identical copies of the uploaded `Ted_123`, `Ted_456`, `Ted_78`) |
| Length               | 1356 s (22:36), 40,680 frames at 30 fps                                                                           |
| Composition size     | 1920×1080; delivered at 1280×720                                                                                  |
| Sources and licences | `docs/BUNDY_SOURCES.md`                                                                                           |
| YouTube text         | `docs/BUNDY_YOUTUBE.md`                                                                                           |

## Building it from a clean checkout

The films (about 3.5 GB) and everything derived from them are not committed. Download the six films listed in `src/bundy/data/sources.ts` (the `url` of each) into `.cache/raw-bundy`, then:

```bash
npm ci
node --experimental-strip-types tools/hiroshima/cut-clips.mjs bundy    # graded segments -> public/bundy/clips
node --experimental-strip-types tools/hiroshima/grade-stills.mjs bundy # graded stills -> public/bundy/graded
node --experimental-strip-types tools/bundy/score.mjs                  # score + narration -> public/bundy/audio/mix.wav
node --experimental-strip-types tools/bundy/sources-doc.mjs            # docs/BUNDY_SOURCES.md
```

The clip cutter and still grader are the Hiroshima film's tools, now taking a project name. The cutter squares non-square NTSC pixels before scaling and applies a film's `pre` filter (the colour repair of the faded 1968 print) before the grade.

## Render

```bash
npx remotion render TedBundy out/bundy-master-720p.mp4 \
  --scale=0.6666666666666666 --concurrency=4 --crf=19 --jpeg-quality=92
```

The delivery copy is a two-pass re-encode of the master at about 1.55 Mbit/s, roughly 280 MB. The medium preset is used for speed on a 4-core machine; at this bit rate the difference from the slow preset is small:

```bash
ffmpeg -i out/bundy-master-720p.mp4 -c:v libx264 -preset medium -b:v 1550k -pass 1 -an -f null /dev/null
ffmpeg -i out/bundy-master-720p.mp4 -c:v libx264 -preset medium -b:v 1550k -maxrate 3000k -bufsize 6000k \
  -pass 2 -c:a aac -b:a 128k -movflags +faststart out/ted-bundy-720p.mp4
```

QA stills, one browser for many frames: `node tools/stills.mjs TedBundy out/qa 0.5 1350,6100,12000 .cache/bundle-b` (set `REBUNDLE=1` after a code change).

## How the cut is put together

- **Timeline.** The narration files sit at `P1` = 1.0 s, `P2` = 509.83 s and `P3` = 1024.66 s. Word timings come from a local transcription (faster-whisper with the `ivrit-ai/whisper-large-v3-turbo` Hebrew model; the audio never left the machine), and every cut is placed on the phrase it illustrates.
- **Picture.** 194 shots: photographs of Bundy (State Archives of Florida, Florida Department of Corrections, FBI), the places of the story, mostly photographed between 1972 and 1980 (EPA DOCUMERICA at the National Archives; Library of Congress photographs by Carol M. Highsmith and John Margolies), with two later views where no period photograph was available (the Pitkin County Courthouse in 2010 and Florida State University's Westcott Building in 2020), the 1979 sentencing order, maps built from Natural Earth data, and U.S. government films of 1968–1975 used as period atmosphere.
- **Graphics** (`src/bundy/graphics`): the series sting, maps of the US and the Northwest with numbered pins and a running legend of the women's names, memorial cards, the roll of names, text cards for the passages that explain rather than describe, schematic drawings of the two escapes (labelled "איור"), a 1970s television set, the FBI listing, the "myth" wall, and the end card.
- **Grades are baked**, as in the Hiroshima film: ffmpeg chains applied when clips are cut and stills graded, because CSS filters double the frame cost in this renderer.
- **Sound** (`tools/bundy/score.mjs`): a synthesised drone whose chord changes with the chapters, low hits on the beats listed in `HITS`, thin tension tones under the escapes and the Tallahassee night, and a sparse motif under the childhood chapter and the roll of names. No samples, no third-party music. Mixed to −15 LUFS integrated, −1.5 dBTP.

## Editorial decisions

- **No photographs of the victims, no crime-scene material, no bodies.** The women are named on memorial cards and map legends, with age, place and month only where the narration gives them, and in the roll of names near the end.
- **The moving pictures are atmosphere, never evidence.** None of the films shows Bundy, the victims or the places of the story. They are never captioned with a place or date, the source is credited on screen each time it changes, and footage with an adult man in close-up is avoided so that nobody on screen can be mistaken for Bundy or a reconstruction of him.
- **Captions name places and dates only over pictures of those places** (Aspen and the Pitkin County Courthouse, Salt Lake City, Seattle, Tacoma, Tallahassee, Pensacola, Miami). Where no free photograph of a place exists (Lake Sammamish, the University of Utah, Florida State Prison) the picture carries no place caption; the narration and the memorial cards carry the facts.
- **The sentencing document** is the Dade County bench docket of 31 July 1979. Its caption ("גזר הדין · מיאמי, 31 ביולי 1979") appears only when the narration reaches the sentence, so it does not contradict the conviction date the narrator gives a few seconds earlier (24 July).
- **The television graphics:** the trial set shows a still photograph of Bundy in court, and says so on screen ("בתמונה: תצלום סטילס של בנדי באולם"). The set for the last interview shows no picture at all, only its title, because no free image from that interview exists.
- **The schematics** of the Pitkin County law library window and the Glenwood Springs ceiling are labelled "איור" and show only what the narration states.

## Points worth checking in the narration

The narration is accurate as far as I could check it. These are the places a careful viewer may query:

- The narrator says Bundy was convicted on 24 July 1979 and that the judge sentenced him to death. Both are correct; the formal sentence was pronounced on 31 July 1979, as the document on screen shows.
- "He confessed to 30 murders": the figure usually cited from his last interviews with investigators. The narration itself says the true number is unknown, and the graphics say the same.
- The opening of the series is heard as "ברוכים הבאים ל׳פני הרוע׳" and the close names a channel, "לילה לבן". The channel name was not certain enough in the transcription to put on screen, so it is left out.

## Known limits

- **Commons rate limits.** Wikimedia Commons refused most downloads during the build. The 1965 yearbook photograph, the Lake Sammamish and University of Utah photographs, the Raiford death-row photograph, the 1972 electric-chair photograph and the death certificate were not obtained; the edit uses archive photographs of the same places from the National Archives and the Library of Congress, or a text card, instead. Their licence details are recorded in `public/bundy/stills/sources.json` should they be added later.
- **Provenance of two Bundy photographs is thinner than the rest**, although Commons lists both as public domain: the 1988 Florida Department of Corrections mugshot (the Commons source is a Reddit post that says it was obtained from the Department) and the 1989 photograph with FBI agent Bill Hagmaier (the Commons source is a Tumblr copy of an FBI image). Both are worth confirming with the original agencies before any use outside YouTube.
- **Florida state records.** Several photographs are Florida state works (State Archives of Florida, Florida Department of Corrections). Commons treats them as public domain under Florida's public-records law; that status is not universal outside the United States.
- **Two clips are reused** at a distance: the FBI training film's night parking lot (the Utah abduction and the closing section) and the man on the telephone (the "Ted" passages).
- **AAC timing**: as with the other documentaries in this repository, H.264/AAC output decodes about 43 ms late in ffmpeg (encoder priming). There is no lip sync in this film.
