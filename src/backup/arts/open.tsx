import React from "react";
import { Pixel } from "../pixel/Pixel";
import { SysButton, Segments, Win } from "../engine/kit";
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
import { Art } from "./types";
import { Ico, Svg, Txt, bob, live, popAt, shake } from "./common";

/**
 * The cold open, on an amber monochrome monitor: the advice, a warning
 * dialog, the computer that will not switch on, the drive in the drawer,
 * the cascade of errors that is "trial and error". Then the title, as the
 * screen switches over to paper.
 */

const AMBER = C.amber;

/** Text typed out over a span of time. */
const typed = (text: string, now: number, from: number, to: number): string => {
  const chars = [...text];
  return chars
    .slice(0, Math.floor(chars.length * clamp01((now - from) / (to - from))))
    .join("");
};

export const Boot: Art = ({ now }) => {
  const lines = [
    { text: "BIOS 1998 · בדיקת זיכרון 640K … תקין", from: 0.0, to: 0.7 },
    { text: "טוען פרופיל: דור_Y", from: 0.8, to: 1.3 },
    { text: "C:\\עצות> _", from: 1.5, to: 1.8 },
  ];
  // Power-on: the picture blooms from a bright line in the first instant.
  const on = easeOut(ramp(now, 0, 0.25));
  return (
    <>
      <div
        style={{ position: "absolute", right: 90, top: 300, direction: "rtl" }}
      >
        {lines.map((l) => (
          <div
            key={l.text}
            style={{
              fontFamily: FONT.sans,
              fontWeight: 500,
              fontSize: 30,
              lineHeight: 1.7,
              color: AMBER,
              opacity: 0.55,
              textShadow: `0 0 10px ${AMBER}88`,
              whiteSpace: "nowrap",
            }}
          >
            {typed(l.text, now, l.from, l.to)}
          </div>
        ))}
      </div>
      {on < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 960 - 960 * on,
            height: Math.max(6, 1920 * on),
            background: "#fff3d6",
            opacity: 1 - on,
          }}
        />
      ) : null}
    </>
  );
};

export const Warning: Art = ({ scene, now }) => {
  const card = scene.card("backup");
  const at = card.show - 0.05;
  const p = pop(now - at, 0.4, 0.3);
  if (p <= 0) return null;
  const click = scene.t("backup", 4);
  // The pointer travels to "OK" and presses it on "really".
  const travel = easeInOut(ramp(now, click - 1.1, click - 0.05));
  const cx = 930 + (640 - 930) * travel;
  const cy = 1760 + (1432 - 1760) * travel;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 400,
          transform: `scale(${0.7 + 0.3 * p})`,
          transformOrigin: "50% 50%",
          opacity: clamp01(p * 3),
        }}
      >
        <Win
          w={960}
          h={1130}
          title="אזהרה"
          crt
          icon={<Pixel name="warn" px={3} mono={AMBER} />}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 40,
              display: "flex",
              justifyContent: "center",
              gap: 40,
              direction: "rtl",
            }}
          >
            <SysButton label="אישור" now={now} press={click} crt />
            <SysButton label="ביטול" now={now} crt />
          </div>
        </Win>
      </div>
      <Cursor x={cx} y={cy} now={now} />
    </>
  );
};

/** The arrow pointer of the era. */
export const Cursor: React.FC<{
  x: number;
  y: number;
  now: number;
  fill?: string;
  line?: string;
}> = ({ x, y, fill = "#120c05", line = AMBER }) => (
  <svg
    width={66}
    height={96}
    viewBox="-3 -3 44 64"
    style={{ position: "absolute", left: x, top: y, overflow: "visible" }}
  >
    <path
      d="M0 0 L0 46 L11 36 L19 55 L28 51 L20 33 L35 33 Z"
      fill={fill}
      stroke={line}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </svg>
);

export const PC: Art = ({ scene, now }) => {
  const px = 24;
  const left = 540 - 10 * px;
  const top = 1250 - 9 * px;
  const at = scene.card("pc1").show + 0.2;
  const p = popAt(now, at);
  if (p <= 0) return null;
  const press = scene.t("pc2", 0);
  // The power light flickers on the press, then nothing.
  const flick =
    now > press && now < press + 0.9
      ? Math.floor((now - press) * 9) % 2 === 0
      : false;
  const travel = easeInOut(ramp(now, press - 0.7, press - 0.02));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top: top + bob(now, 6),
          transform: `scale(${0.4 + 0.6 * p}) translateX(${shake(now, press, 0.35, 6)}px)`,
          opacity: clamp01(p * 3),
        }}
      >
        <Pixel name="crt" px={px} mono={AMBER} />
        <div
          style={{
            position: "absolute",
            left: 15 * px,
            top: 12 * px,
            width: px,
            height: px,
            background: flick ? "#fff3d6" : "#3a2508",
            boxShadow: flick ? `0 0 24px ${AMBER}` : "none",
          }}
        />
        {/* A blank screen with the faintest hum of static. */}
        <div
          style={{
            position: "absolute",
            left: 3 * px,
            top: 3 * px,
            width: 14 * px,
            height: 8 * px,
            background: "#050402",
            opacity: 0.85,
          }}
        />
      </div>
      {/* Dust drifting past a machine nobody has touched in years. */}
      {Array.from({ length: 14 }).map((_, i) => {
        const sx = 260 + rand(i * 7) * 560;
        const life = (now * (0.12 + rand(i) * 0.1) + rand(i * 3)) % 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sx + Math.sin(now * 0.8 + i) * 20,
              top: 1500 - life * 520,
              width: 6,
              height: 6,
              background: AMBER,
              opacity: 0.35 * Math.sin(life * Math.PI) * p,
            }}
          />
        );
      })}
      <Txt
        x={830}
        y={1040 + bob(now, 10, 1)}
        size={46}
        color={AMBER}
        font={FONT.display}
        opacity={live(now, scene.t("pc2", 3)) * 0.8}
      >
        z z z
      </Txt>
      {now > press - 0.75 && now < press + 0.25 ? (
        <Cursor
          x={720 + (left + 15 * px - 720 + 8) * travel}
          y={1650 + (top + 12 * px + 10 - 1650) * travel}
          now={now}
        />
      ) : null}
    </>
  );
};

export const Drawer: Art = ({ scene, now }) => {
  const at = scene.card("hdd1").show + 0.1;
  const open = scene.t("hdd2", 3);
  const close = scene.t("hdd2", 6);
  const cabinet = popAt(now, open - 0.35);
  const slide =
    easeOut(ramp(now, open, open + 0.3)) *
    (1 - easeInOut(ramp(now, close, close + 0.3)));
  const drop = easeIn(ramp(now, open + 0.25, open + 0.7));
  const hddY = 1150 + drop * 330;
  const hddScale = 1 - drop * 0.45;
  const photosFrom = scene.t("hdd1", 4);
  return (
    <>
      {/* Photos from the trip, sucked into the drive. */}
      {Array.from({ length: 7 }).map((_, i) => {
        const t0 = photosFrom + i * 0.16;
        const k = easeIn(ramp(now, t0, t0 + 0.55));
        if (k <= 0 || k >= 1) return null;
        const sx = 160 + rand(i * 5) * 760;
        const sy = 980 + rand(i * 9) * 80;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sx + (540 - sx) * k - 50,
              top: sy + (hddY - sy) * k - 40,
              width: 100,
              height: 80,
              border: `5px solid ${AMBER}`,
              background: "#2a1a06",
              transform: `rotate(${(rand(i) - 0.5) * 40 * (1 - k)}deg) scale(${1 - k * 0.7})`,
              boxShadow: `0 0 12px ${AMBER}55`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 12,
                top: 34,
                width: 24,
                height: 24,
                background: AMBER,
                opacity: 0.6,
                borderRadius: 12,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 40,
                top: 22,
                width: 40,
                height: 40,
                borderBottom: `5px solid ${AMBER}`,
                transform: "skewX(-30deg)",
                opacity: 0.6,
              }}
            />
          </div>
        );
      })}

      {/* The chest of drawers, in the parents' house. */}
      {cabinet > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540 - 260,
            top: 1300,
            width: 520,
            transform: `scale(${0.5 + 0.5 * cabinet})`,
            opacity: clamp01(cabinet * 3),
            transformOrigin: "50% 100%",
          }}
        >
          <Svg style={{ left: -280, top: -1300 }}>
            <g
              fill="#140d04"
              stroke={AMBER}
              strokeWidth={6}
              style={{ filter: `drop-shadow(0 0 10px ${AMBER}66)` }}
            >
              <rect x={300} y={1300} width={480} height={300} rx={8} />
              {/* drawer interior, revealed as it slides */}
              <rect
                x={330}
                y={1320 + slide * 60}
                width={420}
                height={18 + slide * 46}
                fill="#050402"
              />
              <rect x={330} y={1320 + slide * 110} width={420} height={110} />
              <rect
                x={490}
                y={1365 + slide * 110}
                width={100}
                height={18}
                rx={9}
                fill={AMBER}
              />
              <rect x={330} y={1450} width={420} height={120} />
              <rect
                x={490}
                y={1500}
                width={100}
                height={18}
                rx={9}
                fill={AMBER}
              />
            </g>
          </Svg>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${hddScale})`,
          transformOrigin: `540px ${hddY}px`,
        }}
      >
        <Ico
          name="hdd"
          px={18}
          x={540}
          y={hddY}
          at={at}
          now={now}
          mono={AMBER}
          float={drop > 0 ? 0 : 6}
          out={close}
        />
      </div>
      <Ico
        name="house"
        px={9}
        x={540}
        y={1230}
        at={close + 0.25}
        now={now}
        mono={AMBER}
      />
    </>
  );
};

export const Errors: Art = ({ scene, now }) => {
  const at = scene.card("trial").show;
  const from = scene.t("trial", 7);
  const list = typed("1. תגבו את התמונות.\n2. …", now, at + 0.3, at + 1.4);
  const count = Math.max(0, Math.min(12, Math.floor((now - from) / 0.07)));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 360,
          transform: `scale(${0.6 + 0.4 * popAt(now, at)})`,
          opacity: clamp01(popAt(now, at) * 3),
        }}
      >
        <Win w={760} h={400} title="עצות.txt" crt>
          <div
            style={{
              padding: 34,
              fontFamily: FONT.sans,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.6,
              color: AMBER,
              whiteSpace: "pre",
              direction: "rtl",
            }}
          >
            {list}
          </div>
        </Win>
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 420 - i * 30,
            top: 300 + i * 34,
          }}
        >
          <Win
            w={600}
            h={230}
            title="שגיאה"
            crt
            icon={<Pixel name="err" px={2.6} mono={AMBER} />}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "22px 26px",
                direction: "rtl",
              }}
            >
              <Pixel name="err" px={4} mono={AMBER} />
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 600,
                  fontSize: 30,
                  color: AMBER,
                  lineHeight: 1.3,
                }}
              >
                התוכנית ביצעה
                <br />
                פעולה לא חוקית
              </div>
            </div>
          </Win>
        </div>
      ))}
    </>
  );
};

/** The title, on the beat, as the monitor gives way to paper. */
export const Title: Art = ({ now }) => {
  const B = [23.87, 24.74, 25.62, 26.49, 27.36, 28.24, 29.11, 29.97];
  const flash = ramp(now, 23.35, 23.75);
  const leave = easeIn(ramp(now, 29.1, 29.85));
  const word = (
    text: string,
    at: number,
    y: number,
    size: number,
    color: string = C.ink,
    rot = 0,
  ) => {
    const p = pop(now - at, 0.5, 0.45);
    if (p <= 0) return null;
    const thump = 1 + beatPulse(now) * 0.025;
    return (
      <Txt
        x={540}
        y={y}
        size={size}
        font={FONT.display}
        color={color}
        scale={(1.5 - 0.5 * p) * thump}
        rot={rot + (1 - Math.min(1, p)) * -6}
      >
        {text}
      </Txt>
    );
  };
  const wizard = popAt(now, B[4] - 0.1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1 - leave,
          transform: `scale(${1 - leave * 0.12})`,
        }}
      >
        <Ico
          name="floppy"
          px={12}
          x={540}
          y={430}
          at={B[0] - 0.4}
          now={now}
          float={8}
        />
        {word("תגבו", B[0], 720, 300)}
        {word("את", B[1], 935, 170)}
        {word("התמונות", B[2], 1150, 290)}
        {word("(באמת.)", B[3], 1360, 150, C.red, -5)}
      </div>
      {wizard > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 160,
            top: 1440 + leave * 200,
            transform: `scale(${0.6 + 0.4 * wizard})`,
            opacity: clamp01(wizard * 3) * (1 - leave),
          }}
        >
          <Win
            w={760}
            h={250}
            title="אשף הגיבוי"
            icon={<Pixel name="floppy" px={2.6} shadow={false} />}
          >
            <div style={{ padding: "22px 30px", direction: "rtl" }}>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontWeight: 600,
                  fontSize: 30,
                  color: C.ink,
                  marginBottom: 14,
                }}
              >
                {typed(
                  "מתחיל גיבוי: ילדות, צבא, טיול, שנות ה־20…",
                  now,
                  B[4],
                  B[5] + 0.4,
                )}
              </div>
              <Segments
                p={ramp(now, B[5], B[6] + 0.4) * 0.12}
                w={696}
                h={40}
                color={C.blue}
                seg={18}
              />
            </div>
          </Win>
        </div>
      ) : null}
      {/* The monitor switching over: a white bloom from the centre line. */}
      {flash < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 960 - 960 * easeOut(flash),
            height: Math.max(8, 1920 * easeOut(flash)),
            background: "#fffaf0",
            opacity: 1 - easeIn(flash),
          }}
        />
      ) : null}
    </>
  );
};
