import React from "react";
import { AbsoluteFill } from "remotion";
import { Plane, Stage, type Cam } from "../../gacy/engine/camera";
import { type Light } from "../../gacy/engine/color";
import { Finish } from "../../gacy/engine/look";
import { useShot } from "../../gacy/engine/shot";
import { EASE, clamp, hash, keys, lerp, ramp, type Track } from "../../gacy/engine/time";
import { Sky } from "../../gacy/kit/sky";
import { GroundStrip } from "../../gacy/kit/street";
import { Person, type Look } from "../../gacy/rig/Person";
import { SIT, STAND, type Pose, gesture, idle, pose, talk, walk, walkBetween } from "../../gacy/rig/pose";
import { BordenSection, BordenSide, HOUSE, type Occupants, type RoomLamps } from "../kit/house";
import { Barn, Fence, NeighborHouse, skyFor } from "../kit/town";
import { Elm } from "../kit/props";
import { LIGHT } from "../theme";

/**
 * Shared shot machinery for the episode.
 *
 * Every shot is a React component that reads `useShot()` for `t` (seconds
 * since its narration start) and `dur`, and draws a <Stage> with a camera
 * written as keyframes against the voice.
 */

export { useShot, EASE, clamp, hash, keys, lerp, ramp, Person, SIT, STAND, gesture, idle, pose, talk, walk, walkBetween, Plane, Stage, Finish, HOUSE, LIGHT };
export type { Cam, Light, Look, Pose, Track, Occupants, RoomLamps };

/** A camera from three keyframe tracks; y defaults to the room eye line. */
export const cam = (t: number, x: Track, y: Track | number, zoom: Track | number, easing = EASE.drift): Cam => ({
  x: keys(t, x, easing),
  y: typeof y === "number" ? y : keys(t, y, easing),
  zoom: typeof zoom === "number" ? zoom : keys(t, zoom, easing),
});

/** Eye line for a room on a given level: floor level minus 1.3 m. */
export const eye = (level: number, up = 260): number => level - up;

/** A standing person with idle breathing; `extra` overrides the pose. */
export const standing = (t: number, seed: number, extra: Partial<Pose> = {}, amt = 1): Pose => idle(pose(extra), t, seed, amt);

/** A seated person, hands in the lap. */
export const seated = (t: number, seed: number, extra: Partial<Pose> = {}, amt = 0.5): Pose =>
  idle(pose({ ...SIT, nearUpper: 30, nearFore: 60, farUpper: 28, farFore: 64, ...extra }), t, seed, amt);

/** Someone talking with a hand, for a conversation. */
export const speaking = (t: number, seed: number, extra: Partial<Pose> = {}, amt = 1): Pose => gesture(talk(idle(pose(extra), t, seed), t, seed, amt), t, seed, amt * 0.8);

/** Someone listening, slight nods. */
export const listening = (t: number, seed: number, extra: Partial<Pose> = {}): Pose => idle(pose({ ...extra, neck: (extra.neck ?? 0) + Math.sin(t * 2.1 + seed) * 2 }), t, seed, 0.6);

/**
 * A person walking from x0 to x1 between t0 and t1, standing still before
 * and after (facing the way they went). Returns the props for <Person>.
 */
export const walker = (t: number, t0: number, t1: number, x0: number, x1: number, base: Pose = STAND, seed = 0) => {
  const w = walkBetween(t, t0, t1, x0, x1);
  const p = w.amt > 0.01 ? walk(base, w.phase, w.amt) : idle(base, t, seed, 0.6);
  return { x: w.x, pose: p, facing: w.facing };
};

/** Lying on a sofa, head to the right: legs along the seat. */
export const LYING: Pose = pose({
  hipDrop: 150,
  lean: -78,
  neck: 20,
  nearThigh: 84,
  nearKnee: 10,
  farThigh: 80,
  farKnee: 14,
  nearUpper: 10,
  nearFore: 60,
  farUpper: 4,
  farFore: 70,
  lids: 0.2,
});

/** Bent over something: washing, ironing, making a bed. */
export const BENT: Pose = pose({ lean: 26, neck: 8, nearUpper: 60, nearFore: 30, farUpper: 54, farFore: 36 });

/** Two-hand hold in front: a dress, a tray, a pail. */
export const HOLD_FRONT: Pose = pose({ nearUpper: 44, nearFore: 74, farUpper: 40, farFore: 78 });

/** Arms folded, weight on one hip. */
export const FOLDED: Pose = pose({ nearUpper: 12, nearFore: 118, farUpper: 6, farFore: 122, pelvis: -2 });

/** Praying / hands together, seated. */
export const HANDS_CLASPED: Pose = pose({ ...SIT, nearUpper: 36, nearFore: 84, farUpper: 34, farFore: 88, neck: 10 });

export type SectionSceneProps = {
  readonly t: number;
  readonly cam: Cam;
  readonly light?: Light;
  readonly lamps?: RoomLamps;
  readonly people?: Occupants;
  readonly props?: React.ComponentProps<typeof BordenSection>["props"];
  readonly handheld?: number;
  /** 0 = the side elevation, 1 = the cutaway. */
  readonly open?: number;
  readonly night?: boolean;
  readonly windowsLit?: number;
  readonly shell?: number;
  readonly yard?: React.ReactNode;
  readonly foreground?: React.ReactNode;
  readonly finish?: React.ComponentProps<typeof Finish>;
  readonly barn?: boolean;
  readonly atWindow?: React.ReactNode;
};

/**
 * The house from the side yard, opening into the cutaway. One Stage, so a
 * camera can push at a window and keep going into the room behind it.
 */
export const SectionScene: React.FC<SectionSceneProps> = ({ t, cam: c, light = LIGHT.room, lamps, people, props, handheld = 0, open = 1, night = false, windowsLit = 0, shell = 1, yard, foreground, finish, barn = true, atWindow }) => {
  const outdoor = night ? LIGHT.night : LIGHT.noon;
  return (
    <AbsoluteFill>
      <Stage cam={c} handheld={handheld} t={t} bg={night ? "#05060a" : "#0e0c0a"}>
        <Sky mode={skyFor(outdoor)} t={t} clouds={0.5} stars={night} moon={night ? { x: 1500, y: 150 } : null} />
        <Plane d={60}>
          <rect x={-30000} y={-10} width={60000} height={600} fill={night ? "#141c18" : "#4a5a3a"} />
          {Array.from({ length: 20 }, (_, i) => (
            <Elm key={i} x={-12000 + i * 1300 + hash(i) * 500} h={1600 + hash(i + 3) * 900} light={outdoor} t={t} seed={i} tone={night ? "#18221c" : "#3e5a36"} />
          ))}
        </Plane>
        <Plane d={12}>
          <NeighborHouse x={-4200} light={outdoor} color="#b8b0a0" lit={night ? 0.5 : 0} seed={4} />
          {barn ? <Barn x={HOUSE.barnX + 600} light={outdoor} /> : null}
          <Fence x0={-8000} x1={8000} light={outdoor} />
        </Plane>
        <GroundStrip near={-30} far={60} color={night ? "#1e2a20" : "#6a7a4a"} farColor={night ? "#161e18" : "#4e5e3e"} light={outdoor} />
        {yard}
        <Plane d={0}>
          <BordenSection t={t} light={light} lamps={lamps} people={people} props={props} opacity={open} shell={shell} />
          <BordenSide light={outdoor} lit={windowsLit} t={t} night={night} opacity={1 - open} atWindow={atWindow} />
        </Plane>
        {foreground}
      </Stage>
      <Finish {...(finish ?? { temp: night ? -0.4 : 0.2, vignette: 0.7 })} />
    </AbsoluteFill>
  );
};

/** A room-interior stage: the same cutaway, camera inside one room, no shell. */
export const RoomScene: React.FC<Omit<SectionSceneProps, "open">> = (p) => <SectionScene {...p} open={1} shell={p.shell ?? 1} />;

/** Beat helper: 1 between a and b (with soft edges), else 0. */
export const between = (t: number, a: number, b: number, soft = 0.25): number => ramp(t, a, a + soft) * (1 - ramp(t, b - soft, b));

/** Cycles a value 0..1 at `rate` per second with an eased ping-pong. */
export const pingpong = (t: number, rate: number): number => {
  const u = (t * rate) % 2;
  return u < 1 ? u : 2 - u;
};

/** Pose for someone making a bed: bent, arms sweeping. */
export const bedMaking = (t: number, seed: number): Pose => {
  const sweep = Math.sin(t * 1.6 + seed);
  return idle(pose({ lean: 22 + sweep * 4, neck: 6, nearUpper: 58 + sweep * 14, nearFore: 28, farUpper: 52 - sweep * 10, farFore: 36 }), t, seed, 0.4);
};

/** Pose for washing a window: an arm circling on the glass. */
export const washing = (t: number, seed: number): Pose => {
  const a = t * 3.2 + seed;
  return idle(pose({ nearUpper: 120 + Math.sin(a) * 18, nearFore: 20 + Math.cos(a) * 14, farUpper: 10, farFore: 40, lean: 4, neck: -10 }), t, seed, 0.4);
};

/** Pose for ironing: one arm pushing back and forth on the board. */
export const ironing = (t: number, seed: number): Pose => {
  const a = Math.sin(t * 2.4 + seed);
  return idle(pose({ lean: 10, neck: 12, nearUpper: 52 + a * 16, nearFore: 40 - a * 10, farUpper: 40, farFore: 60 }), t, seed, 0.4);
};

export const lerpLight = (a: Light, b: Light, k: number): Light => ({
  key: k <= 0 ? a.key : k >= 1 ? b.key : a.key,
  ambient: a.ambient,
  amb: lerp(a.amb, b.amb, k),
  desat: lerp(a.desat ?? 0, b.desat ?? 0, k),
});
