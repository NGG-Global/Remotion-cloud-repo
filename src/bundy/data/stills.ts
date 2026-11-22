/**
 * Stills registry for the Bundy film. Files live in public/bundy/stills; the
 * provenance record (source page, licence, author, date) is
 * public/bundy/stills/sources.json and the readable list is
 * docs/BUNDY_SOURCES.md. Sizes are the installed pixel dimensions.
 *
 * There are no photographs of the victims here, and none of crime scenes.
 */

export type StillImage = {
  readonly file: string;
  readonly w: number;
  readonly h: number;
  /** Short on-screen credit, for the CC-licensed images that require one. */
  readonly credit?: string;
};

const im = (file: string, w: number, h: number, credit?: string): StillImage => ({
  file,
  w,
  h,
  credit,
});

export const STILLS = {
  // Bundy: State Archives of Florida, Florida Department of Corrections, FBI (public domain)
  headshot: im("bundy-headshot-1978.jpg", 600, 835),
  court: im("bundy-court.jpg", 600, 466),
  custody: im("bundy-custody.jpg", 865, 1200),
  prison1978: im("bundy-prison-1978.jpg", 600, 983),
  fbi: im("bundy-fbi.jpg", 576, 636),
  mug1980: im("bundy-mug-1980.jpg", 600, 849),
  mug1988: im("bundy-mug-1988.jpg", 659, 952),
  hagmaier: im("bundy-hagmaier.jpg", 500, 375),
  // Documents
  sentencing: im("sentencing.jpg", 1596, 2577, "dbking · CC BY 2.0"),
  // Places. EPA DOCUMERICA (U.S. National Archives) and the Library of Congress
  // (Carol M. Highsmith, John Margolies; no known restrictions), dated where known.
  pitkin: im("pitkin-courthouse.jpg", 1744, 1331),
  pitkin2: im("pitkin-courthouse-2.jpg", 1920, 1440),
  slc: im("slc-1972.jpg", 1920, 1301),
  slcMountains: im("slc-mountains-1972.jpg", 1764, 2600),
  slcSmog: im("slc-smog-1972.jpg", 1920, 1300),
  aspenStreet: im("aspen-street-1974.jpg", 1350, 2000),
  aspenMall: im("aspen-mall-1974.jpg", 1920, 1298),
  aspenShuttle: im("aspen-shuttle-1974.jpg", 1920, 1303),
  aspenChairlift: im("aspen-chairlift-1974.jpg", 1920, 1301),
  seattleRainier: im("seattle-rainier-1973.jpg", 1920, 1294),
  seattleI5: im("seattle-i5-1973.jpg", 1920, 1297),
  seattleElliott: im("seattle-elliott-1973.jpg", 1751, 2600),
  seattleSunrise: im("seattle-elliott-sunrise-1973.jpg", 1920, 1298),
  alki: im("alki-1973.jpg", 1920, 1317),
  alkiClams: im("alki-clams-1973.jpg", 1758, 2600),
  rentonBeach: im("renton-beach-1973.jpg", 1920, 1306),
  rentonLaunch: im("renton-launch-1973.jpg", 1920, 1305),
  vwWindow: im("vw-window-1973.jpg", 1920, 1297),
  vwPier: im("vw-pier-1972.jpg", 1920, 1316),
  highwayNight: im("highway-night-1973.jpg", 1920, 1303),
  tacomaStarlite: im("tacoma-starlite-1980.jpg", 1920, 1339),
  tacomaAnchor: im("tacoma-anchor-1980.jpg", 1920, 1322),
  fsuWestcott: im("fsu-westcott.jpg", 1920, 1440),
  tallahasseeTheater: im("tallahassee-theater-1980.jpg", 1920, 1290),
  tallahasseeCapitol: im("tallahassee-capitol-1980.jpg", 1681, 2138),
  pensacolaRex: im("pensacola-rex-1979.jpg", 1920, 1323),
  miamiDowntown: im("miami-downtown-1973.jpg", 1744, 2600),
  miamiSkyline: im("miami-skyline-1973.jpg", 1743, 2600),
} as const satisfies Record<string, StillImage>;

export type StillId = keyof typeof STILLS;
