# LogShield-Pro

High-performance MCP server for enterprise log sanitization. Masks IPv4/IPv6 addresses, emails, credit cards, and API keys (AWS / Stripe / OpenAI) using regex and entropy detection.

## Features

- **Free tier**: masks up to 3 sensitive items per request
- **Professional tier**: full sanitization with a valid Polar license key
- **Local processing**: logs never leave your machine
- **Polar license validation**: online verification with 12-hour cache

## Purchase

Get a professional license at [Logic Scale on Polar](https://polar.sh/logic-scale).

## Quick Start (Cursor)

### 1. Clone and build

```bash
git clone https://github.com/FeiLiu-SOP/logshield-pro.git
cd logshield-pro
npm install
npm run build
```

### 2. Configure MCP

Add to your Cursor MCP settings (`mcp.json`):

```json
{
  "mcpServers": {
    "logshield-pro": {
      "command": "node",
      "args": ["/absolute/path/to/logshield-pro/dist/index.js"],
      "env": {
        "LOGSHIELD_LICENSE_KEY": "your-key-from-polar",
        "POLAR_ORGANIZATION_ID": "your-polar-organization-uuid"
      }
    }
  }
}
```

- `LOGSHIELD_LICENSE_KEY`: from your Polar purchase confirmation email or checkout success page
- `POLAR_ORGANIZATION_ID`: find in Polar Dashboard → Settings

Restart Cursor after saving.

### 3. Use

Ask the AI to sanitize logs, e.g.:

> Sanitize this log with sanitize_logs

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

## License

Professional use requires a paid license from [Logic Scale](https://polar.sh/logic-scale).
