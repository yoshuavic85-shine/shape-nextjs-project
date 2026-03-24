"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  role: string;
  currentPath: string;
}

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/assessment", label: "Assessment", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
];

const churchLinks = [
  {
    href: "/church/dashboard",
    label: "Dashboard Gereja",
    icon: LayoutDashboard,
  },
  { href: "/church/members", label: "Anggota", icon: Users },
  { href: "/church/analytics", label: "Analitik", icon: BarChart3 },
];

export function Sidebar({ role, currentPath }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isLeader = role === "LEADER" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface shadow-[4px_0_12px_var(--shadow-dark)] transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo: horizontal (expanded) / vertical (collapsed), rata tengah */}
      <div className="p-4 flex items-center justify-center border-b border-border/30">
        <Image
          src={collapsed ? "/shapeLogo1.png" : "/shapeLogo2.png"}
          alt="SHAPE Compass"
          width={collapsed ? 28 : 100}
          height={collapsed ? 28 : 26}
          className="shrink-0 object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p
          className={cn(
            "text-xs text-muted-foreground px-3 py-2 uppercase tracking-wider",
            collapsed && "text-center",
          )}
        >
          {collapsed ? "•" : "Pribadi"}
        </p>
        {userLinks.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        {isLeader && (
          <>
            <p
              className={cn(
                "text-xs text-muted-foreground px-3 py-2 mt-4 uppercase tracking-wider",
                collapsed && "text-center",
              )}
            >
              {collapsed ? "•" : "Gereja"}
            </p>
            {churchLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </>
        )}

        {isAdmin && (
          <>
            <p
              className={cn(
                "text-xs text-muted-foreground px-3 py-2 mt-4 uppercase tracking-wider",
                collapsed && "text-center",
              )}
            >
              {collapsed ? "★" : "Admin"}
            </p>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                currentPath.startsWith("/admin")
                  ? "bg-amber-500 text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
                  : "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10",
              )}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border/30 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive w-full transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
