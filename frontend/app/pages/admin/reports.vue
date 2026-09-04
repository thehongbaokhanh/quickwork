<template>
  <div class="space-y-5">
    <header class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Phân tích hệ thống</p>
        <h1 class="mt-1 text-2xl font-bold text-slate-950">Báo cáo & Thống kê</h1>
        <p class="mt-1 text-sm text-slate-500">Theo dõi hiệu suất hoạt động và tình hình phát triển của QuickWork.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button v-for="item in periods" :key="item.value" type="button" class="rounded-lg px-3 py-2 text-sm font-semibold transition" :class="period === item.value ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'" @click="period = item.value">{{ item.label }}</button>
        </div>
        <button class="report-action" type="button" :disabled="loading || !report" @click="printReport"><Icon name="uil:file-download-alt" class="h-5 w-5" /> Xuất PDF</button>
        <button class="report-action" type="button" :disabled="loading || !report" @click="exportCsv"><Icon name="uil:file-spreadsheet" class="h-5 w-5 text-emerald-600" /> Xuất CSV</button>
      </div>
    </header>

    <div v-if="errorMessage" class="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <span>{{ errorMessage }}</span><button class="font-bold underline" type="button" @click="loadReport">Thử lại</button>
    </div>

    <template v-if="loading">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"><div v-for="index in 6" :key="index" class="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" /></div>
      <div class="grid gap-4 xl:grid-cols-12"><div class="h-80 animate-pulse rounded-2xl bg-white xl:col-span-7" /><div class="h-80 animate-pulse rounded-2xl bg-white xl:col-span-5" /></div>
    </template>

    <template v-else-if="report">
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <article v-for="card in kpiCards" :key="card.label" class="report-card flex min-h-32 flex-col justify-between p-4">
          <div class="flex items-start justify-between gap-3"><div class="rounded-xl p-2.5" :class="card.iconBg"><Icon :name="card.icon" class="h-6 w-6" :class="card.iconColor" /></div><Icon name="uil:arrow-growth" class="h-5 w-5 text-emerald-500" /></div>
          <div><p class="text-xs font-semibold text-slate-500">{{ card.label }}</p><p class="mt-1 text-2xl font-black text-slate-950">{{ card.value }}</p><p class="mt-1 text-[11px] text-slate-400">Dữ liệu hệ thống hiện tại</p></div>
        </article>
      </section>

      <section class="grid gap-4 xl:grid-cols-12">
        <article class="report-card p-5 xl:col-span-7">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><h2 class="report-title">Tăng trưởng theo thời gian</h2><p class="report-subtitle">Người dùng, tin đăng và lượt ứng tuyển mới</p></div>
            <div class="flex gap-3 text-xs font-semibold text-slate-500"><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-full bg-blue-500" /> Người dùng</span><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Tin đăng</span><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-full bg-orange-500" /> Ứng tuyển</span></div>
          </div>
          <div v-if="report.growth.length" class="overflow-x-auto">
            <svg class="min-w-[620px]" viewBox="0 0 700 260" role="img" aria-label="Biểu đồ tăng trưởng">
              <line v-for="y in [30, 85, 140, 195]" :key="y" x1="45" :y1="y" x2="680" :y2="y" stroke="#e2e8f0" />
              <polyline :points="chartPoints('users')" fill="none" stroke="#3b82f6" stroke-width="3" /><polyline :points="chartPoints('jobs')" fill="none" stroke="#10b981" stroke-width="3" /><polyline :points="chartPoints('applications')" fill="none" stroke="#f97316" stroke-width="3" />
              <g v-for="(item, index) in report.growth" :key="item.label"><text :x="chartX(index)" y="235" text-anchor="middle" class="fill-slate-500 text-[11px]">{{ item.label }}</text><circle :cx="chartX(index)" :cy="chartY(item.users)" r="4" fill="#fff" stroke="#3b82f6" stroke-width="2" /><circle :cx="chartX(index)" :cy="chartY(item.jobs)" r="4" fill="#fff" stroke="#10b981" stroke-width="2" /><circle :cx="chartX(index)" :cy="chartY(item.applications)" r="4" fill="#fff" stroke="#f97316" stroke-width="2" /></g>
            </svg>
          </div>
          <div v-else class="grid h-60 place-items-center text-sm text-slate-400">Chưa có dữ liệu trong kỳ đã chọn.</div>
        </article>

        <article class="report-card p-5 xl:col-span-5">
          <h2 class="report-title">Cơ cấu tài khoản</h2><p class="report-subtitle">Phân bổ người dùng theo vai trò</p>
          <div class="mt-6 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <div class="relative mx-auto h-44 w-44 rounded-full" :style="{ background: accountGradient }"><div class="absolute inset-7 grid place-items-center rounded-full bg-white text-center"><div><span class="block text-xs text-slate-400">Tổng</span><strong class="text-xl text-slate-950">{{ formatNumber(report.summary.total_users) }}</strong></div></div></div>
            <div class="space-y-3"><div v-for="(item, index) in report.account_distribution" :key="item.label" class="flex items-center justify-between gap-3 text-sm"><span class="flex items-center gap-2 text-slate-600"><i class="h-2.5 w-2.5 rounded-full" :style="{ background: donutColors[index % donutColors.length] }" />{{ roleLabel(item.label) }}</span><strong class="text-slate-900">{{ formatNumber(item.count) }} <small class="font-medium text-slate-400">({{ item.rate }}%)</small></strong></div></div>
          </div>
        </article>
      </section>

      <section class="grid gap-4 xl:grid-cols-12">
        <article class="report-card p-5 xl:col-span-5">
          <h2 class="report-title">Hiệu suất kiểm duyệt</h2><p class="report-subtitle">Trạng thái tin tuyển dụng</p>
          <div class="mt-5 space-y-4"><div v-for="(item, index) in report.job_status_distribution" :key="item.label" class="grid grid-cols-[90px_1fr_auto] items-center gap-3"><span class="text-sm text-slate-600">{{ statusLabel(item.label) }}</span><div class="h-3 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full" :class="statusColors[index]" :style="{ width: `${Math.max(item.rate, item.count ? 4 : 0)}%` }" /></div><strong class="min-w-10 text-right text-sm text-slate-700">{{ formatNumber(item.count) }}</strong></div></div>
        </article>
        <article class="report-card overflow-hidden xl:col-span-7">
          <div class="border-b border-slate-100 p-5"><h2 class="report-title">Doanh nghiệp nổi bật</h2><p class="report-subtitle">Xếp hạng theo số lượt ứng tuyển</p></div>
          <div class="overflow-x-auto"><table class="w-full min-w-[620px] text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-5 py-3">#</th><th>Doanh nghiệp</th><th>Tin đăng</th><th>Ứng tuyển</th><th class="pr-5">Tỷ lệ phản hồi</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="(item, index) in report.top_enterprises" :key="`${item.name}-${index}`"><td class="px-5 py-3 text-slate-400">{{ index + 1 }}</td><td class="font-semibold text-slate-900">{{ item.name || 'Chưa cập nhật' }}</td><td>{{ formatNumber(item.job_count) }}</td><td>{{ formatNumber(item.application_count) }}</td><td class="pr-5 font-semibold text-sky-600">{{ item.response_rate }}%</td></tr><tr v-if="!report.top_enterprises.length"><td colspan="5" class="px-5 py-10 text-center text-slate-400">Chưa có dữ liệu doanh nghiệp.</td></tr></tbody></table></div>
        </article>
      </section>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RankingCard title="Top ngành nghề" icon="uil:briefcase-alt" :items="report.top_categories" color="bg-violet-500" />
        <RankingCard title="Top địa điểm tuyển dụng" icon="uil:map-marker" :items="report.top_locations" color="bg-orange-500" />
        <article class="report-card flex min-h-64 flex-col items-center justify-center p-5 text-center md:col-span-2 xl:col-span-1"><h2 class="report-title self-start">Tỷ lệ hoàn thiện hồ sơ</h2><div class="relative mt-5 grid h-36 w-36 place-items-center rounded-full" :style="completionGradient"><div class="grid h-28 w-28 place-items-center rounded-full bg-white text-3xl font-black text-slate-950">{{ report.profile_completion_rate }}%</div></div><p class="mt-4 text-sm text-slate-500">Trung bình mức độ hoàn thiện hồ sơ học viên</p></article>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, resolveComponent, watch } from 'vue'
import { AdminService } from '~/services/admin.service'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

type CountItem = { label: string; count: number; rate: number }
type GrowthItem = { label: string; users: number; jobs: number; applications: number }
type EnterpriseItem = { name: string; job_count: number; application_count: number; response_rate: number }
type ReportData = { period: string; summary: { total_users: number; active_enterprises: number; active_jobs: number; applications: number; job_approval_rate: number; application_response_rate: number }; account_distribution: CountItem[]; job_status_distribution: CountItem[]; growth: GrowthItem[]; top_enterprises: EnterpriseItem[]; top_categories: CountItem[]; top_locations: CountItem[]; profile_completion_rate: number }

const periods = [{ label: '7 ngày', value: '7d' }, { label: '30 ngày', value: '30d' }, { label: 'Quý này', value: 'quarter' }, { label: 'Năm nay', value: 'year' }]
const period = ref('30d')
const report = ref<ReportData | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const donutColors = ['#3b82f6', '#22c55e', '#8b5cf6', '#f97316', '#64748b']
const statusColors = ['bg-emerald-500', 'bg-orange-400', 'bg-rose-500', 'bg-slate-400']

const RankingCard = defineComponent({
  props: { title: { type: String, required: true }, icon: { type: String, required: true }, items: { type: Array as () => CountItem[], required: true }, color: { type: String, required: true } },
  setup(props) { return () => h('article', { class: 'report-card p-5' }, [h('div', { class: 'flex items-center gap-2' }, [h(resolveComponent('Icon') as any, { name: props.icon, class: 'h-5 w-5 text-sky-600' }), h('h2', { class: 'report-title' }, props.title)]), h('div', { class: 'mt-5 space-y-4' }, props.items.length ? props.items.map(item => h('div', { class: 'space-y-1.5' }, [h('div', { class: 'flex justify-between gap-3 text-sm' }, [h('span', { class: 'truncate text-slate-600' }, item.label), h('strong', { class: 'text-slate-900' }, `${item.rate}%`)]), h('div', { class: 'h-1.5 overflow-hidden rounded-full bg-slate-100' }, [h('div', { class: `h-full rounded-full ${props.color}`, style: { width: `${item.rate}%` } })])])) : [h('p', { class: 'py-12 text-center text-sm text-slate-400' }, 'Chưa có dữ liệu.')])]) }
})

const kpiCards = computed(() => report.value ? [
  { label: 'Tổng người dùng', value: formatNumber(report.value.summary.total_users), icon: 'uil:users-alt', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Doanh nghiệp hoạt động', value: formatNumber(report.value.summary.active_enterprises), icon: 'uil:building', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Tin đang hiển thị', value: formatNumber(report.value.summary.active_jobs), icon: 'uil:briefcase-alt', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { label: 'Đơn ứng tuyển', value: formatNumber(report.value.summary.applications), icon: 'uil:file-check-alt', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { label: 'Tỷ lệ duyệt tin', value: `${report.value.summary.job_approval_rate}%`, icon: 'uil:shield-check', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
  { label: 'Tỷ lệ phản hồi ứng viên', value: `${report.value.summary.application_response_rate}%`, icon: 'uil:comment-check', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' }
] : [])

const chartMax = computed(() => Math.max(1, ...(report.value?.growth.flatMap(item => [item.users, item.jobs, item.applications]) || [1])))
const chartX = (index: number) => 55 + index * (615 / Math.max(1, (report.value?.growth.length || 1) - 1))
const chartY = (value: number) => 205 - (value / chartMax.value) * 170
const chartPoints = (key: keyof Pick<GrowthItem, 'users' | 'jobs' | 'applications'>) => report.value?.growth.map((item, index) => `${chartX(index)},${chartY(item[key])}`).join(' ') || ''
const accountGradient = computed(() => { let cursor = 0; const stops = (report.value?.account_distribution || []).map((item, index) => { const start = cursor; cursor += item.rate; return `${donutColors[index % donutColors.length]} ${start}% ${cursor}%` }); return `conic-gradient(${stops.length ? stops.join(',') : '#e2e8f0 0 100%'})` })
const completionGradient = computed(() => ({ background: `conic-gradient(#3b82f6 0 ${report.value?.profile_completion_rate || 0}%, #e2e8f0 0 100%)` }))

async function loadReport() { loading.value = true; errorMessage.value = ''; try { const response = await AdminService.getReportsSummary(period.value) as { data?: ReportData }; report.value = response.data || response as unknown as ReportData } catch (error: any) { errorMessage.value = error?.data?.message || 'Không thể tải dữ liệu báo cáo.' } finally { loading.value = false } }
function formatNumber(value: number) { return new Intl.NumberFormat('vi-VN').format(value || 0) }
function roleLabel(value: string) { return ({ STUDENT: 'Học viên', ENTERPRISE: 'Doanh nghiệp', ADMIN: 'Quản trị viên' } as Record<string, string>)[value] || value }
function statusLabel(value: string) { return ({ APPROVED: 'Đã duyệt', PENDING: 'Chờ duyệt', REJECTED: 'Từ chối', CLOSED: 'Đã đóng' } as Record<string, string>)[value] || value }
function printReport() { if (import.meta.client) window.print() }
function exportCsv() { if (!report.value || !import.meta.client) return; const rows: Array<Array<string | number>> = [['Chỉ số', 'Giá trị'], ...kpiCards.value.map(item => [item.label, item.value]), [], ['Doanh nghiệp', 'Tin đăng', 'Ứng tuyển', 'Tỷ lệ phản hồi'], ...report.value.top_enterprises.map(item => [item.name, item.job_count, item.application_count, `${item.response_rate}%`])]; const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = `quickwork-report-${period.value}.csv`; link.click(); URL.revokeObjectURL(url) }

watch(period, loadReport, { immediate: true })
</script>

<style scoped>
.report-card { @apply rounded-2xl border border-slate-200 bg-white shadow-sm; }
.report-title { @apply text-base font-bold text-slate-950; }
.report-subtitle { @apply mt-1 text-xs text-slate-500; }
.report-action { @apply inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50; }
@media print { header, button { display: none !important; } .report-card { box-shadow: none; break-inside: avoid; } }
</style>
