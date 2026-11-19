import type { Metadata, Viewport } from "next"
import { Navbar } from "@/components/navbar"
import "./globals.css"

export const metadata: Metadata = {
  title: "出海黄金组合 - 把产品卖向全球，3 分钟配齐收款与技术栈",
  description:
    "中国创业者出海建站工作台：避开 Stripe 开户与域名备案卡点，自动排查云服务冲突，一键导出可运行代码与 AI 开发提示词。",
  keywords: ["出海", "SaaS", "独立站", "技术栈", "MVP", "Vercel", "Cloudflare", "Creem", "出海收款"],
  openGraph: {
    title: "出海黄金组合 - 中国创业者出海建站工作台",
    description: "选定阶段、确认黄金组合、一键导出可运行代码与 AI 开发规范",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
}

const themeInitScript = `
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
