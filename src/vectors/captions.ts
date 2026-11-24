/**
 * Word timings -> caption pages.
 *
 * A page is what sits on screen at once: a short run of words that ends at a
 * sentence boundary, a breath, or a length limit, whichever comes first. Pages
 * are built once from the transcript, then looked up per frame.
 */

export type Word = {
  readonly text: string;
  /** Seconds on the (slowed) narration track. */
  readonly start: number;
  readonly end: number;
};

export type CaptionPage = {
  readonly words: readonly Word[];
  readonly start: number;
  readonly end: number;
};

const MAX_CHARS = 30;
const MAX_WORDS = 6;
const BREATH = 0.35;

const endsClause = (text: string): boolean => /[.!?;:,]$/.test(text);
const endsSentence = (text: string): boolean => /[.!?]$/.test(text);

export const buildPages = (words: readonly Word[]): CaptionPage[] => {
  const pages: CaptionPage[] = [];
  let current: Word[] = [];
  let chars = 0;

  const flush = () => {
    if (current.length === 0) return;
    pages.push({
      words: current,
      start: current[0].start,
      end: current[current.length - 1].end,
    });
    current = [];
    chars = 0;
  };

  words.forEach((word, i) => {
    const next = words[i + 1];
    const wouldBe = chars + word.text.length + (current.length ? 1 : 0);
    if (current.length > 0 && wouldBe > MAX_CHARS) flush();
    current.push(word);
    chars += word.text.length + (current.length > 1 ? 1 : 0);

    const gap = next ? next.start - word.end : Infinity;
    const clauseBreak = endsClause(word.text) && current.length >= 3;
    if (
      endsSentence(word.text) ||
      clauseBreak ||
      gap > BREATH ||
      current.length >= MAX_WORDS
    ) {
      flush();
    }
  });
  flush();

  // Hold each page until the next one starts (or briefly past its last word),
  // so the caption never blinks off between two words of one thought.
  return pages.map((page, i) => {
    const next = pages[i + 1];
    const hold = next ? Math.min(next.start, page.end + 0.6) : page.end + 0.6;
    return { ...page, end: Math.max(page.end, hold) };
  });
};

/** Binary search for the page on screen at `t`, or null between pages. */
export const pageAt = (
  pages: readonly CaptionPage[],
  t: number,
): CaptionPage | null => {
  let lo = 0;
  let hi = pages.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const page = pages[mid];
    if (t < page.start) hi = mid - 1;
    else if (t >= page.end) lo = mid + 1;
    else return page;
  }
  return null;
};
