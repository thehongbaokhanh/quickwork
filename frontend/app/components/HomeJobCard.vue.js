import { computed } from 'vue';
import { formatJobLocation } from '~/utils/jobDisplay';
import { getJobTypeMeta } from '~/utils/jobTypeMeta';
const props = defineProps();
const emit = defineEmits();
const jobTypeMeta = computed(() => getJobTypeMeta(props.job.type));
const displayLocation = computed(() => formatJobLocation(props.job.location));
function emitPreview(event) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement))
        return;
    const card = target.closest('article');
    const rect = (card instanceof HTMLElement ? card : target).getBoundingClientRect();
    emit('preview', props.job, {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
    });
}
function emitPreviewClose() {
    emit('previewClose');
}
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
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    ...{ class: ([
            'group relative flex h-[212px] min-h-[212px] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-4 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
            __VLS_ctx.active
                ? 'border-sky-400 bg-sky-50/60 shadow-xl shadow-sky-100/70 ring-2 ring-sky-100'
                : 'border-slate-200 shadow-sm shadow-slate-200/45 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/70'
        ]) },
    ...{ style: ({ borderColor: __VLS_ctx.jobTypeMeta.border }) },
});
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[212px]']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[212px]']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex min-w-0 gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: ([
            'flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-sm font-extrabold text-white shadow-sm',
            __VLS_ctx.job.logoClass
        ]) },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
(__VLS_ctx.job.logo);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-w-0" },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold" },
    ...{ style: ({ backgroundColor: __VLS_ctx.jobTypeMeta.border, color: __VLS_ctx.jobTypeMeta.text }) },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: (__VLS_ctx.jobTypeMeta.icon),
    ...{ class: "h-3.5 w-3.5" },
    'aria-hidden': "true",
}));
const __VLS_2 = __VLS_1({
    name: (__VLS_ctx.jobTypeMeta.icon),
    ...{ class: "h-3.5 w-3.5" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "truncate" },
});
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
(__VLS_ctx.job.type);
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "mt-2 line-clamp-1 text-[17px] font-extrabold leading-6" },
});
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['line-clamp-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[17px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ 'onMouseenter': {} },
    ...{ 'onMouseleave': {} },
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    to: (`/jobs/${__VLS_ctx.job.id}`),
    ...{ class: "cursor-pointer text-slate-950 decoration-sky-300 underline-offset-4 transition hover:text-sky-700 hover:underline focus:outline-none focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-sky-100" },
    title: (__VLS_ctx.job.title),
}));
const __VLS_7 = __VLS_6({
    ...{ 'onMouseenter': {} },
    ...{ 'onMouseleave': {} },
    ...{ 'onFocus': {} },
    ...{ 'onBlur': {} },
    to: (`/jobs/${__VLS_ctx.job.id}`),
    ...{ class: "cursor-pointer text-slate-950 decoration-sky-300 underline-offset-4 transition hover:text-sky-700 hover:underline focus:outline-none focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-sky-100" },
    title: (__VLS_ctx.job.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = {
    /** @type {typeof __VLS_10.mouseenter} */
    onMouseenter: (__VLS_ctx.emitPreview),
};
const __VLS_12 = {
    /** @type {typeof __VLS_10.mouseleave} */
    onMouseleave: (__VLS_ctx.emitPreviewClose),
};
const __VLS_13 = {
    /** @type {typeof __VLS_10.focus} */
    onFocus: (__VLS_ctx.emitPreview),
};
const __VLS_14 = {
    /** @type {typeof __VLS_10.blur} */
    onBlur: (__VLS_ctx.emitPreviewClose),
};
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
/** @type {__VLS_StyleScopedClasses['decoration-sky-300']} */ ;
/** @type {__VLS_StyleScopedClasses['underline-offset-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
const { default: __VLS_15 } = __VLS_8.slots;
(__VLS_ctx.job.title);
// @ts-ignore
[active, jobTypeMeta, jobTypeMeta, jobTypeMeta, jobTypeMeta, job, job, job, job, job, job, emitPreview, emitPreview, emitPreviewClose, emitPreviewClose,];
var __VLS_8;
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-2 truncate text-sm font-semibold text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(__VLS_ctx.job.company);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-4 flex min-h-7 min-w-0 flex-nowrap gap-2 text-sm font-bold text-slate-700" },
});
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-7']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
let __VLS_16;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    name: "uil:money-bill",
    ...{ class: "h-4 w-4 text-sky-600" },
    'aria-hidden': "true",
}));
const __VLS_18 = __VLS_17({
    name: "uil:money-bill",
    ...{ class: "h-4 w-4 text-sky-600" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
(__VLS_ctx.job.salary);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inline-flex min-w-0 items-center gap-1.5 overflow-hidden rounded-full bg-slate-100 px-3 py-1" },
    title: (__VLS_ctx.job.location),
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
let __VLS_21;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    name: "uil:map-marker",
    ...{ class: "h-4 w-4 shrink-0 text-sky-600" },
    'aria-hidden': "true",
}));
const __VLS_23 = __VLS_22({
    name: "uil:map-marker",
    ...{ class: "h-4 w-4 shrink-0 text-sky-600" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "truncate" },
});
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
(__VLS_ctx.displayLocation);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-auto flex min-h-12 shrink-0 items-end justify-end border-t border-slate-100 pt-3" },
});
/** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('save', __VLS_ctx.job);
            // @ts-ignore
            [job, job, job, job, displayLocation, $emit,];
        } },
    type: "button",
    ...{ class: ([
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70',
            __VLS_ctx.isFavorite
                ? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100'
                : 'border-sky-100 bg-white text-sky-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
        ]) },
    disabled: (__VLS_ctx.isFavoriteLoading),
    'aria-label': (`${__VLS_ctx.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'} việc ${__VLS_ctx.job.title}`),
    'aria-pressed': (__VLS_ctx.isFavorite),
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-9']} */ ;
/** @type {__VLS_StyleScopedClasses['w-9']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-70']} */ ;
let __VLS_26;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    name: (__VLS_ctx.isFavoriteLoading ? 'svg-spinners:180-ring' : 'uil:heart'),
    ...{ class: "h-4 w-4" },
    'aria-hidden': "true",
}));
const __VLS_28 = __VLS_27({
    name: (__VLS_ctx.isFavoriteLoading ? 'svg-spinners:180-ring' : 'uil:heart'),
    ...{ class: "h-4 w-4" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
// @ts-ignore
[job, isFavorite, isFavorite, isFavorite, isFavoriteLoading, isFavoriteLoading,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
