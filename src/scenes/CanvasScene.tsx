import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage } from "../components/Stage";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";

export type CanvasSize = { readonly width: number; readonly height: number };

export type CanvasCaption = {
  /** Frame, relative to the scene, at which the line appears. */
  readonly at: number;
  readonly text: string;
  /** Words to pick out in the accent colour. */
  readonly emphasise?: readonly string[];
};

type CanvasSceneProps = {
  /** Section name, held in the corner for the length of the scene. */
  readonly title?: string;
  /**
   * The animation. Given the area it may fill, so a graphic can lay itself out
   * against real pixels instead of guessing at percentages.
   */
  readonly children: (size: CanvasSize) => React.ReactNode;
  /** Lines that come and go beneath the animation, in step with the voice. */
  readonly captions?: readonly CanvasCaption[];
  /** Height reserved for the caption strip. Ignored when there are none. */
  readonly captionHeight?: number;
  readonly glow?: number;
};

/** Height of the corner title band, so the animation never runs under it. */
const TITLE_BAND = 132;

/**
 * A scene where the animation is the content and the words are the footnote.
 *
 * The other scenes are built the other way round: a sentence with an
 * illustration beside it. This one hands almost the whole frame to a single
 * custom graphic and keeps text to one short line, for the stretches of
 * narration that are better shown than written out.
 */
export const CanvasScene: React.FC<CanvasSceneProps> = ({
  title,
  children,
  captions,
  captionHeight = 150,
  glow = 0.55,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.35), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const strip = captions && captions.length > 0 ? captionHeight : 0;
  const top = title ? TITLE_BAND : 60;
  const area: CanvasSize = {
    width: width - 200,
    height: height - top - strip - 60,
  };

  const SWAP = seconds(0.28);

  return (
    <Stage glow={glow}>
      <AbsoluteFill style={{ opacity: exit }}>
        {title ? (
          <div
            style={{
              position: "absolute",
              top: 56,
              right: 72,
              direction: "rtl",
              fontFamily,
              fontSize: FONT_SIZE.caption,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: COLORS.textMuted,
              opacity: interpolate(
                frame,
                [seconds(0.2), seconds(0.8)],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            {title}
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            top,
            left: 100,
            width: area.width,
            height: area.height,
          }}
        >
          {children(area)}
        </div>

        {strip > 0 && captions ? (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: strip,
              direction: "rtl",
            }}
          >
            {captions.map((caption, i) => {
              const next = captions[i + 1];
              const inT = interpolate(
                frame,
                [caption.at, caption.at + SWAP],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const outT = next
                ? interpolate(frame, [next.at, next.at + SWAP], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : 1;
              const opacity = inT * outT;
              if (opacity <= 0.001) {
                return null;
              }

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 140,
                    right: 140,
                    textAlign: "center",
                    fontFamily,
                    fontSize: FONT_SIZE.body,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: COLORS.text,
                    opacity,
                    // A short lift as the line settles, so a caption swap
                    // registers as a change and not just a flicker.
                    transform: `translateY(${(1 - inT) * 14}px)`,
                  }}
                >
                  {caption.emphasise && caption.emphasise.length > 0
                    ? caption.text.split(" ").map((word, w) => (
                        <span
                          key={w}
                          style={{
                            color: caption.emphasise?.includes(word)
                              ? COLORS.accent
                              : undefined,
                          }}
                        >
                          {word}
                          {w < caption.text.split(" ").length - 1 ? " " : ""}
                        </span>
                      ))
                    : caption.text}
                </div>
              );
            })}
          </div>
        ) : null}
      </AbsoluteFill>
    </Stage>
  );
};
