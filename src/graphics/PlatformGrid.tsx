import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

type Platform = {
  readonly label: string;
  /** One entry per line, so a long list cannot wrap mid-separator. */
  readonly targets: readonly string[];
  readonly kind: "desktop" | "phone" | "browser";
};

/**
 * Where Claude runs. Taken from the download page, so the list matches what a
 * viewer will actually find there.
 */
const PLATFORMS: readonly Platform[] = [
  { label: "דפדפן", targets: ["claude.ai"], kind: "browser" },
  { label: "מחשב", targets: ["macOS", "Windows", "Linux"], kind: "desktop" },
  { label: "נייד", targets: ["iOS", "Android"], kind: "phone" },
];

/** Device outlines, drawn so they share one stroke weight and corner style. */
const Device: React.FC<{
  readonly kind: Platform["kind"];
  readonly size: number;
}> = ({ kind, size }) => {
  const stroke = {
    fill: "none",
    stroke: COLORS.accent,
    strokeWidth: 2,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {kind === "desktop" ? (
        <>
          <rect x="4" y="8" width="40" height="27" rx="3" {...stroke} />
          <path d="M18 41h12M24 35v6" {...stroke} />
        </>
      ) : null}
      {kind === "phone" ? (
        <>
          <rect x="15" y="5" width="18" height="38" rx="4" {...stroke} />
          <path d="M21 39h6" {...stroke} />
        </>
      ) : null}
      {kind === "browser" ? (
        <>
          <rect x="4" y="9" width="40" height="30" rx="3" {...stroke} />
          <path d="M4 18h40" {...stroke} />
          <circle cx="10" cy="13.5" r="1.4" fill={COLORS.accent} />
          <circle cx="15" cy="13.5" r="1.4" fill={COLORS.accent} />
        </>
      ) : null}
    </svg>
  );
};

type PlatformGridProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * The same account reaching three kinds of device.
 *
 * The connecting line is the point: it is one account and one set of
 * conversations, not three separate installations, which is what the narration
 * is describing.
 */
export const PlatformGrid: React.FC<PlatformGridProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const cardW = width * 0.29;
  const cardH = height * 0.56;
  const railY = height * 0.16;

  const rail = interpolate(local, [4, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* One account, drawn as a rail the three devices hang from. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        <path
          d={`M ${width * 0.86} ${railY} L ${width * 0.14} ${railY}`}
          pathLength={1}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={2.5}
          strokeDasharray={1}
          strokeDashoffset={1 - rail}
          strokeOpacity={0.6}
        />
        {PLATFORMS.map((_, i) => {
          const x = width * (0.855 - i * 0.355);
          const drop = interpolate(local - 18 - i * 6, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <path
              key={i}
              d={`M ${x} ${railY} L ${x} ${railY + height * 0.11}`}
              pathLength={1}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={2}
              strokeDasharray={1}
              strokeDashoffset={1 - drop}
              strokeOpacity={0.6}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          top: railY - height * 0.11,
          right: 0,
          left: 0,
          textAlign: "center",
          fontFamily,
          fontSize: height * 0.075,
          fontWeight: 700,
          color: COLORS.accent,
          opacity: rail,
        }}
      >
        חשבון אחד
      </div>

      {PLATFORMS.map((platform, i) => {
        const pop = spring({
          frame: local - 24 - i * 7,
          fps,
          config: { damping: 15, stiffness: 150 },
        });

        return (
          <div
            key={platform.label}
            style={{
              position: "absolute",
              top: railY + height * 0.11,
              // `left`, not `right`: the rail above is drawn in SVG
              // left-origin coordinates, and CSS `right` inside an RTL
              // container mirrors against it — which reverses the card order.
              left: width * (0.855 - i * 0.355) - cardW / 2,
              width: cardW,
              height: cardH,
              borderRadius: 22,
              backgroundColor: COLORS.surface,
              border: "1px solid rgba(255,255,255,0.09)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: cardH * 0.09,
              opacity: pop,
              transform: `scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
            }}
          >
            <Device kind={platform.kind} size={cardW * 0.32} />
            <div
              style={{
                fontFamily,
                fontSize: cardH * 0.15,
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              {platform.label}
            </div>
            <div
              style={{
                fontFamily,
                fontSize: cardH * 0.1,
                fontWeight: 400,
                lineHeight: 1.4,
                color: COLORS.textMuted,
                textAlign: "center",
                direction: "ltr",
              }}
            >
              {platform.targets.map((target) => (
                <div key={target}>{target}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
