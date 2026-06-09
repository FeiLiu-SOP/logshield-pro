import { isHighEntropySecret } from "./entropy.js";

export type SensitiveKind =
  | "ipv4"
  | "ipv6"
  | "email"
  | "credit_card"
  | "aws_access_key"
  | "aws_secret_key"
  | "stripe_key"
  | "openai_key"
  | "high_entropy_secret";

export interface SensitiveMatch {
  start: number;
  end: number;
  kind: SensitiveKind;
  placeholder: string;
}

const PLACEHOLDERS: Record<SensitiveKind, string> = {
  ipv4: "[MASKED_IP]",
  ipv6: "[MASKED_IP]",
  email: "[MASKED_EMAIL]",
  credit_card: "[MASKED_CC]",
  aws_access_key: "[MASKED_SECRET]",
  aws_secret_key: "[MASKED_SECRET]",
  stripe_key: "[MASKED_SECRET]",
  openai_key: "[MASKED_SECRET]",
  high_entropy_secret: "[MASKED_SECRET]",
};

interface PatternRule {
  kind: SensitiveKind;
  regex: RegExp;
  validate?: (match: string) => boolean;
}

const IPV4 =
  /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;

const IPV6 =
  /\b(?:(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,7}:|(?:[A-Fa-f0-9]{1,4}:){1,6}:[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,5}(?::[A-Fa-f0-9]{1,4}){1,2}|(?:[A-Fa-f0-9]{1,4}:){1,4}(?::[A-Fa-f0-9]{1,4}){1,3}|(?:[A-Fa-f0-9]{1,4}:){1,3}(?::[A-Fa-f0-9]{1,4}){1,4}|(?:[A-Fa-f0-9]{1,4}:){1,2}(?::[A-Fa-f0-9]{1,4}){1,5}|[A-Fa-f0-9]{1,4}:(?::[A-Fa-f0-9]{1,4}){1,6}|:(?::[A-Fa-f0-9]{1,4}){1,7}|::(?:[A-Fa-f0-9]{1,4}:){0,6}[A-Fa-f0-9]{1,4}|::)\b/g;

const EMAIL =
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\b/g;

const CREDIT_CARD =
  /\b(?:\d[ -]*?){13,19}\b/g;

const AWS_ACCESS_KEY = /\b(AKIA[0-9A-Z]{16})\b/g;
const AWS_SECRET_KEY = /\b([A-Za-z0-9/+=]{40})\b/g;

const STRIPE_KEY =
  /\b((?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,})\b/g;

const OPENAI_KEY = /\b(sk-[A-Za-z0-9_-]{20,})\b/g;

const ENTROPY_CANDIDATE =
  /(?:^|[^A-Za-z0-9+/=_-])([A-Za-z0-9+/=_-]{20,128})(?:[^A-Za-z0-9+/=_-]|$)/g;

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function isCreditCard(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  return luhnCheck(digits);
}

function isAwsSecretKey(value: string): boolean {
  return (
    value.length === 40 &&
    /^[A-Za-z0-9/+=]+$/.test(value) &&
    !value.startsWith("AKIA")
  );
}

const RULES: PatternRule[] = [
  { kind: "aws_access_key", regex: AWS_ACCESS_KEY },
  { kind: "stripe_key", regex: STRIPE_KEY },
  { kind: "openai_key", regex: OPENAI_KEY },
  {
    kind: "aws_secret_key",
    regex: AWS_SECRET_KEY,
    validate: isAwsSecretKey,
  },
  { kind: "ipv6", regex: IPV6 },
  { kind: "ipv4", regex: IPV4 },
  { kind: "email", regex: EMAIL },
  {
    kind: "credit_card",
    regex: CREDIT_CARD,
    validate: isCreditCard,
  },
];

function overlaps(
  candidate: SensitiveMatch,
  accepted: SensitiveMatch[]
): boolean {
  return accepted.some(
    (m) => candidate.start < m.end && candidate.end > m.start
  );
}

function collectEntropyMatches(input: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = [];
  ENTROPY_CANDIDATE.lastIndex = 0;

  let result: RegExpExecArray | null;
  while ((result = ENTROPY_CANDIDATE.exec(input)) !== null) {
    const value = result[1];
    if (!isHighEntropySecret(value)) continue;

    const start = result.index + result[0].indexOf(value);
    matches.push({
      start,
      end: start + value.length,
      kind: "high_entropy_secret",
      placeholder: PLACEHOLDERS.high_entropy_secret,
    });
  }
  return matches;
}

export function detectSensitiveData(input: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = [];

  for (const rule of RULES) {
    rule.regex.lastIndex = 0;
    let result: RegExpExecArray | null;

    while ((result = rule.regex.exec(input)) !== null) {
      const value = result[1] ?? result[0];
      const start = result.index + (result[0].length - value.length);
      const end = start + value.length;

      if (rule.validate && !rule.validate(value)) continue;

      const candidate: SensitiveMatch = {
        start,
        end,
        kind: rule.kind,
        placeholder: PLACEHOLDERS[rule.kind],
      };

      if (!overlaps(candidate, matches)) {
        matches.push(candidate);
      }
    }
  }

  for (const candidate of collectEntropyMatches(input)) {
    if (!overlaps(candidate, matches)) {
      matches.push(candidate);
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}
