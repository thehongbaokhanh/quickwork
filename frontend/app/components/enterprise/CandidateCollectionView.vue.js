import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ScrollSelect from '~/components/ui/ScrollSelect.vue';
import { useToast } from '~/composables/useToast';
import { JobService } from '~/services/job.service';
import { buildSearchText, normalizeSearchText } from '~/utils/searchText';
const props = withDefaults(defineProps(), {
    accentIcon: 'uil:users-alt',
    emptyIcon: 'uil:user-search',
    accentPillClass: 'bg-sky-50 text-sky-700',
    emptyIconClass: 'bg-sky-50 text-sky-600'
});
const toast = useToast();
const config = useRuntimeConfig();
const applications = ref([]);
const selectedApplication = ref(null);
const selectedIds = ref([]);
const profileModalOpen = ref(false);
const hoverInfo = ref(null);
const hoverTooltipRef = ref(null);
let hoverHideTimer = null;
const searchQuery = ref('');
const activeJob = ref('ALL');
const activeMetaFilter = ref('ALL');
const activeDateSort = ref('NEWEST');
const loading = ref(true);
const errorMessage = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [
    { value: 10, label: '10 / trang' },
    { value: 20, label: '20 / trang' },
    { value: 50, label: '50 / trang' }
];
const dateSortOptions = computed(() => [
    { value: 'NEWEST', label: `${props.mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận'}: Mới nhất` },
    { value: 'OLDEST', label: `${props.mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận'}: Cũ nhất` }
]);
const pageIcon = computed(() => props.mode === 'rejected' ? 'uil:times-circle' : 'uil:bookmark');
const bulkActionLabel = computed(() => {
    if (props.mode === 'rejected')
        return 'Xóa khỏi danh sách';
    return selectedIds.value.length > 0 ? `Thêm ghi chú (${selectedIds.value.length})` : 'Thêm ghi chú hàng loạt';
});
const baseApplications = computed(() => {
    if (props.mode === 'rejected') {
        return applications.value.filter((application) => normalizeStatus(application.status) === 'REJECTED');
    }
    return applications.value.filter(isSavedCandidate);
});
const jobFilterOptions = computed(() => {
    const options = new Map([['ALL', 'Tất cả vị trí']]);
    baseApplications.value.forEach((application) => {
        const title = application?.job?.title;
        if (!title)
            return;
        options.set(getJobOptionValue(application), title);
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
});
const metaFilterOptions = computed(() => {
    const options = new Map([['ALL', props.mode === 'rejected' ? 'Tất cả lý do' : 'Tất cả nguồn']]);
    baseApplications.value.forEach((application) => {
        const value = props.mode === 'rejected' ? getRejectionReason(application) : getApplicationSource(application);
        options.set(value, value);
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
});
const filteredApplications = computed(() => {
    const query = normalizeSearchText(searchQuery.value);
    const filtered = baseApplications.value.filter((application) => {
        const metaValue = props.mode === 'rejected' ? getRejectionReason(application) : getApplicationSource(application);
        const matchesJob = activeJob.value === 'ALL' || getJobOptionValue(application) === activeJob.value;
        const matchesMeta = activeMetaFilter.value === 'ALL' || metaValue === activeMetaFilter.value;
        const searchable = buildSearchText([
            getStudentName(application),
            application.student?.email,
            getStudentPhone(application),
            application.job?.title,
            getExperience(application),
            getExperienceTrack(application),
            getApplicationSource(application),
            getRejectionReason(application),
            getCandidateNote(application),
            ...getSkills(application)
        ]);
        return matchesJob && matchesMeta && (!query || searchable.includes(query));
    });
    return filtered.sort((first, second) => {
        const firstTime = getDateTime(getPrimaryDate(first));
        const secondTime = getDateTime(getPrimaryDate(second));
        return activeDateSort.value === 'OLDEST' ? firstTime - secondTime : secondTime - firstTime;
    });
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / Number(pageSize.value))));
const pageStart = computed(() => {
    if (filteredApplications.value.length === 0)
        return 0;
    return (currentPage.value - 1) * Number(pageSize.value) + 1;
});
const pageEnd = computed(() => Math.min(currentPage.value * Number(pageSize.value), filteredApplications.value.length));
const paginatedApplications = computed(() => {
    const start = (currentPage.value - 1) * Number(pageSize.value);
    return filteredApplications.value.slice(start, start + Number(pageSize.value));
});
const allVisibleSelected = computed(() => {
    if (paginatedApplications.value.length === 0)
        return false;
    return paginatedApplications.value.every((application) => selectedIds.value.includes(getApplicationKey(application)));
});
const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;
    for (let page = 1; page <= total; page += 1) {
        if (page === 1 || page === total || Math.abs(page - current) <= 1) {
            pages.push(page);
        }
        else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    return pages;
});
const sourceItems = computed(() => buildDistribution(baseApplications.value, getApplicationSource, [
    { label: 'Website', dotClass: 'bg-sky-500' },
    { label: 'Được nhận', dotClass: 'bg-emerald-500' },
    { label: 'LinkedIn', dotClass: 'bg-rose-400' },
    { label: 'Giới thiệu', dotClass: 'bg-emerald-500' }
]));
const reasonItems = computed(() => buildDistribution(baseApplications.value, getRejectionReason, [
    { label: 'Thiếu kinh nghiệm', dotClass: 'bg-rose-500' },
    { label: 'Kỹ năng chưa phù hợp', dotClass: 'bg-sky-500' },
    { label: 'Mức lương không phù hợp', dotClass: 'bg-amber-500' },
    { label: 'Khác', dotClass: 'bg-slate-400' }
]));
const chartItems = computed(() => props.mode === 'rejected' ? reasonItems.value : sourceItems.value);
const chartTitle = computed(() => props.mode === 'rejected' ? 'Theo lý do từ chối' : 'Nguồn ứng viên');
const chartGradient = computed(() => {
    if (chartItems.value.length === 0)
        return 'conic-gradient(#e2e8f0 0deg 360deg)';
    const colors = {
        'bg-sky-500': '#0ea5e9',
        'bg-rose-400': '#fb7185',
        'bg-rose-500': '#f43f5e',
        'bg-emerald-500': '#10b981',
        'bg-amber-500': '#f59e0b',
        'bg-slate-400': '#94a3b8'
    };
    let start = 0;
    const segments = chartItems.value.map((item) => {
        const end = start + (item.percent / 100) * 360;
        const colorKey = item.dotClass || 'bg-sky-500';
        const segment = `${colors[colorKey] || '#0ea5e9'} ${start}deg ${end}deg`;
        start = end;
        return segment;
    });
    return `conic-gradient(${segments.join(', ')})`;
});
const metricCards = computed(() => {
    const scoped = baseApplications.value.length;
    const total = applications.value.length;
    const newThisWeek = baseApplications.value.filter((application) => isWithinDays(getPrimaryDate(application), 7)).length;
    const matchingSkills = getMatchingSkillPercent();
    const experiencedCount = baseApplications.value.filter((application) => getExperienceYears(application) >= 3).length;
    if (props.mode === 'rejected') {
        const lackExperience = getReasonCount('Thiếu kinh nghiệm');
        const skillMismatch = getReasonCount('Kỹ năng chưa phù hợp');
        const salaryMismatch = getReasonCount('Mức lương không phù hợp');
        const other = Math.max(scoped - lackExperience - skillMismatch - salaryMismatch, 0);
        return [
            { label: 'Tổng bị từ chối', value: scoped, meta: `+${newThisWeek} so với tuần trước`, icon: 'uil:file-times-alt', iconClass: 'bg-sky-50 text-sky-600', metaClass: 'text-emerald-600', valueClass: 'text-xl leading-7' },
            { label: 'Lý do phổ biến', value: 'Thiếu kinh nghiệm', meta: `${formatPercentNumber(lackExperience, scoped)}%`, icon: 'uil:user-exclamation', iconClass: 'bg-rose-50 text-rose-500', valueClass: 'text-base leading-7' },
            { label: 'Kỹ năng chưa phù hợp', value: `${formatPercentNumber(skillMismatch, scoped)}%`, meta: 'Tổng số ứng viên', icon: 'uil:users-alt', iconClass: 'bg-emerald-50 text-emerald-600', valueClass: 'text-xl leading-7' },
            { label: 'Mức lương không phù hợp', value: `${formatPercentNumber(salaryMismatch, scoped)}%`, meta: 'Tổng số ứng viên', icon: 'uil:trophy', iconClass: 'bg-amber-50 text-amber-600', valueClass: 'text-xl leading-7' },
            { label: 'Khác', value: `${formatPercentNumber(other, scoped)}%`, meta: 'Tổng số ứng viên', icon: 'uil:comment-question', iconClass: 'bg-slate-100 text-slate-600', valueClass: 'text-xl leading-7' }
        ];
    }
    return [
        { label: 'Tổng ứng viên đã lưu', value: scoped, meta: `+${newThisWeek} so với tuần trước`, icon: 'uil:comment-alt-bookmark', iconClass: 'bg-sky-50 text-sky-600', metaClass: 'text-emerald-600', valueClass: 'text-2xl leading-8' },
        { label: 'Theo dõi mới', value: newThisWeek, meta: 'Ứng viên phù hợp', icon: 'uil:bookmark', iconClass: 'bg-sky-50 text-sky-600', valueClass: 'text-2xl leading-8' },
        { label: 'Kỹ năng phù hợp', value: `${matchingSkills}%`, meta: 'Trung bình', icon: 'uil:heart-medical', iconClass: 'bg-emerald-50 text-emerald-600', valueClass: 'text-2xl leading-8' },
        { label: 'Vị trí nổi bật', value: experiencedCount, meta: 'Có kinh nghiệm > 3 năm', icon: 'uil:star', iconClass: 'bg-amber-50 text-amber-600', valueClass: 'text-2xl leading-8' }
    ];
});
function normalizeStatus(status) {
    const value = (status || 'APPLIED').toUpperCase();
    return ['ACCEPTED', 'REJECTED'].includes(value) ? value : 'APPLIED';
}
function getApplicationKey(application) {
    return application?.id ?? `${application?.job_id || application?.job?.id || 'job'}-${application?.student?.id || application?.student_id || getStudentName(application)}`;
}
function cleanHoverText(value) {
    return String(value ?? '').trim();
}
function buildHoverRows(rows) {
    return rows
        .map((row) => ({
        label: cleanHoverText(row.label),
        value: cleanHoverText(row.value)
    }))
        .filter((row) => row.label && row.value);
}
function normalizeHoverPayload(value) {
    if (typeof value === 'string') {
        const text = cleanHoverText(value);
        if (!text)
            return null;
        return {
            title: text,
            icon: 'uil:info-circle',
            tone: 'sky'
        };
    }
    if (!value || !cleanHoverText(value.title))
        return null;
    return {
        ...value,
        title: cleanHoverText(value.title),
        eyebrow: cleanHoverText(value.eyebrow),
        subtitle: cleanHoverText(value.subtitle),
        rows: value.rows?.filter((row) => cleanHoverText(row.label) && cleanHoverText(row.value)),
        badges: value.badges?.map(cleanHoverText).filter(Boolean)
    };
}
function getMetricHoverInfo(card) {
    return {
        eyebrow: card?.label,
        title: cleanHoverText(card?.value) || '0',
        subtitle: card?.meta,
        icon: card?.icon || 'uil:chart',
        tone: getToneFromClass(card?.iconClass),
        rows: buildHoverRows([
            { label: 'Chỉ số', value: card?.label },
            { label: 'Giá trị', value: card?.value },
            { label: 'Ghi chú', value: card?.meta }
        ])
    };
}
function getChartHoverInfo(item) {
    return {
        eyebrow: chartTitle.value,
        title: item?.label || 'Thống kê',
        subtitle: `${item?.percent ?? 0}% trong danh sách hiện tại`,
        icon: props.mode === 'rejected' ? 'uil:chart-pie-alt' : 'uil:analysis',
        tone: props.mode === 'rejected' ? 'rose' : 'sky',
        rows: buildHoverRows([
            { label: 'Tỷ lệ', value: `${item?.percent ?? 0}%` },
            { label: 'Số lượng', value: item?.value },
            { label: 'Nhóm', value: chartTitle.value }
        ])
    };
}
function getCandidateHoverInfo(application) {
    return {
        eyebrow: 'Ứng viên',
        title: getStudentName(application),
        subtitle: application?.student?.email || 'Chưa có email',
        icon: 'uil:user',
        tone: 'sky',
        rows: buildHoverRows([
            { label: 'Email', value: application?.student?.email || 'Chưa có email' },
            { label: 'Số điện thoại', value: getStudentPhone(application) },
            { label: 'Kinh nghiệm', value: getExperience(application) },
            { label: 'Nguồn', value: getApplicationSource(application) }
        ])
    };
}
function getJobHoverInfo(application) {
    return {
        eyebrow: 'Vị trí ứng tuyển',
        title: application?.job?.title || 'Tin tuyển dụng',
        subtitle: `Mã: #${getJobCode(application)}`,
        icon: 'uil:briefcase-alt',
        tone: 'sky',
        rows: buildHoverRows([
            { label: 'Mã tin', value: `#${getJobCode(application)}` },
            { label: 'Địa điểm', value: application?.job?.location },
            { label: 'Mức lương', value: application?.job?.salary },
            { label: 'Nhóm nghề', value: getExperienceTrack(application) }
        ])
    };
}
function getExperienceHoverInfo(application) {
    return {
        eyebrow: 'Kinh nghiệm',
        title: getExperience(application),
        subtitle: getExperienceTrack(application),
        icon: 'uil:chart-growth',
        tone: 'emerald',
        rows: buildHoverRows([
            { label: 'Kinh nghiệm', value: getExperience(application) },
            { label: 'Mảng', value: getExperienceTrack(application) },
            { label: 'Đánh giá', value: getRating(application) ? `${getRating(application)?.toFixed(1)}/5` : 'Chưa đánh giá' }
        ])
    };
}
function getSkillsHoverInfo(application) {
    const skills = getSkills(application);
    return {
        eyebrow: 'Kỹ năng nổi bật',
        title: skills.length > 0 ? `${skills.length} kỹ năng` : 'Chưa cập nhật kỹ năng',
        subtitle: skills.length > 0 ? 'Danh sách kỹ năng đầy đủ của ứng viên' : 'Ứng viên chưa bổ sung kỹ năng trong hồ sơ.',
        icon: 'uil:lightbulb-alt',
        tone: 'emerald',
        badges: skills.length > 0 ? skills : ['Chưa cập nhật'],
        rows: buildHoverRows([
            { label: 'Số kỹ năng', value: skills.length },
            { label: 'Hiển thị trong bảng', value: getVisibleSkills(application).join(', ') || 'Chưa cập nhật' }
        ])
    };
}
function getRejectionHoverInfo(application) {
    return {
        eyebrow: 'Lý do từ chối',
        title: getRejectionReason(application),
        subtitle: getCandidateNote(application),
        icon: 'uil:times-circle',
        tone: 'rose',
        rows: buildHoverRows([
            { label: 'Lý do', value: getRejectionReason(application) },
            { label: 'Ngày từ chối', value: formatDateTime(getPrimaryDate(application)) },
            { label: 'Ghi chú', value: getCandidateNote(application) }
        ])
    };
}
function getSourceHoverInfo(application) {
    return {
        eyebrow: 'Nguồn ứng viên',
        title: getApplicationSource(application),
        subtitle: getStudentName(application),
        icon: 'uil:link-alt',
        tone: 'sky',
        rows: buildHoverRows([
            { label: 'Nguồn', value: getApplicationSource(application) },
            { label: 'Ứng viên', value: getStudentName(application) },
            { label: 'Vị trí', value: application?.job?.title }
        ])
    };
}
function getNoteHoverInfo(application) {
    return {
        eyebrow: 'Ghi chú',
        title: props.mode === 'rejected' ? 'Ghi chú từ chối' : 'Ghi chú ứng viên đã lưu',
        subtitle: getCandidateNote(application),
        icon: 'uil:comment-alt-notes',
        tone: props.mode === 'rejected' ? 'rose' : 'sky',
        rows: buildHoverRows([
            { label: 'Ứng viên', value: getStudentName(application) },
            { label: 'Ghi chú', value: getCandidateNote(application) }
        ])
    };
}
function getToneFromClass(className) {
    const value = String(className || '');
    if (value.includes('rose'))
        return 'rose';
    if (value.includes('emerald'))
        return 'emerald';
    if (value.includes('amber'))
        return 'amber';
    if (value.includes('slate'))
        return 'slate';
    return 'sky';
}
function getHoverToneClass(tone, part) {
    const value = tone || 'sky';
    const classes = {
        sky: {
            icon: 'bg-sky-100 text-sky-700',
            eyebrow: 'text-sky-700',
            badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
        },
        rose: {
            icon: 'bg-rose-100 text-rose-700',
            eyebrow: 'text-rose-700',
            badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
        },
        emerald: {
            icon: 'bg-emerald-100 text-emerald-700',
            eyebrow: 'text-emerald-700',
            badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
        },
        amber: {
            icon: 'bg-amber-100 text-amber-700',
            eyebrow: 'text-amber-700',
            badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
        },
        slate: {
            icon: 'bg-slate-100 text-slate-700',
            eyebrow: 'text-slate-700',
            badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
        }
    };
    return classes[value][part];
}
function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function getTooltipPosition(rect, tooltipWidth, tooltipHeight) {
    const padding = 12;
    const gap = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeWidth = Math.min(tooltipWidth, viewportWidth - padding * 2);
    const safeHeight = Math.min(tooltipHeight, viewportHeight - padding * 2);
    const spaceBelow = viewportHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;
    const placement = spaceBelow >= safeHeight + gap || spaceBelow >= spaceAbove ? 'bottom' : 'top';
    const idealTop = placement === 'bottom' ? rect.bottom + gap : rect.top - safeHeight - gap;
    return {
        left: clampNumber(rect.left + rect.width / 2 - safeWidth / 2, padding, viewportWidth - safeWidth - padding),
        top: clampNumber(idealTop, padding, viewportHeight - safeHeight - padding),
        maxHeight: Math.max(180, viewportHeight - padding * 2),
        placement
    };
}
async function adjustHoverPosition(rect) {
    await nextTick();
    if (!hoverInfo.value || !hoverTooltipRef.value)
        return;
    const tooltipRect = hoverTooltipRef.value.getBoundingClientRect();
    const position = getTooltipPosition(rect, tooltipRect.width || Math.min(460, window.innerWidth - 24), tooltipRect.height || 180);
    hoverInfo.value = {
        ...hoverInfo.value,
        ...position
    };
}
function showHoverInfo(event, value) {
    cancelHoverHide();
    const payload = normalizeHoverPayload(value);
    if (!payload) {
        hoverInfo.value = null;
        return;
    }
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement))
        return;
    const rect = target.getBoundingClientRect();
    const position = getTooltipPosition(rect, Math.min(460, window.innerWidth - 24), 180);
    hoverInfo.value = {
        ...payload,
        ...position
    };
    adjustHoverPosition(rect);
}
function cancelHoverHide() {
    if (!hoverHideTimer)
        return;
    window.clearTimeout(hoverHideTimer);
    hoverHideTimer = null;
}
function hideHoverInfo() {
    cancelHoverHide();
    hoverHideTimer = window.setTimeout(() => {
        hoverInfo.value = null;
        hoverHideTimer = null;
    }, 120);
}
function closeHoverInfo() {
    cancelHoverHide();
    hoverInfo.value = null;
}
function handleHoverViewportChange(event) {
    const target = event.target;
    if (target instanceof Node && hoverTooltipRef.value?.contains(target))
        return;
    closeHoverInfo();
}
function isSavedCandidate(application) {
    const flags = [
        application?.is_saved,
        application?.saved,
        application?.bookmarked,
        application?.is_bookmarked,
        application?.is_favorite,
        application?.favorite,
        application?.candidate_saved,
        application?.student_saved,
        application?.employer_saved,
        application?.enterprise_saved,
        application?.saved_at,
        application?.savedAt
    ];
    return isHiredCandidate(application) ||
        flags.some(Boolean) ||
        (Array.isArray(application?.saves) && application.saves.length > 0) ||
        (Array.isArray(application?.saved_by_enterprises) && application.saved_by_enterprises.length > 0);
}
function normalizeInterviewResult(result) {
    return String(result || '').trim().toUpperCase();
}
function isHiredCandidate(application) {
    return normalizeInterviewResult(application?.interview_result) === 'HIRED';
}
function getStudentName(application) {
    return application?.student?.student_profile?.name || application?.student?.name || application?.student?.email?.split('@')[0] || 'Ứng viên';
}
function getStudentPhone(application) {
    return application?.student?.student_profile?.phone || application?.student?.phone || 'Chưa có SĐT';
}
function getInitials(application) {
    return getStudentName(application)
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
}
function getSkills(application) {
    const skills = application?.student?.student_profile?.skills || application?.skills || application?.job?.skills;
    if (!Array.isArray(skills))
        return [];
    return skills.map((skill) => skill?.name || skill?.title || skill).filter(Boolean);
}
function getVisibleSkills(application) {
    return getSkills(application).slice(0, 3);
}
function getHiddenSkillCount(application) {
    return Math.max(getSkills(application).length - 3, 0);
}
function getBackendAssetUrl(value) {
    if (!value)
        return '';
    if (/^https?:\/\//i.test(value))
        return value;
    const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '');
    return `${backendOrigin}${value.startsWith('/') ? '' : '/'}${value}`;
}
function getCvUrl(application) {
    return getBackendAssetUrl(application?.student?.student_profile?.cv_url);
}
function getAvatarUrl(application) {
    return getBackendAssetUrl(application?.student?.student_profile?.avatar_url || application?.student?.avatar_url);
}
function getJobCode(application) {
    return application?.job?.id || application?.job_id || application?.id || 'N/A';
}
function getJobOptionValue(application) {
    return String(application?.job?.id || application?.job?.title || 'unknown');
}
function getApplicationSource(application) {
    if (props.mode === 'saved' && isHiredCandidate(application))
        return 'Được nhận';
    return application?.source || application?.application_source || application?.referrer || 'Website';
}
function getSourceClass(application) {
    if (props.mode === 'saved' && isHiredCandidate(application))
        return 'bg-emerald-50 text-emerald-700';
    const source = getApplicationSource(application).toLowerCase();
    if (source.includes('linkedin'))
        return 'bg-blue-50 text-blue-700';
    if (source.includes('giới') || source.includes('gioi') || source.includes('ref'))
        return 'bg-emerald-50 text-emerald-700';
    return 'bg-sky-50 text-sky-700';
}
function getRating(application) {
    const value = Number(application?.rating || application?.score || application?.student?.student_profile?.rating);
    if (!Number.isFinite(value) || value <= 0)
        return null;
    return Math.min(5, value);
}
function getExperience(application) {
    return application?.experience ||
        application?.student?.student_profile?.experience ||
        application?.student?.student_profile?.years_of_experience ||
        application?.job?.experience ||
        'Chưa cập nhật';
}
function getExperienceTrack(application) {
    return application?.job?.category?.name || application?.job?.type || application?.job?.employment_type || application?.job?.title?.split(/\s+/).slice(0, 2).join(' ') || 'QuickWork';
}
function getExperienceYears(application) {
    const text = String(getExperience(application));
    const value = Number(text.match(/\d+/)?.[0] || 0);
    return Number.isFinite(value) ? value : 0;
}
function getRejectionReason(application) {
    const raw = application?.rejection_reason || application?.reject_reason || application?.reason || application?.employer_note || '';
    const text = String(raw).toLowerCase();
    if (text.includes('kinh nghiệm') || text.includes('kinh nghiem') || text.includes('experience'))
        return 'Thiếu kinh nghiệm';
    if (text.includes('kỹ năng') || text.includes('ky nang') || text.includes('skill') || text.includes('phù hợp') || text.includes('phu hop'))
        return 'Kỹ năng chưa phù hợp';
    if (text.includes('lương') || text.includes('luong') || text.includes('salary'))
        return 'Mức lương không phù hợp';
    if (raw)
        return String(raw);
    return 'Khác';
}
function getReasonClass(application) {
    const reason = getRejectionReason(application);
    if (reason === 'Thiếu kinh nghiệm')
        return 'bg-amber-50 text-amber-700';
    if (reason === 'Kỹ năng chưa phù hợp')
        return 'bg-rose-50 text-rose-700';
    if (reason === 'Mức lương không phù hợp')
        return 'bg-sky-50 text-sky-700';
    return 'bg-violet-50 text-violet-700';
}
function getCandidateNote(application) {
    if (props.mode === 'saved' && isHiredCandidate(application)) {
        return application?.interview_result_note ||
            application?.employer_note ||
            'Ứng viên đã được nhận sau phỏng vấn và được giữ trong danh sách đã lưu để theo dõi.';
    }
    return application?.saved_note ||
        application?.note ||
        application?.employer_note ||
        application?.cover_letter ||
        (props.mode === 'rejected' ? 'Chưa có ghi chú từ nhà tuyển dụng.' : 'Ứng viên đã được đánh dấu để xem xét sau.');
}
function getPrimaryDate(application) {
    if (props.mode === 'rejected') {
        return application?.rejected_at || application?.reviewed_at || application?.updated_at || application?.created_at;
    }
    if (isHiredCandidate(application)) {
        return application?.interview_result_at || application?.updated_at || application?.created_at;
    }
    return application?.saved_at || application?.savedAt || application?.updated_at || application?.created_at;
}
function detailItems(application) {
    return [
        { label: 'Email', value: application?.student?.email || 'Chưa cập nhật' },
        { label: 'Số điện thoại', value: getStudentPhone(application) },
        { label: props.mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận', value: formatDateTime(getPrimaryDate(application)) },
        { label: 'Nguồn ứng tuyển', value: getApplicationSource(application) },
        { label: 'Vị trí ứng tuyển', value: application?.job?.title || 'Chưa cập nhật' },
        { label: props.mode === 'rejected' ? 'Lý do từ chối' : 'Kinh nghiệm', value: props.mode === 'rejected' ? getRejectionReason(application) : getExperience(application) },
        ...(props.mode === 'saved' && isHiredCandidate(application)
            ? [
                { label: 'Kết quả phỏng vấn', value: 'Được nhận' },
                { label: 'Ngày chốt kết quả', value: formatDateTime(application?.interview_result_at) }
            ]
            : [])
    ];
}
function formatDate(value) {
    if (!value)
        return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return 'Chưa cập nhật';
    return date.toLocaleDateString('vi-VN');
}
function formatTime(value) {
    if (!value)
        return '--:--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return '--:--';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function formatDateTime(value) {
    if (!value)
        return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return 'Chưa cập nhật';
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}
function getDateTime(value) {
    if (!value)
        return 0;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
function isWithinDays(value, days) {
    const timestamp = getDateTime(value);
    if (!timestamp)
        return false;
    return timestamp >= Date.now() - days * 24 * 60 * 60 * 1000;
}
function formatPercentNumber(value, total) {
    if (!total)
        return 0;
    return Math.round((value / total) * 100);
}
function getReasonCount(reason) {
    return baseApplications.value.filter((application) => getRejectionReason(application) === reason).length;
}
function getMatchingSkillPercent() {
    if (baseApplications.value.length === 0)
        return 0;
    const scored = baseApplications.value.map((application) => {
        const rating = getRating(application);
        if (rating)
            return (rating / 5) * 100;
        return getSkills(application).length > 0 ? 60 : 0;
    });
    return Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length);
}
function buildDistribution(apps, getter, preferred) {
    if (apps.length === 0)
        return [];
    const counts = new Map();
    apps.forEach((application) => {
        const label = getter(application) || 'Khác';
        counts.set(label, (counts.get(label) || 0) + 1);
    });
    const dotByLabel = new Map(preferred.map((item) => [item.label, item.dotClass]));
    const fallbackDots = ['bg-sky-500', 'bg-rose-400', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-400'];
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([label, value], index) => ({
        label,
        value,
        percent: formatPercentNumber(value, apps.length),
        dotClass: dotByLabel.get(label) || fallbackDots[index % fallbackDots.length]
    }));
}
function openProfileModal(application) {
    selectedApplication.value = application;
    profileModalOpen.value = true;
}
function closeProfileModal() {
    profileModalOpen.value = false;
}
function goToPage(page) {
    currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}
function toggleSelection(application, event) {
    const checked = event.target.checked;
    const id = getApplicationKey(application);
    if (checked && !selectedIds.value.includes(id)) {
        selectedIds.value.push(id);
    }
    if (!checked) {
        selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id);
    }
}
function toggleSelectAll(event) {
    const checked = event.target.checked;
    const pageIds = paginatedApplications.value.map(getApplicationKey);
    if (checked) {
        selectedIds.value = Array.from(new Set([...selectedIds.value, ...pageIds]));
        return;
    }
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id));
}
function clearFilters() {
    searchQuery.value = '';
    activeJob.value = 'ALL';
    activeMetaFilter.value = 'ALL';
    activeDateSort.value = 'NEWEST';
    selectedIds.value = [];
}
function escapeCsv(value) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
}
function exportCandidates() {
    if (filteredApplications.value.length === 0) {
        toast.warning('Không có dữ liệu xuất', 'Danh sách hiện tại chưa có ứng viên phù hợp.');
        return;
    }
    const rows = [
        props.mode === 'rejected'
            ? ['Ứng viên', 'Email', 'SĐT', 'Vị trí', 'Kinh nghiệm', 'Ngày từ chối', 'Lý do', 'Nguồn', 'Ghi chú']
            : ['Ứng viên', 'Email', 'SĐT', 'Vị trí', 'Kinh nghiệm', 'Kỹ năng', 'Ngày lưu/nhận', 'Nguồn', 'Ghi chú'],
        ...filteredApplications.value.map((application) => props.mode === 'rejected'
            ? [
                getStudentName(application),
                application?.student?.email || '',
                getStudentPhone(application),
                application?.job?.title || '',
                getExperience(application),
                formatDateTime(getPrimaryDate(application)),
                getRejectionReason(application),
                getApplicationSource(application),
                getCandidateNote(application)
            ]
            : [
                getStudentName(application),
                application?.student?.email || '',
                getStudentPhone(application),
                application?.job?.title || '',
                getExperience(application),
                getSkills(application).join(', '),
                formatDateTime(getPrimaryDate(application)),
                getApplicationSource(application),
                getCandidateNote(application)
            ])
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = props.mode === 'rejected' ? 'quickwork-ung-vien-bi-tu-choi.csv' : 'quickwork-ung-vien-da-luu.csv';
    link.click();
    URL.revokeObjectURL(url);
}
function handleBulkAction() {
    if (props.mode === 'rejected') {
        toast.info('Chưa có thao tác xóa dữ liệu', 'Trang đang hiển thị dữ liệu thật từ hệ thống nên chưa xóa trực tiếp trên frontend.');
        return;
    }
    toast.info('Chưa hỗ trợ ghi chú hàng loạt', 'Chức năng ghi chú sẽ cần API lưu ghi chú ứng viên.');
}
function handleEditNote(application) {
    toast.info('Chưa hỗ trợ sửa ghi chú', `${getStudentName(application)} đang dùng dữ liệu ghi chú được đồng bộ từ hệ thống.`);
}
function handleRemoveSaved(application) {
    toast.info('Chưa hỗ trợ bỏ lưu', `${getStudentName(application)} vẫn được giữ theo trạng thái lưu từ dữ liệu hệ thống.`);
}
function handleRestore(application) {
    toast.info('Chưa hỗ trợ hoàn tác', `${getStudentName(application)} cần API cập nhật trạng thái để hoàn tác từ chối.`);
}
async function fetchApplications() {
    try {
        loading.value = true;
        errorMessage.value = '';
        const response = await JobService.getEnterpriseApplications();
        applications.value = response?.success && Array.isArray(response.data) ? response.data : [];
        selectedIds.value = [];
    }
    catch (error) {
        applications.value = [];
        selectedApplication.value = null;
        errorMessage.value = error?.data?.message || error?.message || 'Không thể tải dữ liệu ứng viên.';
    }
    finally {
        loading.value = false;
    }
}
watch([searchQuery, activeJob, activeMetaFilter, activeDateSort, pageSize], () => {
    currentPage.value = 1;
});
watch(filteredApplications, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
    }
    const visibleIds = new Set(filteredApplications.value.map(getApplicationKey));
    selectedIds.value = selectedIds.value.filter((id) => visibleIds.has(id));
});
onMounted(() => {
    fetchApplications();
    if (process.client) {
        window.addEventListener('scroll', handleHoverViewportChange, true);
        window.addEventListener('resize', handleHoverViewportChange);
    }
});
onBeforeUnmount(() => {
    closeHoverInfo();
    if (process.client) {
        window.removeEventListener('scroll', handleHoverViewportChange, true);
        window.removeEventListener('resize', handleHoverViewportChange);
    }
});
const __VLS_defaults = {
    accentIcon: 'uil:users-alt',
    emptyIcon: 'uil:user-search',
    accentPillClass: 'bg-sky-50 text-sky-700',
    emptyIconClass: 'bg-sky-50 text-sky-600'
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
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-tooltip-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-tooltip-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-tooltip-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-tooltip-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-tooltip-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-modal-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-modal-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-modal-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-modal-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['quickwork-candidate-modal-scroll']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-5 pb-8" },
});
/** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: (__VLS_ctx.pageIcon),
    ...{ class: (['h-5 w-5', __VLS_ctx.mode === 'rejected' ? 'text-rose-500' : 'text-sky-700']) },
}));
const __VLS_2 = __VLS_1({
    name: (__VLS_ctx.pageIcon),
    ...{ class: (['h-5 w-5', __VLS_ctx.mode === 'rejected' ? 'text-rose-500' : 'text-sky-700']) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-2xl font-black text-slate-950" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
(__VLS_ctx.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1.5 max-w-2xl text-sm font-semibold text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(__VLS_ctx.description);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col gap-3 sm:flex-row sm:items-center" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.exportCandidates) },
    type: "button",
    ...{ class: "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50" },
    disabled: (__VLS_ctx.loading || __VLS_ctx.filteredApplications.length === 0),
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    name: "uil:import",
    ...{ class: "h-5 w-5" },
}));
const __VLS_7 = __VLS_6({
    name: "uil:import",
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
if (__VLS_ctx.mode === 'saved') {
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        name: "uil:angle-down",
        ...{ class: "h-4 w-4 text-slate-400" },
    }));
    const __VLS_12 = __VLS_11({
        name: "uil:angle-down",
        ...{ class: "h-4 w-4 text-slate-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleBulkAction) },
    type: "button",
    ...{ class: ([
            'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black shadow-sm transition focus:outline-none focus-visible:ring-4',
            __VLS_ctx.mode === 'rejected'
                ? 'border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 focus-visible:ring-rose-100'
                : 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-100'
        ]) },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    name: (__VLS_ctx.mode === 'rejected' ? 'uil:trash-alt' : 'uil:plus'),
    ...{ class: "h-5 w-5" },
}));
const __VLS_17 = __VLS_16({
    name: (__VLS_ctx.mode === 'rejected' ? 'uil:trash-alt' : 'uil:plus'),
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
(__VLS_ctx.bulkActionLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: (['grid gap-4', __VLS_ctx.mode === 'saved' ? 'xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(260px,1.2fr)] md:grid-cols-2' : 'xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(280px,1.25fr)] md:grid-cols-2']) },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
for (const [card] of __VLS_vFor((__VLS_ctx.metricCards))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        ...{ onMouseenter: (...[$event]) => {
                __VLS_ctx.showHoverInfo($event, __VLS_ctx.getMetricHoverInfo(card));
                // @ts-ignore
                [pageIcon, mode, mode, mode, mode, mode, title, description, exportCandidates, loading, filteredApplications, handleBulkAction, bulkActionLabel, metricCards, showHoverInfo, getMetricHoverInfo,];
            } },
        ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
        ...{ onFocus: (...[$event]) => {
                __VLS_ctx.showHoverInfo($event, __VLS_ctx.getMetricHoverInfo(card));
                // @ts-ignore
                [showHoverInfo, getMetricHoverInfo, hideHoverInfo,];
            } },
        ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
        key: (card.label),
        ...{ class: "min-h-[116px] cursor-help rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        tabindex: "0",
    });
    /** @type {__VLS_StyleScopedClasses['min-h-[116px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-100/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:-translate-y-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:shadow-sky-100/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex h-full items-center gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', card.iconClass]) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        name: (card.icon),
        ...{ class: "h-6 w-6" },
    }));
    const __VLS_22 = __VLS_21({
        name: (card.icon),
        ...{ class: "h-6 w-6" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-w-0 flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "truncate text-xs font-bold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (card.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: (['mt-1 min-h-7 truncate font-black text-slate-950', card.valueClass || 'text-2xl leading-8']) },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    (card.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: (['mt-1 truncate text-xs font-black', card.metaClass || 'text-slate-500']) },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    (card.meta);
    // @ts-ignore
    [hideHoverInfo,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    ...{ class: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80 md:col-span-2 xl:col-span-1" },
});
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-100/80']} */ ;
/** @type {__VLS_StyleScopedClasses['md:col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:col-span-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-w-0 flex-1" },
});
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-sm font-black text-slate-700" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
(__VLS_ctx.chartTitle);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-3 space-y-2" },
});
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.chartItems))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMouseenter: (...[$event]) => {
                __VLS_ctx.showHoverInfo($event, __VLS_ctx.getChartHoverInfo(item));
                // @ts-ignore
                [showHoverInfo, chartTitle, chartItems, getChartHoverInfo,];
            } },
        ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
        ...{ onFocus: (...[$event]) => {
                __VLS_ctx.showHoverInfo($event, __VLS_ctx.getChartHoverInfo(item));
                // @ts-ignore
                [showHoverInfo, hideHoverInfo, getChartHoverInfo,];
            } },
        ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
        key: (item.label),
        ...{ class: "-mx-2 flex cursor-help items-center gap-2 rounded-xl px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        tabindex: "0",
    });
    /** @type {__VLS_StyleScopedClasses['-mx-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: (['h-2.5 w-2.5 rounded-full', item.dotClass]) },
    });
    /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "min-w-0 flex-1 truncate" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    (item.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-black text-slate-700" },
    });
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    (item.percent);
    // @ts-ignore
    [hideHoverInfo,];
}
if (__VLS_ctx.chartItems.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs font-bold text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "h-20 w-20 shrink-0 rounded-full p-3" },
    ...{ style: ({ background: __VLS_ctx.chartGradient }) },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "h-full w-full rounded-full bg-white shadow-inner" },
});
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "rounded-[22px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80" },
});
/** @type {__VLS_StyleScopedClasses['rounded-[22px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-slate-100/80']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-b border-slate-100 p-4" },
});
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative z-20 grid gap-3 xl:grid-cols-[minmax(280px,1fr)_minmax(190px,230px)_minmax(190px,230px)_210px_auto_auto]" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:grid-cols-[minmax(280px,1fr)_minmax(190px,230px)_minmax(190px,230px)_210px_auto_auto]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:border-sky-300']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-within:ring-sky-100']} */ ;
let __VLS_25;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    name: "uil:search",
    ...{ class: "h-5 w-5 text-slate-400" },
}));
const __VLS_27 = __VLS_26({
    name: "uil:search",
    ...{ class: "h-5 w-5 text-slate-400" },
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "Tìm kiếm ứng viên (tên, email, SĐT, vị trí...)",
    ...{ class: "w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder:text-slate-400']} */ ;
const __VLS_30 = ScrollSelect;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.activeJob),
    options: (__VLS_ctx.jobFilterOptions),
    icon: "",
    size: "sm",
    ariaLabel: "Lọc theo vị trí",
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.activeJob),
    options: (__VLS_ctx.jobFilterOptions),
    icon: "",
    size: "sm",
    ariaLabel: "Lọc theo vị trí",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const __VLS_35 = ScrollSelect;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.activeMetaFilter),
    options: (__VLS_ctx.metaFilterOptions),
    icon: "",
    size: "sm",
    ariaLabel: (__VLS_ctx.mode === 'rejected' ? 'Lọc theo lý do' : 'Lọc theo nguồn'),
}));
const __VLS_37 = __VLS_36({
    modelValue: (__VLS_ctx.activeMetaFilter),
    options: (__VLS_ctx.metaFilterOptions),
    icon: "",
    size: "sm",
    ariaLabel: (__VLS_ctx.mode === 'rejected' ? 'Lọc theo lý do' : 'Lọc theo nguồn'),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
const __VLS_40 = ScrollSelect;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.activeDateSort),
    options: (__VLS_ctx.dateSortOptions),
    icon: "",
    size: "sm",
    ariaLabel: "Sắp xếp theo ngày",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.activeDateSort),
    options: (__VLS_ctx.dateSortOptions),
    icon: "",
    size: "sm",
    ariaLabel: "Sắp xếp theo ngày",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.clearFilters) },
    type: "button",
    ...{ class: "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-11']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-sky-100']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
let __VLS_45;
/** @ts-ignore @type { | typeof __VLS_components.Icon} */
Icon;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    name: "uil:filter-slash",
    ...{ class: "h-5 w-5" },
}));
const __VLS_47 = __VLS_46({
    name: "uil:filter-slash",
    ...{ class: "h-5 w-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
if (__VLS_ctx.mode === 'saved') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hidden items-center justify-end gap-2 xl:flex" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "button",
        ...{ class: "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700" },
        'aria-label': "Hiển thị dạng bảng",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    let __VLS_50;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        name: "uil:table",
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_52 = __VLS_51({
        name: "uil:table",
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "button",
        ...{ class: "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700" },
        'aria-label': "Hiển thị dạng lịch",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    let __VLS_55;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        name: "uil:calender",
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_57 = __VLS_56({
        name: "uil:calender",
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3 p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    for (const [item] of __VLS_vFor((6))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            key: (item),
            ...{ class: "h-16 animate-pulse rounded-2xl bg-slate-100" },
        });
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
        // @ts-ignore
        [mode, mode, loading, chartItems, chartGradient, searchQuery, activeJob, jobFilterOptions, activeMetaFilter, metaFilterOptions, activeDateSort, dateSortOptions, clearFilters,];
    }
}
else if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "m-5 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700" },
    });
    /** @type {__VLS_StyleScopedClasses['m-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-700']} */ ;
    (__VLS_ctx.errorMessage);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "overflow-x-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: ([__VLS_ctx.mode === 'rejected' ? 'min-w-[1720px]' : 'min-w-[1520px]', 'divide-y divide-slate-100 table-fixed']) },
    });
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['table-fixed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({
        ...{ class: "bg-slate-50/90" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-50/90']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-12 px-4 py-3.5 text-left" },
    });
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.toggleSelectAll) },
        type: "checkbox",
        ...{ class: "h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200" },
        checked: (__VLS_ctx.allVisibleSelected),
        'aria-label': "Chọn tất cả ứng viên trên trang",
    });
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:ring-sky-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[260px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[260px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[250px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[250px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[165px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[165px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    if (__VLS_ctx.mode === 'saved') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "w-[260px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['w-[260px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[155px] whitespace-nowrap px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[155px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-center gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    (__VLS_ctx.mode === 'rejected' ? 'Ngày từ chối' : 'Ngày lưu/nhận');
    let __VLS_60;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        name: "uil:arrow-down",
        ...{ class: "h-4 w-4 text-slate-400" },
    }));
    const __VLS_62 = __VLS_61({
        name: "uil:arrow-down",
        ...{ class: "h-4 w-4 text-slate-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    if (__VLS_ctx.mode === 'rejected') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "w-[230px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['w-[230px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[130px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[130px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[145px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[145px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[300px] px-4 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[300px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "w-[190px] whitespace-nowrap px-4 py-3.5 text-right text-xs font-black uppercase tracking-wide text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['w-[190px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({
        ...{ class: "divide-y divide-slate-100 bg-white" },
    });
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    if (__VLS_ctx.paginatedApplications.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            colspan: "10",
            ...{ class: "px-4 py-12 text-center" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (['mx-auto flex h-16 w-16 items-center justify-center rounded-3xl', __VLS_ctx.emptyIconClass]) },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
        let __VLS_65;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
            name: (__VLS_ctx.emptyIcon),
            ...{ class: "h-8 w-8" },
        }));
        const __VLS_67 = __VLS_66({
            name: (__VLS_ctx.emptyIcon),
            ...{ class: "h-8 w-8" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "mt-4 text-xl font-black text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        (__VLS_ctx.emptyTitle);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.emptyDescription);
    }
    for (const [application] of __VLS_vFor((__VLS_ctx.paginatedApplications))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (__VLS_ctx.getApplicationKey(application)),
            ...{ class: "transition hover:bg-sky-50/40" },
        });
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50/40']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.toggleSelection(application, $event);
                    // @ts-ignore
                    [mode, mode, mode, mode, errorMessage, errorMessage, toggleSelectAll, allVisibleSelected, paginatedApplications, paginatedApplications, emptyIconClass, emptyIcon, emptyTitle, emptyDescription, getApplicationKey, toggleSelection,];
                } },
            type: "checkbox",
            ...{ class: "h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200" },
            checked: (__VLS_ctx.selectedIds.includes(__VLS_ctx.getApplicationKey(application))),
            'aria-label': (`Chọn ứng viên ${__VLS_ctx.getStudentName(application)}`),
        });
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sky-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:ring-sky-200']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getCandidateHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, getApplicationKey, selectedIds, getStudentName, getCandidateHoverInfo,];
                } },
            ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
            ...{ onFocus: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getCandidateHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getCandidateHoverInfo,];
                } },
            ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
            ...{ class: "-mx-2 flex min-w-[220px] cursor-help items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            tabindex: "0",
        });
        /** @type {__VLS_StyleScopedClasses['-mx-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-[220px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        if (__VLS_ctx.getAvatarUrl(application)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (__VLS_ctx.getAvatarUrl(application)),
                alt: (__VLS_ctx.getStudentName(application)),
                ...{ class: "h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200" },
            });
            /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['ring-slate-200']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-sky-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['ring-sky-200']} */ ;
            (__VLS_ctx.getInitials(application));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-w-0" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "truncate text-sm font-black text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        (__VLS_ctx.getStudentName(application));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "truncate text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (application.student?.email || 'Chưa có email');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "truncate text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.getStudentPhone(application));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getJobHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getStudentName, getStudentName, getAvatarUrl, getAvatarUrl, getInitials, getStudentPhone, getJobHoverInfo,];
                } },
            ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
            ...{ onFocus: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getJobHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getJobHoverInfo,];
                } },
            ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
            ...{ class: "-mx-2 min-w-0 cursor-help rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            tabindex: "0",
        });
        /** @type {__VLS_StyleScopedClasses['-mx-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "line-clamp-2 text-sm font-black leading-5 text-slate-950" },
        });
        /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        (application.job?.title || 'Tin tuyển dụng');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.getJobCode(application));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getExperienceHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getJobCode, getExperienceHoverInfo,];
                } },
            ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
            ...{ onFocus: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getExperienceHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getExperienceHoverInfo,];
                } },
            ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
            ...{ class: "-mx-2 cursor-help rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            tabindex: "0",
        });
        /** @type {__VLS_StyleScopedClasses['-mx-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "line-clamp-1 text-sm font-bold text-slate-700" },
        });
        /** @type {__VLS_StyleScopedClasses['line-clamp-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
        (__VLS_ctx.getExperience(application));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 line-clamp-1 text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['line-clamp-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.getExperienceTrack(application));
        if (__VLS_ctx.mode === 'saved') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-4 py-4 align-middle" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onMouseenter: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.errorMessage))
                            return;
                        if (!(__VLS_ctx.mode === 'saved'))
                            return;
                        __VLS_ctx.showHoverInfo($event, __VLS_ctx.getSkillsHoverInfo(application));
                        // @ts-ignore
                        [mode, showHoverInfo, hideHoverInfo, getExperience, getExperienceTrack, getSkillsHoverInfo,];
                    } },
                ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
                ...{ onFocus: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.errorMessage))
                            return;
                        if (!(__VLS_ctx.mode === 'saved'))
                            return;
                        __VLS_ctx.showHoverInfo($event, __VLS_ctx.getSkillsHoverInfo(application));
                        // @ts-ignore
                        [showHoverInfo, hideHoverInfo, getSkillsHoverInfo,];
                    } },
                ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
                ...{ class: "-mx-2 flex max-w-[250px] cursor-help flex-wrap gap-2 rounded-2xl px-2 py-2 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
                tabindex: "0",
            });
            /** @type {__VLS_StyleScopedClasses['-mx-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-[250px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            for (const [skill] of __VLS_vFor((__VLS_ctx.getVisibleSkills(application)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (skill),
                    ...{ class: "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600" },
                });
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
                (skill);
                // @ts-ignore
                [hideHoverInfo, getVisibleSkills,];
            }
            if (__VLS_ctx.getHiddenSkillCount(application) > 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600" },
                });
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-slate-100']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
                (__VLS_ctx.getHiddenSkillCount(application));
            }
            if (__VLS_ctx.getVisibleSkills(application).length === 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm font-semibold text-slate-400" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "whitespace-nowrap px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm font-bold text-slate-700" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
        (__VLS_ctx.formatDate(__VLS_ctx.getPrimaryDate(application)));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.formatTime(__VLS_ctx.getPrimaryDate(application)));
        if (__VLS_ctx.mode === 'rejected') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-4 py-4 align-middle" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ onMouseenter: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.errorMessage))
                            return;
                        if (!(__VLS_ctx.mode === 'rejected'))
                            return;
                        __VLS_ctx.showHoverInfo($event, __VLS_ctx.getRejectionHoverInfo(application));
                        // @ts-ignore
                        [mode, showHoverInfo, getVisibleSkills, getHiddenSkillCount, getHiddenSkillCount, formatDate, getPrimaryDate, getPrimaryDate, formatTime, getRejectionHoverInfo,];
                    } },
                ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
                ...{ onFocus: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.errorMessage))
                            return;
                        if (!(__VLS_ctx.mode === 'rejected'))
                            return;
                        __VLS_ctx.showHoverInfo($event, __VLS_ctx.getRejectionHoverInfo(application));
                        // @ts-ignore
                        [showHoverInfo, hideHoverInfo, getRejectionHoverInfo,];
                    } },
                ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
                ...{ class: (['inline-flex max-w-[210px] cursor-help whitespace-nowrap rounded-full px-3 py-1 text-xs font-black leading-5 transition hover:shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100', __VLS_ctx.getReasonClass(application)]) },
                tabindex: "0",
            });
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-[210px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:shadow-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-rose-100']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (__VLS_ctx.getRejectionReason(application));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-w-[100px]" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-[100px]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-0.5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
        for (const [star] of __VLS_vFor((5))) {
            let __VLS_70;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                key: (star),
                name: "uil:star",
                ...{ class: (['h-4 w-4', star <= Math.round(__VLS_ctx.getRating(application) || 0) ? 'text-amber-400' : 'text-slate-300']) },
            }));
            const __VLS_72 = __VLS_71({
                key: (star),
                name: "uil:star",
                ...{ class: (['h-4 w-4', star <= Math.round(__VLS_ctx.getRating(application) || 0) ? 'text-amber-400' : 'text-slate-300']) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            // @ts-ignore
            [hideHoverInfo, getReasonClass, getRejectionReason, getRating,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 text-xs font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.getRating(application)?.toFixed(1) || '-');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getSourceHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, getRating, getSourceHoverInfo,];
                } },
            ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
            ...{ onFocus: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getSourceHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getSourceHoverInfo,];
                } },
            ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
            ...{ class: (['inline-flex max-w-[125px] cursor-help rounded-full px-3 py-1 text-xs font-black leading-5 transition hover:shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100', __VLS_ctx.getSourceClass(application)]) },
            tabindex: "0",
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[125px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (__VLS_ctx.getApplicationSource(application));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getNoteHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getSourceClass, getApplicationSource, getNoteHoverInfo,];
                } },
            ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
            ...{ onFocus: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.showHoverInfo($event, __VLS_ctx.getNoteHoverInfo(application));
                    // @ts-ignore
                    [showHoverInfo, hideHoverInfo, getNoteHoverInfo,];
                } },
            ...{ onBlur: (__VLS_ctx.hideHoverInfo) },
            ...{ class: "-mx-2 line-clamp-2 max-w-[280px] cursor-help rounded-2xl px-2 py-2 text-sm font-semibold leading-5 text-slate-500 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            tabindex: "0",
        });
        /** @type {__VLS_StyleScopedClasses['-mx-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[280px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        (__VLS_ctx.getCandidateNote(application));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "px-4 py-4 text-right align-middle" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: (['inline-flex items-center justify-end gap-2 whitespace-nowrap', __VLS_ctx.mode === 'rejected' ? 'min-w-[165px]' : 'min-w-[125px]']) },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.errorMessage))
                        return;
                    __VLS_ctx.mode === 'rejected' ? __VLS_ctx.handleRestore(application) : __VLS_ctx.openProfileModal(application);
                    // @ts-ignore
                    [mode, mode, hideHoverInfo, getCandidateNote, handleRestore, openProfileModal,];
                } },
            type: "button",
            ...{ class: "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            'aria-label': (__VLS_ctx.mode === 'rejected' ? 'Hoàn tác từ chối' : 'Xem hồ sơ'),
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        let __VLS_75;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
            name: (__VLS_ctx.mode === 'rejected' ? 'uil:history' : 'uil:eye'),
            ...{ class: "h-4.5 w-4.5" },
        }));
        const __VLS_77 = __VLS_76({
            name: (__VLS_ctx.mode === 'rejected' ? 'uil:history' : 'uil:eye'),
            ...{ class: "h-4.5 w-4.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
        if (__VLS_ctx.mode === 'saved') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.errorMessage))
                            return;
                        if (!(__VLS_ctx.mode === 'saved'))
                            return;
                        __VLS_ctx.handleEditNote(application);
                        // @ts-ignore
                        [mode, mode, mode, handleEditNote,];
                    } },
                type: "button",
                ...{ class: "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
                'aria-label': "Sửa ghi chú",
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
            let __VLS_80;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
                name: "uil:pen",
                ...{ class: "h-4.5 w-4.5" },
            }));
            const __VLS_82 = __VLS_81({
                name: "uil:pen",
                ...{ class: "h-4.5 w-4.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
        }
        if (__VLS_ctx.mode === 'saved') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.errorMessage))
                            return;
                        if (!(__VLS_ctx.mode === 'saved'))
                            return;
                        __VLS_ctx.handleRemoveSaved(application);
                        // @ts-ignore
                        [mode, handleRemoveSaved,];
                    } },
                type: "button",
                ...{ class: "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100" },
                'aria-label': "Xóa khỏi danh sách đã lưu",
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-rose-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-rose-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-rose-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-rose-100']} */ ;
            let __VLS_85;
            /** @ts-ignore @type { | typeof __VLS_components.Icon} */
            Icon;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
                name: "uil:trash-alt",
                ...{ class: "h-4.5 w-4.5" },
            }));
            const __VLS_87 = __VLS_86({
                name: "uil:trash-alt",
                ...{ class: "h-4.5 w-4.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            /** @type {__VLS_StyleScopedClasses['h-4.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4.5']} */ ;
        }
        if (__VLS_ctx.mode === 'rejected') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.errorMessage))
                            return;
                        if (!(__VLS_ctx.mode === 'rejected'))
                            return;
                        __VLS_ctx.openProfileModal(application);
                        // @ts-ignore
                        [mode, openProfileModal,];
                    } },
                type: "button",
                ...{ class: "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl bg-sky-50 px-3 text-xs font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
            });
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-sky-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        }
        // @ts-ignore
        [];
    }
}
if (!__VLS_ctx.loading && !__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-4 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-2 sm:flex-row sm:items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-semibold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.pageStart);
    (__VLS_ctx.pageEnd);
    (__VLS_ctx.filteredApplications.length);
    const __VLS_90 = ScrollSelect;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        modelValue: (__VLS_ctx.pageSize),
        ...{ class: "w-36" },
        options: (__VLS_ctx.pageSizeOptions),
        size: "sm",
        ariaLabel: "Số lượng ứng viên trong 1 trang",
    }));
    const __VLS_92 = __VLS_91({
        modelValue: (__VLS_ctx.pageSize),
        ...{ class: "w-36" },
        options: (__VLS_ctx.pageSizeOptions),
        size: "sm",
        ariaLabel: "Số lượng ứng viên trong 1 trang",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    /** @type {__VLS_StyleScopedClasses['w-36']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.loading && !__VLS_ctx.errorMessage))
                    return;
                __VLS_ctx.goToPage(__VLS_ctx.currentPage - 1);
                // @ts-ignore
                [loading, filteredApplications, errorMessage, pageStart, pageEnd, pageSize, pageSizeOptions, goToPage, currentPage,];
            } },
        type: "button",
        ...{ class: "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40" },
        disabled: (__VLS_ctx.currentPage === 1),
        'aria-label': "Trang trước",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
    let __VLS_95;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        name: "uil:angle-left",
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_97 = __VLS_96({
        name: "uil:angle-left",
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    for (const [page, pageIndex] of __VLS_vFor((__VLS_ctx.visiblePages))) {
        __VLS_asFunctionalElement(__VLS_intrinsics.template)({
            key: (`${page}-${pageIndex}`),
        });
        if (page === '...') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 text-sm font-black text-slate-400" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.loading && !__VLS_ctx.errorMessage))
                            return;
                        if (!!(page === '...'))
                            return;
                        __VLS_ctx.goToPage(Number(page));
                        // @ts-ignore
                        [goToPage, currentPage, visiblePages,];
                    } },
                type: "button",
                ...{ class: ([
                        'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition',
                        __VLS_ctx.currentPage === page
                            ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                            : 'border border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
                    ]) },
                'aria-label': (`Đi tới trang ${page}`),
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition']} */ ;
            (page);
        }
        // @ts-ignore
        [currentPage,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.loading && !__VLS_ctx.errorMessage))
                    return;
                __VLS_ctx.goToPage(__VLS_ctx.currentPage + 1);
                // @ts-ignore
                [goToPage, currentPage,];
            } },
        type: "button",
        ...{ class: "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40" },
        disabled: (__VLS_ctx.currentPage === __VLS_ctx.totalPages),
        'aria-label': "Trang sau",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
    let __VLS_100;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
        name: "uil:angle-right",
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_102 = __VLS_101({
        name: "uil:angle-right",
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
}
let __VLS_105;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    to: "body",
}));
const __VLS_107 = __VLS_106({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
const { default: __VLS_110 } = __VLS_108.slots;
let __VLS_111;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "-translate-y-1 opacity-0",
    enterToClass: "translate-y-0 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "translate-y-0 opacity-100",
    leaveToClass: "-translate-y-1 opacity-0",
}));
const __VLS_113 = __VLS_112({
    enterActiveClass: "transition duration-150 ease-out",
    enterFromClass: "-translate-y-1 opacity-0",
    enterToClass: "translate-y-0 opacity-100",
    leaveActiveClass: "transition duration-100 ease-in",
    leaveFromClass: "translate-y-0 opacity-100",
    leaveToClass: "-translate-y-1 opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
const { default: __VLS_116 } = __VLS_114.slots;
if (__VLS_ctx.hoverInfo) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMouseenter: (__VLS_ctx.cancelHoverHide) },
        ...{ onMouseleave: (__VLS_ctx.hideHoverInfo) },
        ref: "hoverTooltipRef",
        ...{ class: "quickwork-candidate-tooltip-scroll pointer-events-auto fixed z-[300] w-[min(460px,calc(100vw-24px))] overflow-y-auto rounded-[22px] border border-sky-100 bg-white text-sm text-slate-700 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-950/5" },
        ...{ class: (__VLS_ctx.hoverInfo.placement === 'top' ? 'origin-bottom' : 'origin-top') },
        ...{ style: ({ top: `${__VLS_ctx.hoverInfo.top}px`, left: `${__VLS_ctx.hoverInfo.left}px`, maxHeight: `${__VLS_ctx.hoverInfo.maxHeight}px` }) },
        role: "tooltip",
    });
    /** @type {__VLS_StyleScopedClasses['quickwork-candidate-tooltip-scroll']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[300]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[min(460px,calc(100vw-24px))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[22px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-slate-950/5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-b border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-4 py-3.5" },
    });
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-cyan-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-start gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (['flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', __VLS_ctx.getHoverToneClass(__VLS_ctx.hoverInfo.tone, 'icon')]) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    let __VLS_117;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
        name: (__VLS_ctx.hoverInfo.icon || 'uil:info-circle'),
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_119 = __VLS_118({
        name: (__VLS_ctx.hoverInfo.icon || 'uil:info-circle'),
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-w-0 flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    if (__VLS_ctx.hoverInfo.eyebrow) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: (['text-[11px] font-black uppercase tracking-wide', __VLS_ctx.getHoverToneClass(__VLS_ctx.hoverInfo.tone, 'eyebrow')]) },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        (__VLS_ctx.hoverInfo.eyebrow);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "mt-0.5 break-words text-base font-black leading-5 text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    (__VLS_ctx.hoverInfo.title);
    if (__VLS_ctx.hoverInfo.subtitle) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 whitespace-pre-line break-words text-xs font-semibold leading-5 text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-pre-line']} */ ;
        /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        (__VLS_ctx.hoverInfo.subtitle);
    }
    if (__VLS_ctx.hoverInfo.rows?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "divide-y divide-slate-100 px-4" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        for (const [row] of __VLS_vFor((__VLS_ctx.hoverInfo.rows))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (`${row.label}-${row.value}`),
                ...{ class: "grid gap-2 py-3 sm:grid-cols-[116px_1fr]" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:grid-cols-[116px_1fr]']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[11px] font-black uppercase tracking-wide text-slate-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
            (row.label);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "min-w-0 whitespace-pre-line break-words text-sm font-bold leading-5 text-slate-700" },
            });
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-pre-line']} */ ;
            /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
            (row.value);
            // @ts-ignore
            [hideHoverInfo, currentPage, totalPages, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, hoverInfo, cancelHoverHide, getHoverToneClass, getHoverToneClass,];
        }
    }
    if (__VLS_ctx.hoverInfo.badges?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        for (const [badge] of __VLS_vFor((__VLS_ctx.hoverInfo.badges))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (badge),
                ...{ class: (['rounded-full px-2.5 py-1 text-xs font-black', __VLS_ctx.getHoverToneClass(__VLS_ctx.hoverInfo.tone, 'badge')]) },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            (badge);
            // @ts-ignore
            [hoverInfo, hoverInfo, hoverInfo, getHoverToneClass,];
        }
    }
}
// @ts-ignore
[];
var __VLS_114;
// @ts-ignore
[];
var __VLS_108;
let __VLS_122;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
    to: "body",
}));
const __VLS_124 = __VLS_123({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
const { default: __VLS_127 } = __VLS_125.slots;
let __VLS_128;
/** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
    enterActiveClass: "transition duration-200 ease-out",
    enterFromClass: "opacity-0",
    enterToClass: "opacity-100",
    leaveActiveClass: "transition duration-150 ease-in",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}));
const __VLS_130 = __VLS_129({
    enterActiveClass: "transition duration-200 ease-out",
    enterFromClass: "opacity-0",
    enterToClass: "opacity-100",
    leaveActiveClass: "transition duration-150 ease-in",
    leaveFromClass: "opacity-100",
    leaveToClass: "opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
const { default: __VLS_133 } = __VLS_131.slots;
if (__VLS_ctx.profileModalOpen && __VLS_ctx.selectedApplication) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.closeProfileModal) },
        ...{ class: "fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[90]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/45']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        ...{ class: "flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-950/20" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[calc(100vh-2rem)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[32px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-slate-950/20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    if (__VLS_ctx.getAvatarUrl(__VLS_ctx.selectedApplication)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.getAvatarUrl(__VLS_ctx.selectedApplication)),
            alt: (__VLS_ctx.getStudentName(__VLS_ctx.selectedApplication)),
            ...{ class: "h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200" },
        });
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-slate-200']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-xl font-black text-sky-700 ring-1 ring-sky-200" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-sky-200']} */ ;
        (__VLS_ctx.getInitials(__VLS_ctx.selectedApplication));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-w-0" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm font-black text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.selectedApplication.job?.title || 'Tin tuyển dụng');
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "mt-1 text-2xl font-black text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    (__VLS_ctx.getStudentName(__VLS_ctx.selectedApplication));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-1 text-sm font-semibold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (__VLS_ctx.selectedApplication.student?.email || 'Chưa có email');
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeProfileModal) },
        type: "button",
        ...{ class: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        'aria-label': "Đóng hồ sơ ứng viên",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
    let __VLS_134;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
        name: "uil:multiply",
        ...{ class: "h-6 w-6" },
    }));
    const __VLS_136 = __VLS_135({
        name: "uil:multiply",
        ...{ class: "h-6 w-6" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quickwork-candidate-modal-scroll overflow-y-auto px-6 py-6" },
    });
    /** @type {__VLS_StyleScopedClasses['quickwork-candidate-modal-scroll']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-[1.05fr_0.95fr]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "flex items-center gap-2 text-base font-black text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
    let __VLS_139;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
        name: "uil:user",
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_141 = __VLS_140({
        name: "uil:user",
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-5 grid gap-3 sm:grid-cols-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.detailItems(__VLS_ctx.selectedApplication)))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (item.label),
            ...{ class: "rounded-2xl bg-slate-50 p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs font-black uppercase tracking-wide text-slate-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
        (item.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-1 break-words text-sm font-bold text-slate-800" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
        (item.value);
        // @ts-ignore
        [getStudentName, getStudentName, getAvatarUrl, getAvatarUrl, getInitials, profileModalOpen, selectedApplication, selectedApplication, selectedApplication, selectedApplication, selectedApplication, selectedApplication, selectedApplication, selectedApplication, selectedApplication, closeProfileModal, closeProfileModal, detailItems,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "rounded-3xl border border-slate-200 bg-slate-50 p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "flex items-center gap-2 text-base font-black text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    let __VLS_144;
    /** @ts-ignore @type { | typeof __VLS_components.Icon} */
    Icon;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
        name: "uil:file-alt",
        ...{ class: "h-5 w-5" },
    }));
    const __VLS_146 = __VLS_145({
        name: "uil:file-alt",
        ...{ class: "h-5 w-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-5 space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs font-black uppercase tracking-wide text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    if (__VLS_ctx.getSkills(__VLS_ctx.selectedApplication).length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-3 flex flex-wrap gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        for (const [skill] of __VLS_vFor((__VLS_ctx.getSkills(__VLS_ctx.selectedApplication)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (skill),
                ...{ class: "rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-100" },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['ring-slate-100']} */ ;
            (skill);
            // @ts-ignore
            [selectedApplication, selectedApplication, getSkills, getSkills,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-3 text-sm font-semibold text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-slate-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs font-black uppercase tracking-wide text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-2 text-sm font-semibold leading-6 text-slate-600" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
    (__VLS_ctx.getCandidateNote(__VLS_ctx.selectedApplication));
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
        ...{ class: "flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm font-semibold text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-3 sm:flex-row" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    if (__VLS_ctx.getCvUrl(__VLS_ctx.selectedApplication)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (__VLS_ctx.getCvUrl(__VLS_ctx.selectedApplication)),
            target: "_blank",
            rel: "noopener noreferrer",
            ...{ class: "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-sky-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-sky-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
        let __VLS_149;
        /** @ts-ignore @type { | typeof __VLS_components.Icon} */
        Icon;
        // @ts-ignore
        const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
            name: "uil:file-download-alt",
            ...{ class: "h-5 w-5" },
        }));
        const __VLS_151 = __VLS_150({
            name: "uil:file-download-alt",
            ...{ class: "h-5 w-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_150));
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeProfileModal) },
        type: "button",
        ...{ class: "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-sky-100']} */ ;
}
// @ts-ignore
[getCandidateNote, selectedApplication, selectedApplication, selectedApplication, closeProfileModal, getCvUrl, getCvUrl,];
var __VLS_131;
// @ts-ignore
[];
var __VLS_125;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
    props: {},
});
export default {};
