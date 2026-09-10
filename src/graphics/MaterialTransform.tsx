import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type Transformation = {
  /** What you already have. */
  readonly from: { readonly label: string; readonly icon: IconName };
  /** What it becomes. */
  readonly to: { readonly label: string; readonly icon: IconName };
  /** Frame at which this pair takes the stage. */
  readonly at: number;
};

type MaterialTransformProps = {
  readonly width: number;
  readonly height: number;
  readonly pairs: readonly Transformation[];
  /** Frame at which the blank page is ruled out. */
  readonly blankAt: number;
  readonly blankLabel?: string;
};

/**
 * Material you already have, becoming something else.
 *
 * Each pair is one card crossing the frame and changing on the way, rather
 * than two cards with an arrow between them: the claim is that the second
 * thing is made *out of* the first, and a card that survives the journey says
 * that where two separate cards would not.
 */
export const MaterialTransform: React.FC<MaterialTransformProps> = ({
  width,
  height,
  pairs,
  blankAt,
  blankLabel = "אף פעם לא מעמוד ריק",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD = { width: Math.min(430, width * 0.25), height: height * 0.36 };
  const rightX = width * 0.72 - CARD.width / 2;
  const leftX = width * 0.28 - CARD.width / 2;
  const cardTop = height * 0.2;

  const ease = Easing.bezier(0.4, 0, 0.2, 1);
  const CROSS = 34;

  // The pair on stage, and how far it has crossed.
  let index = -1;
  for (let i = 0; i < pairs.length; i++) {
    if (frame >= pairs[i].at) {
      index = i;
    }
  }
  const pair = index >= 0 ? pairs[index] : undefined;
  const next = index >= 0 ? pairs[index + 1] : pairs[0];

  const SWAP = 16;
  const held = pair
    ? interpolate(frame - pair.at, [0, SWAP], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }) *
      (next
        ? 1 -
          interpolate(frame - (next.at - SWAP), [0, SWAP], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : 1)
    : 0;

  // Crossing begins once the source has been read, not on arrival.
  const cross = pair
    ? interpolate(frame, [pair.at + 26, pair.at + 26 + CROSS], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease,
      })
    : 0;

  const blank = spring({
    frame: frame - blankAt,
    fps,
    config: { damping: 60, stiffness: 150 },
  });
  const struck = interpolate(frame - (blankAt + 20), [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Where it starts and where it lands, kept as outlines so the moving
          card has somewhere to come from and go to. */}
      {pair ? (
        <>
          <Slot
            left={rightX}
            top={cardTop}
            size={CARD}
            label={pair.from.label}
            icon={pair.from.icon}
            opacity={held * (1 - cross * 0.75)}
            iconAt={pair.at}
          />
          <Slot
            left={leftX}
            top={cardTop}
            size={CARD}
            label={pair.to.label}
            icon={pair.to.icon}
            opacity={held * cross}
            accent
            iconAt={pair.at + 26}
          />

          {/* The card in transit. One object, changing as it travels. */}
          {cross > 0.02 && cross < 0.98 ? (
            <div
              style={{
                position: "absolute",
                left: interpolate(cross, [0, 1], [rightX, leftX]),
                top: cardTop - Math.sin(cross * Math.PI) * 26,
                width: CARD.width,
                height: CARD.height,
                borderRadius: 16,
                background: "#faf9f5",
                opacity: held,
                transform: `scale(${1 - Math.sin(cross * Math.PI) * 0.08}) rotate(${(cross - 0.5) * 5}deg)`,
                boxShadow: "0 20px 44px rgba(0,0,0,0.4)",
                overflow: "hidden",
              }}
            >
              {/* Content reflows across the journey: paragraphs on one side,
                  slide blocks on the other. */}
              {[0, 1, 2, 3].map((r) => (
                <div
                  key={r}
                  style={{
                    position: "absolute",
                    right: interpolate(cross, [0, 1], [24, 20]),
                    top: interpolate(
                      cross,
                      [0, 1],
                      [
                        CARD.height * (0.18 + r * 0.16),
                        CARD.height * (0.16 + r * 0.2),
                      ],
                    ),
                    width: interpolate(
                      cross,
                      [0, 1],
                      [
                        (CARD.width - 48) * [0.94, 0.88, 0.96, 0.7][r],
                        (CARD.width - 40) * [0.5, 0.78, 0.62, 0.4][r],
                      ],
                    ),
                    height: interpolate(cross, [0, 1], [9, 15]),
                    borderRadius: 6,
                    background:
                      interpolate(cross, [0, 1], [0, 1]) > 0.5
                        ? COLORS.accent
                        : "#cfc9bd",
                    opacity: interpolate(cross, [0, 1], [0.85, 0.95]),
                  }}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {/* The blank page nobody actually starts from. */}
      {frame >= blankAt - 2 ? (
        <div
          style={{
            position: "absolute",
            left: width / 2 - width * 0.09,
            top: height * 0.63,
            width: width * 0.18,
            height: height * 0.3,
            borderRadius: 12,
            background: "#f2f0ea",
            opacity: blank * (1 - struck * 0.55),
            transform: `translateY(${(1 - blank) * 26}px) rotate(${struck * -4}deg)`,
            boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
          }}
        >
          {struck > 0 ? (
            <svg
              width={width * 0.18}
              height={height * 0.3}
              style={{ position: "absolute", inset: 0 }}
            >
              <line
                x1={12}
                y1={height * 0.3 - 12}
                x2={12 + (width * 0.18 - 24) * struck}
                y2={height * 0.3 - 12 - (height * 0.3 - 24) * struck}
                stroke={COLORS.warn}
                strokeWidth={8}
                strokeLinecap="round"
              />
            </svg>
          ) : null}
        </div>
      ) : null}

      {struck > 0.4 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 40,
            fontWeight: 800,
            color: COLORS.accent,
            opacity: interpolate(struck, [0.4, 0.9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {blankLabel}
        </div>
      ) : null}
    </div>
  );
};

const Slot: React.FC<{
  readonly left: number;
  readonly top: number;
  readonly size: { width: number; height: number };
  readonly label: string;
  readonly icon: IconName;
  readonly opacity: number;
  readonly iconAt: number;
  readonly accent?: boolean;
}> = ({ left, top, size, label, icon, opacity, iconAt, accent }) => {
  if (opacity <= 0.01) {
    return null;
  }
  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: size.width,
          height: size.height,
          borderRadius: 16,
          border: `2px dashed ${
            accent ? "rgba(217,119,87,0.55)" : "rgba(255,255,255,0.2)"
          }`,
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left,
          top: top + size.height + 20,
          width: size.width,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          direction: "rtl",
          opacity,
        }}
      >
        <LineIcon
          name={icon}
          size={36}
          delay={iconAt}
          drawFrames={16}
          color={accent ? COLORS.accent : COLORS.textMuted}
        />
        <span
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 700,
            color: accent ? COLORS.accent : COLORS.textMuted,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
    </>
  );
};
