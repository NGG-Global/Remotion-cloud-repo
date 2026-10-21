import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { PANES, RSTUDIO, Screenshot } from "../graphics/Screenshot";
import { sceneClock } from "../clock";
import { DISPLAY } from "../fonts";
import { R, sec } from "../theme";

const c = sceneClock("four-panes");
const WIDTH = 960;
const LEFT = 60;
const TOP = 250;
const SCALE = WIDTH / RSTUDIO.width;

const NUMBERS = [
  { n: 1, region: PANES.editor, color: R.blue },
  { n: 2, region: PANES.console, color: R.coral },
  { n: 3, region: PANES.environment, color: R.green },
  { n: 4, region: PANES.files, color: R.purple },
];

/** The four panes of RStudio, filmed with a push-in on each one. */
export const PanesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const showNumbers = frame < c.t("source");
  const caption = (() => {
    if (frame >= c.t("fourth-pane")) return null;
    if (frame >= c.t("environment"))
      return {
        at: c.t("environment"),
        text: "Environment · מה שמור כרגע בזיכרון",
        mark: ["Environment"],
      };
    if (frame >= c.t("console"))
      return {
        at: c.t("console"),
        text: "Console · מריצים פקודות ורואים תוצאות",
        mark: ["Console"],
      };
    if (frame >= c.t("source"))
      return {
        at: c.t("source"),
        text: "Source Editor · כותבים קוד ושומרים אותו",
        mark: ["Source", "Editor"],
      };
    return {
      at: c.t("four-panes"),
      text: "ארבעה אזורים עיקריים",
      mark: ["ארבעה"],
    };
  })();

  return (
    <AbsoluteFill>
      <At y={TOP} x={LEFT} w={WIDTH}>
        <Screenshot
          width={WIDTH}
          at={c.t("four-panes") - 12}
          shots={[
            { at: c.t("source"), region: PANES.editor, fill: 0.95 },
            { at: c.t("console"), region: PANES.console, fill: 0.95 },
            { at: c.t("environment"), region: PANES.environment, fill: 0.95 },
            { at: c.t("fourth-pane"), region: PANES.files, fill: 0.95 },
          ]}
          spotlight={{
            at: c.after("environment", 1.4),
            region: PANES.values,
            until: c.t("fourth-pane"),
          }}
        />
      </At>

      {showNumbers
        ? NUMBERS.map(({ n, region, color }) => (
            <Pop
              key={n}
              at={c.after("four-panes", 0.6) + n * 5}
              from="scale"
              style={{
                position: "absolute",
                left: LEFT + (region.x + region.w / 2) * SCALE - 50,
                top: TOP + (region.y + region.h / 2) * SCALE - 50,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  background: color,
                  color: R.white,
                  fontFamily: DISPLAY,
                  fontSize: 60,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 0 8px ${R.white}, 0 12px 26px ${R.ink}44`,
                }}
              >
                {n}
              </div>
            </Pop>
          ))
        : null}

      {caption ? (
        <At y={880}>
          <Headline
            text={caption.text}
            at={caption.at}
            size={52}
            mark={caption.mark}
            maxWidth={936}
          />
        </At>
      ) : null}

      {frame >= c.t("two-plus-two") && frame < c.t("environment") ? (
        <At y={1060}>
          <CodePanel
            at={c.t("two-plus-two")}
            width={760}
            fontSize={56}
            lines={[
              { at: 4, text: "2 + 2" },
              { at: sec(1.1), kind: "output", text: "[1] 4" },
            ]}
          />
        </At>
      ) : null}

      {frame < c.t("environment") ? (
        <>
          <At y={1420}>
            <Sticker
              text="מרגש!"
              at={c.t("exciting")}
              color={R.yellow}
              size={56}
              tilt={-6}
            />
          </At>
          <At y={1560}>
            <Sticker
              text="אבל התחלה טובה"
              at={c.after("exciting", 0.9)}
              color={R.green}
              textColor={R.white}
              size={46}
              tilt={3}
            />
          </At>
        </>
      ) : null}

      {frame >= c.t("fourth-pane") ? (
        <>
          <At y={880}>
            <Headline
              text="והאזור הרביעי כולל לשוניות"
              at={c.t("fourth-pane")}
              size={52}
              mark={["הרביעי"]}
            />
          </At>
          <At y={1040} style={{ gap: 34 }}>
            <>
              <Sticker
                text="Files · קבצים ותיקיות"
                at={c.t("tab-files")}
                color={R.purple}
                textColor={R.white}
                size={40}
                tilt={-2}
                from="left"
              />
              <Sticker
                text="Plots · גרפים"
                at={c.t("tab-plots")}
                color={R.coral}
                textColor={R.white}
                size={40}
                tilt={2}
                from="right"
              />
              <Sticker
                text="Packages · חבילות"
                at={c.t("tab-packages")}
                color={R.blue}
                textColor={R.white}
                size={40}
                tilt={-2}
                from="left"
              />
              <Sticker
                text="Help · הסברים על פונקציות"
                at={c.t("tab-help")}
                color={R.green}
                textColor={R.white}
                size={40}
                tilt={2}
                from="right"
              />
            </>
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
