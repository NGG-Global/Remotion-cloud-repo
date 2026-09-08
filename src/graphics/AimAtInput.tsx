import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { DocSheet, STRUCTURED_LINES } from "./parts/DocSheet";

type AimAtInputProps = {
  readonly width: number;
  readonly height: number;
  /** Frame at which the reticle settles on the model. */
  readonly aimAt?: number;
  /** Frame at which the model is ruled out. */
  readonly ruleOutAt?: number;
  /** Frame at which the reticle finishes moving to the input. */
  readonly landAt?: number;
};

/**
 * Ruling out the obvious cause and landing on the real one.
 *
 * The line being illustrated is a correction — people assume the difference is
 * the model. Showing both candidates and moving between them makes the
 * correction visible; naming only the answer would leave the assumption
 * standing.
 */
export const AimAtInput: React.FC<AimAtInputProps> = ({
  width,
  height,
  aimAt = 12,
  ruleOutAt = 44,
  landAt = 92,
}) => {
  const frame = useCurrentFrame();

  const CARD = { width: Math.min(400, width * 0.24), height: height * 0.46 };
  const cy = height * 0.46;
  const modelX = width * 0.735;
  const inputX = width * 0.265;

  // The reticle starts off the top of the frame, settles on the model, holds
  // while it is ruled out, then travels to the input.
  const reticleX = interpolate(
    frame,
    [aimAt - 12, aimAt, ruleOutAt + 12, landAt],
    [modelX, modelX, modelX, inputX],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.5, 0, 0.2, 1),
    },
  );
  const reticleY = interpolate(
    frame,
    [aimAt - 12, aimAt],
    [cy - height * 0.5, cy],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const reticleR = interpolate(
    frame,
    [aimAt - 12, aimAt, aimAt + 8],
    [CARD.width * 0.75, CARD.width * 0.42, CARD.width * 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ruled = interpolate(frame - ruleOutAt, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const landed = interpolate(frame - landAt, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Candidate one: the model. Dims once it is ruled out. */}
      <div
        style={{
          position: "absolute",
          left: modelX - CARD.width / 2,
          top: cy - CARD.height / 2,
          width: CARD.width,
          height: CARD.height,
          borderRadius: 22,
          background: COLORS.surface,
          border: `1px solid ${ruled > 0.5 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - ruled * 0.62,
          filter: `saturate(${1 - ruled * 0.9})`,
        }}
      >
        <div
          style={{
            fontSize: CARD.width * 0.34,
            color: COLORS.accent,
            fontWeight: 800,
            fontFamily,
          }}
        >
          ✻
        </div>
      </div>
      <NodeLabel
        text="קלוד"
        cx={modelX}
        top={cy + CARD.height / 2 + 20}
        show={1}
        muted={ruled > 0.4}
      />

      {/* Candidate two: what you handed over. Lights up on arrival. */}
      <div
        style={{
          position: "absolute",
          left: inputX - CARD.width / 2,
          top: cy - CARD.height / 2,
          width: CARD.width,
          height: CARD.height,
          borderRadius: 22,
          background: COLORS.surface,
          border: `1px solid rgba(255,255,255,${0.1 + landed * 0.2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            landed > 0
              ? `0 0 ${52 * landed}px rgba(217,119,87,0.4)`
              : undefined,
        }}
      >
        <div style={{ opacity: 0.45 + landed * 0.55 }}>
          <DocSheet
            width={CARD.width * 0.62}
            height={CARD.height * 0.62}
            lines={STRUCTURED_LINES}
            tone={COLORS.text}
            background="transparent"
            borderColor="transparent"
          />
        </div>
      </div>
      <NodeLabel
        text="מה שנתתם לו"
        cx={inputX}
        top={cy + CARD.height / 2 + 20}
        show={1}
        accent={landed > 0.4}
      />

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* Reticle. One shape moving between two candidates carries the
            reasoning; two static rings would not. */}
        <g
          opacity={interpolate(frame, [0, aimAt - 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        >
          <circle
            cx={reticleX}
            cy={reticleY}
            r={reticleR}
            fill="none"
            stroke={landed > 0.2 ? COLORS.accent : COLORS.textMuted}
            strokeWidth={3}
            strokeDasharray="14 10"
            opacity={0.9}
          />
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const inner = reticleR - 16;
            const outer = reticleR + 16;
            return (
              <line
                key={deg}
                x1={reticleX + Math.cos(rad) * inner}
                y1={reticleY + Math.sin(rad) * inner}
                x2={reticleX + Math.cos(rad) * outer}
                y2={reticleY + Math.sin(rad) * outer}
                stroke={landed > 0.2 ? COLORS.accent : COLORS.textMuted}
                strokeWidth={3}
              />
            );
          })}
        </g>

        {/* The cross that rules the model out, drawn on rather than faded in. */}
        {ruled > 0 ? (
          <g
            stroke={COLORS.warn}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.95}
          >
            <line
              x1={modelX - CARD.width * 0.26}
              y1={cy - CARD.height * 0.2}
              x2={
                modelX -
                CARD.width * 0.26 +
                CARD.width * 0.52 * Math.min(1, ruled * 2)
              }
              y2={
                cy -
                CARD.height * 0.2 +
                CARD.height * 0.4 * Math.min(1, ruled * 2)
              }
            />
            {ruled > 0.5 ? (
              <line
                x1={modelX + CARD.width * 0.26}
                y1={cy - CARD.height * 0.2}
                x2={
                  modelX +
                  CARD.width * 0.26 -
                  CARD.width * 0.52 * Math.min(1, (ruled - 0.5) * 2)
                }
                y2={
                  cy -
                  CARD.height * 0.2 +
                  CARD.height * 0.4 * Math.min(1, (ruled - 0.5) * 2)
                }
              />
            ) : null}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

const NodeLabel: React.FC<{
  readonly text: string;
  readonly cx: number;
  readonly top: number;
  readonly show: number;
  readonly muted?: boolean;
  readonly accent?: boolean;
}> = ({ text, cx, top, show, muted, accent }) => (
  <div
    style={{
      position: "absolute",
      left: cx - 200,
      top,
      width: 400,
      textAlign: "center",
      direction: "rtl",
      fontFamily,
      fontSize: 36,
      fontWeight: 700,
      color: accent ? COLORS.accent : muted ? "#6b6259" : COLORS.text,
      opacity: show,
    }}
  >
    {text}
  </div>
);
