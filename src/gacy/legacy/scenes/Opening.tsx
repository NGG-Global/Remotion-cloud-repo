import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, Silhouette } from "../characters/Character";
import { GACY, GACY_WORK, NEIGHBOR, WORKER } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, Layer, World } from "../components/Stage";
import { keys, span, useScene } from "../motion";
import {
  Car,
  GROUND,
  Ground,
  Lamp,
  Mixer,
  Mote,
  Ranch,
  Road,
  Sky,
  Tree,
} from "../props/scenery";
import { PAL } from "../theme";

const Costume: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-4} y={-250} width={8} height={250} fill="#2a241c" />
    <path d="M-70 -180 Q0 -150 70 -180 L60 -40 Q0 -10 -60 -40 Z" fill="#a33b3b" />
    <ellipse cx={0} cy={-188} rx={46} ry={14} fill="#f4efe4" />
    <circle cx={0} cy={-230} r={28} fill="#f7f3ea" />
    <circle cx={0} cy={-222} r={6} fill="#c43636" />
    <path d="M-12 -210 Q0 -198 12 -210" stroke="#c43636" strokeWidth={3} fill="none" />
    <path d="M-20 -246 Q-8 -262 4 -244" stroke="#d4553a" strokeWidth={4} fill="none" />
  </g>
);

/** Cold open: an ordinary night, a costume we move past, then the floor. */
export const Opening: React.FC = () => {
  const { frame, t, dur } = useScene();
  const camX = keys(t, [
    { at: 0, v: -280 },
    { at: 9, v: 40 },
    { at: 18, v: 360 },
    { at: 30, v: 820 },
    { at: 42, v: 1320 },
    { at: 50, v: 60 },
    { at: 60, v: 20 },
    { at: dur, v: -80 },
  ]);
  const camY = keys(t, [
    { at: 0, v: 80 },
    { at: 42, v: 40 },
    { at: 50, v: 120 },
    { at: 57, v: 620 },
    { at: 63, v: 200 },
    { at: dur, v: 40 },
  ]);
  const zoom = keys(t, [
    { at: 0, v: 0.72 },
    { at: 11, v: 1.08 },
    { at: 26, v: 1.18 },
    { at: 42, v: 0.98 },
    { at: 57, v: 1.32 },
    { at: dur, v: 0.86 },
  ]);
  const dive = span(t, 48, 62);
  const name = span(t, 60, dur);
  const carX = -900 + ((frame * 2.2) % 2200);

  return (
    <AbsoluteFill>
      <World camX={camX} camY={camY} zoom={zoom}>
        <Layer depth={0.35} camX={camX} camY={camY}>
          <Sky mode="night" frame={frame} />
        </Layer>
        <Ground />
        <Road />
        <Tree x={-640} frame={frame} s={1.1} />
        <Tree x={-180} frame={frame} s={0.85} />
        <Tree x={520} frame={frame} s={1.2} />
        <Tree x={1680} frame={frame} />
        <Lamp x={-420} frame={frame} />
        <Lamp x={980} frame={frame} />
        <Ranch x={-460} w={400} lit={0.35} siding="#c9c3b6" />
        <Ranch x={80} w={520} lit={0.95} />
        <Ranch x={620} w={380} lit={0.2} siding="#c3b8a4" />
        <g opacity={0.85}>
          <Silhouette x={-10} y={GROUND - 8} h={150} frame={frame} phase={1} color="#2a2018" />
          <Silhouette x={70} y={GROUND - 8} h={160} frame={frame} phase={2} color="#241c16" />
        </g>
        <Car x={carX} frame={frame} color="#1e242c" />
        <g transform={`translate(${(camX - 400) * -0.18} 0)`}>
          <Costume x={640} y={GROUND} />
        </g>
        <Character frame={frame} x={860} y={GROUND} {...GACY} pose="talk" facing={1} />
        <Character
          frame={frame}
          x={1040}
          y={GROUND}
          {...NEIGHBOR}
          pose="idle"
          facing={-1}
          scale={0.92}
        />
        <Character
          frame={frame}
          x={1180}
          y={GROUND}
          {...NEIGHBOR}
          hair="long"
          presentation="fem"
          outfit="coat"
          pose="gesture"
          facing={-1}
          scale={0.9}
        />
        <g transform="translate(1500 0)">
          <rect x={-80} y={GROUND - 220} width={16} height={220} fill="#5a5046" />
          <rect x={40} y={GROUND - 180} width={14} height={180} fill="#5a5046" />
          <rect x={-90} y={GROUND - 230} width={160} height={12} fill="#6a6054" />
          <Mixer x={220} frame={frame} />
          <rect x={300} y={GROUND - 40} width={120} height={28} fill="#8a6a3c" />
        </g>
        <Character frame={frame} x={1560} y={GROUND} {...GACY_WORK} pose="point" facing={1} />
        <Character
          frame={frame}
          x={1760}
          y={GROUND}
          {...WORKER}
          pose="walk"
          facing={-1}
        />
        <Mote frame={frame} />
        <g>
          <rect x={-220} y={GROUND} width={620} height={520} fill={PAL.dirtDark} />
          <path d="M-180 560 Q80 640 360 540 V 980 H-180 Z" fill={PAL.dirt} />
          {[-40, 120, 280].map((tx, i) => (
            <rect
              key={tx}
              x={tx}
              y={700}
              width={90}
              height={46 + i * 8}
              rx={6}
              fill="#140e0c"
              opacity={0.85}
            />
          ))}
        </g>
      </World>
      <AbsoluteFill
        style={{
          background: PAL.void,
          opacity: dive.visible ? Math.sin(dive.p * Math.PI) * 0.92 : 0,
        }}
      />
      <Caption
        text="מאחורי הסיוט"
        x={72}
        y={64}
        size={34}
        opacity={t < 8 ? 0.9 : Math.max(0, 1 - (t - 8) / 3)}
      />
      <Caption
        text="ג'ון וויין גייסי"
        x={960}
        y={860}
        align="center"
        latin={false}
        size={54}
        opacity={name.e * (t > 64 ? 1 : 0.85)}
      />
      <Grade />
    </AbsoluteFill>
  );
};
