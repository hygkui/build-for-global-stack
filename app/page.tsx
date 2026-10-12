import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GeneratorSection } from "@/components/generator-section"

const STEPS = [
  {
    step: "01",
    title: "说出目标",
    description: "尽快上线，还是把成本压在 Cloudflare。不用先从平台清单里挑。",
  },
  {
    step: "02",
    title: "拿走推荐组合",
    description: "Vercel 或 Cloudflare 的配套已经配好，复制提示词就能交给 Cursor。",
  },
  {
    step: "03",
    title: "需要时再微调",
    description: "阿里云、AWS、Azure 留给已经在用的团队，不作为默认起点。",
  },
]

const FEATURES = [
  "按目标推荐，而不是先丢一张长清单",
  "默认只推 Vercel 和 Cloudflare",
  "自动生成可用于 AI 工具的提示词",
  "多端（Web + 后台 + App）用 NestJS Monorepo，小型 MVP 不必上这套",
  "大型云收在后面，不挡起步",
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
            按目标推荐{" "}
            <span className="gradient-text">出海技术栈</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            新项目用 Vercel 尽快上线，或用 Cloudflare 把成本压低。Vite 项目也可以看 Void，它还在内测。
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#generator">
              <Button size="lg" className="gap-2">
                按目标看看推荐
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            <div className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">Vercel</p>
              <p className="text-sm text-muted">尽快上线</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">Cloudflare</p>
              <p className="text-sm text-muted">成本更低</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">Void</p>
              <p className="text-sm text-muted">Vite · 内测</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-card/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center font-serif text-2xl font-bold text-foreground md:text-3xl">
              先定目标，再动技术
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
                    推荐在前，清单在后
                  </h2>
                  <p className="mt-4 text-muted leading-relaxed">
                    大多数出海 MVP 不需要先比较阿里云、AWS 和 Azure。选定目标后，再决定要不要改其中几项。
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
              选一个目标，复制提示词，就可以开工。
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="#generator">
                <Button size="lg" className="gap-2">
                  按目标看看推荐
                  <ArrowRight className="h-4 w-4" />
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
        </div>
      </footer>
    </div>
  )
}
