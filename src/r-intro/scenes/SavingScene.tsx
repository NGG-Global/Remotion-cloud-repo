import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At, Row } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { PythonLogo } from "../graphics/PythonLogo";
import { sceneClock } from "../clock";
import { DISPLAY, MONO } from "../fonts";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("saving-q");

/** A file icon with a folded corner and a format badge. */
const FileIcon: React.FC<{
  readonly at: number;
  readonly label: string;
  readonly color: string;
  readonly tilt?: number;
  readonly children?: React.ReactNode;
}> = ({ at, label, color, tilt = 0, children }) => (
  <Pop at={at} from="below" tilt={tilt} bounce={1.1}>
    <div style={{ position: "relative", width: 340, height: 420 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: R.white,
          borderRadius: 30,
          clipPath: "polygon(0 0, 72% 0, 100% 16%, 100% 100%, 0 100%)",
          boxShadow: `0 18px 40px ${R.ink}22`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 95,
          height: 68,
          background: R.paperDeep,
          borderRadius: "0 30px 0 24px",
          clipPath: "polygon(0 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: 110,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "stretch",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          bottom: 22,
          right: 20,
          background: color,
          color: R.white,
          fontFamily: DISPLAY,
          fontSize: 56,
          fontWeight: 700,
          borderRadius: 20,
          textAlign: "center",
          padding: "8px 0",
          direction: "ltr",
        }}
      >
        {label}
      </div>
    </div>
  </Pop>
);

const Line: React.FC<{ readonly text: string; readonly at: number }> = ({
  text,
  at,
}) => (
  <Pop at={at} from="left">
    <div
      style={{
        fontFamily: MONO,
        fontSize: 24,
        color: R.ink,
        direction: "ltr",
        background: R.paper,
        borderRadius: 8,
        padding: "4px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </Pop>
);

/** Saving a table: RData keeps R objects, CSV travels anywhere. */
export const SavingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase =
    frame >= c.t("write-csv")
      ? "csv-code"
      : frame >= c.t("csv")
        ? "csv"
        : frame >= c.t("save-load")
          ? "rdata-code"
          : "formats";

  return (
    <AbsoluteFill>
      {phase === "formats" ? (
        <>
          <At y={220}>
            <Headline
              text="יצרנו טבלה. איך שומרים אותה?"
              at={c.t("saving-q")}
              size={SIZE.heading}
              mark={["שומרים"]}
              maxWidth={900}
            />
          </At>
          <At y={520}>
            <Row gap={60}>
              <FileIcon
                at={c.t("two-formats")}
                label="RData"
                color={R.blue}
                tilt={-3}
              >
                {frame >= c.t("rdata") ? (
                  <>
                    <Line at={c.after("rdata", 0.3)} text="df  <data.frame>" />
                    <Line at={c.after("rdata", 0.9)} text="age <numeric>" />
                    <Line
                      at={c.after("rdata", 1.5)}
                      text="gender <character>"
                    />
                  </>
                ) : null}
              </FileIcon>
              <FileIcon
                at={c.after("two-formats", 0.7)}
                label="CSV"
                color={R.green}
                tilt={3}
              />
            </Row>
          </At>
          {frame >= c.t("rdata") ? (
            <At y={1040}>
              <Headline
                text="RData שומר אובייקטים של R"
                at={c.t("rdata")}
                size={52}
                mark={["RData"]}
              />
              <div style={{ height: 24 }} />
              <Sticker
                text="עם השמות וסוגי הנתונים שלהם"
                at={c.after("rdata", 1.8)}
                color={R.blue}
                textColor={R.white}
                size={40}
                tilt={-2}
              />
            </At>
          ) : (
            <At y={1040}>
              <Headline
                text="שני פורמטים"
                at={c.after("two-formats", 1.2)}
                size={SIZE.subheading}
                weight={600}
                color={R.inkSoft}
              />
            </At>
          )}
        </>
      ) : null}

      {phase === "rdata-code" ? (
        <>
          <At y={240}>
            <Headline
              text="save() שומרת, load() טוענת בחזרה"
              at={c.t("save-load")}
              size={54}
              mark={["save()", "load()"]}
              maxWidth={900}
            />
          </At>
          <At y={480}>
            <CodePanel
              at={c.t("save-load")}
              width={936}
              fontSize={42}
              charFrames={1.1}
              lines={[
                { at: 4, text: 'save(df, file = "study.RData")' },
                { at: sec(2.6), text: 'load("study.RData")' },
                {
                  at: sec(4.2),
                  kind: "output",
                  text: "# df is back, same name, same types",
                },
              ]}
            />
          </At>
          <At y={960}>
            <Sticker
              text="חוזרים בשמות המקוריים"
              at={c.after("save-load", 3.6)}
              color={R.yellow}
              size={44}
              tilt={-2}
            />
          </At>
        </>
      ) : null}

      {phase === "csv" ? (
        <>
          <At y={220}>
            <Headline
              text="CSV: קובץ טקסט טבלאי"
              at={c.t("csv")}
              size={SIZE.heading}
              mark={["CSV:"]}
            />
          </At>
          <At y={440}>
            <FileIcon at={c.t("csv")} label="CSV" color={R.green}>
              <Line at={c.after("csv", 0.8)} text="id,gender,age" />
              <Line at={c.after("csv", 1.3)} text="1,F,24" />
              <Line at={c.after("csv", 1.7)} text="2,M,31" />
              <Line at={c.after("csv", 2.1)} text="3,F,27" />
            </FileIcon>
          </At>
          <At y={900}>
            <Sticker
              text="ערכים מופרדים בפסיקים"
              at={c.after("csv", 2.4)}
              color={R.green}
              textColor={R.white}
              size={44}
              tilt={2}
            />
          </At>
          {frame >= c.t("csv-open") ? (
            <>
              <At y={1080}>
                <Headline
                  text="נפתח גם בתוכנות אחרות"
                  at={c.t("csv-open")}
                  size={52}
                  mark={["אחרות"]}
                />
              </At>
              <At y={1240}>
                <Row gap={50}>
                  <Pop at={c.after("csv-open", 1.2)} from="left" tilt={-4}>
                    <div
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 30,
                        background: "#1d6f42",
                        color: R.white,
                        fontFamily: DISPLAY,
                        fontSize: 100,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 0 8px ${R.white}`,
                      }}
                    >
                      X
                    </div>
                  </Pop>
                  <PythonLogo size={160} at={c.after("csv-open", 2.0)} />
                </Row>
              </At>
            </>
          ) : null}
        </>
      ) : null}

      {phase === "csv-code" ? (
        <>
          <At y={220}>
            <Headline
              text="לכתוב ולקרוא CSV"
              at={c.t("write-csv")}
              size={SIZE.heading}
            />
          </At>
          <At y={420}>
            <CodePanel
              at={c.t("write-csv")}
              width={936}
              fontSize={38}
              charFrames={1}
              lines={[
                { at: 4, text: 'write.csv(df, "study.csv")' },
                {
                  at: c.t("read-csv") - c.t("write-csv"),
                  text: 'df <- read.csv("study.csv")',
                },
                {
                  at: c.t("row-names") - c.t("write-csv"),
                  text: 'write.csv(df, "study.csv",',
                },
                {
                  at: c.t("row-names") - c.t("write-csv") + 26,
                  text: "          row.names = FALSE)",
                },
              ]}
            />
          </At>
          {frame >= c.t("read-csv") && frame < c.t("row-names") ? (
            <At y={900}>
              <Headline
                text="read.csv מחזירה טבלה שאפשר לשייך למשתנה"
                at={c.t("read-csv")}
                size={46}
                mark={["read.csv"]}
                maxWidth={900}
              />
            </At>
          ) : null}
          {frame >= c.t("row-names") && frame < c.t("name-only") ? (
            <At y={900}>
              <Sticker
                text="row.names = FALSE"
                latin
                at={c.after("row-names", 0.8)}
                color={R.coral}
                textColor={R.white}
                size={44}
                tilt={-2}
              />
              <div style={{ height: 24 }} />
              <Headline
                text="בלי עמודה נוספת של מספרי שורות"
                at={c.after("row-names", 1.6)}
                size={46}
                weight={600}
                color={R.inkSoft}
              />
            </At>
          ) : null}
          {frame >= c.t("name-only") ? (
            <At y={900}>
              <Headline
                text="רק שם קובץ, בלי נתיב?"
                at={c.t("name-only")}
                size={52}
              />
              <div style={{ height: 24 }} />
              <Sticker
                text="R עובדת עם תיקיית העבודה הנוכחית"
                at={c.after("name-only", 1.8)}
                color={R.yellow}
                size={42}
                tilt={2}
              />
            </At>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
