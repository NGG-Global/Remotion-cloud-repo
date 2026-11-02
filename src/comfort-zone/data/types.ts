/** One burned-in subtitle cue of the Hebrew master, with its English line. */
export type Cue = {
  readonly from: number;
  readonly to: number;
  readonly he: string;
  readonly en: string;
};

/** Centre and size of a 3D word in the master, at one frame. */
export type WordKey = {
  readonly f: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export type WordExit = {
  readonly from: number;
  readonly to: number;
  readonly dx: number;
  readonly dy: number;
  readonly scale: number;
  readonly refLead?: number;
};

export type Word = {
  readonly id: string;
  readonly en: string;
  readonly he: string;
  readonly shot: readonly number[];
  readonly lines?: number;
  readonly keys: readonly WordKey[];
  readonly exit: WordExit;
};
