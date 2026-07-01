<template>
  <div
    :class="[
      'animate-pulse bg-slate-200',
      roundedClass,
      heightClass,
      widthClass
    ]"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String as () => 'text' | 'circular' | 'rectangular',
    default: 'text'
  },
  width: {
    type: String,
    default: 'w-full'
  },
  height: {
    type: String,
    default: ''
  }
})

const roundedClass = computed(() => {
  switch (props.type) {
    case 'circular': return 'rounded-full'
    case 'text': return 'rounded-md'
    default: return 'rounded-lg'
  }
})

const heightClass = computed(() => {
  if (props.height) return props.height
  switch (props.type) {
    case 'text': return 'h-4'
    case 'circular': return 'h-12'
    default: return 'h-24'
  }
})

const widthClass = computed(() => {
  if (props.type === 'circular' && props.width === 'w-full') {
    return 'w-12' // fallback for circular if not specified
  }
  return props.width
})
</script>
