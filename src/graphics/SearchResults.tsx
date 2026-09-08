import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

type SearchResultsProps = {
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
};

/**
 * A page of link results that get crossed off.
 *
 * The rejected half of the contrast: this is what Claude is not. Each row is
 * drawn as a title line plus a URL stub, which is enough for a search result
 * to be recognised without any text to read.
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  width,
  height,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const rows = 4;
  const rowH = height / (rows + 0.6);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        gap: rowH * 0.28,
      }}
    >
      {Array.from({ length: rows }, (_, i) => {
        const appear = interpolate(local - i * 5, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const strike = interpolate(local - 30 - i * 6, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              opacity: appear * (1 - strike * 0.4),
              position: "relative",
            }}
          >
            {/* Link title. */}
            <div
              style={{
                height: rowH * 0.26,
                width: `${72 - i * 7}%`,
                borderRadius: 3,
                backgroundColor: COLORS.accentAlt,
                opacity: 0.75,
              }}
            />
            {/* URL stub. */}
            <div
              style={{
                marginTop: rowH * 0.15,
                height: rowH * 0.17,
                width: `${44 - i * 4}%`,
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            />
            {/* Crossed off. */}
            <div
              style={{
                position: "absolute",
                top: rowH * 0.13,
                right: 0,
                height: 2,
                width: `${(72 - i * 7) * strike}%`,
                backgroundColor: COLORS.textMuted,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
