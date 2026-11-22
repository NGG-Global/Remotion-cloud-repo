/**
 * Moving-picture sources for "Faces of Evil: Ted Bundy". Pure data, read by
 * the composition and by tools/hiroshima/cut-clips.mjs (project "bundy").
 *
 * There is no public-domain film of Bundy himself: the courtroom and news
 * footage that exists belongs to the networks and stations that shot it, and
 * is not used. The moving pictures here are period atmosphere only, all of
 * them U.S. government films (public domain as works of the U.S. federal
 * government; the four Prelinger copies also carry the Creative Commons public
 * domain dedication on their Internet Archive pages). The film never presents
 * them as the events, places or people of the story, and credits each one on
 * screen whenever it appears.
 *
 * An earlier cut used a 1978 home movie from Prelinger Archives; its item page
 * states no licence, and Prelinger's own FAQ says many of its films are not in
 * the public domain, so it was replaced.
 */

export type FilmSource = {
  readonly file: string;
  readonly url: string;
  readonly title: string;
  readonly credit: string;
  readonly licence: string;
  /** ffmpeg filters applied before the grade (colour repair of a faded print). */
  readonly pre?: string;
};

const IA = "https://archive.org/download/";
const PD_DEDICATION =
  "Public domain (U.S. government work); CC public domain dedication on the Internet Archive item";
/** The 1968 print has faded to magenta: pull red and blue back towards green. */
const UNFADE =
  "colorchannelmixer=rr=0.86:rg=0.10:gg=1.0:bb=0.88:bg=0.08,eq=saturation=0.8:contrast=1.08:brightness=-0.02";

export const FILMS = {
  FE: {
    file: "forcible-entry.mpeg",
    url: `${IA}gov.archives.arc.12138/gov.archives.arc.12138.mpeg`,
    title:
      "Forcible Entry: Excuse and Trickery, Part Two (1974), FBI training film, National Archives 12138",
    credit: "FBI training film, 1974 · U.S. National Archives",
    licence: "Public domain (U.S. government work)",
  },
  WC: {
    file: "WhentheC1975.mpeg",
    url: `${IA}WhentheC1975/WhentheC1975.mpeg`,
    title:
      "When the Circuit Breaks: America's Energy Crisis, Part I (1975), U.S. Federal Energy Administration, Prelinger Archives",
    credit: "Federal Energy Administration film, 1975 · Prelinger Archives",
    licence: PD_DEDICATION,
  },
  WD: {
    file: "WhentheC1975_2.mpeg",
    url: `${IA}WhentheC1975_2/WhentheC1975_2.mpeg`,
    title:
      "When the Circuit Breaks: America's Energy Crisis, Part II (1975), U.S. Federal Energy Administration, Prelinger Archives",
    credit: "Federal Energy Administration film, 1975 · Prelinger Archives",
    licence: PD_DEDICATION,
  },
  DA: {
    file: "DayinAme1968.mpeg",
    url: `${IA}DayinAme1968/DayinAme1968.mpeg`,
    title: "A Day in America, Part I (1968), U.S. Department of Defense, Prelinger Archives",
    credit: "U.S. Department of Defense film, 1968 · Prelinger Archives",
    licence: PD_DEDICATION,
    pre: UNFADE,
  },
  DB: {
    file: "DayinAme1968_2.mpeg",
    url: `${IA}DayinAme1968_2/DayinAme1968_2.mpeg`,
    title: "A Day in America, Part II (1968), U.S. Department of Defense, Prelinger Archives",
    credit: "U.S. Department of Defense film, 1968 · Prelinger Archives",
    licence: PD_DEDICATION,
    pre: UNFADE,
  },
  SS: {
    file: "SocialSe1971.mp4",
    url: `${IA}SocialSe1971/SocialSe1971.mp4`,
    title:
      "Social Seminar: Changing (1971), U.S. National Institute of Mental Health, Prelinger Archives",
    credit: "National Institute of Mental Health film, 1971 · Prelinger Archives",
    licence: PD_DEDICATION,
  },
} as const satisfies Record<string, FilmSource>;

export type FilmId = keyof typeof FILMS;
