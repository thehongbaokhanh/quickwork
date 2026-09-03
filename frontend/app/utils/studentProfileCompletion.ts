export type StudentProfileCompletionCheck = {
  label: string
  ok: boolean
}

function unwrapStudentUser(snapshot: any) {
  const envelope = snapshot?.data ?? snapshot ?? {}
  return envelope?.data ?? envelope?.user ?? envelope ?? {}
}

function firstArray(...values: unknown[]) {
  return values.find(Array.isArray) as unknown[] | undefined
}

export function getStudentProfileCompletionChecks(snapshot: any): StudentProfileCompletionCheck[] {
  const user = unwrapStudentUser(snapshot)
  const profile = user?.student_profile || user?.studentProfile || user?.profile || {}
  const name = String(profile.name || user.name || '').trim()
  const skills = firstArray(profile.skills, profile.Skills) || []
  const experiences = firstArray(profile.work_experiences, profile.workExperiences, profile.WorkExperiences) || []
  const educations = firstArray(profile.educations, profile.Educations) || []

  return [
    { label: 'họ và tên', ok: Boolean(name) && name !== 'Sinh viên QuickWork' },
    { label: 'số điện thoại', ok: Boolean(String(profile.phone || '').trim()) },
    { label: 'ảnh đại diện', ok: Boolean(String(profile.avatar || profile.avatar_url || user.avatar || '').trim()) },
    { label: 'địa điểm', ok: Boolean(String(profile.preferred_location || profile.location || '').trim()) },
    { label: 'giới thiệu', ok: Boolean(String(profile.summary || '').trim()) },
    { label: 'kỹ năng', ok: skills.length > 0 },
    { label: 'kinh nghiệm', ok: experiences.length > 0 },
    { label: 'học vấn', ok: educations.length > 0 },
    { label: 'CV', ok: Boolean(String(profile.cv_url || profile.CVURL || '').trim()) }
  ]
}

export function getStudentProfileCompletion(snapshot: any) {
  const checks = getStudentProfileCompletionChecks(snapshot)
  return checks.length ? Math.round((checks.filter((check) => check.ok).length / checks.length) * 100) : 0
}
