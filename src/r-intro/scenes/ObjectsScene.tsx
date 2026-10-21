import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodePanel } from "../components/CodePanel";
import { Headline } from "../components/Headline";
import { At, Row } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { sceneClock } from "../clock";
import { DISPLAY, HEBREW, MONO } from "../fonts";
import { R, SIZE, sec } from "../theme";

const c = sceneClock("objects-q");

/** A labelled card showing one data type and an example value. */
const TypeCard: React.FC<{
  readonly at: number;
  readonly name: string;
  readonly hebrew: string;
  readonly value: React.ReactNode;
  readonly color: string;
  readonly tilt?: number;
}> = ({ at, name, hebrew, value, color, tilt = 0 }) => (
  <Pop at={at} from="below" tilt={tilt} bounce={1.1}>
    <div
      style={{
        width: 440,
        height: 330,
        borderRadius: 34,
        background: R.white,
        boxShadow: `0 18px 40px ${R.ink}22, inset 0 -14px 0 ${color}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 40,
          fontWeight: 700,
          color,
          direction: "ltr",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 46,
          fontWeight: 700,
          color: R.ink,
          direction: "ltr",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: HEBREW,
          fontSize: 30,
          fontWeight: 600,
          color: R.inkSoft,
          direction: "rtl",
        }}
      >
        {hebrew}
      </div>
    </div>
  </Pop>
);

/** Objects, the four data types, print and class, and case sensitivity. */
export const ObjectsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase =
    frame >= c.t("case-note")
      ? "case"
      : frame >= c.t("print")
        ? "code"
        : frame >= c.t("four-types")
          ? "types"
          : "objects";
  const nameSlide = interpolate(
    frame,
    [c.after("objects", 1.2), c.after("objects", 1.8)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill>
      {phase === "objects" ? (
        <>
          <At y={220}>
            <Headline
              text="ומה בעצם נשמר בתוך R?"
              at={c.t("objects-q")}
              size={SIZE.heading}
            />
          </At>
          <At y={420}>
            <Sticker
              text="אובייקטים"
              at={c.t("objects")}
              color={R.blue}
              textColor={R.white}
              size={84}
              tilt={-2}
            />
          </At>
          <At y={720}>
            <Pop at={c.after("objects", 0.5)} from="scale">
              <div style={{ position: "relative", width: 420, height: 420 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 48,
                    background: R.yellow,
                    boxShadow: `0 0 0 8px ${R.white}, 0 20px 40px ${R.ink}2e`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: MONO,
                    fontSize: 150,
                    fontWeight: 700,
                    color: R.ink,
                  }}
                >
                  27
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: -40,
                    top: -50,
                    background: R.coral,
                    color: R.white,
                    fontFamily: MONO,
                    fontSize: 48,
                    fontWeight: 700,
                    padding: "10px 28px",
                    borderRadius: 20,
                    transform: `rotate(-8deg) scale(${nameSlide})`,
                    boxShadow: `0 0 0 6px ${R.white}`,
                    direction: "ltr",
                  }}
                >
                  age
                </div>
              </div>
            </Pop>
          </At>
          <At y={1260}>
            <Headline
              text="מידע שנותנים לו שם, כדי שנוכל לעבוד איתו"
              at={c.after("objects", 1.4)}
              size={50}
              mark={["שם"]}
              maxWidth={900}
            />
          </At>
        </>
      ) : null}

      {phase === "types" ? (
        <>
          <At y={200}>
            <Headline
              text="ארבעה סוגי נתונים חשובים"
              at={c.t("four-types")}
              size={SIZE.heading}
              mark={["ארבעה"]}
            />
          </At>
          <div
            style={{
              position: "absolute",
              left: 72,
              top: 420,
              width: 936,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              justifyItems: "center",
            }}
          >
            <TypeCard
              at={c.t("numeric")}
              name="numeric"
              hebrew="מספרים: גיל, זמן תגובה"
              value={
                <>
                  27
                  <br />
                  0.45
                </>
              }
              color={R.blue}
              tilt={-2}
            />
            <TypeCard
              at={c.t("character")}
              name="character"
              hebrew="טקסט: שם נבדק"
              value={'"Dana"'}
              color={R.coral}
              tilt={2}
            />
            <TypeCard
              at={c.t("logical")}
              name="logical"
              hebrew="אמת או שקר"
              value={
                <>
                  TRUE
                  <br />
                  FALSE
                </>
              }
              color={R.green}
              tilt={2}
            />
            <TypeCard
              at={c.t("date")}
              name="Date"
              hebrew="תאריך, גם לחישובים"
              value={"2026-10-21"}
              color={R.purple}
              tilt={-2}
            />
          </div>
          {frame >= c.t("char-string") && frame < c.t("logical") ? (
            <At y={1200}>
              <Row gap={30}>
                <Sticker
                  text='"A" = תו אחד'
                  at={c.t("char-string")}
                  color={R.coral}
                  textColor={R.white}
                  size={40}
                  tilt={-2}
                />
                <Sticker
                  text='"ABC" = סטרינג'
                  at={c.after("char-string", 1.6)}
                  color={R.coral}
                  textColor={R.white}
                  size={40}
                  tilt={2}
                />
              </Row>
              <div style={{ height: 30 }} />
              <Sticker
                text="ב-R שניהם: character"
                at={c.t("same-character")}
                color={R.yellow}
                size={44}
                tilt={-1}
              />
            </At>
          ) : null}
          {frame >= c.t("logical") ? (
            <At y={1200}>
              <Headline
                text={
                  frame >= c.t("date")
                    ? "ותאריך משמש גם לחישובים בין מועדים"
                    : "TRUE או FALSE, בלי מרכאות"
                }
                at={frame >= c.t("date") ? c.t("date") : c.t("logical")}
                size={46}
                weight={600}
                color={R.inkSoft}
              />
            </At>
          ) : null}
        </>
      ) : null}

      {phase === "code" ? (
        <>
          <At y={260}>
            <Headline
              text="להציג ערך · לבדוק סוג"
              at={c.t("print")}
              size={SIZE.heading}
            />
          </At>
          <At y={480}>
            <CodePanel
              at={c.t("print")}
              width={936}
              fontSize={46}
              lines={[
                { at: 6, text: "age <- 27" },
                { at: sec(0.9), text: "print(age)" },
                { at: sec(1.9), kind: "output", text: "[1] 27" },
                { at: c.t("class") - c.t("print") + 4, text: "class(age)" },
                {
                  at: c.t("class") - c.t("print") + sec(1.2),
                  kind: "output",
                  text: '[1] "numeric"',
                },
              ]}
            />
          </At>
          <At y={1040}>
            <Row gap={28}>
              <Sticker
                text="print() מציגה את הערך"
                at={c.after("print", 1.0)}
                color={R.blue}
                textColor={R.white}
                size={40}
                tilt={-2}
              />
              <Sticker
                text="class() מגלה את הסוג"
                at={c.after("class", 0.6)}
                color={R.green}
                textColor={R.white}
                size={40}
                tilt={2}
              />
            </Row>
          </At>
        </>
      ) : null}

      {phase === "case" ? (
        <>
          <At y={240}>
            <Headline
              text="ועוד פרט שחשוב לזכור"
              at={c.t("case-note")}
              size={SIZE.subheading}
              weight={600}
              color={R.inkSoft}
            />
          </At>
          <At y={380}>
            <Headline
              text="R מבדילה בין אותיות גדולות לקטנות"
              at={c.t("case")}
              size={60}
              mark={["מבדילה"]}
              maxWidth={900}
            />
          </At>
          <At y={700}>
            <Row gap={60}>
              <Pop at={c.t("big-x-small-x")} from="left" tilt={-4}>
                <div
                  style={{
                    width: 300,
                    height: 300,
                    borderRadius: 40,
                    background: R.blue,
                    color: R.white,
                    fontFamily: MONO,
                    fontSize: 200,
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
              <Pop at={c.after("big-x-small-x", 0.6)} from="scale">
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 120,
                    fontWeight: 700,
                    color: R.coral,
                  }}
                >
                  ≠
                </div>
              </Pop>
              <Pop at={c.after("big-x-small-x", 0.3)} from="right" tilt={4}>
                <div
                  style={{
                    width: 300,
                    height: 300,
                    borderRadius: 40,
                    background: R.yellow,
                    color: R.ink,
                    fontFamily: MONO,
                    fontSize: 200,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 0 8px ${R.white}`,
                  }}
                >
                  x
                </div>
              </Pop>
            </Row>
          </At>
          <At y={1080}>
            <Headline
              text="שני שמות שונים לגמרי"
              at={c.after("big-x-small-x", 1.2)}
              size={SIZE.subheading}
            />
          </At>
          <At y={1300}>
            <Sticker
              text="גיליתי את זה בדרך הקשה"
              at={c.t("hard-way")}
              color={R.coral}
              textColor={R.white}
              size={48}
              tilt={-3}
            />
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
