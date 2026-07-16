<template>
  <div class="space-y-5">
    <section class="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm lg:p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-black text-white">
            <Icon name="uil:building" class="h-4 w-4" />
            Hồ sơ doanh nghiệp
          </div>
          <h1 class="mt-4 text-2xl font-black lg:text-3xl">Quản lý doanh nghiệp</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Kiểm tra hồ sơ công ty, mã số thuế, trạng thái xác minh KYB và hoạt động đăng tin của tài khoản nhà tuyển dụng.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isLoading"
          @click="fetchEnterprises"
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
      <div class="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(0,1fr)_170px_170px_auto] lg:p-5">
        <label class="relative block">
          <Icon name="uil:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            class="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            placeholder="Tìm theo công ty, email, mã số thuế..."
            type="search"
          >
        </label>

        <select v-model="activeKYB" class="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
          <option value="ALL">Tất cả KYB</option>
          <option value="APPROVED">Đã xác minh</option>
          <option value="PENDING">Chờ xác minh</option>
          <option value="REJECTED">Từ chối</option>
        </select>

        <select v-model="activeStatus" class="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
          <option value="ALL">Tất cả tài khoản</option>
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
        <table class="w-full min-w-[1080px] text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th class="px-5 py-3">STT</th>
              <th class="px-5 py-3">Doanh nghiệp</th>
              <th class="px-5 py-3">Mã số thuế</th>
              <th class="px-5 py-3">KYB</th>
              <th class="px-5 py-3">Tài khoản</th>
              <th class="px-5 py-3">Tin tuyển dụng</th>
              <th class="px-5 py-3">Ngày tạo</th>
              <th class="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="isLoading">
              <td colspan="8" class="px-5 py-8">
                <div class="space-y-3">
                  <div v-for="index in 5" :key="index" class="h-12 animate-pulse rounded-md bg-slate-100" />
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredEnterprises.length === 0">
              <td colspan="8" class="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                Không có doanh nghiệp phù hợp với dữ liệu hiện tại.
              </td>
            </tr>
            <template v-else>
              <tr v-for="(enterprise, index) in filteredEnterprises" :key="enterprise.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4 font-black text-slate-400">{{ index + 1 }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-sm font-black text-teal-700">
                      {{ getInitial(enterprise) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-black text-slate-950">{{ getCompanyName(enterprise) }}</p>
                      <p class="truncate text-xs font-medium text-slate-500">{{ enterprise.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-600">{{ enterprise.enterprise_profile?.tax_code || 'Chưa cập nhật' }}</td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip', kybClass(getKYBStatus(enterprise))]">
                    {{ kybLabel(getKYBStatus(enterprise)) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip', statusClass(enterprise.status)]">
                    {{ statusLabel(enterprise.status) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex min-w-[220px] items-center gap-2 whitespace-nowrap text-xs font-semibold text-slate-500">
                    <span class="rounded-full bg-sky-50 px-2.5 py-1 text-sm font-black text-sky-700">{{ getJobCount(enterprise.id).total }} tin</span>
                    <span class="sr-only">Chi tiết tin tuyển dụng</span>
                    {{ getJobCount(enterprise.id).approved }} đã duyệt · {{ getJobCount(enterprise.id).pending }} chờ duyệt
                  </div>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-500">{{ formatDate(enterprise.created_at) }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50" type="button" title="Xem chi tiết" @click="selectedEnterprise = enterprise">
                      <Icon name="uil:eye" class="h-4 w-4" />
                    </button>
                    <button
                      v-if="!hasBusinessLicense(enterprise)"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      title="Yêu cầu nộp giấy phép kinh doanh"
                      :disabled="requestingGPKDId === enterprise.id"
                      @click="requestGPKD(enterprise)"
                    >
                      <Icon name="uil:file-upload-alt" class="h-4 w-4" />
                    </button>
                    <select
                      class="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="updatingKYBId === enterprise.id"
                      :value="getKYBStatus(enterprise)"
                      @change="handleKYBChange(enterprise, $event)"
                    >
                      <option value="PENDING">Chờ KYB</option>
                      <option value="APPROVED">Duyệt KYB</option>
                      <option value="REJECTED">Từ chối KYB</option>
                    </select>
                    <select
                      class="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="updatingUserId === enterprise.id"
                      :value="normalizeStatus(enterprise.status)"
                      @change="handleStatusChange(enterprise, $event)"
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

    <div v-if="selectedEnterprise" class="qw-detail-backdrop" @click.self="closeEnterpriseDetail">
      <section class="qw-detail-panel">
        <header class="qw-detail-header">
          <div class="qw-detail-identity">
            <div class="qw-detail-avatar">{{ getInitial(selectedEnterprise) }}</div>
            <div class="min-w-0">
              <p class="qw-detail-eyebrow">Chi tiết doanh nghiệp</p>
              <h2 class="qw-detail-title">{{ getCompanyName(selectedEnterprise) }}</h2>
              <p class="qw-detail-subtitle">{{ selectedEnterprise.email }}</p>
              <div class="qw-detail-badges">
                <span :class="['qw-chip', kybClass(getKYBStatus(selectedEnterprise))]">{{ kybLabel(getKYBStatus(selectedEnterprise)) }}</span>
                <span :class="['qw-chip', statusClass(selectedEnterprise.status)]">{{ statusLabel(selectedEnterprise.status) }}</span>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <button
              v-if="!isEditingEnterprise"
              class="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-black text-sky-700 transition hover:bg-sky-100"
              type="button"
              @click="startEditEnterprise(selectedEnterprise)"
            >
              <Icon name="uil:edit" class="h-4 w-4" />
              Chỉnh sửa
            </button>
            <button class="qw-detail-close" type="button" @click="closeEnterpriseDetail">
              <Icon name="uil:times" class="h-5 w-5" />
            </button>
          </div>
        </header>
        <div class="qw-detail-body">
          <form v-if="isEditingEnterprise" class="space-y-4" @submit.prevent="saveSelectedEnterprise">
            <div class="grid gap-3 md:grid-cols-2">
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Email</span>
                <input v-model.trim="editEnterpriseForm.email" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="email">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Trạng thái tài khoản</span>
                <select v-model="editEnterpriseForm.status" class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm khóa</option>
                  <option value="BANNED">Bị cấm</option>
                </select>
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Tên doanh nghiệp</span>
                <input v-model.trim="editEnterpriseForm.enterprise_profile.company_name" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">Mã số thuế</span>
                <input v-model.trim="editEnterpriseForm.enterprise_profile.tax_code" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">GPKD URL</span>
                <input v-model.trim="editEnterpriseForm.enterprise_profile.gpkd_url" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100" type="text">
              </label>
              <label class="space-y-1.5">
                <span class="text-xs font-black uppercase text-slate-500">KYB</span>
                <select v-model="editEnterpriseForm.enterprise_profile.kyb_status" class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100">
                  <option value="PENDING">Chờ xác minh</option>
                  <option value="APPROVED">Đã xác minh</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </label>
            </div>
          </form>
          <div v-else class="qw-detail-grid">
            <div v-for="item in detailItems(selectedEnterprise)" :key="item.label" class="qw-detail-item">
              <p class="qw-detail-label">{{ item.label }}</p>
              <p class="qw-detail-value">{{ item.value }}</p>
            </div>
          </div>
        </div>
        <footer v-if="!isEditingEnterprise" class="qw-detail-footer">
          <button type="button" class="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800" @click="handleViewBusinessLicense(selectedEnterprise)">
            <Icon name="uil:file-search-alt" class="h-4 w-4" />
            Xem giấy phép kinh doanh
          </button>
          <button
            v-if="!hasBusinessLicense(selectedEnterprise)"
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="requestingGPKDId === selectedEnterprise.id"
            @click="requestGPKD(selectedEnterprise)"
          >
            <Icon name="uil:file-upload-alt" class="h-4 w-4" />
            Yêu cầu nộp GPKD
          </button>
        </footer>
        <footer v-else class="qw-detail-footer">
          <button type="button" class="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50" @click="cancelEditEnterprise">
            Hủy
          </button>
          <button type="button" class="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" :disabled="savingEnterprise" @click="saveSelectedEnterprise">
            <Icon name="uil:save" class="h-4 w-4" />
            {{ savingEnterprise ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { AdminService } from '~/services/admin.service'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'
type KYBStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

const toast = useToast()
const enterprises = ref<any[]>([])
const jobs = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const activeKYB = ref('ALL')
const activeStatus = ref('ALL')
const selectedEnterprise = ref<any | null>(null)
const updatingUserId = ref<number | null>(null)
const updatingKYBId = ref<number | null>(null)
const requestingGPKDId = ref<number | null>(null)
const isEditingEnterprise = ref(false)
const savingEnterprise = ref(false)
const editEnterpriseForm = reactive({
  email: '',
  status: 'ACTIVE' as UserStatus,
  enterprise_profile: {
    company_name: '',
    tax_code: '',
    gpkd_url: '',
    kyb_status: 'PENDING' as KYBStatus
  }
})

const jobCountMap = computed(() => {
  return jobs.value.reduce((counts, job) => {
    const enterpriseId = Number(job.enterprise_id)
    if (!enterpriseId) return counts
    if (!counts[enterpriseId]) {
      counts[enterpriseId] = { total: 0, approved: 0, pending: 0, rejected: 0, closed: 0, draft: 0 }
    }
    const bucket = counts[enterpriseId]
    bucket.total += 1
    const status = normalizeJobStatus(job.status)
    if (status === 'APPROVED') bucket.approved += 1
    if (status === 'PENDING') bucket.pending += 1
    if (status === 'REJECTED') bucket.rejected += 1
    if (status === 'CLOSED') bucket.closed += 1
    if (status === 'DRAFT') bucket.draft += 1
    return counts
  }, {} as Record<number, { total: number; approved: number; pending: number; rejected: number; closed: number; draft: number }>)
})

const summaryCards = computed(() => [
  {
    label: 'Tổng doanh nghiệp',
    value: enterprises.value.length,
    helper: 'Tài khoản role ENTERPRISE',
    icon: 'uil:building',
    iconClass: 'bg-teal-50 text-teal-700'
  },
  {
    label: 'Đã xác minh',
    value: countByKYB('APPROVED'),
    helper: 'KYB đã duyệt',
    icon: 'uil:check-circle',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    label: 'Chờ KYB',
    value: countByKYB('PENDING'),
    helper: 'Cần admin xử lý',
    icon: 'uil:clock',
    iconClass: 'bg-amber-50 text-amber-700'
  },
  {
    label: 'Tin tuyển dụng',
    value: jobs.value.length,
    helper: 'Tổng tin từ doanh nghiệp',
    icon: 'uil:briefcase-alt',
    iconClass: 'bg-slate-100 text-slate-700'
  }
])

const filteredEnterprises = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return enterprises.value.filter((enterprise) => {
    const kyb = getKYBStatus(enterprise)
    const matchesKYB = activeKYB.value === 'ALL' || kyb === activeKYB.value
    const matchesStatus = activeStatus.value === 'ALL' || normalizeStatus(enterprise.status) === activeStatus.value
    const searchable = [
      getCompanyName(enterprise),
      enterprise.email,
      enterprise?.enterprise_profile?.tax_code,
      kybLabel(kyb),
      statusLabel(enterprise.status)
    ].filter(Boolean).join(' ').toLowerCase()

    return matchesKYB && matchesStatus && (!query || searchable.includes(query))
  })
})

async function fetchEnterprises() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const [enterpriseRes, jobsRes]: any[] = await Promise.all([
      AdminService.getEnterprises(),
      AdminService.getPendingJobs()
    ])
    enterprises.value = enterpriseRes?.success && Array.isArray(enterpriseRes.data) ? enterpriseRes.data : []
    jobs.value = jobsRes?.success && Array.isArray(jobsRes.data) ? jobsRes.data : []
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách doanh nghiệp.'
    enterprises.value = []
    jobs.value = []
  } finally {
    isLoading.value = false
  }
}

async function updateUserStatus(enterprise: any, status: UserStatus) {
  if (normalizeStatus(enterprise.status) === status) return
  try {
    updatingUserId.value = enterprise.id
    const response: any = await AdminService.updateUserStatus(enterprise.id, status)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật trạng thái tài khoản.')
    }
    toast.success('Đã cập nhật tài khoản', `${getCompanyName(enterprise)} chuyển sang ${statusLabel(status)}.`)
    await fetchEnterprises()
  } catch (error: any) {
    toast.error('Cập nhật thất bại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
    await fetchEnterprises()
  } finally {
    updatingUserId.value = null
  }
}

async function updateKYBStatus(enterprise: any, status: KYBStatus) {
  if (status === 'APPROVED' && !hasBusinessLicense(enterprise)) {
    toast.warning('Chưa có giấy phép kinh doanh', 'Không thể duyệt KYB khi doanh nghiệp chưa nộp giấy phép kinh doanh.')
    return
  }
  if (getKYBStatus(enterprise) === status) return
  try {
    updatingKYBId.value = enterprise.id
    const response: any = await AdminService.updateEnterpriseKYB(enterprise.id, status)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật KYB.')
    }
    toast.success('Đã cập nhật KYB', `${getCompanyName(enterprise)} chuyển sang ${kybLabel(status)}.`)
    await fetchEnterprises()
  } catch (error: any) {
    toast.error('Cập nhật KYB thất bại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
    await fetchEnterprises()
  } finally {
    updatingKYBId.value = null
  }
}

function handleStatusChange(enterprise: any, event: Event) {
  const target = event.target as HTMLSelectElement
  updateUserStatus(enterprise, target.value as UserStatus)
}

function handleKYBChange(enterprise: any, event: Event) {
  const target = event.target as HTMLSelectElement
  if (target.value === 'APPROVED' && !hasBusinessLicense(enterprise)) {
    target.value = getKYBStatus(enterprise)
    toast.warning('Chưa có giấy phép kinh doanh', 'Hãy yêu cầu doanh nghiệp nộp giấy phép trước khi duyệt KYB.')
    return
  }
  updateKYBStatus(enterprise, target.value as KYBStatus)
}

function clearFilters() {
  searchQuery.value = ''
  activeKYB.value = 'ALL'
  activeStatus.value = 'ALL'
}

function openEnterpriseDetail(enterprise: any) {
  selectedEnterprise.value = enterprise
  cancelEditEnterprise()
}

function closeEnterpriseDetail() {
  selectedEnterprise.value = null
  cancelEditEnterprise()
}

function startEditEnterprise(enterprise: any) {
  editEnterpriseForm.email = enterprise.email || ''
  editEnterpriseForm.status = normalizeStatus(enterprise.status) as UserStatus
  editEnterpriseForm.enterprise_profile.company_name = enterprise?.enterprise_profile?.company_name || ''
  editEnterpriseForm.enterprise_profile.tax_code = enterprise?.enterprise_profile?.tax_code || ''
  editEnterpriseForm.enterprise_profile.gpkd_url = enterprise?.enterprise_profile?.gpkd_url || ''
  editEnterpriseForm.enterprise_profile.kyb_status = getKYBStatus(enterprise)
  isEditingEnterprise.value = true
}

function cancelEditEnterprise() {
  isEditingEnterprise.value = false
  savingEnterprise.value = false
}

function replaceEnterprise(updatedEnterprise: any) {
  const index = enterprises.value.findIndex((enterprise) => String(enterprise.id) === String(updatedEnterprise.id))
  if (index >= 0) {
    enterprises.value.splice(index, 1, updatedEnterprise)
  }
}

async function saveSelectedEnterprise() {
  if (!selectedEnterprise.value) return
  try {
    savingEnterprise.value = true
    const response: any = await AdminService.updateUser(selectedEnterprise.value.id, {
      email: editEnterpriseForm.email,
      status: editEnterpriseForm.status,
      enterprise_profile: { ...editEnterpriseForm.enterprise_profile }
    })
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể lưu thông tin doanh nghiệp.')
    }
    replaceEnterprise(response.data)
    selectedEnterprise.value = response.data
    isEditingEnterprise.value = false
    toast.success('Đã lưu doanh nghiệp', `${getCompanyName(response.data)} đã được cập nhật.`)
  } catch (error: any) {
    toast.error('Lưu thất bại', error?.data?.message || error?.message || 'Vui lòng kiểm tra lại dữ liệu.')
  } finally {
    savingEnterprise.value = false
  }
}

function countByKYB(status: KYBStatus) {
  return enterprises.value.filter((enterprise) => getKYBStatus(enterprise) === status).length
}

function getJobCount(enterpriseId: number) {
  return jobCountMap.value[Number(enterpriseId)] || { total: 0, approved: 0, pending: 0, rejected: 0, closed: 0, draft: 0 }
}

function getKYBStatus(enterprise: any): KYBStatus {
  const value = (enterprise?.enterprise_profile?.kyb_status || enterprise?.enterprise_profile?.status_kyb || 'PENDING').toUpperCase()
  if (value === 'APPROVED' || value === 'REJECTED') return value
  return 'PENDING'
}

function kybLabel(status?: string) {
  const labels: Record<string, string> = {
    APPROVED: 'Đã xác minh',
    PENDING: 'Chờ xác minh',
    REJECTED: 'Từ chối'
  }
  return labels[(status || 'PENDING').toUpperCase()] || 'Chờ xác minh'
}

function kybClass(status?: string) {
  const classes: Record<string, string> = {
    APPROVED: 'bg-sky-50 text-sky-700',
    PENDING: 'bg-amber-50 text-amber-700',
    REJECTED: 'bg-rose-50 text-rose-700'
  }
  return classes[(status || 'PENDING').toUpperCase()] || 'bg-slate-50 text-slate-600'
}

function normalizeStatus(status?: string) {
  return (status || 'ACTIVE').toUpperCase()
}

function normalizeJobStatus(status?: string) {
  return (status || '').toUpperCase()
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

function getCompanyName(enterprise: any) {
  return enterprise?.enterprise_profile?.company_name || enterprise?.email?.split('@')[0] || 'Doanh nghiệp'
}

function getInitial(enterprise: any) {
  return getCompanyName(enterprise).charAt(0).toUpperCase()
}

function getBusinessLicenseURL(enterprise: any) {
  return String(enterprise?.enterprise_profile?.gpkd_url || '').trim()
}

function hasBusinessLicense(enterprise: any) {
  return getBusinessLicenseURL(enterprise) !== ''
}

function resolveBusinessLicenseURL(rawURL: string) {
  if (/^https?:\/\//i.test(rawURL)) return rawURL
  if (rawURL.startsWith('//')) {
    return `${window.location.protocol}${rawURL}`
  }

  const config = useRuntimeConfig()
  const apiBase = String(config.public.apiBase || '').trim()
  const path = rawURL.startsWith('/') ? rawURL : `/${rawURL}`

  try {
    return `${new URL(apiBase).origin}${path}`
  } catch {
    return path
  }
}

function handleViewBusinessLicense(enterprise: any) {
  const url = getBusinessLicenseURL(enterprise)
  if (!url) {
    toast.warning('Chưa có giấy phép kinh doanh', 'Doanh nghiệp này chưa nộp giấy phép kinh doanh.')
    return
  }
  window.open(resolveBusinessLicenseURL(url), '_blank', 'noopener,noreferrer')
}

async function requestGPKD(enterprise: any) {
  if (hasBusinessLicense(enterprise)) {
    toast.info('Đã có giấy phép kinh doanh', 'Doanh nghiệp này đã nộp giấy phép.')
    return
  }

  try {
    requestingGPKDId.value = enterprise.id
    const response: any = await AdminService.requestEnterpriseGPKD(enterprise.id)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể gửi yêu cầu nộp giấy phép.')
    }
    toast.success('Đã gửi yêu cầu', `${getCompanyName(enterprise)} đã nhận yêu cầu nộp giấy phép kinh doanh.`)
  } catch (error: any) {
    toast.error('Gửi yêu cầu thất bại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    requestingGPKDId.value = null
  }
}

function detailItems(enterprise: any) {
  const counts = getJobCount(enterprise.id)
  return [
    { label: 'Tên doanh nghiệp', value: getCompanyName(enterprise) },
    { label: 'Email', value: enterprise.email || 'Chưa cập nhật' },
    { label: 'Mã số thuế', value: enterprise?.enterprise_profile?.tax_code || 'Chưa cập nhật' },
    { label: 'Giấy phép kinh doanh', value: hasBusinessLicense(enterprise) ? 'Đã nộp' : 'Chưa có giấy phép kinh doanh' },
    { label: 'KYB', value: kybLabel(getKYBStatus(enterprise)) },
    { label: 'Trạng thái tài khoản', value: statusLabel(enterprise.status) },
    { label: 'Tổng tin tuyển dụng', value: `${counts.total}` },
    { label: 'Tin đã duyệt', value: `${counts.approved}` },
    { label: 'Tin chờ duyệt', value: `${counts.pending}` },
    { label: 'Ngày tạo', value: formatDate(enterprise.created_at) },
    { label: 'Cập nhật lần cuối', value: formatDate(enterprise.updated_at) }
  ]
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

onMounted(fetchEnterprises)
</script>
