import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useClock } from "../../clock";
import { HangingSign, PlayBlock } from "../../components/chrome";
import { PaperField } from "../../components/stage";
import { BodyCopy } from "../../components/type";
import { TT } from "../../theme";

/**
 * The end card.
 *
 * The menu's hanging sign is the game's own title treatment, so the ad closes on the
 * first thing a player actually sees rather than on a logo made for the ad.
 */
export const EndCardScene: React.FC = () => {
  const { time } = useClock();
  // The whole card breathes on the beat, which keeps the last bar from going still.
  const pulse = 1 + Math.max(0, 0.02 - ((time * 2) % 1) * 0.04);

  return (
    <PaperField sunX={50} sunY={22}>
      <AbsoluteFill style={{ transform: `scale(${pulse})` }}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 196 }}>
          <HangingSign width={760} delay={2} />
        </AbsoluteFill>

        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 470,
            gap: 34,
          }}
        >
          <BodyCopy
            text="The rhythm of everyday life."
            size={52}
            weight={800}
            color={TT.ink}
            delay={10}
          />
          <PlayBlock width={460} delay={18} label="Play free" />
          <BodyCopy
            text="Seventeen acts · Endless levels · One tap"
            size={34}
            color={TT.muted}
            delay={28}
          />
        </AbsoluteFill>

        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 124,
          }}
        >
          <Img
            src={staticFile("img/tiny-tempo-icon.jpg")}
            alt="Tiny Tempo"
            style={{
              width: 224,
              height: 224,
              borderRadius: 50,
              border: `8px solid ${TT.inkDeep}`,
              boxShadow: `0 12px 0 ${TT.inkDeep}44`,
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </PaperField>
  );
};
