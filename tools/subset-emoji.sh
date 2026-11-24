#!/usr/bin/env bash
# Rebuild public/fonts/emoji/VectorsEmoji.ttf: a subset of Noto Color Emoji
# (SIL OFL 1.1) holding only the emoji the vertical explainer draws.
#
# Collects every emoji literal under src/vectors, so adding a glyph to a scene
# and rerunning this is all it takes. Needs fonttools (pip install fonttools)
# and the system Noto Color Emoji font (fonts-noto-color-emoji on Debian/Ubuntu).
set -euo pipefail

SRC_FONT="${NOTO_EMOJI:-/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf}"
OUT="public/fonts/emoji/VectorsEmoji.ttf"

chars=$(python3 - <<'PY'
import pathlib, re
text = "".join(p.read_text() for p in pathlib.Path("src/vectors").rglob("*.ts*"))
emoji = re.findall(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D]", text)
print("".join(sorted(set(emoji))))
PY
)

mkdir -p "$(dirname "$OUT")"
pyftsubset "$SRC_FONT" --text="$chars" --output-file="$OUT"
count=$(python3 -c 'import sys; print(len(sys.argv[1]))' "$chars")
echo "Subset $count codepoints -> $OUT ($(du -h "$OUT" | cut -f1))"
