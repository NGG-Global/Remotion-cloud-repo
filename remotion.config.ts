/**
 * Configuration for the Remotion CLI and Studio.
 *
 * Note: these settings do not apply when rendering through the Node APIs
 * (@remotion/renderer, @remotion/lambda). Pass the equivalent options to those
 * functions directly.
 *
 * All options: https://remotion.dev/docs/config
 */

import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// H.264 in an MP4 container: the safest default for review and for most
// downstream editors. Switch to "h265" or "prores" for mastering.
Config.setCodec("h264");

// The documentary uses three.js scenes. Headless Chrome in this environment
// only creates a WebGL context through SwiftShader's ANGLE backend.
Config.setChromiumOpenGlRenderer("swangle");

Config.overrideBundlerConfig(enableTailwind);

// A cloud container that ships Playwright's browsers but no Chrome of Remotion's own.
// The full Chromium there has dropped the old headless mode Remotion drives, so it is the
// headless shell or nothing; anywhere else this path does not exist and Remotion's own
// download is used.
const PLAYWRIGHT_HEADLESS_SHELL =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(PLAYWRIGHT_HEADLESS_SHELL)) {
  Config.setBrowserExecutable(PLAYWRIGHT_HEADLESS_SHELL);
}
