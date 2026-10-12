export interface GoalRecommendation {
  id: string
  platform: string
  title: string
  summary: string
  fit: string
  caution?: string
  stack: Record<string, string>
}

/** 首页主推：先按目标给组合，而不是让人选平台清单 */
export const PRIMARY_GOALS: GoalRecommendation[] = [
  {
    id: "ship-fast",
    platform: "Vercel",
    title: "尽快把产品发出去",
    summary: "独立开发者的默认组合。部署零配置，数据库、登录和支付都用托管服务。",
    fit: "落地页、订阅制 SaaS、先验证有没有人付钱",
    stack: {
      deployment: "vercel",
      database: "neon",
      orm: "drizzle",
      storage: "vercel-blob",
      auth: "better-auth",
      payment: "creem",
      email: "resend",
      cache: "upstash-redis",
      monitoring: "sentry",
      i18n: "next-intl",
    },
  },
  {
    id: "cost-less",
    platform: "Cloudflare",
    title: "用更低的成本跑在边缘",
    summary: "Workers、D1、R2、KV 放在一起。流量上来之后，账单仍比较可控。",
    fit: "全球访问、想避开传统云主机的产品",
    stack: {
      starter: "tanstarter",
      deployment: "cloudflare",
      database: "d1",
      orm: "drizzle",
      storage: "cloudflare-r2",
      auth: "better-auth",
      payment: "creem",
      email: "resend",
      cache: "cloudflare-kv",
      monitoring: "sentry",
    },
  },
  {
    id: "void-vite",
    platform: "Void · 内测",
    title: "用 Vite 一条命令部署",
    summary: "void.cloud 把 Vite 应用变成全栈，void deploy 落到 Cloudflare Workers，并开通 D1、KV、R2、队列和 Cron。不用先学 Workers 控制台。",
    fit: "已经在用 Vite（React、Vue、Svelte 或 Solid），想少碰云控制台",
    caution: "还在内测，没有完全开放。生成方案前先确认自己拿得到访问权限。",
    stack: {
      deployment: "void",
      database: "d1",
      orm: "drizzle",
      storage: "cloudflare-r2",
      cache: "cloudflare-kv",
      auth: "better-auth",
      payment: "creem",
      email: "resend",
    },
  },
]

export const STRUCTURE_GOAL: GoalRecommendation = {
  id: "full-product",
  platform: "NestJS Monorepo",
  title: "Web、管理后台和 App 一起做",
  summary: "pnpm + Turborepo。用户站 Next.js + shadcn，管理端 Arco，移动端 Expo，API 用 NestJS、Drizzle 和 Better Auth。用户站仍可放 Vercel；NestJS 需要长时进程，用 Railway 或 DigitalOcean，不必先上阿里云、AWS 或 Azure。",
  fit: "中大型、多端（Web + Admin + iOS/Android）、需要模块化后端",
  caution: "小型 MVP 和纯单页会过重。那种情况用上面的 Vercel 或 Cloudflare。",
  stack: {
    starter: "fullstack-monorepo",
    database: "postgres",
    orm: "drizzle",
    auth: "better-auth",
    payment: "creem",
    i18n: "i18next",
  },
}

export const ENTERPRISE_GOALS: GoalRecommendation[] = [
  {
    id: "enterprise-aliyun",
    platform: "阿里云",
    title: "继续用阿里云",
    summary: "账号、备案或合规已经在阿里云上。做出海产品时，它不是默认起点。",
    fit: "国内云账号和专有网络已经就位",
    stack: { deployment: "aliyun", storage: "aliyun-oss", database: "postgres", orm: "prisma" },
  },
  {
    id: "enterprise-aws",
    platform: "AWS",
    title: "继续用 AWS",
    summary: "团队、账单和网络都在 AWS。新的出海 MVP 通常用不到这一层。",
    fit: "已有 AWS 组织和合规要求",
    stack: { deployment: "aws", storage: "aws-s3", database: "postgres", orm: "prisma" },
  },
  {
    id: "enterprise-azure",
    platform: "Azure",
    title: "继续用 Azure",
    summary: "公司标准云是 Azure 时再选。个人产品和早期 SaaS 优先 Vercel 或 Cloudflare。",
    fit: "企业采购和目录已经锁定 Azure",
    stack: { deployment: "azure", database: "postgres", orm: "prisma" },
  },
]
