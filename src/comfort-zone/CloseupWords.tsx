import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import data from "./data/words.json";

const [SHOT_START, SHOT_END] = data.closeupShot;
const T0 = SHOT_START / data.fps;

const Glow: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <g
    style={{
      filter:
        "drop-shadow(0 0 10px rgba(255,255,255,0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
    }}
  >
    {children}
  </g>
);

const label = {
  fill: "#ffffff",
  fontFamily,
  fontWeight: 700,
} as const;

/**
 * The close-up in the armchair: "the person who said that... is me". In the master
 * the sentence arches over the man's head and slides out to the left, two
 * stray thoughts drift off the top right, and the answer sweeps in from the
 * right and up to the top left corner.
 */
export const CloseupWords: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOT_START || frame >= SHOT_END) {
    return null;
  }
  const t = frame / data.fps - T0; // seconds into the shot

  // "Who said that": right end starts at the head and the whole arch
  // moves left at the speed measured off the Hebrew (about 690 px/s).
  const whoX = 350 - 690 * t;
  const whoVisible = t < 1.6;

  // Stray thought at the very top right, already leaving.
  const sixX = 1540 + 900 * t;
  const sixY = 46 - 120 * t;

  // "Pizza" drifts up and to the right, as the Hebrew did.
  const pizzaT = t - 0.5;
  const pizzaVisible = pizzaT >= 0 && pizzaT < 1.2;

  // "Is me": enters beside the head at 2.05 s, grows and sweeps to the
  // top left corner, gone by 3.75 s.
  const meT = interpolate(t, [2.05, 3.75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const meVisible = t >= 2.05 && t < 3.75;
  const meX = interpolate(meT, [0, 1], [990, 480]);
  const meY = interpolate(meT, [0, 1], [320, 40]);
  const meScale = interpolate(meT, [0, 0.35, 1], [0.35, 0.9, 1.35]);
  const meFade = Math.min(1, meT / 0.1, (1 - meT) / 0.12);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ overflow: "visible" }}
      >
        <defs>
          <path id="who-arch" d="M 0 70 Q 330 -50 660 10" fill="none" />
        </defs>
        {whoVisible ? (
          <Glow>
            <g transform={`translate(${whoX} 250)`}>
              <text {...label} fontSize={78}>
                <textPath href="#who-arch" startOffset={0}>
                  WHO SAID THAT
                </textPath>
              </text>
            </g>
          </Glow>
        ) : null}
        {t < 0.6 ? (
          <Glow>
            <text
              {...label}
              x={sixX}
              y={sixY}
              fontSize={56}
              transform={`rotate(-8 ${sixX} ${sixY})`}
              opacity={0.9}
            >
              six already?
            </text>
          </Glow>
        ) : null}
        {pizzaVisible ? (
          <Glow>
            <text
              {...label}
              x={1320 + 640 * pizzaT}
              y={240 - 120 * pizzaT}
              fontSize={interpolate(pizzaT, [0, 1.2], [46, 58])}
              transform={`rotate(-12 ${1320 + 640 * pizzaT} ${240 - 120 * pizzaT})`}
              opacity={Math.min(1, pizzaT / 0.2)}
            >
              pizza
            </text>
          </Glow>
        ) : null}
        {meVisible ? (
          <Glow>
            <g
              transform={`translate(${meX} ${meY}) rotate(-28) scale(${meScale})`}
              opacity={meFade}
            >
              <text
                {...label}
                fontSize={92}
                textAnchor="middle"
                dominantBaseline="central"
              >
                IS ME
              </text>
            </g>
          </Glow>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
