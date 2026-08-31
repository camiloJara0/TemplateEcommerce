<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>(), {
  icon: 'i-lucide-inbox',
  title: 'Nada por aquí',
  description: 'Cuando haya contenido, aparecerá en este espacio.'
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-14 sm:py-20 animate-fade-up">
    <div class="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
      <UIcon
        :name="icon"
        class="size-7 text-slate-400 dark:text-slate-500"
      />
    </div>
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
      {{ title }}
    </h3>
    <p class="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
      {{ description }}
    </p>
    <div
      v-if="actionLabel || $slots.actions"
      class="mt-6"
    >
      <slot name="actions">
        <UButton
          v-if="actionLabel"
          :to="actionTo"
          color="primary"
          :label="actionLabel"
          @click="emit('action')"
        />
      </slot>
    </div>
  </div>
</template>
