import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateChurchCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Personality labels based on pole difference spectrum (0–1).
 * Thresholds are interpretive bands for ministry reflection, not clinical cutoffs.
 */
export function getPersonalityLabel(
  value: number,
  positiveLabel: string,
  negativeLabel: string,
  ambiguous = false,
): string {
  if (ambiguous) return "Sinyal campuran — perlu refleksi";
  const percentage = Math.round(value * 100);
  if (percentage >= 62) return `${percentage}% condong ${positiveLabel}`;
  if (percentage <= 38) return `${100 - percentage}% condong ${negativeLabel}`;
  return "Relatif seimbang";
}
