// ── MercadoPago Payment Types ────────────────────────────────────

export interface MercadoPagoPreference {
  id: string
  init_point: string
  sandbox_init_point: string
  items: Array<{
    id: string
    title: string
    quantity: number
    currency_id: string
    unit_price: number
  }>
}

export interface MercadoPagoPayment {
  id: number
  status: string
  status_detail: string
  transaction_amount: number
  currency_id: string
  description: string
  payment_method_id: string
  external_reference?: string
}

export interface MercadoPagoCardToken {
  id: string
  cardholder: {
    name: string
    identification: {
      type: string
      number: string
    }
  }
}
