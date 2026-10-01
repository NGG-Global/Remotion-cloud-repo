import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, easeOut, useClock } from "../../clock";
import { BicepCurl } from "../../graphics/BicepCurl";
import { BugShoe } from "../../graphics/BugShoe";
import { HammerNail } from "../../graphics/HammerNail";
import { SawTimber } from "../../graphics/SawTimber";
import { ScissorsPaper } from "../../graphics/ScissorsPaper";
import { TomatoKnife } from "../../graphics/TomatoKnife";
import { WindowClean } from "../../graphics/WindowClean";
import { Landscape, FILL_SCALE } from "../Landscape";
import { Pop } from "../chrome";

export type Act =
  | "hammer"
  | "tomato"
  | "bug"
  | "window"
  | "saw"
  | "paper"
  | "curl";

type Framing = {
  readonly focusX: number;
  readonly focusY: number;
  /** Extra magnification over the full-bleed crop. */
  readonly zoom?: number;
  /** Where the judgement stamp lands, clear of the hero. */
  readonly popY?: number;
  readonly Graphic: React.FC<{ readonly hits: readonly number[] }>;
};

/**
 * Where each act's action sits on its 1920x1080 stage, so the vertical crop
 * frames the tool and the thing it hits rather than the empty bench beside
 * them. Checked against stills, not guessed from the drawing code.
 */
export const FRAMING: Record<Act, Framing> = {
  hammer: { focusX: 1060, focusY: 560, Graphic: HammerNail },
  tomato: { focusX: 930, focusY: 580, Graphic: TomatoKnife },
  bug: { focusX: 960, focusY: 600, Graphic: BugShoe },
  window: { focusX: 960, focusY: 500, Graphic: WindowClean },
  saw: { focusX: 880, focusY: 500, Graphic: SawTimber },
  paper: { focusX: 970, focusY: 500, Graphic: ScissorsPaper },
  curl: {
    focusX: 1040,
    focusY: 560,
    zoom: 0.02,
    popY: 300,
    Graphic: BicepCurl,
  },
};

type ActVProps = {
  readonly act: Act;
  readonly hits: readonly number[];
  /** Which hits get a judgement stamp. Defaults to the downbeats only. */
  readonly pops?: readonly number[] | false;
  /** Snap in from a tighter crop, the montage's cut-on-the-beat. */
  readonly punch?: number;
  /** Slow drift of the crop across the shot, in stage pixels. */
  readonly drift?: number;
  /** A little dutch angle, for the fast cuts. */
  readonly tilt?: number;
  readonly popY?: number;
};

export const ActV: React.FC<ActVProps> = ({
  act,
  hits,
  pops,
  punch = 0.08,
  drift = 40,
  tilt = 0,
  popY,
}) => {
  const { time, durationInFrames, fps } = useClock();
  const framing = FRAMING[act];
  const length = durationInFrames / fps;
  const snap = 1 - easeOut(clamp(time, [0, 0.3], [0, 1]));
  const scale = FILL_SCALE * (1 + (framing.zoom ?? 0) + punch * snap);
  const pan = clamp(time, [0, length], [-drift / 2, drift / 2]);
  const Graphic = framing.Graphic;
  const popHits =
    pops === false ? [] : (pops ?? hits.filter((h) => h % 2 === 0));

  return (
    <AbsoluteFill
      style={{
        transform: tilt
          ? `rotate(${tilt * (1 - snap * 0.4)}deg) scale(1.04)`
          : undefined,
      }}
    >
      <Landscape
        scale={scale}
        focusX={framing.focusX + pan}
        focusY={framing.focusY}
      >
        <Graphic hits={hits} />
      </Landscape>
      {popHits.length > 0 ? (
        <Pop hits={popHits} x={540} y={popY ?? framing.popY ?? 470} size={96} />
      ) : null}
    </AbsoluteFill>
  );
};
