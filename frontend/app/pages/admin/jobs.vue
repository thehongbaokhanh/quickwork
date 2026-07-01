<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-slate-900">Quản lý Việc làm</h1>
      <UiButton variant="primary" icon="uil:plus">Đăng Việc Làm</UiButton>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <EmptyState 
        title="Tính năng đang phát triển" 
        description="Trang quản lý việc làm đang được xây dựng. Vui lòng quay lại sau." 
        icon="uil:briefcase-alt" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'
import EmptyState from '~/components/EmptyState.vue'

definePageMeta({
  layout: 'admin'
})
</script>
