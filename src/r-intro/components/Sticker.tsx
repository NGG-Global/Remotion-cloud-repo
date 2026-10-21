import React from "react";
import { DISPLAY, HEBREW } from "../fonts";
import { R } from "../theme";
import { Bidi } from "./bidi";
import { Pop } from "./Pop";

type StickerProps = {
  readonly text: string;
  readonly at?: number;
  readonly until?: number;
  readonly color?: string;
  readonly textColor?: string;
  readonly size?: number;
  readonly tilt?: number;
  readonly latin?: boolean;
  readonly style?: React.CSSProperties;
  readonly from?: "below" | "above" | "left" | "right" | "scale";
};

/** A rounded label with a thick white border, the video's "sticker". */
export const Sticker: React.FC<StickerProps> = ({
  text,
  at = 0,
  until,
  color = R.yellow,
  textColor = R.ink,
  size = 44,
  tilt = -3,
  latin = false,
  style,
  from = "scale",
}) => (
  <Pop at={at} until={until} tilt={tilt} from={from} style={style}>
    <div
      style={{
        display: "inline-block",
        padding: `${size * 0.3}px ${size * 0.7}px`,
        background: color,
        color: textColor,
        borderRadius: size * 0.9,
        fontFamily: latin ? DISPLAY : HEBREW,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1.1,
        boxShadow: `0 0 0 ${Math.max(5, size * 0.14)}px ${R.white}, 0 14px 30px ${R.ink}2e`,
        whiteSpace: "nowrap",
        direction: latin ? "ltr" : "rtl",
      }}
    >
      {latin ? text : <Bidi text={text} />}
    </div>
  </Pop>
);
