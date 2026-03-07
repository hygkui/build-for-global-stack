"use client"

import { useState, useCallback } from "react"
import { TechStackSelector, type SelectedStack } from "@/components/tech-stack-selector"
import { PromptGenerator } from "@/components/prompt-generator"

export function GeneratorSection() {
  const [selected, setSelected] = useState<SelectedStack>({})

  const handleChange = useCallback((newSelected: SelectedStack) => {
    setSelected(newSelected)
  }, [])

  return (
    <section id="generator" className="container mx-auto px-4 py-16 md:py-24">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          技术栈选择器
        </h2>
        <p className="mt-3 text-base text-muted">
          选择你的技术组合，自动生成项目初始化提示词
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 左侧：选择器 */}
        <div>
          <TechStackSelector onChange={handleChange} />
        </div>

        {/* 右侧：提示词预览（在大屏幕上固定） */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PromptGenerator selected={selected} />
        </div>
      </div>
    </section>
  )
}
