import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { getSql } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const productId = session.metadata?.productId
    const sessionId = session.id

    if (productId === "template-code") {
      // $20 自动交付：更新为 completed，下载链接指向 API 路由（按订单 ID 生成）
      await getSql()`
        UPDATE orders
        SET
          status = 'completed',
          stripe_payment_intent_id = ${session.payment_intent as string | null},
          updated_at = NOW()
        WHERE stripe_session_id = ${sessionId}
      `
    } else if (productId === "mvp-service") {
      // $200 人工交付：更新为 paid，等待用户填写需求
      await getSql()`
        UPDATE orders
        SET
          status = 'paid',
          stripe_payment_intent_id = ${session.payment_intent as string | null},
          updated_at = NOW()
        WHERE stripe_session_id = ${sessionId}
      `
    }
  }

  return NextResponse.json({ ok: true })
}
