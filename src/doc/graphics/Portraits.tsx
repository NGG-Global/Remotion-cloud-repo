import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { archiveSrc, type ArchiveImage } from "../archive";
import { DOC, easeInOut, easeOut, mix, ramp, SERIF } from "../theme";
import { Bust } from "./Evidence";

/**
 * A photograph held in an oval of light on dark paper, breathing very
 * slightly. Used for the women: treated softly, never zoomed into.
 */
export const Portrait: React.FC<{
  readonly image?: ArchiveImage;
  readonly focus?: { x: number; y: number };
  readonly bust?: "short" | "long" | "cap";
  readonly delay?: number;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly caption?: string;
  readonly captionAt?: number;
  readonly fadeAt?: number;
  readonly shape?: "oval" | "arch";
}> = ({
  image,
  focus = { x: 0.5, y: 0.4 },
  bust = "long",
  delay = 0,
  x = 960,
  y = 500,
  width = 420,
  height = 560,
  caption,
  captionAt,
  fadeAt,
  shape = "oval",
}) => {
  const frame = useCurrentFrame();
  const enter = easeOut(ramp(frame, delay, delay + 40));
  const fade =
    fadeAt === undefined ? 0 : easeInOut(ramp(frame, fadeAt, fadeAt + 40));
  const breathe = 1 + Math.sin((frame + delay) * 0.025) * 0.006;
  const radius =
    shape === "oval" ? "50% / 40%" : "50% 50% 8px 8px / 42% 42% 8px 8px";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${breathe * mix(0.96, 1, enter)})`,
        opacity: enter * (1 - fade),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          overflow: "hidden",
          boxShadow: `0 0 0 3px rgba(185,171,142,0.35), 0 0 90px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.9)`,
          background: "#15161a",
          position: "relative",
        }}
      >
        {image ? (
          <Img
            src={archiveSrc(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
              filter:
                "grayscale(1) sepia(0.3) contrast(0.95) brightness(0.75) blur(0.4px)",
            }}
          />
        ) : (
          <Bust seed={delay + 3} hair={bust} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            boxShadow: "inset 0 0 80px 30px rgba(6,7,10,0.95)",
          }}
        />
      </div>
      {caption ? (
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 36,
            fontWeight: 400,
            color: DOC.text,
            direction: "rtl",
            letterSpacing: 1,
            opacity:
              0.92 *
              easeOut(
                ramp(
                  frame,
                  captionAt ?? delay + 20,
                  (captionAt ?? delay + 20) + 26,
                ),
              ),
            whiteSpace: "nowrap",
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};

export type Woman = {
  readonly name: string;
  readonly image?: ArchiveImage;
  readonly focus?: { x: number; y: number };
  readonly bust?: "short" | "long" | "cap";
};

/**
 * The five women in a row, arriving one by one as they are named.
 */
export const FiveWomen: React.FC<{
  readonly women: readonly Woman[];
  readonly at: readonly number[];
  readonly captions?: boolean;
  readonly fadeAt?: number;
}> = ({ women, at, captions = true, fadeAt }) => {
  const gap = 330;
  const x0 = 960 + gap * 2;
  return (
    <AbsoluteFill>
      {women.map((w, i) => (
        <Portrait
          key={w.name}
          image={w.image}
          focus={w.focus}
          bust={w.bust}
          delay={at[i]}
          x={x0 - i * gap}
          y={captions ? 500 : 540}
          width={270}
          height={360}
          caption={captions ? w.name : undefined}
          fadeAt={fadeAt}
        />
      ))}
    </AbsoluteFill>
  );
};
