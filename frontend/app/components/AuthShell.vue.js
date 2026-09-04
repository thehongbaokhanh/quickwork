import AuthBrandMark from '~/components/AuthBrandMark.vue';
import FooterBrandMark from '~/components/FooterBrandMark.vue';
const __VLS_props = withDefaults(defineProps(), {
    heroVariant: 'login',
    reverse: false
});
const navItems = [
    { label: 'Việc làm', to: '/student' },
    { label: 'Công ty', to: '/' },
    { label: 'Mức lương', to: '/' },
    { label: 'Blog', to: '/' },
    { label: 'Khám phá', to: '/' }
];
const __VLS_defaults = {
    heroVariant: 'login',
    reverse: false
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-[#f8fbff] p-3 font-sans text-slate-950 sm:p-4" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#f8fbff]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1540px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 sm:min-h-[calc(100vh-2rem)]" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[calc(100vh-1.5rem)]']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[1540px]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-200/70']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:min-h-[calc(100vh-2rem)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "flex min-h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-8 lg:px-10" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-10']} */ ;
const __VLS_0 = AuthBrandMark;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "hidden items-center gap-8 text-sm font-semibold text-slate-800 lg:flex" },
    'aria-label': "Điều hướng xác thực",
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.navItems))) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
    NuxtLink;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        key: (item.label),
        to: (item.to),
        ...{ class: "rounded-md outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
    }));
    const __VLS_7 = __VLS_6({
        key: (item.label),
        to: (item.to),
        ...{ class: "rounded-md outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    const { default: __VLS_10 } = __VLS_8.slots;
    (item.label);
    // @ts-ignore
    [navItems,];
    var __VLS_8;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex shrink-0 items-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    to: "/login",
    'aria-current': (__VLS_ctx.active === 'login' ? 'page' : undefined),
    ...{ class: ([
            'hidden rounded-lg px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex',
            __VLS_ctx.active === 'login' ? 'bg-sky-50 text-sky-700' : 'text-slate-800 hover:text-sky-700'
        ]) },
}));
const __VLS_13 = __VLS_12({
    to: "/login",
    'aria-current': (__VLS_ctx.active === 'login' ? 'page' : undefined),
    ...{ class: ([
            'hidden rounded-lg px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex',
            __VLS_ctx.active === 'login' ? 'bg-sky-50 text-sky-700' : 'text-slate-800 hover:text-sky-700'
        ]) },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
const { default: __VLS_16 } = __VLS_14.slots;
// @ts-ignore
[active, active,];
var __VLS_14;
let __VLS_17;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    to: "/register",
    'aria-current': (__VLS_ctx.active === 'register' ? 'page' : undefined),
    ...{ class: ([
            'hidden rounded-lg px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex',
            __VLS_ctx.active === 'register' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'border border-slate-200 text-slate-800 hover:border-sky-200 hover:text-sky-700'
        ]) },
}));
const __VLS_19 = __VLS_18({
    to: "/register",
    'aria-current': (__VLS_ctx.active === 'register' ? 'page' : undefined),
    ...{ class: ([
            'hidden rounded-lg px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex',
            __VLS_ctx.active === 'register' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'border border-slate-200 text-slate-800 hover:border-sky-200 hover:text-sky-700'
        ]) },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
const { default: __VLS_22 } = __VLS_20.slots;
// @ts-ignore
[active, active,];
var __VLS_20;
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    to: "/",
    ...{ class: "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:border-sky-200 hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}));
const __VLS_25 = __VLS_24({
    to: "/",
    ...{ class: "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:border-sky-200 hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
const { default: __VLS_28 } = __VLS_26.slots;
let __VLS_29;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    name: "uil:estate",
    ...{ class: "h-4 w-4" },
    'aria-hidden': "true",
}));
const __VLS_31 = __VLS_30({
    name: "uil:estate",
    ...{ class: "h-4 w-4" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hidden sm:inline" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
// @ts-ignore
[];
var __VLS_26;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: ([
            'relative grid flex-1 overflow-hidden lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]',
            __VLS_ctx.reverse ? 'lg:grid-cols-[minmax(420px,1.08fr)_minmax(0,0.92fr)]' : ''
        ]) },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: ([
            'relative order-2 overflow-hidden px-5 py-10 sm:px-8 lg:px-10 lg:py-12',
            __VLS_ctx.reverse ? 'lg:order-2' : 'lg:order-1',
            __VLS_ctx.heroVariant === 'register' ? 'bg-[#f0f9ff]' : 'bg-[#f8fbff]'
        ]) },
    'aria-labelledby': "auth-hero-title",
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['order-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-10']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:py-12']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_72%_72%,rgba(14,165,233,0.15),transparent_30%)]" },
});
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(circle_at_10%_15%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_72%_72%,rgba(14,165,233,0.15),transparent_30%)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pointer-events-none absolute left-6 top-8 grid grid-cols-6 gap-3 opacity-40" },
});
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-6']} */ ;
/** @type {__VLS_StyleScopedClasses['top-8']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-6']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-40']} */ ;
for (const [dot] of __VLS_vFor((36))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        key: (dot),
        ...{ class: "h-1 w-1 rounded-full bg-sky-500/70" },
    });
    /** @type {__VLS_StyleScopedClasses['h-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-500/70']} */ ;
    // @ts-ignore
    [reverse, reverse, heroVariant,];
}
var __VLS_34 = {};
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: ([
            'relative order-1 flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12',
            __VLS_ctx.reverse ? 'lg:order-1' : 'lg:order-2'
        ]) },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['order-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-12']} */ ;
var __VLS_36 = {};
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "flex flex-col gap-4 bg-slate-950 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between lg:px-10" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
const __VLS_38 = FooterBrandMark;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    compact: true,
}));
const __VLS_40 = __VLS_39({
    compact: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-xs font-medium text-slate-400" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs font-medium text-slate-400" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "flex items-center gap-6 text-xs font-bold text-slate-300" },
    'aria-label': "Liên kết pháp lý",
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
let __VLS_43;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    to: "#",
    ...{ class: "outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10" },
}));
const __VLS_45 = __VLS_44({
    to: "#",
    ...{ class: "outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-white/10']} */ ;
const { default: __VLS_48 } = __VLS_46.slots;
// @ts-ignore
[reverse,];
var __VLS_46;
let __VLS_49;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    to: "#",
    ...{ class: "outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10" },
}));
const __VLS_51 = __VLS_50({
    to: "#",
    ...{ class: "outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-white/10']} */ ;
const { default: __VLS_54 } = __VLS_52.slots;
// @ts-ignore
[];
var __VLS_52;
let __VLS_55;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    to: "#",
    ...{ class: "outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10" },
}));
const __VLS_57 = __VLS_56({
    to: "#",
    ...{ class: "outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-white/10']} */ ;
const { default: __VLS_60 } = __VLS_58.slots;
// @ts-ignore
[];
var __VLS_58;
// @ts-ignore
var __VLS_35 = __VLS_34, __VLS_37 = __VLS_36;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({
    __typeProps: {},
    props: {},
});
const __VLS_export = {};
export default {};
