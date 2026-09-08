import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KineticText } from "../components/KineticText";
import { Stage } from "../components/Stage";
import { fontFamily } from "../fonts";
import { COLORS, FONT_SIZE, seconds } from "../theme";

export type Card = {
  readonly title: string;
  readonly note?: string;
  /** Simple line glyph drawn at the top of the card. */
  readonly glyph?: "doc" | "table" | "deck" | "chat" | "folder" | "wand";
};

type CardsSceneProps = {
  readonly heading?: string;
  readonly cards: readonly Card[];
  readonly stagger?: number;
  readonly startAt?: number;
};

/** Line glyphs, drawn rather than imported so they inherit the accent colour. */
const Glyph: React.FC<{
  readonly kind: Card["glyph"];
  readonly size: number;
}> = ({ kind, size }) => {
  const stroke = COLORS.accent;
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      {kind === "doc" ? (
        <>
          <path d="M8 3h11l6 6v20H8z" {...common} />
          <path d="M19 3v6h6" {...common} />
          <path d="M12 16h9M12 21h9M12 11h4" {...common} />
        </>
      ) : null}
      {kind === "table" ? (
        <>
          <rect x="4" y="6" width="24" height="20" rx="2" {...common} />
          <path d="M4 13h24M4 20h24M13 6v20M21 6v20" {...common} />
        </>
      ) : null}
      {kind === "deck" ? (
        <>
          <rect x="4" y="6" width="24" height="16" rx="2" {...common} />
          <path d="M16 22v5M11 27h10" {...common} />
        </>
      ) : null}
      {kind === "chat" ? (
        <path
          d="M27 17c0 5-5 8-11 8l-6 3 1-5c-2-1.5-4-4-4-6 0-5 5-9 10-9s10 4 10 9z"
          {...common}
        />
      ) : null}
      {kind === "folder" ? <path d="M4 9h9l3 3h12v15H4z" {...common} /> : null}
      {kind === "wand" ? (
        <>
          <path d="M9 27L24 12" {...common} />
          <path d="M20 5v6M17 8h6M25 19v5M22.5 21.5h5" {...common} />
        </>
      ) : null}
    </svg>
  );
};

const CardBlock: React.FC<{ readonly card: Card; readonly delay: number }> = ({
  card,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        flex: 1,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [54, 0])}px) scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
        backgroundColor: COLORS.surface,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 26,
        padding: "44px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        minHeight: 250,
      }}
    >
      {card.glyph ? <Glyph kind={card.glyph} size={46} /> : null}

      <div
        style={{
          fontFamily,
          fontSize: FONT_SIZE.subheading * 0.78,
          fontWeight: 700,
          lineHeight: 1.2,
          color: COLORS.text,
        }}
      >
        {card.title}
      </div>

      {card.note ? (
        <div
          style={{
            fontFamily,
            fontSize: FONT_SIZE.caption * 1.15,
            fontWeight: 400,
            lineHeight: 1.4,
            color: COLORS.textMuted,
          }}
        >
          {card.note}
        </div>
      ) : null}
    </div>
  );
};

/**
 * A row of cards that deal themselves in.
 *
 * Used where the narration lists distinct kinds of output, which read better
 * as parallel objects than as another bulleted list.
 */
export const CardsScene: React.FC<CardsSceneProps> = ({
  heading,
  cards,
  stagger = 9,
  startAt,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const exit = interpolate(
    frame,
    [durationInFrames - seconds(0.35), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const first = startAt ?? (heading ? seconds(0.75) : seconds(0.2));

  return (
    <Stage glow={0.6}>
      <AbsoluteFill
        style={{
          opacity: exit,
          direction: "rtl",
          justifyContent: "center",
          padding: "0 150px",
        }}
      >
        {heading ? (
          <div style={{ marginBottom: 60 }}>
            <KineticText
              text={heading}
              fontSize={FONT_SIZE.subheading}
              fontWeight={800}
              maxWidth={1500}
              stagger={2}
            />
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 34, alignItems: "stretch" }}>
          {cards.map((card, index) => (
            <CardBlock
              key={`${card.title}-${index}`}
              card={card}
              delay={first + index * stagger}
            />
          ))}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
