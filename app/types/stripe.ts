// ── Stripe Payment Types ────────────────────────────────────────

export interface StripePaymentMethod {
  id: string
  object: 'payment_method'
  card?: {
    brand: string
    country: string
    exp_month: number
    exp_year: number
    funding: string
    last4: string
  }
}

export interface StripePaymentIntent {
  id: string
  object: 'payment_intent'
  amount: number
  currency: string
  status: string
  client_secret: string
  payment_method?: string
  metadata?: Record<string, string>
}

export interface StripeConfig {
  publishable_key: string
  mode: 'sandbox' | 'production'
}
