import React from "react";
import { AbsoluteFill } from "remotion";
import { StarMedal } from "../components/feedback";
import { PaperField } from "../components/stage";
import { BodyCopy, StampType } from "../components/type";
import { MapRoad } from "../graphics/MapRoad";
import { TT } from "../theme";
import { seconds } from "../../theme";

export const PromiseScene: React.FC = () => {
  return (
    <PaperField paper="#d5e0c4" sun="#f0e2a8" sunX={50} sunY={18}>
      <MapRoad />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(36,62,53,0.08) 0%, rgba(36,62,53,0.0) 35%, rgba(36,62,53,0.18) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 64,
        }}
      >
        <StampType
          text="Arcade timing."
          size={88}
          fill={TT.ink}
          stroke={TT.cream}
          shadow={false}
          delay={seconds(0.05)}
        />
        <div style={{ height: 12 }} />
        <StampType
          text="Workshop soul."
          size={88}
          fill={TT.coral}
          stroke={TT.inkDeep}
          delay={seconds(0.35)}
        />
      </AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <StarMedal x={660} y={900} radius={78} delay={seconds(0.7)} />
        <StarMedal x={960} y={880} radius={92} delay={seconds(1.05)} />
        <StarMedal x={1260} y={900} radius={78} delay={seconds(1.4)} />
      </svg>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 36,
        }}
      >
        <BodyCopy
          text="Perfect is ±55 ms. The rest is character."
          color={TT.ink}
          delay={seconds(1.7)}
          size={30}
        />
      </AbsoluteFill>
    </PaperField>
  );
};
