import { getPolarOrganizationId, PURCHASE_URL } from "./config.js";

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const PRODUCTION_API_BASE = "https://api.polar.sh";
const SANDBOX_API_BASE = "https://sandbox-api.polar.sh";

interface LicenseCache {
  key: string;
  valid: boolean;
  expiresAt: number;
}

interface PolarValidateResponse {
  status: string;
  benefit_id?: string;
  expires_at?: string | null;
}

let cache: LicenseCache | null = null;

export const FREE_TIER_MESSAGE = `FREE TIER LIMIT REACHED. Purchase a professional license at ${PURCHASE_URL} to unlock full enterprise-grade sanitization.`;

function getApiBase(): string {
  const customBase = process.env.POLAR_API_BASE?.trim();
  if (customBase) {
    return customBase.replace(/\/$/, "");
  }

  const sandbox = process.env.POLAR_SANDBOX?.trim().toLowerCase();
  if (sandbox === "1" || sandbox === "true") {
    return SANDBOX_API_BASE;
  }

  return PRODUCTION_API_BASE;
}

async function validateWithPolar(key: string): Promise<boolean> {
  const organizationId = getPolarOrganizationId();
  if (!organizationId) {
    console.error(
      "LogShield-Pro: Polar organization ID is not configured; treating license as invalid."
    );
    return false;
  }

  const url = `${getApiBase()}/v1/customer-portal/license-keys/validate`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        organization_id: organizationId,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as PolarValidateResponse;

    if (data.status !== "granted") {
      return false;
    }

    if (data.expires_at) {
      const expiry = new Date(data.expires_at);
      if (expiry.getTime() <= Date.now()) {
        return false;
      }
    }

    const expectedBenefitId = process.env.POLAR_BENEFIT_ID?.trim();
    if (expectedBenefitId && data.benefit_id !== expectedBenefitId) {
      return false;
    }

    return true;
  } catch (error: unknown) {
    console.error("LogShield-Pro: Polar license validation error:", error);
    return false;
  }
}

export async function isLicenseValid(): Promise<boolean> {
  const key = process.env.LOGSHIELD_LICENSE_KEY?.trim();
  if (!key) {
    return false;
  }

  if (cache && cache.key === key && Date.now() < cache.expiresAt) {
    return cache.valid;
  }

  const valid = await validateWithPolar(key);
  cache = {
    key,
    valid,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return valid;
}

export async function warmupLicenseCheck(): Promise<void> {
  await isLicenseValid();
}

export function clearLicenseCache(): void {
  cache = null;
}
