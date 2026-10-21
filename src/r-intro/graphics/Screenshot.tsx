import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { R } from "../theme";

/** A region of the RStudio screenshot, in source pixels (1210 x 674). */
export type Region = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export const RSTUDIO = { width: 1210, height: 674 } as const;

export const PANES = {
  all: { x: 0, y: 0, w: 1210, h: 674 },
  editor: { x: 8, y: 72, w: 678, h: 240 },
  console: { x: 8, y: 318, w: 678, h: 352 },
  environment: { x: 692, y: 72, w: 514, h: 238 },
  files: { x: 692, y: 316, w: 514, h: 354 },
  runButton: { x: 455, y: 98, w: 90, h: 26 },
  codeLines: { x: 8, y: 120, w: 400, h: 70 },
  values: { x: 692, y: 150, w: 514, h: 66 },
} as const satisfies Record<string, Region>;

type ScreenshotProps = {
  /** Width of the window on the canvas when showing the whole screenshot. */
  readonly width: number;
  readonly at?: number;
  /** Camera moves: each entry frames a region from the given frame on. */
  readonly shots?: readonly {
    readonly at: number;
    readonly region: Region;
    readonly fill?: number;
  }[];
  /** Spotlight: dim everything except this region. */
  readonly spotlight?: {
    readonly at: number;
    readonly region: Region;
    readonly until?: number;
  };
  readonly src?: string;
};

/**
 * The RStudio screenshot inside a rounded window. "Shots" move a virtual
 * camera between regions with a spring, so a cut to the console pane is a
 * push-in rather than a jump.
 */
export const Screenshot: React.FC<ScreenshotProps> = ({
  width,
  at = 0,
  shots = [],
  spotlight,
  src = "r-intro/rstudio.png",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  const height = (width * RSTUDIO.height) / RSTUDIO.width;
  const base = width / RSTUDIO.width;

  const enter = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Blend camera between consecutive shots.
  let scale = 1;
  let cx = RSTUDIO.width / 2;
  let cy = RSTUDIO.height / 2;
  shots.forEach((shot) => {
    const p = spring({
      frame: local - shot.at,
      fps,
      config: { damping: 18, stiffness: 70, mass: 1 },
    });
    const fill = shot.fill ?? 0.92;
    const target = Math.min(
      (RSTUDIO.width * fill) / shot.region.w,
      (RSTUDIO.height * fill) / shot.region.h,
    );
    const tx = shot.region.x + shot.region.w / 2;
    const ty = shot.region.y + shot.region.h / 2;
    scale = interpolate(p, [0, 1], [scale, target]);
    cx = interpolate(p, [0, 1], [cx, tx]);
    cy = interpolate(p, [0, 1], [cy, ty]);
  });

  const spot = spotlight
    ? interpolate(
        local,
        spotlight.until
          ? [
              spotlight.at,
              spotlight.at + 10,
              spotlight.until,
              spotlight.until + 10,
            ]
          : [spotlight.at, spotlight.at + 10],
        spotlight.until ? [0, 1, 1, 0] : [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const offsetX = (RSTUDIO.width / 2 - cx) * scale;
  const offsetY = (RSTUDIO.height / 2 - cy) * scale;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        overflow: "hidden",
        background: R.white,
        boxShadow: `0 30px 70px ${R.ink}38, 0 0 0 8px ${R.white}`,
        opacity: interpolate(enter, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${(1 - enter) * 100}px) scale(${0.92 + enter * 0.08})`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: RSTUDIO.width,
          height: RSTUDIO.height,
          transformOrigin: "center",
          transform: `translate(${(width - RSTUDIO.width) / 2}px, ${(height - RSTUDIO.height) / 2}px) translate(${offsetX * base}px, ${offsetY * base}px) scale(${base * scale})`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: RSTUDIO.width,
            height: RSTUDIO.height,
            display: "block",
          }}
        />
        {spotlight ? (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `${R.ink}`,
                opacity: 0.62 * spot,
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${spotlight.region.y}px, ${spotlight.region.x}px ${spotlight.region.y}px, ${spotlight.region.x}px ${spotlight.region.y + spotlight.region.h}px, ${spotlight.region.x + spotlight.region.w}px ${spotlight.region.y + spotlight.region.h}px, ${spotlight.region.x + spotlight.region.w}px ${spotlight.region.y}px, 0 ${spotlight.region.y}px)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: spotlight.region.x - 4,
                top: spotlight.region.y - 4,
                width: spotlight.region.w + 8,
                height: spotlight.region.h + 8,
                border: `4px solid ${R.yellow}`,
                borderRadius: 10,
                opacity: spot,
                boxShadow: `0 0 0 3px ${R.ink}55`,
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};
