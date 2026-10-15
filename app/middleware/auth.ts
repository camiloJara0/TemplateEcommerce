export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('auth_token')
  if (!token.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }

  // Las rutas /admin requieren al menos un permiso de panel
  if (!to.path.startsWith('/admin')) return
  if (import.meta.server) return

  const auth = useAuthStore()
  await auth.bootstrap()
  await auth.ensurePermissions()

  if (!auth.hasAdminAccess()) {
    return navigateTo('/')
  }
})
