import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { NumberVector } from "../components/NumberVector";
import { At, Card, Disc, Emoji, Label, Pill, Strike } from "../components/ui";
import { bob, glide, lerp, pop, ramp } from "../motion";
import { C } from "../theme";

const DOG = [0.62, -0.18, 0.91, 0.07, -0.44];

const TASKS = [
  { e: "🔍", label: "מאפיינים", c: C.sky },
  { e: "🗂️", label: "קטלוג", c: C.mint },
  { e: "📐", label: "דמיון", c: C.yellow },
  { e: "💬", label: "דיבור", c: C.pink },
];

const HATS = ["🎩", "🧢", "👒", "🎓"];

/** One latent concept in long-term memory, projected down into many tasks. */
export const ProjectionScene: React.FC<{
  readonly m: {
    readonly latent: number;
    readonly ltm: number;
    readonly dog: number;
    readonly down: number;
    readonly features: number;
    readonly categorize: number;
    readonly similarity: number;
    readonly talk: number;
    readonly shape: number;
    readonly hats: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const marks = [m.features, m.categorize, m.similarity, m.talk];
  const slots = [
    { x: 800, y: 640 },
    { x: 280, y: 640 },
    { x: 800, y: 900 },
    { x: 280, y: 900 },
  ];
  const src = { x: 540, y: 250 };
  const hatIdx = Math.max(0, Math.floor((t - m.hats) / 0.45)) % HATS.length;
  const glow = ramp(t, m.shape, m.shape + 0.4);
  return (
    <Stage>
      {/* long-term memory cloud */}
      <At x={540} y={240} scale={pop(t, m.latent, fps, 10)}>
        <div
          style={{
            width: 900,
            height: 330,
            borderRadius: 160,
            background: C.bgLift,
            border: `6px solid ${C.purple}`,
            boxShadow: glow > 0 ? `0 0 ${60 * glow}px ${C.purple}` : undefined,
          }}
        />
      </At>
      <At x={540} y={110} opacity={ramp(t, m.ltm, m.ltm + 0.4)}>
        <Label size={40} color={C.purple}>
          זיכרון לטווח ארוך
        </Label>
      </At>
      <At x={360} y={260} scale={pop(t, m.dog, fps, 9)}>
        <div style={{ position: "relative" }}>
          <Disc char="🐶" size={170} color={C.sky} />
          {t >= m.hats ? (
            <div
              style={{
                position: "absolute",
                left: 18,
                top: -86,
                transform: `rotate(-10deg) scale(${pop(t, m.hats + hatIdx * 0.45, fps, 8)})`,
              }}
            >
              <Emoji char={HATS[hatIdx]} size={120} />
            </div>
          ) : null}
        </div>
      </At>
      <At x={690} y={265} scale={pop(t, m.dog + 0.2, fps, 10)}>
        <NumberVector
          values={DOG}
          progress={ramp(t, m.dog + 0.2, m.dog + 1.0)}
          t={t}
          fontSize={30}
          color={C.sky}
          horizontal
        />
      </At>
      <At x={690} y={350} scale={pop(t, m.shape, fps, 9)}>
        <Pill color={C.purple} size={30}>
          אותו וקטור בדיוק
        </Pill>
      </At>
      {/* beams */}
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {slots.map((s, i) => {
          const p = ramp(t, Math.max(m.down, marks[i] - 0.4), marks[i]);
          return (
            <line
              key={i}
              x1={src.x}
              y1={src.y + 140}
              x2={lerp(src.x, s.x, p)}
              y2={lerp(src.y + 140, s.y - 90, p)}
              stroke={TASKS[i].c}
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.7}
              strokeDasharray="2 18"
              strokeDashoffset={-t * 60}
            />
          );
        })}
      </svg>
      {slots.map((s, i) => (
        <At key={i} x={s.x} y={s.y} scale={pop(t, marks[i], fps, 10)}>
          <Card width={360} pad={18} color={TASKS[i].c}>
            <Emoji char={TASKS[i].e} size={86} />
            <Label size={44} color={C.ink}>
              {TASKS[i].label}
            </Label>
          </Card>
        </At>
      ))}
      <At x={540} y={480} scale={pop(t, m.down, fps, 10)}>
        <Label size={40} color={C.textMuted}>
          מוקרן כלפי מטה ↓
        </Label>
      </At>
    </Stage>
  );
};

/** Not one copy per job: one vector, passed through different lenses. */
export const EconomyScene: React.FC<{
  readonly m: {
    readonly mtl: number;
    readonly economy: number;
    readonly street: number;
    readonly define: number;
    readonly mess: number;
    readonly oneSet: number;
    readonly lenses: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const gone = ramp(t, m.oneSet - 0.3, m.oneSet + 0.2);
  const lensCols = [C.sky, C.pink, C.mint];
  const outs = [
    { e: "🏙️", label: "זיהוי" },
    { e: "📖", label: "הגדרה" },
    { e: "💬", label: "שיחה" },
  ];
  const beam = ramp(t, m.lenses + 0.3, m.lenses + 1.2);
  return (
    <Stage>
      <At x={540} y={60} scale={pop(t, m.mtl, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={46}>
          למידה מרובת משימות
        </Pill>
      </At>
      <At x={540} y={150} scale={pop(t, m.economy, fps, 10)}>
        <Label size={42} color={C.yellow}>
          חסכוני ועוצמתי
        </Label>
      </At>
      {/* the wasteful way */}
      <div style={{ opacity: 1 - gone }}>
        {[
          { x: 790, at: m.street, e: "🏙️", label: "גרסה לזיהוי ברחוב" },
          { x: 290, at: m.define, e: "📖", label: "גרסה להגדרה" },
        ].map((c) => (
          <At
            key={c.label}
            x={c.x}
            y={520}
            scale={pop(t, c.at, fps, 10)}
            rotate={t >= m.mess ? Math.sin(t * 30) * 4 : 0}
          >
            <div style={{ position: "relative" }}>
              <Card width={400} pad={24}>
                <div style={{ display: "flex", gap: 10 }}>
                  <Emoji char="🐶" size={100} />
                  <Emoji char={c.e} size={100} />
                </div>
                <Label size={38}>{c.label}</Label>
              </Card>
              <Strike
                progress={ramp(t, m.mess, m.mess + 0.4)}
                width={400}
                height={300}
              />
            </div>
          </At>
        ))}
      </div>
      {/* the economical way */}
      <At x={880} y={600} scale={pop(t, m.oneSet, fps, 10)}>
        <NumberVector
          values={DOG}
          progress={ramp(t, m.oneSet, m.oneSet + 0.8)}
          t={t}
          fontSize={36}
          color={C.sky}
        />
      </At>
      <At x={880} y={360} scale={pop(t, m.oneSet, fps, 10)}>
        <Emoji char="🐶" size={100} />
      </At>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {lensCols.map((c, i) => {
          const y = 420 + i * 190;
          return (
            <g key={i} opacity={ramp(t, m.lenses, m.lenses + 0.4)}>
              <line
                x1={770}
                y1={600}
                x2={lerp(770, 560, beam)}
                y2={lerp(600, y, beam)}
                stroke={c}
                strokeWidth={10}
                strokeLinecap="round"
              />
              <line
                x1={560}
                y1={y}
                x2={lerp(560, 300, ramp(t, m.lenses + 1.0, m.lenses + 1.6))}
                y2={y}
                stroke={c}
                strokeWidth={10}
                strokeLinecap="round"
              />
              <ellipse
                cx={560}
                cy={y}
                rx={30}
                ry={80}
                fill={c}
                opacity={0.55}
                stroke={C.text}
                strokeWidth={4}
              />
            </g>
          );
        })}
      </svg>
      {outs.map((o, i) => (
        <At
          key={o.label}
          x={200}
          y={420 + i * 190 + bob(t, i, 4)}
          scale={pop(t, m.lenses + 1.4 + i * 0.15, fps, 10)}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Emoji char={o.e} size={90} />
            <Label size={34}>{o.label}</Label>
          </div>
        </At>
      ))}
      <At x={560} y={990} scale={pop(t, m.lenses + 0.2, fps, 10)}>
        <Pill color={C.yellow} size={40} emoji="🔍">
          עדשות שונות, אותו וקטור
        </Pill>
      </At>
      <At
        x={540}
        y={300}
        opacity={
          glide(t, m.oneSet + 0.6, m.oneSet + 1) *
          (1 - ramp(t, m.lenses, m.lenses + 0.3))
        }
      >
        <Label size={40} color={C.textMuted}>
          סט מרכזי אחד בזיכרון
        </Label>
      </At>
    </Stage>
  );
};

const PARTS = [
  { e: "🧩", c: C.sky },
  { e: "🏹", c: C.coral },
  { e: "🧪", c: C.mint },
  { e: "💬", c: C.yellow },
];

/** The paper's great synthesis: everything so far, fused into one idea. */
export const SynthesisScene: React.FC<{
  readonly m: { readonly synth: number; readonly beautiful: number };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const fuse = glide(t, m.synth + 0.3, m.synth + 1.3);
  const gem = pop(t, m.synth + 1.2, fps, 8);
  return (
    <Stage>
      {PARTS.map((p, i) => {
        const a = (i / PARTS.length) * Math.PI * 2 - Math.PI / 4 + t * 0.6;
        const r = lerp(320, 0, fuse);
        return (
          <At
            key={p.e}
            x={540 + Math.cos(a) * r}
            y={520 + Math.sin(a) * r}
            scale={pop(t, 0.1 + i * 0.12, fps, 10) * lerp(1, 0.2, fuse)}
            opacity={1 - ramp(t, m.synth + 1.1, m.synth + 1.3)}
          >
            <Disc char={p.e} size={170} color={p.c} />
          </At>
        );
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + t;
        return (
          <At
            key={i}
            x={540 + Math.cos(a) * 260}
            y={520 + Math.sin(a) * 260}
            scale={gem * 0.7}
            rotate={t * 90}
          >
            <Emoji char="✨" size={70} />
          </At>
        );
      })}
      <At x={540} y={520 + bob(t, 0, 10)} scale={gem}>
        <Emoji char="💎" size={260} />
      </At>
      <At x={540} y={110} scale={pop(t, m.synth, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={52}>
          הסינתזה הגדולה
        </Pill>
      </At>
      <At x={540} y={900} scale={pop(t, m.beautiful, fps, 8)}>
        <Pill color={C.yellow} size={56}>
          פשוט יפהפה
        </Pill>
      </At>
    </Stage>
  );
};
