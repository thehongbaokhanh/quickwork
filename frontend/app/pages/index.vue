<template>
  <NuxtLayout name="default">
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 class="text-lg font-bold mb-4 text-gray-800">Thử nghiệm SearchBox & Loading</h2>
        <SearchBox @search="onSearchTrigger" placeholder="Thử gõ tên công ty..." />
        <p class="text-xs text-blue-500 mt-2">Trạng thái từ khóa hiện tại: {{ activeKeyword || 'Trống' }}</p>
      </div>

      <LoadingSpinner :show="isLoading" description="Đang quét bộ lọc dữ liệu tuyển dụng..." />

      <EmptyState 
        v-if="!isLoading" 
        title="Chưa có hồ sơ ứng tuyển" 
        description="Có vẻ như bạn chưa nộp đơn vào vị trí công việc nào của dự án QuickWork."
      >
        <template #action>
          <button @click="isModalOpen = true" class="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
            Kích hoạt Confirm Dialog Danger
          </button>
        </template>
      </EmptyState>

      <ConfirmDialog 
        :is-open="isModalOpen" 
        title="Xóa vĩnh viễn hồ sơ ứng tuyển?" 
        message="Hành động này không thể hoàn tác. Dữ liệu ứng tuyển trên hệ thống GoFiber sẽ bị hủy hoàn toàn."
        :is-danger="true"
        @confirm="handleConfirmAction"
        @cancel="isModalOpen = false"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeKeyword = ref('')
const isLoading = ref(false)
const isModalOpen = ref(false)

const onSearchTrigger = (val: string) => {
  activeKeyword.value = val
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const handleConfirmAction = () => {
  isModalOpen.value = false
  alert('Xử lý xóa thành công!')
}
</script>