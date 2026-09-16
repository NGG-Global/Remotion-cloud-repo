import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StampType } from "../components/type";
import { BicepCurl } from "../graphics/BicepCurl";
import { SawTimber } from "../graphics/SawTimber";
import { ScissorsPaper } from "../graphics/ScissorsPaper";
import { WindowClean } from "../graphics/WindowClean";
import { BEAT, DISPLAY, TT } from "../theme";
import { seconds } from "../../theme";

const HITS = [0, BEAT, BEAT * 2, BEAT * 3, BEAT * 4, BEAT * 5, BEAT * 6];

const CELLS = [
  { title: "Window", Graphic: WindowClean, accent: "#e9e4e7" },
  { title: "Saw", Graphic: SawTimber, accent: "#e6e9e4" },
  { title: "Paper", Graphic: ScissorsPaper, accent: "#eee8d8" },
  { title: "Curl", Graphic: BicepCurl, accent: "#dad4cb" },
] as const;

export const MosaicScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TT.inkDeep,
        padding: 18,
        gap: 18,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 18,
        }}
      >
        {CELLS.map((cell, i) => {
          const enter = spring({
            frame: frame - i * 4,
            fps,
            config: { damping: 14, stiffness: 140 },
          });
          const Graphic = cell.Graphic;
          return (
            <div
              key={cell.title}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 28,
                border: `6px solid ${TT.inkDeep}`,
                boxShadow: `0 8px 0 ${TT.coral}`,
                background: cell.accent,
                opacity: enter,
                transform: `scale(${0.86 + enter * 0.14})`,
              }}
            >
              <Graphic hits={HITS} />
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  bottom: 18,
                  fontFamily: DISPLAY,
                  fontWeight: 700,
                  fontSize: 36,
                  color: TT.cream,
                  WebkitTextStroke: `4px ${TT.inkDeep}`,
                  paintOrder: "stroke fill",
                }}
              >
                {cell.title}
              </div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 28,
          pointerEvents: "none",
        }}
      >
        <StampType
          text="Seventeen everyday acts."
          size={56}
          delay={seconds(0.55)}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
