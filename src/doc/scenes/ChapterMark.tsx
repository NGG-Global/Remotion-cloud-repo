import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Scene } from "../components/Scene";
import { Rise } from "../components/Type";
import { DOC, easeOut, ramp, SERIF_LATIN } from "../theme";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

type ChapterMarkProps = {
  readonly index: number;
  readonly title: string;
};

/**
 * Chapter divider. A ghosted roman numeral, a hairline that draws itself, and
 * the chapter's name in a single line. Two seconds of breath between acts.
 */
export const ChapterMark: React.FC<ChapterMarkProps> = ({ index, title }) => {
  const frame = useCurrentFrame();
  const numeral = easeOut(ramp(frame, 0, 26));
  const rule = easeOut(ramp(frame, 10, 40));

  return (
    <Scene fog={0.35} fogBand="low" flicker={0.15} vignette={0.85}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div
          style={{
            fontFamily: SERIF_LATIN,
            fontSize: 190,
            fontWeight: 400,
            lineHeight: 1,
            color: DOC.paperDark,
            opacity: 0.55 * numeral,
            transform: `scale(${0.94 + 0.06 * numeral})`,
            letterSpacing: 6,
          }}
        >
          {ROMAN[index - 1] ?? String(index)}
        </div>
        <div
          style={{
            width: 360 * rule,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${DOC.red}, transparent)`,
            opacity: 0.9,
          }}
        />
        <Rise
          text={title}
          delay={18}
          fontSize={54}
          weight={400}
          color={DOC.text}
        />
      </AbsoluteFill>
    </Scene>
  );
};
