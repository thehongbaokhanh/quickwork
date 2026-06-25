<template>
  <div class="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
    <div class="flex flex-1">
      <aside class="w-64 bg-slate-900 text-slate-200 flex flex-col hidden md:flex">
        <div class="p-5 border-b border-slate-800 flex items-center gap-2 font-bold text-lg text-white">
          <Icon name="uil:setting" class="w-6 h-6 text-red-500" />
          <span>QuickWork Admin</span>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          <a href="#" class="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 text-white font-medium">
            <Icon name="uil:chart-pie" />
            <span>Hệ thống</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Icon name="uil:user-check" />
            <span>Duyệt Doanh Nghiệp</span>
          </a>
        </nav>
        <div class="p-4 border-t border-slate-800 text-xs text-slate-500">
          Tài khoản: Super Admin
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <header class="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6">
          <h1 class="text-xl font-semibold text-slate-800">Dashboard Quản Trị</h1>
          <button class="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium">
            <Icon name="uil:sign-out-alt" />
            <span>Đăng xuất</span>
          </button>
        </header>

        <main class="flex-1 p-6 overflow-y-auto">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logic quản trị nâng cao sẽ bổ sung khi kết nối Auth Store
</script>