<script setup lang="ts">
import type { CreateContactPayload } from '~/types/commerce';
import type { ContactSection } from '~/types/store'

const props = defineProps<{ config: ContactSection }>()
const communityStore = useCommunityStore()

const payload = reactive<CreateContactPayload>({
  correo: '',
  nombre: '',
  nit: '',
  asunto: '',
  mensaje: ''
})
const submitted = ref(false)

async function submit() {
  if (!payload.correo || !payload.asunto || !payload.mensaje) return
  submitted.value = true

  await communityStore.create(payload)
  setTimeout(() => { 
    submitted.value = false; 
    payload.correo = ''
    payload.nombre = ''
    payload.nit = ''
    payload.asunto = ''
    payload.mensaje = ''
  }, 3000)
}
</script>

<template>
  <section
    v-if="config.show"
    class="relative overflow-hidden py-16 sm:py-20"
    :style="{ backgroundColor: config.bg_color, color: config.text_color }"
  >
    <div class="absolute inset-0 opacity-10">
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
    </div>
    <div class="relative page-container">
      <div
        class="flex flex-col items-center gap-8"
        :class="config.layout === 'split' ? 'md:flex-row md:items-center' : 'text-center'"
      >
        <div v-if="config.image && config.layout === 'split'" class="md:w-1/2">
          <img :src="config.image" alt="" class="rounded-2xl w-full object-cover max-h-80" />
        </div>
        <div :class="config.layout === 'split' ? 'md:w-1/2' : 'max-w-xl mx-auto'">
          <h2 class="text-2xl sm:text-3xl font-bold mb-3">{{ config.headline }}</h2>
          <p class="text-sm opacity-80 mb-6">{{ config.subtext }}</p>
          <form v-if="!submitted" class="grid grid-cols-2 gap-2 max-w-md" :class="config.layout === 'centered' && 'mx-auto'" @submit.prevent="submit">
            <input
              v-model="payload.nombre"
              type="text"
              :placeholder="config.placeholder_name"
              class="flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              v-model="payload.correo"
              type="email"
              :placeholder="config.placeholder_email"
              class="flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              v-model="payload.asunto"
              type="text"
              :placeholder="config.placeholder_asunto"
              class="col-span-2 flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <textarea
              v-model="payload.mensaje"
              :placeholder="config.placeholder_mensaje"
              class="col-span-2 flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              class="col-span-2 px-6 py-3 rounded-xl font-semibold bg-white transition-all hover:scale-105"
              :style="{ color: config.bg_color }"
            >
              {{ config.button_label }}
            </button>
          </form>
          <div v-else class="flex items-center gap-2 justify-center">
            <UIcon name="i-lucide-check-circle" class="size-5" />
            <span class="font-medium">¡Gracias, tu mensaje ha sido enviado!</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
