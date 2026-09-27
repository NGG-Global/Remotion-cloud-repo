import type React from "react";
import type { Enter, Exit } from "../engine/shot";
import type { WipeKind } from "../engine/wipes";
import {
  Closet,
  Crew,
  Descent,
  Driveway,
  Hall,
  Makeup,
  Morning,
  Party,
  PogoFilm,
  Screens,
  StreetPush,
} from "../shots/Opening";
import {
  Album,
  Cell,
  Chicago1942,
  Conviction,
  InFront,
  IowaLife,
  MovingIn,
  NoMoment,
  Nowhere,
  Release,
  SignsAndMap,
} from "../shots/EarlyLife";
import { BigParty, Business, ClownBoard, InHindsight, Mirror, Parade, PhotoOp } from "../shots/PublicLife";
import { Flyers, Handcuff, PathDiner, PathStation, PathWork, UnderTheHouse } from "../shots/Vanishings";
import { Burials, CastleShot, CrawlTour, OrdinaryHouse, Smell, Trenches } from "../shots/Underneath";
import { FewMinutes, MotherArrives, PharmacyNight, Shift, SummerJob, TellsMom, Waiting } from "../shots/Piest";
import {
  Cabinet,
  Invite,
  NeedToReturn,
  NotLetGo,
  NotebookShot,
  PoliceReturn,
  ReceiptShot,
  RecordFile,
  SearchHouse,
  SmellMoment,
  Stakeout,
  Station,
  TheaterShot,
  Warrant,
} from "../shots/Investigation";
import { AllFinds, DigBegins, FirstFind, Hatch, MoreFinds, River, ThirtyThree } from "../shots/Discovery";

/**
 * Master timeline.
 *
 * The narration MP3 is the clock. Every `at` is seconds into
 * public/audio/gacy-narration.mp3 and sits inside a measured pause of the
 * voice (word timings from a local faster-whisper pass; pauses from the
 * decoded audio envelope). A shot runs until the next shot's `at`.
 *
 * Wipes are objects crossing the lens, centred on a cut. Labels are the
 * only on-screen type, and they float above the shots so a cut never
 * clips one.
 */

export const NARRATION_SECONDS = 645.302857;
export const FPS = 30;
export const TOTAL_FRAMES = Math.ceil(NARRATION_SECONDS * FPS);

export type ShotSpec = {
  readonly id: string;
  readonly at: number;
  readonly C: React.FC;
  readonly enter?: Enter;
  readonly exit?: Exit;
};

export const SHOTS: readonly ShotSpec[] = [
  // Cold open
  { id: "street", at: 0, C: StreetPush, enter: { kind: "fromBlack", s: 1.4 } },
  { id: "pogo-film", at: 6.4, C: PogoFilm },
  { id: "makeup", at: 13.95, C: Makeup },
  { id: "screens", at: 16.9, C: Screens },
  { id: "closet", at: 26.4, C: Closet, exit: { kind: "toBlack", s: 0.45 } },
  { id: "morning", at: 30.05, C: Morning, enter: { kind: "fromBlack", s: 0.5 } },
  { id: "driveway", at: 37.4, C: Driveway },
  { id: "party", at: 39.95, C: Party },
  { id: "hall", at: 41.75, C: Hall },
  { id: "crew", at: 43.6, C: Crew },
  { id: "descent", at: 46.55, C: Descent, exit: { kind: "toBlack", s: 0.7 } },
  // Chicago, childhood, Iowa, prison, return
  { id: "chicago-1942", at: 66.95, C: Chicago1942, enter: { kind: "fromBlack", s: 0.8 } },
  { id: "album", at: 71.0, C: Album },
  { id: "no-moment", at: 80.2, C: NoMoment },
  { id: "signs-map", at: 87.6, C: SignsAndMap },
  { id: "iowa", at: 98.7, C: IowaLife },
  { id: "conviction", at: 105.5, C: Conviction },
  { id: "cell", at: 111.9, C: Cell },
  { id: "release", at: 116.5, C: Release },
  { id: "moving-in", at: 121.3, C: MovingIn },
  { id: "nowhere", at: 125.0, C: Nowhere },
  { id: "in-front", at: 128.3, C: InFront },
  // Public life and Pogo
  { id: "business", at: 130.5, C: Business },
  { id: "parade", at: 135.75, C: Parade },
  { id: "big-party", at: 140.4, C: BigParty },
  { id: "mirror", at: 142.9, C: Mirror },
  { id: "photo-op", at: 152.2, C: PhotoOp },
  { id: "clown-board", at: 158.2, C: ClownBoard },
  { id: "in-hindsight", at: 167.4, C: InHindsight },
  // The disappearances
  { id: "flyers", at: 175.75, C: Flyers, enter: { kind: "fromBlack", s: 0.6 } },
  { id: "path-work", at: 183.0, C: PathWork },
  { id: "path-diner", at: 185.3, C: PathDiner },
  { id: "path-station", at: 187.2, C: PathStation },
  { id: "handcuffs", at: 189.6, C: Handcuff },
  { id: "under-the-house", at: 201.2, C: UnderTheHouse, enter: { kind: "fromBlack", s: 1.2 } },
  // The crawl space
  { id: "crawl-tour", at: 222.8, C: CrawlTour, enter: { kind: "dissolve", s: 0.8 } },
  { id: "burials", at: 237.7, C: Burials, enter: { kind: "dissolve", s: 0.6 } },
  { id: "trenches", at: 244.9, C: Trenches, enter: { kind: "fromBlack", s: 0.5 } },
  { id: "smell", at: 256.9, C: Smell },
  { id: "castle", at: 273.2, C: CastleShot, enter: { kind: "fromBlack", s: 0.8 } },
  { id: "ordinary-house", at: 285.3, C: OrdinaryHouse },
  // Robert Piest
  { id: "pharmacy-night", at: 296.8, C: PharmacyNight, enter: { kind: "fromBlack", s: 0.6 } },
  { id: "shift", at: 301.3, C: Shift },
  { id: "mother-arrives", at: 310.6, C: MotherArrives },
  { id: "tells-mom", at: 312.6, C: TellsMom },
  { id: "summer-job", at: 318.4, C: SummerJob },
  { id: "few-minutes", at: 321.2, C: FewMinutes },
  { id: "waiting", at: 324.6, C: Waiting, exit: { kind: "toBlack", s: 0.6 } },
  // The investigation
  { id: "station", at: 331.3, C: Station, enter: { kind: "fromBlack", s: 0.5 } },
  { id: "notebook", at: 337.2, C: NotebookShot },
  { id: "cabinet", at: 342.4, C: Cabinet },
  { id: "record", at: 344.9, C: RecordFile },
  { id: "warrant", at: 348.3, C: Warrant },
  { id: "search", at: 352.2, C: SearchHouse },
  { id: "receipt", at: 356.0, C: ReceiptShot },
  { id: "not-let-go", at: 362.8, C: NotLetGo },
  { id: "stakeout", at: 365.3, C: Stakeout },
  { id: "invite", at: 373.4, C: Invite },
  { id: "smell-moment", at: 378.8, C: SmellMoment, exit: { kind: "toBlack", s: 0.12 } },
  { id: "need-to-return", at: 385.6, C: NeedToReturn, enter: { kind: "fromBlack", s: 0.9 } },
  { id: "theater", at: 392.8, C: TheaterShot, enter: { kind: "fromBlack", s: 0.8 } },
  { id: "police-return", at: 406.2, C: PoliceReturn },
  // The discovery
  { id: "hatch", at: 413.5, C: Hatch },
  { id: "dig-begins", at: 421.3, C: DigBegins },
  { id: "first-find", at: 426.3, C: FirstFind },
  { id: "more-finds", at: 428.3, C: MoreFinds },
  { id: "all-finds", at: 431.2, C: AllFinds },
  { id: "river", at: 438.9, C: River, enter: { kind: "dissolve", s: 0.6 } },
  { id: "thirty-three", at: 442.8, C: ThirtyThree, enter: { kind: "dissolve", s: 0.6 } },
];

/** Where the rebuilt cut currently ends; the draft's scenes cover the rest. */
export const REBUILT_UNTIL = 454.8;

export type WipeSpec = {
  readonly at: number;
  readonly kind: WipeKind;
  readonly dur: number;
  readonly dir?: 1 | -1;
  readonly tone?: string;
};

export const WIPES: readonly WipeSpec[] = [
  { at: 6.4, kind: "flash", dur: 0.34, tone: "#fff2d8" },
  { at: 13.95, kind: "flash", dur: 0.3, tone: "#fff2d8" },
  { at: 39.95, kind: "van", dur: 0.9, dir: -1, tone: "#d8d2c0" },
  { at: 41.75, kind: "passerby", dur: 0.8, dir: 1 },
  { at: 43.6, kind: "flash", dur: 0.5 },
  { at: 46.55, kind: "trunk", dur: 1.0, dir: -1 },
  { at: 111.9, kind: "dark", dur: 0.5 },
  { at: 121.3, kind: "van", dur: 0.9, dir: 1, tone: "#b8bcc0" },
  { at: 135.75, kind: "passerby", dur: 0.8, dir: -1 },
  { at: 142.9, kind: "dark", dur: 0.6 },
  { at: 158.2, kind: "flash", dur: 0.3, tone: "#fff8e8" },
  { at: 185.3, kind: "trunk", dur: 0.7, dir: 1 },
  { at: 187.2, kind: "trunk", dur: 0.7, dir: 1 },
  { at: 256.9, kind: "floor", dur: 1.0 },
  { at: 287.25, kind: "flash", dur: 0.5, tone: "#e8eeff" },
  { at: 296.8, kind: "dark", dur: 0.6 },
  { at: 337.2, kind: "folder", dur: 0.7, dir: -1 },
  { at: 344.9, kind: "folder", dur: 0.7, dir: 1 },
  { at: 352.2, kind: "dark", dur: 0.4 },
  { at: 365.3, kind: "dark", dur: 0.5 },
  { at: 373.4, kind: "flash", dur: 0.4, tone: "#e8eef4" },
  { at: 406.2, kind: "beam", dur: 0.9 },
  { at: 413.5, kind: "dark", dur: 0.4 },
];

export type LabelSpec = {
  readonly from: number;
  readonly to: number;
  readonly line: string;
  readonly sub?: string;
};

export const LABELS: readonly LabelSpec[] = [
  { from: 36.45, to: 39.7, line: "ג׳ון וויין גייסי" },
  { from: 67.7, to: 70.9, line: "שיקגו", sub: "1942" },
  { from: 106.6, to: 110.9, line: "1968" },
  { from: 117.3, to: 120.8, line: "1970" },
  { from: 146.8, to: 150.6, line: "Pogo the Clown" },
  { from: 176.3, to: 182.4, line: "1972 – 1978" },
  { from: 227.5, to: 231.8, line: "Crawl Space" },
  { from: 297.5, to: 301.0, line: "רוברט פיסט", sub: "בן 15" },
  { from: 302.2, to: 309.8, line: "דס פליינס", sub: "11.12.1978" },
  { from: 348.9, to: 351.9, line: "13.12.1978" },
  { from: 413.9, to: 417.4, line: "21.12.1978" },
];

export const shotEnd = (i: number): number =>
  i + 1 < SHOTS.length ? SHOTS[i + 1].at : REBUILT_UNTIL;
