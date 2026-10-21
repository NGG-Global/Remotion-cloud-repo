import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At, Row } from "../components/layout";
import { Sticker } from "../components/Sticker";
import { FileCard, Folder } from "../graphics/Folder";
import { sceneClock } from "../clock";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("projects");

/** Projects keep one study's files together; dir() lists what is there. */
export const ProjectsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase =
    frame >= c.t("dir") ? "dir" : frame >= c.t("two-projects") ? "two" : "one";

  return (
    <AbsoluteFill>
      <At y={200}>
        <Headline
          text="כדי לא ללכת לאיבוד בין קבצים"
          at={c.t("projects")}
          size={SIZE.subheading}
          weight={600}
          color={R.inkSoft}
        />
      </At>
      <At y={320}>
        <Sticker
          text="Projects"
          latin
          at={c.after("projects", 1.2)}
          color={R.blue}
          textColor={R.white}
          size={76}
          tilt={-2}
        />
      </At>

      {phase === "one" ? (
        <>
          <At y={600}>
            <Folder
              at={c.after("projects", 2.0)}
              label="הפרויקט שלי"
              width={520}
            >
              <Row gap={14}>
                <FileCard at={c.after("project-def", 0.4)} name="data.csv" />
                <FileCard at={c.after("project-def", 0.9)} name="analysis.R" />
                <FileCard
                  at={c.after("project-def", 1.4)}
                  name=".Rproj"
                  color={R.sky}
                />
              </Row>
            </Folder>
          </At>
          <At y={1120}>
            <Headline
              text="הקבצים וההגדרות של עבודה מסוימת, במקום אחד"
              at={c.after("project-def", 0.6)}
              size={48}
              mark={["אחד"]}
              maxWidth={880}
            />
          </At>
        </>
      ) : null}

      {phase === "two" ? (
        <>
          <At y={560}>
            <Row gap={48}>
              <Folder
                at={c.after("two-projects", 0.6)}
                label="מחקר זיכרון"
                width={400}
                tilt={-3}
                color={R.yellow}
              />
              <Folder
                at={c.after("two-projects", 1.6)}
                label="מחקר קשב"
                width={400}
                tilt={3}
                color={R.sky}
              />
            </Row>
          </At>
          <At y={1000}>
            <Headline
              text="פרויקט נפרד לכל מחקר"
              at={c.after("two-projects", 2.4)}
              size={SIZE.subheading}
              mark={["נפרד"]}
            />
          </At>
          <At y={1180}>
            <Sticker
              text="הסיכוי לערבב ביניהם קטן יותר"
              at={c.t("less-mixup")}
              color={R.green}
              textColor={R.white}
              size={44}
              tilt={-2}
            />
          </At>
          <At y={1370}>
            <Headline
              text="תיקיית הפרויקט = תיקיית העבודה הנוכחית"
              at={c.t("working-dir")}
              size={46}
              mark={["העבודה"]}
              maxWidth={900}
            />
          </At>
          <At y={1540}>
            <Sticker
              text="working directory"
              latin
              at={c.after("working-dir", 1.4)}
              color={R.ink}
              textColor={R.white}
              size={40}
              tilt={2}
            />
          </At>
        </>
      ) : null}

      {phase === "dir" ? (
        <>
          <At y={560}>
            <CodePanel
              at={c.t("dir")}
              width={936}
              lines={[
                { at: 4, text: "dir()" },
                {
                  at: sec(1.2),
                  kind: "output",
                  text: '[1] "analysis.R"  "data.csv"',
                },
                {
                  at: sec(1.2),
                  kind: "output",
                  text: '[3] "notes.txt"   "plots"',
                },
                { at: c.t("dir-dot") - c.t("dir"), text: 'dir(".")' },
                {
                  at: c.t("dir-dot") - c.t("dir") + sec(1.6),
                  kind: "output",
                  text: '[1] "analysis.R"  "data.csv"',
                },
                {
                  at: c.t("dir-dot") - c.t("dir") + sec(1.6),
                  kind: "output",
                  text: '[3] "notes.txt"   "plots"',
                },
              ]}
            />
          </At>
          <At y={1180}>
            <Headline
              text="מציגה את הקבצים והתיקיות שבתיקיית העבודה"
              at={c.after("dir", 0.6)}
              size={46}
              maxWidth={900}
            />
          </At>
          <At y={1400}>
            <Sticker
              text='"." = התיקייה הנוכחית'
              at={c.t("dot-meaning")}
              color={R.yellow}
              size={50}
              tilt={-2}
            />
          </At>
          <At y={1550}>
            <Sticker
              text="לא צריך את הנתיב המלא"
              at={c.after("dot-meaning", 1.5)}
              color={R.coral}
              textColor={R.white}
              size={42}
              tilt={2}
            />
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
