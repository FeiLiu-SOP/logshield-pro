/**
 * Logic Scale Polar organization ID.
 * Users do not need to set POLAR_ORGANIZATION_ID unless overriding.
 * Set DEFAULT_POLAR_ORGANIZATION_ID after copying from Polar → Settings.
 */
export const DEFAULT_POLAR_ORGANIZATION_ID = "";

export function getPolarOrganizationId(): string {
  const fromEnv = process.env.POLAR_ORGANIZATION_ID?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_POLAR_ORGANIZATION_ID;
}

/** Polar checkout link for LogShield-Pro Professional License */
export const PURCHASE_URL =
  "https://polar.sh/checkout/polar_c_2ot7iqjS40ojDgUTvEWn1cGTBrH8YPY7yXk2E3Zi1TQ";
