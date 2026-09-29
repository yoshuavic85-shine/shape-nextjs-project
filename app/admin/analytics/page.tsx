import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/scoring";
import {
  SystemAnalytics,
  type AnalyticsGroup,
  type ChurchComparisonRow,
  type PersonRef,
  type RankedCategory,
} from "./analytics-client";

interface ShapeDataWithScores {
  top?: Array<{ category: string; score: number; label?: string }>;
}

const NONE_CHURCH = "__none__";
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type Bucket = Map<string, Map<string, PersonRef>>;

interface GroupBuilder {
  id: string;
  name: string;
  subtitle?: string;
  memberCount: number | null;
  memberLabel: string;
  profileIds: Set<string>;
  userIds: Set<string>;
  gifts: Bucket;
  heart: Bucket;
  abilities: Bucket;
}

function getCategoryLabel(categoryKey: string): string {
  return CATEGORY_LABELS[categoryKey] ?? categoryKey;
}

function readTop(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const top = (value as ShapeDataWithScores).top;
  if (!Array.isArray(top)) return [];
  const categories = top
    .map((item) => item?.category)
    .filter((category): category is string => typeof category === "string" && category.length > 0);
  return [...new Set(categories)];
}

function createBuilder(
  id: string,
  name: string,
  memberLabel: string,
  subtitle?: string,
  memberCount: number | null = null,
): GroupBuilder {
  return {
    id,
    name,
    subtitle,
    memberCount,
    memberLabel,
    profileIds: new Set(),
    userIds: new Set(),
    gifts: new Map(),
    heart: new Map(),
    abilities: new Map(),
  };
}

function bump(bucket: Bucket, category: string, person: PersonRef) {
  let people = bucket.get(category);
  if (!people) {
    people = new Map();
    bucket.set(category, people);
  }
  people.set(person.id, person);
}

function top10(bucket: Bucket): RankedCategory[] {
  return [...bucket.entries()]
    .map(([key, people]) => ({
      key,
      label: getCategoryLabel(key),
      count: people.size,
      people: [...people.values()].sort((a, b) =>
        a.name.localeCompare(b.name, "id"),
      ),
    }))
    .sort(
      (a, b) =>
        b.count - a.count || a.label.localeCompare(b.label, "id"),
    )
    .slice(0, 10);
}

function finalize(builder: GroupBuilder): AnalyticsGroup {
  return {
    id: builder.id,
    name: builder.name,
    subtitle: builder.subtitle,
    profileCount: builder.profileIds.size,
    memberCount: builder.memberCount ?? builder.userIds.size,
    memberLabel: builder.memberLabel,
    giftKeys: [...builder.gifts.keys()],
    gifts: top10(builder.gifts),
    heart: top10(builder.heart),
    abilities: top10(builder.abilities),
  };
}

function batchOf(date: Date): { id: string; name: string } {
  const month = date.getMonth();
  const year = date.getFullYear();
  return {
    id: `${year}-${String(month + 1).padStart(2, "0")}`,
    name: `${MONTHS[month]} ${year}`,
  };
}

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [churches, shapeProfiles, completedAssessments] = await Promise.all([
    db.church.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { members: true } } },
    }),
    db.shapeProfile.findMany({
      include: {
        assessment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                church: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
      },
    }),
    db.assessment.findMany({
      where: { status: { in: ["COMPLETED", "ANALYZED"] } },
      select: { user: { select: { churchId: true } } },
    }),
  ]);

  const churchBuilders = new Map<string, GroupBuilder>();
  for (const church of churches) {
    churchBuilders.set(
      church.id,
      createBuilder(
        church.id,
        church.name,
        "anggota",
        church.code ? `Kode ${church.code}` : undefined,
        church._count.members,
      ),
    );
  }

  const batchBuilders = new Map<string, GroupBuilder>();

  for (const profile of shapeProfiles) {
    const owner = profile.assessment.user;
    const person: PersonRef = {
      id: owner.id,
      name: owner.name?.trim() || "Tanpa nama",
    };
    const church = owner.church;
    const churchBuilder = church
      ? (churchBuilders.get(church.id) ??
        createBuilder(
          church.id,
          church.name,
          "anggota",
          church.code ? `Kode ${church.code}` : undefined,
        ))
      : (churchBuilders.get(NONE_CHURCH) ??
        createBuilder(NONE_CHURCH, "Tanpa gereja", "orang"));
    if (!churchBuilders.has(churchBuilder.id)) {
      churchBuilders.set(churchBuilder.id, churchBuilder);
    }

    const batch = batchOf(profile.createdAt);
    const batchBuilder =
      batchBuilders.get(batch.id) ??
      createBuilder(batch.id, batch.name, "orang");
    if (!batchBuilders.has(batch.id)) {
      batchBuilders.set(batch.id, batchBuilder);
    }

    churchBuilder.profileIds.add(profile.id);
    churchBuilder.userIds.add(person.id);
    batchBuilder.profileIds.add(profile.id);
    batchBuilder.userIds.add(person.id);

    for (const category of readTop(profile.spiritualGifts)) {
      bump(churchBuilder.gifts, category, person);
      bump(batchBuilder.gifts, category, person);
    }
    for (const category of readTop(profile.heart)) {
      bump(churchBuilder.heart, category, person);
      bump(batchBuilder.heart, category, person);
    }
    for (const category of readTop(profile.abilities)) {
      bump(churchBuilder.abilities, category, person);
      bump(batchBuilder.abilities, category, person);
    }
  }

  const churchGroups = [...churchBuilders.values()]
    .map(finalize)
    .sort((a, b) => {
      if (a.id === NONE_CHURCH) return 1;
      if (b.id === NONE_CHURCH) return -1;
      return b.profileCount - a.profileCount || a.name.localeCompare(b.name, "id");
    });

  const batchGroups = [...batchBuilders.values()]
    .map(finalize)
    .sort((a, b) => b.id.localeCompare(a.id));

  const assessmentsByChurch = new Map<string, number>();
  for (const assessment of completedAssessments) {
    const churchId = assessment.user.churchId;
    if (!churchId) continue;
    assessmentsByChurch.set(churchId, (assessmentsByChurch.get(churchId) ?? 0) + 1);
  }

  const comparison: ChurchComparisonRow[] = churches.map((church) => ({
    id: church.id,
    name: church.name,
    members: church._count.members,
    assessments: assessmentsByChurch.get(church.id) ?? 0,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analitik Sistem
        </h1>
        <p className="text-muted-foreground mt-1">
          Rekap profil SHAPE per gereja atau per batch. Untuk membaca hasil
          seorang user, buka{" "}
          <Link href="/admin/reports" className="text-primary underline">
            Laporan Assessment
          </Link>{" "}
          atau klik nama di daftar Top 10.
        </p>
      </div>

      <SystemAnalytics
        churchGroups={churchGroups}
        batchGroups={batchGroups}
        comparison={comparison}
        registeredChurchCount={churches.length}
      />
    </div>
  );
}
