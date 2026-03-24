import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AssessmentStepper } from "@/components/assessment/AssessmentStepper";
import { ShapeSection } from "@/types";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const assessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
    include: {
      responses: true,
    },
  });

  if (!assessment) redirect("/dashboard");

  if (assessment.status !== "IN_PROGRESS") {
    redirect(`/dashboard/report/${id}`);
  }

  const questions = await db.question.findMany({
    orderBy: [{ section: "asc" }, { orderIndex: "asc" }],
  });

  // Build existing responses map
  const existingResponses: Record<string, number> = {};
  for (const r of assessment.responses) {
    existingResponses[r.questionId] = r.value;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AssessmentStepper
        assessmentId={id}
        questions={questions.map((q) => ({
          id: q.id,
          section: q.section as ShapeSection,
          category: q.category,
          text: q.text,
          orderIndex: q.orderIndex,
        }))}
        currentSection={assessment.currentSection as ShapeSection}
        existingResponses={existingResponses}
      />
    </div>
  );
}
