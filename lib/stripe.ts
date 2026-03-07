import "server-only"
import Stripe from "stripe"

let _stripe: Stripe | undefined

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    })
  }
  return _stripe
}
