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
    "为出海开发者提供技术栈选择、提示词生成、代码模板和 MVP 外包服务。免费获取提示词，$20 下载可运行代码，$200 完整 MVP 交付。",
  keywords: ["出海", "SaaS", "技术栈", "MVP", "代码模板", "Neon", "Stripe", "Vercel"],
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
          redirectTo="/dashboard/orders"
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
