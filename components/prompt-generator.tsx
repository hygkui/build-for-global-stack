"use client"

import { useState, useMemo, useEffect } from "react"
import { zipSync, strToU8 } from "fflate"
import {
  Copy,
  Check,
  Download,
  FileCode2,
  FileText,
  FolderArchive,
  Info,
  ListChecks,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TECH_STACKS, DEPLOYMENT_COMPAT } from "@/lib/tech-stacks"
import { generateAgentsMd } from "@/lib/agents-md"
import { generateTemplateFiles } from "@/lib/template-generator"
import { type SelectedStack } from "@/components/tech-stack-selector"
import { cn } from "@/lib/utils"

export interface ProjectContext {
  projectName: string
  businessType: string
  languages: string[]
}

const CHECKLIST_STORAGE_KEY = "build-for-global:checklist:v1"

function generatePrompt(selected: SelectedStack, ctx?: ProjectContext): string {
  if (Object.keys(selected).length === 0) return ""

  const lines: string[] = []
  const deployId = selected["deployment"]
  const cronId = selected["cron"]
  const wsId = selected["websocket"]
  const dockerId = selected["docker"]
  const compat = deployId ? DEPLOYMENT_COMPAT[deployId] : undefined

  const projectName = ctx?.projectName?.trim() || "my-global-saas"
  const businessType = ctx?.businessType?.trim() || "SaaS 订阅产品"
  const languages = ctx?.languages?.length ? ctx.languages.join(", ") : "en, zh"

  lines.push(`# 项目初始化提示词：${projectName}（${businessType}）\n`)
  lines.push(`请帮我创建一个面向海外市场客户的「${businessType}」项目（项目名：\`${projectName}\`，目标语言：${languages}），使用以下技术栈：\n`)

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
  lines.push(`6. 面向海外用户：默认语言 ${languages}，包含 Privacy Policy、Terms of Service、Refund Policy 基础页面与 SEO metadata`)
  if (useVoid) {
    lines.push("7. Void 仍在内测，尚未完全开放。没有访问权限时不要假设已经能部署")
  }

  if (deployId && !useVoid) {
    const dep = TECH_STACKS.find((c) => c.id === "deployment")?.options.find((o) => o.id === deployId)
    if (dep) lines.push(`7. 包含 ${dep.name} 的部署配置文件`)
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

  if (cronId && cronId !== "native-cron") {
    lines.push("\n## Cron 定时任务配置\n")
    const cronOption = TECH_STACKS.find((c) => c.id === "cron")?.options.find((o) => o.id === cronId)
    if (cronOption) {
      lines.push(`使用 **${cronOption.name}** 实现定时任务。`)
    }
  } else if (cronId === "native-cron" && deployId) {
    lines.push("\n## Cron 定时任务配置\n")
    if (deployId === "vercel") lines.push("使用 **Vercel Cron Jobs**（`vercel.json` + `CRON_SECRET`）。")
    else if (deployId === "cloudflare") lines.push("使用 **Cloudflare Cron Triggers**（`wrangler.toml` + `scheduled()`）。")
    else if (deployId === "deno") lines.push("使用 **Deno.cron()**。")
  }

  if (wsId) {
    lines.push("\n## WebSocket / 实时通信配置\n")
    const wsOption = TECH_STACKS.find((c) => c.id === "websocket")?.options.find((o) => o.id === wsId)
    if (wsOption) lines.push(`使用 **${wsOption.name}** 实现实时通信。`)
  }

  if (dockerId && dockerId !== "no-docker") {
    lines.push("\n## Docker 打包配置\n")
    lines.push(
      dockerId === "dockerfile-only"
        ? "生成 **multi-stage Dockerfile**（`output: 'standalone'` + `node:20-alpine`）。"
        : "生成 **Dockerfile + docker-compose.yml** 完整服务编排。"
    )
  }

  lines.push("\n## 最佳实践\n")
  if (useTanStarter) {
    lines.push("- 在 TanStarter 现有目录和命名上扩展，保持 Cloudflare 绑定（D1 / R2 / KV）不变")
  } else if (useMonorepo) {
    lines.push("- 共享类型只放在 shared-types，业务 Hooks 可跨端复用")
  } else if (useVoid) {
    lines.push("- 保持 Vite 项目结构，部署只走 `void deploy`")
  } else {
    lines.push("- 使用服务器组件（RSC）与 Server Actions 处理数据")
  }
  lines.push("- 实现正确的错误处理和 Loading 状态")
  lines.push("- SEO 优化（metadata、sitemap.xml、og:image、hreflang）")
  lines.push("- 国际化友好（i18n ready），参考项目根目录 AGENTS.md 中的 i18n 规范")
  if (compat && !compat.supportsDocker && dockerId && dockerId !== "no-docker") {
    lines.push("\n> ⚠️ 警告：当前部署平台不支持 Docker，请检查技术栈兼容性后再生成。")
  }

  return lines.join("\n")
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type ExportTab = "prompt" | "agents" | "zip" | "checklist"

interface PromptGeneratorProps {
  selected: SelectedStack
  projectContext?: ProjectContext
}

export function PromptGenerator({ selected, projectContext }: PromptGeneratorProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>("prompt")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) setCheckedItems(JSON.parse(saved))
    } catch {}
  }, [])

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const selectedCount = Object.keys(selected).length
  const prompt = useMemo(() => generatePrompt(selected, projectContext), [selected, projectContext])
  const agentsMd = useMemo(() => generateAgentsMd(selected), [selected])
  const templateFiles = useMemo(
    () =>
      generateTemplateFiles(selected, {
        projectName: projectContext?.projectName,
        businessType: projectContext?.businessType,
        languages: projectContext?.languages,
      }),
    [selected, projectContext]
  )
  const fileNames = useMemo(() => Object.keys(templateFiles), [templateFiles])
  const [previewFile, setPreviewFile] = useState<string>("package.json")

  const activePreviewFile = fileNames.includes(previewFile) ? previewFile : fileNames[0] ?? "README.md"

  const isCustomScaffold =
    selected["starter"] === "tanstarter" ||
    selected["starter"] === "fullstack-monorepo" ||
    selected["deployment"] === "void"

  const checklist = useMemo(() => {
    const paymentId = selected["payment"]
    const deployId = selected["deployment"]
    return [
      {
        id: "domain",
        title: "注册海外域名并托管 DNS 至 Cloudflare",
        detail: "推荐使用 Cloudflare Registrar 或 Porkbun，避免国内实名/备案卡住海外上线节奏。",
      },
      {
        id: "payment",
        title:
          paymentId === "stripe"
            ? "确认海外主体（香港/美国/新加坡）及 Stripe 账户审核"
            : "注册并核验 MoR 代收账号（Creem / Waffo）的打款渠道",
        detail:
          paymentId === "stripe"
            ? "中国大陆主体无法开通 Stripe，需使用合规海外主体与对应对公银行账户。"
            : "确认个人/企业收款方式及 Webhook 签名密钥，先用测试模式跑通完整下单流程。",
      },
      {
        id: "email",
        title: "配置域名邮箱与 Resend（SPF / DKIM / DMARC）",
        detail: "确保海外客户的注册验证码、发票和通知邮件进入 Gmail / Outlook 收件箱而非垃圾箱。",
      },
      {
        id: "legal",
        title: "补齐 Privacy Policy、Terms of Service 与 Refund Policy",
        detail: "欧美支付审核（Creem / Stripe）和海外用户信任的硬性前置条件。",
      },
      {
        id: "seo",
        title: `配置多语言 SEO（${(projectContext?.languages ?? ["en"]).join(" / ")}）与 OG 图`,
        detail: "添加 sitemap.xml、robots.txt、canonical 与各语言 hreflang 标签。",
      },
      {
        id: "deploy",
        title: `完成 ${deployId ?? "生产环境"} 环境变量与监控告警配置`,
        detail: "将 .env.example 中的密钥安全填入平台控制台，接入 Sentry / PostHog 观察首周转化。",
      },
    ]
  }, [selected, projectContext])

  const completedChecklistCount = checklist.filter((item) => checkedItems[item.id]).length

  const handleCopy = async (key: string, text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDownloadZip = () => {
    const slug =
      (projectContext?.projectName ?? "my-global-saas")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "") || "my-global-saas"

    const zipInput: Record<string, Uint8Array> = {}
    for (const [path, content] of Object.entries(templateFiles)) {
      zipInput[`${slug}/${path}`] = strToU8(content)
    }
    const zipped = zipSync(zipInput, { level: 6 })
    const buffer = new Uint8Array(zipped).buffer
    const blob = new Blob([buffer], { type: "application/zip" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${slug}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (selectedCount === 0 || !prompt) return null

  const tabs: { id: ExportTab; label: string; icon: React.ReactNode }[] = [
    { id: "prompt", label: "AI 提示词", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "agents", label: "AGENTS.md", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "zip", label: `代码模板 (${fileNames.length})`, icon: <FolderArchive className="h-3.5 w-3.5" /> },
    { id: "checklist", label: `上线清单 (${completedChecklistCount}/${checklist.length})`, icon: <ListChecks className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-secondary/30 p-1.5 sm:flex sm:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "prompt" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={() => handleCopy("prompt", prompt)} aria-live="polite">
              {copiedKey === "prompt" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedKey === "prompt" ? "已复制提示词" : "复制 AI 提示词"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadTextFile("prompt.md", prompt)}
            >
              <Download className="h-4 w-4" />
              下载 prompt.md
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-xs text-muted">prompt.md — 贴给 Cursor / Claude Code / v0</span>
              <span className="font-mono text-[11px] text-muted">{prompt.length} chars</span>
            </div>
            <pre className="max-h-80 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap sm:max-h-96">
              {prompt}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "agents" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={() => handleCopy("agents", agentsMd)} aria-live="polite">
              {copiedKey === "agents" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedKey === "agents" ? "已复制规范" : "复制 AGENTS.md"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadTextFile("AGENTS.md", agentsMd)}
            >
              <Download className="h-4 w-4" />
              下载 AGENTS.md
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-xs text-muted">AGENTS.md — 放在项目根目录约束 AI 编码风格</span>
            </div>
            <pre className="max-h-80 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap sm:max-h-96">
              {agentsMd}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "zip" && (
        <div className="space-y-3">
          {isCustomScaffold && (
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs text-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                当前路线使用专用脚手架初始化（如 <code className="font-mono">npx tanstarter-cli</code> / Turborepo Monorepo / Void）。本 ZIP 包已为你打包对应的配置文件、<code className="font-mono">.env.example</code>、<code className="font-mono">AGENTS.md</code> 与初始化指南 <code className="font-mono">README.md</code>。
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="button" onClick={handleDownloadZip}>
              <FolderArchive className="h-4 w-4" />
              一键打包下载项目 ZIP
            </Button>
            <span className="text-xs text-muted">
              共 {fileNames.length} 个文件（含 .env.example 与 AGENTS.md）
            </span>
          </div>
          <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-12">
            <div className="min-w-0 border-b border-border bg-secondary/20 p-2 md:col-span-4 md:border-b-0 md:border-r">
              <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                生成文件列表
              </p>
              <ul className="max-h-48 space-y-0.5 overflow-y-auto md:max-h-80">
                {fileNames.map((file) => (
                  <li key={file}>
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors",
                        activePreviewFile === file
                          ? "bg-primary/15 font-medium text-primary"
                          : "text-muted hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <FileCode2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{file}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0 md:col-span-8">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="font-mono text-xs text-foreground truncate">{activePreviewFile}</span>
                <button
                  type="button"
                  onClick={() => handleCopy("file", templateFiles[activePreviewFile] ?? "")}
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-muted hover:text-foreground"
                >
                  {copiedKey === "file" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === "file" ? "已复制" : "复制文件"}
                </button>
              </div>
              <pre className="max-h-64 overflow-auto p-4 font-mono text-xs leading-relaxed text-foreground md:max-h-80">
                {templateFiles[activePreviewFile]}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === "checklist" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 px-4 py-3">
            <span className="text-xs font-medium text-foreground">出海上线前核对进度（自动保存）</span>
            <span className="font-mono text-xs text-primary">
              {completedChecklistCount} / {checklist.length} 完成
            </span>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {checklist.map((item) => {
              const checked = !!checkedItems[item.id]
              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/20"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-1 h-4 w-4 rounded border-border accent-primary"
                  />
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        checked ? "text-muted line-through" : "text-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted">{item.detail}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
