import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { StarMark, WORKSHOP } from "../graphics/StarMark";
import {
  chorusGlow,
  starAge,
  starImpactAge,
  starPose,
} from "../motion/starReveal";
import { fontFamily } from "../fonts";

export const STAR_REVEAL_FPS = 60;
export const STAR_REVEAL_SECONDS = 3.6;
export const STAR_REVEAL_DURATION = Math.round(
  STAR_REVEAL_SECONDS * STAR_REVEAL_FPS,
);
export const STAR_REVEAL_GALLERY_DURATION = STAR_REVEAL_DURATION * 4;

export const starRevealSchema = z.object({
  earned: z.number().int().min(0).max(3),
});

export type StarRevealProps = z.infer<typeof starRevealSchema>;

export const starRevealDefaultProps: StarRevealProps = { earned: 3 };

const LABELS = ["Again?", "Cleared", "Cleared", "Cleared"] as const;
const SCORES = ["0%", "52%", "78%", "100%"] as const;

/**
 * Level-end star reveal, authored against TinyTempo's workshop palette and
 * the same `f(t)` pose the Phaser result screen samples.
 */
export const StarReveal: React.FC<StarRevealProps> = ({ earned }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const summaryAge = frame / fps;
  const portrait = height > width;
  const radius = portrait ? 48 : 78;
  const gap = portrait ? 148 : 248;
  const chorus = chorusGlow(summaryAge, earned);
  const plaqueW = portrait ? 500 : 860;
  const plaqueH = portrait ? 210 : 280;
  const restY = portrait ? height * 0.58 : height * 0.54;
  const box = radius * 5.4;

  const plaqueIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slot = (
    index: number,
    key: string,
    poseIndex: number,
    earnedStar: boolean,
    age: number,
  ) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: width / 2 + (index - 1) * gap - box / 2,
        top: restY - box / 2,
        width: box,
        height: box,
        pointerEvents: "none",
      }}
    >
      <StarMark
        index={poseIndex}
        radius={radius}
        pose={starPose(age, earnedStar)}
        impactAge={starImpactAge(age, earnedStar)}
        chorus={earnedStar ? chorus : 0}
      />
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: WORKSHOP.paper }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 38% 22%, ${WORKSHOP.sun}44 0%, transparent 38%), radial-gradient(ellipse at 50% 68%, ${WORKSHOP.cream}aa 0%, transparent 52%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: portrait ? height * 0.16 : height * 0.14,
          textAlign: "center",
          fontFamily,
          fontSize: portrait ? 56 : 72,
          fontWeight: 700,
          color: WORKSHOP.ink,
          letterSpacing: "-0.03em",
          opacity: interpolate(frame, [2, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {LABELS[earned] ?? "Cleared"}
      </div>

      <div
        style={{
          position: "absolute",
          left: (width - plaqueW) / 2,
          top: restY - plaqueH / 2,
          width: plaqueW,
          height: plaqueH,
          borderRadius: portrait ? 28 : 36,
          background: WORKSHOP.puck,
          boxShadow: `0 ${16 * plaqueIn}px 0 ${WORKSHOP.brassShade}44, 0 ${5 * plaqueIn}px 0 ${WORKSHOP.ink}33, 0 0 0 5px ${WORKSHOP.ink}cc`,
          transform: `translateY(${(1 - plaqueIn) * 14}px)`,
          opacity: plaqueIn,
        }}
      />

      {[0, 1, 2].map((index) =>
        slot(index, `seat-${index}`, index + 10, false, 8),
      )}
      {[0, 1, 2].map((index) => {
        if (index >= earned) return null;
        const age = starAge(summaryAge, index);
        if (age <= 0) return null;
        return slot(index, `medal-${index}`, index, true, age);
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: restY + plaqueH / 2 + 20,
          textAlign: "center",
          fontFamily,
          fontSize: portrait ? 28 : 34,
          fontWeight: 600,
          color: WORKSHOP.ink,
          opacity: interpolate(frame, [8, 24], [0, 0.78], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {SCORES[earned] ?? "100%"}
      </div>
    </AbsoluteFill>
  );
};

const GALLERY_COUNTS = [3, 2, 1, 0] as const;

/** One take of each star count, for reviewing empty vs prize poses. */
export const StarRevealGallery: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: WORKSHOP.paper }}>
      {GALLERY_COUNTS.map((count, i) => (
        <Sequence
          key={count}
          from={i * STAR_REVEAL_DURATION}
          durationInFrames={STAR_REVEAL_DURATION}
        >
          <StarReveal earned={count} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
