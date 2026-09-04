import { defineComponent, h, reactive, ref, resolveComponent, watch } from 'vue';
import { useRoute } from 'vue-router';
import AuthField from '~/components/AuthField.vue';
import AuthShell from '~/components/AuthShell.vue';
import { AuthService } from '~/services/auth.service';
const route = useRoute();
const role = ref('STUDENT');
const isLoading = ref(false);
const uploadingFile = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showStudentPassword = ref(false);
const showStudentConfirmPassword = ref(false);
const showCompanyPassword = ref(false);
const showCompanyConfirmPassword = ref(false);
const benefits = [
    { title: 'Hoàn toàn miễn phí', description: 'Tạo tài khoản và ứng tuyển miễn phí 100%.', icon: 'uil:credit-card-search', iconClass: 'bg-sky-50 text-sky-700' },
    { title: 'Hồ sơ chuyên nghiệp', description: 'Xây dựng hồ sơ ấn tượng và thu hút nhà tuyển dụng.', icon: 'uil:file-alt', iconClass: 'bg-sky-50 text-sky-700' },
    { title: 'Cập nhật việc làm mới', description: 'Nhận thông báo việc làm phù hợp mỗi ngày.', icon: 'uil:bell', iconClass: 'bg-violet-50 text-violet-700' }
];
const AgreementCheckbox = defineComponent({
    setup() {
        const NuxtLink = resolveComponent('NuxtLink');
        return () => h('label', { class: 'flex items-start gap-3 text-sm font-semibold leading-6 text-slate-600' }, [
            h('input', {
                type: 'checkbox',
                required: true,
                class: 'mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500',
                'aria-label': 'Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật'
            }),
            h('span', {}, [
                'Tôi đồng ý với ',
                h(NuxtLink, { to: '#', class: 'font-semibold text-sky-600 hover:text-sky-700' }, () => 'Điều khoản sử dụng'),
                ' và ',
                h(NuxtLink, { to: '#', class: 'font-semibold text-sky-600 hover:text-sky-700' }, () => 'Chính sách bảo mật')
            ])
        ]);
    }
});
const tabClass = (active) => [
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100',
    active ? 'bg-white text-sky-700 shadow-sm ring-1 ring-sky-200' : 'text-slate-600 hover:text-slate-900'
];
const changeRole = (newRole) => {
    role.value = newRole;
    errorMessage.value = '';
    successMessage.value = '';
};
const queryToRole = () => {
    const raw = route.query.role || route.query.type || route.query.account;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const normalized = String(value || '').toLowerCase();
    if (['enterprise', 'company', 'employer', 'recruiter', 'business', 'doanh-nghiep', 'nha-tuyen-dung'].includes(normalized)) {
        return 'COMPANY';
    }
    return 'STUDENT';
};
watch(() => [route.query.role, route.query.type, route.query.account], () => changeRole(queryToRole()), { immediate: true });
const studentForm = reactive({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const studentErrors = reactive({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const validateStudentName = () => {
    if (!studentForm.name) {
        studentErrors.name = 'Vui lòng nhập họ và tên.';
    }
    else if (studentForm.name.length < 2) {
        studentErrors.name = 'Họ và tên phải có ít nhất 2 ký tự.';
    }
    else {
        studentErrors.name = '';
    }
};
const validateStudentPhone = () => {
    if (!studentForm.phone) {
        studentErrors.phone = 'Vui lòng nhập số điện thoại.';
    }
    else if (!/^\d+$/.test(studentForm.phone)) {
        studentErrors.phone = 'Số điện thoại chỉ được chứa ký tự số.';
    }
    else if (studentForm.phone.length < 10 || studentForm.phone.length > 11) {
        studentErrors.phone = 'Số điện thoại phải từ 10 đến 11 số.';
    }
    else {
        studentErrors.phone = '';
    }
};
const validateStudentEmail = () => {
    if (!studentForm.email) {
        studentErrors.email = 'Vui lòng nhập email.';
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentForm.email)) {
        studentErrors.email = 'Email không đúng định dạng.';
    }
    else {
        studentErrors.email = '';
    }
};
const validateStudentPassword = () => {
    if (!studentForm.password) {
        studentErrors.password = 'Vui lòng nhập mật khẩu.';
    }
    else if (studentForm.password.length < 6) {
        studentErrors.password = 'Mật khẩu phải từ 6 ký tự.';
    }
    else {
        studentErrors.password = '';
    }
};
const validateStudentConfirmPassword = () => {
    if (!studentForm.confirmPassword) {
        studentErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    }
    else if (studentForm.confirmPassword !== studentForm.password) {
        studentErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    else {
        studentErrors.confirmPassword = '';
    }
};
const handleStudentRegister = async () => {
    validateStudentName();
    validateStudentPhone();
    validateStudentEmail();
    validateStudentPassword();
    validateStudentConfirmPassword();
    if (studentErrors.name ||
        studentErrors.phone ||
        studentErrors.email ||
        studentErrors.password ||
        studentErrors.confirmPassword) {
        return;
    }
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        const res = await AuthService.registerStudent({
            email: studentForm.email,
            password: studentForm.password,
            name: studentForm.name,
            phone: studentForm.phone
        });
        if (res.success) {
            successMessage.value = 'Đăng ký tài khoản sinh viên thành công. Đang chuyển hướng sang đăng nhập...';
            setTimeout(() => navigateTo('/auth/login'), 2000);
        }
        else {
            errorMessage.value = res.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        }
    }
    catch (err) {
        errorMessage.value = err.data?.message || err.message || 'Lỗi hệ thống khi đăng ký.';
    }
    finally {
        isLoading.value = false;
    }
};
const companyForm = reactive({
    company_name: '',
    tax_code: '',
    phone: '',
    gpkd_url: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const companyErrors = reactive({
    company_name: '',
    tax_code: '',
    phone: '',
    gpkd_url: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const validateCompanyName = () => {
    if (!companyForm.company_name) {
        companyErrors.company_name = 'Vui lòng nhập tên doanh nghiệp.';
    }
    else if (companyForm.company_name.length < 3) {
        companyErrors.company_name = 'Tên doanh nghiệp phải từ 3 ký tự trở lên.';
    }
    else {
        companyErrors.company_name = '';
    }
};
const validateCompanyTax = () => {
    if (!companyForm.tax_code) {
        companyErrors.tax_code = 'Vui lòng nhập mã số thuế.';
    }
    else if (!/^\d+$/.test(companyForm.tax_code)) {
        companyErrors.tax_code = 'Mã số thuế chỉ được chứa số.';
    }
    else if (companyForm.tax_code.length < 10 || companyForm.tax_code.length > 13) {
        companyErrors.tax_code = 'Mã số thuế phải từ 10 đến 13 ký số.';
    }
    else {
        companyErrors.tax_code = '';
    }
};
const validateCompanyPhone = () => {
    if (!companyForm.phone) {
        companyErrors.phone = 'Vui lòng nhập số điện thoại liên hệ.';
    }
    else if (!/^\d+$/.test(companyForm.phone)) {
        companyErrors.phone = 'Số điện thoại liên hệ chỉ được chứa ký tự số.';
    }
    else if (companyForm.phone.length < 10 || companyForm.phone.length > 11) {
        companyErrors.phone = 'Số điện thoại liên hệ phải từ 10 đến 11 số.';
    }
    else {
        companyErrors.phone = '';
    }
};
const validateCompanyEmail = () => {
    if (!companyForm.email) {
        companyErrors.email = 'Vui lòng nhập email.';
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyForm.email)) {
        companyErrors.email = 'Email không đúng định dạng.';
    }
    else {
        companyErrors.email = '';
    }
};
const validateCompanyPassword = () => {
    if (!companyForm.password) {
        companyErrors.password = 'Vui lòng nhập mật khẩu.';
    }
    else if (companyForm.password.length < 6) {
        companyErrors.password = 'Mật khẩu phải từ 6 ký tự.';
    }
    else {
        companyErrors.password = '';
    }
};
const validateCompanyConfirmPassword = () => {
    if (!companyForm.confirmPassword) {
        companyErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    }
    else if (companyForm.confirmPassword !== companyForm.password) {
        companyErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    else {
        companyErrors.confirmPassword = '';
    }
};
const handleFileUpload = async (event) => {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    uploadingFile.value = true;
    errorMessage.value = '';
    companyErrors.gpkd_url = '';
    try {
        const res = await AuthService.uploadGPKD(file);
        if (res.success && res.url) {
            companyForm.gpkd_url = res.url;
        }
        else {
            companyErrors.gpkd_url = 'Tải file lên thất bại.';
        }
    }
    catch (err) {
        companyErrors.gpkd_url = err.data?.message || err.message || 'Lỗi tải file lên.';
    }
    finally {
        uploadingFile.value = false;
    }
};
const handleCompanyRegister = async () => {
    validateCompanyName();
    validateCompanyTax();
    validateCompanyPhone();
    validateCompanyEmail();
    validateCompanyPassword();
    validateCompanyConfirmPassword();
    companyErrors.gpkd_url = companyForm.gpkd_url ? '' : 'Vui lòng tải lên giấy phép kinh doanh (GPKD).';
    if (companyErrors.company_name ||
        companyErrors.tax_code ||
        companyErrors.phone ||
        companyErrors.gpkd_url ||
        companyErrors.email ||
        companyErrors.password ||
        companyErrors.confirmPassword) {
        return;
    }
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        const res = await AuthService.registerEnterprise({
            email: companyForm.email,
            password: companyForm.password,
            company_name: companyForm.company_name,
            phone: companyForm.phone,
            tax_code: companyForm.tax_code,
            gpkd_url: companyForm.gpkd_url
        });
        if (res.success) {
            successMessage.value = 'Đăng ký tài khoản doanh nghiệp thành công. Đang chuyển hướng sang đăng nhập...';
            setTimeout(() => navigateTo('/auth/login'), 2000);
        }
        else {
            errorMessage.value = res.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        }
    }
    catch (err) {
        errorMessage.value = err.data?.message || err.message || 'Lỗi hệ thống khi đăng ký.';
    }
    finally {
        isLoading.value = false;
    }
};
const handleGoogleLogin = async () => {
    try {
        isLoading.value = true;
        errorMessage.value = '';
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
        errorMessage.value = 'Không thể kết nối cấu hình đăng ký Google: ' + (err.message || err);
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
/** @type {__VLS_StyleScopedClasses['qw-icon-button']} */ ;
/** @type {__VLS_StyleScopedClasses['qw-icon-button']} */ ;
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
    active: "register",
    heroVariant: "register",
    reverse: true,
}));
const __VLS_2 = __VLS_1({
    active: "register",
    heroVariant: "register",
    reverse: true,
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
        ...{ class: "inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
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
        name: "uil:user-plus",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_10 = __VLS_9({
        name: "uil:user-plus",
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
        ...{ class: "grid gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.benefits))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (item.title),
            ...{ class: "flex max-w-lg items-start gap-4 rounded-lg bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white/80']} */ ;
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
        [benefits,];
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
        ...{ class: "absolute bottom-8 h-64 w-[90%] rounded-[48%] bg-sky-100/80 blur-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[48%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-100/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['blur-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: "/images/quickwork-career-hero.png",
        alt: "",
        ...{ class: "relative z-10 max-h-[350px] w-full max-w-[520px] object-contain object-bottom" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[350px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[520px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-bottom']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute left-8 top-12 z-20 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-12']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "h-2 w-24 rounded bg-slate-200" },
    });
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-200']} */ ;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "w-full max-w-[680px] rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80 sm:p-9" },
    'aria-labelledby': "register-title",
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[680px]']} */ ;
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
    id: "register-title",
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-6 grid rounded-lg bg-slate-100 p-1 sm:grid-cols-2" },
    role: "tablist",
    'aria-label': "Chọn loại tài khoản",
});
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.changeRole('STUDENT');
            // @ts-ignore
            [changeRole,];
        } },
    type: "button",
    role: "tab",
    'aria-selected': (__VLS_ctx.role === 'STUDENT'),
    ...{ class: (__VLS_ctx.tabClass(__VLS_ctx.role === 'STUDENT')) },
});
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    name: "uil:graduation-cap",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}));
const __VLS_25 = __VLS_24({
    name: "uil:graduation-cap",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.changeRole('COMPANY');
            // @ts-ignore
            [changeRole, role, role, tabClass,];
        } },
    type: "button",
    role: "tab",
    'aria-selected': (__VLS_ctx.role === 'COMPANY'),
    ...{ class: (__VLS_ctx.tabClass(__VLS_ctx.role === 'COMPANY')) },
});
let __VLS_28;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    name: "uil:building",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}));
const __VLS_30 = __VLS_29({
    name: "uil:building",
    ...{ class: "h-5 w-5" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
if (__VLS_ctx.successMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-5 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-700" },
        role: "status",
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        name: "uil:check-circle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }));
    const __VLS_35 = __VLS_34({
        name: "uil:check-circle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.successMessage);
}
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" },
        role: "alert",
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
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
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        name: "uil:exclamation-circle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }));
    const __VLS_40 = __VLS_39({
        name: "uil:exclamation-circle",
        ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMessage);
}
if (__VLS_ctx.role === 'STUDENT') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.handleStudentRegister) },
        ...{ class: "mt-7 space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-5 sm:grid-cols-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    const __VLS_43 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        label: "Họ và tên",
        icon: "uil:user",
        inputId: "student-name",
        error: (__VLS_ctx.studentErrors.name),
    }));
    const __VLS_45 = __VLS_44({
        label: "Họ và tên",
        icon: "uil:user",
        inputId: "student-name",
        error: (__VLS_ctx.studentErrors.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const { default: __VLS_48 } = __VLS_46.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateStudentName) },
        ...{ onInput: (__VLS_ctx.validateStudentName) },
        id: "student-name",
        value: (__VLS_ctx.studentForm.name),
        type: "text",
        autocomplete: "name",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập họ và tên",
        'aria-invalid': (Boolean(__VLS_ctx.studentErrors.name)),
        'aria-describedby': (__VLS_ctx.studentErrors.name ? 'student-name-error' : undefined),
    });
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    // @ts-ignore
    [role, role, role, tabClass, successMessage, successMessage, errorMessage, errorMessage, handleStudentRegister, studentErrors, studentErrors, studentErrors, validateStudentName, validateStudentName, studentForm,];
    var __VLS_46;
    const __VLS_49 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        label: "Số điện thoại",
        icon: "uil:phone",
        inputId: "student-phone",
        error: (__VLS_ctx.studentErrors.phone),
    }));
    const __VLS_51 = __VLS_50({
        label: "Số điện thoại",
        icon: "uil:phone",
        inputId: "student-phone",
        error: (__VLS_ctx.studentErrors.phone),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const { default: __VLS_54 } = __VLS_52.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateStudentPhone) },
        ...{ onInput: (__VLS_ctx.validateStudentPhone) },
        id: "student-phone",
        type: "tel",
        autocomplete: "tel",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập số điện thoại",
        'aria-invalid': (Boolean(__VLS_ctx.studentErrors.phone)),
        'aria-describedby': (__VLS_ctx.studentErrors.phone ? 'student-phone-error' : undefined),
    });
    (__VLS_ctx.studentForm.phone);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    // @ts-ignore
    [studentErrors, studentErrors, studentErrors, studentForm, validateStudentPhone, validateStudentPhone,];
    var __VLS_52;
    const __VLS_55 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        label: "Email",
        icon: "uil:envelope",
        inputId: "student-email",
        error: (__VLS_ctx.studentErrors.email),
    }));
    const __VLS_57 = __VLS_56({
        label: "Email",
        icon: "uil:envelope",
        inputId: "student-email",
        error: (__VLS_ctx.studentErrors.email),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const { default: __VLS_60 } = __VLS_58.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateStudentEmail) },
        ...{ onInput: (__VLS_ctx.validateStudentEmail) },
        id: "student-email",
        type: "email",
        autocomplete: "email",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập email của bạn",
        'aria-invalid': (Boolean(__VLS_ctx.studentErrors.email)),
        'aria-describedby': (__VLS_ctx.studentErrors.email ? 'student-email-error' : undefined),
    });
    (__VLS_ctx.studentForm.email);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    // @ts-ignore
    [studentErrors, studentErrors, studentErrors, studentForm, validateStudentEmail, validateStudentEmail,];
    var __VLS_58;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-5 sm:grid-cols-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    const __VLS_61 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        label: "Mật khẩu",
        icon: "uil:lock",
        inputId: "student-password",
        error: (__VLS_ctx.studentErrors.password),
    }));
    const __VLS_63 = __VLS_62({
        label: "Mật khẩu",
        icon: "uil:lock",
        inputId: "student-password",
        error: (__VLS_ctx.studentErrors.password),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const { default: __VLS_66 } = __VLS_64.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateStudentPassword) },
        ...{ onInput: (__VLS_ctx.validateStudentPassword) },
        id: "student-password",
        type: (__VLS_ctx.showStudentPassword ? 'text' : 'password'),
        autocomplete: "new-password",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Tạo mật khẩu",
        'aria-invalid': (Boolean(__VLS_ctx.studentErrors.password)),
        'aria-describedby': (__VLS_ctx.studentErrors.password ? 'student-password-error' : undefined),
    });
    (__VLS_ctx.studentForm.password);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.role === 'STUDENT'))
                    return;
                __VLS_ctx.showStudentPassword = !__VLS_ctx.showStudentPassword;
                // @ts-ignore
                [studentErrors, studentErrors, studentErrors, studentForm, validateStudentPassword, validateStudentPassword, showStudentPassword, showStudentPassword, showStudentPassword,];
            } },
        type: "button",
        ...{ class: "qw-icon-button" },
        'aria-label': (__VLS_ctx.showStudentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'),
    });
    /** @type {__VLS_StyleScopedClasses['qw-icon-button']} */ ;
    let __VLS_67;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        name: (__VLS_ctx.showStudentPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_69 = __VLS_68({
        name: (__VLS_ctx.showStudentPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [showStudentPassword, showStudentPassword,];
    var __VLS_64;
    const __VLS_72 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        label: "Xác nhận mật khẩu",
        icon: "uil:lock",
        inputId: "student-confirm-password",
        error: (__VLS_ctx.studentErrors.confirmPassword),
    }));
    const __VLS_74 = __VLS_73({
        label: "Xác nhận mật khẩu",
        icon: "uil:lock",
        inputId: "student-confirm-password",
        error: (__VLS_ctx.studentErrors.confirmPassword),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const { default: __VLS_77 } = __VLS_75.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateStudentConfirmPassword) },
        ...{ onInput: (__VLS_ctx.validateStudentConfirmPassword) },
        id: "student-confirm-password",
        type: (__VLS_ctx.showStudentConfirmPassword ? 'text' : 'password'),
        autocomplete: "new-password",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập lại mật khẩu",
        'aria-invalid': (Boolean(__VLS_ctx.studentErrors.confirmPassword)),
        'aria-describedby': (__VLS_ctx.studentErrors.confirmPassword ? 'student-confirm-password-error' : undefined),
    });
    (__VLS_ctx.studentForm.confirmPassword);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.role === 'STUDENT'))
                    return;
                __VLS_ctx.showStudentConfirmPassword = !__VLS_ctx.showStudentConfirmPassword;
                // @ts-ignore
                [studentErrors, studentErrors, studentErrors, studentForm, validateStudentConfirmPassword, validateStudentConfirmPassword, showStudentConfirmPassword, showStudentConfirmPassword, showStudentConfirmPassword,];
            } },
        type: "button",
        ...{ class: "qw-icon-button" },
        'aria-label': (__VLS_ctx.showStudentConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'),
    });
    /** @type {__VLS_StyleScopedClasses['qw-icon-button']} */ ;
    let __VLS_78;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
        name: (__VLS_ctx.showStudentConfirmPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_80 = __VLS_79({
        name: (__VLS_ctx.showStudentConfirmPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [showStudentConfirmPassword, showStudentConfirmPassword,];
    var __VLS_75;
    let __VLS_83;
    /** @ts-ignore @type { | typeof __VLS_components.AgreementCheckbox} */
    AgreementCheckbox;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({}));
    const __VLS_85 = __VLS_84({}, ...__VLS_functionalComponentArgsRest(__VLS_84));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        disabled: (__VLS_ctx.isLoading),
        ...{ class: "qw-auth-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['qw-auth-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.isLoading ? 'Đang đăng ký...' : 'Đăng ký');
    let __VLS_88;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
        name: "uil:arrow-right",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_90 = __VLS_89({
        name: "uil:arrow-right",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.handleCompanyRegister) },
        ...{ class: "mt-7 space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-5 sm:grid-cols-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    const __VLS_93 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
        label: "Tên doanh nghiệp",
        icon: "uil:building",
        inputId: "company-name",
        error: (__VLS_ctx.companyErrors.company_name),
    }));
    const __VLS_95 = __VLS_94({
        label: "Tên doanh nghiệp",
        icon: "uil:building",
        inputId: "company-name",
        error: (__VLS_ctx.companyErrors.company_name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    const { default: __VLS_98 } = __VLS_96.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateCompanyName) },
        ...{ onInput: (__VLS_ctx.validateCompanyName) },
        id: "company-name",
        value: (__VLS_ctx.companyForm.company_name),
        type: "text",
        autocomplete: "organization",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập tên doanh nghiệp",
        'aria-invalid': (Boolean(__VLS_ctx.companyErrors.company_name)),
        'aria-describedby': (__VLS_ctx.companyErrors.company_name ? 'company-name-error' : undefined),
    });
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    // @ts-ignore
    [isLoading, isLoading, handleCompanyRegister, companyErrors, companyErrors, companyErrors, validateCompanyName, validateCompanyName, companyForm,];
    var __VLS_96;
    const __VLS_99 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        label: "Mã số thuế",
        icon: "uil:receipt",
        inputId: "company-tax",
        error: (__VLS_ctx.companyErrors.tax_code),
    }));
    const __VLS_101 = __VLS_100({
        label: "Mã số thuế",
        icon: "uil:receipt",
        inputId: "company-tax",
        error: (__VLS_ctx.companyErrors.tax_code),
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    const { default: __VLS_104 } = __VLS_102.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateCompanyTax) },
        ...{ onInput: (__VLS_ctx.validateCompanyTax) },
        id: "company-tax",
        value: (__VLS_ctx.companyForm.tax_code),
        type: "text",
        inputmode: "numeric",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập mã số thuế",
        'aria-invalid': (Boolean(__VLS_ctx.companyErrors.tax_code)),
        'aria-describedby': (__VLS_ctx.companyErrors.tax_code ? 'company-tax-error' : undefined),
    });
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    // @ts-ignore
    [companyErrors, companyErrors, companyErrors, companyForm, validateCompanyTax, validateCompanyTax,];
    var __VLS_102;
    const __VLS_105 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        label: "Số điện thoại liên hệ",
        icon: "uil:phone",
        inputId: "company-phone",
        error: (__VLS_ctx.companyErrors.phone),
    }));
    const __VLS_107 = __VLS_106({
        label: "Số điện thoại liên hệ",
        icon: "uil:phone",
        inputId: "company-phone",
        error: (__VLS_ctx.companyErrors.phone),
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    const { default: __VLS_110 } = __VLS_108.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateCompanyPhone) },
        ...{ onInput: (__VLS_ctx.validateCompanyPhone) },
        id: "company-phone",
        type: "tel",
        autocomplete: "tel",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập số điện thoại liên hệ",
        'aria-invalid': (Boolean(__VLS_ctx.companyErrors.phone)),
        'aria-describedby': (__VLS_ctx.companyErrors.phone ? 'company-phone-error' : undefined),
    });
    (__VLS_ctx.companyForm.phone);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    // @ts-ignore
    [companyErrors, companyErrors, companyErrors, companyForm, validateCompanyPhone, validateCompanyPhone,];
    var __VLS_108;
    const __VLS_111 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
        label: "Email doanh nghiệp",
        icon: "uil:envelope",
        inputId: "company-email",
        error: (__VLS_ctx.companyErrors.email),
    }));
    const __VLS_113 = __VLS_112({
        label: "Email doanh nghiệp",
        icon: "uil:envelope",
        inputId: "company-email",
        error: (__VLS_ctx.companyErrors.email),
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    const { default: __VLS_116 } = __VLS_114.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateCompanyEmail) },
        ...{ onInput: (__VLS_ctx.validateCompanyEmail) },
        id: "company-email",
        type: "email",
        autocomplete: "email",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập email doanh nghiệp",
        'aria-invalid': (Boolean(__VLS_ctx.companyErrors.email)),
        'aria-describedby': (__VLS_ctx.companyErrors.email ? 'company-email-error' : undefined),
    });
    (__VLS_ctx.companyForm.email);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    // @ts-ignore
    [companyErrors, companyErrors, companyErrors, companyForm, validateCompanyEmail, validateCompanyEmail,];
    var __VLS_114;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-bold text-slate-900" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-2 flex flex-col gap-3 rounded-lg border px-4 py-3 transition sm:flex-row sm:items-center" },
        ...{ class: (__VLS_ctx.companyErrors.gpkd_url ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white') },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "gpkd-file",
        ...{ class: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus-within:ring-4 focus-within:ring-sky-100" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-within:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-within:ring-sky-100']} */ ;
    let __VLS_117;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
        name: "uil:upload",
        ...{ class: "h-4 w-4" },
        'aria-hidden': "true",
    }));
    const __VLS_119 = __VLS_118({
        name: "uil:upload",
        ...{ class: "h-4 w-4" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.handleFileUpload) },
        id: "gpkd-file",
        type: "file",
        ...{ class: "sr-only" },
        accept: ".jpg,.jpeg,.png,.pdf,.docx",
        'aria-invalid': (Boolean(__VLS_ctx.companyErrors.gpkd_url)),
        'aria-describedby': (__VLS_ctx.companyErrors.gpkd_url ? 'gpkd-file-error' : undefined),
    });
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-semibold" },
        ...{ class: (__VLS_ctx.companyForm.gpkd_url ? 'text-sky-700' : 'text-slate-600') },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    if (__VLS_ctx.uploadingFile) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else if (__VLS_ctx.companyForm.gpkd_url) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    if (__VLS_ctx.companyErrors.gpkd_url) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            id: "gpkd-file-error",
            ...{ class: "mt-1.5 block text-xs font-semibold text-rose-600" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-rose-600']} */ ;
        (__VLS_ctx.companyErrors.gpkd_url);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-5 sm:grid-cols-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    const __VLS_122 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
        label: "Mật khẩu",
        icon: "uil:lock",
        inputId: "company-password",
        error: (__VLS_ctx.companyErrors.password),
    }));
    const __VLS_124 = __VLS_123({
        label: "Mật khẩu",
        icon: "uil:lock",
        inputId: "company-password",
        error: (__VLS_ctx.companyErrors.password),
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    const { default: __VLS_127 } = __VLS_125.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateCompanyPassword) },
        ...{ onInput: (__VLS_ctx.validateCompanyPassword) },
        id: "company-password",
        type: (__VLS_ctx.showCompanyPassword ? 'text' : 'password'),
        autocomplete: "new-password",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Tạo mật khẩu",
        'aria-invalid': (Boolean(__VLS_ctx.companyErrors.password)),
        'aria-describedby': (__VLS_ctx.companyErrors.password ? 'company-password-error' : undefined),
    });
    (__VLS_ctx.companyForm.password);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.role === 'STUDENT'))
                    return;
                __VLS_ctx.showCompanyPassword = !__VLS_ctx.showCompanyPassword;
                // @ts-ignore
                [companyErrors, companyErrors, companyErrors, companyErrors, companyErrors, companyErrors, companyErrors, companyErrors, companyForm, companyForm, companyForm, handleFileUpload, uploadingFile, validateCompanyPassword, validateCompanyPassword, showCompanyPassword, showCompanyPassword, showCompanyPassword,];
            } },
        type: "button",
        ...{ class: "qw-icon-button" },
        'aria-label': (__VLS_ctx.showCompanyPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'),
    });
    /** @type {__VLS_StyleScopedClasses['qw-icon-button']} */ ;
    let __VLS_128;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
        name: (__VLS_ctx.showCompanyPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_130 = __VLS_129({
        name: (__VLS_ctx.showCompanyPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [showCompanyPassword, showCompanyPassword,];
    var __VLS_125;
    const __VLS_133 = AuthField || AuthField;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
        label: "Xác nhận mật khẩu",
        icon: "uil:lock",
        inputId: "company-confirm-password",
        error: (__VLS_ctx.companyErrors.confirmPassword),
    }));
    const __VLS_135 = __VLS_134({
        label: "Xác nhận mật khẩu",
        icon: "uil:lock",
        inputId: "company-confirm-password",
        error: (__VLS_ctx.companyErrors.confirmPassword),
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    const { default: __VLS_138 } = __VLS_136.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_ctx.validateCompanyConfirmPassword) },
        ...{ onInput: (__VLS_ctx.validateCompanyConfirmPassword) },
        id: "company-confirm-password",
        type: (__VLS_ctx.showCompanyConfirmPassword ? 'text' : 'password'),
        autocomplete: "new-password",
        required: true,
        ...{ class: "qw-auth-input" },
        placeholder: "Nhập lại mật khẩu",
        'aria-invalid': (Boolean(__VLS_ctx.companyErrors.confirmPassword)),
        'aria-describedby': (__VLS_ctx.companyErrors.confirmPassword ? 'company-confirm-password-error' : undefined),
    });
    (__VLS_ctx.companyForm.confirmPassword);
    /** @type {__VLS_StyleScopedClasses['qw-auth-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.role === 'STUDENT'))
                    return;
                __VLS_ctx.showCompanyConfirmPassword = !__VLS_ctx.showCompanyConfirmPassword;
                // @ts-ignore
                [companyErrors, companyErrors, companyErrors, companyForm, validateCompanyConfirmPassword, validateCompanyConfirmPassword, showCompanyConfirmPassword, showCompanyConfirmPassword, showCompanyConfirmPassword,];
            } },
        type: "button",
        ...{ class: "qw-icon-button" },
        'aria-label': (__VLS_ctx.showCompanyConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'),
    });
    /** @type {__VLS_StyleScopedClasses['qw-icon-button']} */ ;
    let __VLS_139;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
        name: (__VLS_ctx.showCompanyConfirmPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_141 = __VLS_140({
        name: (__VLS_ctx.showCompanyConfirmPassword ? 'uil:eye-slash' : 'uil:eye'),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    // @ts-ignore
    [showCompanyConfirmPassword, showCompanyConfirmPassword,];
    var __VLS_136;
    let __VLS_144;
    /** @ts-ignore @type { | typeof __VLS_components.AgreementCheckbox} */
    AgreementCheckbox;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        disabled: (__VLS_ctx.isLoading || __VLS_ctx.uploadingFile),
        ...{ class: "qw-auth-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['qw-auth-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.isLoading ? 'Đang đăng ký...' : 'Đăng ký doanh nghiệp');
    let __VLS_149;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
        name: "uil:arrow-right",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_151 = __VLS_150({
        name: "uil:arrow-right",
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-7 flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['my-7']} */ ;
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
    disabled: (__VLS_ctx.isLoading || __VLS_ctx.uploadingFile),
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
let __VLS_154;
/** @ts-ignore @type { | typeof __VLS_components.NuxtLink | typeof __VLS_components.NuxtLink} */
NuxtLink;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
    to: "/login",
    ...{ class: "rounded-md font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}));
const __VLS_156 = __VLS_155({
    to: "/login",
    ...{ class: "rounded-md font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100" },
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
const { default: __VLS_159 } = __VLS_157.slots;
// @ts-ignore
[isLoading, isLoading, isLoading, uploadingFile, uploadingFile, handleGoogleLogin,];
var __VLS_157;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
