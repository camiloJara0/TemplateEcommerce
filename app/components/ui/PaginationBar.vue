<script setup lang="ts">
interface Props {
  currentPage: number
  lastPage: number
  total?: number
  perPage?: number
  siblingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  siblingCount: 1,
  perPage: 15,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = computed(() => {
  const { currentPage, lastPage, siblingCount } = props
  const totalNumbers = siblingCount * 2 + 3
  const totalBlocks = totalNumbers + 2

  if (lastPage <= totalBlocks) {
    return Array.from({ length: lastPage }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage)

  const showLeftDots = leftSiblingIndex > 3
  const showRightDots = rightSiblingIndex < lastPage - 2

  if (!showLeftDots && showRightDots) {
    const leftItemCount = totalNumbers + 2
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, '...', lastPage]
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = totalNumbers + 2
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => lastPage - rightItemCount + i + 1)
    return [1, '...', ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  )
  return [1, '...', ...middleRange, '...', lastPage]
})

function goTo(page: number) {
  if (page < 1 || page > props.lastPage || page === props.currentPage) return
  emit('update:currentPage', page)
}
</script>

<template>
  <div v-if="lastPage > 1" class="flex items-center justify-between gap-4">
    <p v-if="total != null" class="text-sm text-theme-muted hidden sm:block">
      {{ total }} resultados · Página {{ currentPage }} de {{ lastPage }}
    </p>
    <div class="flex items-center gap-1 ml-auto">
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="outline"
        size="xs"
        :disabled="currentPage <= 1"
        @click="goTo(currentPage - 1)"
      />

      <template v-for="(page, idx) in pages" :key="idx">
        <span v-if="page === '...'" class="px-1 text-theme-muted text-sm">…</span>
        <UButton
          v-else
          :label="String(page)"
          color="neutral"
          :variant="page === currentPage ? 'solid' : 'ghost'"
          size="xs"
          class="min-w-[32px]"
          @click="goTo(page as number)"
        />
      </template>

      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="outline"
        size="xs"
        :disabled="currentPage >= lastPage"
        @click="goTo(currentPage + 1)"
      />
    </div>
  </div>
</template>
