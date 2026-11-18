export const SKILL_MD = `---
name: build-for-global
description: Recommend global-ready tech stacks, validate deployment/cron/websocket/docker compatibility, and generate starter code + AGENTS.md for Chinese founders building products for overseas customers.
---

# Build for Global (出海黄金组合) — Agent Skill

Use this skill when helping a user (especially founders or developers in China) architect, validate, or bootstrap a web/SaaS/B2B product for international customers.

## Endpoints

- **MCP Server (Streamable HTTP / JSON-RPC 2.0)**: \`POST /api/mcp\`
- **Skill Markdown**: \`GET /skill.md\`

## Available MCP Tools

1. \`list_goals\`
   - Returns curated stage presets (\`ship-fast\`, \`cost-less\`, \`void-vite\`, \`full-product\`, and enterprise cloud options).
2. \`list_tech_options\`
   - Returns all 14 tech stack categories (\`starter\`, \`deployment\`, \`cron\`, \`websocket\`, \`docker\`, \`database\`, \`orm\`, \`storage\`, \`auth\`, \`payment\`, \`email\`, \`cache\`, \`monitoring\`, \`i18n\`) and the \`DEPLOYMENT_COMPAT\` matrix.
3. \`check_compatibility\`
   - Input: \`{ stack: Record<string, string> }\`
   - Validates deployment vs. Docker, Cron, WebSocket, Cloudflare D1, and China-to-Global payment constraints (e.g., warning if \`stripe\`, \`polar\`, or \`lemonsqueezy\` is chosen without an overseas legal entity).
4. \`generate_project_bundle\`
   - Input: \`{ goalId?: string, stack?: Record<string, string>, projectName?: string, businessType?: string, languages?: string[] }\`
   - Output: Full \`AGENTS.md\` engineering specification and a complete map of starter files (\`package.json\`, \`.env.example\`, database/auth/payment webhook stubs, \`Dockerfile\`, \`README.md\`).

## Core Rules for China-to-Global Builders

1. **Payments First (MoR over Stripe)**: Mainland China individuals and companies cannot open Stripe accounts directly. Recommend **Creem** or **Waffo** (Merchant of Record) by default unless the user explicitly has a Hong Kong, US, or Singapore entity.
2. **No ICP Filing Needed for Overseas**: Deploy to **Vercel**, **Cloudflare Workers**, or **Railway** with an overseas domain registrar (Cloudflare Registrar / Porkbun) when targeting global users.
3. **Compatibility**:
   - Serverless platforms (Vercel, Cloudflare Workers, Deno Deploy) do **not** support Docker or \`node-cron\`.
   - Vercel does **not** support native persistent WebSockets (use SSE, Ably, Pusher, or Supabase Realtime).
   - Cloudflare D1 requires Cloudflare Workers or Void deployment.
`
