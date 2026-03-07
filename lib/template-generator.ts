/**
 * 根据用户选择的技术栈生成可运行的 Next.js 项目代码文件
 * 返回一个 Record<文件路径, 文件内容> 的 Map 用于 ZIP 打包
 */

export type TechStack = Record<string, string>

export function generateTemplateFiles(techStack: TechStack): Record<string, string> {
  const deploy = techStack["deployment"] ?? "vercel"
  const db = techStack["database"] ?? "neon"
  const auth = techStack["auth"] ?? "neon-auth"
  const payment = techStack["payment"] ?? "stripe"
  const i18n = techStack["i18n"]
  const cron = techStack["cron"]
  const ws = techStack["websocket"]
  const docker = techStack["docker"]

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

  if (auth === "neon-auth") {
    deps["@neondatabase/auth"] = "0.2.0-beta.1"
    deps["server-only"] = "^0.0.1"
  } else if (auth === "supabase-auth") {
    deps["@supabase/ssr"] = "^0.6.1"
  } else if (auth === "clerk") {
    deps["@clerk/nextjs"] = "^6.10.0"
  } else if (auth === "better-auth") {
    deps["better-auth"] = "^1.2.7"
  }

  if (payment === "stripe") {
    deps["stripe"] = "^17.5.0"
    deps["@stripe/stripe-js"] = "^5.5.0"
    deps["@stripe/react-stripe-js"] = "^3.1.0"
  } else if (payment === "lemonsqueezy") {
    deps["@lemonsqueezy/lemonsqueezy.js"] = "^3.3.1"
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
      name: "my-saas-app",
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

  if (auth === "neon-auth") {
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

  if (payment === "stripe") {
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
    files["lib/db.ts"] = `import { neon } from "@neondatabase/serverless"

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
  if (auth === "neon-auth") {
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

  // ── lib/stripe.ts ──────────────────────────────────────────────────────
  if (payment === "stripe") {
    files["lib/stripe.ts"] = `import "server-only"
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
})
`
  }

  // ── app/layout.tsx ──────────────────────────────────────────────────────
  const layoutImports: string[] = ['import type { Metadata } from "next"', 'import { Inter } from "next/font/google"', 'import "./globals.css"']
  const layoutSetup: string[] = ['const inter = Inter({ subsets: ["latin"] })']
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

${layoutSetup.join("\n")}

export const metadata: Metadata = {
  title: "My SaaS App",
  description: "Built with the Golden Combo for Global SaaS",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
${layoutProviderOpen ? layoutProviderOpen + "\n          {children}\n" + layoutProviderClose : "        {children}"}
      </body>
    </html>
  )
}
`

  // ── app/page.tsx ────────────────────────────────────────────────────────
  files["app/page.tsx"] = `export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to My SaaS App</h1>
        <p className="text-muted-foreground mb-8">
          Built with Next.js${db === "neon" || db === "neon-serverless" ? " + Neon" : db === "supabase" ? " + Supabase" : ""}${payment === "stripe" ? " + Stripe" : ""}
        </p>
        <a href="/dashboard" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
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
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground">You are logged in.</p>
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

  // ── Stripe webhook ──────────────────────────────────────────────────────
  if (payment === "stripe") {
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

  // ── Cron handler ────────────────────────────────────────────────────────
  if (cron === "native-cron" || cron === "qstash") {
    files["app/api/cron/daily/route.ts"] = `import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Verify the request comes from the cron scheduler
  const authHeader = req.headers.get("authorization")
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // TODO: Add your cron job logic here
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
      // Send initial connection message
      controller.enqueue(encoder.encode("data: connected\\n\\n"))

      // TODO: Add your real-time event logic here
      const interval = setInterval(() => {
        const data = JSON.stringify({ timestamp: new Date().toISOString() })
        controller.enqueue(encoder.encode(\`data: \${data}\\n\\n\`))
      }, 5000)

      // Cleanup on close
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

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
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

  # Uncomment if you need a local database
  # db:
  #   image: postgres:16-alpine
  #   environment:
  #     POSTGRES_DB: myapp
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: postgres
  #   ports:
  #     - "5432:5432"
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data

# volumes:
#   postgres_data:
`
  }

  // ── README.md ────────────────────────────────────────────────────────────
  const readmeLines: string[] = [
    "# My SaaS App",
    "",
    "> Generated by [出海黄金组合](https://build-for-global.vercel.app)",
    "",
    "## Tech Stack",
    "",
  ]

  const stackLabels: Record<string, string> = {
    deployment: "Deployment",
    database: "Database",
    auth: "Auth",
    payment: "Payment",
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
