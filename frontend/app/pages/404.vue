<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
    <div class="text-blue-500 mb-4"><Icon name="uil:map-marker-question" class="w-20 h-20" /></div>
    <h1 class="text-4xl font-extrabold text-gray-900 mb-2">404 - Không tìm thấy trang</h1>
    <p class="text-gray-600 max-w-sm mb-6">Đường dẫn bạn đang truy cập không tồn tại hoặc đã bị gỡ bỏ khỏi cổng thông tin QuickWork.</p>
    <button @click="navigateTo('/')" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors">Về trang chủ</button>
  </div>
</template>