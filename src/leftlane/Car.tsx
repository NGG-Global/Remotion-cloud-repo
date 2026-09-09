import React from "react";
import { BRAND } from "./brand";

type CarProps = {
  readonly x: number;
  readonly y: number;
  readonly heading: number;
  readonly opacity?: number;
};

const W = 128;
const H = 254;

/**
 * A simplified top-down vehicle marker: a dark body, a glass band, two light
 * marks at the nose. Restrained enough to read as an interface element rather
 * than an illustration.
 */
export const Car: React.FC<CarProps> = ({ x, y, heading, opacity = 1 }) => {
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        opacity,
      }}
    >
      <g
        transform={`translate(${x} ${y}) rotate(${heading})`}
        style={{
          filter: "drop-shadow(0px 20px 28px rgba(20, 30, 26, 0.22))",
        }}
      >
        <rect
          x={-W / 2}
          y={-H / 2}
          width={W}
          height={H}
          rx={38}
          fill={BRAND.carBody}
        />
        <rect
          x={-W / 2 + 11}
          y={-H / 2 + 58}
          width={W - 22}
          height={42}
          rx={12}
          fill={BRAND.carGlass}
        />
        <rect
          x={-W / 2 + 13}
          y={H / 2 - 70}
          width={W - 26}
          height={28}
          rx={9}
          fill={BRAND.carGlass}
          opacity={0.75}
        />
        <rect
          x={-W / 2 + 16}
          y={-H / 2 + 6}
          width={28}
          height={6}
          rx={3}
          fill={BRAND.carLight}
        />
        <rect
          x={W / 2 - 44}
          y={-H / 2 + 6}
          width={28}
          height={6}
          rx={3}
          fill={BRAND.carLight}
        />
      </g>
    </svg>
  );
};
