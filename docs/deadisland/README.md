# Dead Island: Behind the Nightmare (מאחורי הסיוט · לילה לבן)

Footage-driven documentary cut to the Hebrew narration `public/deadisland/audio/narration.mp3` (untouched, 27:48.9).
Composition id: `DeadIslandDocumentary` (1920×1080, 30 fps, 27:52.1).

## Layout

| What | Where |
| --- | --- |
| Narration and its transcript | `public/deadisland/audio/narration.mp3`, `src/deadisland/data/transcript.json` (segments), `transcript.words.json` (word timings), `docs/deadisland/narration.srt`, `docs/deadisland/narration-transcript.txt` |
| Source metadata | `src/deadisland/data/sources.json`; readable manifest in `docs/deadisland/SOURCES.md` |
| Footage library (not committed) | `media/deadisland/raw/<source id>.<ext>`; review sheets in `media/deadisland/sheets/` |
| Edit decision list | `tools/deadisland/edit/*.edl`, one file per group of chapters; compiled to `src/deadisland/data/timeline.json` |
| Readable timeline and footage registry | `docs/deadisland/TIMELINE.md`, `docs/deadisland/footage-registry.csv` |
| Audio assets | `public/deadisland/audio/music-bed.m4a` (original score, synthesised by `tools/deadisland/music.py`), `public/deadisland/audio/beds/` (source sound laid under several shots) |
| Visual components | `src/deadisland/DeadIslandDocumentary.tsx`, `src/deadisland/components/Label.tsx` |
| Conformed clips (not committed) | `public/deadisland/clips/<shot id>.mp4`, 1920×1080, 30 fps |
| Render output (not committed) | `out/deadisland/` |

## Rebuilding

```bash
pip install yt-dlp faster-whisper            # FFmpeg must be on PATH
python3 tools/deadisland/fetch.py             # Steam CDN and Internet Archive sources (Dailymotion ones are fetched with yt-dlp, see sources.json "via")
python3 tools/deadisland/build_timeline.py    # edit lists -> timeline.json
python3 tools/deadisland/cut.py               # conform every shot; writes footage-registry.csv
python3 tools/deadisland/qa_clips.py          # black / frozen frames inside shots
python3 tools/deadisland/review.py            # review sheets: first and last frame of every shot
python3 tools/deadisland/music.py 1672.1 public/deadisland/audio/music-bed.m4a
python3 tools/deadisland/manifest.py          # SOURCES.md and TIMELINE.md
bash tools/deadisland/render.sh               # Remotion: picture in chunks, sound in one pass
bash tools/deadisland/finish.sh               # join, then run the delivery checks
```

Preview: `npm run dev`, composition `DeadIslandDocumentary` (the clips must have been cut first).

## How the edit is written

A line of an edit list is `at | source id | source in | subject | options`. `at` is seconds on the narration clock and a shot
runs to the next shot's `at`, so moving one cut never shifts the rest of the film. Options: `x0.75` speed, `dis` / `dis0.8`
dissolve in, `fb1.0` fade from black, `crop=x,y,w,h`, `freeze`, `nat=0.1` (source sound), `reuse` (a deliberate callback to
footage used earlier; anything else that overlaps an earlier use of the same source is rejected by `cut.py --check`).
`L | at | duration | line | second line` is an on-screen label; `B | at | source | in | duration | level` lays a source's own
sound continuously under several shots.

Clip ids are derived from the source and in-point, so inserting a shot re-cuts only that shot.
