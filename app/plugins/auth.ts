export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const authStore = useAuthStore()
    await authStore.bootstrap()
  }
})
