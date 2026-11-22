import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sting as SeriesSting } from "../../doc/scenes/Sting";
import { STILLS } from "../data/stills";
import { JAPANESE } from "../fonts";
import {
  easeIn,
  easeInOut,
  easeOut,
  H,
  ramp,
  SANS,
  SERIF,
  SERIF_LATIN,
} from "../theme";

const sec = (s: number, fps: number) => s * fps;

/** Fade the whole card in and out. */
const useEnvelope = (inS = 0.5, outS = 0.5) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return Math.min(
    easeOut(ramp(frame, 0, sec(inS, fps))),
    1 -
      easeIn(ramp(frame, durationInFrames - sec(outS, fps), durationInFrames)),
  );
};

const Rise: React.FC<{
  at: number;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, dur = 0.7, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = easeOut(ramp(frame, sec(at, fps), sec(at + dur, fps)));
  return (
    <div
      style={{
        opacity: t,
        transform: `translateY(${(1 - t) * 16}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** The series mark, as in the other episodes, with this episode's name. */
export const Sting: React.FC<{ variant?: "open" | "close" }> = () => (
  <SeriesSting series="מאחורי הסיוט" episode="הירושימה ונגסקי" />
);

/** The episode title over the dome. */
export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = useEnvelope(0.6, 0.6);
  const rule = easeInOut(ramp(frame, sec(0.9, fps), sec(2.0, fps)));
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity: o }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(75% 55% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 70%)",
        }}
      />
      <Rise at={0.15} dur={1.0}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 168,
            color: H.paper,
            direction: "rtl",
            lineHeight: 1,
            textShadow: "0 8px 50px rgba(0,0,0,0.9)",
          }}
        >
          הירושימה ונגסקי
        </div>
      </Rise>
      <div
        style={{
          marginTop: 34,
          width: 640 * rule,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${H.ember} 30%, ${H.ember} 70%, transparent)`,
          boxShadow: "0 0 16px rgba(224,106,53,0.6)",
        }}
      />
      <Rise at={1.3} dur={0.9} style={{ marginTop: 30 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 64,
            color: H.paperDim,
            direction: "rtl",
            textShadow: "0 4px 30px rgba(0,0,0,0.9)",
          }}
        >
          הגיהנום שאחרי הפצצה
        </div>
      </Rise>
      <Rise at={2.0} dur={0.9} style={{ marginTop: 34 }}>
        <div
          style={{
            fontFamily: SERIF_LATIN,
            fontSize: 30,
            letterSpacing: 16,
            color: H.muted,
            paddingLeft: 16,
          }}
        >
          AUGUST · 1945
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

/** Black; "1", then a hard jump to "2". */
export const TwoBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const one = easeOut(ramp(frame, sec(1.1, fps), sec(1.7, fps)));
  const switchAt = sec(3.15, fps);
  const two = frame >= switchAt;
  const kick = two ? Math.exp(-(frame - switchAt) / 6) : 0;
  return (
    <AbsoluteFill
      style={{
        background: H.black,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: SERIF_LATIN,
          fontSize: 420,
          lineHeight: 1,
          color: two ? H.ember : H.paper,
          opacity: two ? 1 : one * 0.9,
          transform: `scale(${two ? 1 + kick * 0.12 : 0.97 + one * 0.03})`,
          textShadow: two
            ? `0 0 ${60 + kick * 80}px rgba(224,106,53,0.55)`
            : "none",
        }}
      >
        {two ? "2" : "1"}
      </div>
      <AbsoluteFill style={{ background: "#fff6ea", opacity: kick * 0.5 }} />
    </AbsoluteFill>
  );
};

/** Tsutomu Yamaguchi's name card. */
export const NameCard: React.FC<{ variant?: "intro" | "memorial" }> = ({
  variant = "intro",
}) => {
  const o = useEnvelope(0.4, 0.5);
  const intro = variant === "intro";
  return (
    <AbsoluteFill
      style={{
        background: intro ? H.black : "transparent",
        alignItems: "center",
        justifyContent: "center",
        opacity: o,
      }}
    >
      {intro ? (
        <Rise at={0.05}>
          <div
            style={{
              display: "flex",
              direction: "rtl",
              gap: 16,
              alignItems: "baseline",
              color: H.ember,
              marginBottom: 40,
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: 32, letterSpacing: 4 }}>
              פרק
            </span>
            <span
              style={{
                fontFamily: SERIF_LATIN,
                fontSize: 42,
                letterSpacing: 6,
              }}
            >
              VIII
            </span>
            <span style={{ fontFamily: SANS, fontSize: 32, color: H.paperDim }}>
              · האיש ששרד פעמיים
            </span>
          </div>
        </Rise>
      ) : null}
      <Rise at={0.2}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: intro ? 140 : 110,
            color: H.paper,
            direction: "rtl",
            lineHeight: 1,
            textShadow: "0 6px 40px rgba(0,0,0,0.9)",
          }}
        >
          צוטומו ימגוצ׳י
        </div>
      </Rise>
      <Rise
        at={0.6}
        style={{
          marginTop: 30,
          display: "flex",
          gap: 40,
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: SERIF_LATIN,
            fontSize: 40,
            color: H.paperDim,
            letterSpacing: 4,
          }}
        >
          1916 – 2010
        </span>
        <span style={{ width: 1.5, height: 44, background: H.muted }} />
        <span
          style={{
            fontFamily: JAPANESE,
            fontWeight: 600,
            fontSize: 44,
            color: H.paperDim,
            letterSpacing: 10,
          }}
        >
          山口 彊
        </span>
      </Rise>
    </AbsoluteFill>
  );
};

/** 11:02 on a plain clock face, the minute hand arriving on the voice. */
export const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = useEnvelope(0.4, 0.2);
  const sweep = easeInOut(ramp(frame, sec(0.2, fps), sec(2.4, fps)));
  const minutes = 10 * 60 + 52 + sweep * 10; // 10:52 -> 11:02
  const hAngle = ((minutes / 60) % 12) * 30;
  const mAngle = (minutes % 60) * 6;
  const R = 230;
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 * Math.PI) / 180;
    const long = i % 5 === 0;
    const r1 = R - (long ? 34 : 16);
    return (
      <line
        key={i}
        x1={Math.sin(a) * r1}
        y1={-Math.cos(a) * r1}
        x2={Math.sin(a) * (R - 6)}
        y2={-Math.cos(a) * (R - 6)}
        stroke={long ? H.paper : H.muted}
        strokeWidth={long ? 5 : 2}
      />
    );
  });
  const hand = (angle: number, len: number, w: number, color: string) => {
    const a = (angle * Math.PI) / 180;
    return (
      <line
        x1={0}
        y1={0}
        x2={Math.sin(a) * len}
        y2={-Math.cos(a) * len}
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
      />
    );
  };
  return (
    <AbsoluteFill
      style={{
        background: H.black,
        alignItems: "center",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 120,
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontFamily: SERIF_LATIN,
              fontSize: 170,
              color: H.paper,
              lineHeight: 1,
              direction: "ltr",
            }}
          >
            11:02
          </div>
          <div style={{ fontFamily: SANS, fontSize: 40, color: H.paperDim }}>
            נגסקי · 9 באוגוסט 1945
          </div>
        </div>
        <svg width={520} height={520} viewBox="-260 -260 520 520">
          <circle r={R} fill="#121417" stroke={H.paperDim} strokeWidth={3} />
          {ticks}
          {hand(hAngle, 130, 12, H.paper)}
          {hand(mAngle, 196, 7, H.ember)}
          <circle r={12} fill={H.ember} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/** One man, three days, two cities, two bombs. */
export const OneMan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = useEnvelope(0.5, 0.6);
  const items: [string, string, number][] = [
    ["1", "אדם", 1.4],
    ["3", "ימים", 2.8],
    ["2", "ערים", 4.2],
    ["2", "פצצות אטום", 5.3],
  ];
  const both = easeOut(ramp(frame, sec(7.2, fps), sec(8.2, fps)));
  const img = STILLS.cloudsBoth;
  return (
    <AbsoluteFill style={{ background: H.black, opacity: o }}>
      <AbsoluteFill style={{ opacity: 0.16 + 0.14 * both }}>
        <Img
          src={staticFile(`hiroshima/stills/${img.file}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1) blur(2px)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(7,8,10,0.75), rgba(7,8,10,0.95))",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            direction: "rtl",
            gap: 110,
            alignItems: "flex-end",
          }}
        >
          {items.map(([n, label, at], i) => {
            const t = easeOut(ramp(frame, sec(at, fps), sec(at + 0.6, fps)));
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: t,
                  transform: `translateY(${(1 - t) * 24}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF_LATIN,
                    fontSize: 210,
                    lineHeight: 1,
                    color: i === 3 ? H.ember : H.paper,
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 44,
                    color: H.paperDim,
                    marginTop: 10,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 70,
            fontFamily: SERIF,
            fontSize: 52,
            color: H.paper,
            direction: "rtl",
            opacity: both,
          }}
        >
          הירושימה · נגסקי
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 2009: the official recognition, and the qualifier the narration adds. */
export const Recognition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = useEnvelope(0.5, 0.5);
  const second = easeOut(ramp(frame, sec(6.3, fps), sec(7.0, fps)));
  const third = easeOut(ramp(frame, sec(9.2, fps), sec(9.9, fps)));
  const underline = easeInOut(ramp(frame, sec(9.6, fps), sec(10.8, fps)));
  return (
    <AbsoluteFill
      style={{
        background: H.ink,
        alignItems: "center",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 60% at 50% 45%, rgba(239,232,218,0.06), rgba(0,0,0,0.6))",
        }}
      />
      <Rise at={0.2}>
        <div
          style={{
            fontFamily: SERIF_LATIN,
            fontSize: 200,
            color: H.paper,
            lineHeight: 1,
          }}
        >
          2009
        </div>
      </Rise>
      <Rise at={0.9} style={{ marginTop: 26 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 60,
            color: H.paper,
            direction: "rtl",
          }}
        >
          הכרה רשמית של ממשלת יפן
        </div>
      </Rise>
      <Rise
        at={1.8}
        style={{
          marginTop: 26,
          display: "flex",
          gap: 30,
          alignItems: "center",
          direction: "rtl",
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 42, color: H.paperDim }}>
          ניצול של שתי ההפצצות
        </span>
        <span
          style={{
            fontFamily: JAPANESE,
            fontWeight: 600,
            fontSize: 44,
            color: H.ember,
            letterSpacing: 8,
          }}
        >
          二重被爆者
        </span>
      </Rise>
      <div
        style={{
          marginTop: 70,
          display: "flex",
          direction: "rtl",
          gap: 50,
          fontFamily: SANS,
          fontSize: 38,
        }}
      >
        <span style={{ color: H.muted, opacity: second }}>
          לא היחיד שנחשף לשתיהן
        </span>
        <span style={{ color: H.muted, opacity: second * third }}>·</span>
        <span style={{ position: "relative", color: H.paper, opacity: third }}>
          הראשון שהוכר רשמית
          <span
            style={{
              position: "absolute",
              right: 0,
              bottom: -10,
              height: 3,
              width: `${underline * 100}%`,
              background: H.ember,
            }}
          />
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** Oppenheimer's line from the Bhagavad Gita, as he recalled it. */
export const Quote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = useEnvelope(0.35, 0.5);
  const second = easeOut(ramp(frame, sec(2.5, fps), sec(3.1, fps)));
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity: o }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 50% at 50% 50%, rgba(0,0,0,0.6), rgba(0,0,0,0.2))",
        }}
      />
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 92,
          color: H.paper,
          direction: "rtl",
          textAlign: "center",
          lineHeight: 1.25,
          textShadow: "0 6px 40px rgba(0,0,0,0.95)",
          maxWidth: 1500,
        }}
      >
        <span>״עכשיו הפכתי למוות,</span>
        <span style={{ opacity: second }}> מחריב העולמות״</span>
      </div>
      <Rise at={0.8} style={{ marginTop: 40 }}>
        <div
          style={{
            fontFamily: SERIF_LATIN,
            fontStyle: "italic",
            fontSize: 34,
            color: H.paperDim,
            letterSpacing: 1,
          }}
        >
          “Now I am become Death, the destroyer of worlds.”
        </div>
      </Rise>
      <Rise at={1.3} style={{ marginTop: 18 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 28,
            color: H.muted,
            direction: "rtl",
          }}
        >
          מתוך הבהגווד גיטה · כפי שאופנהיימר שחזר את הרגע
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

/** The closing card: the invitation to comment, then the archive credits. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const o = Math.min(
    easeOut(ramp(frame, 0, sec(0.8, fps))),
    1 - easeIn(ramp(frame, durationInFrames - sec(1.6, fps), durationInFrames)),
  );
  const credits = easeOut(ramp(frame, sec(12.4, fps), sec(13.4, fps)));
  const prompt = 1 - easeIn(ramp(frame, sec(11.6, fps), sec(12.3, fps)));
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity: o }}
    >
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
      <div
        style={{
          position: "absolute",
          top: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: prompt,
        }}
      >
        <Rise at={0.3}>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 110,
              color: H.paper,
              direction: "rtl",
              textShadow: "0 6px 40px rgba(0,0,0,0.9)",
            }}
          >
            מאחורי הסיוט
          </div>
        </Rise>
        <Rise at={1.2} style={{ marginTop: 40 }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 46,
              color: H.paperDim,
              direction: "rtl",
            }}
          >
            מה אתם חושבים? ספרו לנו בתגובות
          </div>
        </Rise>
        <Rise at={4.6} style={{ marginTop: 22 }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 38,
              color: H.muted,
              direction: "rtl",
            }}
          >
            ואילו סיפורים אמיתיים לחקור בפרקים הבאים
          </div>
        </Rise>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          opacity: credits,
          direction: "rtl",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 60,
            color: H.paper,
            marginBottom: 16,
          }}
        >
          חומרי הארכיון
        </div>
        {[
          "U.S. National Archives · U.S. Strategic Bombing Survey",
          "U.S. Army Signal Corps · U.S. Navy · U.S. Department of Energy",
          "Universal Newsreel · Prelinger Archives · Internet Archive",
          "Wikimedia Commons · Natural Earth (maps)",
        ].map((line) => (
          <div
            key={line}
            style={{
              fontFamily: SERIF_LATIN,
              fontSize: 32,
              color: H.paperDim,
              direction: "ltr",
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: 26,
            fontFamily: SANS,
            fontSize: 30,
            color: H.muted,
          }}
        >
          רשימת המקורות המלאה, כולל רישיונות, בתיאור הסרטון
        </div>
      </div>
    </AbsoluteFill>
  );
};
