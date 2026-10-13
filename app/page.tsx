import { GeneratorSection } from "@/components/generator-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="container mx-auto px-4 pb-2 pt-12 md:pt-16">
          <p className="text-sm font-medium tracking-wide text-primary">三步，左右切换</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            先定阶段，再拿技术组合
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            新项目从尽快上线或压低成本开始。产品要长成多端，或团队已经锁在大型云时，再进入下一层。
          </p>
        </section>

        <GeneratorSection />
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted">© 2026 出海黄金组合</p>
        </div>
      </footer>
    </div>
  )
}
