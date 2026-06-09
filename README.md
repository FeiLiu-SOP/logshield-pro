# LogShield-Pro

High-performance MCP server for enterprise log sanitization. Masks IPv4/IPv6 addresses, emails, credit cards, and API keys (AWS / Stripe / OpenAI) using regex and entropy detection.

## Features

- **Free tier**: masks up to 3 sensitive items per request
- **Professional tier**: full sanitization with a valid Polar license key
- **Local processing**: logs never leave your machine
- **Polar license validation**: online verification with 12-hour cache

## Purchase

**[Buy LogShield-Pro Professional License — $29](https://polar.sh/checkout/polar_c_2ot7iqjS40ojDgUTvEWn1cGTBrH8YPY7yXk2E3Zi1TQ)**

After payment, copy your `LS-PRO-...` license key from the success page or email.

## Quick Start (Cursor) — 3 steps

### Step 1: Install

```bash
git clone https://github.com/FeiLiu-SOP/logshield-pro.git
cd logshield-pro
npm install
npm run build
```

### Step 2: Configure MCP

Open **Cursor → Settings → MCP → Edit Config**, paste and adjust the path:

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

> Windows tip: use forward slashes in the path, e.g. `E:/web3/mcp/tool-1/dist/index.js`

See [`cursor-mcp.example.json`](cursor-mcp.example.json) for a copy-paste template.

**No license key?** Omit `LOGSHIELD_LICENSE_KEY` — free tier works with up to 3 masks per request.

### Step 3: Restart Cursor

Toggle the MCP server off/on or restart Cursor. Ask the AI:

> Sanitize this log with sanitize_logs

Professional tier returns `"tier": "professional"` in the response.

## Tool: `sanitize_logs`

| Input | `raw_log` — raw log string |
| Output | JSON with `sanitized_log`, `masked_count`, `total_detected`, `tier` |

## Placeholders

| Detected | Replaced with |
|----------|---------------|
| IPv4 / IPv6 | `[MASKED_IP]` |
| Email | `[MASKED_EMAIL]` |
| Credit card | `[MASKED_CC]` |
| API keys / high-entropy secrets | `[MASKED_SECRET]` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Still on free tier with a valid key | Check internet; restart MCP; verify key starts with `LS-PRO-` |
| MCP not connecting | Run `node dist/index.js` manually to check for errors |
| Path errors on Windows | Use absolute path with `/` slashes in `args` |

## License

Professional use requires a paid license from [Logic Scale](https://polar.sh/logic-scale).
