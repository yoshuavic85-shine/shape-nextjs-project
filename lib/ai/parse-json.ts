import { jsonrepair } from "jsonrepair";

/**
 * Extract and repair JSON from raw AI response text.
 *
 * Strategy:
 * 1. Strip any text outside `{...}` (AI may emit preamble or postamble).
 * 2. Try `JSON.parse` directly.
 * 3. If that fails, use `jsonrepair` to fix minor issues (trailing commas, curly quotes, etc.).
 */
export function extractAndRepairJson(raw: string): string {
  let s = raw.trim();

  // Strip <END_JSON> marker if present (legacy prompts)
  const endIdx = s.indexOf("<END_JSON>");
  if (endIdx !== -1) {
    s = s.slice(0, endIdx).trim();
  }

  // Extract outermost {...}
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response does not contain a JSON object");
  }
  s = s.slice(start, end + 1);

  // Normalize curly quotes
  s = s.replace(/[\u201C\u201D]/g, '"');

  // Fast-path: try direct parse
  try {
    JSON.parse(s);
    return s;
  } catch {
    // Repair and return
    return jsonrepair(s);
  }
}

/**
 * Parse AI JSON response with extraction + repair.
 */
export function safeParseAI<T = unknown>(raw: string): T {
  const jsonText = extractAndRepairJson(raw);
  return JSON.parse(jsonText) as T;
}
