import { NextRequest, NextResponse } from "next/server"
import { TECH_STACKS, DEPLOYMENT_COMPAT } from "@/lib/tech-stacks"
import { PRIMARY_GOALS, STRUCTURE_GOAL, ENTERPRISE_GOALS } from "@/lib/recommendations"
import { generateAgentsMd } from "@/lib/agents-md"
import { generateTemplateFiles } from "@/lib/template-generator"
import { SKILL_MD } from "@/lib/agent-skill"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id",
}

const ALL_GOALS = [...PRIMARY_GOALS, STRUCTURE_GOAL, ...ENTERPRISE_GOALS]

const MCP_TOOLS = [
  {
    name: "list_goals",
    description:
      "List recommended出海 (China-to-Global) architecture stages and their pre-configured tech stacks.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "list_tech_options",
    description:
      "List all 14 tech stack categories, options, official documentation URLs, and the deployment compatibility matrix.",
    inputSchema: {
      type: "object",
      properties: {
        categoryId: {
          type: "string",
          description: "Optional category id filter (e.g. deployment, payment, database, auth).",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "check_compatibility",
    description:
      "Check a tech stack selection for Deployment/Docker/Cron/WebSocket/D1 conflicts and China-to-Global payment caveats.",
    inputSchema: {
      type: "object",
      properties: {
        stack: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "Map of categoryId -> optionId, e.g. { deployment: 'vercel', payment: 'creem' }",
        },
      },
      required: ["stack"],
      additionalProperties: false,
    },
  },
  {
    name: "generate_project_bundle",
    description:
      "Generate AGENTS.md and starter project files (package.json, .env.example, webhooks, Dockerfile, README.md) from a goalId or custom stack.",
    inputSchema: {
      type: "object",
      properties: {
        goalId: {
          type: "string",
          description: "Optional preset goal id (ship-fast, cost-less, void-vite, full-product, etc.).",
        },
        stack: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "Optional custom stack overrides.",
        },
        projectName: { type: "string", description: "Project name / slug." },
        businessType: { type: "string", description: "Business type (e.g. SaaS 订阅产品, AI 工具站)." },
        languages: {
          type: "array",
          items: { type: "string" },
          description: "Target customer languages, e.g. ['en', 'zh'].",
        },
      },
      additionalProperties: false,
    },
  },
]

function evaluateCompatibility(stack: Record<string, string>) {
  const issues: { severity: "error" | "warning"; message: string; suggestion?: string }[] = []
  const deployId = stack["deployment"]
  const dbId = stack["database"]
  const dockerId = stack["docker"]
  const cronId = stack["cron"]
  const wsId = stack["websocket"]
  const paymentId = stack["payment"]

  if (dbId === "d1" && deployId && deployId !== "cloudflare" && deployId !== "void") {
    issues.push({
      severity: "warning",
      message: "Cloudflare D1 requires Cloudflare Workers or Void deployment.",
      suggestion: "Switch deployment to cloudflare or use neon / postgres.",
    })
  }

  if (paymentId === "stripe" || paymentId === "polar" || paymentId === "lemonsqueezy") {
    issues.push({
      severity: "warning",
      message: `${paymentId} requires an overseas legal entity (HK/US/SG) or does not settle to mainland China.`,
      suggestion: "For mainland China founders without an overseas company, use Creem or Waffo (MoR).",
    })
  }

  if (deployId && DEPLOYMENT_COMPAT[deployId]) {
    const compat = DEPLOYMENT_COMPAT[deployId]
    if (dockerId && dockerId !== "no-docker" && !compat.supportsDocker) {
      issues.push({
        severity: "error",
        message: `${deployId} does not support Docker deployments.`,
        suggestion: compat.dockerNote,
      })
    }
    if (cronId === "node-cron" && !compat.supportsDocker) {
      issues.push({
        severity: "error",
        message: "node-cron requires a long-running process and is incompatible with serverless platforms.",
        suggestion: "Use native-cron or Upstash QStash.",
      })
    }
    if (wsId === "native-ws" && !compat.supportsDocker) {
      issues.push({
        severity: "error",
        message: "Native WebSocket servers require a long-running process.",
        suggestion: compat.wsNote,
      })
    }
    if (wsId === "cf-durable-objects" && deployId !== "cloudflare") {
      issues.push({
        severity: "error",
        message: "Cloudflare Durable Objects only run on Cloudflare Workers.",
        suggestion: "Switch deployment to cloudflare or use Ably / Pusher / SSE.",
      })
    }
  }

  return {
    compatible: issues.every((item) => item.severity !== "error"),
    issues,
  }
}

function jsonRpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, { headers: CORS_HEADERS })
}

function jsonRpcError(id: unknown, code: number, message: string) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    { status: 400, headers: CORS_HEADERS }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  return NextResponse.json(
    {
      name: "build-for-global-mcp",
      version: "1.0.0",
      protocol: "MCP JSON-RPC 2.0 (Streamable HTTP)",
      endpoint: "/api/mcp",
      skillUrl: "/skill.md",
      tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
    },
    { headers: CORS_HEADERS }
  )
}

export async function POST(req: NextRequest) {
  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return jsonRpcError(null, -32700, "Parse error: invalid JSON")
  }

  const { id = null, method, params = {} } = body

  if (!method) {
    return jsonRpcError(id, -32600, "Invalid Request: missing method")
  }

  if (method === "initialize") {
    return jsonRpcResult(id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
        resources: {},
      },
      serverInfo: {
        name: "build-for-global-mcp",
        version: "1.0.0",
      },
    })
  }

  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 202, headers: CORS_HEADERS })
  }

  if (method === "ping") {
    return jsonRpcResult(id, {})
  }

  if (method === "tools/list") {
    return jsonRpcResult(id, { tools: MCP_TOOLS })
  }

  if (method === "resources/list") {
    return jsonRpcResult(id, {
      resources: [
        {
          uri: "build-for-global://skill",
          name: "Build for Global Agent Skill",
          mimeType: "text/markdown",
        },
      ],
    })
  }

  if (method === "resources/read") {
    const uri = params.uri as string | undefined
    if (uri === "build-for-global://skill") {
      return jsonRpcResult(id, {
        contents: [{ uri, mimeType: "text/markdown", text: SKILL_MD }],
      })
    }
    return jsonRpcError(id, -32602, `Unknown resource uri: ${uri}`)
  }

  if (method === "tools/call") {
    const toolName = params.name as string | undefined
    const args = (params.arguments as Record<string, unknown> | undefined) ?? {}

    if (toolName === "list_goals") {
      return jsonRpcResult(id, {
        content: [{ type: "text", text: JSON.stringify(ALL_GOALS, null, 2) }],
      })
    }

    if (toolName === "list_tech_options") {
      const categoryId = args.categoryId as string | undefined
      const categories = categoryId
        ? TECH_STACKS.filter((c) => c.id === categoryId)
        : TECH_STACKS
      return jsonRpcResult(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify({ categories, deploymentCompatibility: DEPLOYMENT_COMPAT }, null, 2),
          },
        ],
      })
    }

    if (toolName === "check_compatibility") {
      const stack = (args.stack as Record<string, string> | undefined) ?? {}
      const report = evaluateCompatibility(stack)
      return jsonRpcResult(id, {
        content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
      })
    }

    if (toolName === "generate_project_bundle") {
      const goalId = args.goalId as string | undefined
      const preset = goalId ? ALL_GOALS.find((g) => g.id === goalId)?.stack ?? {} : {}
      const customStack = (args.stack as Record<string, string> | undefined) ?? {}
      const mergedStack = { ...preset, ...customStack }
      if (Object.keys(mergedStack).length === 0) {
        Object.assign(mergedStack, PRIMARY_GOALS[0].stack)
      }

      const files = generateTemplateFiles(mergedStack, {
        projectName: args.projectName as string | undefined,
        businessType: args.businessType as string | undefined,
        languages: args.languages as string[] | undefined,
      })

      const agentsMd = generateAgentsMd(mergedStack)
      const compatibility = evaluateCompatibility(mergedStack)

      return jsonRpcResult(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                stack: mergedStack,
                compatibility,
                agentsMd,
                fileCount: Object.keys(files).length,
                files,
              },
              null,
              2
            ),
          },
        ],
      })
    }

    return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`)
  }

  return jsonRpcError(id, -32601, `Method not found: ${method}`)
}
