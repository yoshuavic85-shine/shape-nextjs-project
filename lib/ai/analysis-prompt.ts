import { ShapeProfileData } from "@/types";
import type { StoryAnswer } from "./story-context";
import { compactProfile, compactStories } from "./compact-profile";

const SHARED_RULES = `Konselor rohani Kristen. JSON murni, Bahasa Indonesia, singkat.
Bukan nubuat/diagnosis. Hedged ("tampaknya"). Ranking relatif, bukan banding orang lain.
Jangan mengarang cerita. Jika cerita kosong, sebutkan itu.`;

export function buildAnalysisPrompt(
  profile: ShapeProfileData,
  stories: StoryAnswer[] = [],
): string {
  return `${SHARED_RULES}
Tujuan: 1 ringkasan SHAPE untuk mentoring.

DATA:
${JSON.stringify(compactProfile(profile))}
CERITA:
${compactStories(stories)}

OUTPUT JSON:
{"summary":"≤60 kata","strengths":["3 item"],"ministryRecommendations":["3 item peran hidup/gereja"],"growthSuggestions":["3 item"],"reflectionQuestions":["3 item"]}`;
}

export function buildCallingPrompt(
  profile: ShapeProfileData,
  stories: StoryAnswer[] = [],
): string {
  return `${SHARED_RULES}
Tujuan: arah hidup (gereja+kerja+keluarga), eksperimen konkret.

DATA:
${JSON.stringify(compactProfile(profile))}
CERITA:
${compactStories(stories)}

OUTPUT JSON:
{"designSummary":"≤60 kata","callingClusters":["3 arah"],"environmentalFit":["3 lingkungan"],"lifePatternInsight":"≤60 kata dari cerita+skor","reflectionQuestions":["3 item"],"developmentPath":["3 eksperimen 4-12 minggu"]}`;
}

export function buildFullReportPrompt(
  profile: ShapeProfileData,
  stories: StoryAnswer[] = [],
): string {
  return `${SHARED_RULES}
Tujuan: satu laporan SHAPE (insight + arah panggilan).

DATA:
${JSON.stringify(compactProfile(profile))}
CERITA:
${compactStories(stories)}

OUTPUT JSON:
{"insight":{"summary":"≤60 kata","strengths":["3"],"ministryRecommendations":["3"],"growthSuggestions":["3"],"reflectionQuestions":["3"]},"calling":{"designSummary":"≤60 kata","callingClusters":["3"],"environmentalFit":["3"],"lifePatternInsight":"≤60 kata","reflectionQuestions":["3"],"developmentPath":["3 eksperimen 4-12 minggu"]}}`;
}
