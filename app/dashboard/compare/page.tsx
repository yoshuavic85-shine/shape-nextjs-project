import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canViewAssessment } from "@/lib/access";
import { toShapeProfileData } from "@/lib/profile-mapper";
import { ProfileCompare } from "@/components/profile/ProfileCompare";
import { formatDate } from "@/lib/utils";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { a, b } = await searchParams;
  if (!a || !b || a === b) redirect("/dashboard");

  const [left, right] = await Promise.all([
    db.assessment.findUnique({
      where: { id: a },
      include: {
        shapeProfile: true,
        user: { select: { id: true, name: true, churchId: true } },
      },
    }),
    db.assessment.findUnique({
      where: { id: b },
      include: {
        shapeProfile: true,
        user: { select: { id: true, name: true, churchId: true } },
      },
    }),
  ]);

  if (
    !left ||
    !right ||
    !canViewAssessment(user, left) ||
    !canViewAssessment(user, right)
  ) {
    redirect("/dashboard");
  }
  if (left.userId !== right.userId) redirect("/dashboard");
  if (!left.shapeProfile || !right.shapeProfile) redirect("/dashboard");

  const older = left.createdAt <= right.createdAt ? left : right;
  const newer = older.id === left.id ? right : left;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-1">
        Perbandingan SHAPE
      </h1>
      <p className="text-muted-foreground mb-8">
        {left.user.name} — {formatDate(older.createdAt)} vs{" "}
        {formatDate(newer.createdAt)}
      </p>
      <ProfileCompare
        leftLabel={`Lebih lama (${formatDate(older.createdAt)})`}
        rightLabel={`Lebih baru (${formatDate(newer.createdAt)})`}
        left={toShapeProfileData(older.shapeProfile!)}
        right={toShapeProfileData(newer.shapeProfile!)}
      />
    </div>
  );
}
