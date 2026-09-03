<template>
  <div class="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
    <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" :disabled="saving" @click="$emit('reset')">Hoàn tác</button>
    <button type="submit" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" :disabled="saving">
      <Icon :name="saving ? 'uil:spinner-alt' : 'uil:check'" :class="['h-4 w-4', saving && 'animate-spin']" />
      {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ saving: boolean }>()
defineEmits<{ reset: [] }>()
</script>
