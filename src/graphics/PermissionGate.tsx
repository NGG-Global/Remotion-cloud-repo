import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

type Source = {
  readonly label: string;
  readonly icon: IconName;
  /** Whether this viewer's own permissions cover it. */
  readonly allowed: boolean;
};

/**
 * The kinds of material a connector reaches, from the Microsoft 365 card's own
 * description. One is drawn as out of reach to make the point that the gate is
 * real rather than decorative.
 */
const SOURCES: readonly Source[] = [
  { label: "מיילים", icon: "mail", allowed: true },
  { label: "קבצים", icon: "files", allowed: true },
  { label: "פגישות", icon: "calendar", allowed: true },
  { label: "ללא הרשאה", icon: "lock", allowed: false },
];

type PermissionGateProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * Material travelling towards Claude through a permissions gate.
 *
 * Says the thing the narration keeps repeating in one picture: a connector
 * does not widen access, it reuses the access the viewer already has. The
 * blocked row stopping at the gate is what makes that legible — without it the
 * gate reads as a badge rather than a check.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const gateX = width * 0.46;
  const rowH = height * 0.17;
  const gap = height * 0.055;
  const tileW = width * 0.34;

  const gateIn = spring({ frame: local, fps, config: { damping: 200 } });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The gate. */}
      <div
        style={{
          position: "absolute",
          right: gateX,
          top: height * 0.04,
          width: 3,
          height: height * 0.82,
          backgroundColor: COLORS.accent,
          opacity: 0.55,
          transform: `scaleY(${gateIn})`,
          transformOrigin: "top",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: gateX - width * 0.115,
          top: height * 0.88,
          width: width * 0.23,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.062,
          fontWeight: 700,
          color: COLORS.accent,
          opacity: gateIn,
        }}
      >
        ההרשאות שלכם
      </div>

      {SOURCES.map((source, i) => {
        const enter = spring({
          frame: local - 10 - i * 8,
          fps,
          config: { damping: 200 },
        });

        // Allowed rows travel past the gate; the blocked one stops at it.
        const travel = interpolate(local - 26 - i * 8, [0, 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const reach = source.allowed ? travel : Math.min(travel, 0.42);
        const startRight = 0;
        const endRight = width * 0.6;
        const right = startRight + (endRight - startRight) * reach;

        const blocked = !source.allowed && travel > 0.42;
        const nudge = blocked ? Math.sin((local - 40) * 0.5) * 3 : 0;

        return (
          <div
            key={source.label}
            style={{
              position: "absolute",
              top: height * 0.06 + i * (rowH + gap),
              right,
              width: tileW,
              height: rowH,
              borderRadius: 16,
              backgroundColor: COLORS.surface,
              border: `1.5px solid ${
                blocked ? "rgba(255,255,255,0.16)" : `${COLORS.accent}66`
              }`,
              display: "flex",
              alignItems: "center",
              gap: rowH * 0.28,
              padding: `0 ${rowH * 0.32}px`,
              opacity: enter * (blocked ? 0.55 : 1),
              transform: `translateX(${nudge}px)`,
            }}
          >
            <LineIcon
              name={source.icon}
              size={rowH * 0.46}
              delay={delay + 12 + i * 8}
              color={blocked ? COLORS.textMuted : COLORS.accent}
              idle={false}
            />
            <div
              style={{
                fontFamily,
                fontSize: rowH * 0.32,
                fontWeight: 600,
                color: blocked ? COLORS.textMuted : COLORS.text,
              }}
            >
              {source.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
