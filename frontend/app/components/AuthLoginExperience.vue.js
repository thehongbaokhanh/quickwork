import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import AuthField from '~/components/AuthField.vue';
import AuthShell from '~/components/AuthShell.vue';
import { useToast } from '~/composables/useToast';
import { useAuthStore } from '~/stores/auth';
import { getLoginRedirectForRole } from '~/utils/authRedirect';
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();
const isLoading = ref(false);
const errorMessage = ref('');
const loginNotice = ref('');
const showPassword = ref(false);
const LOGIN_NOTICE_REDIRECT_DELAY_MS = 1400;
const trustItems = [
    { title: 'Cơ hội đa dạng', description: 'Hàng nghìn việc làm từ các công ty uy tín đang chờ bạn.', icon: 'uil:briefcase-alt', iconClass: 'bg-sky-50 text-sky-700' },
    { title: 'Thông tin minh bạch', description: 'Mức lương rõ ràng, đánh giá chân thực từ ứng viên.', icon: 'uil:shield-check', iconClass: 'bg-sky-50 text-sky-700' },
    { title: 'Ứng tuyển dễ dàng', description: 'Kết nối nhanh chóng với nhà tuyển dụng chỉ với vài bước đơn giản.', icon: 'uil:user-check', iconClass: 'bg-violet-50 text-violet-700' }
];
onMounted(() => {
    if (route.query.error === 'invalid_role') {
        errorMessage.value = 'Tài khoản của bạn có quyền truy cập không hợp lệ hoặc chưa được phân quyền.';
    }
    else if (route.query.error === 'enterprise_pending') {
        loginNotice.value = 'Tài khoản doanh nghiệp của bạn chưa được duyệt. Bạn vẫn có thể đăng nhập để xem thông báo và nộp GPKD trong phần cài đặt.';
    }
    else if (route.query.error === 'account_blocked') {
        errorMessage.value = 'Tài khoản của bạn đang bị khóa hoặc bị cấm. Vui lòng liên hệ quản trị viên.';
    }
});
const form = reactive({
    email: '',
    password: ''
});
const errors = reactive({
    email: '',
    password: ''
});
const validateEmail = () => {
    if (!form.email) {
        errors.email = 'Vui lòng nhập email.';
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Email không hợp lệ.';
    }
    else {
        errors.email = '';
    }
};
const validatePassword = () => {
    if (!form.password) {
        errors.password = 'Vui lòng nhập mật khẩu.';
    }
    else {
        errors.password = '';
    }
};
const waitForLoginNotice = () => new Promise((resolve) => setTimeout(resolve, LOGIN_NOTICE_REDIRECT_DELAY_MS));
const getEnterpriseLoginNotice = () => {
    if (authStore.userRole !== 'ENTERPRISE' || authStore.enterpriseApproved)
        return '';
    if (authStore.enterpriseKybStatus === 'REJECTED') {
        return 'Hồ sơ doanh nghiệp của bạn chưa được duyệt. Vui lòng kiểm tra thông báo và cập nhật lại GPKD trong phần cài đặt.';
    }
    return 'Tài khoản doanh nghiệp của bạn chưa được duyệt. Bạn vẫn có thể đăng nhập để xem thông báo và nộp GPKD trong phần cài đặt.';
};
const handleLogin = async () => {
    validateEmail();
    validatePassword();
    if (errors.email || errors.password)
        return;
    isLoading.value = true;
    errorMessage.value = '';
    loginNotice.value = '';
    try {
        await authStore.login({
            email: form.email,
            password: form.password
        });
        if (!authStore.userRole) {
            throw new Error('Không lấy được thông tin quyền người dùng hợp lệ');
        }
        const requestedRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined;
        const redirectTo = getLoginRedirectForRole(authStore.userRole, requestedRedirect);
        const enterpriseNotice = getEnterpriseLoginNotice();
        if (enterpriseNotice) {
            loginNotice.value = enterpriseNotice;
            toast.warning('Tài khoản doanh nghiệp chưa được duyệt', enterpriseNotice);
            await waitForLoginNotice();
        }
        await navigateTo(redirectTo);
    }
    catch (err) {
        errorMessage.value = err?.data?.message || err?.message || 'Thông tin tài khoản hoặc mật khẩu chưa chính xác.';
        loginNotice.value = '';
    }
    finally {
        isLoading.value = false;
    }
};
const handleGoogleLogin = async () => {
    try {
        isLoading.value = true;
        errorMessage.value = '';
        loginNotice.value = '';
        const configResponse = await $fetch('http://localhost:8080/api/v1/auth/google/config');
        const config = configResponse.data;
        if (config && config.client_id) {
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=openid%20email%20profile`;
            window.location.href = googleAuthUrl;
        }
        else {
            const mockRedirectUri = config.redirect_uri || 'http://localhost:3000/auth/google/callback';
            window.location.href = `${mockRedirectUri}?code=mock_google_code_${Date.now()}`;
        }
    }
    catch (err) {
        errorMessage.value = 'Không thể kết nối cấu hình đăng nhập Google: ' + (err.message || err);
        isLoading.value = false;
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-auth-secondary']} */ ;
const __VLS_0 = AuthShell || AuthShell;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    active: "login",
    heroVariant: "login",
}));
const __VLS_2 = __VLS_1({
    active: "login",
    heroVariant: "login",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5;
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { hero: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative z-10 flex h-full flex-col justify-between gap-10" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-w-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['max-w-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-sky-100']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        name: "uil:users-alt",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_10 = __VLS_9({
        name: "uil:users-alt",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        id: "auth-hero-title",
        ...{ class: "mt-7 text-4xl font-bold leading-tight tracking-tight text-slate-950 xl:text-5xl" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:text-5xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sky-600" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-5 max-w-lg text-base font-medium leading-8 text-slate-600" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.trustItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (item.title),
            ...{ class: "flex max-w-lg items-start gap-4 rounded-lg bg-white/75 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white/75']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-slate-200/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (['flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', item.iconClass]) },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }));
        const __VLS_15 = __VLS_14({
            name: (item.icon),
            ...{ class: "h-5 w-5" },
            'aria-hidden': "true",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "block text-sm font-bold text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        (item.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mt-1 block text-sm font-medium leading-6 text-slate-600" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
        (item.description);
        // @ts-ignore
        [trustItems,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative hidden min-h-[300px] items-end justify-center xl:flex" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[300px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "absolute bottom-0 h-56 w-[92%] rounded-[48%] bg-sky-100/70 blur-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-56']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[92%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[48%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-100/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['blur-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: "/images/quickwork-career-hero.png",
        alt: "",
        ...{ class: "relative z-10 max-h-[340px] w-full max-w-[520px] object-contain object-bottom" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[340px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[520px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-bottom']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute right-8 top-10 z-20 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs font-bold text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-2 flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "h-2 w-20 rounded bg-slate-200" },
    });
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-200']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        name: "uil:check-circle",
        ...{ class: "h-5 w-5 text-sky-600" },
        'aria-hidden': "true",
    }));
    const __VLS_20 = __VLS_19({
        name: "uil:check-circle",
        ...{ class: "h-5 w-5 text-sky-600" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
    ...{ onSubmit: (__VLS_ctx.handleLogin) },
    ...{ class: "w-full max-w-[520px] rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80 sm:p-9" },
    'aria-labelledby': "login-title",
    novalidate: true,
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[520px]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-200/80']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:p-9']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-sm font-bold uppercase tracking-wide text-sky-600" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    id: "login-title",
    ...{ class: "mt-3 text-3xl font-bold tracking-tight text-slate-950" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-3 text-sm font-medium leading-6 text-slate-600" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" },
        role: "alert",
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-700']} */ ;
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        name: "uil:exclamation-circle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }));
    const __VLS_25 = __VLS_24({
        name: "uil:exclamation-circle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMessage);
}
if (__VLS_ctx.loginNotice) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800" },
        role: "status",
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-800']} */ ;
    let __VLS_28;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        name: "uil:exclamation-triangle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }));
    const __VLS_30 = __VLS_29({
        name: "uil:exclamation-triangle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.loginNotice);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-7 space-y-5" },
});
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
const __VLS_33 = AuthField || AuthField;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    label: "Email",
    icon: "uil:envelope",
    inputId: "login-email",
    error: (__VLS_ctx.errors.email),
}));
const __VLS_35 = __VLS_34({
    label: "Email",
    icon: "uil:envelope",
    inputId: "login-email",
    error: (__VLS_ctx.errors.email),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_38 } = __VLS_36.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
    ...{ onBlur: (__VLS_ctx.validateEmail) },
    ...{ onInput: (__VLS_ctx.validateEmail) },
    id: "login-email",
    type: "email",
    autocomplete: "email",
    required: true,
    ...{ class: "qw-auth-input" },
    placeholder: "Nhập email của bạn",
    'aria-invalid': (Boolean(__VLS_ctx.errors.email)),
    'aria-describedby': (__VLS_ctx.errors.email ? 'login-email-error' : undefined),
});
(__VLS_ctx.form.email);
/** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
// @ts-ignore
[handleLogin, errorMessage, errorMessage, loginNotice, loginNotice, errors, errors, errors, validateEmail, validateEmail, form,];
var __VLS_36;
const __VLS_39 = AuthField || AuthField;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    label: "Mật khẩu",
    icon: "uil:lock",
    inputId: "login-password",
    error: (__VLS_ctx.errors.password),
}));
const __VLS_41 = __VLS_40({
    label: "Mật khẩu",
    icon: "uil:lock",
    inputId: "login-password",
    error: (__VLS_ctx.errors.password),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
    ...{ onBlur: (__VLS_ctx.validatePassword) },
    ...{ onInput: (__VLS_ctx.validatePassword) },
    id: "login-password",
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    autocomplete: "current-password",
    required: true,
    ...{ class: "qw-auth-input" },
    placeholder: "Nhập mật khẩu",
    'aria-invalid': (Boolean(__VLS_ctx.errors.password)),
    'aria-describedby': (__VLS_ctx.errors.password ? 'login-password-error' : undefined),
});
(__VLS_ctx.form.password);
/** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showPassword = !__VLS_ctx.showPassword;
            // @ts-ignore
            [errors, errors, errors, form, validatePassword, validatePassword, showPassword, showPassword, showPassword,];
        } },
    type: "button",
    ...{ class: "rounded-md p-1 text-slate-500 outline-none transition hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-sky-100" },
    'aria-label': (__VLS_ctx.showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'),
});
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
let __VLS_45;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    name: (__VLS_ctx.showPassword ? 'uil:eye-slash' : 'uil:eye'),
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}));
const __VLS_47 = __VLS_46({
    name: (__VLS_ctx.showPassword ? 'uil:eye-slash' : 'uil:eye'),
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
// @ts-ignore
[showPassword, showPassword,];
var __VLS_42;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "inline-flex items-center gap-2 text-sm font-semibold text-slate-700" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    id: "remember-me",
    type: "checkbox",
    ...{ class: "h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" },
});
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-sky-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_50;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    to: "/forgot-password",
    ...{ class: "rounded-md text-sm font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}));
const __VLS_52 = __VLS_51({
    to: "/forgot-password",
    ...{ class: "rounded-md text-sm font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
const { default: __VLS_55 } = __VLS_53.slots;
// @ts-ignore
[];
var __VLS_53;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    type: "submit",
    disabled: (__VLS_ctx.isLoading),
    ...{ class: "qw-auth-primary" },
});
/** @type {__VLS_StyleScopedClasses['qw-auth-primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.isLoading ? 'Đang đăng nhập...' : 'Đăng nhập');
let __VLS_56;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    name: "uil:arrow-right",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}));
const __VLS_58 = __VLS_57({
    name: "uil:arrow-right",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-6 flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['my-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span)({
    ...{ class: "h-px flex-1 bg-slate-200" },
});
/** @type {__VLS_StyleScopedClasses['h-px']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-200']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-xs font-semibold uppercase text-slate-400" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span)({
    ...{ class: "h-px flex-1 bg-slate-200" },
});
/** @type {__VLS_StyleScopedClasses['h-px']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-200']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleGoogleLogin) },
    type: "button",
    disabled: (__VLS_ctx.isLoading),
    ...{ class: "qw-auth-secondary" },
});
/** @type {__VLS_StyleScopedClasses['qw-auth-secondary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-lg font-bold text-[#4285F4]" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#4285F4]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-7 text-center text-sm font-semibold text-slate-600" },
});
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
let __VLS_61;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    to: "/register",
    ...{ class: "rounded-md font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}));
const __VLS_63 = __VLS_62({
    to: "/register",
    ...{ class: "rounded-md font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
const { default: __VLS_66 } = __VLS_64.slots;
// @ts-ignore
[isLoading, isLoading, isLoading, handleGoogleLogin,];
var __VLS_64;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
