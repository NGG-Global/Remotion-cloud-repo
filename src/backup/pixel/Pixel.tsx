import React, { useMemo } from "react";
import { ICONS, IconName, PALETTE } from "./icons";
import { rand } from "../theme";

/**
 * Renders a pixel icon as one SVG path per colour, crisp at any scale.
 *
 * `build` (0..1) assembles the icon pixel by pixel in a dissolve, the way a
 * slow connection painted an image in. `mono` maps every colour onto one hue
 * by brightness, for the amber monitor in the cold open.
 */

type Props = {
  readonly name: IconName;
  /** Size of one pixel in frame pixels. */
  readonly px: number;
  readonly build?: number;
  readonly colors?: Partial<Record<string, string>>;
  readonly mono?: string;
  readonly flip?: boolean;
  readonly shadow?: boolean;
  readonly style?: React.CSSProperties;
};

type Cell = { x: number; y: number; ch: string; order: number };

const cells = (name: IconName): { w: number; h: number; list: Cell[] } => {
  const rows = ICONS[name] as readonly string[];
  const list: Cell[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== ".") list.push({ x, y, ch, order: rand(x * 31 + y * 17 + 3) });
    });
  });
  return { w: rows[0].length, h: rows.length, list };
};

const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  return (
    (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) /
    255
  );
};

const shadeOf = (base: string, k: number): string => {
  const n = parseInt(base.slice(1), 16);
  const ch = (v: number) =>
    Math.round(v * k)
      .toString(16)
      .padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};

export const iconSize = (name: IconName): { w: number; h: number } => {
  const rows = ICONS[name] as readonly string[];
  return { w: rows[0].length, h: rows.length };
};

export const Pixel: React.FC<Props> = ({
  name,
  px,
  build = 1,
  colors,
  mono,
  flip,
  shadow = true,
  style,
}) => {
  const grid = useMemo(() => cells(name), [name]);
  const visible =
    build >= 1 ? grid.list : grid.list.filter((c) => c.order < build);

  const byColour = new Map<string, string[]>();
  for (const c of visible) {
    let fill = colors?.[c.ch] ?? PALETTE[c.ch];
    if (mono) {
      // Outlines go dark, everything else takes the phosphor by brightness.
      fill =
        c.ch === "k"
          ? shadeOf(mono, 0.16)
          : shadeOf(mono, 0.35 + 0.65 * luminance(fill));
    }
    const d = byColour.get(fill) ?? [];
    d.push(`M${c.x} ${c.y}h1v1h-1z`);
    byColour.set(fill, d);
  }

  const W = grid.w * px;
  const H = grid.h * px;
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${grid.w} ${grid.h}`}
      shapeRendering="crispEdges"
      style={{
        display: "block",
        overflow: "visible",
        transform: flip ? "scaleX(-1)" : undefined,
        filter:
          shadow && !mono
            ? `drop-shadow(${px * 0.6}px ${px * 0.6}px 0 rgba(0,0,0,0.2))`
            : mono
              ? `drop-shadow(0 0 ${px * 0.8}px ${mono}66)`
              : undefined,
        ...style,
      }}
    >
      {[...byColour.entries()].map(([fill, d]) => (
        <path key={fill} d={d.join("")} fill={fill} />
      ))}
    </svg>
  );
};
