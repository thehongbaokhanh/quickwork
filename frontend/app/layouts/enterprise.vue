<template>
  <div class="min-h-screen bg-[#f5f7fb] font-sans text-slate-900 antialiased">
    <header
      :class="[
        'sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur transition-[margin] duration-200',
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      ]"
    >
      <div class="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <button
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Mở menu"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            <Icon name="uil:bars" class="h-5 w-5" />
          </button>

          <NuxtLink to="/enterprise" class="flex items-center gap-3 lg:hidden">
            <img src="/images/brand/quickwork-icon-dark-transparent.png" alt="QuickWork" class="h-10 w-10 shrink-0 rounded-lg object-contain shadow-sm">
            <span class="min-w-0">
              <span class="block text-sm font-black leading-tight text-slate-950">
                Quick<span class="text-sky-600">Work</span>
              </span>
              <span class="block text-[11px] font-semibold leading-tight text-slate-500">
                Nhà tuyển dụng
              </span>
            </span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="relative">
            <button
              class="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Thông báo"
              @click.stop="toggleNotifications"
            >
              <Icon name="uil:bell" class="h-5 w-5" />
              <span
                v-if="notificationUnreadCount > 0"
                class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white"
              >
                {{ notificationUnreadCount > 9 ? '9+' : notificationUnreadCount }}
              </span>
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 z-50 mt-2"
              @click.stop
            >
              <UiNotificationDropdown
                title="Thông báo tuyển dụng"
                :unread-count="notificationUnreadCount"
                :loading="notificationLoading"
                :items="headerNotifications"
                empty-text="Chưa có thông báo tuyển dụng nào."
                view-all-to="/enterprise/notifications"
                storage-key="enterprise-header"
                :get-icon="getNotificationIcon"
                :get-icon-class="getNotificationIconClass"
                @mark-all-read="markEnterpriseNotificationsRead"
                @open="openEnterpriseNotification"
                @close="closeDropdowns"
              />
              <template v-if="false">
              <div class="border-b border-slate-100 px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-bold text-slate-950">Thông báo tuyển dụng</p>
                    <p class="mt-0.5 text-xs text-slate-500">{{ notificationUnreadCount }} thông báo chưa đọc.</p>
                  </div>
                  <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-black text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="notificationUnreadCount === 0"
                    @click="markEnterpriseNotificationsRead"
                  >
                    Đã đọc
                  </button>
                </div>
              </div>
              <div v-if="notificationLoading" class="space-y-2 px-4 py-4">
                <div v-for="index in 3" :key="index" class="h-14 animate-pulse rounded-xl bg-slate-100" />
              </div>
              <div v-else-if="headerNotifications.length === 0" class="px-4 py-5 text-sm font-semibold text-slate-500">
                Chưa có thông báo tuyển dụng nào.
              </div>
              <div v-else class="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                <button
                  v-for="item in headerNotifications"
                  :key="item.id"
                  type="button"
                  class="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-sky-50/70"
                  @click="openEnterpriseNotification(item)"
                >
                  <span :class="['mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', getNotificationIconClass(item.type)]">
                    <Icon :name="getNotificationIcon(item.type)" class="h-4.5 w-4.5" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center gap-2">
                      <span class="truncate text-sm font-black text-slate-950">{{ item.title || 'Thông báo' }}</span>
                      <span v-if="!item.is_read" class="h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    </span>
                    <span class="mt-0.5 line-clamp-2 block text-xs font-semibold leading-5 text-slate-500">{{ item.content }}</span>
                  </span>
                </button>
              </div>
              <div class="border-t border-slate-100 p-3">
                <NuxtLink
                  to="/enterprise/notifications"
                  class="flex h-10 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100"
                  @click="closeDropdowns"
                >
                  Xem tất cả thông báo
                </NuxtLink>
              </div>
              </template>
            </div>
          </div>

          <div class="relative">
            <button
              class="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-100"
              @click.stop="toggleUserMenu"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sky-600 text-xs font-black text-white">
                <img v-if="companyAvatar" :src="companyAvatar" :alt="`Logo của ${companyName}`" class="h-full w-full object-cover" @error="companyLogoLoadFailed = true">
                <template v-else>{{ companyInitials }}</template>
              </span>
              <span class="hidden min-w-0 text-left sm:block">
                <span class="block max-w-36 truncate text-xs font-bold text-slate-800">{{ companyName }}</span>
                <span class="block max-w-36 truncate text-[11px] text-slate-500">{{ userEmail || 'Tài khoản doanh nghiệp' }}</span>
              </span>
              <Icon name="uil:angle-down" class="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>

            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="scale-95 opacity-0"
              enter-to-class="scale-100 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="scale-100 opacity-100"
              leave-to-class="scale-95 opacity-0"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-xl"
                @click.stop
              >
                <div class="border-b border-slate-100 px-4 py-3">
                  <p class="truncate font-bold text-slate-950">{{ companyName }}</p>
                  <p class="mt-0.5 truncate text-xs text-slate-500">{{ userEmail || 'Chưa có email trong phiên đăng nhập' }}</p>
                </div>
                <div class="py-1">
                  <NuxtLink
                    :to="isEnterpriseFeatureLocked('/enterprise/jobs') ? '/enterprise' : '/enterprise/jobs'"
                    class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50"
                    @click="isEnterpriseFeatureLocked('/enterprise/jobs') ? showEnterpriseFeatureLockedToast() : closeDropdowns()"
                  >
                    <Icon name="uil:file-alt" class="h-4.5 w-4.5 text-slate-400" />
                    <span>Danh sách tin tuyển dụng</span>
                  </NuxtLink>
                  <NuxtLink
                    :to="isEnterpriseFeatureLocked('/enterprise/jobs/create') ? '/enterprise' : '/enterprise/jobs/create'"
                    class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50"
                    @click="isEnterpriseFeatureLocked('/enterprise/jobs/create') ? showEnterpriseFeatureLockedToast() : closeDropdowns()"
                  >
                    <Icon name="uil:plus-circle" class="h-4.5 w-4.5 text-slate-400" />
                    <span>Tạo tin mới</span>
                  </NuxtLink>
                </div>
                <button
                  class="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left font-bold text-rose-600 transition hover:bg-rose-50"
                  @click="handleLogout"
                >
                  <Icon name="uil:sign-out-alt" class="h-4.5 w-4.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <div class="relative flex min-h-[calc(100vh-4rem)]">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        @click="isSidebarOpen = false"
      />

      <aside
        :class="[
          'enterprise-sidebar fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-900 bg-slate-950 pt-16 text-white transition-[transform,width] duration-200 lg:translate-x-0 lg:rounded-r-2xl lg:pt-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isSidebarCollapsed ? 'enterprise-sidebar-collapsed lg:w-20' : 'lg:w-72'
        ]"
      >
        <div :class="['enterprise-sidebar-scroll flex h-full flex-col justify-between overflow-y-auto pb-6', isSidebarCollapsed ? 'px-3' : 'px-4']">
          <div :class="['enterprise-sidebar-brand mb-4 flex h-16 items-center border-b border-white/10', isSidebarCollapsed ? 'justify-center' : 'gap-3 px-2']">
            <NuxtLink to="/enterprise" class="flex shrink-0 items-center justify-center rounded-xl bg-sky-600 shadow-lg shadow-sky-950/30">
              <img src="/images/brand/quickwork-icon-dark-transparent.png" alt="QuickWork" class="h-10 w-10 rounded-xl object-contain">
            </NuxtLink>
            <NuxtLink v-if="!isSidebarCollapsed" to="/enterprise" class="min-w-0">
              <span class="block truncate text-lg font-black leading-tight text-white">
                Quick<span class="text-sky-400">Work</span>
              </span>
              <span class="mt-0.5 block truncate text-xs font-semibold text-slate-400">
                Nhà tuyển dụng
              </span>
            </NuxtLink>
          </div>
          <button
            type="button"
            class="enterprise-collapse-handle hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-slate-800 shadow-md shadow-slate-950/20 ring-2 ring-slate-100 transition hover:border-sky-500 hover:bg-sky-600 hover:text-white hover:ring-sky-100 lg:absolute lg:-right-3 lg:top-8 lg:flex lg:-translate-y-1/2"
            :aria-label="isSidebarCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
          >
            <Icon :name="isSidebarCollapsed ? 'uil:angle-right-b' : 'uil:angle-left-b'" class="h-4 w-4" />
          </button>

          <NuxtLink
            v-if="showKYBNotice && !isSidebarCollapsed"
            to="/enterprise/settings"
            class="enterprise-sidebar-kyb-card mb-6 flex items-center gap-3 rounded-2xl border px-4 py-4 transition hover:-translate-y-0.5"
            @click="isSidebarOpen = false"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-amber-400" aria-hidden="true">
              <Icon name="uil:shield-exclamation" class="h-6 w-6" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-black text-amber-300">
                {{ authStore.enterpriseKybStatus === 'REJECTED' ? 'Hồ sơ KYB bị từ chối' : 'Tài khoản chưa được duyệt KYB' }}
              </span>
              <span class="mt-1 block truncate text-xs font-semibold text-slate-300">
                {{ authStore.enterpriseKybStatus === 'REJECTED' ? 'Xem lý do và gửi lại hồ sơ' : 'Hoàn tất hồ sơ để kích hoạt' }}
              </span>
            </span>
            <Icon name="uil:angle-right-b" class="h-5 w-5 shrink-0 text-slate-200" aria-hidden="true" />
          </NuxtLink>

          <NuxtLink
            v-if="showKYBNotice && isSidebarCollapsed"
            to="/enterprise/settings"
            class="enterprise-sidebar-kyb-rail-card mb-4 flex items-center justify-center"
            aria-label="Cap nhat KYB"
            @click="isSidebarOpen = false"
          >
            <Icon name="uil:shield-exclamation" class="h-5 w-5" aria-hidden="true" />
          </NuxtLink>

          <nav class="space-y-1.5 text-sm font-semibold">
            <p class="enterprise-sidebar-section-title">Tổng quan</p>
            <template v-for="item in primaryNavItems.slice(0, 1)" :key="item.to">
              <NuxtLink
                v-if="!isEnterpriseFeatureLocked(item.to)"
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                  isPrimaryItemActive(item)
                    ? 'border-sky-100 bg-sky-50 text-sky-700'
                    : 'border-transparent text-slate-600'
                ]"
                @click="isSidebarOpen = false"
              >
                <span class="enterprise-sidebar-icon" aria-hidden="true">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
                <span class="enterprise-sidebar-label">{{ item.name }}</span>
              </NuxtLink>
              <button
                v-else
                type="button"
                class="enterprise-sidebar-locked-item flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition"
                @click="showEnterpriseFeatureLockedToast"
              >
                <span class="enterprise-sidebar-icon" aria-hidden="true">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
                <span class="enterprise-sidebar-label">{{ item.name }}</span>
                <span class="enterprise-sidebar-kyb ml-auto rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-amber-700">KYB</span>
              </button>
            </template>

            <div class="enterprise-sidebar-section-divider" />
            <p class="enterprise-sidebar-section-title">Quản lý tuyển dụng</p>

            <template v-for="item in primaryNavItems.slice(1)" :key="item.to">
              <NuxtLink
                v-if="!isEnterpriseFeatureLocked(item.to)"
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                  isPrimaryItemActive(item)
                    ? 'border-sky-100 bg-sky-50 text-sky-700'
                    : 'border-transparent text-slate-600'
                ]"
                @click="isSidebarOpen = false"
              >
                <span class="enterprise-sidebar-icon" aria-hidden="true">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
                <span class="enterprise-sidebar-label">{{ item.name }}</span>
              </NuxtLink>
              <button
                v-else
                type="button"
                class="enterprise-sidebar-locked-item flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition"
                @click="showEnterpriseFeatureLockedToast"
              >
                <span class="enterprise-sidebar-icon" aria-hidden="true">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
                <span class="enterprise-sidebar-label">{{ item.name }}</span>
                <span class="enterprise-sidebar-kyb ml-auto rounded px-1.5 py-0.5 text-[10px] font-black">KYB</span>
              </button>
            </template>

            <div class="relative space-y-1">
              <button
                type="button"
                :class="[
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition',
                  isEnterpriseFeatureLocked(applicationNav.to)
                    ? 'enterprise-sidebar-locked-item'
                    : isApplicationsSection || isApplicationFlyoutActive
                    ? 'border-sky-100 bg-sky-50 text-sky-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                ]"
                :aria-expanded="isApplicationNavOpen"
                aria-controls="enterprise-application-nav"
                @click.stop="toggleApplicationNav"
              >
                <span class="enterprise-sidebar-icon" aria-hidden="true">
                  <Icon :name="applicationNav.icon" class="h-5 w-5" />
                </span>
                <span class="enterprise-sidebar-label min-w-0 flex-1">{{ applicationNav.name }}</span>
                <Icon
                  v-if="!isSidebarCollapsed"
                  name="uil:angle-down"
                  :class="['enterprise-sidebar-chevron h-4 w-4 shrink-0 transition-transform duration-200', isApplicationNavOpen ? 'rotate-180' : '']"
                />
                <span v-if="isEnterpriseFeatureLocked(applicationNav.to)" class="enterprise-sidebar-kyb rounded px-1.5 py-0.5 text-[10px] font-black">KYB</span>
              </button>

              <div
                v-if="isSidebarCollapsed && showApplicationFlyout"
                class="application-flyout fixed left-[5.75rem] top-[13.25rem] z-50 w-64 overflow-visible rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-2xl shadow-slate-950/15 ring-1 ring-slate-100"
                @click.stop
              >
                <span class="application-flyout-arrow" aria-hidden="true" />
                <div class="px-3 pb-3 pt-2">
                  <p class="text-[12px] font-black uppercase tracking-wide text-slate-400">Ứng viên</p>
                  <p class="mt-2 text-sm font-semibold leading-5 text-slate-500">Chọn danh sách cần xem</p>
                </div>
                <div class="mx-3 h-px bg-slate-100" />
                <NuxtLink
                  v-for="item in applicationNav.children"
                  :key="`flyout-${item.name}`"
                  :to="getApplicationChildTo(item)"
                  :class="[
                    'application-flyout-link mt-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                    isApplicationChildActive(item)
                      ? 'application-flyout-link-active'
                      : 'application-flyout-link-idle'
                  ]"
                  @click="showApplicationFlyout = false; isSidebarOpen = false"
                >
                  <span
                    :class="[
                      'flex h-8 w-8 shrink-0 items-center justify-center',
                      isApplicationChildActive(item)
                        ? 'application-flyout-icon-active'
                        : 'application-flyout-icon-idle'
                    ]"
                    aria-hidden="true"
                  >
                    <Icon :name="item.icon" class="h-5 w-5" />
                  </span>
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-black leading-5">{{ item.name }}</span>
                    <span class="mt-0.5 block truncate text-xs font-semibold leading-5 text-slate-500">{{ item.description }}</span>
                  </span>
                </NuxtLink>
              </div>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0"
              >
                <div
                  v-show="isApplicationNavOpen"
                  id="enterprise-application-nav"
                  class="ml-5 space-y-1 border-l border-slate-200 pl-4"
                >
                  <NuxtLink
                    v-for="item in applicationNav.children"
                    :key="item.name"
                    :to="getApplicationChildTo(item)"
                    :class="[
                      'block rounded-lg px-3 py-2 text-sm transition',
                      isApplicationChildActive(item)
                        ? 'bg-sky-50 font-black text-sky-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    ]"
                    @click="isSidebarOpen = false"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </div>
              </Transition>
            </div>

            <template v-for="item in secondaryNavItems" :key="item.to">
              <NuxtLink
                v-if="!isEnterpriseFeatureLocked(item.to)"
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                  isSecondaryItemActive(item)
                    ? 'border-sky-100 bg-sky-50 text-sky-700'
                    : 'border-transparent text-slate-600'
                ]"
                @click="isSidebarOpen = false"
              >
                <span class="enterprise-sidebar-icon" aria-hidden="true">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
                <span class="enterprise-sidebar-label">{{ item.name }}</span>
                <span
                  v-if="item.badge"
                  :class="[
                    'sidebar-badge ml-auto rounded-full px-2 py-0.5 text-[10px] font-black',
                    item.badgeClass || 'bg-rose-100 text-rose-600'
                  ]"
                >
                  {{ item.badge > 99 ? '99+' : item.badge }}
                </span>
              </NuxtLink>
              <button
                v-else
                type="button"
                class="enterprise-sidebar-locked-item flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition"
                @click="showEnterpriseFeatureLockedToast"
              >
                <span class="enterprise-sidebar-icon" aria-hidden="true">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
                <span class="enterprise-sidebar-label">{{ item.name }}</span>
                <span class="enterprise-sidebar-kyb ml-auto rounded px-1.5 py-0.5 text-[10px] font-black">KYB</span>
              </button>
            </template>

            <div class="enterprise-sidebar-section-divider" />
            <p class="enterprise-sidebar-section-title">Tài khoản</p>

            <NuxtLink
              :to="settingsNavItem.to"
              :class="[
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                isSettingsItemActive ? 'border-sky-100 bg-sky-50 text-sky-700' : 'border-transparent text-slate-600'
              ]"
              @click="isSidebarOpen = false"
            >
              <span class="enterprise-sidebar-icon" aria-hidden="true">
                <Icon :name="settingsNavItem.icon" class="h-5 w-5" />
              </span>
              <span class="enterprise-sidebar-label">{{ settingsNavItem.name }}</span>
            </NuxtLink>
          </nav>

          <div class="enterprise-sidebar-footer border-t border-slate-100 pt-5">
            <div class="enterprise-sidebar-user-card flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xs font-black text-sky-700 shadow-sm">
                <img v-if="companyAvatar" :src="companyAvatar" :alt="`Logo của ${companyName}`" class="h-full w-full object-cover" @error="companyLogoLoadFailed = true">
                <template v-else>{{ companyInitials }}</template>
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-slate-900">{{ companyName }}</p>
                <p class="truncate text-xs text-slate-500">{{ userRoleLabel }}</p>
              </div>
            </div>

            <button
              class="mt-3 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
              aria-label="Đăng xuất"
              @click="handleLogout"
            >
              <span class="enterprise-sidebar-icon" aria-hidden="true">
                <Icon name="uil:sign-out-alt" class="h-5 w-5" />
              </span>
              <span class="enterprise-sidebar-logout-label">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        :class="[
          'min-w-0 flex-1 px-4 py-6 transition-[margin] duration-200 sm:px-6 lg:px-8',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        ]"
      >
        <div class="mx-auto w-full max-w-7xl">
          <div
            v-if="showKYBNotice"
            class="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 shadow-sm"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-start gap-3">
                <Icon name="uil:shield-exclamation" class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <span>{{ kybNoticeText }}</span>
              </div>
              <NuxtLink
                to="/enterprise/settings"
                class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-amber-800 transition hover:bg-amber-100"
              >
                <Icon name="uil:file-upload-alt" class="h-4 w-4" />
                {{ kybNoticeActionLabel }}
              </NuxtLink>
            </div>
          </div>
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { CompanyService } from '~/services/company.service'
import { ConversationService } from '~/services/conversation.service'
import { NotificationService } from '~/services/notification.service'

const authStore = useAuthStore()
const route = useRoute()
const toast = useToast()
const config = useRuntimeConfig()

const isSidebarOpen = ref(false)
const {
  sidebarCollapsed: isSidebarCollapsed,
  applicantGroupOpen: isApplicationNavOpen,
  restore: restoreEnterpriseUi,
  persist: persistEnterpriseUi
} = useEnterpriseUiState()
const showApplicationFlyout = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const headerNotifications = ref<any[]>([])
const notificationUnreadCount = ref(0)
const messageUnreadCount = ref(0)
const notificationLoading = ref(false)
const loadedCompanyProfile = ref<any>({})
const companyLogoLoadFailed = ref(false)
let sidebarCountTimer: ReturnType<typeof setInterval> | null = null

type EnterpriseSidebarItem = {
  name: string
  to: string
  icon: string
  badge?: number
  badgeClass?: string
}

type ApplicationNavView = '' | 'saved' | 'rejected'

type EnterpriseApplicationChild = {
  name: string
  view: ApplicationNavView
  icon: string
  description: string
}

const primaryNavItems = [
  { name: 'Tổng quan', to: '/enterprise', icon: 'uil:home' },
  { name: 'Tin tuyển dụng', to: '/enterprise/jobs', icon: 'uil:file-alt' },
  { name: 'Tạo tin mới', to: '/enterprise/jobs/create', icon: 'uil:plus-circle' }
]

const applicationNav: {
  name: string
  to: string
  icon: string
  children: EnterpriseApplicationChild[]
} = {
  name: 'Ứng viên',
  to: '/enterprise/applications',
  icon: 'uil:users-alt',
  children: [
    {
      name: 'Danh sách ứng viên',
      view: '',
      icon: 'uil:users-alt',
      description: 'Xem tất cả ứng viên'
    },
    {
      name: 'Ứng viên đã lưu',
      view: 'saved',
      icon: 'uil:bookmark',
      description: 'Ứng viên bạn đã lưu lại'
    },
    {
      name: 'Bị từ chối',
      view: 'rejected',
      icon: 'uil:times-circle',
      description: 'Ứng viên không phù hợp'
    }
  ]
}

const secondaryNavItems = computed<EnterpriseSidebarItem[]>(() => [
  { name: 'Lịch phỏng vấn', to: '/enterprise/interviews', icon: 'uil:clipboard-notes' },
  {
    name: 'Hội thoại',
    to: '/enterprise?view=messages',
    icon: 'uil:comment-alt-message',
    badge: messageUnreadCount.value,
    badgeClass: 'bg-sky-100 text-sky-700'
  }
])

const settingsNavItem: EnterpriseSidebarItem = {
  name: 'Cài đặt',
  to: '/enterprise/settings',
  icon: 'uil:setting'
}

const companyName = computed(() => authStore.user?.name || loadedCompanyProfile.value.company_name || authStore.user?.email?.split('@')[0] || 'Doanh nghiệp')
const companyAvatarSource = computed(() => {
  const user: any = authStore.user || {}
  return String(user.enterprise_profile?.logo_url || user.enterprise_profile?.avatar || user.enterpriseProfile?.logo_url || user.enterpriseProfile?.avatar || loadedCompanyProfile.value.logo_url || loadedCompanyProfile.value.avatar || user.logo_url || user.avatar || '').trim()
})
const companyAvatar = computed(() => companyLogoLoadFailed.value ? '' : resolveAssetUrl(companyAvatarSource.value))
const userEmail = computed(() => authStore.user?.email || '')
const userRoleLabel = computed(() => (authStore.userRole === 'ENTERPRISE' ? 'Tài khoản nhà tuyển dụng' : 'Phiên đăng nhập'))
const showKYBNotice = computed(() => authStore.enterpriseKybRequired && !authStore.enterpriseApproved)
const kybNoticeText = computed(() => {
  if (authStore.enterpriseKybStatus === 'REJECTED') {
    return 'Hồ sơ KYB của doanh nghiệp chưa đạt yêu cầu. Vui lòng kiểm tra thông báo và bổ sung giấy phép kinh doanh.'
  }
  return 'Tài khoản doanh nghiệp đang chờ xác minh KYB. Bạn có thể xem thông báo và nộp GPKD trong trang cài đặt.'
})
const kybNoticeActionLabel = computed(() => (authStore.enterpriseKybStatus === 'REJECTED' ? 'Gửi lại hồ sơ' : 'Cập nhật GPKD'))
const companyInitials = computed(() => {
  const source = companyName.value.trim() || 'DN'
  return source
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const isApplicationsSection = computed(() => route.path.startsWith('/enterprise/applications'))
const isApplicationFlyoutActive = computed(() => isSidebarCollapsed.value && showApplicationFlyout.value)
const isDashboardMessagesView = computed(() => {
  const view = Array.isArray(route.query.view) ? route.query.view[0] : route.query.view
  return route.path === '/enterprise' && view === 'messages'
})

const isRouteActive = (to: string, exact = false) => (
  exact ? route.path === to : route.path.startsWith(to)
)

const isPrimaryItemActive = (item: EnterpriseSidebarItem) => {
  if (isApplicationFlyoutActive.value) return false

  if (item.to === '/enterprise') {
    return route.path === '/enterprise' && !isDashboardMessagesView.value
  }
  if (item.to === '/enterprise/jobs' || item.to === '/enterprise/jobs/create') {
    return route.path === item.to
  }
  return isRouteActive(item.to)
}

const isSecondaryItemActive = (item: EnterpriseSidebarItem) => {
  if (isApplicationFlyoutActive.value) return false

  if (item.to === '/enterprise?view=messages') {
    return isDashboardMessagesView.value
  }
  return isRouteActive(item.to)
}

const isSettingsItemActive = computed(() => route.path === settingsNavItem.to && !isApplicationFlyoutActive.value)

const getApplicationRouteView = () => {
  const view = Array.isArray(route.query.view) ? route.query.view[0] : route.query.view
  return view === 'saved' || view === 'rejected' ? view : ''
}

const getApplicationChildTo = (item: EnterpriseApplicationChild) => {
  if (!item.view) return applicationNav.to
  return { path: applicationNav.to, query: { view: item.view } }
}

const isApplicationChildActive = (item: EnterpriseApplicationChild) => {
  if (route.path !== applicationNav.to) return false
  return getApplicationRouteView() === item.view
}

const lockedEnterpriseRoutePrefixes = ['/enterprise/jobs', '/enterprise/applications', '/enterprise/interviews']

const isEnterpriseFeatureLocked = (to: string) => {
  return authStore.userRole === 'ENTERPRISE'
    && !authStore.canAccessEnterpriseFeatures
    && lockedEnterpriseRoutePrefixes.some((prefix) => to === prefix || to.startsWith(`${prefix}/`))
}

const showEnterpriseFeatureLockedToast = () => {
  closeDropdowns()
  isSidebarOpen.value = false
  toast.warning(
    authStore.enterpriseKybStatus === 'REJECTED' ? 'Hồ sơ doanh nghiệp bị từ chối' : 'Doanh nghiệp đang chờ duyệt',
    authStore.enterpriseKybStatus === 'REJECTED'
      ? 'Bạn vẫn vào được dashboard. Vui lòng xem lý do từ chối và gửi lại hồ sơ trước khi dùng chức năng tuyển dụng.'
      : 'Bạn vẫn vào được dashboard. Các chức năng đăng việc, ứng viên và lịch phỏng vấn sẽ mở sau khi admin duyệt KYB.'
  )
}

const toggleApplicationNav = () => {
  if (isEnterpriseFeatureLocked(applicationNav.to)) {
    showEnterpriseFeatureLockedToast()
    return
  }
  if (isSidebarCollapsed.value) {
    showApplicationFlyout.value = !showApplicationFlyout.value
    return
  }
  showApplicationFlyout.value = false
  isApplicationNavOpen.value = !isApplicationNavOpen.value
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
  if (showNotifications.value) {
    loadHeaderNotifications()
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const closeDropdowns = () => {
  showUserMenu.value = false
  showNotifications.value = false
  showApplicationFlyout.value = false
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdowns()
  }
}

watch(() => route.path, (path) => {
  showApplicationFlyout.value = false
  if (path.startsWith('/enterprise/applications')) {
    isApplicationNavOpen.value = true
  }
})

watch(isSidebarCollapsed, (collapsed) => {
  showApplicationFlyout.value = false
  if (!collapsed && route.path.startsWith('/enterprise/applications')) {
    isApplicationNavOpen.value = true
  }
  persistEnterpriseUi()
})

watch(isApplicationNavOpen, persistEnterpriseUi)

watch(companyAvatarSource, () => {
  companyLogoLoadFailed.value = false
})

onMounted(() => {
  restoreEnterpriseUi()
  if (route.path.startsWith('/enterprise/applications')) isApplicationNavOpen.value = true
  if (process.client) {
    window.addEventListener('click', closeDropdowns)
    window.addEventListener('keydown', handleKeyDown)
  }
  loadHeaderNotifications()
  loadSidebarCounts()
  loadCompanyIdentity()
  sidebarCountTimer = setInterval(() => {
    loadSidebarCounts()
  }, 10000)
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('click', closeDropdowns)
    window.removeEventListener('keydown', handleKeyDown)
  }
  if (sidebarCountTimer) {
    clearInterval(sidebarCountTimer)
    sidebarCountTimer = null
  }
})

const handleLogout = () => {
  authStore.logout()
}

async function loadHeaderNotifications() {
  notificationLoading.value = true
  try {
    const listResponse: any = await NotificationService.list({ page: 1, page_size: 100 })
    headerNotifications.value = listResponse?.data?.items || []
    await loadNotificationUnreadCount()
  } catch {
    headerNotifications.value = []
    notificationUnreadCount.value = 0
  } finally {
    notificationLoading.value = false
  }
}

async function loadMessageUnreadCount() {
  try {
    const response: any = await ConversationService.unreadCount()
    messageUnreadCount.value = Number(response?.data?.unread_count || 0)
  } catch {
    messageUnreadCount.value = 0
  }
}

async function loadNotificationUnreadCount() {
  try {
    const response: any = await NotificationService.unreadCount()
    notificationUnreadCount.value = Number(response?.data?.unread_count || 0)
  } catch {
    notificationUnreadCount.value = 0
  }
}

async function loadSidebarCounts() {
  await Promise.all([
    loadNotificationUnreadCount(),
    loadMessageUnreadCount()
  ])
}

async function loadCompanyIdentity() {
  try {
    const response: any = await CompanyService.getProfile()
    const data = response?.data || response || {}
    const profile = data?.enterprise_profile || response?.enterprise_profile || data || {}
    loadedCompanyProfile.value = profile
    authStore.syncEnterprisePolicy({
      requireKyb: data?.enterprise_require_kyb !== false,
      kybStatus: profile?.kyb_status || profile?.status_kyb,
      businessLicenseUrl: profile?.gpkd_url,
      rejectReason: profile?.kyb_reject_reason
    })
  } catch {
    loadedCompanyProfile.value = {}
  }
}

function resolveAssetUrl(value?: string) {
  const source = String(value || '').trim()
  if (!source) return ''
  if (/^(?:https?:)?\/\//i.test(source) || source.startsWith('data:') || source.startsWith('blob:')) return source
  const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '')
  return `${backendOrigin}${source.startsWith('/') ? '' : '/'}${source}`
}

async function markEnterpriseNotificationsRead() {
  try {
    await NotificationService.markAllAsRead()
    await loadHeaderNotifications()
  } catch {
    // The full notifications page can still retry the operation.
  }
}

async function openEnterpriseNotification(item: any) {
  try {
    const unreadIDs = Array.isArray(item.unread_ids)
      ? item.unread_ids
      : (item.is_read ? [] : [item.id])
    if (unreadIDs.length > 0) {
      await Promise.all(unreadIDs.map((id: string | number) => NotificationService.markAsRead(id)))
      const readIDSet = new Set(unreadIDs.map(String))
      headerNotifications.value.forEach((notification) => {
        if (readIDSet.has(String(notification.id))) notification.is_read = true
      })
      notificationUnreadCount.value = Math.max(0, notificationUnreadCount.value - unreadIDs.length)
    }
  } catch {
    // Navigation remains useful even if read-state update fails.
  }

  const target = normalizeEnterpriseActionURL(item.action_url)
  closeDropdowns()
  if (target) {
    await navigateTo(target)
  }
}

function normalizeEnterpriseActionURL(value?: string) {
  if (!value) return '/enterprise/notifications'
  if (value.startsWith('/messages/')) {
    const conversationID = value.replace('/messages/', '').split('/')[0]
    return conversationID ? `/enterprise?view=messages&conversation=${conversationID}` : '/enterprise?view=messages'
  }
  if (value.startsWith('/enterprise/messages/')) {
    const conversationID = value.replace('/enterprise/messages/', '').split('/')[0]
    return conversationID ? `/enterprise?view=messages&conversation=${conversationID}` : '/enterprise?view=messages'
  }
  if (value === '/enterprise/messages') return '/enterprise?view=messages'
  if (value.startsWith('/enterprise/')) return value
  if (value.startsWith('/student/')) return '/enterprise/notifications'
  return '/enterprise/notifications'
}

function getNotificationIcon(type?: string) {
  if (type === 'KYB') return 'uil:shield-check'
  if (type === 'MESSAGE') return 'uil:comment-alt-message'
  if (type === 'INTERVIEW') return 'uil:calendar-alt'
  if (type === 'APPLICATION') return 'uil:user-plus'
  if (type === 'JOB') return 'uil:briefcase-alt'
  return 'uil:bell'
}

function getNotificationIconClass(type?: string) {
  if (type === 'KYB') return 'bg-cyan-50 text-cyan-700'
  if (type === 'MESSAGE') return 'bg-violet-50 text-violet-700'
  if (type === 'INTERVIEW') return 'bg-amber-50 text-amber-700'
  if (type === 'APPLICATION') return 'bg-emerald-50 text-emerald-700'
  if (type === 'JOB') return 'bg-sky-50 text-sky-700'
  return 'bg-slate-50 text-slate-600'
}
</script>

<style scoped>
.enterprise-sidebar {
  background:
    radial-gradient(circle at 20% 0%, rgba(37, 99, 235, 0.24), transparent 34%),
    linear-gradient(180deg, #071d3b 0%, #06162d 48%, #061427 100%);
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.22);
}

.enterprise-sidebar-brand img {
  background: linear-gradient(135deg, #2563eb, #0284c7);
}

.enterprise-sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(56, 189, 248, 0.65) rgba(15, 23, 42, 0.24);
  scrollbar-gutter: stable;
}

.enterprise-sidebar-scroll::-webkit-scrollbar {
  width: 0.45rem;
  height: 0.45rem;
}

.enterprise-sidebar-scroll::-webkit-scrollbar-track {
  margin: 0.75rem 0;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.26);
}

.enterprise-sidebar-scroll::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(14, 165, 233, 0.95), rgba(37, 99, 235, 0.86)) padding-box;
}

.enterprise-sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background:
    linear-gradient(180deg, rgba(56, 189, 248, 1), rgba(37, 99, 235, 0.95)) padding-box;
}

.enterprise-sidebar-scroll::-webkit-scrollbar-button {
  width: 0;
  height: 0;
  display: none;
}

.enterprise-sidebar nav a,
.enterprise-sidebar nav button {
  color: #cbd5e1;
}

.enterprise-sidebar nav a:hover,
.enterprise-sidebar nav button:hover {
  border-color: rgb(59 130 246 / 0.24);
  background: rgba(37, 99, 235, 0.2);
  color: #ffffff;
}

.enterprise-sidebar nav a[class*="bg-sky-50"],
.enterprise-sidebar nav button[class*="bg-sky-50"] {
  border-color: rgb(59 130 246 / 0.42);
  background: linear-gradient(135deg, rgb(37 99 235 / 0.92), rgb(14 116 218 / 0.88));
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.22);
}

.enterprise-sidebar-section-title {
  padding: 0.45rem 0.35rem 0.35rem;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
}

.enterprise-sidebar-section-divider {
  height: 1px;
  margin: 0.85rem 0 0.75rem;
  background: rgba(255, 255, 255, 0.12);
}

.enterprise-sidebar-kyb-card {
  border-color: rgba(245, 158, 11, 0.22);
  background: rgba(15, 35, 68, 0.78);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 18px 42px rgba(15, 23, 42, 0.18);
}

.enterprise-sidebar-kyb-card:hover {
  border-color: rgba(245, 158, 11, 0.42);
  background: rgba(17, 42, 81, 0.92);
}

.enterprise-sidebar-kyb-rail-card {
  width: 3.25rem;
  min-height: 3.25rem;
  margin-right: auto;
  margin-left: auto;
  border: 1px solid rgba(245, 158, 11, 0.48);
  border-radius: 0.9rem;
  background: rgba(245, 158, 11, 0.08);
  color: #fbbf24;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 14px 28px rgba(15, 23, 42, 0.18);
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

.enterprise-sidebar-kyb-rail-card:hover {
  border-color: rgba(251, 191, 36, 0.78);
  background: rgba(245, 158, 11, 0.15);
  color: #fde68a;
  transform: translateY(-1px);
}

.enterprise-sidebar nav .enterprise-sidebar-locked-item {
  border-color: rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.enterprise-sidebar nav .enterprise-sidebar-locked-item:hover {
  border-color: rgba(245, 158, 11, 0.28);
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
}

.enterprise-sidebar nav .enterprise-sidebar-locked-item .enterprise-sidebar-kyb {
  background: rgba(245, 158, 11, 0.16);
  color: #f59e0b;
}

.enterprise-sidebar .border-t {
  border-color: rgba(255, 255, 255, 0.1);
}

.enterprise-sidebar .border-t > div {
  background: rgba(255, 255, 255, 0.08);
}

.enterprise-sidebar .border-t p:first-child {
  color: #ffffff;
}

.enterprise-sidebar .border-t p:last-child {
  color: #94a3b8;
}

.enterprise-sidebar .border-t button {
  color: #fda4af;
}

.enterprise-sidebar-icon {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.enterprise-sidebar-icon :deep(.iconify) {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
}

.enterprise-sidebar-collapsed nav a,
.enterprise-sidebar-collapsed nav button {
  justify-content: center;
  width: 3.25rem;
  min-height: 3.25rem;
  margin-right: auto;
  margin-left: auto;
  border-radius: 0.9rem;
  padding: 0;
  position: relative;
}

.enterprise-sidebar-collapsed .enterprise-sidebar-icon {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.enterprise-sidebar-collapsed .enterprise-sidebar-icon :deep(.iconify) {
  width: 1.2rem;
  height: 1.2rem;
}

.enterprise-sidebar-collapsed .enterprise-sidebar-label,
.enterprise-sidebar-collapsed .enterprise-sidebar-kyb,
.enterprise-sidebar-collapsed .enterprise-sidebar-chevron,
.enterprise-sidebar-collapsed .enterprise-sidebar-section-title,
.enterprise-sidebar-collapsed .enterprise-sidebar-kyb-card,
.enterprise-sidebar-collapsed #enterprise-application-nav,
.enterprise-sidebar-collapsed .enterprise-sidebar-user-card,
.enterprise-sidebar-collapsed .enterprise-sidebar-logout-label {
  display: none;
}

.enterprise-sidebar-collapsed .enterprise-sidebar-section-divider {
  display: block;
  width: 3.25rem;
  height: 1px;
  margin: 0.9rem auto;
  background: rgba(148, 163, 184, 0.28);
}

.enterprise-sidebar-collapsed nav .iconify,
.enterprise-sidebar-collapsed .border-t button .iconify {
  display: inline-block;
  flex-shrink: 0;
}

.enterprise-sidebar-collapsed .border-t > div,
.enterprise-sidebar-collapsed .border-t button {
  justify-content: center;
}

.enterprise-sidebar-collapsed .sidebar-badge {
  position: absolute;
  right: 0.35rem;
  top: 0.35rem;
  display: inline-flex;
  min-width: 1.15rem;
  height: 1.15rem;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
}

.enterprise-sidebar-collapsed .application-flyout {
  display: block;
}

.enterprise-sidebar-collapsed .enterprise-sidebar-brand a:first-child {
  width: 3rem;
  height: 3rem;
  border-radius: 0.9rem;
}

.enterprise-sidebar-collapsed .enterprise-sidebar-brand img {
  width: 2.8rem;
  height: 2.8rem;
}

.enterprise-sidebar-collapsed nav a:not([class*="bg-sky-50"]),
.enterprise-sidebar-collapsed nav button:not([class*="bg-sky-50"]) {
  color: #dbeafe;
}

.enterprise-sidebar-collapsed nav a:hover,
.enterprise-sidebar-collapsed nav button:hover {
  border-color: rgba(59, 130, 246, 0.28);
  background: rgba(37, 99, 235, 0.24);
  color: #ffffff;
}

.enterprise-sidebar-collapsed nav a[class*="bg-sky-50"],
.enterprise-sidebar-collapsed nav button[class*="bg-sky-50"] {
  border-color: rgba(96, 165, 250, 0.36);
  background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 18px 32px rgba(37, 99, 235, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.application-flyout-arrow {
  position: absolute;
  left: -0.58rem;
  top: 5.1rem;
  width: 1.25rem;
  height: 1.25rem;
  transform: rotate(45deg);
  border-bottom: 1px solid rgb(226 232 240);
  border-left: 1px solid rgb(226 232 240);
  background: #ffffff;
  box-shadow: -10px 10px 24px rgba(15, 23, 42, 0.05);
}

.enterprise-sidebar.enterprise-sidebar-collapsed .application-flyout a {
  width: 100%;
  min-height: auto;
  margin-right: 0;
  margin-left: 0;
  justify-content: flex-start;
  border-radius: 0.85rem;
  color: #1e293b;
  background: transparent;
}

.enterprise-sidebar.enterprise-sidebar-collapsed .application-flyout a:hover {
  border-color: transparent;
  background: #f8fafc;
  color: #2563eb;
}

.enterprise-sidebar.enterprise-sidebar-collapsed .application-flyout .application-flyout-link-active {
  background: #f1f6ff;
  color: #2563eb;
}

.enterprise-sidebar.enterprise-sidebar-collapsed .application-flyout .application-flyout-icon-active {
  color: #2563eb;
}

.enterprise-sidebar.enterprise-sidebar-collapsed .application-flyout .application-flyout-icon-idle {
  color: #0f172a;
}

.enterprise-sidebar-collapsed .application-flyout svg {
  display: block;
}
</style>
