import { computed } from 'vue'
import apiClient from '~/services/api'

export interface RuntimePlatformSettings {
  systemName: string
  adminDisplayName: string
  supportEmail: string
  timezone: string
  language: 'vi' | 'en'
}

type PlatformState = {
  platform: RuntimePlatformSettings
  version: number
}

type PlatformEnvelope = {
  data?: {
    platform?: Partial<RuntimePlatformSettings>
    version?: number
  }
}

const cacheKey = 'quickwork:platform-settings:v1'
const cacheTTL = 60_000
const fallback: RuntimePlatformSettings = {
  systemName: 'QuickWork',
  adminDisplayName: 'Admin',
  supportEmail: 'support@quickwork.vn',
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi'
}

function normalizePlatform(value?: Partial<RuntimePlatformSettings>): RuntimePlatformSettings {
  return {
    systemName: String(value?.systemName || fallback.systemName).trim() || fallback.systemName,
    adminDisplayName: String(value?.adminDisplayName || fallback.adminDisplayName).trim() || fallback.adminDisplayName,
    supportEmail: String(value?.supportEmail || fallback.supportEmail).trim() || fallback.supportEmail,
    timezone: String(value?.timezone || fallback.timezone).trim() || fallback.timezone,
    language: value?.language === 'en' ? 'en' : 'vi'
  }
}

export function usePlatformSettings() {
  const state = useState<PlatformState>('runtime-platform-settings', () => ({
    platform: { ...fallback },
    version: 0
  }))
  const loaded = useState<boolean>('runtime-platform-settings-loaded', () => false)
  const loading = useState<boolean>('runtime-platform-settings-loading', () => false)

  function cache(next: PlatformState) {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        expiresAt: Date.now() + cacheTTL,
        state: next
      }))
    } catch {
      // Browser storage is only a quota-saving cache; API data remains authoritative.
    }
  }

  function applyPlatformSettings(platform: Partial<RuntimePlatformSettings>, version = state.value.version) {
    state.value = {
      platform: normalizePlatform(platform),
      version: Number.isFinite(version) ? Number(version) : 0
    }
    loaded.value = true
    cache(state.value)
  }

  function restoreCache() {
    if (!import.meta.client) return false
    try {
      const parsed = JSON.parse(sessionStorage.getItem(cacheKey) || '{}') as {
        expiresAt?: number
        state?: PlatformState
      }
      if (!parsed.state || Number(parsed.expiresAt) <= Date.now()) return false
      applyPlatformSettings(parsed.state.platform, parsed.state.version)
      return true
    } catch {
      return false
    }
  }

  async function loadPlatformSettings() {
    if (!import.meta.client || loaded.value || loading.value) return
    if (restoreCache()) return

    loading.value = true
    try {
      const response = await apiClient.get<PlatformEnvelope>('/platform/settings', { auth: false })
      applyPlatformSettings(response?.data?.platform || fallback, Number(response?.data?.version || 0))
    } catch {
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    platform: computed(() => state.value.platform),
    systemName: computed(() => state.value.platform.systemName),
    adminDisplayName: computed(() => state.value.platform.adminDisplayName),
    supportEmail: computed(() => state.value.platform.supportEmail),
    version: computed(() => state.value.version),
    loadPlatformSettings,
    applyPlatformSettings
  }
}
