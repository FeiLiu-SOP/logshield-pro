# Copy this into Polar → Benefits → Custom Benefit → Private note

**Description (title customers see):** Getting Started

**Private note (Markdown below):**

---

## Welcome to LogShield-Pro Professional

Your license key is shown above. Follow these steps:

### 1. Install

```bash
git clone https://github.com/FeiLiu-SOP/logshield-pro.git
cd logshield-pro
npm install
npm run build
npm link
```

Requires **Node.js 18+**.

### 2. Set your license key

**Windows (PowerShell):**
```powershell
$env:LOGSHIELD_LICENSE_KEY = "PASTE-YOUR-LS-PRO-KEY-HERE"
```

**macOS / Linux:**
```bash
export LOGSHIELD_LICENSE_KEY="PASTE-YOUR-LS-PRO-KEY-HERE"
```

### 3. Sanitize logs (recommended)

```bash
# Copy raw log → run → paste clean log into Cursor
logshield sanitize --clipboard
```

Or sanitize a file:
```bash
logshield sanitize app.log
```

### 4. Optional: Cursor MCP

Add to `%USERPROFILE%\.cursor\mcp.json` (Windows) or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "logshield-pro": {
      "command": "node",
      "args": ["C:/path/to/logshield-pro/dist/index.js"],
      "env": {
        "LOGSHIELD_LICENSE_KEY": "PASTE-YOUR-LS-PRO-KEY-HERE"
      }
    }
  }
}
```

Restart Cursor after saving.

---

**Docs:** https://github.com/FeiLiu-SOP/logshield-pro  
**Support:** f.liu.tech.arch@gmail.com
