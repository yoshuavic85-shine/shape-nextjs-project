export interface OpenEndedPrompt {
  key: string;
  title: string;
  prompt: string;
  helper?: string;
  required: boolean;
  minLength: number;
}

export const OPEN_ENDED_PROMPTS: OpenEndedPrompt[] = [
  {
    key: "TURNING_POINT",
    title: "Titik balik",
    prompt:
      "Ceritakan satu titik balik hidup yang paling membentuk arah Anda hingga hari ini. Apa yang berubah setelahnya?",
    helper: "Boleh singkat — satu peristiwa yang masih terasa membentuk Anda.",
    required: true,
    minLength: 20,
  },
  {
    key: "PAINFUL_FORMATION",
    title: "Luka yang membentuk",
    prompt:
      "Apakah ada kehilangan, kegagalan, atau luka yang Tuhan pakai untuk membentuk empati atau pelayanan Anda?",
    helper:
      "Opsional. Lewati jika terlalu berat untuk ditulis sekarang — Anda bisa membicarakannya dengan mentor.",
    required: false,
    minLength: 0,
  },
  {
    key: "UNPAID_JOY",
    title: "Sukacita tanpa upah",
    prompt:
      "Hal apa yang Anda kerjakan dengan sukacita meskipun tidak dibayar? Mengapa itu terasa hidup?",
    required: true,
    minLength: 20,
  },
  {
    key: "HOLY_ANGER",
    title: "Beban yang menggerakkan",
    prompt:
      "Apa yang membuat hati Anda tergerak marah, prihatin, atau menangis karena kondisi orang lain atau dunia di sekitar Anda?",
    required: true,
    minLength: 20,
  },
  {
    key: "CONFIRMATION",
    title: "Peneguhan orang lain",
    prompt:
      "Kapan seseorang (keluarga, teman, pemimpin) pernah meneguhkan karunia, peran, atau kekuatan Anda? Apa yang mereka lihat?",
    required: true,
    minLength: 20,
  },
  {
    key: "WORK_FAMILY",
    title: "Panggilan di luar gereja",
    prompt:
      "Bagaimana pekerjaan, keluarga, studi, atau komunitas di luar gereja terasa sebagai bagian dari panggilan Anda — bukan hanya pelayanan di dalam gedung gereja?",
    required: true,
    minLength: 20,
  },
  {
    key: "NEXT_EXPERIMENT",
    title: "Eksperimen 3 bulan",
    prompt:
      "Jika 3 bulan ke depan Anda boleh mencoba satu langkah konkret (pelayanan, pekerjaan, atau kebiasaan), apa yang ingin Anda coba — dan dengan siapa?",
    required: true,
    minLength: 20,
  },
  {
    key: "PRAYER_QUESTION",
    title: "Pertanyaan kepada Tuhan",
    prompt:
      "Pertanyaan apa yang sedang Anda bawa kepada Tuhan tentang arah hidup Anda saat ini?",
    required: true,
    minLength: 10,
  },
];

export const REQUIRED_OPEN_ENDED = OPEN_ENDED_PROMPTS.filter((p) => p.required);

export function isPromptSatisfied(
  prompt: OpenEndedPrompt,
  text: string | undefined | null,
): boolean {
  if (!prompt.required) return true;
  const trimmed = (text ?? "").trim();
  return trimmed.length >= prompt.minLength;
}

export function missingOpenEndedKeys(
  answers: Record<string, string>,
): string[] {
  return REQUIRED_OPEN_ENDED.filter(
    (p) => !isPromptSatisfied(p, answers[p.key]),
  ).map((p) => p.key);
}
