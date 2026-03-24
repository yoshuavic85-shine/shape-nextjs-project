export type ShapeSection =
  | "SPIRITUAL_GIFTS"
  | "HEART"
  | "ABILITIES"
  | "PERSONALITY"
  | "EXPERIENCE";

export type AssessmentStatus = "IN_PROGRESS" | "COMPLETED" | "ANALYZED";

export type UserRole = "USER" | "LEADER" | "ADMIN";

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
}

export interface ShapeProfileData {
  spiritualGifts: {
    scores: Record<string, number>;
    top: CategoryScore[];
  };
  heart: {
    scores: Record<string, number>;
    top: CategoryScore[];
  };
  abilities: {
    scores: Record<string, number>;
    top: CategoryScore[];
  };
  personality: {
    introvertExtrovert: number;
    taskPeople: number;
    structuredFlexible: number;
    thinkerFeeler: number;
    leaderSupporter: number;
  };
  experience: {
    scores: Record<string, number>;
    top: CategoryScore[];
  };
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

export const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "SPIRITUAL_GIFTS",
    title: "Karunia Rohani",
    description: "Identifikasi karunia rohani yang Tuhan berikan kepada Anda",
    icon: "Sparkles",
    questionCount: 20,
  },
  {
    key: "HEART",
    title: "Hati (Passion)",
    description: "Ungkap passion dan beban hati yang menggerakkan Anda",
    icon: "Heart",
    questionCount: 20,
  },
  {
    key: "ABILITIES",
    title: "Kemampuan",
    description: "Kenali kemampuan alami dan yang telah Anda kembangkan",
    icon: "Zap",
    questionCount: 20,
  },
  {
    key: "PERSONALITY",
    title: "Kepribadian",
    description: "Pahami preferensi dan gaya interaksi Anda",
    icon: "User",
    questionCount: 20,
  },
  {
    key: "EXPERIENCE",
    title: "Pengalaman",
    description: "Refleksikan pengalaman hidup yang membentuk Anda",
    icon: "BookOpen",
    questionCount: 10,
  },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: "Sangat Tidak Setuju" },
  { value: 2, label: "Tidak Setuju" },
  { value: 3, label: "Netral" },
  { value: 4, label: "Setuju" },
  { value: 5, label: "Sangat Setuju" },
];
