import type { AuthData, LoginPayload, Role, User } from '~/types/api'

const ROLE_HIERARCHY: Record<string, number> = {
  'Super Administrador': 200,
  Administrador: 100,
  Vendedor: 50,
  Cliente: 10,
}

const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  'Super Administrador': '/admin',
  Administrador: '/admin',
  Vendedor: '/admin/pedidos',
  Cliente: '/',
}

const USER_STORAGE_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>('auth_token', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  const userState = useState<User | null>('auth_user', () => null)

  const token = computed<string | null>(() => tokenCookie.value ?? null)
  const user = computed<User | null>(() => userState.value)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function readUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = sessionStorage.getItem(USER_STORAGE_KEY)
      if (raw) return JSON.parse(raw) as User
    } catch { /* ignore */ }
    return null
  }

  function writeUserToStorage(user: User | null) {
    if (typeof window === 'undefined') return
    try {
      if (user) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        sessionStorage.removeItem(USER_STORAGE_KEY)
      }
    } catch { /* ignore */ }
  }

  async function bootstrap() {
    if (typeof window === 'undefined') return

    // Restaurar token de IndexedDB si cookie está vacía
    const stored = await dbGet<{ key: string, value: string }>('kv', 'auth_token')
    if (stored?.value && !tokenCookie.value) {
      tokenCookie.value = stored.value
    }

    // Restaurar user de sessionStorage si useState está vacío
    if (!userState.value && tokenCookie.value) {
      const storedUser = readUserFromStorage()
      if (storedUser) {
        userState.value = storedUser
      }
    }
  }

  function setSession(newToken: string, newUser: User) {
    tokenCookie.value = newToken
    userState.value = newUser
    writeUserToStorage(newUser)
    if (import.meta.client) {
      void dbPut('kv', { key: 'auth_token', value: newToken, updatedAt: Date.now() })
    }
  }

  function updateUser(partial: Partial<User>) {
    if (!userState.value) return
    userState.value = { ...userState.value, ...partial }
    writeUserToStorage(userState.value)
  }

  function clearSession() {
    tokenCookie.value = null
    userState.value = null
    writeUserToStorage(null)
    if (import.meta.client) {
      void dbDelete('kv', 'auth_token')
    }
  }

  function getHighestRole(): Role | null {
    const roles = user.value?.rol
    if (!roles?.length) return null
    const sorted = [...roles].sort(
      (a, b) => (ROLE_HIERARCHY[b.name] ?? 0) - (ROLE_HIERARCHY[a.name] ?? 0),
    )
    return sorted[0] ?? null
  }

  function getDefaultRoute(): string {
    const role = getHighestRole()

    if (!role) return '/'
    return ROLE_DEFAULT_ROUTE[role.name] ?? '/'

  }

  async function login(payload: LoginPayload) {
    const { request } = useApi()

    const res = await request<AuthData>(
      '/login',
      { method: 'POST', body: payload },
    )
    // El backend retorna user en el nivel raíz, no dentro de data
    const accessToken = res.data.access_token
    const userData = res.data?.user ?? (res as unknown as { user?: User }).user
    if (accessToken && userData) {
      setSession(accessToken, userData)
      const route = getDefaultRoute()
      navigateTo(route)
    }
    return res
  }

  async function logout() {
    try {
      const { request } = useApi()
      await request<null>('/logout', { method: 'POST' })
    } finally {
      clearSession()
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    bootstrap,
    setSession,
    updateUser,
    clearSession,
    getHighestRole,
    getDefaultRoute,
    login,
    logout,
  }
})
