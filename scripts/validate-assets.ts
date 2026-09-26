import fs from "node:fs";
import path from "node:path";
import {
  CHARACTER_ACTIONS,
  IMPLEMENTED_VECTOR_ACTIONS,
} from "../src/assets/actions";
import { inspectLottie } from "../src/assets/lottie-json";
import { ASSETS } from "../src/assets/registry";

type Problem = {
  readonly level: "error" | "warning";
  readonly message: string;
};

const PUBLIC_ROOT = path.resolve("public");
const EXTENSIONS: Record<string, readonly string[]> = {
  background: [".svg", ".png", ".webp", ".jpg", ".jpeg"],
  prop: [".svg", ".png", ".webp", ".jpg", ".jpeg"],
  overlay: [".svg", ".png", ".webp", ".jpg", ".jpeg"],
  texture: [".svg", ".png", ".webp", ".jpg", ".jpeg"],
  lottie: [".json"],
  rive: [".riv"],
  animation: [".png", ".webp", ".svg", ".json"],
  character: [".riv", ".svg", ".png", ".webp"],
  audio: [".mp3", ".wav", ".aac", ".m4a"],
  video: [".mp4", ".webm", ".mov"],
};

type LooseAsset = {
  readonly id?: string;
  readonly type?: string;
  readonly renderer?: string;
  readonly src?: string | null;
  readonly sources?: readonly string[];
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly license?: { readonly name?: string };
  readonly attribution?: { readonly creator?: string };
  readonly width?: number | null;
  readonly height?: number | null;
  readonly actions?: readonly string[];
  readonly animations?: readonly string[];
  readonly stateMachines?: readonly string[];
  readonly optional?: boolean;
  readonly artboard?: string;
};

const problems: Problem[] = [];

const fail = (message: string) => {
  problems.push({ level: "error", message });
};

const warn = (message: string) => {
  problems.push({ level: "warning", message });
};

const sameMembers = (
  left: readonly string[],
  right: readonly string[],
): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item) => right.includes(item));
};

const exactPublicFile = (
  relativePath: string,
  label: string,
  required: boolean,
): fs.Stats | null => {
  if (relativePath.includes("..") || path.isAbsolute(relativePath)) {
    fail(`${label} path must stay inside public/: ${relativePath}`);
    return null;
  }
  const parts = relativePath.split("/").filter((part) => part.length > 0);
  let current = PUBLIC_ROOT;
  for (const part of parts) {
    let entries: string[];
    try {
      entries = fs.readdirSync(current);
    } catch {
      fail(
        `${label} directory is missing: ${path.relative(PUBLIC_ROOT, current)}`,
      );
      return null;
    }
    const exact = entries.find((entry) => entry === part);
    if (!exact) {
      const folded = entries.find(
        (entry) => entry.toLowerCase() === part.toLowerCase(),
      );
      if (folded) {
        fail(
          `${label} case-sensitive path mismatch: expected "${part}" but found "${folded}" in ${path.relative(process.cwd(), current)}`,
        );
      } else if (required) {
        fail(`${label} file is missing: public/${relativePath}`);
      } else {
        warn(
          `${label} is optional and missing: public/${relativePath}. Render will use a placeholder.`,
        );
      }
      return null;
    }
    current = path.join(current, exact);
  }
  const stats = fs.statSync(current);
  if (!stats.isFile()) {
    fail(`${label} is not a file: public/${relativePath}`);
    return null;
  }
  if (stats.size === 0) {
    fail(`${label} is zero bytes: public/${relativePath}`);
    return null;
  }
  return stats;
};

const checkMagic = (relativePath: string, label: string) => {
  const absolute = path.join(PUBLIC_ROOT, relativePath);
  const bytes = fs.readFileSync(absolute);
  const ext = path.extname(relativePath).toLowerCase();
  const text = bytes.subarray(0, 80).toString("utf8").trimStart();
  if (ext === ".svg" && !text.startsWith("<") && !text.startsWith("<?xml")) {
    fail(`${label} does not look like SVG: public/${relativePath}`);
  }
  if (ext === ".png" && bytes.subarray(0, 4).toString("hex") !== "89504e47") {
    fail(`${label} does not look like a PNG: public/${relativePath}`);
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      fail(`${label} does not look like a JPEG: public/${relativePath}`);
    }
  }
  if (ext === ".webp" && bytes.subarray(0, 4).toString("utf8") !== "RIFF") {
    fail(`${label} does not look like a WebP: public/${relativePath}`);
  }
  if (ext === ".riv" && bytes.subarray(0, 4).toString("utf8") !== "RIVE") {
    fail(`${label} does not look like a Rive file: public/${relativePath}`);
  }
  if (ext === ".json") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(bytes.toString("utf8"));
    } catch (error) {
      fail(
        `${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }
    if (relativePath.includes("/lottie/") || label.includes("lottie")) {
      const inspection = inspectLottie(parsed);
      if (!inspection.ok) {
        fail(`${label} ${inspection.reason}: public/${relativePath}`);
      }
    }
  }
};

const checkFile = (
  relativePath: string,
  assetType: string,
  label: string,
  required: boolean,
) => {
  const allowed = EXTENSIONS[assetType];
  const ext = path.extname(relativePath).toLowerCase();
  if (!allowed) {
    fail(`${label} has unknown type "${assetType}"`);
    return;
  }
  if (!allowed.includes(ext)) {
    fail(
      `${label} extension ${ext || "(none)"} is not allowed for ${assetType}. Allowed: ${allowed.join(", ")}`,
    );
    return;
  }
  const stats = exactPublicFile(relativePath, label, required);
  if (!stats) {
    return;
  }
  checkMagic(relativePath, label);
};

const seenIds = new Map<string, string>();

const checkAsset = (group: string, value: unknown) => {
  const asset = value as LooseAsset;
  const id = asset.id ?? "(missing id)";
  const label = `${group}.${id}`;
  if (!asset.id || asset.id.trim() !== asset.id || asset.id.length === 0) {
    fail(`${label} is missing an id`);
  }
  if (!asset.description || asset.description.trim().length === 0) {
    fail(`${label} is missing a description`);
  }
  if (!Array.isArray(asset.tags)) {
    fail(`${label} tags must be an array`);
  }
  if (!asset.license?.name || asset.license.name.trim().length === 0) {
    fail(
      `${label} is missing license.name. Use "unknown" when the license is not known.`,
    );
  }
  if (
    !asset.attribution?.creator ||
    asset.attribution.creator.trim().length === 0
  ) {
    fail(
      `${label} is missing attribution.creator. Use "unknown" when the creator is not known.`,
    );
  }
  if (asset.optional !== undefined && typeof asset.optional !== "boolean") {
    fail(`${label} optional must be a boolean`);
  }

  const signature = JSON.stringify(value);
  if (asset.id) {
    const previous = seenIds.get(asset.id);
    if (previous && previous !== signature) {
      fail(`${label} reuses id "${asset.id}" with different metadata`);
    } else if (!previous) {
      seenIds.set(asset.id, signature);
    }
  }

  const required = asset.optional !== true;
  const renderer = asset.renderer ?? "";
  const srcFree = renderer === "vector" || renderer === "procedural-door";
  if (srcFree) {
    if (asset.src) {
      fail(`${label} is drawn in code and must not set src`);
    }
  } else if (!asset.src) {
    fail(`${label} is missing src`);
  } else {
    checkFile(asset.src, asset.type ?? group, label, required);
  }

  for (const extra of asset.sources ?? []) {
    checkFile(
      extra,
      asset.type === "animation" ? "animation" : (asset.type ?? group),
      `${label} source`,
      required,
    );
  }

  if (asset.type !== "audio") {
    if (typeof asset.width !== "number" || asset.width <= 0) {
      fail(`${label} needs a positive width`);
    }
    if (typeof asset.height !== "number" || asset.height <= 0) {
      fail(`${label} needs a positive height`);
    }
  }

  if (asset.type === "character") {
    const actions = asset.actions ?? [];
    if (actions.length === 0) {
      fail(`${label} declares no actions`);
    }
    const duplicates = actions.filter(
      (action, index) => actions.indexOf(action) !== index,
    );
    if (duplicates.length > 0) {
      fail(`${label} repeats actions: ${duplicates.join(", ")}`);
    }
    for (const action of actions) {
      if (!(CHARACTER_ACTIONS as readonly string[]).includes(action)) {
        fail(`${label} action "${action}" is not a known character action`);
      }
    }
    if (renderer === "vector") {
      for (const action of actions) {
        if (
          !(IMPLEMENTED_VECTOR_ACTIONS as readonly string[]).includes(action)
        ) {
          fail(
            `${label} action "${action}" is not implemented by the vector rig`,
          );
        }
      }
    }
    if (renderer === "rive") {
      const animations = asset.animations ?? [];
      for (const action of actions) {
        if (!animations.includes(action)) {
          fail(
            `${label} action "${action}" is not one of the Rive animations (${animations.join(", ") || "none"})`,
          );
        }
      }
    }
  }

  if (renderer === "rive" || renderer === "lottie") {
    const animations = asset.animations ?? [];
    if (animations.length === 0) {
      fail(`${label} must declare at least one animation name`);
    }
    const duplicates = animations.filter(
      (name, index) => animations.indexOf(name) !== index,
    );
    if (duplicates.length > 0) {
      fail(`${label} repeats animation names: ${duplicates.join(", ")}`);
    }
    for (const name of animations) {
      if (name.trim().length === 0) {
        fail(`${label} has an empty animation name`);
      }
    }
  }
};

const groups: ReadonlyArray<readonly [string, object]> = [
  ["characters", ASSETS.characters],
  ["backgrounds", ASSETS.backgrounds],
  ["props", ASSETS.props],
  ["animations", ASSETS.animations],
  ["rive", ASSETS.rive],
  ["lottie", ASSETS.lottie],
  ["textures", ASSETS.textures],
  ["overlays", ASSETS.overlays],
  ["audio", ASSETS.audio],
  ["videos", ASSETS.videos],
];

if (!sameMembers(CHARACTER_ACTIONS, IMPLEMENTED_VECTOR_ACTIONS)) {
  fail(
    "CHARACTER_ACTIONS and IMPLEMENTED_VECTOR_ACTIONS have drifted. The vector rig must implement every named action, or the action must be removed from the vocabulary.",
  );
}

for (const [group, table] of groups) {
  for (const asset of Object.values(table)) {
    checkAsset(group, asset);
  }
}

const usesRive =
  Object.values(ASSETS.rive).length > 0 ||
  Object.values(ASSETS.characters).some((asset) => asset.renderer === "rive");
if (usesRive) {
  const wasm = exactPublicFile("assets/rive/rive.wasm", "Rive runtime", true);
  if (wasm) {
    const bytes = fs.readFileSync(
      path.join(PUBLIC_ROOT, "assets/rive/rive.wasm"),
    );
    if (bytes.subarray(0, 4).toString("utf8") !== "\0asm") {
      fail("public/assets/rive/rive.wasm is not a wasm binary");
    }
  }
}

const errors = problems.filter((problem) => problem.level === "error");
const warnings = problems.filter((problem) => problem.level === "warning");

if (warnings.length > 0) {
  console.log(`Asset validation warnings (${warnings.length}):`);
  for (const warning of warnings) {
    console.log(`  - ${warning.message}`);
  }
}

if (errors.length > 0) {
  console.error(`Asset validation failed (${errors.length}):`);
  for (const error of errors) {
    console.error(`  - ${error.message}`);
  }
  process.exit(1);
}

console.log(`Asset validation passed (${seenIds.size} ids).`);
