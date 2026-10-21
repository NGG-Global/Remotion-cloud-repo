import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At, Row } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { PANES, Screenshot } from "../graphics/Screenshot";
import { sceneClock } from "../clock";
import { MONO } from "../fonts";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("df-intro");

const COLUMNS = ["id", "gender", "age", "depression"] as const;
const ROWS = [
  ["1", "F", "24", "no"],
  ["2", "M", "31", "yes"],
  ["3", "F", "27", "no"],
  ["4", "F", "45", "yes"],
  ["5", "M", "19", "no"],
  ["6", "M", "38", "no"],
];
const COLUMN_COLORS = [R.blue, R.coral, R.green, R.purple];

/** The subjects table, built column by column with its header. */
const Table: React.FC<{
  readonly at: number;
  readonly rowAt: number;
  readonly highlightRow?: boolean;
  readonly highlightCol?: boolean;
  readonly typed?: boolean;
}> = ({ at, rowAt, highlightRow, highlightCol, typed }) => (
  <div style={{ display: "flex", gap: 10, direction: "ltr" }}>
    {COLUMNS.map((col, ci) => (
      <div
        key={col}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <Pop at={at + ci * 5} from="above">
          <div
            style={{
              width: 218,
              height: 84,
              borderRadius: 18,
              background: COLUMN_COLORS[ci],
              color: R.white,
              fontFamily: MONO,
              fontSize: 34,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                highlightCol && ci === 2 ? `0 0 0 8px ${R.yellow}` : "none",
            }}
          >
            {col}
          </div>
        </Pop>
        {ROWS.map((row, ri) => (
          <Pop key={ri} at={rowAt + ri * 4 + ci * 2} from="scale">
            <div
              style={{
                width: 218,
                height: 76,
                borderRadius: 16,
                background: highlightRow && ri === 1 ? R.yellow : R.white,
                fontFamily: MONO,
                fontSize: 34,
                fontWeight: 600,
                color: R.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  highlightCol && ci === 2
                    ? `0 0 0 8px ${R.yellow}`
                    : `0 4px 10px ${R.ink}18`,
              }}
            >
              {typed && ci === 2
                ? row[ci]
                : typed && ci === 1
                  ? `"${row[ci]}"`
                  : row[ci]}
            </div>
          </Pop>
        ))}
      </div>
    ))}
  </div>
);

/** Data frames: an Excel sheet of observations and variables. */
export const DataFrameScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase =
    frame >= c.t("env-click")
      ? "env"
      : frame >= c.t("data-frame-fn")
        ? "code"
        : frame >= c.t("six-subjects")
          ? "table"
          : frame >= c.t("excel")
            ? "excel"
            : "intro";
  const sheet = interpolate(frame, [c.t("excel"), c.t("excel") + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {phase === "intro" ? (
        <>
          <At y={260}>
            <Headline
              text="ועכשיו, אחד הכלים הכי שכיחים ב-R"
              at={c.t("df-intro")}
              size={SIZE.subheading}
              weight={600}
              color={R.inkSoft}
              maxWidth={900}
            />
          </At>
          <At y={520}>
            <Sticker
              text="Data Frame"
              latin
              at={c.t("df-name")}
              color={R.blue}
              textColor={R.white}
              size={100}
              tilt={-3}
            />
          </At>
          <At y={760}>
            <Headline
              text="טבלת נתונים"
              at={c.after("df-name", 0.9)}
              size={SIZE.heading}
              mark={["טבלת"]}
            />
          </At>
        </>
      ) : null}

      {phase === "excel" ? (
        <>
          <At y={220}>
            <Headline
              text="תחשבו על גיליון אקסל"
              at={c.t("excel")}
              size={SIZE.heading}
              mark={["אקסל"]}
            />
          </At>
          <At y={440}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 170px)",
                gap: 6,
                direction: "ltr",
                transform: `scale(${0.8 + sheet * 0.2})`,
                opacity: sheet,
              }}
            >
              {Array.from({ length: 35 }, (_, i) => {
                const r = Math.floor(i / 5);
                const col = i % 5;
                const rowHit = frame >= c.t("rows-cols") && r === 3;
                const colHit = frame >= c.after("rows-cols", 2.4) && col === 2;
                return (
                  <div
                    key={i}
                    style={{
                      height: 70,
                      background:
                        r === 0
                          ? R.green
                          : rowHit
                            ? R.yellow
                            : colHit
                              ? R.sky
                              : R.white,
                      border: `2px solid ${R.paperDeep}`,
                      borderRadius: 6,
                    }}
                  />
                );
              })}
            </div>
          </At>
          {frame >= c.t("rows-cols") ? (
            <At y={1040}>
              <Sticker
                text="שורה = תצפית"
                at={c.t("rows-cols")}
                color={R.yellow}
                size={48}
                tilt={-2}
              />
              <div style={{ height: 30 }} />
              <Sticker
                text="עמודה = משתנה (וקטור)"
                at={c.after("rows-cols", 2.4)}
                color={R.sky}
                size={48}
                tilt={2}
              />
            </At>
          ) : null}
        </>
      ) : null}

      {phase === "table" ? (
        <>
          <At y={200}>
            <Headline
              text="שישה נבדקים, ארבעה משתנים"
              at={c.t("six-subjects")}
              size={SIZE.subheading}
            />
          </At>
          <At y={360}>
            <Table
              at={c.after("six-subjects", 0.4)}
              rowAt={c.after("six-subjects", 1.6)}
              highlightCol={
                frame >= c.t("same-length") && frame < c.t("mixed-columns")
              }
              typed={frame >= c.t("mixed-columns")}
            />
          </At>
          {frame >= c.t("six-by-four") && frame < c.t("same-length") ? (
            <At y={1080}>
              <Sticker
                text="6 שורות × 4 עמודות"
                at={c.t("six-by-four")}
                color={R.ink}
                textColor={R.white}
                size={56}
                tilt={-2}
              />
            </At>
          ) : null}
          {frame >= c.t("same-length") && frame < c.t("mixed-columns") ? (
            <At y={1080}>
              <Headline
                text="כל העמודות באותו אורך"
                at={c.t("same-length")}
                size={52}
                mark={["אורך"]}
              />
            </At>
          ) : null}
          {frame >= c.t("mixed-columns") ? (
            <At y={1080}>
              <Headline
                text="אבל מסוגים שונים"
                at={c.t("mixed-columns")}
                size={52}
                mark={["שונים"]}
              />
              <div style={{ height: 24 }} />
              <Row gap={24}>
                <Sticker
                  text="age: numeric"
                  latin
                  at={c.after("mixed-columns", 1.2)}
                  color={R.green}
                  textColor={R.white}
                  size={38}
                  tilt={-2}
                />
                <Sticker
                  text="gender: character"
                  latin
                  at={c.after("mixed-columns", 2.2)}
                  color={R.coral}
                  textColor={R.white}
                  size={38}
                  tilt={2}
                />
              </Row>
            </At>
          ) : null}
        </>
      ) : null}

      {phase === "code" ? (
        <>
          <At y={220}>
            <Headline
              text="יוצרים עם data.frame()"
              at={c.t("data-frame-fn")}
              size={SIZE.heading}
              mark={["data.frame()"]}
            />
          </At>
          <At y={520}>
            <CodePanel
              at={c.t("data-frame-fn")}
              width={936}
              fontSize={38}
              charFrames={1}
              lines={[
                { at: 4, text: "df <- data.frame(id, gender," },
                { at: 30, text: "                 age, depression)" },
                {
                  at: c.t("print-view") - c.t("data-frame-fn"),
                  text: "print(df)",
                },
                {
                  at: c.t("print-view") - c.t("data-frame-fn") + sec(0.8),
                  kind: "output",
                  text: "  id gender age depression",
                },
                {
                  at: c.t("print-view") - c.t("data-frame-fn") + sec(0.9),
                  kind: "output",
                  text: "1  1      F  24         no",
                },
                {
                  at: c.t("print-view") - c.t("data-frame-fn") + sec(1.0),
                  kind: "output",
                  text: "2  2      M  31        yes",
                },
                {
                  at: c.t("print-view") - c.t("data-frame-fn") + sec(1.1),
                  kind: "output",
                  text: "3  3      F  27         no",
                },
                {
                  at: c.t("print-view") - c.t("data-frame-fn") + sec(3.6),
                  text: "View(df)",
                },
              ]}
            />
          </At>
          {frame >= c.after("print-view", 4.2) ? (
            <At y={1280}>
              <Sticker
                text="View עם V גדולה!"
                at={c.after("print-view", 4.2)}
                color={R.coral}
                textColor={R.white}
                size={50}
                tilt={-3}
              />
              <div style={{ height: 26 }} />
              <Headline
                text="פותחת את הטבלה בחלון נוח"
                at={c.after("print-view", 5.0)}
                size={46}
                weight={600}
                color={R.inkSoft}
              />
            </At>
          ) : null}
        </>
      ) : null}

      {phase === "env" ? (
        <>
          <At y={240}>
            <Headline
              text="או פשוט לחיצה ב-Environment"
              at={c.t("env-click")}
              size={56}
              mark={["לחיצה"]}
            />
          </At>
          <At y={480} x={60} w={960}>
            <Screenshot
              width={960}
              at={c.t("env-click") - 20}
              shots={[{ at: 0, region: PANES.environment, fill: 0.95 }]}
              spotlight={{ at: 12, region: PANES.values }}
            />
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
