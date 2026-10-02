#!/usr/bin/env sh
# Replace a render's audio track with the original master, muxed so players
# compensate the AAC encoder's priming delay.
#
#   tools/remux-audio.sh out/tiny-tempo-teaser.mp4 public/audio/tiny-tempo-home.wav out/tiny-tempo-teaser-final.mp4 [volume]
#
# Remotion's own mux writes the AAC track without the edit list that skips the
# encoder's priming samples, so the audio lands about 43 ms (2048 samples at
# 48 kHz) late in players. For a piece cut to the beat that is over a frame.
# Re-encoding the master with ffmpeg's MP4 muxer writes the edit list and the
# track lines up to the millisecond (checked by cross-correlating the decoded
# output against the master).
set -eu
in="$1"; audio="$2"; out="$3"; volume="${4:-0.95}"
ffmpeg -hide_banner -loglevel error -y \
  -i "$in" -i "$audio" \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 320k -af "volume=$volume" \
  -movflags +faststart -shortest \
  "$out"
echo "wrote $out"
