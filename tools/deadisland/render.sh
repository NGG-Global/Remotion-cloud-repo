#!/bin/bash
# Full render of the Dead Island documentary.
# Picture is rendered by Remotion in chunks (so an interrupted run resumes where it stopped), sound is rendered by
# Remotion in one pass, and FFmpeg joins them without re-encoding the picture.
# Usage: bash tools/deadisland/render.sh   (from the repository root)
set -euo pipefail
OUT=out/deadisland; BUNDLE=.cache/di/bundle; CHUNK=5000
mkdir -p "$OUT/chunks"
TOTAL=$(node -e 'const t=require("./src/deadisland/data/timeline.json");console.log(Math.round((t.narration+t.tail)*t.fps))')
[ -f "$BUNDLE/index.html" ] || npx remotion bundle --out-dir "$BUNDLE" > "$OUT/bundle.log" 2>&1
: > "$OUT/chunks/list.txt"
for ((a=0; a<TOTAL; a+=CHUNK)); do
  b=$((a+CHUNK-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "%s/chunks/v_%06d.mp4" "$OUT" $a)
  if [ ! -f "$f" ]; then
    npx remotion render "$BUNDLE" DeadIslandDocumentary "$f.tmp.mp4" --frames=$a-$b --muted --concurrency=4 --crf=18 --log=error
    mv "$f.tmp.mp4" "$f"
  fi
  echo "file '$(basename "$f")'" >> "$OUT/chunks/list.txt"
  echo "chunk $a-$b done $(date -u +%H:%M:%S)"
done
[ -f "$OUT/audio.wav" ] || npx remotion render "$BUNDLE" DeadIslandDocumentary "$OUT/audio.wav" --codec=wav --log=error
echo "RENDERED"
