import type { StripePaymentIntent } from '~/types/stripe'

export function useStripeService() {
  const apiBase = useRuntimeConfig().public.apiBase as string

  const stripe = ref<any>(null)
  const elements = ref<any>(null)
  const clientSecret = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadStripe(publishableKey: string): Promise<any> {
    if ((window as any).Stripe) return (window as any).Stripe

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.onload = () => resolve((window as any).Stripe)
      script.onerror = () => reject(new Error('No se pudo cargar Stripe.js'))
      document.head.appendChild(script)
    })
  }

  async function init(publishableKey: string) {
    try {
      stripe.value = await loadStripe(publishableKey)
    } catch (e) {
      error.value = 'No se pudo inicializar Stripe'
    }
  }

  async function createPaymentIntent(orderId: number, amount: number, currency: string = 'cop'): Promise<StripePaymentIntent | null> {
    loading.value = true
    error.value = null
    try {
      const { request } = useApi()
      const res = await request<StripePaymentIntent>(`/pedidos/${orderId}/pagar`, {
        method: 'POST',
        body: {
          provider: 'stripe',
          reference: JSON.stringify({ amount, currency, order_id: orderId }),
        },
      })
      return res.data
    } catch (e: any) {
      error.value = e?.data?.message || 'Error al crear el pago'
      return null
    } finally {
      loading.value = false
    }
  }

  function mountCardElement(containerId: string, publishableKey: string) {
    if (!stripe.value) return

    elements.value = stripe.value.elements({
      clientSecret: clientSecret.value,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#6366f1',
          borderRadius: '12px',
        },
      },
    })

    const card = elements.value.create('card')
    card.mount(`#${containerId}`)
    return card
  }

  async function confirmPayment(paymentIntentId: string, billingDetails?: Record<string, string>): Promise<boolean> {
    if (!stripe.value || !elements.value) return false

    loading.value = true
    error.value = null
    try {
      const { error: stripeError } = await stripe.value.confirmCardPayment(clientSecret.value, {
        payment_method: {
          card: elements.value.getElement('card'),
          billing_details: billingDetails,
        },
      })

      if (stripeError) {
        error.value = stripeError.message || 'Error al procesar el pago'
        return false
      }
      return true
    } catch (e) {
      error.value = 'Error al procesar el pago'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    stripe,
    elements,
    clientSecret,
    loading,
    error,
    init,
    createPaymentIntent,
    mountCardElement,
    confirmPayment,
  }
}
