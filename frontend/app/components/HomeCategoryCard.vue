<template>
  <button
    type="button"
    class="group min-h-[132px] rounded-[22px] border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/45 transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-slate-200/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
    :aria-label="`Xem việc làm ngành ${title}`"
    @click="$emit('select', title)"
  >
    <span class="flex items-start justify-between gap-4">
      <span :class="['flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105', iconClass]">
        <Icon :name="icon" class="h-7 w-7" aria-hidden="true" />
      </span>
      <span v-if="isHighDemand" class="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
        Nhu cầu cao
      </span>
    </span>

    <span class="mt-5 block text-lg font-extrabold text-slate-950">{{ title }}</span>
    <span class="mt-2 block text-sm font-semibold text-slate-500">{{ countLabel }}</span>
    <span class="mt-4 block h-2 overflow-hidden rounded-full bg-slate-100">
      <span class="block h-full rounded-full bg-sky-500" :style="{ width: `${percent}%` }" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  count: number
  slots?: number
  percent?: number
  icon: string
  iconClass: string
}>(), {
  slots: 0,
  percent: 16
})

defineEmits<{
  select: [title: string]
}>()

const countLabel = computed(() => {
  const count = `${props.count.toLocaleString('vi-VN')} việc làm`
  if (!props.slots) return count
  return `${count} · ${props.slots.toLocaleString('vi-VN')} vị trí`
})

const isHighDemand = computed(() => props.percent >= 70)
</script>
