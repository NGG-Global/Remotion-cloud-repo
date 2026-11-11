import type React from "react";
import type { Enter, Exit } from "../../gacy/engine/shot";
import type { WipeKind } from "../../gacy/engine/wipes";
import { EvidenceTable, FallRiver, Legend, LizzieWindow, MapShot, Nobody, NotAccurate, Portraits, Press, Rhyme, RopeShot, SecondStreetNoon, TitleShot } from "../shots/ColdOpen";
import {
  AndrewStreet,
  Apart,
  August,
  DeedAbby,
  DeedSisters,
  HillVsStreet,
  LizzieDislikes,
  LockedDoors,
  MillGateShot,
  MillTownShot,
  ModestHouse,
  Money,
  MotherDied,
  OddHouse,
  Sisters,
  SistersReact,
  Stepmother,
  TheHillShot,
  Thrifty,
  ThroughRooms,
} from "../shots/Family";
import { Doctor, InHindsight, NotRight, PoisonFear, Sick } from "../shots/Before";
import { AbbyUpstairs, AndrewLeaves, BridgetWindows, Dawn, EmmaAway, LizzieStays, MorseLeaves, WhoIsHome } from "../shots/Morning";
import { Attacked, BridgetWorks, DontKnow, FirstOnly, LizzieIroning, NineThirty, Nineteen, NobodyHeard, OnTheFloor } from "../shots/FirstMurder";
import { AndrewIn, AndrewReturns, BridgetOpens, DoesntKnow, FamousHouse, NoNote, Ordinary, SofaShot, TheNote } from "../shots/Andrew";
import { AndrewDead, BarnLoftShot, BridgetRests, DidNotFlee, LizzieSays, NeighborsCome, NinetyMinutes, StairsShot, TenEleven, TimePasses, ToTheBarn, Waited } from "../shots/Discovery";
import { BarnAnswers, ChurchShot, ClosingIn, DefenseWitnesses, Impossible, LastSaw, PoliceBarn, Questioning, ScaleShot, Strangers, SundaySchool, WhereWasShe } from "../shots/Suspicion";
import { ButProblem, DrugstoreShot, FamousDetail, NoPoison, NoVictims, Refused, SoundsBad } from "../shots/Poison";
import { Affected, Excluded, InquestShot, Morphine, NoLawyer, NotPart } from "../shots/Inquest";
import { AtTheStove, Burns, HarderToIgnore, HoldsDress, NotIdeal, OfCourse, Why } from "../shots/Dress";
import {
  BackToLizzie,
  CellarShot,
  Cleans,
  FatherHome,
  HatchetHead,
  Lantern,
  Ninety,
  NoConfession,
  NoDirect,
  NoMark,
  NoPrint,
  NoProof,
  NoWitness,
  Possible,
  SecondMurder,
  Theory,
  TheoryAbby,
  WeaponProblem,
} from "../shots/Evidence";
import { Defense, Free, PaleMan, Papers, Prosecution, ReasonableDoubt, SuspiciousMen, TrialOpens, Verdict, WasItHim, WhatIsMissing } from "../shots/Trial";
import { Deaths, Emma1905, FamilyPlot, InnocentLegally, MaplecroftShot, NameBelongs, Shunned, TheHillHome } from "../shots/After";
import {
  AlmostEverything,
  Circumstantial,
  IfNot,
  IfSheDid,
  IfSheDidnt,
  NeverKnown,
  NoEvidence,
  ReasonsNo,
  ReasonsYes,
  SomeoneElse,
  StillKnow,
  Survived,
  TheAnswer,
  Weaker,
  WhenHow,
  WhoHeld,
} from "../shots/Ending";

/**
 * Master timeline.
 *
 * The narration MP3 is the clock. Every `at` is seconds into
 * public/audio/lizzie-narration.mp3 and sits inside a measured pause of
 * the voice (word timings from a local faster-whisper pass; pauses from
 * the decoded audio envelope, snapped by tools in the scratch pass). A
 * shot runs until the next shot's `at`.
 */

export const NARRATION_SECONDS = 948.192653;
export const FPS = 30;
export const TOTAL_FRAMES = Math.ceil(NARRATION_SECONDS * FPS);

export type ShotSpec = {
  readonly id: string;
  readonly at: number;
  readonly C: React.FC;
  readonly enter?: Enter;
  readonly exit?: Exit;
};

const diss = (s: number): Enter => ({ kind: "dissolve", s });
const black = (s: number): Enter => ({ kind: "fromBlack", s });

export const SHOTS: readonly ShotSpec[] = [
  // Cold open
  { id: "press", at: 0, C: Press, enter: black(1.2) },
  { id: "legend", at: 3.1, C: Legend, enter: diss(0.6) },
  { id: "fall-river", at: 6.0, C: FallRiver, enter: diss(0.8) },
  { id: "second-street", at: 8.71, C: SecondStreetNoon },
  { id: "nobody", at: 15.05, C: Nobody },
  { id: "lizzie-window", at: 22.0, C: LizzieWindow },
  { id: "map", at: 26.45, C: MapShot, enter: diss(0.4) },
  { id: "rope", at: 30.85, C: RopeShot },
  { id: "rhyme", at: 35.8, C: Rhyme },
  { id: "not-accurate", at: 44.05, C: NotAccurate },
  { id: "evidence-table", at: 47.5, C: EvidenceTable, enter: diss(0.5) },
  { id: "portraits", at: 55.4, C: Portraits, enter: diss(0.6) },
  { id: "title", at: 64.1, C: TitleShot, enter: black(0.9) },
  // The family
  { id: "mill-town", at: 74.2, C: MillTownShot, enter: diss(0.8) },
  { id: "mill-gate", at: 77.19, C: MillGateShot },
  { id: "the-hill", at: 83.74, C: TheHillShot },
  { id: "andrew-street", at: 87.2, C: AndrewStreet },
  { id: "modest-house", at: 95.1, C: ModestHouse },
  { id: "thrifty", at: 99.7, C: Thrifty },
  { id: "hill-vs-street", at: 104.0, C: HillVsStreet },
  { id: "lizzie-dislikes", at: 112.7, C: LizzieDislikes },
  { id: "sisters", at: 115.3, C: Sisters },
  { id: "mother-died", at: 125.2, C: MotherDied, enter: diss(0.8) },
  { id: "stepmother", at: 131.9, C: Stepmother, enter: diss(0.6) },
  { id: "money", at: 141.2, C: Money },
  { id: "deed-abby", at: 143.8, C: DeedAbby },
  { id: "sisters-react", at: 148.05, C: SistersReact },
  { id: "deed-sisters", at: 150.55, C: DeedSisters },
  { id: "odd-house", at: 156.95, C: OddHouse, enter: diss(0.6) },
  { id: "through-rooms", at: 162.5, C: ThroughRooms },
  { id: "locked-doors", at: 167.15, C: LockedDoors },
  { id: "apart", at: 169.7, C: Apart },
  { id: "august", at: 173.6, C: August },
  // The days before
  { id: "not-right", at: 178.43, C: NotRight, enter: diss(0.6) },
  { id: "sick", at: 183.2, C: Sick },
  { id: "poison-fear", at: 186.75, C: PoisonFear },
  { id: "doctor", at: 189.8, C: Doctor },
  { id: "in-hindsight", at: 196.0, C: InHindsight, exit: { kind: "toBlack", s: 0.5 } },
  // Thursday morning
  { id: "dawn", at: 200.3, C: Dawn, enter: black(0.8) },
  { id: "emma-away", at: 204.85, C: EmmaAway },
  { id: "who-is-home", at: 208.55, C: WhoIsHome },
  { id: "morse-leaves", at: 218.2, C: MorseLeaves },
  { id: "andrew-leaves", at: 221.8, C: AndrewLeaves },
  { id: "abby-upstairs", at: 223.85, C: AbbyUpstairs },
  { id: "bridget-windows", at: 230.4, C: BridgetWindows },
  { id: "lizzie-stays", at: 233.0, C: LizzieStays },
  // The first murder
  { id: "nine-thirty", at: 235.05, C: NineThirty },
  { id: "dont-know", at: 241.3, C: DontKnow },
  { id: "attacked", at: 245.4, C: Attacked },
  { id: "nineteen", at: 252.15, C: Nineteen, enter: diss(0.4) },
  { id: "on-the-floor", at: 255.55, C: OnTheFloor, enter: diss(0.5) },
  { id: "nobody-heard", at: 257.6, C: NobodyHeard },
  { id: "bridget-works", at: 262.6, C: BridgetWorks },
  { id: "lizzie-ironing", at: 266.7, C: LizzieIroning },
  { id: "first-only", at: 273.75, C: FirstOnly },
  // Andrew comes home
  { id: "andrew-returns", at: 275.77, C: AndrewReturns },
  { id: "bridget-opens", at: 281.1, C: BridgetOpens },
  { id: "andrew-in", at: 283.1, C: AndrewIn },
  { id: "sofa", at: 284.9, C: SofaShot },
  { id: "ordinary", at: 290.45, C: Ordinary },
  { id: "doesnt-know", at: 299.0, C: DoesntKnow },
  { id: "famous-house", at: 302.25, C: FamousHouse, enter: diss(0.6) },
  { id: "the-note", at: 310.0, C: TheNote },
  { id: "no-note", at: 316.5, C: NoNote },
  // The barn and the discovery
  { id: "to-the-barn", at: 318.88, C: ToTheBarn },
  { id: "barn-loft", at: 322.7, C: BarnLoftShot },
  { id: "time-passes", at: 328.55, C: TimePasses, enter: diss(0.5) },
  { id: "bridget-rests", at: 332.8, C: BridgetRests },
  { id: "andrew-dead", at: 339.45, C: AndrewDead },
  { id: "ten-eleven", at: 345.0, C: TenEleven },
  { id: "lizzie-says", at: 353.8, C: LizzieSays },
  { id: "neighbors-come", at: 363.3, C: NeighborsCome },
  { id: "stairs", at: 369.0, C: StairsShot },
  { id: "ninety-minutes", at: 379.07, C: NinetyMinutes, enter: diss(0.4) },
  { id: "did-not-flee", at: 382.31, C: DidNotFlee, enter: diss(0.5) },
  { id: "waited", at: 389.75, C: Waited },
  // Suspicion
  { id: "closing-in", at: 395.9, C: ClosingIn, enter: diss(0.6) },
  { id: "impossible", at: 399.6, C: Impossible },
  { id: "church", at: 404.7, C: ChurchShot },
  { id: "sunday-school", at: 409.45, C: SundaySchool },
  { id: "strangers", at: 424.3, C: Strangers },
  { id: "questioning", at: 430.2, C: Questioning },
  { id: "where-was-she", at: 435.35, C: WhereWasShe },
  { id: "last-saw", at: 440.85, C: LastSaw },
  { id: "barn-answers", at: 444.7, C: BarnAnswers },
  { id: "police-barn", at: 451.5, C: PoliceBarn },
  { id: "defense-witnesses", at: 459.3, C: DefenseWitnesses, enter: diss(0.6) },
  { id: "scale", at: 464.33, C: ScaleShot, enter: diss(0.5) },
  // Poison
  { id: "famous-detail", at: 475.85, C: FamousDetail, enter: diss(0.6) },
  { id: "drugstore", at: 479.5, C: DrugstoreShot },
  { id: "refused", at: 490.72, C: Refused },
  { id: "sounds-bad", at: 493.92, C: SoundsBad, enter: diss(0.5) },
  { id: "but-problem", at: 501.23, C: ButProblem },
  { id: "no-poison", at: 509.22, C: NoPoison },
  { id: "no-victims", at: 518.1, C: NoVictims, enter: diss(0.5) },
  // The inquest
  { id: "inquest", at: 526.39, C: InquestShot, enter: black(0.5) },
  { id: "morphine", at: 535.4, C: Morphine },
  { id: "affected", at: 544.9, C: Affected },
  { id: "no-lawyer", at: 550.79, C: NoLawyer },
  { id: "excluded", at: 555.44, C: Excluded },
  { id: "not-part", at: 562.8, C: NotPart },
  // The dress
  { id: "harder-to-ignore", at: 569.61, C: HarderToIgnore, enter: diss(0.6) },
  { id: "at-the-stove", at: 579.64, C: AtTheStove },
  { id: "holds-dress", at: 582.11, C: HoldsDress },
  { id: "burns", at: 583.93, C: Burns },
  { id: "why", at: 585.45, C: Why },
  { id: "of-course", at: 591.88, C: OfCourse },
  { id: "not-ideal", at: 595.5, C: NotIdeal, exit: { kind: "toBlack", s: 0.4 } },
  // The channel, and what was missing
  { id: "lantern", at: 604.62, C: Lantern, enter: black(0.6) },
  { id: "back-to-lizzie", at: 616.0, C: BackToLizzie, enter: black(0.5) },
  { id: "no-direct", at: 624.45, C: NoDirect },
  { id: "no-witness", at: 626.39, C: NoWitness },
  { id: "no-confession", at: 629.12, C: NoConfession },
  { id: "no-print", at: 631.89, C: NoPrint },
  { id: "weapon-problem", at: 634.6, C: WeaponProblem },
  { id: "cellar", at: 637.5, C: CellarShot },
  { id: "hatchet-head", at: 641.17, C: HatchetHead },
  { id: "no-proof", at: 647.4, C: NoProof },
  { id: "theory", at: 654.5, C: Theory },
  { id: "theory-abby", at: 660.2, C: TheoryAbby, enter: diss(0.6) },
  { id: "cleans", at: 666.6, C: Cleans },
  { id: "ninety", at: 673.0, C: Ninety },
  { id: "father-home", at: 675.06, C: FatherHome },
  { id: "second-murder", at: 680.55, C: SecondMurder },
  { id: "no-mark", at: 685.1, C: NoMark },
  { id: "possible", at: 691.79, C: Possible },
  // The trial
  { id: "trial-opens", at: 697.58, C: TrialOpens, enter: diss(0.6) },
  { id: "papers", at: 703.55, C: Papers },
  { id: "prosecution", at: 706.07, C: Prosecution },
  { id: "defense", at: 715.98, C: Defense },
  { id: "what-is-missing", at: 723.23, C: WhatIsMissing },
  { id: "suspicious-men", at: 729.93, C: SuspiciousMen },
  { id: "pale-man", at: 734.06, C: PaleMan, enter: diss(0.6) },
  { id: "was-it-him", at: 740.91, C: WasItHim },
  { id: "reasonable-doubt", at: 746.8, C: ReasonableDoubt },
  { id: "verdict", at: 754.15, C: Verdict },
  { id: "free", at: 761.0, C: Free },
  // After
  { id: "maplecroft", at: 768.2, C: MaplecroftShot, enter: diss(0.8) },
  { id: "the-hill-home", at: 777.14, C: TheHillHome },
  { id: "innocent-legally", at: 785.24, C: InnocentLegally },
  { id: "shunned", at: 792.8, C: Shunned },
  { id: "name-belongs", at: 798.3, C: NameBelongs },
  { id: "1905", at: 802.85, C: Emma1905, enter: diss(0.6) },
  { id: "deaths", at: 813.15, C: Deaths, enter: diss(0.8) },
  { id: "family-plot", at: 822.05, C: FamilyPlot, enter: diss(0.8) },
  // The ending
  { id: "the-answer", at: 826.73, C: TheAnswer, enter: diss(0.8) },
  { id: "reasons-yes", at: 836.4, C: ReasonsYes },
  { id: "if-not", at: 850.95, C: IfNot },
  { id: "reasons-no", at: 864.46, C: ReasonsNo },
  { id: "no-evidence", at: 868.4, C: NoEvidence },
  { id: "weaker", at: 876.65, C: Weaker, enter: diss(0.5) },
  { id: "circumstantial", at: 883.7, C: Circumstantial, enter: diss(0.5) },
  { id: "survived", at: 889.82, C: Survived, enter: diss(0.6) },
  { id: "if-she-did", at: 895.27, C: IfSheDid, enter: diss(0.6) },
  { id: "if-she-didnt", at: 906.0, C: IfSheDidnt },
  { id: "someone-else", at: 909.95, C: SomeoneElse, enter: black(0.6) },
  { id: "never-known", at: 924.73, C: NeverKnown, enter: diss(0.6) },
  { id: "still-know", at: 927.57, C: StillKnow, enter: diss(0.8) },
  { id: "when-how", at: 934.7, C: WhenHow },
  { id: "almost-everything", at: 941.0, C: AlmostEverything, enter: diss(0.5) },
  { id: "who-held", at: 946.2, C: WhoHeld, enter: diss(0.6), exit: { kind: "toBlack", s: 0.8 } },
];

/** The last shot runs to the end of the narration file. */
export const END_SECONDS = TOTAL_FRAMES / FPS;

export type WipeSpec = {
  readonly at: number;
  readonly kind: WipeKind;
  readonly dur: number;
  readonly dir?: 1 | -1;
  readonly tone?: string;
};

export const WIPES: readonly WipeSpec[] = [
  { at: 47.5, kind: "flash", dur: 0.3, tone: "#fff2d8" },
  { at: 95.1, kind: "passerby", dur: 0.8, dir: -1 },
  { at: 141.2, kind: "folder", dur: 0.6, dir: 1 },
  { at: 235.05, kind: "dark", dur: 0.5 },
  { at: 252.15, kind: "folder", dur: 0.6, dir: -1 },
  { at: 302.25, kind: "flash", dur: 0.4, tone: "#fff2d8" },
  { at: 440.85, kind: "folder", dur: 0.6, dir: 1 },
  { at: 526.39, kind: "dark", dur: 0.4 },
  { at: 703.55, kind: "flash", dur: 0.4, tone: "#fff2d8" },
  { at: 826.73, kind: "dark", dur: 0.6 },
  { at: 941.0, kind: "folder", dur: 0.6, dir: 1 },
];

export type LabelSpec = {
  readonly from: number;
  readonly to: number;
  readonly line: string;
  readonly sub?: string;
};

export const LABELS: readonly LabelSpec[] = [
  { from: 6.6, to: 14.3, line: "פול ריבר, מסצ׳וסטס", sub: "אוגוסט 1892" },
  { from: 24.8, to: 29.6, line: "ליזי בורדן" },
  { from: 74.8, to: 77.0, line: "1892" },
  { from: 87.7, to: 91.4, line: "אנדרו ג׳קסון בורדן" },
  { from: 110.6, to: 114.6, line: "Second Street" },
  { from: 176.8, to: 181.4, line: "אוגוסט 1892" },
  { from: 201.2, to: 205.8, line: "יום חמישי", sub: "4.8.1892" },
  { from: 577.4, to: 581.2, line: "אליס ראסל" },
  { from: 698.2, to: 702.6, line: "יוני 1893", sub: "ניו בדפורד" },
  { from: 754.7, to: 758.8, line: "20.6.1893" },
  { from: 783.7, to: 787.4, line: "Maplecroft" },
  { from: 803.4, to: 807.2, line: "1905" },
  { from: 815.9, to: 819.6, line: "1927" },
  { from: 911.3, to: 915.0, line: "4.8.1892" },
];

export const shotEnd = (i: number): number => (i + 1 < SHOTS.length ? SHOTS[i + 1].at : END_SECONDS);
