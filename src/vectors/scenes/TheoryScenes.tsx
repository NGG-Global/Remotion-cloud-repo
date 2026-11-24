import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { Arrow } from "../components/Space";
import { At, Disc, Emoji, Label, Pill, Verdict } from "../components/ui";
import { NumberVector } from "../components/NumberVector";
import { bob, clamp01, glide, lerp, pop, ramp } from "../motion";
import { C, DISPLAY, MONO } from "../theme";

/** The real test: does the maths sit level with classic psychology? */
export const TestScene: React.FC<{
  readonly m: {
    readonly test: number;
    readonly math: number;
    readonly psych: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const settle = glide(t, m.psych + 0.4, m.psych + 1.4);
  const tilt = lerp(Math.sin(t * 2.4) * 14, 0, settle);
  const cx = 540;
  const cy = 470;
  const arm = 330;
  const a = (tilt * Math.PI) / 180;
  const rx = cx + Math.cos(a) * arm;
  const ry = cy + Math.sin(a) * arm;
  const lx = cx - Math.cos(a) * arm;
  const ly = cy - Math.sin(a) * arm;
  return (
    <Stage>
      <At x={540} y={90} scale={pop(t, m.test, fps, 9)}>
        <Pill color={C.yellow} size={56} emoji="📝">
          המבחן האמיתי
        </Pill>
      </At>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        <polygon
          points={`${cx},${cy} ${cx - 70},${cy + 420} ${cx + 70},${cy + 420}`}
          fill={C.bgLift}
        />
        <line
          x1={lx}
          y1={ly}
          x2={rx}
          y2={ry}
          stroke={C.text}
          strokeWidth={16}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={22} fill={C.yellow} />
        {[
          [rx, ry],
          [lx, ly],
        ].map(([x, y], i) => (
          <g key={i}>
            <line
              x1={x}
              y1={y}
              x2={x - 90}
              y2={y + 170}
              stroke={C.textMuted}
              strokeWidth={5}
            />
            <line
              x1={x}
              y1={y}
              x2={x + 90}
              y2={y + 170}
              stroke={C.textMuted}
              strokeWidth={5}
            />
            <path
              d={`M ${x - 130} ${y + 170} Q ${x} ${y + 260} ${x + 130} ${y + 170} Z`}
              fill={i === 0 ? C.sky : C.pink}
            />
          </g>
        ))}
      </svg>
      <At x={rx} y={ry + 110} scale={pop(t, m.math, fps, 10)}>
        <Emoji char="📐" size={110} />
      </At>
      <At x={rx} y={ry + 300} scale={pop(t, m.math, fps, 10)}>
        <Label size={44}>מתמטיקה</Label>
      </At>
      <At x={lx} y={ly + 110} scale={pop(t, m.psych, fps, 10)}>
        <Emoji char="🧠" size={110} />
      </At>
      <At x={lx} y={ly + 300} scale={pop(t, m.psych, fps, 10)}>
        <Label size={44}>פסיכולוגיה קלאסית</Label>
      </At>
    </Stage>
  );
};

/** Prototype theory: fuzzy categories with an ideal at the centre. */
export const PrototypeScene: React.FC<{
  readonly m: {
    readonly proto: number;
    readonly bw: number;
    readonly fuzzy: number;
    readonly typical: number;
    readonly faster: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const cx = 540;
  const cy = 560;
  const fuzzIn = ramp(t, m.fuzzy, m.fuzzy + 0.8);
  const box = pop(t, m.bw, fps, 10) * (1 - ramp(t, m.fuzzy, m.fuzzy + 0.4));
  const items = [
    { r: 120, a: 0.3, c: C.mint },
    { r: 150, a: 2.4, c: C.mint },
    { r: 230, a: 4.1, c: C.sky },
    { r: 260, a: 1.3, c: C.sky },
    { r: 360, a: 5.3, c: C.coral },
  ];
  return (
    <Stage>
      <At x={540} y={70} scale={pop(t, m.proto, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={50}>
          תאוריית האב-טיפוס
        </Pill>
      </At>
      {/* black & white box, rejected */}
      <At x={cx} y={cy} scale={box}>
        <div
          style={{
            position: "relative",
            width: 520,
            height: 420,
            display: "flex",
            border: `8px solid ${C.text}`,
            borderRadius: 8,
          }}
        >
          <div style={{ flex: 1, background: "#000" }} />
          <div style={{ flex: 1, background: "#fff" }} />
          <div style={{ position: "absolute", right: -40, top: -40 }}>
            <Verdict ok={false} size={110} />
          </div>
        </div>
      </At>
      <div
        style={{
          position: "absolute",
          left: cx - 420,
          top: cy - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(46,230,166,0.55) 0%, rgba(76,201,240,0.35) 40%, rgba(169,121,255,0.18) 65%, rgba(21,18,58,0) 72%)`,
          opacity: fuzzIn,
          transform: `scale(${0.7 + 0.3 * fuzzIn})`,
        }}
      />
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {items.map((it, i) => {
          const p = pop(t, m.typical + 0.3 + i * 0.12, fps, 10);
          return (
            <circle
              key={i}
              cx={cx + Math.cos(it.a) * it.r}
              cy={cy + Math.sin(it.a) * it.r}
              r={34 * p}
              fill={it.c}
              stroke={C.ink}
              strokeWidth={4}
            />
          );
        })}
      </svg>
      <At x={cx} y={cy} scale={pop(t, m.typical, fps, 8)} rotate={t * 20}>
        <Emoji char="⭐" size={130} />
      </At>
      <At x={cx} y={cy + 110} scale={pop(t, m.typical, fps, 8)}>
        <Label size={40}>אב-טיפוס</Label>
      </At>
      <At x={790} y={920} scale={pop(t, m.faster, fps, 9)}>
        <Pill color={C.mint} size={40} emoji="⏱️">
          קרוב = מהר
        </Pill>
      </At>
      <At x={300} y={920} scale={pop(t, m.faster + 0.3, fps, 9)}>
        <Pill color={C.coral} size={40} emoji="🐢">
          רחוק = לאט
        </Pill>
      </At>
      <At x={540} y={1010} opacity={ramp(t, m.fuzzy, m.fuzzy + 0.5)}>
        <Label size={38} color={C.textMuted}>
          קטגוריה מעורפלת, לא שחור-לבן
        </Label>
      </At>
    </Stage>
  );
};

/** Think of a bird: a sparrow comes to mind, not a penguin. */
export const BirdThought: React.FC<{
  readonly m: {
    readonly bird: number;
    readonly sparrow: number;
    readonly penguin: number;
    readonly typical: number;
    readonly fast: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const bubble = pop(t, m.bird, fps, 10);
  return (
    <Stage>
      <At x={540} y={200} scale={bubble}>
        <div
          style={{
            background: C.card,
            borderRadius: 120,
            padding: "30px 80px",
            boxShadow: "0 12px 0 rgba(0,0,0,0.25)",
          }}
        >
          <Label size={80} color={C.cardInk}>
            ציפור?
          </Label>
        </div>
      </At>
      {[0, 1, 2].map((i) => (
        <At key={i} x={540 + i * 30} y={330 + i * 60} scale={bubble}>
          <div
            style={{
              width: 50 - i * 14,
              height: 50 - i * 14,
              borderRadius: "50%",
              background: C.card,
            }}
          />
        </At>
      ))}
      <At
        x={760}
        y={600 + bob(t, 0, 10, 3)}
        scale={pop(t, m.sparrow, fps, 8) * (t >= m.typical ? 1.12 : 1)}
      >
        <Emoji char="🐦" size={260} />
      </At>
      <At x={760} y={800} scale={pop(t, m.sparrow, fps, 8)}>
        <Label size={42}>דרור / אדום חזה</Label>
      </At>
      <At
        x={300}
        y={630}
        scale={pop(t, m.penguin, fps, 8) * 0.85}
        opacity={t >= m.typical ? 0.5 : 1}
      >
        <Emoji char="🐧" size={230} />
      </At>
      <At x={300} y={820} scale={pop(t, m.penguin, fps, 8)}>
        <Label size={42} color={C.textMuted}>
          פינגווין
        </Label>
      </At>
      <At x={900} y={430} scale={pop(t, m.typical, fps, 9)}>
        <Verdict ok size={100} />
      </At>
      <At x={760} y={940} scale={pop(t, m.fast, fps, 9)}>
        <Pill color={C.yellow} size={42} emoji="⚡">
          תגובה מהירה
        </Pill>
      </At>
      <At x={300} y={940} scale={pop(t, m.fast + 0.25, fps, 9)}>
        <Pill color={C.bgLift} ink={C.text} size={42} emoji="🐢">
          איטית יותר
        </Pill>
      </At>
    </Stage>
  );
};

/** Typicality as geometry: the robin vector sits near "bird", the penguin far off. */
export const TypicalityVectors: React.FC<{
  readonly m: {
    readonly space: number;
    readonly robin: number;
    readonly penguin: number;
    readonly rt: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const o = [180, 760] as const;
  const bird = [800, 260] as const;
  const robin = [720, 210] as const;
  const peng = [930, 640] as const;
  const near = ramp(t, m.robin + 0.6, m.robin + 1.0);
  const far = ramp(t, m.penguin + 0.6, m.penguin + 1.0);
  const bars = ramp(t, m.rt, m.rt + 1.0);
  return (
    <Stage>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        <line
          x1={o[0]}
          y1={o[1]}
          x2={1000}
          y2={o[1]}
          stroke={C.axis}
          strokeWidth={4}
          opacity={ramp(t, 0, 0.4)}
        />
        <line
          x1={o[0]}
          y1={o[1]}
          x2={o[0]}
          y2={120}
          stroke={C.axis}
          strokeWidth={4}
          opacity={ramp(t, 0, 0.4)}
        />
        <Arrow
          from={o}
          to={bird}
          progress={ramp(t, 0.2, 0.9)}
          color={C.yellow}
          width={14}
          head={44}
        />
        <Arrow
          from={o}
          to={robin}
          progress={ramp(t, m.robin, m.robin + 0.6)}
          color={C.mint}
          width={12}
          head={40}
        />
        <Arrow
          from={o}
          to={peng}
          progress={ramp(t, m.penguin, m.penguin + 0.6)}
          color={C.coral}
          width={12}
          head={40}
        />
        <line
          x1={robin[0]}
          y1={robin[1]}
          x2={lerp(robin[0], bird[0], near)}
          y2={lerp(robin[1], bird[1], near)}
          stroke={C.mint}
          strokeWidth={8}
          strokeDasharray="10 10"
        />
        <line
          x1={peng[0]}
          y1={peng[1]}
          x2={lerp(peng[0], bird[0], far)}
          y2={lerp(peng[1], bird[1], far)}
          stroke={C.coral}
          strokeWidth={8}
          strokeDasharray="10 10"
        />
      </svg>
      <At x={bird[0] + 70} y={bird[1] + 30} scale={pop(t, 0.5, fps, 10)}>
        <Pill color={C.yellow} size={38}>
          ציפור
        </Pill>
      </At>
      <At
        x={robin[0] - 40}
        y={robin[1] - 70}
        scale={pop(t, m.robin + 0.4, fps, 10)}
      >
        <Emoji char="🐦" size={100} />
      </At>
      <At
        x={peng[0] + 10}
        y={peng[1] + 80}
        scale={pop(t, m.penguin + 0.4, fps, 10)}
      >
        <Emoji char="🐧" size={100} />
      </At>
      <At x={330} y={160} scale={pop(t, m.space, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={38}>
          מרחק = מדרג אופייניות
        </Pill>
      </At>
      {/* reaction times: relative, no invented numbers */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 830,
          opacity: ramp(t, m.rt, m.rt + 0.3),
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 10,
          }}
        >
          <Emoji char="⏱️" size={50} />
          <Label size={38}>זמן תגובה במעבדה</Label>
        </div>
        {[
          { e: "🐦", w: 0.35, c: C.mint },
          { e: "🐧", w: 0.85, c: C.coral },
        ].map((b) => (
          <div
            key={b.e}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 10,
            }}
          >
            <Emoji char={b.e} size={54} />
            <div
              style={{
                height: 40,
                width: `${b.w * bars * 80}%`,
                background: b.c,
                borderRadius: 20,
              }}
            />
          </div>
        ))}
      </div>
    </Stage>
  );
};

/** "Cause" means nothing alone; it means something in "lightning caused the fire". */
export const RelationalScene: React.FC<{
  readonly m: {
    readonly relational: number;
    readonly vacuum: number;
    readonly cause: number;
    readonly alone: number;
    readonly lightning: number;
    readonly roles: number;
    readonly effect: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const jarOut = ramp(t, m.lightning - 0.2, m.lightning + 0.2);
  const sentence = ramp(t, m.lightning, m.lightning + 0.4);
  const dropC = glide(t, m.roles, m.roles + 0.5);
  const dropE = glide(t, m.effect, m.effect + 0.5);
  return (
    <Stage>
      <At x={540} y={70} scale={pop(t, m.relational, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={50}>
          הגישה היחסית
        </Pill>
      </At>
      {/* the vacuum: a bell jar with a lonely word */}
      <At
        x={540}
        y={520}
        scale={pop(t, m.vacuum, fps, 10)}
        opacity={1 - jarOut}
      >
        <div style={{ position: "relative", width: 460, height: 520 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "230px 230px 30px 30px",
              border: `8px solid rgba(200,230,255,0.6)`,
              background: "rgba(200,230,255,0.06)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -30,
              right: -30,
              bottom: -24,
              height: 40,
              borderRadius: 12,
              background: C.textMuted,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                opacity: pop(t, m.cause, fps, 10) * (t >= m.alone ? 0.4 : 1),
                transform: `translateY(${bob(t, 0, 14, 1.2)}px)`,
              }}
            >
              <Label size={84}>סיבה</Label>
            </div>
            <div style={{ opacity: ramp(t, m.alone, m.alone + 0.3) }}>
              <Label size={90} color={C.yellow}>
                ?
              </Label>
            </div>
          </div>
        </div>
      </At>
      {/* the sentence that gives it meaning */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 420,
          display: "flex",
          direction: "rtl",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: sentence,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Disc char="⚡" size={200} color={C.yellow} />
          <Label size={48}>ברק</Label>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Label size={44} color={C.textMuted}>
            גרם ל
          </Label>
          <svg width={220} height={60}>
            <line
              x1={210}
              y1={30}
              x2={40}
              y2={30}
              stroke={C.text}
              strokeWidth={10}
              strokeLinecap="round"
            />
            <polygon points="10,30 50,8 50,52" fill={C.text} />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Disc char="🔥" size={200} color={C.orange} />
          <Label size={48}>שריפה</Label>
        </div>
      </div>
      <At
        x={850}
        y={lerp(-60, 330, dropC)}
        opacity={clamp01(dropC * 3)}
        rotate={(1 - dropC) * -20}
      >
        <Pill color={C.mint} size={44}>
          סיבה
        </Pill>
      </At>
      <At
        x={230}
        y={lerp(-60, 330, dropE)}
        opacity={clamp01(dropE * 3)}
        rotate={(1 - dropE) * 20}
      >
        <Pill color={C.pink} size={44}>
          תוצאה
        </Pill>
      </At>
    </Stage>
  );
};

const ROLE_PAIRS = [
  ["⚡", "🔥"],
  ["🌧️", "🌊"],
  ["🦠", "🤒"],
] as const;

/** Binding fillers to roles on the fly: the same two slots, new contents. */
export const RoleBinding: React.FC<{
  readonly m: {
    readonly bind: number;
    readonly analogies: number;
    readonly problems: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const cycle = 1.5;
  const k = Math.max(0, Math.floor((t - m.bind) / cycle));
  const pair = ROLE_PAIRS[k % ROLE_PAIRS.length];
  const local = t - m.bind - k * cycle;
  const inP = t < m.bind ? 0 : clamp01(local / 0.25);
  const outP = t < m.bind ? 0 : clamp01((local - (cycle - 0.25)) / 0.25);
  const slot = (x: number, label: string, color: string, e: string) => (
    <>
      <At x={x} y={300} scale={pop(t, 0.1, fps, 10)}>
        <Pill color={color} size={48}>
          {label}
        </Pill>
      </At>
      <At x={x} y={540}>
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 40,
            border: `8px dashed ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              transform: `translateY(${(1 - inP) * -120 + outP * 120}px) scale(${inP * (1 - outP)})`,
            }}
          >
            <Emoji char={e} size={170} />
          </div>
        </div>
      </At>
    </>
  );
  return (
    <Stage>
      {slot(800, "סיבה", C.mint, pair[0])}
      {slot(280, "תוצאה", C.pink, pair[1])}
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        <Arrow
          from={[640, 540]}
          to={[440, 540]}
          progress={ramp(t, 0.2, 0.7)}
          color={C.text}
          width={12}
          head={40}
        />
      </svg>
      <At x={540} y={110} scale={pop(t, m.bind, fps, 10)}>
        <Pill color={C.yellow} size={46}>
          קישור לתפקידים, בזמן אמת
        </Pill>
      </At>
      <At x={760} y={880} scale={pop(t, m.analogies, fps, 9)}>
        <Pill color={C.card} ink={C.cardInk} size={44} emoji="🔁">
          אנלוגיות
        </Pill>
      </At>
      <At x={320} y={880} scale={pop(t, m.problems, fps, 9)}>
        <Pill color={C.card} ink={C.cardInk} size={44} emoji="🧩">
          פתרון בעיות
        </Pill>
      </At>
    </Stage>
  );
};

/** Adding and subtracting words as if they were numbers. */
export const WordMath: React.FC<{
  readonly m: {
    readonly math: number;
    readonly add: number;
    readonly numbers: number;
    readonly complex: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const flip = glide(t, m.numbers, m.numbers + 0.8);
  const tokens = ["מילה", "+", "מילה", "−", "מילה"];
  const vecs = [
    [0.8, -0.2, 0.5],
    [0.1, 0.9, -0.4],
    [-0.3, 0.6, 0.7],
  ];
  let wi = 0;
  return (
    <Stage>
      <At x={540} y={120} scale={pop(t, m.math, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={46} emoji="🧮">
          מתמטיקה וקטורית בסיסית
        </Pill>
      </At>
      <div
        style={{
          position: "absolute",
          left: 30,
          right: 30,
          top: 380,
          display: "flex",
          direction: "rtl",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {tokens.map((tok, i) => {
          const p = pop(t, m.add + i * 0.15, fps, 11);
          if (tok === "+" || tok === "−") {
            return (
              <div
                key={i}
                style={{
                  transform: `scale(${p})`,
                  fontFamily: MONO,
                  fontWeight: 800,
                  fontSize: 100,
                  color: C.yellow,
                }}
              >
                {tok}
              </div>
            );
          }
          const v = vecs[wi++];
          return (
            <div
              key={i}
              style={{
                transform: `scale(${p}) rotateY(${flip * 180}deg)`,
                transformStyle: "preserve-3d",
                position: "relative",
                width: 230,
                height: 300,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  background: [C.sky, C.pink, C.mint][wi - 1],
                  borderRadius: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 0 rgba(0,0,0,0.25)",
                }}
              >
                <Label size={58} color={C.ink}>
                  {tok}
                </Label>
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: C.bgLift,
                  borderRadius: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NumberVector
                  values={v}
                  progress={1}
                  t={t}
                  fontSize={40}
                  color={[C.sky, C.pink, C.mint][wi - 1]}
                />
              </div>
            </div>
          );
        })}
      </div>
      <At x={540} y={830} scale={pop(t, m.complex, fps, 8)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Emoji char="🤯" size={120} />
          <Label size={52}>פותר אנלוגיות מורכבות</Label>
        </div>
      </At>
    </Stage>
  );
};

/** apple + cars − car lands on apples: the parallelogram. */
export const ParallelogramScene: React.FC<{
  readonly m: {
    readonly model: number;
    readonly apple: number;
    readonly car: number;
    readonly cars: number;
    readonly applePlus: number;
    readonly carsW: number;
    readonly carMinus: number;
    readonly point: number;
    readonly apples: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const car = [790, 860] as const;
  const cars = [700, 470] as const;
  const apple = [330, 900] as const;
  const apples = [
    apple[0] + (cars[0] - car[0]),
    apple[1] + (cars[1] - car[1]),
  ] as const;
  const plural = ramp(t, m.cars + 0.3, m.cars + 0.9);
  const travel = ramp(t, m.point, m.point + 1.2);
  const sides = ramp(t, m.apples + 0.4, m.apples + 1.2);
  const eq = (at: number, node: React.ReactNode, key: string) => (
    <div
      key={key}
      style={{
        transform: `scale(${pop(t, at, fps, 11)})`,
        display: "flex",
        alignItems: "center",
      }}
    >
      {node}
    </div>
  );
  const word = (e: string, w: string, c: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: c,
        borderRadius: 18,
        padding: "4px 14px",
      }}
    >
      <Emoji char={e} size={44} />
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 40,
          color: C.ink,
        }}
      >
        {w}
      </span>
    </div>
  );
  const op = (s: string) => (
    <span
      style={{
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 64,
        color: C.yellow,
        margin: "0 8px",
      }}
    >
      {s}
    </span>
  );
  return (
    <Stage>
      <At x={540} y={50} scale={pop(t, m.model, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={44}>
          מודל המקבילית
        </Pill>
      </At>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 120,
          height: 110,
          display: "flex",
          direction: "rtl",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {eq(m.applePlus, word("🍎", "תפוח", C.orange), "a")}
        {eq(m.applePlus + 0.3, op("+"), "p")}
        {eq(m.carsW, word("🚗", "רכבים", C.pink), "b")}
        {eq(m.carsW + 0.3, op("−"), "m")}
        {eq(m.carMinus, word("🚗", "רכב", C.sky), "c")}
        {eq(m.apples, op("="), "e")}
        {eq(m.apples + 0.1, word("🍎", "תפוחים", C.mint), "d")}
      </div>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        <line
          x1={apple[0]}
          y1={apple[1]}
          x2={car[0]}
          y2={car[1]}
          stroke={C.textMuted}
          strokeWidth={5}
          strokeDasharray="12 12"
          opacity={sides}
        />
        <line
          x1={apples[0]}
          y1={apples[1]}
          x2={cars[0]}
          y2={cars[1]}
          stroke={C.textMuted}
          strokeWidth={5}
          strokeDasharray="12 12"
          opacity={sides}
        />
        <Arrow
          from={car}
          to={cars}
          progress={plural}
          color={C.pink}
          width={14}
          head={44}
        />
        <Arrow
          from={apple}
          to={apples}
          progress={travel}
          color={C.pink}
          width={14}
          head={44}
          dashed
        />
      </svg>
      <At x={car[0]} y={car[1]} scale={pop(t, m.car, fps, 10)}>
        <Disc char="🚗" size={130} color={C.sky} />
      </At>
      <At x={car[0] + 130} y={car[1]} scale={pop(t, m.car, fps, 10)}>
        <Label size={40}>רכב</Label>
      </At>
      <At x={cars[0]} y={cars[1]} scale={pop(t, m.cars, fps, 10)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              background: C.pink,
              borderRadius: 40,
              padding: "10px 18px",
            }}
          >
            <Emoji char="🚗🚗" size={56} />
          </div>
          <Label size={40}>רכבים</Label>
        </div>
      </At>
      <At
        x={(car[0] + cars[0]) / 2 + 120}
        y={(car[1] + cars[1]) / 2}
        scale={pop(t, m.cars + 0.8, fps, 10)}
      >
        <Pill color={C.pink} size={32}>
          רבים
        </Pill>
      </At>
      <At x={apple[0]} y={apple[1]} scale={pop(t, m.apple, fps, 10)}>
        <Disc char="🍎" size={130} color={C.orange} />
      </At>
      <At x={apple[0] - 130} y={apple[1]} scale={pop(t, m.apple, fps, 10)}>
        <Label size={40}>תפוח</Label>
      </At>
      <At
        x={apples[0]}
        y={apples[1]}
        scale={t < m.apples ? pop(t, m.apple + 0.3, fps, 10) : 1}
      >
        {t < m.apples ? (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `6px dashed ${C.textMuted}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Label size={70} color={C.textMuted}>
              ?
            </Label>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transform: `scale(${pop(t, m.apples, fps, 8)})`,
            }}
          >
            <div
              style={{
                background: C.mint,
                borderRadius: 40,
                padding: "10px 18px",
              }}
            >
              <Emoji char="🍎🍎" size={56} />
            </div>
            <Label size={40}>תפוחים</Label>
          </div>
        )}
      </At>
    </Stage>
  );
};
