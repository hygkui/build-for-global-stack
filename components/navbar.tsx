import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        <Link href="/" className="flex min-h-10 min-w-0 shrink items-center gap-2 group sm:gap-2.5">
          <BrandLogo className="h-7 w-7 shrink-0 rounded-lg shadow-sm shadow-primary/25 transition-transform group-hover:scale-105 sm:h-8 sm:w-8" />
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate font-serif text-sm font-bold tracking-tight text-foreground sm:text-lg">
              出海黄金组合
            </span>
            <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary md:inline-flex">
              Global Stack
            </span>
          </div>
        </Link>

        <nav aria-label="主导航" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/#generator"
            className="inline-flex min-h-9 whitespace-nowrap items-center rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:bg-secondary hover:text-foreground sm:min-h-10 sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">配置</span>
            <span className="hidden sm:inline">方案生成</span>
          </Link>
          <Link
            href="/#china-guide"
            className="inline-flex min-h-9 whitespace-nowrap items-center rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:bg-secondary hover:text-foreground sm:min-h-10 sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">收款</span>
            <span className="hidden sm:inline">收款与避坑</span>
          </Link>
          <Link
            href="/#agent-access"
            className="inline-flex min-h-9 whitespace-nowrap items-center rounded-lg px-2 text-xs font-medium text-muted transition-colors hover:bg-secondary hover:text-foreground sm:min-h-10 sm:px-3 sm:text-sm"
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
