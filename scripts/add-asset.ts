/**
 * Register a local asset in src/assets/file-assets.ts.
 *
 * The caller must already have the right to commit the file. This script
 * downloads a single https URL when one is provided. It does not scrape a
 * site, and it records license "unknown" unless you pass --license.
 *
 *   npm run asset:add -- \
 *     --id porch-light \
 *     --type prop \
 *     --file ./porch-light.svg \
 *     --description "A porch light." \
 *     --creator "Project original" \
 *     --license Original \
 *     --tags light,house \
 *     --width 120 \
 *     --height 180
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CHARACTER_ACTIONS } from "../src/assets/actions";

type Args = Record<string, string | boolean>;

const GROUPS = {
  background: "backgrounds",
  prop: "props",
  lottie: "lottie",
  rive: "rive",
  overlay: "overlays",
  texture: "textures",
  audio: "audio",
  video: "videos",
  character: "characters",
} as const;

type AssetType = keyof typeof GROUPS;

const usage = () => {
  console.log(`Usage: npm run asset:add -- --id <id> --type <type> --description <text> (--file <path> | --url <https>) [options]

Types: ${Object.keys(GROUPS).join(", ")}

Options:
  --creator <name>         Default: unknown
  --license <name>         Default: unknown. Do not guess.
  --license-notes <text>
  --source-url <https>
  --tags <a,b,c>
  --width <px> --height <px>
  --dest <public/...>
  --artboard <name>        Rive / Rive characters
  --animations <a,b>       Lottie, Rive, or character actions
  --state-machines <a,b>
  --costume civilian|police
  --dry-run                Print the entry and do not write
`);
};

const parseArgs = (argv: string[]): Args => {
  const args: Args = {};
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (!token?.startsWith("--")) {
      throw new Error(`Unexpected argument "${token ?? ""}".`);
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
};

const flag = (args: Args, key: string): string | undefined => {
  const value = args[key];
  return typeof value === "string" ? value : undefined;
};

const required = (args: Args, key: string): string => {
  const value = flag(args, key);
  if (!value) {
    throw new Error(`Missing --${key}.`);
  }
  return value;
};

const camel = (id: string): string =>
  id.replace(/-([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());

const list = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const quote = (value: string): string => JSON.stringify(value);

const assertHttps = (raw: string, label: string): URL => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} is not a URL: ${raw}`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${label} must be an https URL.`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} must not include credentials.`);
  }
  return url;
};

const download = async (url: URL, destination: string) => {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status} for ${url.href}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new Error(
      "URL returned HTML, not an asset file. Pass a direct file URL.",
    );
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error("Downloaded file is empty.");
  }
  if (bytes.length > 25 * 1024 * 1024) {
    throw new Error("Refusing a download larger than 25 MB.");
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
};

const extensionOf = (filePath: string): string =>
  path.extname(filePath).toLowerCase();

const readLottieSize = (
  filePath: string,
): { width: number; height: number } => {
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Lottie file is not a JSON object.");
  }
  const data = parsed as { w?: unknown; h?: unknown; layers?: unknown };
  if (
    typeof data.w !== "number" ||
    typeof data.h !== "number" ||
    !Array.isArray(data.layers)
  ) {
    throw new Error("Lottie file is missing w, h, or layers.");
  }
  return { width: data.w, height: data.h };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || process.argv.length <= 2) {
    usage();
    if (args.help) {
      return;
    }
    process.exitCode = 1;
    return;
  }

  const id = required(args, "id");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error("--id must be kebab-case, for example wooden-table.");
  }
  const type = required(args, "type") as AssetType;
  if (!(type in GROUPS)) {
    throw new Error(`Unknown --type "${type}".`);
  }
  const description = required(args, "description");
  const creator = flag(args, "creator") ?? "unknown";
  const license = flag(args, "license") ?? "unknown";
  const licenseNotes = flag(args, "license-notes");
  const sourceUrl = flag(args, "source-url");
  if (sourceUrl) {
    assertHttps(sourceUrl, "--source-url");
  }
  const tags = list(flag(args, "tags"));
  const animations = list(flag(args, "animations"));
  const stateMachines = list(flag(args, "state-machines"));
  const dryRun = args["dry-run"] === true;
  const group = GROUPS[type];
  const key = camel(id);

  const registryPath = path.resolve("src/assets/file-assets.ts");
  const registry = fs.readFileSync(registryPath, "utf8");
  if (registry.includes(`id: "${id}"`)) {
    throw new Error(
      `Asset id "${id}" is already in src/assets/file-assets.ts.`,
    );
  }
  if (new RegExp(`\\n\\s*${key}:\\s*\\{`).test(registry)) {
    throw new Error(`Registry key "${key}" already exists.`);
  }

  const fileArg = flag(args, "file");
  const urlArg = flag(args, "url");
  if (!fileArg && !urlArg) {
    throw new Error("Pass --file or --url.");
  }
  if (fileArg && urlArg) {
    throw new Error("Pass only one of --file or --url.");
  }

  let extension = fileArg
    ? extensionOf(fileArg)
    : extensionOf(new URL(urlArg ?? "").pathname);
  if (!extension) {
    throw new Error(
      "Could not determine a file extension. Name the file with one.",
    );
  }
  const destination =
    flag(args, "dest") ??
    path.posix.join("public/assets", group, `${id}${extension}`);
  if (!destination.startsWith("public/") || destination.includes("..")) {
    throw new Error("--dest must be a relative path inside public/.");
  }
  extension = extensionOf(destination);

  if (!dryRun) {
    if (urlArg) {
      const url = assertHttps(urlArg, "--url");
      await download(url, destination);
    } else if (fileArg) {
      if (!fs.existsSync(fileArg)) {
        throw new Error(`--file does not exist: ${fileArg}`);
      }
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(fileArg, destination);
    }
  }

  const localFile = dryRun ? fileArg : destination;
  let width = flag(args, "width");
  let height = flag(args, "height");
  if (type === "lottie" && localFile && fs.existsSync(localFile)) {
    const size = readLottieSize(localFile);
    width = width ?? String(size.width);
    height = height ?? String(size.height);
  }
  if (type !== "audio" && (!width || !height)) {
    throw new Error("Pass --width and --height (Lottie files can omit them).");
  }
  const widthNumber = width ? Number(width) : null;
  const heightNumber = height ? Number(height) : null;
  if (
    (widthNumber !== null && !(widthNumber > 0)) ||
    (heightNumber !== null && !(heightNumber > 0))
  ) {
    throw new Error("--width and --height must be positive numbers.");
  }
  const aspect =
    widthNumber && heightNumber ? String(widthNumber / heightNumber) : "null";
  const src = destination.replace(/^public\//, "");

  const shared = [
    `id: ${quote(id)}`,
    `type: ${quote(type === "character" ? "character" : type === "background" ? "background" : type === "prop" ? "prop" : type === "lottie" ? "lottie" : type === "rive" ? "rive" : type === "overlay" ? "overlay" : type === "texture" ? "texture" : type === "audio" ? "audio" : "video")}`,
  ];

  const attribution = `attribution: { creator: ${quote(creator)}${sourceUrl ? `, sourceUrl: ${quote(sourceUrl)}` : ""} }`;
  const licenseField = `license: { name: ${quote(license)}${licenseNotes ? `, notes: ${quote(licenseNotes)}` : ""} }`;
  const tail = [
    `tags: [${tags.map(quote).join(", ")}]`,
    `description: ${quote(description)}`,
    `variants: []`,
    attribution,
    licenseField,
    `optional: false`,
  ];

  let body: string[];
  if (type === "audio") {
    body = [
      ...shared,
      `renderer: "audio"`,
      `src: ${quote(src)}`,
      `width: null`,
      `height: null`,
      `aspectRatio: null`,
      ...tail,
    ];
  } else if (type === "lottie") {
    body = [
      ...shared,
      `renderer: "lottie"`,
      `src: ${quote(src)}`,
      `width: ${widthNumber}`,
      `height: ${heightNumber}`,
      `aspectRatio: ${aspect}`,
      `anchor: "center"`,
      `defaultScale: 1`,
      `animations: [${(animations.length > 0 ? animations : ["play"]).map(quote).join(", ")}]`,
      `placement: "fullscreen"`,
      `defaultLoop: true`,
      ...tail,
    ];
  } else if (type === "rive" || type === "character") {
    const artboard = required(args, "artboard");
    if (animations.length === 0) {
      throw new Error(
        "Pass --animations with the linear animation names from the .riv file.",
      );
    }
    if (type === "character") {
      const costume = flag(args, "costume") ?? "civilian";
      if (costume !== "civilian" && costume !== "police") {
        throw new Error('--costume must be "civilian" or "police".');
      }
      const unknown = animations.filter(
        (name) => !(CHARACTER_ACTIONS as readonly string[]).includes(name),
      );
      if (unknown.length > 0) {
        throw new Error(
          `Unknown character actions: ${unknown.join(", ")}. Known actions: ${CHARACTER_ACTIONS.join(", ")}`,
        );
      }
      body = [
        `id: ${quote(id)}`,
        `type: "character"`,
        `renderer: "rive"`,
        `costume: ${quote(costume)}`,
        `src: ${quote(src)}`,
        `width: ${widthNumber}`,
        `height: ${heightNumber}`,
        `aspectRatio: ${aspect}`,
        `anchor: "bottom-center"`,
        `defaultScale: 1`,
        `actions: [${animations.map(quote).join(", ")}]`,
        `animations: [${animations.map(quote).join(", ")}]`,
        `states: []`,
        `artboard: ${quote(artboard)}`,
        `stateMachines: [${stateMachines.map(quote).join(", ")}]`,
        ...tail,
      ];
    } else {
      body = [
        ...shared,
        `renderer: "rive"`,
        `src: ${quote(src)}`,
        `width: ${widthNumber}`,
        `height: ${heightNumber}`,
        `aspectRatio: ${aspect}`,
        `anchor: "center"`,
        `defaultScale: 1`,
        `artboard: ${quote(artboard)}`,
        `animations: [${animations.map(quote).join(", ")}]`,
        `stateMachines: [${stateMachines.map(quote).join(", ")}]`,
        `placement: "anchored"`,
        ...tail,
      ];
    }
  } else {
    const renderer = type === "video" ? "video" : "image";
    const anchor = type === "prop" ? "bottom-center" : "center";
    body = [
      ...shared,
      `renderer: ${quote(renderer)}`,
      `src: ${quote(src)}`,
      `width: ${widthNumber}`,
      `height: ${heightNumber}`,
      `aspectRatio: ${aspect}`,
      `anchor: ${quote(anchor)}`,
      `defaultScale: 1`,
      ...tail,
    ];
  }

  const marker = `// @insert ${group}`;
  if (!registry.includes(marker)) {
    throw new Error(`Missing marker "${marker}" in src/assets/file-assets.ts.`);
  }
  const objectKey = type === "character" ? key : key;
  const printed = `  ${objectKey}: {\n    ${body.join(",\n    ")},\n  },\n  ${marker}`;
  if (dryRun) {
    console.log(printed);
    console.log("\nDry run: no files were written.");
    return;
  }
  const next = registry.replace(marker, printed);
  fs.writeFileSync(registryPath, next);
  const formatted = spawnSync("npx", ["prettier", "--write", registryPath], {
    stdio: "inherit",
  });
  if (formatted.status !== 0) {
    throw new Error("prettier failed while formatting the registry.");
  }
  console.log(`Registered ${id} at public/${src}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
