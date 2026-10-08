import React from "react";
import { OUTLINE, TextBubble } from "../engine/kit";
import {
  C,
  FONT,
  clamp01,
  easeIn,
  easeInOut,
  easeOut,
  mix,
  pop,
  ramp,
  rand,
} from "../theme";
import { Art } from "./types";
import {
  Burst,
  DrawPath,
  Ico,
  Panel,
  Svg,
  Txt,
  bob,
  live,
  popAt,
  shake,
} from "./common";

/**
 * Chapters 1 and 2: a generation between two worlds, not knowing things,
 * a childhood outside, and the landline.
 */

export const Generation: Art = ({ scene, now }) => {
  const at = scene.card("strange").show;
  const items = ["cassette", "floppy", "crt", "nokia", "smartphone"] as const;
  const line = easeOut(ramp(now, at, at + 0.9));
  return (
    <>
      <Svg>
        <DrawPath
          d="M 960 760 L 120 760"
          p={line}
          color={C.inkSoft}
          width={6}
        />
        {line > 0.95 ? (
          <path
            d="M 140 740 L 110 760 L 140 780"
            fill="none"
            stroke={C.inkSoft}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ) : null}
      </Svg>
      {items.map((name, i) => (
        <Ico
          key={name}
          name={name}
          px={
            name === "crt"
              ? 7
              : name === "nokia" || name === "smartphone"
                ? 9
                : 9
          }
          x={900 - i * 180}
          y={600}
          at={at + 0.15 + i * 0.2}
          now={now}
          float={6}
        />
      ))}
      <Txt
        x={900}
        y={820}
        size={34}
        color={C.inkSoft}
        opacity={live(now, at + 0.3)}
      >
        אנלוגי
      </Txt>
      <Txt
        x={180}
        y={820}
        size={34}
        color={C.inkSoft}
        opacity={live(now, at + 1.0)}
      >
        דיגיטלי
      </Txt>
    </>
  );
};

/** A smooth wave that quantises into steps; a tape that turns into pixels. */
export const AnalogDigital: Art = ({ scene, now }) => {
  const a = scene.card("analog").show;
  const d = scene.t("digital", 3);
  const dig = easeInOut(ramp(now, d - 0.15, d + 0.5));
  const wave = easeOut(ramp(now, a, a + 0.9));
  const levels = dig > 0 ? Math.round(40 - dig * 34) : 0;
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = 140 + (i / 160) * 800;
    let v = Math.sin(i * 0.16 + now * 3) * 0.8 + Math.sin(i * 0.05 - now) * 0.2;
    if (levels > 0) v = Math.round(v * levels) / levels;
    if (dig > 0.4) {
      // Sample-and-hold: flat runs between samples.
      const step = Math.floor(i / 8) * 8;
      const vs =
        Math.sin(step * 0.16 + now * 3) * 0.8 +
        Math.sin(step * 0.05 - now) * 0.2;
      v = Math.round(vs * 4) / 4;
    }
    pts.push(`${i ? "L" : "M"} ${x.toFixed(1)} ${(1460 + v * 90).toFixed(1)}`);
  }
  const reveal = (i: number) => i / 160 <= wave;
  const shown = pts.filter((_, i) => reveal(i)).join(" ");
  const tape = live(now, a + 0.1) * (1 - dig);
  return (
    <>
      <Svg>
        {shown ? (
          <path
            d={shown}
            fill="none"
            stroke={dig > 0.4 ? C.blue : C.ink}
            strokeWidth={10}
            strokeLinejoin={dig > 0.4 ? "miter" : "round"}
            strokeLinecap="round"
          />
        ) : null}
      </Svg>
      {/* The tape, drawn smooth. */}
      <div
        style={{
          position: "absolute",
          left: 540 - 200,
          top: 330,
          width: 400,
          height: 250,
          opacity: tape,
          transform: `scale(${0.6 + 0.4 * popAt(now, a + 0.1)}) rotate(-4deg)`,
        }}
      >
        <Svg style={{ left: -340, top: -330 }}>
          <g stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round">
            <rect
              x={350}
              y={340}
              width={380}
              height={230}
              rx={24}
              fill="#3d3a44"
            />
            <rect
              x={380}
              y={365}
              width={320}
              height={110}
              rx={14}
              fill={C.paper}
            />
            <rect x={380} y={365} width={320} height={30} rx={8} fill={C.red} />
            <circle cx={460} cy={430} r={30} fill={C.white} />
            <circle cx={620} cy={430} r={30} fill={C.white} />
            <rect
              x={500}
              y={418}
              width={80}
              height={24}
              rx={6}
              fill="#6b5a4a"
            />
            <path d="M 420 570 L 445 520 L 635 520 L 660 570" fill="#5b5763" />
          </g>
        </Svg>
      </div>
      <Ico
        name="cassette"
        px={22}
        x={540}
        y={455}
        at={d - 0.1}
        now={now}
        build
        float={4}
      />
    </>
  );
};

export const Question: Art = ({ scene, now }) => {
  const at = scene.card("remember").show + 0.2;
  const p = popAt(now, at);
  const really = scene.t("really", 1);
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const life = ((now - at) * 0.35 + rand(i * 3)) % 1;
        if (now < at) return null;
        return (
          <Txt
            key={i}
            x={180 + rand(i * 11) * 720}
            y={1560 - life * 600}
            size={60 + rand(i) * 70}
            font={FONT.display}
            color={[C.blue, C.red, C.yellow, C.green][i % 4]}
            opacity={Math.sin(life * Math.PI) * 0.8}
            rot={(rand(i * 7) - 0.5) * 30}
          >
            ?
          </Txt>
        );
      })}
      {p > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1230 + bob(now, 12),
            transform: `translate(-50%, -50%) scale(${(0.3 + 0.7 * p) * (1 + 0.15 * popAt(now, really) * Math.exp(-(now - really) * 4))}) rotate(${shake(now, really, 0.6, 8, 30)}deg)`,
          }}
        >
          <TextBubble
            text="?"
            size={330}
            font={FONT.display}
            ink={C.blue}
            tail="bottom-right"
          />
        </div>
      ) : null}
    </>
  );
};

export const NoPhone: Art = ({ scene, now }) => {
  const at = scene.card("pocket").show;
  const push = scene.t("pocket", 3);
  const sink = easeInOut(ramp(now, push - 0.1, push + 0.35));
  const p = popAt(now, at);
  const g = scene.card("google").show;
  const strike = scene.t("google", 2) + 0.15;
  const query = "השחקן ההוא מהסרט ההוא";
  const typedN = Math.floor([...query].length * clamp01((now - g) / 0.55));
  return (
    <>
      {p > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540 - 230,
            top: 1150,
            width: 460,
            height: 430,
            transform: `scale(${0.5 + 0.5 * p})`,
            opacity: clamp01(p * 3),
            transformOrigin: "50% 100%",
          }}
        >
          {/* The phone, half in, then all the way in. */}
          <div
            style={{ position: "absolute", left: 165, top: -90 + sink * 150 }}
          >
            <Ico name="nokia" px={13} x={65} y={117} at={at} now={now} />
          </div>
          <Svg style={{ left: -310, top: -1150 }}>
            <g stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round">
              <path
                d="M 330 1230 Q 540 1270 750 1230 L 735 1500 Q 540 1600 345 1500 Z"
                fill="#3f5fa8"
              />
              <path
                d="M 360 1262 Q 540 1296 720 1262"
                fill="none"
                stroke="#e8b04a"
                strokeWidth={5}
                strokeDasharray="14 10"
              />
              <path
                d="M 368 1300 L 356 1490 Q 540 1580 724 1490 L 712 1300"
                fill="none"
                stroke="#e8b04a"
                strokeWidth={5}
                strokeDasharray="14 10"
              />
            </g>
          </Svg>
        </div>
      ) : null}
      {now > g - 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1040,
            transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * popAt(now, g - 0.05)})`,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 820,
              height: 112,
              borderRadius: 56,
              background: C.white,
              border: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              direction: "rtl",
              padding: "0 36px",
              gap: 22,
              boxSizing: "border-box",
              fontFamily: FONT.sans,
              fontWeight: 600,
              fontSize: 42,
              color: C.ink,
            }}
          >
            <svg width={50} height={50} viewBox="0 0 50 50">
              <circle
                cx={21}
                cy={21}
                r={14}
                fill="none"
                stroke={C.ink}
                strokeWidth={6}
              />
              <path
                d="M 31 31 L 44 44"
                stroke={C.ink}
                strokeWidth={7}
                strokeLinecap="round"
              />
            </svg>
            <span>{[...query].slice(0, typedN).join("")}</span>
            <span
              style={{
                width: 4,
                height: 50,
                background: C.ink,
                opacity: Math.floor(now * 3) % 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 30,
                right: 30,
                top: 50,
                height: 14,
                borderRadius: 7,
                background: C.red,
                transform: `scaleX(${easeOut(ramp(now, strike, strike + 0.2))}) rotate(-3deg)`,
                transformOrigin: "100% 50%",
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export const Argue: Art = ({ scene, now }) => {
  const at = scene.card("argue1").show;
  const lines: { text: string; side: "l" | "r"; t: number }[] = [
    { text: "היה בסרט!", side: "r", t: scene.t("argue1", 1) },
    { text: "לא היה!", side: "l", t: scene.t("argue1", 2) },
    { text: "בטוח שהיה!", side: "r", t: scene.t("argue1", 3) },
    { text: "בחיים לא!!", side: "l", t: scene.t("argue1", 4) + 0.2 },
  ];
  const tvAt = scene.t("argue2", 1);
  const moon = easeOut(ramp(now, at, scene.t("argue2", 5)));
  return (
    <>
      <Ico
        name="moon"
        px={7}
        x={930}
        y={1180 - moon * 180}
        at={at + 0.3}
        now={now}
      />
      <Ico
        name="person"
        px={15}
        x={790}
        y={1400}
        at={at}
        now={now}
        colors={{ x: C.red, H: "#2b1d14" }}
        float={4}
      />
      <Ico
        name="person"
        px={15}
        x={290}
        y={1400}
        at={at + 0.15}
        now={now}
        colors={{ x: C.green, H: "#c26a2b", z: "#3a3a4a" }}
        flip
        float={4}
      />
      {lines.map((l, i) => {
        const next = lines[i + 1]?.t ?? tvAt;
        const vis = live(now, l.t, next + 0.4);
        if (vis <= 0) return null;
        const p = popAt(now, l.t, 0.3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: l.side === "r" ? 760 : 320,
              top: 1080 - (i % 2) * 40,
              transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * p}) rotate(${l.side === "r" ? 3 : -3}deg)`,
              opacity: vis,
            }}
          >
            <TextBubble
              text={l.text}
              size={46}
              tail={l.side === "r" ? "bottom-right" : "bottom-left"}
              fill={l.side === "r" ? "#ffe3dc" : "#dcf5e8"}
            />
          </div>
        );
      })}
      <Ico
        name="tv"
        px={13}
        x={540}
        y={1150}
        at={tvAt}
        now={now}
        colors={{ x: C.blue }}
        float={5}
      />
      <Txt
        x={530}
        y={1170 + bob(now, 5, 540 * 0.01)}
        size={110}
        font={FONT.display}
        color={C.yellow}
        opacity={live(now, scene.t("argue2", 2))}
      >
        ?
      </Txt>
    </>
  );
};

/** A tear-off calendar losing three pages, then the penny drops. */
export const ThreeDays: Art = ({ scene, now }) => {
  const at = scene.card("answer").show;
  const flips = [
    scene.t("answer", 4),
    scene.t("answer", 5),
    scene.t("answer", 6),
  ];
  const n = flips.filter((t) => now >= t).length;
  const p = popAt(now, at);
  const days = ["ראשון", "שני", "שלישי", "רביעי"];
  const Page: React.FC<{ i: number; style?: React.CSSProperties }> = ({
    i,
    style,
  }) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 400,
        height: 450,
        background: C.white,
        border: `${OUTLINE}px solid ${C.ink}`,
        borderRadius: 18,
        overflow: "hidden",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          height: 110,
          background: C.red,
          borderBottom: `${OUTLINE}px solid ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: 52,
          color: C.white,
          direction: "rtl",
        }}
      >
        יום {days[i]}
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: 280,
          lineHeight: "320px",
          color: C.ink,
        }}
      >
        {12 + i}
      </div>
    </div>
  );
  return (
    <>
      {p > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540 - 200,
            top: 1030,
            transform: `scale(${0.4 + 0.6 * p})`,
            opacity: clamp01(p * 3),
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              width: 400,
              height: 450,
              background: "rgba(0,0,0,0.22)",
              borderRadius: 18,
            }}
          />
          <Page i={Math.min(3, n)} />
          {flips.map((t, i) => {
            const k = ramp(now, t, t + 0.55);
            if (k <= 0 || k >= 1) return null;
            return (
              <Page
                key={i}
                i={i}
                style={{
                  transform: `translate(${-k * 240}px, ${easeIn(k) * 700}px) rotate(${-k * 50}deg)`,
                  opacity: 1 - easeIn(k),
                }}
              />
            );
          })}
        </div>
      ) : null}
      <Ico
        name="bulb"
        px={11}
        x={830}
        y={1120}
        at={scene.t("answer", 7)}
        now={now}
        float={6}
      />
      <Burst x={830} y={1120} at={scene.t("answer", 7)} now={now} r={130} />
      <Ico
        name="star"
        px={10}
        x={250}
        y={1140}
        at={scene.t("appreciate", 0)}
        now={now}
        float={6}
      />
    </>
  );
};

/** Hopscotch in chalk, drawn square by square: a childhood with no feed. */
export const NoAlgo: Art = ({ scene, now }) => {
  const at = scene.card("algo").show;
  const p = popAt(now, at);
  const word = (i: number) => scene.t("algo", i);
  const squares = [
    { x: 840, y: 1260, n: "1", t: word(0) },
    { x: 730, y: 1260, n: "2", t: word(1) },
    { x: 620, y: 1205, n: "3", t: word(2) },
    { x: 620, y: 1315, n: "4", t: word(3) },
    { x: 510, y: 1260, n: "5", t: word(4) },
    { x: 400, y: 1205, n: "6", t: word(5) },
    { x: 400, y: 1315, n: "7", t: word(6) },
    { x: 290, y: 1260, n: "8", t: word(7) },
  ];
  const no = word(8);
  const stone = easeOut(ramp(now, word(6), word(6) + 0.4));
  return (
    <>
      {p > 0 ? (
        <Panel
          x={540}
          y={1260}
          w={940}
          h={520}
          fill="#45454f"
          radius={40}
          style={{
            transform: `scale(${0.6 + 0.4 * p})`,
            opacity: clamp01(p * 3),
          }}
        />
      ) : null}
      <Svg>
        {squares.map((s, i) => {
          const k = easeOut(ramp(now, s.t - 0.05, s.t + 0.3));
          return (
            <g key={i}>
              <DrawPath
                d={`M ${s.x + 52} ${s.y - 52} L ${s.x - 52} ${s.y - 52} L ${s.x - 52} ${s.y + 52} L ${s.x + 52} ${s.y + 52} Z`}
                p={k}
                color="#f6f1e6"
                width={7}
              />
              {k > 0.6 ? (
                <text
                  x={s.x}
                  y={s.y + 22}
                  textAnchor="middle"
                  fontFamily={FONT.serif}
                  fontWeight={700}
                  fontSize={64}
                  fill="#f6f1e6"
                  opacity={(k - 0.6) / 0.4}
                >
                  {s.n}
                </text>
              ) : null}
            </g>
          );
        })}
        <DrawPath
          d="M 238 1205 A 70 70 0 0 0 238 1315"
          p={easeOut(ramp(now, word(7) + 0.2, word(7) + 0.5))}
          color="#f6f1e6"
          width={7}
        />
      </Svg>
      {stone > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 960 - stone * 560 - 22,
            top: 1290 - Math.sin(stone * Math.PI) * 160,
            width: 44,
            height: 34,
            borderRadius: 16,
            background: "#d9c9a8",
            border: `5px solid ${C.ink}`,
          }}
        />
      ) : null}
      <Ico
        name="smartphone"
        px={9}
        x={880}
        y={1060}
        at={no}
        now={now}
        colors={{ x: C.blueSky }}
        rot={8}
      />
      {now > no ? (
        <Svg>
          <g transform={`translate(880 1060) scale(${popAt(now, no + 0.1)})`}>
            <circle r={98} fill="none" stroke={C.red} strokeWidth={16} />
            <path
              d="M -68 -68 L 68 68"
              stroke={C.red}
              strokeWidth={16}
              strokeLinecap="round"
            />
          </g>
        </Svg>
      ) : null}
    </>
  );
};

/** Playing outside until the sun went down. */
export const Outside: Art = ({ scene, now }) => {
  const at = scene.card("outside").show;
  const dark = scene.t("dark", 2);
  const dusk = ramp(now, scene.t("dark", 0) - 0.6, dark);
  const night = ramp(now, dark - 0.2, dark + 0.6);
  const sky =
    night > 0
      ? mix("#ff9b6a", "#1d2350", night)
      : mix("#8fd0ff", "#ff9b6a", dusk);
  const p = popAt(now, at);
  const sunT = clamp01((now - at) / (dark - at));
  const sunX = 860 - sunT * 640;
  const sunY =
    1180 -
    Math.sin(sunT * Math.PI * 0.9) * 140 +
    easeIn(ramp(now, dark - 0.8, dark + 0.2)) * 260;
  const home = easeIn(ramp(now, dark + 0.1, dark + 1.4));
  const jump = Math.abs(Math.sin(now * 5.5)) * 40 * (1 - home);
  const ballT = (now * 0.9) % 2;
  const ballK = ballT < 1 ? ballT : 2 - ballT;
  const where = scene.t("outside", 6);
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${0.85 + 0.15 * p})`,
        opacity: clamp01(p * 3),
        transformOrigin: "540px 1260px",
      }}
    >
      <Panel x={540} y={1250} w={940} h={600} fill={sky} radius={40}>
        {night > 0
          ? Array.from({ length: 22 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: rand(i) * 900,
                  top: rand(i + 50) * 300,
                  width: 8,
                  height: 8,
                  background: C.white,
                  opacity: night * (0.5 + 0.5 * Math.sin(now * 4 + i)),
                }}
              />
            ))
          : null}
        {/* The sun sets behind the hill: drawn inside the window, under the ground. */}
        <div
          style={{
            position: "absolute",
            left: sunX - 70 - 64,
            top: sunY - 950 - 64,
          }}
        >
          <Ico name="sun" px={8} x={64} y={64} at={at} now={now} />
        </div>
        <div
          style={{
            position: "absolute",
            left: -20,
            right: -20,
            bottom: -40,
            height: 210,
            background: mix("#5cbf6a", "#22334a", night),
            borderTop: `${OUTLINE}px solid ${C.ink}`,
            borderRadius: "50% 50% 0 0 / 60px 60px 0 0",
          }}
        />
      </Panel>
      {/* Lamp post, lit when it gets dark. */}
      <Svg>
        <rect x={168} y={1130} width={14} height={340} fill={C.ink} />
        <rect
          x={140}
          y={1100}
          width={70}
          height={40}
          rx={10}
          fill={night > 0.5 ? C.yellow : "#cfc8b6"}
          stroke={C.ink}
          strokeWidth={6}
        />
        {night > 0.5 ? (
          <circle
            cx={175}
            cy={1150}
            r={140}
            fill={C.yellow}
            opacity={0.18 * night}
          />
        ) : null}
      </Svg>
      <Ico
        name="person"
        px={10}
        x={560 + home * 520}
        y={1420 - jump}
        at={at + 0.1}
        now={now}
        colors={{ x: C.orange, H: "#3b2414" }}
      />
      <Ico
        name="person"
        px={10}
        x={760 + home * 520}
        y={1420}
        at={at + 0.2}
        now={now}
        colors={{ x: C.violet, H: "#c98a2b", z: "#34405a" }}
        flip
      />
      {home < 0.5 ? (
        <div
          style={{
            position: "absolute",
            left: 590 + ballK * 140,
            top: 1320 - Math.sin(ballK * Math.PI) * 110,
            width: 46,
            height: 46,
            borderRadius: 23,
            background: C.red,
            border: `5px solid ${C.ink}`,
          }}
        />
      ) : null}
      <Ico
        name="pin"
        px={8}
        x={660}
        y={1130}
        at={where}
        now={now}
        out={dark - 0.3}
        float={8}
      />
      <Txt
        x={660}
        y={1112}
        size={44}
        color={C.white}
        font={FONT.display}
        opacity={live(now, where + 0.1, dark - 0.3)}
      >
        ?
      </Txt>
    </div>
  );
};

/** The landline, Ido's father, and character building. */
export const Landline: Art = ({ scene, now }) => {
  const at = scene.card("called").show;
  const ringFrom = scene.t("called", 0);
  const ringTo = scene.t("hello", 0);
  const ringing = now > ringFrom && now < ringTo;
  const wobble = ringing
    ? Math.sin(now * 60) * 4 * (Math.floor(now * 2.5) % 2)
    : 0;
  const dadAt = scene.t("dad", 4);
  const slide = easeInOut(ramp(now, dadAt - 0.3, dadAt + 0.2));
  const medal = scene.t("character", 2);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${-slide * 220}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotate(${wobble}deg)`,
            transformOrigin: "540px 1300px",
          }}
        >
          <Ico name="landline" px={20} x={540} y={1300} at={at} now={now} />
        </div>
        {ringing ? (
          <Svg>
            {[0, 1].map((i) => (
              <g
                key={i}
                opacity={Math.floor(now * 5) % 2 === i ? 1 : 0.35}
                stroke={C.yellow}
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
              >
                <path
                  d={`M ${300 - i * 34} ${1210 - i * 20} Q ${270 - i * 34} 1300 ${300 - i * 34} ${1390 + i * 20}`}
                />
                <path
                  d={`M ${780 + i * 34} ${1210 - i * 20} Q ${810 + i * 34} 1300 ${780 + i * 34} ${1390 + i * 20}`}
                />
              </g>
            ))}
          </Svg>
        ) : null}
      </div>
      <Ico
        name="dad"
        px={17}
        x={770}
        y={1330}
        at={dadAt}
        now={now}
        colors={{ x: "#6b7f88" }}
      />
      {now > scene.t("dad", 6) ? (
        <div
          style={{
            position: "absolute",
            left: 650,
            top: 1020,
            transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * popAt(now, scene.t("dad", 6), 0.3)})`,
          }}
        >
          <TextBubble
            text="…מי זה?"
            size={50}
            font={FONT.serif}
            weight={800}
            tail="bottom-right"
          />
        </div>
      ) : null}
      {now > medal - 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: 330,
            top: 1010,
            transform: `translate(-50%, -50%) rotate(-8deg) scale(${0.4 + 0.6 * pop(now - medal, 0.4, 0.5)})`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 26px",
              background: C.yellow,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 18,
              boxShadow: "10px 10px 0 rgba(0,0,0,0.25)",
              fontFamily: FONT.display,
              fontSize: 80,
              color: C.ink,
              direction: "rtl",
            }}
          >
            +10 אופי
          </div>
        </div>
      ) : null}
      <Burst x={330} y={1010} at={medal} now={now} color={C.yellow} />
    </>
  );
};
