import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { Arrow } from "../components/Space";
import {
  At,
  Card,
  Disc,
  Emoji,
  Label,
  Pill,
  Strike,
  Verdict,
} from "../components/ui";
import { bob, clamp01, glide, lerp, pop, ramp, rand } from "../motion";
import { C, DISPLAY, MONO, PALETTE } from "../theme";

/** "Tool N · name" tag that opens each tool's scenes. */
const ToolBadge: React.FC<{
  readonly n: number;
  readonly name: string;
  readonly t: number;
  readonly fps: number;
  readonly y?: number;
}> = ({ n, name, t, fps, y = 60 }) => (
  <At x={540} y={y} scale={pop(t, 0.05, fps, 11)}>
    <div
      style={{
        display: "flex",
        direction: "rtl",
        alignItems: "center",
        gap: 0,
        borderRadius: 999,
        overflow: "hidden",
        boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          background: C.yellow,
          color: C.ink,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 40,
          padding: "10px 26px",
          whiteSpace: "nowrap",
        }}
      >
        כלי {n}
      </div>
      <div
        style={{
          background: C.card,
          color: C.cardInk,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 40,
          padding: "10px 30px",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  </At>
);

const TOOLS = [
  { e: "🌌", name: "מרחב וקטורי", c: C.sky },
  { e: "⚙️", name: "קידוד צ'רץ'", c: C.mint },
  { e: "🔗", name: "VSA", c: C.pink },
];

export const Toolbox: React.FC<{ readonly m: { readonly open: number } }> = ({
  m,
}) => {
  const { t, fps } = useScene();
  const box = pop(t, 0.1, fps, 9);
  // The cut follows the phrase closely, so the tools fan out fast.
  const go = Math.max(0.3, m.open - 0.4);
  return (
    <Stage>
      <At
        x={540}
        y={820}
        scale={box}
        rotate={bob(t, 0, 3, 5) * (t < go ? 1 : 0)}
      >
        <Emoji char="🧰" size={260} />
      </At>
      {TOOLS.map((tool, i) => {
        const p = glide(t, go + i * 0.18, go + 0.55 + i * 0.18);
        const a = Math.PI * (0.25 + 0.25 * i); // first tool on the right
        const x = lerp(540, 540 + Math.cos(a) * 340, p);
        const y = lerp(800, 760 - Math.sin(a) * 500, p);
        return (
          <At
            key={tool.name}
            x={x}
            y={y}
            scale={lerp(0.2, 1, p)}
            opacity={clamp01(p * 3)}
            rotate={(1 - p) * 40}
          >
            <Card width={290} pad={22} color={tool.c}>
              <Label size={34} color={C.ink}>
                כלי {i + 1}
              </Label>
              <Emoji char={tool.e} size={96} />
              <Label size={40} color={C.ink}>
                {tool.name}
              </Label>
            </Card>
          </At>
        );
      })}
    </Stage>
  );
};

/** A geometric grid in your head, with hundreds or thousands of axes. */
export const DimensionsScene: React.FC<{
  readonly m: {
    readonly scary: number;
    readonly grid: number;
    readonly head: number;
    readonly hundreds: number;
    readonly thousands: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const ox = 540;
  const oy = 600;
  const gridIn = ramp(t, m.grid, m.grid + 0.8);
  // number of axes on show: 2 -> 3 -> many
  const n =
    t < m.head
      ? 2
      : t < m.hundreds
        ? 3
        : Math.round(
            lerp(3, 26, ramp(t, m.hundreds, m.thousands)) +
              lerp(0, 34, ramp(t, m.thousands, m.thousands + 1.2)),
          );
  const count =
    t < m.head
      ? 2
      : t < m.hundreds
        ? 3
        : Math.round(
            lerp(3, 300, ramp(t, m.hundreds, m.thousands)) +
              lerp(0, 700, ramp(t, m.thousands, m.thousands + 1.0)),
          );
  const countText = count >= 1000 ? "1,000+" : count.toLocaleString("en-US");
  const scared = pop(t, m.scary, fps, 8) * (1 - ramp(t, m.grid, m.grid + 0.4));
  return (
    <Stage>
      <ToolBadge n={1} name="מרחב וקטורי רב-ממדי" t={t} fps={fps} />
      <At x={540} y={560} scale={scared}>
        <Emoji char="😱" size={260} />
      </At>
      <svg
        width={1080}
        height={1060}
        style={{ position: "absolute", opacity: gridIn }}
      >
        {Array.from({ length: 9 }, (_, i) => {
          const d = (i - 4) * 80;
          return (
            <g key={i}>
              <line
                x1={ox + d}
                y1={oy - 320}
                x2={ox + d}
                y2={oy + 320}
                stroke={C.grid}
                strokeWidth={3}
              />
              <line
                x1={ox - 320}
                y1={oy + d}
                x2={ox + 320}
                y2={oy + d}
                stroke={C.grid}
                strokeWidth={3}
              />
            </g>
          );
        })}
        {Array.from({ length: n }, (_, i) => {
          const base =
            i === 0
              ? 0
              : i === 1
                ? Math.PI / 2
                : i === 2
                  ? Math.PI * 0.78
                  : rand(i * 13) * Math.PI;
          const a = base + (i > 2 ? Math.sin(t * 0.5 + i) * 0.05 : 0);
          const len = i < 3 ? 380 : 240 + rand(i * 5) * 160;
          const grow =
            i < 2
              ? gridIn
              : i === 2
                ? ramp(t, m.head, m.head + 0.5)
                : ramp(
                    t,
                    m.hundreds + (i - 3) * 0.04,
                    m.hundreds + (i - 3) * 0.04 + 0.4,
                  );
          const col =
            i < 3 ? [C.sky, C.pink, C.mint][i] : PALETTE[i % PALETTE.length];
          return (
            <line
              key={i}
              x1={ox - Math.cos(a) * len * grow}
              y1={oy + Math.sin(a) * len * grow}
              x2={ox + Math.cos(a) * len * grow}
              y2={oy - Math.sin(a) * len * grow}
              stroke={col}
              strokeWidth={i < 3 ? 7 : 3}
              strokeLinecap="round"
              opacity={i < 3 ? 1 : 0.7}
            />
          );
        })}
        <circle cx={ox} cy={oy} r={12} fill={C.text} />
      </svg>
      <At x={170} y={210} scale={pop(t, m.head, fps, 10)}>
        <Emoji char="🧠" size={130} />
      </At>
      <At x={830} y={980} scale={pop(t, m.grid + 0.3, fps, 10)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "baseline",
            gap: 14,
            background: C.card,
            borderRadius: 24,
            padding: "10px 28px",
            boxShadow: "0 8px 0 rgba(0,0,0,0.25)",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: 64,
              color: C.cardInk,
              fontVariantNumeric: "tabular-nums",
              direction: "ltr",
              unicodeBidi: "isolate",
            }}
          >
            {countText}
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 44,
              color: C.cardInk,
            }}
          >
            ממדים
          </span>
        </div>
      </At>
    </Stage>
  );
};

const POINTS = [
  { e: "🐺", x: 690, y: 430, c: C.mint },
  { e: "🐱", x: 400, y: 380, c: C.mint },
  { e: "🌳", x: 210, y: 690, c: C.purple },
  { e: "🍎", x: 860, y: 820, c: C.orange },
  { e: "🚗", x: 170, y: 260, c: C.coral },
  { e: "⚽", x: 900, y: 230, c: C.sky },
];

/** Meaning is where a point sits relative to every other point. */
export const NeighborsScene: React.FC<{
  readonly m: {
    readonly isolated: number;
    readonly notAtAll: number;
    readonly distance: number;
    readonly closer: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const dog = { x: 560, y: 560 };
  const lines = ramp(t, m.distance + 0.3, m.distance + 1.3);
  const focus = ramp(t, m.closer, m.closer + 0.6);
  return (
    <Stage>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {POINTS.map((p, i) => {
          const isNear = p.e === "🐺";
          const isFar = p.e === "🚗";
          const dim = focus > 0 && !isNear && !isFar ? 1 - focus * 0.8 : 1;
          return (
            <line
              key={i}
              x1={dog.x}
              y1={dog.y}
              x2={lerp(dog.x, p.x, lines)}
              y2={lerp(dog.y, p.y, lines)}
              stroke={
                isNear && focus > 0
                  ? C.mint
                  : isFar && focus > 0
                    ? C.coral
                    : C.gridStrong
              }
              strokeWidth={isNear || isFar ? lerp(5, 12, focus) : 5}
              strokeDasharray={isFar && focus > 0 ? "18 16" : undefined}
              strokeLinecap="round"
              opacity={dim}
            />
          );
        })}
      </svg>
      {POINTS.map((p, i) => {
        const isKey = p.e === "🐺" || p.e === "🚗";
        return (
          <At
            key={p.e}
            x={p.x}
            y={p.y}
            scale={pop(t, m.distance + i * 0.1, fps, 10)}
            opacity={focus > 0 && !isKey ? 1 - focus * 0.6 : 1}
          >
            <Disc char={p.e} size={130} color={p.c} />
          </At>
        );
      })}
      <At x={dog.x} y={dog.y} scale={pop(t, 0.05, fps, 10)}>
        <Disc char="🐶" size={170} color={C.sky} ring />
      </At>
      <At
        x={dog.x}
        y={dog.y + 150}
        scale={pop(t, m.isolated, fps, 10)}
        opacity={1 - ramp(t, m.distance, m.distance + 0.3)}
      >
        <div style={{ position: "relative" }}>
          <Pill color={C.bgLift} ink={C.text} size={40}>
            נקודה מבודדת
          </Pill>
          <Strike
            progress={ramp(t, m.notAtAll, m.notAtAll + 0.3)}
            width={330}
            height={70}
          />
        </div>
      </At>
      <At x={540} y={70} scale={pop(t, m.distance, fps, 10)}>
        <Pill color={C.yellow} size={46}>
          המשמעות = המרחקים
        </Pill>
      </At>
      <At x={760} y={520} scale={pop(t, m.closer + 0.3, fps, 9)}>
        <Pill color={C.mint} size={36}>
          קרוב = קשור
        </Pill>
      </At>
      <At x={290} y={460} scale={pop(t, m.closer + 0.6, fps, 9)}>
        <Pill color={C.coral} size={36}>
          רחוק
        </Pill>
      </At>
    </Stage>
  );
};

/** Shepard: distance in the space maps onto perceived similarity. */
export const ShepardScene: React.FC<{
  readonly m: {
    readonly shepard: number;
    readonly map: number;
    readonly oneToOne: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const ox = 170;
  const oy = 860;
  const w = 760;
  const h = 520;
  const draw = ramp(t, m.map, m.map + 1.4);
  const curve = Array.from({ length: 60 }, (_, i) => {
    const u = (i / 59) * draw;
    return `${i === 0 ? "M" : "L"} ${ox + u * w} ${oy - Math.exp(-u * 3.2) * h}`;
  }).join(" ");
  const pairs = [
    { u: 0.12, e: "🐶🐺" },
    { u: 0.4, e: "🐶🐱" },
    { u: 0.85, e: "🐶🚗" },
  ];
  return (
    <Stage>
      <At x={540} y={80} scale={pop(t, m.shepard, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={48} emoji="🔬">
          רוג&apos;ר שפרד
        </Pill>
      </At>
      <svg
        width={1080}
        height={1060}
        style={{
          position: "absolute",
          opacity: ramp(t, m.map - 0.3, m.map + 0.2),
        }}
      >
        <line
          x1={ox}
          y1={oy}
          x2={ox + w + 20}
          y2={oy}
          stroke={C.axis}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <line
          x1={ox}
          y1={oy}
          x2={ox}
          y2={oy - h - 40}
          stroke={C.axis}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d={curve}
          stroke={C.yellow}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        {pairs.map((p, i) => {
          const show = ramp(
            t,
            m.oneToOne + i * 0.3,
            m.oneToOne + i * 0.3 + 0.3,
          );
          const x = ox + p.u * w;
          const y = oy - Math.exp(-p.u * 3.2) * h;
          return (
            <g key={i} opacity={show}>
              <line
                x1={x}
                y1={oy}
                x2={x}
                y2={y}
                stroke={C.textMuted}
                strokeWidth={3}
                strokeDasharray="8 10"
              />
              <line
                x1={ox}
                y1={y}
                x2={x}
                y2={y}
                stroke={C.textMuted}
                strokeWidth={3}
                strokeDasharray="8 10"
              />
              <circle cx={x} cy={y} r={14} fill={C.text} />
            </g>
          );
        })}
      </svg>
      {pairs.map((p, i) => {
        const x = ox + p.u * w;
        const y = oy - Math.exp(-p.u * 3.2) * h;
        return (
          <At
            key={i}
            x={x + 10}
            y={y - 70}
            scale={pop(t, m.oneToOne + i * 0.3, fps, 10)}
          >
            <div
              style={{
                background: C.bgLift,
                borderRadius: 20,
                padding: "6px 14px",
              }}
            >
              <Emoji char={p.e} size={58} />
            </div>
          </At>
        );
      })}
      <At x={ox + w / 2} y={oy + 60} opacity={ramp(t, m.map, m.map + 0.4)}>
        <Label size={40} color={C.textMuted}>
          מרחק במרחב
        </Label>
      </At>
      <At x={ox - 30} y={oy - h - 70} opacity={ramp(t, m.map, m.map + 0.4)}>
        <div style={{ transform: "translateX(40%)" }}>
          <Label size={40} color={C.textMuted}>
            דמיון נתפס
          </Label>
        </div>
      </At>
    </Stage>
  );
};

/** A star-shaped abstract symbol, drawn so it does not depend on a font. */
const SymbolStar: React.FC<{
  readonly size: number;
  readonly color: string;
}> = ({ size, color }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? size * 0.22 : size * 0.48;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${size / 2 + Math.cos(a) * r},${size / 2 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg width={size} height={size}>
      <polygon
        points={pts}
        fill={color}
        stroke={C.ink}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Church encoding: meaning from a symbol's role in the system, not a wire to the world. */
export const ChurchScene: React.FC<{
  readonly m: {
    readonly brilliant: number;
    readonly abstract: number;
    readonly physical: number;
    readonly role: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const cut = t >= m.physical + 0.6;
  const sag = ramp(t, m.physical + 0.6, m.physical + 1.2);
  const slide = glide(t, m.role, m.role + 0.8);
  const sym = { x: lerp(540, 300, slide), y: lerp(520, 640, slide) };
  const gear = (t - m.role) * 120;
  return (
    <Stage>
      <ToolBadge n={2} name="הקידוד של צ'רץ'" t={t} fps={fps} />
      <At x={880} y={200} scale={pop(t, m.brilliant, fps, 8)}>
        <Emoji char="💡" size={120} />
      </At>
      <At x={870} y={560} scale={pop(t, m.physical - 0.2, fps, 10)}>
        <Emoji char="🌍" size={170} />
      </At>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {t >= m.physical - 0.2 ? (
          cut ? (
            <g
              stroke="#9a8fd8"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            >
              <path
                d={`M ${sym.x + 70} ${sym.y} Q ${sym.x + 120} ${sym.y + 40 + sag * 120} ${sym.x + 140} ${sym.y + 40 + sag * 160}`}
              />
              <path
                d={`M 780 560 Q 740 ${600 + sag * 120} 720 ${620 + sag * 160}`}
              />
            </g>
          ) : (
            <line
              x1={sym.x + 70}
              y1={sym.y}
              x2={780}
              y2={560}
              stroke="#9a8fd8"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={ramp(t, m.physical - 0.2, m.physical + 0.1)}
            />
          )
        ) : null}
      </svg>
      {t >= m.physical && t < m.physical + 1.2 ? (
        <At x={680} y={530 + Math.sin(t * 20) * 6} rotate={-30}>
          <Emoji char="✂️" size={110} />
        </At>
      ) : null}
      {/* the system it plays a role in */}
      <At x={300} y={640} scale={pop(t, m.role - 0.1, fps, 10)}>
        <div
          style={{
            width: 420,
            height: 380,
            borderRadius: 40,
            background: C.bgLift,
            border: `6px solid ${C.mint}`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -40,
              top: -50,
              transform: `rotate(${gear}deg)`,
            }}
          >
            <Emoji char="⚙️" size={130} />
          </div>
          <div
            style={{
              position: "absolute",
              right: -30,
              bottom: -40,
              transform: `rotate(${-gear}deg)`,
            }}
          >
            <Emoji char="⚙️" size={100} />
          </div>
        </div>
      </At>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        <Arrow
          from={[40, 520]}
          to={[150, 600]}
          progress={ramp(t, m.role + 0.8, m.role + 1.2)}
          color={C.mint}
          width={10}
          head={30}
        />
        <Arrow
          from={[450, 600]}
          to={[560, 520]}
          progress={ramp(t, m.role + 1.0, m.role + 1.4)}
          color={C.mint}
          width={10}
          head={30}
        />
      </svg>
      <At
        x={sym.x}
        y={sym.y}
        scale={pop(t, m.abstract, fps, 9)}
        rotate={t * 30}
      >
        <SymbolStar size={150} color={C.yellow} />
      </At>
      <At x={540} y={980} scale={pop(t, m.role + 0.9, fps, 9)}>
        <Pill color={C.mint} size={48}>
          משמעות = תפקיד במערכת
        </Pill>
      </At>
    </Stage>
  );
};

const Tile: React.FC<{
  readonly text: string;
  readonly color: string;
  readonly size?: number;
}> = ({ text, color, size = 54 }) => (
  <div
    style={{
      background: color,
      borderRadius: 18,
      padding: "8px 20px",
      fontFamily: MONO,
      fontWeight: 800,
      fontSize: size,
      color: C.ink,
      boxShadow: "0 8px 0 rgba(0,0,0,0.25)",
      whiteSpace: "nowrap",
      direction: "ltr",
    }}
  >
    {text}
  </div>
);

/** A processor adds fractions without knowing what half an apple is. */
export const FractionScene: React.FC<{
  readonly m: {
    readonly apple: number;
    readonly integers: number;
    readonly rules: number;
    readonly fraction: number;
    readonly same: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const brain = t >= m.same;
  const swap = pop(t, m.same, fps, 9);
  const gear = (t - m.rules) * 140;
  const out = pop(t, m.rules + 0.9, fps, 10);
  return (
    <Stage>
      <At x={540} y={150} scale={brain ? swap : pop(t, 0.05, fps, 10)}>
        <Emoji char={brain ? "🧠" : "💻"} size={170} />
      </At>
      {/* thought: half an apple, crossed out */}
      <At
        x={820}
        y={130}
        scale={pop(t, m.apple, fps, 9)}
        opacity={1 - ramp(t, m.integers, m.integers + 0.4)}
      >
        <div
          style={{
            position: "relative",
            background: C.card,
            borderRadius: 60,
            padding: "14px 30px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Emoji char="🍎" size={90} />
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: 60,
              color: C.cardInk,
            }}
          >
            ½
          </span>
          <Strike
            progress={ramp(t, m.apple + 0.3, m.apple + 0.6)}
            width={240}
            height={120}
          />
        </div>
      </At>
      <At x={760} y={420} scale={pop(t, m.integers, fps, 10)}>
        <Tile text="(1, 2)" color={C.sky} />
      </At>
      <At x={760} y={560} scale={pop(t, m.integers + 0.25, fps, 10)}>
        <Tile text="(1, 4)" color={C.pink} />
      </At>
      <At x={470} y={490} scale={pop(t, m.rules, fps, 10)}>
        <div style={{ transform: `rotate(${gear}deg)` }}>
          <Emoji char="⚙️" size={150} />
        </div>
      </At>
      <At x={470} y={640} scale={pop(t, m.rules + 0.2, fps, 10)}>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 30,
            color: C.textMuted,
            direction: "ltr",
          }}
        >
          (a,b)+(c,d) = (ad+cb, bd)
        </div>
      </At>
      <At x={200} y={490} scale={out}>
        <Tile text="(3, 4)" color={C.mint} />
      </At>
      <At x={540} y={830} scale={pop(t, m.fraction, fps, 9)}>
        <div
          style={{
            background: C.card,
            borderRadius: 30,
            padding: "16px 40px",
            fontFamily: MONO,
            fontWeight: 800,
            fontSize: 88,
            color: C.cardInk,
            direction: "ltr",
            boxShadow: "0 10px 0 rgba(0,0,0,0.25)",
          }}
        >
          ½ + ¼ = ¾
        </div>
      </At>
      <At x={540} y={980} scale={pop(t, m.same + 0.3, fps, 9)}>
        <Pill color={C.yellow} size={44}>
          המשמעות נובעת מאיך שזה מתפקד
        </Pill>
      </At>
    </Stage>
  );
};

/** VSA: the bridge between the two camps, built from + and ×. */
export const VSABridge: React.FC<{
  readonly m: {
    readonly bridge: number;
    readonly math: number;
    readonly add: number;
    readonly mul: number;
    readonly lock: number;
    readonly binding: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const planks = 8;
  const fuse = glide(t, m.lock, m.lock + 0.8);
  return (
    <Stage>
      <ToolBadge n={3} name="ארכיטקטורות סמליות-וקטוריות" t={t} fps={fps} />
      <At x={540} y={150} scale={pop(t, 0.4, fps, 10)}>
        <Label size={64} color={C.yellow}>
          VSA
        </Label>
      </At>
      {/* cliffs */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 430,
          width: 230,
          height: 330,
          background: C.sky,
          borderRadius: "40px 0 0 0",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 430,
          width: 230,
          height: 330,
          background: C.pink,
          borderRadius: "0 40px 0 0",
          opacity: 0.9,
        }}
      />
      <At x={960} y={340} scale={pop(t, 0.2, fps, 10)}>
        <Emoji char="🖥️" size={120} />
      </At>
      <At x={120} y={340} scale={pop(t, 0.3, fps, 10)}>
        <Emoji char="🕸️" size={120} />
      </At>
      {Array.from({ length: planks }, (_, i) => {
        const p = pop(t, m.bridge + i * 0.09, fps, 12);
        const x = 830 - i * (620 / (planks - 1));
        const sagY = 450 + Math.sin((i / (planks - 1)) * Math.PI) * 40;
        return (
          <At
            key={i}
            x={x}
            y={sagY - (1 - p) * 80}
            opacity={clamp01(p * 2)}
            scale={p}
          >
            <div
              style={{
                width: 80,
                height: 40,
                borderRadius: 8,
                background: C.yellow,
                boxShadow: "0 6px 0 rgba(0,0,0,0.3)",
              }}
            />
          </At>
        );
      })}
      <At x={540} y={590} scale={pop(t, m.bridge + 0.8, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={40}>
          הגשר בין שני המחנות
        </Pill>
      </At>
      <At x={700} y={760} scale={pop(t, m.add, fps, 9)}>
        <Disc char="➕" size={140} color={C.mint} />
      </At>
      <At x={380} y={760} scale={pop(t, m.mul, fps, 9)}>
        <Disc char="✖️" size={140} color={C.orange} />
      </At>
      {/* two pieces of information snapping together */}
      <At
        x={lerp(700, 595, fuse)}
        y={930}
        scale={pop(t, m.lock - 0.2, fps, 10)}
      >
        <div
          style={{
            width: 210,
            height: 70,
            borderRadius: 16,
            background: C.sky,
          }}
        />
      </At>
      <At
        x={lerp(380, 485, fuse)}
        y={930}
        scale={pop(t, m.lock - 0.1, fps, 10)}
      >
        <div
          style={{
            width: 210,
            height: 70,
            borderRadius: 16,
            background: C.pink,
          }}
        />
      </At>
      <At x={540} y={930} scale={pop(t, m.lock + 0.8, fps, 8)}>
        <Emoji char="🔒" size={100} />
      </At>
      <At x={540} y={1030} scale={pop(t, m.binding, fps, 9)}>
        <Pill color={C.yellow} size={42}>
          קישור (Binding)
        </Pill>
      </At>
    </Stage>
  );
};

const N_CELLS = 12;
const bipolar = (seed: number): number[] =>
  Array.from({ length: N_CELLS }, (_, i) =>
    rand(seed * 101 + i * 7) > 0.5 ? 1 : -1,
  );
const GW = bipolar(3);
const VA = bipolar(11);
const BOUND = GW.map((v, i) => v * VA[i]);

const Bar: React.FC<{
  readonly v: readonly number[];
  readonly color: string;
  readonly reveal?: number;
}> = ({ v, color, reveal = 1 }) => (
  <div style={{ display: "flex", gap: 6, direction: "ltr" }}>
    {v.map((x, i) => {
      const on = clamp01(reveal * N_CELLS - i);
      return (
        <div
          key={i}
          style={{
            width: 46,
            height: 64,
            borderRadius: 8,
            background: x > 0 ? color : "#2e2a63",
            border: "3px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: MONO,
            fontWeight: 800,
            fontSize: 30,
            color: x > 0 ? C.ink : C.textMuted,
            opacity: on,
            transform: `scale(${0.6 + 0.4 * on})`,
          }}
        >
          {x > 0 ? "+" : "−"}
        </div>
      );
    })}
  </div>
);

/**
 * Binding George Washington to Virginia. Vectors are ±1 per dimension;
 * binding multiplies them dimension by dimension, and multiplying the result
 * by Virginia again gives back exactly Washington — so the original can be
 * pulled back out. This is the real arithmetic, not a stand-in.
 */
export const BindingScene: React.FC<{
  readonly m: {
    readonly gw: number;
    readonly va: number;
    readonly multiply: number;
    readonly newSym: number;
    readonly retrieve: number;
    readonly genius: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const rowLabel = (e: string, text: string, color: string) => (
    <div
      style={{
        display: "flex",
        direction: "rtl",
        alignItems: "center",
        gap: 12,
        width: 900,
      }}
    >
      <Emoji char={e} size={56} />
      <Label size={38} color={color}>
        {text}
      </Label>
    </div>
  );
  const unbind = ramp(t, m.retrieve + 0.3, m.retrieve + 1.3);
  return (
    <Stage>
      <At x={540} y={70} opacity={ramp(t, m.gw, m.gw + 0.4)}>
        {rowLabel("🎩", "ג'ורג' וושינגטון", C.sky)}
      </At>
      <At x={540} y={150} scale={pop(t, m.gw, fps, 12)}>
        <Bar v={GW} color={C.sky} reveal={ramp(t, m.gw, m.gw + 0.6)} />
      </At>
      <At x={540} y={240} scale={pop(t, m.va, fps, 12)}>
        <Label size={60}>×</Label>
      </At>
      <At x={540} y={320} opacity={ramp(t, m.va, m.va + 0.4)}>
        {rowLabel("🗺️", "וירג'יניה", C.orange)}
      </At>
      <At x={540} y={400} scale={pop(t, m.va, fps, 12)}>
        <Bar v={VA} color={C.orange} reveal={ramp(t, m.va, m.va + 0.6)} />
      </At>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 470,
          height: 6,
          borderRadius: 3,
          background: C.text,
          opacity: ramp(t, m.multiply, m.multiply + 0.3) * 0.6,
        }}
      />
      <At x={540} y={560} scale={pop(t, m.multiply, fps, 12)}>
        <Bar
          v={BOUND}
          color={C.purple}
          reveal={ramp(t, m.multiply + 0.2, m.multiply + 1.0)}
        />
      </At>
      <At x={540} y={650} scale={pop(t, m.newSym, fps, 10)}>
        <Pill color={C.purple} size={40} emoji="🔒">
          סמל חדש: וושינגטון × וירג'יניה
        </Pill>
      </At>
      {/* unbinding */}
      <At x={540} y={770} opacity={ramp(t, m.retrieve, m.retrieve + 0.3)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Emoji char="🔓" size={60} />
          <Label size={38}>סמל חדש × וירג'יניה =</Label>
        </div>
      </At>
      <At x={540} y={860} scale={pop(t, m.retrieve + 0.2, fps, 12)}>
        <Bar v={GW} color={C.sky} reveal={unbind} />
      </At>
      <At x={540} y={970} scale={pop(t, m.retrieve + 1.4, fps, 9)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 18,
          }}
        >
          <Verdict ok size={80} />
          <Label size={44}>חזרנו לוושינגטון</Label>
        </div>
      </At>
      <At x={930} y={970} scale={pop(t, m.genius, fps, 8)}>
        <Emoji char="🤯" size={120} />
      </At>
    </Stage>
  );
};
