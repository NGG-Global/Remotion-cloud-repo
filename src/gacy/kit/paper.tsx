import React from "react";
import { darken, lit, type Light, NEUTRAL } from "../engine/color";
import { OffStage } from "../engine/camera";
import { hash } from "../engine/time";
import { TYPE } from "../theme";

/**
 * Paper: photographs, files, notebooks, maps, flyers, receipts. Most desk
 * shots in the film look straight down at a table, which the multiplane
 * camera treats as the character plane; hands and lamps hover on nearer
 * planes. Paper is drawn at insert scale (about 1 unit per millimetre), so
 * desk shots frame it with zooms of roughly 3–6.
 *
 * Text is fake (grey rules) except for the few words the story needs.
 */

export const BW: Light = { key: "#ffffff", ambient: "#6a6a6a", amb: 0.05, desat: 1 };
export const SEPIA: Light = { key: "#f0dcc0", ambient: "#5a4a3a", amb: 0.08, desat: 0.8 };

const Shadow: React.FC<{ w: number; h: number; blur?: number }> = ({ w, h, blur = 10 }) => (
  <rect x={-w / 2 + blur * 0.5} y={-h / 2 + blur * 0.8} width={w} height={h} rx={3} fill="#000" opacity={0.35} />
);

/** A print with a white border; `scene` is drawn inside (0,0 = top-left of the image). */
export const Photo: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly rot?: number;
  readonly scene?: React.ReactNode;
  readonly light?: Light;
  readonly border?: number;
  readonly id: string;
  readonly tone?: string;
  readonly faceDown?: boolean;
}> = ({ x, y, w = 180, h = 140, rot = 0, scene, light = NEUTRAL, border = 12, id, tone = "#8a8a88", faceDown = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Shadow w={w + border * 2} h={h + border * 2} />
    <rect x={-w / 2 - border} y={-h / 2 - border} width={w + border * 2} height={h + border * 2} rx={2} fill={lit(faceDown ? "#e2dccf" : "#f2eee4", light)} />
    {faceDown ? (
      <g>
        {Array.from({ length: 3 }, (_, i) => (
          <rect key={i} x={-w / 2} y={-h / 2 + 20 + i * 16} width={w * 0.5} height={3} fill={lit("#b8b0a0", light)} />
        ))}
      </g>
    ) : (
      <>
        <defs>
          <clipPath id={`ph-${id}`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} />
          </clipPath>
        </defs>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={lit(tone, light)} />
        <g clipPath={`url(#ph-${id})`}>
          <g transform={`translate(${-w / 2} ${-h / 2})`}>
            <OffStage>{scene}</OffStage>
          </g>
        </g>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#fff" opacity={0.05} />
      </>
    )}
  </g>
);

/** Fake typewritten lines. */
export const Lines: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly n: number;
  readonly gap?: number;
  readonly color?: string;
  readonly seed?: number;
  readonly thick?: number;
  readonly progress?: number;
}> = ({ x, y, w, n, gap = 14, color = "#8a8272", seed = 0, thick = 3, progress = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const lw = w * (0.55 + hash(seed + i * 3) * 0.45) * (i === n - 1 ? 0.6 : 1);
      const k = Math.max(0, Math.min(1, progress * n - i));
      return k > 0 ? <rect key={i} x={x} y={y + i * gap} width={lw * k} height={thick} rx={1} fill={color} /> : null;
    })}
  </g>
);

export const Sheet: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly rot?: number;
  readonly light?: Light;
  readonly lines?: number;
  readonly seed?: number;
  readonly color?: string;
  readonly children?: React.ReactNode;
}> = ({ x, y, w = 210, h = 290, rot = 0, light = NEUTRAL, lines = 14, seed = 0, color = "#f0ead8", children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Shadow w={w} h={h} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={lit(color, light)} />
    <Lines x={-w / 2 + 20} y={-h / 2 + 40} w={w - 50} n={lines} gap={(h - 70) / Math.max(1, lines)} color={lit("#9a9282", light)} seed={seed} />
    {children}
  </g>
);

export const Folder: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly rot?: number;
  readonly open?: number;
  readonly light?: Light;
  readonly tab?: string;
  readonly inside?: React.ReactNode;
  readonly color?: string;
}> = ({ x, y, w = 240, h = 310, rot = 0, open = 0, light = NEUTRAL, tab, inside, color = "#c8ae7a" }) => {
  const L = (c: string) => lit(c, light);
  const cover = Math.cos(open * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Shadow w={w * (open > 0.5 ? 2 : 1)} h={h} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={L(darken(color, 0.08))} />
      <g>{inside}</g>
      <g transform={`translate(${-w / 2} 0) scale(${cover} 1) translate(${w / 2} 0)`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={L(cover < 0 ? darken(color, 0.15) : color)} />
        <path d={`M${w / 2 - 90} ${-h / 2} L${w / 2 - 80} ${-h / 2 - 20} L${w / 2 - 10} ${-h / 2 - 20} L${w / 2} ${-h / 2} Z`} fill={L(color)} />
        {tab && cover > 0.2 ? (
          <text x={w / 2 - 45} y={-h / 2 - 5} textAnchor="middle" fontFamily={TYPE.serif} fontSize={13} fontWeight={600} fill={L("#3a2e1e")}>
            {tab}
          </text>
        ) : null}
      </g>
    </g>
  );
};

/** Rubber stamp. Rotated a little, ink slightly uneven. */
export const Stamp: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly rot?: number;
  readonly k?: number;
  readonly color?: string;
  readonly size?: number;
}> = ({ x, y, text, rot = -8, k = 1, color = "#a8322a", size = 30 }) => {
  if (k <= 0) {
    return null;
  }
  const w = text.length * size * 0.72 + 30;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${1 + (1 - Math.min(1, k)) * 0.4})`} opacity={Math.min(1, k) * 0.85}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.4} rx={4} fill="none" stroke={color} strokeWidth={4} />
      <text x={0} y={size * 0.28} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={700} fontSize={size} letterSpacing={3} fill={color}>
        {text}
      </text>
    </g>
  );
};

/** A word written by hand, revealed left to right. */
export const Handwrite: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly k: number;
  readonly size?: number;
  readonly color?: string;
  readonly id: string;
  readonly rtl?: boolean;
}> = ({ x, y, text, k, size = 34, color = "#1e2a44", id, rtl = false }) => {
  const w = text.length * size * 0.62;
  return (
    <g>
      <defs>
        <clipPath id={`hw-${id}`}>
          <rect x={rtl ? x + w - w * k : x} y={y - size} width={w * k} height={size * 1.5} />
        </clipPath>
      </defs>
      <text
        x={x}
        y={y}
        fontFamily={TYPE.serif}
        fontStyle="italic"
        fontWeight={500}
        fontSize={size}
        fill={color}
        clipPath={`url(#hw-${id})`}
      >
        {text}
      </text>
    </g>
  );
};

/** Ruled notebook, open flat. */
export const Notebook: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly light?: Light;
  readonly children?: React.ReactNode;
}> = ({ x, y, light = NEUTRAL, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y})`}>
      <Shadow w={330} h={420} />
      <rect x={-165} y={-210} width={330} height={420} rx={4} fill={L("#f4f0e2")} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={-150} y={-160 + i * 24} width={300} height={1.5} fill={L("#9ab4c8")} />
      ))}
      <rect x={-110} y={-210} width={2} height={420} fill={L("#d88a8a")} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={-165 + 4} cy={-190 + i * 46} r={8} fill={L("#3a3632")} />
      ))}
      {children}
    </g>
  );
};

export const Receipt: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
  readonly light?: Light;
  readonly s?: number;
}> = ({ x, y, rot = 0, light = NEUTRAL, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Shadow w={120} h={200} blur={6} />
      <path d="M-60 -100 L60 -100 L60 92 L50 100 L40 92 L30 100 L20 92 L10 100 L0 92 L-10 100 L-20 92 L-30 100 L-40 92 L-50 100 L-60 92 Z" fill={L("#f2eee2")} />
      <text x={0} y={-74} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={700} fontSize={13} fill={L("#3a3a3a")}>
        NISSON
      </text>
      <text x={0} y={-58} textAnchor="middle" fontFamily={TYPE.serif} fontSize={10} letterSpacing={1.5} fill={L("#3a3a3a")}>
        PHARMACY
      </text>
      <rect x={-44} y={-46} width={88} height={1.5} fill={L("#8a8a8a")} />
      <Lines x={-44} y={-34} w={88} n={6} gap={13} color={L("#8a8a8a")} seed={4} thick={2.5} />
      <rect x={-44} y={52} width={40} height={10} fill={L("#6a6a6a")} />
    </g>
  );
};

export const EvidenceBag: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
  readonly light?: Light;
  readonly children?: React.ReactNode;
}> = ({ x, y, rot = 0, light = NEUTRAL, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Shadow w={200} h={280} blur={8} />
      {children}
      <rect x={-100} y={-140} width={200} height={280} rx={6} fill={L("#e8eef0")} opacity={0.28} />
      <rect x={-100} y={-140} width={200} height={40} fill={L("#d8e0e4")} opacity={0.7} />
      <rect x={-100} y={-104} width={200} height={3} fill={L("#a8b0b4")} />
      <rect x={-86} y={100} width={172} height={30} fill={L("#f4eed8")} opacity={0.9} />
      <Lines x={-78} y={110} w={150} n={2} gap={9} color={L("#9a3a2a")} seed={8} thick={2} />
      <path d="M-96 -130 L-60 120" stroke="#fff" strokeWidth={8} opacity={0.12} />
    </g>
  );
};

/** Missing-person flyer: a blank photo box, a heading, rules. Never a real face. */
export const Flyer: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
  readonly light?: Light;
  readonly age?: number;
  readonly seed?: number;
  readonly s?: number;
}> = ({ x, y, rot = 0, light = NEUTRAL, age = 0, seed = 0, s = 1 }) => {
  const paper = darken("#f0ead8", age * 0.25);
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-80} y={-110} width={160} height={220} fill={L(paper)} />
      <text x={0} y={-80} textAnchor="middle" fontFamily={TYPE.serif} fontWeight={700} fontSize={26} letterSpacing={2} fill={L("#2a2622")}>
        MISSING
      </text>
      <rect x={-50} y={-66} width={100} height={96} fill={L(darken(paper, 0.35))} />
      <ellipse cx={0} cy={-26} rx={22} ry={26} fill={L(darken(paper, 0.55))} />
      <path d="M-40 30 Q0 -6 40 30 Z" fill={L(darken(paper, 0.55))} />
      <Lines x={-60} y={46} w={120} n={4} gap={14} color={L("#6a645a")} seed={seed} thick={3} />
      <circle cx={0} cy={-104} r={4} fill={L("#8a8a8a")} />
    </g>
  );
};

