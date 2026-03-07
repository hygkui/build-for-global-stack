import { neon } from "@neondatabase/serverless"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth/server"
import RequirementsForm from "@/components/requirements-form"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export const metadata = {
  title: "填写项目需求 - 出海黄金组合",
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function RequirementsPage({ params }: Props) {
  const { id } = await params

  const { data: session } = await auth.getSession()
  if (!session?.user) redirect("/auth/sign-in")

  const [order] = await sql`
    SELECT id, product_id, product_name, status
    FROM orders
    WHERE id = ${id} AND user_id = ${session.user.id}
  `

  if (!order || order.product_id !== "mvp-service") notFound()

  if (order.status === "processing" || order.status === "completed") {
    return (
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">需求已提交</h1>
          <p className="text-muted leading-relaxed">
            你的项目需求已成功提交，我们的团队将在 24 小时内通过邮件与你联系。
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-2">
            MVP 外包服务
          </p>
          <h1 className="text-3xl font-bold font-sans text-foreground mb-2">
            填写项目需求
          </h1>
          <p className="text-muted leading-relaxed">
            请尽量详细描述你的项目，帮助我们准确理解目标、减少沟通成本、更快交付。
          </p>
        </div>
        <RequirementsForm orderId={id} />
      </div>
    </main>
  )
}
