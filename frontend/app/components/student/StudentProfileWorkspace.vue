<template>
  <main class="mx-auto w-full max-w-[1240px] px-3 py-5 sm:px-5 lg:px-6">
    <div v-if="loading" class="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <Icon name="uil:spinner-alt" class="h-8 w-8 animate-spin text-sky-600" />
    </div>

    <template v-else>
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="h-28 bg-gradient-to-r from-slate-950 via-sky-800 to-sky-500 sm:h-32" />
        <div class="relative px-4 pb-5 sm:px-6">
          <div class="absolute -top-11 left-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-sky-100 shadow-md sm:left-6">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="profileName" class="h-full w-full object-cover" @error="avatarFailed = true">
            <span v-else class="flex h-full w-full items-center justify-center text-2xl font-black text-sky-700">{{ initials }}</span>
          </div>
          <div class="flex flex-col gap-4 pt-16 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2"><h1 class="text-2xl font-black text-slate-950">{{ profileName }}</h1><span class="chip">Sinh viên</span></div>
              <p class="mt-1 text-sm font-bold text-slate-600">{{ professionalTitle }}</p>
              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
                <span><Icon name="uil:envelope" class="mr-1 inline h-4 w-4" />{{ email || 'Chưa cập nhật email' }}</span>
                <span><Icon name="uil:phone" class="mr-1 inline h-4 w-4" />{{ phone || 'Chưa cập nhật số điện thoại' }}</span>
                <span><Icon name="uil:map-marker" class="mr-1 inline h-4 w-4" />{{ location || 'Chưa cập nhật địa điểm' }}</span>
              </div>
              <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{{ summary || 'Hãy thêm phần giới thiệu ngắn để nhà tuyển dụng hiểu rõ hơn về bạn.' }}</p>
              <div class="mt-3 flex flex-wrap gap-2"><span v-for="skill in skills" :key="skill.ID || skill.id" class="chip">{{ skill.Name || skill.name }}</span><span v-if="!skills.length" class="chip-muted">Chưa cập nhật kỹ năng</span></div>
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <button class="btn-secondary" type="button" @click="shareProfile"><Icon name="uil:share-alt" />Chia sẻ</button>
              <button class="btn-primary" type="button" @click="openBasic"><Icon name="uil:pen" />Chỉnh sửa hồ sơ</button>
            </div>
          </div>
        </div>
      </section>

      <div class="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="space-y-5">
          <section class="card">
            <div class="flex items-center justify-between"><h2>Độ mạnh hồ sơ</h2><strong class="text-sky-700">{{ completion }}%</strong></div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-sky-600 transition-all" :style="{ width: `${completion}%` }" /></div>
            <p class="mt-3 text-xs leading-5 text-slate-500">{{ missingFields.length ? `Còn thiếu: ${missingFields.join(', ')}.` : 'Hồ sơ của bạn đã có đầy đủ các nội dung chính.' }}</p>
            <button v-if="missingFields.length" class="mt-3 text-sm font-black text-sky-700" type="button" @click="openBasic">Hoàn thiện ngay →</button>
          </section>

          <section class="card">
            <CardHeading title="Kỹ năng" subtitle="Năng lực nổi bật của bạn" icon="uil:pen" @action="openSkills" />
            <div v-if="skills.length" class="mt-4 space-y-3">
              <div v-for="group in selectedSkillGroups" :key="group.name" class="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p class="text-[10px] font-black uppercase tracking-wide text-slate-400">{{ group.name }}</p>
                <div class="mt-2 flex flex-wrap gap-2"><span v-for="skill in group.skills" :key="skillId(skill)" class="chip">{{ skillName(skill) }}</span></div>
              </div>
            </div>
            <EmptyState v-else icon="uil:award" text="Chưa cập nhật kỹ năng" />
          </section>
        </aside>

        <div class="space-y-5 min-w-0">
          <section class="card">
            <CardHeading title="Kinh nghiệm làm việc" subtitle="Quá trình làm việc và dự án" icon="uil:plus" @action="openExperience()" />
            <div v-if="experiences.length" class="mt-4 divide-y divide-slate-100">
              <article v-for="item in experiences" :key="item.ID || item.id" class="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div class="entity-icon"><Icon name="uil:briefcase-alt" /></div>
                <div class="min-w-0 flex-1"><h3>{{ item.position }}</h3><p class="text-sm font-semibold text-slate-600">{{ item.company }}</p><p class="mt-1 text-xs text-slate-500">{{ period(item.start_date, item.end_date, item.is_current) }}</p><p v-if="item.description" class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{{ item.description }}</p></div>
                <EntityActions @edit="openExperience(item)" @remove="removeExperience(item)" />
              </article>
            </div>
            <EmptyState v-else icon="uil:briefcase-alt" text="Chưa có kinh nghiệm làm việc" />
          </section>

          <section class="card">
            <CardHeading title="Học vấn" subtitle="Thông tin đào tạo của bạn" icon="uil:plus" @action="openEducation()" />
            <div v-if="educations.length" class="mt-4 divide-y divide-slate-100">
              <article v-for="item in educations" :key="item.ID || item.id" class="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div class="entity-icon bg-indigo-50 text-indigo-600"><Icon name="uil:graduation-cap" /></div>
                <div class="min-w-0 flex-1"><h3>{{ item.school }}</h3><p class="text-sm font-semibold text-slate-600">{{ [item.degree, item.major].filter(Boolean).join(' · ') }}</p><p class="mt-1 text-xs text-slate-500">{{ period(item.start_date, item.end_date) }}</p><p v-if="item.description" class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{{ item.description }}</p></div>
                <EntityActions @edit="openEducation(item)" @remove="removeEducation(item)" />
              </article>
            </div>
            <EmptyState v-else icon="uil:graduation-cap" text="Chưa cập nhật học vấn" />
          </section>

          <section class="card">
            <CardHeading title="Tài liệu & Portfolio" subtitle="CV và liên kết giới thiệu năng lực" icon="uil:pen" @action="openDocuments" />
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div v-if="cvUrl" class="document-card"><Icon name="uil:file-alt" class="text-rose-500" /><span class="min-w-0 flex-1"><strong class="block truncate">{{ cvFileName }}</strong><small>Xem hoặc thay tài liệu hiện tại</small></span><a :href="cvUrl" target="_blank" rel="noopener" class="icon-btn" aria-label="Xem CV"><Icon name="uil:external-link-alt" /></a><button class="icon-btn hover:!text-rose-600" type="button" aria-label="Xóa CV" @click="removeCV"><Icon name="uil:trash-alt" /></button></div>
              <div v-else class="document-card text-slate-500"><Icon name="uil:file-question-alt" /><span>Chưa tải CV</span></div>
              <article v-for="item in portfolios" :key="item.ID || item.id || item.url" class="document-card"><Icon name="uil:link" class="text-sky-600" /><span class="min-w-0 flex-1"><strong>{{ item.title || 'Portfolio' }}</strong><small class="truncate">{{ item.url }}</small></span><a :href="item.url" target="_blank" rel="noopener" class="icon-btn" aria-label="Mở portfolio"><Icon name="uil:external-link-alt" /></a><EntityActions v-if="item.id || item.ID" @edit="openPortfolio(item)" @remove="removePortfolio(item)" /></article>
              <button class="document-card border-dashed text-sky-700" type="button" @click="openPortfolio()"><Icon name="uil:plus" /><span>{{ portfolios.length ? 'Thêm Portfolio' : 'Chưa có Portfolio — thêm ngay' }}</span></button>
            </div>
          </section>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="editor" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3" @mousedown.self="closeEditor">
        <section class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-slate-50 shadow-2xl">
          <header class="z-10 flex shrink-0 items-center justify-between border-b border-sky-100 bg-gradient-to-r from-white via-sky-50 to-indigo-50 px-5 py-4 sm:px-6"><div><p class="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Hồ sơ sinh viên</p><h2 class="mt-1 text-xl font-black text-slate-950">{{ editorTitle }}</h2><p class="mt-1 text-xs font-semibold text-slate-500">Các trường có dấu * là thông tin cần thiết.</p></div><button class="icon-btn" type="button" aria-label="Đóng cửa sổ chỉnh sửa" title="Đóng" @click="closeEditor"><Icon name="uil:times" /></button></header>
          <div class="profile-editor-scroll min-h-0 flex-1 overflow-y-auto">
            <form class="space-y-4 p-4 sm:p-6" @submit.prevent="saveEditor">
            <template v-if="editor === 'basic'">
              <section class="editor-section"><EditorSectionTitle icon="uil:user" title="Thông tin cơ bản" subtitle="Thông tin liên hệ hiển thị trong hồ sơ của bạn." /><div class="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Họ và tên *"><input v-model.trim="basicForm.name" required placeholder="Nhập họ và tên"></Field><Field label="Số điện thoại"><input v-model.trim="basicForm.phone" placeholder="Ví dụ: 0912345678"></Field></div><div class="mt-4"><Field label="Ảnh đại diện"><input type="file" accept="image/*" @change="selectFile($event, 'avatar')"><small>JPG, JPEG hoặc PNG; tối đa 5 MB.</small></Field></div></section>
              <section class="editor-section"><EditorSectionTitle icon="uil:briefcase-alt" title="Định hướng nghề nghiệp" subtitle="Giúp hệ thống và nhà tuyển dụng hiểu mục tiêu của bạn." /><div class="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Địa điểm"><input v-model.trim="basicForm.preferred_location" placeholder="Ví dụ: TP. Hồ Chí Minh"></Field><Field label="Vị trí / ngành nghề mong muốn"><input v-model.trim="basicForm.preferred_category" placeholder="Ví dụ: Backend Developer"></Field></div><div class="mt-4"><Field label="Giới thiệu bản thân"><textarea v-model.trim="basicForm.summary" rows="5" maxlength="1000" placeholder="Tóm tắt kinh nghiệm, thế mạnh và mục tiêu nghề nghiệp..." /></Field></div></section>
            </template>

            <template v-else-if="editor === 'skills'">
              <section class="editor-section">
                <EditorSectionTitle icon="uil:award" title="Chọn kỹ năng theo danh mục" subtitle="Tìm kiếm và chọn đúng những kỹ năng bạn có thể sử dụng." />
                <label class="mt-4 flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100"><Icon name="uil:search" class="h-4 w-4 text-slate-400" /><input v-model.trim="skillSearch" class="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none ring-0" placeholder="Tìm kỹ năng hoặc danh mục..."></label>
                <div v-if="skillGroups.length" class="profile-editor-scroll mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-2">
                  <section v-for="group in skillGroups" :key="group.name" class="rounded-xl border border-slate-200 bg-white p-3"><div class="flex items-center justify-between gap-3"><h4 class="text-xs font-black uppercase tracking-wide text-slate-600">{{ group.name }}</h4><span class="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700">{{ selectedCount(group.skills) }}/{{ group.skills.length }}</span></div><div class="mt-3 grid gap-2 sm:grid-cols-2"><label v-for="skill in group.skills" :key="skillId(skill)" :class="['skill-option', selectedSkillIds.includes(skillId(skill)) ? 'skill-option-selected' : '']"><input v-model="selectedSkillIds" type="checkbox" :value="skillId(skill)"><span>{{ skillName(skill) }}</span><Icon v-if="selectedSkillIds.includes(skillId(skill))" name="uil:check" class="ml-auto h-4 w-4 text-sky-600" /></label></div></section>
                </div>
                <p v-else class="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-500">Không tìm thấy kỹ năng phù hợp.</p>
              </section>
              <section class="editor-section border-dashed">
                <EditorSectionTitle icon="uil:plus-circle" title="Chưa tìm thấy kỹ năng?" subtitle="Thêm kỹ năng vào danh mục có sẵn hoặc tạo danh mục mới cùng kỹ năng đầu tiên." />
                <div class="mt-5 grid items-start gap-5 sm:grid-cols-2">
                  <div class="skill-create-field">
                    <div class="skill-create-label-row"><label for="new-skill-name">Tên kỹ năng</label></div>
                    <input id="new-skill-name" v-model.trim="newSkillName" class="profile-control" maxlength="100" placeholder="Ví dụ: FastAPI">
                    <p class="skill-create-help">Nhập tên ngắn gọn, dễ nhận biết.</p>
                  </div>
                  <div class="skill-create-field">
                    <div class="skill-create-label-row">
                      <label :for="creatingSkillCategory ? 'new-skill-category' : undefined">{{ creatingSkillCategory ? 'Tên danh mục mới' : 'Danh mục' }}</label>
                      <button type="button" class="category-mode-button" :disabled="creatingSkill" @click="toggleSkillCategoryMode">
                        <Icon :name="creatingSkillCategory ? 'uil:list-ul' : 'uil:folder-plus'" class="h-4 w-4" />
                        {{ creatingSkillCategory ? 'Chọn danh mục có sẵn' : 'Tạo danh mục mới' }}
                      </button>
                    </div>
                    <input v-if="creatingSkillCategory" id="new-skill-category" v-model.trim="newSkillCategoryName" class="profile-control" maxlength="100" placeholder="Ví dụ: Backend Development">
                    <ScrollSelect v-else v-model="newSkillCategoryId" :options="skillCategoryOptions" aria-label="Chọn danh mục kỹ năng" icon="uil:folder" size="form" />
                    <p class="skill-create-help">{{ creatingSkillCategory ? 'Danh mục sẽ được tạo cùng kỹ năng đầu tiên.' : 'Kỹ năng mới sẽ được thêm vào danh mục đã chọn.' }}</p>
                  </div>
                </div>
                <button type="button" class="btn-secondary mt-5" :disabled="creatingSkill" @click="createSkillAndSelect"><Icon :name="creatingSkill ? 'svg-spinners:180-ring' : (creatingSkillCategory ? 'uil:folder-plus' : 'uil:plus')" />{{ creatingSkillCategory ? 'Tạo danh mục và thêm kỹ năng' : 'Thêm và chọn kỹ năng' }}</button>
              </section>
            </template>

            <template v-else-if="editor === 'experience'">
              <section class="editor-section"><EditorSectionTitle icon="uil:briefcase-alt" title="Công việc và đơn vị" subtitle="Nhập rõ chức danh và tên công ty hoặc dự án." /><div class="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Vị trí *"><input v-model.trim="experienceForm.position" required placeholder="Ví dụ: Backend Developer Intern"></Field><Field label="Công ty *"><input v-model.trim="experienceForm.company" required placeholder="Tên công ty hoặc dự án"></Field></div></section>
              <section class="editor-section"><EditorSectionTitle icon="uil:calendar-alt" title="Thời gian làm việc" subtitle="Khoảng thời gian giúp nhà tuyển dụng hiểu mức độ kinh nghiệm." /><label :class="['toggle-card mt-4', experienceForm.is_current ? 'toggle-card-active' : '']"><input v-model="experienceForm.is_current" type="checkbox"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm"><Icon name="uil:briefcase-alt" class="h-4 w-4" /></span><span class="min-w-0 flex-1"><strong class="block text-sm text-slate-800">Tôi đang làm việc tại đây</strong><small class="mt-0.5 block text-xs font-semibold text-slate-500">Ngày kết thúc sẽ không được gửi khi lựa chọn này bật.</small></span></label><div class="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Bắt đầu *"><input v-model="experienceForm.start_date" type="date" required></Field><Field v-if="!experienceForm.is_current" label="Kết thúc"><input v-model="experienceForm.end_date" type="date"></Field><div v-else class="rounded-xl border border-dashed border-sky-200 bg-sky-50 p-3"><p class="text-xs font-black text-sky-700">Đang làm việc</p><p class="mt-1 text-xs font-semibold leading-5 text-slate-500">Ngày kết thúc tạm ẩn. Bỏ chọn phía trên để thấy lại giá trị đã nhập trước đó.</p></div></div></section>
              <section class="editor-section"><EditorSectionTitle icon="uil:align-left" title="Mô tả công việc" subtitle="Nêu nhiệm vụ, công nghệ và kết quả nổi bật." /><div class="mt-4"><Field label="Mô tả"><textarea v-model.trim="experienceForm.description" rows="5" placeholder="Mô tả ngắn gọn những gì bạn đã thực hiện..." /></Field></div></section>
            </template>

            <template v-else-if="editor === 'education'">
              <section class="editor-section"><EditorSectionTitle icon="uil:graduation-cap" title="Thông tin đào tạo" subtitle="Tên trường, chuyên ngành và văn bằng của bạn." /><div class="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Trường *"><input v-model.trim="educationForm.school" required placeholder="Tên trường hoặc cơ sở đào tạo"></Field><Field label="Chuyên ngành *"><input v-model.trim="educationForm.major" required placeholder="Ví dụ: Kỹ thuật phần mềm"></Field><Field label="Bằng cấp"><input v-model.trim="educationForm.degree" placeholder="Ví dụ: Cử nhân"></Field></div></section>
              <section class="editor-section"><EditorSectionTitle icon="uil:calendar-alt" title="Thời gian học" subtitle="Có thể bỏ trống ngày kết thúc nếu chưa xác định." /><div class="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Bắt đầu *"><input v-model="educationForm.start_date" type="date" required></Field><Field label="Kết thúc"><input v-model="educationForm.end_date" type="date"></Field></div></section>
              <section class="editor-section"><EditorSectionTitle icon="uil:align-left" title="Thông tin bổ sung" subtitle="Thành tích, hoạt động hoặc nội dung đào tạo nổi bật." /><div class="mt-4"><Field label="Mô tả"><textarea v-model.trim="educationForm.description" rows="5" placeholder="Ví dụ: GPA, đồ án, câu lạc bộ..." /></Field></div></section>
            </template>

            <template v-else-if="editor === 'documents'">
              <Field label="CV ứng tuyển">
                <div class="dropzone" :class="{ 'border-sky-500 bg-sky-50': dropActive }" @dragenter.prevent="dropActive = true" @dragover.prevent="dropActive = true" @dragleave.prevent="dropActive = false" @drop.prevent="dropCV">
                  <Icon name="uil:file-upload-alt" class="h-7 w-7 text-sky-600" />
                  <strong>{{ pendingCV?.name || (cvUrl ? 'Thay CV hiện tại' : 'Chọn hoặc kéo-thả CV vào đây') }}</strong>
                  <small>PDF, DOC hoặc DOCX, tối đa 10 MB.</small>
                  <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" @change="selectFile($event, 'cv')">
                </div>
              </Field>
            </template>

            <template v-else-if="editor === 'portfolio'">
              <Field label="Tên Portfolio"><input v-model.trim="portfolioForm.title" required maxlength="150" placeholder="Ví dụ: Website cá nhân"></Field>
              <Field label="Liên kết"><input v-model.trim="portfolioForm.url" required type="url" maxlength="500" placeholder="https://..."></Field>
            </template>

            <p v-if="formError" class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{{ formError }}</p>
            <footer class="sticky bottom-0 -mx-4 -mb-4 flex justify-end gap-2 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6"><button class="btn-secondary" type="button" :disabled="saving" @click="closeEditor">Hủy</button><button class="btn-primary" type="submit" :disabled="saving"><Icon v-if="saving" name="uil:spinner-alt" class="animate-spin" />Lưu thay đổi</button></footer>
            </form>
          </div>
        </section>
      </div>

      <div v-if="deleteRequest" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true" :aria-labelledby="deleteDialogTitleId" @mousedown.self="cancelDelete">
        <section class="w-full max-w-md overflow-hidden rounded-[26px] border border-rose-100 bg-white shadow-2xl shadow-slate-950/20">
          <div class="bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 text-center"><span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-lg shadow-rose-100"><Icon name="uil:trash-alt" class="h-7 w-7" /></span><h2 :id="deleteDialogTitleId" class="mt-4 text-xl font-black text-slate-950">{{ deleteDialogTitle }}</h2><p class="mt-2 text-sm font-semibold leading-6 text-slate-600">{{ deleteDialogMessage }}</p></div>
          <div class="flex gap-3 border-t border-slate-100 p-4"><button type="button" class="btn-secondary flex-1" :disabled="deleting" @click="cancelDelete">Giữ lại</button><button type="button" class="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-700 disabled:opacity-60" :disabled="deleting" @click="confirmDelete"><Icon :name="deleting ? 'svg-spinners:180-ring' : 'uil:trash-alt'" />Xóa khỏi hồ sơ</button></div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref, resolveComponent } from 'vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'
import { StudentService } from '~/services/student.service'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { getStudentProfileCompletion, getStudentProfileCompletionChecks } from '~/utils/studentProfileCompletion'

const toast = useToast()
const authStore = useAuthStore()
const loading = ref(true), saving = ref(false), avatarFailed = ref(false), dropActive = ref(false), creatingSkill = ref(false), deleting = ref(false)
const profileData = ref<any>({}), skillCatalog = ref<any[]>([]), editor = ref<string>(''), editingId = ref<number | null>(null), formError = ref('')
const pendingAvatar = ref<File | null>(null), pendingCV = ref<File | null>(null), selectedSkillIds = ref<number[]>([])
const skillSearch = ref(''), newSkillName = ref(''), newSkillCategoryName = ref(''), creatingSkillCategory = ref(false)
const newSkillCategoryId = ref(0)
const deleteRequest = ref<{ kind: 'experience' | 'education' | 'portfolio' | 'cv'; item?: any } | null>(null)
const deleteDialogTitleId = 'student-profile-delete-title'
const basicForm = reactive({ name: '', phone: '', preferred_location: '', preferred_category: '', summary: '' })
const experienceForm = reactive({ position: '', company: '', start_date: '', end_date: '', is_current: false, description: '' })
const educationForm = reactive({ school: '', major: '', degree: '', start_date: '', end_date: '', description: '' })
const portfolioForm = reactive({ title: '', url: '' })

const user = computed(() => profileData.value?.data || profileData.value?.user || profileData.value || {})
const profile = computed(() => user.value?.student_profile || user.value?.studentProfile || user.value?.profile || {})
const profileName = computed(() => profile.value.name || user.value.name || 'Sinh viên QuickWork')
const email = computed(() => user.value.email || profile.value.email || '')
const phone = computed(() => profile.value.phone || '')
const location = computed(() => profile.value.preferred_location || profile.value.location || '')
const summary = computed(() => profile.value.summary || '')
const portfolioUrl = computed(() => profile.value.portfolio_url || '')
const avatarUrl = computed(() => avatarFailed.value ? '' : (profile.value.avatar || profile.value.avatar_url || ''))
const cvUrl = computed(() => profile.value.cv_url || profile.value.CVURL || '')
const cvFileName = computed(() => {
  const savedName = String(profile.value.cv_file_name || profile.value.CVFileName || '').trim()
  if (savedName) return savedName
  try { return decodeURIComponent(new URL(cvUrl.value).pathname.split('/').filter(Boolean).pop() || 'CV ứng tuyển') } catch { return 'CV ứng tuyển' }
})
const skills = computed<any[]>(() => profile.value.skills || profile.value.Skills || [])
const selectedSkillGroups = computed(() => groupSkills(skills.value))
const skillCategoryOptions = computed(() => {
  const categories = new Map<number, string>()
  skillCatalog.value.forEach((skill) => {
    const id = Number(skill.category_id || skill.CategoryID || skill.category?.id || skill.category?.ID || skill.Category?.id || skill.Category?.ID || 0)
    const name = skillCategoryName(skill)
    if (id > 0) categories.set(id, name)
  })
  return Array.from(categories, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, 'vi'))
})
const skillGroups = computed(() => {
  const query = skillSearch.value.trim().toLocaleLowerCase('vi')
  const filtered = skillCatalog.value.filter((skill) => {
    if (!query) return true
    return `${skillName(skill)} ${skillCategoryName(skill)}`.toLocaleLowerCase('vi').includes(query)
  })
  return groupSkills(filtered)
})
const experiences = computed<any[]>(() => profile.value.work_experiences || profile.value.WorkExperiences || [])
const educations = computed<any[]>(() => profile.value.educations || profile.value.Educations || [])
const portfolios = computed<any[]>(() => {
  const items = profile.value.portfolios || profile.value.Portfolios || []
  if (items.length) return items
  return portfolioUrl.value ? [{ title: 'Portfolio', url: portfolioUrl.value }] : []
})
const initials = computed(() => profileName.value.split(/\s+/).filter(Boolean).slice(-2).map((v: string) => v[0]).join('').toUpperCase())
const professionalTitle = computed(() => profile.value.preferred_category || 'Sinh viên đang tìm kiếm cơ hội nghề nghiệp')
const missingChecks = computed(() => getStudentProfileCompletionChecks(profileData.value))
const missingFields = computed(() => missingChecks.value.filter(v => !v.ok).map(v => v.label))
const completion = computed(() => getStudentProfileCompletion(profileData.value))
const editorTitle = computed(() => ({ basic: 'Chỉnh sửa hồ sơ', skills: 'Cập nhật kỹ năng', experience: editingId.value ? 'Sửa kinh nghiệm' : 'Thêm kinh nghiệm', education: editingId.value ? 'Sửa học vấn' : 'Thêm học vấn', documents: 'Cập nhật CV ứng tuyển', portfolio: editingId.value ? 'Sửa Portfolio' : 'Thêm Portfolio' } as any)[editor.value] || '')
const deleteDialogTitle = computed(() => ({ experience: 'Xóa kinh nghiệm này?', education: 'Xóa thông tin học vấn?', portfolio: 'Xóa Portfolio này?', cv: 'Xóa CV hiện tại?' } as const)[deleteRequest.value?.kind || 'cv'])
const deleteDialogMessage = computed(() => {
  const request = deleteRequest.value
  if (!request) return ''
  if (request.kind === 'experience') return `${request.item?.position || 'Kinh nghiệm'} tại ${request.item?.company || 'đơn vị này'} sẽ bị xóa khỏi hồ sơ của bạn.`
  if (request.kind === 'education') return `Thông tin học vấn tại ${request.item?.school || 'cơ sở đào tạo này'} sẽ bị xóa khỏi hồ sơ.`
  if (request.kind === 'portfolio') return `${request.item?.title || 'Portfolio'} sẽ không còn hiển thị trong hồ sơ.`
  return 'Liên kết CV hiện tại sẽ được gỡ khỏi hồ sơ. Tệp trên dịch vụ lưu trữ không bị xóa.'
})

async function loadProfile(initial = true) { if (initial) loading.value = true; try { const [p, s] = await Promise.all([StudentService.getProfile(), StudentService.getSkills().catch(() => [])]); profileData.value = p || {}; skillCatalog.value = Array.isArray(s) ? s : (s?.skills || s?.data || []); avatarFailed.value = false; syncAuthProfile() } catch (e: any) { toast.error('Không thể tải hồ sơ', apiError(e)) } finally { loading.value = false } }
function syncAuthProfile() {
  if (!authStore.user) return
  const currentUser = user.value || {}
  const currentProfile = profile.value || {}
  authStore.setCurrentUser({
    ...authStore.user,
    name: String(currentProfile.name || currentUser.name || authStore.user.name || ''),
    avatar: String(currentProfile.avatar || currentProfile.avatar_url || currentUser.avatar || authStore.user.avatar || ''),
    student_profile: currentProfile,
    studentProfile: currentProfile
  })
}
function open(type: string) { editor.value = type; formError.value = ''; editingId.value = null }
function openBasic() { Object.assign(basicForm, { name: profileName.value, phone: phone.value, preferred_location: location.value, preferred_category: profile.value.preferred_category || '', summary: summary.value }); pendingAvatar.value = null; open('basic') }
function openSkills() { selectedSkillIds.value = skills.value.map(skillId); skillSearch.value = ''; newSkillName.value = ''; newSkillCategoryName.value = ''; newSkillCategoryId.value = Number(skillCategoryOptions.value[0]?.value || 0); creatingSkillCategory.value = skillCategoryOptions.value.length === 0; open('skills') }
function openExperience(item?: any) { Object.assign(experienceForm, { position: item?.position || '', company: item?.company || '', start_date: dateInput(item?.start_date), end_date: dateInput(item?.end_date), is_current: !!item?.is_current, description: item?.description || '' }); open('experience'); editingId.value = item ? Number(item.ID || item.id) : null }
function openEducation(item?: any) { Object.assign(educationForm, { school: item?.school || '', major: item?.major || '', degree: item?.degree || '', start_date: dateInput(item?.start_date), end_date: dateInput(item?.end_date), description: item?.description || '' }); open('education'); editingId.value = item ? Number(item.ID || item.id) : null }
function openDocuments() { pendingCV.value = null; dropActive.value = false; open('documents') }
function openPortfolio(item?: any) { Object.assign(portfolioForm, { title: item?.title || '', url: item?.url || '' }); open('portfolio'); editingId.value = item ? Number(item.ID || item.id) : null }
function closeEditor() { if (!saving.value) editor.value = '' }
function selectFile(event: Event, kind: 'avatar' | 'cv') { const file = (event.target as HTMLInputElement).files?.[0] || null; setPendingFile(file, kind) }
function dropCV(event: DragEvent) { dropActive.value = false; setPendingFile(event.dataTransfer?.files?.[0] || null, 'cv') }
function setPendingFile(file: File | null, kind: 'avatar' | 'cv') { formError.value = ''; if (!file) return; const ext = `.${file.name.split('.').pop()?.toLowerCase()}`; const allowed = kind === 'avatar' ? ['.jpg', '.jpeg', '.png'] : ['.pdf', '.doc', '.docx']; const limit = kind === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; if (!allowed.includes(ext)) { formError.value = kind === 'avatar' ? 'Ảnh đại diện phải là JPG, JPEG hoặc PNG.' : 'CV phải là PDF, DOC hoặc DOCX.'; return } if (file.size <= 0 || file.size > limit) { formError.value = `Tệp phải có dung lượng tối đa ${kind === 'avatar' ? 5 : 10} MB.`; return } if (kind === 'avatar') pendingAvatar.value = file; else pendingCV.value = file }
function uploadURL(response: any) { return String(response?.data?.url || response?.url || '').trim() }
function uploadName(response: any, fallback: string) { return String(response?.data?.name || response?.name || fallback).trim() }
function skillId(skill: any) { return Number(skill?.ID || skill?.id || 0) }
function skillName(skill: any) { return String(skill?.Name || skill?.name || 'Kỹ năng chưa đặt tên').trim() }
function skillCategoryName(skill: any) { return String(skill?.Category?.Name || skill?.category?.name || 'Kỹ năng khác').trim() || 'Kỹ năng khác' }
function groupSkills(items: any[]) {
  const groups = new Map<string, any[]>()
  items.forEach((skill) => {
    const category = skillCategoryName(skill)
    groups.set(category, [...(groups.get(category) || []), skill])
  })
  return Array.from(groups, ([name, groupedSkills]) => ({ name, skills: groupedSkills.sort((a, b) => skillName(a).localeCompare(skillName(b), 'vi')) })).sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}
function selectedCount(items: any[]) { return items.filter((skill) => selectedSkillIds.value.includes(skillId(skill))).length }
function toggleSkillCategoryMode() {
  creatingSkillCategory.value = !creatingSkillCategory.value
  formError.value = ''
  if (creatingSkillCategory.value) {
    newSkillCategoryId.value = 0
  } else {
    newSkillCategoryName.value = ''
    newSkillCategoryId.value = Number(skillCategoryOptions.value[0]?.value || 0)
  }
}

async function createSkillAndSelect() {
  if (creatingSkill.value) return
  const name = newSkillName.value.trim()
  const categoryName = newSkillCategoryName.value.trim()
  if (!name) { formError.value = 'Vui lòng nhập tên kỹ năng cần thêm.'; return }
  if (creatingSkillCategory.value && !categoryName) { formError.value = 'Vui lòng nhập tên danh mục mới.'; return }
  if (!creatingSkillCategory.value && !newSkillCategoryId.value) { formError.value = 'Vui lòng chọn danh mục kỹ năng.'; return }
  creatingSkill.value = true
  formError.value = ''
  try {
    const response: any = await StudentService.createSkill({ name, category_id: creatingSkillCategory.value ? 0 : newSkillCategoryId.value, category_name: creatingSkillCategory.value ? categoryName : '' })
    const createdSkill = response?.data
    const id = skillId(createdSkill)
    if (!response?.success || !id) throw new Error(response?.message || 'Không thể thêm kỹ năng.')
    if (!skillCatalog.value.some((skill) => skillId(skill) === id)) skillCatalog.value = [...skillCatalog.value, createdSkill]
    if (!selectedSkillIds.value.includes(id)) selectedSkillIds.value = [...selectedSkillIds.value, id]
    newSkillName.value = ''
    newSkillCategoryName.value = ''
    newSkillCategoryId.value = Number(createdSkill?.category_id || createdSkill?.category?.id || 0)
    creatingSkillCategory.value = false
    toast.success('Đã thêm kỹ năng', `${skillName(createdSkill)} đã được chọn trong hồ sơ.`)
  } catch (e: any) {
    formError.value = apiError(e)
  } finally {
    creatingSkill.value = false
  }
}
async function saveEditor() { if (saving.value) return; saving.value = true; formError.value = ''; try { if (editor.value === 'basic') { const payload: any = { ...basicForm }; if (pendingAvatar.value) { const uploaded = await StudentService.uploadProfileFile(pendingAvatar.value, 'avatar'); payload.avatar = uploadURL(uploaded); if (!payload.avatar) throw new Error('Tải ảnh thành công nhưng không nhận được URL ảnh.') } await StudentService.updateProfile(payload) } else if (editor.value === 'skills') await StudentService.updateProfile({ skill_ids: selectedSkillIds.value })
    else if (editor.value === 'experience') { const payload = { ...experienceForm, end_date: experienceForm.is_current ? '' : experienceForm.end_date }; editingId.value ? await StudentService.updateWorkExperience(editingId.value, payload) : await StudentService.createWorkExperience(payload) }
    else if (editor.value === 'education') editingId.value ? await StudentService.updateEducation(editingId.value, educationForm) : await StudentService.createEducation(educationForm)
    else if (editor.value === 'documents') { if (!pendingCV.value) throw new Error('Vui lòng chọn CV cần tải lên.'); const uploaded = await StudentService.uploadProfileFile(pendingCV.value, 'cv'); const url = uploadURL(uploaded); if (!url) throw new Error('Tải CV thành công nhưng không nhận được URL tệp.'); await StudentService.updateProfile({ cv_url: url, cv_file_name: uploadName(uploaded, pendingCV.value.name) }) }
    else if (editor.value === 'portfolio') editingId.value ? await StudentService.updatePortfolio(editingId.value, portfolioForm) : await StudentService.createPortfolio(portfolioForm)
    await loadProfile(false); editor.value = ''; toast.success('Đã lưu thay đổi', 'Hồ sơ của bạn đã được cập nhật.')
  } catch (e: any) { formError.value = apiError(e) } finally { saving.value = false } }
function removeExperience(item: any) { deleteRequest.value = { kind: 'experience', item } }
function removeEducation(item: any) { deleteRequest.value = { kind: 'education', item } }
function removePortfolio(item: any) { deleteRequest.value = { kind: 'portfolio', item } }
function removeCV() { deleteRequest.value = { kind: 'cv' } }
function cancelDelete() { if (!deleting.value) deleteRequest.value = null }
async function confirmDelete() {
  const request = deleteRequest.value
  if (!request || deleting.value) return
  deleting.value = true
  try {
    if (request.kind === 'experience') await StudentService.deleteWorkExperience(request.item?.ID || request.item?.id)
    else if (request.kind === 'education') await StudentService.deleteEducation(request.item?.ID || request.item?.id)
    else if (request.kind === 'portfolio') await StudentService.deletePortfolio(request.item?.ID || request.item?.id)
    else await StudentService.updateProfile({ cv_url: '', cv_file_name: '' })
    await loadProfile(false)
    deleteRequest.value = null
    toast.success('Đã xóa khỏi hồ sơ', request.kind === 'cv' ? 'CV hiện tại đã được gỡ.' : 'Thông tin đã được xóa thành công.')
  } catch (e: any) {
    toast.error('Không thể xóa', apiError(e))
  } finally {
    deleting.value = false
  }
}
async function shareProfile() { try { if (navigator.share) await navigator.share({ title: `Hồ sơ QuickWork - ${profileName.value}`, url: window.location.href }); else { await navigator.clipboard.writeText(window.location.href); toast.success('Đã sao chép liên kết', 'Bạn có thể chia sẻ liên kết hồ sơ này.') } } catch (e: any) { if (e?.name !== 'AbortError') toast.error('Không thể chia sẻ', 'Vui lòng thử lại.') } }
function dateInput(value: any) { return value ? String(value).slice(0, 10) : '' }
function shortProfileDate(value: any) {
  const normalized = dateInput(value)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)
  return match ? `${match[3]}/${match[2]}/${match[1].slice(-2)}` : (normalized || 'Chưa rõ')
}
function period(start: any, end: any, current = false) { return [shortProfileDate(start), current ? 'Hiện tại' : shortProfileDate(end)].join(' – ') }
function apiError(e: any) { return e?.data?.message || e?.data?.detail || e?.response?.data?.message || e?.response?.data?.detail || e?.message || 'Vui lòng kiểm tra thông tin và thử lại.' }

const CardHeading = defineComponent({ props: { title: String, subtitle: String, icon: String }, emits: ['action'], setup(props, { emit }) { return () => { const actionText = props.icon === 'uil:plus' ? 'Thêm' : 'Chỉnh sửa'; const actionLabel = `${actionText} ${props.title || ''}`; return h('div', { class: 'flex items-start justify-between gap-3' }, [h('div', { class: 'flex min-w-0 items-start gap-2.5' }, [h('span', { class: 'mt-0.5 h-9 w-1 shrink-0 rounded-full bg-sky-500', 'aria-hidden': 'true' }), h('div', [h('h2', { class: 'text-lg font-black leading-6 text-slate-950' }, props.title), h('p', { class: 'mt-0.5 text-xs text-slate-500' }, props.subtitle)])]), h('button', { type: 'button', class: 'action-tooltip relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100', title: actionLabel, 'data-tooltip': actionLabel, 'aria-label': actionLabel, onClick: () => emit('action') }, [h(resolveComponent('Icon') as any, { name: props.icon, class: 'h-5 w-5' })])]) } } })
const EmptyState = defineComponent({ props: { icon: String, text: String }, setup(props) { return () => h('div', { class: 'mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500' }, [h(resolveComponent('Icon') as any, { name: props.icon, class: 'h-5 w-5 text-sky-600' }), h('span', props.text)]) } })
const EntityActions = defineComponent({ emits: ['edit', 'remove'], setup(_, { emit }) { return () => h('div', { class: 'flex shrink-0 items-center gap-2' }, [h('button', { type: 'button', class: 'action-tooltip relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100', title: 'Chỉnh sửa', 'data-tooltip': 'Chỉnh sửa', 'aria-label': 'Chỉnh sửa thông tin', onClick: () => emit('edit') }, [h(resolveComponent('Icon') as any, { name: 'uil:pen', class: 'h-5 w-5' })]), h('button', { type: 'button', class: 'action-tooltip relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-600 hover:text-white hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100', title: 'Xóa', 'data-tooltip': 'Xóa', 'aria-label': 'Xóa thông tin', onClick: () => emit('remove') }, [h(resolveComponent('Icon') as any, { name: 'uil:trash-alt', class: 'h-5 w-5' })])]) } })
const EditorSectionTitle = defineComponent({ props: { icon: String, title: String, subtitle: String }, setup(props) { return () => h('div', { class: 'flex items-start gap-3' }, [h('span', { class: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600' }, [h(resolveComponent('Icon') as any, { name: props.icon, class: 'h-5 w-5' })]), h('div', [h('h3', { class: 'text-sm font-black text-slate-900' }, props.title), h('p', { class: 'mt-1 text-xs font-semibold leading-5 text-slate-500' }, props.subtitle)])]) } })
const Field = defineComponent({ props: { label: String }, setup(props, { slots }) { return () => h('label', { class: 'field' }, [h('span', props.label), slots.default?.()]) } })
onMounted(() => loadProfile())
</script>

<style scoped>
.card { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5; }
.card h2 { @apply text-base font-black text-slate-950; }
.card h3 { @apply text-sm font-black text-slate-900; }
.chip { @apply rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700; }
.chip-muted { @apply rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500; }
.btn-primary,.btn-secondary { @apply inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60; }
.btn-primary { @apply bg-sky-600 text-white hover:bg-sky-700; }
.btn-secondary { @apply border border-slate-200 bg-white text-slate-700 hover:bg-slate-50; }
.icon-btn { @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100; }
:deep(.action-tooltip::after) { content: attr(data-tooltip); @apply pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-xl transition duration-150; transform: translateY(4px) scale(.96); }
:deep(.action-tooltip:hover::after),:deep(.action-tooltip:focus-visible::after) { @apply opacity-100; transform: translateY(0) scale(1); }
.entity-icon { @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600; }
.document-card { @apply flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50; }
.document-card small { @apply mt-0.5 block text-xs font-medium text-slate-500; }
.editor-section { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5; }
.toggle-card { @apply flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50; }
.toggle-card-active { @apply border-sky-300 bg-sky-50 text-sky-800 ring-4 ring-sky-50; }
.skill-option { @apply flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50; }
.skill-option-selected { @apply border-sky-300 bg-sky-50 text-sky-800 ring-2 ring-sky-100; }
.dropzone { @apply relative flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition; }
.dropzone input[type="file"] { @apply absolute inset-0 h-full w-full cursor-pointer opacity-0; }
.field { @apply flex min-w-0 flex-col gap-2 text-sm font-bold text-slate-700; }
.field > span { @apply block leading-5; }
.field :deep(input),.field :deep(textarea),.field :deep(select) { @apply min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400; }
.profile-control { @apply min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100; }
.category-mode-button { @apply inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black text-sky-700 transition hover:bg-sky-50 hover:text-sky-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60; }
.skill-create-field { @apply min-w-0; }
.skill-create-label-row { @apply mb-2 flex h-8 items-center justify-between gap-3 text-sm font-bold leading-5 text-slate-700; }
.skill-create-help { @apply mt-2 min-h-5 text-xs font-medium leading-5 text-slate-500; }
.profile-editor-scroll { scrollbar-color: #94a3b8 transparent; scrollbar-width: thin; }
.profile-editor-scroll::-webkit-scrollbar { width: 10px; }
.profile-editor-scroll::-webkit-scrollbar-button { display: none; height: 0; width: 0; }
.profile-editor-scroll::-webkit-scrollbar-track { margin-block: 10px; background: transparent; border-radius: 999px; }
.profile-editor-scroll::-webkit-scrollbar-thumb { border: 3px solid transparent; border-radius: 999px; background: #94a3b8; background-clip: padding-box; }
.profile-editor-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; background-clip: padding-box; }
.field :deep(textarea) { @apply min-h-28 resize-y leading-6; }
.skill-option input { @apply mt-0.5 h-4 w-4 shrink-0 accent-sky-600; }
.toggle-card input { @apply m-0 h-5 w-5 shrink-0 accent-sky-600; }
.field :deep(small) { @apply mt-1 block text-xs font-medium text-slate-500; }
</style>
