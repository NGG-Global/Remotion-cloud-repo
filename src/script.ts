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
export const NARRATION_SECONDS_EP5 = 235.55;
export const NARRATION_SECONDS_EP6 = 184.32;
export const NARRATION_SECONDS_EP7 = 219.04;
export const NARRATION_SECONDS_EP8 = 207.22;

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
  { at: 301.74, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatIdEp4 = (typeof BEATS_EP4)[number]["id"];

/**
 * Episode 5: working with files, and where Chat stops and Cowork starts.
 *
 * Timings come from a segment-level transcription of `narration-ep5.mp3`.
 * Four corrections were applied against the raw pass, each checked by
 * transcribing the span on its own:
 *
 * - "שריקה" (a whistle) in a list of file types is "סריקה", a scan.
 * - "הרמת מספרים" is "ערמת מספרים", a heap of numbers.
 * - The pass split one sentence into "שהופך לשקיעה" plus "ולשקפים", inventing
 *   a third transformation. The audio has two: a methodology document that
 *   becomes slides, and a meeting summary that becomes a client email.
 * - "קורורק" / "קוורק" / "קורוק" is Cowork, which the interface names in
 *   Latin on the composer's own toggle. Written that way on screen.
 *
 * This episode leans on the interface: almost everything it describes — the
 * composer, attaching a file, the question you type, the Chat and Cowork
 * pills — is visible in the home screenshot, so those beats are filmed rather
 * than drawn. Where the subject is a folder on someone's own machine, which
 * no screenshot of the web app can show, it is drawn instead.
 */
export const BEATS_EP5 = [
  { at: 0.0, id: "hook" },
  { at: 9.6, id: "ask-instead" },
  { at: 13.52, id: "title" },

  { at: 19.84, id: "drag-in" },
  { at: 23.22, id: "formats" },
  { at: 29.6, id: "structure" },

  { at: 44.66, id: "dont-describe" },
  { at: 54.68, id: "say-why" },

  { at: 66.36, id: "summarize-weak" },
  { at: 75.28, id: "better-questions" },
  { at: 93.7, id: "multi-file" },
  { at: 109.9, id: "transform" },

  { at: 128.56, id: "why-cowork" },
  { at: 136.74, id: "same-claude" },
  { at: 145.02, id: "mode-anatomy" },
  { at: 174.32, id: "hand-over" },

  { at: 187.38, id: "which-when" },
  { at: 199.88, id: "switch" },
  { at: 208.76, id: "later" },

  { at: 215.04, id: "recap" },
  { at: 225.46, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatIdEp5 = (typeof BEATS_EP5)[number]["id"];

/**
 * Episode 6: pulling what you need straight out of Microsoft 365 — closing the
 * "working effectively" module that episodes 4 and 5 opened.
 *
 * Timings come from a segment-level transcription of `narration-ep6.mp3`,
 * anchored to the second each sentence begins. The episode has two halves. The
 * first is the everyday case the narration keeps returning to: you ask for a
 * result and Claude decides which system holds it — so the requests are filmed
 * in the real composer, and the routing and assembly that a screenshot cannot
 * show are drawn (`AskAcross`). The second is the one feature that behaves
 * differently — Teams meeting transcripts — which sits behind a separate
 * permission, so the Teams recording menu and Outlook are rebuilt as mockups
 * rather than screenshotted: those windows carry real names and inboxes that
 * should not travel in a shared video.
 */
export const BEATS_EP6 = [
  { at: 0.0, id: "recap" },
  { at: 5.1, id: "title" },

  { at: 10.74, id: "just-ask" },
  { at: 15.82, id: "email-ask" },
  { at: 26.14, id: "docs-ask" },

  { at: 34.26, id: "phrasing" },
  { at: 42.98, id: "decides" },
  { at: 49.06, id: "permissions" },

  { at: 53.08, id: "daily" },
  { at: 59.14, id: "prep-ask" },
  { at: 65.34, id: "picture" },
  { at: 72.26, id: "useful-when" },

  { at: 79.36, id: "no-dig" },
  { at: 85.78, id: "bigger" },
  { at: 88.16, id: "bigpic-ask" },
  { at: 96.56, id: "assemble" },
  { at: 108.38, id: "useful-before" },

  { at: 118.84, id: "pivot" },
  { at: 125.64, id: "transcripts" },
  { at: 129.36, id: "not-invite" },
  { at: 133.5, id: "transcript-ask" },

  { at: 138.7, id: "but-separate" },
  { at: 149.0, id: "needs-approval" },
  { at: 153.48, id: "not-a-bug" },
  { at: 158.5, id: "who-records" },

  { at: 164.46, id: "recap-module" },
  { at: 174.82, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatIdEp6 = (typeof BEATS_EP6)[number]["id"];

/**
 * Episode 7: projects — the first of the advanced module.
 *
 * Timings come from a segment-level transcription of `narration-ep7.mp3`,
 * anchored to the second each sentence begins. The episode is built around one
 * argument the narration returns to three times: what a project holds is
 * shared across its conversations, and what is said inside one of them is not.
 * So the two halves of a project — the material folder and the standing
 * instructions — are shown on a rebuilt interface (`ProjectCreate`,
 * `ProjectWorkspace`, `ProjectPanels`, `ProjectInstructionsDialog`), and the
 * relationship between them and the conversations above them, which no screen
 * shows, is drawn (`ProjectGround`, `SharedGroundSeparateChats`,
 * `MaterialsUpdate`).
 *
 * The interface here is drawn rather than screenshotted throughout. The
 * captures this was briefed from carry an account name, a real chat list and
 * an organisation's own projects, and episode 3 already set the rule: where a
 * screen would leak, draw it.
 */
export const BEATS_EP7 = [
  { at: 0.0, id: "hook" },
  { at: 9.9, id: "title" },

  { at: 16.36, id: "create" },
  { at: 23.22, id: "workspace" },
  { at: 26.5, id: "two-parts" },
  { at: 32.78, id: "sees-both" },

  { at: 40.52, id: "vs-chat" },
  { at: 42.86, id: "chat-or-home" },
  { at: 51.64, id: "recurring" },

  { at: 56.92, id: "folder" },
  { at: 62.0, id: "what-goes-in" },
  { at: 70.54, id: "knows-it" },
  { at: 76.22, id: "just-ask" },
  { at: 83.64, id: "updates" },
  { at: 86.46, id: "swap-version" },

  { at: 94.42, id: "instructions" },
  { at: 100.14, id: "instruction-example" },
  { at: 112.6, id: "saves" },
  { at: 118.14, id: "every-chat" },
  { at: 122.34, id: "write-once" },

  { at: 127.84, id: "the-point" },
  { at: 135.14, id: "shared" },
  { at: 144.08, id: "not-carried" },
  { at: 154.04, id: "not-a-limit" },
  { at: 157.94, id: "parallel" },
  { at: 169.38, id: "dont-rely" },
  { at: 177.88, id: "make-permanent" },

  { at: 185.3, id: "when" },
  { at: 190.58, id: "rule" },
  { at: 194.64, id: "worth-it" },
  { at: 202.74, id: "one-off" },

  { at: 210.1, id: "in-practice" },
  { at: 213.68, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatIdEp7 = (typeof BEATS_EP7)[number]["id"];

/**
 * Episode 8: skills — the last of the advanced module.
 *
 * Timings come from a segment-level transcription of `narration-ep8.mp3`,
 * anchored to the second each sentence begins.
 *
 * The episode turns on a distinction the narration says outright that people
 * get wrong: a project holds what you are working on, a skill holds how you
 * work. Neither half of that is visible in a screenshot, so most of the
 * episode is drawn rather than filmed — a procedure being re-explained and
 * then packaged (`RestatedProcedure`, `SkillPackage`), a request finding its
 * skill unprompted (`SkillMatch`), the three scopes side by side
 * (`ScopeCompare`), and the rule of thumb as a fork (`RuleRouter`). The
 * interface appears only where the narration sends the viewer to look, and
 * even there it is rebuilt: the real Skills panel lists an organisation's
 * private tooling and names the colleague who shared each one.
 */
export const BEATS_EP8 = [
  { at: 0.0, id: "hook" },
  { at: 7.26, id: "same-request" },
  { at: 13.78, id: "title" },

  { at: 16.64, id: "define-once" },
  { at: 27.86, id: "package" },
  { at: 32.26, id: "everywhere" },
  { at: 37.12, id: "no-need-to-ask" },
  { at: 41.7, id: "match" },

  { at: 48.7, id: "three-things" },
  { at: 54.12, id: "scope" },
  { at: 60.78, id: "project-scope" },
  { at: 73.18, id: "skill-scope" },
  { at: 80.58, id: "any-subject" },
  { at: 90.26, id: "rule" },
  { at: 97.74, id: "rule-skill" },

  { at: 102.14, id: "good-news" },
  { at: 106.38, id: "library" },
  { at: 109.68, id: "kinds" },
  { at: 117.48, id: "in-settings" },
  { at: 123.48, id: "org-ready" },
  { at: 131.36, id: "check-first" },

  { at: 140.52, id: "when-new" },
  { at: 143.48, id: "when-items" },
  { at: 152.08, id: "two-ways" },
  { at: 155.1, id: "write-it" },
  { at: 162.8, id: "show-it" },
  { at: 174.6, id: "thumb" },
  { at: 177.44, id: "new-hire" },

  { at: 184.98, id: "recap" },
  { at: 191.6, id: "both" },
  { at: 194.44, id: "module-done" },
  { at: 197.7, id: "outro" },
] as const satisfies readonly Beat[];

export type BeatIdEp8 = (typeof BEATS_EP8)[number]["id"];

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
export const EP5 = timeline(BEATS_EP5, NARRATION_SECONDS_EP5);
export const EP6 = timeline(BEATS_EP6, NARRATION_SECONDS_EP6);
export const EP7 = timeline(BEATS_EP7, NARRATION_SECONDS_EP7);
export const EP8 = timeline(BEATS_EP8, NARRATION_SECONDS_EP8);
