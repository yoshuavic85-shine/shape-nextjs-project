import type { ShapeProfileData, SectionScoreBlock } from "@/types";
import {
  OPEN_ENDED_PROMPTS,
  type OpenEndedPrompt,
} from "@/lib/constants/open-ended";
import type { StoryAnswer } from "@/lib/ai/story-context";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function compactSection(block: SectionScoreBlock, n = 4) {
  return {
    top: (block.top ?? []).slice(0, n).map((t) => ({
      k: t.category,
      label: t.label,
      score: round2(t.score),
    })),
    ...(block.undifferentiated ? { flat: true } : {}),
  };
}

/** Only ranking + quality flags — not the full scores map. */
export function compactProfile(profile: ShapeProfileData) {
  const q = profile.quality;
  return {
    confidence: q?.overallConfidence ?? "moderate",
    attentionOk: q?.attentionPassed ?? true,
    undifferentiated: q?.undifferentiatedSections ?? [],
    gifts: compactSection(profile.spiritualGifts),
    heart: compactSection(profile.heart),
    abilities: compactSection(profile.abilities),
    personality: {
      IE: round2(profile.personality.introvertExtrovert),
      taskPeople: round2(profile.personality.taskPeople),
      structure: round2(profile.personality.structuredFlexible),
      thinkFeel: round2(profile.personality.thinkerFeeler),
      leadSupport: round2(profile.personality.leaderSupporter),
      ambiguous: profile.personality.ambiguousDimensions ?? [],
    },
    experience: compactSection(profile.experience, 3),
  };
}

const STORY_MAX = 280;

export function compactStories(answers: StoryAnswer[]): string {
  const filled = answers.filter((a) => a.text.trim().length > 0);
  if (filled.length === 0) return "(tidak ada cerita)";
  const byKey = new Map(OPEN_ENDED_PROMPTS.map((p) => [p.key, p]));
  return filled
    .map((a) => {
      const prompt: OpenEndedPrompt | undefined = byKey.get(a.promptKey);
      const title = prompt?.title ?? a.promptKey;
      const text = a.text.trim().slice(0, STORY_MAX);
      return `${title}: ${text}`;
    })
    .join("\n");
}
