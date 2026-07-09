<template>
  <div class="space-y-5">
    <section class="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm lg:p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-black text-white">
            <Icon name="uil:graduation-cap" class="h-4 w-4" />
            Hồ sơ học viên
          </div>
          <h1 class="mt-4 text-2xl font-black lg:text-3xl">Quản lý học viên</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Theo dõi thông tin liên hệ, kỹ năng, CV và trạng thái truy cập của tài khoản học viên đang có trong hệ thống.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isLoading"
          @click="fetchStudents"
        >
          <Icon name="uil:sync" class="h-4 w-4" />
          Làm mới
        </button>
      </div>
    </section>

    <div v-if="errorMessage" class="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
      {{ errorMessage }}
    </div>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in summaryCards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-black uppercase text-slate-500">{{ card.label }}</p>
            <p class="mt-3 text-3xl font-black text-slate-950">{{ card.value }}</p>
            <p class="mt-1 text-xs font-semibold text-slate-500">{{ card.helper }}</p>
          </div>
          <span :class="['flex h-10 w-10 items-center justify-center rounded-md', card.iconClass]">
            <Icon :name="card.icon" class="h-5 w-5" />
          </span>
        </div>
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:p-5">
          <label class="relative block">
            <Icon name="uil:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              class="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              placeholder="Tìm học viên theo tên, email, điện thoại, kỹ năng..."
              type="search"
            >
          </label>

          <select v-model="activeStatus" class="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm khóa</option>
            <option value="BANNED">Bị cấm</option>
          </select>

          <button class="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50" type="button" @click="clearFilters">
            <Icon name="uil:filter-slash" class="h-4 w-4" />
            Xóa lọc
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[960px] text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th class="px-5 py-3">STT</th>
                <th class="px-5 py-3">Học viên</th>
                <th class="px-5 py-3">Liên hệ</th>
                <th class="px-5 py-3">Kỹ năng</th>
                <th class="px-5 py-3">CV</th>
                <th class="px-5 py-3">Trạng thái</th>
                <th class="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="isLoading">
                <td colspan="7" class="px-5 py-8">
                  <div class="space-y-3">
                    <div v-for="index in 5" :key="index" class="h-12 animate-pulse rounded-md bg-slate-100" />
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredStudents.length === 0">
                <td colspan="7" class="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                  Không có học viên phù hợp với dữ liệu hiện tại.
                </td>
              </tr>
              <template v-else>
              <tr v-for="(student, index) in filteredStudents" :key="student.id" class="transition hover:bg-slate-50/80">
                  <td class="px-5 py-4 font-black text-slate-400">{{ index + 1 }}</td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-indigo-50 text-sm font-black text-indigo-700">
                        <img v-if="student.student_profile?.avatar" :src="student.student_profile.avatar" alt="" class="h-full w-full object-cover">
                        <span v-else>{{ getInitial(student) }}</span>
                      </div>
                      <div class="min-w-0">
                        <p class="truncate font-black text-slate-950">{{ getStudentName(student) }}</p>
                        <p class="truncate text-xs font-medium text-slate-500">{{ student.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 font-semibold text-slate-600">{{ student.student_profile?.phone || 'Chưa cập nhật' }}</td>
                  <td class="px-5 py-4">
                    <div class="flex max-w-[220px] flex-wrap gap-1">
                      <span v-for="skill in getSkills(student).slice(0, 3)" :key="skill" class="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                        {{ skill }}
                      </span>
                      <span v-if="getSkills(student).length === 0" class="text-xs font-semibold text-slate-400">Chưa cập nhật</span>
                      <span v-else-if="getSkills(student).length > 3" class="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">
                        +{{ getSkills(student).length - 3 }}
                      </span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <a v-if="student.student_profile?.cv_url" :href="student.student_profile.cv_url" target="_blank" class="qw-chip bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      <Icon name="uil:file-download" class="h-4 w-4" />
                      Xem CV
                    </a>
                    <span v-else class="text-xs font-semibold text-slate-400">Chưa có</span>
                  </td>
                  <td class="px-5 py-4">
                    <span :class="['qw-chip', statusClass(student.status)]">
                      {{ statusLabel(student.status) }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <button class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50" type="button" title="Xem chi tiết" @click="selectedStudent = student">
                        <Icon name="uil:eye" class="h-4 w-4" />
                      </button>
                      <select
                        class="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="updatingUserId === student.id"
                        :value="normalizeStatus(student.status)"
                        @change="handleStatusChange(student, $event)"
                      >
                        <option value="ACTIVE">Kích hoạt</option>
                        <option value="INACTIVE">Tạm khóa</option>
                        <option value="BANNED">Cấm</option>
                      </select>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-black text-slate-950">Tình trạng hồ sơ</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">Tính từ dữ liệu học viên đang tải.</p>
          </div>
          <Icon name="uil:chart-pie" class="h-5 w-5 text-slate-400" />
        </div>
        <div class="mt-5 space-y-4">
          <div v-for="item in profileBars" :key="item.label">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="font-bold text-slate-700">{{ item.label }}</span>
              <span class="font-black text-slate-950">{{ item.value }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
              <div :class="['h-full rounded-full', item.className]" :style="{ width: `${item.percent}%` }" />
            </div>
          </div>
        </div>
      </aside>
    </section>

    <div v-if="selectedStudent" class="qw-detail-backdrop" @click.self="selectedStudent = null">
      <section class="qw-detail-panel">
        <header class="qw-detail-header">
          <div class="qw-detail-identity">
            <div class="qw-detail-avatar">
              <img v-if="selectedStudent.student_profile?.avatar" :src="selectedStudent.student_profile.avatar" alt="" class="h-full w-full object-cover">
              <span v-else>{{ getInitial(selectedStudent) }}</span>
            </div>
            <div class="min-w-0">
              <p class="qw-detail-eyebrow">Chi tiết học viên</p>
              <h2 class="qw-detail-title">{{ getStudentName(selectedStudent) }}</h2>
              <p class="qw-detail-subtitle">{{ selectedStudent.email }}</p>
              <div class="qw-detail-badges">
                <span class="qw-chip qw-chip--compact bg-indigo-50 text-indigo-700">Học viên</span>
                <span :class="['qw-chip', statusClass(selectedStudent.status)]">{{ statusLabel(selectedStudent.status) }}</span>
              </div>
            </div>
          </div>
          <button class="qw-detail-close" type="button" @click="selectedStudent = null">
            <Icon name="uil:times" class="h-5 w-5" />
          </button>
        </header>
        <div class="qw-detail-body">
          <div class="qw-detail-grid">
            <div v-for="item in detailItems(selectedStudent)" :key="item.label" class="qw-detail-item">
              <p class="qw-detail-label">{{ item.label }}</p>
              <p class="qw-detail-value">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AdminService } from '~/services/admin.service'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'

const toast = useToast()
const students = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const activeStatus = ref('ALL')
const selectedStudent = ref<any | null>(null)
const updatingUserId = ref<number | null>(null)

const summaryCards = computed(() => [
  {
    label: 'Tổng học viên',
    value: students.value.length,
    helper: 'Tài khoản role STUDENT',
    icon: 'uil:graduation-cap',
    iconClass: 'bg-indigo-50 text-indigo-700'
  },
  {
    label: 'Đang hoạt động',
    value: countByStatus('ACTIVE'),
    helper: 'Có thể đăng nhập',
    icon: 'uil:check-circle',
    iconClass: 'bg-emerald-50 text-emerald-700'
  },
  {
    label: 'Có số điện thoại',
    value: students.value.filter((student) => Boolean(student?.student_profile?.phone)).length,
    helper: 'Đã cập nhật liên hệ',
    icon: 'uil:phone',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    label: 'Có CV',
    value: students.value.filter((student) => Boolean(student?.student_profile?.cv_url)).length,
    helper: 'Sẵn sàng ứng tuyển',
    icon: 'uil:file-check-alt',
    iconClass: 'bg-amber-50 text-amber-700'
  }
])

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return students.value.filter((student) => {
    const matchesStatus = activeStatus.value === 'ALL' || normalizeStatus(student.status) === activeStatus.value
    const searchable = [
      getStudentName(student),
      student.email,
      student?.student_profile?.phone,
      statusLabel(student.status),
      ...getSkills(student)
    ].filter(Boolean).join(' ').toLowerCase()

    return matchesStatus && (!query || searchable.includes(query))
  })
})

const profileBars = computed(() => {
  const total = Math.max(students.value.length, 1)
  return [
    {
      label: 'Có hồ sơ học viên',
      value: students.value.filter((student) => Boolean(student?.student_profile)).length,
      className: 'bg-indigo-500'
    },
    {
      label: 'Có số điện thoại',
      value: students.value.filter((student) => Boolean(student?.student_profile?.phone)).length,
      className: 'bg-sky-500'
    },
    {
      label: 'Có kỹ năng',
      value: students.value.filter((student) => getSkills(student).length > 0).length,
      className: 'bg-emerald-500'
    },
    {
      label: 'Có CV',
      value: students.value.filter((student) => Boolean(student?.student_profile?.cv_url)).length,
      className: 'bg-amber-500'
    }
  ].map((item) => ({
    ...item,
    percent: item.value === 0 ? 0 : Math.max(8, Math.round((item.value / total) * 100))
  }))
})

async function fetchStudents() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const response: any = await AdminService.getStudents()
    students.value = response?.success && Array.isArray(response.data) ? response.data : []
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách học viên.'
    students.value = []
  } finally {
    isLoading.value = false
  }
}

async function updateUserStatus(student: any, status: UserStatus) {
  if (normalizeStatus(student.status) === status) return
  try {
    updatingUserId.value = student.id
    const response: any = await AdminService.updateUserStatus(student.id, status)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật trạng thái.')
    }
    toast.success('Đã cập nhật học viên', `${getStudentName(student)} chuyển sang ${statusLabel(status)}.`)
    await fetchStudents()
  } catch (error: any) {
    toast.error('Cập nhật thất bại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
    await fetchStudents()
  } finally {
    updatingUserId.value = null
  }
}

function handleStatusChange(student: any, event: Event) {
  const target = event.target as HTMLSelectElement
  updateUserStatus(student, target.value as UserStatus)
}

function clearFilters() {
  searchQuery.value = ''
  activeStatus.value = 'ALL'
}

function countByStatus(status: UserStatus) {
  return students.value.filter((student) => normalizeStatus(student.status) === status).length
}

function normalizeStatus(status?: string) {
  return (status || 'ACTIVE').toUpperCase()
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    ACTIVE: 'Đang hoạt động',
    INACTIVE: 'Tạm khóa',
    BANNED: 'Bị cấm'
  }
  return labels[normalizeStatus(status)] || 'Chưa cập nhật'
}

function statusClass(status?: string) {
  const classes: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    INACTIVE: 'bg-amber-50 text-amber-700',
    BANNED: 'bg-rose-50 text-rose-700'
  }
  return classes[normalizeStatus(status)] || 'bg-slate-50 text-slate-600'
}

function getStudentName(student: any) {
  return student?.student_profile?.name || student?.email?.split('@')[0] || 'Học viên'
}

function getInitial(student: any) {
  return getStudentName(student).charAt(0).toUpperCase()
}

function getSkills(student: any) {
  const skills = student?.student_profile?.skills
  if (!Array.isArray(skills)) return []
  return skills.map((skill: any) => skill?.name || skill?.title || skill).filter(Boolean)
}

function detailItems(student: any) {
  return [
    { label: 'Họ tên', value: getStudentName(student) },
    { label: 'Email', value: student.email || 'Chưa cập nhật' },
    { label: 'Số điện thoại', value: student?.student_profile?.phone || 'Chưa cập nhật' },
    { label: 'Kỹ năng', value: getSkills(student).join(', ') || 'Chưa cập nhật' },
    { label: 'CV', value: student?.student_profile?.cv_url || 'Chưa cập nhật' },
    { label: 'Trạng thái', value: statusLabel(student.status) },
    { label: 'Ngày tạo', value: formatDate(student.created_at) },
    { label: 'Cập nhật lần cuối', value: formatDate(student.updated_at) }
  ]
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

onMounted(fetchStudents)
</script>
