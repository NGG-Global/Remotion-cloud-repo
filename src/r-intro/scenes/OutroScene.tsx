import React from "react";
import { AbsoluteFill } from "remotion";
import { Burst } from "../components/Burst";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At } from "../components/layout";
import { Sticker } from "../components/Sticker";
import { RLogo } from "../graphics/RLogo";
import { sceneClock } from "../clock";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("outro");

/** That is week one. The parentheses close themselves, which is the bonus. */
export const OutroScene: React.FC = () => (
  <AbsoluteFill>
    <At y={220}>
      <RLogo size={260} at={c.t("outro")} />
    </At>
    <At y={520}>
      <Headline
        text="זה הכל לשבוע הראשון!"
        at={c.after("outro", 0.4)}
        size={SIZE.heading}
        mark={["הראשון!"]}
      />
    </At>
    <Burst at={c.after("outro", 0.8)} x={540} y={560} count={44} spread={640} />

    <At y={760}>
      <CodePanel
        at={c.t("parentheses")}
        width={936}
        fontSize={44}
        charFrames={1.2}
        lines={[
          { at: 4, text: "mean(c(scores, c(1, 2, c(3" },
          { at: sec(2.2), text: "))))" },
          { at: sec(3.4), kind: "output", text: "[1] 6.5" },
        ]}
      />
    </At>
    <At y={1180}>
      <Sticker
        text="סגרתי את כל הסוגריים?"
        at={c.after("parentheses", 1.0)}
        color={R.yellow}
        size={46}
        tilt={-2}
      />
    </At>
    <At y={1330}>
      <Sticker
        text="בונוס!"
        at={c.after("parentheses", 3.4)}
        color={R.green}
        textColor={R.white}
        size={80}
        tilt={4}
      />
    </At>
    <Burst
      at={c.after("parentheses", 3.5)}
      x={540}
      y={1380}
      count={36}
      spread={520}
    />
  </AbsoluteFill>
);
