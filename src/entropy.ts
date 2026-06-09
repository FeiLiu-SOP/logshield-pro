const BASE64ISH = /^[A-Za-z0-9+/=_-]+$/;

export function shannonEntropy(value: string): number {
  if (value.length === 0) return 0;

  const freq = new Map<string, number>();
  for (const char of value) {
    freq.set(char, (freq.get(char) ?? 0) + 1);
  }

  let entropy = 0;
  const len = value.length;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function isHighEntropySecret(value: string): boolean {
  if (value.length < 20 || value.length > 128) return false;
  if (!BASE64ISH.test(value)) return false;

  const hasMixedCase = /[a-z]/.test(value) && /[A-Z]/.test(value);
  const hasDigits = /\d/.test(value);
  const uniqueRatio = new Set(value).size / value.length;

  const entropy = shannonEntropy(value);
  return entropy >= 4.0 && uniqueRatio >= 0.5 && (hasMixedCase || hasDigits);
}
