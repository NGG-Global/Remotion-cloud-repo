import React from "react";
import {
  CheckBox,
  OUTLINE,
  Polaroid,
  Segments,
  Stamp,
  TextBubble,
  Win,
} from "../engine/kit";
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
import { Burst, Ico, Txt, live, popAt, shake } from "./common";

/**
 * Chapters 13 to 15: nostalgia without the filter, becoming the adults in
 * the room, being kind to yourself, and the small things that are the point.
 */

const during = (scene: Scene, now: number, id: string, fade = 0.15): number => {
  const c = scene.card(id);
  return live(now, c.show, c.hide, fade);
};

/** The internet as it actually was: slow, burnt to disc, and infected. */
export const Download: Art = ({ scene, now }) => {
  const rosy = live(now, scene.card("lie").show, scene.card("slow").show);
  const crack = easeOut(
    ramp(now, scene.t("perfect", 3), scene.t("perfect", 3) + 0.3),
  );
  const winAt = scene.card("slow").show;
  const slow = during(scene, now, "slow");
  const burn = during(scene, now, "burn");
  const hourOn = live(now, scene.card("hour").show, Infinity);
  const virus = scene.t("virus", 5);
  const infected = now > virus - 0.05;
  const dl = infected
    ? 1
    : 0.04 + easeInOut(ramp(now, scene.t("virus", 0), virus)) * 0.9;
  const mins = Math.max(1, Math.round(59 * (1 - dl)));
  return (
    <>
      {rosy > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1260,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * popAt(now, scene.card("lie").show)}) rotate(${-4 + crack * 6}deg)`,
            opacity: rosy,
          }}
        >
          <Polaroid w={480} caption="פעם היה טוב" photo="#f3b7a6">
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, #ffc6b3, #f19aa3)",
                filter: "sepia(0.4)",
              }}
            />
            <div style={{ position: "absolute", left: 120, top: 110 }}>
              <Pixel name="heart" px={12} />
            </div>
            {crack > 0 ? (
              <svg
                width={420}
                height={420}
                style={{ position: "absolute", left: 0, top: 0 }}
              >
                <path
                  d="M 0 90 L 120 140 L 160 110 L 250 200 L 300 170 L 420 260"
                  fill="none"
                  stroke={C.ink}
                  strokeWidth={7}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - crack}
                />
              </svg>
            ) : null}
          </Polaroid>
        </div>
      ) : null}
      {now > winAt - 0.05 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1260,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * popAt(now, winAt - 0.05)}) translateX(${shake(now, virus, 0.8, 14, 40)}px)`,
          }}
        >
          <Win
            w={880}
            h={480}
            title={
              infected
                ? "אזהרת אבטחה!"
                : burn > 0.5
                  ? "צורב תקליטור"
                  : hourOn > 0
                    ? "מוריד קובץ"
                    : "חיבור לאינטרנט"
            }
            bar={infected ? C.red : C.blue}
            icon={
              <Pixel
                name={infected ? "bug" : "floppy"}
                px={2.4}
                shadow={false}
              />
            }
          >
            <div
              style={{
                position: "relative",
                padding: "34px 40px",
                direction: "rtl",
                fontFamily: FONT.sans,
                color: C.ink,
              }}
            >
              {slow > 0 ? (
                <div style={{ opacity: slow }}>
                  <div style={{ fontWeight: 800, fontSize: 46 }}>
                    מחייג… 56K
                  </div>
                  <svg width={780} height={120} style={{ marginTop: 10 }}>
                    <path
                      d={Array.from(
                        { length: 80 },
                        (_, i) =>
                          `${i ? "L" : "M"} ${i * 10} ${60 + Math.sin(i * 1.3 + now * 30) * (20 + rand(i + Math.floor(now * 12)) * 30)}`,
                      ).join(" ")}
                      fill="none"
                      stroke={C.blue}
                      strokeWidth={5}
                    />
                  </svg>
                  <Segments
                    p={
                      ramp(now, scene.t("slow", 0), scene.t("slow", 2) + 0.4) *
                      0.07
                    }
                    w={800}
                    h={44}
                    color={C.blue}
                  />
                </div>
              ) : null}
              {burn > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 40,
                    right: 40,
                    top: 30,
                    display: "flex",
                    alignItems: "center",
                    gap: 40,
                    opacity: burn,
                  }}
                >
                  <svg
                    width={230}
                    height={230}
                    viewBox="-115 -115 230 230"
                    style={{ transform: `rotate(${now * 720}deg)` }}
                  >
                    <defs>
                      <linearGradient id="cdShine" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#d9d4ff" />
                        <stop offset="0.35" stopColor="#bdf3ff" />
                        <stop offset="0.55" stopColor="#ffe9a8" />
                        <stop offset="0.8" stopColor="#ffc2e0" />
                        <stop offset="1" stopColor="#d9d4ff" />
                      </linearGradient>
                    </defs>
                    <circle
                      r={108}
                      fill="url(#cdShine)"
                      stroke={C.ink}
                      strokeWidth={6}
                    />
                    <circle
                      r={34}
                      fill={C.white}
                      stroke={C.ink}
                      strokeWidth={5}
                    />
                    <circle
                      r={12}
                      fill="#2f55e4"
                      stroke={C.ink}
                      strokeWidth={4}
                    />
                    <path
                      d="M 20 -100 A 100 100 0 0 1 95 -30"
                      fill="none"
                      stroke="white"
                      strokeWidth={10}
                      opacity={0.7}
                    />
                  </svg>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 46 }}>
                      צורב… 4x
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 32,
                        color: C.inkSoft,
                        marginTop: 8,
                      }}
                    >
                      הלהיטים של 2004.mp3
                    </div>
                  </div>
                </div>
              ) : null}
              {hourOn > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 40,
                    right: 40,
                    top: 30,
                    opacity: hourOn,
                  }}
                >
                  {infected ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 30 }}
                    >
                      <div
                        style={{
                          transform: `scale(${pop(now - virus, 0.4, 0.5)})`,
                        }}
                      >
                        <Pixel name="bug" px={11} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 56,
                            color: C.red,
                          }}
                        >
                          נמצא וירוס!
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 32,
                            color: C.inkSoft,
                            marginTop: 10,
                          }}
                        >
                          בקובץ: שיר_חדש_FINAL(2).mp3
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 38 }}>
                        שיר_חדש_FINAL(2).mp3
                      </div>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 34,
                          color: C.inkSoft,
                          margin: "14px 0 22px",
                        }}
                      >
                        נותרו בערך {mins} דקות
                      </div>
                      <Segments p={dl} w={800} h={44} color={C.green} />
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </Win>
        </div>
      ) : null}
    </>
  );
};

/** A print that develops, then fades: the moments nobody recorded. */
export const Memory: Art = ({ scene, now }) => {
  const at = scene.card("beautiful").show;
  const dev = easeInOut(
    ramp(now, scene.t("beautiful", 2), scene.t("beautiful", 3) + 0.5),
  );
  const fade = easeInOut(
    ramp(now, scene.t("happened", 3), scene.t("happened", 3) + 0.9),
  );
  const heartAt = scene.t("memory", 2);
  const labels = [
    { text: "מיידי", t: scene.t("instant", 3), y: 1060 },
    { text: "זמין", t: scene.t("available", 3), y: 1250 },
    { text: "מתועד", t: scene.t("documented", 3), y: 1440 },
  ];
  const labelsOut = scene.card("keep").show;
  const p = popAt(now, at);
  return (
    <>
      {p > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 380,
            top: 1250,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p}) rotate(-4deg)`,
          }}
        >
          <Polaroid w={500} photo="#f7f3ea">
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: dev * (1 - fade),
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, #ff9b6a 0%, #ffcf7a 55%, #4fa3d9 56%, #2f6fb0 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 160,
                  top: 120,
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  background: "#fff1a8",
                }}
              />
              <div style={{ position: "absolute", left: 110, top: 220 }}>
                <Pixel
                  name="person"
                  px={8}
                  colors={{ x: C.red, H: "#2b1d14" }}
                />
              </div>
              <div style={{ position: "absolute", left: 210, top: 225 }}>
                <Pixel
                  name="person"
                  px={8}
                  colors={{ x: C.yellow, H: "#c26a2b" }}
                  flip
                />
              </div>
            </div>
            {now > heartAt - 0.1 ? (
              <div
                style={{
                  position: "absolute",
                  left: 210 - 78,
                  top: 210 - 70,
                  transform: `scale(${pop(now - heartAt + 0.1, 0.5, 0.5) * (1 + beatPulse(now) * 0.12)})`,
                  filter: "drop-shadow(0 0 24px #ff7a6a)",
                }}
              >
                <Pixel name="heart" px={10} />
              </div>
            ) : null}
          </Polaroid>
        </div>
      ) : null}
      {labels.map((l) =>
        now > l.t - 0.5 ? (
          <div
            key={l.text}
            style={{
              position: "absolute",
              left: 820,
              top: l.y,
              transform: `translate(-50%, -50%) scale(${popAt(now, l.t - 0.5)})`,
              opacity: 1 - easeIn(ramp(now, labelsOut, labelsOut + 0.4)),
            }}
          >
            <div
              style={{
                position: "relative",
                padding: "8px 30px",
                background: C.white,
                border: `${OUTLINE}px solid ${C.ink}`,
                borderRadius: 16,
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 56,
                color: C.ink,
                direction: "rtl",
                boxShadow: "8px 8px 0 rgba(0,0,0,0.2)",
              }}
            >
              {l.text}
              <div
                style={{
                  position: "absolute",
                  left: -12,
                  right: -12,
                  top: "50%",
                  height: 12,
                  marginTop: -6,
                  background: C.red,
                  borderRadius: 6,
                  transform: `scaleX(${easeOut(ramp(now, l.t + 0.05, l.t + 0.3))}) rotate(-7deg)`,
                  transformOrigin: "100% 50%",
                }}
              />
            </div>
          </div>
        ) : null,
      )}
    </>
  );
};

/** The youth card: expired, then quietly taken. */
export const YouthCard: Art = ({ scene, now }) => {
  const at = scene.card("lookaround").show;
  const p = popAt(now, at);
  const expired = scene.t("adults", 2);
  const fizz = scene.t("ceremony", 3);
  const notice = scene.t("notice", 1);
  const take = easeIn(ramp(now, scene.t("card", 3), scene.t("card", 7) + 0.2));
  const look = Math.sin(now * 3) > 0;
  return p <= 0 ? null : (
    <>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1250,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          style={{
            width: 720,
            height: 450,
            border: `6px dashed ${C.inkSoft}`,
            borderRadius: 34,
            opacity: take * 0.8,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 540 + take * 900,
          top: 1250,
          transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p}) rotate(${-3 + take * 25}deg)`,
          opacity: clamp01(p * 3),
        }}
      >
        <div
          style={{
            width: 720,
            height: 450,
            background: "#e9f1ff",
            border: `${OUTLINE}px solid ${C.ink}`,
            borderRadius: 34,
            boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
            overflow: "hidden",
            position: "relative",
            direction: "rtl",
          }}
        >
          <div
            style={{
              height: 100,
              background: C.blue,
              color: C.white,
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 50,
              lineHeight: "100px",
              padding: "0 36px",
            }}
          >
            תעודת צעיר
          </div>
          <div style={{ display: "flex", gap: 36, padding: "30px 36px" }}>
            <div
              style={{
                width: 190,
                height: 250,
                background: "#cfe0ff",
                border: `5px solid ${C.ink}`,
                borderRadius: 12,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                overflow: "hidden",
              }}
            >
              <Pixel
                name="person"
                px={11}
                colors={{ x: C.orange, H: "#2b1d14" }}
                flip={look}
                shadow={false}
              />
            </div>
            <div
              style={{
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 40,
                lineHeight: 1.7,
                color: C.ink,
              }}
            >
              <div>שם: אתם</div>
              <div>גיל: 2X</div>
              <div>
                בתוקף עד: <span style={{ color: C.inkSoft }}>____</span>
              </div>
            </div>
          </div>
          {now > expired ? (
            <div style={{ position: "absolute", left: 60, top: 270 }}>
              <Stamp
                text="פג תוקף"
                at={expired}
                now={now}
                size={96}
                rot={-14}
              />
            </div>
          ) : null}
        </div>
      </div>
      {/* No ceremony: one sad piece of confetti. */}
      {now > fizz - 0.1 && now < fizz + 2 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 180,
              top: 1480,
              transform: `translate(-50%, -50%) rotate(-30deg) scale(${popAt(now, fizz - 0.1)})`,
              width: 0,
              height: 0,
              borderLeft: "40px solid transparent",
              borderRight: "40px solid transparent",
              borderBottom: `120px solid ${C.pink}`,
              filter: "drop-shadow(5px 5px 0 rgba(0,0,0,0.25))",
            }}
          />
          {[0, 1].map((i) => {
            const k = ramp(now, fizz + i * 0.1, fizz + 1.4 + i * 0.1);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 230 + i * 40 + k * 40,
                  top: 1380 - Math.sin(k * Math.PI) * 60 + k * 120,
                  width: 18,
                  height: 10,
                  background: [C.yellow, C.blue][i],
                  transform: `rotate(${k * 400}deg)`,
                  opacity: 1 - k,
                }}
              />
            );
          })}
        </>
      ) : null}
      {now > notice - 0.1 && now < notice + 1.2 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1000,
            transform: `translate(-50%, -50%) scale(${popAt(now, notice - 0.1, 0.3)})`,
            padding: "14px 32px",
            background: C.white,
            border: `5px solid ${C.ink}`,
            borderRadius: 40,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 36,
            color: C.inkSoft,
            direction: "rtl",
            whiteSpace: "nowrap",
            boxShadow: "8px 8px 0 rgba(0,0,0,0.2)",
          }}
        >
          אין הודעות חדשות
        </div>
      ) : null}
    </>
  );
};

/** "What's MSN?", born in 2005, and the urge to sit down. */
export const Msn: Art = ({ scene, now }) => {
  const at = scene.card("msn").show;
  const ask = scene.t("msn", 3);
  const msn = scene.t("msn", 7);
  const born = scene.t("born", 5);
  const sitAt = scene.t("sit", 3);
  const sit = easeIn(ramp(now, sitAt - 0.1, sitAt + 0.25));
  const msnOn = live(now, at, scene.card("born").show);
  const bornOn = live(now, scene.card("born").show, scene.card("sit").show);
  return (
    <>
      {msnOn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: msnOn }}>
          <Ico
            name="butterfly"
            px={16}
            x={400}
            y={1250}
            at={msn - 0.2}
            now={now}
            float={10}
          />
          <Ico
            name="person"
            px={12}
            x={830}
            y={1360}
            at={at}
            now={now}
            colors={{ x: "#9ff0c9", H: "#e0a21c" }}
            flip
          />
          {now > ask - 0.1 ? (
            <div
              style={{
                position: "absolute",
                left: 760,
                top: 1110,
                transform: `translate(-50%, -50%) scale(${popAt(now, ask - 0.1)})`,
              }}
            >
              <TextBubble text="מה זה MSN?" size={46} tail="bottom-right" />
            </div>
          ) : null}
        </div>
      ) : null}
      {bornOn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: bornOn }}>
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 1260,
              transform: `translate(-50%, -50%) scale(${popAt(now, born - 0.15)}) rotate(-3deg)`,
            }}
          >
            <div
              style={{
                width: 620,
                height: 400,
                background: "#fbf3dc",
                border: `${OUTLINE}px solid ${C.ink}`,
                borderRadius: 10,
                boxShadow: "12px 12px 0 rgba(0,0,0,0.22)",
                textAlign: "center",
                direction: "rtl",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 16,
                  border: `4px double ${C.inkSoft}`,
                }}
              />
              <div
                style={{
                  fontFamily: FONT.serif,
                  fontWeight: 800,
                  fontSize: 56,
                  paddingTop: 50,
                  color: C.ink,
                }}
              >
                תעודת לידה
              </div>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontSize: 190,
                  lineHeight: 1.1,
                  color: C.red,
                }}
              >
                2005
              </div>
            </div>
          </div>
          <Ico name="stroller" px={8} x={860} y={1480} at={born} now={now} />
        </div>
      ) : null}
      {now > scene.card("sit").show ? (
        <>
          <Ico
            name="chair"
            px={14}
            x={540 + (1 - easeOut(ramp(now, sitAt - 0.6, sitAt - 0.1))) * 600}
            y={1400}
            at={scene.card("sit").show}
            now={now}
          />
          <Ico
            name="person"
            px={13}
            x={500}
            y={1290 + sit * 40}
            at={scene.card("sit").show}
            now={now}
            colors={{ x: C.blue, H: "#3b2414" }}
          />
          {now > sitAt + 0.2 ? (
            <div
              style={{
                position: "absolute",
                left: 300,
                top: 1120,
                transform: `translate(-50%, -50%) scale(${popAt(now, sitAt + 0.2)})`,
              }}
            >
              <TextBubble text="אוף." size={52} tail="bottom-right" />
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
};

/** The world went on; and release notes for the version of you it made. */
export const Release: Art = ({ scene, now }) => {
  const at = scene.card("panic").show;
  const globeOn = live(now, at, scene.card("you").show);
  const notesAt = scene.card("you").show;
  const rows = [
    { sign: "+", text: "קצת יותר קמטים", t: scene.t("wrinkles", 3) },
    { sign: "−", text: "קצת פחות סבלנות", t: scene.t("patience", 2) },
    { sign: "+", text: "הרבה סיסמאות ששכחתם", t: scene.t("passwords", 2) },
    { sign: "+", text: "מנוי אחד שאתם לא זוכרים", t: scene.t("sub", 2) },
  ];
  return (
    <>
      {globeOn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: globeOn }}>
          <svg
            width={1080}
            height={1920}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <g transform={`translate(540 1270) rotate(${now * 50})`}>
              <circle
                r={220}
                fill="#5aa9f0"
                stroke={C.ink}
                strokeWidth={OUTLINE}
                transform={`rotate(${-now * 50})`}
              />
              {[0, 1, 2, 3].map((i) => (
                <ellipse
                  key={i}
                  cx={Math.cos(i * 1.7) * 110}
                  cy={Math.sin(i * 1.7) * 100}
                  rx={70 - i * 8}
                  ry={48 - i * 6}
                  fill="#45c477"
                  stroke={C.ink}
                  strokeWidth={6}
                />
              ))}
            </g>
            <path
              d="M 260 1560 A 330 140 0 0 0 820 1560"
              fill="none"
              stroke={C.ink}
              strokeWidth={10}
              strokeLinecap="round"
            />
            <path
              d="M 800 1520 L 826 1562 L 778 1576"
              fill="none"
              stroke={C.ink}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : null}
      {now > notesAt - 0.1 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1260,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * popAt(now, notesAt - 0.1)})`,
          }}
        >
          <Win
            w={900}
            h={600}
            title="מה חדש בגרסה שלכם"
            icon={
              <Pixel
                name="sparkle"
                px={2.4}
                colors={{ x: C.yellow }}
                shadow={false}
              />
            }
          >
            <div style={{ padding: "26px 40px", direction: "rtl" }}>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontSize: 70,
                  color: C.blue,
                  marginBottom: 14,
                }}
              >
                גרסה 3.6
              </div>
              {rows.map((r) =>
                now > r.t - 0.1 ? (
                  <div
                    key={r.text}
                    style={{
                      display: "flex",
                      gap: 20,
                      alignItems: "baseline",
                      fontFamily: FONT.sans,
                      fontWeight: 700,
                      fontSize: 44,
                      color: C.ink,
                      lineHeight: 1.6,
                      transform: `translateX(${(1 - popAt(now, r.t - 0.1, 0.3)) * 60}px)`,
                      opacity: clamp01((now - r.t + 0.1) / 0.1),
                    }}
                  >
                    <span
                      style={{
                        color: r.sign === "+" ? C.green : C.red,
                        fontWeight: 900,
                        width: 30,
                      }}
                    >
                      {r.sign}
                    </span>
                    {r.text}
                  </div>
                ) : null,
              )}
            </div>
          </Win>
        </div>
      ) : null}
    </>
  );
};

/** Versions of the world, stacked as windows; then the Wi-Fi password. */
export const Versions: Art = ({ scene, now }) => {
  const kind = scene.t("kind", 1);
  const stackAt = scene.t("versions", 3);
  const wins: { title: string; t: number; dark?: boolean; icon?: IconName }[] =
    [
      { title: "העולם 1.0", t: stackAt - 0.3 },
      { title: "העולם 2.0", t: stackAt - 0.15 },
      { title: "העולם 3.0", t: stackAt },
      { title: "משברים", t: scene.t("crises", 0), dark: true },
      { title: "מלחמות", t: scene.t("crises", 1), dark: true },
      { title: "מגפה", t: scene.t("crises", 2), dark: true },
      { title: "מיתונים", t: scene.t("crises", 3), dark: true },
      { title: "רשתות חברתיות", t: scene.t("social", 0), icon: "heart" },
      { title: "אפליקציות היכרויות", t: scene.t("dating", 0), icon: "ring" },
      { title: "זום", t: scene.t("zoom", 0), icon: "camera" },
    ];
  const q = scene.card("question").show;
  const stackOut = easeIn(ramp(now, q - 0.1, q + 0.3));
  const wifi = scene.t("wifi", 1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: live(now, scene.card("kind").show, stackAt - 0.4),
        }}
      >
        <Ico
          name="heart"
          px={18}
          x={540}
          y={1260}
          at={kind}
          now={now}
          float={8}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1 - stackOut,
          transform: `scale(${1 - stackOut * 0.1})`,
          transformOrigin: "540px 1260px",
        }}
      >
        {wins.map((w, i) => {
          if (now < w.t - 0.08) return null;
          const p = popAt(now, w.t - 0.08, 0.3);
          return (
            <div
              key={w.title}
              style={{
                position: "absolute",
                left: 140 + (i % 10) * 34,
                top: 980 + (i % 10) * 32,
                transform: `scale(${0.5 + 0.5 * p})`,
                transformOrigin: "50% 50%",
              }}
            >
              <Win
                w={560}
                h={260}
                title={w.title}
                bar={w.dark ? "#4a4f63" : C.blue}
                body={w.dark ? "#d8d6d0" : "#ece8df"}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  {w.icon ? (
                    <Pixel name={w.icon} px={6} />
                  ) : (
                    <div
                      style={{
                        width: 340,
                        height: 18,
                        background: w.dark ? "#9a958c" : "#c9d6f5",
                        borderRadius: 9,
                      }}
                    />
                  )}
                </div>
              </Win>
            </div>
          );
        })}
      </div>
      <Ico name="wifi" px={18} x={540} y={1270} at={q} now={now} />
      <Ico name="lock" px={8} x={680} y={1350} at={wifi} now={now} />
      <Txt
        x={380}
        y={1120}
        size={150}
        font={FONT.display}
        color={C.red}
        scale={popAt(now, scene.t("wifi", 2))}
        rot={-10}
      >
        ?
      </Txt>
    </>
  );
};

const TODO: { icon: IconName; text: string; card: string; tick: number }[] = [
  { icon: "smartphone", text: "להתקשר לחבר", card: "friend", tick: 2 },
  { icon: "shoe", text: "לצאת להליכה", card: "walk", tick: 1 },
  { icon: "floppy", text: "לעשות גיבוי", card: "dobackup", tick: 1 },
  { icon: "camera", text: "לצלם, רק לעצמכם", card: "photo", tick: 3 },
];

export const Todo: Art = ({ scene, now }) => {
  const head = scene.t("here", 2);
  const flash = scene.t("photo", 3);
  const f = now > flash && now < flash + 0.35 ? 1 - (now - flash) / 0.35 : 0;
  return (
    <>
      <Txt
        x={760}
        y={1000}
        size={48}
        weight={800}
        color={C.inkSoft}
        opacity={live(now, head)}
      >
        להיום:
      </Txt>
      {TODO.map((t, i) => {
        const at = scene.card(t.card).show;
        const p = popAt(now, at);
        if (p <= 0) return null;
        return (
          <div
            key={t.card}
            style={{
              position: "absolute",
              left: 120,
              top: 1060 + i * 128,
              width: 840,
              height: 110,
              display: "flex",
              alignItems: "center",
              gap: 28,
              direction: "rtl",
              transform: `translateX(${(1 - p) * 120}px)`,
              opacity: clamp01(p * 3),
            }}
          >
            <CheckBox at={scene.t(t.card, t.tick)} now={now} size={80} />
            <div
              style={{ width: 100, display: "flex", justifyContent: "center" }}
            >
              <Pixel
                name={t.icon}
                px={t.icon === "smartphone" ? 5.5 : 5.5}
                colors={{ x: C.blueSky }}
              />
            </div>
            <span
              style={{
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 56,
                color: C.ink,
              }}
            >
              {t.text}
            </span>
          </div>
        );
      })}
      <Ico
        name="heart"
        px={7}
        x={200}
        y={1450}
        at={scene.t("foryou", 1)}
        now={now}
        float={6}
      />
      {f > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: C.white,
            opacity: f * 0.75,
          }}
        />
      ) : null}
    </>
  );
};

/** Ordinary evenings, kept as prints, gathered into one stack. */
const PRINTS: {
  card: string;
  word: number;
  x: number;
  y: number;
  rot: number;
  photo: string;
  scene: React.ReactNode;
  date: string;
}[] = [
  {
    card: "kitchen",
    word: 4,
    x: 300,
    y: 1170,
    rot: -8,
    photo: "#ffe2b8",
    date: "'21 3 14",
    scene: (
      <>
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 0,
            width: 4,
            height: 60,
            background: "#2b2b30",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 112,
            top: 56,
            width: 60,
            height: 34,
            background: C.yellow,
            border: "4px solid #17161c",
            borderRadius: "30px 30px 6px 6px",
          }}
        />
        <div style={{ position: "absolute", left: 30, bottom: 8 }}>
          <Pixel name="person" px={6.5} colors={{ x: C.red }} shadow={false} />
        </div>
        <div style={{ position: "absolute", left: 120, bottom: 30 }}>
          <Pixel name="pot" px={5} shadow={false} />
        </div>
        <div style={{ position: "absolute", left: 220, bottom: 8 }}>
          <Pixel
            name="person"
            px={6.5}
            colors={{ x: C.blue, H: "#c26a2b" }}
            flip
            shadow={false}
          />
        </div>
      </>
    ),
  },
  {
    card: "drive",
    word: 2,
    x: 770,
    y: 1140,
    rot: 6,
    photo: "#9fd3ff",
    date: "'23 8 02",
    scene: (
      <>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 70,
            background: "#6b7f88",
          }}
        />
        <div style={{ position: "absolute", left: 60, bottom: 40 }}>
          <Pixel name="car" px={8} shadow={false} />
        </div>
        <div style={{ position: "absolute", left: 210, top: 30 }}>
          <Pixel name="note" px={4} shadow={false} />
        </div>
        <div style={{ position: "absolute", left: 40, top: 50 }}>
          <Pixel name="note" px={3.5} colors={{ v: C.pink }} shadow={false} />
        </div>
      </>
    ),
  },
  {
    card: "joke2",
    word: 5,
    x: 380,
    y: 1430,
    rot: 4,
    photo: "#ffd6e4",
    date: "'24 12 31",
    scene: (
      <>
        <div style={{ position: "absolute", left: 50, bottom: 8 }}>
          <Pixel
            name="person"
            px={7}
            colors={{ x: C.green, H: "#2b1d14" }}
            shadow={false}
          />
        </div>
        <div style={{ position: "absolute", left: 170, bottom: 8 }}>
          <Pixel
            name="person"
            px={7}
            colors={{ x: C.orange, H: "#5a3820" }}
            flip
            shadow={false}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 26,
            fontFamily: FONT.display,
            fontSize: 56,
            color: C.red,
            transform: "rotate(-8deg)",
          }}
        >
          חחח
        </div>
      </>
    ),
  },
  {
    card: "message",
    word: 2,
    x: 790,
    y: 1440,
    rot: -5,
    photo: "#e9f1ff",
    date: "'25 6 19",
    scene: (
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: 70,
          padding: "14px 18px",
          background: C.white,
          border: "4px solid #17161c",
          borderRadius: 18,
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 28,
          color: C.ink,
          direction: "rtl",
          textAlign: "right",
        }}
      >
        תודיע כשהגעת. אמא
      </div>
    ),
  },
  {
    card: "coffee",
    word: 5,
    x: 560,
    y: 1290,
    rot: -1,
    photo: "#fff1d1",
    date: "'26 10 08",
    scene: (
      <>
        <div
          style={{
            position: "absolute",
            right: 30,
            top: 24,
            width: 120,
            height: 110,
            background: "#bfe3ff",
            border: "4px solid #17161c",
          }}
        />
        <div style={{ position: "absolute", left: 90, bottom: 26 }}>
          <Pixel name="mug" px={9} shadow={false} />
        </div>
      </>
    ),
  },
];

export const Polaroids: Art = ({ scene, now }) => {
  const big = scene.t("bigmoments", 5);
  const bigOut = scene.t("bigmoments", 6) + 0.25;
  const gather = easeInOut(
    ramp(now, scene.t("miss", 1) - 0.1, scene.t("miss", 1) + 0.7),
  );
  const heart = scene.t("miss", 6);
  const drift = (now - scene.t("kitchen", 4)) * 3;
  return (
    <>
      {(["cap", "ring", "trophy"] as const).map((icon, i) => {
        const a = scene.card("bigmoments").show + i * 0.2;
        const out = easeIn(ramp(now, bigOut, bigOut + 0.4));
        if (now < a || out >= 1) return null;
        return (
          <div
            key={icon}
            style={{
              position: "absolute",
              inset: 0,
              filter: `grayscale(${ramp(now, big, big + 0.3)})`,
              opacity: 1 - out,
              transform: `translateY(${out * 140}px)`,
            }}
          >
            <Ico
              name={icon}
              px={12}
              x={820 - i * 280}
              y={1250}
              at={a}
              now={now}
            />
          </div>
        );
      })}
      {PRINTS.map((pr, i) => {
        const at = scene.t(pr.card, pr.word) - 0.15;
        if (now < at) return null;
        const p = popAt(now, at, 0.5);
        const x =
          pr.x +
          (540 - pr.x) * gather +
          Math.sin(drift * 0.1 + i) * 6 * (1 - gather);
        const y = pr.y + (1280 - pr.y) * gather - i * 8 * gather;
        const rot = pr.rot * (1 - gather) + (i - 2) * 3 * gather;
        return (
          <div
            key={pr.card}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${(0.5 + 0.5 * p) * (1 - gather * 0.12)}) rotate(${rot + (1 - Math.min(1, p)) * 12}deg)`,
            }}
          >
            <Polaroid w={380} photo={pr.photo} date={pr.date}>
              {pr.scene}
            </Polaroid>
          </div>
        );
      })}
      {now > heart - 0.1 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 1080,
            transform: `translate(-50%, -50%) scale(${pop(now - heart + 0.1, 0.5, 0.5) * (1 + beatPulse(now) * 0.1)})`,
          }}
        >
          <Pixel name="heart" px={12} />
        </div>
      ) : null}
      <Burst
        x={540}
        y={1080}
        at={heart}
        now={now}
        color={C.red}
        r={170}
        n={10}
      />
    </>
  );
};

/** The backup completes; the advice, once more. */
export const Outro: Art = ({ now }) => {
  const B = [477.23, 478.12, 479.0, 479.89, 480.77, 481.64, 482.51, 483.39];
  const fadeOut = easeInOut(ramp(now, 487.4, 490.0));
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
    return (
      <Txt
        x={540}
        y={y}
        size={size}
        font={FONT.display}
        color={color}
        scale={(1.3 - 0.3 * p) * (1 + beatPulse(now) * 0.02)}
        rot={rot + (1 - Math.min(1, p)) * -6}
      >
        {text}
      </Txt>
    );
  };
  const into = easeIn(ramp(now, B[0] + 0.2, B[1] + 0.4));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - fadeOut }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const k = clamp01(into * 1.2 - i * 0.05);
          if (k >= 1) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 540 + (rand(i) - 0.5) * 300 * (1 - k),
                top: 1300 - k * 450 - i * 6,
                transform: `translate(-50%, -50%) scale(${0.55 * (1 - k * 0.8)}) rotate(${(i - 2) * 4 + k * 30}deg)`,
                opacity: 1 - k * 0.3,
              }}
            >
              <Polaroid w={380} photo={PRINTS[i].photo} date={PRINTS[i].date}>
                {PRINTS[i].scene}
              </Polaroid>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${1 + beatPulse(now) * 0.03})`,
            transformOrigin: "540px 760px",
          }}
        >
          <Ico
            name="floppy"
            px={20}
            x={540}
            y={760}
            at={B[0] - 0.3}
            now={now}
          />
        </div>
        {now > B[1] + 0.5 ? (
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 1000,
              transform: `translate(-50%, -50%) scale(${popAt(now, B[1] + 0.5)})`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 34px",
              background: C.green,
              border: `${OUTLINE}px solid ${C.ink}`,
              borderRadius: 40,
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 44,
              color: C.white,
              direction: "rtl",
              boxShadow: "8px 8px 0 rgba(0,0,0,0.22)",
              whiteSpace: "nowrap",
            }}
          >
            ✓ הגיבוי הושלם
          </div>
        ) : null}
        {word("תגבו", B[2], 1190, 240)}
        {word("את", B[3], 1350, 130)}
        {word("התמונות.", B[4], 1500, 240)}
        {word("(באמת.)", B[6], 1665, 120, C.red, -5)}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#0b0907",
          opacity: easeIn(ramp(now, 488.6, 490.1)),
        }}
      />
    </>
  );
};
