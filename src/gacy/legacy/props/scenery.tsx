import React from "react";
import { hash } from "../motion";
import { PAL } from "../theme";

export const GROUND = 470;

export const Sky: React.FC<{
  readonly mode?: "night" | "dusk" | "day" | "overcast";
  readonly frame?: number;
}> = ({ mode = "night", frame = 0 }) => {
  const top =
    mode === "day"
      ? PAL.dayTop
      : mode === "overcast"
        ? "#7d8792"
        : mode === "dusk"
          ? "#3a2c32"
          : PAL.skyTop;
  const low =
    mode === "day"
      ? PAL.dayLow
      : mode === "overcast"
        ? "#c8c0b2"
        : mode === "dusk"
          ? "#c47a52"
          : PAL.skyLow;
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${mode}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
      </defs>
      <rect x={-2400} y={-900} width={4800} height={1400} fill={`url(#sky-${mode})`} />
      {mode === "night" || mode === "dusk"
        ? Array.from({ length: 28 }, (_, i) => {
            const x = hash(i * 3.1) * 2800 - 1400;
            const y = hash(i * 5.7) * 420 - 520;
            const tw = 0.45 + Math.sin(frame * 0.05 + i) * 0.35;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={hash(i) > 0.85 ? 1.8 : 1.1}
                fill="#f4efe6"
                opacity={mode === "dusk" ? tw * 0.25 : tw}
              />
            );
          })
        : null}
      {mode === "night" ? (
        <g transform="translate(620 -380)">
          <circle r={36} fill="#f3ead4" opacity={0.92} />
          <circle cx={12} cy={-6} r={30} fill={PAL.skyTop} opacity={0.18} />
        </g>
      ) : null}
      {mode === "day" || mode === "overcast"
        ? [0, 1, 2].map((i) => {
            const drift = ((frame * 0.35 + i * 240) % 1600) - 800;
            return (
              <ellipse
                key={i}
                cx={drift + i * 80}
                cy={-360 + i * 30}
                rx={90}
                ry={22}
                fill="#fff"
                opacity={mode === "overcast" ? 0.35 : 0.55}
              />
            );
          })
        : null}
    </g>
  );
};

export const Ground: React.FC<{
  readonly y?: number;
  readonly color?: string;
  readonly width?: number;
}> = ({ y = GROUND, color = PAL.lawn, width = 4000 }) => (
  <g>
    <rect x={-width / 2} y={y} width={width} height={700} fill={color} />
    <rect x={-width / 2} y={y} width={width} height={18} fill="#000" opacity={0.08} />
  </g>
);

export const Road: React.FC<{ readonly y?: number }> = ({ y = GROUND + 70 }) => (
  <g>
    <rect x={-2000} y={y} width={4000} height={150} fill={PAL.road} />
    {Array.from({ length: 14 }, (_, i) => (
      <rect
        key={i}
        x={-1600 + i * 240}
        y={y + 68}
        width={90}
        height={6}
        rx={2}
        fill={PAL.roadLine}
        opacity={0.7}
      />
    ))}
  </g>
);

export const Tree: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly s?: number;
  readonly frame?: number;
}> = ({ x, y = GROUND, s = 1, frame = 0 }) => {
  const sway = Math.sin(frame * 0.04 + x * 0.01) * 1.8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-8} y={-150} width={16} height={150} fill="#3a2c22" />
      <g transform={`rotate(${sway} 0 -150)`}>
        <ellipse cx={0} cy={-190} rx={54} ry={40} fill="#24382c" />
        <ellipse cx={-28} cy={-160} rx={36} ry={28} fill="#1c3026" />
        <ellipse cx={30} cy={-166} rx={34} ry={26} fill="#2c4636" />
      </g>
    </g>
  );
};

export const Lamp: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly frame?: number;
}> = ({ x, y = GROUND, frame = 0 }) => {
  const glow = 0.55 + Math.sin(frame * 0.08 + x) * 0.08;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-4} y={-210} width={8} height={210} fill="#2a2c30" />
      <path d="M-4 -210 H 28" stroke="#2a2c30" strokeWidth={6} />
      <rect x={16} y={-226} width={28} height={16} rx={3} fill="#3a342c" />
      <ellipse cx={30} cy={-200} rx={46} ry={18} fill={PAL.lamp} opacity={glow * 0.35} />
      <circle cx={30} cy={-214} r={5} fill={PAL.lamp} opacity={glow} />
    </g>
  );
};

export const Ranch: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly w?: number;
  readonly lit?: number;
  readonly siding?: string;
  readonly focus?: boolean;
}> = ({ x, y = GROUND, w = 460, lit = 1, siding = PAL.siding, focus = false }) => {
  const h = w * 0.55;
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon
        points={`${-w / 2 - 24},${-h * 0.62} 0,${-h - 10} ${w / 2 + 24},${-h * 0.62}`}
        fill={PAL.roof}
      />
      <rect x={w * 0.22} y={-h - 8} width={22} height={46} fill="#4a4038" />
      <rect
        x={-w / 2}
        y={-h * 0.7}
        width={w}
        height={h * 0.7}
        fill={siding}
      />
      <rect x={-w / 2} y={-h * 0.22} width={w} height={10} fill={PAL.sidingShade} />
      {focus ? (
        <rect
          x={-w / 2 - 6}
          y={-h * 0.72}
          width={w + 12}
          height={h * 0.74}
          fill="none"
          stroke={PAL.amber}
          strokeWidth={3}
          opacity={0.0}
        />
      ) : null}
      <rect x={-26} y={-h * 0.42} width={52} height={h * 0.42} rx={2} fill="#5a4032" />
      <circle cx={14} cy={-h * 0.2} r={3} fill="#d4b36a" />
      {[-w * 0.32, w * 0.28].map((wx) => (
        <g key={wx}>
          <rect
            x={wx - 28}
            y={-h * 0.52}
            width={56}
            height={44}
            fill={lit > 0.2 ? PAL.window : "#2a3340"}
            opacity={0.35 + lit * 0.65}
          />
          <path
            d={`M${wx} ${-h * 0.52} V${-h * 0.52 + 44} M${wx - 28} ${-h * 0.52 + 22} H${wx + 28}`}
            stroke="#5c5348"
            strokeWidth={2}
            opacity={0.45}
          />
          {lit > 0.4 ? (
            <ellipse
              cx={wx}
              cy={-h * 0.2}
              rx={40}
              ry={16}
              fill={PAL.window}
              opacity={0.18 * lit}
            />
          ) : null}
        </g>
      ))}
      <rect x={-w * 0.08} y={-8} width={w * 0.5} height={8} fill="#6b5344" />
    </g>
  );
};

export const Car: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly color?: string;
  readonly kind?: "sedan" | "van" | "police";
  readonly frame?: number;
}> = ({ x, y = GROUND + 78, color = "#2c3540", kind = "sedan", frame = 0 }) => {
  const w = kind === "van" ? 210 : 168;
  const h = kind === "van" ? 78 : 52;
  const spin = (frame * 8 + x) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h} width={w} height={h * 0.62} rx={12} fill={color} />
      <path
        d={`M${-w * 0.22} ${-h} L${-w * 0.08} ${-h - 28} H${w * 0.28} L${w * 0.4} ${-h} Z`}
        fill={kind === "van" ? color : "#24303a"}
      />
      <rect
        x={-w * 0.05}
        y={-h - 22}
        width={w * 0.28}
        height={18}
        fill="#9bb0c0"
        opacity={0.8}
      />
      {kind === "police" ? (
        <g>
          <rect x={-16} y={-h - 10} width={32} height={8} rx={2} fill="#1a1e24" />
          <circle cx={-6} cy={-h - 6} r={3} fill="#c43636" opacity={0.6 + Math.sin(frame * 0.5) * 0.4} />
          <circle cx={8} cy={-h - 6} r={3} fill="#3a6ec4" opacity={0.6 + Math.sin(frame * 0.5 + 2) * 0.4} />
        </g>
      ) : null}
      {[-w * 0.28, w * 0.28].map((wx) => (
        <g key={wx} transform={`translate(${wx} ${-8}) rotate(${spin})`}>
          <circle r={16} fill="#1a1c20" />
          <circle r={6} fill="#8a8680" />
        </g>
      ))}
    </g>
  );
};

export const Mixer: React.FC<{ readonly x: number; readonly y?: number; readonly frame: number }> = ({
  x,
  y = GROUND,
  frame,
}) => {
  const rot = frame * 2.2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-46} y={-36} width={92} height={36} fill="#4a4038" />
      <g transform={`translate(0 -70) rotate(${rot})`}>
        <ellipse rx={48} ry={28} fill="#8a8174" />
        <ellipse rx={48} ry={28} fill="none" stroke="#5c564c" strokeWidth={3} strokeDasharray="8 6" />
      </g>
      <rect x={-8} y={-46} width={16} height={20} fill="#3a342c" />
    </g>
  );
};

export const WindowWall: React.FC<{
  readonly y?: number;
  readonly night?: boolean;
  readonly lit?: number;
}> = ({ y = GROUND, night = true, lit = 1 }) => (
  <g>
    <rect x={-1400} y={-700} width={2800} height={y + 700} fill={night ? "#2a2622" : "#e7e0d4"} />
    <rect x={-1400} y={y - 16} width={2800} height={420} fill="#6a5342" />
    <rect x={-1400} y={y - 8} width={2800} height={8} fill="#3e2e22" />
    {[-520, 40, 560].map((wx) => (
      <g key={wx}>
        <rect x={wx} y={-280} width={160} height={120} fill={night ? "#101820" : "#c5d4de"} />
        <rect
          x={wx + 8}
          y={-272}
          width={144}
          height={104}
          fill={PAL.window}
          opacity={night ? 0.15 + lit * 0.35 : 0.35}
        />
      </g>
    ))}
  </g>
);

export const Table: React.FC<{ readonly x: number; readonly y?: number }> = ({
  x,
  y = GROUND - 10,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-90} y={-18} width={180} height={16} rx={3} fill="#6b4e36" />
    <rect x={-78} y={-2} width={10} height={70} fill="#4a3424" />
    <rect x={68} y={-2} width={10} height={70} fill="#4a3424" />
  </g>
);

export const Chair: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly empty?: boolean;
}> = ({ x, y = GROUND, empty = false }) => (
  <g transform={`translate(${x} ${y})`} opacity={empty ? 0.55 : 1}>
    <rect x={-22} y={-78} width={44} height={50} rx={4} fill="#5c4636" />
    <rect x={-26} y={-28} width={52} height={10} rx={2} fill="#6b5344" />
    <rect x={-20} y={-18} width={6} height={48} fill="#3e2c20" />
    <rect x={14} y={-18} width={6} height={48} fill="#3e2c20" />
  </g>
);

export const Document: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly stamp?: string;
  readonly open?: number;
}> = ({ x, y, w = 140, h = 180, stamp, open = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${0.92 + open * 0.08})`} opacity={0.4 + open * 0.6}>
    <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w} height={h} rx={4} fill="#d9cdb6" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={PAL.paper} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect
        key={i}
        x={-w / 2 + 16}
        y={-h / 2 + 22 + i * 18}
        width={w - 48 - (i % 3) * 16}
        height={5}
        rx={2}
        fill="#c9bea6"
      />
    ))}
    {stamp ? (
      <g transform="rotate(-8)">
        <rect x={-46} y={18} width={92} height={28} rx={3} fill="none" stroke={PAL.evidence} strokeWidth={3} />
        <text
          x={0}
          y={38}
          textAnchor="middle"
          fill={PAL.evidence}
          fontFamily="Playfair Display, serif"
          fontSize={14}
        >
          {stamp}
        </text>
      </g>
    ) : null}
  </g>
);

export const Marker: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly n: number;
  readonly pop?: number;
}> = ({ x, y, n, pop = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${pop})`}>
    <path d="M0 0 L18 -28 H-18 Z" fill={PAL.marker} />
    <text
      x={0}
      y={-30}
      textAnchor="middle"
      fill={PAL.ink}
      fontFamily="Playfair Display, serif"
      fontSize={16}
      fontWeight={700}
    >
      {n}
    </text>
  </g>
);

export const Bars: React.FC<{ readonly x?: number; readonly opacity?: number }> = ({
  x = 0,
  opacity = 1,
}) => (
  <g opacity={opacity} transform={`translate(${x} 0)`}>
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={-420 + i * 100} y={-520} width={14} height={980} rx={4} fill="#1a1c22" />
    ))}
  </g>
);

export const Clock: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly frame: number;
  readonly speed?: number;
}> = ({ x, y, frame, speed = 1 }) => {
  const a = frame * speed;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={46} fill="#f4efe6" />
      <circle r={40} fill="#1c1a18" />
      <circle r={34} fill="#f7f3ea" />
      <line
        x1={0}
        y1={0}
        x2={Math.sin((a / 40) * Math.PI) * 16}
        y2={-Math.cos((a / 40) * Math.PI) * 16}
        stroke="#1c1a18"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={0}
        y1={0}
        x2={Math.sin(a * 0.15) * 24}
        y2={-Math.cos(a * 0.15) * 24}
        stroke="#8d3a32"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle r={3} fill="#1c1a18" />
    </g>
  );
};

export const Shelves: React.FC<{ readonly x: number }> = ({ x }) => (
  <g transform={`translate(${x} 40)`}>
    {[0, 1, 2, 3].map((row) => (
      <g key={row}>
        <rect x={0} y={-360 + row * 90} width={280} height={8} fill="#6b5344" />
        {Array.from({ length: 5 }, (_, i) => (
          <rect
            key={i}
            x={16 + i * 52}
            y={-360 + row * 90 - 48}
            width={36}
            height={48}
            rx={3}
            fill={["#6e8a78", "#c45c3c", "#d8c39a", "#3c5168", "#8a5e38"][(i + row) % 5]}
          />
        ))}
      </g>
    ))}
  </g>
);

export const Cuffs: React.FC<{ readonly x: number; readonly y: number; readonly shut: number }> = ({
  x,
  y,
  shut,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={-16} cy={0} r={16} fill="none" stroke="#c8c2b4" strokeWidth={5} />
    <circle cx={16} cy={0} r={16} fill="none" stroke="#c8c2b4" strokeWidth={5} />
    <rect x={-6} y={-3} width={12} height={6} fill="#c8c2b4" />
    <path
      d={`M-16 ${-16 + shut * 10} A 16 16 0 0 1 -16 ${16 - shut * 10}`}
      stroke="#8d8a82"
      strokeWidth={5}
      fill="none"
      opacity={shut}
    />
  </g>
);

export const Blueprint: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-70} y={-48} width={140} height={96} fill="#1d3a4a" />
    <rect x={-56} y={-32} width={70} height={48} fill="none" stroke="#9fd0e0" strokeWidth={2} />
    <path d="M-40 -8 H20 M-10 -32 V16" stroke="#9fd0e0" strokeWidth={1.4} />
  </g>
);

export const Flashlight: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
  readonly length?: number;
}> = ({ x, y, rot = -20, length = 280 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <polygon
      points={`0,0 ${length},-46 ${length},46`}
      fill="#f6e7b8"
      opacity={0.18}
    />
    <rect x={-28} y={-8} width={36} height={16} rx={4} fill="#2a2c30" />
  </g>
);

export const Helix: React.FC<{ readonly x: number; readonly y: number; readonly frame: number }> = ({
  x,
  y,
  frame,
}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 16 }, (_, i) => {
      const yy = -150 + i * 20;
      const sway = Math.sin(frame * 0.08 + i * 0.6) * 36;
      return (
        <g key={i}>
          <line x1={-sway} y1={yy} x2={sway} y2={yy} stroke="#8aa0b0" strokeWidth={2} />
          <circle cx={-sway} cy={yy} r={5} fill="#d4b36a" />
          <circle cx={sway} cy={yy} r={5} fill="#c45c3c" />
        </g>
      );
    })}
  </g>
);

export const Skyline: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const blocks = [
    { x: -620, h: 220, w: 70 },
    { x: -520, h: 340, w: 90 },
    { x: -400, h: 180, w: 60 },
    { x: -300, h: 280, w: 110 },
    { x: -160, h: 160, w: 50 },
    { x: -80, h: 390, w: 80 },
    { x: 40, h: 240, w: 100 },
    { x: 170, h: 310, w: 70 },
    { x: 270, h: 190, w: 90 },
    { x: 390, h: 360, w: 80 },
    { x: 500, h: 150, w: 60 },
  ];
  return (
    <g>
      {blocks.map((b, i) => (
        <g key={b.x}>
          <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} fill={i % 2 ? "#1a2230" : "#243044"} />
          {Array.from({ length: Math.floor(b.h / 28) }, (_, r) =>
            Array.from({ length: 2 }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={b.x + 10 + c * 28}
                y={GROUND - b.h + 12 + r * 26}
                width={12}
                height={10}
                fill={PAL.window}
                opacity={hash(i * 20 + r * 3 + c) > 0.45 ? 0.35 + Math.sin(frame * 0.05 + r) * 0.1 : 0.05}
              />
            )),
          )}
        </g>
      ))}
    </g>
  );
};

/** Cross-section of a ranch house, from roof down into the crawl space. */
export const Cutaway: React.FC<{ readonly frame: number; readonly dig?: number }> = ({
  frame,
  dig = 0,
}) => {
  const sway = Math.sin(frame * 0.05) * 1;
  return (
    <g>
      <rect x={-900} y={-200} width={1800} height={520} fill="#2c2824" />
      <polygon points="-860,-200 0,-360 860,-200" fill={PAL.roof} />
      <rect x={-780} y={-40} width={240} height={160} fill={PAL.window} opacity={0.55} />
      <rect x={200} y={-20} width={180} height={120} fill="#5a4032" />
      <rect x={-900} y={300} width={1800} height={36} fill="#6b5344" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-860 + i * 150} y={336} width={18} height={70} fill="#4a3424" />
      ))}
      <g opacity={0.8}>
        <path
          d={`M-700 430 C-400 450, -200 ${440 + sway}, 200 460 S 700 440, 820 470`}
          stroke="#8a9098"
          strokeWidth={8}
          fill="none"
        />
        <path
          d="M-640 500 H 700"
          stroke="#6a7078"
          strokeWidth={6}
          fill="none"
        />
      </g>
      <rect x={-980} y={520} width={1960} height={700} fill={PAL.dirtDark} />
      <path d="M-900 560 Q0 620 900 540 V 900 H-900 Z" fill={PAL.dirt} />
      {Array.from({ length: 5 }, (_, i) => {
        const reveal = Math.max(0, Math.min(1, dig * 5 - i));
        return (
          <g key={i} opacity={reveal}>
            <rect
              x={-620 + i * 230}
              y={640}
              width={120}
              height={70 + reveal * 30}
              rx={8}
              fill="#1a120e"
            />
          </g>
        );
      })}
    </g>
  );
};

export const Mote: React.FC<{
  readonly frame: number;
  readonly n?: number;
  readonly color?: string;
}> = ({ frame, n = 14, color = "#f4efe6" }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = hash(i + 2) * 1600 - 800;
      const y = ((hash(i + 9) * 600 - 200 + frame * (0.3 + hash(i) * 0.4)) % 700) - 350;
      return (
        <circle
          key={i}
          cx={x + Math.sin(frame * 0.02 + i) * 12}
          cy={y}
          r={1.4 + hash(i + 4)}
          fill={color}
          opacity={0.25}
        />
      );
    })}
  </g>
);
