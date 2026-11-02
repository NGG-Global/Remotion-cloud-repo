import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { z } from "zod";
import "../fonts";
import { CloseupWords } from "./CloseupWords";
import { Ribbons } from "./Ribbons";
import { SkyWords } from "./Word3D";
import { Subtitles } from "./Subtitles";

/** Length of the master: 165.53 s at 30 fps. */
export const COMFORT_ZONE_DURATION = 4966;

export const comfortZoneSchema = z.object({
  /**
   * "clean" is the plate with the Hebrew text removed
   * (public/video/comfort-zone-clean.mp4, built by `npm run plate`). "source"
   * overlays the English straight onto the Hebrew master, for checking
   * timing and placement without building the plate.
   */
  plate: z.enum(["clean", "source"]),
  subtitles: z.boolean(),
  words: z.boolean(),
});

export const comfortZoneDefaultProps: z.infer<typeof comfortZoneSchema> = {
  plate: "clean",
  subtitles: true,
  words: true,
};

/**
 * English version of the "Comfort Zone" film.
 *
 * The picture and sound come from the master; this composition only adds the
 * English text layers on top of a plate from which the Hebrew text has been
 * removed. See tools/comfort-zone/clean_plate.py for the removal and
 * data/words.json for the measured word tracks.
 */
export const ComfortZoneEN: React.FC<z.infer<typeof comfortZoneSchema>> = ({
  plate,
  subtitles,
  words,
}) => {
  const src =
    plate === "clean"
      ? "video/comfort-zone-clean.mp4"
      : "video/comfort-zone-he.mp4";
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(src)} />
      {words ? (
        <>
          <SkyWords />
          <Ribbons />
          <CloseupWords />
        </>
      ) : null}
      {subtitles ? <Subtitles /> : null}
    </AbsoluteFill>
  );
};
