#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { warmupLicenseCheck } from "./license.js";
import { sanitizeLogs } from "./sanitize.js";

const server = new McpServer({
  name: "logshield-pro",
  version: "1.0.0",
});

server.tool(
  "sanitize_logs",
  "Sanitize raw log strings by masking IPv4/IPv6 addresses, emails, credit cards, and API keys (AWS/Stripe/OpenAI) using regex and entropy detection.",
  {
    raw_log: z
      .string()
      .describe("The raw log string to sanitize"),
  },
  async ({ raw_log }) => {
    const result = await sanitizeLogs(raw_log);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              sanitized_log: result.sanitized,
              masked_count: result.maskedCount,
              total_detected: result.totalDetected,
              tier: result.tier,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

async function main(): Promise<void> {
  await warmupLicenseCheck();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error("LogShield-Pro fatal error:", error);
  process.exit(1);
});
