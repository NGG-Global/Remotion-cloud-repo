import React from "react";
import { BRAND, ROAD } from "./brand";

type RoadProps = {
  /** Stroke width of the edge lines and centre dashes. */
  readonly stroke: number;
  /** Scroll of the dash pattern, px. Positive moves the dashes down. */
  readonly scroll: number;
  /** Opacity of the light road surface between the lines. */
  readonly fillOpacity: number;
  /** 0-1 reveal from the vertical centre outwards. */
  readonly reveal?: number;
};

const period = ROAD.dashLength + ROAD.dashGap;
/** Draw well past the frame so the lean and any tilt never expose an end. */
const TOP = -6000;
const BOTTOM = 1400;

/**
 * The abstract top-down road: two edge lines and a dashed centre line in the
 * exact geometry of the official end card, so the commercial's opening and
 * closing roads are the logo's road. Rendered as plain SVG rectangles; nothing
 * here is decorative.
 */
export const Road: React.FC<RoadProps> = ({
  stroke,
  scroll,
  fillOpacity,
  reveal = 1,
}) => {
  // Dash pattern is periodic; only draw the dashes that can be on screen.
  const phase = ((scroll % period) + period) % period;
  const dashes: number[] = [];
  for (let y = TOP + phase - period; y < BOTTOM + period; y += period) {
    dashes.push(y);
  }

  const visibleHalf = reveal * 900;

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <clipPath id="road-reveal">
          <rect
            x={-2000}
            y={540 - visibleHalf}
            width={6000}
            height={visibleHalf * 2}
          />
        </clipPath>
      </defs>
      <g
        clipPath="url(#road-reveal)"
        transform={`rotate(${ROAD.leanDeg} ${ROAD.centreX} 540)`}
      >
        <rect
          x={ROAD.leftLineX}
          y={TOP}
          width={ROAD.rightLineX - ROAD.leftLineX}
          height={BOTTOM - TOP}
          fill={BRAND.roadFill}
          opacity={fillOpacity}
        />
        <rect
          x={ROAD.leftLineX - stroke / 2}
          y={TOP}
          width={stroke}
          height={BOTTOM - TOP}
          fill={BRAND.green}
        />
        <rect
          x={ROAD.rightLineX - stroke / 2}
          y={TOP}
          width={stroke}
          height={BOTTOM - TOP}
          fill={BRAND.green}
        />
        {dashes.map((y) => (
          <rect
            key={y}
            x={ROAD.centreX - stroke / 2}
            y={y}
            width={stroke}
            height={ROAD.dashLength}
            fill={BRAND.green}
          />
        ))}
      </g>
    </svg>
  );
};
