"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavbarMobileProps {
  isLoggedIn: boolean
}

export function NavbarMobile({ isLoggedIn }: NavbarMobileProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? "关闭菜单" : "打开菜单"}
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <div
        className={cn(
          "absolute left-0 right-0 top-16 border-t border-border bg-background px-4 pb-4 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-3 pt-4" aria-label="移动端导航">
          <Link
            href="/#generator"
            className="text-sm text-muted transition-colors hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            技术栈生成器
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted transition-colors hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            价格
          </Link>
          {isLoggedIn && (
            <Link
              href="/dashboard/orders"
              className="text-sm text-muted transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              我的订单
            </Link>
          )}
          {!isLoggedIn && (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  登录
                </Button>
              </Link>
              <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">
                  免费注册
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  )
}
