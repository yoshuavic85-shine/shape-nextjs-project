import { NextRequest, NextResponse } from "next/server";
import { processDueAiJobs } from "@/lib/ai/jobs";

export const maxDuration = 300;

/**
 * GET /api/cron/ai-jobs
 * Sweeps PENDING / stale PROCESSING jobs. Hobby cron is daily; also usable as a manual kick.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const urlSecret = request.nextUrl.searchParams.get("secret");
  const ok =
    !!secret &&
    (auth === `Bearer ${secret}` || urlSecret === secret);

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processDueAiJobs(3);
  return NextResponse.json({ ok: true, processed });
}
