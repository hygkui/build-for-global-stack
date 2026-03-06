import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download, MessageSquare, XCircle } from 'lucide-react'
import { getStripe } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

const sql = neon(process.env.DATABASE_URL!)

interface ReturnPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutReturnPage({ searchParams }: ReturnPageProps) {
  const { session_id } = await searchParams
  if (!session_id) redirect('/pricing')

  const session = await getStripe().checkout.sessions.retrieve(session_id)

  if (session.status !== 'complete') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-3">支付未完成</h1>
          <p className="text-muted mb-6">你的支付尚未完成，请重新尝试。</p>
          <Link href="/pricing">
            <Button variant="outline">返回定价页</Button>
          </Link>
        </div>
      </main>
    )
  }

  const productId = session.metadata?.productId
  const isTemplate = productId === 'template-code'

  // 从数据库查找订单 ID（用于 MVP 需求填写链接）
  let orderId: string | null = null
  if (!isTemplate) {
    const [row] = await sql`
      SELECT id FROM orders
      WHERE stripe_session_id = ${session_id}
      LIMIT 1
    `
    orderId = row?.id ?? null
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold font-sans text-foreground mb-3">
          支付成功！
        </h1>
        <p className="text-muted leading-relaxed mb-10">
          {isTemplate
            ? '你的模板代码已准备就绪，前往订单页面下载。'
            : '感谢你的信任！我们已收到订单，将在 24 小时内通过邮件联系你确认需求。'}
        </p>

        <div className="border border-border rounded-2xl bg-card p-8 mb-6">
          {isTemplate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-foreground mb-2">
                <Download className="w-5 h-5 text-primary" />
                <span className="font-semibold">模板代码已就绪</span>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                模板代码包含完整的项目结构、AGENTS.md 开发规范、.env.example 配置模板和部署说明，下载后即可开始开发。
              </p>
              <Link href="/dashboard/orders">
                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  前往订单页下载
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-foreground mb-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="font-semibold">下一步：填写项目需求</span>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                请填写详细的项目需求，帮助我们准确理解你的目标。提交后 24 小时内有团队成员邮件联系。
              </p>
              {orderId ? (
                <Link href={`/dashboard/orders/${orderId}/requirements`}>
                  <Button className="w-full gap-2">
                    <MessageSquare className="w-4 h-4" />
                    立即填写需求
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/orders">
                  <Button className="w-full">前往我的订单</Button>
                </Link>
              )}
            </div>
          )}
        </div>

        <Link
          href="/dashboard/orders"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          查看全部订单
        </Link>
      </div>
    </main>
  )
}
