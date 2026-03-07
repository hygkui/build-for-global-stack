export interface TechCategory {
  id: string
  name: string
  description: string
  options: TechOption[]
  multiSelect: boolean
  /** 若为 true，选择该类别中任意选项前需先选好部署平台 */
  requiresDeploymentCheck?: boolean
}

export interface TechOption {
  id: string
  name: string
  description: string
  icon?: string
  docs?: string
  supportsCron?: boolean
  supportsWs?: boolean
  supportsDocker?: boolean
  cronThirdParty?: string
  wsThirdParty?: string
  dockerNote?: string
}

// ─── 兼容性矩阵（按 deployment option id） ─────────────────────────────────
export const DEPLOYMENT_COMPAT: Record<
  string,
  {
    supportsCron: boolean
    supportsWs: boolean
    supportsDocker: boolean
    cronNote: string
    wsNote: string
    dockerNote: string
  }
> = {
  vercel: {
    supportsCron: true,
    supportsWs: false,
    supportsDocker: false,
    cronNote: "原生支持 Vercel Cron Jobs（vercel.json 配置，最小间隔 1 分钟）",
    wsNote: "不支持原生 WebSocket，推荐 Supabase Realtime / Ably / Pusher 托管方案，或用 SSE 替代",
    dockerNote: "Vercel 不支持 Docker，使用专有构建系统。需要 Docker 请改选 Railway / 自托管 VPS。",
  },
  cloudflare: {
    supportsCron: true,
    supportsWs: true,
    supportsDocker: false,
    cronNote: "原生支持 Cron Triggers（scheduled() handler），配合 Workflows 处理多步任务",
    wsNote: "通过 Cloudflare Durable Objects 支持有状态 WebSocket 持久连接",
    dockerNote: "Cloudflare Workers 不支持 Docker，运行于 V8 隔离沙箱（非容器）。需要 Docker 请改选 Railway / 自托管 VPS。",
  },
  railway: {
    supportsCron: true,
    supportsWs: true,
    supportsDocker: true,
    cronNote: "支持长时运行进程，可用 node-cron / BullMQ / crontab 等任意方案",
    wsNote: "支持长时运行服务，可直接运行原生 WebSocket 服务器",
    dockerNote: "原生支持 Dockerfile 和 docker-compose，推荐部署方式，环境完全受控。",
  },
  deno: {
    supportsCron: true,
    supportsWs: false,
    supportsDocker: false,
    cronNote: "Deno Deploy 支持 Deno.cron()，亦可搭配 Upstash QStash",
    wsNote: "Deno Deploy 对持久 WebSocket 支持有限，推荐使用 Supabase Realtime 或 Ably 等托管方案",
    dockerNote: "Deno Deploy 不支持 Docker。可用 Deno 官方 Docker 镜像自建，部署到 Railway / VPS。",
  },
  docker: {
    supportsCron: true,
    supportsWs: true,
    supportsDocker: true,
    cronNote: "完全支持，可使用 node-cron / BullMQ / crontab 等任意方案",
    wsNote: "完全支持，可直接运行原生 WebSocket 服务器（ws / Socket.io）",
    dockerNote: "自托管 Docker，完全掌控运行环境，推荐配合 Nginx 反向代理和 CI/CD 流水线。",
  },
}

export const TECH_STACKS: TechCategory[] = [
  // ── 1. 部署平台（首位）────────────────────────────────────────────────
  {
    id: "deployment",
    name: "部署平台",
    description: "选择你的应用部署目标，会影响 Cron / WebSocket / Docker 的可用方案",
    multiSelect: false,
    options: [
      {
        id: "vercel",
        name: "Vercel",
        description: "零配置部署，全球 CDN，Serverless 架构",
        docs: "https://vercel.com/docs",
        supportsCron: true,
        supportsWs: false,
        supportsDocker: false,
        cronThirdParty: "Vercel Cron Jobs（原生）/ Upstash QStash",
        wsThirdParty: "Supabase Realtime / Ably / Pusher / SSE",
        dockerNote: "不支持 Docker",
      },
      {
        id: "cloudflare",
        name: "Cloudflare Workers",
        description: "边缘计算，超低延迟，原生 Cron 和 Durable Objects WS",
        docs: "https://developers.cloudflare.com/workers/",
        supportsCron: true,
        supportsWs: true,
        supportsDocker: false,
        dockerNote: "不支持 Docker，运行于 V8 隔离沙箱",
      },
      {
        id: "railway",
        name: "Railway",
        description: "支持长时进程 / Docker / Cron / WS，部署灵活",
        docs: "https://docs.railway.app/",
        supportsCron: true,
        supportsWs: true,
        supportsDocker: true,
      },
      {
        id: "deno",
        name: "Deno Deploy",
        description: "Deno 原生 Cron，WS 需借助托管方案",
        docs: "https://deno.com/deploy/docs",
        supportsCron: true,
        supportsWs: false,
        supportsDocker: false,
        wsThirdParty: "Supabase Realtime / Ably",
        dockerNote: "不支持 Docker",
      },
      {
        id: "docker",
        name: "自托管 / VPS",
        description: "Dockerfile + docker-compose，完整掌控环境，支持一切特性",
        docs: "https://docs.docker.com/",
        supportsCron: true,
        supportsWs: true,
        supportsDocker: true,
      },
    ],
  },

  // ── 2. Cron 定时任务（前置，部署后第一优先级配置）──────────────────────
  {
    id: "cron",
    name: "Cron 定时任务",
    description: "需要定期执行任务？兼容性因部署平台而异，建议先选部署平台",
    multiSelect: false,
    requiresDeploymentCheck: true,
    options: [
      {
        id: "native-cron",
        name: "平台原生 Cron",
        description: "Vercel Cron / CF Cron Triggers / Deno.cron — 零额外依赖",
        docs: "https://vercel.com/docs/cron-jobs",
        supportsCron: true,
      },
      {
        id: "qstash",
        name: "Upstash QStash",
        description: "HTTP 消息队列 + Cron，Serverless 友好，自动重试，死信队列",
        docs: "https://upstash.com/docs/qstash",
        supportsCron: true,
      },
      {
        id: "github-actions-cron",
        name: "GitHub Actions",
        description: "schedule 触发 workflow 调用 API，零成本，免费额度充足",
        docs: "https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule",
        supportsCron: true,
      },
      {
        id: "db-cloud-function",
        name: "Supabase pg_cron",
        description: "数据库层 pg_cron + Edge Functions，仅限 Supabase 数据库",
        docs: "https://supabase.com/docs/guides/database/extensions/pg_cron",
        supportsCron: true,
      },
      {
        id: "node-cron",
        name: "node-cron / BullMQ",
        description: "进程内定时任务，仅适用于长时运行服务（Railway / Docker / VPS）",
        docs: "https://github.com/node-schedule/node-schedule",
        supportsCron: true,
      },
    ],
  },

  // ── 3. WebSocket / 实时通信（前置，部署后第二优先级配置）────────────────
  {
    id: "websocket",
    name: "WebSocket / 实时",
    description: "需要实时推送或双向通信？Serverless 平台不支持原生 WS，建议先选部署平台",
    multiSelect: false,
    requiresDeploymentCheck: true,
    options: [
      {
        id: "supabase-realtime",
        name: "Supabase Realtime",
        description: "Postgres 表订阅，基于 WebSocket，适合已用 Supabase 的项目",
        docs: "https://supabase.com/docs/guides/realtime",
        supportsWs: true,
      },
      {
        id: "ably",
        name: "Ably",
        description: "托管 WebSocket，全球分布，Serverless 友好，6M 消息/月免费",
        docs: "https://ably.com/docs",
        supportsWs: true,
      },
      {
        id: "pusher",
        name: "Pusher Channels",
        description: "成熟稳定的托管 WebSocket，200 并发连接/天免费",
        docs: "https://pusher.com/docs/channels",
        supportsWs: true,
      },
      {
        id: "sse",
        name: "Server-Sent Events (SSE)",
        description: "单向服务端推送，无需额外依赖，Vercel Streaming Functions 支持",
        docs: "https://developer.mozilla.org/docs/Web/API/Server-sent_events",
        supportsWs: true,
      },
      {
        id: "cf-durable-objects",
        name: "Cloudflare Durable Objects",
        description: "原生有状态 WS，内嵌 SQLite，仅限 Cloudflare Workers 部署",
        docs: "https://developers.cloudflare.com/durable-objects/",
        supportsWs: true,
      },
      {
        id: "native-ws",
        name: "原生 WebSocket 服务器",
        description: "ws / Socket.io，仅适用于长时运行服务（Railway / Docker / VPS）",
        docs: "https://github.com/websockets/ws",
        supportsWs: true,
      },
    ],
  },

  // ── 4. Docker 打包（前置，影响部署形态）────────────────────────────────
  {
    id: "docker",
    name: "Docker 打包",
    description: "是否需要容器化部署？Serverless 平台（Vercel / CF Workers）不支持",
    multiSelect: false,
    requiresDeploymentCheck: true,
    options: [
      {
        id: "dockerfile-only",
        name: "仅 Dockerfile",
        description: "生成 multi-stage Dockerfile，适合 CI/CD 流水线和云容器平台",
        docs: "https://docs.docker.com/reference/dockerfile/",
        supportsDocker: true,
      },
      {
        id: "docker-compose",
        name: "Dockerfile + docker-compose",
        description: "含 docker-compose.yml，一键启动完整服务栈（应用 + 数据库 + 缓存）",
        docs: "https://docs.docker.com/compose/",
        supportsDocker: true,
      },
      {
        id: "no-docker",
        name: "不需要",
        description: "跳过 Docker 配置，使用平台托管方式部署",
        supportsDocker: false,
      },
    ],
  },

  // ── 5. 数据库 ───────────────────────────────────────────────────────────
  {
    id: "database",
    name: "数据库",
    description: "选择数据库方案",
    multiSelect: false,
    options: [
      {
        id: "neon",
        name: "Neon",
        description: "Serverless PostgreSQL，自动扩缩容",
        docs: "https://neon.tech/docs",
        supportsCron: false,
        supportsWs: false,
        cronThirdParty: "需配合 Vercel Cron / QStash 调用 API 触发",
        wsThirdParty: "不支持实时订阅，需使用 Ably / Pusher 等外部方案",
      },
      {
        id: "supabase",
        name: "Supabase",
        description: "PostgreSQL + 实时订阅 + 存储，内置 pg_cron 和 Realtime WS",
        docs: "https://supabase.com/docs",
        supportsCron: true,
        supportsWs: true,
        cronThirdParty: "pg_cron 插件（数据库层定时任务）+ Edge Functions",
        wsThirdParty: "Supabase Realtime（表订阅，WebSocket）原生支持",
      },
      {
        id: "planetscale",
        name: "PlanetScale",
        description: "Serverless MySQL，分支工作流",
        docs: "https://planetscale.com/docs",
        supportsCron: false,
        supportsWs: false,
        cronThirdParty: "需配合外部 Cron 服务调用 API 触发",
        wsThirdParty: "不支持实时订阅，需使用 Ably / Pusher 等外部方案",
      },
      {
        id: "turso",
        name: "Turso (libSQL)",
        description: "边缘 SQLite，极低延迟，适合 CF Workers",
        docs: "https://docs.turso.tech/",
        supportsCron: false,
        supportsWs: false,
      },
    ],
  },

  // ── 6. 文件存储 ─────────────────────────────────────────────────────────
  {
    id: "storage",
    name: "文件存储",
    description: "上传图片、文件等静态资源",
    multiSelect: false,
    options: [
      {
        id: "vercel-blob",
        name: "Vercel Blob",
        description: "简单易用，与 Vercel 无缝集成",
        docs: "https://vercel.com/docs/storage/vercel-blob",
      },
      {
        id: "cloudflare-r2",
        name: "Cloudflare R2",
        description: "S3 兼容，无出站费用",
        docs: "https://developers.cloudflare.com/r2/",
      },
      {
        id: "aws-s3",
        name: "AWS S3",
        description: "行业标准，功能强大",
        docs: "https://aws.amazon.com/s3/",
      },
      {
        id: "aliyun-oss",
        name: "阿里云 OSS",
        description: "国内访问快速",
        docs: "https://www.aliyun.com/product/oss",
      },
    ],
  },

  // ── 7. 用户认证 ─────────────────────────────────────────────────────────
  {
    id: "auth",
    name: "用户认证",
    description: "登录注册、权限管理",
    multiSelect: false,
    options: [
      {
        id: "better-auth",
        name: "Better Auth",
        description: "现代化认证方案，类型安全",
        docs: "https://www.better-auth.com/docs",
      },
      {
        id: "supabase-auth",
        name: "Supabase Auth",
        description: "集成在 Supabase 中，多种登录方式",
        docs: "https://supabase.com/docs/guides/auth",
      },
      {
        id: "clerk",
        name: "Clerk",
        description: "功能丰富，UI 美观",
        docs: "https://clerk.com/docs",
      },
      {
        id: "auth-js",
        name: "Auth.js",
        description: "灵活配置，支持多种 OAuth",
        docs: "https://authjs.dev/",
      },
    ],
  },

  // ── 8. 支付 ─────────────────────────────────────────────────────────────
  {
    id: "payment",
    name: "支付",
    description: "接受信用卡、订阅付款",
    multiSelect: false,
    options: [
      {
        id: "stripe",
        name: "Stripe",
        description: "全球支付标准，功能完善",
        docs: "https://stripe.com/docs",
      },
      {
        id: "polar",
        name: "Polar.sh",
        description: "面向开发者和创作者的支付平台",
        docs: "https://docs.polar.sh/",
      },
      {
        id: "lemonsqueezy",
        name: "Lemon Squeezy",
        description: "一体化商户服务，含税务处理",
        docs: "https://docs.lemonsqueezy.com/",
      },
    ],
  },

  // ── 9. 邮件服务 ─────────────────────────────────────────────────────────
  {
    id: "email",
    name: "邮件服务",
    description: "发送交易邮件、通知",
    multiSelect: false,
    options: [
      {
        id: "resend",
        name: "Resend",
        description: "现代邮件 API，React Email 支持",
        docs: "https://resend.com/docs",
      },
      {
        id: "sendgrid",
        name: "SendGrid",
        description: "成熟稳定，功能丰富",
        docs: "https://docs.sendgrid.com/",
      },
      {
        id: "postmark",
        name: "Postmark",
        description: "专注交易邮件，送达率高",
        docs: "https://postmarkapp.com/developer",
      },
    ],
  },

  // ── 10. 缓存 ────────────────────────────────────────────────────────────
  {
    id: "cache",
    name: "缓存",
    description: "提升性能，减少数据库查询",
    multiSelect: false,
    options: [
      {
        id: "upstash-redis",
        name: "Upstash Redis",
        description: "Serverless Redis，按请求付费",
        docs: "https://upstash.com/docs/redis",
      },
      {
        id: "vercel-kv",
        name: "Vercel KV",
        description: "基于 Upstash，Vercel 原生集成",
        docs: "https://vercel.com/docs/storage/vercel-kv",
      },
      {
        id: "cloudflare-kv",
        name: "Cloudflare KV",
        description: "全球分布式键值存储",
        docs: "https://developers.cloudflare.com/kv/",
      },
    ],
  },

  // ── 11. 监控 ────────────────────────────────────────────────────────────
  {
    id: "monitoring",
    name: "监控",
    description: "错误追踪、性能分析",
    multiSelect: false,
    options: [
      {
        id: "sentry",
        name: "Sentry.io",
        description: "错误监控与性能分析",
        docs: "https://docs.sentry.io/",
      },
      {
        id: "posthog",
        name: "PostHog",
        description: "产品分析、功能标志",
        docs: "https://posthog.com/docs",
      },
      {
        id: "axiom",
        name: "Axiom",
        description: "日志聚合与查询",
        docs: "https://axiom.co/docs",
      },
    ],
  },

  // ── 12. 国际化 i18n ─────────────────────────────────────────────────────
  {
    id: "i18n",
    name: "国际化 (i18n)",
    description: "多语言支持，出海必备",
    multiSelect: false,
    options: [
      {
        id: "next-intl",
        name: "next-intl",
        description: "Next.js 首选，类型安全，支持 RSC",
        docs: "https://next-intl-docs.vercel.app/",
      },
      {
        id: "i18next",
        name: "i18next / react-i18next",
        description: "生态成熟，插件丰富，适合复杂场景",
        docs: "https://www.i18next.com/",
      },
      {
        id: "lingui",
        name: "Lingui",
        description: "编译时提取，bundle 体积最小",
        docs: "https://lingui.dev/",
      },
    ],
  },
]
