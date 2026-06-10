import { execFileSync } from "node:child_process";

export function readClipboard(): string {
  if (process.platform === "win32") {
    return execFileSync(
      "powershell",
      ["-NoProfile", "-Command", "Get-Clipboard -Raw"],
      { encoding: "utf8" }
    );
  }

  if (process.platform === "darwin") {
    return execFileSync("pbpaste", { encoding: "utf8" });
  }

  try {
    return execFileSync("xclip", ["-selection", "clipboard", "-o"], {
      encoding: "utf8",
    });
  } catch {
    return execFileSync("xsel", ["--clipboard", "--output"], {
      encoding: "utf8",
    });
  }
}

export function writeClipboard(text: string): void {
  if (process.platform === "win32") {
    execFileSync(
      "powershell",
      ["-NoProfile", "-Command", "[Console]::InputEncoding=[Text.UTF8Encoding]::new($false); $input | Set-Clipboard"],
      { input: text, encoding: "utf8" }
    );
    return;
  }

  if (process.platform === "darwin") {
    execFileSync("pbcopy", { input: text, encoding: "utf8" });
    return;
  }

  try {
    execFileSync("xclip", ["-selection", "clipboard"], {
      input: text,
      encoding: "utf8",
    });
  } catch {
    execFileSync("xsel", ["--clipboard", "--input"], {
      input: text,
      encoding: "utf8",
    });
  }
}
