import { computed } from 'vue';
import ScrollSelect from '~/components/ui/ScrollSelect.vue';
const props = withDefaults(defineProps(), {
    itemLabel: 'bản ghi',
    pageSizeOptions: () => [
        { value: 5, label: '5 / trang' },
        { value: 10, label: '10 / trang' },
        { value: 20, label: '20 / trang' },
        { value: 50, label: '50 / trang' }
    ]
});
const emit = defineEmits();
const normalizedPageSize = computed(() => {
    const size = Number(props.pageSize);
    return Number.isFinite(size) && size > 0 ? size : 10;
});
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / normalizedPageSize.value)));
const safePage = computed(() => Math.min(Math.max(Number(props.page) || 1, 1), totalPages.value));
const pageStart = computed(() => (props.total === 0 ? 0 : (safePage.value - 1) * normalizedPageSize.value + 1));
const pageEnd = computed(() => Math.min(safePage.value * normalizedPageSize.value, props.total));
const resolvedPageSizeOptions = computed(() => props.pageSizeOptions);
const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = safePage.value;
    if (total <= 6) {
        for (let page = 1; page <= total; page += 1)
            pages.push(page);
        return pages;
    }
    pages.push(1);
    if (current > 3)
        pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let page = start; page <= end; page += 1)
        pages.push(page);
    if (current < total - 2)
        pages.push('...');
    pages.push(total);
    return pages;
});
function goToPage(page) {
    emit('update:page', Math.min(Math.max(page, 1), totalPages.value));
}
function handlePageSizeChange(value) {
    const size = Number(value);
    emit('update:pageSize', Number.isFinite(size) && size > 0 ? size : 10);
    emit('update:page', 1);
}
const __VLS_defaults = {
    itemLabel: 'bản ghi',
    pageSizeOptions: () => [
        { value: 5, label: '5 / trang' },
        { value: 10, label: '10 / trang' },
        { value: 20, label: '20 / trang' },
        { value: 50, label: '50 / trang' }
    ]
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
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:px-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-2 sm:flex-row sm:items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-bold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.itemLabel);
    const __VLS_0 = ScrollSelect;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.pageSize),
        ...{ class: "w-36" },
        options: (__VLS_ctx.resolvedPageSizeOptions),
        ariaLabel: (`Số lượng ${__VLS_ctx.itemLabel} trong một trang`),
        icon: "uil:list-ul",
        size: "sm",
        tone: "sky",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.pageSize),
        ...{ class: "w-36" },
        options: (__VLS_ctx.resolvedPageSizeOptions),
        ariaLabel: (`Số lượng ${__VLS_ctx.itemLabel} trong một trang`),
        icon: "uil:list-ul",
        size: "sm",
        tone: "sky",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.'update:modelValue'} */
        'onUpdate:modelValue': (__VLS_ctx.handlePageSizeChange),
    };
    /** @type {__VLS_StyleScopedClasses['w-36']} */ ;
    var __VLS_3;
    var __VLS_4;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-semibold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.pageStart);
    (__VLS_ctx.pageEnd);
    (__VLS_ctx.total);
    (__VLS_ctx.itemLabel);
    if (__VLS_ctx.totalPages > 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
            ...{ class: "flex items-center justify-end gap-2" },
            'aria-label': "Phân trang bảng quản trị",
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.total > 0))
                        return;
                    if (!(__VLS_ctx.totalPages > 1))
                        return;
                    __VLS_ctx.goToPage(__VLS_ctx.safePage - 1);
                    // @ts-ignore
                    [total, total, itemLabel, itemLabel, itemLabel, pageSize, resolvedPageSizeOptions, handlePageSizeChange, pageStart, pageEnd, totalPages, goToPage, safePage,];
                } },
            ...{ class: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40" },
            type: "button",
            disabled: (__VLS_ctx.safePage === 1),
            'aria-label': "Trang trước",
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            name: "uil:angle-left",
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_9 = __VLS_8({
            name: "uil:angle-left",
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        for (const [item, index] of __VLS_vFor((__VLS_ctx.visiblePages))) {
            __VLS_asFunctionalElement(__VLS_intrinsics.template)({
                key: (`${item}-${index}`),
            });
            if (item === '...') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm font-black text-slate-400" },
                });
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.total > 0))
                                return;
                            if (!(__VLS_ctx.totalPages > 1))
                                return;
                            if (!!(item === '...'))
                                return;
                            __VLS_ctx.goToPage(Number(item));
                            // @ts-ignore
                            [goToPage, safePage, visiblePages,];
                        } },
                    ...{ class: ([
                            'inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                            item === __VLS_ctx.safePage
                                ? 'border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-100'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
                        ]) },
                    type: "button",
                    'aria-current': (item === __VLS_ctx.safePage ? 'page' : undefined),
                    'aria-label': (`Trang ${item}`),
                });
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
                (item);
            }
            // @ts-ignore
            [safePage, safePage,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.total > 0))
                        return;
                    if (!(__VLS_ctx.totalPages > 1))
                        return;
                    __VLS_ctx.goToPage(__VLS_ctx.safePage + 1);
                    // @ts-ignore
                    [goToPage, safePage,];
                } },
            ...{ class: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40" },
            type: "button",
            disabled: (__VLS_ctx.safePage === __VLS_ctx.totalPages),
            'aria-label': "Trang sau",
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
        let __VLS_12;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            name: "uil:angle-right",
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_14 = __VLS_13({
            name: "uil:angle-right",
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
}
// @ts-ignore
[totalPages, safePage,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
