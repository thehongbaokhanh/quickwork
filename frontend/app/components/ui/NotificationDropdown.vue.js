import { computed, ref, watch } from 'vue';
const props = withDefaults(defineProps(), {
    viewAllTo: '',
    viewAllLabel: 'Xem tất cả thông báo',
    storageKey: '',
    getIcon: () => 'uil:bell',
    getIconClass: () => 'bg-slate-50 text-slate-600'
});
const __VLS_emit = defineEmits();
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const pageSize = 5;
const olderVisibleCount = ref(0);
const persistedKey = computed(() => `quickwork:notification-dropdown:${props.storageKey || props.title}`);
const recentItems = computed(() => props.items.filter(isWithinLastDay));
const olderItems = computed(() => props.items.filter((item) => !isWithinLastDay(item)));
const visibleOlderItems = computed(() => olderItems.value.slice(0, olderVisibleCount.value));
const remainingOlderCount = computed(() => Math.max(0, olderItems.value.length - olderVisibleCount.value));
watch(() => props.items.map((item) => item.id).join('|'), () => {
    restoreOlderVisibleCount();
}, { immediate: true });
function showMoreOlder() {
    olderVisibleCount.value = Math.min(olderItems.value.length, olderVisibleCount.value + pageSize);
    persistOlderVisibleCount();
}
function isWithinLastDay(item) {
    const date = new Date(item?.created_at || '');
    if (Number.isNaN(date.getTime()))
        return false;
    return Date.now() - date.getTime() <= ONE_DAY_IN_MS;
}
function restoreOlderVisibleCount() {
    const storedCount = readStoredOlderVisibleCount();
    olderVisibleCount.value = Math.min(olderItems.value.length, Math.max(olderVisibleCount.value, storedCount));
}
function readStoredOlderVisibleCount() {
    if (!process.client || typeof window === 'undefined')
        return 0;
    try {
        const storedValue = window.sessionStorage.getItem(persistedKey.value);
        const count = Number(storedValue);
        return Number.isFinite(count) && count > 0 ? count : 0;
    }
    catch {
        return 0;
    }
}
function persistOlderVisibleCount() {
    if (!process.client || typeof window === 'undefined')
        return;
    try {
        window.sessionStorage.setItem(persistedKey.value, String(olderVisibleCount.value));
    }
    catch {
        // Storage can be blocked by the browser; the dropdown still works in memory.
    }
}
const __VLS_defaults = {
    viewAllTo: '',
    viewAllLabel: 'Xem tất cả thông báo',
    storageKey: '',
    getIcon: () => 'uil:bell',
    getIconClass: () => 'bg-slate-50 text-slate-600'
};
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
/** @type {__VLS_StyleScopedClasses['notification-dropdown-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-dropdown-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-dropdown-scroll']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm shadow-2xl shadow-slate-950/10" },
});
/** @type {__VLS_StyleScopedClasses['w-[22rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[calc(100vw-2rem)]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-950/10']} */ ;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-w-0" },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "truncate font-black text-slate-950" },
});
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
(__VLS_ctx.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-0.5 text-xs font-semibold text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(__VLS_ctx.unreadCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('markAllRead');
            // @ts-ignore
            [title, unreadCount, $emit,];
        } },
    type: "button",
    ...{ class: "rounded-lg px-2 py-1 text-xs font-black text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50" },
    disabled: (__VLS_ctx.unreadCount === 0),
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
if (__VLS_ctx.loading) {
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
        [unreadCount, loading,];
    }
}
else if (__VLS_ctx.items.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-4 py-5 text-sm font-semibold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.emptyText);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "notification-dropdown-scroll max-h-[min(30rem,calc(100vh-12rem))] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['notification-dropdown-scroll']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[min(30rem,calc(100vh-12rem))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-2 backdrop-blur" },
    });
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[11px] font-black uppercase tracking-wide text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    if (__VLS_ctx.recentItems.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "px-4 py-4 text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
    for (const [item] of __VLS_vFor((__VLS_ctx.recentItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.items.length === 0))
                        return;
                    __VLS_ctx.$emit('open', item);
                    // @ts-ignore
                    [$emit, items, emptyText, recentItems, recentItems,];
                } },
            key: (`recent-${item.id}`),
            type: "button",
            ...{ class: "flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-sky-50/70 focus:outline-none focus-visible:bg-sky-50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-inset']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (['mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', __VLS_ctx.getIconClass(item.type)]) },
        });
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            name: (__VLS_ctx.getIcon(item.type)),
            ...{ class: "h-4.5 w-4.5" },
        }));
        const __VLS_2 = __VLS_1({
            name: (__VLS_ctx.getIcon(item.type)),
            ...{ class: "h-4.5 w-4.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
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
        [getIconClass, getIcon,];
    }
    if (__VLS_ctx.olderItems.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "bg-slate-50/70" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-slate-50/70']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-b border-slate-100 px-4 py-2" },
        });
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[11px] font-black uppercase tracking-wide text-slate-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.visibleOlderItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.items.length === 0))
                            return;
                        if (!(__VLS_ctx.olderItems.length > 0))
                            return;
                        __VLS_ctx.$emit('open', item);
                        // @ts-ignore
                        [$emit, olderItems, visibleOlderItems,];
                    } },
                key: (`older-${item.id}`),
                type: "button",
                ...{ class: "flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-sky-50/70 focus:outline-none focus-visible:bg-sky-50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-inset']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: (['mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', __VLS_ctx.getIconClass(item.type)]) },
            });
            /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            let __VLS_5;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                name: (__VLS_ctx.getIcon(item.type)),
                ...{ class: "h-4.5 w-4.5" },
            }));
            const __VLS_7 = __VLS_6({
                name: (__VLS_ctx.getIcon(item.type)),
                ...{ class: "h-4.5 w-4.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
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
            [getIconClass, getIcon,];
        }
        if (__VLS_ctx.remainingOlderCount > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "px-4 py-3" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.showMoreOlder) },
                type: "button",
                ...{ class: "flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-black text-sky-700 transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-sky-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            let __VLS_10;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                name: "uil:angle-down",
                ...{ class: "h-4 w-4" },
                'aria-hidden': "true",
            }));
            const __VLS_12 = __VLS_11({
                name: "uil:angle-down",
                ...{ class: "h-4 w-4" },
                'aria-hidden': "true",
            }, ...__VLS_functionalComponentArgsRest(__VLS_11));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            (Math.min(__VLS_ctx.pageSize, __VLS_ctx.remainingOlderCount));
        }
    }
}
if (__VLS_ctx.viewAllTo) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-t border-slate-100 p-3" },
    });
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    let __VLS_15;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        ...{ 'onClick': {} },
        to: (__VLS_ctx.viewAllTo),
        ...{ class: "flex h-10 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
    }));
    const __VLS_17 = __VLS_16({
        ...{ 'onClick': {} },
        to: (__VLS_ctx.viewAllTo),
        ...{ class: "flex h-10 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_20;
    const __VLS_21 = {
        /** @type {typeof __VLS_20.click} */
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.viewAllTo))
                return;
            __VLS_ctx.$emit('close');
            // @ts-ignore
            [$emit, remainingOlderCount, remainingOlderCount, showMoreOlder, pageSize, viewAllTo, viewAllTo,];
        },
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
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    const { default: __VLS_22 } = __VLS_18.slots;
    (__VLS_ctx.viewAllLabel);
    // @ts-ignore
    [viewAllLabel,];
    var __VLS_18;
    var __VLS_19;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
