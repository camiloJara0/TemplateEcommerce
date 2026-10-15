export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const authStore = useAuthStore()
    await authStore.bootstrap()
    await authStore.ensurePermissions()

    // Guard de /admin en carga inicial (el middleware solo corre en client para navegaciones)
    const route = useRoute()
    if (route.path.startsWith('/admin') && authStore.token && !authStore.hasAdminAccess()) {
      navigateTo('/')
    }
  }
})
