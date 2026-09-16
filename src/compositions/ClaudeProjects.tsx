import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { LineIcon } from "../graphics/LineIcon";
import { MaterialsUpdate } from "../graphics/MaterialsUpdate";
import { ProjectCreate } from "../graphics/ProjectCreate";
import { ProjectGround } from "../graphics/ProjectGround";
import { ProjectInstructionsDialog } from "../graphics/ProjectInstructionsDialog";
import { ProjectPanels } from "../graphics/ProjectPanels";
import { ProjectWorkspace } from "../graphics/ProjectWorkspace";
import { SharedGroundSeparateChats } from "../graphics/SharedGroundSeparateChats";
import { CanvasScene } from "../scenes/CanvasScene";
import { CardsScene } from "../scenes/CardsScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP7, type BeatIdEp7 } from "../script";
import { COLORS, seconds } from "../theme";

/** The narration, plus a beat of air at the end. */
export const CLAUDE_PROJECTS_DURATION = seconds(EP7.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/** Places a scene on episode 7's narration timeline. */
const Beat: React.FC<{
  readonly id: BeatIdEp7;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP7.at(id))}
    durationInFrames={seconds(EP7.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/** The preamble the hook is about: what you retype at the top of every chat. */
const PREAMBLE =
  "אנחנו NGG, הלקוח הוא X, הפרויקט הוא הטמעת קלוד, תכתוב בעברית בטון מקצועי…";

/**
 * The project the episode builds. One constant, because the name typed into
 * the create dialog is the name the page, the sidebar and the instructions
 * dialog all carry afterwards — and the narration's advice is that the name is
 * the client's, not a description of the work.
 */
const PROJECT = "לקוח X";

/** A centred illustration, for the statement scenes that carry one. */
const Icon: React.FC<{
  readonly name: Parameters<typeof LineIcon>[0]["name"];
  readonly color?: string;
  readonly fill?: number;
}> = ({ name, color = COLORS.accent, fill = 0.7 }) => (
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
      size={320 * fill}
      color={color}
      drawFrames={seconds(1.0)}
      idle
    />
  </div>
);

/**
 * Episode 7: projects.
 *
 * The narration makes one structural claim and then spends the episode
 * qualifying it: a project holds material and instructions that every
 * conversation inside it can see, and nothing a conversation says travels
 * sideways to its neighbours. Neither half of that is visible in a screenshot,
 * so the interface beats are rebuilt as mockups — the create dialog, the
 * project page, the panel column and the instructions dialog — and the
 * relationships between them are drawn: the repeated preamble that a project
 * replaces, the shared base under separate conversations, and a document being
 * swapped without anything downstream being told.
 */
export const ClaudeProjects: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep7.mp3")} />

      {/* The cost the episode is about, stated as repetition rather than as a
          complaint: three conversations, each opening with the same block. */}
      <Beat id="hook">
        <CanvasScene
          captions={[
            {
              at: seconds(0.6),
              text: "מסבירים מי הלקוח, מה הפרויקט ואיך עובדים",
              emphasise: ["מסבירים"],
            },
            {
              at: seconds(5.6),
              text: "ולמחרת, בשיחה חדשה — הכול מהתחלה",
              emphasise: ["מהתחלה"],
            },
          ]}
        >
          {(size) => (
            <ProjectGround
              {...size}
              chats={[
                { ask: "תכתוב טיוטת מייל ללקוח", at: seconds(0.4) },
                { ask: "תסכם את הפגישה מאתמול", at: seconds(3.0) },
                { ask: "תכין דף פתיחה למצגת", at: seconds(5.6) },
              ]}
              preamble={PREAMBLE}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק שביעי"
          title="פרויקטים"
          subtitle="מסבירים פעם אחת — וזה נשאר"
        />
      </Beat>

      {/* The project being defined, in the dialog that defines it. */}
      <Beat id="create">
        <CanvasScene
          captions={[
            {
              at: seconds(0.5),
              text: "פותחים פרויקט ונותנים לו שם",
              emphasise: ["שם"],
            },
            {
              at: seconds(3.6),
              text: "למשל שם הלקוח או הפרויקט",
            },
          ]}
        >
          {(size) => (
            <ProjectCreate
              {...size}
              name={PROJECT}
              goal="ליווי ההטמעה מול הלקוח: סדנאות, חומרי הדרכה ודוחות התקדמות"
              nameAt={seconds(0.8)}
              goalAt={seconds(3.4)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* The workspace itself, held across the beat that names its two parts
          so the ring can travel to each one without cutting away. */}
      <Beat id="workspace" extend={EP7.length("two-parts")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "וזהו — מרחב עבודה קבוע",
              emphasise: ["קבוע"],
            },
            {
              at: seconds(3.5),
              text: "בתוך המרחב הזה יש שני חלקים",
              emphasise: ["שני", "חלקים"],
            },
            {
              at: seconds(5.0),
              text: "תיק החומרים — Context",
              emphasise: ["החומרים"],
            },
            {
              at: seconds(7.6),
              text: "ושורת ההוראות הקבועות — Instructions",
              emphasise: ["ההוראות"],
            },
          ]}
        >
          {(size) => (
            <ProjectWorkspace
              {...size}
              name={PROJECT}
              ring={[
                { at: seconds(5.0), part: "context" },
                { at: seconds(7.6), part: "instructions" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* What a screenshot cannot show: both halves reaching every new
          conversation, without anyone attaching anything. */}
      <Beat id="sees-both">
        <CanvasScene
          captions={[
            { at: seconds(0.4), text: "כל שיחה חדשה בתוך הפרויקט" },
            {
              at: seconds(2.8),
              text: "רואה את שניהם אוטומטית",
              emphasise: ["אוטומטית"],
            },
            {
              at: seconds(5.4),
              text: "בלי לצרף שוב כלום",
              emphasise: ["בלי"],
            },
          ]}
        >
          {(size) => (
            <SharedGroundSeparateChats
              {...size}
              columns={[
                { label: "שיחה חדשה", icon: "quote", at: seconds(0.3) },
                { label: "שיחה חדשה", icon: "quote", at: seconds(1.0) },
                { label: "שיחה חדשה", icon: "quote", at: seconds(1.7) },
              ]}
              groundLabel="חומרים והוראות"
              shareAt={seconds(2.6)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="vs-chat">
        <StatementScene
          statement="וזה ההבדל מצ׳אט רגיל"
          emphasise={["ההבדל"]}
          align="center"
        />
      </Beat>

      {/* Two objects, not a right and a wrong one: the narration is drawing a
          distinction, not recommending against chats. */}
      <Beat id="chat-or-home">
        <CardsScene
          cards={[
            {
              title: "צ׳אט",
              note: "שיחה בודדת, שנעלמת מהעין ברגע שעברתם הלאה",
              glyph: "chat",
            },
            {
              title: "פרויקט",
              note: "הבית הקבוע של נושא שלם",
              glyph: "folder",
            },
          ]}
          startAt={seconds(0.5)}
          stagger={seconds(4.8)}
        />
      </Beat>

      <Beat id="recurring">
        <ItemsScene
          kicker="נושא שחוזר אצלכם שוב ושוב"
          blockWidth={960}
          items={[
            { text: "הלקוח", icon: "person", at: seconds(0.4) },
            { text: "הפרויקט", icon: "framework", at: seconds(1.7) },
            { text: "או תחום העבודה", icon: "repeat", at: seconds(3.0) },
          ]}
        />
      </Beat>

      {/* The Context panel, opened: the four ways material gets in, and then
          the material itself landing. Held across the beat that lists it. */}
      <Beat id="folder" extend={EP7.length("what-goes-in")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "כל מה שרלוונטי לפרויקט — נכנס לתיק",
              emphasise: ["כל"],
            },
            { at: seconds(2.0), text: "ארבע דרכים להכניס חומר" },
            {
              at: seconds(5.2),
              text: "הבריף, המצגת, המתודולוגיה",
            },
            {
              at: seconds(10.8),
              text: "פעם אחת — ולא נוגעים בזה שוב",
              emphasise: ["פעם", "אחת"],
            },
          ]}
        >
          {(size) => (
            <ProjectPanels
              {...size}
              open={[{ at: seconds(0.4), panel: "context" }]}
              menuAt={seconds(1.8)}
              menuCloseAt={seconds(4.9)}
              files={[
                { label: "הבריף המקורי", at: seconds(5.4), kind: "doc" },
                {
                  label: "המצגת מהפגישה האחרונה",
                  at: seconds(7.0),
                  kind: "deck",
                },
                {
                  label: "מסמך המתודולוגיה שלנו",
                  at: seconds(9.0),
                  kind: "pdf",
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="knows-it">
        <StatementScene
          kicker="מרגע שזה בפנים"
          statement="כל שיחה חדשה בפרויקט מכירה את זה מעצמה"
          emphasise={["מעצמה"]}
          align="center"
        />
      </Beat>

      <Beat id="just-ask">
        <ContrastScene
          not={{ label: "לא כותבים", lines: ["׳לפי המסמך שצירפתי׳"] }}
          but={{
            label: "פשוט",
            lines: ["שואלים — והוא כבר מביט בחומר"],
          }}
          butAt={seconds(3.4)}
        />
      </Beat>

      <Beat id="updates">
        <StatementScene
          statement="וזה מתעדכן בקלות"
          emphasise={["בקלות"]}
          align="center"
        />
      </Beat>

      {/* One slot, two versions: the project is unchanged, only its contents
          moved — and nothing downstream had to be told. */}
      <Beat id="swap-version">
        <CanvasScene
          captions={[
            { at: seconds(0.5), text: "מסמך התיישן?" },
            {
              at: seconds(2.2),
              text: "מחליפים אותו בגרסה החדשה",
              emphasise: ["מחליפים"],
            },
            {
              at: seconds(4.6),
              text: "והפרויקט כולו ממשיך לפי מה שבפנים עכשיו",
              emphasise: ["עכשיו"],
            },
          ]}
        >
          {(size) => (
            <MaterialsUpdate
              {...size}
              folderLabel="תיק החומרים"
              chips={[
                { label: "הבריף המקורי", icon: "doc", at: seconds(0.3) },
                { label: "המצגת", icon: "slides", at: seconds(0.7) },
              ]}
              stale={{ from: "מסמך מתודולוגיה", to: "מסמך מתודולוגיה" }}
              markAt={seconds(0.9)}
              swapAt={seconds(2.3)}
              propagateAt={seconds(4.4)}
              downstream={["שיחה 1", "שיחה 2", "שיחה 3"]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* The instructions being written, held across the beat that dictates
          them, so the example lands in the field it is an example of. */}
      <Beat id="instructions" extend={EP7.length("instruction-example")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.5),
              text: "מה שנכון לכל שיחה בפרויקט הזה",
              emphasise: ["לכל"],
            },
            { at: seconds(5.4), text: "למשל —" },
          ]}
        >
          {(size) => (
            <ProjectInstructionsDialog
              {...size}
              project={PROJECT}
              lines={[
                {
                  text: "אתה עוזר בפרויקט הזה של NGG ללקוח X.",
                  at: seconds(5.9),
                },
                {
                  text: "תמיד תענה בעברית, בטון מקצועי.",
                  at: seconds(11.3),
                },
                {
                  text: "תשתמש במינוח שלנו, לא במינוח כללי.",
                  at: seconds(14.6),
                },
              ]}
              saveAt={seconds(17.4)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="saves">
        <StatementScene
          statement="זה חוסך את מה שכולנו כותבים בכל שיחה מחדש"
          emphasise={["חוסך"]}
          align="center"
        />
      </Beat>

      <Beat id="every-chat">
        <ItemsScene
          kicker="אותו ניסוח, כל פעם מחדש"
          blockWidth={880}
          items={[
            { text: "הטון", icon: "quote", at: seconds(0.3) },
            { text: "הקהל", icon: "person", at: seconds(1.2) },
            { text: "מה מותר ומה אסור", icon: "scale", at: seconds(2.1) },
          ]}
        />
      </Beat>

      {/* The repetition from the hook, this time resolving: three identical
          blocks leaving the conversations for one place. */}
      <Beat id="write-once">
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "כותבים פעם אחת",
              emphasise: ["פעם", "אחת"],
            },
            {
              at: seconds(3.1),
              text: "וזה חל על כל מה שקורה בפרויקט מעכשיו",
              emphasise: ["כל"],
            },
          ]}
        >
          {(size) => (
            <ProjectGround
              {...size}
              chats={[
                { ask: "טיוטת מייל", at: seconds(0.2) },
                { ask: "סיכום פגישה", at: seconds(0.9) },
                { ask: "דף פתיחה", at: seconds(1.6) },
              ]}
              preamble={PREAMBLE}
              mergeAt={seconds(2.9)}
              groundLabel="שורת ההוראות"
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="the-point">
        <StatementScene
          kicker="ועכשיו לנקודה שהכי כדאי להבין נכון"
          statement="כי היא זו שמבלבלת אנשים בהתחלה"
          emphasise={["שמבלבלת"]}
          align="start"
          graphic={() => <Icon name="bulb" color={COLORS.warn} />}
          panel={{ width: 320, height: 320 }}
        />
      </Beat>

      {/* The episode's central distinction, in one take: the base reaches up
          into every conversation, and nothing crosses between them. */}
      <Beat id="shared" extend={EP7.length("not-carried")}>
        <CanvasScene
          captions={[
            {
              at: seconds(0.4),
              text: "החומרים וההוראות — משותפים לכל השיחות",
              emphasise: ["משותפים"],
            },
            {
              at: seconds(5.2),
              text: "אבל כל שיחה נשארת נפרדת",
              emphasise: ["נפרדת"],
            },
            {
              at: seconds(9.4),
              text: "מה שנאמר באחת לא עובר אוטומטית לשנייה",
              emphasise: ["לא"],
            },
            {
              at: seconds(16.6),
              text: "גם אם שתיהן באותו פרויקט",
            },
          ]}
        >
          {(size) => (
            <SharedGroundSeparateChats
              {...size}
              columns={[
                { label: "טיוטה למייל", icon: "mail", at: seconds(0.3) },
                { label: "ניתוח מסמך", icon: "report", at: seconds(1.0) },
                { label: "סיכום פגישה", icon: "meeting", at: seconds(1.7) },
              ]}
              groundLabel="חומרים והוראות"
              shareAt={seconds(2.6)}
              isolateAt={seconds(5.4)}
              isolateLabel="לא עובר מעצמו"
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="not-a-limit">
        <ContrastScene
          not={{ label: "נשמע כמו", lines: ["מגבלה"] }}
          but={{ label: "אבל זו בעצם", lines: ["נוחות"] }}
          butAt={seconds(1.8)}
        />
      </Beat>

      <Beat id="parallel">
        <CardsScene
          heading="כמה שיחות מקבילות באותו פרויקט"
          cards={[
            { title: "טיוטה למייל", glyph: "chat" },
            { title: "ניתוח למסמך", glyph: "doc" },
            { title: "סיכום לפגישה", glyph: "deck" },
          ]}
          startAt={seconds(4.7)}
          stagger={seconds(1.2)}
        />
      </Beat>

      <Beat id="dont-rely">
        <StatementScene
          kicker="משהו חשוב שעלה בשיחה?"
          statement="אל תסמכו על זה שזה ייזכר"
          emphasise={["אל"]}
          footnote="אם אתם רוצים שיהיה זמין גם בשיחות הבאות"
          align="center"
        />
      </Beat>

      {/* Back to the page, pointing at the two places that make it stick. */}
      <Beat id="make-permanent">
        <CanvasScene
          captions={[
            {
              at: seconds(0.6),
              text: "מוסיפים אותו לתיק החומרים",
              emphasise: ["מוסיפים"],
            },
            {
              at: seconds(3.0),
              text: "או כותבים אותו בהוראות",
              emphasise: ["כותבים"],
            },
            {
              at: seconds(5.2),
              text: "זה מה שהופך אותו לקבוע",
              emphasise: ["לקבוע"],
            },
          ]}
        >
          {(size) => (
            <ProjectWorkspace
              {...size}
              name={PROJECT}
              ring={[
                { at: seconds(0.6), part: "context" },
                { at: seconds(3.0), part: "instructions" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="when">
        <StatementScene
          kicker="אז מתי בכלל שווה לפתוח פרויקט?"
          statement="כלל אצבע פשוט"
          align="center"
        />
      </Beat>

      <Beat id="rule">
        <StatementScene
          statement="אם אתם צפויים לחזור לנושא הזה יותר מפעם אחת"
          emphasise={["יותר", "מפעם", "אחת"]}
          align="center"
        />
      </Beat>

      <Beat id="worth-it">
        <ItemsScene
          kicker="זה המקום הנכון"
          blockWidth={1100}
          items={[
            { text: "לקוח קבוע", icon: "person", at: seconds(0.4) },
            {
              text: "פרויקט שנמשך כמה שבועות",
              icon: "clock",
              at: seconds(2.4),
            },
            {
              text: "תחום עבודה חוזר — כמו כתיבת הצעות",
              icon: "repeat",
              at: seconds(4.6),
            },
          ]}
        />
      </Beat>

      <Beat id="one-off">
        <StatementScene
          kicker="לשאלה חד־פעמית"
          statement="צ׳אט רגיל מספיק — ופשוט יותר"
          emphasise={["מספיק"]}
          footnote="או משהו שנגמר תוך שיחה אחת"
          align="start"
          graphic={() => <Icon name="check" fill={0.66} />}
          panel={{ width: 320, height: 320 }}
        />
      </Beat>

      <Beat id="in-practice">
        <StatementScene statement="וב‑NGG, זה אומר בפועל —" align="center" />
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="פרויקט אחד ללקוח — לא פרויקט אחד לכל שיחה איתו"
          emphasise={["אחד"]}
          nextUp="נמשיך ביכולות המתקדמות — חיפוש באינטרנט ו‑Skills"
          nextLabel="בהמשך המודול"
        />
      </Beat>
    </AbsoluteFill>
  );
};
