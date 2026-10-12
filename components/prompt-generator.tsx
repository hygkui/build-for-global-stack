"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Sparkles } from "lucide-react"
import { TECH_STACKS, DEPLOYMENT_COMPAT } from "@/lib/tech-stacks"
import { type SelectedStack } from "@/components/tech-stack-selector"
import { cn } from "@/lib/utils"

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

  const useTanStarter = selected["starter"] === "tanstarter"
  const useMonorepo = selected["starter"] === "fullstack-monorepo"
  const useVoid = selected["deployment"] === "void"

  lines.push("\n## 项目要求\n")
  if (useTanStarter) {
    lines.push("1. 以 TanStarter（https://tanstarter.dev/）为起点，使用 `npx tanstarter-cli@latest create` 初始化，不要从零搭建 Next.js")
    lines.push("2. 框架使用 TanStack Start（TypeScript），部署在 Cloudflare Workers；数据库 Drizzle + D1，存储 R2，缓存 KV，认证 Better Auth，支付 Stripe / Creem / Waffo，邮件 Resend，UI 使用 Tailwind CSS v4 + shadcn/ui")
  } else if (useMonorepo) {
    lines.push("1. 初始化 pnpm workspace + Turborepo，目录为 apps/web（Next.js + Tailwind + shadcn/ui）、apps/admin（Vite + React + Arco Design）、apps/mobile（Expo + React Native）、apps/server（NestJS）、shared-types")
    lines.push("2. 后端使用 NestJS + Drizzle + Better Auth（nestjs-better-auth）+ @nestjs/schedule + @nestjs/websockets。支付用代收，不要在没有海外公司时接 Stripe。前端状态用 TanStack Query 管服务端数据，Zustand 管客户端状态")
    lines.push("3. 国际化：前端 react-i18next，后端 nestjs-i18n。端口：server=3000，web=3001，admin=3002，mobile=8081")
    lines.push("4. 用户站可以部署在 Vercel。NestJS 需要长时进程，放在 Railway 或 DigitalOcean，不要默认改成阿里云、AWS 或 Azure")
  } else if (useVoid) {
    lines.push("1. 使用 Vite 全栈应用（React、Vue、Svelte 或 Solid），不要改成 Next.js")
    lines.push("2. 接入 Void（https://void.cloud/），用 `void deploy` 部署到 Cloudflare Workers。D1、KV、R2、队列和 Cron 按代码引用开通")
  } else {
    lines.push("1. 使用 TypeScript + Next.js App Router")
    lines.push("2. 使用 Tailwind CSS + shadcn/ui 组件库")
  }
  lines.push("3. 实现完整的用户认证流程（注册 / 登录 / 退出）")
  lines.push("4. 包含完整的项目目录结构和配置文件")
  lines.push("5. 包含环境变量示例文件 (.env.example)")
  if (useVoid) {
    lines.push("6. Void 仍在内测，尚未完全开放。没有访问权限时不要假设已经能部署")
  }

  if (deployId && !useVoid) {
    const dep = TECH_STACKS.find((c) => c.id === "deployment")?.options.find((o) => o.id === deployId)
    if (dep) lines.push(`6. 包含 ${dep.name} 的部署配置文件`)
  }

  const paymentId = selected["payment"]
  if (paymentId === "creem" || paymentId === "waffo" || paymentId === "stripe" || paymentId === "polar" || paymentId === "lemonsqueezy") {
    lines.push("\n## 收款\n")
    lines.push("中国大陆个人或公司开不了 Stripe。卖到海外还要处理增值税，钱要能打回可用账户。")
    if (paymentId === "creem") {
      lines.push("使用 **Creem** 作为 Merchant of Record：由对方作为法律卖方收款、计算并缴纳增值税，再把净额打给卖家。")
      lines.push("- 接入 Creem Checkout 和 webhook，在 webhook 里开通用户权限")
      lines.push("- 开通前核对 Creem 当前支持的打款方式，不要假设一定能打到某一类账户")
    } else if (paymentId === "waffo") {
      lines.push("使用 **Waffo** 作为 Merchant of Record。其文档写明可打到中国大陆银行卡或支付宝，买家用国际卡付款。")
      lines.push("- 接入 Waffo 结账和 webhook，在 webhook 里开通用户权限")
    } else if (paymentId === "stripe") {
      lines.push("使用 **Stripe**。仅在已有香港、美国或新加坡等受支持地区的公司时使用。")
      lines.push("- 不要为了验证一个点子先去注册海外公司")
    } else if (paymentId === "polar") {
      lines.push("Polar 的打款走 Stripe。没有 Stripe 可用地区的主体时不要选它，钱打不回来。")
    } else if (paymentId === "lemonsqueezy") {
      lines.push("Lemon Squeezy 不支持打到中国大陆，并且在并入不接收中国大陆卖家的 Stripe 方案。不要把它当作出海收款方案。")
    }
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
        if (useMonorepo) {
          lines.push("- 在 `apps/server` 使用 `@nestjs/schedule`，用 Cron 装饰器注册定时任务")
          lines.push("- 不要再写一套 Next.js `app/api/cron`")
        } else {
          lines.push("- 在 `lib/cron.ts` 中使用 `node-cron` 或 `bull` 注册定时任务")
          lines.push("- 在应用启动时初始化 cron 调度器")
          lines.push("- 注意：仅适用于长时运行服务（Railway / DigitalOcean）")
        }
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
        if (useMonorepo) {
          lines.push("- 在 `apps/server` 使用 `@nestjs/websockets` 建 Gateway")
          lines.push("- 不要把 WebSocket 挂到 Next.js 自定义 server 上")
        } else {
          lines.push("- 使用 `ws` 或 `Socket.io` 库创建 WebSocket 服务器")
          lines.push("- 在 `server.ts` 中自定义 Next.js HTTP server 并挂载 WS")
          lines.push("- 注意：仅适用于长时运行服务（Railway / DigitalOcean）")
        }
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
  if (useMonorepo) {
    lines.push("- 根目录 `pnpm-workspace.yaml`、`turbo.json`、`package.json`")
    lines.push("- `apps/server`：NestJS 模块、Drizzle schema、Better Auth、Stripe webhook、Cron、WebSocket")
    lines.push("- `apps/web`：Next.js 用户站（首页、登录、注册）")
    lines.push("- `apps/admin`：Arco Design 登录与表格页")
    lines.push("- `apps/mobile`：Expo 首页")
    lines.push("- `shared-types`：User、Order 等共享类型")
    lines.push("- 各应用的环境变量示例，不要提交真实密钥")
    lines.push("- `README.md` 写明安装、数据库迁移和四个端口")
  } else if (useVoid) {
    lines.push("- Vite 项目：`vite.config.ts`、页面、服务端路由、`void.json`")
    lines.push("- 用 Void 插件接入数据库、KV 和对象存储，不要手写一套 Workers 绑定")
    lines.push("- 环境变量示例，不要提交真实密钥")
    lines.push("- `README.md` 写明如何申请内测，以及 `void deploy` 的步骤")
  } else {
    lines.push("- `package.json` 包含所有必要依赖")
    lines.push("- `app/` 目录下的基础页面（首页、登录、注册、仪表盘）")
    lines.push("- `lib/` 目录下的数据库连接和工具函数")
    lines.push("- `components/` 目录下的共享组件")
    lines.push("- `.env.example` 环境变量示例")
    lines.push("- `README.md` 包含快速启动说明")
  }
  if (dockerId && dockerId !== "no-docker") {
    lines.push("- `Dockerfile` multi-stage 生产镜像")
    if (dockerId === "docker-compose") lines.push("- `docker-compose.yml` 完整服务编排")
    lines.push("- `.dockerignore` 排除不必要文件")
  }

  lines.push("\n## 最佳实践\n")
  if (useTanStarter) {
    lines.push("- 在 TanStarter 现有目录和命名上扩展，保持 Cloudflare 绑定（D1 / R2 / KV）不变")
    lines.push("- 表单和数据突变走 TanStack Start 的 server function，不要引入 Next.js Server Actions")
  } else if (useMonorepo) {
    lines.push("- 共享类型只放在 shared-types。业务 Hooks 可以跨 web / admin / mobile 复用，UI 不要硬套同一套组件")
    lines.push("- ORM 优先 Drizzle。定时任务用 @nestjs/schedule，实时通信用 @nestjs/websockets，不要再套一层 Next.js Server Actions")
    lines.push("- 这套结构给中大型和多端。如果只是小型 MVP，停下来改用单个 Next.js 应用")
  } else if (useVoid) {
    lines.push("- 保持 Vite 项目结构，部署只走 `void deploy`")
    lines.push("- 资源用 Void 的导入方式声明，不要让用户先去 Cloudflare 控制台手工建 D1 / R2 / KV")
  } else {
    lines.push("- 使用服务器组件（RSC）减少客户端 JavaScript")
    lines.push("- 使用 Server Actions 处理表单和数据突变")
  }
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
        <p className="text-sm font-medium text-muted-foreground">先选一个目标</p>
        <p className="mt-1 text-xs text-muted-foreground/70">选中后按推荐组合生成提示词</p>
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
    </div>
  )
}
