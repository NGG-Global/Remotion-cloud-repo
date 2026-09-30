import React from "react";
import { lit, type Light, NEUTRAL } from "../../gacy/engine/color";
import { OffStage } from "../../gacy/engine/camera";
import { hash } from "../../gacy/engine/time";
import { Lines } from "../../gacy/kit/paper";
import { TYPE } from "../theme";

/**
 * Paper of the 1890s: a newspaper front page, a coroner's ledger, a deed,
 * a wall calendar, a notebook. Text is fake (grey rules) except for the
 * few words and numbers the story needs, which are set in the film's
 * serif so nothing depends on a font the machine may not have.
 *
 * Insert scale, like the Gacy paper: about a unit per millimetre.
 */

export { Lines };

const Shadow: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <rect x={-w / 2 + 6} y={-h / 2 + 9} width={w} height={h} rx={2} fill="#000" opacity={0.35} />
);

/**
 * A broadsheet front page. `headline` is set large; the rest is columns
 * of rules. `sketch` is drawn inside the engraving box.
 */
export const FrontPage: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly rot?: number;
  readonly light?: Light;
  readonly headline?: string;
  readonly masthead?: string;
  readonly sketch?: React.ReactNode;
  readonly seed?: number;
  readonly age?: number;
  readonly id: string;
}> = ({ x, y, w = 420, h = 600, rot = 0, light = NEUTRAL, headline, masthead, sketch, seed = 0, age = 0, id }) => {
  const L = (c: string) => lit(c, light);
  const paper = L(age > 0 ? "#d8c89a" : "#ece4cc");
  const ink = L("#2a241c");
  const cols = 5;
  const cw = (w - 40) / cols;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Shadow w={w} h={h} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={paper} />
      {age > 0 ? <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#7a5a2a" opacity={0.18 * age} /> : null}
      {/* masthead */}
      <text x={0} y={-h / 2 + 52} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={700} fontSize={40} fill={ink} letterSpacing={2}>
        {masthead ?? "THE DAILY GLOBE"}
      </text>
      <rect x={-w / 2 + 16} y={-h / 2 + 64} width={w - 32} height={3} fill={ink} />
      <rect x={-w / 2 + 16} y={-h / 2 + 70} width={w - 32} height={1.5} fill={ink} />
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={-w / 2 + 20 + i * ((w - 40) / 3)} y={-h / 2 + 80} width={(w - 40) / 3 - 24} height={3} fill={L("#8a8272")} />
      ))}
      {headline ? (
        <g>
          {headline.split("\n").map((line, i) => (
            <text key={i} x={0} y={-h / 2 + 130 + i * 40} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={800} fontSize={34} fill={ink}>
              {line}
            </text>
          ))}
        </g>
      ) : null}
      {/* engraving box */}
      {sketch ? (
        <g>
          <defs>
            <clipPath id={`fp-${id}`}>
              <rect x={-w / 2 + 20} y={-h / 2 + 210} width={cw * 2 - 8} height={200} />
            </clipPath>
          </defs>
          <rect x={-w / 2 + 20} y={-h / 2 + 210} width={cw * 2 - 8} height={200} fill={L("#d8cfb6")} stroke={ink} strokeWidth={2} />
          <g clipPath={`url(#fp-${id})`}>
            <g transform={`translate(${-w / 2 + 20} ${-h / 2 + 210})`}>
              <OffStage>{sketch}</OffStage>
            </g>
          </g>
        </g>
      ) : null}
      {Array.from({ length: cols }, (_, c) => {
        const top = sketch && c < 2 ? -h / 2 + 424 : -h / 2 + 210;
        return (
          <g key={c}>
            <Lines x={-w / 2 + 20 + c * cw} y={top} w={cw - 12} n={Math.floor((h / 2 - 20 - top) / 12)} gap={12} thick={2.4} color={L("#7a7262")} seed={seed + c * 17} />
            {c > 0 ? <rect x={-w / 2 + 20 + c * cw - 6} y={-h / 2 + 200} width={1} height={h - 220} fill={L("#a09880")} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/** A bound ledger open at a page of handwritten entries; `entries` are typed on. */
export const Ledger: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly light?: Light;
  readonly rot?: number;
  readonly lines?: number;
  readonly entries?: readonly { readonly y: number; readonly text: string; readonly k: number; readonly big?: boolean }[];
  readonly seed?: number;
}> = ({ x, y, light = NEUTRAL, rot = 0, lines = 12, entries = [], seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  const w = 520;
  const h = 360;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Shadow w={w + 20} h={h + 16} />
      <rect x={-w / 2 - 10} y={-h / 2 - 8} width={w + 20} height={h + 16} rx={4} fill={L("#3a2a20")} />
      <rect x={-w / 2} y={-h / 2} width={w / 2 - 2} height={h} fill={L("#ece2c8")} />
      <rect x={2} y={-h / 2} width={w / 2 - 2} height={h} fill={L("#efe6ce")} />
      <rect x={-2} y={-h / 2} width={4} height={h} fill={L("#8a7a5a")} />
      {[-w / 2, 2].map((px) =>
        Array.from({ length: lines }, (_, i) => (
          <rect key={`${px}-${i}`} x={px + 14} y={-h / 2 + 34 + i * ((h - 50) / lines)} width={w / 2 - 30} height={1.2} fill={L("#a8b8c8")} opacity={0.8} />
        )),
      )}
      <rect x={-w / 2 + 60} y={-h / 2} width={1.5} height={h} fill={L("#c88a8a")} opacity={0.7} />
      <rect x={62} y={-h / 2} width={1.5} height={h} fill={L("#c88a8a")} opacity={0.7} />
      <Lines x={-w / 2 + 70} y={-h / 2 + 26} w={w / 2 - 100} n={lines} gap={(h - 50) / lines} thick={2} color={L("#6a6a80")} seed={seed} />
      {entries.map((e, i) => (
        <text
          key={i}
          x={72}
          y={e.y}
          fontFamily={`${TYPE.serif}, serif`}
          fontStyle="italic"
          fontWeight={500}
          fontSize={e.big ? 46 : 22}
          fill={L("#2a2a48")}
          opacity={Math.min(1, e.k)}
        >
          {e.text.slice(0, Math.ceil(e.text.length * Math.min(1, e.k)))}
        </text>
      ))}
    </g>
  );
};

/** A property deed with a seal and a ribbon. */
export const Deed: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
  readonly light?: Light;
  readonly signed?: number;
  readonly seed?: number;
}> = ({ x, y, rot = 0, light = NEUTRAL, signed = 1, seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  const w = 260;
  const h = 340;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Shadow w={w} h={h} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#efe6cf")} />
      <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} fill="none" stroke={L("#8a7a5a")} strokeWidth={2} />
      <text x={0} y={-h / 2 + 52} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={700} fontSize={22} fill={L("#3a2e1c")} letterSpacing={3}>
        DEED
      </text>
      <Lines x={-w / 2 + 30} y={-h / 2 + 80} w={w - 60} n={11} gap={16} thick={2.2} color={L("#8a8272")} seed={seed} />
      {signed > 0 ? (
        <g opacity={signed}>
          <circle cx={w / 2 - 50} cy={h / 2 - 54} r={24} fill={L("#a8342a")} />
          <circle cx={w / 2 - 50} cy={h / 2 - 54} r={16} fill="none" stroke={L("#7a2018")} strokeWidth={2} />
          <path d={`M${w / 2 - 60} ${h / 2 - 36} L${w / 2 - 74} ${h / 2 - 8} M${w / 2 - 40} ${h / 2 - 36} L${w / 2 - 30} ${h / 2 - 8}`} stroke={L("#a8342a")} strokeWidth={6} />
          <path d={`M${-w / 2 + 34} ${h / 2 - 44} Q${-w / 2 + 60} ${h / 2 - 70} ${-w / 2 + 80} ${h / 2 - 48} Q${-w / 2 + 100} ${h / 2 - 30} ${-w / 2 + 130} ${h / 2 - 52}`} stroke={L("#2a2a48")} strokeWidth={2.5} fill="none" />
        </g>
      ) : null}
    </g>
  );
};

/** August 1892 wall calendar. `ring` circles the 4th; `strike` crosses days off. */
export const WallCalendar: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly light?: Light;
  readonly ring?: number;
  readonly s?: number;
  readonly month?: string;
  readonly year?: string;
  readonly ringDay?: number;
}> = ({ x, y, light = NEUTRAL, ring = 0, s = 1, month = "AUGUST", year = "1892", ringDay = 4 }) => {
  const L = (c: string) => lit(c, light);
  const w = 220;
  const h = 300;
  // August 1892 began on a Monday.
  const first = 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Shadow w={w} h={h} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#efe8d4")} />
      <rect x={-w / 2} y={-h / 2} width={w} height={70} fill={L("#7a2a22")} />
      <text x={0} y={-h / 2 + 32} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={700} fontSize={20} fill={L("#f0e0c0")} letterSpacing={3}>
        {month}
      </text>
      <text x={0} y={-h / 2 + 58} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={500} fontSize={18} fill={L("#f0e0c0")} letterSpacing={2}>
        {year}
      </text>
      {Array.from({ length: 31 }, (_, i) => {
        const d = i + first;
        const col = d % 7;
        const row = Math.floor(d / 7);
        const cx = -w / 2 + 18 + col * 27;
        const cy = -h / 2 + 100 + row * 38;
        return (
          <g key={i}>
            <text x={cx} y={cy} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontSize={14} fill={L("#3a3028")}>
              {i + 1}
            </text>
            {i + 1 === ringDay && ring > 0 ? (
              <ellipse cx={cx} cy={cy - 5} rx={13 * Math.min(1, ring)} ry={11 * Math.min(1, ring)} fill="none" stroke={L("#a8342a")} strokeWidth={2.5} strokeDasharray={`${76 * Math.min(1, ring)} 80`} />
            ) : null}
          </g>
        );
      })}
      <circle cx={0} cy={-h / 2 - 8} r={6} fill={L("#3a3a3a")} />
    </g>
  );
};

/** A police notebook page; `lines` typed on and crossed out. */
export const NotePad: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly light?: Light;
  readonly rot?: number;
  readonly items?: readonly { readonly text: string; readonly k: number; readonly struck?: number }[];
  readonly seed?: number;
}> = ({ x, y, light = NEUTRAL, rot = 0, items = [], seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  const w = 220;
  const h = 300;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Shadow w={w} h={h} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#ece6d2")} />
      <rect x={-w / 2} y={-h / 2} width={w} height={24} fill={L("#2a2a2a")} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={-w / 2 + 14} y={-h / 2 + 50 + i * 24} width={w - 28} height={1} fill={L("#a8b8c8")} />
      ))}
      <Lines x={-w / 2 + 18} y={-h / 2 + 40} w={w - 40} n={3} gap={24} thick={2} color={L("#6a6a80")} seed={seed} />
      {items.map((it, i) => {
        const y0 = -h / 2 + 118 + i * 30;
        const shown = it.text.slice(0, Math.ceil(it.text.length * Math.min(1, Math.max(0, it.k))));
        return (
          <g key={i} opacity={it.k > 0 ? 1 : 0}>
            <text x={-w / 2 + 20} y={y0} fontFamily={`${TYPE.serif}, serif`} fontStyle="italic" fontSize={19} fill={L("#2a2a48")}>
              {shown}
            </text>
            {it.struck && it.struck > 0 ? <rect x={-w / 2 + 18} y={y0 - 7} width={(w - 50) * Math.min(1, it.struck)} height={2.5} fill={L("#8a2a22")} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/** A balance scale; `tilt` -1..1, pans hold whatever the caller draws. */
export const Scale: React.FC<{
  readonly x: number;
  readonly y?: number;
  readonly tilt?: number;
  readonly light?: Light;
  readonly left?: React.ReactNode;
  readonly right?: React.ReactNode;
  readonly s?: number;
}> = ({ x, y = 0, tilt = 0, light = NEUTRAL, left, right, s = 1 }) => {
  const L = (c: string) => lit(c, light);
  const a = tilt * 12;
  const arm = 260;
  const rad = (a * Math.PI) / 180;
  const lx = -Math.cos(rad) * arm;
  const ly = -300 + Math.sin(rad) * arm * -1;
  const rx = Math.cos(rad) * arm;
  const ry = -300 + Math.sin(rad) * arm;
  const pan = (px: number, py: number, kids: React.ReactNode) => (
    <g>
      <path d={`M${px} ${py} L${px - 60} ${py + 120} M${px} ${py} L${px + 60} ${py + 120}`} stroke={L("#8a7a4a")} strokeWidth={3} />
      <path d={`M${px - 80} ${py + 120} Q${px} ${py + 150} ${px + 80} ${py + 120} Z`} fill={L("#b89a5a")} />
      <g transform={`translate(${px} ${py + 118})`}>{kids}</g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={120} ry={10} fill="#000" opacity={0.3} />
      <path d="M-100 0 L100 0 L70 -24 L-70 -24 Z" fill={L("#4a3a2a")} />
      <rect x={-10} y={-300} width={20} height={280} fill={L("#8a7a4a")} />
      <g transform={`rotate(${a} 0 -300)`}>
        <rect x={-arm} y={-306} width={arm * 2} height={10} rx={4} fill={L("#a08a52")} />
        <path d="M-20 -300 L0 -340 L20 -300 Z" fill={L("#a08a52")} />
      </g>
      {pan(lx, ly, left)}
      {pan(rx, ry, right)}
    </g>
  );
};

/** A stylised map of the contiguous United States, screen-ish scale. */
const US_PATH =
  "M40 120 L120 60 L200 40 L300 30 L420 40 L520 60 L600 80 L640 70 L700 60 L760 40 L820 20 L880 40 L900 80 L880 120 L900 160 L880 200 L840 240 L800 260 L790 300 L760 340 L720 360 L690 340 L640 330 L600 350 L580 380 L560 360 L520 340 L460 350 L400 330 L340 340 L300 360 L280 400 L240 380 L200 340 L180 300 L140 280 L100 260 L60 200 L40 160 Z";

export const USMap: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly light?: Light;
  readonly children?: React.ReactNode;
}> = ({ x, y, s = 1, light = NEUTRAL, children }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={US_PATH} fill={L("#d8ccaa")} stroke={L("#7a6a4a")} strokeWidth={3} />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M${60 + i * 60} 40 L${60 + i * 60} 400`} stroke={L("#7a6a4a")} strokeWidth={0.6} opacity={0.35} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M20 ${40 + i * 55} L920 ${40 + i * 55}`} stroke={L("#7a6a4a")} strokeWidth={0.6} opacity={0.35} />
      ))}
      {children}
    </g>
  );
};

/** Where Fall River sits on that map. */
export const FALL_RIVER = { x: 872, y: 116 } as const;

/** Small newspaper for the map: a rectangle with a headline rule. */
export const Clipping: React.FC<{ readonly x: number; readonly y: number; readonly k: number; readonly light?: Light; readonly seed?: number; readonly rot?: number }> = ({ x, y, k, light = NEUTRAL, seed = 0, rot = 0 }) => {
  if (k <= 0) {
    return null;
  }
  const L = (c: string) => lit(c, light);
  const sc = 0.6 + 0.4 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, k)}>
      <rect x={-30} y={-22} width={60} height={44} fill={L("#ece4cc")} stroke={L("#3a3028")} strokeWidth={1} />
      <rect x={-24} y={-14} width={48} height={5} fill={L("#2a241c")} />
      <Lines x={-24} y={-4} w={48} n={4} gap={5} thick={1.5} color={L("#8a8272")} seed={seed} />
    </g>
  );
};

/** A cheap illustrated cover: a shadowed brute with a blade. */
export const PennyDreadful: React.FC<{ readonly x: number; readonly y: number; readonly light?: Light; readonly s?: number; readonly children?: React.ReactNode; readonly id: string }> = ({ x, y, light = NEUTRAL, s = 1, children, id }) => {
  const L = (c: string) => lit(c, light);
  const w = 300;
  const h = 440;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Shadow w={w} h={h} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={L("#e2d2a8")} />
      <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} fill="none" stroke={L("#8a2a22")} strokeWidth={4} />
      <text x={0} y={-h / 2 + 60} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={800} fontSize={34} fill={L("#8a2a22")} letterSpacing={2}>
        TERRIBLE
      </text>
      <text x={0} y={-h / 2 + 96} textAnchor="middle" fontFamily={`${TYPE.latin}, serif`} fontWeight={800} fontSize={30} fill={L("#3a2a1c")} letterSpacing={2}>
        CRIMES
      </text>
      <defs>
        <clipPath id={`pd-${id}`}>
          <rect x={-w / 2 + 24} y={-h / 2 + 116} width={w - 48} height={h - 150} />
        </clipPath>
      </defs>
      <rect x={-w / 2 + 24} y={-h / 2 + 116} width={w - 48} height={h - 150} fill={L("#c8b890")} />
      <g clipPath={`url(#pd-${id})`}>
        <OffStage>{children}</OffStage>
      </g>
    </g>
  );
};

/** A stack of newspapers, seen from the side, with a tilted top copy. */
export const PaperStack: React.FC<{ readonly x: number; readonly n: number; readonly light?: Light; readonly seed?: number }> = ({ x, n, light = NEUTRAL, seed = 0 }) => {
  const L = (c: string) => lit(c, light);
  return (
    <g transform={`translate(${x} 0)`}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={-120 + (hash(seed + i) - 0.5) * 16} y={-8 - i * 7} width={240} height={7} fill={L(i % 2 ? "#e4dcc4" : "#d8d0b8")} />
      ))}
    </g>
  );
};
