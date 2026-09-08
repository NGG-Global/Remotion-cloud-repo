import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import type { Region } from "./regions";
import { TypeOn } from "./TypeOn";
import { useProjection } from "./UIShowcase";

type TypedPromptProps = {
  /** The composer's placeholder line, which this covers. */
  readonly region: Region;
  readonly text: string;
  readonly delay?: number;
  /** Characters per second. */
  readonly speed?: number;
};

/**
 * Types a request into the composer.
 *
 * The screenshot has its own placeholder text baked in, so the region is first
 * covered with the composer's own white, then the typed line is drawn over it.
 * The patch is kept inside the composer's border, where the interface is a
 * flat fill, so the join does not show.
 */
export const TypedPrompt: React.FC<TypedPromptProps> = ({
  region,
  text,
  delay = 0,
  speed = 13,
}) => {
  const frame = useCurrentFrame();
  const { project } = useProjection();

  const r = project(region);

  // Type size is taken from the covered line's own height, so the typed text
  // matches the interface's scale at any camera position.
  const fontSize = r.h * 0.6;

  const opacity = interpolate(frame, [delay - 4, delay], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        opacity,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        direction: "rtl",
        overflow: "hidden",
      }}
    >
      <TypeOn
        text={text}
        delay={delay}
        speed={speed}
        style={{
          fontFamily,
          fontSize,
          fontWeight: 400,
          color: "#1f1e1d",
          whiteSpace: "nowrap",
        }}
      />
    </div>
  );
};
