import React from "react";
import { C, DISPLAY, EMOJI } from "../theme";
import { clamp01 } from "../motion";

export type Vec2 = readonly [number, number];

/** Maps space units to pixels within a stage SVG. */
export type Frame2D = {
  readonly ox: number;
  readonly oy: number;
  readonly unit: number;
};

export const toPx = (f: Frame2D, v: Vec2): Vec2 => [
  f.ox + v[0] * f.unit,
  f.oy - v[1] * f.unit,
];

/** Axes and grid lines, drawing outward from the origin as `show` runs 0->1. */
export const Axes: React.FC<{
  readonly frame: Frame2D;
  readonly extent: number;
  readonly show: number;
  readonly labels?: readonly [string, string];
  readonly grid?: boolean;
}> = ({ frame, extent, show, labels, grid = true }) => {
  const reach = extent * frame.unit * clamp01(show);
  const lines: React.ReactNode[] = [];
  if (grid) {
    for (let i = -extent; i <= extent; i++) {
      if (i === 0) continue;
      const p = i * frame.unit;
      lines.push(
        <line
          key={`v${i}`}
          x1={frame.ox + p}
          x2={frame.ox + p}
          y1={frame.oy - reach}
          y2={frame.oy + reach}
          stroke={C.grid}
          strokeWidth={2}
        />,
        <line
          key={`h${i}`}
          y1={frame.oy + p}
          y2={frame.oy + p}
          x1={frame.ox - reach}
          x2={frame.ox + reach}
          stroke={C.grid}
          strokeWidth={2}
        />,
      );
    }
  }
  return (
    <g opacity={clamp01(show * 2)}>
      {lines}
      <line
        x1={frame.ox - reach}
        x2={frame.ox + reach}
        y1={frame.oy}
        y2={frame.oy}
        stroke={C.axis}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        y1={frame.oy - reach}
        y2={frame.oy + reach}
        x1={frame.ox}
        x2={frame.ox}
        stroke={C.axis}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {labels ? (
        <>
          <text
            x={frame.ox + reach - 6}
            y={frame.oy + 56}
            fill={C.textMuted}
            fontFamily={DISPLAY}
            fontSize={38}
            fontWeight={600}
            textAnchor="end"
            opacity={clamp01(show * 3 - 2)}
          >
            {labels[0]}
          </text>
          <text
            x={frame.ox + 20}
            y={frame.oy - reach + 34}
            fill={C.textMuted}
            fontFamily={DISPLAY}
            fontSize={38}
            fontWeight={600}
            opacity={clamp01(show * 3 - 2)}
          >
            {labels[1]}
          </text>
        </>
      ) : null}
    </g>
  );
};

/**
 * An arrow from `from` to `to` in pixel space, drawn on as `progress` runs
 * 0->1. The head rides the tip of the shaft rather than fading in at the end,
 * so the arrow reads as growing, not appearing.
 */
export const Arrow: React.FC<{
  readonly from: Vec2;
  readonly to: Vec2;
  readonly progress: number;
  readonly color: string;
  readonly width?: number;
  readonly head?: number;
  readonly dashed?: boolean;
  readonly opacity?: number;
}> = ({
  from,
  to,
  progress,
  color,
  width = 10,
  head = 34,
  dashed,
  opacity = 1,
}) => {
  const p = clamp01(progress);
  if (p <= 0) return null;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const ux = dx / len;
  const uy = dy / len;
  const tipX = from[0] + dx * p;
  const tipY = from[1] + dy * p;
  const h = Math.min(head, len * p * 0.6);
  const baseX = tipX - ux * h;
  const baseY = tipY - uy * h;
  const nx = -uy;
  const ny = ux;
  return (
    <g opacity={opacity}>
      <line
        x1={from[0]}
        y1={from[1]}
        x2={baseX + ux * 2}
        y2={baseY + uy * 2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? `${width * 1.6} ${width * 1.6}` : undefined}
      />
      <polygon
        points={`${tipX},${tipY} ${baseX + nx * h * 0.6},${baseY + ny * h * 0.6} ${baseX - nx * h * 0.6},${baseY - ny * h * 0.6}`}
        fill={color}
        strokeLinejoin="round"
        stroke={color}
        strokeWidth={4}
      />
    </g>
  );
};

/** A colour emoji glyph centred on a point, drawn from the bundled subset. */
export const Glyph: React.FC<{
  readonly at: Vec2;
  readonly char: string;
  readonly size: number;
  readonly scale?: number;
  readonly opacity?: number;
  readonly rotate?: number;
}> = ({ at, char, size, scale = 1, opacity = 1, rotate = 0 }) => (
  <text
    x={0}
    y={0}
    fontFamily={EMOJI}
    fontSize={size}
    textAnchor="middle"
    dominantBaseline="central"
    opacity={opacity}
    transform={`translate(${at[0]} ${at[1]}) rotate(${rotate}) scale(${scale})`}
  >
    {char}
  </text>
);

/** Rounded label pill, centred on a point. */
export const Tag: React.FC<{
  readonly at: Vec2;
  readonly text: string;
  readonly color: string;
  readonly size?: number;
  readonly scale?: number;
  readonly opacity?: number;
  readonly ink?: string;
}> = ({ at, text, color, size = 40, scale = 1, opacity = 1, ink = C.ink }) => {
  const w = text.length * size * 0.56 + size * 1.1;
  const h = size * 1.6;
  return (
    <g
      transform={`translate(${at[0]} ${at[1]}) scale(${scale})`}
      opacity={opacity}
    >
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={color}
      />
      <text
        x={0}
        y={size * 0.05}
        fill={ink}
        fontFamily={DISPLAY}
        fontWeight={600}
        fontSize={size}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {text}
      </text>
    </g>
  );
};
