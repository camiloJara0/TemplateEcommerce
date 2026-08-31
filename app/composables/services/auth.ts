import type {
  ApiResponse,
  LoginData,
  LoginPayload,
  RegisterPayload,
  SendCodePayload,
  VerifyCodePayload
} from '~/types/api'

export function useAuthService() {
  const authStore = useAuthStore()
  const { request } = useApi()

  async function login(payload: LoginPayload) {
    return runMutation<LoginData>({
      request: () => authStore.login(payload),
      successMessage: 'Sesión iniciada correctamente',
      // redirectTo: '/admin'
    })
  }

  async function register(payload: RegisterPayload) {
    return runMutation<{ user: LoginData['user'] }>({
      request: () => request<{ user: LoginData['user'] }>('/register', {
        method: 'POST',
        body: payload
      }),
      successMessage: 'Cuenta creada correctamente',
      redirectTo: '/auth/login'
    })
  }

  async function logout() {
    const result = await runMutation<null>({
      request: () => authStore.logout().then(() => ({ success: true, data: null }) as ApiResponse<null>),
      successMessage: 'Sesión cerrada',
      redirectTo: '/auth/login',
      onSuccess: () => {
        const cartStore = useCartStore()
        cartStore.reset()
      }
    })
    return result
  }

  async function enviarCodigo(payload: SendCodePayload) {
    return runMutation<{ message: string }>({
      request: () => request<{ message: string }>('/enviar-codigo', {
        method: 'POST',
        body: payload
      }),
      successMessage: 'Código enviado a tu correo'
    })
  }

  async function verificarCodigoCambio(payload: VerifyCodePayload) {
    return runMutation<{ message: string }>({
      request: () => request<{ message: string }>('/verificar-codigo-cambio', {
        method: 'POST',
        body: payload
      }),
      successMessage: 'Código verificado'
    })
  }

  return {
    login,
    register,
    logout,
    enviarCodigo,
    verificarCodigoCambio,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated)
  }
}
