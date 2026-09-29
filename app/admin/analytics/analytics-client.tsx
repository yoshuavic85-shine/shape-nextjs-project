"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, PieChart, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PersonRef {
  id: string;
  name: string;
}

export interface RankedCategory {
  key: string;
  label: string;
  count: number;
  people: PersonRef[];
}

export interface AnalyticsGroup {
  id: string;
  name: string;
  subtitle?: string;
  profileCount: number;
  memberCount: number;
  memberLabel: string;
  giftKeys: string[];
  gifts: RankedCategory[];
  heart: RankedCategory[];
  abilities: RankedCategory[];
}

export interface ChurchComparisonRow {
  id: string;
  name: string;
  members: number;
  assessments: number;
}

type GroupMode = "church" | "batch";
type Accent = "primary" | "rose" | "green";

const ACCENT: Record<
  Accent,
  { badge: string; bar: string }
> = {
  primary: {
    badge: "bg-primary/20 text-primary",
    bar: "bg-primary",
  },
  rose: {
    badge: "bg-rose-500/20 text-rose-500",
    bar: "bg-rose-500",
  },
  green: {
    badge: "bg-green-500/20 text-green-500",
    bar: "bg-green-500",
  },
};

function RankList({
  items,
  accent,
  columns,
}: {
  items: RankedCategory[];
  accent: Accent;
  columns?: boolean;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const max = items[0]?.count || 1;
  const colors = ACCENT[accent];

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">Belum ada data</p>
    );
  }

  return (
    <div className={cn("space-y-2", columns && "md:columns-2 md:gap-4")}>
      {items.map((item, index) => {
        const isOpen = open[item.key] ?? false;
        return (
          <div key={item.key} className={cn(columns && "break-inside-avoid mb-2")}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((current) => ({
                  ...current,
                  [item.key]: !current[item.key],
                }))
              }
              className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shrink-0",
                    colors.badge,
                  )}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2 text-sm">
                    <span className="font-medium truncate">{item.label}</span>
                    <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                      {item.count} orang
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div
                      className={cn("h-full rounded-full", colors.bar)}
                      style={{ width: `${(item.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
            {isOpen && (
              <ul className="mt-1 ml-9 mr-2 mb-2 rounded-lg border border-border bg-muted/20 max-h-48 overflow-y-auto">
                {item.people.map((person) => (
                  <li key={person.id}>
                    <Link
                      href={`/admin/users/${person.id}`}
                      className="block px-3 py-1.5 text-sm hover:bg-muted/60"
                    >
                      {person.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardCard({
  title,
  items,
  accent,
  columns,
}: {
  title: string;
  items: RankedCategory[];
  accent: Accent;
  columns?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground font-normal mt-1">
          Jumlah orang dengan kategori ini di top-3 mereka. Klik baris untuk
          melihat nama.
        </p>
      </CardHeader>
      <CardContent>
        <RankList items={items} accent={accent} columns={columns} />
      </CardContent>
    </Card>
  );
}

export function SystemAnalytics({
  churchGroups,
  batchGroups,
  comparison,
  registeredChurchCount,
}: {
  churchGroups: AnalyticsGroup[];
  batchGroups: AnalyticsGroup[];
  comparison: ChurchComparisonRow[];
  registeredChurchCount: number;
}) {
  const [mode, setMode] = useState<GroupMode>("church");
  const [selected, setSelected] = useState("all");

  const groups = mode === "church" ? churchGroups : batchGroups;

  const visible = useMemo(() => {
    if (selected === "all") {
      return groups.filter((group) => group.profileCount > 0);
    }
    return groups.filter((group) => group.id === selected);
  }, [groups, selected]);

  const profileTotal = visible.reduce(
    (total, group) => total + group.profileCount,
    0,
  );
  const uniqueGifts = new Set(visible.flatMap((group) => group.giftKeys)).size;

  let thirdLabel = "Gereja Aktif";
  let thirdValue = registeredChurchCount;
  if (mode === "church" && selected !== "all") {
    thirdLabel = "Anggota";
    thirdValue = visible[0]?.memberCount ?? 0;
  } else if (mode === "batch" && selected === "all") {
    thirdLabel = "Jumlah Batch";
    thirdValue = batchGroups.filter((group) => group.profileCount > 0).length;
  } else if (mode === "batch") {
    thirdLabel = "Orang di Batch";
    thirdValue = visible[0]?.memberCount ?? 0;
  }

  const changeMode = (next: GroupMode) => {
    setMode(next);
    setSelected("all");
  };

  const focusChurch = (churchId: string) => {
    setMode("church");
    setSelected(churchId);
    document.getElementById("analytics-groups")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Kelompokkan menurut
          </p>
          <div className="inline-flex rounded-xl bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => changeMode("church")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer",
                mode === "church"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Gereja
            </button>
            <button
              type="button"
              onClick={() => changeMode("batch")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer",
                mode === "batch"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Batch
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {mode === "church"
              ? "Rekap dipisah per gereja."
              : "Batch mengikuti bulan profil SHAPE dibuat."}
          </p>
        </div>
        <div className="lg:ml-auto">
          <label
            htmlFor="analytics-group"
            className="block text-sm font-medium text-foreground mb-2"
          >
            {mode === "church" ? "Pilih gereja" : "Pilih batch"}
          </label>
          <select
            id="analytics-group"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm min-w-64"
          >
            <option value="all">
              {mode === "church" ? "Semua gereja" : "Semua batch"}
            </option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
                {group.profileCount > 0 ? ` (${group.profileCount})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Profil SHAPE
            </CardTitle>
            <PieChart className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profileTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Kategori Karunia (unik)
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{uniqueGifts}</p>
            <p className="text-xs text-muted-foreground mt-1">
              dari top-3 profil
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{thirdLabel}</CardTitle>
            <Users className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{thirdValue}</p>
          </CardContent>
        </Card>
      </div>

      <div id="analytics-groups" className="space-y-10 mb-10">
        {visible.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground text-center py-6">
                Belum ada profil SHAPE pada kelompok ini.
              </p>
            </CardContent>
          </Card>
        )}
        {visible.map((group) => (
          <section key={group.id}>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {group.profileCount} profil SHAPE
                {group.subtitle ? ` · ${group.subtitle}` : ""}
                {` · ${group.memberCount} ${group.memberLabel}`}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <LeaderboardCard
                title="Top 10 Karunia Rohani"
                items={group.gifts}
                accent="primary"
              />
              <LeaderboardCard
                title="Top 10 Passion / Heart"
                items={group.heart}
                accent="rose"
              />
            </div>
            <LeaderboardCard
              title="Top 10 Kemampuan"
              items={group.abilities}
              accent="green"
              columns
            />
          </section>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Gereja</CardTitle>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            Klik baris untuk membuka rekap gereja itu.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Gereja
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Anggota
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Assessment Selesai
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Rasio
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((church) => {
                  const ratio =
                    church.members > 0
                      ? church.assessments / church.members
                      : 0;
                  const active =
                    mode === "church" && selected === church.id;
                  return (
                    <tr
                      key={church.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Lihat rekap ${church.name}`}
                      onClick={() => focusChurch(church.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          focusChurch(church.id);
                        }
                      }}
                      className={cn(
                        "border-b border-border/50 cursor-pointer hover:bg-muted/30",
                        active && "bg-primary/10",
                      )}
                    >
                      <td className="py-3 px-2 font-medium">{church.name}</td>
                      <td className="py-3 px-2">{church.members}</td>
                      <td className="py-3 px-2">{church.assessments}</td>
                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            church.members > 0 && ratio >= 0.5
                              ? "bg-green-500/20 text-green-500"
                              : "bg-amber-500/20 text-amber-500",
                          )}
                        >
                          {church.members > 0
                            ? `${Math.round(ratio * 100)}%`
                            : "0%"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {comparison.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Belum ada gereja
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
