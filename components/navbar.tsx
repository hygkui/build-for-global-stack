import Link from "next/link"
import { Globe, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        <Link href="/" className="flex min-h-10 min-w-0 shrink items-center gap-2 group sm:gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30 transition-transform group-hover:scale-105 sm:h-8 sm:w-8">
            <Globe className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" />
          </div>
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate font-serif text-sm font-bold tracking-tight text-foreground sm:text-lg">
              出海黄金组合
            </span>
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary md:inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Build for Global
            </span>
          </div>
        </Link>

        <nav aria-label="主导航" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/#generator"
            className="inline-flex min-h-9 whitespace-nowrap items-center rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:bg-secondary/60 hover:text-foreground sm:min-h-10 sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">生成</span>
            <span className="hidden sm:inline">方案生成</span>
          </Link>
          <Link
            href="/#china-guide"
            className="inline-flex min-h-9 whitespace-nowrap items-center rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:bg-secondary/60 hover:text-foreground sm:min-h-10 sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">收款</span>
            <span className="hidden sm:inline">收款与避坑</span>
          </Link>
          <Link
            href="/#agent-access"
            className="inline-flex min-h-9 whitespace-nowrap items-center rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:bg-secondary/60 hover:text-foreground sm:min-h-10 sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">MCP</span>
            <span className="hidden sm:inline">MCP & Skill</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
