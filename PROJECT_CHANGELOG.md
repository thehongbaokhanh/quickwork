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
- Khi thay doi kien truc/route/model/luong nghiep vu, dong thoi cap nhat `NBLM_PROJECT_CONTEXT.md`.

## Dang mo / Can theo doi

- Chua co loi dang mo duoc ghi nhan sau cac thay doi ngay 2026-07-09.

## Da xu ly

### 2026-07-09 - Them quy tac AGENTS.md cho CodeGraph + AI-first documentation

Hien tuong / Yeu cau:

- Can mot file `AGENTS.md` de quy dinh moi lan thay doi code phai dong bo tai lieu lien quan.
- Neu thay doi API/database/business logic thi can cap nhat tai lieu chuyen biet tuong ung.

Cach sua:

- Tao file `AGENTS.md` tai root repo.
- Cap nhat `NBLM_PROJECT_CONTEXT.md` de ghi nho quy uoc nay.
- Cap nhat `PROJECT_CHANGELOG.md` de ghi lai thay doi tai lieu.

File lien quan:

- `AGENTS.md`
- `NBLM_PROJECT_CONTEXT.md`
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
