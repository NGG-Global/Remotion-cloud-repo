import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../characters/Character";
import { DETECTIVE, GACY, MOTHER, OFFICER, PIEST } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { keys, lerp, span, useScene } from "../motion";
import {
  Car,
  Clock,
  Document,
  Flashlight,
  GROUND,
  Ranch,
  Shelves,
  Sky,
} from "../props/scenery";
import { PAL } from "../theme";

/** Robert Piest leaves the pharmacy. The picture stops at the empty door. */
export const Piest: React.FC = () => {
  const { frame, t, dur } = useScene();
  const leave = span(t, dur * 0.55, dur * 0.78);
  const camX = keys(t, [
    { at: 0, v: -80 },
    { at: dur * 0.4, v: 40 },
    { at: dur * 0.7, v: 220 },
    { at: dur, v: 300 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={camX} camY={30} zoom={1.08}>
        <rect x={-1100} y={-500} width={2200} height={1100} fill="#e7e2d8" />
        <Shelves x={-620} />
        <rect x={-40} y={GROUND - 120} width={280} height={18} fill="#6b5344" />
        <rect x={420} y={-200} width={90} height={420} fill="#3a342c" />
        <Clock x={240} y={-160} frame={frame} speed={leave.e * 4 + 0.4} />
        <Character frame={frame} x={80} y={GROUND} {...PIEST} pose={leave.p > 0.2 ? "walk" : "idle"} />
        <Character
          frame={frame}
          x={260}
          y={GROUND}
          {...GACY}
          pose="talk"
          facing={-1}
        />
        <g transform="translate(640 40)" opacity={span(t, dur * 0.22, dur * 0.7).e}>
          <Car x={0} y={GROUND - 20} color="#4a4038" frame={frame} />
          <Character frame={frame} x={120} y={GROUND} {...MOTHER} pose="look" facing={-1} scale={0.9} />
        </g>
      </World>
      <Caption text="רוברט פייסט" x={72} y={68} size={44} opacity={span(t, 0, dur * 0.35).e} />
      <Caption
        text="11.12.1978"
        x={72}
        y={124}
        latin
        size={32}
        opacity={span(t, dur * 0.08, dur * 0.4).e * (t < dur * 0.45 ? 1 : 0)}
      />
      <Caption
        text="Des Plaines"
        x={72}
        y={168}
        latin
        size={28}
        opacity={span(t, dur * 0.12, dur * 0.4).e * (t < dur * 0.42 ? 0.85 : 0)}
      />
      <Grade />
    </AbsoluteFill>
  );
};

/** A name, a file, a warrant, a receipt. The search does not let go. */
export const Police: React.FC = () => {
  const { frame, t, dur } = useScene();
  const house = t > dur * 0.55;
  const camX = keys(t, [
    { at: 0, v: -40 },
    { at: dur * 0.45, v: 60 },
    { at: dur, v: 20 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={camX} camY={house ? 80 : 10} zoom={house ? 1.02 : 1.08}>
        {!house ? (
          <g>
            <rect x={-1000} y={-520} width={2000} height={1100} fill="#1c2430" />
            <rect x={-360} y={GROUND - 40} width={520} height={20} fill="#3a342c" />
            <Character frame={frame} x={-180} y={GROUND} {...DETECTIVE} pose="talk" />
            <Character frame={frame} x={40} y={GROUND} {...OFFICER} pose="idle" facing={-1} />
            <Document x={240} y={-10} stamp="1968" open={span(t, dur * 0.25, dur * 0.5).e} />
            <Document
              x={400}
              y={20}
              w={120}
              h={80}
              stamp="WARRANT"
              open={span(t, dur * 0.42, dur * 0.62).e}
            />
          </g>
        ) : (
          <g>
            <Sky mode="night" frame={frame} />
            <rect x={-1100} y={GROUND} width={2200} height={400} fill={PAL.lawnDeep} />
            <Ranch x={40} w={500} lit={0.85} />
            <Car x={-360} y={GROUND + 70} kind="police" frame={frame} />
            <Character frame={frame} x={-120} y={GROUND} {...OFFICER} pose="walk" />
            <Character frame={frame} x={200} y={GROUND} {...DETECTIVE} pose="look" facing={-1} />
            <Flashlight x={220} y={GROUND - 180} rot={-30} />
            <g transform="translate(380 80)" opacity={span(t, dur * 0.78, dur).e}>
              <rect x={-28} y={-36} width={56} height={70} rx={4} fill="#d7e2c8" />
              <rect x={-18} y={-22} width={36} height={6} fill="#8a8478" />
              <rect x={-18} y={-8} width={28} height={6} fill="#c45c3c" />
            </g>
          </g>
        )}
      </World>
      <Caption text="13.12.1978" x={72} y={72} latin size={36} opacity={span(t, dur * 0.38, dur * 0.6).e} />
      <Grade />
    </AbsoluteFill>
  );
};

/** Surveillance. He invites them in. One detective knows the smell. */
export const Watch: React.FC = () => {
  const { frame, t, dur } = useScene();
  const inside = t > dur * 0.58;
  const dusk = span(t, 0, dur * 0.5).e;
  const cups = Math.min(4, Math.floor(span(t, dur * 0.08, dur * 0.5).p * 4));
  const camY = keys(t, [
    { at: 0, v: 40 },
    { at: dur * 0.58, v: 20 },
    { at: dur, v: 260 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={0} camY={camY} zoom={inside ? 1.16 : 1}>
        {!inside ? (
          <g>
            <Sky mode={dusk > 0.65 ? "night" : "dusk"} frame={frame} />
            <rect x={-1100} y={GROUND} width={2200} height={400} fill={PAL.lawnDeep} />
            <Ranch x={280} w={460} lit={0.5 + dusk * 0.4} />
            <Car x={-220} y={GROUND + 78} color="#2a3138" frame={frame} />
            <Character frame={frame} x={-280} y={GROUND + 8} {...DETECTIVE} pose="sit" scale={0.72} />
            <Character
              frame={frame}
              x={-150}
              y={GROUND + 8}
              {...OFFICER}
              pose="sit"
              facing={-1}
              scale={0.7}
            />
            {Array.from({ length: cups }, (_, i) => (
              <rect key={i} x={-340 + i * 16} y={GROUND - 20} width={10} height={14} rx={2} fill="#efe6d4" />
            ))}
            <Character
              frame={frame}
              x={300}
              y={GROUND - 30}
              {...GACY}
              pose="gesture"
              scale={0.55}
              expression="smile"
            />
          </g>
        ) : (
          <g>
            <rect x={-1000} y={-500} width={2000} height={1100} fill="#241e1a" />
            <rect x={-1000} y={GROUND} width={2000} height={500} fill="#3e2e22" />
            <Character frame={frame} x={-80} y={GROUND} {...GACY} pose="talk" expression="smile" />
            <Character
              frame={frame}
              x={180}
              y={GROUND}
              {...DETECTIVE}
              pose="look"
              facing={-1}
              expression={t > dur * 0.74 ? "uneasy" : "serious"}
            />
          </g>
        )}
      </World>
      <Grade />
    </AbsoluteFill>
  );
};

/** The channel mention stays a caption. The picture is already going back to the house. */
export const Subscribe: React.FC = () => {
  const { frame, t, dur } = useScene();
  const camX = lerp(-120, 80, span(t, 0, dur).e);
  const camY = keys(t, [
    { at: 0, v: 40 },
    { at: dur * 0.7, v: 60 },
    { at: dur, v: 180 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={camX} camY={camY} zoom={1.02}>
        <Sky mode="night" frame={frame} />
        <rect x={-1100} y={GROUND} width={2400} height={500} fill={PAL.lawnDeep} />
        <Ranch x={160} w={520} lit={0.75} />
        <Car x={-420 + span(t, 0, dur * 0.6).e * 160} y={GROUND + 70} kind="police" frame={frame} />
        <Character frame={frame} x={-80} y={GROUND} {...OFFICER} pose="walk" />
        <Character frame={frame} x={60} y={GROUND} {...DETECTIVE} pose="walk" />
        <rect
          x={80}
          y={GROUND + 30}
          width={280}
          height={80}
          fill={PAL.dirtDark}
          opacity={span(t, dur * 0.62, dur).e}
        />
      </World>
      <Caption text="מאחורי הסיוט" x={72} y={860} size={32} opacity={0.85} />
      <Caption text="הירשמו" x={72} y={908} size={28} tone="amber" opacity={span(t, dur * 0.15, dur * 0.7).e} />
      <Grade />
    </AbsoluteFill>
  );
};
