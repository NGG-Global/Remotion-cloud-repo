import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { uiFontFamily } from "../fonts";
import { BRAND, ROAD } from "./brand";
import { Car } from "./Car";
import { drive, ease, type DrivePlan } from "./drive";
import { Road } from "./Road";
import { FPS, LABEL, SCENE } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------------------ */
/* 1 - HABIT                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * The vehicle enters near the crown of the road, settles into the right lane
 * out of habit, loses confidence, then moves across to the left lane.
 * Times are seconds from the start of the film; the narration says
 * "slightly wrong" at 4.1-4.9 s.
 */
const habitPlan: DrivePlan = {
  laneX: (t) => {
    const drift = ease(t, 1.3, 3.0, 985, ROAD.rightLaneX);
    const waverEnvelope = ease(t, 3.3, 3.9, 0, 1) * ease(t, 4.7, 5.2, 1, 0);
    const waver = waverEnvelope * 3.5 * Math.sin(2 * Math.PI * 0.8 * (t - 3.3));
    const correction = ease(t, 5.3, 7.5, 0, 1);
    return (
      drift +
      waver * (1 - correction) +
      (ROAD.leftLaneX - ROAD.rightLaneX) * correction
    );
  },
  speed: (t) => {
    if (t < 3.0) {
      return 560;
    }
    if (t < 4.4) {
      return ease(t, 3.0, 4.4, 560, 170, Easing.inOut(Easing.quad));
    }
    if (t < 5.2) {
      return 170;
    }
    return ease(t, 5.2, 6.6, 170, 560, Easing.inOut(Easing.quad));
  },
};

/** Perspective used to tilt the flat road into the simulator's viewpoint. */
const TILT = {
  perspective: 900,
  maxAngle: 77,
  /** Puts the horizon at y = 708 - 900 / tan(77deg) = 500, near the simulator's. */
  originY: 708,
  /**
   * As the road tilts it slides right by this much, so the lane the vehicle
   * is in ends up centred at the bottom of the frame, which is where the
   * simulator's own lane sits when the footage takes over.
   */
  shiftX: ROAD.centreX - ROAD.leftLaneX,
};

export const HabitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const state = drive(habitPlan, frame);

  const tilt = interpolate(
    frame,
    [SCENE.tilt.start, SCENE.tilt.end],
    [0, TILT.maxAngle],
    { ...clamp, easing: Easing.in(Easing.sin) },
  );
  const shift = interpolate(
    frame,
    [SCENE.tilt.start, SCENE.tilt.end],
    [0, TILT.shiftX],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const layerOpacity = interpolate(
    frame,
    [SCENE.abstractFadeOut.start, SCENE.abstractFadeOut.end],
    [1, 0],
    clamp,
  );
  const carOpacity = interpolate(
    frame,
    [SCENE.tilt.start + 20, SCENE.tilt.start + 34],
    [1, 0],
    clamp,
  );

  const noteIn = interpolate(
    frame,
    [LABEL.wrongSide.start, LABEL.wrongSide.start + 9],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) },
  );
  const noteOut = interpolate(
    frame,
    [LABEL.wrongSide.end - 8, LABEL.wrongSide.end],
    [1, 0],
    clamp,
  );
  const noteOpacity = noteIn * noteOut;

  return (
    <AbsoluteFill style={{ opacity: layerOpacity }}>
      <AbsoluteFill
        style={{
          transform: `perspective(${TILT.perspective}px) rotateX(${tilt}deg)`,
          transformOrigin: `960px ${TILT.originY}px`,
        }}
      >
        <AbsoluteFill style={{ transform: `translateX(${shift}px)` }}>
          <Road
            stroke={ROAD.openingStroke}
            scroll={state.camera}
            fillOpacity={1}
          />
          <Car
            x={state.x}
            y={state.y}
            heading={state.heading}
            opacity={carOpacity}
          />
          {noteOpacity > 0 ? (
            <div
              style={{
                position: "absolute",
                left: state.x + 92,
                top: state.y - 26,
                transform: `translateY(${(1 - noteIn) * 8}px)`,
                opacity: noteOpacity,
                fontFamily: uiFontFamily,
                fontSize: 30,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                color: BRAND.ink,
                background: BRAND.white,
                padding: "10px 16px",
                borderRadius: 10,
                boxShadow:
                  "0 1px 0 rgba(0,0,0,0.04), 0 10px 26px rgba(20,30,26,0.10)",
                whiteSpace: "nowrap",
              }}
            >
              Wrong side.
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------ */
/* 5 - CONFIDENCE                                                            */
/* ------------------------------------------------------------------------ */

/**
 * The same road, the same entry, but the vehicle is in the left lane from the
 * first frame and never wavers. The camera follows, then lets it go; the lines
 * thicken to the end card's weight so the logo animation can take over.
 * Times are seconds from the start of this scene.
 */
const confidencePlan: DrivePlan = {
  laneX: () => ROAD.leftLaneX,
  speed: (t) => {
    if (t < 0.9) {
      return 0;
    }
    if (t < 3.6) {
      return 600;
    }
    return ease(t, 3.6, 4.6, 600, 880, Easing.inOut(Easing.quad));
  },
  cameraRelease: 3.6,
  cameraSettle: 1.0,
};

const CONFIDENCE = {
  revealFrames: 26,
  strokeGrow: { start: 4.35, end: 5.25 },
} as const;

const period = ROAD.dashLength + ROAD.dashGap;
/**
 * The road is drawn from y = -6000, which is congruent to 180 modulo the dash
 * period, so a dash begins at 180 + scroll. Shift the scroll so that, once the
 * camera has settled, a dash begins exactly where the end card's does.
 */
const settledCamera = drive(confidencePlan, Math.round(6 * FPS)).camera;
const dashPhaseFix =
  (((ROAD.endCardDashPhase - 180 - settledCamera) % period) + period) % period;

export const ConfidenceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const state = drive(confidencePlan, frame);

  const reveal = interpolate(frame, [0, CONFIDENCE.revealFrames], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const grow = ease(
    t,
    CONFIDENCE.strokeGrow.start,
    CONFIDENCE.strokeGrow.end,
    0,
    1,
  );
  const stroke = interpolate(
    grow,
    [0, 1],
    [ROAD.openingStroke, ROAD.endCardStroke],
  );

  return (
    <AbsoluteFill>
      <Road
        stroke={stroke}
        scroll={state.camera + dashPhaseFix}
        fillOpacity={reveal * (1 - grow)}
        reveal={reveal}
      />
      <Car x={state.x} y={state.y} heading={state.heading} />
    </AbsoluteFill>
  );
};
