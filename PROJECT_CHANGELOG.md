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

- Chua co loi dang mo duoc ghi nhan sau cac thay doi ngay 2026-07-21.

## Da xu ly

### 2026-07-21 - Cap nhat tai lieu luong user va backend runtime

Hien tuong / Yeu cau:

- Can cap nhat changelog cho cac thay doi trong mot ngay gan nhat.
- Can co tai lieu Markdown de mo ta toan bo luong chay theo tung loai user trong he thong.
- Can co tai lieu Markdown rieng giai thich backend hoat dong ra sao khi chay `go run ./cmd/api`.
- Can rut gon `PROJECT_CHANGELOG.md` de chi con thong tin cap nhat cua ngay gan nhat.
- Can chuyen thong tin trong tai lieu flow sang tieng Viet de de doc va tranh loi hien thi chu.
- Can co mot file Markdown tong quan de nguoi khac doc vao hieu du an hien co nhung gi, luong chay ra sao va can xem source nao.

Cach sua:

- Them `docs/user-flows.md` de tong hop luong `Guest`, `STUDENT`, `ENTERPRISE` va `ADMIN`, gom route chinh, quyen han, han che, API lien quan va cac luong lien vai tro.
- Them `docs/backend-runtime-flow.md` de mo ta thu tu khoi dong backend tu `backend/cmd/api/main.go`: load config, Cloudinary, Redis/JWT, MySQL, migrate, seed, repositories/services/handlers, Fiber routes va middleware lifecycle.
- Cap nhat `README.md`, `docs/README.md` va `docs/architecture.md` de tro toi cac tai lieu moi trong reading order, document ownership va phan backend entry point.
- Rut gon `PROJECT_CHANGELOG.md` de loai bo cac muc cu truoc ngay gan nhat, giu lai quy uoc cap nhat va muc `2026-07-21`.
- Viet lai `docs/user-flows.md` bang tieng Viet co dau, giu nguyen cac role/API/status ky thuat va sua cac chuoi tieng Viet bi loi ma hoa.
- Them `docs/project-overview.md` lam tai lieu ban giao tong quan: mo ta muc tieu du an, stack, luong backend/frontend, role, tinh nang theo vai tro, workflow nghiep vu, API, database, cau truc source, gioi han hien tai va checklist debug.
- Cap nhat `README.md` va `docs/README.md` de dua `docs/project-overview.md` vao reading order va document ownership.
- Ghi ro cac source-of-truth can doc khi sua backend/runtime va khi cap nhat luong theo role.

File lien quan:

- `README.md`
- `docs/README.md`
- `docs/architecture.md`
- `docs/project-overview.md`
- `docs/user-flows.md`
- `docs/backend-runtime-flow.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- README.md docs/README.md PROJECT_CHANGELOG.md` pass, chi con canh bao LF/CRLF hien co neu Git cham file tren Windows.
- `Get-Content -Encoding UTF8 docs/user-flows.md -TotalCount 40` xac nhan noi dung flow hien dung tieng Viet co dau.
- `Get-Content -Encoding UTF8 docs/project-overview.md -TotalCount 40` xac nhan tai lieu tong quan hien dung tieng Viet co dau.
- Khong chay build/test vi thay doi nay chi cap nhat tai lieu Markdown.

Trang thai:

- Da xu ly.
