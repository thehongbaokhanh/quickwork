<template>
  <div class="flex items-start gap-3 border-b border-slate-100 pb-5">
    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
      <Icon :name="icon" class="h-5 w-5" aria-hidden="true" />
    </span>
    <div>
      <h2 class="text-xl font-black text-slate-950">{{ title }}</h2>
      <p class="mt-1 text-sm font-medium text-slate-500">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string, description: string, icon: string }>()
</script>
