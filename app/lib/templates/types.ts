import type { TiendaConfig, PageSection } from '~/types/store'

export interface Template {
  id: string
  name: string
  description: string
  category: string
  categoryLabel: string
  difficulty: 'basico' | 'intermedio' | 'avanzado'
  difficultyLabel: string
  icon: string
  gradient: string
  sections: string[]
  sectionCount: number
  config: TiendaConfig
}

export interface TemplateCategory {
  key: string
  label: string
  items: Template[]
}

export type TemplateFilter = {
  category?: string
  difficulty?: string
  search?: string
}
