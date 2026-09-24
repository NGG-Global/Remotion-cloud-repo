/**
 * Shadow-theatre silhouettes for the Whitechapel documentary.
 *
 * Every figure is cut in a local 100 x 200 box (bottom-centre at 50,200, so
 * the figure is 7.5 heads tall with the hat line at y=18) and scaled to the
 * `height` requested. Limbs are grouped by joint — hip, knee, shoulder, elbow —
 * so the walk cycles are joint rotations driven by `phase`, never by time.
 *
 * Nothing here is random: the only variation comes from `hash()` in theme.ts,
 * so a frame renders identically wherever it is rendered.
 */
import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { DOC, hash, mix } from "../theme";

// ---------------------------------------------------------------------------
// Shared plumbing
// ---------------------------------------------------------------------------

export type Base = {
  /** Bottom-centre of the figure, in 1920x1080 pixels. */
  readonly x: number;
  readonly y: number;
  /** Rendered height in pixels (the full 200-unit box). */
  readonly height: number;
  /** 1 faces right, -1 faces left. */
  readonly facing?: 1 | -1;
  readonly color?: string;
  readonly opacity?: number;
};

const TAU = Math.PI * 2;
const HAND_R = 4.2;

/** Format a number for a path string. */
const f = (n: number): string => (Math.round(n * 100) / 100).toString();

/** `useId()` returns characters that are awkward inside `url(#…)`. */
const useSafeId = (): string => useId().replace(/[^a-zA-Z0-9_-]/g, "");

/** Alpha-suffixed hex colour. */
const withAlpha = (hex: string, a: number): string => {
  const v = Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${v}`;
};

type RigProps = Base & {
  readonly children: React.ReactNode;
};

/**
 * The absolutely-positioned SVG every figure lives in. Children draw in
 * 0..100 x 0..200 units. Overflow stays visible so glows and beams can reach
 * past the box.
 */
const Rig: React.FC<RigProps> = ({
  x,
  y,
  height,
  facing = 1,
  opacity = 1,
  children,
}) => {
  const w = height / 2;
  return (
    <svg
      viewBox="0 0 100 200"
      width={w}
      height={height}
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - height,
        overflow: "visible",
        opacity,
        pointerEvents: "none",
      }}
    >
      <g transform={facing === -1 ? "translate(100 0) scale(-1 1)" : undefined}>
        {children}
      </g>
    </svg>
  );
};

/**
 * A tapered limb segment hanging along +y from the joint at the origin,
 * capped with half-circles so joints overlap cleanly.
 */
const limb = (len: number, w0: number, w1: number): string =>
  `M${f(-w0)},0 C${f(-w0)},${f(len * 0.45)} ${f(-w1)},${f(len * 0.75)} ${f(-w1)},${f(len)} ` +
  `A${f(w1)},${f(w1)} 0 0 0 ${f(w1)},${f(len)} ` +
  `C${f(w1)},${f(len * 0.75)} ${f(w0)},${f(len * 0.45)} ${f(w0)},0 ` +
  `A${f(w0)},${f(w0)} 0 0 0 ${f(-w0)},0 Z`;

/** Joint transform: move to the joint, then rotate (degrees, clockwise). */
const joint = (x: number, y: number, deg: number): string =>
  `translate(${f(x)} ${f(y)}) rotate(${f(deg)})`;

// ---------------------------------------------------------------------------
// Side-view parts (drawn facing right, +x is forward)
// ---------------------------------------------------------------------------

const SIDE = {
  shoulder: { x: 49, y: 52 },
  hip: { x: 50, y: 106 },
  thigh: 44,
  shank: 42,
  upperArm: 30,
  forearm: 28,
};

const HEAD_SIDE =
  "M50,12 C43,12 38,18 38,25 C38,30 39,34 42,37 C45,40 51,40.5 55,38.5 " +
  "C58,37 59,34 59.5,32 C61,31.5 62.5,30.5 62.5,29 C62.5,27.5 60,27 60,25.5 " +
  "C60.5,22 60,18 57,15 C55,13 53,12 50,12 Z";

const NECK_SIDE = "M44,33 L44,52 L57,52 L57,33 Z";

/** Flat cap: soft crown, short stiff peak. */
const CAP_SIDE =
  "M35,24 C35,15 44,8 53,8 C61,8 65.5,14 65.5,21.5 L64,23.5 L38,25 Z " +
  "M60,21.5 L71,24 C73,24.6 72.6,26.6 70.5,26.2 L60,24.5 Z";

/** Bowler: round crown, curled brim. */
const BOWLER_SIDE =
  "M32,20 C32,17 36,17 40,18 L60,18 C64,17 69,17 69,20 C69,22 65,22 60,21.5 L40,21.5 C36,22 32,22.5 32,20 Z " +
  "M38,20 C38,10 42,3 50.5,3 C59,3 63,10 63,20 Z";

/** Metropolitan Police custodian helmet: tall dome, small brim, rose top. */
const HELMET_SIDE =
  "M32,20.5 C32,17.5 36,17.5 40.5,18.5 L60.5,18.5 C65,17.5 69,17.5 69,20.5 C69,22.5 65,22.5 60.5,22 L40.5,22 C36,22.5 32,23 32,20.5 Z " +
  "M38,20 C37.5,10 42,2.5 50.5,2.5 C59,2.5 63.5,10 63,20 Z " +
  "M47.5,3.5 C47.5,0.8 49,0 50.5,0 C52,0 53.5,0.8 53.5,3.5 Z";

/** Bonnet: crown at the back of the head, brim framing the face, ribbon. */
const BONNET_SIDE =
  "M33,31 C29,17 38,5.5 51,6 C60,6.5 68,12 70,19.5 C67,20.5 63.5,19 61,17 " +
  "C60.5,21.5 58.5,25.5 55.5,27.5 C52,30.5 47,31.5 44,31.5 C40,31.5 36.5,31.5 33,31 Z " +
  "M50,40 C48,38.5 46.5,40 47,42 C47.5,44 50,44 51,42 C52,44 54.5,44 55,42 C55.5,40 54,38.5 52,40 Z " +
  "M36,29 C33,34 31,40 31.5,47 C33.5,46 35,44 36,42 C37,45 38.5,47 41,48 C40.5,41 39,34 37,29 Z";

/** Long overcoat, side view. `flare` pushes the tails back a little. */
const coatSide = (flare: number): string =>
  `M49,44 C44,44 40,46 38,50 C36,60 35.5,80 36,100 C36,120 ${f(35 - flare)},138 ${f(34 - flare)},150 ` +
  `C42,152 58,152 66,150 C66,138 65,120 64,100 C64,80 64,60 62,50 C60,46 56,44 52,44 Z`;

/** Boot, side view, ankle at the origin. */
const FOOT_SIDE =
  "M-4.5,-3 C-6.5,1 -6.5,5 -4.5,8 L12,8 C15.5,8 16.8,6.4 15,4.8 C12,3 8,1.5 5,-3 Z";

/** Hand as a loose fist. */
const Fist: React.FC<{ r?: number }> = ({ r = HAND_R }) => <circle r={r} />;

type LimbProps = {
  readonly hip: { x: number; y: number };
  readonly hipDeg: number;
  readonly kneeDeg: number;
  readonly ankleDeg: number;
  readonly thigh?: number;
  readonly shank?: number;
  readonly thick?: number;
};

const Leg: React.FC<LimbProps> = ({
  hip,
  hipDeg,
  kneeDeg,
  ankleDeg,
  thigh = SIDE.thigh,
  shank = SIDE.shank,
  thick = 1,
}) => (
  <g transform={joint(hip.x, hip.y, hipDeg)}>
    <path d={limb(thigh, 7.5 * thick, 5.6 * thick)} />
    <g transform={joint(0, thigh, kneeDeg)}>
      <path d={limb(shank, 5.6 * thick, 4.2 * thick)} />
      <g transform={joint(0, shank, ankleDeg)}>
        <path d={FOOT_SIDE} />
      </g>
    </g>
  </g>
);

type ArmProps = {
  readonly shoulder: { x: number; y: number };
  readonly shoulderDeg: number;
  readonly elbowDeg: number;
  readonly upper?: number;
  readonly fore?: number;
  readonly thick?: number;
  /** Drawn in the hand's frame (origin at the fist, +y down the forearm). */
  readonly children?: React.ReactNode;
};

const Arm: React.FC<ArmProps> = ({
  shoulder,
  shoulderDeg,
  elbowDeg,
  upper = SIDE.upperArm,
  fore = SIDE.forearm,
  thick = 1,
  children,
}) => (
  <g transform={joint(shoulder.x, shoulder.y, shoulderDeg)}>
    <path d={limb(upper, 5.6 * thick, 4.6 * thick)} />
    <g transform={joint(0, upper, elbowDeg)}>
      <path d={limb(fore, 4.6 * thick, 3.6 * thick)} />
      <g transform={`translate(0 ${f(fore + 1.5)})`}>
        <Fist />
        {children}
      </g>
    </g>
  </g>
);

/**
 * Walk-cycle joint angles for a side-view figure. Phase 0..1; the near leg is
 * forward at 0.25. Angles are degrees in SVG rotation (positive = clockwise,
 * which swings a hanging limb backwards when facing right).
 */
const gait = (phase: number, stride = 1) => {
  const t = phase * TAU;
  const leg = (th: number) => ({
    hip: -26 * stride * Math.sin(th),
    knee: (6 + 52 * Math.max(0, Math.cos(th))) * stride,
    ankle: 0,
  });
  const near = leg(t);
  const far = leg(t + Math.PI);
  // Keep the sole roughly level with the ground.
  near.ankle = -(near.hip + near.knee) * 0.75;
  far.ankle = -(far.hip + far.knee) * 0.75;
  const arm = (th: number) => ({
    shoulder: 22 * stride * Math.sin(th),
    elbow: -(14 + 26 * Math.max(0, -Math.sin(th))) * stride,
  });
  return {
    near,
    far,
    nearArm: arm(t),
    farArm: arm(t + Math.PI),
    /** Body drops at full stride, rises as the legs pass. */
    bob: 4 * Math.pow(Math.sin(t), 2) * stride,
    /** Coat tails trail on the forward step. */
    flare: 3 * Math.abs(Math.sin(t)) * stride,
  };
};

// ---------------------------------------------------------------------------
// Props held in hands
// ---------------------------------------------------------------------------

/**
 * Bull's-eye lantern hanging from the fist by its ring, lens forward.
 * `armDeg` is the world rotation of the forearm holding it, so the lantern
 * stays upright however the arm is posed. Children draw in the lantern's
 * upright frame (lens centre at 11,14) for beams.
 */
const HandLantern: React.FC<{
  glowId: string;
  armDeg: number;
  glow?: boolean;
  children?: React.ReactNode;
}> = ({ glowId, armDeg, glow = true, children }) => (
  <g transform={`rotate(${f(-armDeg)})`}>
    {glow ? <circle cx={3} cy={14} r={28} fill={`url(#${glowId})`} /> : null}
    <path d="M-2.4,2 C-2.4,-1.5 2.4,-1.5 2.4,2 L2.4,5.5 L-2.4,5.5 Z" />
    <path d="M-5.5,5 L5.5,5 C7,5 7.5,6 7.5,7.5 L7.5,21 C7.5,22.5 7,23.5 5.5,23.5 L-5.5,23.5 C-7,23.5 -7.5,22.5 -7.5,21 L-7.5,7.5 C-7.5,6 -7,5 -5.5,5 Z" />
    <path d="M7.5,9 C10.5,9.5 12.5,11.5 12.5,14.2 C12.5,17 10.5,19 7.5,19.5 Z" />
    {children}
  </g>
);

/** Gladstone bag hanging from the fist. */
const GLADSTONE =
  "M-3,3 L3,3 L3,6 L-3,6 Z " +
  "M-15,8 C-15,5 -11,3.5 -6,4 L6,4 C11,3.5 15,5 15,8 L15,23 C15,25.5 13,26.5 11,26.5 L-11,26.5 C-13,26.5 -15,25.5 -15,23 Z";

/**
 * Hand props are drawn in the fist frame: +y continues the line of the
 * forearm away from the elbow, so a raised forearm sends a blade upwards.
 */

/** Surgeon's knife: short grip, long narrow blade. */
const KNIFE =
  "M-2,-2 L-2,7 L2,7 L2,-2 Z M-1.8,7 C-2.2,15 -1.8,24 0.6,34 C2.6,24 2.8,15 1.8,7 Z";

/** Cleaver: grip in the fist, broad rectangular blade to -x. */
const CLEAVER =
  "M-1.8,-2 L-1.8,10 L1.8,10 L1.8,-2 Z " +
  "M2.5,10 L2.5,30 C2.5,31.5 1.5,32.5 0,32.5 L-20,32.5 C-21.5,32.5 -22.5,31.5 -22.5,30 L-22.5,14.5 C-22.5,12.5 -21,11.5 -19,11.5 L-6,11 L-3,9.5 Z " +
  "M-17,27.5 a1.7,1.7 0 1,0 0.01,0 Z";

/** Open scissors: finger rings at the fist, blades continuing on. */
const SCISSORS =
  "M-3.6,-1 a3,3 0 1,0 0.01,0 Z M3.6,-1 a3,3 0 1,0 0.01,0 Z " +
  "M-1.6,3 L-9.5,25 C-10,26.5 -8,27.5 -7.4,26 L1.4,5 Z " +
  "M1.6,3 L9.5,25 C10,26.5 8,27.5 7.4,26 L-1.4,5 Z " +
  "M-2,2 a2.2,2.2 0 1,0 0.01,0 Z";

/** Comb held by one end, teeth down, extending to -x. */
const COMB =
  "M-21,-1.5 L1,-1.5 C2,-1.5 2.5,-1 2.5,0 L2.5,2.5 L-22.5,2.5 L-22.5,0 C-22.5,-1 -22,-1.5 -21,-1.5 Z " +
  "M-21.5,2.5 L-21.5,7 L-20.2,7 L-20.2,2.5 Z M-18.7,2.5 L-18.7,7 L-17.4,7 L-17.4,2.5 Z M-15.9,2.5 L-15.9,7 L-14.6,7 L-14.6,2.5 Z M-13.1,2.5 L-13.1,7 L-11.8,7 L-11.8,2.5 Z M-10.3,2.5 L-10.3,7 L-9,7 L-9,2.5 Z M-7.5,2.5 L-7.5,7 L-6.2,7 L-6.2,2.5 Z M-4.7,2.5 L-4.7,7 L-3.4,7 L-3.4,2.5 Z M-1.9,2.5 L-1.9,7 L-0.6,7 L-0.6,2.5 Z";

const GlowDefs: React.FC<{ id: string; color?: string }> = ({
  id,
  color = DOC.gas,
}) => (
  <radialGradient id={id} cx="50%" cy="50%" r="50%">
    <stop offset="0%" stopColor={color} stopOpacity={0.55} />
    <stop offset="35%" stopColor={color} stopOpacity={0.22} />
    <stop offset="100%" stopColor={color} stopOpacity={0} />
  </radialGradient>
);

// ---------------------------------------------------------------------------
// Walker
// ---------------------------------------------------------------------------

type WalkerProps = Base & {
  readonly phase: number;
  readonly carry?: "none" | "lantern" | "sack";
  readonly hat?: "cap" | "bowler" | "none";
};

/** Side-view walking man in a long coat. */
export const Walker: React.FC<WalkerProps> = ({
  phase,
  carry = "none",
  hat = "cap",
  color = DOC.black,
  ...base
}) => {
  const id = useSafeId();
  const g = gait(phase);
  const glowId = `glow-${id}`;
  const hatPath =
    hat === "cap" ? CAP_SIDE : hat === "bowler" ? BOWLER_SIDE : null;

  return (
    <Rig {...base}>
      <defs>{carry === "lantern" ? <GlowDefs id={glowId} /> : null}</defs>
      <g fill={color} transform={`translate(0 ${f(g.bob)})`}>
        <Leg
          hip={SIDE.hip}
          hipDeg={g.far.hip}
          kneeDeg={g.far.knee}
          ankleDeg={g.far.ankle}
        />
        <Arm
          shoulder={SIDE.shoulder}
          shoulderDeg={g.farArm.shoulder}
          elbowDeg={g.farArm.elbow}
        />
        <path d={coatSide(g.flare)} />
        <path d={NECK_SIDE} />
        <path d={HEAD_SIDE} />
        {hat === "none" ? (
          <path d="M38,26 C37,16 43,10 51,10 C58,10 62,15 61,22 C57,17 50,17 44,20 C41,22 39,24 38,26 Z" />
        ) : null}
        {hatPath ? <path d={hatPath} /> : null}
        <Leg
          hip={SIDE.hip}
          hipDeg={g.near.hip}
          kneeDeg={g.near.knee}
          ankleDeg={g.near.ankle}
        />
        {carry === "sack" ? (
          <>
            <path
              transform={`translate(${SIDE.shoulder.x} ${SIDE.shoulder.y})`}
              d="M0,-8 C-10,-20 -34,-14 -34,4 C-34,18 -20,26 -8,18 C-2,14 0,2 0,-8 Z"
            />
            <Arm shoulder={SIDE.shoulder} shoulderDeg={-20} elbowDeg={175} />
          </>
        ) : carry === "lantern" ? (
          <Arm shoulder={SIDE.shoulder} shoulderDeg={-18} elbowDeg={-22}>
            <HandLantern glowId={glowId} armDeg={-40} />
          </Arm>
        ) : (
          <Arm
            shoulder={SIDE.shoulder}
            shoulderDeg={g.nearArm.shoulder}
            elbowDeg={g.nearArm.elbow}
          />
        )}
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// Constable
// ---------------------------------------------------------------------------

type ConstableProps = Base & {
  readonly phase?: number;
  readonly lantern?: boolean;
  /** 0..1 length of the light cone. */
  readonly beam?: number;
  /** Degrees; 0 is straight ahead, positive tips the beam towards the ground. */
  readonly beamAngle?: number;
};

/** Cape from the shoulders to the elbow; tunic skirt below a belted waist. */
const CAPE_SIDE =
  "M50,40 C40,41 35,48 34,57 C33,68 30.5,80 26,93 C38,96.5 62,96.5 74,93 " +
  "C69.5,80 67,68 66,57 C65,48 60,41 50,40 Z";
const TUNIC_SIDE =
  "M38,70 C37,82 37,92 38.5,102 C37,109 36.5,116 36.5,124 C45,126 56,126 64.5,124 " +
  "C64.5,116 64,109 62.5,102 C64,92 64,82 63,70 Z";

/** Metropolitan Police constable with a bull's-eye lantern held forward. */
export const Constable: React.FC<ConstableProps> = ({
  phase,
  lantern = true,
  beam = 0,
  beamAngle = 12,
  color = DOC.black,
  ...base
}) => {
  const id = useSafeId();
  const glowId = `glow-${id}`;
  const beamId = `beam-${id}`;
  const blurId = `blur-${id}`;
  const walking = phase !== undefined;
  const g = gait(phase ?? 0, walking ? 0.8 : 0);
  const beamLen = 250 * Math.min(1, Math.max(0, beam));
  const half = Math.tan((13 * Math.PI) / 180);

  return (
    <Rig {...base}>
      <defs>
        {lantern ? <GlowDefs id={glowId} /> : null}
        {lantern && beam > 0 ? (
          <>
            <linearGradient
              id={beamId}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={beamLen}
              y2={0}
            >
              <stop offset="0%" stopColor={DOC.gasHot} stopOpacity={0.5} />
              <stop offset="25%" stopColor={DOC.gas} stopOpacity={0.24} />
              <stop offset="100%" stopColor={DOC.gas} stopOpacity={0} />
            </linearGradient>
            <filter id={blurId} x="-10%" y="-40%" width="120%" height="180%">
              <feGaussianBlur stdDeviation={2.2} />
            </filter>
          </>
        ) : null}
      </defs>
      <g fill={color} transform={`translate(0 ${f(g.bob)})`}>
        {walking ? (
          <Leg
            hip={SIDE.hip}
            hipDeg={g.far.hip}
            kneeDeg={g.far.knee}
            ankleDeg={g.far.ankle}
          />
        ) : (
          <Leg hip={SIDE.hip} hipDeg={7} kneeDeg={2} ankleDeg={-8} />
        )}
        <Arm shoulder={SIDE.shoulder} shoulderDeg={8} elbowDeg={-10} />
        <path d={TUNIC_SIDE} />
        <path d={NECK_SIDE} />
        <path d={HEAD_SIDE} />
        <path d={HELMET_SIDE} />
        {walking ? (
          <Leg
            hip={SIDE.hip}
            hipDeg={g.near.hip}
            kneeDeg={g.near.knee}
            ankleDeg={g.near.ankle}
          />
        ) : (
          <Leg hip={SIDE.hip} hipDeg={-7} kneeDeg={2} ankleDeg={6} />
        )}
        <path d={CAPE_SIDE} />
        {/* Lantern arm reaches out from under the cape. */}
        <Arm shoulder={SIDE.shoulder} shoulderDeg={-58} elbowDeg={-24}>
          {lantern ? (
            <HandLantern glowId={glowId} armDeg={-82}>
              {beam > 0 ? (
                <g transform={`translate(12 14.2) rotate(${f(beamAngle)})`}>
                  <path
                    d={`M0,-4 L${f(beamLen)},${f(-beamLen * half - 4)} L${f(beamLen)},${f(beamLen * half + 4)} L0,4 Z`}
                    fill={`url(#${beamId})`}
                    filter={`url(#${blurId})`}
                  />
                </g>
              ) : null}
            </HandLantern>
          ) : null}
        </Arm>
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// Front-view parts (three-quarter poses are built from these)
// ---------------------------------------------------------------------------

const FRONT = {
  shoulderL: { x: 32, y: 53 },
  shoulderR: { x: 68, y: 53 },
  upperArm: 32,
  forearm: 30,
};

const HEAD_FRONT =
  "M50,11.5 C43.5,11.5 39.5,17 39.5,24 C39.5,30 43,35.5 47,37 C49,37.8 51,37.8 53,37 " +
  "C57,35.5 60.5,30 60.5,24 C60.5,17 56.5,11.5 50,11.5 Z " +
  "M39.8,22 C37.6,21.4 36.8,25.6 39.4,27.4 Z M60.2,22 C62.4,21.4 63.2,25.6 60.6,27.4 Z";

const NECK_FRONT = "M45,33 L45,50 L55,50 L55,33 Z";

/** Parted hair for a hatless gentleman. */
const HAIR_FRONT =
  "M38.5,26 C37.5,16 42,9.5 50,9.5 C58,9.5 62.5,15 61.5,25 C61,20 58,17.5 55,17.5 " +
  "C52,17.5 49,19.5 45,19 C41.5,18.5 39.5,21 38.5,26 Z";

const TOPHAT_FRONT =
  "M27.5,19 C27.5,16.8 32,16.8 37,17.6 L63,17.6 C68,16.8 72.5,16.8 72.5,19 C72.5,21 68,21.6 63,21 L37,21 C32,21.6 27.5,21.4 27.5,19 Z " +
  "M36.5,19 C36.5,12 36,6 35.5,2.5 C35.5,1 37,0.5 38.5,0.5 L61.5,0.5 C63,0.5 64.5,1 64.5,2.5 C64,6 63.5,12 63.5,19 Z";

const CAP_FRONT =
  "M36,23 C36,15 42,10 50,10 C58,10 64,15 64,23 Z " +
  "M35,22 C40,25.5 60,25.5 65,22 C65,24.5 60,27.2 50,27.2 C40,27.2 35,24.5 35,22 Z";

/** Frock coat: shaped waist, skirts flaring to the knee. */
const FROCK_FRONT =
  "M50,42 C42,42 33,44.5 29,51 C28,70 32.5,90 34.5,104 C33,120 31,135 29.5,150 " +
  "C40,153 60,153 70.5,150 C69,135 67,120 65.5,104 C67.5,90 72,70 71,51 C67,44.5 58,42 50,42 Z";

/** Shirt and waistcoat: straight sides, a point at the front hem. */
const WAISTCOAT_FRONT =
  "M50,42 C43,42 35,44.5 31,50 C31,66 34,86 36,104 L44,104 L50,110 L56,104 L64,104 " +
  "C66,86 69,66 69,50 C65,44.5 57,42 50,42 Z";

/** Working shirt torso, no coat. */
const SHIRT_FRONT =
  "M50,42 C43,42 35,44.5 31,50 C31,66 34,86 36,106 L64,106 C66,86 69,66 69,50 C65,44.5 57,42 50,42 Z";

/** Heavy apron: bib to the chest, skirt to the shin. */
const APRON_FRONT =
  "M41,50 L59,50 L60.5,66 L66,66 C68,100 68.5,135 66.5,170 C56,173 44,173 33.5,170 " +
  "C31.5,135 32,100 34,66 L39.5,66 Z";

const TROUSERS_FRONT =
  "M36,100 L64,100 C64,130 62,160 61,192 L52.5,192 C52,165 51,140 50,120 " +
  "C49,140 48,165 47.5,192 L39,192 C38,160 36,130 36,100 Z";

const SHOES_FRONT =
  "M34.5,200 C33.5,196.5 36.5,192 40.5,192 L48,192 L48,200 Z " +
  "M65.5,200 C66.5,196.5 63.5,192 59.5,192 L52,192 L52,200 Z";

type FrontArmProps = {
  readonly side: -1 | 1;
  /** Degrees away from the body. */
  readonly out: number;
  /** Degrees the forearm folds inwards. */
  readonly fold: number;
  readonly thick?: number;
  readonly foreThick?: number;
  readonly children?: React.ReactNode;
};

const FrontArm: React.FC<FrontArmProps> = ({
  side,
  out,
  fold,
  thick = 1,
  foreThick,
  children,
}) => {
  const s = side === -1 ? FRONT.shoulderL : FRONT.shoulderR;
  const ft = foreThick ?? thick;
  return (
    <g transform={joint(s.x, s.y, -side * out)}>
      <path d={limb(FRONT.upperArm, 5.8 * thick, 4.8 * thick)} />
      <g transform={joint(0, FRONT.upperArm, side * fold)}>
        <path d={limb(FRONT.forearm, 4.8 * ft, 3.6 * ft)} />
        <g transform={`translate(0 ${f(FRONT.forearm + 1.5)})`}>
          <Fist />
          {children}
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// TopHatMan — the myth
// ---------------------------------------------------------------------------

type TopHatManProps = Base & {
  readonly parts?: {
    readonly hat?: number;
    readonly cloak?: number;
    readonly bag?: number;
    readonly body?: number;
  };
  /** 0..1 forward lean into a step. */
  readonly step?: number;
};

const CLOAK_FRONT =
  "M50,40 C38,40 29,44.5 26,52 C21,80 16,130 11,176 C22,181 36,182.5 50,180.5 " +
  "C64,182.5 78,181 89,176 C84,130 79,80 74,52 C71,44.5 62,40 50,40 Z";

/** Turned-up collar standing either side of the jaw. */
const HIGH_COLLAR =
  "M34,50 C35,42 37.5,35 41.5,29.5 C43.5,32 44.5,35 45,38 C46,42 46.5,46 47,50 Z " +
  "M66,50 C65,42 62.5,35 58.5,29.5 C56.5,32 55.5,35 55,38 C54,42 53.5,46 53,50 Z";

/**
 * Tall hat, high collar, long cloak, Gladstone bag; a face that is only dark.
 * `parts` lets a scene assemble him piece by piece.
 */
export const TopHatMan: React.FC<TopHatManProps> = ({
  parts,
  step = 0,
  color = DOC.black,
  facing = 1,
  ...base
}) => {
  const p = { hat: 1, cloak: 1, bag: 1, body: 1, ...parts };
  const lean = 5 * step;
  return (
    <Rig {...base} facing={facing}>
      <g fill={color} transform={`rotate(${f(lean)} 50 200)`}>
        <g opacity={p.body}>
          <path d={TROUSERS_FRONT} />
          <path d={SHOES_FRONT} transform={`translate(${f(step * 3)} 0)`} />
          <FrontArm side={-1} out={4} fold={2} />
          <FrontArm side={1} out={16} fold={6} />
          <path d={FROCK_FRONT} />
          <path d={NECK_FRONT} />
          <path d={HEAD_FRONT} />
          <path d={HIGH_COLLAR} />
        </g>
        <g opacity={p.cloak}>
          <path d={CLOAK_FRONT} />
          <path d={HIGH_COLLAR} />
        </g>
        <g opacity={p.hat}>
          <path d={TOPHAT_FRONT} />
        </g>
        <g opacity={p.bag}>
          {/* Right hand carries the bag; drawn over the cloak. */}
          <FrontArm side={1} out={16} fold={6}>
            <path d={GLADSTONE} />
          </FrontArm>
        </g>
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// Woman
// ---------------------------------------------------------------------------

type WomanProps = Base & {
  readonly phase?: number;
  readonly shawl?: boolean;
  readonly bonnet?: boolean;
};

const BODICE_SIDE =
  "M49,44 C43,44 39,47 38,52 C37,66 38,82 40,97 L61,97 C62,82 63,66 62,52 C61,47 57,44 51,44 Z";

/** Bell skirt with a modest bustle; `sway` swings the hem forward. */
const skirtSide = (sway: number, lift: number): string =>
  `M40,95 C38,99 30,101 28,108 C28,130 ${f(26 + sway)},160 ${f(23 + sway)},${f(196 - lift)} ` +
  `C40,${f(199 - lift)} 60,${f(199 - lift)} ${f(77 + sway)},${f(196 - lift)} ` +
  `C72,160 ${f(68 + sway * 0.5)},130 62,101 C61.5,98.5 61,96.5 61,95 Z`;

const SHAWL_SIDE =
  "M47,40 C39,42 34.5,48 34,56 C33,70 30.5,88 27,103 C34,99 42,93 48,88 " +
  "C54,90.5 60,92.5 66,92.5 C66,80 66.5,66 64.5,56 C63,48 57,42 50,40 Z";

/** Hair gathered at the nape, for a bare head. */
const BUN_SIDE =
  "M38,26 C37,16 43,10 51,10 C58,10 62.5,15 61.5,22 C57,17 50,17 44,20 C41,22 39,24 38,26 Z " +
  "M36,30 C32,28 32,22 36.5,21 C39,21 40,26 39,30 Z";

/** Side view, long skirt, shawl and bonnet. `phase` gives a gentle walk. */
export const Woman: React.FC<WomanProps> = ({
  phase,
  shawl = true,
  bonnet = true,
  color = DOC.black,
  ...base
}) => {
  const walking = phase !== undefined;
  const t = (phase ?? 0) * TAU;
  const sway = walking ? 3 * Math.sin(t) : 0;
  const bob = walking ? 2 * Math.pow(Math.sin(t), 2) : 0;
  const armSwing = walking ? 10 * Math.sin(t) : 0;
  const footX = walking ? 50 + 12 * Math.sin(t) : 50;
  const footLift = walking ? Math.max(0, -Math.cos(t)) * 3 : 0;

  return (
    <Rig {...base}>
      <g fill={color} transform={`translate(0 ${f(bob)})`}>
        <path
          transform={`translate(${f(footX)} ${f(192 - footLift)})`}
          d={FOOT_SIDE}
        />
        <path transform="translate(44 192)" d={FOOT_SIDE} />
        <path d={skirtSide(sway, walking ? 1.5 * Math.abs(Math.sin(t)) : 0)} />
        <path d={BODICE_SIDE} />
        <Arm
          shoulder={{ x: 49, y: 52 }}
          shoulderDeg={2 + armSwing}
          elbowDeg={-6}
          upper={28}
          fore={26}
          thick={0.85}
        />
        <path d={NECK_SIDE} />
        <path d={HEAD_SIDE} />
        {bonnet ? <path d={BONNET_SIDE} /> : <path d={BUN_SIDE} />}
        {shawl ? <path d={SHAWL_SIDE} /> : null}
        {/* Near hand holds the shawl closed at the chest. */}
        <Arm
          shoulder={{ x: 50, y: 53 }}
          shoulderDeg={-12 + armSwing * 0.3}
          elbowDeg={-150}
          upper={27}
          fore={22}
          thick={0.85}
        />
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// Standing men (front view)
// ---------------------------------------------------------------------------

/** Frock coat, top hat, doctor's bag. */
export const Doctor: React.FC<Base> = ({ color = DOC.black, ...base }) => (
  <Rig {...base}>
    <g fill={color}>
      <path d={TROUSERS_FRONT} />
      <path d={SHOES_FRONT} />
      <FrontArm side={-1} out={5} fold={3} />
      <path d={FROCK_FRONT} />
      <path d={NECK_FRONT} />
      <path d={HEAD_FRONT} />
      <path d={TOPHAT_FRONT} />
      <FrontArm side={1} out={9} fold={2}>
        <path d={GLADSTONE} />
      </FrontArm>
    </g>
  </Rig>
);

/** Apron over rolled sleeves, bare head, a knife raised. */
export const Surgeon: React.FC<Base> = ({ color = DOC.black, ...base }) => (
  <Rig {...base}>
    <g fill={color}>
      <path d={TROUSERS_FRONT} />
      <path d={SHOES_FRONT} />
      <path d={SHIRT_FRONT} />
      <path d={APRON_FRONT} />
      <path d={NECK_FRONT} />
      <path d={HEAD_FRONT} />
      <path d={HAIR_FRONT} />
      <FrontArm side={-1} out={10} fold={12} thick={1.05} foreThick={0.72} />
      <FrontArm side={1} out={30} fold={196} thick={1.05} foreThick={0.72}>
        <path d={KNIFE} />
      </FrontArm>
    </g>
  </Rig>
);

/** Heavy apron, flat cap, cleaver held up. */
export const Butcher: React.FC<Base> = ({ color = DOC.black, ...base }) => (
  <Rig {...base}>
    <g fill={color}>
      <path d={TROUSERS_FRONT} />
      <path d={SHOES_FRONT} />
      <path d={SHIRT_FRONT} />
      <path d={APRON_FRONT} />
      <path d={NECK_FRONT} />
      <path d={HEAD_FRONT} />
      <path d={CAP_FRONT} />
      <FrontArm side={-1} out={10} fold={6} thick={1.15} foreThick={0.85} />
      <FrontArm side={1} out={38} fold={204} thick={1.15} foreThick={0.85}>
        <path d={CLEAVER} />
      </FrontArm>
    </g>
  </Rig>
);

/** Waistcoat and shirt sleeves, scissors in one hand, comb in the other. */
export const Barber: React.FC<Base> = ({ color = DOC.black, ...base }) => (
  <Rig {...base}>
    <g fill={color}>
      <path d={TROUSERS_FRONT} />
      <path d={SHOES_FRONT} />
      <path d={WAISTCOAT_FRONT} />
      <path d={NECK_FRONT} />
      <path d={HEAD_FRONT} />
      <path d={HAIR_FRONT} />
      <FrontArm side={-1} out={14} fold={26} thick={0.95} foreThick={0.8}>
        <path d={COMB} />
      </FrontArm>
      <FrontArm side={1} out={30} fold={198} thick={0.95} foreThick={0.8}>
        <path d={SCISSORS} />
      </FrontArm>
    </g>
  </Rig>
);

/** A Druitt-like gentleman: frock coat, no hat, hands clasped before him. */
export const Gentleman: React.FC<Base> = ({ color = DOC.black, ...base }) => (
  <Rig {...base}>
    <g fill={color}>
      <path d={TROUSERS_FRONT} />
      <path d={SHOES_FRONT} />
      <path d={FROCK_FRONT} />
      <path d={NECK_FRONT} />
      <path d={HEAD_FRONT} />
      <path d={HAIR_FRONT} />
      <FrontArm side={-1} out={7} fold={42} />
      <FrontArm side={1} out={7} fold={42} />
    </g>
  </Rig>
);

// ---------------------------------------------------------------------------
// Crowd
// ---------------------------------------------------------------------------

type CrowdProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly count: number;
  readonly seed?: number;
  readonly color?: string;
  readonly opacity?: number;
  /** Frame-driven sway amplitude, 0..1. */
  readonly sway?: number;
};

/** One bystander, side view, standing. Drawn in 100x200 units. */
const Bystander: React.FC<{ kind: number; r: number }> = ({ kind, r }) => {
  if (kind < 0.42) {
    // Man in a cap or bowler.
    const stance = 4 + r * 4;
    return (
      <>
        <Leg hip={SIDE.hip} hipDeg={stance} kneeDeg={2} ankleDeg={-stance} />
        <Leg hip={SIDE.hip} hipDeg={-stance} kneeDeg={3} ankleDeg={stance} />
        <Arm shoulder={SIDE.shoulder} shoulderDeg={6} elbowDeg={-12} />
        <path d={coatSide(0)} />
        <path d={NECK_SIDE} />
        <path d={HEAD_SIDE} />
        <path d={r > 0.5 ? CAP_SIDE : BOWLER_SIDE} />
        <Arm shoulder={SIDE.shoulder} shoulderDeg={-4} elbowDeg={-30} />
      </>
    );
  }
  if (kind < 0.8) {
    // Woman in shawl, bonnet or bare head.
    return (
      <>
        <path transform="translate(46 192)" d={FOOT_SIDE} />
        <path d={skirtSide(0, 0)} />
        <path d={BODICE_SIDE} />
        <path d={NECK_SIDE} />
        <path d={HEAD_SIDE} />
        <path d={r > 0.45 ? BONNET_SIDE : BUN_SIDE} />
        <path d={SHAWL_SIDE} />
        <Arm
          shoulder={{ x: 50, y: 53 }}
          shoulderDeg={-12}
          elbowDeg={-150}
          upper={27}
          fore={22}
          thick={0.85}
        />
      </>
    );
  }
  // Child: same parts, scaled and shifted to the ground.
  return (
    <g transform="translate(50 200) scale(0.55) translate(-50 -200)">
      <Leg hip={SIDE.hip} hipDeg={5} kneeDeg={2} ankleDeg={-5} />
      <Leg hip={SIDE.hip} hipDeg={-5} kneeDeg={3} ankleDeg={5} />
      <Arm shoulder={SIDE.shoulder} shoulderDeg={10} elbowDeg={-6} />
      <path d={coatSide(0)} />
      <path d={NECK_SIDE} />
      <path
        d={HEAD_SIDE}
        transform="translate(50 26) scale(1.15) translate(-50 -26)"
      />
      <path
        d={CAP_SIDE}
        transform="translate(50 26) scale(1.15) translate(-50 -26)"
      />
      <Arm shoulder={SIDE.shoulder} shoulderDeg={-10} elbowDeg={-8} />
    </g>
  );
};

/** A row of varied, overlapping silhouettes. Deterministic in `seed`. */
export const Crowd: React.FC<CrowdProps> = ({
  x,
  y,
  width,
  height,
  count,
  seed = 0,
  color = DOC.black,
  opacity = 1,
  sway = 0,
}) => {
  const frame = useCurrentFrame();
  const items: React.ReactNode[] = [];
  const n = Math.max(1, Math.floor(count));
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed * 31 + i * 7 + 1);
    const h2 = hash(seed * 31 + i * 7 + 2);
    const h3 = hash(seed * 31 + i * 7 + 3);
    const h4 = hash(seed * 31 + i * 7 + 4);
    const slot = -width / 2 + ((i + 0.5) / n) * width;
    const px = slot + (h1 - 0.5) * (width / n) * 0.9;
    const scale = (0.82 + h2 * 0.18) * (height / 200);
    const facing = h3 > 0.5 ? 1 : -1;
    const rock = sway > 0 ? sway * 1.6 * Math.sin(frame * 0.035 + h4 * TAU) : 0;
    // Taller (nearer) figures stand a touch lower, so the row has depth.
    const depth = (h2 - 0.5) * 3;
    items.push(
      <g
        key={i}
        transform={`translate(${f(px)} ${f(depth)}) rotate(${f(rock)}) scale(${f(scale * facing)} ${f(scale)}) translate(-50 -200)`}
      >
        <Bystander kind={h4} r={h3} />
      </g>,
    );
  }
  return (
    <svg
      viewBox={`${-width / 2} ${-height} ${width} ${height + 20}`}
      width={width}
      height={height + 20}
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height,
        overflow: "visible",
        opacity,
        pointerEvents: "none",
      }}
    >
      <g fill={color}>{items}</g>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// UnknownHead
// ---------------------------------------------------------------------------

type UnknownHeadProps = {
  readonly x: number;
  readonly y: number;
  /** Width of the bust in pixels; it is 0.72 x size tall. */
  readonly size: number;
  readonly opacity?: number;
  /** 0..1 draw-on of the question mark. */
  readonly question?: number;
  readonly color?: string;
};

/** Featureless head-and-shoulders bust, with a question mark drawn on stroke by stroke. */
export const UnknownHead: React.FC<UnknownHeadProps> = ({
  x,
  y,
  size,
  opacity = 1,
  question = 0,
  color = DOC.black,
}) => {
  const q = Math.min(1, Math.max(0, question));
  const hook = Math.min(1, q / 0.82);
  const dot = Math.min(1, Math.max(0, (q - 0.86) / 0.14));
  const h = size * 0.72;
  return (
    <svg
      viewBox="0 0 100 72"
      width={size}
      height={h}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - h,
        overflow: "visible",
        opacity,
        pointerEvents: "none",
      }}
    >
      <g fill={color}>
        <path d="M50,4 C40,4 34.5,12 34.5,22.5 C34.5,31 39,38.5 45,41 C46.5,42 53.5,42 55,41 C61,38.5 65.5,31 65.5,22.5 C65.5,12 60,4 50,4 Z" />
        <path d="M34.6,20 C31.5,19.5 30.5,26 34.3,28.5 Z M65.4,20 C68.5,19.5 69.5,26 65.7,28.5 Z" />
        <path d="M44,38 L44,50 L56,50 L56,38 Z" />
        <path d="M6,72 C6,58 20,49 38,47.5 L62,47.5 C80,49 94,58 94,72 Z" />
      </g>
      {q > 0 ? (
        <g
          fill="none"
          stroke={DOC.fogLight}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M41.5,17.5 C41.5,10.5 46,7.5 50,7.5 C55,7.5 58.5,11 58.5,15.5 C58.5,20.5 53.5,22 51,25 C50,26.5 50,28.5 50,30.5"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - hook}
          />
          {dot > 0 ? (
            <circle
              cx={50}
              cy={36.5}
              r={2 * dot}
              fill={DOC.fogLight}
              stroke="none"
            />
          ) : null}
        </g>
      ) : null}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Lantern glow and ground
// ---------------------------------------------------------------------------

type LanternProps = {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly intensity?: number;
  readonly color?: string;
  /** 0..1 flicker amplitude, driven by the frame. */
  readonly flicker?: number;
};

/** A warm radial glow without a body, for gaslight behind the figures. */
export const Lantern: React.FC<LanternProps> = ({
  x,
  y,
  radius,
  intensity = 1,
  color = DOC.gas,
  flicker = 0,
}) => {
  const frame = useCurrentFrame();
  const slow =
    Math.sin(frame * 0.19 + x * 0.01) * 0.5 + Math.sin(frame * 0.47) * 0.3;
  const fast = (hash(frame + x) - 0.5) * 0.7;
  const k = 1 + (slow + fast) * 0.18 * flicker;
  const r = radius * k;
  const a = Math.min(1, Math.max(0, intensity * (0.85 + 0.15 * k)));
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        pointerEvents: "none",
        opacity: a,
        background: `radial-gradient(circle at 50% 50%, ${withAlpha(color, 0.75)} 0%, ${withAlpha(color, 0.32)} 22%, ${withAlpha(color, 0.1)} 50%, ${withAlpha(color, 0)} 72%)`,
      }}
    />
  );
};

type GroundLineProps = {
  readonly y: number;
  readonly opacity?: number;
  readonly color?: string;
};

/** A faint ground plane: a hairline horizon and a shallow gradient beneath it. */
export const GroundLine: React.FC<GroundLineProps> = ({
  y,
  opacity = 1,
  color = DOC.fog,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y - 1,
        height: 2,
        opacity: mix(0, 0.22, opacity),
        background: `linear-gradient(to right, ${withAlpha(color, 0)} 0%, ${color} 18%, ${color} 82%, ${withAlpha(color, 0)} 100%)`,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        height: 90,
        opacity: mix(0, 0.16, opacity),
        background: `linear-gradient(to bottom, ${color} 0%, ${withAlpha(color, 0.35)} 30%, ${withAlpha(color, 0)} 100%)`,
        pointerEvents: "none",
      }}
    />
  </>
);
