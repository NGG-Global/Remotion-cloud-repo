import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

type HitsProps = {
  /** A one-shot rendered from the game's own synthesis (`public/tiny-tempo/sfx`). */
  readonly src: string;
  /** Local frames on which it sounds. */
  readonly at: readonly number[];
  readonly volume?: number;
};

/**
 * The act's voice on its beats. The game's hammer and knife are synthesized by pure
 * functions in its source, rendered here to WAV unchanged, so what is heard on a blow is
 * the game's blow. Kept well under the music: the track is the subject, these are the
 * room.
 */
export const Hits: React.FC<HitsProps> = ({ src, at, volume = 0.4 }) => (
  <>
    {at.map((frame, i) => (
      <Sequence
        key={`${frame}-${i}`}
        from={frame}
        durationInFrames={30}
        name={`hit ${i + 1}`}
      >
        <Audio src={staticFile(src)} volume={() => volume} />
      </Sequence>
    ))}
  </>
);
