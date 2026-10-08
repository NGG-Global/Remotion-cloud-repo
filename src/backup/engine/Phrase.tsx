import React, { useMemo } from "react";
import { Card, EXIT, LEAD } from "../timeline";
import { C, ToneColors, clamp01, easeIn, easeOut, pop, ramp } from "../theme";
import {
  CardLayout,
  FACE_CSS,
  PlacedWord,
  Zone,
  layoutCard,
  measure,
} from "./layout";
import { Bubble } from "./kit";

/**
 * One card of the voice-over, word by word, on the voice.
 *
 * Every word arrives at its own measured start. Running words rise into
 * place; hero words slam in from slightly larger, in the display face;
 * marked words get a highlighter swept under them in reading direction.
 */

const LINE_HEIGHT: Record<string, number> = {
  display: 0.86,
  sans800: 1.12,
  sans600: 1.18,
  serif700: 1.14,
};

type Props = {
  readonly card: Card;
  readonly zone: Zone;
  readonly tone: ToneColors;
  readonly now: number;
  readonly crt?: boolean;
};

export const Phrase: React.FC<Props> = ({ card, zone, tone, now, crt }) => {
  const layout = useMemo(
    () => layoutCard(card, zone, card.mode === "type" ? "right" : "center"),
    [card, zone],
  );
  if (now < card.show - 0.05 || now > card.hide + EXIT * 0.2) return null;

  const exit =
    card.mode === "type"
      ? now >= card.hide
        ? 1
        : 0
      : easeIn(ramp(now, card.hide - EXIT * 0.8, card.hide + EXIT * 0.2));
  if (exit >= 1) return null;

  // Alternate hero colours between hero runs inside one card.
  let heroRun = -1;
  let prevHero = false;
  const heroColour: number[] = layout.words.map((w) => {
    if (w.kind === "hero" && !prevHero) heroRun++;
    prevHero = w.kind === "hero";
    return heroRun;
  });

  return (
    <>
      {card.mode === "quote" ? (
        <QuoteBubble
          layout={layout}
          card={card}
          now={now}
          exit={exit}
          tone={tone}
        />
      ) : null}
      {layout.words.map((w, i) => (
        <PlacedWordView
          key={i}
          w={w}
          card={card}
          now={now}
          exit={exit}
          tone={tone}
          crt={!!crt}
          heroAlt={heroColour[i] % 2 === 1}
          lineCount={card.lineCount}
        />
      ))}
      {card.mode === "type" ? (
        <Cursor layout={layout} card={card} now={now} tone={tone} />
      ) : null}
    </>
  );
};

const typedChars = (w: PlacedWord, now: number): number => {
  const age = now - (w.s - LEAD);
  if (age <= 0) return 0;
  const span = Math.max(0.08, Math.min(0.32, w.e - w.s));
  return Math.min(
    [...w.text].length,
    Math.ceil(([...w.text].length * age) / span),
  );
};

const PlacedWordView: React.FC<{
  w: PlacedWord;
  card: Card;
  now: number;
  exit: number;
  tone: ToneColors;
  crt: boolean;
  heroAlt: boolean;
  lineCount: number;
}> = ({ w, card, now, exit, tone, crt, heroAlt, lineCount }) => {
  const age = now - (w.s - LEAD);
  if (age < 0) return null;
  const css = FACE_CSS[w.face];
  const inQuote = card.mode === "quote";
  const isHero = w.kind === "hero";

  let opacity = 1;
  let ty = 0;
  let scale = 1;
  let rot = 0;
  let text = w.text;

  if (card.mode === "type") {
    text = [...w.text].slice(0, typedChars(w, now)).join("");
  } else if (isHero) {
    const p = pop(age, 0.38, 0.42);
    opacity = clamp01(age / 0.05);
    scale = 1.22 - 0.22 * p;
    ty = (1 - Math.min(1, p)) * -w.size * 0.12;
    rot = (1 - p) * -4;
  } else {
    const p = pop(age, 0.34, 0.2);
    opacity = clamp01(age / 0.09);
    ty = (1 - p) * w.size * 0.42;
    scale = 0.9 + 0.1 * Math.min(1, p);
  }

  if (exit > 0) {
    const lag = (w.line / Math.max(1, lineCount)) * 0.35;
    const q = clamp01(exit * (1 + lag) - lag * 0.5);
    opacity *= 1 - q;
    ty -= q * w.size * 0.5;
  }

  const colour = inQuote
    ? isHero
      ? C.red
      : C.ink
    : isHero
      ? heroAlt
        ? tone.accent2
        : tone.accent
      : tone.ink;

  const led = isHero && card.hero === "led";
  const glow = crt
    ? `0 0 ${w.size * 0.12}px ${tone.ink}88, 0 0 ${w.size * 0.03}px ${tone.ink}`
    : undefined;

  return (
    <>
      {w.kind === "hi" ? (
        <Highlighter w={w} now={now} tone={tone} exit={exit} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: w.x - w.size * 0.3,
          top: w.y,
          width: w.w + w.size * 0.3,
          height: w.h,
          fontFamily: css.family,
          fontWeight: css.weight,
          fontSize: w.size,
          lineHeight: LINE_HEIGHT[w.face],
          color: colour,
          direction: "rtl",
          textAlign: "right",
          whiteSpace: "nowrap",
          opacity,
          transform: `translateY(${ty}px) scale(${scale}) rotate(${rot}deg)`,
          transformOrigin: "50% 70%",
          textShadow: glow,
          letterSpacing: w.face === "display" ? "0.005em" : undefined,
          WebkitMaskImage: led
            ? "radial-gradient(circle at 50% 50%, #000 0 58%, transparent 62%)"
            : undefined,
          WebkitMaskSize: led
            ? `${Math.max(8, w.size * 0.055)}px ${Math.max(8, w.size * 0.055)}px`
            : undefined,
        }}
      >
        {text}
      </div>
    </>
  );
};

const Highlighter: React.FC<{
  w: PlacedWord;
  now: number;
  tone: ToneColors;
  exit: number;
}> = ({ w, now, tone, exit }) => {
  const p = easeOut(ramp(now, w.s + 0.02, w.s + 0.3));
  if (p <= 0) return null;
  const pad = w.size * 0.1;
  const width = (w.w + pad * 2) * p;
  return (
    <div
      style={{
        position: "absolute",
        // Swept from the right, the way the word is read.
        left: w.x + w.w + pad - width,
        top: w.y + w.h * 0.4,
        width,
        height: w.h * 0.46,
        background: tone.hi,
        borderRadius: w.size * 0.08,
        transform: "skewX(-8deg) rotate(-1.2deg)",
        opacity: 1 - exit,
      }}
    />
  );
};

const Cursor: React.FC<{
  layout: CardLayout;
  card: Card;
  now: number;
  tone: ToneColors;
}> = ({ layout, card, now, tone }) => {
  if (now >= card.hide) return null;
  const words = layout.words;
  // The word being typed, or the last one typed.
  let current = words[0];
  for (const w of words) if (now >= w.s - LEAD) current = w;
  const typed = typedChars(current, now);
  const typedText = [...current.text].slice(0, typed).join("");
  const tw = measure(typedText, current.face) * current.size;
  const idle = now > current.e + 0.1 || now < words[0].s - LEAD;
  const blink = idle ? (Math.floor(now * 2.4) % 2 === 0 ? 1 : 0) : 1;
  const size = current.size;
  return (
    <div
      style={{
        position: "absolute",
        left: current.x + current.w - tw - size * 0.62,
        top: current.y + size * 0.2,
        width: size * 0.46,
        height: size * 0.86,
        background: tone.ink,
        opacity: blink,
        boxShadow: `0 0 ${size * 0.2}px ${tone.ink}88`,
      }}
    />
  );
};

const QuoteBubble: React.FC<{
  layout: CardLayout;
  card: Card;
  now: number;
  exit: number;
  tone: ToneColors;
}> = ({ layout, card, now, exit, tone }) => {
  const p = pop(now - card.show, 0.4, 0.3);
  if (p <= 0) return null;
  const padX = 70;
  const padY = 54;
  const x = layout.left - padX;
  const y = layout.top - padY;
  const w = layout.right - layout.left + padX * 2;
  const h = layout.bottom - layout.top + padY * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `scale(${0.6 + 0.4 * p})`,
        transformOrigin: "30% 100%",
        opacity: clamp01(p * 3) * (1 - exit),
      }}
    >
      <Bubble
        w={w}
        h={h}
        fill={C.white}
        stroke={tone.line === C.amber ? C.amber : C.ink}
        tail="bottom-left"
      />
    </div>
  );
};
