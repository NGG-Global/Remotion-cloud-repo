import type { Label, Sfx, Subtitle } from "./types";

/**
 * On-screen type. Labels name a person, a place or a date, nothing more.
 * Subtitles translate the three archive sound bites, the only foreign
 * speech in the film; the narration itself is never subtitled.
 */
export const LABELS: readonly Label[] = [
  { at: 114.3, until: 119.1, line: "אנדריאס מינצר", sub: "1964 – 1996" },
  { at: 128.3, until: 132.8, line: "ארנולד קלאסיק", sub: "1996" },
  { at: 183.3, until: 187.7, line: "ארנולד שוורצנגר" },
  { at: { ins: "I4", t: 0.3 }, until: { ins: "I4", t: 6.4 }, line: "אוסטריה", sub: "1988", corner: "tr" },
  { at: 221.4, until: 225.5, line: "מר אולימפיה", sub: "1990" },
  { at: 230.6, until: 234.2, line: "יותר מ־100 ק״ג", corner: "br" },
  { at: 341.0, until: 344.1, line: "שנות ה־90" },
  { at: 575.9, until: 580.6, line: "אנדריאס מינצר", sub: "1964 – 1996" },
  { at: 931.6, until: 936.1, line: "ארנולד שוורצנגר" },
  { at: 969.2, until: 974.0, line: "ראיון", sub: "מר אולימפיה 1990" },
  { at: 978.1, until: 982.6, line: "אוסטריה", sub: "1988" },
];

const ESPN = "שידור ESPN · ארנולד קלאסיק 1995";

export const SUBTITLES: readonly Subtitle[] = [
  // a95 9.72-11.72: "Andreas Munzer, from Germany."
  { at: { ins: "I1", t: 0.25 }, until: { ins: "I1", t: 2.6 }, text: "אנדריאס מינצר, מגרמניה.", source: ESPN },
  // am88 226.9-228.9: "er ist die große Hoffnung für die Zukunft,"
  {
    at: { ins: "I4", t: 0.12 },
    until: { ins: "I4", t: 2.3 },
    text: "הוא התקווה הגדולה לעתיד.",
    source: "כרוז הערב · אוסטריה 1988",
  },
  // am88 229.1-233.0: "nach Arnold Schwarzenegger sicherlich das größte Talent Österreichs."
  {
    at: { ins: "I4", t: 2.35 },
    until: { ins: "I4", t: 6.5 },
    text: "אחרי ארנולד שוורצנגר – ללא ספק הכישרון הגדול ביותר של אוסטריה.",
  },
  // a95 110.24-111.9: "There's no body fat there."
  { at: { ins: "I5", t: 0.15 }, until: { ins: "I5", t: 2.05 }, text: "אין שם שום שומן.", source: ESPN },
  // a95 112.24-115.78: "I'm absolutely convinced he must have less than 6% body fat."
  {
    at: { ins: "I5", t: 2.1 },
    until: { ins: "I5", t: 6.1 },
    text: "אני משוכנע לחלוטין שיש לו פחות משישה אחוזי שומן.",
  },
];

/** Sound design: synthesised in tools/munzer-sfx.sh, never sampled. */
export const SFX: readonly Sfx[] = [
  { at: { ins: "TITLE", t: 0.2 }, file: "hit.wav", gain: 0.55 },
  { at: 44.45, file: "heartbeat.wav", gain: 0.5 },
  { at: 599.45, file: "heartbeat.wav", gain: 0.42 },
  { at: 567.95, file: "beep.wav", gain: 0.16 },
  { at: 568.95, file: "beep.wav", gain: 0.15 },
  { at: 570.15, file: "beep.wav", gain: 0.13 },
  { at: 571.6, file: "beep.wav", gain: 0.1 },
];
