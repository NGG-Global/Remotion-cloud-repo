import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { B, easeIn, easeInOut, easeOut, ramp, SANS, SERIF, SERIF_LATIN } from "../theme";

/**
 * Typographic beats: the narration's own words and figures, set one line at
 * a time on the phrase that says them. Nothing here is a reproduction of a
 * real document or newspaper.
 */

type Style = "title" | "big" | "body" | "muted" | "accent" | "latin" | "label";
type Line = {
  t: number;
  text: string;
  style?: Style;
  /** Seconds at which the line is struck through. */
  strike?: number;
  /** Seconds at which the line dims (superseded). */
  dim?: number;
  tick?: boolean;
};
type Variant = {
  lines: Line[];
  /** Over footage: no panel, lines shadowed. */
  over?: boolean;
  top?: { t: number; text: string };
  note?: { t: number; text: string };
};

const VARIANTS: Record<string, Variant> = {
  birth: {
    top: { t: 0.1, text: "פרק I · ילד בשם תיאודור" },
    lines: [
      { t: 0.4, text: "תיאודור רוברט קאוול", style: "title" },
      { t: 1.8, text: "24 בנובמבר 1946", style: "accent" },
      { t: 3.6, text: "ברלינגטון, ורמונט", style: "body" },
    ],
  },
  family: {
    lines: [
      { t: 0.3, text: "אם: אלנור לואיז קאוול", style: "title" },
      { t: 5.8, text: "אב: זהותו לא הוכחה באופן חד־משמעי", style: "body" },
    ],
  },
  family2: {
    top: { t: 0.1, text: "פילדלפיה, בבית הסבא והסבתא" },
    lines: [
      { t: 0.9, text: "הסבא והסבתא — הוצגו לעיתים כהוריו", style: "body" },
      { t: 4.8, text: "אמו — הוצגה כאחותו הגדולה", style: "accent" },
    ],
  },
  rename: {
    lines: [
      { t: 0.2, text: "תיאודור רוברט קאוול", style: "title", strike: 3.8, dim: 3.8 },
      { t: 1.9, text: "ג׳וני בנדי מאמץ את הילד · 1951", style: "muted" },
      { t: 7.0, text: "טד בנדי", style: "big" },
    ],
  },
  versions: {
    lines: [
      { t: 0.1, text: "״ילדות רגילה יחסית״", style: "body", dim: 4.4 },
      { t: 0.5, text: "״בדידות, מבוכה, קושי להשתלב״", style: "body", dim: 4.4 },
      { t: 4.5, text: "המקור לשתי הגרסאות: בנדי עצמו", style: "accent" },
    ],
  },
  stranger: {
    lines: [
      { t: 0.2, text: "אן רול", style: "title" },
      { t: 1.4, text: "עבדה לצידו במוקד הסיוע במשבר", style: "muted" },
      { t: 3.1, text: "The Stranger Beside Me", style: "latin" },
      { t: 4.0, text: "ספרה עליו, 1980", style: "muted" },
    ],
  },
  ruse: {
    over: true,
    lines: [
      { t: 0.4, text: "״אפשר לעזור לי?״", style: "big" },
      { t: 3.2, text: "מעמיד פנים שהוא פצוע", style: "body" },
      { t: 5.2, text: "מתקשה לסחוב חפץ", style: "body" },
    ],
  },
  checklist: {
    top: { t: 0.1, text: "אליזבת קלופפר מבחינה בדמיון" },
    lines: [
      { t: 0.2, text: "פולקסווגן ביטל", style: "body", tick: true },
      { t: 2.5, text: "השם טד", style: "body", tick: true },
      { t: 4.6, text: "פרטים נוספים בהתנהגותו", style: "body", tick: true },
    ],
  },
  items: {
    top: { t: 0.1, text: "בחיפוש ברכב" },
    lines: [
      { t: 2.0, text: "אזיקים", style: "title" },
      { t: 2.6, text: "חבל", style: "title" },
      { t: 3.1, text: "פריטים נוספים", style: "body" },
    ],
  },
  bitemark: {
    lines: [
      { t: 0.2, text: "ראיית סימני הנשיכה", style: "title" },
      { t: 3.2, text: "עדות מומחה במשפט, 1979", style: "body" },
      { t: 7.0, text: "השוואה לשיניו של בנדי", style: "muted" },
    ],
  },
  bitemark2: {
    top: { t: 0.1, text: "היום" },
    lines: [
      { t: 0.2, text: "שיטה בעלת מגבלות מדעיות חמורות", style: "title" },
      { t: 3.2, text: "אינה ראיה אמינה כפי שהוצגה במשפטים רבים", style: "body" },
      { t: 7.8, text: "אבל ב־1979: ראיה משמעותית לחבר המושבעים", style: "accent" },
    ],
  },
  marriage: {
    lines: [
      { t: 0.1, text: "קרול אן בון", style: "title" },
      { t: 1.8, text: "האמינה בחפותו", style: "muted" },
      { t: 4.2, text: "הצעת נישואים, במהלך עדותה בבית המשפט", style: "body" },
      { t: 9.7, text: "הוכרו כנשואים · 1980", style: "accent" },
      { t: 10.6, text: "בהמשך נולדה להם בת", style: "muted" },
    ],
  },
  unreliable: {
    top: { t: 0.2, text: "בנדי כמקור מידע" },
    lines: [
      { t: 5.2, text: "שיקר פעמים רבות", style: "body" },
      { t: 6.8, text: "שינה גרסאות", style: "body" },
      { t: 8.3, text: "היה לו אינטרס: לדחות את ההוצאה להורג", style: "accent" },
      { t: 15.5, text: "חלק מהפרטים אומתו", style: "muted" },
      { t: 17.5, text: "אחרים נותרו בלתי מוכחים", style: "muted" },
      { t: 19.7, text: "וחלק מהשאלות — בלי תשובה", style: "title" },
    ],
  },
  claim: {
    lines: [
      { t: 0.2, text: "הטענה שלו: פורנוגרפיה אלימה השפיעה עליו", style: "title" },
      { t: 4.6, text: "אין ראיות שגורם יחיד מסביר את מעשיו", style: "body" },
      { t: 9.4, text: "אולי ניסיון להסביר את עצמו", style: "muted" },
      { t: 11.8, text: "אולי ניסיון להעביר את האחריות", style: "muted" },
      { t: 18.3, text: "אין כאן הסבר מדעי מוכח", style: "accent" },
    ],
  },
  exploited: {
    over: true,
    top: { t: 0.0, text: "מה שבנדי ניצל" },
    lines: [
      { t: 0.1, text: "אמון", style: "title" },
      { t: 1.4, text: "מוסכמות חברתיות", style: "title" },
      { t: 3.6, text: "סמכות", style: "title" },
      { t: 7.4, text: "בקשה לעזרה", style: "title" },
    ],
  },
};

const STYLE: Record<Style, React.CSSProperties> = {
  title: { fontFamily: SERIF, fontWeight: 600, fontSize: 76, color: B.paper },
  big: { fontFamily: SERIF, fontWeight: 600, fontSize: 132, color: B.paper },
  body: { fontFamily: SANS, fontWeight: 400, fontSize: 48, color: B.paper },
  muted: { fontFamily: SANS, fontWeight: 400, fontSize: 38, color: B.paperDim },
  accent: { fontFamily: SANS, fontWeight: 600, fontSize: 48, color: B.ember },
  latin: { fontFamily: SERIF_LATIN, fontStyle: "italic", fontSize: 64, color: B.paper, direction: "ltr" },
  label: { fontFamily: SANS, fontSize: 32, color: B.paperDim },
};

export const TextStack: React.FC<{ variant: string }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const v = VARIANTS[variant] ?? VARIANTS.birth;
  const env = Math.min(easeOut(ramp(frame, 0, 12)), 1 - easeIn(ramp(frame, durationInFrames - 12, durationInFrames)));
  return (
    <AbsoluteFill style={{ background: v.over ? "transparent" : B.black, opacity: env, alignItems: "center", justifyContent: "center" }}>
      {v.over ? (
        <AbsoluteFill style={{ background: "radial-gradient(65% 55% at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0.15))" }} />
      ) : (
        <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 50% 45%, rgba(239,232,218,0.05), rgba(0,0,0,0.55))" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, maxWidth: 1500 }}>
        {v.top ? (
          <div
            style={{
              fontFamily: SANS,
              fontSize: 36,
              color: B.ember,
              direction: "rtl",
              letterSpacing: 1,
              marginBottom: 14,
              opacity: easeOut(ramp(t, v.top.t, v.top.t + 0.6)),
            }}
          >
            {v.top.text}
          </div>
        ) : null}
        {v.lines.map((l, i) => {
          const o = easeOut(ramp(t, l.t, l.t + 0.6));
          const dim = l.dim !== undefined ? 1 - 0.55 * easeOut(ramp(t, l.dim, l.dim + 0.8)) : 1;
          const strike = l.strike !== undefined ? easeInOut(ramp(t, l.strike, l.strike + 0.8)) : 0;
          const tick = l.tick ? easeOut(ramp(t, l.t + 0.5, l.t + 0.9)) : 0;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                direction: "rtl",
                textAlign: "center",
                lineHeight: 1.2,
                opacity: o * dim,
                transform: `translateY(${(1 - o) * 14}px)`,
                textShadow: v.over ? "0 4px 30px rgba(0,0,0,0.95)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 24,
                ...STYLE[l.style ?? "body"],
              }}
            >
              {l.tick ? (
                <span style={{ color: B.ember, fontFamily: SANS, opacity: tick, transform: `scale(${0.6 + 0.4 * tick})` }}>✓</span>
              ) : null}
              <span style={{ position: "relative" }}>
                {l.text}
                {strike > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "55%",
                      height: 5,
                      width: `${strike * 100}%`,
                      background: B.ember,
                    }}
                  />
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------------- counts

type Count = { big: string; small?: string; smallT?: number; note?: string; noteT?: number; latin?: boolean; strikeFirst?: { text: string; strike: number } };

const COUNTS: Record<string, Count> = {
  thirty: { big: "30", small: "רציחות שבהן הודה", smallT: 1.0, note: "המספר המדויק של קורבנותיו לא נקבע מעולם", noteT: 3.8, latin: true },
  thirty2: { big: "30", small: "\u20661974–1978\u2069", smallT: 0.8, note: "וגם זה אינו בהכרח המספר הסופי", noteT: 6.9, latin: true },
  degree: { big: "1972", small: "תואר ראשון בפסיכולוגיה, אוניברסיטת וושינגטון", smallT: 0.6, latin: true },
  ted: { big: "״טד״" },
  tedvw: { big: "״טד״", small: "פולקסווגן ביטל", smallT: 0.8, note: "השם פורסם, והציבור התבקש למסור מידע", noteT: 5.2 },
  "1976": { big: "1976", small: "הורשע בחטיפת קרול דה־רונץ׳", smallT: 0.5, latin: true },
  sixdays: { big: "6 ימים", small: "ואז נתפס", smallT: 0.4 },
  jan15: { big: "\u206614–15\u2069 בינואר 1978", small: "בית האחווה קאי אומגה · אוניברסיטת פלורידה סטייט", smallT: 1.4 },
  "1980": { big: "1980", small: "המשפט על רצח קימברלי ליץ׳ · עונש מוות נוסף", smallT: 0.5, latin: true },
  "1989": { big: "1989", latin: true },
  school: { big: "וודרו וילסון היי סקול", small: "טקומה, וושינגטון", smallT: 0.5 },
  exec: { big: "24 בינואר 1989", small: "פלורידה סטייט פריזן, רייפורד", smallT: 5.1 },
  aman: { big: "יש אדם.", strikeFirst: { text: "מפלצת", strike: 1.0 } },
};

export const CountCard: React.FC<{ variant: string }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const c = COUNTS[variant] ?? COUNTS.ted;
  const env = Math.min(easeOut(ramp(frame, 0, 10)), 1 - easeIn(ramp(frame, durationInFrames - 12, durationInFrames)));
  const bigAt = c.strikeFirst ? 3.3 : 0;
  const big = easeOut(ramp(t, bigAt, bigAt + 0.6));
  const hebrew = /[֐-׿]/.test(c.big);
  return (
    <AbsoluteFill style={{ opacity: env, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 50%, rgba(0,0,0,0.6), rgba(0,0,0,0.25))" }} />
      {c.strikeFirst ? (
        <div style={{ position: "absolute", top: 330, fontFamily: SERIF, fontSize: 90, color: B.paperDim, opacity: 1 - easeIn(ramp(t, 2.6, 3.2)) }}>
          <span style={{ position: "relative" }}>
            {c.strikeFirst.text}
            <span style={{ position: "absolute", right: 0, top: "55%", height: 6, background: B.ember, width: `${easeInOut(ramp(t, c.strikeFirst.strike, c.strikeFirst.strike + 0.8)) * 100}%` }} />
          </span>
        </div>
      ) : null}
      <div
        style={{
          fontFamily: hebrew ? SERIF : c.latin ? SERIF_LATIN : SERIF,
          fontWeight: hebrew ? 600 : 500,
          fontSize: c.big.length > 8 ? 110 : 220,
          lineHeight: 1,
          color: B.paper,
          direction: hebrew ? "rtl" : "ltr",
          opacity: big,
          transform: `scale(${0.96 + 0.04 * big})`,
          textShadow: "0 8px 50px rgba(0,0,0,0.9)",
        }}
      >
        {c.big}
      </div>
      {c.small ? (
        <div style={{ marginTop: 30, fontFamily: SANS, fontSize: 46, color: B.paper, direction: "rtl", opacity: easeOut(ramp(t, c.smallT ?? 0.5, (c.smallT ?? 0.5) + 0.6)), textShadow: "0 3px 24px rgba(0,0,0,0.95)" }}>
          {c.small}
        </div>
      ) : null}
      {c.note ? (
        <div style={{ marginTop: 22, fontFamily: SANS, fontSize: 38, color: B.ember, direction: "rtl", opacity: easeOut(ramp(t, c.noteT ?? 2, (c.noteT ?? 2) + 0.6)), textShadow: "0 3px 24px rgba(0,0,0,0.95)" }}>
          {c.note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
