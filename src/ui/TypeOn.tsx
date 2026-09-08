import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

type TypeOnProps = {
  readonly text: string;
  /** Frame at which typing starts. */
  readonly delay?: number;
  /** Characters per second. */
  readonly speed?: number;
  /** Show a blinking caret after the typed text. */
  readonly caret?: boolean;
  readonly style?: React.CSSProperties;
};

/**
 * Typewriter reveal.
 *
 * The character count is derived from the frame number rather than advanced by
 * a timer, so scrubbing backwards in the Studio shows the correct partial
 * string and every render produces identical frames.
 */
export const TypeOn: React.FC<TypeOnProps> = ({
  text,
  delay = 0,
  speed = 22,
  caret = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsedSeconds = Math.max(0, frame - delay) / fps;
  const shown = Math.min(text.length, Math.floor(elapsedSeconds * speed));

  const done = shown >= text.length;
  // Caret blinks at roughly 2 Hz, in frame terms so it stays deterministic.
  const blinkOn = Math.floor(frame / (fps / 4)) % 2 === 0;

  return (
    <span style={style}>
      {text.slice(0, shown)}
      {caret ? (
        <span style={{ opacity: done && !blinkOn ? 0 : 1 }}>|</span>
      ) : null}
    </span>
  );
};
