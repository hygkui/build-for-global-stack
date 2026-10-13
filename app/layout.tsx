import type { Metadata, Viewport } from "next"
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Navbar } from "@/components/navbar"
import "./globals.css"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

export const metadata: Metadata = {
  title: "出海黄金组合 - 快速构建出海 MVP",
  description:
    "按目标推荐出海技术栈，生成可以直接交给 AI 编程工具的提示词。",
  keywords: ["出海", "SaaS", "技术栈", "MVP", "Vercel", "Cloudflare"],
  openGraph: {
    title: "出海黄金组合",
    description: "快速构建面向全球市场的 MVP 产品",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-background text-foreground`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  )
}
