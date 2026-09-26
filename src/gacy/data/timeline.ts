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
];

/** Where the rebuilt cut currently ends; the draft's scenes cover the rest. */
export const REBUILT_UNTIL = 130.5;

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
];

export const shotEnd = (i: number): number =>
  i + 1 < SHOTS.length ? SHOTS[i + 1].at : REBUILT_UNTIL;
