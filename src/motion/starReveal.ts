/**
 * Result-star reveal. Pure `f(t)` so a Remotion preview and the Phaser result
 * screen can sample the same pose. TinyTempo ports this file's pose math into
 * `src/ui/starReveal.ts`; keep the numbers in lockstep.
 *
 * Seconds, not frames: the game samples the audio clock, and Remotion converts
 * `useCurrentFrame() / fps`.
 */

export const STAR_REVEAL = {
  count: 3,
  /** Seconds after the summary appears before the first star starts. */
  delay: 0.14,
  /** Seconds from the first star's start to the last. */
  spread: 0.5,
  /** Local age at which an earned star stamps the plaque. */
  impact: 0.2,
  /** Drop distance, in the same units as the star's authored radius. */
  drop: 1.65,
  /** Opening spin in radians (clockwise as it falls). */
  spin: 0.48,
} as const;

export interface StarPose {
  readonly alpha: number;
  /** Vertical offset in radius-units. Negative is above rest. */
  readonly drop: number;
  readonly scaleX: number;
  readonly scaleY: number;
  /** Radians. */
  readonly spin: number;
  /** 0 = empty silhouette, 1 = full prize fill. */
  readonly fill: number;
  /** Additive bloom behind the star. */
  readonly glow: number;
  /** Specular flash across the face, 0–1. */
  readonly shine: number;
  /** Idle sparkle after the stamp, 0–1. */
  readonly twinkle: number;
  /** Apparent thickness while in the air, 0 at rest. */
  readonly lift: number;
  /** True once the stamp has hit (or the empty star has arrived). */
  readonly landed: boolean;
}

const HIDDEN: StarPose = {
  alpha: 0,
  drop: 0,
  scaleX: 0,
  scaleY: 0,
  spin: 0,
  fill: 0,
  glow: 0,
  shine: 0,
  twinkle: 0,
  lift: 0,
  landed: false,
};

const SEAT: StarPose = {
  alpha: 1,
  drop: 0,
  scaleX: 1,
  scaleY: 1,
  spin: 0,
  fill: 0,
  glow: 0,
  shine: 0,
  twinkle: 0,
  lift: 0,
  landed: false,
};

export const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, value));

export const easeOut = (value: number): number => 1 - (1 - clamp01(value)) ** 3;

/** Damped spring settling to 1. Copied from TinyTempo `ui/spring.ts`. */
export function spring(t: number, damping = 4.5, cycles = 2.2): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.exp(-damping * t) * Math.cos(cycles * Math.PI * t);
}

export function overshoot(t: number, amount = 0.25): number {
  const p = clamp01(t);
  const s = backFactor(amount);
  return 1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2;
}

const factors = new Map<number, number>();
function backFactor(amount: number): number {
  if (amount <= 0) return 0;
  const cached = factors.get(amount);
  if (cached !== undefined) return cached;
  let s = 10 * (1 + amount);
  for (let i = 0; i < 12; i++) {
    const f = 4 * s ** 3 - 27 * amount * (s + 1) ** 2;
    const df = 12 * s ** 2 - 54 * amount * (s + 1);
    s -= f / df;
  }
  factors.set(amount, s);
  return s;
}

export function squash(age: number, duration: number, amount: number): number {
  if (age < 0 || age >= duration) return 0;
  return Math.sin((age / duration) * Math.PI) * amount;
}

export function settle(age: number, frequency: number, decay: number): number {
  if (!Number.isFinite(age) || age < 0) return 0;
  return Math.sin(age * frequency) * Math.exp(-age * decay);
}

export function stagger(index: number, count: number, spread: number): number {
  if (count <= 1) return 0;
  return (spread * Math.max(0, Math.min(count - 1, index))) / (count - 1);
}

/** Seconds since this star stamped, or `-1` before impact. */
export function starImpactAge(age: number, earned: boolean): number {
  if (!earned || age < STAR_REVEAL.impact) return -1;
  return age - STAR_REVEAL.impact;
}

/** Local age of star `index`. Pass a large age (or `still`) for the settled pose. */
export function starAge(
  summaryAge: number,
  index: number,
  still = false,
): number {
  if (still) return 8;
  return (
    summaryAge -
    STAR_REVEAL.delay -
    stagger(index, STAR_REVEAL.count, STAR_REVEAL.spread)
  );
}

/**
 * Pose of one result star. `exaggeration` is TinyTempo's treatment weight
 * (workshop is 1.35); Remotion previews at 1.35 so the two match.
 */
export function starPose(
  age: number,
  earned: boolean,
  exaggeration = 1.35,
): StarPose {
  if (age <= 0) {
    // Earned slots keep a recessed seat so the plaque is never an empty hole
    // while the medal is still in the air.
    return earned ? SEAT : HIDDEN;
  }

  if (!earned) {
    const p = clamp01(age / 0.34);
    const pop = overshoot(p, 0.08);
    return {
      alpha: easeOut(clamp01(age / 0.16)),
      drop: 0,
      scaleX: pop,
      scaleY: pop,
      spin: 0,
      fill: 0,
      glow: 0,
      shine: 0,
      twinkle: 0,
      lift: 0,
      landed: p >= 1,
    };
  }

  const arrive = clamp01(age / 0.26);
  const drop =
    (1 - easeOut(arrive)) * -STAR_REVEAL.drop +
    settle(age - STAR_REVEAL.impact, 26, 11) * 0.12;
  const squashAmt = squash(age - STAR_REVEAL.impact, 0.16, 0.16 * exaggeration);
  const size = overshoot(clamp01(age / 0.42), 0.16 * exaggeration);
  const spin = (1 - spring(clamp01(age / 0.5), 5.2, 1.7)) * -STAR_REVEAL.spin;
  const fill = easeOut(clamp01(age / 0.08));
  const impactAge = Math.max(0, age - STAR_REVEAL.impact);
  const bloom = Math.exp(-impactAge * 3.8) * 1.05;
  const idle = 0.16 + 0.1 * Math.sin(age * 4.4);
  const shine = Math.sin(clamp01((age - 0.22) / 0.3) * Math.PI);
  const twinkle =
    age > 0.52 ? 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(age * 6.8 + 0.8)) : 0;

  return {
    alpha: easeOut(clamp01(age / 0.07)),
    drop,
    scaleX: size * (1 + squashAmt),
    scaleY: size * (1 - squashAmt * 0.82),
    spin,
    fill,
    glow: (bloom + idle) * fill,
    shine: shine * fill,
    twinkle: twinkle * fill,
    lift: (1 - arrive) * 0.85,
    landed: age >= STAR_REVEAL.impact,
  };
}

/**
 * Extra bloom after a perfect three-star finish, once the last star has stamped.
 */
export function chorusGlow(summaryAge: number, earned: number): number {
  if (earned < STAR_REVEAL.count) return 0;
  const t =
    summaryAge -
    (STAR_REVEAL.delay + STAR_REVEAL.spread + STAR_REVEAL.impact + 0.06);
  if (t < 0) return 0;
  return Math.exp(-t * 2.8) * Math.sin(Math.min(1, t / 0.18) * Math.PI);
}

/** Deterministic 0–1 hash for particle seeds. */
export function burstUnit(seed: number, salt: number): number {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export interface BurstChip {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scale: number;
  readonly alpha: number;
  readonly tint: number;
}

/**
 * Confetti + spark chips thrown from a stamp. Positions are in radius-units
 * relative to the star centre. `t` is seconds since impact.
 */
export function burstChips(
  t: number,
  seed: number,
  count = 16,
): readonly BurstChip[] {
  if (t <= 0) return [];
  const chips: BurstChip[] = [];
  for (let i = 0; i < count; i++) {
    const life = 0.48 + burstUnit(seed, i + 40) * 0.4;
    if (t > life) continue;
    const p = t / life;
    const angle = -Math.PI / 2 + (burstUnit(seed, i) - 0.5) * Math.PI * 1.15;
    const speed = 5.6 + burstUnit(seed, i + 20) * 7.2;
    const gravity = 13;
    chips.push({
      x: Math.cos(angle) * speed * t,
      y: Math.sin(angle) * speed * t + gravity * t * t,
      rotation:
        t *
        (6 + burstUnit(seed, i + 60) * 10) *
        (burstUnit(seed, i + 80) > 0.5 ? 1 : -1),
      scale: (1 - p * 0.4) * (0.55 + burstUnit(seed, i + 100) * 0.7),
      alpha: (1 - p) * (1 - p) * 0.95,
      tint: i % 4,
    });
  }
  return chips;
}
