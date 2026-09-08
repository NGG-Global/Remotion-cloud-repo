/**
 * Geometry helpers for interface regions.
 *
 * A region is expressed in fractions of its screenshot's width and height, not
 * in pixels, so the same value drives a highlight, a camera target and a
 * cursor destination regardless of how large the screenshot is drawn.
 *
 * The regions themselves live with their screenshot in `screens.ts`.
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
