export type ShapeSection =
  | "SPIRITUAL_GIFTS"
  | "HEART"
  | "ABILITIES"
  | "PERSONALITY"
  | "EXPERIENCE";

export type AssessmentStatus = "IN_PROGRESS" | "COMPLETED" | "ANALYZED";

export type UserRole = "USER" | "LEADER" | "ADMIN";

export type ConfidenceLevel = "low" | "moderate" | "high";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  churchId?: string | null;
  createdAt: Date;
}

export interface Church {
  id: string;
  name: string;
  description?: string | null;
  code: string;
}

export interface Assessment {
  id: string;
  userId: string;
  status: AssessmentStatus;
  currentSection: ShapeSection;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  section: ShapeSection;
  category: string;
  text: string;
  orderIndex: number;
  reverseKeyed?: boolean;
  isAttentionCheck?: boolean;
}

export interface QuestionResponse {
  id: string;
  assessmentId: string;
  questionId: string;
  value: number;
}

export interface CategoryScore {
  category: string;
  score: number;
  label: string;
  rawMean?: number;
  ipsative?: number;
  consistency?: number;
}

export interface SectionScoreBlock {
  /** Ipsative-mapped display scores (≈1–5) for charts */
  scores: Record<string, number>;
  /** Raw means after reverse-key scoring */
  rawMeans?: Record<string, number>;
  top: CategoryScore[];
}

export interface ProfileQuality {
  instrumentVersion: string;
  attentionPassed: boolean;
  attentionFailures: string[];
  acquiescenceFlag: boolean;
  overallConfidence: ConfidenceLevel;
  meanItemConsistency: number;
  itemsPerCategory: number;
  disclaimer: string;
}

export interface ShapeProfileData {
  spiritualGifts: SectionScoreBlock;
  heart: SectionScoreBlock;
  abilities: SectionScoreBlock;
  personality: {
    introvertExtrovert: number;
    taskPeople: number;
    structuredFlexible: number;
    thinkerFeeler: number;
    leaderSupporter: number;
    ambiguousDimensions?: string[];
  };
  experience: SectionScoreBlock;
  quality?: ProfileQuality;
}

export interface AiInsightData {
  summary: string;
  strengths: string[];
  ministryRecommendations: string[];
  growthSuggestions: string[];
  reflectionQuestions: string[];
}

export interface CallingProfileData {
  designSummary: string;
  callingClusters: string[];
  environmentalFit: string[];
  lifePatternInsight: string;
  reflectionQuestions: string[];
  developmentPath: string[];
}

export interface AssessmentWithRelations extends Assessment {
  responses: QuestionResponse[];
  shapeProfile?: ShapeProfileData | null;
  aiInsight?: AiInsightData | null;
  callingProfile?: CallingProfileData | null;
}

export interface SectionConfig {
  key: ShapeSection;
  title: string;
  description: string;
  icon: string;
  questionCount: number;
}

/** v2 instrument: 4 items/category + attention checks where applicable */
export const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "SPIRITUAL_GIFTS",
    title: "Karunia Rohani",
    description: "Identifikasi karunia rohani yang Tuhan berikan kepada Anda",
    icon: "Sparkles",
    questionCount: 41,
  },
  {
    key: "HEART",
    title: "Hati (Passion)",
    description: "Ungkap passion dan beban hati yang menggerakkan Anda",
    icon: "Heart",
    questionCount: 41,
  },
  {
    key: "ABILITIES",
    title: "Kemampuan",
    description: "Kenali kemampuan alami dan yang telah Anda kembangkan",
    icon: "Zap",
    questionCount: 41,
  },
  {
    key: "PERSONALITY",
    title: "Kepribadian",
    description: "Pahami preferensi dan gaya interaksi Anda",
    icon: "User",
    questionCount: 41,
  },
  {
    key: "EXPERIENCE",
    title: "Pengalaman",
    description: "Refleksikan pengalaman hidup yang membentuk Anda",
    icon: "BookOpen",
    questionCount: 20,
  },
];

export const TOTAL_QUESTION_COUNT = SECTION_CONFIGS.reduce(
  (sum, s) => sum + s.questionCount,
  0,
);

export const SECTION_ORDER: ShapeSection[] = [
  "SPIRITUAL_GIFTS",
  "HEART",
  "ABILITIES",
  "PERSONALITY",
  "EXPERIENCE",
];

export function getSectionTitle(section: ShapeSection): string {
  return SECTION_CONFIGS.find((s) => s.key === section)?.title ?? section;
}

export const LIKERT_OPTIONS = [
  { value: 1, label: "Sangat Tidak Setuju" },
  { value: 2, label: "Tidak Setuju" },
  { value: 3, label: "Netral" },
  { value: 4, label: "Setuju" },
  { value: 5, label: "Sangat Setuju" },
];

/** Frequency / formative impact scale for EXPERIENCE section */
export const FREQUENCY_OPTIONS = [
  { value: 1, label: "Tidak Pernah / Tidak Membentuk" },
  { value: 2, label: "Jarang" },
  { value: 3, label: "Kadang-kadang" },
  { value: 4, label: "Sering" },
  { value: 5, label: "Sangat Sering / Sangat Membentuk" },
];
