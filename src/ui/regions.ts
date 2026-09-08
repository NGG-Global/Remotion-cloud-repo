/**
 * Normalised coordinates of the interface elements in
 * `public/img/claude-home.jpg` (2959 x 1766).
 *
 * Values are fractions of the screenshot's width and height, not pixels, so
 * the same region drives a highlight, a zoom target and a cursor destination
 * regardless of how large the screenshot is drawn on the canvas.
 *
 * Measured against a percentage grid rendered over the screenshot — see
 * `src/dev/Calibration.tsx` if the screenshot is ever replaced.
 */
export type Region = {
  /** Left edge, 0-1. */
  readonly x: number;
  /** Top edge, 0-1. */
  readonly y: number;
  /** Width, 0-1. */
  readonly w: number;
  /** Height, 0-1. */
  readonly h: number;
};

export const REGIONS = {
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
} as const satisfies Record<string, Region>;

export type RegionName = keyof typeof REGIONS;

/** Centre point of a region, as fractions. */
export const regionCenter = (r: Region): { x: number; y: number } => ({
  x: r.x + r.w / 2,
  y: r.y + r.h / 2,
});

/**
 * Grows a region by a margin on every side, clamped to the screenshot bounds.
 * Highlights read better with a little air around the element.
 */
export const padRegion = (r: Region, padX: number, padY = padX): Region => {
  const x = Math.max(0, r.x - padX);
  const y = Math.max(0, r.y - padY);
  return {
    x,
    y,
    w: Math.min(1 - x, r.w + padX * 2),
    h: Math.min(1 - y, r.h + padY * 2),
  };
};
