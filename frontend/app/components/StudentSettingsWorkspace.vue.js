import { computed, onMounted, reactive, ref } from 'vue';
import { AuthService } from '~/services/auth.service';
import { StudentService } from '~/services/student.service';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
const settingItems = [
    { key: 'account', label: 'Tài khoản', description: 'Thông tin cá nhân và hồ sơ', icon: 'uil:user' },
    { key: 'security', label: 'Bảo mật', description: 'Đổi mật khẩu tài khoản', icon: 'uil:lock' },
    { key: 'jobs', label: 'Tùy chọn tìm việc', description: 'Địa điểm, ngành nghề, mức lương', icon: 'uil:briefcase-alt' },
    { key: 'privacy', label: 'Quyền riêng tư', description: 'Quyền xem và liên hệ', icon: 'uil:shield-check' }
];
const authStore = useAuthStore();
const toast = useToast();
const activeSetting = ref('account');
const isLoading = ref(true);
const isSaving = ref(false);
const profile = ref({});
const accountForm = reactive({ name: '', phone: '', avatar: '', cv_url: '' });
const jobForm = reactive({ preferred_location: '', preferred_category: '', expected_salary: '', preferred_job_type: '' });
const privacyForm = reactive({ profile_visible: true, allow_enterprise_contact: true, show_contact_info: false });
const passwordForm = reactive({ current_password: '', new_password: '', confirm_password: '' });
const userEmail = computed(() => String(profile.value?.email || authStore.user?.email || ''));
const userInitials = computed(() => (accountForm.name || userEmail.value.split('@')[0] || 'SV').split(/\s+/).filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase());
function getProfileFromResponse(response) {
    return response?.data?.student_profile || response?.data?.studentProfile || response?.student_profile || response?.studentProfile || {};
}
function applyProfileResponse(response) {
    const user = response?.data || response || {};
    const studentProfile = getProfileFromResponse(response);
    profile.value = user;
    Object.assign(accountForm, { name: studentProfile.name || user.name || authStore.user?.name || '', phone: studentProfile.phone || '', avatar: studentProfile.avatar || '', cv_url: studentProfile.cv_url || '' });
    Object.assign(jobForm, { preferred_location: studentProfile.preferred_location || '', preferred_category: studentProfile.preferred_category || '', expected_salary: studentProfile.expected_salary || '', preferred_job_type: studentProfile.preferred_job_type || '' });
    Object.assign(privacyForm, { profile_visible: studentProfile.profile_visible !== false, allow_enterprise_contact: studentProfile.allow_enterprise_contact !== false, show_contact_info: studentProfile.show_contact_info === true });
}
function extractErrorMessage(error, fallback) {
    return error?.data?.message || error?.response?._data?.message || error?.message || fallback;
}
async function loadProfile() {
    isLoading.value = true;
    try {
        applyProfileResponse(await StudentService.getProfile());
    }
    catch (error) {
        toast.error('Không thể tải cài đặt', extractErrorMessage(error, 'Vui lòng thử tải lại trang.'));
    }
    finally {
        isLoading.value = false;
    }
}
async function saveProfile(payload, successMessage) {
    isSaving.value = true;
    try {
        const response = await StudentService.updateProfile(payload);
        applyProfileResponse(response);
        authStore.setCurrentUser({ ...authStore.user, name: accountForm.name, student_profile: getProfileFromResponse(response) });
        toast.success('Đã lưu thay đổi', successMessage);
    }
    catch (error) {
        toast.error('Không thể lưu thay đổi', extractErrorMessage(error, 'Vui lòng kiểm tra dữ liệu và thử lại.'));
    }
    finally {
        isSaving.value = false;
    }
}
function saveAccount() {
    if (!accountForm.name.trim())
        return toast.error('Thiếu thông tin', 'Vui lòng nhập họ và tên.');
    if (accountForm.phone && !/^\d{10,11}$/.test(accountForm.phone))
        return toast.error('Số điện thoại chưa đúng', 'Số điện thoại phải gồm 10 đến 11 chữ số.');
    return saveProfile({ ...accountForm }, 'Thông tin tài khoản đã được cập nhật.');
}
function saveJobPreferences() {
    return saveProfile({ ...jobForm }, 'Tùy chọn tìm việc đã được cập nhật.');
}
function savePrivacy() {
    return saveProfile({ ...privacyForm }, 'Cài đặt quyền riêng tư đã được áp dụng.');
}
async function changePassword() {
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password)
        return toast.error('Thiếu thông tin', 'Vui lòng nhập đầy đủ ba trường mật khẩu.');
    if (passwordForm.new_password !== passwordForm.confirm_password)
        return toast.error('Mật khẩu không khớp', 'Xác nhận mật khẩu mới chưa trùng khớp.');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*(?:\d|[^A-Za-z\d\s]))\S{8,}$/.test(passwordForm.new_password))
        return toast.error('Mật khẩu chưa đủ mạnh', 'Cần ít nhất 8 ký tự, có chữ hoa, chữ thường, số hoặc ký tự đặc biệt và không có khoảng trắng.');
    isSaving.value = true;
    try {
        const response = await AuthService.changePassword({ ...passwordForm });
        Object.assign(passwordForm, { current_password: '', new_password: '', confirm_password: '' });
        toast.success('Đổi mật khẩu thành công', response?.message || 'Bạn có thể tiếp tục sử dụng phiên đăng nhập hiện tại.');
    }
    catch (error) {
        toast.error('Không thể đổi mật khẩu', extractErrorMessage(error, 'Vui lòng kiểm tra mật khẩu hiện tại và thử lại.'));
    }
    finally {
        isSaving.value = false;
    }
}
function resetAccount() { applyProfileResponse({ data: profile.value }); }
function resetJobPreferences() { applyProfileResponse({ data: profile.value }); }
function resetPrivacy() { applyProfileResponse({ data: profile.value }); }
onMounted(loadProfile);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto w-full max-w-[1220px]" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[1220px]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "mb-6" },
});
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-2xl font-black tracking-tight text-slate-950" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm font-medium text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid items-start gap-6 xl:grid-cols-[290px_minmax(0,1fr)]" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:grid-cols-[290px_minmax(0,1fr)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/40" },
});
/** @type {__VLS_StyleScopedClasses['rounded-[22px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-200/40']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.settingItems))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeSetting = item.key;
                // @ts-ignore
                [settingItems, activeSetting,];
            } },
        key: (item.key),
        type: "button",
        ...{ class: ([
                'group flex min-h-[72px] w-full items-center gap-3 rounded-2xl px-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
                __VLS_ctx.activeSetting === item.key ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[72px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', __VLS_ctx.activeSetting === item.key ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-50 text-slate-500']) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        name: (item.icon),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }));
    const __VLS_2 = __VLS_1({
        name: (item.icon),
        ...{ class: "h-5 w-5" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "min-w-0 flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block text-sm font-black" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    (item.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mt-1 block text-[11px] font-medium text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (item.description);
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        name: "uil:angle-right",
        ...{ class: "h-5 w-5 shrink-0 text-slate-400" },
        'aria-hidden': "true",
    }));
    const __VLS_7 = __VLS_6({
        name: "uil:angle-right",
        ...{ class: "h-5 w-5 shrink-0 text-slate-400" },
        'aria-hidden': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    // @ts-ignore
    [activeSetting, activeSetting,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "min-h-[590px] min-w-0 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-7" },
});
/** @type {__VLS_StyleScopedClasses['min-h-[590px]']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-[22px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-200/40']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:p-7']} */ ;
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex min-h-[480px] flex-col items-center justify-center text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[480px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        name: "uil:spinner-alt",
        ...{ class: "h-9 w-9 animate-spin text-blue-600" },
    }));
    const __VLS_12 = __VLS_11({
        name: "uil:spinner-alt",
        ...{ class: "h-9 w-9 animate-spin text-blue-600" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-3 text-sm font-bold text-slate-600" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
}
else {
    if (__VLS_ctx.activeSetting === 'account') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (__VLS_ctx.saveAccount) },
        });
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.SectionHeading} */
        SectionHeading;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            title: "Thông tin tài khoản",
            description: "Cập nhật thông tin cá nhân và hồ sơ ứng tuyển của bạn.",
            icon: "uil:user",
        }));
        const __VLS_17 = __VLS_16({
            title: "Thông tin tài khoản",
            description: "Cập nhật thông tin cá nhân và hồ sơ ứng tuyển của bạn.",
            icon: "uil:user",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-7 flex flex-col gap-5 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        if (__VLS_ctx.accountForm.avatar) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (__VLS_ctx.accountForm.avatar),
                alt: (`Ảnh đại diện của ${__VLS_ctx.accountForm.name}`),
                ...{ class: "h-24 w-24 shrink-0 rounded-full border-4 border-white object-cover shadow-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-100 to-blue-200 text-2xl font-black text-blue-700 shadow-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
            /** @type {__VLS_StyleScopedClasses['from-sky-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['to-blue-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-blue-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
            (__VLS_ctx.userInitials);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-w-0" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "truncate text-lg font-black text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        (__VLS_ctx.accountForm.name || 'Sinh viên QuickWork');
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-blue-700']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-2 truncate text-sm font-semibold text-slate-600" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
        (__VLS_ctx.userEmail);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 text-xs font-medium text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-7 grid gap-5 md:grid-cols-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({
            ...{ class: "text-rose-500" },
        });
        /** @type {__VLS_StyleScopedClasses['text-rose-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
            ...{ class: "field-input" },
            maxlength: "100",
            autocomplete: "name",
            required: true,
        });
        (__VLS_ctx.accountForm.name);
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
            ...{ class: "field-input" },
            inputmode: "numeric",
            maxlength: "11",
            autocomplete: "tel",
            placeholder: "Ví dụ: 0912345678",
        });
        (__VLS_ctx.accountForm.phone);
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block md:col-span-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:col-span-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
            ...{ class: "field-input" },
            type: "url",
            placeholder: "https://...",
        });
        (__VLS_ctx.accountForm.avatar);
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block md:col-span-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:col-span-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
            ...{ class: "field-input" },
            type: "url",
            placeholder: "https://.../cv.pdf",
        });
        (__VLS_ctx.accountForm.cv_url);
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mt-2 block text-xs font-medium text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        let __VLS_20;
        /** @ts-ignore @type { | typeof __VLS_components.FormActions} */
        FormActions;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            ...{ 'onReset': {} },
            saving: (__VLS_ctx.isSaving),
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onReset': {} },
            saving: (__VLS_ctx.isSaving),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_25;
        const __VLS_26 = {
            /** @type {typeof __VLS_25.reset} */
            onReset: (__VLS_ctx.resetAccount),
        };
        var __VLS_23;
        var __VLS_24;
    }
    else if (__VLS_ctx.activeSetting === 'security') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (__VLS_ctx.changePassword) },
        });
        let __VLS_27;
        /** @ts-ignore @type { | typeof __VLS_components.SectionHeading} */
        SectionHeading;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
            title: "Bảo mật tài khoản",
            description: "Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.",
            icon: "uil:lock",
        }));
        const __VLS_29 = __VLS_28({
            title: "Bảo mật tài khoản",
            description: "Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.",
            icon: "uil:lock",
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-medium leading-6 text-blue-800" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-blue-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-blue-50/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_32;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            name: "uil:shield-check",
            ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        }));
        const __VLS_34 = __VLS_33({
            name: "uil:shield-check",
            ...{ class: "mt-0.5 h-5 w-5 shrink-0" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-7 max-w-2xl space-y-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
        let __VLS_37;
        /** @ts-ignore @type { | typeof __VLS_components.PasswordField} */
        PasswordField;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            modelValue: (__VLS_ctx.passwordForm.current_password),
            label: "Mật khẩu hiện tại",
            autocomplete: "current-password",
        }));
        const __VLS_39 = __VLS_38({
            modelValue: (__VLS_ctx.passwordForm.current_password),
            label: "Mật khẩu hiện tại",
            autocomplete: "current-password",
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        let __VLS_42;
        /** @ts-ignore @type { | typeof __VLS_components.PasswordField} */
        PasswordField;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            modelValue: (__VLS_ctx.passwordForm.new_password),
            label: "Mật khẩu mới",
            autocomplete: "new-password",
        }));
        const __VLS_44 = __VLS_43({
            modelValue: (__VLS_ctx.passwordForm.new_password),
            label: "Mật khẩu mới",
            autocomplete: "new-password",
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        let __VLS_47;
        /** @ts-ignore @type { | typeof __VLS_components.PasswordField} */
        PasswordField;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            modelValue: (__VLS_ctx.passwordForm.confirm_password),
            label: "Xác nhận mật khẩu mới",
            autocomplete: "new-password",
        }));
        const __VLS_49 = __VLS_48({
            modelValue: (__VLS_ctx.passwordForm.confirm_password),
            label: "Xác nhận mật khẩu mới",
            autocomplete: "new-password",
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-8 flex justify-end" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ class: "primary-button" },
            type: "submit",
            disabled: (__VLS_ctx.isSaving),
        });
        /** @type {__VLS_StyleScopedClasses['primary-button']} */ ;
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            name: (__VLS_ctx.isSaving ? 'uil:spinner-alt' : 'uil:lock'),
            ...{ class: (['h-4 w-4', __VLS_ctx.isSaving && 'animate-spin']) },
        }));
        const __VLS_54 = __VLS_53({
            name: (__VLS_ctx.isSaving ? 'uil:spinner-alt' : 'uil:lock'),
            ...{ class: (['h-4 w-4', __VLS_ctx.isSaving && 'animate-spin']) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        (__VLS_ctx.isSaving ? 'Đang cập nhật...' : 'Đổi mật khẩu');
    }
    else if (__VLS_ctx.activeSetting === 'jobs') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (__VLS_ctx.saveJobPreferences) },
        });
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.SectionHeading} */
        SectionHeading;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            title: "Tùy chọn tìm việc",
            description: "Cho QuickWork biết công việc bạn đang quan tâm.",
            icon: "uil:briefcase-alt",
        }));
        const __VLS_59 = __VLS_58({
            title: "Tùy chọn tìm việc",
            description: "Cho QuickWork biết công việc bạn đang quan tâm.",
            icon: "uil:briefcase-alt",
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-7 grid gap-5 md:grid-cols-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
            ...{ class: "field-input" },
            maxlength: "150",
            placeholder: "Ví dụ: Hà Nội",
        });
        (__VLS_ctx.jobForm.preferred_location);
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
            ...{ class: "field-input" },
            maxlength: "150",
            placeholder: "Ví dụ: Công nghệ thông tin",
        });
        (__VLS_ctx.jobForm.preferred_category);
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
            ...{ class: "field-input" },
            maxlength: "100",
            placeholder: "Ví dụ: 12 - 18 triệu",
        });
        (__VLS_ctx.jobForm.expected_salary);
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.jobForm.preferred_job_type),
            ...{ class: "field-input cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['field-input']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "FULL_TIME",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "PART_TIME",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "INTERNSHIP",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "REMOTE",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-800" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-amber-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-amber-800']} */ ;
        let __VLS_62;
        /** @ts-ignore @type { | typeof __VLS_components.FormActions} */
        FormActions;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
            ...{ 'onReset': {} },
            saving: (__VLS_ctx.isSaving),
        }));
        const __VLS_64 = __VLS_63({
            ...{ 'onReset': {} },
            saving: (__VLS_ctx.isSaving),
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        let __VLS_67;
        const __VLS_68 = {
            /** @type {typeof __VLS_67.reset} */
            onReset: (__VLS_ctx.resetJobPreferences),
        };
        var __VLS_65;
        var __VLS_66;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (__VLS_ctx.savePrivacy) },
        });
        let __VLS_69;
        /** @ts-ignore @type { | typeof __VLS_components.SectionHeading} */
        SectionHeading;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
            title: "Quyền riêng tư",
            description: "Kiểm soát cách nhà tuyển dụng nhìn thấy và liên hệ với bạn.",
            icon: "uil:shield-check",
        }));
        const __VLS_71 = __VLS_70({
            title: "Quyền riêng tư",
            description: "Kiểm soát cách nhà tuyển dụng nhìn thấy và liên hệ với bạn.",
            icon: "uil:shield-check",
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        let __VLS_74;
        /** @ts-ignore @type { | typeof __VLS_components.ToggleSetting} */
        ToggleSetting;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            modelValue: (__VLS_ctx.privacyForm.profile_visible),
            title: "Hiển thị hồ sơ",
            description: "Cho phép hồ sơ sinh viên của bạn xuất hiện trong các luồng tuyển dụng phù hợp.",
        }));
        const __VLS_76 = __VLS_75({
            modelValue: (__VLS_ctx.privacyForm.profile_visible),
            title: "Hiển thị hồ sơ",
            description: "Cho phép hồ sơ sinh viên của bạn xuất hiện trong các luồng tuyển dụng phù hợp.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.ToggleSetting} */
        ToggleSetting;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            modelValue: (__VLS_ctx.privacyForm.allow_enterprise_contact),
            title: "Cho phép nhà tuyển dụng liên hệ",
            description: "Nhà tuyển dụng có thể chủ động liên hệ khi hồ sơ của bạn phù hợp.",
        }));
        const __VLS_81 = __VLS_80({
            modelValue: (__VLS_ctx.privacyForm.allow_enterprise_contact),
            title: "Cho phép nhà tuyển dụng liên hệ",
            description: "Nhà tuyển dụng có thể chủ động liên hệ khi hồ sơ của bạn phù hợp.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.ToggleSetting} */
        ToggleSetting;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            modelValue: (__VLS_ctx.privacyForm.show_contact_info),
            title: "Hiển thị thông tin liên hệ",
            description: "Cho phép hiển thị số điện thoại trên hồ sơ được chia sẻ với nhà tuyển dụng.",
        }));
        const __VLS_86 = __VLS_85({
            modelValue: (__VLS_ctx.privacyForm.show_contact_info),
            title: "Hiển thị thông tin liên hệ",
            description: "Cho phép hiển thị số điện thoại trên hồ sơ được chia sẻ với nhà tuyển dụng.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-600" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
        let __VLS_89;
        /** @ts-ignore @type { | typeof __VLS_components.FormActions} */
        FormActions;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
            ...{ 'onReset': {} },
            saving: (__VLS_ctx.isSaving),
        }));
        const __VLS_91 = __VLS_90({
            ...{ 'onReset': {} },
            saving: (__VLS_ctx.isSaving),
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        let __VLS_94;
        const __VLS_95 = {
            /** @type {typeof __VLS_94.reset} */
            onReset: (__VLS_ctx.resetPrivacy),
        };
        var __VLS_92;
        var __VLS_93;
    }
}
// @ts-ignore
[activeSetting, activeSetting, activeSetting, isLoading, saveAccount, accountForm, accountForm, accountForm, accountForm, accountForm, accountForm, accountForm, accountForm, userInitials, userEmail, isSaving, isSaving, isSaving, isSaving, isSaving, isSaving, isSaving, resetAccount, changePassword, passwordForm, passwordForm, passwordForm, saveJobPreferences, jobForm, jobForm, jobForm, jobForm, resetJobPreferences, savePrivacy, privacyForm, privacyForm, privacyForm, resetPrivacy,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
