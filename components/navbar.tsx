import Link from "next/link"
import { Globe, Sparkles } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30 transition-transform group-hover:scale-105">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-bold tracking-tight text-foreground">
              出海黄金组合
            </span>
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary sm:inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Build for Global
            </span>
          </div>
        </Link>

        <nav aria-label="主导航" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#generator"
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            方案生成器
          </Link>
          <Link
            href="/#china-guide"
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            收款与避坑
          </Link>
          <Link
            href="/#agent-access"
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            MCP & Skill
          </Link>
        </nav>
      </div>
    </header>
  )
}
