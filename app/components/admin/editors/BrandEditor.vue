<script setup lang="ts">
import type { BrandConfig, SocialLinks } from '~/types/store'

const props = defineProps<{ value: BrandConfig, social: SocialLinks }>()
const emit = defineEmits<{
  update: [value: BrandConfig]
  'update:social': [value: SocialLinks]
}>()

function updateBrand(field: keyof BrandConfig, val: string | null) {
  emit('update', { ...props.value, [field]: val } as BrandConfig)
}

function updateSocial(field: keyof SocialLinks, val: string | null) {
  emit('update:social', { ...props.social, [field]: val } as SocialLinks)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Brand -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Marca</p>

      <UiBaseInput :model-value="value.name" label="Nombre de marca" @update:model-value="updateBrand('name', String($event))" />
      <UiBaseTextarea :model-value="value.tagline" label="Tagline" :rows="2" @update:model-value="updateBrand('tagline', String($event))" />
      <UiBaseInput :model-value="value.logo ?? ''" label="Logo (URL)" @update:model-value="updateBrand('logo', String($event) || null)" />
      <UiBaseInput :model-value="value.favicon ?? ''" label="Favicon (URL)" @update:model-value="updateBrand('favicon', String($event) || null)" />
    </div>

    <!-- Redes sociales -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Redes sociales</p>

      <div class="space-y-2">
        <label class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <UIcon name="i-simple-icons-instagram" class="size-3.5" />
          Instagram
        </label>
        <UiBaseInput :model-value="social.instagram ?? ''" placeholder="https://instagram.com/tu-tienda" @update:model-value="updateSocial('instagram', String($event) || null)" />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <UIcon name="i-simple-icons-facebook" class="size-3.5" />
          Facebook
        </label>
        <UiBaseInput :model-value="social.facebook ?? ''" placeholder="https://facebook.com/tu-tienda" @update:model-value="updateSocial('facebook', String($event) || null)" />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <UIcon name="i-simple-icons-x" class="size-3.5" />
          X (Twitter)
        </label>
        <UiBaseInput :model-value="social.twitter ?? ''" placeholder="https://x.com/tu-tienda" @update:model-value="updateSocial('twitter', String($event) || null)" />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <UIcon name="i-simple-icons-youtube" class="size-3.5" />
          YouTube
        </label>
        <UiBaseInput :model-value="social.youtube ?? ''" placeholder="https://youtube.com/@tu-tienda" @update:model-value="updateSocial('youtube', String($event) || null)" />
      </div>
    </div>
  </div>
</template>
