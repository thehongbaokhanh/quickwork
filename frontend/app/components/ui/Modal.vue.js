const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    closeOnOutside: {
        type: Boolean,
        default: true
    }
});
const emit = defineEmits(['update:modelValue', 'close']);
const close = () => {
    emit('update:modelValue', false);
    emit('close');
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    enterActiveClass: "ease-out duration-300",
    enterFromClass: "opacity-0",
    enterToClass: "opacity-100",
    leaveActiveClass: "ease-in duration-200",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}));
const __VLS_8 = __VLS_7({
    enterActiveClass: "ease-out duration-300",
    enterFromClass: "opacity-0",
    enterToClass: "opacity-100",
    leaveActiveClass: "ease-in duration-200",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.modelValue) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:p-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modelValue))
                    return;
                __VLS_ctx.closeOnOutside && __VLS_ctx.close();
                // @ts-ignore
                [modelValue, closeOnOutside, close,];
            } },
        ...{ class: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        enterActiveClass: "ease-out duration-300",
        enterFromClass: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
        enterToClass: "opacity-100 translate-y-0 sm:scale-100",
        leaveActiveClass: "ease-in duration-200",
        leaveFromClass: "opacity-100 translate-y-0 sm:scale-100",
        leaveToClass: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
    }));
    const __VLS_14 = __VLS_13({
        enterActiveClass: "ease-out duration-300",
        enterFromClass: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
        enterToClass: "opacity-100 translate-y-0 sm:scale-100",
        leaveActiveClass: "ease-in duration-200",
        leaveFromClass: "opacity-100 translate-y-0 sm:scale-100",
        leaveToClass: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const { default: __VLS_17 } = __VLS_15.slots;
    if (__VLS_ctx.modelValue) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['transform']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:my-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:max-w-lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-lg font-semibold leading-6 text-slate-900" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
        (__VLS_ctx.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.close) },
            type: "button",
            ...{ class: "rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:ring-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:ring-offset-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "sr-only" },
        });
        /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            name: "uil:times",
            ...{ class: "h-6 w-6" },
        }));
        const __VLS_20 = __VLS_19({
            name: "uil:times",
            ...{ class: "h-6 w-6" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-white px-6 py-5" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
        var __VLS_23 = {};
        if (__VLS_ctx.$slots.footer) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-100" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:flex-row-reverse']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
            var __VLS_25 = {};
        }
    }
    // @ts-ignore
    [modelValue, close, title, $slots,];
    var __VLS_15;
}
// @ts-ignore
[];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_24 = __VLS_23, __VLS_26 = __VLS_25;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({
    emits: {},
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            required: true
        },
        closeOnOutside: {
            type: Boolean,
            default: true
        }
    },
});
const __VLS_export = {};
export default {};
