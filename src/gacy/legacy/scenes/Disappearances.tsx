import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../characters/Character";
import { WORKER } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { keys, span, useScene } from "../motion";
import {
  Chair,
  Cuffs,
  GROUND,
  Ranch,
  Sky,
  Table,
} from "../props/scenery";
import { PAL } from "../theme";

const Portrait: React.FC<{ readonly x: number; readonly y: number; readonly on: number }> = ({
  x,
  y,
  on,
}) => (
  <g transform={`translate(${x} ${y}) scale(${on})`} opacity={on}>
    <rect x={-36} y={-48} width={72} height={90} fill={PAL.paper} />
    <circle cx={0} cy={-8} r={16} fill="#c4a88a" />
    <rect x={-16} y={14} width={32} height={18} rx={4} fill="#5c5348" />
  </g>
);

/** Absence, not violence. A door, an empty locker, a photograph, then the floor. */
export const Disappearances: React.FC = () => {
  const { frame, t, dur } = useScene();
  const phase =
    t < dur * 0.28 ? 0 : t < dur * 0.5 ? 1 : t < dur * 0.72 ? 2 : 3;
  const camX = keys(t, [
    { at: 0, v: -60 },
    { at: dur * 0.28, v: 40 },
    { at: dur * 0.55, v: 0 },
    { at: dur, v: 20 },
  ]);
  const door = span(t, dur * 0.12, dur * 0.28).e;
  const dim = span(t, dur * 0.62, dur * 0.78);

  return (
    <AbsoluteFill>
      <World camX={camX} camY={phase === 3 ? 180 : 40} zoom={phase === 2 ? 1.15 : 1.02}>
        {phase === 0 ? (
          <g>
            <Sky mode="dusk" frame={frame} />
            <rect x={-1000} y={GROUND} width={2000} height={400} fill={PAL.lawnDeep} />
            <Ranch x={180} w={480} lit={0.7} />
            <Character
              frame={frame}
              x={-220 + door * 80}
              y={GROUND}
              {...WORKER}
              pose="walk"
            />
            <rect
              x={150}
              y={GROUND - 210}
              width={70}
              height={200}
              fill="#3a2a22"
              opacity={door}
              transform={`rotate(${(1 - door) * -18} 150 ${GROUND})`}
            />
          </g>
        ) : null}
        {phase === 1 ? (
          <g>
            <rect x={-900} y={-500} width={1800} height={1100} fill="#2a3036" />
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${-280 + i * 160} 40)`}>
                <rect x={0} y={-220} width={110} height={280} fill="#3a424a" />
                <rect
                  x={8}
                  y={-200}
                  width={94}
                  height={250}
                  fill={i === 2 ? "#1c2228" : "#4a545c"}
                />
              </g>
            ))}
            <g transform="translate(40 -40)">
              <Portrait x={-180} y={80} on={1} />
              <Portrait x={-40} y={80} on={span(t, dur * 0.34, dur * 0.42).e} />
              <Portrait x={100} y={80} on={span(t, dur * 0.4, dur * 0.5).e} />
            </g>
          </g>
        ) : null}
        {phase === 2 ? (
          <g>
            <rect x={-900} y={-500} width={1800} height={1100} fill="#241e1a" />
            <Chair x={-160} empty />
            <Chair x={20} />
            <Chair x={200} empty={span(t, dur * 0.52, dur * 0.7).e > 0.5} />
            <Table x={20} />
          </g>
        ) : null}
        {phase === 3 ? (
          <g>
            <rect x={-900} y={-500} width={1800} height={1100} fill="#161412" />
            <Table x={0} y={80} />
            <Cuffs x={0} y={50} shut={span(t, dur * 0.74, dur * 0.84).e} />
            <rect
              x={-70}
              y={220}
              width={140}
              height={18}
              fill="#5c4636"
              opacity={span(t, dur * 0.86, dur).e}
            />
          </g>
        ) : null}
      </World>
      <AbsoluteFill
        style={{ background: "#000", opacity: dim.visible ? Math.sin(dim.p * Math.PI) * 0.72 : 0 }}
      />
      <Caption
        text="1972 — 1978"
        x={72}
        y={70}
        latin
        size={40}
        opacity={t < dur * 0.3 ? 0.95 : 0}
      />
      <Grade />
    </AbsoluteFill>
  );
};
