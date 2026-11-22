/**
 * The cut. Pure data, no Remotion imports: tools/hiroshima/cut-clips.mjs and
 * tools/hiroshima/score.mjs read this file directly (node
 * --experimental-strip-types), so the picture, the clip extraction and the
 * sound design all work from one timeline.
 *
 * Every time is seconds on the final timeline. The narration arrives in three
 * files, placed at P1, P2 and P3 with a short breath between them; the word
 * timings come from a local transcription of those files
 * (docs/HIROSHIMA_NOTES.md). Cuts are placed on the phrase they illustrate.
 *
 * A shot runs from its `at` to the next shot's `at`. A clip's `t` is the
 * in-point in its source film (seconds); `r` slows it down.
 */
import type { FilmId } from "./sources";
import type { StillId } from "./stills";

export const P1 = 1.0;
export const P2 = 633.05;
export const P3 = 1096.2;
export const NARRATION = [
  { file: "hiroshima/audio/narration-1.mp3", at: P1, length: 630.047 },
  { file: "hiroshima/audio/narration-2.mp3", at: P2, length: 461.166 },
  { file: "hiroshima/audio/narration-3.mp3", at: P3, length: 316.996 },
] as const;
export const END = 1424;

/** A framing: focal point in image fractions and zoom over "cover". */
export type Move = {
  readonly x?: number;
  readonly y?: number;
  readonly z?: number;
};

/** bw: archival monochrome. color: the 1946 colour film, slightly faded. */
export type Grade = "bw" | "color" | "warm" | "green";

export type ClipV = {
  readonly kind: "clip";
  readonly src: FilmId;
  readonly t: number;
  readonly r?: number;
  readonly from?: Move;
  readonly to?: Move;
  readonly grade?: Grade;
  /** Crop in source fractions [x, y, w, h], applied when the clip is cut. */
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
  | "title"
  | "map"
  | "burst"
  | "threeWays"
  | "doctors"
  | "hospitals"
  | "marrow"
  | "invisible"
  | "book"
  | "toll"
  | "leukemia"
  | "twoBlack"
  | "nameCard"
  | "clock"
  | "oneMan"
  | "recognition"
  | "quote"
  | "endCard";

export type GfxV = {
  readonly kind: "gfx";
  readonly name: GfxName;
  readonly props?: Record<string, unknown>;
  /** Optional backdrop the graphic sits on. */
  readonly bg?: ClipV | StillV;
};

export type Visual = ClipV | StillV | GfxV;

export type Shot = {
  readonly at: number;
  readonly v: Visual;
  /** Entrance. Default is a short dissolve. */
  readonly enter?: "cut" | "dissolve" | "flash" | "black";
};

type ClipOpts = Omit<ClipV, "kind" | "src" | "t">;
type StillOpts = Omit<StillV, "kind" | "img">;

const clip = (src: FilmId, t: number, o: ClipOpts = {}): ClipV => ({
  kind: "clip",
  src,
  t,
  ...o,
});
const still = (img: StillId, o: StillOpts = {}): StillV => ({
  kind: "still",
  img,
  ...o,
});

// Common moves.
const PUSH = { from: { z: 1 }, to: { z: 1.12 } };
const PAN_R = { from: { z: 1.15, x: 0.42 }, to: { z: 1.15, x: 0.58 } };
const PAN_L = { from: { z: 1.15, x: 0.58 }, to: { z: 1.15, x: 0.42 } };

// The colour films carry burned-in timecode or slate edges; crop them away.
const NB_CROP = [0.06, 0.04, 0.88, 0.7] as const;

const c = (
  at: number,
  src: FilmId,
  t: number,
  o: ClipOpts = {},
  enter?: Shot["enter"],
): Shot => ({
  at,
  v: clip(src, t, { ...PUSH, ...o }),
  enter,
});
const s = (
  at: number,
  img: StillId,
  o: StillOpts = {},
  enter?: Shot["enter"],
): Shot => ({
  at,
  v: still(img, { ...PUSH, ...o }),
  enter,
});
const g = (
  at: number,
  name: GfxName,
  props?: Record<string, unknown>,
  bg?: ClipV | StillV,
  enter?: Shot["enter"],
): Shot => ({ at, v: { kind: "gfx", name, props, bg }, enter });

const HD = (t: number, o: ClipOpts = {}) =>
  clip("HD", t, { grade: "color", ...PAN_R, ...o });

export const SHOTS: readonly Shot[] = [
  // ------------------------------------------------------------------ cold open
  c(0.0, "EF", 4243.4, { r: 0.8, from: { z: 1.05 }, to: { z: 1.25 } }, "black"),
  s(3.1, "aioiPrewar", {
    grade: "warm",
    from: { z: 1, x: 0.4 },
    to: { z: 1.12, x: 0.5 },
  }),
  s(7.0, "motoyasu", { grade: "warm", ...PAN_L }),
  c(11.9, "AS", 218.2, { r: 0.85 }),
  c(13.9, "AS", 1434.0, { r: 0.85 }),
  c(15.9, "HN", 156.4, { r: 0.9 }),
  c(18.4, "AS", 227.4, { r: 0.85 }),
  c(21.4, "AS", 231.8, { r: 0.85 }),
  c(24.2, "IE", 81.8, { r: 0.9, grade: "green" }),
  c(28.6, "IE", 95.4, { r: 0.9, grade: "green" }),
  c(33.0, "AS", 239.3, { r: 0.7 }),
  c(35.6, "IE", 121.0, {
    r: 0.85,
    grade: "green",
    from: { z: 1.05 },
    to: { z: 1.2 },
  }),
  {
    at: 41.8,
    v: {
      kind: "gfx",
      name: "burst",
      bg: still("aioiPrewar", {
        grade: "warm",
        from: { z: 1.05, x: 0.45, y: 0.55 },
        to: { z: 1.18, x: 0.45, y: 0.6 },
      }),
    },
    enter: "flash",
  },
  s(48.3, "cloudHiroshima", {
    from: { z: 1, y: 0.45 },
    to: { z: 1.15, y: 0.4 },
  }),
  c(53.0, "HD", 86.0, { grade: "color", ...PAN_R }),
  c(57.5, "AS", 374.0),
  c(60.8, "EF", 8689.6),
  c(66.1, "EF", 3750.5),
  c(67.9, "EF", 3833.6),
  c(70.2, "EF", 8987.2, { r: 0.85 }),
  c(73.3, "EF", 4610.4),
  c(77.5, "HN", 174.6),
  c(80.5, "NB", 19.5, {
    grade: "color",
    crop: NB_CROP,
    from: { z: 1 },
    to: { z: 1.1 },
  }),
  g(86.4, "sting", { variant: "open" }, undefined, "cut"),
  s(90.0, "cloudsBoth", { from: { z: 1, x: 0.5 }, to: { z: 1.08, x: 0.5 } }),
  c(94.6, "TR", 10.0),
  c(99.3, "HN", 199.4),
  s(103.6, "cloudKure", { fit: "mount" }),
  c(106.4, "HN", 267.2),
  g(
    110.6,
    "title",
    {},
    clip("HN", 49.4, { r: 0.7, from: { z: 1.05 }, to: { z: 1.18 }, dim: 0.55 }),
  ),

  // -------------------------------------------------- I. the road to August 1945
  c(115.4, "AS", 198.0, { from: { z: 1 }, to: { z: 1.2 } }),
  c(120.3, "AS", 220.7, { r: 0.75 }),
  c(123.2, "AS", 208.6),
  c(126.4, "N16", 59.5),
  c(129.0, "AS", 216.3, { r: 0.7 }),
  c(130.9, "OK", 104.0),
  c(135.4, "OK", 10.2),
  c(139.4, "TD", 77.0, { grade: "color" }),
  c(142.4, "TD", 241.8, { grade: "color" }),
  c(145.8, "TD", 467.0, { grade: "color" }),
  c(148.6, "AS", 63.8, { r: 0.65 }),
  c(151.0, "AS", 66.3),
  g(154.8, "map", { preset: "targets" }),
  c(158.9, "AS", 242.0, { from: { z: 1.1 }, to: { z: 1.3 } }),
  s(162.2, "promoHall", { grade: "warm" }),
  s(167.0, "aioi1920s", { grade: "warm", ...PAN_R }),
  c(170.2, "HN", 79.2),
  s(173.9, "modelBefore", {
    grade: "warm",
    from: { z: 1, y: 0.5 },
    to: { z: 1.25, y: 0.55 },
  }),
  c(180.6, "EO", 549.0),
  c(184.4, "EO", 579.0),
  s(188.2, "tibbets", { from: { z: 1, y: 0.3 }, to: { z: 1.12, y: 0.3 } }),
  s(190.6, "littleBoy", { from: { z: 1.05 }, to: { z: 1.15 } }),
  g(193.9, "map", { preset: "enola" }),
  c(198.6, "IE", 135.0, { grade: "green", r: 0.8 }),
  HD_shot(205.2, 106.0),
  c(208.4, "AS", 421.0),
  c(212.2, "HN", 7.2),
  s(216.6, "firestorm"),
  c(219.0, "AS", 281.0),
  c(222.1, "HN", 152.2, { r: 0.85 }),
  c(225.6, "SP", 25.0),
  s(230.9, "fatMan", { from: { z: 1.05 }, to: { z: 1.15 } }),
  g(236.6, "map", { preset: "bockscar" }),
  c(247.0, "HN", 426.4),
  c(249.6, "AS", 1430.3, { r: 0.8 }),
  c(252.9, "AS", 1440.6),
  c(257.0, "AS", 1474.2, {}, "flash"),
  c(259.0, "AS", 1480.4),
  c(261.0, "NB", 44.5, { grade: "color", crop: NB_CROP }),
  s(264.0, "cloudNagasaki", {
    from: { z: 1, y: 0.4 },
    to: { z: 1.12, y: 0.35 },
  }),
  c(267.2, "AS", 1678.0),
  c(270.6, "AS", 1792.4),
  s(274.4, "manchuria", { fit: "mount" }),
  c(281.5, "TK", 76.5),
  s(286.8, "hirohito", { from: { z: 1, y: 0.3 }, to: { z: 1.1, y: 0.25 } }),
  s(290.0, "surrenderListen", PAN_L),
  c(294.6, "SM", 5.0),
  HD_shot(298.4, 229.0),
  c(303.6, "N23", 290.0),
  c(307.2, "EF", 3381.7),

  // ----------------------------------------------------- II. the first seconds
  c(312.3, "AS", 134.6, { r: 0.8 }),
  c(317.0, "NB", 1.0, { grade: "color", crop: NB_CROP }),
  c(321.0, "TD", 581.0, { grade: "color", r: 0.8 }),
  c(325.1, "AS", 88.0),
  c(329.6, "FS", 387.2, { grade: "color" }),
  s(333.4, "meltedCoins"),
  c(337.6, "FS", 777.6, { grade: "color" }),
  s(340.6, "boyTreated", { grade: "bw" }),
  c(344.6, "AS", 495.6),
  HD_shot(347.3, 262.4),
  c(350.6, "AS", 879.0),
  c(353.2, "AS", 667.6),
  c(355.6, "AS", 352.4),
  c(358.4, "AS", 554.8),
  HD_shot(361.4, 642.4),
  c(364.8, "AS", 503.4),
  g(
    369.3,
    "threeWays",
    {},
    still("dome1952", {
      from: { z: 1.05 },
      to: { z: 1.15 },
      dim: 0.7,
      blur: 6,
    }),
  ),
  c(383.2, "EF", 1435.6),
  c(386.4, "EF", 1873.8),
  c(390.6, "HN", 115.5),
  c(394.0, "HN", 136.4),
  c(397.0, "N46", 9.4, { r: 0.9 }),

  // ---------------------------------------------- III. a city without doctors
  c(402.4, "EF", 4217.8),
  c(406.4, "EF", 4232.4, { r: 0.8 }),
  c(408.4, "EF", 4389.9),
  g(410.6, "doctors"),
  g(416.3, "hospitals"),
  c(422.0, "EF", 4253.8),
  c(427.4, "EF", 8810.9),
  c(432.4, "EF", 4317.0),
  c(435.2, "EF", 4404.0),
  c(437.6, "EF", 8802.6, { r: 0.85 }),
  c(440.8, "AS", 446.0),
  c(444.8, "EF", 3145.9),
  c(449.6, "EF", 4277.6),
  c(453.4, "HN", 49.4),
  c(457.4, "AS", 632.2),
  c(461.0, "FS", 640.0, { grade: "color" }),
  c(464.6, "HN", 219.3),
  c(468.4, "N46", 48.4),
  c(472.6, "EF", 4431.8),
  c(476.6, "EF", 4598.0),

  // ---------------------------------------------- IV. the invisible sickness
  c(479.6, "AS", 1372.3),
  c(484.0, "HN", 242.2),
  c(488.0, "N46", 60.6, { r: 0.75 }),
  c(491.2, "HN", 237.5),
  c(494.0, "EF", 8745.8),
  c(497.4, "EF", 4819.2),
  c(501.0, "EF", 8757.8),
  c(506.2, "EF", 4484.6),
  c(510.6, "EF", 8920.2, { r: 0.85 }),
  c(514.0, "EF", 3864.6),
  c(518.4, "EF", 8784.7),
  c(520.4, "EF", 8902.5),
  c(524.4, "EF", 8719.8),
  c(528.6, "EF", 8945.4),
  c(531.0, "EF", 4829.0, { r: 0.85 }),
  c(536.8, "EF", 3930.9, { from: { z: 1 }, to: { z: 1.25 } }),
  g(545.6, "marrow"),
  c(570.4, "EF", 3843.2),
  c(575.4, "EF", 3893.2),
  c(579.9, "EF", 4359.1, { r: 0.9 }),
  c(582.4, "EF", 8712.8),
  c(587.0, "EF", 4418.0),
  c(590.8, "EF", 8701.9),
  c(595.2, "EF", 8844.4),
  c(599.6, "EF", 8707.0),
  HD_shot(604.6, 846.3),
  g(
    608.4,
    "invisible",
    {},
    clip("HD", 503.3, {
      grade: "color",
      r: 0.5,
      dim: 0.6,
      from: { z: 1 },
      to: { z: 1.1 },
    }),
  ),
  c(616.0, "HN", 315.4),
  c(622.2, "AS", 160.0, { r: 0.8 }),
  c(626.6, "AS", 110.0, { r: 0.8 }),

  // ---------------------------------------------------------- V. black rain
  c(633.0, "AS", 1819.0, { r: 0.8 }),
  HD_shot(639.8, 461.0),
  c(644.3, "AS", 1661.0),
  s(649.4, "blackRainShirt", { fit: "cover" }),
  s(652.0, "blackRainWall", { fit: "mount", from: { z: 1 }, to: { z: 1.2 } }),
  c(658.6, "EF", 1460.0),
  c(664.1, "EF", 1440.8),
  c(667.6, "HN", 90.5),
  c(672.0, "HN", 184.8),
  c(675.0, "EF", 9807.1, { r: 0.85 }),
  c(679.0, "AS", 645.6),
  c(683.4, "EF", 1950.8),
  c(689.4, "EF", 1914.6),
  c(692.4, "EF", 1924.6),
  c(696.8, "EF", 1866.2),
  HD_shot(700.4, 799.0),
  c(704.4, "AS", 728.2),
  c(707.8, "AS", 772.7),
  c(710.0, "EF", 4471.4),
  c(712.6, "HN", 99.4),
  c(716.4, "FS", 680.0, { grade: "color" }),
  c(720.4, "FS", 98.0, { grade: "color" }),
  c(724.8, "FS", 234.0, { grade: "color" }),
  c(727.8, "EF", 2217.0),
  s(731.0, "kimono", { from: { z: 1, y: 0.4 }, to: { z: 1.1, y: 0.45 } }),
  c(737.6, "EF", 3223.0, { r: 0.9 }),
  c(744.4, "FS", 867.0, { grade: "color" }),
  c(749.4, "AS", 585.0),
  c(754.4, "EF", 3404.8, { from: { z: 1 }, to: { z: 1.25 } }),

  // ------------------------------------------------ VI. between myth and record
  c(766.8, "AS", 1390.0),
  c(773.0, "AS", 341.8),
  c(778.4, "AS", 1787.5, { r: 0.6 }),
  HD_shot(785.4, 727.5),
  HD_shot(789.6, 776.6),
  g(793.6, "book", { state: "title" }),
  c(800.0, "AS", 1690.0, { r: 0.6, blur: 5, dim: 0.5 }),
  HD_shot(806.0, 364.0, { r: 0.6, blur: 5, dim: 0.5 }),
  g(811.6, "book", { state: "page" }),
  c(821.0, "AS", 1825.0, { r: 0.7, dim: 0.35 }),
  c(828.0, "EF", 9088.5, { r: 0.8, dim: 0.3 }),
  g(835.6, "book", { state: "disputed" }),
  c(854.8, "AS", 264.0),
  s(858.6, "icrcTelegram", PAN_L),
  c(862.4, "EF", 4267.9),
  c(866.4, "AS", 457.3, { r: 0.85 }),
  c(870.0, "EF", 8763.8),
  c(874.0, "EF", 8870.4),
  HD_shot(878.2, 129.5),
  c(883.6, "AS", 794.4),
  HD_shot(887.0, 288.2),
  c(890.6, "HN", 73.0),
  c(895.6, "HN", 174.8, { r: 0.85 }),
  s(901.6, "domeNight", { from: { z: 1 }, to: { z: 1.12 } }),

  // ----------------------------------------------------------- VII. survivors
  c(915.4, "HN", 360.4, { r: 0.75 }),
  g(
    922.8,
    "toll",
    {},
    still("cloudsBoth", {
      from: { z: 1 },
      to: { z: 1.06 },
      dim: 0.78,
      blur: 2,
    }),
  ),
  s(934.2, "gokoku", PAN_R),
  c(938.6, "EF", 8836.6),
  HD_shot(943.4, 349.3),
  c(946.4, "AS", 1755.4, { r: 0.85 }),
  s(949.6, "koreanMemorial", {
    from: { z: 1, y: 0.35 },
    to: { z: 1.12, y: 0.3 },
  }),
  c(956.0, "ND", 166.6, { grade: "color" }),
  c(961.6, "HN", 252.5),
  c(967.6, "EF", 4440.0),
  c(972.2, "EF", 8741.4),
  g(975.6, "leukemia"),
  c(990.8, "EF", 4167.2, { r: 0.85 }),
  c(995.4, "EF", 4029.0),
  c(1001.0, "HN", 324.2),
  c(1005.2, "HN", 273.2),
  c(1008.3, "HN", 294.4, { r: 0.85 }),
  c(1013.6, "HN", 285.4),
  c(1018.1, "HN", 278.2),
  c(1021.5, "HN", 156.8),
  c(1024.5, "EF", 8870.4),
  c(1028.6, "HN", 300.0),
  c(1033.9, "HN", 307.0),
  c(1038.4, "N46", 44.2, { r: 0.85 }),
  c(1041.6, "N46", 40.2, { r: 0.85 }),
  c(1044.6, "EF", 3790.0),
  c(1048.0, "EF", 3810.0),
  c(1051.9, "N46", 27.6),
  c(1057.4, "HN", 333.4, { r: 0.85, from: { z: 1 }, to: { z: 1.15 } }),
  c(1063.0, "N46", 48.6),
  c(1066.4, "HN", 205.0),
  c(1070.0, "AS", 1814.0, { r: 0.8 }),
  c(1072.6, "HN", 341.4),
  c(1075.2, "HN", 349.0),
  c(1079.7, "TK", 318.6),
  s(1084.2, "cloudsBoth", { from: { z: 1.0 }, to: { z: 1.1 } }),
  g(1089.9, "twoBlack", {}, undefined, "cut"),

  // ---------------------------------------- VIII. the man who survived twice
  g(1096.2, "nameCard", { variant: "intro" }, undefined, "cut"),
  g(1099.0, "map", { preset: "business" }),
  c(1109.4, "HN", 222.0),
  s(1114.2, "aioiAiming", { from: { z: 1, y: 0.4 }, to: { z: 1.12, y: 0.45 } }),
  s(
    1118.6,
    "cloudHiroshima",
    { from: { z: 1.1, y: 0.4 }, to: { z: 1.2, y: 0.38 } },
    "flash",
  ),
  c(1121.4, "AS", 802.0, { from: { z: 1 }, to: { z: 1.1 } }),
  HD_shot(1126.4, 288.0),
  HD_shot(1129.4, 77.0),
  c(1133.6, "HN", 231.3),
  c(1136.5, "HN", 12.8),
  c(1139.4, "HN", 125.9),
  c(1142.9, "EF", 9840.4, { r: 0.85 }),
  g(1146.4, "map", { preset: "train" }),
  c(1151.2, "EF", 9830.4, { r: 0.85 }),
  c(1154.0, "HN", 438.6),
  c(1157.8, "AS", 1437.9, { r: 0.65 }),
  c(1160.6, "AS", 1427.0, { r: 0.6 }),
  c(1162.7, "AS", 905.4),
  c(1166.1, "IE", 140.0, { grade: "green", r: 0.85 }),
  c(1170.4, "AS", 1455.0),
  g(1176.6, "clock"),
  c(1180.1, "NB", 36.0, { grade: "color", crop: NB_CROP }, "flash"),
  c(1184.4, "AS", 1521.3),
  c(1188.4, "AS", 1744.0, { r: 0.75 }),
  g(1190.6, "oneMan"),
  c(1200.3, "EF", 8734.1, { r: 0.8 }),
  c(1203.0, "EF", 9817.5, { r: 0.85 }),
  c(1206.0, "HN", 54.8),
  s(1209.0, "childrensMonument", PAN_R),
  g(1214.4, "recognition"),
  g(1226.6, "nameCard", { variant: "memorial" }, HD(425.0, { dim: 0.55 })),
  s(1231.0, "dome2026", { from: { z: 1 }, to: { z: 1.1 } }),
  c(1235.4, "AS", 1800.0, { r: 0.85 }),
  HD_shot(1239.9, 518.5),
  HD_shot(1244.2, 356.0),
  c(1249.4, "AS", 1810.6, { r: 0.65 }),

  // ------------------------------------------------- IX. destroyer of worlds
  s(1251.9, "oppenheimer", { fit: "mount" }),
  g(
    1259.2,
    "quote",
    {},
    clip("TD", 600.0, { grade: "color", r: 0.6, dim: 0.45 }),
  ),
  c(1263.6, "AS", 100.0, { r: 0.8 }),
  c(1267.1, "N16", 156.4),
  HD_shot(1270.2, 120.0),
  c(1275.4, "TK", 145.0),
  c(1281.4, "TK", 236.6),
  c(1285.6, "HN", 18.3),
  c(1289.8, "AS", 1540.0),
  c(1294.2, "NB", 53.0, { grade: "color", crop: NB_CROP }),
  s(1298.0, "cloudNagasaki", {
    from: { z: 1.1, y: 0.3 },
    to: { z: 1.2, y: 0.25 },
  }),
  c(1301.0, "AS", 1490.0, { r: 0.7 }),
  c(1304.2, "HN", 200.0),
  c(1308.2, "HN", 296.0),
  c(1309.7, "HN", 160.0),
  c(1312.0, "AS", 1434.2, { r: 0.9 }),
  c(1314.1, "HN", 80.0),
  c(1317.8, "HN", 333.5, { r: 0.85 }),
  c(1324.4, "EF", 4243.4, { r: 0.8, from: { z: 1.1 }, to: { z: 1.3 } }),
  c(1327.0, "N46", 283.4),
  c(1331.6, "N46", 368.4),
  c(1335.4, "N46", 300.0, { r: 0.7 }),
  s(1338.3, "ivyMike"),
  s(1343.7, "dome1952", PAN_L),
  s(1347.6, "dome2026", { from: { z: 1.12, x: 0.45 }, to: { z: 1.2, x: 0.5 } }),
  c(1352.4, "TR", 82.0),
  c(1355.2, "SM", 210.0),
  c(1357.5, "PO", 40.0, { grade: "color" }),
  s(1360.4, "potsdam", PAN_R),
  HD_shot(1365.6, 240.0),
  HD_shot(1369.3, 425.0),
  c(1371.6, "AS", 1506.0),
  c(1374.6, "EF", 8820.0),
  c(1376.1, "EF", 4142.4),
  HD_shot(1378.7, 358.0),
  s(1381.3, "cranes"),
  c(1384.6, "TD", 610.0, { grade: "color", r: 0.6 }),
  s(1391.4, "ivyMike", { from: { z: 1.15, y: 0.45 }, to: { z: 1.3, y: 0.4 } }),
  g(1395.4, "sting", { variant: "close" }),
  g(
    1400.4,
    "endCard",
    {},
    still("domeNight", { from: { z: 1.05 }, to: { z: 1.15 }, dim: 0.55 }),
  ),
];

function HD_shot(at: number, t: number, o: ClipOpts = {}): Shot {
  return { at, v: HD(t, o) };
}

// ----------------------------------------------------------------- overlays

export type Caption = {
  readonly at: number;
  readonly until: number;
  readonly title: string;
  readonly sub?: string;
};

/** Place and date captions. Facts only; nothing the narration contradicts. */
export const CAPTIONS: readonly Caption[] = [
  { at: 3.5, until: 8.6, title: "הירושימה, יפן", sub: "6 באוגוסט 1945" },
  {
    at: 139.7,
    until: 145.4,
    title: "ניסוי טריניטי",
    sub: "ניו מקסיקו · 16 ביולי 1945",
  },
  { at: 180.9, until: 184.2, title: "טיניאן", sub: "איי מריאנה · אוגוסט 1945" },
  {
    at: 188.4,
    until: 190.5,
    title: "קולונל פול טיבטס",
    sub: "טייס ה״אנולה גיי״",
  },
  { at: 253.1, until: 256.9, title: "נגסקי", sub: "9 באוגוסט 1945 · 11:02" },
  { at: 274.7, until: 281.2, title: "מנצ׳וריה", sub: "9 באוגוסט 1945" },
  { at: 287.0, until: 289.9, title: "הקיסר הירוהיטו" },
  { at: 290.2, until: 294.4, title: "שידור הכניעה", sub: "15 באוגוסט 1945" },
  {
    at: 294.8,
    until: 298.3,
    title: "USS מיזורי, מפרץ טוקיו",
    sub: "2 בספטמבר 1945",
  },
  {
    at: 949.8,
    until: 955.8,
    title: "האנדרטה לקורבנות הקוריאנים",
    sub: "פארק השלום, הירושימה",
  },
  { at: 967.8, until: 972.0, title: "מחקר המעקב אחר הניצולים" },
  { at: 1151.4, until: 1153.9, title: "8 באוגוסט 1945" },
  { at: 1231.2, until: 1235.2, title: "כיפת הגנבקו", sub: "הירושימה" },
  {
    at: 1252.2,
    until: 1258.9,
    title: "ג׳. רוברט אופנהיימר",
    sub: "מנהל מעבדת לוס אלמוס",
  },
  { at: 1267.3, until: 1270.0, title: "ניסוי טריניטי", sub: "16 ביולי 1945" },
  {
    at: 1338.5,
    until: 1343.5,
    title: "Ivy Mike",
    sub: "ניסוי המימן הראשון · 1952",
  },
  { at: 1327.2, until: 1338.1, title: "ניסויי ביקיני", sub: "1946" },
  { at: 1343.9, until: 1347.4, title: "כיפת הגנבקו", sub: "1952" },
  { at: 1347.8, until: 1352.2, title: "כיפת הגנבקו", sub: "2026" },
  { at: 1357.7, until: 1365.4, title: "ועידת פוטסדאם", sub: "יולי 1945" },
];

export type Chapter = {
  readonly at: number;
  readonly n: string;
  readonly title: string;
};

export const CHAPTERS: readonly Chapter[] = [
  { at: 115.6, n: "I", title: "הדרך לאוגוסט 1945" },
  { at: 312.5, n: "II", title: "השניות הראשונות" },
  { at: 402.6, n: "III", title: "עיר בלי רופאים" },
  { at: 479.8, n: "IV", title: "המחלה הבלתי נראית" },
  { at: 633.2, n: "V", title: "הגשם השחור" },
  { at: 767.0, n: "VI", title: "בין מיתוס לעדות" },
  { at: 915.6, n: "VII", title: "אלה ששרדו" },
  { at: 1252.1, n: "IX", title: "מחריב העולמות" },
];

export type Kinetic = {
  readonly at: number;
  readonly until: number;
  readonly big: string;
  readonly small?: string;
  readonly note?: string;
  readonly latin?: boolean;
  readonly pos?: "center" | "low";
};

export const KINETIC: readonly Kinetic[] = [
  { at: 38.9, until: 41.75, big: "43", small: "שניות", pos: "center" },
  {
    at: 191.0,
    until: 193.8,
    big: "Little Boy",
    small: "פצצת אורניום",
    latin: true,
    pos: "low",
  },
  {
    at: 201.2,
    until: 205.1,
    big: "15,000",
    small: "טון TNT · בקירוב",
    pos: "center",
  },
  {
    at: 231.6,
    until: 236.4,
    big: "Fat Man",
    small: "פצצת פלוטוניום",
    latin: true,
    pos: "low",
  },
  {
    at: 537.2,
    until: 545.4,
    big: "תסמונת קרינה חריפה",
    small: "Acute Radiation Syndrome",
    pos: "low",
  },
  {
    at: 654.9,
    until: 658.5,
    big: "黒い雨",
    small: "״הגשם השחור״",
    pos: "center",
  },
  { at: 995.8, until: 1000.9, big: "בלוטת התריס · שד · ריאות", pos: "low" },
  {
    at: 1057.8,
    until: 1062.9,
    big: "被爆者",
    small: "היבקושה",
    note: "״אנשים שנפגעו מהפצצה״",
    pos: "center",
  },
];

/** Light-and-sound punctuation. Also read by the score tool. */
export const FLASHES: readonly number[] = [41.8, 257.0, 1118.6, 1180.1];

/** Black rain overlay: [from, to, strength]. */
export const RAIN: readonly (readonly [number, number, number])[] = [
  [628.5, 649.4, 1],
  [658.6, 664.1, 0.7],
  [667.6, 672.0, 0.8],
  [712.6, 716.4, 0.8],
];

/** The subscribe reminder, while the narration asks for it. */
export const SUBSCRIBE = { at: 909.4, until: 915.0 } as const;

// ------------------------------------------------------------ clip handling

/** Seconds of overlap a shot keeps under its successor's dissolve. */
export const TAIL = 0.6;

/** File name of the cut segment a clip visual plays (public/hiroshima/clips). */
export const clipFile = (v: ClipV): string =>
  `${v.src}-${v.t.toFixed(2)}${v.crop ? "-c" : ""}-${v.grade ?? "bw"}${v.blur ? `-b${v.blur}` : ""}.mp4`;

export type ClipJob = {
  readonly file: string;
  readonly src: FilmId;
  readonly t: number;
  /** Seconds of source needed. */
  readonly need: number;
  readonly crop?: readonly [number, number, number, number];
  readonly grade: Grade;
  readonly blur?: number;
};

/** Every source segment the cut plays, with the length each must cover. */
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
      grade: clipV.grade ?? "bw",
      blur: clipV.blur,
    });
  });
  return [...jobs.values()];
};

/**
 * Colour grades as ffmpeg filter chains. They are baked into the cut clips and
 * the graded stills instead of applied as CSS filters: in the software
 * compositor the renderer runs on, a full-frame CSS filter roughly doubled the
 * time per frame.
 */
export const GRADE_FILTERS: Record<Grade, string> = {
  bw: "hue=s=0,eq=contrast=1.10:brightness=-0.015,colorchannelmixer=rr=1.0:gg=0.965:bb=0.88",
  green:
    "hue=s=0,eq=contrast=1.25:brightness=-0.03,colorchannelmixer=rr=1.0:gg=0.965:bb=0.88",
  color:
    "eq=saturation=0.78:contrast=1.06:brightness=-0.015,colorchannelmixer=rr=1.0:gg=0.975:bb=0.92",
  warm: "eq=saturation=0.8:contrast=1.05:brightness=-0.02,colorchannelmixer=rr=1.0:gg=0.96:bb=0.85",
};

/** A still as the edit uses it: which grade, and whether it is blurred. */
export const stillVariant = (v: StillV): string =>
  `${v.img}-${v.grade ?? "bw"}${v.blur ? `-b${v.blur}` : ""}`;

/** Every graded still the edit shows. */
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
  return [...map.values()];
};
