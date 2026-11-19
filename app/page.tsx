import { ArrowDown, CheckCircle2, Globe, Sparkles } from "lucide-react"
import { GeneratorSection } from "@/components/generator-section"
import { ChinaGlobalGuide } from "@/components/china-global-guide"
import { AgentAccessSection } from "@/components/agent-access-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="bg-studio-grid border-b border-border/60">
          <div className="container mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-14 md:pt-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              中国创业者出海建站工作台
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              把产品卖向全球，<span className="gradient-text">3 分钟配齐收款与技术栈</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              避开 Stripe 开户与域名备案卡点。选好你的业务阶段，自动排查云服务冲突，一键导出可运行项目代码与 AI 开发提示词。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                无海外公司也能收美金（MoR 代收）
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                海外节点部署，免国内备案
              </span>
              <a
                href="#generator"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                开始配置方案
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        <GeneratorSection />
        <ChinaGlobalGuide />
        <AgentAccessSection />
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">© 2026 出海黄金组合 · 面向全球市场的产品架构台</p>
          <p className="text-xs text-muted">支持 MCP 与 Agent Skill 接入</p>
        </div>
      </footer>
    </div>
  )
}
