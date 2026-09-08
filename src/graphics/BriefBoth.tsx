import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon } from "./LineIcon";

type BriefBothProps = {
  readonly width: number;
  readonly height: number;
  /** Short lines standing in for whatever the briefing contains. */
  readonly briefLines: readonly string[];
  /** Frame at which the copy reaches the colleague. */
  readonly toColleagueAt: number;
  /** Frame at which the copy reaches Claude. */
  readonly toClaudeAt: number;
};

/**
 * The same briefing, delivered twice.
 *
 * The rule of thumb is an equivalence, so the animation is built to be
 * symmetrical: one card, two identical journeys, two identical arrivals. Any
 * difference in how the two sides are drawn would undercut the claim that the
 * test is the same on both.
 */
export const BriefBoth: React.FC<BriefBothProps> = ({
  width,
  height,
  briefLines,
  toColleagueAt,
  toClaudeAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD = { width: Math.min(450, width * 0.26), height: height * 0.3 };
  const cy = height * 0.4;
  const centreX = width * 0.5;
  const colleagueX = width * 0.81;
  const claudeX = width * 0.19;
  const nodeR = Math.min(74, height * 0.1);

  const ease = Easing.bezier(0.4, 0, 0.25, 1);
  const TRAVEL = 30;

  /** Position of a copy on its way out, 0 at the centre and 1 on arrival. */
  const travel = (arriveAt: number) =>
    interpolate(frame, [arriveAt - TRAVEL, arriveAt], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    });

  const toColleague = travel(toColleagueAt);
  const toClaude = travel(toClaudeAt);

  const card = spring({ frame, fps, config: { damping: 90, stiffness: 120 } });

  return (
    <div style={{ position: "relative", width, height }}>
      {/* The original, which stays put. */}
      <BriefCard
        left={centreX - CARD.width / 2}
        top={cy - CARD.height / 2}
        size={CARD}
        lines={briefLines}
        frame={frame}
        appearAt={0}
        opacity={card}
        scale={0.94 + card * 0.06}
      />

      {/* Two copies leaving, one each way. */}
      {toColleague > 0 ? (
        <BriefCard
          left={interpolate(
            toColleague,
            [0, 1],
            [centreX - CARD.width / 2, colleagueX - CARD.width / 2],
          )}
          top={cy - CARD.height / 2 - Math.sin(toColleague * Math.PI) * 40}
          size={CARD}
          lines={briefLines}
          frame={frame}
          appearAt={0}
          opacity={1 - Math.max(0, (toColleague - 0.82) / 0.18)}
          scale={1 - toColleague * 0.42}
        />
      ) : null}
      {toClaude > 0 ? (
        <BriefCard
          left={interpolate(
            toClaude,
            [0, 1],
            [centreX - CARD.width / 2, claudeX - CARD.width / 2],
          )}
          top={cy - CARD.height / 2 - Math.sin(toClaude * Math.PI) * 40}
          size={CARD}
          lines={briefLines}
          frame={frame}
          appearAt={0}
          opacity={1 - Math.max(0, (toClaude - 0.82) / 0.18)}
          scale={1 - toClaude * 0.42}
        />
      ) : null}

      <Recipient
        cx={colleagueX}
        cy={cy + CARD.height / 2 + nodeR + 24}
        r={nodeR}
        label="עמית שנכנס לפרויקט"
        received={toColleague}
        frame={frame}
        fps={fps}
        arriveAt={toColleagueAt}
      >
        <LineIcon
          name="person"
          size={nodeR * 1.05}
          delay={Math.max(0, toColleagueAt - 40)}
          color={COLORS.background}
          drawFrames={22}
        />
      </Recipient>

      <Recipient
        cx={claudeX}
        cy={cy + CARD.height / 2 + nodeR + 24}
        r={nodeR}
        label="קלוד"
        received={toClaude}
        frame={frame}
        fps={fps}
        arriveAt={toClaudeAt}
      >
        <span
          style={{
            fontFamily,
            fontSize: nodeR * 0.78,
            fontWeight: 800,
            color: COLORS.background,
          }}
        >
          ✻
        </span>
      </Recipient>
    </div>
  );
};

const BriefCard: React.FC<{
  readonly left: number;
  readonly top: number;
  readonly size: { width: number; height: number };
  readonly lines: readonly string[];
  readonly frame: number;
  readonly appearAt: number;
  readonly opacity: number;
  readonly scale: number;
}> = ({ left, top, size, lines, frame, appearAt, opacity, scale }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: size.width,
      height: size.height,
      borderRadius: 18,
      background: COLORS.labelBg,
      padding: "24px 26px",
      boxSizing: "border-box",
      direction: "rtl",
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "center",
      boxShadow: "0 18px 44px rgba(0,0,0,0.4)",
    }}
  >
    <div
      style={{
        fontFamily,
        fontSize: 27,
        fontWeight: 800,
        letterSpacing: "0.06em",
        color: COLORS.accent,
        marginBottom: 18,
      }}
    >
      בריף
    </div>
    {lines.map((line, i) => {
      const show = interpolate(
        frame - (appearAt + 10 + i * 11),
        [0, 12],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );
      if (show <= 0) {
        return null;
      }
      return (
        <div
          key={i}
          style={{
            fontFamily,
            fontSize: 30,
            fontWeight: 600,
            lineHeight: 1.5,
            color: "#3a332c",
            opacity: show,
          }}
        >
          {line}
        </div>
      );
    })}
  </div>
);

const Recipient: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly label: string;
  readonly received: number;
  readonly frame: number;
  readonly fps: number;
  readonly arriveAt: number;
  readonly children: React.ReactNode;
}> = ({ cx, cy, r, label, received, frame, fps, arriveAt, children }) => {
  const pop = spring({
    frame: frame - (arriveAt - 46),
    fps,
    config: { damping: 90 },
  });
  if (frame < arriveAt - 50) {
    return null;
  }
  const lit = interpolate(received, [0.85, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: COLORS.accentSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: pop,
          transform: `scale(${(0.72 + pop * 0.28) * (1 + lit * 0.06)})`,
          boxShadow:
            lit > 0 ? `0 0 ${46 * lit}px rgba(217,119,87,0.5)` : undefined,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          left: cx - 220,
          top: cy + r + 18,
          width: 440,
          textAlign: "center",
          direction: "rtl",
          fontFamily,
          fontSize: 30,
          fontWeight: 700,
          color: lit > 0.5 ? COLORS.text : COLORS.textMuted,
          opacity: pop,
        }}
      >
        {label}
      </div>
      {lit > 0.4 ? (
        <div
          style={{
            position: "absolute",
            left: cx + r - 16,
            top: cy - r - 4,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: COLORS.accent,
            color: COLORS.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            opacity: lit,
            transform: `scale(${0.6 + lit * 0.4})`,
          }}
        >
          ✓
        </div>
      ) : null}
    </>
  );
};
