import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import HomeFooter from '~/components/home/HomeFooter.vue';
import HomeHeader from '~/components/home/HomeHeader.vue';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { ConversationService } from '~/services/conversation.service';
import { NotificationService } from '~/services/notification.service';
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const showUserMenu = ref(false);
const showNotifications = ref(false);
const headerNotifications = ref([]);
const notificationUnreadCount = ref(0);
const notificationLoading = ref(false);
const messageUnreadCount = ref(0);
const isPublicStudentBoard = computed(() => route.path === '/student');
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Học viên');
const userEmail = computed(() => authStore.user?.email || 'student@quickwork.vn');
const userInitials = computed(() => userName.value.slice(0, 2).toUpperCase());
const headerNavItems = [
    { label: 'Việc làm', to: '/student' },
    { label: 'Công ty', to: '/#employer' },
    { label: 'Mức lương', to: '/#featured-jobs' },
    { label: 'Công cụ nghề nghiệp', to: '/#career-tools' },
    { label: 'Blog', to: '/#blog' }
];
const sidebarGroups = computed(() => [
    {
        id: 'overview',
        label: 'Tổng quan',
        items: [
            { label: 'Trang chủ', to: '/', icon: 'uil:home-alt' },
            { label: 'Tất cả việc làm', to: '/student', icon: 'uil:briefcase-alt' }
        ]
    },
    {
        id: 'job-management',
        label: 'Quản lý tìm việc',
        items: [
            { label: 'Tin nhắn', to: '/student/messages', icon: 'uil:comment-alt-message', badge: messageUnreadCount.value },
            { label: 'Việc làm đã lưu', icon: 'uil:bookmark' },
            { label: 'Ứng tuyển của tôi', icon: 'uil:clipboard-notes' },
            { label: 'Việc làm phù hợp', to: '/student', icon: 'uil:bolt-alt' }
        ]
    },
    {
        id: 'student-management',
        label: 'Quản lý sinh viên',
        items: [
            { label: 'Hồ sơ cá nhân', to: '/profile', icon: 'uil:user-square' },
            { label: 'CV của tôi', icon: 'uil:file-alt' }
        ]
    },
    {
        id: 'security',
        label: 'Cá nhân & Bảo mật',
        items: [
            { label: 'Cài đặt', to: '/settings', icon: 'uil:setting' }
        ]
    }
]);
const quickAccountItems = [
    { label: 'Hồ sơ cá nhân', to: '/profile', icon: 'uil:user-square' },
    { label: 'Cài đặt', to: '/settings', icon: 'uil:setting' },
    { label: 'Việc làm phù hợp', to: '/student', icon: 'uil:bolt-alt' }
];
const navItems = computed(() => [
    { label: 'Việc phù hợp', to: '/student', icon: 'uil:briefcase-alt', active: route.path === '/student' },
    { label: 'Hồ sơ', to: '/profile', icon: 'uil:file-alt', active: route.path === '/profile' },
    { label: 'Cài đặt', to: '/settings', icon: 'uil:setting', active: route.path === '/settings' }
]);
const notifications = [
    {
        title: 'FPT Software vừa mở vị trí Software Engineer Intern.',
        time: '2 giờ trước',
        icon: 'uil:briefcase-alt',
        iconClass: 'bg-sky-50 text-sky-700'
    },
    {
        title: 'Hồ sơ của bạn đạt 75%, thêm portfolio để nổi bật hơn.',
        time: 'Hôm nay',
        icon: 'uil:file-check-alt',
        iconClass: 'bg-teal-50 text-teal-700'
    }
];
function sidebarItemClass(item) {
    const active = isSidebarItemActive(item);
    return [
        'group flex min-h-12 w-full items-center rounded-2xl text-left text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
        isSidebarCollapsed.value ? 'justify-center px-0' : 'gap-3 px-4',
        active
            ? 'bg-sky-600 text-white shadow-lg shadow-sky-200'
            : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
    ];
}
function isSidebarItemActive(item) {
    if (!item.to)
        return false;
    if (item.to === '/')
        return route.path === '/';
    if (item.to === '/student')
        return route.path === '/student';
    return route.path === item.to || route.path.startsWith(`${item.to}/`);
}
const notifyDevelopment = (feature) => {
    toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`);
};
function openAccountItem(item) {
    closeDropdowns();
    if (item.to) {
        navigateTo(item.to);
        return;
    }
    notifyDevelopment(item.label);
}
function openMessages() {
    closeDropdowns();
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
    notifyDevelopment('Tin nhắn');
}
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
};
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
async function loadMessageUnreadCount() {
    if (!authStore.isAuthenticated || authStore.userRole !== 'STUDENT') {
        messageUnreadCount.value = 0;
        return;
    }
    try {
        const response = await ConversationService.unreadCount();
        messageUnreadCount.value = Number(response?.data?.unread_count || response?.data?.count || 0);
    }
    catch {
        messageUnreadCount.value = 0;
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
    closeDropdowns();
    if (target) {
        await navigateTo(target);
    }
}
function normalizeNotificationActionURL(value) {
    if (!value)
        return '';
    if (value.startsWith('/messages/')) {
        const conversationID = value.replace('/messages/', '').split('/')[0];
        return conversationID ? `/student/messages?conversation=${conversationID}` : '/student/messages';
    }
    if (value.startsWith('/student/messages/')) {
        const conversationID = value.replace('/student/messages/', '').split('/')[0];
        return conversationID ? `/student/messages?conversation=${conversationID}` : '/student/messages';
    }
    if (value === '/student/messages')
        return '/student/messages';
    if (value.startsWith('/student/') || value === '/profile' || value === '/settings')
        return value;
    if (value.startsWith('/enterprise/messages/')) {
        const conversationID = value.replace('/enterprise/messages/', '').split('/')[0];
        return conversationID ? `/student/messages?conversation=${conversationID}` : '/student/messages';
    }
    return '';
}
function getNotificationIcon(type) {
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
    if (type === 'MESSAGE')
        return 'bg-sky-50 text-sky-700';
    if (type === 'INTERVIEW')
        return 'bg-amber-50 text-amber-700';
    if (type === 'APPLICATION')
        return 'bg-emerald-50 text-emerald-700';
    if (type === 'JOB')
        return 'bg-cyan-50 text-cyan-700';
    return 'bg-slate-50 text-slate-600';
}
const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        closeDropdowns();
        isSidebarOpen.value = false;
    }
};
watch(() => route.fullPath, () => {
    closeDropdowns();
    isSidebarOpen.value = false;
});
onMounted(() => {
    window.addEventListener('click', closeDropdowns);
    window.addEventListener('keydown', handleKeyDown);
    loadHeaderNotifications();
    loadMessageUnreadCount();
});
onUnmounted(() => {
    window.removeEventListener('click', closeDropdowns);
    window.removeEventListener('keydown', handleKeyDown);
});
const handleLogout = () => {
    closeDropdowns();
    isSidebarOpen.value = false;
    authStore.logout();
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['student-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sidebar-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sidebar-scroll']} */ ;
if (__VLS_ctx.isPublicStudentBoard) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" },
    });
    /** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['antialiased']} */ ;
    const __VLS_0 = HomeHeader;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onNotify': {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onNotify': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.notify} */
        onNotify: (__VLS_ctx.notifyDevelopment),
    };
    var __VLS_3;
    var __VLS_4;
    if (false) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
            ...{ class: "sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur" },
        });
        /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white/95']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex min-w-0 items-center gap-8" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            to: "/student",
            ...{ class: "flex shrink-0 items-center" },
        }));
        const __VLS_9 = __VLS_8({
            to: "/student",
            ...{ class: "flex shrink-0 items-center" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        const { default: __VLS_12 } = __VLS_10.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "/images/brand/quickwork-wordmark-transparent.png",
            alt: "QuickWork",
            ...{ class: "h-10 w-auto object-contain" },
        });
        /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
        // @ts-ignore
        [isPublicStudentBoard, notifyDevelopment,];
        var __VLS_10;
        __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
            ...{ class: "hidden items-center gap-1 md:flex" },
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.navItems))) {
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
            NuxtLink;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                key: (item.to),
                to: (item.to),
                ...{ class: ([
                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors',
                        item.active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    ]) },
            }));
            const __VLS_15 = __VLS_14({
                key: (item.to),
                to: (item.to),
                ...{ class: ([
                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors',
                        item.active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    ]) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            const { default: __VLS_18 } = __VLS_16.slots;
            let __VLS_19;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                name: (item.icon),
                ...{ class: "h-4 w-4" },
            }));
            const __VLS_21 = __VLS_20({
                name: (item.icon),
                ...{ class: "h-4 w-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_20));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            (item.label);
            // @ts-ignore
            [navItems,];
            var __VLS_16;
            // @ts-ignore
            [];
        }
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
            type: "button",
            ...{ class: "relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700" },
            'aria-label': "Thông báo",
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            name: "uil:bell",
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_26 = __VLS_25({
            name: "uil:bell",
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-white']} */ ;
        if (__VLS_ctx.showNotifications) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: () => { } },
                ...{ class: "absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white py-2 text-sm shadow-xl" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-80']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center justify-between border-b border-slate-100 px-4 pb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-black text-slate-950" },
            });
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isPublicStudentBoard))
                            return;
                        if (!(false))
                            return;
                        if (!(__VLS_ctx.showNotifications))
                            return;
                        __VLS_ctx.notifyDevelopment('Đánh dấu đã đọc');
                        // @ts-ignore
                        [notifyDevelopment, toggleNotifications, showNotifications,];
                    } },
                type: "button",
                ...{ class: "text-xs font-black text-sky-700 hover:text-sky-800" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-sky-800']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "divide-y divide-slate-100" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-slate-100']} */ ;
            for (const [notice] of __VLS_vFor((__VLS_ctx.notifications))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (notice.title),
                    ...{ class: "flex gap-3 px-4 py-3 hover:bg-slate-50" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: (['mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', notice.iconClass]) },
                });
                /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                let __VLS_29;
                /** @ts-ignore @type { | typeof __VLS_components.Icon} */
                Icon;
                // @ts-ignore
                const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                    name: (notice.icon),
                    ...{ class: "h-4 w-4" },
                }));
                const __VLS_31 = __VLS_30({
                    name: (notice.icon),
                    ...{ class: "h-4 w-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_30));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "font-bold leading-5 text-slate-800" },
                });
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
                (notice.title);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "mt-1 text-xs text-slate-500" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
                (notice.time);
                // @ts-ignore
                [notifications,];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.toggleUserMenu) },
            type: "button",
            ...{ class: "flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-slate-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-sm font-black text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        (__VLS_ctx.userInitials);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "hidden max-w-[140px] truncate text-sm font-black text-slate-800 sm:inline" },
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[140px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
        (__VLS_ctx.userName);
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            name: "uil:angle-down",
            ...{ class: "hidden h-4 w-4 text-slate-400 sm:inline" },
        }));
        const __VLS_36 = __VLS_35({
            name: "uil:angle-down",
            ...{ class: "hidden h-4 w-4 text-slate-400 sm:inline" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
        transition;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            enterActiveClass: "transition duration-150 ease-out",
            enterFromClass: "scale-95 opacity-0",
            enterToClass: "scale-100 opacity-100",
            leaveActiveClass: "transition duration-100 ease-in",
            leaveFromClass: "scale-100 opacity-100",
            leaveToClass: "scale-95 opacity-0",
        }));
        const __VLS_41 = __VLS_40({
            enterActiveClass: "transition duration-150 ease-out",
            enterFromClass: "scale-95 opacity-0",
            enterToClass: "scale-100 opacity-100",
            leaveActiveClass: "transition duration-100 ease-in",
            leaveFromClass: "scale-100 opacity-100",
            leaveToClass: "scale-95 opacity-0",
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        const { default: __VLS_44 } = __VLS_42.slots;
        if (__VLS_ctx.showUserMenu) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: () => { } },
                ...{ class: "absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 text-sm font-bold text-slate-700 shadow-xl" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-56']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border-b border-slate-100 px-4 pb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "truncate font-black text-slate-950" },
            });
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
            (__VLS_ctx.userName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "mt-0.5 truncate text-xs font-semibold text-slate-500" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            (__VLS_ctx.userEmail);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "py-1" },
            });
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            let __VLS_45;
            /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
            NuxtLink;
            // @ts-ignore
            const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
                to: "/profile",
                ...{ class: "flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-slate-50" },
            }));
            const __VLS_47 = __VLS_46({
                to: "/profile",
                ...{ class: "flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-slate-50" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
            const { default: __VLS_50 } = __VLS_48.slots;
            let __VLS_51;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                name: "uil:user",
                ...{ class: "h-4 w-4 text-slate-400" },
            }));
            const __VLS_53 = __VLS_52({
                name: "uil:user",
                ...{ class: "h-4 w-4 text-slate-400" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
            // @ts-ignore
            [toggleUserMenu, userInitials, userName, userName, showUserMenu, userEmail,];
            var __VLS_48;
            let __VLS_56;
            /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
            NuxtLink;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                to: "/settings",
                ...{ class: "flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-slate-50" },
            }));
            const __VLS_58 = __VLS_57({
                to: "/settings",
                ...{ class: "flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-slate-50" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
            const { default: __VLS_61 } = __VLS_59.slots;
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                name: "uil:setting",
                ...{ class: "h-4 w-4 text-slate-400" },
            }));
            const __VLS_64 = __VLS_63({
                name: "uil:setting",
                ...{ class: "h-4 w-4 text-slate-400" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
            // @ts-ignore
            [];
            var __VLS_59;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border-t border-slate-100 pt-1" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.handleLogout) },
                type: "button",
                ...{ class: "flex w-full items-center gap-2.5 px-4 py-2 text-left font-black text-red-600 transition-colors hover:bg-red-50" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-50']} */ ;
            let __VLS_67;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
                name: "uil:sign-out-alt",
                ...{ class: "h-4 w-4" },
            }));
            const __VLS_69 = __VLS_68({
                name: "uil:sign-out-alt",
                ...{ class: "h-4 w-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_68));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        }
        // @ts-ignore
        [handleLogout,];
        var __VLS_42;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
    var __VLS_72 = {};
    const __VLS_74 = HomeFooter;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        ...{ 'onNotify': {} },
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onNotify': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_79;
    const __VLS_80 = {
        /** @type {typeof __VLS_79.notify} */
        onNotify: (__VLS_ctx.notifyDevelopment),
    };
    var __VLS_77;
    var __VLS_78;
    if (false) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
            ...{ class: "border-t border-slate-200 bg-white" },
        });
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isPublicStudentBoard))
                        return;
                    if (!(false))
                        return;
                    __VLS_ctx.notifyDevelopment('Trung tâm hỗ trợ');
                    // @ts-ignore
                    [notifyDevelopment, notifyDevelopment,];
                } },
            type: "button",
            ...{ class: "hover:text-sky-700" },
        });
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isPublicStudentBoard))
                        return;
                    if (!(false))
                        return;
                    __VLS_ctx.notifyDevelopment('Điều khoản sử dụng');
                    // @ts-ignore
                    [notifyDevelopment,];
                } },
            type: "button",
            ...{ class: "hover:text-sky-700" },
        });
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isPublicStudentBoard))
                        return;
                    if (!(false))
                        return;
                    __VLS_ctx.notifyDevelopment('Bảo mật');
                    // @ts-ignore
                    [notifyDevelopment,];
                } },
            type: "button",
            ...{ class: "hover:text-sky-700" },
        });
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" },
    });
    /** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['antialiased']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex h-[78px] items-center justify-between gap-5 px-5 lg:px-8" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[78px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex min-w-0 items-center gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isPublicStudentBoard))
                    return;
                __VLS_ctx.isSidebarOpen = true;
                // @ts-ignore
                [isSidebarOpen,];
            } },
        type: "button",
        ...{ class: "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 lg:hidden" },
        'aria-label': "Mở menu sinh viên",
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
    let __VLS_81;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        name: "uil:bars",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_83 = __VLS_82({
        name: "uil:bars",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    let __VLS_86;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
        to: "/",
        ...{ class: "inline-flex min-w-0 items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "QuickWork - về trang chủ",
    }));
    const __VLS_88 = __VLS_87({
        to: "/",
        ...{ class: "inline-flex min-w-0 items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "QuickWork - về trang chủ",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    const { default: __VLS_91 } = __VLS_89.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: "/images/brand/quickwork-icon-dark-transparent.png",
        alt: "QuickWork",
        ...{ class: "h-12 w-12 shrink-0 rounded-2xl object-contain shadow-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hidden min-w-0 sm:block" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block text-2xl font-black leading-none tracking-normal text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sky-600" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-1 block text-[11px] font-semibold leading-none text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    // @ts-ignore
    [];
    var __VLS_89;
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "hidden items-center gap-8 text-sm font-extrabold text-slate-900 xl:flex" },
        'aria-label': "Điều hướng sinh viên",
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:flex']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.headerNavItems))) {
        let __VLS_92;
        /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
        NuxtLink;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
            key: (item.label),
            to: (item.to),
            ...{ class: "rounded-xl px-1 py-2 transition hover:text-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        }));
        const __VLS_94 = __VLS_93({
            key: (item.label),
            to: (item.to),
            ...{ class: "rounded-xl px-1 py-2 transition hover:text-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        const { default: __VLS_97 } = __VLS_95.slots;
        (item.label);
        // @ts-ignore
        [headerNavItems,];
        var __VLS_95;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex shrink-0 items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleNotifications) },
        type: "button",
        ...{ class: "relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-expanded': (__VLS_ctx.showNotifications),
        'aria-controls': "student-notification-menu",
        'aria-label': "Thông báo",
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
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
    let __VLS_98;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        name: "uil:bell",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_100 = __VLS_99({
        name: "uil:bell",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    if (__VLS_ctx.notificationUnreadCount > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "absolute -right-0.5 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white ring-2 ring-white" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['-right-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['-top-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-rose-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-white']} */ ;
        (__VLS_ctx.notificationUnreadCount > 9 ? '9+' : __VLS_ctx.notificationUnreadCount);
    }
    if (__VLS_ctx.showNotifications) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            id: "student-notification-menu",
            ...{ class: "absolute right-0 z-50 mt-3" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        let __VLS_103;
        /** @ts-ignore @type { | typeof __VLS_components.UiNotificationDropdown} */
        UiNotificationDropdown;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
            ...{ 'onMarkAllRead': {} },
            ...{ 'onOpen': {} },
            ...{ 'onClose': {} },
            title: "Thông báo",
            unreadCount: (__VLS_ctx.notificationUnreadCount),
            loading: (__VLS_ctx.notificationLoading),
            items: (__VLS_ctx.headerNotifications),
            emptyText: "Chưa có thông báo nào.",
            storageKey: "student-layout-header",
            getIcon: (__VLS_ctx.getNotificationIcon),
            getIconClass: (__VLS_ctx.getNotificationIconClass),
        }));
        const __VLS_105 = __VLS_104({
            ...{ 'onMarkAllRead': {} },
            ...{ 'onOpen': {} },
            ...{ 'onClose': {} },
            title: "Thông báo",
            unreadCount: (__VLS_ctx.notificationUnreadCount),
            loading: (__VLS_ctx.notificationLoading),
            items: (__VLS_ctx.headerNotifications),
            emptyText: "Chưa có thông báo nào.",
            storageKey: "student-layout-header",
            getIcon: (__VLS_ctx.getNotificationIcon),
            getIconClass: (__VLS_ctx.getNotificationIconClass),
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        let __VLS_108;
        const __VLS_109 = {
            /** @type {typeof __VLS_108.markAllRead} */
            onMarkAllRead: (__VLS_ctx.markNotificationsRead),
        };
        const __VLS_110 = {
            /** @type {typeof __VLS_108.open} */
            onOpen: (__VLS_ctx.openNotification),
        };
        const __VLS_111 = {
            /** @type {typeof __VLS_108.close} */
            onClose: (__VLS_ctx.closeDropdowns),
        };
        var __VLS_106;
        var __VLS_107;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openMessages) },
        type: "button",
        ...{ class: "relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "Tin nhắn",
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
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
    let __VLS_112;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
        name: "uil:comment-alt-dots",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_114 = __VLS_113({
        name: "uil:comment-alt-dots",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    if (__VLS_ctx.messageUnreadCount > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "absolute -right-0.5 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[11px] font-black text-white ring-2 ring-white" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['-right-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['-top-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-white']} */ ;
        (__VLS_ctx.messageUnreadCount > 9 ? '9+' : __VLS_ctx.messageUnreadCount);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleUserMenu) },
        type: "button",
        ...{ class: "inline-flex items-center gap-3 rounded-full bg-white p-1.5 pr-3 text-left text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-expanded': (__VLS_ctx.showUserMenu),
        'aria-controls': "student-user-menu",
        'aria-label': "Mở menu tài khoản",
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    let __VLS_117;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
        name: "uil:user",
        ...{ class: "h-7 w-7" },
        'aria-hidden': "true",
    }));
    const __VLS_119 = __VLS_118({
        name: "uil:user",
        ...{ class: "h-7 w-7" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hidden min-w-0 lg:block" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block max-w-40 truncate text-sm font-black text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    (__VLS_ctx.userName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block text-xs font-semibold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    let __VLS_122;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
        name: "uil:angle-down",
        ...{ class: (['h-4 w-4 text-slate-500 transition-transform duration-200', __VLS_ctx.showUserMenu ? 'rotate-180' : '']) },
        'aria-hidden': "true",
    }));
    const __VLS_124 = __VLS_123({
        name: "uil:angle-down",
        ...{ class: (['h-4 w-4 text-slate-500 transition-transform duration-200', __VLS_ctx.showUserMenu ? 'rotate-180' : '']) },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
    let __VLS_127;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
        enterActiveClass: "transition duration-150 ease-out",
        enterFromClass: "translate-y-1 opacity-0",
        enterToClass: "translate-y-0 opacity-100",
        leaveActiveClass: "transition duration-100 ease-in",
        leaveFromClass: "translate-y-0 opacity-100",
        leaveToClass: "translate-y-1 opacity-0",
    }));
    const __VLS_129 = __VLS_128({
        enterActiveClass: "transition duration-150 ease-out",
        enterFromClass: "translate-y-1 opacity-0",
        enterToClass: "translate-y-0 opacity-100",
        leaveActiveClass: "transition duration-100 ease-in",
        leaveFromClass: "translate-y-0 opacity-100",
        leaveToClass: "translate-y-1 opacity-0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    const { default: __VLS_132 } = __VLS_130.slots;
    if (__VLS_ctx.showUserMenu) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            id: "student-user-menu",
            ...{ class: "absolute right-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-slate-200 bg-white text-sm text-slate-700 shadow-2xl shadow-slate-200/80" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[360px]']} */ ;
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
            ...{ class: "border-b border-slate-100 p-5" },
        });
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "truncate text-lg font-black text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
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
            ...{ class: "max-h-[min(28rem,calc(100vh-12rem))] overflow-y-auto p-3" },
        });
        /** @type {__VLS_StyleScopedClasses['max-h-[min(28rem,calc(100vh-12rem))]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.quickAccountItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isPublicStudentBoard))
                            return;
                        if (!(__VLS_ctx.showUserMenu))
                            return;
                        __VLS_ctx.openAccountItem(item);
                        // @ts-ignore
                        [toggleNotifications, showNotifications, showNotifications, toggleUserMenu, userName, userName, showUserMenu, showUserMenu, showUserMenu, userEmail, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, notificationUnreadCount, notificationLoading, headerNotifications, getNotificationIcon, getNotificationIconClass, markNotificationsRead, openNotification, closeDropdowns, openMessages, messageUnreadCount, messageUnreadCount, messageUnreadCount, quickAccountItems, openAccountItem,];
                    } },
                key: (item.label),
                type: "button",
                ...{ class: "flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-h-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            let __VLS_133;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
                name: (item.icon),
                ...{ class: "h-5 w-5 text-sky-600" },
                'aria-hidden': "true",
            }));
            const __VLS_135 = __VLS_134({
                name: (item.icon),
                ...{ class: "h-5 w-5 text-sky-600" },
                'aria-hidden': "true",
            }, ...__VLS_functionalComponentArgsRest(__VLS_134));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (item.label);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-slate-50 p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.handleLogout) },
            type: "button",
            ...{ class: "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
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
        let __VLS_138;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
            name: "uil:sign-out-alt",
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }));
        const __VLS_140 = __VLS_139({
            name: "uil:sign-out-alt",
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
    // @ts-ignore
    [handleLogout,];
    var __VLS_130;
    if (__VLS_ctx.isSidebarOpen) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isPublicStudentBoard))
                        return;
                    if (!(__VLS_ctx.isSidebarOpen))
                        return;
                    __VLS_ctx.isSidebarOpen = false;
                    // @ts-ignore
                    [isSidebarOpen, isSidebarOpen,];
                } },
            ...{ class: "fixed inset-x-0 bottom-0 top-[78px] z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-[78px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-950/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ onClick: () => { } },
        ...{ class: ([
                'fixed bottom-0 left-0 top-[78px] z-40 flex w-[280px] flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/60 transition-all duration-300 lg:translate-x-0',
                __VLS_ctx.isSidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]',
                __VLS_ctx.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            ]) },
        'aria-label': "Điều hướng khu vực sinh viên",
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[78px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[280px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-200/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:translate-x-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isPublicStudentBoard))
                    return;
                __VLS_ctx.isSidebarCollapsed = !__VLS_ctx.isSidebarCollapsed;
                // @ts-ignore
                [isSidebarOpen, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed,];
            } },
        type: "button",
        ...{ class: ([
                'absolute -right-4 top-5 hidden h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-700 shadow-lg shadow-sky-100 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 lg:inline-flex',
                __VLS_ctx.isSidebarCollapsed ? 'rotate-180' : ''
            ]) },
        'aria-label': (__VLS_ctx.isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'),
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['-right-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sky-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:inline-flex']} */ ;
    let __VLS_143;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
        name: "uil:angle-left",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_145 = __VLS_144({
        name: "uil:angle-left",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "student-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5" },
    });
    /** @type {__VLS_StyleScopedClasses['student-sidebar-scroll']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    for (const [group] of __VLS_vFor((__VLS_ctx.sidebarGroups))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            key: (group.id),
            ...{ class: "pb-5" },
        });
        /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: (['mb-3 flex items-center', __VLS_ctx.isSidebarCollapsed ? 'justify-center' : 'gap-3']) },
        });
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        if (!__VLS_ctx.isSidebarCollapsed) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[11px] font-black uppercase tracking-wide text-slate-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
            (group.label);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "h-px flex-1 bg-slate-200" },
        });
        /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-200']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        for (const [item] of __VLS_vFor((group.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsics.template)({
                key: (item.label),
            });
            if (item.to) {
                let __VLS_148;
                /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
                NuxtLink;
                // @ts-ignore
                const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
                    ...{ 'onClick': {} },
                    to: (item.to),
                    ...{ class: (__VLS_ctx.sidebarItemClass(item)) },
                    'aria-label': (item.label),
                }));
                const __VLS_150 = __VLS_149({
                    ...{ 'onClick': {} },
                    to: (item.to),
                    ...{ class: (__VLS_ctx.sidebarItemClass(item)) },
                    'aria-label': (item.label),
                }, ...__VLS_functionalComponentArgsRest(__VLS_149));
                let __VLS_153;
                const __VLS_154 = {
                    /** @type {typeof __VLS_153.click} */
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isPublicStudentBoard))
                            return;
                        if (!(item.to))
                            return;
                        __VLS_ctx.isSidebarOpen = false;
                        // @ts-ignore
                        [isSidebarOpen, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, sidebarGroups, sidebarItemClass,];
                    },
                };
                const { default: __VLS_155 } = __VLS_151.slots;
                let __VLS_156;
                /** @ts-ignore @type { | typeof __VLS_components.Icon} */
                Icon;
                // @ts-ignore
                const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
                    name: (item.icon),
                    ...{ class: "h-5 w-5 shrink-0" },
                    'aria-hidden': "true",
                }));
                const __VLS_158 = __VLS_157({
                    name: (item.icon),
                    ...{ class: "h-5 w-5 shrink-0" },
                    'aria-hidden': "true",
                }, ...__VLS_functionalComponentArgsRest(__VLS_157));
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                if (!__VLS_ctx.isSidebarCollapsed) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "truncate" },
                    });
                    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                    (item.label);
                }
                if (!__VLS_ctx.isSidebarCollapsed && item.badge) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-600" },
                    });
                    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-rose-100']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
                    (item.badge);
                }
                // @ts-ignore
                [isSidebarCollapsed, isSidebarCollapsed,];
                var __VLS_151;
                var __VLS_152;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.isPublicStudentBoard))
                                return;
                            if (!!(item.to))
                                return;
                            __VLS_ctx.notifyDevelopment(item.label);
                            // @ts-ignore
                            [notifyDevelopment,];
                        } },
                    type: "button",
                    ...{ class: (__VLS_ctx.sidebarItemClass(item)) },
                    'aria-label': (item.label),
                });
                let __VLS_161;
                /** @ts-ignore @type { | typeof __VLS_components.Icon} */
                Icon;
                // @ts-ignore
                const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
                    name: (item.icon),
                    ...{ class: "h-5 w-5 shrink-0" },
                    'aria-hidden': "true",
                }));
                const __VLS_163 = __VLS_162({
                    name: (item.icon),
                    ...{ class: "h-5 w-5 shrink-0" },
                    'aria-hidden': "true",
                }, ...__VLS_functionalComponentArgsRest(__VLS_162));
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                if (!__VLS_ctx.isSidebarCollapsed) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "truncate" },
                    });
                    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                    (item.label);
                }
                if (!__VLS_ctx.isSidebarCollapsed && item.badge) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-600" },
                    });
                    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-rose-100']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
                    (item.badge);
                }
            }
            // @ts-ignore
            [isSidebarCollapsed, isSidebarCollapsed, sidebarItemClass,];
        }
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-t border-slate-200 p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    if (!__VLS_ctx.isSidebarCollapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4 rounded-[22px] border border-sky-100 bg-sky-50/80 p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-[22px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-sky-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-50/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        let __VLS_166;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_167 = __VLS_asFunctionalComponent1(__VLS_166, new __VLS_166({
            name: "uil:file-check-alt",
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }));
        const __VLS_168 = __VLS_167({
            name: "uil:file-check-alt",
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }, ...__VLS_functionalComponentArgsRest(__VLS_167));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-w-0" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "truncate text-sm font-black text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-4 h-2 rounded-full bg-white" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ class: "h-full w-[65%] rounded-full bg-sky-500" },
        });
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[65%]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isPublicStudentBoard))
                        return;
                    if (!(!__VLS_ctx.isSidebarCollapsed))
                        return;
                    __VLS_ctx.navigateTo('/profile');
                    // @ts-ignore
                    [isSidebarCollapsed, navigateTo,];
                } },
            type: "button",
            ...{ class: "mt-4 inline-flex items-center gap-2 text-sm font-black text-sky-700 hover:text-sky-800" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-800']} */ ;
        let __VLS_171;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({
            name: "uil:arrow-right",
            ...{ class: "h-4 w-4" },
            'aria-hidden': "true",
        }));
        const __VLS_173 = __VLS_172({
            name: "uil:arrow-right",
            ...{ class: "h-4 w-4" },
            'aria-hidden': "true",
        }, ...__VLS_functionalComponentArgsRest(__VLS_172));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleLogout) },
        type: "button",
        ...{ class: ([
                'inline-flex h-12 items-center gap-3 rounded-2xl px-4 text-left font-black text-rose-500 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100',
                __VLS_ctx.isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full'
            ]) },
        'aria-label': "Đăng xuất",
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-rose-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-rose-100']} */ ;
    let __VLS_176;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent1(__VLS_176, new __VLS_176({
        name: "uil:sign-out-alt",
        ...{ class: "h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }));
    const __VLS_178 = __VLS_177({
        name: "uil:sign-out-alt",
        ...{ class: "h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    if (!__VLS_ctx.isSidebarCollapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: ([
                'pt-[78px] transition-all duration-300',
                __VLS_ctx.isSidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[280px]'
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['pt-[78px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-h-[calc(100vh-78px)] px-4 py-6 sm:px-6 lg:px-8" },
    });
    /** @type {__VLS_StyleScopedClasses['min-h-[calc(100vh-78px)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
    var __VLS_181 = {};
}
// @ts-ignore
var __VLS_73 = __VLS_72, __VLS_182 = __VLS_181;
// @ts-ignore
[handleLogout, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed,];
const __VLS_base = (await import('vue')).defineComponent({});
const __VLS_export = {};
export default {};
