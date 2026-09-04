<template>
  <div class="sr-only">Dang chuyen den danh sach ung vien bi tu choi...</div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

await navigateTo({ path: '/enterprise/applications', query: { view: 'rejected' } }, { replace: true })
</script>
