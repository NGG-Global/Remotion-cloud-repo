/**
 * The voice-over, card by card, and the direction each card is set in.
 *
 * Pure data: no components are imported here, so tools/backup-align.py can
 * read the word sequence through `node` and align it against the audio.
 *
 * Card text markup
 *   " / "      line break
 *   *word*     highlighter behind the word (can span several words)
 *   ^word^     hero: set large in the condensed display face
 *
 * Every whitespace-separated token is one spoken word, in spoken order.
 * Numbers and Latin names are written as displayed; the aligner knows how
 * they are said (see SPOKEN in tools/backup-align.py).
 */

export type Tone = "crt" | "paper" | "dusk" | "night" | "sun" | "blue" | "warm";

/** Where the text block sits; the art takes the rest of the frame. */
export type Layout = "top" | "bottom" | "center";

/** How the words of a card arrive. */
export type Mode =
  | "stack" // word by word, centred lines
  | "type" // typed on a terminal line with a block cursor
  | "quote" // spoken line in quotation, serif, inside a speech bubble
  | "note"; // small aside under the previous card

/** Variant of the hero face for a single card. */
export type HeroFace = "display" | "serif" | "led";

export type CardDef = {
  readonly id: string;
  readonly text: string;
  readonly mode?: Mode;
  readonly hero?: HeroFace;
};

export type SceneDef = {
  readonly id: string;
  readonly chapter: number;
  readonly tone: Tone;
  readonly layout: Layout;
  readonly art?: string;
  readonly mode?: Mode;
  readonly cards: readonly CardDef[];
  /** Scenes without words (title, outro) give their window in seconds. */
  readonly from?: number;
  readonly to?: number;
};

export const CHAPTERS = [
  "הפעלה",
  "דור מוזר",
  "ילדות בלי אלגוריתם",
  "25 עד 35",
  "קריירה",
  "הפיד",
  "חברים",
  "הורים",
  "גוף ונפש",
  "הבטחות",
  "טכנולוגיה",
  "סקרנות",
  "40",
  "נוסטלגיה",
  "המבוגרים בחדר",
  "גיבוי",
] as const;

export const SCENES: readonly SceneDef[] = [
  // ---- cold open: a dark monitor ------------------------------------------
  {
    id: "boot",
    chapter: 0,
    tone: "crt",
    layout: "center",
    art: "boot",
    mode: "type",
    cards: [
      {
        id: "advice",
        text: "אם הייתי יכול / לתת לכם / *עצה אחת* / לגבי החיים,",
      },
      { id: "this", text: "היא הייתה ^זו.^" },
    ],
  },
  {
    id: "warning",
    chapter: 0,
    tone: "crt",
    layout: "center",
    art: "warning",
    cards: [{ id: "backup", text: "תגבו את / התמונות / שלכם. / ^באמת.^" }],
  },
  {
    id: "pc",
    chapter: 0,
    tone: "crt",
    layout: "top",
    art: "pc",
    cards: [
      {
        id: "pc1",
        text: "יום אחד תגלו / שהמחשב שעליו שמרתם / את כל גיל ההתבגרות שלכם",
      },
      { id: "pc2", text: "לא נדלק כבר / ^15 שנה,^" },
    ],
  },
  {
    id: "drawer",
    chapter: 0,
    tone: "crt",
    layout: "top",
    art: "drawer",
    cards: [
      {
        id: "hdd1",
        text: "והדיסק הקשיח / שעליו היו התמונות / מהטיול אחרי הצבא",
      },
      { id: "hdd2", text: "נמצא איפשהו / בתוך *מגירה* / בבית של ההורים." },
    ],
  },
  {
    id: "trial",
    chapter: 0,
    tone: "crt",
    layout: "bottom",
    art: "errors",
    cards: [
      {
        id: "trial",
        text: "כל שאר העצות שלי / מבוססות בעיקר על / ^ניסוי וטעייה.^",
      },
    ],
  },
  {
    id: "title",
    chapter: 0,
    tone: "paper",
    layout: "center",
    art: "title",
    cards: [],
    from: 23.35,
    to: 30.2,
  },

  // ---- 1. a strange generation ---------------------------------------------
  {
    id: "strange",
    chapter: 1,
    tone: "paper",
    layout: "bottom",
    art: "generation",
    cards: [{ id: "strange", text: "אתם חלק / מדור ^מוזר.^" }],
  },
  {
    id: "analog",
    chapter: 1,
    tone: "paper",
    layout: "center",
    art: "analogDigital",
    cards: [
      { id: "analog", text: "נולדתם לעולם / ^אנלוגי^", hero: "serif" },
      { id: "digital", text: "והתבגרתם בתוך עולם / ^דיגיטלי.^", hero: "led" },
    ],
  },
  {
    id: "notknow",
    chapter: 1,
    tone: "paper",
    layout: "top",
    art: "question",
    cards: [
      { id: "remember", text: "אתם זוכרים / איך זה היה / *לא לדעת* משהו." },
      { id: "really", text: "באמת / ^לא לדעת.^" },
    ],
  },
  {
    id: "nophone",
    chapter: 1,
    tone: "paper",
    layout: "top",
    art: "nophone",
    cards: [
      { id: "pocket", text: "לא להוציא / *טלפון* מהכיס." },
      { id: "google", text: "לא לבדוק / *בגוגל.*" },
    ],
  },
  {
    id: "argue",
    chapter: 1,
    tone: "paper",
    layout: "top",
    art: "argue",
    cards: [
      { id: "argue1", text: "פשוט להתווכח / במשך ^ערב שלם^" },
      { id: "argue2", text: "אם השחקן ההוא / היה בסרט ההוא," },
    ],
  },
  {
    id: "answer",
    chapter: 1,
    tone: "paper",
    layout: "top",
    art: "threeDays",
    cards: [
      {
        id: "answer",
        text: "ולגלות את התשובה / במקרה / ^שלושה ימים^ / אחר כך.",
      },
      { id: "appreciate", text: "^תעריכו^ / את העובדה הזאת." },
    ],
  },

  // ---- 2. a childhood without an algorithm ---------------------------------
  {
    id: "algo",
    chapter: 2,
    tone: "paper",
    layout: "top",
    art: "noAlgo",
    cards: [
      {
        id: "algo",
        text: "הייתם כנראה / הדור האחרון / שהייתה לו ילדות / בלי ^אלגוריתם.^",
      },
    ],
  },
  {
    id: "outside",
    chapter: 2,
    tone: "paper",
    layout: "top",
    art: "outside",
    cards: [
      { id: "outside", text: "שיחקתם בחוץ / בלי שאף אחד ידע / *איפה אתם,*" },
      { id: "normal", text: "ואיכשהו / זה נחשב ^נורמלי.^" },
      { id: "dark", text: "חזרתם הביתה / ^כשהחשיך.^" },
    ],
  },
  {
    id: "landline",
    chapter: 2,
    tone: "dusk",
    layout: "top",
    art: "landline",
    cards: [
      { id: "called", text: "התקשרתם / *לטלפון קווי* / ושאלתם," },
      { id: "hello", text: "שלום, / אפשר לדבר / עם ^עידו?^", mode: "quote" },
      { id: "dad", text: "והייתם צריכים / להתמודד עם / ^אבא של עידו.^" },
      { id: "character", text: "זה בנה ^אופי.^" },
    ],
  },

  // ---- 3. twenty-five to thirty-five ---------------------------------------
  {
    id: "lost",
    chapter: 3,
    tone: "paper",
    layout: "top",
    art: "odometer",
    cards: [
      { id: "lostyears", text: "אל תנסו להבין / מה קרה / לכל השנים" },
      { id: "between", text: "שבין גיל ^25^ / לגיל ^35.^" },
      { id: "nobody", text: "אף אחד / לא באמת ^יודע.^" },
    ],
  },
  {
    id: "beer",
    chapter: 3,
    tone: "night",
    layout: "top",
    art: "beer",
    cards: [
      { id: "age24", text: "יום אחד / הייתם בני ^24^" },
      { id: "sidewalk", text: "שותים בירה / על מדרכה / ^בשלוש בלילה.^" },
    ],
  },
  {
    id: "vacuum",
    chapter: 3,
    tone: "sun",
    layout: "top",
    art: "vacuum",
    cards: [
      { id: "nextday", text: "למחרת / אתם משווים מחירים / של ^שואבי אבק^" },
      { id: "pan", text: "ומתלהבים / ^ממחבת טובה.^" },
      { id: "fine1", text: "זה ^בסדר.^" },
    ],
  },
  {
    id: "drink",
    chapter: 3,
    tone: "paper",
    layout: "top",
    art: "tally",
    cards: [
      { id: "said", text: "יום אחד תגלו / שאמרתם את המשפט," },
      {
        id: "cant",
        text: "אני פשוט לא יכול / ^לשתות כמו פעם.^",
        mode: "quote",
      },
      { id: "again", text: "כמה חודשים אחר כך / תגידו אותו ^שוב,^" },
      { id: "again2", text: "ואז ^עוד פעם.^" },
      { id: "stop", text: "בסוף פשוט תפסיקו / ^לשתות כמו פעם.^" },
    ],
  },

  // ---- 4. career ------------------------------------------------------------
  {
    id: "career",
    chapter: 4,
    tone: "paper",
    layout: "top",
    art: "scribble",
    cards: [
      {
        id: "career",
        text: "אל תרגישו רע / אם הקריירה שלכם / לא נראית / ^כמו שדמיינתם.^",
      },
    ],
  },
  {
    id: "choose",
    chapter: 4,
    tone: "paper",
    layout: "top",
    art: "globe",
    cards: [
      { id: "choose", text: "אמרו לכם / לבחור מקצוע / בגיל ^18^" },
      {
        id: "world",
        text: "כאילו שהעולם / לא עומד להשתנות / ^לחלוטין^ / כל 4 שנים.",
      },
    ],
  },
  {
    id: "jobs",
    chapter: 4,
    tone: "paper",
    layout: "top",
    art: "jobs",
    cards: [
      { id: "jobs1", text: "חלק מהמקצועות / שאתם עובדים בהם היום" },
      { id: "jobs2", text: "לא היו קיימים / כשהייתם ^בתיכון,^" },
      { id: "jobs3", text: "חלק מהמקצועות / שלמדתם אליהם / ^כבר לא קיימים,^" },
      { id: "jobs4", text: "וחלק מהעבודות / שתעשו / בעוד 10 שנים" },
      { id: "jobs5", text: "עדיין ^לא קיבלו שם.^" },
    ],
  },
  {
    id: "behind",
    chapter: 4,
    tone: "paper",
    layout: "top",
    art: "route",
    cards: [
      { id: "behind", text: "אתם לא ^מאחור.^" },
      { id: "route", text: "אין באמת ^מסלול.^" },
    ],
  },
  {
    id: "linkedin",
    chapter: 4,
    tone: "paper",
    layout: "top",
    art: "post",
    cards: [
      { id: "post1", text: "יש רק אנשים / שמעלים *ללינקדאין* פוסט" },
      { id: "post2", text: "אחרי שהם כבר / הגיעו ^לאנשהו^" },
      { id: "post3", text: "ומעמידים פנים / שככה הם תכננו את זה / ^מההתחלה.^" },
    ],
  },
  {
    id: "deck",
    chapter: 4,
    tone: "paper",
    layout: "top",
    art: "backstage",
    cards: [
      { id: "deck1", text: "אל תשוו את / ^מאחורי הקלעים^ / שלכם" },
      { id: "deck2", text: "למצגת המשקיעים / של *מישהו אחר.*" },
    ],
  },

  // ---- 5. the feed ------------------------------------------------------------
  {
    id: "insta",
    chapter: 5,
    tone: "paper",
    layout: "top",
    art: "grid",
    cards: [
      { id: "insta", text: "ואל תשוו / את החיים שלכם / ^לאינסטגרם.^" },
      { id: "know", text: "אתם יודעים את זה / ועדיין ^תעשו את זה.^" },
      { id: "allofus", text: "כולנו / ^עושים את זה.^" },
    ],
  },
  {
    id: "album",
    chapter: 5,
    tone: "paper",
    layout: "top",
    art: "album",
    cards: [
      { id: "fb1", text: "תזכרו שפעם / העליתם לפייסבוק" },
      { id: "fb2", text: "אלבום של ^146^ / תמונות מטושטשות / ממסיבה" },
      { id: "fb3", text: "בלי לחשוב ^פעמיים.^" },
      { id: "naive", text: "הייתה בזה / איזו ^תמימות יפה.^" },
      { id: "brand", text: "אף אחד לא חשב / על *מותג אישי,*" },
      { id: "feed", text: "אף אחד לא שאל / אם התמונה / ^מתאימה לפיד,^" },
    ],
  },
  {
    id: "there",
    chapter: 5,
    tone: "warm",
    layout: "top",
    art: "there",
    cards: [
      { id: "there", text: "פשוט / ^הייתם שם.^" },
      { id: "now", text: "נסו להיות שם / מדי פעם / ^גם עכשיו.^" },
    ],
  },

  // ---- 6. friends -------------------------------------------------------------
  {
    id: "friends",
    chapter: 6,
    tone: "paper",
    layout: "top",
    art: "friends",
    cards: [
      { id: "oldfriends", text: "אל תזלזלו / ^בחברים הישנים^ / שלכם." },
      { id: "scatter", text: "החיים יעשו / עבודה מרשימה מאוד / ^בלפזר^ אתכם." },
      { id: "abroad", text: "אחת תעבור / ^למדינה אחרת,^" },
      { id: "married", text: "אחד ^יתחתן,^" },
      { id: "baby", text: "מישהו ייעלם לחמש שנים / כי ^נולד לו ילד,^" },
      { id: "hard", text: "מישהו אחר / יהיה בתקופה קשה / ולא ^יספר^ לכם." },
    ],
  },
  {
    id: "chat",
    chapter: 6,
    tone: "paper",
    layout: "top",
    art: "groupChat",
    cards: [
      { id: "friendship", text: "ויום אחד תבינו / שחברות / בגיל ^30 ומשהו^" },
      { id: "send", text: "היא בעיקר ^לשלוח^" },
      {
        id: "chatlines",
        text: "״חייבים לקבוע״, / ״כן, לגמרי״, / ^ולא לקבוע.^",
      },
    ],
  },
  {
    id: "schedule",
    chapter: 6,
    tone: "paper",
    layout: "top",
    art: "calendar",
    cards: [
      { id: "schedule", text: "^תקבעו,^ / גם אם זה / לעוד שלושה שבועות." },
      { id: "especially", text: "^במיוחד^ / אם זה לעוד / שלושה שבועות." },
    ],
  },

  // ---- 7. parents -------------------------------------------------------------
  {
    id: "call",
    chapter: 7,
    tone: "paper",
    layout: "top",
    art: "callParents",
    cards: [
      { id: "call", text: "^תתקשרו^ / להורים שלכם," },
      { id: "notmust", text: "לא כי / אתם ^חייבים,^" },
      { id: "change", text: "כי בשלב מסוים / תתחילו להבחין / שהם ^משתנים.^" },
      { id: "subtle", text: "בהתחלה זה כמעט / ^בלתי מורגש.^" },
    ],
  },
  {
    id: "phonehelp",
    chapter: 7,
    tone: "paper",
    layout: "top",
    art: "parentChat",
    cards: [
      { id: "ask", text: "הם ישאלו אתכם / איך עושים משהו / בטלפון" },
      { id: "explained", text: "שאתם בטוחים / שכבר ^הסברתם^ להם" },
    ],
  },
  {
    id: "aging",
    chapter: 7,
    tone: "warm",
    layout: "top",
    art: "agingPhoto",
    cards: [
      { id: "look", text: "ואז יום אחד / תסתכלו עליהם / ותבינו" },
      { id: "forty", text: "שהם כבר לא / האנשים ^בני ה־40^" },
      { id: "head", text: "שאתם עדיין / ^מחזיקים בראש.^" },
    ],
  },
  {
    id: "age",
    chapter: 7,
    tone: "paper",
    layout: "top",
    art: "options",
    cards: [
      { id: "twenty", text: "גם אתם / לא בני ^20.^" },
      { id: "fine2", text: "זה ^בסדר,^" },
      { id: "afraid", text: "אל תפחדו / ^להזדקן.^" },
      { id: "alt", text: "האלטרנטיבה / ^גרועה משמעותית.^" },
    ],
  },

  // ---- 8. body and mind -------------------------------------------------------
  {
    id: "back",
    chapter: 8,
    tone: "paper",
    layout: "top",
    art: "back",
    cards: [
      { id: "back", text: "תשמרו / על ^הגב^ שלכם." },
      { id: "nokidding", text: "^לא צוחק.^" },
      { id: "at22", text: "בגיל ^22^ / אפשר לישון / על רצפה" },
      { id: "festival", text: "ולהתעורר / ^מוכן לפסטיבל.^" },
      { id: "at36", text: "בגיל ^36^ / אפשר לישון לא נכון / על כרית" },
      { id: "cancel", text: "ולבטל תוכניות / ^ליומיים.^" },
    ],
  },
  {
    id: "health",
    chapter: 8,
    tone: "paper",
    layout: "top",
    art: "health",
    cards: [
      { id: "sport", text: "^תעשו ספורט,^" },
      { id: "insta2", text: "לא כדי להיראות / כמו מישהו / באינסטגרם," },
      {
        id: "chair",
        text: "כדי שתוכלו / לקום מכיסא / בגיל ^70^ / בלי להשמיע ^רעש.^",
      },
      { id: "dentist", text: "תלכו / ^לרופא שיניים.^" },
      { id: "water", text: "^תשתו מים.^" },
      { id: "sunscreen", text: "וכן, / ^שימו קרם הגנה.^" },
      { id: "right", text: "הם צדקו / בקטע הזה.", mode: "note" },
    ],
  },
  {
    id: "therapy",
    chapter: 8,
    tone: "paper",
    layout: "top",
    art: "therapy",
    cards: [
      { id: "therapy", text: "אל תתביישו / ללכת ^לטיפול.^" },
      {
        id: "getover",
        text: "הדור של ההורים שלכם / היה אומר, / ״פשוט ^תתגבר.^״",
      },
      { id: "ask2", text: "הדור שלכם / לפחות התחיל / לשאול," },
      {
        id: "alone",
        text: "אבל למה / אני צריך / להתגבר ^לבד?^",
        mode: "quote",
      },
      { id: "progress", text: "זו ^התקדמות.^" },
    ],
  },
  {
    id: "joke",
    chapter: 8,
    tone: "paper",
    layout: "top",
    art: "labels",
    cards: [
      { id: "diagnosis", text: "אל תהפכו / כל רגש / ^לאבחנה.^" },
      { id: "joke", text: "אבל גם / אל תהפכו כל כאב / ^לבדיחה.^" },
      { id: "good", text: "אתם טובים בזה." },
      { id: "toogood", text: "^טובים מדי.^" },
    ],
  },

  // ---- 9. promises --------------------------------------------------------------
  {
    id: "promise",
    chapter: 9,
    tone: "paper",
    layout: "top",
    art: "promises",
    cards: [
      {
        id: "guilty",
        text: "אל תרגישו אשמים / על דברים / שהבטיחו לכם / ולא ^קרו.^",
      },
      { id: "learn", text: "אמרו לכם / שאם *תלמדו,*" },
      { id: "work", text: "*תעבדו קשה* / ותהיו / *אנשים אחראים,*" },
      { id: "flat", text: "תהיה לכם / ^דירה.^" },
      { id: "outdated", text: "זה היה / ^מידע מיושן.^" },
    ],
  },
  {
    id: "exam",
    chapter: 9,
    tone: "paper",
    layout: "top",
    art: "exam",
    cards: [
      { id: "failed", text: "לא אתם / ^נכשלתם^ / במבחן." },
      { id: "swapped", text: "פשוט החליפו / את השאלות / ^באמצע.^" },
    ],
  },
  {
    id: "money",
    chapter: 9,
    tone: "paper",
    layout: "top",
    art: "money",
    cards: [
      { id: "save", text: "תחסכו כסף / אם אתם יכולים," },
      { id: "travel", text: "אבל גם ^תיסעו.^" },
      { id: "eat", text: "תאכלו במסעדה / שאתם / ^רוצים לנסות.^" },
      { id: "ticket", text: "תקנו כרטיס / ^להופעה.^" },
      { id: "important", text: "כסף ^חשוב.^" },
      { id: "cheap", text: "אבל יום אחד תגלו / שחלק מהדברים / שקניתם ^בזול^" },
      { id: "expensive", text: "עלו לכם ^ביוקר,^" },
      {
        id: "story",
        text: "וחלק מהדברים / שהיו יקרים / נתנו לכם ^סיפור^ / שתספרו 20 שנה.",
      },
    ],
  },
  {
    id: "later",
    chapter: 9,
    tone: "paper",
    layout: "top",
    art: "later",
    cards: [
      { id: "later", text: "אל תשמרו / את כל הדברים הטובים / ^ל״אחר כך״.^" },
      { id: "sly", text: "״אחר כך״ / הוא יצור ^ערמומי.^" },
      { id: "free", text: "הוא תמיד נראה / פנוי יותר / מהשבוע הבא." },
      { id: "isnot", text: "^הוא לא.^" },
    ],
  },

  // ---- 10. technology -----------------------------------------------------------
  {
    id: "tech",
    chapter: 10,
    tone: "blue",
    layout: "top",
    art: "timeline",
    cards: [
      { id: "fear", text: "אל תפחדו / ^מטכנולוגיה חדשה.^" },
      { id: "done", text: "כבר עשיתם / את זה ^פעם.^" },
      { id: "internet", text: "הייתם שם / ^כשהאינטרנט^ הגיע." },
      { id: "phone", text: "כשהטלפון / הפך ^למחשב.^" },
      { id: "facebook", text: "כשהפייסבוק / היה רק ^לסטודנטים.^" },
      { id: "smartphone", text: "כשהסמארטפון / נראה ^מיותר.^" },
      { id: "cloud", text: "כשהעבודה / עברה ^לענן.^" },
    ],
  },
  {
    id: "ai",
    chapter: 10,
    tone: "blue",
    layout: "top",
    art: "ai",
    cards: [
      { id: "ai", text: "ועכשיו / אתם מסתכלים על ^AI^ / ואומרים," },
      { id: "okay", text: "^אוקיי,^", mode: "quote" },
      { id: "toofar", text: "הפעם באמת / הלכנו ^רחוק מדי.^", mode: "quote" },
      { id: "maybe", text: "^אולי.^" },
    ],
  },
  {
    id: "typed",
    chapter: 10,
    tone: "blue",
    layout: "top",
    art: "keyboard",
    cards: [
      { id: "tenyears", text: "אבל סביר להניח / שבעוד ^עשר שנים^" },
      { id: "explain", text: "תסבירו למישהו צעיר / שאתם זוכרים תקופה" },
      { id: "ourselves", text: "שבה היינו צריכים / לכתוב הכל / ^בעצמנו,^" },
      { id: "believe", text: "והוא ^לא יאמין^ לכם." },
    ],
  },

  // ---- 11. curiosity ------------------------------------------------------------
  {
    id: "young",
    chapter: 11,
    tone: "paper",
    layout: "top",
    art: "curious",
    cards: [
      { id: "young", text: "אל תנסו / להישאר ^צעירים.^" },
      { id: "boring", text: "זה סתם משעמם / וממש לא חינני / כמו שאתם חושבים." },
      { id: "curious", text: "תישארו ^סקרנים.^" },
      { id: "interesting", text: "זה הרבה יותר / ^מעניין.^" },
    ],
  },
  {
    id: "irony",
    chapter: 11,
    tone: "warm",
    layout: "top",
    art: "tape",
    cards: [
      { id: "irony", text: "תאהבו דברים / ^בלי אירוניה.^" },
      { id: "movie", text: "סרט שאתם יודעים / ^בעל פה.^" },
      { id: "theme", text: "שיר פתיחה / של ^סדרה מצוירת.^" },
      {
        id: "prize",
        text: "אין פרס בסוף החיים / על זה שהיה לכם / ^טעם מתוחכם.^",
      },
    ],
  },
  {
    id: "shoebox",
    chapter: 11,
    tone: "warm",
    layout: "top",
    art: "shoebox",
    cards: [
      { id: "silly", text: "תשמרו / דברים ^מטופשים.^" },
      { id: "items", text: "כרטיסים, / פתקים, / הודעות קוליות." },
      {
        id: "archive",
        text: "מתישהו / הם יהפכו ^לארכיון^ / של אדם שהייתם פעם.",
      },
    ],
  },
  {
    id: "screens",
    chapter: 11,
    tone: "paper",
    layout: "top",
    art: "screenshots",
    cards: [
      { id: "notall", text: "אבל / אל תשמרו ^הכול.^" },
      { id: "delete", text: "תמחקו / ^צילומי מסך.^" },
      { id: "count", text: "יש לכם / ^24,000.^" },
      { id: "dontneed", text: "אתם לא ^צריכים^ אותם." },
    ],
  },

  // ---- 12. forty ----------------------------------------------------------------
  {
    id: "forty",
    chapter: 12,
    tone: "paper",
    layout: "top",
    art: "forty",
    cards: [
      { id: "worry", text: "אל תדאגו יותר מדי / לגבי גיל ^40.^" },
      {
        id: "thought",
        text: "בגיל 20 חשבתם / שבני 40 / ^יודעים מה הם עושים.^",
      },
      {
        id: "closer",
        text: "עכשיו אתם מתקרבים לשם / ואתם מתחילים / להבין את הקטע.",
      },
      { id: "noone", text: "אף אחד לא באמת / יודע ^מה הוא עושה.^" },
    ],
  },
  {
    id: "improv",
    chapter: 12,
    tone: "sun",
    layout: "top",
    art: "improv",
    cards: [
      { id: "improv", text: "כולם ^מאלתרים.^" },
      { id: "parents2", text: "גם ההורים שלכם / ^אלתרו.^" },
      { id: "bosses", text: "גם הבוסים שלכם / ^מאלתרים.^" },
    ],
  },
  {
    id: "search",
    chapter: 12,
    tone: "night",
    layout: "top",
    art: "search",
    cards: [
      { id: "solved", text: "גם האדם / שנראה לכם / כאילו הוא ^פתר את החיים,^" },
      { id: "searched", text: "כנראה חיפש / ^אתמול בלילה^" },
      { id: "quit", text: "איך לדעת / אם הגיע הזמן / ^להתפטר.^" },
    ],
  },

  // ---- 13. nostalgia ------------------------------------------------------------
  {
    id: "nostalgia",
    chapter: 13,
    tone: "blue",
    layout: "top",
    art: "download",
    cards: [
      { id: "lie", text: "אל תיתנו לנוסטלגיה / ^לשקר^ לכם." },
      { id: "perfect", text: "העבר לא היה / ^מושלם.^" },
      { id: "slow", text: "האינטרנט היה ^איטי.^" },
      { id: "burn", text: "היינו צריכים / ^לצרוב דיסקים.^" },
      { id: "hour", text: "חיכינו ^שעה^ / כדי להוריד שיר," },
      { id: "virus", text: "ורק בסוף גילינו / שזה בכלל ^וירוס.^" },
    ],
  },
  {
    id: "beautiful",
    chapter: 13,
    tone: "warm",
    layout: "top",
    art: "memory",
    cards: [
      { id: "beautiful", text: "אבל היה משהו / ^יפה^ בזה." },
      { id: "instant", text: "לא הכל היה ^מיידי,^" },
      { id: "available", text: "לא הכל היה ^זמין,^" },
      { id: "documented", text: "לא הכל היה ^מתועד.^" },
      { id: "happened", text: "היו רגעים / שפשוט ^קרו^" },
      { id: "memory", text: "ונשארו / ^רק בזיכרון.^" },
      { id: "keep", text: "נסו להשאיר / כמה כאלה / ^גם עכשיו.^" },
    ],
  },

  // ---- 14. the adults in the room -----------------------------------------------
  {
    id: "adults",
    chapter: 14,
    tone: "paper",
    layout: "top",
    art: "youthCard",
    cards: [
      { id: "lookaround", text: "יום אחד, / תסתכלו סביבכם" },
      { id: "adults", text: "ותבינו שאתם / ^המבוגרים בחדר.^" },
      { id: "ceremony", text: "זה יקרה / בלי ^טקס,^" },
      { id: "notice", text: "בלי ^הודעה,^" },
      { id: "card", text: "בלי שמישהו יבוא / לקחת מכם את / ^תעודת הצעיר.^" },
    ],
  },
  {
    id: "msn",
    chapter: 14,
    tone: "paper",
    layout: "top",
    art: "msn",
    cards: [
      { id: "msn", text: "מישהו בן 22 / ישאל אתכם / מה זה ^MSN.^" },
      { id: "born", text: "מישהו בעבודה יגיד / שהוא נולד / ^ב־2005,^" },
      { id: "sit", text: "ואתם תרגישו / צורך ^לשבת.^" },
    ],
  },
  {
    id: "release",
    chapter: 14,
    tone: "paper",
    layout: "top",
    art: "release",
    cards: [
      { id: "panic", text: "^אל תיבהלו,^" },
      { id: "without", text: "העולם לא המשיך / ^בלעדיכם.^" },
      { id: "went", text: "הוא פשוט / ^המשיך.^" },
      { id: "you", text: "וכך גם אתם," },
      { id: "wrinkles", text: "עם קצת יותר ^קמטים,^" },
      { id: "patience", text: "קצת פחות ^סבלנות,^" },
      { id: "passwords", text: "הרבה יותר ^סיסמאות^ / ששכחתם," },
      {
        id: "sub",
        text: "וכנראה לפחות / ^מנוי אחד^ / שאתם לא זוכרים / שעשיתם.",
      },
    ],
  },
  {
    id: "versions",
    chapter: 14,
    tone: "paper",
    layout: "top",
    art: "versions",
    cards: [
      { id: "kind", text: "תהיו ^נחמדים^ / לעצמכם." },
      { id: "versions", text: "עברתם כבר / כמה ^גרסאות^ / של העולם." },
      { id: "crises", text: "^משברים,^ / ^מלחמות,^ / ^מגפה,^ / ^מיתונים,^" },
      { id: "social", text: "^רשתות חברתיות,^" },
      { id: "dating", text: "^אפליקציות היכרויות,^" },
      { id: "zoom", text: "^זום,^" },
      { id: "question", text: "והשאלה הנצחית," },
      { id: "wifi", text: "מה הסיסמה / ^לווי־פיי?^", mode: "quote" },
    ],
  },

  // ---- 15. back up --------------------------------------------------------------
  {
    id: "here",
    chapter: 15,
    tone: "warm",
    layout: "top",
    art: "todo",
    cards: [
      { id: "here", text: "ועדיין, / ^אתם כאן.^" },
      { id: "friend", text: "אז ^תתקשרו לחבר,^" },
      { id: "walk", text: "^תצאו להליכה,^" },
      { id: "dobackup", text: "^תעשו גיבוי,^" },
      { id: "photo", text: "ותצלמו מדי פעם תמונה / שלא תעלו / לשום מקום," },
      { id: "foryou", text: "רק ^בשבילכם.^" },
    ],
  },
  {
    id: "moments",
    chapter: 15,
    tone: "warm",
    layout: "top",
    art: "polaroids",
    cards: [
      { id: "inend", text: "כי ^בסוף,^" },
      {
        id: "bigmoments",
        text: "רוב החיים שלכם / לא יהיו / ^הרגעים הגדולים.^",
      },
      { id: "kitchen", text: "הם יהיו / ערב רגיל ^במטבח,^" },
      { id: "drive", text: "נסיעה / עם ^שיר טוב,^" },
      { id: "joke2", text: "בדיחה מטופשת / עם מישהו / שאתם ^אוהבים,^" },
      { id: "message", text: "הודעה / שלא ^מחקתם,^" },
      { id: "coffee", text: "קפה ביום / שלא קרה בו / ^שום דבר מיוחד.^" },
      { id: "oneday", text: "ויום אחד," },
      { id: "surprise", text: "באופן ^מפתיע,^" },
      {
        id: "miss",
        text: "דווקא ^אלה^ / יהיו הדברים / שתתגעגעו אליהם / ^הכי הרבה.^",
      },
    ],
  },
  {
    id: "outro",
    chapter: 15,
    tone: "warm",
    layout: "center",
    art: "outro",
    cards: [],
    from: 477.2,
    to: 490.15,
  },
];
