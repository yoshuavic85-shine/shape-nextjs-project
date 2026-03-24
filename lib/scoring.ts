import { ShapeProfileData, CategoryScore } from "@/types";

interface ResponseWithQuestion {
  value: number;
  question: {
    section: string;
    category: string;
  };
}

function calculateCategoryScores(
  responses: ResponseWithQuestion[],
  section: string,
): { scores: Record<string, number>; top: CategoryScore[] } {
  const categoryMap: Record<string, number[]> = {};

  for (const r of responses) {
    if (r.question.section !== section) continue;
    const cat = r.question.category;
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(r.value);
  }

  const scores: Record<string, number> = {};
  for (const [cat, values] of Object.entries(categoryMap)) {
    scores[cat] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([category, score]) => ({
      category,
      score: Math.round(score * 100) / 100,
      label: CATEGORY_LABELS[category] || category,
    }));

  return { scores, top: sorted.slice(0, 3) };
}

function calculatePersonality(
  responses: ResponseWithQuestion[],
): ShapeProfileData["personality"] {
  const personalityResponses = responses.filter(
    (r) => r.question.section === "PERSONALITY",
  );

  const catMap: Record<string, number[]> = {};
  for (const r of personalityResponses) {
    const cat = r.question.category;
    if (!catMap[cat]) catMap[cat] = [];
    catMap[cat].push(r.value);
  }

  function getSpectrum(positiveKey: string, negativeKey: string): number {
    const posValues = catMap[positiveKey] || [3];
    const negValues = catMap[negativeKey] || [3];
    const posAvg = posValues.reduce((a, b) => a + b, 0) / posValues.length;
    const negAvg = negValues.reduce((a, b) => a + b, 0) / negValues.length;
    return Math.round((posAvg / (posAvg + negAvg)) * 100) / 100;
  }

  return {
    introvertExtrovert: getSpectrum("EXTROVERT", "INTROVERT"),
    taskPeople: getSpectrum("TASK", "PEOPLE"),
    structuredFlexible: getSpectrum("STRUCTURED", "FLEXIBLE"),
    thinkerFeeler: getSpectrum("THINKER", "FEELER"),
    leaderSupporter: getSpectrum("LEADER", "SUPPORTER"),
  };
}

export function calculateShapeProfile(
  responses: ResponseWithQuestion[],
): ShapeProfileData {
  return {
    spiritualGifts: calculateCategoryScores(responses, "SPIRITUAL_GIFTS"),
    heart: calculateCategoryScores(responses, "HEART"),
    abilities: calculateCategoryScores(responses, "ABILITIES"),
    personality: calculatePersonality(responses),
    experience: calculateCategoryScores(responses, "EXPERIENCE"),
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

const CATEGORY_LABELS: Record<string, string> = {
  // Spiritual Gifts
  TEACHING: "Mengajar",
  SERVING: "Melayani",
  LEADERSHIP: "Memimpin",
  GIVING: "Memberi",
  MERCY: "Mengasihani",
  FAITH: "Iman",
  WISDOM: "Hikmat",
  KNOWLEDGE: "Pengetahuan",
  EXHORTATION: "Menasihati",
  EVANGELISM: "Penginjilan",
  // Heart
  EDUCATION: "Pendidikan",
  SOCIAL_JUSTICE: "Keadilan Sosial",
  ARTS: "Seni/Kreativitas",
  HEALTH: "Kesehatan",
  FAMILY: "Keluarga",
  YOUTH: "Pemuda",
  MISSIONS: "Misi",
  COMMUNITY: "Komunitas",
  TECHNOLOGY: "Teknologi",
  ENVIRONMENT: "Lingkungan",
  // Abilities
  COMMUNICATION: "Komunikasi",
  ORGANIZATION: "Organisasi",
  ANALYTICAL: "Analitis",
  CREATIVE: "Kreatif",
  TECHNICAL: "Teknis",
  INTERPERSONAL: "Interpersonal",
  WRITING: "Menulis",
  MUSICAL: "Musik",
  LEADERSHIP_ABILITY: "Kepemimpinan",
  TEACHING_ABILITY: "Mengajar",
  // Experience
  SPIRITUAL_EXP: "Pengalaman Spiritual",
  PAINFUL_EXP: "Pengalaman Menyakitkan",
  EDUCATIONAL_EXP: "Pengalaman Pendidikan",
  WORK_EXP: "Pengalaman Kerja",
  MINISTRY_EXP: "Pengalaman Pelayanan",
  // Personality
  EXTROVERT: "Extrovert",
  INTROVERT: "Introvert",
  TASK: "Berorientasi Tugas",
  PEOPLE: "Berorientasi Relasi",
  STRUCTURED: "Terstruktur",
  FLEXIBLE: "Fleksibel",
  THINKER: "Pemikir",
  FEELER: "Perasa",
  LEADER: "Pemimpin",
  SUPPORTER: "Pendukung",
};

export { CATEGORY_LABELS };
