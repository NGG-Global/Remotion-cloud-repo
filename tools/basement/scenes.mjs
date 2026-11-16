/**
 * Layer registry. Each act's file exports a list of layer factories; a
 * factory returns { name, w, h, opaque, svg }.
 */
import { ACT1 } from "./act1.mjs";
import { ACT2 } from "./act2.mjs";
import { ACT3 } from "./act3.mjs";

export const LAYERS = [...ACT1, ...ACT2, ...ACT3];
