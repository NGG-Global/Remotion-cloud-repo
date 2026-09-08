import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import { AbsoluteFill } from "remotion";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { Backdrop } from "../components/Backdrop";
import { BulletList } from "../components/BulletList";
import { FadeIn } from "../components/FadeIn";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";

/**
 * Scene timings in one place. `EXPLAINER_DURATION` is exported so `Root.tsx`
 * can register the composition with a length that matches the content instead
 * of a hand-counted frame number that silently drifts out of date.
 *
 * A `<TransitionSeries>` overlaps neighbouring scenes, so the total is the sum
 * of the scenes minus the sum of the transitions.
 */
const SCENE = {
  intro: seconds(3),
  points: seconds(5),
  outro: seconds(3),
} as const;

const TRANSITION = {
  intoPoints: seconds(0.6),
  intoOutro: seconds(0.5),
} as const;

export const EXPLAINER_DURATION =
  SCENE.intro +
  SCENE.points +
  SCENE.outro -
  TRANSITION.intoPoints -
  TRANSITION.intoOutro;

const Scene: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill>
    <Backdrop />
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px" }}>
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

/**
 * Three-scene explainer stitched together with `<TransitionSeries>`.
 *
 * Use this as the pattern for longer pieces: keep each scene a self-contained
 * component, and let the series own the timing between them.
 */
export const Explainer: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENE.intro}>
        <Scene>
          <AnimatedHeadline text="How this project is put together" />
        </Scene>
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION.intoPoints })}
      />

      <TransitionSeries.Sequence durationInFrames={SCENE.points}>
        <Scene>
          <AnimatedHeadline
            text="Three things to know"
            fontSize={FONT_SIZE.heading}
          />
          <div style={{ marginTop: 56 }}>
            <BulletList
              delay={seconds(0.6)}
              items={[
                "Compositions are registered in src/Root.tsx",
                "Animation values come from useCurrentFrame(), never from timers",
                "Props are validated by a Zod schema and editable in the Studio",
              ]}
            />
          </div>
        </Scene>
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION.intoOutro })}
      />

      <TransitionSeries.Sequence durationInFrames={SCENE.outro}>
        <Scene>
          <AnimatedHeadline text="Ready to build" />
          <FadeIn delay={seconds(0.7)}>
            <p
              style={{
                margin: "40px 0 0",
                fontFamily,
                fontSize: FONT_SIZE.body,
                color: COLORS.textMuted,
              }}
            >
              Run npm run dev to open the Studio.
            </p>
          </FadeIn>
        </Scene>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
