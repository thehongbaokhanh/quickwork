import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
const props = withDefaults(defineProps(), {
    icon: '',
    size: 'md',
    tone: 'sky',
    disabled: false
});
const emit = defineEmits();
const rootRef = ref(null);
const isOpen = ref(false);
const menuPlacement = ref('bottom');
const MAX_MENU_HEIGHT = 224;
const MENU_OFFSET = 12;
const selectedLabel = computed(() => {
    const selected = props.options.find((option) => option.value === props.modelValue);
    return selected?.label || props.options[0]?.label || 'Chọn';
});
const sizeClass = computed(() => {
    if (props.size === 'action')
        return 'h-9 rounded-md px-2 text-xs';
    if (props.size === 'sm')
        return 'h-10 rounded-xl px-3 text-sm';
    if (props.size === 'filter')
        return 'h-11 rounded-md px-3 text-sm';
    return 'h-12 rounded-2xl px-4 text-sm';
});
const optionSizeClass = computed(() => {
    if (props.size === 'action')
        return 'min-h-9 text-xs';
    if (props.size === 'sm')
        return 'min-h-10';
    if (props.size === 'filter')
        return 'min-h-11';
    return 'min-h-12';
});
const menuRadiusClass = computed(() => {
    if (props.size === 'action')
        return 'rounded-lg';
    return props.size === 'filter' ? 'rounded-xl' : 'rounded-2xl';
});
const menuTransitionOffsetClass = computed(() => (menuPlacement.value === 'top' ? 'translate-y-1 opacity-0' : '-translate-y-1 opacity-0'));
const toneClasses = computed(() => {
    const classes = {
        sky: {
            button: 'border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-sky-50 focus-visible:border-sky-300 focus-visible:ring-sky-100',
            icon: 'text-sky-600',
            menu: 'border-sky-200',
            optionActive: 'bg-sky-50 text-sky-700',
            optionHover: 'hover:bg-sky-50 hover:text-sky-700',
            check: 'text-sky-600'
        },
        slate: {
            button: 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:border-slate-400 focus-visible:ring-slate-100',
            icon: 'text-slate-600',
            menu: 'border-slate-200',
            optionActive: 'bg-slate-900 text-white',
            optionHover: 'hover:bg-slate-50 hover:text-slate-950',
            check: 'text-white'
        },
        amber: {
            button: 'border-amber-100 text-slate-700 hover:border-amber-200 hover:bg-amber-50 focus-visible:border-amber-300 focus-visible:ring-amber-100',
            icon: 'text-amber-600',
            menu: 'border-amber-200',
            optionActive: 'bg-amber-50 text-amber-700',
            optionHover: 'hover:bg-amber-50 hover:text-amber-700',
            check: 'text-amber-600'
        },
        rose: {
            button: 'border-rose-100 text-slate-700 hover:border-rose-200 hover:bg-rose-50 focus-visible:border-rose-300 focus-visible:ring-rose-100',
            icon: 'text-rose-600',
            menu: 'border-rose-200',
            optionActive: 'bg-rose-50 text-rose-700',
            optionHover: 'hover:bg-rose-50 hover:text-rose-700',
            check: 'text-rose-600'
        },
        emerald: {
            button: 'border-emerald-100 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:border-emerald-300 focus-visible:ring-emerald-100',
            icon: 'text-emerald-600',
            menu: 'border-emerald-200',
            optionActive: 'bg-emerald-50 text-emerald-700',
            optionHover: 'hover:bg-emerald-50 hover:text-emerald-700',
            check: 'text-emerald-600'
        }
    };
    return classes[props.tone];
});
function estimatedMenuHeight() {
    const itemHeight = props.size === 'sm' ? 40 : props.size === 'filter' ? 44 : 48;
    return Math.min(Math.max(props.options.length, 1) * itemHeight, MAX_MENU_HEIGHT);
}
function updateMenuPlacement() {
    const rect = rootRef.value?.getBoundingClientRect();
    if (!rect)
        return;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const requiredSpace = estimatedMenuHeight() + MENU_OFFSET;
    menuPlacement.value = spaceBelow < requiredSpace && spaceAbove > spaceBelow ? 'top' : 'bottom';
}
async function openMenu() {
    if (props.disabled)
        return;
    isOpen.value = true;
    await nextTick();
    updateMenuPlacement();
}
function closeMenu() {
    isOpen.value = false;
}
function toggleMenu() {
    if (props.disabled)
        return;
    if (isOpen.value) {
        closeMenu();
        return;
    }
    openMenu();
}
function selectOption(value) {
    emit('update:modelValue', value);
    closeMenu();
}
function handleDocumentClick(event) {
    const target = event.target;
    if (!(target instanceof Node))
        return;
    if (!rootRef.value?.contains(target))
        closeMenu();
}
function handleWindowChange() {
    if (isOpen.value)
        updateMenuPlacement();
}
onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
    window.removeEventListener('resize', handleWindowChange);
    window.removeEventListener('scroll', handleWindowChange, true);
});
const __VLS_defaults = {
    icon: '',
    size: 'md',
    tone: 'sky',
    disabled: false
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
/** @type {__VLS_StyleScopedClasses['quickwork-scroll-select']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-scroll-select']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-scroll-select']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-scroll-select']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-scroll-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "rootRef",
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleMenu) },
    ...{ onKeydown: (__VLS_ctx.openMenu) },
    ...{ onKeydown: (__VLS_ctx.toggleMenu) },
    ...{ onKeydown: (__VLS_ctx.toggleMenu) },
    ...{ onKeydown: (__VLS_ctx.closeMenu) },
    type: "button",
    ...{ class: ([
            'flex w-full items-center gap-3 border bg-white text-left font-black shadow-sm transition focus:outline-none focus-visible:ring-4',
            __VLS_ctx.sizeClass,
            __VLS_ctx.toneClasses.button,
            __VLS_ctx.disabled ? 'cursor-not-allowed opacity-60' : ''
        ]) },
    'aria-label': (__VLS_ctx.ariaLabel),
    'aria-expanded': (__VLS_ctx.isOpen),
    disabled: (__VLS_ctx.disabled),
    'aria-haspopup': "listbox",
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
if (__VLS_ctx.icon) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        name: (__VLS_ctx.icon),
        ...{ class: (['h-5 w-5 shrink-0', __VLS_ctx.toneClasses.icon]) },
        'aria-hidden': "true",
    }));
    const __VLS_2 = __VLS_1({
        name: (__VLS_ctx.icon),
        ...{ class: (['h-5 w-5 shrink-0', __VLS_ctx.toneClasses.icon]) },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min-w-0 flex-1 truncate" },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
(__VLS_ctx.selectedLabel);
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    name: "uil:angle-down",
    ...{ class: (['h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200', __VLS_ctx.isOpen ? 'rotate-180' : '']) },
    'aria-hidden': "true",
}));
const __VLS_7 = __VLS_6({
    name: "uil:angle-down",
    ...{ class: (['h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200', __VLS_ctx.isOpen ? 'rotate-180' : '']) },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
let __VLS_10;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: (__VLS_ctx.menuTransitionOffsetClass),
    enterToClass: "translate-y-0 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "translate-y-0 opacity-100",
    leaveToClass: (__VLS_ctx.menuTransitionOffsetClass),
}));
const __VLS_12 = __VLS_11({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: (__VLS_ctx.menuTransitionOffsetClass),
    enterToClass: "translate-y-0 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "translate-y-0 opacity-100",
    leaveToClass: (__VLS_ctx.menuTransitionOffsetClass),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const { default: __VLS_15 } = __VLS_13.slots;
if (__VLS_ctx.isOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: ([
                'absolute left-0 right-0 z-40 overflow-hidden border bg-white shadow-2xl shadow-slate-200/70 ring-1 ring-slate-950/5',
                __VLS_ctx.menuPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
                __VLS_ctx.menuRadiusClass,
                __VLS_ctx.toneClasses.menu
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-200/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-slate-950/5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quickwork-scroll-select max-h-56 overflow-y-auto py-1" },
        role: "listbox",
        'aria-label': (__VLS_ctx.ariaLabel),
    });
    /** @type {__VLS_StyleScopedClasses['quickwork-scroll-select']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-56']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    for (const [option, optionIndex] of __VLS_vFor((__VLS_ctx.options))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    __VLS_ctx.selectOption(option.value);
                    // @ts-ignore
                    [toggleMenu, toggleMenu, toggleMenu, openMenu, closeMenu, sizeClass, toneClasses, toneClasses, toneClasses, disabled, disabled, ariaLabel, ariaLabel, isOpen, isOpen, isOpen, icon, icon, selectedLabel, menuTransitionOffsetClass, menuTransitionOffsetClass, menuPlacement, menuRadiusClass, options, selectOption,];
                } },
            key: (String(option.value)),
            type: "button",
            ...{ class: ([
                    'flex items-center gap-3 px-3 text-left text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                    __VLS_ctx.optionSizeClass,
                    props.size === 'filter'
                        ? 'mx-1 my-0.5 w-[calc(100%-0.5rem)] rounded-lg'
                        : props.size === 'action'
                            ? 'mx-1 my-0.5 w-[calc(100%-0.5rem)] rounded-md'
                            : ['w-full', optionIndex < __VLS_ctx.options.length - 1 ? 'border-b border-slate-100' : ''],
                    option.value === __VLS_ctx.modelValue
                        ? __VLS_ctx.toneClasses.optionActive
                        : ['text-slate-700', __VLS_ctx.toneClasses.optionHover]
                ]) },
            role: "option",
            'aria-selected': (option.value === __VLS_ctx.modelValue),
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "min-w-0 flex-1 truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (option.label);
        if (option.value === __VLS_ctx.modelValue) {
            let __VLS_16;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
                name: "uil:check",
                ...{ class: (['h-5 w-5 shrink-0', __VLS_ctx.toneClasses.check]) },
                'aria-hidden': "true",
            }));
            const __VLS_18 = __VLS_17({
                name: "uil:check",
                ...{ class: (['h-5 w-5 shrink-0', __VLS_ctx.toneClasses.check]) },
                'aria-hidden': "true",
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        }
        // @ts-ignore
        [toneClasses, toneClasses, toneClasses, options, optionSizeClass, modelValue, modelValue, modelValue,];
    }
}
// @ts-ignore
[];
var __VLS_13;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
