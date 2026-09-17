import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useClock } from "../../clock";
import { StampType } from "../../components/type";
import { DISPLAY, TT } from "../../theme";
import { ACTS } from "../acts/registry";
import { beats } from "../frame";

const HITS = [
  beats(0),
  beats(0.5),
  beats(1),
  beats(1.5),
  beats(2),
  beats(2.5),
  beats(3),
];

/**
 * The variety beat: six of the seventeen acts running at once.
 *
 * Each tile keeps its own palette, because the game's acts share the interaction
 * rather than a world — the grid is the clearest way to say that in two seconds.
 */
export const MosaicScene: React.FC = () => {
  const { frame, fps } = useClock();

  return (
    <AbsoluteFill
      style={{ backgroundColor: TT.inkDeep, padding: "300px 26px 132px" }}
    >
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
          gap: 22,
        }}
      >
        {ACTS.map((act, i) => {
          const enter = spring({
            frame: frame - i * 3,
            fps,
            config: { damping: 13, mass: 0.6, stiffness: 180 },
          });
          const Graphic = act.Graphic;
          return (
            <div
              key={act.id}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 30,
                border: `8px solid ${TT.inkDeep}`,
                boxShadow: `0 10px 0 ${TT.coral}`,
                background: act.paper,
                opacity: enter,
                transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`,
              }}
            >
              <Graphic hits={HITS} />
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  right: 18,
                  bottom: 18,
                  lineHeight: 1,
                  padding: "8px 14px",
                  borderRadius: 14,
                  background: `${TT.inkDeep}cc`,
                  fontFamily: DISPLAY,
                  fontWeight: 700,
                  fontSize: 32,
                  color: TT.cream,
                }}
              >
                {act.title}
              </div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 128,
          pointerEvents: "none",
        }}
      >
        <StampType
          text={"SEVENTEEN\nEVERYDAY ACTS"}
          size={104}
          delay={5}
          fill={TT.cream}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
