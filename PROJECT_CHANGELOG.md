# QuickWork - Project Changelog and Issue Log

Ngay tao: 2026-07-09

Tai lieu nay dung de ghi lai loi, thay doi, cach sua va ket qua kiem tra cua du an QuickWork. Theo yeu cau hien tai, file chi giu thong tin cap nhat cua ngay gan nhat.

## Quy uoc cap nhat

- Loi dang con ton tai de trong muc `Dang mo / Can theo doi`.
- Loi da sua chuyen vao muc `Da xu ly`.
- Moi ban ghi nen co:
  - Hien tuong.
  - Nguyen nhan.
  - Cach sua.
  - File lien quan.
  - Lenh kiem tra.
  - Trang thai.
- Neu mot loi cu da het, khong de no o muc dang mo nua; chuyen sang `Da xu ly` va ghi ngay sua.
- Khi thay doi kien truc/route/model/luong nghiep vu, dong thoi cap nhat tai lieu lien quan trong `docs/`.

## Dang mo / Can theo doi

- Chua co loi dang mo duoc ghi nhan sau cac thay doi ngay 2026-07-27.

## Da xu ly

### 2026-07-27 - Dieu chinh danh muc cai dat nang cao nha tuyen dung

Hien tuong / Yeu cau:

- Can dua phan `Tuy chon hien thi` vao trong `Danh muc cai dat nang cao`.
- Can bo nhom `Quan ly CV` khoi trang cai dat nha tuyen dung.

Nguyen nhan:

- `Tuy chon hien thi` dang la card rieng ben ngoai khoi accordion, lam trang dai hon.
- Nhom `Quan ly CV` chua can hien thi trong trang cai dat hien tai.

Cach sua:

- Chuyen `Tuy chon hien thi` thanh accordion dau tien trong khoi `Danh muc cai dat nang cao`.
- Giu cac toggle hien thi hien co va binding `displayOptions`.
- Xoa `cvManagement` khoi `openSettingsSections` va `advancedSettingSections`.
- Cap nhat `docs/architecture.md` va `docs/user-flows.md`.

File lien quan:

- `frontend/app/pages/enterprise/settings.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `Select-String -Path frontend/app/pages/enterprise/settings.vue,docs/architecture.md,docs/user-flows.md -Pattern "cvManagement|Quan ly CV|CV management"` khong con ket qua.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app/pages/enterprise/settings.vue docs/architecture.md docs/user-flows.md PROJECT_CHANGELOG.md` pass, chi co canh bao LF/CRLF tren Windows.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-27 - Them danh muc cai dat nang cao cho nha tuyen dung

Hien tuong / Yeu cau:

- Trang cai dat nha tuyen dung can them cac nhom Thong bao, Tuyen dung mac dinh, Quan ly CV va Lich phong van.
- Cac danh muc can hien thi dang dropdown lon de trang gon hon.
- Cac muc con chua su dung duoc can hien thong bao khi bam vao.

Nguyen nhan:

- Trang settings moi chi co thong tin tai khoan, tuy chon hien thi va ho so cong ty dang phat trien.
- Chua co cau truc UI de gom cac cau hinh nang cao theo nhom.

Cach sua:

- Them khoi `Danh muc cai dat nang cao` trong tab thong tin tai khoan cua `/enterprise/settings`.
- Tao 4 accordion section: Thong bao, Tuyen dung mac dinh, Quan ly CV va Lich phong van.
- Them cac muc con theo yeu cau va gan thao tac click vao `showDevelopingToast()` de khong goi API khi backend chua co tinh nang.
- Cap nhat `docs/architecture.md` va `docs/user-flows.md`.

File lien quan:

- `frontend/app/pages/enterprise/settings.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app/pages/enterprise/settings.vue docs/architecture.md docs/user-flows.md PROJECT_CHANGELOG.md` pass, chi co canh bao LF/CRLF tren Windows.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-27 - Cap nhat trang cai dat nha tuyen dung

Hien tuong / Yeu cau:

- Trang cai dat nha tuyen dung can co thong bao ro sau khi luu thay doi.
- Can bo muc/tab `Bao mat` khoi trang cai dat, giu luong doi mat khau trong thong tin tai khoan.

Nguyen nhan:

- UI dang co tab `Bao mat` rieng trong `settingTabs` trong khi cac thao tac bao mat that te da duoc dat trong man doi mat khau.
- Sau khi luu profile chi co toast, chua co thong bao trang thai nam ngay trong form cai dat.

Cach sua:

- Rut gon `SettingsTabKey` va `settingTabs` con `account` va `company`.
- Them thong bao inline `role="status"` trong form thong tin tai khoan sau khi luu thanh cong.
- Giu toast thanh cong de thong bao noi van xuat hien tren toan trang.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/pages/enterprise/settings.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app/pages/enterprise/settings.vue docs/architecture.md PROJECT_CHANGELOG.md` pass, chi co canh bao LF/CRLF tren Windows.
- `cd frontend; npm.cmd run build` lan dau gap loi cache `frontend/.nuxt/tsconfig.app.tsbuildinfo`; chay lai rieng pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-27 - Them so dien thoai lien he cho nha tuyen dung

Hien tuong / Yeu cau:

- Ho so nha tuyen dung can co truong so dien thoai lien he duoc luu that trong database.
- Dang ky doanh nghiep can gui so dien thoai lien he thay vi chi co ten cong ty, ma so thue va GPKD.
- Trang cai dat nha tuyen dung da co o so dien thoai nhung chua luu qua API that.
- Admin can xem, tim kiem va chinh sua so dien thoai lien he cua doanh nghiep.

Nguyen nhan:

- `enterprise_profiles` chua co cot `phone`.
- `RegisterEnterpriseRequest` va `AuthService.RegisterEnterprise` chua nhan/luu phone.
- Nhom route `/enterprise` chua co endpoint ho so doanh nghiep hien tai.
- `CompanyService.getProfile` con tro toi route cu `/company/profile` khong phai route runtime trong `backend/cmd/api/main.go`.
- Trang settings nha tuyen dung dang hien toast `Dang phat trien` khi bam luu thong tin tai khoan.

Cach sua:

- Them cot `phone` vao `models.EnterpriseProfile`; `AutoMigrate` se tao cot khi backend khoi dong.
- Them `phone` bat buoc vao DTO dang ky doanh nghiep, validate 10-11 chu so.
- Luu phone khi tao `enterprise_profiles`.
- Them `GET /api/v1/enterprise/profile` va `PUT /api/v1/enterprise/profile` trong enterprise route group de tai/luu ten hien thi va so dien thoai lien he.
- Doi `CompanyService` sang dung `/enterprise/profile`.
- Them input so dien thoai lien he vao form dang ky doanh nghiep.
- Noi nut `Luu thay doi` trong `/enterprise/settings` vao API cap nhat profile that.
- Them phone vao man chi tiet/chinh sua doanh nghiep trong admin va them phone vao search doanh nghiep.
- Cap nhat `docs/api.md`, `docs/database.md`, `docs/business-rules.md`, `docs/backend-runtime-flow.md`, `docs/architecture.md`, va `docs/user-flows.md`.

File lien quan:

- `backend/internal/models/enterprise_profile.go`
- `backend/internal/dto/request/register_enterprise_request.go`
- `backend/internal/services/auth_service.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/routes/enterprise_routes.go`
- `backend/internal/handlers/admin_handler.go`
- `frontend/app/components/AuthRegisterExperience.vue`
- `frontend/app/services/company.service.ts`
- `frontend/app/pages/enterprise/settings.vue`
- `frontend/app/pages/admin/enterprises.vue`
- `docs/api.md`
- `docs/database.md`
- `docs/business-rules.md`
- `docs/backend-runtime-flow.md`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `gofmt -w backend/internal/models/enterprise_profile.go backend/internal/dto/request/register_enterprise_request.go backend/internal/services/auth_service.go backend/internal/handlers/enterprise_job_handler.go backend/routes/enterprise_routes.go backend/internal/handlers/admin_handler.go` da chay.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- ...` pass, chi co canh bao LF/CRLF tren Windows.
- `cd backend; go test ./...` ban dau bi sandbox chan Go build cache trong `C:\Users\Admin\AppData\Local\go-build` voi `Access is denied`; chay lai ngoai sandbox pass.
- `cd frontend; npm.cmd run build` pass.
- Frontend build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.
