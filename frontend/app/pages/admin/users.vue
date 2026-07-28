<template>
  <div class="space-y-5">
    <section class="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm lg:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-black text-white">
            <Icon name="uil:users-alt" class="h-4 w-4" />
            Dữ liệu người dùng
          </div>
          <h1 class="mt-4 text-2xl font-black lg:text-3xl">Quản lý người dùng</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Theo dõi tài khoản Admin, Học viên và Doanh nghiệp, kiểm tra hồ sơ liên kết và xử lý trạng thái đăng nhập.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isLoading"
          @click="fetchUsers"
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

    <section class="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="space-y-4 border-b border-slate-100 p-4 lg:p-5">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <label class="relative block">
            <Icon name="uil:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              class="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              placeholder="Tìm theo tên, email, số điện thoại, công ty..."
              type="search"
            >
          </label>

          <ScrollSelect
            v-model="activeRole"
            :options="roleFilterOptions"
            ariaLabel="Lọc người dùng theo vai trò"
            icon="uil:users-alt"
            size="filter"
            tone="slate"
          />

          <ScrollSelect
            v-model="activeStatus"
            :options="statusFilterOptions"
            ariaLabel="Lọc người dùng theo trạng thái"
            icon="uil:check-circle"
            size="filter"
            tone="sky"
          />

          <button class="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50" type="button" @click="clearFilters">
            <Icon name="uil:filter-slash" class="h-4 w-4" />
            Xóa lọc
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="role in roleQuickFilters"
            :key="role.value"
            :class="[
              'inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-black transition',
              activeRole === role.value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            ]"
            type="button"
            @click="activeRole = role.value"
          >
            {{ role.label }}
            <span :class="activeRole === role.value ? 'text-white/80' : 'text-slate-400'">{{ role.count }}</span>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th class="px-5 py-3">STT</th>
              <th class="px-5 py-3">Người dùng</th>
              <th class="px-5 py-3">Loại tài khoản</th>
              <th class="px-5 py-3">Trạng thái</th>
              <th class="px-5 py-3">Hồ sơ liên kết</th>
              <th class="px-5 py-3">Ngày tạo</th>
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
            <tr v-else-if="visibleUsers.length === 0">
              <td colspan="7" class="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                Không có tài khoản phù hợp với bộ lọc hiện tại.
              </td>
            </tr>
            <template v-else>
              <tr v-for="(user, index) in paginatedUsers" :key="user.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4 font-black text-slate-400">{{ usersPageOffset + index + 1 }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-black text-slate-600">
                      {{ getInitial(user) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-black text-slate-950">{{ getDisplayName(user) }}</p>
                      <p class="truncate text-xs font-medium text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip qw-chip--compact', roleClass(user.role)]">
                    {{ roleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip', statusClass(user.status)]">
                    {{ statusLabel(user.status) }}
                  </span>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-600">{{ profileSummary(user) }}</td>
                <td class="px-5 py-4 font-semibold text-slate-500">{{ formatDate(user.created_at) }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50" type="button" title="Xem chi tiết" @click="openDetail(user)">
                      <Icon name="uil:eye" class="h-4 w-4" />
                    </button>
                    <span v-if="isAdminUser(user)" class="inline-flex h-9 items-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-black text-rose-700">
                      Được bảo vệ
                    </span>
                    <select
                      v-else
                      class="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="updatingUserId === user.id"
                      :value="normalizeStatus(user.status)"
                      @change="handleStatusChange(user, $event)"
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
      <AdminTablePagination
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :total="visibleUsers.length"
        item-label="tài khoản"
      />
    </section>

    <div v-if="selectedUser" class="qw-detail-backdrop" @click.self="closeDetail">
      <section class="qw-detail-panel">
        <header class="qw-detail-header">
          <div class="qw-detail-identity">
            <div class="qw-detail-avatar">{{ getInitial(selectedUser) }}</div>
            <div class="min-w-0">
              <p class="qw-detail-eyebrow">Chi tiết tài khoản</p>
              <h2 class="qw-detail-title">{{ getDisplayName(selectedUser) }}</h2>
              <p class="qw-detail-subtitle">{{ selectedUser.email }}</p>
              <div class="qw-detail-badges">
                <span :class="['qw-chip qw-chip--compact', roleClass(selectedUser.role)]">{{ roleLabel(selectedUser.role) }}</span>
                <span :class="['qw-chip', statusClass(selectedUser.status)]">{{ statusLabel(selectedUser.status) }}</span>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <button
              v-if="!isEditingUser && !isAdminUser(selectedUser)"
              class="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-black text-sky-700 transition hover:bg-sky-100"
              type="button"
              @click="startEditUser(selectedUser)"
            >
              <Icon name="uil:edit" class="h-4 w-4" />
              Chỉnh sửa
            </button>
            <button class="qw-detail-close" type="button" @click="closeDetail">
              <Icon name="uil:times" class="h-5 w-5" />
            </button>
          </div>
        </header>

        <div class="qw-detail-body">
          <form v-if="isEditingUser" class="space-y-4" @submit.prevent="saveSelectedUser">
            <div class="grid gap-3 md:grid-cols-2">
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Email</span>
                <input v-model.trim="editUserForm.email" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="email">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Trạng thái</span>
                <select v-model="editUserForm.status" class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm khóa</option>
                  <option value="BANNED">Bị cấm</option>
                </select>
              </label>

              <template v-if="selectedUser.role === 'STUDENT'">
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">Họ tên</span>
                  <input v-model.trim="editUserForm.student_profile.name" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
                </label>
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">Số điện thoại</span>
                  <input v-model.trim="editUserForm.student_profile.phone" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
                </label>
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">Avatar URL</span>
                  <input v-model.trim="editUserForm.student_profile.avatar" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
                </label>
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">CV URL</span>
                  <input v-model.trim="editUserForm.student_profile.cv_url" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
                </label>
              </template>

              <template v-if="selectedUser.role === 'ENTERPRISE'">
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">Tên doanh nghiệp</span>
                  <input v-model.trim="editUserForm.enterprise_profile.company_name" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
                </label>
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">Mã số thuế</span>
                  <input v-model.trim="editUserForm.enterprise_profile.tax_code" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
                </label>
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">GPKD URL</span>
                  <input v-model.trim="editUserForm.enterprise_profile.gpkd_url" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
                </label>
                <label class="space-y-1.5">
                  <span class="text-xs font-black uppercase text-slate-500">KYB</span>
                  <select v-model="editUserForm.enterprise_profile.kyb_status" class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
                    <option value="PENDING">Chờ xác minh</option>
                    <option value="APPROVED">Đã xác minh</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </label>
              </template>
            </div>
          </form>

          <div v-else class="qw-detail-grid">
            <div v-for="item in detailItems(selectedUser)" :key="item.label" class="qw-detail-item">
              <p class="qw-detail-label">{{ item.label }}</p>
              <p class="qw-detail-value">{{ item.value }}</p>
            </div>
          </div>
        </div>

        <footer v-if="isEditingUser" class="qw-detail-footer">
          <button type="button" class="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50" @click="cancelEditUser">
            Hủy
          </button>
          <button type="button" class="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" :disabled="savingUser" @click="saveSelectedUser">
            <Icon name="uil:save" class="h-4 w-4" />
            {{ savingUser ? 'Đang lưu...' : 'Lưu thay đổi' }}
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
import { useAuthStore } from '~/stores/auth'
import { buildSearchText, normalizeSearchText } from '~/utils/searchText'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'
type KYBStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

const toast = useToast()
const authStore = useAuthStore()
const users = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const activeRole = ref('ALL')
const activeStatus = ref('ALL')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedUser = ref<any | null>(null)
const updatingUserId = ref<number | null>(null)
const isEditingUser = ref(false)
const savingUser = ref(false)
const editUserForm = reactive({
  email: '',
  status: 'ACTIVE' as UserStatus,
  student_profile: {
    name: '',
    phone: '',
    avatar: '',
    cv_url: ''
  },
  enterprise_profile: {
    company_name: '',
    tax_code: '',
    gpkd_url: '',
    kyb_status: 'PENDING' as KYBStatus
  }
})

const roleFilterOptions = [
  { value: 'ALL', label: 'Tất cả vai trò' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'STUDENT', label: 'Học viên' },
  { value: 'ENTERPRISE', label: 'Doanh nghiệp' }
]

const statusFilterOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Tạm khóa' },
  { value: 'BANNED', label: 'Bị cấm' }
]

const summaryCards = computed(() => [
  {
    label: 'Tổng tài khoản',
    value: users.value.length,
    helper: 'Tất cả tài khoản trong DB',
    icon: 'uil:users-alt',
    iconClass: 'bg-slate-100 text-slate-700'
  },
  {
    label: 'Đang hoạt động',
    value: countByStatus('ACTIVE'),
    helper: 'Có thể đăng nhập',
    icon: 'uil:check-circle',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    label: 'Tạm khóa',
    value: countByStatus('INACTIVE'),
    helper: 'Đang bị vô hiệu hóa',
    icon: 'uil:pause-circle',
    iconClass: 'bg-amber-50 text-amber-700'
  },
  {
    label: 'Bị cấm',
    value: countByStatus('BANNED'),
    helper: 'Không được truy cập',
    icon: 'uil:ban',
    iconClass: 'bg-rose-50 text-rose-700'
  }
])

const roleQuickFilters = computed(() => [
  { value: 'ALL', label: 'Tất cả', count: users.value.length },
  { value: 'ADMIN', label: 'Admin', count: countByRole('ADMIN') },
  { value: 'STUDENT', label: 'Học viên', count: countByRole('STUDENT') },
  { value: 'ENTERPRISE', label: 'Doanh nghiệp', count: countByRole('ENTERPRISE') }
])

const filteredUsers = computed(() => {
  const query = normalizeSearchText(searchQuery.value)
  return users.value.filter((user) => {
    const matchesRole = activeRole.value === 'ALL' || user.role === activeRole.value
    const matchesStatus = activeStatus.value === 'ALL' || normalizeStatus(user.status) === activeStatus.value
    const searchable = buildSearchText([
      user.email,
      getDisplayName(user),
      user?.student_profile?.phone,
      user?.enterprise_profile?.tax_code,
      roleLabel(user.role),
      statusLabel(user.status)
    ])
    return matchesRole && matchesStatus && (!query || searchable.includes(query))
  })
})

const visibleUsers = computed(() => {
  return [...filteredUsers.value].sort((a, b) => {
    const rankDiff = adminDisplayRank(a) - adminDisplayRank(b)
    if (rankDiff !== 0) return rankDiff
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })
})

const usersPageOffset = computed(() => (currentPage.value - 1) * Number(pageSize.value))

const paginatedUsers = computed(() => {
  const size = Number(pageSize.value)
  return visibleUsers.value.slice(usersPageOffset.value, usersPageOffset.value + size)
})

watch([searchQuery, activeRole, activeStatus], () => {
  currentPage.value = 1
})

watch([visibleUsers, pageSize], () => {
  const totalPages = Math.max(1, Math.ceil(visibleUsers.value.length / Number(pageSize.value)))
  if (currentPage.value > totalPages) currentPage.value = totalPages
})

async function fetchUsers() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const response: any = await AdminService.getUsers()
    users.value = response?.success && Array.isArray(response.data) ? response.data : []
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách người dùng.'
    users.value = []
  } finally {
    isLoading.value = false
  }
}

async function updateUserStatus(user: any, status: UserStatus) {
  if (isAdminUser(user)) {
    toast.info('Tài khoản admin được bảo vệ', 'Không thể thay đổi trạng thái tài khoản admin.')
    return
  }
  if (normalizeStatus(user.status) === status) return
  try {
    updatingUserId.value = user.id
    const response: any = await AdminService.updateUserStatus(user.id, status)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật trạng thái.')
    }
    toast.success('Đã cập nhật tài khoản', `${getDisplayName(user)} chuyển sang ${statusLabel(status)}.`)
    await fetchUsers()
  } catch (error: any) {
    toast.error('Cập nhật thất bại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
    await fetchUsers()
  } finally {
    updatingUserId.value = null
  }
}

function handleStatusChange(user: any, event: Event) {
  const target = event.target as HTMLSelectElement
  updateUserStatus(user, target.value as UserStatus)
}

function clearFilters() {
  searchQuery.value = ''
  activeRole.value = 'ALL'
  activeStatus.value = 'ALL'
}

function openDetail(user: any) {
  selectedUser.value = user
  cancelEditUser()
}

function closeDetail() {
  selectedUser.value = null
  cancelEditUser()
}

function startEditUser(user: any) {
  if (isAdminUser(user)) {
    toast.info('Tài khoản admin được bảo vệ', 'Không thể chỉnh sửa tài khoản quản trị tại đây.')
    return
  }

  editUserForm.email = user.email || ''
  editUserForm.status = normalizeStatus(user.status) as UserStatus
  editUserForm.student_profile.name = user?.student_profile?.name || ''
  editUserForm.student_profile.phone = user?.student_profile?.phone || ''
  editUserForm.student_profile.avatar = user?.student_profile?.avatar || ''
  editUserForm.student_profile.cv_url = user?.student_profile?.cv_url || ''
  editUserForm.enterprise_profile.company_name = user?.enterprise_profile?.company_name || ''
  editUserForm.enterprise_profile.tax_code = user?.enterprise_profile?.tax_code || ''
  editUserForm.enterprise_profile.gpkd_url = user?.enterprise_profile?.gpkd_url || ''
  editUserForm.enterprise_profile.kyb_status = getKYBStatus(user) as KYBStatus
  isEditingUser.value = true
}

function cancelEditUser() {
  isEditingUser.value = false
  savingUser.value = false
}

function buildUpdatePayload(user: any) {
  const payload: Record<string, any> = {
    email: editUserForm.email,
    status: editUserForm.status
  }

  if (user.role === 'STUDENT') {
    payload.student_profile = { ...editUserForm.student_profile }
  }
  if (user.role === 'ENTERPRISE') {
    payload.enterprise_profile = { ...editUserForm.enterprise_profile }
  }

  return payload
}

function replaceUser(updatedUser: any) {
  const index = users.value.findIndex((user) => String(user.id) === String(updatedUser.id))
  if (index >= 0) {
    users.value.splice(index, 1, updatedUser)
  }
}

async function saveSelectedUser() {
  if (!selectedUser.value) return
  try {
    savingUser.value = true
    const response: any = await AdminService.updateUser(selectedUser.value.id, buildUpdatePayload(selectedUser.value))
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể lưu thông tin tài khoản.')
    }
    replaceUser(response.data)
    selectedUser.value = response.data
    isEditingUser.value = false
    toast.success('Đã lưu thông tin', `${getDisplayName(response.data)} đã được cập nhật.`)
  } catch (error: any) {
    toast.error('Lưu thất bại', error?.data?.message || error?.message || 'Vui lòng kiểm tra lại dữ liệu.')
  } finally {
    savingUser.value = false
  }
}

function isAdminUser(user: any) {
  return user?.role === 'ADMIN'
}

function isCurrentAdminUser(user: any) {
  return isAdminUser(user) && String(user?.id) === String(authStore.user?.id)
}

function adminDisplayRank(user: any) {
  if (isCurrentAdminUser(user)) return 0
  if (isAdminUser(user)) return 1
  return 2
}

function countByRole(role: string) {
  return users.value.filter((user) => user.role === role).length
}

function countByStatus(status: UserStatus) {
  return users.value.filter((user) => normalizeStatus(user.status) === status).length
}

function normalizeStatus(status?: string) {
  return (status || 'ACTIVE').toUpperCase()
}

function roleLabel(role?: string) {
  const labels: Record<string, string> = {
    ADMIN: 'Admin',
    STUDENT: 'Học viên',
    ENTERPRISE: 'Doanh nghiệp'
  }
  return role ? labels[role] || role : 'Chưa phân quyền'
}

function roleClass(role?: string) {
  const classes: Record<string, string> = {
    ADMIN: 'bg-rose-50 text-rose-700',
    STUDENT: 'bg-sky-50 text-sky-700',
    ENTERPRISE: 'bg-teal-50 text-teal-700'
  }
  return role ? classes[role] || 'bg-slate-50 text-slate-600' : 'bg-slate-50 text-slate-600'
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

function getKYBStatus(user: any): KYBStatus {
  const value = (user?.enterprise_profile?.kyb_status || user?.enterprise_profile?.status_kyb || 'PENDING').toUpperCase()
  if (value === 'APPROVED' || value === 'REJECTED') return value
  return 'PENDING'
}

function getDisplayName(user: any) {
  return user?.student_profile?.name || user?.enterprise_profile?.company_name || user?.email?.split('@')[0] || 'Người dùng'
}

function getInitial(user: any) {
  return getDisplayName(user).charAt(0).toUpperCase()
}

function profileSummary(user: any) {
  if (user?.role === 'STUDENT') return user?.student_profile ? 'Hồ sơ học viên' : 'Chưa có hồ sơ học viên'
  if (user?.role === 'ENTERPRISE') return user?.enterprise_profile ? 'Hồ sơ doanh nghiệp' : 'Chưa có hồ sơ doanh nghiệp'
  return 'Tài khoản quản trị'
}

function detailItems(user: any) {
  return [
    { label: 'Loại tài khoản', value: roleLabel(user.role) },
    { label: 'Trạng thái', value: statusLabel(user.status) },
    { label: 'Email', value: user.email || 'Chưa cập nhật' },
    { label: 'Hồ sơ', value: profileSummary(user) },
    { label: 'Số điện thoại', value: user?.student_profile?.phone || 'Chưa cập nhật' },
    { label: 'Mã số thuế', value: user?.enterprise_profile?.tax_code || 'Không áp dụng' },
    { label: 'Ngày tạo', value: formatDate(user.created_at) },
    { label: 'Cập nhật lần cuối', value: formatDate(user.updated_at) }
  ]
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

onMounted(fetchUsers)
</script>
