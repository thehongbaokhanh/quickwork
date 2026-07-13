<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
    <div class="text-amber-500 mb-4"><Icon name="uil:padlock" class="w-20 h-20" /></div>
    <h1 class="text-4xl font-extrabold text-gray-900 mb-2">403 - Từ chối Truy cập</h1>
    <p class="text-gray-600 max-w-sm mb-6">Tài khoản của bạn không có đủ thẩm quyền nghiệp vụ để truy cập phân vùng chức năng này.</p>
    <NuxtLink to="/auth/login" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 shadow-sm transition-colors">Quay lại Đăng nhập</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>