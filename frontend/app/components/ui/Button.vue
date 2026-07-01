<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      sizeClasses[size],
      variantClasses[variant],
      block ? 'w-full' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <Icon v-if="loading" name="uil:spinner-alt" class="animate-spin mr-2 h-4 w-4" />
    <Icon v-else-if="icon" :name="icon" class="mr-2 h-4 w-4" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  variant: {
    type: String as () => 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost',
    default: 'primary'
  },
  size: {
    type: String as () => 'sm' | 'md' | 'lg',
    default: 'md'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:ring-blue-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
  outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500'
}
</script>
