export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const store = useOfflineStore()
    void store.bootstrap()
  }
})