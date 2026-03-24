"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Church,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Activity,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  currentPath: string;
  userName: string;
}

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manajemen User", icon: Users },
  { href: "/admin/churches", label: "Manajemen Gereja", icon: Church },
  { href: "/admin/analytics", label: "Analitik Sistem", icon: BarChart3 },
  { href: "/admin/activity", label: "Log Aktivitas", icon: Activity },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 shadow-[4px_0_12px_var(--shadow-dark)] transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo: shapeLogo.png, ukuran 70% dari dasar */}
      <div className="p-4 flex items-center justify-center border-b border-slate-700/50">
        <Image
          src="/shapeLogo.png"
          alt="SHAPE Compass"
          width={collapsed ? 20 : 70}
          height={collapsed ? 20 : 18}
          className="shrink-0 object-contain"
          priority
        />
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <p className="text-sm text-slate-300 font-medium truncate">{userName}</p>
          <p className="text-xs text-amber-500">Administrator</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || 
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-amber-500 text-slate-900 shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        {/* Back to User Dashboard */}
        <div className="pt-4 border-t border-slate-700/50 mt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Dashboard User</span>}
          </Link>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-700/50 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 w-full transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
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

