import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { ChatAsk } from "../graphics/ChatAsk";
import { ConnectFlow } from "../graphics/ConnectFlow";
import { PermissionMirror } from "../graphics/PermissionMirror";
import { SystemRouter } from "../graphics/SystemRouter";
import { CardsScene } from "../scenes/CardsScene";
import { ChapterCard } from "../scenes/ChapterCard";
import { ContrastScene } from "../scenes/ContrastScene";
import { ItemsScene } from "../scenes/ItemsScene";
import { OutroScene } from "../scenes/OutroScene";
import { ShowcaseScene } from "../scenes/ShowcaseScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP3, type BeatIdEp3 } from "../script";
import { seconds } from "../theme";
import { SCREENS } from "../ui/screens";

const CONNECTORS = SCREENS.connectors.regions;

/** The narration, plus a beat of air at the end. */
export const CLAUDE_CONNECT_DURATION = seconds(EP3.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/** Places a scene on episode 3's narration timeline. */
const Beat: React.FC<{
  readonly id: BeatIdEp3;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP3.at(id))}
    durationInFrames={seconds(EP3.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/**
 * Episode 3: connecting Claude to Microsoft 365.
 *
 * Only the connector directory exists as a screenshot here, so the sign-in and
 * consent steps are drawn instead — those screens carry a real organisational
 * address and tenant name, which should not travel in a shared video. The
 * permissions section, which the narration calls the most important part of the
 * episode, gets the most deliberate graphic.
 */
export const ClaudeConnect: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep3.mp3")} />

      <Beat id="recap">
        <StatementScene
          kicker="עד עכשיו"
          statement="עבדנו עם קלוד על מה שהבאנו אליו בעצמנו — טקסטים, קבצים, מסמכים"
          align="center"
        />
      </Beat>

      <Beat id="title">
        <TitleScene
          kicker="מדריך קלוד · פרק שלישי"
          title="מתחברים למערכות"
          subtitle="עכשיו קלוד מתחבר למקום שבו העבודה שלכם כבר נמצאת"
        />
      </Beat>

      <Beat id="where-work-lives">
        <ItemsScene
          blockWidth={780}
          items={[
            { text: "המיילים", icon: "mail", at: seconds(0.1) },
            { text: "הקבצים", icon: "files", at: seconds(0.7) },
            { text: "הפגישות", icon: "calendar", at: seconds(1.3) },
            { text: "והשיחות הארגוניות", icon: "meeting", at: seconds(1.9) },
          ]}
        />
      </Beat>

      <Beat id="hook">
        <StatementScene
          kicker="אבל לפני שמתחילים"
          statement="חשוב להבין מה קלוד באמת יכול לראות שם — ומה לא"
          emphasise={["ומה", "לא"]}
          align="center"
        />
      </Beat>

      {/* --- Connecting -------------------------------------------------- */}

      <Beat id="chapter-connect">
        <ChapterCard index={1} title="נתחיל מהחיבור" />
      </Beat>

      <Beat id="connect-steps">
        <StatementScene
          kicker="ארבעה צעדים"
          statement="ומכאן קלוד עובד מול המערכות הארגוניות"
          graphic={({ width, height }) => (
            <ConnectFlow
              width={width}
              height={height}
              delay={seconds(0.6)}
              stagger={seconds(1.5)}
            />
          )}
          panel={{ width: 720, height: 520 }}
        />
      </Beat>

      <Beat id="access-scope">
        <StatementScene
          statement="מול המערכות שאליהן יש לכם גישה"
          emphasise={["לכם"]}
          align="center"
        />
      </Beat>

      <Beat id="org-account-only">
        <ContrastScene
          heading="שימו לב לנקודה הזאת"
          not={{ label: "לא", lines: ["חשבון מייקרוסופט פרטי"] }}
          but={{ label: "כן", lines: ["החשבון הארגוני"] }}
          butAt={seconds(3.2)}
        />
      </Beat>

      {/* --- What it opens up -------------------------------------------- */}

      <Beat id="chapter-opens">
        <ChapterCard index={2} title="אז מה נפתח אחרי החיבור?" />
      </Beat>

      <Beat id="outlook">
        <ItemsScene
          kicker="אאוטלוק והיומן"
          blockWidth={1080}
          items={[
            { text: "לחפש במיילים שלכם", icon: "mail", at: seconds(3.0) },
            {
              text: "לעבור על שרשור ארוך ולהוציא ממנו את מה שחשוב",
              icon: "text",
              at: seconds(5.4),
            },
          ]}
        />
      </Beat>

      <Beat id="calendar-questions">
        <StatementScene
          kicker="הוא רואה גם את הפגישות ביומן"
          statement="אז אפשר לשאול שאלות טבעיות לגמרי"
          footnote="בלי לפתוח את היומן ולעבור עליו בעצמכם"
          graphic={({ width, height }) => (
            <ChatAsk
              width={width}
              height={height}
              delay={seconds(0.4)}
              turns={[
                {
                  from: "you",
                  text: "מתי אני מנחה בשבוע הבא?",
                  at: seconds(6.6),
                },
                {
                  from: "you",
                  text: "אילו פגישות יש לי מחר בבוקר?",
                  at: seconds(9.5),
                },
              ]}
            />
          )}
          panel={{ width: 780, height: 430 }}
        />
      </Beat>

      <Beat id="sharepoint">
        <ContrastScene
          heading="שיירפוינט ווואן דרייב"
          not={{
            label: "במקום",
            lines: ["לזכור באיזו תיקייה שמרתם", "מסמך מלפני שלושה חודשים"],
          }}
          but={{
            label: "קלוד",
            lines: [
              "מחפש במקומות שיש לכם גישה אליהם",
              "פותח וקורא את התוכן ישירות",
            ],
          }}
          butAt={seconds(5.4)}
        />
      </Beat>

      <Beat id="teams">
        <StatementScene
          kicker="ויש גם טימס"
          statement="קלוד יכול לעזור לחזור למה שקרה בפגישות ובשיחות"
          emphasise={["לחזור"]}
          align="center"
        />
      </Beat>

      <Beat id="teams-questions">
        <StatementScene
          statement="למשל"
          graphic={({ width, height }) => (
            <ChatAsk
              width={width}
              height={height}
              delay={seconds(0.3)}
              turns={[
                {
                  from: "you",
                  text: "תזכיר לי מה נאמר בפגישה שלי עם רן השבוע",
                  at: seconds(0.4),
                },
                {
                  from: "you",
                  text: "מה החלטנו בפגישה בנושא הזה?",
                  at: seconds(3.4),
                },
              ]}
            />
          )}
          panel={{ width: 820, height: 340 }}
        />
      </Beat>

      <Beat id="transcript-required">
        <ItemsScene
          kicker="אבל כאן יש כוכבית חשובה"
          heading="צריך שיהיה לפגישה תמלול זמין"
          blockWidth={1060}
          items={[
            {
              text: "אם הפגישה לא תומללה — אין לו דרך לדעת מה נאמר בה",
              icon: "warning",
              at: seconds(9.0),
            },
          ]}
        />
      </Beat>

      {/* --- Ask, do not search ------------------------------------------ */}

      <Beat id="no-need-to-know">
        <StatementScene
          statement="אתם לא צריכים לחשוב איזו מערכת מכילה את המידע"
          emphasise={["לא", "צריכים"]}
          align="center"
        />
      </Beat>

      <Beat id="one-request">
        <StatementScene
          kicker="בקשה אחת"
          statement="והוא מחפש במקום הרלוונטי"
          graphic={({ width, height }) => (
            <SystemRouter
              width={width}
              height={height}
              delay={seconds(0.8)}
              target={1}
              request="מצא את מסמך התכנון האחרון בשיירפוינט וסכם את עיקרי הדברים"
            />
          )}
          panel={{ width: 800, height: 470 }}
        />
      </Beat>

      <Beat id="the-big-change">
        <ContrastScene
          heading="וזה השינוי הגדול"
          not={{ label: "במקום", lines: ["שאתם תלכו לחפש את המידע"] }}
          but={{ label: "עכשיו", lines: ["אתם מבקשים את התוצאה שאתם צריכים"] }}
          butAt={seconds(3.4)}
        />
      </Beat>

      {/* --- Permissions: the most important part ------------------------- */}

      <Beat id="chapter-permissions">
        <StatementScene
          kicker="החלק הכי חשוב בסרטון הזה"
          statement="קלוד לא מקבל גישה לכל הארגון"
          emphasise={["לא"]}
          align="center"
        />
      </Beat>

      <Beat id="sees-only-yours">
        <StatementScene
          kicker="הוא רואה רק את מה שאתם מורשים לראות"
          statement="אותם כללים בדיוק"
          graphic={({ width, height }) => (
            <PermissionMirror
              width={width}
              height={height}
              delay={seconds(0.6)}
            />
          )}
          panel={{ width: 840, height: 480 }}
        />
      </Beat>

      <Beat id="no-master-key">
        <StatementScene
          statement="אין מפתח ראשי לארגון ואין דרך לעקוף את מערכת ההרשאות"
          emphasise={["אין", "מפתח", "ראשי"]}
          align="center"
        />
      </Beat>

      <Beat id="same-rules">
        <ItemsScene
          kicker="במילים אחרות"
          heading="כללי הגישה שכבר קיימים ב-NGG נשארים בדיוק אותם כללים"
          blockWidth={1140}
          items={[
            {
              text: "קלוד פשוט עובד בתוך ההרשאות שכבר יש לכם",
              icon: "shield",
              at: seconds(6.0),
            },
          ]}
        />
      </Beat>

      <Beat id="no-download">
        <ContrastScene
          heading="המידע לא צריך לעבור אליכם"
          not={{
            label: "במקום",
            lines: ["להוריד קובץ", "לשמור אותו במחשב", "ואז להעלות אותו לצ׳אט"],
          }}
          but={{
            label: "קלוד",
            lines: ["ניגש למקור כשצריך", "ועונה על בסיסו"],
          }}
          butAt={seconds(6.4)}
        />
      </Beat>

      {/* --- Reading versus doing ---------------------------------------- */}

      <Beat id="read-vs-do">
        <CardsScene
          heading="הבדל שכדאי לזכור — בין לקרוא לבין לעשות"
          cards={[
            {
              title: "לחפש ולקרוא",
              note: "מידע ארגוני שיש לכם גישה אליו",
              glyph: "doc",
            },
            { title: "לסכם", note: "שרשור, מסמך, פגישה", glyph: "table" },
            { title: "להשוות ולנתח", note: "בין מקורות שונים", glyph: "wand" },
          ]}
          startAt={seconds(1.2)}
          stagger={seconds(3.2)}
        />
      </Beat>

      <Beat id="send-example">
        <ContrastScene
          heading="יש הבדל גדול בין"
          not={{ label: "לבקש", lines: ["למצוא מייל ולנסח תשובה"] }}
          but={{ label: "לבין", lines: ["לשלוח את המייל בפועל"] }}
          butAt={seconds(3.6)}
        />
      </Beat>

      <Beat id="rule">
        <ShowcaseScene
          screen={SCREENS.connectors}
          title="כלל אצבע"
          windowWidth={1560}
          steps={[
            {
              at: 0,
              region: CONNECTORS.microsoft365,
              frameOn: CONNECTORS.connectedPair,
              fill: 0.6,
              label: "גישה למידע הארגוני — לחיפוש, קריאה ועבודה עליו",
              side: "left",
              reach: 130,
              moveDuration: seconds(1.4),
            },
          ]}
        />
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="מלשאול על קובץ אחד — לשאול על יום העבודה שלכם"
          emphasise={["יום", "העבודה"]}
          nextUp="עכשיו מתחיל החלק המעניין באמת"
          nextLabel="מכאן"
        />
      </Beat>
    </AbsoluteFill>
  );
};
