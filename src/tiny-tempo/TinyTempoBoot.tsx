import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { seconds } from "../theme";
import { useClock } from "./clock";
import { BodyCopy, StampType } from "./components/type";
import { BootMark } from "./graphics/BootMark";
import { BEAT, shade, TT } from "./theme";
import "./fonts";

/**
 * Splash ident for Tiny Tempo. Two bars of wind-up, a single beat-locked
 * strike that lands in the launcher pose, then the wordmark. Five seconds so
 * a Capacitor boot can hold the lockup while the menu fades in.
 */
export const TINY_TEMPO_BOOT_DURATION = seconds(5);

const MUSIC_LEAD_FRAMES = 5;

export const TinyTempoBoot: React.FC = () => {
  const { time } = useClock();
  const hold = interpolate(time, [0, 0.18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: TT.inkDeep, opacity: hold }}>
      <Audio
        src={staticFile("audio/tiny-tempo.mp3")}
        startFrom={MUSIC_LEAD_FRAMES}
        volume={0.78}
      />
      <BootMark />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 40,
          gap: 10,
        }}
      >
        <StampType
          text="TINY TEMPO"
          size={100}
          delay={seconds(1.78)}
          fill={TT.cream}
        />
        <BodyCopy
          text="The rhythm of everyday life."
          size={32}
          color={TT.ink}
          delay={seconds(2.22)}
          weight={800}
        />
        <BeatLockup delay={2.55} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BeatLockup: React.FC<{ readonly delay: number }> = ({ delay }) => {
  const { time } = useClock();
  const show = interpolate(time, [delay, delay + 0.18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (show <= 0) return null;
  const beat = Math.max(0, time - delay) / BEAT;
  const beads = 4;

  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        marginTop: 8,
        opacity: show,
        transform: `translateY(${(1 - show) * 12}px)`,
      }}
    >
      {Array.from({ length: beads }, (_, i) => {
        const active = beat % beads >= i && beat % beads < i + 1;
        const pulse = active ? 1 + Math.sin((beat % 1) * Math.PI) * 0.22 : 1;
        return (
          <div
            key={i}
            style={{
              width: 18 * pulse,
              height: 18 * pulse,
              borderRadius: "50%",
              background: active ? TT.coral : shade(TT.cream, -0.08),
              border: `3px solid ${TT.inkDeep}`,
              boxShadow: active
                ? `0 3px 0 ${TT.inkDeep}, 0 0 14px ${TT.coral}88`
                : `0 3px 0 ${TT.inkDeep}`,
            }}
          />
        );
      })}
    </div>
  );
};
