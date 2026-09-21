import type { LottieAnimationData } from "@remotion/lottie";

/** Compact looping ring — enough Lottie structure to drive `@remotion/lottie`. */
export const pulseLottie: LottieAnimationData = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 400,
  h: 400,
  nm: "Pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Ring",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [360] },
          ],
        },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [70, 70, 100] },
            { t: 30, s: [112, 112, 100] },
            { t: 60, s: [70, 70, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [180, 180] },
        },
        {
          ty: "st",
          c: { a: 0, k: [0.043, 0.518, 0.953, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 14 },
          lc: 2,
          lj: 2,
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
};
