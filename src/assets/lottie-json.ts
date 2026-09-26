export type LottieInspection =
  | {
      readonly ok: true;
      readonly width: number;
      readonly height: number;
      readonly op: number;
      readonly fr: number;
      readonly name: string;
    }
  | { readonly ok: false; readonly reason: string };

/** Structural check used before a Lottie file is mounted or accepted by preflight. */
export const inspectLottie = (value: unknown): LottieInspection => {
  if (!value || typeof value !== "object") {
    return { ok: false, reason: "Lottie JSON is not an object" };
  }
  const data = value as Record<string, unknown>;
  if (typeof data.w !== "number" || data.w <= 0) {
    return { ok: false, reason: "Lottie JSON is missing a positive w" };
  }
  if (typeof data.h !== "number" || data.h <= 0) {
    return { ok: false, reason: "Lottie JSON is missing a positive h" };
  }
  if (typeof data.op !== "number" || data.op <= 0) {
    return { ok: false, reason: "Lottie JSON is missing a positive op" };
  }
  if (typeof data.fr !== "number" || data.fr <= 0) {
    return { ok: false, reason: "Lottie JSON is missing a positive fr" };
  }
  if (!Array.isArray(data.layers) || data.layers.length === 0) {
    return { ok: false, reason: "Lottie JSON has no layers" };
  }
  return {
    ok: true,
    width: data.w,
    height: data.h,
    op: data.op,
    fr: data.fr,
    name: typeof data.nm === "string" ? data.nm : "",
  };
};
