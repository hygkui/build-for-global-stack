import type { Metadata, Viewport } from "next"
import { Navbar } from "@/components/navbar"
import "./globals.css"

export const metadata: Metadata = {
  title: "出海黄金组合 - 面向中国创业者的全球化建站工作台",
  description:
    "为中国出海独立开发者与外贸/SaaS 团队打造：按阶段推荐技术栈，检测兼容性，一键生成 AI 提示词、AGENTS.md 规范与可运行项目 ZIP。",
  keywords: ["出海", "SaaS", "独立站", "技术栈", "MVP", "Vercel", "Cloudflare", "Creem", "出海收款"],
  openGraph: {
    title: "出海黄金组合 - 全球化建站工作台",
    description: "选定阶段、确认技术栈、导出可运行项目代码与 AI 开发规范",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
}

const themeInitScript = `
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
