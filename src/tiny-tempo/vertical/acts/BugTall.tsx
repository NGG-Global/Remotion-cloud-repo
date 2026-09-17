import React from "react";
import { hammerAngle, lastHitAge, settle, squash, useClock } from "../../clock";
import { ImpactFlash } from "../../components/feedback";
import { faces, GARDEN, mix, shade } from "../../theme";
import { CENTRE_X, INK_WEIGHT } from "../frame";
import { ActStage, CastShadow } from "./ActStage";
import type { ActProps } from "./types";

const HORIZON = 742;
const BUG_Y = 902;
const BUG_RX = 96;
const BUG_RY = 78;

/**
 * Bug & shoe.
 *
 * The bug is a rubber toy: it compresses under the sole and springs straight back,
 * so the sole's contact can be the beat without the act ever consuming its subject.
 * Nothing is squashed flat and nothing is damaged — the game is explicit about it.
 */
export const BugTall: React.FC<ActProps> = ({ hits, finish }) => {
  const { time } = useClock();
  const pose = hammerAngle(time, hits);
  const age = lastHitAge(time, hits);
  const jolt = settle(age, 76, 19) * 8;

  const flat = squash(age, 0.26, 0.6);
  const ry = BUG_RY * (1 - flat);
  const rx = BUG_RX * (1 + flat * 0.4);
  const soleY = BUG_Y - ry - 4 - pose * 470;

  // A clean round ends with the bug riding away on the shoe rather than beaten.
  const riding = finish !== undefined && time >= finish;
  const hop = riding ? Math.min(1, (time - (finish ?? 0)) / 0.5) : 0;

  const ink = faces(GARDEN.ink);
  const plum = faces(GARDEN.plum);
  const tile = faces(GARDEN.tile);
  const cream = faces(GARDEN.cream);

  return (
    <ActStage paper={GARDEN.paper} sun="#f4f0c8" sunX={56} sunY={18}>
      <g transform={`translate(0 ${jolt * 0.35})`}>
        {/* A low wall on the horizon, then one ground plane running forward. Five
            ranks of identical slabs read as brickwork, not as a floor. */}
        <rect
          x={-40}
          y={HORIZON - 132}
          width={800}
          height={136}
          fill={mix(tile.face, GARDEN.paper, 0.44)}
        />
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={-30 + i * 88}
            y={HORIZON - 124}
            width={80}
            height={56}
            rx={7}
            fill={mix(tile.face, GARDEN.paper, 0.26)}
            stroke={mix(tile.edge, GARDEN.paper, 0.55)}
            strokeWidth={3}
          />
        ))}
        <rect
          x={-40}
          y={HORIZON - 20}
          width={800}
          height={24}
          rx={12}
          fill={tile.shade}
        />

        <rect
          x={-40}
          y={HORIZON}
          width={800}
          height={600}
          fill={mix(tile.face, GARDEN.paper, 0.3)}
        />
        {[0, 1, 2, 3].map((r) => {
          const y = HORIZON + 78 + r * r * 32 + r * 64;
          return (
            <line
              key={r}
              x1={-40}
              y1={y}
              x2={760}
              y2={y}
              stroke={mix(tile.edge, GARDEN.paper, 0.45)}
              strokeWidth={5}
            />
          );
        })}
        {[0, 1, 2, 3].map((r) => {
          const y = HORIZON + 78 + r * r * 32 + r * 64;
          const next = HORIZON + 78 + (r + 1) * (r + 1) * 32 + (r + 1) * 64;
          const spread = 90 + r * 70;
          return (
            <g key={`j${r}`}>
              {[-1, 1].map((side) => (
                <line
                  key={side}
                  x1={360 + side * spread}
                  y1={y}
                  x2={360 + side * (spread + 96)}
                  y2={next}
                  stroke={mix(tile.edge, GARDEN.paper, 0.45)}
                  strokeWidth={5}
                />
              ))}
            </g>
          );
        })}

        {/* Two tufts pushing up through the joints. */}
        {[
          { x: 86, y: HORIZON + 172 },
          { x: 658, y: HORIZON + 286 },
        ].map((t, i) => (
          <g key={i}>
            {[-1, 0, 1].map((k) => (
              <path
                key={k}
                d={`M ${t.x} ${t.y} q ${k * 18} -26 ${k * 30} -54`}
                fill="none"
                stroke={shade("#7e9b64", -0.05)}
                strokeWidth={9}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}

        <CastShadow
          cx={CENTRE_X}
          cy={BUG_Y + 52}
          rx={rx * 1.1}
          ry={22}
          opacity={0.2}
        />

        {/* The bug: eyes forward, six legs, and no damage however hard it is stood on. */}
        <g
          transform={`translate(${hop * 72} ${-hop * 300}) rotate(${hop * 14} ${CENTRE_X} ${BUG_Y})`}
        >
          {[-1, 1].map((side) =>
            [0, 1, 2].map((i) => (
              <path
                key={`${side}-${i}`}
                d={`M ${CENTRE_X + side * rx * 0.5} ${BUG_Y + 6} q ${side * 48} ${8 + i * 14} ${side * (62 + i * 10)} ${36 + i * 16}`}
                fill="none"
                stroke={ink.face}
                strokeWidth={11}
                strokeLinecap="round"
              />
            )),
          )}
          {[-1, 1].map((side) => (
            <g key={side}>
              <path
                d={`M ${CENTRE_X + side * 22} ${BUG_Y - ry * 0.82} q ${side * 30} -50 ${side * 18} -78`}
                fill="none"
                stroke={ink.face}
                strokeWidth={8}
                strokeLinecap="round"
              />
              <circle
                cx={CENTRE_X + side * 40}
                cy={BUG_Y - ry * 0.82 - 80}
                r={11}
                fill={GARDEN.coral}
                stroke={ink.edge}
                strokeWidth={4}
              />
            </g>
          ))}
          <ellipse cx={CENTRE_X} cy={BUG_Y} rx={rx} ry={ry} fill={plum.shade} />
          <ellipse
            cx={CENTRE_X}
            cy={BUG_Y - 8}
            rx={rx}
            ry={ry}
            fill={plum.face}
          />
          <ellipse
            cx={CENTRE_X - rx * 0.3}
            cy={BUG_Y - ry * 0.48}
            rx={rx * 0.36}
            ry={ry * 0.3}
            fill={GARDEN.plumLit}
            opacity={0.85}
          />
          {[-0.46, 0, 0.46].map((k, i) => (
            <ellipse
              key={i}
              cx={CENTRE_X + rx * k}
              cy={BUG_Y + ry * 0.26}
              rx={14}
              ry={9}
              fill={plum.edge}
              opacity={0.4}
            />
          ))}
          <ellipse
            cx={CENTRE_X}
            cy={BUG_Y - 8}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
          />
          {[-1, 1].map((side) => (
            <g key={side}>
              <ellipse
                cx={CENTRE_X + side * 38}
                cy={BUG_Y - ry * 0.4}
                rx={27}
                ry={29 * (1 - flat * 0.5)}
                fill={cream.face}
                stroke={ink.edge}
                strokeWidth={6}
              />
              <circle
                cx={CENTRE_X + side * 38 + side * 6}
                cy={BUG_Y - ry * 0.4 + 5}
                r={12}
                fill={ink.edge}
              />
              <circle
                cx={CENTRE_X + side * 38 + side * 2}
                cy={BUG_Y - ry * 0.4 - 4}
                r={5}
                fill="#fff"
              />
            </g>
          ))}
          <path
            d={`M ${CENTRE_X - 24} ${BUG_Y + ry * 0.24} q 24 ${flat > 0.1 ? 26 : 16} 48 0`}
            fill="none"
            stroke={ink.edge}
            strokeWidth={7}
            strokeLinecap="round"
          />
        </g>

        {/* The sneaker, drawn sole-down with the toe leading. Contact is the beat. */}
        <g transform={`translate(${CENTRE_X + 26} ${soleY})`}>
          <ellipse
            cx={-10}
            cy={16}
            rx={210}
            ry={20}
            fill={ink.edge}
            opacity={0.18}
          />
          {/* Upper. A sneaker reads from its profile: a low round toe rising to a
              tall heel collar. A symmetrical dome reads as a loaf. */}
          <path
            d="M -214 -36 C -216 -84 -186 -116 -140 -126 C -96 -136 -40 -130 6 -140 C 44 -148 78 -170 104 -192 C 126 -210 160 -204 170 -176 C 178 -152 180 -90 180 -36 Z"
            fill={cream.face}
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
            strokeLinejoin="round"
          />
          {/* Toe cap, seamed off the vamp. */}
          <path
            d="M -214 -38 C -216 -86 -186 -116 -140 -126 C -126 -92 -140 -58 -166 -36 Z"
            fill={mix(GARDEN.cream, GARDEN.ink, 0.1)}
            stroke={ink.edge}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* Collar opening and tongue. */}
          <ellipse
            cx={126}
            cy={-186}
            rx={42}
            ry={17}
            fill={mix(GARDEN.cream, GARDEN.ink, 0.28)}
            stroke={ink.edge}
            strokeWidth={5}
            transform="rotate(-22 126 -186)"
          />
          <path
            d="M 56 -146 C 70 -172 90 -186 108 -196 L 124 -170 C 104 -160 86 -148 74 -134 Z"
            fill={mix(GARDEN.cream, GARDEN.ink, 0.06)}
            stroke={ink.edge}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* Swoosh. */}
          <path
            d="M -118 -48 C -58 -68 6 -92 76 -146 C 86 -132 82 -120 70 -110 C 8 -70 -44 -50 -110 -40 Z"
            fill={GARDEN.coral}
            stroke={ink.edge}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* Laces across the vamp. */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${-24 + i * 32} ${-132 - i * 12} q 24 18 50 12`}
              fill="none"
              stroke={ink.edge}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.75}
            />
          ))}
          {/* Midsole and outsole. */}
          <path
            d="M -216 -44 L 182 -44 L 182 -10 C 182 2 172 8 158 8 L -196 8 C -210 8 -218 0 -218 -14 Z"
            fill="#f6efd8"
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
            strokeLinejoin="round"
          />
          <path
            d="M -218 -12 L 182 -12 L 182 -2 C 182 10 172 16 158 16 L -196 16 C -210 16 -218 8 -218 -6 Z"
            fill={ink.face}
          />
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={-196 + i * 44}
              y={-8}
              width={24}
              height={20}
              rx={5}
              fill={ink.edge}
              opacity={0.55}
            />
          ))}
        </g>

        <ImpactFlash
          cx={CENTRE_X}
          cy={BUG_Y - 16}
          age={age}
          color="#fff6d6"
          scale={1.15}
        />
        {/* Dust rings pushed out sideways rather than a puff of debris. */}
        {age < 0.3
          ? [1, -1].map((side) => {
              const p = age / 0.3;
              return (
                <ellipse
                  key={side}
                  cx={CENTRE_X + side * (86 + p * 130)}
                  cy={BUG_Y + 30}
                  rx={46 * (1 - p * 0.3)}
                  ry={15}
                  fill="none"
                  stroke="#c3c8a4"
                  strokeWidth={7}
                  opacity={0.75 * (1 - p)}
                />
              );
            })
          : null}
      </g>
    </ActStage>
  );
};
