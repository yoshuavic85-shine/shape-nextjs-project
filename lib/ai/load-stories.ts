import { db } from "@/lib/db";
import type { StoryAnswer } from "@/lib/ai/story-context";

export async function loadStories(assessmentId: string): Promise<StoryAnswer[]> {
  const rows = await db.openEndedResponse.findMany({
    where: { assessmentId },
    select: { promptKey: true, text: true },
  });
  return rows.map((r) => ({ promptKey: r.promptKey, text: r.text }));
}
