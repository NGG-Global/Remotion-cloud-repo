import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { LineIcon } from "../graphics/LineIcon";
import { RestatedProcedure } from "../graphics/RestatedProcedure";
import { RuleRouter } from "../graphics/RuleRouter";
import { SameWayAnySubject } from "../graphics/SameWayAnySubject";
import { SkillFromDoing } from "../graphics/SkillFromDoing";
import { SkillMatch } from "../graphics/SkillMatch";
import { SkillPackage } from "../graphics/SkillPackage";
import { SkillsList } from "../graphics/SkillsList";
import { SkillsSettings } from "../graphics/SkillsSettings";
import { ScopeCompare } from "../graphics/ScopeCompare";
import { SkillSheet } from "../graphics/parts/SkillSheet";
import type { SkillSection } from "../graphics/parts/SkillsUI";
import { CanvasScene } from "../scenes/CanvasScene";
import { CardsScene } from "../scenes/CardsScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP8, type BeatIdEp8 } from "../script";
import { COLORS, seconds } from "../theme";

/** The narration, plus a beat of air at the end. */
export const CLAUDE_SKILLS_DURATION = seconds(EP8.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/** Places a scene on episode 8's narration timeline. */
const Beat: React.FC<{
  readonly id: BeatIdEp8;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP8.at(id))}
    durationInFrames={seconds(EP8.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/**
 * The skill the episode builds, named once.
 *
 * A weekly client report: the narration's own example of a task that comes
 * round every week and gets re-explained every time.
 */
const SKILL = "ngg-weekly-report";

/** The procedure, in the wording the opening leaves it in. */
const STEPS = [
  "לפי התבנית שלנו",
  "שלושה חלקים, בסדר הזה",
  "בעברית, בטון מקצועי",
  "רק נתונים שאושרו",
];

/**
 * The skills panel's contents.
 *
 * Every name and description here is written for the video. The captured
 * panel carries an organisation's whole private tooling and, on the shared
 * row, the name of the colleague who shared it — so the author of a shared
 * skill is a role, and only the skills this episode actually teaches appear.
 */
const NGG_SKILLS: SkillSection = {
  title: "Created by you",
  entries: [
    {
      name: "ngg-weekly-report",
      by: "by you",
      description: "בונה את הדוח השבועי ללקוח לפי התבנית והכללים שלנו",
      date: "May 13",
      at: seconds(0.6),
    },
    {
      name: "ngg-team-availability",
      by: "by you",
      description: "בודק זמינות של הצוות ועומס דליברי מול היומנים המשותפים",
      date: "May 25",
      at: seconds(1.2),
    },
  ],
};

const SHARED_SKILL: SkillSection = {
  title: "Shared with you",
  entries: [
    {
      name: "ngg-design",
      by: "משותף לצוות",
      description: "יוצר מצגות לפי התבניות והסגנון הרשמיים של הקבוצה",
      off: true,
      at: seconds(1.8),
    },
  ],
};

const ANTHROPIC_SKILLS: SkillSection = {
  title: "From Anthropic & Partners",
  entries: [
    {
      name: "pptx",
      by: "from Anthropic",
      description: "יוצר, קורא ועורך קבצי PowerPoint",
      date: "Sep 14",
      at: seconds(0.6),
    },
    {
      name: "xlsx",
      by: "from Anthropic",
      description: "עובד עם גיליונות — קריאה, עריכה ונוסחאות",
      date: "Sep 14",
      at: seconds(1.1),
    },
  ],
};

/** A centred illustration, for the statement scenes that carry one. */
const Icon: React.FC<{
  readonly name: Parameters<typeof LineIcon>[0]["name"];
  readonly color?: string;
}> = ({ name, color = COLORS.accent }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <LineIcon
      name={name}
      size={220}
      color={color}
      drawFrames={seconds(1.0)}
      idle
    />
  </div>
);

/**
 * Episode 8: skills.
 *
 * The narration makes one distinction and then defends it from three angles: a
 * project holds what you are working on, a skill holds how you work. So the
 * episode is built around pictures of scope rather than definitions — a
 * procedure re-explained and then packaged, a request that finds its own
 * skill, three columns lighting different amounts of the same board, and a
 * rule of thumb drawn as a fork with two branches. The interface appears at
 * the one point the narration sends the viewer to look, and is rebuilt rather
 * than screenshotted for the usual reason: the real panel is somebody's.
 */
export const ClaudeSkills: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep8.mp3")} />

      {/* The cost, stated as repetition of a procedure rather than of context:
          three weeks of the same instructions in three different wordings. */}
      <Beat id="hook" extend={EP8.length("same-request")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.6),
              text: "משימה שחוזרת — ובכל פעם מסבירים מחדש איך",
              emphasise: ["מחדש"],
            },
            {
              at: seconds(7.8),
              text: "אותו פורמט, אותם כללים — רק בניסוח אחר",
              emphasise: ["אותו", "אותם"],
            },
          ]}
        >
          {(size) => (
            <RestatedProcedure
              {...size}
              rounds={[
                {
                  label: "שבוע 1",
                  steps: [
                    "לפי התבנית שלנו",
                    "שלושה חלקים, בסדר הזה",
                    "טון מקצועי, בעברית",
                    "בלי נתונים שלא אושרו",
                  ],
                  at: seconds(0.3),
                },
                {
                  label: "שבוע 2",
                  steps: [
                    "תשתמש בתבנית הרגילה",
                    "קודם רקע, אחר כך ממצאים",
                    "לכתוב בעברית, מקצועי",
                    "לא להמציא מספרים",
                  ],
                  at: seconds(3.0),
                },
                {
                  label: "שבוע 3",
                  steps: [
                    "כמו תמיד — התבנית שלנו",
                    "אותו מבנה של שלושה חלקים",
                    "בעברית, בטון מקצועי",
                    "רק נתונים שאושרו",
                  ],
                  at: seconds(5.7),
                },
              ]}
              alignAt={seconds(8.2)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק שמיני"
          title="סקילס"
          subtitle="חבילת הוראות קבועה למשימה שחוזרת"
        />
      </Beat>

      {/* Defined once, and then present in places nobody installed it. Held
          across both beats so the second reads as a consequence of the first. */}
      <Beat
        id="define-once"
        extend={EP8.length("package") + EP8.length("everywhere")}
      >
        <CanvasScene
          captions={[
            {
              at: seconds(0.5),
              text: "מגדירים את התהליך פעם אחת",
              emphasise: ["פעם", "אחת"],
            },
            { at: seconds(4.2), text: "וזהו — יש סקיל" },
            {
              at: seconds(11.3),
              text: "חבילת הוראות קבועה למשימה שחוזרת",
              emphasise: ["קבועה"],
            },
            {
              at: seconds(15.7),
              text: "לא שייך לפרויקט אחד — זמין בכל מקום",
              emphasise: ["בכל", "מקום"],
            },
          ]}
        >
          {(size) => (
            <SkillPackage
              {...size}
              steps={STEPS}
              skillName={SKILL}
              foldAt={seconds(2.4)}
              spreadAt={seconds(16.0)}
              destinations={[
                { label: "שיחה חדשה", icon: "quote" },
                { label: "פרויקט לקוח א׳", icon: "files" },
                { label: "פרויקט לקוח ב׳", icon: "files" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="no-need-to-ask">
        <StatementScene
          statement="ולא תמיד צריך בכלל לבקש ממנו להפעיל אותו"
          emphasise={["בכלל"]}
          align="center"
        />
      </Beat>

      {/* Nobody invokes a skill: the request finds it. */}
      <Beat id="match">
        <CanvasScene
          captions={[
            { at: seconds(0.5), text: "פשוט מבקשים את מה שצריך" },
            {
              at: seconds(3.4),
              text: "וקלוד מזהה שהמשימה מתאימה לסקיל — ומשתמש בו",
              emphasise: ["מזהה"],
            },
          ]}
        >
          {(size) => (
            <SkillMatch
              {...size}
              request="תכין את הדוח השבועי ללקוח"
              skills={[
                {
                  name: SKILL,
                  description: "בונה את הדוח השבועי לפי התבנית והכללים שלנו",
                  icon: "report",
                },
                {
                  name: "ngg-team-availability",
                  description: "בודק זמינות של הצוות מול היומנים המשותפים",
                  icon: "calendar",
                },
                {
                  name: "ngg-design",
                  description: "יוצר מצגות לפי התבניות הרשמיות של הקבוצה",
                  icon: "slides",
                },
              ]}
              matchIndex={0}
              scanAt={seconds(1.2)}
              matchAt={seconds(3.3)}
              steps={STEPS}
              stepsAt={seconds(4.4)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="three-things">
        <StatementScene
          kicker="וכאן חשוב להבין"
          statement="את ההבדל בין שלושה דברים שנשמעים דומים"
          emphasise={["שלושה"]}
          align="center"
        />
      </Beat>

      {/* The distinction the narration says people get wrong, drawn as reach:
          the same board under each column, and a different part of it lit. */}
      <Beat
        id="scope"
        extend={EP8.length("project-scope") + EP8.length("skill-scope")}
      >
        <CanvasScene
          captions={[
            {
              at: seconds(0.5),
              text: "בקשה רגילה בצ׳אט — חד־פעמית",
              emphasise: ["חד־פעמית"],
            },
            { at: seconds(3.9), text: "מסבירים עכשיו מה רוצים למשימה הזאת" },
            {
              at: seconds(7.0),
              text: "פרויקט שומר קונטקסט קבוע סביב נושא",
              emphasise: ["קבוע"],
            },
            { at: seconds(11.3), text: "לקוח, פרויקט או תחום עבודה" },
            {
              at: seconds(14.8),
              text: "חומרים והוראות — ששייכים לפרויקט הזה",
              emphasise: ["ששייכים"],
            },
            {
              at: seconds(19.3),
              text: "סקיל עושה משהו אחר",
              emphasise: ["אחר"],
            },
            {
              at: seconds(21.6),
              text: "לא על מה אנחנו עובדים — איך אנחנו עובדים",
              emphasise: ["איך"],
            },
          ]}
        >
          {(size) => (
            <ScopeCompare
              {...size}
              gridLabel="כל ריבוע — שיחה"
              columns={[
                {
                  title: "בקשה בצ׳אט",
                  note: "חד־פעמית. נגמרת עם השיחה",
                  icon: "quote",
                  reach: "one",
                  at: seconds(0.3),
                  lightAt: seconds(1.6),
                },
                {
                  title: "פרויקט",
                  note: "על מה אנחנו עובדים — נושא אחד וכל השיחות שלו",
                  icon: "files",
                  reach: "row",
                  at: seconds(6.9),
                  lightAt: seconds(8.6),
                },
                {
                  title: "סקיל",
                  note: "איך אנחנו עובדים — בכל שיחה, בכל נושא",
                  icon: "repeat",
                  reach: "all",
                  at: seconds(19.3),
                  lightAt: seconds(21.6),
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* A negative claim — it does not need to know who the client is — drawn
          by ruling the subjects out and letting the outputs keep their shape. */}
      <Beat id="any-subject">
        <CanvasScene
          captions={[
            {
              at: seconds(0.6),
              text: "הוא לא צריך לדעת מי הלקוח",
              emphasise: ["לא"],
            },
            {
              at: seconds(4.6),
              text: "רק איך אנחנו רוצים שזה ייצא — בכל פעם",
              emphasise: ["איך"],
            },
          ]}
        >
          {(size) => (
            <SameWayAnySubject
              {...size}
              subjects={["לקוח א׳", "לקוח ב׳", "פנימי"]}
              dismissAt={seconds(1.2)}
              skillName={SKILL}
              skillAt={seconds(2.3)}
              outputs={[
                { tag: "דוח", icon: "report" },
                { tag: "מצגת", icon: "slides" },
                { tag: "תהליך", icon: "flow" },
              ]}
              outputsAt={seconds(4.4)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* The rule of thumb as a fork: same junction, different branch. */}
      <Beat id="rule" extend={EP8.length("rule-skill")}>
        <CanvasScene
          captions={[{ at: seconds(0.4), text: "הדרך הכי פשוטה לזכור את זה" }]}
        >
          {(size) => (
            <RuleRouter
              {...size}
              targets={[
                { label: "פרויקט", icon: "files" },
                { label: "סקיל", icon: "repeat" },
              ]}
              questions={[
                {
                  text: "על מי או על מה אנחנו עובדים?",
                  to: 0,
                  at: seconds(0.8),
                },
                {
                  text: "איך אנחנו תמיד עושים את זה?",
                  to: 1,
                  at: seconds(7.6),
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="good-news">
        <StatementScene
          kicker="ועכשיו לחדשות הטובות"
          statement="לא חייבים להתחיל מאפס"
          emphasise={["מאפס"]}
          align="center"
        />
      </Beat>

      {/* The library. The general skills lead, because that is the order the
          narration introduces them in. */}
      <Beat id="library" extend={EP8.length("kinds")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.5),
              text: "ב‑NGG כבר יש ספרייה של סקילס מוכנים",
              emphasise: ["כבר"],
            },
            {
              at: seconds(3.6),
              text: "חלקם כלליים — לעבודה עם מסמכים וקבצים",
            },
            {
              at: seconds(7.6),
              text: "וחלקם נבנו במיוחד לתהליכים שלנו",
              emphasise: ["במיוחד"],
            },
          ]}
        >
          {(size) => (
            <SkillsList
              {...size}
              sections={[
                ANTHROPIC_SKILLS,
                {
                  ...NGG_SKILLS,
                  entries: NGG_SKILLS.entries.map((entry, i) => ({
                    ...entry,
                    at: seconds(6.4 + i * 0.6),
                  })),
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Where to look, and what the list is telling you. */}
      <Beat id="in-settings" extend={EP8.length("org-ready")}>
        <CanvasScene
          captions={[
            { at: seconds(0.6), text: "בהגדרות — Customize ← Skills" },
            {
              at: seconds(3.2),
              text: "רואים אילו סקילס יש — ואילו מהם מופעלים",
              emphasise: ["מופעלים"],
            },
            {
              at: seconds(7.0),
              text: "ואם סקיל הוגדר לארגון — הוא כבר זמין לכם",
              emphasise: ["כבר"],
            },
            {
              at: seconds(11.4),
              text: "בלי לבנות ובלי להתקין כלום",
              emphasise: ["בלי"],
            },
          ]}
        >
          {(size) => (
            <SkillsSettings
              {...size}
              count={5}
              sections={[
                {
                  ...NGG_SKILLS,
                  entries: NGG_SKILLS.entries.map((entry) => ({
                    ...entry,
                    description: "",
                  })),
                },
                {
                  ...SHARED_SKILL,
                  entries: SHARED_SKILL.entries.map((entry) => ({
                    ...entry,
                    description: "",
                  })),
                },
                {
                  ...ANTHROPIC_SKILLS,
                  entries: ANTHROPIC_SKILLS.entries.map((entry, i) => ({
                    ...entry,
                    description: "",
                    at: seconds(2.2 + i * 0.3),
                  })),
                },
              ]}
              ring={[
                { at: seconds(0.7), part: "skills-nav" },
                { at: seconds(3.4), part: "list" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="check-first">
        <ContrastScene
          not={{ label: "במקום", lines: ["לבנות סקיל חדש מאפס"] }}
          but={{ label: "קודם כל", lines: ["לבדוק אם כבר קיים אחד כזה"] }}
          butAt={seconds(3.6)}
        />
      </Beat>

      <Beat id="when-new">
        <StatementScene
          statement="אז מתי כן שווה ליצור סקיל חדש?"
          align="center"
        />
      </Beat>

      <Beat id="when-items">
        <ItemsScene
          kicker="כשכל אלה מתקיימים"
          blockWidth={1080}
          items={[
            {
              text: "תהליך שחוזר אצלכם שוב ושוב",
              icon: "repeat",
              at: seconds(0.4),
            },
            { text: "דרך עבודה די קבועה", icon: "framework", at: seconds(2.8) },
            {
              text: "ואתם מסבירים אותה מחדש בכל פעם",
              icon: "quote",
              at: seconds(5.2),
            },
          ]}
        />
      </Beat>

      <Beat id="two-ways">
        <StatementScene
          statement="יש שתי דרכים לעשות את זה"
          emphasise={["שתי"]}
          align="center"
        />
      </Beat>

      {/* The first way: write the file. The labels are the content; the body
          stays bars so nobody reads ahead of the narrator. */}
      <Beat id="write-it">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "אפשר לכתוב את ההוראות בעצמכם",
              emphasise: ["בעצמכם"],
            },
          ]}
        >
          {(size) => (
            <div
              style={{
                width: size.width,
                height: size.height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SkillSheet
                width={Math.min(size.width * 0.56, 960)}
                height={size.height * 0.96}
                title={SKILL}
                blocks={[
                  { label: "מה התהליך", lines: 2, at: seconds(0.6) },
                  { label: "מה הפורמט הרצוי", lines: 2, at: seconds(2.3) },
                  { label: "מה חובה לעשות", lines: 2, at: seconds(3.9) },
                  { label: "ומה אסור", lines: 1, at: seconds(5.5) },
                ]}
              />
            </div>
          )}
        </CanvasScene>
      </Beat>

      {/* The second way: do the job once, out loud, and let the draft come out
          of the working rather than out of an authoring session. */}
      <Beat id="show-it">
        <CanvasScene
          captions={[
            {
              at: seconds(0.5),
              text: "או פשוט לעשות את זה פעם אחת — ולהסביר תוך כדי",
              emphasise: ["פעם", "אחת"],
            },
            {
              at: seconds(7.4),
              text: "וקלוד הופך את זה לטיוטת סקיל",
              emphasise: ["טיוטת"],
            },
          ]}
        >
          {(size) => (
            <SkillFromDoing
              {...size}
              turns={[
                {
                  from: "you",
                  text: "בוא נכין את הדוח השבועי — אני אסביר תוך כדי",
                  at: seconds(0.4),
                },
                {
                  from: "you",
                  text: "קודם התבנית שלנו, אחר כך שלושת החלקים",
                  at: seconds(2.4),
                },
                {
                  from: "you",
                  text: "בעברית, טון מקצועי, רק נתונים שאושרו",
                  at: seconds(4.3),
                },
                {
                  from: "claude",
                  text: "רוצה שאהפוך את זה לסקיל?",
                  at: seconds(6.1),
                },
              ]}
              draftAt={seconds(7.2)}
              title={SKILL}
              blocks={[
                { label: "מה התהליך", lines: 2, at: seconds(0.3) },
                { label: "מה הפורמט", lines: 2, at: seconds(1.1) },
                { label: "מה חובה", lines: 1, at: seconds(1.9) },
                { label: "ומה אסור", lines: 1, at: seconds(2.7) },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="thumb">
        <StatementScene statement="כלל האצבע פשוט" align="center" />
      </Beat>

      <Beat id="new-hire">
        <StatementScene
          kicker="אם הייתם מסבירים את זה לעובד חדש"
          statement="׳ככה אנחנו תמיד עושים את זה׳"
          emphasise={["תמיד"]}
          footnote="יש סיכוי טוב שזה צריך להיות סקיל"
          align="start"
          graphic={() => <Icon name="person" />}
          panel={{ width: 320, height: 320 }}
        />
      </Beat>

      <Beat id="recap">
        <CardsScene
          cards={[
            {
              title: "פרויקט",
              note: "זוכר את ההקשר — על מי ועל מה אנחנו עובדים",
              glyph: "folder",
            },
            {
              title: "סקיל",
              note: "זוכר את דרך העבודה — איך אנחנו עושים את זה",
              glyph: "wand",
            },
          ]}
          startAt={seconds(0.4)}
          stagger={seconds(2.4)}
        />
      </Beat>

      <Beat id="both">
        <StatementScene
          statement="ואפשר כמובן להשתמש בשניהם יחד"
          emphasise={["בשניהם"]}
          align="center"
        />
      </Beat>

      <Beat id="module-done">
        <StatementScene
          statement="בזה סיימנו את מודול היכולות"
          emphasise={["היכולות"]}
          align="center"
        />
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="מכאן — עוברים לקו־וורק"
          emphasise={["לקו־וורק"]}
          nextUp="להעביר לקלוד משימות שלמות, במקום לנהל איתו כל שלב ידנית"
          nextLabel="במודול הבא"
        />
      </Beat>
    </AbsoluteFill>
  );
};
