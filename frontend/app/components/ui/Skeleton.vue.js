import { computed } from 'vue';
const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    width: {
        type: String,
        default: 'w-full'
    },
    height: {
        type: String,
        default: ''
    }
});
const roundedClass = computed(() => {
    switch (props.type) {
        case 'circular': return 'rounded-full';
        case 'text': return 'rounded-md';
        default: return 'rounded-lg';
    }
});
const heightClass = computed(() => {
    if (props.height)
        return props.height;
    switch (props.type) {
        case 'text': return 'h-4';
        case 'circular': return 'h-12';
        default: return 'h-24';
    }
});
const widthClass = computed(() => {
    if (props.type === 'circular' && props.width === 'w-full') {
        return 'w-12'; // fallback for circular if not specified
    }
    return props.width;
});
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
    ...{ class: ([
            'animate-pulse bg-slate-200',
            __VLS_ctx.roundedClass,
            __VLS_ctx.heightClass,
            __VLS_ctx.widthClass
        ]) },
});
/** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-200']} */ ;
// @ts-ignore
[roundedClass, heightClass, widthClass,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        type: {
            type: String,
            default: 'text'
        },
        width: {
            type: String,
            default: 'w-full'
        },
        height: {
            type: String,
            default: ''
        }
    },
});
export default {};
