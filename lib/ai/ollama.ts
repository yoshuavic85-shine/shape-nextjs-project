import { z } from "zod";
import { safeParseAI } from "@/lib/ai/parse-json";

/* ------------------------------------------------------------------ */
/*  Low-level Mistral chat completion                                 */
/* ------------------------------------------------------------------ */

interface GenerateOpts {
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_MAX_TOKENS = 2000;
const DEFAULT_TEMPERATURE = 0.3;

/**
 * Call Mistral chat completions API in JSON mode.
 * Returns the raw content string from the first choice.
 */
export async function generateWithOllama(
  prompt: string,
  opts?: { numPredict?: number; temperature?: number },
): Promise<string> {
  const apiKey =
    process.env.MISTRAL_API_KEY ?? process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
  const model = process.env.MISTRAL_MODEL || "mistral-large-latest";

  const maxTokens = opts?.numPredict ?? DEFAULT_MAX_TOKENS;
  const temperature = opts?.temperature ?? DEFAULT_TEMPERATURE;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah AI yang HANYA merespon dalam format JSON murni sesuai instruksi pengguna. Jangan menambahkan teks, komentar, atau markdown di luar objek JSON. Pastikan setiap field yang diminta ada di output.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string }; finish_reason: string }[];
  };

  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error("Mistral tidak mengembalikan konten");
  }

  // If the response was cut off due to token limit, flag it
  if (choice.finish_reason === "length") {
    throw new Error(
      "Mistral response truncated (finish_reason=length). Output terlalu panjang untuk max_tokens yang diberikan.",
    );
  }

  return choice.message.content;
}

/* ------------------------------------------------------------------ */
/*  High-level: generate + parse + validate with retry                */
/* ------------------------------------------------------------------ */

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Generate AI content, parse as JSON, validate with Zod schema, and retry
 * up to MAX_RETRIES times on failure (with exponential backoff).
 *
 * This is the **single entrypoint** for all AI generation in the app.
 * It replaces the old pattern of generateWithOllama + parseAiResponse + schema.parse.
 */
export async function generateWithRetry<T>(
  prompt: string,
  schema: z.ZodType<T>,
  opts?: GenerateOpts,
): Promise<{ data: T; rawResponse: string }> {
  const maxTokens = opts?.maxTokens ?? DEFAULT_MAX_TOKENS;
  const temperature = opts?.temperature ?? DEFAULT_TEMPERATURE;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await generateWithOllama(prompt, {
        numPredict: maxTokens,
        temperature,
      });

      // Parse JSON (with jsonrepair fallback)
      const parsed = safeParseAI<Record<string, unknown>>(raw);

      // Validate through Zod (schema has defaults + coercion)
      const validated = schema.parse(parsed);

      return { data: validated, rawResponse: raw };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[generateWithRetry] Attempt ${attempt}/${MAX_RETRIES} failed:`,
        lastError.message,
      );

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw new Error(
    `AI generation failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`,
  );
}

/* ------------------------------------------------------------------ */
/*  Legacy helpers (kept for backward compat but prefer generateWithRetry) */
/* ------------------------------------------------------------------ */

export async function parseAiResponse<T>(rawResponse: string): Promise<T> {
  return safeParseAI<T>(rawResponse);
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const response = await fetch(`${baseUrl}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}
