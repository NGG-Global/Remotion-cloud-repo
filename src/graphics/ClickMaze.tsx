import React, { useMemo } from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

const COLS = 6;
const ROWS = 5;

/** Buttons the pointer visits, as indices into the grid. */
const ROUTE = [8, 3, 19, 11, 26, 14] as const;

const EASE = Easing.bezier(0.45, 0, 0.25, 1);

type ClickMazeProps = {
  readonly width: number;
  readonly height: number;
  /** Frames the hunt takes to play out. */
  readonly span?: number;
};

/**
 * A wall of interface chrome with a pointer hunting through it.
 *
 * Illustrates the opening line — that most tools expect you to know exactly
 * what to do and where to click. The route is built from the buttons' own
 * positions rather than from arbitrary coordinates, so the pointer always
 * lands on a control: it stabs at one, the control flashes, nothing happens,
 * and it moves on. That is the joke, and it only works if the hits connect.
 */
export const ClickMaze: React.FC<ClickMazeProps> = ({
  width,
  height,
  span = 150,
}) => {
  const frame = useCurrentFrame();

  // Deterministic layout. Remotion's `random()` is seeded, so the same wall
  // renders on every machine and on every re-render.
  const buttons = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; seed: number }[] =
      [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const seed = r * COLS + c;
        const w = 0.088 + random(`w${seed}`) * 0.055;
        out.push({
          x: 0.04 + (c / COLS) * 0.92 + (random(`x${seed}`) - 0.5) * 0.012,
          y: 0.08 + (r / ROWS) * 0.84 + (random(`y${seed}`) - 0.5) * 0.012,
          w,
          h: 0.082,
          seed,
        });
      }
    }
    return out;
  }, []);

  const centre = (index: number) => {
    const b = buttons[index] ?? buttons[0];
    return { x: (b.x + b.w / 2) * width, y: (b.y + b.h / 2) * height };
  };

  const legs = ROUTE.length;
  const t = interpolate(frame, [0, span], [0, 1], {
    extrapolateRight: "clamp",
  });
  const legFloat = t * legs;
  const leg = Math.min(legs - 1, Math.floor(legFloat));
  const legT = EASE(Math.min(1, legFloat - leg));

  const from = centre(ROUTE[Math.max(0, leg - 1)]);
  const to = centre(ROUTE[leg]);

  // A shallow arc reads as a hand moving rather than a linear tween.
  const arc = Math.sin(legT * Math.PI) * height * 0.05;
  const px = from.x + (to.x - from.x) * legT;
  const py = from.y + (to.y - from.y) * legT - arc;

  // The stab lands at the end of each leg.
  const stab = legT > 0.86 ? (legT - 0.86) / 0.14 : 0;

  return (
    <div style={{ position: "relative", width, height }}>
      {buttons.map((b) => {
        const isTarget = ROUTE[leg] === b.seed;
        const hit = isTarget ? stab : 0;

        const appear = interpolate(
          frame,
          [b.seed * 0.55, b.seed * 0.55 + 10],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={b.seed}
            style={{
              position: "absolute",
              left: b.x * width,
              top: b.y * height,
              width: b.w * width,
              height: b.h * height,
              borderRadius: 8,
              opacity: appear,
              border: `1.5px solid ${
                hit > 0 ? COLORS.accent : "rgba(255,255,255,0.16)"
              }`,
              backgroundColor:
                hit > 0 ? `${COLORS.accent}3d` : "rgba(255,255,255,0.055)",
              boxShadow: hit > 0 ? `0 0 22px ${COLORS.accent}66` : undefined,
              transform: `scale(${1 - hit * 0.06})`,
            }}
          >
            {/* A label stub, so each box reads as a control. */}
            <div
              style={{
                position: "absolute",
                left: "22%",
                right: "22%",
                top: "42%",
                height: 2,
                borderRadius: 2,
                backgroundColor:
                  hit > 0 ? COLORS.accent : "rgba(255,255,255,0.28)",
              }}
            />
          </div>
        );
      })}

      {/* The pointer, and a ring at each fruitless stab. */}
      <div style={{ position: "absolute", left: px, top: py }}>
        {stab > 0 ? (
          <div
            style={{
              position: "absolute",
              left: -30,
              top: -30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `2.5px solid ${COLORS.accent}`,
              opacity: 1 - stab,
              transform: `scale(${0.35 + stab * 0.9})`,
            }}
          />
        ) : null}

        <svg
          width={30}
          height={41}
          viewBox="0 0 24 34"
          style={{
            display: "block",
            filter: "drop-shadow(0 3px 7px rgba(0,0,0,0.6))",
          }}
          aria-hidden
        >
          <path
            d="M3 2 L3 26 L9.5 20 L14 31 L18.5 29 L14 18.5 L21 18.5 Z"
            fill="#ffffff"
            stroke={COLORS.ink}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
