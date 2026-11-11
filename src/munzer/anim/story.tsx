import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useShot } from "../engine/shot";
import { EASE, dirOf, hash, lerp, noise, ramp, win } from "../engine/time";
import { INK, TYPE } from "../theme";
import { Backdrop, BodyMap, Txt, smooth } from "./kit";

/*
 * Story graphics: dates, places, the interview, the ideas the narration
 * argues. Beats are keyed to narration time `n`.
 */

/** Slow dust in a beam of light, for the dark cards. */
const Dust: React.FC<{ readonly t: number; readonly count?: number; readonly k?: number }> = ({
  t,
  count = 40,
  k = 1,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
    {Array.from({ length: count }, (_, i) => {
      const x = 560 + hash(i * 3.1) * 800 + noise(t * 0.15 + i, i) * 40;
      const y = ((hash(i * 7.7) * 1080 + t * (6 + hash(i) * 10)) % 1080);
      return <circle key={i} cx={x} cy={y} r={1 + hash(i * 5) * 2} fill="#dfe8ea" opacity={0.15 + hash(i * 2) * 0.25} />;
    })}
  </svg>
);

/** A date or place card: a line of serif type under a cold overhead light. */
export const DateCard: React.FC<{
  readonly line: string;
  readonly lineAt: number;
  readonly sub?: string;
  readonly subAt?: number;
  readonly sub2?: string;
  readonly sub2At?: number;
  readonly lamp?: boolean;
  readonly tone?: "cold" | "warm";
}> = ({ line, lineAt, sub, subAt, sub2, sub2At, lamp = false, tone = "cold" }) => {
  const { n, t } = useShot();
  const a = ramp(n, lineAt, lineAt + 0.9, EASE.out);
  const b = sub && subAt !== undefined ? ramp(n, subAt, subAt + 0.8, EASE.out) : 0;
  const c = sub2 && sub2At !== undefined ? ramp(n, sub2At, sub2At + 0.8, EASE.out) : 0;
  const beam = lamp ? ramp(t, 0, 2.5) : 0;
  return (
    <Backdrop tone="black" grid={false}>
      {lamp ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(30% 60% at 50% 0%, rgba(${tone === "cold" ? "200,225,235" : "235,210,170"},${0.22 * beam}) 0%, rgba(0,0,0,0) 100%)`,
          }}
        />
      ) : null}
      <Dust t={t} k={lamp ? beam : 0.6} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26 }}>
        <div
          style={{
            fontFamily: TYPE.serif,
            fontSize: 120,
            fontWeight: 500,
            color: INK.text,
            opacity: a,
            direction: dirOf(line),
            letterSpacing: 2,
            transform: `translateY(${(1 - a) * 16}px)`,
            textShadow: "0 4px 40px rgba(0,0,0,0.8)",
          }}
        >
          {line}
        </div>
        <div style={{ width: 160 * Math.max(a, b), height: 2, background: INK.amber, opacity: 0.85 }} />
        {sub ? (
          <div
            style={{
              fontFamily: TYPE.serif,
              fontSize: 64,
              color: INK.textDim,
              opacity: b,
              direction: dirOf(sub),
              transform: `translateY(${(1 - b) * 12}px)`,
            }}
          >
            {sub}
          </div>
        ) : null}
        {sub2 ? (
          <div
            style={{
              fontFamily: TYPE.serif,
              fontSize: 52,
              color: INK.textDim,
              opacity: c * 0.85,
              direction: dirOf(sub2),
              transform: `translateY(${(1 - c) * 12}px)`,
            }}
          >
            {sub2}
          </div>
        ) : null}
      </AbsoluteFill>
    </Backdrop>
  );
};

/** Days of a month ticking over, for "four days later" and "eight days later". */
export const DayCount: React.FC<{
  readonly month: string;
  readonly fromDay: number;
  readonly toDay: number;
  readonly t0: number;
  readonly t1: number;
  readonly circleAt?: number;
  readonly fadeAt?: number;
}> = ({ month, fromDay, toDay, t0, t1, circleAt, fadeAt }) => {
  const { n } = useShot();
  const p = ramp(n, t0, t1, EASE.inOut);
  const day = Math.round(lerp(fromDay, toDay, p));
  const ring = circleAt !== undefined ? ramp(n, circleAt, circleAt + 0.6, EASE.out) : 0;
  const fade = fadeAt !== undefined ? ramp(n, fadeAt, fadeAt + 1.0) : 0;
  return (
    <Backdrop tone="black" grid={false}>
      <AbsoluteFill style={{ opacity: 1 - fade, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 520,
            height: 600,
            background: INK.paper,
            borderRadius: 10,
            boxShadow: "0 30px 90px rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 130,
              background: "#7d2a20",
              color: INK.paper,
              fontFamily: TYPE.serif,
              fontSize: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              direction: "rtl",
            }}
          >
            {month}
          </div>
          <div
            style={{
              position: "relative",
              fontFamily: TYPE.serif,
              fontSize: 300,
              fontWeight: 600,
              color: INK.ink,
              lineHeight: 1.4,
              direction: "ltr",
            }}
          >
            {day}
            {ring > 0 ? (
              <svg width={360} height={300} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", overflow: "visible" }}>
                <ellipse
                  cx={180}
                  cy={150}
                  rx={170}
                  ry={130}
                  fill="none"
                  stroke="#9c2a1c"
                  strokeWidth={8}
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - ring}
                  transform="rotate(-8 180 150)"
                />
              </svg>
            ) : null}
          </div>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

// 172.28 - 175.3: a rural childhood, far from the stage. Mountains at dusk,
// a few lit windows.
export const Alps: React.FC = () => {
  const { t, n } = useShot();
  const dusk = ramp(n, 172.2, 174.0);
  const layer = (y: number, amp: number, seed: number, color: string, drift: number) => {
    const pts: [number, number][] = [[-200, 1080]];
    for (let x = -200; x <= 2120; x += 40) {
      const h = noise(x / 260 + seed, seed) * amp + noise(x / 70 + seed * 3, seed + 1) * amp * 0.18;
      pts.push([x + drift * t, y - Math.abs(h)]);
    }
    pts.push([2120, 1080]);
    return <path d={`M ${pts.map((q) => q.join(" ")).join(" L ")} Z`} fill={color} />;
  };
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(to bottom, #141c28 0%, #2c3646 38%, #7a5a4a 66%, #c58a5c 80%, #3a2a24 100%)",
        overflow: "hidden",
      }}
    >
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <circle cx={1320} cy={660} r={70} fill="#f3c88a" opacity={0.55} style={{ filter: "blur(18px)" }} />
        {layer(640, 300, 2, "#34404e", -3)}
        {layer(760, 200, 5, "#232b35", -7)}
        {layer(900, 110, 9, "#141a20", -13)}
        {Array.from({ length: 11 }, (_, i) => {
          const x = 760 + i * 52 + hash(i) * 20 - 13 * t;
          const y = 900 - 30 - hash(i * 3) * 22;
          const lit = hash(i * 9) > 0.3 ? dusk : 0;
          return (
            <g key={i}>
              <polygon points={`${x - 4},${y} ${x + 18},${y - 20} ${x + 40},${y}`} fill="#0e1216" />
              <rect x={x} y={y} width={36} height={28} fill="#0e1216" />
              <rect x={x + 13} y={y + 9} width={10} height={9} fill="#f2c46b" opacity={lit * 0.95} />
            </g>
          );
        })}
        <rect x={0} y={928} width={1920} height={152} fill="#0e1216" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(90% 80% at 50% 45%, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Film running through a gate, for "one of the biggest film stars". */
export const FilmStrip: React.FC<{ readonly stills: readonly string[] }> = ({ stills }) => {
  const { t } = useShot();
  const fw = 560;
  const fh = 420;
  const gap = 60;
  const off = (t * 220) % (fw + gap);
  return (
    <Backdrop tone="warm" grid={false}>
      <AbsoluteFill style={{ background: "radial-gradient(40% 50% at 50% 50%, rgba(255,235,200,0.18), transparent)" }} />
      <div style={{ position: "absolute", left: -off, top: 300, height: fh + 120, width: 4000, background: "#0c0b0a" }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: i * (fw + gap) + gap / 2, top: 60 }}>
            <Img
              src={staticFile(`munzer/stills/${stills[i % stills.length]}`)}
              style={{ width: fw, height: fh, objectFit: "cover", filter: "grayscale(1) contrast(1.15) brightness(0.9)" }}
            />
          </div>
        ))}
        {Array.from({ length: 40 }, (_, i) => (
          <React.Fragment key={`h${i}`}>
            <div style={{ position: "absolute", left: i * 100 + 30, top: 18, width: 40, height: 26, borderRadius: 5, background: "#2a2622" }} />
            <div style={{ position: "absolute", left: i * 100 + 30, top: fh + 76, width: 40, height: 26, borderRadius: 5, background: "#2a2622" }} />
          </React.Fragment>
        ))}
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(to right, rgba(0,0,0,0.9), transparent 25%, transparent 75%, rgba(0,0,0,0.9))" }} />
    </Backdrop>
  );
};

// 445.94 - 448.4: the results board.
export const Placing: React.FC = () => {
  const { n } = useShot();
  const rows = [1, 2, 3, 4, 5, 6];
  const hl = ramp(n, 447.3, 447.9, EASE.out);
  return (
    <Backdrop tone="warm">
      <Txt k={ramp(n, 445.9, 446.4)} x={960} y={120} size={44} font="serif" width={1000} color={INK.textDim}>
        ארנולד קלאסיק 1996
      </Txt>
      {rows.map((r, i) => {
        const k = ramp(n, 446.0 + i * 0.12, 446.4 + i * 0.12, EASE.out);
        const me = r === 6;
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              left: 560,
              top: 230 + i * 110,
              width: 800,
              height: 88,
              borderRadius: 6,
              background: me ? `rgba(217,164,90,${0.12 + 0.25 * hl})` : "rgba(255,255,255,0.04)",
              border: me ? `2px solid rgba(217,164,90,${0.3 + 0.7 * hl})` : "1px solid rgba(255,255,255,0.08)",
              opacity: k,
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "center",
              padding: "0 36px",
              gap: 40,
            }}
          >
            <div style={{ fontFamily: TYPE.serif, fontSize: 52, color: me ? INK.amber : INK.textDim, width: 60, textAlign: "center" }}>
              {r}
            </div>
            {me ? (
              <div style={{ fontFamily: TYPE.serif, fontSize: 50, color: INK.text, direction: "rtl", opacity: hl }}>
                אנדריאס מינצר
              </div>
            ) : (
              <div style={{ height: 6, width: 380, background: "rgba(255,255,255,0.1)", borderRadius: 3 }} />
            )}
          </div>
        );
      })}
    </Backdrop>
  );
};

/** A portable cassette recorder in line art. */
const Recorder: React.FC<{ readonly t: number; readonly playing: number; readonly x: number; readonly y: number; readonly s?: number; readonly label?: string }> = ({
  t,
  playing,
  x,
  y,
  s = 1,
  label,
}) => {
  const rot = t * 140 * playing;
  const reel = (cx: number) => (
    <g transform={`rotate(${rot} ${cx} 160)`}>
      <circle cx={cx} cy={160} r={58} fill="#1b1a18" stroke="#6d665b" strokeWidth={3} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <line
          key={a}
          x1={cx}
          y1={160}
          x2={cx + Math.cos((a * Math.PI) / 180) * 46}
          y2={160 + Math.sin((a * Math.PI) / 180) * 46}
          stroke="#6d665b"
          strokeWidth={4}
        />
      ))}
      <circle cx={cx} cy={160} r={14} fill="#6d665b" />
    </g>
  );
  return (
    <svg width={560 * s} height={360 * s} viewBox="0 0 560 360" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <rect x={10} y={20} width={540} height={300} rx={26} fill="#24221f" stroke="#5a544b" strokeWidth={3} />
      <rect x={70} y={70} width={420} height={180} rx={14} fill="#c9bfa8" />
      <rect x={110} y={96} width={340} height={40} rx={6} fill="#efe7d6" />
      {label ? (
        <text x={280} y={124} textAnchor="middle" direction="rtl" fontFamily={TYPE.hebrew} fontSize={24} fill="#3b352c">
          {label}
        </text>
      ) : null}
      <rect x={130} y={120} width={300} height={90} rx={45} fill="#0e0d0c" />
      {reel(190)}
      {reel(370)}
      <circle cx={500} cy={50} r={10} fill={playing > 0.5 ? "#e4483a" : "#4a2522"} opacity={playing > 0.5 ? 0.6 + 0.4 * Math.sin(t * 5) : 1} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={120 + i * 90} y={270} width={70} height={30} rx={6} fill="#3a3630" />
      ))}
    </svg>
  );
};

/** Notes appearing in a reporter's notebook. */
const Notebook: React.FC<{ readonly lines: readonly { text: string; at: number; strong?: boolean }[]; readonly n: number; readonly x: number; readonly y: number }> = ({
  lines,
  n,
  x,
  y,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 720,
      height: 820,
      background: "#ebe4d2",
      borderRadius: 6,
      boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
      transform: "rotate(1.5deg)",
      backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 78px, rgba(60,90,140,0.25) 78px 80px)",
      padding: "70px 60px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    {lines.map((l, i) => {
      const k = ramp(n, l.at, l.at + 0.6, EASE.out);
      return (
        <div
          key={i}
          style={{
            fontFamily: TYPE.hebrew,
            fontSize: l.strong ? 58 : 44,
            fontWeight: l.strong ? 600 : 400,
            color: l.strong ? "#7d2a20" : "#26221c",
            direction: "rtl",
            textAlign: "right",
            height: 68,
            clipPath: `inset(0 0 0 ${(1 - k) * 100}%)`,
          }}
        >
          {l.text}
        </div>
      );
    })}
  </div>
);

// 456.74 - 475.56 and 484.36 - 495.52: the interview with Peter McGough.
export const Interview: React.FC<{ readonly part: 1 | 2 }> = ({ part }) => {
  const { n, t } = useShot();
  const lines =
    part === 1
      ? [
          { text: "פיטר מק׳גוף, עיתונאי", at: 458.5, strong: true },
          { text: "6 במרץ 1996", at: 459.7 },
          { text: "איך שומרים על חיטוב כזה?", at: 465.7 },
          { text: "תזונה קפדנית, כל השנה", at: 470.3 },
          { text: "אימונים בעקביות", at: 473.0 },
          { text: "גנטיקה", at: 474.6 },
        ]
      : [
          { text: "תוכניות לעתיד?", at: 486.1 },
          { text: "אין לו באמת תוכניות.", at: 489.9, strong: true },
          { text: "לא יודע מה יגיע בהמשך.", at: 493.4 },
        ];
  return (
    <Backdrop tone="warm" grid={false}>
      <Recorder t={t} playing={1} x={170} y={330} s={1.1} />
      <Notebook lines={lines} n={n} x={1000} y={130} />
    </Backdrop>
  );
};

// 914.02 - 928.4: the same tape, remembered.
export const TapeAgain: React.FC = () => {
  const { n, t } = useShot();
  const play = ramp(n, 918.2, 918.8);
  const stop = ramp(n, 927.6, 928.2);
  const line = ramp(n, 923.5, 924.6, EASE.out);
  return (
    <Backdrop tone="black" grid={false}>
      <AbsoluteFill style={{ background: "radial-gradient(40% 50% at 50% 45%, rgba(220,200,160,0.12), transparent)" }} />
      <Recorder t={t} playing={play * (1 - stop)} x={540} y={200} s={1.5} label="מק׳גוף · 6.3.1996" />
      <Txt k={line} x={960} y={820} size={52} font="serif" width={1400} color={INK.paper}>
        אין לו באמת תוכניות.
      </Txt>
    </Backdrop>
  );
};

// 475.56 - 484.36: staying near competition weight.
export const WeightLine: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 475.5, 476.6, EASE.out);
  const drawA = ramp(n, 477.4, 479.7, EASE.inOut);
  const drawB = ramp(n, 479.9, 482.2, EASE.inOut);
  const drop = ramp(n, 481.3, 482.6);
  const X0 = 260;
  const X1 = 1660;
  const band = 640;
  const yo: [number, number][] = [];
  const steady: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const x = lerp(X1, X0, i / 12);
    yo.push([x, band - 30 - (i % 4 === 3 ? 0 : 140 + (i % 4) * 40)]);
    steady.push([x, band - 30 - (i % 4 === 3 ? 0 : 30)]);
  }
  const path = (pts: [number, number][]) => smooth(pts);
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
        <rect x={X0} y={band - 60} width={X1 - X0} height={60} fill="rgba(217,164,90,0.16)" />
        <line x1={X0} y1={band} x2={X1} y2={band} stroke={INK.amber} strokeWidth={2} />
        <path d={path(yo)} fill="none" stroke={drop > 0 ? "rgba(200,64,46,0.9)" : "#6c7378"} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drawB} />
        <path d={path(steady)} fill="none" stroke={INK.amber} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drawA} />
      </svg>
      <Txt k={k} x={X1} y={band + 20} align="right" size={36} width={600} color={INK.amber}>
        משקל התחרות
      </Txt>
      <Txt k={drawA} x={X1} y={160} align="right" size={44} width={700}>
        אנדריאס: קרוב למשקל התחרות
      </Txt>
      <Txt k={drawB} x={X1} y={230} align="right" size={36} width={900} color="#8b9296">
        ירידה חדה לפני כל הופעה
      </Txt>
    </Backdrop>
  );
};

// 384.56 - 396.12 and 511.6 - 517.7: abdominal pain that kept coming back,
// and then would not stop.
export const PainBody: React.FC<{
  readonly start: number;
  readonly painAt: number;
  readonly ticksAt?: number;
  readonly monthsAt?: number;
  readonly swellAt?: number;
  readonly labelAt?: number;
}> = ({ start, painAt, ticksAt, monthsAt, swellAt, labelAt }) => {
  const { n, t } = useShot();
  const k = ramp(n, start, start + 0.9, EASE.out);
  const pain = ramp(n, painAt, painAt + 0.6);
  const ticks = ticksAt !== undefined ? ramp(n, ticksAt, ticksAt + 1.7) : 0;
  const swell = swellAt !== undefined ? ramp(n, swellAt, swellAt + 1.0, EASE.out) : 0;
  const rate = 5 + swell * 4;
  const beat = Math.max(0, Math.sin(t * rate)) * pain;
  return (
    <Backdrop tone={swell > 0.5 ? "red" : "clinic"}>
      <BodyMap k={k} x={760} y={60} pulse={beat * (1 + swell)} state={{ gut: [pain, pain] }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {pain > 0
          ? [0, 1, 2].map((i) => {
              const ph = (t * (0.8 + swell * 0.6) + i / 3) % 1;
              return (
                <circle
                  key={i}
                  cx={960}
                  cy={60 + 452}
                  r={(60 + ph * 160) * (1 + swell * 0.4)}
                  fill="none"
                  stroke={INK.damageGlow}
                  strokeWidth={3 + swell * 2}
                  opacity={(1 - ph) * 0.6 * pain}
                />
              );
            })
          : null}
        {ticks > 0 ? (
          <g opacity={ticks}>
            <line x1={260} y1={1000} x2={1660} y2={1000} stroke={INK.clinicDim} strokeWidth={2} />
            {Array.from({ length: 22 }, (_, i) => {
              const x = 1660 - i * 64;
              const show = ramp(n, ticksAt! + i * 0.12, ticksAt! + 0.3 + i * 0.12);
              const h = hash(i * 3.3) > 0.45 ? 26 + hash(i) * 40 : 8;
              return <rect key={i} x={x - 4} y={1000 - h * show} width={8} height={h * show} fill={h > 10 ? INK.damageGlow : INK.clinicDim} />;
            })}
          </g>
        ) : null}
      </svg>
      <Txt k={labelAt !== undefined ? ramp(n, labelAt, labelAt + 0.6) : 0} x={430} y={470} size={48} width={600} color={INK.damageGlow}>
        כאבי בטן
      </Txt>
      <Txt k={monthsAt !== undefined ? ramp(n, monthsAt, monthsAt + 0.7) : 0} x={1660} y={920} align="right" size={36} width={500} color={INK.textDim}>
        חודשים
      </Txt>
      <Txt k={swell} x={430} y={470} size={48} width={600} color={INK.damageGlow}>
        בלתי נסבל
      </Txt>
    </Backdrop>
  );
};

// 401.72 - 407.16: weighing food, planning workouts, checking the mirror.
export const Routine: React.FC = () => {
  const { n } = useShot();
  const a = ramp(n, 401.7, 402.4, EASE.out);
  const b = ramp(n, 403.2, 403.9, EASE.out);
  const c = ramp(n, 404.7, 405.4, EASE.out);
  const panel = (i: number, k: number, label: string, icon: React.ReactNode) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: 1340 - i * 520 - 200,
        top: 260,
        width: 400,
        height: 500,
        opacity: k,
        transform: `translateY(${(1 - k) * 30}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
      }}
    >
      <svg width={320} height={320} viewBox="0 0 320 320">
        {icon}
      </svg>
      <div style={{ fontFamily: TYPE.hebrew, fontSize: 44, color: INK.text, direction: "rtl" }}>{label}</div>
    </div>
  );
  const S = { fill: "none", stroke: INK.clinic, strokeWidth: 5, strokeLinecap: "round" as const };
  return (
    <Backdrop>
      {panel(
        0,
        a,
        "שוקלים את האוכל",
        <g>
          <ellipse cx={160} cy={130} rx={110} ry={26} {...S} />
          <path d="M 70 130 C 90 170 230 170 250 130" {...S} />
          <rect x={80} y={190} width={160} height={90} rx={14} {...S} />
          <text x={160} y={250} textAnchor="middle" fontFamily={TYPE.hebrew} fontSize={40} fill={INK.clinicGlow}>
            {Math.round(lerp(0, 180, ramp(n, 402.2, 403.0)))}g
          </text>
        </g>,
      )}
      {panel(
        1,
        b,
        "מתכננים כל אימון",
        <g>
          <rect x={40} y={50} width={240} height={220} rx={10} {...S} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={62 + (i % 4) * 54}
              y={90 + Math.floor(i / 4) * 56}
              width={40}
              height={40}
              rx={6}
              fill={ramp(n, 403.6 + i * 0.05, 403.8 + i * 0.05) > 0.5 ? "rgba(127,184,179,0.5)" : "none"}
              stroke={INK.clinicDim}
              strokeWidth={2}
            />
          ))}
        </g>,
      )}
      {panel(
        2,
        c,
        "בודקים כל שינוי",
        <g>
          <rect x={80} y={20} width={160} height={280} rx={80} {...S} />
          <circle cx={160} cy={100} r={22} fill="none" stroke={INK.clinicDim} strokeWidth={3} />
          <path d="M 118 250 C 118 170 132 140 160 136 C 188 140 202 170 202 250" fill="none" stroke={INK.clinicDim} strokeWidth={3} />
        </g>,
      )}
    </Backdrop>
  );
};

// 306.8 - 321.14: a little further each time, until the body runs out.
export const FatStairs: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 306.7, 307.6, EASE.out);
  const steps = [307.9, 311.1, 312.8, 314.6, 318.9];
  const floor = ramp(n, 316.5, 317.3);
  const X0 = 1660;
  const stepW = 260;
  let y = 260;
  const pts: string[] = [`${X0},${y}`];
  let x = X0;
  steps.forEach((at, i) => {
    const s = ramp(n, at, at + 0.5, EASE.out);
    const nx = x - stepW;
    pts.push(`${x - stepW * 0.15},${y}`);
    const drop = (i < 4 ? 120 : 90) * s;
    pts.push(`${x - stepW * 0.15},${y + drop}`);
    y += drop;
    x = nx;
    pts.push(`${x},${y}`);
  });
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
        <line x1={260} y1={260} x2={260} y2={900} stroke={INK.clinicDim} strokeWidth={2} />
        <polyline points={pts.join(" ")} fill="none" stroke={INK.fat} strokeWidth={6} strokeLinejoin="round" />
        {floor > 0 ? (
          <g opacity={floor}>
            <rect x={200} y={830} width={1520} height={8} fill={INK.damageGlow} />
            <rect x={200} y={838} width={1520} height={120} fill="rgba(200,64,46,0.12)" />
          </g>
        ) : null}
      </svg>
      <Txt k={k} x={1700} y={170} align="right" size={36} width={600} color={INK.fat}>
        אחוז שומן
      </Txt>
      <Txt k={ramp(n, 311.0, 311.5)} x={1240} y={430} size={34} width={400} color={INK.textDim}>
        עוד קצת
      </Txt>
      <Txt k={ramp(n, 312.8, 313.3)} x={980} y={550} size={34} width={400} color={INK.textDim}>
        עוד קצת
      </Txt>
      <Txt k={ramp(n, 314.6, 315.1)} x={720} y={670} size={34} width={400} color={INK.textDim}>
        עוד קצת
      </Txt>
      <Txt k={floor} x={960} y={880} size={42} width={1200} color={INK.damageGlow}>
        הגוף לא נועד להמשיך בלי סוף
      </Txt>
    </Backdrop>
  );
};

// 321.14 - 330.18: what fat is for.
export const FatRoles: React.FC = () => {
  const { n, t } = useShot();
  const k = ramp(n, 321.1, 322.0, EASE.out);
  const vital = ramp(n, 324.4, 325.0);
  const roles = [
    { text: "ייצור הורמונים", at: 326.6, a: -Math.PI / 2 - 0.9 },
    { text: "אגירת אנרגיה", at: 327.9, a: -Math.PI / 2 + 0.9 },
    { text: "הגנה על איברים", at: 328.9, a: Math.PI / 2 },
  ];
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 19 }, (_, i) => {
          const ring = i === 0 ? 0 : i < 7 ? 1 : 2;
          const idx = i === 0 ? 0 : i < 7 ? i - 1 : i - 7;
          const cnt = ring === 1 ? 6 : 12;
          const ang = (idx / cnt) * Math.PI * 2 + ring * 0.3;
          const R = ring * 78;
          return (
            <circle
              key={i}
              cx={960 + Math.cos(ang) * R}
              cy={540 + Math.sin(ang) * R + Math.sin(t + i) * 2}
              r={40 * k}
              fill="rgba(216,178,90,0.55)"
              stroke="#f0d48a"
              strokeWidth={2}
            />
          );
        })}
        {roles.map((r) => {
          const rk = ramp(n, r.at, r.at + 0.5, EASE.out);
          return (
            <line
              key={r.text}
              x1={960 + Math.cos(r.a) * 220}
              y1={540 + Math.sin(r.a) * 220}
              x2={960 + Math.cos(r.a) * lerp(220, 340, rk)}
              y2={540 + Math.sin(r.a) * lerp(220, 340, rk)}
              stroke={INK.fat}
              strokeWidth={2}
              opacity={rk}
            />
          );
        })}
      </svg>
      <Txt k={vital} x={960} y={70} size={56} width={800} color={INK.fat}>
        שומן חיוני
      </Txt>
      {roles.map((r) => (
        <Txt
          key={r.text}
          k={ramp(n, r.at, r.at + 0.5, EASE.out)}
          x={960 + Math.cos(r.a) * 440}
          y={540 + Math.sin(r.a) * 380 - 28}
          size={44}
          width={520}
        >
          {r.text}
        </Txt>
      ))}
    </Backdrop>
  );
};

// 330.18 - 340.92: the lower the fat, the steeper the risk.
export const RiskCurve: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 330.1, 331.0, EASE.out);
  const a = ramp(n, 331.9, 336.4, EASE.inOut);
  const b = ramp(n, 337.6, 339.9, EASE.inOut);
  const X0 = 300;
  const X1 = 1620;
  const Y0 = 860;
  const curve = (steep: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      pts.push([lerp(X0, X1, u), Y0 - Math.pow(u, 3.2 - steep) * (520 + steep * 140) - u * 40]);
    }
    return smooth(pts);
  };
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
        <line x1={X0} y1={Y0} x2={X1 + 40} y2={Y0} stroke={INK.clinicDim} strokeWidth={2} />
        <line x1={X0} y1={Y0} x2={X0} y2={200} stroke={INK.clinicDim} strokeWidth={2} />
        <path d={`M ${X1 + 40} ${Y0} l -18 -10 l 0 20 z`} fill={INK.clinicDim} />
        <path d={curve(0)} fill="none" stroke={INK.fat} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - a} />
        <path d={curve(1.2)} fill="none" stroke={INK.damageGlow} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - b} />
      </svg>
      <Txt k={k} x={X1} y={Y0 + 24} align="right" size={36} width={700} color={INK.textDim}>
        פחות שומן ←
      </Txt>
      <Txt k={k} x={X0 - 20} y={190} align="right" size={36} width={300} color={INK.textDim}>
        סיכון
      </Txt>
      <Txt k={ramp(n, 335.1, 335.8)} x={1400} y={330} size={40} width={500} color={INK.fat}>
        קשה ומסוכן
      </Txt>
      <Txt k={ramp(n, 338.8, 339.5)} x={1040} y={190} size={40} width={900} color={INK.damageGlow}>
        + חומרים משפרי ביצועים
      </Txt>
    </Backdrop>
  );
};

// 348.1 - 368.0: what was in use, what it was for, and where it lands.
export const SubstanceMap: React.FC = () => {
  const { n, t } = useShot();
  const listOut = ramp(n, 357.4, 358.2);
  const items = [
    { text: "סטרואידים אנבוליים", at: 348.1 },
    { text: "הורמונים", at: 349.6 },
    { text: "תרופות משתנות", at: 350.6 },
    { text: "חומרים נוספים", at: 351.7 },
  ];
  const aims = [
    { text: "מסת שריר", at: 354.1 },
    { text: "נוזלים בגוף", at: 355.2 },
    { text: "מראה חיצוני", at: 356.5 },
  ];
  const body = ramp(n, 357.9, 358.8, EASE.out);
  const risk = ramp(n, 364.5, 366.9, EASE.inOut);
  return (
    <Backdrop>
      <AbsoluteFill style={{ opacity: 1 - listOut }}>
        {items.map((it, i) => (
          <Txt key={it.text} k={ramp(n, it.at, it.at + 0.5, EASE.out)} x={1560} y={250 + i * 120} align="right" size={58} width={800}>
            {it.text}
          </Txt>
        ))}
        {aims.map((it, i) => (
          <Txt key={it.text} k={ramp(n, it.at, it.at + 0.5, EASE.out)} x={560} y={320 + i * 140} size={46} width={600} color={INK.amber}>
            {it.text}
          </Txt>
        ))}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line x1={820} y1={540} x2={1000} y2={540} stroke={INK.amber} strokeWidth={2} opacity={ramp(n, 353.4, 354.0)} />
          <path d="M 820 540 l 16 -10 l 0 20 z" fill={INK.amber} opacity={ramp(n, 353.4, 354.0)} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: body }}>
        <BodyMap
          k={body}
          x={760}
          y={80}
          pulse={Math.max(0, Math.sin(t * 6)) * risk}
          state={{
            heart: [ramp(n, 362.0, 362.5), ramp(n, 362.0, 362.5)],
            liver: [ramp(n, 362.7, 363.2), ramp(n, 362.7, 363.2)],
            kidneys: [ramp(n, 363.4, 363.9), ramp(n, 363.4, 363.9)],
          }}
        />
        <Txt k={ramp(n, 362.0, 362.5)} x={1420} y={300} size={44} width={400} color={INK.damageGlow}>
          לב
        </Txt>
        <Txt k={ramp(n, 362.7, 363.2)} x={480} y={360} size={44} width={400} color={INK.damageGlow}>
          כבד
        </Txt>
        <Txt k={ramp(n, 363.4, 363.9)} x={1420} y={440} size={44} width={400} color={INK.damageGlow}>
          כליות
        </Txt>
        <div
          style={{
            position: "absolute",
            left: 360,
            top: 880,
            width: 1200,
            height: 18,
            borderRadius: 9,
            background: "rgba(255,255,255,0.06)",
            opacity: ramp(n, 364.4, 364.9),
          }}
        >
          <div style={{ width: `${risk * 100}%`, height: "100%", borderRadius: 9, background: `linear-gradient(to left, ${INK.damageGlow}, ${INK.fat})`, marginLeft: "auto" }} />
        </div>
        <Txt k={ramp(n, 365.9, 366.5)} x={960} y={920} size={38} width={800} color={INK.textDim}>
          הסיכון עלול לגדול
        </Txt>
      </AbsoluteFill>
    </Backdrop>
  );
};

// 522.04 - 524.22: rushed into hospital. Seen from a trolley: ceiling
// lights passing overhead, a blue light on the walls.
export const Corridor: React.FC = () => {
  const { t } = useShot();
  const speed = 1.3;
  const panels = Array.from({ length: 6 }, (_, i) => {
    const u = (i / 6 + t * speed * 0.35) % 1; // 0 far, 1 overhead
    const persp = 0.25 + u * u * 2.4;
    return { u, persp };
  });
  const siren = Math.max(0, Math.sin(t * 10));
  return (
    <AbsoluteFill style={{ background: "#05080a", overflow: "hidden" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="ceil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2427" />
            <stop offset="100%" stopColor="#080c0e" />
          </linearGradient>
        </defs>
        <polygon points="0,1080 1920,1080 1260,380 660,380" fill="url(#ceil)" />
        <line x1={0} y1={1080} x2={660} y2={380} stroke="#24302f" strokeWidth={3} />
        <line x1={1920} y1={1080} x2={1260} y2={380} stroke="#24302f" strokeWidth={3} />
        {panels.map(({ u, persp }, i) => {
          const y = 380 + u * u * 900;
          const w = 220 * persp;
          const h = 40 * persp;
          return (
            <g key={i} opacity={Math.min(1, u * 3)}>
              <rect x={960 - w / 2} y={y - h / 2} width={w} height={h} rx={6} fill="#e8f6f4" style={{ filter: `blur(${2 + persp * 3}px)` }} />
            </g>
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, rgba(40,90,220,${0.35 * siren}) 0%, transparent 30%, transparent 70%, rgba(40,90,220,${0.35 * siren}) 100%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(80% 80% at 50% 60%, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
    </AbsoluteFill>
  );
};

// 814.92 - 837.06: reports after his death; lists that were never verified.
export const Reports: React.FC = () => {
  const { n } = useShot();
  const sheets = Array.from({ length: 6 }, (_, i) => ({
    at: 816.0 + i * 0.35,
    x: 520 + hash(i * 3) * 700,
    y: 160 + hash(i * 5) * 330,
    r: (hash(i * 7) - 0.5) * 16,
  }));
  const list = ramp(n, 825.8, 826.8, EASE.out);
  const stamp = ramp(n, 830.1, 830.5, EASE.out);
  const out = ramp(n, 835.0, 836.4);
  return (
    <Backdrop tone="warm" grid={false}>
      <AbsoluteFill style={{ opacity: 1 - out * 0.8 }}>
        {sheets.map((s, i) => {
          const k = ramp(n, s.at, s.at + 0.5, EASE.out);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y + (1 - k) * 60,
                width: 520,
                height: 360,
                background: "#e3dccb",
                transform: `rotate(${s.r}deg)`,
                opacity: k * (1 - list * 0.5),
                boxShadow: "0 18px 50px rgba(0,0,0,0.6)",
                padding: 34,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                alignItems: "flex-end",
              }}
            >
              <div style={{ width: 380, height: 26, background: "#3a352c", opacity: 0.7 }} />
              {Array.from({ length: 7 }, (_, j) => (
                <div key={j} style={{ width: 300 + hash(i * 10 + j) * 150, height: 10, background: "#8a8272", opacity: 0.5 }} />
              ))}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 640,
            top: lerp(1100, 120, list),
            width: 640,
            height: 840,
            background: "#efe8d8",
            boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
            padding: "60px 56px",
            display: "flex",
            flexDirection: "column",
            gap: 26,
            alignItems: "flex-end",
          }}
        >
          {Array.from({ length: 15 }, (_, j) => (
            <div key={j} style={{ display: "flex", gap: 30, flexDirection: "row-reverse" }}>
              <div style={{ width: 210 + hash(j * 4) * 120, height: 14, background: "#5a5346", opacity: 0.55, filter: "blur(2px)" }} />
              <div style={{ width: 90, height: 14, background: "#5a5346", opacity: 0.4, filter: "blur(2px)" }} />
            </div>
          ))}
          {stamp > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 120,
                top: 330,
                padding: "16px 40px",
                border: "8px solid #a32a1c",
                color: "#a32a1c",
                fontFamily: TYPE.hebrew,
                fontWeight: 700,
                fontSize: 80,
                direction: "rtl",
                transform: `rotate(-14deg) scale(${lerp(1.6, 1, stamp)})`,
                opacity: stamp * 0.9,
              }}
            >
              לא אומת
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

// 847.88 - 874.0: what each class of drug offers, and what it costs.
export const Ledger: React.FC = () => {
  const { n } = useShot();
  const row = (y: number, name: string, nameAt: number, plus: string, plusAt: number, minus: string, minusAt: number) => (
    <>
      <Txt k={ramp(n, nameAt, nameAt + 0.5, EASE.out)} x={1700} y={y} align="right" size={52} width={600}>
        {name}
      </Txt>
      <Txt k={ramp(n, plusAt, plusAt + 0.5, EASE.out)} x={1080} y={y} align="right" size={44} width={460} color={INK.amber}>
        {plus}
      </Txt>
      <Txt k={ramp(n, minusAt, minusAt + 0.5, EASE.out)} x={560} y={y} align="right" size={44} width={460} color={INK.damageGlow}>
        {minus}
      </Txt>
    </>
  );
  const stack = ramp(n, 867.0, 867.6);
  const top = 1 - stack;
  const blocks = [
    { text: "חומרים", at: 868.6 },
    { text: "תזונה מגבילה", at: 869.7 },
    { text: "אימונים אינטנסיביים", at: 870.6 },
  ];
  const wobble = ramp(n, 872.0, 873.2);
  return (
    <Backdrop>
      <AbsoluteFill style={{ opacity: top }}>
        {row(300, "סטרואידים אנבוליים", 847.8, "+ מסת שריר", 849.6, "− לב, כבד", 852.1)}
        {row(560, "תרופות משתנות", 855.3, "+ מראה מוגדר", 859.7, "− מלחים, כליות", 862.8)}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line x1={240} y1={470} x2={1700} y2={470} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: stack }}>
        {blocks.map((b, i) => {
          const k = ramp(n, b.at, b.at + 0.5, EASE.out);
          const sway = Math.sin(n * 6 + i) * 10 * wobble * (i + 1) * 0.6;
          return (
            <div
              key={b.text}
              style={{
                position: "absolute",
                left: 960 - 300 + sway,
                top: 760 - i * 170 - (1 - k) * 120,
                width: 600,
                height: 150,
                borderRadius: 10,
                background: i === 0 ? "rgba(200,64,46,0.3)" : i === 1 ? "rgba(216,178,90,0.3)" : "rgba(127,184,179,0.3)",
                border: `2px solid ${i === 0 ? INK.damage : i === 1 ? INK.fat : INK.clinic}`,
                opacity: k,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: TYPE.hebrew,
                fontSize: 46,
                color: INK.text,
                direction: "rtl",
                transform: `rotate(${sway * 0.15}deg)`,
              }}
            >
              {b.text}
            </div>
          );
        })}
        <Txt k={ramp(n, 872.0, 872.6)} x={960} y={120} size={50} width={900} color={INK.damageGlow}>
          הסיכונים מצטברים
        </Txt>
      </AbsoluteFill>
    </Backdrop>
  );
};

// 882.44 - 896.04: the loop that rewards going further.
export const Loop: React.FC = () => {
  const { n, t } = useShot();
  const items = [
    { text: "גדול יותר", at: 883.2 },
    { text: "חטוב יותר", at: 884.1 },
    { text: "מרשים יותר", at: 884.9 },
    { text: "תשומת לב", at: 887.2 },
    { text: "חשיפה", at: 888.4 },
    { text: "הזדמנויות", at: 889.5 },
  ];
  const spin = ramp(n, 890.4, 895.2, EASE.in);
  const R = 360;
  const rot = spin * Math.PI * 2 * 1.5;
  const q = ramp(n, 894.9, 895.5, EASE.out);
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <circle cx={960} cy={540} r={R} fill="none" stroke={INK.clinicDim} strokeWidth={2} strokeDasharray="6 12" transform={`rotate(${(rot * 180) / Math.PI + t * 6} 960 540)`} />
      </svg>
      {items.map((it, i) => {
        const ang = -Math.PI / 2 + (i / items.length) * Math.PI * 2 * -1 + rot;
        return (
          <Txt
            key={it.text}
            k={ramp(n, it.at, it.at + 0.5, EASE.out)}
            x={960 + Math.cos(ang) * R}
            y={540 + Math.sin(ang) * R - 30}
            size={46}
            width={420}
            color={i < 3 ? INK.amber : INK.text}
          >
            {it.text}
          </Txt>
        );
      })}
      <Txt k={q} x={960} y={470} size={150} weight={300} width={400} color={INK.damageGlow}>
        ?
      </Txt>
    </Backdrop>
  );
};

// 936.34 - 941.46: a wreath from Arnold Schwarzenegger.
export const Wreath: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 936.2, 937.6, EASE.out);
  const cap = ramp(n, 939.5, 940.2, EASE.out);
  const leaves = 64;
  return (
    <Backdrop tone="black" grid={false}>
      <AbsoluteFill style={{ background: "radial-gradient(40% 50% at 50% 45%, rgba(200,190,160,0.12), transparent)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: leaves }, (_, i) => {
          const a = (i / leaves) * Math.PI * 2;
          const show = ramp(k, i / leaves * 0.8, i / leaves * 0.8 + 0.2);
          const r = 250 + (hash(i) - 0.5) * 30;
          const x = 960 + Math.cos(a) * r;
          const y = 470 + Math.sin(a) * r;
          return (
            <g key={i} opacity={show}>
              <ellipse cx={x} cy={y} rx={46} ry={16} fill={i % 3 ? "#2f4a33" : "#3e5e40"} transform={`rotate(${(a * 180) / Math.PI + 60} ${x} ${y})`} />
              {i % 5 === 0 ? <circle cx={x} cy={y} r={14} fill="#e8e2d4" /> : null}
            </g>
          );
        })}
        <g opacity={k}>
          <path d="M 900 720 L 860 900 L 900 880 L 920 910 L 950 730 Z" fill="#e7e1d3" />
          <path d="M 1020 720 L 1060 900 L 1020 880 L 1000 910 L 970 730 Z" fill="#e7e1d3" />
        </g>
      </svg>
      <Txt k={cap} x={960} y={950} size={50} font="serif" width={1200} color={INK.paper}>
        פרידה אחרונה מחבר
      </Txt>
    </Backdrop>
  );
};

// 956.5 - 969.0: his pictures still circulate.
export const Feed: React.FC<{ readonly stills: readonly string[] }> = ({ stills }) => {
  const { t } = useShot();
  const cols = 4;
  const tile = 380;
  const gap = 26;
  const scroll = t * 70;
  return (
    <Backdrop tone="black" grid={false}>
      <div style={{ position: "absolute", left: (1920 - (cols * tile + (cols - 1) * gap)) / 2, top: 80 - scroll }}>
        {Array.from({ length: 16 }, (_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c * (tile + gap),
                top: r * (tile + gap),
                width: tile,
                height: tile,
                borderRadius: 10,
                overflow: "hidden",
                opacity: ramp(t, i * 0.08, i * 0.08 + 0.4),
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}
            >
              <Img src={staticFile(`munzer/stills/${stills[i % stills.length]}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75) brightness(0.85)" }} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,6,7,0.95) 0%, transparent 18%, transparent 82%, rgba(5,6,7,0.95) 100%)" }} />
    </Backdrop>
  );
};

/** The series title, as in the Gacy episode. Plays inside the TITLE insert. */
export const TitleCard: React.FC = () => {
  const { t, dur } = useShot();
  const k = win(t, 0.3, 1.7, dur - 1.1, dur - 0.1);
  const k2 = win(t, 1.0, 2.3, dur - 1.1, dur - 0.1);
  return (
    <Backdrop tone="black" grid={false}>
      <AbsoluteFill style={{ background: `radial-gradient(35% 45% at 50% 46%, rgba(217,164,90,${0.1 * k}) 0%, transparent 100%)` }} />
      <Dust t={t + 30} count={30} k={k} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, translate: `0px ${-30 + (1 - k) * 10}px` }}>
          <div style={{ fontFamily: TYPE.serif, fontSize: 34, letterSpacing: 10, color: "#d9c9a8", opacity: k2 * 0.85, direction: "rtl" }}>
            מאחורי הסיוט
          </div>
          <div style={{ width: 140 * k2, height: 1.5, background: "#c89a5a", opacity: 0.8 }} />
          <div style={{ fontFamily: TYPE.serif, fontWeight: 600, fontSize: 112, color: "#f4eee2", opacity: k, direction: "rtl", textShadow: "0 4px 40px rgba(0,0,0,0.75)" }}>
            אנדריאס מינצר
          </div>
          <div style={{ fontFamily: TYPE.serif, fontSize: 38, color: INK.textDim, opacity: k2, direction: "ltr", letterSpacing: 4 }}>
            1964 – 1996
          </div>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

/** 1019.74 - end: "זה היה הסיפור של אנדריאס מינצר, ואתם צפיתם במאחורי הסיוט." */
export const EndCard: React.FC = () => {
  const { n, t, dur } = useShot();
  const a = ramp(n, 1021.2, 1022.4, EASE.out);
  const b = ramp(n, 1024.0, 1025.2, EASE.out);
  const out = ramp(t, dur - 1.4, dur - 0.1);
  const credit = ramp(n, 1025.4, 1025.83) * (1 - out);
  return (
    <Backdrop tone="black" grid={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - out }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ fontFamily: TYPE.serif, fontSize: 34, letterSpacing: 10, color: "#d9c9a8", opacity: b * 0.9, direction: "rtl" }}>
            מאחורי הסיוט
          </div>
          <div style={{ width: 140 * Math.max(a, b), height: 1.5, background: "#c89a5a", opacity: 0.8 }} />
          <div style={{ fontFamily: TYPE.serif, fontWeight: 600, fontSize: 100, color: "#f4eee2", opacity: a, direction: "rtl" }}>
            אנדריאס מינצר
          </div>
          <div style={{ fontFamily: TYPE.serif, fontSize: 36, color: INK.textDim, opacity: a, direction: "ltr", letterSpacing: 4 }}>
            1964 – 1996
          </div>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: TYPE.hebrew,
          fontSize: 24,
          color: INK.textDim,
          opacity: credit * 0.8,
          direction: "rtl",
        }}
      >
        {"חומרי ארכיון: שידורי תחרויות IFBB ו־ESPN, \u20661990–1996\u2069 · צילום ביתי, אוסטריה 1988"}
      </div>
    </Backdrop>
  );
};
