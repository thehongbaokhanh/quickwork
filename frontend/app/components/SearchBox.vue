<template>
  <div class="relative flex items-center w-full max-w-md">
    <div class="absolute left-3 text-gray-400 pointer-events-none flex items-center">
      <Icon name="uil:search" class="w-5 h-5" />
    </div>
    <input
      type="text"
      v-model="searchQuery"
      :placeholder="placeholder"
      class="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
      @keyup.enter="emitSearch"
    />
    <button 
      v-if="searchQuery" 
      @click="clearSearch"
      class="absolute right-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
    >
      <Icon name="uil:times" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  placeholder?: string
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Tìm kiếm nhanh...',
  delay: 400
})

const emit = defineEmits<{
  (e: 'search', value: string): void
}>()

const searchQuery = ref('')

// Sử dụng utility useDebounceFn từ @vueuse để tối ưu hóa tần suất kích hoạt tìm kiếm
const debouncedEmit = useDebounceFn(() => {
  emit('search', searchQuery.value)
}, props.delay)

watch(searchQuery, () => {
  debouncedEmit()
})

const emitSearch = () => {
  emit('search', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}
</script>