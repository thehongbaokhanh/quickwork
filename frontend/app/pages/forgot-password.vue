<template>
  <div class="text-center text-sm text-gray-600">
    Chức năng Khôi phục Mật khẩu đang được bảo trì. 
    <NuxtLink to="/auth/login" class="text-emerald-600 block mt-4 font-medium">Quay lại Đăng nhập</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>