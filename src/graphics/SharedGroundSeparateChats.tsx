import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type GroundChatColumn = {
  /** What this conversation is for. */
  readonly label: string;
  readonly icon: IconName;
  readonly at: number;
};

type SharedGroundSeparateChatsProps = {
  readonly width: number;
  readonly height: number;
  /** The conversations, right to left in the order given. */
  readonly columns: readonly GroundChatColumn[];
  /** What the base slab holds, named on it. */
  readonly groundLabel: string;
  /** Frame at which the base feeds every conversation. */
  readonly shareAt: number;
  /**
   * Frame at which the conversations are shown not to feed each other. Omit
   * to leave the picture at the sharing stage.
   */
  readonly isolateAt?: number;
  /** Label for the crossed-out link between two conversations. */
  readonly isolateLabel?: string;
};

/**
 * One shared base, and conversations that stay separate above it.
 *
 * This is the distinction the narration says people get wrong, and it is a
 * distinction about direction: material flows up from the project into every
 * conversation, and nothing flows sideways between them. Stated in words that
 * is two clauses a viewer has to hold at once; drawn, it is one picture where
 * the vertical arrows run and the horizontal one is struck out. The parallel
 * labels on the columns are the second half of the same argument — separate is
 * what lets three of these run at once without mixing.
 */
export const SharedGroundSeparateChats: React.FC<
  SharedGroundSeparateChatsProps
> = ({
  width,
  height,
  columns,
  groundLabel,
  shareAt,
  isolateAt,
  isolateLabel = "לא עובר מעצמו",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const n = columns.length;
  const gap = width * 0.035;
  const colW = Math.min((width - gap * (n - 1)) / n, width * 0.3);
  const colH = height * 0.5;
  const colTop = height * 0.04;
  const span = colW * n + gap * (n - 1);
  const originLeft = (width - span) / 2;

  // Right to left: the first conversation named sits rightmost.
  const colLeft = (i: number) => originLeft + span - (i + 1) * colW - i * gap;

  const groundW = span;
  const groundH = height * 0.2;
  const groundTop = height * 0.74;

  const feed = (i: number) =>
    interpolate(frame - shareAt - i * 5, [0, 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const groundIn = spring({
    frame: frame - (shareAt - 14),
    fps,
    config: { damping: 200 },
  });

  const cross = isolateAt
    ? interpolate(frame - isolateAt - 12, [0, 14], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const link = isolateAt
    ? interpolate(frame - isolateAt, [0, 14], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // The link that does not exist runs between the two rightmost columns. It
  // reaches into both cards rather than living in the gap between them: sixty
  // pixels of dashed line behind a cross reads as a smudge, not as a route.
  const linkY = colTop + colH * 0.58;
  const linkFrom = colLeft(0) + colW * 0.34;
  const linkTo = colLeft(1) + colW * 0.66;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        <defs>
          <marker
            id="ground-head"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill={COLORS.accent} />
          </marker>
        </defs>

        {/* Up from the base into every conversation. */}
        {columns.map((_, i) => {
          const t = feed(i);
          if (t <= 0.01) {
            return null;
          }
          const x = colLeft(i) + colW / 2;
          const y1 = groundTop;
          const y2 = colTop + colH + 14;
          return (
            <g key={i}>
              <path
                d={`M ${x} ${y1} L ${x} ${y2}`}
                stroke={COLORS.accent}
                strokeWidth={3}
                strokeOpacity={0.55}
                fill="none"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - t}
                markerEnd={t > 0.92 ? "url(#ground-head)" : undefined}
              />
              {/* A parcel riding the line, so the direction is unmistakable. */}
              {t > 0.2 && t < 1 ? (
                <circle
                  cx={x}
                  cy={interpolate(t, [0.2, 1], [y1, y2])}
                  r={7}
                  fill={COLORS.accent}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* The conversations. */}
      {columns.map((column, i) => {
        const open = spring({
          frame: frame - column.at,
          fps,
          config: { damping: 200 },
        });
        if (open <= 0.001) {
          return null;
        }
        const filled = feed(i);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: colLeft(i),
              top: colTop,
              width: colW,
              height: colH,
              borderRadius: 24,
              background: COLORS.surface,
              border: `1px solid rgba(255,255,255,${0.08 + filled * 0.12})`,
              boxShadow:
                filled > 0.9 ? `0 0 34px ${COLORS.accent}22` : undefined,
              opacity: open,
              transform: `translateY(${interpolate(open, [0, 1], [26, 0])}px)`,
              padding: `${colH * 0.09}px ${colW * 0.08}px`,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: colH * 0.08,
              direction: "rtl",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: colW * 0.05,
              }}
            >
              <LineIcon
                name={column.icon}
                size={colH * 0.15}
                color={COLORS.accent}
                delay={column.at + 4}
              />
              <div
                style={{
                  fontFamily,
                  fontSize: colH * 0.105,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: COLORS.text,
                }}
              >
                {column.label}
              </div>
            </div>

            {/* Whatever is said in here. Bars: the content is not the point,
                the fact that it stays in here is. */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: colH * 0.055,
                marginTop: colH * 0.02,
              }}
            >
              {[0.86, 0.64, 0.78].map((w, b) => (
                <div
                  key={b}
                  style={{
                    width: `${w * 100}%`,
                    height: colH * 0.05,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    opacity: interpolate(
                      frame - column.at - 12 - b * 6,
                      [0, 12],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    ),
                  }}
                />
              ))}
            </div>

            {/* What the base put here, once the line has landed. */}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                gap: colW * 0.04,
                padding: `${colH * 0.04}px ${colW * 0.05}px`,
                borderRadius: 14,
                background: `${COLORS.accent}1c`,
                border: `1px solid ${COLORS.accent}55`,
                opacity: filled,
                transform: `translateY(${interpolate(filled, [0, 1], [10, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: colH * 0.04,
                  height: colH * 0.04,
                  borderRadius: "50%",
                  background: COLORS.accent,
                }}
              />
              <div
                style={{
                  fontFamily,
                  fontSize: colH * 0.072,
                  fontWeight: 600,
                  color: COLORS.accentSoft,
                }}
              >
                {groundLabel}
              </div>
            </div>
          </div>
        );
      })}

      {/* The base. */}
      <div
        style={{
          position: "absolute",
          left: originLeft,
          top: groundTop,
          width: groundW,
          height: groundH,
          borderRadius: 24,
          background: COLORS.surfaceRaised,
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `0 0 70px ${COLORS.accent}2e`,
          opacity: groundIn,
          transform: `scale(${interpolate(groundIn, [0, 1], [0.93, 1])})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: groundH * 0.26,
          direction: "rtl",
        }}
      >
        <LineIcon
          name="files"
          size={groundH * 0.46}
          color={COLORS.accent}
          delay={shareAt - 8}
        />
        <div
          style={{
            fontFamily,
            fontSize: groundH * 0.3,
            fontWeight: 800,
            color: COLORS.text,
          }}
        >
          {groundLabel}
        </div>
      </div>

      {/* The route that does not exist, drawn over the conversations rather
          than behind them — it is a claim about them, not scenery. */}
      {link > 0.01 ? (
        <svg
          style={{ position: "absolute", inset: 0 }}
          width={width}
          height={height}
          aria-hidden
        >
          <path
            d={`M ${linkFrom} ${linkY} L ${linkTo} ${linkY}`}
            stroke={COLORS.warn}
            strokeWidth={4}
            strokeOpacity={0.55}
            strokeDasharray="10 10"
            fill="none"
            opacity={link}
          />
          {cross > 0 ? (
            <g
              opacity={cross}
              transform={`translate(${(linkFrom + linkTo) / 2}, ${linkY})`}
            >
              <circle
                r={height * 0.055}
                fill={COLORS.backgroundDeep}
                stroke={COLORS.warn}
                strokeWidth={3}
              />
              <path
                d={`M ${-height * 0.024} ${-height * 0.024} L ${height * 0.024} ${height * 0.024} M ${height * 0.024} ${-height * 0.024} L ${-height * 0.024} ${height * 0.024}`}
                stroke={COLORS.warn}
                strokeWidth={5}
                strokeLinecap="round"
              />
            </g>
          ) : null}
        </svg>
      ) : null}

      {/* The label on the link that is not there. */}
      {cross > 0.2 ? (
        <div
          style={{
            position: "absolute",
            left: (linkFrom + linkTo) / 2,
            // In the band below the cards and above the base: the only strip
            // of the frame that neither the cards nor the feed arrows use.
            top: colTop + colH + height * 0.045,
            transform: "translateX(-50%)",
            direction: "rtl",
            whiteSpace: "nowrap",
            padding: `${height * 0.014}px ${height * 0.028}px`,
            borderRadius: 999,
            background: COLORS.backgroundDeep,
            border: `1.5px solid ${COLORS.warn}66`,
            fontFamily,
            fontSize: height * 0.042,
            fontWeight: 700,
            color: COLORS.warn,
            opacity: cross,
          }}
        >
          {isolateLabel}
        </div>
      ) : null}
    </div>
  );
};
