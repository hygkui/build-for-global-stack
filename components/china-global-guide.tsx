import { CreditCard, Globe2, ShieldCheck, Server, ArrowUpRight, AlertCircle, CheckCircle2 } from "lucide-react"

const PAYMENT_ROWS = [
  {
    name: "Creem",
    type: "MoR 代收",
    mainlandSupport: "友好（无需海外公司）",
    tax: "平台代缴全球 VAT/GST",
    fit: "独立开发者、刚起步的出海 SaaS / AI 工具",
    status: "recommended" as const,
    doc: "https://docs.creem.io/",
  },
  {
    name: "Waffo",
    type: "MoR 代收",
    mainlandSupport: "支持打款至大陆银行卡/支付宝",
    tax: "平台代收代缴税费",
    fit: "买家用国际卡支付，国内主体直接收款",
    status: "recommended" as const,
    doc: "https://docs.waffo.ai/",
  },
  {
    name: "Stripe",
    type: "直连支付网关",
    mainlandSupport: "不支持大陆主体",
    tax: "需自行配置 Stripe Tax",
    fit: "已有香港 / 美国 / 新加坡公司及海外银行账户",
    status: "conditional" as const,
    doc: "https://stripe.com/docs",
  },
  {
    name: "Polar.sh",
    type: "MoR（依赖 Stripe）",
    mainlandSupport: "打款走 Stripe，大陆主体收不到",
    tax: "平台处理税费",
    fit: "已有 Stripe 可用地区主体的开源/SaaS 作者",
    status: "caution" as const,
    doc: "https://docs.polar.sh/",
  },
]

const COST_TIERS = [
  {
    title: "零成本验证期（Vercel + Neon）",
    cost: "$0 / 月",
    highlight: "适合 0→1 冷启动",
    items: [
      "Vercel Hobby：免费全球 CDN + 自动预览部署",
      "Neon Free：512MB Postgres + 分支数据库",
      "Creem / Waffo：按交易抽成，无固定月费",
      "Resend Free：每月 3,000 封交易邮件",
    ],
  },
  {
    title: "边缘低成本期（Cloudflare 全家桶）",
    cost: "$0 - $5 / 月",
    highlight: "流量上涨后账单最稳",
    items: [
      "Cloudflare Workers：每天 10 万次免费请求，无冷启动",
      "Cloudflare D1 + KV：边缘 SQLite 与键值缓存",
      "Cloudflare R2：10GB 免费存储，出站流量 0 费用",
      "Cloudflare Registrar：成本价注册海外域名，免国内备案",
    ],
  },
  {
    title: "多端/长时服务（Railway / Droplet）",
    cost: "$5 - $20 / 月",
    highlight: "适合 NestJS / Docker",
    items: [
      "Railway / DigitalOcean：完整 Docker 与长连接支持",
      "原生 Node Cron / BullMQ / WebSocket Gateway",
      "用户前端仍可放 Vercel，API 放长时运行容器",
      "避免一开始就上昂贵复杂的 AWS / 阿里云全家桶",
    ],
  },
]

export function ChinaGlobalGuide() {
  return (
    <section className="container mx-auto max-w-6xl space-y-16 px-4 pb-20 pt-8">
      {/* 出海收款对照 */}
      <div id="china-guide" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <CreditCard className="h-3.5 w-3.5" />
              中国卖家出海第一道门槛
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              先解决「怎么合法把钱收回来」
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted">
            没有香港或美国公司前，不要先折腾 Stripe。优先选 MoR（Merchant of Record）代收模式，把海外税务和合规交给平台。
          </p>
        </div>

        {/* 移动端卡片布局 */}
        <div className="grid gap-3 md:hidden">
          {PAYMENT_ROWS.map((row) => (
            <div key={row.name} className="rounded-xl border border-border bg-card/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <a
                  href={row.doc}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-base font-bold text-foreground hover:text-primary"
                >
                  {row.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </a>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted">{row.type}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {row.status === "recommended" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <AlertCircle
                    className={`h-4 w-4 shrink-0 ${
                      row.status === "conditional" ? "text-yellow-500" : "text-destructive"
                    }`}
                  />
                )}
                <span className={row.status === "recommended" ? "font-medium text-foreground" : "text-muted"}>
                  {row.mainlandSupport}
                </span>
              </div>
              <p className="text-xs text-muted">税务：{row.tax}</p>
              <p className="text-xs text-muted">适用：{row.fit}</p>
            </div>
          ))}
        </div>

        {/* 桌面端表格 */}
        <div className="hidden overflow-hidden rounded-xl border border-border bg-card/60 md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3.5 font-medium">收款方案</th>
                  <th className="px-4 py-3.5 font-medium">模式</th>
                  <th className="px-4 py-3.5 font-medium">中国大陆支持度</th>
                  <th className="px-4 py-3.5 font-medium">全球 VAT 税务</th>
                  <th className="px-4 py-3.5 font-medium">适用场景</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {PAYMENT_ROWS.map((row) => (
                  <tr key={row.name} className="transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      <a
                        href={row.doc}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        {row.name}
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{row.type}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5">
                        {row.status === "recommended" ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <AlertCircle
                            className={`h-4 w-4 shrink-0 ${
                              row.status === "conditional" ? "text-yellow-500" : "text-destructive"
                            }`}
                          />
                        )}
                        <span
                          className={
                            row.status === "recommended"
                              ? "font-medium text-foreground"
                              : "text-muted"
                          }
                        >
                          {row.mainlandSupport}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{row.tax}</td>
                    <td className="px-4 py-3.5 text-muted">{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 架构与成本对比 */}
      <div id="cost-compare" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground">
              <Server className="h-3.5 w-3.5 text-primary" />
              月度起步成本预估
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              用最低固定成本跑通海外验证
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted">
            海外用户遍布欧美日韩，直接用全球边缘节点 + Serverless，既省去服务器运维，也省去国内域名备案流程。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {COST_TIERS.map((tier) => (
            <div
              key={tier.title}
              className="flex flex-col rounded-xl border border-border bg-card/70 p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {tier.highlight}
                </span>
                <span className="font-mono text-lg font-bold text-foreground">{tier.cost}</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">{tier.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {tier.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 出海建站三大原则 */}
      <div className="grid gap-4 rounded-2xl border border-border bg-secondary/20 p-6 md:grid-cols-3">
        <div className="space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Globe2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">海外域名与免备案部署</h3>
          <p className="text-xs leading-relaxed text-muted">
            在 Cloudflare Registrar 或 Porkbun 注册域名，服务器部署在 Vercel / Cloudflare / Railway 海外节点，面向海外用户无需等待国内 ICP 备案。
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">欧美合规基础三件套</h3>
          <p className="text-xs leading-relaxed text-muted">
            上线前务必补齐 Privacy Policy、Terms of Service 与 Refund Policy 页面，并在表单或 Cookie 提示中遵循 GDPR 基本告知原则。
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <CreditCard className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">邮件送达率决定留存</h3>
          <p className="text-xs leading-relaxed text-muted">
            海外客户习惯用邮箱登录和收发票，切忌用国内邮箱直连 SMTP。使用 Resend 并正确配置 SPF / DKIM / DMARC 记录，避免进入 Gmail 垃圾箱。
          </p>
        </div>
      </div>
    </section>
  )
}
