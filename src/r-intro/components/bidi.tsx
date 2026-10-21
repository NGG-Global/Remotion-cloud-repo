import React from "react";

const HEBREW = /[֐-׿]/;

/** True when a word has no Hebrew letters: Latin, digits, code, punctuation. */
export const isLatin = (word: string): boolean => !HEBREW.test(word);

/**
 * Groups a Hebrew sentence into units for RTL layout: each Hebrew word on its
 * own, and each run of consecutive Latin words joined into one unit. Laid out
 * as a unit with `direction: ltr`, "Source Editor" keeps its word order and
 * "c()" keeps its brackets on the right, which the bidi algorithm would
 * otherwise flip at the edge of an RTL line.
 */
export const bidiUnits = (
  text: string,
): { readonly text: string; readonly latin: boolean }[] => {
  const units: { text: string; latin: boolean }[] = [];
  for (const word of text.split(" ")) {
    if (!word) continue;
    const latin = isLatin(word);
    const last = units[units.length - 1];
    if (latin && last?.latin) last.text += ` ${word}`;
    else units.push({ text: word, latin });
  }
  return units;
};

/** Inline text with Latin runs isolated, for stickers and labels. */
export const Bidi: React.FC<{ readonly text: string }> = ({ text }) => (
  <>
    {bidiUnits(text).map((unit, i) => (
      <React.Fragment key={i}>
        {i > 0 ? " " : null}
        {unit.latin ? (
          <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
            {unit.text}
          </span>
        ) : (
          unit.text
        )}
      </React.Fragment>
    ))}
  </>
);
