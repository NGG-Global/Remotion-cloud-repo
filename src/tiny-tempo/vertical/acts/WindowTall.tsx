import React from "react";
import { clamp01, lastHitAge, settle, useClock } from "../../clock";
import { faces, GLASS, shade } from "../../theme";
import { CENTRE_X, INK_WEIGHT } from "../frame";
import { ActStage, CastShadow } from "./ActStage";
import type { ActProps } from "./types";

const GLASS_BOX = { x: 96, y: 210, w: 528, h: 760 } as const;
/** One stroke crosses the pane in just under half a beat, so the pass reads as a hit. */
const STROKE = 0.22;

/**
 * Window cleaning. One tap is one lateral stroke, alternating direction, and each
 * stroke takes a band of grime with it — so the view behind the glass is built out
 * of the beats the player kept.
 */
export const WindowTall: React.FC<ActProps> = ({ hits }) => {
  const { time } = useClock();
  const age = lastHitAge(time, hits);
  const bands = Math.max(1, hits.length);
  const bandH = GLASS_BOX.h / bands;
  const jolt = settle(age, 70, 22) * 4;

  const ink = faces(GLASS.ink);
  const frame = faces(GLASS.frame);
  const sill = faces(GLASS.sill);

  // The stroke in flight, plus how far each band has been cleared.
  const cleared = hits.map((hit, i) => {
    if (time < hit) return 0;
    const p = clamp01((time - hit) / STROKE);
    return i % 2 === 0 ? p : -p;
  });
  const live = hits.reduce(
    (found, hit, i) => (time >= hit && time < hit + STROKE ? i : found),
    -1,
  );

  return (
    <ActStage
      paper={GLASS.paper}
      sun={GLASS.light}
      sunX={62}
      sunY={20}
      push={[1.03, 1.1]}
    >
      <g transform={`translate(${jolt} 0)`}>
        {/* Interior wall and the sill the squeegee rests against. */}
        <rect x={0} y={0} width={720} height={1280} fill={GLASS.paper} />
        <rect x={0} y={1004} width={720} height={276} fill={sill.shade} />
        <rect x={0} y={1004} width={720} height={54} fill={sill.face} />
        <rect
          x={0}
          y={1004}
          width={720}
          height={14}
          fill={sill.rim}
          opacity={0.6}
        />

        <CastShadow cx={CENTRE_X} cy={1012} rx={312} ry={26} opacity={0.16} />

        {/* Casing first: a filled slab the pane is then cut into. Drawing it after
            the glass paints over the view the act exists to reveal. */}
        <rect
          x={GLASS_BOX.x - 36}
          y={GLASS_BOX.y - 36}
          width={GLASS_BOX.w + 72}
          height={GLASS_BOX.h + 76}
          rx={22}
          fill={frame.shade}
        />
        <rect
          x={GLASS_BOX.x - 36}
          y={GLASS_BOX.y - 36}
          width={GLASS_BOX.w + 72}
          height={GLASS_BOX.h + 52}
          rx={22}
          fill={frame.face}
        />
        <rect
          x={GLASS_BOX.x - 30}
          y={GLASS_BOX.y - 30}
          width={GLASS_BOX.w + 60}
          height={14}
          rx={7}
          fill={frame.rim}
          opacity={0.55}
        />

        {/* Behind the glass: sky, two hills, a low sun. */}
        <defs>
          <clipPath id="tt-pane">
            <rect
              x={GLASS_BOX.x}
              y={GLASS_BOX.y}
              width={GLASS_BOX.w}
              height={GLASS_BOX.h}
              rx={10}
            />
          </clipPath>
          <linearGradient id="tt-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(GLASS.sky, 0.18)} />
            <stop offset="62%" stopColor={GLASS.sky} />
            <stop offset="100%" stopColor="#c8e2d6" />
          </linearGradient>
        </defs>
        <g clipPath="url(#tt-pane)">
          <rect
            x={GLASS_BOX.x}
            y={GLASS_BOX.y}
            width={GLASS_BOX.w}
            height={GLASS_BOX.h}
            fill="url(#tt-sky)"
          />
          <circle
            cx={GLASS_BOX.x + 142}
            cy={GLASS_BOX.y + 116}
            r={54}
            fill={GLASS.light}
            opacity={0.95}
          />
          <circle
            cx={GLASS_BOX.x + 142}
            cy={GLASS_BOX.y + 116}
            r={88}
            fill={GLASS.light}
            opacity={0.26}
          />
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={GLASS_BOX.x + 120 + i * 190}
              cy={GLASS_BOX.y + 262 + (i % 2) * 44}
              rx={86 - i * 8}
              ry={26}
              fill="#fff"
              opacity={0.5}
            />
          ))}
          <path
            d={`M ${GLASS_BOX.x} ${GLASS_BOX.y + 452} q 130 -120 260 -34 q 140 96 268 -16 l 0 372 l -528 0 Z`}
            fill={shade(GLASS.hill, -0.16)}
          />
          <path
            d={`M ${GLASS_BOX.x} ${GLASS_BOX.y + 528} q 150 -96 290 -10 q 120 74 238 6 l 0 300 l -528 0 Z`}
            fill={GLASS.hill}
          />
          <path
            d={`M ${GLASS_BOX.x} ${GLASS_BOX.y + 540} q 150 -92 290 -8`}
            fill="none"
            stroke={shade(GLASS.hill, 0.24)}
            strokeWidth={8}
            opacity={0.7}
          />

          {/* Diagonal reflections, stronger the cleaner the pane gets. */}
          {[0, 1].map((i) => (
            <path
              key={i}
              d={`M ${GLASS_BOX.x - 120 + i * 250} ${GLASS_BOX.y + GLASS_BOX.h} l 300 -${GLASS_BOX.h + 60} l ${84 - i * 34} 0 l -300 ${GLASS_BOX.h + 60} Z`}
              fill="#fff"
              opacity={
                0.16 +
                (cleared.filter((c) => Math.abs(c) > 0.9).length / bands) * 0.2
              }
            />
          ))}

          {/* Grime. Each band is wiped away by its own stroke. */}
          {Array.from({ length: bands }, (_, i) => {
            const c = cleared[i] ?? 0;
            const y = GLASS_BOX.y + i * bandH;
            const width = GLASS_BOX.w * (1 - Math.abs(c));
            const x = c >= 0 ? GLASS_BOX.x + GLASS_BOX.w - width : GLASS_BOX.x;
            if (width <= 0.5) return null;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={bandH + 1}
                  fill="#b3ad8f"
                  opacity={0.72}
                />
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={bandH + 1}
                  fill="#8d8a6e"
                  opacity={0.2}
                />
                {[0, 1, 2, 3, 4].map((k) => (
                  <ellipse
                    key={k}
                    cx={x + ((k * 137 + i * 61) % Math.max(1, width))}
                    cy={y + 22 + ((k * 53 + i * 29) % Math.max(1, bandH - 40))}
                    rx={26 - k * 3}
                    ry={15 - k}
                    fill="#6f6d55"
                    opacity={0.22}
                  />
                ))}
              </g>
            );
          })}

          {/* The rubber's leading edge: a bright wet line and a curl of suds. */}
          {live >= 0
            ? (() => {
                const c = cleared[live] ?? 0;
                const edge = GLASS_BOX.x + GLASS_BOX.w * (c >= 0 ? 1 - c : -c);
                const y = GLASS_BOX.y + live * bandH;
                return (
                  <g>
                    <rect
                      x={edge - 5}
                      y={y}
                      width={10}
                      height={bandH}
                      fill="#fff"
                      opacity={0.85}
                    />
                    {[0, 1, 2, 3].map((k) => (
                      <circle
                        key={k}
                        cx={edge + (c >= 0 ? -16 : 16) * (1 + k * 0.4)}
                        cy={y + 24 + k * (bandH / 5)}
                        r={11 - k * 2}
                        fill="#fff"
                        opacity={0.6}
                      />
                    ))}
                  </g>
                );
              })()
            : null}
        </g>

        {/* Glazing bars and the ink edges, over the glass. */}
        <rect
          x={CENTRE_X - 11}
          y={GLASS_BOX.y}
          width={22}
          height={GLASS_BOX.h}
          fill={frame.face}
          stroke={ink.edge}
          strokeWidth={4}
        />
        <rect
          x={GLASS_BOX.x}
          y={GLASS_BOX.y + GLASS_BOX.h * 0.42}
          width={GLASS_BOX.w}
          height={22}
          fill={frame.face}
          stroke={ink.edge}
          strokeWidth={4}
        />
        <rect
          x={GLASS_BOX.x}
          y={GLASS_BOX.y}
          width={GLASS_BOX.w}
          height={GLASS_BOX.h}
          rx={10}
          fill="none"
          stroke={ink.edge}
          strokeWidth={INK_WEIGHT}
        />
        <rect
          x={GLASS_BOX.x - 36}
          y={GLASS_BOX.y - 36}
          width={GLASS_BOX.w + 72}
          height={GLASS_BOX.h + 76}
          rx={22}
          fill="none"
          stroke={ink.edge}
          strokeWidth={INK_WEIGHT}
        />

        {/* Squeegee and glove. It rides the live stroke, and between strokes parks at
            the start of the next band — a tool that vanishes off the glass between
            beats makes the act look like it is standing still. */}
        {(() => {
          const band =
            live >= 0
              ? live
              : Math.min(bands - 1, hits.filter((h) => h <= time).length);
          const c = live >= 0 ? (cleared[band] ?? 0) : band % 2 === 0 ? 0 : -0;
          const edge =
            live >= 0
              ? GLASS_BOX.x + GLASS_BOX.w * (c >= 0 ? 1 - c : -c)
              : band % 2 === 0
                ? GLASS_BOX.x + GLASS_BOX.w
                : GLASS_BOX.x;
          const y = GLASS_BOX.y + band * bandH + bandH / 2;
          const facing = band % 2 === 0 ? 1 : -1;
          const glove = faces(GLASS.glove);
          return (
            <g transform={`translate(${edge} ${y})`}>
              <rect
                x={-7}
                y={-bandH / 2 - 6}
                width={14}
                height={bandH + 12}
                rx={7}
                fill={ink.face}
              />
              <rect
                x={facing * 8 - 13}
                y={-bandH / 2 - 14}
                width={26}
                height={bandH + 28}
                rx={12}
                fill="#cfd8db"
                stroke={ink.edge}
                strokeWidth={5}
              />
              <rect
                x={facing * 30 - 10}
                y={-22}
                width={94 * facing}
                height={44}
                rx={20}
                fill={glove.face}
                stroke={ink.edge}
                strokeWidth={INK_WEIGHT}
              />
              <rect
                x={facing * 44 - 8}
                y={-14}
                width={58 * facing}
                height={11}
                rx={6}
                fill={glove.rim}
                opacity={0.6}
              />
            </g>
          );
        })()}
      </g>
    </ActStage>
  );
};
