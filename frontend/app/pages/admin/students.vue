<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-slate-900">Quản lý Học viên</h1>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <EmptyState 
        title="Tính năng đang phát triển" 
        description="Trang quản lý học viên đang được xây dựng. Vui lòng quay lại sau." 
        icon="uil:graduation-cap" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from '~/components/EmptyState.vue'

definePageMeta({
  layout: 'admin'
})
</script>
