<template>
  <div class="block">
    <label class="text-sm font-bold text-slate-900" :for="inputId">{{ label }}</label>
    <span
      :class="[
        'mt-2 flex min-h-12 items-center gap-3 rounded-lg border bg-white px-4 py-3 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100',
        error ? 'border-rose-300' : 'border-slate-200'
      ]"
    >
      <Icon :name="icon" class="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
      <slot />
    </span>
    <span v-if="hint && !error" :id="hintId" class="mt-1.5 block text-xs font-medium text-slate-500">
      {{ hint }}
    </span>
    <span v-if="error" :id="errorId" class="mt-1.5 block text-xs font-semibold text-rose-600" role="alert">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  icon: string
  inputId: string
  error?: string
  hint?: string
}>()

const errorId = computed(() => `${props.inputId}-error`)
const hintId = computed(() => `${props.inputId}-hint`)
</script>
