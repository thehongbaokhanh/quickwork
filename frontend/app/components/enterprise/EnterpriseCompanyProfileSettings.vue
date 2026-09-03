<template>
  <div class="space-y-5">
    <section class="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="relative h-36 overflow-hidden rounded-t-[15px] bg-gradient-to-r from-slate-950 via-blue-950 to-sky-700 sm:h-44">
        <img v-if="profile.cover_image_url" :src="profile.cover_image_url" alt="Ảnh bìa doanh nghiệp" class="h-full w-full object-cover object-center">
        <button type="button" class="absolute right-4 top-4 inline-flex h-9 items-center gap-2 rounded-xl bg-white/95 px-3 text-xs font-bold text-slate-800 shadow" @click="coverInput?.click()"><Icon name="uil:camera" class="h-4 w-4" />Thay ảnh bìa</button>
        <input ref="coverInput" class="sr-only" type="file" accept="image/jpeg,image/png" @change="selectNativeUpload($event, 'cover')">
      </div>
      <div class="relative flex flex-col gap-4 rounded-b-2xl bg-white px-5 pb-5 sm:flex-row sm:items-end sm:px-6">
        <div class="relative z-10 -mt-9 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-sky-600 text-xl font-black text-white shadow-md">
          <img v-if="logoUrl" :src="logoUrl" :alt="companyName" class="h-full w-full object-cover">
          <span v-else>{{ initials }}</span>
        </div>
        <div class="min-w-0 flex-1 sm:pb-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="truncate text-xl font-extrabold text-slate-950">{{ companyName }}</h2>
            <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
              <Icon :name="verified ? 'uil:check-circle' : 'uil:clock'" class="h-4 w-4" />
              {{ verified ? 'Đã xác minh' : 'Chờ xác minh' }}
            </span>
          </div>
          <p class="mt-1 text-sm font-medium text-slate-500">{{ profile.phone || 'Chưa cập nhật số điện thoại' }} · {{ authStore.user?.email }}</p>
        </div>
        <div class="flex gap-2">
          <button type="button" class="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50" @click="previewOpen = true">Xem trước</button>
          <button type="button" class="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </div>
    </section>

    <div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-5">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Icon name="uil:building" class="h-5 w-5" /></span><div class="min-w-0 flex-1"><h3 class="font-extrabold text-slate-950">Thông tin cơ bản</h3><p class="text-sm text-slate-500">Thông tin hiện được hỗ trợ bởi hồ sơ doanh nghiệp.</p></div><button type="button" class="inline-flex h-9 items-center gap-2 rounded-xl border border-sky-100 px-3 text-sm font-bold text-sky-700 hover:bg-sky-50" @click="editingDetails = !editingDetails"><Icon name="uil:pen" class="h-4 w-4" />{{ editingDetails ? 'Đóng' : 'Chỉnh sửa' }}</button></div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="space-y-1.5"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Tên công ty</span><input v-model="profile.company_name" :disabled="!editingDetails" class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"></label>
            <label class="space-y-1.5"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Số điện thoại</span><input v-model="profile.phone" :disabled="!editingDetails" class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"></label>
            <label class="space-y-1.5 sm:col-span-2"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">Mã số thuế</span><input v-model="profile.tax_code" :disabled="!editingDetails" class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"></label>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="font-extrabold text-slate-950">Giới thiệu công ty</h3><p class="mt-1 text-sm leading-6 text-slate-500">Mô tả ngắn về doanh nghiệp, văn hóa và môi trường làm việc.</p></div><button v-if="!editingIntroduction" type="button" class="inline-flex h-9 items-center gap-2 rounded-xl border border-sky-100 px-3 text-sm font-bold text-sky-700 hover:bg-sky-50" @click="startIntroductionEdit"><Icon name="uil:pen" class="h-4 w-4" />Chỉnh sửa</button></div>
          <div v-if="editingIntroduction" class="mt-4"><textarea v-model="introductionDraft" maxlength="1200" rows="7" class="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50" placeholder="Chia sẻ câu chuyện, giá trị và môi trường làm việc của doanh nghiệp..." /><div class="mt-2 flex justify-between gap-3"><p class="text-xs text-slate-500">Nội dung nên có ít nhất 20 ký tự.</p><span class="text-xs font-bold text-slate-400">{{ introductionDraft.length }}/1200</span></div><p v-if="introductionError" class="mt-2 text-xs font-bold text-rose-600">{{ introductionError }}</p><div class="mt-4 flex justify-end gap-2"><button type="button" class="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600" @click="cancelIntroductionEdit">Hủy</button><button type="button" class="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white" @click="saveIntroduction">Lưu giới thiệu</button></div></div>
          <div v-else class="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm font-medium leading-6 text-slate-600">{{ profile.description || 'Chưa cập nhật giới thiệu công ty.' }}</div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="font-extrabold text-slate-950">Hình ảnh & logo</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <EnterpriseFileUploadField :model-value="profile.logo_url" accept="image/jpeg,image/png" label="Kéo thả logo vào đây" help="JPG / JPEG / PNG" image removable remove-label="Xóa logo" :uploading="uploadingKind === 'logo'" :error="uploadErrors.logo" @file="uploadFile($event, 'logo')" @remove="profile.logo_url = ''" />
            <EnterpriseFileUploadField :model-value="profile.cover_image_url" accept="image/jpeg,image/png" label="Kéo thả ảnh bìa vào đây" help="JPG / JPEG / PNG" image cover removable remove-label="Xóa ảnh bìa" :uploading="uploadingKind === 'cover'" :error="uploadErrors.cover" @file="uploadFile($event, 'cover')" @remove="profile.cover_image_url = ''" />
          </div>
        </section>

        <div class="space-y-4">
          <section class="flex min-h-[430px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-start gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Icon name="uil:apps" class="h-5 w-5" /></span>
              <div class="min-w-0 flex-1"><h3 class="text-sm font-extrabold text-slate-950">Lĩnh vực, quy mô & mô hình làm việc</h3><p class="mt-0.5 text-xs leading-5 text-slate-500">Thông tin tổng quan về môi trường doanh nghiệp.</p></div><button type="button" class="text-xs font-bold text-sky-700" @click="editingDetails ? cancelFactsEdit() : (editingDetails = true)">{{ editingDetails ? 'Đóng' : 'Chỉnh sửa' }}</button>
            </div>
            <div class="mt-10 flex min-h-0 flex-1 flex-col">
              <div class="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
                <label v-for="item in companyFacts" :key="item.label" class="min-w-0 space-y-2"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ item.label }}</span><ScrollSelect v-if="editingDetails" v-model="profile[item.key]" :options="factOptions[item.key]" :aria-label="item.label" :icon="item.icon" /><div v-else class="relative flex h-12 min-w-0 items-center rounded-2xl border border-slate-200 bg-white px-4"><Icon :name="item.icon" class="h-5 w-5 shrink-0 text-sky-600" /><span class="min-w-0 flex-1 truncate px-3 text-sm font-semibold text-slate-800">{{ item.value || 'Chưa cập nhật' }}</span></div></label>
              </div>
              <div class="mt-10 rounded-2xl border border-sky-100 bg-sky-50/60 p-5"><div class="flex items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sky-600 ring-1 ring-sky-100"><Icon name="uil:check-circle" class="h-6 w-6" /></span><div class="min-w-0"><p class="text-sm font-extrabold text-slate-800">Tóm tắt thông tin</p><div class="mt-3 flex flex-wrap gap-2"><span v-for="item in companyFacts" :key="`summary-${item.label}`" class="inline-flex max-w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-100"><Icon :name="item.icon" class="h-4 w-4 shrink-0 text-sky-600" /><span class="truncate">{{ item.value || 'Chưa cập nhật' }}</span></span></div></div></div></div>
            </div>
            <div class="mt-3 flex h-12 shrink-0 items-end justify-end gap-2 border-t border-slate-100"><template v-if="editingDetails"><button type="button" class="h-9 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600" @click="cancelFactsEdit">Hủy</button><button type="button" class="h-9 rounded-xl bg-sky-600 px-4 text-xs font-bold text-white disabled:opacity-60" :disabled="saving" @click="saveFactsEdit">Lưu thay đổi</button></template></div>
          </section>

          <section class="flex min-h-[560px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-start gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Icon name="uil:map-marker" class="h-5 w-5" /></span>
              <div class="min-w-0 flex-1"><h3 class="text-sm font-extrabold text-slate-950">Địa điểm doanh nghiệp</h3><p class="mt-0.5 text-xs leading-5 text-slate-500">Địa chỉ trụ sở và vị trí làm việc chính của công ty.</p></div><button type="button" class="text-xs font-bold text-sky-700" @click="editingLocation ? cancelLocationEdit() : startLocationEdit()">{{ editingLocation ? 'Đóng' : 'Chỉnh sửa' }}</button>
            </div>
            <p class="mt-7 flex items-center gap-2 text-xs font-medium leading-5 text-slate-500"><Icon name="uil:info-circle" class="h-5 w-5 shrink-0 text-sky-600" />{{ locationHierarchyHelp }}</p>
            <div class="mt-5 grid min-h-0 flex-1 items-stretch gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(300px,1.1fr)]">
              <div class="grid min-w-0 content-start gap-4"><label v-for="field in locationFields" :key="field.key" class="block min-w-0 space-y-2"><span class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ field.label }}</span><template v-if="editingLocation"><div v-if="field.wide" class="relative flex h-12 min-w-0 items-center rounded-2xl border border-slate-200 bg-white px-4"><Icon :name="field.icon" class="h-5 w-5 shrink-0 text-sky-600" /><input v-model="profile[field.key]" class="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none" :aria-label="field.label" @change="geocodeDetailedAddress"></div><ScrollSelect v-else :model-value="profile[field.key]" :options="locationOptions[field.key]" :aria-label="field.label" :icon="field.icon" searchable :disabled="!locationParentReady(field.key)" :search-placeholder="locationSearchPlaceholder(field.key)" :search-hint="locationSearchHint(field.key)" empty-text="Không tìm thấy đơn vị hành chính phù hợp" :loading="locationSearching === field.key" :error="locationSearchError(field.key)" retryable @search="searchLocations($event, field.key)" @retry="retryLocationSearch(field.key)" @update:model-value="selectLocation(field.key, String($event))" /></template><div v-else class="relative flex h-12 min-w-0 items-center rounded-2xl border border-slate-200 bg-white px-4"><Icon :name="field.icon" class="h-5 w-5 shrink-0 text-sky-600" /><span class="min-w-0 flex-1 truncate px-3 text-sm font-semibold text-slate-800">{{ profile[field.key] || 'Chưa cập nhật' }}</span></div></label></div>
              <div class="relative min-h-[400px] min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><ClientOnly><EnterpriseLocationMap :latitude="profile.latitude" :longitude="profile.longitude" :label="fullLocation" :zoom="mapZoom" :editable="editingLocation" @choose="selectMapPoint" /><template #fallback><div class="flex h-full min-h-[400px] items-center justify-center text-sm font-bold text-slate-500"><Icon name="uil:spinner-alt" class="mr-2 h-5 w-5 animate-spin text-sky-600" />Đang tải bản đồ...</div></template></ClientOnly></div>
              <div class="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 md:col-span-2"><div class="flex gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sky-600 ring-1 ring-sky-100"><Icon name="uil:bookmark" class="h-5 w-5" /></span><div class="min-w-0"><p class="text-sm font-extrabold text-slate-800">Địa chỉ sẽ lưu</p><p class="mt-1 break-words text-sm font-medium leading-6 text-slate-700">{{ fullLocation || 'Chưa cập nhật' }}</p></div></div><p v-if="locationValidationError" class="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"><Icon name="uil:exclamation-circle" class="mr-1 inline h-4 w-4" />{{ locationValidationError }}</p></div>
            </div>
            <div class="mt-3 flex h-12 shrink-0 items-end justify-end gap-2 border-t border-slate-100"><template v-if="editingLocation"><button type="button" class="h-9 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600" @click="cancelLocationEdit">Hủy</button><button type="button" class="h-9 rounded-xl bg-sky-600 px-4 text-xs font-bold text-white disabled:opacity-60" :disabled="saving" @click="saveLocationEdit">Lưu thay đổi</button></template></div>
          </section>
        </div>

      </div>

      <aside class="space-y-5 xl:sticky xl:top-20">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between"><h3 class="font-extrabold text-slate-950">Hoàn thiện hồ sơ</h3><span class="text-lg font-black text-sky-700">{{ completion }}%</span></div>
          <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-sky-600 transition-all" :style="{ width: `${completion}%` }" /></div>
          <ul class="mt-4 space-y-2 text-sm font-semibold text-slate-600"><li v-for="item in completionItems" :key="item.label" class="flex items-center gap-2"><Icon :name="item.done ? 'uil:check-circle' : 'uil:circle'" :class="['h-4 w-4', item.done ? 'text-emerald-500' : 'text-slate-300']" />{{ item.label }}</li></ul>
        </section>
        <section class="rounded-2xl border border-sky-100 bg-sky-50 p-5"><h3 class="font-extrabold text-sky-950">Gợi ý tối ưu</h3><p class="mt-2 text-sm leading-6 text-sky-800">Bổ sung ảnh bìa, mô tả, lĩnh vực và quy mô khi backend hỗ trợ để hồ sơ nổi bật hơn.</p><button class="mt-4 text-sm font-bold text-sky-700" type="button" @click="developing('Gợi ý tối ưu hồ sơ')">Xem gợi ý →</button></section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="flex flex-wrap items-center gap-2"><h3 class="font-extrabold text-slate-950">Trạng thái tài khoản</h3><span v-if="verified" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"><Icon name="uil:check-circle" class="h-4 w-4" />Đã xác minh</span></div><p class="mt-3 text-sm font-bold text-slate-700">{{ verified ? 'Tài khoản đã được duyệt KYB' : 'Hồ sơ đang chờ xác minh KYB' }}</p><p class="mt-1 text-sm leading-6 text-slate-500">Các quyền tuyển dụng vẫn tuân theo middleware và trạng thái xác minh hiện tại.</p></section>
      </aside>
    </div>

    <Teleport to="body"><div v-if="previewOpen" class="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 p-4 sm:p-8" @click.self="previewOpen = false"><article class="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"><div class="relative h-48 bg-gradient-to-r from-slate-950 via-blue-950 to-sky-700"><img v-if="profile.cover_image_url" :src="profile.cover_image_url" class="h-full w-full object-cover"><button type="button" class="absolute right-4 top-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700" @click="previewOpen = false">Quay lại chỉnh sửa</button></div><div class="px-6 pb-8"><div class="-mt-10 flex items-end gap-4"><div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-sky-600 text-xl font-black text-white"><img v-if="logoUrl" :src="logoUrl" class="h-full w-full object-cover"><span v-else>{{ initials }}</span></div><div class="pb-1"><div class="flex items-center gap-2"><h2 class="text-2xl font-black text-slate-950">{{ companyName }}</h2><span v-if="verified" class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Đã xác minh</span></div><p class="text-sm text-slate-500">{{ fullLocation || 'Chưa cập nhật địa điểm' }}</p></div></div><div class="mt-8 grid gap-5 md:grid-cols-[1.3fr_0.7fr]"><section class="rounded-2xl border border-slate-200 p-5"><h3 class="font-extrabold">Giới thiệu công ty</h3><p class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{{ profile.description || 'Chưa cập nhật giới thiệu công ty.' }}</p></section><section class="rounded-2xl border border-slate-200 p-5"><h3 class="font-extrabold">Thông tin hồ sơ</h3><dl class="mt-3 space-y-3 text-sm"><div v-for="item in companyFacts" :key="item.label" class="flex justify-between gap-3"><dt class="text-slate-500">{{ item.label }}</dt><dd class="text-right font-bold">{{ item.value || 'Chưa cập nhật' }}</dd></div><div class="flex justify-between gap-3"><dt class="text-slate-500">Địa điểm</dt><dd class="text-right font-bold">{{ fullLocation || 'Chưa cập nhật' }}</dd></div></dl></section></div></div></article></div></Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { CompanyService } from '~/services/company.service'
import { AuthService } from '~/services/auth.service'
import { useAuthStore } from '~/stores/auth'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'

const authStore = useAuthStore()
const toast = useToast()
const config = useRuntimeConfig()
const saving = ref(false)
const previewOpen = ref(false)
const editingDetails = ref(false)
const editingLocation = ref(false)
const editingIntroduction = ref(false)
const introductionDraft = ref('')
const introductionError = ref('')
type UploadKind = 'gpkd' | 'logo' | 'cover'
const uploadingKind = ref<UploadKind | ''>('')
const uploadErrors = reactive<Record<UploadKind, string>>({ gpkd: '', logo: '', cover: '' })
const coverInput = ref<HTMLInputElement | null>(null)
type ProfileField = 'company_name' | 'phone' | 'tax_code' | 'gpkd_url' | 'logo_url' | 'cover_image_url' | 'industry' | 'company_size' | 'work_model' | 'recruitment_level' | 'description' | 'address' | 'country' | 'city' | 'district' | 'ward' | 'latitude' | 'longitude'
const profile = reactive<Record<ProfileField, string>>({ company_name: '', phone: '', tax_code: '', gpkd_url: '', logo_url: '', cover_image_url: '', industry: '', company_size: '', work_model: '', recruitment_level: '', description: '', address: '', country: '', city: '', district: '', ward: '', latitude: '', longitude: '' })
const rawProfile = ref<any>({})
const companyName = computed(() => profile.company_name || authStore.user?.name || 'Doanh nghiệp QuickWork')
const initials = computed(() => companyName.value.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase())
const logoUrl = computed(() => String(profile.logo_url || rawProfile.value.avatar || authStore.user?.enterprise_profile?.logo_url || '').trim())
const verified = computed(() => authStore.enterpriseApproved)
const completionItems = computed(() => [
  { label: 'Tên công ty', done: Boolean(profile.company_name) },
  { label: 'Số điện thoại', done: Boolean(profile.phone) },
  { label: 'Giấy phép kinh doanh', done: Boolean(profile.gpkd_url) },
  { label: 'Logo doanh nghiệp', done: Boolean(logoUrl.value) }
])
const completion = computed(() => Math.round(completionItems.value.filter(item => item.done).length / completionItems.value.length * 100))
const companyFacts = computed(() => [
  { key: 'industry' as ProfileField, label: 'Lĩnh vực', value: profile.industry, icon: 'uil:briefcase-alt' },
  { key: 'company_size' as ProfileField, label: 'Quy mô', value: profile.company_size, icon: 'uil:users-alt' },
  { key: 'work_model' as ProfileField, label: 'Mô hình làm việc', value: profile.work_model, icon: 'uil:laptop' },
  { key: 'recruitment_level' as ProfileField, label: 'Cấp tuyển dụng chính', value: profile.recruitment_level, icon: 'uil:suitcase-alt' }
])
const factOptions: Record<string, Array<{ value: string, label: string }>> = {
  industry: ['Công nghệ thông tin', 'Kinh doanh', 'Tài chính - Ngân hàng', 'Marketing', 'Giáo dục', 'Y tế', 'Sản xuất', 'Xây dựng', 'Dịch vụ'].map(value => ({ value, label: value })),
  company_size: ['1 - 10 nhân viên', '11 - 50 nhân viên', '50 - 100 nhân viên', '101 - 500 nhân viên', 'Trên 500 nhân viên'].map(value => ({ value, label: value })),
  work_model: ['Tại văn phòng', 'Remote', 'Hybrid (Kết hợp)'].map(value => ({ value, label: value })),
  recruitment_level: ['Thực tập sinh', 'Nhân viên / Chuyên viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'].map(value => ({ value, label: value }))
}
const usesDistrictLevel = computed(() => {
  const countryCode = selectedCountryCode.value.trim().toLowerCase()
  if (countryCode) return countryCode !== 'vn'
  return normalizeAdministrativeName(profile.country) !== 'viet nam'
})
const locationFields = computed<Array<{ key: ProfileField, label: string, icon: string, wide?: boolean }>>(() => [
  { key: 'country', label: 'Quốc gia', icon: 'uil:globe' },
  { key: 'city', label: 'Tỉnh / Thành phố', icon: 'uil:building' },
  ...(usesDistrictLevel.value ? [{ key: 'district' as ProfileField, label: 'Quận / Huyện', icon: 'uil:building' }] : []),
  { key: 'ward', label: usesDistrictLevel.value ? 'Phường / Xã' : 'Phường / Xã / Đặc khu', icon: 'uil:estate' },
  { key: 'address', label: 'Địa chỉ chi tiết', icon: 'uil:map-marker', wide: true }
])
const locationHierarchyHelp = computed(() => usesDistrictLevel.value
  ? 'Chọn lần lượt tỉnh/thành phố, quận/huyện, phường/xã rồi nhập địa chỉ chi tiết.'
  : 'Chọn tỉnh/thành phố, sau đó chọn phường/xã/đặc khu và nhập địa chỉ chi tiết.')
const locationFacts = computed(() => [
  { label: 'Địa chỉ', value: profile.address, wide: true },
  { label: 'Thành phố', value: profile.city },
  { label: 'Quận / Huyện', value: profile.district }
])
const fullLocation = computed(() => [profile.address, profile.ward, profile.district, profile.city, profile.country].map(value => value.trim()).filter(Boolean).join(', '))
const mapZoom = computed(() => profile.address || profile.ward ? 17 : profile.district ? 13 : profile.city ? 10 : profile.country ? 5 : 4)
type GeoResult = { place_id: number, display_name: string, lat: string, lon: string, type?: string, addresstype?: string, category?: string, place_rank?: number, address?: Record<string, string> }
type AdministrativeField = 'country' | 'city' | 'district' | 'ward'
type AdministrativeSelection = { value: string, country: string, city: string, district: string, latitude: string, longitude: string, status: 'verified' | 'restored' }
const locationOptions = reactive<Record<string, Array<{ value: string, label: string }>>>({ country: [], city: [], district: [], ward: [] })
const geoResults = new Map<string, GeoResult>()
const selectedAdministrative = reactive<Record<AdministrativeField, AdministrativeSelection | null>>({ country: null, city: null, district: null, ward: null })
const locationSearching = ref<ProfileField | ''>('')
const locationValidationError = ref('')
const selectedCountryCode = ref('')
const locationErrors = reactive<Record<AdministrativeField, string>>({ country: '', city: '', district: '', ward: '' })
const locationLastQueries = reactive<Record<AdministrativeField, string>>({ country: '', city: '', district: '', ward: '' })
const locationSearchTimers: Partial<Record<AdministrativeField, ReturnType<typeof setTimeout>>> = {}
const locationSearchControllers: Partial<Record<AdministrativeField, AbortController>> = {}
const locationRequestTokens: Record<AdministrativeField, number> = { country: 0, city: 0, district: 0, ward: 0 }
let reverseRequestID = 0

function developing(feature: string) { toast.info('Tính năng đang phát triển', `${feature} chưa có dữ liệu/API hỗ trợ trong phiên bản hiện tại.`) }
function startIntroductionEdit() { introductionDraft.value = profile.description; introductionError.value = ''; editingIntroduction.value = true }
function cancelIntroductionEdit() { introductionDraft.value = ''; introductionError.value = ''; editingIntroduction.value = false }
function saveIntroduction() {
  const value = introductionDraft.value.trim()
  if (value && value.length < 20) { introductionError.value = 'Giới thiệu công ty cần có ít nhất 20 ký tự.'; return }
  introductionError.value = ''
  profile.description = value
  editingIntroduction.value = false
}
function hydrate(data: any) {
  const source = data?.data?.enterprise_profile || data?.data || data?.enterprise_profile || data || {}
  rawProfile.value = source
  profile.company_name = source.company_name || authStore.user?.name || ''
  profile.phone = source.phone || source.contact_phone || ''
  profile.tax_code = source.tax_code || ''
  profile.gpkd_url = source.gpkd_url || ''
  profile.logo_url = source.logo_url || ''
  profile.cover_image_url = source.cover_image_url || ''
  profile.industry = source.industry || ''
  profile.company_size = source.company_size || ''
  profile.work_model = source.work_model || ''
  profile.recruitment_level = source.recruitment_level || source.primary_recruitment_level || ''
  profile.description = source.description || ''
  profile.address = source.address || source.location || ''
  profile.country = source.country || ''
  profile.city = source.city || source.province || ''
  profile.district = source.district || ''
  profile.ward = source.ward || ''
  profile.latitude = source.latitude ? String(source.latitude) : ''
  profile.longitude = source.longitude ? String(source.longitude) : ''
  selectedCountryCode.value = ''
  if (!usesDistrictLevel.value) profile.district = ''
  for (const key of ['country', 'city', 'district', 'ward']) {
    const value = profile[key as ProfileField]
    locationOptions[key] = value ? [{ value, label: value }] : []
  }
  restoreAdministrativeSelections()
}
function searchLocations(query: string, field: ProfileField, immediate = false) {
  const administrativeField = field as AdministrativeField
  const normalizedQuery = query.trim()
  locationLastQueries[administrativeField] = normalizedQuery
  cancelLocationRequest(administrativeField)
  locationErrors[administrativeField] = ''
  if (normalizedQuery.length < 2 || !locationParentReady(field)) {
    locationOptions[field] = profile[field] ? [{ value: profile[field], label: profile[field] }] : []
    return
  }
  locationSearchTimers[administrativeField] = setTimeout(() => runLocationSearch(normalizedQuery, administrativeField), immediate ? 0 : 450)
}
async function runLocationSearch(query: string, field: AdministrativeField) {
  const controller = new AbortController()
  locationSearchControllers[field] = controller
  const token = ++locationRequestTokens[field]
  const parentSignature = locationParentSignature(field)
  locationSearching.value = field
  try {
    const districtScope = field === 'ward' && usesDistrictLevel.value ? profile.district : ''
    const scope = [query, districtScope, ['district', 'ward'].includes(field) ? profile.city : '', field !== 'country' ? profile.country : ''].filter(Boolean).join(', ')
    const featuretype = field === 'country' ? 'country' : undefined
    const results = await $fetch<GeoResult[]>(`${config.public.geocodingBaseUrl}/search`, { signal: controller.signal, query: { q: scope, format: 'jsonv2', addressdetails: 1, limit: 30, dedupe: 1, 'accept-language': 'vi', featuretype, countrycodes: field !== 'country' && selectedCountryCode.value ? selectedCountryCode.value : undefined } })
    if (token !== locationRequestTokens[field] || parentSignature !== locationParentSignature(field)) return
    const validResults = results.filter(place => isValidAdministrativePlace(place, field))
    const seen = new Set<string>()
    locationOptions[field] = validResults.flatMap((place) => {
      const label = administrativeValue(place, field)
      const identity = normalizeAdministrativeName(label)
      if (!label || seen.has(identity)) return []
      seen.add(identity)
      const value = String(place.place_id)
      geoResults.set(value, place)
      return [{ value, label }]
    })
  } catch (error: any) {
    if (controller.signal.aborted || error?.name === 'AbortError') return
    if (token !== locationRequestTokens[field]) return
    const status = Number(error?.statusCode || error?.status || error?.response?.status)
    locationErrors[field] = status === 429
      ? 'Dịch vụ địa điểm đang giới hạn yêu cầu. Vui lòng chờ một lúc rồi thử lại.'
      : 'Không thể tải danh sách địa điểm. Vui lòng thử lại.'
  } finally {
    if (token === locationRequestTokens[field] && locationSearching.value === field) locationSearching.value = ''
    if (locationSearchControllers[field] === controller) delete locationSearchControllers[field]
  }
}
function retryLocationSearch(field: ProfileField) {
  const administrativeField = field as AdministrativeField
  if (!locationLastQueries[administrativeField]) return
  searchLocations(locationLastQueries[administrativeField], field, true)
}
function cancelLocationRequest(field: AdministrativeField) {
  const timer = locationSearchTimers[field]
  if (timer) clearTimeout(timer)
  delete locationSearchTimers[field]
  locationSearchControllers[field]?.abort()
  delete locationSearchControllers[field]
  locationRequestTokens[field]++
  if (locationSearching.value === field) locationSearching.value = ''
}
function locationParentSignature(field: AdministrativeField) {
  if (field === 'country') return ''
  if (field === 'city') return profile.country
  if (field === 'district') return `${profile.country}|${profile.city}`
  return usesDistrictLevel.value
    ? `${profile.country}|${profile.city}|${profile.district}`
    : `${profile.country}|${profile.city}`
}
function selectLocation(field: ProfileField, value: string) {
  const place = geoResults.get(value)
  if (!place || !isValidAdministrativePlace(place, field as AdministrativeField)) {
    locationValidationError.value = 'Địa điểm này không đúng cấp hành chính và không thể được chọn.'
    return
  }
  resetLocationDescendants(field)
  const administrativeField = field as AdministrativeField
  const address = place.address || {}
  const administrativeName = administrativeValue(place, administrativeField)
  profile[field] = administrativeName
  if (field === 'country') selectedCountryCode.value = address.country_code || ''
  profile.latitude = place.lat
  profile.longitude = place.lon
  selectedAdministrative[administrativeField] = administrativeSelection(place, administrativeField)
  locationOptions[field] = [{ value: administrativeName, label: administrativeName }]
  locationValidationError.value = ''
}
const administrativeTypes: Record<AdministrativeField, Set<string>> = {
  country: new Set(['country']),
  city: new Set(['state', 'province', 'region', 'city', 'town', 'municipality']),
  district: new Set(['county', 'city_district', 'state_district', 'district', 'borough', 'subdivision']),
  ward: new Set(['ward', 'suburb', 'quarter', 'neighbourhood', 'village', 'hamlet'])
}
function administrativeValue(place: GeoResult, field: AdministrativeField) {
  const address = place.address || {}
  if (field === 'country') return address.country || ''
  if (field === 'city') return address.city || address.town || address.state || address.province || address.region || address.municipality || ''
  if (field === 'district') return address.city_district || address.county || address.state_district || address.district || address.borough || address.subdivision || ''
  return address.ward || address.suburb || address.quarter || address.village || address.neighbourhood || address.hamlet || ''
}
function isValidAdministrativePlace(place: GeoResult, field: AdministrativeField) {
  if (normalizedAdministrativeLevel(place) !== field || !administrativeValue(place, field)) return false
  const address = place.address || {}
  if (field !== 'country' && !sameAdministrativeName(address.country || '', profile.country)) return false
  if (field === 'district' && !addressContainsAdministrativeName(address, 'city', profile.city)) return false
  if (field === 'ward' && !addressContainsAdministrativeName(address, 'city', profile.city)) return false
  if (field === 'ward' && usesDistrictLevel.value && !addressContainsAdministrativeName(address, 'district', profile.district)) return false
  return true
}
function normalizedAdministrativeLevel(place: GeoResult): AdministrativeField | null {
  const level = String(place.addresstype || place.type || '').toLowerCase()
  for (const field of ['country', 'city', 'district', 'ward'] as AdministrativeField[]) {
    if (administrativeTypes[field].has(level) && administrativeValue(place, field)) return field
  }
  const isAdministrativeBoundary = place.category === 'boundary' || place.type === 'administrative' || place.addresstype === 'administrative'
  if (!isAdministrativeBoundary) return null
  const rank = Number(place.place_rank || 0)
  if (administrativeValue(place, 'country') && rank > 0 && rank <= 5) return 'country'
  // Commune/ward boundaries do not use one consistent place_rank across countries.
  // A structured ward-level component on an administrative boundary is stronger
  // evidence than a global rank threshold (notably for Vietnam's two-level model).
  if (administrativeValue(place, 'ward')) return 'ward'
  if (administrativeValue(place, 'district') && rank >= 11) return 'district'
  if (administrativeValue(place, 'city')) return 'city'
  return null
}
function administrativeSelection(place: GeoResult, field: AdministrativeField): AdministrativeSelection {
  return {
    value: administrativeValue(place, field),
    country: field === 'country' ? administrativeValue(place, 'country') : profile.country,
    city: ['country', 'city'].includes(field) ? (field === 'city' ? administrativeValue(place, 'city') : '') : profile.city,
    district: field === 'ward' && usesDistrictLevel.value ? profile.district : (field === 'district' ? administrativeValue(place, 'district') : ''),
    latitude: place.lat,
    longitude: place.lon,
    status: 'verified'
  }
}
function sameAdministrativeName(first: string, second: string) {
  return Boolean(first && second && normalizeAdministrativeName(first) === normalizeAdministrativeName(second))
}
function addressContainsAdministrativeName(address: Record<string, string>, field: 'city' | 'district', expected: string) {
  const keys = field === 'city'
    ? ['city', 'town', 'state', 'province', 'region', 'municipality']
    : ['city_district', 'county', 'state_district', 'district', 'borough', 'subdivision']
  return keys.some(key => sameAdministrativeName(address[key] || '', expected))
}
function normalizeAdministrativeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/\b(tinh|thanh pho|tp|quan|huyen|phuong|xa)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
}
function locationLabel(field: AdministrativeField) {
  return ({ country: 'Quốc gia', city: 'Tỉnh/Thành phố', district: 'Quận/Huyện', ward: 'Phường/Xã' })[field]
}
function restoreAdministrativeSelections() {
  selectedCountryCode.value = ''
  if (!usesDistrictLevel.value) profile.district = ''
  selectedAdministrative.country = profile.country ? { value: profile.country, country: profile.country, city: '', district: '', latitude: profile.latitude, longitude: profile.longitude, status: 'restored' } : null
  selectedAdministrative.city = profile.city ? { value: profile.city, country: profile.country, city: profile.city, district: '', latitude: profile.latitude, longitude: profile.longitude, status: 'restored' } : null
  selectedAdministrative.district = profile.district ? { value: profile.district, country: profile.country, city: profile.city, district: profile.district, latitude: profile.latitude, longitude: profile.longitude, status: 'restored' } : null
  selectedAdministrative.ward = profile.ward ? { value: profile.ward, country: profile.country, city: profile.city, district: profile.district, latitude: profile.latitude, longitude: profile.longitude, status: 'restored' } : null
  locationValidationError.value = ''
}
function validateAdministrativeHierarchy() {
  if (!profile.country) return 'Vui lòng chọn quốc gia từ danh sách hợp lệ.'
  if (profile.district && !profile.city) return 'Cần chọn tỉnh/thành phố trước quận/huyện.'
  if (profile.ward && !profile.city) return 'Cần chọn tỉnh/thành phố trước phường/xã.'
  if (usesDistrictLevel.value && profile.ward && !profile.district) return 'Cần chọn quận/huyện trước phường/xã.'
  if (!usesDistrictLevel.value && profile.district) return 'Quốc gia đã chọn không sử dụng cấp quận/huyện trong luồng địa chỉ hiện tại.'
  for (const field of ['country', 'city', 'district', 'ward'] as AdministrativeField[]) {
    if (!profile[field]) continue
    const selection = selectedAdministrative[field]
    if (!selection || !sameAdministrativeName(selection.value, profile[field])) return `${locationLabel(field)} chưa được chọn từ danh sách hành chính hợp lệ.`
    if (selection.status !== 'verified' && !isPersistedAdministrativeValue(field)) return `${locationLabel(field)} chưa được xác thực. Vui lòng tìm và chọn lại từ danh sách.`
  }
  const city = selectedAdministrative.city
  const district = selectedAdministrative.district
  const ward = selectedAdministrative.ward
  if (city && !sameAdministrativeName(city.country, profile.country)) return 'Tỉnh/Thành phố không thuộc quốc gia đã chọn.'
  if (district && (!sameAdministrativeName(district.country, profile.country) || !sameAdministrativeName(district.city, profile.city))) return 'Quận/Huyện không thuộc tỉnh/thành phố đã chọn.'
  if (ward && (!sameAdministrativeName(ward.country, profile.country) || !sameAdministrativeName(ward.city, profile.city))) return 'Phường/Xã không thuộc tỉnh/thành phố đã chọn.'
  if (usesDistrictLevel.value && ward && !sameAdministrativeName(ward.district, profile.district)) return 'Phường/Xã không thuộc quận/huyện đã chọn.'
  return ''
}
function persistedLocationValue(field: AdministrativeField) {
  if (field === 'city') return String(rawProfile.value.city || rawProfile.value.province || '').trim()
  return String(rawProfile.value[field] || '').trim()
}
function isPersistedAdministrativeValue(field: AdministrativeField) {
  return sameAdministrativeName(profile[field], persistedLocationValue(field))
}
function locationParentReady(field: ProfileField) {
  if (field === 'city') return Boolean(profile.country)
  if (field === 'district') return usesDistrictLevel.value && Boolean(profile.country && profile.city)
  if (field === 'ward') return usesDistrictLevel.value
    ? Boolean(profile.country && profile.city && profile.district)
    : Boolean(profile.country && profile.city)
  return true
}
function locationSearchPlaceholder(field: ProfileField) {
  if (!locationParentReady(field)) {
    if (field === 'city') return 'Chọn quốc gia trước'
    if (field === 'district') return 'Chọn thành phố trước'
    if (field === 'ward') return usesDistrictLevel.value ? 'Chọn quận/huyện trước' : 'Chọn tỉnh/thành phố trước'
  }
  return `Tìm ${locationFields.value.find(item => item.key === field)?.label.toLowerCase() || 'địa điểm'} thật...`
}
function locationSearchHint(field: ProfileField) {
  if (!locationParentReady(field)) return locationSearchPlaceholder(field)
  return `Nhập ít nhất 2 ký tự để tìm ${locationLabel(field as AdministrativeField).toLowerCase()}.`
}
function locationSearchError(field: ProfileField) {
  return locationErrors[field as AdministrativeField] || ''
}
function resetLocationDescendants(field: ProfileField) {
  const hierarchy: ProfileField[] = ['country', 'city', 'district', 'ward']
  const start = hierarchy.indexOf(field)
  hierarchy.slice(start + 1).forEach((key) => {
    const administrativeKey = key as AdministrativeField
    cancelLocationRequest(administrativeKey)
    profile[key] = ''
    locationOptions[key] = []
    selectedAdministrative[administrativeKey] = null
    locationErrors[administrativeKey] = ''
    locationLastQueries[administrativeKey] = ''
  })
  if (start >= 0) profile.address = ''
  locationValidationError.value = ''
}
async function selectMapPoint(point: { latitude: string, longitude: string }) {
  profile.latitude = point.latitude
  profile.longitude = point.longitude
  const requestID = ++reverseRequestID
  locationSearching.value = 'address'
  try {
    const place = await $fetch<GeoResult>(`${config.public.geocodingBaseUrl}/reverse`, { query: { lat: point.latitude, lon: point.longitude, format: 'jsonv2', addressdetails: 1, zoom: 18, 'accept-language': 'vi' } })
    if (requestID !== reverseRequestID || !place) return
    applyReverseLocation(place)
  } catch { toast.error('Không thể xác định địa chỉ', 'Marker đã được cập nhật nhưng dịch vụ địa chỉ chưa phản hồi.') }
  finally { if (requestID === reverseRequestID) locationSearching.value = '' }
}
function applyReverseLocation(place: GeoResult) {
  const address = place.address || {}
  profile.country = address.country || ''
  profile.city = address.city || address.town || address.state || address.province || address.region || address.municipality || ''
  selectedCountryCode.value = address.country_code || ''
  profile.district = usesDistrictLevel.value ? (address.city_district || address.county || address.state_district || address.district || address.borough || address.subdivision || '') : ''
  profile.ward = address.ward || address.suburb || address.quarter || address.village || address.neighbourhood || address.hamlet || ''
  profile.address = [address.house_number, address.road || address.pedestrian || address.residential || address.footway].filter(Boolean).join(' ')
  profile.latitude = place.lat
  profile.longitude = place.lon
  for (const key of ['country', 'city', 'district', 'ward'] as ProfileField[]) {
    locationOptions[key] = profile[key] ? [{ value: profile[key], label: profile[key] }] : []
  }
  selectedAdministrative.country = profile.country ? { value: profile.country, country: profile.country, city: '', district: '', latitude: place.lat, longitude: place.lon, status: 'verified' } : null
  selectedAdministrative.city = profile.city ? { value: profile.city, country: profile.country, city: profile.city, district: '', latitude: place.lat, longitude: place.lon, status: 'verified' } : null
  selectedAdministrative.district = profile.district ? { value: profile.district, country: profile.country, city: profile.city, district: profile.district, latitude: place.lat, longitude: place.lon, status: 'verified' } : null
  selectedAdministrative.ward = profile.ward ? { value: profile.ward, country: profile.country, city: profile.city, district: profile.district, latitude: place.lat, longitude: place.lon, status: 'verified' } : null
  locationValidationError.value = validateAdministrativeHierarchy()
}
async function geocodeDetailedAddress() {
  if (!fullLocation.value) return
  locationSearching.value = 'address'
  try {
    const [place] = await $fetch<GeoResult[]>(`${config.public.geocodingBaseUrl}/search`, { query: { q: fullLocation.value, format: 'jsonv2', addressdetails: 1, limit: 1, 'accept-language': 'vi' } })
    if (place) { profile.latitude = place.lat; profile.longitude = place.lon }
    else toast.warning('Không xác định được địa chỉ', 'Vui lòng kiểm tra lại địa chỉ chi tiết trước khi lưu.')
  } finally { locationSearching.value = '' }
}
async function uploadFile(file: File, kind: UploadKind) {
  if (uploadingKind.value) return
  const allowed = kind === 'gpkd' ? ['application/pdf', 'image/jpeg', 'image/png'] : ['image/jpeg', 'image/png']
  uploadErrors[kind] = ''
  if (!allowed.includes(file.type)) { uploadErrors[kind] = 'Định dạng tệp không được hỗ trợ.'; return }
  uploadingKind.value = kind
  try {
    const response: any = await AuthService.uploadGPKD(file, kind)
    const url = response?.url || response?.data?.url || response?.data?.file_url || ''
    if (!url) throw new Error('Máy chủ không trả về đường dẫn tệp.')
    if (kind === 'gpkd') profile.gpkd_url = url
    if (kind === 'logo') profile.logo_url = url
    if (kind === 'cover') profile.cover_image_url = url
    toast.success('Tải tệp thành công', 'Hãy bấm Lưu thay đổi để lưu tệp vào hồ sơ doanh nghiệp.')
  } catch (error: any) { uploadErrors[kind] = error?.data?.message || error?.message || 'Không thể tải tệp.' }
  finally { uploadingKind.value = '' }
}
function selectNativeUpload(event: Event, kind: UploadKind) { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (file) uploadFile(file, kind); input.value = '' }
async function loadProfile() {
  try { hydrate(await CompanyService.getProfile()) }
  catch (error: any) { toast.error('Không thể tải hồ sơ công ty', error?.data?.message || error?.message || 'Vui lòng thử lại.') }
}
async function saveProfile(): Promise<boolean> {
  if (!profile.company_name.trim()) { toast.warning('Thiếu tên công ty', 'Vui lòng nhập tên công ty trước khi lưu.'); return false }
  saving.value = true
  try {
    const response: any = await CompanyService.updateProfile(Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, value.trim()])))
    hydrate(response)
    if (authStore.user) {
      authStore.user.name = profile.company_name
      authStore.user.enterprise_profile = { ...(authStore.user.enterprise_profile || {}), ...rawProfile.value }
    }
    toast.success('Đã lưu hồ sơ công ty', 'Thông tin được hệ thống hỗ trợ đã cập nhật thành công.')
    return true
  } catch (error: any) { toast.error('Không thể lưu hồ sơ', error?.data?.message || error?.message || 'Vui lòng thử lại.'); return false }
  finally { saving.value = false }
}
function cancelFactsEdit() {
  profile.industry = rawProfile.value.industry || ''
  profile.company_size = rawProfile.value.company_size || ''
  profile.work_model = rawProfile.value.work_model || ''
  profile.recruitment_level = rawProfile.value.recruitment_level || ''
  editingDetails.value = false
}
async function saveFactsEdit() {
  if (await saveProfile()) editingDetails.value = false
}
function startLocationEdit() {
  if (!usesDistrictLevel.value) {
    profile.district = ''
    locationOptions.district = []
    selectedAdministrative.district = null
  }
  locationValidationError.value = ''
  editingLocation.value = true
}
function cancelLocationEdit() {
  profile.address = rawProfile.value.address || rawProfile.value.location || ''
  profile.country = rawProfile.value.country || ''
  profile.city = rawProfile.value.city || rawProfile.value.province || ''
  profile.district = rawProfile.value.district || ''
  profile.ward = rawProfile.value.ward || ''
  profile.latitude = rawProfile.value.latitude ? String(rawProfile.value.latitude) : ''
  profile.longitude = rawProfile.value.longitude ? String(rawProfile.value.longitude) : ''
  if (!usesDistrictLevel.value) profile.district = ''
  restoreAdministrativeSelections()
  editingLocation.value = false
}
async function saveLocationEdit() {
  locationValidationError.value = validateAdministrativeHierarchy()
  if (locationValidationError.value) { toast.warning('Địa điểm chưa hợp lệ', locationValidationError.value); return }
  if (await saveProfile()) editingLocation.value = false
}
onMounted(loadProfile)
onBeforeUnmount(() => { for (const field of ['country', 'city', 'district', 'ward'] as AdministrativeField[]) cancelLocationRequest(field) })
</script>
