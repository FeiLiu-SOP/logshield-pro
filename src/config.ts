/**
 * Logic Scale Polar organization ID.
 * Users do not need to set POLAR_ORGANIZATION_ID unless overriding.
 * Set DEFAULT_POLAR_ORGANIZATION_ID after copying from Polar → Settings.
 */
export const DEFAULT_POLAR_ORGANIZATION_ID =
  "fcc09a5f-afbd-4db9-8e1c-8f8a5df1e87a";

export function getPolarOrganizationId(): string {
  const fromEnv = process.env.POLAR_ORGANIZATION_ID?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_POLAR_ORGANIZATION_ID;
}

/** Polar checkout link for LogShield-Pro Professional License */
export const PURCHASE_URL =
  "https://polar.sh/checkout/polar_c_bVdkdrbYFjLF6lHHSoBcVaCYbf7XwQhdq7avzs0hh2D9";
