<template>
  <label class="block">
    <span class="mb-2 block text-sm font-black text-slate-700">{{ label }} <b class="text-rose-500">*</b></span>
    <span class="relative block">
      <input :value="modelValue" :type="visible ? 'text' : 'password'" :autocomplete="autocomplete" :aria-invalid="Boolean(error)" :class="['h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm font-semibold text-slate-800 outline-none transition focus:ring-4', error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100']" required @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)">
      <button type="button" class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-blue-600" :aria-label="visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="visible = !visible">
        <Icon :name="visible ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
      </button>
    </span>
    <span v-if="error" class="mt-2 flex items-start gap-1.5 text-xs font-bold text-rose-600" role="alert">
      <Icon name="uil:exclamation-circle" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {{ error }}
    </span>
    <span v-else-if="hint" class="mt-2 block text-xs font-medium leading-5 text-slate-500">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ modelValue: string, label: string, autocomplete: string, error?: string, hint?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
const visible = ref(false)
</script>
