import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AssessmentStartClient } from "./start-client";

export default async function AssessmentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  // Check for existing in-progress assessment
  const existing = await db.assessment.findFirst({
    where: { userId: user.id, status: "IN_PROGRESS" },
  });

  if (existing) {
    redirect(`/dashboard/assessment/${existing.id}`);
  }

  return <AssessmentStartClient />;
}
