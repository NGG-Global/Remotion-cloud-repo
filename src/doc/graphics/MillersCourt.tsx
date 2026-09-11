import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, hash, ramp } from "../theme";

/**
 * 13 Miller's Court from the yard: a door and a small window in a black
 * brick wall, candlelight in the window and a seam of it under the door. On
 * cue the door closes, the seam goes, and the candle burns on alone until it
 * too is put out. Nothing inside is shown.
 */
export const MillersCourt: React.FC<{
  readonly closeAt: number;
  readonly candleOutAt?: number;
}> = ({ closeAt, candleOutAt }) => {
  const frame = useCurrentFrame();
  const close = easeInOut(ramp(frame, closeAt, closeAt + 45));
  const out =
    candleOutAt === undefined
      ? 0
      : easeInOut(ramp(frame, candleOutAt, candleOutAt + 30));
  const candle =
    (0.75 + 0.25 * Math.sin(frame * 0.3) + (hash(frame) - 0.5) * 0.25) *
    (1 - out);
  const push = 1 + frame * 0.0006;

  return (
    <AbsoluteFill style={{ background: "#050507", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${push})`,
          transformOrigin: "50% 60%",
        }}
      >
        {/* Brick wall, faint courses */}
        <AbsoluteFill
          style={{
            background:
              "repeating-linear-gradient(180deg, #17130f 0px, #17130f 26px, #100d0a 26px, #100d0a 28px)",
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 58px, rgba(0,0,0,0.5) 58px, rgba(0,0,0,0.5) 60px)",
            opacity: 0.7,
          }}
        />
        {/* Ground */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 860,
            bottom: 0,
            background: "linear-gradient(180deg, #0b0a0a 0%, #030303 100%)",
          }}
        />
        {/* Window, candlelit */}
        <div
          style={{
            position: "absolute",
            left: 1180,
            top: 330,
            width: 200,
            height: 260,
            background: `rgba(230,165,74,${0.55 * candle})`,
            boxShadow: `0 0 ${80 * candle}px rgba(230,165,74,${0.5 * candle}), inset 0 0 40px rgba(0,0,0,0.6)`,
            border: "14px solid #0b0908",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 10,
              marginLeft: -5,
              background: "#0b0908",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 10,
              marginTop: -5,
              background: "#0b0908",
            }}
          />
          {/* Curtain */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(60,30,20,0.85) 0%, rgba(60,30,20,0.3) 45%, rgba(60,30,20,0.3) 55%, rgba(60,30,20,0.85) 100%)",
            }}
          />
        </div>
        {/* Door frame */}
        <div
          style={{
            position: "absolute",
            left: 720,
            top: 300,
            width: 300,
            height: 580,
            background: "#0a0807",
            boxShadow: "inset 0 0 30px rgba(0,0,0,1)",
          }}
        />
        {/* Light from inside, revealed by the open door */}
        <div
          style={{
            position: "absolute",
            left: 736,
            top: 316,
            width: 268,
            height: 564,
            background: `linear-gradient(90deg, rgba(230,165,74,${0.5 * candle}) 0%, rgba(230,165,74,${0.12 * candle}) 100%)`,
            opacity: 1 - close,
          }}
        />
        {/* The door itself, hinged on the left, swinging shut */}
        <div
          style={{
            position: "absolute",
            left: 736,
            top: 316,
            width: 268,
            height: 564,
            transformOrigin: "0% 50%",
            transform: `perspective(1400px) rotateY(${-62 * (1 - close)}deg)`,
            background: "linear-gradient(90deg, #2a2119 0%, #1a1410 100%)",
            boxShadow: "0 0 40px rgba(0,0,0,0.9)",
          }}
        >
          {[0, 1].map((r) =>
            [0, 1].map((c) => (
              <div
                key={`${r}${c}`}
                style={{
                  position: "absolute",
                  left: 30 + c * 118,
                  top: 30 + r * 270,
                  width: 90,
                  height: 230,
                  border: "6px solid #110d0a",
                  background: "#231b15",
                }}
              />
            )),
          )}
          <div
            style={{
              position: "absolute",
              right: 22,
              top: 300,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#8a7a5c",
            }}
          />
        </div>
        {/* Seam of light under the door once closed */}
        <div
          style={{
            position: "absolute",
            left: 736,
            top: 876,
            width: 268,
            height: 5,
            background: `rgba(255,212,138,${0.9 * candle})`,
            boxShadow: `0 0 ${30 * candle}px rgba(230,165,74,${0.8 * candle})`,
            opacity: close,
          }}
        />
        {/* Pool of light on the ground */}
        <div
          style={{
            position: "absolute",
            left: 600,
            top: 850,
            width: 560,
            height: 200,
            background: `radial-gradient(50% 40% at 50% 20%, rgba(230,165,74,${0.35 * candle * (1 - close * 0.7)}) 0%, transparent 70%)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
