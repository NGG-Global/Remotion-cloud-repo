import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

type ReadMaterialProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * A page of body text with a reading band travelling down it.
 *
 * The accepted half of the contrast: working on the material itself. Lines
 * ahead of the band are dim and lines behind it are lit, so the picture shows
 * reading in progress rather than a document simply sitting there.
 */
export const ReadMaterial: React.FC<ReadMaterialProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;

  const rows = 8;
  const gap = height * 0.04;
  const rowH = (height - gap * (rows - 1)) / rows;

  // The band makes two passes, so the shot stays alive on a longer hold.
  const pass = interpolate(local, [10, 90], [0, 1.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        gap,
        position: "relative",
      }}
    >
      {Array.from({ length: rows }, (_, i) => {
        const rowPosition = i / (rows - 1);
        // A row lights up once the band has passed it.
        const lit = interpolate(pass - rowPosition, [-0.05, 0.06], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              height: rowH,
              width: `${i === 0 ? 48 : 76 + ((i * 11) % 22)}%`,
              borderRadius: 4,
              backgroundColor: i === 0 ? COLORS.text : COLORS.textMuted,
              opacity: 0.22 + lit * 0.68,
              transform: `scaleY(${1 + lit * 0.06})`,
              transformOrigin: "center",
            }}
          />
        );
      })}

      {/* The reading band. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${Math.min(1, pass) * 92}%`,
          height: height * 0.1,
          background: `linear-gradient(180deg, transparent, ${COLORS.accent}4d, transparent)`,
          opacity: pass > 0 && pass < 1.05 ? 1 : 0,
        }}
      />
    </div>
  );
};
