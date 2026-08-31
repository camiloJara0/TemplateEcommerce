<script setup lang="ts">
import type { AdminUser } from '~/types/admin'

defineProps<{
  users: AdminUser[]
  loading?: boolean
}>()

const { date, initials } = useFormat()

const columns = [
  { key: 'nombre', label: 'Usuario' },
  { key: 'email', label: 'Email' },
  { key: 'rol', label: 'Rol' },
  { key: 'estado', label: 'Estado' },
  { key: 'created_at', label: 'Registro' }
]
</script>

<template>
  <DashboardDataTable
    :columns="columns"
    :rows="users as unknown as Record<string, unknown>[]"
    :loading="loading"
    empty-title="Sin usuarios"
    empty-description="Aún no hay usuarios registrados."
  >
    <template #cell-nombre="{ row }">
      <div class="flex items-center gap-3">
        <UAvatar
          :src="(row as unknown as AdminUser).foto || undefined"
          :text="initials((row as unknown as AdminUser).nombre)"
          size="sm"
        />
        <span class="font-medium text-slate-900 dark:text-white">
          {{ (row as unknown as AdminUser).nombre }}
        </span>
      </div>
    </template>

    <template #cell-estado="{ row }">
      <UBadge
        :label="(row as unknown as AdminUser).estado === 'activo' ? 'Activo' : 'Inactivo'"
        :color="(row as unknown as AdminUser).estado === 'activo' ? 'success' : 'neutral'"
        variant="subtle"
      />
    </template>

    <template #cell-created_at="{ row }">
      {{ date((row as unknown as AdminUser).created_at) }}
    </template>
  </DashboardDataTable>
</template>
