import React from "react";
import { hammerAngle, lastHitAge, settle, squash, useClock } from "../../clock";
import { ImpactFlash } from "../../components/feedback";
import { faces, KITCHEN, TT } from "../../theme";
import { CENTRE_X, INK_WEIGHT } from "../frame";
import { ActStage, CastShadow } from "./ActStage";
import type { ActProps } from "./types";

const BOARD_TOP = 810;
const TOMATO_Y = 700;
const RX = 122;
const RY = 116;
/** Left edge of the fruit: the first cut lands one slice in from here. */
const LEFT = CENTRE_X - RX;

const SEEDS = [
  { x: -30, y: -22 },
  { x: 24, y: -30 },
  { x: -36, y: 26 },
  { x: 30, y: 24 },
  { x: -4, y: 42 },
  { x: 2, y: -46 },
] as const;

/**
 * Knife & tomato. The blade drops on the beat and one round comes away each time,
 * so the pile on the left is a running record of how many beats the player kept.
 */
export const TomatoTall: React.FC<ActProps> = ({ hits }) => {
  const { time } = useClock();
  const pose = hammerAngle(time, hits);
  const age = lastHitAge(time, hits);
  const cut = hits.filter((h) => h <= time).length;

  const sliceW = (RX * 2) / (hits.length + 1);
  const cutX = LEFT + cut * sliceW;
  const lift = pose * 330;
  const tilt = -5 - pose * 9;
  const jolt = settle(age, 84, 20) * 5;
  const press = squash(age, 0.15, 0.06);

  const ink = faces(KITCHEN.ink);
  const skin = faces(KITCHEN.tomato);
  const board = faces(KITCHEN.board);
  const counter = faces("#bccdc2");
  const steel = faces(KITCHEN.steel);
  const grip = faces(KITCHEN.handle);

  return (
    <ActStage paper={KITCHEN.paper} sun="#ffe9b0" sunX={34} sunY={18}>
      <g transform={`translate(0 ${jolt * 0.4})`}>
        {/* Tiled splashback: the kitchen reads before the props do. */}
        <rect x={0} y={0} width={720} height={742} fill="#eef2ec" />
        {Array.from({ length: 7 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => (
            <rect
              key={`${r}-${c}`}
              x={-40 + c * 132 + (r % 2 ? 66 : 0)}
              y={r * 116}
              width={124}
              height={108}
              rx={8}
              fill={r % 3 === 1 && c % 2 === 0 ? "#eef3ee" : "#f7faf6"}
              stroke={KITCHEN.grout}
              strokeWidth={3}
              opacity={0.75}
            />
          )),
        )}
        <rect x={0} y={708} width={720} height={26} fill={KITCHEN.grout} />

        {/* Counter and board. */}
        <rect x={0} y={734} width={720} height={560} fill={counter.shade} />
        <rect x={0} y={734} width={720} height={150} fill={counter.face} />
        <rect x={0} y={734} width={720} height={18} fill={counter.lit} />
        <CastShadow cx={CENTRE_X} cy={898} rx={310} ry={26} />
        <rect
          x={44}
          y={BOARD_TOP}
          width={632}
          height={92}
          rx={18}
          fill={board.edge}
        />
        <rect
          x={44}
          y={BOARD_TOP}
          width={632}
          height={66}
          rx={18}
          fill={board.face}
        />
        <rect
          x={44}
          y={BOARD_TOP}
          width={632}
          height={14}
          rx={7}
          fill={board.lit}
        />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M ${92 + i * 150} ${BOARD_TOP + 16} q 60 ${8 - i * 5} 118 2`}
            fill="none"
            stroke={KITCHEN.boardEdge}
            strokeWidth={3}
            opacity={0.5}
          />
        ))}
        <rect
          x={44}
          y={BOARD_TOP}
          width={632}
          height={92}
          rx={18}
          fill="none"
          stroke={ink.edge}
          strokeWidth={INK_WEIGHT}
        />

        {/* Rounds already cut, fanned down the board to the left. */}
        {Array.from({ length: cut }, (_, i) => {
          const fall = Math.min(1, (time - (hits[i] ?? 0)) / 0.22);
          const x = LEFT - 40 - i * 44;
          const y = BOARD_TOP + 16 - (1 - fall) * 90;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${-12 - i * 7})`}
              opacity={fall}
            >
              <ellipse
                cx={3}
                cy={5}
                rx={RY * 0.9}
                ry={13}
                fill={TT.inkDeep}
                opacity={0.14}
              />
              <ellipse rx={RY * 0.92} ry={13} fill={skin.face} />
              <ellipse rx={RY * 0.8} ry={8} fill={KITCHEN.flesh} />
              <ellipse
                cx={-RY * 0.3}
                ry={4}
                rx={RY * 0.22}
                fill={KITCHEN.seed}
                opacity={0.8}
              />
              <ellipse
                cx={RY * 0.28}
                ry={4}
                rx={RY * 0.2}
                fill={KITCHEN.seed}
                opacity={0.8}
              />
            </g>
          );
        })}

        {/* What is left of the fruit, squashed for a frame under the blade. */}
        <g
          transform={`translate(${CENTRE_X} ${BOARD_TOP}) scale(${1 + press * 0.4} ${1 - press}) translate(${-CENTRE_X} ${-BOARD_TOP})`}
        >
          <clipPath id="tt-tomato-remaining">
            <rect x={cutX} y={0} width={720 - cutX} height={BOARD_TOP + 4} />
          </clipPath>
          <g clipPath="url(#tt-tomato-remaining)">
            <ellipse
              cx={CENTRE_X + 6}
              cy={TOMATO_Y + 96}
              rx={RX * 0.9}
              ry={16}
              fill={TT.inkDeep}
              opacity={0.16}
            />
            <ellipse
              cx={CENTRE_X}
              cy={TOMATO_Y}
              rx={RX}
              ry={RY}
              fill={skin.shade}
            />
            <ellipse
              cx={CENTRE_X}
              cy={TOMATO_Y - 6}
              rx={RX}
              ry={RY}
              fill={skin.face}
            />
            <ellipse
              cx={CENTRE_X - 34}
              cy={TOMATO_Y - 40}
              rx={30}
              ry={21}
              fill={KITCHEN.tomatoLit}
              opacity={0.85}
            />
            <ellipse
              cx={CENTRE_X - 44}
              cy={TOMATO_Y - 50}
              rx={13}
              ry={8}
              fill="#fff"
              opacity={0.6}
            />
            <ellipse
              cx={CENTRE_X}
              cy={TOMATO_Y - 6}
              rx={RX}
              ry={RY}
              fill="none"
              stroke={ink.edge}
              strokeWidth={INK_WEIGHT}
            />
            {/* Stem, five leaves, drawn from the crown. */}
            {[-2, -1, 0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M ${CENTRE_X} ${TOMATO_Y - RY + 8} q ${i * 24} ${-12} ${i * 40} ${6 + Math.abs(i) * 5}`}
                fill="none"
                stroke={KITCHEN.stem}
                strokeWidth={13}
                strokeLinecap="round"
              />
            ))}
            <rect
              x={CENTRE_X - 8}
              y={TOMATO_Y - RY - 22}
              width={16}
              height={30}
              rx={8}
              fill={KITCHEN.stem}
            />
          </g>
          {/* The wet cut face, once the first round is off. */}
          {cut > 0 ? (
            <g>
              <ellipse
                cx={cutX}
                cy={TOMATO_Y - 6}
                rx={13}
                ry={RY * 0.94}
                fill={KITCHEN.flesh}
              />
              <ellipse
                cx={cutX}
                cy={TOMATO_Y - 6}
                rx={9}
                ry={RY * 0.8}
                fill="#ef7c68"
                opacity={0.7}
              />
              {SEEDS.map((s, i) => (
                <ellipse
                  key={i}
                  cx={cutX + s.x * 0.08}
                  cy={TOMATO_Y - 6 + s.y}
                  rx={4}
                  ry={7}
                  fill={KITCHEN.seed}
                />
              ))}
              <ellipse
                cx={cutX}
                cy={TOMATO_Y - 6}
                rx={13}
                ry={RY * 0.94}
                fill="none"
                stroke={ink.edge}
                strokeWidth={5}
              />
            </g>
          ) : null}
        </g>

        {/* Chef's knife. Descends onto the cut line; contact is the beat. */}
        <g
          transform={`translate(${cutX} ${BOARD_TOP - lift}) rotate(${tilt}) scale(0.76)`}
        >
          <g opacity={0.14} transform="translate(10 12)">
            <path
              d="M -292 -70 L 96 -70 L 96 0 L -292 -6 Z"
              fill={TT.inkDeep}
            />
          </g>
          <path
            d="M -300 -72 q 150 -18 306 -10 l 0 74 q -170 12 -306 -4 Z"
            fill={steel.face}
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
            strokeLinejoin="round"
          />
          <path
            d="M -296 -66 q 150 -16 296 -8 l 0 20 q -150 -8 -296 8 Z"
            fill={KITCHEN.steelLit}
            opacity={0.75}
          />
          <path
            d="M -300 -8 q 150 14 306 2 l 0 6 q -160 12 -306 -4 Z"
            fill="#fff"
            opacity={0.9}
          />
          <rect
            x={96}
            y={-64}
            width={34}
            height={66}
            rx={6}
            fill={steel.shade}
            stroke={ink.edge}
            strokeWidth={5}
          />
          <rect
            x={126}
            y={-60}
            width={186}
            height={58}
            rx={24}
            fill={grip.face}
            stroke={ink.edge}
            strokeWidth={INK_WEIGHT}
          />
          <rect
            x={140}
            y={-52}
            width={158}
            height={14}
            rx={7}
            fill={grip.rim}
            opacity={0.45}
          />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={172 + i * 54}
              cy={-30}
              r={7}
              fill={steel.rim}
              opacity={0.8}
            />
          ))}
        </g>

        <ImpactFlash
          cx={cutX}
          cy={BOARD_TOP - 30}
          age={age}
          color="#fff2d8"
          scale={0.9}
        />
        {/* Juice: a few drops thrown off the board on each cut. */}
        {age < 0.3
          ? [0, 1, 2, 3, 4].map((i) => {
              const p = age / 0.3;
              const a = -2.5 + i * 0.42;
              return (
                <circle
                  key={i}
                  cx={cutX + Math.cos(a) * (40 + p * 120)}
                  cy={
                    BOARD_TOP - 40 + Math.sin(a) * (30 + p * 90) + p * p * 110
                  }
                  r={7 - i * 0.8}
                  fill={KITCHEN.flesh}
                  opacity={1 - p}
                />
              );
            })
          : null}
      </g>
    </ActStage>
  );
};
