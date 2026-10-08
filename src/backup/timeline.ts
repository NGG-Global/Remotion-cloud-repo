import { TIMING } from "./data/timing";
import {
  CardDef,
  HeroFace,
  Layout,
  Mode,
  SCENES,
  SceneDef,
  Tone,
} from "./data/script";
import { AUDIO_SECONDS } from "./theme";

/**
 * The script and the measured word timings, joined into what the renderer
 * reads: every word with its start, every card with the window it is on
 * screen, every scene with the stretch of the voice it covers.
 */

export type WordKind = "plain" | "hi" | "hero";

export type Word = {
  readonly text: string;
  readonly kind: WordKind;
  readonly line: number;
  readonly s: number;
  readonly e: number;
};

export type Card = {
  readonly id: string;
  readonly mode: Mode;
  readonly hero: HeroFace;
  readonly words: readonly Word[];
  readonly lineCount: number;
  /** First word starts. */
  readonly start: number;
  /** Last word ends. */
  readonly end: number;
  /** On screen from `show` until `hide`, then exits. */
  readonly show: number;
  readonly hide: number;
  readonly scene: string;
};

export type Scene = {
  readonly id: string;
  readonly chapter: number;
  readonly tone: Tone;
  readonly layout: Layout;
  readonly art?: string;
  readonly cards: readonly Card[];
  readonly start: number;
  readonly end: number;
  /** Start of the card's word `i` (default: its first word). */
  readonly t: (cardId: string, i?: number) => number;
  /** End of the card's word `i` (default: its last word). */
  readonly te: (cardId: string, i?: number) => number;
  readonly card: (cardId: string) => Card;
};

/** Words show a touch before they are heard; the eye reads ahead. */
export const LEAD = 0.06;
/** A card arrives this long before its first word. */
const CARD_LEAD = 0.18;
/** Time a card takes to leave. */
export const EXIT = 0.24;

const parseWords = (def: CardDef): Omit<Word, "s" | "e">[] => {
  const out: Omit<Word, "s" | "e">[] = [];
  let line = 0;
  let hi = false;
  let hero = false;
  for (const raw of def.text.split(/\s+/)) {
    if (!raw) continue;
    if (raw === "/") {
      line++;
      continue;
    }
    // A marker opens at the start of a token and closes anywhere after it,
    // so trailing punctuation such as a closing quote may follow it.
    let text = raw;
    const openHi = text.startsWith("*");
    if (openHi) {
      hi = true;
      text = text.slice(1);
    }
    const openHero = text.startsWith("^");
    if (openHero) {
      hero = true;
      text = text.slice(1);
    }
    const closeHi = text.includes("*");
    const closeHero = text.includes("^");
    text = text.replace(/[*^]/g, "");
    out.push({ text, kind: hero ? "hero" : hi ? "hi" : "plain", line });
    if (closeHi) hi = false;
    if (closeHero) hero = false;
  }
  return out;
};

const buildScene = (def: SceneDef): Omit<Scene, "end"> & { end: number } => {
  const cards: Card[] = def.cards.map((c) => {
    const parsed = parseWords(c);
    const times = TIMING[c.id];
    if (!times || times.length !== parsed.length) {
      throw new Error(
        `Card "${c.id}" has ${parsed.length} words but ${times?.length ?? 0} timings. Re-run tools/backup-align.py.`,
      );
    }
    const words = parsed.map((w, i) => ({
      ...w,
      s: times[i][0],
      e: times[i][1],
    }));
    return {
      id: c.id,
      mode: c.mode ?? def.mode ?? "stack",
      hero: c.hero ?? "display",
      words,
      lineCount: parsed.length ? parsed[parsed.length - 1].line + 1 : 0,
      start: words[0].s,
      end: words[words.length - 1].e,
      show: words[0].s - CARD_LEAD,
      hide: 0,
      scene: def.id,
    };
  });
  const start = def.from ?? (cards.length ? cards[0].show - 0.12 : 0);
  return {
    id: def.id,
    chapter: def.chapter,
    tone: def.tone,
    layout: def.layout,
    art: def.art,
    cards,
    start,
    end: def.to ?? start,
    t: () => 0,
    te: () => 0,
    card: () => cards[0],
  };
};

const build = (): Scene[] => {
  const raw = SCENES.map(buildScene);
  const scenes: Scene[] = raw.map((s, i) => {
    const next = raw[i + 1];
    const end = next ? next.start : AUDIO_SECONDS;
    const cards = s.cards.map((c, j) => {
      const nextCard = s.cards[j + 1];
      // A card holds until the next one arrives, and is gone before its
      // first word lands, even when the voice runs straight on.
      const hide = nextCard ? nextCard.show : end;
      return { ...c, hide };
    });
    const byId = new Map(cards.map((c) => [c.id, c]));
    const card = (id: string): Card => {
      const found = byId.get(id);
      if (!found) throw new Error(`Scene "${s.id}" has no card "${id}"`);
      return found;
    };
    return {
      ...s,
      cards,
      end,
      card,
      t: (id, i = 0) => card(id).words[i].s,
      te: (id, i) => {
        const ws = card(id).words;
        return ws[i ?? ws.length - 1].e;
      },
    };
  });
  return scenes;
};

export const TIMELINE: readonly Scene[] = build();

export const sceneAt = (t: number): number => {
  let idx = 0;
  for (let i = 0; i < TIMELINE.length; i++) {
    if (TIMELINE[i].start <= t) idx = i;
  }
  return idx;
};
