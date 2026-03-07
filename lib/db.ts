import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

function createSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(process.env.DATABASE_URL)
}

let _sql: NeonQueryFunction<any, any> | undefined

export function getSql(): NeonQueryFunction<any, any> {
  if (!_sql) {
    _sql = createSql()
  }
  return _sql
}

export interface Order {
  id: string
  user_id: string
  product_id: string
  product_name: string
  amount_cents: number
  currency: string
  status: "pending" | "paid" | "processing" | "completed" | "cancelled"
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  tech_stack: Record<string, string[]> | null
  download_url: string | null
  download_expires_at: string | null
  requirements: string | null
  requirements_submitted_at: string | null
  created_at: string
  updated_at: string
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM orders
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return rows as Order[]
}

export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM orders
    WHERE stripe_session_id = ${sessionId}
    LIMIT 1
  `
  return (rows as unknown as Order[])[0] ?? null
}

export async function createOrder(data: {
  userId: string
  productId: string
  productName: string
  amountCents: number
  stripeSessionId: string
  techStack?: Record<string, string[]>
}): Promise<Order> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO orders (
      user_id, product_id, product_name, amount_cents,
      stripe_session_id, tech_stack, status
    ) VALUES (
      ${data.userId},
      ${data.productId},
      ${data.productName},
      ${data.amountCents},
      ${data.stripeSessionId},
      ${data.techStack ? JSON.stringify(data.techStack) : null},
      'pending'
    )
    RETURNING *
  `
  return (rows as unknown as Order[])[0]
}

export async function updateOrderStatus(
  sessionId: string,
  status: Order["status"],
  extra?: { downloadUrl?: string; paymentIntentId?: string }
): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE orders
    SET
      status = ${status},
      download_url = COALESCE(${extra?.downloadUrl ?? null}, download_url),
      stripe_payment_intent_id = COALESCE(${extra?.paymentIntentId ?? null}, stripe_payment_intent_id),
      updated_at = NOW()
    WHERE stripe_session_id = ${sessionId}
  `
}
