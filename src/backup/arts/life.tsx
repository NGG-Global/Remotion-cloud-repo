import React from "react";
import { OUTLINE, Polaroid, Segments, Stamp, Win } from "../engine/kit";
import { Pixel } from "../pixel/Pixel";
import { IconName } from "../pixel/icons";
import {
  C,
  FONT,
  clamp01,
  easeIn,
  easeInOut,
  easeOut,
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
 * Chapters 3 to 5: the lost decade, adulthood arriving overnight, careers
 * that do not follow a plan, and the feed.
 */

/** One odometer wheel showing a (possibly fractional) digit. */
const Wheel: React.FC<{ value: number; blur?: number }> = ({
  value,
  blur = 0,
}) => {
  const v = ((value % 10) + 10) % 10;
  return (
    <div
      style={{
        position: "relative",
        width: 170,
        height: 230,
        overflow: "hidden",
        background: C.white,
        border: `${OUTLINE}px solid ${C.ink}`,
        borderRadius: 16,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -v * 230 + 0,
          filter: blur ? `blur(${blur}px)` : undefined,
        }}
      >
        {[...Array(11)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 230,
              textAlign: "center",
              fontFamily: FONT.display,
              fontSize: 240,
              lineHeight: "250px",
              color: C.ink,
            }}
          >
            {i % 10}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.25))",
        }}
      />
    </div>
  );
};

export const Odometer: Art = ({ scene, now }) => {
  const at = scene.card("lostyears").show;
  const p = popAt(now, at);
  const t25 = scene.t("between", 2);
  const t35 = scene.t("between", 4);
  const lost = scene.t("nobody", 0);
  let age = 24 + easeOut(ramp(now, t25 - 0.3, t25));
  age += easeInOut(ramp(now, t35 - 0.35, t35 + 0.1)) * 10;
  let blur = now > t35 - 0.35 && now < t35 + 0.1 ? 6 : 0;
  if (now > lost) {
    age += (now - lost) * 9;
    blur = 5;
  }
  const tens = Math.floor(age / 10) + (age % 10 > 9 ? (age % 10) - 9 : 0);
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${0.6 + 0.4 * p}) translateX(${shake(now, lost, 0.6, 8)}px)`,
        transformOrigin: "540px 1260px",
        opacity: clamp01(p * 3),
      }}
    >
      <Panel x={540} y={1270} w={520} h={420} fill="#2d2b33" radius={36}>
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 40,
            color: C.yellow,
            direction: "rtl",
          }}
        >
          גיל
        </div>
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 70,
            display: "flex",
            gap: 30,
            direction: "ltr",
          }}
        >
          <Wheel value={tens} blur={blur} />
          <Wheel value={age % 10} blur={blur} />
        </div>
      </Panel>
      {/* Years flying past while the counter spins. */}
      {Array.from({ length: 10 }).map((_, i) => {
        const t0 = t35 - 0.3 + i * 0.05;
        const k = ramp(now, t0, t0 + 0.8);
        if (k <= 0 || k >= 1) return null;
        const side = i % 2 ? 1 : -1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + side * (120 + k * 420) - 50,
              top: 1240 - k * 300 + rand(i) * 80,
              width: 100,
              height: 80,
              background: C.white,
              border: `5px solid ${C.ink}`,
              borderTop: `22px solid ${C.red}`,
              transform: `rotate(${side * k * 70}deg)`,
              opacity: 1 - k,
            }}
          />
        );
      })}
      <Txt
        x={540}
        y={1550}
        size={60}
        font={FONT.display}
        color={C.red}
        opacity={live(now, lost + 0.2)}
      >
        ???
      </Txt>
    </div>
  );
};

export const Beer: Art = ({ scene, now }) => {
  const at = scene.card("age24").show;
  const clink = scene.t("sidewalk", 1);
  const three = scene.t("sidewalk", 4);
  const k =
    easeInOut(ramp(now, clink - 0.25, clink)) *
    (1 - easeInOut(ramp(now, clink + 0.15, clink + 0.45)));
  return (
    <>
      {Array.from({ length: 26 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 60 + rand(i * 3) * 960,
            top: 950 + rand(i * 5) * 380,
            width: 7,
            height: 7,
            background: "#f4efe4",
            opacity:
              (0.3 + 0.5 * Math.abs(Math.sin(now * 1.7 + i))) * live(now, at),
          }}
        />
      ))}
      <Ico name="moon" px={9} x={880} y={1040} at={at} now={now} float={6} />
      <Svg>
        <rect
          x={-20}
          y={1450}
          width={1120}
          height={36}
          fill="#8a8fa8"
          stroke={C.ink}
          strokeWidth={6}
          opacity={live(now, at)}
        />
        <rect
          x={-20}
          y={1486}
          width={1120}
          height={60}
          fill="#5b6078"
          stroke={C.ink}
          strokeWidth={6}
          opacity={live(now, at)}
        />
      </Svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${k * 30}px) rotate(${k * 12}deg)`,
          transformOrigin: "460px 1440px",
        }}
      >
        <Ico name="beer" px={14} x={460} y={1340} at={at + 0.2} now={now} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${-k * 30}px) rotate(${-k * 12}deg)`,
          transformOrigin: "620px 1440px",
        }}
      >
        <Ico name="beer" px={14} x={620} y={1340} at={at + 0.35} now={now} />
      </div>
      <Burst x={540} y={1250} at={clink} now={now} color={C.yellow} r={100} />
      {now > three - 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: 250,
            top: 1080,
            transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * popAt(now, three - 0.05)})`,
          }}
        >
          <div
            style={{
              padding: "10px 30px",
              background: "#0b0b14",
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 18,
              fontFamily: FONT.display,
              fontSize: 130,
              lineHeight: "140px",
              color: "#ff4d3a",
              textShadow: "0 0 18px #ff4d3a",
              direction: "ltr",
              letterSpacing: "0.06em",
            }}
          >
            03
            <span style={{ opacity: Math.floor(now * 2) % 2 ? 1 : 0.2 }}>
              :
            </span>
            00
          </div>
        </div>
      ) : null}
    </>
  );
};

const Tag: React.FC<{ text: string; color?: string; rot?: number }> = ({
  text,
  color = C.white,
  rot = 0,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: "10px 26px 10px 18px",
      background: color,
      border: `${OUTLINE}px solid ${C.ink}`,
      borderRadius: "14px 40px 40px 14px",
      boxShadow: "8px 8px 0 rgba(0,0,0,0.22)",
      fontFamily: FONT.display,
      fontSize: 70,
      lineHeight: "80px",
      color: C.ink,
      direction: "rtl",
      transform: `rotate(${rot}deg)`,
    }}
  >
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        border: `5px solid ${C.ink}`,
        background: C.paper,
      }}
    />
    {text}
  </div>
);

export const Vacuum: Art = ({ scene, now }) => {
  const at = scene.card("nextday").show;
  const prices = scene.t("nextday", 3);
  const vs = scene.t("nextday", 5);
  const panAt = scene.t("pan", 1);
  const away = easeIn(ramp(now, panAt - 0.35, panAt));
  const fine = scene.t("fine1", 1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${away * 700}px)`,
          opacity: 1 - away,
        }}
      >
        <Ico name="vacuum" px={15} x={330} y={1320} at={at + 0.1} now={now} />
        <Ico
          name="vacuum"
          px={15}
          x={750}
          y={1320}
          at={at + 0.25}
          now={now}
          colors={{ b: C.red, B: "#ffb3a6" }}
          flip
        />
        {now > prices ? (
          <>
            <div
              style={{
                position: "absolute",
                left: 330,
                top: 1060,
                transform: `translate(-50%, -50%) scale(${popAt(now, prices)}) rotate(${Math.sin(now * 3) * 4}deg)`,
              }}
            >
              <Tag text="₪899" />
            </div>
            <div
              style={{
                position: "absolute",
                left: 750,
                top: 1060,
                transform: `translate(-50%, -50%) scale(${popAt(now, prices + 0.15)}) rotate(${Math.sin(now * 3 + 1) * 4}deg)`,
              }}
            >
              <Tag text="₪1,249" color="#ffe0d8" />
            </div>
          </>
        ) : null}
        <Txt
          x={540}
          y={1300}
          size={150}
          font={FONT.display}
          color={C.red}
          scale={popAt(now, vs)}
          rot={-6}
        >
          VS
        </Txt>
      </div>
      <Ico name="pan" px={20} x={540} y={1260} at={panAt} now={now} float={6} />
      {[0, 1, 2].map((i) => (
        <Ico
          key={i}
          name="star"
          px={5}
          x={[330, 760, 640][i]}
          y={[1130, 1160, 1390][i]}
          at={panAt + 0.2 + i * 0.12}
          now={now}
          float={10}
        />
      ))}
      <Burst
        x={540}
        y={1260}
        at={panAt + 0.05}
        now={now}
        color={C.white}
        r={220}
        n={12}
      />
      {now > fine - 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: 830,
            top: 1440,
            transform: `translate(-50%, -50%) scale(${pop(now - fine + 0.05, 0.4, 0.5)}) rotate(8deg)`,
          }}
        >
          <svg width={150} height={150} viewBox="0 0 150 150">
            <circle
              cx={75}
              cy={75}
              r={66}
              fill={C.green}
              stroke={C.ink}
              strokeWidth={OUTLINE}
            />
            <path
              d="M 42 78 L 66 102 L 108 52"
              fill="none"
              stroke={C.white}
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : null}
    </>
  );
};

/** A chalk tally of "I just can't drink like I used to". */
export const Tally: Art = ({ scene, now }) => {
  const at = scene.card("said").show;
  const marks = [scene.t("cant", 4), scene.t("again", 6), scene.t("again2", 1)];
  const stop = scene.t("stop", 2);
  const p = popAt(now, at);
  return (
    <>
      {p > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${0.6 + 0.4 * p})`,
            transformOrigin: "450px 1260px",
            opacity: clamp01(p * 3),
          }}
        >
          <Panel
            x={440}
            y={1260}
            w={620}
            h={420}
            fill="#24513e"
            radius={14}
            line="#7a4b27"
            style={{ borderWidth: 16 }}
          >
            <div
              style={{
                position: "absolute",
                top: 34,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: FONT.serif,
                fontWeight: 700,
                fontSize: 46,
                color: "#f1eee2",
                direction: "rtl",
                opacity: 0.9,
              }}
            >
              ״לא יכול לשתות כמו פעם״
            </div>
          </Panel>
          <Svg>
            {marks.map((t, i) => (
              <DrawPath
                key={i}
                d={`M ${560 - i * 80} 1200 L ${548 - i * 80} 1400`}
                p={easeOut(ramp(now, t, t + 0.25))}
                color="#f1eee2"
                width={16}
              />
            ))}
            <DrawPath
              d="M 250 1330 L 620 1250"
              p={easeOut(ramp(now, stop + 0.3, stop + 0.6))}
              color={C.yellow}
              width={14}
            />
          </Svg>
        </div>
      ) : null}
      <Ico
        name="beer"
        px={13}
        x={870}
        y={1280}
        at={marks[0]}
        now={now}
        out={stop}
        float={5}
      />
      <Ico
        name="mug"
        px={13}
        x={870}
        y={1280}
        at={stop + 0.15}
        now={now}
        float={5}
      />
    </>
  );
};

/** The plan, drawn straight; what happened, drawn as it happened. */
export const Scribble: Art = ({ scene, now }) => {
  const w = (i: number) => scene.t("career", i);
  const plan = easeInOut(ramp(now, w(0), w(4)));
  const real = easeInOut(ramp(now, w(4), w(9) + 0.4));
  const realPath =
    "M 900 1300 C 840 1120, 700 1480, 650 1330 S 790 1120, 610 1170 S 420 1530, 400 1360 S 560 1150, 360 1210 S 230 1440, 200 1290";
  return (
    <>
      <Ico name="pin" px={8} x={900} y={1250} at={w(0) - 0.1} now={now} />
      <Svg>
        <DrawPath
          d="M 880 1300 L 210 1300"
          p={plan}
          color={C.blue}
          width={10}
        />
        <DrawPath d={realPath} p={real} color={C.red} width={12} />
      </Svg>
      <Txt x={560} y={1255} size={34} color={C.blue} opacity={live(now, w(1))}>
        התוכנית
      </Txt>
      <Txt x={520} y={1560} size={34} color={C.red} opacity={live(now, w(6))}>
        מה שקרה בפועל
      </Txt>
      <Ico
        name="star"
        px={8}
        x={190}
        y={1290}
        at={w(9) + 0.35}
        now={now}
        float={6}
      />
      <Burst x={190} y={1290} at={w(9) + 0.35} now={now} />
    </>
  );
};

/** Continents drifting across a globe; the world changing every few years. */
const CONTINENTS = [
  "M 30 120 C 60 60, 140 70, 150 120 C 170 170, 110 230, 70 210 C 30 190, 10 160, 30 120 Z",
  "M 200 60 C 260 30, 330 70, 320 120 C 310 160, 250 150, 230 200 C 210 240, 170 200, 180 150 C 190 110, 170 80, 200 60 Z",
  "M 300 250 C 340 220, 400 240, 390 290 C 380 340, 320 350, 300 310 C 290 290, 280 270, 300 250 Z",
  "M 90 280 C 130 260, 170 290, 160 330 C 150 370, 100 380, 80 340 C 70 310, 70 290, 90 280 Z",
];

const Globe: React.FC<{ x: number; y: number; r: number; spin: number }> = ({
  x,
  y,
  r,
  spin,
}) => {
  const off = (((spin % 420) + 420) % 420) - 420;
  return (
    <svg
      width={r * 2 + 20}
      height={r * 2 + 20}
      viewBox={`-10 -10 ${r * 2 + 20} ${r * 2 + 20}`}
      style={{
        position: "absolute",
        left: x - r - 10,
        top: y - r - 10,
        overflow: "visible",
      }}
    >
      <defs>
        <clipPath id="globeClip">
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      <circle cx={r + 12} cy={r + 12} r={r} fill="rgba(0,0,0,0.22)" />
      <circle cx={r} cy={r} r={r} fill="#5aa9f0" />
      <g clipPath="url(#globeClip)">
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${off + k * 420} ${r - 210})`}>
            {CONTINENTS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="#45c477"
                stroke={C.ink}
                strokeWidth={6}
                strokeLinejoin="round"
              />
            ))}
          </g>
        ))}
        <ellipse
          cx={r}
          cy={r}
          rx={r * 0.45}
          ry={r}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={4}
        />
        <line
          x1={0}
          y1={r}
          x2={r * 2}
          y2={r}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={4}
        />
        <circle
          cx={r * 0.62}
          cy={r * 0.55}
          r={r * 0.9}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={r * 0.18}
          strokeDasharray={`${r * 0.6} ${r * 6}`}
        />
      </g>
      <circle
        cx={r}
        cy={r}
        r={r}
        fill="none"
        stroke={C.ink}
        strokeWidth={OUTLINE}
      />
    </svg>
  );
};

export const GlobeArt: Art = ({ scene, now }) => {
  const at = scene.card("choose").show;
  const p = popAt(now, at);
  const fast = ramp(now, scene.t("world", 4), scene.t("world", 4) + 0.3);
  const spin = now * 60 + fast * (now - scene.t("world", 4)) * 520;
  const orbit: { name: IconName; t: number; px: number }[] = [
    { name: "crt", t: scene.t("world", 4), px: 6 },
    { name: "nokia", t: scene.t("world", 5), px: 7 },
    { name: "smartphone", t: scene.t("world", 6), px: 7 },
    { name: "sparkle", t: scene.t("world", 7), px: 7 },
  ];
  return p <= 0 ? null : (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${0.5 + 0.5 * p})`,
          transformOrigin: "540px 1270px",
          opacity: clamp01(p * 3),
        }}
      >
        <Globe x={540} y={1280} r={230} spin={spin} />
      </div>
      <Ico
        name="cap"
        px={11}
        x={560}
        y={1050}
        at={scene.t("choose", 5)}
        now={now}
        rot={-8}
      />
      {orbit.map((o, i) => {
        const a = -Math.PI / 2 + (i / 4) * Math.PI * 2 + now * 1.4;
        return (
          <Ico
            key={o.name}
            name={o.name}
            px={o.px}
            x={540 + Math.cos(a) * 360}
            y={1280 + Math.sin(a) * 260}
            at={o.t}
            now={now}
          />
        );
      })}
    </>
  );
};

/** A name tag whose job title will not sit still. */
const TITLES = [
  "מנהלת סושיאל",
  "חוקר UX",
  "מפתחת אפליקציות",
  "מהנדס ענן",
  "אנליסטית דאטה",
  "יוצר תוכן",
];

export const Jobs: Art = ({ scene, now }) => {
  const at = scene.card("jobs1").show;
  const dip = scene.card("jobs3").show;
  const back = scene.card("jobs4").show;
  const fade = scene.t("jobs3", 4);
  const q = scene.t("jobs5", 3);
  const tagOn = live(now, at, dip - 0.1);
  const tag2 = live(now, back);
  const dipOn = live(now, dip, back - 0.1);
  const roll = (now - at) / 0.42;
  const idx = Math.floor(roll);
  const frac = roll - idx;
  const NameTag: React.FC<{ children: React.ReactNode; scale: number }> = ({
    children,
    scale,
  }) => (
    <div
      style={{
        position: "absolute",
        left: 540 - 380,
        top: 1270 - 210,
        width: 760,
        height: 420,
        transform: `scale(${scale})`,
        background: C.white,
        border: `${OUTLINE}px solid ${C.ink}`,
        borderRadius: 30,
        overflow: "hidden",
        boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          height: 130,
          background: C.red,
          borderBottom: `${OUTLINE}px solid ${C.ink}`,
          textAlign: "center",
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: 64,
          lineHeight: "130px",
          color: C.white,
          direction: "rtl",
        }}
      >
        שלום, אני
      </div>
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
  return (
    <>
      {tagOn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: tagOn }}>
          <NameTag scale={0.6 + 0.4 * popAt(now, at)}>
            {[0, 1].map((k) => (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 30 + (k - easeInOut(clamp01(frac * 3))) * 280,
                  textAlign: "center",
                  fontFamily: FONT.display,
                  fontSize: 150,
                  lineHeight: "200px",
                  color: C.blue,
                  direction: "rtl",
                }}
              >
                {TITLES[(idx + k) % TITLES.length]}
              </div>
            ))}
          </NameTag>
        </div>
      ) : null}
      {dipOn > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1270,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * popAt(now, dip)}) rotate(-3deg)`,
            opacity: dipOn,
          }}
        >
          <div
            style={{
              width: 760,
              height: 460,
              background: "#fbf3dc",
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 12,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
              textAlign: "center",
              direction: "rtl",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 18,
                border: `4px double ${C.inkSoft}`,
                borderRadius: 6,
              }}
            />
            <div
              style={{
                fontFamily: FONT.serif,
                fontWeight: 800,
                fontSize: 70,
                paddingTop: 50,
                color: C.ink,
              }}
            >
              תעודת הסמכה
            </div>
            <div
              style={{
                fontFamily: FONT.serif,
                fontWeight: 500,
                fontSize: 36,
                color: C.inkSoft,
                marginTop: 10,
              }}
            >
              מוענקת בזאת בתחום
            </div>
            <div
              style={{
                fontFamily: FONT.serif,
                fontWeight: 800,
                fontSize: 64,
                marginTop: 24,
                color: C.ink,
                opacity: 1 - easeIn(ramp(now, fade, fade + 0.6)),
                filter: `blur(${ramp(now, fade, fade + 0.6) * 8}px)`,
              }}
            >
              מקצוע מבוקש מאוד
            </div>
            <div
              style={{
                position: "absolute",
                left: 60,
                bottom: 50,
                width: 90,
                height: 90,
                borderRadius: 45,
                background: C.red,
                border: `5px solid ${C.ink}`,
              }}
            />
          </div>
        </div>
      ) : null}
      {tag2 > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: tag2 }}>
          <NameTag scale={0.6 + 0.4 * popAt(now, back)}>
            <div
              style={{
                position: "absolute",
                left: 120,
                right: 120,
                top: 180,
                height: 8,
                background: C.inkSoft,
                borderRadius: 4,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 640,
                top: 70,
                width: 12,
                height: 110,
                background: C.blue,
                opacity: Math.floor(now * 2.5) % 2,
              }}
            />
          </NameTag>
        </div>
      ) : null}
      {now > q ? (
        <div
          style={{
            position: "absolute",
            left: 800,
            top: 1440,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Stamp text="???" at={q} now={now} size={110} />
        </div>
      ) : null}
    </>
  );
};

/** "You are here" on a map whose route rubs out. */
export const Route: Art = ({ scene, now }) => {
  const at = scene.card("behind").show;
  const p = popAt(now, at);
  const gone = easeIn(
    ramp(now, scene.t("route", 2), scene.t("route", 2) + 0.7),
  );
  const draw = easeOut(ramp(now, at, at + 0.8));
  const path =
    "M 910 1490 C 820 1430, 860 1330, 760 1300 S 600 1360, 560 1260 S 420 1100, 320 1160 S 200 1100, 170 1020";
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${0.7 + 0.3 * p})`,
        transformOrigin: "540px 1260px",
        opacity: clamp01(p * 3),
      }}
    >
      <Panel x={540} y={1260} w={940} h={560} fill="#f7efd8" radius={24}>
        <svg
          width={940}
          height={560}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1={i * 80}
              y1={0}
              x2={i * 80}
              y2={560}
              stroke="#e4d6b4"
              strokeWidth={3}
            />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={i}
              x1={0}
              y1={i * 80}
              x2={940}
              y2={i * 80}
              stroke="#e4d6b4"
              strokeWidth={3}
            />
          ))}
          <path
            d="M 0 420 C 200 380, 300 500, 520 440 S 800 360, 940 420 L 940 560 L 0 560 Z"
            fill="#cfe6c4"
          />
          <path
            d="M 640 0 C 600 120, 700 200, 660 300"
            fill="none"
            stroke="#9cc7ef"
            strokeWidth={26}
          />
        </svg>
      </Panel>
      <Svg>
        <g opacity={1 - gone}>
          <DrawPath d={path} p={draw} color={C.red} width={10} dash="2 26" />
        </g>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={[910, 560, 170][i]}
            cy={[1490, 1260, 1020][i]}
            r={16}
            fill={C.white}
            stroke={C.ink}
            strokeWidth={6}
            opacity={(1 - gone) * draw}
          />
        ))}
      </Svg>
      <Ico
        name="pin"
        px={11}
        x={520}
        y={1180}
        at={scene.t("behind", 2)}
        now={now}
        float={6}
      />
      <div
        style={{
          position: "absolute",
          left: 520,
          top: 1330,
          transform: `translate(-50%, 0) scale(${popAt(now, scene.t("behind", 2) + 0.15)})`,
          padding: "8px 24px",
          background: C.ink,
          color: C.white,
          borderRadius: 14,
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: 40,
          direction: "rtl",
          whiteSpace: "nowrap",
        }}
      >
        אתם כאן
      </div>
    </div>
  );
};

/** A career post, announced once it has all worked out. */
export const Post: Art = ({ scene, now }) => {
  const at = scene.t("post1", 3) - 0.1;
  const p = popAt(now, at);
  const likes = Math.round(
    12 + easeInOut(ramp(now, scene.t("post2", 0), scene.t("post3", 4))) * 1192,
  );
  const stamp = scene.t("post3", 7) + 0.1;
  return p <= 0 ? null : (
    <>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1270,
          transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`,
          opacity: clamp01(p * 3),
        }}
      >
        <div
          style={{
            width: 860,
            height: 560,
            background: C.white,
            border: `${OUTLINE}px solid ${C.ink}`,
            borderRadius: 30,
            boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
            direction: "rtl",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "30px 36px 10px",
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                background: "#cfe0ff",
                border: `5px solid ${C.ink}`,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                paddingTop: 10,
                boxSizing: "border-box",
              }}
            >
              <Pixel
                name="person"
                px={9}
                colors={{ x: "#28324e" }}
                shadow={false}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 800,
                  fontSize: 44,
                  color: C.ink,
                }}
              >
                פלוני אלמוני
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 500,
                  fontSize: 30,
                  color: C.inkSoft,
                }}
              >
                סמנכ״ל צמיחה · לפני 2 דק׳
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "16px 40px",
              fontFamily: FONT.sans,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.35,
              color: C.ink,
            }}
          >
            שמח לבשר שהתחלתי תפקיד חדש!
            <br />
            <span style={{ color: C.blue }}>בדיוק כמו שתכננתי.</span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 100,
              borderTop: `4px solid #e4ddcf`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 40px",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 36,
              color: C.inkSoft,
            }}
          >
            <Pixel name="heart" px={3.4} shadow={false} />
            <Pixel name="star" px={3.4} shadow={false} />
            <span>{likes.toLocaleString("en-US")}</span>
          </div>
        </div>
      </div>
      {now > stamp ? (
        <div
          style={{
            position: "absolute",
            left: 640,
            top: 1420,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Stamp
            text="הכל לפי התוכנית"
            at={stamp}
            now={now}
            size={74}
            rot={-9}
          />
        </div>
      ) : null}
    </>
  );
};

export const Backstage: Art = ({ scene, now }) => {
  const a = scene.t("deck1", 3) - 0.1;
  const b = scene.t("deck2", 0) - 0.1;
  const bars = [0.35, 0.5, 0.72, 1];
  return (
    <>
      {now > a ? (
        <div
          style={{
            position: "absolute",
            left: 770,
            top: 1270,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * popAt(now, a)}) rotate(3deg)`,
          }}
        >
          <div
            style={{
              width: 420,
              height: 500,
              background: "#efe6d2",
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 18,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg width={420} height={500} style={{ position: "absolute" }}>
              <circle
                cx={300}
                cy={380}
                r={70}
                fill="none"
                stroke="#b98a5a"
                strokeWidth={12}
                opacity={0.5}
              />
              <path
                d="M 40 90 C 120 40, 200 160, 300 80 S 380 200, 330 230 S 120 170, 80 260 S 260 330, 360 300"
                fill="none"
                stroke={C.inkSoft}
                strokeWidth={6}
              />
              <path
                d="M 60 330 L 220 330 M 60 370 L 180 370 M 60 410 L 240 410"
                stroke={C.ink}
                strokeWidth={8}
                strokeLinecap="round"
              />
              <path
                d="M 50 330 L 230 420"
                stroke={C.red}
                strokeWidth={8}
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 230,
                top: 140,
                transform: "rotate(9deg)",
              }}
            >
              <Pixel name="sticky" px={7} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 40,
                top: 150,
                transform: "rotate(-7deg)",
              }}
            >
              <Pixel
                name="sticky"
                px={6}
                colors={{ y: C.pink, Y: "#e56e93" }}
              />
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 38,
              color: C.inkSoft,
              marginTop: 24,
              direction: "rtl",
            }}
          >
            מאחורי הקלעים
          </div>
        </div>
      ) : null}
      {now > b ? (
        <div
          style={{
            position: "absolute",
            left: 310,
            top: 1250,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * popAt(now, b)}) rotate(-3deg)`,
          }}
        >
          <div
            style={{
              width: 420,
              height: 500,
              background: C.white,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 18,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
              position: "relative",
              overflow: "hidden",
              direction: "rtl",
            }}
          >
            <div
              style={{
                height: 90,
                background: C.blue,
                color: C.white,
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 44,
                lineHeight: "90px",
                textAlign: "center",
              }}
            >
              צמיחה ✦
            </div>
            <div
              style={{
                position: "absolute",
                left: 50,
                right: 50,
                bottom: 50,
                height: 300,
                display: "flex",
                alignItems: "flex-end",
                gap: 24,
                direction: "ltr",
              }}
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height:
                      300 *
                      h *
                      easeOut(
                        ramp(now, b + 0.2 + i * 0.12, b + 0.6 + i * 0.12),
                      ),
                    background: i === 3 ? C.green : "#9fb8f5",
                    border: `5px solid ${C.ink}`,
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 38,
              color: C.inkSoft,
              marginTop: 24,
              direction: "rtl",
            }}
          >
            המצגת של מישהו אחר
          </div>
        </div>
      ) : null}
      <Txt
        x={540}
        y={1250}
        size={190}
        font={FONT.display}
        color={C.red}
        scale={popAt(now, scene.t("deck2", 3))}
        style={{ textShadow: `0 0 0 ${C.ink}, 5px 5px 0 ${C.ink}` }}
      >
        ≠
      </Txt>
    </>
  );
};

const FEED: { icon: IconName; bg: string }[] = [
  { icon: "sun", bg: "#ffe7a8" },
  { icon: "mug", bg: "#f6d5c7" },
  { icon: "plane", bg: "#cfe3ff" },
  { icon: "cake", bg: "#ffd6e4" },
  { icon: "heart", bg: "#e5dcff" },
  { icon: "star", bg: "#d4f2df" },
  { icon: "camera", bg: "#fde2c2" },
  { icon: "ring", bg: "#e3efff" },
  { icon: "note", bg: "#ffe9f1" },
];

/** A perfect feed, scrolling for ever. */
export const Grid: Art = ({ scene, now }) => {
  const at = scene.card("insta").show;
  const p = popAt(now, at);
  const faster = ramp(now, scene.t("know", 5), scene.t("know", 5) + 0.5);
  const scroll = (now - at) * (60 + faster * 260);
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 1265,
        transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`,
        opacity: clamp01(p * 3),
      }}
    >
      <div
        style={{
          width: 560,
          height: 640,
          background: C.white,
          border: `${OUTLINE + 2}px solid ${C.ink}`,
          borderRadius: 56,
          boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            background: C.white,
            zIndex: 2,
            borderBottom: "4px solid #e4ddcf",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 32,
            lineHeight: "80px",
            textAlign: "center",
            color: C.ink,
            direction: "ltr",
          }}
        >
          @the_perfect_life
        </div>
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: 90 - (scroll % 540),
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {Array.from({ length: 27 }).map((_, i) => {
            const f = FEED[(i * 4 + Math.floor(i / 3)) % FEED.length];
            return (
              <div
                key={i}
                style={{
                  width: 160,
                  height: 160,
                  background: f.bg,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pixel name={f.icon} px={5} shadow={false} />
              </div>
            );
          })}
        </div>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <Burst
          key={i}
          x={140 + (i % 2) * 300}
          y={180 + i * 120}
          at={at + 0.8 + i * 1.3}
          now={now}
          color={C.pink}
          r={80}
        />
      ))}
    </div>
  );
};

/** A party album uploaded without a second thought. */
export const Album: Art = ({ scene, now }) => {
  const at = scene.card("fb1").show;
  const p = popAt(now, at);
  const count = Math.round(
    easeOut(ramp(now, scene.t("fb2", 2), scene.t("fb2", 3) + 0.3)) * 146,
  );
  const blur = 3 + ramp(now, scene.t("fb2", 4), scene.t("fb2", 4) + 0.4) * 5;
  const up = ramp(now, scene.t("fb3", 0), scene.t("fb3", 2));
  const tags = [
    { text: "#מותג_אישי", t: scene.t("brand", 5), y: 1500, x: 330 },
    { text: "#מתאים_לפיד", t: scene.t("feed", 6), y: 1440, x: 760 },
  ];
  return p <= 0 ? null : (
    <>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1250,
          transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`,
          opacity: clamp01(p * 3),
        }}
      >
        <Win w={880} h={600} title="אלבום: מסיבה (2009)">
          <div
            style={{
              padding: "18px 26px",
              direction: "rtl",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 34,
              color: C.ink,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{count} תמונות</span>
            <span style={{ color: C.inkSoft, fontSize: 28 }}>
              {up >= 1 ? "הועלה ✓" : up > 0 ? "מעלה…" : ""}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              padding: "0 26px",
              direction: "rtl",
            }}
          >
            {Array.from({ length: 15 }).map((_, i) => {
              const shown = i < Math.ceil((count / 146) * 15);
              return (
                <div
                  key={i}
                  style={{
                    width: 152,
                    height: 112,
                    background: ["#3a2f6b", "#6b2f4f", "#2f4f6b", "#4f3a2f"][
                      i % 4
                    ],
                    border: `4px solid ${C.ink}`,
                    borderRadius: 6,
                    overflow: "hidden",
                    position: "relative",
                    opacity: shown ? 1 : 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 20 + rand(i) * 70,
                      top: 20 + rand(i + 9) * 40,
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      background: ["#ff8fb1", "#ffcf33", "#8fb4ff", "#9ff0c9"][
                        i % 4
                      ],
                      filter: `blur(${blur}px)`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 70 + rand(i + 3) * 40,
                      top: 40,
                      width: 40,
                      height: 70,
                      borderRadius: 20,
                      background: "#f2b48a",
                      filter: `blur(${blur}px)`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          {up > 0 ? (
            <div
              style={{ position: "absolute", left: 26, right: 26, bottom: 22 }}
            >
              <Segments p={up} w={828} h={34} color={C.green} seg={16} />
            </div>
          ) : null}
        </Win>
      </div>
      <Ico
        name="heart"
        px={8}
        x={890}
        y={1000}
        at={scene.t("naive", 3)}
        now={now}
        float={6}
      />
      {tags.map((g) =>
        now > g.t - 0.1 ? (
          <div
            key={g.text}
            style={{
              position: "absolute",
              left: g.x,
              top: g.y,
              transform: `translate(-50%, -50%) scale(${popAt(now, g.t - 0.1)}) rotate(-4deg)`,
            }}
          >
            <div
              style={{
                position: "relative",
                padding: "10px 24px",
                background: C.yellow,
                border: `${OUTLINE}px solid ${C.ink}`,
                borderRadius: 16,
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 44,
                color: C.ink,
                direction: "rtl",
                boxShadow: "8px 8px 0 rgba(0,0,0,0.22)",
              }}
            >
              {g.text}
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  right: -10,
                  top: "50%",
                  height: 12,
                  marginTop: -6,
                  background: C.red,
                  borderRadius: 6,
                  transform: `scaleX(${easeOut(ramp(now, g.t + 0.35, g.t + 0.6))}) rotate(-6deg)`,
                  transformOrigin: "100% 50%",
                }}
              />
            </div>
          </div>
        ) : null,
      )}
    </>
  );
};

/** Just being there: a print from then, and one from now. */
export const There: Art = ({ scene, now }) => {
  const a = scene.t("there", 1) - 0.1;
  const b = scene.t("now", 5) - 0.1;
  const Scene1 = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, #3a2f6b, #6b2f6b)",
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: rand(i) * 340,
            top: rand(i + 4) * 160,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: [C.yellow, C.pink, C.blueSky][i % 3],
            opacity: 0.8,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 60, bottom: 10 }}>
        <Pixel name="person" px={9} colors={{ x: C.pink, H: "#2b1d14" }} />
      </div>
      <div style={{ position: "absolute", left: 170, bottom: 18 }}>
        <Pixel
          name="person"
          px={9}
          colors={{ x: C.yellow, H: "#c26a2b" }}
          flip
        />
      </div>
      <div style={{ position: "absolute", left: 270, top: 40 }}>
        <Pixel name="note" px={5} />
      </div>
    </div>
  );
  const Scene2 = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, #ffd9a8, #ffb07a)",
      }}
    >
      <div style={{ position: "absolute", left: 40, bottom: 10 }}>
        <Pixel name="person" px={9} colors={{ x: C.blue, H: "#2b1d14" }} />
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 10 }}>
        <Pixel
          name="person"
          px={9}
          colors={{ x: C.green, H: "#c26a2b" }}
          flip
        />
      </div>
      <div style={{ position: "absolute", left: 260, bottom: 30 }}>
        <Pixel name="mug" px={6} />
      </div>
    </div>
  );
  return (
    <>
      {now > a ? (
        <div
          style={{
            position: "absolute",
            left: 470,
            top: 1260,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * popAt(now, a)}) rotate(-6deg)`,
          }}
        >
          <Polaroid w={440} date="'09 7 23">
            {Scene1}
          </Polaroid>
        </div>
      ) : null}
      {now > b ? (
        <div
          style={{
            position: "absolute",
            left: 620 + (1 - easeOut(ramp(now, b, b + 0.35))) * 500,
            top: 1290,
            transform: `translate(-50%, -50%) rotate(${5 + bob(now, 1)}deg)`,
          }}
        >
          <Polaroid w={440} date="'26 10 08">
            {Scene2}
          </Polaroid>
        </div>
      ) : null}
    </>
  );
};
