<template>
  <div class="space-y-5 pb-8 text-slate-900">
    <section
      v-if="settingsView === 'settings'"
      class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">
          <Icon name="uil:setting" class="h-4 w-4" />
          Trung tâm cài đặt
        </span>
        <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Cài đặt</h1>
        <p class="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
          Quản lý tài khoản, thông tin công ty và tùy chỉnh hoạt động tuyển dụng của tài khoản nhà tuyển dụng.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-4 text-sm font-bold text-sky-700 shadow-sm transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        @click="showDevelopingToast('Trung tâm trợ giúp')"
      >
        <Icon name="uil:question-circle" class="h-5 w-5" />
        Trung tâm trợ giúp
      </button>
    </section>

    <section
      v-if="settingsView === 'settings'"
      class="overflow-x-auto border-b border-slate-200"
      aria-label="Nhóm cài đặt nhà tuyển dụng"
    >
      <div class="flex min-w-max items-center gap-2">
        <button
          v-for="tab in settingTabs"
          :key="tab.key"
          type="button"
          :aria-pressed="activeTab === tab.key"
          :class="[
            'inline-flex h-12 items-center gap-2 border-b-2 px-4 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
            activeTab === tab.key
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:border-sky-100 hover:text-slate-950'
          ]"
          @click="activeTab = tab.key"
        >
          <Icon :name="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </div>
    </section>

    <section
      v-if="settingsView === 'password'"
      class="space-y-5"
    >
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        @click="closePasswordPanel"
      >
        <Icon name="uil:arrow-left" class="h-5 w-5" />
        Quay lại cài đặt
      </button>

      <div class="flex items-center gap-4">
        <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
          <Icon name="uil:lock" class="h-8 w-8" />
        </span>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-950">Đổi mật khẩu</h1>
          <p class="mt-2 text-sm font-medium leading-6 text-slate-500">
            Cập nhật mật khẩu để bảo vệ tài khoản nhà tuyển dụng của bạn.
          </p>
        </div>
      </div>

      <section class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <form
          class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80"
          @submit.prevent="handleChangePassword"
        >
          <div class="space-y-5">
            <label class="block">
              <span class="text-sm font-bold text-slate-900">Mật khẩu hiện tại</span>
              <div
                :class="[
                  'mt-2 flex h-[52px] items-center rounded-2xl border bg-white transition focus-within:ring-4',
                  passwordErrors.current_password
                    ? 'border-rose-300 focus-within:ring-rose-50'
                    : 'border-slate-200 focus-within:border-sky-400 focus-within:ring-sky-50'
                ]"
              >
                <input
                  v-model="passwordForm.current_password"
                  :type="passwordVisibility.current ? 'text' : 'password'"
                  class="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Nhập mật khẩu hiện tại"
                  autocomplete="current-password"
                >
                <button
                  type="button"
                  class="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  :aria-label="passwordVisibility.current ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'"
                  @click="togglePasswordVisibility('current')"
                >
                  <Icon :name="passwordVisibility.current ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                </button>
              </div>
              <p
                v-if="passwordErrors.current_password"
                class="mt-2 text-sm font-semibold text-rose-600"
              >
                {{ passwordErrors.current_password }}
              </p>
            </label>

            <label class="block">
              <span class="text-sm font-bold text-slate-900">Mật khẩu mới</span>
              <div
                :class="[
                  'mt-2 flex h-[52px] items-center rounded-2xl border bg-white transition focus-within:ring-4',
                  passwordErrors.new_password
                    ? 'border-rose-300 focus-within:ring-rose-50'
                    : 'border-slate-200 focus-within:border-sky-400 focus-within:ring-sky-50'
                ]"
              >
                <input
                  v-model="passwordForm.new_password"
                  :type="passwordVisibility.next ? 'text' : 'password'"
                  class="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Nhập mật khẩu mới"
                  autocomplete="new-password"
                >
                <button
                  type="button"
                  class="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  :aria-label="passwordVisibility.next ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'"
                  @click="togglePasswordVisibility('next')"
                >
                  <Icon :name="passwordVisibility.next ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                </button>
              </div>
              <p
                v-if="passwordErrors.new_password"
                class="mt-2 text-sm font-semibold text-rose-600"
              >
                {{ passwordErrors.new_password }}
              </p>
            </label>

            <div>
              <div class="flex items-center gap-2 text-sm font-bold text-slate-700">
                <span>Độ mạnh mật khẩu:</span>
                <span :class="passwordStrengthMeta.textClass">{{ passwordStrengthMeta.label }}</span>
              </div>
              <div class="mt-3 grid grid-cols-4 gap-2">
                <span
                  v-for="segment in 4"
                  :key="segment"
                  :class="[
                    'h-1.5 rounded-full transition',
                    segment <= passwordStrengthScore ? passwordStrengthMeta.barClass : 'bg-slate-200'
                  ]"
                />
              </div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div
                  v-for="rule in passwordRules"
                  :key="rule.label"
                  :class="[
                    'flex items-center gap-2 text-sm font-semibold',
                    rule.valid ? 'text-emerald-600' : 'text-slate-400'
                  ]"
                >
                  <Icon :name="rule.valid ? 'uil:check-circle' : 'uil:info-circle'" class="h-4 w-4" />
                  {{ rule.label }}
                </div>
              </div>
            </div>

            <label class="block">
              <span class="text-sm font-bold text-slate-900">Xác nhận mật khẩu mới</span>
              <div
                :class="[
                  'mt-2 flex h-[52px] items-center rounded-2xl border bg-white transition focus-within:ring-4',
                  passwordErrors.confirm_password
                    ? 'border-rose-300 focus-within:ring-rose-50'
                    : 'border-slate-200 focus-within:border-sky-400 focus-within:ring-sky-50'
                ]"
              >
                <input
                  v-model="passwordForm.confirm_password"
                  :type="passwordVisibility.confirm ? 'text' : 'password'"
                  class="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Nhập lại mật khẩu mới"
                  autocomplete="new-password"
                >
                <button
                  type="button"
                  class="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  :aria-label="passwordVisibility.confirm ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'"
                  @click="togglePasswordVisibility('confirm')"
                >
                  <Icon :name="passwordVisibility.confirm ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                </button>
              </div>
              <p
                v-if="passwordErrors.confirm_password"
                class="mt-2 text-sm font-semibold text-rose-600"
              >
                {{ passwordErrors.confirm_password }}
              </p>
            </label>
          </div>

          <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
              @click="closePasswordPanel"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="passwordSubmitting"
            >
              <Icon
                :name="passwordSubmitting ? 'svg-spinners:180-ring' : 'uil:lock'"
                :class="['h-5 w-5', passwordSubmitting ? 'animate-spin' : '']"
              />
              {{ passwordSubmitting ? 'Đang đổi mật khẩu' : 'Đổi mật khẩu' }}
            </button>
          </div>
        </form>

        <aside class="space-y-5">
          <article class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
            <div class="flex items-center gap-3">
              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Icon name="uil:shield-check" class="h-6 w-6" />
              </span>
              <h2 class="text-lg font-extrabold text-slate-950">Mẹo bảo mật</h2>
            </div>

            <div class="mt-5 space-y-4">
              <div
                v-for="tip in securityTips"
                :key="tip.title"
                class="flex items-start gap-3"
              >
                <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon :name="tip.icon" class="h-5 w-5" />
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-950">{{ tip.title }}</p>
                  <p class="mt-1 text-sm font-medium leading-6 text-slate-500">{{ tip.description }}</p>
                </div>
              </div>
            </div>
          </article>

          <article class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
            <div class="flex items-center gap-3">
              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Icon name="uil:calendar-alt" class="h-6 w-6" />
              </span>
              <h2 class="text-lg font-extrabold text-slate-950">Lần đổi mật khẩu gần nhất</h2>
            </div>
            <div class="mt-5 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
              {{ lastPasswordChangedAt }}
            </div>
          </article>
        </aside>
      </section>
    </section>

    <section
      v-else-if="activeTab === 'account'"
      class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]"
    >
      <div class="min-w-0 space-y-5">
        <form
          class="overflow-visible rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80"
          @submit.prevent="handleSave"
        >
          <div class="rounded-t-[24px] border-b border-slate-100 bg-white px-5 py-4">
            <div class="flex items-center gap-4">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Icon name="uil:user-square" class="h-5 w-5" />
              </span>
              <div>
                <h2 class="text-lg font-extrabold text-slate-950">Thông tin tài khoản</h2>
                <p class="mt-1 text-sm font-medium text-slate-500">Dữ liệu nhận diện lấy từ phiên đăng nhập hiện tại.</p>
              </div>
            </div>
          </div>

          <div
            v-if="profileSaveMessage"
            class="mx-5 mt-4 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold leading-6 text-sky-800"
            role="status"
            aria-live="polite"
          >
            <Icon name="uil:check-circle" class="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
            <span>{{ profileSaveMessage }}</span>
          </div>

          <div class="grid gap-4 p-5 lg:grid-cols-2">
            <label class="space-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Tên hiển thị</span>
              <input
                v-model="accountForm.displayName"
                type="text"
                class="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                placeholder="Tên công ty hoặc người quản lý"
              >
            </label>

            <label class="space-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Mật khẩu</span>
              <div class="flex gap-2">
                <input
                  type="password"
                  value="quickwork-password"
                  class="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500 outline-none"
                  aria-label="Mật khẩu hiện tại được ẩn"
                  disabled
                >
                <button
                  type="button"
                  class="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 px-4 text-sm font-bold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  @click="openPasswordPanel"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </label>

            <label class="space-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Email</span>
              <input
                v-model="accountForm.email"
                type="email"
                class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500 outline-none"
                disabled
              >
            </label>

            <label class="space-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Vai trò</span>
              <input
                v-model="accountForm.role"
                type="text"
                class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500 outline-none"
                disabled
              >
            </label>

            <label class="space-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Số điện thoại</span>
              <input
                v-model="accountForm.phone"
                type="tel"
                class="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                placeholder="Chưa cập nhật"
              >
            </label>

            <div
              ref="timezoneDropdownRef"
              class="relative space-y-1.5"
            >
              <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Múi giờ</span>
              <button
                type="button"
                class="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-900 outline-none transition hover:border-sky-200 focus:border-sky-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-50"
                aria-haspopup="listbox"
                :aria-expanded="isTimezoneOpen"
                @click.stop="toggleTimezoneDropdown"
              >
                <span class="truncate">{{ selectedTimezoneLabel }}</span>
                <Icon
                  name="uil:angle-down"
                  :class="[
                    'h-5 w-5 shrink-0 text-slate-400 transition',
                    isTimezoneOpen ? 'rotate-180 text-sky-600' : ''
                  ]"
                />
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <div
                  v-if="isTimezoneOpen"
                  class="quickwork-settings-scroll absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-sky-100 bg-white p-1 shadow-2xl shadow-slate-200/80"
                  role="listbox"
                >
                  <button
                    v-for="zone in timezoneSelectOptions"
                    :key="zone.value"
                    type="button"
                    role="option"
                    :aria-selected="accountForm.timezone === zone.value"
                    :class="[
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                      accountForm.timezone === zone.value
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    ]"
                    @click="selectTimezone(zone.value)"
                  >
                    <span class="min-w-0">
                      <span class="block truncate text-sm font-bold">{{ zone.label }}</span>
                      <span class="mt-0.5 block text-xs font-semibold text-slate-500">{{ zone.offset }}</span>
                    </span>
                    <Icon
                      v-if="accountForm.timezone === zone.value"
                      name="uil:check"
                      class="h-5 w-5 shrink-0 text-sky-600"
                    />
                  </button>
                </div>
              </Transition>
            </div>

            <div
              ref="languageDropdownRef"
              class="relative space-y-1.5"
            >
              <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Ngôn ngữ</span>
              <button
                type="button"
                class="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-900 outline-none transition hover:border-sky-200 focus:border-sky-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-50"
                aria-haspopup="listbox"
                :aria-expanded="isLanguageOpen"
                @click.stop="toggleLanguageDropdown"
              >
                <span class="truncate">{{ selectedLanguageLabel }}</span>
                <Icon
                  name="uil:angle-down"
                  :class="[
                    'h-5 w-5 shrink-0 text-slate-400 transition',
                    isLanguageOpen ? 'rotate-180 text-sky-600' : ''
                  ]"
                />
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <div
                  v-if="isLanguageOpen"
                  class="quickwork-settings-scroll absolute left-0 right-0 z-30 mt-2 max-h-48 overflow-y-auto rounded-2xl border border-sky-100 bg-white p-1 shadow-2xl shadow-slate-200/80"
                  role="listbox"
                >
                  <button
                    v-for="language in languageOptions"
                    :key="language.value"
                    type="button"
                    role="option"
                    :aria-selected="accountForm.language === language.value"
                    :class="[
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                      accountForm.language === language.value
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    ]"
                    @click="selectLanguage(language.value)"
                  >
                    <span>{{ language.label }}</span>
                    <Icon
                      v-if="accountForm.language === language.value"
                      name="uil:check"
                      class="h-5 w-5 shrink-0 text-sky-600"
                    />
                  </button>
                </div>
              </Transition>
            </div>

            <div class="flex items-end justify-end">
              <button
                type="submit"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="profileLoading || savingProfile"
              >
                <Icon
                  :name="savingProfile ? 'svg-spinners:180-ring' : 'uil:save'"
                  :class="['h-5 w-5', savingProfile ? 'animate-spin' : '']"
                />
                {{ savingProfile ? 'Đang lưu...' : 'Lưu thay đổi' }}
              </button>
            </div>
          </div>
        </form>

        <article class="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
          <div class="border-b border-slate-100 bg-white px-5 py-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-extrabold text-slate-950">Danh mục cài đặt nâng cao</h2>
                <p class="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Các nhóm cài đặt được thu gọn để giữ trang nhẹ và dễ quét.
                </p>
              </div>
              <span class="inline-flex h-8 items-center gap-2 rounded-full bg-sky-50 px-3 text-xs font-bold text-sky-700">
                <Icon name="uil:layers" class="h-4 w-4" />
                {{ advancedSettingSections.length + 1 }} nhóm
              </span>
            </div>
          </div>

          <div class="space-y-3 p-4">
            <section class="overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:border-sky-200">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-sky-50/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                :aria-expanded="isSettingsSectionOpen('displayOptions')"
                aria-controls="enterprise-setting-section-display-options"
                @click="toggleSettingsSection('displayOptions')"
              >
                <span class="flex min-w-0 items-center gap-4">
                  <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Icon name="uil:eye" class="h-6 w-6" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-base font-extrabold text-slate-950">Tùy chọn hiển thị</span>
                    <span class="mt-1 block line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                      Điều chỉnh cách ứng viên nhìn thấy thông tin tuyển dụng của bạn.
                    </span>
                  </span>
                </span>

                <span class="flex shrink-0 items-center gap-3">
                  <span class="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 sm:inline-flex">
                    {{ displayOptionItems.length }} mục
                  </span>
                  <Icon
                    name="uil:angle-down"
                    :class="[
                      'h-6 w-6 text-slate-400 transition',
                      isSettingsSectionOpen('displayOptions') ? 'rotate-180 text-sky-600' : ''
                    ]"
                  />
                </span>
              </button>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0"
              >
                <div
                  v-if="isSettingsSectionOpen('displayOptions')"
                  id="enterprise-setting-section-display-options"
                  class="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/70"
                >
                  <div
                    v-for="option in displayOptionItems"
                    :key="option.key"
                    class="flex items-center justify-between gap-5 px-5 py-4 transition hover:bg-sky-50/50"
                  >
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-slate-950">{{ option.title }}</p>
                      <p class="mt-1 text-sm font-medium leading-6 text-slate-500">{{ option.description }}</p>
                    </div>

                    <label class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center">
                      <input
                        v-model="displayOptions[option.key]"
                        type="checkbox"
                        class="peer sr-only"
                        :aria-label="option.title"
                      >
                      <span class="h-7 w-12 rounded-full border border-slate-200 bg-slate-200 transition peer-checked:border-sky-500 peer-checked:bg-sky-500 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-100" />
                      <span class="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
              </Transition>
            </section>

            <section
              v-for="section in advancedSettingSections"
              :key="section.key"
              class="overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:border-sky-200"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-sky-50/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                :aria-expanded="isSettingsSectionOpen(section.key)"
                :aria-controls="`enterprise-setting-section-${section.key}`"
                @click="toggleSettingsSection(section.key)"
              >
                <span class="flex min-w-0 items-center gap-4">
                  <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', section.accentClass]">
                    <Icon :name="section.icon" class="h-6 w-6" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-base font-extrabold text-slate-950">{{ section.title }}</span>
                    <span class="mt-1 block line-clamp-2 text-sm font-medium leading-6 text-slate-500">{{ section.description }}</span>
                  </span>
                </span>

                <span class="flex shrink-0 items-center gap-3">
                  <span class="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 sm:inline-flex">
                    {{ section.items.length }} mục
                  </span>
                  <Icon
                    name="uil:angle-down"
                    :class="[
                      'h-6 w-6 text-slate-400 transition',
                      isSettingsSectionOpen(section.key) ? 'rotate-180 text-sky-600' : ''
                    ]"
                  />
                </span>
              </button>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0"
              >
                <div
                  v-if="isSettingsSectionOpen(section.key)"
                  :id="`enterprise-setting-section-${section.key}`"
                  class="border-t border-slate-100 bg-slate-50/70 px-3 py-3"
                >
                  <div class="grid gap-2 md:grid-cols-2">
                    <button
                      v-for="item in section.items"
                      :key="item.label"
                      type="button"
                      class="group flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                      @click="showDevelopingToast(`${section.title} - ${item.label}`)"
                    >
                      <span class="flex min-w-0 items-center gap-3">
                        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
                          <Icon :name="item.icon" class="h-5 w-5" />
                        </span>
                        <span class="min-w-0">
                          <span class="block truncate text-sm font-extrabold text-slate-950">{{ item.label }}</span>
                          <span class="mt-1 block line-clamp-1 text-xs font-semibold text-slate-500">{{ item.description }}</span>
                        </span>
                      </span>
                      <span class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                        Sắp có
                      </span>
                    </button>
                  </div>
                </div>
              </Transition>
            </section>
          </div>
        </article>
      </div>

      <aside class="min-w-0 space-y-5 self-start">
        <article class="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-base font-extrabold text-slate-950">Thông tin tài khoản</h2>
          </div>

          <div class="divide-y divide-slate-100">
            <div class="px-5 py-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Gói dịch vụ hiện tại</p>
                  <p class="mt-2 truncate text-lg font-extrabold text-slate-950">Chưa có dữ liệu gói</p>
                </div>
                <span class="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                  Đang phát triển
                </span>
              </div>
            </div>

            <div class="px-5 py-4">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Hiệu lực đến</p>
              <p class="mt-2 text-sm font-extrabold text-slate-950">Chưa cập nhật</p>
            </div>

            <div class="px-5 py-4">
              <div class="flex items-center justify-between gap-4">
                <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Số tin tuyển dụng</span>
                <span class="text-sm font-extrabold text-slate-950">{{ enterpriseJobCount }} tin</span>
              </div>
              <div class="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  class="h-2 rounded-full bg-sky-500 transition-all"
                  :style="{ width: `${jobUsageWidth}%` }"
                />
              </div>
              <p class="mt-2 text-xs font-medium leading-5 text-slate-500">Số liệu lấy từ danh sách tin tuyển dụng của tài khoản này.</p>
            </div>

            <div class="px-5 py-4">
              <button
                type="button"
                class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 text-sm font-bold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                @click="showDevelopingToast('Nâng cấp gói dịch vụ')"
              >
                <Icon name="uil:star" class="h-5 w-5" />
                Nâng cấp gói dịch vụ
              </button>
            </div>
          </div>
        </article>

        <article class="rounded-[22px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
          <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 class="text-base font-extrabold text-slate-950">Hoạt động gần đây</h2>
            <span
              v-if="recentActivityLoading"
              class="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700"
            >
              Đang tải
            </span>
          </div>

          <div
            v-if="recentActivityLoading"
            class="space-y-3 p-5"
          >
            <div
              v-for="item in 3"
              :key="item"
              class="h-20 animate-pulse rounded-2xl bg-slate-50"
            />
          </div>

          <div
            v-else-if="recentActivities.length"
            class="quickwork-settings-scroll max-h-80 space-y-3 overflow-y-auto p-5"
          >
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
            >
              <div class="flex items-start gap-3">
                <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', activity.iconClass]">
                  <Icon :name="activity.icon" class="h-5 w-5" />
                </span>
                <div class="min-w-0">
                  <p class="line-clamp-2 text-sm font-bold leading-5 text-slate-950">{{ activity.title }}</p>
                  <p class="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500">{{ activity.description }}</p>
                  <p class="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
                    <Icon name="uil:clock" class="h-3.5 w-3.5" />
                    {{ activity.time }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="px-5 py-8 text-center"
          >
            <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Icon name="uil:clock" class="h-6 w-6" />
            </span>
            <p class="mt-3 text-sm font-bold text-slate-900">Chưa có hoạt động</p>
            <p class="mt-1 text-sm font-medium leading-6 text-slate-500">
              {{ recentActivityError || 'Tin tuyển dụng mới tạo và ứng viên ứng tuyển sẽ xuất hiện tại đây.' }}
            </p>
          </div>
        </article>

        <article class="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
          <h2 class="text-base font-extrabold text-slate-950">Hỗ trợ</h2>
          <p class="mt-2 text-sm font-medium leading-6 text-slate-500">Bạn cần giúp đỡ? Đội ngũ hỗ trợ luôn sẵn sàng khi tính năng được kết nối.</p>
          <button
            type="button"
            class="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-4 text-sm font-bold text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="showDevelopingToast('Liên hệ hỗ trợ')"
          >
            <Icon name="uil:headphones-alt" class="h-5 w-5" />
            Liên hệ hỗ trợ
          </button>
        </article>
      </aside>
    </section>

    <section
      v-else
      class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <article class="rounded-[24px] border border-dashed border-sky-200 bg-white p-10 text-center shadow-sm shadow-slate-100/80">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
          <Icon :name="activeTabMeta.icon" class="h-8 w-8" />
        </span>
        <p class="mt-5 text-xs font-bold uppercase tracking-wide text-sky-700">Đang phát triển tính năng</p>
        <h2 class="mt-2 text-2xl font-extrabold text-slate-950">{{ activeTabMeta.label }}</h2>
        <p class="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          {{ activeTabMeta.description }}
        </p>
        <button
          type="button"
          class="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          @click="activeTab = 'account'"
        >
          <Icon name="uil:arrow-left" class="h-5 w-5" />
          Quay lại thông tin tài khoản
        </button>
      </article>

      <aside class="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
        <h2 class="text-base font-extrabold text-slate-950">Thông tin triển khai</h2>
        <div class="mt-4 space-y-3">
          <div
            v-for="item in roadmapItems"
            :key="item.title"
            class="rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                <Icon :name="item.icon" class="h-5 w-5" />
              </span>
              <div>
                <p class="text-sm font-bold text-slate-900">{{ item.title }}</p>
                <p class="mt-1 text-xs font-medium text-slate-500">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { AuthService } from '~/services/auth.service'
import { CompanyService } from '~/services/company.service'
import { JobService } from '~/services/job.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

type SettingsTabKey = 'account' | 'company'
type SettingsView = 'settings' | 'password'
type DisplayOptionKey = 'showCompanyName' | 'showCompanyLogo' | 'showContactInfo' | 'allowCvDownload'
type RecentActivityType = 'job' | 'application'
type PasswordFieldKey = 'current_password' | 'new_password' | 'confirm_password'
type PasswordVisibilityKey = 'current' | 'next' | 'confirm'

type SettingTab = {
  key: SettingsTabKey
  label: string
  icon: string
  description: string
}

type SettingsAccordionItem = {
  label: string
  description: string
  icon: string
}

type SettingsAccordionSection = {
  key: string
  title: string
  description: string
  icon: string
  accentClass: string
  items: SettingsAccordionItem[]
}

type TimezoneOption = {
  value: string
  label: string
}

type LanguageOption = {
  value: string
  label: string
}

type RecentActivityItem = {
  id: string
  type: RecentActivityType
  title: string
  description: string
  time: string
  timestamp: number
  icon: string
  iconClass: string
}

const authStore = useAuthStore()
const toast = useToast()
const activeTab = ref<SettingsTabKey>('account')
const settingsView = ref<SettingsView>('settings')
const timezoneDropdownRef = ref<HTMLElement | null>(null)
const languageDropdownRef = ref<HTMLElement | null>(null)
const isTimezoneOpen = ref(false)
const isLanguageOpen = ref(false)
const openSettingsSections = reactive<Record<string, boolean>>({
  displayOptions: true,
  notifications: true,
  recruitmentDefaults: false,
  interviews: false
})
const recentJobs = ref<any[]>([])
const recentApplications = ref<any[]>([])
const recentActivityLoading = ref(false)
const recentActivityError = ref('')
const profileLoading = ref(false)
const savingProfile = ref(false)
const profileSaveMessage = ref('')
const passwordSubmitting = ref(false)
const lastPasswordChangedAt = ref('Chưa có dữ liệu')
let profileSaveMessageTimer: ReturnType<typeof setTimeout> | null = null

const accountTab: SettingTab = {
  key: 'account',
  label: 'Thông tin tài khoản',
  icon: 'uil:user-square',
  description: 'Quản lý thông tin đăng nhập và nhận diện tài khoản nhà tuyển dụng.'
}

const settingTabs: SettingTab[] = [
  accountTab,
  {
    key: 'company',
    label: 'Hồ sơ công ty',
    icon: 'uil:building',
    description: 'Khu vực cập nhật hồ sơ doanh nghiệp, logo, mô tả và thông tin pháp lý.'
  }
]

const timezoneOptions: TimezoneOption[] = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam - Hà Nội, TP. Hồ Chí Minh' },
  { value: 'Asia/Bangkok', label: 'Thái Lan - Bangkok' },
  { value: 'Asia/Jakarta', label: 'Indonesia - Jakarta' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia - Kuala Lumpur' },
  { value: 'Asia/Shanghai', label: 'Trung Quốc - Thượng Hải' },
  { value: 'Asia/Tokyo', label: 'Nhật Bản - Tokyo' },
  { value: 'Asia/Seoul', label: 'Hàn Quốc - Seoul' },
  { value: 'Australia/Sydney', label: 'Úc - Sydney' },
  { value: 'Europe/London', label: 'Anh - London' },
  { value: 'Europe/Paris', label: 'Pháp - Paris' },
  { value: 'America/New_York', label: 'Mỹ - New York' },
  { value: 'America/Los_Angeles', label: 'Mỹ - Los Angeles' }
]

const languageOptions: LanguageOption[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' }
]

const securityTips = [
  {
    title: 'Không sử dụng mật khẩu dễ đoán',
    description: 'Tránh dùng ngày sinh, tên hoặc số điện thoại.',
    icon: 'uil:shield-check'
  },
  {
    title: 'Sử dụng mật khẩu mạnh',
    description: 'Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.',
    icon: 'uil:lock'
  },
  {
    title: 'Không chia sẻ mật khẩu',
    description: 'QuickWork không bao giờ yêu cầu mật khẩu của bạn.',
    icon: 'uil:user-check'
  },
  {
    title: 'Đăng xuất khi không sử dụng',
    description: 'Đăng xuất khi dùng thiết bị công cộng.',
    icon: 'uil:signout'
  }
]

const activeTabMeta = computed(() => settingTabs.find((tab) => tab.key === activeTab.value) || accountTab)

const companyName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Doanh nghiệp')
const userEmail = computed(() => authStore.user?.email || 'Chưa có email trong phiên đăng nhập')

const accountForm = reactive({
  displayName: '',
  email: '',
  phone: '',
  role: 'Chủ tài khoản',
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi'
})

const passwordForm = reactive<Record<PasswordFieldKey, string>>({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordErrors = reactive<Record<PasswordFieldKey, string>>({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordVisibility = reactive<Record<PasswordVisibilityKey, boolean>>({
  current: false,
  next: false,
  confirm: false
})

const displayOptions = reactive<Record<DisplayOptionKey, boolean>>({
  showCompanyName: true,
  showCompanyLogo: true,
  showContactInfo: false,
  allowCvDownload: false
})

const displayOptionItems: Array<{
  key: DisplayOptionKey
  title: string
  description: string
}> = [
  {
    key: 'showCompanyName',
    title: 'Hiển thị tên công ty trên tin tuyển dụng',
    description: 'Ứng viên sẽ thấy tên công ty của bạn trên các tin tuyển dụng.'
  },
  {
    key: 'showCompanyLogo',
    title: 'Hiển thị logo công ty trên tin tuyển dụng',
    description: 'Logo sẽ xuất hiện trong danh sách tin và trang chi tiết.'
  },
  {
    key: 'showContactInfo',
    title: 'Hiển thị thông tin liên hệ',
    description: 'Cho phép ứng viên xem email hoặc số điện thoại liên hệ trên tin tuyển dụng.'
  },
  {
    key: 'allowCvDownload',
    title: 'Cho phép ứng viên tải CV khi chưa ứng tuyển',
    description: 'Ứng viên có thể tải CV của bạn trước khi gửi hồ sơ.'
  }
]

const advancedSettingSections: SettingsAccordionSection[] = [
  {
    key: 'notifications',
    title: 'Thông báo',
    description: 'Thiết lập luồng nhắc việc cho ứng viên, tin tuyển dụng, phỏng vấn và hệ thống.',
    icon: 'uil:bell',
    accentClass: 'bg-sky-50 text-sky-700',
    items: [
      {
        label: 'Ứng viên',
        description: 'Nhận tin khi có ứng viên mới hoặc hồ sơ được cập nhật.',
        icon: 'uil:user-plus'
      },
      {
        label: 'Tuyển dụng',
        description: 'Theo dõi trạng thái tin tuyển dụng và hạn xử lý.',
        icon: 'uil:briefcase-alt'
      },
      {
        label: 'Phỏng vấn',
        description: 'Nhắc lịch, đổi lịch và kết quả phỏng vấn.',
        icon: 'uil:calendar-alt'
      },
      {
        label: 'Hệ thống',
        description: 'Cảnh báo tài khoản, phiên đăng nhập và dữ liệu hệ thống.',
        icon: 'uil:server'
      },
      {
        label: 'Marketing',
        description: 'Thông tin chiến dịch, gợi ý nâng cấp và tin tức sản phẩm.',
        icon: 'uil:megaphone'
      },
      {
        label: 'Kênh nhận thông báo',
        description: 'Chọn email, trong ứng dụng hoặc các kênh khác.',
        icon: 'uil:envelope'
      }
    ]
  },

  {
    key: 'interviews',
    title: 'Lịch phỏng vấn',
    description: 'Thiết lập cách đặt lịch, nhắc lịch, họp online và đánh giá sau phỏng vấn.',
    icon: 'uil:calendar-alt',
    accentClass: 'bg-indigo-50 text-indigo-700',
    items: [
      {
        label: 'Thời gian',
        description: 'Khung giờ làm việc và thời lượng phỏng vấn mặc định.',
        icon: 'uil:clock'
      },
      {
        label: 'Nhắc lịch',
        description: 'Thông báo trước lịch hẹn cho nhà tuyển dụng và ứng viên.',
        icon: 'uil:bell'
      },
      {
        label: 'Email',
        description: 'Mẫu email xác nhận, đổi lịch và kết quả phỏng vấn.',
        icon: 'uil:envelope'
      },
      {
        label: 'Họp trực tuyến',
        description: 'Thiết lập liên kết họp online và nền tảng phỏng vấn.',
        icon: 'uil:video'
      },
      {
        label: 'Người phỏng vấn',
        description: 'Gán người tham gia phỏng vấn theo vị trí tuyển dụng.',
        icon: 'uil:users-alt'
      },
      {
        label: 'Đánh giá',
        description: 'Tiêu chí chấm điểm và nhận xét sau phỏng vấn.',
        icon: 'uil:star'
      }
    ]
  },
  
  {
    key: 'recruitmentDefaults',
    title: 'Tuyển dụng mặc định',
    description: 'Chuẩn hóa thông tin tin đăng để tạo tin mới nhanh hơn.',
    icon: 'uil:setting',
    accentClass: 'bg-cyan-50 text-cyan-700',
    items: [
      {
        label: 'Thông tin công việc',
        description: 'Mẫu tiêu đề, cấp bậc, kinh nghiệm và loại hình.',
        icon: 'uil:briefcase-alt'
      },
      {
        label: 'Mức lương',
        description: 'Khoảng lương mặc định và cách hiển thị cho ứng viên.',
        icon: 'uil:money-bill'
      },
      {
        label: 'Tin tuyển dụng',
        description: 'Trạng thái gửi duyệt, hạn tuyển và số lượng tuyển.',
        icon: 'uil:file-alt'
      },
      {
        label: 'Mẫu mô tả',
        description: 'Lưu mô tả công việc, yêu cầu và quyền lợi thường dùng.',
        icon: 'uil:edit'
      },
      {
        label: 'Thiết lập ứng tuyển',
        description: 'Quy định trường bắt buộc và cách nhận hồ sơ ứng viên.',
        icon: 'uil:user-check'
      }
    ]
  }
  
]

const roadmapItems = [
  {
    title: 'Chờ backend kết nối',
    description: 'Các nhóm cài đặt chưa sử dụng sẽ hiển thị trạng thái đang phát triển.',
    icon: 'uil:server'
  },
  {
    title: 'Không dùng dữ liệu giả',
    description: 'Hoạt động gần đây lấy trực tiếp từ tin tuyển dụng và đơn ứng tuyển hiện có.',
    icon: 'uil:database'
  },
  {
    title: 'Sẵn sàng mở rộng',
    description: 'Cấu trúc tab tách rõ để nối API sau này.',
    icon: 'uil:layers'
  }
]

const timezoneSelectOptions = computed(() => timezoneOptions.map((zone) => ({
  ...zone,
  offset: getTimezoneOffset(zone.value)
})))

const selectedTimezoneOption = computed(() => (
  timezoneSelectOptions.value.find((zone) => zone.value === accountForm.timezone)
  || timezoneSelectOptions.value[0]
))

const selectedTimezoneLabel = computed(() => (
  selectedTimezoneOption.value
    ? `${selectedTimezoneOption.value.offset} ${selectedTimezoneOption.value.label}`
    : 'Chọn múi giờ'
))

const selectedLanguageLabel = computed(() => (
  languageOptions.find((language) => language.value === accountForm.language)?.label || 'Chọn ngôn ngữ'
))

const passwordRules = computed(() => {
  const newPassword = passwordForm.new_password

  return [
    {
      label: 'Ít nhất 8 ký tự',
      valid: newPassword.length >= 8
    },
    {
      label: 'Có chữ hoa và chữ thường',
      valid: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
    },
    {
      label: 'Có số hoặc ký tự đặc biệt',
      valid: /[0-9\W_]/.test(newPassword)
    },
    {
      label: 'Không chứa khoảng trắng',
      valid: Boolean(newPassword) && !/\s/.test(newPassword)
    }
  ]
})

const passwordStrengthScore = computed(() => passwordRules.value.filter((rule) => rule.valid).length)

const passwordStrengthMeta = computed(() => {
  if (!passwordForm.new_password) {
    return {
      label: 'Chưa nhập',
      textClass: 'text-slate-500',
      barClass: 'bg-slate-300'
    }
  }

  if (passwordStrengthScore.value >= 4) {
    return {
      label: 'Mạnh',
      textClass: 'text-emerald-600',
      barClass: 'bg-emerald-500'
    }
  }

  if (passwordStrengthScore.value >= 3) {
    return {
      label: 'Khá',
      textClass: 'text-sky-600',
      barClass: 'bg-sky-500'
    }
  }

  if (passwordStrengthScore.value >= 2) {
    return {
      label: 'Trung bình',
      textClass: 'text-amber-600',
      barClass: 'bg-amber-500'
    }
  }

  return {
    label: 'Yếu',
    textClass: 'text-rose-600',
    barClass: 'bg-rose-500'
  }
})

const recentActivities = computed<RecentActivityItem[]>(() => {
  const jobActivities = recentJobs.value.map((job) => ({
    id: `job-${job?.id || job?.ID || job?.title}`,
    type: 'job' as const,
    title: job?.title || 'Tin tuyển dụng mới',
    description: `Tin ${getJobStatusLabel(job?.status).toLowerCase()} vừa được cập nhật trong hệ thống.`,
    time: formatDateTime(job?.created_at || job?.CreatedAt || job?.updated_at || job?.UpdatedAt),
    timestamp: getTimestamp(job?.created_at || job?.CreatedAt || job?.updated_at || job?.UpdatedAt),
    icon: 'uil:briefcase-alt',
    iconClass: 'bg-sky-50 text-sky-700'
  }))

  const applicationActivities = recentApplications.value.map((application) => ({
    id: `application-${application?.id || application?.ID || application?.student?.email || application?.created_at}`,
    type: 'application' as const,
    title: `${getStudentName(application)} ứng tuyển`,
    description: `${application?.job?.title || 'Tin tuyển dụng'} - ${getApplicationStatusLabel(application?.status)}`,
    time: formatDateTime(application?.created_at || application?.CreatedAt),
    timestamp: getTimestamp(application?.created_at || application?.CreatedAt),
    icon: 'uil:user-plus',
    iconClass: 'bg-emerald-50 text-emerald-700'
  }))

  return [...jobActivities, ...applicationActivities]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, 6)
})

const enterpriseJobCount = computed(() => recentJobs.value.length)
const jobUsageWidth = computed(() => {
  if (!enterpriseJobCount.value) {
    return 0
  }

  return Math.min(100, Math.max(12, enterpriseJobCount.value * 10))
})

watch([companyName, userEmail], ([name, email]) => {
  if (!accountForm.displayName || accountForm.displayName === 'Doanh nghiệp') {
    accountForm.displayName = name
  }
  accountForm.email = email
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadEnterpriseProfile()
  loadRecentActivity()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (profileSaveMessageTimer) {
    clearTimeout(profileSaveMessageTimer)
  }
})

function toggleTimezoneDropdown() {
  isTimezoneOpen.value = !isTimezoneOpen.value
  isLanguageOpen.value = false
}

function selectTimezone(value: string) {
  accountForm.timezone = value
  isTimezoneOpen.value = false
}

function toggleLanguageDropdown() {
  isLanguageOpen.value = !isLanguageOpen.value
  isTimezoneOpen.value = false
}

function selectLanguage(value: string) {
  accountForm.language = value
  isLanguageOpen.value = false
}

function isSettingsSectionOpen(key: string) {
  return Boolean(openSettingsSections[key])
}

function toggleSettingsSection(key: string) {
  openSettingsSections[key] = !openSettingsSections[key]
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Node)) {
    return
  }

  if (!timezoneDropdownRef.value?.contains(target)) {
    isTimezoneOpen.value = false
  }

  if (!languageDropdownRef.value?.contains(target)) {
    isLanguageOpen.value = false
  }
}

function openPasswordPanel() {
  settingsView.value = 'password'
  activeTab.value = 'account'
  isTimezoneOpen.value = false
  isLanguageOpen.value = false
  clearPasswordForm()
}

function closePasswordPanel() {
  settingsView.value = 'settings'
  clearPasswordForm()
}

function togglePasswordVisibility(field: PasswordVisibilityKey) {
  passwordVisibility[field] = !passwordVisibility[field]
}

function clearPasswordForm() {
  passwordForm.current_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
  passwordErrors.current_password = ''
  passwordErrors.new_password = ''
  passwordErrors.confirm_password = ''
  passwordVisibility.current = false
  passwordVisibility.next = false
  passwordVisibility.confirm = false
}

function validatePasswordForm() {
  passwordErrors.current_password = ''
  passwordErrors.new_password = ''
  passwordErrors.confirm_password = ''

  if (!passwordForm.current_password) {
    passwordErrors.current_password = 'Vui lòng nhập mật khẩu hiện tại.'
  }

  if (!passwordForm.new_password) {
    passwordErrors.new_password = 'Vui lòng nhập mật khẩu mới.'
  } else if (passwordForm.new_password.length < 8) {
    passwordErrors.new_password = 'Mật khẩu mới cần có ít nhất 8 ký tự.'
  } else if (!/[A-Z]/.test(passwordForm.new_password) || !/[a-z]/.test(passwordForm.new_password)) {
    passwordErrors.new_password = 'Mật khẩu mới cần có chữ hoa và chữ thường.'
  } else if (!/[0-9\W_]/.test(passwordForm.new_password)) {
    passwordErrors.new_password = 'Mật khẩu mới cần có số hoặc ký tự đặc biệt.'
  } else if (/\s/.test(passwordForm.new_password)) {
    passwordErrors.new_password = 'Mật khẩu mới không được chứa khoảng trắng.'
  } else if (passwordForm.new_password === passwordForm.current_password) {
    passwordErrors.new_password = 'Mật khẩu mới không được trùng mật khẩu hiện tại.'
  }

  if (!passwordForm.confirm_password) {
    passwordErrors.confirm_password = 'Vui lòng xác nhận mật khẩu mới.'
  } else if (passwordForm.confirm_password !== passwordForm.new_password) {
    passwordErrors.confirm_password = 'Mật khẩu xác nhận chưa khớp.'
  }

  return !passwordErrors.current_password && !passwordErrors.new_password && !passwordErrors.confirm_password
}

async function handleChangePassword() {
  if (!validatePasswordForm()) {
    return
  }

  passwordSubmitting.value = true

  try {
    await AuthService.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      confirm_password: passwordForm.confirm_password
    })

    lastPasswordChangedAt.value = formatDateTime(new Date().toISOString())
    toast.success('Đổi mật khẩu thành công', 'Mật khẩu mới đã được cập nhật cho tài khoản hiện tại.')
    closePasswordPanel()
  } catch (error: any) {
    toast.error('Không thể đổi mật khẩu', error?.data?.message || error?.message || 'Vui lòng kiểm tra lại mật khẩu hiện tại.')
  } finally {
    passwordSubmitting.value = false
  }
}

function applyEnterpriseProfile(profileUser: any) {
  const profile = profileUser?.enterprise_profile || {}
  accountForm.displayName = profile.company_name || companyName.value
  accountForm.email = profileUser?.email || userEmail.value
  accountForm.phone = profile.phone || ''

  if (authStore.user) {
    authStore.setCurrentUser({
      ...authStore.user,
      name: accountForm.displayName
    })
  }
}

async function loadEnterpriseProfile() {
  profileLoading.value = true

  try {
    const response: any = await CompanyService.getProfile()
    if (response?.success && response.data) {
      applyEnterpriseProfile(response.data)
    }
  } catch (error) {
    console.error('Không thể tải hồ sơ nhà tuyển dụng:', error)
  } finally {
    profileLoading.value = false
  }
}

function validateAccountProfile() {
  const displayName = accountForm.displayName.trim()
  const phone = accountForm.phone.trim()

  if (!displayName) {
    toast.error('Thiếu tên hiển thị', 'Vui lòng nhập tên doanh nghiệp trước khi lưu.')
    return false
  }

  if (phone && (!/^\d+$/.test(phone) || phone.length < 10 || phone.length > 11)) {
    toast.error('Số điện thoại chưa hợp lệ', 'Số điện thoại liên hệ phải có từ 10 đến 11 chữ số.')
    return false
  }

  accountForm.displayName = displayName
  accountForm.phone = phone
  return true
}

async function handleSave() {
  if (!validateAccountProfile()) {
    return
  }

  savingProfile.value = true
  profileSaveMessage.value = ''

  try {
    const response: any = await CompanyService.updateProfile({
      company_name: accountForm.displayName,
      phone: accountForm.phone
    })

    if (!response?.success) {
      throw new Error(response?.message || 'Không thể lưu hồ sơ nhà tuyển dụng.')
    }

    applyEnterpriseProfile(response.data)
    showProfileSaveMessage('Thay đổi đã được lưu. Tên hiển thị và số điện thoại liên hệ đã được cập nhật.')
    toast.success('Đã lưu thay đổi', 'Thông tin tài khoản nhà tuyển dụng đã được cập nhật.')
  } catch (error: any) {
    toast.error('Không thể lưu hồ sơ', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    savingProfile.value = false
  }
}

function showProfileSaveMessage(message: string) {
  profileSaveMessage.value = message

  if (profileSaveMessageTimer) {
    clearTimeout(profileSaveMessageTimer)
  }

  profileSaveMessageTimer = setTimeout(() => {
    profileSaveMessage.value = ''
    profileSaveMessageTimer = null
  }, 4500)
}

async function loadRecentActivity() {
  recentActivityLoading.value = true
  recentActivityError.value = ''

  try {
    const [jobsResponse, applicationsResponse] = await Promise.all([
      JobService.getEnterpriseJobs(),
      JobService.getEnterpriseApplications()
    ])

    recentJobs.value = extractResponseArray(jobsResponse)
    recentApplications.value = extractResponseArray(applicationsResponse)
  } catch (error) {
    console.error('Không thể tải hoạt động gần đây:', error)
    recentJobs.value = []
    recentApplications.value = []
    recentActivityError.value = 'Chưa tải được hoạt động gần đây từ hệ thống.'
  } finally {
    recentActivityLoading.value = false
  }
}

function extractResponseArray(response: any) {
  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response)) {
    return response
  }

  return []
}

function getStudentName(application: any) {
  return application?.student?.student_profile?.name
    || application?.student?.name
    || application?.student?.email?.split('@')[0]
    || 'Ứng viên'
}

function getJobStatusLabel(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'DRAFT':
      return 'Bản nháp'
    case 'PENDING':
      return 'chờ duyệt'
    case 'APPROVED':
      return 'đã duyệt'
    case 'REJECTED':
      return 'bị từ chối'
    case 'CLOSED':
      return 'đã đóng'
    default:
      return 'mới'
  }
}

function getApplicationStatusLabel(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'ACCEPTED':
      return 'Đã duyệt'
    case 'REJECTED':
      return 'Bị từ chối'
    case 'APPLIED':
      return 'Chờ xử lý'
    default:
      return 'Đơn mới'
  }
}

function getTimestamp(value?: string) {
  if (!value) {
    return 0
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Chưa cập nhật'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Chưa cập nhật'
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getTimezoneOffset(timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset'
    }).formatToParts(new Date())
    return parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT'
  } catch {
    return 'GMT'
  }
}

function showDevelopingToast(label: string) {
  toast.info('Đang phát triển', `${label} sẽ được kích hoạt khi backend sẵn sàng.`)
}
</script>

<style scoped>
.quickwork-settings-scroll {
  scrollbar-color: #bae6fd transparent;
  scrollbar-width: thin;
}

.quickwork-settings-scroll::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.quickwork-settings-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.quickwork-settings-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.quickwork-settings-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border: 2px solid #fff;
  border-radius: 999px;
}

.quickwork-settings-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
