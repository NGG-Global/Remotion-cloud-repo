import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { JAPANESE } from "../fonts";
import {
  easeIn,
  easeOut,
  H,
  hash,
  ramp,
  SANS,
  SERIF,
  SERIF_LATIN,
} from "../theme";

const HEBREW = /[֐-׿]/;

/** Fade in over `a` frames, out over `b`, for a sequence of `len` frames. */
const envelope = (frame: number, len: number, a = 14, b = 14) =>
  Math.min(easeOut(ramp(frame, 0, a)), 1 - easeIn(ramp(frame, len - b, len)));

/**
 * Place and date, lower right (the reading start in Hebrew). A short ember
 * rule marks it; nothing else competes with the picture.
 */
export const Caption: React.FC<{ title: string; sub?: string }> = ({
  title,
  sub,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = envelope(frame, durationInFrames, 16, 14);
  const rule = easeOut(ramp(frame, 4, 26));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          right: 110,
          bottom: 104,
          direction: "rtl",
          opacity: o,
          transform: `translateY(${(1 - o) * 10}px)`,
          display: "flex",
          alignItems: "stretch",
          gap: 22,
          textShadow: "0 2px 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            width: 4,
            background: H.ember,
            transform: `scaleY(${rule})`,
            transformOrigin: "top",
            boxShadow: "0 0 12px rgba(224,106,53,0.6)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontFamily: HEBREW.test(title) ? SANS : SERIF_LATIN,
              fontWeight: 600,
              fontSize: 46,
              color: H.paper,
              letterSpacing: HEBREW.test(title) ? 0 : 1,
              direction: HEBREW.test(title) ? "rtl" : "ltr",
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          {sub ? (
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 30,
                color: H.paperDim,
                lineHeight: 1.1,
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Chapter title laid over the picture as the chapter starts: the numeral in
 * the serif, the title beneath, both on a soft dark band so they hold over
 * any footage. The narration does not pause for it.
 */
export const ChapterTitle: React.FC<{ n: string; title: string }> = ({
  n,
  title,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = envelope(frame, durationInFrames, 18, 22);
  const rule = easeOut(ramp(frame, 8, 40));
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        alignItems: "center",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 42% at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          transform: `translateY(${(1 - o) * 12}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            direction: "rtl",
            alignItems: "baseline",
            gap: 18,
            color: H.ember,
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 34, letterSpacing: 4 }}>
            פרק
          </span>
          <span
            style={{ fontFamily: SERIF_LATIN, fontSize: 46, letterSpacing: 6 }}
          >
            {n}
          </span>
        </div>
        <div
          style={{
            width: 420 * rule,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${H.paperDim}, transparent)`,
          }}
        />
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 96,
            color: H.paper,
            direction: "rtl",
            textShadow: "0 4px 30px rgba(0,0,0,0.9)",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** One large statement: a figure, a name, a word in Japanese. */
export const KineticText: React.FC<{
  big: string;
  small?: string;
  note?: string;
  latin?: boolean;
  pos?: "center" | "low";
}> = ({ big, small, note, latin, pos = "center" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = envelope(frame, durationInFrames, 12, 14);
  const s2 = easeOut(ramp(frame, 8, 26));
  const japanese = /[぀-ヿ一-鿿]/.test(big);
  const hebrew = HEBREW.test(big);
  const family = japanese
    ? JAPANESE
    : hebrew
      ? SERIF
      : latin
        ? SERIF_LATIN
        : SANS;
  const low = pos === "low";
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        alignItems: "center",
        justifyContent: low ? "flex-end" : "center",
        paddingBottom: low ? 130 : 0,
        opacity: o,
      }}
    >
      <AbsoluteFill
        style={{
          background: low
            ? "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 55%)"
            : "radial-gradient(55% 45% at 50% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          fontFamily: family,
          fontWeight: japanese ? 600 : hebrew ? 500 : 600,
          fontSize: japanese ? 150 : low ? 92 : 190,
          lineHeight: 1,
          color: H.paper,
          direction: hebrew ? "rtl" : "ltr",
          letterSpacing: japanese ? 18 : latin ? 2 : 0,
          transform: `scale(${0.96 + 0.04 * o})`,
          textShadow: "0 6px 40px rgba(0,0,0,0.85)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {big}
      </div>
      {small ? (
        <div
          style={{
            marginTop: low ? 18 : 26,
            fontFamily: HEBREW.test(small) ? SANS : SERIF_LATIN,
            fontSize: low ? 38 : 50,
            fontWeight: 400,
            color: H.paper,
            opacity: s2,
            direction: HEBREW.test(small) ? "rtl" : "ltr",
            letterSpacing: HEBREW.test(small) ? 1 : 3,
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
          }}
        >
          {small}
        </div>
      ) : null}
      {note ? (
        <div
          style={{
            marginTop: 14,
            fontFamily: SERIF,
            fontSize: 40,
            color: H.paper,
            opacity: easeOut(ramp(frame, 22, 40)),
            direction: "rtl",
          }}
        >
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * The flash: the frame goes to white just before the cut and decays over a
 * second and a half, with a warm bloom that outlasts it.
 */
export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  // Sequence starts 4 frames before the cut.
  const rise = easeIn(ramp(frame, 0, 4));
  const decay = Math.exp(-Math.max(0, frame - 6) / 9);
  const white = frame < 4 ? rise : decay;
  const bloom = Math.exp(-Math.max(0, frame - 4) / 26) * 0.55;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(255,214,160,1) 0%, rgba(255,140,70,0.6) 45%, rgba(120,40,10,0) 80%)",
          opacity: bloom,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{ background: "#fffaf0", opacity: Math.min(1, white) }}
      />
    </AbsoluteFill>
  );
};

/**
 * Black rain: dark streaks falling at a slant, positioned from a seeded hash
 * so every render is identical. The scene beneath is also pressed down a
 * little, the way overcast light sits on a street.
 */
export const BlackRain: React.FC<{ strength: number }> = ({ strength }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const o = envelope(frame, durationInFrames, 30, 24) * strength;
  const drops = [];
  const N = 150;
  for (let i = 0; i < N; i++) {
    const speed = 26 + hash(i * 3.1) * 22;
    const len = 50 + hash(i * 7.7) * 90;
    const x0 = hash(i * 1.3) * (width + 300) - 150;
    const y =
      ((hash(i * 5.9) * (height + 400) + frame * speed) % (height + 400)) - 200;
    const x = x0 - (y + 200) * 0.18;
    const w = 1.2 + hash(i * 2.2) * 2.2;
    const a = 0.25 + hash(i * 4.4) * 0.45;
    drops.push(
      <line
        key={i}
        x1={x}
        y1={y}
        x2={x - len * 0.18}
        y2={y + len}
        stroke={`rgba(12,12,14,${a})`}
        strokeWidth={w}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <AbsoluteFill style={{ background: "rgba(10,10,12,0.28)" }} />
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {drops}
      </svg>
    </AbsoluteFill>
  );
};

/** Source credit, lower left, small; shown when the source changes. */
export const CreditTag: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = envelope(frame, durationInFrames, 12, 12) * 0.72;
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        bottom: 46,
        fontFamily: SANS,
        fontSize: 23,
        letterSpacing: 0.5,
        color: H.paper,
        opacity: o,
        direction: "ltr",
        textShadow: "0 1px 8px rgba(0,0,0,0.95)",
      }}
    >
      {text}
    </div>
  );
};

/** The subscribe reminder: a quiet pill with the series' mark and a bell. */
export const Subscribe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = envelope(frame, durationInFrames, 16, 18);
  const press = ramp(frame, 40, 52);
  const pressed = press >= 1;
  const ring =
    Math.sin(Math.max(0, frame - 60) * 0.7) *
    Math.exp(-Math.max(0, frame - 60) / 14) *
    18;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          bottom: 96,
          display: "flex",
          alignItems: "center",
          gap: 22,
          direction: "rtl",
          opacity: o,
          transform: `translateY(${(1 - o) * 16}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 34px",
            borderRadius: 999,
            background: pressed ? "rgba(40,36,32,0.92)" : H.red,
            border: `2px solid ${pressed ? H.paperDim : H.red}`,
            transform: `scale(${1 - 0.06 * Math.sin(press * Math.PI)})`,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 36,
              color: H.paper,
            }}
          >
            {pressed ? "נרשמתם" : "הירשמו לערוץ"}
          </span>
        </div>
        <svg
          width={54}
          height={54}
          viewBox="0 0 24 24"
          style={{
            transform: `rotate(${ring}deg)`,
            transformOrigin: "50% 15%",
          }}
        >
          <path
            d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm0 19a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22z"
            fill={H.paper}
          />
        </svg>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 34,
            color: H.paperDim,
          }}
        >
          מאחורי הסיוט
        </div>
      </div>
    </AbsoluteFill>
  );
};
