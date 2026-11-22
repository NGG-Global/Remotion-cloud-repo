/**
 * The cut of "Faces of Evil: Ted Bundy". Pure data (no Remotion imports):
 * tools/hiroshima/cut-clips.mjs, grade-stills.mjs (project "bundy") and
 * tools/bundy/score.mjs read it directly.
 *
 * Times are seconds on the final timeline. The narration's three files sit at
 * P1, P2 and P3; word timings come from a local transcription. A shot runs to
 * the next shot's `at`.
 *
 * Editorial rules for this film (docs/BUNDY_NOTES.md):
 * - No crime-scene material, no bodies, no photographs of the victims. The
 *   women are named, with their age, place and date, on memorial cards and
 *   on the maps, as the narration names them.
 * - The moving pictures are period atmosphere (U.S. government films of
 *   1968–1975, all in the public domain) and are never captioned as the
 *   events, places or people of the story.
 */
import type { FilmId } from "./sources";
import type { StillId } from "./stills";

export const P1 = 1.0;
export const P2 = 509.828;
export const P3 = 1024.664;
export const NARRATION = [
  { file: "bundy/audio/narration-1.mp3", at: P1, length: 506.828 },
  { file: "bundy/audio/narration-2.mp3", at: P2, length: 512.836 },
  { file: "bundy/audio/narration-3.mp3", at: P3, length: 322.116 },
] as const;
export const END = 1356;

export type Move = {
  readonly x?: number;
  readonly y?: number;
  readonly z?: number;
};

/** seventies: the faded warm colour of 1970s stock. night: cold and low. */
export type Grade = "seventies" | "night" | "bw" | "color";

export type ClipV = {
  readonly kind: "clip";
  readonly src: FilmId;
  readonly t: number;
  readonly r?: number;
  readonly from?: Move;
  readonly to?: Move;
  readonly grade?: Grade;
  readonly crop?: readonly [number, number, number, number];
  readonly blur?: number;
  readonly dim?: number;
};

export type StillV = {
  readonly kind: "still";
  readonly img: StillId;
  readonly from?: Move;
  readonly to?: Move;
  readonly grade?: Grade;
  readonly fit?: "cover" | "mount";
  readonly blur?: number;
  readonly dim?: number;
};

export type GfxName =
  | "sting"
  | "map"
  | "cards"
  | "names"
  | "text"
  | "count"
  | "window"
  | "ceiling"
  | "wanted"
  | "tv"
  | "myth"
  | "endCard";

export type GfxV = {
  readonly kind: "gfx";
  readonly name: GfxName;
  readonly props?: Record<string, unknown>;
  readonly bg?: ClipV | StillV;
};

export type Visual = ClipV | StillV | GfxV;

export type Shot = {
  readonly at: number;
  readonly v: Visual;
  readonly enter?: "cut" | "dissolve" | "flash" | "black";
};

type ClipOpts = Omit<ClipV, "kind" | "src" | "t">;
type StillOpts = Omit<StillV, "kind" | "img">;

export const clip = (src: FilmId, t: number, o: ClipOpts = {}): ClipV => ({
  kind: "clip",
  src,
  t,
  ...o,
});
export const still = (img: StillId, o: StillOpts = {}): StillV => ({
  kind: "still",
  img,
  ...o,
});

const PUSH = { from: { z: 1 }, to: { z: 1.12 } };
const PAN_R = { from: { z: 1.15, x: 0.42 }, to: { z: 1.15, x: 0.58 } };
const PAN_L = { from: { z: 1.15, x: 0.58 }, to: { z: 1.15, x: 0.42 } };
const FACE = { from: { z: 1, y: 0.4 }, to: { z: 1.12, y: 0.36 } };

/** A clip from one of the period films, graded to 1970s stock by default. */
const c = (
  at: number,
  src: FilmId,
  t: number,
  o: ClipOpts = {},
  enter?: Shot["enter"],
): Shot => ({ at, v: clip(src, t, { grade: "seventies", ...PUSH, ...o }), enter });
/** The 1974 FBI training film: police, doors, cars at night. */
const fe = (at: number, t: number, o: ClipOpts = {}): Shot => ({
  at,
  v: clip("FE", t, { grade: "night", ...PUSH, ...o }),
});
const s = (
  at: number,
  img: StillId,
  o: StillOpts = {},
  enter?: Shot["enter"],
): Shot => ({ at, v: still(img, { grade: "seventies", ...PUSH, ...o }), enter });
const g = (
  at: number,
  name: GfxName,
  props?: Record<string, unknown>,
  bg?: ClipV | StillV,
  enter?: Shot["enter"],
): Shot => ({ at, v: { kind: "gfx", name, props, bg }, enter });

const BW = { grade: "bw" as const };

export const SHOTS: readonly Shot[] = [
  // ------------------------------------------------------------- cold open
  s(0.0, "pitkin", { from: { z: 1, y: 0.45 }, to: { z: 1.14, y: 0.4 } }, "black"),
  s(5.3, "headshot", { ...BW, ...FACE }),
  s(9.4, "court", { ...BW, ...FACE }),
  s(13.7, "custody", { ...BW, ...FACE }),
  s(18.8, "slc", PAN_R),
  g(24.2, "map", { preset: "overview" }),
  s(30.6, "pitkin2", { from: { z: 1.05, x: 0.5 }, to: { z: 1.2, x: 0.55 } }),
  g(36.8, "window"),
  s(44.2, "aspenStreet", PUSH),
  s(50.1, "aspenChairlift", { from: { z: 1.1, x: 0.45 }, to: { z: 1.22, x: 0.55 } }),
  fe(55.0, 502.5),
  g(58.0, "ceiling"),
  c(63.9, "WC", 206.4),
  s(67.6, "fsuWestcott", PAN_L),
  s(70.6, "tallahasseeTheater", PUSH),
  s(74.7, "aspenMall", { from: { z: 1.15, x: 0.6 }, to: { z: 1.25, x: 0.5 } }),
  c(78.9, "DB", 399.8, { r: 0.85 }),
  s(82.0, "alkiClams", { fit: "cover", from: { z: 1.05, y: 0.55 }, to: { z: 1.15, y: 0.5 } }),
  c(85.3, "DB", 408.0, { r: 0.65 }),
  s(89.5, "seattleI5", PUSH),
  s(94.7, "prison1978", { ...BW, ...FACE }),
  c(99.8, "DB", 584.5, { grade: "night" }),
  g(103.9, "count", { variant: "thirty" }, clip("DB", 590.0, { grade: "night", r: 0.8, dim: 0.6, ...PUSH })),
  c(111.6, "WD", 638.0, { r: 0.8 }),
  c(115.3, "DB", 700.0, { grade: "night" }),
  g(120.6, "map", { preset: "burlington" }),
  g(129.4, "sting", {}, undefined, "cut"),

  // ---------------------------------------- I. a boy named Theodore (131.9)
  g(131.8, "text", { variant: "birth" }),
  g(138.5, "text", { variant: "family" }),
  g(147.6, "map", { preset: "philadelphia" }),
  g(152.7, "text", { variant: "family2" }),
  c(159.5, "DA", 65.2, { r: 0.9 }),
  c(164.5, "DB", 435.0),
  c(169.3, "SS", 1283.4),
  g(175.4, "map", { preset: "tacoma" }),
  s(179.6, "tacomaStarlite", PUSH),
  g(184.0, "text", { variant: "rename" }),
  c(192.4, "DA", 275.5, { r: 0.8 }),
  s(200.9, "tacomaAnchor", PAN_R),
  g(212.9, "text", { variant: "versions" }),
  g(222.3, "count", { variant: "school" }, still("tacomaAnchor", { grade: "seventies", dim: 0.62, blur: 3, ...PUSH })),
  c(226.0, "DA", 283.5, { r: 0.95 }),
  c(230.6, "WD", 632.3, { r: 0.85 }),
  c(234.4, "DB", 459.0),
  c(238.3, "DB", 441.5, { grade: "night" }),
  s(243.5, "headshot", { ...BW, ...FACE }),
  s(249.4, "fbi", { ...BW, from: { z: 1.15, y: 0.4 }, to: { z: 1.0, y: 0.42 } }),
  s(257.2, "seattleRainier", PAN_R),
  s(261.5, "seattleElliott", { fit: "cover", from: { z: 1.0, y: 0.3 }, to: { z: 1.1, y: 0.42 } }),
  s(265.7, "alki", { from: { z: 1.05, x: 0.45 }, to: { z: 1.15, x: 0.5 } }),
  s(270.0, "seattleSunrise", PAN_R),
  s(275.0, "seattleI5", PAN_L),
  g(282.7, "count", { variant: "degree" }, still("seattleRainier", { grade: "seventies", dim: 0.55, ...PUSH })),
  fe(287.5, 873.0, { grade: "seventies" }),
  g(290.8, "text", { variant: "stranger" }),
  fe(300.2, 1034.5, { grade: "seventies" }),
  s(307.0, "seattleRainier", { from: { z: 1.15, x: 0.3 }, to: { z: 1.25, x: 0.35 } }),
  s(312.6, "highwayNight", { grade: "night", ...PUSH }),
  g(319.9, "count", { variant: "ted" }, undefined, "cut"),

  // ------------------------------------------------ II. Seattle, 1974 (324.2)
  s(324.2, "seattleI5", PAN_L),
  c(329.5, "WC", 634.1, { r: 0.7 }),
  c(333.2, "WC", 620.3),
  c(337.3, "WC", 628.2, { r: 0.5 }),
  g(340.9, "map", { preset: "nw" }),
  s(358.7, "highwayNight", { grade: "night", from: { z: 1.1, x: 0.4 }, to: { z: 1.2, x: 0.5 } }),
  fe(362.9, 763.3, { r: 0.8 }),
  g(369.3, "map", { preset: "nw2" }),
  c(397.4, "DA", 201.0),
  c(402.7, "DB", 412.5, { r: 0.8 }),
  c(406.5, "DA", 210.8, { grade: "night", r: 0.6 }),
  g(410.7, "text", { variant: "ruse" }, clip("DB", 86.0, { grade: "seventies", r: 0.6, dim: 0.62, ...PUSH })),
  c(422.6, "DA", 250.6, { r: 0.85 }),
  s(429.4, "rentonBeach", PAN_R),
  c(435.5, "DA", 542.5, { r: 0.55 }),
  c(440.0, "SS", 1549.0),
  g(445.5, "cards", { variant: "sammamish" }),
  c(457.2, "WC", 21.9, { r: 0.65 }),
  s(460.2, "vwWindow", { from: { z: 1 }, to: { z: 1.18 } }),
  g(468.0, "count", { variant: "tedvw" }, still("highwayNight", { grade: "night", dim: 0.55, ...PUSH })),
  s(477.5, "vwPier", { from: { z: 1, x: 0.45 }, to: { z: 1.15, x: 0.55 } }),
  g(483.5, "text", { variant: "checklist" }),
  fe(491.2, 875.0, { grade: "seventies" }),
  fe(494.5, 76.0, { grade: "seventies" }),
  c(501.2, "WC", 813.0, { r: 0.7 }),

  // ---------------------------------------------------- III. Utah (509.8)
  g(509.8, "map", { preset: "toUtah" }),
  s(514.6, "slcMountains", PUSH),
  s(518.0, "slc", { from: { z: 1.2, x: 0.62 }, to: { z: 1.2, x: 0.38 } }),
  g(527.2, "map", { preset: "utah1" }),
  s(539.7, "slcSmog", PUSH),
  g(546.8, "cards", { variant: "daronch" }),
  c(552.7, "FE", 524.5, { grade: "night" }),
  fe(556.8, 1045.0),
  s(561.1, "vwWindow", { grade: "night", from: { z: 1.1, x: 0.6 }, to: { z: 1.2, x: 0.5 } }),
  s(567.9, "highwayNight", { grade: "night", ...PAN_R }),
  c(572.8, "FE", 548.3, { grade: "night", r: 0.7 }),
  c(578.5, "FE", 530.0, { grade: "night", r: 0.7 }),
  g(584.5, "cards", { variant: "daronch2" }),
  g(591.1, "map", { preset: "utah2" }),
  s(602.9, "aspenShuttle", PUSH),
  g(608.5, "map", { preset: "colorado" }),
  g(625.0, "map", { preset: "overview2" }),
  s(634.2, "aspenChairlift", PAN_R),
  c(639.5, "WD", 370.0),
  fe(645.3, 540.0),
  s(651.0, "vwPier", { grade: "night", from: { z: 1.2, x: 0.4 }, to: { z: 1.3, x: 0.45 } }),
  g(655.6, "text", { variant: "items" }),
  fe(661.5, 1148.0),
  s(668.0, "prison1978", { ...BW, from: { z: 1.1, y: 0.35 }, to: { z: 1.2, y: 0.3 } }),
  g(672.0, "count", { variant: "1976" }, still("slcMountains", { grade: "seventies", dim: 0.6, ...PUSH })),
  c(677.0, "WC", 778.7, { r: 0.8 }),
  s(683.4, "aspenMall", PAN_L),
  s(690.1, "pitkin", { from: { z: 1.1, y: 0.4 }, to: { z: 1.2, y: 0.35 } }),

  // ------------------------------------------------ IV. two escapes (696.2)
  g(696.2, "map", { preset: "toAspen" }),
  s(703.2, "aspenStreet", { fit: "cover", from: { z: 1.15, y: 0.6 }, to: { z: 1.25, y: 0.55 } }),
  s(709.6, "headshot", { ...BW, from: { z: 1.15, y: 0.35 }, to: { z: 1.25, y: 0.33 } }),
  g(717.8, "window", { variant: "full" }),
  c(727.1, "DB", 95.0, { r: 0.9 }),
  c(730.6, "DB", 99.2, { r: 0.9 }),
  g(738.8, "count", { variant: "sixdays" }, clip("WC", 820.0, { grade: "seventies", r: 0.7, dim: 0.55, ...PUSH })),
  c(744.4, "FE", 612.0, { grade: "night" }),
  g(749.4, "ceiling", { variant: "full" }),
  c(764.0, "SS", 1583.0, { grade: "night" }),
  g(766.9, "map", { preset: "flight" }),
  s(777.7, "fsuWestcott", { from: { z: 1.1, x: 0.4 }, to: { z: 1.2, x: 0.5 } }),
  g(783.4, "wanted"),
  s(791.0, "tallahasseeCapitol", { fit: "cover", from: { z: 1.0, y: 0.45 }, to: { z: 1.12, y: 0.4 } }),

  // ------------------------------------------------ V. Tallahassee (796.9)
  c(796.9, "DB", 745.0, { grade: "night", r: 0.8 }),
  g(802.0, "count", { variant: "jan15" }, undefined, "cut"),
  g(807.7, "cards", { variant: "chiomega" }),
  c(823.7, "DB", 720.0, { grade: "night" }),
  fe(829.0, 560.0),
  s(833.7, "highwayNight", { grade: "night", from: { z: 1.2, x: 0.6 }, to: { z: 1.3, x: 0.5 } }),
  g(836.5, "map", { preset: "lakecity" }),
  g(843.6, "cards", { variant: "leach" }),
  g(851.0, "map", { preset: "pensacola" }),
  s(855.9, "pensacolaRex", PUSH),
  fe(859.2, 1000.5),
  s(863.6, "fbi", { ...BW, fit: "mount", from: { z: 1 }, to: { z: 1.12 } }),
  g(868.6, "map", { preset: "overview3" }),
  s(874.6, "custody", { ...BW, from: { z: 1.1, y: 0.35 }, to: { z: 1.2, y: 0.3 } }),

  // ------------------------------------------------------ VI. trial (876.9)
  s(876.9, "miamiDowntown", { fit: "cover", from: { z: 1, y: 0.3 }, to: { z: 1.12, y: 0.55 } }),
  g(886.9, "tv", { img: "court" }),
  s(899.2, "court", { ...BW, from: { z: 1.0 }, to: { z: 1.15 } }),
  s(905.0, "custody", { ...BW, from: { z: 1.25, x: 0.45, y: 0.35 }, to: { z: 1.35, x: 0.5, y: 0.32 } }),
  s(910.5, "rentonLaunch", { from: { z: 1.1, x: 0.4 }, to: { z: 1.2, x: 0.5 } }),
  c(915.0, "DB", 448.5, { r: 0.8 }),
  g(919.7, "text", { variant: "bitemark" }),
  s(930.1, "court", { ...BW, from: { z: 1.15, x: 0.4 }, to: { z: 1.25, x: 0.45 } }),
  g(934.8, "text", { variant: "bitemark2" }),
  s(948.5, "miamiSkyline", { fit: "cover", from: { z: 1.0, y: 0.25 }, to: { z: 1.1, y: 0.3 } }),
  s(951.5, "sentencing", { grade: "color", fit: "cover", from: { z: 1.0, y: 0.3 }, to: { z: 1.1, y: 0.42 } }),
  s(960.6, "mug1980", { ...BW, ...FACE }),
  g(968.0, "count", { variant: "1980" }, still("mug1980", { grade: "bw", dim: 0.7, blur: 4, ...PUSH })),
  s(972.3, "court", { ...BW, from: { z: 1.2, x: 0.6 }, to: { z: 1.3, x: 0.55 } }),
  g(979.5, "text", { variant: "marriage" }),
  c(996.0, "WD", 377.0, { grade: "night", r: 0.6 }),
  c(1003.3, "WD", 300.0),
  s(1009.7, "prison1978", { ...BW, from: { z: 1.2, y: 0.3 }, to: { z: 1.35, y: 0.28 } }),
  c(1019.4, "FE", 604.0, { grade: "night" }),

  // ------------------------------------------------- VII. death row (1024.7)
  s(1024.6, "mug1980", { ...BW, fit: "mount", dim: 0.45, from: { z: 1 }, to: { z: 1.1 } }),
  s(1030.0, "mug1988", { ...BW, ...FACE }),
  g(1039.8, "count", { variant: "1989" }, undefined),
  s(1043.0, "hagmaier", { ...BW, from: { z: 1 }, to: { z: 1.15 } }),
  g(1050.1, "map", { preset: "overview4" }),
  g(1058.7, "count", { variant: "thirty2" }, clip("DB", 707.0, { grade: "night", r: 0.9, dim: 0.65, ...PUSH })),
  c(1069.2, "FE", 556.0, { grade: "night" }),
  s(1074.0, "slcSmog", { from: { z: 1.2, x: 0.35 }, to: { z: 1.3, x: 0.45 } }),
  g(1079.2, "text", { variant: "unreliable" }),
  g(1103.5, "tv", { img: "mug1988", variant: "interview" }),
  g(1112.2, "text", { variant: "claim" }),
  g(1135.9, "count", { variant: "exec" }, undefined, "cut"),
  s(1145.6, "highwayNight", { grade: "night", from: { z: 1.25, x: 0.35 }, to: { z: 1.35, x: 0.45 } }),
  s(1155.9, "rentonBeach", { from: { z: 1.25, x: 0.35 }, to: { z: 1.35, x: 0.42 } }),
  c(1162.4, "DA", 2.0, { r: 0.7 }),
  c(1169.4, "SS", 1566.0),

  // ---------------------------------------- VIII. behind the myth (1174.4)
  g(1174.4, "myth"),
  g(1203.0, "text", { variant: "exploited" }, clip("DB", 730.0, { grade: "night", r: 0.6, dim: 0.65, ...PUSH })),
  g(1213.0, "map", { preset: "jurisdictions" }),
  s(1230.7, "custody", { ...BW, from: { z: 1, y: 0.4 }, to: { z: 1.2, y: 0.35 } }),
  s(1237.4, "court", { ...BW, from: { z: 1.3, x: 0.3, y: 0.4 }, to: { z: 1.4, x: 0.35, y: 0.38 } }),
  s(1241.6, "fbi", { ...BW, from: { z: 1.1 }, to: { z: 1.2 }, dim: 0.2 }),
  g(1246.7, "names", {}, undefined, "dissolve"),
  c(1284.7, "WC", 211.5),
  s(1288.5, "alki", { from: { z: 1.3, x: 0.42 }, to: { z: 1.4, x: 0.45 } }),
  c(1292.6, "FE", 535.0, { grade: "night", r: 0.7 }),
  g(1299.0, "count", { variant: "aman" }, undefined, "cut"),
  s(1303.2, "prison1978", { ...BW, fit: "mount", from: { z: 1 }, to: { z: 1.12 } }),
  c(1311.2, "SS", 1539.0),
  c(1316.3, "DA", 232.8),
  s(1321.7, "headshot", { ...BW, from: { z: 1.05, y: 0.38 }, to: { z: 1.3, y: 0.34 } }),
  g(1329.8, "sting", { variant: "close" }),
  g(1335.9, "endCard", {}, clip("DA", 50.0, { grade: "night", r: 0.45, dim: 0.55, ...PUSH })),
];

// ----------------------------------------------------------------- overlays

export type Caption = {
  readonly at: number;
  readonly until: number;
  readonly title: string;
  readonly sub?: string;
};

export const CAPTIONS: readonly Caption[] = [
  { at: 1.4, until: 6.4, title: "אספן, קולורדו", sub: "7 ביוני 1977" },
  { at: 19.0, until: 23.8, title: "סולט לייק סיטי", sub: "1972" },
  { at: 31.0, until: 36.5, title: "בית המשפט של מחוז פיטקין", sub: "אספן" },
  { at: 44.6, until: 49.8, title: "אספן", sub: "1974" },
  { at: 67.9, until: 70.4, title: "טלהאסי, פלורידה" },
  { at: 179.9, until: 183.8, title: "טקומה, וושינגטון" },
  { at: 257.5, until: 265.5, title: "סיאטל", sub: "1973" },
  { at: 539.9, until: 546.6, title: "סולט לייק סיטי", sub: "1972" },
  { at: 603.2, until: 608.3, title: "אספן–סנואומאס", sub: "1974" },
  { at: 690.4, until: 696.0, title: "בית המשפט של מחוז פיטקין", sub: "אספן" },
  { at: 777.9, until: 783.2, title: "אוניברסיטת פלורידה סטייט", sub: "טלהאסי" },
  { at: 856.1, until: 859.0, title: "פנסקולה, פלורידה", sub: "15 בפברואר 1978" },
  { at: 877.1, until: 886.7, title: "מיאמי, פלורידה", sub: "יוני 1979" },
  { at: 957.4, until: 960.4, title: "גזר הדין", sub: "מיאמי · 31 ביולי 1979" },
  { at: 1043.2, until: 1049.9, title: "עם סוכן ה־FBI ביל הגמאייר", sub: "ינואר 1989" },
];

export type Chapter = {
  readonly at: number;
  readonly n: string;
  readonly title: string;
  /** The chapter's graphic carries its own heading; no overlay. */
  readonly inline?: boolean;
};

export const CHAPTERS: readonly Chapter[] = [
  { at: 132.2, n: "I", title: "ילד בשם תיאודור", inline: true },
  { at: 324.5, n: "II", title: "סיאטל, 1974" },
  { at: 510.1, n: "III", title: "יוטה" },
  { at: 696.5, n: "IV", title: "שתי בריחות" },
  { at: 797.2, n: "V", title: "טלהאסי" },
  { at: 877.2, n: "VI", title: "המשפט" },
  { at: 1024.9, n: "VII", title: "אגף הנידונים למוות" },
  { at: 1174.6, n: "VIII", title: "מאחורי המיתוס" },
];

/** Low hits in the score, on the beats that need weight. */
export const HITS: readonly number[] = [
  0.2, 36.9, 41.3, 58.0, 104.1, 129.4, 319.9, 445.6, 546.9, 717.9, 724.0,
  764.0, 802.0, 807.8, 843.7, 867.2, 951.6, 1039.8, 1058.8, 1141.0, 1246.8,
  1299.0, 1329.8,
];

/** The subscribe reminder, while the narration asks for it. */
export const SUBSCRIBE = { at: 1340.2, until: 1346.6 } as const;

// ------------------------------------------------------------ clip handling

export const TAIL = 0.6;

export const clipFile = (v: ClipV): string =>
  `${v.src}-${v.t.toFixed(2)}${v.crop ? "-c" : ""}-${v.grade ?? "seventies"}${v.blur ? `-b${v.blur}` : ""}.mp4`;

export type ClipJob = {
  readonly file: string;
  readonly src: FilmId;
  readonly t: number;
  readonly need: number;
  readonly crop?: readonly [number, number, number, number];
  readonly grade: Grade;
  readonly blur?: number;
};

export const clipJobs = (): ClipJob[] => {
  const jobs = new Map<string, ClipJob>();
  SHOTS.forEach((shot, i) => {
    const next = SHOTS[i + 1]?.at ?? END;
    const screen = next - shot.at + TAIL + 0.4;
    const v = shot.v;
    const clipV =
      v.kind === "clip"
        ? v
        : v.kind === "gfx" && v.bg?.kind === "clip"
          ? v.bg
          : null;
    if (!clipV) return;
    const need = screen * (clipV.r ?? 1);
    const file = clipFile(clipV);
    const prev = jobs.get(file);
    jobs.set(file, {
      file,
      src: clipV.src,
      t: clipV.t,
      need: Math.max(need, prev?.need ?? 0),
      crop: clipV.crop,
      grade: clipV.grade ?? "seventies",
      blur: clipV.blur,
    });
  });
  return [...jobs.values()];
};

/** Colour grades as ffmpeg chains, baked into clips and stills. */
export const GRADE_FILTERS: Record<Grade, string> = {
  seventies:
    "eq=saturation=0.72:contrast=1.06:brightness=-0.02,colorchannelmixer=rr=1.0:gg=0.96:bb=0.86",
  night:
    "eq=saturation=0.45:contrast=1.1:brightness=-0.06,colorchannelmixer=rr=0.9:gg=0.96:bb=1.05",
  bw: "hue=s=0,eq=contrast=1.08:brightness=-0.01,colorchannelmixer=rr=0.97:gg=0.98:bb=1.0",
  color: "eq=saturation=0.85:contrast=1.04",
};

export const stillVariant = (v: StillV): string =>
  `${v.img}-${v.grade ?? "seventies"}${v.blur ? `-b${v.blur}` : ""}`;

export const stillJobs = (): StillV[] => {
  const map = new Map<string, StillV>();
  for (const shot of SHOTS) {
    const v = shot.v;
    const sv =
      v.kind === "still"
        ? v
        : v.kind === "gfx" && v.bg?.kind === "still"
          ? v.bg
          : null;
    if (sv) map.set(stillVariant(sv), sv);
  }
  // Stills drawn inside graphics (the TV set, the myth wall, the wanted card).
  for (const img of GFX_STILLS) map.set(stillVariant(still(img, { grade: "bw" })), still(img, { grade: "bw" }));
  return [...map.values()];
};

/** Stills the graphics draw themselves, always in black and white. */
export const GFX_STILLS: readonly StillId[] = [
  "court",
  "mug1988",
  "fbi",
  "headshot",
  "mug1980",
  "custody",
  "prison1978",
  "pitkin2",
];
