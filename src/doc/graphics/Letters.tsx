import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { ARCHIVE, archiveSrc } from "../archive";
import { Archival } from "../components/Archival";
import { fitZoomRange, place, zoomBand } from "../components/framing";
import { Mount } from "../components/Mount";
import { DOC, easeIn, easeInOut, easeOut, hash, mix, ramp } from "../theme";

/** Where "Jack the Ripper" sits on the photograph of the letter's second page. */
export const SIGNATURE = { x: 0.65, y: 0.372, zoom: 2.1 } as const;

/**
 * The "Dear Boss" letter. The photograph is read top to bottom under a slow
 * pan, and on cue the camera dives to the signature. The red ink is the
 * letter's own; we only bring the room's light up on it.
 */
export const DearBossLetter: React.FC<{
  /** Frame at which the camera leaves the body of the letter for the signature. */
  readonly signatureAt: number;
  /** Frame at which a red underline draws beneath the signature. */
  readonly underlineAt?: number;
}> = ({ signatureAt, underlineAt }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const toSig = easeInOut(ramp(frame, signatureAt, signatureAt + 40));
  const readT = easeInOut(ramp(frame, 0, signatureAt));

  // Focal points measured on the photograph: body of the text, then the
  // "Jack the Ripper" line near the lower right. The dive goes as deep as the
  // photograph can carry and no deeper, so the signature arrives with the page
  // still around it.
  const image = ARCHIVE.dearBoss;
  const band = zoomBand(image, W, H);
  const [zRead, zSig] = fitZoomRange(1.0, SIGNATURE.zoom, band);
  const bodyY = mix(0.1, 0.3, readT);
  const { scale, tx, ty, covers } = place(
    image,
    W,
    H,
    {
      x: mix(0.5, SIGNATURE.x, toSig),
      y: mix(bodyY, SIGNATURE.y, toSig),
      zoom: mix(zRead, zSig, toSig),
    },
    band,
  );
  const light =
    0.55 + 0.45 * easeOut(ramp(frame, 0, 50)) + (hash(frame) - 0.5) * 0.03;
  const underline =
    underlineAt === undefined
      ? 0
      : easeOut(ramp(frame, underlineAt, underlineAt + 24));

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DOC.black }}>
      {covers ? null : <Mount image={image} />}
      <Img
        src={archiveSrc(image)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: image.w,
          height: image.h,
          maxWidth: "none",
          maxHeight: "none",
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          filter: `brightness(${0.62 * light}) contrast(1.15) saturate(1.25)`,
        }}
      />
      {/* Lamplight pool that the paper sits in. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(55% 60% at 50% 45%, rgba(255,214,150,0.10) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      {underline > 0 ? (
        <div
          style={{
            position: "absolute",
            left: tx + 0.49 * image.w * scale,
            top: ty + 0.395 * image.h * scale,
            width: 0.36 * image.w * scale * underline,
            height: 3,
            background: DOC.red,
            opacity: 0.85,
            boxShadow: `0 0 18px ${DOC.red}`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** A sheet of paper with pseudo-handwriting, generated from a seed. */
const Sheet: React.FC<{
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  readonly red?: boolean;
}> = ({ seed, width, height, red = false }) => {
  const lines = [];
  const n = 7 + Math.floor(hash(seed) * 5);
  for (let i = 0; i < n; i++) {
    const y = 26 + i * ((height - 40) / n);
    const len = 0.55 + hash(seed * 7 + i) * 0.4;
    let d = `M 16 ${y}`;
    const segs = 12;
    for (let s = 1; s <= segs; s++) {
      const x = 16 + ((width - 32) * len * s) / segs;
      const yy = y + (hash(seed * 13 + i * 31 + s) - 0.5) * 9;
      d += ` Q ${x - 6} ${yy + (s % 2 ? 6 : -6)} ${x} ${yy}`;
    }
    lines.push(
      <path
        key={i}
        d={d}
        fill="none"
        stroke={red ? DOC.red : "#3b3227"}
        strokeWidth={1.6}
        opacity={0.8}
      />,
    );
  }
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <rect width={width} height={height} fill="#e3d7be" />
      <rect
        width={width}
        height={height}
        fill="url(#sheet-age)"
        opacity={0.5}
      />
      {lines}
    </svg>
  );
};

/**
 * Hundreds of letters. Sheets rain down and settle into a heap that fills
 * the frame, the real letters among them, so the eye keeps finding the one
 * genuine article in a flood of forgeries.
 */
export const LettersPile: React.FC<{
  readonly count?: number;
  /** Frames over which the sheets arrive. */
  readonly span: number;
}> = ({ count = 70, span }) => {
  const frame = useCurrentFrame();
  const W = 1920;
  const items = [];
  const reals = [
    ARCHIVE.dearBoss,
    ARCHIVE.saucyJacky,
    ARCHIVE.fromHell,
    ARCHIVE.policeNotice,
  ];
  for (let i = 0; i < count; i++) {
    const start = easeIn(i / count) * span * 0.85;
    const t = ramp(frame, start, start + 34);
    if (t <= 0) continue;
    const e = easeOut(t);
    const w = 240 + hash(i * 3) * 160;
    const h = w * (1.25 + hash(i * 5) * 0.3);
    const x = hash(i * 11) * (W - w);
    const yEnd = 1080 - h * 0.35 - hash(i * 17) * 900;
    const y = mix(-h - 40, yEnd, e);
    const rot = mix(hash(i * 19) * 60 - 30, hash(i * 23) * 30 - 15, e);
    const isReal = i % 9 === 4 && i / 9 < reals.length;
    const real = reals[Math.floor(i / 9) % reals.length];
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          transform: `rotate(${rot}deg)`,
          boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
          overflow: "hidden",
          filter: "brightness(0.78) sepia(0.25)",
        }}
      >
        {isReal ? (
          <Img
            src={archiveSrc(real)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Sheet seed={i + 1} width={w} height={h} red={hash(i * 29) > 0.8} />
        )}
      </div>,
    );
  }
  return (
    <AbsoluteFill style={{ background: DOC.black }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="sheet-age" cx="50%" cy="50%" r="75%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#8a6a3a" stopOpacity="0.55" />
          </radialGradient>
        </defs>
      </svg>
      {items}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 70% at 50% 40%, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * The Lusk parcel: a small cardboard box tied with string on a dark table,
 * lit from one side; the lid lifts a crack and a letter slides in beside it.
 * Nothing inside is shown.
 */
export const Parcel: React.FC<{
  readonly openAt: number;
  readonly letterAt: number;
}> = ({ openAt, letterAt }) => {
  const frame = useCurrentFrame();
  const appear = easeOut(ramp(frame, 0, 30));
  const open = easeInOut(ramp(frame, openAt, openAt + 50));
  const letter = easeOut(ramp(frame, letterAt, letterAt + 40));
  const push = 1 + frame * 0.0007;
  const flick = 1 + (hash(frame) - 0.5) * 0.05;

  return (
    <AbsoluteFill style={{ background: DOC.black, overflow: "hidden" }}>
      {/* Table */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 620,
          bottom: 0,
          background: "linear-gradient(180deg, #2a2119 0%, #120e0a 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 55% at 62% 40%, rgba(255,205,130,${0.28 * flick}) 0%, rgba(255,205,130,0.06) 35%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -30%) scale(${push})`,
          opacity: appear,
        }}
      >
        <svg width={900} height={620} viewBox="0 0 900 620">
          <defs>
            <linearGradient id="pc-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7a6242" />
              <stop offset="1" stopColor="#3d3020" />
            </linearGradient>
            <linearGradient id="pc-side" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2c2216" />
              <stop offset="1" stopColor="#4a3a26" />
            </linearGradient>
            <linearGradient id="pc-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#9c8058" />
              <stop offset="1" stopColor="#6b5538" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse
            cx="420"
            cy="500"
            rx="300"
            ry="50"
            fill="#000"
            opacity="0.6"
          />
          {/* Box body */}
          <polygon
            points="200,300 560,300 560,480 200,480"
            fill="url(#pc-front)"
          />
          <polygon
            points="560,300 680,240 680,420 560,480"
            fill="url(#pc-side)"
          />
          {/* Lid, hinged at the back edge, lifting */}
          <g
            transform={`translate(680 240) rotate(${-38 * open}) translate(-680 -240)`}
          >
            <polygon
              points="200,300 560,300 680,240 320,240"
              fill="url(#pc-top)"
            />
            {/* String */}
            <line
              x1="380"
              y1="300"
              x2="500"
              y2="240"
              stroke="#c9b58a"
              strokeWidth="5"
              opacity={1 - open}
            />
          </g>
          <line
            x1="380"
            y1="300"
            x2="380"
            y2="480"
            stroke="#c9b58a"
            strokeWidth="5"
            opacity={1 - open}
          />
          <line
            x1="620"
            y1="270"
            x2="620"
            y2="450"
            stroke="#c9b58a"
            strokeWidth="4"
            opacity={1 - open}
          />
          {/* The dark inside */}
          <polygon
            points="200,300 560,300 680,240 320,240"
            fill="#0a0806"
            opacity={open}
          />
          {/* The letter slides in from the right */}
          <g
            transform={`translate(${mix(420, 0, letter)} ${mix(40, 0, letter)}) rotate(${mix(12, 7, letter)} 760 430)`}
            opacity={letter}
          >
            <rect x="640" y="330" width="230" height="300" fill="#dccfb2" />
            <text
              x="660"
              y="380"
              fontFamily="serif"
              fontSize="30"
              fill={DOC.red}
              fontStyle="italic"
              opacity="0.9"
            >
              From hell
            </text>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                d={`M 660 ${420 + i * 32} q 40 ${i % 2 ? 6 : -6} 80 0 t 100 ${i % 2 ? -4 : 4}`}
                fill="none"
                stroke={DOC.red}
                strokeWidth="2"
                opacity="0.75"
              />
            ))}
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/** Slow read of the "From Hell" letter, then a hold on its first two words. */
export const FromHellLetter: React.FC<{ readonly wordsAt?: number }> = ({
  wordsAt = 0,
}) => {
  // The whole sheet first, then up to the two words at the head of it.
  return (
    <Archival
      image={ARCHIVE.fromHell}
      from={{ x: 0.5, y: 0.5, zoom: 1.0 }}
      to={{ x: 0.5, y: 0.17, zoom: 2.2 }}
      delay={wordsAt}
      duration={60}
      tone="none"
      desaturate={0.15}
      brightness={0.7}
      contrast={1.2}
    />
  );
};
