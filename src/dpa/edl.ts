/**
 * The Dark Pictures Anthology documentary: edit decision list.
 *
 * The narration is the master clock. Every shot is stated in narration seconds
 * and converted to frames here, once, so the composition, the clip preparation
 * step and the QA checks all agree on where a cut falls.
 *
 * `data/edl.json` is the source of truth and is edited directly.
 * `data/clips.json` is written by `tools/dpa/prep.mjs` and maps a shot to the
 * trimmed clip prepared for it.
 */
import clipsJson from "./data/clips.json";
import edlJson from "./data/edl.json";

export type Transition = "cut" | "dissolve" | "fade";

export type Shot = {
  id: string;
  /** Narration time the shot occupies, in seconds. */
  start: number;
  end: number;
  chapter: string;
  game: string;
  /** What the narrator is talking about. */
  topic: string;
  /** Character, environment or action the picture has to show. */
  need: string;
  /** File under footage/dpa, or null while the shot is still unsourced. */
  source: string | null;
  /** In-point in the source, in seconds. Out-point is in + (end - start). */
  in: number | null;
  /** How this shot arrives. */
  transition: Transition;
  transitionFrames?: number;
  /**
   * Level of the clip's own game audio under the narration, in dB (for
   * example -24). Omit to keep the shot silent. Mixed by tools/dpa/render.mjs.
   */
  gain?: number;
  /** Punch-in to lose a HUD or subtitle: zoom >= 1, x and y from 0 to 1. */
  crop?: { zoom: number; x: number; y: number };
};

export type TimedShot = Shot & {
  /** First frame the shot is on screen, including a dissolve lead-in. */
  mount: number;
  /** Frame of the cut point this shot starts on. */
  from: number;
  /** Frame the shot ends on, exclusive. */
  to: number;
  fadeIn: number;
  fadeOut: number;
};

type Edl = {
  fps: number;
  width: number;
  height: number;
  narration: string;
  duration: number;
  shots: Shot[];
};

const edl = edlJson as Edl;

export const DPA_FORMAT = {
  fps: edl.fps,
  width: edl.width,
  height: edl.height,
} as const;

export const DPA_NARRATION = edl.narration;

export const toFrame = (seconds: number) => Math.round(seconds * edl.fps);

/** Rounded up so the last syllable of the narration is never clipped. */
export const DPA_DURATION = Math.ceil(edl.duration * edl.fps);

export const DEFAULT_TRANSITION_FRAMES: Record<Transition, number> = {
  cut: 0,
  dissolve: 12,
  fade: 15,
};

export const SHOTS: TimedShot[] = edl.shots.map((shot, i) => {
  const next = edl.shots[i + 1];
  const from = toFrame(shot.start);
  const to = next ? toFrame(next.start) : DPA_DURATION;
  const frames =
    shot.transitionFrames ?? DEFAULT_TRANSITION_FRAMES[shot.transition];
  const lead = shot.transition === "dissolve" ? Math.min(frames, from) : 0;
  // A fade is a dip to black: the outgoing shot fades out before the cut and
  // the incoming one fades up after it. The film also opens and closes on one.
  const fadeOut = !next
    ? DEFAULT_TRANSITION_FRAMES.fade
    : next.transition === "fade"
      ? (next.transitionFrames ?? DEFAULT_TRANSITION_FRAMES.fade)
      : 0;
  return {
    ...shot,
    mount: from - lead,
    from,
    to,
    fadeIn: shot.transition === "dissolve" ? lead : frames,
    fadeOut,
  };
});

export type PreparedClip = {
  /** Path under public/, passed to staticFile(). */
  file: string;
};

export const CLIPS = clipsJson as Record<string, PreparedClip>;
