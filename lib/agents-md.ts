/**
 * 生成项目 AGENTS.md 的内容
 * 包含 i18n、Cron、WebSocket 的技术规范，作为 AI 协作开发的默认指导文件
 */

import { TECH_STACKS, DEPLOYMENT_COMPAT, type TechOption } from "@/lib/tech-stacks"

export type SelectedStack = Record<string, string>

function getOptionName(categoryId: string, optionId: string): string {
  return (
    TECH_STACKS.find((c) => c.id === categoryId)?.options.find((o) => o.id === optionId)
      ?.name ?? optionId
  )
}

export function generateAgentsMd(selected: SelectedStack): string {
  const lines: string[] = []
  const deployId = selected["deployment"]
  const compat = deployId ? DEPLOYMENT_COMPAT[deployId] : null

  lines.push("# AGENTS.md — AI 协作开发规范")
  lines.push("")
  lines.push("> 本文件由「出海黄金组合」自动生成，供 AI 编程助手（Cursor、Claude、v0 等）遵循。")
  lines.push("> 所有 AI 生成的代码必须符合以下规范，不得偏离。")
  lines.push("")

  // ── 技术栈概览 ──
  lines.push("## 项目技术栈")
  lines.push("")
  for (const category of TECH_STACKS) {
    const optionId = selected[category.id]
    if (!optionId) continue
    const option = category.options.find((o) => o.id === optionId)
    if (!option) continue
    lines.push(`- **${category.name}**: ${option.name}`)
  }
  lines.push("")

  // ── 通用编码规范 ──
  lines.push("## 通用编码规范")
  lines.push("")
  lines.push("- 语言：TypeScript，严格模式（`strict: true`），不允许 `any`")
  lines.push("- 框架：Next.js App Router，优先使用 Server Components（RSC）")
  lines.push("- 样式：Tailwind CSS + shadcn/ui，禁止内联 style")
  lines.push("- 数据获取：Server Components 直接 fetch / SWR 用于客户端状态同步，禁止 `useEffect` 内 fetch")
  lines.push("- 表单 / 数据变更：使用 Server Actions，配合 `useActionState`")
  lines.push("- 错误处理：所有 Server Action 和 API Route 必须有 try/catch，返回结构化错误")
  lines.push("- 环境变量：敏感变量只在服务端使用，客户端变量使用 `NEXT_PUBLIC_` 前缀")
  lines.push("")

  // ── i18n 规范 ──
  if (selected["i18n"]) {
    const i18nName = getOptionName("i18n", selected["i18n"])
    lines.push(`## 国际化（i18n）规范 — ${i18nName}`)
    lines.push("")
    lines.push("### 文件结构（强制）")
    lines.push("")
    lines.push("```")
    lines.push("messages/")
    lines.push("  en/")
    lines.push("    common.json      # 通用 UI 文案：按钮、状态、表单标签、错误提示")
    lines.push("    auth.json        # 认证页面：登录、注册、重置密码")
    lines.push("    dashboard.json   # 仪表盘业务文案")
    lines.push("    [page].json      # 每个主要页面一个文件")
    lines.push("  zh/")
    lines.push("    ...              # 完全镜像 en/ 结构，key 必须一一对应")
    lines.push("```")
    lines.push("")
    lines.push("### key 命名规范（强制）")
    lines.push("")
    lines.push("使用 `模块.功能.状态` 三层结构：")
    lines.push("")
    lines.push("```json")
    lines.push("// 正确")
    lines.push('{')
    lines.push('  "auth": {')
    lines.push('    "login": {')
    lines.push('      "button": "Log in",')
    lines.push('      "title": "Welcome back",')
    lines.push('      "error": {')
    lines.push('        "invalid_credentials": "Invalid email or password"')
    lines.push('      }')
    lines.push('    }')
    lines.push('  }')
    lines.push('}')
    lines.push("")
    lines.push("// 错误（禁止）")
    lines.push('{')
    lines.push('  "loginButton": "Log in",          // 禁止平铺')
    lines.push('  "login_title": "Welcome back",    // 禁止下划线')
    lines.push('  "a.b.c.d.e": "too deep"           // 禁止超过三层')
    lines.push('}')
    lines.push("```")
    lines.push("")
    lines.push("### 动态 key（强制使用枚举）")
    lines.push("")
    lines.push("```typescript")
    lines.push("// 错误 — 动态拼接无法静态分析")
    lines.push("t(`errors.${statusCode}`)")
    lines.push("")
    lines.push("// 正确 — 枚举兜底")
    lines.push("const ERROR_KEYS = {")
    lines.push("  400: 'errors.bad_request',")
    lines.push("  401: 'errors.unauthorized',")
    lines.push("  404: 'errors.not_found',")
    lines.push("  500: 'errors.server_error',")
    lines.push("} as const")
    lines.push("t(ERROR_KEYS[statusCode] ?? 'errors.unknown')")
    lines.push("```")
    lines.push("")
    lines.push("### 类型安全配置")
    lines.push("")
    if (selected["i18n"] === "next-intl") {
      lines.push("```typescript")
      lines.push("// global.d.ts")
      lines.push("import en from './messages/en/common.json'")
      lines.push("type Messages = typeof en")
      lines.push("declare global {")
      lines.push("  interface IntlMessages extends Messages {}")
      lines.push("}")
      lines.push("```")
      lines.push("")
      lines.push("- 在 `tsconfig.json` 中配置 `next-intl` TypeScript 插件")
      lines.push("- `useTranslations` 的 key 参数有编译期类型检查，写错立即报错")
    } else if (selected["i18n"] === "i18next") {
      lines.push("```typescript")
      lines.push("// @types/i18next.d.ts")
      lines.push("import en from '../messages/en/common.json'")
      lines.push("declare module 'i18next' {")
      lines.push("  interface CustomTypeOptions {")
      lines.push("    defaultNS: 'common'")
      lines.push("    resources: { common: typeof en }")
      lines.push("  }")
      lines.push("}")
      lines.push("```")
    } else if (selected["i18n"] === "lingui") {
      lines.push("- Lingui 在编译时（`lingui compile`）验证所有 `t()` 调用")
      lines.push("- 配置 `lingui.config.ts` 启用 TypeScript 类型生成")
    }
    lines.push("")
    lines.push("### 僵尸 key 治理")
    lines.push("")
    lines.push("- 安装 VSCode 插件 `i18n Ally`，实时高亮未使用的 key")
    lines.push("- PR checklist：新增 key 必须在所有语言文件中同步添加（CI 可加自动校验）")
    lines.push("- 每季度运行 `i18n-ally` 全量扫描，清理僵尸 key")
    lines.push("")
  }

  // ── Cron 规范 ──
  if (selected["cron"]) {
    const cronName = getOptionName("cron", selected["cron"])
    lines.push(`## Cron 定时任务规范 — ${cronName}`)
    lines.push("")
    if (compat) {
      lines.push(`当前部署平台（${getOptionName("deployment", deployId!)}）：${compat.cronNote}`)
      lines.push("")
    }
    lines.push("### 安全要求（强制）")
    lines.push("")
    lines.push("所有 Cron API 端点必须验证调用来源，防止未经授权触发：")
    lines.push("")
    lines.push("```typescript")
    lines.push("// app/api/cron/[task]/route.ts")
    lines.push("export async function GET(req: Request) {")
    lines.push("  // Vercel / GitHub Actions 等通过 Header 传入密钥")
    lines.push("  const authHeader = req.headers.get('authorization')")
    lines.push("  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {")
    lines.push("    return Response.json({ error: 'Unauthorized' }, { status: 401 })")
    lines.push("  }")
    lines.push("  // 执行任务...")
    lines.push("}")
    lines.push("```")
    lines.push("")
    lines.push("### 幂等性要求（强制）")
    lines.push("")
    lines.push("- 所有 Cron 任务必须是幂等的（重复执行结果相同）")
    lines.push("- 使用数据库记录任务执行状态，防止重复处理")
    lines.push("- 任务执行时长超过 10 秒需拆分或使用队列异步处理")
    lines.push("")
    lines.push("### 日志要求")
    lines.push("")
    lines.push("- 任务开始 / 完成 / 失败必须记录日志（含时间戳和任务标识）")
    lines.push("- 失败时发送告警通知（邮件 / Slack）")
    lines.push("")
  }

  // ── WebSocket 规范 ──
  if (selected["websocket"]) {
    const wsName = getOptionName("websocket", selected["websocket"])
    lines.push(`## WebSocket / 实时通信规范 — ${wsName}`)
    lines.push("")
    if (compat) {
      lines.push(
        `当前部署平台（${getOptionName("deployment", deployId!)}）：${
          compat.supportsWs ? compat.wsNote : "⚠ " + compat.wsNote
        }`
      )
      lines.push("")
    }
    lines.push("### 连接管理")
    lines.push("")
    lines.push("- 客户端必须实现断线重连（指数退避，最大 5 次）")
    lines.push("- 连接关闭时必须取消所有订阅，防止内存泄漏")
    lines.push("- 使用 React `useEffect` cleanup 函数管理订阅生命周期")
    lines.push("")
    lines.push("```typescript")
    lines.push("useEffect(() => {")
    lines.push("  const channel = subscribe(handler)")
    lines.push("  return () => channel.unsubscribe() // 清理订阅")
    lines.push("}, [])")
    lines.push("```")
    lines.push("")
    lines.push("### 权限控制（强制）")
    lines.push("")
    lines.push("- 订阅前必须验证用户身份（token / session）")
    lines.push("- 频道 / 房间命名使用用户 ID 隔离：`user:{userId}:notifications`")
    lines.push("- 禁止在客户端广播敏感数据（如其他用户的私信）")
    lines.push("")
    lines.push("### 消息格式（统一）")
    lines.push("")
    lines.push("```typescript")
    lines.push("interface RealtimeMessage<T = unknown> {")
    lines.push("  type: string        // 事件类型，如 'message.created'")
    lines.push("  payload: T          // 事件数据")
    lines.push("  timestamp: string   // ISO 8601")
    lines.push("}")
    lines.push("```")
    lines.push("")
  }

  // ── 提交规范 ──
  lines.push("## Git 提交规范")
  lines.push("")
  lines.push("使用 Conventional Commits 格式：")
  lines.push("")
  lines.push("```")
  lines.push("feat(auth): add magic link login")
  lines.push("fix(i18n): remove zombie keys in dashboard.json")
  lines.push("chore(cron): add CRON_SECRET validation")
  lines.push("```")
  lines.push("")
  lines.push("类型：`feat` | `fix` | `docs` | `chore` | `refactor` | `test` | `perf`")
  lines.push("")

  // ── 环境变量规范 ──
  lines.push("## 环境变量规范")
  lines.push("")
  lines.push("- 所有变量必须在 `.env.example` 中有对应条目和注释")
  lines.push("- 客户端可访问：使用 `NEXT_PUBLIC_` 前缀")
  lines.push("- 敏感变量（API Key、密钥）：仅服务端，禁止 `NEXT_PUBLIC_`")
  lines.push("- 变量缺失时应用启动时立即 throw，不允许静默降级")
  lines.push("")
  lines.push("```typescript")
  lines.push("// lib/env.ts — 环境变量校验")
  lines.push("function requireEnv(key: string): string {")
  lines.push("  const val = process.env[key]")
  lines.push("  if (!val) throw new Error(`Missing required env var: ${key}`)")
  lines.push("  return val")
  lines.push("}")
  lines.push("```")
  lines.push("")

  lines.push("---")
  lines.push("")
  lines.push(
    `> 本文件由 [出海黄金组合](https://github.com/hygkui/build-for-global) 生成 · ${new Date().toISOString().slice(0, 10)}`
  )

  return lines.join("\n")
}
