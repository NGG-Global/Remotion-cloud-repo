import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { useNarr } from "../components/Shot";
import { imageSrc } from "../components/Still";
import {
  AZ,
  clamp01,
  easeInOut,
  easeOut,
  hash,
  mix,
  ramp,
  SANS,
  SERIF,
  SERIF_LATIN,
} from "../theme";
import { Blueprint } from "./Diagrams";

const appear = (n: number, at: number, d = 0.45) => easeOut(ramp(n, at, at + d));

const Line: React.FC<{
  readonly text: string;
  readonly at: number;
  readonly size?: number;
  readonly color?: string;
  readonly font?: string;
  readonly weight?: number;
  readonly strike?: number;
}> = ({ text, at, size = 58, color = AZ.text, font = SERIF, weight = 500, strike }) => {
  const n = useNarr();
  const o = appear(n, at);
  const s = strike === undefined ? 0 : easeInOut(ramp(n, strike, strike + 0.4));
  return (
    <div
      style={{
        position: "relative",
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        direction: "rtl",
        opacity: o * (1 - 0.45 * s),
        transform: `translateX(${(1 - o) * -24}px)`,
        whiteSpace: "nowrap",
        textShadow: "0 3px 24px rgba(0,0,0,0.9)",
      }}
    >
      {text}
      {strike !== undefined ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "54%",
            height: 4,
            width: `${s * 100}%`,
            background: AZ.red,
          }}
        />
      ) : null}
    </div>
  );
};

const Column: React.FC<{ readonly children: React.ReactNode; readonly gap?: number; readonly align?: "center" | "flex-end" }> = ({
  children,
  gap = 26,
  align = "center",
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: align,
      paddingRight: align === "flex-end" ? 200 : 0,
      flexDirection: "column",
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

/* --------------------------------------------------------------- cold open */

/** A cell door closing on the last strip of light, under the ground. */
export const DarkCell: React.FC = () => {
  const n = useNarr();
  const gap = mix(140, 0, easeInOut(ramp(n, 0.6, 3.4)));
  const dust = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 18% at 50% 100%, rgba(200,190,160,${0.22 * (gap / 140)}) 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - gap / 2,
          width: gap,
          top: 180,
          bottom: 0,
          background: "linear-gradient(180deg, rgba(220,210,180,0.05), rgba(220,210,180,0.55))",
          filter: "blur(2px)",
        }}
      />
      {Array.from({ length: 26 }).map((_, i) => {
        const x = 960 + (hash(i) - 0.5) * gap * 0.9;
        const y = 300 + ((hash(i + 40) * 780 + dust * (0.4 + hash(i + 9))) % 780);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 3,
              height: 3,
              borderRadius: 2,
              background: "rgba(240,230,200,0.6)",
              opacity: gap / 140,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Time with no reference point: a clock face whose hands will not settle. */
export const LostTime: React.FC = () => {
  const n = useNarr();
  const frame = useCurrentFrame();
  const o = ramp(n, 6.3, 7.2) * (1 - ramp(n, 9.6, 10.1));
  const a1 = frame * 2.3 + Math.sin(frame * 0.07) * 90;
  const a2 = -frame * 0.9 + Math.cos(frame * 0.05) * 140;
  return (
    <AbsoluteFill style={{ background: "#030405", alignItems: "center", justifyContent: "center" }}>
      <svg width={760} height={760} viewBox="-380 -380 760 760" style={{ opacity: o, filter: "blur(1.2px)" }}>
        <circle r={330} fill="none" stroke="rgba(231,223,204,0.35)" strokeWidth={4} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 290} y1={Math.sin(a) * 290} x2={Math.cos(a) * 320} y2={Math.sin(a) * 320} stroke="rgba(231,223,204,0.35)" strokeWidth={6} />;
        })}
        <line x1={0} y1={0} x2={0} y2={-230} stroke="rgba(231,223,204,0.55)" strokeWidth={10} strokeLinecap="round" transform={`rotate(${a1})`} />
        <line x1={0} y1={0} x2={0} y2={-160} stroke="rgba(231,223,204,0.55)" strokeWidth={14} strokeLinecap="round" transform={`rotate(${a2})`} />
        <text x={0} y={30} fontFamily={SERIF} fontSize={120} fill="rgba(231,223,204,0.18)" textAnchor="middle">
          ?
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/** A man seen from behind, wrists chained high to the bars, and the hours. */
export const ChainedToDoor: React.FC = () => {
  const n = useNarr();
  const reveal = easeOut(ramp(n, 15.8, 17.6));
  const hours = clamp01(ramp(n, 23.3, 24.6));
  const label = appear(n, 23.34, 0.6);
  return (
    <AbsoluteFill style={{ background: "#040506" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(45% 60% at 50% 40%, rgba(180,190,200,0.22) 0%, rgba(0,0,0,0) 70%)",
          opacity: reveal,
        }}
      />
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", opacity: reveal }}>
        {/* the door: frame and vertical bars, lit from the corridor beyond */}
        <rect x={610} y={60} width={700} height={1000} fill="rgba(160,170,180,0.07)" stroke="#55606b" strokeWidth={14} />
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x={640 + i * 64} y={60} width={12} height={1000} fill="#2b323a" />
        ))}
        <rect x={610} y={420} width={700} height={22} fill="#2b323a" />
        {/* the man, from behind */}
        <g fill="#000000">
          <ellipse cx={960} cy={360} rx={58} ry={68} />
          <path d="M880,440 Q960,410 1040,440 L1080,760 Q960,800 840,760 Z" />
          <path d="M890,450 L760,190 L790,176 L930,440 Z" />
          <path d="M1030,450 L1160,190 L1130,176 L990,440 Z" />
          <path d="M860,760 L880,1080 L950,1080 L960,800 Z" />
          <path d="M1060,760 L1040,1080 L970,1080 L960,800 Z" />
        </g>
        {/* chains at the wrists */}
        {[[770, 170], [1150, 170]].map(([x, y], i) => (
          <g key={i} stroke="#8a95a1" strokeWidth={5} fill="none">
            <ellipse cx={x} cy={y - 14} rx={12} ry={18} />
            <ellipse cx={x} cy={y - 44} rx={12} ry={18} />
            <ellipse cx={x} cy={y - 74} rx={12} ry={18} />
          </g>
        ))}
        {/* eight hours */}
        <g transform="translate(1560, 300)" opacity={label}>
          <circle r={120} fill="none" stroke="rgba(231,223,204,0.2)" strokeWidth={10} />
          <circle
            r={120}
            fill="none"
            stroke={AZ.red}
            strokeWidth={10}
            pathLength={1}
            strokeDasharray={`${hours * (8 / 12)} 1`}
            transform="rotate(-90)"
          />
          <text y={22} fontFamily={SERIF} fontSize={72} fill={AZ.text} textAnchor="middle">
            8
          </text>
          <text y={190} fontFamily={SERIF} fontSize={44} fill={AZ.text} textAnchor="middle" direction="rtl">
            שעות ביום
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ Simmons */

/** Every refusal answered by another punishment, as a running ledger. */
export const RefusalLedger: React.FC = () => {
  const n = useNarr();
  const rows = [
    { at: 180.12, a: "סירב להילחם", b: "מאסר" },
    { at: 183.66, a: "סירב לציית לפקודה", b: "עונש" },
    { at: 186.76, a: "סירב שוב", b: "עונש נוסף" },
  ];
  return (
    <Blueprint tint="#1a1916">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {rows.map((r, i) => {
            const o = appear(n, r.at);
            const o2 = appear(n, r.at + 0.9);
            return (
              <div key={i} style={{ display: "flex", direction: "rtl", alignItems: "center", gap: 40, opacity: o }}>
                <div style={{ width: 560, fontFamily: SERIF, fontSize: 62, color: AZ.paper, textAlign: "right" }}>{r.a}</div>
                <div style={{ width: 120, height: 3, background: AZ.fog, transform: `scaleX(${o2})`, transformOrigin: "right" }} />
                <div style={{ width: 360, fontFamily: SERIF, fontSize: 62, color: AZ.red, opacity: o2, fontWeight: 600 }}>{r.b}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};

/** Eight hours against the door, as the shadow of the bars crossing the wall. */
export const Waiting: React.FC = () => {
  const n = useNarr();
  const sweep = ramp(n, 213.9, 228.5);
  const hour = Math.min(8, 1 + Math.floor(sweep * 8));
  return (
    <AbsoluteFill style={{ background: "#0c0d0e" }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${100 + sweep * 40}deg, rgba(210,200,170,0.0) 20%, rgba(210,200,170,0.22) 45%, rgba(210,200,170,0.0) 75%)`,
        }}
      />
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <g transform={`translate(${mix(-500, 600, sweep)},0) skewX(${mix(-28, 22, sweep)})`} opacity={0.75}>
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={500 + i * 110} y={0} width={34} height={1080} fill="#000" />
          ))}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 140,
          fontFamily: SERIF_LATIN,
          fontSize: 92,
          color: AZ.paper,
          opacity: 0.85,
          letterSpacing: 4,
        }}
      >
        {`${hour}:00`}
      </div>
      <Column align="flex-end" gap={18}>
        <Line text="לא יכול להסתובב" at={222.16} size={64} />
        <Line text="לא יכול לשבת" at={223.56} size={64} />
        <Line text="רק לחכות" at={226.96} size={72} color={AZ.red} />
      </Column>
    </AbsoluteFill>
  );
};

/** The ACLU, public pressure, and the army stepping in. */
export const AcluCard: React.FC = () => {
  const n = useNarr();
  const arrow = easeInOut(ramp(n, 240.6, 242.0));
  return (
    <Blueprint tint="#1b1a17">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ fontFamily: SERIF_LATIN, fontSize: 170, color: AZ.paper, letterSpacing: 18, opacity: appear(n, 236.9, 0.6) }}>ACLU</div>
        <Line text="האיגוד האמריקאי לזכויות האזרח" at={235.0} size={50} color={AZ.paperDark} weight={400} />
        <div style={{ height: 50 }} />
        <div style={{ display: "flex", direction: "rtl", alignItems: "center", gap: 36 }}>
          <Line text="לחץ ציבורי" at={240.1} size={58} color={AZ.amber} />
          <div style={{ width: 220 * arrow, height: 3, background: AZ.amber }} />
          <Line text="התערבות בכירים בצבא" at={242.86} size={58} />
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};

/** From the Armistice to Simmons's release: fifteen months after the war. */
export const SimmonsTimeline: React.FC = () => {
  const n = useNarr();
  const right = 1500;
  const left = 420;
  const release = appear(n, 247.32);
  const war = appear(n, 250.6);
  const bar = easeInOut(ramp(n, 250.9, 252.2));
  return (
    <Blueprint tint="#1a1916">
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <line x1={right} x2={left} y1={560} y2={560} stroke="rgba(154,166,178,0.35)" strokeWidth={3} />
        <line x1={right} x2={mix(right, left, bar)} y1={560} y2={560} stroke={AZ.red} strokeWidth={8} />
        <g opacity={war}>
          <circle cx={right} cy={560} r={16} fill={AZ.paper} />
          <text x={right} y={500} fontFamily={SERIF_LATIN} fontSize={52} fill={AZ.paper} textAnchor="middle">11.1918</text>
          <text x={right} y={640} fontFamily={SERIF} fontSize={42} fill={AZ.paperDark} textAnchor="middle" direction="rtl">סוף מלחמת העולם הראשונה</text>
        </g>
        <g opacity={release}>
          <circle cx={left} cy={560} r={16} fill={AZ.red} />
          <text x={left} y={500} fontFamily={SERIF_LATIN} fontSize={52} fill={AZ.text} textAnchor="middle">2.1920</text>
          <text x={left} y={640} fontFamily={SERIF} fontSize={42} fill={AZ.text} textAnchor="middle" direction="rtl">סימונס משוחרר</text>
        </g>
        <text x={(left + right) / 2} y={760} fontFamily={SERIF} fontSize={60} fill={AZ.red} textAnchor="middle" direction="rtl" opacity={appear(n, 251.6)}>
          כ-15 חודשים
        </text>
      </svg>
    </Blueprint>
  );
};

/* ------------------------------------------------------------------ 1938 */

/** Royal Cline, the guard killed in the attempt. No photograph: his name. */
export const MemorialCard: React.FC = () => {
  const n = useNarr();
  return (
    <AbsoluteFill style={{ background: "#050506" }}>
      <Column gap={22}>
        <Line text="רויאל קליין" at={432.2} size={96} />
        <Line text="סוהר באלקטרז · 1938" at={432.9} size={42} color={AZ.paperDark} weight={400} font={SANS} />
        <div style={{ height: 30 }} />
        <Line text="הפציעות היו קטלניות" at={434.3} size={48} color={AZ.red} />
      </Column>
      <AbsoluteFill style={{ opacity: 0.12 * ramp(n, 432, 434), background: "radial-gradient(40% 40% at 50% 50%, #ffffff, transparent)" }} />
    </AbsoluteFill>
  );
};

/** What became of the three: one shot dead, one wounded, one surrendered. */
export const OutcomeBoard: React.FC = () => {
  const n = useNarr();
  const rows = [
    { at: 444.34, name: "תומאס לימריק", fate: "נורה למוות", color: AZ.red },
    { at: 445.94, name: "רופוס פרנקלין", fate: "נפצע", color: AZ.amber },
    { at: 447.0, name: "ג'יימס לוקאס", fate: "נכנע", color: AZ.fog },
  ];
  const sum = appear(n, 450.68, 0.6);
  const dim = 1 - 0.55 * sum;
  return (
    <Blueprint tint="#151a20">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 34 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", direction: "rtl", gap: 50, alignItems: "baseline", opacity: appear(n, r.at) * dim }}>
            <div style={{ width: 560, textAlign: "right", fontFamily: SERIF, fontSize: 66, color: AZ.text }}>{r.name}</div>
            <div style={{ width: 420, fontFamily: SERIF, fontSize: 66, color: r.color, fontWeight: 600 }}>{r.fate}</div>
          </div>
        ))}
        <div style={{ height: 30 }} />
        <div style={{ display: "flex", direction: "rtl", gap: 60, opacity: sum }}>
          <Tally n={n} at={452.24} text="סוהר מת" />
          <Tally n={n} at={453.26} text="אסיר מת" />
          <Tally n={n} at={453.92} text="אסיר פצוע" />
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};

const Tally: React.FC<{ readonly n: number; readonly at: number; readonly text: string }> = ({ n, at, text }) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 46,
      color: AZ.paper,
      padding: "10px 26px",
      border: `2px solid ${AZ.red}`,
      opacity: appear(n, at),
    }}
  >
    {text}
  </div>
);

/* ------------------------------------------------------------------ 1946 */

/** The one thing the plan needed and never had: the key to the yard door. */
export const KeyMissing: React.FC = () => {
  const n = useNarr();
  const key = appear(n, 482.2, 0.7);
  const cross = easeInOut(ramp(n, 485.2, 485.9));
  return (
    <Blueprint tint="#141820">
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <g transform="translate(960,470)" opacity={key}>
          <circle cx={-260} cy={0} r={90} fill="none" stroke={AZ.paper} strokeWidth={16} />
          <rect x={-170} y={-14} width={420} height={28} fill={AZ.paper} />
          <rect x={170} y={14} width={26} height={70} fill={AZ.paper} />
          <rect x={220} y={14} width={26} height={50} fill={AZ.paper} />
          <text x={-260} y={16} fontFamily={SERIF_LATIN} fontSize={48} fill={AZ.paper} textAnchor="middle">107</text>
        </g>
        <g opacity={cross}>
          <line x1={640} y1={300} x2={1280} y2={640} stroke={AZ.red} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - cross} />
        </g>
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 190 }}>
        <Line text="המפתח לדלת החצר — לא נמצא" at={484.3} size={56} />
      </AbsoluteFill>
    </Blueprint>
  );
};

/** Three days, 2 to 4 May 1946, each lighting as the fighting goes on. */
export const ThreeDays: React.FC = () => {
  const n = useNarr();
  const days = ["2 במאי", "3 במאי", "4 במאי"];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", direction: "rtl", gap: 36 }}>
        {days.map((d, i) => {
          const o = appear(n, 506.36 + i * 0.45);
          return (
            <div
              key={d}
              style={{
                width: 300,
                padding: "26px 0",
                textAlign: "center",
                fontFamily: SERIF,
                fontSize: 54,
                color: AZ.text,
                background: `rgba(192,38,45,${0.25 * o})`,
                border: `2px solid rgba(192,38,45,${o})`,
                opacity: o,
                textShadow: "0 2px 18px rgba(0,0,0,0.9)",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 230, fontFamily: SERIF_LATIN, fontSize: 46, letterSpacing: 10, color: AZ.paper, opacity: appear(n, 507.6) }}>
        1946
      </div>
    </AbsoluteFill>
  );
};

/** Five dead: three prisoners and two officers. */
export const Casualties: React.FC = () => {
  const n = useNarr();
  const five = appear(n, 522.06, 0.6);
  const split = easeInOut(ramp(n, 524.0, 525.8));
  return (
    <Blueprint tint="#170f10">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 30 }}>
        <div style={{ fontFamily: SERIF_LATIN, fontSize: 260, color: AZ.text, opacity: five * (1 - 0.6 * split), lineHeight: 1 }}>5</div>
        <div style={{ display: "flex", direction: "rtl", gap: 120, opacity: split }}>
          <Group count={3} label="אסירים" color={AZ.paper} />
          <Group count={2} label="סוהרים" color={AZ.ice} />
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};

const Group: React.FC<{ readonly count: number; readonly label: string; readonly color: string }> = ({ count, label, color }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <svg width={count * 90} height={140} viewBox={`0 0 ${count * 90} 140`}>
      {Array.from({ length: count }).map((_, i) => (
        <g key={i} transform={`translate(${45 + i * 90}, 0)`} fill={color}>
          <circle cx={0} cy={28} r={22} />
          <rect x={-26} y={56} width={52} height={80} rx={18} />
        </g>
      ))}
    </svg>
    <div style={{ fontFamily: SERIF, fontSize: 56, color }}>{label}</div>
  </div>
);

/* ------------------------------------------------------------------ 1962 */

/** Lights out, three sleepers, a guard's torch passing along the tier. */
export const NightCell: React.FC = () => {
  const n = useNarr();
  const torch = ramp(n, 570.4, 573.6);
  const seemed = appear(n, 574.36, 0.5);
  return (
    <AbsoluteFill style={{ background: "#03060a" }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="torch">
            <stop offset="0%" stopColor="rgba(240,230,200,0.5)" />
            <stop offset="100%" stopColor="rgba(240,230,200,0)" />
          </radialGradient>
        </defs>
        {[0, 1, 2].map((i) => {
          const x0 = 180 + i * 560;
          return (
            <g key={i}>
              <rect x={x0} y={220} width={480} height={640} fill="#070b10" stroke="#1f2730" strokeWidth={6} />
              <rect x={x0 + 40} y={640} width={400} height={90} rx={10} fill="#141b23" />
              <path d={`M${x0 + 80},650 Q${x0 + 240},600 ${x0 + 420},655 L${x0 + 420},700 L${x0 + 80},700 Z`} fill="#1d2630" />
              <ellipse cx={x0 + 95} cy={640} rx={34} ry={26} fill="#2a2420" />
              {Array.from({ length: 8 }).map((_, j) => (
                <rect key={j} x={x0 + 20 + j * 58} y={220} width={10} height={640} fill="#0c1218" />
              ))}
            </g>
          );
        })}
        <ellipse cx={mix(-200, 2100, torch)} cy={660} rx={260} ry={200} fill="url(#torch)" opacity={torch > 0 && torch < 1 ? 1 : 0} />
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 90 }}>
        <div style={{ fontFamily: SERIF, fontSize: 52, color: AZ.paper, direction: "rtl", opacity: seemed }}>…או לפחות כך זה נראה</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Three endings, none of them proven. */
export const ThreeFates: React.FC = () => {
  const n = useNarr();
  const fates = [
    { at: 696.48, title: "טבעו במפרץ", icon: "waves" },
    { at: 698.24, title: "אחד הגיע לחוף", icon: "shore" },
    { at: 700.12, title: "חיים חדשים", icon: "road" },
  ];
  const doubt = easeInOut(ramp(n, 705.62, 706.6));
  return (
    <Blueprint tint="#10161d">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", direction: "rtl", gap: 50 }}>
          {fates.map((f, i) => {
            const o = appear(n, f.at);
            const active = ramp(n, f.at, f.at + 0.3) * (1 - ramp(n, (fates[i + 1]?.at ?? 703.5), (fates[i + 1]?.at ?? 703.5) + 0.3));
            return (
              <div
                key={f.title}
                style={{
                  width: 440,
                  height: 440,
                  border: `2px solid rgba(238,240,242,${0.25 + 0.6 * active})`,
                  background: `rgba(185,214,234,${0.04 + 0.08 * active})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 40,
                  opacity: o * (1 - 0.55 * doubt),
                }}
              >
                <FateIcon kind={f.icon} />
                <div style={{ fontFamily: SERIF, fontSize: 54, color: AZ.text }}>{f.title}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
        <Line text="אפשרויות — לא עובדות מוכחות" at={706.0} size={56} color={AZ.amber} />
      </AbsoluteFill>
    </Blueprint>
  );
};

const FateIcon: React.FC<{ readonly kind: string }> = ({ kind }) => (
  <svg width={200} height={140} viewBox="0 0 200 140" fill="none" stroke={AZ.ice} strokeWidth={6} strokeLinecap="round">
    {kind === "waves" ? (
      <>
        <path d="M10,50 Q35,30 60,50 T110,50 T160,50 T190,50" />
        <path d="M10,90 Q35,70 60,90 T110,90 T160,90 T190,90" />
      </>
    ) : kind === "shore" ? (
      <>
        <path d="M10,100 Q60,80 100,100 T190,100" />
        <path d="M120,96 L140,40 L160,96" />
        <circle cx={60} cy={60} r={12} />
      </>
    ) : (
      <>
        <path d="M100,130 L80,20" />
        <path d="M100,130 L120,20" />
        <path d="M30,130 H170" />
      </>
    )}
  </svg>
);

/** Out of the cell, past the guards, into the water — and still not free. */
export const Checklist: React.FC = () => {
  const n = useNarr();
  const items = [
    { at: 735.46, text: "לצאת מהתא", ok: true },
    { at: 737.38, text: "לעבור את השומרים", ok: true },
    { at: 739.36, text: "להיכנס למים בלי שיבחינו", ok: true },
    { at: 743.02, text: "לברוח מאלקטרז", ok: false },
  ];
  return (
    <Blueprint tint="#121820">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {items.map((it) => {
            const o = appear(n, it.at);
            const mark = easeOut(ramp(n, it.at + 0.4, it.at + 0.8));
            return (
              <div key={it.text} style={{ display: "flex", direction: "rtl", alignItems: "center", gap: 34, opacity: o }}>
                <svg width={70} height={70} viewBox="0 0 70 70">
                  <rect x={4} y={4} width={62} height={62} fill="none" stroke={AZ.fog} strokeWidth={3} />
                  {it.ok ? (
                    <path d="M16,36 L30,50 L56,20" fill="none" stroke={AZ.ice} strokeWidth={7} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - mark} strokeLinecap="round" />
                  ) : (
                    <path d="M18,18 L52,52 M52,18 L18,52" fill="none" stroke={AZ.red} strokeWidth={7} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - mark} strokeLinecap="round" />
                  )}
                </svg>
                <div style={{ fontFamily: SERIF, fontSize: 62, color: it.ok ? AZ.text : AZ.red, fontWeight: it.ok ? 400 : 600 }}>{it.text}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};

/* ------------------------------------------------------------------ closure */

/** Everything shipped across: food, equipment, fuel and fresh water. */
export const SupplyLine: React.FC = () => {
  const n = useNarr();
  const frame = useCurrentFrame();
  const items = [
    { at: 772.42, text: "מזון" },
    { at: 773.42, text: "ציוד" },
    { at: 774.28, text: "דלק" },
    { at: 775.42, text: "מים מתוקים" },
  ];
  const boat = (frame % 150) / 150;
  const route = appear(n, 768.14, 0.8);
  return (
    <Blueprint tint="#0f1a24">
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        {/* mainland on the right, island on the left */}
        <path d="M1500,0 C1560,300 1520,700 1600,1080 L1920,1080 L1920,0 Z" fill="#2e302c" stroke={AZ.landDark} strokeWidth={3} />
        <ellipse cx={420} cy={560} rx={180} ry={90} fill="#2e302c" stroke={AZ.landDark} strokeWidth={3} />
        <text x={420} y={700} fontFamily={SERIF} fontSize={44} fill={AZ.text} textAnchor="middle" direction="rtl">אלקטרז</text>
        <text x={1730} y={520} fontFamily={SERIF} fontSize={44} fill={AZ.text} textAnchor="middle" direction="rtl">היבשה</text>
        <path d="M1500,560 C1200,500 900,620 610,560" fill="none" stroke={AZ.amber} strokeWidth={3} strokeDasharray="14 12" opacity={route} />
        <g opacity={route} transform={`translate(${mix(1480, 630, boat)}, ${560 + Math.sin(boat * Math.PI) * -30})`}>
          <path d="M-36,-10 L36,-10 L26,12 L-26,12 Z" fill={AZ.paper} />
        </g>
        <text x={960} y={300} fontFamily={SERIF} fontSize={52} fill={AZ.paper} textAnchor="middle" direction="rtl" opacity={appear(n, 764.5)}>
          כל דבר הגיע בסירה
        </text>
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
        <div style={{ display: "flex", direction: "rtl", gap: 40 }}>
          {items.map((it) => (
            <div key={it.text} style={{ fontFamily: SERIF, fontSize: 56, color: AZ.text, padding: "8px 28px", borderBottom: `3px solid ${AZ.amber}`, opacity: appear(n, it.at) }}>
              {it.text}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};

/* ------------------------------------------------------------------ ending */

/** What really happened, as five entries in a ledger. */
export const RecapLedger: React.FC = () => {
  const n = useNarr();
  const rows = [
    { at: 843.06, year: "1918", text: "אנשים שנכבלו לדלתות ברזל" },
    { at: 846.26, year: "1918", text: "צינוק על סירוב לפקודה" },
    { at: 851.22, year: "1938", text: "סוהר שהוכה למוות בפטיש" },
    { at: 854.84, year: "1946", text: "שלושה ימים של יריות ופיצוצים" },
    { at: 858.82, year: "1962", text: "שלושה גברים שנעלמו בלילה" },
  ];
  return (
    <Blueprint tint="#141414">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {rows.map((r, i) => {
            const o = appear(n, r.at);
            const next = rows[i + 1]?.at ?? 866;
            const lit = 1 - 0.5 * ramp(n, next, next + 0.5);
            return (
              <div key={i} style={{ display: "flex", direction: "rtl", alignItems: "baseline", gap: 44, opacity: o * lit }}>
                <div style={{ width: 160, fontFamily: SERIF_LATIN, fontSize: 52, color: AZ.red, textAlign: "right" }}>{r.year}</div>
                <div style={{ fontFamily: SERIF, fontSize: 60, color: AZ.text }}>{r.text}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};

/**
 * Looking at the city through a barred window. The city is a photograph from
 * the Alcatraz ferry; the bars are drawn. Focus pulls from the city to the
 * bars on "impassable".
 */
export const WindowView: React.FC = () => {
  const n = useNarr();
  const push = easeInOut(ramp(n, 900.6, 914.0));
  const pull = easeInOut(ramp(n, 914.9, 917.5));
  const dusk = ramp(n, 920.9, 931.5);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1.0 + 0.08 * push})` }}>
        {/* The skyline sits in the ferry's upper windows, around (0.46, 0.24) of the photograph. */}
        <Img
          src={imageSrc("ferry-2020")}
          style={{
            position: "absolute",
            width: 2400 * 2.6,
            height: 1586 * 2.6,
            maxWidth: "none",
            left: 960 - 0.46 * 2400 * 2.6,
            top: 540 - 0.24 * 1586 * 2.6,
            filter: `grayscale(0.3) brightness(${0.9 - 0.5 * dusk}) blur(${0.8 + pull * 7}px)`,
          }}
        />
      </AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", filter: `blur(${(1 - pull) * 5}px)` }}>
        <path d="M0,0 H1920 V1080 H0 Z M360,120 V960 H1560 V120 Z" fill="#0b0c0d" fillRule="evenodd" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={360 + (i + 1) * 133} y={120} width={16} height={840} fill="#15181b" />
        ))}
        <rect x={360} y={520} width={1200} height={16} fill="#15181b" />
        <rect x={360} y={120} width={1200} height={840} fill="none" stroke="#1d2125" strokeWidth={24} />
      </svg>
    </AbsoluteFill>
  );
};

/** Subscribe, and the question the episode leaves open. */
export const EndCard: React.FC = () => {
  const n = useNarr();
  const sub = appear(n, 946.48, 0.5);
  const press = ramp(n, 947.2, 947.5) * (1 - ramp(n, 947.5, 947.9));
  const q = appear(n, 948.38, 0.6);
  return (
    <Blueprint tint="#121417">
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 60 }}>
        <div style={{ fontFamily: SERIF, fontSize: 58, color: AZ.text, direction: "rtl", opacity: q, textAlign: "center", lineHeight: 1.4 }}>
          מה לדעתכם קרה לשלושת האסירים
          <br />
          שנעלמו ב-1962?
        </div>
        <div style={{ display: "flex", direction: "rtl", gap: 50 }}>
          {[
            { at: 954.72, t: "טבעו במפרץ" },
            { at: 956.76, t: "הצליחו לברוח" },
          ].map((o) => (
            <div key={o.t} style={{ width: 460, padding: "26px 0", textAlign: "center", fontFamily: SERIF, fontSize: 52, color: AZ.text, border: `2px solid ${AZ.fog}`, opacity: appear(n, o.at) }}>
              {o.t}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "18px 54px",
            background: AZ.red,
            color: "#fff",
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 46,
            direction: "rtl",
            borderRadius: 8,
            opacity: sub,
            transform: `scale(${1 - 0.06 * press})`,
          }}
        >
          הירשמו לערוץ
        </div>
      </AbsoluteFill>
    </Blueprint>
  );
};
