import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ShapeProfileData } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";

export default async function ChurchMembersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "LEADER" || !user.churchId) {
    redirect("/dashboard");
  }

  const members = await db.user.findMany({
    where: { churchId: user.churchId },
    include: {
      assessments: {
        where: { status: { in: ["COMPLETED", "ANALYZED"] } },
        include: { shapeProfile: true },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Anggota Gereja</h1>
        <p className="text-muted-foreground mt-1">
          {members.length} anggota terdaftar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const latestAssessment = member.assessments[0];
          const profile = latestAssessment?.shapeProfile;
          const shapeData = profile
            ? {
                spiritualGifts:
                  profile.spiritualGifts as unknown as ShapeProfileData["spiritualGifts"],
                heart: profile.heart as unknown as ShapeProfileData["heart"],
                abilities:
                  profile.abilities as unknown as ShapeProfileData["abilities"],
              }
            : null;

          return (
            <Card key={member.id}>
              <CardContent className="py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full neo-raised flex items-center justify-center text-sm font-bold text-primary">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>

                {shapeData ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Top Karunia
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {shapeData.spiritualGifts.top.slice(0, 3).map((g) => (
                          <span
                            key={g.category}
                            className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                          >
                            {g.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Top Passion
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {shapeData.heart.top.slice(0, 3).map((h) => (
                          <span
                            key={h.category}
                            className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                          >
                            {h.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Selesai {formatDate(latestAssessment.updatedAt)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum menyelesaikan assessment
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {members.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Belum ada anggota yang bergabung.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
