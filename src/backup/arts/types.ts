import { Zone } from "../engine/layout";
import { Scene } from "../timeline";
import { ToneColors } from "../theme";

/**
 * Every illustration gets the scene (to find the instant a word is said),
 * the time, the current tone and the part of the frame it owns. Times are
 * absolute seconds in the narration, so an illustration can key any event
 * to a spoken word with `scene.t(cardId, wordIndex)`.
 */
export type ArtProps = {
  readonly scene: Scene;
  readonly now: number;
  readonly tone: ToneColors;
  readonly zone: Zone;
};

export type Art = React.FC<ArtProps>;
