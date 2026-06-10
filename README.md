# LogShield-Pro

High-performance local log sanitization for developers. Masks IPv4/IPv6 addresses, emails, credit cards, and API keys (AWS / Stripe / OpenAI) using regex and entropy detection.

## Features

- **CLI (recommended)**: sanitize locally **before** pasting into AI chat — raw logs never enter Cursor
- **MCP (optional)**: sanitize from inside Cursor chat via the `sanitize_logs` tool
- **Free tier**: masks up to 3 sensitive items per request
- **Professional tier**: full sanitization with a valid Polar license key
- **Polar license validation**: online verification with 12-hour cache

## Purchase

**[Buy LogShield-Pro Professional License — $29](https://polar.sh/checkout/polar_c_2ot7iqjS40ojDgUTvEWn1cGTBrH8YPY7yXk2E3Zi1TQ)**

After payment, copy your `LS-PRO-...` license key from the success page or email.

---

## Recommended: CLI (privacy-first)

Sanitize on your machine first, then paste the clean log into Cursor.

### Install

```bash
git clone https://github.com/FeiLiu-SOP/logshield-pro.git
cd logshield-pro
npm install
npm run build
npm link
```

### Clipboard workflow (best for Cursor)

```bash
# 1. Copy raw log to clipboard
# 2. Run:
logshield sanitize --clipboard

# 3. Paste into Cursor — only sanitized text is shared with AI
```

### Other CLI usage

```bash
# Sanitize a file
logshield sanitize app.log

# Pipe from stdin
type app.log | logshield sanitize

# JSON output with stats
logshield sanitize app.log --json

# Professional tier (optional)
set LOGSHIELD_LICENSE_KEY=LS-PRO-your-key-here
logshield sanitize --clipboard
```

### Example

**Before:**
```
ERROR user=admin@corp.io from 192.168.1.42
AWS: AKIAIOSFODNN7EXAMPLE
```

**After (`logshield sanitize`):**
```
ERROR user=[MASKED_EMAIL] from [MASKED_IP]
AWS: [MASKED_SECRET]
```

---

## Optional: MCP (Cursor chat)

Use MCP when you want in-chat sanitization. Note: unsanitized text enters the chat before the tool runs. For privacy, prefer the CLI above.

### Configure MCP

Open **Cursor → Settings → Tools & MCP**, or edit `%USERPROFILE%\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "logshield-pro": {
      "command": "node",
      "args": ["C:/path/to/logshield-pro/dist/index.js"],
      "env": {
        "LOGSHIELD_LICENSE_KEY": "LS-PRO-paste-your-key-here"
      }
    }
  }
}
```

Ask the AI: *"Sanitize this log with sanitize_logs"*

See [`cursor-mcp.example.json`](cursor-mcp.example.json).

---

## Tool reference

| CLI | `logshield sanitize [file]` |
| MCP tool | `sanitize_logs` |
| Input | raw log string |
| Output | sanitized text + `masked_count` / `total_detected` / `tier` |

## Placeholders

| Detected | Replaced with |
|----------|---------------|
| IPv4 / IPv6 | `[MASKED_IP]` |
| Email | `[MASKED_EMAIL]` |
| Credit card | `[MASKED_CC]` |
| API keys / high-entropy secrets | `[MASKED_SECRET]` |

## License

Professional use requires a paid license from [Logic Scale](https://polar.sh/logic-scale).
