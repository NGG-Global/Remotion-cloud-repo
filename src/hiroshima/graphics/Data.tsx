import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  easeIn,
  easeInOut,
  easeOut,
  H,
  hash,
  ramp,
  SANS,
  SERIF,
  SERIF_LATIN,
} from "../theme";

/**
 * Explanatory graphics. Each one carries a single idea from the narration and
 * lands its parts on the words that name them (times are seconds into the
 * shot). Figures are the narration's own; where a picture is schematic it
 * says so on screen.
 */

const useT = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const out = 1 - easeIn(ramp(frame, durationInFrames - 12, durationInFrames));
  const inn = easeOut(ramp(frame, 0, 12));
  return { t, frame, fps, env: Math.min(inn, out) };
};

const appear = (t: number, at: number, d = 0.6) => easeOut(ramp(t, at, at + d));

const Panel: React.FC<{ children: React.ReactNode; dark?: number }> = ({
  children,
  dark = 0.86,
}) => (
  <AbsoluteFill style={{ background: `rgba(7,8,10,${dark})` }}>
    {children}
  </AbsoluteFill>
);

const Footnote: React.FC<{ text: string; o: number }> = ({ text, o }) => (
  <div
    style={{
      position: "absolute",
      bottom: 70,
      right: 110,
      fontFamily: SANS,
      fontSize: 26,
      color: H.muted,
      direction: "rtl",
      opacity: o,
    }}
  >
    {text}
  </div>
);

// --------------------------------------------------------------- three ways

const BlastIcon: React.FC<{ t: number }> = ({ t }) => (
  <svg width={200} height={200} viewBox="-100 -100 200 200">
    {[0, 1, 2].map((i) => {
      const k = (((t * 0.9 + i / 3) % 1) + 1) % 1;
      return (
        <circle
          key={i}
          r={18 + k * 78}
          fill="none"
          stroke={H.paper}
          strokeWidth={4}
          opacity={(1 - k) * 0.9}
        />
      );
    })}
    <circle r={14} fill={H.paper} />
  </svg>
);

const HeatIcon: React.FC<{ t: number }> = ({ t }) => (
  <svg width={200} height={200} viewBox="-100 -100 200 200">
    <circle r={38 + Math.sin(t * 5) * 2} fill={H.ember} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + t * 0.3;
      return (
        <line
          key={i}
          x1={Math.cos(a) * 54}
          y1={Math.sin(a) * 54}
          x2={Math.cos(a) * (80 + Math.sin(t * 6 + i) * 6)}
          y2={Math.sin(a) * (80 + Math.sin(t * 6 + i) * 6)}
          stroke={H.emberHot}
          strokeWidth={6}
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

const RadIcon: React.FC<{ t: number }> = ({ t }) => {
  const blade = (rot: number) => {
    const a0 = ((rot - 30) * Math.PI) / 180;
    const a1 = ((rot + 30) * Math.PI) / 180;
    const r0 = 22;
    const r1 = 80;
    return `M${Math.cos(a0) * r0},${Math.sin(a0) * r0} L${Math.cos(a0) * r1},${Math.sin(a0) * r1} A${r1},${r1} 0 0 1 ${Math.cos(a1) * r1},${Math.sin(a1) * r1} L${Math.cos(a1) * r0},${Math.sin(a1) * r0} A${r0},${r0} 0 0 0 ${Math.cos(a0) * r0},${Math.sin(a0) * r0} Z`;
  };
  return (
    <svg
      width={200}
      height={200}
      viewBox="-100 -100 200 200"
      style={{ opacity: 0.75 + 0.25 * Math.sin(t * 3) }}
    >
      <circle
        r={96}
        fill="none"
        stroke={H.paperDim}
        strokeWidth={2}
        strokeDasharray="4 8"
      />
      {[-90, 30, 150].map((r) => (
        <path key={r} d={blade(r)} fill={H.paper} />
      ))}
      <circle r={14} fill={H.paper} />
    </svg>
  );
};

export const ThreeWays: React.FC = () => {
  const { t, env } = useT();
  const cols = [
    {
      at: 6.0,
      word: "הדף",
      sub: "הורס מבנים ומעיף אנשים",
      icon: <BlastIcon t={t} />,
    },
    { at: 8.8, word: "חום", sub: "כוויות ושרפות", icon: <HeatIcon t={t} /> },
    { at: 12.0, word: "קרינה", sub: "בלתי נראית", icon: <RadIcon t={t} /> },
  ];
  return (
    <AbsoluteFill style={{ opacity: env }}>
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: 64,
          color: H.paper,
          direction: "rtl",
          opacity: appear(t, 3.0),
          textShadow: "0 4px 30px rgba(0,0,0,0.9)",
        }}
      >
        היא לא הורגת רק בדרך אחת
      </div>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 120,
        }}
      >
        <div style={{ display: "flex", direction: "rtl", gap: 150 }}>
          {cols.map((c) => {
            const o = appear(t, c.at, 0.7);
            return (
              <div
                key={c.word}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: o,
                  transform: `translateY(${(1 - o) * 30}px)`,
                }}
              >
                {c.icon}
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 84,
                    color: H.paper,
                    marginTop: 20,
                  }}
                >
                  {c.word}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 34,
                    color: H.paperDim,
                    marginTop: 8,
                    direction: "rtl",
                  }}
                >
                  {c.sub}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ doctors

const Person: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 20 28">
    <circle cx={10} cy={6} r={5} fill={color} />
    <path d="M2,27 L2,18 Q2,12 10,12 Q18,12 18,18 L18,27 Z" fill={color} />
  </svg>
);

export const Doctors: React.FC = () => {
  const { t, env } = useT();
  const hit = Math.floor(90 * easeInOut(ramp(t, 1.4, 3.2)));
  const count = Math.round(90 * easeOut(ramp(t, 1.6, 3.2)));
  return (
    <Panel dark={1}>
      <AbsoluteFill
        style={{
          opacity: env,
          flexDirection: "row",
          direction: "rtl",
          alignItems: "center",
          justifyContent: "center",
          gap: 120,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: 640,
          }}
        >
          <div
            style={{
              fontFamily: SERIF_LATIN,
              fontSize: 230,
              lineHeight: 1,
              color: H.ember,
              direction: "ltr",
              opacity: appear(t, 1.4),
            }}
          >
            {count}%
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 58,
              color: H.paper,
              marginTop: 10,
              direction: "rtl",
              opacity: appear(t, 1.8),
            }}
          >
            מהרופאים בעיר
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 42,
              color: H.paperDim,
              marginTop: 8,
              direction: "rtl",
              opacity: appear(t, 2.2),
            }}
          >
            נהרגו או נפצעו
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 46px)",
            gap: "14px 12px",
            direction: "rtl",
          }}
        >
          {Array.from({ length: 100 }, (_, i) => {
            const o = appear(t, 0.1 + i * 0.008, 0.3);
            const lost = i < hit;
            return (
              <div key={i} style={{ opacity: o * (lost ? 0.85 : 1) }}>
                <Person color={lost ? H.emberDeep : H.paper} size={42} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Footnote
        text="על פי הערכות היסטוריות · הירושימה, 1945"
        o={env * appear(t, 2.6)}
      />
    </Panel>
  );
};

// ---------------------------------------------------------------- hospitals

const Cross: React.FC<{ lit: number }> = ({ lit }) => (
  <svg width={70} height={70} viewBox="0 0 70 70">
    <rect
      x={2}
      y={2}
      width={66}
      height={66}
      rx={8}
      fill="none"
      stroke={lit > 0.5 ? H.paper : "#3a3a3a"}
      strokeWidth={2.5}
    />
    <path
      d="M28,14 h14 v14 h14 v14 h-14 v14 h-14 v-14 h-14 v-14 h14 z"
      fill={lit > 0.5 ? H.ember : "#2c2c2c"}
      opacity={0.35 + 0.65 * lit}
    />
  </svg>
);

export const Hospitals: React.FC = () => {
  const { t, env } = useT();
  const SURVIVE = new Set([7, 23, 38]);
  const out = ramp(t, 2.9, 4.4);
  return (
    <Panel dark={1}>
      <AbsoluteFill
        style={{
          opacity: env,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "baseline",
            gap: 30,
            marginBottom: 50,
          }}
        >
          <div
            style={{
              fontFamily: SERIF_LATIN,
              fontSize: 150,
              color: H.paper,
              lineHeight: 1,
              opacity: appear(t, 0.3),
            }}
          >
            45
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 56,
              color: H.paper,
              direction: "rtl",
              opacity: appear(t, 0.6),
            }}
          >
            בתי חולים ומרפאות מרכזיים
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 70px)",
            gap: 22,
            direction: "rtl",
          }}
        >
          {Array.from({ length: 45 }, (_, i) => {
            const o = appear(t, 0.2 + i * 0.015, 0.3);
            const order = hash(i * 9.1);
            const dark = SURVIVE.has(i)
              ? 0
              : easeInOut(ramp(out, order * 0.6, order * 0.6 + 0.4));
            return (
              <div key={i} style={{ opacity: o }}>
                <Cross lit={1 - dark} />
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 50,
            fontFamily: SANS,
            fontSize: 46,
            color: H.ember,
            direction: "rtl",
            opacity: appear(t, 4.0),
          }}
        >
          רק מעטים נותרו מסוגלים לפעול
        </div>
      </AbsoluteFill>
    </Panel>
  );
};

// ------------------------------------------------------------------- marrow

/**
 * Bone marrow and the three cell lines it makes, then radiation shutting the
 * supply down. Schematic, labelled as such.
 */
export const Marrow: React.FC = () => {
  const { t, env } = useT();
  const cell = appear(t, 0.6, 0.6) * (1 - easeIn(ramp(t, 3.0, 3.6)));
  const split = easeInOut(ramp(t, 1.4, 2.6));
  const bone = appear(t, 3.2, 0.8);
  const flow = ramp(t, 5.6, 6.6);
  const hitAt = 16.8;
  const damage = easeInOut(ramp(t, hitAt + 1.6, hitAt + 5.5));
  const supply = Math.max(0.08, 1 - damage);

  const types = [
    {
      at: 8.2,
      name: "תאי דם לבנים",
      role: "נלחמים בזיהומים",
      color: "#e9e4d8",
      r: 13,
    },
    { at: 11.4, name: "טסיות", role: "עוצרות דימומים", color: "#c9b37a", r: 7 },
    {
      at: 13.6,
      name: "תאי דם אדומים",
      role: "מובילים חמצן",
      color: "#b8332a",
      r: 11,
    },
  ];

  // Cells leaving the marrow along the vessel, deterministic.
  const particles: React.ReactNode[] = [];
  if (flow > 0) {
    for (let i = 0; i < 60; i++) {
      const kind = i % 3;
      const typeAt = types[kind].at;
      if (t < typeAt - 2.2) continue;
      const speed = 0.11 + hash(i) * 0.08;
      const phase = (hash(i * 3.3) + t * speed) % 1;
      const visible = hash(i * 7.1) < supply;
      if (!visible) continue;
      const x = 640 - phase * 560;
      const y = 540 + Math.sin(phase * 9 + i) * 26 + (hash(i * 5.5) - 0.5) * 60;
      particles.push(
        <circle
          key={i}
          cx={x}
          cy={y}
          r={types[kind].r}
          fill={types[kind].color}
          opacity={flow * (1 - phase * 0.3)}
        />,
      );
    }
  }

  const waves =
    t > hitAt
      ? [0, 1, 2, 3].map((k) => {
          const u = ((t - hitAt) * 0.8 + k / 4) % 1;
          return (
            <circle
              key={k}
              cx={980}
              cy={540}
              r={60 + u * 360}
              fill="none"
              stroke={H.ember}
              strokeWidth={4}
              opacity={(1 - u) * 0.7 * (1 - ramp(t, 23.5, 24.5))}
            />
          );
        })
      : null;

  return (
    <Panel dark={1}>
      <AbsoluteFill style={{ opacity: env }}>
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* A dividing cell. */}
          <g opacity={cell}>
            <circle
              cx={980 - 70 * split}
              cy={540}
              r={90}
              fill="none"
              stroke={H.paper}
              strokeWidth={4}
            />
            <circle
              cx={980 + 70 * split}
              cy={540}
              r={90}
              fill="none"
              stroke={H.paper}
              strokeWidth={4}
            />
            <circle cx={980 - 70 * split} cy={540} r={26} fill={H.paperDim} />
            <circle cx={980 + 70 * split} cy={540} r={26} fill={H.paperDim} />
          </g>
          {/* The bone, in section, and the vessel the cells leave by. */}
          <g opacity={bone}>
            <path
              d="M640,505 L80,505 M640,575 L80,575"
              stroke="#5a2a24"
              strokeWidth={3}
              opacity={0.9}
            />
            <rect
              x={760}
              y={330}
              width={440}
              height={420}
              rx={200}
              fill="#2a2420"
              stroke={H.paperDim}
              strokeWidth={5}
            />
            <rect
              x={800}
              y={370}
              width={360}
              height={340}
              rx={165}
              fill={`rgba(150,60,45,${0.25 + 0.45 * supply})`}
              stroke="#7a3a2c"
              strokeWidth={3}
            />
            {Array.from({ length: 26 }, (_, i) => (
              <circle
                key={i}
                cx={830 + hash(i) * 300}
                cy={400 + hash(i * 2.7) * 280}
                r={6 + hash(i * 4.1) * 8}
                fill={`rgba(233,228,216,${0.15 + 0.5 * supply})`}
              />
            ))}
          </g>
          {particles}
          {waves}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 980 - 140,
            top: 785,
            width: 280,
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 52,
            color: H.paper,
            opacity: bone,
          }}
        >
          מח העצם
        </div>
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 110,
            fontFamily: SANS,
            fontSize: 36,
            color: H.paperDim,
            direction: "rtl",
            opacity: appear(t, 0.6) * (1 - ramp(t, 3.0, 3.6)),
          }}
        >
          תאים שמתחלקים במהירות
        </div>
        <div
          style={{
            position: "absolute",
            top: 260,
            right: 110,
            display: "flex",
            flexDirection: "column",
            gap: 46,
            direction: "rtl",
          }}
        >
          {types.map((ty) => {
            const o = appear(t, ty.at, 0.6);
            return (
              <div
                key={ty.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  opacity: o,
                }}
              >
                <svg width={44} height={44}>
                  <circle cx={22} cy={22} r={ty.r + 6} fill={ty.color} />
                </svg>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 42,
                      color: H.paper,
                    }}
                  >
                    {ty.name}
                  </span>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 30,
                      color: H.paperDim,
                    }}
                  >
                    {ty.role}
                  </span>
                </div>
                <div
                  style={{
                    marginRight: 30,
                    width: 240,
                    height: 12,
                    background: "#24262a",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${100 * supply}%`,
                      height: "100%",
                      background: ty.color,
                      marginRight: "auto",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 150,
            right: 110,
            fontFamily: SERIF,
            fontSize: 52,
            color: H.ember,
            direction: "rtl",
            opacity: appear(t, hitAt + 0.3),
          }}
        >
          קרינה בעוצמה גבוהה פוגעת בייצור
        </div>
        <Footnote text="איור סכמטי" o={appear(t, 3.4)} />
      </AbsoluteFill>
    </Panel>
  );
};

// ---------------------------------------------------------------- invisible

export const Invisible: React.FC = () => {
  const { t, env } = useT();
  const words = [
    { at: 2.1, text: "אי אפשר לראות" },
    { at: 4.2, text: "אי אפשר להריח" },
    { at: 6.2, text: "אי אפשר לשמוע" },
  ];
  return (
    <AbsoluteFill
      style={{ opacity: env, alignItems: "center", justifyContent: "center" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 34,
          alignItems: "center",
        }}
      >
        {words.map((w) => {
          const o = appear(t, w.at, 0.5);
          return (
            <div
              key={w.text}
              style={{
                fontFamily: SERIF,
                fontSize: 92,
                color: H.paper,
                direction: "rtl",
                opacity: o,
                letterSpacing: 2 * (1 - o),
                textShadow: "0 4px 30px rgba(0,0,0,0.95)",
              }}
            >
              {w.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------------- toll

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export const Toll: React.FC = () => {
  const { t, env } = useT();
  const hiro = 140000 * easeOut(ramp(t, 2.7, 5.4));
  const naga = 70000 * easeOut(ramp(t, 6.2, 8.4));
  const cols = [
    { name: "הירושימה", n: hiro, at: 2.7 },
    { name: "נגסקי", n: naga, at: 6.2 },
  ];
  return (
    <AbsoluteFill
      style={{
        opacity: env,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 40,
          color: H.paperDim,
          direction: "rtl",
          opacity: appear(t, 0.2),
          marginBottom: 60,
        }}
      >
        הרוגים עד סוף 1945 · ההערכות המקובלות
      </div>
      <div style={{ display: "flex", direction: "rtl", gap: 200 }}>
        {cols.map((c) => (
          <div
            key={c.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: appear(t, c.at - 0.3),
            }}
          >
            <div
              style={{
                fontFamily: SERIF_LATIN,
                fontSize: 170,
                lineHeight: 1,
                color: H.paper,
                fontVariantNumeric: "tabular-nums",
                direction: "ltr",
              }}
            >
              <span style={{ fontSize: 90, color: H.muted }}>~</span>
              {fmt(c.n)}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 62,
                color: H.ember,
                marginTop: 16,
              }}
            >
              {c.name}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 70,
          fontFamily: SERIF,
          fontSize: 46,
          color: H.paper,
          direction: "rtl",
          opacity: appear(t, 9.4),
        }}
      >
        המספרים המדויקים אינם ידועים
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- leukemia

/**
 * The shape of the leukaemia excess among survivors: a rise from about two
 * years after exposure, a peak some years later, then a decline; steeper for
 * higher doses. Drawn as a trend, not as data, and labelled so.
 */
export const Leukemia: React.FC = () => {
  const { t, env } = useT();
  const X0 = 360;
  const X1 = 1560;
  const Y0 = 800;
  const Y1 = 330;
  const year = (y: number) => X0 + ((y - 1945) / 30) * (X1 - X0);
  const curve = (amp: number) => {
    const pts: string[] = [];
    for (let y = 1945; y <= 1975; y += 0.25) {
      // x^2 e^(-x/tau), normalised to peak at 1 (x = 2 tau after 1947).
      const x = y - 1947;
      const tau = 2.6;
      const v =
        x <= 0
          ? 0
          : amp * 0.85 * Math.pow(x / (2 * tau), 2) * Math.exp(2 - x / tau);
      pts.push(`${year(y)},${Y0 - v * (Y0 - Y1)}`);
    }
    return pts.join(" ");
  };
  const draw = easeInOut(ramp(t, 1.0, 7.4));
  const second = easeInOut(ramp(t, 11.4, 13.6));
  const clip = X0 + (X1 - X0) * draw;
  return (
    <Panel dark={1}>
      <AbsoluteFill style={{ opacity: env }}>
        <div
          style={{
            position: "absolute",
            top: 110,
            right: 110,
            fontFamily: SERIF,
            fontSize: 64,
            color: H.paper,
            direction: "rtl",
            opacity: appear(t, 0.3),
          }}
        >
          לוקמיה בקרב הניצולים
        </div>
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <clipPath id="leuk-draw">
              <rect x={0} y={0} width={clip} height={1080} />
            </clipPath>
            <clipPath id="leuk-draw-2">
              <rect x={0} y={0} width={X0 + (X1 - X0) * second} height={1080} />
            </clipPath>
          </defs>
          <line
            x1={X0}
            y1={Y0}
            x2={X1}
            y2={Y0}
            stroke={H.paperDim}
            strokeWidth={2.5}
          />
          {[1945, 1950, 1955, 1960, 1965, 1970, 1975].map((y) => (
            <g key={y}>
              <line
                x1={year(y)}
                y1={Y0}
                x2={year(y)}
                y2={Y0 + 14}
                stroke={H.paperDim}
                strokeWidth={2}
              />
              <text
                x={year(y)}
                y={Y0 + 54}
                textAnchor="middle"
                fontFamily={SERIF_LATIN}
                fontSize={32}
                fill={H.paperDim}
              >
                {y}
              </text>
            </g>
          ))}
          <polyline
            points={curve(0.45)}
            fill="none"
            stroke={H.paperDim}
            strokeWidth={4}
            clipPath="url(#leuk-draw-2)"
            strokeDasharray="10 8"
          />
          <polyline
            points={curve(1)}
            fill="none"
            stroke={H.ember}
            strokeWidth={6}
            clipPath="url(#leuk-draw)"
            strokeLinejoin="round"
          />
          <g opacity={appear(t, 4.6)}>
            <line
              x1={year(1947)}
              y1={Y0 - 10}
              x2={year(1947)}
              y2={Y0 - 150}
              stroke={H.paper}
              strokeWidth={2}
              strokeDasharray="6 6"
            />
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            left: year(1947) - 150,
            top: Y0 - 210,
            width: 300,
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 32,
            color: H.paper,
            direction: "rtl",
            opacity: appear(t, 4.6),
          }}
        >
          כעבור כשנתיים
        </div>
        <div
          style={{
            position: "absolute",
            left: year(1952.2) - 150,
            top: Y0 - 0.85 * (Y0 - Y1) - 70,
            width: 300,
            textAlign: "center",
            fontFamily: SANS,
            fontSize: 32,
            color: H.ember,
            direction: "rtl",
            opacity: appear(t, 7.6),
          }}
        >
          שיא, כמה שנים אחרי
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 130,
            right: 110,
            display: "flex",
            gap: 50,
            direction: "rtl",
            fontFamily: SANS,
            fontSize: 32,
          }}
        >
          <span style={{ color: H.ember, opacity: appear(t, 11.4) }}>
            ━ מנת קרינה גבוהה
          </span>
          <span style={{ color: H.paperDim, opacity: appear(t, 12.2) }}>
            ┅ מנה נמוכה יותר
          </span>
        </div>
        <Footnote
          text="איור סכמטי של המגמה · לא בקנה מידה"
          o={appear(t, 1.4)}
        />
      </AbsoluteFill>
    </Panel>
  );
};

// --------------------------------------------------------------------- book

/**
 * "Last Train from Hiroshima": a plain typographic cover (not the
 * publisher's), the page it describes kept illegible on purpose, and the
 * verdict on it.
 */
export const Book: React.FC<{ state: "title" | "page" | "disputed" }> = ({
  state,
}) => {
  const { t, env } = useT();
  const cover = (
    <div
      style={{
        width: 520,
        height: 760,
        background: "linear-gradient(160deg, #1d1b19 0%, #121110 100%)",
        border: "1.5px solid #4a443b",
        boxShadow:
          "0 40px 120px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 50,
        position: "relative",
        transform: `rotate(${state === "disputed" ? -2 : -3}deg)`,
      }}
    >
      <div
        style={{
          fontFamily: SERIF_LATIN,
          fontSize: 30,
          letterSpacing: 10,
          color: H.paperDim,
          paddingLeft: 10,
        }}
      >
        THE
      </div>
      <div
        style={{
          fontFamily: SERIF_LATIN,
          fontWeight: 700,
          fontSize: 74,
          lineHeight: 1.05,
          color: H.paper,
          textAlign: "center",
          marginTop: 20,
        }}
      >
        LAST TRAIN FROM HIROSHIMA
      </div>
      <div
        style={{ width: 220, height: 2, background: H.ember, margin: "40px 0" }}
      />
      <div
        style={{
          fontFamily: SERIF_LATIN,
          fontSize: 30,
          letterSpacing: 6,
          color: H.paperDim,
        }}
      >
        2010
      </div>
    </div>
  );

  if (state === "page") {
    const sweep = ramp(t, 0.6, 8.6);
    return (
      <AbsoluteFill
        style={{
          background: H.black,
          alignItems: "center",
          justifyContent: "center",
          opacity: env,
        }}
      >
        <div
          style={{
            width: 900,
            height: 880,
            background: "#d9d0bd",
            boxShadow: "0 40px 120px rgba(0,0,0,0.9)",
            padding: "80px 90px",
            transform: `rotate(1.5deg) scale(${1.02 + (0.08 * t) / 10})`,
            filter: "sepia(0.3) brightness(0.8)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: 22 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 14,
                marginBottom: 20,
                width: `${70 + hash(i * 3.1) * 30}%`,
                background: "#6d6556",
                opacity: 0.55,
                filter: "blur(2.2px)",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 70 + sweep * 700,
              height: 70,
              background:
                "linear-gradient(to bottom, rgba(224,106,53,0), rgba(224,106,53,0.28), rgba(224,106,53,0))",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 90,
            fontFamily: SANS,
            fontSize: 32,
            color: H.paperDim,
            direction: "rtl",
          }}
        >
          תיאור מתוך הספר · לא עדות מאומתת
        </div>
      </AbsoluteFill>
    );
  }

  const disputed = state === "disputed";
  const doubt = appear(t, 3.1);
  const sources = appear(t, 7.0);
  const stamp1 = easeOut(ramp(t, 10.9, 11.3));
  const stamp2 = easeOut(ramp(t, 14.6, 15.0));
  const stamp = (text: string, o: number, rot: number, top: number) => (
    <div
      style={{
        position: "absolute",
        top,
        left: "50%",
        transform: `translateX(-50%) rotate(${rot}deg) scale(${1.4 - 0.4 * o})`,
        opacity: o,
        border: `5px solid ${H.red}`,
        color: "#e0353f",
        background: "rgba(18,8,8,0.88)",
        padding: "12px 34px",
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 54,
        whiteSpace: "nowrap",
        direction: "rtl",
        letterSpacing: 2,
        boxShadow: "0 0 0 2px rgba(168,23,31,0.3)",
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: H.black, opacity: env }}>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          direction: "rtl",
          alignItems: "center",
          justifyContent: "center",
          gap: 140,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 26,
            width: 640,
            direction: "rtl",
          }}
        >
          {disputed ? (
            <>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 64,
                  color: H.paper,
                  opacity: doubt,
                }}
              >
                אמינות הספר הוטלה בספק
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 40,
                  color: H.paperDim,
                  opacity: sources,
                }}
              >
                חלק מהמקורות שעליהם הסתמך התבררו כמפוברקים
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 40,
                  color: H.paperDim,
                  opacity: appear(t, 11.2),
                }}
              >
                ההוצאה לאור הפסיקה להפיץ אותו
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 36,
                  color: H.paperDim,
                  opacity: appear(t, 0.4),
                }}
              >
                התיאור מופיע בספר
              </div>
              <div
                style={{
                  fontFamily: SERIF_LATIN,
                  fontSize: 64,
                  color: H.paper,
                  direction: "ltr",
                  textAlign: "right",
                  opacity: appear(t, 0.9),
                }}
              >
                The Last Train from Hiroshima
              </div>
            </>
          )}
        </div>
        <div
          style={{
            position: "relative",
            opacity: appear(t, 0.1, 0.8),
            transform: `translateY(${(1 - appear(t, 0.1, 0.8)) * 30}px)`,
          }}
        >
          {cover}
          {disputed ? stamp("הופסקה ההפצה", stamp1, -10, 470) : null}
          {disputed ? stamp("לא עדות מאומתת", stamp2, 7, 590) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
