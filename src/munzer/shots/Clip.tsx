import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill } from "remotion";
import { useShot } from "../engine/shot";
import { EASE, clamp, ramp } from "../engine/time";
import { CLIPS, clipSrc, type ClipId } from "../media";
import { FPS, INK } from "../theme";
import { CENTER, mix, place, type Framing } from "./frame";
import { gradeFilter, gradeTint, type Grade } from "./grade";

export type ClipFx =
  | {
      /** The picture turns to an X-ray between two narration times. */
      readonly kind: "xray";
      readonly from: number;
      readonly to: number;
      /** `fade` dissolves; `scan` wipes a band down the frame. */
      readonly mode?: "fade" | "scan";
      readonly organs?: boolean;
    }
  | {
      /** A slow red pulse at the edges: something is wrong. */
      readonly kind: "pulse";
      readonly from: number;
      readonly rate?: number;
    }
  | {
      /** Desaturate to grey between two narration times. */
      readonly kind: "drain";
      readonly from: number;
      readonly to: number;
    };

export type ClipProps = {
  readonly clip: ClipId;
  /** Source second at the start of the shot. */
  readonly src: number;
  /** Playback rate. Below 1 is slow motion. */
  readonly rate?: number;
  readonly from?: Framing;
  readonly to?: Framing;
  readonly fit?: "cover" | "contain";
  readonly grade?: Grade;
  readonly fx?: ClipFx;
  /** Natural sound under the narration, 0-1. */
  readonly nat?: number;
};

const OrganGhost: React.FC<{ readonly k: number }> = ({ k }) => (
  <svg
    viewBox="0 0 1920 1080"
    style={{ position: "absolute", inset: 0, opacity: k }}
  >
    <defs>
      <radialGradient id="og" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={INK.damageGlow} stopOpacity={0.85} />
        <stop offset="100%" stopColor={INK.damage} stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={1000} cy={430} rx={70} ry={80} fill="url(#og)" />
    <ellipse cx={905} cy={545} rx={120} ry={70} fill="url(#og)" />
    <ellipse cx={1040} cy={590} rx={40} ry={55} fill="url(#og)" />
    <ellipse cx={880} cy={600} rx={40} ry={55} fill="url(#og)" />
  </svg>
);

/**
 * An archive video shot: the clip, framed, graded, optionally slowed.
 * The picture always covers the frame (see `place`); 480p sources are
 * upscaled, which is why pushes stay gentle.
 */
export const Clip: React.FC<ClipProps> = ({
  clip,
  src,
  rate = 1,
  from = CENTER,
  to,
  fit = "cover",
  grade = "stage",
  fx,
  nat = 0,
}) => {
  const { t, n, dur } = useShot();
  const meta = CLIPS[clip];
  const k = EASE.drift(clamp(t / Math.max(dur, 0.01)));
  const f = mix(from, to ?? from, k);
  // Frame against the safe part of the picture only.
  const [x0, y0, x1, y1] = meta.safe;
  const sw = meta.w * (x1 - x0);
  const sh = meta.h * (y1 - y0);
  const p = place(
    sw,
    sh,
    { x: (f.x - x0) / (x1 - x0), y: (f.y - y0) / (y1 - y0), z: f.z },
    fit,
  );
  const scale = p.scale;
  const tx = p.tx - x0 * meta.w * scale;
  const ty = p.ty - y0 * meta.h * scale;
  const tint = gradeTint(grade);
  const durFrames = Math.max(1, Math.round(dur * FPS));
  const fade = 8;

  const layer = (filter: string, muted: boolean, extra?: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: meta.w,
        height: meta.h,
        transformOrigin: "0 0",
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        filter,
        ...extra,
      }}
    >
      <Video
        src={clipSrc(clip)}
        trimBefore={Math.round(src * FPS)}
        playbackRate={rate}
        muted={muted}
        volume={(fr: number) =>
          muted ? 0 : nat * Math.min(1, fr / fade, Math.max(0, (durFrames - fr) / fade))
        }
        style={{ width: meta.w, height: meta.h, display: "block" }}
      />
    </div>
  );

  let xk = 0;
  if (fx?.kind === "xray") {
    xk = ramp(n, fx.from, fx.to, EASE.inOut);
  }
  let drain = 0;
  if (fx?.kind === "drain") {
    drain = ramp(n, fx.from, fx.to, EASE.inOut);
  }
  const baseFilter =
    drain > 0
      ? `${gradeFilter(grade)} grayscale(${drain}) brightness(${1 - drain * 0.25})`
      : gradeFilter(grade);

  return (
    <AbsoluteFill style={{ background: INK.void, overflow: "hidden" }}>
      {layer(baseFilter, nat <= 0)}
      {tint ? <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply" }} /> : null}
      {fx?.kind === "xray" && xk > 0 ? (
        <AbsoluteFill
          style={{
            opacity: fx.mode === "scan" ? 1 : xk,
            clipPath:
              fx.mode === "scan" ? `inset(0 0 ${(1 - xk) * 100}% 0)` : undefined,
          }}
        >
          {layer(
            "grayscale(1) invert(1) contrast(1.55) brightness(0.82)",
            true,
          )}
          <AbsoluteFill
            style={{ background: "rgba(60, 150, 170, 0.45)", mixBlendMode: "multiply" }}
          />
          {fx.organs ? <OrganGhost k={xk} /> : null}
          {fx.mode === "scan" && xk < 1 ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${xk * 100}%`,
                height: 3,
                background: INK.clinicGlow,
                boxShadow: `0 0 24px 6px ${INK.clinicGlow}`,
                opacity: 0.85,
              }}
            />
          ) : null}
        </AbsoluteFill>
      ) : null}
      {fx?.kind === "pulse" ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(75% 70% at 50% 50%, transparent 40%, rgba(170, 20, 10, ${
              0.42 *
              ramp(n, fx.from, fx.from + 1.2) *
              (0.55 + 0.45 * Math.sin((t * Math.PI * 2) / (fx.rate ?? 1.1)))
            }) 100%)`,
            mixBlendMode: "multiply",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
