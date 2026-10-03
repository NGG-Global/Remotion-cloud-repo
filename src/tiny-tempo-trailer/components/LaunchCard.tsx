import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ClipData } from "../clipData";
import { PANEL, shade, TT } from "../theme";
import { GameClip } from "./GameClip";
import { Stamp } from "./Stamp";

type LaunchCardProps = {
  /** The title screen recording, controls hidden: the sign, its beads, the hammer. */
  readonly menu: ClipData;
  readonly at: number;
  /** Local frame on which the call to action lands. */
  readonly ctaAt: number;
  readonly layout: "wide" | "tall";
};

/**
 * The launch card is the game's own title screen — recorded, not redrawn — with the
 * official Google Play badge beside it. The badge is Google's artwork, unmodified, on
 * its required clear space; only the "Available now" above it is ours.
 */
export const LaunchCard: React.FC<LaunchCardProps> = ({
  menu,
  at,
  ctaAt,
  layout,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ctaAge = frame - ctaAt;
  const ctaIn = Math.min(1, Math.max(0, ctaAge / 6));
  const badgeScale = 1 + 0.1 * (1 - ctaIn) ** 2;

  if (layout === "tall") {
    // The whole title screen fills the canvas; the badge sits on the bench where the
    // Play block was, so the eye lands where the thumb would.
    const badgeW = Math.round(width * 0.52);
    return (
      <>
        <GameClip
          clip={menu}
          at={at}
          box={{ x: 0, y: 0, w: width, h: height }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            // On the bench, where the Play block stood, and above the bottom fifth that
            // Shorts and Reels cover with captions and buttons.
            top: height * 0.68,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <Stamp
            text="Available now"
            size={66}
            at={ctaAt}
            align="center"
            fill={TT.cream}
            stroke={TT.inkDeep}
          />
          {ctaAge >= 2 ? (
            <Img
              src={staticFile("tiny-tempo/google-play-badge.png")}
              style={{
                width: badgeW,
                opacity: ctaIn,
                transform: `scale(${badgeScale})`,
                filter: `drop-shadow(0 ${PANEL.depth * 0.6}px 0 ${shade(TT.inkDeep, -0.2)}55)`,
              }}
            />
          ) : null}
        </div>
      </>
    );
  }

  // Wide: the sign and the hammer, cut from the title screen above its bench, on the left;
  // the words and the badge on the right, on the same paper.
  const signCrop = {
    x: 0,
    y: 0,
    w: menu.width,
    h: Math.round(menu.height * 0.62),
  };
  const signBox = {
    x: Math.round(width * 0.06),
    y: 0,
    w: Math.round(width * 0.46),
    h: height,
  };
  const badgeW = Math.round(width * 0.24);
  return (
    <>
      <GameClip
        clip={menu}
        at={at}
        box={signBox}
        crop={signCrop}
        fit="contain"
      />
      <div
        style={{
          position: "absolute",
          left: width * 0.54,
          top: 0,
          bottom: 0,
          width: width * 0.4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 30,
        }}
      >
        <Stamp
          text={"Available\nnow"}
          size={120}
          at={ctaAt}
          fill={TT.cream}
          stroke={TT.inkDeep}
        />
        {ctaAge >= 2 ? (
          <Img
            src={staticFile("tiny-tempo/google-play-badge.png")}
            style={{
              width: badgeW,
              marginLeft: 6,
              opacity: ctaIn,
              transform: `scale(${badgeScale})`,
              transformOrigin: "left center",
              filter: `drop-shadow(0 ${PANEL.depth * 0.6}px 0 ${shade(TT.inkDeep, -0.2)}55)`,
            }}
          />
        ) : null}
      </div>
    </>
  );
};
