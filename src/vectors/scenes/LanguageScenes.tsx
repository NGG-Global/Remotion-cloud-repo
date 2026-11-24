import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { Arrow } from "../components/Space";
import { At, Card, Emoji, Label, Pill, Verdict } from "../components/ui";
import { bob, clamp01, glide, lerp, pop, ramp, rand } from "../motion";
import { C, PALETTE } from "../theme";

/** Older models drove into this territory and crashed. */
export const CrashScene: React.FC<{
  readonly m: { readonly old: number; readonly crash: number };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const drive = glide(t, m.old - 0.3, m.crash);
  const hit = t >= m.crash;
  const boom = pop(t, m.crash, fps, 7);
  const spin = hit ? ramp(t, m.crash, m.crash + 0.6) : 0;
  return (
    <Stage>
      <At x={200} y={560} scale={pop(t, 0.1, fps, 10)}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 110px)",
            gap: 8,
          }}
        >
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 70,
                borderRadius: 8,
                background: i % 2 ? "#c2553f" : "#d46a50",
                transform: hit
                  ? `translate(${(rand(i) - 0.5) * 40 * spin}px, ${(rand(i + 9) - 0.5) * 30 * spin}px) rotate(${(rand(i + 3) - 0.5) * 20 * spin}deg)`
                  : undefined,
              }}
            />
          ))}
        </div>
      </At>
      <At x={200} y={240} scale={pop(t, 0.3, fps, 10)}>
        <Pill color={C.card} ink={C.cardInk} size={36}>
          שפה · לוגיקה · הקשר
        </Pill>
      </At>
      <At
        x={lerp(980, 380, drive) + (hit ? spin * 80 : 0)}
        y={640 - spin * 120}
        rotate={spin * 200}
      >
        <Emoji char="🚙" size={190} />
      </At>
      <At
        x={lerp(980, 380, drive)}
        y={480}
        opacity={(1 - spin) * ramp(t, m.old - 0.3, m.old)}
      >
        <Pill color={C.bgLift} ink={C.text} size={36}>
          מודלים ישנים
        </Pill>
      </At>
      <At
        x={360}
        y={560}
        scale={boom * (1 - ramp(t, m.crash + 1.4, m.crash + 1.8))}
      >
        <Emoji char="💥" size={300} />
      </At>
    </Stage>
  );
};

/** Dictionary definitions on one side, categories invented on the spot on the other. */
export const DictionaryVsAdHoc: React.FC<{
  readonly m: {
    readonly classic: number;
    readonly dict: number;
    readonly adhoc: number;
    readonly invent: number;
    readonly goal: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  return (
    <Stage>
      <At x={790} y={480} scale={pop(t, m.classic, fps, 10)}>
        <Card width={440} height={600} color={C.card}>
          <Emoji char="📖" size={110} />
          <Label size={46} color={C.cardInk}>
            מושג קלאסי
          </Label>
          <div
            style={{
              width: "100%",
              direction: "rtl",
              opacity: ramp(t, m.dict, m.dict + 0.4),
              marginTop: 10,
            }}
          >
            <Label size={38} color={C.cardInk} align="right">
              כלב:
            </Label>
            <Label
              size={34}
              color="#5b5690"
              weight={500}
              align="right"
              width={370}
            >
              יונק טורף ממשפחת הכלביים
            </Label>
            {[1, 0.8, 0.9].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  width: `${w * 100}%`,
                  borderRadius: 7,
                  background: "#e6e2fa",
                  marginTop: 16,
                }}
              />
            ))}
          </div>
        </Card>
      </At>
      <At
        x={290}
        y={480}
        scale={pop(t, m.adhoc, fps, 10)}
        rotate={bob(t, 1, 2, 2)}
      >
        <div
          style={{
            width: 440,
            height: 600,
            borderRadius: 36,
            border: `8px dashed ${C.yellow}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            direction: "rtl",
          }}
        >
          <Emoji char="✨" size={110} />
          <Label size={46}>מושג אד-הוק</Label>
          <div style={{ opacity: ramp(t, m.invent, m.invent + 0.4) }}>
            <Label size={36} color={C.textMuted} weight={500} width={360}>
              מומצא ברגע, לפי הצורך
            </Label>
          </div>
        </div>
      </At>
      {[0, 1, 2, 3].map((i) => {
        const p = pop(t, m.invent + i * 0.15, fps, 9);
        const a = t * 1.5 + i * 1.57;
        return (
          <At
            key={i}
            x={290 + Math.cos(a) * 250}
            y={480 + Math.sin(a) * 330}
            scale={p * 0.8}
          >
            <Emoji char="💡" size={70} />
          </At>
        );
      })}
      <At x={290} y={920} scale={pop(t, m.goal, fps, 9)}>
        <Pill color={C.yellow} size={42} emoji="🎯">
          למטרה ספציפית
        </Pill>
      </At>
    </Stage>
  );
};

/** "Things to buy someone who just published a book": no dictionary word, instantly filled. */
export const AdHocGift: React.FC<{
  readonly m: {
    readonly category: number;
    readonly noWord: number;
    readonly gathers: number;
    readonly pen: number;
    readonly coffee: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const box = pop(t, m.gathers, fps, 9);
  const fly = (at: number) => glide(t, at + 0.35, at + 1.1);
  const bounce = ramp(t, m.gathers + 0.4, m.gathers + 1.6);
  const items = [
    { e: "🖋️", label: "עט יוקרתי", at: m.pen, from: [840, 560] as const },
    { e: "☕", label: "מארז קפה", at: m.coffee, from: [240, 560] as const },
  ];
  return (
    <Stage>
      <At x={540} y={110} scale={pop(t, m.category, fps, 10)}>
        <div
          style={{
            background: C.card,
            borderRadius: 40,
            padding: "20px 36px",
            maxWidth: 900,
            boxShadow: "0 10px 0 rgba(0,0,0,0.25)",
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Emoji char="📕" size={70} />
          <Label size={42} color={C.cardInk} width={720}>
            דברים לקנות למישהו שהרגע הוציא ספר
          </Label>
        </div>
      </At>
      <At
        x={540}
        y={330}
        scale={pop(t, m.noWord, fps, 10)}
        opacity={1 - ramp(t, m.gathers + 0.6, m.gathers + 1)}
      >
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 18,
          }}
        >
          <Emoji char="📖" size={90} />
          <Emoji char="🔎" size={80} />
          <Label size={44} color={C.textMuted}>
            אין מילה כזו במילון
          </Label>
          <Verdict ok={false} size={70} />
        </div>
      </At>
      <At x={540} y={840} scale={box}>
        <Emoji char="🎁" size={260} />
      </At>
      {items.map((it) => {
        const appear = pop(t, it.at, fps, 9);
        const f = fly(it.at);
        return (
          <React.Fragment key={it.e}>
            <At
              x={lerp(it.from[0], 540, f)}
              y={lerp(it.from[1], 800, f)}
              scale={appear * lerp(1, 0.4, f)}
              opacity={1 - clamp01((f - 0.9) / 0.1)}
            >
              <Emoji char={it.e} size={150} />
            </At>
            <At
              x={it.from[0]}
              y={it.from[1] + 120}
              scale={appear}
              opacity={1 - f}
            >
              <Pill color={C.mint} size={38}>
                {it.label}
              </Pill>
            </At>
          </React.Fragment>
        );
      })}
      {/* something that does not belong bounces off */}
      {t > m.gathers + 0.4 && bounce < 1 ? (
        <At
          x={lerp(540, 1000, bounce)}
          y={700 - Math.sin(bounce * Math.PI) * 280}
          rotate={bounce * 540}
        >
          <Emoji char="🔧" size={110} />
        </At>
      ) : null}
    </Stage>
  );
};

/** How does the brain juggle both? Large language models show vectors can. */
export const LLMScene: React.FC<{
  readonly m: {
    readonly juggle: number;
    readonly tech: number;
    readonly llms: number;
    readonly both: number;
    readonly same: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const away = ramp(t, m.tech, m.tech + 0.5);
  const win = pop(t, m.tech + 0.2, fps, 10);
  const inside = glide(t, m.both, m.both + 0.9);
  const balls = [
    { e: "📖", phase: 0 },
    { e: "✨", phase: Math.PI },
  ];
  return (
    <Stage>
      <At x={540} y={620} scale={pop(t, m.juggle, fps, 9) * (1 - away)}>
        <Emoji char="🤹" size={300} />
      </At>
      {balls.map((b, i) => {
        const a = t * 4 + b.phase;
        const jx = 540 + Math.cos(a) * 190;
        const jy = 380 - Math.abs(Math.sin(a)) * 200;
        const tx = 430 + i * 220;
        const ty = 560;
        return (
          <At
            key={b.e}
            x={lerp(jx, tx, inside)}
            y={lerp(jy, ty, inside)}
            scale={
              pop(t, m.juggle + 0.2 + i * 0.15, fps, 10) * lerp(1, 0.9, inside)
            }
          >
            <Emoji char={b.e} size={110} />
          </At>
        );
      })}
      <At x={540} y={560} scale={win}>
        <div
          style={{
            width: 860,
            height: 640,
            borderRadius: 40,
            background: C.bgLift,
            border: `6px solid ${C.purple}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 80,
              background: C.purple,
              display: "flex",
              direction: "rtl",
              alignItems: "center",
              padding: "0 30px",
              gap: 16,
            }}
          >
            <Emoji char="🤖" size={56} />
            <Label size={44} color={C.ink}>
              מודל שפה גדול (LLM)
            </Label>
          </div>
          <svg
            width={860}
            height={560}
            style={{ position: "absolute", top: 80 }}
          >
            {Array.from({ length: 36 }, (_, i) => (
              <circle
                key={i}
                cx={60 + rand(i * 3) * 740}
                cy={40 + rand(i * 5) * 480}
                r={6 + rand(i) * 6}
                fill={PALETTE[i % PALETTE.length]}
                opacity={0.35 + 0.4 * Math.sin(t * 2 + i) ** 2}
              />
            ))}
          </svg>
        </div>
      </At>
      {/* balls drawn over the window once inside */}
      {inside > 0
        ? balls.map((b, i) => (
            <At key={`in${b.e}`} x={430 + i * 220} y={560} scale={inside}>
              <div
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: "50%",
                  background: C.card,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Emoji char={b.e} size={100} />
              </div>
            </At>
          ))
        : null}
      <At x={540} y={950} scale={pop(t, m.same, fps, 9)}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "center",
            gap: 18,
          }}
        >
          <Verdict ok size={80} />
          <Pill color={C.mint} size={46}>
            שני הדברים, באותו מרחב
          </Pill>
        </div>
      </At>
    </Stage>
  );
};

/**
 * One set of vectors, rearranged by context: first into a dictionary
 * definition, a moment later into a brand-new gift category.
 */
export const SameVectors: React.FC<{
  readonly m: {
    readonly set: number;
    readonly dict: number;
    readonly gifts: number;
    readonly context: number;
    readonly flex: number;
  };
}> = ({ m }) => {
  const { t, fps } = useScene();
  const toB = glide(t, m.gifts, m.gifts + 1.0);
  const n = 12;
  const origin = [540, 760] as const;
  const angA = (i: number) => Math.PI * (0.55 + 0.25 * (i / (n - 1)));
  const angB = (i: number) => Math.PI * (0.12 + 0.3 * (i / (n - 1)));
  const ctx = ["ספר", "השקה", "מתנה", "סופר"];
  return (
    <Stage>
      <svg width={1080} height={1060} style={{ position: "absolute" }}>
        {Array.from({ length: n }, (_, i) => {
          const a = lerp(angA(i), angB(i), toB);
          const len = 380 + rand(i * 7) * 120;
          return (
            <Arrow
              key={i}
              from={origin}
              to={[
                origin[0] + Math.cos(a) * len,
                origin[1] - Math.sin(a) * len,
              ]}
              progress={ramp(t, m.set + i * 0.05, m.set + 0.5 + i * 0.05)}
              color={PALETTE[i % PALETTE.length]}
              width={8}
              head={26}
            />
          );
        })}
      </svg>
      <At
        x={250}
        y={230}
        scale={pop(t, m.dict, fps, 10)}
        opacity={1 - toB * 0.75}
      >
        <Pill color={C.card} ink={C.cardInk} size={40} emoji="📖">
          הגדרה מילונית
        </Pill>
      </At>
      <At x={850} y={300} scale={pop(t, m.gifts + 0.6, fps, 9)}>
        <Pill color={C.yellow} size={40} emoji="🎁">
          מתנות לסופר מתחיל
        </Pill>
      </At>
      {ctx.map((w, i) => {
        const a = t * 0.8 + (i / ctx.length) * Math.PI * 2;
        return (
          <At
            key={w}
            x={540 + Math.cos(a) * 400}
            y={520 + Math.sin(a) * 120}
            scale={pop(t, m.context + i * 0.12, fps, 10)}
            opacity={0.85}
          >
            <Pill color={C.bgLift} ink={C.textMuted} size={32}>
              {w}
            </Pill>
          </At>
        );
      })}
      <At x={540} y={950} scale={pop(t, m.flex, fps, 9)}>
        <Pill color={C.mint} size={46} emoji="💪">
          הגמישות היא הכוח
        </Pill>
      </At>
    </Stage>
  );
};
