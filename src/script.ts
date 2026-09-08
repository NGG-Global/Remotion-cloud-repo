/**
 * The video's timeline.
 *
 * `at` is the second in the narration at which each beat begins, taken from a
 * transcription of `public/audio/narration.mp3`. Scene lengths are derived
 * from the gaps between beats rather than written out, so re-timing a beat
 * cannot leave a scene overlapping its neighbour.
 *
 * On-screen text is written to reinforce the narration, not to duplicate it:
 * short phrases using the narrator's own terms. Nothing here is a caption.
 */

export type Beat = {
  /** Second at which this beat starts. */
  readonly at: number;
  /** Identifier, used to look the beat up when composing the video. */
  readonly id: string;
};

/** Length of each episode's narration track, in seconds. */
export const NARRATION_SECONDS = 218.57;
export const NARRATION_SECONDS_EP2 = 413.23;
export const NARRATION_SECONDS_EP3 = 276.24;
export const NARRATION_SECONDS_EP4 = 304.52;

export const BEATS = [
  { at: 0.0, id: "hook" },
  { at: 5.38, id: "title" },
  { at: 12.08, id: "roadmap" },
  { at: 20.48, id: "chapter-what" },
  { at: 22.76, id: "not-search" },
  { at: 29.34, id: "give-it" },
  { at: 42.64, id: "strengths" },
  { at: 53.6, id: "assistant" },
  { at: 61.98, id: "chapter-tasks" },
  { at: 67.1, id: "task-read" },
  { at: 77.38, id: "task-write" },
  { at: 88.02, id: "task-think" },
  { at: 97.34, id: "task-order" },
  { at: 106.4, id: "rule" },
  { at: 114.24, id: "chapter-spaces" },
  { at: 120.78, id: "spaces-tour" },
  { at: 149.4, id: "microsoft" },
  { at: 159.86, id: "next-video-teaser" },
  { at: 163.04, id: "chapter-limits" },
  { at: 166.54, id: "limit-accuracy" },
  { at: 177.96, id: "limit-judgement" },
  { at: 192.66, id: "limit-privacy" },
  { at: 201.96, id: "limit-effort" },
  { at: 207.94, id: "bottom-line" },
  { at: 213.62, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatId = (typeof BEATS)[number]["id"];

/**
 * Episode 2: installing, signing in, the four things on screen, choosing a
 * model, and the settings worth doing once.
 */
export const BEATS_EP2 = [
  { at: 0.0, id: "title" },
  { at: 5.0, id: "roadmap" },
  { at: 9.4, id: "hook-setting" },

  { at: 15.58, id: "chapter-account" },
  { at: 24.14, id: "account-decides" },
  { at: 33.36, id: "account-outside" },
  { at: 37.5, id: "platforms" },

  { at: 46.36, id: "why-install" },
  { at: 53.04, id: "desktop-unlocks" },
  { at: 64.78, id: "install-steps" },

  { at: 75.8, id: "first-open" },
  { at: 82.94, id: "entry-point" },
  { at: 86.32, id: "chat-history" },
  { at: 95.78, id: "attach" },
  { at: 105.94, id: "model-chip" },
  { at: 112.84, id: "settings-corner" },

  { at: 119.24, id: "chapter-models" },
  { at: 125.52, id: "model-family" },
  { at: 131.44, id: "model-axes" },
  { at: 140.26, id: "haiku" },
  { at: 152.82, id: "sonnet" },
  { at: 164.76, id: "sonnet-default" },
  { at: 172.64, id: "opus" },
  { at: 185.44, id: "fable" },
  { at: 194.64, id: "fable-plans" },
  { at: 202.54, id: "cost" },
  { at: 205.02, id: "strongest-not-right" },
  { at: 221.94, id: "consultant" },

  { at: 232.44, id: "effort-intro" },
  { at: 240.86, id: "effort-levels" },

  { at: 252.72, id: "experiment-intro" },
  { at: 263.38, id: "experiment-run" },
  { at: 271.12, id: "experiment-look" },
  { at: 280.86, id: "experiment-learn" },

  { at: 292.24, id: "chapter-settings" },
  { at: 300.66, id: "prefs-context" },
  { at: 310.82, id: "prefs-example" },
  { at: 322.62, id: "prefs-style" },
  { at: 334.02, id: "prefs-style-saves" },
  { at: 339.68, id: "capabilities" },
  { at: 352.04, id: "capabilities-know" },
  { at: 358.04, id: "connections-teaser" },
  { at: 367.68, id: "org-locked" },
  { at: 378.06, id: "org-level" },

  { at: 384.98, id: "summary" },
  { at: 396.42, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatIdEp2 = (typeof BEATS_EP2)[number]["id"];

/**
 * Episode 3: connecting to Microsoft 365, what that opens up, and — the part
 * the narration calls the most important — what Claude can and cannot see.
 */
export const BEATS_EP3 = [
  { at: 0.0, id: "recap" },
  { at: 5.54, id: "title" },
  { at: 11.38, id: "where-work-lives" },
  { at: 15.62, id: "hook" },

  { at: 26.7, id: "chapter-connect" },
  { at: 29.46, id: "connect-steps" },
  { at: 45.82, id: "access-scope" },
  { at: 50.7, id: "org-account-only" },

  { at: 61.76, id: "chapter-opens" },
  { at: 64.24, id: "outlook" },
  { at: 74.06, id: "calendar-questions" },
  { at: 91.1, id: "sharepoint" },
  { at: 107.1, id: "teams" },
  { at: 117.84, id: "teams-questions" },
  { at: 124.76, id: "transcript-required" },

  { at: 139.16, id: "no-need-to-know" },
  { at: 147.3, id: "one-request" },
  { at: 164.26, id: "the-big-change" },

  { at: 172.78, id: "chapter-permissions" },
  { at: 179.88, id: "sees-only-yours" },
  { at: 193.92, id: "no-master-key" },
  { at: 199.94, id: "same-rules" },

  { at: 210.78, id: "no-download" },

  { at: 225.68, id: "read-vs-do" },
  { at: 244.68, id: "send-example" },
  { at: 253.68, id: "rule" },
  { at: 263.68, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatIdEp3 = (typeof BEATS_EP3)[number]["id"];

/**
 * Episode 4: giving Claude context, and treating the first answer as a draft.
 *
 * Timings come from a segment-level transcription of `narration-ep4.mp3`. Two
 * corrections were applied against the raw output: the pass merged a ten-second
 * span and dropped the spoken example of a constraint (recovered by
 * transcribing 122.4-129.5 on its own), and it emitted "shorten it by a third"
 * twice where the audio says it once.
 *
 * Every beat here is carried by a purpose-built graphic rather than by a list
 * of phrases. Where a beat runs long, the graphic stages itself internally
 * instead of being split into more beats, so the picture develops with the
 * voice rather than cutting under it.
 */
export const BEATS_EP4 = [
  { at: 0.0, id: "gap" },
  { at: 13.5, id: "not-claude" },
  { at: 19.14, id: "promise" },

  { at: 28.16, id: "vague" },
  { at: 37.38, id: "for-nobody" },
  { at: 41.72, id: "brief" },
  { at: 55.56, id: "workable" },
  { at: 59.26, id: "what-changed" },
  { at: 66.98, id: "no-language" },

  { at: 78.66, id: "world-not-project" },
  { at: 85.68, id: "blanks" },
  { at: 98.56, id: "guesses" },
  { at: 104.06, id: "roughly-right" },

  { at: 108.14, id: "attach" },
  { at: 119.2, id: "constraint" },
  { at: 133.42, id: "rule-of-thumb" },

  { at: 142.64, id: "not-final" },
  { at: 151.52, id: "retype-loop" },
  { at: 161.36, id: "rounds" },
  { at: 168.2, id: "live-edits" },

  { at: 185.82, id: "context-stack" },
  { at: 194.16, id: "new-chat-cost" },
  { at: 199.48, id: "shared-draft" },

  { at: 211.62, id: "useful-feedback" },
  { at: 227.8, id: "specific-aim" },

  { at: 233.16, id: "everyday" },
  { at: 236.76, id: "one-thread" },
  { at: 282.86, id: "same-chat" },

  { at: 289.24, id: "next" },
] as const satisfies readonly Beat[];

export type BeatIdEp4 = (typeof BEATS_EP4)[number]["id"];

/**
 * Timeline lookups for one episode's beat list.
 *
 * Returning a pair of closures rather than exporting two functions per episode
 * keeps a composition from accidentally reading the other episode's timings,
 * which would silently place its scenes against the wrong voice track.
 */
export const timeline = <Id extends string>(
  beats: readonly { readonly at: number; readonly id: Id }[],
  totalSeconds: number,
) => {
  const at = (id: Id): number => {
    const beat = beats.find((b) => b.id === id);
    if (!beat) {
      throw new Error(`Unknown beat: ${id}`);
    }
    return beat.at;
  };

  /** Up to the next beat, or to the end of the narration for the last one. */
  const length = (id: Id): number => {
    const index = beats.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Unknown beat: ${id}`);
    }
    const next = beats[index + 1];
    return (next ? next.at : totalSeconds) - beats[index].at;
  };

  return { at, length, totalSeconds };
};

export const EP1 = timeline(BEATS, NARRATION_SECONDS);
export const EP2 = timeline(BEATS_EP2, NARRATION_SECONDS_EP2);
export const EP3 = timeline(BEATS_EP3, NARRATION_SECONDS_EP3);
export const EP4 = timeline(BEATS_EP4, NARRATION_SECONDS_EP4);
