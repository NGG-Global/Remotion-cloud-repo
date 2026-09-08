import { zColor } from "@remotion/zod-types";
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Img } from "remotion";
import { z } from "zod";
import { SCREENS, type ScreenName } from "../ui/screens";

/**
 * Development-only helper: renders a screenshot under a labelled percentage
 * grid, so region coordinates can be read straight off it.
 *
 * Not part of any video. Render a still per screen:
 *   npx remotion still Calibration out.png --props='{"screen":"settings"}'
 */
export const calibrationSchema = z.object({
  screen: z.enum(Object.keys(SCREENS) as [ScreenName, ...ScreenName[]]),
  gridColor: zColor(),
});

export type CalibrationProps = z.infer<typeof calibrationSchema>;

/**
 * Sizes the still to the screenshot's own pixels, so a percentage read off the
 * grid maps directly onto a region value. Dimensions are forced even because
 * Remotion warns about odd sizes under H.264, even for stills.
 */
export const calculateCalibrationMetadata: CalculateMetadataFunction<
  CalibrationProps
> = ({ props }) => {
  const screen = SCREENS[props.screen];
  return {
    width: Math.floor(screen.width / 2) * 2,
    height: Math.floor(screen.height / 2) * 2,
  };
};

const STEP = 5;

export const Calibration: React.FC<CalibrationProps> = ({
  screen: screenName,
  gridColor,
}) => {
  const screen = SCREENS[screenName];
  const marks: React.ReactNode[] = [];

  for (let p = 0; p <= 100; p += STEP) {
    const major = p % 10 === 0;
    marks.push(
      <div
        key={`v${p}`}
        style={{
          position: "absolute",
          left: `${p}%`,
          top: 0,
          bottom: 0,
          width: major ? 2 : 1,
          background: major ? gridColor : `${gridColor}59`,
        }}
      />,
      <div
        key={`h${p}`}
        style={{
          position: "absolute",
          top: `${p}%`,
          left: 0,
          right: 0,
          height: major ? 2 : 1,
          background: major ? "#0078ff" : "#0078ff59",
        }}
      />,
    );
    if (major) {
      marks.push(
        <div
          key={`vl${p}`}
          style={{
            position: "absolute",
            left: `${p}%`,
            top: 4,
            fontSize: 22,
            fontWeight: 700,
            color: gridColor,
            background: "rgba(255,255,255,0.85)",
            padding: "1px 4px",
          }}
        >
          {p}
        </div>,
        <div
          key={`hl${p}`}
          style={{
            position: "absolute",
            top: `${p}%`,
            left: 4,
            fontSize: 22,
            fontWeight: 700,
            color: "#0078ff",
            background: "rgba(255,255,255,0.85)",
            padding: "1px 4px",
          }}
        >
          {p}
        </div>,
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <Img src={screen.src} style={{ width: "100%", height: "100%" }} />
      {marks}
    </AbsoluteFill>
  );
};
