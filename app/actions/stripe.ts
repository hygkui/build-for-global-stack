"use server"

import { getStripe } from "@/lib/stripe"
import { getProductById } from "@/lib/products"
import { getSql } from "@/lib/db"
import { auth } from "@/lib/auth/server"

export async function createCheckoutSession(
  productId: string,
  techStack?: string
): Promise<string> {
  const product = getProductById(productId)
  if (!product) throw new Error(`Product "${productId}" not found`)

  const { data: session } = await auth.getSession()
  if (!session?.user) throw new Error("Unauthenticated")

  const userId = session.user.id

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const checkoutSession = await getStripe().checkout.sessions.create({
    ui_mode: "embedded",
    return_url: `${appUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: product.priceInCents,
          product_data: {
            name: product.name,
            description: product.description,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      userId,
      productId,
      techStack: techStack ?? "",
    },
  })

  // 创建 pending 订单，用 stripe_session_id 关联
  await getSql()`
    INSERT INTO orders (user_id, product_id, product_name, amount_cents, status, stripe_session_id, tech_stack)
    VALUES (
      ${userId},
      ${productId},
      ${product.name},
      ${product.priceInCents},
      'pending',
      ${checkoutSession.id},
      ${techStack ?? null}
    )
  `

  return checkoutSession.client_secret!
}
