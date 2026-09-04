<template>
  <label class="flex cursor-pointer items-center justify-between gap-5 py-5">
    <span class="min-w-0">
      <span class="block text-sm font-black text-slate-800">{{ title }}</span>
      <span class="mt-1 block text-xs font-medium leading-5 text-slate-500">{{ description }}</span>
    </span>
    <input :checked="modelValue" type="checkbox" class="peer sr-only" @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)">
    <span class="relative h-7 w-12 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-5" aria-hidden="true" />
  </label>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean, title: string, description: string }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
