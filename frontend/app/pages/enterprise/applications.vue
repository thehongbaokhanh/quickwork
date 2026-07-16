<template>
  <div class="space-y-6 pb-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-950">Danh sách ứng viên</h1>
        <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Quản lý và theo dõi tất cả ứng viên đã ứng tuyển vào các tin tuyển dụng.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          :disabled="loading || filteredApplications.length === 0"
          @click="exportApplications"
        >
          <Icon name="uil:import" class="h-5 w-5" />
          Xuất danh sách
        </button>
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          @click="openManualCandidate"
        >
          <Icon name="uil:plus" class="h-5 w-5" />
          Thêm ứng viên thủ công
        </button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70"
      >
        <div class="flex items-center gap-4">
          <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', card.iconClass]">
            <Icon :name="card.icon" class="h-6 w-6" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-bold text-slate-500">{{ card.label }}</p>
            <p class="mt-1 text-2xl font-black text-slate-950">{{ card.value }}</p>
            <p :class="['mt-1 text-xs font-black', card.metaClass]">{{ card.meta }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
      <div class="border-b border-slate-100 p-4">
        <div class="relative z-20 grid gap-3 xl:grid-cols-[minmax(280px,1fr)_minmax(220px,280px)_210px_220px_auto]">
          <label class="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
            <Icon name="uil:search" class="h-5 w-5 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm ứng viên theo tên, email, SĐT..."
              class="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
            >
          </label>

          <ScrollSelect
            v-model="activeJob"
            :options="jobFilterOptions"
            icon="uil:briefcase-alt"
            ariaLabel="Lọc theo vị trí"
          />

          <ScrollSelect
            v-model="activeStatus"
            :options="statusFilterOptions"
            icon="uil:check-circle"
            ariaLabel="Lọc theo trạng thái"
          />

          <ScrollSelect
            v-model="activeDateFilter"
            :options="dateFilterSelectOptions"
            icon="uil:calendar-alt"
            ariaLabel="Lọc theo ngày ứng tuyển"
          />

          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="clearFilters"
          >
            <Icon name="uil:filter-slash" class="h-5 w-5" />
            Bộ lọc
          </button>
        </div>
      </div>

      <div v-if="loading" class="space-y-3 p-5">
        <div v-for="item in 6" :key="item" class="h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div v-else-if="errorMessage" class="m-5 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700">
        {{ errorMessage }}
      </div>

      <div v-else-if="filteredApplications.length === 0" class="p-12 text-center">
        <Icon name="uil:user-search" class="mx-auto h-14 w-14 text-slate-300" />
        <h2 class="mt-4 text-xl font-black text-slate-950">Chưa có ứng viên phù hợp</h2>
        <p class="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
          Khi sinh viên ứng tuyển vào tin tuyển dụng của bạn, hồ sơ sẽ hiển thị tại đây để xem xét.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-[1240px] divide-y divide-slate-100">
          <thead class="bg-slate-50/80">
            <tr>
              <th class="w-12 px-4 py-4 text-left">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
                  :checked="allVisibleSelected"
                  aria-label="Chọn tất cả ứng viên trên trang"
                  @change="toggleSelectAll"
                >
              </th>
              <th class="w-[300px] px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Ứng viên</th>
              <th class="w-[290px] px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Vị trí ứng tuyển</th>
              <th class="w-[170px] whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <span class="inline-flex items-center gap-1 whitespace-nowrap">
                  Ngày ứng tuyển
                  <Icon name="uil:arrow-up" class="h-4 w-4 text-slate-400" />
                </span>
              </th>
              <th class="w-[150px] whitespace-nowrap px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái</th>
              <th class="w-[120px] whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Đánh giá</th>
              <th class="w-[210px] whitespace-nowrap px-4 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr
              v-for="application in paginatedApplications"
              :key="application.id"
              class="transition hover:bg-sky-50/40"
            >
              <td class="px-4 py-4 align-middle">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
                  :checked="selectedIds.includes(application.id)"
                  :aria-label="`Chọn ứng viên ${getStudentName(application)}`"
                  @change="toggleSelection(application, $event)"
                >
              </td>
              <td class="px-4 py-4 align-middle">
                <div class="flex min-w-[260px] items-center gap-3">
                  <img
                    v-if="getAvatarUrl(application)"
                    :src="getAvatarUrl(application)"
                    :alt="getStudentName(application)"
                    class="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
                  >
                  <span
                    v-else
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200"
                  >
                    {{ getInitials(application) }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-black text-slate-950">{{ getStudentName(application) }}</p>
                    <p class="truncate text-xs font-semibold text-slate-500">{{ application.student?.email || 'Chưa có email' }}</p>
                    <p class="truncate text-xs font-semibold text-slate-500">{{ getStudentPhone(application) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 align-middle">
                <div class="min-w-[250px]">
                  <p class="line-clamp-1 text-sm font-black text-slate-950">{{ application.job?.title || 'Tin tuyển dụng' }}</p>
                  <p class="mt-1 text-xs font-semibold text-slate-500">Mã: #{{ getJobCode(application) }}</p>
                  <p class="text-xs font-semibold text-slate-500">{{ getApplicationSource(application) }}</p>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 align-middle">
                <p class="text-sm font-bold text-slate-700">{{ formatDate(application.created_at) }}</p>
                <p class="mt-1 text-xs font-semibold text-slate-500">{{ formatTime(application.created_at) }}</p>
              </td>
              <td class="px-4 py-4 text-center align-middle">
                <span :class="['inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black', getStatusClass(application.status)]">
                  <Icon :name="getStatusIcon(application.status)" class="h-4 w-4" />
                  {{ getStatusLabel(application.status) }}
                </span>
              </td>
              <td class="px-4 py-4 align-middle">
                <div v-if="getRating(application)" class="min-w-[110px]">
                  <div class="flex items-center gap-0.5">
                    <Icon
                      v-for="star in 5"
                      :key="star"
                      name="uil:star"
                      :class="['h-4 w-4', star <= Math.round(getRating(application) || 0) ? 'text-amber-400' : 'text-slate-300']"
                    />
                  </div>
                  <p class="mt-1 text-xs font-semibold text-slate-500">{{ getRating(application)?.toFixed(1) }}</p>
                </div>
                <span v-else class="text-sm font-black text-slate-400">-</span>
              </td>
              <td class="px-4 py-4 text-right align-middle">
                <div class="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                  <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl bg-sky-50 px-3 text-xs font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    @click="openProfileModal(application)"
                  >
                    Xem hồ sơ
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!loading && filteredApplications.length > 0"
        class="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-sm font-bold text-slate-500">Số lượng ứng viên trong 1 trang:</span>
          <ScrollSelect
            v-model="pageSize"
            class="w-36"
            :options="pageSizeOptions"
            size="sm"
            ariaLabel="Số lượng ứng viên trong 1 trang"
          />
          <span class="text-sm font-semibold text-slate-400">
            {{ filteredApplications.length }} ứng viên phù hợp
          </span>
        </div>

        <div class="flex items-center justify-center gap-2">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === 1"
            aria-label="Trang trước"
            @click="goToPage(currentPage - 1)"
          >
            <Icon name="uil:angle-left" class="h-5 w-5" />
          </button>
          <template v-for="(page, pageIndex) in visiblePages" :key="`${page}-${pageIndex}`">
            <span v-if="page === '...'" class="px-2 text-sm font-black text-slate-400">...</span>
            <button
              v-else
              type="button"
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition',
                currentPage === page
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                  : 'border border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
              ]"
              :aria-label="`Đi tới trang ${page}`"
              @click="goToPage(Number(page))"
            >
              {{ page }}
            </button>
          </template>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === totalPages"
            aria-label="Trang sau"
            @click="goToPage(currentPage + 1)"
          >
            <Icon name="uil:angle-right" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="profileModalOpen && selectedApplication"
        class="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-slate-950/50 px-4 py-6 backdrop-blur-md sm:py-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-profile-title"
        @click.self="closeProfileModal"
      >
        <div class="flex min-h-full items-center justify-center" @click.self="closeProfileModal">
          <section class="flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-slate-950/5">
          <div class="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex min-w-0 gap-4">
              <img
                v-if="getAvatarUrl(selectedApplication)"
                :src="getAvatarUrl(selectedApplication)"
                :alt="getStudentName(selectedApplication)"
                class="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
              >
              <span
                v-else
                class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-xl font-black text-white"
              >
                {{ getInitials(selectedApplication) }}
              </span>
              <div class="min-w-0">
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black', getStatusClass(selectedApplication.status)]">
                    <Icon :name="getStatusIcon(selectedApplication.status)" class="h-4 w-4" />
                    {{ getStatusLabel(selectedApplication.status) }}
                  </span>
                  <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                    Mã đơn #{{ selectedApplication.id }}
                  </span>
                </div>
                <h2 id="candidate-profile-title" class="text-2xl font-black text-slate-950">
                  {{ getStudentName(selectedApplication) }}
                </h2>
                <p class="mt-1 text-sm font-semibold text-slate-500">
                  {{ selectedApplication.student?.email || 'Chưa có email' }} · {{ getStudentPhone(selectedApplication) }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              aria-label="Đóng hồ sơ ứng viên"
              @click="closeProfileModal"
            >
              <Icon name="uil:multiply" class="h-6 w-6" />
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
            <div class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <section class="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Icon name="uil:user-check" class="h-5 w-5" />
                  </span>
                  <div>
                    <h3 class="text-sm font-black text-slate-950">Thông tin ứng viên</h3>
                    <p class="text-xs font-semibold text-slate-500">Dữ liệu lấy từ hồ sơ sinh viên và đơn ứng tuyển.</p>
                  </div>
                </div>

                <div class="grid gap-3">
                  <div v-for="item in detailItems(selectedApplication)" :key="item.label" class="rounded-2xl bg-slate-50 p-4">
                    <p class="text-xs font-black uppercase tracking-wide text-slate-400">{{ item.label }}</p>
                    <p class="mt-1 break-words text-sm font-bold text-slate-800">{{ item.value }}</p>
                  </div>
                </div>

                <div>
                  <p class="text-xs font-black uppercase tracking-wide text-slate-400">Kỹ năng liên quan</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-for="skill in getSkills(selectedApplication)"
                      :key="skill"
                      class="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700"
                    >
                      {{ skill }}
                    </span>
                    <span v-if="getSkills(selectedApplication).length === 0" class="text-sm font-semibold text-slate-500">
                      Chưa cập nhật
                    </span>
                  </div>
                </div>
              </section>

              <section class="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                    <Icon name="uil:briefcase-alt" class="h-5 w-5" />
                  </span>
                  <div>
                    <h3 class="text-sm font-black text-slate-950">Vị trí ứng tuyển</h3>
                    <p class="text-xs font-semibold text-slate-500">Thông tin công việc gắn với đơn này.</p>
                  </div>
                </div>

                <div class="rounded-3xl bg-white p-5 shadow-sm">
                  <p class="text-xs font-black uppercase tracking-wide text-slate-400">Tin tuyển dụng</p>
                  <h4 class="mt-2 text-xl font-black text-slate-950">{{ selectedApplication.job?.title || 'Tin tuyển dụng' }}</h4>
                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                      <Icon name="uil:map-marker" class="h-5 w-5 text-slate-400" />
                      {{ selectedApplication.job?.location || 'Chưa cập nhật' }}
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                      <Icon name="uil:money-bill" class="h-5 w-5 text-slate-400" />
                      {{ selectedApplication.job?.salary || 'Chưa cập nhật' }}
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                      <Icon name="uil:clock" class="h-5 w-5 text-slate-400" />
                      {{ formatDateTime(selectedApplication.created_at) }}
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                      <Icon name="uil:file-alt" class="h-5 w-5 text-slate-400" />
                      Mã tin #{{ getJobCode(selectedApplication) }}
                    </span>
                  </div>
                </div>

                <a
                  v-if="getCvUrl(selectedApplication)"
                  :href="getCvUrl(selectedApplication)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white text-sm font-black text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                >
                  <Icon name="uil:file-download-alt" class="h-5 w-5" />
                  Xem CV ứng viên
                </a>

                <label class="block">
                  <span class="text-sm font-black text-slate-950">Ghi chú phản hồi</span>
                  <textarea
                    v-model="reviewNote"
                    rows="4"
                    placeholder="Ví dụ: Hồ sơ phù hợp, hẹn phỏng vấn vòng tiếp theo..."
                    class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              </section>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs font-semibold text-slate-500">
              Kết quả xử lý sẽ được lưu trực tiếp vào đơn ứng tuyển này.
            </p>
            <div class="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
                @click="closeProfileModal"
              >
                Đóng
              </button>
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-5 text-sm font-black text-rose-700 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="reviewingId === selectedApplication.id"
                @click="reviewApplication(selectedApplication, 'REJECTED')"
              >
                <Icon name="uil:times-circle" class="h-5 w-5" />
                Từ chối
              </button>
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="reviewingId === selectedApplication.id"
                @click="reviewApplication(selectedApplication, 'ACCEPTED')"
              >
                <Icon :name="reviewingId === selectedApplication.id ? 'svg-spinners:180-ring' : 'uil:check-circle'" class="h-5 w-5" />
                Chấp nhận
              </button>
            </div>
          </div>
          </section>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'

type ApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED'
type StatusFilter = ApplicationStatus | 'ALL'
type DateFilter = 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS'

definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

const toast = useToast()
const config = useRuntimeConfig()
const applications = ref<any[]>([])
const selectedApplication = ref<any | null>(null)
const profileModalOpen = ref(false)
const searchQuery = ref('')
const activeStatus = ref<StatusFilter>('ALL')
const activeJob = ref('ALL')
const activeDateFilter = ref<DateFilter>('ALL')
const loading = ref(true)
const reviewingId = ref<number | null>(null)
const errorMessage = ref('')
const reviewNote = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref<any[]>([])

const statusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'APPLIED', label: 'Chờ duyệt' },
  { value: 'ACCEPTED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' }
] as const

const dateFilterOptions = [
  { value: 'ALL', label: 'Ngày ứng tuyển' },
  { value: 'TODAY', label: 'Hôm nay' },
  { value: '7_DAYS', label: '7 ngày gần đây' },
  { value: '30_DAYS', label: '30 ngày gần đây' }
] as const

const pageSizeOptions = [
  { value: 10, label: '10 / trang' },
  { value: 20, label: '20 / trang' },
  { value: 50, label: '50 / trang' }
]

const jobOptions = computed(() => {
  const options = new Map<string, string>()
  applications.value.forEach((application) => {
    const title = application?.job?.title
    if (!title) return
    options.set(getJobOptionValue(application), title)
  })
  return Array.from(options.entries()).map(([value, label]) => ({ value, label }))
})

const jobFilterOptions = computed(() => [
  { value: 'ALL', label: 'Tất cả vị trí' },
  ...jobOptions.value
])

const statusFilterOptions = computed(() => statusOptions.map((option) => ({ ...option })))
const dateFilterSelectOptions = computed(() => dateFilterOptions.map((option) => ({ ...option })))

const filteredApplications = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return applications.value.filter((application) => {
    const status = normalizeStatus(application.status)
    const matchesStatus = activeStatus.value === 'ALL' || status === activeStatus.value
    const matchesJob = activeJob.value === 'ALL' || getJobOptionValue(application) === activeJob.value
    const matchesDate = matchesDateFilter(application.created_at)
    const searchable = [
      getStudentName(application),
      application.student?.email,
      getStudentPhone(application),
      application.job?.title,
      application.job?.location,
      application.job?.salary,
      ...getSkills(application)
    ].filter(Boolean).join(' ').toLowerCase()

    return matchesStatus && matchesJob && matchesDate && (!query || searchable.includes(query))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / pageSize.value)))

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredApplications.value.slice(start, start + pageSize.value)
})

const visiblePages = computed(() => {
  const pages: Array<number | string> = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 6) {
    for (let page = 1; page <= total; page += 1) pages.push(page)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let page = start; page <= end; page += 1) pages.push(page)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
})

const allVisibleSelected = computed(() => (
  paginatedApplications.value.length > 0
  && paginatedApplications.value.every((application) => selectedIds.value.includes(application.id))
))

const summaryCards = computed(() => {
  const total = applications.value.length
  const accepted = countByStatus('ACCEPTED')
  const pending = countByStatus('APPLIED')
  const rejected = countByStatus('REJECTED')
  const reviewed = accepted + rejected

  return [
    {
      label: 'Tổng ứng viên',
      value: total,
      meta: `${filteredApplications.value.length} đang hiển thị`,
      icon: 'uil:users-alt',
      iconClass: 'bg-sky-50 text-sky-700',
      metaClass: 'text-sky-600'
    },
    {
      label: 'Đã duyệt',
      value: accepted,
      meta: formatPercent(accepted, total),
      icon: 'uil:check-circle',
      iconClass: 'bg-emerald-50 text-emerald-600',
      metaClass: 'text-slate-500'
    },
    {
      label: 'Chờ duyệt',
      value: pending,
      meta: formatPercent(pending, total),
      icon: 'uil:clock',
      iconClass: 'bg-amber-50 text-amber-600',
      metaClass: 'text-slate-500'
    },
    {
      label: 'Bị từ chối',
      value: rejected,
      meta: formatPercent(rejected, total),
      icon: 'uil:times-circle',
      iconClass: 'bg-rose-50 text-rose-600',
      metaClass: 'text-slate-500'
    },
    {
      label: 'Đã xử lý',
      value: reviewed,
      meta: formatPercent(reviewed, total),
      icon: 'uil:clipboard-notes',
      iconClass: 'bg-violet-50 text-violet-600',
      metaClass: 'text-slate-500'
    }
  ]
})

function normalizeStatus(status?: string): ApplicationStatus {
  const value = (status || 'APPLIED').toUpperCase()
  return ['ACCEPTED', 'REJECTED'].includes(value) ? value as ApplicationStatus : 'APPLIED'
}

function countByStatus(status: ApplicationStatus) {
  return applications.value.filter((application) => normalizeStatus(application.status) === status).length
}

function formatPercent(value: number, total: number) {
  if (!total) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

function getStatusLabel(status?: string) {
  const labels: Record<ApplicationStatus, string> = {
    APPLIED: 'Chờ duyệt',
    ACCEPTED: 'Đã duyệt',
    REJECTED: 'Bị từ chối'
  }
  return labels[normalizeStatus(status)]
}

function getStatusClass(status?: string) {
  const classes: Record<ApplicationStatus, string> = {
    APPLIED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
  }
  return classes[normalizeStatus(status)]
}

function getStatusIcon(status?: string) {
  const icons: Record<ApplicationStatus, string> = {
    APPLIED: 'uil:clock',
    ACCEPTED: 'uil:check-circle',
    REJECTED: 'uil:times-circle'
  }
  return icons[normalizeStatus(status)]
}

function getStudentName(application: any) {
  return application?.student?.student_profile?.name || application?.student?.name || application?.student?.email?.split('@')[0] || 'Ứng viên'
}

function getStudentPhone(application: any) {
  return application?.student?.student_profile?.phone || application?.student?.phone || 'Chưa có SĐT'
}

function getInitials(application: any) {
  return getStudentName(application)
    .split(/\s+/)
    .map((part: string) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getSkills(application: any) {
  const skills = application?.student?.student_profile?.skills
  if (!Array.isArray(skills)) return []
  return skills.map((skill: any) => skill?.name || skill?.title || skill).filter(Boolean)
}

function getBackendAssetUrl(value?: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '')
  return `${backendOrigin}${value.startsWith('/') ? '' : '/'}${value}`
}

function getCvUrl(application: any) {
  return getBackendAssetUrl(application?.student?.student_profile?.cv_url)
}

function getAvatarUrl(application: any) {
  return getBackendAssetUrl(application?.student?.student_profile?.avatar_url || application?.student?.avatar_url)
}

function getJobCode(application: any) {
  return application?.job?.id || application?.job_id || application?.id || 'N/A'
}

function getJobOptionValue(application: any) {
  return String(application?.job?.id || application?.job?.title || 'unknown')
}

function getApplicationSource(application: any) {
  return application?.source || application?.application_source || 'QuickWork'
}

function getRating(application: any) {
  const value = Number(application?.rating || application?.score || application?.student?.student_profile?.rating)
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.min(5, value)
}

function detailItems(application: any) {
  return [
    { label: 'Email', value: application?.student?.email || 'Chưa cập nhật' },
    { label: 'Số điện thoại', value: getStudentPhone(application) },
    { label: 'Ngày ứng tuyển', value: formatDateTime(application?.created_at) },
    { label: 'Trạng thái', value: getStatusLabel(application?.status) },
    { label: 'Nguồn ứng tuyển', value: getApplicationSource(application) },
    { label: 'Phản hồi gần nhất', value: application?.employer_note || 'Chưa có ghi chú' }
  ]
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

function formatTime(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function matchesDateFilter(value?: string) {
  if (activeDateFilter.value === 'ALL') return true
  if (!value) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const timestamp = date.getTime()

  if (activeDateFilter.value === 'TODAY') return timestamp >= startOfToday
  const days = activeDateFilter.value === '7_DAYS' ? 7 : 30
  return timestamp >= now.getTime() - days * 24 * 60 * 60 * 1000
}

function openProfileModal(application: any) {
  selectedApplication.value = application
  reviewNote.value = application?.employer_note || ''
  profileModalOpen.value = true
}

function closeProfileModal() {
  profileModalOpen.value = false
}

function replaceApplication(updated: any) {
  const index = applications.value.findIndex((application) => String(application.id) === String(updated.id))
  if (index >= 0) {
    applications.value.splice(index, 1, updated)
  }
  selectedApplication.value = updated
  reviewNote.value = updated?.employer_note || ''
}

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function toggleSelection(application: any, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  if (checked && !selectedIds.value.includes(application.id)) {
    selectedIds.value.push(application.id)
  }
  if (!checked) {
    selectedIds.value = selectedIds.value.filter((id) => id !== application.id)
  }
}

function toggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const pageIds = paginatedApplications.value.map((application) => application.id)

  if (checked) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...pageIds]))
    return
  }

  selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
}

function clearFilters() {
  searchQuery.value = ''
  activeStatus.value = 'ALL'
  activeJob.value = 'ALL'
  activeDateFilter.value = 'ALL'
  selectedIds.value = []
}

function escapeCsv(value: any) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function exportApplications() {
  if (filteredApplications.value.length === 0) {
    toast.warning('Không có dữ liệu xuất', 'Danh sách hiện tại không có ứng viên phù hợp.')
    return
  }

  const rows = [
    ['Ứng viên', 'Email', 'Số điện thoại', 'Vị trí ứng tuyển', 'Ngày ứng tuyển', 'Trạng thái', 'Ghi chú'],
    ...filteredApplications.value.map((application) => [
      getStudentName(application),
      application?.student?.email || '',
      getStudentPhone(application),
      application?.job?.title || '',
      formatDateTime(application?.created_at),
      getStatusLabel(application?.status),
      application?.employer_note || ''
    ])
  ]

  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'quickwork-ung-vien.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function openManualCandidate() {
  toast.warning('Chưa hỗ trợ thêm thủ công', 'Hiện danh sách ứng viên được đồng bộ từ các đơn ứng tuyển trong hệ thống.')
}

function openRowActions(application: any) {
  openProfileModal(application)
}

async function fetchApplications() {
  try {
    loading.value = true
    errorMessage.value = ''
    const response: any = await JobService.getEnterpriseApplications()
    applications.value = response?.success && Array.isArray(response.data) ? response.data : []
    selectedIds.value = []
  } catch (error: any) {
    applications.value = []
    selectedApplication.value = null
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách ứng viên.'
  } finally {
    loading.value = false
  }
}

async function reviewApplication(application: any, status: ApplicationStatus) {
  try {
    reviewingId.value = application.id
    const response: any = await JobService.reviewEnterpriseApplication(application.id, {
      status,
      employer_note: reviewNote.value
    })
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật đơn ứng tuyển.')
    }
    replaceApplication(response.data)
    toast.success(
      status === 'ACCEPTED' ? 'Đã chấp nhận ứng viên' : 'Đã từ chối ứng viên',
      `${getStudentName(response.data)} - ${response.data?.job?.title || 'đơn ứng tuyển'} đã được cập nhật.`
    )
  } catch (error: any) {
    toast.error('Cập nhật thất bại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    reviewingId.value = null
  }
}

watch([searchQuery, activeStatus, activeJob, activeDateFilter, pageSize], () => {
  currentPage.value = 1
})

watch(filteredApplications, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
  const visibleIds = new Set(filteredApplications.value.map((application) => application.id))
  selectedIds.value = selectedIds.value.filter((id) => visibleIds.has(id))
})

onMounted(() => {
  fetchApplications()
})
</script>
