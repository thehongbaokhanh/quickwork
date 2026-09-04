<template>
  <StudentProfileWorkspace />
  <div v-if="false" class="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
    <div v-if="loading" class="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div class="text-center">
        <Icon name="uil:spinner-alt" class="mx-auto h-8 w-8 animate-spin text-sky-600" />
        <p class="mt-3 text-sm font-semibold text-slate-500">Đang tải hồ sơ...</p>
      </div>
    </div>

    <template v-else>
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="profile-cover relative h-28 sm:h-32">
          <div class="absolute inset-0 flex items-center justify-center text-center text-white">
            <div>
              <p class="text-lg font-black tracking-tight sm:text-xl">Hồ sơ cá nhân - QuickWork</p>
              <p class="mt-1 text-xs font-semibold text-sky-50">Cập nhật hồ sơ để tăng cơ hội nghề nghiệp</p>
            </div>
          </div>
        </div>

        <div class="relative px-4 pb-5 sm:px-6">
          <div class="absolute -top-10 left-4 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-sky-100 shadow-md sm:left-6 sm:h-24 sm:w-24">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="`Ảnh đại diện của ${profileName}`" class="h-full w-full object-cover">
            <span v-else class="flex h-full w-full items-center justify-center text-xl font-black text-sky-700 sm:text-2xl">{{ initials }}</span>
          </div>

          <div class="flex flex-col gap-4 pt-14 sm:pt-16 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{{ profileName }}</h1>
                <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">Sẵn sàng làm việc</span>
              </div>
              <p class="mt-1 text-sm font-bold text-slate-600">{{ professionalTitle }}</p>
              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
                <span class="inline-flex items-center gap-1.5"><Icon name="uil:map-marker" class="h-4 w-4 text-slate-400" />{{ locationLabel }}</span>
                <span class="inline-flex items-center gap-1.5"><Icon name="uil:envelope" class="h-4 w-4 text-slate-400" />{{ email }}</span>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="tag in profileTags" :key="tag" class="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">{{ tag }}</span>
                <span v-if="!profileTags.length" class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Chưa cập nhật kỹ năng</span>
              </div>
            </div>

            <div class="flex shrink-0 flex-wrap gap-2">
              <button type="button" class="profile-button profile-button-secondary" @click="shareProfile"><Icon name="uil:share-alt" class="h-4 w-4" />Chia sẻ</button>
              <NuxtLink to="/settings" class="profile-button bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-200"><Icon name="uil:pen" class="h-4 w-4" />Chỉnh sửa hồ sơ</NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <div class="mt-5 grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div class="space-y-5">
          <section class="profile-card">
            <div class="profile-card-heading">
              <div><h2>Độ mạnh hồ sơ</h2><p>Mức độ hoàn thiện thông tin</p></div>
              <span class="text-sm font-black text-sky-700">{{ completion }}%</span>
            </div>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-sky-600" :style="{ width: `${completion}%` }" /></div>
            <p class="mt-3 text-xs font-semibold leading-5 text-slate-500">{{ completionMessage }}</p>
            <NuxtLink to="/settings" class="mt-4 inline-flex items-center gap-1 text-xs font-black text-sky-700 hover:text-sky-800">Hoàn thiện ngay <Icon name="uil:arrow-right" class="h-4 w-4" /></NuxtLink>
          </section>

          <section class="profile-card">
            <div class="profile-card-heading">
              <div><h2>Kỹ năng</h2><p>Năng lực nổi bật của bạn</p></div>
              <button type="button" aria-label="Chỉnh sửa kỹ năng" class="icon-action" @click="notifyDevelopment('Chỉnh sửa kỹ năng')"><Icon name="uil:pen" class="h-4 w-4" /></button>
            </div>
            <div v-if="skills.length" class="mt-4 flex flex-wrap gap-2">
              <span v-for="skill in skills" :key="skill" class="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700">{{ skill }}</span>
            </div>
            <div v-else class="profile-empty mt-4"><Icon name="uil:award" class="h-5 w-5" /><span>Chưa cập nhật kỹ năng</span></div>
          </section>
        </div>

        <div class="space-y-5">
          <section class="profile-card">
            <div class="profile-card-heading">
              <div><h2>Kinh nghiệm làm việc</h2><p>Quá trình làm việc và dự án</p></div>
              <button type="button" aria-label="Cập nhật kinh nghiệm" class="icon-action" @click="notifyDevelopment('Cập nhật kinh nghiệm làm việc')"><Icon name="uil:plus" class="h-4 w-4" /></button>
            </div>
            <ProfileEmpty icon="uil:briefcase-alt" title="Chưa có kinh nghiệm làm việc" description="Cập nhật hồ sơ khi bạn có kinh nghiệm hoặc dự án mới." />
          </section>

          <section class="profile-card">
            <div class="profile-card-heading">
              <div><h2>Học vấn</h2><p>Thông tin đào tạo của bạn</p></div>
              <button type="button" aria-label="Cập nhật học vấn" class="icon-action" @click="notifyDevelopment('Cập nhật học vấn')"><Icon name="uil:plus" class="h-4 w-4" /></button>
            </div>
            <ProfileEmpty icon="uil:graduation-cap" title="Chưa cập nhật học vấn" description="Bổ sung trường học và chuyên ngành trong hồ sơ." tone="indigo" />
          </section>

          <section class="profile-card">
            <div class="profile-card-heading">
              <div><h2>Tài liệu & Portfolio</h2><p>CV và tài liệu ứng tuyển</p></div>
              <NuxtLink to="/settings" aria-label="Cập nhật tài liệu" class="icon-action"><Icon name="uil:plus" class="h-4 w-4" /></NuxtLink>
            </div>
            <div v-if="cvUrl" class="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Icon name="uil:file-alt" class="h-5 w-5" /></span>
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-black text-slate-800">{{ cvFileName }}</p><p class="mt-0.5 text-xs font-medium text-slate-500">CV ứng tuyển mặc định</p></div>
              <a :href="cvUrl" target="_blank" rel="noopener noreferrer" class="profile-button profile-button-secondary h-9 px-3 text-xs"><Icon name="uil:external-link-alt" class="h-4 w-4" />Xem CV</a>
            </div>
            <ProfileEmpty v-else icon="uil:file-upload-alt" title="Chưa có CV ứng tuyển" description="Tải CV lên từ trang Cài đặt tài khoản." tone="rose" />
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, resolveComponent } from 'vue'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'student', middleware: ['auth'] })

const ProfileEmpty = defineComponent({
  props: { icon: { type: String, required: true }, title: { type: String, required: true }, description: { type: String, required: true }, tone: { type: String, default: 'sky' } },
  setup(props) {
    const tones: Record<string, string> = { sky: 'bg-sky-50 text-sky-700', indigo: 'bg-indigo-50 text-indigo-700', rose: 'bg-rose-50 text-rose-600' }
    return () => h('div', { class: 'profile-empty mt-4 min-h-20' }, [
      h('span', { class: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[props.tone] || tones.sky}` }, [h(resolveComponent('Icon') as any, { name: props.icon, class: 'h-5 w-5' })]),
      h('div', [h('p', { class: 'font-bold text-slate-700' }, props.title), h('p', { class: 'mt-1 text-xs font-medium text-slate-500' }, props.description)])
    ])
  }
})

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(true)
const profileResponse = ref<any>({})
const currentUser = computed<any>(() => profileResponse.value?.data || profileResponse.value || authStore.user || {})
const studentProfile = computed<any>(() => currentUser.value.student_profile || currentUser.value.studentProfile || authStore.user?.student_profile || {})
const email = computed(() => String(currentUser.value.email || authStore.user?.email || 'Chưa cập nhật email'))
const profileName = computed(() => String(studentProfile.value.name || currentUser.value.name || email.value.split('@')[0] || 'Sinh viên QuickWork'))
const avatarUrl = computed(() => String(studentProfile.value.avatar || currentUser.value.avatar || '').trim())
const cvUrl = computed(() => String(studentProfile.value.cv_url || '').trim())
const locationLabel = computed(() => String(studentProfile.value.preferred_location || 'Chưa cập nhật địa điểm'))
const professionalTitle = computed(() => String(studentProfile.value.preferred_category || 'Sinh viên đang tìm kiếm cơ hội nghề nghiệp'))
const skills = computed(() => (Array.isArray(studentProfile.value.skills) ? studentProfile.value.skills : []).map((skill: any) => String(skill?.name || skill?.title || skill).trim()).filter(Boolean))
const profileTags = computed(() => [...skills.value.slice(0, 3), formatJobType(studentProfile.value.preferred_job_type)].filter(Boolean))
const initials = computed(() => profileName.value.split(/\s+/).filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase() || 'SV')
const cvFileName = computed(() => {
  const savedName = String(studentProfile.value.cv_file_name || '').trim()
  if (savedName) return savedName
  try { return decodeURIComponent(new URL(cvUrl.value).pathname.split('/').filter(Boolean).pop() || 'CV ứng tuyển') } catch { return 'CV ứng tuyển' }
})
const completion = computed(() => {
  const values = [profileName.value, studentProfile.value.phone, avatarUrl.value, cvUrl.value, studentProfile.value.preferred_location, studentProfile.value.preferred_category, studentProfile.value.preferred_job_type, skills.value.length]
  return Math.round((values.filter(Boolean).length / values.length) * 100)
})
const completionMessage = computed(() => completion.value >= 80 ? 'Hồ sơ của bạn đã sẵn sàng để nhà tuyển dụng tham khảo.' : 'Bổ sung thêm thông tin để hồ sơ nổi bật hơn với nhà tuyển dụng.')

function formatJobType(value: unknown) {
  const labels: Record<string, string> = { FULL_TIME: 'Toàn thời gian', PART_TIME: 'Bán thời gian', INTERNSHIP: 'Thực tập', REMOTE: 'Remote' }
  return labels[String(value || '').toUpperCase()] || ''
}
async function loadProfile() {
  loading.value = true
  try { profileResponse.value = await StudentService.getProfile() }
  catch (error: any) { toast.error('Không thể tải hồ sơ', error?.data?.message || error?.message || 'Vui lòng thử lại sau.') }
  finally { loading.value = false }
}
async function shareProfile() {
  const shareData = { title: `Hồ sơ QuickWork - ${profileName.value}`, text: `Xem hồ sơ QuickWork của ${profileName.value}`, url: window.location.href }
  try {
    if (navigator.share) await navigator.share(shareData)
    else { await navigator.clipboard.writeText(window.location.href); toast.success('Đã sao chép liên kết', 'Liên kết hồ sơ đã được sao chép vào bộ nhớ tạm.') }
  } catch (error: any) { if (error?.name !== 'AbortError') toast.error('Không thể chia sẻ hồ sơ', 'Vui lòng thử lại sau.') }
}
function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`)
}
// The active profile workspace owns data loading. This legacy markup remains
// temporarily isolated so the redesign does not disturb the student layout.
</script>

<style scoped>
.profile-cover { background: linear-gradient(118deg, #0369a1 0%, #0ea5e9 52%, #38bdf8 100%); }
.profile-card { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5; }
.profile-card-heading { @apply flex items-start justify-between gap-3; }
.profile-card-heading h2 { @apply text-sm font-black text-slate-900 sm:text-base; }
.profile-card-heading p { @apply mt-0.5 text-xs font-medium text-slate-500; }
.profile-empty { @apply flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-xs font-semibold text-slate-500; }
.profile-button { @apply inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition focus:outline-none focus-visible:ring-4; }
.profile-button-secondary { @apply border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus-visible:ring-sky-100; }
.icon-action { @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100; }
</style>
