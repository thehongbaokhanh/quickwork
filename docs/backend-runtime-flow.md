# Backend Runtime Flow

Last updated: 2026-07-20

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
2. Khoi tao Cloudinary neu cau hinh upload cloud co san.
3. Khoi tao Redis de phuc vu blacklist token khi logout.
4. Set JWT secret cho package JWT.
5. Ket noi MySQL bang GORM.
6. Chay migration tu dong bang `database.Migrate(db)`.
7. Chay seed du lieu mau bang `database.Seed(db)`.
8. Tao repository.
9. Tao service.
10. Tao handler.
11. Tao Fiber app, cau hinh CORS va static uploads.
12. Dang ky route group `/api/v1`.
13. Dang ky Swagger.
14. Lang nghe port tu `APP_PORT`, mac dinh la `8080`.

Dang text:

```text
go run ./cmd/api
  -> cmd/api/main.go
  -> config.LoadConfig()
  -> config.InitCloudinary()
  -> redis.Init(cfg)
  -> jwt.SetSecret(cfg.JWTSecret)
  -> database.InitMySQL(cfg)
  -> database.Migrate(db)
  -> database.Seed(db)
  -> repositories
  -> services
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
| MySQL | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Ket noi database |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` | Blacklist token/logout |
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

Sau khi ket noi DB thanh cong, backend goi:

```go
database.Migrate(db)
database.Seed(db)
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
- `Notification`
- `Transaction`
- `Message`

`Seed` tao du lieu local/demo theo cach idempotent, nghia la chay lai khong nen tao trung ban ghi mau. Seed hien co gom admin, doanh nghiep, sinh vien, category, skill va mot so tin tuyen dung mau. Mat khau demo duoc ghi trong source seed la `QuickWork@123`.

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
  -> frontend gui Authorization: Bearer <access_token>
  -> AuthMiddleware verify token

Logout
  -> backend dua token con han vao Redis blacklist
  -> request sau do dung token nay se bi tu choi
```

JWT secret duoc set luc khoi dong bang:

```text
jwt.SetSecret(cfg.JWTSecret)
```

## Tao Repository, Service, Handler

Trong `main.go`, sau khi DB san sang, app tao cac thanh phan xu ly request.

Repository tieu bieu:

- `UserRepository`
- `StudentRepository`
- `EnterpriseRepository`
- `AuthRedisRepository`
- `JobRepository`

Service tieu bieu:

- `AuthService`

Handler tieu bieu:

- `AuthHandler`
- `TestHandler`
- `EnterpriseJobHandler`
- `StudentJobHandler`
- `AdminHandler`

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
| `/api/v1/student` | `AuthMiddleware`, `RoleMiddleware("STUDENT")` | Ung tuyen, yeu thich, viec da ung tuyen |
| `/api/v1/enterprise` | `AuthMiddleware`, `RoleMiddleware("ENTERPRISE")`, `EnterpriseApprovedMiddleware` | Ho so nha tuyen dung, tin tuyen dung, ung vien, phong van |
| `/api/v1/admin` | `AuthMiddleware`, `RoleMiddleware("ADMIN")` | Quan ly user, doanh nghiep, job, dashboard |
| `/uploads/*` | Public static | File upload local |
| `/swagger/*` | Public | Swagger UI |

Luu y quan trong:

- Mot route chi that su active khi `main.go` dang ky no.
- `backend/routes/job_routes.go` va `backend/routes/routes.go` co ton tai nhung khong phai source of truth neu `main.go` khong goi chung.

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

1. Doc `user_id` cua enterprise dang dang nhap.
2. Lay `enterprise_profiles`.
3. Kiem tra KYB da `APPROVED`.
4. Kiem tra co `GPKDURL`.
5. Tu choi neu doanh nghiep chua duoc duyet hoac thieu GPKD.

Middleware nay chi gan cho group `/api/v1/enterprise`.

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
| Admin | `backend/routes/admin_routes.go`, `backend/internal/handlers/admin_handler.go` |
| Frontend API mapping | `frontend/app/services/api.ts`, `frontend/app/services/*.ts` |

## Ghi Nho Nhanh

- `main.go` quyet dinh backend that su chay route nao.
- `Migrate` va `Seed` chay moi lan backend khoi dong.
- Public jobs chi hien thi job `APPROVED` va `slots > 0`.
- Enterprise API can role `ENTERPRISE`, KYB `APPROVED`, va GPKD khong rong.
- Admin API can role `ADMIN`.
- Student apply/favorite can role `STUDENT`.
- User `INACTIVE` hoac `BANNED` bi chan ca khi token JWT van con han.
