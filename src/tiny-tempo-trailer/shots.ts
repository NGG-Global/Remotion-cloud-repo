import { CLIP_DATA, type ClipData, type ClipTask } from "./clipData";
import type { Rect } from "./components/GameClip";
import { FPS } from "./music";

export const CLIPS = CLIP_DATA;

const taskOf = (clip: ClipData, index: number): ClipTask => {
  const task = clip.tasks.find((t) => t.task === index);
  if (!task)
    throw new Error(`${clip.id} has no task ${index} in its recording`);
  return task;
};

/**
 * Clip seconds to start a shot so that a task's instant lands on the shot's `local`
 * frame: "the demonstration downbeat on frame 0" is `demoAt(clip, 2)`.
 */
export const demoAt = (clip: ClipData, index: number, local = 0): number =>
  taskOf(clip, index).demo - local / FPS;
export const responseAt = (clip: ClipData, index: number, local = 0): number =>
  taskOf(clip, index).response - local / FPS;
export const summaryAt = (clip: ClipData, local = 0, lead = 0.2): number => {
  if (clip.summaryAt === null)
    throw new Error(`${clip.id} was not recorded to its plaque`);
  return clip.summaryAt - lead - local / FPS;
};
/**
 * Local frames of a task's beats — the demonstration's and the player's — when the
 * demonstration downbeat sits on `local`. Every demonstration cue is a target shifted
 * back by the plan's own demo-to-response distance.
 */
export const hitFrames = (
  clip: ClipData,
  index: number,
  local = 0,
  which: "demo" | "response" | "both" = "both",
): number[] => {
  const task = taskOf(clip, index);
  const shift = task.response - task.demo;
  const toFrame = (t: number) => Math.round((t - task.demo) * FPS) + local;
  const demo = task.targets.map((t) => toFrame(t - shift));
  const response = task.targets.map(toFrame);
  return which === "demo"
    ? demo
    : which === "response"
      ? response
      : [...demo, ...response];
};

export const bpmOf = (clip: ClipData, index: number): number =>
  taskOf(clip, index).bpm;

/**
 * Regions of the recorded play screen, in its own pixels (1212 x 2154, the 720 x 1280
 * design box at 1.683 px a unit). Named after what the game puts there.
 */
export const REGION = {
  /** The act's stage: from under the pucks to the bench line. */
  stage: { x: 0, y: 420, w: 1212, h: 940 },
  /** A 16:9 window on the act, centred where the hammer meets the nail. */
  actWide: { x: 0, y: 560, w: 1212, h: 682 },
  /** The turn block and the verdict line under it, 16:9. */
  blockWide: { x: 0, y: 1330, w: 1212, h: 682 },
  /** The result: headline, pennants, plaque and the rows under it, Continue left out. */
  plaque: { x: 0, y: 150, w: 1212, h: 1680 },
  /** The finale stage on the map: bunting, puck and plate. */
  mapStage: { x: 0, y: 900, w: 1212, h: 682 },
  /** The lower two thirds of the screen, 9:16: the act and the block together. */
  playTall: { x: 106, y: 360, w: 1000, h: 1778 },
} as const satisfies Record<string, Rect>;
