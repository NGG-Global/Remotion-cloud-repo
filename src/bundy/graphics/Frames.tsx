import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { stillVariant, still } from "../data/edit";
import type { StillId } from "../data/stills";
import { B, easeIn, easeInOut, easeOut, ramp, SANS, SERIF, SERIF_LATIN } from "../theme";

/**
 * Schematics for the two escapes, and two frames for photographs: a 1970s
 * television set and an FBI notice. The schematics are labelled as drawings;
 * neither escape was photographed.
 */

const useT = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return {
    t: frame / fps,
    env: Math.min(easeOut(ramp(frame, 0, 12)), 1 - easeIn(ramp(frame, durationInFrames - 12, durationInFrames))),
  };
};

const Note: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", bottom: 64, left: 90, fontFamily: SANS, fontSize: 26, color: B.muted, direction: "rtl" }}>{text}</div>
);

/** The courthouse law library: a second-floor window, and the drop. */
export const Window: React.FC<{ variant?: string }> = ({ variant }) => {
  const { t, env } = useT();
  const full = variant === "full";
  const open = easeInOut(ramp(t, full ? 4.4 : 3.2, full ? 5.4 : 4.2));
  const drop = easeIn(ramp(t, full ? 5.4 : 4.3, full ? 6.4 : 5.2));
  const label = easeOut(ramp(t, full ? 5.8 : 4.8, full ? 6.6 : 5.6));
  const X0 = 600;
  const Y0 = 200;
  const Wd = 720;
  const floor = 300;
  const winX = X0 + 420;
  const winY = Y0 + 70;
  return (
    <AbsoluteFill style={{ background: B.black, opacity: env }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={X0} y={Y0} width={Wd} height={floor * 2} fill="#191a1d" stroke={B.paperDim} strokeWidth={3} />
        <line x1={X0} y1={Y0 + floor} x2={X0 + Wd} y2={Y0 + floor} stroke={B.muted} strokeWidth={2} strokeDasharray="8 8" />
        {[0, 1].map((fl) =>
          [0, 1, 2, 3].map((c) => {
            const x = X0 + 60 + c * 180;
            const y = Y0 + 70 + fl * floor;
            const isWin = fl === 0 && c === 2;
            return (
              <g key={`${fl}-${c}`}>
                <rect x={x} y={y} width={110} height={160} fill={isWin ? `rgba(201,72,59,${0.15 + 0.25 * open})` : "#26272b"} stroke={isWin ? B.ember : B.muted} strokeWidth={isWin ? 4 : 2} />
                {isWin ? (
                  <rect x={x} y={y} width={110 * (1 - open * 0.85)} height={160} fill="#3a3b40" stroke={B.paperDim} strokeWidth={2} />
                ) : null}
              </g>
            );
          }),
        )}
        <line x1={X0 - 160} y1={Y0 + floor * 2} x2={X0 + Wd + 160} y2={Y0 + floor * 2} stroke={B.paperDim} strokeWidth={3} />
        <path
          d={`M ${winX + 55} ${winY + 160} Q ${winX + 190} ${winY + 250} ${winX + 230} ${Y0 + floor * 2}`}
          fill="none"
          stroke={B.ember}
          strokeWidth={4}
          strokeDasharray="14 10"
          pathLength={1}
          strokeDashoffset={0}
          style={{ strokeDasharray: `${drop} 1` }}
        />
      </svg>
      <div style={{ position: "absolute", top: 120, right: 140, direction: "rtl", fontFamily: SERIF, fontSize: 56, color: B.paper, opacity: easeOut(ramp(t, 0.2, 0.8)) }}>
        ספריית המשפטים · קומה שנייה
      </div>
      <div style={{ position: "absolute", top: Y0 + floor * 2 - 140, left: winX + 260, direction: "rtl", fontFamily: SANS, fontSize: 44, color: B.paper, opacity: label, whiteSpace: "nowrap" }}>
        קפץ מהחלון ונמלט
      </div>
      <div style={{ position: "absolute", bottom: 120, right: 140, direction: "rtl", fontFamily: SANS, fontSize: 38, color: B.paperDim, opacity: easeOut(ramp(t, 0.6, 1.2)) }}>
        אספן, קולורדו · 7 ביוני 1977
      </div>
      <Note text="איור" />
    </AbsoluteFill>
  );
};

/** Glenwood Springs: a hole in the cell ceiling, the crawlspace, the way out. */
export const Ceiling: React.FC<{ variant?: string }> = ({ variant }) => {
  const { t, env } = useT();
  const full = variant === "full";
  const k = full ? 1 : 0.4;
  const hole = easeOut(ramp(t, 0.6 * k + (full ? 2.6 : 0), 1.4 * k + (full ? 3.0 : 0.6)));
  const path = easeInOut(ramp(t, full ? 5.8 : 1.6, full ? 10.6 : 4.8));
  const out = easeOut(ramp(t, full ? 10.8 : 4.8, full ? 11.6 : 5.4));
  const cells = [0, 1, 2, 3];
  return (
    <AbsoluteFill style={{ background: B.black, opacity: env }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={260} y={330} width={1400} height={110} fill="#15161a" stroke={B.muted} strokeWidth={2} strokeDasharray="10 8" />
        <text x={960} y={395} textAnchor="middle" fontFamily={SANS} fontSize={30} fill={B.muted}>
          החלל שמעל התאים
        </text>
        {cells.map((c) => (
          <g key={c}>
            <rect x={260 + c * 350} y={440} width={350} height={360} fill="#1c1d21" stroke={B.paperDim} strokeWidth={3} />
            {Array.from({ length: 6 }, (_, b) => (
              <line key={b} x1={300 + c * 350 + b * 50} y1={440} x2={300 + c * 350 + b * 50} y2={800} stroke="#2f3035" strokeWidth={6} />
            ))}
          </g>
        ))}
        <ellipse cx={435} cy={440} rx={60 * hole} ry={14 * hole} fill={B.black} stroke={B.ember} strokeWidth={4} />
        <path
          d="M 435 430 L 435 385 L 1580 385 L 1580 300"
          fill="none"
          stroke={B.ember}
          strokeWidth={5}
          pathLength={1}
          style={{ strokeDasharray: `${path} 1` }}
        />
        <rect x={1520} y={210} width={130} height={90} fill="none" stroke={B.paper} strokeWidth={3} opacity={out} />
      </svg>
      <div style={{ position: "absolute", top: 120, right: 140, direction: "rtl", fontFamily: SERIF, fontSize: 56, color: B.paper, opacity: easeOut(ramp(t, 0.1, 0.7)) }}>
        בית הכלא בגלנווד ספרינגס
      </div>
      <div style={{ position: "absolute", top: 860, left: 330, direction: "rtl", fontFamily: SANS, fontSize: 38, color: B.paper, opacity: hole }}>
        פתח בתקרת התא
      </div>
      <div style={{ position: "absolute", top: 232, right: 300, direction: "rtl", fontFamily: SANS, fontSize: 38, color: B.paper, opacity: out, whiteSpace: "nowrap" }}>
        יציאה מהמבנה, בלילה
      </div>
      <div style={{ position: "absolute", bottom: 100, right: 140, direction: "rtl", fontFamily: SANS, fontSize: 36, color: B.paperDim }}>
        דצמבר 1977
      </div>
      <Note text="איור" />
    </AbsoluteFill>
  );
};

const graded = (img: StillId) => staticFile(`bundy/graded/${stillVariant(still(img, { grade: "bw" }))}.jpg`);

/** A photograph on a 1970s television set. */
export const TV: React.FC<{ img: StillId; variant?: string }> = ({ img, variant }) => {
  const { t, env } = useT();
  const frame = useCurrentFrame();
  const zoom = 1 + 0.06 * easeInOut(ramp(t, 0, 12));
  const interview = variant === "interview";
  const flick = 0.92 + 0.08 * Math.sin(frame * 1.7) * Math.sin(frame * 0.37);
  return (
    <AbsoluteFill style={{ background: "#0a0908", opacity: env, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 1180,
          height: 860,
          borderRadius: 60,
          background: "linear-gradient(160deg, #4a3a2a, #2a2018)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          padding: 50,
          gap: 40,
          transform: `scale(${zoom})`,
        }}
      >
        <div style={{ position: "relative", width: 880, height: 720, borderRadius: 70, overflow: "hidden", background: "#111", boxShadow: "inset 0 0 80px rgba(0,0,0,0.95)" }}>
          {interview ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "radial-gradient(70% 60% at 50% 50%, #2a2a2a, #0c0c0c)", opacity: flick }}>
              <div style={{ fontFamily: SANS, fontSize: 52, color: B.paperDim, direction: "rtl", letterSpacing: 2 }}>הראיון האחרון</div>
              <div style={{ marginTop: 18, fontFamily: SANS, fontSize: 34, color: B.muted, direction: "rtl" }}>ערב ההוצאה להורג</div>
            </AbsoluteFill>
          ) : (
            <Img src={graded(img)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: flick, filter: "contrast(1.2) brightness(1.05)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 5px)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.8) 100%)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: "center" }}>
          {[0, 1].map((k) => (
            <div key={k} style={{ width: 90, height: 90, borderRadius: 45, background: "radial-gradient(circle at 35% 35%, #8a7a66, #2a2219)", boxShadow: "0 6px 14px rgba(0,0,0,0.7)" }} />
          ))}
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={`g${k}`} style={{ width: 120, height: 6, background: "#1a140f", borderRadius: 3 }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 70, right: 120, direction: "rtl", fontFamily: SANS, fontSize: 40, color: B.paper, opacity: easeOut(ramp(t, 0.6, 1.2)) }}>
        {interview ? "ראיון טלוויזיוני · 23 בינואר 1989" : "המשפט שודר בטלוויזיה · מיאמי, 1979"}
      </div>
      {interview ? null : (
        <div style={{ position: "absolute", bottom: 36, right: 120, direction: "rtl", fontFamily: SANS, fontSize: 26, color: B.muted, opacity: easeOut(ramp(t, 0.6, 1.2)) }}>
          בתמונה: תצלום סטילס של בנדי באולם, ארכיון מדינת פלורידה
        </div>
      )}
    </AbsoluteFill>
  );
};

/** The FBI photograph, with the fact of the listing. Not a facsimile poster. */
export const Wanted: React.FC = () => {
  const { t, env } = useT();
  const zoom = 1 + 0.05 * easeInOut(ramp(t, 0, 8));
  return (
    <AbsoluteFill style={{ background: B.black, opacity: env, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", direction: "rtl", alignItems: "center", gap: 90, transform: `scale(${zoom})` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, direction: "rtl", width: 700 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: B.ember, letterSpacing: 2, opacity: easeOut(ramp(t, 0.2, 0.8)) }}>מבוקש</div>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 84, color: B.paper, lineHeight: 1.05, opacity: easeOut(ramp(t, 0.5, 1.1)) }}>תמונותיו פורסמו בתקשורת</div>
          <div style={{ fontFamily: SANS, fontSize: 36, color: B.paperDim, opacity: easeOut(ramp(t, 2.4, 3.0)) }}>
            בפברואר 1978 נוסף לרשימת עשרת המבוקשים של ה־FBI
          </div>
        </div>
        <div style={{ position: "relative", padding: 18, background: "#e9e2d2", boxShadow: "0 30px 90px rgba(0,0,0,0.9)", opacity: easeOut(ramp(t, 0, 0.6)) }}>
          <Img src={graded("fbi")} style={{ width: 420, display: "block", filter: "contrast(1.1)" }} />
          <div style={{ fontFamily: SERIF_LATIN, fontSize: 26, color: "#2a2620", textAlign: "center", marginTop: 12, letterSpacing: 3 }}>THEODORE ROBERT BUNDY</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
