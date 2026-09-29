"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlacementDepartmentView } from "@/lib/ministry-placement";

export interface PlacementGroup {
  id: string;
  name: string;
  subtitle?: string;
  profileCount: number;
  placements: PlacementDepartmentView[];
}

function MinistryBoard({
  departments,
}: {
  departments: PlacementDepartmentView[];
}) {
  const [openDepartment, setOpenDepartment] = useState<string | null>(
    departments[0]?.id ?? null,
  );
  const [openRole, setOpenRole] = useState<string | null>(null);
  const filled = departments.reduce(
    (total, department) =>
      total +
      department.roles.reduce((count, role) => count + role.people.length, 0),
    0,
  );

  return (
    <div className="space-y-2">
      {filled === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada profil yang cukup kuat untuk diusulkan ke sebuah peran.
        </p>
      )}
      {departments.map((department) => {
        const peopleCount = department.roles.reduce(
          (count, role) => count + role.people.length,
          0,
        );
        const isOpen = openDepartment === department.id;
        return (
          <div key={department.id} className="rounded-xl border border-border">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpenDepartment((current) =>
                  current === department.id ? null : department.id,
                )
              }
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left cursor-pointer"
            >
              <span className="font-medium">{department.name}</span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {peopleCount} usulan
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </span>
            </button>
            {isOpen && (
              <div className="space-y-1 border-t border-border px-2 py-2">
                {department.roles.map((role) => {
                  const roleOpen = openRole === role.id;
                  return (
                    <div key={role.id}>
                      <button
                        type="button"
                        aria-expanded={roleOpen}
                        onClick={() =>
                          setOpenRole((current) =>
                            current === role.id ? null : role.id,
                          )
                        }
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted/40 cursor-pointer"
                      >
                        <span>{role.name}</span>
                        <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                          {role.people.length} orang
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              roleOpen && "rotate-180",
                            )}
                          />
                        </span>
                      </button>
                      {roleOpen && (
                        <div className="mb-2 ml-2 mr-1 rounded-lg border border-border bg-muted/20 p-2">
                          {role.note && (
                            <p className="px-2 pb-2 text-xs text-muted-foreground">
                              {role.note}
                            </p>
                          )}
                          {role.people.length === 0 ? (
                            <p className="px-2 py-1 text-sm text-muted-foreground">
                              Belum ada kandidat pada kelompok ini.
                            </p>
                          ) : (
                            <ul>
                              {role.people.map((person) => (
                                <li key={person.id}>
                                  <Link
                                    href={`/admin/users/${person.id}`}
                                    className="block rounded-md px-2 py-1.5 hover:bg-muted/60"
                                  >
                                    <span className="text-sm font-medium">
                                      {person.name}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                      Kecocokan {person.score} · {person.reason}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PlacementView({
  churchGroups,
  batchGroups,
}: {
  churchGroups: PlacementGroup[];
  batchGroups: PlacementGroup[];
}) {
  const [mode, setMode] = useState<"church" | "batch">("church");
  const [selected, setSelected] = useState("all");
  const groups = mode === "church" ? churchGroups : batchGroups;

  const visible = useMemo(() => {
    if (selected === "all") {
      return groups.filter((group) => group.profileCount > 0);
    }
    return groups.filter((group) => group.id === selected);
  }, [groups, selected]);

  const changeMode = (next: "church" | "batch") => {
    setMode(next);
    setSelected("all");
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
              ? "Usulan dipisah per gereja."
              : "Batch mengikuti bulan profil SHAPE dibuat."}
          </p>
        </div>
        <div className="lg:ml-auto">
          <label
            htmlFor="placement-group"
            className="block text-sm font-medium text-foreground mb-2"
          >
            {mode === "church" ? "Pilih gereja" : "Pilih batch"}
          </label>
          <select
            id="placement-group"
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

      <div className="space-y-10">
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
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Daftar pelayanan</CardTitle>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Setiap orang paling banyak masuk 3 peran. Klik peran untuk
                  melihat nama.
                </p>
              </CardHeader>
              <CardContent>
                <MinistryBoard departments={group.placements} />
              </CardContent>
            </Card>
          </section>
        ))}
      </div>
    </>
  );
}
