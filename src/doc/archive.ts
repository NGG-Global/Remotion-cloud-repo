/**
 * Registry of archival images, all from Wikimedia Commons.
 *
 * Every entry is a public-domain work from 1888-1902 (or a CC-licensed
 * reproduction of one); the provenance record is `public/archive/sources.json`
 * and the human-readable list is `public/archive/SOURCES.md`. Sizes are the
 * downloaded pixel dimensions, used to frame Ken Burns moves in image space.
 */
import { staticFile } from "remotion";

export type ArchiveImage = {
  readonly file: string;
  readonly w: number;
  readonly h: number;
};

const img = (file: string, w: number, h: number): ArchiveImage => ({
  file,
  w,
  h,
});

export const ARCHIVE = {
  // Punch cartoons, 1888
  nemesisOfNeglect: img("punch-nemesis-of-neglect.jpg", 1117, 1400),
  blindMansBuff: img("punch-ripper-cartoon.jpg", 717, 907),
  horribleLondon: img("punch-horrible-london.jpg", 587, 1024),
  // Illustrated press
  mizenFindsNichols: img("mizen-discovers-nichols.jpg", 509, 353),
  famousCrimes: img("famous-crimes-discovery.jpg", 2897, 4313),
  pennySep8: img("ipn-1888-09-08-penny.jpg", 1962, 3000),
  ipnSep15: img("ipn-1888-09-15.jpg", 1905, 2621),
  ipnSep22: img("ipn-1888-09-22.jpg", 1920, 2757),
  ipnOct13: img("ipn-1888-10-13.jpg", 1431, 1948),
  ipnOct20: img("ipn-1888-10-20.jpg", 1438, 1942),
  ipnNov3: img("ipn-1888-11-03.jpg", 1481, 2000),
  ipnNov24: img("ipn-1888-11-24.jpg", 1419, 1962),
  ipnChapman: img("ipn-chapman.jpg", 559, 604),
  ipnRipper: img("ipn-ripper-1.jpg", 399, 499),
  ipnMitreSquare: img("ipn-ripper-2.png", 680, 504),
  pennyOct13: img("penny-1888-10-13.jpg", 2858, 2138),
  pennyAldgate: img("penny-scenes-aldgate.jpg", 735, 1024),
  pennyBernerStreet: img("penny-berner-street.jpg", 750, 554),
  ilnSep22: img("iln-1888-09-22.jpg", 763, 1000),
  ilnOutcasts: img("iln-outcasts-sheds.jpg", 1260, 829),
  vigilanceCommittee: img("vigilance-committee.jpg", 711, 580),
  bloodhoundTrial: img("bloodhound-trial.jpg", 1500, 1117),
  suspiciousCharacter: img("jack-the-ripper-1888.jpg", 1175, 1245),
  ripperPuck: img("ripper-puck.jpg", 1125, 1600),
  millersCourtIpn: img("millers-court-ipn.jpg", 716, 600),
  whitechapelMurdersFr: img("whitechapel-murders-fr.jpg", 3840, 5774),
  rueWhitechapelFr: img("rue-whitechapel-fr.jpg", 2500, 1814),
  // Documents
  policeNotice: img("police-notice.jpg", 662, 1024),
  dearBoss: img("dear-boss-pt2.jpg", 708, 978),
  fromHell: img("from-hell-letter.jpg", 678, 972),
  saucyJacky: img("ripper-postcard.jpg", 630, 180),
  macnaghtenMemo: img("macnaghten-memorandum.jpg", 455, 857),
  // Places
  bucksRow: img("bucks-row.jpg", 358, 539),
  nicholsPlace: img("nichols-murder-place.jpg", 475, 599),
  hanbury29: img("hanbury-street-29.jpg", 447, 680),
  hanbury: img("hanbury.jpg", 334, 480),
  dutfieldsYard: img("dutfields-yard.jpg", 569, 477),
  bernerStreet: img("berner-street.jpg", 800, 530),
  millersCourt: img("millers-court-13.jpg", 330, 495),
  dorsetStreet: img("dorset-street-1902.jpg", 1276, 879),
  whitechapel1890: img("whitechapel-1890.jpg", 456, 572),
  colneyHatch: img("colney-hatch.jpg", 1756, 1162),
  colneyHatchIln: img("colney-hatch-2.jpg", 3840, 2721),
  // London
  doreWentworth: img("dore-wentworth-street.jpg", 1584, 1957),
  doreOverLondon: img("dore-over-london-by-rail.jpg", 650, 550),
  doreLudgate: img("dore-ludgate-hill.jpg", 1011, 1288),
  parliament: img("parliament-from-river.jpg", 3648, 2738),
  parliamentSepia: img("parliament-lccn.jpg", 3840, 3012),
  // Maps
  plan1894: img("plan-nichols-1894.jpg", 2848, 1860),
  boothWhitechapel: img("booth-map-whitechapel.jpg", 417, 432),
  boothCommercialRoad: img("booth-map-commercial-road.jpg", 563, 913),
  boothLondon: img("booth-map-1889-wellcome.jpg", 3840, 3519),
  // People
  nichols: img("nichols-portrait.jpg", 487, 295),
  chapman: img("chapman-portrait.jpg", 473, 652),
  stride: img("stride-portrait.jpg", 953, 1454),
  druitt: img("druitt.jpg", 285, 384),
  druittOval: img("druitt-oval.jpg", 318, 400),
  macnaghten: img("macnaghten.jpg", 330, 482),
  macnaghtenCartoon: img("macnaghten-cartoon.jpg", 300, 500),
  lusk: img("lusk.jpg", 465, 624),
  pcSmith: img("pc-william-smith.jpg", 241, 376),
} as const satisfies Record<string, ArchiveImage>;

export type ArchiveKey = keyof typeof ARCHIVE;

export const archiveSrc = (image: ArchiveImage): string =>
  staticFile(`archive/${image.file}`);
