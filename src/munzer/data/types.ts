import type { T } from "../engine/timeline";
import type { ClipProps } from "../shots/Clip";
import type { PhotoProps } from "../shots/Photo";

export type Enter =
  | { readonly kind: "fade"; readonly d: number }
  | { readonly kind: "black"; readonly d: number }
  | { readonly kind: "flash"; readonly d: number };

type Base = {
  readonly id: string;
  /** When the shot starts: narration seconds, or a time inside an insert. */
  readonly at: T;
  readonly enter?: Enter;
  /** Fade to black over the last `d` seconds of the shot. */
  readonly exit?: { readonly d: number };
};

export type ClipShot = Base & { readonly kind: "clip" } & ClipProps;
export type PhotoShot = Base & { readonly kind: "photo" } & PhotoProps;
export type AnimShot = Base & {
  readonly kind: "anim";
  /** Key into the registry in anim/index.ts. */
  readonly anim: string;
  readonly props?: Record<string, unknown>;
};

export type Shot = ClipShot | PhotoShot | AnimShot;

export type Label = {
  readonly at: T;
  readonly until: T;
  readonly line: string;
  readonly sub?: string;
  readonly corner?: "br" | "bl" | "tr" | "tl";
};

export type Subtitle = {
  readonly at: T;
  readonly until: T;
  readonly text: string;
  /** Who is speaking, shown once above the line. */
  readonly source?: string;
};

export type Sfx = {
  readonly at: T;
  readonly file: string;
  readonly gain?: number;
};
