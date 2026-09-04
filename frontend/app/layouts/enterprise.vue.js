import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { ConversationService } from '~/services/conversation.service';
import { NotificationService } from '~/services/notification.service';
const authStore = useAuthStore();
const route = useRoute();
const toast = useToast();
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const showApplicationFlyout = ref(false);
const showUserMenu = ref(false);
const showNotifications = ref(false);
const isApplicationNavOpen = ref(route.path.startsWith('/enterprise/applications'));
const headerNotifications = ref([]);
const notificationUnreadCount = ref(0);
const messageUnreadCount = ref(0);
const notificationLoading = ref(false);
let sidebarCountTimer = null;
const primaryNavItems = [
    { name: 'Tổng quan', to: '/enterprise', icon: 'uil:home' },
    { name: 'Tin tuyển dụng', to: '/enterprise/jobs', icon: 'uil:file-alt' },
    { name: 'Tạo tin mới', to: '/enterprise/jobs/create', icon: 'uil:plus-circle' }
];
const applicationNav = {
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
};
const secondaryNavItems = computed(() => [
    { name: 'Lịch phỏng vấn', to: '/enterprise/interviews', icon: 'uil:clipboard-notes' },
    {
        name: 'Hội thoại',
        to: '/enterprise?view=messages',
        icon: 'uil:comment-alt-message',
        badge: messageUnreadCount.value,
        badgeClass: 'bg-sky-100 text-sky-700'
    }
]);
const disabledNavItems = [
    { name: 'Hồ sơ công ty', icon: 'uil:building' }
];
const settingsNavItem = {
    name: 'Cài đặt',
    to: '/enterprise/settings',
    icon: 'uil:setting'
};
const companyName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Doanh nghiệp');
const userEmail = computed(() => authStore.user?.email || '');
const userRoleLabel = computed(() => (authStore.userRole === 'ENTERPRISE' ? 'Tài khoản nhà tuyển dụng' : 'Phiên đăng nhập'));
const showKYBNotice = computed(() => authStore.userRole === 'ENTERPRISE' && !authStore.enterpriseApproved);
const kybNoticeText = computed(() => {
    if (authStore.enterpriseKybStatus === 'REJECTED') {
        return 'Hồ sơ KYB của doanh nghiệp chưa đạt yêu cầu. Vui lòng kiểm tra thông báo và bổ sung giấy phép kinh doanh.';
    }
    return 'Tài khoản doanh nghiệp đang chờ xác minh KYB. Bạn có thể xem thông báo và nộp GPKD trong trang cài đặt.';
});
const kybNoticeActionLabel = computed(() => (authStore.enterpriseKybStatus === 'REJECTED' ? 'Gửi lại hồ sơ' : 'Cập nhật GPKD'));
const companyInitials = computed(() => {
    const source = companyName.value.trim() || 'DN';
    return source
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
});
const isApplicationsSection = computed(() => route.path.startsWith('/enterprise/applications'));
const isApplicationFlyoutActive = computed(() => isSidebarCollapsed.value && showApplicationFlyout.value);
const isDashboardMessagesView = computed(() => {
    const view = Array.isArray(route.query.view) ? route.query.view[0] : route.query.view;
    return route.path === '/enterprise' && view === 'messages';
});
const isRouteActive = (to, exact = false) => (exact ? route.path === to : route.path.startsWith(to));
const isPrimaryItemActive = (item) => {
    if (isApplicationFlyoutActive.value)
        return false;
    if (item.to === '/enterprise') {
        return route.path === '/enterprise' && !isDashboardMessagesView.value;
    }
    if (item.to === '/enterprise/jobs' || item.to === '/enterprise/jobs/create') {
        return route.path === item.to;
    }
    return isRouteActive(item.to);
};
const isSecondaryItemActive = (item) => {
    if (isApplicationFlyoutActive.value)
        return false;
    if (item.to === '/enterprise?view=messages') {
        return isDashboardMessagesView.value;
    }
    return isRouteActive(item.to);
};
const isSettingsItemActive = computed(() => route.path === settingsNavItem.to && !isApplicationFlyoutActive.value);
const getApplicationRouteView = () => {
    const view = Array.isArray(route.query.view) ? route.query.view[0] : route.query.view;
    return view === 'saved' || view === 'rejected' ? view : '';
};
const getApplicationChildTo = (item) => {
    if (!item.view)
        return applicationNav.to;
    return { path: applicationNav.to, query: { view: item.view } };
};
const isApplicationChildActive = (item) => {
    if (route.path !== applicationNav.to)
        return false;
    return getApplicationRouteView() === item.view;
};
const lockedEnterpriseRoutePrefixes = ['/enterprise/jobs', '/enterprise/applications', '/enterprise/interviews'];
const isEnterpriseFeatureLocked = (to) => {
    return authStore.userRole === 'ENTERPRISE'
        && !authStore.enterpriseApproved
        && lockedEnterpriseRoutePrefixes.some((prefix) => to === prefix || to.startsWith(`${prefix}/`));
};
const showEnterpriseFeatureLockedToast = () => {
    closeDropdowns();
    isSidebarOpen.value = false;
    toast.warning(authStore.enterpriseKybStatus === 'REJECTED' ? 'Hồ sơ doanh nghiệp bị từ chối' : 'Doanh nghiệp đang chờ duyệt', authStore.enterpriseKybStatus === 'REJECTED'
        ? 'Bạn vẫn vào được dashboard. Vui lòng xem lý do từ chối và gửi lại hồ sơ trước khi dùng chức năng tuyển dụng.'
        : 'Bạn vẫn vào được dashboard. Các chức năng đăng việc, ứng viên và lịch phỏng vấn sẽ mở sau khi admin duyệt KYB.');
};
const toggleApplicationNav = () => {
    if (isEnterpriseFeatureLocked(applicationNav.to)) {
        showEnterpriseFeatureLockedToast();
        return;
    }
    if (isSidebarCollapsed.value) {
        showApplicationFlyout.value = !showApplicationFlyout.value;
        return;
    }
    showApplicationFlyout.value = false;
    isApplicationNavOpen.value = !isApplicationNavOpen.value;
};
const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
    showUserMenu.value = false;
    if (showNotifications.value) {
        loadHeaderNotifications();
    }
};
const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
    showNotifications.value = false;
};
const closeDropdowns = () => {
    showUserMenu.value = false;
    showNotifications.value = false;
    showApplicationFlyout.value = false;
};
const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        closeDropdowns();
    }
};
watch(() => route.path, (path) => {
    showApplicationFlyout.value = false;
    if (path.startsWith('/enterprise/applications')) {
        isApplicationNavOpen.value = true;
    }
});
watch(isSidebarCollapsed, (collapsed) => {
    showApplicationFlyout.value = false;
    if (!collapsed && route.path.startsWith('/enterprise/applications')) {
        isApplicationNavOpen.value = true;
    }
});
onMounted(() => {
    if (process.client) {
        window.addEventListener('click', closeDropdowns);
        window.addEventListener('keydown', handleKeyDown);
    }
    loadHeaderNotifications();
    loadSidebarCounts();
    sidebarCountTimer = setInterval(() => {
        loadSidebarCounts();
    }, 10000);
});
onUnmounted(() => {
    if (process.client) {
        window.removeEventListener('click', closeDropdowns);
        window.removeEventListener('keydown', handleKeyDown);
    }
    if (sidebarCountTimer) {
        clearInterval(sidebarCountTimer);
        sidebarCountTimer = null;
    }
});
const handleLogout = () => {
    authStore.logout();
};
async function loadHeaderNotifications() {
    notificationLoading.value = true;
    try {
        const listResponse = await NotificationService.list({ page: 1, page_size: 100 });
        headerNotifications.value = listResponse?.data?.items || [];
        await loadNotificationUnreadCount();
    }
    catch {
        headerNotifications.value = [];
        notificationUnreadCount.value = 0;
    }
    finally {
        notificationLoading.value = false;
    }
}
async function loadMessageUnreadCount() {
    try {
        const response = await ConversationService.unreadCount();
        messageUnreadCount.value = Number(response?.data?.unread_count || 0);
    }
    catch {
        messageUnreadCount.value = 0;
    }
}
async function loadNotificationUnreadCount() {
    try {
        const response = await NotificationService.unreadCount();
        notificationUnreadCount.value = Number(response?.data?.unread_count || 0);
    }
    catch {
        notificationUnreadCount.value = 0;
    }
}
async function loadSidebarCounts() {
    await Promise.all([
        loadNotificationUnreadCount(),
        loadMessageUnreadCount()
    ]);
}
async function markEnterpriseNotificationsRead() {
    try {
        await NotificationService.markAllAsRead();
        await loadHeaderNotifications();
    }
    catch {
        // The full notifications page can still retry the operation.
    }
}
async function openEnterpriseNotification(item) {
    try {
        if (!item.is_read) {
            await NotificationService.markAsRead(item.id);
            item.is_read = true;
            notificationUnreadCount.value = Math.max(0, notificationUnreadCount.value - 1);
        }
    }
    catch {
        // Navigation remains useful even if read-state update fails.
    }
    const target = normalizeEnterpriseActionURL(item.action_url);
    closeDropdowns();
    if (target) {
        await navigateTo(target);
    }
}
function normalizeEnterpriseActionURL(value) {
    if (!value)
        return '/enterprise/notifications';
    if (value.startsWith('/messages/')) {
        const conversationID = value.replace('/messages/', '').split('/')[0];
        return conversationID ? `/enterprise?view=messages&conversation=${conversationID}` : '/enterprise?view=messages';
    }
    if (value.startsWith('/enterprise/messages/')) {
        const conversationID = value.replace('/enterprise/messages/', '').split('/')[0];
        return conversationID ? `/enterprise?view=messages&conversation=${conversationID}` : '/enterprise?view=messages';
    }
    if (value === '/enterprise/messages')
        return '/enterprise?view=messages';
    if (value.startsWith('/enterprise/'))
        return value;
    if (value.startsWith('/student/'))
        return '/enterprise/notifications';
    return '/enterprise/notifications';
}
function getNotificationIcon(type) {
    if (type === 'KYB')
        return 'uil:shield-check';
    if (type === 'MESSAGE')
        return 'uil:comment-alt-message';
    if (type === 'INTERVIEW')
        return 'uil:calendar-alt';
    if (type === 'APPLICATION')
        return 'uil:user-plus';
    if (type === 'JOB')
        return 'uil:briefcase-alt';
    return 'uil:bell';
}
function getNotificationIconClass(type) {
    if (type === 'KYB')
        return 'bg-cyan-50 text-cyan-700';
    if (type === 'MESSAGE')
        return 'bg-violet-50 text-violet-700';
    if (type === 'INTERVIEW')
        return 'bg-amber-50 text-amber-700';
    if (type === 'APPLICATION')
        return 'bg-emerald-50 text-emerald-700';
    if (type === 'JOB')
        return 'bg-sky-50 text-sky-700';
    return 'bg-slate-50 text-slate-600';
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb-card']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb-rail-card']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-locked-item']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-locked-item']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['iconify']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb-card']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-section-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['iconify']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['iconify']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['application-flyout']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['application-flyout']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['application-flyout']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['application-flyout']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['application-flyout']} */ ;
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['application-flyout']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-[#f5f7fb] font-sans text-slate-900 antialiased" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#f5f7fb]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['antialiased']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: ([
            'sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur transition-[margin] duration-200',
            __VLS_ctx.isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        ]) },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-40']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/95']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-[margin]']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-full items-center justify-between px-4 sm:px-6 lg:px-8" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isSidebarOpen = !__VLS_ctx.isSidebarOpen;
            // @ts-ignore
            [isSidebarCollapsed, isSidebarOpen, isSidebarOpen,];
        } },
    ...{ class: "rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden" },
    'aria-label': "Mở menu",
});
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: "uil:bars",
    ...{ class: "h-5 w-5" },
}));
const __VLS_2 = __VLS_1({
    name: "uil:bars",
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    to: "/enterprise",
    ...{ class: "flex items-center gap-3 lg:hidden" },
}));
const __VLS_7 = __VLS_6({
    to: "/enterprise",
    ...{ class: "flex items-center gap-3 lg:hidden" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
const { default: __VLS_10 } = __VLS_8.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/images/brand/quickwork-icon-dark-transparent.png",
    alt: "QuickWork",
    ...{ class: "h-10 w-10 shrink-0 rounded-lg object-contain shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min-w-0" },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "block text-sm font-black leading-tight text-slate-950" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-sky-600" },
});
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "block text-[11px] font-semibold leading-tight text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
// @ts-ignore
[];
var __VLS_8;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-2 sm:gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleNotifications) },
    ...{ class: "relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" },
    'aria-label': "Thông báo",
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-slate-900']} */ ;
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    name: "uil:bell",
    ...{ class: "h-5 w-5" },
}));
const __VLS_13 = __VLS_12({
    name: "uil:bell",
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
if (__VLS_ctx.notificationUnreadCount > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['-right-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['-top-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    (__VLS_ctx.notificationUnreadCount > 9 ? '9+' : __VLS_ctx.notificationUnreadCount);
}
if (__VLS_ctx.showNotifications) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "absolute right-0 z-50 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    let __VLS_16;
    /** @ts-ignore @type { | typeof __VLS_components.UiNotificationDropdown} */
    UiNotificationDropdown;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        ...{ 'onMarkAllRead': {} },
        ...{ 'onOpen': {} },
        ...{ 'onClose': {} },
        title: "Thông báo tuyển dụng",
        unreadCount: (__VLS_ctx.notificationUnreadCount),
        loading: (__VLS_ctx.notificationLoading),
        items: (__VLS_ctx.headerNotifications),
        emptyText: "Chưa có thông báo tuyển dụng nào.",
        viewAllTo: "/enterprise/notifications",
        storageKey: "enterprise-header",
        getIcon: (__VLS_ctx.getNotificationIcon),
        getIconClass: (__VLS_ctx.getNotificationIconClass),
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onMarkAllRead': {} },
        ...{ 'onOpen': {} },
        ...{ 'onClose': {} },
        title: "Thông báo tuyển dụng",
        unreadCount: (__VLS_ctx.notificationUnreadCount),
        loading: (__VLS_ctx.notificationLoading),
        items: (__VLS_ctx.headerNotifications),
        emptyText: "Chưa có thông báo tuyển dụng nào.",
        viewAllTo: "/enterprise/notifications",
        storageKey: "enterprise-header",
        getIcon: (__VLS_ctx.getNotificationIcon),
        getIconClass: (__VLS_ctx.getNotificationIconClass),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_21;
    const __VLS_22 = {
        /** @type {typeof __VLS_21.markAllRead} */
        onMarkAllRead: (__VLS_ctx.markEnterpriseNotificationsRead),
    };
    const __VLS_23 = {
        /** @type {typeof __VLS_21.open} */
        onOpen: (__VLS_ctx.openEnterpriseNotification),
    };
    const __VLS_24 = {
        /** @type {typeof __VLS_21.close} */
        onClose: (__VLS_ctx.closeDropdowns),
    };
    var __VLS_19;
    var __VLS_20;
    if (false) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-b border-slate-100 px-4 py-3" },
        });
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-start justify-between gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "font-bold text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-0.5 text-xs text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.notificationUnreadCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.markEnterpriseNotificationsRead) },
            type: "button",
            ...{ class: "rounded-lg px-2 py-1 text-xs font-black text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50" },
            disabled: (__VLS_ctx.notificationUnreadCount === 0),
        });
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
        if (__VLS_ctx.notificationLoading) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2 px-4 py-4" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            for (const [index] of __VLS_vFor((3))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
                    key: (index),
                    ...{ class: "h-14 animate-pulse rounded-xl bg-slate-100" },
                });
                /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
                /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
                // @ts-ignore
                [toggleNotifications, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, showNotifications, notificationLoading, notificationLoading, headerNotifications, getNotificationIcon, getNotificationIconClass, markEnterpriseNotificationsRead, markEnterpriseNotificationsRead, openEnterpriseNotification, closeDropdowns,];
            }
        }
        else if (__VLS_ctx.headerNotifications.length === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "px-4 py-5 text-sm font-semibold text-slate-500" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "max-h-80 divide-y divide-slate-100 overflow-y-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['max-h-80']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-slate-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
            for (const [item] of __VLS_vFor((__VLS_ctx.headerNotifications))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.showNotifications))
                                return;
                            if (!(false))
                                return;
                            if (!!(__VLS_ctx.notificationLoading))
                                return;
                            if (!!(__VLS_ctx.headerNotifications.length === 0))
                                return;
                            __VLS_ctx.openEnterpriseNotification(item);
                            // @ts-ignore
                            [headerNotifications, headerNotifications, openEnterpriseNotification,];
                        } },
                    key: (item.id),
                    type: "button",
                    ...{ class: "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-sky-50/70" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50/70']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: (['mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', __VLS_ctx.getNotificationIconClass(item.type)]) },
                });
                /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                let __VLS_25;
                /** @ts-ignore @type { | typeof __VLS_components.Icon} */
                Icon;
                // @ts-ignore
                const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
                    name: (__VLS_ctx.getNotificationIcon(item.type)),
                    ...{ class: "h-4.5 w-4.5" },
                }));
                const __VLS_27 = __VLS_26({
                    name: (__VLS_ctx.getNotificationIcon(item.type)),
                    ...{ class: "h-4.5 w-4.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_26));
                /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "min-w-0 flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex items-center gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "truncate text-sm font-black text-slate-950" },
                });
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
                (item.title || 'Thông báo');
                if (!item.is_read) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
                        ...{ class: "h-2 w-2 shrink-0 rounded-full bg-sky-500" },
                    });
                    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-sky-500']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "mt-0.5 line-clamp-2 block text-xs font-semibold leading-5 text-slate-500" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
                (item.content);
                // @ts-ignore
                [getNotificationIcon, getNotificationIconClass,];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-t border-slate-100 p-3" },
        });
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        let __VLS_30;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
            ...{ 'onClick': {} },
            to: "/enterprise/notifications",
            ...{ class: "flex h-10 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100" },
        }));
        const __VLS_32 = __VLS_31({
            ...{ 'onClick': {} },
            to: "/enterprise/notifications",
            ...{ class: "flex h-10 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        let __VLS_35;
        const __VLS_36 = {
            /** @type {typeof __VLS_35.click} */
            onClick: (__VLS_ctx.closeDropdowns),
        };
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-100']} */ ;
        const { default: __VLS_37 } = __VLS_33.slots;
        // @ts-ignore
        [closeDropdowns,];
        var __VLS_33;
        var __VLS_34;
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleUserMenu) },
    ...{ class: "flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-100" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-xs font-black text-white" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-9']} */ ;
/** @type {__VLS_StyleScopedClasses['w-9']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
(__VLS_ctx.companyInitials);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hidden min-w-0 text-left sm:block" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "block max-w-36 truncate text-xs font-bold text-slate-800" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-36']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
(__VLS_ctx.companyName);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "block max-w-36 truncate text-[11px] text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-36']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(__VLS_ctx.userEmail || 'Tài khoản doanh nghiệp');
let __VLS_38;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    name: "uil:angle-down",
    ...{ class: "hidden h-4 w-4 text-slate-400 sm:block" },
}));
const __VLS_40 = __VLS_39({
    name: "uil:angle-down",
    ...{ class: "hidden h-4 w-4 text-slate-400 sm:block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
let __VLS_43;
/** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "scale-95 opacity-0",
    enterToClass: "scale-100 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "scale-100 opacity-100",
    leaveToClass: "scale-95 opacity-0",
}));
const __VLS_45 = __VLS_44({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "scale-95 opacity-0",
    enterToClass: "scale-100 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "scale-100 opacity-100",
    leaveToClass: "scale-95 opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const { default: __VLS_48 } = __VLS_46.slots;
if (__VLS_ctx.showUserMenu) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-64']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-b border-slate-100 px-4 py-3" },
    });
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "truncate font-bold text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    (__VLS_ctx.companyName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-0.5 truncate text-xs text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.userEmail || 'Chưa có email trong phiên đăng nhập');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "py-1" },
    });
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    let __VLS_49;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        ...{ 'onClick': {} },
        to: (__VLS_ctx.isEnterpriseFeatureLocked('/enterprise/jobs') ? '/enterprise' : '/enterprise/jobs'),
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }));
    const __VLS_51 = __VLS_50({
        ...{ 'onClick': {} },
        to: (__VLS_ctx.isEnterpriseFeatureLocked('/enterprise/jobs') ? '/enterprise' : '/enterprise/jobs'),
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    let __VLS_54;
    const __VLS_55 = {
        /** @type {typeof __VLS_54.click} */
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showUserMenu))
                return;
            __VLS_ctx.isEnterpriseFeatureLocked('/enterprise/jobs') ? __VLS_ctx.showEnterpriseFeatureLockedToast() : __VLS_ctx.closeDropdowns();
            // @ts-ignore
            [closeDropdowns, toggleUserMenu, companyInitials, companyName, companyName, userEmail, userEmail, showUserMenu, isEnterpriseFeatureLocked, isEnterpriseFeatureLocked, showEnterpriseFeatureLockedToast,];
        },
    };
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
    const { default: __VLS_56 } = __VLS_52.slots;
    let __VLS_57;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        name: "uil:file-alt",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }));
    const __VLS_59 = __VLS_58({
        name: "uil:file-alt",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_52;
    var __VLS_53;
    let __VLS_62;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        ...{ 'onClick': {} },
        to: (__VLS_ctx.isEnterpriseFeatureLocked('/enterprise/jobs/create') ? '/enterprise' : '/enterprise/jobs/create'),
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }));
    const __VLS_64 = __VLS_63({
        ...{ 'onClick': {} },
        to: (__VLS_ctx.isEnterpriseFeatureLocked('/enterprise/jobs/create') ? '/enterprise' : '/enterprise/jobs/create'),
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    let __VLS_67;
    const __VLS_68 = {
        /** @type {typeof __VLS_67.click} */
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showUserMenu))
                return;
            __VLS_ctx.isEnterpriseFeatureLocked('/enterprise/jobs/create') ? __VLS_ctx.showEnterpriseFeatureLockedToast() : __VLS_ctx.closeDropdowns();
            // @ts-ignore
            [closeDropdowns, isEnterpriseFeatureLocked, isEnterpriseFeatureLocked, showEnterpriseFeatureLockedToast,];
        },
    };
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
    const { default: __VLS_69 } = __VLS_65.slots;
    let __VLS_70;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
        name: "uil:plus-circle",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }));
    const __VLS_72 = __VLS_71({
        name: "uil:plus-circle",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_65;
    var __VLS_66;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleLogout) },
        ...{ class: "flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left font-bold text-rose-600 transition hover:bg-rose-50" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-rose-50']} */ ;
    let __VLS_75;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
        name: "uil:sign-out-alt",
        ...{ class: "h-4.5 w-4.5" },
    }));
    const __VLS_77 = __VLS_76({
        name: "uil:sign-out-alt",
        ...{ class: "h-4.5 w-4.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[handleLogout,];
var __VLS_46;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative flex min-h-[calc(100vh-4rem)]" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[calc(100vh-4rem)]']} */ ;
if (__VLS_ctx.isSidebarOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isSidebarOpen))
                    return;
                __VLS_ctx.isSidebarOpen = false;
                // @ts-ignore
                [isSidebarOpen, isSidebarOpen,];
            } },
        ...{ class: "fixed inset-0 z-30 bg-slate-950/40 lg:hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: ([
            'enterprise-sidebar fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-900 bg-slate-950 pt-16 text-white transition-[transform,width] duration-200 lg:translate-x-0 lg:rounded-r-2xl lg:pt-0',
            __VLS_ctx.isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            __VLS_ctx.isSidebarCollapsed ? 'enterprise-sidebar-collapsed lg:w-20' : 'lg:w-72'
        ]) },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['w-72']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-16']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-[transform,width]']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:translate-x-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:rounded-r-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:pt-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: (['enterprise-sidebar-scroll flex h-full flex-col justify-between overflow-y-auto pb-6', __VLS_ctx.isSidebarCollapsed ? 'px-3' : 'px-4']) },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: (['enterprise-sidebar-brand mb-4 flex h-16 items-center border-b border-white/10', __VLS_ctx.isSidebarCollapsed ? 'justify-center' : 'gap-3 px-2']) },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
let __VLS_80;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    to: "/enterprise",
    ...{ class: "flex shrink-0 items-center justify-center rounded-xl bg-sky-600 shadow-lg shadow-sky-950/30" },
}));
const __VLS_82 = __VLS_81({
    to: "/enterprise",
    ...{ class: "flex shrink-0 items-center justify-center rounded-xl bg-sky-600 shadow-lg shadow-sky-950/30" },
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sky-950/30']} */ ;
const { default: __VLS_85 } = __VLS_83.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/images/brand/quickwork-icon-dark-transparent.png",
    alt: "QuickWork",
    ...{ class: "h-10 w-10 rounded-xl object-contain" },
});
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
// @ts-ignore
[isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, isSidebarOpen,];
var __VLS_83;
if (!__VLS_ctx.isSidebarCollapsed) {
    let __VLS_86;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
        to: "/enterprise",
        ...{ class: "min-w-0" },
    }));
    const __VLS_88 = __VLS_87({
        to: "/enterprise",
        ...{ class: "min-w-0" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    const { default: __VLS_91 } = __VLS_89.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block truncate text-lg font-black leading-tight text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sky-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sky-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-0.5 block truncate text-xs font-semibold text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    // @ts-ignore
    [isSidebarCollapsed,];
    var __VLS_89;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isSidebarCollapsed = !__VLS_ctx.isSidebarCollapsed;
            // @ts-ignore
            [isSidebarCollapsed, isSidebarCollapsed,];
        } },
    type: "button",
    ...{ class: "enterprise-collapse-handle hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-slate-800 shadow-md shadow-slate-950/20 ring-2 ring-slate-100 transition hover:border-sky-500 hover:bg-sky-600 hover:text-white hover:ring-sky-100 lg:absolute lg:-right-3 lg:top-8 lg:flex lg:-translate-y-1/2" },
    'aria-label': (__VLS_ctx.isSidebarCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'),
});
/** @type {__VLS_StyleScopedClasses['enterprise-collapse-handle']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-sky-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-950/20']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-sky-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:-right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:top-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:-translate-y-1/2']} */ ;
let __VLS_92;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
    name: (__VLS_ctx.isSidebarCollapsed ? 'uil:angle-right-b' : 'uil:angle-left-b'),
    ...{ class: "h-4 w-4" },
}));
const __VLS_94 = __VLS_93({
    name: (__VLS_ctx.isSidebarCollapsed ? 'uil:angle-right-b' : 'uil:angle-left-b'),
    ...{ class: "h-4 w-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
if (__VLS_ctx.showKYBNotice && !__VLS_ctx.isSidebarCollapsed) {
    let __VLS_97;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        ...{ 'onClick': {} },
        to: "/enterprise/settings",
        ...{ class: "enterprise-sidebar-kyb-card mb-6 flex items-center gap-3 rounded-2xl border px-4 py-4 transition hover:-translate-y-0.5" },
    }));
    const __VLS_99 = __VLS_98({
        ...{ 'onClick': {} },
        to: "/enterprise/settings",
        ...{ class: "enterprise-sidebar-kyb-card mb-6 flex items-center gap-3 rounded-2xl border px-4 py-4 transition hover:-translate-y-0.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    let __VLS_102;
    const __VLS_103 = {
        /** @type {typeof __VLS_102.click} */
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showKYBNotice && !__VLS_ctx.isSidebarCollapsed))
                return;
            __VLS_ctx.isSidebarOpen = false;
            // @ts-ignore
            [isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, isSidebarOpen, showKYBNotice,];
        },
    };
    /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-0.5']} */ ;
    const { default: __VLS_104 } = __VLS_100.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-amber-400" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    let __VLS_105;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        name: "uil:shield-exclamation",
        ...{ class: "h-6 w-6" },
    }));
    const __VLS_107 = __VLS_106({
        name: "uil:shield-exclamation",
        ...{ class: "h-6 w-6" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "min-w-0 flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block truncate text-sm font-black text-amber-300" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    (__VLS_ctx.authStore.enterpriseKybStatus === 'REJECTED' ? 'Hồ sơ KYB bị từ chối' : 'Tài khoản chưa được duyệt KYB');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-1 block truncate text-xs font-semibold text-slate-300" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    (__VLS_ctx.authStore.enterpriseKybStatus === 'REJECTED' ? 'Xem lý do và gửi lại hồ sơ' : 'Hoàn tất hồ sơ để kích hoạt');
    let __VLS_110;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
        name: "uil:angle-right-b",
        ...{ class: "h-5 w-5 shrink-0 text-slate-200" },
        'aria-hidden': "true",
    }));
    const __VLS_112 = __VLS_111({
        name: "uil:angle-right-b",
        ...{ class: "h-5 w-5 shrink-0 text-slate-200" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
    // @ts-ignore
    [authStore, authStore,];
    var __VLS_100;
    var __VLS_101;
}
if (__VLS_ctx.showKYBNotice && __VLS_ctx.isSidebarCollapsed) {
    let __VLS_115;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
        ...{ 'onClick': {} },
        to: "/enterprise/settings",
        ...{ class: "enterprise-sidebar-kyb-rail-card mb-4 flex items-center justify-center" },
        'aria-label': "Cap nhat KYB",
    }));
    const __VLS_117 = __VLS_116({
        ...{ 'onClick': {} },
        to: "/enterprise/settings",
        ...{ class: "enterprise-sidebar-kyb-rail-card mb-4 flex items-center justify-center" },
        'aria-label': "Cap nhat KYB",
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    let __VLS_120;
    const __VLS_121 = {
        /** @type {typeof __VLS_120.click} */
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showKYBNotice && __VLS_ctx.isSidebarCollapsed))
                return;
            __VLS_ctx.isSidebarOpen = false;
            // @ts-ignore
            [isSidebarCollapsed, isSidebarOpen, showKYBNotice,];
        },
    };
    /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb-rail-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    const { default: __VLS_122 } = __VLS_118.slots;
    let __VLS_123;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
        name: "uil:shield-exclamation",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_125 = __VLS_124({
        name: "uil:shield-exclamation",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [];
    var __VLS_118;
    var __VLS_119;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "space-y-1.5 text-sm font-semibold" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "enterprise-sidebar-section-title" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-section-title']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.primaryNavItems.slice(0, 1)))) {
    __VLS_asFunctionalElement(__VLS_intrinsics.template)({
        key: (item.to),
    });
    if (!__VLS_ctx.isEnterpriseFeatureLocked(item.to)) {
        let __VLS_128;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
            ...{ 'onClick': {} },
            to: (item.to),
            ...{ class: ([
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                    __VLS_ctx.isPrimaryItemActive(item)
                        ? 'border-sky-100 bg-sky-50 text-sky-700'
                        : 'border-transparent text-slate-600'
                ]) },
        }));
        const __VLS_130 = __VLS_129({
            ...{ 'onClick': {} },
            to: (item.to),
            ...{ class: ([
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                    __VLS_ctx.isPrimaryItemActive(item)
                        ? 'border-sky-100 bg-sky-50 text-sky-700'
                        : 'border-transparent text-slate-600'
                ]) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        let __VLS_133;
        const __VLS_134 = {
            /** @type {typeof __VLS_133.click} */
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isEnterpriseFeatureLocked(item.to)))
                    return;
                __VLS_ctx.isSidebarOpen = false;
                // @ts-ignore
                [isSidebarOpen, isEnterpriseFeatureLocked, primaryNavItems, isPrimaryItemActive,];
            },
        };
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-slate-950']} */ ;
        const { default: __VLS_135 } = __VLS_131.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
        let __VLS_136;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_138 = __VLS_137({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-label" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
        (item.name);
        // @ts-ignore
        [];
        var __VLS_131;
        var __VLS_132;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.showEnterpriseFeatureLockedToast) },
            type: "button",
            ...{ class: "enterprise-sidebar-locked-item flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-locked-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
        let __VLS_141;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_143 = __VLS_142({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-label" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
        (item.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-kyb ml-auto rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-amber-700" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
    }
    // @ts-ignore
    [showEnterpriseFeatureLockedToast,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "enterprise-sidebar-section-divider" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-section-divider']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "enterprise-sidebar-section-title" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-section-title']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.primaryNavItems.slice(1)))) {
    __VLS_asFunctionalElement(__VLS_intrinsics.template)({
        key: (item.to),
    });
    if (!__VLS_ctx.isEnterpriseFeatureLocked(item.to)) {
        let __VLS_146;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
            ...{ 'onClick': {} },
            to: (item.to),
            ...{ class: ([
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                    __VLS_ctx.isPrimaryItemActive(item)
                        ? 'border-sky-100 bg-sky-50 text-sky-700'
                        : 'border-transparent text-slate-600'
                ]) },
        }));
        const __VLS_148 = __VLS_147({
            ...{ 'onClick': {} },
            to: (item.to),
            ...{ class: ([
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                    __VLS_ctx.isPrimaryItemActive(item)
                        ? 'border-sky-100 bg-sky-50 text-sky-700'
                        : 'border-transparent text-slate-600'
                ]) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_147));
        let __VLS_151;
        const __VLS_152 = {
            /** @type {typeof __VLS_151.click} */
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isEnterpriseFeatureLocked(item.to)))
                    return;
                __VLS_ctx.isSidebarOpen = false;
                // @ts-ignore
                [isSidebarOpen, isEnterpriseFeatureLocked, primaryNavItems, isPrimaryItemActive,];
            },
        };
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-slate-950']} */ ;
        const { default: __VLS_153 } = __VLS_149.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
        let __VLS_154;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_156 = __VLS_155({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_155));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-label" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
        (item.name);
        // @ts-ignore
        [];
        var __VLS_149;
        var __VLS_150;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.showEnterpriseFeatureLockedToast) },
            type: "button",
            ...{ class: "enterprise-sidebar-locked-item flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-locked-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
        let __VLS_159;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_161 = __VLS_160({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_160));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-label" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
        (item.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-kyb ml-auto rounded px-1.5 py-0.5 text-[10px] font-black" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    }
    // @ts-ignore
    [showEnterpriseFeatureLockedToast,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative space-y-1" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleApplicationNav) },
    type: "button",
    ...{ class: ([
            'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition',
            __VLS_ctx.isEnterpriseFeatureLocked(__VLS_ctx.applicationNav.to)
                ? 'enterprise-sidebar-locked-item'
                : __VLS_ctx.isApplicationsSection || __VLS_ctx.isApplicationFlyoutActive
                    ? 'border-sky-100 bg-sky-50 text-sky-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
        ]) },
    'aria-expanded': (__VLS_ctx.isApplicationNavOpen),
    'aria-controls': "enterprise-application-nav",
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "enterprise-sidebar-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
let __VLS_164;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
    name: (__VLS_ctx.applicationNav.icon),
    ...{ class: "h-5 w-5" },
}));
const __VLS_166 = __VLS_165({
    name: (__VLS_ctx.applicationNav.icon),
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "enterprise-sidebar-label min-w-0 flex-1" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
(__VLS_ctx.applicationNav.name);
if (!__VLS_ctx.isSidebarCollapsed) {
    let __VLS_169;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
        name: "uil:angle-down",
        ...{ class: (['enterprise-sidebar-chevron h-4 w-4 shrink-0 transition-transform duration-200', __VLS_ctx.isApplicationNavOpen ? 'rotate-180' : '']) },
    }));
    const __VLS_171 = __VLS_170({
        name: "uil:angle-down",
        ...{ class: (['enterprise-sidebar-chevron h-4 w-4 shrink-0 transition-transform duration-200', __VLS_ctx.isApplicationNavOpen ? 'rotate-180' : '']) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-chevron']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
}
if (__VLS_ctx.isEnterpriseFeatureLocked(__VLS_ctx.applicationNav.to)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "enterprise-sidebar-kyb rounded px-1.5 py-0.5 text-[10px] font-black" },
    });
    /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
}
if (__VLS_ctx.isSidebarCollapsed && __VLS_ctx.showApplicationFlyout) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "application-flyout fixed left-[5.75rem] top-[13.25rem] z-50 w-64 overflow-visible rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-2xl shadow-slate-950/15 ring-1 ring-slate-100" },
    });
    /** @type {__VLS_StyleScopedClasses['application-flyout']} */ ;
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[5.75rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[13.25rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-64']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-visible']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-950/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-slate-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "application-flyout-arrow" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['application-flyout-arrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-3 pb-3 pt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[12px] font-black uppercase tracking-wide text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[12px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-2 text-sm font-semibold leading-5 text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "mx-3 h-px bg-slate-100" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.applicationNav.children))) {
        let __VLS_174;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
            ...{ 'onClick': {} },
            key: (`flyout-${item.name}`),
            to: (__VLS_ctx.getApplicationChildTo(item)),
            ...{ class: ([
                    'application-flyout-link mt-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                    __VLS_ctx.isApplicationChildActive(item)
                        ? 'application-flyout-link-active'
                        : 'application-flyout-link-idle'
                ]) },
        }));
        const __VLS_176 = __VLS_175({
            ...{ 'onClick': {} },
            key: (`flyout-${item.name}`),
            to: (__VLS_ctx.getApplicationChildTo(item)),
            ...{ class: ([
                    'application-flyout-link mt-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                    __VLS_ctx.isApplicationChildActive(item)
                        ? 'application-flyout-link-active'
                        : 'application-flyout-link-idle'
                ]) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_175));
        let __VLS_179;
        const __VLS_180 = {
            /** @type {typeof __VLS_179.click} */
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.isSidebarCollapsed && __VLS_ctx.showApplicationFlyout))
                    return;
                __VLS_ctx.showApplicationFlyout = false;
                __VLS_ctx.isSidebarOpen = false;
                // @ts-ignore
                [isSidebarCollapsed, isSidebarCollapsed, isSidebarOpen, isEnterpriseFeatureLocked, isEnterpriseFeatureLocked, toggleApplicationNav, applicationNav, applicationNav, applicationNav, applicationNav, applicationNav, isApplicationsSection, isApplicationFlyoutActive, isApplicationNavOpen, isApplicationNavOpen, showApplicationFlyout, showApplicationFlyout, getApplicationChildTo, isApplicationChildActive,];
            },
        };
        /** @type {__VLS_StyleScopedClasses['application-flyout-link']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        const { default: __VLS_181 } = __VLS_177.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: ([
                    'flex h-8 w-8 shrink-0 items-center justify-center',
                    __VLS_ctx.isApplicationChildActive(item)
                        ? 'application-flyout-icon-active'
                        : 'application-flyout-icon-idle'
                ]) },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        let __VLS_182;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_184 = __VLS_183({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_183));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "min-w-0" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "block truncate text-sm font-black leading-5" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        (item.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mt-0.5 block truncate text-xs font-semibold leading-5 text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (item.description);
        // @ts-ignore
        [isApplicationChildActive,];
        var __VLS_177;
        var __VLS_178;
        // @ts-ignore
        [];
    }
}
let __VLS_187;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "-translate-y-1 opacity-0",
    enterToClass: "translate-y-0 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "translate-y-0 opacity-100",
    leaveToClass: "-translate-y-1 opacity-0",
}));
const __VLS_189 = __VLS_188({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "-translate-y-1 opacity-0",
    enterToClass: "translate-y-0 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "translate-y-0 opacity-100",
    leaveToClass: "-translate-y-1 opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_188));
const { default: __VLS_192 } = __VLS_190.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    id: "enterprise-application-nav",
    ...{ class: "ml-5 space-y-1 border-l border-slate-200 pl-4" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.isApplicationNavOpen) }, null, null);
/** @type {__VLS_StyleScopedClasses['ml-5']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.applicationNav.children))) {
    let __VLS_193;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
        ...{ 'onClick': {} },
        key: (item.name),
        to: (__VLS_ctx.getApplicationChildTo(item)),
        ...{ class: ([
                'block rounded-lg px-3 py-2 text-sm transition',
                __VLS_ctx.isApplicationChildActive(item)
                    ? 'bg-sky-50 font-black text-sky-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            ]) },
    }));
    const __VLS_195 = __VLS_194({
        ...{ 'onClick': {} },
        key: (item.name),
        to: (__VLS_ctx.getApplicationChildTo(item)),
        ...{ class: ([
                'block rounded-lg px-3 py-2 text-sm transition',
                __VLS_ctx.isApplicationChildActive(item)
                    ? 'bg-sky-50 font-black text-sky-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            ]) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
    let __VLS_198;
    const __VLS_199 = {
        /** @type {typeof __VLS_198.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.isSidebarOpen = false;
            // @ts-ignore
            [isSidebarOpen, applicationNav, isApplicationNavOpen, getApplicationChildTo, isApplicationChildActive,];
        },
    };
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    const { default: __VLS_200 } = __VLS_196.slots;
    (item.name);
    // @ts-ignore
    [];
    var __VLS_196;
    var __VLS_197;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_190;
for (const [item] of __VLS_vFor((__VLS_ctx.secondaryNavItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsics.template)({
        key: (item.to),
    });
    if (!__VLS_ctx.isEnterpriseFeatureLocked(item.to)) {
        let __VLS_201;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_202 = __VLS_asFunctionalComponent1(__VLS_201, new __VLS_201({
            ...{ 'onClick': {} },
            to: (item.to),
            ...{ class: ([
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                    __VLS_ctx.isSecondaryItemActive(item)
                        ? 'border-sky-100 bg-sky-50 text-sky-700'
                        : 'border-transparent text-slate-600'
                ]) },
        }));
        const __VLS_203 = __VLS_202({
            ...{ 'onClick': {} },
            to: (item.to),
            ...{ class: ([
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
                    __VLS_ctx.isSecondaryItemActive(item)
                        ? 'border-sky-100 bg-sky-50 text-sky-700'
                        : 'border-transparent text-slate-600'
                ]) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_202));
        let __VLS_206;
        const __VLS_207 = {
            /** @type {typeof __VLS_206.click} */
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isEnterpriseFeatureLocked(item.to)))
                    return;
                __VLS_ctx.isSidebarOpen = false;
                // @ts-ignore
                [isSidebarOpen, isEnterpriseFeatureLocked, secondaryNavItems, isSecondaryItemActive,];
            },
        };
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-slate-950']} */ ;
        const { default: __VLS_208 } = __VLS_204.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
        let __VLS_209;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_211 = __VLS_210({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_210));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-label" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
        (item.name);
        if (item.badge) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: ([
                        'sidebar-badge ml-auto rounded-full px-2 py-0.5 text-[10px] font-black',
                        item.badgeClass || 'bg-rose-100 text-rose-600'
                    ]) },
            });
            /** @type {__VLS_StyleScopedClasses['sidebar-badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            (item.badge > 99 ? '99+' : item.badge);
        }
        // @ts-ignore
        [];
        var __VLS_204;
        var __VLS_205;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.showEnterpriseFeatureLockedToast) },
            type: "button",
            ...{ class: "enterprise-sidebar-locked-item flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-locked-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
        let __VLS_214;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_215 = __VLS_asFunctionalComponent1(__VLS_214, new __VLS_214({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_216 = __VLS_215({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_215));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-label" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
        (item.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "enterprise-sidebar-kyb ml-auto rounded px-1.5 py-0.5 text-[10px] font-black" },
        });
        /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    }
    // @ts-ignore
    [showEnterpriseFeatureLockedToast,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "enterprise-sidebar-section-divider" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-section-divider']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "enterprise-sidebar-section-title" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-section-title']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.disabledNavItems))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        key: (item.name),
        ...{ class: "flex w-full cursor-not-allowed items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-slate-400" },
        type: "button",
        disabled: true,
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "enterprise-sidebar-icon" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
    let __VLS_219;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_220 = __VLS_asFunctionalComponent1(__VLS_219, new __VLS_219({
        name: (item.icon),
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_221 = __VLS_220({
        name: (item.icon),
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_220));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "enterprise-sidebar-label" },
    });
    /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
    (item.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "enterprise-sidebar-kyb ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['enterprise-sidebar-kyb']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    // @ts-ignore
    [disabledNavItems,];
}
let __VLS_224;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent1(__VLS_224, new __VLS_224({
    ...{ 'onClick': {} },
    to: (__VLS_ctx.settingsNavItem.to),
    ...{ class: ([
            'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
            __VLS_ctx.isSettingsItemActive ? 'border-sky-100 bg-sky-50 text-sky-700' : 'border-transparent text-slate-600'
        ]) },
}));
const __VLS_226 = __VLS_225({
    ...{ 'onClick': {} },
    to: (__VLS_ctx.settingsNavItem.to),
    ...{ class: ([
            'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:bg-slate-50 hover:text-slate-950',
            __VLS_ctx.isSettingsItemActive ? 'border-sky-100 bg-sky-50 text-sky-700' : 'border-transparent text-slate-600'
        ]) },
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
let __VLS_229;
const __VLS_230 = {
    /** @type {typeof __VLS_229.click} */
    onClick: (...[$event]) => {
        __VLS_ctx.isSidebarOpen = false;
        // @ts-ignore
        [isSidebarOpen, settingsNavItem, isSettingsItemActive,];
    },
};
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-slate-950']} */ ;
const { default: __VLS_231 } = __VLS_227.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "enterprise-sidebar-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
let __VLS_232;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent1(__VLS_232, new __VLS_232({
    name: (__VLS_ctx.settingsNavItem.icon),
    ...{ class: "h-5 w-5" },
}));
const __VLS_234 = __VLS_233({
    name: (__VLS_ctx.settingsNavItem.icon),
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "enterprise-sidebar-label" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-label']} */ ;
(__VLS_ctx.settingsNavItem.name);
// @ts-ignore
[settingsNavItem, settingsNavItem,];
var __VLS_227;
var __VLS_228;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "enterprise-sidebar-footer border-t border-slate-100 pt-5" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "enterprise-sidebar-user-card flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-sky-700 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
(__VLS_ctx.companyInitials);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-w-0" },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "truncate text-sm font-bold text-slate-900" },
});
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
(__VLS_ctx.companyName);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "truncate text-xs text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(__VLS_ctx.userRoleLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleLogout) },
    ...{ class: "mt-3 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50" },
    'aria-label': "Đăng xuất",
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-rose-50']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "enterprise-sidebar-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-icon']} */ ;
let __VLS_237;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent1(__VLS_237, new __VLS_237({
    name: "uil:sign-out-alt",
    ...{ class: "h-5 w-5" },
}));
const __VLS_239 = __VLS_238({
    name: "uil:sign-out-alt",
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "enterprise-sidebar-logout-label" },
});
/** @type {__VLS_StyleScopedClasses['enterprise-sidebar-logout-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: ([
            'min-w-0 flex-1 px-4 py-6 transition-[margin] duration-200 sm:px-6 lg:px-8',
            __VLS_ctx.isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        ]) },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-[margin]']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto w-full max-w-7xl" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
if (__VLS_ctx.showKYBNotice) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 shadow-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-start gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    let __VLS_242;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({
        name: "uil:shield-exclamation",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0 text-amber-600" },
    }));
    const __VLS_244 = __VLS_243({
        name: "uil:shield-exclamation",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0 text-amber-600" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_243));
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.kybNoticeText);
    let __VLS_247;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent1(__VLS_247, new __VLS_247({
        to: "/enterprise/settings",
        ...{ class: "inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-amber-800 transition hover:bg-amber-100" },
    }));
    const __VLS_249 = __VLS_248({
        to: "/enterprise/settings",
        ...{ class: "inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-amber-800 transition hover:bg-amber-100" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-amber-100']} */ ;
    const { default: __VLS_252 } = __VLS_250.slots;
    let __VLS_253;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent1(__VLS_253, new __VLS_253({
        name: "uil:file-upload-alt",
        ...{ class: "h-4 w-4" },
    }));
    const __VLS_255 = __VLS_254({
        name: "uil:file-upload-alt",
        ...{ class: "h-4 w-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    (__VLS_ctx.kybNoticeActionLabel);
    // @ts-ignore
    [isSidebarCollapsed, companyInitials, companyName, handleLogout, showKYBNotice, userRoleLabel, kybNoticeText, kybNoticeActionLabel,];
    var __VLS_250;
}
var __VLS_258 = {};
// @ts-ignore
var __VLS_259 = __VLS_258;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({});
const __VLS_export = {};
export default {};
