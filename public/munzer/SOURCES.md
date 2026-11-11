# Münzer episode: archive sources

The commissioning user confirmed that rights, credit and permissions for the
archive material are handled on their side. This file records where every
file came from, so the clearance can be checked against it.

## Video (`clips/`)

Downloaded with yt-dlp from Dailymotion (all uploaded by the channel
"BODYBUILDING WORLD"). The files here are the downloads with only the black
side bars cropped off, retimed to a constant 30 fps and re-encoded (H.264,
keyframe every 15 frames, AAC). Source seconds in the edit match the
original uploads second for second.

| File | Content | Source page | Uploaded |
| --- | --- | --- | --- |
| `am88.mp4` | Guest posing at a club show, Austria, 1988 (home video; the upload title gives Amstetten) | https://www.dailymotion.com/video/x9ahlxc | 2024-12-09 |
| `a90.mp4` | Arnold Classic 1990, posing routine | https://www.dailymotion.com/video/x90oq0m | 2024-06-21 |
| `o90.mp4` | Mr. Olympia 1990: TV stats card, posing routine, short interview | https://www.dailymotion.com/video/x900sc8 | 2024-06-09 |
| `pj93.mp4` | Mr. Olympia 1993, prejudging line-ups | https://www.dailymotion.com/video/x97kvhu | 2024-10-18 |
| `o94.mp4` | Mr. Olympia 1994, posing routine | https://www.dailymotion.com/video/x98m74k | 2024-11-05 |
| `a95.mp4` | Arnold Classic 1995, ESPN broadcast with commentary | https://www.dailymotion.com/video/x9aaqlq | 2024-12-05 |
| `a96.mp4` | Arnold Classic 1996, posing routine | https://www.dailymotion.com/video/x9cj4ua | 2025-01-17 |
| `ar70.mp4` | Arnold Schwarzenegger, Mr. Olympia 1970 compilation (photos and film) | https://www.dailymotion.com/video/x8c1zzq | 2022-06-28 |

The uploads carry the uploader's watermark in the corners. The edit frames
every shot inside a per-clip "safe" rectangle (`src/munzer/media.ts`) that
keeps those corners out of picture.

YouTube was not used: it refuses downloads from this cloud environment.

## Photographs (`photos/`)

| File | Source |
| --- | --- |
| `portrait-smile.jpg` | https://fitnessvolt.com/apis/bodybuilding/public/images/athletes/8202-andreas-munzer.jpg (white top edge cropped off) |
| `legpress-bw.jpg` | https://generationiron.com/wp-content/uploads/2022/11/munzer-legs.jpg |
| `backstage-15.jpg` | https://generationiron.com/wp-content/uploads/2022/11/munzer-pose.jpg |
| `side-chest-stage.jpg` | https://generationiron.com/wp-content/uploads/2022/11/munzer.jpg |
| `most-muscular-blue.jpg` | https://generationiron.com/wp-content/uploads/2022/11/munzer2-1.jpg |
| `weider-banner.jpg` | https://www.greatestphysiques.com/wp-content/uploads/2017/10/Andreas-Munzer.01.jpg |
| `side-chest-dark.jpg` | https://www.greatestphysiques.com/wp-content/uploads/2017/10/Andreas-Munzer.02.jpg |
| `most-muscular-curtain.jpg` | https://www.greatestphysiques.com/wp-content/uploads/2017/10/Andreas-Munzer.04.jpg |
| `double-biceps-30.jpg` | https://www.greatestphysiques.com/wp-content/uploads/2017/10/Andreas-Munzer.05.jpg |
| `gym-dumbbell-bw.jpg` | https://www.greatestphysiques.com/wp-content/uploads/2017/10/Andreas-Munzer.07.jpg |
| `side-biceps-stage.jpg` | https://www.greatestphysiques.com/wp-content/uploads/2017/10/Andreas-Munzer.08.jpg |
| `studio-purple.jpg` | https://www.greatestphysiques.com/wp-content/uploads/2017/10/Andreas-Munzer.09.jpg |

Left out on purpose: greatestphysiques.com photo 03 (a reader comment on that
page says it is not Münzer, and it does not clearly look like him), photos 06
and 10 (identity not certain from the picture) and photo 11 (a duplicate of
`most-muscular-blue.jpg`). The photographers are not named on these pages;
the owners of the original images were not identified.

## Stills (`stills/`)

Single frames pulled from the clips above by `tools/munzer-stills.mjs`. They
are listed in `STILLS` in `src/munzer/data/edl.ts` and counted by the reuse
check, so a frame shown as a still is never also shown as moving footage.

## Maps

`src/munzer/data/geo.ts`: country outlines from world.geo.json (Natural Earth,
public domain) and US state outlines from PublicaMundi's us-states.json.

## Sound

The narration (`narration.mp3`) is the user's upload, unchanged. The three
sound effects in `sfx/` are synthesised by `tools/munzer-sfx.sh`; no sampled
sound is used.
