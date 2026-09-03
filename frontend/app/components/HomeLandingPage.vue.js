import { ref, watch } from 'vue';
import HomeCareerCta from '~/components/home/HomeCareerCta.vue';
import HomeCategories from '~/components/home/HomeCategories.vue';
import HomeEmployerCta from '~/components/home/HomeEmployerCta.vue';
import HomeFeaturedJobs from '~/components/home/HomeFeaturedJobs.vue';
import HomeFooter from '~/components/home/HomeFooter.vue';
import HomeHeader from '~/components/home/HomeHeader.vue';
import HomeHero from '~/components/home/HomeHero.vue';
import HomeQuickStats from '~/components/home/HomeQuickStats.vue';
import { useHomeJobs } from '~/composables/useHomeJobs';
import { useAuthStore } from '~/stores/auth';
const { bestJobs, categoryStats, companyCount, featuredCompanies, homeSearch, isAppliedJob, isApplyingJob, isFavoriteJob, isFavoriteLoading, isJobsLoading, jobCategories, jobTypeOptions, jobs, quickStats, resetSearch, setHeroKeyword, applyToJob, toggleFavoriteJob, trendingKeywords, notifyDevelopment } = useHomeJobs();
const authStore = useAuthStore();
const selectedJob = ref(null);
const categoryFilterRequest = ref(null);
let categoryFilterRequestId = 0;
function scrollToJobs() {
    document.getElementById('featured-jobs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function handleKeyword(keyword) {
    setHeroKeyword(keyword);
    scrollToJobs();
}
function handleCategory(category) {
    const selectedCategory = typeof category === 'string' ? category.trim() : '';
    if (!selectedCategory) {
        scrollToJobs();
        return;
    }
    categoryFilterRequestId += 1;
    categoryFilterRequest.value = {
        category: selectedCategory,
        requestId: categoryFilterRequestId
    };
    scrollToJobs();
}
function handleReset() {
    resetSearch();
    selectedJob.value = null;
    scrollToJobs();
}
async function handleSaveJob(job) {
    await toggleFavoriteJob(job);
}
function handleJobDetail(job, source = 'click') {
    selectedJob.value = job;
    if (source !== 'hover') {
        scrollToJobs();
    }
}
function handleCloseJobDetail() {
    selectedJob.value = null;
}
async function handleApplyJob(job) {
    await applyToJob(job);
}
watch(bestJobs, (jobs) => {
    if (selectedJob.value && !jobs.some((job) => job.id === selectedJob.value?.id)) {
        selectedJob.value = null;
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-slate-50 font-sans text-slate-950" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
const __VLS_7 = HomeHero;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onSubmit': {} },
    ...{ 'onKeyword': {} },
    search: (__VLS_ctx.homeSearch),
    jobTypeOptions: (__VLS_ctx.jobTypeOptions),
    trendingKeywords: (__VLS_ctx.trendingKeywords),
    totalJobs: (__VLS_ctx.jobs.length),
    companyCount: (__VLS_ctx.companyCount),
}));
const __VLS_9 = __VLS_8({
    ...{ 'onSubmit': {} },
    ...{ 'onKeyword': {} },
    search: (__VLS_ctx.homeSearch),
    jobTypeOptions: (__VLS_ctx.jobTypeOptions),
    trendingKeywords: (__VLS_ctx.trendingKeywords),
    totalJobs: (__VLS_ctx.jobs.length),
    companyCount: (__VLS_ctx.companyCount),
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = {
    /** @type {typeof __VLS_12.submit} */
    onSubmit: (__VLS_ctx.scrollToJobs),
};
const __VLS_14 = {
    /** @type {typeof __VLS_12.keyword} */
    onKeyword: (__VLS_ctx.handleKeyword),
};
var __VLS_10;
var __VLS_11;
const __VLS_15 = HomeQuickStats;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    stats: (__VLS_ctx.quickStats),
}));
const __VLS_17 = __VLS_16({
    stats: (__VLS_ctx.quickStats),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const __VLS_20 = HomeFeaturedJobs;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    ...{ 'onApply': {} },
    ...{ 'onCloseDetail': {} },
    ...{ 'onReset': {} },
    ...{ 'onSave': {} },
    ...{ 'onDetail': {} },
    jobs: (__VLS_ctx.bestJobs),
    categories: (__VLS_ctx.jobCategories),
    categoryFilterRequest: (__VLS_ctx.categoryFilterRequest),
    loading: (__VLS_ctx.isJobsLoading),
    selectedJob: (__VLS_ctx.selectedJob),
    isAppliedJob: (__VLS_ctx.isAppliedJob),
    isApplyingJob: (__VLS_ctx.isApplyingJob),
    isFavoriteJob: (__VLS_ctx.isFavoriteJob),
    isFavoriteLoading: (__VLS_ctx.isFavoriteLoading),
}));
const __VLS_22 = __VLS_21({
    ...{ 'onApply': {} },
    ...{ 'onCloseDetail': {} },
    ...{ 'onReset': {} },
    ...{ 'onSave': {} },
    ...{ 'onDetail': {} },
    jobs: (__VLS_ctx.bestJobs),
    categories: (__VLS_ctx.jobCategories),
    categoryFilterRequest: (__VLS_ctx.categoryFilterRequest),
    loading: (__VLS_ctx.isJobsLoading),
    selectedJob: (__VLS_ctx.selectedJob),
    isAppliedJob: (__VLS_ctx.isAppliedJob),
    isApplyingJob: (__VLS_ctx.isApplyingJob),
    isFavoriteJob: (__VLS_ctx.isFavoriteJob),
    isFavoriteLoading: (__VLS_ctx.isFavoriteLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_25;
const __VLS_26 = {
    /** @type {typeof __VLS_25.apply} */
    onApply: (__VLS_ctx.handleApplyJob),
};
const __VLS_27 = {
    /** @type {typeof __VLS_25.closeDetail} */
    onCloseDetail: (__VLS_ctx.handleCloseJobDetail),
};
const __VLS_28 = {
    /** @type {typeof __VLS_25.reset} */
    onReset: (__VLS_ctx.handleReset),
};
const __VLS_29 = {
    /** @type {typeof __VLS_25.save} */
    onSave: (__VLS_ctx.handleSaveJob),
};
const __VLS_30 = {
    /** @type {typeof __VLS_25.detail} */
    onDetail: (__VLS_ctx.handleJobDetail),
};
var __VLS_23;
var __VLS_24;
const __VLS_31 = HomeCategories;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    ...{ 'onSelect': {} },
    categories: (__VLS_ctx.categoryStats),
    loading: (__VLS_ctx.isJobsLoading),
}));
const __VLS_33 = __VLS_32({
    ...{ 'onSelect': {} },
    categories: (__VLS_ctx.categoryStats),
    loading: (__VLS_ctx.isJobsLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
let __VLS_36;
const __VLS_37 = {
    /** @type {typeof __VLS_36.select} */
    onSelect: (__VLS_ctx.handleCategory),
};
var __VLS_34;
var __VLS_35;
const __VLS_38 = HomeEmployerCta;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    ...{ 'onSecondary': {} },
    companies: (__VLS_ctx.featuredCompanies),
}));
const __VLS_40 = __VLS_39({
    ...{ 'onSecondary': {} },
    companies: (__VLS_ctx.featuredCompanies),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
let __VLS_43;
const __VLS_44 = {
    /** @type {typeof __VLS_43.secondary} */
    onSecondary: (...[$event]) => {
        __VLS_ctx.notifyDevelopment('Giải pháp tuyển dụng');
        // @ts-ignore
        [notifyDevelopment, notifyDevelopment, homeSearch, jobTypeOptions, trendingKeywords, jobs, companyCount, scrollToJobs, handleKeyword, quickStats, bestJobs, jobCategories, categoryFilterRequest, isJobsLoading, isJobsLoading, selectedJob, isAppliedJob, isApplyingJob, isFavoriteJob, isFavoriteLoading, handleApplyJob, handleCloseJobDetail, handleReset, handleSaveJob, handleJobDetail, categoryStats, handleCategory, featuredCompanies,];
    },
};
var __VLS_41;
var __VLS_42;
if (!__VLS_ctx.authStore.isAuthenticated) {
    const __VLS_45 = HomeCareerCta;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
    const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
}
const __VLS_50 = HomeFooter;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    ...{ 'onNotify': {} },
}));
const __VLS_52 = __VLS_51({
    ...{ 'onNotify': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_55;
const __VLS_56 = {
    /** @type {typeof __VLS_55.notify} */
    onNotify: (__VLS_ctx.notifyDevelopment),
};
var __VLS_53;
var __VLS_54;
// @ts-ignore
[notifyDevelopment, authStore,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
