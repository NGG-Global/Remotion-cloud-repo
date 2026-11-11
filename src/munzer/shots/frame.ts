import { W, H } from "../theme";

/**
 * Where a source sits in the 1920x1080 frame.
 *
 * `x`, `y` are the point of the source (0-1 across its width and height)
 * that should sit at frame centre; `z` is zoom relative to the smallest
 * scale that covers the frame. The placement is clamped so the frame is
 * always covered: asking for a point near the edge slides the crop as far
 * as it can go rather than pulling black into shot.
 */
export type Framing = { readonly x: number; readonly y: number; readonly z: number };

export const CENTER: Framing = { x: 0.5, y: 0.5, z: 1 };

export const place = (
  w: number,
  h: number,
  f: Framing,
  fit: "cover" | "contain" = "cover",
): { scale: number; tx: number; ty: number } => {
  const base = fit === "cover" ? Math.max(W / w, H / h) : Math.min(W / w, H / h);
  const scale = base * f.z;
  const sw = w * scale;
  const sh = h * scale;
  let tx = W / 2 - f.x * sw;
  let ty = H / 2 - f.y * sh;
  if (sw >= W) {
    tx = Math.min(0, Math.max(W - sw, tx));
  } else {
    tx = (W - sw) / 2;
  }
  if (sh >= H) {
    ty = Math.min(0, Math.max(H - sh, ty));
  } else {
    ty = (H - sh) / 2;
  }
  return { scale, tx, ty };
};

export const mix = (a: Framing, b: Framing, k: number): Framing => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  z: a.z + (b.z - a.z) * k,
});
