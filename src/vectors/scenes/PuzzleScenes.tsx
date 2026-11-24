import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { At, Card, Disc, Emoji, Label, Pill, Verdict } from "../components/ui";
import { bob, clamp01, glide, lerp, pop, ramp, rand } from "../motion";
import { C, DISPLAY } from "../theme";

/** "How does the brain even store concepts?" */
export const BrainQuestion: React.FC<{
  readonly m: {
    readonly heads: number;
    readonly how: number;
    readonly store: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const brain = pop(t, 0.05, fps, 10);
  const cabinet = pop(t, m.store, fps, 9);
  return (
    <Stage>
      <At x={540} y={360 + bob(t, 0, 10)} scale={brain}>
        <Emoji char="🧠" size={300} />
      </At>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + t * 0.8;
        return (
          <At
            key={i}
            x={540 + Math.cos(a) * 250}
            y={360 + Math.sin(a) * 170}
            scale={pop(t, 0.3 + i * 0.12, fps, 10)}
            rotate={Math.sin(t * 3 + i) * 15}
          >
            <Label
              size={90}
              color={[C.yellow, C.pink, C.sky, C.mint, C.orange][i]}
            >
              ?
            </Label>
          </At>
        );
      })}
      <At
        x={170}
        y={720}
        scale={pop(t, m.heads, fps, 8)}
        rotate={bob(t, 2, 8, 3)}
      >
        <Emoji char="🤯" size={150} />
      </At>
      <At
        x={910}
        y={720}
        scale={pop(t, m.heads + 0.25, fps, 8)}
        rotate={bob(t, 4, 8, 3)}
      >
        <Emoji char="🤔" size={150} />
      </At>
      <At x={540} y={700} scale={cabinet}>
        <Emoji char="🗄️" size={190} />
      </At>
      <At x={540} y={940} scale={pop(t, m.how, fps, 11)}>
        <Pill color={C.yellow} size={54}>
          איך המוח מאכסן מושגים?
        </Pill>
      </At>
    </Stage>
  );
};

/** Rules and definitions pulling one way, flexibility and relations the other. */
export const TugOfWar: React.FC<{
  readonly m: {
    readonly rules: number;
    readonly flex: number;
    readonly same: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const right = pop(t, m.rules, fps, 10);
  const left = pop(t, m.flex, fps, 10);
  const both = ramp(t, m.same, m.same + 0.3);
  // Rope offset: pulled right, then left, then trembling dead centre.
  let off = 0;
  if (t >= m.rules) off = lerp(0, 70, glide(t, m.rules, m.rules + 0.6));
  if (t >= m.flex) off = lerp(70, -70, glide(t, m.flex, m.flex + 0.7));
  if (t >= m.same)
    off =
      lerp(-70, 0, glide(t, m.same, m.same + 0.4)) +
      Math.sin(t * 40) * 6 * both;
  const y = 520;
  return (
    <Stage>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        <path
          d={`M 190 ${y} Q ${540 + off} ${y + 24 + Math.sin(t * 6) * 6} 890 ${y}`}
          stroke="#d9a066"
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 190 ${y} Q ${540 + off} ${y + 24 + Math.sin(t * 6) * 6} 890 ${y}`}
          stroke="#b07a44"
          strokeWidth={18}
          fill="none"
          strokeDasharray="8 22"
          strokeLinecap="round"
        />
      </svg>
      <At x={540 + off} y={y + 12} scale={pop(t, 0.1, fps, 10)}>
        <Disc char="💡" size={150} color={C.card} ring={both > 0.5} />
      </At>
      <At x={540 + off} y={y + 130} opacity={ramp(t, 0.2, 0.6)}>
        <Label size={44}>מושג</Label>
      </At>
      {/* Right team first: Hebrew reads right to left. */}
      <At x={880} y={y - 10} scale={right} rotate={-8 + bob(t, 1, 4, 4)}>
        <Disc char="📏" size={190} color={C.sky} ring={both > 0.5} />
      </At>
      <At x={850} y={y - 250} scale={right}>
        <Card width={360} pad={22} color={C.bgLift} border={C.sky}>
          <Label size={44}>חוקים ברורים</Label>
          <Label size={44}>הגדרות מדויקות</Label>
        </Card>
      </At>
      <At x={200} y={y - 10} scale={left} rotate={8 + bob(t, 3, 4, 4)}>
        <Disc char="🤸" size={190} color={C.pink} ring={both > 0.5} />
      </At>
      <At x={230} y={y - 250} scale={left}>
        <Card width={360} pad={22} color={C.bgLift} border={C.pink}>
          <Label size={44}>גמישות</Label>
          <Label size={44}>הקשרים ויחסים</Label>
        </Card>
      </At>
      <At x={540} y={860} scale={pop(t, m.same, fps, 8)}>
        <Pill color={C.yellow} size={58} emoji="⏱️">
          באותו הזמן בדיוק
        </Pill>
      </At>
    </Stage>
  );
};

/** A concept is a complex animal: rigid rule one moment, fuzzy cloud the next. */
export const ShapeShifter: React.FC<{
  readonly m: {
    readonly animal: number;
    readonly rule: number;
    readonly fuzzy: number;
    readonly neighbors: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const animal = pop(t, m.animal, fps, 8);
  const ruleIn = pop(t, m.rule, fps, 11);
  const fuzz = glide(t, m.fuzzy, m.fuzzy + 0.8);
  const near = ramp(t, m.neighbors, m.neighbors + 0.8);
  const cx = 540;
  const cy = 610;
  const nb = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    return {
      x: cx + Math.cos(a) * 330,
      y: cy + Math.sin(a) * 280,
      c: [C.sky, C.mint, C.pink, C.orange, C.purple, C.coral][i],
    };
  });
  return (
    <Stage>
      {/* Lead-in: who has known this for a long time. */}
      {[
        { x: 780, e: "📜", label: "פילוסופים", at: 0.1, c: C.sky },
        { x: 300, e: "🧠", label: "פסיכולוגים", at: 0.45, c: C.pink },
      ].map((w) => (
        <At
          key={w.label}
          x={w.x}
          y={560}
          scale={pop(t, w.at, fps, 10)}
          opacity={1 - ramp(t, m.animal - 0.3, m.animal + 0.1)}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Disc char={w.e} size={220} color={w.c} />
            <Label size={52}>{w.label}</Label>
          </div>
        </At>
      ))}
      <At
        x={540}
        y={150 + bob(t, 0, 10)}
        scale={animal}
        rotate={bob(t, 1, 6, 2)}
      >
        <Emoji char="🦎" size={200} />
      </At>
      <At x={790} y={110} scale={animal}>
        <Pill color={C.mint} size={42}>
          חיה מורכבת
        </Pill>
      </At>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {nb.map((n, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={lerp(cx, n.x, near)}
            y2={lerp(cy, n.y, near)}
            stroke={n.c}
            strokeWidth={6}
            strokeDasharray="4 14"
            strokeLinecap="round"
            opacity={near}
          />
        ))}
        {nb.map((n, i) => (
          <circle
            key={`c${i}`}
            cx={n.x}
            cy={n.y}
            r={36 * pop(t, m.neighbors + i * 0.08, fps, 10)}
            fill={n.c}
          />
        ))}
      </svg>
      <At x={cx} y={cy} scale={ruleIn}>
        <div
          style={{
            width: 520,
            height: 360,
            borderRadius: lerp(16, 180, fuzz),
            background:
              fuzz > 0 ? `rgba(255,255,255,${lerp(1, 0.85, fuzz)})` : C.card,
            filter: `blur(${fuzz * (1 - near) * 10}px)`,
            boxShadow: `0 0 ${fuzz * 80}px rgba(255,255,255,${fuzz * 0.5})`,
            border: `${lerp(8, 0, fuzz)}px solid ${C.sky}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div style={{ opacity: 1 - fuzz }}>
            <Label size={46} color={C.cardInk}>
              כלל נוקשה
            </Label>
          </div>
          <div
            style={{
              direction: "rtl",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 64,
              color: C.cardInk,
              opacity: 1 - fuzz,
            }}
          >
            משולש = 3 צלעות
          </div>
          <div
            style={{ position: "absolute", opacity: fuzz * (1 - near * 0.4) }}
          >
            <Label size={64} color={C.cardInk}>
              מעורפל…
            </Label>
          </div>
        </div>
      </At>
      <At x={540} y={1000} scale={pop(t, m.neighbors, fps, 10)}>
        <Pill color={C.yellow} size={44}>
          מוגדר לפי מה שלידו
        </Pill>
      </At>
    </Stage>
  );
};

const RULE_BLOCKS = ["סמל", "חוק", "אם…", "…אז", "וגם", "לא"];

/** The two camps: symbols and rules on the right, neural networks on the left. */
export const CampsScene: React.FC<{
  readonly m: {
    readonly split: number;
    readonly symbolic: number;
    readonly rules: number;
    readonly complex: number;
    readonly other: number;
    readonly nets: number;
    readonly noise: number;
    readonly gradual: number;
    readonly partial: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const crack = ramp(t, m.split, m.split + 0.5);
  const rightDim =
    t < m.other ? 1 : lerp(1, 0.45, ramp(t, m.other, m.other + 0.5));
  const leftDim = lerp(0.3, 1, ramp(t, m.other, m.other + 0.5));
  // network geometry (left half)
  const layers = [3, 4, 2];
  const nodes = layers.flatMap((n, li) =>
    Array.from({ length: n }, (_, k) => ({
      li,
      k,
      x: 410 - li * 150,
      y: 480 + (k - (n - 1) / 2) * 120,
    })),
  );
  const edges: Array<[number, number]> = [];
  nodes.forEach((a, i) =>
    nodes.forEach((b, j) => {
      if (b.li === a.li + 1) edges.push([i, j]);
    }),
  );
  const learn = ramp(t, m.gradual, m.gradual + 1.6);
  const missing = t >= m.partial ? 4 : -1;
  return (
    <Stage>
      {/* Lead-in: science as one piece, until the split. */}
      {[-1, 1].map((side) => {
        const apart = glide(t, m.split - 0.1, m.split + 0.7);
        return (
          <At
            key={side}
            x={540 + side * apart * 160}
            y={500}
            scale={pop(t, 0.1, fps, 10)}
            rotate={side * apart * 18}
            opacity={1 - ramp(t, m.split + 0.4, m.split + 0.9)}
          >
            <div
              style={{
                width: 280,
                height: 280,
                clipPath: side < 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
              }}
            >
              <Disc char="🔬" size={280} color={C.mint} />
            </div>
          </At>
        );
      })}
      <At
        x={540}
        y={720}
        scale={pop(t, 0.4, fps, 10)}
        opacity={1 - ramp(t, m.split, m.split + 0.4)}
      >
        <Label size={56}>המדע</Label>
      </At>
      {/* divider */}
      <div
        style={{
          position: "absolute",
          left: 537,
          top: 30 + (1 - crack) * 480,
          width: 6,
          height: 980 * crack,
          borderRadius: 3,
          background: C.text,
          opacity: 0.4,
        }}
      />
      {/* RIGHT: symbolic */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 0,
          width: 540,
          height: 1060,
          opacity: rightDim,
        }}
      >
        <At x={270} y={70} scale={pop(t, m.symbolic, fps, 10)}>
          <Pill color={C.sky} size={44}>
            המחנה הסימבולי
          </Pill>
        </At>
        <At x={270} y={250} scale={pop(t, m.symbolic + 0.3, fps, 10)}>
          <Emoji char="🖥️" size={170} />
        </At>
        {RULE_BLOCKS.map((b, i) => {
          const p = pop(t, m.rules + i * 0.2, fps, 12);
          const row = Math.floor(i / 2);
          const col = i % 2;
          return (
            <At
              key={b}
              x={180 + col * 180}
              y={lerp(380, 820 - row * 105, p)}
              opacity={clamp01(p * 2)}
              scale={p}
            >
              <div
                style={{
                  width: 160,
                  height: 90,
                  borderRadius: 14,
                  background: i % 2 ? C.yellow : C.sky,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 0 rgba(0,0,0,0.25)",
                }}
              >
                <Label size={42} color={C.ink}>
                  {b}
                </Label>
              </div>
            </At>
          );
        })}
        <At x={270} y={510} scale={pop(t, m.complex, fps, 9)}>
          <Pill color={C.mint} size={38} emoji="💭">
            מחשבות מורכבות
          </Pill>
        </At>
      </div>
      {/* LEFT: connectionist */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 540,
          height: 1060,
          opacity: leftDim,
        }}
      >
        <At x={270} y={70} scale={pop(t, m.other + 0.4, fps, 10)}>
          <Pill color={C.pink} size={40}>
            המחנה הקונקשיוניסטי
          </Pill>
        </At>
        <svg width={540} height={1060} style={{ position: "absolute" }}>
          {edges.map(([a, b], i) => {
            const na = nodes[a];
            const nbb = nodes[b];
            const pulse = (t * 1.4 + rand(i)) % 1;
            const on = t >= m.nets;
            return (
              <g key={i} opacity={on ? 1 : 0.25}>
                <line
                  x1={na.x}
                  y1={na.y}
                  x2={nbb.x}
                  y2={nbb.y}
                  stroke={C.gridStrong}
                  strokeWidth={4}
                />
                {on && a !== missing && b !== missing ? (
                  <circle
                    cx={lerp(na.x, nbb.x, pulse)}
                    cy={lerp(na.y, nbb.y, pulse)}
                    r={7}
                    fill={C.pink}
                  />
                ) : null}
              </g>
            );
          })}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={34}
                fill={i === missing ? C.bgLift : C.pink}
                stroke={C.text}
                strokeWidth={i === missing ? 4 : 0}
                strokeDasharray="6 8"
              />
              {i === missing ? (
                <text
                  x={n.x}
                  y={n.y + 14}
                  textAnchor="middle"
                  fontFamily={DISPLAY}
                  fontWeight={700}
                  fontSize={40}
                  fill={C.text}
                >
                  ?
                </text>
              ) : null}
            </g>
          ))}
          {/* background noise */}
          {t >= m.noise
            ? Array.from({ length: 40 }, (_, i) => (
                <circle
                  key={`n${i}`}
                  cx={40 + rand(i * 3 + Math.floor(t * 12)) * 460}
                  cy={260 + rand(i * 7 + Math.floor(t * 12)) * 460}
                  r={3}
                  fill={C.text}
                  opacity={0.5 * ramp(t, m.noise, m.noise + 0.3)}
                />
              ))
            : null}
        </svg>
        <At x={270} y={250} scale={pop(t, m.nets, fps, 10)}>
          <Pill color={C.bgLift} ink={C.text} size={36} emoji="🕸️">
            רשתות עצביות
          </Pill>
        </At>
        <At x={270} y={830} opacity={ramp(t, m.gradual, m.gradual + 0.3)}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Label size={36}>למידה הדרגתית</Label>
            <div
              style={{
                width: 360,
                height: 26,
                borderRadius: 13,
                background: C.bgLift,
                overflow: "hidden",
                direction: "rtl",
              }}
            >
              <div
                style={{
                  width: `${learn * 100}%`,
                  height: "100%",
                  background: C.mint,
                  borderRadius: 13,
                }}
              />
            </div>
          </div>
        </At>
        <At x={270} y={950} scale={pop(t, m.partial, fps, 10)}>
          <Pill color={C.yellow} size={34}>
            גם עם מידע חלקי
          </Pill>
        </At>
      </div>
    </Stage>
  );
};

/**
 * One piece, two sockets that want opposite shapes. Square, it fits the
 * symbolic socket; rounded off to fit the network socket, it no longer fits
 * the first; asked to be both at once, it fits neither.
 */
export const PuzzleMismatch: React.FC<{
  readonly m: {
    readonly none: number;
    readonly single: number;
    readonly both: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const intoR = glide(t, 0.2, 0.9);
  const toL = glide(t, m.single, m.single + 0.8);
  const toMid = glide(t, m.both, m.both + 0.5);
  const torn = t >= m.both + 0.5;
  const round = torn ? 0.5 + 0.5 * Math.sin(t * 9) : toL;
  const px = lerp(lerp(lerp(540, 790, intoR), 290, toL), 540, toMid);
  const lift = Math.sin(toL * Math.PI) * 160 + toMid * 250;
  const py = lerp(330, 720, intoR) - lift;
  const shake = torn ? Math.sin(t * 50) * 10 : 0;
  const rightOk = t < m.single + 0.4;
  const leftOk = t >= m.single + 0.8 && t < m.both;
  const verdict = (x: number, show: boolean, ok: boolean, at: number) =>
    show ? (
      <At x={x} y={460} scale={pop(t, at, fps, 9)}>
        <Verdict ok={ok} size={100} />
      </At>
    ) : null;
  return (
    <Stage>
      <At x={790} y={720}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 230,
              height: 230,
              border: `10px dashed ${C.sky}`,
              borderRadius: 16,
            }}
          />
          <Pill color={C.sky} size={36} emoji="🖥️">
            סימבולי
          </Pill>
        </div>
      </At>
      <At x={290} y={720}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 230,
              height: 230,
              border: `10px dashed ${C.pink}`,
              borderRadius: "50%",
            }}
          />
          <Pill color={C.pink} size={36} emoji="🕸️">
            רשתות
          </Pill>
        </div>
      </At>
      <At x={px + shake} y={py - 112} rotate={shake * 0.6}>
        <div
          style={{
            width: 200,
            height: 200,
            background: C.yellow,
            borderRadius: lerp(14, 100, round),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 0 rgba(0,0,0,0.3)",
          }}
        >
          <Label size={44} color={C.ink}>
            ייצוג
          </Label>
        </div>
      </At>
      {verdict(790, true, rightOk, rightOk ? 0.9 : m.single + 0.4)}
      {verdict(
        290,
        t >= m.single + 0.8,
        leftOk,
        leftOk ? m.single + 0.8 : m.both,
      )}
      <At x={540} y={110} scale={pop(t, m.none, fps, 9)}>
        <Pill color={C.coral} size={56}>
          אין מצב!
        </Pill>
      </At>
      <At x={540} y={980} scale={pop(t, m.both + 0.6, fps, 8)}>
        <Emoji char="🤷" size={130} />
      </At>
    </Stage>
  );
};
