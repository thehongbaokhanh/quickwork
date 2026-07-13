<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-slate-900">Báo cáo & Thống kê</h1>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <EmptyState 
        title="Tính năng đang phát triển" 
        description="Trang báo cáo thống kê đang được xây dựng. Vui lòng quay lại sau." 
        icon="uil:chart-line" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from '~/components/EmptyState.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})
</script>
