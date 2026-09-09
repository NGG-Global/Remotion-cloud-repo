import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { uiFontFamily } from "../fonts";
import { BRAND } from "./brand";
import { LABEL, SCENE, TOTAL_FRAMES } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The official end card is 1280x720 and 150 frames long. */
const END_CARD_FRAMES = 150;

const EndCardVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 16], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile("leftlane/end-card.mp4")}
        muted
        style={{ width: 1920, height: 1080, display: "block" }}
      />
    </AbsoluteFill>
  );
};

const EndCardStill: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile("leftlane/end-card-final-frame.png")}
        style={{ width: 1920, height: 1080, display: "block" }}
      />
    </AbsoluteFill>
  );
};

/**
 * The supporting line is the narration's own closing words, set once, small,
 * centred under the lockup. The lockup in the end card is centred on x = 910.
 */
const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 910,
        top: 808,
        transform: `translate(-50%, ${(1 - enter) * 10}px)`,
        opacity: enter,
        fontFamily: uiFontFamily,
        fontSize: 34,
        fontWeight: 400,
        letterSpacing: "0.01em",
        color: BRAND.inkMuted,
        whiteSpace: "nowrap",
      }}
    >
      Practice before you drive.
    </div>
  );
};

/**
 * 6 - BRAND RESOLVE. The official end card animation carries the road lines
 * into the logo; its final frame then holds as a still so the hold can be as
 * long as the edit needs without extending the clip.
 */
export const BrandResolve: React.FC = () => (
  <>
    <Sequence
      from={SCENE.endCard.start}
      durationInFrames={END_CARD_FRAMES}
      premountFor={60}
    >
      <EndCardVideo />
    </Sequence>
    <Sequence
      from={SCENE.endCardStill.start}
      durationInFrames={TOTAL_FRAMES - SCENE.endCardStill.start}
      premountFor={30}
    >
      <EndCardStill />
    </Sequence>
    <Sequence
      from={LABEL.tagline.start}
      durationInFrames={TOTAL_FRAMES - LABEL.tagline.start}
    >
      <Tagline />
    </Sequence>
  </>
);
