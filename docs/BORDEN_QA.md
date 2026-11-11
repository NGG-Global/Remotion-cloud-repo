# Lizzie Borden documentary: QA record

What was checked for `LizzieBorden`, how, and with what result. All checks ran in the 4-core Linux cloud container the episode was built in: Remotion 4.0.526, Chrome Headless Shell, SwiftShader GL (`--gl=swangle`). The stills were written to `.cache/qa/`, which is git-ignored.

**How the material was reviewed.** The film was not watched end to end. Every visual check below was done on rendered frames: three stills per shot at 6 %, 50 % and 94 % of its length (483 stills at half size), laid out on contact sheets and reviewed shot by shot, twice: once on the first complete cut and once after the fixes. The audio placement was checked numerically, against the decoded narration. A person should still watch the film once end to end for pacing, and on the target display.

## 1. Static checks

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npx tsc` | Passes. |
| Lint | `npx eslint src` | Passes. |
| Registration | `npx remotion compositions` | `LizzieBorden`: 30 fps, 1920×1080, 28446 frames (948.20 s). Also registered: the dev helpers `BordenRigSheet` and `BordenSetTest`. |
| Determinism | `src/borden` searched for `Math.random`, `http://`, `https://`, `@keyframes`, CSS `animation:` | No matches. |
| Browser console | both stills passes rendered with `LOGS=1` | Nothing logged. |
| Gacy episode | `GacyRigSheet` and the Gacy cast render through the extended rig | The rig changes are additive (new optional fields on `Look`, one new hair style); no Gacy look sets them. |

## 2. Audio and cut placement

| Check | Result |
| --- | --- |
| Narration | `public/audio/lizzie-narration.mp3`, byte-identical to the delivered file (MD5 `f3f2c5db2b3fbb170b02db6d22642b30`), 948.192653 s, MP3, 44.1 kHz, mono. |
| Composition length | `ceil(948.192653 × 30)` = 28446 frames. The narration ends inside the last frame; the last shot fades to black over its final 0.8 s. |
| Speech span | First speech at 0.10 s, last at 947.91 s (voice envelope: 20 ms RMS every 10 ms, threshold 12 % of the 98th-percentile level). |
| Word timing | Local faster-whisper pass (`large-v3`, Hebrew, word timestamps). 222 segments; the transcript matches the PDF script. The audio did not leave the machine. |
| Cut placement | All 160 cuts were snapped into measured pauses and then re-checked against the envelope on the final timeline: **none lands on speech**; the quiet stretch around a cut is at least 0.20 s and 0.67 s at the median. |
| Rendered clip | A 12 s clip of the title (frames 1900–2260, quarter size, H.264/AAC) rendered without error, with audio. The AAC priming offset measured on the Gacy episode (about 43 ms) applies to this setup too; the composition itself is sample-exact (`npm run render:master` for a PCM master). |

## 3. Stills: three per shot, two passes

- **What:** 483 stills at half size, three per shot, at 6 %, 50 % and 94 % of each of the 161 shots.
- **How:** `tools/stills.mjs` with one bundle and one browser (about 15 minutes per pass).
- **Looked for:** void or black frames outside the intended fades; set edges in frame; people at the wrong scale or on a plane behind the lens; furniture overlapping inside the narrow cells of the cutaway; heads or props sliced by the frame edge; shots that do not change across their three frames; label legibility; any body drawn; any text beyond the labels and in-picture props.

### Fixed after the first pass

| Problem | Shots |
| --- | --- |
| Room furniture overlapping inside the cutaway cells (the guest-room bureau on the bed, the kitchen range on the back door, the front-hall stairs too steep to read, the dining sideboard on a chair) | every shot in the guest room, the kitchen and the hall: the rooms were re-laid, the front and side doors moved into the end walls where the cutaway already showed them, the back stairs narrowed |
| People placed on a plane that was behind the lens at the shot's zoom (invisible) | `poison-fear`, `doctor` (the doctor's house rebuilt on the character plane), `pale-man`, `was-it-him` (the man now stands in the yard), the third beat of `shunned` |
| The yard was drawn behind the house, so anyone in it was hidden by the wall | `bridget-windows`, `lizzie-stays`, `nobody-heard`, `bridget-works`, `first-only`, `waited` and every other shot with people outside the cutaway |
| The family stood outside the frame at the graveside | `mother-died` |
| A prop hid the person (a ledger the size of a door) | `thrifty` |
| The subject was too small to read in an insert | `hatchet-head`, `who-held`, `when-how` (the hatchet head), `not-part` (the drawer filled the frame instead) |
| The camera ended on the wrong shopfront | `famous-detail` |
| The name on the house was covered by the nearer ground planes | `the-hill-home` (the name now sits on the porch beam) |
| A chair cut by the frame edge at the start of a move | `sisters` |
| The dress in her hands was the size of a lampshade | `holds-dress`, `burns` |
| Portrait sitters too small for their frames | `portraits`, `evidence-table` |
| The lying pose read as legs in the air | every sofa shot |

### Second pass

All 161 shots reviewed again on the final code. No black frames outside the fades, no set edge in frame, every shot changes across its three frames, every label legible. Two things are deliberate and were left: the dark held frame of `on-the-floor` (the guest room from its door, lit by one lamp) and the near-empty tray of `no-direct`.

## 4. Known limits

- The film has not been watched as video. Motion between frames (walks, camera moves, the dissolves) follows the same machinery as the Gacy episode, which was checked on clips, but a full-length viewing is still the right final check.
- The narrator's mid-sentence pauses are short in places; four cuts sit in pauses between 0.20 and 0.30 s (`second-street`, `no-witness`, `theory`, `survived`). They are in the voice's own gaps, but a viewer may find them brisk.
- The rig's hands are mittens; close-ups use the drawn `CloseHand` instead, as in the Gacy episode.

## 5. How to regenerate

Three stills per shot (frames come from each shot's `at` in `src/borden/data/timeline.ts`):

```bash
node tools/stills.mjs LizzieBorden out/qa 0.5 6,48,96 .cache/bundle
```

A clip:

```bash
npx remotion render LizzieBorden out/first-murder.mp4 --frames=7052-8273 --scale=0.5 --concurrency=4
```
