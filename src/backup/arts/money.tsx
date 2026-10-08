import React from "react";
import { CheckBox, OUTLINE, TextBubble, Win } from "../engine/kit";
import { Pixel } from "../pixel/Pixel";
import { IconName } from "../pixel/icons";
import {
  C,
  FONT,
  beatPulse,
  clamp01,
  easeIn,
  easeInOut,
  easeOut,
  pop,
  ramp,
  rand,
} from "../theme";
import { Scene } from "../timeline";
import { Art } from "./types";
import { Burst, Ico, Panel, Svg, Txt, bob, live, popAt, shake } from "./common";

/**
 * Chapters 9 to 12: promises, money and "later", technology, curiosity,
 * keepsakes, forty, and everyone improvising.
 */

/** Visible while this card is the one being spoken (with short fades). */
const during = (scene: Scene, now: number, id: string, fade = 0.15): number => {
  const c = scene.card(id);
  return live(now, c.show, c.hide, fade);
};

export const Promises: Art = ({ scene, now }) => {
  const head = scene.t("guilty", 5);
  const rows = [
    { label: "ללמוד", t: scene.t("learn", 3) },
    { label: "לעבוד קשה", t: scene.t("work", 1) },
    { label: "להיות אחראים", t: scene.t("work", 4) },
  ];
  const house = scene.t("flat", 2);
  const old = scene.t("outdated", 2);
  const grey = ramp(now, old, old + 0.4);
  return (
    <>
      <Txt
        x={700}
        y={1000}
        size={44}
        color={C.inkSoft}
        opacity={live(now, head)}
        weight={800}
      >
        מה אמרו לכם:
      </Txt>
      {rows.map((r, i) =>
        now > r.t - 0.35 ? (
          <div
            key={r.label}
            style={{
              position: "absolute",
              left: 470,
              top: 1060 + i * 130,
              width: 480,
              display: "flex",
              alignItems: "center",
              gap: 22,
              direction: "rtl",
              transform: `translateX(${(1 - popAt(now, r.t - 0.35)) * 80}px)`,
              opacity: clamp01((now - r.t + 0.35) / 0.15),
            }}
          >
            <CheckBox at={r.t} now={now} size={76} />
            <span
              style={{
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 56,
                color: C.ink,
              }}
            >
              {r.label}
            </span>
          </div>
        ) : null,
      )}
      <Svg>
        <path
          d="M 440 1260 L 330 1260"
          stroke={C.ink}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={live(now, house - 0.2)}
        />
        <path
          d="M 350 1235 L 322 1260 L 350 1285"
          fill="none"
          stroke={C.ink}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={live(now, house - 0.2)}
        />
      </Svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `grayscale(${grey})`,
          opacity: 1 - grey * 0.45,
        }}
      >
        <Ico
          name="house"
          px={12}
          x={200}
          y={1250}
          at={house}
          now={now}
          float={5}
        />
      </div>
      {now > old - 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1300,
            transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * popAt(now, old - 0.05)}) translateX(${shake(now, old, 0.4, 8)}px)`,
          }}
        >
          <Win
            w={760}
            h={300}
            title="הודעת מערכת"
            icon={<Pixel name="warn" px={2.6} shadow={false} />}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "34px 36px",
                direction: "rtl",
              }}
            >
              <Pixel name="warn" px={6} />
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 700,
                  fontSize: 40,
                  color: C.ink,
                  lineHeight: 1.3,
                }}
              >
                המידע אינו עדכני.
                <br />
                <span style={{ color: C.inkSoft, fontSize: 32 }}>
                  עודכן לאחרונה: 2005
                </span>
              </div>
            </div>
          </Win>
        </div>
      ) : null}
    </>
  );
};

/** An exam whose questions are swapped while you are answering it. */
export const Exam: Art = ({ scene, now }) => {
  const at = scene.card("failed").show;
  const p = popAt(now, at);
  const grade = scene.t("failed", 2);
  const swap = scene.t("swapped", 4);
  const k = easeInOut(ramp(now, swap - 0.1, swap + 0.4));
  const oldQ = ["מתי קונים דירה?", "איזה מקצוע ללמוד?", "כמה זה משכנתא?"];
  const newQ = ["מה זה קריפטו?", "איך עובדים מהבית?", "מה עושים עם AI?"];
  return p <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 1270,
        transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p}) rotate(-2deg)`,
        opacity: clamp01(p * 3),
      }}
    >
      <div
        style={{
          width: 760,
          height: 620,
          background: C.white,
          border: `${OUTLINE}px solid ${C.ink}`,
          borderRadius: 10,
          boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
          position: "relative",
          overflow: "hidden",
          direction: "rtl",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background:
              "repeating-linear-gradient(180deg, transparent 0 58px, #d9e4f5 58px 61px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "#f3a5a5",
            marginRight: 70,
          }}
        />
        <div
          style={{
            position: "relative",
            padding: "30px 110px 0 40px",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 52,
            color: C.ink,
          }}
        >
          מבחן בחיים
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 100,
              top: 150 + i * 140,
              height: 120,
              width: 600,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                transform: `translateX(${-k * 650}px)`,
                opacity: 1 - k,
                fontFamily: FONT.sans,
                fontWeight: 600,
                fontSize: 44,
                color: C.ink,
                whiteSpace: "nowrap",
              }}
            >
              {i + 1}. {oldQ[i]}{" "}
              <span style={{ color: C.green, fontWeight: 800 }}>✓</span>
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                transform: `translateX(${(1 - k) * 650}px)`,
                fontFamily: FONT.sans,
                fontWeight: 600,
                fontSize: 44,
                color: C.blue,
                whiteSpace: "nowrap",
              }}
            >
              {i + 1}. {newQ[i]}
            </div>
          </div>
        ))}
        {now > grade ? (
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 26,
              transform: `scale(${pop(now - grade, 0.35, 0.5)}) rotate(-12deg)`,
            }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: 65,
                border: `9px solid ${C.red}`,
                color: C.red,
                fontFamily: FONT.display,
                fontSize: 92,
                lineHeight: "118px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {k > 0.5 ? "?" : "48"}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Money: one object per line, each arriving on its word. */
export const Money: Art = ({ scene, now }) => {
  const save = during(scene, now, "save");
  const coinsAt = scene.t("save", 1);
  const travel = scene.t("travel", 2);
  const fly = ramp(now, travel - 0.2, travel + 1.0);
  const story = scene.t("story", 6);
  const cheapOn = live(now, scene.card("cheap").show, scene.card("story").show);
  const broke = scene.t("expensive", 2);
  const crack = ramp(now, broke, broke + 0.3);
  return (
    <>
      {save > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: save }}>
          <Ico
            name="jar"
            px={18}
            x={540}
            y={1320}
            at={scene.card("save").show}
            now={now}
          />
          {[0, 1, 2, 3].map((i) => {
            const t0 = coinsAt + i * 0.18;
            const k = easeIn(ramp(now, t0, t0 + 0.45));
            if (k <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 500 + (i % 2) * 30,
                  top: 960 + k * 330,
                  opacity: k >= 1 ? 0 : 1,
                }}
              >
                <Pixel name="coin" px={6} />
              </div>
            );
          })}
        </div>
      ) : null}
      {fly > 0 && fly < 1 ? (
        <>
          <Svg>
            <path
              d={`M 1000 1380 Q 640 ${1380 - 300} ${1000 - fly * 1100} ${1380 - Math.sin(fly * Math.PI * 0.8) * 340}`}
              fill="none"
              stroke={C.inkSoft}
              strokeWidth={8}
              strokeDasharray="4 22"
              strokeLinecap="round"
            />
          </Svg>
          <div
            style={{
              position: "absolute",
              left: 1000 - fly * 1100 - 63,
              top: 1380 - Math.sin(fly * Math.PI * 0.8) * 340 - 63,
              transform: `rotate(${-70 - fly * 30}deg)`,
            }}
          >
            <Pixel name="plane" px={7} />
          </div>
        </>
      ) : null}
      {during(scene, now, "eat") > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: during(scene, now, "eat"),
          }}
        >
          <Ico
            name="pot"
            px={18}
            x={540}
            y={1320}
            at={scene.t("eat", 1)}
            now={now}
          />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 470 + i * 60,
                top: 1130 - ((now * 60 + i * 30) % 90),
                width: 16,
                height: 46,
                borderRadius: 8,
                background: "#cfc8b6",
                opacity: 0.8,
              }}
            />
          ))}
          <Txt
            x={540}
            y={1480}
            size={56}
            color={C.yellow}
            opacity={live(now, scene.t("eat", 3))}
            style={{ textShadow: `3px 3px 0 ${C.ink}` }}
          >
            ★★★★★
          </Txt>
        </div>
      ) : null}
      {during(scene, now, "ticket") > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: during(scene, now, "ticket"),
          }}
        >
          <Ico
            name="ticket"
            px={20}
            x={540}
            y={1300}
            at={scene.t("ticket", 1)}
            now={now}
            rot={-8}
            float={6}
          />
          <Ico
            name="note"
            px={7}
            x={800}
            y={1120}
            at={scene.t("ticket", 2)}
            now={now}
            float={10}
          />
          <Ico
            name="note"
            px={6}
            x={270}
            y={1180}
            at={scene.t("ticket", 2) + 0.15}
            now={now}
            float={10}
            colors={{ v: C.pink }}
          />
        </div>
      ) : null}
      {during(scene, now, "important") > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: during(scene, now, "important"),
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Ico
              key={i}
              name="coin"
              px={10}
              x={540 + (i % 2 ? 14 : -14)}
              y={1440 - i * 58}
              at={scene.t("important", 0) + i * 0.07}
              now={now}
            />
          ))}
        </div>
      ) : null}
      {cheapOn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: cheapOn }}>
          <div
            style={{
              position: "absolute",
              left: 540 - 112,
              top: 1330 - 63,
              transform: `rotate(${crack * 16}deg) translateY(${crack * 30}px)`,
            }}
          >
            <Pixel name="shoe" px={14} />
          </div>
          {crack > 0 ? (
            <Svg>
              <path
                d="M 520 1290 L 545 1320 L 525 1345 L 560 1375"
                fill="none"
                stroke={C.ink}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - crack}
              />
            </Svg>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: 760,
              top: 1160,
              transform: `translate(-50%, -50%) scale(${popAt(now, scene.t("cheap", 7))}) rotate(${now > broke ? 8 : -6}deg)`,
            }}
          >
            <div
              style={{
                padding: "8px 26px",
                background: now > broke ? C.red : C.green,
                border: `${OUTLINE}px solid ${C.ink}`,
                borderRadius: "14px 40px 40px 14px",
                fontFamily: FONT.display,
                fontSize: 76,
                color: C.white,
                direction: "rtl",
                boxShadow: "8px 8px 0 rgba(0,0,0,0.22)",
              }}
            >
              {now > broke ? "ביוקר" : "₪49 בלבד!"}
            </div>
          </div>
        </div>
      ) : null}
      {now > story - 0.1 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1250,
            transform: `translate(-50%, -50%) scale(${popAt(now, story - 0.1)}) rotate(-2deg)`,
          }}
        >
          <TextBubble
            text="…ואז, בטיול אחרי הצבא"
            size={58}
            font={FONT.serif}
            weight={800}
            fill={C.white}
            tail="bottom-right"
          />
        </div>
      ) : null}
      <Txt
        x={300}
        y={1420}
        size={70}
        font={FONT.display}
        color={C.red}
        scale={popAt(now, scene.t("story", 8))}
        rot={-8}
      >
        ×20
      </Txt>
    </>
  );
};

/** "Later", the sly creature, and next week's suspiciously empty diary. */
export const Later: Art = ({ scene, now }) => {
  const at = scene.card("later").show;
  const tag = scene.t("later", 6);
  const sly = scene.t("sly", 4);
  const free = scene.t("free", 3);
  const full = scene.t("isnot", 1);
  const glance =
    now > sly && now < sly + 1.2
      ? Math.floor((now - sly) * 5) % 2 === 1
      : false;
  const days = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳"];
  const busy = ["פגישה", "עבודה", "ילדים", "מילואים", "הורים"];
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${bob(now, 10)}px)`,
        }}
      >
        <Ico
          name="later"
          px={16}
          x={290}
          y={1250}
          at={at + 0.2}
          now={now}
          flip={glance}
        />
      </div>
      {now > tag - 0.1 ? (
        <div
          style={{
            position: "absolute",
            left: 290,
            top: 1440,
            transform: `translate(-50%, -50%) scale(${popAt(now, tag - 0.1)}) rotate(-4deg)`,
            padding: "8px 28px",
            background: C.ink,
            color: C.white,
            borderRadius: 14,
            fontFamily: FONT.display,
            fontSize: 64,
            whiteSpace: "nowrap",
            direction: "rtl",
          }}
        >
          ״אחר כך״
        </div>
      ) : null}
      {now > free - 0.6 ? (
        <div
          style={{
            position: "absolute",
            left: 740,
            top: 1260,
            transform: `translate(-50%, -50%) scale(${popAt(now, free - 0.6)}) translateX(${shake(now, full, 0.5, 10)}px)`,
          }}
        >
          <div
            style={{
              width: 420,
              height: 560,
              background: C.white,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 22,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
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
                fontSize: 42,
                lineHeight: "90px",
                textAlign: "center",
              }}
            >
              השבוע הבא
            </div>
            {days.map((d, i) => {
              const filled = now > full + i * 0.05;
              return (
                <div
                  key={d}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    height: 90,
                    borderBottom: "4px solid #e4ddcf",
                    padding: "0 20px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontWeight: 800,
                      fontSize: 36,
                      color: C.inkSoft,
                      width: 46,
                    }}
                  >
                    {d}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 58,
                      borderRadius: 12,
                      background: filled
                        ? [C.red, C.yellow, C.green, C.violet, C.orange][i]
                        : now > free
                          ? "#e1f6e8"
                          : "transparent",
                      border: filled
                        ? `4px solid ${C.ink}`
                        : "4px dashed #cfc8b6",
                      fontFamily: FONT.sans,
                      fontWeight: 700,
                      fontSize: 30,
                      lineHeight: "50px",
                      textAlign: "center",
                      color: filled ? C.ink : C.green,
                    }}
                  >
                    {filled ? busy[i] : now > free ? "פנוי" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
};

const TECH: {
  card: string;
  word: number;
  icon: IconName;
  label: string;
  px: number;
  x: number;
  y: number;
}[] = [
  {
    card: "internet",
    word: 2,
    icon: "crt",
    label: "האינטרנט",
    px: 7,
    x: 830,
    y: 1110,
  },
  {
    card: "phone",
    word: 2,
    icon: "nokia",
    label: "טלפון→מחשב",
    px: 8,
    x: 540,
    y: 1110,
  },
  {
    card: "facebook",
    word: 3,
    icon: "cap",
    label: "רק לסטודנטים",
    px: 8,
    x: 250,
    y: 1110,
  },
  {
    card: "smartphone",
    word: 2,
    icon: "smartphone",
    label: "״מיותר״",
    px: 8,
    x: 690,
    y: 1400,
  },
  {
    card: "cloud",
    word: 2,
    icon: "cloud",
    label: "הענן",
    px: 8,
    x: 390,
    y: 1400,
  },
];

/** Every wave of technology they already lived through, tile by tile. */
export const Timeline: Art = ({ scene, now }) => {
  const upd = scene.t("fear", 2);
  const tilesFrom = scene.card("done").show;
  return (
    <>
      {now > upd - 0.1 && now < tilesFrom + 0.4 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1250,
            transform: `translate(-50%, -50%) scale(${popAt(now, upd - 0.1) * (1 - easeIn(ramp(now, tilesFrom, tilesFrom + 0.4)))})`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "26px 40px",
              background: C.white,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 30,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.25)",
              direction: "rtl",
            }}
          >
            <Pixel name="sparkle" px={6} colors={{ x: C.yellow }} />
            <div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 800,
                  fontSize: 48,
                  color: C.ink,
                }}
              >
                עדכון חדש זמין
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 600,
                  fontSize: 32,
                  color: C.inkSoft,
                }}
              >
                להתקין עכשיו?
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {TECH.map((t) => {
        const at = scene.t(t.card, t.word) - 0.15;
        const p = popAt(now, at);
        if (p <= 0) return null;
        return (
          <div
            key={t.card}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * p}) rotate(${(rand(t.x) - 0.5) * 6}deg)`,
            }}
          >
            <div
              style={{
                width: 250,
                height: 250,
                background: C.white,
                border: `${OUTLINE}px solid ${C.ink}`,
                borderRadius: 28,
                boxShadow: "10px 10px 0 rgba(0,0,0,0.28)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <Pixel name={t.icon} px={t.px} colors={{ x: C.blueSky }} />
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 800,
                  fontSize: 30,
                  color: C.ink,
                  direction: "rtl",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export const AI: Art = ({ scene, now }) => {
  const at = scene.t("ai", 4) - 0.2;
  const far = easeInOut(
    ramp(now, scene.t("toofar", 3), scene.t("toofar", 4) + 0.5),
  );
  const maybe = scene.t("maybe", 0);
  const sign = scene.t("toofar", 3);
  const pulse = 1 + beatPulse(now) * 0.08;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${-far * 260}px, ${-far * 180}px) scale(${1 - far * 0.6})`,
          transformOrigin: "540px 1250px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${pulse})`,
            transformOrigin: "540px 1250px",
          }}
        >
          <Ico
            name="sparkle"
            px={20}
            x={540}
            y={1250}
            at={at}
            now={now}
            colors={{ x: C.yellow }}
          />
        </div>
        {[0, 1, 2, 3].map((i) => {
          const a = now * 1.6 + (i / 4) * Math.PI * 2;
          return (
            <Ico
              key={i}
              name="sparkle"
              px={5}
              x={540 + Math.cos(a) * 250}
              y={1250 + Math.sin(a) * 170}
              at={at + 0.2 + i * 0.1}
              now={now}
              colors={{ x: [C.white, C.pink, "#9ff0c9", C.blueSky][i] }}
            />
          );
        })}
      </div>
      {now > sign - 0.1 ? (
        <div
          style={{
            position: "absolute",
            left: 790,
            top: 1300,
            transform: `translate(-50%, -50%) scale(${popAt(now, sign - 0.1)}) rotate(${shake(now, maybe, 0.8, 7, 18)}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <div style={{ position: "relative", width: 360, height: 360 }}>
            <div
              style={{
                position: "absolute",
                left: 168,
                top: 120,
                width: 24,
                height: 240,
                background: "#cfc8b6",
                border: `5px solid ${C.ink}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 360,
                height: 130,
                background: C.yellow,
                border: `${OUTLINE}px solid ${C.ink}`,
                borderRadius: 16,
                clipPath: "polygon(16% 0, 100% 0, 100% 100%, 16% 100%, 0 50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT.display,
                fontSize: 80,
                color: C.ink,
                direction: "rtl",
                paddingLeft: 40,
                boxSizing: "border-box",
              }}
            >
              רחוק מדי
            </div>
          </div>
        </div>
      ) : null}
      <Txt
        x={300}
        y={1100}
        size={160}
        font={FONT.display}
        color={C.white}
        scale={popAt(now, maybe)}
        rot={-10}
        style={{ textShadow: `6px 6px 0 ${C.ink}` }}
      >
        ?
      </Txt>
    </>
  );
};

/** Typing it all by hand, as the young will never believe. */
export const Keyboard: Art = ({ scene, now }) => {
  const at = scene.card("tenyears").show;
  const p = popAt(now, at);
  const yearFrom = scene.t("tenyears", 4);
  const year =
    2026 +
    Math.round(easeInOut(ramp(now, yearFrom - 0.2, yearFrom + 0.5)) * 10);
  const typeFrom = scene.t("ourselves", 3);
  const typeTo = scene.te("ourselves", 5) + 0.2;
  const text = "לכתוב הכל בעצמנו…";
  const n = Math.floor(
    [...text].length * clamp01((now - typeFrom) / (typeTo - typeFrom)),
  );
  const typing = now > typeFrom && now < typeTo;
  const young = scene.card("explain").show;
  const wow = scene.t("believe", 2);
  return p <= 0 ? null : (
    <>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1010,
          transform: `translate(-50%, -50%) scale(${popAt(now, at)})`,
          padding: "6px 34px",
          background: C.white,
          border: `${OUTLINE}px solid ${C.ink}`,
          borderRadius: 18,
          fontFamily: FONT.display,
          fontSize: 96,
          color: C.ink,
          boxShadow: "10px 10px 0 rgba(0,0,0,0.28)",
        }}
      >
        {year}
      </div>
      <Panel
        x={540}
        y={1200}
        w={880}
        h={130}
        fill={C.white}
        radius={20}
        style={{ opacity: live(now, typeFrom - 0.3) }}
      >
        <div
          style={{
            padding: "0 36px",
            fontFamily: FONT.sans,
            fontWeight: 600,
            fontSize: 54,
            lineHeight: "118px",
            color: C.ink,
            direction: "rtl",
            whiteSpace: "nowrap",
          }}
        >
          {[...text].slice(0, n).join("")}
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 56,
              background: C.ink,
              marginRight: 6,
              verticalAlign: "middle",
              opacity: Math.floor(now * 3) % 2,
            }}
          />
        </div>
      </Panel>
      <div
        style={{
          position: "absolute",
          left: 540 - 450,
          top: 1320,
          width: 900,
          height: 270,
          background: "#e6e1d6",
          border: `${OUTLINE}px solid ${C.ink}`,
          borderRadius: 26,
          boxShadow: "12px 12px 0 rgba(0,0,0,0.28)",
          padding: 18,
          boxSizing: "border-box",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          transform: `scale(${0.6 + 0.4 * p})`,
          opacity: clamp01(p * 3),
        }}
      >
        {Array.from({ length: 44 }).map((_, i) => {
          const down =
            typing &&
            Math.floor(rand(Math.floor(now * 14) * 7 + i) * 44) % 9 === 0;
          return (
            <div
              key={i}
              style={{
                width: 66,
                height: 50,
                background: down ? "#bdb6a7" : C.white,
                border: `4px solid ${C.ink}`,
                borderRadius: 8,
                boxShadow: down ? "none" : "0 5px 0 #9a958c",
                transform: down ? "translateY(4px)" : undefined,
              }}
            />
          );
        })}
      </div>
      <Ico
        name="person"
        px={9}
        x={900}
        y={1020}
        at={young}
        now={now}
        colors={{ x: C.yellow, H: "#e07a2b" }}
      />
      {now > wow - 0.1 ? (
        <div
          style={{
            position: "absolute",
            left: 790,
            top: 900,
            transform: `translate(-50%, -50%) scale(${popAt(now, wow - 0.1)})`,
          }}
        >
          <TextBubble text="באמת?!" size={46} tail="bottom-right" />
        </div>
      ) : null}
    </>
  );
};

/** Youth in a jar, crossed out; then curiosity, which works better. */
export const Curious: Art = ({ scene, now }) => {
  const jarOn = live(now, scene.card("young").show, scene.card("curious").show);
  const strike = scene.t("young", 3);
  const bored = during(scene, now, "boring");
  const cur = scene.t("curious", 1);
  const sweep = Math.sin((now - cur) * 1.6);
  const field: { icon: IconName; x: number; y: number }[] = [
    { icon: "star", x: 220, y: 1150 },
    { icon: "note", x: 420, y: 1420 },
    { icon: "bulb", x: 640, y: 1130 },
    { icon: "butterfly", x: 850, y: 1380 },
    { icon: "eye", x: 330, y: 1300 },
    { icon: "sparkle", x: 760, y: 1210 },
  ];
  return (
    <>
      {jarOn > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: jarOn,
            filter: bored > 0 ? `grayscale(${bored})` : undefined,
          }}
        >
          <Ico
            name="jar"
            px={17}
            x={540}
            y={1300}
            at={scene.card("young").show}
            now={now}
            colors={{ y: C.pink, Y: "#e56e93" }}
          />
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 1260,
              transform: "translate(-50%, -50%) rotate(-3deg)",
              padding: "8px 22px",
              background: C.white,
              border: `5px solid ${C.ink}`,
              fontFamily: FONT.serif,
              fontWeight: 800,
              fontSize: 40,
              whiteSpace: "nowrap",
              direction: "rtl",
            }}
          >
            צעירים לנצח
            <div
              style={{
                position: "absolute",
                left: -10,
                right: -10,
                top: "50%",
                height: 10,
                background: C.red,
                transform: `scaleX(${easeOut(ramp(now, strike, strike + 0.25))}) rotate(-6deg)`,
                transformOrigin: "100% 50%",
              }}
            />
          </div>
          {bored > 0
            ? [0, 1, 2].map((i) => (
                <Txt
                  key={i}
                  x={720 + i * 50}
                  y={1120 - i * 60 - ((now * 30) % 30)}
                  size={50 + i * 14}
                  font={FONT.display}
                  color={C.inkSoft}
                  opacity={bored * 0.8}
                >
                  Z
                </Txt>
              ))
            : null}
        </div>
      ) : null}
      {now > cur - 0.4
        ? field.map((f, i) => (
            <Ico
              key={i}
              name={f.icon}
              px={7}
              x={f.x}
              y={f.y}
              at={cur - 0.4 + i * 0.08}
              now={now}
              float={8}
              colors={{ x: C.yellow }}
            />
          ))
        : null}
      {now > cur - 0.2 ? (
        <Svg>
          <g
            transform={`translate(${540 + sweep * 260} ${1280 + Math.cos((now - cur) * 2.3) * 90}) scale(${popAt(now, cur - 0.2)})`}
          >
            <line
              x1={70}
              y1={70}
              x2={150}
              y2={150}
              stroke={C.ink}
              strokeWidth={30}
              strokeLinecap="round"
            />
            <circle
              r={105}
              fill="rgba(255,255,255,0.35)"
              stroke={C.ink}
              strokeWidth={16}
            />
            <path
              d="M -60 -30 A 70 70 0 0 1 -20 -70"
              fill="none"
              stroke={C.white}
              strokeWidth={10}
              strokeLinecap="round"
            />
          </g>
        </Svg>
      ) : null}
      <Burst
        x={640}
        y={1130}
        at={scene.t("interesting", 3)}
        now={now}
        r={160}
        n={10}
      />
    </>
  );
};

/** Things loved without irony: the tape, the theme song, no trophy for taste. */
export const Tape: Art = ({ scene, now }) => {
  const heart = during(scene, now, "irony");
  const movie = during(scene, now, "movie");
  const theme = during(scene, now, "theme");
  const prize = during(scene, now, "prize");
  return (
    <>
      {heart > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: heart,
            transform: `scale(${1 + beatPulse(now) * 0.06})`,
            transformOrigin: "540px 1270px",
          }}
        >
          <Ico
            name="heart"
            px={22}
            x={540}
            y={1270}
            at={scene.card("irony").show}
            now={now}
          />
        </div>
      ) : null}
      {movie > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1270,
            transform: `translate(-50%, -50%) scale(${popAt(now, scene.t("movie", 0) - 0.1)}) rotate(-4deg)`,
            opacity: movie,
          }}
        >
          <div
            style={{
              width: 720,
              height: 420,
              background: "#24222a",
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 22,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 50,
                right: 50,
                top: 40,
                height: 150,
                background: C.white,
                border: `5px solid ${C.ink}`,
                transform: "rotate(-1.5deg)",
                fontFamily: FONT.serif,
                fontWeight: 800,
                fontSize: 52,
                lineHeight: "140px",
                textAlign: "center",
                color: C.blueDeep,
                direction: "rtl",
              }}
            >
              הסרט שלי — לא למחוק!!
            </div>
            {[200, 520].map((x) => (
              <div
                key={x}
                style={{
                  position: "absolute",
                  left: x - 70,
                  top: 230,
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  background: "#3d3a44",
                  border: `5px solid ${C.ink}`,
                  transform: `rotate(${now * 200}deg)`,
                }}
              >
                {[0, 60, 120].map((r) => (
                  <div
                    key={r}
                    style={{
                      position: "absolute",
                      left: 63,
                      top: 10,
                      width: 14,
                      height: 120,
                      background: "#57535e",
                      transform: `rotate(${r}deg)`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {theme > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: theme }}>
          <Ico
            name="tv"
            px={20}
            x={540}
            y={1290}
            at={scene.t("theme", 0) - 0.1}
            now={now}
            colors={{ x: C.green }}
          />
          {[0, 1, 2, 3].map((i) => (
            <Ico
              key={i}
              name="note"
              px={6}
              x={[280, 820, 330, 770][i]}
              y={1180 - ((now * 80 + i * 60) % 200)}
              at={scene.t("theme", 1) + i * 0.15}
              now={now}
              colors={{ v: [C.violet, C.pink, C.blue, C.orange][i] }}
            />
          ))}
        </div>
      ) : null}
      {prize > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: prize }}>
          <Ico
            name="trophy"
            px={18}
            x={540}
            y={1250}
            at={scene.t("prize", 1)}
            now={now}
          />
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 1460,
              transform: `translate(-50%, -50%) scale(${popAt(now, scene.t("prize", 6))})`,
              padding: "6px 26px",
              background: C.white,
              border: `5px solid ${C.ink}`,
              fontFamily: FONT.serif,
              fontWeight: 800,
              fontSize: 42,
              direction: "rtl",
              whiteSpace: "nowrap",
            }}
          >
            על טעם מתוחכם
            <div
              style={{
                position: "absolute",
                left: -10,
                right: -10,
                top: "50%",
                height: 10,
                background: C.red,
                transform: `scaleX(${easeOut(ramp(now, scene.t("prize", 9), scene.t("prize", 9) + 0.25))}) rotate(-5deg)`,
                transformOrigin: "100% 50%",
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

/** A shoebox of silly things that becomes an archive. */
export const Shoebox: Art = ({ scene, now }) => {
  const at = scene.card("silly").show;
  const open =
    easeOut(ramp(now, scene.t("silly", 1), scene.t("silly", 1) + 0.4)) *
    (1 -
      easeInOut(
        ramp(now, scene.t("archive", 3) - 0.2, scene.t("archive", 3) + 0.2),
      ));
  const p = popAt(now, at);
  const items: { t: number; el: React.ReactNode }[] = [
    { t: scene.t("items", 0), el: <Pixel name="ticket" px={9} /> },
    { t: scene.t("items", 1), el: <Pixel name="sticky" px={9} /> },
    {
      t: scene.t("items", 2),
      el: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 22px",
            background: "#d6f5c9",
            border: `5px solid ${C.ink}`,
            borderRadius: 40,
          }}
        >
          <svg width={30} height={34} viewBox="0 0 30 34">
            <path d="M 2 2 L 28 17 L 2 32 Z" fill={C.ink} />
          </svg>
          {[18, 34, 24, 40, 20, 30, 14, 26].map((h, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: h,
                background: C.ink,
                borderRadius: 4,
              }}
            />
          ))}
          <span
            style={{
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 26,
              color: C.ink,
            }}
          >
            0:14
          </span>
        </div>
      ),
    },
  ];
  const label = scene.t("archive", 3);
  return p <= 0 ? null : (
    <>
      {items.map((it, i) => {
        const k = ramp(now, it.t - 0.1, it.t + 0.55);
        if (k <= 0) return null;
        const inside = k >= 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 360 + i * 160,
              top: inside ? 1250 : 980 + easeIn(k) * 270,
              transform: `translate(-50%, -50%) rotate(${(i - 1) * 14}deg) scale(${inside ? 0.8 : 1})`,
              opacity: inside && open < 0.3 ? 0 : 1,
            }}
          >
            {it.el}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 540 - 300,
          top: 1260,
          width: 600,
          height: 280,
          transform: `scale(${0.6 + 0.4 * p})`,
          opacity: clamp01(p * 3),
          transformOrigin: "50% 100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#c98a52",
            border: `${OUTLINE}px solid ${C.ink}`,
            borderRadius: 10,
            boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -20,
            right: -20,
            top: -60,
            height: 70,
            background: "#b0733f",
            border: `${OUTLINE}px solid ${C.ink}`,
            borderRadius: 10,
            transform: `rotate(${-open * 40}deg) translateY(${-open * 40}px)`,
            transformOrigin: "0% 100%",
          }}
        />
        {now > label ? (
          <div
            style={{
              position: "absolute",
              left: 300,
              top: 140,
              transform: `translate(-50%, -50%) scale(${pop(now - label, 0.35, 0.5)}) rotate(-3deg)`,
              padding: "10px 28px",
              background: C.white,
              border: `5px solid ${C.ink}`,
              fontFamily: FONT.serif,
              fontWeight: 800,
              fontSize: 46,
              whiteSpace: "nowrap",
              direction: "rtl",
            }}
          >
            ארכיון: מי שהייתי
          </div>
        ) : null}
      </div>
    </>
  );
};

/** A camera roll of screenshots, selected and binned. */
export const Screenshots: Art = ({ scene, now }) => {
  const at = scene.card("notall").show;
  const p = popAt(now, at);
  const select = scene.t("delete", 0);
  const countAt = scene.t("count", 2);
  const bin = scene.t("dontneed", 2);
  const gone = easeIn(ramp(now, bin, bin + 0.6));
  const n = Math.round(
    easeOut(ramp(now, countAt - 0.2, countAt + 0.5)) * 24000 * (1 - gone),
  );
  return p <= 0 ? null : (
    <>
      <div
        style={{
          position: "absolute",
          left: 470,
          top: 1260,
          transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`,
          opacity: clamp01(p * 3),
        }}
      >
        <div
          style={{
            width: 460,
            height: 660,
            background: C.white,
            border: `${OUTLINE + 4}px solid ${C.ink}`,
            borderRadius: 54,
            boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: 90,
              borderBottom: "4px solid #e4ddcf",
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 32,
              lineHeight: "90px",
              textAlign: "center",
              color: n > 0 ? C.blue : C.ink,
              direction: "rtl",
            }}
          >
            {n > 0 ? `${n.toLocaleString("en-US")} נבחרו` : "צילומי מסך"}
          </div>
          <div
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              top: 104,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              transform: `translate(${gone * 300}px, ${gone * 200}px) scale(${1 - gone * 0.9})`,
              transformOrigin: "100% 100%",
              opacity: 1 - gone,
            }}
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 77,
                  height: 100,
                  background: ["#e9e4f5", "#dff0e6", "#fbe6d6", "#e3edf9"][
                    i % 4
                  ],
                  border: "3px solid #9a958c",
                  borderRadius: 6,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    right: 8,
                    top: 12,
                    height: 8,
                    background: "#b9b3a6",
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    right: 22,
                    top: 28,
                    height: 8,
                    background: "#b9b3a6",
                    borderRadius: 4,
                  }}
                />
                {now > select + i * 0.012 ? (
                  <div
                    style={{
                      position: "absolute",
                      right: 4,
                      bottom: 4,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      background: C.blue,
                      border: "3px solid white",
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${1 + (now > bin && now < bin + 0.6 ? Math.sin((now - bin) * 20) * 0.04 : 0)})`,
          transformOrigin: "860px 1420px",
        }}
      >
        <Ico name="trash" px={12} x={860} y={1420} at={select} now={now} />
      </div>
    </>
  );
};

/** Forty: the balloons, and the people who seemed to know. */
export const Forty: Art = ({ scene, now }) => {
  const at = scene.card("worry").show;
  const deflate = easeIn(
    ramp(now, scene.t("noone", 4), scene.t("noone", 4) + 0.8),
  );
  const knows = scene.t("thought", 5);
  const doubt = scene.t("closer", 6);
  const walk = easeInOut(
    ramp(now, scene.t("closer", 2), scene.t("closer", 3) + 0.4),
  );
  const Balloon: React.FC<{
    d: string;
    x: number;
    color: string;
    delay: number;
  }> = ({ d, x, color, delay }) => {
    const p = popAt(now, at + delay);
    if (p <= 0) return null;
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: 1110 + bob(now, 14, x) + deflate * 260,
          transform: `translate(-50%, -50%) scale(${p * (1 - deflate * 0.55)}, ${p * (1 - deflate * 0.7)}) rotate(${deflate * (x > 540 ? 30 : -30)}deg)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 330,
            lineHeight: 1,
            color,
            WebkitTextStroke: `10px ${C.ink}`,
            paintOrder: "stroke fill",
            textShadow: "10px 10px 0 rgba(0,0,0,0.22)",
          }}
        >
          {d}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "92%",
            width: 4,
            height: 200,
            background: C.ink,
          }}
        />
      </div>
    );
  };
  return (
    <>
      {/* Numbers read left to right even in Hebrew: the 4 goes on the left. */}
      <Balloon d="4" x={430} color={C.yellow} delay={0} />
      <Balloon d="0" x={650} color={C.yellow} delay={0.15} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: live(
            now,
            scene.card("thought").show,
            scene.card("noone").show,
          ),
        }}
      >
        <Ico
          name="person"
          px={10}
          x={200 + walk * 480}
          y={1440}
          at={scene.t("thought", 1)}
          now={now}
          colors={{ x: C.green, H: "#3b2414" }}
        />
        <Ico
          name="person"
          px={11}
          x={860}
          y={1430}
          at={scene.t("thought", 4)}
          now={now}
          colors={{ x: "#4a4f63", H: "#9a958c" }}
          flip
        />
        {now > knows - 0.1 ? (
          <div
            style={{
              position: "absolute",
              left: 830,
              top: 1250,
              transform: `translate(-50%, -50%) scale(${popAt(now, knows - 0.1)})`,
            }}
          >
            <TextBubble
              text={now > doubt ? "???" : "הכל תחת שליטה"}
              size={40}
              tail="bottom-right"
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

/** Everyone holding things together with tape. */
export const Improv: Art = ({ scene, now }) => {
  const who = [
    {
      label: "כולם",
      t: scene.t("improv", 1),
      x: 820,
      colors: { x: C.blue, H: "#3b2414" },
    },
    {
      label: "ההורים",
      t: scene.t("parents2", 3),
      x: 540,
      colors: { x: C.pink, H: "#bdb6a7" },
    },
    {
      label: "הבוסים",
      t: scene.t("bosses", 3),
      x: 260,
      colors: { x: "#2d2b33", H: "#5a3820" },
    },
  ];
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${now * 90}deg)`,
          transformOrigin: "540px 990px",
        }}
      >
        <Ico
          name="tape"
          px={9}
          x={540}
          y={990}
          at={scene.card("improv").show}
          now={now}
        />
      </div>
      {who.map((w, i) => {
        const appear = scene.card(["improv", "parents2", "bosses"][i]).show;
        const p = popAt(now, appear);
        if (p <= 0) return null;
        const slap = easeOut(ramp(now, w.t, w.t + 0.12));
        return (
          <div
            key={w.label}
            style={{
              position: "absolute",
              left: w.x,
              top: 1310,
              transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * p})`,
            }}
          >
            <div
              style={{
                width: 240,
                height: 330,
                background: C.white,
                border: `${OUTLINE}px solid ${C.ink}`,
                borderRadius: 24,
                boxShadow: "10px 10px 0 rgba(0,0,0,0.22)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingBottom: 20,
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              <Pixel name="person" px={11} colors={w.colors} />
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 800,
                  fontSize: 38,
                  color: C.ink,
                  marginTop: 10,
                  direction: "rtl",
                }}
              >
                {w.label}
              </div>
              {slap > 0
                ? [-28, 30].map((r, j) => (
                    <div
                      key={j}
                      style={{
                        position: "absolute",
                        left: -20,
                        right: -20,
                        top: 110 + j * 40,
                        height: 46,
                        background: "#b8b3a8",
                        border: `4px solid ${C.ink}`,
                        opacity: 0.95,
                        transform: `rotate(${r}deg) scale(${1.5 - 0.5 * slap})`,
                        clipPath:
                          "polygon(0 8%, 4% 0, 96% 6%, 100% 0, 98% 100%, 94% 90%, 3% 100%, 0 88%)",
                      }}
                    />
                  ))
                : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

/** 2 a.m., and the person who has it all figured out types a question. */
export const Search: Art = ({ scene, now }) => {
  const cool = scene.card("solved").show;
  const coolOn = live(now, cool, scene.card("searched").show + 0.2);
  const box = scene.card("searched").show;
  const q = ["איך", "לדעת", "אם", "הגיע", "הזמן", "להתפטר"];
  const qWords = scene.card("quit").words;
  let typed = "";
  q.forEach((w, i) => {
    const s = qWords[i]?.s ?? Infinity;
    const e = Math.max(s + 0.15, (qWords[i]?.e ?? s) - 0.05);
    const k = clamp01((now - s) / (e - s));
    const part = [...w].slice(0, Math.ceil([...w].length * k)).join("");
    if (k > 0) typed += (i ? " " : "") + part;
  });
  const done = scene.te("quit") + 0.15;
  const suggestions = ["…מהעבודה", "…מהקבוצה של ההורים", "…להתבגר"];
  return (
    <>
      {coolOn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: coolOn }}>
          <Ico
            name="person"
            px={18}
            x={540}
            y={1300}
            at={cool}
            now={now}
            colors={{ x: C.white, H: "#2b1d14" }}
          />
          <div
            style={{
              position: "absolute",
              left: 540 - 72,
              top: 1300 - 144 + 4 * 18,
              width: 144,
              height: 36,
              background: C.ink,
              opacity: popAt(now, cool + 0.3),
            }}
          />
          <Burst
            x={540}
            y={1150}
            at={scene.t("solved", 5)}
            now={now}
            color={C.yellow}
            r={190}
            n={10}
          />
        </div>
      ) : null}
      <Ico name="moon" px={8} x={880} y={1010} at={box} now={now} float={5} />
      <Txt
        x={250}
        y={1010}
        size={64}
        font={FONT.display}
        color="#ff6a5a"
        opacity={live(now, box + 0.2)}
        style={{ textShadow: "0 0 14px #ff4d3a", direction: "ltr" }}
      >
        02:13
      </Txt>
      {now > box + 0.3 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1200,
            transform: `translate(-50%, -50%) scale(${popAt(now, box + 0.3)})`,
          }}
        >
          <div
            style={{
              width: 900,
              background: C.white,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 34,
              boxShadow: "12px 12px 0 rgba(0,0,0,0.35)",
              overflow: "hidden",
              direction: "rtl",
            }}
          >
            <div
              style={{
                height: 112,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "0 32px",
                fontFamily: FONT.sans,
                fontWeight: 600,
                fontSize: 42,
                color: C.ink,
              }}
            >
              <svg width={46} height={46} viewBox="0 0 50 50">
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
              <span style={{ whiteSpace: "nowrap" }}>{typed}</span>
              <span
                style={{
                  width: 4,
                  height: 48,
                  background: C.ink,
                  opacity: Math.floor(now * 3) % 2,
                }}
              />
            </div>
            {suggestions.map((s, i) =>
              now > done + i * 0.12 ? (
                <div
                  key={s}
                  style={{
                    borderTop: "3px solid #e4ddcf",
                    padding: "18px 40px",
                    fontFamily: FONT.sans,
                    fontWeight: 500,
                    fontSize: 36,
                    color: C.inkSoft,
                    whiteSpace: "nowrap",
                  }}
                >
                  {typed} <b style={{ color: C.ink }}>{s}</b>
                </div>
              ) : null,
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};
