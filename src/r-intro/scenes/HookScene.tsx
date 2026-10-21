import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Burst } from "../components/Burst";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { sceneClock } from "../clock";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("hook");

/**
 * The cold open: a week of R, one comma out of place, and the welcome.
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shake =
    frame > c.after("hook", 7.2) && frame < c.after("hook", 8.2)
      ? Math.sin(frame * 2.4) * 9
      : 0;
  const dim = interpolate(
    frame,
    [c.t("welcome"), c.t("welcome") + 8],
    [1, 0.25],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill>
      <div style={{ opacity: dim, position: "absolute", inset: 0 }}>
        <At y={300}>
          <Headline
            text="שבוע אחד עם R"
            at={sec(0.4)}
            size={SIZE.display}
            mark={["R"]}
          />
        </At>
        <At y={470}>
          <Headline
            text="עד לפני שבוע: אותיות באנגלית"
            at={sec(2.0)}
            size={SIZE.subheading}
            weight={600}
            color={R.inkSoft}
          />
        </At>

        <At y={660} style={{ transform: `translateX(${shake}px)` }}>
          <CodePanel
            at={sec(4.6)}
            title="console"
            width={936}
            lines={[
              { at: sec(0.3), text: "scores <- c(12, 15 18, 9)" },
              {
                at: sec(2.2),
                kind: "output",
                text: "Error: unexpected numeric constant",
              },
              {
                at: sec(2.2),
                kind: "output",
                text: 'in "scores <- c(12, 15 18"',
              },
            ]}
          />
        </At>

        <At y={1120}>
          <Headline
            text="מה קרה פה?!"
            at={c.after("hook", 5.9)}
            size={SIZE.heading}
            color={R.coral}
          />
        </At>

        <At y={1300}>
          <Sticker
            text="פסיק אחד לא במקום"
            at={c.after("hook", 8.4)}
            color={R.coral}
            textColor={R.white}
            size={48}
            tilt={-4}
          />
        </At>
        <Pop
          at={c.after("hook", 8.9)}
          from="above"
          tilt={14}
          style={{ position: "absolute", left: 120, top: 1240 }}
        >
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 220,
              fontWeight: 700,
              color: R.coral,
              lineHeight: 0.6,
              textShadow: `0 0 0 ${R.white}`,
            }}
          >
            ,
          </div>
        </Pop>
      </div>

      <At y={820}>
        <Sticker
          text="ברוכים הבאים!"
          at={c.t("welcome")}
          color={R.blue}
          textColor={R.white}
          size={92}
          tilt={-3}
        />
      </At>
      <Burst at={c.t("welcome") + 4} x={540} y={900} count={40} spread={620} />
    </AbsoluteFill>
  );
};
