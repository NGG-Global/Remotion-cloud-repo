/**
 * CLI configuration for the 2D motion comic (BasementComic).
 *
 * Same as remotion.config.ts minus the SwiftShader GL backend: that backend
 * is only needed for the three.js documentary, and for flat image layers it
 * moves all compositing into an emulated GPU process that becomes the render
 * bottleneck. Use with: npx remotion render --config=remotion.basement.config.ts
 */
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.overrideBundlerConfig(enableTailwind);
