import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import data from "./data/words.json";
import type { Word, WordKey } from "./data/types";

const WORDS = data.words as Word[];

/** The track of the Hebrew word at `f`, held on the last key until the fly-out. */
const trackAt = (word: Word, f: number): WordKey | null => {
  const keys = word.keys;
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (f < first.f - 6 || f >= word.exit.to) {
    return null;
  }
  if (f <= first.f) {
    return first;
  }
  if (f >= last.f) {
    return last;
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = (f - a.f) / (b.f - a.f);
      return {
        f,
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        w: a.w + (b.w - a.w) * t,
        h: a.h + (b.h - a.h) * t,
      };
    }
  }
  return last;
};

// Rubik 800 capitals average about 0.68 em per glyph.
const ADVANCE = 0.68;
const DEPTH_STEPS = 9;

const Extruded: React.FC<{
  readonly text: string;
  readonly fontSize: number;
  readonly y: number;
}> = ({ text, fontSize, y }) => {
  const step = Math.max(0.6, fontSize * 0.016);
  const layers: React.ReactNode[] = [];
  for (let i = DEPTH_STEPS; i >= 1; i--) {
    const k = i / DEPTH_STEPS;
    layers.push(
      <text
        key={i}
        x={step * i}
        y={y + step * i}
        fill={`rgb(${Math.round(120 + 40 * (1 - k))},${Math.round(124 + 40 * (1 - k))},${Math.round(132 + 40 * (1 - k))})`}
        fontSize={fontSize}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={fontFamily}
        fontWeight={800}
      >
        {text}
      </text>,
    );
  }
  return (
    <>
      {layers}
      <text
        x={0}
        y={y}
        fill="#f1f3f5"
        fontSize={fontSize}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={fontFamily}
        fontWeight={800}
      >
        {text}
      </text>
    </>
  );
};

const WordOverlay: React.FC<{
  readonly word: Word;
  readonly frame: number;
}> = ({ word, frame }) => {
  const k = trackAt(word, frame);
  if (!k) {
    return null;
  }
  const lines = word.lines === 2 ? word.en.split(" ") : [word.en];
  const longest = Math.max(...lines.map((l) => l.length));
  // Size from the Hebrew word's height, but never wider than 1.8x its box
  // (English words run longer than the Hebrew ones).
  const byHeight = (k.h / lines.length) * 1.2;
  const byWidth = (k.w * 1.8) / (ADVANCE * longest);
  const fontSize = Math.min(byHeight, byWidth);

  const ex = word.exit;
  const p = interpolate(frame, [ex.from, ex.to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q = p * p;
  const scale = 1 + (ex.scale - 1) * q;
  const tx = ex.dx * q;
  const ty = ex.dy * q;
  const blur = 14 * p;
  const fadeIn = interpolate(
    frame,
    [word.keys[0].f - 6, word.keys[0].f + 4],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const fadeOut = interpolate(p, [0.75, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tilt = -4 - 10 * q;

  return (
    <g
      opacity={fadeIn * fadeOut}
      transform={`translate(${k.x + tx} ${k.y + ty}) scale(${scale}) rotate(${tilt}) skewX(-6)`}
      style={{ filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}
    >
      {lines.map((line, i) => (
        <Extruded
          key={line}
          text={line}
          fontSize={fontSize}
          y={(i - (lines.length - 1) / 2) * fontSize * 1.05}
        />
      ))}
    </g>
  );
};

/**
 * English stand-ins for the extruded 3D words that fly through the drone
 * shots. Each one follows the track measured off the Hebrew word
 * (data/words.json) and then flies out of frame the way the original did.
 */
export const SkyWords: React.FC = () => {
  const frame = useCurrentFrame();
  const active = WORDS.filter(
    (w) => frame >= w.keys[0].f - 6 && frame < w.exit.to,
  );
  if (active.length === 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="word-shadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="8"
              floodColor="#000"
              floodOpacity="0.35"
            />
          </filter>
        </defs>
        <g filter="url(#word-shadow)">
          {active.map((w) => (
            <WordOverlay key={w.id} word={w} frame={frame} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
