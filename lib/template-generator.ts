/**
 * 根据用户选择的技术栈生成可运行的 Next.js 项目代码文件
 * 返回一个 Record<文件路径, 文件内容> 的 Map 用于 ZIP 打包
 */

import { generateAgentsMd } from "@/lib/agents-md"

export type TechStack = Record<string, string>

export interface TemplateOptions {
  projectName?: string
  businessType?: string
  languages?: string[]
}

function sanitizeSlug(name?: string): string {
  const cleaned = (name ?? "my-global-saas")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return cleaned || "my-global-saas"
}

export function generateTemplateFiles(
  techStack: TechStack,
  options: TemplateOptions = {}
): Record<string, string> {
  const projectSlug = sanitizeSlug(options.projectName)
  const displayName = options.projectName?.trim() || "My Global SaaS"
  const businessType = options.businessType?.trim() || "SaaS 订阅产品"
  const languages = options.languages?.length ? options.languages : ["en", "zh"]

  const deploy = techStack["deployment"] ?? "vercel"
  const db = techStack["database"] ?? "neon"
  const orm = techStack["orm"] ?? "drizzle"
  const auth = techStack["auth"] ?? "better-auth"
  const payment = techStack["payment"] ?? "creem"
  const i18n = techStack["i18n"]
  const cron = techStack["cron"]
  const ws = techStack["websocket"]
  const docker = techStack["docker"]
  const email = techStack["email"]

  const files: Record<string, string> = {}

  // ── package.json ──────────────────────────────────────────────────────
  const deps: Record<string, string> = {
    next: "15.2.4",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    "lucide-react": "^0.469.0",
    "tailwindcss-animate": "^1.0.7",
  }
  const devDeps: Record<string, string> = {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    typescript: "^5",
    tailwindcss: "^3.4.17",
    autoprefixer: "^10.4.20",
    postcss: "^8",
    eslint: "^9",
    "eslint-config-next": "15.2.4",
  }

  if (db === "neon" || db === "neon-serverless") {
    deps["@neondatabase/serverless"] = "^0.10.4"
  } else if (db === "supabase") {
    deps["@supabase/supabase-js"] = "^2.47.10"
  } else if (db === "planetscale") {
    deps["@planetscale/database"] = "^1.19.0"
  }

  if (orm === "drizzle") {
    deps["drizzle-orm"] = "^0.40.0"
    devDeps["drizzle-kit"] = "^0.30.0"
  } else if (orm === "prisma") {
    deps["@prisma/client"] = "^6.4.0"
    devDeps["prisma"] = "^6.4.0"
  }

  if (auth === "neon-auth") {
    deps["@neondatabase/auth"] = "0.2.0-beta.1"
    deps["server-only"] = "^0.0.1"
  } else if (auth === "supabase-auth") {
    deps["@supabase/ssr"] = "^0.6.1"
  } else if (auth === "clerk") {
    deps["@clerk/nextjs"] = "^6.10.0"
  } else if (auth === "better-auth") {
    deps["better-auth"] = "^1.2.7"
  } else if (auth === "auth-js") {
    deps["next-auth"] = "^5.0.0-beta.25"
  }

  if (payment === "stripe") {
    deps["stripe"] = "^17.5.0"
    deps["@stripe/stripe-js"] = "^5.5.0"
    deps["@stripe/react-stripe-js"] = "^3.1.0"
  } else if (payment === "lemonsqueezy") {
    deps["@lemonsqueezy/lemonsqueezy.js"] = "^3.3.1"
  }

  if (email === "resend") {
    deps["resend"] = "^4.1.2"
  }

  if (i18n === "next-intl") {
    deps["next-intl"] = "^4.1.0"
  } else if (i18n === "i18next") {
    deps["i18next"] = "^25.0.0"
    deps["react-i18next"] = "^15.0.0"
  }

  if (cron === "qstash") {
    deps["@upstash/qstash"] = "^2.7.19"
  } else if (cron === "node-cron") {
    deps["node-cron"] = "^3.0.3"
    devDeps["@types/node-cron"] = "^3.0.11"
  }

  if (ws === "ably") {
    deps["ably"] = "^2.9.0"
  } else if (ws === "pusher") {
    deps["pusher"] = "^5.2.0"
    deps["pusher-js"] = "^8.4.0"
    devDeps["@types/pusher"] = "^2.2.2"
  }

  files["package.json"] = JSON.stringify(
    {
      name: projectSlug,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: deps,
      devDependencies: devDeps,
    },
    null,
    2
  )

  // ── .env.example ──────────────────────────────────────────────────────
  const envLines: string[] = [
    "# ── 数据库 ──────────────────────────────────────────────────────────",
    "DATABASE_URL=",
    "",
  ]

  if (auth === "better-auth") {
    envLines.push("# ── Better Auth ───────────────────────────────────────────────────")
    envLines.push("BETTER_AUTH_SECRET=  # openssl rand -base64 32")
    envLines.push("BETTER_AUTH_URL=http://localhost:3000")
    envLines.push("")
  } else if (auth === "neon-auth") {
    envLines.push("# ── Neon Auth ──────────────────────────────────────────────────────")
    envLines.push("NEON_AUTH_BASE_URL=")
    envLines.push("NEON_AUTH_COOKIE_SECRET=  # openssl rand -base64 32")
    envLines.push("")
  } else if (auth === "supabase-auth") {
    envLines.push("# ── Supabase ──────────────────────────────────────────────────────")
    envLines.push("NEXT_PUBLIC_SUPABASE_URL=")
    envLines.push("NEXT_PUBLIC_SUPABASE_ANON_KEY=")
    envLines.push("SUPABASE_SERVICE_ROLE_KEY=")
    envLines.push("")
  } else if (auth === "clerk") {
    envLines.push("# ── Clerk Auth ────────────────────────────────────────────────────")
    envLines.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=")
    envLines.push("CLERK_SECRET_KEY=")
    envLines.push("")
  }

  if (payment === "creem") {
    envLines.push("# ── Creem (Merchant of Record，适合无海外公司卖家) ────────────────")
    envLines.push("CREEM_API_KEY=")
    envLines.push("CREEM_WEBHOOK_SECRET=")
    envLines.push("")
  } else if (payment === "waffo") {
    envLines.push("# ── Waffo (Merchant of Record，支持打款至大陆) ────────────────────")
    envLines.push("WAFFO_API_KEY=")
    envLines.push("WAFFO_WEBHOOK_SECRET=")
    envLines.push("")
  } else if (payment === "stripe") {
    envLines.push("# ── Stripe ────────────────────────────────────────────────────────")
    envLines.push("STRIPE_SECRET_KEY=")
    envLines.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=")
    envLines.push("STRIPE_WEBHOOK_SECRET=")
    envLines.push("")
  } else if (payment === "lemonsqueezy") {
    envLines.push("# ── Lemon Squeezy ────────────────────────────────────────────────")
    envLines.push("LEMONSQUEEZY_API_KEY=")
    envLines.push("LEMONSQUEEZY_WEBHOOK_SECRET=")
    envLines.push("")
  }

  if (email === "resend") {
    envLines.push("# ── Resend 邮件服务 ────────────────────────────────────────────────")
    envLines.push("RESEND_API_KEY=")
    envLines.push("")
  }

  if (cron === "qstash") {
    envLines.push("# ── Upstash QStash ────────────────────────────────────────────────")
    envLines.push("QSTASH_TOKEN=")
    envLines.push("QSTASH_CURRENT_SIGNING_KEY=")
    envLines.push("QSTASH_NEXT_SIGNING_KEY=")
    envLines.push("")
  }

  if (ws === "ably") {
    envLines.push("# ── Ably ──────────────────────────────────────────────────────────")
    envLines.push("ABLY_API_KEY=")
    envLines.push("")
  } else if (ws === "pusher") {
    envLines.push("# ── Pusher ────────────────────────────────────────────────────────")
    envLines.push("PUSHER_APP_ID=")
    envLines.push("PUSHER_KEY=")
    envLines.push("PUSHER_SECRET=")
    envLines.push("PUSHER_CLUSTER=ap1")
    envLines.push("NEXT_PUBLIC_PUSHER_KEY=")
    envLines.push("NEXT_PUBLIC_PUSHER_CLUSTER=ap1")
    envLines.push("")
  }

  envLines.push("# ── App ───────────────────────────────────────────────────────────")
  envLines.push("NEXT_PUBLIC_APP_URL=http://localhost:3000")

  files[".env.example"] = envLines.join("\n")

  // ── tsconfig.json ──────────────────────────────────────────────────────
  files["tsconfig.json"] = JSON.stringify(
    {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2
  )

  // ── next.config.mjs ────────────────────────────────────────────────────
  const nextConfigLines: string[] = ["/** @type {import('next').NextConfig} */", "const nextConfig = {"]
  if (docker === "dockerfile-only" || docker === "docker-compose") {
    nextConfigLines.push("  output: 'standalone',")
  }
  nextConfigLines.push("}", "", "export default nextConfig")
  files["next.config.mjs"] = nextConfigLines.join("\n")

  // ── tailwind.config.ts ─────────────────────────────────────────────────
  files["tailwind.config.ts"] = `import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
`

  // ── app/globals.css ────────────────────────────────────────────────────
  const cssImports: string[] = []
  if (auth === "neon-auth") cssImports.push('@import "@neondatabase/auth/ui/tailwind";')

  files["app/globals.css"] = `${cssImports.join("\n")}${cssImports.length ? "\n\n" : ""}@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`

  // ── middleware.ts ──────────────────────────────────────────────────────
  if (auth === "neon-auth") {
    files["middleware.ts"] = `import { auth } from "@/lib/auth/server"

export default auth.middleware({
  loginUrl: "/auth/sign-in",
})

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
}
`
  } else if (auth === "clerk") {
    files["middleware.ts"] = `import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/account(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
}
`
  }

  // ── lib/db.ts ──────────────────────────────────────────────────────────
  if (db === "neon" || db === "neon-serverless") {
    files["lib/db.ts"] = orm === "drizzle"
      ? `import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
export { sql }
`
      : `import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }
`
  } else if (db === "supabase") {
    files["lib/db.ts"] = `import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
`
  }

  // ── lib/auth/server.ts ──────────────────────────────────────────────────
  if (auth === "better-auth") {
    files["lib/auth/server.ts"] = `import { betterAuth } from "better-auth"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  // TODO: Wire your Drizzle / Postgres adapter here
})
`
    files["lib/auth/client.ts"] = `"use client"

import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
})
`
    files["app/api/auth/[...all]/route.ts"] = `import { auth } from "@/lib/auth/server"
import { toNextJsHandler } from "better-auth/next-js"

export const { POST, GET } = toNextJsHandler(auth)
`
  } else if (auth === "neon-auth") {
    files["lib/auth/server.ts"] = `import { createNeonAuth } from "@neondatabase/auth/next/server"

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
})
`
    files["lib/auth/client.ts"] = `"use client"

import { createAuthClient } from "@neondatabase/auth/next"

export const authClient = createAuthClient()
`
  } else if (auth === "clerk") {
    files["lib/auth/server.ts"] = `import { auth } from "@clerk/nextjs/server"
export { auth }
`
  }

  // ── Payment webhooks ───────────────────────────────────────────────────
  if (payment === "creem") {
    files["app/api/webhooks/creem/route.ts"] = `import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("creem-signature")
  const secret = process.env.CREEM_WEBHOOK_SECRET

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 })
  }

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(body)
  if (event.eventType === "checkout.completed" || event.eventType === "subscription.active") {
    // TODO: Grant user entitlement in database
    console.log("Creem payment verified:", event.object?.id)
  }

  return NextResponse.json({ ok: true })
}
`
  } else if (payment === "waffo") {
    files["app/api/webhooks/waffo/route.ts"] = `import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  // TODO: Verify Waffo webhook signature using WAFFO_WEBHOOK_SECRET
  console.log("Waffo webhook received:", body?.event)
  return NextResponse.json({ ok: true })
}
`
  } else if (payment === "stripe") {
    files["lib/stripe.ts"] = `import "server-only"
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
})
`
    files["app/api/webhooks/stripe/route.ts"] = `import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    console.log("Payment completed:", session.id)
    // TODO: Update your database order status here
  }

  return NextResponse.json({ ok: true })
}
`
  }

  // ── app/layout.tsx ──────────────────────────────────────────────────────
  const layoutImports: string[] = ['import type { Metadata } from "next"', 'import "./globals.css"']
  let layoutProviderOpen = ""
  let layoutProviderClose = ""

  if (auth === "neon-auth") {
    layoutImports.push('import { NeonAuthUIProvider } from "@neondatabase/auth/react"')
    layoutImports.push('import { authClient } from "@/lib/auth/client"')
    layoutProviderOpen = '        <NeonAuthUIProvider authClient={authClient} redirectTo="/dashboard" emailOTP credentials={{ forgotPassword: true }}>'
    layoutProviderClose = "        </NeonAuthUIProvider>"
  } else if (auth === "clerk") {
    layoutImports.push('import { ClerkProvider } from "@clerk/nextjs"')
    layoutProviderOpen = "        <ClerkProvider>"
    layoutProviderClose = "        </ClerkProvider>"
  }

  files["app/layout.tsx"] = `${layoutImports.join("\n")}

export const metadata: Metadata = {
  title: "${displayName}",
  description: "${businessType} — Built for Global Customers",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="${languages[0] ?? "en"}">
      <body className="antialiased">
${layoutProviderOpen ? layoutProviderOpen + "\n          {children}\n" + layoutProviderClose : "        {children}"}
      </body>
    </html>
  )
}
`

  // ── app/page.tsx ────────────────────────────────────────────────────────
  files["app/page.tsx"] = `export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium mb-4">
          ${businessType} · Languages: ${languages.join(", ")}
        </span>
        <h1 className="text-4xl font-bold mb-4">${displayName}</h1>
        <p className="text-muted-foreground mb-8">
          Built with Next.js${db ? ` + ${db}` : ""}${payment ? ` + ${payment}` : ""}
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Get Started
        </a>
      </div>
    </main>
  )
}
`

  // ── app/dashboard/page.tsx ──────────────────────────────────────────────
  if (auth === "neon-auth") {
    files["app/dashboard/page.tsx"] = `import { auth } from "@/lib/auth/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) redirect("/auth/sign-in")

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, {session.user.email}</p>
    </main>
  )
}
`
  } else {
    files["app/dashboard/page.tsx"] = `export default function DashboardPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">${displayName} Dashboard</h1>
      <p className="text-muted-foreground">Ready for global customers.</p>
    </main>
  )
}
`
  }

  // ── Auth pages (Neon Auth) ──────────────────────────────────────────────
  if (auth === "neon-auth") {
    files["app/auth/[path]/page.tsx"] = `import { AuthView } from "@neondatabase/auth/react"

export const dynamicParams = false

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "sign-out" },
    { path: "forgot-password" },
  ]
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <AuthView path={path} />
    </main>
  )
}
`

    files["app/account/[path]/page.tsx"] = `import { AccountView } from "@neondatabase/auth/react"
import { accountViewPaths } from "@neondatabase/auth/react/ui/server"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params
  return (
    <main className="container mx-auto p-4 md:p-8">
      <AccountView path={path} />
    </main>
  )
}
`

    files["app/api/auth/[...path]/route.ts"] = `import { auth } from "@/lib/auth/server"

export const { GET, POST } = auth.handler()
`
  }

  // ── Cron handler ────────────────────────────────────────────────────────
  if (cron === "native-cron" || cron === "qstash") {
    files["app/api/cron/daily/route.ts"] = `import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("Daily cron job executed at", new Date().toISOString())
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
}
`
  }

  // ── WebSocket (SSE) ──────────────────────────────────────────────────────
  if (ws === "sse") {
    files["app/api/events/route.ts"] = `export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("data: connected\\n\\n"))
      const interval = setInterval(() => {
        const data = JSON.stringify({ timestamp: new Date().toISOString() })
        controller.enqueue(encoder.encode(\`data: \${data}\\n\\n\`))
      }, 5000)
      return () => clearInterval(interval)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
`
  }

  // ── Docker files ────────────────────────────────────────────────────────
  if (docker === "dockerfile-only" || docker === "docker-compose") {
    files["Dockerfile"] = `FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
`
    files[".dockerignore"] = `Dockerfile
.dockerignore
node_modules
npm-debug.log
.next
.git
.env*
!.env.example
`
  }

  if (docker === "docker-compose") {
    files["docker-compose.yml"] = `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
      - NODE_ENV=production
    restart: unless-stopped
`
  }

  // ── AGENTS.md ───────────────────────────────────────────────────────────
  files["AGENTS.md"] = generateAgentsMd(techStack)

  // ── README.md ────────────────────────────────────────────────────────────
  const readmeLines: string[] = [
    `# ${displayName}`,
    "",
    `> ${businessType} · Target Languages: ${languages.join(", ")}`,
    "> Generated by [出海黄金组合](https://github.com/hygkui/build-for-global)",
    "",
    "## Tech Stack",
    "",
  ]

  const stackLabels: Record<string, string> = {
    deployment: "Deployment",
    database: "Database",
    orm: "ORM",
    auth: "Auth",
    payment: "Payment",
    email: "Email",
    i18n: "i18n",
    cron: "Cron",
    websocket: "WebSocket",
    docker: "Docker",
  }

  for (const [key, label] of Object.entries(stackLabels)) {
    if (techStack[key]) {
      readmeLines.push(`- **${label}**: ${techStack[key]}`)
    }
  }

  readmeLines.push(
    "",
    "## Getting Started",
    "",
    "1. Copy `.env.example` to `.env.local` and fill in your values",
    "2. Install dependencies:",
    "   ```bash",
    "   pnpm install",
    "   ```",
    "3. Run the development server:",
    "   ```bash",
    "   pnpm dev",
    "   ```",
    "4. Open [http://localhost:3000](http://localhost:3000)",
    "",
    "## AI Collaboration",
    "",
    "See `AGENTS.md` for coding standards, i18n rules, and deployment constraints.",
    "",
    "## Deploy",
    ""
  )

  if (deploy === "vercel") {
    readmeLines.push("Deploy to Vercel:", "", "[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)")
  } else if (deploy === "railway") {
    readmeLines.push("Deploy to Railway:", "", "[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)")
  } else if (docker === "dockerfile-only" || docker === "docker-compose") {
    readmeLines.push("Build and run with Docker:", "", "```bash", "docker compose up -d", "```")
  }

  files["README.md"] = readmeLines.join("\n")

  return files
}
