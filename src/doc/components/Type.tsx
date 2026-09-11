import React from "react";
import { useCurrentFrame } from "remotion";
import { DOC, easeOut, ramp, SERIF, SERIF_LATIN } from "../theme";

type RiseProps = {
  readonly text: string;
  readonly delay?: number;
  readonly duration?: number;
  readonly fontSize?: number;
  readonly weight?: number;
  readonly color?: string;
  readonly latin?: boolean;
  readonly letterSpacing?: number;
  readonly style?: React.CSSProperties;
};

/**
 * One line of type rising out of the dark. Letter-by-letter reveals would
 * read as an explainer; a single soft rise keeps it filmic.
 */
export const Rise: React.FC<RiseProps> = ({
  text,
  delay = 0,
  duration = 24,
  fontSize = 64,
  weight = 400,
  color = DOC.text,
  latin = false,
  letterSpacing,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = easeOut(ramp(frame, delay, delay + duration));
  return (
    <div
      style={{
        fontFamily: latin ? SERIF_LATIN : SERIF,
        fontSize,
        fontWeight: weight,
        color,
        direction: latin ? "ltr" : "rtl",
        letterSpacing,
        opacity: t,
        transform: `translateY(${(1 - t) * 18}px)`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
