"use client"

import { useState, useCallback } from "react"
import { Check, ChevronDown, ChevronUp, AlertTriangle, Info, XCircle, Wrench } from "lucide-react"
import { TECH_STACKS, DEPLOYMENT_COMPAT, type TechCategory, type TechOption } from "@/lib/tech-stacks"
import { cn } from "@/lib/utils"

export type SelectedStack = Record<string, string>

interface CompatWarning {
  type: "error" | "warn" | "info"
  message: string
  tip?: string
  fixLabel?: string
  fixPatch?: Record<string, string | undefined>
}

function getCompatWarnings(selected: SelectedStack): CompatWarning[] {
  const warnings: CompatWarning[] = []
  const deployId = selected["deployment"]
  const starterId = selected["starter"]
  const cronId = selected["cron"]
  const wsId = selected["websocket"]
  const dbId = selected["database"]
  const dockerId = selected["docker"]

  if (dbId === "d1" && deployId && deployId !== "cloudflare" && deployId !== "void") {
    warnings.push({
      type: "warn",
      message: "Cloudflare D1 需要部署在 Cloudflare Workers",
      tip: "换到 Cloudflare，或改用 Neon / PostgreSQL。",
      fixLabel: "切换到 Cloudflare Workers",
      fixPatch: { deployment: "cloudflare" },
    })
  }

  if (starterId === "tanstarter" && deployId && deployId !== "cloudflare") {
    warnings.push({
      type: "warn",
      message: "TanStarter 默认部署在 Cloudflare Workers",
      tip: "模板内置 D1、R2、KV 和 Workers 部署。若改用其他平台，需要自行替换这些绑定。",
      fixLabel: "切换到 Cloudflare Workers",
      fixPatch: { deployment: "cloudflare" },
    })
  }

  if (!deployId) return warnings
  const compat = DEPLOYMENT_COMPAT[deployId]
  if (!compat) return warnings

  if (dockerId && dockerId !== "no-docker" && !compat.supportsDocker) {
    const platformName =
      deployId === "vercel" ? "Vercel"
      : deployId === "cloudflare" ? "Cloudflare Workers"
      : deployId === "void" ? "Void"
      : "Deno Deploy"
    warnings.push({
      type: "error",
      message: `${platformName} 不支持 Docker 部署`,
      tip: compat.dockerNote,
      fixLabel: "设为不需要 Docker",
      fixPatch: { docker: "no-docker" },
    })
  }

  if (cronId === "node-cron" && !compat.supportsDocker) {
    warnings.push({
      type: "error",
      message: "node-cron / BullMQ 需要长时运行进程，不适用于 Serverless 平台",
      tip: "Serverless 平台请改用平台原生 Cron 或 Upstash QStash。",
      fixLabel: "改用 Upstash QStash",
      fixPatch: { cron: "qstash" },
    })
  }
  if (cronId === "db-cloud-function" && dbId !== "supabase") {
    warnings.push({
      type: "error",
      message: "Supabase pg_cron 仅支持 Supabase 数据库",
      tip: "请选择 Supabase 作为数据库，或改用 QStash / GitHub Actions。",
      fixLabel: "改用 Upstash QStash",
      fixPatch: { cron: "qstash" },
    })
  }
  if (cronId === "native-cron" && deployId === "digitalocean") {
    warnings.push({
      type: "warn",
      message: "DigitalOcean Droplet 无「平台原生 Cron」，建议改用 node-cron / BullMQ 或 crontab",
      tip: "或选择 Upstash QStash 通过 HTTP 触发，更易管理和重试。",
      fixLabel: "改用 node-cron",
      fixPatch: { cron: "node-cron" },
    })
  }

  if (wsId === "cf-durable-objects" && deployId !== "cloudflare") {
    warnings.push({
      type: "error",
      message: "Cloudflare Durable Objects 仅支持 Cloudflare Workers 部署",
      tip: "请切换部署平台至 Cloudflare Workers，或改用 Ably / Pusher / SSE。",
      fixLabel: "改用 Ably",
      fixPatch: { websocket: "ably" },
    })
  }
  if (wsId === "native-ws" && !compat.supportsDocker) {
    warnings.push({
      type: "error",
      message: "原生 WebSocket 服务器需要长时运行进程，不适用于 Serverless 平台",
      tip: "Serverless 平台请改用 Ably / Pusher / SSE / Supabase Realtime。",
      fixLabel: "改用 SSE",
      fixPatch: { websocket: "sse" },
    })
  }
  if (wsId === "supabase-realtime" && dbId !== "supabase") {
    warnings.push({
      type: "error",
      message: "Supabase Realtime 需要使用 Supabase 作为数据库",
      tip: "请选择 Supabase 作为数据库，或改用 Ably / Pusher。",
      fixLabel: "改用 Ably",
      fixPatch: { websocket: "ably" },
    })
  }
  if (wsId && !compat.supportsWs && !["sse", "ably", "pusher", "supabase-realtime"].includes(wsId)) {
    warnings.push({
      type: "warn",
      message: `${deployId === "vercel" ? "Vercel" : "Deno Deploy"} 不支持原生 WebSocket 持久连接`,
      tip: compat.wsNote,
      fixLabel: "改用 SSE",
      fixPatch: { websocket: "sse" },
    })
  }

  return warnings
}

function CompatBadge({ option, deployId, dbId }: { option: TechOption; deployId?: string; dbId?: string }) {
  if (!deployId) return null
  const compat = DEPLOYMENT_COMPAT[deployId]

  if (option.id === "cf-durable-objects" && deployId !== "cloudflare")
    return <span className="mt-1.5 inline-block rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">仅限 CF</span>

  if ((option.id === "native-ws" || option.id === "node-cron") && compat && !compat.supportsDocker)
    return <span className="mt-1.5 inline-block rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">需长时运行</span>

  if ((option.id === "dockerfile-only" || option.id === "docker-compose") && compat && !compat.supportsDocker)
    return <span className="mt-1.5 inline-block rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">平台不支持</span>

  if (option.id === "supabase-realtime" && dbId !== "supabase")
    return <span className="mt-1.5 inline-block rounded bg-yellow-500/15 px-1.5 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">需 Supabase DB</span>

  if (option.id === "db-cloud-function" && dbId !== "supabase")
    return <span className="mt-1.5 inline-block rounded bg-yellow-500/15 px-1.5 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">需 Supabase DB</span>

  return null
}

function OptionButton({ option, isSelected, onSelect, deployId, dbId }: {
  option: TechOption; isSelected: boolean; onSelect: () => void; deployId?: string; dbId?: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex min-h-11 cursor-pointer flex-col items-start rounded-lg border p-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10"
          : "border-border bg-secondary/30 text-muted hover:border-border/80 hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      {isSelected && (
        <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </span>
      )}
      <p className="pr-5 text-xs font-semibold text-foreground">{option.name}</p>
      <p className="mt-1 text-xs leading-relaxed opacity-85">{option.description}</p>
      <CompatBadge option={option} deployId={deployId} dbId={dbId} />
    </button>
  )
}

function CategoryCard({ category, selected, selectedStack, onSelect }: {
  category: TechCategory; selected: string | undefined; selectedStack: SelectedStack
  onSelect: (categoryId: string, optionId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showEnterprise, setShowEnterprise] = useState(false)
  const deployId = selectedStack["deployment"]
  const dbId = selectedStack["database"]
  const compat = deployId ? DEPLOYMENT_COMPAT[deployId] : undefined
  const needsDeployWarning = category.requiresDeploymentCheck && !deployId
  const isDockerBlocked = category.id === "docker" && compat && !compat.supportsDocker

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("h-2 w-2 shrink-0 rounded-full", selected ? "bg-primary" : "bg-muted-foreground/40")} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{category.name}</p>
              {isDockerBlocked && (
                <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">当前平台不支持</span>
              )}
            </div>
            <p className="truncate text-xs text-muted">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {selected && (
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-block">
              {category.options.find((o) => o.id === selected)?.name}
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {needsDeployWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                建议先在上方选择<strong>部署平台</strong>，再配置此项，以确认兼容性。
              </p>
            </div>
          )}

          {category.id === "docker" && compat && !compat.supportsDocker && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">
                <strong>当前部署平台不支持 Docker。</strong> {compat.dockerNote}
              </p>
            </div>
          )}

          {compat && category.id === "cron" && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
              <p className="text-xs text-muted">{compat.cronNote}</p>
            </div>
          )}

          {compat && category.id === "websocket" && (
            <div className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2.5",
              compat.supportsWs ? "border-border bg-secondary/30" : "border-yellow-500/30 bg-yellow-500/10"
            )}>
              <Info className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", compat.supportsWs ? "text-muted" : "text-yellow-500")} />
              <p className={cn("text-xs", compat.supportsWs ? "text-muted" : "text-yellow-700 dark:text-yellow-400")}>
                {compat.wsNote}
              </p>
            </div>
          )}

          {category.id === "deployment" ? (
            <div className="space-y-4">
              <OptionGroup
                label="推荐"
                options={category.options.filter((o) => o.tier === "recommended")}
                selected={selected}
                onSelect={onSelect}
                categoryId={category.id}
                deployId={deployId}
                dbId={dbId}
              />
              <OptionGroup
                label="其他运行方式"
                options={category.options.filter((o) => o.tier === "flexible")}
                selected={selected}
                onSelect={onSelect}
                categoryId={category.id}
                deployId={deployId}
                dbId={dbId}
              />
              <div>
                <button
                  type="button"
                  onClick={() => setShowEnterprise((v) => !v)}
                  className="cursor-pointer text-xs text-muted underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showEnterprise ? "收起大型云" : "已有阿里云 / AWS / Azure 账号"}
                </button>
                {showEnterprise && (
                  <div className="mt-2">
                    <OptionGroup
                      label="大型云"
                      options={category.options.filter((o) => o.tier === "enterprise")}
                      selected={selected}
                      onSelect={onSelect}
                      categoryId={category.id}
                      deployId={deployId}
                      dbId={dbId}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {category.options.map((option) => (
                <OptionButton
                  key={option.id}
                  option={option}
                  isSelected={selected === option.id}
                  onSelect={() => onSelect(category.id, option.id)}
                  deployId={deployId}
                  dbId={dbId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CompatWarningBanner({
  selected,
  onApplyFix,
}: {
  selected: SelectedStack
  onApplyFix: (patch: Record<string, string | undefined>) => void
}) {
  const warnings = getCompatWarnings(selected)
  if (warnings.length === 0) return null
  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
            w.type === "error"
              ? "border-destructive/40 bg-destructive/10"
              : "border-yellow-500/30 bg-yellow-500/10"
          )}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                w.type === "error" ? "text-destructive" : "text-yellow-500"
              )}
            />
            <div>
              <p
                className={cn(
                  "text-xs font-semibold",
                  w.type === "error" ? "text-destructive" : "text-yellow-700 dark:text-yellow-400"
                )}
              >
                {w.message}
              </p>
              {w.tip && <p className="mt-0.5 text-xs text-muted">{w.tip}</p>}
            </div>
          </div>
          {w.fixLabel && w.fixPatch && (
            <button
              type="button"
              onClick={() => onApplyFix(w.fixPatch!)}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary sm:self-center"
            >
              <Wrench className="h-3 w-3" />
              {w.fixLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function OptionGroup({ label, options, selected, onSelect, categoryId, deployId, dbId }: {
  label: string
  options: TechOption[]
  selected?: string
  onSelect: (categoryId: string, optionId: string) => void
  categoryId: string
  deployId?: string
  dbId?: string
}) {
  if (options.length === 0) return null
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selected === option.id}
            onSelect={() => onSelect(categoryId, option.id)}
            deployId={deployId}
            dbId={dbId}
          />
        ))}
      </div>
    </div>
  )
}

export function TechStackSelector({ selected, onChange }: {
  selected: SelectedStack
  onChange: (selected: SelectedStack) => void
}) {
  const handleSelect = useCallback(
    (categoryId: string, optionId: string) => {
      const next = { ...selected }
      if (next[categoryId] === optionId) {
        delete next[categoryId]
      } else {
        next[categoryId] = optionId
      }
      onChange(next)
    },
    [onChange, selected]
  )

  const handleApplyFix = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = { ...selected }
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) delete next[k]
        else next[k] = v
      }
      onChange(next)
    },
    [onChange, selected]
  )

  const selectedCount = Object.keys(selected).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          已选择 <span className="font-semibold text-foreground">{selectedCount}</span> 项技术
        </p>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            清空选择
          </button>
        )}
      </div>
      <CompatWarningBanner selected={selected} onApplyFix={handleApplyFix} />
      <div className="space-y-2">
        {TECH_STACKS.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            selected={selected[category.id]}
            selectedStack={selected}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  )
}
