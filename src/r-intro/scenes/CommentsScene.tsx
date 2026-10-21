import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At, Row } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { sceneClock } from "../clock";
import { HEBREW } from "../fonts";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("comments-intro");

/** Comments: what they are for, and the three kinds the course uses. */
export const CommentsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase =
    frame >= c.t("tidy")
      ? "tidy"
      : frame >= c.t("three-kinds")
        ? "kinds"
        : frame >= c.t("hash")
          ? "hash"
          : "intro";
  const d = (id: Parameters<typeof c.t>[0]) => c.t(id) - c.t("doc-header");

  return (
    <AbsoluteFill>
      {phase === "intro" ? (
        <>
          <At y={300}>
            <Headline
              text="לפני שמסיימים, עוד דבר חשוב"
              at={c.t("comments-intro")}
              size={SIZE.subheading}
              weight={600}
              color={R.inkSoft}
            />
          </At>
          <At y={520}>
            <Sticker
              text="Comments"
              latin
              at={c.t("comments")}
              color={R.ink}
              textColor={R.white}
              size={96}
              tilt={-3}
            />
          </At>
          <At y={760}>
            <Headline
              text="הערות קוד"
              at={c.after("comments", 0.9)}
              size={SIZE.heading}
              mark={["הערות"]}
            />
          </At>
        </>
      ) : null}

      {phase === "hash" ? (
        <>
          <At y={220}>
            <Headline
              text="הערה מתחילה בסולמית"
              at={c.t("hash")}
              size={SIZE.heading}
              mark={["בסולמית"]}
            />
          </At>
          <At y={420}>
            <CodePanel
              at={c.t("hash")}
              width={936}
              fontSize={42}
              lines={[
                { at: 4, text: "# compute the mean score" },
                { at: sec(2.0), text: "mean(scores)" },
                { at: sec(3.0), kind: "output", text: "[1] 4" },
              ]}
            />
          </At>
          <At y={820}>
            <Sticker
              text="מיועדת למי שקורא את הקוד"
              at={c.after("hash", 2.5)}
              color={R.yellow}
              size={42}
              tilt={-2}
            />
          </At>
          <At y={960}>
            <Sticker
              text="R לא מריצה אותה"
              at={c.t("r-ignores")}
              color={R.coral}
              textColor={R.white}
              size={48}
              tilt={2}
            />
          </At>
          {frame >= c.t("not-every-line") ? (
            <At y={1160}>
              <Headline
                text="אבל לא מסבירים כל שורה ושורה"
                at={c.t("not-every-line")}
                size={50}
                mark={["לא"]}
              />
              {frame >= c.t("clear-names") ? (
                <>
                  <div style={{ height: 24 }} />
                  <Headline
                    text="קוד כתוב היטב, עם שמות ברורים, מובן גם בלי הסברים"
                    at={c.t("clear-names")}
                    size={44}
                    weight={600}
                    color={R.inkSoft}
                    maxWidth={900}
                  />
                </>
              ) : null}
            </At>
          ) : null}
        </>
      ) : null}

      {phase === "kinds" ? (
        <>
          <At y={200}>
            <Headline
              text="שלושה סוגי הערות בקורס"
              at={c.t("three-kinds")}
              size={SIZE.heading}
              mark={["שלושה"]}
            />
          </At>
          <At y={400}>
            <CodePanel
              at={c.t("doc-header") - 10}
              title="analysis.R"
              width={936}
              fontSize={34}
              charFrames={0.8}
              lines={[
                { at: 6, text: "# Course: Intro to R" },
                { at: 26, text: "# Week: 1" },
                { at: 40, text: "# Author: Dana Levi" },
                { at: 56, text: "# ID: 123456789" },
                { at: d("main-title") + 4, text: "" },
                { at: d("main-title") + 6, text: "#### CREATE DATA ####" },
                { at: d("sub-headings") + 4, text: "" },
                { at: d("sub-headings") + 6, text: "# 1. create" },
                {
                  at: d("sub-headings") + 40,
                  text: "df <- data.frame(id, age)",
                },
                { at: d("sub-headings") + 90, text: "# 2. save" },
                {
                  at: d("sub-headings") + 120,
                  text: 'write.csv(df, "study.csv")',
                },
              ]}
            />
          </At>
          <At y={1230}>
            {frame < c.t("main-title") ? (
              <Sticker
                text="1 · תיעוד בתחילת הסקריפט"
                at={c.after("doc-header", 0.4)}
                color={R.blue}
                textColor={R.white}
                size={42}
                tilt={-2}
              />
            ) : frame < c.t("sub-headings") ? (
              <Sticker
                text="2 · כותרת ראשית באותיות גדולות"
                at={c.t("main-title")}
                color={R.purple}
                textColor={R.white}
                size={42}
                tilt={2}
              />
            ) : (
              <Sticker
                text="3 · כותרות משנה ממוספרות"
                at={c.t("sub-headings")}
                color={R.green}
                textColor={R.white}
                size={42}
                tilt={-2}
              />
            )}
            <div style={{ height: 26 }} />
            {frame < c.t("main-title") ? (
              <Headline
                text="שם הקורס, השבוע, הכותב ומספר הזהות"
                at={c.after("doc-header", 1.6)}
                size={40}
                weight={600}
                color={R.inkSoft}
              />
            ) : frame < c.t("sub-headings") ? (
              <Headline
                text="ארבע סולמיות לפני ואחרי"
                at={c.after("main-title", 2.6)}
                size={44}
                weight={600}
                color={R.inkSoft}
              />
            ) : (
              <Headline
                text="סולמית אחת ומילת פעולה קצרה"
                at={c.after("sub-headings", 2.0)}
                size={44}
                weight={600}
                color={R.inkSoft}
              />
            )}
          </At>
        </>
      ) : null}

      {phase === "tidy" ? (
        <>
          <At y={300}>
            <Headline
              text="בקיצור, אנחנו רוצים"
              at={c.t("tidy")}
              size={SIZE.subheading}
              weight={600}
              color={R.inkSoft}
            />
          </At>
          <At y={460}>
            <Sticker
              text="קוד מסודר"
              at={c.after("tidy", 0.5)}
              color={R.green}
              textColor={R.white}
              size={84}
              tilt={-3}
            />
          </At>
          <At y={740}>
            <Row gap={20}>
              <Pop at={c.after("tidy", 1.8)} from="below" tilt={4}>
                <div
                  style={{
                    position: "relative",
                    fontFamily: HEBREW,
                    fontSize: 46,
                    fontWeight: 700,
                    color: R.inkSoft,
                    background: R.white,
                    borderRadius: 24,
                    padding: "20px 36px",
                    direction: "rtl",
                    boxShadow: `0 12px 26px ${R.ink}1e`,
                  }}
                >
                  200 עמודי פרשנות על כל שורה
                  <div
                    style={{
                      position: "absolute",
                      left: -10,
                      right: -10,
                      top: "50%",
                      height: 12,
                      background: R.coral,
                      borderRadius: 6,
                      transform: "rotate(-6deg)",
                    }}
                  />
                </div>
              </Pop>
            </Row>
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
