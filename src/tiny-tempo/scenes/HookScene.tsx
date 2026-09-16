import React from "react";
import { AbsoluteFill } from "remotion";
import { BEAT } from "../theme";
import { StampType } from "../components/type";
import { HammerNail } from "../graphics/HammerNail";
import { seconds } from "../../theme";

const POSTER_HITS = [BEAT * 3];

export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <HammerNail hits={POSTER_HITS} poster />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 72,
        }}
      >
        <StampType
          text="WATCH."
          size={96}
          delay={seconds(0.45)}
          fill="#fff4dc"
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 64,
        }}
      >
        <StampType text={"TINY\nTEMPO"} size={128} delay={seconds(1.85)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
