# Tổng quan hiện trạng dự án QuickWork

Cập nhật lần cuối: 2026-08-26

Tài liệu này dùng để bàn giao nhanh dự án QuickWork cho người mới. Mục tiêu là đọc một file vẫn hiểu được dự án đang làm gì, có những vai trò nào, luồng chạy ra sao, backend/frontend/API/database hiện có gì và cần đọc file nào khi muốn sửa tiếp.

## 1. QuickWork là gì

QuickWork là nền tảng tuyển dụng ngắn hạn/part-time kết nối sinh viên, ứng viên trẻ và doanh nghiệp.

Các nhóm người dùng chính:

| Nhóm | Role backend | Mục tiêu |
| --- | --- | --- |
| Khách truy cập | không có | Xem trang chủ, tìm việc, xem việc công khai, đăng ký/đăng nhập |
| Sinh viên / Ứng viên | `STUDENT` | Tìm việc, lưu việc, ứng tuyển, theo dõi trạng thái ứng tuyển |
| Doanh nghiệp / Nhà tuyển dụng | `ENTERPRISE` | Tạo tin tuyển dụng, quản lý ứng viên, đặt lịch phỏng vấn |
| Quản trị viên | `ADMIN` | Quản lý người dùng, duyệt doanh nghiệp, duyệt tin tuyển dụng |

## 2. Stack chính

| Lớp | Công nghệ | Ghi chú |
| --- | --- | --- |
| Frontend | Nuxt/Vue, TypeScript, Pinia, TailwindCSS | UI public, student, enterprise, admin |
| Backend | Go, Fiber, GORM | API REST dưới `/api/v1` |
| Database | MySQL | GORM `AutoMigrate` khi backend start |
| Cache/session phụ | Redis | Blacklist token khi logout |
| Message queue | RabbitMQ | Notification bất đồng bộ qua transactional outbox, mặc định tắt |
| Auth | JWT | Access token và refresh token |
| Upload | Local `/uploads`, Cloudinary nếu cấu hình | GPKD và file upload |
| Docs | Markdown trong `docs/` | AI-first documentation |

## 3. Luồng chạy tổng quát

```text
Người dùng
  -> Nuxt/Vue page hoặc layout
  -> frontend/app/services/*
  -> frontend/app/services/api.ts
  -> HTTP /api/v1
  -> Go Fiber route
  -> Middleware theo route
  -> Handler
  -> Service hoặc repository
  -> GORM
  -> MySQL
  -> JSON response về frontend
```

Redis tham gia chủ yếu ở logout/token blacklist. RabbitMQ la dependency tuy chon cho notification bat dong bo; khi bat, MySQL `outbox_events` dam bao business transaction va event khong tach roi nhau. File upload local được backend serve qua `/uploads`.

## 4. Cách chạy dự án

Backend:

```bash
cd backend
go run ./cmd/api
go test ./...
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
```

API base local:

```text
http://localhost:8080/api/v1
```

## 5. Backend khởi động như thế nào

Source runtime chính:

- `backend/cmd/api/main.go`

Thứ tự khởi động:

| Bước | Việc backend làm | File/liên quan |
| --- | --- | --- |
| 1 | Load `.env` hoặc biến môi trường | `backend/config/config.go` |
| 2 | Khởi tạo Cloudinary nếu có cấu hình | `backend/config/*` |
| 3 | Khởi tạo Redis | `backend/pkg/redis/redis.go` |
| 4 | Set JWT secret | `backend/pkg/jwt/jwt.go` |
| 5 | Kết nối MySQL bằng GORM | `backend/database/mysql.go` |
| 6 | Chạy `database.Migrate(db)` | `backend/database/migration.go` |
| 7 | Chạy `database.Seed(db)` | `backend/database/seed.go` |
| 8 | Tạo repository/service/handler | `backend/internal/*` |
| 9 | Tạo Fiber app, CORS, static `/uploads` | `backend/cmd/api/main.go` |
| 10 | Đăng ký `/api/v1` route group | `backend/routes/*` qua `main.go` |
| 11 | Đăng ký Swagger | `/swagger/*` |
| 12 | Listen port | `APP_PORT`, mặc định `8080` |

Điểm quan trọng: route chỉ thật sự chạy nếu `backend/cmd/api/main.go` đăng ký route đó.

## 6. Frontend chạy và gọi API như thế nào

Source frontend chính:

- `frontend/nuxt.config.ts`
- `frontend/app/app.vue`
- `frontend/app/services/api.ts`
- `frontend/app/stores/auth.ts`
- `frontend/app/middleware/*.ts`
- `frontend/app/pages/**/*.vue`

Luồng request frontend:

```text
page/layout/component
  -> service trong frontend/app/services
  -> apiClient
  -> runtime config public.apiBase
  -> backend /api/v1
```

`apiClient` đang chịu trách nhiệm:

- dùng `config.public.apiBase` cho URL tương đối,
- gắn `Authorization: Bearer <token>` từ cookie `access_token`,
- set JSON content type mặc định,
- bỏ content type khi gửi `FormData` để browser tự set multipart boundary.

## 7. Luồng xác thực và điều hướng

Route đăng nhập/đăng ký:

- `/login`
- `/auth/login`
- `/register`
- `/auth/register`

Luồng đăng nhập:

```text
Người dùng nhập email/mật khẩu
  -> POST /api/v1/auth/login
  -> backend kiểm tra password, status, role/KYB
  -> trả token + thông tin user
  -> frontend lưu auth state/cookie
  -> điều hướng theo role
```

Điều hướng sau đăng nhập:

| Role | Trang đến |
| --- | --- |
| `ADMIN` | `/admin/dashboard` |
| `ENTERPRISE` | `/enterprise` |
| `STUDENT` | redirect hợp lệ nếu có, nếu không về `/` |

Quy tắc chặn:

- `INACTIVE` và `BANNED` không được đăng nhập.
- JWT cũ vẫn bị chặn ở protected API nếu user trong DB không còn `ACTIVE`.
- Doanh nghiệp chưa KYB `APPROVED` hoặc thiếu GPKD không được hoàn tất đăng nhập/khu doanh nghiệp.

Logout:

```text
POST /api/v1/auth/logout
  -> backend blacklist access/refresh token trong Redis nếu token còn hạn
```

## 8. Những tính năng hiện có theo vai trò

### Khách truy cập

Khách có thể:

- xem trang chủ `/`,
- xem bảng việc làm công khai `/student`,
- xem danh sách và chi tiết việc làm đã duyệt,
- tìm kiếm/lọc việc làm nếu UI hiển thị bộ lọc,
- đăng ký sinh viên,
- đăng ký doanh nghiệp và upload GPKD,
- đăng nhập bằng email/mật khẩu hoặc Google.

Khách không thể:

- ứng tuyển,
- lưu/yêu thích việc làm,
- vào khu admin,
- vào khu doanh nghiệp,
- dùng API protected.

### Sinh viên / Ứng viên

Sinh viên có thể:

- xem việc làm công khai trên `/` và `/student`,
- ứng tuyển việc làm,
- lưu/yêu thích việc làm,
- bỏ lưu việc làm,
- xem trạng thái đã ứng tuyển/đã lưu,
- xem danh sách việc đã ứng tuyển,
- xem danh sách việc đã yêu thích,
- nhận notification khi doanh nghiệp đặt lịch hoặc xử lý kết quả phỏng vấn.

Quy tắc:

- chỉ role `STUDENT` được apply/favorite,
- chỉ job `APPROVED` và `slots > 0` được apply/favorite,
- một sinh viên chỉ ứng tuyển một lần cho cùng job,
- một sinh viên chỉ lưu một lần cho cùng job,
- đơn ứng tuyển mới có trạng thái `APPLIED`.

### Doanh nghiệp / Nhà tuyển dụng

Doanh nghiệp có thể:

- xem dashboard doanh nghiệp,
- tạo tin tuyển dụng,
- lưu tin nháp `DRAFT`,
- gửi tin chờ admin duyệt `PENDING`,
- xem danh sách tin của mình,
- sửa tin tuyển dụng,
- xin đăng lại tin bị từ chối,
- đóng/xóa mềm tin tuyển dụng bằng status `CLOSED`,
- xem danh sách ứng viên,
- chấp nhận hoặc từ chối đơn ứng tuyển,
- lưu ghi chú phản hồi ứng viên,
- đặt lịch phỏng vấn cho đơn `ACCEPTED`,
- xử lý kết quả sau giờ phỏng vấn: `HIRED`, `REJECTED`, `NO_SHOW`,
- xem ứng viên đã lưu,
- xem ứng viên bị từ chối,
- xem lịch phỏng vấn và thông báo.

Quy tắc:

- doanh nghiệp phải có role `ENTERPRISE`,
- KYB phải `APPROVED`,
- GPKD URL không được rỗng,
- chỉ thấy đơn ứng tuyển thuộc các job của chính doanh nghiệp,
- `HIRED` làm giảm `jobs.slots`; nếu slots về `0`, job chuyển `CLOSED`.

### Admin

Admin có thể:

- xem dashboard thống kê,
- xem người dùng gần đây,
- quản lý tất cả người dùng,
- quản lý sinh viên,
- quản lý doanh nghiệp,
- xem/sửa thông tin tài khoản không phải admin,
- đổi trạng thái tài khoản không phải admin,
- duyệt/từ chối KYB doanh nghiệp,
- yêu cầu doanh nghiệp nộp GPKD,
- duyệt/từ chối tin tuyển dụng,
- nhập lý do từ chối tin.

Quy tắc:

- admin account được bảo vệ,
- backend từ chối đổi status của user có role `ADMIN`,
- admin không được approve KYB nếu doanh nghiệp thiếu GPKD,
- khi yêu cầu GPKD, backend tạo `notifications` và `messages`.

## 9. Các workflow nghiệp vụ chính

### Đăng ký sinh viên

```text
Guest
  -> POST /auth/register-student
  -> tạo users role STUDENT
  -> tạo student_profiles
  -> đăng nhập sau đó có thể apply/favorite
```

### Đăng ký và duyệt doanh nghiệp

```text
Guest đăng ký doanh nghiệp
  -> upload GPKD
  -> POST /auth/register-enterprise
  -> tạo users role ENTERPRISE
  -> tạo enterprise_profiles KYB PENDING
  -> admin duyệt KYB
  -> KYB APPROVED + có GPKD
  -> doanh nghiệp mới vào được /enterprise
```

### Đăng tin tuyển dụng

```text
Doanh nghiệp tạo tin
  -> DRAFT hoặc PENDING
  -> admin duyệt
  -> APPROVED thì public nếu slots > 0
  -> REJECTED thì doanh nghiệp sửa và gửi lại PENDING
  -> CLOSED thì không public và không nhận đơn mới
```

### Sinh viên ứng tuyển

```text
Sinh viên xem job APPROVED slots > 0
  -> POST /student/jobs/:id/apply
  -> tạo job_applications status APPLIED
  -> doanh nghiệp sở hữu job thấy đơn trong /enterprise/applications
```

### Doanh nghiệp xử lý đơn

```text
APPLIED
  -> doanh nghiệp ACCEPTED hoặc REJECTED
  -> ACCEPTED có thể đặt lịch phỏng vấn
  -> sau giờ phỏng vấn, gửi HIRED / REJECTED / NO_SHOW
  -> HIRED trừ slots job
  -> slots = 0 thì job CLOSED
```

### Lưu/yêu thích việc làm

```text
Sinh viên bấm yêu thích
  -> POST /student/jobs/:id/favorite
  -> tạo favorite_jobs
  -> bấm bỏ lưu
  -> DELETE /student/jobs/:id/favorite
```

## 10. API hiện có

Base API:

```text
/api/v1
```

### Auth public

| Method | Path | Chức năng |
| --- | --- | --- |
| POST | `/auth/register-student` | Đăng ký sinh viên |
| POST | `/auth/register-enterprise` | Đăng ký doanh nghiệp |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/logout` | Đăng xuất/blacklist token |
| POST | `/auth/register-admin` | Tạo admin đầu tiên |
| POST | `/auth/upload` | Upload GPKD |
| POST | `/auth/google` | Google auth |
| GET | `/auth/google/config` | Lấy cấu hình Google auth |

### Job public

| Method | Path | Chức năng |
| --- | --- | --- |
| GET | `/jobs` | Danh sách job `APPROVED` và `slots > 0` |
| GET | `/jobs/:id` | Chi tiết job public |

### Student

| Method | Path | Chức năng |
| --- | --- | --- |
| GET | `/student/job-actions` | Id job đã ứng tuyển/đã lưu |
| GET | `/student/applied-jobs` | Danh sách job đã ứng tuyển |
| GET | `/student/favorite-jobs` | Danh sách job đã lưu |
| POST | `/student/jobs/:id/apply` | Ứng tuyển |
| POST | `/student/jobs/:id/favorite` | Lưu/yêu thích job |
| DELETE | `/student/jobs/:id/favorite` | Bỏ lưu job |

### Enterprise

| Method | Path | Chức năng |
| --- | --- | --- |
| GET | `/enterprise/jobs/` | Danh sách tin của doanh nghiệp |
| POST | `/enterprise/jobs/` | Tạo tin tuyển dụng |
| PUT | `/enterprise/jobs/:id` | Cập nhật tin tuyển dụng |
| DELETE | `/enterprise/jobs/:id` | Đóng/xóa mềm tin tuyển dụng |
| GET | `/enterprise/applications` | Danh sách đơn ứng tuyển |
| PUT | `/enterprise/applications/:id/status` | Chấp nhận/từ chối đơn |
| PUT | `/enterprise/applications/:id/interview` | Đặt/cập nhật lịch phỏng vấn |
| PUT | `/enterprise/applications/:id/interview-result` | Gửi kết quả phỏng vấn |

### Admin

| Method | Path | Chức năng |
| --- | --- | --- |
| GET | `/admin/dashboard/stats` | Thống kê dashboard |
| GET | `/admin/users/recent` | Người dùng gần đây |
| GET | `/admin/users` | Danh sách user |
| GET | `/admin/students` | Danh sách sinh viên |
| GET | `/admin/enterprises` | Danh sách doanh nghiệp |
| PUT | `/admin/users/:id` | Cập nhật user/hồ sơ theo role |
| PUT | `/admin/users/:id/status` | Cập nhật status user không phải admin |
| PUT | `/admin/enterprises/:id/kyb` | Cập nhật KYB doanh nghiệp |
| POST | `/admin/enterprises/:id/request-gpkd` | Yêu cầu doanh nghiệp nộp GPKD |
| GET | `/admin/jobs` | Danh sách job cho admin review |
| PUT | `/admin/jobs/:id/review` | Duyệt/từ chối job |

### Runtime không phải API

| Path | Chức năng |
| --- | --- |
| `/uploads/*` | Serve file upload local |
| `/swagger/*` | Swagger UI |

## 11. Database hiện có

Backend migrate các model sau khi start:

| Model/bảng | Mục đích chính |
| --- | --- |
| `users` | Tài khoản, role, status |
| `student_profiles` | Hồ sơ sinh viên |
| `enterprise_profiles` | Hồ sơ doanh nghiệp, KYB, GPKD |
| `jobs` | Tin tuyển dụng |
| `job_applications` | Đơn ứng tuyển và lịch/kết quả phỏng vấn |
| `favorite_jobs` | Job sinh viên đã lưu |
| `categories` | Ngành nghề |
| `skills` | Kỹ năng |
| `notifications` | Thông báo người dùng |
| `messages` | Tin nhắn/thông báo hệ thống |
| `transactions` | Giao dịch/thanh toán, hiện là model được migrate |

Các enum quan trọng:

| Nhóm | Giá trị |
| --- | --- |
| User role | `ADMIN`, `STUDENT`, `ENTERPRISE` |
| User status | `ACTIVE`, `INACTIVE`, `BANNED` |
| KYB | `PENDING`, `APPROVED`, `REJECTED` |
| Job status | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CLOSED` |
| Application status | `APPLIED`, `ACCEPTED`, `REJECTED` |
| Interview result | `HIRED`, `REJECTED`, `NO_SHOW` |
| Notification type | `INFO`, `WARNING`, `ALERT` |

Seed data hiện có:

- admin demo,
- một số doanh nghiệp đã duyệt,
- một doanh nghiệp pending,
- một số sinh viên demo,
- categories/skills,
- job public/pending/rejected,
- file GPKD mẫu trong `backend/uploads/sample/`.

Mật khẩu demo trong seed:

```text
QuickWork@123
```

## 12. Cấu trúc frontend hiện có

| Khu vực | File/thư mục chính | Vai trò |
| --- | --- | --- |
| Auth UI | `frontend/app/components/Auth*.vue` | Giao diện login/register dùng chung |
| Footer brand | `frontend/app/components/FooterBrandMark.vue` | Đồng bộ logo footer |
| Trang chủ | `frontend/app/pages/index.vue`, `HomeLandingPage.vue`, `components/home/*` | Public homepage |
| Job card public | `HomeJobCard.vue`, `HomeJobDetailPanel.vue` | Card và preview việc làm |
| Data homepage | `frontend/app/composables/useHomeJobs.ts` | Tính stats, filters, job actions |
| Public job board | `frontend/app/pages/student/index.vue`, `layouts/student.vue` | Bảng tất cả việc làm |
| Enterprise layout | `frontend/app/layouts/enterprise.vue` | Sidebar/header nhà tuyển dụng |
| Enterprise jobs | `frontend/app/pages/enterprise/jobs/*` | Quản lý tin tuyển dụng |
| Enterprise applications | `frontend/app/pages/enterprise/applications.vue` | Danh sách ứng viên |
| Saved/rejected candidates | `CandidateCollectionView.vue` | View ứng viên đã lưu/bị từ chối |
| Interviews | `frontend/app/pages/enterprise/interviews.vue` | Lịch và kết quả phỏng vấn |
| Admin layout | `frontend/app/layouts/admin.vue` | Layout khu admin |
| Admin pages | `frontend/app/pages/admin/*.vue` | Quản lý user/student/enterprise/job |
| API client | `frontend/app/services/api.ts` | Fetch wrapper chung |
| Services | `frontend/app/services/*.ts` | Mapping frontend -> backend API |
| Auth state | `frontend/app/stores/auth.ts` | Token, user, role metadata |
| Middleware | `frontend/app/middleware/*.ts` | Route guard theo role |

## 13. Cấu trúc backend hiện có

| Khu vực | File/thư mục chính | Vai trò |
| --- | --- | --- |
| Entry point | `backend/cmd/api/main.go` | Khởi động app, đăng ký route |
| Config | `backend/config/config.go` | Đọc env/default |
| Database | `backend/database/*` | MySQL, migration, seed |
| Models | `backend/internal/models/*` | GORM schema/enums |
| Middlewares | `backend/internal/middlewares/*` | Auth, role, enterprise KYB |
| Routes | `backend/routes/*` | Helper đăng ký route |
| Handlers | `backend/internal/handlers/*` | Fiber handlers/controllers |
| Services | `backend/internal/services/*` | Business logic, đặc biệt auth |
| Repositories | `backend/internal/repositories/*` | DB/Redis access wrappers |
| Shared packages | `backend/pkg/*` | JWT, password, Redis, helpers |
| Uploads | `backend/uploads/*` | File upload local/sample |

Pattern mong muốn:

```text
route -> middleware -> handler -> service -> repository -> model -> database
```

Hiện tại có một số handler query DB trực tiếp, đặc biệt ở admin, student job actions và enterprise applications.

## 14. Những phần đã có nhưng còn giới hạn / cần lưu ý

| Phần | Hiện trạng |
| --- | --- |
| `/student` | Đang là public all-jobs board, không còn chỉ dành riêng cho role `STUDENT` |
| Student profile service | Có method frontend nhưng cần verify runtime route trước khi dùng |
| Company profile/settings | Sidebar doanh nghiệp có mục nhưng còn giới hạn/sắp phát triển nếu UI đánh dấu |
| Admin applications | Không có trang quản trị đơn ứng tuyển riêng; dữ liệu được tổng hợp trong báo cáo và xử lý ở luồng doanh nghiệp |
| Admin categories/reports/settings | Đã dùng API thật; Settings là aggregate dùng chung có version/capability, còn email/2FA/backup provider được ghi rõ chưa hỗ trợ |
| `backend/routes/job_routes.go` | Tồn tại nhưng không active nếu `main.go` không gọi |
| `backend/routes/routes.go` | Có `SetupRoutes`, nhưng current `main.go` không gọi |
| Generated frontend files | `frontend/.nuxt/*` là generated, không nên coi là source of truth |
| Upload URL | Relative `/uploads/...` phải mở qua backend origin, không phải Nuxt origin |

## 15. Debug nhanh theo hiện tượng

| Hiện tượng | Kiểm tra trước |
| --- | --- |
| API 404 | Route có được đăng ký trong `backend/cmd/api/main.go` không |
| 401/403 | Token, Redis blacklist, user status, role, KYB/GPKD |
| Doanh nghiệp không vào được | `kyb_status/status_kyb`, GPKD URL, role `ENTERPRISE` |
| Job không hiện public | Job có `APPROVED` và `slots > 0` không |
| Sinh viên không apply/save được | Đã đăng nhập role `STUDENT` chưa; job có public không |
| File GPKD 404 | URL có đang mở qua backend `/uploads` không |
| Backend không start | `.env`, MySQL, Redis, migration, seed |
| Build frontend warning | Phân biệt warning cũ với lỗi build thật; không dựa vào `.nuxt` làm source |

## 16. Nguồn tài liệu chi tiết

Đọc theo thứ tự nếu cần hiểu sâu hơn:

| Cần hiểu | File |
| --- | --- |
| Mục lục tài liệu | `docs/README.md` |
| Kiến trúc tổng thể | `docs/architecture.md` |
| Luồng khởi động backend | `docs/backend-runtime-flow.md` |
| Luồng theo người dùng | `docs/user-flows.md` |
| Quy tắc nghiệp vụ | `docs/business-rules.md` |
| API route và request/response | `docs/api.md` |
| Database/schema/seed | `docs/database.md` |
| Quy ước code/docs/test | `docs/conventions.md` |
| Lịch sử cập nhật gần nhất | `PROJECT_CHANGELOG.md` |

## 17. Source-of-truth khi sửa tiếp

| Mảng sửa | File bắt buộc đối chiếu |
| --- | --- |
| Backend runtime/route active | `backend/cmd/api/main.go` |
| Database schema | `backend/internal/models/*`, `backend/database/migration.go` |
| Seed data | `backend/database/seed.go` |
| API behavior frontend | `frontend/app/services/api.ts`, `frontend/app/services/*.ts` |
| Auth state frontend | `frontend/app/stores/auth.ts` |
| Route guard frontend | `frontend/app/middleware/*.ts` |
| Auth backend | `backend/internal/services/auth_service.go`, `backend/internal/handlers/auth_handler.go` |
| Enterprise flow | `backend/internal/handlers/enterprise_job_handler.go`, `frontend/app/pages/enterprise/*` |
| Student job actions | `backend/internal/handlers/student_job_handler.go`, `frontend/app/services/student.service.ts` |
| Admin flow | `backend/internal/handlers/admin_handler.go`, `frontend/app/pages/admin/*.vue` |
