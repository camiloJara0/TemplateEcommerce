<script setup lang="ts">
import type { Address, AddressPayload } from '~/types/commerce'

definePageMeta({ layout: 'client', middleware: ['auth'] })

const profileStore = useProfileStore()
const addressStore = useAddressStore()

const editing = ref(false)
const saving = ref(false)
const form = ref({ nombre: '', telefono: '' })

const showAddressModal = ref(false)
const editingAddress = ref<Address | null>(null)
const addressForm = ref<AddressPayload>({
  label: '',
  pais: 'Colombia',
  ciudad: '',
  direccion: '',
  codigo_postal: '',
  telefono: '',
  es_principal: false,
})
const savingAddress = ref(false)

onMounted(async () => {
  await Promise.all([profileStore.load(true), addressStore.load(true)])
  if (profileStore.profile) {
    form.value = {
      nombre: profileStore.profile.nombre ?? '',
      telefono: profileStore.profile.telefono ?? '',
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

function openNewAddress() {
  editingAddress.value = null
  addressForm.value = { label: '', pais: 'Colombia', ciudad: '', direccion: '', codigo_postal: '', telefono: '', es_principal: false }
  showAddressModal.value = true
}

function openEditAddress(addr: Address) {
  editingAddress.value = addr
  addressForm.value = {
    label: addr.label ?? '',
    pais: addr.pais,
    ciudad: addr.ciudad,
    direccion: addr.direccion,
    codigo_postal: addr.codigo_postal ?? '',
    telefono: addr.telefono ?? '',
    es_principal: addr.es_principal ?? false,
  }
  showAddressModal.value = true
}

async function saveAddress() {
  savingAddress.value = true
  try {
    if (editingAddress.value) {
      await addressStore.update(editingAddress.value.id, addressForm.value)
    } else {
      await addressStore.create(addressForm.value)
    }
    showAddressModal.value = false
  } finally {
    savingAddress.value = false
  }
}

async function removeAddress(id: number) {
  await addressStore.remove(id)
}

useSeoMeta({ title: 'Mi perfil — Cuenta' })
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-fade-up">
    <div>
      <h1 class="text-2xl font-bold text-theme">Mi perfil</h1>
      <p class="text-theme-muted mt-1">Gestiona tu información personal y direcciones</p>
    </div>

    <!-- Profile Info -->
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
          <p class="text-xs text-theme-muted mb-1">Miembro desde</p>
          <p class="text-theme font-medium">{{ profileStore.profile?.created_at ? new Date(profileStore.profile.created_at).toLocaleDateString('es-CO') : '—' }}</p>
        </div>
      </div>

      <form v-else class="space-y-4" @submit.prevent="saveProfile">
        <UField label="Nombre" name="nombre">
          <UInput v-model="form.nombre" placeholder="Tu nombre" class="w-full" />
        </UField>
        <UField label="Teléfono" name="telefono">
          <UInput v-model="form.telefono" placeholder="Tu teléfono" class="w-full" />
        </UField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="ghost" @click="editing = false" />
          <UButton label="Guardar" color="primary" :loading="saving" type="submit" />
        </div>
      </form>
    </div>

    <!-- Addresses -->
    <div class="surface rounded-xl border border-theme p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-theme">Direcciones</h2>
        <UButton label="Nueva dirección" icon="i-lucide-plus" size="sm" @click="openNewAddress" />
      </div>

      <div v-if="addressStore.items.length === 0" class="text-center py-8">
        <UIcon name="i-lucide-map-pin" class="size-10 text-theme-muted mx-auto mb-3" />
        <p class="text-theme-muted">No tienes direcciones guardadas</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="addr in addressStore.items"
          :key="addr.id"
          class="flex items-start justify-between p-4 rounded-lg border border-theme bg-theme-surface"
        >
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-map-pin" class="size-5 text-theme-brand mt-0.5" />
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-theme">{{ addr.label || 'Dirección' }}</p>
                <UBadge v-if="addr.es_principal" label="Principal" color="primary" variant="subtle" size="sm" />
              </div>
              <p class="text-sm text-theme-secondary mt-1">{{ addr.direccion }}</p>
              <p class="text-sm text-theme-muted">{{ addr.ciudad }}, {{ addr.pais }}</p>
              <p v-if="addr.telefono" class="text-sm text-theme-muted">Tel: {{ addr.telefono }}</p>
            </div>
          </div>
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" size="xs" variant="ghost" color="neutral" @click="openEditAddress(addr)" />
            <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click="removeAddress(addr.id)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Address Modal -->
    <UModal v-model:open="showAddressModal">
      <template #header>
        <h3 class="font-semibold text-theme">{{ editingAddress ? 'Editar dirección' : 'Nueva dirección' }}</h3>
      </template>
      <template #body>
        <form class="space-y-4" @submit.prevent="saveAddress">
          <UField label="Etiqueta" name="label">
            <UInput v-model="addressForm.label" placeholder="Casa, Oficina, etc." class="w-full" />
          </UField>
          <div class="grid grid-cols-2 gap-4">
            <UField label="País" name="pais">
              <UInput v-model="addressForm.pais" class="w-full" />
            </UField>
            <UField label="Ciudad" name="ciudad">
              <UInput v-model="addressForm.ciudad" placeholder="Bogotá" class="w-full" />
            </UField>
          </div>
          <UField label="Dirección" name="direccion">
            <UInput v-model="addressForm.direccion" placeholder="Calle 123 #45-67" class="w-full" />
          </UField>
          <div class="grid grid-cols-2 gap-4">
            <UField label="Código postal" name="codigo_postal">
              <UInput v-model="addressForm.codigo_postal" class="w-full" />
            </UField>
            <UField label="Teléfono" name="telefono">
              <UInput v-model="addressForm.telefono" class="w-full" />
            </UField>
          </div>
          <UCheckbox v-model="addressForm.es_principal" label="Establecer como dirección principal" />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="ghost" @click="showAddressModal = false" />
          <UButton label="Guardar" color="primary" :loading="savingAddress" @click="saveAddress" />
        </div>
      </template>
    </UModal>
  </div>
</template>
