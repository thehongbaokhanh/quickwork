const ENTERPRISE_UI_STORAGE_KEY = 'quickwork:enterprise-ui'

type EnterpriseUiState = {
  sidebarCollapsed: boolean
  applicantGroupOpen: boolean
}

const defaults: EnterpriseUiState = {
  sidebarCollapsed: false,
  applicantGroupOpen: false
}

export function useEnterpriseUiState() {
  const sidebarCollapsed = useState('enterprise-ui:sidebar-collapsed', () => defaults.sidebarCollapsed)
  const applicantGroupOpen = useState('enterprise-ui:applicant-group-open', () => defaults.applicantGroupOpen)
  const restored = useState('enterprise-ui:restored', () => false)

  function restore() {
    if (!import.meta.client || restored.value) return
    restored.value = true
    try {
      const stored = JSON.parse(localStorage.getItem(ENTERPRISE_UI_STORAGE_KEY) || '{}')
      sidebarCollapsed.value = typeof stored.sidebarCollapsed === 'boolean' ? stored.sidebarCollapsed : defaults.sidebarCollapsed
      applicantGroupOpen.value = typeof stored.applicantGroupOpen === 'boolean' ? stored.applicantGroupOpen : defaults.applicantGroupOpen
    } catch {
      // Storage may be unavailable or stale; defaults remain usable.
    }
  }

  function persist() {
    if (!import.meta.client || !restored.value) return
    try {
      localStorage.setItem(ENTERPRISE_UI_STORAGE_KEY, JSON.stringify({
        sidebarCollapsed: sidebarCollapsed.value,
        applicantGroupOpen: applicantGroupOpen.value
      }))
    } catch {
      // Persistence is optional; navigation remains functional in memory.
    }
  }

  return { sidebarCollapsed, applicantGroupOpen, restore, persist }
}
