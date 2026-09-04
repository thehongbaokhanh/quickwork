<template>
  <StudentSettingsWorkspace />
  <div v-if="false" class="mx-auto w-full max-w-[1220px]">
    <header class="mb-6">
      <h1 class="text-2xl font-black tracking-tight text-slate-950">Cài đặt</h1>
      <p class="mt-1 text-sm font-medium text-slate-500">Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn trên QuickWork.</p>
    </header>

    <div class="grid items-start gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
      <aside class="overflow-hidden rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/40">
        <button
          v-for="item in settingItems"
          :key="item.key"
          type="button"
          :class="[
            'group flex min-h-[68px] w-full items-center gap-3 rounded-2xl px-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
            activeSetting === item.key
              ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-blue-700'
              : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
          ]"
          @click="selectSetting(item)"
        >
          <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition', activeSetting === item.key ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-50 text-slate-500 group-hover:text-sky-600']">
            <Icon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-black">{{ item.label }}</span>
            <span class="mt-1 block truncate text-[11px] font-medium text-slate-500">{{ item.description }}</span>
          </span>
          <Icon name="uil:angle-right" class="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      </aside>

      <section class="min-w-0 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-7">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-black text-slate-950">Thông tin tài khoản</h2>
            <p class="mt-1 text-sm font-medium text-slate-500">Cập nhật thông tin cá nhân của bạn.</p>
          </div>
          <button type="button" class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100" @click="notifyDevelopment('Chỉnh sửa thông tin tài khoản')">
            <Icon name="uil:pen" class="h-4 w-4" aria-hidden="true" />
            Chỉnh sửa
          </button>
        </div>

        <div class="mt-7 flex flex-col gap-5 border-b border-slate-100 pb-7 sm:flex-row sm:items-center">
          <img v-if="avatarURL" :src="avatarURL" :alt="`Ảnh đại diện của ${userName}`" class="h-24 w-24 shrink-0 rounded-full border-4 border-slate-50 object-cover shadow-sm">
          <span v-else class="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-100 to-blue-200 text-2xl font-black text-blue-700 shadow-sm">{{ userInitials }}</span>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate text-lg font-black text-slate-950">{{ userName }}</h3>
              <span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                <Icon name="uil:graduation-cap" class="h-3.5 w-3.5" aria-hidden="true" />
                Sinh viên
              </span>
            </div>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
              <span class="truncate">{{ userEmail }}</span>
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">
                <Icon name="uil:check" class="h-3.5 w-3.5" aria-hidden="true" />
                Đã xác thực
              </span>
            </div>
            <p class="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <Icon name="uil:phone" class="h-4 w-4" aria-hidden="true" />
              {{ userPhone || 'Chưa cập nhật số điện thoại' }}
            </p>
          </div>
        </div>

        <div class="pt-6">
          <h3 class="text-sm font-black text-slate-800">Thông tin cá nhân</h3>
          <dl class="mt-5 grid gap-x-10 gap-y-4 text-sm lg:grid-cols-[220px_minmax(0,1fr)]">
            <template v-for="row in accountRows" :key="row.label">
              <dt class="font-medium text-slate-500">{{ row.label }}</dt>
              <dd :class="['font-semibold leading-6', row.missing ? 'italic text-slate-400' : 'text-slate-800']">{{ row.value }}</dd>
            </template>
          </dl>
        </div>
      </section>
    </div>

    <section class="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
      <h2 class="text-lg font-black text-slate-950">Cài đặt nhanh</h2>
      <p class="mt-1 text-sm font-medium text-slate-500">Một số thiết lập phổ biến cho tài khoản sinh viên.</p>

      <div class="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <button
          v-for="item in quickSettings"
          :key="item.label"
          type="button"
          class="flex min-h-[104px] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          @click="notifyDevelopment(item.label)"
        >
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Icon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-black text-slate-900">{{ item.label }}</span>
            <span class="mt-1 block text-xs font-medium leading-5 text-slate-500">{{ item.value }}</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'student',
  middleware: ['auth', 'student']
})

type SettingItem = {
  key: string
  label: string
  description: string
  icon: string
}

const authStore = useAuthStore()
const toast = useToast()
const activeSetting = ref('account')

const settingItems: SettingItem[] = [
  { key: 'account', label: 'Tài khoản', description: 'Thông tin cá nhân và tài khoản', icon: 'uil:user' },
  { key: 'security', label: 'Bảo mật', description: 'Đổi mật khẩu và xác thực', icon: 'uil:lock' },
  { key: 'notifications', label: 'Thông báo', description: 'Tùy chỉnh thông báo qua email', icon: 'uil:bell' },
  { key: 'jobs', label: 'Tùy chọn tìm việc', description: 'Ngành nghề, địa điểm, mức lương', icon: 'uil:briefcase-alt' },
  { key: 'privacy', label: 'Quyền riêng tư', description: 'Ai có thể xem thông tin của bạn', icon: 'uil:shield-check' },
  { key: 'language', label: 'Ngôn ngữ', description: 'Ngôn ngữ hiển thị của hệ thống', icon: 'uil:globe' },
  { key: 'appearance', label: 'Giao diện', description: 'Chế độ sáng, tối và giao diện', icon: 'uil:palette' },
  { key: 'connections', label: 'Liên kết tài khoản', description: 'Kết nối với các nền tảng khác', icon: 'uil:link' }
]

const currentUser = computed<any>(() => authStore.user || {})
const studentProfile = computed<any>(() => currentUser.value.student_profile || currentUser.value.studentProfile || {})
const userEmail = computed(() => String(currentUser.value.email || 'Chưa cập nhật email'))
const userName = computed(() => String(studentProfile.value.name || currentUser.value.name || currentUser.value.full_name || userEmail.value.split('@')[0] || 'Sinh viên QuickWork'))
const userPhone = computed(() => String(studentProfile.value.phone || currentUser.value.phone || '').trim())
const avatarURL = computed(() => String(studentProfile.value.avatar || currentUser.value.avatar || '').trim())
const userInitials = computed(() => userName.value.split(/\s+/).filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase() || 'SV')

function firstProfileValue(...keys: string[]) {
  for (const key of keys) {
    const value = studentProfile.value[key] ?? currentUser.value[key]
    if (value !== null && value !== undefined && String(value).trim()) return String(value).trim()
  }
  return ''
}

function formatProfileDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const accountRows = computed(() => {
  const values = [
    { label: 'Họ và tên', value: userName.value },
    { label: 'Ngày sinh', value: formatProfileDate(firstProfileValue('date_of_birth', 'birth_date', 'birthday')) },
    { label: 'Giới tính', value: firstProfileValue('gender') },
    { label: 'Địa chỉ', value: firstProfileValue('address', 'location') },
    { label: 'Trường đại học', value: firstProfileValue('university', 'school') },
    { label: 'Chuyên ngành', value: firstProfileValue('major', 'specialization') },
    { label: 'Năm học', value: firstProfileValue('year_of_study', 'school_year') },
    { label: 'Giới thiệu bản thân', value: firstProfileValue('bio', 'about', 'introduction') }
  ]
  return values.map(row => ({ ...row, missing: !row.value, value: row.value || 'Chưa cập nhật' }))
})

const quickSettings = computed(() => [
  { label: 'Đổi mật khẩu', value: 'Cập nhật mật khẩu tài khoản của bạn', icon: 'uil:lock' },
  { label: 'Cập nhật CV mặc định', value: studentProfile.value.cv_url ? 'CV đã được cập nhật' : 'Chưa chọn CV mặc định', icon: 'uil:file-alt' },
  { label: 'Email nhận thông báo', value: userEmail.value, icon: 'uil:envelope' },
  { label: 'Ngôn ngữ hiển thị', value: 'Tiếng Việt', icon: 'uil:globe' }
])

function selectSetting(item: SettingItem) {
  if (item.key === 'account') {
    activeSetting.value = item.key
    return
  }
  notifyDevelopment(item.label)
}

function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`)
}
</script>
