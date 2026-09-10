import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { BezierFlow, curveToPath, type Curve } from "./BezierFlow";

export type ModeStep = {
  readonly at: number;
  readonly label: string;
  /** Draw as a caution rather than a step: something this mode does not do. */
  readonly deny?: boolean;
};

type ModeAnatomyProps = {
  readonly width: number;
  readonly height: number;
  /** Frame at which files start going up into the conversation. */
  readonly uploadAt: number;
  /** Frame at which you are shown to be in the loop throughout. */
  readonly loopAt: number;
  /** Frame at which the deliverable comes back down to the machine. */
  readonly downloadAt: number;
  /** Frame at which the Cowork half takes over. */
  readonly coworkAt: number;
  /** Frame at which the transfers are struck out. */
  readonly noTransferAt: number;
  /** Frame at which the deliverable is written back into the folder. */
  readonly writeBackAt: number;
  /** Captions for each half, shown as a row along the foot. */
  readonly chatSteps: readonly ModeStep[];
  readonly coworkSteps: readonly ModeStep[];
};

const FILES = ["הצעה.docx", "נתונים.xlsx", "מצגת.pptx"] as const;

/**
 * Where the files sit, and who runs the process.
 *
 * The narration is explicit that this is not a difference in capability, so
 * the two halves share one stage: the same machine on the right, the same
 * Claude on the left, and only the traffic between them changes. Held as one
 * continuous take rather than two scenes, because the second half is defined
 * by what it removes from the first — and a cut would lose the removal.
 */
export const ModeAnatomy: React.FC<ModeAnatomyProps> = ({
  width,
  height,
  uploadAt,
  loopAt,
  downloadAt,
  coworkAt,
  noTransferAt,
  writeBackAt,
  chatSteps,
  coworkSteps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cy = height * 0.44;
  const FOLDER = { width: width * 0.24, height: height * 0.44 };
  const folderLeft = width * 0.71;
  const folderTop = cy - FOLDER.height / 2;

  const PANEL = { width: width * 0.27, height: height * 0.5 };
  const panelLeft = width * 0.05;
  const panelTop = cy - PANEL.height / 2;

  const cowork = interpolate(frame, [coworkAt, coworkAt + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const struck = interpolate(frame - noTransferAt, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reach = interpolate(frame - (coworkAt + 18), [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wrote = spring({
    frame: frame - writeBackAt,
    fps,
    config: { damping: 60, stiffness: 160 },
  });

  const upCurve: Curve = {
    from: { x: folderLeft - 8, y: cy - 40 },
    c1: { x: folderLeft - 200, y: cy - 150 },
    c2: { x: panelLeft + PANEL.width + 200, y: cy - 150 },
    to: { x: panelLeft + PANEL.width + 8, y: cy - 40 },
  };
  const downCurve: Curve = {
    from: { x: panelLeft + PANEL.width + 8, y: cy + 60 },
    c1: { x: panelLeft + PANEL.width + 200, y: cy + 170 },
    c2: { x: folderLeft - 200, y: cy + 170 },
    to: { x: folderLeft - 8, y: cy + 60 },
  };
  /** Cowork's single link: Claude working where the files already are. */
  const reachCurve: Curve = {
    from: { x: panelLeft + PANEL.width + 8, y: cy },
    c1: { x: panelLeft + PANEL.width + 190, y: cy },
    c2: { x: folderLeft - 190, y: cy },
    to: { x: folderLeft - 8, y: cy },
  };

  const steps = cowork > 0.5 ? coworkSteps : chatSteps;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Which mode is on screen. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 44,
          fontWeight: 800,
          direction: "rtl",
          color: COLORS.accent,
          opacity: interpolate(frame, [4, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {cowork > 0.5 ? "ב‑Cowork" : "בצ׳אט"}
      </div>

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* Chat: files up, deliverable back down. Both are journeys the
            person makes, which is exactly what the other mode removes. */}
        {cowork < 1 ? (
          <g opacity={1 - cowork}>
            <TransferArc
              curve={upCurve}
              at={uploadAt}
              frame={frame}
              color={COLORS.accent}
            />
            <BezierFlow
              curve={upCurve}
              delay={uploadAt}
              travel={34}
              stagger={11}
              count={3}
              until={uploadAt + 40}
              showTrack={false}
            />
            <TransferArc
              curve={downCurve}
              at={downloadAt}
              frame={frame}
              color={COLORS.accentSoft}
            />
            <BezierFlow
              curve={downCurve}
              delay={downloadAt}
              travel={34}
              stagger={10}
              count={2}
              color={COLORS.accentSoft}
              until={downloadAt + 30}
              showTrack={false}
            />
          </g>
        ) : null}

        {/* Cowork: one link, and the transfers crossed off. */}
        {cowork > 0 ? (
          <g opacity={cowork}>
            <path
              d={curveToPath(reachCurve)}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={4}
              pathLength="1"
              strokeDasharray={1}
              strokeDashoffset={1 - reach}
              opacity={0.85}
            />
            {reach > 0.92 ? (
              <path
                d={`M ${folderLeft - 26} ${cy - 13} L ${folderLeft - 6} ${cy} L ${folderLeft - 26} ${cy + 13} Z`}
                fill={COLORS.accent}
                opacity={interpolate(reach, [0.92, 1], [0, 0.9], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              />
            ) : null}
            {struck > 0 ? (
              <>
                <path
                  d={curveToPath(upCurve)}
                  fill="none"
                  stroke={COLORS.textMuted}
                  strokeWidth={3}
                  strokeDasharray="7 9"
                  opacity={0.3 * struck}
                />
                <path
                  d={curveToPath(downCurve)}
                  fill="none"
                  stroke={COLORS.textMuted}
                  strokeWidth={3}
                  strokeDasharray="7 9"
                  opacity={0.3 * struck}
                />
                {[cy - 150, cy + 170].map((y, i) => (
                  <g
                    key={i}
                    stroke={COLORS.warn}
                    strokeWidth={7}
                    strokeLinecap="round"
                  >
                    <line
                      x1={width / 2 - 28}
                      y1={y - 28}
                      x2={width / 2 - 28 + 56 * Math.min(1, struck * 2)}
                      y2={y - 28 + 56 * Math.min(1, struck * 2)}
                    />
                    {struck > 0.5 ? (
                      <line
                        x1={width / 2 + 28}
                        y1={y - 28}
                        x2={
                          width / 2 + 28 - 56 * Math.min(1, (struck - 0.5) * 2)
                        }
                        y2={y - 28 + 56 * Math.min(1, (struck - 0.5) * 2)}
                      />
                    ) : null}
                  </g>
                ))}
              </>
            ) : null}
          </g>
        ) : null}
      </svg>

      {/* The machine, and the folder on it. Unmoved throughout. */}
      <div
        style={{
          position: "absolute",
          left: folderLeft,
          top: folderTop,
          width: FOLDER.width,
          height: FOLDER.height,
          borderRadius: 16,
          background: COLORS.surface,
          border: `2px solid ${cowork > 0.5 ? COLORS.accent : "rgba(255,255,255,0.12)"}`,
          direction: "rtl",
          padding: "18px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 800,
            color: cowork > 0.5 ? COLORS.accent : COLORS.textMuted,
            marginBottom: 14,
          }}
        >
          {cowork > 0.5 ? "תיקייה על המחשב שלכם" : "המחשב שלכם"}
        </div>
        {FILES.map((name, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
              padding: "8px 12px",
              borderRadius: 9,
              background: COLORS.surfaceRaised,
              opacity: interpolate(frame - (4 + i * 6), [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: COLORS.accentSoft,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily,
                fontSize: 24,
                fontWeight: 600,
                color: COLORS.text,
                direction: "ltr",
              }}
            >
              {name}
            </span>
          </div>
        ))}

        {/* Cowork writes the result back in beside the sources. */}
        {frame >= writeBackAt - 2 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 4,
              padding: "8px 12px",
              borderRadius: 9,
              background: "rgba(217,119,87,0.2)",
              border: `1px solid ${COLORS.accent}`,
              opacity: wrote,
              transform: `translateY(${(1 - wrote) * 12}px)`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: COLORS.accent,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.accent,
                direction: "ltr",
              }}
            >
              סיכום.docx
            </span>
          </div>
        ) : null}
      </div>

      {/* Claude's side. In chat it is a conversation you sit inside; in
          Cowork it is the same Claude working somewhere else. */}
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop,
          width: PANEL.width,
          height: PANEL.height,
          borderRadius: 18,
          background: COLORS.backgroundDeep,
          border: `1px solid rgba(217,119,87,0.32)`,
          direction: "rtl",
          padding: "18px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.accent,
            marginBottom: 14,
          }}
        >
          {cowork > 0.5 ? "אותו קלוד" : "השיחה"}
        </div>

        {/* In chat the uploaded files show up here; in Cowork they never do. */}
        {cowork < 0.5
          ? FILES.map((name, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                  padding: "8px 12px",
                  borderRadius: 9,
                  background: COLORS.surface,
                  opacity: interpolate(
                    frame - (uploadAt + 30 + i * 11),
                    [0, 12],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: COLORS.accentSoft,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily,
                    fontSize: 22,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                    direction: "ltr",
                  }}
                >
                  {name}
                </span>
              </div>
            ))
          : null}

        {/* You, in the loop the whole way. Only in chat. */}
        {cowork > 0.5 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              opacity: cowork,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 92,
                fontWeight: 800,
                color: COLORS.accent,
                lineHeight: 1,
              }}
            >
              ✻
            </span>
            <span
              style={{
                fontFamily,
                fontSize: 26,
                fontWeight: 700,
                color: COLORS.textMuted,
                textAlign: "center",
                padding: "0 18px",
              }}
            >
              לא מחזיק את הקבצים
            </span>
          </div>
        ) : null}

        {cowork < 0.5 && frame >= loopAt - 2 ? (
          <div
            style={{
              position: "absolute",
              right: 20,
              left: 20,
              bottom: 18,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(217,119,87,0.16)",
              border: `1px solid ${COLORS.accent}`,
              textAlign: "center",
              fontFamily,
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.accent,
              opacity: interpolate(frame - loopAt, [0, 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            אתם בפנים כל הדרך
          </div>
        ) : null}
      </div>

      {/* The captions for whichever half is on screen. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          direction: "rtl",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {steps.map((step, i) => {
          const show = interpolate(frame - step.at, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          if (show <= 0) {
            return null;
          }
          return (
            <span
              key={i}
              style={{
                fontFamily,
                fontSize: 28,
                fontWeight: 700,
                padding: "8px 20px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                color: step.deny ? COLORS.ink : COLORS.text,
                background: step.deny ? COLORS.warn : "rgba(255,255,255,0.07)",
                border: `1px solid ${
                  step.deny ? COLORS.warn : "rgba(255,255,255,0.1)"
                }`,
                opacity: show,
                transform: `translateY(${(1 - show) * 10}px)`,
              }}
            >
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/**
 * One transfer, drawn on with a head at its far end.
 *
 * The tokens say something is moving; the arc says where it went and stays
 * there afterwards, which is what lets the second half of the scene cross it
 * out. Two of these in opposite directions read as two journeys, where two
 * plain dashed tracks read as one loop.
 */
const TransferArc: React.FC<{
  readonly curve: Curve;
  readonly at: number;
  readonly frame: number;
  readonly color: string;
}> = ({ curve, at, frame, color }) => {
  const drawn = interpolate(frame - at, [0, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (drawn <= 0) {
    return null;
  }

  // The head sits at the curve's end point, angled along its final segment.
  const angle =
    (Math.atan2(curve.to.y - curve.c2.y, curve.to.x - curve.c2.x) * 180) /
    Math.PI;

  return (
    <>
      <path
        d={curveToPath(curve)}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={1}
        pathLength="1"
        strokeDashoffset={1 - drawn}
        opacity={0.45}
      />
      {drawn > 0.95 ? (
        <path
          d="M -20 -10 L 0 0 L -20 10 Z"
          fill={color}
          opacity={0.7}
          transform={`translate(${curve.to.x} ${curve.to.y}) rotate(${angle})`}
        />
      ) : null}
    </>
  );
};
