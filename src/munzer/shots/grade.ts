/**
 * Colour treatments. The archive is 1990s broadcast video and a 1988 home
 * video; the grade unifies them without pretending they are film.
 *
 * - `stage`: the default for competition footage. Slightly muted, warm.
 * - `cold`: the autopsy register. Monochrome, cool, low.
 * - `mono`: plain black and white, for archive that should read as memory.
 * - `vhs`: the 1988 club video, whose colour is mostly lighting casts.
 * - `photo`: magazine photographs.
 * - `none`: untouched.
 */
export type Grade = "stage" | "cold" | "mono" | "vhs" | "photo" | "none" | "dim";

export const gradeFilter = (g: Grade): string => {
  switch (g) {
    case "stage":
      return "saturate(0.82) contrast(1.08) brightness(0.96) sepia(0.08)";
    case "cold":
      return "grayscale(1) contrast(1.22) brightness(0.78)";
    case "mono":
      return "grayscale(1) contrast(1.12) brightness(0.92)";
    case "vhs":
      return "grayscale(0.8) sepia(0.28) contrast(1.12) brightness(1.22)";
    case "photo":
      return "saturate(0.8) contrast(1.06) brightness(0.95) sepia(0.1)";
    case "dim":
      return "saturate(0.6) contrast(1.05) brightness(0.62)";
    case "none":
      return "none";
  }
};

/** A tint laid over the picture after the filter. */
export const gradeTint = (g: Grade): string | null => {
  switch (g) {
    case "cold":
      return "rgba(70, 110, 130, 0.32)";
    case "vhs":
      return "rgba(110, 85, 50, 0.12)";
    default:
      return null;
  }
};
