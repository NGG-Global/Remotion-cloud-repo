import React from "react";
import { AbsoluteFill } from "remotion";
import { Silhouette } from "../characters/Character";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { keys, span, useScene } from "../motion";
import { GROUND, Mote, Sky, Skyline } from "../props/scenery";
import { PAL } from "../theme";

/** 1942. The city, then a search for an origin that the picture refuses to find. */
export const Chicago: React.FC = () => {
  const { frame, t, dur } = useScene();
  const camX = keys(t, [
    { at: 0, v: -80 },
    { at: dur * 0.45, v: 160 },
    { at: dur, v: 40 },
  ]);
  const zoom = keys(t, [
    { at: 0, v: 0.9 },
    { at: dur * 0.5, v: 1.15 },
    { at: dur, v: 1.02 },
  ]);
  const pass = span(t, dur * 0.28, dur * 0.72);
  const framesX = -pass.e * 980;

  return (
    <AbsoluteFill>
      <World camX={camX} camY={40} zoom={zoom}>
        <Sky mode="dusk" frame={frame} />
        <rect x={-1400} y={GROUND - 40} width={2800} height={500} fill="#1a1816" />
        <Skyline frame={frame} />
        <Mote frame={frame} n={10} color={PAL.amber} />
        <g transform={`translate(${framesX} ${-20})`} opacity={0.35 + pass.p * 0.5}>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${-200 + i * 210} 80)`}>
              <rect x={0} y={0} width={160} height={110} rx={4} fill={PAL.paper} />
              <rect x={10} y={12} width={140} height={70} fill="#d9cfc0" />
              <circle cx={80} cy={46} r={16} fill="#c4a88a" />
              <rect x={18} y={90} width={90} height={6} fill="#c9bea6" />
            </g>
          ))}
        </g>
        <Silhouette x={-40} y={GROUND} h={250} frame={frame} color="#120e0c" />
        <Silhouette x={80} y={GROUND} h={230} frame={frame} phase={2} color="#1a1410" />
      </World>
      <Caption text="שיקגו" x={72} y={70} size={48} opacity={span(t, 0, dur * 0.4).e} />
      <Caption
        text="1942"
        x={72}
        y={128}
        size={36}
        latin
        align="right"
        opacity={span(t, 1, dur * 0.45).e * 0.9}
      />
      <Caption
        text="אין רגע אחד"
        x={72}
        y={860}
        size={40}
        opacity={span(t, dur * 0.62, dur * 0.92).e * (t < dur * 0.9 ? 1 : 0.4)}
      />
      <Grade lift={0.4} />
    </AbsoluteFill>
  );
};
