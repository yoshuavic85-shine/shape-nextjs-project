import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChurchSidebarWrapper } from "./sidebar-wrapper";

export default async function ChurchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Check if user is a church leader
  if (user.role !== "LEADER") {
    redirect("/dashboard");
  }

  // Check if user has a church
  const church = user.churchId
    ? await db.church.findUnique({ where: { id: user.churchId } })
    : null;

  if (!church) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ChurchSidebarWrapper role={user.role} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
