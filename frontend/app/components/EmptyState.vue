<template>
  <div class="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-gray-300 max-w-xl mx-auto">
    <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-400 mb-4">
      <Icon :name="icon" class="w-8 h-8" />
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-1">{{ title }}</h3>
    <p class="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{{ description }}</p>
    <div v-if="$slots.action" class="flex justify-center">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Không tìm thấy dữ liệu',
  description: 'Hệ thống hiện chưa có bản ghi nào phù hợp với điều kiện của bạn.',
  icon: 'uil:folder-question'
})
</script>