import React from "react";
import { useCurrentFrame } from "remotion";
import { letterStyle, TT } from "../theme";

type StampProps = {
  readonly text: string;
  readonly size: number;
  /** Local frame on which the word lands. */
  readonly at: number;
  /** Local frame on which it leaves; omit to hold to the end of the sequence. */
  readonly until?: number;
  /** Alternate the lean, as the game's count-in does from numeral to numeral. */
  readonly lean?: -1 | 0 | 1;
  readonly fill?: string;
  readonly stroke?: string;
  readonly align?: "left" | "center" | "right";
  readonly style?: React.CSSProperties;
};

const easeOut = (t: number): number =>
  1 - (1 - Math.max(0, Math.min(1, t))) ** 3;

/**
 * A word struck onto the frame the way the game strikes its "3, 2, 1, Go!": dropped in
 * oversized, stamped to size inside five frames, leaning a little, settled by the next
 * beat. One motion for every word in the trailer, so type reads as punctuation.
 */
export const Stamp: React.FC<StampProps> = ({
  text,
  size,
  at,
  until,
  lean = 0,
  fill = TT.cream,
  stroke = TT.inkDeep,
  align = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  const age = frame - at;
  if (age < 0) return null;
  if (until !== undefined && frame >= until) return null;

  const land = easeOut(age / 5);
  const settle =
    age > 5 ? Math.exp(-(age - 5) / 6) * Math.sin((age - 5) * 1.3) : 0;
  const scale = 1 + 0.34 * (1 - land) ** 2 - settle * 0.025;
  const squashY =
    age >= 4 && age < 10 ? 1 - Math.sin(((age - 4) / 6) * Math.PI) * 0.05 : 1;
  const angle = lean * (2.4 * (1 - land) + 1.1 + settle * 0.6);
  const leaving =
    until !== undefined ? Math.max(0, 1 - (until - frame) / 4) : 0;

  return (
    <div
      style={{
        ...letterStyle(size, fill, stroke),
        textAlign: align,
        whiteSpace: "pre-line",
        opacity: Math.min(1, age / 2 + 0.4) * (1 - leaving),
        transform: `rotate(${angle}deg) scale(${scale * (1 - leaving * 0.08)}, ${scale * squashY * (1 - leaving * 0.08)})`,
        transformOrigin:
          align === "left"
            ? "left center"
            : align === "right"
              ? "right center"
              : "center",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
