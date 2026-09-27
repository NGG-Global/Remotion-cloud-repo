import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../characters/Character";
import { GACY, GACY_POGO, GACY_WORK, NEIGHBOR } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { keys, span, useScene } from "../motion";
import { GROUND, Helix, Ranch, Sky } from "../props/scenery";
import { PAL } from "../theme";

const NAMES = ["William Bundy", "James Haakenson", "Francis Wayne Alexander"] as const;

const FileCard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly name?: string;
  readonly open: number;
}> = ({ x, y, name, open }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-70} y={-90} width={140} height={180} rx={4} fill={name ? PAL.paper : "#2a2622"} />
    <rect x={-54} y={-64} width={108} height={8} rx={2} fill={name ? "#c9bea6" : "#3a342c"} />
    <rect x={-54} y={-44} width={80} height={8} rx={2} fill={name ? "#c9bea6" : "#3a342c"} />
    {name ? (
      <text
        x={0}
        y={30}
        textAnchor="middle"
        fill={PAL.ink}
        fontFamily="Playfair Display, serif"
        fontSize={13}
        opacity={open}
      >
        {name}
      </text>
    ) : (
      <text
        x={0}
        y={20}
        textAnchor="middle"
        fill={PAL.muted}
        fontFamily="Playfair Display, serif"
        fontSize={28}
        opacity={0.7}
      >
        —
      </text>
    )}
  </g>
);

/** The investigation turns toward names. Three files close. Five stay open. */
export const Names: React.FC = () => {
  const { frame, t, dur } = useScene();
  const named = span(t, dur * 0.42, dur * 0.72).e;
  return (
    <AbsoluteFill>
      <World camX={0} camY={keys(t, [{ at: 0, v: 40 }, { at: dur, v: -10 }])} zoom={1.02}>
        <rect x={-1100} y={-540} width={2200} height={1200} fill="#14120f" />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-700} y={-300 + i * 70} width={180} height={48} fill="#3a3028" />
        ))}
        <Helix x={-280} y={40} frame={frame} />
        {NAMES.map((name, i) => {
          const active = named > i / 3 && named < (i + 1.15) / 3 ? 1 : named > (i + 1) / 3 ? 0.55 : 0.2;
          return <FileCard key={name} x={-80 + i * 240} y={-30} name={name.split(" ")[0]} open={active} />;
        })}
        {Array.from({ length: 5 }, (_, i) => (
          <FileCard key={i} x={-80 + i * 150} y={200} open={1} />
        ))}
      </World>
      <Caption text="2011" x={72} y={70} latin size={40} opacity={t < dur * 0.25 ? 0.95 : 0} />
      <Caption
        text={NAMES[Math.min(2, Math.floor(named * 3))]}
        x={960}
        y={78}
        align="center"
        latin
        size={34}
        opacity={named > 0.05 && named < 0.98 ? 1 : 0}
      />
      <Caption
        text="חמישה ללא שם"
        x={72}
        y={860}
        size={36}
        opacity={span(t, dur * 0.75, dur).e}
      />
      <Grade />
    </AbsoluteFill>
  );
};

/** Pogo slides out of the way. What stays is an ordinary man and an ordinary house. */
export const Ending: React.FC = () => {
  const { frame, t, dur } = useScene();
  const poster = 1 - span(t, dur * 0.08, dur * 0.28).e;
  const camX = keys(t, [
    { at: 0, v: -40 },
    { at: dur * 0.35, v: 180 },
    { at: dur * 0.62, v: 460 },
    { at: dur, v: 40 },
  ]);
  const camY = keys(t, [
    { at: 0, v: 0 },
    { at: dur * 0.7, v: 30 },
    { at: dur, v: 160 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={camX} camY={camY} zoom={keys(t, [{ at: 0, v: 1.05 }, { at: dur, v: 0.92 }])}>
        <Sky mode="dusk" frame={frame} />
        <rect x={-400} y={GROUND} width={2600} height={500} fill={PAL.lawnDeep} />
        <g opacity={poster} transform={`translate(${-200 - (1 - poster) * 400} -40)`}>
          <rect x={-90} y={-240} width={180} height={240} fill="#f4efe4" />
          <circle cx={0} cy={-140} r={36} fill="#f7f3ea" />
          <circle cx={0} cy={-128} r={8} fill="#c43636" />
          <rect x={-70} y={-80} width={140} height={70} fill="#a33b3b" />
        </g>
        <Character frame={frame} x={220} y={GROUND} {...GACY_WORK} pose="talk" />
        <Character frame={frame} x={420} y={GROUND} {...NEIGHBOR} pose="idle" facing={-1} scale={0.92} />
        <Character
          frame={frame}
          x={620}
          y={GROUND}
          {...GACY}
          pose="gesture"
          expression="smile"
        />
        <g opacity={span(t, dur * 0.4, dur * 0.62).e}>
          <Character frame={frame} x={860} y={GROUND} {...GACY_POGO} pose="idle" scale={0.8} />
        </g>
        <Ranch x={80} w={500} lit={0.85} />
        <rect
          x={-80}
          y={GROUND + 8}
          width={360}
          height={70}
          fill="#120e0c"
          opacity={span(t, dur * 0.78, dur).e}
        />
      </World>
      <Grade lift={0.35} />
    </AbsoluteFill>
  );
};
