<template>
  <footer class="bg-slate-950 text-white">
    <div class="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1.8fr] lg:px-8">
      <div>
        <FooterBrandMark />
        <!-- <p class="mt-3 text-sm font-semibold text-slate-400"></p> -->
        <p class="mt-5 max-w-md text-sm leading-7 text-slate-300">
          Nền tảng tuyển dụng dành cho ứng viên trẻ, sinh viên và doanh nghiệp cần kết nối nhanh với cơ hội phù hợp.
        </p>
        <a :href="`mailto:${supportEmail}`" class="mt-3 inline-flex text-sm font-semibold text-sky-300 hover:text-sky-200">
          {{ supportEmail }}
        </a>
      </div>

      <div class="grid gap-8 sm:grid-cols-3">
        <div>
          <h3 class="text-sm font-bold text-white">Ứng viên</h3>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            <a href="#featured-jobs" class="hover:text-sky-300">Tìm việc</a>
            <button type="button" class="text-left hover:text-sky-300" @click="handleNotify('Việc đã lưu')">Việc đã lưu</button>
            <NuxtLink to="/register?role=student" class="hover:text-sky-300">Tạo hồ sơ</NuxtLink>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">Nhà tuyển dụng</h3>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            <NuxtLink to="/register?role=enterprise" class="hover:text-sky-300">Đăng tin</NuxtLink>
            <a href="#employer" class="hover:text-sky-300">Giải pháp tuyển dụng</a>
            <button type="button" class="text-left hover:text-sky-300" @click="$emit('notify', 'Bảng giá')">Bảng giá</button>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">{{ systemName }}</h3>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            <button type="button" class="text-left hover:text-sky-300" @click="$emit('notify', 'Blog')">Blog</button>
            <button type="button" class="text-left hover:text-sky-300" @click="$emit('notify', 'Điều khoản')">Điều khoản</button>
            <button type="button" class="text-left hover:text-sky-300" @click="$emit('notify', 'Bảo mật')">Bảo mật</button>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 {{ systemName }}. All rights reserved.</p>
        <p>Dữ liệu việc làm hiển thị theo hệ thống hiện có.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import FooterBrandMark from '~/components/FooterBrandMark.vue'
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits<{
  notify: [feature: string]
}>()

const authStore = useAuthStore()
const { notifyStudentLoginRequired } = useStudentLoginPrompt()
const { systemName, supportEmail } = usePlatformSettings()

function handleNotify(feature: string) {
  if (feature === 'Việc đã lưu' && !authStore.isAuthenticated) {
    notifyStudentLoginRequired('Đăng nhập bằng tài khoản sinh viên để xem danh sách việc làm đã lưu.')
    return
  }

  emit('notify', feature)
}
</script>
