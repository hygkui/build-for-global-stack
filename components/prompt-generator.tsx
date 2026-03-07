"use client"

import { useState, useEffect } from "react"
import { Copy, Check, ArrowRight, Sparkles, Download, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TECH_STACKS, DEPLOYMENT_COMPAT } from "@/lib/tech-stacks"
import { type SelectedStack } from "@/components/tech-stack-selector"
import { cn } from "@/lib/utils"
import Link from "next/link"

function generatePrompt(selected: SelectedStack): string {
  if (Object.keys(selected).length === 0) return ""

  const lines: string[] = []
  const deployId = selected["deployment"]
  const cronId = selected["cron"]
  const wsId = selected["websocket"]
  const dockerId = selected["docker"]
  const compat = deployId ? DEPLOYMENT_COMPAT[deployId] : undefined

  lines.push("# 项目初始化提示词（出海 SaaS 技术栈）\n")
  lines.push("请帮我创建一个面向海外市场的 SaaS 项目，使用以下技术栈：\n")

  lines.push("## 技术栈要求\n")

  for (const category of TECH_STACKS) {
    const optionId = selected[category.id]
    if (!optionId) continue
    const option = category.options.find((o) => o.id === optionId)
    if (!option) continue
    lines.push(`- **${category.name}**: ${option.name} — ${option.description}`)
  }

  lines.push("\n## 项目要求\n")
  lines.push("1. 使用 TypeScript + Next.js App Router")
  lines.push("2. 使用 Tailwind CSS + shadcn/ui 组件库")
  lines.push("3. 实现完整的用户认证流程（注册 / 登录 / 退出）")
  lines.push("4. 包含完整的项目目录结构和配置文件")
  lines.push("5. 包含环境变量示例文件 (.env.example)")

  if (deployId) {
    const dep = TECH_STACKS.find((c) => c.id === "deployment")?.options.find((o) => o.id === deployId)
    if (dep) lines.push(`6. 包含 ${dep.name} 的部署配置文件`)
  }

  // Cron 配置说明
  if (cronId && cronId !== "native-cron") {
    lines.push("\n## Cron 定时任务配置\n")
    const cronOption = TECH_STACKS.find((c) => c.id === "cron")?.options.find((o) => o.id === cronId)
    if (cronOption) {
      lines.push(`使用 **${cronOption.name}** 实现定时任务。`)
      if (cronId === "qstash") {
        lines.push("- 在 `app/api/cron/` 目录下创建定时任务处理路由")
        lines.push("- 使用 `@upstash/qstash` SDK 注册定时任务")
        lines.push("- 在 `.env.example` 中添加 `QSTASH_TOKEN`、`QSTASH_CURRENT_SIGNING_KEY`、`QSTASH_NEXT_SIGNING_KEY`")
        lines.push("- 在路由中验证 QStash 签名：`import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'`")
      } else if (cronId === "github-actions-cron") {
        lines.push("- 在 `.github/workflows/cron.yml` 中创建 schedule 触发的 workflow")
        lines.push("- workflow 通过 HTTP 请求调用项目的 API 端点触发任务")
        lines.push("- API 端点需验证 `CRON_SECRET` 环境变量防止未授权访问")
      } else if (cronId === "db-cloud-function") {
        lines.push("- 在 Supabase Dashboard > Database > Extensions 中启用 `pg_cron`")
        lines.push("- 创建 Supabase Edge Function 处理定时逻辑")
        lines.push("- 使用 `cron.schedule()` 在数据库层触发 Edge Function")
      } else if (cronId === "node-cron") {
        lines.push("- 在 `lib/cron.ts` 中使用 `node-cron` 或 `bull` 注册定时任务")
        lines.push("- 在应用启动时初始化 cron 调度器")
        lines.push("- 注意：仅适用于长时运行服务（Railway / Docker / VPS）")
      }
    }
  } else if (cronId === "native-cron" && deployId) {
    lines.push("\n## Cron 定时任务配置\n")
    if (deployId === "vercel") {
      lines.push("使用 **Vercel Cron Jobs** 实现定时任务。")
      lines.push("- 在 `vercel.json` 中配置 crons 字段")
      lines.push("- 在 `app/api/cron/` 下创建定时任务路由")
      lines.push("- 路由中验证 `CRON_SECRET` 环境变量")
    } else if (deployId === "cloudflare") {
      lines.push("使用 **Cloudflare Cron Triggers** 实现定时任务。")
      lines.push("- 在 `wrangler.toml` 中配置 `[triggers] crons` 字段")
      lines.push("- 在 Worker 入口实现 `scheduled()` handler")
    } else if (deployId === "deno") {
      lines.push("使用 **Deno.cron()** 实现定时任务。")
      lines.push("- 在主入口文件中调用 `Deno.cron('task-name', '*/5 * * * *', handler)`")
    }
  }

  // WebSocket / 实时通信配置说明
  if (wsId) {
    lines.push("\n## WebSocket / 实时通信配置\n")
    const wsOption = TECH_STACKS.find((c) => c.id === "websocket")?.options.find((o) => o.id === wsId)
    if (wsOption) {
      lines.push(`使用 **${wsOption.name}** 实现实时通信。`)
      if (wsId === "supabase-realtime") {
        lines.push("- 使用 `supabase.channel()` 订阅数据库表变更")
        lines.push("- 在 `hooks/use-realtime.ts` 封装订阅逻辑")
        lines.push("- 示例：`supabase.channel('table').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, callback).subscribe()`")
      } else if (wsId === "ably") {
        lines.push("- 在 `.env.example` 中添加 `ABLY_API_KEY`")
        lines.push("- 创建 `app/api/ably-token/route.ts` 签发客户端令牌")
        lines.push("- 在 `hooks/use-ably.ts` 封装频道订阅逻辑")
        lines.push("- 使用 `@ably/ably-js` 或 `ably` npm 包")
      } else if (wsId === "pusher") {
        lines.push("- 在 `.env.example` 中添加 `PUSHER_APP_ID`、`PUSHER_KEY`、`PUSHER_SECRET`、`NEXT_PUBLIC_PUSHER_KEY`")
        lines.push("- 创建 `app/api/pusher/auth/route.ts` 处理私有频道认证")
        lines.push("- 使用 `pusher` 服务端 SDK 推送事件，`pusher-js` 客户端订阅")
      } else if (wsId === "sse") {
        lines.push("- 创建 `app/api/events/route.ts`，使用 `ReadableStream` 发送 SSE 事件")
        lines.push("- 客户端使用 `EventSource` API 订阅")
        lines.push("- 注意：SSE 为单向推送，适合通知、状态更新等场景")
      } else if (wsId === "cf-durable-objects") {
        lines.push("- 创建 Durable Object 类实现 WebSocket 服务端逻辑")
        lines.push("- 在 `wrangler.toml` 中声明 Durable Object 绑定")
        lines.push("- 使用 Hibernation WebSocket API 降低空闲成本")
      } else if (wsId === "native-ws") {
        lines.push("- 使用 `ws` 或 `Socket.io` 库创建 WebSocket 服务器")
        lines.push("- 在 `server.ts` 中自定义 Next.js HTTP server 并挂载 WS")
        lines.push("- 注意：仅适用于长时运行服务（Railway / Docker / VPS）")
      }
    }
  }

  // Docker 配置说明
  if (dockerId && dockerId !== "no-docker") {
    lines.push("\n## Docker 打包配置\n")
    if (dockerId === "dockerfile-only") {
      lines.push("生成 **multi-stage Dockerfile**：")
      lines.push("- Stage 1（deps）：安装 node_modules")
      lines.push("- Stage 2（builder）：构建 Next.js 应用")
      lines.push("- Stage 3（runner）：最小化生产镜像，使用 `node:20-alpine`")
      lines.push("- 配置 `NEXT_TELEMETRY_DISABLED=1` 和 `NODE_ENV=production`")
      lines.push("- 在 `next.config.mjs` 中设置 `output: 'standalone'`")
    } else if (dockerId === "docker-compose") {
      lines.push("生成 **Dockerfile + docker-compose.yml**：")
      lines.push("- `Dockerfile`：multi-stage 构建，`output: 'standalone'`")
      lines.push("- `docker-compose.yml`：包含以下服务：")
      lines.push("  - `app`：Next.js 应用，端口 3000")
      if (selected["database"] === "neon" || selected["database"] === "supabase") {
        lines.push("  - （数据库使用托管服务，无需本地容器）")
      } else {
        lines.push("  - `db`：PostgreSQL 数据库容器")
      }
      if (selected["cache"]) {
        lines.push("  - `redis`：Redis 缓存容器（如使用本地 Redis）")
      }
      lines.push("- `docker-compose.override.yml`：本地开发覆盖配置（挂载源码、热更新）")
      lines.push("- `.dockerignore`：排除 node_modules / .next / .env")
    }
  }

  lines.push("\n## 项目结构\n")
  lines.push("请生成以下内容：")
  lines.push("- `package.json` 包含所有必要依赖")
  lines.push("- `app/` 目录下的基础页面（首页、登录、注册、仪表盘）")
  lines.push("- `lib/` 目录下的数据库连接和工具函数")
  lines.push("- `components/` 目录下的共享组件")
  lines.push("- `.env.example` 环境变量示例")
  lines.push("- `README.md` 包含快速启动说明")
  if (dockerId && dockerId !== "no-docker") {
    lines.push("- `Dockerfile` multi-stage 生产镜像")
    if (dockerId === "docker-compose") lines.push("- `docker-compose.yml` 完整服务编排")
    lines.push("- `.dockerignore` 排除不必要文件")
  }

  lines.push("\n## 最佳实践\n")
  lines.push("- 使用服务器组件（RSC）减少客户端 JavaScript")
  lines.push("- 使用 Server Actions 处理表单和数据突变")
  lines.push("- 实现正确的错误处理和 Loading 状态")
  lines.push("- 支持深色模式")
  lines.push("- SEO 优化（metadata、og:image）")
  lines.push("- 国际化友好（i18n ready），参考项目根目录 AGENTS.md 中的 i18n 规范")
  if (compat && !compat.supportsDocker && dockerId && dockerId !== "no-docker") {
    lines.push("\n> ⚠️ 警告：当前部署平台不支持 Docker，请检查技术栈兼容性后再生成。")
  }

  return lines.join("\n")
}

interface PromptGeneratorProps {
  selected: SelectedStack
}

export function PromptGenerator({ selected }: PromptGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [copied, setCopied] = useState(false)
  const selectedCount = Object.keys(selected).length

  useEffect(() => {
    setPrompt(generatePrompt(selected))
  }, [selected])

  const handleCopy = async () => {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (selectedCount === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">在左侧选择你的技术栈</p>
        <p className="mt-1 text-xs text-muted-foreground/70">选择后自动生成项目初始化提示词</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 提示词预览 */}
      <div className="relative rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
            </div>
            <span className="font-mono text-xs text-muted-foreground">prompt.md</span>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all",
              copied
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {copied ? (
              <><Check className="h-3 w-3" />已复制</>
            ) : (
              <><Copy className="h-3 w-3" />复制</>
            )}
          </button>
        </div>
        <pre className="max-h-[480px] overflow-y-auto p-4 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {prompt}
        </pre>
      </div>

      {/* 使用说明 */}
      <p className="text-center text-xs text-muted-foreground">
        复制提示词后，粘贴到{" "}
        <span className="text-foreground">v0.dev</span>、
        <span className="text-foreground">Cursor</span> 或{" "}
        <span className="text-foreground">Claude</span> 中即可生成项目
      </p>

      {/* 升级引导 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">想要直接获得可运行的代码？</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/pricing" className="flex-1">
            <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 transition-all hover:border-primary/60 hover:bg-primary/20">
              <Download className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">$20 · 下载完整代码包</p>
                <p className="text-xs text-muted-foreground">完整可运行项目，一键部署</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
          <Link href="/pricing" className="flex-1">
            <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-all hover:border-border/80 hover:bg-secondary/60">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">$200 · MVP 外包开发</p>
                <p className="text-xs text-muted-foreground">专业团队 1 对 1 交付</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
