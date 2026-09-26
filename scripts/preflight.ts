import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PLAYGROUND_STILLS } from "../src/assets/playground-frames";

const run = (command: string, args: string[]) => {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\nPreflight failed at: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
};

const outputDir = path.resolve("out/preflight");
fs.mkdirSync(outputDir, { recursive: true });

run("npx", ["tsc", "--noEmit", "--pretty", "false"]);
run("npx", ["tsx", "scripts/validate-assets.ts"]);
run("npx", ["eslint", "src"]);
run("npx", ["remotion", "compositions"]);

for (const still of PLAYGROUND_STILLS) {
  run("npx", [
    "remotion",
    "still",
    "AssetPlayground",
    path.join(outputDir, `playground-${still.name}.png`),
    `--frame=${still.frame}`,
  ]);
}

run("npx", [
  "remotion",
  "still",
  "AssetSceneDemo",
  path.join(outputDir, "asset-scene-demo.png"),
  "--frame=70",
]);

run("npx", [
  "remotion",
  "still",
  "TitleCard",
  path.join(outputDir, "title-card.png"),
  "--frame=30",
]);

console.log(`\nPreflight passed. Stills are in ${outputDir}`);
