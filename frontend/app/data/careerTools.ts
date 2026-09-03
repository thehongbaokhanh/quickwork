export type CareerToolItem = {
  label: string
  description: string
  icon: string
  iconClass: string
  to?: string
}

export type CareerToolSection = {
  title: string
  items: CareerToolItem[]
}

export const careerToolSections: CareerToolSection[] = [
  {
    title: 'Dành cho bạn',
    items: [
      { label: 'Việc làm phù hợp', description: 'AI đề xuất dựa trên hồ sơ của bạn', icon: 'uil:robot', iconClass: 'bg-sky-50 text-sky-700', to: '/student' },
      { label: 'Đánh giá hồ sơ', description: 'Kiểm tra độ hoàn thiện hồ sơ', icon: 'uil:chart-line', iconClass: 'bg-emerald-50 text-emerald-700', to: '/profile' },
      { label: 'Phân tích kỹ năng', description: 'Kỹ năng mạnh và kỹ năng còn thiếu', icon: 'uil:bullseye', iconClass: 'bg-violet-50 text-violet-700' },
      { label: 'CV & Portfolio', description: 'Quản lý tài liệu nghề nghiệp', icon: 'uil:file-alt', iconClass: 'bg-rose-50 text-rose-700', to: '/profile' }
    ]
  },
  {
    title: 'Khám phá',
    items: [
      { label: 'Mức lương tham khảo', description: 'Tham khảo mức lương từ tin tuyển dụng', icon: 'uil:money-bill', iconClass: 'bg-amber-50 text-amber-700', to: '/#featured-jobs' },
      { label: 'Chuẩn bị phỏng vấn', description: 'Câu hỏi và kỹ năng phỏng vấn', icon: 'uil:microphone', iconClass: 'bg-cyan-50 text-cyan-700' }
    ]
  }
]
