import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { ClickMaze } from "../graphics/ClickMaze";
import { DraftEdit } from "../graphics/DraftEdit";
import { EffortCompare } from "../graphics/EffortCompare";
import { FunnelRule } from "../graphics/FunnelRule";
import { IdeaToOutputs } from "../graphics/IdeaToOutputs";
import { PageStack } from "../graphics/PageStack";
import { PathShortcut } from "../graphics/PathShortcut";
import { ReadMaterial } from "../graphics/ReadMaterial";
import { SearchResults } from "../graphics/SearchResults";
import { CardsScene } from "../scenes/CardsScene";
import { ChapterCard } from "../scenes/ChapterCard";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { ShowcaseScene } from "../scenes/ShowcaseScene";
import { StagedScene } from "../scenes/StagedScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { beatAt, beatLength, NARRATION_SECONDS, type BeatId } from "../script";
import { COLORS, seconds } from "../theme";
import { REGIONS } from "../ui/regions";
import { TypedPrompt } from "../ui/TypedPrompt";

/** Total length of the video: the narration, plus a beat of air at the end. */
export const CLAUDE_INTRO_DURATION = seconds(NARRATION_SECONDS + 1.2);

/**
 * Places a scene on the narration's timeline.
 *
 * Every scene is positioned by beat id rather than by a frame number, so the
 * timings live in `src/script.ts` and a scene cannot silently drift out of
 * sync with the voice.
 */
const CROSSFADE = seconds(0.34);

const Beat: React.FC<{
  readonly id: BeatId;
  /** Extend the scene past the next beat, for a deliberate overlap. */
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(beatAt(id))}
    // One crossfade longer than the beat, so this scene is still on screen
    // underneath while the next one fades in over it.
    durationInFrames={seconds(beatLength(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/**
 * Episode 1 of the Claude explainer series.
 *
 * Hebrew narration, so every scene lays out right-to-left. The interface
 * screenshot appears in the one stretch of narration that describes the
 * product's workspaces, which is where showing the real thing earns its place.
 */
export const ClaudeIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.backgroundDeep }}>
      <Audio src={staticFile("audio/narration.mp3")} />

      <Beat id="hook">
        <StatementScene
          statement="רוב הכלים דורשים שנדע בדיוק מה לעשות ואיפה ללחוץ"
          emphasise={["בדיוק", "ללחוץ"]}
          graphic={({ width, height }) => (
            <ClickMaze width={width} height={height} span={seconds(4.6)} />
          )}
          panel={{ width: 820, height: 500 }}
        />
      </Beat>

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק ראשון"
          title="קלוד עובד אחרת"
          subtitle="אתם מתארים במילים שלכם מה אתם צריכים — והוא מבצע"
        />
      </Beat>

      <Beat id="roadmap">
        <ItemsScene
          heading="בסרטון הזה"
          items={[
            { text: "מה קלוד באמת יודע לעשות", marker: "1", icon: "bulb" },
            { text: "לאלו משימות הוא מתאים", marker: "2", icon: "check" },
            {
              text: "ובאלו מקרים עדיף לוותר עליו",
              marker: "3",
              icon: "warning",
            },
          ]}
          stagger={22}
        />
      </Beat>

      <Beat id="chapter-what">
        <ChapterCard index={1} title="נתחיל מהדבר החשוב" />
      </Beat>

      <Beat id="not-search">
        <ContrastScene
          not={{
            label: "הוא לא",
            lines: ["מנוע חיפוש", "מחזיר קישורים"],
            graphic: ({ width, height }) => (
              <SearchResults width={width} height={height} delay={12} />
            ),
          }}
          but={{
            label: "הוא כן",
            lines: ["עובד על החומר עצמו"],
            graphic: ({ width, height }) => (
              <ReadMaterial
                width={width}
                height={height}
                delay={seconds(2.6)}
              />
            ),
          }}
          butAt={seconds(2.4)}
        />
      </Beat>

      {/* Three examples in a row: shown one at a time so the picture and the
          sentence stay together instead of the viewer reading ahead. */}
      <Beat id="give-it">
        <StagedScene
          heading="תנו לו — והוא יעשה"
          panel={{ width: 660, height: 460 }}
          steps={[
            {
              at: seconds(0.5),
              graphic: ({ width, height }) => (
                <PageStack width={width} height={height} delay={seconds(0.5)} />
              ),
              caption: "מסמך של 40 עמודים — יקרא אותו ויענה עליו לעומק",
              emphasise: ["לעומק"],
            },
            {
              at: seconds(5.6),
              graphic: ({ width, height }) => (
                <DraftEdit
                  width={width}
                  height={height}
                  delay={seconds(5.6)}
                  span={seconds(2.6)}
                />
              ),
              caption: "טיוטה — יערוך אותה",
              emphasise: ["יערוך"],
            },
            {
              at: seconds(8.5),
              graphic: ({ width, height }) => (
                <IdeaToOutputs
                  width={width}
                  height={height}
                  delay={seconds(8.5)}
                />
              ),
              caption: "רעיון — יבנה ממנו מסמך, טבלה או מצגת",
              emphasise: ["יבנה"],
            },
          ]}
        />
      </Beat>

      <Beat id="strengths">
        <CardsScene
          cards={[
            {
              title: "עברית ואנגלית",
              note: "קורא וכותב בשתיהן ברמה גבוהה",
              glyph: "doc",
            },
            {
              title: "זוכר את השיחה",
              note: "כל מה שנאמר בתוכה עד עכשיו",
              glyph: "chat",
            },
            {
              title: "מחבר מקורות",
              note: "כמה מקורות שונים לתוצר אחד",
              glyph: "wand",
            },
          ]}
          startAt={seconds(0.4)}
          stagger={seconds(3.6)}
        />
      </Beat>

      <Beat id="assistant">
        <StatementScene
          kicker="אז במקום לחשוב עליו ככלי שמייצר תשובות"
          statement="חשבו עליו כעל עוזר מקצועי שאפשר להעביר לו משימות שלמות"
          emphasise={["עוזר", "מקצועי"]}
        />
      </Beat>

      <Beat id="chapter-tasks">
        <ChapterCard
          index={2}
          title="לאלו משימות זה מתאים?"
          note="בגדול — ארבעה סוגים"
        />
      </Beat>

      <Beat id="task-read">
        <ItemsScene
          kicker="הראשון"
          blockWidth={700}
          heading="לקרוא ולנתח"
          items={[
            { text: "לסכם מפגש", icon: "meeting" },
            { text: "לעבור על דוח", icon: "report" },
            { text: "להשוות בין שני מסמכים", icon: "compare" },
            { text: "לחלץ נתונים מטבלה", icon: "table" },
          ]}
          stagger={seconds(0.85)}
        />
      </Beat>

      <Beat id="task-write">
        <ItemsScene
          kicker="השני"
          blockWidth={700}
          heading="לכתוב ולייצר"
          items={[
            { text: "טיוטת הצעה ללקוח", icon: "pen" },
            { text: "מסמך תהליך", icon: "flow" },
            { text: "תוכן שיווקי", icon: "megaphone" },
            { text: "שלד של מצגת", icon: "slides" },
          ]}
          stagger={seconds(0.85)}
        />
      </Beat>

      <Beat id="task-think">
        <ItemsScene
          kicker="השלישי"
          blockWidth={700}
          heading="לחשוב יחד"
          items={[
            { text: "ללבן רעיון להתערבות", icon: "bulb" },
            { text: "לבנות מבנה לסדנה", icon: "framework" },
            { text: "לבחון אם ההיגיון של הצעה מחזיק", icon: "scale" },
          ]}
          stagger={seconds(1.1)}
        />
      </Beat>

      <Beat id="task-order">
        <ItemsScene
          kicker="והרביעי"
          blockWidth={700}
          heading="לעשות סדר"
          items={[
            { text: "משימות חוזרות שגוזלות זמן", icon: "repeat" },
            { text: "התאמת חומרים לעברית", icon: "globe" },
            { text: "עיבוד קבצים", icon: "files" },
          ]}
          stagger={seconds(1.1)}
        />
      </Beat>

      <Beat id="rule">
        <StatementScene
          kicker="כלל אצבע פשוט"
          statement="אם המשימה מתחילה מטקסט, מנתונים או מרעיון — היא כנראה מתאימה"
          emphasise={["מטקסט,", "מנתונים", "מרעיון"]}
          graphic={({ width, height }) => (
            <FunnelRule width={width} height={height} delay={seconds(0.5)} />
          )}
          panel={{ width: 700, height: 520 }}
        />
      </Beat>

      <Beat id="chapter-spaces">
        <ChapterCard
          index={3}
          title="קלוד הוא לא מסך אחד"
          note="אלא כמה מרחבי עבודה — כל אחד לסוג אחר של עבודה"
        />
      </Beat>

      {/* The one stretch that shows the real interface. A single continuous
          camera move visits the four workspaces in the order the voice names
          them, so the viewer keeps their bearings in the layout. */}
      <Beat id="spaces-tour">
        <ShowcaseScene
          title="מרחבי העבודה"
          windowWidth={1520}
          steps={[
            {
              // The composer, not the Chat pill: this beat is about the
              // request being written, and highlighting the whole composer
              // puts the typed line inside the undimmed cut-out where it
              // reads at full contrast.
              at: 0,
              region: REGIONS.composer,
              frameOn: REGIONS.composerBlock,
              fill: 0.82,
              label: "צ'אט — נקודת ההתחלה",
              side: "top",
              reach: 105,
              moveDuration: seconds(1.1),
            },
            {
              at: seconds(5.4),
              region: REGIONS.projects,
              frameOn: REGIONS.navBlock,
              fill: 0.72,
              label: "פרויקטים — מרחב קבוע לנושא או ללקוח",
              side: "right",
              reach: 150,
              moveDuration: seconds(1.2),
            },
            {
              at: seconds(15.1),
              region: REGIONS.coworkPill,
              frameOn: REGIONS.composerBlock,
              fill: 0.78,
              label: "קו-וורק — למשימות ארוכות",
              side: "top",
              reach: 120,
              moveDuration: seconds(1.2),
            },
            {
              at: seconds(22.8),
              region: REGIONS.design,
              frameOn: REGIONS.designBlock,
              fill: 0.66,
              label: "דיזיין — הסביבה החזותית",
              side: "right",
              reach: 150,
              moveDuration: seconds(1.1),
            },
          ]}
          // While the voice says chat is where a question or a short task
          // starts, a request types itself into the composer.
          extras={
            <TypedPrompt
              region={REGIONS.promptLine}
              text="סכם לי את הפגישה ותוציא רשימת משימות"
              delay={seconds(1.7)}
              speed={13}
            />
          }
          cursor={[
            { at: seconds(0.6), region: REGIONS.greeting },
            {
              at: seconds(1.0),
              region: REGIONS.chatPill,
              click: true,
              duration: seconds(0.5),
            },
            {
              at: seconds(5.6),
              region: REGIONS.projects,
              click: true,
              duration: seconds(0.9),
            },
            {
              at: seconds(15.3),
              region: REGIONS.coworkPill,
              click: true,
              duration: seconds(0.9),
            },
            {
              at: seconds(23.0),
              region: REGIONS.design,
              click: true,
              duration: seconds(0.9),
            },
          ]}
        />
      </Beat>

      <Beat id="microsoft">
        <ItemsScene
          kicker="בנוסף"
          heading="החשבון הארגוני מתחבר למיקרוסופט 365"
          items={[
            { text: "מיילים", icon: "mail", at: seconds(1.2) },
            { text: "קבצים", icon: "files", at: seconds(2.0) },
            { text: "פגישות", icon: "calendar", at: seconds(2.8) },
            {
              text: "תמיד לפי ההרשאות שכבר יש לכם",
              icon: "lock",
              at: seconds(5.4),
            },
          ]}
        />
      </Beat>

      <Beat id="next-video-teaser">
        <ShowcaseScene
          windowWidth={1660}
          revealFrames={seconds(0.35)}
          steps={[{ at: 0, moveDuration: seconds(0.9) }]}
        />
      </Beat>

      <Beat id="chapter-limits">
        <ChapterCard index={4} title="וחשוב לא פחות — מתי לא?" />
      </Beat>

      <Beat id="limit-accuracy">
        <ItemsScene
          kicker="ראשית"
          blockWidth={1120}
          heading="קלוד טועה לפעמים"
          accent={COLORS.warn}
          items={[
            { text: "במספרים", icon: "table", at: seconds(2.3) },
            { text: "בציטוטים", icon: "quote", at: seconds(3.1) },
            { text: "ובמקורות", icon: "doc", at: seconds(3.9) },
            {
              text: "כל עובדה שנכנסת לתוצר שיוצא ללקוח — עוברת אימות שלכם",
              at: seconds(6.4),
            },
          ]}
        />
      </Beat>

      <Beat id="limit-judgement">
        <ItemsScene
          kicker="שנית"
          blockWidth={1120}
          heading="שיקול דעת מקצועי נשאר אצלכם"
          accent={COLORS.warn}
          items={[
            { text: "משוב על עובד", icon: "person", at: seconds(4.8) },
            { text: "החלטה על אדם", icon: "scale", at: seconds(6.0) },
            {
              text: "קריאה של דינמיקה בחדר",
              icon: "meeting",
              at: seconds(7.2),
            },
            {
              text: "הוא יכול לעזור לנסח — אבל ההחלטה והאחריות שלכם",
              at: seconds(9.8),
            },
          ]}
        />
      </Beat>

      <Beat id="limit-privacy">
        <ItemsScene
          kicker="שלישית"
          blockWidth={1120}
          heading="מידע רגיש"
          accent={COLORS.warn}
          items={[
            {
              text: "עובדים רק בחשבון הארגוני",
              icon: "shield",
              at: seconds(3.0),
            },
            { text: "ולפי ההרשאות", icon: "lock", at: seconds(4.4) },
            {
              text: "לא מוציאים מידע פנימי החוצה",
              icon: "warning",
              at: seconds(5.6),
            },
          ]}
        />
      </Beat>

      <Beat id="limit-effort">
        <StatementScene
          statement="ואם המשימה קצרה יותר מההסבר עליה"
          graphic={({ width, height }) => (
            <EffortCompare width={width} height={height} delay={seconds(0.6)} />
          )}
          panel={{ width: 780, height: 430 }}
        />
      </Beat>

      <Beat id="bottom-line">
        <StatementScene
          kicker="בשורה התחתונה"
          statement="קלוד לא מחליף את המומחיות שלכם — הוא מקצר את הדרך אליה"
          emphasise={["מקצר"]}
          graphic={({ width, height }) => (
            <PathShortcut width={width} height={height} delay={seconds(0.5)} />
          )}
          panel={{ width: 720, height: 400 }}
        />
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="קלוד מקצר את הדרך למומחיות שלכם"
          emphasise={["מקצר"]}
          nextUp="ניכנס לחשבון ונעבור על סביבת העבודה בפועל"
        />
      </Beat>
    </AbsoluteFill>
  );
};
