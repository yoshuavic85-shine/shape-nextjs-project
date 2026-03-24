"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";

interface SidebarWrapperProps {
  user: {
    role: string;
  };
}

export function SidebarWrapper({ user }: SidebarWrapperProps) {
  const pathname = usePathname();
  return <Sidebar role={user.role} currentPath={pathname} />;
}
