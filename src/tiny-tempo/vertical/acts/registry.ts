import { BubbleTall } from "./BubbleTall";
import { BugTall } from "./BugTall";
import { HammerTall } from "./HammerTall";
import { PaperTall } from "./PaperTall";
import { TomatoTall } from "./TomatoTall";
import { WindowTall } from "./WindowTall";
import type { ActEntry } from "./types";

/**
 * The acts the ad shows, in the order the game's own registry lists them.
 *
 * The game ships seventeen and assigns them to levels by registry order, so the ad
 * takes a spread rather than the first six: a workshop act, two kitchen-and-home
 * acts, the one that ends with something made, and the two with the strongest
 * silhouettes. Titles and lines are the vignettes' own copy.
 */
export const ACTS: readonly ActEntry[] = [
  {
    id: "hammer",
    title: "Hammer & nail",
    line: "Make it stick.",
    paper: "#eee8d8",
    Graphic: HammerTall,
  },
  {
    id: "window",
    title: "Window cleaning",
    line: "A clearer view.",
    paper: "#e9e4e7",
    Graphic: WindowTall,
  },
  {
    id: "bug",
    title: "Bug & shoe",
    line: "Watch your step.",
    paper: "#e4e7ce",
    Graphic: BugTall,
  },
  {
    id: "tomato",
    title: "Knife & tomato",
    line: "Mind your fingers.",
    paper: "#f6f7f2",
    Graphic: TomatoTall,
  },
  {
    id: "paper",
    title: "Scissors & paper",
    line: "A little paper magic.",
    paper: "#eee8d8",
    Graphic: PaperTall,
  },
  {
    id: "bubble",
    title: "Bubble wrap",
    line: "One more pop.",
    paper: "#e5eee6",
    Graphic: BubbleTall,
  },
];

export const actById = (id: string): ActEntry => {
  const found = ACTS.filter((act) => act.id === id)[0];
  if (!found) throw new Error(`Unknown act: ${id}`);
  return found;
};
