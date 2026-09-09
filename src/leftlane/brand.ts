/**
 * Left Lane brand tokens.
 *
 * Every value here was sampled from the supplied assets rather than chosen:
 * the green and the off-white canvas come from the official end card and the
 * logo mark, the road geometry from the end card's opening frames. The
 * commercial's abstract road therefore uses the same lines, in the same
 * places, as the logo animation it resolves into.
 */
export const BRAND = {
  /** End-card and logo background. */
  canvas: "#F5F5F5",
  /** Logo green, sampled from the end card's final frame. */
  green: "#16854D",
  /** Very light road surface, only used behind the abstract road. */
  roadFill: "#ECEEED",
  ink: "#16191A",
  inkMuted: "#5E6664",
  carBody: "#1C2120",
  carGlass: "#4A5350",
  carLight: "#E4E8E6",
  white: "#FFFFFF",
} as const;

/**
 * Abstract road geometry in 1920x1080 space, measured from the official end
 * card (which is 1280x720, so every value is the measurement times 1.5).
 */
export const ROAD = {
  /** Centre x of the left and right edge lines. */
  leftLineX: 370,
  rightLineX: 1550,
  centreX: 960,
  /** Lane centres, where the vehicle marker drives. */
  leftLaneX: 665,
  rightLaneX: 1255,
  /** The end card's road leans very slightly; degrees, clockwise. */
  leanDeg: 1.13,
  /** Stroke width of the end card's lines. */
  endCardStroke: 52,
  /** Lighter stroke the commercial opens with; grows to endCardStroke. */
  openingStroke: 22,
  /** Centre dash pattern, measured from the end card. */
  dashLength: 216,
  dashGap: 196,
  /** Where an end-card dash begins (y, 1080 space) once the card is static. */
  endCardDashPhase: 183,
} as const;
