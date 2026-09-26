import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, Silhouette } from "../characters/Character";
import { ATTORNEY, GACY_SUIT, JUDGE } from "../characters/presets";
import { Caption } from "../components/Type";
import { Grade, World } from "../components/Stage";
import { hash, keys, span, useScene } from "../motion";
import { Bars, Document, Flashlight, GROUND, Marker } from "../props/scenery";
import { PAL } from "../theme";

/** Markers accumulate. The number is a composition, not a title card. */
export const Search2: React.FC = () => {
  const { t, dur } = useScene();
  const count = Math.max(1, Math.round(span(t, dur * 0.28, dur * 0.72).e * 18));
  const camY = keys(t, [
    { at: 0, v: 0 },
    { at: dur * 0.25, v: 180 },
    { at: dur * 0.7, v: 80 },
    { at: dur, v: -20 },
  ]);
  const zoom = keys(t, [
    { at: 0, v: 1.1 },
    { at: dur * 0.3, v: 1.25 },
    { at: dur, v: 0.78 },
  ]);
  const show33 = span(t, dur * 0.72, dur).e;
  return (
    <AbsoluteFill>
      <World camX={0} camY={camY} zoom={zoom}>
        <rect x={-1100} y={-500} width={2200} height={1200} fill={PAL.dirtDark} />
        <rect x={-900} y={-80} width={1800} height={28} fill="#5c4636" />
        <Flashlight x={-200} y={-160} rot={50} length={420} />
        <Flashlight x={180} y={-140} rot={70} length={380} />
        {Array.from({ length: count }, (_, i) => (
          <Marker
            key={i}
            x={-420 + (i % 6) * 150 + hash(i) * 20}
            y={80 + Math.floor(i / 6) * 110}
            n={i + 1}
            pop={Math.min(1, span(t, dur * 0.28 + i * 0.35, dur * 0.34 + i * 0.35).e)}
          />
        ))}
        <text
          x={0}
          y={-220}
          textAnchor="middle"
          fill={PAL.paper}
          fontFamily="Playfair Display, serif"
          fontSize={160}
          opacity={show33 * 0.9}
        >
          33
        </text>
      </World>
      <Caption text="21.12.1978" x={72} y={70} latin size={34} opacity={t < dur * 0.22 ? 0.9 : 0} />
      <Grade />
    </AbsoluteFill>
  );
};

/** The scoreboard falls away. What remains are people. */
export const People: React.FC = () => {
  const { frame, t, dur } = useScene();
  const reject = span(t, dur * 0.28, dur * 0.5).e;
  return (
    <AbsoluteFill>
      <World camX={0} camY={20} zoom={1}>
        <rect x={-1000} y={-540} width={2000} height={1200} fill="#120e0c" />
        <g opacity={1 - reject}>
          {["Bundy", "Dahmer", "Gacy"].map((name, i) => (
            <g key={name} transform={`translate(${-280 + i * 280} -40)`}>
              <rect x={-80} y={-50} width={160} height={90} fill="#1c1814" />
              <text
                x={0}
                y={8}
                textAnchor="middle"
                fill={PAL.muted}
                fontFamily="Playfair Display, serif"
                fontSize={28}
              >
                {name}
              </text>
            </g>
          ))}
        </g>
        <g opacity={span(t, dur * 0.4, dur * 0.85).e}>
          {Array.from({ length: 9 }, (_, i) => (
            <Silhouette
              key={i}
              x={-360 + (i % 5) * 160}
              y={GROUND - 20 + Math.floor(i / 5) * 10}
              h={180 + (i % 3) * 30}
              frame={frame}
              phase={i}
              color={i % 2 ? "#1a140e" : "#241810"}
            />
          ))}
        </g>
        <circle cx={420} cy={-180} r={8} fill={PAL.lamp} opacity={0.8} />
      </World>
      <Grade />
    </AbsoluteFill>
  );
};

/** A courtroom. The second silhouette does not persuade the jury. */
export const Trial: React.FC = () => {
  const { frame, t, dur } = useScene();
  const verdict = span(t, dur * 0.78, dur).e;
  const ghost = span(t, dur * 0.28, dur * 0.48);
  const camX = keys(t, [
    { at: 0, v: -40 },
    { at: dur * 0.4, v: 80 },
    { at: dur * 0.7, v: -20 },
    { at: dur, v: 0 },
  ]);
  return (
    <AbsoluteFill>
      <World camX={camX} camY={40} zoom={1.08}>
        <rect x={-1100} y={-560} width={2200} height={1200} fill="#3a332c" />
        <rect x={-1100} y={-80} width={2200} height={700} fill="#2a241e" />
        <rect x={-320} y={-280} width={640} height={70} fill="#6b5344" />
        <rect x={-240} y={-230} width={480} height={22} fill="#8a6a4a" />
        <Character frame={frame} x={0} y={GROUND - 40} {...JUDGE} pose="sit" scale={0.95} />
        <Character frame={frame} x={-280} y={GROUND} {...GACY_SUIT} pose="idle" />
        <g opacity={ghost.visible ? (1 - ghost.p) * 0.45 : 0}>
          <Character frame={frame} x={-220} y={GROUND} {...GACY_SUIT} pose="idle" scale={1.02} />
        </g>
        <Character frame={frame} x={-430} y={GROUND} {...ATTORNEY} pose="talk" />
        <Character
          frame={frame}
          x={260}
          y={GROUND}
          {...ATTORNEY}
          outfitColor="#2c3a44"
          pose="point"
          facing={-1}
        />
        {Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x={-300 + i * 70}
            y={-40}
            width={40}
            height={28}
            rx={4}
            fill="#2a3038"
            opacity={verdict > 0 && i < Math.ceil(verdict * 6) ? 1 : 0.45}
          />
        ))}
        <Document x={420} y={40} stamp={verdict > 0.6 ? "GUILTY" : ""} open={span(t, dur * 0.7, dur).e} />
      </World>
      <Caption text="1980" x={72} y={70} latin size={42} opacity={t < dur * 0.2 ? 0.95 : 0} />
      <Caption
        text="33"
        x={960}
        y={820}
        align="center"
        latin
        size={72}
        opacity={verdict * (t > dur * 0.82 ? 1 : 0)}
      />
      <Grade />
    </AbsoluteFill>
  );
};

/** Appeals, a date, a light going out. No spectacle. */
export const Execution: React.FC = () => {
  const { t, dur } = useScene();
  const off = span(t, dur * 0.55, dur * 0.82).e;
  const pages = Math.floor(span(t, 0, dur * 0.5).e * 6);
  return (
    <AbsoluteFill>
      <World camX={span(t, 0, dur).e * 40} camY={0} zoom={1.05 + off * 0.08}>
        <rect x={-1000} y={-540} width={2000} height={1200} fill="#121418" />
        <rect x={-700} y={-200} width={900} height={280} fill="#1a1e24" />
        <Bars x={-200} opacity={0.85} />
        <rect x={180} y={-160} width={160} height={220} fill="#0c0e12" />
        <rect x={196} y={-144} width={128} height={188} fill={PAL.lamp} opacity={0.35 * (1 - off)} />
        <g transform="translate(-360 -20)">
          {Array.from({ length: pages }, (_, i) => (
            <rect
              key={i}
              x={i * 3}
              y={-i * 2}
              width={70}
              height={90}
              fill={PAL.paper}
              opacity={0.8}
            />
          ))}
        </g>
      </World>
      <Caption
        text="10.5.1994"
        x={72}
        y={78}
        latin
        size={40}
        opacity={span(t, dur * 0.32, dur * 0.7).e}
      />
      <Grade />
    </AbsoluteFill>
  );
};
