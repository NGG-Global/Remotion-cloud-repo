import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import type { Region } from "./regions";
import { useProjection } from "./UIShowcase";

export type CalloutSide = "left" | "right" | "top" | "bottom";

type CalloutProps = {
  readonly region: Region;
  readonly label: string;
  /** Which way the label sits from the element. */
  readonly side?: CalloutSide;
  readonly delay?: number;
  /** Length of the connector, in window pixels. */
  readonly reach?: number;
  readonly fontSize?: number;
  readonly color?: string;
};

const DIRECTION: Record<CalloutSide, { dx: number; dy: number }> = {
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
  top: { dx: 0, dy: -1 },
  bottom: { dx: 0, dy: 1 },
};

/**
 * Sides to try, in order, for each requested side: the request, its opposite,
 * then the perpendicular pair.
 *
 * Trying only the opposite is not enough — a ring around a wide element leaves
 * room on neither the left nor the right, and the label was clipped by the
 * window's `overflow: hidden`.
 */
const FALLBACKS: Record<CalloutSide, readonly CalloutSide[]> = {
  left: ["left", "right", "top", "bottom"],
  right: ["right", "left", "top", "bottom"],
  top: ["top", "bottom", "right", "left"],
  bottom: ["bottom", "top", "right", "left"],
};

/** Rough width of the rendered pill, used only to keep it inside the window. */
const estimateWidth = (label: string, fontSize: number): number =>
  label.length * fontSize * 0.56 + fontSize * 1.24;

/**
 * Label tethered to an interface element by a connector that draws itself.
 *
 * The label flips to the opposite side when the requested side would push it
 * out of the window, so a callout near an edge stays readable instead of being
 * clipped by the window's `overflow: hidden`.
 */
export const Callout: React.FC<CalloutProps> = ({
  region,
  label,
  side = "right",
  delay = 0,
  reach = 150,
  fontSize = 30,
  color = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { project, windowWidth, windowHeight } = useProjection();

  const r = project(region);

  const pillWidth = estimateWidth(label, fontSize);
  const pillHeight = fontSize * 1.9;
  const margin = 18;

  const fits = (candidate: CalloutSide): boolean => {
    const { dx, dy } = DIRECTION[candidate];
    const ax = r.x + r.w / 2 + dx * (r.w / 2);
    const ay = r.y + r.h / 2 + dy * (r.h / 2);
    const ex = ax + dx * reach;
    const ey = ay + dy * reach;

    if (dx > 0) return ex + pillWidth + margin <= windowWidth;
    if (dx < 0) return ex - pillWidth - margin >= 0;
    if (dy > 0) return ey + pillHeight + margin <= windowHeight;
    return ey - pillHeight - margin >= 0;
  };

  const chosen: CalloutSide = FALLBACKS[side].find(fits) ?? side;
  /**
   * Whether any side had room. When a ring is nearly as large as the window
   * none does, and the label has to be clamped inside the frame instead of
   * being tethered outside the element.
   */
  const anySideFits = FALLBACKS[side].some(fits);

  const { dx, dy } = DIRECTION[chosen];

  const local = frame - delay;
  const progress = spring({ frame: local, fps, config: { damping: 200 } });

  // Start the connector at the element's edge so it never overlaps the thing
  // it points at.
  const startX = r.x + r.w / 2 + dx * (r.w / 2);
  const startY = r.y + r.h / 2 + dy * (r.h / 2);
  const endX = startX + dx * reach;
  const endY = startY + dy * reach;

  /**
   * Keep the pill inside the window even when no side had room. Without this
   * the label runs past the window's `overflow: hidden` and loses its last
   * words, which is worse than a connector that sits a little short.
   */
  const clampEnd = (): { x: number; y: number } => {
    if (anySideFits) {
      return { x: endX, y: endY };
    }
    const halfW = pillWidth / 2;
    const halfH = pillHeight / 2;
    return {
      x: Math.min(windowWidth - halfW - margin, Math.max(halfW + margin, endX)),
      y: Math.min(
        windowHeight - halfH - margin,
        Math.max(halfH + margin, endY),
      ),
    };
  };

  const clamped = clampEnd();
  const drawnX = startX + (clamped.x - startX) * progress;
  const drawnY = startY + (clamped.y - startY) * progress;

  const transform: Record<CalloutSide, string> = {
    left: "translate(-100%, -50%)",
    right: "translate(0, -50%)",
    top: "translate(-50%, -100%)",
    bottom: "translate(-50%, 0)",
  };

  const gap = 10;
  const nudge: Record<CalloutSide, React.CSSProperties> = {
    left: { marginLeft: -gap },
    right: { marginLeft: gap },
    top: { marginTop: -gap },
    bottom: { marginTop: gap },
  };

  return (
    <>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        aria-hidden
      >
        <line
          x1={startX}
          y1={startY}
          x2={drawnX}
          y2={drawnY}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={startX} cy={startY} r={6 * progress} fill={color} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: clamped.x,
          top: clamped.y,
          transform: anySideFits ? transform[chosen] : "translate(-50%, -50%)",
          ...(anySideFits ? nudge[chosen] : {}),
          opacity: interpolate(progress, [0.55, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            // `direction: rtl` keeps Hebrew punctuation and any embedded Latin
            // term in the right order inside the pill.
            direction: "rtl",
            whiteSpace: "nowrap",
            fontFamily,
            fontSize,
            fontWeight: 600,
            lineHeight: 1.3,
            color: COLORS.ink,
            backgroundColor: COLORS.labelBg,
            padding: `${fontSize * 0.3}px ${fontSize * 0.62}px`,
            borderRadius: fontSize * 0.44,
            boxShadow: `0 12px 32px -10px rgba(0,0,0,0.55), 0 0 0 2px ${color}`,
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
};
