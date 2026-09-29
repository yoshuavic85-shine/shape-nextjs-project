import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export type AuthUser = {
  id: string;
  role: Role;
  churchId: string | null;
};

type AssessmentOwner = {
  userId: string;
  user: { churchId: string | null };
};

export function canViewAssessment(
  user: AuthUser,
  assessment: AssessmentOwner,
): boolean {
  if (user.role === "ADMIN") return true;
  if (assessment.userId === user.id) return true;
  return (
    user.role === "LEADER" &&
    !!user.churchId &&
    assessment.user.churchId === user.churchId
  );
}

export function canMentorAssessment(
  user: AuthUser,
  assessment: AssessmentOwner,
): boolean {
  if (user.role === "ADMIN") return true;
  return (
    user.role === "LEADER" &&
    !!user.churchId &&
    assessment.user.churchId === user.churchId
  );
}

export function canViewMemberProfile(
  user: AuthUser,
  member: { id: string; churchId: string | null },
): boolean {
  if (user.role === "ADMIN") return true;
  if (member.id === user.id) return true;
  return (
    user.role === "LEADER" &&
    !!user.churchId &&
    member.churchId === user.churchId
  );
}

/** Load assessment with owner church; returns null if missing or unauthorized. */
export async function loadAuthorizedAssessment(assessmentId: string, user: AuthUser) {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      user: {
        select: { id: true, name: true, email: true, churchId: true },
      },
    },
  });
  if (!assessment) return null;
  if (!canViewAssessment(user, assessment)) return null;
  return {
    assessment,
    isOwner: assessment.userId === user.id,
    canMentor: canMentorAssessment(user, assessment),
  };
}
