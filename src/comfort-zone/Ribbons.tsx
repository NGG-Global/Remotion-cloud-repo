import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import data from "./data/words.json";

const [SHOT_START, SHOT_END] = data.ribbonShot;

type Pt = readonly [number, number];

/** A cubic Bezier chain: start point, then triples of control, control, end. */
type Ribbon = {
  readonly text: string;
  readonly from: number; // seconds
  readonly to: number;
  readonly points: readonly Pt[];
};

/**
 * The thoughts that drift out of the man's head in the box. The Hebrew
 * master has a stream of idle musings on curved paths; these are English
 * equivalents, not literal translations (the originals are too small to read
 * reliably in the compressed master).
 */
const RIBBONS: Ribbon[] = [
  {
    text: "What should I have for dinner?",
    from: 93.1,
    to: 95.4,
    points: [
      [1000, 630],
      [900, 560],
      [760, 470],
      [640, 380],
      [560, 320],
      [500, 270],
      [450, 230],
    ],
  },
  {
    text: "Did I lock the door?",
    from: 94.5,
    to: 96.7,
    points: [
      [1010, 625],
      [1120, 540],
      [1260, 470],
      [1320, 380],
      [1370, 310],
      [1420, 270],
      [1480, 240],
    ],
  },
  {
    text: "I could really use a nap",
    from: 95.3,
    to: 97.5,
    points: [
      [990, 640],
      [860, 620],
      [780, 540],
      [740, 470],
      [700, 410],
      [650, 360],
      [590, 320],
    ],
  },
  {
    text: "Is it six already?",
    from: 96.1,
    to: 98.3,
    points: [
      [1010, 635],
      [1150, 600],
      [1260, 520],
      [1300, 440],
      [1340, 370],
      [1400, 320],
      [1470, 290],
    ],
  },
  {
    text: "Pizza. Yeah, pizza.",
    from: 96.9,
    to: 98.9,
    points: [
      [1000, 630],
      [950, 540],
      [870, 470],
      [760, 440],
      [670, 420],
      [590, 380],
      [530, 330],
    ],
  },
  {
    text: "Maybe tomorrow...",
    from: 97.3,
    to: 98.9,
    points: [
      [1010, 630],
      [1100, 560],
      [1190, 480],
      [1240, 400],
      [1280, 330],
      [1320, 290],
      [1370, 260],
    ],
  },
];

const cubic = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] +
      3 * u * u * t * b[0] +
      3 * u * t * t * c[0] +
      t * t * t * d[0],
    u * u * u * a[1] +
      3 * u * u * t * b[1] +
      3 * u * t * t * c[1] +
      t * t * t * d[1],
  ];
};

const pathOf = (pts: readonly Pt[]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  let length = 0;
  for (let i = 1; i + 2 < pts.length; i += 3) {
    d += ` C ${pts[i][0]} ${pts[i][1]}, ${pts[i + 1][0]} ${pts[i + 1][1]}, ${pts[i + 2][0]} ${pts[i + 2][1]}`;
    let prev = pts[i - 1];
    for (let s = 1; s <= 40; s++) {
      const p = cubic(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], s / 40);
      length += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      prev = p;
    }
  }
  return { d, length };
};

const FONT_SIZE = 34;
// Rubik 500 lower case averages about 0.55 em per glyph.
const textWidth = (s: string) => s.length * FONT_SIZE * 0.55;

export const Ribbons: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOT_START || frame >= SHOT_END) {
    return null;
  }
  const t = frame / data.fps;
  const live = RIBBONS.filter((r) => t >= r.from && t < r.to);
  if (live.length === 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          {RIBBONS.map((r, i) => (
            <path
              key={i}
              id={`ribbon-${i}`}
              d={pathOf(r.points).d}
              fill="none"
            />
          ))}
        </defs>
        {live.map((r) => {
          const i = RIBBONS.indexOf(r);
          const { length } = pathOf(r.points);
          const w = textWidth(r.text);
          // The phrase slides along the path: it emerges from the head and
          // leaves off the far end.
          const offset = interpolate(t, [r.from, r.to], [-w, length + 10]);
          const fade = Math.min(1, (t - r.from) / 0.25, (r.to - t) / 0.3);
          return (
            <text
              key={i}
              fill="#eef2f6"
              opacity={0.82 * fade}
              fontFamily={fontFamily}
              fontWeight={600}
              fontSize={FONT_SIZE}
              letterSpacing={1}
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
            >
              <textPath href={`#ribbon-${i}`} startOffset={offset}>
                {r.text}
              </textPath>
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
