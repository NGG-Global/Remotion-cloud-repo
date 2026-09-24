import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { ARCHIVE, archiveSrc, type ArchiveImage } from "../archive";
import { fitZoomRange, place, zoomBand } from "../components/framing";
import { Mount } from "../components/Mount";
import { DOC, easeInOut, easeOut, hash, mix, ramp } from "../theme";

/**
 * Front pages slam into frame one after another, each with a flash of white
 * as it lands. The pattern interrupt of the film: used where the narration
 * says the papers seized the story.
 */
export const HeadlineSlam: React.FC<{
  readonly pages: readonly ArchiveImage[];
  /** Frame at which the first page lands. */
  readonly start?: number;
  /** Frames between landings. */
  readonly interval: number;
  /** Where on each page to look (fractions), default the masthead. */
  readonly focus?: { x: number; y: number };
  readonly zoom?: number;
}> = ({
  pages,
  start = 0,
  interval,
  focus = { x: 0.5, y: 0.14 },
  zoom = 1.15,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: DOC.black, overflow: "hidden" }}>
      {pages.map((p, i) => {
        const land = start + i * interval;
        const t = ramp(frame, land, land + 7);
        if (t <= 0) return null;
        const e = easeOut(t);
        // A front page always fills the frame here, so the band is floored at
        // cover; the overshoot it lands from is whatever the page can carry.
        const band = zoomBand(p, W, H, { floor: "cover" });
        const [zLand, zOver] = fitZoomRange(zoom, zoom * 1.35, band);
        const rot = mix(hash(i * 7) * 10 - 5, hash(i * 3) * 3 - 1.5, e);
        const settle = 1 + (frame - land) * 0.0006;
        const { scale, tx, ty } = place(
          p,
          W,
          H,
          {
            x: focus.x,
            y: focus.y,
            // A little over cover, so the tilt cannot swing a corner into frame.
            zoom: Math.max(1.06, mix(zOver, zLand, e) * settle),
          },
          band,
        );
        return (
          <AbsoluteFill
            key={i}
            style={{ transform: `rotate(${rot}deg)`, opacity: e }}
          >
            <Img
              src={archiveSrc(p)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: p.w,
                height: p.h,
                maxWidth: "none",
                maxHeight: "none",
                transformOrigin: "0 0",
                transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                filter:
                  "sepia(0.45) contrast(1.2) brightness(0.8) saturate(0.6)",
              }}
            />
          </AbsoluteFill>
        );
      })}
      {/* Flash on each landing */}
      {pages.map((_, i) => {
        const land = start + i * interval;
        const f = 1 - ramp(frame, land, land + 5);
        if (frame < land || f <= 0) return null;
        return (
          <AbsoluteFill
            key={`f${i}`}
            style={{ background: "#fff5e0", opacity: 0.75 * f }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(75% 75% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * A flood of print: three bands of newspaper pages sliding at different
 * speeds, a rolling press seen as a wall of pages. For the beats about the
 * brand being made by the press.
 */
export const PressFlood: React.FC<{
  readonly speed?: number;
  readonly dim?: number;
}> = ({ speed = 1, dim = 0.55 }) => {
  const frame = useCurrentFrame();
  const pages = [
    ARCHIVE.ipnSep15,
    ARCHIVE.ipnSep22,
    ARCHIVE.ipnOct13,
    ARCHIVE.ipnOct20,
    ARCHIVE.ipnNov3,
    ARCHIVE.ipnNov24,
    ARCHIVE.pennySep8,
    ARCHIVE.pennyAldgate,
  ];
  const bands = [
    { y: -80, h: 440, v: 1.6, dir: 1, skew: -3 },
    { y: 330, h: 470, v: 2.4, dir: -1, skew: -3 },
    { y: 770, h: 440, v: 1.9, dir: 1, skew: -3 },
  ];
  return (
    <AbsoluteFill style={{ background: DOC.black, overflow: "hidden" }}>
      {bands.map((b, bi) => {
        const tileW = b.h * 0.72 + 24;
        const total = tileW * pages.length;
        const offset =
          (((frame * b.v * speed * b.dir) % total) + total) % total;
        const items = [];
        for (let k = -1; k < pages.length + 2; k++) {
          const idx =
            (((k + bi * 3) % pages.length) + pages.length) % pages.length;
          const p = pages[idx];
          const x = k * tileW - offset;
          items.push(
            <div
              key={k}
              style={{
                position: "absolute",
                left: x,
                top: 0,
                width: tileW - 24,
                height: b.h,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}
            >
              <Img
                src={archiveSrc(p)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "50% 10%",
                  filter: `sepia(0.5) contrast(1.15) brightness(${0.85 - dim * 0.5}) saturate(0.5)`,
                }}
              />
            </div>,
          );
        }
        return (
          <div
            key={bi}
            style={{
              position: "absolute",
              left: -200,
              right: -200,
              top: b.y,
              height: b.h,
              transform: `skewY(${b.skew}deg)`,
            }}
          >
            {items}
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 65% at 50% 50%, transparent 30%, rgba(0,0,0,${0.5 + dim * 0.4}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * One archival page, held under lamplight with a slow drift, and a red
 * circle that draws itself around the detail the narration is pointing at.
 */
export const CircledDetail: React.FC<{
  readonly image: ArchiveImage;
  readonly focus: { x: number; y: number };
  readonly zoom: number;
  readonly circleAt: number;
  readonly radius?: number;
  readonly tone?: "print" | "photo";
}> = ({ image, focus, zoom, circleAt, radius = 190, tone = "print" }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const drift = easeInOut(ramp(frame, 0, 400));
  const band = zoomBand(image, W, H);
  const [z0, z1] = fitZoomRange(zoom, zoom * 1.06, band);
  const { scale, tx, ty, dw, dh, covers } = place(
    image,
    W,
    H,
    { x: focus.x, y: focus.y, zoom: mix(z0, z1, drift) },
    band,
  );
  // The circle marks a piece of the sheet, not a piece of the screen: it sits
  // over the detail wherever the framing put it, and if the framing had to open
  // up to stay readable, the ring opens with it.
  const r = Math.max(90, (radius * scale) / (band.cover * zoom));
  const cx = tx + focus.x * dw;
  const cy = ty + focus.y * dh;
  const draw = easeInOut(ramp(frame, circleAt, circleAt + 36));
  const C = 2 * Math.PI * r;
  return (
    <AbsoluteFill style={{ background: DOC.black, overflow: "hidden" }}>
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
          filter:
            tone === "print"
              ? "sepia(0.4) contrast(1.15) brightness(0.8) saturate(0.5)"
              : "sepia(0.35) contrast(1.05) brightness(0.8) saturate(0.3)",
        }}
      />
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={DOC.red}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - draw)}
          transform={`rotate(-100 ${cx} ${cy})`}
          opacity={0.9}
          style={{ filter: "drop-shadow(0 0 8px rgba(168,23,31,0.7))" }}
        />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
