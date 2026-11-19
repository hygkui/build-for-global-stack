"use client"

import { useEffect, useState } from "react"
import { Bot, Check, Copy, Download, Play, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AgentAccessSection() {
  const [origin, setOrigin] = useState("https://your-domain.com")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [testOutput, setTestOutput] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const mcpUrl = `${origin}/api/mcp`
  const skillUrl = `${origin}/skill.md`

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        "build-for-global": {
          type: "http",
          url: mcpUrl,
        },
      },
    },
    null,
    2
  )

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleTestMcp = async () => {
    setTesting(true)
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {},
        }),
      })
      const data = await res.json()
      setTestOutput(JSON.stringify(data, null, 2))
    } catch (err) {
      setTestOutput(String(err))
    } finally {
      setTesting(false)
    }
  }

  return (
    <section id="agent-access" className="container mx-auto max-w-6xl scroll-mt-24 px-4 pb-20">
      <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Bot className="h-3.5 w-3.5" />
              MCP + Skill 双模式接入
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              让其他 AI Agent 直接访问本站能力
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted">
            Skill 负责告诉 Agent「出海选型规则与工作流」，MCP 负责提供可执行的工具调用与实时代码生成。两者配合，无需人工打开网页点选。
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* MCP 接入卡片 */}
          <div className="min-w-0 flex flex-col justify-between rounded-xl border border-border bg-background/60 p-4 space-y-4 sm:p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Terminal className="h-4 w-4 text-primary" />
                  1. Remote MCP Server（Streamable HTTP）
                </span>
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-primary">
                  POST /api/mcp
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                暴露 <code className="font-mono text-foreground">list_goals</code>、<code className="font-mono text-foreground">list_tech_options</code>、<code className="font-mono text-foreground">check_compatibility</code>、<code className="font-mono text-foreground">generate_project_bundle</code> 四个工具。
              </p>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100">
                {mcpConfigJson}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => handleCopy("mcp", mcpConfigJson)}
              >
                {copiedKey === "mcp" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === "mcp" ? "已复制配置" : "复制 MCP 配置"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleTestMcp}
                disabled={testing}
              >
                <Play className="h-3.5 w-3.5" />
                {testing ? "请求中..." : "在线测试 tools/list"}
              </Button>
            </div>
          </div>

          {/* Skill 接入卡片 */}
          <div className="min-w-0 flex flex-col justify-between rounded-xl border border-border bg-background/60 p-4 space-y-4 sm:p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Bot className="h-4 w-4 text-primary" />
                  2. Agent Skill（SKILL.md）
                </span>
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-primary">
                  GET /skill.md
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                标准 YAML Frontmatter + Markdown 技能文件，告诉 Agent 何时优先推荐 Creem / Waffo 代收、如何避开 Serverless 兼容坑。
              </p>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100 break-all">
                curl -s {skillUrl}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => handleCopy("skill", skillUrl)}
              >
                {copiedKey === "skill" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === "skill" ? "已复制 URL" : "复制 Skill 链接"}
              </Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/skill.md" download="SKILL.md">
                  <Download className="h-3.5 w-3.5" />
                  下载 SKILL.md
                </a>
              </Button>
            </div>
          </div>
        </div>

        {testOutput && (
          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs text-primary">POST /api/mcp → tools/list 响应</span>
              <button
                type="button"
                onClick={() => setTestOutput(null)}
                className="text-xs text-muted hover:text-foreground"
              >
                收起
              </button>
            </div>
            <pre className="max-h-64 overflow-auto font-mono text-xs text-foreground">
              {testOutput}
            </pre>
          </div>
        )}
      </div>
    </section>
  )
}
