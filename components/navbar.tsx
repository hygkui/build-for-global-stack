import Link from "next/link"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton } from "@neondatabase/auth/react"
import { auth } from "@/lib/auth/server"
import { NavbarMobile } from "@/components/navbar-mobile"

export async function Navbar() {
  const { data: session } = await auth.getSession()
  const isLoggedIn = !!session?.user

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg font-bold text-foreground">
            出海黄金组合
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="主导航">
          <Link
            href="/#generator"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            技术栈生成器
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            价格
          </Link>
          {isLoggedIn && (
            <Link
              href="/dashboard/orders"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              我的订单
            </Link>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <UserButton size="icon" />
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">免费注册</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <NavbarMobile isLoggedIn={isLoggedIn} />
      </div>
    </header>
  )
}
