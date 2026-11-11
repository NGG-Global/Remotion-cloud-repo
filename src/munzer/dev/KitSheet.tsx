import React from "react";
import { AbsoluteFill } from "remotion";
import "../fonts";
import {
  Backdrop,
  BodyMap,
  Draw,
  HeartPlate,
  KIDNEY,
  KIDNEY_HILUM,
  LiverPlate,
  LUNG_L,
  LUNG_R,
  TRACHEA,
  Txt,
} from "../anim/kit";
import { INK } from "../theme";

/** Development sheet: every drawn plate at once, for checking the line work. */
export const KitSheet: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <svg viewBox="0 0 400 440" width={380} height={418} style={{ position: "absolute", left: 40, top: 60 }}>
      <HeartPlate k={1} fillK={1} />
    </svg>
    <svg viewBox="0 0 620 360" width={560} height={325} style={{ position: "absolute", left: 420, top: 90 }}>
      <LiverPlate k={1} fillK={1} />
    </svg>
    <svg viewBox="0 0 480 320" width={420} height={280} style={{ position: "absolute", left: 40, top: 600 }}>
      <Draw d={KIDNEY} k={1} fill="rgba(127,184,179,0.1)" fillK={1} width={4} />
      <Draw d={KIDNEY_HILUM} k={1} width={3} />
    </svg>
    <svg viewBox="0 0 440 360" width={440} height={360} style={{ position: "absolute", left: 500, top: 560 }}>
      <Draw d={LUNG_L} k={1} fill="rgba(127,184,179,0.1)" fillK={1} width={4} />
      <Draw d={LUNG_R} k={1} fill="rgba(127,184,179,0.1)" fillK={1} width={4} />
      <Draw d={TRACHEA} k={1} width={4} />
    </svg>
    <BodyMap
      k={1}
      x={1300}
      y={60}
      scale={1.05}
      state={{ heart: [1, 1], liver: [1, 0.6], kidneys: [1, 0], lungs: [1, 0], gut: [1, 0] }}
    />
    <Txt k={1} x={1000} y={980} size={40} color={INK.textDim}>הלב שלו שוקל 636 גרם</Txt>
  </AbsoluteFill>
);
