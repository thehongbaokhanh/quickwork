import apiClient from './api'

export type AdminSettingsCapabilityState = 'active' | 'stored_only' | 'unavailable' | 'fixed'
export type AdminSettingsUpdatedBy = number | string | {
  id?: number
  email?: string
  name?: string
} | null

export interface AdminSettings {
  platform: {
    systemName: string
    adminDisplayName: string
    supportEmail: string
    timezone: string
    language: 'vi' | 'en'
  }
  registration: {
    student: boolean
    enterprise: boolean
    verifyEmail: boolean
    requireKyb: boolean
  }
  moderation: {
    mode: 'manual' | 'automatic'
    pendingHours: 24 | 48 | 72
    draftLimit: number
    hideRejected: boolean
  }
  notifications: {
    criticalEmail: boolean
    inApp: boolean
    dailyDigest: boolean
    kybAlert: boolean
    reportedJob: boolean
  }
  security: {
    strongPassword: boolean
    twoFactorAdmin: boolean
    sessionMinutes: 15 | 30 | 60
    loginAttempts: number
    ipAllowlist: string
  }
  backup: {
    daily: boolean
  }
}

export interface AdminSettingsCapabilities {
  platform: Record<keyof AdminSettings['platform'], AdminSettingsCapabilityState>
  registration: Record<keyof AdminSettings['registration'], AdminSettingsCapabilityState>
  moderation: Record<keyof AdminSettings['moderation'], AdminSettingsCapabilityState>
  notifications: Record<keyof AdminSettings['notifications'], AdminSettingsCapabilityState>
  security: Record<keyof AdminSettings['security'], AdminSettingsCapabilityState>
  backup: Record<keyof AdminSettings['backup'], AdminSettingsCapabilityState>
}

export interface AdminSettingsMeta {
  adminCount: number | null
  appVersion: string
  uptimeSeconds: number | null
  memoryAllocBytes: number | null
  goroutines: number | null
  databaseStatus: string
}

export interface AdminSettingsSnapshot {
  settings: AdminSettings
  defaults: AdminSettings
  capabilities: AdminSettingsCapabilities
  version: number
  configured: boolean
  updatedAt: string | null
  updatedBy: AdminSettingsUpdatedBy
  meta: AdminSettingsMeta
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

type UnknownRecord = Record<string, unknown>

export const ADMIN_SETTINGS_FALLBACKS: AdminSettings = {
  platform: {
    systemName: 'QuickWork Platform',
    adminDisplayName: 'QuickWork Admin Center',
    supportEmail: 'support@quickwork.vn',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi'
  },
  registration: {
    student: true,
    enterprise: true,
    verifyEmail: false,
    requireKyb: true
  },
  moderation: {
    mode: 'manual',
    pendingHours: 72,
    draftLimit: 20,
    hideRejected: true
  },
  notifications: {
    criticalEmail: false,
    inApp: true,
    dailyDigest: false,
    kybAlert: true,
    reportedJob: false
  },
  security: {
    strongPassword: true,
    twoFactorAdmin: false,
    sessionMinutes: 30,
    loginAttempts: 5,
    ipAllowlist: ''
  },
  backup: {
    daily: false
  }
}

const FALLBACK_CAPABILITIES: AdminSettingsCapabilities = {
  platform: {
    systemName: 'active',
    adminDisplayName: 'active',
    supportEmail: 'active',
    timezone: 'active',
    language: 'active'
  },
  registration: {
    student: 'active',
    enterprise: 'active',
    verifyEmail: 'unavailable',
    requireKyb: 'active'
  },
  moderation: {
    mode: 'active',
    pendingHours: 'stored_only',
    draftLimit: 'active',
    hideRejected: 'fixed'
  },
  notifications: {
    criticalEmail: 'unavailable',
    inApp: 'active',
    dailyDigest: 'unavailable',
    kybAlert: 'active',
    reportedJob: 'unavailable'
  },
  security: {
    strongPassword: 'active',
    twoFactorAdmin: 'unavailable',
    sessionMinutes: 'active',
    loginAttempts: 'active',
    ipAllowlist: 'active'
  },
  backup: {
    daily: 'unavailable'
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {}
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function integerValue(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isInteger(value) ? value : fallback
}

function nullableInteger(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null
}

function enumValue<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback
}

function normalizeIPAllowlist(value: unknown, fallback: string) {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean).join(', ')
  }
  return typeof value === 'string' ? value : fallback
}

export function normalizeAdminSettings(value: unknown, fallback = ADMIN_SETTINGS_FALLBACKS): AdminSettings {
  const source = asRecord(value)
  const platform = asRecord(source.platform)
  const registration = asRecord(source.registration)
  const moderation = asRecord(source.moderation)
  const notifications = asRecord(source.notifications)
  const security = asRecord(source.security)
  const backup = asRecord(source.backup)

  return {
    platform: {
      systemName: stringValue(platform.systemName, fallback.platform.systemName),
      adminDisplayName: stringValue(platform.adminDisplayName, fallback.platform.adminDisplayName),
      supportEmail: stringValue(platform.supportEmail, fallback.platform.supportEmail),
      timezone: stringValue(platform.timezone, fallback.platform.timezone),
      language: enumValue(platform.language, ['vi', 'en'] as const, fallback.platform.language)
    },
    registration: {
      student: booleanValue(registration.student, fallback.registration.student),
      enterprise: booleanValue(registration.enterprise, fallback.registration.enterprise),
      verifyEmail: booleanValue(registration.verifyEmail, fallback.registration.verifyEmail),
      requireKyb: booleanValue(registration.requireKyb, fallback.registration.requireKyb)
    },
    moderation: {
      mode: enumValue(moderation.mode, ['manual', 'automatic'] as const, fallback.moderation.mode),
      pendingHours: enumValue(moderation.pendingHours, [24, 48, 72] as const, fallback.moderation.pendingHours),
      draftLimit: integerValue(moderation.draftLimit, fallback.moderation.draftLimit),
      hideRejected: booleanValue(moderation.hideRejected, fallback.moderation.hideRejected)
    },
    notifications: {
      criticalEmail: booleanValue(notifications.criticalEmail, fallback.notifications.criticalEmail),
      inApp: booleanValue(notifications.inApp, fallback.notifications.inApp),
      dailyDigest: booleanValue(notifications.dailyDigest, fallback.notifications.dailyDigest),
      kybAlert: booleanValue(notifications.kybAlert, fallback.notifications.kybAlert),
      reportedJob: booleanValue(notifications.reportedJob, fallback.notifications.reportedJob)
    },
    security: {
      strongPassword: booleanValue(security.strongPassword, fallback.security.strongPassword),
      twoFactorAdmin: booleanValue(security.twoFactorAdmin, fallback.security.twoFactorAdmin),
      sessionMinutes: enumValue(security.sessionMinutes, [15, 30, 60] as const, fallback.security.sessionMinutes),
      loginAttempts: integerValue(security.loginAttempts, fallback.security.loginAttempts),
      ipAllowlist: normalizeIPAllowlist(security.ipAllowlist, fallback.security.ipAllowlist)
    },
    backup: {
      daily: booleanValue(backup.daily, fallback.backup.daily)
    }
  }
}

function capabilityValue(value: unknown, fallback: AdminSettingsCapabilityState) {
  return enumValue(value, ['active', 'stored_only', 'unavailable', 'fixed'] as const, fallback)
}

function normalizeCapabilityGroup<K extends string>(
  value: unknown,
  fallback: Record<K, AdminSettingsCapabilityState>
): Record<K, AdminSettingsCapabilityState> {
  const source = asRecord(value)
  return Object.fromEntries(
    Object.entries(fallback).map(([key, state]) => [key, capabilityValue(source[key], state)])
  ) as Record<K, AdminSettingsCapabilityState>
}

export function normalizeAdminSettingsCapabilities(value: unknown): AdminSettingsCapabilities {
  const source = asRecord(value)
  return {
    platform: normalizeCapabilityGroup(source.platform, FALLBACK_CAPABILITIES.platform),
    registration: normalizeCapabilityGroup(source.registration, FALLBACK_CAPABILITIES.registration),
    moderation: normalizeCapabilityGroup(source.moderation, FALLBACK_CAPABILITIES.moderation),
    notifications: normalizeCapabilityGroup(source.notifications, FALLBACK_CAPABILITIES.notifications),
    security: normalizeCapabilityGroup(source.security, FALLBACK_CAPABILITIES.security),
    backup: normalizeCapabilityGroup(source.backup, FALLBACK_CAPABILITIES.backup)
  }
}

function normalizeUpdatedBy(value: unknown): AdminSettingsUpdatedBy {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!isRecord(value)) return null
  return {
    id: typeof value.id === 'number' ? value.id : undefined,
    email: typeof value.email === 'string' ? value.email : undefined,
    name: typeof value.name === 'string' ? value.name : undefined
  }
}

function unwrapResponse(value: unknown) {
  const response = asRecord(value)
  return isRecord(response.data) ? response.data : response
}

export function normalizeAdminSettingsSnapshot(value: unknown): AdminSettingsSnapshot {
  const source = unwrapResponse(value)
  const defaults = normalizeAdminSettings(source.defaults, ADMIN_SETTINGS_FALLBACKS)
  const settings = normalizeAdminSettings(source.settings, defaults)
  const rawMeta = asRecord(source.meta)
  const rawVersion = source.version
  const version = typeof rawVersion === 'number' && Number.isInteger(rawVersion) && rawVersion >= 0 ? rawVersion : 0

  return {
    settings,
    defaults,
    capabilities: normalizeAdminSettingsCapabilities(source.capabilities),
    version,
    configured: booleanValue(source.configured, version > 0),
    updatedAt: stringValue(source.updated_at ?? source.updatedAt, '') || null,
    updatedBy: normalizeUpdatedBy(source.updated_by ?? source.updatedBy),
    meta: {
      adminCount: nullableInteger(rawMeta.admin_count ?? rawMeta.adminCount),
      appVersion: stringValue(rawMeta.app_version ?? rawMeta.appVersion, 'v1.0.0'),
      uptimeSeconds: nullableInteger(rawMeta.uptime_seconds ?? rawMeta.uptimeSeconds),
      memoryAllocBytes: nullableInteger(rawMeta.memory_alloc_bytes ?? rawMeta.memoryAllocBytes),
      goroutines: nullableInteger(rawMeta.goroutines),
      databaseStatus: stringValue(rawMeta.database_status ?? rawMeta.databaseStatus, 'unknown')
    }
  }
}

export function serializeAdminSettings(value: AdminSettings): AdminSettings {
  const normalized = normalizeAdminSettings(value)
  normalized.platform.systemName = normalized.platform.systemName.trim()
  normalized.platform.adminDisplayName = normalized.platform.adminDisplayName.trim()
  normalized.platform.supportEmail = normalized.platform.supportEmail.trim()
  normalized.security.ipAllowlist = Array.from(new Set(
    normalized.security.ipAllowlist.split(',').map(item => item.trim()).filter(Boolean)
  )).join(', ')
  return normalized
}

export function adminSettingsFingerprint(value: AdminSettings) {
  return JSON.stringify(serializeAdminSettings(value))
}

export interface AdminSettingsConflict {
  message: string
  current: AdminSettingsSnapshot | null
}

export function extractAdminSettingsConflict(error: unknown): AdminSettingsConflict | null {
  if (!isRecord(error)) return null
  const response = asRecord(error.response)
  const status = error.statusCode ?? error.status ?? response.status
  if (status !== 409) return null

  const payload = asRecord(error.data ?? response._data)
  const data = asRecord(payload.data)
  const currentValue = data.current ?? data.snapshot ?? payload.current
  const current = isRecord(currentValue) ? normalizeAdminSettingsSnapshot(currentValue) : null

  return {
    message: stringValue(payload.message, 'Cấu hình đã được quản trị viên khác cập nhật.'),
    current
  }
}

function normalizeSettingsResponse(value: unknown) {
  const response = value as ApiEnvelope<unknown>
  if (response?.success === false) {
    throw new Error(response.message || 'API Settings trả về lỗi.')
  }
  return normalizeAdminSettingsSnapshot(value)
}

export const AdminService = {
  async getDashboardStats() {
    return apiClient.get('/admin/dashboard/stats')
  },
  async getUsers(params?: any) {
    return apiClient.get('/admin/users', { query: params })
  },
  async getStudents(params?: any) {
    return apiClient.get('/admin/students', { query: params })
  },
  async getEnterprises(params?: any) {
    return apiClient.get('/admin/enterprises', { query: params })
  },
  async getRecentUsers(limit = 5) {
    return apiClient.get('/admin/users/recent', { query: { limit } })
  },
  async getPendingJobs(params?: any) {
    return apiClient.get('/admin/jobs', { query: params })
  },
  async updateUser(id: string | number, body: Record<string, any>) {
    return apiClient.put(`/admin/users/${id}`, body)
  },
  async updateUserStatus(id: string | number, status: 'ACTIVE' | 'INACTIVE' | 'BANNED') {
    return apiClient.put(`/admin/users/${id}/status`, { status })
  },
  async updateEnterpriseKYB(id: string | number, status: 'PENDING' | 'APPROVED' | 'REJECTED', rejectReason = '') {
    return apiClient.put(`/admin/enterprises/${id}/kyb`, { status, reject_reason: rejectReason })
  },
  async requestEnterpriseGPKD(id: string | number) {
    return apiClient.post(`/admin/enterprises/${id}/request-gpkd`)
  },
  async reviewJob(id: string | number, body: { status: 'APPROVED' | 'REJECTED'; reject_reason?: string }) {
    return apiClient.put(`/admin/jobs/${id}/review`, body)
  },
  async getReportsSummary(period = '30d') {
    return apiClient.get('/admin/reports/summary', { query: { period } })
  },
  async getCategories(params?: { q?: string }) {
    return apiClient.get('/admin/categories', { query: params })
  },
  async createCategory(body: { name: string }) {
    return apiClient.post('/admin/categories', body)
  },
  async updateCategory(id: string | number, body: { name: string }) {
    return apiClient.put(`/admin/categories/${id}`, body)
  },
  async deleteCategory(id: string | number) {
    return apiClient.delete(`/admin/categories/${id}`)
  },
  async getSettings(): Promise<AdminSettingsSnapshot> {
    const response = await apiClient.get('/admin/settings')
    return normalizeSettingsResponse(response)
  },
  async updateSettings(settings: AdminSettings, version: number): Promise<AdminSettingsSnapshot> {
    const response = await apiClient.put('/admin/settings', {
      settings: serializeAdminSettings(settings),
      version
    })
    return normalizeSettingsResponse(response)
  }
}
