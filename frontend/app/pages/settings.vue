<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <EmptyState
        title="Tính năng đang phát triển"
        description="Trang cấu hình tài khoản đang được xây dựng. Vui lòng quay lại sau."
        icon="uil:setting"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from '~/components/EmptyState.vue'

definePageMeta({
  layout: 'student',
  middleware: ['auth']
})
</script>
