import { FREE_TIER_MESSAGE, isLicenseValid } from "./license.js";
import { detectSensitiveData, type SensitiveMatch } from "./patterns.js";

const FREE_TIER_LIMIT = 3;

export interface SanitizeResult {
  sanitized: string;
  maskedCount: number;
  totalDetected: number;
  tier: "free" | "professional";
}

function applyMasks(input: string, toMask: SensitiveMatch[]): string {
  if (toMask.length === 0) return input;

  const parts: string[] = [];
  let cursor = 0;

  for (const match of toMask) {
    parts.push(input.slice(cursor, match.start));
    parts.push(match.placeholder);
    cursor = match.end;
  }

  parts.push(input.slice(cursor));
  return parts.join("");
}

export async function sanitizeLogs(rawLog: string): Promise<SanitizeResult> {
  const detected = detectSensitiveData(rawLog);
  const licensed = await isLicenseValid();

  if (licensed) {
    return {
      sanitized: applyMasks(rawLog, detected),
      maskedCount: detected.length,
      totalDetected: detected.length,
      tier: "professional",
    };
  }

  const limited = detected.slice(0, FREE_TIER_LIMIT);
  let sanitized = applyMasks(rawLog, limited);

  if (detected.length > FREE_TIER_LIMIT) {
    sanitized = `${sanitized}\n\n${FREE_TIER_MESSAGE}`;
  }

  return {
    sanitized,
    maskedCount: limited.length,
    totalDetected: detected.length,
    tier: "free",
  };
}
