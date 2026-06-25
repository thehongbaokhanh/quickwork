<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-md">
        <Icon name="uil:briefcase" class="w-6 h-6" />
      </div>
      <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">QuickWork Portal</h2>
      <p class="mt-2 text-sm text-gray-600">Hệ thống xác thực tập trung sinh viên & doanh nghiệp</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout xác thực thuần túy không chứa logic trạng thái phức tạp
</script>