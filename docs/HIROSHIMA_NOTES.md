# Hiroshima and Nagasaki: production notes

Archival documentary for the three-part Hebrew narration of _מאחורי הסיוט: הירושימה ונגסקי_ (Behind the Nightmare: Hiroshima and Nagasaki), delivered for YouTube at 720p.

|                      |                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Composition ID       | `HiroshimaNagasaki`                                                                                                     |
| Entry                | `src/hiroshima/HiroshimaDocumentary.tsx`                                                                                |
| Shot list            | `src/hiroshima/data/edit.ts`                                                                                            |
| Narration            | `public/hiroshima/audio/narration-{1,2,3}.mp3` (byte-identical copies of the uploaded `atom1234`, `atom_567`, `atom89`) |
| Length               | 1424 s (23:44), 42,720 frames at 30 fps                                                                                 |
| Composition size     | 1920×1080; delivered at 1280×720                                                                                        |
| Sources and licences | `docs/HIROSHIMA_SOURCES.md`                                                                                             |

## Building it from a clean checkout

The archival films (about 3.5 GB) and everything derived from them are not committed. Rebuild them in this order:

```bash
npm ci
node --experimental-strip-types tools/hiroshima/fetch.mjs        # films -> .cache/raw
node --experimental-strip-types tools/hiroshima/cut-clips.mjs    # graded segments -> public/hiroshima/clips
node --experimental-strip-types tools/hiroshima/grade-stills.mjs # graded stills -> public/hiroshima/graded
node --experimental-strip-types tools/hiroshima/score.mjs        # score + narration -> public/hiroshima/audio/mix.wav
```

Each tool reads the shot list, so after editing `edit.ts` run `cut-clips.mjs` (it only cuts what is new or too short, and deletes cuts the edit no longer uses), then `grade-stills.mjs` if a still or its grade changed, then `score.mjs` if a cue moved.

## Render

```bash
npx remotion render HiroshimaNagasaki out/hiroshima-master-720p.mp4 \
  --scale=0.6666666666666666 --concurrency=4 --crf=19 --jpeg-quality=92
```

Measured in the 4-core cloud container this was built in: the full 720p render took about 2 h 50 min (Chrome's software compositor is the bottleneck, not the video decoding) and produced a 632 MB file, H.264 at about 3.2 Mbit/s with 317 kbit/s AAC. All 42,720 frames decoded without error.

The delivery copy (sent in chat, and a sensible YouTube upload) is a two-pass re-encode of that master at about 1.55 Mbit/s, roughly 300 MB:

```bash
ffmpeg -i out/hiroshima-master-720p.mp4 -c:v libx264 -preset slow -b:v 1550k -pass 1 -an -f null /dev/null
ffmpeg -i out/hiroshima-master-720p.mp4 -c:v libx264 -preset slow -b:v 1550k -maxrate 3000k -bufsize 6000k \
  -pass 2 -c:a aac -b:a 128k -movflags +faststart out/hiroshima-nagasaki-720p.mp4
```

A section, for review (frames are seconds × 30):

```bash
npx remotion render HiroshimaNagasaki out/part.mp4 --frames=9000-10800 --scale=0.5
```

Stills for QA, one browser for many frames:

```bash
node tools/stills.mjs HiroshimaNagasaki out/qa 0.5 1350,6100,12000 .cache/bundle-h
```

## How the cut is put together

- **Timeline.** The three narration files sit at `P1` = 1.0 s, `P2` = 633.05 s and `P3` = 1096.2 s (`edit.ts`), with about two seconds of breath between them. Word timings come from a local transcription (faster-whisper with the `ivrit-ai/whisper-large-v3-turbo` Hebrew model; the audio never left the machine). Every cut is placed on the phrase it illustrates.
- **Shots.** `SHOTS` lists about 320 shots. A shot runs until the next one starts and stays 0.6 s under it for the dissolve. A clip is a source film (`src`) and an in-point (`t`), optionally slowed (`r`), with a camera move (`from`/`to`: focal point and zoom over "cover") and a grade. Stills move the same way; portrait and small pictures are shown whole on a blurred copy of themselves rather than blown up.
- **Grades are baked, not filtered.** `GRADE_FILTERS` in `edit.ts` are ffmpeg chains applied when the clips are cut and the stills graded. In this renderer a full-frame CSS filter doubled the cost of a frame, and an animated grain layer doubled it again, so there is neither; the archive carries its own grain.
- **Graphics** (`src/hiroshima/graphics`): the series sting, the title, maps of both missions and of Tsutomu Yamaguchi's journeys (Natural Earth coastlines), and explanatory graphics for the passages that explain rather than describe: the three ways the bomb kills, the doctors and hospitals lost, bone marrow and the three blood-cell lines, the death toll, the leukaemia trend, the disputed book.
- **Overlays**: place and date captions, nine chapter titles laid over the picture (the narration never pauses for them), large type for a handful of figures and Japanese terms, a small source credit whenever the source changes, the black rain, the flashes, and the subscribe reminder when the narration asks for it.
- **Sound** (`tools/hiroshima/score.mjs`): a synthesised drone that changes chord with the chapters and sits about 20 dB under the voice, a clock under the opening, the aircraft, a riser cut dead into each flash followed by the blast, a low hit on "he survived two", and rain. No samples, no third-party music. The mix is normalised to −15 LUFS integrated, −1.5 dBTP.

## Editorial decisions

- **The archive is used as what it is.** The Trinity fireball illustrates the narration's general description of a nuclear fireball and of Oppenheimer's line, and is captioned as Trinity where it appears as itself; no Trinity footage is presented as Hiroshima. There is no film of the Hiroshima fireball; the moment of the blast is a flash over a pre-war postcard of the Aioi Bridge, the bomb's aiming point.
- **Survivors are shown as the 1945–46 medical films show them**: hair loss, burns under treatment, wards and clinics. Autopsy and pathology footage in the same films is not used, and no dead body is shown. The kimono-pattern burn photograph is shown because the narration describes exactly that injury.
- **The _Last Train from Hiroshima_ passage** is told without illustrating the book's discredited account: a plain typographic cover (not the publisher's design), a deliberately illegible page, the ruins blurred, and then the verdict stamped on the cover.
- **Figures on screen are the narration's own** (15,000 tons, 90 % of doctors, 45 hospitals, about 140,000 and 70,000 deaths by the end of 1945), marked as estimates where the narration says so. The leukaemia chart is labelled as a schematic of the trend, not data. The bone-marrow graphic is labelled schematic.
- **Captions add only checkable facts**: places, dates, the target list of July 1945 (Hiroshima, Kokura, Niigata, Nagasaki), Tibbets as the pilot, Ivy Mike as the first thermonuclear test (1952), Yamaguchi's dates (1916–2010).

## Points worth checking in the narration

These are in the supplied voice-over, not in the picture. They are not wrong as far as I can tell, but they are the places a careful viewer may query:

- _Last Train from Hiroshima_: the narration names the "crocodile people" passage. The book's withdrawal by its publisher in 2010 after a source was found to be fabricated is well documented; the exact wording of the passage was not checked against the book.
- "Close to 90 % of the doctors" and "of 45 hospitals, only a few could operate": widely cited historical estimates; the on-screen footnote says "according to historical estimates".
- Death tolls: the narration gives the commonly cited end-of-1945 estimates and says the exact numbers are unknown; the graphic says the same.

## Known limits

- **Two licences are not fully settled** (see `docs/HIROSHIMA_SOURCES.md`): the Prelinger "Enola Gay outtakes" (no licence on the item page; Prelinger material is generally released to the public domain) and the 1946 Strategic Bombing Survey film shot by the Japanese Nippon Eigasha crew (public domain in the U.S.; status elsewhere not verified). Both should be cleared before any broadcast use outside YouTube.
- **No photograph of Tsutomu Yamaguchi** is used: none with a free licence was found. His chapter is carried by maps, the places he passed through, and a name card.
- **Wikimedia rate limits** stopped several further stills from downloading (a Marcel Junod photograph, the Sumitomo Bank shadow, the 1955 ABCC building). The edit does not depend on them.
- **Two captions sit on bright picture**: "ניסויי ביקיני" (22:07–22:18) partly over a white cloud, and "ועידת פוטסדאם" (22:42) over the edge of the mounted photograph. Both are legible but weaker than the rest; moving them needs a re-render of those seconds only (`--frames`).
- **AAC timing**: as with the other documentaries in this repository, H.264/AAC output decodes about 43 ms late in ffmpeg (encoder priming). There is no lip sync in this film; render a ProRes master (`npm run render:master`) if a sample-exact file is needed.
