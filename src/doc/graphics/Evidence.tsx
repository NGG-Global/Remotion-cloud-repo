import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { archiveSrc, type ArchiveImage } from "../archive";
import {
  DOC,
  easeInOut,
  easeOut,
  hash,
  mix,
  ramp,
  SERIF_LATIN,
} from "../theme";

/**
 * A suspect's file card: an aged card with a pinned photograph (or a drawn
 * silhouette where no photograph exists), the name set small in type, and
 * a slow settle. Names are the one place this film allows a caption: without
 * them the suspects blur into one another.
 */
export const SuspectCard: React.FC<{
  readonly name: string;
  readonly image?: ArchiveImage;
  /** Where in the image the face is. */
  readonly focus?: { x: number; y: number };
  readonly silhouette?: React.ReactNode;
  readonly delay?: number;
  /** Frame at which a red "rejected" stroke crosses the card, or undefined. */
  readonly strikeAt?: number;
  /** Frame at which the card slides off, or undefined. */
  readonly exitAt?: number;
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly tilt?: number;
}> = ({
  name,
  image,
  focus = { x: 0.5, y: 0.35 },
  silhouette,
  delay = 0,
  strikeAt,
  exitAt,
  x = 960,
  y = 540,
  scale = 1,
  tilt = -2,
}) => {
  const frame = useCurrentFrame();
  const enter = easeOut(ramp(frame, delay, delay + 34));
  const exit =
    exitAt === undefined ? 0 : easeInOut(ramp(frame, exitAt, exitAt + 30));
  const strike =
    strikeAt === undefined ? 0 : easeOut(ramp(frame, strikeAt, strikeAt + 16));
  const W = 560;
  const H = 700;
  const settle = 1 + Math.sin(frame * 0.02) * 0.004;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: W,
        height: H,
        transform: `translate(-50%, -50%) translateY(${(1 - enter) * 60 + exit * -80}px) rotate(${tilt + (1 - enter) * 4}deg) scale(${scale * settle})`,
        opacity: enter * (1 - exit),
        background:
          "linear-gradient(160deg, #dfd3b8 0%, #c9bb9c 60%, #b3a486 100%)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
        overflow: "hidden",
      }}
    >
      {/* Aging */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 100% at 30% 20%, transparent 40%, rgba(90,60,20,0.35) 100%)",
        }}
      />
      {/* Photograph */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 56,
          width: W - 120,
          height: 470,
          background: "#1a1613",
          overflow: "hidden",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
        }}
      >
        {image ? (
          <Img
            src={archiveSrc(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
              filter: "sepia(0.5) contrast(1.1) brightness(0.85) saturate(0.4)",
            }}
          />
        ) : (
          silhouette
        )}
      </div>
      {/* Pin */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 9,
          top: 28,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #d9c4a0, #5a3f22)",
          boxShadow: "0 3px 6px rgba(0,0,0,0.6)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 560,
          textAlign: "center",
          fontFamily: SERIF_LATIN,
          fontSize: 34,
          letterSpacing: 5,
          color: "#2b2318",
          opacity: 0.9 * easeOut(ramp(frame, delay + 20, delay + 50)),
        }}
      >
        {name}
      </div>
      {strike > 0 ? (
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <line
            x1={40}
            y1={H - 60}
            x2={40 + (W - 80) * strike}
            y2={H - 60 - (H - 120) * strike}
            stroke={DOC.red}
            strokeWidth={9}
            strokeLinecap="round"
            opacity={0.85}
          />
        </svg>
      ) : null}
    </div>
  );
};

/**
 * What a case would need, and what this one has: four emblems appear along a
 * line, and each is struck through in turn. Indictment, confession, weapon,
 * a witness placing him at a scene.
 */
export const EvidenceBoard: React.FC<{
  readonly at: readonly number[];
  readonly strikeDelay?: number;
}> = ({ at, strikeDelay = 26 }) => {
  const frame = useCurrentFrame();
  const emblems = ["document", "speech", "knife", "eye"] as const;
  const stroke = DOC.fogLight;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 90, direction: "rtl" }}>
        {emblems.map((e, i) => {
          const start = at[i] ?? at[at.length - 1] + i * 20;
          const inT = easeOut(ramp(frame, start, start + 24));
          const strike = easeOut(
            ramp(frame, start + strikeDelay, start + strikeDelay + 14),
          );
          const dim = mix(1, 0.35, strike);
          return (
            <div
              key={e}
              style={{
                width: 300,
                height: 300,
                position: "relative",
                opacity: inT,
                transform: `translateY(${(1 - inT) * 24}px)`,
              }}
            >
              <svg width={300} height={300} viewBox="-150 -150 300 300">
                <circle
                  r="130"
                  fill="rgba(255,255,255,0.03)"
                  stroke={stroke}
                  strokeOpacity={0.25 * dim}
                  strokeWidth={2}
                />
                <g
                  opacity={dim}
                  stroke={stroke}
                  strokeWidth={5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {e === "document" ? (
                    <g>
                      <path d="M -55 -80 L 30 -80 L 60 -50 L 60 80 L -55 80 Z" />
                      <path d="M 30 -80 L 30 -50 L 60 -50" />
                      <path d="M -30 -20 L 35 -20 M -30 10 L 35 10 M -30 40 L 10 40" />
                    </g>
                  ) : null}
                  {e === "speech" ? (
                    <g>
                      <path d="M -80 -60 L 80 -60 L 80 30 L -10 30 L -50 70 L -45 30 L -80 30 Z" />
                      <path d="M -45 -15 L 45 -15" />
                    </g>
                  ) : null}
                  {e === "knife" ? (
                    <g transform="rotate(-35)">
                      <path d="M -10 -95 L 10 -95 L 12 10 L -12 10 Z" />
                      <path d="M -16 10 L 16 10 L 16 30 L -16 30 Z" />
                      <path d="M -6 30 L 6 30 L 6 95 L -6 95 Z" />
                    </g>
                  ) : null}
                  {e === "eye" ? (
                    <g>
                      <path d="M -95 0 C -50 -60 50 -60 95 0 C 50 60 -50 60 -95 0 Z" />
                      <circle r="28" />
                      <circle r="10" fill={stroke} />
                    </g>
                  ) : null}
                </g>
                {/* The strike */}
                <line
                  x1={-95}
                  y1={95}
                  x2={-95 + 190 * strike}
                  y2={95 - 190 * strike}
                  stroke={DOC.red}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={0.9}
                />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * A silhouette bust with a soft cold rim, for the suspects and victims of
 * whom no photograph survives. Drawn here rather than borrowed so the card
 * has no dependency on the figure library.
 */
export const Bust: React.FC<{
  readonly seed?: number;
  readonly hair?: "short" | "long" | "cap";
}> = ({ seed = 1, hair = "short" }) => {
  const jaw = 62 + hash(seed) * 10;
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="-200 -240 400 480"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`bust-bg-${seed}`} cx="50%" cy="35%" r="70%">
          <stop offset="0" stopColor="#3a3f4b" />
          <stop offset="1" stopColor="#101217" />
        </radialGradient>
      </defs>
      <rect
        x="-200"
        y="-240"
        width="400"
        height="480"
        fill={`url(#bust-bg-${seed})`}
      />
      <path
        d={`M ${-jaw} -120 C ${-jaw} -200 ${jaw} -200 ${jaw} -120 C ${jaw} -70 ${jaw * 0.6} -30 20 -18 L 20 6 C 120 24 180 90 190 240 L -190 240 C -180 90 -120 24 -20 6 L -20 -18 C ${-jaw * 0.6} -30 ${-jaw} -70 ${-jaw} -120 Z`}
        fill={DOC.black}
      />
      {hair === "long" ? (
        <path
          d={`M ${-jaw - 8} -110 C ${-jaw - 30} -40 ${-jaw - 40} 40 ${-jaw - 46} 120 L ${-jaw + 10} 30 Z M ${jaw + 8} -110 C ${jaw + 30} -40 ${jaw + 40} 40 ${jaw + 46} 120 L ${jaw - 10} 30 Z`}
          fill={DOC.black}
        />
      ) : null}
      {hair === "cap" ? (
        <path
          d={`M ${-jaw - 20} -150 C ${-jaw} -215 ${jaw} -215 ${jaw + 20} -150 L ${jaw + 40} -140 L ${-jaw - 40} -140 Z`}
          fill={DOC.black}
        />
      ) : null}
    </svg>
  );
};
