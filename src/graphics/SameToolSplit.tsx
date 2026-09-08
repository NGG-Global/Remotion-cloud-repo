import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { BezierFlow, type Curve } from "./BezierFlow";
import { DocSheet, PLAIN_LINES, STRUCTURED_LINES } from "./parts/DocSheet";

type SameToolSplitProps = {
  readonly width: number;
  readonly height: number;
  /** Frame at which the generic result lands. */
  readonly oneAt: number;
  /** Frame at which the usable result lands. */
  readonly twoAt: number;
  /** Frame at which the measure between the two appears. */
  readonly gapAt: number;
};

/**
 * One prompt, two branches, two results a long way apart.
 *
 * The episode opens on a difference in outcome, not on a feature, so the
 * picture has to make the two outputs comparable at a glance: same origin,
 * same distance travelled, different shape on arrival. The measure between
 * them is what names the subject of the video.
 *
 * The generic result sits on the right because the narration reaches it first,
 * and a Hebrew frame is read from the right.
 */
export const SameToolSplit: React.FC<SameToolSplitProps> = ({
  width,
  height,
  oneAt,
  twoAt,
  gapAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SHEET = { width: Math.min(360, width * 0.21), height: height * 0.36 };
  const hubY = height * 0.13;
  const hubR = Math.min(66, height * 0.09);

  const poorX = width * 0.755;
  const poorTop = height * 0.52;
  const goodX = width * 0.245;
  const goodTop = height * 0.31;

  const hub = spring({ frame, fps, config: { damping: 200 } });

  const curveTo = (x: number, y: number): Curve => ({
    from: { x: width / 2, y: hubY + hubR + 6 },
    c1: { x: width / 2, y: hubY + hubR + 130 },
    c2: { x, y: y - 130 },
    to: { x, y: y - 8 },
  });
  const poorCurve = curveTo(poorX, poorTop);
  const goodCurve = curveTo(goodX, goodTop);

  /** Written fraction of a sheet, from the frame its first line appears. */
  const build = (at: number) =>
    interpolate(frame - at, [0, 46], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const gapIn = interpolate(frame - gapAt, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <BezierFlow
          curve={poorCurve}
          delay={oneAt - 34}
          travel={30}
          stagger={7}
          count={4}
          color={COLORS.textMuted}
          until={oneAt}
        />
        <BezierFlow
          curve={goodCurve}
          delay={twoAt - 34}
          travel={30}
          stagger={7}
          count={4}
          color={COLORS.accent}
          until={twoAt}
        />

        {/* The measure between the two results. Drawn between the sheets so it
            reads as the distance between them rather than as a label on one. */}
        {gapIn > 0 ? (
          <g opacity={gapIn}>
            <line
              x1={width / 2}
              y1={goodTop}
              x2={width / 2}
              y2={goodTop + (poorTop - goodTop) * gapIn}
              stroke={COLORS.warn}
              strokeWidth={3}
            />
            <line
              x1={width / 2 - 26}
              y1={goodTop}
              x2={width / 2 + 26}
              y2={goodTop}
              stroke={COLORS.warn}
              strokeWidth={3}
            />
            <line
              x1={width / 2 - 26}
              y1={poorTop}
              x2={width / 2 + 26}
              y2={poorTop}
              stroke={COLORS.warn}
              strokeWidth={3}
              opacity={gapIn > 0.9 ? 1 : 0}
            />
          </g>
        ) : null}
      </svg>

      {/* The tool: one node both branches come out of. */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - hubR,
          top: hubY - hubR,
          width: hubR * 2,
          height: hubR * 2,
          borderRadius: "50%",
          background: COLORS.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${0.6 + hub * 0.4})`,
          opacity: hub,
          boxShadow: `0 0 ${40 * hub}px rgba(217,119,87,0.45)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: hubR * 0.62,
            fontWeight: 800,
            color: COLORS.background,
          }}
        >
          ✻
        </div>
      </div>

      <Label
        text="אותו כלי, אותה בקשה"
        left={width / 2 - 170}
        top={hubY + hubR + 14}
        width={340}
        show={interpolate(frame, [10, 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
        align="center"
      />

      {/* Result one: correct, generic, soft. */}
      <Arrival
        left={poorX - SHEET.width / 2}
        top={poorTop}
        at={oneAt}
        frame={frame}
        fps={fps}
      >
        <DocSheet
          width={SHEET.width}
          height={SHEET.height}
          lines={PLAIN_LINES}
          progress={build(oneAt)}
          tone={COLORS.textMuted}
          blur={1.6}
          tag="טיוטה גנרית"
        />
        <Caption
          text="כמעט לכתוב מחדש"
          width={SHEET.width}
          color={COLORS.textMuted}
          show={build(oneAt)}
        />
      </Arrival>

      {/* Result two: structured, sharp, ready to be opened. */}
      <Arrival
        left={goodX - SHEET.width / 2}
        top={goodTop}
        at={twoAt}
        frame={frame}
        fps={fps}
      >
        <DocSheet
          width={SHEET.width}
          height={SHEET.height}
          lines={STRUCTURED_LINES}
          progress={build(twoAt)}
          tone={COLORS.text}
          tag="אפשר להתחיל לעבוד"
        />
        <Caption
          text="פותחים ועורכים"
          width={SHEET.width}
          color={COLORS.accentSoft}
          show={build(twoAt)}
        />
      </Arrival>

      {gapIn > 0.9 ? (
        <Label
          text="פער"
          left={width / 2 + 40}
          top={(goodTop + poorTop) / 2 - 26}
          width={120}
          show={interpolate(frame - gapAt, [20, 34], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
          align="start"
          color={COLORS.warn}
          size={38}
        />
      ) : null}
    </div>
  );
};

/** A sheet that springs into place when its branch arrives. */
const Arrival: React.FC<{
  readonly left: number;
  readonly top: number;
  readonly at: number;
  readonly frame: number;
  readonly fps: number;
  readonly children: React.ReactNode;
}> = ({ left, top, at, frame, fps, children }) => {
  const pop = spring({
    frame: frame - at,
    fps,
    config: { damping: 60, stiffness: 140 },
  });
  if (frame < at - 2) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        opacity: pop,
        transform: `translateY(${(1 - pop) * 26}px) scale(${0.94 + pop * 0.06})`,
      }}
    >
      {children}
    </div>
  );
};

const Caption: React.FC<{
  readonly text: string;
  readonly width: number;
  readonly color: string;
  readonly show: number;
}> = ({ text, width, color, show }) => (
  <div
    style={{
      width,
      marginTop: 16,
      direction: "rtl",
      textAlign: "center",
      fontFamily,
      fontSize: 30,
      fontWeight: 700,
      color,
      opacity: interpolate(show, [0.55, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    }}
  >
    {text}
  </div>
);

const Label: React.FC<{
  readonly text: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly show: number;
  readonly align?: "start" | "center";
  readonly color?: string;
  readonly size?: number;
}> = ({ text, left, top, width, show, align = "center", color, size = 28 }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width,
      direction: "rtl",
      textAlign: align === "center" ? "center" : "right",
      fontFamily,
      fontSize: size,
      fontWeight: 700,
      color: color ?? COLORS.textMuted,
      opacity: show,
    }}
  >
    {text}
  </div>
);
