/**
 * Stills registry. Files live in public/hiroshima/stills; the provenance
 * record (Commons page, licence, author, date) is
 * public/hiroshima/stills/sources.json and the readable list is
 * docs/HIROSHIMA_SOURCES.md. Sizes are the downloaded pixel dimensions.
 */

export type StillImage = {
  readonly file: string;
  readonly w: number;
  readonly h: number;
  /** Short on-screen credit, for the CC-licensed images that require one. */
  readonly credit?: string;
};

const im = (
  file: string,
  w: number,
  h: number,
  credit?: string,
): StillImage => ({
  file,
  w,
  h,
  credit,
});

export const STILLS = {
  aioi1920s: im("aioi-1920s.jpg", 1920, 1240),
  aioiAiming: im("aioi-aiming.jpg", 1920, 2898),
  aioiPrewar: im("aioi-bridge-prewar.jpg", 1920, 1215),
  blackRainShirt: im(
    "black-rain-shirt.jpg",
    1920,
    1230,
    "Thejk1994 · CC BY-SA 4.0",
  ),
  blackRainWall: im(
    "black-rain-wall.jpg",
    642,
    792,
    "Thejk1994 · CC BY-SA 4.0",
  ),
  boyTreated: im("boy-treated.jpg", 1920, 1354),
  childrensMonument: im(
    "childrens-monument.jpg",
    1920,
    1498,
    "Sarah Stierch · CC BY 4.0",
  ),
  cloudHiroshima: im("cloud-hiroshima.jpg", 1920, 2264),
  cloudKure: im("cloud-kure.jpg", 950, 1218),
  cloudNagasaki: im("cloud-nagasaki.jpg", 1920, 2294),
  cloudsBoth: im("clouds-both.jpg", 1920, 1139),
  cranes: im("cranes-monument.jpg", 1920, 1280, "Sarah Stierch · CC BY 4.0"),
  dome1952: im("dome-1952.jpg", 1920, 1441),
  dome2026: im("dome-2026.jpg", 1920, 1280, "Hhc1984 · CC BY-SA 4.0"),
  domeNight: im("dome-night.jpg", 1920, 1277, "Mark de Man · CC BY-SA 4.0"),
  fatMan: im("fat-man.jpg", 1920, 1229),
  firestorm: im("firestorm-cloud.jpg", 1920, 1339),
  gokoku: im(
    "gokoku-lanterns.jpg",
    1920,
    1313,
    "Otis Historical Archives · CC BY 2.0",
  ),
  hirohito: im("hirohito.jpg", 1088, 1516),
  icrcTelegram: im(
    "icrc-telegram.jpg",
    1920,
    894,
    "ICRC Archives / RomanDeckert · CC BY-SA 4.0",
  ),
  ivyMike: im("ivy-mike.jpg", 1920, 1513),
  kimono: im("kimono-burns.jpg", 1920, 2402),
  koreanMemorial: im(
    "korean-memorial.jpg",
    1920,
    2560,
    "Hakkensha · CC BY-SA 4.0",
  ),
  littleBoy: im("little-boy.jpg", 1920, 1269),
  manchuria: im(
    "manchuria-border.jpg",
    550,
    390,
    "Russian Ministry of Defence · CC BY 4.0",
  ),
  meltedCoins: im("melted-coins.jpg", 1920, 1440, "Anagoria · CC BY-SA 3.0"),
  modelBefore: im("model-before.jpg", 1920, 1440, "javic · CC BY-SA 2.0"),
  motoyasu: im("motoyasu-bridge.jpg", 1920, 1231),
  oppenheimer: im(
    "oppenheimer.jpg",
    524,
    721,
    "Los Alamos National Laboratory",
  ),
  potsdam: im("potsdam-three.jpg", 1920, 1550),
  promoHall: im("promo-hall-1915.jpg", 1920, 1237),
  surrenderListen: im("surrender-listen.jpg", 1920, 1351),
  tibbets: im("tibbets-wave.jpg", 1113, 1376),
} as const satisfies Record<string, StillImage>;

export type StillId = keyof typeof STILLS;
