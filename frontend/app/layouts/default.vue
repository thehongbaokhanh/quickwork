<template>
  <div class="min-h-screen bg-gray-50 flex flex-col text-gray-900">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 h-16 flex items-center justify-between px-4 lg:px-6">
      <div class="flex items-center gap-4">
        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="p-2 rounded-md hover:bg-gray-100 lg:hidden text-gray-600 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Icon name="uil:bars" class="w-6 h-6" />
        </button>
        <div class="flex items-center">
          <img src="/images/brand/quickwork-wordmark-transparent.png" alt="QuickWork" class="h-10 w-auto object-contain">
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500 hidden sm:inline">Chào mừng quay trở lại</span>
        <div class="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-semibold text-sm">
          U
        </div>
      </div>
    </header>

    <div class="flex flex-1 relative">
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity"
      ></div>

      <aside 
        :class="[
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 pt-16 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:pt-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="h-full px-3 py-4 overflow-y-auto flex flex-col justify-between">
          <ul class="space-y-2 font-medium">
            <li>
              <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group bg-gray-100">
                <Icon name="uil:apps" class="w-5 h-5 text-gray-500" />
                <span class="ms-3">Tổng quan</span>
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                <Icon name="uil:file-alt" class="w-5 h-5 text-gray-500" />
                <span class="ms-3">Việc làm</span>
              </a>
            </li>
          </ul>
          <div class="p-2 border-t border-gray-100 text-xs text-gray-400 text-center">
            Vai trò: Student / Company
          </div>
        </div>
      </aside>

      <main class="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full min-w-0">
        <slot />
      </main>
    </div>

    <footer class="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
      <p>&copy; 2026 QuickWork. Kết nối tri thức, kiến tạo tương lai.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isSidebarOpen = ref(false)
</script>
