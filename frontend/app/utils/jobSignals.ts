import type { DisplayJob } from '~/utils/jobDisplay'

export type JobSignalKey = 'new' | 'busy' | 'hot' | 'opportunity'

export type JobSignalThresholds = {
  applications: number
  favorites: number
}

export type JobVisualSignal = {
  key: JobSignalKey
  label: string
  title: string
  icon: string
  badgeClass: string
  cardClass: string
  accentClass: string
}

const NEW_JOB_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

const signalDefinitions: Record<JobSignalKey, JobVisualSignal> = {
  new: {
    key: 'new',
    label: 'MỚI',
    title: 'Tin được đăng trong 3 ngày gần đây',
    icon: 'uil:sparkles',
    badgeClass: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200 motion-safe:animate-pulse',
    cardClass: 'border-sky-300 bg-gradient-to-br from-white via-white to-sky-50 shadow-sky-100/80',
    accentClass: 'bg-gradient-to-b from-sky-400 to-blue-600'
  },
  busy: {
    key: 'busy',
    label: 'Ứng tuyển nhiều',
    title: 'Tin đang nhận được nhiều hồ sơ ứng tuyển',
    icon: 'uil:users-alt',
    badgeClass: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
    cardClass: 'border-violet-200 bg-gradient-to-br from-white via-white to-violet-50 shadow-violet-100/70',
    accentClass: 'bg-gradient-to-b from-violet-500 to-indigo-500'
  },
  hot: {
    key: 'hot',
    label: 'HOT',
    title: 'Tin đang được nhiều sinh viên quan tâm',
    icon: 'uil:bolt',
    badgeClass: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 motion-safe:animate-pulse',
    cardClass: 'border-rose-200 bg-gradient-to-br from-white via-white to-rose-50 shadow-rose-100/70',
    accentClass: 'bg-gradient-to-b from-rose-500 to-orange-400'
  },
  opportunity: {
    key: 'opportunity',
    label: 'Cơ hội ít cạnh tranh',
    title: 'Phù hợp cao với hồ sơ của bạn và hiện có ít lượt quan tâm',
    icon: 'uil:star',
    badgeClass: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    cardClass: 'border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50 shadow-emerald-100/70',
    accentClass: 'bg-gradient-to-b from-emerald-500 to-teal-400'
  }
}

export function isNewlyPostedJob(job: Pick<DisplayJob, 'createdAt'>, now = Date.now()) {
  const age = now - Number(job.createdAt || 0)
  return job.createdAt > 0 && age >= 0 && age <= NEW_JOB_WINDOW_MS
}

export function buildJobSignalThresholds(jobs: DisplayJob[]): JobSignalThresholds {
  return {
    applications: popularityThreshold(jobs.map((job) => job.applicationCount), 3),
    favorites: popularityThreshold(jobs.map((job) => job.favoriteCount), 2)
  }
}

export function getJobSignals(job: DisplayJob, thresholds: JobSignalThresholds): JobVisualSignal[] {
  const signals: JobVisualSignal[] = []

  if (isNewlyPostedJob(job)) signals.push(signalDefinitions.new)
  if (job.applicationCount >= thresholds.applications) signals.push(signalDefinitions.busy)
  if (job.favoriteCount >= thresholds.favorites) signals.push(signalDefinitions.hot)
  if (
    job.isPersonalized === true
    && Number(job.matchScore || 0) >= 75
    && job.applicationCount <= 1
    && job.favoriteCount <= 1
  ) {
    signals.push(signalDefinitions.opportunity)
  }

  return signals
}

function popularityThreshold(values: number[], minimum: number) {
  const positive = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b)
  if (!positive.length || positive[positive.length - 1]! < minimum) return Number.POSITIVE_INFINITY
  const upperQuartileIndex = Math.max(0, Math.ceil(positive.length * 0.75) - 1)
  return Math.max(minimum, positive[upperQuartileIndex] || minimum)
}
