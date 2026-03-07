import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GeneratorSection } from "@/components/generator-section"

const STEPS = [
  {
    step: "01",
    title: "选择技术栈",
    description: "从 8 大类别中选择你的出海技术组合，支持 Vercel、Neon、Stripe 等主流方案",
  },
  {
    step: "02",
    title: "获取提示词（免费）",
    description: "自动生成项目初始化提示词，复制到 v0.dev 或 Cursor 中即可创建项目",
  },
  {
    step: "03",
    title: "下载代码 / 定制开发",
    description: "$20 获取可直接运行的代码包，或花 $200 让我们帮你完成整个 MVP",
  },
]

const FEATURES = [
  "8 大技术类别，30+ 精选工具",
  "自动生成可用于 AI 工具的提示词",
  "$20 获取完整可运行代码包",
  "$200 MVP 1 对 1 外包开发",
  "覆盖部署、数据库、支付、认证全链路",
  "专为出海场景优化",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 pt-20 pb-16 text-center md:pt-28 md:pb-20">
          <Badge className="mb-6 inline-flex gap-1">
            <Sparkles className="h-3 w-3" />
            出海开发者的技术加速器
          </Badge>

          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight text-balance text-foreground md:text-6xl">
            快速构建你的{" "}
            <span className="gradient-text">出海 MVP</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            选择技术栈，免费获取 AI 提示词；付费下载可运行代码；或者让我们直接帮你打造完整 MVP。
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#generator">
              <Button size="lg" className="gap-2">
                免费开始生成
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2">
                查看定价
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            <div className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">30+</p>
              <p className="text-sm text-muted">精选技术工具</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">8</p>
              <p className="text-sm text-muted">技术类别</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">$20</p>
              <p className="text-sm text-muted">起步价</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-card/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center font-serif text-2xl font-bold text-foreground md:text-3xl">
              三步快速出海
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.step} className="rounded-xl border border-border bg-card p-6">
                  <p className="mb-3 font-mono text-4xl font-bold text-primary/30">{s.step}</p>
                  <h3 className="mb-2 font-serif text-lg font-bold text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Generator Section */}
        <GeneratorSection />

        {/* Features */}
        <section className="border-t border-border bg-card/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div>
                  <Badge className="mb-4">功能一览</Badge>
                  <h2 className="font-serif text-3xl font-bold text-foreground text-balance">
                    一站式出海技术解决方案
                  </h2>
                  <p className="mt-4 text-muted leading-relaxed">
                    从技术选型到代码交付，帮你跳过繁琐的调研和配置，专注于产品本身。
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Link href="#generator">
                      <Button className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        免费生成提示词
                      </Button>
                    </Link>
                  </div>
                </div>
                <ul className="grid grid-cols-1 gap-3">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
              准备好出海了吗？
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              免费注册，立即开始生成你的技术栈提示词，或购买代码包直接启动项目。
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  免费注册
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  查看付费方案
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center md:flex-row md:justify-between">
          <p className="text-sm text-muted">
            © 2025 出海黄金组合. 保留所有权利。
          </p>
          <div className="flex gap-4">
            <Link href="/pricing" className="text-sm text-muted hover:text-foreground">
              定价
            </Link>
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
              我的订单
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
