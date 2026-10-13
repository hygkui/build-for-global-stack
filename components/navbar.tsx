import Link from "next/link"
import { Globe } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg font-bold text-foreground">
            出海黄金组合
          </span>
        </Link>

        <nav aria-label="主导航">
          <Link
            href="/#generator"
            className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-foreground"
          >
            按目标推荐
          </Link>
        </nav>
      </div>
    </header>
  )
}
