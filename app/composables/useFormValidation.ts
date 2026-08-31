type Rule = {
  key: string
  label: string
  required?: boolean
  minLength?: number
  maxLength?: number
  isEmail?: boolean
  match?: string
  min?: number
  pattern?: RegExp
  patternMessage?: string
  custom?: (value: any, form: Record<string, any>) => string | null
}

export function useFormValidation(rules: Rule[]) {
  const form = ref<Record<string, any>>({})
  const touched = ref<Record<string, boolean>>({})
  const submitted = ref(false)

  const errors = computed(() => {
    const result: Record<string, string | null> = {}
    for (const rule of rules) {
      const value = form.value[rule.key]
      const error = validateField(rule, value)
      result[rule.key] = error ?? null
    }
    return result
  })

  const visibleErrors = computed(() => {
    const result: Record<string, string | null> = {}
    for (const rule of rules) {
      if (submitted.value || touched.value[rule.key]) {
        result[rule.key] = errors.value[rule.key] ?? null
      } else {
        result[rule.key] = null
      }
    }
    return result
  })

  const isValid = computed(() => {
    return Object.values(errors.value).every(e => e === null)
  })

  function validateField(rule: Rule, value: any): string | null | undefined {
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${rule.label} es requerido`
    }
    if (value && typeof value === 'string') {
      if (rule.minLength && value.trim().length < rule.minLength) {
        return `${rule.label} debe tener al menos ${rule.minLength} caracteres`
      }
      if (rule.maxLength && value.trim().length > rule.maxLength) {
        return `${rule.label} no debe exceder ${rule.maxLength} caracteres`
      }
      if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Ingresa un email válido'
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.patternMessage || `${rule.label} no es válido`
      }
    }
    if (value && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `${rule.label} debe ser al menos ${rule.min}`
      }
    }
    if (rule.match && value !== form.value[rule.match]) {
      return 'Las contraseñas no coinciden'
    }
    if (rule.custom) {
      return rule.custom(value, form.value)
    }
    return null
  }

  function touch(key: string) {
    touched.value[key] = true
  }

  function submit() {
    submitted.value = true
    return isValid.value
  }

  function reset() {
    form.value = {}
    touched.value = {}
    submitted.value = false
  }

  function setForm(initial: Record<string, any>) {
    form.value = { ...initial }
  }

  return { form, errors, visibleErrors, isValid, touch, submit, reset, setForm }
}
