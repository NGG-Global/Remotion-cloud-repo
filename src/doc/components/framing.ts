import type { ArchiveImage } from "../archive";

/** A framing of an image: focal point in image fractions, and a zoom over "cover". */
export type Framing = {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
};

/**
 * The band of zooms that still reads on screen, for one image in one frame.
 *
 * Zoom is expressed over "cover" because that is how a move is authored: 1 is
 * the smallest scale that fills the frame. On its own that is a bad yardstick,
 * because most of this archive is small and portrait-format. Covering a 16:9
 * frame with a 358 x 539 scan already means blowing it up 5.4x and throwing
 * away two thirds of the picture; any zoom on top of that is mush. So every
 * move is held inside a band:
 *
 * - `lo` is the whole picture on screen. Below it nothing is gained.
 * - `hi` is the deepest push worth showing, and never less than a little over
 *   `lo`, so material too small to survive any blow-up can still breathe
 *   instead of freezing.
 *
 * A move outside the band is not clipped shot by shot — see `fitZoomRange`,
 * which slides it back in and keeps the push.
 */
export type ZoomBand = {
  readonly lo: number;
  readonly hi: number;
  /** Scale at which the image exactly covers the frame. */
  readonly cover: number;
  /** Scale at which the whole image exactly fits. */
  readonly contain: number;
};

export type BandOptions = {
  /**
   * How far a move may push into a sheet, in frame pixels per source pixel.
   * 1.8 is about where a halftone scan still reads as an old picture rather
   * than as a broken one.
   */
  readonly maxUpscale?: number;
  /**
   * Hard ceiling on the blow-up, for material so small that even showing it
   * whole would mean enlarging it. Past 2.4 a scan stops being soft and starts
   * being pixels, so a tiny picture is left sitting smaller than the frame
   * rather than smeared across it.
   */
  readonly maxScale?: number;
  /** How far past "whole image" a move may breathe. 8% of the short side. */
  readonly breath?: number;
  /**
   * `contain` (default) lets a small picture sit whole on a mount; `cover`
   * keeps the frame full at all times, for a sheet the eye is not meant to
   * read - a dramatisation's backdrop, or a front page slamming in.
   */
  readonly floor?: "contain" | "cover";
};

export const zoomBand = (
  image: ArchiveImage,
  W: number,
  H: number,
  {
    maxUpscale = 1.8,
    maxScale = 2.4,
    breath = 1.08,
    floor = "contain",
  }: BandOptions = {},
): ZoomBand => {
  const cover = Math.max(W / image.w, H / image.h);
  const contain = Math.min(W / image.w, H / image.h);
  // The scale at which the whole picture is on screen - or, for a picture too
  // small to reach that honestly, the largest blow-up worth looking at.
  const whole = Math.min(contain, maxScale / breath);
  const lo = floor === "cover" ? 1 : whole / cover;
  const hi = Math.max(lo * breath, Math.min(maxUpscale, maxScale) / cover);
  return { lo, hi, cover, contain };
};

/**
 * Slide an authored move into the legal band, keeping its direction and as
 * much of its push as fits. A shot written 2.4 -> 2.9 on a picture that can
 * only carry 1.9 becomes 1.4 -> 1.9: the camera still moves in, it just starts
 * from somewhere the viewer can read.
 */
export const fitZoomRange = (
  a: number,
  b: number,
  band: ZoomBand,
): readonly [number, number] => {
  const span = Math.min(Math.abs(b - a), band.hi - band.lo);
  let top = Math.min(Math.max(a, b), band.hi);
  let bottom = top - span;
  if (bottom < band.lo) {
    bottom = band.lo;
    top = band.lo + span;
  }
  return a <= b ? [bottom, top] : [top, bottom];
};

export type Placement = {
  /** Frame pixels per source pixel. */
  readonly scale: number;
  readonly tx: number;
  readonly ty: number;
  /** Drawn size. */
  readonly dw: number;
  readonly dh: number;
  /** False when the image sits on a mount instead of filling the frame. */
  readonly covers: boolean;
};

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/**
 * Put the focal point at frame centre, at a legal scale, without letting an
 * edge of the sheet drift into frame: an image that covers is held against the
 * edges, one that does not is centred on its mount.
 */
export const place = (
  image: ArchiveImage,
  W: number,
  H: number,
  framing: Framing,
  band: ZoomBand,
): Placement => {
  const scale = band.cover * clamp(framing.zoom, band.lo, band.hi);
  const dw = image.w * scale;
  const dh = image.h * scale;
  const tx = dw >= W ? clamp(W / 2 - framing.x * dw, W - dw, 0) : (W - dw) / 2;
  const ty = dh >= H ? clamp(H / 2 - framing.y * dh, H - dh, 0) : (H - dh) / 2;
  return { scale, tx, ty, dw, dh, covers: dw >= W - 0.5 && dh >= H - 0.5 };
};
