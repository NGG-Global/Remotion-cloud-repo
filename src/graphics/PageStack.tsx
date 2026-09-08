import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";

const PAGES = 7;

type PageStackProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * A thick document that fans open and is read top to bottom.
 *
 * Illustrates handing over a long document: the depth of the stack carries
 * "40 pages", and the sweep down the front page carries "reads it and answers
 * in depth" better than a page count on its own would.
 */
export const PageStack: React.FC<PageStackProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const pageW = width * 0.4;
  const pageH = pageW * 1.3;

  // The stack fans out, then the read sweeps the front page.
  const sweep = interpolate(local, [34, 96], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: pageW, height: pageH }}>
        {Array.from({ length: PAGES }, (_, i) => {
          const depth = PAGES - 1 - i;
          const fan = spring({
            frame: local - i * 2.5,
            fps,
            config: { damping: 200 },
          });
          const isFront = i === PAGES - 1;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 10,
                backgroundColor: isFront ? "#f7f4ee" : "#e8e3da",
                border: "1px solid rgba(0,0,0,0.14)",
                transform: `translate(${-depth * 9 * fan}px, ${-depth * 7 * fan}px) rotate(${-depth * 1.1 * fan}deg)`,
                opacity: fan,
                boxShadow: isFront
                  ? "0 18px 44px -12px rgba(0,0,0,0.6)"
                  : undefined,
                overflow: "hidden",
              }}
            >
              {isFront ? (
                <>
                  {/* Text lines on the front page. */}
                  <div
                    style={{
                      padding: pageW * 0.11,
                      display: "flex",
                      flexDirection: "column",
                      gap: pageH * 0.045,
                    }}
                  >
                    {Array.from({ length: 9 }, (_, r) => (
                      <div
                        key={r}
                        style={{
                          height: Math.max(3, pageH * 0.018),
                          width: `${r === 0 ? 52 : 72 + ((r * 13) % 24)}%`,
                          borderRadius: 3,
                          backgroundColor:
                            r === 0 ? COLORS.ink : "rgba(26,23,20,0.32)",
                        }}
                      />
                    ))}
                  </div>

                  {/* The read: a band travelling down the page. */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: `${sweep * 88}%`,
                      height: pageH * 0.1,
                      background: `linear-gradient(180deg, transparent, ${COLORS.accent}59, transparent)`,
                      opacity: sweep > 0 && sweep < 1 ? 1 : 0,
                    }}
                  />
                </>
              ) : null}
            </div>
          );
        })}

        {/* Page-count badge. */}
        <div
          style={{
            position: "absolute",
            right: -pageW * 0.2,
            bottom: -pageH * 0.09,
            width: pageW * 0.42,
            height: pageW * 0.42,
            borderRadius: "50%",
            backgroundColor: COLORS.accent,
            color: COLORS.ink,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontWeight: 800,
            lineHeight: 1,
            transform: `scale(${spring({ frame: local - 12, fps, config: { damping: 12, stiffness: 150 } })})`,
            boxShadow: "0 14px 30px -8px rgba(0,0,0,0.7)",
          }}
        >
          <div style={{ fontSize: pageW * 0.17 }}>40</div>
          <div style={{ fontSize: pageW * 0.072, fontWeight: 600 }}>עמודים</div>
        </div>
      </div>
    </div>
  );
};
