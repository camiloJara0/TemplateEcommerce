export function useAtributosVariantesService() {
  const store = useVariantAttributeStore()

  return {
    listar: (force = false) => store.loadList(force),
    crear: (payload: { name: string }) => store.crear(payload),
    actualizar: (id: number, payload: { name: string }) => store.actualizar(id, payload),
    eliminar: (id: number) => store.eliminar(id),
    crearValor: (attributeId: number, value: string) => store.crearValor(attributeId, value),
    actualizarValor: (valueId: number, value: string) => store.actualizarValor(valueId, value),
    eliminarValor: (valueId: number) => store.eliminarValor(valueId),
    byId: (id: number) => store.items.find(a => a.id === id) ?? null,
    allValues: (): { id: number, attribute_id?: number, attribute: string, value: string }[] =>
      store.items.flatMap(a => a.values.map(v => ({
        id: v.id,
        attribute_id: v.attribute_id ?? a.id,
        attribute: a.name,
        value: v.value
      })))
  }
}

export type AtributosVariantesService = ReturnType<typeof useAtributosVariantesService>
