import type { WompiTransaction, WompiTransactionStatus } from '~/types/wompi'

export function useWompiService() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const transaction = ref<WompiTransaction | null>(null)

  async function createTransaction(orderId: number, paymentMethod: Record<string, any>): Promise<WompiTransaction | null> {
    loading.value = true
    error.value = null
    try {
      const { request } = useApi()
      const payload = {
        order_id: orderId,
        payment_method_type: paymentMethod.type || 'CARD',
        ...paymentMethod,
      }

      const res = await request<WompiTransaction>(`/pedidos/${orderId}/pagar`, {
        method: 'POST',
        body: {
          provider: 'wompi',
          reference: JSON.stringify(payload),
        },
      })
      transaction.value = res.data
      return res.data
    } catch (e: any) {
      error.value = e?.data?.message || 'Error al procesar el pago'
      return null
    } finally {
      loading.value = false
    }
  }

  function validatePayload(data: Record<string, any>): string[] {
    const errors: string[] = []
    const type = (data.payment_method_type || '').toUpperCase()

    if (type === 'CARD') {
      const number = String(data.number || '').replace(/\s/g, '')
      if (!number || number.length < 13) errors.push('Número de tarjeta inválido')
      if (!data.cvv || String(data.cvv).length < 3) errors.push('CVV inválido')
      if (!data.expiration_month || !data.expiration_year) errors.push('Fecha de expiración requerida')
      if (!data.name || String(data.name).length < 3) errors.push('Nombre del titular requerido')
    }

    if (type === 'NEQUI') {
      const phone = String(data.phone_number || data.nequi_phone || '')
      if (!phone || phone.replace(/\D/g, '').length < 10) errors.push('Número de celular inválido (10 dígitos)')
    }

    if (type === 'PSE') {
      if (!data.financial_institution_code && !data.pse_bank_code) errors.push('Selecciona tu banco')
      if (!data.document_number) errors.push('Número de documento requerido')
    }

    return errors
  }

  return {
    loading,
    error,
    transaction,
    createTransaction,
    validatePayload,
  }
}
