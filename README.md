# 出海黄金组合

本项目的目的是生成技术栈组合，并且能够配置好直接生成模板文件。

形式是：
1. 提供 web 界面，创建项目，勾选技术栈，并且内置 ai，随时咨询问问题。
2. 保存不同的模板，可以分享和导入
3. 支持 cli，方便的管理自己的模板
4. 完善的文档说明
5. skills 支持导入
6. 可以是 npm 包

## 快速部署

- vercel
- cloudflare worker
- deno
- railway

## 数据库

- neon
- supabase

## 存储

- vercel blob
- CF R2
- aliyun oss
- aws s3

## email

- resend

## pay

- stripe
- Polar.sh

## monitor

- sentry.io

## cache

- upstash
- kv on vercel/deno

## auth

- better-auth
- supabase auth

## ai

- vercel ai
- vercel chat

## cron 定时任务

定时任务的可用方案与部署环境强绑定，**建议在选择 cron 方案前先确定部署平台**：

| 部署平台 | 原生 Cron 支持 | 推荐方案 |
|----------|----------------|----------|
| Vercel | Vercel Cron Jobs（vercel.json，最小间隔 1 分钟） | 原生 / Upstash QStash |
| Cloudflare Workers | Cron Triggers（scheduled() handler） | 原生 / Durable Objects Workflows |
| Railway | 完整支持长时进程 | node-cron / BullMQ / 任意方案 |
| Deno Deploy | Deno.cron() | 原生 / QStash |

**Serverless 平台替代方案（无法运行常驻进程时）：**
- [Upstash QStash](https://upstash.com/docs/qstash)：HTTP 消息队列 + Cron，Serverless 友好，支持重试
- GitHub Actions schedule：无需额外服务，直接调用 API 触发
- Supabase pg_cron + Edge Functions：数据库层触发，仅限已用 Supabase 的项目

> 工具内会根据你选择的部署平台自动提示兼容性，并在有冲突时给出警告。

## ws WebSocket / 实时通信

WebSocket 持久连接需要运行时支持，Serverless 函数通常无法维持长连接：

| 部署平台 | 原生 WS | 推荐方案 |
|----------|---------|----------|
| Vercel | 不支持 | Supabase Realtime / Ably / Pusher / SSE |
| Cloudflare Workers | 支持（Durable Objects） | 原生 WS 或托管方案 |
| Railway | 完整支持 | 直接运行 WS 服务器 |
| Deno Deploy | 有限支持 | Supabase Realtime / Ably |

**托管 WebSocket 方案（适合 Serverless）：**
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)：Postgres 表变更订阅，适合已用 Supabase 的项目
- [Ably](https://ably.com/docs)：托管 WS，全球分布，延迟低
- [Pusher Channels](https://pusher.com/docs/channels)：成熟稳定，免费额度慷慨
- Server-Sent Events (SSE)：单向推送，轻量，Vercel Streaming Functions 原生支持

> 工具内会在你选择的部署平台不支持原生 WS 时自动给出警告和替代方案建议。

## docker 自托管

Docker 方案适合希望将所有服务（应用、数据库、缓存、文件存储）部署到自己服务器的场景。提供两种配置：

- **仅 Dockerfile**：适合手动 `docker run` 或接入 CI/CD 流水线
- **Docker Compose 一站式**：`app + db + cache + storage` 全部打包，`docker compose up -d` 一键启动

**注意**：Docker 自托管属于复杂度较高的定制需求，工具内选择此选项后会自动引导至 **$200 MVP 外包服务**，由团队人工交付完整的基础设施配置、安全加固和部署文档。

## i18n

推荐使用 `next-intl`，并遵循以下规范以避免 i18n 随项目成长失控：

**常见痛点**

- JSON 文件过大（1000+ 行），难以维护
- key 命名随意，无统一规范（`user.name` vs `username` 混用）
- 嵌套层级不一致（有的三层，有的平铺）
- 僵尸 key 大量堆积，无人清理
- 动态拼接 key（如 `t('status.' + code)`）无法静态分析
- 缺乏类型提示，key 写错只在运行时才暴露

**解决方案**

详见生成项目根目录的 `AGENTS.md`，其中包含完整的 i18n 技术规范与落地指南。
