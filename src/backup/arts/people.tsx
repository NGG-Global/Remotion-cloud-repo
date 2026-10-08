import React from "react";
import {
  CheckBox,
  OUTLINE,
  Segments,
  SysButton,
  TextBubble,
  Win,
} from "../engine/kit";
import { Pixel } from "../pixel/Pixel";
import { IconName } from "../pixel/icons";
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
import { Burst, Ico, Panel, Svg, Txt, live, popAt, shake } from "./common";

/**
 * Chapters 6 to 8: old friends, parents, and looking after body and mind.
 */

const FRIENDS = [
  { x: C.pink, H: "#2b1d14", home: [860, 1330], to: [880, 1130] },
  { x: C.green, H: "#c26a2b", home: [700, 1330], to: [700, 1460] },
  { x: C.orange, H: "#3b2414", home: [540, 1330], to: [520, 1160] },
  { x: C.violet, H: "#1d1d24", home: [380, 1330], to: [330, 1450] },
  { x: C.blue, H: "#5a3820", home: [220, 1330], to: [180, 1200] },
];

export const Friends: Art = ({ scene, now }) => {
  const at = scene.card("oldfriends").show;
  const spread = easeInOut(
    ramp(now, scene.t("scatter", 5) - 0.1, scene.t("scatter", 5) + 0.5),
  );
  const fly = easeIn(
    ramp(now, scene.t("abroad", 2), scene.t("abroad", 3) + 0.7),
  );
  const ring = scene.t("married", 1);
  const gone = ramp(now, scene.t("baby", 1), scene.t("baby", 1) + 0.6);
  const rain = scene.t("hard", 4);
  return (
    <>
      {FRIENDS.map((f, i) => {
        let x = f.home[0] + (f.to[0] - f.home[0]) * spread;
        let y = f.home[1] + (f.to[1] - f.home[1]) * spread;
        let o = 1;
        let filter: string | undefined;
        if (i === 0) {
          x -= fly * 900;
          y -= fly * 600;
        }
        if (i === 2) o = 1 - gone * 0.75;
        if (i === 3 && now > rain)
          filter = `grayscale(${ramp(now, rain, rain + 0.5)})`;
        return (
          <div
            key={i}
            style={{ position: "absolute", inset: 0, opacity: o, filter }}
          >
            <Ico
              name="person"
              px={12}
              x={x}
              y={y}
              at={at + i * 0.12}
              now={now}
              colors={{ x: f.x, H: f.H }}
              flip={i % 2 === 1}
              float={4}
            />
          </div>
        );
      })}
      {/* Abroad: the plane picks her up. */}
      {now > scene.t("abroad", 2) - 0.3 ? (
        <div
          style={{
            position: "absolute",
            left: 880 - fly * 900 - 60,
            top: 1010 - fly * 600 - 70,
            transform: `rotate(-50deg) scale(${popAt(now, scene.t("abroad", 2) - 0.3)})`,
          }}
        >
          <Pixel name="plane" px={7} />
        </div>
      ) : null}
      <Ico name="ring" px={6} x={700} y={1320} at={ring} now={now} float={6} />
      <Burst x={700} y={1320} at={ring} now={now} color={C.pink} />
      <Ico
        name="stroller"
        px={6}
        x={630}
        y={1210}
        at={scene.t("baby", 0)}
        now={now}
      />
      <Txt
        x={520}
        y={1050}
        size={40}
        color={C.inkSoft}
        opacity={live(now, scene.t("baby", 2))}
      >
        5 שנים…
      </Txt>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${Math.sin(now * 2) * 4}px)`,
        }}
      >
        <Ico name="rain" px={7} x={330} y={1270} at={rain} now={now} />
      </div>
      <Txt
        x={180}
        y={1330}
        size={34}
        color={C.inkSoft}
        opacity={live(now, scene.t("scatter", 6))}
      >
        אתם
      </Txt>
    </>
  );
};

type Msg = { text: string; me?: boolean; t: number; photo?: boolean };

/** A chat window with messages arriving at given times. */
const Chat: React.FC<{
  title: string;
  sub: string;
  msgs: Msg[];
  now: number;
  at: number;
  footer?: React.ReactNode;
  typing?: [number, number];
}> = ({ title, sub, msgs, now, at, footer, typing }) => {
  const p = popAt(now, at);
  const shown = msgs.filter((m) => now >= m.t);
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 1260,
        transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`,
        opacity: clamp01(p * 3),
      }}
    >
      <div
        style={{
          width: 640,
          height: 660,
          background: "#efe7da",
          border: `${OUTLINE + 2}px solid ${C.ink}`,
          borderRadius: 48,
          boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
          overflow: "hidden",
          position: "relative",
          direction: "rtl",
        }}
      >
        <div
          style={{
            height: 110,
            background: C.teal,
            borderBottom: `${OUTLINE}px solid ${C.ink}`,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "0 30px",
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              background: "#bfe3dc",
              border: `4px solid ${C.ink}`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 38,
                color: C.white,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: FONT.sans,
                fontWeight: 500,
                fontSize: 24,
                color: "#d8f3ee",
              }}
            >
              {sub}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: 126,
            bottom: 26,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 16,
            overflow: "hidden",
          }}
        >
          {shown.slice(-5).map((m, i) => {
            const k = popAt(now, m.t, 0.3);
            return (
              <div
                key={m.text + i}
                style={{
                  alignSelf: m.me ? "flex-end" : "flex-start",
                  transform: `scale(${0.5 + 0.5 * k})`,
                  transformOrigin: m.me ? "0% 100%" : "100% 100%",
                  maxWidth: 470,
                }}
              >
                <div
                  style={{
                    padding: "14px 24px",
                    background: m.me ? "#d6f5c9" : C.white,
                    border: `4px solid ${C.ink}`,
                    borderRadius: 26,
                    fontFamily: FONT.sans,
                    fontWeight: 600,
                    fontSize: 36,
                    color: C.ink,
                    lineHeight: 1.25,
                  }}
                >
                  {m.photo ? (
                    <div
                      style={{
                        width: 220,
                        height: 140,
                        background: "linear-gradient(135deg, #ffb07a, #ff8fb1)",
                        borderRadius: 12,
                      }}
                    />
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            );
          })}
          {typing && now > typing[0] && now < typing[1] ? (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "16px 26px",
                background: C.white,
                border: `4px solid ${C.ink}`,
                borderRadius: 26,
                display: "flex",
                gap: 10,
              }}
            >
              {[0, 1, 2].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: C.inkSoft,
                    opacity:
                      0.3 + 0.7 * ((Math.floor(now * 6) + d) % 3 === 0 ? 1 : 0),
                  }}
                />
              ))}
            </div>
          ) : null}
          {footer}
        </div>
      </div>
    </div>
  );
};

export const GroupChat: Art = ({ scene, now }) => {
  const at = scene.card("friendship").show;
  const c = (i: number) => scene.t("chatlines", i);
  const msgs: Msg[] = [
    { text: "מזל טוב!!!", t: at + 0.3 },
    { text: "", photo: true, t: at + 0.9 },
    { text: "איזה כיף לראות אתכם", t: scene.t("send", 0) },
    { text: "חייבים לקבוע!", me: true, t: c(0) },
    { text: "כן, לגמרי!", t: c(2) },
    { text: "לגמרי!!", t: c(3) + 0.15 },
  ];
  const last = c(5);
  return (
    <Chat
      title="החבר׳ה מהתיכון"
      sub="6 משתתפים"
      msgs={msgs}
      now={now}
      at={at}
      typing={[c(3) + 0.5, c(4)]}
      footer={
        now > last ? (
          <div
            style={{
              alignSelf: "center",
              padding: "8px 22px",
              background: "#d9ccb6",
              borderRadius: 14,
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 26,
              color: C.inkSoft,
              opacity: popAt(now, last),
            }}
          >
            ההודעה האחרונה: לפני 4 חודשים
          </div>
        ) : null
      }
    />
  );
};

/** A month on the wall, a date circled three weeks out. */
export const Calendar: Art = ({ scene, now }) => {
  const at = scene.card("schedule").show;
  const p = popAt(now, at);
  const hop = ramp(now, scene.t("schedule", 4), scene.t("schedule", 6));
  const circled = scene.t("schedule", 6) + 0.1;
  const heart = scene.t("especially", 0) + 0.1;
  const today = 8;
  const target = 29;
  const first = 3; // weekday column of the 1st
  const cell = (d: number) => {
    const idx = d - 1 + first;
    return { x: 860 - (idx % 7) * 106, y: 1150 + Math.floor(idx / 7) * 82 };
  };
  const weeks = Math.min(3, Math.floor(hop * 3.999));
  const marker = cell(today + weeks * 7);
  const tc = cell(target);
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${0.6 + 0.4 * p})`,
        transformOrigin: "540px 1260px",
        opacity: clamp01(p * 3),
      }}
    >
      <Panel x={540} y={1250} w={820} h={600} fill={C.white} radius={26}>
        <div
          style={{
            height: 96,
            background: C.red,
            borderBottom: `${OUTLINE}px solid ${C.ink}`,
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: "96px",
            color: C.white,
            textAlign: "center",
            direction: "rtl",
          }}
        >
          היומן
        </div>
      </Panel>
      {Array.from({ length: 31 }).map((_, i) => {
        const { x, y } = cell(i + 1);
        return (
          <Txt
            key={i}
            x={x}
            y={y}
            size={38}
            color={i + 1 === today ? C.blue : C.ink}
            weight={i + 1 === today ? 800 : 600}
          >
            {i + 1}
          </Txt>
        );
      })}
      <Svg>
        <circle
          cx={marker.x}
          cy={marker.y}
          r={40}
          fill="none"
          stroke={C.blue}
          strokeWidth={6}
          opacity={hop < 1 ? 1 : 0.35}
        />
        <ellipse
          cx={tc.x}
          cy={tc.y}
          rx={50}
          ry={42}
          fill="none"
          stroke={C.red}
          strokeWidth={9}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - easeOut(ramp(now, circled, circled + 0.35))}
          transform={`rotate(-8 ${tc.x} ${tc.y})`}
        />
      </Svg>
      {now > circled + 0.2 ? (
        <div
          style={{
            position: "absolute",
            left: tc.x - 60,
            top: tc.y + 40,
            transform: `rotate(-6deg) scale(${popAt(now, circled + 0.2) * (1 + shake(now, heart, 0.6, 0.06, 20))})`,
            transformOrigin: "50% 0%",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              background: C.yellow,
              border: `5px solid ${C.ink}`,
              boxShadow: "8px 8px 0 rgba(0,0,0,0.22)",
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 32,
              color: C.ink,
              direction: "rtl",
              whiteSpace: "nowrap",
            }}
          >
            קפה עם החבר׳ה
          </div>
        </div>
      ) : null}
      <Ico
        name="heart"
        px={5}
        x={tc.x + 50}
        y={tc.y - 40}
        at={heart}
        now={now}
      />
    </div>
  );
};

/** Calling home; the face on the screen greys a little while you talk. */
export const CallParents: Art = ({ scene, now }) => {
  const at = scene.card("call").show;
  const p = popAt(now, at);
  const connected = scene.t("notmust", 0);
  const greyFrom = scene.t("change", 3);
  const grey = easeInOut(ramp(now, greyFrom, scene.t("subtle", 4) + 0.4));
  const secs = Math.max(0, Math.floor(now - connected));
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 1250,
        transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`,
        opacity: clamp01(p * 3),
      }}
    >
      <div
        style={{
          width: 420,
          height: 660,
          background: "#1d2236",
          border: `${OUTLINE + 4}px solid ${C.ink}`,
          borderRadius: 60,
          boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
          position: "relative",
          overflow: "hidden",
          direction: "rtl",
        }}
      >
        {now < connected
          ? [0, 1, 2].map((r) => {
              const k = ((now - at) * 0.9 + r / 3) % 1;
              return (
                <div
                  key={r}
                  style={{
                    position: "absolute",
                    left: 210 - (90 + k * 120),
                    top: 250 - (90 + k * 120),
                    width: (90 + k * 120) * 2,
                    height: (90 + k * 120) * 2,
                    borderRadius: "50%",
                    border: `5px solid ${C.green}`,
                    opacity: 1 - k,
                  }}
                />
              );
            })
          : null}
        <div
          style={{
            position: "absolute",
            left: 210 - 90,
            top: 250 - 90,
            width: 180,
            height: 180,
            borderRadius: 90,
            background: "#f6dfc4",
            border: `5px solid ${C.white}`,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            paddingTop: 22,
            boxSizing: "border-box",
          }}
        >
          <Pixel
            name="person"
            px={13}
            colors={{ H: mix("#5a3820", "#c9c4bc", grey), x: C.pink }}
            shadow={false}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 380,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 52,
            color: C.white,
          }}
        >
          אמא
        </div>
        <div
          style={{
            position: "absolute",
            top: 450,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: 32,
            color: "#b9c1e0",
            direction: now < connected ? "rtl" : "ltr",
          }}
        >
          {now < connected ? "מתקשר…" : `00:${String(secs).padStart(2, "0")}`}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              background: C.red,
              border: `5px solid ${C.ink}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const ParentChat: Art = ({ scene, now }) => {
  const at = scene.card("ask").show;
  const msgs: Msg[] = [
    { text: "איך שולחים תמונה?", t: scene.t("ask", 3) },
    { text: "לוחצים על האטב", me: true, t: scene.t("ask", 6) + 0.1 },
    { text: "איזה אטב?", t: scene.t("explained", 1) },
    { text: "הסברתי לך אתמול…", me: true, t: scene.t("explained", 3) },
    { text: "ואיך שולחים תמונה?", t: scene.t("explained", 4) + 0.3 },
  ];
  return <Chat title="אבא" sub="מקליד…" msgs={msgs} now={now} at={at} />;
};

/** The parents in the frame, and the parents you still carry around. */
export const AgingPhoto: Art = ({ scene, now }) => {
  const at = scene.card("look").show;
  const p = popAt(now, at);
  const grey = easeInOut(
    ramp(now, scene.t("look", 5), scene.t("look", 5) + 1.2),
  );
  const memory = scene.card("head").show;
  const hair = mix("#3b2414", "#d6d1c8", grey);
  const hair2 = mix("#8a5a35", "#cfcac0", grey);
  return (
    <>
      {p > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 470,
            top: 1290,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p}) rotate(-2deg)`,
            opacity: clamp01(p * 3),
          }}
        >
          <div
            style={{
              width: 600,
              height: 480,
              background: "#fdf3e1",
              border: `22px solid #9a6a3e`,
              outline: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: "14px 14px 0 rgba(0,0,0,0.22)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, #bfe0ff, #fde7c4)",
              }}
            />
            <div style={{ position: "absolute", left: 120, bottom: 20 }}>
              <Pixel name="person" px={15} colors={{ H: hair, x: C.pink }} />
            </div>
            <div style={{ position: "absolute", left: 300, bottom: 20 }}>
              <Pixel
                name="person"
                px={15}
                colors={{ H: hair2, x: C.blue }}
                flip
              />
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontFamily: FONT.serif,
              fontWeight: 700,
              fontSize: 40,
              color: C.inkSoft,
              marginTop: 26,
              direction: "rtl",
            }}
          >
            אמא ואבא
          </div>
        </div>
      ) : null}
      {now > memory ? (
        <div
          style={{
            position: "absolute",
            left: 830,
            top: 1010,
            transform: `translate(-50%, -50%) scale(${popAt(now, memory)})`,
          }}
        >
          <div style={{ position: "relative", width: 300, height: 230 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: [40, 120, 190, 70, 160][i],
                  top: [40, 10, 50, 110, 110][i],
                  width: [120, 130, 110, 140, 120][i],
                  height: [110, 120, 100, 110, 100][i],
                  borderRadius: "50%",
                  background: C.white,
                  border: `${OUTLINE}px solid ${C.ink}`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: 50,
                top: 50,
                width: 210,
                height: 130,
                background: C.white,
                borderRadius: 50,
              }}
            />
            <div style={{ position: "absolute", left: 90, top: 50 }}>
              <Pixel
                name="person"
                px={6.5}
                colors={{ H: "#3b2414", x: C.pink }}
                shadow={false}
              />
            </div>
            <div style={{ position: "absolute", left: 160, top: 50 }}>
              <Pixel
                name="person"
                px={6.5}
                colors={{ H: "#8a5a35", x: C.blue }}
                flip
                shadow={false}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 250,
                width: 40,
                height: 34,
                borderRadius: "50%",
                background: C.white,
                border: `${OUTLINE}px solid ${C.ink}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -30,
                top: 300,
                width: 24,
                height: 20,
                borderRadius: "50%",
                background: C.white,
                border: `${OUTLINE}px solid ${C.ink}`,
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

/** Ageing, as the only sensible option in the dialog. */
export const Options: Art = ({ scene, now }) => {
  const at = scene.card("twenty").show;
  const p = popAt(now, at);
  const pick = scene.t("afraid", 2);
  const alt = scene.t("alt", 0);
  const warn = scene.t("alt", 1);
  const ok = scene.t("alt", 2) + 0.4;
  const strike = scene.t("twenty", 4);
  const Radio: React.FC<{ on: boolean; label: string; dim?: boolean }> = ({
    on,
    label,
    dim,
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity: dim ? 0.45 : 1,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          border: `6px solid ${C.ink}`,
          background: C.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {on ? (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              background: C.blue,
            }}
          />
        ) : null}
      </div>
      <span
        style={{
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 50,
          color: C.ink,
        }}
      >
        {label}
      </span>
    </div>
  );
  return p <= 0 ? null : (
    <>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1260,
          transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`,
          opacity: clamp01(p * 3),
        }}
      >
        <Win w={820} h={600} title="הגדרות הזמן">
          <div
            style={{
              padding: "34px 44px",
              direction: "rtl",
              display: "flex",
              flexDirection: "column",
              gap: 34,
            }}
          >
            <div
              style={{
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 38,
                color: C.inkSoft,
                position: "relative",
                alignSelf: "flex-start",
              }}
            >
              גיל נוכחי: 20
              <div
                style={{
                  position: "absolute",
                  left: -6,
                  right: -6,
                  top: "55%",
                  height: 8,
                  background: C.red,
                  transform: `scaleX(${easeOut(ramp(now, strike, strike + 0.25))})`,
                  transformOrigin: "100% 50%",
                }}
              />
            </div>
            <Radio on={now > pick} label="להזדקן" />
            <Radio on={false} label="האלטרנטיבה" dim={now > warn} />
            <div style={{ alignSelf: "flex-start" }}>
              <SysButton label="אישור" now={now} press={ok} />
            </div>
          </div>
        </Win>
      </div>
      {now > warn - 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: 340,
            top: 1310,
            transform: `translate(-50%, -50%) scale(${popAt(now, warn - 0.05)})`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 22px",
              background: "#fff6c9",
              border: `5px solid ${C.ink}`,
              borderRadius: 12,
              boxShadow: "8px 8px 0 rgba(0,0,0,0.22)",
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 34,
              color: C.ink,
              direction: "rtl",
            }}
          >
            <Pixel name="warn" px={2.6} shadow={false} />
            לא מומלץ בכלל
          </div>
        </div>
      ) : null}
      <Burst x={420} y={1240} at={alt} now={now} color={C.red} n={6} r={70} />
    </>
  );
};

/** Sleeping on the floor at 22; one wrong pillow at 36. */
export const Back: Art = ({ scene, now }) => {
  const at = scene.card("back").show;
  const ouch = scene.t("back", 2);
  const lie1 = scene.t("at22", 3);
  const up = scene.t("festival", 0);
  const fest = scene.t("festival", 2);
  const lie2 = scene.t("at36", 3);
  const neck = scene.t("at36", 7);
  const cancel = scene.t("cancel", 2);
  const lying =
    easeInOut(ramp(now, lie1, lie1 + 0.3)) *
      (1 - easeOut(ramp(now, up, up + 0.25))) +
    easeInOut(ramp(now, lie2, lie2 + 0.35));
  const hop =
    now > up && now < lie2
      ? Math.abs(Math.sin((now - up) * 6)) *
        50 *
        (1 - ramp(now, fest + 1.5, lie2))
      : 0;
  const bunting = live(now, fest - 0.1, lie2 - 0.3);
  const pain = (t: number) =>
    now > t ? 0.8 + 0.2 * Math.sin((now - t) * 14) : 0;
  const painOn = now < lie1 ? pain(ouch) : now > neck ? pain(neck) : 0;
  return (
    <>
      <Svg>
        <line
          x1={60}
          y1={1500}
          x2={1020}
          y2={1500}
          stroke={C.ink}
          strokeWidth={6}
          opacity={live(now, at)}
        />
        {bunting > 0 ? (
          <g opacity={bunting}>
            <path
              d="M 60 1010 Q 540 1110 1020 1010"
              fill="none"
              stroke={C.ink}
              strokeWidth={5}
            />
            {Array.from({ length: 11 }).map((_, i) => {
              const x = 100 + i * 88;
              const y = 1010 + Math.sin((i / 10) * Math.PI) * 96;
              return (
                <path
                  key={i}
                  d={`M ${x - 30} ${y} L ${x + 30} ${y} L ${x} ${y + 64} Z`}
                  fill={[C.red, C.yellow, C.blue, C.green][i % 4]}
                  stroke={C.ink}
                  strokeWidth={5}
                  strokeLinejoin="round"
                />
              );
            })}
          </g>
        ) : null}
        {/* The mat, then the pillow. */}
        <rect
          x={300}
          y={1478}
          width={480}
          height={22}
          rx={8}
          fill={C.teal}
          stroke={C.ink}
          strokeWidth={5}
          opacity={live(now, lie1 - 0.3, up)}
        />
      </Svg>
      <Ico name="pillow" px={9} x={770} y={1458} at={lie2 - 0.3} now={now} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${lying * 20}px, ${lying * 128 - hop}px) rotate(${lying * 90}deg) translateX(${shake(now, scene.t("nokidding", 1), 0.4, 6)}px)`,
          transformOrigin: "540px 1340px",
        }}
      >
        <Ico
          name="person"
          px={14}
          x={540}
          y={1340}
          at={at}
          now={now}
          colors={{ x: C.blue, H: "#3b2414" }}
        />
        {painOn > 0 ? (
          <Svg>
            <g
              transform={`translate(${now > neck ? 545 : 560} ${now > neck ? 1270 : 1350}) scale(${painOn})`}
            >
              <path
                d="M 0 -60 L 14 -18 L 58 -22 L 22 6 L 40 48 L 0 22 L -40 48 L -22 6 L -58 -22 L -14 -18 Z"
                fill={C.red}
                stroke={C.ink}
                strokeWidth={6}
                strokeLinejoin="round"
                opacity={0.92}
              />
            </g>
          </Svg>
        ) : null}
      </div>
      {[0, 1].map((i) => (
        <Ico
          key={i}
          name="note"
          px={6}
          x={[260, 830][i]}
          y={1180 - (now - fest) * 40}
          at={fest + i * 0.2}
          now={now}
          out={lie2 - 0.5}
          float={8}
        />
      ))}
      {now > cancel - 0.3 ? (
        <div
          style={{
            position: "absolute",
            left: 250,
            top: 1150,
            transform: `translate(-50%, -50%) rotate(-6deg) scale(${popAt(now, cancel - 0.3)})`,
          }}
        >
          <div
            style={{
              width: 260,
              height: 190,
              background: C.white,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 16,
              boxShadow: "8px 8px 0 rgba(0,0,0,0.22)",
              display: "flex",
              gap: 16,
              alignItems: "center",
              justifyContent: "center",
              direction: "rtl",
            }}
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  width: 90,
                  height: 110,
                  border: `5px solid ${C.ink}`,
                  borderRadius: 10,
                  position: "relative",
                  fontFamily: FONT.display,
                  fontSize: 60,
                  textAlign: "center",
                  lineHeight: "110px",
                }}
              >
                {["ו׳", "ש׳"][i]}
                <svg
                  width={90}
                  height={110}
                  style={{ position: "absolute", left: -5, top: -5 }}
                >
                  <path
                    d="M 10 10 L 80 100 M 80 10 L 10 100"
                    stroke={C.red}
                    strokeWidth={10}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={
                      1 -
                      easeOut(
                        ramp(now, cancel + i * 0.15, cancel + 0.3 + i * 0.15),
                      )
                    }
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

const HEALTH: { icon: IconName; label: string; card: string; tick: number }[] =
  [
    { icon: "dumbbell", label: "ספורט", card: "sport", tick: 1 },
    { icon: "tooth", label: "רופא שיניים", card: "dentist", tick: 2 },
    { icon: "water", label: "מים", card: "water", tick: 1 },
    { icon: "sunscreen", label: "קרם הגנה", card: "sunscreen", tick: 3 },
  ];

export const Health: Art = ({ scene, now }) => {
  const chairAt = scene.t("chair", 3);
  const noise = scene.t("chair", 8);
  const chairOn = live(now, chairAt - 0.1, scene.card("dentist").show - 0.1);
  return (
    <>
      {HEALTH.map((h, i) => {
        const at = scene.card(h.card).show;
        const p = popAt(now, at);
        if (p <= 0) return null;
        const y = 1010 + i * 140;
        return (
          <div
            key={h.card}
            style={{
              position: "absolute",
              left: 130,
              top: y - 58,
              width: 820,
              height: 116,
              display: "flex",
              alignItems: "center",
              gap: 30,
              direction: "rtl",
              transform: `translateX(${(1 - p) * 120}px)`,
              opacity: clamp01(p * 3),
            }}
          >
            <CheckBox at={scene.t(h.card, h.tick)} now={now} size={86} />
            <div
              style={{ width: 120, display: "flex", justifyContent: "center" }}
            >
              <Pixel name={h.icon} px={h.icon === "dumbbell" ? 5.5 : 6} />
            </div>
            <span
              style={{
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 60,
                color: C.ink,
              }}
            >
              {h.label}
            </span>
          </div>
        );
      })}
      {chairOn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: chairOn }}>
          <Ico
            name="chair"
            px={13}
            x={780}
            y={1390}
            at={chairAt - 0.1}
            now={now}
          />
          <Ico
            name="person"
            px={11}
            x={600}
            y={1380}
            at={chairAt}
            now={now}
            colors={{ H: "#d6d1c8", x: C.violet }}
            rot={-6}
          />
          {now > noise - 0.1 ? (
            <div
              style={{
                position: "absolute",
                left: 470,
                top: 1200,
                transform: `translate(-50%, -50%) scale(${pop(now - noise + 0.1, 0.35, 0.6)}) rotate(-10deg)`,
              }}
            >
              <Svg style={{ left: -540 + 0, top: -1200 }}>
                <path
                  d="M 540 1080 L 580 1150 L 660 1130 L 620 1200 L 690 1250 L 600 1260 L 610 1340 L 540 1290 L 470 1340 L 480 1260 L 390 1250 L 460 1200 L 420 1130 L 500 1150 Z"
                  fill={C.yellow}
                  stroke={C.ink}
                  strokeWidth={6}
                  strokeLinejoin="round"
                />
              </Svg>
              <div
                style={{
                  position: "relative",
                  fontFamily: FONT.display,
                  fontSize: 84,
                  color: C.red,
                  whiteSpace: "nowrap",
                  direction: "rtl",
                }}
              >
                קררררק!
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      <Ico
        name="sun"
        px={8}
        x={920}
        y={990}
        at={scene.t("sunscreen", 3)}
        now={now}
        float={8}
      />
    </>
  );
};

/** The couch: an old embroidered motto on the wall, then company. */
export const Therapy: Art = ({ scene, now }) => {
  const at = scene.card("therapy").show;
  const old = scene.t("getover", 6);
  const friend = scene.t("alone", 4);
  const prog = scene.t("progress", 1);
  const bar = 0.28 + easeOut(ramp(now, prog, prog + 0.5)) * 0.44;
  const sitDown = easeOut(ramp(now, friend - 0.1, friend + 0.4));
  return (
    <>
      {now > old - 0.15 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1060,
            transform: `translate(-50%, -50%) scale(${popAt(now, old - 0.15)}) rotate(${-2 + Math.sin(now * 1.3) * 1.2}deg)`,
            transformOrigin: "50% 0%",
          }}
        >
          <div
            style={{
              padding: "22px 46px",
              background: "#efe2c4",
              border: `12px solid #8a5a35`,
              outline: `${OUTLINE}px solid ${C.ink}`,
              boxShadow: "10px 10px 0 rgba(0,0,0,0.22)",
              fontFamily: FONT.serif,
              fontWeight: 800,
              fontSize: 54,
              color: "#7a2f22",
              direction: "rtl",
              whiteSpace: "nowrap",
              filter: "sepia(0.35)",
            }}
          >
            ~ על זה לא מדברים ~
          </div>
        </div>
      ) : null}
      <Ico name="couch" px={17} x={540} y={1430} at={at} now={now} />
      <Ico
        name="person"
        px={11}
        x={470}
        y={1330}
        at={at + 0.2}
        now={now}
        colors={{ x: C.blue, H: "#3b2414" }}
      />
      {now > friend - 0.3 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${(1 - sitDown) * 420}px, ${-Math.sin(sitDown * Math.PI) * 40}px)`,
          }}
        >
          <Ico
            name="person"
            px={11}
            x={620}
            y={1330}
            at={friend - 0.3}
            now={now}
            colors={{ x: C.orange, H: "#c26a2b" }}
            flip
          />
        </div>
      ) : null}
      <Ico
        name="heart"
        px={5}
        x={545}
        y={1205}
        at={friend + 0.45}
        now={now}
        float={6}
      />
      {now > prog - 0.4 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1590,
            transform: `translate(-50%, -50%) scale(${popAt(now, prog - 0.4)})`,
            direction: "rtl",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            style={{
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 36,
              color: C.ink,
              whiteSpace: "nowrap",
            }}
          >
            {Math.round(bar * 100)}%
          </span>
          <Segments p={bar} w={560} h={44} color={C.green} seg={18} />
        </div>
      ) : null}
    </>
  );
};

/** Label-maker tape on a heart: one for a diagnosis, one for a joke. */
export const Labels: Art = ({ scene, now }) => {
  const at = scene.card("diagnosis").show;
  const tags = [
    { text: "אבחנה", t: scene.t("diagnosis", 4), x: 420, y: 1180, rot: -14 },
    { text: "בדיחה", t: scene.t("joke", 6), x: 680, y: 1320, rot: 10 },
  ];
  const lots = scene.t("toogood", 0);
  return (
    <>
      <Ico name="heart" px={22} x={540} y={1270} at={at} now={now} float={6} />
      {tags.map((g) =>
        now > g.t - 0.05 ? (
          <div
            key={g.text}
            style={{
              position: "absolute",
              left: g.x,
              top: g.y,
              transform: `translate(-50%, -50%) rotate(${g.rot}deg) scale(${1.6 - 0.6 * easeOut(ramp(now, g.t - 0.05, g.t + 0.12))})`,
              opacity: clamp01((now - g.t + 0.05) / 0.08),
            }}
          >
            <div
              style={{
                padding: "10px 34px",
                background: "#1b1b22",
                borderRadius: 6,
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 56,
                color: "#f4f4f4",
                letterSpacing: "0.12em",
                direction: "rtl",
                boxShadow: "6px 6px 0 rgba(0,0,0,0.25)",
              }}
            >
              {g.text}
            </div>
          </div>
        ) : null,
      )}
      {Array.from({ length: 8 }).map((_, i) => {
        const t =
          scene.t("good", 1) +
          i * (i < 2 ? 0.5 : 0.11) +
          (i >= 2 ? lots - scene.t("good", 1) - 0.2 : 0);
        if (now < t) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 150 + rand(i * 3) * 780,
              top: 980 + rand(i * 7) * 560,
              transform: `translate(-50%, -50%) scale(${popAt(now, t, 0.3)}) rotate(${(rand(i) - 0.5) * 30}deg)`,
            }}
          >
            <TextBubble
              text="חה חה"
              size={40}
              fill={i % 2 ? C.yellow : C.white}
              tail={i % 2 ? "bottom-left" : "bottom-right"}
            />
          </div>
        );
      })}
    </>
  );
};
