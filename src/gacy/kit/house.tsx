import React from "react";
import { darken, lighten, lit, mix, type Light, NEUTRAL } from "../engine/color";
import { noise } from "../engine/time";
import { Glow, Pool } from "./light";

/**
 * A 1950s–60s suburban ranch house in elevation, built at world scale
 * (200 units per metre): about 14 m wide, floor 0.8 m above grade on a
 * block foundation with crawl-space vents, 2.5 m walls, a low hip roof.
 *
 * The same component is Gacy's house and every neighbour's; `style`
 * changes siding, brick, roof and trim so a street does not look cloned.
 */

export const FLOOR_Y = -160;
export const EAVE_Y = -660;

export type HouseStyle = {
  readonly siding: string;
  readonly brick: string;
  readonly roof: string;
  readonly trim: string;
  readonly door: string;
  readonly shutters?: string;
};

export const HOUSE_STYLES: readonly HouseStyle[] = [
  { siding: "#cfc7b6", brick: "#7a5446", roof: "#34302d", trim: "#ece6da", door: "#5a3a2c", shutters: "#3e4a44" },
  { siding: "#b8b9ab", brick: "#6d5a4e", roof: "#2e2c2a", trim: "#e6e2d6", door: "#3e4a5a" },
  { siding: "#d6c9a8", brick: "#83604c", roof: "#3a332e", trim: "#f0ebe0", door: "#6a4430", shutters: "#5a3a30" },
  { siding: "#a9b3b5", brick: "#6a4c42", roof: "#2c2e30", trim: "#e8e8e2", door: "#2e3a3e" },
  { siding: "#c8b89c", brick: "#6e4a3e", roof: "#3a3430", trim: "#ebe4d4", door: "#4a3228", shutters: "#2e3a34" },
];

/** Gacy's house. Deliberately the least remarkable one on the street. */
export const GACY_HOUSE: HouseStyle = {
  siding: "#cdc5b3",
  brick: "#735044",
  roof: "#322e2b",
  trim: "#ebe5d8",
  door: "#4e3a2e",
  shutters: "#48443c",
};

export type WindowBox = { x: number; y: number; w: number; h: number };

export const RanchHouse: React.FC<{
  readonly x: number;
  readonly w?: number;
  readonly style?: HouseStyle;
  readonly light?: Light;
  /** Interior light 0–1. */
  readonly lit?: number;
  readonly night?: boolean;
  readonly t?: number;
  readonly snow?: number;
  readonly garage?: "left" | "right" | "none";
  /** Blue flicker of a television in the picture window. */
  readonly tv?: boolean;
  readonly porchLight?: number;
  readonly id: string;
  /** Drawn inside the picture window (clipped). World coordinates. */
  readonly inside?: (win: WindowBox) => React.ReactNode;
  readonly vents?: boolean;
  /** 0 = solid facade, 1 = gone. Used when the house opens into a section. */
  readonly peel?: number;
  /** Front door swing, 0 shut, 1 open. */
  readonly doorOpen?: number;
}> = ({
  x,
  w = 2800,
  style = HOUSE_STYLES[0],
  light = NEUTRAL,
  lit: lightsOn = 0,
  night = false,
  t = 0,
  snow = 0,
  garage = "right",
  tv = false,
  porchLight = 0,
  id,
  inside,
  vents = true,
  peel = 0,
  doorOpen = 0,
}) => {
  const L = (c: string) => lit(c, light);
  const half = w / 2;
  const roofOver = 70;
  const ridge = -960;
  const gw = garage === "none" ? 0 : 1000;
  const gx = garage === "right" ? half : -half - gw;
  const picture: WindowBox = { x: -half + 260, y: -600, w: 640, h: 330 };
  const bedroomA: WindowBox = { x: half - 820, y: -560, w: 300, h: 260 };
  const bedroomB: WindowBox = { x: half - 440, y: -560, w: 300, h: 260 };
  const doorX = -half + 1050;
  const tvFlick = tv ? 0.5 + noise(t * 7, 3) * 0.3 + noise(t * 23, 5) * 0.2 : 0;
  const glass = (b: WindowBox, key: string, main = false) => {
    const warm = main ? lightsOn : lightsOn * 0.7;
    const dayGlass = L("#5e6f7c");
    const nightGlass = "#10151d";
    const cid = `${id}-${key}`;
    return (
      <g key={key}>
        <rect x={b.x - 16} y={b.y - 16} width={b.w + 32} height={b.h + 32} fill={L(style.trim)} />
        <defs>
          <clipPath id={cid}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} />
          </clipPath>
          <linearGradient id={`${cid}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6d28e" />
            <stop offset="1" stopColor="#d99a5a" />
          </linearGradient>
        </defs>
        <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={night ? nightGlass : dayGlass} />
        <g clipPath={`url(#${cid})`}>
          {warm > 0 ? (
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={`url(#${cid}-g)`} opacity={warm} />
          ) : null}
          {main && tv ? (
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#6f8fc8" opacity={tvFlick * 0.45 * Math.max(warm, 0.4)} style={{ mixBlendMode: "screen" }} />
          ) : null}
          {main && inside ? inside(b) : null}
          {!night ? (
            <path d={`M${b.x} ${b.y + b.h * 0.7} L${b.x + b.w * 0.35} ${b.y} L${b.x + b.w * 0.55} ${b.y} L${b.x + b.w * 0.1} ${b.y + b.h} L${b.x} ${b.y + b.h} Z`} fill="#ffffff" opacity={0.12} />
          ) : null}
          {/* curtains */}
          <path d={`M${b.x} ${b.y} L${b.x + b.w * 0.2} ${b.y} Q${b.x + b.w * 0.16} ${b.y + b.h * 0.5} ${b.x + b.w * 0.22} ${b.y + b.h} L${b.x} ${b.y + b.h} Z`} fill={warm > 0.2 ? mix("#c9a27a", "#f0c890", warm * 0.4) : L("#6a5a4a")} opacity={0.92} />
          <path d={`M${b.x + b.w} ${b.y} L${b.x + b.w * 0.8} ${b.y} Q${b.x + b.w * 0.84} ${b.y + b.h * 0.5} ${b.x + b.w * 0.78} ${b.y + b.h} L${b.x + b.w} ${b.y + b.h} Z`} fill={warm > 0.2 ? mix("#c9a27a", "#f0c890", warm * 0.4) : L("#6a5a4a")} opacity={0.92} />
        </g>
        {main ? (
          <path d={`M${b.x + b.w / 3} ${b.y} V${b.y + b.h} M${b.x + (b.w * 2) / 3} ${b.y} V${b.y + b.h}`} stroke={L(style.trim)} strokeWidth={10} />
        ) : (
          <path d={`M${b.x + b.w / 2} ${b.y} V${b.y + b.h} M${b.x} ${b.y + b.h / 2} H${b.x + b.w}`} stroke={L(style.trim)} strokeWidth={8} />
        )}
        {style.shutters && !main ? (
          <g fill={L(style.shutters)}>
            <rect x={b.x - 16 - 90} y={b.y - 16} width={80} height={b.h + 32} />
            <rect x={b.x + b.w + 26} y={b.y - 16} width={80} height={b.h + 32} />
          </g>
        ) : null}
        <rect x={b.x - 30} y={b.y + b.h + 16} width={b.w + 60} height={18} fill={L(darken(style.trim, 0.1))} />
        {warm > 0.05 && night ? (
          <Pool x={b.x + b.w / 2} y={b.y + b.h + 180} rx={b.w * 0.9} ry={160} color="#f2b870" opacity={0.32 * warm} />
        ) : null}
      </g>
    );
  };

  const facade = (
    <g>
      {/* garage */}
      {garage !== "none" ? (
        <g>
          <path d={`M${gx - (garage === "right" ? 0 : roofOver)} ${EAVE_Y + 80} L${gx + gw / 2} ${-880} L${gx + gw + (garage === "right" ? roofOver : 0)} ${EAVE_Y + 80} Z`} fill={L(style.roof)} />
          <rect x={gx} y={EAVE_Y + 80} width={gw} height={-(EAVE_Y + 80)} fill={L(darken(style.siding, 0.06))} />
          <rect x={gx + 110} y={-440} width={gw - 220} height={440} fill={L(lighten(style.trim, 0.02))} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={gx + 110} y={-440 + i * 110} width={gw - 220} height={6} fill={L(darken(style.trim, 0.14))} />
          ))}
          <rect x={gx} y={EAVE_Y + 80} width={gw} height={24} fill={L(darken(style.trim, 0.05))} />
        </g>
      ) : null}
      {/* roof */}
      <path d={`M${-half - roofOver} ${EAVE_Y} L${-half + 500} ${ridge} L${half - 500} ${ridge} L${half + roofOver} ${EAVE_Y} Z`} fill={L(style.roof)} />
      <path d={`M${-half - roofOver} ${EAVE_Y} L${-half + 500} ${ridge} L${-half + 560} ${ridge} L${-half + 40} ${EAVE_Y} Z`} fill={L(darken(style.roof, 0.25))} />
      {snow > 0 ? (
        <path d={`M${-half - roofOver + 20} ${EAVE_Y - 6} L${-half + 510} ${ridge + 4} L${half - 510} ${ridge + 4} L${half + roofOver - 20} ${EAVE_Y - 6} L${half + roofOver - 60} ${EAVE_Y - 40 * snow} L${half - 530} ${ridge + 50 * snow} L${-half + 530} ${ridge + 50 * snow} L${-half - roofOver + 60} ${EAVE_Y - 40 * snow} Z`} fill={L("#e6ebf0")} />
      ) : null}
      <rect x={half - 700} y={ridge - 170} width={150} height={260} fill={L(style.brick)} />
      <rect x={half - 716} y={ridge - 186} width={182} height={26} fill={L(darken(style.brick, 0.2))} />
      {/* walls */}
      <rect x={-half} y={EAVE_Y} width={w} height={FLOOR_Y - EAVE_Y} fill={L(style.siding)} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={-half} y={EAVE_Y + 24 + i * 30} width={w} height={3} fill={L(darken(style.siding, 0.12))} opacity={0.6} />
      ))}
      <rect x={-half} y={EAVE_Y} width={w} height={34} fill={L(darken(style.trim, 0.06))} />
      <rect x={-half} y={EAVE_Y + 34} width={w} height={40} fill="#000" opacity={0.18} />
      <rect x={-half} y={-330} width={w} height={170} fill={L(style.brick)} />
      {Array.from({ length: 6 }, (_, r) => (
        <rect key={r} x={-half} y={-330 + r * 28} width={w} height={2.5} fill={L(darken(style.brick, 0.3))} opacity={0.55} />
      ))}
      {/* windows */}
      {glass(picture, "pic", true)}
      {glass(bedroomA, "ba")}
      {glass(bedroomB, "bb")}
      {/* door + stoop */}
      <rect x={doorX - 110} y={-610} width={220} height={450} fill={L(style.trim)} />
      <rect x={doorX - 90} y={-590} width={180} height={430} fill={doorOpen > 0 ? (lightsOn > 0.3 ? "#6a4a30" : "#14100c") : L(style.door)} />
      {doorOpen > 0 && lightsOn > 0.3 ? <rect x={doorX - 90} y={-590} width={180} height={430} fill="#e8b878" opacity={0.5 * lightsOn} /> : null}
      <g transform={`translate(${doorX - 90} 0) scale(${Math.cos(doorOpen * 1.3)} 1) translate(${-(doorX - 90)} 0)`}>
        <rect x={doorX - 90} y={-590} width={180} height={430} fill={L(style.door)} />
        <rect x={doorX - 70} y={-560} width={140} height={150} fill={L(darken(style.door, 0.18))} />
        <rect x={doorX - 70} y={-380} width={140} height={190} fill={L(darken(style.door, 0.18))} />
        <circle cx={doorX + 62} cy={-370} r={8} fill={L("#c8a860")} />
      </g>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={doorX - 200 - i * 30} y={FLOOR_Y + i * 54} width={400 + i * 60} height={54} fill={L(i % 2 ? "#8e8a82" : "#9a968e")} />
      ))}
      <rect x={doorX + 150} y={-560} width={30} height={46} rx={6} fill={L("#3a342c")} />
      {porchLight > 0 ? (
        <>
          <circle cx={doorX + 165} cy={-532} r={11} fill="#ffe2a6" opacity={porchLight} />
          <Glow x={doorX + 165} y={-532} r={260} color="#f8cf8a" opacity={0.55 * porchLight} />
          <Pool x={doorX} y={-20} rx={520} ry={70} color="#f2c07a" opacity={0.35 * porchLight} />
        </>
      ) : null}
      {/* foundation + crawl-space vents */}
      <rect x={-half} y={FLOOR_Y} width={w} height={-FLOOR_Y} fill={L("#8a867e")} />
      <rect x={-half} y={FLOOR_Y} width={w} height={10} fill={L("#6e6a62")} />
      {vents
        ? [-half + 180, -half + 1500, half - 300].map((vx) => (
            <g key={vx}>
              <rect x={vx - 60} y={-110} width={120} height={60} fill={L("#1a1a1a")} />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={vx - 56} y={-104 + i * 14} width={112} height={5} fill={L("#6a665e")} />
              ))}
            </g>
          ))
        : null}
      <rect x={half - 40} y={EAVE_Y + 30} width={22} height={-EAVE_Y - 60} fill={L(darken(style.trim, 0.2))} />
    </g>
  );

  return (
    <g transform={`translate(${x} 0)`}>
      {peel < 1 ? <g opacity={1 - peel}>{facade}</g> : null}
    </g>
  );
};
