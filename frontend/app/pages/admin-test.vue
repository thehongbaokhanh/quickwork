<template>
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h2 class="text-xl font-bold text-red-600 mb-2">Trang Quản Trị Tuyệt Mật</h2>
    <p class="text-slate-600">Nếu bạn nhìn thấy trang này, nghĩa là tài khoản của bạn có quyền ADMIN thực sự.</p>
  </div>
</template>

<script setup lang="ts">
// Đăng ký sử dụng middleware bảo vệ trang
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>