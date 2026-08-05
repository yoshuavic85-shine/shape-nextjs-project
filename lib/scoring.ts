import { ShapeProfileData, CategoryScore, ProfileQuality } from "@/types";
import { CATEGORY_LABELS } from "./constants/category-labels";
import { ATTENTION_EXPECTED } from "./constants/questions";

export { CATEGORY_LABELS };

interface ResponseWithQuestion {
  value: number;
  question: {
    section: string;
    category: string;
    reverseKeyed?: boolean;
    isAttentionCheck?: boolean;
    text?: string;
  };
}

type PersonalitySpectrumKey =
  | "introvertExtrovert"
  | "taskPeople"
  | "structuredFlexible"
  | "thinkerFeeler"
  | "leaderSupporter";

const PERSONALITY_PAIRS: {
  key: PersonalitySpectrumKey;
  positive: string;
  negative: string;
}[] = [
  {
    key: "introvertExtrovert",
    positive: "EXTROVERT",
    negative: "INTROVERT",
  },
  { key: "taskPeople", positive: "TASK", negative: "PEOPLE" },
  {
    key: "structuredFlexible",
    positive: "STRUCTURED",
    negative: "FLEXIBLE",
  },
  { key: "thinkerFeeler", positive: "THINKER", negative: "FEELER" },
  { key: "leaderSupporter", positive: "LEADER", negative: "SUPPORTER" },
];

/** Map Likert 1–5 with optional reverse keying. */
export function scoreItem(value: number, reverseKeyed: boolean): number {
  const clamped = Math.min(5, Math.max(1, value));
  return reverseKeyed ? 6 - clamped : clamped;
}

function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Ipsative category scoring within a section:
 * 1) score items (reverse-aware)
 * 2) raw mean per category
 * 3) subtract person-section mean (ipsative)
 * 4) map to 1–5 display for charts
 * 5) rank top-N by ipsative strength
 */
function calculateCategoryScores(
  responses: ResponseWithQuestion[],
  section: string,
  topN = 3,
): {
  scores: Record<string, number>;
  rawMeans: Record<string, number>;
  top: CategoryScore[];
  consistencyByCategory: Record<string, number>;
} {
  const categoryMap: Record<string, number[]> = {};

  for (const r of responses) {
    if (r.question.section !== section) continue;
    if (r.question.isAttentionCheck) continue;
    if (r.question.category === "ATTENTION") continue;

    const cat = r.question.category;
    const scored = scoreItem(r.value, Boolean(r.question.reverseKeyed));
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(scored);
  }

  const rawMeans: Record<string, number> = {};
  const consistencyByCategory: Record<string, number> = {};

  for (const [cat, values] of Object.entries(categoryMap)) {
    rawMeans[cat] = mean(values);
    // High SD across items → lower within-person consistency (0–1)
    const sd = stdDev(values);
    consistencyByCategory[cat] = round2(
      Math.max(0, Math.min(1, 1 - sd / 2)),
    );
  }

  const rawValues = Object.values(rawMeans);
  const personMean = rawValues.length ? mean(rawValues) : 3;

  const ipsative: Record<string, number> = {};
  for (const [cat, raw] of Object.entries(rawMeans)) {
    ipsative[cat] = raw - personMean;
  }

  // Display scores: center at 3, scale by max absolute ipsative in section
  const maxAbs = Math.max(
    0.5,
    ...Object.values(ipsative).map((v) => Math.abs(v)),
  );
  const scores: Record<string, number> = {};
  for (const [cat, ip] of Object.entries(ipsative)) {
    scores[cat] = round2(
      Math.min(5, Math.max(1, 3 + (ip / maxAbs) * 2)),
    );
  }

  const top = Object.entries(ipsative)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([category, ip]) => ({
      category,
      score: round2(scores[category]),
      rawMean: round2(rawMeans[category]),
      ipsative: round2(ip),
      label: CATEGORY_LABELS[category] || category,
      consistency: consistencyByCategory[category],
    }));

  return { scores, rawMeans, top, consistencyByCategory };
}

/**
 * Personality spectrum via standardized pole difference:
 * spectrum = (posAvg - negAvg + 4) / 8 → 0..1
 * Flags when both poles are high (ambiguous / dual endorsement).
 */
function calculatePersonality(
  responses: ResponseWithQuestion[],
): ShapeProfileData["personality"] {
  const personalityResponses = responses.filter(
    (r) =>
      r.question.section === "PERSONALITY" &&
      !r.question.isAttentionCheck &&
      r.question.category !== "ATTENTION",
  );

  const catMap: Record<string, number[]> = {};
  for (const r of personalityResponses) {
    const cat = r.question.category;
    const scored = scoreItem(r.value, Boolean(r.question.reverseKeyed));
    if (!catMap[cat]) catMap[cat] = [];
    catMap[cat].push(scored);
  }

  const ambiguousDimensions: string[] = [];
  const result: ShapeProfileData["personality"] = {
    introvertExtrovert: 0.5,
    taskPeople: 0.5,
    structuredFlexible: 0.5,
    thinkerFeeler: 0.5,
    leaderSupporter: 0.5,
    ambiguousDimensions: [],
  };

  for (const pair of PERSONALITY_PAIRS) {
    const posValues = catMap[pair.positive];
    const negValues = catMap[pair.negative];

    if (!posValues?.length || !negValues?.length) {
      result[pair.key] = 0.5;
      ambiguousDimensions.push(pair.key);
      continue;
    }

    const posAvg = mean(posValues);
    const negAvg = mean(negValues);

    // Both poles strongly endorsed → preference unclear
    if (posAvg >= 4 && negAvg >= 4) {
      ambiguousDimensions.push(pair.key);
    }
    // Both poles strongly rejected → weak signal
    if (posAvg <= 2 && negAvg <= 2) {
      ambiguousDimensions.push(pair.key);
    }

    const diff = posAvg - negAvg; // -4..4
    result[pair.key] = round2((diff + 4) / 8);
  }

  result.ambiguousDimensions = [...new Set(ambiguousDimensions)];
  return result;
}

/** Stable expected values by section (survives minor copy edits on attention text). */
const ATTENTION_EXPECTED_BY_SECTION: Partial<Record<string, number>> = {
  SPIRITUAL_GIFTS: 2,
  HEART: 4,
  ABILITIES: 1,
  PERSONALITY: 3,
};

function evaluateAttention(
  responses: ResponseWithQuestion[],
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  for (const r of responses) {
    if (!r.question.isAttentionCheck) continue;
    const expected =
      ATTENTION_EXPECTED_BY_SECTION[r.question.section] ??
      (r.question.text ? ATTENTION_EXPECTED[r.question.text] : null) ??
      null;
    if (expected == null) continue;
    if (r.value !== expected) {
      failures.push(r.question.section);
    }
  }
  return { passed: failures.length === 0, failures: [...new Set(failures)] };
}

function evaluateAcquiescence(responses: ResponseWithQuestion[]): boolean {
  const scored = responses.filter(
    (r) => !r.question.isAttentionCheck && !r.question.reverseKeyed,
  );
  if (scored.length < 10) return false;
  const high = scored.filter((r) => r.value >= 4).length;
  return high / scored.length >= 0.8;
}

function meanConsistency(
  maps: Record<string, number>[],
): number {
  const all: number[] = [];
  for (const m of maps) all.push(...Object.values(m));
  if (!all.length) return 0;
  return mean(all);
}

function confidenceFromSignals(input: {
  itemsPerCategory: number;
  consistency: number;
  attentionPassed: boolean;
  acquiescence: boolean;
  personalityAmbiguousCount: number;
}): ProfileQuality["overallConfidence"] {
  let score = 0;
  if (input.itemsPerCategory >= 4) score += 2;
  else if (input.itemsPerCategory >= 3) score += 1;

  if (input.consistency >= 0.7) score += 2;
  else if (input.consistency >= 0.5) score += 1;

  if (input.attentionPassed) score += 2;
  else score -= 2;

  if (input.acquiescence) score -= 1;
  if (input.personalityAmbiguousCount >= 3) score -= 1;

  if (score >= 5) return "high";
  if (score >= 3) return "moderate";
  return "low";
}

export function calculateShapeProfile(
  responses: ResponseWithQuestion[],
): ShapeProfileData {
  const gifts = calculateCategoryScores(responses, "SPIRITUAL_GIFTS");
  const heart = calculateCategoryScores(responses, "HEART");
  const abilities = calculateCategoryScores(responses, "ABILITIES");
  const experience = calculateCategoryScores(responses, "EXPERIENCE", 3);
  const personality = calculatePersonality(responses);

  const attention = evaluateAttention(responses);
  const acquiescenceFlag = evaluateAcquiescence(responses);
  const consistency = meanConsistency([
    gifts.consistencyByCategory,
    heart.consistencyByCategory,
    abilities.consistencyByCategory,
    experience.consistencyByCategory,
  ]);

  const firstGiftCat = Object.keys(gifts.rawMeans)[0];
  const itemsPerCategory = firstGiftCat
    ? responses.filter(
        (r) =>
          r.question.section === "SPIRITUAL_GIFTS" &&
          r.question.category === firstGiftCat &&
          !r.question.isAttentionCheck,
      ).length
    : 4;

  const overallConfidence = confidenceFromSignals({
    itemsPerCategory,
    consistency,
    attentionPassed: attention.passed,
    acquiescence: acquiescenceFlag,
    personalityAmbiguousCount: personality.ambiguousDimensions?.length ?? 0,
  });

  const quality: ProfileQuality = {
    instrumentVersion: "2.0",
    attentionPassed: attention.passed,
    attentionFailures: attention.failures,
    acquiescenceFlag,
    overallConfidence,
    meanItemConsistency: round2(consistency),
    itemsPerCategory,
    disclaimer:
      "Hasil ini adalah alat refleksi dan discovery pelayanan, bukan diagnosis psikologis atau klaim nubuatan. Interpretasikan bersama mentor/pemimpin rohani.",
  };

  return {
    spiritualGifts: {
      scores: gifts.scores,
      rawMeans: Object.fromEntries(
        Object.entries(gifts.rawMeans).map(([k, v]) => [k, round2(v)]),
      ),
      top: gifts.top,
    },
    heart: {
      scores: heart.scores,
      rawMeans: Object.fromEntries(
        Object.entries(heart.rawMeans).map(([k, v]) => [k, round2(v)]),
      ),
      top: heart.top,
    },
    abilities: {
      scores: abilities.scores,
      rawMeans: Object.fromEntries(
        Object.entries(abilities.rawMeans).map(([k, v]) => [k, round2(v)]),
      ),
      top: abilities.top,
    },
    personality,
    experience: {
      scores: experience.scores,
      rawMeans: Object.fromEntries(
        Object.entries(experience.rawMeans).map(([k, v]) => [k, round2(v)]),
      ),
      top: experience.top,
    },
    quality,
  };
}

const SECTION_TO_PROFILE_KEY: Record<string, keyof ShapeProfileData> = {
  SPIRITUAL_GIFTS: "spiritualGifts",
  HEART: "heart",
  ABILITIES: "abilities",
  PERSONALITY: "personality",
  EXPERIENCE: "experience",
};

/** Get data for a single section from full profile (for section-specific AI). */
export function getSectionProfileData(
  profile: ShapeProfileData,
  section: string,
): unknown {
  const key = SECTION_TO_PROFILE_KEY[section];
  return key ? profile[key] : null;
}
