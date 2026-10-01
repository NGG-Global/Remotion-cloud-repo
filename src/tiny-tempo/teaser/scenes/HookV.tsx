import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { clamp, useClock } from "../../clock";
import { StampType } from "../../components/type";
import { HammerNail } from "../../graphics/HammerNail";
import { TT } from "../../theme";
import { beats, sec } from "../format";
import { Landscape } from "../Landscape";

/**
 * Bars 0-3. The theme opens on a hit, stabs four times, stops dead for a bar
 * and crashes back in on the "and" of two. The hammer plays that line: it
 * lands on every stab, winds up slowly through the silence, and the title
 * stamps in on the crash.
 */
const STABS = beats(0, 3, 4, 5, 6);
const CRASH = 5.5;
const HITS = [...STABS, CRASH, ...beats(12, 13, 14)];

export const HookV: React.FC = () => {
  const { time } = useClock();

  // Slow wind-up through the rest, released into the swing at the crash.
  const windup = clamp(time, [3.6, 5.0], [0, 0.34]);
  const release = clamp(time, [CRASH - 0.24, CRASH], [1, 0]);
  const extraLift = time < CRASH ? windup * release : 0;

  // The frame tightens on the nail as the silence stretches, then kicks wide.
  const creep = clamp(time, [3.4, CRASH], [0, 1]);
  const open = clamp(time, [CRASH, CRASH + 0.25], [1, 0]);
  const tight = creep * open;
  const scale = 1.78 + tight * 0.16;
  const focusX = 1020 + tight * 60;

  const watch = interpolate(time, [3.9, 4.15, 5.3, CRASH], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: TT.coral }}>
      <Landscape scale={scale} focusX={focusX} focusY={520}>
        <HammerNail hits={HITS} poster extraLift={extraLift} />
      </Landscape>

      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 300,
          opacity: watch,
        }}
      >
        <StampType text="WATCH." size={120} delay={sec(3.95)} />
      </AbsoluteFill>

      {time >= CRASH ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
          <StampType text={"TINY\nTEMPO"} size={236} delay={sec(CRASH)} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
