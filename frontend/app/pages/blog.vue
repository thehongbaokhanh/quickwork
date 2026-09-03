<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
    <HomeHeader @notify="notifyDevelopment" />

    <main>
      <section class="relative isolate overflow-hidden bg-[#071a39] text-white">
        <img src="/images/quickwork-career-hero.png" alt="Không gian học tập và định hướng nghề nghiệp" class="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-35">
        <div class="absolute inset-0 -z-10 bg-[#071a39]/80" aria-hidden="true" />
        <div class="mx-auto grid min-h-[300px] w-full max-w-[1320px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div class="max-w-xl">
            <span class="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-950/70 px-4 py-2 text-xs font-extrabold uppercase text-sky-100">
              <Icon name="uil:compass" class="h-4 w-4" aria-hidden="true" />
              Kho nội dung hướng dẫn nghề nghiệp
            </span>
            <h1 class="mt-5 text-3xl font-black leading-tight sm:text-4xl">Blog nghề nghiệp dành cho bạn</h1>
            <p class="mt-3 max-w-lg text-sm font-medium leading-7 text-slate-200 sm:text-base">Khám phá bài viết, hướng dẫn và lộ trình phát triển phù hợp với mục tiêu nghề nghiệp của bạn.</p>
          </div>

          <form class="rounded-lg border border-sky-300/50 bg-slate-950/55 p-5 shadow-xl backdrop-blur-sm sm:p-6" @submit.prevent="submitSearch">
            <div class="flex items-start gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-400/20 text-sky-100"><Icon name="uil:robot" class="h-6 w-6" aria-hidden="true" /></span>
              <div><h2 class="text-xl font-black">Gợi ý nội dung cho bạn</h2><p class="mt-1 text-xs font-medium leading-5 text-slate-300">Nhập công việc hoặc nhóm nghề bạn quan tâm để tìm bài viết phù hợp.</p></div>
            </div>
            <div class="mt-4 flex flex-col gap-2 sm:flex-row">
              <label class="sr-only" for="career-blog-search">Công việc hoặc nhóm nghề quan tâm</label>
              <input id="career-blog-search" v-model="query" class="h-12 min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20" placeholder="Ví dụ: Backend Developer, CV, phỏng vấn...">
              <button type="submit" class="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-extrabold text-white transition hover:bg-sky-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/30">
                <Icon name="uil:search" class="h-5 w-5" aria-hidden="true" />
                Tìm gợi ý
              </button>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span>Gợi ý phổ biến:</span>
              <button v-for="term in popularSearches" :key="term" type="button" class="rounded-full border border-white/25 px-3 py-1.5 font-bold text-white transition hover:border-sky-300 hover:bg-white/10" @click="applyPopularSearch(term)">{{ term }}</button>
            </div>
          </form>
        </div>
      </section>

      <section class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex w-full max-w-[1320px] gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          <button v-for="category in blogCategories" :key="category" type="button" :class="['inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100', activeCategory === category ? 'bg-sky-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700']" @click="selectCategory(category)"><Icon :name="category === 'Tất cả' ? 'uil:grid' : categoryMeta(category).icon" class="h-4 w-4" aria-hidden="true" />{{ category }}</button>
        </div>
      </section>

      <div ref="contentStart" class="mx-auto grid w-full max-w-[1320px] items-start gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
        <div class="min-w-0 space-y-10">
          <section v-if="!hasActiveFilter">
            <SectionHeading icon="uil:star" title="Bài viết nổi bật" subtitle="Nội dung được chọn lọc để bắt đầu hành trình nghề nghiệp." />
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <article v-for="article in featuredArticles" :key="article.slug" :class="['group grid overflow-hidden rounded-lg border bg-white transition sm:grid-cols-[42%_1fr]', isSaved(article.slug) ? 'border-sky-400 shadow-md ring-2 ring-sky-100' : 'border-slate-200 shadow-sm']">
                <div role="img" :aria-label="`Minh họa: ${article.title}`" :style="articleVisualStyle(article)" class="aspect-[4/3] h-full min-h-[180px] w-full bg-cover transition duration-300 group-hover:scale-[1.02]" />
                <div class="flex min-w-0 flex-col p-4">
                  <div class="flex min-w-0 items-center justify-between gap-2"><span class="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-extrabold text-sky-700"><Icon :name="categoryMeta(article.category).icon" class="h-4 w-4" aria-hidden="true" />{{ article.category }}</span><span class="truncate text-[10px] font-bold text-slate-400">{{ article.industry }}</span></div>
                  <h2 class="mt-2 clamp-2 text-base font-black leading-6 text-slate-950">{{ article.title }}</h2>
                  <p class="mt-2 clamp-2 text-xs font-medium leading-5 text-slate-500">{{ article.excerpt }}</p>
                  <ArticleActions class="mt-auto pt-4" :article="article" :saved="isSaved(article.slug)" @read="openArticle(article)" @save="toggleSaved(article.slug)" />
                </div>
              </article>
            </div>
          </section>

          <section v-if="!hasActiveFilter">
            <SectionHeading icon="uil:robot" title="Gợi ý theo mục tiêu của bạn" subtitle="Nội dung đa ngành hữu ích cho hồ sơ và quá trình tìm việc." />
            <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article v-for="article in recommendedArticles" :key="article.slug" :class="['flex min-h-[310px] flex-col overflow-hidden rounded-lg border bg-white transition', isSaved(article.slug) ? 'border-sky-400 shadow-md ring-2 ring-sky-100' : 'border-slate-200 shadow-sm']">
                <div role="img" :aria-label="`Minh họa: ${article.title}`" :style="articleVisualStyle(article)" class="aspect-[4/3] w-full bg-cover" />
                <div class="flex flex-1 flex-col p-4">
                  <div class="flex min-w-0 items-center justify-between gap-2"><span class="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold text-violet-700"><Icon :name="categoryMeta(article.category).icon" class="h-4 w-4" aria-hidden="true" />{{ article.category }}</span><span class="truncate text-[9px] font-bold text-slate-400">{{ article.industry }}</span></div>
                  <h3 class="mt-2 clamp-3 text-sm font-black leading-5 text-slate-950">{{ article.title }}</h3>
                  <ArticleActions class="mt-auto pt-4" compact :article="article" :saved="isSaved(article.slug)" @read="openArticle(article)" @save="toggleSaved(article.slug)" />
                </div>
              </article>
            </div>
          </section>

          <section>
            <SectionHeading :icon="hasActiveFilter ? 'uil:search' : 'uil:grid'" :title="hasActiveFilter ? 'Kết quả phù hợp' : 'Khám phá theo chủ đề'" :subtitle="resultSummary" />
            <div v-if="filteredArticles.length" class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article v-for="article in filteredArticles" :key="`discover-${article.slug}`" :class="['flex min-h-[340px] flex-col overflow-hidden rounded-lg border bg-white transition hover:-translate-y-0.5 hover:shadow-md', isSaved(article.slug) ? 'border-sky-400 shadow-md ring-2 ring-sky-100' : 'border-slate-200 shadow-sm']">
                <div role="img" :aria-label="`Minh họa: ${article.title}`" :style="articleVisualStyle(article)" class="aspect-[4/3] w-full bg-cover" />
                <div class="flex flex-1 flex-col p-4">
                  <div class="flex min-w-0 items-center justify-between gap-2"><span class="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold text-sky-700"><Icon :name="categoryMeta(article.category).icon" class="h-4 w-4" aria-hidden="true" />{{ article.category }}</span><span class="truncate text-[9px] font-bold text-slate-400">{{ article.industry }}</span></div>
                  <h3 class="mt-2 clamp-2 text-base font-black leading-6 text-slate-950">{{ article.title }}</h3>
                  <p class="mt-2 clamp-2 text-xs font-medium leading-5 text-slate-500">{{ article.excerpt }}</p>
                  <ArticleActions class="mt-auto pt-4" :article="article" :saved="isSaved(article.slug)" @read="openArticle(article)" @save="toggleSaved(article.slug)" />
                </div>
              </article>
            </div>
            <div v-else class="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <Icon name="uil:search" class="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <h3 class="mt-3 text-base font-black text-slate-800">Chưa có bài viết phù hợp</h3>
              <p class="mt-1 text-sm text-slate-500">Hãy thử từ khóa ngắn hơn hoặc chọn lại tất cả chủ đề.</p>
              <button type="button" class="mt-4 text-sm font-extrabold text-sky-700 hover:text-sky-900" @click="clearFilters">Xóa bộ lọc</button>
            </div>
          </section>
        </div>

        <aside class="space-y-5 lg:sticky lg:top-[94px]">
          <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="flex items-center gap-2 text-base font-black text-slate-950"><Icon name="uil:fire" class="h-5 w-5 text-rose-500" aria-hidden="true" />Xu hướng tìm kiếm</h2>
            <div class="mt-4 flex flex-wrap gap-2"><button v-for="term in trendingSearches" :key="term" type="button" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-sky-200 hover:text-sky-700" @click="applyPopularSearch(term)">{{ term }}</button></div>
          </section>

          <section :class="['rounded-lg border bg-white p-5 shadow-sm transition', savedArticles.length ? 'border-sky-200 ring-2 ring-sky-50' : 'border-slate-200']">
            <div class="flex items-center justify-between gap-3"><h2 class="flex items-center gap-2 text-base font-black text-slate-950"><Icon name="uil:bookmark" class="h-5 w-5 text-sky-600" aria-hidden="true" />Bài đã lưu</h2><span class="text-xs font-extrabold text-sky-700">{{ savedArticles.length }}</span></div>
            <div v-if="savedArticles.length" class="mt-3 divide-y divide-slate-100">
              <button v-for="article in savedArticles.slice(0, 3)" :key="`saved-${article.slug}`" type="button" class="-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-sky-50" @click="openArticle(article)"><span role="img" :aria-label="`Minh họa: ${article.title}`" :style="articleVisualStyle(article)" class="h-14 w-[74px] shrink-0 rounded bg-cover" /><span class="min-w-0"><strong class="clamp-2 text-xs font-black leading-5 text-sky-900">{{ article.title }}</strong><small class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-sky-600"><Icon name="uil:bookmark-full" class="h-3.5 w-3.5" />Đã lưu · {{ article.readMinutes }} phút đọc</small></span></button>
            </div>
            <p v-else class="mt-3 text-xs font-medium leading-5 text-slate-500">Dùng biểu tượng lưu trên bài viết để tạo danh sách đọc sau.</p>
          </section>

          <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h2 class="flex items-center gap-2 text-base font-black text-slate-950"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Icon name="uil:rocket" class="h-5 w-5" aria-hidden="true" /></span>Lộ trình nhanh</h2>
              <p class="mt-2 text-[11px] font-medium leading-5 text-slate-500">Bốn bước tập trung để biến kiến thức thành hành động tìm việc.</p>
            </div>
            <ol class="relative px-5 py-5">
              <span class="absolute bottom-8 left-[34px] top-8 w-px bg-sky-200" aria-hidden="true" />
              <li v-for="(step, index) in roadmap" :key="step.title" class="relative flex gap-3 pb-5 last:pb-0">
                <span :class="['relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black', index === 0 ? 'border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-200' : 'border-sky-200 bg-white text-sky-700']">{{ index + 1 }}</span>
                <span class="min-w-0 pt-0.5"><small class="block text-[9px] font-black uppercase text-sky-600">Bước {{ String(index + 1).padStart(2, '0') }}</small><strong class="mt-0.5 block text-xs font-black text-slate-900">{{ step.title }}</strong><small class="mt-1 block text-[11px] font-medium leading-4 text-slate-500">{{ step.description }}</small></span>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </main>

    <HomeFooter @notify="notifyDevelopment" />

    <Teleport to="body">
      <div v-if="selectedArticle" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="blog-dialog-title" @mousedown.self="closeArticle">
        <section class="flex max-h-[94vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <header class="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
            <div class="flex min-w-0 items-center gap-3">
              <span :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', categoryMeta(selectedArticle.category).iconClass]"><Icon :name="categoryMeta(selectedArticle.category).icon" class="h-5 w-5" aria-hidden="true" /></span>
              <div class="min-w-0"><span class="block text-[10px] font-black uppercase text-sky-700">QuickWork Career Guide</span><strong class="block truncate text-sm text-slate-900">{{ selectedArticle.category }}</strong></div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <button type="button" :class="['flex h-10 w-10 items-center justify-center rounded-lg border transition', isSaved(selectedArticle.slug) ? 'border-sky-600 bg-sky-600 text-white shadow-sm' : 'border-slate-200 text-slate-500 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700']" :aria-label="isSaved(selectedArticle.slug) ? 'Bỏ lưu bài viết' : 'Lưu bài viết'" @click="toggleSaved(selectedArticle.slug)"><Icon :name="isSaved(selectedArticle.slug) ? 'uil:bookmark-full' : 'uil:bookmark'" class="h-5 w-5" /></button>
              <button type="button" class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" aria-label="Đóng bài viết" @click="closeArticle"><Icon name="uil:times" class="h-5 w-5" /></button>
            </div>
          </header>

          <div class="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_370px] lg:overflow-hidden">
            <article class="min-w-0 lg:overflow-y-auto">
              <div role="img" :aria-label="`Minh họa: ${selectedArticle.title}`" :style="articleVisualStyle(selectedArticle, true)" class="aspect-[16/7] w-full bg-cover" />
              <div class="px-5 py-6 sm:px-8 sm:py-8">
                <div class="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400"><span class="inline-flex items-center gap-1.5"><Icon name="uil:calendar-alt" class="h-4 w-4" />{{ selectedArticle.date }}</span><span class="inline-flex items-center gap-1.5"><Icon name="uil:clock" class="h-4 w-4" />{{ selectedArticle.readMinutes }} phút đọc</span></div>
                <h2 id="blog-dialog-title" class="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{{ selectedArticle.title }}</h2>
                <p class="mt-4 border-l-4 border-sky-500 pl-4 text-sm font-semibold leading-7 text-slate-600">{{ selectedArticle.excerpt }}</p>

                <div class="mt-8 flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon name="uil:lightbulb-alt" class="h-5 w-5" /></span>
                  <div><h3 class="text-base font-black text-slate-900">Điểm cần nhớ</h3><p class="text-xs font-medium text-slate-500">Các ý chính có thể áp dụng ngay sau khi đọc.</p></div>
                </div>
                <ol class="mt-5 space-y-4">
                  <li v-for="(point, index) in selectedArticle.highlights" :key="point" class="flex gap-3 text-sm font-medium leading-6 text-slate-600"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-black text-sky-700">{{ index + 1 }}</span><span>{{ point }}</span></li>
                </ol>

                <div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <p class="text-xs font-medium text-slate-500">Lưu bài viết để quay lại khi chuẩn bị hồ sơ hoặc phỏng vấn.</p>
                  <button type="button" class="inline-flex h-10 items-center gap-2 rounded-lg bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:bg-sky-100" @click="toggleSaved(selectedArticle.slug)"><Icon :name="isSaved(selectedArticle.slug) ? 'uil:bookmark-full' : 'uil:bookmark'" class="h-5 w-5" />{{ isSaved(selectedArticle.slug) ? 'Đã lưu bài' : 'Lưu để đọc lại' }}</button>
                </div>
              </div>
            </article>

            <aside class="border-t border-slate-200 bg-slate-50 lg:overflow-y-auto lg:border-l lg:border-t-0">
              <div class="bg-[#0b2347] px-5 py-6 text-white sm:px-6">
                <div class="flex items-start gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white"><Icon name="uil:robot" class="h-6 w-6" /></span><div><span class="text-[10px] font-black uppercase text-sky-300">Cá nhân hóa theo mục tiêu</span><h3 class="mt-1 text-lg font-black">Trợ lý định hướng AI</h3></div></div>
                <p class="mt-3 text-xs font-medium leading-5 text-slate-300">Đặt mục tiêu cụ thể để nhận hướng đi, kỹ năng ưu tiên và các bước tiếp theo từ nội dung đang đọc.</p>
              </div>

              <div class="p-5 sm:p-6">
                <template v-if="canUseCareerAI">
                  <label for="career-guidance-goal" class="text-xs font-black text-slate-800">Bạn đang muốn đạt mục tiêu gì?</label>
                  <textarea id="career-guidance-goal" v-model.trim="careerGoal" maxlength="600" rows="4" class="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="Ví dụ: Tôi là sinh viên năm cuối, muốn ứng tuyển Backend Intern trong 2 tháng tới..." />
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button v-for="prompt in careerPrompts" :key="prompt" type="button" class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition hover:border-sky-300 hover:text-sky-700" @click="careerGoal = prompt">{{ prompt }}</button>
                  </div>
                  <button type="button" :disabled="aiLoading" class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:bg-sky-300" @click="requestCareerGuidance">
                    <Icon :name="aiLoading ? 'uil:spinner-alt' : 'uil:robot'" :class="['h-5 w-5', { 'animate-spin': aiLoading }]" />
                    {{ aiLoading ? 'Đang phân tích mục tiêu...' : 'Nhận gợi ý bằng AI' }}
                  </button>
                </template>
                <div v-else class="py-2 text-center">
                  <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700"><Icon name="uil:lock" class="h-6 w-6" /></span>
                  <h4 class="mt-3 text-sm font-black text-slate-900">Dành cho tài khoản sinh viên</h4>
                  <p class="mt-2 text-xs font-medium leading-5 text-slate-500">Đăng nhập tài khoản sinh viên để sử dụng trợ lý AI và bảo vệ hạn mức hệ thống.</p>
                  <NuxtLink to="/auth/login?redirect=/blog" class="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-black text-white hover:bg-sky-700"><Icon name="uil:sign-in-alt" class="h-5 w-5" />Đăng nhập</NuxtLink>
                </div>

                <p v-if="aiError" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold leading-5 text-amber-800" role="alert">{{ aiError }}</p>

                <div v-if="aiResult" class="mt-6" aria-live="polite">
                  <div class="border-b border-slate-200 pb-5"><span class="text-[10px] font-black uppercase text-sky-700">Định hướng đề xuất</span><p class="mt-2 text-sm font-semibold leading-6 text-slate-700">{{ aiResult.direction }}</p></div>
                  <div class="border-b border-slate-200 py-5"><h4 class="flex items-center gap-2 text-xs font-black text-slate-900"><Icon name="uil:check-circle" class="h-5 w-5 text-emerald-600" />Các bước tiếp theo</h4><ol class="mt-3 space-y-3"><li v-for="(step, index) in aiResult.next_steps" :key="step" class="flex gap-2 text-xs font-medium leading-5 text-slate-600"><span class="font-black text-sky-700">{{ index + 1 }}.</span>{{ step }}</li></ol></div>
                  <div class="border-b border-slate-200 py-5"><h4 class="flex items-center gap-2 text-xs font-black text-slate-900"><Icon name="uil:bolt-alt" class="h-5 w-5 text-violet-600" />Kỹ năng ưu tiên</h4><div class="mt-3 flex flex-wrap gap-2"><span v-for="skill in aiResult.priority_skills" :key="skill" class="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-violet-700">{{ skill }}</span></div></div>
                  <div class="py-5"><h4 class="flex items-center gap-2 text-xs font-black text-slate-900"><Icon name="uil:books" class="h-5 w-5 text-sky-600" />Nên tìm hiểu thêm</h4><ul class="mt-3 space-y-2"><li v-for="topic in aiResult.related_topics" :key="topic" class="text-xs font-semibold text-slate-600">{{ topic }}</li></ul></div>
                  <p class="border-t border-slate-200 pt-4 text-[10px] font-medium leading-4 text-slate-400">{{ aiResult.disclaimer }}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, onUnmounted, ref, resolveComponent, watch } from 'vue'
import { blogArticles, blogCategories, type BlogArticle } from '~/data/blogArticles'
import { useToast } from '~/composables/useToast'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'

type CareerGuidanceResult = {
  direction: string
  next_steps: string[]
  priority_skills: string[]
  related_topics: string[]
  disclaimer: string
  ai_used: boolean
}

definePageMeta({ layout: false })
useHead({ title: 'Blog nghề nghiệp' })

const toast = useToast()
const authStore = useAuthStore()
const query = ref('')
const activeCategory = ref('Tất cả')
const savedSlugs = ref<string[]>([])
const selectedArticle = ref<BlogArticle | null>(null)
const careerGoal = ref('')
const aiLoading = ref(false)
const aiError = ref('')
const aiResult = ref<CareerGuidanceResult | null>(null)
let aiRequestVersion = 0
const contentStart = ref<HTMLElement | null>(null)
const savedStorageKey = 'quickwork:student-blog-saved'
const popularSearches = ['CV cho Fresher', 'Phỏng vấn Sales', 'Thực tập Nhân sự']
const trendingSearches = ['Marketing', 'Kế toán', 'Logistics', 'Sales', 'Internship']
const roadmap = [
  { title: 'Chọn mục tiêu', description: 'Xác định nhóm nghề bạn muốn theo đuổi.' },
  { title: 'Đọc bài phù hợp', description: 'Lọc nội dung theo vấn đề đang cần giải quyết.' },
  { title: 'Tối ưu CV', description: 'Áp dụng kiến thức vào hồ sơ cá nhân.' },
  { title: 'Luyện phỏng vấn', description: 'Chuẩn bị ví dụ và cách trình bày rõ ràng.' }
]

const hasActiveFilter = computed(() => activeCategory.value !== 'Tất cả' || Boolean(query.value.trim()))
const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase('vi-VN'))
const filteredArticles = computed(() => blogArticles.filter((article) => {
  const categoryMatches = activeCategory.value === 'Tất cả' || article.category === activeCategory.value
  const searchable = `${article.title} ${article.excerpt} ${article.category} ${article.industry} ${article.highlights.join(' ')} ${(article.keywords || []).join(' ')}`.toLocaleLowerCase('vi-VN')
  const queryTerms = normalizedQuery.value.split(/\s+/).filter(Boolean)
  return categoryMatches && queryTerms.every(term => searchable.includes(term))
}))
const featuredArticles = computed(() => blogArticles.filter(article => article.featured).slice(0, 2))
const recommendedArticles = computed(() => blogArticles.filter(article => article.recommended).slice(0, 4))
const savedArticles = computed(() => savedSlugs.value.map(slug => blogArticles.find(article => article.slug === slug)).filter((article): article is BlogArticle => Boolean(article)))
const resultSummary = computed(() => hasActiveFilter.value ? `${filteredArticles.value.length} bài viết phù hợp với lựa chọn hiện tại.` : 'Tổng hợp nội dung theo từng giai đoạn phát triển nghề nghiệp.')
const canUseCareerAI = computed(() => authStore.isAuthenticated && authStore.userRole === 'STUDENT')
const careerPrompts = computed(() => [
  'Tôi nên bắt đầu áp dụng nội dung này từ đâu?',
  'Hãy lập kế hoạch hành động trong 30 ngày.',
  `Kỹ năng nào cần ưu tiên cho chủ đề ${selectedArticle.value?.category || 'này'}?`
])

const categoryPresentation: Record<string, { icon: string, iconClass: string }> = {
  'Tìm việc': { icon: 'uil:search-alt', iconClass: 'bg-sky-50 text-sky-700' },
  'CV & Hồ sơ': { icon: 'uil:file-check-alt', iconClass: 'bg-violet-50 text-violet-700' },
  'Phỏng vấn': { icon: 'uil:comments-alt', iconClass: 'bg-orange-50 text-orange-700' },
  'Kỹ năng nghề nghiệp': { icon: 'uil:bolt-alt', iconClass: 'bg-emerald-50 text-emerald-700' },
  'Định hướng nghề nghiệp': { icon: 'uil:compass', iconClass: 'bg-rose-50 text-rose-700' },
  'Thị trường việc làm': { icon: 'uil:chart-growth', iconClass: 'bg-amber-50 text-amber-700' },
  'Góc sinh viên': { icon: 'uil:graduation-cap', iconClass: 'bg-cyan-50 text-cyan-700' }
}

const SectionHeading = defineComponent({
  props: { icon: { type: String, required: true }, title: { type: String, required: true }, subtitle: { type: String, required: true } },
  setup(props) { return () => h('div', { class: 'flex items-start gap-3' }, [h('span', { class: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700' }, [h(resolveComponent('Icon') as any, { name: props.icon, class: 'h-5 w-5' })]), h('div', [h('h2', { class: 'text-xl font-black text-slate-950' }, props.title), h('p', { class: 'mt-1 text-xs font-medium text-slate-500' }, props.subtitle)])]) }
})

const ArticleActions = defineComponent({
  props: { article: { type: Object as () => BlogArticle, required: true }, saved: Boolean, compact: Boolean },
  emits: ['read', 'save'],
  setup(props, { emit }) { return () => h('div', { class: 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-[11px]' }, [h('span', { class: 'inline-flex min-w-0 items-center gap-1 whitespace-nowrap font-semibold text-slate-400' }, [h(resolveComponent('Icon') as any, { name: 'uil:clock', class: 'h-3.5 w-3.5 shrink-0' }), `${props.article.readMinutes} phút đọc`]), h('span', { class: 'flex shrink-0 items-center gap-1' }, [h('button', { type: 'button', class: props.saved ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm transition hover:bg-sky-700' : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700', 'aria-label': props.saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết', title: props.saved ? 'Đã lưu - bấm để bỏ lưu' : 'Lưu bài viết', onClick: () => emit('save') }, [h(resolveComponent('Icon') as any, { name: props.saved ? 'uil:bookmark-full' : 'uil:bookmark', class: 'h-4 w-4' })]), h('button', { type: 'button', class: 'inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 font-extrabold text-sky-700 transition hover:bg-sky-50', onClick: () => emit('read') }, ['Đọc ngay', h(resolveComponent('Icon') as any, { name: 'uil:arrow-right', class: 'h-4 w-4 shrink-0' })])])]) }
})

function categoryMeta(category: string) {
  return categoryPresentation[category] || { icon: 'uil:book-open', iconClass: 'bg-slate-100 text-slate-700' }
}
function articleVisualStyle(article: BlogArticle, wide = false) {
  const [horizontal = '50%', vertical = '50%'] = article.imagePosition.split(' ')
  const wideVertical = vertical === '0%' ? '15%' : vertical === '100%' ? '85%' : vertical
  return {
    backgroundImage: `url("${article.image}")`,
    backgroundPosition: `${horizontal} ${wide ? wideVertical : vertical}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: wide ? '300% auto' : '300% 200%',
    backgroundColor: '#e0f2fe'
  }
}

function selectCategory(category: string) {
  activeCategory.value = category
}
function submitSearch() {
  if (!query.value.trim()) { toast.info('Nhập mục tiêu nghề nghiệp', 'Ví dụ: Backend, CV Fresher hoặc phỏng vấn Intern.'); return }
  activeCategory.value = 'Tất cả'
  contentStart.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function applyPopularSearch(term: string) { query.value = term; submitSearch() }
function clearFilters() { query.value = ''; activeCategory.value = 'Tất cả' }
function openArticle(article: BlogArticle) {
  aiRequestVersion += 1
  selectedArticle.value = article
  careerGoal.value = ''
  aiLoading.value = false
  aiError.value = ''
  aiResult.value = null
}
function closeArticle() {
  aiRequestVersion += 1
  selectedArticle.value = null
  aiLoading.value = false
  aiError.value = ''
  aiResult.value = null
}
function isSaved(slug: string) { return savedSlugs.value.includes(slug) }
function toggleSaved(slug: string) {
  savedSlugs.value = isSaved(slug) ? savedSlugs.value.filter(item => item !== slug) : [slug, ...savedSlugs.value]
  localStorage.setItem(savedStorageKey, JSON.stringify(savedSlugs.value))
}
function notifyDevelopment(feature: string) { toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`) }
async function requestCareerGuidance() {
  const article = selectedArticle.value
  if (!article || aiLoading.value) return
  if (!canUseCareerAI.value) {
    aiError.value = 'Vui lòng đăng nhập bằng tài khoản sinh viên để sử dụng trợ lý AI.'
    return
  }
  if (careerGoal.value.trim().length < 10) {
    aiError.value = 'Hãy mô tả mục tiêu cụ thể hơn để AI đưa ra gợi ý hữu ích.'
    return
  }

  aiLoading.value = true
  const requestVersion = ++aiRequestVersion
  aiError.value = ''
  aiResult.value = null
  try {
    const response: any = await StudentService.getCareerGuidance({
      goal: careerGoal.value.trim(),
      article_title: article.title,
      article_category: article.category,
      article_excerpt: article.excerpt,
      article_highlights: article.highlights
    })
    const result = response?.data || response
    if (requestVersion !== aiRequestVersion) return
    if (!result?.ai_used || !result?.direction) throw new Error('Trợ lý AI không trả về nội dung hợp lệ.')
    aiResult.value = result as CareerGuidanceResult
  } catch (error: any) {
    if (requestVersion !== aiRequestVersion) return
    aiError.value = error?.data?.message || error?.response?.data?.message || error?.message || 'Không thể nhận gợi ý AI lúc này.'
  } finally {
    if (requestVersion === aiRequestVersion) aiLoading.value = false
  }
}
function handleKeydown(event: KeyboardEvent) { if (event.key === 'Escape') closeArticle() }

watch(selectedArticle, (article) => {
  if (!import.meta.client) return
  document.body.style.overflow = article ? 'hidden' : ''
})

onMounted(() => {
  try { const saved = JSON.parse(localStorage.getItem(savedStorageKey) || '[]'); savedSlugs.value = Array.isArray(saved) ? saved.filter(slug => typeof slug === 'string') : [] } catch { savedSlugs.value = [] }
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.clamp-2,
.clamp-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.clamp-2 { -webkit-line-clamp: 2; }
.clamp-3 { -webkit-line-clamp: 3; }
</style>
