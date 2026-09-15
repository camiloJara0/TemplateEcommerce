import type { MercadoPagoPreference } from '~/types/mercadopago'

export function useMercadoPagoService() {
  const apiBase = useRuntimeConfig().public.apiBase as string
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function createPreference(orderId: number, amount: number, currency: string = 'COP'): Promise<MercadoPagoPreference | null> {
    loading.value = true
    error.value = null
    try {
      const { request } = useApi()
      const res = await request<{ init_point: string; sandbox_init_point: string; id: string }>(`/pedidos/${orderId}/pagar`, {
        method: 'POST',
        body: {
          provider: 'mercadopago',
          reference: JSON.stringify({ amount, currency, order_id: orderId }),
        },
      })
      return res.data as any
    } catch (e: any) {
      error.value = e?.data?.message || 'Error al crear la preferencia de pago'
      return null
    } finally {
      loading.value = false
    }
  }

  function redirectToCheckout(initPoint: string) {
    window.location.href = initPoint
  }

  return {
    loading,
    error,
    createPreference,
    redirectToCheckout,
  }
}
