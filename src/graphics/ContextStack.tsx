import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type ContextLayer = {
  readonly label: string;
  readonly icon: IconName;
  /** Frame at which this layer is named. */
  readonly at: number;
};

type ContextStackProps = {
  readonly width: number;
  readonly height: number;
  readonly layers: readonly ContextLayer[];
  /** Frame at which the new, empty conversation appears beside it. */
  readonly newChatAt: number;
  /** Frame at which the cost of rebuilding is named. */
  readonly rebuildAt: number;
};

/**
 * What a conversation is holding, and what a new one is not.
 *
 * The layers stack physically, one settling onto the last, because the point
 * is accumulation. The empty column beside them is drawn to the same
 * dimensions with the same slots, so the difference between the two is only
 * ever the contents — which is exactly the difference being described.
 */
export const ContextStack: React.FC<ContextStackProps> = ({
  width,
  height,
  layers,
  newChatAt,
  rebuildAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COL = { width: Math.min(560, width * 0.32), height: height * 0.86 };
  const colTop = (height - COL.height) / 2;
  // The live conversation sits right, where the eye starts; the new, empty one
  // arrives to its left.
  const liveLeft = width * 0.56;
  const emptyLeft = width * 0.08;

  /** Room kept clear at the top of a column for its title and subtitle. */
  const HEADER = 150;
  const slotHeight = (COL.height - HEADER) / layers.length;

  const arrive = interpolate(frame, [newChatAt, newChatAt + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rebuild = interpolate(frame, [rebuildAt, rebuildAt + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height }}>
      <Column
        left={liveLeft}
        top={colTop}
        size={COL}
        title="אותה שיחה"
        subtitle="הכול כבר בפנים"
        accent
        opacity={interpolate(frame, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />

      {layers.map((layer, i) => {
        // Layers settle downward onto the stack, so the column fills from the
        // bottom the way a pile does.
        const drop = spring({
          frame: frame - layer.at,
          fps,
          config: { damping: 46, stiffness: 150, mass: 0.8 },
        });
        if (frame < layer.at - 2) {
          return null;
        }
        const top =
          colTop + COL.height - 30 - (i + 1) * slotHeight + (1 - drop) * -70;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: liveLeft + 22,
              top,
              width: COL.width - 44,
              height: slotHeight - 12,
              borderRadius: 12,
              background: COLORS.surfaceRaised,
              border: `1px solid rgba(217,119,87,0.35)`,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: "0 20px",
              boxSizing: "border-box",
              direction: "rtl",
              opacity: Math.min(1, drop * 1.4),
            }}
          >
            <LineIcon
              name={layer.icon}
              size={38}
              delay={layer.at}
              drawFrames={16}
              color={COLORS.accent}
            />
            <span
              style={{
                fontFamily,
                fontSize: 32,
                fontWeight: 700,
                color: COLORS.text,
                whiteSpace: "nowrap",
              }}
            >
              {layer.label}
            </span>
          </div>
        );
      })}

      {/* The new conversation: same slots, nothing in them. */}
      {arrive > 0 ? (
        <>
          <Column
            left={emptyLeft}
            top={colTop}
            size={COL}
            title="צ'אט חדש"
            subtitle="מתחילים מאפס"
            opacity={arrive}
            warn
          />
          {layers.map((layer, i) => {
            const top = colTop + COL.height - 30 - (i + 1) * slotHeight;
            const show = interpolate(
              frame - (newChatAt + 14 + i * 6),
              [0, 14],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            if (show <= 0) {
              return null;
            }
            return (
              <div
                key={`e${i}`}
                style={{
                  position: "absolute",
                  left: emptyLeft + 22,
                  top,
                  width: COL.width - 44,
                  height: slotHeight - 12,
                  borderRadius: 12,
                  border: `2px dashed rgba(224,163,74,${0.34 + rebuild * 0.3})`,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 20px",
                  boxSizing: "border-box",
                  direction: "rtl",
                  opacity: show,
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontSize: 30,
                    fontWeight: 700,
                    color: COLORS.warn,
                    opacity: 0.5 + rebuild * 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {rebuild > 0.5 ? `${layer.label} — מחדש` : layer.label}
                </span>
              </div>
            );
          })}

          {rebuild > 0 ? (
            <div
              style={{
                position: "absolute",
                left: emptyLeft,
                top: colTop + COL.height + 20,
                width: COL.width,
                textAlign: "center",
                direction: "rtl",
                fontFamily,
                fontSize: 34,
                fontWeight: 800,
                color: COLORS.warn,
                opacity: rebuild,
              }}
            >
              לבנות את הכול שוב
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

const Column: React.FC<{
  readonly left: number;
  readonly top: number;
  readonly size: { width: number; height: number };
  readonly title: string;
  readonly subtitle: string;
  readonly opacity: number;
  readonly accent?: boolean;
  readonly warn?: boolean;
}> = ({ left, top, size, title, subtitle, opacity, accent, warn }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: size.width,
      height: size.height,
      borderRadius: 22,
      background: COLORS.backgroundDeep,
      border: `1px solid ${
        accent ? "rgba(217,119,87,0.3)" : "rgba(224,163,74,0.26)"
      }`,
      direction: "rtl",
      padding: "22px 24px",
      boxSizing: "border-box",
      opacity,
    }}
  >
    <div
      style={{
        fontFamily,
        fontSize: 32,
        fontWeight: 800,
        color: accent ? COLORS.accent : warn ? COLORS.warn : COLORS.text,
      }}
    >
      {title}
    </div>
    <div
      style={{
        marginTop: 4,
        fontFamily,
        fontSize: 24,
        fontWeight: 600,
        color: COLORS.textMuted,
      }}
    >
      {subtitle}
    </div>
  </div>
);
