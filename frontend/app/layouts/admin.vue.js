import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { NotificationService } from '~/services/notification.service';
const authStore = useAuthStore();
const route = useRoute();
const toast = useToast();
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const showUserMenu = ref(false);
const showNotifications = ref(false);
const adminNotifications = ref([]);
const adminUnreadCount = ref(0);
const adminNotificationLoading = ref(false);
const handleLogout = async () => {
    await authStore.logout();
    toast.info('Đăng xuất thành công', 'Hẹn gặp lại!');
};
const adminName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Admin');
const userEmail = computed(() => authStore.user?.email || '');
const adminInitials = computed(() => {
    const source = adminName.value.trim() || 'AD';
    return source
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
});
const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
    showUserMenu.value = false;
    if (showNotifications.value) {
        loadAdminNotifications();
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
const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        closeDropdowns();
    }
};
onMounted(() => {
    if (process.client) {
        window.addEventListener('click', closeDropdowns);
        window.addEventListener('keydown', handleKeyDown);
    }
    loadAdminNotifications();
});
onUnmounted(() => {
    if (process.client) {
        window.removeEventListener('click', closeDropdowns);
        window.removeEventListener('keydown', handleKeyDown);
    }
});
const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'uil:apps' },
    { name: 'Người dùng', path: '/admin/users', icon: 'uil:users-alt' },
    { name: 'Học viên', path: '/admin/students', icon: 'uil:graduation-cap' },
    { name: 'Doanh nghiệp', path: '/admin/enterprises', icon: 'uil:building' },
    { name: 'Việc làm', path: '/admin/jobs', icon: 'uil:briefcase-alt' },
    { name: 'Ứng tuyển', path: '/admin/applications', icon: 'uil:file-alt' },
    { name: 'Danh mục', path: '/admin/categories', icon: 'uil:tag-alt' },
    { name: 'Báo cáo', path: '/admin/reports', icon: 'uil:chart-line' },
    { name: 'Cài đặt', path: '/admin/settings', icon: 'uil:setting' }
];
const currentRouteName = computed(() => {
    const item = menuItems.find(m => route.path.startsWith(m.path));
    return item ? item.name : 'Trang quản trị';
});
const currentRouteIcon = computed(() => {
    const item = menuItems.find(m => route.path.startsWith(m.path));
    return item?.icon || 'uil:shield-check';
});
async function loadAdminNotifications() {
    adminNotificationLoading.value = true;
    try {
        const [listResponse, unreadResponse] = await Promise.all([
            NotificationService.list({ page: 1, page_size: 100 }),
            NotificationService.unreadCount()
        ]);
        adminNotifications.value = listResponse?.data?.items || [];
        adminUnreadCount.value = Number(unreadResponse?.data?.unread_count || 0);
    }
    catch {
        adminNotifications.value = [];
        adminUnreadCount.value = 0;
    }
    finally {
        adminNotificationLoading.value = false;
    }
}
async function markAdminNotificationsRead() {
    try {
        await NotificationService.markAllAsRead();
        await loadAdminNotifications();
    }
    catch (error) {
        toast.error('Không thể cập nhật thông báo', error?.data?.message || error?.message || 'Vui lòng thử lại.');
    }
}
async function openAdminNotification(item) {
    try {
        if (!item.is_read) {
            await NotificationService.markAsRead(item.id);
            item.is_read = true;
            adminUnreadCount.value = Math.max(0, adminUnreadCount.value - 1);
        }
    }
    catch {
        // Keep the dropdown responsive even if the read-state update fails.
    }
    const target = normalizeAdminActionURL(item.action_url);
    if (target) {
        closeDropdowns();
        await navigateTo(target);
    }
}
function normalizeAdminActionURL(value) {
    if (!value)
        return '';
    if (value.startsWith('/admin/') || value.startsWith('/enterprise/') || value.startsWith('/student/'))
        return value;
    return '';
}
function getAdminNotificationIcon(type) {
    if (type === 'KYB')
        return 'uil:shield-check';
    if (type === 'MESSAGE')
        return 'uil:comment-alt-message';
    if (type === 'JOB')
        return 'uil:briefcase-alt';
    if (type === 'APPLICATION')
        return 'uil:user-plus';
    return 'uil:bell';
}
function getAdminNotificationIconClass(type) {
    if (type === 'KYB')
        return 'bg-cyan-50 text-cyan-700';
    if (type === 'MESSAGE')
        return 'bg-violet-50 text-violet-700';
    if (type === 'JOB')
        return 'bg-sky-50 text-sky-700';
    if (type === 'APPLICATION')
        return 'bg-emerald-50 text-emerald-700';
    return 'bg-slate-50 text-slate-600';
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['custom-scrollbar']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-scrollbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-1 h-screen overflow-hidden" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
if (__VLS_ctx.isSidebarOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isSidebarOpen))
                    return;
                __VLS_ctx.isSidebarOpen = false;
                // @ts-ignore
                [isSidebarOpen, isSidebarOpen,];
            } },
        ...{ class: "fixed inset-0 z-30 bg-slate-950/50 md:hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: ([
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-900 bg-slate-950 text-white transition-[transform,width] duration-200 md:relative md:translate-x-0',
            __VLS_ctx.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            __VLS_ctx.isSidebarCollapsed ? 'md:w-20 sidebar-collapsed' : 'md:w-64'
        ]) },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-64']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-[transform,width]']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['md:relative']} */ ;
/** @type {__VLS_StyleScopedClasses['md:translate-x-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: (['relative h-16 flex items-center border-b border-white/10', __VLS_ctx.isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-5']) },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: (['flex min-w-0 items-center', __VLS_ctx.isSidebarCollapsed ? 'justify-center' : 'gap-3']) },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300 shadow-sm shadow-sky-950/30" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-sky-400/20']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-sky-400/10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-300']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sky-950/30']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: "uil:shield-check",
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}));
const __VLS_2 = __VLS_1({
    name: "uil:shield-check",
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
if (!__VLS_ctx.isSidebarCollapsed) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "min-w-0" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block truncate text-sm font-black uppercase text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-0.5 block truncate text-[11px] font-semibold text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isSidebarCollapsed = !__VLS_ctx.isSidebarCollapsed;
            // @ts-ignore
            [isSidebarOpen, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed,];
        } },
    type: "button",
    ...{ class: "hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-slate-800 shadow-md shadow-slate-950/20 ring-2 ring-slate-100 transition hover:border-sky-500 hover:bg-sky-600 hover:text-white hover:ring-sky-100 md:absolute md:-right-3 md:top-1/2 md:inline-flex md:-translate-y-1/2" },
    'aria-label': (__VLS_ctx.isSidebarCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'),
});
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
/** @type {__VLS_StyleScopedClasses['md:absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['md:-right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['md:top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['md:-translate-y-1/2']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    name: (__VLS_ctx.isSidebarCollapsed ? 'uil:angle-right-b' : 'uil:angle-left-b'),
    ...{ class: "h-4 w-4" },
}));
const __VLS_7 = __VLS_6({
    name: (__VLS_ctx.isSidebarCollapsed ? 'uil:angle-right-b' : 'uil:angle-left-b'),
    ...{ class: "h-4 w-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-scrollbar']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.menuItems))) {
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        ...{ 'onClick': {} },
        key: (item.path),
        to: (item.path),
        activeClass: "bg-sky-500 text-slate-950 font-black shadow-sm shadow-sky-950/20",
        ...{ class: ([
                'flex items-center rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
                __VLS_ctx.isSidebarCollapsed ? 'justify-center' : 'gap-3'
            ]) },
        title: (__VLS_ctx.isSidebarCollapsed ? item.name : undefined),
    }));
    const __VLS_12 = __VLS_11({
        ...{ 'onClick': {} },
        key: (item.path),
        to: (item.path),
        activeClass: "bg-sky-500 text-slate-950 font-black shadow-sm shadow-sky-950/20",
        ...{ class: ([
                'flex items-center rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
                __VLS_ctx.isSidebarCollapsed ? 'justify-center' : 'gap-3'
            ]) },
        title: (__VLS_ctx.isSidebarCollapsed ? item.name : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    let __VLS_15;
    const __VLS_16 = {
        /** @type {typeof __VLS_15.click} */
        onClick: (...[$event]) => {
            __VLS_ctx.isSidebarOpen = false;
            // @ts-ignore
            [isSidebarOpen, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, isSidebarCollapsed, menuItems,];
        },
    };
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    const { default: __VLS_17 } = __VLS_13.slots;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        name: (item.icon),
        ...{ class: "w-5 h-5 shrink-0" },
    }));
    const __VLS_20 = __VLS_19({
        name: (item.icon),
        ...{ class: "w-5 h-5 shrink-0" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    if (!__VLS_ctx.isSidebarCollapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (item.name);
    }
    // @ts-ignore
    [isSidebarCollapsed,];
    var __VLS_13;
    var __VLS_14;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-footer p-4 border-t border-white/10" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleLogout) },
    ...{ class: ([
            'flex w-full items-center rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
            __VLS_ctx.isSidebarCollapsed ? 'justify-center' : 'gap-3'
        ]) },
    title: (__VLS_ctx.isSidebarCollapsed ? 'Dang xuat' : undefined),
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    name: "uil:sign-out-alt",
    ...{ class: "w-5 h-5 shrink-0" },
}));
const __VLS_25 = __VLS_24({
    name: "uil:sign-out-alt",
    ...{ class: "w-5 h-5 shrink-0" },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 flex flex-col min-w-0 bg-slate-100 relative z-10" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-30']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/95']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
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
    ...{ class: "flex min-w-0 items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isSidebarOpen = true;
            // @ts-ignore
            [isSidebarOpen, isSidebarCollapsed, isSidebarCollapsed, handleLogout,];
        } },
    ...{ class: "rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden" },
    'aria-label': "Mở menu",
});
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
let __VLS_28;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    name: "uil:bars",
    ...{ class: "h-5 w-5" },
}));
const __VLS_30 = __VLS_29({
    name: "uil:bars",
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
let __VLS_33;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    to: "/admin/dashboard",
    ...{ class: "flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
}));
const __VLS_35 = __VLS_34({
    to: "/admin/dashboard",
    ...{ class: "flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
const { default: __VLS_38 } = __VLS_36.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-sky-100']} */ ;
let __VLS_39;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    name: (__VLS_ctx.currentRouteIcon),
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}));
const __VLS_41 = __VLS_40({
    name: (__VLS_ctx.currentRouteIcon),
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
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
    ...{ class: "block max-w-40 truncate text-[11px] font-semibold leading-tight text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(__VLS_ctx.currentRouteName);
// @ts-ignore
[currentRouteIcon, currentRouteName,];
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 lg:flex" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
let __VLS_44;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    name: "uil:shield-check",
    ...{ class: "h-4 w-4 text-sky-600" },
}));
const __VLS_46 = __VLS_45({
    name: "uil:shield-check",
    ...{ class: "h-4 w-4 text-sky-600" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
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
let __VLS_49;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    name: "uil:bell",
    ...{ class: "h-5 w-5" },
}));
const __VLS_51 = __VLS_50({
    name: "uil:bell",
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
if (__VLS_ctx.adminUnreadCount > 0) {
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
    (__VLS_ctx.adminUnreadCount > 9 ? '9+' : __VLS_ctx.adminUnreadCount);
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
    let __VLS_54;
    /** @ts-ignore @type { | typeof __VLS_components.UiNotificationDropdown} */
    UiNotificationDropdown;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
        ...{ 'onMarkAllRead': {} },
        ...{ 'onOpen': {} },
        title: "Thông báo quản trị",
        unreadCount: (__VLS_ctx.adminUnreadCount),
        loading: (__VLS_ctx.adminNotificationLoading),
        items: (__VLS_ctx.adminNotifications),
        emptyText: "Chưa có thông báo quản trị nào.",
        storageKey: "admin-header",
        getIcon: (__VLS_ctx.getAdminNotificationIcon),
        getIconClass: (__VLS_ctx.getAdminNotificationIconClass),
    }));
    const __VLS_56 = __VLS_55({
        ...{ 'onMarkAllRead': {} },
        ...{ 'onOpen': {} },
        title: "Thông báo quản trị",
        unreadCount: (__VLS_ctx.adminUnreadCount),
        loading: (__VLS_ctx.adminNotificationLoading),
        items: (__VLS_ctx.adminNotifications),
        emptyText: "Chưa có thông báo quản trị nào.",
        storageKey: "admin-header",
        getIcon: (__VLS_ctx.getAdminNotificationIcon),
        getIconClass: (__VLS_ctx.getAdminNotificationIconClass),
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_59;
    const __VLS_60 = {
        /** @type {typeof __VLS_59.markAllRead} */
        onMarkAllRead: (__VLS_ctx.markAdminNotificationsRead),
    };
    const __VLS_61 = {
        /** @type {typeof __VLS_59.open} */
        onOpen: (__VLS_ctx.openAdminNotification),
    };
    var __VLS_57;
    var __VLS_58;
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
(__VLS_ctx.adminInitials);
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
(__VLS_ctx.adminName);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "block max-w-36 truncate text-[11px] text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-36']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(__VLS_ctx.userEmail || 'Tài khoản quản trị');
let __VLS_62;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    name: "uil:angle-down",
    ...{ class: "hidden h-4 w-4 text-slate-400 sm:block" },
}));
const __VLS_64 = __VLS_63({
    name: "uil:angle-down",
    ...{ class: "hidden h-4 w-4 text-slate-400 sm:block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
let __VLS_67;
/** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "scale-95 opacity-0",
    enterToClass: "scale-100 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "scale-100 opacity-100",
    leaveToClass: "scale-95 opacity-0",
}));
const __VLS_69 = __VLS_68({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "scale-95 opacity-0",
    enterToClass: "scale-100 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "scale-100 opacity-100",
    leaveToClass: "scale-95 opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_72 } = __VLS_70.slots;
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
    (__VLS_ctx.adminName);
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
    let __VLS_73;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
        ...{ 'onClick': {} },
        to: "/admin/settings",
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }));
    const __VLS_75 = __VLS_74({
        ...{ 'onClick': {} },
        to: "/admin/settings",
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    let __VLS_78;
    const __VLS_79 = {
        /** @type {typeof __VLS_78.click} */
        onClick: (__VLS_ctx.closeDropdowns),
    };
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
    const { default: __VLS_80 } = __VLS_76.slots;
    let __VLS_81;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        name: "uil:setting",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }));
    const __VLS_83 = __VLS_82({
        name: "uil:setting",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [toggleNotifications, adminUnreadCount, adminUnreadCount, adminUnreadCount, adminUnreadCount, showNotifications, adminNotificationLoading, adminNotifications, getAdminNotificationIcon, getAdminNotificationIconClass, markAdminNotificationsRead, openAdminNotification, toggleUserMenu, adminInitials, adminName, adminName, userEmail, userEmail, showUserMenu, closeDropdowns,];
    var __VLS_76;
    var __VLS_77;
    let __VLS_86;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
        ...{ 'onClick': {} },
        to: "/admin/dashboard",
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }));
    const __VLS_88 = __VLS_87({
        ...{ 'onClick': {} },
        to: "/admin/dashboard",
        ...{ class: "flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    let __VLS_91;
    const __VLS_92 = {
        /** @type {typeof __VLS_91.click} */
        onClick: (__VLS_ctx.closeDropdowns),
    };
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
    const { default: __VLS_93 } = __VLS_89.slots;
    let __VLS_94;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
        name: "uil:apps",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }));
    const __VLS_96 = __VLS_95({
        name: "uil:apps",
        ...{ class: "h-4.5 w-4.5 text-slate-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [closeDropdowns,];
    var __VLS_89;
    var __VLS_90;
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
    let __VLS_99;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        name: "uil:sign-out-alt",
        ...{ class: "h-4.5 w-4.5" },
    }));
    const __VLS_101 = __VLS_100({
        name: "uil:sign-out-alt",
        ...{ class: "h-4.5 w-4.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[handleLogout,];
var __VLS_70;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:p-8']} */ ;
var __VLS_104 = {};
// @ts-ignore
var __VLS_105 = __VLS_104;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({});
const __VLS_export = {};
export default {};
