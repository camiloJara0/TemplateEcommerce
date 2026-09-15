import type {
  RapydPaymentMethodConfig,
  RapydPaymentMethodType,
  RapydPaymentPayload,
  RapydPaymentMethodAPIItem,
  RapydRequiredFieldsResponse,
  RapydRequiredField,
} from '~/types/rapyd'
import { RAPYD_PAYMENT_METHODS, rapydApiItemToConfig } from '~/types/rapyd'

export function useRapydService() {
  const config = useRuntimeConfig()
  const apiBase = 'http://localhost:8000/api/v1' as string

  const paymentMethods = ref<RapydPaymentMethodConfig[]>([])
  const loadingMethods = ref(false)
  const methodsError = ref<string | null>(null)

  async function fetchPaymentMethods(country: string = 'CO', currency: string = 'COP'): Promise<RapydPaymentMethodConfig[]> {
    loadingMethods.value = true
    methodsError.value = null
    try {
      const response = await $fetch<{ success: boolean, data: { methods: RapydPaymentMethodAPIItem[] } }>(
        `${apiBase}/pagos/rapyd/metodos/${country}?currency=${currency}`,
      )
      if (response.success && response.data?.methods) {
        const methods = response.data.methods
          .filter(m => m.status === 1)
          .map(rapydApiItemToConfig)
        paymentMethods.value = methods
        return methods
      }
      paymentMethods.value = RAPYD_PAYMENT_METHODS
      return RAPYD_PAYMENT_METHODS
    } catch (e) {
      methodsError.value = e instanceof Error ? e.message : 'Error fetching payment methods'
      paymentMethods.value = RAPYD_PAYMENT_METHODS
      return RAPYD_PAYMENT_METHODS
    } finally {
      loadingMethods.value = false
    }
  }

  /**
   * Normalize required fields from Rapyd API response.
   *
   * Rapyd returns fields in different places depending on the method:
   *   - Cards: `fields` array has number, cvv, name, etc.
   *   - Nequi: `fields` is empty, real fields are in `payment_options[0].required_fields`
   *   - PSE: similar to Nequi, fields inside `payment_options`
   *   - Cash: fields inside `payment_options`
   *
   * This function merges all sources into a single flat `fields` array.
   */
  async function fetchRequiredFields(type: string): Promise<RapydRequiredFieldsResponse | null> {
    try {
      const response = await $fetch<{ success: boolean, data: RapydRequiredFieldsResponse }>(
        `${apiBase}/pagos/rapyd/campos-requeridos/${type}`,
      )
      if (!response.success || !response.data) return null

      const data = response.data
      const merged: RapydRequiredField[] = []

      // 1. Top-level fields (cards use this)
      if (Array.isArray(data.fields)) {
        for (const f of data.fields) {
          if (!merged.some(m => m.name === f.name)) merged.push(f)
        }
      }

      // 2. Fields inside payment_options[].required_fields (Nequi, PSE, cash use this)
      if (Array.isArray(data.payment_options)) {
        for (const opt of data.payment_options) {
          if (Array.isArray(opt.required_fields)) {
            for (const rf of opt.required_fields) {
              if (!merged.some(m => m.name === rf.name)) merged.push(rf)
            }
          }
        }
      }

      return {
        ...data,
        fields: merged,
      }
    } catch {
      return null
    }
  }

  function getMethodConfig(method: string): RapydPaymentMethodConfig | undefined {
    return paymentMethods.value.find(m => m.id === method)
  }

  function getMethodsByCategory(category: RapydPaymentMethodConfig['category']): RapydPaymentMethodConfig[] {
    return paymentMethods.value.filter(m => m.category === category && m.enabled)
  }

  function detectCardBrand(number: string): string {
    const cleaned = number.replace(/\s/g, '')
    if (/^4/.test(cleaned)) return 'co_visa_card'
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'co_mastercard_card'
    if (/^3[47]/.test(cleaned)) return 'co_amex_card'
    if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'co_diners_card'
    return ''
  }

  function formatCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '').slice(0, 16)
    return cleaned.replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiration(value: string): string {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2)
    }
    return cleaned
  }

  function isCardMethod(method: string): boolean {
    return method.includes('card')
  }

  function isBankTransfer(method: string): boolean {
    return method.includes('bank_transfer') || method.includes('bank_redirect')
  }

  function isEWallet(method: string): boolean {
    return method.includes('ewallet')
  }

  function isCash(method: string): boolean {
    return method.includes('cash')
  }

  function validatePaymentPayload(payload: RapydPaymentPayload): string[] {
    const errors: string[] = []
    if (!payload.order_id) errors.push('ID de pedido requerido')
    if (!payload.amount || payload.amount <= 0) errors.push('Monto inválido')

    if (isCardMethod(payload.payment_method_type)) {
      const cardNumber = String(payload.card_number ?? payload.number ?? '')
      const cardCvv = String(payload.card_cvv ?? payload.cvv ?? '')
      const cardMonth = String(payload.card_expiration_month ?? payload.expiration_month ?? '')
      const cardYear = String(payload.card_expiration_year ?? payload.expiration_year ?? '')
      const cardName = String(payload.card_name ?? payload.name ?? '')

      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
        errors.push('Número de tarjeta inválido')
      }
      if (!cardCvv || cardCvv.length < 3) {
        errors.push('Código de seguridad inválido')
      }
      if (!cardMonth || !cardYear) {
        errors.push('Fecha de expiración inválida')
      }
      if (!cardName || cardName.length < 3) {
        errors.push('Nombre en la tarjeta requerido')
      }
    }

    if (payload.payment_method_type.includes('pse')) {
      if (!payload.pse_bank_code) errors.push('Selecciona tu banco')
      if (!payload.pse_document_number) errors.push('Número de documento requerido')
    }

    if (payload.payment_method_type.includes('nequi')) {
      const phone = String(payload.nequi_phone ?? '')
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        errors.push('Número de Nequi inválido (10 dígitos)')
      }
    }

    return errors
  }

  return {
    paymentMethods,
    loadingMethods,
    methodsError,
    fetchPaymentMethods,
    fetchRequiredFields,
    getMethodConfig,
    getMethodsByCategory,
    detectCardBrand,
    formatCardNumber,
    formatExpiration,
    isCardMethod,
    isBankTransfer,
    isEWallet,
    isCash,
    validatePaymentPayload,
  }
}
