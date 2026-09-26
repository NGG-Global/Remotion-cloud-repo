import { IMPLEMENTED_VECTOR_ACTIONS, type CharacterAction } from "../actions";

export type Pose = {
  readonly bob: number;
  readonly lean: number;
  readonly hipDrop: number;
  readonly headTurn: number;
  readonly headTilt: number;
  readonly brow: number;
  readonly mouth: number;
  readonly eyeScaleY: number;
  readonly armL: number;
  readonly armR: number;
  readonly elbowL: number;
  readonly elbowR: number;
  readonly legL: number;
  readonly legR: number;
  readonly kneeL: number;
  readonly kneeR: number;
};

const TAU = Math.PI * 2;

const base = (): Pose => ({
  bob: 0,
  lean: 0,
  hipDrop: 0,
  headTurn: 0,
  headTilt: 0,
  brow: 0,
  mouth: 0,
  eyeScaleY: 1,
  armL: 6,
  armR: 6,
  elbowL: 4,
  elbowR: 4,
  legL: 0,
  legR: 0,
  kneeL: 2,
  kneeR: 2,
});

const cycle = (
  frame: number,
  fps: number,
  speed: number,
  secondsPerCycle: number,
): number => {
  const framesPerCycle = Math.max(1, (secondsPerCycle * fps) / speed);
  return ((frame % framesPerCycle) / framesPerCycle) * TAU;
};

const wave = (frame: number, fps: number, speed: number, seconds: number) =>
  Math.sin(cycle(frame, fps, speed, seconds));

/**
 * Joint angles for one frame. `frame` is already local to the character
 * (composition frame minus startFrame).
 */
export const poseAt = (
  action: CharacterAction,
  frame: number,
  fps: number,
  speed: number,
): Pose => {
  const pose = base();
  const local = Math.max(0, frame);

  switch (action) {
    case "idle": {
      const breathe = wave(local, fps, speed, 2.4);
      return {
        ...pose,
        bob: breathe * -3,
        armL: 8 + breathe * 2,
        armR: 8 - breathe * 2,
        mouth: 0.05,
      };
    }
    case "walk": {
      const swing = wave(local, fps, speed, 0.72);
      return {
        ...pose,
        bob: Math.abs(swing) * -8,
        lean: 4,
        legL: swing * 28,
        legR: -swing * 28,
        kneeL: Math.max(0, -swing) * 42,
        kneeR: Math.max(0, swing) * 42,
        armL: -swing * 24,
        armR: swing * 24,
        elbowL: 12,
        elbowR: 12,
      };
    }
    case "run": {
      const swing = wave(local, fps, speed, 0.42);
      return {
        ...pose,
        bob: Math.abs(swing) * -12,
        lean: 14,
        legL: swing * 40,
        legR: -swing * 40,
        kneeL: Math.max(0, -swing) * 58,
        kneeR: Math.max(0, swing) * 58,
        armL: -swing * 42,
        armR: swing * 42,
        elbowL: 28,
        elbowR: 28,
      };
    }
    case "talk": {
      const mouth = Math.abs(wave(local, fps, speed, 0.28));
      const gesture = wave(local, fps, speed, 1.4);
      return {
        ...pose,
        bob: wave(local, fps, speed, 2.2) * -2,
        mouth: 0.25 + mouth * 0.75,
        armR: -28 + gesture * 10,
        elbowR: 36,
        brow: 2,
      };
    }
    case "lookLeft":
      return { ...pose, headTurn: -16, headTilt: -4, eyeScaleY: 1 };
    case "lookRight":
      return { ...pose, headTurn: 16, headTilt: 4, eyeScaleY: 1 };
    case "point":
      return {
        ...pose,
        armR: -86,
        elbowR: 4,
        lean: 3,
        headTurn: 6,
      };
    case "sit":
      return {
        ...pose,
        hipDrop: 78,
        lean: -4,
        legL: -8,
        legR: 8,
        kneeL: 86,
        kneeR: 86,
        armL: 18,
        armR: 18,
        elbowL: 20,
        elbowR: 20,
      };
    case "scared": {
      const shake = wave(local, fps, speed, 0.18) * 2;
      return {
        ...pose,
        lean: -12 + shake,
        bob: -6,
        armL: -148,
        armR: -148,
        elbowL: 16,
        elbowR: 16,
        mouth: 0.7,
        eyeScaleY: 1.35,
        brow: 8,
        kneeL: 10,
        kneeR: 10,
      };
    }
    case "surprised":
      return {
        ...pose,
        bob: -10,
        armL: -110,
        armR: -70,
        elbowL: 8,
        elbowR: 8,
        mouth: 0.85,
        eyeScaleY: 1.4,
        brow: 10,
        lean: -6,
      };
    case "crouch":
      return {
        ...pose,
        hipDrop: 56,
        lean: 16,
        legL: 12,
        legR: -12,
        kneeL: 72,
        kneeR: 72,
        armL: 36,
        armR: 36,
        elbowL: 24,
        elbowR: 24,
        headTilt: 8,
      };
    default:
      return unimplemented(action);
  }
};

const unimplemented = (action: never): never => {
  throw new Error(
    `[VectorCharacter] No pose is implemented for action "${String(action)}". Add it to poseAt and to IMPLEMENTED_VECTOR_ACTIONS.`,
  );
};

export const vectorActionNames = IMPLEMENTED_VECTOR_ACTIONS;
