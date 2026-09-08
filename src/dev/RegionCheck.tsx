import { zColor } from "@remotion/zod-types";
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Img } from "remotion";
import { z } from "zod";
import { SCREENS, type ScreenName } from "../ui/screens";

/**
 * Development-only helper: draws every region of a screen as a labelled box
 * over the screenshot, so a whole region map can be checked in one still
 * instead of by rendering the video and watching where the rings land.
 */
export const regionCheckSchema = z.object({
  screen: z.enum(Object.keys(SCREENS) as [ScreenName, ...ScreenName[]]),
  boxColor: zColor(),
});

export type RegionCheckProps = z.infer<typeof regionCheckSchema>;

export const calculateRegionCheckMetadata: CalculateMetadataFunction<
  RegionCheckProps
> = ({ props }) => {
  const screen = SCREENS[props.screen];
  return {
    width: Math.floor(screen.width / 2) * 2,
    height: Math.floor(screen.height / 2) * 2,
  };
};

export const RegionCheck: React.FC<RegionCheckProps> = ({
  screen: screenName,
  boxColor,
}) => {
  const screen = SCREENS[screenName];

  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <Img src={screen.src} style={{ width: "100%", height: "100%" }} />
      {Object.entries(screen.regions).map(([name, r]) => {
        // Grouping and redaction regions are large and would bury the rest,
        // so they are outlined without a fill.
        const isBlock = r.w > 0.2 || r.h > 0.2;
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: `${r.x * 100}%`,
              top: `${r.y * 100}%`,
              width: `${r.w * 100}%`,
              height: `${r.h * 100}%`,
              border: `2px solid ${isBlock ? "#0a7" : boxColor}`,
              backgroundColor: isBlock ? "transparent" : `${boxColor}1f`,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 2,
                top: -22,
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                backgroundColor: isBlock ? "#0a7" : boxColor,
                padding: "1px 5px",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
