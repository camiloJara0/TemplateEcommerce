export function useThemeConfig() {
  const configStore = useStoreConfigStore()

  if (import.meta.client) {
    watchEffect(() => {
      const styles = configStore.effectiveTiendaConfig?.estilos
      if (!styles) return
      console.log(styles.fondos)
      const root = document.documentElement

      // ── Colores base (misma marca en ambos modos) ──
      if (styles.colores) {
        root.style.setProperty('--color-brand-500', styles.colores.primario)
        root.style.setProperty('--color-secondary-500', styles.colores.secundario)
        root.style.setProperty('--color-accent-500', styles.colores.accent)
        root.style.setProperty('--color-bg', styles.colores.fondo)
      }

      // ── Paleta semántica (light / dark) ──
      if (styles.paleta) {
        const p = styles.paleta
        root.style.setProperty('--text-primary-light', p.texto_principal_claro)
        root.style.setProperty('--text-primary-dark', p.texto_principal_oscuro)
        root.style.setProperty('--text-secondary-light', p.texto_secundario_claro)
        root.style.setProperty('--text-secondary-dark', p.texto_secundario_oscuro)
        root.style.setProperty('--text-muted-light', p.texto_muted_claro)
        root.style.setProperty('--text-muted-dark', p.texto_muted_oscuro)
        root.style.setProperty('--text-on-brand-light', p.texto_sobre_marca_claro)
        root.style.setProperty('--text-on-brand-dark', p.texto_sobre_marca_oscuro)

        root.style.setProperty('--border-color-light', p.borde_claro)
        root.style.setProperty('--border-color-dark', p.borde_oscuro)

        root.style.setProperty('--surface-light', p.superficie_claro)
        root.style.setProperty('--surface-dark', p.superficie_oscuro)
        root.style.setProperty('--bg-alt-light', p.fondo_alt_claro)
        root.style.setProperty('--bg-alt-dark', p.fondo_alt_oscuro)

        root.style.setProperty('--color-brand-light', p.marca_claro)
        root.style.setProperty('--color-brand-dark', p.marca_oscuro)
        root.style.setProperty('--color-brand-hover-light', p.marca_hover_claro)
        root.style.setProperty('--color-brand-hover-dark', p.marca_hover_oscuro)
        root.style.setProperty('--color-accent-light', p.acento_claro)
        root.style.setProperty('--color-accent-dark', p.acento_oscuro)
      }

      // ── Fondos (light / dark) ──
      if (styles.fondos) {
        const f = styles.fondos
        root.style.setProperty('--bg-principal-light', f.fondo_principal)
        root.style.setProperty('--bg-principal-dark', f.fondo_principal_dark)
        root.style.setProperty('--bg-imagenes-light', f.fondo_imagenes)
        root.style.setProperty('--bg-imagenes-dark', f.fondo_imagenes_dark)
        root.style.setProperty('--bg-componentes-light', f.fondo_componentes)
        root.style.setProperty('--bg-componentes-dark', f.fondo_componentes_dark)
        root.style.setProperty('--bg-tipo', f.tipo_fondo)
        root.style.setProperty('--gradiente-from', f.gradiente_from)
        root.style.setProperty('--gradiente-via', f.gradiente_via)
        root.style.setProperty('--gradiente-to', f.gradiente_to)
        root.style.setProperty('--gradiente-dir', f.gradiente_direccion)
      }

      // ── Tipografía ──
      if (styles.tipografia) {
        root.style.setProperty('--font-family', styles.tipografia.font_family)
        root.style.setProperty('--font-size-base', `${styles.tipografia.base_size}px`)
        root.style.setProperty('--font-weight-heading', String(styles.tipografia.heading_weight))
      }

      // ── Bordes ──
      if (styles.borders) {
        root.style.setProperty('--radius-soft', styles.borders.radius_global)
        root.style.setProperty('--radius-buttons', styles.borders.radius_buttons)
        root.style.setProperty('--radius-cards', styles.borders.radius_cards)
      }

      // ── Espaciado ──
      if (styles.spacing) {
        root.style.setProperty('--spacing-section', styles.spacing.section_padding)
        root.style.setProperty('--spacing-container-max', styles.spacing.container_max)
      }
    })
  }
}
