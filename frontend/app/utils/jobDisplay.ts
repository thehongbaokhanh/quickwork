export type ApiSkill = {
  id?: number
  name?: string
  category?: {
    id?: number
    name?: string
  }
}

export type ApiJob = {
  id: number
  title?: string
  description?: string
  requirements?: string
  salary?: string
  location?: string
  slots?: number
  status?: string
  created_at?: string
  updated_at?: string
  enterprise_profile?: {
    company_name?: string
  }
  skills?: ApiSkill[]
}

export type DisplayJob = {
  id: number
  title: string
  company: string
  logo: string
  logoClass: string
  badge: string
  description: string
  salary: string
  salaryRange: string
  location: string
  type: string
  level: string
  category: string
  slots: number
  skills: string[]
  posted: string
  createdAt: number
}

const logoClasses = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-slate-900',
  'bg-emerald-700',
  'bg-teal-700',
  'bg-slate-700'
]

export function mapJobForDisplay(job: ApiJob, index = 0): DisplayJob {
  const title = cleanText(job.title, 'Tin tuyển dụng')
  const description = cleanText(job.description || job.requirements, 'Doanh nghiệp chưa cập nhật mô tả công việc.')
  const company = cleanText(job.enterprise_profile?.company_name, 'Doanh nghiệp đã xác thực')
  const skills = getSkillNames(job)
  const searchableText = [title, description, job.requirements, job.location, job.salary, ...skills].join(' ').toLowerCase()
  const type = inferJobType(searchableText, job.location)
  const level = inferJobLevel(searchableText)
  const category = inferJobCategory(skills, searchableText)
  const createdAt = getDateTime(job.created_at)

  return {
    id: job.id,
    title,
    company,
    logo: getCompanyLogo(company),
    logoClass: logoClasses[(job.id || index) % logoClasses.length] || 'bg-emerald-600',
    badge: getJobBadge(type, createdAt),
    description,
    salary: cleanText(job.salary, 'Thỏa thuận'),
    salaryRange: getSalaryRange(job.salary),
    location: cleanText(job.location, 'Chưa cập nhật'),
    type,
    level,
    category,
    slots: Number(job.slots) > 0 ? Number(job.slots) : 1,
    skills,
    posted: formatPosted(job.created_at),
    createdAt
  }
}

export function getDateTime(value?: string) {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export function getSalaryRange(value?: string) {
  const salary = value || ''
  const numbers = salary.match(/\d+/g)?.map(Number) || []
  if (numbers.length === 0) return 'Thỏa thuận'
  const max = Math.max(...numbers)
  if (max <= 10) return 'Dưới 10 triệu'
  if (max <= 20) return '10 - 20 triệu'
  if (max <= 30) return '20 - 30 triệu'
  return 'Trên 30 triệu'
}

export function salaryRank(range: string) {
  const order: Record<string, number> = {
    'Thỏa thuận': 0,
    'Dưới 10 triệu': 1,
    '10 - 20 triệu': 2,
    '20 - 30 triệu': 3,
    'Trên 30 triệu': 4
  }
  return order[range] || 0
}

function getSkillNames(job: ApiJob) {
  if (!Array.isArray(job.skills)) return []
  return job.skills
    .map((skill) => cleanText(skill.name, ''))
    .filter(Boolean)
}

function cleanText(value: unknown, fallback: string) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || fallback
}

function getCompanyLogo(company: string) {
  const words = company
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return 'QW'
  if (words.length === 1) return (words[0] || 'QW').slice(0, 3).toUpperCase()
  return words.slice(0, 3).map((word) => word.charAt(0)).join('').toUpperCase()
}

function inferJobType(text: string, location?: string) {
  const combined = `${text} ${location || ''}`.toLowerCase()
  if (combined.includes('remote')) return 'Remote'
  if (combined.includes('part-time') || combined.includes('part time') || combined.includes('bán thời gian')) return 'Bán thời gian'
  if (combined.includes('freelance')) return 'Freelance'
  if (combined.includes('intern') || combined.includes('thực tập') || combined.includes('trainee')) return 'Thực tập'
  return 'Toàn thời gian'
}

function inferJobLevel(text: string) {
  if (text.includes('senior') || text.includes('lead')) return 'Senior (5+ năm)'
  if (text.includes('middle') || text.includes('mid-level')) return 'Middle (3-5 năm)'
  if (text.includes('fresher') || text.includes('intern') || text.includes('thực tập') || text.includes('trainee')) return 'Fresher (0-1 năm)'
  return 'Junior (1-3 năm)'
}

function inferJobCategory(skills: string[], text: string) {
  const lowerSkills = skills.join(' ').toLowerCase()
  const combined = `${lowerSkills} ${text}`
  if (/(marketing|content|seo|social|ads|campaign)/.test(combined)) return 'Marketing'
  if (/(design|figma|ui|ux|product)/.test(combined)) return 'Thiết kế'
  if (/(sales|crm|business|analyst|vận hành|operations)/.test(combined)) return 'Kinh doanh'
  return 'Công nghệ'
}

function getJobBadge(type: string, createdAt: number) {
  const ageMs = Date.now() - createdAt
  if (createdAt > 0 && ageMs <= 3 * 24 * 60 * 60 * 1000) return 'Mới'
  if (type === 'Remote') return 'Remote'
  return type
}

function formatPosted(value?: string) {
  const time = getDateTime(value)
  if (time === 0) return 'Chưa cập nhật'
  const diffMs = Date.now() - time
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${Math.max(minutes, 1)} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return new Date(time).toLocaleDateString('vi-VN')
}
