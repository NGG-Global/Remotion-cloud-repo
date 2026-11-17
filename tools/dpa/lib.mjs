/**
 * Shared helpers for the Dark Pictures documentary tools.
 *
 * The frame arithmetic here mirrors src/dpa/edl.ts. Keep the two in step: the
 * prepared clips are cut to these frame counts and the composition plays them
 * back without seeking.
 */
import { execFile, execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const EDL_PATH = path.join(ROOT, "src/dpa/data/edl.json");
export const CLIPS_PATH = path.join(ROOT, "src/dpa/data/clips.json");
export const FOOTAGE_DIR = path.join(ROOT, "footage/dpa");
export const CLIP_DIR = path.join(ROOT, "public/dpa/clips");
export const OUT_DIR = path.join(ROOT, "out/dpa");

export const TRANSITION_FRAMES = { cut: 0, dissolve: 12, fade: 15 };

export const exec = promisify(execFile);

export const sha = (value) =>
  crypto.createHash("sha1").update(value).digest("hex").slice(0, 10);

export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

export const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
};

/** Loads the EDL and resolves every shot to frames. */
export const loadEdl = () => {
  const edl = readJson(EDL_PATH);
  const total = Math.ceil(edl.duration * edl.fps);
  const frame = (seconds) => Math.round(seconds * edl.fps);
  const shots = edl.shots.map((shot, i) => {
    const next = edl.shots[i + 1];
    const from = frame(shot.start);
    const to = next ? frame(next.start) : total;
    const frames = shot.transitionFrames ?? TRANSITION_FRAMES[shot.transition];
    const lead = shot.transition === "dissolve" ? Math.min(frames, from) : 0;
    return { ...shot, from, to, mount: from - lead, lead };
  });
  return { ...edl, total, shots };
};

/**
 * Structural checks on the EDL. Returns a list of problems; empty means the
 * timeline is contiguous, covers the whole narration and is fully sourced.
 */
export const validateEdl = (edl, { allowPending = false } = {}) => {
  const problems = [];
  const { shots } = edl;
  if (!shots.length) {
    return ["The EDL has no shots."];
  }
  if (shots[0].start !== 0) {
    problems.push(`First shot starts at ${shots[0].start}s, not 0.`);
  }
  const last = shots[shots.length - 1];
  if (Math.abs(last.end - edl.duration) > 0.05) {
    problems.push(
      `Last shot ends at ${last.end}s but the narration runs ${edl.duration}s.`,
    );
  }
  const ids = new Set();
  shots.forEach((shot, i) => {
    if (ids.has(shot.id)) {
      problems.push(`Duplicate shot id ${shot.id}.`);
    }
    ids.add(shot.id);
    const next = shots[i + 1];
    if (next && Math.abs(shot.end - next.start) > 1e-6) {
      problems.push(
        `${shot.id} ends at ${shot.end}s but ${next.id} starts at ${next.start}s.`,
      );
    }
    if (shot.to - shot.from < 15) {
      problems.push(`${shot.id} is shorter than half a second.`);
    }
    if (!(shot.transition in TRANSITION_FRAMES)) {
      problems.push(`${shot.id} has unknown transition "${shot.transition}".`);
    }
    if (shot.source === null || shot.in === null) {
      if (!allowPending) {
        problems.push(`${shot.id} has no source footage (${shot.need}).`);
      }
    } else if (!fs.existsSync(path.join(FOOTAGE_DIR, shot.source))) {
      problems.push(`${shot.id}: source file not found: ${shot.source}`);
    } else if (shot.in - shot.lead / edl.fps < 0) {
      problems.push(`${shot.id}: in-point leaves no room for its dissolve.`);
    }
  });

  // The same stretch of source footage must not appear twice.
  const used = shots
    .filter((shot) => shot.source !== null && shot.in !== null)
    .map((shot) => ({
      id: shot.id,
      source: shot.source,
      a: shot.in - shot.lead / edl.fps,
      b: shot.in + (shot.to - shot.from) / edl.fps,
    }))
    .sort((x, y) => x.source.localeCompare(y.source) || x.a - y.a);
  for (let i = 1; i < used.length; i++) {
    const prev = used[i - 1];
    const cur = used[i];
    if (prev.source === cur.source && cur.a < prev.b - 0.2) {
      problems.push(
        `${prev.id} and ${cur.id} reuse the same footage (${cur.source} ` +
          `${cur.a.toFixed(1)}-${Math.min(prev.b, cur.b).toFixed(1)}s).`,
      );
    }
  }
  return problems;
};

export const probe = (file) => {
  const raw = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      file,
    ],
    { encoding: "utf8" },
  );
  const info = JSON.parse(raw);
  const video = info.streams.find((s) => s.codec_type === "video");
  const audio = info.streams.find((s) => s.codec_type === "audio");
  const rate = (value) => {
    const [n, d] = (value ?? "0/1").split("/").map(Number);
    return d ? n / d : 0;
  };
  return {
    duration: Number(info.format.duration),
    size: Number(info.format.size),
    bitrate: Number(info.format.bit_rate),
    video: video && {
      codec: video.codec_name,
      width: video.width,
      height: video.height,
      fps: Number(rate(video.avg_frame_rate).toFixed(3)),
      frames: Number(video.nb_frames) || null,
      pixFmt: video.pix_fmt,
      colorSpace: video.color_space ?? null,
      colorRange: video.color_range ?? null,
      duration: Number(video.duration) || null,
    },
    audio: audio && {
      codec: audio.codec_name,
      sampleRate: Number(audio.sample_rate),
      channels: audio.channels,
      duration: Number(audio.duration) || null,
    },
  };
};

/** Runs async jobs with a fixed number in flight. */
export const pool = async (items, limit, worker) => {
  let cursor = 0;
  const run = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
};

export const timecode = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
};
