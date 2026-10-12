"use client"

import { useState } from "react"
import { ArrowRight, SlidersHorizontal } from "lucide-react"
import { TechStackSelector, type SelectedStack } from "@/components/tech-stack-selector"
import { PromptGenerator } from "@/components/prompt-generator"
import { TECH_STACKS } from "@/lib/tech-stacks"
import { ENTERPRISE_GOALS, PRIMARY_GOALS, STRUCTURE_GOAL, type GoalRecommendation } from "@/lib/recommendations"
import { cn } from "@/lib/utils"

function stackLines(stack: SelectedStack) {
  return TECH_STACKS.flatMap((category) => {
    const optionId = stack[category.id]
    if (!optionId) return []
    const option = category.options.find((item) => item.id === optionId)
    if (!option) return []
    return [{ category: category.name, name: option.name }]
  })
}

function GoalCard({ goal, active, onSelect }: {
  goal: GoalRecommendation
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex min-h-11 cursor-pointer flex-col items-start rounded-xl border p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
          : "border-border bg-card hover:border-primary/40 hover:bg-card/80"
      )}
    >
      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
        {goal.platform}
      </span>
      <span className="mt-4 font-serif text-xl font-bold text-foreground">{goal.title}</span>
      <span className="mt-2 text-sm leading-relaxed text-muted">{goal.summary}</span>
      <span className="mt-4 text-xs text-foreground/80">适合：{goal.fit}</span>
      {goal.caution && (
        <span className="mt-2 text-xs leading-relaxed text-muted">{goal.caution}</span>
      )}
    </button>
  )
}

export function GeneratorSection() {
  const [goalId, setGoalId] = useState<string | null>(null)
  const [selected, setSelected] = useState<SelectedStack>({})
  const [showDetails, setShowDetails] = useState(false)
  const [showEnterprise, setShowEnterprise] = useState(false)

  const goals = [...PRIMARY_GOALS, STRUCTURE_GOAL, ...ENTERPRISE_GOALS]
  const activeGoal = goals.find((goal) => goal.id === goalId) ?? null

  const choose = (goal: GoalRecommendation) => {
    setGoalId(goal.id)
    setSelected(goal.stack)
    setShowDetails(false)
  }

  return (
    <section id="generator" className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
          先说你要做成什么
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          出海新项目优先 Vercel 或 Cloudflare。Void 也适合 Vite 项目，但还在内测。选一个目标，直接拿到推荐组合和提示词。
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
        {PRIMARY_GOALS.map((goal) => (
          <GoalCard key={goal.id} goal={goal} active={goalId === goal.id} onSelect={() => choose(goal)} />
        ))}
      </div>

      <div className="mx-auto mt-4 max-w-5xl">
        <GoalCard goal={STRUCTURE_GOAL} active={goalId === STRUCTURE_GOAL.id} onSelect={() => choose(STRUCTURE_GOAL)} />
      </div>

      <div className="mx-auto mt-6 max-w-5xl">
        <button
          type="button"
          onClick={() => setShowEnterprise((open) => !open)}
          className="cursor-pointer text-sm text-muted underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={showEnterprise}
        >
          {showEnterprise ? "收起大型云" : "已经在用阿里云、AWS 或 Azure"}
        </button>
        {showEnterprise && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {ENTERPRISE_GOALS.map((goal) => (
              <GoalCard key={goal.id} goal={goal} active={goalId === goal.id} onSelect={() => choose(goal)} />
            ))}
          </div>
        )}
      </div>

      {activeGoal && (
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm text-muted">按「{activeGoal.title}」推荐</p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-foreground">{activeGoal.platform}</h3>
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
              {stackLines(selected).map((line) => (
                <li key={line.category} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-muted">{line.category}</span>
                  <span className="text-sm font-medium text-foreground">{line.name}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowDetails((open) => !open)}
              className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showDetails ? "收起微调" : "微调其中几项"}
              <ArrowRight className="h-4 w-4" />
            </button>
            {showDetails && (
              <div className="mt-4">
                <TechStackSelector selected={selected} onChange={setSelected} />
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PromptGenerator selected={selected} />
          </div>
        </div>
      )}
    </section>
  )
}
