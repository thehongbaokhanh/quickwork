import { computed, onMounted, onUnmounted, ref } from 'vue';
import AuthBrandMark from '~/components/AuthBrandMark.vue';
import { useAuthStore } from '~/stores/auth';
import { NotificationService } from '~/services/notification.service';
const emit = defineEmits();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const isNotificationMenuOpen = ref(false);
const headerNotifications = ref([]);
const notificationUnreadCount = ref(0);
const notificationLoading = ref(false);
const navItems = [
    { label: 'Việc làm', to: '/student' },
    { label: 'Công ty', to: '/#employer' },
    { label: 'Mức lương', to: '/#featured-jobs' },
    { label: 'Công cụ nghề nghiệp', to: '/#career-tools' },
    { label: 'Blog' }
];
const accountGroups = [
    {
        id: 'job-management',
        title: 'Quản lý tìm việc',
        icon: 'uil:briefcase-alt',
        items: ['Việc làm đã lưu', 'Việc làm đã ứng tuyển', 'Việc làm phù hợp với bạn']
    },
    {
        id: 'cv-management',
        title: 'Quản lý CV',
        icon: 'uil:file-alt',
        items: ['CV của tôi']
    },
    {
        id: 'security',
        title: 'Cá nhân & Bảo mật',
        icon: 'uil:user-check',
        items: ['Cài đặt thông tin cá nhân']
    }
];
const expandedAccountGroups = ref(accountGroups.filter((group) => group.items?.length).map((group) => group.id));
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Tài khoản QuickWork');
const userEmail = computed(() => authStore.user?.email || 'Chưa cập nhật email');
const userId = computed(() => authStore.user?.id || 'N/A');
const roleLabel = computed(() => {
    if (authStore.userRole === 'ADMIN')
        return 'Tài khoản quản trị';
    if (authStore.userRole === 'ENTERPRISE')
        return 'Tài khoản nhà tuyển dụng';
    return 'Tài khoản đã xác thực';
});
const compactRoleLabel = computed(() => {
    if (authStore.userRole === 'STUDENT')
        return 'Sinh viên';
    if (authStore.userRole === 'ENTERPRISE')
        return 'Nhà tuyển dụng';
    if (authStore.userRole === 'ADMIN')
        return 'Quản trị viên';
    return 'Tài khoản';
});
const notificationCenterTo = computed(() => (authStore.userRole === 'ENTERPRISE' ? '/enterprise/notifications' : ''));
const accountItemRoutes = {
    'Việc làm phù hợp với bạn': '/student',
    'Cài đặt thông tin cá nhân': '/profile'
};
function isGroupOpen(groupId) {
    return expandedAccountGroups.value.includes(groupId);
}
function toggleAccountGroup(group) {
    if (!group.items?.length) {
        emit('notify', group.title);
        return;
    }
    if (isGroupOpen(group.id)) {
        expandedAccountGroups.value = expandedAccountGroups.value.filter((id) => id !== group.id);
        return;
    }
    expandedAccountGroups.value = [...expandedAccountGroups.value, group.id];
}
function handleAccountItem(feature) {
    if (feature === 'Tin nhắn') {
        openMessages();
        return;
    }
    const target = accountItemRoutes[feature];
    if (target) {
        closeMenus();
        navigateTo(target);
        return;
    }
    emit('notify', feature);
}
function handleMobileNotify(feature) {
    isMobileMenuOpen.value = false;
    if (feature === 'Tin nhắn') {
        openMessages();
        return;
    }
    const target = accountItemRoutes[feature];
    if (target) {
        closeMenus();
        navigateTo(target);
        return;
    }
    emit('notify', feature);
}
function openMessages() {
    closeMenus();
    if (!authStore.isAuthenticated) {
        navigateTo({ path: '/auth/login', query: { redirect: '/student/messages' } });
        return;
    }
    if (authStore.userRole === 'ENTERPRISE') {
        navigateTo('/enterprise?view=messages');
        return;
    }
    if (authStore.userRole === 'STUDENT') {
        navigateTo('/student/messages');
        return;
    }
    emit('notify', 'Tin nhắn');
}
function toggleNotifications() {
    isNotificationMenuOpen.value = !isNotificationMenuOpen.value;
    isUserMenuOpen.value = false;
    if (isNotificationMenuOpen.value) {
        loadHeaderNotifications();
    }
}
function toggleUserMenu() {
    isUserMenuOpen.value = !isUserMenuOpen.value;
    isNotificationMenuOpen.value = false;
}
function closeMenus() {
    isUserMenuOpen.value = false;
    isNotificationMenuOpen.value = false;
}
function handleWindowClick() {
    closeMenus();
}
function handleKeyDown(event) {
    if (event.key === 'Escape') {
        closeMenus();
        isMobileMenuOpen.value = false;
    }
}
function handleLogout() {
    closeMenus();
    isMobileMenuOpen.value = false;
    authStore.logout();
}
async function loadHeaderNotifications() {
    if (!authStore.isAuthenticated)
        return;
    notificationLoading.value = true;
    try {
        const [listResponse, unreadResponse] = await Promise.all([
            NotificationService.list({ page: 1, page_size: 100 }),
            NotificationService.unreadCount()
        ]);
        headerNotifications.value = listResponse?.data?.items || [];
        notificationUnreadCount.value = Number(unreadResponse?.data?.unread_count || 0);
    }
    catch {
        headerNotifications.value = [];
        notificationUnreadCount.value = 0;
    }
    finally {
        notificationLoading.value = false;
    }
}
async function markNotificationsRead() {
    try {
        await NotificationService.markAllAsRead();
        await loadHeaderNotifications();
    }
    catch {
        // Keep the menu usable even if the API rejects the read-state update.
    }
}
async function openNotification(item) {
    try {
        if (!item.is_read) {
            await NotificationService.markAsRead(item.id);
            item.is_read = true;
            notificationUnreadCount.value = Math.max(0, notificationUnreadCount.value - 1);
        }
    }
    catch {
        // Navigation is still useful even if read-state update fails.
    }
    const target = normalizeNotificationActionURL(item.action_url);
    closeMenus();
    if (target) {
        await navigateTo(target);
    }
}
function normalizeNotificationActionURL(value) {
    if (!value)
        return '';
    if (value.startsWith('/messages/')) {
        const conversationID = value.replace('/messages/', '').split('/')[0];
        if (!conversationID)
            return '';
        if (authStore.userRole === 'ENTERPRISE')
            return `/enterprise?view=messages&conversation=${conversationID}`;
        if (authStore.userRole === 'STUDENT')
            return `/student/messages?conversation=${conversationID}`;
        return '';
    }
    if (value.startsWith('/student/messages/')) {
        const conversationID = value.replace('/student/messages/', '').split('/')[0];
        return authStore.userRole === 'STUDENT' && conversationID ? `/student/messages?conversation=${conversationID}` : '';
    }
    if (value === '/student/messages') {
        return authStore.userRole === 'STUDENT' ? '/student/messages' : '';
    }
    if (value.startsWith('/enterprise/messages/')) {
        const conversationID = value.replace('/enterprise/messages/', '').split('/')[0];
        return authStore.userRole === 'ENTERPRISE' && conversationID
            ? `/enterprise?view=messages&conversation=${conversationID}`
            : '';
    }
    if (value === '/enterprise/messages') {
        return authStore.userRole === 'ENTERPRISE' ? '/enterprise?view=messages' : '';
    }
    if (value.startsWith('/enterprise/'))
        return authStore.userRole === 'ENTERPRISE' ? value : '';
    if (value.startsWith('/admin/'))
        return authStore.userRole === 'ADMIN' ? value : '';
    if (value.startsWith('/student/') || value === '/profile' || value === '/settings')
        return value;
    return '';
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
onMounted(() => {
    window.addEventListener('click', handleWindowClick);
    window.addEventListener('keydown', handleKeyDown);
    loadHeaderNotifications();
});
onUnmounted(() => {
    window.removeEventListener('click', handleWindowClick);
    window.removeEventListener('keydown', handleKeyDown);
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/95']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-[74px] w-full items-center justify-between gap-5 px-5 sm:px-8 lg:px-10 xl:grid xl:grid-cols-[minmax(230px,1fr)_auto_minmax(230px,1fr)] 2xl:px-12" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[74px]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-10']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:grid']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:grid-cols-[minmax(230px,1fr)_auto_minmax(230px,1fr)]']} */ ;
/** @type {__VLS_StyleScopedClasses['2xl:px-12']} */ ;
const __VLS_0 = AuthBrandMark;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "hidden items-center justify-self-center gap-7 xl:flex" },
    'aria-label': "Điều hướng chính",
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-self-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-7']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:flex']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.navItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsics.template)({
        key: (item.label),
    });
    if (item.to) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            to: (item.to),
            ...{ class: "text-sm font-bold text-slate-800 transition hover:text-sky-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100" },
        }));
        const __VLS_7 = __VLS_6({
            to: (item.to),
            ...{ class: "text-sm font-bold text-slate-800 transition hover:text-sky-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        const { default: __VLS_10 } = __VLS_8.slots;
        (item.label);
        // @ts-ignore
        [navItems,];
        var __VLS_8;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(item.to))
                        return;
                    __VLS_ctx.$emit('notify', item.label);
                    // @ts-ignore
                    [$emit,];
                } },
            type: "button",
            ...{ class: "text-sm font-bold text-slate-800 transition hover:text-sky-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        (item.label);
    }
    // @ts-ignore
    [];
}
if (__VLS_ctx.isAuthenticated) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ml-auto hidden shrink-0 items-center gap-3 lg:flex xl:ml-0 xl:justify-self-end" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:ml-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:justify-self-end']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleNotifications) },
        type: "button",
        ...{ class: "relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "Thông báo",
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        name: "uil:bell",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }));
    const __VLS_13 = __VLS_12({
        name: "uil:bell",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    if (__VLS_ctx.notificationUnreadCount > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-2']} */ ;
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
    if (__VLS_ctx.isNotificationMenuOpen) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "absolute right-0 z-50 mt-3" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        let __VLS_16;
        /** @ts-ignore @type { | typeof __VLS_components.UiNotificationDropdown} */
        UiNotificationDropdown;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
            ...{ 'onMarkAllRead': {} },
            ...{ 'onOpen': {} },
            ...{ 'onClose': {} },
            title: "Thông báo QuickWork",
            unreadCount: (__VLS_ctx.notificationUnreadCount),
            loading: (__VLS_ctx.notificationLoading),
            items: (__VLS_ctx.headerNotifications),
            emptyText: "Chưa có thông báo nào.",
            viewAllTo: (__VLS_ctx.notificationCenterTo),
            storageKey: "home-header",
            getIcon: (__VLS_ctx.getNotificationIcon),
            getIconClass: (__VLS_ctx.getNotificationIconClass),
        }));
        const __VLS_18 = __VLS_17({
            ...{ 'onMarkAllRead': {} },
            ...{ 'onOpen': {} },
            ...{ 'onClose': {} },
            title: "Thông báo QuickWork",
            unreadCount: (__VLS_ctx.notificationUnreadCount),
            loading: (__VLS_ctx.notificationLoading),
            items: (__VLS_ctx.headerNotifications),
            emptyText: "Chưa có thông báo nào.",
            viewAllTo: (__VLS_ctx.notificationCenterTo),
            storageKey: "home-header",
            getIcon: (__VLS_ctx.getNotificationIcon),
            getIconClass: (__VLS_ctx.getNotificationIconClass),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_21;
        const __VLS_22 = {
            /** @type {typeof __VLS_21.markAllRead} */
            onMarkAllRead: (__VLS_ctx.markNotificationsRead),
        };
        const __VLS_23 = {
            /** @type {typeof __VLS_21.open} */
            onOpen: (__VLS_ctx.openNotification),
        };
        const __VLS_24 = {
            /** @type {typeof __VLS_21.close} */
            onClose: (__VLS_ctx.closeMenus),
        };
        var __VLS_19;
        var __VLS_20;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openMessages) },
        type: "button",
        ...{ class: "inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "Tin nhắn",
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        name: "uil:comment-alt-dots",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }));
    const __VLS_27 = __VLS_26({
        name: "uil:comment-alt-dots",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleUserMenu) },
        type: "button",
        ...{ class: "inline-flex h-14 min-w-[230px] items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 pr-4 text-slate-900 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-expanded': (__VLS_ctx.isUserMenuOpen),
        'aria-controls': "home-user-menu",
        'aria-label': "Mở menu tài khoản",
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-[230px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        name: "uil:user",
        ...{ class: "h-7 w-7" },
        'aria-hidden': "true",
    }));
    const __VLS_32 = __VLS_31({
        name: "uil:user",
        ...{ class: "h-7 w-7" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "min-w-0 flex-1 text-left leading-tight" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block max-w-[130px] truncate text-sm font-extrabold text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[130px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    (__VLS_ctx.userName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-0.5 block text-xs font-semibold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.compactRoleLabel);
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        name: "uil:angle-down",
        ...{ class: (['h-4 w-4 text-slate-500 transition-transform duration-200', __VLS_ctx.isUserMenuOpen ? 'rotate-180' : '']) },
        'aria-hidden': "true",
    }));
    const __VLS_37 = __VLS_36({
        name: "uil:angle-down",
        ...{ class: (['h-4 w-4 text-slate-500 transition-transform duration-200', __VLS_ctx.isUserMenuOpen ? 'rotate-180' : '']) },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        enterActiveClass: "transition duration-150 ease-out",
        enterFromClass: "translate-y-1 opacity-0",
        enterToClass: "translate-y-0 opacity-100",
        leaveActiveClass: "transition duration-100 ease-in",
        leaveFromClass: "translate-y-0 opacity-100",
        leaveToClass: "translate-y-1 opacity-0",
    }));
    const __VLS_42 = __VLS_41({
        enterActiveClass: "transition duration-150 ease-out",
        enterFromClass: "translate-y-1 opacity-0",
        enterToClass: "translate-y-0 opacity-100",
        leaveActiveClass: "transition duration-100 ease-in",
        leaveFromClass: "translate-y-0 opacity-100",
        leaveToClass: "translate-y-1 opacity-0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const { default: __VLS_45 } = __VLS_43.slots;
    if (__VLS_ctx.isUserMenuOpen) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            id: "home-user-menu",
            ...{ class: "absolute right-0 mt-3 w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-slate-200 bg-white text-sm text-slate-700 shadow-2xl shadow-slate-200/80" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[420px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[calc(100vw-2rem)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-[24px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-slate-200/80']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex max-h-[calc(100vh-96px)] flex-col" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-[calc(100vh-96px)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex shrink-0 gap-4 border-b border-slate-100 p-5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-300" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            name: "uil:user",
            ...{ class: "h-14 w-14" },
            'aria-hidden': "true",
        }));
        const __VLS_48 = __VLS_47({
            name: "uil:user",
            ...{ class: "h-14 w-14" },
            'aria-hidden': "true",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-14']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-w-0 pt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "truncate text-lg font-extrabold text-slate-900" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
        (__VLS_ctx.userName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 text-sm font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.roleLabel);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-2 truncate text-sm font-semibold text-slate-600" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
        (__VLS_ctx.userId);
        (__VLS_ctx.userEmail);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-h-0 flex-1 overflow-y-auto p-3" },
        });
        /** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        for (const [group] of __VLS_vFor((__VLS_ctx.accountGroups))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
                key: (group.id),
                ...{ class: "rounded-2xl" },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isAuthenticated))
                            return;
                        if (!(__VLS_ctx.isUserMenuOpen))
                            return;
                        __VLS_ctx.toggleAccountGroup(group);
                        // @ts-ignore
                        [isAuthenticated, toggleNotifications, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, isNotificationMenuOpen, notificationLoading, headerNotifications, notificationCenterTo, getNotificationIcon, getNotificationIconClass, markNotificationsRead, openNotification, closeMenus, openMessages, toggleUserMenu, isUserMenuOpen, isUserMenuOpen, isUserMenuOpen, userName, userName, compactRoleLabel, roleLabel, userId, userEmail, accountGroups, toggleAccountGroup,];
                    } },
                type: "button",
                ...{ class: "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left font-extrabold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
                'aria-expanded': (group.items?.length ? __VLS_ctx.isGroupOpen(group.id) : undefined),
                'aria-controls': (group.items?.length ? `account-group-${group.id}` : undefined),
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "inline-flex min-w-0 items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            let __VLS_51;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                name: (group.icon),
                ...{ class: "h-6 w-6 shrink-0 text-slate-500" },
                'aria-hidden': "true",
            }));
            const __VLS_53 = __VLS_52({
                name: (group.icon),
                ...{ class: "h-6 w-6 shrink-0 text-slate-500" },
                'aria-hidden': "true",
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (group.title);
            if (group.items?.length) {
                let __VLS_56;
                /** @ts-ignore @type { | typeof __VLS_components.Icon} */
                Icon;
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                    name: "uil:angle-down",
                    ...{ class: ([
                            'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                            __VLS_ctx.isGroupOpen(group.id) ? 'rotate-180' : ''
                        ]) },
                    'aria-hidden': "true",
                }));
                const __VLS_58 = __VLS_57({
                    name: "uil:angle-down",
                    ...{ class: ([
                            'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                            __VLS_ctx.isGroupOpen(group.id) ? 'rotate-180' : ''
                        ]) },
                    'aria-hidden': "true",
                }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
                /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
            }
            let __VLS_61;
            /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
            transition;
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
                enterActiveClass: "transition duration-150 ease-out",
                enterFromClass: "-translate-y-1 opacity-0",
                enterToClass: "translate-y-0 opacity-100",
                leaveActiveClass: "transition duration-100 ease-in",
                leaveFromClass: "translate-y-0 opacity-100",
                leaveToClass: "-translate-y-1 opacity-0",
            }));
            const __VLS_63 = __VLS_62({
                enterActiveClass: "transition duration-150 ease-out",
                enterFromClass: "-translate-y-1 opacity-0",
                enterToClass: "translate-y-0 opacity-100",
                leaveActiveClass: "transition duration-100 ease-in",
                leaveFromClass: "translate-y-0 opacity-100",
                leaveToClass: "-translate-y-1 opacity-0",
            }, ...__VLS_functionalComponentArgsRest(__VLS_62));
            const { default: __VLS_66 } = __VLS_64.slots;
            if (group.items?.length && __VLS_ctx.isGroupOpen(group.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    id: (`account-group-${group.id}`),
                    ...{ class: "mb-3 ml-12 mr-3 overflow-hidden rounded-2xl bg-white" },
                });
                /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
                for (const [item] of __VLS_vFor((group.items))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.isAuthenticated))
                                    return;
                                if (!(__VLS_ctx.isUserMenuOpen))
                                    return;
                                if (!(group.items?.length && __VLS_ctx.isGroupOpen(group.id)))
                                    return;
                                __VLS_ctx.handleAccountItem(item);
                                // @ts-ignore
                                [isGroupOpen, isGroupOpen, isGroupOpen, handleAccountItem,];
                            } },
                        key: (item),
                        type: "button",
                        ...{ class: "flex min-h-11 w-full items-center px-3 text-left text-sm font-bold text-slate-700 transition hover:bg-sky-50/80 hover:text-slate-950 focus:outline-none focus-visible:bg-sky-50 focus-visible:text-slate-950 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['min-h-11']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
                    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50/80']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:text-slate-950']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:bg-sky-50']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:text-slate-950']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-inset']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
                    (item);
                    // @ts-ignore
                    [];
                }
            }
            // @ts-ignore
            [];
            var __VLS_64;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "shrink-0 bg-slate-50 p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.handleLogout) },
            type: "button",
            ...{ class: "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        let __VLS_67;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
            name: "uil:sign-out-alt",
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }));
        const __VLS_69 = __VLS_68({
            name: "uil:sign-out-alt",
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
    // @ts-ignore
    [handleLogout,];
    var __VLS_43;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ml-auto hidden shrink-0 items-center gap-3 lg:flex xl:ml-0 xl:justify-self-end" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:ml-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:justify-self-end']} */ ;
    let __VLS_72;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        to: "/login",
        ...{ class: "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-900 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
    }));
    const __VLS_74 = __VLS_73({
        to: "/login",
        ...{ class: "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-900 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    const { default: __VLS_77 } = __VLS_75.slots;
    // @ts-ignore
    [];
    var __VLS_75;
    let __VLS_78;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
        to: "/register",
        ...{ class: "inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200" },
    }));
    const __VLS_80 = __VLS_79({
        to: "/register",
        ...{ class: "inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-200']} */ ;
    const { default: __VLS_83 } = __VLS_81.slots;
    // @ts-ignore
    [];
    var __VLS_81;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isMobileMenuOpen = !__VLS_ctx.isMobileMenuOpen;
            // @ts-ignore
            [isMobileMenuOpen, isMobileMenuOpen,];
        } },
    type: "button",
    ...{ class: "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 lg:hidden" },
    'aria-expanded': (__VLS_ctx.isMobileMenuOpen),
    'aria-controls': "home-mobile-menu",
    'aria-label': "Mở menu",
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['w-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
let __VLS_84;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    name: (__VLS_ctx.isMobileMenuOpen ? 'uil:times' : 'uil:bars'),
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}));
const __VLS_86 = __VLS_85({
    name: (__VLS_ctx.isMobileMenuOpen ? 'uil:times' : 'uil:bars'),
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
if (__VLS_ctx.isMobileMenuOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        id: "home-mobile-menu",
        ...{ class: "border-t border-slate-200 bg-white px-4 py-5 shadow-xl shadow-slate-200/40 lg:hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-200/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "mx-auto grid max-w-[1240px] gap-2" },
        'aria-label': "Điều hướng di động",
    });
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[1240px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.navItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsics.template)({
            key: (item.label),
        });
        if (item.to) {
            let __VLS_89;
            /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
            NuxtLink;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
                ...{ 'onClick': {} },
                to: (item.to),
                ...{ class: "rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            }));
            const __VLS_91 = __VLS_90({
                ...{ 'onClick': {} },
                to: (item.to),
                ...{ class: "rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            let __VLS_94;
            const __VLS_95 = {
                /** @type {typeof __VLS_94.click} */
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isMobileMenuOpen))
                        return;
                    if (!(item.to))
                        return;
                    __VLS_ctx.isMobileMenuOpen = false;
                    // @ts-ignore
                    [navItems, isMobileMenuOpen, isMobileMenuOpen, isMobileMenuOpen, isMobileMenuOpen,];
                },
            };
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            const { default: __VLS_96 } = __VLS_92.slots;
            (item.label);
            // @ts-ignore
            [];
            var __VLS_92;
            var __VLS_93;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isMobileMenuOpen))
                            return;
                        if (!!(item.to))
                            return;
                        __VLS_ctx.handleMobileNotify(item.label);
                        // @ts-ignore
                        [handleMobileNotify,];
                    } },
                type: "button",
                ...{ class: "rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            (item.label);
        }
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.isAuthenticated) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-auto mt-4 grid max-w-[1240px] gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[1240px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "max-h-[70vh] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['max-h-[70vh]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-base font-extrabold text-slate-900" },
        });
        /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
        (__VLS_ctx.userName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 truncate text-sm font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.userEmail);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-4 grid gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        for (const [group] of __VLS_vFor((__VLS_ctx.accountGroups))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
                key: (group.id),
                ...{ class: "rounded-2xl bg-white" },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isMobileMenuOpen))
                            return;
                        if (!(__VLS_ctx.isAuthenticated))
                            return;
                        __VLS_ctx.toggleAccountGroup(group);
                        // @ts-ignore
                        [isAuthenticated, userName, userEmail, accountGroups, toggleAccountGroup,];
                    } },
                type: "button",
                ...{ class: "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-extrabold text-slate-800" },
                'aria-expanded': (group.items?.length ? __VLS_ctx.isGroupOpen(group.id) : undefined),
                'aria-controls': (group.items?.length ? `mobile-account-group-${group.id}` : undefined),
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "inline-flex min-w-0 items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            let __VLS_97;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
                name: (group.icon),
                ...{ class: "h-5 w-5 shrink-0 text-slate-500" },
                'aria-hidden': "true",
            }));
            const __VLS_99 = __VLS_98({
                name: (group.icon),
                ...{ class: "h-5 w-5 shrink-0 text-slate-500" },
                'aria-hidden': "true",
            }, ...__VLS_functionalComponentArgsRest(__VLS_98));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (group.title);
            if (group.items?.length) {
                let __VLS_102;
                /** @ts-ignore @type { | typeof __VLS_components.Icon} */
                Icon;
                // @ts-ignore
                const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
                    name: "uil:angle-down",
                    ...{ class: ([
                            'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                            __VLS_ctx.isGroupOpen(group.id) ? 'rotate-180' : ''
                        ]) },
                    'aria-hidden': "true",
                }));
                const __VLS_104 = __VLS_103({
                    name: "uil:angle-down",
                    ...{ class: ([
                            'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                            __VLS_ctx.isGroupOpen(group.id) ? 'rotate-180' : ''
                        ]) },
                    'aria-hidden': "true",
                }, ...__VLS_functionalComponentArgsRest(__VLS_103));
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
                /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
            }
            if (group.items?.length && __VLS_ctx.isGroupOpen(group.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    id: (`mobile-account-group-${group.id}`),
                    ...{ class: "mb-3 ml-12 mr-4 overflow-hidden rounded-2xl bg-white" },
                });
                /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
                for (const [item] of __VLS_vFor((group.items))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.isMobileMenuOpen))
                                    return;
                                if (!(__VLS_ctx.isAuthenticated))
                                    return;
                                if (!(group.items?.length && __VLS_ctx.isGroupOpen(group.id)))
                                    return;
                                __VLS_ctx.handleMobileNotify(item);
                                // @ts-ignore
                                [isGroupOpen, isGroupOpen, isGroupOpen, handleMobileNotify,];
                            } },
                        key: (item),
                        type: "button",
                        ...{ class: "flex min-h-11 w-full items-center px-3 text-left text-sm font-bold text-slate-700 transition hover:bg-sky-50/80 hover:text-slate-950 focus:outline-none focus-visible:bg-sky-50 focus-visible:text-slate-950 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['min-h-11']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
                    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50/80']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:text-slate-950']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:bg-sky-50']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:text-slate-950']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-inset']} */ ;
                    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
                    (item);
                    // @ts-ignore
                    [];
                }
            }
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.handleLogout) },
            type: "button",
            ...{ class: "mt-3 h-12 w-full rounded-2xl bg-white text-sm font-bold text-slate-800" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-auto mt-4 grid max-w-[1240px] gap-3 sm:grid-cols-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[1240px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
        let __VLS_107;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
            to: "/login",
            ...{ class: "inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-900" },
        }));
        const __VLS_109 = __VLS_108({
            to: "/login",
            ...{ class: "inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-900" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
        const { default: __VLS_112 } = __VLS_110.slots;
        // @ts-ignore
        [handleLogout,];
        var __VLS_110;
        let __VLS_113;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
            to: "/register",
            ...{ class: "inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white" },
        }));
        const __VLS_115 = __VLS_114({
            to: "/register",
            ...{ class: "inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        const { default: __VLS_118 } = __VLS_116.slots;
        // @ts-ignore
        [];
        var __VLS_116;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
});
export default {};
