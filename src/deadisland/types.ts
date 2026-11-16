/**
 * Data model of the Dead Island documentary cut.
 *
 * The edit is data: `data/timeline.json` lists every shot against the
 * narration clock, `data/sources.json` lists where each source came from.
 * `tools/deadisland/cut.py` conforms each shot to a 1920×1080, 30 fps clip in
 * `public/deadisland/clips/<id>.mp4`; the composition only places those clips.
 */

export type Transition = "cut" | "dissolve" | "fadeFromBlack";

export type Shot = {
  /** Stable id; also the clip file name. */
  readonly id: string;
  /** Seconds into the narration at which the shot starts. It runs to the next shot's `at`. */
  readonly at: number;
  /** Source id from sources.json. */
  readonly src: string;
  /** In-point in the source, seconds. */
  readonly in: number;
  /** Playback speed (1 = real time). */
  readonly speed?: number;
  /** How the shot enters. Default: cut. */
  readonly transition?: Transition;
  /** Transition length in seconds. */
  readonly transitionDur?: number;
  /** Crop inside the source, as fractions: [x, y, w, h]. Used to remove bars or burnt-in overlays. */
  readonly crop?: readonly [number, number, number, number];
  /** Still frame held for the whole shot (archival stills only). */
  readonly freeze?: boolean;
  /** Level of the source's own sound under the narration (0–1). Default 0: silent. */
  readonly nat?: number;
  /** What the shot shows. */
  readonly subject: string;
  /** Chapter of the narration this shot belongs to. */
  readonly chapter: string;
};

export type Label = {
  /** Seconds into the narration. */
  readonly at: number;
  readonly dur: number;
  readonly line: string;
  readonly sub?: string;
};

export type Timeline = {
  readonly fps: number;
  readonly width: number;
  readonly height: number;
  /** Narration length in seconds; the film ends `tail` seconds later. */
  readonly narration: number;
  readonly tail: number;
  readonly shots: readonly Shot[];
  readonly labels: readonly Label[];
};
