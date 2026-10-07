<script setup lang="ts">
import type { CreateContactPayload } from '~/types/commerce'

definePageMeta({ layout: 'client' })

useSeoMeta({
  title: 'Centro de ayuda',
  description: 'Preguntas frecuentes sobre pedidos, envíos, pagos, cambios y tu cuenta en nuestra tienda.'
})

const communityStore = useCommunityStore()

const faqs = [
  {
    categoria: 'Pedidos',
    items: [
      { question: '¿Cómo sé que mi pedido fue confirmado?', answer: 'Al finalizar la compra recibes un correo de confirmación con el número de pedido. También puedes verlo en Mi cuenta > Pedidos.' },
      { question: '¿Puedo modificar o cancelar un pedido?', answer: 'Sí, mientras no haya sido despachado. Escríbenos desde el formulario de contacto indicando el número de pedido y nuestro equipo lo revisará contigo.' },
      { question: '¿Los precios incluyen impuestos?', answer: 'Todos los precios mostrados incluyen los impuestos aplicables. No hay costos ocultos al momento del pago.' }
    ]
  },
  {
    categoria: 'Envíos',
    items: [
      { question: '¿Cuánto tarda mi pedido en llegar?', answer: 'Los pedidos se despachan en 1 a 2 días hábiles y el tiempo de entrega estándar es de 2 a 5 días hábiles según tu ciudad.' },
      { question: '¿Cómo rastreo mi paquete?', answer: 'Cuando tu pedido sale del almacén recibes un correo con el número de seguimiento. También está disponible en Mi cuenta > Pedidos.' },
      { question: '¿Hacen envíos a todo el país?', answer: 'Sí. Enviamos a todo el territorio nacional. El costo de envío se calcula automáticamente al ingresar tu dirección.' }
    ]
  },
  {
    categoria: 'Cambios y devoluciones',
    items: [
      { question: '¿Cómo solicito un cambio o devolución?', answer: 'Tienes hasta 15 días calendario desde la recepción. Escríbenos con tu número de pedido y el motivo del cambio.' },
      { question: '¿Qué pasa si el producto llega defectuoso?', answer: 'Contáctanos dentro de las primeras 48 horas con fotos del producto y gestionamos el reemplazo o reembolso sin costo adicional.' },
      { question: '¿Cuándo se refleja el reembolso?', answer: 'Una vez aprobada la devolución, el reembolso se procesa al mismo medio de pago en un plazo de 3 a 10 días hábiles.' }
    ]
  },
  {
    categoria: 'Cuenta y pagos',
    items: [
      { question: '¿Qué medios de pago aceptan?', answer: 'Aceptamos tarjetas de crédito y débito a través de nuestra pasarela de pago segura. Los métodos disponibles se muestran al finalizar la compra.' },
      { question: '¿Es seguro pagar en la tienda?', answer: 'Sí. El pago se procesa en la pasarela del proveedor con cifrado SSL; nuestros servidores nunca almacenan los datos de tu tarjeta.' },
      { question: 'No recuerdo mi contraseña', answer: 'Usa "¿Olvidaste tu contraseña?" en el inicio de sesión y recibirás un enlace para restablecerla.' }
    ]
  }
]

const contact = reactive<CreateContactPayload>({
  nombre: '',
  correo: '',
  asunto: 'Ayuda con mi pedido',
  mensaje: ''
})
const sending = ref(false)
const sent = ref(false)

async function send() {
  if (!contact.correo || !contact.mensaje || sending.value) return
  sending.value = true
  try {
    await communityStore.create(contact)
    sent.value = true
    contact.nombre = ''
    contact.correo = ''
    contact.mensaje = ''
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="page-container py-12 sm:py-16 space-y-12">
    <header class="max-w-2xl space-y-3">
      <p class="text-sm font-semibold uppercase tracking-wide text-theme-brand">
        Soporte
      </p>
      <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
        Centro de ayuda
      </h1>
      <p class="text-theme-muted leading-relaxed">
        Encuentra respuestas rápidas sobre tus pedidos, envíos, cambios y tu cuenta.
        Si no encuentras lo que buscas, escríbenos y te respondemos lo antes posible.
      </p>
    </header>

    <!-- FAQ -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <article
        v-for="grupo in faqs"
        :key="grupo.categoria"
        class="surface rounded-2xl border border-theme p-6 space-y-4"
      >
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon
            name="i-lucide-circle-help"
            class="size-5 text-theme-brand"
          />
          {{ grupo.categoria }}
        </h2>

        <details
          v-for="faq in grupo.items"
          :key="faq.question"
          class="border-b border-theme last:border-0 pb-3 last:pb-0 group"
        >
          <summary class="cursor-pointer list-none flex items-start justify-between gap-3 text-sm font-medium py-1">
            {{ faq.question }}
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 mt-0.5 text-theme-muted transition-transform group-open:rotate-180"
            />
          </summary>
          <p class="pt-2 text-sm text-theme-muted leading-relaxed">
            {{ faq.answer }}
          </p>
        </details>
      </article>
    </section>

    <!-- Contacto -->
    <section class="surface rounded-2xl border border-theme p-6 sm:p-8">
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-semibold">
            ¿No resolviste tu duda?
          </h2>
          <p class="text-sm text-theme-muted">
            Escríbenos y un asesor te responderá por correo.
          </p>
        </div>

        <form
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
          @submit.prevent="send"
        >
          <UiBaseInput
            v-model="contact.nombre"
            label="Nombre"
            placeholder="Tu nombre"
            autocomplete="name"
          />
          <UiBaseInput
            v-model="contact.correo"
            type="email"
            label="Correo"
            required
            placeholder="tucorreo@ejemplo.com"
            autocomplete="email"
          />
          <UiBaseInput
            v-model="contact.asunto"
            label="Asunto"
            class="sm:col-span-2"
            required
          />
          <UiBaseTextarea
            v-model="contact.mensaje"
            label="Mensaje"
            required
            :rows="5"
            placeholder="Cuéntanos en qué podemos ayudarte…"
            class="sm:col-span-2"
          />
          <div class="sm:col-span-2 flex justify-end">
            <UiBaseButton
              type="submit"
              label="Enviar mensaje"
              icon="i-lucide-send"
              color="primary"
              class="rounded-xl"
              :loading="sending"
              :disabled="!contact.correo || !contact.mensaje"
            />
          </div>
        </form>

        <div
          v-if="sent"
          class="flex items-center justify-center gap-2 text-sm text-success-600 dark:text-success-400"
        >
          <UIcon
            name="i-lucide-check-circle"
            class="size-5"
          />
          <span>Mensaje enviado. Te responderemos a tu correo.</span>
        </div>
      </div>
    </section>
  </div>
</template>
