<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
    <!-- Nút quay lại Trang chủ ở góc trên bên trái -->
    <div class="absolute top-4 left-4 sm:top-6 sm:left-8">
      <NuxtLink 
        to="/" 
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200/60 shadow-sm transition-all hover:scale-102"
      >
        <Icon name="uil:arrow-left" class="w-4 h-4" />
        <span>Quay về trang chủ</span>
      </NuxtLink>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <NuxtLink to="/" class="inline-flex flex-col items-center group">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-3 shadow-md shadow-indigo-100 group-hover:scale-105 transition-all">
          <Icon name="uil:briefcase" class="w-6 h-6" />
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Quick<span class="text-indigo-600">Work</span> Portal</h2>
      </NuxtLink>
      <p class="mt-2 text-xs text-slate-400 font-semibold">Hệ thống xác thực tập trung sinh viên & doanh nghiệp</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-3xl sm:px-10 border border-slate-100">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout xác thực thuần túy không chứa logic trạng thái phức tạp
</script>