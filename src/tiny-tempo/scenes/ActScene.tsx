import React from "react";
import { AbsoluteFill } from "remotion";
import { StampType } from "../components/type";
import { JudgementPop } from "../components/feedback";
import { BugShoe } from "../graphics/BugShoe";
import { HammerNail } from "../graphics/HammerNail";
import { TomatoKnife } from "../graphics/TomatoKnife";
import { BEAT, TT } from "../theme";
import { seconds } from "../../theme";

type Act = "hammer" | "tomato" | "bug";

const HITS: Record<Act, readonly number[]> = {
  hammer: [0, BEAT, BEAT * 2],
  tomato: [0, BEAT, BEAT * 2, BEAT * 3],
  bug: [0, BEAT, BEAT * 3],
};

const LINE: Record<Act, string> = {
  hammer: "Make it stick.",
  tomato: "Mind your fingers.",
  bug: "Watch your step.",
};

const Stage: Record<Act, React.FC<{ readonly hits: readonly number[] }>> = {
  hammer: HammerNail,
  tomato: TomatoKnife,
  bug: BugShoe,
};

export const ActScene: React.FC<{ readonly act: Act }> = ({ act }) => {
  const hits = HITS[act];
  const Graphic = Stage[act];
  return (
    <AbsoluteFill>
      <Graphic hits={hits} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: "0 0 56px 72px",
        }}
      >
        <StampType
          text={LINE[act]}
          size={64}
          fill={TT.cream}
          delay={seconds(0.08)}
        />
      </AbsoluteFill>
      <JudgementPop hits={hits} x={1560} y={180} />
    </AbsoluteFill>
  );
};
