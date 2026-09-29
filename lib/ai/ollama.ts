import { z } from "zod";
import { safeParseAI } from "@/lib/ai/parse-json";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                   */
/* ------------------------------------------------------------------ */

interface GenerateOpts {
  maxTokens?: number;
  temperature?: number;
}

/** Short JSON reports — enough for 3-item arrays. */
const DEFAULT_MAX_TOKENS = 1100;
const DEFAULT_TEMPERATURE = 0.3;
const PROVIDER_TIMEOUT_MS = 12_000;

const SYSTEM_JSON =
  "Balas HANYA JSON valid sesuai skema pengguna. Tanpa markdown.";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions";

/** Retired Gemini ids still sitting in env files. */
const GEMINI_ALIASES: Record<string, string> = {
  "gemini-2.5-flash": "gemini-3.6-flash",
  "gemini-2.5-flash-lite": "gemini-3.5-flash-lite",
  "gemini-2.0-flash": "gemini-3.6-flash",
  "gemini-2.0-flash-lite": "gemini-3.1-flash-lite",
  "gemini-flash-latest": "gemini-3.6-flash",
};

class ProviderHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
    readonly retryAfterMs?: number,
    readonly provider: string = "AI",
  ) {
    super(`${provider} error (${status}): ${body}`);
    this.name = "ProviderHttpError";
  }
}

function retryAfterMsFromHeaders(headers: Headers): number | undefined {
  const raw = headers.get("retry-after");
  if (!raw) return undefined;
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds < 0) return undefined;
  return Math.min(seconds * 1000, 30_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const value = item.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function resolveGeminiModel(model: string): string {
  return GEMINI_ALIASES[model] ?? model;
}

async function callOpenAiCompat(
  provider: string,
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
  opts: { maxTokens: number; temperature: number },
  jsonMode = true,
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": "shape-compass/1.0",
    },
    body: JSON.stringify({
      model,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: SYSTEM_JSON },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    if (
      jsonMode &&
      (response.status === 400 || body.includes("json_validate"))
    ) {
      return callOpenAiCompat(
        provider,
        url,
        apiKey,
        model,
        prompt,
        opts,
        false,
      );
    }
    throw new ProviderHttpError(
      response.status,
      body,
      retryAfterMsFromHeaders(response.headers),
      provider,
    );
  }

  const data = (await response.json()) as {
    choices: { message: { content: string }; finish_reason: string }[];
  };
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error(`${provider} tidak mengembalikan konten`);
  }
  if (choice.finish_reason === "length") {
    throw new Error(`${provider} response truncated (finish_reason=length).`);
  }
  return choice.message.content;
}

async function callGemini(
  model: string,
  prompt: string,
  opts: { maxTokens: number; temperature: number },
  withThinkingBudget = true,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY tidak diset");
  const resolved = resolveGeminiModel(model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolved}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const generationConfig: Record<string, unknown> = {
    temperature: opts.temperature,
    maxOutputTokens: Math.max(opts.maxTokens, 1600),
    responseMimeType: "application/json",
  };
  if (withThinkingBudget) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_JSON }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    if (withThinkingBudget && (response.status === 400 || response.status === 404)) {
      return callGemini(model, prompt, opts, false);
    }
    throw new ProviderHttpError(
      response.status,
      body,
      retryAfterMsFromHeaders(response.headers),
      "Gemini",
    );
  }

  const data = (await response.json()) as {
    candidates?: {
      finishReason?: string;
      content?: { parts?: { text?: string; thought?: boolean }[] };
    }[];
  };
  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini tidak mengembalikan konten");
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new Error("Gemini response truncated (finishReason=MAX_TOKENS).");
  }
  return text;
}

type ProviderAttempt = {
  name: string;
  run: () => Promise<string>;
};

function groqModels(): string[] {
  const primary = process.env.GROQ_MODEL || "groq/compound";
  return unique([primary, "openai/gpt-oss-20b"]);
}

function geminiModels(): string[] {
  const primary = resolveGeminiModel(
    process.env.GEMINI_MODEL || "gemini-3.6-flash",
  );
  return unique([primary, "gemini-3.6-flash", "gemini-3.1-flash-lite"]);
}

function mistralModels(): string[] {
  const primary = process.env.MISTRAL_MODEL || "mistral-small-latest";
  return unique([primary, "mistral-small-latest"]);
}

function familyOrder(): Array<"groq" | "gemini" | "mistral"> {
  const preferred = (process.env.AI_PROVIDER || "groq").toLowerCase();
  const all: Array<"groq" | "gemini" | "mistral"> = [
    "groq",
    "gemini",
    "mistral",
  ];
  return unique([preferred, ...all]).filter(
    (name): name is "groq" | "gemini" | "mistral" =>
      name === "groq" || name === "gemini" || name === "mistral",
  );
}

function listProviders(
  prompt: string,
  opts: { maxTokens: number; temperature: number },
): ProviderAttempt[] {
  const mistralKey =
    process.env.MISTRAL_API_KEY ?? process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const attempts: ProviderAttempt[] = [];

  for (const family of familyOrder()) {
    if (family === "groq" && groqKey) {
      for (const model of groqModels()) {
        attempts.push({
          name: `groq:${model}`,
          run: () =>
            callOpenAiCompat(
              "Groq",
              GROQ_CHAT_URL,
              groqKey,
              model,
              prompt,
              opts,
            ),
        });
      }
    }
    if (family === "gemini" && geminiKey) {
      for (const model of geminiModels()) {
        attempts.push({
          name: `gemini:${model}`,
          run: () => callGemini(model, prompt, opts),
        });
      }
    }
    if (family === "mistral" && mistralKey) {
      for (const model of mistralModels()) {
        attempts.push({
          name: `mistral:${model}`,
          run: () =>
            callOpenAiCompat(
              "Mistral",
              MISTRAL_CHAT_URL,
              mistralKey,
              model,
              prompt,
              opts,
            ),
        });
      }
    }
  }

  return attempts;
}

export async function generateWithOllama(
  prompt: string,
  opts?: { numPredict?: number; temperature?: number },
): Promise<string> {
  const maxTokens = opts?.numPredict ?? DEFAULT_MAX_TOKENS;
  const temperature = opts?.temperature ?? DEFAULT_TEMPERATURE;
  const providers = listProviders(prompt, { maxTokens, temperature });
  if (providers.length === 0) {
    throw new Error(
      "Tidak ada API key AI. Set MISTRAL_API_KEY, GROQ_API_KEY, atau GEMINI_API_KEY.",
    );
  }

  let lastError: Error | null = null;
  for (const provider of providers) {
    try {
      const result = await provider.run();
      console.log(`[ai] OK via ${provider.name}`);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[ai] ${provider.name} gagal — cadangan berikutnya...`,
        lastError.message.slice(0, 180),
      );
    }
  }

  throw lastError ?? new Error("Semua provider AI gagal");
}

/* ------------------------------------------------------------------ */
/*  High-level: generate + parse + validate with retry                */
/* ------------------------------------------------------------------ */

const BASE_DELAY_MS = 1000;

function providerStatus(err: unknown, message: string): number | undefined {
  if (err instanceof ProviderHttpError) return err.status;
  const match = message.match(/error \((\d+)\)/i);
  return match ? Number(match[1]) : undefined;
}

function shouldReplayChain(err: unknown, message: string): boolean {
  const status = providerStatus(err, message);
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /timeout|aborted|network|fetch/i.test(message)
  );
}

/**
 * Generate AI content, parse as JSON, validate with Zod schema.
 * Any failure (quota, 400, parse, Zod) moves to the next model/provider
 * immediately so Shape stays up while one vendor is limited.
 */
export async function generateWithRetry<T>(
  prompt: string,
  schema: z.ZodType<T>,
  opts?: GenerateOpts,
): Promise<{ data: T; rawResponse: string }> {
  const maxTokens = opts?.maxTokens ?? DEFAULT_MAX_TOKENS;
  const temperature = opts?.temperature ?? DEFAULT_TEMPERATURE;
  const providers = listProviders(prompt, { maxTokens, temperature });
  if (providers.length === 0) {
    throw new Error(
      "Tidak ada API key AI. Set MISTRAL_API_KEY, GROQ_API_KEY, atau GEMINI_API_KEY.",
    );
  }

  let lastError: Error | null = null;
  let replayable = false;

  for (let pass = 1; pass <= 2; pass++) {
    replayable = false;
    for (const provider of providers) {
      try {
        const raw = await provider.run();
        const parsed = safeParseAI<Record<string, unknown>>(raw);
        const validated = schema.parse(parsed);
        console.log(`[ai] OK via ${provider.name}`);
        return { data: validated, rawResponse: raw };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        replayable = replayable || shouldReplayChain(err, lastError.message);
        console.warn(
          `[ai] ${provider.name} gagal — cadangan berikutnya...`,
          lastError.message.slice(0, 180),
        );
      }
    }

    if (pass === 1 && replayable && lastError) {
      const retryAfter =
        lastError instanceof ProviderHttpError
          ? lastError.retryAfterMs
          : undefined;
      const delay = Math.min(
        Math.max(retryAfter ?? BASE_DELAY_MS * 6, BASE_DELAY_MS) +
          Math.random() * 500,
        12_000,
      );
      console.log(
        `[generateWithRetry] Semua provider gagal sementara; ulang rantai dalam ${Math.round(delay)}ms`,
      );
      await sleep(delay);
      continue;
    }
    break;
  }

  throw new Error(`AI generation failed. Last error: ${lastError?.message}`);
}

/* ------------------------------------------------------------------ */
/*  Legacy helpers (kept for backward compat — prefer generateWithRetry) */
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
