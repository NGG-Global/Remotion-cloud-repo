import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { seconds } from "../../theme";
import { useClock } from "../clock";
import { StampType } from "../components/type";
import { HammerNail } from "../graphics/HammerNail";
import { BEAT } from "../theme";

const POSTER_HITS = [BEAT * 3];

export const HookScene: React.FC = () => {
  const { time } = useClock();
  const watchOut = interpolate(time, [1.55, 1.9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <HammerNail hits={POSTER_HITS} poster />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 64,
          opacity: watchOut,
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
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 420,
        }}
      >
        <StampType text="TINY TEMPO" size={108} delay={seconds(1.85)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
