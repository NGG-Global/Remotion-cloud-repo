/**
 * Configuration for the Remotion CLI and Studio.
 *
 * Note: these settings do not apply when rendering through the Node APIs
 * (@remotion/renderer, @remotion/lambda). Pass the equivalent options to those
 * functions directly.
 *
 * All options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("swangle");

// H.264 in an MP4 container: the safest default for review and for most
// downstream editors. Switch to "h265" or "prores" for mastering.
Config.setCodec("h264");

Config.overrideBundlerConfig(enableTailwind);
