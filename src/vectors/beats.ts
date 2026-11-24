import React from "react";
import { makeCues, NARRATION_END } from "./cues";
import type { Chapter } from "./components/Header";
import { ChapterScene } from "./scenes/ChapterScene";
import {
  BrainSorting,
  ConceptsToVectors,
  MergeScene,
  PaperScene,
  StepsScene,
} from "./scenes/IntroScenes";
import {
  AdHocGift,
  CrashScene,
  DictionaryVsAdHoc,
  LLMScene,
  SameVectors,
} from "./scenes/LanguageScenes";
import {
  BioGap,
  CausalGap,
  FinalQuestion,
  HonestScene,
  OutroScene,
  RandomVsOrder,
  ThreadScene,
} from "./scenes/LimitScenes";
import {
  BrainQuestion,
  CampsScene,
  PuzzleMismatch,
  ShapeShifter,
  TugOfWar,
} from "./scenes/PuzzleScenes";
import { RoadmapScene } from "./scenes/RoadmapScene";
import {
  EconomyScene,
  ProjectionScene,
  SynthesisScene,
} from "./scenes/TaskScenes";
import {
  BirdThought,
  ParallelogramScene,
  PrototypeScene,
  RelationalScene,
  RoleBinding,
  TestScene,
  TypicalityVectors,
  WordMath,
} from "./scenes/TheoryScenes";
import {
  BindingScene,
  ChurchScene,
  DimensionsScene,
  FractionScene,
  NeighborsScene,
  ShepardScene,
  Toolbox,
  VSABridge,
} from "./scenes/ToolScenes";

export type Beat = {
  readonly id: string;
  /** Seconds on the narration track. */
  readonly start: number;
  readonly node: React.ReactNode;
};

/** Visuals land a touch before the word that motivates them. */
const LEAD = 0.15;

/** Hold the outro a moment after the last word. */
export const VIDEO_END = NARRATION_END + 2.5;

const h = React.createElement;

/**
 * The storyboard. Every beat opens at a spoken phrase, and every timed event
 * inside a scene is another phrase, converted to scene-local seconds. Lookups
 * run in narration order, so the phrases below must stay in that order.
 */
export const buildBeats = (): Beat[] => {
  const cue = makeCues();
  const beats: Beat[] = [];
  let start = 0;
  /** Opens a beat at `phrase`; returns a converter to scene-local time. */
  const open = (phrase: string | null): ((p: string) => number) => {
    start = phrase === null ? 0 : Math.max(0, cue.at(phrase) - LEAD);
    const s = start;
    return (p: string) => cue.at(p) - s;
  };
  const push = (id: string, node: React.ReactNode) =>
    beats.push({ id, start, node });

  // ── Opening ───────────────────────────────────────────────────────────
  let L = open(null);
  push("paper", h(PaperScene, { m: { paper: L("מאמר באמת מרתק") } }));

  L = open("מאמר שמנסה");
  push(
    "merge",
    h(MergeScene, {
      m: { ambitious: L("שאפתני"), decades: L("עשורים"), unify: L("ולאחד") },
    }),
  );

  L = open("הטענה המרכזית");
  push(
    "concepts",
    h(ConceptsToVectors, {
      m: {
        dog: L("כלב"),
        love: L("אהבה"),
        cause: L("סיבה"),
        vectors: L("וקטורים רב-ממדיים"),
      },
    }),
  );

  L = open("אם אי פעם");
  push(
    "brain-sorting",
    h(BrainSorting, { m: { organize: L("לארגן"), right: L("במקום הנכון") } }),
  );

  L = open("המטרה שלנו");
  push(
    "steps",
    h(StepsScene, {
      m: { breakdown: L("לפרק"), steps: L("צעד אחר צעד"), master: L("ולשלוט") },
    }),
  );

  L = open("אז מה התוכנית");
  push(
    "roadmap",
    h(RoadmapScene, {
      title: "התוכנית שלנו",
      items: [
        {
          emoji: "🧩",
          label: "החידה של ייצוג מושגים",
          at: L("החידה של ייצוג"),
        },
        { emoji: "🏹", label: "וקטורים: פתרון מאחד", at: L("וקטורים מציעים") },
        {
          emoji: "🧪",
          label: "התאמה לתאוריות פסיכולוגיות",
          at: L("מתאים לתאוריות"),
        },
        { emoji: "💬", label: "שפה, לוגיקה והקשר", at: L("שפה, לוגיקה") },
        {
          emoji: "🎯",
          label: "מודל מאוחד למשימות מרובות",
          at: L("המודל המאוחד"),
        },
        { emoji: "🔭", label: "מגבלות ומבט לעתיד", at: L("המגבלות") },
      ],
    }),
  );

  // ── Part 1: the puzzle ────────────────────────────────────────────────
  L = open("יאללה, חלק ראשון");
  push(
    "ch1",
    h(ChapterScene, { n: 1, title: "החידה של ייצוג מושגים", emoji: "🧩" }),
  );

  L = open("השאלה הגדולה");
  push(
    "brain-question",
    h(BrainQuestion, {
      m: { heads: L("שוברים"), how: L("איך המוח"), store: L("מאכסן") },
    }),
  );

  L = open("הרי מצד אחד");
  push(
    "tug",
    h(TugOfWar, {
      m: {
        rules: L("בחוקים ברורים"),
        flex: L("גמישים"),
        same: L("באותו הזמן"),
      },
    }),
  );

  L = open("פילוסופים");
  push(
    "shape-shifter",
    h(ShapeShifter, {
      m: {
        animal: L("חיה מורכבת"),
        rule: L("כלל נוקשה"),
        fuzzy: L("מעורפל"),
        neighbors: L("שלידו"),
      },
    }),
  );

  L = open("ובמשך המון שנים");
  push(
    "camps",
    h(CampsScene, {
      m: {
        split: L("חצוי לשניים"),
        symbolic: L("המחנה הסימבולי"),
        rules: L("סמלים וחוקים"),
        complex: L("מחשבות מורכבות"),
        other: L("אבל מצד שני"),
        nets: L("הרשתות העצביות"),
        noise: L("רעש רקע"),
        gradual: L("למידה הדרגתית"),
        partial: L("לא שלם"),
      },
    }),
  );

  L = open("במשך העשורים");
  push(
    "mismatch",
    h(PuzzleMismatch, {
      m: { none: L("אין מצב"), single: L("ייצוג אחד"), both: L("שני המחנות") },
    }),
  );

  // ── Part 2: vectors, the unifying solution ────────────────────────────
  L = open("ואז מגיע החלק שני");
  push(
    "ch2",
    h(ChapterScene, { n: 2, title: "וקטורים: הפתרון המאחד", emoji: "🏹" }),
  );

  L = open("אז כדי שבאמת");
  push("toolbox", h(Toolbox, { m: { open: L("ארגז הכלים") } }));

  L = open("הכלי הראשון");
  push(
    "dimensions",
    h(DimensionsScene, {
      m: {
        scary: L("מאיים"),
        grid: L("רשת גיאומטרית"),
        head: L("בתוך הראש"),
        hundreds: L("מאות"),
        thousands: L("אלפי ממדים"),
      },
    }),
  );

  L = open("במרחב המטורף");
  push(
    "neighbors",
    h(NeighborsScene, {
      m: {
        isolated: L("נקודה מבודדת"),
        notAtAll: L("ממש לא"),
        distance: L("המרחק והיחס"),
        closer: L("ככל ששני"),
      },
    }),
  );

  L = open("חוקר בשם");
  push(
    "shepard",
    h(ShepardScene, {
      m: { shepard: L("רוג'ר שפרד"), map: L("למפות"), oneToOne: L("אחד לאחד") },
    }),
  );

  L = open("הכלי השני");
  push(
    "church",
    h(ChurchScene, {
      m: {
        brilliant: L("מבריק"),
        abstract: L("סמלים ממש מופשטים"),
        physical: L("חיבור ישיר"),
        role: L("מהתפקיד"),
      },
    }),
  );

  L = open("קחו לדוגמה מחשב");
  push(
    "fractions",
    h(FractionScene, {
      m: {
        apple: L("חצי תפוח"),
        integers: L("שני מספרים שלמים"),
        rules: L("סדרה של חוקים"),
        fraction: L("התנהגות של שבר"),
        same: L("באותה צורה"),
      },
    }),
  );

  L = open("והכלי השלישי");
  push(
    "vsa",
    h(VSABridge, {
      m: {
        bridge: L("הגשר"),
        math: L("במתמטיקה"),
        add: L("חיבור"),
        mul: L("וכפל"),
        lock: L("לנעול"),
        binding: L("קישור"),
      },
    }),
  );

  L = open("תחשבו שאתם רוצים");
  push(
    "binding",
    h(BindingScene, {
      m: {
        gw: L("ג'ורג' וושינגטון"),
        va: L("וירג'יניה"),
        multiply: L("הכפלה"),
        newSym: L("סמל חדש"),
        retrieve: L("לשלוף"),
        genius: L("גאוני"),
      },
    }),
  );

  // ── Part 3: fit with familiar theories ────────────────────────────────
  L = open("מתקדמים לחלק השלישי");
  push(
    "ch3",
    h(ChapterScene, { n: 3, title: "התאמה לתאוריות מוכרות", emoji: "🧪" }),
  );

  L = open("עכשיו למבחן");
  push(
    "test",
    h(TestScene, {
      m: {
        test: L("האמיתי") - 0.4,
        math: L("המתמטיקה"),
        psych: L("הפסיכולוגיה הקלאסית"),
      },
    }),
  );

  L = open("ניקח למשל");
  push(
    "prototype",
    h(PrototypeScene, {
      m: {
        proto: L("תאוריית האב-טיפוס"),
        bw: L("שחור ולבן"),
        fuzzy: L("מעורפלות"),
        typical: L("אופייניות"),
        faster: L("נזהה אותו מהר"),
      },
    }),
  );

  L = open("לכן, אם אבקש");
  push(
    "birds",
    h(BirdThought, {
      m: {
        bird: L("על ציפור"),
        sparrow: L("דרור"),
        penguin: L("פינגווין"),
        typical: L("ציפורים טיפוסיות"),
        fast: L("מגיב"),
      },
    }),
  );

  L = open("אז תראו איזה יופי");
  push(
    "typicality",
    h(TypicalityVectors, {
      m: {
        space: L("המרחק המרחבי"),
        robin: L("הוקטור שמייצג"),
        penguin: L("שהוקטור של הפינגווין"),
        rt: L("לזמני תגובה"),
      },
    }),
  );

  L = open("ואז יש לנו את הגישה");
  push(
    "relational",
    h(RelationalScene, {
      m: {
        relational: L("היחסית") - 0.3,
        vacuum: L("בוואקום"),
        cause: L("המילה סיבה"),
        alone: L("לבד"),
        lightning: L("הברק גרם"),
        roles: L("הברק הוא הסיבה"),
        effect: L("התוצאה"),
      },
    }),
  );

  L = open("זה דורש מהמוח");
  push(
    "roles",
    h(RoleBinding, {
      m: {
        bind: L("לקשור דברים"),
        analogies: L("אנלוגיות"),
        problems: L("ובעיות"),
      },
    }),
  );

  L = open("וזה השלב שבו");
  push(
    "word-math",
    h(WordMath, {
      m: {
        math: L("שמתמטיקה וקטורית"),
        add: L("לחבר ולחסר"),
        numbers: L("כאילו היו מספרים"),
        complex: L("אנלוגיות אנושיות"),
      },
    }),
  );

  L = open("במודל הזה");
  push(
    "parallelogram",
    h(ParallelogramScene, {
      m: {
        model: L("מודל המקבילית"),
        apple: L("תפוח מתייחס"),
        car: L("שרכב"),
        cars: L("לרכבים"),
        applePlus: L("המילה תפוח פלוס"),
        carsW: L("המילה רכבים"),
        carMinus: L("המילה רכב"),
        point: L("הנקודה הגיאומטרית"),
        apples: L("המילה תפוחים"),
      },
    }),
  );

  // ── Part 4: language, logic and context ───────────────────────────────
  L = open("חלק רביעי");
  push(
    "ch4",
    h(ChapterScene, { n: 4, title: "שפה, לוגיקה והקשר", emoji: "💬" }),
  );

  L = open("כאן אנחנו נכנסים");
  push(
    "crash",
    h(CrashScene, { m: { old: L("שמודלים ישנים"), crash: L("התרסקו") } }),
  );

  L = open("מצד אחד יש לנו");
  push(
    "dictionary",
    h(DictionaryVsAdHoc, {
      m: {
        classic: L("המושגים הקלאסיים"),
        dict: L("ההגדרות המילוניות"),
        adhoc: L("מושגי אד-הוק"),
        invent: L("ממציאים"),
        goal: L("מטרה ספציפית"),
      },
    }),
  );

  L = open("למשל, תחשבו על הקטגוריה");
  push(
    "gift",
    h(AdHocGift, {
      m: {
        category: L("דברים שכדאי") - 0.6,
        noWord: L("אין במילון"),
        gathers: L("ומקבץ"),
        pen: L("עט יוקרתי"),
        coffee: L("מארז קפה"),
      },
    }),
  );

  L = open("אז איך המוח שלנו מלהטט");
  push(
    "llm",
    h(LLMScene, {
      m: {
        juggle: L("מלהטט"),
        tech: L("בטכנולוגיה"),
        llms: L("ה-LLMs"),
        both: L("את שני הדברים"),
        same: L("באותו מרחב"),
      },
    }),
  );

  L = open("אותה קבוצת וקטורים");
  push(
    "same-vectors",
    h(SameVectors, {
      m: {
        set: 0.1,
        dict: L("הגדרה מילונית"),
        gifts: L("מתנות לסופר"),
        context: L("ההקשר"),
        flex: L("הגמישות"),
      },
    }),
  );

  // ── Part 5: one model, many tasks ─────────────────────────────────────
  L = open("חלק חמישי");
  push(
    "ch5",
    h(ChapterScene, { n: 5, title: "מודל מאוחד למשימות מרובות", emoji: "🎯" }),
  );

  L = open("תראו, זו הסינתזה");
  push(
    "synthesis",
    h(SynthesisScene, { m: { synth: L("הסינתזה"), beautiful: L("יפהפה") } }),
  );

  L = open("שימו לב לרעיון");
  push(
    "projection",
    h(ProjectionScene, {
      m: {
        latent: L("מושג סמוי"),
        ltm: L("בזיכרון לטווח"),
        dog: L("המושג כלב"),
        down: L("מוקרן כלפי מטה"),
        features: L("מאפיינים"),
        categorize: L("לקטלג"),
        similarity: L("דמיון גיאומטרי"),
        talk: L("לדבר עליו"),
        shape: L("הצורה הגיאומטרית"),
        hats: L("מחליף כובעים"),
      },
    }),
  );

  L = open("לשיטה הזו קוראים");
  push(
    "economy",
    h(EconomyScene, {
      m: {
        mtl: L("למידה מרובת משימות"),
        economy: L("חסכונית"),
        street: L("לזהות אותו ברחוב"),
        define: L("להגדיר"),
        mess: L("הבלאגן"),
        oneSet: L("סט מרכזי"),
        lenses: L("עדשות"),
      },
    }),
  );

  // ── Part 6: limits and the road ahead ─────────────────────────────────
  L = open("והגענו לחלק השישי");
  push(
    "ch6",
    h(ChapterScene, { n: 6, title: "מגבלות ומבט לעתיד", emoji: "🔭" }),
  );

  L = open("כדי שבאמת נבין");
  push(
    "honest",
    h(HonestScene, { m: { limits: L("המגבלות של"), honest: L("כנים") } }),
  );

  L = open("קודם כל");
  push(
    "bio",
    h(BioGap, {
      m: {
        numbers: L("המספרים והווקטורים"),
        neurons: L("נוירונים"),
        wet: L("הרטוב"),
      },
    }),
  );

  L = open("שנית");
  push(
    "causal",
    h(CausalGap, {
      m: {
        models: L("המודלים הממוחשבים"),
        causal: L("הבנה סיבתית"),
        child: L("ילד קטן"),
      },
    }),
  );

  L = open("ושלישית");
  push(
    "random-order",
    h(RandomVsOrder, {
      m: {
        clash: L("התנגשות"),
        random: L("האקראיות"),
        order: L("הסדר הגיאומטרי"),
        work: L("עוד לא מעט עבודה"),
      },
    }),
  );

  L = open("אבל, וזה אבל ענק");
  push(
    "thread",
    h(ThreadScene, {
      m: { but: LEAD, thread: L("החוט המקשר"), strong: L("ראיות סופר חזקות") },
    }),
  );

  L = open("וזה בעצם משאיר");
  push(
    "final-question",
    h(FinalQuestion, {
      m: {
        richness: L("העושר"),
        creativity: L("היצירתיות"),
        memories: L("הזיכרונות"),
        connections: L("והקשרים"),
        network: L("רשת גיאומטרית"),
        crazy: L("די מטורפת"),
      },
    }),
  );

  L = open("תודה רבה");
  push("outro", h(OutroScene, { m: { keep: L("תמשיכו לחשוב") } }));

  return beats;
};

/** Chapter titles for the header, placed at their spoken announcements. */
export const CHAPTERS: Chapter[] = (() => {
  const cue = makeCues();
  return [
    { title: "למה מושגים הם וקטורים?", start: 0 },
    { title: "החידה של ייצוג מושגים", start: cue.at("יאללה, חלק ראשון") },
    { title: "וקטורים: הפתרון המאחד", start: cue.at("ואז מגיע החלק שני") },
    { title: "התאמה לתאוריות מוכרות", start: cue.at("מתקדמים לחלק השלישי") },
    { title: "שפה, לוגיקה והקשר", start: cue.at("חלק רביעי") },
    { title: "מודל מאוחד למשימות", start: cue.at("חלק חמישי") },
    { title: "מגבלות ומבט לעתיד", start: cue.at("והגענו לחלק השישי") },
  ];
})();
