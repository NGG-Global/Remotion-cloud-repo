import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type Destination = {
  readonly label: string;
  readonly icon: IconName;
};

type SkillPackageProps = {
  readonly width: number;
  readonly height: number;
  /** The procedure, in the wording the previous scene left it in. */
  readonly steps: readonly string[];
  /** What the packaged procedure is called. */
  readonly skillName: string;
  /** Frame at which the loose steps fold into one named package. */
  readonly foldAt: number;
  /**
   * Frame at which the package turns up everywhere else. Omit to end on the
   * package itself.
   */
  readonly spreadAt?: number;
  /** Where it turns up: other conversations, other projects. */
  readonly destinations?: readonly Destination[];
};

/**
 * A procedure defined once, and then present everywhere.
 *
 * This is the episode's whole proposition, and it is two motions rather than
 * one: the loose steps close into a named package, and the package then
 * appears in places nobody put it. Splitting those across a cut would make
 * them two claims; kept in one take, the second is visibly a consequence of
 * the first. The steps arrive in the wording the opening left them in, so the
 * package is recognisably the thing that was being re-explained.
 */
export const SkillPackage: React.FC<SkillPackageProps> = ({
  width,
  height,
  steps,
  skillName,
  foldAt,
  spreadAt,
  destinations = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fold = spring({
    frame: frame - foldAt,
    fps,
    config: { damping: 32, stiffness: 95 },
  });
  const spread =
    spreadAt === undefined
      ? 0
      : spring({
          frame: frame - spreadAt,
          fps,
          config: { damping: 30, stiffness: 85 },
        });

  const cardW = Math.min(width * 0.42, height * 0.86);
  const cardH = height * (destinations.length ? 0.52 : 0.78);
  const cardLeft = (width - cardW) / 2;
  const cardTop = height * 0.04;

  const headH = cardH * 0.22;
  const stepH = (cardH - headH - cardH * 0.12) / steps.length;

  /** Loose, the steps sit spread down the frame; folded, they sit in the card. */
  const stepBox = (i: number) => {
    const looseW = Math.min(width * 0.66, cardW * 1.75);
    const from = {
      x: (width - looseW) / 2,
      y: height * 0.1 + i * (height * 0.16),
      w: looseW,
      h: height * 0.115,
    };
    const to = {
      x: cardLeft + cardW * 0.08,
      y: cardTop + headH + i * stepH,
      w: cardW * 0.84,
      h: stepH * 0.86,
    };
    return {
      x: interpolate(fold, [0, 1], [from.x, to.x]),
      y: interpolate(fold, [0, 1], [from.y, to.y]),
      w: interpolate(fold, [0, 1], [from.w, to.w]),
      h: interpolate(fold, [0, 1], [from.h, to.h]),
      size: interpolate(fold, [0, 1], [height * 0.042, stepH * 0.3]),
    };
  };

  const destW = Math.min(width * 0.2, 340);
  const destGap = width * 0.025;
  const destSpan =
    destW * destinations.length + destGap * (destinations.length - 1);
  const destTop = cardTop + cardH + height * 0.11;
  const destLeft = (i: number) =>
    (width - destSpan) / 2 + destSpan - (i + 1) * destW - i * destGap;

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The package travelling out to each destination. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {destinations.map((_, i) => {
          const t = interpolate(
            frame - (spreadAt ?? 0) - i * 6,
            [0, 24],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          if (t <= 0.01) {
            return null;
          }
          const x1 = width / 2;
          const y1 = cardTop + cardH;
          const x2 = destLeft(i) + destW / 2;
          const y2 = destTop;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${x1} ${y1 + (y2 - y1) * 0.6}, ${x2} ${y2 - (y2 - y1) * 0.6}, ${x2} ${y2}`}
                fill="none"
                stroke={COLORS.accent}
                strokeWidth={2.5}
                strokeOpacity={0.4}
                strokeDasharray="1"
                pathLength={1}
                strokeDashoffset={1 - t}
              />
              {t < 1 ? (
                <circle
                  cx={interpolate(t, [0, 1], [x1, x2])}
                  cy={interpolate(t, [0, 1], [y1, y2])}
                  r={7}
                  fill={COLORS.accent}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* The package. It only exists once the steps start folding in. */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardW,
          height: cardH,
          borderRadius: 26,
          background: COLORS.surfaceRaised,
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `0 0 70px ${COLORS.accent}2e`,
          opacity: fold,
          transform: `scale(${interpolate(fold, [0, 1], [0.9, 1])})`,
        }}
      >
        <div
          style={{
            height: headH,
            display: "flex",
            alignItems: "center",
            gap: cardW * 0.05,
            padding: `0 ${cardW * 0.08}px`,
            boxSizing: "border-box",
          }}
        >
          <LineIcon
            name="repeat"
            size={headH * 0.46}
            color={COLORS.accent}
            delay={foldAt + 6}
          />
          <div
            style={{
              direction: "ltr",
              fontFamily,
              fontSize: headH * 0.3,
              fontWeight: 700,
              color: COLORS.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {skillName}
          </div>
        </div>
      </div>

      {/* The steps, over the package, travelling into it as it forms. */}
      {steps.map((step, i) => {
        const box = stepBox(i);
        return (
          <div
            key={step}
            style={{
              position: "absolute",
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              borderRadius: interpolate(fold, [0, 1], [16, 11]),
              background:
                interpolate(fold, [0, 1], [1, 0]) > 0.5
                  ? COLORS.surface
                  : "rgba(255,255,255,0.05)",
              border: `1px solid rgba(255,255,255,${interpolate(fold, [0, 1], [0.1, 0.16])})`,
              display: "flex",
              alignItems: "center",
              gap: box.w * 0.035,
              padding: `0 ${box.w * 0.045}px`,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: box.size * 1.15,
                height: box.size * 1.15,
                borderRadius: "50%",
                background: COLORS.accent,
                color: COLORS.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontSize: box.size * 0.66,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontFamily,
                fontSize: box.size,
                fontWeight: 500,
                lineHeight: 1.25,
                color: COLORS.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {step}
            </div>
          </div>
        );
      })}

      {/* Where it turns up without being installed. */}
      {destinations.map((dest, i) => {
        const on = spring({
          frame: frame - (spreadAt ?? 0) - 20 - i * 6,
          fps,
          config: { damping: 200 },
        });
        if (on <= 0.001) {
          return null;
        }
        const destH = height * 0.2;

        return (
          <div
            key={dest.label}
            style={{
              position: "absolute",
              left: destLeft(i),
              top: destTop,
              width: destW,
              height: destH,
              borderRadius: 20,
              background: COLORS.surface,
              border: `1px solid ${COLORS.accent}66`,
              boxShadow: `0 0 26px ${COLORS.accent}22`,
              opacity: on,
              transform: `translateY(${interpolate(on, [0, 1], [18, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: destH * 0.12,
            }}
          >
            <LineIcon
              name={dest.icon}
              size={destH * 0.28}
              color={COLORS.accentSoft}
              delay={(spreadAt ?? 0) + 24 + i * 6}
            />
            <div
              style={{
                fontFamily,
                fontSize: destH * 0.17,
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              {dest.label}
            </div>
          </div>
        );
      })}

      {/* Spread also brightens the package, so the eye knows where the copies
          are coming from. */}
      {spread > 0.02 ? (
        <div
          style={{
            position: "absolute",
            left: cardLeft,
            top: cardTop,
            width: cardW,
            height: cardH,
            borderRadius: 26,
            border: `2px solid ${COLORS.accent}`,
            boxShadow: `0 0 ${60 * spread}px ${COLORS.accent}55`,
            opacity: spread * 0.9,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};
