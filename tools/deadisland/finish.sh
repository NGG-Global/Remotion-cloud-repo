#!/bin/bash
# Joins the rendered picture chunks with the Remotion-rendered sound into the delivery MP4, then runs the checks.
# Usage: bash tools/deadisland/finish.sh   (after tools/deadisland/render.sh has printed RENDERED)
set -euo pipefail
OUT=out/deadisland; FINAL="$OUT/Dead-Island-Behind-the-Nightmare.mp4"
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/chunks/list.txt" -i "$OUT/audio.wav" -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart -shortest "$FINAL"
echo "== format"; ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels,nb_frames -of default=nw=1 "$FINAL"
echo "== black passages (>= 0.2 s)"; ffmpeg -hide_banner -i "$FINAL" -vf "blackdetect=d=0.2:pix_th=0.08" -an -f null - 2>&1 | grep black_start || echo none
echo "== frozen picture (>= 2 s)"; ffmpeg -hide_banner -i "$FINAL" -vf "freezedetect=n=0.001:d=2" -an -f null - 2>&1 | grep -E "freeze_start|freeze_duration" || echo none
echo "== loudness"; ffmpeg -hide_banner -i "$FINAL" -vn -af ebur128=peak=true -f null - 2>&1 | tail -12 | grep -E "I:|LRA:|Peak:"
echo "== silence (>= 3 s)"; ffmpeg -hide_banner -i "$FINAL" -vn -af silencedetect=n=-55dB:d=3 -f null - 2>&1 | grep silence_start || echo none
