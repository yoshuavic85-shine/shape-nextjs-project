import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UsersRound } from "lucide-react";
import {
  placeInMinistries,
  readPersonality,
  readSectionScores,
  type MinistryProfile,
} from "@/lib/ministry-placement";
import { PlacementView, type PlacementGroup } from "./placement-client";

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

interface ProfileSnapshot extends MinistryProfile {
  createdAt: number;
}

function batchOf(date: Date): { id: string; name: string } {
  const month = date.getMonth();
  const year = date.getFullYear();
  return {
    id: `${year}-${String(month + 1).padStart(2, "0")}`,
    name: `${MONTHS[month]} ${year}`,
  };
}

function remember(
  bucket: Map<string, ProfileSnapshot>,
  profile: MinistryProfile,
  createdAt: number,
) {
  const current = bucket.get(profile.id);
  if (!current || createdAt > current.createdAt) {
    bucket.set(profile.id, { ...profile, createdAt });
  }
}

function toGroup(
  id: string,
  name: string,
  subtitle: string | undefined,
  profiles: Map<string, ProfileSnapshot>,
): PlacementGroup {
  return {
    id,
    name,
    subtitle,
    profileCount: profiles.size,
    placements: placeInMinistries(
      [...profiles.values()].map(({ createdAt: _createdAt, ...profile }) => profile),
    ),
  };
}

export default async function AdminPlacementPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [churches, shapeProfiles] = await Promise.all([
    db.church.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
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
  ]);

  const churchProfiles = new Map<string, Map<string, ProfileSnapshot>>();
  const churchMeta = new Map<
    string,
    { name: string; subtitle?: string }
  >();
  for (const church of churches) {
    churchProfiles.set(church.id, new Map());
    churchMeta.set(church.id, {
      name: church.name,
      subtitle: church.code ? `Kode ${church.code}` : undefined,
    });
  }

  const batchProfiles = new Map<string, Map<string, ProfileSnapshot>>();
  const batchMeta = new Map<string, { name: string }>();

  for (const profile of shapeProfiles) {
    const owner = profile.assessment.user;
    const ministryProfile: MinistryProfile = {
      id: owner.id,
      name: owner.name?.trim() || "Tanpa nama",
      gifts: readSectionScores(profile.spiritualGifts),
      heart: readSectionScores(profile.heart),
      abilities: readSectionScores(profile.abilities),
      experience: readSectionScores(profile.experience),
      personality: readPersonality(profile.personality),
    };
    const createdAt = profile.createdAt.getTime();
    const church = owner.church;
    const churchId = church?.id ?? NONE_CHURCH;
    if (!churchProfiles.has(churchId)) {
      churchProfiles.set(churchId, new Map());
      churchMeta.set(churchId, {
        name: church?.name ?? "Tanpa gereja",
        subtitle: church?.code ? `Kode ${church.code}` : undefined,
      });
    }
    remember(churchProfiles.get(churchId)!, ministryProfile, createdAt);

    const batch = batchOf(profile.createdAt);
    if (!batchProfiles.has(batch.id)) {
      batchProfiles.set(batch.id, new Map());
      batchMeta.set(batch.id, { name: batch.name });
    }
    remember(batchProfiles.get(batch.id)!, ministryProfile, createdAt);
  }

  const churchGroups = [...churchProfiles.entries()]
    .map(([id, profiles]) => {
      const meta = churchMeta.get(id);
      return toGroup(id, meta?.name ?? "Gereja", meta?.subtitle, profiles);
    })
    .sort((a, b) => {
      if (a.id === NONE_CHURCH) return 1;
      if (b.id === NONE_CHURCH) return -1;
      return b.profileCount - a.profileCount || a.name.localeCompare(b.name, "id");
    });

  const batchGroups = [...batchProfiles.entries()]
    .map(([id, profiles]) =>
      toGroup(id, batchMeta.get(id)?.name ?? id, undefined, profiles),
    )
    .sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <UsersRound className="w-8 h-8 text-primary" />
          Penempatan Pelayanan
        </h1>
        <p className="text-muted-foreground mt-1">
          Usulan peran dari karunia, hati, kemampuan, kepribadian, dan
          pengalaman, per gereja atau per batch. Instrumen musik, usia, dan
          jenis kelamin tidak diukur SHAPE, jadi bagian itu tetap dikonfirmasi
          gereja. Rekap angka ada di{" "}
          <Link href="/admin/analytics" className="text-primary underline">
            Analitik Sistem
          </Link>
          .
        </p>
      </div>

      <PlacementView churchGroups={churchGroups} batchGroups={batchGroups} />
    </div>
  );
}
