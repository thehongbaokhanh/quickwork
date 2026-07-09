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

          <select v-model="activeRole" class="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="STUDENT">Học viên</option>
            <option value="ENTERPRISE">Doanh nghiệp</option>
          </select>

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
              <tr v-for="(user, index) in visibleUsers" :key="user.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4 font-black text-slate-400">{{ index + 1 }}</td>
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
    </section>

    <div v-if="selectedUser" class="qw-detail-backdrop" @click.self="selectedUser = null">
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
          <button class="qw-detail-close" type="button" @click="selectedUser = null">
            <Icon name="uil:times" class="h-5 w-5" />
          </button>
        </header>

        <div class="qw-detail-body">
          <div class="qw-detail-grid">
            <div v-for="item in detailItems(selectedUser)" :key="item.label" class="qw-detail-item">
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
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin'
})

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'

const toast = useToast()
const authStore = useAuthStore()
const users = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const activeRole = ref('ALL')
const activeStatus = ref('ALL')
const selectedUser = ref<any | null>(null)
const updatingUserId = ref<number | null>(null)

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
    iconClass: 'bg-emerald-50 text-emerald-700'
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
  const query = searchQuery.value.trim().toLowerCase()
  return users.value.filter((user) => {
    const matchesRole = activeRole.value === 'ALL' || user.role === activeRole.value
    const matchesStatus = activeStatus.value === 'ALL' || normalizeStatus(user.status) === activeStatus.value
    const searchable = [
      user.email,
      getDisplayName(user),
      user?.student_profile?.phone,
      user?.enterprise_profile?.tax_code,
      roleLabel(user.role),
      statusLabel(user.status)
    ].filter(Boolean).join(' ').toLowerCase()

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
    STUDENT: 'bg-indigo-50 text-indigo-700',
    ENTERPRISE: 'bg-sky-50 text-sky-700'
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
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    INACTIVE: 'bg-amber-50 text-amber-700',
    BANNED: 'bg-rose-50 text-rose-700'
  }
  return classes[normalizeStatus(status)] || 'bg-slate-50 text-slate-600'
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
