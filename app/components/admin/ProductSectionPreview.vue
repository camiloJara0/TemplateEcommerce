<script setup lang="ts">
import type { ProductoSecciones } from '~/types/store'

const props = defineProps<{ value: ProductoSecciones }>()

const mockProduct = {
  name: 'Producto de ejemplo',
  brand: 'Marca Premium',
  price: 199000,
  price_discount: 149000,
  rating: 4.8,
  reviews_count: 124,
  description: 'Este es un producto de ejemplo para previsualizar cómo se verá en la tienda.',
  page_config: {} as Record<string, unknown>
}

const productWithConfig = computed(() => ({
  ...mockProduct,
  page_config: props.value as unknown as Record<string, unknown>
}))

function sectionClass(key: string) {
  return [
    'relative cursor-pointer transition-all duration-200',
    'hover:ring-2 hover:ring-primary-400 ring-offset-1 ring-offset-white dark:ring-offset-slate-950'
  ]
}
</script>

<template>
  <div class="space-y-0">
    <!-- Hero Section -->
    <div v-if="value.hero.show" :class="sectionClass('hero')">
      <section class="py-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div class="max-w-5xl mx-auto px-4">
          <!-- Breadcrumbs -->
          <div v-if="value.hero.show_breadcrumbs" class="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <span>Inicio</span>
            <span>/</span>
            <span>Catálogo</span>
            <span>/</span>
            <span class="text-slate-600 dark:text-slate-300">Producto</span>
          </div>
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Gallery placeholder -->
            <div class="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <UIcon name="i-lucide-image" class="size-16 text-slate-300 dark:text-slate-600" />
            </div>
            <!-- Info -->
            <div class="space-y-4">
              <p class="text-sm text-primary-600 font-medium">Marca Premium</p>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Producto de ejemplo</h1>
              <div class="flex items-center gap-2">
                <div class="flex gap-0.5 text-amber-400">
                  <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-3" :class="s <= 4 ? 'fill-current' : 'opacity-30'" />
                </div>
                <span class="text-xs text-slate-500">(124 reseñas)</span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold">$149.000</span>
                <span class="text-sm text-slate-400 line-through">$199.000</span>
              </div>
              <p class="text-sm text-slate-500">Este es un producto de ejemplo para previsualizar cómo se verá.</p>
              <div class="flex gap-2">
                <span class="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">Agregar al carrito</span>
                <span class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm">
                  <UIcon name="i-lucide-heart" class="size-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Benefits Section -->
    <div v-if="value.benefits.show && value.benefits.items.length" :class="sectionClass('benefits')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4">
          <div class="text-center mb-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ value.benefits.title }}</h2>
            <p class="text-xs text-slate-500">{{ value.benefits.subtitle }}</p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="(item, i) in value.benefits.items" :key="i" class="text-center p-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-2">
                <UIcon :name="item.icon" class="size-5 text-primary-600" />
              </div>
              <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
              <p class="text-[10px] text-slate-500">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Problem/Solution -->
    <div v-if="value.problem_solution.show" :class="sectionClass('problem_solution')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white text-center mb-6">{{ value.problem_solution.headline }}</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <p class="text-xs font-semibold text-red-500">Problemas</p>
              <div v-for="(item, i) in value.problem_solution.problems" :key="i" class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <UIcon :name="item.icon" class="size-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                  <p class="text-[10px] text-slate-500">{{ item.description }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <p class="text-xs font-semibold text-green-500">{{ value.problem_solution.solution_headline }}</p>
              <div v-for="(item, i) in value.problem_solution.solution_items" :key="i" class="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <UIcon :name="item.icon" class="size-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                  <p class="text-[10px] text-slate-500">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Features -->
    <div v-if="value.features.show" :class="sectionClass('features')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">{{ value.features.title }}</h2>
          <p class="text-xs text-slate-500 text-center mb-6">{{ value.features.subtitle }}</p>
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="(item, i) in value.features.items" :key="i" class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <UIcon :name="item.icon" class="size-5 text-primary-600" />
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                <p class="text-[10px] text-slate-500">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Comparison -->
    <div v-if="value.comparison.show" :class="sectionClass('comparison')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">{{ value.comparison.headline }}</h2>
          <p class="text-xs text-slate-500 text-center mb-6">{{ value.comparison.subtext }}</p>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700">
                  <th class="text-left py-2 text-slate-500">Característica</th>
                  <th v-for="col in value.comparison.columns" :key="col.label" class="text-center py-2" :class="col.is_ours ? 'text-primary-600 font-semibold' : 'text-slate-500'">
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in value.comparison.rows" :key="i" class="border-b border-slate-100 dark:border-slate-800">
                  <td class="py-2 text-slate-700 dark:text-slate-300">{{ row.feature }}</td>
                  <td v-for="(val, vi) in row.values" :key="vi" class="text-center py-2 text-slate-600 dark:text-slate-400">
                    {{ val }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Bundle -->
    <div v-if="value.bundle.show" :class="sectionClass('bundle')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4">
          <div class="text-center p-6 bg-linear-to-r from-primary-50 to-purple-50 dark:from-primary-950/20 dark:to-purple-950/20 rounded-2xl">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ value.bundle.headline }}</h2>
            <p class="text-xs text-slate-500 mb-2">{{ value.bundle.subtext }}</p>
            <span class="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full">{{ value.bundle.discount_label }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Testimonials -->
    <div v-if="value.testimonials.show && value.testimonials.items.length" :class="sectionClass('testimonials')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">{{ value.testimonials.title }}</h2>
          <p class="text-xs text-slate-500 text-center mb-6">{{ value.testimonials.subtitle }}</p>
          <div class="grid md:grid-cols-3 gap-4">
            <div v-for="(t, i) in value.testimonials.items" :key="i" class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div class="flex gap-0.5 text-amber-400 mb-2">
                <UIcon v-for="n in t.rating" :key="n" name="i-lucide-star" class="size-3 fill-current" />
              </div>
              <p class="text-[10px] text-slate-600 dark:text-slate-400 italic">"{{ t.text }}"</p>
              <div class="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span class="text-[9px] font-semibold text-primary-600">{{ t.name[0] }}</span>
                </div>
                <div>
                  <p class="text-[10px] font-semibold text-slate-900 dark:text-white">{{ t.name }}</p>
                  <p class="text-[9px] text-slate-400">{{ t.role }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- FAQ -->
    <div v-if="value.faq.show && value.faq.items.length" :class="sectionClass('faq')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-3xl mx-auto px-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">{{ value.faq.title }}</h2>
          <p class="text-xs text-slate-500 text-center mb-6">{{ value.faq.subtitle }}</p>
          <div class="space-y-2">
            <div v-for="(item, i) in value.faq.items" :key="i" class="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ item.question }}</p>
              <p class="text-[10px] text-slate-500 mt-1">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- CTA -->
    <div v-if="value.cta.show" :class="sectionClass('cta')">
      <section class="py-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-3xl mx-auto px-4 text-center">
          <div class="p-8 rounded-2xl" :style="{ backgroundColor: value.cta.bg_color, color: value.cta.text_color }">
            <h2 class="text-lg font-bold mb-2">{{ value.cta.headline }}</h2>
            <p class="text-xs opacity-80 mb-4">{{ value.cta.subtext }}</p>
            <div class="flex justify-center gap-3">
              <span class="px-4 py-2 bg-white/20 rounded-xl text-xs font-semibold">{{ value.cta.cta_primary.label }}</span>
              <span v-if="value.cta.cta_secondary" class="px-4 py-2 border border-white/30 rounded-xl text-xs font-semibold">{{ value.cta.cta_secondary.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Empty state -->
    <div v-if="!value.hero.show && !value.benefits.show && !value.problem_solution.show && !value.features.show && !value.comparison.show && !value.bundle.show && !value.testimonials.show && !value.faq.show && !value.cta.show" class="py-12 text-center">
      <UIcon name="i-lucide-eye-off" class="size-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <p class="text-sm text-slate-400">Activa al menos una sección para ver la preview</p>
    </div>
  </div>
</template>
