<template>
  <div class="min-h-screen bg-[#f5f8fc]">
    <section class="relative overflow-visible bg-[#03132f] text-white">
      <div class="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div class="absolute -left-16 top-8 h-64 w-64 rounded-full bg-sky-500/70 blur-3xl"></div>
        <div class="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-blue-500 blur-3xl"></div>
      </div>

      <div class="relative z-20 mx-auto grid max-w-[1420px] gap-8 px-4 pb-7 pt-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:pt-12">
        <div class="flex flex-col justify-center">
          <div class="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-sky-100">
            <Icon name="uil:bolt" class="h-4 w-4" />
            {{ isPersonalizedJobs ? 'Gợi ý theo hồ sơ của bạn' : 'Tất cả việc làm trên QuickWork' }}
          </div>
          <h1 class="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[54px]">
            {{ isPersonalizedJobs ? 'Việc làm phù hợp nhất với bạn' : 'Khám phá toàn bộ việc làm đang tuyển' }}
          </h1>
          <p class="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-200 sm:text-base">
            {{ isPersonalizedJobs
              ? 'Tất cả tin đã duyệt được đánh giá theo hồ sơ và xếp từ phù hợp nhất; trỏ vào điểm số để xem chi tiết cách tính.'
              : 'Danh sách được tải trực tiếp từ hệ thống, chỉ hiển thị các tin tuyển dụng đã được duyệt.' }}
          </p>
        </div>

        <div class="hidden items-center justify-center lg:flex">
          <div class="relative h-56 w-full max-w-sm rounded-2xl border border-sky-300/20 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div class="space-y-3">
              <div v-for="row in 3" :key="row" class="rounded-xl bg-white p-3 shadow-lg">
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 rounded-lg bg-sky-100"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-2.5 w-2/3 rounded bg-sky-200"></div>
                    <div class="h-2 w-1/2 rounded bg-slate-200"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="absolute -bottom-5 -left-5 flex h-16 w-16 rotate-[-8deg] items-center justify-center rounded-2xl bg-white text-sky-700 shadow-xl">
              <Icon name="uil:briefcase-alt" class="h-8 w-8" />
            </div>
            <div class="absolute -right-5 top-20 flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-sky-500 bg-white text-sky-700 shadow-xl">
              <Icon name="uil:search" class="h-8 w-8" />
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <form class="relative z-40 grid gap-3 rounded-2xl border border-white/20 bg-white p-3 text-slate-900 shadow-2xl shadow-slate-950/25 lg:grid-cols-[1.2fr_0.8fr_220px_130px]" @submit.prevent="runSearch">
            <label class="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
              <Icon name="uil:search" class="h-5 w-5 shrink-0 text-sky-600" />
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Vị trí, kỹ năng hoặc công ty"
                class="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
              >
            </label>
            <ScrollSelect
              v-model="activeLocation"
              :options="locationOptions"
              :ariaLabel="'Lọc theo địa điểm'"
              icon="uil:map-marker"
              size="filter"
              searchable
              filter-local
              search-placeholder="Tìm thành phố"
            />
            <ScrollSelect
              v-model="activeType"
              :options="typeOptions"
              :ariaLabel="'Lọc theo loại hình công việc'"
              icon="uil:briefcase-alt"
              size="filter"
              searchable
              filter-local
              search-placeholder="Tìm loại hình"
            />
            <button
              type="submit"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </form>

          <div class="relative z-30 mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex flex-wrap gap-2.5 text-sm">
            <button
              v-for="tag in quickTags"
              :key="tag.value"
              type="button"
              :class="[
                'inline-flex h-10 items-center gap-2 rounded-full px-4 font-black transition-colors',
                activeQuickTag === tag.value
                  ? 'bg-sky-500 text-white shadow-lg shadow-slate-950/20'
                  : 'bg-white/95 text-slate-950 hover:bg-sky-100'
              ]"
              @click="activeQuickTag = tag.value"
            >
              <Icon :name="tag.icon" class="h-4 w-4" />
              {{ tag.label }}
            </button>
            </div>
            <NuxtLink
              v-if="savedOnly"
              to="/student"
              class="inline-flex h-11 w-fit shrink-0 items-center gap-3 rounded-xl border border-sky-400 bg-white/[0.06] px-5 text-sm font-black text-white transition hover:bg-sky-500/20"
            >
              <Icon name="uil:apps" class="h-6 w-6" />
              Tất cả việc làm
            </NuxtLink>
            <NuxtLink
              v-else-if="favoriteJobIds.size > 0"
              to="/student?view=saved"
              class="inline-flex h-11 w-fit shrink-0 items-center gap-3 rounded-xl border border-sky-400 bg-white/[0.06] px-5 text-sm font-black text-white transition hover:bg-sky-500/20"
            >
              <Icon name="uil:heart" class="h-6 w-6" />
              Tin đã lưu
              <span class="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-500 px-2 text-xs">{{ favoriteJobIds.size }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section ref="resultsSection" class="mx-auto grid max-w-[1420px] scroll-mt-24 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
      <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-black text-slate-950">Bộ lọc tìm kiếm</h2>
          <button type="button" class="text-xs font-black text-sky-700 hover:text-sky-800" @click="clearFilters">
            Xóa tất cả
          </button>
        </div>

        <div class="mt-5 divide-y divide-slate-100">
          <div v-for="section in filterSections" :key="section.title" class="py-5 first:pt-0">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 text-left"
              :aria-expanded="isFilterGroupOpen(section.key)"
              @click="toggleFilterGroup(section.key)"
            >
              <span class="inline-flex min-w-0 items-center gap-2">
                <span class="truncate text-sm font-black text-slate-900">{{ section.title }}</span>
                <span v-if="selectedFilters[section.key].length" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-100 px-1 text-[10px] font-black text-sky-700">{{ selectedFilters[section.key].length }}</span>
              </span>
              <Icon :class="['h-5 w-5 shrink-0 text-slate-400 transition-transform', isFilterGroupOpen(section.key) ? 'rotate-180' : '']" name="uil:angle-down" />
            </button>
            <div v-if="isFilterGroupOpen(section.key)" class="quickwork-filter-options mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
              <label v-for="option in section.options" :key="option.label" class="flex cursor-pointer items-center justify-between gap-3 text-sm">
                <span class="flex min-w-0 items-center gap-2.5 font-semibold text-slate-600">
                  <input
                    v-model="selectedFilters[section.key]"
                    :value="option.label"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  >
                  <span class="truncate">{{ option.label }}</span>
                </span>
                <span class="text-xs font-bold text-slate-400">{{ option.count }}</span>
              </label>
            </div>
          </div>

          <div class="py-5">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 text-left"
              :aria-expanded="isFilterGroupOpen('location')"
              @click="toggleFilterGroup('location')"
            >
              <span class="inline-flex min-w-0 items-center gap-2">
                <span class="truncate text-sm font-black text-slate-900">Địa điểm</span>
                <span v-if="activeLocation !== 'Địa điểm'" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-100 px-1 text-[10px] font-black text-sky-700">1</span>
              </span>
              <Icon :class="['h-5 w-5 shrink-0 text-slate-400 transition-transform', isFilterGroupOpen('location') ? 'rotate-180' : '']" name="uil:angle-down" />
            </button>
            <div v-if="isFilterGroupOpen('location')" class="quickwork-filter-options mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
              <button
                v-for="option in locationFilterOptions"
                :key="option.label"
                type="button"
                class="flex w-full items-center justify-between gap-3 text-left text-sm"
                @click="activeLocation = activeLocation === option.label ? 'Địa điểm' : option.label"
              >
                <span class="flex min-w-0 items-center gap-2.5 font-semibold text-slate-600">
                  <span :class="['flex h-4 w-4 shrink-0 items-center justify-center rounded border', activeLocation === option.label ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white']">
                    <Icon v-if="activeLocation === option.label" name="uil:check" class="h-3 w-3" />
                  </span>
                  <span class="truncate">{{ option.label }}</span>
                </span>
                <span class="text-xs font-bold text-slate-400">{{ option.count }}</span>
              </button>
            </div>
          </div>

          <div class="pt-5">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 text-left"
              :aria-expanded="isFilterGroupOpen('salary')"
              @click="toggleFilterGroup('salary')"
            >
              <span class="inline-flex min-w-0 items-center gap-2">
                <span class="truncate text-sm font-black text-slate-900">Mức lương</span>
                <span v-if="selectedSalary.length" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-100 px-1 text-[10px] font-black text-sky-700">{{ selectedSalary.length }}</span>
              </span>
              <Icon :class="['h-5 w-5 shrink-0 text-slate-400 transition-transform', isFilterGroupOpen('salary') ? 'rotate-180' : '']" name="uil:angle-down" />
            </button>
            <div v-if="isFilterGroupOpen('salary')" class="mt-4 space-y-3">
              <label v-for="option in salaryOptions" :key="option.label" class="flex cursor-pointer items-center justify-between gap-3 text-sm">
                <span class="flex min-w-0 items-center gap-2.5 font-semibold text-slate-600">
                  <input
                    v-model="selectedSalary"
                    :value="option.label"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  >
                  <span class="truncate">{{ option.label }}</span>
                </span>
                <span class="text-xs font-bold text-slate-400">{{ option.count }}</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      <main class="min-w-0">
        <div class="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-slate-950">
              {{ filteredJobs.length.toLocaleString('vi-VN') }} {{ savedOnly ? 'việc làm đã lưu' : 'việc làm phù hợp' }}
            </h2>
            <p class="mt-1 max-w-xl text-sm font-medium leading-6 text-slate-500">
              {{ savedOnly
                ? 'Chỉ hiển thị những công việc bạn đã lưu; bỏ lưu sẽ xóa tin khỏi danh sách này.'
                : isPersonalizedJobs
                ? 'Mặc định xếp theo điểm phù hợp; bộ lọc không làm thay đổi điểm số của từng tin.'
                : 'Danh sách được lọc theo từ khóa, địa điểm và loại việc bạn chọn.' }}
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-3">
            <NuxtLink
              v-if="savedOnly"
              to="/student"
              class="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
            >
              <Icon name="uil:arrow-left" class="h-4 w-4" />
              Tất cả việc làm
            </NuxtLink>
            <span class="text-sm font-bold text-slate-500">Sắp xếp</span>
            <ScrollSelect
              v-model="sortMode"
              class="w-44"
              :options="sortOptions"
              :ariaLabel="'Sắp xếp việc làm'"
              size="filter"
              tone="slate"
            />
          </div>
        </div>

        <div v-if="isLoading" class="space-y-4">
          <div v-for="item in 5" :key="item" class="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
        </div>

        <div v-else-if="filteredJobs.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Icon name="uil:search-alt" class="h-7 w-7" />
          </div>
          <h3 class="mt-4 text-lg font-black text-slate-950">{{ savedOnly ? 'Bạn chưa lưu việc làm nào' : 'Không tìm thấy việc phù hợp' }}</h3>
          <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {{ savedOnly
              ? 'Hãy lưu những công việc bạn quan tâm để xem lại nhanh tại đây.'
              : 'Thử đổi từ khóa, bỏ bớt bộ lọc hoặc chọn lại địa điểm để xem thêm cơ hội.' }}
          </p>
          <button v-if="!savedOnly" type="button" class="mt-5 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-sky-400" @click="clearFilters">
            Xóa bộ lọc
          </button>
          <NuxtLink v-else to="/student" class="mt-5 inline-flex rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-sky-400">
            Xem việc làm phù hợp
          </NuxtLink>
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="job in paginatedJobs"
            :key="job.id"
            :class="[
              'job-result-card relative rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-6',
              primaryJobSignal(job)?.cardClass || 'border-slate-200 shadow-slate-200/50 hover:border-sky-200 hover:shadow-sky-100/60'
            ]"
          >
            <div
              v-if="primaryJobSignal(job)"
              :class="['pointer-events-none absolute inset-y-0 left-0 w-1', primaryJobSignal(job)?.accentClass]"
              aria-hidden="true"
            />
            <div v-if="jobSignals(job).length" class="mb-4 flex flex-wrap items-center gap-2">
              <span
                v-for="signal in jobSignals(job)"
                :key="signal.key"
                :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide', signal.badgeClass]"
                :title="signal.title"
              >
                <Icon :name="signal.icon" class="h-4 w-4" />
                {{ signal.label }}
              </span>
            </div>
            <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span :class="['flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl text-base font-black text-white shadow-sm', job.logoClass]">
                <img v-if="job.logoUrl" :src="job.logoUrl" :alt="`Logo ${job.company}`" class="h-full w-full object-cover">
                <template v-else>{{ job.logo }}</template>
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="inline-flex items-center gap-1.5 text-sm font-black text-slate-700">
                      {{ job.company }}
                      <Icon name="uil:check-circle" class="h-4 w-4 text-blue-500" />
                    </p>
                    <h3 class="mt-1 text-2xl font-black leading-tight">
                      <NuxtLink
                        :to="`/jobs/${job.id}`"
                        class="text-sky-700 transition hover:text-sky-800 hover:underline focus:outline-none focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-sky-100"
                      >
                        {{ job.title }}
                      </NuxtLink>
                    </h3>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <JobMatchScoreBadge :job="job" align="right" compact />
                    <button
                      type="button"
                      :class="[
                        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border p-0 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60',
                        isFavoriteJob(job)
                          ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500'
                      ]"
                      :disabled="isFavoriteLoading(job)"
                      :aria-label="isFavoriteJob(job) ? 'Bỏ yêu thích' : 'Lưu việc'"
                      :aria-pressed="isFavoriteJob(job)"
                      @click="toggleFavoriteJob(job)"
                    >
                      <Icon :name="isFavoriteLoading(job) ? 'svg-spinners:180-ring' : 'uil:heart'" class="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                  <span class="inline-flex items-center gap-1.5">
                    <Icon name="uil:apps" class="h-4 w-4 text-sky-600" />
                    {{ job.category }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <Icon name="uil:map-marker" class="h-4 w-4 text-sky-600" />
                    {{ job.location }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <Icon name="uil:briefcase-alt" class="h-4 w-4 text-sky-600" />
                    {{ job.type }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <Icon name="uil:money-bill" class="h-4 w-4 text-sky-600" />
                    {{ job.salary }}
                  </span>
                </div>

                <p class="mt-4 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{{ job.description }}</p>

                <div class="mt-4 flex flex-wrap items-center gap-2">
                  <span v-for="skill in job.skills.slice(0, 5)" :key="skill" class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{{ skill }}</span>
                  <span v-if="job.skills.length > 5" class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">+{{ job.skills.length - 5 }}</span>
                  <span class="ml-auto text-xs font-semibold text-slate-400">{{ job.posted }}</span>
                </div>

                <div class="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span class="inline-flex w-fit items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">
                    <Icon name="uil:users-alt" class="h-4 w-4" />
                    {{ job.slots }} vị trí đang tuyển
                  </span>
                  <button
                    type="button"
                    :class="[
                      'inline-flex min-w-32 items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-black transition-colors disabled:cursor-not-allowed',
                      isAppliedJob(job)
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-sky-200 bg-sky-50 text-sky-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white'
                    ]"
                    :disabled="isApplyingJob(job) || isAppliedJob(job)"
                    @click="applyToJob(job)"
                  >
                    {{ isAppliedJob(job) ? 'Đã ứng tuyển' : 'Ứng tuyển' }}
                    <Icon :name="isApplyingJob(job) ? 'svg-spinners:180-ring' : isAppliedJob(job) ? 'uil:check-circle' : 'uil:arrow-right'" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="changePage"
        />
      </main>

      <aside class="space-y-5 lg:col-span-2 xl:col-span-1">
        <div v-if="favoriteJobIds.size > 0" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
          <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <h2 class="inline-flex min-w-0 items-center gap-2 whitespace-nowrap text-base font-black text-slate-950">
              <Icon name="uil:heart" class="h-5 w-5 shrink-0 text-rose-500" />
              <span class="truncate">Việc đã lưu ({{ favoriteJobIds.size }})</span>
            </h2>
            <NuxtLink :to="savedOnly ? '/student' : '/student?view=saved'" class="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-black text-sky-700 transition hover:bg-sky-50 hover:text-sky-900">
              {{ savedOnly ? 'Tất cả' : 'Xem tất cả' }}
              <Icon :name="savedOnly ? 'uil:arrow-left' : 'uil:arrow-right'" class="h-4 w-4" />
            </NuxtLink>
          </div>

          <div v-if="favoriteJobsPreview.length" class="mt-4 divide-y divide-slate-100">
            <NuxtLink
              v-for="job in favoriteJobsPreview"
              :key="job.id"
              :to="`/jobs/${job.id}`"
              class="group flex items-center gap-3 py-4"
            >
              <span :class="['flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-black text-white', job.logoClass]">
                <img v-if="job.logoUrl" :src="job.logoUrl" :alt="`Logo ${job.company}`" class="h-full w-full object-cover">
                <template v-else>{{ job.logo }}</template>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-black text-sky-700 group-hover:text-blue-800">{{ job.title }}</span>
                <span class="mt-1 block truncate text-xs font-semibold text-slate-500">{{ job.company }}</span>
              </span>
              <Icon name="uil:angle-right" class="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
            </NuxtLink>
          </div>
          <div v-else class="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center">
            <Icon name="uil:heart" class="mx-auto h-7 w-7 text-slate-300" />
            <p class="mt-2 text-sm font-bold text-slate-500">Chưa có việc làm đã lưu</p>
          </div>
        </div>

        <div v-if="showProfileCompletionCard" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div class="flex items-start gap-4">
            <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Icon name="uil:file-check-alt" class="h-8 w-8" />
            </span>
            <div>
              <h2 class="text-base font-black text-slate-950">Tạo hồ sơ nổi bật</h2>
              <p class="mt-1 text-sm font-medium leading-6 text-slate-500">Nhà tuyển dụng sẽ dễ dàng tìm thấy bạn hơn.</p>
              <p v-if="authStore.isAuthenticated && authStore.canAccessStudentArea && profileCompletionLoaded" class="mt-2 text-xs font-black text-sky-700">Đã hoàn thiện {{ profileCompletion }}%</p>
            </div>
          </div>
          <NuxtLink to="/profile" class="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700">
            Hoàn thiện hồ sơ ngay
          </NuxtLink>
        </div>

        <div class="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
            <Icon name="uil:star" class="h-5 w-5" />
          </span>
          <h2 class="mt-4 text-base font-black text-slate-950">Gợi ý dành riêng cho bạn</h2>
          <p class="mt-2 text-sm font-medium leading-6 text-slate-600">Cập nhật kỹ năng và mong muốn nghề nghiệp để điểm phù hợp chính xác hơn.</p>
          <NuxtLink to="/settings?section=jobs" class="mt-4 inline-flex items-center gap-1 text-sm font-black text-sky-700 hover:text-sky-900">
            Cập nhật tùy chọn
            <Icon name="uil:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import JobMatchScoreBadge from '~/components/JobMatchScoreBadge.vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'
import { type ApiJob, type ApiJobRecommendationItem, type DisplayJob, formatJobLocation, mapJobForDisplay, mapRecommendationForDisplay, salaryRank } from '~/utils/jobDisplay'
import { buildSearchText, normalizeSearchText } from '~/utils/searchText'
import { buildJobSignalThresholds, getJobSignals, isNewlyPostedJob } from '~/utils/jobSignals'
import { getStudentProfileCompletion } from '~/utils/studentProfileCompletion'

definePageMeta({
  layout: 'student'
})

type FilterKey = 'types' | 'levels' | 'categories'

const JOBS_PER_PAGE = 5

const toast = useToast()
const authStore = useAuthStore()
const route = useRoute()
const { notifyStudentLoginRequired } = useStudentLoginPrompt()

const searchQuery = ref('')
const activeLocation = ref('Địa điểm')
const activeType = ref('Tất cả loại hình')
const activeQuickTag = ref('all')
const sortMode = ref('newest')
const currentPage = ref(1)
const isLoading = ref(true)
const isPersonalizedJobs = ref(false)
const resultsSection = ref<HTMLElement | null>(null)
const jobs = ref<DisplayJob[]>([])
const profileSnapshot = ref<Record<string, any> | null>(null)
const profileCompletionLoaded = ref(false)
const appliedJobIds = ref<Set<number>>(new Set())
const favoriteJobIds = ref<Set<number>>(new Set())
const applyingJobIds = ref<Set<number>>(new Set())
const favoriteLoadingJobIds = ref<Set<number>>(new Set())
const selectedSalary = ref<string[]>([])
const selectedFilters = reactive<Record<FilterKey, string[]>>({
  types: [],
  levels: [],
  categories: []
})
const openFilterGroups = ref<string[]>([])
const savedOnly = computed(() => {
  const view = Array.isArray(route.query.view) ? route.query.view[0] : route.query.view
  return view === 'saved'
})

const locationOptions = computed(() => ['Địa điểm', ...uniqueValues(jobs.value.map((job) => formatJobLocation(job.location)).filter(isSelectableCity)).sort((a, b) => a.localeCompare(b, 'vi'))]
  .map((value) => ({ value, label: value })))
const typeOptions = computed(() => ['Tất cả loại hình', ...uniqueValues(jobs.value.map((job) => job.type))]
  .map((value) => ({ value, label: value })))
const sortOptions = computed(() => [
  ...(isPersonalizedJobs.value ? [{ value: 'match', label: 'Phù hợp nhất' }] : []),
  { value: 'newest', label: 'Mới nhất' },
  { value: 'slots', label: 'Nhiều vị trí' },
  { value: 'salary', label: 'Lương cao' }
])

const quickTags = computed(() => {
  const availableTypes = new Set(jobs.value.map((job) => job.type))
  const tags = [{ label: 'Tất cả', value: 'all', icon: 'uil:apps' }]
  const typeTags = [
    { label: 'Remote', value: 'Remote', icon: 'uil:wifi' },
    { label: 'Toàn thời gian', value: 'Toàn thời gian', icon: 'uil:clock' },
    { label: 'Bán thời gian', value: 'Bán thời gian', icon: 'uil:history' },
    { label: 'Thực tập', value: 'Thực tập', icon: 'uil:graduation-cap' }
  ]

  tags.push(...typeTags.filter((tag) => availableTypes.has(tag.value)))
  if (jobs.value.some(isFreshJob)) tags.push({ label: 'Mới đăng', value: 'new', icon: 'uil:bolt' })
  if (jobs.value.some(isHighSalaryJob)) tags.push({ label: 'Lương cao', value: 'highSalary', icon: 'uil:money-bill' })
  return tags
})

const filterSections = computed<Array<{ title: string; key: FilterKey; options: Array<{ label: string; count: number }> }>>(() => [
  {
    title: 'Loại việc làm',
    key: 'types',
    options: countOptions(jobs.value.map((job) => job.type))
  },
  {
    title: 'Kinh nghiệm',
    key: 'levels',
    options: countOptions(jobs.value.map((job) => job.level))
  },
  {
    title: 'Ngành nghề',
    key: 'categories',
    options: countOptions(jobs.value.map((job) => job.category))
  }
])

const salaryOptions = computed(() => countOptions(jobs.value.map((job) => job.salaryRange)).sort((a, b) => salaryRank(a.label) - salaryRank(b.label)))
const jobSignalThresholds = computed(() => buildJobSignalThresholds(jobs.value))

const locationFilterOptions = computed(() => countOptions(jobs.value.map((job) => formatJobLocation(job.location)).filter(isSelectableCity))
  .sort((a, b) => b.count - a.count))

const profileCompletion = computed(() => getStudentProfileCompletion(profileSnapshot.value))

const showProfileCompletionCard = computed(() => {
  if (!authStore.isAuthenticated) return true
  if (!authStore.canAccessStudentArea) return false
  return profileCompletionLoaded.value && profileCompletion.value < 100
})

const favoriteJobsPreview = computed(() => jobs.value
  .filter((job) => favoriteJobIds.value.has(job.id))
  .slice(0, 3))

const filteredJobs = computed(() => {
  const query = normalizeSearchText(searchQuery.value)

  const filtered = jobs.value.filter((job) => {
    const searchableJob = buildSearchText([
      job.title,
      job.company,
      job.description,
      job.location,
      job.type,
      job.level,
      job.category,
      job.salary,
      ...job.skills
    ])
    const matchesQuery = !query || searchableJob.includes(query)

    const matchesLocation = activeLocation.value === 'Địa điểm' || formatJobLocation(job.location) === activeLocation.value
    const matchesTypeSelect = activeType.value === 'Tất cả loại hình' || job.type === activeType.value
    const matchesQuick =
      activeQuickTag.value === 'all' ||
      (activeQuickTag.value === 'new' && isFreshJob(job)) ||
      (activeQuickTag.value === 'highSalary' && isHighSalaryJob(job)) ||
      job.type === activeQuickTag.value
    const matchesTypes = selectedFilters.types.length === 0 || selectedFilters.types.includes(job.type)
    const matchesLevels = selectedFilters.levels.length === 0 || selectedFilters.levels.includes(job.level)
    const matchesCategories = selectedFilters.categories.length === 0 || selectedFilters.categories.includes(job.category)
    const matchesSalary = selectedSalary.value.length === 0 || selectedSalary.value.includes(job.salaryRange)
    const matchesSaved = !savedOnly.value || favoriteJobIds.value.has(job.id)

    return matchesQuery && matchesLocation && matchesTypeSelect && matchesQuick && matchesTypes && matchesLevels && matchesCategories && matchesSalary && matchesSaved
  })

  return [...filtered].sort((a, b) => {
    if (sortMode.value === 'match') return (b.matchScore || 0) - (a.matchScore || 0) || b.createdAt - a.createdAt
    if (sortMode.value === 'slots') return b.slots - a.slots
    if (sortMode.value === 'salary') return salaryRank(b.salaryRange) - salaryRank(a.salaryRange)
    return b.createdAt - a.createdAt
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / JOBS_PER_PAGE)))
const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * JOBS_PER_PAGE
  return filteredJobs.value.slice(start, start + JOBS_PER_PAGE)
})

watch(filteredJobs, () => {
  currentPage.value = 1
})

watch(savedOnly, async () => {
  clearFilters()
  await loadJobs()
})

function changePage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function runSearch() {
  currentPage.value = 1
  resultsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function isFilterGroupOpen(group: string) {
  return openFilterGroups.value.includes(group)
}

function toggleFilterGroup(group: string) {
  openFilterGroups.value = isFilterGroupOpen(group)
    ? openFilterGroups.value.filter((item) => item !== group)
    : [...openFilterGroups.value, group]
}

function clearFilters() {
  searchQuery.value = ''
  activeLocation.value = 'Địa điểm'
  activeType.value = 'Tất cả loại hình'
  activeQuickTag.value = 'all'
  selectedFilters.types = []
  selectedFilters.levels = []
  selectedFilters.categories = []
  selectedSalary.value = []
}

function isAppliedJob(job: DisplayJob) {
  return appliedJobIds.value.has(job.id)
}

function isFavoriteJob(job: DisplayJob) {
  return favoriteJobIds.value.has(job.id)
}

function isApplyingJob(job: DisplayJob) {
  return applyingJobIds.value.has(job.id)
}

function isFavoriteLoading(job: DisplayJob) {
  return favoriteLoadingJobIds.value.has(job.id)
}

function updateJobSet(source: { value: Set<number> }, jobId: number, enabled: boolean) {
  const next = new Set(source.value)
  if (enabled) {
    next.add(jobId)
  } else {
    next.delete(jobId)
  }
  source.value = next
}

function requireStudentAction() {
  if (!authStore.isAuthenticated) {
    notifyStudentLoginRequired('Đăng nhập bằng tài khoản sinh viên để ứng tuyển hoặc lưu việc.')
    return false
  }

  if (!authStore.canAccessStudentArea) {
    toast.warning('Tài khoản không phù hợp', 'Chỉ tài khoản sinh viên mới có thể ứng tuyển hoặc lưu việc.')
    return false
  }

  return true
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function countOptions(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }))
}

function isSelectableCity(value: string) {
  return Boolean(value) && !['Remote', 'Chưa cập nhật'].includes(value)
}

function isFreshJob(job: DisplayJob) {
  return isNewlyPostedJob(job)
}

function isHighSalaryJob(job: DisplayJob) {
  return salaryRank(job.salaryRange) >= salaryRank('20 - 30 triệu')
}

function jobSignals(job: DisplayJob) {
  return getJobSignals(job, jobSignalThresholds.value)
}

function primaryJobSignal(job: DisplayJob) {
  return jobSignals(job)[0]
}

async function loadPublicJobs() {
  try {
    const response: any = await JobService.getAllJobs()
    const rawJobs: ApiJob[] = response?.success && Array.isArray(response.data) ? response.data : []
    jobs.value = rawJobs.map(mapJobForDisplay)
    isPersonalizedJobs.value = false
    if (sortMode.value === 'match') sortMode.value = 'newest'
  } catch (error: any) {
    jobs.value = []
    toast.error('Không thể tải việc làm', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
  }
}

async function loadJobs() {
  isLoading.value = true
  try {
    if (savedOnly.value) {
      await loadPublicJobs()
      return
    }
    if (authStore.isAuthenticated && authStore.canAccessStudentArea) {
      try {
        const response: any = await StudentService.getJobRecommendations(100)
        const items: ApiJobRecommendationItem[] = Array.isArray(response?.data?.items) ? response.data.items : []
        jobs.value = items.map(mapRecommendationForDisplay)
        isPersonalizedJobs.value = true
        sortMode.value = 'match'
        return
      } catch {
        // Giữ trang danh sách hoạt động bằng dữ liệu công khai khi API gợi ý tạm lỗi.
      }
    }
    await loadPublicJobs()
  } finally {
    isLoading.value = false
  }
}

async function loadStudentJobActions() {
  if (!authStore.isAuthenticated || !authStore.canAccessStudentArea) {
    appliedJobIds.value = new Set()
    favoriteJobIds.value = new Set()
    return
  }

  try {
    const response: any = await StudentService.getJobActions()
    const data = response?.data || {}
    appliedJobIds.value = new Set((data.applied_job_ids || []).map(Number))
    favoriteJobIds.value = new Set((data.favorite_job_ids || []).map(Number))
  } catch (error: any) {
    toast.error('Không thể tải trạng thái việc làm', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
  }
}

async function loadProfileCompletion() {
  profileCompletionLoaded.value = false
  if (!authStore.isAuthenticated || !authStore.canAccessStudentArea) {
    profileSnapshot.value = null
    profileCompletionLoaded.value = true
    return
  }

  try {
    const response: any = await StudentService.getProfile()
    const payload = response?.data ?? response ?? {}
    profileSnapshot.value = payload?.data ?? payload
  } catch {
    profileSnapshot.value = null
  } finally {
    profileCompletionLoaded.value = true
  }
}

async function toggleFavoriteJob(job: DisplayJob) {
  if (!requireStudentAction() || isFavoriteLoading(job)) return

  const wasFavorite = isFavoriteJob(job)
  updateJobSet(favoriteLoadingJobIds, job.id, true)
  updateJobSet(favoriteJobIds, job.id, !wasFavorite)

  try {
    if (wasFavorite) {
      await StudentService.removeFavoriteJob(job.id)
      job.favoriteCount = Math.max(0, job.favoriteCount - 1)
      toast.info('Đã bỏ yêu thích', `${job.title} đã được bỏ khỏi danh sách yêu thích.`, { groupKey: 'student-job-favorite-action' })
    } else {
      await StudentService.saveFavoriteJob(job.id)
      job.favoriteCount += 1
      toast.success('Đã lưu việc làm', `${job.title} đã được thêm vào danh sách yêu thích.`, { groupKey: 'student-job-favorite-action' })
    }
  } catch (error: any) {
    updateJobSet(favoriteJobIds, job.id, wasFavorite)
    toast.error('Không thể cập nhật yêu thích', error?.data?.message || error?.message || 'Vui lòng thử lại sau.', { groupKey: 'student-job-favorite-error' })
  } finally {
    updateJobSet(favoriteLoadingJobIds, job.id, false)
  }
}

async function applyToJob(job: DisplayJob) {
  if (!requireStudentAction()) return

  if (isAppliedJob(job)) {
    toast.info('Bạn đã ứng tuyển', 'Tin này đã nằm trong danh sách ứng tuyển của bạn.')
    return
  }

  if (isApplyingJob(job)) return

  updateJobSet(applyingJobIds, job.id, true)
  try {
    await StudentService.applyJob(job.id)
    job.applicationCount += 1
    updateJobSet(appliedJobIds, job.id, true)
    toast.success('Ứng tuyển thành công', `${job.title} đã được lưu vào danh sách ứng tuyển.`, { groupKey: 'student-job-apply-action' })
  } catch (error: any) {
    toast.error('Không thể ứng tuyển', error?.data?.message || error?.message || 'Vui lòng thử lại sau.', { groupKey: 'student-job-apply-error' })
  } finally {
    updateJobSet(applyingJobIds, job.id, false)
  }
}

async function loadPageData() {
  await Promise.all([loadJobs(), loadStudentJobActions(), loadProfileCompletion()])
}

onMounted(loadPageData)
</script>

<style scoped>
.quickwork-filter-options {
  scrollbar-color: #bae6fd transparent;
  scrollbar-width: thin;
}

.quickwork-filter-options::-webkit-scrollbar {
  width: 6px;
}

.quickwork-filter-options::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.quickwork-filter-options::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border-radius: 999px;
}

.job-result-card {
  isolation: isolate;
  overflow: hidden;
}

.job-result-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  content: '';
  opacity: 0;
  transition: opacity 180ms ease;
}

.job-result-card--busy::before {
  background: linear-gradient(180deg, #8b5cf6, #6366f1);
  opacity: 1;
}

.job-result-card--hot::after {
  position: absolute;
  top: -72px;
  right: -56px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, rgb(251 113 133 / 0.18), transparent 68%);
  content: '';
  pointer-events: none;
  z-index: -1;
}

.job-result-card--opportunity {
  background: linear-gradient(135deg, #fff 0%, #fff 72%, rgb(236 253 245 / 0.8) 100%);
}

.job-result-card--opportunity::before {
  background: linear-gradient(180deg, #10b981, #14b8a6);
  opacity: 1;
}

.job-signal-hot {
  animation: hot-pulse 2.4s ease-in-out infinite;
}

@keyframes hot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgb(244 63 94 / 0); }
  50% { box-shadow: 0 0 0 5px rgb(244 63 94 / 0.09); }
}

@media (prefers-reduced-motion: reduce) {
  .job-signal-hot { animation: none; }
}
</style>
