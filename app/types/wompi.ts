// ── Wompi Payment Types ─────────────────────────────────────────

export type WompiTransactionStatus = 'APPROVED' | 'DECLINED' | 'VOIDED' | 'PENDING' | 'ERROR'

export interface WompiPaymentMethod {
  id: number
  name: string
  dynamic: boolean
  required_fields: string[]
}

export interface WompiTransaction {
  id: string
  reference: string
  amount_in_cents: number
  currency: string
  status: WompiTransactionStatus
  payment_method: WompiPaymentMethodData
  customer_email?: string
  created_at?: string
}

export interface WompiPaymentMethodData {
  type: string
  token?: string
  installments?: number
  card?: {
    number: string
    cvc: string
    exp_month: string
    exp_year: string
    card_holder: string
  }
  phone_number?: string
  financial_institution_code?: string
  user_type?: string
  user_legal_id_type?: string
  user_legal_id?: string
}

export interface WompiAcceptance {
  permalink: string
  signature: string
}

export interface WompiConfig {
  public_key: string
  mode: 'sandbox' | 'production'
}
