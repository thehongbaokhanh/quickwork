export type BlogArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  industry: string
  date: string
  readMinutes: number
  image: string
  imagePosition: string
  highlights: string[]
  keywords?: string[]
  featured?: boolean
  recommended?: boolean
}

export const blogCategories = [
  'Tất cả',
  'Tìm việc',
  'CV & Hồ sơ',
  'Phỏng vấn',
  'Kỹ năng nghề nghiệp',
  'Định hướng nghề nghiệp',
  'Thị trường việc làm',
  'Góc sinh viên'
]

export const blogArticles: BlogArticle[] = [
  {
    slug: '5-buoc-xac-dinh-muc-tieu-nghe-nghiep',
    title: '5 bước xác định mục tiêu nghề nghiệp rõ ràng và thực tế',
    excerpt: 'Bắt đầu từ thế mạnh, điều bạn muốn học và nhu cầu tuyển dụng để xây dựng mục tiêu có thể hành động.',
    category: 'Định hướng nghề nghiệp',
    industry: 'Đa ngành',
    date: '28/08/2026',
    readMinutes: 7,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '0% 0%',
    keywords: ['mục tiêu', 'sinh viên'],
    featured: true,
    highlights: ['Liệt kê thế mạnh và giá trị nghề nghiệp', 'Chọn mục tiêu có thời hạn cụ thể', 'Đánh giá lại sau mỗi giai đoạn trải nghiệm']
  },
  {
    slug: 'ky-nang-nha-tuyen-dung-dang-tim-kiem',
    title: 'Top kỹ năng nhà tuyển dụng đang tìm kiếm ở ứng viên mới',
    excerpt: 'Những năng lực nền tảng giúp sinh viên thích nghi nhanh và tạo giá trị ngay trong giai đoạn thử việc.',
    category: 'Kỹ năng nghề nghiệp',
    industry: 'Đa ngành',
    date: '27/08/2026',
    readMinutes: 6,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '0% 100%',
    keywords: ['fresher', 'intern'],
    featured: true,
    recommended: true,
    highlights: ['Giao tiếp rõ ràng trong công việc', 'Tư duy giải quyết vấn đề', 'Khả năng tự học và nhận phản hồi']
  },
  {
    slug: 'viet-cv-backend-cho-fresher',
    title: 'Cách viết CV Backend cho Fresher dễ đọc và đúng trọng tâm',
    excerpt: 'Sắp xếp dự án, kỹ năng và kết quả học tập để CV ngắn gọn nhưng vẫn có bằng chứng năng lực.',
    category: 'CV & Hồ sơ',
    industry: 'Công nghệ',
    date: '26/08/2026',
    readMinutes: 6,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '50% 0%',
    keywords: ['CV ATS', 'fresher'],
    highlights: ['Ưu tiên dự án có vai trò rõ ràng', 'Mô tả kết quả thay vì chỉ liệt kê công nghệ', 'Giữ bố cục nhất quán và dễ quét']
  },
  {
    slug: '15-cau-hoi-phong-van-backend',
    title: '15 câu hỏi phỏng vấn Backend thường gặp và cách chuẩn bị',
    excerpt: 'Một lộ trình ôn tập từ kiến thức nền, cơ sở dữ liệu đến cách trình bày quyết định kỹ thuật.',
    category: 'Phỏng vấn',
    industry: 'Công nghệ',
    date: '25/08/2026',
    readMinutes: 8,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '100% 0%',
    keywords: ['phỏng vấn intern', 'fresher'],
    highlights: ['Ôn lại HTTP, database và cấu trúc dữ liệu', 'Giải thích được lựa chọn trong dự án cá nhân', 'Chuẩn bị câu hỏi dành cho nhà tuyển dụng']
  },
  {
    slug: 'lo-trinh-hoc-go-nodejs-sql',
    title: 'Lộ trình học Go, Node.js và SQL cho người mới bắt đầu',
    excerpt: 'Cách chia giai đoạn học để xây được API hoàn chỉnh thay vì học nhiều công nghệ rời rạc.',
    category: 'Kỹ năng nghề nghiệp',
    industry: 'Công nghệ',
    date: '24/08/2026',
    readMinutes: 10,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '0% 100%',
    keywords: ['backend', 'lộ trình backend'],
    highlights: ['Nắm chắc một ngôn ngữ backend trước', 'Học SQL thông qua bài toán thực tế', 'Hoàn thiện một dự án có kiểm thử và triển khai']
  },
  {
    slug: '7-cach-tim-viec-hieu-qua-tren-linkedin',
    title: '7 cách tìm việc hiệu quả trên LinkedIn dành cho sinh viên',
    excerpt: 'Tối ưu hồ sơ, mở rộng kết nối đúng ngành và tiếp cận cơ hội với thông điệp chuyên nghiệp.',
    category: 'Tìm việc',
    industry: 'Đa ngành',
    date: '22/08/2026',
    readMinutes: 5,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '0% 0%',
    keywords: ['remote', 'networking'],
    highlights: ['Hoàn thiện tiêu đề và phần giới thiệu', 'Theo dõi doanh nghiệp đúng mục tiêu', 'Cá nhân hóa lời mời kết nối']
  },
  {
    slug: 'xu-huong-tuyen-dung-backend',
    title: 'Xu hướng tuyển dụng Backend và những điều sinh viên cần chuẩn bị',
    excerpt: 'Nhìn vào yêu cầu tuyển dụng thực tế để ưu tiên nền tảng, công cụ và kinh nghiệm dự án phù hợp.',
    category: 'Thị trường việc làm',
    industry: 'Công nghệ',
    date: '20/08/2026',
    readMinutes: 7,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '50% 100%',
    keywords: ['data analyst', 'internship', 'backend'],
    highlights: ['Đọc yêu cầu tuyển dụng theo nhóm kỹ năng', 'Phân biệt công nghệ cốt lõi và công cụ hỗ trợ', 'Theo dõi xu hướng nhưng không bỏ qua nền tảng']
  },
  {
    slug: 'quan-ly-thoi-gian-khi-vua-hoc-vua-lam',
    title: 'Quản lý thời gian hiệu quả khi vừa học vừa làm',
    excerpt: 'Một cách lập lịch đơn giản để cân bằng môn học, công việc bán thời gian và thời gian hồi phục.',
    category: 'Góc sinh viên',
    industry: 'Đa ngành',
    date: '18/08/2026',
    readMinutes: 5,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '100% 100%',
    highlights: ['Chọn ba ưu tiên chính mỗi tuần', 'Đặt khung giờ tập trung có giới hạn', 'Giữ khoảng trống để xử lý việc phát sinh']
  },
  {
    slug: 'cv-ke-toan-cho-sinh-vien-moi-ra-truong',
    title: 'CV Kế toán cho sinh viên mới ra trường cần nhấn mạnh điều gì?',
    excerpt: 'Trình bày môn học, chứng từ thực hành và độ chính xác số liệu để hồ sơ có bằng chứng phù hợp với vị trí.',
    category: 'CV & Hồ sơ',
    industry: 'Tài chính - Kế toán',
    date: '17/08/2026',
    readMinutes: 6,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '50% 0%',
    keywords: ['kế toán', 'tài chính', 'CV kế toán'],
    recommended: true,
    highlights: ['Nêu rõ công cụ kế toán đã thực hành', 'Đưa ví dụ kiểm tra và đối chiếu số liệu', 'Ưu tiên kinh nghiệm liên quan đến chứng từ']
  },
  {
    slug: 'phong-van-sales-tu-van-khach-hang',
    title: 'Chuẩn bị phỏng vấn Sales và Tư vấn khách hàng bằng tình huống thật',
    excerpt: 'Dùng trải nghiệm học tập, hoạt động nhóm và công việc bán thời gian để chứng minh khả năng thuyết phục.',
    category: 'Phỏng vấn',
    industry: 'Kinh doanh - Bán hàng',
    date: '16/08/2026',
    readMinutes: 7,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '100% 0%',
    keywords: ['sales', 'bán hàng', 'chăm sóc khách hàng'],
    recommended: true,
    highlights: ['Chuẩn bị tình huống xử lý từ chối', 'Mô tả cách lắng nghe nhu cầu khách hàng', 'Đặt câu hỏi về sản phẩm và chỉ tiêu']
  },
  {
    slug: 'portfolio-thiet-ke-khong-chi-la-hinh-dep',
    title: 'Portfolio Thiết kế không chỉ là tập hợp những hình ảnh đẹp',
    excerpt: 'Biến mỗi dự án thành một câu chuyện có bài toán, quyết định thiết kế và kết quả kiểm chứng rõ ràng.',
    category: 'CV & Hồ sơ',
    industry: 'Thiết kế - Sáng tạo',
    date: '15/08/2026',
    readMinutes: 6,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '50% 0%',
    keywords: ['thiết kế', 'portfolio', 'UX UI', 'đồ họa'],
    highlights: ['Mở đầu bằng bài toán cần giải quyết', 'Giải thích vai trò và quyết định cá nhân', 'Kết thúc bằng kết quả và điều học được']
  },
  {
    slug: 'lo-trinh-digital-marketing-cho-nguoi-moi',
    title: 'Lộ trình Digital Marketing cho người mới từ nội dung đến dữ liệu',
    excerpt: 'Xây nền tảng về khách hàng, nội dung và đo lường trước khi chọn một kênh chuyên sâu để thực hành.',
    category: 'Định hướng nghề nghiệp',
    industry: 'Marketing - Truyền thông',
    date: '14/08/2026',
    readMinutes: 8,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '0% 0%',
    keywords: ['marketing', 'truyền thông', 'content', 'digital'],
    highlights: ['Hiểu hành trình và nhu cầu khách hàng', 'Thực hành một kênh với mục tiêu đo được', 'Đọc dữ liệu để điều chỉnh nội dung']
  },
  {
    slug: 'ky-nang-cham-soc-khach-hang-da-kenh',
    title: 'Kỹ năng chăm sóc khách hàng đa kênh trong môi trường dịch vụ',
    excerpt: 'Giữ thông tin nhất quán, xử lý cảm xúc và theo dõi cam kết khi trao đổi qua điện thoại, email hoặc chat.',
    category: 'Kỹ năng nghề nghiệp',
    industry: 'Dịch vụ khách hàng',
    date: '13/08/2026',
    readMinutes: 5,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '0% 100%',
    keywords: ['dịch vụ', 'customer service', 'chăm sóc khách hàng'],
    highlights: ['Ghi nhận đúng vấn đề của khách hàng', 'Thống nhất thời hạn và người xử lý', 'Theo dõi đến khi yêu cầu được khép lại']
  },
  {
    slug: 'thi-truong-logistics-va-chuoi-cung-ung',
    title: 'Thị trường Logistics và các vị trí đầu vào trong chuỗi cung ứng',
    excerpt: 'Phân biệt vận hành kho, chứng từ, điều phối và mua hàng để chọn vị trí khởi đầu phù hợp với thế mạnh.',
    category: 'Thị trường việc làm',
    industry: 'Logistics - Chuỗi cung ứng',
    date: '12/08/2026',
    readMinutes: 7,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '50% 100%',
    keywords: ['logistics', 'chuỗi cung ứng', 'xuất nhập khẩu'],
    recommended: true,
    highlights: ['Phân biệt nhiệm vụ của từng mắt xích', 'Ưu tiên Excel, chứng từ và giao tiếp', 'Chọn trải nghiệm thực tập sát vị trí mục tiêu']
  },
  {
    slug: 'tim-thuc-tap-nhan-su-khi-chua-co-kinh-nghiem',
    title: 'Tìm thực tập Nhân sự khi chưa có kinh nghiệm chuyên môn',
    excerpt: 'Khai thác hoạt động câu lạc bộ, tổ chức sự kiện và giao tiếp để chứng minh năng lực phù hợp với HR.',
    category: 'Tìm việc',
    industry: 'Nhân sự - Tuyển dụng',
    date: '11/08/2026',
    readMinutes: 5,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '0% 0%',
    keywords: ['nhân sự', 'HR', 'tuyển dụng', 'thực tập'],
    highlights: ['Chuyển hoạt động sinh viên thành năng lực', 'Tìm hiểu quy trình tuyển dụng cơ bản', 'Theo dõi hồ sơ ứng tuyển có hệ thống']
  },
  {
    slug: 'thuc-tap-du-lich-khach-san-can-chuan-bi-gi',
    title: 'Sinh viên Du lịch - Khách sạn cần chuẩn bị gì trước kỳ thực tập?',
    excerpt: 'Chuẩn bị tác phong, giao tiếp và cách quan sát quy trình dịch vụ để tận dụng tốt giai đoạn thực tập.',
    category: 'Góc sinh viên',
    industry: 'Du lịch - Khách sạn',
    date: '10/08/2026',
    readMinutes: 6,
    image: '/images/quickwork-blog-career-sheet.png',
    imagePosition: '100% 100%',
    keywords: ['du lịch', 'khách sạn', 'dịch vụ', 'thực tập'],
    highlights: ['Tìm hiểu tiêu chuẩn phục vụ cơ bản', 'Chuẩn bị ngoại ngữ theo tình huống', 'Ghi lại phản hồi để cải thiện mỗi tuần']
  }
]
