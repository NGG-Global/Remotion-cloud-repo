import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../theme";
import { LineIcon, type IconName } from "./LineIcon";

export type AskSource = {
  /** System name, kept LTR because these are product names. */
  readonly label: string;
  readonly icon: IconName;
};

type AskAcrossProps = {
  readonly width: number;
  readonly height: number;
  /** The request, shown as a pill at the top. */
  readonly question: string;
  /** The systems the request can reach, right to left in the order given. */
  readonly sources: readonly AskSource[];
  /**
   * Frame at which the connectors reach out to the sources. The question pill
   * arrives a beat before this.
   */
  readonly fanAt: number;
  /**
   * Frame at which the relevant pieces travel back and settle into one answer.
   * Omit to leave the picture at the routing stage — the request reaching the
   * systems, without composing a result.
   */
  readonly gatherAt?: number;
  /** The single result the pieces compose into. */
  readonly answer?: { readonly title: string; readonly icon: IconName };
};

/**
 * One request, reaching across the connected systems and coming back as a
 * single answer.
 *
 * This is the episode's recurring claim in one picture: you ask for a result,
 * and Claude — not you — decides which systems hold the pieces, then assembles
 * them. A list of system names cannot show the reach-out-and-gather motion, so
 * the connectors draw outward to the sources and the pieces travel back into
 * one card. The same graphic serves the "decides where to go" beat (no answer
 * card, routing only) and the "assembles what already exists" beat (pieces
 * gathering into a result).
 */
export const AskAcross: React.FC<AskAcrossProps> = ({
  width,
  height,
  question,
  sources,
  fanAt,
  gatherAt,
  answer,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const n = sources.length;
  const tileW = Math.min(width * 0.2, width / (n + 0.6));
  const tileH = height * 0.2;
  const gapX = (width - n * tileW) / (n + 1);
  const rowTop = height * 0.4;
  const askY = height * 0.05;
  const askH = height * 0.16;

  // Right to left: the first source named sits rightmost.
  const tileLeft = (i: number) => width - gapX - (i + 1) * tileW - i * gapX;
  const tileCx = (i: number) => tileLeft(i) + tileW / 2;

  const answerW = width * 0.34;
  const answerH = height * 0.22;
  const answerTop = height * 0.74;
  const answerCx = width / 2;

  const askIn = spring({ frame: frame - (fanAt - 10), fps, config: { damping: 200 } });

  return (
    <div style={{ position: "relative", width, height, direction: "rtl" }}>
      {/* The request. */}
      <div
        style={{
          position: "absolute",
          top: askY,
          right: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          opacity: askIn,
          transform: `translateY(${interpolate(askIn, [0, 1], [-14, 0])}px)`,
        }}
      >
        <div
          style={{
            maxWidth: "88%",
            fontFamily,
            fontSize: height * 0.058,
            fontWeight: 600,
            lineHeight: 1.3,
            color: COLORS.ink,
            backgroundColor: COLORS.labelBg,
            borderRadius: askH * 0.5,
            padding: `${height * 0.032}px ${height * 0.05}px`,
            textAlign: "center",
          }}
        >
          {question}
        </div>
      </div>

      {/* Connectors from the request out to each source, then the gathered
          pieces travelling back to the answer. Drawn, so the reach and the
          return read as motion rather than as a static diagram. */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={width}
        height={height}
        aria-hidden
      >
        {sources.map((_, i) => {
          const reach = interpolate(
            frame - (fanAt + i * 4),
            [0, 18],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const midY = (askY + askH + rowTop) / 2;
          return (
            <path
              key={i}
              d={`M ${width / 2} ${askY + askH} C ${width / 2} ${midY}, ${tileCx(i)} ${midY}, ${tileCx(i)} ${rowTop}`}
              pathLength={1}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={2.5}
              strokeOpacity={0.5}
              strokeDasharray={1}
              strokeDashoffset={1 - reach}
            />
          );
        })}

        {answer && gatherAt !== undefined
          ? sources.map((_, i) => {
              const send = interpolate(
                frame - (gatherAt + i * 4),
                [0, 20],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const sx = tileCx(i);
              const sy = rowTop + tileH;
              const midY = (sy + answerTop) / 2;
              return (
                <path
                  key={`g${i}`}
                  d={`M ${sx} ${sy} C ${sx} ${midY}, ${answerCx} ${midY}, ${answerCx} ${answerTop}`}
                  pathLength={1}
                  fill="none"
                  stroke={COLORS.accentSoft}
                  strokeWidth={2.5}
                  strokeOpacity={0.6}
                  strokeDasharray={1}
                  strokeDashoffset={1 - send}
                />
              );
            })
          : null}
      </svg>

      {/* The gathered pieces, streaming down the return paths for as long as
          the beat runs — the narration's "it just keeps collecting", and what
          keeps a long assembly beat alive rather than static after one pass. */}
      {answer && gatherAt !== undefined
        ? sources.flatMap((_, i) => {
            const start = gatherAt + i * 4;
            if (frame < start) {
              return [];
            }
            const travel = 24;
            const streams = 3;
            const sx = tileCx(i);
            const sy = rowTop + tileH;
            const dot = tileH * 0.15;
            return Array.from({ length: streams }, (__, p) => {
              const raw = (frame - start) / travel - p / streams;
              if (raw < 0) {
                return null;
              }
              const t = raw - Math.floor(raw);
              const x = interpolate(t, [0, 1], [sx, answerCx]);
              const y = interpolate(t, [0, 1], [sy, answerTop]);
              // A soft envelope so pieces fade in leaving the source and fade
              // out arriving, instead of popping at the endpoints.
              const fade = Math.sin(Math.PI * t);
              return (
                <div
                  key={`piece${i}-${p}`}
                  style={{
                    position: "absolute",
                    left: x - dot / 2,
                    top: y - dot / 2,
                    width: dot,
                    height: dot,
                    borderRadius: 5,
                    background: COLORS.accentSoft,
                    boxShadow: `0 0 14px ${COLORS.accent}66`,
                    opacity: fade,
                  }}
                />
              );
            });
          })
        : null}

      {/* The sources. */}
      {sources.map((source, i) => {
        const pop = spring({
          frame: frame - (fanAt - 6) - i * 5,
          fps,
          config: { damping: 200 },
        });
        const lit = interpolate(
          frame - (fanAt + 14 + i * 4),
          [0, 12],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={source.label}
            style={{
              position: "absolute",
              top: rowTop,
              left: tileLeft(i),
              width: tileW,
              height: tileH,
              borderRadius: 18,
              backgroundColor: COLORS.surface,
              border: `1.5px solid ${
                lit > 0.5 ? COLORS.accent : "rgba(255,255,255,0.09)"
              }`,
              boxShadow: lit > 0.5 ? `0 0 26px ${COLORS.accent}30` : undefined,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: tileH * 0.12,
              opacity: pop,
              transform: `translateY(${interpolate(pop, [0, 1], [20, 0])}px)`,
            }}
          >
            <LineIcon
              name={source.icon}
              size={tileH * 0.34}
              delay={fanAt - 2 + i * 5}
              color={lit > 0.5 ? COLORS.accent : COLORS.textMuted}
              idle={false}
            />
            <div
              style={{
                fontFamily,
                fontSize: tileH * 0.2,
                fontWeight: 700,
                color: lit > 0.5 ? COLORS.text : COLORS.textMuted,
                direction: "ltr",
              }}
            >
              {source.label}
            </div>
          </div>
        );
      })}

      {/* The single result the pieces compose into. */}
      {answer && gatherAt !== undefined
        ? (() => {
            const rise = spring({
              frame: frame - (gatherAt + 16),
              fps,
              config: { damping: 60, stiffness: 130 },
            });
            if (rise <= 0.02) {
              return null;
            }
            return (
              <div
                style={{
                  position: "absolute",
                  left: answerCx - answerW / 2,
                  top: answerTop,
                  width: answerW,
                  height: answerH,
                  borderRadius: 18,
                  background: COLORS.backgroundDeep,
                  border: `2px solid ${COLORS.accent}`,
                  boxShadow: `0 0 ${50 * rise}px ${COLORS.accent}3a`,
                  opacity: rise,
                  transform: `scale(${0.88 + rise * 0.12})`,
                  display: "flex",
                  alignItems: "center",
                  gap: answerH * 0.2,
                  padding: `0 ${answerW * 0.07}px`,
                  boxSizing: "border-box",
                }}
              >
                <LineIcon
                  name={answer.icon}
                  size={answerH * 0.42}
                  delay={gatherAt + 18}
                  color={COLORS.accent}
                  idle={false}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily,
                      fontSize: answerH * 0.2,
                      fontWeight: 800,
                      color: COLORS.text,
                      marginBottom: answerH * 0.12,
                    }}
                  >
                    {answer.title}
                  </div>
                  {[0.9, 0.7, 0.82].map((w, r) => {
                    // Each line fills in turn as the pieces keep arriving, so
                    // the card reads as being composed rather than dropped in.
                    const build = interpolate(
                      frame - (gatherAt + 20 + r * 14),
                      [0, 18],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    );
                    return (
                      <div
                        key={r}
                        style={{
                          height: answerH * 0.07,
                          width: `${w * build * 100}%`,
                          marginBottom: answerH * 0.06,
                          borderRadius: 4,
                          background: COLORS.textMuted,
                          opacity: 0.5 * rise,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })()
        : null}
    </div>
  );
};
