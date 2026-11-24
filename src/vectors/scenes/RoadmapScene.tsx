import React from "react";
import { useScene } from "../clock";
import { Stage } from "../components/Stage";
import { pop, ramp } from "../motion";
import { C, DISPLAY, EMOJI, PALETTE } from "../theme";

export type RoadmapItem = {
  readonly emoji: string;
  readonly label: string;
  /** Scene-local second the narration reaches this item. */
  readonly at: number;
};

/**
 * The plan for the episode as a trail of stops. Each stop pops in when the
 * narration names it, and a marker walks down the trail behind the voice.
 */
export const RoadmapScene: React.FC<{
  readonly title: string;
  readonly items: readonly RoadmapItem[];
}> = ({ title, items }) => {
  const { t, fps } = useScene();
  const rowH = 132;
  const top = 150;
  const reached = items.filter((it) => t >= it.at).length;
  const markerIdx = Math.max(0, reached - 1);
  const cur = items[markerIdx];
  const slide = markerIdx === 0 ? 1 : ramp(t, cur.at, cur.at + 0.35);
  const markerY =
    top +
    (Math.max(0, markerIdx - 1) + (markerIdx === 0 ? 0 : slide)) * rowH +
    rowH / 2;
  const titleIn = ramp(t, 0, 0.4);

  return (
    <Stage>
      <div
        style={{
          position: "absolute",
          top: 30,
          width: "100%",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 70,
          color: C.text,
          opacity: titleIn,
        }}
      >
        {title}
      </div>
      {/* trail */}
      <div
        style={{
          position: "absolute",
          right: 168,
          top: top + rowH / 2,
          width: 8,
          height: (items.length - 1) * rowH,
          borderRadius: 4,
          background: "rgba(255,255,255,0.12)",
        }}
      />
      {reached > 0 ? (
        <div
          style={{
            position: "absolute",
            right: 150,
            top: markerY - 22,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: C.yellow,
            boxShadow: `0 0 30px ${C.yellow}`,
          }}
        />
      ) : null}
      {items.map((item, i) => {
        const p = pop(t, item.at, fps, 12);
        const active = i === markerIdx && reached > 0;
        const done = i < markerIdx;
        const color = PALETTE[i % PALETTE.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 220,
              left: 50,
              top: top + i * rowH + 12,
              height: rowH - 24,
              display: "flex",
              direction: "rtl",
              alignItems: "center",
              gap: 26,
              opacity: p > 0 ? Math.min(1, p * 1.2) * (done ? 0.55 : 1) : 0,
              transform: `translateX(${(1 - p) * -60}px) scale(${active ? 1.04 : 1})`,
              transformOrigin: "right center",
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 28,
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: EMOJI,
                fontSize: 58,
                flexShrink: 0,
              }}
            >
              {item.emoji}
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: active ? 700 : 500,
                fontSize: 50,
                color: active ? C.text : C.textMuted,
                lineHeight: 1.1,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
      {/* row numbers on the trail */}
      {items.map((item, i) => (
        <div
          key={`n${i}`}
          style={{
            position: "absolute",
            right: 150,
            top: top + i * rowH + rowH / 2 - 22,
            width: 44,
            height: 44,
            borderRadius: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 26,
            color: i === markerIdx && reached > 0 ? C.ink : C.textMuted,
            background:
              i === markerIdx && reached > 0 ? "transparent" : C.bgLift,
            border:
              i === markerIdx && reached > 0
                ? "none"
                : `3px solid rgba(255,255,255,0.15)`,
            opacity: t >= item.at ? 1 : 0.4,
          }}
        >
          {i + 1}
        </div>
      ))}
    </Stage>
  );
};
