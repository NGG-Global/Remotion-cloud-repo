import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { BezierFlow } from "./BezierFlow";
import { LineIcon, type IconName } from "./LineIcon";

export type Purpose = {
  /** Why you need it, in the words you would actually say. */
  readonly label: string;
  /** Frame at which this purpose is stated. */
  readonly at: number;
  /** What comes back, as a shape rather than as prose. */
  readonly output: {
    readonly title: string;
    readonly icon: IconName;
    /** Frame at which the output arrives. */
    readonly at: number;
    /** Row widths, so the two results look nothing like each other. */
    readonly rows: readonly number[];
  };
};

type PurposeSplitProps = {
  readonly width: number;
  readonly height: number;
  /** The file both lanes start from. */
  readonly file: { readonly name: string; readonly kind: string };
  readonly purposes: readonly Purpose[];
};

/**
 * One file, two reasons for opening it, two different answers.
 *
 * Laid out as two lanes running from a single source, so the file is visibly
 * the same file in both. The lanes run right to left with the language, which
 * also keeps them clear of each other in a way a vertical split would not at
 * this length.
 */
export const PurposeSplit: React.FC<PurposeSplitProps> = ({
  width,
  height,
  file,
  purposes,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const FILE = { width: Math.min(300, width * 0.17), height: height * 0.3 };
  const fileLeft = width - FILE.width - width * 0.03;
  const fileTop = (height - FILE.height) / 2;
  const sourceX = fileLeft;
  const sourceY = height / 2;

  const OUT = { width: width * 0.28, height: height * 0.36 };
  const outLeft = width * 0.05;
  const laneY = (i: number) => (i === 0 ? height * 0.26 : height * 0.74);

  const appear = spring({ frame, fps, config: { damping: 90 } });

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {purposes.map((purpose, i) => (
          <BezierFlow
            key={i}
            curve={{
              from: { x: sourceX - 8, y: sourceY },
              c1: { x: sourceX - 180, y: sourceY },
              c2: { x: outLeft + OUT.width + 180, y: laneY(i) },
              to: { x: outLeft + OUT.width + 8, y: laneY(i) },
            }}
            delay={purpose.output.at - 30}
            travel={28}
            stagger={7}
            count={4}
            until={purpose.output.at}
          />
        ))}
      </svg>

      {/* The file. One source, so the difference cannot be blamed on it. */}
      <div
        style={{
          position: "absolute",
          left: fileLeft,
          top: fileTop,
          width: FILE.width,
          height: FILE.height,
          borderRadius: 14,
          background: "#faf9f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          opacity: appear,
          transform: `scale(${0.94 + appear * 0.06})`,
          boxShadow: "0 16px 36px rgba(0,0,0,0.35)",
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 24,
            fontWeight: 800,
            color: "#ffffff",
            background: "#c0392b",
            padding: "6px 12px",
            borderRadius: 6,
            direction: "ltr",
          }}
        >
          {file.kind.toUpperCase()}
        </span>
        <span
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 700,
            color: "#3a332c",
            direction: "rtl",
            textAlign: "center",
            padding: "0 14px",
          }}
        >
          {file.name}
        </span>
      </div>

      {purposes.map((purpose, i) => {
        const said = interpolate(frame - purpose.at, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const got = spring({
          frame: frame - purpose.output.at,
          fps,
          config: { damping: 62, stiffness: 150 },
        });
        const y = laneY(i);

        return (
          <React.Fragment key={i}>
            {/* Why you need it, stated on the lane it changes. */}
            {said > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: width * 0.4,
                  top: y - 74,
                  width: width * 0.26,
                  textAlign: "center",
                  direction: "rtl",
                  fontFamily,
                  fontSize: 32,
                  fontWeight: 700,
                  color: COLORS.background,
                  background: COLORS.accentSoft,
                  padding: "12px 18px",
                  borderRadius: 14,
                  opacity: said,
                  transform: `translateY(${(1 - said) * 12}px)`,
                }}
              >
                {purpose.label}
              </div>
            ) : null}

            {frame >= purpose.output.at - 2 ? (
              <div
                style={{
                  position: "absolute",
                  left: outLeft,
                  top: y - OUT.height / 2,
                  width: OUT.width,
                  height: OUT.height,
                  borderRadius: 14,
                  background: COLORS.surface,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  direction: "rtl",
                  padding: "18px 22px",
                  boxSizing: "border-box",
                  opacity: got,
                  transform: `translateX(${(1 - got) * 26}px)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <LineIcon
                    name={purpose.output.icon}
                    size={34}
                    delay={purpose.output.at}
                    drawFrames={16}
                    color={COLORS.accent}
                  />
                  <span
                    style={{
                      fontFamily,
                      fontSize: 28,
                      fontWeight: 800,
                      color: COLORS.accent,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {purpose.output.title}
                  </span>
                </div>
                {purpose.output.rows.map((w, r) => (
                  <div
                    key={r}
                    style={{
                      height: 10,
                      width: `${w * 100}%`,
                      marginBottom: 12,
                      borderRadius: 5,
                      background: COLORS.text,
                      opacity: interpolate(
                        frame - (purpose.output.at + 8 + r * 6),
                        [0, 10],
                        [0, 0.42],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                      ),
                    }}
                  />
                ))}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
