# Backend Runtime Flow

Last updated: 2026-08-26

File nay giai thich backend QuickWork hoat dong nhu the nao khi chay app. Muc tieu la giup doc nhanh duoc code se di qua nhung buoc nao, file nao la source of truth, va request duoc xu ly theo thu tu nao.

## Cach Chay Backend

Lenh local thuong dung:

```bash
cd backend
go run ./cmd/api
```

Entry point runtime:

- `backend/cmd/api/main.go`

Neu chay bang binary, Docker, IDE, hay lenh dev khac, luong khoi dong van nen duoc doi chieu voi `backend/cmd/api/main.go`.

## Tong Quan Luong Khoi Dong

Khi backend bat dau chay, `main.go` thuc hien theo thu tu:

1. Load cau hinh tu `.env` hoac bien moi truong.
2. Neu `APP_ENV=production`, tu choi khoi dong neu secret, HTTPS origin, Cloudinary, admin allowlist, cookie bao mat hoac malware scanner chua dat; sau do khoi tao Cloudinary.
3. Khoi tao Redis de phuc vu blacklist token khi logout.
4. Set JWT secret cho package JWT.
5. Ket noi MySQL bang GORM.
6. Chay migration tu dong bang `database.Migrate(db)`.
7. Neu `DB_SEED_ENABLED=true`, chay seed du lieu mau bang `database.Seed(db)`.
8. Tao repository.
9. Tao service; neu `MQ_ENABLED=true` thi tao RabbitMQ notification worker va bat dau dispatcher/consumer.
10. Tao handler.
11. Tao Fiber app, cau hinh CORS va static uploads.
12. Dang ky route group `/api/v1`.
13. Chi dang ky Swagger ngoai production.
14. Lang nghe port tu `APP_PORT`, mac dinh la `8080`; khi co `SIGINT`/`SIGTERM`, dung HTTP va worker co thu tu.

Dang text:

```text
go run ./cmd/api
  -> cmd/api/main.go
  -> config.LoadConfig()
  -> config.ValidateProduction()
  -> config.InitCloudinary(cfg.CloudinaryURL)
  -> redis.Init(cfg)
  -> jwt.SetSecret(cfg.JWTSecret)
  -> database.InitMySQL(cfg)
  -> database.Migrate(db)
  -> optional database.Seed(db)
  -> repositories
  -> services
  -> optional RabbitMQ outbox dispatcher + consumer
  -> handlers
  -> Fiber app
  -> /api/v1 routes
  -> app.Listen(:APP_PORT)
```

## Cau Hinh

Source chinh:

- `backend/config/config.go`

`config.LoadConfig()` doc `.env` neu co, sau do doc bien moi truong. Neu bien moi truong khong ton tai, mot so truong dung gia tri mac dinh.

Nhom cau hinh quan trong:

| Nhom | Bien tieu bieu | Vai tro |
| --- | --- | --- |
| App | `APP_NAME`, `APP_PORT`, `APP_ENV` | Ten app, port, moi truong chay |
| Admin | `ADMIN_SECRET` | Secret tao admin dau tien |
| MySQL | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SEED_ENABLED` | Ket noi database va cho phep seed local/demo |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` | Blacklist token/logout |
| RabbitMQ | `MQ_ENABLED`, `RABBITMQ_URL`, `RABBITMQ_EXCHANGE`, `RABBITMQ_QUEUE`, `RABBITMQ_ROUTING_KEY`, `RABBITMQ_PREFETCH` | Tao notification bat dong bo qua transactional outbox |
| JWT | `JWT_SECRET`, `JWT_ACCESS_EXP`, `JWT_REFRESH_EXP` | Tao va xac thuc token |
| Upload | `UPLOAD_DIR` | Thu muc file local |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL` | Google login |

Khong dua secret that vao docs hoac commit.

## Ket Noi MySQL

Source chinh:

- `backend/database/mysql.go`

`database.InitMySQL(cfg)` tao DSN tu config, mo ket noi GORM voi MySQL, cau hinh connection pool va ping database de dam bao DB san sang.

Nhung diem quan trong:

- charset dung `utf8mb4`,
- `parseTime=True`,
- `loc=Local`,
- pool co `MaxIdleConns`, `MaxOpenConns`, va `ConnMaxLifetime`,
- neu ping MySQL that bai thi backend dung khoi dong.

## Migration Va Seed

Source chinh:

- `backend/database/migration.go`
- `backend/database/seed.go`
- `backend/internal/models/*`

Sau khi ket noi DB thanh cong, backend luon migrate va chi seed khi duoc bat:

```go
database.Migrate(db)
if cfg.DatabaseSeedEnabled {
    database.Seed(db)
}
```

`Migrate` dung GORM `AutoMigrate` cho cac model hien tai:

- `User`
- `StudentProfile`
- `EnterpriseProfile`
- `Job`
- `JobApplication`
- `FavoriteJob`
- `Category`
- `Skill`
- `Conversation`
- `Notification`
- `OutboxEvent`
- `Transaction`
- `Message`
- `SystemSetting`

`DB_SEED_ENABLED` mac dinh `true` de giu luong local hien tai. Compose production dat `false` de khong chen du lieu demo ngoai y muon. `Seed` tao du lieu local/demo theo cach idempotent, nghia la chay lai khong nen tao trung ban ghi mau. Seed hien co gom admin, doanh nghiep, sinh vien, category, skill va mot so tin tuyen dung mau. Mat khau demo duoc ghi trong source seed la `QuickWork@123`.

## Redis Va JWT

Source chinh:

- `backend/pkg/redis/redis.go`
- `backend/pkg/jwt/jwt.go`
- `backend/internal/repositories/auth_redis_repository.go`
- `backend/internal/middlewares/auth_middleware.go`

Redis duoc dung chu yeu cho logout/token blacklist.

Luong co ban:

```text
Login thanh cong
  -> backend tao access token va refresh token
  -> backend dat cookie HttpOnly/Secure/SameSite=Strict
  -> frontend gui cookie bang credentials: include
  -> AuthMiddleware verify token

Logout
  -> backend dua token con han vao Redis blacklist
  -> request sau do dung token nay se bi tu choi
```

JWT secret duoc set luc khoi dong bang:

```text
jwt.SetSecret(cfg.JWTSecret)
```

JWT parser chi chap nhan dung HS256. Claim `token_type=access` la bat buoc cho protected routes, nen refresh token khong the duoc dung thay access token. Production khong tra token trong JSON (`AUTH_EXPOSE_TOKENS=false`).

Upload production co body limit 12 MB, extension allowlist, signature/magic validation va ClamAV `INSTREAM` scan truoc Cloudinary. `UPLOAD_MALWARE_SCAN_REQUIRED=true` fail closed neu scanner khong san sang.

## Tao Repository, Service, Handler

Trong `main.go`, sau khi DB san sang, app tao cac thanh phan xu ly request.

Repository tieu bieu:

- `UserRepository`
- `StudentRepository`
- `EnterpriseRepository`
- `AuthRedisRepository`
- `JobRepository`
- `NotificationRepository`
- `ConversationRepository`
- `MessageRepository`

Service tieu bieu:

- `SystemSettingsService`
- `AuthService`
- `NotificationService`
- `ConversationService`

Handler tieu bieu:

- `AuthHandler`
- `TestHandler`
- `EnterpriseJobHandler`
- `StudentJobHandler`
- `AdminHandler`
- `AdminSettingsHandler`
- `NotificationHandler`
- `ConversationHandler`

Pattern mong muon:

```text
route -> middleware -> handler -> service -> repository -> model -> database
```

Mot so handler hien tai van truy van DB truc tiep, dac biet la admin, student job actions va enterprise application review. Khi sua nhung phan nay can doc dung handler truoc khi thay doi.

## Fiber App Va CORS

`main.go` tao Fiber app va cau hinh:

- CORS cho frontend local, vi du `localhost:3000`,
- credentials cho request co token/cookie,
- static uploads tai `/uploads`,
- Swagger tai `/swagger/*`.

Route API chinh duoc gom duoi:

```text
/api/v1
```

## Route Runtime Dang Hoat Dong

Source of truth route runtime la:

- `backend/cmd/api/main.go`

Bang tong quan:

| Group | Middleware | Muc dich |
| --- | --- | --- |
| `/api/v1/auth` | Public | Dang ky, dang nhap, logout, upload GPKD, Google auth |
| `/api/v1/jobs` | Public | Danh sach va chi tiet job da duyet |
| `/api/v1/profile` | `AuthMiddleware` | Endpoint profile/test da dang nhap |
| `/api/v1/auth/change-password` | `AuthMiddleware` | Doi mat khau cho user dang dang nhap |
| `/api/v1/notifications` | `AuthMiddleware` | Danh sach, unread count, danh dau da doc thong bao cua user hien tai |
| `/api/v1/conversations` | `AuthMiddleware` | Danh sach chat, lich su tin nhan, gui tin, unread count va mark-read |
| `/api/v1/job-applications/:id/messages` | `AuthMiddleware` | Gui tin dau tien hoac tin tiep theo theo application, tu tao conversation khi can |
| `/api/v1/student` | `AuthMiddleware`, `RoleMiddleware("STUDENT")` | Ung tuyen, yeu thich, viec da ung tuyen |
| `/api/v1/enterprise` | `AuthMiddleware`, `RoleMiddleware("ENTERPRISE")`, `EnterpriseApprovedMiddleware` | Ho so nha tuyen dung, tin tuyen dung, ung vien, phong van; KYB gate doc shared Settings |
| `/api/v1/admin` | `AuthMiddleware`, `RoleMiddleware("ADMIN")`, `AdminIPAllowlistMiddleware` | Quan ly user, doanh nghiep, job, dashboard va shared Settings |
| `/uploads/*` | Public static | File upload local |
| `/swagger/*` | Public | Swagger UI |

Luu y quan trong:

- Mot route chi that su active khi `main.go` dang ky no.
- `backend/routes/job_routes.go` va `backend/routes/routes.go` co ton tai nhung khong phai source of truth neu `main.go` khong goi chung.

## Notification Va Conversation Runtime

Thong bao:

```text
business handler
  -> NotificationService helper
  -> neu MQ_ENABLED=false: NotificationRepository.CreateTx/Create -> notifications
  -> neu MQ_ENABLED=true: outbox_events trong cung transaction
       -> dispatcher publish persistent message va doi publisher confirm
       -> quickwork.notifications consumer
       -> insert notifications theo event_id duy nhat
```

Lich phong van, ket qua phong van va yeu cau GPKD deu di qua `NotificationService`. Khi RabbitMQ mat ket noi, API van commit business transaction va event nam trong `outbox_events` de retry; notification se co eventual consistency. Consumer loi dua message vao dead-letter queue. Luong yeu cau GPKD khong con tao row `messages`; `messages` duoc danh rieng cho chat tren ho so ung tuyen.

Chat:

```text
POST /job-applications/:id/messages
  -> AuthMiddleware
  -> ConversationHandler
  -> ConversationService
  -> load JobApplication + Job + Student
  -> verify current user la student hoac enterprise so huu job
  -> transaction:
       find/create conversation
       create message
       update last_message + unread count
       create MESSAGE notification
```

`GET /conversations/:id/messages` va `PUT /conversations/:id/read` deu kiem tra conversation thuoc current user truoc khi doc hoac cap nhat.

## Middleware Request Lifecycle

Request protected di qua middleware theo thu tu route group.

### AuthMiddleware

Source:

- `backend/internal/middlewares/auth_middleware.go`

Nhiem vu:

1. Doc header `Authorization`.
2. Yeu cau format `Bearer <token>`.
3. Kiem tra token co bi blacklist trong Redis khong.
4. Verify JWT.
5. Neu co DB, doc lai user hien tai.
6. Tu choi user khong ton tai hoac status khac `ACTIVE`.
7. Gan `user_id` va `role` vao `c.Locals`.

Ket qua:

```text
c.Locals("user_id") = claims.UserID
c.Locals("role") = claims.Role
```

### RoleMiddleware

Source:

- `backend/internal/middlewares/role_middleware.go`

Nhiem vu:

- Doc `role` tu `c.Locals`.
- So sanh role voi danh sach role duoc phep.
- So sanh khong phan biet hoa thuong.

Vi du:

```text
RoleMiddleware("ADMIN")
RoleMiddleware("STUDENT")
RoleMiddleware("ENTERPRISE")
```

### EnterpriseApprovedMiddleware

Source:

- `backend/internal/middlewares/enterprise_kyb_middleware.go`

Nhiem vu:

1. Doc `registration.requireKyb` tu `SystemSettingsService`.
2. Neu policy tat, cho request di tiep ma khong sua du lieu KYB/GPKD.
3. Neu policy bat, doc `user_id` va `enterprise_profiles`.
4. Kiem tra KYB da `APPROVED` va co `GPKDURL`.
5. Luon cho phep GET/PUT profile de enterprise sua ho so/GPKD.

Middleware nay chi gan cho group `/api/v1/enterprise`.

### AdminIPAllowlistMiddleware

Source:

- `backend/internal/middlewares/admin_settings_middleware.go`

Middleware nay chay sau auth va role tren group `/api/v1/admin`. Allowlist rong cho phep moi IP; allowlist co gia tri chap nhan IPv4 hoac CIDR da normalize. IP khong khop nhan `403`. Neu Settings service khong san sang, middleware fail closed voi `503`.

## Luong Request Vi Du

### Dang nhap

```text
POST /api/v1/auth/login
  -> AuthHandler.Login
  -> AuthService.Login
  -> UserRepository tim user theo email
  -> verify password
  -> kiem tra status/KYB theo role
  -> tao JWT
  -> tra ve token va thong tin user
```

### Doi mat khau

```text
POST /api/v1/auth/change-password
  -> AuthMiddleware
  -> AuthHandler.ChangePassword
  -> AuthService.ChangePassword
  -> UserRepository tim user hien tai theo user_id
  -> verify current_password
  -> kiem tra mat khau moi khong trung, du manh va khong co khoang trang
  -> hash mat khau moi
  -> UserRepository.UpdatePassword cap nhat users.password
  -> tra ve thong bao doi mat khau thanh cong
```

### Sinh vien ung tuyen

```text
POST /api/v1/student/jobs/:id/apply
  -> AuthMiddleware
  -> RoleMiddleware("STUDENT")
  -> StudentJobHandler.ApplyJob
  -> kiem tra job APPROVED va con slots
  -> kiem tra da ung tuyen chua
  -> tao job_applications voi status APPLIED
  -> tra ve application
```

### Doanh nghiep xem ung vien

```text
GET /api/v1/enterprise/applications
  -> AuthMiddleware
  -> RoleMiddleware("ENTERPRISE")
  -> EnterpriseApprovedMiddleware
  -> EnterpriseJobHandler.GetApplications
  -> lay applications thuoc cac job cua enterprise hien tai
  -> preload job, student, profile, skill neu can
  -> tra ve danh sach ung vien
```

### Admin duyet tin

```text
PUT /api/v1/admin/jobs/:id/review
  -> AuthMiddleware
  -> RoleMiddleware("ADMIN")
  -> AdminHandler
  -> cap nhat trang thai job APPROVED hoac REJECTED
  -> tra ve ket qua
```

## Response Shape

Response thong dung:

```json
{
  "success": true,
  "message": "optional message",
  "data": {}
}
```

Error thong dung:

```json
{
  "success": false,
  "message": "error message",
  "errors": "optional validation detail"
}
```

Mot so handler co the tra truc tiep `fiber.Map`, nen khi can thay doi contract phai doc handler cu the.

## Diem De Loi Khi Chay Backend

Nhung diem backend co the dung khoi dong hoac loi request:

| Vi tri | Dau hieu | Cach kiem tra |
| --- | --- | --- |
| Config | Port/secret/DB rong hoac sai | Kiem tra `.env` va bien moi truong |
| Redis | Logout/blacklist loi | Kiem tra Redis host/port |
| MySQL | Backend khong start hoac ping fail | Kiem tra DB service, user, password, database |
| Migration | Loi AutoMigrate | Kiem tra model moi sua |
| Seed | Start loi khi chen du lieu mau | Kiem tra unique key va seed idempotent |
| Route | API 404 | Doi chieu `backend/cmd/api/main.go` |
| Auth | 401/403 | Kiem tra token, role, user status, enterprise KYB |
| Upload | File khong mo duoc | Kiem tra `/uploads` va backend origin |

## File Nen Doc Khi Sua Backend

Doc theo khu vuc thay doi:

| Khu vuc | File nen doc |
| --- | --- |
| Entry point/runtime | `backend/cmd/api/main.go` |
| Config | `backend/config/config.go` |
| Database connect | `backend/database/mysql.go` |
| Migration/seed | `backend/database/migration.go`, `backend/database/seed.go`, `backend/internal/models/*` |
| Auth | `backend/routes/auth.go`, `backend/internal/dto/request/change_password_request.go`, `backend/internal/handlers/auth_handler.go`, `backend/internal/services/auth_service.go` |
| Middleware | `backend/internal/middlewares/*.go` |
| Student jobs | `backend/routes/student_routes.go`, `backend/internal/handlers/student_job_handler.go` |
| Enterprise jobs/applications | `backend/routes/enterprise_routes.go`, `backend/internal/handlers/enterprise_job_handler.go` |
| Admin | `backend/routes/admin_routes.go`, `backend/routes/admin_settings_routes.go`, `backend/internal/handlers/admin_handler.go`, `backend/internal/handlers/admin_settings_handler.go`, `backend/internal/services/system_settings_service.go` |
| Frontend API mapping | `frontend/app/services/api.ts`, `frontend/app/services/*.ts` |

## Ghi Nho Nhanh

- `main.go` quyet dinh backend that su chay route nao.
- `Migrate` chay moi lan backend khoi dong; `Seed` chi chay khi `DB_SEED_ENABLED=true`.
- Public jobs chi hien thi job `APPROVED` va `slots > 0`.
- Enterprise API can role `ENTERPRISE`; yeu cau KYB `APPROVED` va GPKD khong rong khi shared `requireKyb` dang bat.
- Admin API can role `ADMIN` va phai khop shared IP allowlist neu allowlist khong rong.
- Student apply/favorite can role `STUDENT`.
- User `INACTIVE` hoac `BANNED` bi chan ca khi token JWT van con han.
