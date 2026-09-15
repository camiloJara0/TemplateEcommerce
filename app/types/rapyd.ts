// ── Rapyd Payment Types ────────────────────────────────────────

export type RapydPaymentStatus = 'ACT' | 'CLO' | 'CAN' | 'ERR' | 'EXP' | 'REV'

export type RapydPaymentMethodCategory =
  | 'card'
  | 'bank_redirect'
  | 'bank_transfer'
  | 'cash'
  | 'ewallet'
  | 'rapyd_ewallet'

export type RapydNextAction =
  | '3d_verification'
  | 'pending_capture'
  | 'pending_confirmation'
  | 'pending_offline_capture'
  | 'not_applicable'

// ── Rapyd API Response Types ──────────────────────────────────

export interface RapydPaymentOption {
  name: string
  type: string
  regex?: string
  description?: string
  is_required: boolean | string
  is_updatable?: boolean
  required_fields?: RapydRequiredField[]
}

export interface RapydAmountRangePerCurrency {
  currency: string
  maximum_amount: number | null
  minimum_amount: number | null
}

export interface RapydPaymentMethodAPIItem {
  type: string
  name: string
  category: RapydPaymentMethodCategory
  image: string
  country: string
  payment_flow_type: string
  currencies: string[]
  status: number
  is_cancelable: boolean
  payment_options: RapydPaymentOption[]
  is_expirable: boolean
  is_online: boolean
  is_refundable: boolean
  minimum_expiration_seconds: number | null
  maximum_expiration_seconds: number | null
  virtual_payment_method_type: string | null
  is_virtual: boolean
  multiple_overage_allowed: boolean
  amount_range_per_currency: RapydAmountRangePerCurrency[]
  is_tokenizable: boolean
  supported_digital_wallet_providers: string[]
  is_restricted: boolean
  supports_subscription: boolean
  supports_aft: boolean
  is_allowed_cancel_refund: boolean
}

export interface RapydRequiredField {
  name: string
  type: string
  regex?: string
  description?: string
  instructions?: string
  is_required: boolean | string
  is_updatable?: boolean
  conditions?: Array<{
    description: string
    element_name: string
    operator: string
    threshold_value: string | string[]
  }>
}

export interface RapydRequiredFieldsResponse {
  type: string
  fields: RapydRequiredField[]
  payment_method_options: RapydPaymentOption[]
  payment_options: RapydPaymentOption[]
  minimum_expiration_seconds: number
  maximum_expiration_seconds: number
}

// ── Frontend Config Types ─────────────────────────────────────

export type RapydPaymentMethodType = string

export interface RapydPaymentMethodConfig {
  id: string
  name: string
  description: string
  icon: string
  category: RapydPaymentMethodCategory
  enabled: boolean
  fields: string[]
  image?: string
  [key: string]: unknown
}

// ── API Request Types ─────────────────────────────────────────

export interface RapydAddress {
  name?: string
  line_1?: string
  line_2?: string
  line_3?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  phone_number?: string
  metadata?: Record<string, unknown>
}

export interface RapydCustomer {
  id?: string
  name?: string
  email?: string
  phone_number?: string
  address?: RapydAddress
  business_vat_id?: string
  metadata?: Record<string, unknown>
}

export interface RapydClientDetails {
  ip_address?: string
  accept_header?: string
  language?: string
  screen_color_depth?: number
  screen_height?: number
  screen_width?: number
  time_zone_offset?: number
  java_enabled?: boolean
  java_script_enabled?: boolean
}

export interface RapydPaymentMethodFields {
  [key: string]: string | undefined
}

export interface RapydPaymentMethod {
  type: string
  fields: RapydPaymentMethodFields
}

export interface RapydCreatePaymentRequest {
  amount: number
  currency: string
  payment_method?: RapydPaymentMethod
  customer?: string | RapydCustomer
  description?: string
  merchant_reference_id?: string
  complete_payment_url?: string
  error_payment_url?: string
  capture?: boolean
  save_payment_method?: boolean
  statement_descriptor?: string
  ewallet?: string
  metadata?: Record<string, unknown>
  client_details?: RapydClientDetails
  payment_method_options?: Record<string, unknown>
}

// ── API Response Types ────────────────────────────────────────

export interface RapydPaymentMethodData {
  id?: string
  type?: string
  category?: RapydPaymentMethodCategory
  image?: string
  last4?: string
  expiration_month?: string
  expiration_year?: string
  bin_details?: {
    bin_number?: string
    brand?: string
    country?: string
    issuer?: string
    level?: string
    type?: string
  }
  fingerprint_token?: string
  next_action?: RapydNextAction
  authentication_url?: string
}

export interface RapydPaymentResponse {
  id: string
  amount: number
  status: RapydPaymentStatus
  currency_code: string
  description?: string
  customer_token?: string
  payment_method?: string
  payment_method_data?: RapydPaymentMethodData
  payment_method_type?: string
  payment_method_type_category?: RapydPaymentMethodCategory
  next_action?: RapydNextAction
  redirect_url?: string
  complete_payment_url?: string
  error_payment_url?: string
  auth_code?: string
  captured?: boolean
  paid?: boolean
  paid_at?: number
  expiration?: number
  created_at?: number
  merchant_reference_id?: string
  metadata?: Record<string, unknown>
  instructions?: {
    name?: string
    steps?: Record<string, string>
  }
  textual_codes?: Record<string, string>
  visual_codes?: Record<string, string>
  failure_code?: string
  failure_message?: string
  error_code?: string
  error_message?: string
}

// ── Webhook Types ─────────────────────────────────────────────

export interface RapydWebhookPayload {
  type: string
  data: {
    id: string
    amount?: number
    status?: RapydPaymentStatus
    currency_code?: string
    customer_token?: string
    payment_method?: string
    payment_method_type?: string
    metadata?: Record<string, unknown>
    [key: string]: unknown
  }
  timestamp?: number
}

// ── Frontend-specific types ───────────────────────────────────

export interface RapydPaymentPayload {
  order_id: number
  payment_method_type: string
  amount: number
  currency: string
  [key: string]: unknown
}

// ── Category icon map ─────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  card: 'i-lucide-credit-card',
  bank_redirect: 'i-lucide-building-2',
  bank_transfer: 'i-lucide-building-2',
  cash: 'i-lucide-store',
  ewallet: 'i-lucide-smartphone',
  rapyd_ewallet: 'i-lucide-smartphone',
}

// ── Name-based icon overrides for common Colombian methods ────

const METHOD_ICON_OVERRIDES: Record<string, string> = {
  'co_visa_card': 'i-lucide-credit-card',
  'co_mastercard_card': 'i-lucide-credit-card',
  'co_amex_card': 'i-lucide-credit-card',
  'co_diners_card': 'i-lucide-credit-card',
  'co_pse_bank_transfer': 'i-lucide-landmark',
  'co_nequi_ewallet': 'i-lucide-smartphone',
  'co_bancolombia_button': 'i-lucide-landmark',
  'co_efecty_cash': 'i-lucide-store',
  'co_baloto_cash': 'i-lucide-store',
}

function getIconForMethod(type: string, category: string): string {
  if (METHOD_ICON_OVERRIDES[type]) return METHOD_ICON_OVERRIDES[type]
  if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category]
  return 'i-lucide-circle-help'
}

// ── Convert Rapyd API item to config ──────────────────────────

export function rapydApiItemToConfig(item: RapydPaymentMethodAPIItem): RapydPaymentMethodConfig {
  const requiredFieldNames: string[] = (item.payment_options ?? [])
    .filter(o => o.type === 'customer' && o.required_fields)
    .flatMap(o => (o.required_fields ?? []).map(f => f.name))

  return {
    id: item.type,
    name: item.name,
    description: item.name,
    icon: getIconForMethod(item.type, item.category),
    category: item.category,
    enabled: item.status === 1,
    fields: requiredFieldNames,
    image: item.image,
  }
}

// ── Static fallback (used when API fails) ─────────────────────

export const RAPYD_PAYMENT_METHODS: RapydPaymentMethodConfig[] = [
  {
    id: 'co_visa_card',
    name: 'Visa',
    description: 'Tarjeta de crédito o débito Visa',
    icon: 'i-lucide-credit-card',
    category: 'card',
    enabled: true,
    fields: ['number', 'expiration_month', 'expiration_year', 'name', 'cvv'],
  },
  {
    id: 'co_mastercard_card',
    name: 'Mastercard',
    description: 'Tarjeta de crédito o débito Mastercard',
    icon: 'i-lucide-credit-card',
    category: 'card',
    enabled: true,
    fields: ['number', 'expiration_month', 'expiration_year', 'name', 'cvv'],
  },
  {
    id: 'co_amex_card',
    name: 'American Express',
    description: 'Tarjeta de crédito Amex',
    icon: 'i-lucide-credit-card',
    category: 'card',
    enabled: true,
    fields: ['number', 'expiration_month', 'expiration_year', 'name', 'cvv'],
  },
  {
    id: 'co_diners_card',
    name: 'Diners Club',
    description: 'Tarjeta de crédito Diners',
    icon: 'i-lucide-credit-card',
    category: 'card',
    enabled: true,
    fields: ['number', 'expiration_month', 'expiration_year', 'name', 'cvv'],
  },
  {
    id: 'co_pse_bank_transfer',
    name: 'PSE',
    description: 'Transferencia bancaria PSE',
    icon: 'i-lucide-landmark',
    category: 'bank_transfer',
    enabled: true,
    fields: ['financial_institution_code', 'person_type', 'document_type', 'document_number'],
  },
  {
    id: 'co_nequi_ewallet',
    name: 'Nequi',
    description: 'Pago con Nequi',
    icon: 'i-lucide-smartphone',
    category: 'ewallet',
    enabled: true,
    fields: ['phone_number'],
  },
  {
    id: 'co_bancolombia_button',
    name: 'Bancolombia',
    description: 'Botón de pago Bancolombia',
    icon: 'i-lucide-landmark',
    category: 'bank_transfer',
    enabled: true,
    fields: [],
  },
  {
    id: 'co_efecty_cash',
    name: 'Efecty',
    description: 'Pago en efectivo en Efecty',
    icon: 'i-lucide-store',
    category: 'cash',
    enabled: true,
    fields: [],
  },
  {
    id: 'co_baloto_cash',
    name: 'Baloto',
    description: 'Pago en efectivo en Baloto',
    icon: 'i-lucide-store',
    category: 'cash',
    enabled: true,
    fields: [],
  },
]
