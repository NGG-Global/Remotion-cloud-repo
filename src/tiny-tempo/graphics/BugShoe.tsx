import React from "react";
import { AbsoluteFill } from "remotion";
import {
  clamp,
  clamp01,
  easeOut,
  lastHitAge,
  nextHitIn,
  squash,
  useClock,
} from "../clock";
import { ChipBurst, ImpactFlash } from "../components/feedback";
import { Grain } from "../components/stage";
import { faces, GARDEN } from "../theme";

type BugShoeProps = {
  readonly hits: readonly number[];
};

const STOPS = [0, -110, 90, -50];

/** Cream-soled sneaker, plum rubber bug. The bug is never hurt — it squashes and rides. */
export const BugShoe: React.FC<BugShoeProps> = ({ hits }) => {
  const { time, durationInFrames, fps } = useClock();
  const steps = hits.filter((h) => h <= time).length;
  const contactX = STOPS[Math.max(0, steps - 1) % STOPS.length]!;
  const prevX = steps <= 1 ? contactX : STOPS[(steps - 2) % STOPS.length]!;
  const age = lastHitAge(time, hits);
  const until = nextHitIn(time, hits);
  let lift = Number.isFinite(age)
    ? 220 * easeOut(clamp01((age - 0.035) / 0.28))
    : 220;
  if (until !== null && until < 0.22) {
    const p = 1 - until / 0.22;
    lift =
      lift * (1 - p) + (220 + Math.sin(p * Math.PI) * 40 - p ** 5 * 220) * p;
  }
  if (!Number.isFinite(age) && until === null) lift = 220;
  const finished = steps >= hits.length && Number.isFinite(age) && age > 0.2;
  if (finished) lift = 22 * easeOut(clamp01((age - 0.2) / 0.4));
  const squashAmt = squash(age, 0.12, 0.9);
  const shoeX = 960 + contactX;
  const bugSlide = prevX + (contactX - prevX) * easeOut(clamp01(age / 0.18));
  const ride = finished ? easeOut(clamp01((age - 0.2) / 0.5)) : 0;
  const bugX = 960 + bugSlide + ride * -90;
  const bugY = 700 - 24 - ride * 120 - Math.sin(clamp01(ride) * Math.PI) * 80;
  const ken = clamp(time, [0, durationInFrames / fps], [1.18, 1.28]);
  const upper = faces(GARDEN.upper);
  const cream = faces(GARDEN.cream);
  const coral = faces(GARDEN.coral);
  const body = faces(GARDEN.plum);
  const wiggle = Math.sin(time * 14);

  return (
    <AbsoluteFill style={{ backgroundColor: GARDEN.paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 58% 38%, ${GARDEN.cream}66 0%, transparent 55%)`,
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{
          transform: `scale(${ken})`,
          transformOrigin: "50% 68%",
        }}
      >
        <rect x="0" y="720" width="1920" height="400" fill={GARDEN.tile} />
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={752 + i * 70}
            x2="1920"
            y2={752 + i * 70}
            stroke={GARDEN.ink}
            strokeWidth="2"
            opacity="0.12"
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 180 - 40}
            y1="720"
            x2={i * 220 - 80}
            y2="1080"
            stroke={GARDEN.ink}
            strokeWidth="2"
            opacity="0.1"
          />
        ))}
        <rect
          x="0"
          y="716"
          width="1920"
          height="10"
          fill={faces(GARDEN.tile).lit}
        />
        <rect
          x="0"
          y="714"
          width="1920"
          height="6"
          fill={faces(GARDEN.tile).edge}
        />

        <ellipse
          cx={shoeX}
          cy="728"
          rx={180 * (1 - lift / 900)}
          ry="16"
          fill={GARDEN.ink}
          opacity={0.16 * (1 - lift / 500)}
        />

        <g
          transform={`translate(${bugX} ${bugY}) scale(${1 + squashAmt * 0.35}, ${1 - squashAmt * 0.35})`}
        >
          {[-1, 0, 1].map((i) => (
            <g key={i}>
              <line
                x1={i * 16}
                y1={12}
                x2={i * 26 - 6}
                y2={24 + wiggle * 4}
                stroke={GARDEN.ink}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={i * 16}
                y1={-4}
                x2={i * 26 + 4}
                y2={-18 - wiggle * 4}
                stroke={GARDEN.ink}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          ))}
          <ellipse cx="0" cy="2" rx="40" ry="22" fill={body.shade} />
          <ellipse
            cx="0"
            cy="0"
            rx="40"
            ry="22"
            fill={body.face}
            stroke={body.edge}
            strokeWidth="6"
          />
          <ellipse cx="-10" cy="-6" rx="18" ry="10" fill={GARDEN.plumLit} />
          <line
            x1="-4"
            y1="-16"
            x2="-4"
            y2="16"
            stroke={GARDEN.ink}
            strokeWidth="2"
            opacity="0.45"
          />
          {[22, 36].map((ex) => (
            <g key={ex}>
              <circle cx={ex} cy={-14} r="11" fill={GARDEN.cream} />
              <circle
                cx={ex + Math.sin(time * 2) * 2}
                cy={-16}
                r="4"
                fill={GARDEN.ink}
              />
            </g>
          ))}
          <line
            x1="28"
            y1="-22"
            x2={24 + Math.sin(time * 7) * 5}
            y2="-44"
            stroke={GARDEN.ink}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        <g
          transform={`translate(${shoeX} ${720 - lift}) rotate(${-8 * clamp01(lift / 220)}) scale(${1 + squashAmt * 0.04}, ${1 - squashAmt * 0.04})`}
        >
          <rect
            x="-200"
            y="-108"
            width="350"
            height="95"
            rx="40"
            fill={upper.shade}
            stroke={GARDEN.ink}
            strokeWidth="8"
          />
          <rect
            x="-200"
            y="-108"
            width="350"
            height="76"
            rx="40"
            fill={upper.face}
          />
          <rect
            x="-176"
            y="-104"
            width="210"
            height="16"
            rx="8"
            fill={upper.lit}
            opacity="0.75"
          />
          <rect
            x="46"
            y="-208"
            width="111"
            height="159"
            rx="19"
            fill={upper.shade}
            stroke={GARDEN.ink}
            strokeWidth="8"
          />
          <rect
            x="46"
            y="-208"
            width="111"
            height="134"
            rx="19"
            fill={upper.face}
          />
          <rect
            x="-148"
            y="-112"
            width="197"
            height="43"
            rx="18"
            fill="#516b69"
          />
          <rect
            x="-217"
            y="-57"
            width="389"
            height="57"
            rx="21"
            fill={cream.shade}
            stroke={cream.edge}
            strokeWidth="7"
          />
          <rect
            x="-217"
            y="-57"
            width="389"
            height="44"
            rx="21"
            fill={cream.face}
          />
          <rect
            x="-206"
            y="-53"
            width="360"
            height="8"
            rx="4"
            fill={cream.rim}
            opacity="0.8"
          />
          <rect
            x="-213"
            y="-13"
            width="381"
            height="13"
            rx="5"
            fill="#b8ab8a"
          />
          <rect
            x="142"
            y="-188"
            width="20"
            height="66"
            rx="6"
            fill={coral.face}
            stroke={coral.edge}
            strokeWidth="5"
          />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={-83 + i * 29}
              y1={-108 - i * 7}
              x2={-65 + i * 29}
              y2={-80 - i * 7}
              stroke={GARDEN.cream}
              strokeWidth="7"
              opacity="0.9"
            />
          ))}
        </g>

        <ImpactFlash
          cx={shoeX}
          cy={720}
          age={age}
          color={GARDEN.cream}
          scale={1.4}
        />
        <ChipBurst
          cx={shoeX}
          cy={718}
          age={age}
          colors={[GARDEN.cream, GARDEN.tile, "#9aa882"]}
        />
      </svg>
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
