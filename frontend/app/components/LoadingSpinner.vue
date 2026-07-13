<template>
  <div v-if="show" class="flex flex-col items-center justify-center p-6 space-y-2">
    <div :class="[
      'animate-spin rounded-full border-t-transparent border-emerald-600',
      sizeClasses[size]
    ]"></div>
    <span v-if="description" class="text-sm text-gray-500 font-medium animate-pulse">
      {{ description }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  size?: 'sm' | 'md' | 'lg'
  description?: string
}

withDefaults(defineProps<Props>(), {
  show: true,
  size: 'md',
  description: 'Đang tải dữ liệu...'
})

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-4',
  lg: 'w-16 h-16 border-4'
}
</script>