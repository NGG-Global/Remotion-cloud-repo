import { staticFile } from "remotion";
import type { Region } from "./regions";

/**
 * The interface screenshots this series films, each with its own region map.
 *
 * Screenshots differ in aspect ratio, so a screen carries its native pixel
 * size alongside its regions: the camera needs the width to know how far it
 * can push in before the image softens, and the window needs the ratio to
 * size itself.
 *
 * Region coordinates are measured against a percentage grid rendered over the
 * screenshot — render the `Calibration` composition in `src/dev` to re-measure
 * after a screenshot is replaced.
 */
export type Screen = {
  /** Path inside `public/`, resolved with `staticFile()`. */
  readonly src: string;
  /** Native pixel size of the file. */
  readonly width: number;
  readonly height: number;
  readonly regions: Record<string, Region>;
  /**
   * Regions to blur by default.
   *
   * The captured interface carries real conversation titles and an account
   * name. Anything the video does not teach is blurred so the file can be
   * shared without carrying internal content with it.
   */
  readonly redact?: readonly Region[];
  /**
   * Scales the spotlight's dimming, 0-1.
   *
   * The scrim is tuned for the light interface. On an already-dark screenshot
   * the same strength crushes everything outside the ring to black, so a dark
   * screen asks for less.
   */
  readonly scrim?: number;
};

const homeRegions = {
  // --- Sidebar -----------------------------------------------------------
  logo: { x: 0.005, y: 0.004, w: 0.048, h: 0.032 },
  viewToggle: { x: 0.118, y: 0.008, w: 0.048, h: 0.03 },
  newChat: { x: 0.006, y: 0.05, w: 0.155, h: 0.033 },
  projects: { x: 0.006, y: 0.086, w: 0.155, h: 0.03 },
  artifacts: { x: 0.006, y: 0.118, w: 0.155, h: 0.03 },
  scheduled: { x: 0.006, y: 0.15, w: 0.155, h: 0.03 },
  customize: { x: 0.006, y: 0.181, w: 0.155, h: 0.03 },
  pinnedLabel: { x: 0.006, y: 0.243, w: 0.09, h: 0.022 },
  askNgg: { x: 0.006, y: 0.269, w: 0.155, h: 0.031 },
  chatsLabel: { x: 0.006, y: 0.329, w: 0.16, h: 0.024 },
  chatList: { x: 0.006, y: 0.355, w: 0.155, h: 0.545 },
  design: { x: 0.006, y: 0.911, w: 0.155, h: 0.031 },
  account: { x: 0.004, y: 0.958, w: 0.085, h: 0.036 },
  sidebarTools: { x: 0.104, y: 0.958, w: 0.06, h: 0.036 },
  sidebar: { x: 0.0, y: 0.0, w: 0.167, h: 1.0 },

  // --- Centre column -----------------------------------------------------
  greeting: { x: 0.487, y: 0.305, w: 0.19, h: 0.052 },
  composer: { x: 0.383, y: 0.389, w: 0.4, h: 0.121 },
  placeholder: { x: 0.394, y: 0.408, w: 0.108, h: 0.026 },
  /**
   * The composer's whole text line, inset from its border. Used to cover the
   * baked-in placeholder when typing a request into the interface.
   */
  promptLine: { x: 0.389, y: 0.4, w: 0.388, h: 0.038 },
  attach: { x: 0.396, y: 0.468, w: 0.017, h: 0.024 },
  modeToggle: { x: 0.414, y: 0.465, w: 0.072, h: 0.029 },
  chatPill: { x: 0.416, y: 0.465, w: 0.026, h: 0.029 },
  coworkPill: { x: 0.445, y: 0.465, w: 0.036, h: 0.029 },
  modelPicker: { x: 0.658, y: 0.468, w: 0.064, h: 0.024 },
  micButton: { x: 0.731, y: 0.466, w: 0.018, h: 0.026 },
  voiceButton: { x: 0.754, y: 0.466, w: 0.019, h: 0.026 },

  // --- Redaction regions -------------------------------------------------
  // Slightly larger than the elements they cover, so no row of real text
  // survives at an edge. Tuned to stop short of the Design row, which stays
  // legible because the video teaches it.
  redactChats: { x: 0.0, y: 0.344, w: 0.185, h: 0.564 },
  redactAccount: { x: 0.0, y: 0.947, w: 0.185, h: 0.053 },

  // --- Framing regions ---------------------------------------------------
  // Containers used as camera targets when the element being pointed at is a
  // small control. They are not interface elements in their own right.
  navBlock: { x: 0.0, y: 0.028, w: 0.185, h: 0.2 },
  pinnedBlock: { x: 0.0, y: 0.228, w: 0.185, h: 0.095 },
  designBlock: { x: 0.0, y: 0.855, w: 0.185, h: 0.13 },
  composerBlock: { x: 0.363, y: 0.365, w: 0.44, h: 0.17 },

  // --- Floating ----------------------------------------------------------
  editFab: { x: 0.971, y: 0.486, w: 0.027, h: 0.042 },
  ghost: { x: 0.975, y: 0.011, w: 0.017, h: 0.024 },
};

/** The model picker, open below the composer's model chip. */
const modelPickerRegions = {
  modelChip: { x: 0.648, y: 0.466, w: 0.078, h: 0.028 },
  panel: { x: 0.574, y: 0.5, w: 0.152, h: 0.288 },
  fable: { x: 0.576, y: 0.505, w: 0.148, h: 0.043 },
  opus: { x: 0.576, y: 0.555, w: 0.148, h: 0.041 },
  sonnet: { x: 0.576, y: 0.606, w: 0.148, h: 0.04 },
  haiku: { x: 0.576, y: 0.656, w: 0.148, h: 0.04 },
  effort: { x: 0.576, y: 0.709, w: 0.148, h: 0.036 },
  moreModels: { x: 0.576, y: 0.75, w: 0.148, h: 0.032 },
  /** The four named models as one block, for framing. */
  modelList: { x: 0.57, y: 0.498, w: 0.16, h: 0.202 },
  composer: { x: 0.383, y: 0.389, w: 0.4, h: 0.121 },
  redactChats: { x: 0.0, y: 0.344, w: 0.185, h: 0.564 },
  redactAccount: { x: 0.0, y: 0.947, w: 0.185, h: 0.053 },
} as const satisfies Record<string, Region>;

/** The composer's attachment and tools menu, open. */
const attachMenuRegions = {
  plusButton: { x: 0.396, y: 0.468, w: 0.018, h: 0.024 },
  panel: { x: 0.393, y: 0.499, w: 0.106, h: 0.372 },

  addFiles: { x: 0.398, y: 0.506, w: 0.096, h: 0.025 },
  screenshot: { x: 0.398, y: 0.538, w: 0.096, h: 0.025 },
  addToProject: { x: 0.398, y: 0.569, w: 0.096, h: 0.025 },
  addFromGithub: { x: 0.398, y: 0.602, w: 0.096, h: 0.025 },
  /** The four "bring material in" items as one block. */
  inputGroup: { x: 0.395, y: 0.502, w: 0.102, h: 0.13 },

  skills: { x: 0.398, y: 0.642, w: 0.096, h: 0.024 },
  connectors: { x: 0.398, y: 0.673, w: 0.096, h: 0.024 },
  addPlugins: { x: 0.398, y: 0.704, w: 0.096, h: 0.025 },
  /** Skills, connectors and plugins as one block. */
  extendGroup: { x: 0.395, y: 0.638, w: 0.102, h: 0.096 },

  askNgg: { x: 0.398, y: 0.745, w: 0.096, h: 0.025 },
  research: { x: 0.398, y: 0.776, w: 0.096, h: 0.025 },
  webSearch: { x: 0.398, y: 0.808, w: 0.096, h: 0.025 },
  memory: { x: 0.398, y: 0.84, w: 0.096, h: 0.025 },
  /** The four toggles at the foot of the menu. */
  contextGroup: { x: 0.395, y: 0.741, w: 0.102, h: 0.128 },

  composer: { x: 0.383, y: 0.389, w: 0.4, h: 0.121 },
  redactChats: { x: 0.0, y: 0.344, w: 0.185, h: 0.564 },
  redactAccount: { x: 0.0, y: 0.947, w: 0.185, h: 0.053 },
} as const satisfies Record<string, Region>;

/** Settings, on the General tab. */
const settingsRegions = {
  modal: { x: 0.198, y: 0.105, w: 0.604, h: 0.779 },
  nav: { x: 0.2, y: 0.19, w: 0.104, h: 0.27 },
  search: { x: 0.206, y: 0.115, w: 0.09, h: 0.03 },

  general: { x: 0.202, y: 0.197, w: 0.1, h: 0.031 },
  account: { x: 0.202, y: 0.229, w: 0.1, h: 0.03 },
  privacy: { x: 0.202, y: 0.261, w: 0.1, h: 0.031 },
  usage: { x: 0.202, y: 0.293, w: 0.1, h: 0.031 },
  capabilities: { x: 0.202, y: 0.325, w: 0.1, h: 0.031 },
  memory: { x: 0.202, y: 0.357, w: 0.1, h: 0.031 },
  claudeCode: { x: 0.202, y: 0.389, w: 0.1, h: 0.031 },
  cowork: { x: 0.202, y: 0.422, w: 0.1, h: 0.031 },
  customizeLink: { x: 0.202, y: 0.838, w: 0.1, h: 0.031 },

  profileHeading: { x: 0.324, y: 0.161, w: 0.06, h: 0.021 },
  avatar: { x: 0.762, y: 0.209, w: 0.028, h: 0.039 },
  fullName: { x: 0.655, y: 0.272, w: 0.133, h: 0.03 },
  callYou: { x: 0.655, y: 0.327, w: 0.133, h: 0.03 },
  workType: { x: 0.735, y: 0.386, w: 0.053, h: 0.021 },
  instructionsLabel: { x: 0.324, y: 0.436, w: 0.096, h: 0.021 },
  instructionsBox: { x: 0.324, y: 0.51, w: 0.464, h: 0.088 },
  /** The label and its field, framed together. */
  instructionsBlock: { x: 0.318, y: 0.43, w: 0.476, h: 0.172 },

  preferencesHeading: { x: 0.324, y: 0.652, w: 0.076, h: 0.021 },
  appearance: { x: 0.734, y: 0.699, w: 0.055, h: 0.031 },
  chatFont: { x: 0.709, y: 0.754, w: 0.08, h: 0.029 },
  motion: { x: 0.695, y: 0.806, w: 0.094, h: 0.043 },
  preferencesBlock: { x: 0.318, y: 0.645, w: 0.476, h: 0.215 },

  redactChats: { x: 0.0, y: 0.34, w: 0.185, h: 0.56 },
  redactAccount: { x: 0.0, y: 0.935, w: 0.185, h: 0.065 },
} as const satisfies Record<string, Region>;

/** The connector directory under Customize. */
const connectorsRegions = {
  customizeNav: { x: 0.004, y: 0.179, w: 0.157, h: 0.028 },
  title: { x: 0.336, y: 0.057, w: 0.075, h: 0.028 },

  tabSkills: { x: 0.341, y: 0.111, w: 0.025, h: 0.028 },
  tabConnectors: { x: 0.369, y: 0.111, w: 0.058, h: 0.028 },
  tabPlugins: { x: 0.432, y: 0.111, w: 0.031, h: 0.028 },
  tabDiscover: { x: 0.487, y: 0.111, w: 0.047, h: 0.028 },
  tabYours: { x: 0.541, y: 0.111, w: 0.024, h: 0.028 },
  /** The whole tab strip, for framing. */
  tabStrip: { x: 0.335, y: 0.106, w: 0.235, h: 0.038 },

  search: { x: 0.336, y: 0.205, w: 0.43, h: 0.036 },
  filter: { x: 0.773, y: 0.205, w: 0.056, h: 0.036 },
  showAll: { x: 0.761, y: 0.263, w: 0.065, h: 0.021 },

  googleDrive: { x: 0.334, y: 0.305, w: 0.246, h: 0.081 },
  gmail: { x: 0.584, y: 0.305, w: 0.246, h: 0.081 },
  googleCalendar: { x: 0.334, y: 0.403, w: 0.246, h: 0.081 },
  canva: { x: 0.584, y: 0.403, w: 0.246, h: 0.081 },
  microsoft365: { x: 0.334, y: 0.5, w: 0.246, h: 0.081 },
  notion: { x: 0.584, y: 0.5, w: 0.246, h: 0.081 },
  figma: { x: 0.334, y: 0.598, w: 0.246, h: 0.081 },
  slack: { x: 0.584, y: 0.598, w: 0.246, h: 0.081 },
  /** The connected badge on Microsoft 365. */
  microsoft365Badge: { x: 0.551, y: 0.525, w: 0.021, h: 0.028 },
  googleDriveBadge: { x: 0.551, y: 0.328, w: 0.021, h: 0.028 },
  /** The two connectors this organisation already has on. */
  connectedPair: { x: 0.33, y: 0.3, w: 0.254, h: 0.29 },
  grid: { x: 0.33, y: 0.3, w: 0.504, h: 0.38 },

  redactChats: { x: 0.0, y: 0.34, w: 0.168, h: 0.56 },
  redactAccount: { x: 0.0, y: 0.935, w: 0.185, h: 0.065 },
} as const satisfies Record<string, Region>;

/** The public download page. */
const downloadRegions = {
  logo: { x: 0.074, y: 0.03, w: 0.073, h: 0.03 },
  tryClaude: { x: 0.86, y: 0.028, w: 0.067, h: 0.034 },
  heading: { x: 0.074, y: 0.183, w: 0.137, h: 0.05 },
  subtitle: { x: 0.074, y: 0.263, w: 0.179, h: 0.063 },

  desktopCard: { x: 0.365, y: 0.185, w: 0.27, h: 0.53 },
  macos: { x: 0.383, y: 0.361, w: 0.234, h: 0.043 },
  windows: { x: 0.383, y: 0.437, w: 0.234, h: 0.042 },
  windowsArm: { x: 0.383, y: 0.512, w: 0.234, h: 0.042 },
  linux: { x: 0.383, y: 0.587, w: 0.234, h: 0.043 },
  enterprise: { x: 0.383, y: 0.659, w: 0.234, h: 0.038 },

  mobileCard: { x: 0.655, y: 0.185, w: 0.27, h: 0.53 },
  ios: { x: 0.673, y: 0.568, w: 0.234, h: 0.043 },
  android: { x: 0.673, y: 0.644, w: 0.234, h: 0.043 },

  scienceBanner: { x: 0.365, y: 0.752, w: 0.56, h: 0.12 },
} as const satisfies Record<string, Region>;

export const SCREENS = {
  /** The signed-in home screen. Used through episode 1's workspace tour. */
  home: {
    src: staticFile("img/claude-home.jpg"),
    width: 2959,
    height: 1766,
    regions: homeRegions,
    redact: [homeRegions.redactChats, homeRegions.redactAccount],
  },

  /** The model picker, open. */
  modelPicker: {
    src: staticFile("img/model-picker.jpg"),
    width: 2959,
    height: 1769,
    regions: modelPickerRegions,
    redact: [modelPickerRegions.redactChats, modelPickerRegions.redactAccount],
  },

  /** The composer's attachment and tools menu, open. */
  attachMenu: {
    src: staticFile("img/attach-menu.jpg"),
    width: 2960,
    height: 1769,
    regions: attachMenuRegions,
    redact: [attachMenuRegions.redactChats, attachMenuRegions.redactAccount],
  },

  /** Settings, on the General tab. */
  settings: {
    src: staticFile("img/settings.jpg"),
    width: 2960,
    height: 1796,
    regions: settingsRegions,
    redact: [settingsRegions.redactChats, settingsRegions.redactAccount],
  },

  /** The connector directory under Customize. */
  connectors: {
    src: staticFile("img/connectors.jpg"),
    width: 2960,
    height: 1796,
    regions: connectorsRegions,
    redact: [connectorsRegions.redactChats, connectorsRegions.redactAccount],
  },

  /** The public download page. */
  download: {
    src: staticFile("img/download.jpg"),
    width: 2959,
    height: 1595,
    regions: downloadRegions,
    // A dark marketing page: the ring carries the focus, so barely dim.
    scrim: 0.4,
  },
} as const satisfies Record<string, Screen>;

export type ScreenName = keyof typeof SCREENS;
