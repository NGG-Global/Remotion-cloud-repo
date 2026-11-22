import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { B, easeIn, easeOut, ramp, SANS, SERIF } from "../theme";

/**
 * The women, by name. No photographs: a name, the age and place where the
 * narration gives them, and what happened only in the words the narration
 * uses ("נרצחו", "שרדו", "נעלמה"). Each card arrives on its name.
 */

type Card = { t: number; name: string; meta?: string; status?: string; survivor?: boolean };
type Variant = { header?: string; headerT?: number; cards: Card[] };

const VARIANTS: Record<string, Variant> = {
  sammamish: {
    header: "לייק סממיש · 14 ביולי 1974",
    headerT: 0.2,
    cards: [
      { t: 0.4, name: "ג׳ניס אוט", meta: "בת 23" },
      { t: 3.6, name: "דניס נסלונד", meta: "בת 19" },
    ],
  },
  daronch: {
    header: "מארי, יוטה · 8 בנובמבר 1974",
    headerT: 0.2,
    cards: [{ t: 0.1, name: "קרול דה־רונץ׳", meta: "בת 18" }],
  },
  daronch2: {
    cards: [
      { t: 0.1, name: "קרול דה־רונץ׳", meta: "בת 18", status: "שרדה", survivor: true },
    ],
    header: "עדותה תהיה מהראיות החשובות נגדו",
    headerT: 1.2,
  },
  chiomega: {
    header: "טלהאסי · 15 בינואר 1978",
    headerT: 0.1,
    cards: [
      { t: 2.2, name: "מרגרט באומן", status: "נרצחה" },
      { t: 2.7, name: "ליסה לוי", status: "נרצחה" },
      { t: 6.0, name: "קרן צ׳נדלר", status: "שרדה", survivor: true },
      { t: 6.5, name: "קתי קליינר", status: "שרדה", survivor: true },
      { t: 10.8, name: "שריל תומאס", status: "שרדה", survivor: true },
    ],
  },
  leach: {
    header: "לייק סיטי, פלורידה · 9 בפברואר 1978",
    headerT: 0.2,
    cards: [{ t: 0.2, name: "קימברלי דיאן ליץ׳", meta: "בת 12" }],
  },
};

export const Cards: React.FC<{ variant: string }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const v = VARIANTS[variant] ?? VARIANTS.leach;
  const env = Math.min(easeOut(ramp(frame, 0, 12)), 1 - easeIn(ramp(frame, durationInFrames - 12, durationInFrames)));
  const many = v.cards.length > 2;
  return (
    <AbsoluteFill style={{ background: B.black, opacity: env, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 50% 50%, rgba(239,232,218,0.05), rgba(0,0,0,0.6))" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: many ? 34 : 50 }}>
        {v.header ? (
          <div
            style={{
              fontFamily: SANS,
              fontSize: 40,
              color: B.paperDim,
              direction: "rtl",
              opacity: easeOut(ramp(t, v.headerT ?? 0, (v.headerT ?? 0) + 0.6)),
              marginBottom: 10,
            }}
          >
            {v.header}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            direction: "rtl",
            gap: many ? "30px 40px" : 70,
            maxWidth: 1600,
          }}
        >
          {v.cards.map((c) => {
            const o = easeOut(ramp(t, c.t, c.t + 0.7));
            return (
              <div
                key={c.name}
                style={{
                  width: many ? 440 : 560,
                  padding: many ? "26px 30px" : "40px 44px",
                  borderTop: `3px solid ${c.survivor ? B.paperDim : B.ember}`,
                  background: "rgba(239,232,218,0.035)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  opacity: o,
                  transform: `translateY(${(1 - o) * 18}px)`,
                }}
              >
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: many ? 52 : 76, color: B.paper, direction: "rtl", lineHeight: 1.1 }}>
                  {c.name}
                </div>
                {c.meta ? (
                  <div style={{ fontFamily: SANS, fontSize: many ? 28 : 38, color: B.paperDim, direction: "rtl" }}>{c.meta}</div>
                ) : null}
                {c.status ? (
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: many ? 28 : 34,
                      color: c.survivor ? B.paper : B.ember,
                      direction: "rtl",
                      letterSpacing: 1,
                    }}
                  >
                    {c.status}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * The roll of names the narration reads near the end, each arriving as it is
 * spoken, then held while the narration speaks of their lives.
 */
const NAMES: { t: number; name: string }[] = [
  { t: 3.86, name: "לינדה אן הילי" },
  { t: 5.44, name: "דונה גייל מנסון" },
  { t: 7.14, name: "סוזן רנקורט" },
  { t: 8.58, name: "רוברטה קתלין פארקס" },
  { t: 10.48, name: "ברנדה קרול בול" },
  { t: 11.92, name: "ג׳ורג׳אן הוקינס" },
  { t: 13.38, name: "ג׳ניס אוט" },
  { t: 14.54, name: "דניס נסלונד" },
  { t: 15.78, name: "מליסה סמית׳" },
  { t: 17.0, name: "לורה איים" },
  { t: 18.18, name: "דברה קנט" },
  { t: 19.12, name: "קרין קמפבל" },
  { t: 20.36, name: "ג׳ולי קנינגהם" },
  { t: 21.56, name: "דניס אוליברסון" },
  { t: 22.86, name: "סוזן קרטיס" },
  { t: 24.12, name: "מרגרט באומן" },
  { t: 25.24, name: "ליסה לוי" },
  { t: 25.88, name: "קימברלי ליץ׳" },
];

export const Names: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const env = Math.min(easeOut(ramp(frame, 0, 20)), 1 - easeIn(ramp(frame, durationInFrames - 24, durationInFrames)));
  const others = easeOut(ramp(t, 26.6, 27.4));
  const settle = easeOut(ramp(t, 28.5, 31));
  return (
    <AbsoluteFill style={{ background: B.black, opacity: env, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 480px)",
          gap: "26px 40px",
          direction: "rtl",
          transform: `scale(${1 - 0.03 * settle})`,
        }}
      >
        {NAMES.map((n) => {
          const o = easeOut(ramp(t, n.t - 0.1, n.t + 0.5));
          const now = Math.exp(-Math.max(0, t - n.t) * 1.2);
          return (
            <div
              key={n.name}
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: 52,
                color: B.paper,
                textAlign: "center",
                opacity: o * (0.72 + 0.28 * now),
                textShadow: now > 0.3 ? `0 0 ${24 * now}px rgba(239,232,218,0.35)` : "none",
              }}
            >
              {n.name}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 50, fontFamily: SERIF, fontSize: 48, color: B.paperDim, opacity: others, direction: "rtl" }}>
        ואחרות
      </div>
    </AbsoluteFill>
  );
};
