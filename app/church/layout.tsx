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

  // Admin manages churches in the admin panel (create + kode/token)
  if (user.role === "ADMIN") {
    redirect("/admin/churches");
  }

  const church = user.churchId
    ? await db.church.findUnique({ where: { id: user.churchId } })
    : null;

  // No church yet — allow setup flow (USER or LEADER) without church sidebar
  if (!church) {
    if (user.role !== "LEADER" && user.role !== "USER") {
      redirect("/dashboard");
    }
    return (
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    );
  }

  if (user.role !== "LEADER") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ChurchSidebarWrapper role={user.role} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
