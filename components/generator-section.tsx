"use client"

import { useEffect, useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import { TechStackSelector, type SelectedStack } from "@/components/tech-stack-selector"
import { PromptGenerator } from "@/components/prompt-generator"
import { Button } from "@/components/ui/button"
import { TECH_STACKS, DEPLOYMENT_COMPAT } from "@/lib/tech-stacks"
import {
  ENTERPRISE_GOALS,
  PRIMARY_GOALS,
  STRUCTURE_GOAL,
  type GoalRecommendation,
} from "@/lib/recommendations"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    shortTitle: "定方向",
    title: "定方向与项目",
    hint: "先选业务阶段并填写项目名称与目标语言，后续提示词和代码包会自动匹配。",
  },
  {
    shortTitle: "调组合",
    title: "确认黄金组合",
    hint: "已帮你避开不兼容组合。可点开官方文档核对，或按需替换其中几项。",
  },
  {
    shortTitle: "带走代码",
    title: "带走代码与清单",
    hint: "复制给 Cursor / Claude Code，或直接下载可运行项目 ZIP 开工。",
  },
]

const LAYERS: { title: string; ids: string[] }[] = [
  { title: "怎么跑起来", ids: ["starter", "deployment"] },
  { title: "数据和文件", ids: ["database", "orm", "storage", "cache"] },
  { title: "用户和收款", ids: ["auth", "payment", "email"] },
  { title: "其余能力", ids: ["monitoring", "i18n", "cron", "websocket", "docker"] },
]

const BUSINESS_TYPES = [
  "SaaS 订阅产品",
  "AI 工具站",
  "B2B 外贸独立站",
  "数字产品 / 模板站",
]

const LANGUAGE_OPTIONS = [
  { id: "en", label: "English (en)" },
  { id: "zh", label: "中文 (zh)" },
  { id: "ja", label: "日本語 (ja)" },
  { id: "es", label: "Español (es)" },
  { id: "de", label: "Deutsch (de)" },
]

const STATE_STORAGE_KEY = "build-for-global:config:v1"

const START_GOALS = PRIMARY_GOALS.filter((goal) => goal.id !== "void-vite")
const GROW_GOALS = [
  PRIMARY_GOALS.find((goal) => goal.id === "void-vite")!,
  STRUCTURE_GOAL,
]

function getStackOption(categoryId: string, optionId: string) {
  const category = TECH_STACKS.find((item) => item.id === categoryId)
  return category?.options.find((item) => item.id === optionId)
}

function estimateMonthlyCost(selected: SelectedStack): string {
  const deploy = selected["deployment"]
  if (deploy === "railway" || deploy === "digitalocean") return "$5 - $20 / 月起"
  if (deploy === "aws" || deploy === "azure" || deploy === "aliyun") return "按云账号用量计费"
  if (deploy === "cloudflare" || deploy === "void") return "$0 - $5 / 月起"
  return "$0 / 月起"
}

function hasCompatIssue(selected: SelectedStack): boolean {
  const deployId = selected["deployment"]
  const dbId = selected["database"]
  const dockerId = selected["docker"]
  const cronId = selected["cron"]
  const wsId = selected["websocket"]
  if (dbId === "d1" && deployId && deployId !== "cloudflare" && deployId !== "void") return true
  if (!deployId) return false
  const compat = DEPLOYMENT_COMPAT[deployId]
  if (!compat) return false
  if (dockerId && dockerId !== "no-docker" && !compat.supportsDocker) return true
  if (cronId === "node-cron" && !compat.supportsDocker) return true
  if (wsId === "native-ws" && !compat.supportsDocker) return true
  return false
}

function encodeShareState(data: {
  goalId: string | null
  selected: SelectedStack
  projectName: string
  businessType: string
  languages: string[]
}): string {
  const json = JSON.stringify(data)
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodeShareState(raw: string) {
  const padded = raw.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((raw.length + 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return JSON.parse(new TextDecoder().decode(bytes))
}

function GoalRow({
  goal,
  active,
  badge,
  onSelect,
}: {
  goal: GoalRecommendation
  active: boolean
  badge?: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
          : "border-border bg-card/70 hover:border-primary/40 hover:bg-card"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
        )}
        aria-hidden
      >
        {active && <Check className="h-3 w-3" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{goal.title}</span>
            {badge && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                {badge}
              </span>
            )}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
            {goal.platform}
          </span>
        </span>
        <span className="mt-1.5 block text-xs leading-relaxed text-muted">{goal.summary}</span>
        {active && (
          <div className="mt-2 space-y-1 border-t border-border/60 pt-2">
            <span className="block text-xs text-foreground/85">适合：{goal.fit}</span>
            {goal.caution && (
              <span className="block text-xs leading-relaxed text-yellow-600 dark:text-yellow-400">注意：{goal.caution}</span>
            )}
          </div>
        )}
      </span>
    </button>
  )
}

export function GeneratorSection() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [goalId, setGoalId] = useState<string | null>("ship-fast")
  const [selected, setSelected] = useState<SelectedStack>(PRIMARY_GOALS[0].stack)
  const [showDetails, setShowDetails] = useState(false)
  const [showEnterprise, setShowEnterprise] = useState(false)

  const [projectName, setProjectName] = useState("my-global-saas")
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0])
  const [languages, setLanguages] = useState<string[]>(["en", "zh"])
  const [hydrated, setHydrated] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const headingRef = useRef<HTMLHeadingElement>(null)

  // 从 URL ?s= 或 localStorage 恢复状态
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const sharedParam = params.get("s")
      if (sharedParam) {
        const parsed = decodeShareState(sharedParam)
        if (parsed?.selected) {
          setGoalId(parsed.goalId ?? null)
          setSelected(parsed.selected)
          if (parsed.projectName) setProjectName(parsed.projectName)
          if (parsed.businessType) setBusinessType(parsed.businessType)
          if (Array.isArray(parsed.languages) && parsed.languages.length > 0) setLanguages(parsed.languages)
          setHydrated(true)
          return
        }
      }
      const saved = localStorage.getItem(STATE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.selected && Object.keys(parsed.selected).length > 0) {
          setGoalId(parsed.goalId ?? null)
          setSelected(parsed.selected)
          if (parsed.projectName) setProjectName(parsed.projectName)
          if (parsed.businessType) setBusinessType(parsed.businessType)
          if (Array.isArray(parsed.languages) && parsed.languages.length > 0) setLanguages(parsed.languages)
        }
      }
    } catch {}
    setHydrated(true)
  }, [])

  // 状态自动持久化到 localStorage
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(
        STATE_STORAGE_KEY,
        JSON.stringify({ goalId, selected, projectName, businessType, languages })
      )
    } catch {}
  }, [hydrated, goalId, selected, projectName, businessType, languages])

  const goals = [...PRIMARY_GOALS, STRUCTURE_GOAL, ...ENTERPRISE_GOALS]
  const activeGoal = goals.find((goal) => goal.id === goalId) ?? null
  const canAdvance = activeGoal !== null || Object.keys(selected).length > 0

  const goTo = (next: number) => {
    if (next === step || next < 0 || next > STEPS.length - 1) return
    if (next > step && !canAdvance) return
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const choose = (goal: GoalRecommendation) => {
    setGoalId(goal.id)
    setSelected(goal.stack)
    setShowDetails(false)
  }

  const toggleLanguage = (langId: string) => {
    setLanguages((prev) => {
      if (prev.includes(langId)) {
        return prev.length > 1 ? prev.filter((item) => item !== langId) : prev
      }
      return [...prev, langId]
    })
  }

  const handleCopyShareLink = async () => {
    const encoded = encodeShareState({ goalId, selected, projectName, businessType, languages })
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}#generator`
    await navigator.clipboard.writeText(url)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const skipFocus = useRef(true)
  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const compatBlocked = hasCompatIssue(selected)
  const selectedItemsCount = Object.keys(selected).length
  const deployName = selected["deployment"]
    ? getStackOption("deployment", selected["deployment"])?.name ?? selected["deployment"]
    : "未选择"
  const paymentName = selected["payment"]
    ? getStackOption("payment", selected["payment"])?.name ?? selected["payment"]
    : "未选择"
  const monthlyCost = estimateMonthlyCost(selected)

  return (
    <section id="generator" className="container mx-auto max-w-6xl scroll-mt-20 px-4 py-6 md:py-12">
      {/* 移动端顶部紧凑摘要条 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-3.5 py-2.5 text-xs lg:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{deployName}</span>
          <span className="text-muted">·</span>
          <span className="font-mono font-medium text-primary">{monthlyCost}</span>
        </div>
        {compatBlocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
            <ShieldAlert className="h-3 w-3" />
            存在兼容冲突
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            配置兼容
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 主工作区 */}
        <div className="min-w-0 flex min-h-[34rem] flex-col rounded-2xl border border-border bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm dark:shadow-black/20 lg:col-span-8">
          <nav aria-label="步骤" className="border-b border-border px-3 py-3 sm:px-6 sm:py-4">
            <ol className="flex items-center gap-1.5 sm:gap-2">
              {STEPS.map((item, index) => {
                const done = index < step
                const current = index === step
                const locked = index > step && !canAdvance
                return (
                  <li key={item.title} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      disabled={locked}
                      aria-current={current ? "step" : undefined}
                      className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold sm:h-7 sm:w-7",
                          current && "border-primary bg-primary text-primary-foreground",
                          done && "border-primary bg-background text-primary",
                          !current && !done && "border-border text-muted"
                        )}
                        aria-hidden
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <span className={cn("truncate text-xs sm:hidden", current ? "font-semibold text-foreground" : "text-muted")}>
                        {item.shortTitle}
                      </span>
                      <span className={cn("hidden truncate text-sm sm:inline", current ? "font-semibold text-foreground" : "text-muted")}>
                        {item.title}
                      </span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <span className="hidden h-px w-4 shrink-0 bg-border sm:block" aria-hidden />
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="flex-1 px-4 py-5 sm:px-6">
            <div key={step} className={direction > 0 ? "animate-step-forward" : "animate-step-back"}>
              <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-foreground outline-none">
                {STEPS[step].title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {step === 1 && activeGoal
                  ? `已按「${activeGoal.title}」预设好以下 4 层架构，可随时微调。`
                  : STEPS[step].hint}
              </p>

              {step === 0 && (
                <div className="mt-5 space-y-6">
                  {/* 项目基础信息 */}
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="project-name" className="block text-xs font-medium text-muted">
                          项目名称（用于代码包与提示词）
                        </label>
                        <input
                          id="project-name"
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="my-global-saas"
                          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="business-type" className="block text-xs font-medium text-muted">
                          出海业务类型
                        </label>
                        <select
                          id="business-type"
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-muted">目标客户语言</span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {LANGUAGE_OPTIONS.map((lang) => {
                          const isChecked = languages.includes(lang.id)
                          return (
                            <button
                              key={lang.id}
                              type="button"
                              onClick={() => toggleLanguage(lang.id)}
                              className={cn(
                                "cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors",
                                isChecked
                                  ? "border-primary bg-primary/15 font-medium text-primary"
                                  : "border-border bg-background text-muted hover:text-foreground"
                              )}
                            >
                              {lang.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium tracking-wide text-muted">起步阶段（推荐独立开发者 / 小团队）</p>
                    <div className="space-y-2.5">
                      {START_GOALS.map((goal, idx) => (
                        <GoalRow
                          key={goal.id}
                          goal={goal}
                          badge={idx === 0 ? "默认推荐" : "极致低成本"}
                          active={goalId === goal.id}
                          onSelect={() => choose(goal)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium tracking-wide text-muted">进阶与多端</p>
                    <div className="space-y-2.5">
                      {GROW_GOALS.map((goal) => (
                        <GoalRow
                          key={goal.id}
                          goal={goal}
                          active={goalId === goal.id}
                          onSelect={() => choose(goal)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowEnterprise((open) => !open)}
                      className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
                      aria-expanded={showEnterprise}
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showEnterprise && "rotate-180")} />
                      团队已经锁在大型云（阿里云 / AWS / Azure）
                    </button>
                    {showEnterprise && (
                      <div className="mt-2.5 space-y-2.5">
                        {ENTERPRISE_GOALS.map((goal) => (
                          <GoalRow
                            key={goal.id}
                            goal={goal}
                            active={goalId === goal.id}
                            onSelect={() => choose(goal)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && canAdvance && (
                <div className="mt-5 space-y-5">
                  {LAYERS.map((layer) => {
                    const lines = layer.ids.flatMap((id) => {
                      const optionId = selected[id]
                      if (!optionId) return []
                      const option = getStackOption(id, optionId)
                      const category = TECH_STACKS.find((item) => item.id === id)
                      if (!option || !category) return []
                      return [{ category: category.name, option }]
                    })
                    if (lines.length === 0) return null
                    return (
                      <div key={layer.title}>
                        <p className="text-xs font-medium text-muted">{layer.title}</p>
                        <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-card">
                          {lines.map((line) => (
                            <li key={line.category} className="flex items-center justify-between gap-4 px-4 py-3">
                              <span className="text-sm text-muted">{line.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{line.option.name}</span>
                                {line.option.docs && (
                                  <a
                                    href={line.option.docs}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`${line.option.name} 官方文档`}
                                    className="text-muted transition-colors hover:text-primary"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setShowDetails((open) => !open)}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60 sm:w-auto"
                    aria-expanded={showDetails}
                  >
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    {showDetails ? "收起 14 项技术栈微调" : "展开微调（替换组件并校验兼容性）"}
                  </button>
                  {showDetails && <TechStackSelector selected={selected} onChange={setSelected} />}
                </div>
              )}

              {step === 2 && canAdvance && (
                <div className="mt-5">
                  <PromptGenerator
                    selected={selected}
                    projectContext={{ projectName, businessType, languages }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              上一步
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                className="min-h-11"
                onClick={() => goTo(step + 1)}
                disabled={!canAdvance}
              >
                下一步
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => goTo(0)}
              >
                <RotateCcw className="h-4 w-4" />
                重新选择阶段
              </Button>
            )}
          </div>
        </div>

        {/* 右侧实时配置摘要栏 */}
        <aside className="min-w-0 space-y-4 lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-border bg-card/70 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">当前方案摘要</h3>
              {compatBlocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  存在兼容冲突
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  配置兼容
                </span>
              )}
            </div>

            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">项目名</dt>
                <dd className="font-mono font-medium text-foreground truncate">{projectName || "my-global-saas"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">业务定位</dt>
                <dd className="font-medium text-foreground">{businessType}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">部署平台</dt>
                <dd className="font-medium text-foreground">{deployName}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">收款方案</dt>
                <dd className="font-medium text-foreground">{paymentName}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">已选技术项</dt>
                <dd className="font-mono font-medium text-foreground">{selectedItemsCount} 项</dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <dt className="text-muted">起步月成本</dt>
                <dd className="font-mono font-semibold text-primary">{monthlyCost}</dd>
              </div>
            </dl>

            <div className="rounded-xl border border-border bg-secondary/30 p-3.5 text-xs leading-relaxed text-muted">
              <p className="font-semibold text-foreground">中国卖家提醒</p>
              <p className="mt-1">
                {selected["payment"] === "stripe"
                  ? "当前选择了 Stripe：需确保你已拥有香港、美国或新加坡等受支持地区的公司主体。"
                  : "当前使用 MoR 代收方案：无需海外公司即可面向全球买家收款，平台自动处理各国 VAT 税务。"}
              </p>
            </div>

            <div className="space-y-2">
              {step < 2 && (
                <Button type="button" className="w-full" onClick={() => goTo(2)} disabled={!canAdvance}>
                  一键生成项目包
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCopyShareLink}
              >
                {shareCopied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
                {shareCopied ? "已复制方案分享链接" : "复制当前方案分享链接"}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
