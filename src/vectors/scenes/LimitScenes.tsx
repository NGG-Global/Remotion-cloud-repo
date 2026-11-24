import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { NumberVector } from "../components/NumberVector";
import { At, Emoji, Label, Pill } from "../components/ui";
import { bob, clamp01, glide, lerp, pop, ramp, rand } from "../motion";
import { C, DISPLAY, PALETTE } from "../theme";

const Warning: React.FC<{
  readonly n: number;
  readonly text: string;
  readonly t: number;
  readonly fps: number;
  readonly at?: number;
}> = ({ n, text, t, fps, at = 0.05 }) => (
  <At x={540} y={70} scale={pop(t, at, fps, 10)}>
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
          background: C.orange,
          color: C.ink,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 40,
          padding: "10px 26px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Emoji char="⚠️" size={40} />
        {n}
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
        {text}
      </div>
    </div>
  </At>
);

const LIMITS = ["סבירות ביולוגית", "פערים קוגניטיביים", "התנגשות מתמטית"];

/** The authors are upfront about the theory's limits: three of them. */
export const HonestScene: React.FC<{
  readonly m: { readonly limits: number; readonly honest: number };
}> = ({ m }) => {
  const { t, fps } = useScene();
  return (
    <Stage>
      <At x={540} y={500} scale={pop(t, 0.1, fps, 10)} rotate={-2}>
        <div
          style={{
            width: 760,
            borderRadius: 36,
            background: C.card,
            padding: "44px 50px",
            boxSizing: "border-box",
            boxShadow: "0 22px 0 rgba(0,0,0,0.3)",
            direction: "rtl",
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Emoji char="📄" size={70} />
            <Label size={56} color={C.cardInk}>
              המגבלות
            </Label>
          </div>
          {LIMITS.map((l, i) => (
            <div
              key={l}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: ramp(
                  t,
                  m.limits + 0.3 + i * 0.35,
                  m.limits + 0.6 + i * 0.35,
                ),
                transform: `translateX(${(1 - ramp(t, m.limits + 0.3 + i * 0.35, m.limits + 0.6 + i * 0.35)) * 40}px)`,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 20,
                  background: C.orange,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 40,
                  color: C.ink,
                }}
              >
                {i + 1}
              </div>
              <Label size={48} color={C.cardInk}>
                {l}
              </Label>
            </div>
          ))}
        </div>
      </At>
      <At x={830} y={170} scale={pop(t, m.honest, fps, 8)} rotate={12}>
        <Pill color={C.mint} size={50} emoji="🙌">
          כנות מלאה
        </Pill>
      </At>
    </Stage>
  );
};

const NEURONS = Array.from({ length: 9 }, (_, i) => ({
  x: 90 + rand(i * 3) * 320,
  y: 300 + rand(i * 5) * 460,
}));

/** How do these numbers map onto real neurons and synapses? */
export const BioGap: React.FC<{
  readonly m: {
    readonly numbers: number;
    readonly neurons: number;
    readonly wet: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const net = ramp(t, m.neurons, m.neurons + 0.8);
  return (
    <Stage>
      <Warning n={1} text="סבירות ביולוגית" t={t} fps={fps} />
      <At x={850} y={540} scale={pop(t, m.numbers, fps, 10)}>
        <NumberVector
          values={[0.31, -0.77, 0.12, 0.58, -0.05, 0.9]}
          progress={ramp(t, m.numbers, m.numbers + 0.8)}
          t={t}
          fontSize={40}
          color={C.sky}
        />
      </At>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {NEURONS.map((a, i) =>
          NEURONS.slice(i + 1).map((b, j) =>
            Math.hypot(a.x - b.x, a.y - b.y) < 230 ? (
              <path
                key={`${i}-${j}`}
                d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 + 30} ${(a.y + b.y) / 2 - 30} ${b.x} ${b.y}`}
                stroke={C.pink}
                strokeWidth={5}
                fill="none"
                opacity={net * 0.8}
              />
            ) : null,
          ),
        )}
        {NEURONS.map((n, i) => (
          <g
            key={i}
            transform={`translate(${n.x} ${n.y}) scale(${pop(t, m.neurons + i * 0.06, fps, 10)})`}
          >
            {[0, 1, 2, 3, 4].map((k) => {
              const a = (k / 5) * Math.PI * 2 + i;
              return (
                <line
                  key={k}
                  x1={0}
                  y1={0}
                  x2={Math.cos(a) * 46}
                  y2={Math.sin(a) * 46}
                  stroke={C.pink}
                  strokeWidth={6}
                  strokeLinecap="round"
                />
              );
            })}
            <circle r={22} fill={C.pink} />
            <circle
              r={9}
              fill={C.bg}
              opacity={0.4 + 0.6 * Math.sin(t * 4 + i) ** 2}
            />
          </g>
        ))}
        <line
          x1={460}
          y1={540}
          x2={710}
          y2={540}
          stroke={C.text}
          strokeWidth={6}
          strokeDasharray="16 16"
          opacity={ramp(t, m.neurons + 0.6, m.neurons + 1)}
        />
      </svg>
      <At x={585} y={540} scale={pop(t, m.neurons + 0.8, fps, 8)}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: C.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 90,
            color: C.ink,
          }}
        >
          ?
        </div>
      </At>
      <At x={850} y={860} opacity={ramp(t, m.numbers, m.numbers + 0.4)}>
        <Label size={40}>תאוריה</Label>
      </At>
      <At x={250} y={860} scale={pop(t, m.wet, fps, 9)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Emoji char="🧠" size={80} />
          <Emoji char="💧" size={60} />
          <Label size={40}>המוח האמיתי</Label>
        </div>
      </At>
    </Stage>
  );
};

/** Causal understanding: a child gets it, the best models still stumble. */
export const CausalGap: React.FC<{
  readonly m: {
    readonly models: number;
    readonly causal: number;
    readonly child: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const n = 6;
  return (
    <Stage>
      <Warning n={2} text="פערים קוגניטיביים" t={t} fps={fps} />
      {/* dominoes: cause and effect, falling right to left */}
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 470,
          height: 220,
          display: "flex",
          direction: "rtl",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {Array.from({ length: n }, (_, i) => {
          const fall = glide(
            t,
            m.causal + 0.2 + i * 0.18,
            m.causal + 0.45 + i * 0.18,
          );
          return (
            <div
              key={i}
              style={{
                width: 50,
                height: 200,
                borderRadius: 10,
                background: PALETTE[i % PALETTE.length],
                transformOrigin: "left bottom",
                transform: `rotate(${-fall * 62}deg)`,
                boxShadow: "0 6px 0 rgba(0,0,0,0.3)",
              }}
            />
          );
        })}
      </div>
      <At x={540} y={760} scale={pop(t, m.causal, fps, 9)}>
        <Pill color={C.card} ink={C.cardInk} size={40}>
          הבנה סיבתית
        </Pill>
      </At>
      <At x={830} y={260} scale={pop(t, m.models, fps, 9)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Emoji char="🤖" size={150} />
          <div style={{ transform: `rotate(${Math.sin(t * 6) * 10}deg)` }}>
            <Label size={90} color={C.coral}>
              ?
            </Label>
          </div>
        </div>
      </At>
      <At x={250} y={260} scale={pop(t, m.child, fps, 9)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Emoji char="👶" size={150} />
          <Emoji char="💡" size={90} />
        </div>
      </At>
      <At x={830} y={930} scale={pop(t, m.models + 0.4, fps, 9)}>
        <Pill color={C.coral} size={36}>
          מודלים מתקדמים: נופלים
        </Pill>
      </At>
      <At x={250} y={930} scale={pop(t, m.child + 0.3, fps, 9)}>
        <Pill color={C.mint} size={36}>
          ילד קטן: בקלות
        </Pill>
      </At>
    </Stage>
  );
};

/** Randomness the vectors need, against the order similarity needs. */
export const RandomVsOrder: React.FC<{
  readonly m: {
    readonly clash: number;
    readonly random: number;
    readonly order: number;
    readonly work: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const push = glide(t, m.order + 0.6, m.order + 1.4);
  const spark =
    pop(t, m.order + 1.3, fps, 7) * (1 - ramp(t, m.work, m.work + 0.3));
  return (
    <Stage>
      <Warning n={3} text="התנגשות מתמטית" t={t} fps={fps} />
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {Array.from({ length: 34 }, (_, i) => {
          const jx = Math.sin(t * 7 + i * 3) * 10;
          const jy = Math.cos(t * 6 + i * 5) * 10;
          return (
            <circle
              key={`r${i}`}
              cx={
                lerp(620 + rand(i * 3) * 400, 560 + rand(i * 3) * 240, push) +
                jx
              }
              cy={300 + rand(i * 7) * 520 + jy}
              r={14 * pop(t, m.random + i * 0.02, fps, 10)}
              fill={PALETTE[i % PALETTE.length]}
            />
          );
        })}
        {Array.from({ length: 30 }, (_, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          return (
            <circle
              key={`o${i}`}
              cx={lerp(80 + col * 85, 230 + col * 50, push)}
              cy={330 + row * 85}
              r={14 * pop(t, m.order + i * 0.02, fps, 10)}
              fill={C.text}
            />
          );
        })}
      </svg>
      <At x={860} y={940} scale={pop(t, m.random, fps, 9)}>
        <Pill color={C.card} ink={C.cardInk} size={38} emoji="🎲">
          אקראיות
        </Pill>
      </At>
      <At x={250} y={940} scale={pop(t, m.order, fps, 9)}>
        <Pill color={C.card} ink={C.cardInk} size={38} emoji="📐">
          סדר גיאומטרי
        </Pill>
      </At>
      <At x={540} y={560} scale={spark}>
        <Emoji char="⚡" size={220} />
      </At>
      <At x={540} y={560} scale={pop(t, m.work, fps, 9)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Emoji char="🚧" size={170} />
          <Pill color={C.yellow} size={44}>
            עוד לא מעט עבודה
          </Pill>
        </div>
      </At>
    </Stage>
  );
};

const THEORIES = [
  { label: "אב-טיפוס", x: 800, y: 330 },
  { label: "גישה יחסית", x: 300, y: 380 },
  { label: "סימבולי", x: 760, y: 560 },
  { label: "רשתות עצביות", x: 290, y: 640 },
  { label: "אד-הוק", x: 780, y: 800 },
  { label: "ריבוי משימות", x: 320, y: 880 },
];

/** But: one thread runs through every theory. */
export const ThreadScene: React.FC<{
  readonly m: {
    readonly but: number;
    readonly thread: number;
    readonly strong: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const draw = ramp(t, m.thread, m.thread + 1.8);
  const d = THEORIES.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = THEORIES[i - 1];
    return `C ${prev.x} ${prev.y + 120}, ${p.x} ${p.y - 120}, ${p.x} ${p.y}`;
  }).join(" ");
  const butOut = ramp(t, m.but + 1.4, m.but + 1.9);
  return (
    <Stage>
      <At
        x={540}
        y={500}
        scale={pop(t, m.but, fps, 7) * (1 - butOut)}
        rotate={-6}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 260,
            color: C.yellow,
            textShadow: "0 14px 0 rgba(0,0,0,0.35)",
            direction: "rtl",
          }}
        >
          אבל!
        </div>
      </At>
      <div style={{ opacity: butOut }}>
        <svg width={1080} height={1060} style={{ position: "absolute" }}>
          <path
            d={d}
            stroke={C.yellow}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw}
            style={{ filter: `drop-shadow(0 0 12px ${C.yellow})` }}
          />
        </svg>
        {THEORIES.map((th, i) => {
          const lit = draw >= i / (THEORIES.length - 1) - 0.01;
          return (
            <At
              key={th.label}
              x={th.x}
              y={th.y}
              scale={pop(t, m.but + 1.5 + i * 0.1, fps, 10) * (lit ? 1.06 : 1)}
            >
              <Pill
                color={lit ? PALETTE[i % PALETTE.length] : C.bgLift}
                ink={lit ? C.ink : C.textMuted}
                size={40}
              >
                {th.label}
              </Pill>
            </At>
          );
        })}
        <At x={540} y={100} scale={pop(t, m.thread, fps, 10)}>
          <Pill color={C.card} ink={C.cardInk} size={44} emoji="🧵">
            החוט המקשר: וקטורים
          </Pill>
        </At>
        <At x={540} y={1000} scale={pop(t, m.strong, fps, 9)}>
          <Pill color={C.mint} size={44} emoji="💪">
            ראיות סופר חזקות
          </Pill>
        </At>
      </div>
    </Stage>
  );
};

const NET = Array.from({ length: 26 }, (_, i) => {
  const a = rand(i * 3) * Math.PI * 2;
  const r = Math.sqrt(rand(i * 7)) * 330;
  return { x: 540 + Math.cos(a) * r, y: 540 + Math.sin(a) * r * 0.95 };
});

/** Could all of thought be a vast geometric network of numbers? */
export const FinalQuestion: React.FC<{
  readonly m: {
    readonly richness: number;
    readonly creativity: number;
    readonly memories: number;
    readonly connections: number;
    readonly network: number;
    readonly crazy: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const toNet = glide(t, m.network, m.network + 1.4);
  const thoughts = [
    { e: "🎨", at: m.creativity },
    { e: "💭", at: m.memories },
    { e: "🔗", at: m.connections },
  ];
  return (
    <Stage>
      <At
        x={540}
        y={540 + bob(t, 0, 10)}
        scale={pop(t, 0.1, fps, 10) * (1 - toNet * 0.6)}
        opacity={1 - toNet}
      >
        <Emoji char="🧠" size={320} />
      </At>
      {thoughts.map((th, i) => {
        const a = t * 0.9 + (i / 3) * Math.PI * 2;
        return (
          <At
            key={th.e}
            x={lerp(540 + Math.cos(a) * 330, NET[i].x, toNet)}
            y={lerp(540 + Math.sin(a) * 300, NET[i].y, toNet)}
            scale={pop(t, th.at, fps, 9) * lerp(1, 0.4, toNet)}
          >
            <Emoji char={th.e} size={130} />
          </At>
        );
      })}
      <svg
        width={1080}
        height={1060}
        style={{ position: "absolute", opacity: toNet }}
      >
        {NET.map((a, i) =>
          NET.slice(i + 1).map((b, j) =>
            Math.hypot(a.x - b.x, a.y - b.y) < 190 ? (
              <line
                key={`${i}-${j}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={PALETTE[(i + j) % PALETTE.length]}
                strokeWidth={3}
                opacity={0.6}
              />
            ) : null,
          ),
        )}
        {NET.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={9 + 4 * Math.sin(t * 3 + i) ** 2}
            fill={PALETTE[i % PALETTE.length]}
          />
        ))}
      </svg>
      <At x={540} y={110} scale={pop(t, m.richness, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={44}>
          כל העושר של המחשבה האנושית
        </Pill>
      </At>
      <At x={540} y={980} scale={pop(t, m.network + 1.0, fps, 9)}>
        <Pill color={C.yellow} size={44}>
          רשת גיאומטרית של מספרים?
        </Pill>
      </At>
      <At x={900} y={830} scale={pop(t, m.crazy, fps, 8)}>
        <Emoji char="🤯" size={130} />
      </At>
    </Stage>
  );
};

/** Thanks, and keep thinking. */
export const OutroScene: React.FC<{
  readonly m: { readonly keep: number };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const wave = Math.sin(t * 6) * 18;
  return (
    <Stage fadeOut={false}>
      <At x={540} y={260} scale={pop(t, 0.1, fps, 9)} rotate={wave}>
        <Emoji char="👋" size={220} />
      </At>
      <At x={540} y={500} scale={pop(t, 0.3, fps, 9)}>
        <Label size={96}>תודה שצפיתם!</Label>
      </At>
      <At x={540} y={660} scale={pop(t, 0.6, fps, 9)}>
        <Pill color={C.yellow} size={60}>
          מושג = וקטור
        </Pill>
      </At>
      <At x={540} y={850} scale={pop(t, m.keep, fps, 9)}>
        <Pill color={C.mint} size={52} emoji="💭">
          תמשיכו לחשוב
        </Pill>
      </At>
      {Array.from({ length: 16 }, (_, i) => {
        const p = clamp01((t - 0.3 - rand(i) * 0.6) / 2.4);
        return (
          <At
            key={i}
            x={540 + (rand(i * 3) - 0.5) * 1000 * p}
            y={500 + (rand(i * 5) - 0.7) * 900 * p + p * p * 500}
            rotate={p * 400}
            opacity={p > 0 && p < 1 ? 1 : 0}
          >
            <div
              style={{
                width: 22,
                height: 34,
                borderRadius: 5,
                background: PALETTE[i % PALETTE.length],
              }}
            />
          </At>
        );
      })}
    </Stage>
  );
};
