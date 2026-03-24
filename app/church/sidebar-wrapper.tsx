"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

interface ChurchSidebarWrapperProps {
  role: string;
}

export function ChurchSidebarWrapper({ role }: ChurchSidebarWrapperProps) {
  const pathname = usePathname();
  return <Sidebar role={role} currentPath={pathname} />;
}
