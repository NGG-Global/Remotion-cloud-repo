import React from "react";
import { AbsoluteFill } from "remotion";
import { StampType } from "../../components/type";
import { TT } from "../../theme";
import { RoadTall } from "../acts/RoadTall";

/**
 * Progression. The game's map is an endless road grouped into ten-level areas, so
 * the shot flies up it and lets the palette turn over from Grass to Snow inside two
 * beats rather than describing the system in words.
 */
export const RoadScene: React.FC = () => (
  <AbsoluteFill>
    <RoadTall />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(36,62,53,0.26) 0%, rgba(36,62,53,0) 34%)",
      }}
    />
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 128,
      }}
    >
      <StampType
        text={"AN ENDLESS\nROAD OF LEVELS"}
        size={84}
        fill={TT.cream}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);
