import React from "react";
import { Headline } from "./Headline";
import { R, SIZE } from "../theme";

type CaptionProps = {
  readonly text: string;
  readonly at: number;
  readonly mark?: readonly string[];
  readonly size?: number;
  readonly color?: string;
  readonly y?: number;
};

/** A headline pinned near the bottom of the frame, under the main visual. */
export const Caption: React.FC<CaptionProps> = ({
  text,
  at,
  mark,
  size = SIZE.subheading,
  color = R.ink,
  y = 1440,
}) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: 72,
      right: 72,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Headline
      text={text}
      at={at}
      size={size}
      mark={mark}
      color={color}
      maxWidth={936}
    />
  </div>
);
