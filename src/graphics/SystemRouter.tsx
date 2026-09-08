import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

type System = {
  readonly label: string;
  readonly icon: IconName;
};

/** The systems the connector reaches, in the order the narration names them. */
const SYSTEMS: readonly System[] = [
  { label: "Outlook", icon: "mail" },
  { label: "SharePoint", icon: "files" },
  { label: "Teams", icon: "meeting" },
];

type SystemRouterProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  /** Which system the request is routed to. */
  readonly target?: number;
  readonly request?: string;
};

/**
 * One request, routed to whichever system holds the answer.
 *
 * This is the episode's central claim — that you ask for the result instead of
 * going to find the information. Drawing the request once and lighting only the
 * path it takes shows the routing happening, which a list of three system names
 * cannot.
 */
export const SystemRouter: React.FC<SystemRouterProps> = ({
  width,
  height,
  delay = 0,
  target = 1,
  request = "מצא את מסמך התכנון האחרון וסכם את עיקרי הדברים",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const askIn = spring({ frame: local, fps, config: { damping: 200 } });

  const askY = height * 0.15;
  const rowTop = height * 0.52;
  const tileH = height * 0.19;
  const tileW = width * 0.27;

  // Right to left: the first system sits rightmost.
  const tileX = (i: number) => width * (0.855 - i * 0.355) - tileW / 2;
  const tileCentre = (i: number) => width * (0.855 - i * 0.355);

  const route = interpolate(local - 26, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The request. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          opacity: askIn,
          transform: `translateY(${interpolate(askIn, [0, 1], [-14, 0])}px)`,
        }}
      >
        <div
          style={{
            maxWidth: "92%",
            fontFamily,
            fontSize: height * 0.07,
            fontWeight: 600,
            lineHeight: 1.3,
            color: COLORS.ink,
            backgroundColor: COLORS.labelBg,
            borderRadius: height * 0.06,
            padding: `${height * 0.035}px ${height * 0.055}px`,
            textAlign: "center",
          }}
        >
          {request}
        </div>
      </div>

      {/* Only the path the request actually takes is drawn. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        <path
          d={`M ${width / 2} ${askY + height * 0.06} C ${width / 2} ${rowTop * 0.9}, ${tileCentre(target)} ${rowTop * 0.9}, ${tileCentre(target)} ${rowTop}`}
          pathLength={1}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={3}
          strokeDasharray={1}
          strokeDashoffset={1 - route}
        />
      </svg>

      {SYSTEMS.map((system, i) => {
        const pop = spring({
          frame: local - 8 - i * 6,
          fps,
          config: { damping: 200 },
        });
        const chosen = i === target;
        const lit = chosen ? route : 0;

        return (
          <div
            key={system.label}
            style={{
              position: "absolute",
              top: rowTop,
              left: tileX(i),
              width: tileW,
              height: tileH,
              borderRadius: 18,
              backgroundColor: COLORS.surface,
              border: `1.5px solid ${
                lit > 0.5 ? COLORS.accent : "rgba(255,255,255,0.09)"
              }`,
              boxShadow: lit > 0.5 ? `0 0 26px ${COLORS.accent}3d` : undefined,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: tileH * 0.12,
              opacity: pop * (chosen ? 1 : 0.5),
            }}
          >
            <LineIcon
              name={system.icon}
              size={tileH * 0.34}
              delay={delay + 10 + i * 6}
              color={lit > 0.5 ? COLORS.accent : COLORS.textMuted}
              idle={false}
            />
            <div
              style={{
                fontFamily,
                fontSize: tileH * 0.22,
                fontWeight: 700,
                color: lit > 0.5 ? COLORS.text : COLORS.textMuted,
                direction: "ltr",
              }}
            >
              {system.label}
            </div>
          </div>
        );
      })}

      {/* What the viewer did not have to do. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.058,
          fontWeight: 500,
          color: COLORS.textMuted,
          opacity: interpolate(local, [56, 72], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        בלי לפתוח תיקיות ובלי להעלות קבצים
      </div>
    </div>
  );
};
