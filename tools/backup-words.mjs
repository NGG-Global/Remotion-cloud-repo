/**
 * Prints the spoken word sequence of the backup video as JSON, card by card,
 * for tools/backup-align.py. Reads src/backup/data/script.ts directly (Node
 * strips the type annotations), so the aligner and the video can never
 * disagree about which word comes next.
 */
import { SCENES } from "../src/backup/data/script.ts";

const tokens = (text) =>
  text
    .split(/\s+/)
    .filter((t) => t && t !== "/")
    .map((t) => t.replace(/[*^]/g, ""));

const cards = SCENES.flatMap((scene) =>
  scene.cards.map((card) => ({ id: card.id, words: tokens(card.text) })),
);
process.stdout.write(JSON.stringify(cards));
