import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, Silhouette } from "../characters/Character";
import { GACY_WORK, NEIGHBOR, WORKER } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { keys, span, useScene } from "../motion";
import { Blueprint, Cutaway, GROUND, Ranch, Sky, Table } from "../props/scenery";
import { PAL } from "../theme";

/** Down through the house. Workers dig for "drainage." The smell stays upstairs. */
export const Crawl: React.FC = () => {
  const { frame, t, dur } = useScene();
  const down = t < dur * 0.42;
  const dig = span(t, dur * 0.18, dur * 0.55).e;
  const party = t >= dur * 0.55;
  const camY = keys(t, [
    { at: 0, v: -40 },
    { at: dur * 0.2, v: 180 },
    { at: dur * 0.42, v: 640 },
    { at: dur * 0.55, v: 40 },
    { at: dur, v: 220 },
  ]);
  const zoom = keys(t, [
    { at: 0, v: 0.78 },
    { at: dur * 0.42, v: 1.05 },
    { at: dur, v: 1.12 },
  ]);

  return (
    <AbsoluteFill>
      <World camX={0} camY={camY} zoom={zoom}>
        {down ? (
          <g>
            <Cutaway frame={frame} dig={dig} />
            <g transform="translate(0 620)" opacity={dig}>
              <Character
                frame={frame}
                x={-80}
                y={80}
                {...WORKER}
                pose="crouch"
                scale={0.7}
              />
              <Character
                frame={frame}
                x={180}
                y={80}
                {...WORKER}
                hair="buzz"
                pose="crouch"
                scale={0.68}
                facing={-1}
              />
              <Character
                frame={frame}
                x={-280}
                y={20}
                {...GACY_WORK}
                pose="point"
                scale={0.72}
              />
              <Blueprint x={-360} y={-20} />
            </g>
          </g>
        ) : null}
        {party ? (
          <g>
            <rect x={-1000} y={-600} width={2000} height={1200} fill="#2a2420" />
            <rect x={-1000} y={GROUND - 20} width={2000} height={400} fill="#5c4636" />
            <Table x={-40} />
            <Character frame={frame} x={-220} y={GROUND} {...NEIGHBOR} pose="talk" />
            <Character
              frame={frame}
              x={40}
              y={GROUND}
              {...NEIGHBOR}
              presentation="fem"
              hair="long"
              outfit="dress"
              facing={-1}
              expression={t > dur * 0.7 ? "uneasy" : "smile"}
              pose="look"
            />
            <Character
              frame={frame}
              x={280}
              y={GROUND}
              {...GACY_WORK}
              outfit="casual70s"
              pose="gesture"
              facing={-1}
              expression="smile"
            />
            <rect
              x={-16}
              y={GROUND - 8}
              width={50}
              height={14}
              fill="#1a120e"
              opacity={span(t, dur * 0.72, dur).e}
            />
            <Silhouette x={480} y={GROUND} h={200} frame={frame} color="#1a140e" />
          </g>
        ) : null}
      </World>
      {down ? (
        <Caption
          text="crawl space"
          x={72}
          y={78}
          latin
          size={36}
          opacity={span(t, dur * 0.04, dur * 0.22).e * (t < dur * 0.24 ? 1 : 0)}
        />
      ) : null}
      <Grade />
    </AbsoluteFill>
  );
};

/** Not a castle. A house people ate in. The answer is under the floor. */
export const Suburb: React.FC = () => {
  const { frame, t, dur } = useScene();
  const castle = 1 - span(t, dur * 0.18, dur * 0.42).e;
  const camY = keys(t, [
    { at: 0, v: 0 },
    { at: dur * 0.6, v: 40 },
    { at: dur, v: 280 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={0} camY={camY} zoom={1.02 + span(t, dur * 0.6, dur).e * 0.2}>
        <Sky mode="night" frame={frame} />
        <g opacity={castle}>
          <polygon points="-180,-20 0,-260 180,-20" fill="#1a1c24" />
          <rect x={-150} y={-20} width={300} height={180} fill="#14161c" />
          <rect x={-20} y={-180} width={28} height={80} fill="#101218" />
        </g>
        <g opacity={1 - castle * 0.85}>
          <rect x={-1200} y={GROUND} width={2400} height={500} fill={PAL.lawnDeep} />
          <Ranch x={0} w={540} lit={0.9} />
          <Character frame={frame} x={-280} y={GROUND} {...NEIGHBOR} pose="walk" scale={0.9} />
          <Character
            frame={frame}
            x={260}
            y={GROUND}
            hair="long"
            presentation="fem"
            outfit="coat"
            facing={-1}
            pose="idle"
            scale={0.88}
            skin="#e4b896"
          />
        </g>
        <rect x={-400} y={GROUND + 20} width={800} height={360} fill={PAL.dirtDark} opacity={span(t, dur * 0.62, dur).e} />
      </World>
      <Grade />
    </AbsoluteFill>
  );
};
