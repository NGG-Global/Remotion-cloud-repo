/**
 * The trailer's tokens, derived from Tiny Tempo rather than invented beside it.
 *
 * Colours and faces come from the game's own palette (`../tiny-tempo/theme`, a copy of
 * `src/config/theme.ts` and `ui/light.ts` in the game). The metrics below are the
 * workshop treatment's — outline 7, radius 18, hard one-light depth — scaled from the
 * game's 720-unit design width to the trailer's pixels.
 */
export { BODY, DISPLAY, faces, mix, shade, TT } from "../tiny-tempo/theme";

/** The game's panel metrics, at the trailer's scale: a design unit is ~1.6 px on a 1080p canvas. */
export const PANEL = {
  /** `WORKSHOP_TREATMENT.radius` 18 → px. */
  radius: 30,
  /** `WORKSHOP_TREATMENT.outline` 7 → px. */
  outline: 10,
  /** The hard, unblurred thickness every slab and puck in the game carries. */
  depth: 14,
} as const;

export const SPACE = {
  /** Side gutter on the 16:9 canvas. */
  gutterWide: 96,
  /** Side gutter on the 9:16 canvas: the game's own `screenPadding` feel on a phone. */
  gutterTall: 64,
} as const;

/** Type scale. The display face is Fredoka 700, the game's; labels are Nunito 800. */
export const TYPE = {
  stampWide: 132,
  stampTall: 128,
  stampSmall: 84,
  chip: 34,
  cta: 64,
} as const;

/** The game's letter: cream on an ink stroke with a close hard drop — `ui/type.ts`'s dressed display text. */
export const letterStyle = (size: number, fill: string, stroke: string) => ({
  fontFamily: "Fredoka",
  fontWeight: 700,
  fontSize: size,
  lineHeight: 0.92,
  letterSpacing: "-0.025em",
  color: fill,
  WebkitTextStroke: `${Math.max(3, size * 0.06)}px ${stroke}`,
  paintOrder: "stroke fill" as const,
  textShadow: `0 ${Math.max(2, size * 0.065)}px 0 ${stroke}`,
});
