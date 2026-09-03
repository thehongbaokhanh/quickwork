<template>
  <div class="space-y-5">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Quản trị nội dung</p>
        <h1 class="mt-1 text-2xl font-bold text-slate-950">Danh mục hệ thống</h1>
        <p class="mt-1 text-sm text-slate-500">Tổ chức nhóm ngành nghề và theo dõi các kỹ năng đang được sử dụng.</p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row">
        <label class="relative block min-w-64">
          <Icon name="uil:search" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input v-model.trim="search" type="search" placeholder="Tìm danh mục hoặc kỹ năng..." class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
        </label>
        <button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700" @click="openCreate">
          <Icon name="uil:plus" class="h-5 w-5" /> Thêm danh mục
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="stat in stats" :key="stat.label" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between"><div class="rounded-xl p-2.5" :class="stat.bg"><Icon :name="stat.icon" class="h-6 w-6" :class="stat.color" /></div><span class="text-xs font-semibold text-slate-400">Cập nhật trực tiếp</span></div>
        <p class="mt-4 text-2xl font-black text-slate-950">{{ stat.value }}</p><p class="mt-1 text-xs font-semibold text-slate-500">{{ stat.label }}</p>
      </article>
    </section>

    <div v-if="errorMessage" class="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{{ errorMessage }}</span><button type="button" class="font-bold underline" @click="loadCategories">Thử lại</button></div>

    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div><h2 class="font-bold text-slate-950">Danh sách danh mục</h2><p class="mt-0.5 text-xs text-slate-500">{{ filteredCategories.length }} kết quả phù hợp</p></div>
        <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">{{ totalJobUsage }} lượt dùng trong tin tuyển dụng</span>
      </div>

      <div v-if="loading" class="space-y-3 p-5"><div v-for="index in 5" :key="index" class="h-16 animate-pulse rounded-xl bg-slate-100" /></div>
      <div v-else-if="!filteredCategories.length" class="grid min-h-64 place-items-center p-8 text-center">
        <div><div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-50"><Icon name="uil:tag-alt" class="h-7 w-7 text-sky-600" /></div><h3 class="mt-4 font-bold text-slate-900">Không tìm thấy danh mục</h3><p class="mt-1 text-sm text-slate-500">Hãy thay đổi từ khóa hoặc tạo danh mục mới.</p></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th class="px-5 py-3">Danh mục</th><th>Kỹ năng</th><th>Tin tuyển dụng</th><th>Cập nhật</th><th class="px-5 text-right">Thao tác</th></tr></thead>
          <tbody class="divide-y divide-slate-100">
            <template v-for="category in filteredCategories" :key="category.id">
              <tr class="transition hover:bg-slate-50/70">
                <td class="px-5 py-4"><button type="button" class="flex min-w-0 items-center gap-3 text-left" @click="toggleExpanded(category.id)"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><Icon name="uil:tag-alt" class="h-5 w-5" /></span><span class="min-w-0"><strong class="block truncate text-slate-950">{{ category.name }}</strong><small class="mt-0.5 flex items-center gap-1 text-slate-400">Xem kỹ năng <Icon :name="expandedId === category.id ? 'uil:angle-up' : 'uil:angle-down'" class="h-4 w-4" /></small></span></button></td>
                <td><span class="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{{ category.skill_count }} kỹ năng</span></td>
                <td><span class="font-semibold text-slate-700">{{ category.job_count }}</span></td>
                <td class="text-slate-500">{{ formatDate(category.updated_at) }}</td>
                <td class="px-5"><div class="flex justify-end gap-1"><button type="button" class="icon-action text-sky-600 hover:bg-sky-50" title="Chỉnh sửa" @click="openEdit(category)"><Icon name="uil:pen" class="h-5 w-5" /></button><button type="button" class="icon-action text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-35" :disabled="category.skill_count > 0" :title="category.skill_count ? 'Không thể xóa danh mục đang chứa kỹ năng' : 'Xóa danh mục'" @click="requestDelete(category)"><Icon name="uil:trash-alt" class="h-5 w-5" /></button></div></td>
              </tr>
              <tr v-if="expandedId === category.id" class="bg-slate-50/70"><td colspan="5" class="px-5 py-4"><div v-if="category.skills.length" class="flex flex-wrap gap-2"><span v-for="skill in category.skills" :key="skill.id" class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Icon name="uil:award" class="h-4 w-4 text-sky-500" />{{ skill.name }}<small class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{{ skill.job_count }} tin</small></span></div><p v-else class="text-sm text-slate-400">Danh mục này chưa có kỹ năng.</p></td></tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="editorOpen" class="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" @click.self="closeEditor">
        <form class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="saveCategory">
          <div class="flex items-start justify-between gap-4"><div><h2 class="text-xl font-bold text-slate-950">{{ editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục' }}</h2><p class="mt-1 text-sm text-slate-500">Tên danh mục dùng để nhóm các kỹ năng cùng lĩnh vực.</p></div><button type="button" class="icon-action text-slate-500 hover:bg-slate-100" @click="closeEditor"><Icon name="uil:times" class="h-5 w-5" /></button></div>
          <label class="mt-6 block"><span class="text-sm font-bold text-slate-700">Tên danh mục <b class="text-rose-500">*</b></span><input v-model="formName" maxlength="100" autofocus class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" placeholder="Ví dụ: Công nghệ thông tin" /><span class="mt-1.5 flex justify-between text-xs"><span class="text-rose-600">{{ formError }}</span><span class="text-slate-400">{{ formName.length }}/100</span></span></label>
          <div class="mt-6 flex justify-end gap-2"><button type="button" class="secondary-button" :disabled="saving" @click="closeEditor">Hủy</button><button type="submit" class="primary-button" :disabled="saving"><Icon v-if="saving" name="uil:spinner-alt" class="h-4 w-4 animate-spin" />{{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}</button></div>
        </form>
      </div>

      <div v-if="deleteTarget" class="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" @click.self="deleteTarget = null">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><div class="grid h-12 w-12 place-items-center rounded-xl bg-rose-50"><Icon name="uil:trash-alt" class="h-6 w-6 text-rose-600" /></div><h2 class="mt-4 text-lg font-bold text-slate-950">Xóa danh mục?</h2><p class="mt-2 text-sm leading-6 text-slate-500">Danh mục <strong class="text-slate-800">{{ deleteTarget.name }}</strong> sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.</p><div class="mt-6 flex justify-end gap-2"><button class="secondary-button" type="button" :disabled="deleting" @click="deleteTarget = null">Hủy</button><button class="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50" type="button" :disabled="deleting" @click="confirmDelete"><Icon v-if="deleting" name="uil:spinner-alt" class="h-4 w-4 animate-spin" />{{ deleting ? 'Đang xóa...' : 'Xóa danh mục' }}</button></div></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AdminService } from '~/services/admin.service'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

type SkillItem = { id: number; name: string; job_count: number }
type CategoryItem = { id: number; name: string; skill_count: number; job_count: number; skills: SkillItem[]; created_at: string; updated_at: string }

const toast = useToast()
const categories = ref<CategoryItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const search = ref('')
const expandedId = ref<number | null>(null)
const editorOpen = ref(false)
const editingCategory = ref<CategoryItem | null>(null)
const formName = ref('')
const formError = ref('')
const saving = ref(false)
const deleteTarget = ref<CategoryItem | null>(null)
const deleting = ref(false)

const filteredCategories = computed(() => { const query = search.value.toLocaleLowerCase('vi').trim(); if (!query) return categories.value; return categories.value.filter(category => category.name.toLocaleLowerCase('vi').includes(query) || category.skills.some(skill => skill.name.toLocaleLowerCase('vi').includes(query))) })
const totalSkills = computed(() => categories.value.reduce((total, item) => total + item.skill_count, 0))
const totalJobUsage = computed(() => categories.value.reduce((total, item) => total + item.job_count, 0))
const stats = computed(() => [
  { label: 'Tổng danh mục', value: categories.value.length, icon: 'uil:tag-alt', bg: 'bg-blue-50', color: 'text-blue-600' },
  { label: 'Tổng kỹ năng', value: totalSkills.value, icon: 'uil:award', bg: 'bg-violet-50', color: 'text-violet-600' },
  { label: 'Danh mục đang sử dụng', value: categories.value.filter(item => item.job_count > 0).length, icon: 'uil:briefcase-alt', bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Danh mục trống', value: categories.value.filter(item => item.skill_count === 0).length, icon: 'uil:folder-question', bg: 'bg-orange-50', color: 'text-orange-600' }
])

async function loadCategories() { loading.value = true; errorMessage.value = ''; try { const response = await AdminService.getCategories() as { data?: CategoryItem[] }; categories.value = response.data || response as unknown as CategoryItem[] } catch (error: any) { errorMessage.value = error?.data?.message || 'Không thể tải danh mục hệ thống.' } finally { loading.value = false } }
function toggleExpanded(id: number) { expandedId.value = expandedId.value === id ? null : id }
function openCreate() { editingCategory.value = null; formName.value = ''; formError.value = ''; editorOpen.value = true }
function openEdit(category: CategoryItem) { editingCategory.value = category; formName.value = category.name; formError.value = ''; editorOpen.value = true }
function closeEditor() { if (!saving.value) editorOpen.value = false }
async function saveCategory() {
  formError.value = ''; const name = formName.value.trim(); if (!name) { formError.value = 'Vui lòng nhập tên danh mục.'; return }
  saving.value = true
  try { if (editingCategory.value) await AdminService.updateCategory(editingCategory.value.id, { name }); else await AdminService.createCategory({ name }); toast.success(editingCategory.value ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục'); editorOpen.value = false; await loadCategories() } catch (error: any) { formError.value = error?.data?.message || 'Không thể lưu danh mục.' } finally { saving.value = false }
}
function requestDelete(category: CategoryItem) { if (!category.skill_count) deleteTarget.value = category }
async function confirmDelete() { if (!deleteTarget.value) return; deleting.value = true; try { await AdminService.deleteCategory(deleteTarget.value.id); toast.success('Đã xóa danh mục'); deleteTarget.value = null; await loadCategories() } catch (error: any) { toast.error('Không thể xóa danh mục', error?.data?.message || 'Vui lòng thử lại.'); deleteTarget.value = null } finally { deleting.value = false } }
function formatDate(value: string) { if (!value) return 'Chưa cập nhật'; return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) }

await loadCategories()
</script>

<style scoped>
.icon-action { @apply grid h-9 w-9 place-items-center rounded-lg transition; }
.secondary-button { @apply h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50; }
.primary-button { @apply inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50; }
</style>
