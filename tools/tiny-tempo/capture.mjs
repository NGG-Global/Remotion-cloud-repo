#!/usr/bin/env node
/*
 * Records genuine Tiny Tempo gameplay for the launch trailer, from the game itself.
 *
 * Runs the game's own Vite dev build in headless Chromium on a virtual clock — the same
 * technique as the game's `scripts/capture-acts.mjs`: Playwright's fake timers drive
 * `performance.now` and `requestAnimationFrame`, `AudioContext.currentTime` reads the same
 * clock, and every frame is stepped exactly 1/30 s before it is screenshotted. Nothing is
 * mocked: the level, the judge, the verdicts and the result plaque are what the shipped
 * game draws for the debug auto-player's taps.
 *
 *   TINY_TEMPO=../TinyTempo node tools/tiny-tempo/capture.mjs            every shot
 *   TINY_TEMPO=../TinyTempo node tools/tiny-tempo/capture.mjs level1 menu  just those
 *
 * Writes public/tiny-tempo/clips/<id>.mp4 (H.264, 30 fps) plus <id>.json with the frame
 * times of every musical event in the clip — demonstration cues and the player's
 * targets — so the edit can cut on the game's own beats.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const GAME = resolve(
  process.env.TINY_TEMPO ?? join(HERE, "..", "..", "..", "TinyTempo"),
);
const OUT = resolve(HERE, "..", "..", "public", "tiny-tempo", "clips");
const FPS = 30;
const DSF = Number(process.env.DSF ?? 3);
/** 9:16 in CSS pixels: the logical game box is then exactly the 720x1280 design box. */
const VIEW = { width: 404, height: 718 };

const require = createRequire(join(GAME, "package.json"));

function ffmpeg(args) {
  const run = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
  if (run.error || run.status !== 0)
    throw new Error(
      `ffmpeg failed: ${run.error?.message ?? `exit ${run.status}`}`,
    );
}

/** Runs in the page before any game code: every clock the game reads becomes one clock. */
function virtualAudioClock(seed) {
  const origin = performance.now();
  Object.defineProperty(BaseAudioContext.prototype, "currentTime", {
    get() {
      return (performance.now() - origin) / 1000;
    },
  });
  Object.defineProperty(BaseAudioContext.prototype, "baseLatency", {
    get() {
      return 0;
    },
  });
  Object.defineProperty(AudioContext.prototype, "outputLatency", {
    get() {
      return 0;
    },
  });
  AudioContext.prototype.getOutputTimestamp = function () {
    return {
      contextTime: this.currentTime,
      performanceTime: performance.now(),
    };
    // Nothing is heard, so nothing is started: a source the game schedules against the
    // virtual clock would sit queued in the real context for ever, and a few thousand of
    // them — six looping stems a level, a voice a beat — brought the renderer down.
    AudioScheduledSourceNode.prototype.start = function () {};
    AudioScheduledSourceNode.prototype.stop = function () {};
  };
  localStorage.setItem(
    "small-acts.teach.v1",
    JSON.stringify({
      seen: true,
      triplet: true,
      sixteenth: true,
      scrapbook: true,
      replayTip: true,
    }),
  );
  localStorage.setItem("small-acts.tutorial.v1", "complete");
  if (seed.progress)
    localStorage.setItem(
      "small-acts.progress.v1",
      JSON.stringify({ version: 1, ...seed.progress }),
    );
  if (seed.settings)
    localStorage.setItem(
      "tiny-tempo.settings.v1",
      JSON.stringify(seed.settings),
    );
}

function hideDebug() {
  const style = document.createElement("style");
  style.textContent =
    "body > div:not(#game-root), button { display: none !important; }";
  document.head.append(style);
  const game = window.__PHASER_GAME__;
  // The debug readout re-rasterises its Text every frame in debug mode — a new texture
  // upload sixty times a second, which the software renderer did not survive for long.
  // Hidden and frozen, it costs nothing.
  const freeze = () => {
    for (const scene of game.scene.getScenes(false)) {
      if (scene.debug && !scene.debug.__frozen) {
        scene.debug.setVisible(false);
        scene.debug.setText = () => scene.debug;
        scene.debug.__frozen = true;
      }
    }
  };
  freeze();
  game.events.on("poststep", freeze);
}

/**
 * Turns scene drawing off or on. While a shot is being fast-forwarded to, nothing has to
 * be drawn: the round controller, the judge and the auto-player all run in `update`.
 */
function setDrawing(on) {
  const game = window.__PHASER_GAME__;
  const scenes = game.scene;
  if (!scenes.__render) scenes.__render = scenes.render;
  scenes.render = on ? scenes.__render : () => {};
}

function playState() {
  const game = window.__PHASER_GAME__;
  const scene = game?.scene
    .getScenes(true)
    .find((active) => active.vignette && active.controller !== undefined);
  const plan = scene?.controller?.plan;
  const active =
    game?.scene.getScenes(true).map((s) => s.sys.settings.key) ?? [];
  return {
    ready: Boolean(scene),
    active,
    id: scene?.definition?.id,
    level: scene?.spec?.level,
    lap: scene?.spec?.lap,
    taskIndex: scene?.taskIndex ?? null,
    tasks: scene?.spec?.tasks?.length ?? null,
    now: scene?.now?.() ?? 0,
    plan: plan
      ? {
          id: plan.id,
          bpm: plan.bpm,
          demo: plan.demo,
          response: plan.response,
          targets: plan.targets,
          cues: plan.cues ?? null,
          start: plan.start,
          end: plan.end,
        }
      : null,
    phase: scene?.controller?.phase ?? null,
    summary: scene?.summaryShown ?? false,
    result: scene?.controller?.result?.accuracy ?? null,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openPage(browser, seed) {
  const page = await browser.newPage({
    viewport: VIEW,
    deviceScaleFactor: DSF,
  });
  page.on("pageerror", (error) =>
    console.error(`  page error: ${error.message}`),
  );
  await page.addInitScript(virtualAudioClock, seed);
  await page.clock.install({ time: new Date("2026-10-03T12:00:00Z") });
  return page;
}

async function boot(page, origin, url) {
  await page.goto(`${origin}${url}`, { waitUntil: "load" });
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 2000);
  const poll = () =>
    page.evaluate(playState).catch(() => ({ ready: false, active: [] }));
  let state = await poll();
  for (
    let i = 0;
    i < 300 && !(state.ready || state.active.includes("menu"));
    i++
  ) {
    await page.clock.runFor(50).catch(() => {});
    await sleep(40);
    state = await poll();
  }
  if (!(state.ready || state.active.includes("menu")))
    throw new Error("the game never came up");
  for (let i = 0; i < 20; i++) {
    await page.clock.runFor(50);
    await sleep(30);
  }
  await page.evaluate(hideDebug);
  return state;
}

/** Steps virtual time in whole milliseconds, frame by frame, so i/FPS is exact. */
const frameStep = (i) =>
  Math.round((i * 1000) / FPS) - Math.round(((i - 1) * 1000) / FPS);

async function advanceUntil(page, predicate, maxMs, stepMs = 50) {
  let state = await page.evaluate(playState);
  for (let t = 0; t < maxMs && !predicate(state); t += stepMs) {
    await page.clock.runFor(stepMs);
    state = await page.evaluate(playState);
  }
  if (!predicate(state)) throw new Error("timed out waiting");
  return state;
}

async function clickReplay(page) {
  return page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "Accurate replay",
    );
    button?.click();
    return Boolean(button);
  });
}

/** A tap on the canvas, in CSS pixels, through the same DOM path the game's own replay uses. */
async function tapCss(page, x, y) {
  await page.evaluate(
    ([x, y]) => {
      const canvas = window.__PHASER_GAME__.canvas;
      const rect = canvas.getBoundingClientRect();
      const options = {
        bubbles: true,
        clientX: rect.left + x,
        clientY: rect.top + y,
        button: 0,
      };
      canvas.dispatchEvent(
        new MouseEvent("mousedown", { ...options, buttons: 1 }),
      );
      canvas.dispatchEvent(
        new MouseEvent("mouseup", { ...options, buttons: 0 }),
      );
    },
    [x, y],
  );
}

/** Hides everything on the play scene that is not the act's own drawing, every frame. */
function hideChrome() {
  const scene = window.__PHASER_GAME__.scene
    .getScenes(true)
    .find((active) => active.vignette);
  const isObject = (value) =>
    value &&
    typeof value === "object" &&
    typeof value.setVisible === "function" &&
    "displayList" in value;
  const isScene = (value) =>
    value && typeof value === "object" && value.sys?.settings !== undefined;
  const acts = () => {
    const keep = new Set();
    const seen = new Set();
    const walk = (value, depth) => {
      if (
        !value ||
        typeof value !== "object" ||
        seen.has(value) ||
        isScene(value) ||
        depth > 5
      )
        return;
      seen.add(value);
      if (isObject(value)) {
        keep.add(value);
        for (const child of value.list ?? []) walk(child, depth + 1);
        return;
      }
      for (const item of Array.isArray(value) ? value : Object.values(value))
        walk(item, depth + 1);
    };
    walk(scene.vignette, 0);
    return keep;
  };
  scene.events.on("postupdate", () => {
    const keep = acts();
    for (const child of scene.children.list)
      if (!keep.has(child)) child.visible = false;
  });
}

/** Hides the menu's controls, leaving the sign and the hammer: the launch card's plate. */
function hideMenuControls() {
  const scene = window.__PHASER_GAME__.scene.getScene("menu");
  const names = [
    "button",
    "buttonSurface",
    "playLabel",
    "tutorialButton",
    "tutorialSurface",
    "tutorialLabel",
    "pucks",
  ];
  scene.events.on("postupdate", () => {
    for (const name of names) scene[name]?.setVisible(false);
  });
}

/**
 * Frame-stepped recording. `shoot` screenshots, `skip` only advances; both step the virtual
 * clock in whole milliseconds so frame i sits at i/FPS. Events are logged in clip seconds.
 */
class Recorder {
  constructor(page, dir) {
    this.page = page;
    this.dir = dir;
    this.id = dir.split("/").pop();
    this.frames = 0;
    this.events = [];
    this.seenPlans = new Set();
    this.t0 = null;
    this.started = Date.now();
  }
  async state() {
    const state = await this.page.evaluate(playState);
    if (this.t0 !== null && state.plan && !this.seenPlans.has(state.plan.id)) {
      this.seenPlans.add(state.plan.id);
      this.events.push({
        kind: "task",
        task: state.taskIndex,
        bpm: state.plan.bpm,
        hits: state.plan.targets.length,
        demo: state.plan.demo - this.t0,
        response: state.plan.response - this.t0,
        end: state.plan.end - this.t0,
        targets: state.plan.targets.map((t) => t - this.t0),
        cues:
          state.plan.cues?.map((c) => ({
            t: c.time - this.t0,
            kind: c.kind,
          })) ?? [],
      });
    }
    if (this.t0 !== null && state.summary && !this.summaryAt) {
      this.summaryAt = state.now - this.t0;
      this.events.push({ kind: "summary", at: this.summaryAt });
    }
    return state;
  }
  /** Advances until `predicate`, in `stepMs` steps, drawing nothing on the way. */
  async skip(predicate, maxMs, stepMs = 50) {
    await this.page.evaluate(setDrawing, false);
    let state = await this.state();
    try {
      for (let t = 0; t < maxMs && !predicate(state); t += stepMs) {
        await this.page.clock.runFor(stepMs);
        state = await this.state();
      }
    } finally {
      await this.page.evaluate(setDrawing, true);
      // One drawn frame, so the canvas is current before anything is shot.
      await this.page.clock.runFor(17);
    }
    if (!predicate(state)) throw new Error("timed out skipping");
    return this.state();
  }
  /** Lands exactly `before` seconds ahead of an instant on the game clock. */
  async landBefore(instantOf, before) {
    let state = await this.state();
    let target = instantOf(state) - before;
    while (state.now < target - 0.0005) {
      await this.page.clock.runFor(
        Math.min(50, Math.max(1, Math.round((target - state.now) * 1000))),
      );
      state = await this.state();
      target = instantOf(state) - before;
    }
    return state;
  }
  async shoot(seconds, { until, clip } = {}) {
    if (process.env.QUICK) seconds = Math.min(seconds, 1);
    const total = this.frames + Math.round(seconds * FPS);
    for (; this.frames < total; this.frames++) {
      if (this.frames > 0) await this.page.clock.runFor(frameStep(this.frames));
      const state = await this.state();
      if (this.t0 === null) {
        this.t0 = state.now;
        await this.state();
      }
      if (until && until(state)) return state;
      await this.page.screenshot({
        path: join(this.dir, `${String(this.frames).padStart(5, "0")}.png`),
        ...(clip ? { clip } : {}),
      });
      if (this.frames % 90 === 0)
        process.stdout.write(
          `    ${this.id}: frame ${this.frames} (${((Date.now() - this.started) / 1000).toFixed(0)} s)\n`,
        );
    }
    return this.state();
  }
}

async function encode(dir, out) {
  ffmpeg([
    "-framerate",
    String(FPS),
    "-i",
    join(dir, "%05d.png"),
    "-vf",
    "format=yuv420p",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "14",
    "-g",
    "15",
    "-tune",
    "animation",
    "-movflags",
    "+faststart",
    "-an",
    out,
  ]);
}

/** Game units to CSS pixels for the 9:16 viewport, whose logical box is the design box. */
const css = (units) => (units * VIEW.width) / 720;

const started = async (page, origin, level) => {
  await boot(page, origin, `/?debug&level=${level}`);
  const before = (await page.evaluate(playState)).plan?.id ?? null;
  if (!(await clickReplay(page)))
    throw new Error("no replay panel; is this the dev build with ?debug?");
  return before;
};

/** A level from its first task: the count-in, every task, and the plaque. */
const wholeLevel =
  (level, { pre = 1.0, tail = 8 } = {}) =>
  async (page, origin, dir) => {
    const before = await started(page, origin, level);
    const rec = new Recorder(page, dir);
    await rec.skip(
      (s) => s.plan && s.plan.id !== before && s.plan.demo - s.now > pre,
      30000,
    );
    await rec.landBefore((s) => s.plan.demo, pre);
    await rec.shoot(240, { until: (s) => s.summary });
    await rec.shoot(tail);
    return rec;
  };

/** From task `index` (0-based) for `seconds`, or through the plaque when `toSummary`. */
const fromTask =
  (level, index, seconds, { pre = 1.0, toSummary = false, tail = 8 } = {}) =>
  async (page, origin, dir) => {
    await started(page, origin, level);
    const rec = new Recorder(page, dir);
    await rec.skip(
      (s) =>
        s.taskIndex >= index &&
        s.plan &&
        s.plan.demo - s.now > pre &&
        s.phase !== "result",
      240000,
    );
    await rec.landBefore((s) => s.plan.demo, pre);
    if (toSummary) {
      await rec.shoot(240, { until: (s) => s.summary });
      await rec.shoot(tail);
    } else await rec.shoot(seconds);
    return rec;
  };

/** One task of an act with the chrome hidden: the demonstration, the answer and the coda. */
const actOnly = (level) => async (page, origin, dir) => {
  const before = await started(page, origin, level);
  await page.evaluate(hideChrome);
  await page.clock.runFor(40);
  const rec = new Recorder(page, dir);
  await rec.skip(
    (s) => s.plan && s.plan.id !== before && s.plan.demo - s.now > 0.3,
    30000,
  );
  await rec.landBefore((s) => s.plan.demo, 0);
  const first = (await rec.state()).plan.demo;
  await rec.shoot(12, {
    until: (s) =>
      s.plan && s.plan.demo > first + 0.1 && s.now >= s.plan.demo - 0.5 / FPS,
    clip: { x: 0, y: 110, width: VIEW.width, height: 360 },
  });
  return rec;
};

const PROGRESS = {
  unlocked: 20,
  best: Object.fromEntries(
    Array.from({ length: 19 }, (_, i) => [
      i + 1,
      [
        94, 88, 97, 91, 86, 99, 90, 93, 84, 96, 89, 92, 87, 95, 90, 83, 98, 91,
        94,
      ][i],
    ]),
  ),
};

const SHOTS = {
  level20: fromTask(20, 4, 0, { toSummary: true }),
  level1: wholeLevel(1),
  level28: fromTask(28, 4, 14),
  level19: fromTask(19, 4, 12),
  level9: fromTask(9, 3, 12),
  level5: fromTask(5, 0, 13),
  menu: async (page, origin, dir) => {
    await boot(page, origin, "/?debug");
    const rec = new Recorder(page, dir);
    await rec.shoot(8);
    return rec;
  },
  menuClean: async (page, origin, dir) => {
    await boot(page, origin, "/?debug");
    await page.evaluate(hideMenuControls);
    await page.clock.runFor(40);
    const rec = new Recorder(page, dir);
    await rec.shoot(8);
    return rec;
  },
  map: Object.assign(
    async (page, origin, dir) => {
      await boot(page, origin, "/?debug");
      const rect = await page.evaluate(() => {
        const r = window.__PHASER_GAME__.scene.getScene("menu").buttonRect;
        return { x: r.centerX, y: r.centerY };
      });
      await tapCss(page, css(rect.x), css(rect.y));
      const rec = new Recorder(page, dir);
      await rec.skip(
        (s) => s.active.includes("map") && !s.active.includes("menu"),
        20000,
      );
      await rec.skip(() => false, 1500).catch(() => {});
      await rec.shoot(6);
      return rec;
    },
    { seed: { progress: PROGRESS } },
  ),
  actBongos: actOnly(23),
  actPopcorn: actOnly(52),
  actBarber: actOnly(51),
  actSlushy: actOnly(24),
  actBell: actOnly(15),
  actDoorbell: actOnly(13),
  actClap: actOnly(21),
  actWindow: actOnly(2),
  actEgg: actOnly(10),
};

async function main() {
  const wanted = process.argv.slice(2);
  const jobs = (wanted.length ? wanted : Object.keys(SHOTS)).map((id) => {
    if (!SHOTS[id])
      throw new Error(
        `no shot called ${id}; known: ${Object.keys(SHOTS).join(", ")}`,
      );
    return id;
  });
  mkdirSync(OUT, { recursive: true });
  const { chromium } = require("playwright");
  const { createServer } = await import(require.resolve("vite"));
  const server = await createServer({
    root: GAME,
    logLevel: "error",
    server: { port: 0, host: "127.0.0.1" },
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const launch = () =>
    chromium.launch({
      ...(process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : {}),
      args: [
        "--autoplay-policy=no-user-gesture-required",
        "--use-gl=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    });
  const workers = Math.min(Number(process.env.WORKERS ?? 3), jobs.length);
  // A browser per worker, never a tab: a background tab pauses the game.
  const browsers = await Promise.all(Array.from({ length: workers }, launch));
  const tmp = mkdtempSync(join(tmpdir(), "tiny-tempo-trailer-"));
  const failed = [];
  const run = async (browser, id) => {
    const dir = join(tmp, id);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir);
    const page = await openPage(browser, SHOTS[id].seed ?? {});
    try {
      const rec = await SHOTS[id](page, origin, dir);
      rec.id = id;
      const out = join(OUT, `${id}.mp4`);
      await encode(dir, out);
      writeFileSync(
        join(OUT, `${id}.json`),
        JSON.stringify(
          {
            fps: FPS,
            frames: rec.frames,
            seconds: rec.frames / FPS,
            events: rec.events,
          },
          null,
          1,
        ),
      );
      console.log(`  ${id}: ${(rec.frames / FPS).toFixed(2)} s -> ${out}`);
    } finally {
      await page.close().catch(() => {});
      if (!process.env.KEEP_FRAMES)
        rmSync(dir, { recursive: true, force: true });
    }
  };
  try {
    console.log(
      `Recording ${jobs.length} shot(s) with ${workers} browser(s) into ${OUT}`,
    );
    const queue = [...jobs];
    await Promise.all(
      browsers.map(async (browser) => {
        for (let id = queue.shift(); id; id = queue.shift()) {
          try {
            await run(browser, id);
          } catch (first) {
            console.error(
              `  ${id}: ${first.message.split("\n")[0]}; trying again`,
            );
            try {
              await run(browser, id);
            } catch (second) {
              failed.push(id);
              console.error(`  ${id}: ${second.message.split("\n")[0]}`);
            }
          }
        }
      }),
    );
  } finally {
    await Promise.all(browsers.map((browser) => browser.close()));
    await server.close();
    if (!process.env.KEEP_FRAMES) rmSync(tmp, { recursive: true, force: true });
  }
  if (failed.length) {
    console.error(`Not recorded: ${failed.join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
