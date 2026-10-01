import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile } from "remotion";
import { useClock } from "../../clock";
import { HangingSign } from "../../components/chrome";
import { PaperField } from "../../components/stage";
import { BodyCopy, StampType } from "../../components/type";
import { TT } from "../../theme";
import { sec } from "../format";

/**
 * Bars 30-31. The drums drop out on the downbeat; the sign swings in through
 * the gap. The crash on the "and" of four stamps the call to action, and the
 * last three hits of the theme land on the sign's own tempo beads.
 */
export const OutroV: React.FC = () => {
  const { frame, fps } = useClock();
  const icon = spring({
    frame: frame - sec(2.0),
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 160 },
  });
  const settle = interpolate(frame, [sec(3.3), sec(4)], [1, 0.985], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <PaperField sunX={50} sunY={26}>
      <AbsoluteFill
        style={{ transform: `scale(${settle})`, transformOrigin: "50% 45%" }}
      >
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 400 }}>
          <HangingSign width={820} delay={sec(0.05)} />
        </AbsoluteFill>

        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: 1090,
            gap: 34,
          }}
        >
          <StampType
            text="COMING SOON"
            size={104}
            fill={TT.coral}
            stroke={TT.inkDeep}
            delay={sec(1.5)}
          />
          <BodyCopy
            text="The rhythm of everyday life."
            size={44}
            color={TT.ink}
            weight={800}
            delay={sec(2.0)}
          />
        </AbsoluteFill>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1470,
            display: "flex",
            justifyContent: "center",
            opacity: icon,
            transform: `scale(${interpolate(icon, [0, 1], [0.6, 1])})`,
          }}
        >
          <Img
            src={staticFile("img/tiny-tempo-icon.jpg")}
            alt="Tiny Tempo"
            style={{
              width: 196,
              height: 196,
              borderRadius: 40,
              border: `7px solid ${TT.inkDeep}`,
              boxShadow: `0 12px 0 ${TT.inkDeep}33`,
              objectFit: "cover",
            }}
          />
        </div>
      </AbsoluteFill>
    </PaperField>
  );
};
