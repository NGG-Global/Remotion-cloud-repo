import { METRICS } from "../data/metrics";
import { Card, Word } from "../timeline";
import { FONT } from "../theme";
import { HeroFace, Layout, Mode } from "../data/script";

/**
 * Lays out a card's words in frame coordinates, before anything animates.
 *
 * Kinetic type lives on lines that are fitted to the measure: a hero word is
 * sized so its line fills the width, the running words are sized so the
 * longest plain line does. Widths come from the font files' own advance
 * widths (data/metrics.ts), so the layout is identical on every frame and
 * every machine, and nothing has to be measured in the DOM mid-render.
 */

export type Face = keyof typeof METRICS;

export const FACE_CSS: Record<Face, { family: string; weight: number }> = {
  display: { family: FONT.display, weight: 700 },
  sans800: { family: FONT.sans, weight: 800 },
  sans600: { family: FONT.sans, weight: 600 },
  serif700: { family: FONT.serif, weight: 700 },
};

/** Width of `text` in em for a face. Unknown glyphs count as an average. */
export const measure = (text: string, face: Face): number => {
  const table = METRICS[face] as Record<string, number>;
  let w = 0;
  for (const ch of text) w += table[ch] ?? 0.55;
  return w;
};

export type PlacedWord = Word & {
  readonly index: number;
  readonly face: Face;
  readonly size: number;
  /** Left edge and baseline-box top, in frame pixels. */
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export type Zone = {
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
};

export const MEASURE = 900;

/** Where the text block sits for each scene layout. */
export const textZone = (layout: Layout): Zone => {
  if (layout === "top") return { cx: 540, cy: 600, w: MEASURE, h: 600 };
  if (layout === "bottom") return { cx: 540, cy: 1250, w: MEASURE, h: 560 };
  return { cx: 540, cy: 940, w: MEASURE, h: 820 };
};

/** Where the illustration goes for each scene layout. */
export const artZone = (layout: Layout): Zone => {
  if (layout === "top") return { cx: 540, cy: 1250, w: 980, h: 640 };
  if (layout === "bottom") return { cx: 540, cy: 610, w: 980, h: 620 };
  return { cx: 540, cy: 960, w: 1080, h: 1920 };
};

type Line = { words: (Word & { index: number })[] };

const faceFor = (w: Word, mode: Mode, hero: HeroFace): Face => {
  if (w.kind === "hero") return hero === "serif" ? "serif700" : "display";
  if (mode === "quote" || mode === "note") return "serif700";
  if (mode === "type") return "sans600";
  return "sans800";
};

/** Line height as a multiple of font size, per face. */
const LEADING: Record<Face, number> = {
  display: 0.86,
  sans800: 1.12,
  sans600: 1.18,
  serif700: 1.14,
};

/**
 * Baseline position inside a word's line box, as a multiple of font size:
 * half-leading plus the face's ascent (hhea), so mixed faces on one line
 * share a baseline rather than a box edge.
 */
const ASCENT: Record<Face, number> = {
  display: 0.859,
  sans800: 0.935,
  sans600: 0.935,
  serif700: 0.957,
};
const DESCENT: Record<Face, number> = {
  display: 0.153,
  sans800: 0.25,
  sans600: 0.25,
  serif700: 0.334,
};
const baseline = (face: Face): number =>
  (LEADING[face] - ASCENT[face] - DESCENT[face]) / 2 + ASCENT[face];

const SPACE = 0.26;

export type CardLayout = {
  readonly words: readonly PlacedWord[];
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
};

export const layoutCard = (
  card: Card,
  zone: Zone,
  align: "center" | "right" = "center",
): CardLayout => {
  const lines: Line[] = [];
  card.words.forEach((w, index) => {
    (lines[w.line] ??= { words: [] }).words.push({ ...w, index });
  });

  const plainCap = card.mode === "note" ? 72 : card.mode === "type" ? 104 : 124;
  const heroCap = card.mode === "type" ? 240 : 420;

  // Plain size: the longest plain-only line fits the measure.
  let plain = plainCap;
  for (const line of lines) {
    if (line.words.some((w) => w.kind === "hero")) continue;
    const em = line.words.reduce(
      (a, w, i) =>
        a + measure(w.text, faceFor(w, card.mode, card.hero)) + (i ? SPACE : 0),
      0,
    );
    plain = Math.min(plain, zone.w / em);
  }
  plain = Math.max(plain, 54);

  type Sized = {
    line: Line;
    sizes: number[];
    width: number;
    height: number;
    base: number;
  };
  const sized: Sized[] = lines.map((line) => {
    const allHero = line.words.every((w) => w.kind === "hero");
    const faces = line.words.map((w) => faceFor(w, card.mode, card.hero));
    const em = line.words.map((w, i) => measure(w.text, faces[i]));
    let sizes: number[];
    if (allHero) {
      const total =
        em.reduce((a, b) => a + b, 0) + SPACE * 0.92 * (em.length - 1);
      const s = Math.min(heroCap, zone.w / total);
      sizes = em.map(() => s);
    } else {
      // Mixed line: hero words at up to 2.3x the running size.
      sizes = line.words.map((w) => (w.kind === "hero" ? plain * 2.3 : plain));
      const width = em.reduce(
        (a, e, i) => a + e * sizes[i] + (i ? SPACE * plain : 0),
        0,
      );
      if (width > zone.w) {
        const k = zone.w / width;
        sizes = sizes.map((s) => s * k);
      }
    }
    const space = (i: number) =>
      i === 0
        ? 0
        : allHero
          ? SPACE * 0.92 * sizes[i]
          : SPACE * Math.min(...sizes);
    const width = em.reduce((a, e, i) => a + e * sizes[i] + space(i), 0);
    const base = Math.max(...sizes.map((s, i) => s * baseline(faces[i])));
    const below = Math.max(
      ...sizes.map((s, i) => s * (LEADING[faces[i]] - baseline(faces[i]))),
    );
    return { line, sizes, width, height: base + below, base };
  });

  // Fit the block into the zone height.
  const gap = plain * 0.08;
  const total =
    sized.reduce((a, l) => a + l.height, 0) + gap * (sized.length - 1);
  const k = Math.min(1, zone.h / total);

  const placed: PlacedWord[] = [];
  let y = zone.cy - (total * k) / 2;
  let left = Infinity;
  let right = -Infinity;
  for (const { line, sizes, width, height, base } of sized) {
    const lineW = width * k;
    const lineH = height * k;
    const lineBase = y + base * k;
    // Hebrew reads from the right: the first word takes the right edge.
    let x = align === "right" ? zone.cx + zone.w / 2 : zone.cx + lineW / 2;
    left = Math.min(left, x - lineW);
    right = Math.max(right, x);
    line.words.forEach((w, i) => {
      const face = faceFor(w, card.mode, card.hero);
      const size = sizes[i] * k;
      const ww = measure(w.text, face) * size;
      const allHero = line.words.every((v) => v.kind === "hero");
      if (i > 0)
        x -= allHero ? SPACE * 0.92 * size : SPACE * Math.min(...sizes) * k;
      const h = size * LEADING[face];
      placed.push({
        ...w,
        face,
        size,
        x: x - ww,
        // Words of different faces and sizes share the line's baseline.
        y: lineBase - baseline(face) * size,
        w: ww,
        h,
      });
      x -= ww;
    });
    y += lineH + gap * k;
  }
  placed.sort((a, b) => a.index - b.index);
  return {
    words: placed,
    top: zone.cy - (total * k) / 2,
    bottom: zone.cy + (total * k) / 2,
    left,
    right,
  };
};
