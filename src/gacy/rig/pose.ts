import { clamp, fbm, hash, lerp, noise } from "../engine/time";

/**
 * Joint angles for the rig, in degrees.
 *
 * Limbs: 0 hangs straight down, positive swings forward (toward the way
 * the person faces). Knees and elbows: positive bends the natural way.
 * Torso `lean` and `pelvis`: positive tips forward.
 * Head `turn`: -1 faces the camera, 0 is three-quarter, 1 is profile.
 */
export type Pose = {
  hipX: number;
  /** How far the pelvis drops below standing height (units). */
  hipDrop: number;
  pelvis: number;
  lean: number;
  neck: number;
  turn: number;
  nearUpper: number;
  nearFore: number;
  farUpper: number;
  farFore: number;
  nearThigh: number;
  nearKnee: number;
  farThigh: number;
  farKnee: number;
  /** Face. */
  mouth: number;
  smile: number;
  brow: number;
  lids: number;
  gaze: number;
};

export const STAND: Pose = {
  hipX: 0,
  hipDrop: 0,
  pelvis: 0,
  lean: 0,
  neck: 0,
  turn: 0,
  nearUpper: 4,
  nearFore: 8,
  farUpper: -3,
  farFore: 10,
  nearThigh: 1,
  nearKnee: 2,
  farThigh: -2,
  farKnee: 2,
  mouth: 0,
  smile: 0,
  brow: 0,
  lids: 1,
  gaze: 0,
};

const FIELDS = Object.keys(STAND) as (keyof Pose)[];

export const blend = (a: Pose, b: Pose, k: number): Pose => {
  if (k <= 0) {
    return a;
  }
  if (k >= 1) {
    return b;
  }
  const out = { ...a };
  for (const f of FIELDS) {
    out[f] = lerp(a[f], b[f], k);
  }
  return out;
};

export const pose = (over: Partial<Pose>, base: Pose = STAND): Pose => ({
  ...base,
  ...over,
});

/** Offsets added on top of a pose (e.g. breathing on a seated pose). */
export const add = (p: Pose, d: Partial<Pose>): Pose => {
  const out = { ...p };
  for (const f of Object.keys(d) as (keyof Pose)[]) {
    out[f] = p[f] + (d[f] ?? 0);
  }
  return out;
};

// ---------------------------------------------------------------- library

export const SIT = pose({
  hipDrop: 84,
  lean: -4,
  nearThigh: 86,
  nearKnee: 88,
  farThigh: 82,
  farKnee: 84,
  nearUpper: 22,
  nearFore: 48,
  farUpper: 18,
  farFore: 52,
});

export const KNEEL = pose({
  hipDrop: 70,
  lean: 14,
  nearThigh: 8,
  nearKnee: 94,
  farThigh: 78,
  farKnee: 82,
  nearUpper: 30,
  nearFore: 40,
  farUpper: 24,
  farFore: 50,
  neck: 14,
});

export const CROUCH = pose({
  hipDrop: 92,
  lean: 34,
  nearThigh: 70,
  nearKnee: 128,
  farThigh: 64,
  farKnee: 122,
  nearUpper: 34,
  nearFore: 30,
  farUpper: 28,
  farFore: 36,
  neck: -16,
});

/** On hands and knees, facing forward. Hip height ≈ knee-to-hip. */
export const CRAWL = pose({
  hipDrop: 90,
  lean: 76,
  neck: -68,
  nearThigh: -4,
  nearKnee: 92,
  farThigh: 6,
  farKnee: 96,
  nearUpper: 100,
  nearFore: 6,
  farUpper: 108,
  farFore: 2,
});

/** Lying prone under a low ceiling, propped on elbows. */
export const PRONE = pose({
  hipDrop: 150,
  lean: 88,
  neck: -70,
  nearThigh: -86,
  nearKnee: 4,
  farThigh: -84,
  farKnee: 8,
  nearUpper: 150,
  nearFore: -60,
  farUpper: 140,
  farFore: -50,
});

export const HANDS_POCKETS = pose({
  nearUpper: 8,
  nearFore: 34,
  farUpper: 2,
  farFore: 38,
});

export const ARMS_FOLDED = pose({
  nearUpper: 12,
  nearFore: 118,
  farUpper: 6,
  farFore: 122,
});

export const CARRY = pose({
  nearUpper: 26,
  nearFore: 70,
  farUpper: 22,
  farFore: 74,
  lean: -3,
});

export const WRITE_SEATED = pose(
  {
    lean: 12,
    neck: 18,
    nearUpper: 30,
    nearFore: 64,
    farUpper: 28,
    farFore: 70,
  },
  SIT,
);

// ---------------------------------------------------------------- motion

/**
 * Breathing, weight shift, small head drift and blinks. `amt` scales it;
 * 1 is a person standing and waiting, 0.4 is someone concentrating.
 */
export const idle = (p: Pose, t: number, seed = 0, amt = 1): Pose => {
  const br = Math.sin(t * 1.55 + seed * 2.1);
  const shift = fbm(t * 0.18, seed + 1);
  const drift = fbm(t * 0.22, seed + 5);
  // A blink lasts ~0.14 s and comes every 2.5–5 s.
  const period = 2.8 + hash(seed) * 2.2;
  const phase = (t + hash(seed + 9) * period) % period;
  const lids = phase < 0.14 ? Math.abs(phase - 0.07) / 0.07 : 1;
  return {
    ...p,
    hipX: p.hipX + shift * 3 * amt,
    hipDrop: p.hipDrop + (br * 0.6 + 0.6) * amt,
    lean: p.lean + br * 0.7 * amt,
    pelvis: p.pelvis + shift * 1.2 * amt,
    neck: p.neck + drift * 3 * amt,
    turn: clamp(p.turn + drift * 0.08 * amt, -1, 1),
    nearUpper: p.nearUpper + br * 1.2 * amt,
    farUpper: p.farUpper - br * 1.0 * amt,
    lids: Math.min(p.lids, lids),
  };
};

/** Mouth movement for speech. Syllable-rate noise, with pauses. */
export const talk = (p: Pose, t: number, seed = 0, amt = 1): Pose => {
  const syll = Math.abs(noise(t * 9 + seed * 13, seed));
  const phrase = noise(t * 0.9 + seed, seed + 2) > -0.35 ? 1 : 0.1;
  const nod = fbm(t * 1.3, seed + 4);
  return {
    ...p,
    mouth: Math.max(p.mouth, syll * phrase * 0.85 * amt),
    neck: p.neck + nod * 4 * amt,
    brow: p.brow + fbm(t * 0.7, seed + 8) * 0.3 * amt,
  };
};

/** A conversational hand, moving with the words. Near arm by default. */
export const gesture = (
  p: Pose,
  t: number,
  seed = 0,
  amt = 1,
  arm: "near" | "far" = "far",
): Pose => {
  const a = fbm(t * 0.8, seed + 21);
  const b = fbm(t * 1.1, seed + 33);
  const upper = 24 + a * 14 * amt;
  const fore = 64 + b * 22 * amt;
  return arm === "near"
    ? { ...p, nearUpper: upper, nearFore: fore }
    : { ...p, farUpper: upper, farFore: fore };
};

/**
 * One walk cycle. `phase` in cycles (one cycle = two steps).
 * Stride is set so the feet do not slide: at walking pace an adult covers
 * about 1.5 m per cycle.
 */
export const WALK_CYCLE_M = 1.5;

export const walk = (p: Pose, phase: number, amt = 1): Pose => {
  const a = phase * Math.PI * 2;
  const s = Math.sin(a);
  const c = Math.cos(a);
  const liftN = Math.max(0, Math.sin(a + 0.9));
  const liftF = Math.max(0, Math.sin(a + 0.9 + Math.PI));
  return {
    ...p,
    hipDrop: p.hipDrop + (Math.abs(c) * 4 - 2) * amt,
    lean: p.lean + 3 * amt,
    nearThigh: lerp(p.nearThigh, s * 24, amt),
    farThigh: lerp(p.farThigh, -s * 24, amt),
    nearKnee: lerp(p.nearKnee, 6 + liftN * 42, amt),
    farKnee: lerp(p.farKnee, 6 + liftF * 42, amt),
    nearUpper: lerp(p.nearUpper, -s * 20, amt),
    farUpper: lerp(p.farUpper, s * 18, amt),
    nearFore: lerp(p.nearFore, 14 + Math.max(0, -s) * 18, amt),
    farFore: lerp(p.farFore, 14 + Math.max(0, s) * 16, amt),
    neck: p.neck + Math.sin(a * 2) * 1.2 * amt,
  };
};

/**
 * Move from x0 to x1 between t0 and t1 with an eased start and stop. The
 * walk cycle is driven by distance travelled, so feet never skate, and it
 * fades out as the person comes to rest.
 */
export const walkBetween = (
  t: number,
  t0: number,
  t1: number,
  x0: number,
  x1: number,
  scale = 1,
): { x: number; phase: number; amt: number; facing: 1 | -1 } => {
  const dur = Math.max(0.01, t1 - t0);
  const u = clamp((t - t0) / dur);
  // Smoothstep position: velocity ramps up and down.
  const e = u * u * (3 - 2 * u);
  const x = lerp(x0, x1, e);
  const dist = Math.abs(x - x0);
  const phase = dist / (WALK_CYCLE_M * 200 * scale);
  const moving = u > 0 && u < 1 ? 1 : 0;
  // Walk weight follows speed.
  const speed = 6 * u * (1 - u);
  const amt = moving * clamp(speed * 1.6);
  return { x, phase, amt, facing: x1 >= x0 ? 1 : -1 };
};

/** Shovel stroke. `phase` in strokes. */
export const dig = (p: Pose, phase: number): Pose => {
  const a = (phase % 1) * Math.PI * 2;
  const push = (Math.sin(a) + 1) / 2;
  return {
    ...p,
    lean: p.lean + 18 + push * 22,
    hipDrop: p.hipDrop + push * 16,
    nearThigh: p.nearThigh + 16 + push * 10,
    nearKnee: p.nearKnee + 18 + push * 20,
    farThigh: p.farThigh - 6,
    farKnee: p.farKnee + 8,
    nearUpper: 50 + push * 26,
    nearFore: 30 - push * 10,
    farUpper: 30 + push * 30,
    farFore: 50 - push * 20,
    neck: p.neck + 10,
  };
};

/**
 * Two-bone IK for an arm, in the rig's local space (facing right, feet at
 * the origin, scale 1). Returns upper/fore angles relative to the torso.
 */
export const reachAngles = (
  shoulder: { x: number; y: number },
  target: { x: number; y: number },
  torsoAngle: number,
  upperLen: number,
  foreLen: number,
): { upper: number; fore: number } => {
  const dx = target.x - shoulder.x;
  const dy = target.y - shoulder.y;
  const dist = Math.min(upperLen + foreLen - 0.5, Math.hypot(dx, dy));
  // Direction to target as a "forward from down" angle.
  const base = (Math.atan2(dx, dy) * 180) / Math.PI;
  const cosElbow =
    (upperLen * upperLen + foreLen * foreLen - dist * dist) /
    (2 * upperLen * foreLen);
  const elbow = 180 - (Math.acos(clamp(cosElbow, -1, 1)) * 180) / Math.PI;
  const cosShoulder =
    (upperLen * upperLen + dist * dist - foreLen * foreLen) /
    (2 * upperLen * dist);
  const off = (Math.acos(clamp(cosShoulder, -1, 1)) * 180) / Math.PI;
  // Elbow bends forward/up: the upper arm sits "below" the direct line.
  const upperWorld = base - off;
  return { upper: upperWorld + torsoAngle, fore: elbow };
};
