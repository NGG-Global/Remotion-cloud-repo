import React from "react";
import {
  clamp01,
  hammerAngle,
  lastHitAge,
  settle,
  squash,
  useClock,
} from "../../clock";
import { ChipBurst, ImpactFlash } from "../../components/feedback";
import { faces, mix, shade, TT } from "../../theme";
import { INK_WEIGHT } from "../frame";
import { ActStage, CastShadow } from "./ActStage";
import type { ActProps } from "./types";

const WOOD = "#c99460";
const BENCH_TOP = 930;
const BLOCK_TOP = 740;
const NAIL_X = 460;

/**
 * Hammer geometry, in the hammer's own space: the grip is the origin, the handle
 * runs along +x, and the head bar crosses it at `L` with the striking face `F`
 * below the handle's axis — which is where a claw hammer's face actually sits.
 *
 * Swinging about the grip rather than about the face is what puts the head back in
 * the air between blows and leaves the nail visible, which a poll pivot cannot do.
 */
const L = 380;
const F = 88;
const CONTACT_DEG = -16;
const SWING_DEG = 52;

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Where the striking face sits relative to the grip, at handle angle `deg`. */
const facePoint = (deg: number): { x: number; y: number } => ({
  x: L * Math.cos(rad(deg)) - F * Math.sin(rad(deg)),
  y: L * Math.sin(rad(deg)) + F * Math.cos(rad(deg)),
});

const CONTACT_OFFSET = facePoint(CONTACT_DEG);

/**
 * Hammer & nail, the game's first act, framed for the portrait box.
 *
 * Contact — not the start of the swing — is the beat, so the pose is sampled from
 * the hit list rather than tweened: `hammerAngle` puts the face on the nail at each
 * instant in `hits`, whatever the tempo.
 */
export const HammerTall: React.FC<ActProps> = ({ hits, finish }) => {
  const { time } = useClock();
  const pose = hammerAngle(time, hits);
  const age = lastHitAge(time, hits);
  const struck = hits.filter((h) => h <= time).length;

  const seated = finish !== undefined && time >= finish;
  const sink = seated ? 1 : clamp01(struck / Math.max(1, hits.length));
  const proud = 122 - sink * 92;
  const nailHeadY = BLOCK_TOP - proud;

  // The grip sits wherever it must for the face to land on this nail head, and
  // rises a little with the swing so the tool is carried rather than pinned.
  const gripX = NAIL_X - CONTACT_OFFSET.x;
  const gripY = nailHeadY - CONTACT_OFFSET.y - pose * 46;
  const angle = CONTACT_DEG - pose * SWING_DEG;

  const jolt = settle(age, 96, 18) * 9;
  const press = squash(age, 0.17, 0.06);

  const ink = faces(TT.ink);
  const coral = faces(TT.coral);
  const wood = faces(WOOD);
  const bench = faces("#c2793c");
  const steel = faces("#98a5a8");

  return (
    <ActStage
      paper="#eee8d8"
      sun={TT.sun}
      sunX={40}
      sunY={28}
      push={[1.02, 1.09]}
    >
      <g transform={`translate(0 ${jolt * 0.5})`}>
        {/* Wall behind, floor in front. Tone rather than furniture: the act is the
            subject, and a dressed workshop only competes with it. */}
        <rect
          x={-40}
          y={-40}
          width={800}
          height={BENCH_TOP + 40}
          fill={mix("#eee8d8", TT.ink, 0.07)}
        />
        <rect
          x={-40}
          y={BENCH_TOP - 8}
          width={800}
          height={400}
          fill={mix("#eee8d8", WOOD, 0.22)}
        />
        <line
          x1={-40}
          y1={BENCH_TOP - 8}
          x2={760}
          y2={BENCH_TOP - 8}
          stroke={shade(TT.ink, 0.2)}
          strokeWidth={4}
          opacity={0.25}
        />

        {/* Bench. */}
        <CastShadow cx={360} cy={1104} rx={352} ry={34} opacity={0.15} />
        <rect
          x={-40}
          y={BENCH_TOP + 112}
          width={800}
          height={26}
          rx={13}
          fill={bench.edge}
        />
        <rect
          x={-40}
          y={BENCH_TOP}
          width={800}
          height={124}
          fill={bench.face}
        />
        <rect x={-40} y={BENCH_TOP} width={800} height={28} fill={bench.lit} />
        <line
          x1={-40}
          y1={BENCH_TOP}
          x2={760}
          y2={BENCH_TOP}
          stroke={ink.edge}
          strokeWidth={INK_WEIGHT}
        />
        {[0, 1].map((i) => (
          <g
            key={i}
            transform={`translate(${118 + i * 62} ${BENCH_TOP + 66}) rotate(${-8 + i * 15})`}
          >
            <rect
              x={-50}
              y={-5}
              width={100}
              height={10}
              rx={5}
              fill={steel.face}
            />
            <circle cx={-52} cy={0} r={11} fill={steel.shade} />
          </g>
        ))}

        {/* Timber block, squashed on impact so the blow has somewhere to go. */}
        <g
          transform={`translate(${NAIL_X} ${BENCH_TOP}) scale(${1 + press * 0.45} ${1 - press}) translate(${-NAIL_X} ${-BENCH_TOP})`}
        >
          <CastShadow cx={452} cy={BENCH_TOP - 4} rx={228} ry={24} />
          <rect
            x={232}
            y={BLOCK_TOP}
            width={428}
            height={196}
            rx={16}
            fill={wood.shade}
          />
          <rect
            x={232}
            y={BLOCK_TOP}
            width={428}
            height={156}
            rx={16}
            fill={wood.face}
          />
          <rect
            x={232}
            y={BLOCK_TOP}
            width={428}
            height={32}
            rx={16}
            fill={wood.lit}
          />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${258 + i * 12} ${BLOCK_TOP + 72 + i * 34} q 94 ${-16 + i * 9} 190 0 q 76 13 152 -7`}
              fill="none"
              stroke={wood.edge}
              strokeWidth={4}
              opacity={0.45}
            />
          ))}
          <rect
            x={232}
            y={BLOCK_TOP}
            width={428}
            height={196}
            rx={16}
            fill="none"
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
          />
        </g>

        {/* Nail. Its head is the contact point the swing is aimed at. */}
        <g>
          <rect
            x={NAIL_X - 12}
            y={nailHeadY}
            width={24}
            height={proud + 34}
            fill={steel.face}
            stroke={ink.edge}
            strokeWidth={5}
          />
          <rect
            x={NAIL_X - 8}
            y={nailHeadY + 4}
            width={8}
            height={proud + 24}
            fill={steel.rim}
            opacity={0.75}
          />
          <ellipse
            cx={NAIL_X}
            cy={nailHeadY + 4}
            rx={38}
            ry={13}
            fill={steel.edge}
          />
          <ellipse
            cx={NAIL_X}
            cy={nailHeadY - 5}
            rx={38}
            ry={13}
            fill={steel.face}
          />
          <ellipse
            cx={NAIL_X - 11}
            cy={nailHeadY - 9}
            rx={15}
            ry={4}
            fill={steel.rim}
          />
          <ellipse
            cx={NAIL_X}
            cy={nailHeadY - 5}
            rx={38}
            ry={13}
            fill="none"
            stroke={ink.edge}
            strokeWidth={5}
          />
        </g>

        {/* Spark and chips sit behind the tool: the flare of a strike comes out from
            under the face, it is not a mark on the steel. */}
        <ImpactFlash
          cx={NAIL_X}
          cy={nailHeadY - 4}
          age={age}
          color={TT.cream}
          scale={1.1}
        />
        <ChipBurst
          cx={NAIL_X}
          cy={nailHeadY}
          age={age}
          colors={[TT.sun, WOOD, TT.cream]}
        />

        {/* The hammer, swinging about the grip. The claw is laid down first so the
            head bar covers the joint and the two read as one forging. */}
        <g transform={`translate(${gripX} ${gripY}) rotate(${angle})`}>
          <rect
            x={-52}
            y={-24}
            width={L + 26}
            height={48}
            rx={24}
            fill={coral.shade}
          />
          <rect
            x={-52}
            y={-24}
            width={L + 26}
            height={32}
            rx={16}
            fill={coral.face}
          />
          <rect
            x={-34}
            y={-19}
            width={L - 20}
            height={10}
            rx={5}
            fill={coral.rim}
            opacity={0.7}
          />
          <rect
            x={-52}
            y={-24}
            width={L + 26}
            height={48}
            rx={24}
            fill="none"
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
          />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={-42 + i * 28}
              y={-23}
              width={11}
              height={46}
              rx={5}
              fill={ink.edge}
              opacity={0.3}
            />
          ))}

          <path
            d={`M ${L - 36} -100 C ${L - 104} -118 ${L - 158} -96 ${L - 184} -46 L ${L - 140} -24 C ${L - 124} -58 ${L - 96} -76 ${L - 38} -74 Z`}
            fill={ink.shade}
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
            strokeLinejoin="round"
          />
          <rect
            x={L - 65}
            y={-100}
            width={130}
            height={F + 106}
            rx={22}
            fill={ink.shade}
          />
          <rect
            x={L - 65}
            y={-100}
            width={130}
            height={F + 82}
            rx={22}
            fill={ink.face}
          />
          <rect
            x={L - 53}
            y={-88}
            width={104}
            height={20}
            rx={10}
            fill={ink.rim}
            opacity={0.42}
          />
          {/* The polished face, inset into the same forging rather than bolted on. */}
          <rect
            x={L - 58}
            y={F - 34}
            width={116}
            height={40}
            rx={16}
            fill={steel.shade}
          />
          <rect
            x={L - 58}
            y={F - 34}
            width={116}
            height={28}
            rx={14}
            fill={steel.face}
          />
          <rect
            x={L - 46}
            y={F - 28}
            width={92}
            height={11}
            rx={6}
            fill={steel.rim}
            opacity={0.85}
          />
          <rect
            x={L - 65}
            y={-100}
            width={130}
            height={F + 106}
            rx={22}
            fill="none"
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
          />
        </g>

        {/* Sawdust hanging in the light pool. */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={((i * 137 + time * 14) % 700) + 12}
            cy={240 + ((i * 211 + time * 9) % 420)}
            r={3 + (i % 3)}
            fill={TT.sun}
            opacity={0.34}
          />
        ))}
      </g>
    </ActStage>
  );
};
