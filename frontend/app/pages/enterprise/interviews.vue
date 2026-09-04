<template>
  <div class="space-y-6 pb-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-700">
          <Icon name="uil:clipboard-notes" class="h-4 w-4" />
          Lịch làm việc
        </span>
        <h1 class="mt-3 text-2xl font-black text-slate-950">Lịch phỏng vấn</h1>
        <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Theo dõi lịch hẹn, xem chi tiết ứng viên và chốt kết quả sau thời gian phỏng vấn.
        </p>
      </div>

      <NuxtLink
        to="/enterprise/applications"
        class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
      >
        <Icon name="uil:users-alt" class="h-5 w-5" />
        Danh sách ứng viên
      </NuxtLink>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <p class="truncate text-sm font-bold text-slate-500">{{ card.label }}</p>
            <p class="mt-1 text-2xl font-black text-slate-950">{{ card.value }}</p>
            <p class="mt-1 truncate text-xs font-black text-slate-500">{{ card.meta }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-lg font-black text-slate-950">Danh sách lịch hẹn</h2>
          <p class="mt-1 text-sm font-semibold text-slate-500">
            Nút xem chi tiết cho phép xử lý kết quả khi lịch phỏng vấn đã qua thời gian hẹn.
          </p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-2 text-sm font-black text-sky-700">
          <Icon name="uil:calendar-alt" class="h-5 w-5" />
          {{ visibleInterviews.length }} lịch đang hiển thị
        </div>
      </div>

      <div class="border-b border-slate-100 px-6 py-4">
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="option in interviewViewOptions"
            :key="option.value"
            type="button"
            :aria-pressed="activeInterviewView === option.value"
            :class="[
              'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              activeInterviewView === option.value
                ? 'border-sky-200 bg-sky-600 text-white shadow-lg shadow-sky-100'
                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
            ]"
            @click="activeInterviewView = option.value"
          >
            <Icon :name="option.icon" class="h-5 w-5" />
            <span>{{ option.label }}</span>
            <span
              :class="[
                'rounded-full px-2 py-0.5 text-xs',
                activeInterviewView === option.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              ]"
            >
              {{ option.count }}
            </span>
          </button>
        </div>
        <p v-if="activeInterviewView === 'active' && completedCount > 0" class="mt-3 text-xs font-bold text-slate-500">
          Đã ẩn {{ completedCount }} lịch đã xử lý khỏi danh sách chính. Chọn “Đã xử lý” để xem lại khi cần.
        </p>
      </div>

      <div v-if="loading" class="grid gap-4 p-6 md:grid-cols-2">
        <div v-for="item in 4" :key="item" class="h-44 animate-pulse rounded-3xl bg-slate-100" />
      </div>

      <div v-else-if="errorMessage" class="p-10 text-center">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
          <Icon name="uil:exclamation-triangle" class="h-8 w-8" />
        </span>
        <h3 class="mt-4 text-xl font-black text-slate-950">Không thể tải lịch phỏng vấn</h3>
        <p class="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">{{ errorMessage }}</p>
      </div>

      <div v-else-if="visibleInterviews.length === 0" class="p-10 text-center">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
          <Icon name="uil:calendar-slash" class="h-8 w-8" />
        </span>
        <h3 class="mt-4 text-xl font-black text-slate-950">{{ emptyStateTitle }}</h3>
        <p class="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
          {{ emptyStateDescription }}
        </p>
      </div>

      <div
        v-else
        :class="[
          'grid gap-4 p-6 xl:grid-cols-2',
          shouldScrollInterviewList ? 'quickwork-interview-list-scroll max-h-[620px] overflow-y-auto pr-3' : ''
        ]"
      >
        <article
          v-for="application in visibleInterviews"
          :key="application.id"
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 transition hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60"
        >
          <div class="flex items-start gap-4">
            <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-lg font-black text-white shadow-lg shadow-sky-100">
              {{ getInitials(application) }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  <Icon name="uil:clock" class="h-4 w-4" />
                  {{ formatDateTime(application.interview_at) }}
                </span>
                <span :class="['inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black', getInterviewStateClass(application)]">
                  <Icon :name="getInterviewStateIcon(application)" class="h-4 w-4" />
                  {{ getInterviewStateLabel(application) }}
                </span>
              </div>
              <h3 class="mt-3 truncate text-lg font-black text-slate-950">{{ getStudentName(application) }}</h3>
              <p class="mt-1 truncate text-sm font-semibold text-slate-500">{{ application.student?.email || getStudentPhone(application) }}</p>
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">Vị trí</p>
              <p class="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-800">{{ application.job?.title || 'Tin tuyển dụng' }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">Hình thức</p>
              <p class="mt-1 text-sm font-bold text-slate-800">{{ getInterviewMethod(application) }}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">Địa điểm/Link</p>
              <p class="mt-1 line-clamp-2 break-words text-sm font-bold text-slate-800">{{ application.interview_location || 'Chưa cập nhật' }}</p>
            </div>
          </div>

          <div class="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs font-bold text-slate-500">
              {{ hasInterviewResult(application) ? `Xử lý lúc ${formatDateTime(application.interview_result_at)}` : 'Xem chi tiết để theo dõi và xử lý lịch hẹn.' }}
            </p>
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              @click="openInterviewDetail(application)"
            >
              <Icon name="uil:eye" class="h-5 w-5" />
              Xem chi tiết
            </button>
          </div>
        </article>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="isDetailOpen && selectedInterview"
        class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
        role="presentation"
        @click.self="closeInterviewDetail"
      >
        <section
          class="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-950/20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="interview-detail-title"
        >
          <header class="flex flex-col gap-4 border-b border-slate-100 bg-white px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex min-w-0 items-start gap-4">
              <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-sky-600 text-xl font-black text-white shadow-lg shadow-sky-100">
                {{ getInitials(selectedInterview) }}
              </span>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span :class="['inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black', getInterviewStateClass(selectedInterview)]">
                    <Icon :name="getInterviewStateIcon(selectedInterview)" class="h-4 w-4" />
                    {{ getInterviewStateLabel(selectedInterview) }}
                  </span>
                  <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    Mã đơn #{{ selectedInterview.id }}
                  </span>
                </div>
                <h2 id="interview-detail-title" class="mt-3 truncate text-2xl font-black text-slate-950">
                  {{ getStudentName(selectedInterview) }}
                </h2>
                <p class="mt-1 truncate text-sm font-bold text-slate-500">
                  {{ selectedInterview.student?.email || 'Chưa có email' }} · {{ getStudentPhone(selectedInterview) }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              aria-label="Đóng chi tiết lịch phỏng vấn"
              @click="closeInterviewDetail"
            >
              <Icon name="uil:multiply" class="h-6 w-6" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-6 py-6">
            <div class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
                <div class="flex items-center gap-3">
                  <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Icon name="uil:user-square" class="h-6 w-6" />
                  </span>
                  <div>
                    <h3 class="text-lg font-black text-slate-950">Thông tin lịch hẹn</h3>
                    <p class="text-sm font-semibold text-slate-500">Chi tiết ứng viên và vị trí phỏng vấn.</p>
                  </div>
                </div>

                <div class="mt-5 grid gap-3 md:grid-cols-2">
                  <div class="rounded-2xl bg-slate-50 p-4">
                    <p class="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      <Icon name="uil:clock" class="h-4 w-4 text-sky-600" />
                      Thời gian
                    </p>
                    <p class="mt-2 break-words text-sm font-black leading-6 text-slate-800">{{ formatDateTime(selectedInterview.interview_at) }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4">
                    <p class="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      <Icon name="uil:comment-alt-message" class="h-4 w-4 text-sky-600" />
                      Hình thức
                    </p>
                    <p class="mt-2 break-words text-sm font-black leading-6 text-slate-800">{{ getInterviewMethod(selectedInterview) }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                    <p class="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      <Icon name="uil:map-marker" class="h-4 w-4 text-sky-600" />
                      Địa điểm/Link
                    </p>
                    <p class="mt-2 break-words text-sm font-black leading-6 text-slate-800">{{ selectedInterview.interview_location || 'Chưa cập nhật' }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4">
                    <p class="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      <Icon name="uil:briefcase-alt" class="h-4 w-4 text-sky-600" />
                      Vị trí ứng tuyển
                    </p>
                    <p class="mt-2 break-words text-sm font-black leading-6 text-slate-800">{{ selectedInterview.job?.title || 'Tin tuyển dụng' }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4">
                    <p class="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      <Icon name="uil:users-alt" class="h-4 w-4 text-sky-600" />
                      Số lượng còn lại
                    </p>
                    <p class="mt-2 break-words text-sm font-black leading-6 text-slate-800">{{ getJobSlotsText(selectedInterview) }}</p>
                  </div>
                  <div class="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                    <p class="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      <Icon name="uil:notes" class="h-4 w-4 text-sky-600" />
                      Ghi chú lịch hẹn
                    </p>
                    <p class="mt-2 whitespace-pre-line break-words text-sm font-bold leading-6 text-slate-700">{{ selectedInterview.interview_note || 'Chưa có ghi chú' }}</p>
                  </div>
                </div>
              </section>

              <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
                <div class="flex items-center gap-3">
                  <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Icon name="uil:clipboard-alt" class="h-6 w-6" />
                  </span>
                  <div>
                    <h3 class="text-lg font-black text-slate-950">Xử lý kết quả</h3>
                    <p class="text-sm font-semibold text-slate-500">Hành động chỉ mở sau giờ phỏng vấn.</p>
                  </div>
                </div>

                <div v-if="hasInterviewResult(selectedInterview)" class="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-xs font-black uppercase tracking-wide text-slate-400">Kết quả cuối cùng</p>
                  <div class="mt-3 flex flex-wrap items-center gap-2">
                    <span :class="['inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black', getResultClass(selectedInterview.interview_result)]">
                      <Icon :name="getResultIcon(selectedInterview.interview_result)" class="h-5 w-5" />
                      {{ getResultLabel(selectedInterview.interview_result) }}
                    </span>
                    <span class="text-sm font-bold text-slate-500">{{ formatDateTime(selectedInterview.interview_result_at) }}</span>
                  </div>
                  <p class="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
                    {{ selectedInterview.interview_result_note || 'Không có ghi chú bổ sung.' }}
                  </p>
                </div>

                <div v-else-if="!canTakeInterviewAction(selectedInterview)" class="mt-5 rounded-3xl border border-amber-100 bg-amber-50 p-5 text-amber-800">
                  <div class="flex items-start gap-3">
                    <Icon name="uil:clock-eight" class="mt-0.5 h-6 w-6 shrink-0" />
                    <div>
                      <p class="font-black">Chưa đến thời gian xử lý</p>
                      <p class="mt-2 text-sm font-semibold leading-6">
                        Bạn có thể xem chi tiết lịch hẹn ngay bây giờ. Các nút nhận làm việc, từ chối hoặc đánh dấu không đến sẽ xuất hiện sau thời gian phỏng vấn.
                      </p>
                    </div>
                  </div>
                </div>

                <div v-else class="mt-5 space-y-4">
                  <div class="grid gap-3">
                    <button
                      v-for="option in resultOptions"
                      :key="option.value"
                      type="button"
                      :class="[
                        'flex items-start gap-3 rounded-3xl border p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                        decisionForm.result === option.value ? option.activeClass : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50/60'
                      ]"
                      @click="chooseInterviewResult(option.value)"
                    >
                      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80">
                        <Icon :name="option.icon" class="h-6 w-6" />
                      </span>
                      <span>
                        <span class="block text-sm font-black">{{ option.label }}</span>
                        <span class="mt-1 block text-xs font-semibold leading-5 opacity-80">{{ option.description }}</span>
                      </span>
                    </button>
                  </div>

                  <label class="block">
                    <span class="text-sm font-black text-slate-800">
                      {{ decisionForm.result === 'REJECTED' ? 'Lý do không nhận' : 'Ghi chú kết quả' }}
                    </span>
                    <textarea
                      v-model="decisionForm.result_note"
                      rows="4"
                      :placeholder="decisionForm.result === 'REJECTED' ? 'Ví dụ: Kinh nghiệm chưa phù hợp với yêu cầu vị trí...' : 'Thêm ghi chú cho kết quả phỏng vấn nếu cần...'"
                      class="mt-2 w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                </div>
              </section>
            </div>
          </div>

          <footer class="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs font-bold text-slate-500">
              Kết quả được lưu trực tiếp vào đơn ứng tuyển. Nếu nhận làm việc, số lượng tuyển dụng còn lại sẽ tự cập nhật.
            </p>
            <div class="flex gap-3">
              <button
                type="button"
                class="inline-flex h-11 min-w-28 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-sky-200 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                @click="closeInterviewDetail"
              >
                Đóng
              </button>
              <button
                v-if="selectedInterview && canTakeInterviewAction(selectedInterview)"
                type="button"
                class="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                :disabled="submittingResult || !canSubmitInterviewResult"
                @click="submitInterviewResult"
              >
                <Icon :name="submittingResult ? 'uil:spinner-alt' : 'uil:save'" :class="['h-5 w-5', submittingResult ? 'animate-spin' : '']" />
                Lưu kết quả
              </button>
            </div>
          </footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'

definePageMeta({
  layout: 'enterprise',
  middleware: ['company', 'enterprise-approved']
})

type InterviewResult = 'HIRED' | 'REJECTED' | 'NO_SHOW'
type InterviewView = 'active' | 'actionable' | 'upcoming' | 'completed' | 'all'

const toast = useToast()
const applications = ref<any[]>([])
const loading = ref(true)
const errorMessage = ref('')
const nowTick = ref(Date.now())
const activeInterviewView = ref<InterviewView>('active')
const selectedInterview = ref<any | null>(null)
const isDetailOpen = ref(false)
const submittingResult = ref(false)
const decisionForm = reactive<{ result: InterviewResult, result_note: string }>({
  result: 'HIRED',
  result_note: ''
})

let nowTimer: ReturnType<typeof setInterval> | null = null

const resultOptions: Array<{
  value: InterviewResult
  label: string
  description: string
  icon: string
  activeClass: string
}> = [
  {
    value: 'HIRED',
    label: 'Nhận làm việc',
    description: 'Ứng viên đạt yêu cầu. Hệ thống sẽ trừ 1 chỉ tiêu tuyển dụng.',
    icon: 'uil:check-circle',
    activeClass: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  {
    value: 'REJECTED',
    label: 'Từ chối nhận',
    description: 'Ứng viên chưa phù hợp. Cần nhập ghi chú lý do không nhận.',
    icon: 'uil:times-circle',
    activeClass: 'border-rose-200 bg-rose-50 text-rose-700'
  },
  {
    value: 'NO_SHOW',
    label: 'Không đến phỏng vấn',
    description: 'Đánh dấu ứng viên vắng mặt trong buổi phỏng vấn đã hẹn.',
    icon: 'uil:calendar-slash',
    activeClass: 'border-amber-200 bg-amber-50 text-amber-700'
  }
]

const interviews = computed(() => applications.value
  .filter((application) => normalizeStatus(application.status) === 'ACCEPTED' && application.interview_at)
  .sort((a, b) => getInterviewTimestamp(a) - getInterviewTimestamp(b)))

const todayCount = computed(() => interviews.value.filter((application) => isToday(application.interview_at)).length)
const activeCount = computed(() => interviews.value.filter((application) => !hasInterviewResult(application)).length)
const upcomingCount = computed(() => interviews.value.filter((application) => !hasInterviewResult(application) && getInterviewTimestamp(application) > nowTick.value).length)
const actionableCount = computed(() => interviews.value.filter((application) => canTakeInterviewAction(application)).length)
const completedCount = computed(() => interviews.value.filter((application) => hasInterviewResult(application)).length)

const visibleInterviews = computed(() => {
  switch (activeInterviewView.value) {
    case 'actionable':
      return interviews.value.filter((application) => canTakeInterviewAction(application))
    case 'upcoming':
      return interviews.value.filter((application) => !hasInterviewResult(application) && getInterviewTimestamp(application) > nowTick.value)
    case 'completed':
      return [...interviews.value]
        .filter((application) => hasInterviewResult(application))
        .sort((a, b) => getInterviewResultTimestamp(b) - getInterviewResultTimestamp(a))
    case 'all':
      return interviews.value
    case 'active':
    default:
      return interviews.value.filter((application) => !hasInterviewResult(application))
  }
})

const shouldScrollInterviewList = computed(() => visibleInterviews.value.length >= 6)

const interviewViewOptions = computed<Array<{ value: InterviewView, label: string, icon: string, count: number }>>(() => [
  { value: 'active', label: 'Đang theo dõi', icon: 'uil:calendar-alt', count: activeCount.value },
  { value: 'actionable', label: 'Chờ xử lý', icon: 'uil:clipboard-check', count: actionableCount.value },
  { value: 'upcoming', label: 'Sắp tới', icon: 'uil:clock', count: upcomingCount.value },
  { value: 'completed', label: 'Đã xử lý', icon: 'uil:archive', count: completedCount.value },
  { value: 'all', label: 'Tất cả', icon: 'uil:apps', count: interviews.value.length }
])

const emptyStateTitle = computed(() => {
  switch (activeInterviewView.value) {
    case 'completed':
      return 'Chưa có lịch đã xử lý'
    case 'actionable':
      return 'Chưa có lịch cần xử lý'
    case 'upcoming':
      return 'Chưa có lịch sắp tới'
    case 'all':
      return 'Chưa có lịch phỏng vấn'
    case 'active':
    default:
      return 'Không còn lịch đang theo dõi'
  }
})

const emptyStateDescription = computed(() => {
  switch (activeInterviewView.value) {
    case 'completed':
      return 'Các lịch đã chốt kết quả sẽ được lưu tại đây để tra cứu lại, không làm đầy danh sách chính.'
    case 'actionable':
      return 'Khi lịch phỏng vấn đã qua giờ hẹn và chưa có kết quả, lịch sẽ xuất hiện trong mục này.'
    case 'upcoming':
      return 'Các lịch chưa đến giờ phỏng vấn sẽ xuất hiện tại đây.'
    case 'all':
      return 'Khi bạn đặt lịch trong hồ sơ ứng viên đã duyệt, lịch hẹn sẽ xuất hiện tại đây.'
    case 'active':
    default:
      return 'Lịch đã xử lý được ẩn khỏi danh sách chính. Chọn “Đã xử lý” để xem lại lịch đã chốt kết quả.'
  }
})

const summaryCards = computed(() => [
  {
    label: 'Lịch hôm nay',
    value: todayCount.value,
    meta: 'Lịch diễn ra trong ngày',
    icon: 'uil:calendar-alt',
    iconClass: 'bg-sky-50 text-sky-600'
  },
  {
    label: 'Sắp tới',
    value: upcomingCount.value,
    meta: 'Chưa đến giờ xử lý',
    icon: 'uil:clock',
    iconClass: 'bg-amber-50 text-amber-600'
  },
  {
    label: 'Chờ kết quả',
    value: actionableCount.value,
    meta: 'Có thể thao tác ngay',
    icon: 'uil:clipboard-check',
    iconClass: 'bg-indigo-50 text-indigo-600'
  },
  {
    label: 'Đã xử lý',
    value: completedCount.value,
    meta: 'Đã có kết quả',
    icon: 'uil:check-circle',
    iconClass: 'bg-sky-50 text-sky-600'
  }
])

const canSubmitInterviewResult = computed(() => (
  decisionForm.result !== 'REJECTED' || decisionForm.result_note.trim().length > 0
))

function normalizeStatus(status?: string) {
  return String(status || 'APPLIED').toUpperCase()
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

function getInterviewMethod(application: any) {
  const labels: Record<string, string> = {
    ONLINE: 'Online',
    OFFLINE: 'Trực tiếp',
    PHONE: 'Gọi điện',
    HYBRID: 'Linh hoạt'
  }
  return labels[String(application?.interview_method || '').toUpperCase()] || 'Chưa chọn hình thức'
}

function getInterviewTimestamp(application: any) {
  const date = new Date(application?.interview_at || '')
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime()
}

function getInterviewResultTimestamp(application: any) {
  const date = new Date(application?.interview_result_at || application?.interview_at || '')
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function hasInterviewResult(application: any) {
  return String(application?.interview_result || '').trim().length > 0
}

function canTakeInterviewAction(application: any) {
  return !hasInterviewResult(application) && getInterviewTimestamp(application) <= nowTick.value
}

function getInterviewStateLabel(application: any) {
  if (hasInterviewResult(application)) return getResultLabel(application.interview_result)
  if (canTakeInterviewAction(application)) return 'Chờ xử lý kết quả'
  return 'Chưa đến giờ'
}

function getInterviewStateClass(application: any) {
  if (hasInterviewResult(application)) return getResultClass(application.interview_result)
  if (canTakeInterviewAction(application)) return 'border-indigo-100 bg-indigo-50 text-indigo-700'
  return 'border-amber-100 bg-amber-50 text-amber-700'
}

function getInterviewStateIcon(application: any) {
  if (hasInterviewResult(application)) return getResultIcon(application.interview_result)
  if (canTakeInterviewAction(application)) return 'uil:clipboard-check'
  return 'uil:clock'
}

function getResultLabel(result?: string) {
  switch (String(result || '').toUpperCase()) {
    case 'HIRED':
      return 'Được nhận'
    case 'REJECTED':
      return 'Từ chối nhận'
    case 'NO_SHOW':
      return 'Không đến phỏng vấn'
    default:
      return 'Chưa cập nhật'
  }
}

function getResultIcon(result?: string) {
  switch (String(result || '').toUpperCase()) {
    case 'HIRED':
      return 'uil:check-circle'
    case 'REJECTED':
      return 'uil:times-circle'
    case 'NO_SHOW':
      return 'uil:calendar-slash'
    default:
      return 'uil:clock'
  }
}

function getResultClass(result?: string) {
  switch (String(result || '').toUpperCase()) {
    case 'HIRED':
      return 'border-sky-100 bg-sky-50 text-sky-700'
    case 'REJECTED':
      return 'border-rose-100 bg-rose-50 text-rose-700'
    case 'NO_SHOW':
      return 'border-amber-100 bg-amber-50 text-amber-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

function getJobSlotsText(application: any) {
  const slots = Number(application?.job?.slots)
  if (Number.isNaN(slots)) return 'Chưa cập nhật'
  return `${Math.max(slots, 0)} vị trí`
}

function formatDateTime(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getApiErrorMessage(error: any, fallback: string) {
  const responseMessage = error?.data?.message || error?.response?._data?.message
  if (responseMessage) return responseMessage
  if (error?.statusCode === 404 || error?.response?.status === 404) {
    return 'Không tìm thấy lịch phỏng vấn này hoặc backend chưa được khởi động lại sau khi cập nhật API.'
  }
  return error?.statusMessage || fallback
}

function isToday(value?: string) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date(nowTick.value)
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
}

function chooseInterviewResult(result: InterviewResult) {
  decisionForm.result = result
  if (result === 'HIRED') {
    decisionForm.result_note = ''
  }
}

function openInterviewDetail(application: any) {
  selectedInterview.value = application
  decisionForm.result = String(application?.interview_result || 'HIRED').toUpperCase() as InterviewResult
  decisionForm.result_note = application?.interview_result_note || ''
  isDetailOpen.value = true
}

function closeInterviewDetail() {
  isDetailOpen.value = false
  selectedInterview.value = null
  decisionForm.result = 'HIRED'
  decisionForm.result_note = ''
}

function replaceApplication(updatedApplication: any) {
  const index = applications.value.findIndex((application) => Number(application.id) === Number(updatedApplication.id))
  if (index >= 0) {
    applications.value.splice(index, 1, updatedApplication)
  } else {
    applications.value.unshift(updatedApplication)
  }
}

async function submitInterviewResult() {
  if (!selectedInterview.value || submittingResult.value) return

  if (decisionForm.result === 'REJECTED' && !decisionForm.result_note.trim()) {
    toast.warning('Thiếu ghi chú', 'Vui lòng nhập lý do không nhận ứng viên.')
    return
  }

  try {
    submittingResult.value = true
    const response: any = await JobService.submitEnterpriseInterviewResult(selectedInterview.value.id, {
      result: decisionForm.result,
      result_note: decisionForm.result_note.trim()
    })
    const updatedApplication = response?.data
    if (response?.success && updatedApplication) {
      replaceApplication(updatedApplication)
      selectedInterview.value = updatedApplication
      toast.success(
        'Đã cập nhật kết quả',
        activeInterviewView.value === 'completed'
          ? 'Kết quả phỏng vấn đã được lưu.'
          : 'Lịch này đã được chuyển sang mục Đã xử lý để danh sách chính gọn hơn.'
      )
    } else {
      toast.error('Không thể cập nhật', response?.message || 'Vui lòng thử lại sau.')
    }
  } catch (error: any) {
    toast.error('Không thể cập nhật', getApiErrorMessage(error, 'Vui lòng thử lại sau.'))
  } finally {
    submittingResult.value = false
  }
}

async function fetchApplications() {
  try {
    loading.value = true
    errorMessage.value = ''
    const response: any = await JobService.getEnterpriseApplications({ status: 'ACCEPTED' })
    applications.value = response?.success && Array.isArray(response.data) ? response.data : []
  } catch (error: any) {
    applications.value = []
    errorMessage.value = getApiErrorMessage(error, 'Không thể tải lịch phỏng vấn.')
  } finally {
    loading.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isDetailOpen.value) {
    closeInterviewDetail()
  }
}

onMounted(() => {
  fetchApplications()
  nowTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 30000)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (nowTimer) {
    clearInterval(nowTimer)
  }
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.quickwork-interview-list-scroll {
  scrollbar-color: #bae6fd #f8fafc;
  scrollbar-width: thin;
}

.quickwork-interview-list-scroll::-webkit-scrollbar {
  width: 8px;
}

.quickwork-interview-list-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.quickwork-interview-list-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.quickwork-interview-list-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border: 2px solid #f8fafc;
  border-radius: 999px;
}

.quickwork-interview-list-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
