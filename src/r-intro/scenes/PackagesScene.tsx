import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Headline } from "../components/Headline";
import { At, Row } from "../components/layout";
import { Pop } from "../components/Pop";
import { Sticker } from "../components/Sticker";
import { sceneClock } from "../clock";
import { DISPLAY } from "../fonts";
import { R, SIZE } from "../theme";

const c = sceneClock("packages-q");

const APPS = [
  R.coral,
  R.blue,
  R.green,
  R.yellow,
  R.purple,
  R.sky,
  R.blueLit,
  R.coral,
  R.green,
  R.yellow,
  R.purple,
  R.blue,
];

/** A cardboard box with tools inside: the package metaphor. */
const PackageBox: React.FC<{
  readonly at: number;
  readonly label: string;
  readonly color: string;
  readonly size?: number;
}> = ({ at, label, color, size = 220 }) => (
  <Pop at={at} from="below" bounce={1.1}>
    <div style={{ position: "relative", width: size, height: size * 0.9 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: size * 0.62,
          background: color,
          borderRadius: size * 0.08,
          boxShadow: `0 0 0 6px ${R.white}, 0 14px 30px ${R.ink}2e`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -size * 0.04,
          right: -size * 0.04,
          top: size * 0.18,
          height: size * 0.16,
          background: color,
          filter: "brightness(1.15)",
          borderRadius: size * 0.05,
          boxShadow: `0 0 0 6px ${R.white}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: size * 0.14,
          fontFamily: DISPLAY,
          fontSize: size * 0.19,
          fontWeight: 700,
          color: R.white,
          direction: "ltr",
        }}
      >
        {label}
      </div>
    </div>
  </Pop>
);

/** Packages: tool boxes, phone apps, base, CRAN, and the week-one caveat. */
export const PackagesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phase =
    frame >= c.t("week-one-note")
      ? "note"
      : frame >= c.t("cran")
        ? "cran"
        : frame >= c.t("base")
          ? "base"
          : frame >= c.t("phone-apps")
            ? "phone"
            : "box";
  const rain = interpolate(
    frame,
    [c.t("cran-1997"), c.t("cran-1997") + 50],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill>
      <At y={200}>
        <Headline
          text="מהן חבילות?"
          at={c.t("packages-q")}
          size={SIZE.display}
          mark={["חבילות?"]}
        />
      </At>

      {phase === "box" || phase === "phone" ? (
        <At y={420}>
          <Headline
            text="אוספים של פונקציות וכלים שמוסיפים יכולות ל-R"
            at={c.t("packages")}
            size={50}
            weight={600}
            color={R.inkSoft}
            maxWidth={900}
          />
        </At>
      ) : null}

      {phase === "box" ? (
        <At y={720}>
          <Row gap={40}>
            <PackageBox
              at={c.after("packages", 0.6)}
              label="tools"
              color={R.blue}
            />
            <PackageBox
              at={c.after("packages", 1.3)}
              label="functions"
              color={R.coral}
            />
            <PackageBox
              at={c.after("packages", 2.0)}
              label="data"
              color={R.green}
            />
          </Row>
        </At>
      ) : null}

      {phase === "phone" ? (
        <>
          <At y={660}>
            <Pop at={c.t("phone-apps")} from="below">
              <div
                style={{
                  width: 440,
                  height: 760,
                  borderRadius: 64,
                  background: R.ink,
                  padding: 26,
                  boxShadow: `0 0 0 8px ${R.white}, 0 24px 50px ${R.ink}44`,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 44,
                    background: `linear-gradient(160deg, ${R.sky}, ${R.paper})`,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 22,
                    padding: 40,
                    alignContent: "start",
                  }}
                >
                  {APPS.map((color, i) => (
                    <Pop
                      key={i}
                      at={c.after("phone-apps", 0.5) + i * 3}
                      from="scale"
                      bounce={1.2}
                    >
                      <div
                        style={{
                          width: 92,
                          height: 92,
                          borderRadius: 24,
                          background: color,
                          boxShadow: `0 6px 14px ${R.ink}33`,
                        }}
                      />
                    </Pop>
                  ))}
                </div>
              </div>
            </Pop>
          </At>
          <At y={1480}>
            <Sticker
              text="כמו אפליקציות שמרחיבות את הטלפון"
              at={c.after("phone-apps", 0.8)}
              color={R.yellow}
              size={40}
              tilt={-2}
            />
          </At>
        </>
      ) : null}

      {phase === "base" ? (
        <>
          <At y={600}>
            <PackageBox
              at={c.t("base")}
              label="base"
              color={R.blue}
              size={300}
            />
          </At>
          <At y={930}>
            <Sticker
              text="מגיעה עם R · יכולות יסוד"
              at={c.after("base", 0.7)}
              color={R.blue}
              textColor={R.white}
              size={42}
              tilt={2}
            />
          </At>
          <At y={1120}>
            <Row gap={26}>
              {["ggplot2", "dplyr", "psych", "lme4", "tidyr"].map((name, i) => (
                <Sticker
                  key={name}
                  text={name}
                  latin
                  at={c.after("more-packages", 0.3) + i * 7}
                  color={[R.coral, R.green, R.purple, R.yellow, R.sky][i]}
                  textColor={i === 3 || i === 4 ? R.ink : R.white}
                  size={40}
                  tilt={i % 2 ? 4 : -4}
                />
              ))}
            </Row>
          </At>
          <At y={1420}>
            <Headline
              text="מוסיפים לפי הצורך, וכל אחד יכול ליצור חבילה משלו"
              at={c.after("more-packages", 2.2)}
              size={46}
              weight={600}
              color={R.inkSoft}
              maxWidth={900}
            />
          </At>
        </>
      ) : null}

      {phase === "cran" ? (
        <>
          <At y={560}>
            <Sticker
              text="CRAN"
              latin
              at={c.t("cran")}
              color={R.ink}
              textColor={R.white}
              size={110}
              tilt={-3}
            />
          </At>
          <At y={800}>
            <Headline
              text="המאגר המרכזי להפצת חבילות"
              at={c.after("cran", 0.6)}
              size={52}
              mark={["המרכזי"]}
            />
          </At>
          <At y={980}>
            <Sticker
              text="קיים מאז 1997"
              at={c.t("cran-1997")}
              color={R.yellow}
              size={46}
              tilt={3}
            />
          </At>
          <div
            style={{
              position: "absolute",
              left: 72,
              top: 1150,
              width: 936,
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              justifyContent: "center",
            }}
          >
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 90,
                  height: 64,
                  borderRadius: 12,
                  background: APPS[i % APPS.length],
                  opacity: rain * 40 > i ? 1 : 0,
                  transform: `translateY(${rain * 40 > i ? 0 : -40}px)`,
                  boxShadow: `0 0 0 4px ${R.white}`,
                }}
              />
            ))}
          </div>
          <At y={1600}>
            <Headline
              text="אלפי חבילות, בחינם"
              at={c.after("cran-1997", 1.6)}
              size={46}
              weight={600}
              color={R.inkSoft}
            />
          </At>
        </>
      ) : null}

      {phase === "note" ? (
        <>
          <At y={620}>
            <Sticker
              text="השבוע הראשון"
              at={c.t("week-one-note")}
              color={R.blue}
              textColor={R.white}
              size={56}
              tilt={-2}
            />
          </At>
          <At y={820}>
            <Headline
              text="רק מכירים את הרעיון"
              at={c.after("week-one-note", 0.8)}
              size={SIZE.heading}
              mark={["הרעיון"]}
            />
          </At>
          <At y={1020}>
            <Sticker
              text="בלי להתקין חבילות נוספות"
              at={c.after("week-one-note", 2.4)}
              color={R.coral}
              textColor={R.white}
              size={46}
              tilt={3}
            />
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
