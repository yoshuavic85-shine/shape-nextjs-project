import { ShapeSection } from "@/types";

const SECTION_LABELS: Record<ShapeSection, string> = {
  SPIRITUAL_GIFTS: "Karunia Rohani",
  HEART: "Hati (Passion)",
  ABILITIES: "Kemampuan",
  PERSONALITY: "Kepribadian",
  EXPERIENCE: "Pengalaman",
};

/** Build prompt for AI insight for a single SHAPE section (partial data). */
export function buildSectionInsightPrompt(
  section: ShapeSection,
  sectionData: unknown,
): string {
  const label = SECTION_LABELS[section];
  const dataJson = JSON.stringify(sectionData, null, 2);

  return `Kamu adalah konselor rohani Kristen yang bijaksana. Berikan insight singkat untuk SATU dimensi SHAPE saja: ${label}.

Data assessment untuk dimensi ini:
${dataJson}

ATURAN:
- Gunakan nada hangat dan mendorong.
- Gunakan frasa seperti "tampaknya", "berdasarkan assessment ini".
- Jangan klaim wahyu atau prediksi masa depan.
- Output HARUS JSON valid saja, tanpa teks di luar JSON.

Berikan dalam format JSON (Bahasa Indonesia):
{
  "summary": "Satu paragraf ringkas (3-5 kalimat) tentang apa yang terlihat dari dimensi ${label} ini dan implikasinya.",
  "strengths": ["2-4 poin kekuatan singkat berdasarkan data ini"]
}`;
}

export interface SectionInsightOutput {
  summary: string;
  strengths: string[];
}
