import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useClock } from "../../clock";
import { DISPLAY, TT } from "../../theme";
import { actById } from "../acts/registry";
import { BeatTrack, type Mark } from "../hud/GameHud";

type ActBeatProps = {
  readonly act: string;
  readonly hits: readonly number[];
  /** Scene-local second the act's payoff plays, if this shot carries one. */
  readonly finish?: number;
};

/**
 * One act as the montage shows it: full bleed, its own copy, and the beat track
 * still running underneath.
 *
 * The track stays because the point of the montage is that the acts differ and the
 * interaction does not — the same three beads under a tomato, a sheet of film and a
 * pane of glass.
 */
export const ActBeat: React.FC<ActBeatProps> = ({ act, hits, finish }) => {
  const { frame, fps, time } = useClock();
  const entry = actById(act);
  const Graphic = entry.Graphic;
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 190 } });
  const marks: Mark[] = hits.map((hit) => (time < hit ? "pending" : "perfect"));

  return (
    <AbsoluteFill>
      {finish === undefined ? (
        <Graphic hits={hits} />
      ) : (
        <Graphic hits={hits} finish={finish} />
      )}

      <BeatTrack hits={hits} marks={marks} y={1636} />

      {/* The vignette's own line, on the printed label the game uses for its copy. */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 138,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "16px 48px",
            borderRadius: 30,
            background: TT.inkDeep,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 62,
            letterSpacing: "-0.02em",
            color: TT.cream,
            opacity: interpolate(enter, [0, 0.4], [0, 1], {
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(enter, [0, 1], [-44, 0])}px) rotate(${interpolate(enter, [0, 1], [-3, -1.2])}deg)`,
            whiteSpace: "nowrap",
          }}
        >
          {entry.line}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
