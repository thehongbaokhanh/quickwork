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

### 2026-07-16 - Tach menu ung vien nha tuyen dung thanh cac trang con

Hien tuong / Yeu cau:

- Sidebar nha tuyen dung can doi muc `Ung vien` thanh nhom co `Danh sach ung vien`, `Ung vien da luu`, `Bi tu choi`.
- Can them cac muc `Lich phong van` va `Thong bao` nhu bo cuc tham chieu.
- Can thiet ke truoc trang ung vien da luu va bi tu choi dua tren giao dien bang ung vien hien tai.

Cach sua:

- Cap nhat `enterprise` layout de gom nav ung vien thanh nhom route con va them route lich phong van/thong bao.
- Them `CandidateCollectionView` dung chung cho trang ung vien da luu va bi tu choi, dung truc tiep du lieu that tu `JobService.getEnterpriseApplications()`.
- Trang ung vien da luu chi hien thi khi API tra co saved/bookmarked; khong tao du lieu mau tren frontend.
- Them trang trong thai rong cho lich phong van va thong bao de sidebar khong bi route cut.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `frontend/app/components/enterprise/CandidateCollectionView.vue`
- `frontend/app/pages/enterprise/applications/saved.vue`
- `frontend/app/pages/enterprise/applications/rejected.vue`
- `frontend/app/pages/enterprise/interviews.vue`
- `frontend/app/pages/enterprise/notifications.vue`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check` pass, chi con canh bao CRLF san co tren Windows.

Trang thai:

- Da xu ly.

### 2026-07-16 - Tinh chinh bang ung vien va mau nut yeu thich

Hien tuong / Yeu cau:

- Bang ung vien cua nha tuyen dung bi xuong dong o cot ngay ung tuyen, trang thai va hanh dong.
- Dong phan trang "Hien thi ... ung vien" can doi thanh dieu khien so luong ung vien trong 1 trang.
- Dropdown loc trong bang can dep hon va co cuon khi danh sach dai.
- Nut tim tren giao dien viec lam sinh vien can doi sang mau do khi da yeu thich.

Cach sua:

- Them component `ScrollSelect` dung chung cho dropdown co panel cuon, hang option phang va dong bo kich thuoc voi nut goc.
- Thay cac dropdown loc va page-size trong bang ung vien bang `ScrollSelect`.
- Co dinh do rong cot ngay ung tuyen, trang thai, danh gia va hanh dong de tranh xuong dong.
- Doi trang thai favorite active sang tone do cho card viec lam, popup chi tiet viec lam va trang `/student`.

File lien quan:

- `frontend/app/components/ui/ScrollSelect.vue`
- `frontend/app/pages/enterprise/applications.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`
- `frontend/app/pages/student/index.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build frontend con canh bao cu ve duplicate `useToast`, sourcemap, deprecated trailing slash mapping va canh bao ket noi font/icon provider do moi truong chan network.

Trang thai:

- Da xu ly.

### 2026-07-16 - Sua modal nha tuyen dung bi ho lop phu phia tren

Hien tuong / Yeu cau:

- Khi mo modal trong trang nha tuyen dung, header/phia tren man hinh van bi ho va khong nam duoi lop lam mo.
- Can sua modal xem chi tiet ung tuyen va modal xem ho so ung vien de lop phu che dung toan man hinh.

Cach sua:

- Render modal sua/xem chi tiet va modal ho so ung vien bang `Teleport` ra `body` de thoat khoi stacking context cua layout.
- Tang z-index cua lop phu modal len tren header va giu `fixed inset-0` + `backdrop-blur-md`.
- Them `overscroll-contain` de han che scroll nen bi keo theo khi modal dang mo.

File lien quan:

- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/pages/enterprise/applications.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build frontend con canh bao cu ve duplicate `useToast`, sourcemap va deprecated trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Khoi phuc modal nha tuyen dung dang hop noi va lam mo toan man hinh

Hien tuong / Yeu cau:

- Can quay lai kieu modal truoc khi doi sang full-screen.
- Lop lam mo phia sau modal phai phu toan bo man hinh.

Cach sua:

- Dua modal sua tin tuyen dung, modal xem ho so ung vien va hop xac nhan ve dang hop noi co gioi han kich thuoc.
- Tang backdrop thanh `fixed inset-0` voi nen toi trong suot va `backdrop-blur-md` de lam mo toan viewport.
- Dong bo backdrop cho modal tao tin nhanh o dashboard nha tuyen dung.

File lien quan:

- `frontend/app/pages/enterprise/index.vue`
- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/pages/enterprise/applications.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build frontend con canh bao cu ve duplicate `useToast`, sourcemap va deprecated trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Chuyen modal nha tuyen dung sang full-screen

Hien tuong / Yeu cau:

- Cac modal trong khu vuc nha tuyen dung khong duoc hien thi nhu hop noi lung chung giua man hinh.
- Can thiet ke modal theo dang full-screen de khong bi cam giac lap lung va thieu khong gian thao tac.

Cach sua:

- Chuyen modal sua tin tuyen dung sang overlay full-screen voi header/footer co dinh, noi dung cuon ben trong.
- Chuyen modal xem ho so ung vien sang overlay full-screen dong bo voi modal sua tin.
- Chuyen hop xac nhan dong/hoan tac tin tuyen dung sang full-screen confirmation view.

File lien quan:

- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/pages/enterprise/applications.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build frontend con canh bao cu ve duplicate `useToast`, sourcemap va deprecated trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Lam moi modal sua tin va trang ung vien nha tuyen dung

Hien tuong / Yeu cau:

- Man chinh sua tin tuyen dung can hien thi nhu modal noi tren trang hien tai, nen phia sau chi lam mo nhe.
- Trang ung vien cua nha tuyen dung can dong bo voi giao dien dashboard trong anh mau: thong ke, bo loc, bang ung vien, hanh dong xem ho so va xu ly don.

Cach sua:

- Dieu chinh modal sua tin tuyen dung thanh overlay co `role="dialog"`, nen mo nhe, khung noi lon hon va can giua trong viewport.
- Viet lai `frontend/app/pages/enterprise/applications.vue` theo dang bang quan tri voi 5 the thong ke, bo loc theo vi tri/trang thai/ngay ung tuyen, chon dong, xuat CSV, phan trang va modal xem ho so ung vien.
- Giu nguyen cac API hien co cho danh sach ung vien va duyet/tu choi don ung tuyen.

File lien quan:

- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/pages/enterprise/applications.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build frontend con canh bao cu ve duplicate `useToast`, sourcemap va deprecated trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Chuyen don ung tuyen ve trang ung vien cua nha tuyen dung

Hien tuong / Yeu cau:

- Khi sinh vien ung tuyen, nha tuyen dung cua tin do can nhan duoc thong tin ung vien.
- Trang nha tuyen dung can co phan ung vien voi thong tin can thiet de chap nhan hoac tu choi don ung tuyen.

Cach sua:

- Mo rong `JobApplication` voi trang thai `ACCEPTED`, `REJECTED`, `employer_note` va `reviewed_at`.
- Them API doanh nghiep `GET /enterprise/applications` de lay cac don ung tuyen thuoc cac job cua doanh nghiep hien tai.
- Them API `PUT /enterprise/applications/:id/status` de nha tuyen dung chap nhan hoac tu choi don ung tuyen, kem ghi chu phan hoi.
- Them trang `frontend/app/pages/enterprise/applications.vue` hien thi danh sach ung vien, thong tin lien he, CV, ky nang, tin da ung tuyen va thao tac xu ly.
- Mo khoa menu `Ung vien` trong layout doanh nghiep va noi service frontend voi API moi.
- Cap nhat docs API, database, business rules va architecture.

File lien quan:

- `backend/internal/models/job_application.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/routes/enterprise_routes.go`
- `backend/cmd/api/main.go`
- `frontend/app/services/job.service.ts`
- `frontend/app/layouts/enterprise.vue`
- `frontend/app/pages/enterprise/applications.vue`
- `docs/api.md`
- `docs/database.md`
- `docs/business-rules.md`
- `docs/architecture.md`

Kiem tra:

- `gofmt -w ...` pass.
- `go test ./...` pass.
- `npm.cmd run build` pass.
- Build frontend con canh bao cu ve duplicate `useToast`, sourcemap va deprecated trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Them chuc nang ung tuyen va yeu thich cho sinh vien

Hien tuong / Yeu cau:

- Sinh vien can ung tuyen viec lam va luu/bo luu viec yeu thich bang du lieu that thay vi thong bao tinh nang dang phat trien.
- Trang chu va trang `/student` can phan anh trang thai da ung tuyen/da luu khi nguoi dung la sinh vien.

Cach sua:

- Them model `JobApplication` va `FavoriteJob`, migrate thanh cac bang `job_applications` va `favorite_jobs` voi unique index theo cap `student_id + job_id`.
- Them `StudentJobHandler` va route `/api/v1/student` cho job actions: xem trang thai, danh sach da ung tuyen, danh sach yeu thich, ung tuyen, luu va bo luu.
- Noi `StudentService` voi cac endpoint moi.
- Cap nhat trang `/student`, homepage job cards va popup chi tiet de goi API that, hien spinner/trang thai da luu/da ung tuyen va canh bao khi chua dang nhap hoac khong phai role `STUDENT`.
- Cap nhat docs API, database, business rules va architecture theo route/model/luong moi.

File lien quan:

- `backend/internal/models/job_application.go`
- `backend/internal/models/favorite_job.go`
- `backend/internal/handlers/student_job_handler.go`
- `backend/routes/student_routes.go`
- `backend/database/migration.go`
- `backend/cmd/api/main.go`
- `frontend/app/services/student.service.ts`
- `frontend/app/pages/student/index.vue`
- `frontend/app/composables/useHomeJobs.ts`
- `frontend/app/components/HomeLandingPage.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`
- `docs/api.md`
- `docs/database.md`
- `docs/business-rules.md`
- `docs/architecture.md`

Kiem tra:

- `gofmt -w ...` pass.
- `go test ./...` pass khi chay ngoai sandbox do Go can ghi cache trong `AppData/Local/go-build`.
- `npm.cmd run build` pass.
- Frontend khong co script `lint` hoac `typecheck` rieng trong `package.json`.

Trang thai:

- Da xu ly.

### 2026-07-16 - Lam gon thong bao gui duyet tin

Hien tuong / Yeu cau:

- Toast khi gui duyet tin tuyen dung nhin xau, noi dung dai va cam giac nang.

Cach sua:

- Rut gon noi dung toast gui duyet thanh `Da gui duyet tin` va mo ta ngan gon hon.
- Lam lai `UiToast` gon hon: card nho hon, icon nho, thanh trang thai mong tren dau va shadow mem hon.

File lien quan:

- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/components/ui/Toast.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Lam dep modal va thong bao thao tac tin tuyen dung

Hien tuong / Yeu cau:

- Nen xung quanh cua so chinh sua tin tuyen dung can mo ro hon de modal tach khoi trang.
- Cac thong bao/confirm khi nha tuyen dung luu, dong tin, gui duyet lai hoac hoan tac dang dung popup trinh duyet va can dep hon.

Cach sua:

- Tang blur/dim cho overlay cua modal chinh sua tin tuyen dung va them ring/border de cua so noi ro hon.
- Thay `alert`/`confirm` trong trang quan ly tin tuyen dung bang toast va hop xac nhan noi bo.
- Lam lai `UiToast` theo phong cach card hien dai co icon, thanh mau trang thai, shadow va z-index cao hon de hien tren modal.

File lien quan:

- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/components/ui/Toast.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Lam lai modal chinh sua tin tuyen dung doanh nghiep

Hien tuong / Yeu cau:

- Man hinh nha tuyen dung can cua so chinh sua tin dep hon va hien day du thong tin hon.
- Tin nhap can co nut dang tin tuyen dung, tin bi tu choi can co nut xin dang lai.
- Tin da dong/da xoa khong duoc hien cac thao tac dang lai, thay vao do can co nut hoan tac.

Cach sua:

- Lam lai modal chinh sua tin tuyen dung voi bo cuc lon hon, gom thong tin chinh, trang thai, ngay tao/cap nhat, ly do tu choi, mo ta va yeu cau cong viec.
- Them luong gui duyet lai bang `PUT /enterprise/jobs/:id` voi `status: "PENDING"` cho tin nhap va tin bi tu choi.
- Doi tin `CLOSED` chi hien nut hoan tac; hoan tac dua tin ve `DRAFT` bang endpoint cap nhat hien co.
- Cap nhat tai lieu API va business rules ve dong/xoa mem tin tuyen dung.

File lien quan:

- `frontend/app/pages/enterprise/jobs/index.vue`
- `docs/api.md`
- `docs/business-rules.md`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Lam mem item con trong user dropdown

Hien tuong / Yeu cau:

- Dropdown tai khoan sau khi bam icon nguoi dung con cac duong ke giua option con.
- Mau item con can dong bo hon voi khoi thong tin tai khoan chinh.

Cach sua:

- Bo border ngan cach giua cac option con trong account dropdown desktop/mobile cua `HomeHeader`.
- Doi nen item con ve trang, chu ve slate dam va hover/focus xanh nhat de hop voi phan ten/email tai khoan.

File lien quan:

- `frontend/app/components/home/HomeHeader.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-16 - Bo card rieng cho item trong user dropdown

Hien tuong / Yeu cau:

- Dropdown tai khoan sau khi bam icon nguoi dung dang hien moi option con nhu mot card/oval tach rieng.
- Can cac option trong nhom dropdown hien lien mach hon.

Cach sua:

- Doi item con trong account dropdown desktop/mobile cua `HomeHeader` tu button co border, rounded va shadow rieng sang cac dong trong mot khoi list.
- Them border ngan cach mong giua cac dong, hover/focus theo hang, khong con card rieng tung option.

File lien quan:

- `frontend/app/components/home/HomeHeader.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-15 - Gioi han dropdown loai hinh tren hero

Hien tuong / Yeu cau:

- Dropdown `Tat ca loai hinh` tren trang chu bi dai va de che noi dung ben duoi.
- Cac option dang hien nhu nhieu vien card/oval tach roi, can gom lai thanh mot menu lien mach.

Cach sua:

- Gioi han chieu cao menu `Loai hinh cong viec` trong `HomeSearchBar` de chi hien khoang 2 option va cuon de xem cac option con lai.
- Bo border/shadow/rounded rieng tung option, chi giu rounded o container va hover/focus theo dong.
- Them scrollbar nho, dong bo mau xanh nuoc cua giao dien.

File lien quan:

- `frontend/app/components/home/HomeSearchBar.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-15 - Dong bo giao dien cac dropdown

Hien tuong / Yeu cau:

- Cac thanh phan hien ra sau khi bam dropdown dang nho va khac style so voi nut ban dau.
- Can item trong dropdown co kich thuoc, bo goc, font, border va trang thai hover/focus dong bo hon.

Cach sua:

- Doi dropdown `Loai hinh cong viec` trong `HomeSearchBar` tu native select sang custom listbox de kiem soat giao dien option.
- Doi dropdown `Loc theo` trong `HomeFeaturedJobs` sang cac item cao `h-14`, rounded-2xl, co border/shadow/focus giong nut trigger.
- Dong bo item con trong account dropdown desktop/mobile cua `HomeHeader` thanh row button co border, nen, bo goc va focus state ro.
- Tang style mac dinh cua `ui/Select` len rounded-2xl, min-height va spacing dong bo voi input/button moi.

File lien quan:

- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeSearchBar.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/components/ui/Select.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-15 - Tinh gon nut hanh dong tren the viec lam

Hien tuong / Yeu cau:

- Popup chi tiet viec lam khong can nut dong `X`.
- The viec lam khong can hien chu `Chi tiet`.
- Nut yeu thich can chuyen xuong duoi de khong che phan logo va thong tin chinh.

Cach sua:

- Xoa nut dong trong `HomeJobDetailPanel`, popup tiep tuc dong theo co che hover/outside hien co cua `HomeFeaturedJobs`.
- Xoa label `Chi tiet` o footer cua `HomeJobCard`.
- Chuyen nut trai tim tu goc tren phai xuong footer sau duong ke mo cua the viec lam.

File lien quan:

- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-15 - Hien 9 viec/trang va dat popup theo title hover

Hien tuong / Yeu cau:

- Khu "Viec lam tot nhat" can hien toi da 9 viec moi trang.
- Can them du lieu that vao database de co nhieu viec hon khi su dung.
- Popup chi tiet can nam ben canh the viec lam dang hover.
- Chi khi hover vao ten nghe/viec lam thi moi hien popup.

Cach sua:

- Doi `HomeFeaturedJobs` tu `pageSize = 6` sang `pageSize = 9`.
- Bo hover/focus tren wrapper card; `HomeJobCard` chi phat preview khi hover/focus vao dong title viec lam.
- Them anchor rect tu card/title ve `HomeFeaturedJobs` de tinh `top/left` cho popup, uu tien mo ben phai card va tu dong ne mep viewport.
- Giu pause auto-pagination khi title/popup dang hover.
- Chay script Go tam de insert/update truc tiep them categories, skills, 3 doanh nghiep va 12 viec lam approved vao MySQL; script tam da bi xoa sau khi chay.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.
- Build con canh bao cu ve duplicate `useToast`, sourcemap va trailing slash mapping.

Trang thai:

- Da xu ly.

### 2026-07-15 - Doi chi tiet viec lam thanh hover preview popup

Hien tuong / Yeu cau:

- Khu "Viec lam tot nhat" tu dong chuyen trang hoi nhanh, can cham hon 1-2 giay.
- Chi tiet viec lam khong nen day layout thanh cot ben canh nua, can hien thi dang hover preview popup.
- Khi nguoi dung dang hover card viec lam hoac popup chi tiet, danh sach khong duoc tu dong chuyen trang.

Cach sua:

- Tang `autoPageDelay` cua `HomeFeaturedJobs` tu 5s len 7s.
- Doi `HomeFeaturedJobs` sang render job grid 3 cot on dinh va hien `HomeJobDetailPanel` trong popup fixed khi hover/focus/click vao card.
- Them timer dong popup ngan khi roi hover de nguoi dung co the di chuyen tu card sang popup.
- Them pause auto-pagination khi card/popup dang hover hoac preview dang mo.
- Them variant `popup` cho `HomeJobDetailPanel` de bo sticky va gioi han chieu cao hop voi popup.
- Cap nhat `HomeLandingPage` de hover mo preview ma khong tu dong scroll ve section.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`
- `frontend/app/components/HomeLandingPage.vue`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

### 2026-07-15 - Bo sung du lieu DB truc tiep va tinh chinh panel viec lam

Hien tuong / Yeu cau:

- Can them du lieu mau truc tiep vao database, khong them tiep vao `seed.go`.
- Bang doanh nghiep trong admin bi cot tin tuyen dung xuong 3-4 dong, lam hang bi cao bat thuong.
- Panel chi tiet viec lam can dong khi click ra ngoai cua so.
- Thanh cuon trong panel chi tiet khong duoc hien mui ten o dau/cuoi.

Cach sua:

- Chay script Go tam ket noi MySQL bang config hien tai de insert/update du lieu mau cho categories, skills, users, student profiles, enterprise profiles, jobs, notifications, messages va transactions.
- Xoa script tam sau khi chay; `backend/database/seed.go` khong con thay doi demo mo rong.
- Doi cot tin tuyen dung trong `admin/enterprises` thanh hang flex mot dong co pill tong so tin va thong tin da duyet/cho duyet.
- Them click-outside listener cho `HomeFeaturedJobs` de dong `HomeJobDetailPanel` khi bam ra ngoai panel.
- Them CSS an `::-webkit-scrollbar-button` va scrollbar corner cho panel chi tiet.

File lien quan:

- `frontend/app/pages/admin/enterprises.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`

Kiem tra:

- `go run direct_db_sample_data_tmp.go` trong `backend` pass va bao da insert/update direct DB sample data.
- `npm.cmd run build` pass.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

### 2026-07-15 - Can lai card viec lam tot nhat tren homepage

Hien tuong / Yeu cau:

- Trong card viec lam tot nhat, nut trai tim va khu "Chi tiet" dang nam canh nhau theo truc doc nen nhin roi va xau.
- Nut trai tim can nam o goc tren phai cua card.
- Khu "Chi tiet" can nam goc duoi phai va co duong ke mo phan tach voi thong tin phia tren.
- Thong tin chinh can nam canh logo; cac thong tin phu nhu luong, dia diem, loai hinh va badge can nam ben duoi.

Cach sua:

- Doi `HomeJobCard` tu grid 3 cot sang card flex co nut yeu thich absolute o goc tren phai.
- Tach vung logo + ten viec + cong ty o dau card.
- Gom luong, dia diem, loai hinh va badge vao nhom chip thong tin phu ben duoi.
- Them border-top mo cho hang hanh dong va dat `Chi tiet` ve goc duoi phai.
- Thu nho nut yeu thich xuong 32px, icon 16px va dat sat goc hon de khong che logo/thong tin viec lam.
- Ap dung mau vien card va chip loai hinh theo tung loai cong viec; dua chip loai hinh co icon len tren ten viec va bo badge loai hinh khong icon o phan thong tin phu.
- Rut gon ten viec xuong mot dong co tooltip title de card khong bi day thong tin.

File lien quan:

- `frontend/app/components/HomeJobCard.vue`

Kiem tra:

- `npm.cmd run build` pass.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

### 2026-07-15 - Loc va phan trang khu viec lam tot nhat tren homepage

Hien tuong / Yeu cau:

- Sau khi dang nhap, homepage khong nen tiep tuc hien khoi "Ban muon dang nhap/dang ky voi vai tro nao?".
- Khu "Viec lam tot nhat" can co dropdown loc theo dia diem, muc luong, kinh nghiem, nganh nghe va loai hinh.
- Danh sach viec lam can hien thi theo trang, moi trang 6 viec va co the tu dong chuyen trang khi nguoi dung khong tuong tac.

Cach sua:

- An `HomeCareerCta` khi `authStore.isAuthenticated` la `true`.
- Doi `HomeFeaturedJobs` thanh section co dropdown filter, chip gia tri loc, job grid 6 tin/trang, nut phan trang va timer auto-advance sau khoang idle.
- Doi `HomeJobCard` sang card ngang gon hon voi logo, thong tin chinh, tag luong/dia diem va nut trai tim yeu thich.
- Doi `useHomeJobs.bestJobs` tra danh sach da sap xep day du thay vi cat con 6 tin de pagination co du lieu that.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/components/HomeLandingPage.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/composables/useHomeJobs.ts`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

### 2026-07-14 - Doi homepage thanh trang chinh sau dang nhap va bien student thanh job board public

Hien tuong / Yeu cau:

- Trang chu can la trang chinh sau khi nguoi dung dang nhap thanh cong.
- Header trang chu can doi nut dang nhap/dang ky thanh cum icon thong bao, tin nhan, avatar va menu tai khoan khi da dang nhap.
- Trang `/student` can dong vai tro trang hien thi tat ca viec lam, dung header giong trang chu.
- Ho so va cai dat can nam trong menu thong tin nguoi dung thay vi nav rieng tren header sinh vien.

Cach sua:

- Cap nhat `HomeHeader` de doc auth store va hien thi menu tai khoan khi authenticated.
- Doi login redirect mac dinh ve `/`, van ton trong `redirect` query khi nguoi dung bi day tu route can dang nhap.
- Doi Google callback login ve `/` de dong bo voi login thuong.
- Dua link `Xem tat ca` va link nganh nghe tren homepage sang `/student`.
- Cho `/student` thanh public page trong global guard va bo middleware `student` khoi page.
- Doi layout `student` sang dung `HomeHeader` va `HomeFooter`; profile/settings chi con middleware `auth`.
- Cap nhat `docs/architecture.md` va `docs/business-rules.md`.

File lien quan:

- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeCategories.vue`
- `frontend/app/pages/student/index.vue`
- `frontend/app/layouts/student.vue`
- `frontend/app/components/AuthLoginExperience.vue`
- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/google/callback.vue`
- `frontend/app/middleware/auth.global.ts`
- `frontend/app/pages/profile.vue`
- `frontend/app/pages/settings.vue`
- `docs/architecture.md`
- `docs/business-rules.md`

Kiem tra:

- `npm.cmd run build` pass.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

### 2026-07-14 - Can lai quick stats va them panel chi tiet viec lam trang chu

Hien tuong / Yeu cau:

- Chu trong 4 o thong ke nhanh tren trang chu khong deu, co nhan bi lech len/xuong do can theo baseline.
- Khi bam chi tiet viec lam, can hien thi mot panel chi tiet nam ben canh danh sach theo co che tuong tu TopCV.

Cach sua:

- Can lai `HomeQuickStats` bang truc co dinh cho so, nhan va mo ta; bo cach can `items-baseline`.
- Them `HomeJobDetailPanel` de hien thi logo cong ty, tieu de, luong, dia diem, loai hinh, cap bac, ngay dang, mo ta va ky nang.
- Cap nhat `HomeFeaturedJobs` de danh sach co sang ben trai va panel sticky hien ben phai khi chon job.
- Cap nhat `HomeLandingPage` de luu job dang chon, dong panel khi reset/filter lam job khong con trong danh sach.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/components/home/HomeQuickStats.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/HomeLandingPage.vue`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-07-14 - Tach khoi quick stats khoi hero trang chu

Hien tuong / Yeu cau:

- Phan hero/search phia tren dang chen vao va che mot phan 4 o thong ke ben duoi tren trang chu.

Cach sua:

- Bo margin am `-mt-8` trong `HomeQuickStats`.
- Them padding rieng cho section thong ke de card nam tach bach duoi hero.

File lien quan:

- `frontend/app/components/home/HomeQuickStats.vue`

Kiem tra:

- `npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-07-14 - Dong bo logo footer va thay identity sidebar admin

Hien tuong / Yeu cau:

- Sidebar trai cua trang admin dang hien logo QuickWork nen bi lap voi top header.
- Footer trang chu, dang nhap va dang ky dung logo khac nhau; logo tren nen toi bi chim/khong dong bo.

Cach sua:

- Them `FooterBrandMark` dung wordmark QuickWork that tren nen trang de hien ro tren footer navy/dark.
- Doi `HomeFooter` va `AuthShell` cung dung `FooterBrandMark`, bo cach invert logo o auth footer.
- Doi khu identity dau sidebar admin tu logo QuickWork sang `Admin Center / QuickWork Control` voi icon shield quan tri.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/components/FooterBrandMark.vue`
- `frontend/app/components/home/HomeFooter.vue`
- `frontend/app/components/AuthShell.vue`
- `frontend/app/layouts/admin.vue`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

### 2026-07-13 - Refactor va lam moi trang chu public QuickWork

Hien tuong / Yeu cau:

- Trang chu public dang bi nang tinh dashboard, co nhieu section thong ke trung lap va role Admin tren landing page.
- Hero can sang, hien dai, khong de anh chen vao chu; search viec lam phai la trong tam.
- Can giu nguyen API, route, business logic va chi hien du lieu that tu DB.
- Can tach `HomeLandingPage.vue` lon thanh component nho de de bao tri.

Cach sua:

- Tach homepage thanh cac component trong `frontend/app/components/home/`: header, hero/search, quick stats, featured jobs, categories, employer CTA, career CTA va footer.
- Tao `frontend/app/composables/useHomeJobs.ts` de gom logic load `JobService.getAllJobs()`, map `DisplayJob`, tinh quick stats, category stats, cong ty noi bat va filter search.
- Refactor `HomeLandingPage.vue` thanh component dieu phoi, bo cac section dashboard thi truong, bieu do 7 ngay, impact stats trung lap va role `Quan tri vien`.
- Refactor `HomeJobCard.vue` gon hon, card click duoc, gioi han 2 skill va thay nut ung tuyen lon bang CTA nho `Xem chi tiet`.
- Refactor `HomeCategoryCard.vue` thanh card button co the click de ap dung filter nganh.
- Dieu chinh hero dung mot anh chinh duy nhat, grid khong de search/anh chong len nhau, tone mau trang/emerald/navy/blue nhat dong bo auth.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/components/HomeLandingPage.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/HomeCategoryCard.vue`
- `frontend/app/components/home/*.vue`
- `frontend/app/composables/useHomeJobs.ts`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.
- Browser check tai `http://127.0.0.1:3001/`: chi co 1 anh hero QuickWork, khong con dashboard thi truong, khong con role `Quan tri vien`, co cac section `featured-jobs`, `employer`, `career-tools`, va khong bi horizontal overflow o viewport 1280px.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

### 2026-07-13 - Lam moi UI dang nhap/dang ky va them route ngan

Hien tuong / Yeu cau:

- Can cai thien UI dang nhap/dang ky theo mau QuickWork sang, hien dai hon.
- Can giu nguyen auth logic, API calls va Google Login.
- Can dung component Vue tai su dung, focus/accessibility tot hon va khong de font qua dam gay cam giac loi chu.
- Can co route ngan `/login` va `/register` ben canh route cu `/auth/login` va `/auth/register`.

Cach sua:

- Tach giao dien auth thanh cac component tai su dung: brand mark, field, shell, login experience va register experience.
- Them trang `/login` va `/register`, dong thoi cho `/auth/login` va `/auth/register` render UI moi.
- Cap nhat global auth guard de `/login` va `/register` la public pages, giu redirect mac dinh cua protected route ve `/auth/login`.
- Giu nguyen cac ham dang nhap, dang ky, upload GPKD va Google config endpoint hien co.
- Giam do dam font auth tu `font-black` xuong `font-bold`/`font-semibold`; sua order responsive de mobile/tablet hien form truoc hero.
- Cap nhat `docs/architecture.md`.

File lien quan:

- `frontend/app/components/AuthBrandMark.vue`
- `frontend/app/components/AuthField.vue`
- `frontend/app/components/AuthShell.vue`
- `frontend/app/components/AuthLoginExperience.vue`
- `frontend/app/components/AuthRegisterExperience.vue`
- `frontend/app/pages/login.vue`
- `frontend/app/pages/register.vue`
- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/register.vue`
- `frontend/app/middleware/auth.global.ts`
- `docs/architecture.md`

Kiem tra:

- `npm.cmd run build` pass.
- Preview production tai `http://127.0.0.1:3000` chay thanh cong.
- HTTP status `/login`, `/register`, `/auth/login`, `/auth/register` deu tra `200`.
- Browser check xac nhan `/login` va `/register` khong bi redirect sai, form hien thi truoc hero tren viewport hep, Google button van co mat.
- Build van co cac warning cu ve duplicate `useToast`, sourcemap va dependency deprecation.

Trang thai:

- Da xu ly.

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
