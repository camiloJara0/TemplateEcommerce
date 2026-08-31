<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Role } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const authStore = useAuthStore()
const { user: currentUser } = storeToRefs(authStore)

const { initials } = useFormat()

useSeoMeta({ title: 'Usuarios — Admin' })

const allUsers = ref<Array<{ id: number, nombre: string, email: string, rol?: Role[], created_at?: string }>>([])
const loading = ref(false)
const search = ref('')
const showInvite = ref(false)
const inviteEmail = ref('')

async function loadUsers() {
  loading.value = true
  try {
    const { request } = useApi()
    const res = await request<Array<{ id: number, nombre: string, email: string, rol?: Role[], created_at?: string }>>('/admin/usuarios')
    allUsers.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Usuarios
        </h1>
        <p class="page-subtitle">
          {{ allUsers.length }} usuarios en el sistema
        </p>
      </div>
      <UModal
        v-model:open="showInvite"
        :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
      >
        <UButton
          label="Invitar usuario"
          icon="i-lucide-user-plus"
          color="primary"
          size="sm"
          class="rounded-xl"
        />
        <template #header>
          <h3 class="font-semibold">
            Invitar usuario
          </h3>
        </template>
        <template #body>
          <div class="p-4 space-y-4">
            <UiBaseInput
              v-model="inviteEmail"
              label="Email"
              type="email"
              icon="i-lucide-mail"
            />
            <UiBaseButton
              block
              color="primary"
              label="Enviar invitación"
              :disabled="!inviteEmail"
              @click="showInvite = false"
            />
          </div>
        </template>
      </UModal>
    </div>

    <div class="surface p-4 flex gap-3">
      <UInput
        v-model="search"
        placeholder="Buscar por nombre o email…"
        icon="i-lucide-search"
        class="flex-1"
      />
    </div>

    <div class="surface overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-slate-50/80 dark:bg-slate-900/50">
          <tr>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Usuario
            </th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Email
            </th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rol
            </th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Sesión actual
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-if="currentUser"
            class="bg-brand-50/50 dark:bg-brand-950/20"
          >
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <UAvatar
                  :alt="currentUser.nombre"
                  size="sm"
                >
                  {{ initials(currentUser.nombre) }}
                </UAvatar>
                <div>
                  <p class="text-sm font-medium">
                    {{ currentUser.nombre }}
                  </p>
                  <p class="text-xs text-slate-400">
                    {{ currentUser.id }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 text-sm">
              {{ currentUser.email }}
            </td>
            <td class="px-5 py-3.5">
              <UBadge
                :label="currentUser.rol?.[0]?.name ?? 'admin'"
                color="primary"
                variant="subtle"
                size="sm"
              />
            </td>
            <td class="px-5 py-3.5">
              <UBadge
                label="Tú"
                color="success"
                variant="subtle"
                size="sm"
              />
            </td>
          </tr>
          <tr
            v-for="user in allUsers.filter(u => !search || u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))"
            :key="user.id"
            class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
          >
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <UAvatar
                  :alt="user.nombre"
                  size="sm"
                >
                  {{ initials(user.nombre) }}
                </UAvatar>
                <p class="text-sm font-medium">
                  {{ user.nombre }}
                </p>
              </div>
            </td>
            <td class="px-5 py-3.5 text-sm">
              {{ user.email }}
            </td>
            <td class="px-5 py-3.5">
              <UBadge
                :label="user.rol?.[0]?.name ?? 'cliente'"
                color="neutral"
                variant="subtle"
                size="sm"
              />
            </td>
            <td class="px-5 py-3.5 text-sm text-slate-400">
              —
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
