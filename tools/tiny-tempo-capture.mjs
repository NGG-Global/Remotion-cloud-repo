// Captures real Tiny Tempo gameplay as 1080x1920, 30 fps clips for the ads.
//
// The game runs headless on its own dev server (`npm run dev` in the TinyTempo
// checkout), on the canvas renderer — software WebGL manages 8 fps here, the
// canvas renderer 55 — with a seeded save so no lesson, hint or introduction
// interrupts the level. A level clip opens the level through the game's own
// DEV-only `?debug&level=N` route and runs its "Accurate replay", so every tap
// lands on the beat. The screencast's frame timestamps are kept, and the plan's
// first player target is written beside the clip (`<clip>.json`) so the trim
// script can cut each shot to a known beat.
//
// Usage: node tools/tiny-tempo-capture.mjs <out dir> <clip> [<clip> ...]   (or "all")
// Env:   TINY_TEMPO_URL (default http://localhost:5173/), CHROME_PATH (optional)
// Needs: playwright (with a Chromium) and ffmpeg on PATH.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [ROOT, ...names] = process.argv.slice(2);
if (!ROOT || names.length === 0) { console.error('usage: node tools/tiny-tempo-capture.mjs <out dir> <clip...>'); process.exit(1); }
const BASE = process.env.TINY_TEMPO_URL ?? 'http://localhost:5173/';
const TEACH = ['seen','replayTip','triplet','sixteenth','scrapbook','offbeat','longPhrase','hintScrapbook','hintSettings','hintEndless','puckObjectives','puckEndless','lastOffbeat','hintReminder','puckStore'];

const seed = (unlocked, bests = {}) => {
  const best = {}; for (let l = 1; l < unlocked; l++) best[l] = bests[l] ?? [100, 92, 84, 77, 96, 70, 88][l % 7];
  return { progress: JSON.stringify({ version: 1, unlocked, best }), teach: JSON.stringify(Object.fromEntries(TEACH.map(f => [f, true]))), gates: JSON.stringify({ version: 1, opened: 40 }) };
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForPlay(page) {
  await page.waitForFunction(() => { const g = window.__PHASER_GAME__; const s = g && g.scene.getScene('play'); return !!(s && s.scene.isActive() && s.debug && s.replayPanel); }, null, { timeout: 30000 });
  await sleep(400);
}
const hideHud = (page) => page.evaluate(() => { const s = window.__PHASER_GAME__.scene.getScene('play'); s.debugMode = false; s.debug.setVisible(false); if (s.accuracy) s.accuracy.setText(''); s.replayPanel.style.display = 'none'; });
const clickPanel = (page, label) => page.evaluate((label) => { for (const b of document.querySelectorAll('button')) if (b.textContent === label) b.click(); }, label);

const CLIPS = {
  menu: { seed: seed(24), url: BASE, async run(page, rec) { await sleep(3000); await rec.start(); await sleep(1800); for (let i = 0; i < 10; i++) { await page.mouse.click(200, 420); await sleep(i % 4 === 3 ? 1000 : 500); } await sleep(1500); } },
  map: { seed: seed(24), url: BASE, async run(page, rec) { await sleep(2500); await page.evaluate(() => { const g = window.__PHASER_GAME__; g.scene.getScenes(true)[0].scene.start('map'); }); await sleep(2500); await rec.start(); await sleep(1800); for (let i = 0; i < 3; i++) { await page.mouse.move(216, 640); await page.mouse.down(); for (let k = 1; k <= 8; k++) { await page.mouse.move(216, 640 - k * 50); await sleep(16); } await page.mouse.up(); await sleep(2200); } await sleep(1500); } },
  map2: { seed: seed(52), url: BASE, async run(page, rec) { await sleep(2500); await page.evaluate(() => { const g = window.__PHASER_GAME__; g.scene.getScenes(true)[0].scene.start('map'); }); await sleep(2500); await rec.start(); await sleep(1500); for (let i = 0; i < 4; i++) { await page.mouse.move(216, 680); await page.mouse.down(); for (let k = 1; k <= 10; k++) { await page.mouse.move(216, 680 - k * 55); await sleep(16); } await page.mouse.up(); await sleep(1800); } await sleep(1500); } },
  gate: { seed: { ...seed(11, Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, 100]))), gates: JSON.stringify({ version: 1, opened: 0 }) }, url: BASE, async run(page, rec) { await sleep(2500); await page.evaluate(() => { const g = window.__PHASER_GAME__; g.scene.getScenes(true)[0].scene.start('map'); }); await sleep(2500); await rec.start(); await sleep(2000); await page.evaluate(() => { const m = window.__PHASER_GAME__.scene.getScene('map'); m.openGate(m.liveGate); }); await sleep(9000); } },
  result: { seed: seed(6), url: BASE + '?debug&level=5', async run(page, rec) { await waitForPlay(page); await clickPanel(page, 'Accurate replay'); await hideHud(page); await sleep(9000); await rec.start(); await sleep(600); await page.evaluate(() => { for (const b of document.querySelectorAll('button')) if (b.textContent === 'Mastery result') b.click(); }); await sleep(11000); } },
};
const readPlan = (page) => page.evaluate(() => { const s = window.__PHASER_GAME__.scene.getScene('play'); const plan = s.controller && s.controller.plan; if (!plan) return null; const now = s.now(); const wall = performance.timeOrigin + performance.now(); const epoch = (t) => (wall + (t - now) * 1000) / 1000; return { start: epoch(plan.start), firstTarget: epoch(plan.targets[0]), end: epoch(plan.end), bpm: plan.bpm, targets: plan.targets.map(epoch) }; });
const level = (n, secs) => ({ seed: seed(n + 1), url: `${BASE}?debug&level=${n}`, async run(page, rec) { await waitForPlay(page); await hideHud(page); await rec.start(); await sleep(300); await clickPanel(page, 'Accurate replay'); let plan = null; for (let i = 0; i < 100 && !plan; i++) { await sleep(100); plan = await readPlan(page); } rec.meta.plan = plan; await sleep(secs * 1000); } });
for (const [name, n, secs] of [['hammer',1,30],['window',2,16],['bug',3,30],['saw',4,16],['tomato',5,16],['curl',6,16],['scissors',9,18],['egg',11,16],['bubble',12,16],['light',13,16],['doorbell',21,16],['balloon',32,16],['scratch',51,16],['trombone',52,16],['clap',61,16],['popcorn',91,16],['icecream',141,16],['frog',151,16],['camera',171,16]]) CLIPS[name] = level(n, secs);

async function capture(name) {
  const clip = CLIPS[name];
  const dir = `${ROOT}/${name}.frames`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: ['--autoplay-policy=no-user-gesture-required', '--disable-gpu', '--disable-software-rasterizer', '--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('[console error]', m.text().slice(0, 160)); });
  await page.addInitScript((s) => { localStorage.setItem('small-acts.progress.v1', s.progress); localStorage.setItem('small-acts.teach.v1', s.teach); localStorage.setItem('tiny-tempo.gates.v1', s.gates); }, clip.seed);
  const cdp = await ctx.newCDPSession(page);
  const stamps = []; let index = 0; let recording = false;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    if (recording) { index++; writeFileSync(`${dir}/f${String(index).padStart(5, '0')}.jpg`, Buffer.from(data, 'base64')); stamps.push(metadata.timestamp); }
    try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch {}
  });
  const rec = { meta: {}, async start() { recording = true; await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 }); } };
  await page.goto(clip.url, { waitUntil: 'load' });
  await clip.run(page, rec);
  recording = false;
  try { await cdp.send('Page.stopScreencast'); } catch {}
  await browser.close();
  const n = stamps.length; const span = n > 1 ? stamps[n - 1] - stamps[0] : 0;
  console.log(`${name}: ${n} frames over ${span.toFixed(2)} s = ${(n / Math.max(span, 0.01)).toFixed(1)} fps`);
  writeFileSync(`${dir}/stamps.json`, JSON.stringify(stamps));
  const plan = rec.meta.plan; const rel = (t) => Math.round((t - stamps[0]) * 1000) / 1000;
  const meta = { frames: n, seconds: span, fps: n / Math.max(span, 0.01), ...(plan ? { bpm: plan.bpm, planStart: rel(plan.start), firstTarget: rel(plan.firstTarget), planEnd: rel(plan.end), targets: plan.targets.map(rel) } : {}) };
  writeFileSync(`${ROOT}/${name}.json`, JSON.stringify(meta, null, 2));
  if (plan) console.log(`  first target at ${meta.firstTarget} s, plan ${meta.planStart}–${meta.planEnd} s, ${meta.bpm} bpm`);
  const mean = span / Math.max(1, n - 1);
  const list = stamps.map((t, i) => `file 'f${String(i + 1).padStart(5, '0')}.jpg'\nduration ${i + 1 < n ? (stamps[i + 1] - t).toFixed(5) : mean.toFixed(5)}`).join('\n');
  writeFileSync(`${dir}/list.txt`, list);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-vf', 'fps=30,scale=1080:1920:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${ROOT}/${name}.mp4`]);
  rmSync(dir, { recursive: true, force: true });
}

for (const name of (names[0] === 'all' ? Object.keys(CLIPS) : names)) await capture(name);
