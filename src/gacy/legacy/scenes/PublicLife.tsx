import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, Silhouette } from "../characters/Character";
import { ATTORNEY, GACY, GACY_POGO, GACY_WORK, WORKER } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { keys, span, useScene } from "../motion";
import {
  Blueprint,
  GROUND,
  Lamp,
  Mixer,
  Ranch,
  Sky,
  Tree,
} from "../props/scenery";
import { PAL } from "../theme";

/** Construction, community, politics — one continuous street of ordinary work. */
export const Business: React.FC = () => {
  const { frame, t, dur } = useScene();
  const camX = keys(t, [
    { at: 0, v: -40 },
    { at: dur * 0.55, v: 280 },
    { at: dur, v: 520 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={camX} camY={50} zoom={1.05}>
        <Sky mode="overcast" frame={frame} />
        <rect x={-800} y={GROUND} width={2200} height={400} fill="#8d8678" />
        <Mixer x={-180} frame={frame} />
        <rect x={-40} y={GROUND - 90} width={150} height={12} fill="#a8844c" />
        <rect x={-20} y={GROUND - 78} width={110} height={12} fill="#8d6a3c" />
        <Blueprint x={160} y={GROUND - 120} />
        <Character frame={frame} x={40} y={GROUND} {...GACY_WORK} pose="talk" />
        <Character frame={frame} x={230} y={GROUND} {...WORKER} pose="idle" facing={-1} />
        <Character
          frame={frame}
          x={360}
          y={GROUND}
          {...WORKER}
          hair="buzz"
          pose="carry"
          facing={1}
          scale={0.92}
        />
        <g transform="translate(620 0)">
          <rect x={-40} y={GROUND - 200} width={280} height={200} fill="#e7e0d4" />
          <rect x={-40} y={GROUND - 200} width={280} height={16} fill="#5c5348" />
        </g>
        <Character frame={frame} x={700} y={GROUND} {...GACY} pose="gesture" outfit="suit" />
        <Character frame={frame} x={880} y={GROUND} {...ATTORNEY} pose="idle" facing={-1} />
      </World>
      <Grade />
    </AbsoluteFill>
  );
};

/** Makeup, one performance, then the costume left behind as a photograph. */
export const Pogo: React.FC = () => {
  const { frame, t, dur } = useScene();
  const show = t > dur * 0.34 && t < dur * 0.72;
  const photo = t >= dur * 0.72;
  const paint = span(t, dur * 0.08, dur * 0.34);
  const camX = keys(t, [
    { at: 0, v: 0 },
    { at: dur * 0.34, v: 30 },
    { at: dur * 0.7, v: -40 },
    { at: dur, v: 180 },
  ]);
  const cool = span(t, dur * 0.72, dur).e;

  return (
    <AbsoluteFill>
      <World camX={camX} camY={20} zoom={show ? 0.98 : 1.12}>
        {!show && !photo ? (
          <g>
            <rect x={-900} y={-500} width={1800} height={1100} fill="#2a2622" />
            <rect x={-220} y={-280} width={280} height={360} rx={8} fill="#1a1816" />
            <rect x={-200} y={-260} width={240} height={320} fill="#3a342c" />
            <Character
              frame={frame}
              x={-40}
              y={GROUND - 20}
              {...GACY}
              pose="look"
              expression="neutral"
              scale={1.05}
            />
            <ellipse
              cx={-70}
              cy={40}
              rx={28}
              ry={36}
              fill="#f7f3ea"
              opacity={paint.e * 0.85}
            />
          </g>
        ) : null}
        {show ? (
          <g>
            <Sky mode="dusk" frame={frame} />
            <rect x={-1000} y={GROUND} width={2000} height={400} fill={PAL.lawn} />
            <Ranch x={-360} lit={0.8} w={420} />
            <Lamp x={200} frame={frame} />
            <Character frame={frame} x={40} y={GROUND} {...GACY_POGO} pose="gesture" />
            <Silhouette x={260} y={GROUND} h={200} frame={frame} color="#1a140e" />
            <Silhouette x={360} y={GROUND} h={230} frame={frame} phase={1} color="#140e0c" />
            <Silhouette x={460} y={GROUND} h={180} frame={frame} phase={2} color="#1c1410" />
          </g>
        ) : null}
        {photo ? (
          <g>
            <rect x={-900} y={-500} width={1800} height={1100} fill="#1c1a18" />
            <rect x={-80} y={-220} width={200} height={260} fill={PAL.paper} />
            <rect x={-60} y={-190} width={160} height={180} fill="#d24a3a" opacity={1 - cool * 0.45} />
            <circle cx={20} cy={-120} r={28} fill="#f7f3ea" />
            <Tree x={520} y={GROUND + 40} frame={frame} />
            <Ranch x={700} y={GROUND + 40} lit={0.4 + cool * 0.4} w={360} />
          </g>
        ) : null}
      </World>
      <Caption
        text="Pogo"
        x={72}
        y={72}
        latin
        size={42}
        opacity={span(t, dur * 0.02, dur * 0.28).e * (t < dur * 0.3 ? 1 : 0)}
      />
      <Grade lift={show ? 0.6 : 0} />
    </AbsoluteFill>
  );
};
