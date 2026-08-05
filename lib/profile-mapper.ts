import { ShapeProfileData, ProfileQuality } from "@/types";
import { Prisma } from "@prisma/client";

type ShapeProfileRow = {
  spiritualGifts: unknown;
  heart: unknown;
  abilities: unknown;
  personality: unknown;
  experience: unknown;
  quality?: unknown | null;
};

/** Map DB ShapeProfile JSON columns → ShapeProfileData */
export function toShapeProfileData(row: ShapeProfileRow): ShapeProfileData {
  const personality = row.personality as ShapeProfileData["personality"];
  return {
    spiritualGifts:
      row.spiritualGifts as ShapeProfileData["spiritualGifts"],
    heart: row.heart as ShapeProfileData["heart"],
    abilities: row.abilities as ShapeProfileData["abilities"],
    personality: {
      ...personality,
      ambiguousDimensions: personality?.ambiguousDimensions ?? [],
    },
    experience: row.experience as ShapeProfileData["experience"],
    quality: (row.quality as ProfileQuality | null | undefined) ?? undefined,
  };
}

/** Serialize ShapeProfileData into Prisma JSON columns */
export function toShapeProfileJson(profile: ShapeProfileData): {
  spiritualGifts: Prisma.InputJsonValue;
  heart: Prisma.InputJsonValue;
  abilities: Prisma.InputJsonValue;
  personality: Prisma.InputJsonValue;
  experience: Prisma.InputJsonValue;
  quality: Prisma.InputJsonValue;
} {
  return {
    spiritualGifts: JSON.parse(
      JSON.stringify(profile.spiritualGifts),
    ) as Prisma.InputJsonValue,
    heart: JSON.parse(JSON.stringify(profile.heart)) as Prisma.InputJsonValue,
    abilities: JSON.parse(
      JSON.stringify(profile.abilities),
    ) as Prisma.InputJsonValue,
    personality: JSON.parse(
      JSON.stringify(profile.personality),
    ) as Prisma.InputJsonValue,
    experience: JSON.parse(
      JSON.stringify(profile.experience),
    ) as Prisma.InputJsonValue,
    quality: JSON.parse(
      JSON.stringify(profile.quality ?? null),
    ) as Prisma.InputJsonValue,
  };
}
