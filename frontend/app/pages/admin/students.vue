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

    <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-base font-black text-slate-950">Tình trạng hồ sơ</h2>
          <p class="mt-1 text-xs font-medium text-slate-500">Tính từ dữ liệu học viên đang tải.</p>
        </div>
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
          <Icon name="uil:chart-pie" class="h-5 w-5" />
        </span>
      </div>

      <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="item in profileBars" :key="item.label" class="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="truncate text-sm font-bold text-slate-700">{{ item.label }}</span>
            <span class="shrink-0 text-lg font-black text-slate-950">{{ item.value }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-white">
            <div :class="['h-full rounded-full', item.className]" :style="{ width: `${item.percent}%` }" />
          </div>
          <p class="mt-2 text-xs font-semibold text-slate-500">{{ item.percent }}% tổng học viên</p>
        </article>
      </div>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white shadow-sm">
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

          <ScrollSelect
            v-model="activeStatus"
            :options="statusFilterOptions"
            ariaLabel="Lọc học viên theo trạng thái"
            icon="uil:check-circle"
            size="filter"
            tone="sky"
          />

          <button class="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50" type="button" @click="clearFilters">
            <Icon name="uil:filter-slash" class="h-4 w-4" />
            Xóa lọc
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1120px] text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th class="whitespace-nowrap px-5 py-3">STT</th>
                <th class="whitespace-nowrap px-5 py-3">Học viên</th>
                <th class="whitespace-nowrap px-5 py-3">Liên hệ</th>
                <th class="whitespace-nowrap px-5 py-3">Kỹ năng</th>
                <th class="whitespace-nowrap px-5 py-3">CV</th>
                <th class="whitespace-nowrap px-5 py-3">Trạng thái</th>
                <th class="whitespace-nowrap px-5 py-3 text-right">Thao tác</th>
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
              <tr v-for="(student, index) in paginatedStudents" :key="student.id" class="transition hover:bg-slate-50/80">
                  <td class="whitespace-nowrap px-5 py-4 font-black text-slate-400">{{ studentsPageOffset + index + 1 }}</td>
                  <td class="px-5 py-4">
                    <div class="flex max-w-[260px] items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sky-50 text-sm font-black text-sky-700">
                        <img v-if="student.student_profile?.avatar" :src="student.student_profile.avatar" alt="" class="h-full w-full object-cover">
                        <span v-else>{{ getInitial(student) }}</span>
                      </div>
                      <div class="min-w-0">
                        <p class="truncate font-black text-slate-950" :title="getStudentName(student)">{{ getStudentName(student) }}</p>
                        <p class="truncate text-xs font-medium text-slate-500">{{ student.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="max-w-[160px] whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                    <span class="block truncate" :title="student.student_profile?.phone || 'Chưa cập nhật'">{{ student.student_profile?.phone || 'Chưa cập nhật' }}</span>
                  </td>
                  <td class="whitespace-nowrap px-5 py-4">
                    <div class="group relative inline-flex">
                      <button
                        type="button"
                        :class="[
                          'inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                          hasStudentSkills(student)
                            ? 'border-sky-100 bg-sky-50 text-sky-700 hover:border-sky-200 hover:bg-sky-100'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        ]"
                        :aria-label="studentSkillsTooltip(student)"
                      >
                        <Icon :name="hasStudentSkills(student) ? 'uil:check-circle' : 'uil:info-circle'" class="h-4 w-4" />
                        {{ hasStudentSkills(student) ? 'Đã cập nhật' : 'Chưa cập nhật' }}
                      </button>
                      <div class="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold leading-5 text-slate-600 opacity-0 shadow-2xl shadow-slate-200/80 ring-1 ring-slate-950/5 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <p class="font-black text-slate-950">{{ hasStudentSkills(student) ? 'Kỹ năng đã cập nhật' : 'Thông tin kỹ năng' }}</p>
                        <div v-if="hasStudentSkills(student)" class="mt-2 flex flex-wrap gap-1.5">
                          <span v-for="skill in getSkills(student)" :key="skill" class="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">
                            {{ skill }}
                          </span>
                        </div>
                        <p v-else class="mt-2 text-slate-500">Học viên này chưa cập nhật kỹ năng.</p>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-5 py-4">
                    <a v-if="student.student_profile?.cv_url" :href="student.student_profile.cv_url" target="_blank" class="qw-chip bg-sky-50 text-sky-700 hover:bg-sky-100">
                      <Icon name="uil:file-download" class="h-4 w-4" />
                      Xem CV
                    </a>
                      <span v-else class="text-xs font-semibold text-slate-400">Chưa có</span>
                  </td>
                  <td class="whitespace-nowrap px-5 py-4">
                    <span :class="['qw-chip', statusClass(student.status)]">
                      {{ statusLabel(student.status) }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-5 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <button class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50" type="button" title="Xem chi tiết" @click="openStudentDetail(student)">
                        <Icon name="uil:eye" class="h-4 w-4" />
                      </button>
                      <ScrollSelect
                        class="w-28"
                        :disabled="updatingUserId === student.id"
                        :model-value="normalizeStatus(student.status)"
                        :options="statusActionOptions"
                        :ariaLabel="`Thay đổi trạng thái ${getStudentName(student)}`"
                        size="action"
                        tone="slate"
                        @update:model-value="handleStatusChange(student, $event)"
                      />
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <AdminTablePagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredStudents.length"
          item-label="học viên"
        />
    </section>

    <div v-if="selectedStudent" class="qw-detail-backdrop" @click.self="closeStudentDetail">
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
                <span class="qw-chip qw-chip--compact bg-sky-50 text-sky-700">Học viên</span>
                <span :class="['qw-chip', statusClass(selectedStudent.status)]">{{ statusLabel(selectedStudent.status) }}</span>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <button
              v-if="!isEditingStudent"
              class="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-black text-sky-700 transition hover:bg-sky-100"
              type="button"
              @click="startEditStudent(selectedStudent)"
            >
              <Icon name="uil:edit" class="h-4 w-4" />
              Chỉnh sửa
            </button>
            <button class="qw-detail-close" type="button" @click="closeStudentDetail">
              <Icon name="uil:times" class="h-5 w-5" />
            </button>
          </div>
        </header>
        <div class="qw-detail-body">
          <form v-if="isEditingStudent" class="space-y-4" @submit.prevent="saveSelectedStudent">
            <div class="grid gap-3 md:grid-cols-2">
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Email</span>
                <input v-model.trim="editStudentForm.email" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="email">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Trạng thái</span>
                <select v-model="editStudentForm.status" class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm khóa</option>
                  <option value="BANNED">Bị cấm</option>
                </select>
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Họ tên</span>
                <input v-model.trim="editStudentForm.student_profile.name" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Số điện thoại</span>
                <input v-model.trim="editStudentForm.student_profile.phone" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Avatar URL</span>
                <input v-model.trim="editStudentForm.student_profile.avatar" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">CV URL</span>
                <input v-model.trim="editStudentForm.student_profile.cv_url" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
              </label>
            </div>
          </form>
          <div v-else class="qw-detail-grid">
            <div v-for="item in detailItems(selectedStudent)" :key="item.label" class="qw-detail-item">
              <p class="qw-detail-label">{{ item.label }}</p>
              <p class="qw-detail-value">{{ item.value }}</p>
            </div>
          </div>
        </div>
        <footer v-if="isEditingStudent" class="qw-detail-footer">
          <button type="button" class="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50" @click="cancelEditStudent">
            Hủy
          </button>
          <button type="button" class="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" :disabled="savingStudent" @click="saveSelectedStudent">
            <Icon name="uil:save" class="h-4 w-4" />
            {{ savingStudent ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AdminTablePagination from '~/components/admin/AdminTablePagination.vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'
import { AdminService } from '~/services/admin.service'
import { useToast } from '~/composables/useToast'
import { buildSearchText, normalizeSearchText } from '~/utils/searchText'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'

const toast = useToast()
const students = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const activeStatus = ref('ALL')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedStudent = ref<any | null>(null)
const updatingUserId = ref<number | null>(null)
const isEditingStudent = ref(false)
const savingStudent = ref(false)
const editStudentForm = reactive({
  email: '',
  status: 'ACTIVE' as UserStatus,
  student_profile: {
    name: '',
    phone: '',
    avatar: '',
    cv_url: ''
  }
})

const statusFilterOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Tạm khóa' },
  { value: 'BANNED', label: 'Bị cấm' }
]

const statusActionOptions = [
  { value: 'ACTIVE', label: 'Kích hoạt' },
  { value: 'INACTIVE', label: 'Tạm khóa' },
  { value: 'BANNED', label: 'Cấm' }
]

const summaryCards = computed(() => [
  {
    label: 'Tổng học viên',
    value: students.value.length,
    helper: 'Tài khoản role STUDENT',
    icon: 'uil:graduation-cap',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    label: 'Đang hoạt động',
    value: countByStatus('ACTIVE'),
    helper: 'Có thể đăng nhập',
    icon: 'uil:check-circle',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    label: 'Có số điện thoại',
    value: students.value.filter((student) => Boolean(student?.student_profile?.phone)).length,
    helper: 'Đã cập nhật liên hệ',
    icon: 'uil:phone',
    iconClass: 'bg-teal-50 text-teal-700'
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
  const query = normalizeSearchText(searchQuery.value)
  return students.value.filter((student) => {
    const matchesStatus = activeStatus.value === 'ALL' || normalizeStatus(student.status) === activeStatus.value
    const searchable = buildSearchText([
      getStudentName(student),
      student.email,
      student?.student_profile?.phone,
      statusLabel(student.status),
      ...getSkills(student)
    ])

    return matchesStatus && (!query || searchable.includes(query))
  })
})

const studentsPageOffset = computed(() => (currentPage.value - 1) * Number(pageSize.value))

const paginatedStudents = computed(() => {
  const size = Number(pageSize.value)
  return filteredStudents.value.slice(studentsPageOffset.value, studentsPageOffset.value + size)
})

watch([searchQuery, activeStatus], () => {
  currentPage.value = 1
})

watch([filteredStudents, pageSize], () => {
  const totalPages = Math.max(1, Math.ceil(filteredStudents.value.length / Number(pageSize.value)))
  if (currentPage.value > totalPages) currentPage.value = totalPages
})

const profileBars = computed(() => {
  const total = Math.max(students.value.length, 1)
  return [
    {
      label: 'Có hồ sơ học viên',
      value: students.value.filter((student) => Boolean(student?.student_profile)).length,
      className: 'bg-sky-500'
    },
    {
      label: 'Có số điện thoại',
      value: students.value.filter((student) => Boolean(student?.student_profile?.phone)).length,
      className: 'bg-teal-500'
    },
    {
      label: 'Có kỹ năng',
      value: students.value.filter((student) => getSkills(student).length > 0).length,
      className: 'bg-sky-500'
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

function handleStatusChange(student: any, status: string | number) {
  updateUserStatus(student, String(status) as UserStatus)
}

function clearFilters() {
  searchQuery.value = ''
  activeStatus.value = 'ALL'
}

function openStudentDetail(student: any) {
  selectedStudent.value = student
  cancelEditStudent()
}

function closeStudentDetail() {
  selectedStudent.value = null
  cancelEditStudent()
}

function startEditStudent(student: any) {
  editStudentForm.email = student.email || ''
  editStudentForm.status = normalizeStatus(student.status) as UserStatus
  editStudentForm.student_profile.name = student?.student_profile?.name || ''
  editStudentForm.student_profile.phone = student?.student_profile?.phone || ''
  editStudentForm.student_profile.avatar = student?.student_profile?.avatar || ''
  editStudentForm.student_profile.cv_url = student?.student_profile?.cv_url || ''
  isEditingStudent.value = true
}

function cancelEditStudent() {
  isEditingStudent.value = false
  savingStudent.value = false
}

function replaceStudent(updatedStudent: any) {
  const index = students.value.findIndex((student) => String(student.id) === String(updatedStudent.id))
  if (index >= 0) {
    students.value.splice(index, 1, updatedStudent)
  }
}

async function saveSelectedStudent() {
  if (!selectedStudent.value) return
  try {
    savingStudent.value = true
    const response: any = await AdminService.updateUser(selectedStudent.value.id, {
      email: editStudentForm.email,
      status: editStudentForm.status,
      student_profile: { ...editStudentForm.student_profile }
    })
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể lưu thông tin học viên.')
    }
    replaceStudent(response.data)
    selectedStudent.value = response.data
    isEditingStudent.value = false
    toast.success('Đã lưu học viên', `${getStudentName(response.data)} đã được cập nhật.`)
  } catch (error: any) {
    toast.error('Lưu thất bại', error?.data?.message || error?.message || 'Vui lòng kiểm tra lại dữ liệu.')
  } finally {
    savingStudent.value = false
  }
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
    ACTIVE: 'bg-sky-50 text-sky-700',
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

function hasStudentSkills(student: any) {
  return getSkills(student).length > 0
}

function studentSkillsTooltip(student: any) {
  const skills = getSkills(student)
  return skills.length > 0 ? `Kỹ năng: ${skills.join(', ')}` : 'Học viên này chưa cập nhật kỹ năng.'
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
