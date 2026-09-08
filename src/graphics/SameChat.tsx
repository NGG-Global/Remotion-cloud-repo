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

type SameChatProps = {
  readonly width: number;
  readonly height: number;
  /** The five things that looked like separate features. */
  readonly goals: readonly {
    readonly label: string;
    readonly icon: IconName;
  }[];
  /** Frame at which they collapse into one conversation. */
  readonly mergeAt: number;
  /** Frame at which they come back as goals rather than features. */
  readonly regoalAt: number;
};

/**
 * Five features collapsing into one conversation.
 *
 * The punchline needs the five to be believed as separate first, so they are
 * drawn as five cards of equal weight, laid out like a feature grid. The merge
 * is then a single continuous move: the same five cards travel into one panel
 * and come back out as labels on it.
 */
export const SameChat: React.FC<SameChatProps> = ({
  width,
  height,
  goals,
  mergeAt,
  regoalAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD = { width: width * 0.17, height: height * 0.34 };
  const gap = (width - goals.length * CARD.width) / (goals.length + 1);
  const cardTop = height * 0.08;

  const cx = width / 2;
  const cy = height * 0.52;

  const merge = interpolate(frame, [mergeAt, mergeAt + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const panel = spring({
    frame: frame - (mergeAt + 12),
    fps,
    config: { damping: 60, stiffness: 130 },
  });
  const regoal = interpolate(frame, [regoalAt, regoalAt + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const PANEL = { width: width * 0.32, height: height * 0.46 };

  return (
    <div style={{ position: "relative", width, height }}>
      {/* The one conversation they were all along. */}
      {panel > 0.02 ? (
        <div
          style={{
            position: "absolute",
            left: cx - PANEL.width / 2,
            top: cy - PANEL.height / 2,
            width: PANEL.width,
            height: PANEL.height,
            borderRadius: 22,
            background: COLORS.backgroundDeep,
            border: `2px solid ${COLORS.accent}`,
            direction: "rtl",
            padding: "22px 26px",
            boxSizing: "border-box",
            opacity: panel,
            transform: `scale(${0.86 + panel * 0.14})`,
            boxShadow: `0 0 ${70 * panel}px rgba(217,119,87,0.32)`,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 44,
              fontWeight: 800,
              color: COLORS.accent,
              marginBottom: 20,
            }}
          >
            אותה שיחה
          </div>
          {[0.92, 0.7, 0.86, 0.62].map((w, i) => (
            <div
              key={i}
              style={{
                height: 14,
                width: `${w * 100}%`,
                marginBottom: 16,
                borderRadius: 7,
                background: COLORS.text,
                opacity: 0.32 * panel,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* The cards. Laid out as a feature grid, then pulled into the panel. */}
      {goals.map((goal, i) => {
        const show = interpolate(frame - (4 + i * 9), [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (show <= 0) {
          return null;
        }
        // In an RTL frame the first goal named belongs on the right.
        const homeLeft = width - gap - (i + 1) * CARD.width - i * gap;
        const left = interpolate(
          merge,
          [0, 1],
          [homeLeft, cx - CARD.width / 2],
        );
        const top = interpolate(merge, [0, 1], [cardTop, cy - CARD.height / 2]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top,
              width: CARD.width,
              height: CARD.height,
              borderRadius: 16,
              background: COLORS.surface,
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              direction: "rtl",
              padding: 16,
              boxSizing: "border-box",
              opacity: show * (1 - merge),
              transform: `scale(${(0.9 + show * 0.1) * (1 - merge * 0.35)})`,
            }}
          >
            <LineIcon
              name={goal.icon}
              size={54}
              delay={4 + i * 9}
              drawFrames={20}
              color={COLORS.accentSoft}
            />
            <span
              style={{
                fontFamily,
                fontSize: 26,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.25,
                color: COLORS.text,
              }}
            >
              {goal.label}
            </span>
          </div>
        );
      })}

      {/* Same five, now as goals set on one conversation. */}
      {regoal > 0
        ? goals.map((goal, i) => {
            const angle =
              (-90 + (i - (goals.length - 1) / 2) * 34) * (Math.PI / 180);
            const radius = Math.min(width * 0.31, height * 0.62);
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius * 0.62;
            const show = interpolate(
              frame - (regoalAt + i * 7),
              [0, 16],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            if (show <= 0) {
              return null;
            }
            return (
              <div
                key={`g${i}`}
                style={{
                  position: "absolute",
                  left: x - width * 0.075,
                  top: y - 26,
                  width: width * 0.15,
                  textAlign: "center",
                  direction: "rtl",
                  fontFamily,
                  fontSize: 25,
                  fontWeight: 700,
                  color: COLORS.ink,
                  background: COLORS.accentSoft,
                  padding: "8px 6px",
                  borderRadius: 999,
                  opacity: show,
                  transform: `scale(${0.86 + show * 0.14})`,
                }}
              >
                {goal.label}
              </div>
            );
          })
        : null}

      {regoal > 0.4 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            textAlign: "center",
            direction: "rtl",
            fontFamily,
            fontSize: 38,
            fontWeight: 800,
            color: COLORS.text,
            opacity: interpolate(regoal, [0.4, 0.9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          מטרה אחרת בכל פעם
        </div>
      ) : null}
    </div>
  );
};
