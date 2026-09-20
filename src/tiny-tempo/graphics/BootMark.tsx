import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import {
  clamp,
  clamp01,
  easeOut,
  lastHitAge,
  settle,
  squash,
  useClock,
} from "../clock";
import { ChipBurst, ImpactFlash } from "../components/feedback";
import { Grain } from "../components/stage";
import { faces, mix, shade, TT } from "../theme";

/**
 * The launcher icon, drawn so it can move. One strike, then it holds the pose
 * printed on the app mark — head on the peg, not a gameplay recovery.
 */
const HIT = 1.5;

const PEG_X = 1140;
const FLOOR_Y = 838;
const PEG_TOP = 574;
const PEG_FACE_Y = PEG_TOP + 12;
const HERO = 1.42;

/** Local mallet, pivot at the grip. Head sits to the right, face on +Y. */
const PIVOT = { x: 52, y: 102 };
const FACE = { x: 431, y: 174 };

const CONTACT_DEG = 16;
const LOGO_DEG = 16;
const WINDUP_DEG = -36;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const rotate = (
  x: number,
  y: number,
  deg: number,
): readonly [number, number] => {
  const a = toRad(deg);
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
};

const pivotForContact = (): readonly [number, number] => {
  const [dx, dy] = rotate(
    (FACE.x - PIVOT.x) * HERO,
    (FACE.y - PIVOT.y) * HERO,
    CONTACT_DEG,
  );
  return [PEG_X - dx, PEG_FACE_Y - dy];
};

const [PIVOT_X, PIVOT_Y] = pivotForContact();

/** Lift, slam, settle into the icon. Degrees, clockwise. */
const bootAngle = (time: number): number => {
  const until = HIT - time;
  const age = time - HIT;
  if (until > 0.3) return WINDUP_DEG;
  if (until > 0) {
    const p = clamp01(1 - until / 0.3);
    if (p < 0.38) {
      return WINDUP_DEG - 10 * Math.sin((p / 0.38) * (Math.PI / 2));
    }
    const slam = ((p - 0.38) / 0.62) ** 3;
    const lifted = WINDUP_DEG - 10;
    return lifted + (CONTACT_DEG - lifted) * slam;
  }
  const p = clamp01((age - 0.02) / 0.36);
  const settlePos = CONTACT_DEG + (LOGO_DEG - CONTACT_DEG) * easeOut(p);
  return settlePos + 0.5 * Math.sin(p * Math.PI) ** 2;
};

export const BootMark: React.FC = () => {
  const { frame, fps, time, durationInFrames } = useClock();
  const hits = [HIT];
  const age = lastHitAge(time, hits);
  const ink = faces(TT.ink);
  const cream = faces(TT.cream);
  const wood = faces(TT.wood);
  const floor = faces("#c9a06a");

  const field = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 1.1 },
  });
  const floorIn = spring({
    frame: frame - Math.round(0.1 * fps),
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const pegIn = spring({
    frame: frame - Math.round(0.26 * fps),
    fps,
    config: { damping: 10, mass: 0.65, stiffness: 170 },
  });
  const hammerIn = spring({
    frame: frame - Math.round(0.68 * fps),
    fps,
    config: { damping: 11, mass: 0.72, stiffness: 130 },
  });

  const rot = bootAngle(time);
  const enterX = interpolate(hammerIn, [0, 1], [-520, 0]);
  const enterY = interpolate(hammerIn, [0, 1], [-160, 0]);
  const enterRot = interpolate(hammerIn, [0, 1], [-24, 0]);
  const idle = time > HIT + 0.45 ? Math.sin((time - HIT) * 1.05) * 0.55 : 0;
  const press = squash(age, 0.16, 0.04);
  const shake = settle(age, 108, 19) * 10;
  const punch = squash(age, 0.22, 0.045);
  const ken = clamp(time, [0, durationInFrames / fps], [1.0, 1.06]);
  const sunScale = interpolate(field, [0, 1], [0.78, 1]);
  const sunGlow = 0.55 + squash(age, 0.5, 0.4);

  return (
    <AbsoluteFill style={{ backgroundColor: TT.coral, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 36%, ${TT.coralLit} 0%, ${TT.coral} 54%, ${TT.coralDeep} 100%)`,
          opacity: interpolate(field, [0, 1], [0.4, 1]),
        }}
      />
      <Grain opacity={0.2} />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{
          transform: `translate(${shake}px, ${shake * 0.32}px) scale(${ken + punch})`,
          transformOrigin: "52% 48%",
        }}
      >
        <circle
          cx="930"
          cy="400"
          r="460"
          fill={mix(TT.coralLit, "#e8896c", 0.35)}
          opacity={0.55 * field * sunGlow}
          transform={`translate(930 400) scale(${sunScale}) translate(-930 -400)`}
        />

        <g
          transform={`translate(0 ${interpolate(floorIn, [0, 1], [140, 0])})`}
          opacity={interpolate(floorIn, [0, 0.2], [0, 1], {
            extrapolateRight: "clamp",
          })}
        >
          <rect
            x="0"
            y={FLOOR_Y}
            width="1920"
            height={1080 - FLOOR_Y}
            fill={floor.face}
          />
          <rect x="0" y={FLOOR_Y} width="1920" height="18" fill={floor.lit} />
          <rect
            x="0"
            y={FLOOR_Y + 18}
            width="1920"
            height="8"
            fill={floor.shade}
          />
          <rect
            x="0"
            y={FLOOR_Y - 7}
            width="1920"
            height="7"
            fill={wood.edge}
          />
          <ellipse
            cx="390"
            cy="990"
            rx="46"
            ry="17"
            fill={TT.inkDeep}
            opacity="0.22"
          />
          <ellipse
            cx="390"
            cy="986"
            rx="30"
            ry="8"
            fill={mix(TT.ink, TT.woodDark, 0.4)}
          />
          <ellipse
            cx="590"
            cy="1034"
            rx="38"
            ry="15"
            fill={TT.inkDeep}
            opacity="0.18"
          />
          <ellipse
            cx="590"
            cy="1030"
            rx="26"
            ry="7"
            fill={mix(TT.ink, TT.woodDark, 0.4)}
          />
        </g>

        <g
          transform={`translate(${PEG_X} ${FLOOR_Y}) scale(1 ${1 - press})`}
          opacity={interpolate(pegIn, [0, 0.2], [0, 1], {
            extrapolateRight: "clamp",
          })}
        >
          <g
            transform={`translate(0 ${interpolate(pegIn, [0, 1], [110, 0])}) scale(${interpolate(pegIn, [0, 1], [0.62, 1])})`}
          >
            <ellipse
              cx="8"
              cy="14"
              rx="86"
              ry="20"
              fill="none"
              stroke={cream.face}
              strokeWidth="7"
              opacity="0.6"
            />
            <ellipse
              cx="4"
              cy="12"
              rx="68"
              ry="15"
              fill={TT.inkDeep}
              opacity="0.18"
            />
            <rect
              x="-18"
              y={PEG_TOP - FLOOR_Y + 12}
              width="36"
              height={FLOOR_Y - PEG_TOP - 8}
              rx="9"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="7"
            />
            <rect
              x="-10"
              y={PEG_TOP - FLOOR_Y + 24}
              width="9"
              height={FLOOR_Y - PEG_TOP - 40}
              rx="4"
              fill={ink.lit}
              opacity="0.55"
            />
            <ellipse
              cx="0"
              cy={PEG_TOP - FLOOR_Y + 10}
              rx="64"
              ry="22"
              fill={ink.face}
              stroke={ink.edge}
              strokeWidth="8"
            />
            <ellipse
              cx="0"
              cy={PEG_TOP - FLOOR_Y}
              rx="64"
              ry="16"
              fill={ink.lit}
            />
            <ellipse
              cx="-12"
              cy={PEG_TOP - FLOOR_Y - 4}
              rx="20"
              ry="6"
              fill={ink.rim}
              opacity="0.45"
            />
          </g>
        </g>

        <g
          transform={`translate(${enterX} ${enterY})`}
          opacity={interpolate(hammerIn, [0, 0.16], [0, 1], {
            extrapolateRight: "clamp",
          })}
        >
          <g
            transform={`translate(${PIVOT_X} ${PIVOT_Y}) rotate(${rot + enterRot + idle}) scale(${HERO})`}
          >
            <Mallet />
          </g>
        </g>

        <ImpactFlash cx={PEG_X} cy={PEG_FACE_Y} age={age} scale={2.1} />
        <ChipBurst
          cx={PEG_X + 24}
          cy={PEG_FACE_Y + 6}
          age={age}
          colors={[TT.cream, TT.puck, TT.woodLit, shade(TT.cream, -0.08)]}
        />
        <LogoSticks cx={PEG_X + 20} cy={PEG_FACE_Y} age={age} />
      </svg>
    </AbsoluteFill>
  );
};

type LogoSticksProps = {
  readonly cx: number;
  readonly cy: number;
  readonly age: number;
};

/** The longer cream shards in the launcher icon, thrown on contact. */
const LogoSticks: React.FC<LogoSticksProps> = ({ cx, cy, age }) => {
  if (!Number.isFinite(age) || age < 0 || age > 0.48) return null;
  const p = age / 0.48;
  const opacity = interpolate(p, [0, 0.1, 0.7, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sticks = [
    { a: -0.35, d: 78, w: 34, h: 9, rot: 28, fill: TT.cream },
    { a: 0.55, d: 92, w: 38, h: 8, rot: -18, fill: TT.puck },
    { a: -1.15, d: 64, w: 22, h: 8, rot: 48, fill: TT.cream },
    { a: 0.2, d: 108, w: 16, h: 16, rot: 12, fill: TT.woodLit },
    { a: 1.05, d: 70, w: 20, h: 7, rot: -40, fill: shade(TT.cream, -0.06) },
  ];

  return (
    <g
      transform={`translate(${cx} ${cy})`}
      opacity={opacity}
      pointerEvents="none"
    >
      {sticks.map((stick, i) => {
        const dist = stick.d * (0.2 + p * 1.15);
        const x = Math.cos(stick.a) * dist;
        const y = Math.sin(stick.a) * dist * 0.62 - (1 - (2 * p - 1) ** 2) * 28;
        return (
          <rect
            key={i}
            x={-stick.w / 2}
            y={-stick.h / 2}
            width={stick.w}
            height={stick.h}
            rx={3}
            fill={stick.fill}
            transform={`translate(${x} ${y}) rotate(${stick.rot + p * 55})`}
          />
        );
      })}
    </g>
  );
};

/** Grip-left cream shaft, ink head — the mark on the app icon. */
const Mallet: React.FC = () => {
  const ink = faces(TT.ink);
  const cream = faces(TT.cream);
  const steel = mix(TT.ink, TT.cream, 0.42);

  return (
    <g transform={`translate(${-PIVOT.x} ${-PIVOT.y})`}>
      <rect
        x="90"
        y="90"
        width="310"
        height="52"
        rx="18"
        fill={TT.inkDeep}
        opacity="0.18"
      />
      <rect
        x="2"
        y="64"
        width="108"
        height="76"
        rx="24"
        fill={ink.shade}
        stroke={ink.edge}
        strokeWidth="7"
      />
      <rect x="2" y="64" width="108" height="26" rx="24" fill={ink.lit} />
      <rect x="2" y="88" width="108" height="52" rx="22" fill={ink.face} />
      <rect
        x="16"
        y="74"
        width="58"
        height="11"
        rx="5"
        fill={ink.rim}
        opacity="0.42"
      />

      <rect
        x="86"
        y="74"
        width="300"
        height="56"
        rx="9"
        fill={cream.shade}
        stroke={cream.edge}
        strokeWidth="6"
      />
      <rect x="86" y="74" width="300" height="34" rx="9" fill={cream.face} />
      <rect
        x="108"
        y="80"
        width="256"
        height="11"
        rx="5"
        fill={cream.lit}
        opacity="0.92"
      />

      <path
        d="M320 54 L376 42 L388 86 L352 98 L322 90 Z"
        fill={ink.face}
        stroke={ink.edge}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <rect
        x="352"
        y="40"
        width="158"
        height="132"
        rx="13"
        fill={ink.face}
        stroke={ink.edge}
        strokeWidth="8"
      />
      <rect x="352" y="40" width="158" height="28" rx="13" fill={ink.lit} />
      <rect
        x="362"
        y="48"
        width="126"
        height="7"
        rx="3"
        fill={ink.rim}
        opacity="0.55"
      />
      <rect x="356" y="136" width="150" height="32" rx="8" fill={ink.shade} />
      <rect x="356" y="152" width="150" height="18" rx="6" fill={steel} />
      <rect x="352" y="164" width="158" height="10" rx="4" fill={ink.edge} />
      <circle cx="464" cy="90" r="8" fill={cream.face} />
      <circle cx="464" cy="90" r="3.8" fill={cream.shade} />
    </g>
  );
};
