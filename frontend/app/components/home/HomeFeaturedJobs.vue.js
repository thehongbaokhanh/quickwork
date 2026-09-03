import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { formatJobLocation } from '~/utils/jobDisplay';
import HomeJobCard from '~/components/HomeJobCard.vue';
import HomeJobDetailPanel from '~/components/home/HomeJobDetailPanel.vue';
const allValue = 'Tất cả';
const pageSize = 9;
const autoPageDelay = 7000;
const previewCloseDelay = 180;
const previewPopupWidth = 430;
const previewPopupGap = 14;
const viewportMargin = 16;
const defaultFilterOption = { key: 'location', label: 'Địa điểm', icon: 'uil:map-marker' };
const filterOptions = [
    defaultFilterOption,
    { key: 'salary', label: 'Mức lương', icon: 'uil:money-bill' },
    { key: 'level', label: 'Kinh nghiệm', icon: 'uil:user-check' },
    { key: 'category', label: 'Ngành nghề', icon: 'uil:briefcase-alt' },
    { key: 'type', label: 'Loại hình', icon: 'uil:clock' }
];
const props = defineProps();
const emit = defineEmits();
const activeFilterKey = ref('location');
const activeFilterValue = ref(allValue);
const currentPage = ref(1);
const isFilterMenuOpen = ref(false);
const isFilterHintVisible = ref(true);
const lastInteractionAt = ref(Date.now());
const filterDropdownRef = ref(null);
const detailPanelRef = ref(null);
const previewAnchor = ref(null);
const isTitleHovered = ref(false);
const isPreviewHovered = ref(false);
let autoPageTimer = null;
let previewCloseTimer = null;
const activeFilterOption = computed(() => {
    return filterOptions.find((option) => option.key === activeFilterKey.value) || defaultFilterOption;
});
const filterValueMap = computed(() => ({
    location: uniqueValues(props.jobs.map((job) => formatJobLocation(job.location))).filter((value) => value !== 'Chưa cập nhật'),
    salary: uniqueValues(props.jobs.map((job) => job.salaryRange)),
    level: uniqueValues(props.jobs.map((job) => job.level)),
    category: uniqueValues([
        ...props.categories.filter((category) => category !== allValue),
        ...props.jobs.map((job) => job.category)
    ]),
    type: uniqueValues(props.jobs.map((job) => job.type))
}));
const currentFilterOptions = computed(() => {
    const values = filterValueMap.value[activeFilterKey.value];
    const options = [allValue, ...values];
    const selectedValue = activeFilterValue.value;
    const visibleOptions = options.slice(0, 12);
    if (selectedValue !== allValue && values.includes(selectedValue) && !visibleOptions.includes(selectedValue)) {
        return [allValue, selectedValue, ...values.filter((value) => value !== selectedValue)].slice(0, 12);
    }
    return visibleOptions;
});
const filteredJobs = computed(() => {
    if (activeFilterValue.value === allValue) {
        return props.jobs;
    }
    return props.jobs.filter((job) => getJobFilterValue(job, activeFilterKey.value) === activeFilterValue.value);
});
const pageCount = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / pageSize)));
const pagedJobs = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredJobs.value.slice(start, start + pageSize);
});
const isPreviewActive = computed(() => Boolean(props.selectedJob) || isTitleHovered.value || isPreviewHovered.value);
const previewPopupStyle = computed(() => {
    if (!process.client || !previewAnchor.value) {
        return {
            bottom: '1rem',
            left: '1rem',
            right: '1rem'
        };
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (viewportWidth < 768) {
        return {
            bottom: '1rem',
            left: '1rem',
            right: '1rem'
        };
    }
    const popupWidth = Math.min(previewPopupWidth, viewportWidth - viewportMargin * 2);
    const anchor = previewAnchor.value;
    const openRight = anchor.right + previewPopupGap + popupWidth <= viewportWidth - viewportMargin;
    const left = openRight
        ? anchor.right + previewPopupGap
        : Math.max(viewportMargin, anchor.left - previewPopupGap - popupWidth);
    const maxTop = Math.max(viewportMargin, viewportHeight - 560 - viewportMargin);
    const top = Math.min(Math.max(viewportMargin, anchor.top - 8), maxTop);
    return {
        left: `${left}px`,
        top: `${top}px`,
        width: `${popupWidth}px`
    };
});
function uniqueValues(values) {
    return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean)));
}
function normalizeFilterValue(value) {
    return value.trim().toLowerCase();
}
function getJobFilterValue(job, key) {
    if (key === 'location')
        return formatJobLocation(job.location);
    if (key === 'salary')
        return job.salaryRange;
    if (key === 'level')
        return job.level;
    if (key === 'category')
        return job.category;
    return job.type;
}
function markInteraction() {
    lastInteractionAt.value = Date.now();
}
function clearPreviewCloseTimer() {
    if (!previewCloseTimer)
        return;
    clearTimeout(previewCloseTimer);
    previewCloseTimer = null;
}
function toggleFilterMenu() {
    markInteraction();
    isFilterMenuOpen.value = !isFilterMenuOpen.value;
}
function selectFilterKey(key) {
    markInteraction();
    activeFilterKey.value = key;
    activeFilterValue.value = allValue;
    currentPage.value = 1;
    isFilterMenuOpen.value = false;
}
function selectFilterValue(value) {
    markInteraction();
    activeFilterValue.value = value;
    currentPage.value = 1;
}
function applyCategoryFilter(category) {
    const selectedCategory = typeof category === 'string' ? category.trim() : '';
    if (!selectedCategory || selectedCategory === allValue)
        return;
    const normalizedCategory = normalizeFilterValue(selectedCategory);
    const matchedCategory = filterValueMap.value.category.find((value) => normalizeFilterValue(value) === normalizedCategory);
    markInteraction();
    activeFilterKey.value = 'category';
    activeFilterValue.value = matchedCategory || allValue;
    currentPage.value = 1;
    isFilterMenuOpen.value = false;
}
function goToPage(page, userInitiated = true) {
    if (userInitiated) {
        markInteraction();
    }
    if (page < 1) {
        currentPage.value = pageCount.value;
        return;
    }
    if (page > pageCount.value) {
        currentPage.value = 1;
        return;
    }
    currentPage.value = page;
}
function previousPage() {
    goToPage(currentPage.value - 1);
}
function nextPage() {
    goToPage(currentPage.value + 1);
}
function handleTitlePreview(job, anchor) {
    markInteraction();
    isTitleHovered.value = true;
    previewAnchor.value = anchor;
    clearPreviewCloseTimer();
    emit('detail', job, 'hover');
}
function handleTitlePreviewClose() {
    isTitleHovered.value = false;
    schedulePreviewClose();
}
function handlePreviewEnter() {
    markInteraction();
    isPreviewHovered.value = true;
    clearPreviewCloseTimer();
}
function handlePreviewLeave() {
    isPreviewHovered.value = false;
    schedulePreviewClose();
}
function handlePreviewFocusOut(event) {
    const currentTarget = event.currentTarget;
    const relatedTarget = event.relatedTarget;
    if (currentTarget instanceof HTMLElement && relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
        return;
    }
    isPreviewHovered.value = false;
    schedulePreviewClose();
}
function schedulePreviewClose() {
    markInteraction();
    clearPreviewCloseTimer();
    previewCloseTimer = setTimeout(() => {
        if (isTitleHovered.value || isPreviewHovered.value)
            return;
        emit('closeDetail');
    }, previewCloseDelay);
}
function handleDocumentClick(event) {
    if (!(event.target instanceof Node))
        return;
    if (isFilterMenuOpen.value && !filterDropdownRef.value?.contains(event.target)) {
        isFilterMenuOpen.value = false;
    }
    if (!props.selectedJob)
        return;
    if (detailPanelRef.value?.contains(event.target))
        return;
    emit('closeDetail');
}
function resetAllFilters() {
    markInteraction();
    activeFilterKey.value = 'location';
    activeFilterValue.value = allValue;
    currentPage.value = 1;
    emit('reset');
}
watch(currentFilterOptions, (options) => {
    if (!options.includes(activeFilterValue.value)) {
        activeFilterValue.value = allValue;
    }
});
watch(() => props.categoryFilterRequest?.requestId, () => {
    const request = props.categoryFilterRequest;
    if (!request)
        return;
    applyCategoryFilter(request.category);
});
watch(pageCount, (count) => {
    if (currentPage.value > count) {
        currentPage.value = count;
    }
});
watch(filteredJobs, () => {
    currentPage.value = Math.min(currentPage.value, pageCount.value);
});
onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
    autoPageTimer = setInterval(() => {
        if (pageCount.value <= 1)
            return;
        if (isPreviewActive.value)
            return;
        if (Date.now() - lastInteractionAt.value < autoPageDelay)
            return;
        goToPage(currentPage.value + 1, false);
    }, autoPageDelay);
});
onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick);
    clearPreviewCloseTimer();
    if (autoPageTimer) {
        clearInterval(autoPageTimer);
    }
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
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    id: "featured-jobs",
    ...{ class: "bg-slate-50 py-12 sm:py-14" },
});
/** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['py-12']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:py-14']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[1240px]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-wrap items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-3xl font-extrabold leading-tight text-sky-600 sm:text-4xl" },
});
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-4xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: "uil:bolt-alt",
    ...{ class: "h-4 w-4 text-sky-600" },
    'aria-hidden': "true",
}));
const __VLS_2 = __VLS_1({
    name: "uil:bolt-alt",
    ...{ class: "h-4 w-4 text-sky-600" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-3 max-w-2xl text-base leading-7 text-slate-600" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-7']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    to: "/student",
    ...{ class: "inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-800 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100" },
}));
const __VLS_7 = __VLS_6({
    to: "/student",
    ...{ class: "inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-800 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sky-800']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
const { default: __VLS_10 } = __VLS_8.slots;
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    name: "uil:arrow-right",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}));
const __VLS_13 = __VLS_12({
    name: "uil:arrow-right",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
var __VLS_8;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.previousPage) },
    type: "button",
    ...{ class: "hidden h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex" },
    disabled: (__VLS_ctx.pageCount <= 1),
    'aria-label': "Trang việc làm trước",
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['w-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-sky-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
let __VLS_16;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    name: "uil:angle-left",
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}));
const __VLS_18 = __VLS_17({
    name: "uil:angle-left",
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.nextPage) },
    type: "button",
    ...{ class: "hidden h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex" },
    disabled: (__VLS_ctx.pageCount <= 1),
    'aria-label': "Trang việc làm tiếp theo",
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['w-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-sky-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:inline-flex']} */ ;
let __VLS_21;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    name: "uil:angle-right",
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}));
const __VLS_23 = __VLS_22({
    name: "uil:angle-right",
    ...{ class: "h-6 w-6" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-5 flex flex-col gap-4 xl:flex-row xl:items-center" },
});
/** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "filterDropdownRef",
    ...{ class: "relative shrink-0" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleFilterMenu) },
    ...{ onKeydown: (...[$event]) => {
            __VLS_ctx.isFilterMenuOpen = false;
            // @ts-ignore
            [previousPage, pageCount, pageCount, nextPage, toggleFilterMenu, isFilterMenuOpen,];
        } },
    type: "button",
    ...{ class: "flex h-14 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 text-left text-base font-bold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 sm:min-w-[280px]" },
    'aria-haspopup': "menu",
    'aria-expanded': (__VLS_ctx.isFilterMenuOpen),
    'aria-controls': "home-featured-filter-menu",
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-14']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:min-w-[280px]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inline-flex min-w-0 items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
let __VLS_26;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    name: "uil:filter",
    ...{ class: "h-5 w-5 shrink-0 text-slate-400" },
    'aria-hidden': "true",
}));
const __VLS_28 = __VLS_27({
    name: "uil:filter",
    ...{ class: "h-5 w-5 shrink-0 text-slate-400" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-slate-400" },
});
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "truncate text-slate-950" },
});
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
(__VLS_ctx.activeFilterOption.label);
let __VLS_31;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    name: "uil:angle-down",
    ...{ class: (['h-5 w-5 shrink-0 text-slate-500 transition', __VLS_ctx.isFilterMenuOpen ? 'rotate-180' : '']) },
    'aria-hidden': "true",
}));
const __VLS_33 = __VLS_32({
    name: "uil:angle-down",
    ...{ class: (['h-5 w-5 shrink-0 text-slate-500 transition', __VLS_ctx.isFilterMenuOpen ? 'rotate-180' : '']) },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
if (__VLS_ctx.isFilterMenuOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        id: "home-featured-filter-menu",
        ...{ class: "absolute left-0 top-[calc(100%+8px)] z-30 w-full min-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl shadow-slate-200/70" },
        role: "menu",
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[calc(100%+8px)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-[280px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-200/70']} */ ;
    for (const [option] of __VLS_vFor((__VLS_ctx.filterOptions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isFilterMenuOpen))
                        return;
                    __VLS_ctx.selectFilterKey(option.key);
                    // @ts-ignore
                    [isFilterMenuOpen, isFilterMenuOpen, isFilterMenuOpen, activeFilterOption, filterOptions, selectFilterKey,];
                } },
            key: (option.key),
            type: "button",
            ...{ class: ([
                    'flex h-12 w-full items-center justify-between gap-3 border-b border-slate-100 px-5 text-left text-base font-bold transition last:border-b-0 focus:outline-none focus-visible:bg-sky-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-100',
                    __VLS_ctx.activeFilterKey === option.key
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
                ]) },
            role: "menuitemradio",
            'aria-checked': (__VLS_ctx.activeFilterKey === option.key),
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['last:border-b-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-inset']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "inline-flex items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_36;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
            name: (option.icon),
            ...{ class: "h-5 w-5 text-sky-600" },
            'aria-hidden': "true",
        }));
        const __VLS_38 = __VLS_37({
            name: (option.icon),
            ...{ class: "h-5 w-5 text-sky-600" },
            'aria-hidden': "true",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
        (option.label);
        if (__VLS_ctx.activeFilterKey === option.key) {
            let __VLS_41;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                name: "uil:check",
                ...{ class: "h-5 w-5 text-sky-600" },
                'aria-hidden': "true",
            }));
            const __VLS_43 = __VLS_42({
                name: "uil:check",
                ...{ class: "h-5 w-5 text-sky-600" },
                'aria-hidden': "true",
            }, ...__VLS_functionalComponentArgsRest(__VLS_42));
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
        }
        // @ts-ignore
        [activeFilterKey, activeFilterKey, activeFilterKey,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
for (const [option] of __VLS_vFor((__VLS_ctx.currentFilterOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectFilterValue(option);
                // @ts-ignore
                [currentFilterOptions, selectFilterValue,];
            } },
        key: (`${__VLS_ctx.activeFilterKey}-${option}`),
        type: "button",
        'aria-pressed': (__VLS_ctx.activeFilterValue === option),
        ...{ class: ([
                'h-12 shrink-0 rounded-full px-5 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                __VLS_ctx.activeFilterValue === option
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                    : 'bg-white text-slate-700 shadow-sm shadow-slate-200/70 hover:bg-sky-50 hover:text-sky-700'
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    (option);
    // @ts-ignore
    [activeFilterKey, activeFilterValue, activeFilterValue,];
}
if (__VLS_ctx.isFilterHintVisible) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-700" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    let __VLS_46;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        name: "uil:lightbulb-alt",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0 text-sky-600" },
        'aria-hidden': "true",
    }));
    const __VLS_48 = __VLS_47({
        name: "uil:lightbulb-alt",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0 text-sky-600" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "min-w-0 flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    (__VLS_ctx.activeFilterOption.label.toLowerCase());
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isFilterHintVisible))
                    return;
                __VLS_ctx.isFilterHintVisible = false;
                // @ts-ignore
                [activeFilterOption, isFilterHintVisible, isFilterHintVisible,];
            } },
        type: "button",
        ...{ class: "-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "An goi y",
    });
    /** @type {__VLS_StyleScopedClasses['-mr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    let __VLS_51;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        name: "uil:times",
        ...{ class: "h-4 w-4" },
        'aria-hidden': "true",
    }));
    const __VLS_53 = __VLS_52({
        name: "uil:times",
        ...{ class: "h-4 w-4" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:grid-cols-3']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.pageSize))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            key: (item),
            ...{ class: "h-[158px] animate-pulse rounded-2xl border border-slate-200 bg-white" },
        });
        /** @type {__VLS_StyleScopedClasses['h-[158px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        // @ts-ignore
        [loading, pageSize,];
    }
}
else if (__VLS_ctx.filteredJobs.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative mt-6" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-5 md:grid-cols-2 xl:grid-cols-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:grid-cols-3']} */ ;
    for (const [job] of __VLS_vFor((__VLS_ctx.pagedJobs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (job.id),
        });
        const __VLS_56 = HomeJobCard;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            ...{ 'onSave': {} },
            ...{ 'onPreview': {} },
            ...{ 'onPreviewClose': {} },
            job: (job),
            active: (__VLS_ctx.selectedJob?.id === job.id),
            isFavorite: (__VLS_ctx.isFavoriteJob?.(job) || false),
            isFavoriteLoading: (__VLS_ctx.isFavoriteLoading?.(job) || false),
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onSave': {} },
            ...{ 'onPreview': {} },
            ...{ 'onPreviewClose': {} },
            job: (job),
            active: (__VLS_ctx.selectedJob?.id === job.id),
            isFavorite: (__VLS_ctx.isFavoriteJob?.(job) || false),
            isFavoriteLoading: (__VLS_ctx.isFavoriteLoading?.(job) || false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_61;
        const __VLS_62 = {
            /** @type {typeof __VLS_61.save} */
            onSave: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.filteredJobs.length))
                    return;
                __VLS_ctx.emit('save', job);
                // @ts-ignore
                [filteredJobs, pagedJobs, selectedJob, isFavoriteJob, isFavoriteLoading, emit,];
            },
        };
        const __VLS_63 = {
            /** @type {typeof __VLS_61.preview} */
            onPreview: (__VLS_ctx.handleTitlePreview),
        };
        const __VLS_64 = {
            /** @type {typeof __VLS_61.previewClose} */
            onPreviewClose: (__VLS_ctx.handleTitlePreviewClose),
        };
        var __VLS_59;
        var __VLS_60;
        // @ts-ignore
        [handleTitlePreview, handleTitlePreviewClose,];
    }
    let __VLS_65;
    /** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
        enterActiveClass: "transition duration-150 ease-out",
        enterFromClass: "translate-y-2 opacity-0",
        enterToClass: "translate-y-0 opacity-100",
        leaveActiveClass: "transition duration-100 ease-in",
        leaveFromClass: "translate-y-0 opacity-100",
        leaveToClass: "translate-y-2 opacity-0",
    }));
    const __VLS_67 = __VLS_66({
        enterActiveClass: "transition duration-150 ease-out",
        enterFromClass: "translate-y-2 opacity-0",
        enterToClass: "translate-y-0 opacity-100",
        leaveActiveClass: "transition duration-100 ease-in",
        leaveFromClass: "translate-y-0 opacity-100",
        leaveToClass: "translate-y-2 opacity-0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    const { default: __VLS_70 } = __VLS_68.slots;
    if (__VLS_ctx.selectedJob) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onMouseenter: (__VLS_ctx.handlePreviewEnter) },
            ...{ onMouseleave: (__VLS_ctx.handlePreviewLeave) },
            ...{ onFocusin: (__VLS_ctx.handlePreviewEnter) },
            ...{ onFocusout: (__VLS_ctx.handlePreviewFocusOut) },
            ref: "detailPanelRef",
            ...{ class: "fixed z-50 mx-auto max-w-[430px]" },
            ...{ style: (__VLS_ctx.previewPopupStyle) },
            role: "dialog",
            'aria-label': "Xem nhanh chi tiết việc làm",
        });
        /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[430px]']} */ ;
        const __VLS_71 = HomeJobDetailPanel;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
            ...{ 'onApply': {} },
            ...{ 'onClose': {} },
            ...{ 'onSave': {} },
            job: (__VLS_ctx.selectedJob),
            variant: "popup",
            isApplied: (__VLS_ctx.isAppliedJob?.(__VLS_ctx.selectedJob) || false),
            isApplying: (__VLS_ctx.isApplyingJob?.(__VLS_ctx.selectedJob) || false),
            isFavorite: (__VLS_ctx.isFavoriteJob?.(__VLS_ctx.selectedJob) || false),
            isFavoriteLoading: (__VLS_ctx.isFavoriteLoading?.(__VLS_ctx.selectedJob) || false),
        }));
        const __VLS_73 = __VLS_72({
            ...{ 'onApply': {} },
            ...{ 'onClose': {} },
            ...{ 'onSave': {} },
            job: (__VLS_ctx.selectedJob),
            variant: "popup",
            isApplied: (__VLS_ctx.isAppliedJob?.(__VLS_ctx.selectedJob) || false),
            isApplying: (__VLS_ctx.isApplyingJob?.(__VLS_ctx.selectedJob) || false),
            isFavorite: (__VLS_ctx.isFavoriteJob?.(__VLS_ctx.selectedJob) || false),
            isFavoriteLoading: (__VLS_ctx.isFavoriteLoading?.(__VLS_ctx.selectedJob) || false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        let __VLS_76;
        const __VLS_77 = {
            /** @type {typeof __VLS_76.apply} */
            onApply: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.filteredJobs.length))
                    return;
                if (!(__VLS_ctx.selectedJob))
                    return;
                __VLS_ctx.emit('apply', __VLS_ctx.selectedJob);
                // @ts-ignore
                [selectedJob, selectedJob, selectedJob, selectedJob, selectedJob, selectedJob, selectedJob, isFavoriteJob, isFavoriteLoading, emit, handlePreviewEnter, handlePreviewEnter, handlePreviewLeave, handlePreviewFocusOut, previewPopupStyle, isAppliedJob, isApplyingJob,];
            },
        };
        const __VLS_78 = {
            /** @type {typeof __VLS_76.close} */
            onClose: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.filteredJobs.length))
                    return;
                if (!(__VLS_ctx.selectedJob))
                    return;
                __VLS_ctx.emit('closeDetail');
                // @ts-ignore
                [emit,];
            },
        };
        const __VLS_79 = {
            /** @type {typeof __VLS_76.save} */
            onSave: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!(__VLS_ctx.filteredJobs.length))
                    return;
                if (!(__VLS_ctx.selectedJob))
                    return;
                __VLS_ctx.emit('save', __VLS_ctx.selectedJob);
                // @ts-ignore
                [selectedJob, emit,];
            },
        };
        var __VLS_74;
        var __VLS_75;
    }
    // @ts-ignore
    [];
    var __VLS_68;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[24px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    let __VLS_80;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        name: "uil:search",
        ...{ class: "mx-auto h-10 w-10 text-slate-400" },
        'aria-hidden': "true",
    }));
    const __VLS_82 = __VLS_81({
        name: "uil:search",
        ...{ class: "mx-auto h-10 w-10 text-slate-400" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "mt-4 text-xl font-extrabold text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-2 text-base text-slate-600" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.resetAllFilters) },
        type: "button",
        ...{ class: "mt-6 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
}
if (!__VLS_ctx.loading && __VLS_ctx.filteredJobs.length && __VLS_ctx.pageCount > 1) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 flex items-center justify-center gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.previousPage) },
        type: "button",
        ...{ class: "flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "Trang việc làm trước",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    let __VLS_85;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
        name: "uil:angle-left",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }));
    const __VLS_87 = __VLS_86({
        name: "uil:angle-left",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-base font-bold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sky-600" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
    (__VLS_ctx.currentPage);
    (__VLS_ctx.pageCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.nextPage) },
        type: "button",
        ...{ class: "flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "Trang việc làm tiếp theo",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    let __VLS_90;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        name: "uil:angle-right",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }));
    const __VLS_92 = __VLS_91({
        name: "uil:angle-right",
        ...{ class: "h-6 w-6" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
}
// @ts-ignore
[previousPage, pageCount, pageCount, nextPage, loading, filteredJobs, resetAllFilters, currentPage,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
