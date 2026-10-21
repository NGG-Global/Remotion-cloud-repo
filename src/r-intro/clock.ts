import { EP, type RBeatId } from "./script";
import { sec } from "./theme";

/**
 * Frame offsets inside a scene. A scene starts at one beat; `t("x")` gives the
 * frame, relative to the scene's first frame, at which beat `x` begins. Scenes
 * never hold absolute seconds, so moving a scene cannot desynchronise it.
 */
export const sceneClock = (start: RBeatId) => {
  const origin = EP.at(start);
  return {
    t: (id: RBeatId) => sec(EP.at(id) - origin),
    /** Frame offset `delta` seconds after beat `id` begins. */
    after: (id: RBeatId, delta: number) => sec(EP.at(id) - origin + delta),
  };
};

export type SceneClock = ReturnType<typeof sceneClock>;
