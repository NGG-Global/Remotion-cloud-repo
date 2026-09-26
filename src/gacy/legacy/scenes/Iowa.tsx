import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../characters/Character";
import { GACY_SUIT, NEIGHBOR } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { keys, span, useScene } from "../motion";
import {
  Bars,
  Document,
  GROUND,
  Road,
  Sky,
  WindowWall,
} from "../props/scenery";
import { PAL } from "../theme";

/** Iowa looks ordinary. Then a conviction, a short sentence, and a public return. */
export const Iowa: React.FC = () => {
  const { frame, t, dur } = useScene();
  const map = t < dur * 0.22;
  const ordinary = t >= dur * 0.22 && t < dur * 0.48;
  const prison = t >= dur * 0.48 && t < dur * 0.78;
  const back = t >= dur * 0.78;
  const camX = keys(t, [
    { at: 0, v: 0 },
    { at: dur * 0.22, v: 40 },
    { at: dur * 0.48, v: -30 },
    { at: dur * 0.78, v: 80 },
    { at: dur, v: 200 },
  ]);
  const line = span(t, 0, dur * 0.22).e;

  return (
    <AbsoluteFill>
      <World camX={camX} camY={30} zoom={map ? 0.95 : 1.05}>
        {map ? (
          <g>
            <Sky mode="overcast" frame={frame} />
            <rect x={-900} y={-200} width={1800} height={760} fill="#d9d3c6" />
            <path
              d="M-520 80 C-200 40, 40 160, 420 60"
              stroke={PAL.evidence}
              strokeWidth={6}
              fill="none"
              strokeDasharray={`${line * 980} 1200`}
              strokeLinecap="round"
            />
            <circle cx={-520} cy={80} r={8} fill={PAL.ink} />
            <circle cx={420} cy={60} r={8} fill={PAL.ink} />
          </g>
        ) : null}
        {ordinary ? (
          <g>
            <Sky mode="day" frame={frame} />
            <rect x={-1200} y={GROUND} width={2400} height={400} fill="#cbb98a" />
            <WindowWall night={false} />
            <rect x={-180} y={GROUND - 150} width={360} height={16} fill="#6b5344" />
            <rect x={-40} y={GROUND - 280} width={200} height={130} rx={6} fill="#8d3a32" />
            <rect x={-20} y={GROUND - 250} width={160} height={70} fill={PAL.window} opacity={0.7} />
            <Character frame={frame} x={-260} y={GROUND} {...GACY_SUIT} pose="talk" scale={0.95} />
            <Character
              frame={frame}
              x={-40}
              y={GROUND}
              {...NEIGHBOR}
              presentation="fem"
              hair="tied"
              outfit="dress"
              facing={-1}
              pose="idle"
              scale={0.92}
            />
          </g>
        ) : null}
        {prison ? (
          <g>
            <rect x={-1000} y={-600} width={2000} height={1200} fill="#1a1c22" />
            <Document x={0} y={-20} stamp="1968" open={span(t, dur * 0.5, dur * 0.7).e} />
            <Bars opacity={span(t, dur * 0.58, dur * 0.78).e} />
          </g>
        ) : null}
        {back ? (
          <g>
            <Sky mode="dusk" frame={frame} />
            <rect x={-1200} y={GROUND} width={2400} height={400} fill={PAL.lawn} />
            <Road y={GROUND + 40} />
            <Character frame={frame} x={40} y={GROUND} {...GACY_SUIT} pose="walk" />
            <Character
              frame={frame}
              x={280}
              y={GROUND}
              {...NEIGHBOR}
              facing={-1}
              pose="idle"
              scale={0.9}
            />
            <Character
              frame={frame}
              x={420}
              y={GROUND}
              hair="long"
              presentation="fem"
              outfit="coat"
              facing={-1}
              scale={0.88}
              skin="#e4b896"
            />
          </g>
        ) : null}
      </World>
      {map ? (
        <>
          <Caption text="שיקגו" x={280} y={430} size={32} align="left" tone="ink" />
          <Caption text="איווה" x={1500} y={390} size={32} align="left" tone="ink" />
        </>
      ) : null}
      {prison ? (
        <Caption text="1968" x={72} y={78} size={48} latin opacity={0.95} />
      ) : null}
      {back ? <Caption text="1970" x={72} y={78} size={44} latin /> : null}
      <Grade />
    </AbsoluteFill>
  );
};
