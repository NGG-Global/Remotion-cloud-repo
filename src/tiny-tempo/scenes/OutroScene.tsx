import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { HangingSign, PlayBlock } from "../components/chrome";
import { PaperField } from "../components/stage";
import { BodyCopy } from "../components/type";
import { TT } from "../theme";
import { seconds } from "../../theme";

export const OutroScene: React.FC = () => {
  return (
    <PaperField sunX={50} sunY={20}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 8 }}>
        <HangingSign width={560} delay={seconds(0.08)} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 280,
          gap: 20,
        }}
      >
        <BodyCopy
          text="The rhythm of everyday life."
          size={40}
          color={TT.ink}
          delay={seconds(0.45)}
          weight={800}
        />
        <PlayBlock delay={seconds(0.7)} />
        <BodyCopy
          text="Watch it. Tap it back."
          size={28}
          color={TT.muted}
          delay={seconds(1.05)}
        />
      </AbsoluteFill>
      <Img
        src={staticFile("img/tiny-tempo-icon.jpg")}
        alt="Tiny Tempo"
        style={{
          position: "absolute",
          right: 64,
          bottom: 56,
          width: 132,
          height: 132,
          borderRadius: 28,
          border: `6px solid ${TT.inkDeep}`,
          boxShadow: `0 10px 0 ${TT.inkDeep}33`,
          objectFit: "cover",
        }}
      />
    </PaperField>
  );
};
