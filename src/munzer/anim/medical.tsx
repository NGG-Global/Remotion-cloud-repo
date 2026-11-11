import React from "react";
import { AbsoluteFill } from "remotion";
import { useShot } from "../engine/shot";
import { EASE, clamp, hash, lerp, ramp, win } from "../engine/time";
import { INK, TYPE } from "../theme";
import {
  Backdrop,
  BodyMap,
  Draw,
  HeartPlate,
  KIDNEY,
  KIDNEY_HILUM,
  LIVER,
  LiverPlate,
  LUNG_L,
  LUNG_R,
  TRACHEA,
  Tag,
  Txt,
  countTo,
  scatter,
} from "./kit";

/*
 * The medical plates. Every beat is keyed to the narration time `n` of the
 * word that names it (times measured on the voice track), so a number lands
 * on the syllable that says it.
 */

const beatOf = (t: number, period = 0.86): number => {
  const ph = (t % period) / period;
  return Math.max(0, Math.sin(ph * Math.PI * 2) * (ph < 0.5 ? 1 : 0.4));
};

// 44.38 - 60.34: "הלב שלו שוקל 636 גרם ... פי שניים מלב ממוצע"
export const HeartWeigh: React.FC = () => {
  const { n, t } = useShot();
  const draw = ramp(n, 44.3, 45.6, EASE.out);
  const grams = countTo(n, 45.6, 46.9, 636);
  const ghost = ramp(n, 49.8, 51.0, EASE.out);
  const normal = countTo(n, 52.5, 53.1, 300);
  const twice = ramp(n, 58.4, 59.2, EASE.out);
  const shift = ramp(n, 49.6, 50.8, EASE.inOut);
  const beat = beatOf(t) * (1 - ghost * 0.2);
  const bigX = lerp(760, 1040, shift);
  return (
    <Backdrop>
      <svg
        viewBox="0 0 400 440"
        width={560}
        height={616}
        style={{ position: "absolute", left: bigX, top: 150, overflow: "visible" }}
      >
        <HeartPlate
          k={draw}
          fillK={ramp(n, 45.2, 46.4)}
          beat={beat}
          color={twice > 0 ? INK.damageGlow : INK.clinicGlow}
          fill={twice > 0 ? `rgba(200,64,46,${0.12 + 0.18 * twice})` : "rgba(127,184,179,0.14)"}
        />
      </svg>
      <svg
        viewBox="0 0 400 440"
        width={290}
        height={319}
        style={{ position: "absolute", left: 470, top: 300, opacity: ghost * 0.85, overflow: "visible" }}
      >
        <HeartPlate k={ghost} fillK={ghost * 0.5} color={INK.clinicDim} beat={beatOf(t + 0.2) * 0.5} />
      </svg>
      <Txt k={ramp(n, 45.6, 46.0)} x={bigX + 280} y={800} size={120} weight={300} width={600}>
        {`${grams} ג׳`}
      </Txt>
      <Txt k={ramp(n, 52.5, 53.0)} x={615} y={680} size={72} weight={300} width={500} color={INK.textDim}>
        {`\u2066~${normal}\u2069 ג׳`}
      </Txt>
      <Txt k={ramp(n, 50.3, 51.0)} x={615} y={770} size={32} width={500} color={INK.textDim}>
        לב של גבר בוגר
      </Txt>
      <Txt k={twice} x={960} y={110} size={92} weight={500} color={INK.damageGlow} width={500}>
        פי 2
      </Txt>
    </Backdrop>
  );
};

/** Dots running out from the heart to the body: circulation. */
const FLOW: readonly (readonly [number, number])[][] = [
  [[214, 262], [250, 200], [300, 175], [330, 300], [345, 470]],
  [[214, 262], [180, 200], [110, 175], [70, 300], [55, 470]],
  [[214, 262], [210, 400], [235, 520], [255, 700], [258, 860]],
  [[214, 262], [195, 400], [165, 520], [145, 700], [142, 860]],
  [[214, 262], [205, 160], [200, 90]],
];
const along = (pts: readonly (readonly [number, number])[], u: number): [number, number] => {
  const segs = pts.length - 1;
  const f = clamp(u) * segs;
  const i = Math.min(segs - 1, Math.floor(f));
  const r = f - i;
  return [lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r)];
};

// 60.34 - 71.6: "זה האיבר שאמור להזרים דם לכל הגוף, בכל שנייה, בכל דקה, בכל יום, והוא מוגדל"
export const HeartPump: React.FC = () => {
  const { n, t } = useShot();
  const k = ramp(n, 60.3, 61.4, EASE.out);
  const flow = ramp(n, 62.9, 63.8);
  const enlarged = ramp(n, 68.8, 69.8, EASE.out);
  const beat = beatOf(t, 0.8);
  const x = 760;
  const y = 90;
  const s = 1;
  return (
    <Backdrop>
      <BodyMap
        k={k}
        x={x}
        y={y}
        scale={s}
        pulse={beat}
        state={{ heart: [k, enlarged] }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {flow > 0
          ? FLOW.flatMap((path, pi) =>
              Array.from({ length: 6 }, (_, j) => {
                const u = ((t * 0.32 + j / 6 + pi * 0.11) % 1) * flow;
                const [px, py] = along(path, u);
                return (
                  <circle
                    key={`${pi}-${j}`}
                    cx={x + px * s}
                    cy={y + py * s}
                    r={4}
                    fill={INK.damageGlow}
                    opacity={0.75 * flow * (1 - u * 0.6)}
                  />
                );
              }),
            )
          : null}
      </svg>
      <Txt k={ramp(n, 65.9, 66.3)} x={1500} y={330} size={54} weight={300} width={360}>
        שנייה
      </Txt>
      <Txt k={ramp(n, 67.1, 67.5)} x={1500} y={450} size={54} weight={300} width={360}>
        דקה
      </Txt>
      <Txt k={ramp(n, 68.2, 68.6)} x={1500} y={570} size={54} weight={300} width={360}>
        יום
      </Txt>
      <Txt k={enlarged} x={420} y={300} size={54} weight={400} width={480} color={INK.damageGlow}>
        מוגדל
      </Txt>
    </Backdrop>
  );
};

// 71.6 - 95.42: the liver, what it is for, and what was found in it.
export const LiverScene: React.FC = () => {
  const { n, t } = useShot();
  const draw = ramp(n, 71.6, 73.2, EASE.out);
  const funcs = 1 - ramp(n, 79.8, 80.4);
  const hurt = ramp(n, 80.3, 82.2);
  const tumors = scatter(9, 31, { x: 120, y: 90, w: 360, h: 150 });
  const foci = scatter(26, 77, { x: 90, y: 80, w: 440, h: 190 });
  const ball = ramp(n, 86.3, 87.0, EASE.out);
  const many = ramp(n, 92.8, 94.8);
  const L = { x: 410, y: 250, s: 1.8 };
  const P = (px: number, py: number): [number, number] => [L.x + px * L.s, L.y + py * L.s];
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${L.x} ${L.y}) scale(${L.s})`}>
          <LiverPlate
            k={draw}
            fillK={ramp(n, 72.4, 73.4)}
            color={hurt > 0.5 ? INK.damage : INK.clinicGlow}
            fill={`rgba(${Math.round(lerp(127, 150, hurt))},${Math.round(lerp(184, 60, hurt))},${Math.round(lerp(179, 50, hurt))},${0.12 + 0.12 * hurt})`}
          />
          {tumors.map((p, i) => {
            const gk = ramp(n, 83.4 + i * 0.16, 84.4 + i * 0.16, EASE.out);
            return gk > 0 ? (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={(10 + 10 * p.s) * gk}
                fill="rgba(235,215,190,0.22)"
                stroke={INK.damageGlow}
                strokeWidth={1.4}
              />
            ) : null;
          })}
          {foci.map((p, i) => {
            const gk = ramp(n, 92.8 + (i % 10) * 0.12, 93.6 + (i % 10) * 0.12, EASE.out) * many;
            return gk > 0 ? (
              <circle key={`f${i}`} cx={p.x} cy={p.y} r={4 * p.s * gk} fill={INK.damageGlow} opacity={0.7} />
            ) : null;
          })}
        </g>
        {ball > 0 ? (
          <g opacity={ball}>
            <circle cx={P(tumors[0].x, 0)[0] + 640} cy={430} r={58} fill="#f4f1ea" />
            <circle cx={P(tumors[0].x, 0)[0] + 622} cy={410} r={18} fill="#ffffff" opacity={0.8} />
          </g>
        ) : null}
      </svg>
      <Tag k={ramp(n, 75.1, 75.7) * funcs} x={P(150, 120)[0]} y={P(150, 120)[1]} tx={300} ty={180} text="עיבוד חומרים" />
      <Tag k={ramp(n, 76.3, 76.9) * funcs} x={P(300, 90)[0]} y={P(300, 90)[1]} tx={1500} ty={180} text="ויסות תהליכים" />
      <Tag k={ramp(n, 77.9, 78.5) * funcs} x={P(260, 240)[0]} y={P(260, 240)[1]} tx={1500} ty={900} text="סילוק תוצרי פירוק" />
      <Txt k={ramp(n, 83.9, 84.5) * (1 - ramp(n, 88.4, 89.0))} x={960} y={900} size={46} color={INK.damageGlow} width={700}>
        גידולים
      </Txt>
      <Txt k={ball * (1 - ramp(n, 88.4, 89.0))} x={1660} y={520} size={34} color={INK.textDim} width={420}>
        כדור פינג־פונג
      </Txt>
      <Txt k={many} x={960} y={900} size={46} color={INK.damageGlow} width={900}>
        מוקדים של גדילה חריגה
      </Txt>
      {t < 0 ? null : null}
    </Backdrop>
  );
};

// 95.42 - 101.53: "והפגיעה בו ... קשורה לקריסת המערכות שהובילה למותו"
export const SystemsCollapse: React.FC = () => {
  const { n, t } = useShot();
  const k = ramp(n, 95.3, 96.2, EASE.out);
  const d = (at: number) => ramp(n, at, at + 0.5);
  return (
    <Backdrop tone="red">
      <BodyMap
        k={k}
        pulse={beatOf(t, 0.7)}
        state={{
          liver: [1, 1],
          heart: [d(97.6), d(98.3)],
          kidneys: [d(97.8), d(98.7)],
          lungs: [d(98.0), d(99.0)],
          gut: [d(98.2), d(99.3)],
        }}
      />
      <Txt k={ramp(n, 98.7, 99.3)} x={1440} y={480} size={50} color={INK.damageGlow} width={560}>
        קריסת מערכות
      </Txt>
    </Backdrop>
  );
};

// 599.42 - 613.64: the heart as numbers.
export const HeartBars: React.FC = () => {
  const { n } = useShot();
  const scale = 1.55; // px per gram
  const a = ramp(n, 600.8, 601.9, EASE.out);
  const b = ramp(n, 607.1, 608.4, EASE.out);
  const x2 = ramp(n, 611.5, 612.4, EASE.out);
  const right = 1640;
  const bar = (y: number, w: number, color: string, k: number, band?: number) => (
    <>
      <div
        style={{
          position: "absolute",
          top: y,
          left: right - w * k,
          width: w * k,
          height: 70,
          background: color,
          borderRadius: 4,
        }}
      />
      {band ? (
        <div
          style={{
            position: "absolute",
            top: y,
            left: right - band * k,
            width: (band - w) * k,
            height: 70,
            background: color,
            opacity: 0.4,
            borderRadius: 4,
          }}
        />
      ) : null}
    </>
  );
  return (
    <Backdrop>
      <Txt k={ramp(n, 599.4, 600.0)} x={right} y={250} align="right" size={40} width={800} color={INK.textDim}>
        הלב של אנדריאס
      </Txt>
      {bar(310, 636 * scale, INK.damage, a)}
      <Txt k={a} x={right - 636 * scale - 30} y={302} align="right" size={68} weight={300} width={420}>
        636 ג׳
      </Txt>
      <Txt k={ramp(n, 604.1, 604.7)} x={right} y={500} align="right" size={40} width={800} color={INK.textDim}>
        לב של גבר בוגר
      </Txt>
      {bar(560, 300 * scale, INK.clinic, b, 350 * scale)}
      <Txt k={b} x={right - 350 * scale - 30} y={552} align="right" size={68} weight={300} width={520}>
        {"\u2066300–350\u2069 ג׳"}
      </Txt>
      <Txt k={x2} x={960} y={760} size={96} weight={500} width={500} color={INK.damageGlow}>
        כמעט פי 2
      </Txt>
    </Backdrop>
  );
};

// 617.5 - 632.18: a thickened heart wall, in section.
export const HeartWall: React.FC = () => {
  const { n, t } = useShot();
  const k = ramp(n, 617.4, 618.6, EASE.out);
  const thick = ramp(n, 620.6, 622.6, EASE.inOut);
  const beat = beatOf(t, 0.9) * (1 - thick * 0.6);
  const cx = 960;
  const cy = 500;
  const R = 300;
  const r = lerp(190, 95, thick) * (1 - beat * 0.08);
  const spots = scatter(18, 13, { x: -1, y: -1, w: 2, h: 2 });
  const fib = ramp(n, 630.3, 631.7);
  const no = (at: number) => ramp(n, at, at + 0.4);
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R * k} fill="rgba(156,59,51,0.55)" stroke={INK.damageGlow} strokeWidth={3} />
        <circle cx={cx} cy={cy} r={r * k} fill={INK.ground} stroke={INK.clinic} strokeWidth={2} />
        {spots.map((p, i) => {
          const a = Math.atan2(p.y, p.x);
          const rr = lerp(r + 20, R - 20, (p.s - 0.6) / 0.8);
          return (
            <circle
              key={i}
              cx={cx + Math.cos(a) * rr}
              cy={cy + Math.sin(a) * rr}
              r={9 * p.s * fib}
              fill="#e6d3b8"
              opacity={0.7 * fib}
            />
          );
        })}
      </svg>
      <Txt k={ramp(n, 621.4, 622.0)} x={960} y={110} size={44} width={900} color={INK.damageGlow}>
        שריר הלב מתעבה
      </Txt>
      <Txt k={no(624.8)} x={300} y={330} size={44} width={420} color={INK.textDim}>
        להירגע
      </Txt>
      <Txt k={no(625.6)} x={300} y={470} size={44} width={420} color={INK.textDim}>
        להתמלא בדם
      </Txt>
      <Txt k={no(626.5)} x={300} y={610} size={44} width={420} color={INK.textDim}>
        לתפקד
      </Txt>
      <Txt k={fib} x={1620} y={470} size={40} width={460} color={INK.paper}>
        שינויים ברקמה
      </Txt>
    </Backdrop>
  );
};

// 641.24 - 654.82: the liver on a scale.
export const LiverScale: React.FC = () => {
  const { n } = useShot();
  const draw = ramp(n, 641.2, 642.8, EASE.out);
  const g = countTo(n, 648.0, 649.9, 2900);
  const big = ramp(n, 650.3, 651.4, EASE.out);
  const dim = ramp(n, 652.2, 653.2);
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${430 - big * 30} ${150 - big * 20}) scale(${1.7 + big * 0.12})`}>
          <LiverPlate k={draw} fillK={draw} color={INK.damageGlow} fill="rgba(160,60,50,0.24)" />
        </g>
        <rect x={420} y={780} width={1080} height={14} rx={7} fill="#2b3439" opacity={draw} />
        <rect x={900} y={794} width={120} height={120} fill="#1d2428" opacity={draw} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 850,
          width: 400,
          height: 120,
          border: `2px solid ${INK.clinicDim}`,
          borderRadius: 8,
          background: "#061012",
          opacity: draw,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: TYPE.hebrew,
          fontWeight: 300,
          fontSize: 78,
          color: INK.clinicGlow,
          direction: "ltr",
          letterSpacing: 4,
        }}
      >
        {n < 648.1 ? "— g" : `${g.toLocaleString("en-US")} g`}
      </div>
      <Txt k={ramp(n, 647.7, 648.2) * (1 - dim * 0.6)} x={1560} y={880} size={40} width={400} color={INK.textDim}>
        כמעט
      </Txt>
      <Txt k={big * (1 - dim)} x={960} y={90} size={48} width={900} color={INK.damageGlow}>
        מוגדל באופן משמעותי
      </Txt>
    </Backdrop>
  );
};

// 654.82 - 667.66: tumours the size of a table-tennis ball.
export const TumorRuler: React.FC = () => {
  const { n } = useShot();
  const a = ramp(n, 654.8, 655.8, EASE.out);
  const ball = ramp(n, 658.9, 659.6, EASE.out);
  const ruler = ramp(n, 660.1, 661.2, EASE.out);
  const out = ramp(n, 661.9, 663.6, EASE.inOut);
  const spread = scatter(11, 5, { x: 110, y: 90, w: 380, h: 170 });
  const cm = 62; // px per cm at the close-up scale
  return (
    <Backdrop>
      <AbsoluteFill style={{ opacity: 1 - out }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="tum" cx="38%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#efe2cf" />
              <stop offset="70%" stopColor="#b98f74" />
              <stop offset="100%" stopColor="#6e3d31" />
            </radialGradient>
            <radialGradient id="pp" cx="38%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#e9e6df" />
              <stop offset="100%" stopColor="#a9a59c" />
            </radialGradient>
          </defs>
          <circle cx={1180} cy={470} r={2 * cm * a} fill="url(#tum)" />
          <circle cx={740} cy={470} r={2 * cm * ball} fill="url(#pp)" />
          {ruler > 0 ? (
            <g opacity={ruler}>
              <line x1={1180 - 2 * cm} y1={650} x2={1180 - 2 * cm + 4 * cm * ruler} y2={650} stroke={INK.paper} strokeWidth={3} />
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1={1180 - 2 * cm + i * cm}
                  y1={635}
                  x2={1180 - 2 * cm + i * cm}
                  y2={665}
                  stroke={INK.paper}
                  strokeWidth={2}
                  opacity={ruler > i / 4 ? 1 : 0}
                />
              ))}
            </g>
          ) : null}
        </svg>
        <Txt k={ruler} x={1180} y={690} size={54} width={400} weight={300}>
          {"\u2066~4\u2069 ס״מ"}
        </Txt>
        <Txt k={ball} x={740} y={690} size={36} width={420} color={INK.textDim}>
          כדור פינג־פונג
        </Txt>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: out }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(430 200) scale(1.75)">
            <LiverPlate k={1} fillK={1} color={INK.clinicGlow} fill="rgba(127,184,179,0.12)" />
            {spread.map((p, i) => {
              const gk = ramp(n, 663.9 + i * 0.12, 664.6 + i * 0.12, EASE.out);
              return <circle key={i} cx={p.x} cy={p.y} r={(14 + 9 * p.s) * gk} fill="url(#tum2)" />;
            })}
            <defs>
              <radialGradient id="tum2" cx="38%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#efe2cf" />
                <stop offset="100%" stopColor="#8a4a3a" />
              </radialGradient>
            </defs>
          </g>
        </svg>
        <Txt k={ramp(n, 666.3, 666.9)} x={960} y={900} size={42} width={800} color={INK.textDim}>
          רקמה שאמורה להיות בריאה
        </Txt>
      </AbsoluteFill>
    </Backdrop>
  );
};

// 667.66 - 682.2: tissue that crumbles like polystyrene.
export const Crumble: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 667.6, 668.6, EASE.out);
  const go = ramp(n, 671.3, 674.4, EASE.inOut);
  const cols = 30;
  const rows = 15;
  const size = 50;
  const ox = (1920 - cols * size) / 2;
  const oy = 190;
  const cells: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const id = j * cols + i;
      const h = hash(id * 1.7);
      // Damage spreads from the right-hand side of the tissue.
      const reach = clamp((i / cols - (1 - go * 0.75)) * 4 + (h - 0.5) * 0.6);
      const fall = reach * ramp(n, 674.2, 676.4) * (20 + h * 90);
      const x = ox + i * size + (j % 2) * (size / 2);
      const y = oy + j * size * 0.86 + fall;
      if (reach > 0.35) {
        cells.push(
          ...[0, 1, 2].map((b) => (
            <circle
              key={`${id}-${b}`}
              cx={x + (hash(id + b * 9) - 0.5) * 30}
              cy={y + (hash(id + b * 13) - 0.5) * 26}
              r={6 + hash(id + b) * 5}
              fill="#e9e4da"
              opacity={0.85 * k}
            />
          )),
        );
      } else {
        cells.push(
          <polygon
            key={id}
            points={[0, 1, 2, 3, 4, 5]
              .map((a) => {
                const ang = (Math.PI / 3) * a + Math.PI / 6;
                return `${x + Math.cos(ang) * size * 0.5},${y + Math.sin(ang) * size * 0.5}`;
              })
              .join(" ")}
            fill={`rgba(${Math.round(lerp(120, 170, reach * 2))},${Math.round(lerp(70, 60, reach))},60,${0.55 * k})`}
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={2}
            opacity={1 - reach}
          />,
        );
      }
    }
  }
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {cells}
      </svg>
      <Txt k={ramp(n, 673.8, 674.4)} x={1700} y={80} align="right" size={48} width={800}>
        מרקם מתפורר
      </Txt>
      <Txt k={ramp(n, 675.0, 675.6)} x={1700} y={146} align="right" size={36} width={800} color={INK.textDim}>
        המזכיר קלקר
      </Txt>
      <Txt k={ramp(n, 679.4, 680.2)} x={960} y={930} size={42} width={1100} color={INK.damageGlow}>
        שינויים מבניים חמורים
      </Txt>
    </Backdrop>
  );
};

// 685.32 - 691.96: kidneys, swollen, with almost no fat around them.
export const KidneysScene: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 685.3, 686.6, EASE.out);
  const swell = ramp(n, 687.8, 688.8, EASE.out);
  const fat = 1 - ramp(n, 689.4, 691.0);
  const kidney = (x: number, flip: boolean) => (
    <g
      transform={`translate(${x} 260) scale(${(flip ? -1 : 1) * 1.55 * (1 + swell * 0.12)} ${1.55 * (1 + swell * 0.12)}) translate(${flip ? -240 : 0} 0)`}
    >
      <path d={KIDNEY} fill="none" stroke={INK.fat} strokeWidth={14 + 34 * fat} opacity={0.35 * k} strokeLinejoin="round" />
      <Draw d={KIDNEY} k={k} stroke={swell > 0.3 ? INK.damageGlow : INK.clinicGlow} width={4} fill={`rgba(160,70,60,${0.18 + 0.25 * swell})`} fillK={k} />
      <Draw d={KIDNEY_HILUM} k={k} stroke={INK.clinic} width={3} />
    </g>
  );
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {kidney(1060, false)}
        {kidney(860 - 372, true)}
      </svg>
      <Txt k={ramp(n, 688.0, 688.6)} x={960} y={110} size={46} width={800} color={INK.damageGlow}>
        נפוחות
      </Txt>
      <Txt k={ramp(n, 689.9, 690.6)} x={960} y={900} size={40} width={1000} color={INK.fat}>
        כמעט ללא שומן סביבן
      </Txt>
    </Backdrop>
  );
};

// 691.96 - 699.06: changes in the lungs linked to shock.
export const LungsScene: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 691.9, 693.0, EASE.out);
  const mot = ramp(n, 693.1, 694.6);
  const spots = scatter(40, 21, { x: 70, y: 110, w: 300, h: 230 });
  return (
    <Backdrop>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(560 150) scale(1.8)">
          <Draw d={LUNG_L} k={k} stroke={INK.clinicGlow} width={3} fill="rgba(127,184,179,0.12)" fillK={k} />
          <Draw d={LUNG_R} k={k} stroke={INK.clinicGlow} width={3} fill="rgba(127,184,179,0.12)" fillK={k} />
          <Draw d={TRACHEA} k={k} stroke={INK.clinicGlow} width={3} />
          {spots.map((p, i) => {
            const inside = p.x < 190 ? p.x > 70 + (p.y - 110) * 0.05 : p.x > 250;
            return inside ? (
              <circle key={i} cx={p.x} cy={p.y} r={7 * p.s * mot} fill={INK.damage} opacity={0.55} />
            ) : null;
          })}
        </g>
      </svg>
      <Txt k={ramp(n, 694.3, 694.9)} x={960} y={880} size={44} width={900} color={INK.damageGlow}>
        שינויים הקשורים להלם
      </Txt>
    </Backdrop>
  );
};

// 699.06 - 724.32: about twenty substances, and why none can be singled out.
export const Substances20: React.FC = () => {
  const { n } = useShot();
  const cols = 10;
  const pick = ramp(n, 719.8, 720.7, EASE.out);
  const cross = ramp(n, 722.6, 723.4, EASE.out);
  const unclear = ramp(n, 716.0, 717.2);
  return (
    <Backdrop>
      {Array.from({ length: 20 }, (_, i) => {
        const a = ramp(n, 706.0 + i * 0.2, 706.4 + i * 0.2, EASE.out);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 1620 - col * 146;
        const y = 300 + row * 230;
        const chosen = i === 6;
        const dimOthers = chosen ? 1 : 1 - pick * 0.6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 30,
              top: y,
              width: 60,
              height: 150,
              borderRadius: "10px 10px 18px 18px",
              border: `3px solid ${chosen && pick > 0 ? INK.amber : INK.clinic}`,
              background: `linear-gradient(to top, rgba(127,184,179,${0.35}) ${30 + hash(i) * 40}%, transparent 0%)`,
              opacity: a * dimOthers,
              transform: `translateY(${(1 - a) * 20}px) scale(${chosen ? 1 + pick * 0.15 : 1})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -18,
                left: 6,
                width: 42,
                height: 16,
                borderRadius: 4,
                background: INK.clinicDim,
              }}
            />
            {unclear > 0 ? (
              <div
                style={{
                  position: "absolute",
                  top: 160,
                  width: 60,
                  textAlign: "center",
                  fontFamily: TYPE.hebrew,
                  fontSize: 34,
                  color: INK.textDim,
                  opacity: unclear,
                }}
              >
                ?
              </div>
            ) : null}
          </div>
        );
      })}
      <Txt k={ramp(n, 710.3, 710.9)} x={960} y={110} size={84} weight={300} width={700}>
        ~20
      </Txt>
      <Txt k={ramp(n, 704.6, 705.4)} x={960} y={850} size={34} width={900} color={INK.textDim}>
        לפי פרסומים על המקרה
      </Txt>
      {cross > 0 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g opacity={cross} stroke={INK.damageGlow} strokeWidth={8} strokeLinecap="round">
            <line x1={1620 - 6 * 146 - 70} y1={290} x2={1620 - 6 * 146 + 70} y2={470} />
            <line x1={1620 - 6 * 146 + 70} y1={290} x2={1620 - 6 * 146 - 70} y2={470} />
          </g>
        </svg>
      ) : null}
    </Backdrop>
  );
};

/** A block of tissue in section: skin, fat beneath it, muscle. */
const Section: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly fat: number;
  readonly k: number;
  readonly striate?: number;
  readonly labels?: number;
}> = ({ x, y, w, fat, k, striate = 0, labels = 0 }) => {
  const skin = 26;
  const muscle = 360;
  const fatH = 8 + fat * 150;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
        <rect x={x} y={y} width={w} height={skin} fill={INK.skin} rx={6} />
        <rect x={x} y={y + skin} width={w} height={fatH} fill={INK.fat} opacity={0.85} />
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse
            key={i}
            cx={x + 36 + i * ((w - 72) / 13)}
            cy={y + skin + fatH / 2}
            rx={Math.min(32, Math.max(0, fatH / 2 - 4))}
            ry={Math.max(0, fatH / 2 - 6)}
            fill="#e7c674"
            opacity={0.5}
          />
        ))}
        <rect x={x} y={y + skin + fatH} width={w} height={muscle} fill={INK.muscle} />
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={i}
            x1={x}
            y1={y + skin + fatH + 14 + i * 22}
            x2={x + w}
            y2={y + skin + fatH + 14 + i * 22 + (i % 2 ? 6 : -6)}
            stroke="#5e1e1a"
            strokeWidth={3}
            opacity={0.25 + striate * 0.6}
          />
        ))}
      </svg>
      <Txt k={labels} x={x + w + 30} y={y - 8} align="left" size={36} width={300} color={INK.skin}>
        עור
      </Txt>
      <Txt k={labels * clamp((fat - 0.3) * 4)} x={x + w + 30} y={y + skin + fatH / 2 - 26} align="left" size={36} width={300} color={INK.fat}>
        שומן
      </Txt>
      <Txt k={labels} x={x + w + 30} y={y + skin + fatH + 150} align="left" size={36} width={300} color="#e08a7c">
        שריר
      </Txt>
    </>
  );
};

// 248.72 - 259.28: what definition means: the fat over the muscle comes off.
export const SkinLayers: React.FC = () => {
  const { n } = useShot();
  const k = ramp(n, 248.6, 249.6, EASE.out);
  const fat = 1 - ramp(n, 253.3, 255.9, EASE.inOut) * 0.8;
  return (
    <Backdrop>
      <Section x={380} y={260} w={1000} fat={fat} k={k} striate={ramp(n, 256.4, 258.4)} labels={ramp(n, 249.4, 250.4)} />
      <Txt k={ramp(n, 252.5, 253.2)} x={880} y={120} size={44} width={1100}>
        להוריד את שכבת השומן
      </Txt>
    </Backdrop>
  );
};

// 734.66 - 756.12: "zero percent body fat", and what the autopsy actually found.
export const ZeroMyth: React.FC = () => {
  const { n } = useShot();
  const zero = ramp(n, 737.5, 738.1, EASE.out);
  const essential = ramp(n, 744.1, 744.9, EASE.out);
  const strike = ramp(n, 748.6, 749.2, EASE.out);
  const sec = ramp(n, 749.6, 750.6, EASE.out);
  const subq = ramp(n, 752.5, 753.3);
  const up = ramp(n, 749.3, 750.4, EASE.inOut);
  return (
    <Backdrop>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: lerp(250, 70, up),
          textAlign: "center",
          fontFamily: TYPE.serif,
          fontWeight: 600,
          fontSize: lerp(300, 150, up),
          color: INK.paper,
          opacity: zero,
          direction: "ltr",
          transform: `scale(${1 + (1 - zero) * 0.3})`,
        }}
      >
        0%
        {strike > 0 ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "52%",
              width: lerp(0, 560, strike) * lerp(1, 0.5, up),
              height: lerp(16, 9, up),
              background: INK.damageGlow,
              transform: "translate(-50%, -50%) rotate(-12deg)",
            }}
          />
        ) : null}
      </div>
      <Txt k={ramp(n, 737.9, 738.6) * (1 - up)} x={960} y={600} size={44} width={900} color={INK.textDim}>
        אפס אחוזי שומן
      </Txt>
      <Txt k={essential * (1 - up)} x={960} y={720} size={40} width={1100} color={INK.fat}>
        גוף אנושי לא מתפקד ללא שומן חיוני
      </Txt>
      <Section x={460} y={360} w={1000} fat={0.02} k={sec} striate={1} labels={sec} />
      <Txt k={subq} x={960} y={860} size={46} width={1200} color={INK.fat}>
        שומן תת־עורי: כמעט אפס
      </Txt>
    </Backdrop>
  );
};

// 775.7 - 781.34: "a thin layer of tissue" between the world and the muscle.
export const Membrane: React.FC = () => {
  const { n, t } = useShot();
  const a = ramp(n, 777.3, 777.9);
  const b = ramp(n, 778.5, 779.1);
  const line = ramp(n, 779.6, 780.6, EASE.out);
  return (
    <Backdrop grid={false}>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, #0f1418 0%, #0f1418 49.7%, #4a1612 50.3%, #2a0c0a 100%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path
          d={`M 0 540 ${Array.from({ length: 25 }, (_, i) => `L ${i * 80} ${540 + Math.sin(t * 1.2 + i * 0.7) * 3}`).join(" ")} L 1920 540`}
          stroke={INK.skin}
          strokeWidth={2 + line * 2}
          fill="none"
          opacity={0.4 + line * 0.6}
          style={{ filter: `drop-shadow(0 0 ${8 * line}px ${INK.skin})` }}
        />
      </svg>
      <Txt k={a} x={960} y={330} size={52} width={900}>
        העולם החיצוני
      </Txt>
      <Txt k={b} x={960} y={700} size={52} width={900} color="#e08a7c">
        השרירים
      </Txt>
      <Txt k={line} x={1600} y={556} size={32} width={460} color={INK.skin}>
        שכבה דקיקה של רקמה
      </Txt>
    </Backdrop>
  );
};

// 987.28 - 1004.72: the three findings.
export const Recap: React.FC = () => {
  const { n } = useShot();
  const card = (i: number, at: number, title: string, line: string, icon: React.ReactNode) => {
    const k = ramp(n, at, at + 0.7, EASE.out);
    const settle = ramp(n, 998.0, 999.0, EASE.inOut);
    const x = 1500 - i * 580;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - 260,
          top: lerp(190, 170, settle),
          width: 520,
          height: 620,
          borderRadius: 14,
          border: `1.5px solid rgba(127,184,179,${0.25 + 0.3 * k})`,
          background: "rgba(15,22,26,0.85)",
          opacity: k,
          transform: `translateY(${(1 - k) * 30}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 40,
          gap: 18,
        }}
      >
        <svg viewBox="0 0 400 440" width={260} height={260} style={{ overflow: "visible" }}>
          {icon}
        </svg>
        <div style={{ fontFamily: TYPE.hebrew, fontSize: 72, fontWeight: 300, color: INK.text, direction: "rtl" }}>
          {title}
        </div>
        <div
          style={{
            fontFamily: TYPE.hebrew,
            fontSize: 38,
            color: INK.textDim,
            direction: "rtl",
            textAlign: "center",
            width: 440,
          }}
        >
          {line}
        </div>
      </div>
    );
  };
  return (
    <Backdrop>
      {card(0, 987.2, "636 ג׳", "לב כמעט כפול במשקלו", <HeartPlate k={1} fillK={1} color={INK.damageGlow} fill="rgba(200,64,46,0.2)" />)}
      {card(
        1,
        990.9,
        "\u2066~2.9\u2069 ק״ג",
        "כבד מלא גידולים ורקמה פגועה",
        <g transform="translate(-110 60) scale(1.0)">
          <path d={LIVER.body} fill="rgba(200,64,46,0.2)" stroke={INK.damageGlow} strokeWidth={6} />
        </g>,
      )}
      {card(
        2,
        994.5,
        "כמעט 0",
        "שומן מתחת לעור",
        <g>
          <rect x={20} y={150} width={360} height={24} fill={INK.skin} rx={6} />
          <rect x={20} y={176} width={360} height={4} fill={INK.fat} />
          <rect x={20} y={180} width={360} height={150} fill={INK.muscle} />
        </g>,
      )}
      <Txt k={ramp(n, 999.8, 1000.6)} x={960} y={880} size={48} width={1400} color={INK.textDim}>
        מראה מרשים אינו בהכרח בריאות
      </Txt>
    </Backdrop>
  );
};

/** The organ figure for the hospital sequence, 522 - 553. */
export const HospitalBody: React.FC = () => {
  const { n, t } = useShot();
  const k = ramp(n, 524.1, 525.0, EASE.out);
  const bleed = ramp(n, 525.5, 527.0);
  const lamp = win(n, 529.7, 530.4, 534.6, 535.6);
  const liver = ramp(n, 536.2, 537.0);
  const kidneys = ramp(n, 541.2, 542.0);
  const potassium = ramp(n, 543.3, 545.6, EASE.inOut);
  const ecgIn = ramp(n, 549.5, 550.3);
  const ecgBad = ramp(n, 551.6, 553.1);
  const pulse = beatOf(t, 0.75);
  return (
    <Backdrop tone={bleed > 0.5 ? "red" : "clinic"}>
      {lamp > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(28% 26% at 50% 34%, rgba(230,245,250,${0.35 * lamp}) 0%, rgba(230,245,250,0) 100%)`,
          }}
        />
      ) : null}
      <BodyMap
        k={k}
        x={760}
        y={80}
        pulse={pulse}
        state={{
          gut: [k, bleed],
          liver: [liver > 0 ? 1 : 0.0001, liver],
          kidneys: [kidneys > 0 ? 1 : 0.0001, kidneys],
          heart: [ecgIn, ecgBad],
        }}
      />
      <Txt k={ramp(n, 525.5, 526.2) * (1 - ramp(n, 529.0, 529.6))} x={430} y={420} size={46} width={600} color={INK.damageGlow}>
        דימום פנימי
      </Txt>
      <Txt k={lamp} x={430} y={420} size={46} width={600}>
        ניתוח
      </Txt>
      <Txt k={liver * (1 - ramp(n, 542.6, 543.2))} x={430} y={380} size={46} width={600} color={INK.damageGlow}>
        כבד
      </Txt>
      <Txt k={kidneys * (1 - ramp(n, 542.6, 543.2))} x={430} y={470} size={46} width={600} color={INK.damageGlow}>
        כליות
      </Txt>
      {/* Potassium gauge */}
      <AbsoluteFill style={{ opacity: ramp(n, 542.9, 543.5) }}>
        <div
          style={{
            position: "absolute",
            left: 1430,
            top: 260,
            width: 70,
            height: 480,
            borderRadius: 35,
            border: `2px solid ${INK.clinicDim}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${lerp(30, 92, potassium)}%`,
              background: `linear-gradient(to top, ${INK.clinic}, ${potassium > 0.6 ? INK.damageGlow : INK.clinic})`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 1390,
            top: 160,
            width: 150,
            textAlign: "center",
            fontFamily: TYPE.hebrew,
            fontSize: 64,
            fontWeight: 300,
            color: potassium > 0.6 ? INK.damageGlow : INK.text,
            direction: "ltr",
          }}
        >
          K⁺
        </div>
        <Txt k={ramp(n, 543.3, 543.9)} x={1465} y={760} size={34} width={300} color={INK.textDim}>
          אשלגן
        </Txt>
      </AbsoluteFill>
      {ecgIn > 0 ? <Ecg y={1000} k={ecgIn} bad={ecgBad} t={t} height={70} /> : null}
    </Backdrop>
  );
};

/** A heart trace scrolling across the bottom of the frame. */
export const Ecg: React.FC<{
  readonly y: number;
  readonly k: number;
  readonly bad: number;
  readonly t: number;
  readonly rate?: number;
  readonly flat?: number;
  readonly height?: number;
}> = ({ y, k, bad, t, rate = 1.1, flat = 0, height = 90 }) => {
  const pts: string[] = [];
  for (let x = 0; x <= 1920; x += 6) {
    const time = t * 380 - x;
    const ph = ((time / 380) * rate) % 1;
    const p = ph < 0 ? ph + 1 : ph;
    let v = 0;
    if (p > 0.1 && p < 0.14) v = -0.12;
    if (p > 0.2 && p < 0.23) v = 1;
    if (p > 0.23 && p < 0.26) v = -0.35;
    const tw = bad * 0.6;
    if (p > 0.36 && p < 0.5) v = Math.sin(((p - 0.36) / 0.14) * Math.PI) * (0.18 + tw);
    if (bad > 0) v += Math.sin(x * 0.05 + t * 9) * 0.06 * bad;
    v *= 1 - flat;
    pts.push(`${x},${y - v * height}`);
  }
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={bad > 0.5 ? INK.damageGlow : "#7fe0a8"}
        strokeWidth={3}
        style={{ filter: "drop-shadow(0 0 5px rgba(127,224,168,0.6))" }}
      />
    </svg>
  );
};

// 553.86 - 567.78: multi-organ failure as a network.
export const MultiOrgan: React.FC = () => {
  const { n } = useShot();
  const nodes = [
    { key: "כבד", x: 960, y: 520 },
    { key: "כליות", x: 640, y: 330 },
    { key: "לב", x: 1280, y: 330 },
    { key: "ריאות", x: 1300, y: 740 },
    { key: "מעיים", x: 620, y: 740 },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 1],
  ];
  const appear = ramp(n, 553.8, 554.8, EASE.out);
  const fail = (i: number) =>
    i === 0 ? ramp(n, 554.7, 555.3) : ramp(n, 555.1 + i * 0.25, 555.6 + i * 0.25);
  const spread = ramp(n, 563.6, 566.4, EASE.inOut);
  return (
    <Backdrop tone="red">
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {edges.map(([a, b], i) => {
          const A = nodes[a];
          const B = nodes[b];
          const hot = Math.min(fail(a), fail(b));
          return (
            <g key={i}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={INK.clinicDim} strokeWidth={2} opacity={appear} />
              <line
                x1={A.x}
                y1={A.y}
                x2={lerp(A.x, B.x, hot)}
                y2={lerp(A.y, B.y, hot)}
                stroke={INK.damageGlow}
                strokeWidth={4}
                opacity={appear}
              />
              {spread > 0 ? (
                <circle
                  cx={lerp(A.x, B.x, (spread * 2 + i * 0.13) % 1)}
                  cy={lerp(A.y, B.y, (spread * 2 + i * 0.13) % 1)}
                  r={8}
                  fill={INK.damageGlow}
                />
              ) : null}
            </g>
          );
        })}
        {nodes.map((nd, i) => (
          <g key={nd.key} opacity={appear}>
            <circle cx={nd.x} cy={nd.y} r={78} fill={INK.ground} stroke={fail(i) > 0.5 ? INK.damageGlow : INK.clinic} strokeWidth={4} />
            <circle cx={nd.x} cy={nd.y} r={78 * fail(i)} fill={INK.damage} opacity={0.5} />
          </g>
        ))}
      </svg>
      {nodes.map((nd) => (
        <Txt key={nd.key} k={appear} x={nd.x} y={nd.y - 26} size={38} width={240}>
          {nd.key}
        </Txt>
      ))}
      <Txt k={ramp(n, 557.8, 558.6)} x={960} y={90} size={58} width={1000} color={INK.damageGlow}>
        כשל רב־מערכתי
      </Txt>
    </Backdrop>
  );
};

// 567.78 - 573.36: the monitor slows and stops.
export const Flatline: React.FC = () => {
  const { n, t } = useShot();
  const flat = ramp(n, 569.8, 571.8, EASE.inOut);
  const fade = ramp(n, 572.0, 573.3);
  return (
    <Backdrop tone="black" grid={false}>
      <AbsoluteFill style={{ opacity: 1 - fade }}>
        <div
          style={{
            position: "absolute",
            left: 160,
            top: 200,
            width: 1600,
            height: 680,
            borderRadius: 30,
            border: "2px solid #1f2a2c",
            background: "#030807",
          }}
        />
        <Ecg y={560} k={1} bad={0} t={t} rate={lerp(1.0, 0.45, flat)} flat={flat} height={200} />
      </AbsoluteFill>
    </Backdrop>
  );
};

// 38.08 - 44.38, 586.78 - 593.34, 799.84 - 810.54: the autopsy file.
export const ReportFile: React.FC<{ readonly mode: "open" | "findings" | "cause" }> = ({ mode }) => {
  const { n, t } = useShot();
  const at0 = mode === "open" ? 38.0 : mode === "findings" ? 586.7 : 799.8;
  const k = ramp(n, at0, at0 + 1.0, EASE.out);
  const row = (i: number, label: string, value: string, vk: number, red = false) => (
    <div
      key={label}
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        gap: 30,
        alignItems: "baseline",
        borderBottom: "1.5px solid rgba(40,34,26,0.25)",
        paddingBottom: 14,
        opacity: ramp(k, 0.3 + i * 0.1, 0.7 + i * 0.1),
      }}
    >
      <div style={{ width: 230, fontFamily: TYPE.hebrew, fontSize: 36, color: "#5d5444", textAlign: "right", direction: "rtl" }}>
        {label}
      </div>
      <div
        style={{
          flex: 1,
          fontFamily: TYPE.hebrew,
          fontSize: 40,
          color: red ? "#9c2a1c" : INK.ink,
          textAlign: "right",
          direction: "rtl",
          opacity: vk,
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
  const cursor = Math.floor(t * 2) % 2 === 0;
  const causeA = ramp(n, 803.9, 804.6);
  const causeB = ramp(n, 805.6, 806.4);
  return (
    <Backdrop tone="black" grid={false}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(45% 55% at 50% 40%, rgba(220,235,240,0.16) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 520,
          top: lerp(1080, 150, k),
          width: 1040,
          height: 1200,
          background: INK.paper,
          borderRadius: 4,
          boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
          transform: `rotate(${-1.2 + k * 0.4}deg) scale(${1 + ramp(n, at0 + 1, at0 + 6) * 0.04})`,
          padding: "70px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div style={{ fontFamily: TYPE.serif, fontSize: 54, fontWeight: 600, color: INK.ink, direction: "rtl", textAlign: "right" }}>
          נתיחה שלאחר המוות
        </div>
        <div style={{ height: 3, background: INK.ink, opacity: 0.6 }} />
        {row(0, "תאריך", "14.03.1996", 1)}
        {row(1, "מקום", "מינכן", 1)}
        {row(2, "גבר", "בן 31", 1)}
        {mode === "open" ? (
          <>
            {row(3, "לב", "", 0)}
            {row(4, "כבד", "", 0)}
            {row(5, "כליות", "", 0)}
          </>
        ) : null}
        {mode === "findings" ? (
          <>
            {row(3, "לב", "?", ramp(n, 589.3, 589.9), true)}
            {row(4, "כבד", "?", ramp(n, 589.6, 590.2), true)}
            {row(5, "כליות", "?", ramp(n, 589.9, 590.5), true)}
          </>
        ) : null}
        {mode === "cause" ? (
          <>
            {row(3, "סיבת המוות", causeA > 0 ? "כשל רב־מערכתי" : cursor ? "|" : "", causeA > 0 ? causeA : 1, causeA > 0)}
            {row(4, "", causeB > 0 ? "פגיעה חמורה בכבד" : "", causeB, true)}
          </>
        ) : null}
      </div>
    </Backdrop>
  );
};
