import { processAiJob, enqueueAiJob } from "@/lib/ai/jobs";

/**
 * Full AI analysis + calling (non-streaming). Used by jobs / cron / ops.
 */
export async function runFullAnalysis(assessmentId: string): Promise<void> {
  try {
    const { job, alreadyDone } = await enqueueAiJob(assessmentId);
    if (alreadyDone) return;
    await processAiJob(job.id);
  } catch (err) {
    console.error("[runFullAnalysis]", assessmentId, err);
  }
}
