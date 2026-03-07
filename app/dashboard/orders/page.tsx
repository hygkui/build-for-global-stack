import { neon } from "@neondatabase/serverless"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, FileDown, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/server"
import type { Order } from "@/lib/db"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export const metadata = {
  title: "我的订单 - 出海黄金组合",
}

export default async function OrdersPage() {
  const { data: session } = await auth.getSession()
  if (!session?.user) redirect("/auth/sign-in")

  const orders = await sql`
    SELECT id, product_id, product_name, amount_cents, status, tech_stack, requirements, created_at
    FROM orders
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-10">
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-2">
            用户中心
          </p>
          <h1 className="text-3xl font-bold font-sans text-foreground">我的订单</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-2xl bg-card">
            <Package className="w-12 h-12 text-muted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">暂无订单</h2>
            <p className="text-muted text-sm mb-6">
              购买模板代码包或 MVP 外包服务后，订单会显示在这里。
            </p>
            <Link href="/pricing">
              <Button>查看方案</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order as Order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function OrderCard({ order }: { order: Order }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:    { label: "待支付",    color: "text-yellow-500" },
    paid:       { label: "已支付",    color: "text-blue-400" },
    processing: { label: "处理中",    color: "text-accent" },
    completed:  { label: "已完成",    color: "text-green-400" },
    cancelled:  { label: "已取消",    color: "text-muted" },
  }
  const status = statusConfig[order.status] ?? { label: order.status, color: "text-muted" }
  const isTemplate = order.product_id === "template-code"
  const isMvp = order.product_id === "mvp-service"

  return (
    <div className="border border-border rounded-2xl bg-card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{order.product_name}</h3>
          <p className="text-xs text-muted mt-1">
            {new Date(order.created_at).toLocaleDateString("zh-CN")}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-foreground">${order.amount_cents / 100}</p>
          <p className={`text-xs mt-1 font-medium ${status.color}`}>{status.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {isTemplate && order.status === "completed" && (
          <Link href={`/api/download/${order.id}`}>
            <Button size="sm" variant="outline" className="gap-2">
              <FileDown className="w-4 h-4" />
              下载代码
            </Button>
          </Link>
        )}
        {isMvp && order.status === "paid" && (
          <Link href={`/dashboard/orders/${order.id}/requirements`}>
            <Button size="sm" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              填写需求
            </Button>
          </Link>
        )}
        {isMvp && order.status === "processing" && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="w-4 h-4" />
            需求已提交，等待团队联系
          </div>
        )}
        {isMvp && order.status === "completed" && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <Clock className="w-4 h-4" />
            项目已交付
          </div>
        )}
      </div>
    </div>
  )
}
