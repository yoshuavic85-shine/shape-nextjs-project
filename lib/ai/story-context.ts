import {
  OPEN_ENDED_PROMPTS,
  type OpenEndedPrompt,
} from "@/lib/constants/open-ended";

export type StoryAnswer = {
  promptKey: string;
  text: string;
};

export function formatStoriesForPrompt(answers: StoryAnswer[]): string {
  const filled = answers.filter((a) => a.text.trim().length > 0);
  if (filled.length === 0) {
    return "Mentee belum menuliskan cerita terbuka. Jangan mengarang riwayat hidup. Gunakan hanya skor SHAPE dan nyatakan bahwa narasi panggilan masih hipotetis sampai dikonfirmasi lewat cerita dan mentor.";
  }

  const byKey = new Map(OPEN_ENDED_PROMPTS.map((p) => [p.key, p]));
  return filled
    .map((a) => {
      const prompt: OpenEndedPrompt | undefined = byKey.get(a.promptKey);
      const title = prompt?.title ?? a.promptKey;
      const question = prompt?.prompt ?? "";
      return `### ${title}\nPertanyaan: ${question}\nJawaban: ${a.text.trim()}`;
    })
    .join("\n\n");
}
