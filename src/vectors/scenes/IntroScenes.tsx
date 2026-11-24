import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { Arrow } from "../components/Space";
import { At, Card, Disc, Emoji, Label, Pill } from "../components/ui";
import { bob, clamp01, glide, lerp, pop, ramp, rand } from "../motion";
import { C, PALETTE } from "../theme";

/** "Let's dive straight in" — a diver drops into the paper with a splash. */
export const PaperScene: React.FC<{
  readonly m: { readonly paper: number };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const card = pop(t, 0.1, fps, 12);
  const dive = glide(t, 0.25, 1.0);
  const splash = clamp01((t - 1.0) / 0.8);
  const stamp = pop(t, m.paper, fps, 8);
  return (
    <Stage>
      <At x={540} y={560} scale={card} rotate={-3}>
        <div
          style={{
            width: 600,
            height: 760,
            borderRadius: 34,
            background: C.card,
            boxShadow: "0 24px 0 rgba(0,0,0,0.3)",
            padding: 50,
            boxSizing: "border-box",
            direction: "rtl",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Emoji char="📄" size={70} />
            <Label size={58} color={C.cardInk}>
              מאמר
            </Label>
          </div>
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 22,
                borderRadius: 11,
                marginTop: i === 0 ? 40 : 26,
                width: `${[100, 92, 96, 70, 100, 88, 94, 60, 80][i]}%`,
                background: i % 4 === 3 ? "#d9d4f5" : "#ece9fb",
              }}
            />
          ))}
        </div>
      </At>
      {splash > 0 && splash < 1
        ? [0, 1, 2].map((k) => {
            const r = clamp01(splash * 1.4 - k * 0.2);
            return (
              <At key={k} x={540} y={380} opacity={(1 - r) * 0.9}>
                <div
                  style={{
                    width: 160 + r * 520,
                    height: (160 + r * 520) * 0.35,
                    borderRadius: "50%",
                    border: `8px solid ${C.sky}`,
                  }}
                />
              </At>
            );
          })
        : null}
      <At
        x={540 + bob(t, 1, 10)}
        y={lerp(-120, 380, dive)}
        rotate={lerp(-20, 160, dive)}
        opacity={1 - clamp01((t - 0.95) / 0.12)}
      >
        <Emoji char="🤿" size={150} />
      </At>
      <At x={790} y={210} scale={stamp} rotate={14}>
        <Pill color={C.yellow} size={52} emoji="✨">
          מרתק!
        </Pill>
      </At>
    </Stage>
  );
};

const DECADES = [
  { year: "1950", e: "🧠" },
  { year: "1970", e: "📚" },
  { year: "1980", e: "🔬" },
  { year: "1990", e: "🧪" },
  { year: "2000", e: "🧩" },
  { year: "2010", e: "💡" },
];

/** Decades of separate research orbiting, then pulled into one. */
export const MergeScene: React.FC<{
  readonly m: {
    readonly ambitious: number;
    readonly decades: number;
    readonly unify: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const rocket = clamp01((t - m.ambitious) / 1.4);
  const pull = glide(t, m.unify, m.unify + 0.9);
  const merged = pop(t, m.unify + 0.75, fps, 9);
  return (
    <Stage>
      {DECADES.map((d, i) => {
        // In orbit from the first frame; a pulse when "decades" is spoken.
        const appear = pop(t, 0.15 + i * 0.1, fps, 12);
        const pulse =
          1 +
          0.12 *
            Math.sin(
              Math.PI *
                Math.min(1, Math.max(0, (t - m.decades - i * 0.08) / 0.3)),
            );
        const angle = (i / DECADES.length) * Math.PI * 2 + t * 0.35;
        const r = lerp(330, 0, pull);
        const x = 540 + Math.cos(angle) * r;
        const y = 520 + Math.sin(angle) * r * 0.9;
        return (
          <At
            key={d.year}
            x={x}
            y={y}
            scale={appear * pulse * lerp(1, 0.3, pull)}
            opacity={1 - clamp01((pull - 0.85) / 0.15)}
          >
            <Card width={210} pad={18} color={PALETTE[i % PALETTE.length]}>
              <Emoji char={d.e} size={74} />
              <Label size={40} color={C.ink}>
                {d.year}
              </Label>
            </Card>
          </At>
        );
      })}
      <At x={540} y={520} scale={merged}>
        <Card width={420} pad={34} color={C.card} border={C.yellow}>
          <Emoji char="💡" size={130} />
          <Label size={52} color={C.cardInk}>
            תמונה אחת
          </Label>
        </Card>
      </At>
      {rocket > 0 && rocket < 1 ? (
        <At
          x={lerp(1000, 80, rocket)}
          y={lerp(980, 60, rocket)}
          rotate={-45 - 90}
        >
          <Emoji char="🚀" size={130} />
        </At>
      ) : null}
      <At x={540} y={70} opacity={ramp(t, m.decades, m.decades + 0.4)}>
        <Label size={54} color={C.textMuted}>
          עשורים של מחקר
        </Label>
      </At>
    </Stage>
  );
};

const CONCEPTS = [
  { e: "🐶", label: "כלב", color: C.sky, tip: [840, 430] as const },
  { e: "❤️", label: "אהבה", color: C.pink, tip: [560, 300] as const },
  { e: "⚡", label: "סיבה", color: C.yellow, tip: [250, 470] as const },
];

/** Dog, love, cause — each one turns out to be an arrow in a space. */
export const ConceptsToVectors: React.FC<{
  readonly m: {
    readonly dog: number;
    readonly love: number;
    readonly cause: number;
    readonly vectors: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const marks = [m.dog, m.love, m.cause];
  const move = glide(t, m.vectors - 0.2, m.vectors + 0.6);
  const origin = [540, 930] as const;
  const fan = ramp(t, m.vectors + 0.4, m.vectors + 1.6);
  return (
    <Stage>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {Array.from({ length: 22 }, (_, i) => {
          const a = Math.PI * (0.06 + 0.88 * (i / 21));
          const len = 260 + rand(i) * 260;
          return (
            <line
              key={i}
              x1={origin[0]}
              y1={origin[1]}
              x2={origin[0] + Math.cos(a) * len * fan}
              y2={origin[1] - Math.sin(a) * len * fan}
              stroke={C.gridStrong}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
        {CONCEPTS.map((c, i) => {
          // Stop the arrow at the disc's rim so the head stays visible.
          const dx = c.tip[0] - origin[0];
          const dy = c.tip[1] - origin[1];
          const len = Math.hypot(dx, dy);
          const rim = 210 * 0.72 * 0.5 + 8;
          const end = [
            c.tip[0] - (dx / len) * rim,
            c.tip[1] - (dy / len) * rim,
          ] as const;
          return (
            <Arrow
              key={c.label}
              from={origin}
              to={end}
              progress={ramp(
                t,
                m.vectors + i * 0.15,
                m.vectors + 0.7 + i * 0.15,
              )}
              color={c.color}
              width={14}
              head={44}
            />
          );
        })}
        <circle cx={origin[0]} cy={origin[1]} r={14 * move} fill={C.text} />
      </svg>
      {CONCEPTS.map((c, i) => {
        const p = pop(t, marks[i], fps, 10);
        const rowX = [820, 540, 260][i];
        const x = lerp(rowX, c.tip[0], move);
        const y = lerp(560, c.tip[1], move) + bob(t, i, 6);
        return (
          <React.Fragment key={c.label}>
            <At x={x} y={y} scale={p * lerp(1, 0.72, move)}>
              <Disc char={c.e} size={210} color={c.color} />
            </At>
            <At
              x={x}
              y={y + lerp(150, -120, move)}
              scale={p * lerp(1, 0.85, move)}
            >
              <Label size={56}>{c.label}</Label>
            </At>
          </React.Fragment>
        );
      })}
      <At x={540} y={80} scale={pop(t, m.vectors + 0.5, fps, 10)}>
        <Pill color={C.yellow} size={62}>
          מושג = וקטור
        </Pill>
      </At>
    </Stage>
  );
};

const KNOWLEDGE = [
  "🐶",
  "🍎",
  "🚗",
  "🌳",
  "🎸",
  "⚽",
  "📚",
  "🌧️",
  "🐱",
  "🍕",
  "✈️",
  "🎨",
  "⏰",
  "🌍",
  "🔑",
  "🎈",
];

/** Infinite knowledge swirling around a brain, then shelved in order. */
export const BrainSorting: React.FC<{
  readonly m: { readonly organize: number; readonly right: number };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const order = glide(t, m.organize, m.organize + 1.3);
  const brain = pop(t, 0.05, fps, 10);
  const pin = pop(t, m.right, fps, 8);
  return (
    <Stage>
      <At x={540} y={250 + bob(t, 0, 8)} scale={brain}>
        <Emoji char="🧠" size={230} />
      </At>
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          style={{
            position: "absolute",
            left: 150,
            width: 780,
            top: 560 + row * 125 + 58,
            height: 10,
            borderRadius: 5,
            background: C.bgLift,
            opacity: order,
          }}
        />
      ))}
      {KNOWLEDGE.map((e, i) => {
        const a =
          rand(i * 5) * Math.PI * 2 +
          t * (0.6 + rand(i) * 0.8) * (i % 2 ? 1 : -1);
        const r = 250 + rand(i * 9) * 240;
        const cx = 540 + Math.cos(a) * r;
        const cy = 480 + Math.sin(a) * r * 0.85;
        const gx = 240 + (i % 4) * 200;
        const gy = 560 + Math.floor(i / 4) * 125;
        const appear = pop(t, 0.1 + i * 0.05, fps, 12);
        return (
          <At
            key={i}
            x={lerp(cx, gx, order)}
            y={lerp(cy, gy, order)}
            scale={appear}
            rotate={(1 - order) * (rand(i * 3) - 0.5) * 80}
          >
            <Emoji char={e} size={84} />
          </At>
        );
      })}
      <At
        x={720}
        y={150 - (1 - pin) * 120}
        scale={pin}
        opacity={clamp01(pin * 2)}
      >
        <Emoji char="📍" size={110} />
      </At>
      <At x={540} y={1000} scale={pin}>
        <Pill color={C.mint} size={48}>
          אתם במקום הנכון
        </Pill>
      </At>
    </Stage>
  );
};

/** The paper broken into pieces that become a staircase, climbed step by step. */
export const StepsScene: React.FC<{
  readonly m: {
    readonly breakdown: number;
    readonly steps: number;
    readonly master: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const split = glide(t, m.breakdown, m.breakdown + 0.8);
  const stair = glide(t, m.steps, m.steps + 0.9);
  const climb = clamp01(
    (t - (m.steps + 0.9)) / Math.max(0.6, m.master - m.steps - 0.6),
  );
  const trophy = pop(t, m.master, fps, 8);
  const pieces = [0, 1, 2, 3];
  // Stairs rise toward the left: the reading direction.
  const stepPos = (i: number) => ({ x: 820 - i * 190, y: 860 - i * 150 });
  const stepIdx = Math.min(3, Math.floor(climb * 4));
  const hop = Math.abs(Math.sin(climb * 4 * Math.PI)) * 50;
  return (
    <Stage>
      {pieces.map((i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const whole = {
          x: 540 + (col ? -130 : 130),
          y: 460 + (row ? 170 : -170),
        };
        const apart = {
          x: whole.x + (col ? -90 : 90),
          y: whole.y + (row ? 70 : -70),
        };
        const s = stepPos(i);
        const x = lerp(lerp(whole.x, apart.x, split), s.x, stair);
        const y = lerp(lerp(whole.y, apart.y, split), s.y, stair);
        return (
          <At
            key={i}
            x={x}
            y={y}
            rotate={(1 - stair) * split * (i % 2 ? 6 : -6)}
          >
            <div
              style={{
                width: lerp(260, 190, stair),
                height: lerp(340, 90, stair),
                background: lerp(0, 1, stair) > 0.5 ? PALETTE[i] : C.card,
                borderRadius: 20,
                boxShadow: "0 12px 0 rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {stair > 0.5 ? (
                <Label size={54} color={C.ink}>{`${i + 1}`}</Label>
              ) : (
                <div
                  style={{
                    width: "78%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 26,
                  }}
                >
                  {[0, 1, 2, 3, 4].map((k) => (
                    <div
                      key={k}
                      style={{
                        height: 18,
                        borderRadius: 9,
                        background: "#e6e2fa",
                        width: `${70 + rand(i * 7 + k) * 30}%`,
                        alignSelf: "flex-end",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </At>
        );
      })}
      {stair >= 1 ? (
        <At x={stepPos(stepIdx).x} y={stepPos(stepIdx).y - 120 - hop}>
          <Emoji char="🚶" size={120} />
        </At>
      ) : null}
      <At x={stepPos(3).x - 30} y={stepPos(3).y - 300} scale={trophy}>
        <Emoji char="🏆" size={150} />
      </At>
      <At x={620} y={130} scale={trophy}>
        <Pill color={C.yellow} size={50}>
          שליטה מלאה בחומר
        </Pill>
      </At>
    </Stage>
  );
};
