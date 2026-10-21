import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MONO } from "../fonts";
import { R, SIZE } from "../theme";

export type CodeLine = {
  readonly text: string;
  /** Output lines render dimmer, with no prompt and no typing. */
  readonly kind?: "code" | "output" | "comment";
  /** Frame (relative to the panel) at which this line starts. */
  readonly at: number;
};

type CodePanelProps = {
  readonly lines: readonly CodeLine[];
  readonly title?: string;
  readonly width?: number;
  readonly fontSize?: number;
  /** Frames per typed character. */
  readonly charFrames?: number;
  readonly at?: number;
  readonly minHeight?: number;
};

const KEYWORDS =
  /\b(library|function|if|else|for|in|TRUE|FALSE|NULL|print|c|mean|sum|data\.frame|ggplot|aes|geom_point|geom_bar|head|summary|lm|install\.packages|paste|nrow|filter|mutate|read_csv|length|rnorm|plot|return)\b/g;

/** Light syntax tint; whole-token colouring is enough at this size. */
const colourise = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const tokens = text.split(/(".*?"|#.*$|\b\d+(?:\.\d+)?\b|<-|%>%|\|>)/g);
  tokens.forEach((tok, i) => {
    if (!tok) return;
    let color: string = R.codeText;
    let fontWeight = 400;
    if (tok.startsWith('"')) color = R.codeString;
    else if (tok.startsWith("#")) color = R.codeComment;
    else if (/^\d/.test(tok)) color = R.codeNumber;
    else if (tok === "<-" || tok === "%>%" || tok === "|>") {
      color = R.yellow;
      fontWeight = 700;
    } else if (KEYWORDS.test(tok)) {
      KEYWORDS.lastIndex = 0;
      parts.push(
        <span key={i}>
          {tok.split(KEYWORDS).map((piece, j) =>
            piece && new RegExp(`^${KEYWORDS.source}$`).test(piece) ? (
              <span key={j} style={{ color: R.codeKeyword, fontWeight: 700 }}>
                {piece}
              </span>
            ) : (
              <span key={j}>{piece}</span>
            ),
          )}
        </span>,
      );
      return;
    }
    KEYWORDS.lastIndex = 0;
    parts.push(
      <span key={i} style={{ color, fontWeight }}>
        {tok}
      </span>,
    );
  });
  return parts;
};

/**
 * An RStudio-flavoured console: code lines type in character by character,
 * output lines slide in whole, a beat later, the way a real console answers.
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  lines,
  title = "console",
  width = 960,
  fontSize = SIZE.code,
  charFrames = 1.4,
  at = 0,
  minHeight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  const enter = spring({
    frame: local,
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.8 },
  });

  const lastLine = lines[lines.length - 1];
  const typingDone = lastLine
    ? lastLine.at + lastLine.text.length * charFrames
    : 0;
  const cursorOn = Math.floor(local / 14) % 2 === 0;

  return (
    <div
      style={{
        width,
        minHeight,
        borderRadius: 34,
        background: R.panel,
        boxShadow: `0 26px 60px ${R.ink}33, 0 0 0 6px ${R.white}`,
        overflow: "hidden",
        opacity: interpolate(enter, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${(1 - enter) * 120}px) scale(${0.9 + enter * 0.1})`,
        fontFamily: MONO,
        fontSize,
        direction: "ltr",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "22px 30px",
          background: R.panelLine,
        }}
      >
        {[R.coral, R.yellow, R.green].map((c) => (
          <span
            key={c}
            style={{ width: 22, height: 22, borderRadius: 11, background: c }}
          />
        ))}
        <span
          style={{
            marginLeft: 16,
            color: R.codeOutput,
            fontSize: fontSize * 0.7,
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "30px 36px 34px", lineHeight: 1.55 }}>
        {lines.map((line, i) => {
          const start = line.at;
          if (local < start) return null;
          const kind = line.kind ?? "code";
          if (kind === "output") {
            const p = spring({
              frame: local - start,
              fps,
              config: { damping: 200, stiffness: 200 },
            });
            return (
              <div
                key={i}
                style={{
                  color: R.codeOutput,
                  whiteSpace: "pre",
                  opacity: p,
                  transform: `translateX(${(1 - p) * -18}px)`,
                }}
              >
                {line.text}
              </div>
            );
          }
          const shown = Math.min(
            line.text.length,
            Math.floor((local - start) / charFrames),
          );
          const isLast =
            i === lines.length - 1 || local < (lines[i + 1]?.at ?? 0);
          const caret =
            isLast && (shown < line.text.length || local < typingDone + 60);
          return (
            <div key={i} style={{ whiteSpace: "pre", display: "flex" }}>
              <span
                style={{ color: R.codeKeyword, opacity: 0.75, marginRight: 18 }}
              >
                {">"}
              </span>
              <span>{colourise(line.text.slice(0, shown))}</span>
              {caret ? (
                <span
                  style={{
                    display: "inline-block",
                    width: fontSize * 0.55,
                    height: fontSize * 1.1,
                    marginLeft: 4,
                    background: R.yellow,
                    opacity: cursorOn ? 1 : 0.15,
                    alignSelf: "center",
                    borderRadius: 4,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
