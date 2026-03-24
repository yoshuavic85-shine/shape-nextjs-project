/**
 * Test script: fetch assessment for a user (by email), call Mistral for
 * analysis + calling, then log timing and success/failure.
 *
 * Usage:
 *   npm run test:ollama
 *
 * Env:
 *   TEST_USER_EMAIL - (optional) default: yoshuavic8@gmail.com
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env if present
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}

const USER_EMAIL = process.env.TEST_USER_EMAIL ?? "yoshuavic8@gmail.com";

async function main() {
  const { db } = await import("../lib/db");
  const { buildAnalysisPrompt } = await import("../lib/ai/analysis-prompt");
  const { buildCallingPrompt } = await import("../lib/ai/calling-prompt");
  const { generateWithRetry } = await import("../lib/ai/ollama");
  const { AiInsightSchema, CallingProfileSchema } = await import("../lib/ai/schemas");

  console.log("Using Mistral API");
  console.log("User email:", USER_EMAIL);
  console.log("---");

  const user = await db.user.findUnique({
    where: { email: USER_EMAIL },
  });
  if (!user) {
    console.error("User not found:", USER_EMAIL);
    process.exit(1);
  }
  console.log("User id:", user.id);

  const assessment = await db.assessment.findFirst({
    where: { userId: user.id, status: { in: ["COMPLETED", "ANALYZED"] } },
    include: { shapeProfile: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!assessment) {
    console.error("No completed assessment found for user.");
    process.exit(1);
  }
  if (!assessment.shapeProfile) {
    console.error("Assessment has no shapeProfile.");
    process.exit(1);
  }
  console.log("Assessment id:", assessment.id);
  console.log("---");

  type ShapeProfileData = import("../types").ShapeProfileData;
  const profileData = assessment.shapeProfile as unknown as ShapeProfileData;

  // 1) Analysis
  console.log("[1/2] Calling Mistral for analysis (with retry)...");
  const t0 = Date.now();
  let analysisOk = false;
  let analysisDurationMs = 0;
  try {
    const result = await generateWithRetry(
      buildAnalysisPrompt(profileData),
      AiInsightSchema,
      { maxTokens: 2000 },
    );
    analysisDurationMs = Date.now() - t0;
    analysisOk = Boolean(result.data.summary);
    console.log("[1/2] Analysis OK:", analysisOk, "| Duration:", (analysisDurationMs / 1000).toFixed(2), "s");
    console.log("  Summary:", result.data.summary.slice(0, 100) + "...");
    console.log("  Strengths:", result.data.strengths.length, "items");
    console.log("  Ministry Recs:", result.data.ministryRecommendations.length, "items");
  } catch (e) {
    analysisDurationMs = Date.now() - t0;
    console.error("[1/2] Analysis FAILED after", (analysisDurationMs / 1000).toFixed(2), "s:", e);
  }

  // 2) Calling
  console.log("[2/2] Calling Mistral for calling (with retry)...");
  const t1 = Date.now();
  let callingOk = false;
  let callingDurationMs = 0;
  try {
    const result = await generateWithRetry(
      buildCallingPrompt(profileData),
      CallingProfileSchema,
      { maxTokens: 2000 },
    );
    callingDurationMs = Date.now() - t1;
    callingOk = Boolean(result.data.designSummary);
    console.log("[2/2] Calling OK:", callingOk, "| Duration:", (callingDurationMs / 1000).toFixed(2), "s");
    console.log("  Design Summary:", result.data.designSummary.slice(0, 100) + "...");
    console.log("  Calling Clusters:", result.data.callingClusters.length, "items");
  } catch (e) {
    callingDurationMs = Date.now() - t1;
    console.error("[2/2] Calling FAILED after", (callingDurationMs / 1000).toFixed(2), "s:", e);
  }

  const totalMs = analysisDurationMs + callingDurationMs;
  console.log("---");
  console.log("Total time:", (totalMs / 1000).toFixed(2), "s");
  console.log("Success:", analysisOk && callingOk ? "YES" : "NO");
  process.exit(analysisOk && callingOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
