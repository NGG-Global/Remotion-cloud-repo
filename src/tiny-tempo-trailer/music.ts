/**
 * The music as a grid. `HOME_PAGE.wav` (the game's title theme, delivered as a 64 s
 * seamless loop) was measured at exactly 120.00 BPM with its beats on the 0.5 s grid
 * from sample 0 and its downbeats on even seconds, so a bar is 60 frames at 30 fps
 * and every cut in the trailer can be written in bars and beats.
 *
 * Structure, by bar (1-based), from the onset and band-energy analysis:
 *   1–6   sparse intro, bass hits on the odd bars
 *   7–8   build; bar 8 is the fill, hats and a riser
 *   9–16  the drop: full groove
 *  17–24  second section, a lead melody from bar 19; bar 24 dips
 *  25–30  breakdown, the loudest bass hits of the track
 *  31–32  turnaround into the loop
 */
export const FPS = 30;
export const BPM = 120;
export const BEAT = 15;
export const BAR = 60;
export const MUSIC_FILE = "tiny-tempo/audio/home-page.wav";

/** Frames from a bar count (0-based, so `bars(2)` is the first frame of the third bar). */
export const bars = (n: number): number => Math.round(n * BAR);
export const beats = (n: number): number => Math.round(n * BEAT);
/** Seconds of the source track at which a cut's bar 0 starts: bar 7 for the trailers. */
export const inBars = (bar1: number): number => (bar1 - 1) * 2;

/**
 * A fade that only touches the last `tailFrames` of the music, so the cut keeps the
 * track's own dynamics until the launch card is on and then settles rather than stops.
 */
export const fadeOutVolume =
  (total: number, tailFrames: number, level = 1) =>
  (frame: number): number => {
    const left = total - frame;
    if (left >= tailFrames) return level;
    const p = Math.max(0, left / tailFrames);
    return level * p * p;
  };
