<template>
  <div class="mx-auto w-full max-w-6xl">
    <header class="mb-6">
      <h1 class="text-2xl font-black tracking-tight text-slate-950">Cài đặt</h1>
      <p class="mt-1 text-sm font-medium text-slate-500">Quản lý tài khoản, bảo mật và nhu cầu tìm việc của bạn trên QuickWork.</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <nav class="h-fit rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm" aria-label="Các mục cài đặt">
        <button
          v-for="item in settingItems"
          :key="item.key"
          type="button"
          :class="['group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100', activeSetting === item.key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900']"
          @click="selectSetting(item.key)"
        >
          <span :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', activeSetting === item.key ? 'bg-blue-50 text-blue-600' : 'text-slate-400']">
            <Icon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-black">{{ item.label }}</span>
            <span class="mt-0.5 block truncate text-xs font-medium text-slate-500">{{ item.description }}</span>
          </span>
          <Icon name="uil:angle-right" class="h-5 w-5 shrink-0" aria-hidden="true" />
        </button>
      </nav>

      <section class="min-h-[590px] min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div v-if="isLoading" class="flex min-h-[480px] flex-col items-center justify-center text-center">
          <Icon name="uil:spinner-alt" class="h-9 w-9 animate-spin text-blue-600" />
          <p class="mt-3 text-sm font-bold text-slate-600">Đang tải cài đặt...</p>
        </div>

        <template v-else>
          <form v-if="activeSetting === 'account'" @submit.prevent="saveAccount">
            <div>
              <h2 class="text-xl font-black tracking-tight text-slate-950">Thông tin tài khoản</h2>
              <p class="mt-1 text-sm font-medium text-slate-500">Cập nhật thông tin cá nhân và hồ sơ ứng tuyển của bạn.</p>
            </div>

            <div class="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-center">
              <div class="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-blue-100 shadow-sm ring-1 ring-slate-200">
                <img v-if="accountForm.avatar" :src="accountForm.avatar" :alt="`Ảnh đại diện của ${accountForm.name}`" class="h-full w-full object-cover">
                <span v-else class="flex h-full w-full items-center justify-center text-xl font-black text-blue-700">{{ userInitials }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate text-base font-black text-slate-950 sm:text-lg">{{ accountForm.name || 'Sinh viên QuickWork' }}</h3>
                  <span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                    <Icon name="uil:graduation-cap" class="h-3.5 w-3.5" aria-hidden="true" />
                    Sinh viên
                  </span>
                </div>
                <p class="mt-1 truncate text-sm font-semibold text-slate-500">{{ userEmail }}</p>
              </div>
            </div>

            <section class="account-section mt-4">
              <div class="account-section-title">
                <Icon name="uil:info-circle" class="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h3>Thông tin cá nhân</h3>
              </div>
              <div class="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
                <label class="block">
                  <span class="field-label">Họ và tên <b class="text-rose-500">*</b></span>
                  <input v-model.trim="accountForm.name" :class="['field-input', accountErrors.name && '!border-rose-300 focus:!ring-rose-100']" maxlength="100" autocomplete="name" :aria-invalid="Boolean(accountErrors.name)" required @input="accountErrors.name = ''">
                  <p v-if="accountErrors.name" class="mt-2 text-xs font-bold text-rose-600" role="alert">{{ accountErrors.name }}</p>
                </label>
                <label class="block">
                  <span class="field-label">Số điện thoại</span>
                  <input v-model.trim="accountForm.phone" :class="['field-input', accountErrors.phone && '!border-rose-300 focus:!ring-rose-100']" inputmode="numeric" maxlength="11" autocomplete="tel" placeholder="Ví dụ: 0912345678" :aria-invalid="Boolean(accountErrors.phone)" @input="accountErrors.phone = ''">
                  <p v-if="accountErrors.phone" class="mt-2 text-xs font-bold text-rose-600" role="alert">{{ accountErrors.phone }}</p>
                </label>
              </div>
            </section>

            <section class="account-section mt-4">
              <div class="account-section-title">
                <Icon name="uil:user-square" class="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h3>Ảnh đại diện</h3>
              </div>
              <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <img v-if="accountForm.avatar" :src="accountForm.avatar" :alt="`Ảnh đại diện của ${accountForm.name}`" class="h-20 w-20 shrink-0 rounded-full border-4 border-sky-50 object-cover shadow-sm">
                <span v-else class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-100 to-blue-200 text-xl font-black text-blue-700 shadow-sm ring-1 ring-sky-100">{{ userInitials }}</span>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium leading-5 text-slate-500">Ảnh đại diện giúp nhà tuyển dụng nhận diện bạn dễ dàng hơn. Hãy sử dụng ảnh chân dung rõ mặt và chuyên nghiệp.</p>
                <input ref="avatarInput" class="sr-only" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" aria-label="Chọn ảnh đại diện" @change="handleAvatarInput">
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" class="upload-button" :disabled="isAvatarUploading" @click="avatarInput?.click()">
                      <Icon :name="isAvatarUploading ? 'uil:spinner-alt' : 'uil:upload-alt'" :class="['h-4 w-4', isAvatarUploading && 'animate-spin']" aria-hidden="true" />
                      {{ isAvatarUploading ? 'Đang tải...' : 'Tải ảnh lên' }}
                    </button>
                    <button v-if="accountForm.avatar" type="button" class="secondary-button" :disabled="isAvatarUploading" @click="clearAvatar">
                      <Icon name="uil:trash-alt" class="h-4 w-4" aria-hidden="true" />
                      Xóa ảnh
                    </button>
                  </div>
                  <p class="mt-2 text-[11px] font-medium text-slate-400">Định dạng: JPG, JPEG, PNG. Kích thước tối đa 5MB.</p>
                </div>
              </div>
            </section>

            <section class="account-section mt-4">
              <div class="account-section-title">
                <Icon name="uil:file-alt" class="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h3>CV ứng tuyển</h3>
              </div>
              <div class="space-y-3 p-4 sm:p-5">
                <div v-if="accountForm.cv_url" class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <Icon name="uil:file-alt" class="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-black text-slate-800">{{ cvFileName }}</p>
                    <p class="mt-0.5 text-xs font-medium text-slate-500">{{ cvFileSizeLabel }}</p>
                  </div>
                  <p v-if="cvUploadedAtLabel" class="shrink-0 text-[11px] font-medium text-slate-400">Tải lên: {{ cvUploadedAtLabel }}</p>
                  <div class="flex shrink-0 gap-2">
                    <button type="button" class="secondary-button" :disabled="isCvUploading" @click="clearCv">
                      <Icon name="uil:trash-alt" class="h-4 w-4" aria-hidden="true" />
                      Xóa
                    </button>
                  </div>
                </div>
                <input ref="cvInput" class="sr-only" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" @change="handleCvInput">
                <div
                  :class="[
                    'rounded-xl border border-dashed p-3 text-center transition',
                    isCvDragging ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-blue-200 bg-blue-50/20 hover:border-blue-300 hover:bg-blue-50/40'
                  ]"
                  @dragenter.prevent="isCvDragging = true"
                  @dragover.prevent="isCvDragging = true"
                  @dragleave.prevent="isCvDragging = false"
                  @drop.prevent="handleCvDrop"
                >
                  <button type="button" class="inline-flex items-center gap-2 text-sm font-black text-blue-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isCvUploading" @click="cvInput?.click()">
                    <Icon :name="isCvUploading ? 'uil:spinner-alt' : 'uil:upload-alt'" :class="['h-4 w-4', isCvUploading && 'animate-spin']" aria-hidden="true" />
                    {{ isCvUploading ? 'Đang tải CV...' : 'Tải CV mới lên' }}
                  </button>
                  <p class="mt-1 text-[11px] font-medium text-slate-400">Kéo thả file vào đây hoặc chọn file từ máy tính</p>
                </div>
                <p class="text-[11px] font-medium text-slate-400">Định dạng: PDF, DOC, DOCX. Kích thước tối đa 10MB. CV này sẽ được dùng khi bạn ứng tuyển.</p>
              </div>
            </section>

            <FormActions :saving="isSaving || isAvatarUploading || isCvUploading" @reset="resetAccount" />
          </form>

          <form v-else-if="activeSetting === 'security'" @submit.prevent="changePassword">
            <SectionHeading title="Bảo mật tài khoản" description="Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn." icon="uil:lock" />
            <div class="mt-7 max-w-2xl space-y-5">
              <PasswordField v-model="passwordForm.current_password" label="Mật khẩu hiện tại" autocomplete="current-password" :error="passwordErrors.current_password" />
              <PasswordField v-model="passwordForm.new_password" label="Mật khẩu mới" autocomplete="new-password" :error="passwordErrors.new_password" />
              <PasswordField v-model="passwordForm.confirm_password" label="Xác nhận mật khẩu mới" autocomplete="new-password" :error="passwordErrors.confirm_password" />
              <div class="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-medium leading-6 text-blue-800">
                <div class="flex gap-3">
                  <Icon name="uil:shield-check" class="mt-0.5 h-5 w-5 shrink-0" />
                  <p>Mật khẩu mới cần ít nhất 8 ký tự, có chữ hoa, chữ thường, số hoặc ký tự đặc biệt và không chứa khoảng trắng. Hệ thống sẽ kiểm tra mật khẩu hiện tại trước khi cập nhật.</p>
                </div>
              </div>
              <p v-if="passwordStatus.message" :class="['rounded-xl px-4 py-3 text-sm font-bold', passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700']" role="status">{{ passwordStatus.message }}</p>
            </div>
            <div class="mt-8 flex justify-end">
              <button class="primary-button" type="submit" :disabled="isSaving">
                <Icon :name="isSaving ? 'uil:spinner-alt' : 'uil:lock'" :class="['h-4 w-4', isSaving && 'animate-spin']" />
                {{ isSaving ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}
              </button>
            </div>
          </form>

          <form v-else-if="activeSetting === 'jobs'" @submit.prevent="saveJobPreferences">
            <SectionHeading title="Tùy chọn tìm việc" description="Cho QuickWork biết công việc bạn đang quan tâm." icon="uil:briefcase-alt" />
            <div class="mt-7 grid gap-5 md:grid-cols-2">
              <div class="md:col-span-2">
                <span class="field-label">Địa điểm mong muốn</span>
                <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-2">
                  <UiScrollSelect v-model="preferredCity" :options="preferredCityOptions" ariaLabel="Chọn thành phố mong muốn" icon="uil:map-marker" />
                  <UiScrollSelect v-model="preferredWard" :options="preferredWardOptions" ariaLabel="Chọn phường hoặc xã mong muốn" icon="uil:location-point" :disabled="!preferredCity" />
                </div>
                <p class="mt-2 text-xs font-medium text-slate-500">Chọn lần lượt thành phố và phường/xã tương tự khi nhà tuyển dụng tạo tin tuyển dụng.</p>
              </div>
              <label class="block">
                <span class="field-label">Ngành nghề quan tâm</span>
                <input v-model.trim="jobForm.preferred_category" class="field-input" maxlength="150" placeholder="Ví dụ: Công nghệ thông tin">
              </label>
              <label class="block">
                <span class="field-label">Mức lương mong muốn</span>
                <input v-model.trim="jobForm.expected_salary" class="field-input" maxlength="100" placeholder="Ví dụ: 12 - 18 triệu">
              </label>
              <div class="block">
                <span class="field-label">Hình thức làm việc</span>
                <UiScrollSelect v-model="jobForm.preferred_job_type" :options="jobTypeOptions" ariaLabel="Chọn hình thức làm việc" icon="uil:briefcase-alt" />
              </div>
            </div>
            <div class="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-800">Các lựa chọn này được lưu vào hồ sơ để hệ thống có thể ưu tiên công việc phù hợp hơn trong các bản cập nhật gợi ý tiếp theo.</div>
            <FormActions :saving="isSaving" @reset="resetJobPreferences" />
          </form>

          <form v-else @submit.prevent="savePrivacy">
            <SectionHeading title="Quyền riêng tư" description="Kiểm soát cách nhà tuyển dụng nhìn thấy và liên hệ với bạn." icon="uil:shield-check" />
            <div class="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5">
              <ToggleSetting v-model="privacyForm.profile_visible" title="Hiển thị hồ sơ" description="Cho phép hồ sơ sinh viên của bạn xuất hiện trong các luồng tuyển dụng phù hợp." />
              <ToggleSetting v-model="privacyForm.allow_enterprise_contact" title="Cho phép nhà tuyển dụng liên hệ" description="Nhà tuyển dụng có thể chủ động liên hệ khi hồ sơ của bạn phù hợp." />
              <ToggleSetting v-model="privacyForm.show_contact_info" title="Hiển thị thông tin liên hệ" description="Cho phép hiển thị số điện thoại trên hồ sơ được chia sẻ với nhà tuyển dụng." />
            </div>
            <div class="mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-600">QuickWork không hiển thị mật khẩu hoặc thông tin xác thực của bạn. Thay đổi quyền riêng tư được áp dụng ngay sau khi lưu.</div>
            <FormActions :saving="isSaving" @reset="resetPrivacy" />
          </form>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { AuthService } from '~/services/auth.service'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

type SettingKey = 'account' | 'security' | 'jobs' | 'privacy'

const settingItems: Array<{ key: SettingKey, label: string, description: string, icon: string }> = [
  { key: 'account', label: 'Tài khoản', description: 'Thông tin cá nhân và hồ sơ', icon: 'uil:user' },
  { key: 'security', label: 'Bảo mật', description: 'Đổi mật khẩu tài khoản', icon: 'uil:lock' },
  { key: 'jobs', label: 'Tùy chọn tìm việc', description: 'Địa điểm, ngành nghề, mức lương', icon: 'uil:briefcase-alt' },
  { key: 'privacy', label: 'Quyền riêng tư', description: 'Quyền xem và liên hệ', icon: 'uil:shield-check' }
]

const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const settingKeys: SettingKey[] = ['account', 'security', 'jobs', 'privacy']
const readSettingQuery = (value: unknown): SettingKey => {
  const section = Array.isArray(value) ? value[0] : value
  return settingKeys.includes(section as SettingKey) ? section as SettingKey : 'account'
}
const activeSetting = ref<SettingKey>(readSettingQuery(route.query.section))
const isLoading = ref(true)
const isSaving = ref(false)
const isAvatarUploading = ref(false)
const isCvUploading = ref(false)
const isCvDragging = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const cvInput = ref<HTMLInputElement | null>(null)
const profile = ref<any>({})
const cvUploadMeta = reactive({ name: '', size: 0, uploadedAt: '' })

const accountForm = reactive({ name: '', phone: '', avatar: '', cv_url: '', cv_file_name: '' })
const accountErrors = reactive({ name: '', phone: '' })
const jobForm = reactive({ preferred_location: '', preferred_category: '', expected_salary: '', preferred_job_type: '' })
const privacyForm = reactive({ profile_visible: true, allow_enterprise_contact: true, show_contact_info: false })
const passwordForm = reactive({ current_password: '', new_password: '', confirm_password: '' })
const passwordErrors = reactive({ current_password: '', new_password: '', confirm_password: '' })
const passwordStatus = reactive<{ type: 'success' | 'error', message: string }>({ type: 'success', message: '' })
const preferredCity = ref('')
const preferredWard = ref('')

const preferredLocations = [
  { value: 'Thành phố Hà Nội', wards: ['Phường Hoàn Kiếm', 'Phường Ba Đình', 'Phường Cầu Giấy', 'Phường Tây Hồ', 'Phường Hà Đông'] },
  { value: 'Thành phố Hồ Chí Minh', wards: ['Phường Sài Gòn', 'Phường Bến Thành', 'Phường Gia Định', 'Phường Thủ Đức', 'Phường An Khánh'] },
  { value: 'Thành phố Đà Nẵng', wards: ['Phường Hải Châu', 'Phường Thanh Khê', 'Phường Sơn Trà', 'Phường Ngũ Hành Sơn', 'Phường Cẩm Lệ'] },
  { value: 'Thành phố Hải Phòng', wards: ['Phường Hồng Bàng', 'Phường Ngô Quyền', 'Phường Lê Chân', 'Phường Hải An', 'Phường Kiến An'] },
  { value: 'Thành phố Huế', wards: ['Phường Phú Xuân', 'Phường Thuận Hóa', 'Phường Vỹ Dạ', 'Phường An Cựu', 'Phường Kim Long'] }
]
const preferredCityOptions = computed(() => [{ value: '', label: 'Chọn thành phố' }, ...preferredLocations.map(item => ({ value: item.value, label: item.value }))])
const preferredWardOptions = computed(() => [{ value: '', label: preferredCity.value ? 'Chọn phường / xã' : 'Chọn thành phố trước' }, ...(preferredLocations.find(item => item.value === preferredCity.value)?.wards || []).map(value => ({ value, label: value }))])
const jobTypeOptions = [
  { value: '', label: 'Chưa chọn' },
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'INTERNSHIP', label: 'Thực tập' },
  { value: 'REMOTE', label: 'Remote' }
]

const userEmail = computed(() => String(profile.value?.email || authStore.user?.email || ''))
const userInitials = computed(() => (accountForm.name || userEmail.value.split('@')[0] || 'SV').split(/\s+/).filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase())
const cvFileName = computed(() => {
  if (cvUploadMeta.name) return cvUploadMeta.name
  if (accountForm.cv_file_name.trim()) return accountForm.cv_file_name.trim()
  const value = accountForm.cv_url.trim()
  if (!value) return 'CV ứng tuyển'
  try {
    return decodeURIComponent(new URL(value).pathname.split('/').filter(Boolean).pop() || 'CV ứng tuyển')
  } catch {
    return value.split('/').filter(Boolean).pop() || 'CV ứng tuyển'
  }
})
const cvFileSizeLabel = computed(() => cvUploadMeta.size ? formatFileSize(cvUploadMeta.size) : 'CV hiện tại')
const cvUploadedAtLabel = computed(() => cvUploadMeta.uploadedAt || formatProfileDate(profile.value?.student_profile?.updated_at))

function selectSetting(setting: SettingKey) {
  activeSetting.value = setting
  void router.replace({ query: { ...route.query, section: setting } })
}

function getProfileFromResponse(response: any) {
  return response?.data?.student_profile || response?.data?.studentProfile || response?.student_profile || response?.studentProfile || {}
}

function applyProfileResponse(response: any) {
  const user = response?.data || response || {}
  const studentProfile = getProfileFromResponse(response)
  profile.value = user
  Object.assign(accountForm, { name: studentProfile.name || user.name || authStore.user?.name || '', phone: studentProfile.phone || '', avatar: studentProfile.avatar || '', cv_url: studentProfile.cv_url || '', cv_file_name: studentProfile.cv_file_name || '' })
  Object.assign(cvUploadMeta, { name: studentProfile.cv_file_name || '', size: 0, uploadedAt: '' })
  Object.assign(jobForm, { preferred_location: studentProfile.preferred_location || '', preferred_category: studentProfile.preferred_category || '', expected_salary: studentProfile.expected_salary || '', preferred_job_type: studentProfile.preferred_job_type || '' })
  const locationParts = String(studentProfile.preferred_location || '').split(',').map((part: string) => part.trim()).filter(Boolean)
  preferredWard.value = locationParts.length > 1 ? locationParts[0] ?? '' : ''
  preferredCity.value = locationParts.length > 1 ? locationParts.at(-1) || '' : locationParts[0] || ''
  Object.assign(privacyForm, { profile_visible: studentProfile.profile_visible !== false, allow_enterprise_contact: studentProfile.allow_enterprise_contact !== false, show_contact_info: studentProfile.show_contact_info === true })
}

function extractErrorMessage(error: any, fallback: string) {
  return error?.data?.message || error?.response?._data?.message || error?.message || fallback
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatProfileDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN')
}

function validateUploadFile(file: File, kind: 'avatar' | 'cv') {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
  const allowed = kind === 'avatar' ? ['.jpg', '.jpeg', '.png'] : ['.pdf', '.doc', '.docx']
  const maxSize = kind === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  if (!allowed.includes(extension)) {
    toast.error('Định dạng không hỗ trợ', kind === 'avatar' ? 'Chỉ chấp nhận ảnh JPG, JPEG hoặc PNG.' : 'Chỉ chấp nhận CV dạng PDF, DOC hoặc DOCX.')
    return false
  }
  if (file.size > maxSize) {
    toast.error('Tệp quá lớn', `Kích thước tối đa là ${kind === 'avatar' ? '5MB' : '10MB'}.`)
    return false
  }
  return true
}

async function uploadProfileFile(file: File, kind: 'avatar' | 'cv') {
  if (!validateUploadFile(file, kind)) return
  const loadingState = kind === 'avatar' ? isAvatarUploading : isCvUploading
  loadingState.value = true
  try {
    const response: any = await StudentService.uploadProfileFile(file, kind)
    const uploaded = response?.data || response
    const url = String(uploaded?.url || '').trim()
    if (!url) throw new Error('Không nhận được đường dẫn tệp sau khi tải lên.')
    if (kind === 'avatar') {
      accountForm.avatar = url
    } else {
      accountForm.cv_url = url
      accountForm.cv_file_name = String(uploaded?.name || file.name).trim()
      Object.assign(cvUploadMeta, {
        name: accountForm.cv_file_name,
        size: Number(uploaded?.size || file.size),
        uploadedAt: new Date().toLocaleDateString('vi-VN')
      })
    }
    toast.success('Tải tệp thành công', 'Nhấn “Lưu thay đổi” để cập nhật hồ sơ của bạn.')
  } catch (error) {
    toast.error('Không thể tải tệp', extractErrorMessage(error, 'Vui lòng thử lại sau.'))
  } finally {
    loadingState.value = false
  }
}

function handleAvatarInput(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) uploadProfileFile(file, 'avatar')
}

function handleCvInput(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) uploadProfileFile(file, 'cv')
}

function handleCvDrop(event: DragEvent) {
  isCvDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) uploadProfileFile(file, 'cv')
}

async function loadProfile() {
  isLoading.value = true
  try {
    applyProfileResponse(await StudentService.getProfile())
  } catch (error) {
    toast.error('Không thể tải cài đặt', extractErrorMessage(error, 'Vui lòng thử tải lại trang.'))
  } finally {
    isLoading.value = false
  }
}

async function saveProfile(payload: Record<string, unknown>, successMessage: string) {
  isSaving.value = true
  try {
    const response = await StudentService.updateProfile(payload)
    applyProfileResponse(response)
    authStore.setCurrentUser({ ...(authStore.user as any), name: accountForm.name, avatar: accountForm.avatar, student_profile: getProfileFromResponse(response) } as any)
    toast.success('Đã lưu thay đổi', successMessage)
  } catch (error) {
    toast.error('Không thể lưu thay đổi', extractErrorMessage(error, 'Vui lòng kiểm tra dữ liệu và thử lại.'))
  } finally {
    isSaving.value = false
  }
}

function saveAccount() {
  Object.assign(accountErrors, { name: '', phone: '' })
  if (!accountForm.name.trim()) accountErrors.name = 'Vui lòng nhập họ và tên.'
  if (accountForm.phone && !/^\d{10,11}$/.test(accountForm.phone)) accountErrors.phone = 'Số điện thoại phải gồm 10 đến 11 chữ số.'
  if (accountErrors.name || accountErrors.phone) return
  return saveProfile({ ...accountForm }, 'Thông tin tài khoản đã được cập nhật.')
}

function saveJobPreferences() {
  return saveProfile({ ...jobForm }, 'Tùy chọn tìm việc đã được cập nhật.')
}

function savePrivacy() {
  return saveProfile({ ...privacyForm }, 'Cài đặt quyền riêng tư đã được áp dụng.')
}

async function changePassword() {
  Object.assign(passwordErrors, { current_password: '', new_password: '', confirm_password: '' })
  passwordStatus.message = ''
  if (!passwordForm.current_password) passwordErrors.current_password = 'Vui lòng nhập mật khẩu hiện tại để xác minh.'
  if (!passwordForm.new_password) passwordErrors.new_password = 'Vui lòng nhập mật khẩu mới.'
  if (!passwordForm.confirm_password) passwordErrors.confirm_password = 'Vui lòng xác nhận mật khẩu mới.'
  if (Object.values(passwordErrors).some(Boolean)) return
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordErrors.confirm_password = 'Xác nhận mật khẩu mới chưa trùng khớp.'
    return
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*(?:\d|[^A-Za-z\d\s]))\S{8,}$/.test(passwordForm.new_password)) {
    passwordErrors.new_password = 'Cần ít nhất 8 ký tự, có chữ hoa, chữ thường, số hoặc ký tự đặc biệt và không có khoảng trắng.'
    return
  }

  isSaving.value = true
  try {
    const response: any = await AuthService.changePassword({ ...passwordForm })
    Object.assign(passwordForm, { current_password: '', new_password: '', confirm_password: '' })
    passwordStatus.type = 'success'
    passwordStatus.message = response?.message || 'Đổi mật khẩu thành công. Bạn có thể tiếp tục sử dụng phiên đăng nhập hiện tại.'
  } catch (error) {
    const message = extractErrorMessage(error, 'Vui lòng kiểm tra mật khẩu hiện tại và thử lại.')
    passwordErrors.current_password = message
    passwordStatus.type = 'error'
    passwordStatus.message = 'Mật khẩu chưa được thay đổi.'
  } finally {
    isSaving.value = false
  }
}

function resetAccount() { applyProfileResponse({ data: profile.value }) }
function clearAvatar() {
  accountForm.avatar = ''
  if (avatarInput.value) avatarInput.value.value = ''
}
function clearCv() {
  accountForm.cv_url = ''
  accountForm.cv_file_name = ''
  Object.assign(cvUploadMeta, { name: '', size: 0, uploadedAt: '' })
  if (cvInput.value) cvInput.value.value = ''
}
function resetJobPreferences() { applyProfileResponse({ data: profile.value }) }
function resetPrivacy() { applyProfileResponse({ data: profile.value }) }

watch(preferredCity, (city, previousCity) => {
  if (previousCity && city !== previousCity) preferredWard.value = ''
  jobForm.preferred_location = [preferredWard.value, city].filter(Boolean).join(', ')
})
watch(preferredWard, (ward) => {
  jobForm.preferred_location = [ward, preferredCity.value].filter(Boolean).join(', ')
})

watch(() => route.query.section, (section) => {
  activeSetting.value = readSettingQuery(section)
})

onMounted(loadProfile)
</script>

<style scoped>
.field-label { @apply mb-2 block text-sm font-black text-slate-700; }
.field-input { @apply h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100; }
.primary-button { @apply inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60; }
.secondary-button { @apply inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100; }
.upload-button { @apply inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500 bg-white px-4 text-xs font-black text-blue-700 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60; }
.account-section { @apply overflow-hidden rounded-2xl border border-slate-200 bg-white; }
.account-section-title { @apply flex h-11 items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-4 text-sm font-black text-slate-800 sm:px-5; }
</style>
