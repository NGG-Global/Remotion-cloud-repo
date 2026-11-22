/**
 * Archival film sources. Pure data: read by the composition and by
 * tools/hiroshima/cut-clips.mjs, which cuts every shot's segment out of the
 * downloaded film into public/hiroshima/clips.
 *
 * Every film here is a work of the United States government (Army Signal
 * Corps, Navy, Strategic Bombing Survey, Department of Energy, Office of War
 * Information), a Universal Newsreel released to the public domain, or a
 * Prelinger Archives item. The downloads come from the Internet Archive
 * mirrors of the National Archives holdings. Licence notes are as recorded
 * on each item page at the time of download (November 2026); verify before
 * any use outside this project.
 */

export type FilmSource = {
  /** File under .cache/raw (git-ignored; fetched by tools/hiroshima/fetch.mjs). */
  readonly file: string;
  readonly url: string;
  readonly title: string;
  /** Short on-screen credit. */
  readonly credit: string;
  readonly licence: string;
};

const film = (
  file: string,
  url: string,
  title: string,
  credit: string,
  licence = "Public domain (U.S. government work)",
): FilmSource => ({ file, url, title, credit, licence });

const IA = "https://archive.org/download/";

export const FILMS = {
  AS: film(
    "atom-strikes.mp4",
    `${IA}AtomStrikes/AtomStrikes.mp4`,
    "The Atom Strikes! (1945), U.S. Army Signal Corps",
    "The Atom Strikes!, 1945 · U.S. Army",
  ),
  TD: film(
    "trinity-doe.mpeg",
    `${IA}gov.doe.0800001/gov.doe.0800001.mpeg`,
    "Nuclear Test Film - Trinity Shot (1945), U.S. Department of Energy",
    "Trinity, 1945 · U.S. Department of Energy",
    "CC0 / public domain",
  ),
  IE: film(
    "inside-enola-gay.mp4",
    `${IA}InsideEnolaGay/434-593%20Inside%20Enola%20Gay.mp4`,
    "E-6 10 Sec (Inside the Enola Gay), National Archives 434-593",
    "Inside the Enola Gay · U.S. National Archives",
  ),
  EO: film(
    "enola-outtakes.mp4",
    `${IA}6290_Enola_Gay_Outtakes_01_37_13_10/6290_Enola_Gay_Outtakes_01_37_13_10_3mb.mp4`,
    "[Enola Gay Outtakes] (1945), Prelinger Archives",
    "Enola Gay, Tinian 1945 · Prelinger Archives",
    "Prelinger Archives; no licence stated on the item page (verify)",
  ),
  TR: film(
    "truman-announce.mp4",
    `${IA}truman-announces-bombing-of-hiroshima-08-06-1945/Truman%20Announces%20Bombing%20of%20Hiroshima%2008-06-1945.mp4`,
    "President Truman announces the bombing of Hiroshima (1945)",
    "Truman, August 1945 · U.S. National Archives",
  ),
  HD: film(
    "hiroshima-damage-1946.mp4",
    `${IA}USAF-11075/USAF-11075.mp4`,
    "Atomic Bomb Physical Damage, General View, Hiroshima (1946), 342-USAF-11075",
    "Hiroshima, 1946 · U.S. Strategic Bombing Survey",
  ),
  FS: film(
    "flash-shadow.mp4",
    `${IA}342-USAF-11077/342-USAF-11077%20FLASH%20BURN%20AND%20SHADOW%20DETAIL%2003-13-1946%20-%2004-08-1946.mp4`,
    "Flash Burn and Flash Shadow Detail (1946), 342-USAF-11077",
    "Flash shadows, 1946 · U.S. Strategic Bombing Survey",
  ),
  EF: film(
    "effects-1946.mp4",
    `${IA}Effects-Of-The-Atomic-Bomb-On-Hiroshima-And-Nagasaki-1946/Effects%20of%20the%20Atomic%20Bomb%20on%20Hiroshima%20and%20Nagasaki.mp4`,
    "Effects of the Atomic Bomb on Hiroshima and Nagasaki (1946), USSBS with Nippon Eigasha",
    "Effects of the Atomic Bomb, 1946 · USSBS / Nippon Eigasha",
    "Public domain in the U.S. (made for the U.S. Strategic Bombing Survey); status outside the U.S. not verified",
  ),
  HN: film(
    "hiro-naga-adc10038.mp4",
    `${IA}111-adc-10038/111-adc-10038.mp4`,
    "Hiroshima and Nagasaki, Japan (1946), 111-ADC-10038",
    "Hiroshima, 1946 · U.S. Army Signal Corps",
  ),
  NB: film(
    "nagasaki-burst.mp4",
    `${IA}428Npc2586NagasakiBurst/428-npc-2586%20Nagasaki%20Burst.mp4`,
    "Atomic Bomb: Nagasaki Burst (1945), 428-NPC-2586",
    "Nagasaki, 9 August 1945 · U.S. Navy",
  ),
  ND: film(
    "nagasaki-damage-11010.mp4",
    `${IA}USAF-11010/USAF-11010.mp4`,
    "Atomic Bomb, Physical Damage, Nagasaki (1945), 342-USAF-11010",
    "Nagasaki, 1945 · U.S. Strategic Bombing Survey",
  ),
  N46: film(
    "newsreel-1946-08-05.mp4",
    `${IA}1946-08-05_Jap_Films_of_Hiroshima/1946-08-05_Jap_Films_of_Hiroshima.mp4`,
    "Universal Newsreel, 5 August 1946",
    "Universal Newsreel, 1946",
    "Public domain (Universal Newsreel)",
  ),
  N16: film(
    "newsreel-1945-08-16.mp4",
    `${IA}1945-08-16_Reconversion_Outlook/1945-08-16_Reconversion_Outlook.mp4`,
    "Universal Newsreel, 16 August 1945",
    "Universal Newsreel, 1945",
    "Public domain (Universal Newsreel)",
  ),
  N23: film(
    "newsreel-1945-08-23.mp4",
    `${IA}1945-08-23_Japanese_Surrender/1945-08-23_Japanese_Surrender.mp4`,
    "Universal Newsreel, 23 August 1945",
    "Universal Newsreel, 1945",
    "Public domain (Universal Newsreel)",
  ),
  OK: film(
    "newsreel-okinawa.mp4",
    `${IA}1945-04-09_Landings_On_Okinawa/1945-04-09_Landings_On_Okinawa.mp4`,
    "Universal Newsreel, 9 April 1945 (Okinawa)",
    "Okinawa, 1945 · Universal Newsreel",
    "Public domain (Universal Newsreel)",
  ),
  SP: film(
    "newsreel-saipan.mpeg",
    `${IA}1944-11-27_Target_Tokyo_From_Saipan/1944-11-27_Target_Tokyo_From_Saipan.mpeg`,
    "Universal Newsreel, 27 November 1944 (B-29s on Saipan)",
    "B-29s, 1944 · Universal Newsreel",
    "Public domain (Universal Newsreel)",
  ),
  SM: film(
    "surrender-missouri.mp4",
    `${IA}ADC-5163/ADC-5163.mp4`,
    "Surrender Ceremonies Aboard USS Missouri, 2 September 1945, ADC-5163",
    "USS Missouri, 2 September 1945 · U.S. National Archives",
  ),
  PO: film(
    "potsdam.mp4",
    `${IA}NPC-10902/NPC-10902.mp4`,
    "Truman, Churchill, Stalin, Potsdam Conference (1945), NPC-10902",
    "Potsdam, July 1945 · U.S. National Archives",
  ),
  TK: film(
    "tokyo-ruins.mp4",
    `${IA}NPC-14671/NPC-14671.mp4`,
    "Ruins in Tokyo, September 1945, NPC-14671",
    "Tokyo, September 1945 · U.S. National Archives",
  ),
} as const satisfies Record<string, FilmSource>;

export type FilmId = keyof typeof FILMS;
