<template>
  <div class="space-y-3 pb-3">
    <header>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Trung tâm cấu hình</p>
      <h1 class="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Cài đặt Hệ thống</h1>
      <p class="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">Cấu hình và kiểm soát các thiết lập cốt lõi của hệ thống QuickWork.</p>
    </header>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <div class="flex min-w-max gap-1" role="tablist" aria-label="Nhóm cài đặt">
        <button v-for="tab in tabs" :key="tab.key" type="button" role="tab" :aria-selected="activeTab === tab.key" class="relative min-w-24 rounded-lg px-4 py-2.5 text-xs font-black transition sm:min-w-28" :class="activeTab === tab.key ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'" @click="activeTab = tab.key">
          {{ tab.label }}<span v-if="activeTab === tab.key" class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-sky-600" />
        </button>
      </div>
    </div>

    <div v-if="settingsLoading" class="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-800">
      <strong>Đang tải cấu hình dùng chung...</strong> Tất cả trường sẽ được mở sau khi snapshot hoàn tất.
    </div>
    <div v-else-if="loadError" class="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <span><strong>Không tải được cấu hình:</strong> {{ loadError }} Các trường đã được khóa để tránh ghi đè dữ liệu.</span>
      <button type="button" class="secondary-action shrink-0" @click="reloadPage">Tải lại trang</button>
    </div>
    <div v-else class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
      <strong>Cấu hình dùng chung:</strong> dữ liệu được tải một lần từ API và chỉ gửi khi bạn bấm Lưu hoặc Khôi phục mặc định.
      <span class="font-bold">Phiên bản {{ version }}{{ isDirty ? ' · Có thay đổi chưa lưu' : '' }}</span>
    </div>

    <div v-if="conflict" class="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs leading-5 text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <strong>Xung đột phiên bản:</strong> {{ conflict.message }}
        <span v-if="conflict.current" class="block">Chọn bản mới nhất hoặc giữ bản đang chỉnh rồi lưu lại thủ công.</span>
        <span v-else class="block">API không trả snapshot hiện tại; hãy tải lại trang trước khi tiếp tục.</span>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">
        <button v-if="conflict.current" type="button" class="secondary-action" @click="useServerVersion">Dùng bản mới nhất</button>
        <button v-if="conflict.current && conflictDraft" type="button" class="primary-action" @click="keepLocalDraft">Giữ bản đang chỉnh</button>
        <button v-if="!conflict.current" type="button" class="secondary-action" @click="reloadPage">Tải lại trang</button>
      </div>
    </div>

    <div :class="settingsGridClass" class="grid items-stretch gap-3">
      <div v-if="activeTab === 'operations'" class="grid items-stretch gap-3 lg:grid-cols-2">
          <section class="settings-card settings-card-container min-w-0 sm:p-5">
            <CardHeader icon="uil:shield-check" title="Kiểm duyệt nội dung" description="Thiết lập quy trình duyệt tin hiện tại." />
            <div class="mt-5 space-y-4">
              <div>
                <p class="settings-label">Chế độ duyệt tin đăng</p>
                <div class="mt-2 flex flex-wrap gap-5">
                  <label v-for="mode in moderationModes" :key="mode.value" class="flex items-center gap-2 text-sm font-semibold" :class="settingDisabled('moderation', 'mode') ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-700'">
                    <input v-model="settings.moderation.mode" type="radio" :value="mode.value" :disabled="settingDisabled('moderation', 'mode')" class="h-4 w-4 accent-sky-600 disabled:cursor-not-allowed" />{{ mode.label }}
                  </label>
                </div>
                <p v-if="capabilityHint('moderation', 'mode')" class="mt-1 text-[11px] font-semibold leading-4 text-amber-600">{{ capabilityHint('moderation', 'mode') }}</p>
              </div>
              <div class="settings-two-column-grid grid gap-3">
                <Field label="Thời gian hết hạn chờ duyệt" :hint="capabilityHint('moderation', 'pendingHours')"><UiScrollSelect v-model="settings.moderation.pendingHours" :options="pendingHourOptions" :disabled="settingDisabled('moderation', 'pendingHours')" aria-label="Chọn thời gian hết hạn chờ duyệt" size="sm" /></Field>
                <Field label="Giới hạn số tin nháp" :error="errors.draftLimit" :hint="capabilityHint('moderation', 'draftLimit')"><div class="relative"><input v-model.number="settings.moderation.draftLimit" type="number" min="1" :disabled="settingDisabled('moderation', 'draftLimit')" class="settings-input pr-20" /><span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">tin/người</span></div></Field>
              </div>
              <div class="border-t border-slate-100 pt-4">
                <ToggleRow label="Ẩn tin bị từ chối khỏi public listing" :checked="settings.moderation.hideRejected" :disabled="settingDisabled('moderation', 'hideRejected')" :hint="capabilityHint('moderation', 'hideRejected')" @toggle="settings.moderation.hideRejected = !settings.moderation.hideRejected" />
              </div>
            </div>
          </section>

          <section class="settings-card min-w-0 sm:p-5">
            <CardHeader icon="uil:bell" title="Thông báo hệ thống" description="Cấu hình cảnh báo và thông báo hệ thống." />
            <div class="mt-4 divide-y divide-slate-100">
              <ToggleRow v-for="item in notificationOptions" :key="item.key" :label="item.label" :checked="settings.notifications[item.key]" :disabled="settingDisabled('notifications', item.key)" :hint="capabilityHint('notifications', item.key)" class="py-3" @toggle="settings.notifications[item.key] = !settings.notifications[item.key]" />
            </div>
          </section>
      </div>

      <div v-if="showLeftColumn" :class="{ 'h-full': activeTab !== 'overview' }" class="min-w-0 space-y-3">
        <section v-if="showSection('platform')" :class="{ 'h-full': activeTab === 'platform' }" class="settings-card settings-card-container">
          <CardHeader icon="uil:building" title="Thông tin nền tảng" description="Nhận diện và thiết lập hiển thị mặc định." />
          <div class="platform-form-grid mt-4 grid gap-3">
            <Field label="Tên hệ thống" :error="errors.systemName" :hint="capabilityHint('platform', 'systemName')"><input v-model.trim="settings.platform.systemName" :disabled="settingDisabled('platform', 'systemName')" class="settings-input" /></Field>
            <Field label="Tên hiển thị Admin Center" :hint="capabilityHint('platform', 'adminDisplayName')"><input v-model.trim="settings.platform.adminDisplayName" :disabled="settingDisabled('platform', 'adminDisplayName')" class="settings-input" /></Field>
            <Field label="Email hỗ trợ" :error="errors.supportEmail" :hint="capabilityHint('platform', 'supportEmail')"><input v-model.trim="settings.platform.supportEmail" type="email" :disabled="settingDisabled('platform', 'supportEmail')" class="settings-input" /></Field>
            <Field label="Múi giờ" :hint="capabilityHint('platform', 'timezone')"><UiScrollSelect v-model="settings.platform.timezone" :options="timezoneOptions" :disabled="settingDisabled('platform', 'timezone')" aria-label="Chọn múi giờ quốc tế" searchable filter-local search-placeholder="Tìm theo thành phố hoặc mã IANA..." :min-search-length="0" size="sm" /></Field>
            <Field label="Ngôn ngữ mặc định" :hint="capabilityHint('platform', 'language')"><UiScrollSelect v-model="settings.platform.language" :options="languageOptions" :disabled="settingDisabled('platform', 'language')" aria-label="Chọn ngôn ngữ mặc định" size="sm" /></Field>
          </div>
        </section>

        <section v-if="showSection('moderation')" class="settings-card settings-card-container">
          <CardHeader icon="uil:shield-check" title="Kiểm duyệt nội dung" description="Cấu hình dùng chung cho quy trình duyệt tin hiện tại." />
          <div class="mt-4 space-y-3">
            <div><p class="settings-label">Chế độ duyệt tin đăng</p><div class="mt-2 flex flex-wrap gap-4"><label v-for="mode in moderationModes" :key="mode.value" class="flex items-center gap-2 text-sm font-semibold" :class="settingDisabled('moderation', 'mode') ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-700'"><input v-model="settings.moderation.mode" type="radio" :value="mode.value" :disabled="settingDisabled('moderation', 'mode')" class="h-4 w-4 accent-sky-600 disabled:cursor-not-allowed" />{{ mode.label }}</label></div><p v-if="capabilityHint('moderation', 'mode')" class="mt-1 text-[11px] font-semibold leading-4 text-amber-600">{{ capabilityHint('moderation', 'mode') }}</p></div>
            <div class="settings-two-column-grid grid gap-3">
              <Field label="Thời gian hết hạn chờ duyệt" :hint="capabilityHint('moderation', 'pendingHours')"><UiScrollSelect v-model="settings.moderation.pendingHours" :options="pendingHourOptions" :disabled="settingDisabled('moderation', 'pendingHours')" aria-label="Chọn thời gian hết hạn chờ duyệt" size="sm" /></Field>
              <Field label="Giới hạn số tin nháp" :error="errors.draftLimit" :hint="capabilityHint('moderation', 'draftLimit')"><div class="relative"><input v-model.number="settings.moderation.draftLimit" type="number" min="1" :disabled="settingDisabled('moderation', 'draftLimit')" class="settings-input pr-20" /><span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">tin/người</span></div></Field>
            </div>
            <ToggleRow label="Ẩn tin bị từ chối khỏi public listing" :checked="settings.moderation.hideRejected" :disabled="settingDisabled('moderation', 'hideRejected')" :hint="capabilityHint('moderation', 'hideRejected')" @toggle="settings.moderation.hideRejected = !settings.moderation.hideRejected" />
          </div>
        </section>

        <section v-if="activeTab === 'security'" class="settings-card settings-card-container h-full">
          <CardHeader icon="uil:lock-access" title="Bảo mật & truy cập" description="Cấu hình dùng chung; không hiển thị hoặc thay đổi secret hệ thống." />
          <div class="mt-4 space-y-3">
            <ToggleRow label="Yêu cầu mật khẩu mạnh" :checked="settings.security.strongPassword" :disabled="settingDisabled('security', 'strongPassword')" :hint="capabilityHint('security', 'strongPassword')" @toggle="settings.security.strongPassword = !settings.security.strongPassword" />
            <ToggleRow label="Xác thực 2 bước cho admin" :checked="settings.security.twoFactorAdmin" :disabled="settingDisabled('security', 'twoFactorAdmin')" :hint="capabilityHint('security', 'twoFactorAdmin')" @toggle="settings.security.twoFactorAdmin = !settings.security.twoFactorAdmin" />
            <div class="settings-two-column-grid grid gap-3">
              <Field label="Thời gian hết hạn phiên" :hint="capabilityHint('security', 'sessionMinutes') || 'Áp dụng cho token được cấp từ lần đăng nhập tiếp theo.'"><UiScrollSelect v-model="settings.security.sessionMinutes" :options="sessionMinuteOptions" :disabled="settingDisabled('security', 'sessionMinutes')" aria-label="Chọn thời gian hết hạn phiên" size="sm" /></Field>
              <Field label="Giới hạn đăng nhập sai" :error="errors.loginAttempts" :hint="capabilityHint('security', 'loginAttempts') || 'Khóa đăng nhập 15 phút; bộ đếm hiện lưu theo tiến trình backend.'"><input v-model.number="settings.security.loginAttempts" type="number" min="1" max="20" :disabled="settingDisabled('security', 'loginAttempts')" class="settings-input" /></Field>
            </div>
            <Field label="Allowlist IP" :error="errors.ipAllowlist" :hint="capabilityHint('security', 'ipAllowlist')"><textarea v-model.trim="settings.security.ipAllowlist" rows="2" :disabled="settingDisabled('security', 'ipAllowlist')" class="settings-input min-h-20 py-3" placeholder="103.21.244.0/24, 203.113.1.5" /></Field>
          </div>
        </section>
      </div>

      <div v-if="showCenterColumn" :class="{ 'h-full': activeTab !== 'overview' }" class="min-w-0 space-y-3">
        <section v-if="showSection('platform')" :class="{ 'h-full': activeTab === 'platform' }" class="settings-card flex flex-col">
          <CardHeader icon="uil:user-check" title="Đăng ký & xác minh" description="Capability từ API cho biết tùy chọn nào đang được backend áp dụng." />
          <div class="mt-4 flex flex-1 flex-col justify-center divide-y divide-slate-100"><ToggleRow v-for="item in registrationOptions" :key="item.key" :label="item.label" :checked="settings.registration[item.key]" :disabled="settingDisabled('registration', item.key)" :hint="capabilityHint('registration', item.key)" class="min-h-12 py-3" @toggle="settings.registration[item.key] = !settings.registration[item.key]" /></div>
        </section>

        <section v-if="showSection('notifications')" class="settings-card">
          <CardHeader icon="uil:bell" title="Thông báo hệ thống" description="Capability từ API cho biết kênh nào đang được backend hỗ trợ." />
          <div class="mt-3 divide-y divide-slate-100"><ToggleRow v-for="item in notificationOptions" :key="item.key" :label="item.label" :checked="settings.notifications[item.key]" :disabled="settingDisabled('notifications', item.key)" :hint="capabilityHint('notifications', item.key)" class="py-2" @toggle="settings.notifications[item.key] = !settings.notifications[item.key]" /></div>
        </section>

        <section v-if="showSection('security')" :class="{ 'h-full': activeTab === 'security' }" class="settings-card flex flex-col">
          <CardHeader icon="uil:database" title="Sao lưu & nhật ký" description="Hạ tầng hiện chưa cung cấp API backup hoặc log cho Admin Center." />
          <div class="flex flex-1 flex-col justify-center">
            <dl class="mt-4 grid gap-2 text-sm sm:grid-cols-2"><div class="flex min-h-20 flex-col justify-center rounded-xl bg-slate-50 p-3"><dt class="text-xs font-semibold text-slate-400">Lần sao lưu gần nhất</dt><dd class="mt-1 font-bold text-slate-700">Không khả dụng</dd></div><div class="flex min-h-20 flex-col justify-center rounded-xl bg-slate-50 p-3"><dt class="text-xs font-semibold text-slate-400">Dung lượng nhật ký</dt><dd class="mt-1 font-bold text-slate-700">Không khả dụng</dd></div></dl>
            <ToggleRow class="min-h-12 border-b border-slate-100 py-3" label="Tự động sao lưu hằng ngày" :checked="settings.backup.daily" :disabled="settingDisabled('backup', 'daily')" :hint="capabilityHint('backup', 'daily')" @toggle="settings.backup.daily = !settings.backup.daily" />
            <div class="mt-4 grid gap-2 sm:grid-cols-2"><button class="secondary-action w-full" type="button" disabled title="Backend chưa cung cấp API tạo bản sao lưu"><Icon name="uil:cloud-upload" class="h-4 w-4" /> Tạo bản sao lưu</button><button class="secondary-action w-full" type="button" disabled title="Backend chưa cung cấp API đọc nhật ký"><Icon name="uil:file-search-alt" class="h-4 w-4" /> Xem nhật ký</button></div>
          </div>
        </section>
      </div>

      <aside v-if="activeTab === 'overview'" class="min-w-0 space-y-3">
        <section class="settings-card">
          <CardHeader icon="uil:shield-check" title="Trạng thái hệ thống" description="Tình trạng hoạt động và thông tin phiên bản hệ thống." />
          <div class="mt-3 rounded-xl border p-3" :class="systemStatus === 'online' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'"><p class="flex items-center gap-2 text-sm font-black" :class="systemStatus === 'online' ? 'text-emerald-700' : 'text-amber-700'"><Icon :name="systemStatus === 'online' ? 'uil:check-circle' : 'uil:exclamation-triangle'" class="h-5 w-5" />{{ systemStatus === 'online' ? 'Ổn định' : 'Không xác định' }}</p><p class="mt-1 text-xs leading-5 text-slate-500">{{ systemStatus === 'online' ? 'API quản trị đang phản hồi bình thường.' : 'Không thể xác nhận trạng thái API quản trị.' }}</p></div>
          <dl class="mt-3 divide-y divide-slate-100 border-t border-slate-100 text-xs"><div class="flex items-center justify-between gap-3 py-2"><dt class="font-semibold text-slate-500">Phiên bản hệ thống</dt><dd class="font-black text-slate-900">{{ appVersion }}</dd></div><div class="flex items-center justify-between gap-3 py-2"><dt class="font-semibold text-slate-500">Phiên bản cấu hình</dt><dd class="font-black text-slate-900">{{ settingsLoaded ? version : 'Không khả dụng' }}</dd></div><div class="flex items-center justify-between gap-3 py-2"><dt class="font-semibold text-slate-500">Cập nhật gần nhất</dt><dd class="text-right font-bold text-slate-700">{{ settingsLoading ? '...' : lastUpdatedLabel }}</dd></div><div class="flex items-center justify-between gap-3 py-2"><dt class="font-semibold text-slate-500">Tổng tài khoản admin</dt><dd class="font-black text-slate-950">{{ adminCountLoading ? '...' : adminCount ?? 'Không khả dụng' }}</dd></div></dl>
        </section>

        <section class="settings-card">
          <CardHeader icon="uil:server" title="Tài nguyên hệ thống" description="Metrics gọn nhẹ được trả về cùng snapshot Settings, không cần polling." />
          <div class="mt-3 space-y-1.5"><div v-for="resource in resources" :key="resource.label" class="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span class="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-600"><Icon :name="resource.icon" class="h-4 w-4 shrink-0 text-slate-400" /><span class="truncate">{{ resource.label }}</span></span><span class="shrink-0 text-[11px] font-bold text-slate-600">{{ settingsLoading ? '...' : resource.value }}</span></div></div>
        </section>
      </aside>
    </div>

    <footer class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-slate-500">
        <span v-if="settingsLoading">Đang tải cấu hình dùng chung...</span>
        <span v-else-if="loadError">Không thể lưu cho đến khi tải lại trang thành công.</span>
        <span v-else-if="saving">Đang gửi một yêu cầu cập nhật...</span>
        <span v-else-if="isDirty" class="font-bold text-amber-700">Có thay đổi chưa lưu.</span>
        <span v-else>{{ configured ? `Đã cập nhật ${lastUpdatedLabel}` : 'Đang dùng cấu hình mặc định từ hệ thống.' }}<template v-if="updatedByLabel"> · bởi {{ updatedByLabel }}</template></span>
      </p>
      <div class="flex flex-wrap gap-2"><button class="secondary-action" type="button" :disabled="!canReset" @click="resetSettings"><Icon name="uil:redo" class="h-4 w-4" /> Khôi phục mặc định</button><button class="secondary-action" type="button" :disabled="controlsDisabled" @click="checkConfiguration"><Icon name="uil:shield-check" class="h-4 w-4" /> Kiểm tra cấu hình</button><button class="primary-action" type="button" :disabled="!isDirty || saving || !settingsLoaded || Boolean(conflict)" @click="saveSettings"><Icon name="uil:save" class="h-4 w-4" /> {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}</button></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, resolveComponent } from 'vue'
import UiScrollSelect from '~/components/ui/ScrollSelect.vue'
import {
  ADMIN_SETTINGS_FALLBACKS,
  AdminService,
  adminSettingsFingerprint,
  extractAdminSettingsConflict,
  type AdminSettings,
  type AdminSettingsCapabilities,
  type AdminSettingsCapabilityState,
  type AdminSettingsConflict,
  type AdminSettingsMeta,
  type AdminSettingsSnapshot,
  type AdminSettingsUpdatedBy
} from '~/services/admin.service'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

type TabKey = 'overview' | 'platform' | 'operations' | 'security'
type SettingsSection = keyof AdminSettingsCapabilities

const legacyStorageKey = 'quickwork:admin-settings-local'
const toast = useToast()
const { applyPlatformSettings } = usePlatformSettings()
const activeTab = ref<TabKey>('overview')
const settingsLoading = ref(true)
const settingsLoaded = ref(false)
const loadAttempted = ref(false)
const saving = ref(false)
const loadError = ref('')
const errors = ref<Record<string, string>>({})
const version = ref(0)
const configured = ref(false)
const updatedAt = ref<string | null>(null)
const updatedBy = ref<AdminSettingsUpdatedBy>(null)
const capabilities = ref<AdminSettingsCapabilities | null>(null)
const conflict = ref<AdminSettingsConflict | null>(null)
const conflictDraft = ref<AdminSettings | null>(null)
const meta = ref<AdminSettingsMeta>({
  adminCount: null,
  appVersion: 'v1.0.0',
  uptimeSeconds: null,
  memoryAllocBytes: null,
  goroutines: null,
  databaseStatus: 'unknown'
})

function cloneSettings(value: AdminSettings): AdminSettings {
  return JSON.parse(JSON.stringify(value)) as AdminSettings
}

const settings = ref<AdminSettings>(cloneSettings(ADMIN_SETTINGS_FALLBACKS))
const baselineSettings = ref<AdminSettings>(cloneSettings(ADMIN_SETTINGS_FALLBACKS))
const defaultSettings = ref<AdminSettings>(cloneSettings(ADMIN_SETTINGS_FALLBACKS))

const tabs = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'platform', label: 'Nền tảng' },
  { key: 'operations', label: 'Vận hành' },
  { key: 'security', label: 'Bảo mật' }
] as const
const moderationModes = [
  { value: 'manual', label: 'Thủ công' },
  { value: 'automatic', label: 'Tự động' }
] as const
const registrationOptions: Array<{ key: keyof AdminSettings['registration']; label: string }> = [
  { key: 'student', label: 'Cho phép đăng ký Học viên' },
  { key: 'enterprise', label: 'Cho phép đăng ký Doanh nghiệp' },
  { key: 'verifyEmail', label: 'Bắt buộc xác minh email' },
  { key: 'requireKyb', label: 'Bắt buộc KYB trước khi đăng tin' }
]
const notificationOptions: Array<{ key: keyof AdminSettings['notifications']; label: string }> = [
  { key: 'criticalEmail', label: 'Gửi email cảnh báo quan trọng' },
  { key: 'inApp', label: 'Thông báo trong ứng dụng' },
  { key: 'dailyDigest', label: 'Báo cáo tổng hợp hằng ngày (email)' },
  { key: 'kybAlert', label: 'Cảnh báo khi có doanh nghiệp chờ KYB' },
  { key: 'reportedJob', label: 'Cảnh báo khi có tin bị báo cáo' }
]
const languageOptions = [{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }]
const pendingHourOptions = [{ value: 24, label: '24 giờ' }, { value: 48, label: '48 giờ' }, { value: 72, label: '72 giờ' }]
const sessionMinuteOptions = [{ value: 15, label: '15 phút' }, { value: 30, label: '30 phút' }, { value: 60, label: '60 phút' }]

type IntlWithTimeZones = typeof Intl & { supportedValuesOf?: (key: 'timeZone') => string[] }
const fallbackTimezones = [
  'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver',
  'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'Atlantic/Azores',
  'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Athens', 'Africa/Cairo',
  'Europe/Moscow', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka',
  'Asia/Bangkok', 'Asia/Ho_Chi_Minh', 'Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo',
  'Australia/Adelaide', 'Australia/Sydney', 'Pacific/Noumea', 'Pacific/Auckland'
]

function timezoneOffset(zone: string) {
  try {
    const value = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
      .formatToParts(new Date())
      .find(part => part.type === 'timeZoneName')?.value || 'GMT+00:00'
    const match = value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
    if (!match) return { label: 'UTC+00:00', minutes: 0 }
    const minutes = (Number(match[2]) * 60 + Number(match[3] || 0)) * (match[1] === '-' ? -1 : 1)
    const sign = minutes < 0 ? '-' : '+'
    const absolute = Math.abs(minutes)
    return { label: `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`, minutes }
  } catch {
    return { label: 'UTC+00:00', minutes: 0 }
  }
}

const timezoneOptions = Array.from(new Set([
  ...((Intl as IntlWithTimeZones).supportedValuesOf?.('timeZone') || []),
  ...fallbackTimezones
]))
  .map((zone) => {
    const offset = timezoneOffset(zone)
    return { value: zone, label: `(${offset.label}) ${zone.replaceAll('_', ' ')}`, offset: offset.minutes }
  })
  .sort((left, right) => left.offset - right.offset || left.label.localeCompare(right.label))
  .map(({ value, label }) => ({ value, label }))

const showLeftColumn = computed(() => activeTab.value === 'overview' || ['platform', 'security'].includes(activeTab.value))
const showCenterColumn = computed(() => activeTab.value === 'overview' || ['platform', 'security'].includes(activeTab.value))
const settingsGridClass = computed(() => activeTab.value === 'overview' ? 'xl:grid-cols-3' : ['platform', 'security'].includes(activeTab.value) ? 'xl:grid-cols-2' : 'grid-cols-1')
const controlsDisabled = computed(() => settingsLoading.value || !settingsLoaded.value || saving.value || Boolean(conflict.value))
const isDirty = computed(() => settingsLoaded.value && adminSettingsFingerprint(settings.value) !== adminSettingsFingerprint(baselineSettings.value))
const canReset = computed(() => settingsLoaded.value && !saving.value && !conflict.value && adminSettingsFingerprint(settings.value) !== adminSettingsFingerprint(defaultSettings.value))
const adminCount = computed(() => meta.value.adminCount)
const adminCountLoading = computed(() => settingsLoading.value)
const appVersion = computed(() => meta.value.appVersion || 'Không khả dụng')
const systemStatus = computed<'online' | 'unknown'>(() => settingsLoaded.value && !loadError.value ? 'online' : 'unknown')
const lastUpdatedLabel = computed(() => {
  if (!updatedAt.value) return configured.value ? 'Không có thời gian cập nhật' : 'Đang dùng cấu hình mặc định'
  const date = new Date(updatedAt.value)
  return Number.isNaN(date.getTime()) ? updatedAt.value : date.toLocaleString('vi-VN')
})
const updatedByLabel = computed(() => {
  const value = updatedBy.value
  if (value === null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return value.name || value.email || (value.id !== undefined ? `#${value.id}` : '')
})
const resources = computed(() => [
  { label: 'Bộ nhớ Go', icon: 'uil:server', value: formatBytes(meta.value.memoryAllocBytes) },
  { label: 'Goroutines', icon: 'uil:processor', value: formatInteger(meta.value.goroutines) },
  { label: 'Thời gian hoạt động', icon: 'uil:clock', value: formatUptime(meta.value.uptimeSeconds) },
  { label: 'Cơ sở dữ liệu', icon: 'uil:database', value: formatDatabaseStatus(meta.value.databaseStatus) }
])

function showSection(key: string) {
  return activeTab.value === 'overview' || activeTab.value === key
}

function capabilityState(section: SettingsSection, key: string): AdminSettingsCapabilityState {
  const group = capabilities.value?.[section] as Record<string, AdminSettingsCapabilityState> | undefined
  return group?.[key] || 'unavailable'
}

function settingDisabled(section: SettingsSection, key: string) {
  const state = capabilityState(section, key)
  return controlsDisabled.value || state === 'unavailable' || state === 'fixed'
}

function capabilityHint(section: SettingsSection, key: string) {
  const state = capabilityState(section, key)
  if (state === 'stored_only') return 'Được lưu dùng chung, nhưng backend chưa áp dụng thiết lập này.'
  if (state === 'unavailable') return settingsLoaded.value ? 'Backend chưa hỗ trợ; thiết lập này được giữ ở trạng thái tắt.' : ''
  if (state === 'fixed') return 'Giá trị này được hệ thống cố định và không thể thay đổi.'
  return ''
}

function formatBytes(value: number | null) {
  if (value === null) return 'Không khả dụng'
  if (value < 1024) return `${value} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let size = value / 1024
  let unit = units[0]
  for (let index = 1; index < units.length && size >= 1024; index += 1) {
    size /= 1024
    unit = units[index]
  }
  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${unit}`
}

function formatInteger(value: number | null) {
  return value === null ? 'Không khả dụng' : value.toLocaleString('vi-VN')
}

function formatUptime(value: number | null) {
  if (value === null) return 'Không khả dụng'
  const days = Math.floor(value / 86400)
  const hours = Math.floor((value % 86400) / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  if (days) return `${days} ngày ${hours} giờ`
  if (hours) return `${hours} giờ ${minutes} phút`
  return `${minutes} phút`
}

function formatDatabaseStatus(value: string) {
  const normalized = value.trim().toLowerCase()
  if (['ok', 'online', 'healthy', 'connected', 'up'].includes(normalized)) return 'Đang kết nối'
  if (!normalized || normalized === 'unknown') return 'Không xác định'
  return value
}

const CardHeader = defineComponent({
  props: {
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' }
  },
  setup(props) {
    return () => h('div', { class: 'flex min-w-0 items-start gap-3' }, [
      h('span', { class: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100' }, [
        h(resolveComponent('Icon') as any, { name: props.icon, class: 'h-5 w-5' })
      ]),
      h('div', { class: 'min-w-0' }, [
        h('h2', { class: 'text-sm font-black leading-5 text-slate-950' }, props.title),
        h('p', { class: 'mt-0.5 text-xs leading-4 text-slate-500' }, props.description)
      ])
    ])
  }
})
const Field = defineComponent({
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    error: { type: String, default: '' },
    hint: { type: String, default: '' }
  },
  setup(props, { slots, attrs }) {
    return () => h('label', { class: attrs.class }, [
      h('span', { class: 'settings-label' }, props.label),
      h('div', { class: 'mt-2' }, slots.default?.()),
      props.hint ? h('span', { class: 'mt-1 block text-[11px] font-semibold leading-4 text-amber-600' }, props.hint) : null,
      props.error ? h('span', { class: 'mt-1 block text-xs font-semibold text-rose-600' }, props.error) : null
    ])
  }
})
const ToggleRow = defineComponent({
  emits: ['toggle'],
  props: {
    label: { type: String, required: true },
    checked: { type: Boolean, required: true },
    disabled: { type: Boolean, default: false },
    hint: { type: String, default: '' }
  },
  setup(props, { emit, attrs }) {
    return () => h('div', { class: ['flex items-start justify-between gap-3', attrs.class] }, [
      h('span', { class: ['min-w-0 text-xs font-semibold leading-5', props.disabled ? 'text-slate-400' : 'text-slate-700'] }, [
        h('span', { class: 'block' }, props.label),
        props.hint ? h('span', { class: 'mt-0.5 block text-[11px] font-semibold leading-4 text-amber-600' }, props.hint) : null
      ]),
      h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': props.checked,
        'aria-disabled': props.disabled,
        disabled: props.disabled,
        title: props.hint || undefined,
        class: [
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition',
          props.checked ? 'bg-sky-600' : 'bg-slate-300',
          props.disabled ? 'cursor-not-allowed opacity-50' : ''
        ],
        onClick: () => {
          if (!props.disabled) emit('toggle')
        }
      }, [
        h('span', { class: ['absolute top-1 h-3 w-3 rounded-full bg-white shadow transition', props.checked ? 'left-5' : 'left-1'] })
      ])
    ])
  }
})

function validIpOrCidr(value: string) {
  const [address, mask, ...extra] = value.split('/')
  if (extra.length || !address) return false
  const validIpv4 = (candidate: string) => {
    const octets = candidate.split('.')
    return octets.length === 4
      && octets.every(octet => /^(?:0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255)
  }
  const validIpv6 = (candidate: string) => {
    if (!candidate.includes(':') || candidate.includes('%') || candidate.includes('[') || candidate.includes(']')) return false
    const compressed = candidate.split('::')
    if (compressed.length > 2) return false

    const unitCount = (section: string) => {
      if (!section) return 0
      const units = section.split(':')
      let count = 0
      for (let index = 0; index < units.length; index += 1) {
        const unit = units[index]
        if (!unit) return -1
        if (unit.includes('.')) {
          if (index !== units.length - 1 || !validIpv4(unit)) return -1
          count += 2
        } else {
          if (!/^[0-9a-fA-F]{1,4}$/.test(unit)) return -1
          count += 1
        }
      }
      return count
    }

    const left = unitCount(compressed[0] || '')
    const right = unitCount(compressed[1] || '')
    if (left < 0 || right < 0) return false
    const total = left + right
    return compressed.length === 2 ? total < 8 : total === 8
  }

  const ipv4 = validIpv4(address)
  if (!ipv4 && !validIpv6(address)) return false
  if (mask === undefined) return true
  if (!/^(?:0|[1-9]\d{0,2})$/.test(mask)) return false
  return Number(mask) <= (ipv4 ? 32 : 128)
}

function validate(candidate = settings.value) {
  const next: Record<string, string> = {}
  if (!candidate.platform.systemName.trim()) next.systemName = 'Tên hệ thống là bắt buộc.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.platform.supportEmail)) next.supportEmail = 'Email hỗ trợ không hợp lệ.'
  if (!Number.isInteger(Number(candidate.moderation.draftLimit)) || Number(candidate.moderation.draftLimit) < 1) next.draftLimit = 'Giới hạn phải là số nguyên dương.'
  if (!Number.isInteger(Number(candidate.security.loginAttempts)) || Number(candidate.security.loginAttempts) < 1 || Number(candidate.security.loginAttempts) > 20) next.loginAttempts = 'Nhập số nguyên từ 1 đến 20.'
  const ips = candidate.security.ipAllowlist.split(',').map(value => value.trim()).filter(Boolean)
  if (ips.some(value => !validIpOrCidr(value))) next.ipAllowlist = 'Nhập IP/CIDR hợp lệ, phân tách bằng dấu phẩy.'
  errors.value = next
  return !Object.keys(next).length
}

function clearLegacySettings() {
  if (!import.meta.client) return
  try {
    localStorage.removeItem(legacyStorageKey)
  } catch {
    // Storage có thể bị trình duyệt chặn; snapshot server vẫn là nguồn dữ liệu chính.
  }
}

function applySnapshot(snapshot: AdminSettingsSnapshot) {
  settings.value = cloneSettings(snapshot.settings)
  baselineSettings.value = cloneSettings(snapshot.settings)
  defaultSettings.value = cloneSettings(snapshot.defaults)
  capabilities.value = snapshot.capabilities
  version.value = snapshot.version
  configured.value = snapshot.configured
  updatedAt.value = snapshot.updatedAt
  updatedBy.value = snapshot.updatedBy
  meta.value = snapshot.meta
  settingsLoaded.value = true
  loadError.value = ''
  errors.value = {}
  conflict.value = null
  conflictDraft.value = null
  applyPlatformSettings(snapshot.settings.platform, snapshot.version)
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { message?: unknown; data?: { message?: unknown }; response?: { _data?: { message?: unknown } } }
    const message = candidate.data?.message ?? candidate.response?._data?.message ?? candidate.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return 'Không thể kết nối API Settings.'
}

async function loadSettings() {
  if (loadAttempted.value) return
  loadAttempted.value = true
  settingsLoading.value = true
  try {
    const snapshot = await AdminService.getSettings()
    applySnapshot(snapshot)
    clearLegacySettings()
  } catch (error) {
    loadError.value = errorMessage(error)
    settingsLoaded.value = false
  } finally {
    settingsLoading.value = false
  }
}

async function persistSettings(candidate: AdminSettings, successTitle: string) {
  if (saving.value || !settingsLoaded.value || conflict.value) return
  saving.value = true
  try {
    const snapshot = await AdminService.updateSettings(candidate, version.value)
    applySnapshot(snapshot)
    clearLegacySettings()
    toast.success(successTitle, 'Cấu hình dùng chung đã được cập nhật.')
  } catch (error) {
    const detectedConflict = extractAdminSettingsConflict(error)
    if (detectedConflict) {
      conflictDraft.value = cloneSettings(candidate)
      conflict.value = detectedConflict
      toast.error('Có thay đổi mới hơn', detectedConflict.message)
    } else {
      toast.error('Không thể lưu cấu hình', errorMessage(error))
    }
  } finally {
    saving.value = false
  }
}

async function saveSettings() {
  if (saving.value || conflict.value || !isDirty.value) return
  if (!validate()) {
    toast.error('Cấu hình chưa hợp lệ', 'Vui lòng kiểm tra các trường được đánh dấu.')
    return
  }
  await persistSettings(cloneSettings(settings.value), 'Đã lưu cấu hình')
}

async function resetSettings() {
  if (saving.value || !canReset.value) return
  if (import.meta.client && !window.confirm('Khôi phục toàn bộ thiết lập về mặc định dùng chung?')) return
  const defaults = cloneSettings(defaultSettings.value)
  if (!validate(defaults)) {
    toast.error('Mặc định không hợp lệ', 'API Settings trả về bộ mặc định không hợp lệ.')
    return
  }
  errors.value = {}
  await persistSettings(defaults, 'Đã khôi phục mặc định')
}

function checkConfiguration() {
  if (validate()) toast.success('Cấu hình hợp lệ', 'Không phát hiện lỗi trong các trường có thể kiểm tra ở frontend.')
  else toast.error('Cấu hình chưa hợp lệ', 'Vui lòng sửa các trường được đánh dấu.')
}

function useServerVersion() {
  if (!conflict.value?.current) return
  applySnapshot(conflict.value.current)
  toast.info('Đã dùng bản mới nhất', 'Bản chỉnh sửa cục bộ chưa lưu đã được bỏ.')
}

function keepLocalDraft() {
  const current = conflict.value?.current
  const draft = conflictDraft.value
  if (!current || !draft) return
  applySnapshot(current)
  settings.value = cloneSettings(draft)
  conflict.value = null
  conflictDraft.value = null
  toast.info('Đã giữ bản đang chỉnh', 'Hãy kiểm tra thay đổi rồi bấm Lưu để gửi với phiên bản mới.')
}

function reloadPage() {
  if (import.meta.client) window.location.reload()
}

onMounted(() => {
  void loadSettings()
})
</script>

<style scoped>
.settings-card { @apply min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm; }
.settings-card-container { container-type: inline-size; }
.platform-form-grid, .settings-two-column-grid { grid-template-columns: minmax(0, 1fr); }
.settings-label { @apply block text-xs font-bold uppercase tracking-wide text-slate-500; }
.settings-input { @apply h-10 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100; }
.settings-input:disabled { @apply cursor-not-allowed bg-slate-100 text-slate-400; }
.platform-form-grid > label, .settings-two-column-grid > label { @apply min-w-0; }
:deep(.quickwork-scroll-select > button) { width: calc(100% - 0.5rem); margin: 0.125rem 0.25rem; border-bottom-width: 0; border-radius: 0.75rem; }
@container (min-width: 26rem) {
  .platform-form-grid, .settings-two-column-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .platform-form-grid .settings-label, .settings-two-column-grid .settings-label { min-height: 2.5rem; display: flex; align-items: flex-end; }
}
.secondary-action { @apply inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700; }
.primary-action { @apply inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700; }
.secondary-action:disabled, .primary-action:disabled { @apply cursor-not-allowed opacity-50; }
.secondary-action:disabled { @apply hover:border-slate-200 hover:bg-white hover:text-slate-700; }
.primary-action:disabled { @apply hover:bg-sky-600; }
</style>
