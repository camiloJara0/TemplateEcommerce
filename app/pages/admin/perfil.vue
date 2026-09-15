<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const profileStore = useProfileStore()
const authStore = useAuthStore()

const editing = ref(false)
const saving = ref(false)
const form = ref({ nombre: '', telefono: '', idioma: '' })

onMounted(async () => {
  await profileStore.load(true)
  if (profileStore.profile) {
    form.value = {
      nombre: profileStore.profile.nombre ?? '',
      telefono: profileStore.profile.telefono ?? '',
      idioma: profileStore.profile.idioma ?? '',
    }
  }
})

async function saveProfile() {
  saving.value = true
  try {
    await profileStore.update(form.value)
    editing.value = false
  } finally {
    saving.value = false
  }
}

const roleLabel = computed(() => {
  const roles = authStore.user?.rol
  if (!roles || roles.length === 0) return 'Sin rol'
  return roles.map(r => r.name).join(', ')
})

const roleBadgeColor = computed(() => {
  const roles = authStore.user?.rol
  if (!roles || roles.length === 0) return 'neutral'
  const name = roles[0]?.name?.toLowerCase() ?? ''
  if (name.includes('super')) return 'error'
  if (name.includes('admin')) return 'warning'
  if (name.includes('vendedor')) return 'info'
  return 'neutral'
})

useSeoMeta({ title: 'Mi perfil — Admin' })
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">Mi perfil</h1>
        <p class="page-subtitle">Gestiona tu información personal y preferencias</p>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="surface rounded-xl border border-theme p-6">
      <div class="flex items-start gap-6">
        <div class="w-20 h-20 rounded-full bg-theme-brand flex items-center justify-center shrink-0">
          <span class="text-2xl font-bold text-theme-on-brand">{{ profileStore.initials }}</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-xl font-bold text-theme">{{ profileStore.profile?.nombre || 'Admin' }}</h2>
            <UBadge :label="roleLabel" :color="roleBadgeColor" variant="subtle" size="sm" />
          </div>
          <p class="text-theme-muted">{{ profileStore.profile?.email }}</p>
          <p class="text-sm text-theme-muted mt-1">
            Último login: {{ profileStore.profile?.ultimo_login ? new Date(profileStore.profile.ultimo_login).toLocaleString('es-CO') : 'Nunca' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Edit Form -->
    <div class="surface rounded-xl border border-theme p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-theme">Información personal</h2>
        <UButton
          v-if="!editing"
          label="Editar"
          icon="i-lucide-pencil"
          size="sm"
          variant="outline"
          @click="editing = true"
        />
      </div>

      <div v-if="!editing" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-theme-muted mb-1">Nombre</p>
          <p class="text-theme font-medium">{{ profileStore.profile?.nombre || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-theme-muted mb-1">Email</p>
          <p class="text-theme font-medium">{{ profileStore.profile?.email || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-theme-muted mb-1">Teléfono</p>
          <p class="text-theme font-medium">{{ profileStore.profile?.telefono || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-theme-muted mb-1">Idioma</p>
          <p class="text-theme font-medium">{{ profileStore.profile?.idioma || 'Español' }}</p>
        </div>
        <div>
          <p class="text-xs text-theme-muted mb-1">Estado</p>
          <UBadge
            :label="profileStore.profile?.estado === 'activo' ? 'Activo' : 'Inactivo'"
            :color="profileStore.profile?.estado === 'activo' ? 'success' : 'error'"
            variant="subtle"
            size="sm"
          />
        </div>
        <div>
          <p class="text-xs text-theme-muted mb-1">Zona horaria</p>
          <p class="text-theme font-medium">{{ profileStore.profile?.zona_horaria || 'America/Bogota' }}</p>
        </div>
      </div>

      <form v-else class="space-y-4" @submit.prevent="saveProfile">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UField label="Nombre" name="nombre">
            <UInput v-model="form.nombre" placeholder="Tu nombre" class="w-full" />
          </UField>
          <UField label="Teléfono" name="telefono">
            <UInput v-model="form.telefono" placeholder="Tu teléfono" class="w-full" />
          </UField>
        </div>
        <UField label="Idioma" name="idioma">
          <USelect
            v-model="form.idioma"
            :items="[
              { label: 'Español', value: 'es' },
              { label: 'English', value: 'en' },
              { label: 'Português', value: 'pt' },
            ]"
            class="w-full"
          />
        </UField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="ghost" @click="editing = false" />
          <UButton label="Guardar" color="primary" :loading="saving" type="submit" />
        </div>
      </form>
    </div>

    <!-- Security Section -->
    <div class="surface rounded-xl border border-theme p-6 space-y-4">
      <h2 class="text-lg font-semibold text-theme">Seguridad</h2>
      <div class="flex items-center justify-between p-4 rounded-lg bg-theme-alt">
        <div>
          <p class="font-medium text-theme">Contraseña</p>
          <p class="text-sm text-theme-muted">Última cambio desconocido</p>
        </div>
        <UButton label="Cambiar" size="sm" variant="outline" color="neutral" disabled />
      </div>
      <div class="flex items-center justify-between p-4 rounded-lg bg-theme-alt">
        <div>
          <p class="font-medium text-theme">Two-Factor Auth</p>
          <p class="text-sm text-theme-muted">Agrega una capa extra de seguridad</p>
        </div>
        <UButton label="Configurar" size="sm" variant="outline" color="neutral" disabled />
      </div>
    </div>
  </div>
</template>
