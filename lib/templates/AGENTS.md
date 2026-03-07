# AGENTS.md — 项目 AI 协作规范

本文件作为项目的 AI 编码指南，适用于 Cursor、Copilot、v0 等 AI 工具。
所有 AI 生成的代码必须遵守以下规范，以保证代码质量可长期维护。

---

## i18n 规范

### 技术选型

- 使用 `next-intl` 作为唯一 i18n 方案
- 语言文件存放于 `messages/` 目录，每种语言一个文件（`en.json`、`zh.json` 等）
- 通过 TypeScript 类型推导保证 key 安全

---

### 目录结构

```
messages/
  en.json          # 英文（主语言，source of truth）
  zh.json          # 中文
  ja.json          # 日文（如需）

lib/
  i18n/
    config.ts      # 支持语言列表、默认语言
    types.ts       # 自动推导的类型（不要手写）
    enums.ts       # 动态 key 枚举兜底
```

---

### JSON 文件规范

#### 1. 模块化命名，两层为主，最多三层

```json
// ✅ 正确：模块.功能
{
  "auth": {
    "signIn": "Sign in",
    "signUp": "Sign up",
    "signOut": "Sign out",
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailTaken": "This email is already registered"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "orders": "Orders",
    "emptyState": "No orders yet"
  }
}

// ❌ 错误：扁平无结构 / 超过三层嵌套
{
  "signIn": "Sign in",
  "auth_signup_form_input_email_placeholder": "Enter email"
}
```

#### 2. key 命名规则

| 规则 | 示例 |
|------|------|
| camelCase | `signIn`、`errorMessage`、`emptyState` |
| 模块前缀隔离 | `auth.*`、`pricing.*`、`common.*` |
| 通用文案归入 `common` | `common.save`、`common.cancel`、`common.loading` |
| 错误文案归入模块的 `errors` | `auth.errors.invalidCredentials` |
| 页面级文案归入页面模块 | `pricing.title`、`pricing.cta` |

#### 3. `common` 模块——UI 通用文案

所有跨页面复用的 UI 文案必须放在 `common`，不得在各模块重复定义：

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "submitting": "Submitting...",
    "back": "Back",
    "next": "Next",
    "learnMore": "Learn more",
    "getStarted": "Get started",
    "copyToClipboard": "Copy to clipboard",
    "copied": "Copied!",
    "required": "This field is required",
    "optional": "Optional"
  }
}
```

---

### 动态 key——必须用枚举兜底

**禁止**字符串拼接动态 key，一律使用枚举映射：

```typescript
// ❌ 禁止：动态拼接，无法静态检测
const label = t(`status.${order.status}`)

// ✅ 正确：枚举映射，类型安全
// lib/i18n/enums.ts
export const ORDER_STATUS_KEYS = {
  pending:    'orders.status.pending',
  paid:       'orders.status.paid',
  processing: 'orders.status.processing',
  completed:  'orders.status.completed',
  cancelled:  'orders.status.cancelled',
} as const satisfies Record<OrderStatus, string>

// 使用
const label = t(ORDER_STATUS_KEYS[order.status])
```

同理适用于：错误码、通知类型、分类标签等所有动态场景。

---

### 类型安全配置

在 `lib/i18n/types.ts` 中自动推导类型，不要手写：

```typescript
// lib/i18n/types.ts
import type en from '@/messages/en.json'

// 自动推导所有 key 的类型
export type Messages = typeof en

// 声明给 next-intl 使用
declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages
  }
}
```

这样写错或漏写 key 时，TypeScript 编译阶段就会报错。

---

### next-intl 基础配置

```typescript
// lib/i18n/config.ts
export const locales = ['en', 'zh'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

// i18n/request.ts（Next.js App Router）
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale } from '@/lib/i18n/config'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})
```

---

### 防止僵尸 key

定期运行以下脚本检测未使用的 key（可集成到 CI）：

```bash
# 安装检测工具
pnpm add -D i18n-ally  # VSCode 插件，实时高亮未使用 key

# 或使用 CLI 工具
npx unplugin-vue-i18n --report-unused
```

**AI 编码规则**：每次新增 key 必须同步在对应页面或组件中实际调用，不得预先添加未使用的 key。

---

### 新增翻译的操作流程

1. **英文为主语言**：所有新 key 先写入 `messages/en.json`
2. **同步其他语言**：立即在 `messages/zh.json` 等文件中补充对应翻译，值可暂时留英文占位，但 key 必须存在
3. **遵循命名规范**：归入正确模块，camelCase，不超过三层嵌套
4. **动态场景用枚举**：在 `lib/i18n/enums.ts` 中添加映射
5. **类型自动更新**：`types.ts` 会自动推导，无需手动改动

---

### AI 工具约束（Cursor / Copilot / v0）

在此项目中，AI 助手必须遵守：

- 新增 i18n key 时，同时更新 `en.json` 和 `zh.json`
- 不得使用字符串拼接构造动态 key
- 不得在模块内重复定义已存在于 `common` 的文案
- key 命名必须 camelCase，归入正确模块
- 动态 key 场景，必须在 `lib/i18n/enums.ts` 中用枚举管理
- 删除功能时，同步删除对应的 i18n key，不得留下僵尸 key

---

## 其他规范（持续补充）

> 本文件随项目成长持续更新。新增技术规范时，直接追加对应章节。
