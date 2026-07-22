<template>
  <div class="space-y-5 pb-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <Icon :name="pageIcon" :class="['h-5 w-5', mode === 'rejected' ? 'text-rose-500' : 'text-sky-700']" />
          <h1 class="text-2xl font-black text-slate-950">{{ title }}</h1>
        </div>
        <p class="mt-1.5 max-w-2xl text-sm font-semibold text-slate-500">{{ description }}</p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading || filteredApplications.length === 0"
          @click="exportCandidates"
        >
          <Icon name="uil:import" class="h-5 w-5" />
          Xuất danh sách
          <Icon v-if="mode === 'saved'" name="uil:angle-down" class="h-4 w-4 text-slate-400" />
        </button>

        <button
          type="button"
          :class="[
            'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black shadow-sm transition focus:outline-none focus-visible:ring-4',
            mode === 'rejected'
              ? 'border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 focus-visible:ring-rose-100'
              : 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-100'
          ]"
          @click="handleBulkAction"
        >
          <Icon :name="mode === 'rejected' ? 'uil:trash-alt' : 'uil:plus'" class="h-5 w-5" />
          {{ bulkActionLabel }}
        </button>
      </div>
    </section>

    <section :class="['grid gap-4', mode === 'saved' ? 'xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(260px,1.2fr)] md:grid-cols-2' : 'xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(280px,1.25fr)] md:grid-cols-2']">
      <article
        v-for="card in metricCards"
        :key="card.label"
        class="min-h-[116px] cursor-help rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        tabindex="0"
        @mouseenter="showHoverInfo($event, getMetricHoverInfo(card))"
        @mouseleave="hideHoverInfo"
        @focus="showHoverInfo($event, getMetricHoverInfo(card))"
        @blur="hideHoverInfo"
      >
        <div class="flex h-full items-center gap-4">
          <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', card.iconClass]">
            <Icon :name="card.icon" class="h-6 w-6" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-bold text-slate-500">{{ card.label }}</p>
            <p :class="['mt-1 min-h-7 truncate font-black text-slate-950', card.valueClass || 'text-2xl leading-8']">
              {{ card.value }}
            </p>
            <p :class="['mt-1 truncate text-xs font-black', card.metaClass || 'text-slate-500']">{{ card.meta }}</p>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80 md:col-span-2 xl:col-span-1">
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-black text-slate-700">{{ chartTitle }}</p>
            <div class="mt-3 space-y-2">
              <div
                v-for="item in chartItems"
                :key="item.label"
                class="-mx-2 flex cursor-help items-center gap-2 rounded-xl px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                tabindex="0"
                @mouseenter="showHoverInfo($event, getChartHoverInfo(item))"
                @mouseleave="hideHoverInfo"
                @focus="showHoverInfo($event, getChartHoverInfo(item))"
                @blur="hideHoverInfo"
              >
                <span :class="['h-2.5 w-2.5 rounded-full', item.dotClass]" />
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                <span class="font-black text-slate-700">{{ item.percent }}%</span>
              </div>
              <p v-if="chartItems.length === 0" class="text-xs font-bold text-slate-400">Chưa có dữ liệu thống kê.</p>
            </div>
          </div>
          <div
            class="h-20 w-20 shrink-0 rounded-full p-3"
            :style="{ background: chartGradient }"
            aria-hidden="true"
          >
            <div class="h-full w-full rounded-full bg-white shadow-inner" />
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[22px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
      <div class="border-b border-slate-100 p-4">
        <div class="relative z-20 grid gap-3 xl:grid-cols-[minmax(280px,1fr)_minmax(190px,230px)_minmax(190px,230px)_210px_auto_auto]">
          <label class="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
            <Icon name="uil:search" class="h-5 w-5 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm ứng viên (tên, email, SĐT, vị trí...)"
              class="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
            >
          </label>

          <ScrollSelect
            v-model="activeJob"
            :options="jobFilterOptions"
            icon=""
            size="sm"
            ariaLabel="Lọc theo vị trí"
          />

          <ScrollSelect
            v-model="activeMetaFilter"
            :options="metaFilterOptions"
            icon=""
            size="sm"
            :ariaLabel="mode === 'rejected' ? 'Lọc theo lý do' : 'Lọc theo nguồn'"
          />

          <ScrollSelect
            v-model="activeDateSort"
            :options="dateSortOptions"
            icon=""
            size="sm"
            ariaLabel="Sắp xếp theo ngày"
          />

          <button
            type="button"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="clearFilters"
          >
            <Icon name="uil:filter-slash" class="h-5 w-5" />
            Bộ lọc
          </button>

          <div v-if="mode === 'saved'" class="hidden items-center justify-end gap-2 xl:flex">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              aria-label="Hiển thị dạng bảng"
            >
              <Icon name="uil:table" class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              aria-label="Hiển thị dạng lịch"
            >
              <Icon name="uil:calender" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="space-y-3 p-5">
        <div v-for="item in 6" :key="item" class="h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div v-else-if="errorMessage" class="m-5 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700">
        {{ errorMessage }}
      </div>

      <div v-else class="overflow-x-auto">
        <table :class="[mode === 'rejected' ? 'min-w-[1720px]' : 'min-w-[1520px]', 'divide-y divide-slate-100 table-fixed']">
          <thead class="bg-slate-50/90">
            <tr>
              <th class="w-12 px-4 py-3.5 text-left">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
                  :checked="allVisibleSelected"
                  aria-label="Chọn tất cả ứng viên trên trang"
                  @change="toggleSelectAll"
                >
              </th>
              <th class="w-[260px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Ứng viên</th>
              <th class="w-[250px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Vị trí ứng tuyển</th>
              <th class="w-[165px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Kinh nghiệm</th>
              <th v-if="mode === 'saved'" class="w-[260px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Kỹ năng nổi bật</th>
              <th class="w-[155px] whitespace-nowrap px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <span class="inline-flex items-center gap-1">
                  {{ mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận' }}
                  <Icon name="uil:arrow-down" class="h-4 w-4 text-slate-400" />
                </span>
              </th>
              <th v-if="mode === 'rejected'" class="w-[230px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Lý do từ chối</th>
              <th class="w-[130px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Đánh giá</th>
              <th class="w-[145px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Nguồn</th>
              <th class="w-[300px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">Ghi chú</th>
              <th class="w-[190px] whitespace-nowrap px-4 py-3.5 text-right text-xs font-black uppercase tracking-wide text-slate-500">Hành động</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-if="paginatedApplications.length === 0">
              <td colspan="10" class="px-4 py-12 text-center">
                <span :class="['mx-auto flex h-16 w-16 items-center justify-center rounded-3xl', emptyIconClass]">
                  <Icon :name="emptyIcon" class="h-8 w-8" />
                </span>
                <h2 class="mt-4 text-xl font-black text-slate-950">{{ emptyTitle }}</h2>
                <p class="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">{{ emptyDescription }}</p>
              </td>
            </tr>
            <tr
              v-for="application in paginatedApplications"
              :key="getApplicationKey(application)"
              class="transition hover:bg-sky-50/40"
            >
              <td class="px-4 py-4 align-middle">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
                  :checked="selectedIds.includes(getApplicationKey(application))"
                  :aria-label="`Chọn ứng viên ${getStudentName(application)}`"
                  @change="toggleSelection(application, $event)"
                >
              </td>

              <td class="px-4 py-4 align-middle">
                <div
                  class="-mx-2 flex min-w-[220px] cursor-help items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  tabindex="0"
                  @mouseenter="showHoverInfo($event, getCandidateHoverInfo(application))"
                  @mouseleave="hideHoverInfo"
                  @focus="showHoverInfo($event, getCandidateHoverInfo(application))"
                  @blur="hideHoverInfo"
                >
                  <img
                    v-if="getAvatarUrl(application)"
                    :src="getAvatarUrl(application)"
                    :alt="getStudentName(application)"
                    class="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                  >
                  <span
                    v-else
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200"
                  >
                    {{ getInitials(application) }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-black text-slate-950">{{ getStudentName(application) }}</p>
                    <p class="truncate text-xs font-semibold text-slate-500">{{ application.student?.email || 'Chưa có email' }}</p>
                    <p class="truncate text-xs font-semibold text-slate-500">{{ getStudentPhone(application) }}</p>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 align-middle">
                <div
                  class="-mx-2 min-w-0 cursor-help rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  tabindex="0"
                  @mouseenter="showHoverInfo($event, getJobHoverInfo(application))"
                  @mouseleave="hideHoverInfo"
                  @focus="showHoverInfo($event, getJobHoverInfo(application))"
                  @blur="hideHoverInfo"
                >
                  <p class="line-clamp-2 text-sm font-black leading-5 text-slate-950">{{ application.job?.title || 'Tin tuyển dụng' }}</p>
                  <p class="mt-1 text-xs font-semibold text-slate-500">Mã: #{{ getJobCode(application) }}</p>
                </div>
              </td>

              <td class="px-4 py-4 align-middle">
                <div
                  class="-mx-2 cursor-help rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  tabindex="0"
                  @mouseenter="showHoverInfo($event, getExperienceHoverInfo(application))"
                  @mouseleave="hideHoverInfo"
                  @focus="showHoverInfo($event, getExperienceHoverInfo(application))"
                  @blur="hideHoverInfo"
                >
                  <p class="line-clamp-1 text-sm font-bold text-slate-700">{{ getExperience(application) }}</p>
                  <p class="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{{ getExperienceTrack(application) }}</p>
                </div>
              </td>

              <td v-if="mode === 'saved'" class="px-4 py-4 align-middle">
                <div
                  class="-mx-2 flex max-w-[250px] cursor-help flex-wrap gap-2 rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  tabindex="0"
                  @mouseenter="showHoverInfo($event, getSkillsHoverInfo(application))"
                  @mouseleave="hideHoverInfo"
                  @focus="showHoverInfo($event, getSkillsHoverInfo(application))"
                  @blur="hideHoverInfo"
                >
                  <span
                    v-for="skill in getVisibleSkills(application)"
                    :key="skill"
                    class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
                  >
                    {{ skill }}
                  </span>
                  <span v-if="getHiddenSkillCount(application) > 0" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    +{{ getHiddenSkillCount(application) }}
                  </span>
                  <span v-if="getVisibleSkills(application).length === 0" class="text-sm font-semibold text-slate-400">Chưa cập nhật</span>
                </div>
              </td>

              <td class="whitespace-nowrap px-4 py-4 align-middle">
                <p class="text-sm font-bold text-slate-700">{{ formatDate(getPrimaryDate(application)) }}</p>
                <p class="mt-1 text-xs font-semibold text-slate-500">{{ formatTime(getPrimaryDate(application)) }}</p>
              </td>

              <td v-if="mode === 'rejected'" class="px-4 py-4 align-middle">
                <span
                  :class="['inline-flex max-w-[210px] cursor-help whitespace-nowrap rounded-full px-3 py-1 text-xs font-black leading-5 transition hover:shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100', getReasonClass(application)]"
                  tabindex="0"
                  @mouseenter="showHoverInfo($event, getRejectionHoverInfo(application))"
                  @mouseleave="hideHoverInfo"
                  @focus="showHoverInfo($event, getRejectionHoverInfo(application))"
                  @blur="hideHoverInfo"
                >
                  <span class="truncate">{{ getRejectionReason(application) }}</span>
                </span>
              </td>

              <td class="px-4 py-4 align-middle">
                <div class="min-w-[100px]">
                  <div class="flex items-center gap-0.5">
                    <Icon
                      v-for="star in 5"
                      :key="star"
                      name="uil:star"
                      :class="['h-4 w-4', star <= Math.round(getRating(application) || 0) ? 'text-amber-400' : 'text-slate-300']"
                    />
                  </div>
                  <p class="mt-1 text-xs font-semibold text-slate-500">{{ getRating(application)?.toFixed(1) || '-' }}</p>
                </div>
              </td>

              <td class="px-4 py-4 align-middle">
                <span
                  :class="['inline-flex max-w-[125px] cursor-help rounded-full px-3 py-1 text-xs font-black leading-5 transition hover:shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100', getSourceClass(application)]"
                  tabindex="0"
                  @mouseenter="showHoverInfo($event, getSourceHoverInfo(application))"
                  @mouseleave="hideHoverInfo"
                  @focus="showHoverInfo($event, getSourceHoverInfo(application))"
                  @blur="hideHoverInfo"
                >
                  <span class="truncate">{{ getApplicationSource(application) }}</span>
                </span>
              </td>

              <td class="px-4 py-4 align-middle">
                <p
                  class="-mx-2 line-clamp-2 max-w-[280px] cursor-help rounded-2xl px-2 py-2 text-sm font-semibold leading-5 text-slate-500 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  tabindex="0"
                  @mouseenter="showHoverInfo($event, getNoteHoverInfo(application))"
                  @mouseleave="hideHoverInfo"
                  @focus="showHoverInfo($event, getNoteHoverInfo(application))"
                  @blur="hideHoverInfo"
                >
                  {{ getCandidateNote(application) }}
                </p>
              </td>

              <td class="px-4 py-4 text-right align-middle">
                <div :class="['inline-flex items-center justify-end gap-2 whitespace-nowrap', mode === 'rejected' ? 'min-w-[165px]' : 'min-w-[125px]']">
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    :aria-label="mode === 'rejected' ? 'Hoàn tác từ chối' : 'Xem hồ sơ'"
                    @click="mode === 'rejected' ? handleRestore(application) : openProfileModal(application)"
                  >
                    <Icon :name="mode === 'rejected' ? 'uil:history' : 'uil:eye'" class="h-4.5 w-4.5" />
                  </button>
                  <button
                    v-if="mode === 'saved'"
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    aria-label="Sửa ghi chú"
                    @click="handleEditNote(application)"
                  >
                    <Icon name="uil:pen" class="h-4.5 w-4.5" />
                  </button>
                  <button
                    v-if="mode === 'saved'"
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                    aria-label="Xóa khỏi danh sách đã lưu"
                    @click="handleRemoveSaved(application)"
                  >
                    <Icon name="uil:trash-alt" class="h-4.5 w-4.5" />
                  </button>
                  <button
                    v-if="mode === 'rejected'"
                    type="button"
                    class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl bg-sky-50 px-3 text-xs font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    @click="openProfileModal(application)"
                  >
                    Xem hồ sơ
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!loading && !errorMessage"
        class="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-sm font-semibold text-slate-500">
            Hiển thị {{ pageStart }} đến {{ pageEnd }} của {{ filteredApplications.length }} ứng viên
          </span>
          <ScrollSelect
            v-model="pageSize"
            class="w-36"
            :options="pageSizeOptions"
            size="sm"
            ariaLabel="Số lượng ứng viên trong 1 trang"
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
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="-translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-1 opacity-0"
      >
        <div
          v-if="hoverInfo"
          ref="hoverTooltipRef"
          class="quickwork-candidate-tooltip-scroll pointer-events-auto fixed z-[300] w-[min(460px,calc(100vw-24px))] overflow-y-auto rounded-[22px] border border-sky-100 bg-white text-sm text-slate-700 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-950/5"
          :class="hoverInfo.placement === 'top' ? 'origin-bottom' : 'origin-top'"
          :style="{ top: `${hoverInfo.top}px`, left: `${hoverInfo.left}px`, maxHeight: `${hoverInfo.maxHeight}px` }"
          role="tooltip"
          @mouseenter="cancelHoverHide"
          @mouseleave="hideHoverInfo"
        >
          <div class="border-b border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-4 py-3.5">
            <div class="flex items-start gap-3">
              <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', getHoverToneClass(hoverInfo.tone, 'icon')]">
                <Icon :name="hoverInfo.icon || 'uil:info-circle'" class="h-5 w-5" />
              </span>
              <div class="min-w-0 flex-1">
                <p v-if="hoverInfo.eyebrow" :class="['text-[11px] font-black uppercase tracking-wide', getHoverToneClass(hoverInfo.tone, 'eyebrow')]">
                  {{ hoverInfo.eyebrow }}
                </p>
                <h3 class="mt-0.5 break-words text-base font-black leading-5 text-slate-950">{{ hoverInfo.title }}</h3>
                <p v-if="hoverInfo.subtitle" class="mt-1 whitespace-pre-line break-words text-xs font-semibold leading-5 text-slate-500">
                  {{ hoverInfo.subtitle }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="hoverInfo.rows?.length" class="divide-y divide-slate-100 px-4">
            <div
              v-for="row in hoverInfo.rows"
              :key="`${row.label}-${row.value}`"
              class="grid gap-2 py-3 sm:grid-cols-[116px_1fr]"
            >
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ row.label }}</span>
              <span class="min-w-0 whitespace-pre-line break-words text-sm font-bold leading-5 text-slate-700">{{ row.value }}</span>
            </div>
          </div>

          <div v-if="hoverInfo.badges?.length" class="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
            <span
              v-for="badge in hoverInfo.badges"
              :key="badge"
              :class="['rounded-full px-2.5 py-1 text-xs font-black', getHoverToneClass(hoverInfo.tone, 'badge')]"
            >
              {{ badge }}
            </span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="profileModalOpen && selectedApplication"
          class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md"
          @click.self="closeProfileModal"
        >
          <article class="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-950/20">
            <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div class="flex items-center gap-4">
                <img
                  v-if="getAvatarUrl(selectedApplication)"
                  :src="getAvatarUrl(selectedApplication)"
                  :alt="getStudentName(selectedApplication)"
                  class="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                >
                <span
                  v-else
                  class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-xl font-black text-sky-700 ring-1 ring-sky-200"
                >
                  {{ getInitials(selectedApplication) }}
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-500">{{ selectedApplication.job?.title || 'Tin tuyển dụng' }}</p>
                  <h2 class="mt-1 text-2xl font-black text-slate-950">{{ getStudentName(selectedApplication) }}</h2>
                  <p class="mt-1 text-sm font-semibold text-slate-500">{{ selectedApplication.student?.email || 'Chưa có email' }}</p>
                </div>
              </div>

              <button
                type="button"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                aria-label="Đóng hồ sơ ứng viên"
                @click="closeProfileModal"
              >
                <Icon name="uil:multiply" class="h-6 w-6" />
              </button>
            </header>

            <div class="quickwork-candidate-modal-scroll overflow-y-auto px-6 py-6">
              <div class="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 class="flex items-center gap-2 text-base font-black text-slate-950">
                    <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Icon name="uil:user" class="h-5 w-5" />
                    </span>
                    Thông tin ứng viên
                  </h3>
                  <div class="mt-5 grid gap-3 sm:grid-cols-2">
                    <div
                      v-for="item in detailItems(selectedApplication)"
                      :key="item.label"
                      class="rounded-2xl bg-slate-50 p-4"
                    >
                      <p class="text-xs font-black uppercase tracking-wide text-slate-400">{{ item.label }}</p>
                      <p class="mt-1 break-words text-sm font-bold text-slate-800">{{ item.value }}</p>
                    </div>
                  </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 class="flex items-center gap-2 text-base font-black text-slate-950">
                    <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                      <Icon name="uil:file-alt" class="h-5 w-5" />
                    </span>
                    Hồ sơ & kỹ năng
                  </h3>

                  <div class="mt-5 space-y-5">
                    <div>
                      <p class="text-xs font-black uppercase tracking-wide text-slate-400">Kỹ năng liên quan</p>
                      <div v-if="getSkills(selectedApplication).length" class="mt-3 flex flex-wrap gap-2">
                        <span
                          v-for="skill in getSkills(selectedApplication)"
                          :key="skill"
                          class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-100"
                        >
                          {{ skill }}
                        </span>
                      </div>
                      <p v-else class="mt-3 text-sm font-semibold text-slate-500">Ứng viên chưa cập nhật kỹ năng.</p>
                    </div>

                    <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <p class="text-xs font-black uppercase tracking-wide text-slate-400">Ghi chú nhà tuyển dụng</p>
                      <p class="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {{ getCandidateNote(selectedApplication) }}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <footer class="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm font-semibold text-slate-500">Dữ liệu được đồng bộ từ đơn ứng tuyển trong hệ thống.</p>
              <div class="flex flex-col gap-3 sm:flex-row">
                <a
                  v-if="getCvUrl(selectedApplication)"
                  :href="getCvUrl(selectedApplication)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                >
                  <Icon name="uil:file-download-alt" class="h-5 w-5" />
                  Xem CV
                </a>
                <button
                  type="button"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  @click="closeProfileModal"
                >
                  Đóng
                </button>
              </div>
            </footer>
          </article>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'

type ApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED'
type CandidateMode = 'saved' | 'rejected'
type HoverTone = 'sky' | 'rose' | 'emerald' | 'amber' | 'slate'
type HoverRow = {
  label: string
  value: string
}
type HoverPayload = {
  title: string
  eyebrow?: string
  subtitle?: string
  icon?: string
  tone?: HoverTone
  rows?: HoverRow[]
  badges?: string[]
}
type HoverInfo = HoverPayload & {
  top: number
  left: number
  maxHeight: number
  placement: 'top' | 'bottom'
}

const props = withDefaults(defineProps<{
  mode: CandidateMode
  title: string
  description: string
  eyebrow: string
  emptyTitle: string
  emptyDescription: string
  accentIcon?: string
  emptyIcon?: string
  accentPillClass?: string
  emptyIconClass?: string
}>(), {
  accentIcon: 'uil:users-alt',
  emptyIcon: 'uil:user-search',
  accentPillClass: 'bg-sky-50 text-sky-700',
  emptyIconClass: 'bg-sky-50 text-sky-600'
})

const toast = useToast()
const config = useRuntimeConfig()
const applications = ref<any[]>([])
const selectedApplication = ref<any | null>(null)
const selectedIds = ref<Array<string | number>>([])
const profileModalOpen = ref(false)
const hoverInfo = ref<HoverInfo | null>(null)
const hoverTooltipRef = ref<HTMLElement | null>(null)
let hoverHideTimer: number | null = null
const searchQuery = ref('')
const activeJob = ref('ALL')
const activeMetaFilter = ref('ALL')
const activeDateSort = ref('NEWEST')
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const pageSizeOptions = [
  { value: 10, label: '10 / trang' },
  { value: 20, label: '20 / trang' },
  { value: 50, label: '50 / trang' }
]

const dateSortOptions = computed(() => [
  { value: 'NEWEST', label: `${props.mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận'}: Mới nhất` },
  { value: 'OLDEST', label: `${props.mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận'}: Cũ nhất` }
])

const pageIcon = computed(() => props.mode === 'rejected' ? 'uil:times-circle' : 'uil:bookmark')

const bulkActionLabel = computed(() => {
  if (props.mode === 'rejected') return 'Xóa khỏi danh sách'
  return selectedIds.value.length > 0 ? `Thêm ghi chú (${selectedIds.value.length})` : 'Thêm ghi chú hàng loạt'
})

const baseApplications = computed(() => {
  if (props.mode === 'rejected') {
    return applications.value.filter((application) => normalizeStatus(application.status) === 'REJECTED')
  }
  return applications.value.filter(isSavedCandidate)
})

const jobFilterOptions = computed(() => {
  const options = new Map<string, string>([['ALL', 'Tất cả vị trí']])
  baseApplications.value.forEach((application) => {
    const title = application?.job?.title
    if (!title) return
    options.set(getJobOptionValue(application), title)
  })
  return Array.from(options.entries()).map(([value, label]) => ({ value, label }))
})

const metaFilterOptions = computed(() => {
  const options = new Map<string, string>([[ 'ALL', props.mode === 'rejected' ? 'Tất cả lý do' : 'Tất cả nguồn' ]])
  baseApplications.value.forEach((application) => {
    const value = props.mode === 'rejected' ? getRejectionReason(application) : getApplicationSource(application)
    options.set(value, value)
  })
  return Array.from(options.entries()).map(([value, label]) => ({ value, label }))
})

const filteredApplications = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const filtered = baseApplications.value.filter((application) => {
    const metaValue = props.mode === 'rejected' ? getRejectionReason(application) : getApplicationSource(application)
    const matchesJob = activeJob.value === 'ALL' || getJobOptionValue(application) === activeJob.value
    const matchesMeta = activeMetaFilter.value === 'ALL' || metaValue === activeMetaFilter.value
    const searchable = [
      getStudentName(application),
      application.student?.email,
      getStudentPhone(application),
      application.job?.title,
      getExperience(application),
      getExperienceTrack(application),
      getApplicationSource(application),
      getRejectionReason(application),
      getCandidateNote(application),
      ...getSkills(application)
    ].filter(Boolean).join(' ').toLowerCase()

    return matchesJob && matchesMeta && (!query || searchable.includes(query))
  })

  return filtered.sort((first, second) => {
    const firstTime = getDateTime(getPrimaryDate(first))
    const secondTime = getDateTime(getPrimaryDate(second))
    return activeDateSort.value === 'OLDEST' ? firstTime - secondTime : secondTime - firstTime
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / Number(pageSize.value))))

const pageStart = computed(() => {
  if (filteredApplications.value.length === 0) return 0
  return (currentPage.value - 1) * Number(pageSize.value) + 1
})

const pageEnd = computed(() => Math.min(currentPage.value * Number(pageSize.value), filteredApplications.value.length))

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value)
  return filteredApplications.value.slice(start, start + Number(pageSize.value))
})

const allVisibleSelected = computed(() => {
  if (paginatedApplications.value.length === 0) return false
  return paginatedApplications.value.every((application) => selectedIds.value.includes(getApplicationKey(application)))
})

const visiblePages = computed(() => {
  const pages: Array<number | string> = []
  const total = totalPages.value
  const current = currentPage.value

  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return pages
})

const sourceItems = computed(() => buildDistribution(baseApplications.value, getApplicationSource, [
  { label: 'Website', dotClass: 'bg-sky-500' },
  { label: 'Được nhận', dotClass: 'bg-emerald-500' },
  { label: 'LinkedIn', dotClass: 'bg-rose-400' },
  { label: 'Giới thiệu', dotClass: 'bg-emerald-500' }
]))

const reasonItems = computed(() => buildDistribution(baseApplications.value, getRejectionReason, [
  { label: 'Thiếu kinh nghiệm', dotClass: 'bg-rose-500' },
  { label: 'Kỹ năng chưa phù hợp', dotClass: 'bg-sky-500' },
  { label: 'Mức lương không phù hợp', dotClass: 'bg-amber-500' },
  { label: 'Khác', dotClass: 'bg-slate-400' }
]))

const chartItems = computed(() => props.mode === 'rejected' ? reasonItems.value : sourceItems.value)
const chartTitle = computed(() => props.mode === 'rejected' ? 'Theo lý do từ chối' : 'Nguồn ứng viên')

const chartGradient = computed(() => {
  if (chartItems.value.length === 0) return 'conic-gradient(#e2e8f0 0deg 360deg)'
  const colors: Record<string, string> = {
    'bg-sky-500': '#0ea5e9',
    'bg-rose-400': '#fb7185',
    'bg-rose-500': '#f43f5e',
    'bg-emerald-500': '#10b981',
    'bg-amber-500': '#f59e0b',
    'bg-slate-400': '#94a3b8'
  }
  let start = 0
  const segments = chartItems.value.map((item) => {
    const end = start + (item.percent / 100) * 360
    const colorKey = item.dotClass || 'bg-sky-500'
    const segment = `${colors[colorKey] || '#0ea5e9'} ${start}deg ${end}deg`
    start = end
    return segment
  })
  return `conic-gradient(${segments.join(', ')})`
})

const metricCards = computed(() => {
  const scoped = baseApplications.value.length
  const total = applications.value.length
  const newThisWeek = baseApplications.value.filter((application) => isWithinDays(getPrimaryDate(application), 7)).length
  const matchingSkills = getMatchingSkillPercent()
  const experiencedCount = baseApplications.value.filter((application) => getExperienceYears(application) >= 3).length

  if (props.mode === 'rejected') {
    const lackExperience = getReasonCount('Thiếu kinh nghiệm')
    const skillMismatch = getReasonCount('Kỹ năng chưa phù hợp')
    const salaryMismatch = getReasonCount('Mức lương không phù hợp')
    const other = Math.max(scoped - lackExperience - skillMismatch - salaryMismatch, 0)
    return [
      { label: 'Tổng bị từ chối', value: scoped, meta: `+${newThisWeek} so với tuần trước`, icon: 'uil:file-times-alt', iconClass: 'bg-sky-50 text-sky-600', metaClass: 'text-emerald-600', valueClass: 'text-xl leading-7' },
      { label: 'Lý do phổ biến', value: 'Thiếu kinh nghiệm', meta: `${formatPercentNumber(lackExperience, scoped)}%`, icon: 'uil:user-exclamation', iconClass: 'bg-rose-50 text-rose-500', valueClass: 'text-base leading-7' },
      { label: 'Kỹ năng chưa phù hợp', value: `${formatPercentNumber(skillMismatch, scoped)}%`, meta: 'Tổng số ứng viên', icon: 'uil:users-alt', iconClass: 'bg-emerald-50 text-emerald-600', valueClass: 'text-xl leading-7' },
      { label: 'Mức lương không phù hợp', value: `${formatPercentNumber(salaryMismatch, scoped)}%`, meta: 'Tổng số ứng viên', icon: 'uil:trophy', iconClass: 'bg-amber-50 text-amber-600', valueClass: 'text-xl leading-7' },
      { label: 'Khác', value: `${formatPercentNumber(other, scoped)}%`, meta: 'Tổng số ứng viên', icon: 'uil:comment-question', iconClass: 'bg-slate-100 text-slate-600', valueClass: 'text-xl leading-7' }
    ]
  }

  return [
    { label: 'Tổng ứng viên đã lưu', value: scoped, meta: `+${newThisWeek} so với tuần trước`, icon: 'uil:comment-alt-bookmark', iconClass: 'bg-sky-50 text-sky-600', metaClass: 'text-emerald-600', valueClass: 'text-2xl leading-8' },
    { label: 'Theo dõi mới', value: newThisWeek, meta: 'Ứng viên phù hợp', icon: 'uil:bookmark', iconClass: 'bg-sky-50 text-sky-600', valueClass: 'text-2xl leading-8' },
    { label: 'Kỹ năng phù hợp', value: `${matchingSkills}%`, meta: 'Trung bình', icon: 'uil:heart-medical', iconClass: 'bg-emerald-50 text-emerald-600', valueClass: 'text-2xl leading-8' },
    { label: 'Vị trí nổi bật', value: experiencedCount, meta: 'Có kinh nghiệm > 3 năm', icon: 'uil:star', iconClass: 'bg-amber-50 text-amber-600', valueClass: 'text-2xl leading-8' }
  ]
})

function normalizeStatus(status?: string): ApplicationStatus {
  const value = (status || 'APPLIED').toUpperCase()
  return ['ACCEPTED', 'REJECTED'].includes(value) ? value as ApplicationStatus : 'APPLIED'
}

function getApplicationKey(application: any) {
  return application?.id ?? `${application?.job_id || application?.job?.id || 'job'}-${application?.student?.id || application?.student_id || getStudentName(application)}`
}

function cleanHoverText(value: any) {
  return String(value ?? '').trim()
}

function buildHoverRows(rows: Array<{ label: string; value: any }>) {
  return rows
    .map((row) => ({
      label: cleanHoverText(row.label),
      value: cleanHoverText(row.value)
    }))
    .filter((row) => row.label && row.value)
}

function normalizeHoverPayload(value?: HoverPayload | string): HoverPayload | null {
  if (typeof value === 'string') {
    const text = cleanHoverText(value)
    if (!text) return null
    return {
      title: text,
      icon: 'uil:info-circle',
      tone: 'sky'
    }
  }

  if (!value || !cleanHoverText(value.title)) return null

  return {
    ...value,
    title: cleanHoverText(value.title),
    eyebrow: cleanHoverText(value.eyebrow),
    subtitle: cleanHoverText(value.subtitle),
    rows: value.rows?.filter((row) => cleanHoverText(row.label) && cleanHoverText(row.value)),
    badges: value.badges?.map(cleanHoverText).filter(Boolean)
  }
}

function getMetricHoverInfo(card: any): HoverPayload {
  return {
    eyebrow: card?.label,
    title: cleanHoverText(card?.value) || '0',
    subtitle: card?.meta,
    icon: card?.icon || 'uil:chart',
    tone: getToneFromClass(card?.iconClass),
    rows: buildHoverRows([
      { label: 'Chỉ số', value: card?.label },
      { label: 'Giá trị', value: card?.value },
      { label: 'Ghi chú', value: card?.meta }
    ])
  }
}

function getChartHoverInfo(item: any): HoverPayload {
  return {
    eyebrow: chartTitle.value,
    title: item?.label || 'Thống kê',
    subtitle: `${item?.percent ?? 0}% trong danh sách hiện tại`,
    icon: props.mode === 'rejected' ? 'uil:chart-pie-alt' : 'uil:analysis',
    tone: props.mode === 'rejected' ? 'rose' : 'sky',
    rows: buildHoverRows([
      { label: 'Tỷ lệ', value: `${item?.percent ?? 0}%` },
      { label: 'Số lượng', value: item?.value },
      { label: 'Nhóm', value: chartTitle.value }
    ])
  }
}

function getCandidateHoverInfo(application: any): HoverPayload {
  return {
    eyebrow: 'Ứng viên',
    title: getStudentName(application),
    subtitle: application?.student?.email || 'Chưa có email',
    icon: 'uil:user',
    tone: 'sky',
    rows: buildHoverRows([
      { label: 'Email', value: application?.student?.email || 'Chưa có email' },
      { label: 'Số điện thoại', value: getStudentPhone(application) },
      { label: 'Kinh nghiệm', value: getExperience(application) },
      { label: 'Nguồn', value: getApplicationSource(application) }
    ])
  }
}

function getJobHoverInfo(application: any): HoverPayload {
  return {
    eyebrow: 'Vị trí ứng tuyển',
    title: application?.job?.title || 'Tin tuyển dụng',
    subtitle: `Mã: #${getJobCode(application)}`,
    icon: 'uil:briefcase-alt',
    tone: 'sky',
    rows: buildHoverRows([
      { label: 'Mã tin', value: `#${getJobCode(application)}` },
      { label: 'Địa điểm', value: application?.job?.location },
      { label: 'Mức lương', value: application?.job?.salary },
      { label: 'Nhóm nghề', value: getExperienceTrack(application) }
    ])
  }
}

function getExperienceHoverInfo(application: any): HoverPayload {
  return {
    eyebrow: 'Kinh nghiệm',
    title: getExperience(application),
    subtitle: getExperienceTrack(application),
    icon: 'uil:chart-growth',
    tone: 'emerald',
    rows: buildHoverRows([
      { label: 'Kinh nghiệm', value: getExperience(application) },
      { label: 'Mảng', value: getExperienceTrack(application) },
      { label: 'Đánh giá', value: getRating(application) ? `${getRating(application)?.toFixed(1)}/5` : 'Chưa đánh giá' }
    ])
  }
}

function getSkillsHoverInfo(application: any): HoverPayload {
  const skills = getSkills(application)
  return {
    eyebrow: 'Kỹ năng nổi bật',
    title: skills.length > 0 ? `${skills.length} kỹ năng` : 'Chưa cập nhật kỹ năng',
    subtitle: skills.length > 0 ? 'Danh sách kỹ năng đầy đủ của ứng viên' : 'Ứng viên chưa bổ sung kỹ năng trong hồ sơ.',
    icon: 'uil:lightbulb-alt',
    tone: 'emerald',
    badges: skills.length > 0 ? skills : ['Chưa cập nhật'],
    rows: buildHoverRows([
      { label: 'Số kỹ năng', value: skills.length },
      { label: 'Hiển thị trong bảng', value: getVisibleSkills(application).join(', ') || 'Chưa cập nhật' }
    ])
  }
}

function getRejectionHoverInfo(application: any): HoverPayload {
  return {
    eyebrow: 'Lý do từ chối',
    title: getRejectionReason(application),
    subtitle: getCandidateNote(application),
    icon: 'uil:times-circle',
    tone: 'rose',
    rows: buildHoverRows([
      { label: 'Lý do', value: getRejectionReason(application) },
      { label: 'Ngày từ chối', value: formatDateTime(getPrimaryDate(application)) },
      { label: 'Ghi chú', value: getCandidateNote(application) }
    ])
  }
}

function getSourceHoverInfo(application: any): HoverPayload {
  return {
    eyebrow: 'Nguồn ứng viên',
    title: getApplicationSource(application),
    subtitle: getStudentName(application),
    icon: 'uil:link-alt',
    tone: 'sky',
    rows: buildHoverRows([
      { label: 'Nguồn', value: getApplicationSource(application) },
      { label: 'Ứng viên', value: getStudentName(application) },
      { label: 'Vị trí', value: application?.job?.title }
    ])
  }
}

function getNoteHoverInfo(application: any): HoverPayload {
  return {
    eyebrow: 'Ghi chú',
    title: props.mode === 'rejected' ? 'Ghi chú từ chối' : 'Ghi chú ứng viên đã lưu',
    subtitle: getCandidateNote(application),
    icon: 'uil:comment-alt-notes',
    tone: props.mode === 'rejected' ? 'rose' : 'sky',
    rows: buildHoverRows([
      { label: 'Ứng viên', value: getStudentName(application) },
      { label: 'Ghi chú', value: getCandidateNote(application) }
    ])
  }
}

function getToneFromClass(className?: string): HoverTone {
  const value = String(className || '')
  if (value.includes('rose')) return 'rose'
  if (value.includes('emerald')) return 'emerald'
  if (value.includes('amber')) return 'amber'
  if (value.includes('slate')) return 'slate'
  return 'sky'
}

function getHoverToneClass(tone: HoverTone | undefined, part: 'icon' | 'eyebrow' | 'badge') {
  const value = tone || 'sky'
  const classes = {
    sky: {
      icon: 'bg-sky-100 text-sky-700',
      eyebrow: 'text-sky-700',
      badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
    },
    rose: {
      icon: 'bg-rose-100 text-rose-700',
      eyebrow: 'text-rose-700',
      badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
    },
    emerald: {
      icon: 'bg-emerald-100 text-emerald-700',
      eyebrow: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
    },
    amber: {
      icon: 'bg-amber-100 text-amber-700',
      eyebrow: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
    },
    slate: {
      icon: 'bg-slate-100 text-slate-700',
      eyebrow: 'text-slate-700',
      badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
    }
  }

  return classes[value][part]
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getTooltipPosition(rect: DOMRect, tooltipWidth: number, tooltipHeight: number) {
  const padding = 12
  const gap = 10
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const safeWidth = Math.min(tooltipWidth, viewportWidth - padding * 2)
  const safeHeight = Math.min(tooltipHeight, viewportHeight - padding * 2)
  const spaceBelow = viewportHeight - rect.bottom - padding
  const spaceAbove = rect.top - padding
  const placement: HoverInfo['placement'] = spaceBelow >= safeHeight + gap || spaceBelow >= spaceAbove ? 'bottom' : 'top'
  const idealTop = placement === 'bottom' ? rect.bottom + gap : rect.top - safeHeight - gap

  return {
    left: clampNumber(rect.left + rect.width / 2 - safeWidth / 2, padding, viewportWidth - safeWidth - padding),
    top: clampNumber(idealTop, padding, viewportHeight - safeHeight - padding),
    maxHeight: Math.max(180, viewportHeight - padding * 2),
    placement
  }
}

async function adjustHoverPosition(rect: DOMRect) {
  await nextTick()
  if (!hoverInfo.value || !hoverTooltipRef.value) return

  const tooltipRect = hoverTooltipRef.value.getBoundingClientRect()
  const position = getTooltipPosition(
    rect,
    tooltipRect.width || Math.min(460, window.innerWidth - 24),
    tooltipRect.height || 180
  )

  hoverInfo.value = {
    ...hoverInfo.value,
    ...position
  }
}

function showHoverInfo(event: MouseEvent | FocusEvent, value?: HoverPayload | string) {
  cancelHoverHide()
  const payload = normalizeHoverPayload(value)
  if (!payload) {
    hoverInfo.value = null
    return
  }

  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) return

  const rect = target.getBoundingClientRect()
  const position = getTooltipPosition(rect, Math.min(460, window.innerWidth - 24), 180)

  hoverInfo.value = {
    ...payload,
    ...position
  }
  adjustHoverPosition(rect)
}

function cancelHoverHide() {
  if (!hoverHideTimer) return
  window.clearTimeout(hoverHideTimer)
  hoverHideTimer = null
}

function hideHoverInfo() {
  cancelHoverHide()
  hoverHideTimer = window.setTimeout(() => {
    hoverInfo.value = null
    hoverHideTimer = null
  }, 120)
}

function closeHoverInfo() {
  cancelHoverHide()
  hoverInfo.value = null
}

function handleHoverViewportChange(event: Event) {
  const target = event.target
  if (target instanceof Node && hoverTooltipRef.value?.contains(target)) return
  closeHoverInfo()
}

function isSavedCandidate(application: any) {
  const flags = [
    application?.is_saved,
    application?.saved,
    application?.bookmarked,
    application?.is_bookmarked,
    application?.is_favorite,
    application?.favorite,
    application?.candidate_saved,
    application?.student_saved,
    application?.employer_saved,
    application?.enterprise_saved,
    application?.saved_at,
    application?.savedAt
  ]

  return isHiredCandidate(application) ||
    flags.some(Boolean) ||
    (Array.isArray(application?.saves) && application.saves.length > 0) ||
    (Array.isArray(application?.saved_by_enterprises) && application.saved_by_enterprises.length > 0)
}

function normalizeInterviewResult(result?: string) {
  return String(result || '').trim().toUpperCase()
}

function isHiredCandidate(application: any) {
  return normalizeInterviewResult(application?.interview_result) === 'HIRED'
}

function getStudentName(application: any) {
  return application?.student?.student_profile?.name || application?.student?.name || application?.student?.email?.split('@')[0] || 'Ứng viên'
}

function getStudentPhone(application: any) {
  return application?.student?.student_profile?.phone || application?.student?.phone || 'Chưa có SĐT'
}

function getInitials(application: any) {
  return getStudentName(application)
    .split(/\s+/)
    .map((part: string) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getSkills(application: any) {
  const skills = application?.student?.student_profile?.skills || application?.skills || application?.job?.skills
  if (!Array.isArray(skills)) return []
  return skills.map((skill: any) => skill?.name || skill?.title || skill).filter(Boolean)
}

function getVisibleSkills(application: any) {
  return getSkills(application).slice(0, 3)
}

function getHiddenSkillCount(application: any) {
  return Math.max(getSkills(application).length - 3, 0)
}

function getBackendAssetUrl(value?: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '')
  return `${backendOrigin}${value.startsWith('/') ? '' : '/'}${value}`
}

function getCvUrl(application: any) {
  return getBackendAssetUrl(application?.student?.student_profile?.cv_url)
}

function getAvatarUrl(application: any) {
  return getBackendAssetUrl(application?.student?.student_profile?.avatar_url || application?.student?.avatar_url)
}

function getJobCode(application: any) {
  return application?.job?.id || application?.job_id || application?.id || 'N/A'
}

function getJobOptionValue(application: any) {
  return String(application?.job?.id || application?.job?.title || 'unknown')
}

function getApplicationSource(application: any) {
  if (props.mode === 'saved' && isHiredCandidate(application)) return 'Được nhận'
  return application?.source || application?.application_source || application?.referrer || 'Website'
}

function getSourceClass(application: any) {
  if (props.mode === 'saved' && isHiredCandidate(application)) return 'bg-emerald-50 text-emerald-700'
  const source = getApplicationSource(application).toLowerCase()
  if (source.includes('linkedin')) return 'bg-blue-50 text-blue-700'
  if (source.includes('giới') || source.includes('gioi') || source.includes('ref')) return 'bg-emerald-50 text-emerald-700'
  return 'bg-sky-50 text-sky-700'
}

function getRating(application: any) {
  const value = Number(application?.rating || application?.score || application?.student?.student_profile?.rating)
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.min(5, value)
}

function getExperience(application: any) {
  return application?.experience ||
    application?.student?.student_profile?.experience ||
    application?.student?.student_profile?.years_of_experience ||
    application?.job?.experience ||
    'Chưa cập nhật'
}

function getExperienceTrack(application: any) {
  return application?.job?.category?.name || application?.job?.type || application?.job?.employment_type || application?.job?.title?.split(/\s+/).slice(0, 2).join(' ') || 'QuickWork'
}

function getExperienceYears(application: any) {
  const text = String(getExperience(application))
  const value = Number(text.match(/\d+/)?.[0] || 0)
  return Number.isFinite(value) ? value : 0
}

function getRejectionReason(application: any) {
  const raw = application?.rejection_reason || application?.reject_reason || application?.reason || application?.employer_note || ''
  const text = String(raw).toLowerCase()
  if (text.includes('kinh nghiệm') || text.includes('kinh nghiem') || text.includes('experience')) return 'Thiếu kinh nghiệm'
  if (text.includes('kỹ năng') || text.includes('ky nang') || text.includes('skill') || text.includes('phù hợp') || text.includes('phu hop')) return 'Kỹ năng chưa phù hợp'
  if (text.includes('lương') || text.includes('luong') || text.includes('salary')) return 'Mức lương không phù hợp'
  if (raw) return String(raw)
  return 'Khác'
}

function getReasonClass(application: any) {
  const reason = getRejectionReason(application)
  if (reason === 'Thiếu kinh nghiệm') return 'bg-amber-50 text-amber-700'
  if (reason === 'Kỹ năng chưa phù hợp') return 'bg-rose-50 text-rose-700'
  if (reason === 'Mức lương không phù hợp') return 'bg-sky-50 text-sky-700'
  return 'bg-violet-50 text-violet-700'
}

function getCandidateNote(application: any) {
  if (props.mode === 'saved' && isHiredCandidate(application)) {
    return application?.interview_result_note ||
      application?.employer_note ||
      'Ứng viên đã được nhận sau phỏng vấn và được giữ trong danh sách đã lưu để theo dõi.'
  }
  return application?.saved_note ||
    application?.note ||
    application?.employer_note ||
    application?.cover_letter ||
    (props.mode === 'rejected' ? 'Chưa có ghi chú từ nhà tuyển dụng.' : 'Ứng viên đã được đánh dấu để xem xét sau.')
}

function getPrimaryDate(application: any) {
  if (props.mode === 'rejected') {
    return application?.rejected_at || application?.reviewed_at || application?.updated_at || application?.created_at
  }
  if (isHiredCandidate(application)) {
    return application?.interview_result_at || application?.updated_at || application?.created_at
  }
  return application?.saved_at || application?.savedAt || application?.updated_at || application?.created_at
}

function detailItems(application: any) {
  return [
    { label: 'Email', value: application?.student?.email || 'Chưa cập nhật' },
    { label: 'Số điện thoại', value: getStudentPhone(application) },
    { label: props.mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận', value: formatDateTime(getPrimaryDate(application)) },
    { label: 'Nguồn ứng tuyển', value: getApplicationSource(application) },
    { label: 'Vị trí ứng tuyển', value: application?.job?.title || 'Chưa cập nhật' },
    { label: props.mode === 'rejected' ? 'Lý do từ chối' : 'Kinh nghiệm', value: props.mode === 'rejected' ? getRejectionReason(application) : getExperience(application) },
    ...(props.mode === 'saved' && isHiredCandidate(application)
      ? [
          { label: 'Kết quả phỏng vấn', value: 'Được nhận' },
          { label: 'Ngày chốt kết quả', value: formatDateTime(application?.interview_result_at) }
        ]
      : [])
  ]
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

function formatTime(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getDateTime(value?: string) {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function isWithinDays(value: string | undefined, days: number) {
  const timestamp = getDateTime(value)
  if (!timestamp) return false
  return timestamp >= Date.now() - days * 24 * 60 * 60 * 1000
}

function formatPercentNumber(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function getReasonCount(reason: string) {
  return baseApplications.value.filter((application) => getRejectionReason(application) === reason).length
}

function getMatchingSkillPercent() {
  if (baseApplications.value.length === 0) return 0
  const scored = baseApplications.value.map((application) => {
    const rating = getRating(application)
    if (rating) return (rating / 5) * 100
    return getSkills(application).length > 0 ? 60 : 0
  })
  return Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length)
}

function buildDistribution(apps: any[], getter: (application: any) => string, preferred: Array<{ label: string; dotClass: string }>) {
  if (apps.length === 0) return []
  const counts = new Map<string, number>()
  apps.forEach((application) => {
    const label = getter(application) || 'Khác'
    counts.set(label, (counts.get(label) || 0) + 1)
  })

  const dotByLabel = new Map(preferred.map((item) => [item.label, item.dotClass]))
  const fallbackDots = ['bg-sky-500', 'bg-rose-400', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-400']

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value], index) => ({
      label,
      value,
      percent: formatPercentNumber(value, apps.length),
      dotClass: dotByLabel.get(label) || fallbackDots[index % fallbackDots.length]
    }))
}

function openProfileModal(application: any) {
  selectedApplication.value = application
  profileModalOpen.value = true
}

function closeProfileModal() {
  profileModalOpen.value = false
}

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function toggleSelection(application: any, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const id = getApplicationKey(application)
  if (checked && !selectedIds.value.includes(id)) {
    selectedIds.value.push(id)
  }
  if (!checked) {
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id)
  }
}

function toggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const pageIds = paginatedApplications.value.map(getApplicationKey)
  if (checked) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...pageIds]))
    return
  }
  selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
}

function clearFilters() {
  searchQuery.value = ''
  activeJob.value = 'ALL'
  activeMetaFilter.value = 'ALL'
  activeDateSort.value = 'NEWEST'
  selectedIds.value = []
}

function escapeCsv(value: any) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function exportCandidates() {
  if (filteredApplications.value.length === 0) {
    toast.warning('Không có dữ liệu xuất', 'Danh sách hiện tại chưa có ứng viên phù hợp.')
    return
  }

  const rows = [
    props.mode === 'rejected'
      ? ['Ứng viên', 'Email', 'SĐT', 'Vị trí', 'Kinh nghiệm', 'Ngày từ chối', 'Lý do', 'Nguồn', 'Ghi chú']
      : ['Ứng viên', 'Email', 'SĐT', 'Vị trí', 'Kinh nghiệm', 'Kỹ năng', 'Ngày lưu/nhận', 'Nguồn', 'Ghi chú'],
    ...filteredApplications.value.map((application) => props.mode === 'rejected'
      ? [
          getStudentName(application),
          application?.student?.email || '',
          getStudentPhone(application),
          application?.job?.title || '',
          getExperience(application),
          formatDateTime(getPrimaryDate(application)),
          getRejectionReason(application),
          getApplicationSource(application),
          getCandidateNote(application)
        ]
      : [
          getStudentName(application),
          application?.student?.email || '',
          getStudentPhone(application),
          application?.job?.title || '',
          getExperience(application),
          getSkills(application).join(', '),
          formatDateTime(getPrimaryDate(application)),
          getApplicationSource(application),
          getCandidateNote(application)
        ])
  ]

  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = props.mode === 'rejected' ? 'quickwork-ung-vien-bi-tu-choi.csv' : 'quickwork-ung-vien-da-luu.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function handleBulkAction() {
  if (props.mode === 'rejected') {
    toast.info('Chưa có thao tác xóa dữ liệu', 'Trang đang hiển thị dữ liệu thật từ hệ thống nên chưa xóa trực tiếp trên frontend.')
    return
  }
  toast.info('Chưa hỗ trợ ghi chú hàng loạt', 'Chức năng ghi chú sẽ cần API lưu ghi chú ứng viên.')
}

function handleEditNote(application: any) {
  toast.info('Chưa hỗ trợ sửa ghi chú', `${getStudentName(application)} đang dùng dữ liệu ghi chú được đồng bộ từ hệ thống.`)
}

function handleRemoveSaved(application: any) {
  toast.info('Chưa hỗ trợ bỏ lưu', `${getStudentName(application)} vẫn được giữ theo trạng thái lưu từ dữ liệu hệ thống.`)
}

function handleRestore(application: any) {
  toast.info('Chưa hỗ trợ hoàn tác', `${getStudentName(application)} cần API cập nhật trạng thái để hoàn tác từ chối.`)
}

async function fetchApplications() {
  try {
    loading.value = true
    errorMessage.value = ''
    const response: any = await JobService.getEnterpriseApplications()
    applications.value = response?.success && Array.isArray(response.data) ? response.data : []
    selectedIds.value = []
  } catch (error: any) {
    applications.value = []
    selectedApplication.value = null
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải dữ liệu ứng viên.'
  } finally {
    loading.value = false
  }
}

watch([searchQuery, activeJob, activeMetaFilter, activeDateSort, pageSize], () => {
  currentPage.value = 1
})

watch(filteredApplications, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
  const visibleIds = new Set(filteredApplications.value.map(getApplicationKey))
  selectedIds.value = selectedIds.value.filter((id) => visibleIds.has(id))
})

onMounted(() => {
  fetchApplications()
  if (process.client) {
    window.addEventListener('scroll', handleHoverViewportChange, true)
    window.addEventListener('resize', handleHoverViewportChange)
  }
})

onBeforeUnmount(() => {
  closeHoverInfo()
  if (process.client) {
    window.removeEventListener('scroll', handleHoverViewportChange, true)
    window.removeEventListener('resize', handleHoverViewportChange)
  }
})
</script>

<style scoped>
.quickwork-candidate-modal-scroll {
  scrollbar-color: #bae6fd #f8fafc;
  scrollbar-width: thin;
}

.quickwork-candidate-tooltip-scroll {
  scrollbar-color: #bae6fd transparent;
  scrollbar-width: thin;
}

.quickwork-candidate-tooltip-scroll::-webkit-scrollbar {
  width: 8px;
}

.quickwork-candidate-tooltip-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.quickwork-candidate-tooltip-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.quickwork-candidate-tooltip-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border: 2px solid #fff;
  border-radius: 999px;
}

.quickwork-candidate-tooltip-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar {
  width: 8px;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border: 2px solid #f8fafc;
  border-radius: 999px;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
