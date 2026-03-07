import { redirect } from "next/navigation"
import { PRODUCTS } from "@/lib/products"
import { auth } from "@/lib/auth/server"
import CheckoutPageClient from "@/components/checkout-page-client"

export const dynamic = "force-dynamic"

interface CheckoutPageProps {
  searchParams: Promise<{ product?: string; techStack?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { product: productId, techStack } = await searchParams

  if (!productId) redirect("/pricing")

  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) redirect("/pricing")

  const { data: session } = await auth.getSession()
  if (!session?.user) {
    redirect(`/auth/sign-in?redirect=/checkout?product=${productId}`)
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-2">
            安全结账
          </p>
          <h1 className="text-3xl font-bold font-sans text-foreground mb-2">
            {product.name}
          </h1>
          <p className="text-muted">{product.description}</p>
        </div>

        {/* 订单摘要 */}
        <div className="border border-border rounded-xl p-5 mb-6 bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">订单摘要</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{product.name}</span>
            <span className="text-foreground font-semibold">
              ${product.priceInCents / 100}
            </span>
          </div>
          <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
            <span className="font-semibold text-foreground">总计</span>
            <span className="font-bold text-foreground text-lg">
              ${product.priceInCents / 100}
            </span>
          </div>
        </div>

        <CheckoutPageClient productId={product.id} techStack={techStack} />
      </div>
    </main>
  )
}
