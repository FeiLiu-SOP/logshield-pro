#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { stdin as input } from "node:process";
import { readClipboard, writeClipboard } from "./clipboard.js";
import { sanitizeLogs } from "./sanitize.js";

function printHelp(): void {
  console.log(`LogShield-Pro — local log sanitization CLI

Usage:
  logshield sanitize [file]          Sanitize a file (or stdin pipe)
  logshield sanitize --clipboard     Read clipboard → sanitize → write back
  logshield sanitize -c              Shorthand for --clipboard

Options:
  -c, --clipboard   Use system clipboard (recommended before pasting into AI chat)
  -q, --quiet       Only print sanitized text (no summary line)
  --json            Output full JSON result
  -h, --help        Show this help

Examples:
  logshield sanitize app.log
  type app.log | logshield sanitize
  logshield sanitize --clipboard

Environment:
  LOGSHIELD_LICENSE_KEY   Polar license key (optional, unlocks professional tier)
`);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of input) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readInput(options: {
  file?: string;
  clipboard: boolean;
}): Promise<string> {
  if (options.clipboard) {
    return readClipboard();
  }

  if (options.file && options.file !== "-") {
    return readFile(options.file, "utf8");
  }

  if (!input.isTTY) {
    return readStdin();
  }

  throw new Error(
    "No input provided. Pass a file, pipe stdin, or use --clipboard."
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args[0] !== "sanitize") {
    console.error(`Unknown command: ${args[0]}`);
    printHelp();
    process.exit(1);
  }

  let clipboard = false;
  let json = false;
  let quiet = false;
  let file: string | undefined;

  for (const arg of args.slice(1)) {
    if (arg === "--clipboard" || arg === "-c") {
      clipboard = true;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--quiet" || arg === "-q") {
      quiet = true;
    } else if (!arg.startsWith("-")) {
      file = arg;
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  let raw: string;
  try {
    raw = await readInput({ file, clipboard });
  } catch (error: unknown) {
    console.error(
      error instanceof Error ? error.message : "Failed to read input."
    );
    process.exit(1);
  }

  if (!raw.trim()) {
    console.error("Input is empty.");
    process.exit(1);
  }

  const result = await sanitizeLogs(raw);

  if (clipboard) {
    writeClipboard(result.sanitized);
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          sanitized_log: result.sanitized,
          masked_count: result.maskedCount,
          total_detected: result.totalDetected,
          tier: result.tier,
          clipboard_updated: clipboard,
        },
        null,
        2
      )
    );
  } else {
    console.log(result.sanitized);
    if (!quiet) {
      const summary = clipboard
        ? `Clipboard updated. Masked ${result.maskedCount}/${result.totalDetected} (${result.tier}).`
        : `Masked ${result.maskedCount}/${result.totalDetected} (${result.tier}).`;
      console.error(summary);
    }
  }
}

main().catch((error: unknown) => {
  console.error("LogShield-Pro CLI error:", error);
  process.exit(1);
});
