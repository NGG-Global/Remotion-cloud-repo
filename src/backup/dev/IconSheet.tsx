import React from "react";
import { AbsoluteFill } from "remotion";
import { ICONS, IconName } from "../pixel/icons";
import { Pixel } from "../pixel/Pixel";
import { C, FONT } from "../theme";
import { loadBackupFonts } from "../fonts";

loadBackupFonts();

/** Every pixel icon on one sheet, for checking the drawings. Not delivered. */
export const IconSheet: React.FC = () => (
  <AbsoluteFill
    style={{
      background: C.paper,
      padding: 40,
      display: "flex",
      flexWrap: "wrap",
      gap: 24,
      alignContent: "flex-start",
    }}
  >
    {(Object.keys(ICONS) as IconName[]).map((name) => (
      <div
        key={name}
        style={{
          width: 150,
          height: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
        }}
      >
        <Pixel name={name} px={7} />
        <div style={{ fontFamily: FONT.sans, fontSize: 20, color: C.ink }}>
          {name}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
