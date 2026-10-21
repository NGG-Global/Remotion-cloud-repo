import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Headline } from "../components/Headline";
import { At } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { RLogo } from "../graphics/RLogo";
import { sceneClock } from "../clock";
import { DISPLAY, HEBREW } from "../fonts";
import { R, SIZE } from "../theme";

const c = sceneClock("start");

const Stop: React.FC<{
  readonly at: number;
  readonly y: number;
  readonly year: string;
  readonly title: string;
  readonly detail?: string;
  readonly color: string;
}> = ({ at, y, year, title, detail, color }) => (
  <>
    <Pop
      at={at}
      from="scale"
      style={{ position: "absolute", left: 160 - 26, top: y - 26 }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          background: color,
          boxShadow: `0 0 0 8px ${R.white}, 0 8px 18px ${R.ink}33`,
        }}
      />
    </Pop>
    <Pop
      at={at + 3}
      from="right"
      style={{ position: "absolute", left: 240, top: y - 62, width: 770 }}
    >
      <div
        style={{
          background: R.white,
          borderRadius: 28,
          padding: "22px 34px",
          boxShadow: `0 16px 34px ${R.ink}22`,
          direction: "rtl",
          textAlign: "right",
          borderRight: `14px solid ${color}`,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 34,
            fontWeight: 700,
            color,
            direction: "ltr",
            textAlign: "right",
          }}
        >
          {year}
        </div>
        <div
          style={{
            fontFamily: HEBREW,
            fontSize: 44,
            fontWeight: 800,
            color: R.ink,
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
        {detail ? (
          <div
            style={{
              fontFamily: HEBREW,
              fontSize: 32,
              fontWeight: 500,
              color: R.inkSoft,
              lineHeight: 1.3,
              marginTop: 6,
            }}
          >
            {detail}
          </div>
        ) : null}
      </div>
    </Pop>
  </>
);

/** Where R comes from: S at Bell Labs, New Zealand, and version 1.0. */
export const HistoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lineGrow = interpolate(
    frame,
    [c.t("roots-s"), c.t("r-1") + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const introFade = interpolate(
    frame,
    [c.t("what-is-r") - 6, c.t("what-is-r")],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill>
      <At y={820} style={{ opacity: introFade }}>
        <Headline
          text="בואו נתחיל מההתחלה"
          at={c.t("start")}
          size={SIZE.heading}
        />
      </At>

      {frame >= c.t("what-is-r") ? (
        <>
          <At y={200}>
            <RLogo size={330} at={c.t("what-is-r")} />
          </At>
          <At y={560}>
            <Headline
              text="שפת תכנות לסטטיסטיקה ולניתוח נתונים"
              at={c.after("what-is-r", 0.6)}
              size={60}
              mark={["לסטטיסטיקה"]}
              maxWidth={900}
            />
          </At>
        </>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 154,
          top: 820,
          width: 12,
          height: 880 * lineGrow,
          borderRadius: 6,
          background: `linear-gradient(${R.muted}, ${R.blue})`,
        }}
      />
      <Stop
        at={c.t("roots-s")}
        y={880}
        year="1970s"
        title="השורשים: שפת S"
        detail="מעבדות Bell"
        color={R.purple}
      />
      <Stop
        at={c.t("new-zealand")}
        y={1130}
        year="1990s"
        title="גרסה חופשית מניו זילנד"
        detail="Ross Ihaka & Robert Gentleman"
        color={R.green}
      />
      <At y={1278} x={640} w={360}>
        <Sticker
          text="R"
          at={c.t("named-r")}
          latin
          color={R.blue}
          textColor={R.white}
          size={64}
          tilt={8}
        />
      </At>
      <Stop
        at={c.t("r-1")}
        y={1480}
        year="2000"
        title="גרסה 1.0 יוצאת לעולם"
        detail="והשפה ממשיכה להתפתח עם קהילת החוקרים"
        color={R.blue}
      />
      <At y={1660}>
        <div style={{ display: "flex", gap: 18 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <Pop
              key={i}
              at={c.after("r-1", 2.2) + i * 2}
              from="below"
              bounce={1.2}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  background: [R.blue, R.yellow, R.coral, R.green, R.purple][
                    i % 5
                  ],
                  boxShadow: `0 0 0 5px ${R.white}`,
                }}
              />
            </Pop>
          ))}
        </div>
      </At>
    </AbsoluteFill>
  );
};
