import React from "react";
import { clamp01, lastHitAge, settle, useClock } from "../../clock";
import { faces, TT } from "../../theme";
import { CENTRE_X, INK_WEIGHT } from "../frame";
import { ActStage, CastShadow } from "./ActStage";
import type { ActProps } from "./types";

const COLS = 5;
const ROWS = 7;
const STEP = 112;
const SHEET = { x: 74, y: 236, w: 572, h: 812 } as const;
const ORIGIN_X = CENTRE_X - ((COLS - 1) * STEP) / 2;
const ORIGIN_Y = SHEET.y + 92;

const FILM = "#e1f2e7";
const BACKING = "#b9cfc6";
const DOME = "#aed4d1";
const SPENT = "#cde0d6";
const SEAM = "#8eaeab";

/**
 * Bubble wrap. The sheet pops in a serpentine, one air pocket per beat, which makes
 * the run of kept beats legible as a path across the film rather than as a score.
 */
export const BubbleTall: React.FC<ActProps> = ({ hits, finish }) => {
  const { time } = useClock();
  const age = lastHitAge(time, hits);
  const popped = hits.filter((h) => h <= time).length;
  const jolt = settle(age, 92, 24) * 5;

  // A clean round sets off a short cascade: the sheet finishes the job itself.
  const cascade =
    finish !== undefined && time >= finish
      ? Math.min(COLS * ROWS - popped, Math.floor((time - finish) / 0.09))
      : 0;

  const ink = faces(SEAM);

  return (
    <ActStage paper="#e5eee6" sun="#d8f2dd" sunX={40} sunY={20}>
      <g transform={`translate(0 ${jolt * 0.4})`}>
        <CastShadow
          cx={CENTRE_X}
          cy={SHEET.y + SHEET.h + 6}
          rx={300}
          ry={28}
          opacity={0.13}
        />
        <rect
          x={SHEET.x + 14}
          y={SHEET.y + 18}
          width={SHEET.w}
          height={SHEET.h}
          rx={26}
          fill={BACKING}
        />
        <rect
          x={SHEET.x}
          y={SHEET.y}
          width={SHEET.w}
          height={SHEET.h}
          rx={26}
          fill={FILM}
        />
        <rect
          x={SHEET.x}
          y={SHEET.y}
          width={SHEET.w}
          height={SHEET.h}
          rx={26}
          fill="none"
          stroke={ink.edge}
          strokeWidth={INK_WEIGHT}
        />

        {/* Welded seams between the pockets, and the perforated edge. */}
        {Array.from({ length: COLS - 1 }, (_, c) => (
          <line
            key={`c${c}`}
            x1={ORIGIN_X + STEP / 2 + c * STEP}
            y1={SHEET.y + 16}
            x2={ORIGIN_X + STEP / 2 + c * STEP}
            y2={SHEET.y + SHEET.h - 16}
            stroke="#fff"
            strokeWidth={3}
            opacity={0.6}
          />
        ))}
        {Array.from({ length: ROWS - 1 }, (_, r) => (
          <line
            key={`r${r}`}
            x1={SHEET.x + 16}
            y1={ORIGIN_Y + STEP / 2 + r * STEP}
            x2={SHEET.x + SHEET.w - 16}
            y2={ORIGIN_Y + STEP / 2 + r * STEP}
            stroke="#fff"
            strokeWidth={3}
            opacity={0.6}
          />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <React.Fragment key={i}>
            <circle
              cx={SHEET.x + 14 + i * 25}
              cy={SHEET.y + 9}
              r={2.2}
              fill="#90b5b0"
              opacity={0.5}
            />
            <circle
              cx={SHEET.x + 14 + i * 25}
              cy={SHEET.y + SHEET.h - 9}
              r={2.2}
              fill="#90b5b0"
              opacity={0.5}
            />
          </React.Fragment>
        ))}

        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const row = Math.floor(i / COLS);
          // Serpentine, the way the game walks the sheet.
          const col = row % 2 ? COLS - 1 - (i % COLS) : i % COLS;
          const x = ORIGIN_X + col * STEP;
          const y = ORIGIN_Y + row * STEP;

          const stamp =
            i < popped
              ? (hits[i] ?? 0)
              : i < popped + cascade
                ? (finish ?? 0) + (i - popped) * 0.09
                : Infinity;
          const pocketAge = time - stamp;
          const isPopped = pocketAge >= 0;
          const flat = isPopped ? clamp01(pocketAge / 0.09) : 0;
          const r = 43 - flat * 5;
          const next = i === popped + cascade && finish === undefined;

          return (
            <g key={i}>
              <ellipse
                cx={x + 4}
                cy={y + 9}
                rx={46}
                ry={isPopped ? 30 : 44}
                fill="#648c90"
                opacity={isPopped ? 0.06 : 0.16}
              />
              <ellipse
                cx={x}
                cy={y}
                rx={r}
                ry={r * (1 - flat * 0.16)}
                fill={isPopped ? SPENT : DOME}
                opacity={0.88}
              />
              <ellipse
                cx={x}
                cy={y}
                rx={r}
                ry={r * (1 - flat * 0.16)}
                fill="none"
                stroke={isPopped ? "#8eb5ad" : "#6d999e"}
                strokeWidth={3}
                opacity={0.7}
              />
              {isPopped ? (
                <>
                  {/* A spent pocket: slack film with creases running off centre. */}
                  <ellipse
                    cx={x}
                    cy={y + 4}
                    rx={31}
                    ry={23}
                    fill="#f4fff1"
                    opacity={0.42}
                  />
                  {[0, 1, 2, 3, 4].map((k) => {
                    const a = k * 1.26 + i;
                    return (
                      <line
                        key={k}
                        x1={x + Math.cos(a) * 12}
                        y1={y + Math.sin(a) * 10}
                        x2={x + Math.cos(a + 0.25) * 32}
                        y2={y + Math.sin(a + 0.25) * 29}
                        stroke="#7fa7a1"
                        strokeWidth={2}
                        opacity={0.6}
                      />
                    );
                  })}
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={15}
                    ry={10}
                    fill="#759c99"
                    opacity={0.36}
                  />
                  {pocketAge < 0.28 ? (
                    <g opacity={1 - pocketAge / 0.28}>
                      <circle
                        cx={x}
                        cy={y}
                        r={30 + (pocketAge / 0.28) * 36}
                        fill="none"
                        stroke="#fff"
                        strokeWidth={4}
                      />
                      {[0, 1, 2, 3, 4, 5].map((k) => {
                        const a = k * Math.PI * 0.333;
                        const d = 40 + (pocketAge / 0.28) * 34;
                        return (
                          <circle
                            key={k}
                            cx={x + Math.cos(a) * d}
                            cy={y + Math.sin(a) * d}
                            r={4.5 * (1 - pocketAge / 0.28)}
                            fill="#fff"
                          />
                        );
                      })}
                    </g>
                  ) : null}
                </>
              ) : (
                <>
                  {/* Nested highlights give each pocket a slippery dome. */}
                  <ellipse
                    cx={x - 8}
                    cy={y - 9}
                    rx={32}
                    ry={30}
                    fill="#e5faf1"
                    opacity={0.78}
                  />
                  <ellipse
                    cx={x - 16}
                    cy={y - 22}
                    rx={12}
                    ry={7}
                    fill="#fff"
                    opacity={0.92}
                  />
                  <circle
                    cx={x + 19}
                    cy={y + 17}
                    r={5}
                    fill="#fff"
                    opacity={0.6}
                  />
                  <path
                    d={`M ${x + 36} ${y + 9} a 36 36 0 0 1 -24 24`}
                    fill="none"
                    stroke="#faffed"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                  {next ? (
                    <circle
                      cx={x}
                      cy={y}
                      r={49 + Math.sin(time * 9) * 3}
                      fill="none"
                      stroke={TT.brass}
                      strokeWidth={4}
                      opacity={0.75}
                    />
                  ) : null}
                </>
              )}
            </g>
          );
        })}
      </g>
    </ActStage>
  );
};
