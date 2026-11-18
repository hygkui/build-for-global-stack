import { ArrowDown, CheckCircle2, Globe, Sparkles } from "lucide-react"
import { GeneratorSection } from "@/components/generator-section"
import { ChinaGlobalGuide } from "@/components/china-global-guide"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="bg-studio-grid border-b border-border/50">
          <div className="container mx-auto max-w-6xl px-4 pb-10 pt-12 md:pb-14 md:pt-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              专为中国创业者面向海外客户建站打造
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              先解决<span className="gradient-text">出海收款与部署</span>，再一键生成可运行项目
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              不用在几十个海外云服务里试错。按你的业务阶段选好组合，自动校验 Cron / WebSocket / Docker 兼容性，直接导出 AI 提示词、<code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">AGENTS.md</code> 规范与完整项目 ZIP。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                MoR 代收优先，无海外公司也能收美金
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary" />
                全球边缘部署，免国内备案
              </span>
              <a
                href="#generator"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                开始配置
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        <GeneratorSection />
        <ChinaGlobalGuide />
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">© 2026 出海黄金组合 · Build for Global</p>
          <p className="text-xs text-muted">面向中国独立开发者与出海团队的免费建站配置台</p>
        </div>
      </footer>
    </div>
  )
}
