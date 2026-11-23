/**
 * Timed lyrics for "אל תשכחי אותי" (public/audio/al-tishkechi-oti.mp3).
 *
 * The words come from the lyrics embedded in the MP3's tags. Two words were
 * written there in Latin letters as pronunciation hints for the generator
 * ("yita'ka", "tizkeree"); they are shown here in Hebrew as sung: יתקע, תזכרי.
 *
 * Times are in seconds from the start of the track:
 * - `start` is when the line starts being sung.
 * - `end` is when the last word of the line finishes.
 *
 * How the times were measured: the vocals were separated from the mix, the
 * song was transcribed with a Hebrew speech model to get word timings, the
 * known lyrics were matched to those words, and each line start was then
 * moved to the exact point where the voice comes in after a breath. The two
 * choruses were checked against each other and agree to within ~0.05s.
 */
export type LyricLine = {
  start: number;
  end: number;
  text: string;
};

export const SONG_DURATION_SECONDS = 97.224;

export const LYRICS: LyricLine[] = [
  // Verse 1
  { start: 0.95, end: 2.3, text: "יש לי בעיה" },
  { start: 3.25, end: 5.4, text: "דורשת קצת מחשבה" },
  { start: 5.76, end: 7.78, text: "איך נשארים בזיכרון" },
  { start: 7.75, end: 9.66, text: "בלי לעורר בהלה?" },
  { start: 10.01, end: 11.14, text: "אולי שוקולד" },
  { start: 12.3, end: 14.12, text: "או זר פרחים נחמד" },
  { start: 14.53, end: 16.06, text: "אבל פרחים נובלים" },
  { start: 16.06, end: 18.1, text: "ושוקולד זה ללוזרים" },
  { start: 18.9, end: 20.52, text: "אז מצאתי פתרון" },
  { start: 21.07, end: 22.72, text: "לא דורש שום כישרון" },
  { start: 22.8, end: 25.04, text: "רק ארבעה אקורדים, קצת cringe" },
  { start: 25.12, end: 28.55, text: "וברוך השם מזה יש לי המון" },

  // Chorus
  { start: 29.6, end: 31.24, text: "עמית, עמית" },
  { start: 31.3, end: 33.35, text: "אל תשכחי אותי" },
  { start: 33.45, end: 35.5, text: "אולי זה השיר שבראש יתקע" },
  { start: 35.58, end: 37.8, text: "ואולי תזכרי אותי" },
  { start: 38.56, end: 40.06, text: "עמית, עמית" },
  { start: 40.22, end: 42.24, text: "אל תהפכי את התקליט" },
  { start: 42.63, end: 44.36, text: "כתבתי לך שיר קליט" },
  { start: 44.67, end: 45.16, text: "מי יודע" },
  { start: 45.8, end: 47.92, text: "אולי יהפוך ללהיט" },
  { start: 50.27, end: 52.38, text: "אולי יהפוך ללהיט" },

  // Verse 2
  { start: 55.91, end: 57.98, text: "זה לא שיר אהבה" },
  { start: 59.3, end: 60.46, text: "לא תראי את זה בא" },
  { start: 60.76, end: 62.4, text: "זו בסך הכול שיטה" },
  { start: 62.46, end: 64.86, text: "לחדור לתודעה" },
  { start: 65.67, end: 67.0, text: "ואם מחר בבוקר" },
  { start: 67.03, end: 69.12, text: "תשירי בלי כוונה" },
  { start: 69.4, end: 70.26, text: "זו לא תקלה" },
  { start: 70.48, end: 74.4, text: "זו הייתה התוכנית מההתחלה" },

  // Chorus
  { start: 74.5, end: 76.2, text: "עמית, עמית" },
  { start: 76.22, end: 78.3, text: "אל תשכחי אותי" },
  { start: 78.4, end: 80.5, text: "אולי זה השיר שבראש יתקע" },
  { start: 80.52, end: 82.82, text: "ואולי תזכרי אותי" },
  { start: 83.53, end: 85.15, text: "עמית, עמית" },
  { start: 85.17, end: 87.35, text: "אל תהפכי את התקליט" },
  { start: 87.62, end: 89.42, text: "כתבתי לך שיר קליט" },
  { start: 89.69, end: 90.22, text: "מי יודע" },
  { start: 90.79, end: 92.8, text: "אולי יהפוך ללהיט" },
];
