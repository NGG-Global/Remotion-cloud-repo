import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

type Resource = {
  readonly label: string;
  readonly icon: IconName;
  /** Whether this viewer's own permissions cover it. */
  readonly allowed: boolean;
};

/**
 * Resources the narration names, with one of each kind out of reach.
 *
 * The blocked rows matter more than the allowed ones: they are what show the
 * two columns are identical, which is the claim being made.
 */
const RESOURCES: readonly Resource[] = [
  { label: "תיקייה שיש לכם גישה אליה", icon: "files", allowed: true },
  { label: "תיקייה שאין לכם גישה אליה", icon: "lock", allowed: false },
  { label: "ערוץ Teams שאתם חברים בו", icon: "meeting", allowed: true },
  { label: "ערוץ שאתם לא חברים בו", icon: "lock", allowed: false },
];

type PermissionMirrorProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * Your access and Claude's, side by side and identical.
 *
 * Says in one picture what the narration spends thirty seconds on: there is no
 * master key. Drawing both columns from the same list, with the same rows
 * locked in each, is the whole argument — a single column with a padlock would
 * only show that some things are locked, not that the rules are the same ones.
 */
export const PermissionMirror: React.FC<PermissionMirrorProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const colW = width * 0.45;
  const headerH = height * 0.13;
  const rowH = height * 0.155;
  const rowGap = height * 0.035;

  const column = (title: string, right: number, startAt: number) => (
    <div style={{ position: "absolute", top: 0, right, width: colW }}>
      <div
        style={{
          height: headerH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontSize: height * 0.068,
          fontWeight: 800,
          color: COLORS.text,
          opacity: interpolate(local - startAt, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
        {RESOURCES.map((resource, i) => {
          const pop = spring({
            frame: local - startAt - 6 - i * 6,
            fps,
            config: { damping: 200 },
          });

          return (
            <div
              key={resource.label}
              style={{
                height: rowH,
                display: "flex",
                alignItems: "center",
                gap: rowH * 0.22,
                padding: `0 ${rowH * 0.26}px`,
                borderRadius: 14,
                backgroundColor: resource.allowed
                  ? COLORS.surface
                  : "rgba(255,255,255,0.025)",
                border: `1.5px solid ${
                  resource.allowed
                    ? `${COLORS.accent}59`
                    : "rgba(255,255,255,0.09)"
                }`,
                opacity: pop * (resource.allowed ? 1 : 0.55),
              }}
            >
              <LineIcon
                name={resource.icon}
                size={rowH * 0.42}
                delay={delay + startAt + 8 + i * 6}
                color={resource.allowed ? COLORS.accent : COLORS.textMuted}
                idle={false}
              />
              <div
                style={{
                  fontFamily,
                  fontSize: rowH * 0.235,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  color: resource.allowed ? COLORS.text : COLORS.textMuted,
                }}
              >
                {resource.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // The second column is drawn from the same list, a beat later.
  const mirror = interpolate(local - 30, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {column("מה שאתם רואים", 0, 0)}
      {column("מה שקלוד רואה", width - colW, 30)}

      {/* The mirror line between them. */}
      <div
        style={{
          position: "absolute",
          right: colW + (width - colW * 2) / 2,
          top: headerH * 0.4,
          width: 2,
          height: height * 0.82,
          backgroundColor: COLORS.accent,
          opacity: 0.35 * mirror,
          transform: `scaleY(${mirror})`,
          transformOrigin: "top",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: colW,
          width: width - colW * 2,
          top: height * 0.44,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.09,
          fontWeight: 800,
          color: COLORS.accent,
          opacity: mirror,
        }}
      >
        =
      </div>
    </div>
  );
};
