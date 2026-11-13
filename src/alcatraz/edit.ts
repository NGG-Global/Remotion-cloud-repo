/**
 * The edit: where the narration is opened up for archival sound, and how
 * narration time maps to film time.
 *
 * Every time in the shot list is a second of the narration MP3, as the
 * transcript gives it. Six inserts cut the narration open at measured pauses
 * and play a newsreel with its own sound; the narration then resumes exactly
 * where it stopped. `toFilm()` turns a narration second into a film second by
 * adding the inserts that come before it, so the shot list never has to know
 * about them.
 *
 * Cut points were chosen on the decoded voice (20 ms RMS): each sits in a
 * stretch below 2% of speech level, after a sentence ends.
 */
import { FPS } from "./theme";

/** Length of public/alcatraz/audio/narration.mp3 (ffprobe). */
export const NARRATION_SECONDS = 964.65;

/** Black held after the last word, in seconds. */
export const TAIL_SECONDS = 2.5;

export type Subtitle = {
  /** Seconds from the start of the insert. */
  readonly from: number;
  readonly to: number;
  readonly he: string;
};

export type Insert = {
  readonly clip: string;
  /** Narration second at which the narration stops and the insert plays. */
  readonly at: number;
  /** Seconds the insert runs (the clip's length). */
  readonly dur: number;
  /** Source line shown in the corner while the insert plays. */
  readonly tag: string;
  readonly subs: readonly Subtitle[];
  /**
   * Gain on the clip's own sound. Measured with ffmpeg ebur128: the narration
   * is -19.7 LUFS, the newsreels -14.4 to -20.0; each is brought to about
   * -20.5 LUFS so the archive sits just under the voice.
   */
  readonly gain: number;
};

/** Snap a narration second to the frame grid the audio is cut on. */
const snap = (s: number): number => Math.round(s * FPS) / FPS;

export const INSERTS: readonly Insert[] = [
  {
    clip: "ins-flee",
    at: snap(93.8),
    dur: snap(8.7),
    tag: "UNIVERSAL NEWSREEL · 1962",
    gain: 0.54,
    subs: [
      {
        from: 3.15,
        to: 8.4,
        he: "הכפית מתגלה חזקה מהסורגים בכלא אלקטרז, שנחשב לחסין מפני בריחה",
      },
    ],
  },
  {
    clip: "ins-capone",
    at: snap(386.0),
    dur: snap(18.7),
    tag: "HEARST METROTONE NEWS · 1932",
    gain: 1.0,
    subs: [
      {
        from: 2.5,
        to: 6.85,
        he: "מלך הגנגסטרים עומד לקבל את המגיע לו, והמוני תושבי שיקגו מגיעים לבית המשפט הפדרלי",
      },
      {
        from: 6.9,
        to: 11.6,
        he: "להעיף מבט אחרון באל 'צלקת' קפונה, לפני שהדוד סם ישלח אותו אל מאחורי הסורגים",
      },
      { from: 12.1, to: 14.8, he: "הנה הוא מגיע. הבחור הגדול בכבודו ובעצמו" },
      { from: 15.3, to: 18.5, he: "מה הלחץ, אל? לאן שאתה הולך, יהיה לך המון זמן" },
    ],
  },
  {
    clip: "ins-dummies",
    at: snap(601.85),
    dur: snap(10.75),
    tag: "UNIVERSAL NEWSREEL · 1962",
    gain: 0.78,
    subs: [
      {
        from: 0.3,
        to: 5.3,
        he: "הם עיצבו בקפידה בובות מגבס, עם שיער מזיפים של מברשות צבע,",
      },
      {
        from: 5.35,
        to: 10.5,
        he: "שיחליפו אותם בספירת התאים, ובינתיים כיסו את פתח הבריחה בסבכה מקרטון",
      },
    ],
  },
  {
    clip: "ins-manhunt",
    at: snap(667.1),
    dur: snap(10.15),
    tag: "UNIVERSAL NEWSREEL · 1962",
    gain: 0.7,
    subs: [
      {
        from: 0.2,
        to: 4.45,
        he: "הבריחה הציתה את המצוד הגדול ביותר בתולדות סן פרנסיסקו",
      },
      {
        from: 4.5,
        to: 9.9,
        he: "סוכני FBI, משמר החופים, משטרת הכבישים, סגני השריף והמשטרה המקומית הצטרפו לחיפושים",
      },
    ],
  },
  {
    clip: "ins-closes",
    at: snap(761.85),
    dur: snap(13.6),
    tag: "UNIVERSAL NEWSREEL · 1963",
    gain: 0.62,
    subs: [
      {
        from: 6.2,
        to: 10.65,
        he: "שלום ולהתראות לאלקטרז, הסלע המאיים במפרץ סן פרנסיסקו,",
      },
      { from: 11.2, to: 13.5, he: "שמארח את העיתונאים ביום סגירתו" },
    ],
  },
  {
    clip: "ins-last27",
    at: snap(786.05),
    dur: snap(9.95),
    tag: "UNIVERSAL NEWSREEL · 1963",
    gain: 0.69,
    subs: [
      {
        from: 0.6,
        to: 5.8,
        he: "באזיקים ובכבלי רגליים, 27 האחרונים מתוך 1,500 אסיריו עוזבים את המבצר המתפורר",
      },
      {
        from: 5.95,
        to: 9.8,
        he: "שכבר אי אפשר להציל, לטובת בתי סוהר פדרליים מודרניים יותר",
      },
    ],
  },
];

/** Seconds of inserts that play before narration second `t` (inclusive). */
const insertedBefore = (t: number, inclusive: boolean): number => {
  const eps = 0.5 / FPS;
  return INSERTS.reduce(
    (sum, ins) =>
      ins.at < t - eps || (inclusive && Math.abs(ins.at - t) <= eps)
        ? sum + ins.dur
        : sum,
    0,
  );
};

/** Film second at which narration second `t` is heard. */
export const toFilm = (t: number): number => t + insertedBefore(t, true);

/** Film second at which an insert starts. */
export const insertStart = (ins: Insert): number =>
  ins.at + insertedBefore(ins.at, false);

export const FILM_SECONDS =
  toFilm(NARRATION_SECONDS) + TAIL_SECONDS;

export const FILM_FRAMES = Math.ceil(FILM_SECONDS * FPS);

/** The narration as the chunks between inserts, in narration seconds. */
export const NARRATION_CHUNKS: readonly { from: number; to: number }[] = (() => {
  const cuts = [0, ...INSERTS.map((i) => i.at), NARRATION_SECONDS];
  return cuts.slice(0, -1).map((from, i) => ({ from, to: cuts[i + 1] }));
})();
