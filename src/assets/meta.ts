import type { Attribution, LicenseInfo } from "./types";

/** Artwork drawn for this repository. */
export const PROJECT_LICENSE = {
  name: "Original",
  notes:
    "Created for this repository. Covered by the project license (UNLICENSED).",
} as const satisfies LicenseInfo;

export const PROJECT_ATTRIBUTION = {
  creator: "Project original",
} as const satisfies Attribution;

/**
 * Runtime copied out of node_modules so renders do not fetch unpkg.
 * The npm package declares license MIT and does not ship a LICENSE file.
 */
export const RIVE_WASM_LICENSE = {
  name: "MIT",
  url: "https://github.com/rive-app/rive-wasm",
  notes:
    "public/assets/rive/rive.wasm is @rive-app/canvas-advanced@2.31.5 rive.wasm. Package license field: MIT. Copyright holders are listed as Rive contributors in that package.",
} as const satisfies LicenseInfo;

export const RIVE_SAMPLE_LICENSE = {
  name: "unknown",
  url: "https://cdn.rive.app/animations/vehicles.riv",
  notes:
    "No license was published with this CDN sample. Do not treat it as cleared for a shipped video. Replace it with a .riv whose license you have confirmed.",
} as const satisfies LicenseInfo;
