#!/bin/bash
# Synthesises the Münzer episode's three sound effects with ffmpeg alone, so
# no sampled audio is involved. Writes public/munzer/sfx/*.wav.
set -euo pipefail
out=public/munzer/sfx
mkdir -p "$out"
ff() { ffmpeg -v error -y "$@"; }

# Heartbeat: two low thumps ("lub-dub"), 52 Hz and 46 Hz with fast decay.
ff -f lavfi -i "aevalsrc='0.9*sin(2*PI*52*t)*exp(-t*16)*lt(t,0.35) + 0.7*sin(2*PI*46*(t-0.26))*exp(-(t-0.26)*14)*gte(t,0.26)':s=48000:d=1.1" \
   -af "lowpass=f=140,volume=2.2,afade=t=out:st=0.9:d=0.2" -ac 2 "$out/heartbeat.wav"

# Low hit for the title: a falling sine with a long dark tail.
ff -f lavfi -i "aevalsrc='0.8*sin(2*PI*(58-18*t)*t)*exp(-t*1.4)':s=48000:d=3.6" \
   -f lavfi -i "anoisesrc=d=3.6:c=brown:r=48000:a=0.25" \
   -filter_complex "[1]lowpass=f=90,afade=t=out:st=0.05:d=3.4[n];[0][n]amix=inputs=2:weights=1 0.5,lowpass=f=160,aecho=0.8:0.6:120:0.35,volume=1.8" -ac 2 "$out/hit.wav"

# Monitor beep: a soft 880 Hz blip.
ff -f lavfi -i "sine=f=880:d=0.16:r=48000" -af "afade=t=in:d=0.01,afade=t=out:st=0.08:d=0.08,volume=0.8" -ac 2 "$out/beep.wav"
ls -la "$out"
