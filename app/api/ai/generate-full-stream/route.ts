import { after, NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { loadAuthorizedAssessment } from "@/lib/access";
import { enqueueAiJob, processAiJob } from "@/lib/ai/jobs";

export const maxDuration = 300;

/**
 * POST /api/ai/generate-full-stream
 * Kept for older clients. No longer streams — enqueues a job and returns JSON.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { assessmentId?: string; force?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "assessmentId wajib diisi" },
      { status: 400 },
    );
  }

  const { assessmentId, force } = body;
  if (!assessmentId) {
    return NextResponse.json(
      { error: "assessmentId wajib diisi" },
      { status: 400 },
    );
  }

  const access = await loadAuthorizedAssessment(assessmentId, user);
  if (!access) {
    return NextResponse.json(
      { error: "Assessment tidak ditemukan" },
      { status: 404 },
    );
  }

  try {
    const { job, alreadyDone } = await enqueueAiJob(assessmentId, { force });
    if (!alreadyDone && (job.status === "PENDING" || job.status === "PROCESSING")) {
      after(() => processAiJob(job.id));
    }
    return NextResponse.json({
      jobId: job.id,
      status: alreadyDone ? "COMPLETED" : job.status,
      alreadyDone,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal membuat job AI.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
