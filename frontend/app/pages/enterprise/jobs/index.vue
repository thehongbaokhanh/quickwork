<template>
  <div class="space-y-6 py-6">
    <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div class="grid gap-5 bg-slate-950 px-5 py-6 text-white lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-7">
        <div class="min-w-0">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-2xl bg-sky-400/15 px-3 py-1.5 text-xs font-bold text-sky-100 ring-1 ring-sky-300/20">
              <Icon name="uil:briefcase" class="h-4 w-4" />
              Quản lý tin tuyển dụng
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-100 ring-1 ring-white/10">
              {{ jobs.length }} tin trong bộ lọc
            </span>
          </div>
          <h1 class="text-2xl font-black leading-tight tracking-normal md:text-3xl">Danh sách tin tuyển dụng</h1>
          <p class="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
            Theo dõi trạng thái, chỉnh sửa nội dung, gửi duyệt lại hoặc đóng các tin tuyển dụng đang có.
          </p>
        </div>
        <NuxtLink
          to="/enterprise/jobs/create"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 text-sm font-black text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/30"
        >
          <Icon name="uil:plus-circle" class="h-5 w-5" />
          Tạo tin tuyển dụng
        </NuxtLink>
      </div>
    </section>

    <div v-if="errorMessage" class="flex items-start gap-3 rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      <Icon name="uil:exclamation-triangle" class="mt-0.5 h-5 w-5 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div class="min-w-0">
          <h2 class="truncate text-base font-black text-slate-950">Bảng tin tuyển dụng</h2>
          <p class="mt-1 text-xs font-semibold text-slate-500">Dữ liệu được tải trực tiếp từ API nhà tuyển dụng.</p>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            type="button"
            :class="[
              'inline-flex h-10 shrink-0 items-center rounded-2xl border px-4 text-xs font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              activeFilter === status.value
                ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            ]"
            @click="changeStatusFilter(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="space-y-3 px-5 py-6">
        <div v-for="index in 5" :key="index" class="grid gap-3 rounded-3xl border border-slate-100 p-4 md:grid-cols-[minmax(0,1fr)_160px_120px_120px]">
          <div class="space-y-2">
            <div class="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            <div class="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
          <div class="h-4 animate-pulse rounded bg-slate-100" />
          <div class="h-4 animate-pulse rounded bg-slate-100" />
          <div class="h-4 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div v-else-if="jobs.length === 0" class="px-5 py-16 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
          <Icon name="uil:folder-question" class="h-8 w-8" />
        </div>
        <h3 class="mt-4 text-base font-black text-slate-950">Chưa có tin tuyển dụng</h3>
        <p class="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
          Bạn chưa có tin nào trong bộ lọc này. Tạo tin mới để gửi admin duyệt và bắt đầu nhận ứng viên.
        </p>
        <NuxtLink
          to="/enterprise/jobs/create"
          class="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        >
          <Icon name="uil:plus-circle" class="h-5 w-5" />
          Tạo tin ngay
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th class="whitespace-nowrap px-5 py-3">STT</th>
              <th class="whitespace-nowrap px-5 py-3">Tin tuyển dụng</th>
              <th class="whitespace-nowrap px-5 py-3">Mức lương</th>
              <th class="whitespace-nowrap px-5 py-3">Địa điểm</th>
              <th class="whitespace-nowrap px-5 py-3">Số lượng</th>
              <th class="whitespace-nowrap px-5 py-3">Trạng thái</th>
              <th class="whitespace-nowrap px-5 py-3">Ngày tạo</th>
              <th class="whitespace-nowrap px-5 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(job, index) in paginatedJobs" :key="job.id" class="transition hover:bg-slate-50/80">
              <td class="whitespace-nowrap px-5 py-4 font-black text-slate-400">{{ pageStart + index }}</td>
              <td class="px-5 py-4">
                <div class="flex min-w-0 items-start gap-3">
                  <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sm font-black text-sky-700">
                    {{ String(job.title || 'QW').slice(0, 2).toUpperCase() }}
                  </span>
                  <div class="min-w-0">
                    <p class="max-w-sm truncate font-black text-slate-950">{{ job.title || 'Chưa có tiêu đề' }}</p>
                    <p class="mt-1 max-w-sm truncate text-xs font-semibold text-slate-500">{{ job.description || 'Không có mô tả chi tiết.' }}</p>
                    <div v-if="normalizeStatus(job.status) === 'REJECTED' && job.reject_reason" class="mt-2 inline-flex max-w-sm items-start gap-1.5 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700">
                      <Icon name="uil:exclamation-octagon" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span class="truncate">Lý do: {{ job.reject_reason }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-5 py-4 font-bold text-slate-700">{{ job.salary || 'Chưa cập nhật' }}</td>
              <td class="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">{{ job.location || 'Không xác định' }}</td>
              <td class="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">{{ job.slots || 0 }} vị trí</td>
              <td class="whitespace-nowrap px-5 py-4">
                <span :class="['inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-black uppercase', getStatusBadge(job.status)]">
                  {{ getStatusLabel(job.status) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-5 py-4 font-semibold text-slate-500">{{ formatDate(job.created_at) }}</td>
              <td class="whitespace-nowrap px-5 py-4 text-right">
                <div class="inline-flex items-center justify-end gap-2">
                  <button
                    v-if="isClosedJob(job)"
                    type="button"
                    class="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-sky-100 bg-sky-50 px-3 text-xs font-extrabold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    title="Hoàn tác tin đã đóng"
                    @click="restoreClosedJob(job.id)"
                  >
                    <Icon name="uil:history" class="h-4 w-4" />
                    Hoàn tác
                  </button>
                  <button
                    v-if="!isClosedJob(job)"
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    title="Sửa tin"
                    @click="editJob(job)"
                  >
                    <Icon name="uil:edit" class="h-4 w-4" />
                  </button>
                  <button
                    v-if="!isClosedJob(job)"
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                    title="Đóng tin"
                    @click="closeJob(job.id)"
                  >
                    <Icon name="uil:times-circle" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!loading && !errorMessage && jobs.length > 0"
        class="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-sm font-semibold text-slate-500">
            Hiển thị {{ pageStart }} đến {{ pageEnd }} của {{ jobs.length }} tin tuyển dụng
          </span>
          <ScrollSelect
            v-model="pageSize"
            class="w-36"
            :options="pageSizeOptions"
            size="sm"
            ariaLabel="Số lượng tin tuyển dụng trong 1 trang"
          />
        </div>

        <div class="flex items-center justify-center gap-2">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === 1"
            aria-label="Trang trước"
            @click="goToPage(currentPage - 1)"
          >
            <Icon name="uil:angle-left" class="h-5 w-5" />
          </button>
          <template v-for="(page, pageIndex) in visiblePages" :key="`${page}-${pageIndex}`">
            <span v-if="page === '...'" class="px-2 text-sm font-black text-slate-400">...</span>
            <button
              v-else
              type="button"
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition',
                currentPage === page
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                  : 'border border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
              ]"
              :aria-label="`Đi tới trang ${page}`"
              @click="goToPage(Number(page))"
            >
              {{ page }}
            </button>
          </template>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === totalPages"
            aria-label="Trang sau"
            @click="goToPage(currentPage + 1)"
          >
            <Icon name="uil:angle-right" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <!-- Detailed Edit Modal -->
      <div
        v-if="editModalOpen"
        class="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-slate-950/50 px-4 py-6 backdrop-blur-md sm:py-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enterprise-job-edit-title"
        @click.self="editModalOpen = false"
      >
        <div class="flex min-h-full items-center justify-center" @click.self="editModalOpen = false">
      <div class="flex max-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-slate-950/5">
        <div class="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span :class="['rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase', getStatusBadge(editForm.status)]">
                {{ getStatusLabel(editForm.status) }}
              </span>
              <span class="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                Mã tin #{{ editForm.id }}
              </span>
            </div>
            <h3 id="enterprise-job-edit-title" class="truncate text-xl font-black text-slate-950">Chỉnh sửa tin tuyển dụng</h3>
            <p class="mt-1 text-sm font-semibold text-slate-500">{{ editStatusHint() }}</p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            aria-label="Đóng cửa sổ chỉnh sửa"
            @click="editModalOpen = false"
          >
            <Icon name="uil:multiply" class="h-5 w-5" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
          <div class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section class="space-y-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <Icon name="uil:file-edit-alt" class="h-5 w-5" />
                </span>
                <div>
                  <h4 class="text-sm font-black text-slate-900">Thông tin chính</h4>
                  <p class="text-xs font-semibold text-slate-500">Các trường này sẽ hiển thị với ứng viên sau khi được duyệt.</p>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="md:col-span-2">
                  <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tiêu đề công việc</span>
                  <input
                    v-model="editForm.title"
                    :disabled="isClosedEditJob()"
                    type="text"
                    class="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="VD: Thực tập sinh Marketing"
                  >
                </label>

                <label>
                  <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Mức lương</span>
                  <input
                    v-model="editForm.salary"
                    :disabled="isClosedEditJob()"
                    type="text"
                    class="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="VD: 6 - 9 triệu"
                  >
                </label>

                <label>
                  <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Số lượng tuyển dụng</span>
                  <input
                    v-model.number="editForm.slots"
                    :disabled="isClosedEditJob()"
                    type="number"
                    min="1"
                    class="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                </label>

                <label class="md:col-span-2">
                  <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Địa điểm làm việc</span>
                  <input
                    v-model="editForm.location"
                    :disabled="isClosedEditJob()"
                    type="text"
                    class="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="VD: Hà Nội, Remote..."
                  >
                </label>
              </div>
            </section>

            <aside class="space-y-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                  <Icon name="uil:info-circle" class="h-5 w-5" />
                </span>
                <div>
                  <h4 class="text-sm font-black text-slate-900">Trạng thái & lịch sử</h4>
                  <p class="text-xs font-semibold text-slate-500">Theo dõi tình trạng duyệt và cập nhật gần nhất.</p>
                </div>
              </div>

              <div class="grid gap-3">
                <div class="rounded-2xl bg-white p-4 shadow-sm">
                  <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Trạng thái hiện tại</p>
                  <p class="mt-1 text-sm font-black text-slate-900">{{ getStatusLabel(editForm.status) }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-2xl bg-white p-4 shadow-sm">
                    <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ngày tạo</p>
                    <p class="mt-1 text-sm font-black text-slate-900">{{ formatDate(editForm.created_at) }}</p>
                  </div>
                  <div class="rounded-2xl bg-white p-4 shadow-sm">
                    <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Cập nhật</p>
                    <p class="mt-1 text-sm font-black text-slate-900">{{ formatDate(editForm.updated_at) }}</p>
                  </div>
                </div>
                <div v-if="normalizeStatus(editForm.status) === 'REJECTED' && editForm.reject_reason" class="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  <p class="mb-1 text-[11px] font-extrabold uppercase tracking-wider">Lý do từ chối</p>
                  {{ editForm.reject_reason }}
                </div>
                <div v-if="isClosedEditJob()" class="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">
                  Tin đã đóng chỉ có thể hoàn tác về bản nháp trước khi chỉnh sửa hoặc gửi duyệt lại.
                </div>
              </div>
            </aside>
          </div>

          <section class="mt-6 grid gap-6 lg:grid-cols-2">
            <label class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Yêu cầu công việc</span>
              <textarea
                v-model="editForm.requirements"
                :disabled="isClosedEditJob()"
                rows="7"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="Kỹ năng, kinh nghiệm, thời gian làm việc..."
              />
            </label>

            <label class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <span class="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Mô tả chi tiết công việc</span>
              <textarea
                v-model="editForm.description"
                :disabled="isClosedEditJob()"
                rows="7"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="Nhiệm vụ, quyền lợi, quy trình ứng tuyển..."
              />
            </label>
          </section>
        </div>

        <div class="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs font-semibold text-slate-500">{{ editActionNote() }}</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
              @click="editModalOpen = false"
            >
              Hủy
            </button>
            <button
              v-if="isClosedEditJob()"
              type="button"
              :disabled="submitting"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
              @click="restoreClosedJob(editForm.id)"
            >
              <Icon :name="submitting ? 'svg-spinners:180-ring' : 'uil:history'" class="h-5 w-5" />
              Hoàn tác về nháp
            </button>
            <template v-else>
              <button
                type="button"
                :disabled="submitting"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-5 text-sm font-extrabold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                @click="submitJobEdit()"
              >
                <Icon :name="submitting ? 'svg-spinners:180-ring' : 'uil:save'" class="h-5 w-5" />
                Lưu thay đổi
              </button>
              <button
                v-if="canSubmitEditJob()"
                type="button"
                :disabled="submitting"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                @click="submitJobEdit('PENDING', submitEditSuccessMessage())"
              >
                <Icon :name="submitting ? 'svg-spinners:180-ring' : submitEditActionIcon()" class="h-5 w-5" />
                {{ submitEditActionLabel() }}
              </button>
            </template>
          </div>
        </div>
      </div>
        </div>
      </div>

      <div
        v-if="confirmDialog.open"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        @click.self="closeConfirmDialog"
      >
        <div class="w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-slate-950/5">
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div
              :class="[
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                confirmDialog.tone === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-700'
              ]"
            >
              <Icon :name="confirmDialog.icon" class="h-6 w-6" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base font-black text-slate-950">{{ confirmDialog.title }}</h3>
              <p class="mt-2 text-sm font-semibold leading-6 text-slate-500">{{ confirmDialog.message }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            :disabled="confirmDialog.loading"
            class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            @click="closeConfirmDialog"
          >
            Hủy
          </button>
          <button
            type="button"
            :disabled="confirmDialog.loading"
            :class="[
              'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-white shadow-lg transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
              confirmDialog.tone === 'rose'
                ? 'bg-rose-600 shadow-rose-100 hover:bg-rose-700 focus-visible:ring-rose-100'
                : 'bg-sky-600 shadow-sky-100 hover:bg-sky-700 focus-visible:ring-sky-100'
            ]"
            @click="runConfirmDialog"
          >
            <Icon :name="confirmDialog.loading ? 'svg-spinners:180-ring' : confirmDialog.icon" class="h-5 w-5" />
            {{ confirmDialog.confirmLabel }}
          </button>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- Simple Edit Modal -->
    <div v-if="false" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" aria-hidden="true">
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl max-w-md w-full space-y-4">
        <h3 class="font-extrabold text-slate-900 text-sm">Chỉnh sửa tin tuyển dụng</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tiêu đề</label>
            <input 
              v-model="editForm.title" 
              type="text" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mức lương</label>
            <input 
              v-model="editForm.salary" 
              type="text" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Địa điểm</label>
            <input 
              v-model="editForm.location" 
              type="text" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mô tả</label>
            <textarea 
              v-model="editForm.description" 
              rows="3"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-semibold text-slate-800"
            ></textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Số lượng tuyển dụng</label>
            <input 
              v-model.number="editForm.slots" 
              type="number" 
              min="1"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button 
            @click="editModalOpen = false" 
            class="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Hủy
          </button>
          <button 
            @click="saveJobEdit" 
            class="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-xs hover:bg-sky-700 transition-all shadow-md shadow-sky-100"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'

type EnterpriseJobStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED'
type ConfirmTone = 'sky' | 'rose'
type ConfirmAction = () => Promise<void> | void

definePageMeta({
  layout: 'enterprise',
  middleware: ['company', 'enterprise-approved']
})

const toast = useToast()
const jobs = ref<any[]>([])
const loading = ref(true)
const activeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const editModalOpen = ref(false)
const editForm = ref<any>({})
const errorMessage = ref('')
const submitting = ref(false)
const confirmDialog = ref<{
  open: boolean
  title: string
  message: string
  confirmLabel: string
  icon: string
  tone: ConfirmTone
  loading: boolean
  action: ConfirmAction | null
}>({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Xác nhận',
  icon: 'uil:question-circle',
  tone: 'sky',
  loading: false,
  action: null
})

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CLOSED', label: 'Đã đóng' }
]

const pageSizeOptions = [
  { value: 10, label: '10 / trang' },
  { value: 20, label: '20 / trang' },
  { value: 50, label: '50 / trang' }
]

const totalPages = computed(() => Math.max(1, Math.ceil(jobs.value.length / Number(pageSize.value))))

const pageStart = computed(() => {
  if (jobs.value.length === 0) return 0
  return (currentPage.value - 1) * Number(pageSize.value) + 1
})

const pageEnd = computed(() => Math.min(currentPage.value * Number(pageSize.value), jobs.value.length))

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value)
  return jobs.value.slice(start, start + Number(pageSize.value))
})

const visiblePages = computed(() => {
  const pages: Array<number | string> = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 6) {
    for (let page = 1; page <= total; page += 1) pages.push(page)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let page = start; page <= end; page += 1) pages.push(page)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
})

const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

const openConfirmDialog = (options: {
  title: string
  message: string
  confirmLabel: string
  icon: string
  tone?: ConfirmTone
  action: ConfirmAction
}) => {
  confirmDialog.value = {
    open: true,
    title: options.title,
    message: options.message,
    confirmLabel: options.confirmLabel,
    icon: options.icon,
    tone: options.tone || 'sky',
    loading: false,
    action: options.action
  }
}

const closeConfirmDialog = () => {
  if (confirmDialog.value.loading) return
  confirmDialog.value.open = false
}

const runConfirmDialog = async () => {
  if (!confirmDialog.value.action || confirmDialog.value.loading) return

  try {
    confirmDialog.value.loading = true
    await confirmDialog.value.action()
    confirmDialog.value.open = false
  } finally {
    confirmDialog.value.loading = false
  }
}

const normalizeStatus = (status?: string) => (status || '').toUpperCase()

const isClosedJob = (job: any) => normalizeStatus(job?.status) === 'CLOSED'
const isClosedEditJob = () => normalizeStatus(editForm.value?.status) === 'CLOSED'

const formatDate = (value?: string) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

const getStatusBadge = (status: string) => {
  switch (normalizeStatus(status)) {
    case 'DRAFT': return 'bg-slate-50 text-slate-500 border-slate-100'
    case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100/50'
    case 'APPROVED': return 'bg-sky-50 text-sky-600 border-sky-100/50'
    case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100/50'
    case 'CLOSED': return 'bg-slate-100 text-slate-400 border-slate-200'
    default: return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}

const getStatusLabel = (status: string) => {
  switch (normalizeStatus(status)) {
    case 'DRAFT': return 'Bản nháp'
    case 'PENDING': return 'Chờ duyệt'
    case 'APPROVED': return 'Đã duyệt'
    case 'REJECTED': return 'Bị từ chối'
    case 'CLOSED': return 'Đã đóng'
    default: return status || 'Chưa cập nhật'
  }
}

const canSubmitEditJob = () => ['DRAFT', 'REJECTED'].includes(normalizeStatus(editForm.value?.status))

const submitEditActionLabel = () => (
  normalizeStatus(editForm.value?.status) === 'DRAFT' ? 'Đăng tin tuyển dụng' : 'Xin đăng lại'
)

const submitEditActionIcon = () => (
  normalizeStatus(editForm.value?.status) === 'DRAFT' ? 'uil:message' : 'uil:redo'
)

const submitEditSuccessMessage = () => (
  normalizeStatus(editForm.value?.status) === 'DRAFT'
    ? 'Đã gửi duyệt tin'
    : 'Đã xin đăng lại'
)

const submitEditSuccessDescription = () => (
  normalizeStatus(editForm.value?.status) === 'DRAFT'
    ? 'Tin tuyển dụng đang chờ admin xét duyệt.'
    : 'Tin đã được gửi lại để admin xem xét.'
)

const editStatusHint = () => {
  switch (normalizeStatus(editForm.value?.status)) {
    case 'DRAFT':
      return 'Tin đang là bản nháp. Bạn có thể chỉnh sửa và gửi admin duyệt.'
    case 'REJECTED':
      return 'Tin đã bị từ chối. Hãy cập nhật nội dung rồi xin đăng lại.'
    case 'PENDING':
      return 'Tin đang chờ admin duyệt. Bạn vẫn có thể cập nhật nội dung.'
    case 'APPROVED':
      return 'Tin đang hiển thị với ứng viên. Thay đổi sẽ được lưu ngay.'
    case 'CLOSED':
      return 'Tin đã đóng. Hãy hoàn tác về bản nháp trước khi chỉnh sửa.'
    default:
      return 'Cập nhật thông tin tuyển dụng từ dữ liệu hiện có.'
  }
}

const editActionNote = () => {
  switch (normalizeStatus(editForm.value?.status)) {
    case 'DRAFT':
      return 'Lưu bản nháp hoặc đăng tin tuyển dụng để chuyển sang chờ duyệt.'
    case 'REJECTED':
      return 'Sau khi chỉnh sửa, hãy gửi yêu cầu xin đăng lại để admin duyệt.'
    case 'CLOSED':
      return 'Tin đã đóng chỉ còn thao tác hoàn tác về bản nháp.'
    default:
      return 'Các thay đổi sẽ cập nhật trực tiếp lên tin tuyển dụng này.'
  }
}

const fetchJobs = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const response = await JobService.getEnterpriseJobs({ status: activeFilter.value })
    if (response && response.success) {
      jobs.value = Array.isArray(response.data) ? response.data : []
    } else {
      jobs.value = []
      errorMessage.value = response?.message || 'Không thể tải danh sách tin tuyển dụng.'
    }
  } catch (error: any) {
    jobs.value = []
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách tin tuyển dụng.'
    console.error('Failed to fetch jobs:', error)
  } finally {
    loading.value = false
  }
}

const changeStatusFilter = (status: string) => {
  activeFilter.value = status
  currentPage.value = 1
  fetchJobs()
}

const closeJob = (id: number) => {
  openConfirmDialog({
    title: 'Đóng tin tuyển dụng?',
    message: 'Tin sẽ chuyển sang trạng thái đã đóng và không còn hiển thị cho ứng viên. Bạn vẫn có thể hoàn tác về bản nháp sau đó.',
    confirmLabel: 'Đóng tin',
    icon: 'uil:archive',
    tone: 'rose',
    action: () => performCloseJob(id)
  })
}

const performCloseJob = async (id: number) => {
  try {
    errorMessage.value = ''
    const response: any = await JobService.deleteEnterpriseJob(id)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể đóng tin tuyển dụng.')
    }
    toast.success('Đã đóng tin tuyển dụng', 'Tin đã được chuyển sang trạng thái đã đóng và có thể hoàn tác khi cần.')
    fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể đóng tin tuyển dụng.'
    toast.error('Không thể đóng tin', errorMessage.value)
  }
}

const editJob = (job: any) => {
  editForm.value = {
    id: job.id,
    title: job.title || '',
    salary: job.salary || '',
    description: job.description || '',
    requirements: job.requirements || '',
    location: job.location || '',
    slots: Number(job.slots) > 0 ? Number(job.slots) : 1,
    status: normalizeStatus(job.status) || 'DRAFT',
    reject_reason: job.reject_reason || '',
    created_at: job.created_at,
    updated_at: job.updated_at
  }
  editModalOpen.value = true
}

const buildEditPayload = (targetStatus?: EnterpriseJobStatus) => ({
  title: String(editForm.value.title || '').trim(),
  salary: String(editForm.value.salary || '').trim(),
  description: String(editForm.value.description || '').trim(),
  requirements: String(editForm.value.requirements || '').trim(),
  location: String(editForm.value.location || '').trim(),
  slots: Number(editForm.value.slots) || 1,
  status: targetStatus || normalizeStatus(editForm.value.status) || 'DRAFT'
})

const validateEditForm = (payload: ReturnType<typeof buildEditPayload>) => {
  if (!payload.title || !payload.salary || !payload.description || !payload.slots) {
    toast.warning('Thiếu thông tin bắt buộc', 'Vui lòng điền đủ tiêu đề, mức lương, mô tả và số lượng tuyển dụng.')
    return false
  }
  return true
}

const submitJobEdit = async (targetStatus?: EnterpriseJobStatus, successMessage = 'Đã cập nhật tin tuyển dụng thành công!') => {
  const payload = buildEditPayload(targetStatus)
  if (!validateEditForm(payload)) return

  try {
    submitting.value = true
    errorMessage.value = ''
    const response: any = await JobService.updateEnterpriseJob(editForm.value.id, payload)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật tin tuyển dụng.')
    }
    toast.success(successMessage, targetStatus === 'PENDING' ? submitEditSuccessDescription() : 'Thông tin tuyển dụng đã được lưu lại.')
    editModalOpen.value = false
    fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể cập nhật tin tuyển dụng.'
    toast.error('Không thể cập nhật tin', errorMessage.value)
  } finally {
    submitting.value = false
  }
}

const restoreClosedJob = (id: number) => {
  if (!id) return

  openConfirmDialog({
    title: 'Hoàn tác tin đã đóng?',
    message: 'Tin sẽ được đưa về bản nháp để bạn có thể chỉnh sửa hoặc gửi duyệt lại khi sẵn sàng.',
    confirmLabel: 'Hoàn tác',
    icon: 'uil:history',
    tone: 'sky',
    action: () => performRestoreClosedJob(id)
  })
}

const performRestoreClosedJob = async (id: number) => {
  try {
    submitting.value = true
    errorMessage.value = ''
    const response: any = await JobService.updateEnterpriseJob(id, { status: 'DRAFT' })
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể hoàn tác tin tuyển dụng.')
    }
    toast.success('Đã hoàn tác tin tuyển dụng', 'Tin đã được đưa về bản nháp để chỉnh sửa hoặc gửi duyệt lại.')
    editModalOpen.value = false
    fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể hoàn tác tin tuyển dụng.'
    toast.error('Không thể hoàn tác tin', errorMessage.value)
  } finally {
    submitting.value = false
  }
}

const saveJobEdit = async () => {
  try {
    errorMessage.value = ''
    const response: any = await JobService.updateEnterpriseJob(editForm.value.id, editForm.value)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật tin tuyển dụng.')
    }
    toast.success('Đã cập nhật tin tuyển dụng', 'Thông tin tuyển dụng đã được lưu lại.')
    editModalOpen.value = false
    fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể cập nhật tin tuyển dụng.'
    toast.error('Không thể cập nhật tin', errorMessage.value)
  }
}

onMounted(() => {
  fetchJobs()
})

watch(pageSize, () => {
  currentPage.value = 1
})

watch(totalPages, (total) => {
  if (currentPage.value > total) currentPage.value = total
})
</script>
