import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { CrossFade } from "../components/CrossFade";
import { AimAtInput } from "../graphics/AimAtInput";
import { AttachInstead } from "../graphics/AttachInstead";
import { BriefBoth } from "../graphics/BriefBoth";
import { BriefSlots } from "../graphics/BriefSlots";
import { ConstraintNarrows } from "../graphics/ConstraintNarrows";
import { ContextStack } from "../graphics/ContextStack";
import { FeedbackAim } from "../graphics/FeedbackAim";
import { LineIcon } from "../graphics/LineIcon";
import { LiveEdits } from "../graphics/LiveEdits";
import { NextLayer } from "../graphics/NextLayer";
import { NoSecretLanguage } from "../graphics/NoSecretLanguage";
import { NotFinalStamp } from "../graphics/NotFinalStamp";
import { OneThreadFiveGoals } from "../graphics/OneThreadFiveGoals";
import { ProjectBlanks } from "../graphics/ProjectBlanks";
import { RetypeLoop } from "../graphics/RetypeLoop";
import { RoundsConverge } from "../graphics/RoundsConverge";
import { SameChat } from "../graphics/SameChat";
import { SameToolSplit } from "../graphics/SameToolSplit";
import { SharedDraft } from "../graphics/SharedDraft";
import { VagueReply } from "../graphics/VagueReply";
import { CanvasScene } from "../scenes/CanvasScene";
import { OutroScene } from "../scenes/OutroScene";
import { StatementScene } from "../scenes/StatementScene";
import { TitleScene } from "../scenes/TitleScene";
import { EP4, type BeatIdEp4 } from "../script";
import { COLORS, seconds } from "../theme";

/** The narration, plus a beat of air at the end. */
export const CLAUDE_CONTEXT_DURATION = seconds(EP4.totalSeconds + 1.2);

const CROSSFADE = seconds(0.34);

/** Places a scene on episode 4's narration timeline. */
const Beat: React.FC<{
  readonly id: BeatIdEp4;
  readonly extend?: number;
  readonly children: React.ReactNode;
}> = ({ id, extend = 0, children }) => (
  <Sequence
    from={seconds(EP4.at(id))}
    durationInFrames={seconds(EP4.length(id) + extend) + CROSSFADE}
    name={id}
  >
    <CrossFade frames={CROSSFADE}>{children}</CrossFade>
  </Sequence>
);

/** Length of a beat in frames, for a graphic that spans several of them. */
const span = (...ids: readonly BeatIdEp4[]) =>
  ids.reduce((total, id) => total + EP4.length(id), 0);

/** Frames from the start of `from` to the start of `to`. */
const gap = (from: BeatIdEp4, to: BeatIdEp4) =>
  seconds(EP4.at(to) - EP4.at(from));

/**
 * Episode 4: giving Claude context, and working in rounds.
 *
 * The brief for this episode asked for animation to carry the narration rather
 * than for scenes that caption it, so almost every beat runs a graphic built
 * for that beat alone and nothing else reuses it. Several passages are held as
 * one continuous take across a run of beats — the brief filling in, the blanks
 * being guessed, the corrections landing on the page — because each of those
 * is a single causal chain that cutting would break into unrelated claims.
 *
 * There are no interface screenshots here. Nothing in the narration points at
 * a control; it is all about what you put into a conversation and what you do
 * with the first answer, which is a matter of shape and sequence rather than
 * of where to click.
 */
export const ClaudeContext: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/narration-ep4.mp3")} />

      <Beat id="gap">
        <CanvasScene>
          {(size) => (
            <SameToolSplit
              {...size}
              oneAt={seconds(4.16)}
              twoAt={seconds(8.16)}
              gapAt={seconds(11.0)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="not-claude">
        <CanvasScene
          captions={[
            {
              at: seconds(3.4),
              text: "ההבדל הוא במה שנתתם לו לעבוד איתו",
              emphasise: ["במה", "שנתתם"],
            },
          ]}
        >
          {(size) => (
            <AimAtInput
              {...size}
              aimAt={seconds(0.4)}
              ruleOutAt={seconds(1.5)}
              landAt={seconds(3.1)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="promise">
        <TitleScene
          kicker="מדריך קלוד · פרק רביעי"
          title="לתת הקשר, ולעבוד בסבבים"
          subtitle="למה התשובה הראשונה היא כמעט תמיד רק ההתחלה"
        />
      </Beat>

      {/* The vague prompt and its verdict are one take: the reply has to be
          granted as good before the missing addressee can take it away. */}
      <Beat id="vague" extend={span("for-nobody")}>
        <CanvasScene>
          {(size) => (
            <VagueReply
              {...size}
              prompt="תכתוב לי משהו על מנהיגות"
              typeAt={seconds(0.3)}
              typeFrames={seconds(1.9)}
              replyAt={seconds(4.34)}
              tags={[
                { at: seconds(5.0), text: "נכון" },
                { at: seconds(6.0), text: "מסודר" },
                { at: seconds(7.2), text: "כתוב יפה" },
              ]}
              emptyAt={seconds(9.22)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Brief, deliverable and recap in one shot, so the improvement on the
          left reads as caused by the fields on the right. */}
      <Beat id="brief" extend={span("workable", "what-changed")}>
        <CanvasScene>
          {(size) => (
            <BriefSlots
              {...size}
              sharpenAt={gap("brief", "workable")}
              slots={[
                {
                  label: "מה בונים",
                  value: "מפגש פתיחה לתוכנית פיתוח מנהלים",
                  at: seconds(0.4),
                  question: "מה אני צריך ממנו",
                  questionAt: seconds(19.4),
                },
                {
                  label: "למי",
                  value: "20 מנהלי ביניים בחברת ביטוח",
                  at: seconds(5.1),
                  question: "למי זה מיועד",
                  questionAt: seconds(17.6),
                },
                {
                  label: "היקף",
                  value: "90 דקות",
                  at: seconds(8.0),
                  question: "מה ההיקף",
                  questionAt: seconds(21.0),
                },
                {
                  label: "דגש",
                  value: "מניהול מקצועי לניהול אנשים",
                  at: seconds(10.32),
                  question: "מה הנושא",
                  questionAt: seconds(23.0),
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="no-language">
        <CanvasScene>
          {(size) => (
            <NoSecretLanguage
              {...size}
              syntax={[
                "### ROLE: you are a world-class expert",
                "<constraints> tone=formal, len<=300 </c>",
                "{{ output_format: markdown | table }}",
                "IMPORTANT!!! think step by step",
                "--temperature 0.7 --top_p 0.95",
                "Take a deep breath and begin.",
              ]}
              strikeAt={seconds(5.4)}
              briefAt={seconds(6.7)}
              briefTitle="בריף לעמית שנכנס לפרויקט"
              briefLines={[
                "מי הלקוח",
                "מה נאמר בפגישה הקודמת",
                "מה כבר נפסל",
                "איך נראה אצלנו תוצר טוב",
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Globe, blanks, guesses and grade in one take: the answer being nearly
          right is a consequence of the blanks, not a separate complaint. */}
      <Beat
        id="world-not-project"
        extend={span("blanks", "guesses", "roughly-right")}
      >
        <CanvasScene>
          {(size) => (
            <ProjectBlanks
              {...size}
              recedeAt={gap("world-not-project", "blanks")}
              guessAt={gap("world-not-project", "guesses")}
              tagAt={seconds(22.9)}
              stampAt={gap("world-not-project", "roughly-right")}
              rows={[
                {
                  label: "הלקוח",
                  guess: "לקוח טיפוסי",
                  at: seconds(7.02),
                },
                {
                  label: "מה נאמר בפגישה הקודמת",
                  guess: "מה שנאמר בפגישות דומות",
                  at: seconds(9.1),
                },
                {
                  label: "מה כבר ניסיתם ומה נפסל",
                  guess: "שום דבר לא נפסל",
                  at: seconds(11.54),
                },
                {
                  label: "איך נראה תוצר טוב אצלנו",
                  guess: "תוצר טוב באופן כללי",
                  at: seconds(14.34),
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="attach">
        <CanvasScene>
          {(size) => (
            <AttachInstead
              {...size}
              strikeAt={seconds(2.1)}
              files={[
                {
                  name: "סיכום פגישה עם הלקוח",
                  icon: "meeting",
                  at: seconds(3.42),
                },
                {
                  name: "מצגת מתוכנית קודמת",
                  icon: "slides",
                  at: seconds(6.02),
                },
                {
                  name: "תוצר שכבר אושר",
                  icon: "check",
                  at: seconds(7.6),
                  anchor: true,
                  anchorAt: seconds(9.6),
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="constraint">
        <CanvasScene title="אילוץ מראש">
          {(size) => (
            <ConstraintNarrows
              {...size}
              proposed="סדנה של יומיים"
              actual="חצי יום"
              remaining={0.25}
              rejectAt={seconds(6.4)}
              narrowAt={seconds(7.9)}
              pruneAt={seconds(10.7)}
              options={[
                { label: "יומיים", fits: false },
                { label: "יום וחצי", fits: false },
                { label: "יום שלם", fits: false },
                { label: "חצי יום", fits: true },
                { label: "שלוש שעות", fits: true },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="rule-of-thumb">
        <CanvasScene title="כלל אצבע">
          {(size) => (
            <BriefBoth
              {...size}
              briefLines={["מי הלקוח", "מה ההיקף", "מה כבר נפסל"]}
              toColleagueAt={seconds(4.6)}
              toClaudeAt={seconds(7.6)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="not-final">
        <CanvasScene>
          {(size) => (
            <NotFinalStamp
              {...size}
              stampAt={seconds(2.96)}
              relabelAt={seconds(5.0)}
              note="ההרגל הכי חשוב לשנות"
              noteAt={seconds(6.1)}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="retype-loop">
        <CanvasScene>
          {(size) => (
            <RetypeLoop
              {...size}
              cutAt={seconds(8.5)}
              stations={[
                { label: "שולחים בקשה", at: seconds(0.2), context: 0.4 },
                {
                  label: "תשובה שלא בדיוק מתאימה",
                  at: seconds(2.06),
                  context: 0.7,
                },
                { label: "פותחים צ'אט חדש", at: seconds(4.48), context: 0 },
                { label: "מנסחים הכול מחדש", at: seconds(6.34), context: 0.2 },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="rounds">
        <CanvasScene>
          {(size) => (
            <RoundsConverge
              {...size}
              rounds={[
                {
                  label: "סבב 1",
                  at: seconds(0.4),
                  fit: 0.45,
                  verdict: "בכיוון הכללי",
                },
                {
                  label: "סבב 2",
                  at: seconds(4.6),
                  fit: 0.74,
                  verdict: "מדויק יותר",
                },
                {
                  label: "סבב 3",
                  at: seconds(5.8),
                  fit: 0.95,
                  verdict: "מתאים",
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Four corrections, each answered by the page. The instructions are the
          narrator's own words, so the picture and the voice stay in step. */}
      <Beat id="live-edits">
        <CanvasScene title="באותה שיחה">
          {(size) => (
            <LiveEdits
              {...size}
              initial={{
                audience: "מנהלים חדשים",
                sections: [
                  { weight: 1, lines: 3 },
                  { weight: 1, lines: 2 },
                  { weight: 1, lines: 3 },
                  { weight: 0.9, lines: 2 },
                ],
              }}
              stages={[
                {
                  at: seconds(3.4),
                  instruction: "החלק השני שטחי מדי — תעמיק אותו",
                  sections: [
                    { weight: 1, lines: 3 },
                    { weight: 1.7, lines: 5 },
                    { weight: 1, lines: 3 },
                    { weight: 0.9, lines: 2 },
                  ],
                },
                {
                  at: seconds(6.9),
                  instruction: "תקצר את זה בשליש",
                  sections: [
                    { weight: 1, lines: 2 },
                    { weight: 1.4, lines: 3.4 },
                    { weight: 1, lines: 2 },
                    { weight: 0.7, lines: 1.4 },
                  ],
                  fill: 0.68,
                  measure: "שליש פחות",
                },
                {
                  at: seconds(9.0),
                  instruction: "תן לי שלוש פתיחות שונות",
                  sections: [
                    { weight: 1, lines: 2 },
                    { weight: 1.4, lines: 3.4 },
                    { weight: 1, lines: 2 },
                    { weight: 0.7, lines: 1.4 },
                  ],
                  fill: 0.68,
                  fork: 0,
                  chooseAt: seconds(11.0),
                  chosen: 1,
                },
                {
                  at: seconds(13.0),
                  instruction: "זה לא מתאים לקהל שלנו — הם מנוסים יותר",
                  sections: [
                    { weight: 0.7, lines: 1.6 },
                    { weight: 1.4, lines: 3.4 },
                    { weight: 1, lines: 2 },
                    { weight: 0.7, lines: 1.4 },
                  ],
                  fill: 0.62,
                  audience: "מנהלים מנוסים",
                },
              ]}
              note="וזה מספיק"
              noteAt={seconds(16.02)}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* The stack and its loss are the same picture, so they share a take. */}
      <Beat id="context-stack" extend={span("new-chat-cost")}>
        <CanvasScene>
          {(size) => (
            <ContextStack
              {...size}
              newChatAt={gap("context-stack", "new-chat-cost")}
              rebuildAt={seconds(11.06)}
              layers={[
                { label: "הבריף", icon: "doc", at: seconds(1.92) },
                { label: "הקבצים", icon: "files", at: seconds(3.56) },
                { label: "מה שכבר ביקשתם", icon: "quote", at: seconds(4.44) },
                { label: "כל התיקונים בדרך", icon: "pen", at: seconds(6.08) },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="shared-draft">
        <CanvasScene>
          {(size) => (
            <SharedDraft
              {...size}
              qaAt={seconds(1.96)}
              mergeAt={seconds(3.76)}
              steps={[
                { label: "אתם נותנים כיוון", at: seconds(7.48), by: "you" },
                { label: "הוא מציע משהו", at: seconds(8.48), by: "claude" },
                { label: "אתם מתקנים", at: seconds(9.92), by: "you" },
                { label: "והוא משתפר", at: seconds(11.04), by: "claude" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      {/* Wording on the left, the edit it produces on the right. */}
      <Beat id="useful-feedback" extend={span("specific-aim")}>
        <CanvasScene>
          {(size) => (
            <FeedbackAim
              {...size}
              betterAt={seconds(7.5)}
              precisionAt={seconds(16.18)}
              useful={[
                { at: seconds(5.34), text: "זה ארוך מדי" },
                { at: seconds(10.36), text: "הפתיחה לא מעניינת" },
              ]}
              hedged={[
                { at: seconds(8.6), text: "אולי אפשר לקצר קצת" },
                { at: seconds(13.72), text: "אני לא בטוח שזה בדיוק הכיוון" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="everyday">
        <StatementScene
          statement="אז איפה כל זה פוגש אותנו ביום־יום?"
          emphasise={["ביום־יום?"]}
          align="center"
          panel={{ width: 260, height: 260 }}
          graphic={({ width, height }) => (
            <div
              style={{
                width,
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LineIcon
                name="clock"
                size={Math.min(width, height) * 0.8}
                color={COLORS.accent}
                drawFrames={seconds(1.1)}
                idle
              />
            </div>
          )}
        />
      </Beat>

      {/* Five goals, one thread. The thread never changes for the whole run,
          which is what makes the line that follows land. */}
      <Beat id="one-thread">
        <CanvasScene title="אותה שיחה, מטרה אחרת">
          {(size) => (
            <OneThreadFiveGoals
              {...size}
              goals={[
                {
                  at: seconds(0.1),
                  label: "כתיבה ועריכה",
                  kind: "edit",
                  actions: [
                    { at: seconds(2.12), text: "להתחיל מטיוטה" },
                    { at: seconds(4.14), text: "לחדד ניסוח" },
                    { at: seconds(5.48), text: "לקצר" },
                    { at: seconds(6.5), text: "לשנות טון" },
                    { at: seconds(7.62), text: "כמה גרסאות" },
                  ],
                },
                {
                  at: seconds(9.36),
                  label: "סיכום",
                  kind: "summarise",
                  actions: [
                    { at: seconds(10.98), text: "שרשור מיילים" },
                    { at: seconds(13.32), text: "פרוטוקול או דוח ארוך" },
                    { at: seconds(14.94), text: "לשאול שאלות על התוכן" },
                    { at: seconds(17.2), text: "בלי לקרוא את הכול" },
                  ],
                },
                {
                  at: seconds(18.98),
                  label: "שותף לחשיבה",
                  kind: "ideas",
                  actions: [
                    { at: seconds(21.06), text: "כשנתקעים על רעיון" },
                    { at: seconds(23.5), text: "חמש דרכים שונות" },
                    { at: seconds(25.92), text: "לבנות את המפגש" },
                  ],
                },
                {
                  at: seconds(27.28),
                  label: "ניתוח והשוואה",
                  kind: "compare",
                  actions: [
                    { at: seconds(29.8), text: "שתי גרסאות" },
                    { at: seconds(31.5), text: "מה השתנה" },
                    { at: seconds(33.32), text: "מה חסר" },
                    { at: seconds(34.46), text: "איפה סותרות" },
                  ],
                },
                {
                  at: seconds(37.22),
                  label: "תוצר מובנה",
                  kind: "structure",
                  actions: [
                    { at: seconds(39.42), text: "תוכנית מפגש" },
                    { at: seconds(40.74), text: "טבלה, מסמך מסודר" },
                    { at: seconds(42.62), text: "איך שאתם רוצים שזה ייראה" },
                  ],
                },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="same-chat">
        <CanvasScene>
          {(size) => (
            <SameChat
              {...size}
              mergeAt={seconds(2.54)}
              regoalAt={seconds(4.18)}
              goals={[
                { label: "כתיבה ועריכה", icon: "pen" },
                { label: "סיכום", icon: "text" },
                { label: "שותף לחשיבה", icon: "bulb" },
                { label: "ניתוח והשוואה", icon: "compare" },
                { label: "תוצר מובנה", icon: "table" },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="next">
        <CanvasScene title="בפרק הבא">
          {(size) => (
            <NextLayer
              {...size}
              workAt={seconds(10.5)}
              blankAt={seconds(11.2)}
              files={[
                { label: "מסמכים", icon: "doc", at: seconds(4.38) },
                { label: "מצגות", icon: "slides", at: seconds(5.3) },
                { label: "טבלאות", icon: "table", at: seconds(6.2) },
              ]}
            />
          )}
        </CanvasScene>
      </Beat>

      <Beat id="outro" extend={1.2}>
        <OutroScene
          statement="במקום להתחיל כל פעם מדף ריק"
          emphasise={["מדף", "ריק"]}
          nextUp="מסמכים, מצגות וטבלאות — ישר בתוך השיחה"
          nextLabel="בפרק הבא"
        />
      </Beat>
    </AbsoluteFill>
  );
};
