import React, { createContext, useContext, useMemo } from "react";
import { Img } from "remotion";
import { COLORS } from "../theme";
import type { Region } from "./regions";
import type { Screen } from "./screens";
import type { FocusTransform } from "./useFocus";

/** A rectangle in window pixels. */
export type Rect = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

type Projection = {
  /** Maps a screenshot region to its on-screen rectangle, in window pixels. */
  readonly project: (region: Region) => Rect;
  readonly windowWidth: number;
  readonly windowHeight: number;
};

const ProjectionContext = createContext<Projection | null>(null);

/**
 * Projection from screenshot coordinates to window pixels.
 *
 * Overlays live outside the zoomed layer and use this to place themselves, so
 * a ring tracks its element while its stroke, and a label's type size, stay
 * constant no matter how far the camera has pushed in.
 */
export const useProjection = (): Projection => {
  const value = useContext(ProjectionContext);
  if (!value) {
    throw new Error("Screenshot overlays must be rendered inside <UIShowcase>");
  }
  return value;
};

type UIShowcaseProps = {
  /** The screenshot being filmed, with its region map and native size. */
  readonly screen: Screen;
  /** Camera position, normally from `useFocus()`. */
  readonly focus: FocusTransform;
  /** Width of the window on the canvas, in pixels. */
  readonly width: number;
  /** Overlays — highlights, callouts, cursor — in screenshot coordinates. */
  readonly children?: React.ReactNode;
  /** Window entrance progress, 0-1. Drives scale and lift. */
  readonly reveal?: number;
  /**
   * Regions of the screenshot to blur out.
   *
   * The captured interface contains real conversation titles and an account
   * name. Anything not being taught is blurred so the video can be shared
   * without carrying internal content along with it.
   */
  readonly redact?: readonly Region[];
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * The interface screenshot presented as an application window, with a camera
 * that can push into any region.
 */
export const UIShowcase: React.FC<UIShowcaseProps> = ({
  screen,
  focus,
  width,
  children,
  reveal = 1,
  redact = [],
}) => {
  const height = width / (screen.width / screen.height);

  const contentWidth = width * focus.scale;
  const contentHeight = height * focus.scale;

  /**
   * Centre the focus point, but never past an edge of the image.
   *
   * Without the clamp, focusing anything near a corner slides the screenshot
   * far enough to expose blank window behind it. Clamping makes the camera
   * stop at the edge the way a real one would, and keeps the window full.
   */
  const left = clamp(
    width / 2 - focus.cx * contentWidth,
    width - contentWidth,
    0,
  );
  const top = clamp(
    height / 2 - focus.cy * contentHeight,
    height - contentHeight,
    0,
  );

  const projection = useMemo<Projection>(
    () => ({
      windowWidth: width,
      windowHeight: height,
      project: (region) => ({
        x: left + region.x * contentWidth,
        y: top + region.y * contentHeight,
        w: region.w * contentWidth,
        h: region.h * contentHeight,
      }),
    }),
    [left, top, contentWidth, contentHeight, width, height],
  );

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#ffffff",
        transform: `scale(${0.94 + reveal * 0.06})`,
        opacity: reveal,
        // A wide, soft shadow plus a hairline edge lifts the window off the
        // background without the frame reading as a drawn border.
        boxShadow: `0 60px 120px -30px rgba(0,0,0,0.75), 0 0 0 1px ${COLORS.frameEdge}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: contentWidth,
          height: contentHeight,
        }}
      >
        <Img
          src={screen.src}
          style={{ width: "100%", height: "100%", display: "block" }}
        />

        {/* Each redaction is a second copy of the screenshot, offset so that
            only the covered region shows through, and blurred. Drawing the
            image again rather than using `backdrop-filter` keeps the result
            identical on every renderer. */}
        {redact.map((region, index) => (
          <div
            key={`redact-${index}`}
            style={{
              position: "absolute",
              left: region.x * contentWidth,
              top: region.y * contentHeight,
              width: region.w * contentWidth,
              height: region.h * contentHeight,
              overflow: "hidden",
            }}
          >
            <Img
              src={screen.src}
              style={{
                position: "absolute",
                left: -region.x * contentWidth,
                top: -region.y * contentHeight,
                width: contentWidth,
                height: contentHeight,
                // Blur scales with the drawn size so the redaction stays
                // equally illegible as the camera pushes in.
                filter: `blur(${Math.max(7, contentHeight * 0.012)}px) saturate(0.65)`,
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", inset: 0 }}>
        <ProjectionContext.Provider value={projection}>
          {children}
        </ProjectionContext.Provider>
      </div>
    </div>
  );
};
