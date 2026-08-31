export type ThemeMode = 'light' | 'dark' | 'system'

export function useThemeMode() {
  const colorMode = useColorMode()

  const mode = computed<ThemeMode>({
    get: () => (colorMode.preference as ThemeMode) || 'system',
    set: (value) => {
      colorMode.preference = value
    }
  })

  const isDark = computed(() => colorMode.value === 'dark')

  function setMode(value: ThemeMode) {
    mode.value = value
  }

  function cycle() {
    const order: ThemeMode[] = ['light', 'dark', 'system']
    const idx = order.indexOf(mode.value)
    mode.value = order[(idx + 1) % order.length]!
  }

  const icon = computed(() => {
    if (mode.value === 'system') return 'i-lucide-monitor'
    if (mode.value === 'dark') return 'i-lucide-moon'
    return 'i-lucide-sun'
  })

  const label = computed(() => {
    if (mode.value === 'system') return 'Sistema'
    if (mode.value === 'dark') return 'Oscuro'
    return 'Claro'
  })

  return { mode, isDark, setMode, cycle, icon, label, colorMode }
}
