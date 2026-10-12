import type { Metadata, Viewport } from "next"
import { Inter, Syne, JetBrains_Mono } from "next/font/google"
import { NeonAuthUIProvider } from "@neondatabase/auth/react"
import { authClient } from "@/lib/auth/client"
import { Navbar } from "@/components/navbar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" })
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
        className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-background text-foreground`}
      >
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/"
          emailOTP
          credentials={{ forgotPassword: true }}
        >
          <Navbar />
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  )
}
