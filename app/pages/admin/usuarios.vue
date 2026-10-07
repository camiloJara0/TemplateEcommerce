<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthService } from '~/composables/services/auth'
import type { RegisterPayload, Role } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const authStore = useAuthStore()
const profileStore = useProfileStore()
const { updatePersonal } = useAuthService()
const { user: currentUser } = storeToRefs(authStore)

const { initials } = useFormat()

useSeoMeta({ title: 'Usuarios — Admin' })

const allUsers = ref<Array<{ id: number, nombre: string, email: string, rol?: Role[], created_at?: string }>>([])
const loading = ref(false)
const search = ref('')
const showInvite = ref(false)
const showEdit = ref(false)
const userSelected = ref({})

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

async function deleteUser(id: number) {
  try {
    await profileStore.deleteUser(id)
    await loadUsers()
  } finally {

  }
}

async function updateUser(payload: RegisterPayload) {
  try {
    await updatePersonal({ ...payload, id: userSelected.value.id })
    await loadUsers()
    showEdit.value = false
  } finally {

  }
}

// Auditoria
const storeConfig = useStoreConfigStore()

const { auditLogs, auditFilters } = storeToRefs(profileStore)

const filters = reactive({
  usuario: '',
  accion: '',
  fecha: null,
})

const dias_retencion_auditoria = ref(storeConfig.adminConfig?.dias_retencion_auditoria ?? 30)

const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toISOString().split('T')[0];
    // o: return new Date(dateString).toLocaleDateString();
};

const columnsAudit = [
  { accessorKey: 'usuario.nombre', header: 'Usuario'},
  { accessorKey: 'accion', header: 'Acción'},
  { accessorKey: 'descripcion', header: 'Descripción'},
  { accessorKey: 'created_at', header: 'Fecha', 
    cell: ({ row }) => {
      const texto = row.original.created_at || ''
      return h('p', formatDate(texto))
    }
  },
]

async function applyFilters() {
  await profileStore.loadAuditoria({
    usuario: filters.usuario || undefined,
    accion: filters.accion || undefined,
    fecha: filters.fecha || undefined
  })
  await profileStore.loadFiltros()
}

onMounted(async () => {
  void loadUsers()
  await profileStore.loadAuditoria()
  await profileStore.loadFiltros()
})
</script>

<template>
  <div class="space-y-6 animate-fade-up">

    <UTabs :items="[{ label: 'Usuarios', slot: 'usuarios' }, { label: 'Auditoria', slot: 'auditoria' }]"
      :ui="{ trigger: 'data-[state=active]:!bg-transparent' }">
      <template #usuarios>
        <div class="page-header">
          <div>
            <h1 class="page-title">
              Usuarios
            </h1>
            <p class="page-subtitle">
              {{ allUsers.length }} usuarios en el sistema
            </p>
          </div>
          <div>

            <UModal v-model:open="showInvite" :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }">
              <UButton label="Crear usuario" icon="i-lucide-user-plus" color="primary" size="sm" class="rounded-xl" />
              <template #header>
                <h3 class="font-semibold">
                  Crear Usuario
                </h3>
              </template>
              <template #body>
                <formsRegisterUser />
              </template>
            </UModal>
          </div>
        </div>

        <div class="surface p-4 my-4 flex gap-3">
          <UInput v-model="search" placeholder="Buscar por nombre o email…" icon="i-lucide-search" class="flex-1" />
        </div>

        <div class="surface overflow-hidden">
          <table class="min-w-full">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50">
              <tr>
                <th
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Usuario
                </th>
                <th
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Rol
                </th>
                <th
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Sesión actual
                </th>
                <th
                  class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="currentUser" class="bg-brand-50/50 dark:bg-brand-950/20">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <UAvatar :alt="currentUser.nombre" size="sm">
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
                  <UBadge :label="currentUser.rol?.[0]?.name ?? 'admin'" color="primary" variant="subtle" size="sm" />
                </td>
                <td class="px-5 py-3.5">
                  <UBadge label="Tú" color="success" variant="subtle" size="sm" />
                </td>
              </tr>
              <tr
                v-for="user in allUsers.filter(u => !search || u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))"
                :key="user.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <UAvatar :alt="user.nombre" size="sm">
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
                  <UBadge :label="user.rol?.[0]?.name ?? 'cliente'" color="neutral" variant="subtle" size="sm" />
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-400">
                  —
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-400">
                  <UButton icon="i-lucide-pen" color="neutral" variant="ghost" size="xs"
                    @click="() => { showEdit = true; userSelected = { ...user, rol_id: user.rol?.[0].id } }"></UButton>
                  <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="deleteUser(user.id)">
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template #auditoria>
        <div class="page-header">
          <div>
            <h1 class="page-title">
              Auditoria
            </h1>
            <p class="page-subtitle">
              Registros de auditoria del sistema
            </p>
          </div>
          <div>

            <UModal>
              <UButton icon="i-lucide-settings" label="Configuración"/>
              <template #header>
                <h3 class="font-semibold">
                  Configuración de Auditoria
                </h3>
              </template>
              <template #body>
                <div class="space-y-4">
                  <p>Selecciona la cantidad de días que deseas mantener los registros de auditoría:</p>
                  <USelect v-model="dias_retencion_auditoria" placeholder="Días de retención" :items="[
                    { label: '30 días', value: 30 },
                    { label: '90 días', value: 90 },
                    { label: '180 días', value: 180 },
                  ]"></USelect>

                  <UButton label="Guardar configuración" color="primary" class="w-full"
                    @click="storeConfig.updateRetencionAuditorial(dias_retencion_auditoria)" />
                </div>
              </template>
            </UModal>
          </div>
        </div>

        <div class="surface p-4 my-4 flex flex-col gap-3">
          <div class="flex items-center justify-between p-4 rounded-lg bg-theme-alt">
            <div>
              <p class="font-medium text-theme">Filtros</p>
            </div>
            <UButton label="Aplicar" size="sm" variant="outline" color="neutral" @click="applyFilters" />
          </div>
          <div class="flex gap-3">
            <USelect v-model="filters.usuario" placeholder="Usuario" :items="auditFilters?.usuarios" label-key="">
            </USelect>
            <USelect v-model="filters.accion" placeholder="Accion" :items="auditFilters?.acciones"></USelect>
            <UInput v-model="filters.fecha" type="date" placeholder="Fecha" />
          </div>
        </div>
        <!-- Audit Logs -->
        <div class="surface rounded-xl border border-theme p-6 space-y-4 my-4">
          <UTable :columns="columnsAudit" :data="auditLogs" />
        </div>
      </template>
    </UTabs>

  </div>

  <UModal v-model:open="showEdit" :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }">
    <template #header>
      <h3 class="font-semibold">
        Editar Usuario
      </h3>
    </template>
    <template #body>
      <formsRegisterUser :initial="userSelected" :action="updateUser" submit-label="Actualizar cuenta" />
    </template>
  </UModal>
</template>
