import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { ComposerMenu, type MenuItem } from "../graphics/ComposerMenu";
import { DesignSystemApply } from "../graphics/DesignSystemApply";
import { DesignTooEarly } from "../graphics/DesignTooEarly";
import { EditCostCompare } from "../graphics/EditCostCompare";
import { LineIcon } from "../graphics/LineIcon";
import { MaterialToDeck } from "../graphics/MaterialToDeck";
import { RoundsConverge } from "../graphics/RoundsConverge";
import { RuleRouter } from "../graphics/RuleRouter";
import { SlidesArtifact } from "../graphics/SlidesArtifact";
import { StorylineEdit } from "../graphics/StorylineEdit";
import { CanvasScene } from "../scenes/CanvasScene";
import { CardsScene } from "../scenes/CardsScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { ShowcaseScene } from "../scenes/ShowcaseScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP9, type BeatIdEp9 } from "../script";
import { COLORS, seconds } from "../theme";
import { AttachedChips } from "../ui/AttachedChips";
import { SCREENS } from "../ui/screens";
import { TypedPrompt } from "../ui/TypedPrompt";

const HOME = SCREENS.home.regions;
const WINDOW = 1560;

/** The narration, plus a beat of air at the end. */
export const CLAUDE_DESIGN_DURATION = seconds(EP9.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/** Places a scene on episode 9's narration timeline. */
const Beat: React.FC<{
  readonly id: BeatIdEp9;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP9.at(id))}
    durationInFrames={seconds(EP9.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/** The composer framing every filmed request shares, as in episodes 5 and 6. */
const COMPOSER_SHOT = {
  at: 0,
  frameOn: HOME.composerBlock,
  fill: 0.62,
  moveDuration: 1,
} as const;

/** The plus menu as the product lays it out. */
const MENU: readonly MenuItem[] = [
  { label: "Add files or photos" },
  { label: "Take a screenshot" },
  { label: "Add to project", more: true },
  { label: "Add from GitHub" },
  { label: "Skills", more: true, group: true },
  { label: "Connectors", more: true },
  { label: "Design system", more: true },
  { label: "Add plugins" },
  { label: "Ask NGG", group: true },
  { label: "Research" },
  { label: "Web search", checked: true },
];

/** The deck the episode builds. A generic training deck, no client. */
const DECK = {
  deckTitle: "מצגת למפגש הדרכה | לקוח",
  slideTitle: "Copilot בעבודה",
  slideSubtitle: "איך משתמשים בו נכון — מפגש למידה",
};

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
 * Episode 9: a deck, built inside the conversation.
 *
 * The narration is a method — five decisions, in order — and the brief for
 * the episode was to show each one being made rather than to name it. So the
 * requests are typed into the real composer, the menu and the artifact panel
 * are rebuilt as mockups and operated on screen, and the decisions that have
 * no screen — material becoming slides, a design system landing, a story
 * being fixed while it is still a list — are drawn as the motions they are.
 */
export const ClaudeDesign: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep9.mp3")} />

      <Beat id="hook">
        <StatementScene
          kicker="עד עכשיו — טקסט"
          statement="עכשיו עוברים לצד הוויזואלי"
          emphasise={["הוויזואלי"]}
          align="center"
        />
      </Beat>

      {/* The deck appearing beside the conversation it came from. */}
      <Beat id="in-chat" extend={EP9.length("no-tool")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "מצגת — ישירות מתוך אותה שיחה",
              emphasise: ["מתוך"],
            },
            {
              at: seconds(5.4),
              text: "בלי כלי נפרד, בלי לקפוץ בין מסכים",
              emphasise: ["בלי"],
            },
          ]}
        >
          {(size) => (
            <SlidesArtifact {...size} {...DECK} deckAt={seconds(1.6)} />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק תשיעי"
          title="מצגות מתוך השיחה"
          subtitle="כמה החלטות קטנות בהתחלה — שחוסכות הרבה עבודה אחר כך"
        />
      </Beat>

      {/* Decision one, as the fork it is. */}
      <Beat id="where-start">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "ההחלטה הראשונה: מאיפה מתחילים?",
              emphasise: ["מאיפה"],
            },
          ]}
        >
          {(size) => (
            <RuleRouter
              {...size}
              targets={[
                { label: "מחומר קיים", icon: "files" },
                { label: "מאפס", icon: "pen" },
              ]}
              questions={[
                { text: "יש כבר משהו להתחיל ממנו?", to: 0, at: seconds(0.8) },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Attach the file, ask for a deck — in the real composer. */}
      <Beat id="attach">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="יש חומר? מצרפים"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "מסמך, סיכום, בריף — או מצגת קודמת",
              side: "top",
              reach: 150,
              moveDuration: seconds(1.0),
            },
          ]}
          extras={
            <>
              <AttachedChips
                region={HOME.promptLine}
                files={[
                  { name: "סיכום פגישה.docx", kind: "docx", at: seconds(3.2) },
                  { name: "מצגת קודמת.pptx", kind: "pptx", at: seconds(5.0) },
                ]}
              />
              <TypedPrompt
                region={HOME.promptLine}
                text="תבנה מזה מצגת למפגש ההדרכה"
                delay={seconds(7.8)}
                speed={20}
              />
            </>
          }
        />
      </Beat>

      <Beat id="reads">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "קורא, מזהה את הנקודות המרכזיות — ובונה עליהן",
              emphasise: ["בונה"],
            },
          ]}
        >
          {(size) => (
            <MaterialToDeck
              {...size}
              fileLabel="סיכום פגישה"
              readAt={seconds(0.3)}
              extractAt={seconds(1.9)}
              slides={["למה עכשיו", "מה משתנה", "איך עובדים", "צעדים הבאים"]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Nothing ready: describe it. */}
      <Beat id="from-scratch">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="אין כלום מוכן? גם בסדר"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "למי, מה המטרה, מה חייב להיכנס",
              side: "top",
              reach: 150,
              moveDuration: seconds(0.9),
            },
          ]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="מצגת למנהלי צוותים, 20 דקות, המטרה: להסביר את השינוי ומה נדרש מהם"
              delay={seconds(1.6)}
              speed={22}
            />
          }
        />
      </Beat>

      <Beat id="check-first">
        <ContrastScene
          heading="אצלנו כמעט תמיד כבר יש משהו"
          not={{ label: "לפני", lines: ["לכתוב בריף שלם מחדש"] }}
          but={{ label: "לבדוק", lines: ["מסמך, סיכום או מצגת קודמת — ולצרף"] }}
          butAt={seconds(6.4)}
        />
      </Beat>

      <Beat id="look">
        <StatementScene
          kicker="ההחלטה הבאה"
          statement="איך המצגת אמורה להיראות?"
          emphasise={["להיראות"]}
          align="center"
        />
      </Beat>

      {/* Where the design system is picked. */}
      <Beat id="design-system">
        <CanvasScene
          captions={[
            {
              at: seconds(0.5),
              text: "דיזיין סיסטם: צבעים, פונטים, לוגו וכללי עיצוב",
            },
            {
              at: seconds(5.8),
              text: "בוחרים — והמצגת נבנית מראש בשפה העיצובית הזאת",
              emphasise: ["מראש"],
            },
          ]}
        >
          {(size) => (
            <ComposerMenu
              {...size}
              items={MENU}
              openAt={seconds(0.8)}
              ring={[{ at: seconds(2.6), label: "Design system" }]}
              submenu={{
                at: seconds(4.6),
                from: "Design system",
                title: "Yours",
                rows: [
                  {
                    label: "NGG Design System",
                    checked: true,
                    badge: "Default",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
              }}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="tokens">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "לא מסבירים כל פעם איזה כחול, איזה פונט, איפה הלוגו",
              emphasise: ["לא"],
            },
          ]}
        >
          {(size) => (
            <DesignSystemApply
              {...size}
              tokensAt={seconds(0.2)}
              applyAt={seconds(1.8)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="several-systems">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "כמה דיזיין סיסטמס? של NGG, ושל לקוח מסוים",
            },
            {
              at: seconds(5.6),
              text: "בוחרים את זה שמתאים לעבודה הנוכחית",
              emphasise: ["שמתאים"],
            },
          ]}
        >
          {(size) => (
            <ComposerMenu
              {...size}
              items={MENU}
              openAt={seconds(0.2)}
              submenu={{
                at: seconds(1.2),
                from: "Design system",
                title: "Yours",
                rows: [
                  { label: "NGG Design System", badge: "Default" },
                  { label: "לקוח א׳ — Design System", checked: true },
                  {},
                  {},
                  {},
                ],
              }}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="quick-idea">
        <CanvasScene
          captions={[
            { at: seconds(0.4), text: "רק בודקים רעיון? לא חייבים לבחור בכלל" },
            {
              at: seconds(6.0),
              text: "מצגת נקייה, בלי מיתוג — קודם התוכן",
              emphasise: ["התוכן"],
            },
          ]}
        >
          {(size) => <DesignSystemApply {...size} />}
        </CanvasScene>
      </Beat>

      <Beat id="brief">
        <StatementScene
          kicker="אחרי החומר והסגנון"
          statement="מגיע הבריף עצמו"
          emphasise={["הבריף"]}
          align="center"
        />
      </Beat>

      <Beat id="brief-typed">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="כמה פרטים בסיסיים"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "מי יראה · מה להשיג · כמה זמן · מה נשאר",
              side: "top",
              reach: 150,
              moveDuration: seconds(0.9),
            },
          ]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="למנהלים · להשיג הסכמה · 15 דקות · להשאיר את שקף התהליך, לרדת מהנספחים"
              delay={seconds(2.6)}
              speed={17}
            />
          }
        />
      </Beat>

      <Beat id="same-principle">
        <ItemsScene
          kicker="אותו עיקרון שדיברנו עליו קודם"
          blockWidth={860}
          items={[
            { text: "מי", icon: "person", at: seconds(0.3) },
            { text: "מה", icon: "bulb", at: seconds(1.1) },
            { text: "כמה", icon: "clock", at: seconds(1.9) },
            { text: "ועל מה", icon: "text", at: seconds(2.7) },
          ]}
        />
      </Beat>

      <Beat id="fewer-rounds">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "מדויקים יותר עכשיו — פחות סבבי תיקונים אחר כך",
              emphasise: ["פחות"],
            },
          ]}
        >
          {(size) => (
            <RoundsConverge
              {...size}
              rounds={[
                {
                  label: "בריף מדויק",
                  at: seconds(0.4),
                  fit: 0.82,
                  verdict: "קרוב",
                },
                {
                  label: "סבב אחד",
                  at: seconds(2.4),
                  fit: 0.96,
                  verdict: "שם",
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="saves-most">
        <StatementScene
          kicker="ועכשיו"
          statement="החלק שחוסך הכי הרבה זמן בכל התהליך"
          emphasise={["חוסך"]}
          align="center"
        />
      </Beat>

      <Beat id="tempting">
        <ShowcaseScene
          screen={SCREENS.home}
          windowWidth={WINDOW}
          title="מאוד מפתה"
          steps={[
            {
              ...COMPOSER_SHOT,
              label: "ולתת לו ישר להתחיל לעצב",
              side: "top",
              reach: 150,
              moveDuration: seconds(0.9),
            },
          ]}
          extras={
            <TypedPrompt
              region={HOME.promptLine}
              text="תכין לי מצגת"
              delay={seconds(1.4)}
              speed={14}
            />
          }
        />
      </Beat>

      {/* Ten finished slides, the wrong story, and the rebuilding. */}
      <Beat id="wrong-story" extend={EP9.length("rebuild")}>
        <CanvasScene
          captions={[
            { at: seconds(0.4), text: "עשרה שקפים שנראים מצוין" },
            {
              at: seconds(4.4),
              text: "אבל מספרים את הסיפור הלא נכון",
              emphasise: ["הלא", "נכון"],
            },
            {
              at: seconds(8.2),
              text: "מזיזים, מוחקים, מפצלים, מחברים — בונים מחדש",
              emphasise: ["מחדש"],
            },
          ]}
        >
          {(size) => (
            <DesignTooEarly
              {...size}
              buildAt={seconds(0.3)}
              wrongAt={seconds(4.6)}
              shuffleAt={seconds(8.0)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="stop-first">
        <StatementScene
          kicker="אז אני מעדיף לעצור רגע לפני העיצוב"
          statement="ולבקש קודם סיפור — סטורי־ליין"
          emphasise={["סטורי־ליין"]}
          align="start"
          graphic={() => <Icon name="text" />}
          panel={{ width: 320, height: 320 }}
        />
      </Beat>

      {/* The skeleton, reviewed as a list, then built from it. */}
      <Beat id="skeleton" extend={EP9.length("review") + EP9.length("build")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "השלד: כותרת לכל שקף והמסר המרכזי — בלי עיצוב",
              emphasise: ["בלי"],
            },
            { at: seconds(8.6), text: "עוברים על הרשימה: הסדר הגיוני?" },
            {
              at: seconds(13.6),
              text: "משהו מיותר? חסר שלב?",
              emphasise: ["מיותר"],
            },
            {
              at: seconds(19.4),
              text: "שני שקפים אומרים אותו דבר — מאחדים",
              emphasise: ["מאחדים"],
            },
            {
              at: seconds(23.2),
              text: "וכשהשלד נכון — ׀עכשיו תבנה לפי זה׀",
              emphasise: ["עכשיו"],
            },
            {
              at: seconds(29.4),
              text: "רק בשלב הזה עוברים לעיצוב",
              emphasise: ["רק"],
            },
          ]}
        >
          {(size) => (
            <StorylineEdit
              {...size}
              listAt={seconds(0.6)}
              items={[
                { title: "פתיחה", message: "למה אנחנו כאן" },
                { title: "מה משתנה", message: "התמונה החדשה" },
                { title: "רקע", message: "איך הגענו לפה" },
                { title: "מה נדרש מכם", message: "שלושה צעדים" },
                { title: "עוד רקע", message: "היסטוריה של הפרויקט" },
                { title: "סיכום", message: "מה הלאה" },
              ]}
              move={{ at: seconds(9.6), from: 2, to: 1 }}
              strike={{ at: seconds(14.4), index: 4 }}
              merge={{ at: seconds(20.0), first: 0 }}
              buildAt={seconds(24.2)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="small-diff">
        <StatementScene
          statement="הבדל קטן בתהליך — הבדל עצום בזמן"
          emphasise={["עצום"]}
          align="center"
        />
      </Beat>

      <Beat id="cost">
        <CanvasScene>
          {(size) => (
            <EditCostCompare
              {...size}
              cheap={{
                label: "לשנות שורה בתוך רשימה",
                note: "כמה שניות",
                at: seconds(0.3),
              }}
              dear={{
                label: "לפרק מבנה של מצגת שכבר עוצבה",
                note: "הרבה פחות כיף",
                at: seconds(3.6),
              }}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="refine">
        <StatementScene
          kicker="אחרי שהמצגת בנויה — שלב החידוד"
          statement="שלוש דרכים לעבוד, לפי סוג השינוי"
          emphasise={["שלוש"]}
          align="center"
        />
      </Beat>

      {/* Way one: a deck-wide change, asked for once in the chat. */}
      <Beat id="way-chat">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "שינוי רוחבי — בכמה שקפים או בכל המצגת",
              emphasise: ["רוחבי"],
            },
            {
              at: seconds(7.6),
              text: "מבקשים פעם אחת בצ׳אט",
              emphasise: ["פעם", "אחת"],
            },
            {
              at: seconds(15.0),
              text: "וזה מיושם בכל המקומות הרלוונטיים",
              emphasise: ["בכל"],
            },
          ]}
        >
          {(size) => (
            <SlidesArtifact
              {...size}
              {...DECK}
              deckAt={seconds(0.2)}
              chatPrompt={{
                text: "תקצר את כל הכותרות ותאחד את הפונט בכל המצגת",
                at: seconds(8.0),
                applyAt: seconds(14.2),
              }}
              titleAfter="Copilot"
              fixAt={seconds(14.2)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Way two: a small fix, straight on the canvas. */}
      <Beat id="way-canvas">
        <CanvasScene
          captions={[
            { at: seconds(0.4), text: "לא כל שינוי שווה פרומפט" },
            {
              at: seconds(5.6),
              text: "להזיז אלמנט, לשנות מילה, לבחור צבע — ישירות על הקנבס",
              emphasise: ["הקנבס"],
            },
            { at: seconds(15.8), text: "לוחצים, גוררים, ממשיכים הלאה" },
          ]}
        >
          {(size) => (
            <SlidesArtifact
              {...size}
              {...DECK}
              slideTitle="Copilot"
              deckAt={seconds(0.2)}
              dragAt={seconds(11.0)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Way three: a comment, on the element itself. */}
      <Beat id="way-comment">
        <CanvasScene
          captions={[
            { at: seconds(0.4), text: "הערה על משהו מאוד ספציפי" },
            {
              at: seconds(8.6),
              text: "לא ׳איזה גרף, באיזה שקף, באיזה צד׳",
              emphasise: ["לא"],
            },
            {
              at: seconds(15.6),
              text: "משאירים את ההערה על האלמנט עצמו",
              emphasise: ["עצמו"],
            },
          ]}
        >
          {(size) => (
            <SlidesArtifact
              {...size}
              {...DECK}
              slideTitle="Copilot"
              deckAt={seconds(0.2)}
              commentAt={seconds(4.4)}
              commentText="לא מספיק ברור — תפשט את זה"
              sendAt={seconds(16.2)}
              fixAt={seconds(18.6)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="collab">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "כמה אנשים על אותה מצגת — כל הערה נשארת מחוברת למקום שלה",
              emphasise: ["מחוברת"],
            },
          ]}
        >
          {(size) => (
            <SlidesArtifact
              {...size}
              {...DECK}
              slideTitle="Copilot"
              deckAt={seconds(0.1)}
              pins={[
                { at: seconds(1.2), x: 0.64, y: 0.5, letter: "D" },
                { at: seconds(2.4), x: 0.3, y: 0.42, letter: "R" },
                { at: seconds(3.6), x: 0.86, y: 0.82, letter: "M" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="three-rules">
        <CardsScene
          heading="כלל אצבע פשוט"
          cards={[
            { title: "שינוי שחוזר", note: "בצ׳אט", glyph: "chat" },
            {
              title: "תיקון קטן ומהיר",
              note: "ישירות על הקנבס",
              glyph: "wand",
            },
            {
              title: "פידבק על משהו מסוים",
              note: "בהערה על האלמנט",
              glyph: "doc",
            },
          ]}
          startAt={seconds(1.6)}
          stagger={seconds(2.3)}
        />
      </Beat>

      <Beat id="export">
        <CanvasScene
          captions={[
            { at: seconds(0.4), text: "וכשהכול נראה טוב — מוציאים החוצה" },
            {
              at: seconds(5.0),
              text: "PowerPoint להצגה · PDF לשליחה · או קישור מתוך השיחה",
            },
          ]}
        >
          {(size) => (
            <SlidesArtifact
              {...size}
              {...DECK}
              slideTitle="Copilot"
              deckAt={seconds(0.1)}
              exportAt={seconds(4.6)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="when-worth">
        <ItemsScene
          kicker="מתי כל התהליך הזה משתלם"
          blockWidth={1080}
          items={[
            {
              text: "מצגת רעיונית או טיוטה פנימית",
              icon: "bulb",
              at: seconds(4.6),
            },
            { text: "שלד מהיר לישיבה", icon: "clock", at: seconds(9.6) },
            {
              text: "סוג חדש של מצגת — שאין לו עדיין תבנית",
              icon: "slides",
              at: seconds(12.4),
            },
          ]}
        />
      </Beat>

      <Beat id="template-exists">
        <ContrastScene
          heading="אבל אם יש תהליך קבוע ותבנית שעובדת"
          not={{ label: "לא", lines: ["להמציא את הגלגל מחדש"] }}
          but={{ label: "למשל", lines: ["הצעה פורמלית ללקוח — בתבנית הקיימת"] }}
          butAt={seconds(7.0)}
        />
      </Beat>

      <Beat id="rule">
        <CanvasScene
          captions={[{ at: seconds(0.4), text: "כלל האצבע כאן די פשוט" }]}
        >
          {(size) => (
            <RuleRouter
              {...size}
              targets={[
                { label: "משתמשים בתבנית", icon: "slides" },
                { label: "Claude Design", icon: "pen" },
              ]}
              questions={[
                { text: "יש תבנית טובה שעובדת?", to: 0, at: seconds(0.6) },
                { text: "אין תבנית, או משהו חדש?", to: 1, at: seconds(6.4) },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="סיימנו את מודול Claude Design"
          emphasise={["Design"]}
          nextUp="מחברים את כל מה שלמדנו לתרחישי עבודה אמיתיים מתוך NGG"
          nextLabel="במודול הבא — והאחרון"
        />
      </Beat>
    </AbsoluteFill>
  );
};
