import type { UpdateProfilePayload } from '~/types/api'
import type { AddressPayload } from '~/types/commerce'

export function usePerfilService() {
  const profileStore = useProfileStore()
  const addressStore = useAddressStore()

  return {
    obtener: (force?: boolean) => profileStore.load(force ?? false),
    actualizar: (payload: UpdateProfilePayload) => profileStore.update(payload),

    listarDirecciones: (force?: boolean) => addressStore.load(force ?? false),
    crearDireccion: (payload: AddressPayload) => addressStore.create(payload),
    actualizarDireccion: (id: number, payload: Partial<AddressPayload>) =>
      addressStore.update(id, payload),
    eliminarDireccion: (id: number) => addressStore.remove(id)
  }
}
