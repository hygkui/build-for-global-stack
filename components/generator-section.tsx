"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import { TechStackSelector, type SelectedStack } from "@/components/tech-stack-selector"
import { PromptGenerator } from "@/components/prompt-generator"
import { Button } from "@/components/ui/button"
import { TECH_STACKS } from "@/lib/tech-stacks"
import {
  ENTERPRISE_GOALS,
  PRIMARY_GOALS,
  STRUCTURE_GOAL,
  type GoalRecommendation,
} from "@/lib/recommendations"
import { cn } from "@/lib/utils"

const STEPS = [
  { title: "选定阶段", hint: "新项目停在起步。上一层盖不住时，再看后面的层。" },
  { title: "确认组合", hint: "这一层已经配好。需要时再改其中几项。" },
  { title: "复制提示词", hint: "贴到 Cursor、Claude 或 v0。" },
]

const LAYERS: { title: string; ids: string[] }[] = [
  { title: "怎么跑起来", ids: ["starter", "deployment"] },
  { title: "数据和文件", ids: ["database", "orm", "storage", "cache"] },
  { title: "用户和收款", ids: ["auth", "payment", "email"] },
  { title: "其余能力", ids: ["monitoring", "i18n", "cron", "websocket", "docker"] },
]

const START_GOALS = PRIMARY_GOALS.filter((goal) => goal.id !== "void-vite")
const GROW_GOALS = [
  PRIMARY_GOALS.find((goal) => goal.id === "void-vite")!,
  STRUCTURE_GOAL,
]

function stackName(categoryId: string, optionId: string) {
  const category = TECH_STACKS.find((item) => item.id === categoryId)
  return category?.options.find((item) => item.id === optionId)?.name
}

function GoalRow({
  goal,
  active,
  onSelect,
}: {
  goal: GoalRecommendation
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
        )}
        aria-hidden
      >
        {active && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-semibold text-foreground">{goal.title}</span>
          <span className="text-xs font-medium text-primary">{goal.platform}</span>
        </span>
        {active && (
          <>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{goal.summary}</span>
            <span className="mt-1 block text-xs text-foreground/80">适合：{goal.fit}</span>
            {goal.caution && (
              <span className="mt-1 block text-xs leading-relaxed text-muted">{goal.caution}</span>
            )}
          </>
        )}
      </span>
    </button>
  )
}

export function GeneratorSection() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [goalId, setGoalId] = useState<string | null>(null)
  const [selected, setSelected] = useState<SelectedStack>({})
  const [showDetails, setShowDetails] = useState(false)
  const [showEnterprise, setShowEnterprise] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const goals = [...PRIMARY_GOALS, STRUCTURE_GOAL, ...ENTERPRISE_GOALS]
  const activeGoal = goals.find((goal) => goal.id === goalId) ?? null
  const canAdvance = activeGoal !== null

  const goTo = (next: number) => {
    if (next === step || next < 0 || next > STEPS.length - 1) return
    if (next > step + 1) return
    if (next > step && !canAdvance) return
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const choose = (goal: GoalRecommendation) => {
    setGoalId(goal.id)
    setSelected(goal.stack)
    setShowDetails(false)
  }

  const skipFocus = useRef(true)
  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  return (
    <section id="generator" className="container mx-auto scroll-mt-24 px-4 py-10 md:py-14">
      <div className="mx-auto flex min-h-[32rem] max-w-2xl flex-col rounded-xl border border-border bg-card/40">
        <nav aria-label="步骤" className="border-b border-border px-4 py-4 sm:px-6">
          <ol className="flex items-center gap-2">
            {STEPS.map((item, index) => {
              const done = index < step
              const current = index === step
              const locked = index > step + 1 || (index > step && !canAdvance)
              return (
                <li key={item.title} className="flex min-w-0 flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    disabled={locked}
                    aria-current={current ? "step" : undefined}
                    aria-label={`第 ${index + 1} 步，${item.title}`}
                    className={cn(
                      "flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        current && "border-primary bg-primary text-primary-foreground",
                        done && "border-primary bg-background text-primary",
                        !current && !done && "border-border text-muted"
                      )}
                      aria-hidden
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className={cn("truncate text-sm", current ? "font-semibold text-foreground" : "text-muted")}>
                      {item.title}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && <span className="hidden h-px w-4 shrink-0 bg-border sm:block" aria-hidden />}
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="flex-1 px-4 py-5 sm:px-6">
          <div
            key={step}
            className={direction > 0 ? "animate-step-forward" : "animate-step-back"}
          >
            <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-foreground outline-none">
              {STEPS[step].title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {step === 1 && activeGoal
                ? `按「${activeGoal.title}」配好，从上到下是搭建顺序。`
                : STEPS[step].hint}
            </p>

            {step === 0 && (
              <div className="mt-5 space-y-6">
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted">起步</p>
                  <div className="space-y-2">
                    {START_GOALS.map((goal) => (
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
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted">往下长</p>
                  <div className="space-y-2">
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
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-muted underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-expanded={showEnterprise}
                  >
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showEnterprise && "rotate-180")} />
                    团队已经锁在大型云
                  </button>
                  {showEnterprise && (
                    <div className="mt-2 space-y-2">
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

            {step === 1 && activeGoal && (
              <div className="mt-5 space-y-5">
                {LAYERS.map((layer) => {
                  const lines = layer.ids.flatMap((id) => {
                    const optionId = selected[id]
                    if (!optionId) return []
                    const name = stackName(id, optionId)
                    const category = TECH_STACKS.find((item) => item.id === id)
                    if (!name || !category) return []
                    return [{ category: category.name, name }]
                  })
                  if (lines.length === 0) return null
                  return (
                    <div key={layer.title}>
                      <p className="text-xs font-medium text-muted">{layer.title}</p>
                      <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
                        {lines.map((line) => (
                          <li key={line.category} className="flex items-baseline justify-between gap-4 px-4 py-3">
                            <span className="text-sm text-muted">{line.category}</span>
                            <span className="text-sm font-medium text-foreground">{line.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setShowDetails((open) => !open)}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={showDetails}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showDetails ? "收起微调" : "需要时再微调其中几项"}
                </button>
                {showDetails && <TechStackSelector selected={selected} onChange={setSelected} />}
              </div>
            )}

            {step === 2 && activeGoal && (
              <div className="mt-5">
                <PromptGenerator selected={selected} />
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
            <span className="text-sm text-muted">复制后即可离开</span>
          )}
        </div>
        {step === 0 && !canAdvance && (
          <p className="px-4 pb-4 text-right text-xs text-muted sm:px-6">先选一个阶段，才能下一步。</p>
        )}
      </div>
    </section>
  )
}
