/**
 * Smoke tests for instrument v2 scoring logic.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-scoring.ts
 */
import { QUESTIONS, ATTENTION_EXPECTED } from "../lib/constants/questions";
import {
  calculateShapeProfile,
  scoreItem,
} from "../lib/scoring";
import { countQuestionsBySection } from "../lib/constants/questions";
import { TOTAL_QUESTION_COUNT } from "../types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  const counts = countQuestionsBySection();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log("Question counts:", counts, "total=", total);
  assert(total === QUESTIONS.length, "count mismatch");
  assert(total === TOTAL_QUESTION_COUNT, `TOTAL_QUESTION_COUNT ${TOTAL_QUESTION_COUNT} != ${total}`);
  assert(counts.SPIRITUAL_GIFTS === 41, "SG should be 41");
  assert(counts.EXPERIENCE === 20, "EXP should be 20");

  assert(scoreItem(5, true) === 1, "reverse 5→1");
  assert(scoreItem(1, true) === 5, "reverse 1→5");
  assert(scoreItem(4, false) === 4, "forward");

  // Build synthetic responses: strong teaching, weak evangelism, pass attention
  const teaching = QUESTIONS.filter(
    (q) => q.section === "SPIRITUAL_GIFTS" && q.category === "TEACHING",
  );
  const responses = QUESTIONS.map((q) => {
    let value = 3;
    if (q.isAttentionCheck) {
      value = ATTENTION_EXPECTED[q.text] ?? 3;
    } else if (q.section === "SPIRITUAL_GIFTS" && q.category === "TEACHING") {
      value = q.reverseKeyed ? 1 : 5;
    } else if (q.section === "SPIRITUAL_GIFTS" && q.category === "EVANGELISM") {
      value = q.reverseKeyed ? 5 : 1;
    } else if (q.section === "PERSONALITY" && q.category === "EXTROVERT") {
      value = q.reverseKeyed ? 1 : 5;
    } else if (q.section === "PERSONALITY" && q.category === "INTROVERT") {
      value = q.reverseKeyed ? 5 : 1;
    }
    return {
      value,
      question: {
        section: q.section,
        category: q.category,
        reverseKeyed: q.reverseKeyed,
        isAttentionCheck: q.isAttentionCheck,
        text: q.text,
      },
    };
  });

  const profile = calculateShapeProfile(responses);
  assert(profile.quality?.attentionPassed === true, "attention should pass");
  assert(profile.quality?.instrumentVersion === "2.0", "version 2");
  assert(
    profile.spiritualGifts.top[0].category === "TEACHING",
    `expected TEACHING top, got ${profile.spiritualGifts.top[0].category}`,
  );
  assert(
    profile.personality.introvertExtrovert > 0.6,
    `expected extrovert lean, got ${profile.personality.introvertExtrovert}`,
  );

  // Fail attention
  const failAttention = responses.map((r) =>
    r.question.isAttentionCheck ? { ...r, value: 5 } : r,
  );
  const bad = calculateShapeProfile(failAttention);
  assert(bad.quality?.attentionPassed === false, "attention should fail");
  assert(
    bad.quality?.overallConfidence === "low" ||
      bad.quality?.overallConfidence === "moderate",
    "confidence should drop when attention fails",
  );

  console.log("OK — scoring smoke tests passed");
  console.log("Top gifts:", profile.spiritualGifts.top.map((t) => t.category));
  console.log("Confidence:", profile.quality?.overallConfidence);
  console.log("IE spectrum:", profile.personality.introvertExtrovert);
  void teaching;
}

main();
