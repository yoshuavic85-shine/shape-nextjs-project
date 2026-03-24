import { z } from "zod";

/**
 * Preprocess helper: coerce AI array items that may come as objects
 * (e.g. [{area: "...", reason: "..."}]) into plain strings.
 */
function coerceStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      // Common patterns the AI may use for object items
      const main =
        (obj.area ?? obj.title ?? obj.name ?? obj.text ?? obj.label ?? "") as string;
      const detail =
        (obj.alasan ?? obj.reason ?? obj.description ?? obj.detail ?? "") as string;
      return detail ? `${main}: ${detail}` : main || JSON.stringify(item);
    }
    return String(item);
  });
}

const stringArrayPreprocess = z.preprocess(coerceStringArray, z.array(z.string()).default([]));

export const AiInsightSchema = z.object({
  summary: z.string().default("Ringkasan profil tidak tersedia."),
  strengths: stringArrayPreprocess,
  ministryRecommendations: stringArrayPreprocess,
  growthSuggestions: stringArrayPreprocess,
  reflectionQuestions: stringArrayPreprocess,
});

export type AiInsightDTO = z.infer<typeof AiInsightSchema>;

export const CallingProfileSchema = z.object({
  designSummary: z.string().default("Ringkasan desain tidak tersedia."),
  callingClusters: stringArrayPreprocess,
  environmentalFit: stringArrayPreprocess,
  lifePatternInsight: z.string().default(""),
  reflectionQuestions: stringArrayPreprocess,
  developmentPath: stringArrayPreprocess,
});

export type CallingProfileDTO = z.infer<typeof CallingProfileSchema>;

export const SectionInsightSchema = z.object({
  summary: z.string().default("Insight tidak tersedia."),
  strengths: stringArrayPreprocess,
});

export type SectionInsightDTO = z.infer<typeof SectionInsightSchema>;
