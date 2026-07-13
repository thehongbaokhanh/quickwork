# QuickWork - Project Changelog and Issue Log

Ngay tao: 2026-07-09

Tai lieu nay dung de ghi lai loi, thay doi, cach sua va ket qua kiem tra cua du an QuickWork. Moi lan co sua code hoac xu ly loi quan trong, cap nhat file nay de sau nay co the dua vao NBLM/NotebookLM hoac doc lai nhanh.

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

- Chua co loi dang mo duoc ghi nhan sau cac thay doi ngay 2026-07-09.

## Da xu ly

### 2026-07-10 - Tinh chinh lai giao dien dang nhap/dang ky sat anh mau hon

Hien tuong / Yeu cau:

- Ban lam moi truoc cua trang dang nhap/dang ky van khac anh thiet ke, font qua day/khong deu va mot so mau chu/nen bi mo.
- Can phoi mau theo phong cach trang chu: trang sang, slate/navy va emerald.

Cach sua:

- Dieu chinh lai `login.vue` thanh bo cuc sang hon: header logo/pill dang ky, cot visual ben trai, card form trang ben phai va feature bar navy o day.
- Dieu chinh lai `register.vue` theo anh mau: header trang, vung loi ich ben trai, form card ben phai, tab sinh vien/doanh nghiep ro hon va stat bar navy.
- Ha cac font `font-black` trong auth ve `font-semibold`/`font-bold`, tang do tuong phan text label/body va giu mau nhan emerald.

File lien quan:

- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/register.vue`

Kiem tra:

- `npm.cmd run build` pass.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app/pages/auth/login.vue frontend/app/pages/auth/register.vue` pass.

Trang thai:

- Da xu ly.

### 2026-07-10 - Lam moi trang dang nhap/dang ky va dieu huong dung loai tai khoan

Hien tuong / Yeu cau:

- Trang dang nhap va dang ky can duoc setup lai theo anh mau sang, hien dai hon voi tone trang/xanh la/den.
- Khi bam CTA tren trang chu, `Toi la sinh vien` phai mo dung form dang ky sinh vien va `Toi la nha tuyen dung` phai mo dung form dang ky doanh nghiep.

Cach sua:

- Doi `frontend/app/pages/auth/login.vue` sang trang xac thuc full-page, co khu gioi thieu QuickWork, logo, form dang nhap, Google button va cac diem tin cay.
- Doi `frontend/app/pages/auth/register.vue` sang trang dang ky full-page voi header, khu loi ich, card form va tab Sinh vien/Doanh nghiep.
- Them doc query `role=student` / `role=enterprise` de trang dang ky tu chon dung tab.
- Doi CTA tren trang chu sang route object co query role tuong ung.

File lien quan:

- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/register.vue`
- `frontend/app/pages/index.vue`

Kiem tra:

- `npm.cmd run build` pass.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app/pages/auth/login.vue frontend/app/pages/auth/register.vue frontend/app/pages/index.vue` pass.

Trang thai:

- Da xu ly.

### 2026-07-10 - Dong bo header admin theo header doanh nghiep

Hien tuong / Yeu cau:

- Header khu admin dang khac khu doanh nghiep, gom breadcrumb/search va dropdown hover-only nen cam giac chua dong bo.

Cach sua:

- Doi top header admin sang bo cuc giong enterprise: logo QuickWork, nhan khu vuc, chip route hien tai, nut thong bao co dropdown va user menu co avatar/ten/email.
- User menu admin dung click toggle, transition va spacing/button style tuong tu header doanh nghiep.

File lien quan:

- `frontend/app/layouts/admin.vue`

Kiem tra:

- `npm.cmd run build` pass khi chay ngoai sandbox. Lan chay trong sandbox gap loi duong dan `@nuxt/icon`, khong phai loi code.

Trang thai:

- Da xu ly.

### 2026-07-10 - Gan logo QuickWork, seed du lieu mau va chuyen trang viec lam sang du lieu DB

Hien tuong / Yeu cau:

- Can dua logo QuickWork moi vao website, dung wordmark/icon theo vi tri phu hop.
- Trang chu va trang sinh vien khong duoc hien thong so/card viec lam gia; can lay cac thong so that tu DB.
- Can co du lieu mau trong database de dung thu app, gom ca file GPKD mau.
- Trang admin can dong bo hon voi theme den/xanh la va cac nut trong modal chi tiet can deu, thoang hon.

Cach sua:

- Tao bo asset logo tu anh nguoi dung cung cap va dat trong `frontend/public/images/brand/`.
- Gan logo vao header/footer public, layout student/default/auth/enterprise/admin.
- Them public API `GET /api/v1/jobs` va `GET /api/v1/jobs/:id`, chi tra job `APPROVED`.
- Mo rong job repository de preload enterprise profile, skills va ho tro filter/search public.
- Trang chu va trang sinh vien dung `JobService.getAllJobs()` de tinh job cards, thong ke, nganh nghe, cong ty noi bat, goi y va filter tu du lieu DB.
- Them seed idempotent cho admin, enterprise, student, categories, skills, approved/pending/rejected jobs va GPKD mau trong `backend/uploads/sample/`.
- Cap nhat admin layout sang theme slate/emerald va sua spacing/font nut trong footer modal chi tiet.
- Cap nhat `docs/api.md`, `docs/database.md`, `docs/architecture.md` va `docs/business-rules.md`.

File lien quan:

- `backend/cmd/api/main.go`
- `backend/database/seed.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/internal/repositories/job_repository.go`
- `backend/uploads/sample/*`
- `frontend/app/pages/index.vue`
- `frontend/app/pages/student/index.vue`
- `frontend/app/layouts/*.vue`
- `frontend/app/pages/admin/*.vue`
- `frontend/app/assets/css/main.css`
- `frontend/app/utils/jobDisplay.ts`
- `frontend/public/images/brand/*`
- `docs/api.md`
- `docs/database.md`
- `docs/architecture.md`
- `docs/business-rules.md`

Kiem tra:

- `go test ./...` pass voi `GOCACHE` trong workspace.
- `npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-07-10 - Doi theme den/xanh la va hanh vi dang phat trien cho trang tuyen dung

Hien tuong / Yeu cau:

- Cac trang can dong nhat hon ve header, footer va cach phoi mau den/xanh la nhu anh tham khao moi.
- Trang sinh vien nen gan voi bo cuc job board trong anh tham khao: hero xanh, search, filter trai, danh sach viec giua va goi y ben phai.
- Cac hanh dong chua lam duoc khong nen im lang hoac dieu huong lung tung; can hien thong bao `Tinh nang dang phat trien` nhu khu admin.

Cach sua:

- Dong bo lai student layout voi header trang, active nav xanh la, dropdown thong bao/tai khoan va footer den/xanh la gon hon.
- Lam moi trang sinh vien theo bo cuc job board day du filter, quick tag, job card, sidebar goi y va CTA ho so.
- Chuyen cac nut/hanh dong chua noi backend sang toast `Tinh nang dang phat trien`.
- Chuyen trang ho so va cai dat sinh vien sang `EmptyState` dang phat trien thay vi placeholder trang.
- Trang chu da duoc cap nhat theo he mau slate/den voi emerald/teal lam mau nhan.
- Cac layout, trang auth, admin, enterprise va shared UI control duoc doi cac tone blue/indigo/sky/cyan/purple/violet sang emerald/teal/slate de dong nhat.
- Sua cac chuoi tieng Viet bi mojibake trong qua trinh rewrite giao dien.

File lien quan:

- `frontend/app/pages/index.vue`
- `frontend/app/pages/student/index.vue`
- `frontend/app/layouts/student.vue`
- `frontend/app/pages/profile.vue`
- `frontend/app/pages/settings.vue`
- `frontend/app/layouts/*.vue`
- `frontend/app/pages/auth/*.vue`
- `frontend/app/pages/admin/*.vue`
- `frontend/app/pages/enterprise/*.vue`
- `frontend/app/components/**/*.vue`

Kiem tra:

- `npm.cmd run build` pass.
- `rg -n "blue-|indigo-|sky-|cyan-|purple-|violet-" frontend/app --glob "*.vue"` khong con ket qua.
- `rg -n "�|Chua|chua|nghi\?p|tuy\?n|duy\?t|Ch\?nh|H\?y|L\?u|S\? \?i\?n|T\? ch|M\?i|Kh\?ng|C\?p|\?ang|\?\?" frontend/app --glob "*.vue"` khong con ket qua.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app PROJECT_CHANGELOG.md` pass.

Trang thai:

- Da xu ly.

### 2026-07-10 - Lam moi giao dien trang chu va trang sinh vien theo huong job board

Hien tuong / Yeu cau:

- Can tham khao cac trang tuyen dung public nhu TopCV, VietnamWorks, ITviec, Indeed va LinkedIn Jobs.
- Trang chu va trang sinh vien can dep hon, ro tinh chat tuyen dung hon va uu tien hanh dong tim viec/ung tuyen.

Cach sua:

- Thay landing page cu bang trang chu job board co hero anh career fair, thanh tim viec, keyword trend, job card, nganh nghe, cong ty KYB va FAQ.
- Lam moi dashboard sinh vien voi search/filter dau trang, job matching, checklist ho so, pipeline ung tuyen, cong ty noi bat va modal ung tuyen nhanh.
- Cap nhat student layout de co nav viec phu hop/ho so/cai dat va dropdown thong bao gon hon.
- Them asset anh hero noi bo `frontend/public/images/quickwork-career-hero.png`.

File lien quan:

- `frontend/app/pages/index.vue`
- `frontend/app/pages/student/index.vue`
- `frontend/app/layouts/student.vue`
- `frontend/public/images/quickwork-career-hero.png`

Kiem tra:

- `npm.cmd run build` pass.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap module preload va dependency deprecation.
- Browser check `http://127.0.0.1:3000/`: hero image load thanh cong, search input hien thi, khong co console error.

Trang thai:

- Da xu ly.

### 2026-07-09 - Chan doanh nghiep chua duyet login va them sua thong tin tai khoan cho admin

Hien tuong / Yeu cau:

- Doanh nghiep chua duoc duyet dang bi day sang trang sinh vien sau khi dang nhap.
- Tai khoan bi cam hoac tam khoa can co thong bao va khong duoc vao trang.
- Admin can xem chi tiet va sua thong tin tai khoan/hoc vien/doanh nghiep.

Cach sua:

- Backend login chi cho doanh nghiep qua khi KYB `APPROVED`; `PENDING`/`REJECTED` tra 403 voi thong bao ro.
- Backend `AuthMiddleware(db)` kiem tra lai status trong DB de token cu cua tai khoan `INACTIVE`/`BANNED` bi tu choi.
- Frontend enterprise pages dung middleware `company`; student page dung middleware `student`.
- Them endpoint `PUT /api/v1/admin/users/:id` de sua email/status va profile theo role.
- Them form chinh sua trong modal chi tiet cua admin users, students va enterprises.
- Cap nhat `docs/api.md` va `docs/business-rules.md`.

File lien quan:

- `backend/internal/services/auth_service.go`
- `backend/internal/handlers/auth_handler.go`
- `backend/internal/handlers/admin_handler.go`
- `backend/internal/middlewares/auth_middleware.go`
- `backend/routes/admin_routes.go`
- `frontend/app/middleware/company.ts`
- `frontend/app/middleware/student.ts`
- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/google/callback.vue`
- `frontend/app/pages/admin/users.vue`
- `frontend/app/pages/admin/students.vue`
- `frontend/app/pages/admin/enterprises.vue`
- `frontend/app/services/admin.service.ts`
- `docs/api.md`
- `docs/business-rules.md`

Kiem tra:

- `go test ./...` pass.
- `npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-07-09 - Thiet lap AI-first documentation trong `docs/`

Hien tuong / Yeu cau:

- Can bo tai lieu Markdown mo ta kien truc, nghiep vu, API, database va quy uoc lam viec.
- Tai lieu can phu hop cach lam AI-first documentation de AI agent doc va cap nhat an toan.

Cach sua:

- Tao root `README.md` lam muc luc nhanh.
- Tao thu muc `docs/` voi cac tai lieu:
  - `docs/README.md`
  - `docs/ai-first-documentation.md`
  - `docs/architecture.md`
  - `docs/business-rules.md`
  - `docs/api.md`
  - `docs/database.md`
  - `docs/conventions.md`
- Sua `AGENTS.md` bi loi encoding va chuyen thanh bo quy tac agent ro rang.
- Cap nhat `frontend/README.md` de bo noi dung starter mac dinh va tro ve docs du an.
- Cap nhat changelog de tro den `docs/` thay vi file NBLM tam.

File lien quan:

- `README.md`
- `AGENTS.md`
- `frontend/README.md`
- `docs/README.md`
- `docs/ai-first-documentation.md`
- `docs/architecture.md`
- `docs/business-rules.md`
- `docs/api.md`
- `docs/database.md`
- `docs/conventions.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- Da doc lai danh sach file Markdown va kiem tra noi dung sau khi ghi file.

Trang thai:

- Da xu ly.

### 2026-07-09 - Them quy tac AGENTS.md cho CodeGraph + AI-first documentation

Hien tuong / Yeu cau:

- Can mot file `AGENTS.md` de quy dinh moi lan thay doi code phai dong bo tai lieu lien quan.
- Neu thay doi API/database/business logic thi can cap nhat tai lieu chuyen biet tuong ung.

Cach sua:

- Tao file `AGENTS.md` tai root repo.
- Cap nhat tai lieu du an de ghi nho quy uoc nay.
- Cap nhat `PROJECT_CHANGELOG.md` de ghi lai thay doi tai lieu.

File lien quan:

- `AGENTS.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- Da doc lai file sau khi tao/cap nhat.

Trang thai:

- Da xu ly.

### 2026-07-09 - Nuxt 404 khi xem file GPKD `/uploads/...`

Hien tuong:

- Khi admin bam xem giay phep kinh doanh, ung dung bao:
  `Page not found: /uploads/422e7f94-4150-440e-b8b9-c9d8c5c9f9da.pdf`.
- Stack trace den tu Nuxt/H3 router, tuc frontend dang xu ly `/uploads/...` nhu mot page route.

Nguyen nhan:

- DB co the luu URL file dang relative path nhu `/uploads/file.pdf`.
- Frontend mo URL nay theo origin cua Nuxt, vi du `http://localhost:3000/uploads/file.pdf`.
- Backend moi la noi serve static files `/uploads`, thuong tai `http://localhost:8080/uploads/...`.

Cach sua:

- Cap nhat `frontend/app/pages/admin/enterprises.vue`.
- Them helper resolve URL GPKD:
  - URL `http/https` thi mo truc tiep.
  - URL `//...` thi them protocol hien tai.
  - URL `/uploads/...` hoac relative path thi ghep voi backend origin lay tu `NUXT_PUBLIC_API_BASE`.
- Nut xem GPKD van check thieu file truoc khi mo; neu thieu thi hien toast canh bao va giu modal chi tiet.

File lien quan:

- `frontend/app/pages/admin/enterprises.vue`
- `frontend/nuxt.config.ts`
- `backend/cmd/api/main.go`

Kiem tra:

- `npm.cmd run build` pass.

Trang thai:

- Da xu ly. Neu sau nay van 404 tai backend origin thi can kiem tra file co ton tai trong thu muc uploads backend hay khong.

### 2026-07-09 - Bao ve tai khoan admin trong bang nguoi dung

Hien tuong / Yeu cau:

- Tai khoan admin can hien len dau bang thong tin nguoi dung.
- Cac nut/select co the thay doi thong tin hoac trang thai admin can bi loai bo.

Cach sua:

- Frontend sort danh sach hien thi bang `visibleUsers`: admin dang dang nhap len dau, cac admin khac tiep theo, cac role con lai sau do.
- Frontend thay select trang thai cua admin bang nhan `Duoc bao ve`.
- Backend chan API `PUT /admin/users/:id/status` neu user co role `ADMIN`.

File lien quan:

- `frontend/app/pages/admin/users.vue`
- `backend/internal/handlers/admin_handler.go`

Kiem tra:

- `go test ./...` pass.
- `npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-07-09 - Doanh nghiep can duyet KYB va co GPKD moi vao duoc khu doanh nghiep

Hien tuong / Yeu cau:

- Tai khoan doanh nghiep moi tao can duoc admin duyet moi vao duoc trang doanh nghiep.
- Neu chua duoc duyet, tai khoan do chi duoc vao khu sinh vien thuong.
- Doanh nghiep phai nop giay phep kinh doanh moi duoc tao tai khoan va moi co the duoc duyet.

Cach sua:

- Backend them `EnterpriseApprovedMiddleware` cho group `/enterprise`.
- Backend chi cho qua khi enterprise profile co KYB `APPROVED` va `gpkd_url` khong rong.
- Login response them metadata:
  - `enterprise_kyb_status`
  - `enterprise_approved`
  - `business_license_url`
- Frontend auth store luu metadata enterprise.
- Frontend route guard dua doanh nghiep chua duyet ve `/student`, khong vao `/enterprise`.
- Backend service reject dang ky doanh nghiep neu `gpkd_url` rong/toan khoang trang.
- Admin khong the set KYB `APPROVED` neu doanh nghiep chua co GPKD.

File lien quan:

- `backend/internal/middlewares/enterprise_kyb_middleware.go`
- `backend/cmd/api/main.go`
- `backend/internal/services/auth_service.go`
- `backend/internal/dto/response/login_response.go`
- `backend/internal/handlers/auth_handler.go`
- `backend/internal/handlers/admin_handler.go`
- `frontend/app/stores/auth.ts`
- `frontend/app/middleware/auth.global.ts`
- `frontend/app/middleware/company.ts`
- `frontend/app/middleware/student.ts`
- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/google/callback.vue`

Kiem tra:

- `go test ./...` pass.
- `npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-07-09 - Gui yeu cau doanh nghiep nop GPKD

Hien tuong / Yeu cau:

- Da co mot so tai khoan doanh nghiep chua co giay phep kinh doanh.
- Admin can gui yeu cau doanh nghiep nop GPKD thong qua tin nhan/thong bao.

Cach sua:

- Them endpoint admin:
  `POST /api/v1/admin/enterprises/:id/request-gpkd`
- Endpoint tao ban ghi:
  - `notifications`
  - `messages`
- Frontend admin enterprises table hien nut yeu cau GPKD cho doanh nghiep thieu GPKD.
- Modal chi tiet doanh nghiep cung co nut yeu cau GPKD neu thieu file.

File lien quan:

- `backend/internal/handlers/admin_handler.go`
- `backend/routes/admin_routes.go`
- `frontend/app/services/admin.service.ts`
- `frontend/app/pages/admin/enterprises.vue`
- `backend/internal/models/notification.go`
- `backend/internal/models/message.go`

Kiem tra:

- `go test ./...` pass.
- `npm.cmd run build` pass.

Trang thai:

- Da xu ly. Can co UI doc notifications/messages neu muon doanh nghiep xem truc tiep trong app thay vi chi luu DB.

## Ghi chu kiem tra gan day

Ngay 2026-07-09:

- Backend: `go test ./...` pass.
- Frontend: `npm.cmd run build` pass.
- Frontend build co warning cu:
  - Duplicate import `useToast.js` va `useToast.ts`; Nuxt dung `useToast.ts`.
  - Sourcemap warning tu plugin `nuxt:module-preload-polyfill`.
  - Dependency deprecation warning tu package export pattern.
- Cac warning tren khong chan build.
