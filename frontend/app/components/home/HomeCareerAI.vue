<template>
  <section id="career-ai" class="border-y border-slate-200 bg-white py-12 sm:py-14">
    <div class="mx-auto grid w-full max-w-[1240px] items-start gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div class="max-w-lg lg:sticky lg:top-28">
        <span class="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 py-1.5 pl-1.5 pr-3 text-xs font-black uppercase text-sky-800">
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white">
            <Icon name="uil:robot" class="h-4 w-4" aria-hidden="true" />
          </span>
          QuickWork AI
        </span>
        <h2 class="mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Biến mục tiêu nghề nghiệp thành kế hoạch rõ ràng</h2>
        <p class="mt-4 text-sm font-medium leading-7 text-slate-600 sm:text-base">Mô tả vị trí hoặc ngành bạn muốn theo đuổi. Trợ lý sẽ đề xuất hướng đi, kỹ năng cần ưu tiên và các bước có thể bắt đầu ngay.</p>

        <div class="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <span v-for="assurance in assurances" :key="assurance.label" class="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', assurance.iconClass]"><Icon :name="assurance.icon" class="h-4 w-4" aria-hidden="true" /></span>
            {{ assurance.label }}
          </span>
        </div>
      </div>

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
        <div class="border-b border-slate-200 bg-[#0b2347] px-5 py-5 text-white sm:px-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-[10px] font-black uppercase text-sky-300">Trợ lý định hướng cá nhân</p>
              <h3 class="mt-1 text-lg font-black">Bạn đang muốn đạt mục tiêu gì?</h3>
            </div>
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white"><Icon name="uil:compass" class="h-6 w-6" aria-hidden="true" /></span>
          </div>
        </div>

        <div class="p-5 sm:p-6">
          <template v-if="!result">
            <label for="home-career-ai-goal" class="text-xs font-black text-slate-800">Mục tiêu của bạn</label>
            <textarea
              id="home-career-ai-goal"
              v-model.trim="goal"
              rows="4"
              maxlength="600"
              class="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="Ví dụ: Tôi muốn ứng tuyển Marketing Intern trong 2 tháng tới và chưa biết nên ưu tiên kỹ năng nào..."
            />
            <div class="mt-2 flex items-center justify-between gap-3 text-[10px] font-semibold text-slate-400">
              <span>Không nhập email, số điện thoại hoặc thông tin riêng tư.</span>
              <span class="shrink-0">{{ goal.length }}/600</span>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="prompt in suggestedPrompts"
                :key="prompt"
                type="button"
                class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                @click="goal = prompt"
              >
                {{ prompt }}
              </button>
            </div>

            <p v-if="errorMessage" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800" role="alert">{{ errorMessage }}</p>

            <button
              type="button"
              :disabled="loading"
              class="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:bg-sky-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
              @click="requestGuidance"
            >
              <Icon :name="loading ? 'uil:spinner-alt' : 'uil:robot'" :class="['h-5 w-5', loading ? 'animate-spin' : '']" aria-hidden="true" />
              {{ loading ? 'Đang xây dựng kế hoạch...' : 'Lập kế hoạch bằng AI' }}
            </button>
          </template>

          <div v-else aria-live="polite">
            <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-5">
              <div class="min-w-0 flex-1">
                <span class="text-[10px] font-black uppercase text-sky-700">Hướng đi đề xuất</span>
                <p class="mt-2 text-sm font-semibold leading-6 text-slate-700">{{ result.direction }}</p>
              </div>
              <button type="button" class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-sky-200 hover:text-sky-700" @click="resetResult"><Icon name="uil:redo" class="h-4 w-4" aria-hidden="true" />Làm lại</button>
            </div>

            <div class="grid gap-6 py-5 md:grid-cols-2">
              <section>
                <h4 class="flex items-center gap-2 text-xs font-black text-slate-900"><Icon name="uil:check-circle" class="h-5 w-5 text-emerald-600" aria-hidden="true" />Các bước tiếp theo</h4>
                <ol class="mt-3 space-y-3">
                  <li v-for="(step, index) in result.next_steps" :key="step" class="flex gap-2 text-xs font-medium leading-5 text-slate-600"><span class="font-black text-sky-700">{{ index + 1 }}.</span><span>{{ step }}</span></li>
                </ol>
              </section>
              <section>
                <h4 class="flex items-center gap-2 text-xs font-black text-slate-900"><Icon name="uil:bolt-alt" class="h-5 w-5 text-violet-600" aria-hidden="true" />Kỹ năng ưu tiên</h4>
                <div class="mt-3 flex flex-wrap gap-2"><span v-for="skill in result.priority_skills" :key="skill" class="rounded-full bg-violet-100 px-3 py-1.5 text-[10px] font-black text-violet-800">{{ skill }}</span></div>
                <h4 class="mt-5 flex items-center gap-2 text-xs font-black text-slate-900"><Icon name="uil:book-open" class="h-5 w-5 text-sky-600" aria-hidden="true" />Chủ đề nên đọc</h4>
                <div class="mt-3 flex flex-wrap gap-2"><span v-for="topic in result.related_topics" :key="topic" class="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[10px] font-bold text-sky-800">{{ topic }}</span></div>
              </section>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p class="max-w-xl text-[10px] font-medium leading-5 text-slate-500">{{ result.disclaimer }}</p>
              <NuxtLink to="/blog" class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-sky-50 px-3 text-xs font-black text-sky-700 hover:bg-sky-100">Khám phá Blog<Icon name="uil:arrow-right" class="h-4 w-4" aria-hidden="true" /></NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StudentService } from '~/services/student.service'

type CareerGuidanceResult = {
  direction: string
  next_steps: string[]
  priority_skills: string[]
  related_topics: string[]
  disclaimer: string
  ai_used: boolean
}

const goal = ref('')
const loading = ref(false)
const errorMessage = ref('')
const result = ref<CareerGuidanceResult | null>(null)
let requestVersion = 0

const suggestedPrompts = [
  'Tôi muốn tìm thực tập Marketing trong 2 tháng tới.',
  'Tôi cần lộ trình để ứng tuyển vị trí Kế toán mới ra trường.',
  'Tôi muốn chuyển mục tiêu sang Logistics nhưng chưa biết bắt đầu từ đâu.'
]

const assurances = [
  { label: 'Phản hồi có cấu trúc', icon: 'uil:list-ul', iconClass: 'bg-sky-50 text-sky-700' },
  { label: 'Không lưu nội dung', icon: 'uil:shield-check', iconClass: 'bg-emerald-50 text-emerald-700' },
  { label: 'Dành cho sinh viên', icon: 'uil:graduation-cap', iconClass: 'bg-violet-50 text-violet-700' }
]

async function requestGuidance() {
  if (loading.value) return
  if (goal.value.trim().length < 10) {
    errorMessage.value = 'Hãy mô tả mục tiêu cụ thể hơn để AI đưa ra kế hoạch hữu ích.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  result.value = null
  const currentVersion = ++requestVersion

  try {
    const response: any = await StudentService.getCareerGuidance({
      goal: goal.value.trim(),
      article_title: 'Lập kế hoạch nghề nghiệp cá nhân trên QuickWork',
      article_category: 'Định hướng nghề nghiệp',
      article_excerpt: 'Xác định mục tiêu, kỹ năng ưu tiên và các bước tìm việc phù hợp cho sinh viên.',
      article_highlights: [
        'Chọn mục tiêu nghề nghiệp có thời hạn',
        'Ưu tiên kỹ năng có thể chứng minh',
        'Chuyển định hướng thành các bước hành động cụ thể'
      ]
    })
    const data = response?.data || response
    if (currentVersion !== requestVersion) return
    if (!data?.ai_used || !data?.direction) throw new Error('Trợ lý AI không trả về nội dung hợp lệ.')
    result.value = data as CareerGuidanceResult
  } catch (error: any) {
    if (currentVersion !== requestVersion) return
    errorMessage.value = error?.data?.message || error?.response?.data?.message || error?.message || 'Không thể sử dụng trợ lý AI lúc này.'
  } finally {
    if (currentVersion === requestVersion) loading.value = false
  }
}

function resetResult() {
  requestVersion += 1
  result.value = null
  errorMessage.value = ''
  loading.value = false
}
</script>
