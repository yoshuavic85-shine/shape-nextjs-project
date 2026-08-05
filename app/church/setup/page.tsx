import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ChurchSetupClient } from "./setup-client";

export default async function ChurchSetupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin/churches");
  if (user.role !== "LEADER" && user.role !== "USER") {
    redirect("/dashboard");
  }
  if (user.churchId) redirect("/church/dashboard");

  return <ChurchSetupClient />;
}
