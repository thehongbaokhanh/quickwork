# Luồng hoạt động người dùng QuickWork

Cập nhật lần cuối: 2026-07-21

Tài liệu này tóm tắt luồng hoạt động hiện tại của sản phẩm theo từng loại người dùng. Đây là góc nhìn theo vai trò, dựa trên cùng các quy tắc đang được mô tả trong `docs/architecture.md`, `docs/business-rules.md` và `docs/api.md`.

## Vai trò trong hệ thống

| Loại người dùng | Vai trò backend | Trang mặc định sau khi đăng nhập | Khu vực chính |
| --- | --- | --- | --- |
| Khách truy cập | không có | không có | `/`, `/student`, các trang đăng nhập/đăng ký |
| Sinh viên / Ứng viên | `STUDENT` | `/` nếu không có redirect hợp lệ | Trang chủ công khai và bảng việc làm |
| Nhà tuyển dụng / Doanh nghiệp | `ENTERPRISE` | `/enterprise` nếu không có redirect hợp lệ của doanh nghiệp | Bảng điều khiển nhà tuyển dụng |
| Quản trị viên | `ADMIN` | `/admin/dashboard` nếu không có redirect hợp lệ của admin | Bảng điều khiển admin |

## Luồng xác thực dùng chung

Tất cả vai trò đăng nhập đều dùng chung luồng đăng nhập và phiên làm việc cơ bản:

1. Người dùng mở `/login` hoặc `/auth/login`.
2. Form đăng nhập gửi thông tin tới `POST /api/v1/auth/login`.
3. Backend kiểm tra email, mật khẩu, trạng thái tài khoản và quy tắc truy cập theo vai trò.
4. Backend trả về access token, refresh token, role, user id, email và metadata theo vai trò.
5. Frontend lưu token và hồ sơ đăng nhập vào trạng thái đăng nhập/cookie.
6. Frontend điều hướng theo role:
   - `ADMIN` -> `/admin/dashboard`.
   - `ENTERPRISE` -> `/enterprise`.
   - `STUDENT` -> redirect hợp lệ nếu có, nếu không thì về `/`.

Google login đi qua `/auth/google/callback`, sau đó dùng cùng helper điều hướng theo role.

Quy tắc chặn truy cập:

- Tài khoản `INACTIVE` không được đăng nhập.
- Tài khoản `BANNED` không được đăng nhập.
- JWT còn hạn vẫn bị từ chối ở API protected nếu user trong database không còn trạng thái `ACTIVE`.
- Tài khoản doanh nghiệp không được hoàn tất đăng nhập nếu KYB chưa được duyệt hoặc thiếu URL GPKD/giấy phép kinh doanh.

Chức năng xác thực dùng chung:

| Chức năng | Ai dùng được | API / route |
| --- | --- | --- |
| Đăng nhập bằng email/mật khẩu | Tất cả role tài khoản | `POST /auth/login` |
| Đăng nhập/đăng ký bằng Google | Người dùng auth được hỗ trợ | `GET /auth/google/config`, `POST /auth/google` |
| Đăng xuất | Người dùng đã đăng nhập | `POST /auth/logout` |
| Đăng ký sinh viên | Khách truy cập | `POST /auth/register-student` |
| Đăng ký doanh nghiệp | Khách truy cập | `POST /auth/register-enterprise` |
| Upload GPKD/giấy phép kinh doanh | Luồng đăng ký doanh nghiệp | `POST /auth/upload` |
| Tạo admin đầu tiên | Thiết lập hệ thống | `POST /auth/register-admin` |

## Khách truy cập

Khách truy cập là người chưa đăng nhập.

Điểm vào chính:

- `/`: trang chủ công khai.
- `/student`: bảng tất cả việc làm công khai.
- `/login`, `/auth/login`: trang đăng nhập.
- `/register`, `/auth/register`: trang đăng ký.
- `/forgot-password`: giao diện khôi phục mật khẩu.

Khách truy cập có thể:

- Xem trang chủ công khai.
- Xem các tin tuyển dụng đã được duyệt.
- Tìm kiếm/lọc việc làm theo từ khóa, địa điểm, mức lương, kinh nghiệm, ngành nghề và loại hình nếu UI có hiển thị bộ lọc đó.
- Mở giao diện xem nhanh hoặc chi tiết việc làm trên trang chủ và bảng việc làm.
- Đi tới bảng tất cả việc làm từ các liên kết trên trang chủ.
- Đăng ký tài khoản sinh viên.
- Đăng ký tài khoản doanh nghiệp và nộp GPKD/giấy phép kinh doanh.
- Bắt đầu luồng đăng nhập Google.
- Dùng các liên kết điều hướng/footer công khai.

Khách truy cập bị hạn chế:

- Không thể ứng tuyển việc làm.
- Không thể lưu/yêu thích việc làm.
- Không thể vào các trang chỉ dành cho sinh viên đã đăng nhập.
- Không thể vào trang doanh nghiệp.
- Không thể vào trang admin.
- Nếu bấm ứng tuyển/lưu/yêu thích, UI phải nhắc người dùng đăng nhập.

API công khai liên quan:

| Chức năng | API |
| --- | --- |
| Lấy danh sách việc làm công khai | `GET /jobs` |
| Lấy chi tiết việc làm công khai | `GET /jobs/:id` |

Quy tắc hiển thị việc làm công khai:

- Chỉ trả về việc làm có trạng thái `APPROVED` và `slots > 0`.
- Việc làm ở trạng thái `DRAFT`, `PENDING`, `REJECTED` hoặc `CLOSED` không xuất hiện trong danh sách công khai.

## Sinh viên / Ứng viên

Tài khoản sinh viên có role `STUDENT`.

Luồng truy cập:

1. Sinh viên đăng ký tài khoản sinh viên hoặc đăng nhập bằng tài khoản đã có.
2. Backend kiểm tra trạng thái tài khoản.
3. Sau khi đăng nhập thành công, sinh viên về `/` nếu không đi từ một redirect hợp lệ.
4. Trang chủ công khai và bảng `/student` bật các hành động dành cho sinh viên như ứng tuyển và lưu việc.

Route chính:

| Route | Mục đích |
| --- | --- |
| `/` | Trang chủ có việc làm công khai, hành động sinh viên và dropdown hồ sơ trên header |
| `/student` | Bảng tất cả việc làm công khai, dùng cùng header/footer với trang chủ |
| `/profile` | Trang hồ sơ tài khoản, mở từ dropdown người dùng |
| `/settings` | Trang cài đặt tài khoản, mở từ dropdown người dùng |

Sinh viên có thể:

- Xem việc làm công khai trên trang chủ và `/student`.
- Tìm kiếm/lọc việc làm.
- Xem chi tiết việc làm.
- Ứng tuyển vào việc làm.
- Lưu/yêu thích việc làm.
- Bỏ lưu/bỏ yêu thích việc làm.
- Xem trạng thái đã ứng tuyển và đã lưu của các việc làm.
- Xem danh sách việc đã ứng tuyển.
- Xem danh sách việc đã yêu thích.
- Vào hồ sơ và cài đặt từ dropdown người dùng.
- Nhận thông báo do doanh nghiệp tạo khi đặt lịch phỏng vấn hoặc xử lý kết quả phỏng vấn.

Quy tắc hành động việc làm của sinh viên:

- Ứng tuyển yêu cầu người dùng đã đăng nhập với role `STUDENT`.
- Lưu/yêu thích việc làm yêu cầu người dùng đã đăng nhập với role `STUDENT`.
- Sinh viên chỉ được ứng tuyển hoặc lưu việc làm có trạng thái `APPROVED` và `slots > 0`.
- Một sinh viên chỉ được ứng tuyển một lần cho cùng một việc làm.
- Một sinh viên chỉ được lưu/yêu thích một lần cho cùng một việc làm.
- Nếu gửi lại request ứng tuyển/lưu cho cùng một cặp sinh viên-việc làm, backend trả về bản ghi đã có thay vì tạo trùng.
- Đơn ứng tuyển mới bắt đầu ở trạng thái `APPLIED`.
- Đơn ứng tuyển chỉ hiển thị với doanh nghiệp sở hữu tin tuyển dụng đó.

API của sinh viên:

| Chức năng | API |
| --- | --- |
| Lấy id việc đã ứng tuyển và đã lưu | `GET /student/job-actions` |
| Lấy danh sách việc đã ứng tuyển | `GET /student/applied-jobs` |
| Lấy danh sách việc đã yêu thích | `GET /student/favorite-jobs` |
| Ứng tuyển việc làm | `POST /student/jobs/:id/apply` |
| Lưu/yêu thích việc làm | `POST /student/jobs/:id/favorite` |
| Bỏ lưu/bỏ yêu thích việc làm | `DELETE /student/jobs/:id/favorite` |

Các method service của sinh viên đang có nhưng cần kiểm tra runtime route trước khi dựa vào:

- `StudentService.getProfile()`
- `StudentService.updateProfile()`

## Nhà tuyển dụng / Doanh nghiệp

Tài khoản doanh nghiệp có role `ENTERPRISE`.

Luồng đăng ký và truy cập:

1. Doanh nghiệp đăng ký bằng email, mật khẩu, tên công ty, số điện thoại liên hệ, mã số thuế và URL GPKD.
2. Backend tạo user với role `ENTERPRISE`.
3. Backend tạo hồ sơ doanh nghiệp với KYB status `PENDING`.
4. Doanh nghiệp không thể hoàn tất đăng nhập khi KYB còn chờ duyệt hoặc bị từ chối.
5. Admin kiểm tra KYB và GPKD.
6. Sau khi được duyệt, doanh nghiệp đăng nhập và được điều hướng tới `/enterprise`.
7. Tất cả API doanh nghiệp yêu cầu đăng nhập, role `ENTERPRISE`, KYB `APPROVED` và GPKD không rỗng.

Route chính của doanh nghiệp:

| Route | Mục đích |
| --- | --- |
| `/enterprise` | Bảng điều khiển tổng quan nhà tuyển dụng |
| `/enterprise/jobs` | Quản lý tin tuyển dụng |
| `/enterprise/jobs/create` | Tạo tin tuyển dụng mới |
| `/enterprise/applications` | Danh sách ứng viên chính |
| `/enterprise/applications?view=saved` | Màn hình ứng viên đã lưu |
| `/enterprise/applications?view=rejected` | Màn hình ứng viên bị từ chối |
| `/enterprise/applications/saved` | Điều hướng tương thích về `view=saved` |
| `/enterprise/applications/rejected` | Điều hướng tương thích về `view=rejected` |
| `/enterprise/interviews` | Lịch phỏng vấn và xử lý kết quả phỏng vấn |
| `/enterprise/notifications` | Trang thông báo của doanh nghiệp |
| `/enterprise/settings` | Cài đặt tài khoản, đổi mật khẩu, cập nhật tên hiển thị và số điện thoại liên hệ |

Doanh nghiệp có thể làm trên bảng điều khiển:

- Xem dữ liệu hệ thống thuộc tài khoản doanh nghiệp.
- Theo dõi số lượng tin theo trạng thái.
- Xem tin tuyển dụng hiện tại/gần đây.
- Tạo tin mới từ dashboard hoặc trang quản lý tin.
- Điều hướng tới quản lý tin, ứng viên, lịch phỏng vấn và thông báo.
- Cập nhật tên hiển thị và số điện thoại liên hệ trong trang cài đặt.
- Mở các nhóm cài đặt nâng cao dạng dropdown trong trang cài đặt:
  - Tùy chọn hiển thị.
  - Thông báo.
  - Tuyển dụng mặc định.
  - Lịch phỏng vấn.
- Các tùy chọn hiển thị dùng toggle ngay trong dropdown nâng cao.
- Các mục con chưa có tính năng trong nhóm cài đặt nâng cao chỉ hiển thị thông báo `Đang phát triển` khi bấm vào và chưa gọi API.

Doanh nghiệp có thể làm với tin tuyển dụng:

- Tạo tin tuyển dụng.
- Lưu tin ở trạng thái `DRAFT`.
- Gửi tin ở trạng thái `PENDING` để admin duyệt.
- Xem danh sách tin của chính doanh nghiệp.
- Tìm kiếm/lọc tin theo trạng thái và nội dung nếu UI có hỗ trợ.
- Chỉnh sửa các trường:
  - tiêu đề,
  - mô tả,
  - yêu cầu,
  - mức lương,
  - địa điểm,
  - số lượng tuyển dụng,
  - trạng thái nếu luồng xử lý cho phép.
- Gửi tin nháp đi duyệt bằng cách đổi trạng thái sang `PENDING`.
- Xin đăng lại tin bị từ chối bằng cách đổi trạng thái về `PENDING`.
- Đóng/xóa tin, thực chất là đổi trạng thái sang `CLOSED` thay vì xóa cứng khỏi database.
- Khôi phục tin đã đóng về `DRAFT` trước khi chỉnh sửa hoặc gửi duyệt lại.

Luồng trạng thái tin tuyển dụng:

```text
DRAFT -> PENDING -> APPROVED -> hiển thị công khai
                 -> REJECTED -> chỉnh sửa -> PENDING
APPROVED -> CLOSED
CLOSED -> DRAFT -> PENDING
```

Quy tắc quan trọng của tin tuyển dụng:

- Danh sách công khai chỉ hiển thị tin `APPROVED` và `slots > 0`.
- Tin đã đóng không nên hiển thị hành động sửa, đăng lại hoặc đóng tiếp trong UI doanh nghiệp.
- Tin đã đóng có thể được khôi phục về `DRAFT`.
- Khi kết quả phỏng vấn `HIRED` làm `slots` giảm về `0`, tin tuyển dụng chuyển sang `CLOSED`.

Doanh nghiệp có thể làm với đơn ứng tuyển:

- Xem tất cả đơn ứng tuyển vào các tin của doanh nghiệp.
- Lọc đơn theo trạng thái và tin tuyển dụng.
- Xem chi tiết ứng viên.
- Chấp nhận đơn ứng tuyển.
- Từ chối đơn ứng tuyển.
- Lưu ghi chú/phản hồi của nhà tuyển dụng khi xử lý đơn.
- Đặt hoặc cập nhật lịch phỏng vấn sau khi đơn đã được chấp nhận.
- Xem bảng điều khiển ứng viên đã lưu.
- Xem bảng điều khiển ứng viên bị từ chối.
- Xuất danh sách ứng viên đang hiển thị ở màn hình đã lưu/bị từ chối.
- Hover/focus vào thông tin bị rút gọn trong bảng để xem đầy đủ.
- Mở modal hồ sơ ứng viên.

Luồng trạng thái đơn ứng tuyển:

```text
Sinh viên ứng tuyển -> APPLIED
Doanh nghiệp chấp nhận -> ACCEPTED
Doanh nghiệp từ chối -> REJECTED
ACCEPTED + đặt lịch phỏng vấn -> lưu thông tin lịch phỏng vấn
Sau thời gian phỏng vấn -> HIRED / REJECTED / NO_SHOW
```

Hành vi của màn hình ứng viên đã lưu:

- Màn hình ứng viên đã lưu được render trong `/enterprise/applications?view=saved`.
- Dữ liệu lấy từ `GET /enterprise/applications`.
- Bao gồm đơn có cờ saved/bookmarked được lưu thực tế.
- Bao gồm cả đơn có `interview_result = HIRED`.
- Ứng viên được nhận sau phỏng vấn hiển thị nguồn là `Được nhận` và nhãn ngày là `Ngày lưu/nhận`.
- Frontend không tự tạo ứng viên tạm.

Hành vi của màn hình ứng viên bị từ chối:

- Màn hình ứng viên bị từ chối được render trong `/enterprise/applications?view=rejected`.
- Dữ liệu lấy từ `GET /enterprise/applications`.
- Hiển thị các đơn có application status `REJECTED`.
- Lý do từ chối được gom/hiển thị từ metadata từ chối hoặc ghi chú của nhà tuyển dụng.

Doanh nghiệp có thể đặt lịch phỏng vấn:

- Chỉ được đặt lịch cho đơn `ACCEPTED`.
- Lưu thời gian phỏng vấn.
- Lưu hình thức phỏng vấn:
  - online,
  - offline,
  - phone,
  - hybrid.
- Lưu địa điểm/link phỏng vấn.
- Lưu ghi chú phỏng vấn.
- Tạo thông báo cho sinh viên sau khi đặt lịch.

Trang lịch phỏng vấn có thể:

- Xem các thẻ thống kê lịch phỏng vấn.
- Xem danh sách lịch phỏng vấn.
- Lọc lịch theo:
  - `Đang theo dõi`,
  - `Chờ xử lý`,
  - `Sắp tới`,
  - `Đã xử lý`,
  - `Tất cả`.
- Ẩn lịch đã xử lý khỏi danh sách mặc định.
- Dùng vùng cuộn riêng khi danh sách hiển thị có từ 6 mục trở lên.
- Mở modal chi tiết lịch phỏng vấn.
- Trước thời gian phỏng vấn, chỉ được xem chi tiết.
- Sau thời gian phỏng vấn, được gửi kết quả cuối:
  - `HIRED`,
  - `REJECTED`,
  - `NO_SHOW`.
- Bắt buộc nhập ghi chú nếu kết quả cuối là `REJECTED`.

Ảnh hưởng nghiệp vụ của kết quả phỏng vấn:

- Kết quả chỉ được lưu một lần.
- `HIRED` giảm `slots` của tin liên quan trong transaction.
- Nếu `slots` về `0`, tin chuyển sang `CLOSED`.
- Gửi kết quả tạo thông báo cho sinh viên.
- Đơn có kết quả `HIRED` xuất hiện trong màn hình ứng viên đã lưu của doanh nghiệp.

API của doanh nghiệp:

| Chức năng | API |
| --- | --- |
| Lấy danh sách tin của doanh nghiệp | `GET /enterprise/jobs/` |
| Tạo tin tuyển dụng | `POST /enterprise/jobs/` |
| Cập nhật tin tuyển dụng | `PUT /enterprise/jobs/:id` |
| Đóng/xóa tin tuyển dụng | `DELETE /enterprise/jobs/:id` |
| Lấy danh sách đơn ứng tuyển | `GET /enterprise/applications` |
| Chấp nhận/từ chối đơn ứng tuyển | `PUT /enterprise/applications/:id/status` |
| Đặt/cập nhật lịch phỏng vấn | `PUT /enterprise/applications/:id/interview` |
| Gửi kết quả phỏng vấn | `PUT /enterprise/applications/:id/interview-result` |
| Lấy hồ sơ doanh nghiệp hiện tại | `GET /enterprise/profile` |
| Cập nhật tên hiển thị và số điện thoại liên hệ | `PUT /enterprise/profile` |

Các mục sidebar doanh nghiệp đang có nhưng còn ở trạng thái sắp phát triển/giới hạn nếu UI đánh dấu như vậy:

- Hồ sơ công ty.
- Cài đặt.

## Quản trị viên

Tài khoản admin có role `ADMIN`.

Luồng truy cập:

1. Admin đầu tiên có thể được tạo qua endpoint đăng ký admin đầu tiên với `ADMIN_SECRET`.
2. Admin đăng nhập bằng email/mật khẩu.
3. Sau khi đăng nhập, frontend điều hướng tới `/admin/dashboard`.
4. Trang admin yêu cầu phiên đăng nhập và role `ADMIN`.
5. Người dùng không phải admin nếu cố vào trang admin sẽ bị điều hướng tới `/403`.

Route chính của admin:

| Route | Mục đích |
| --- | --- |
| `/admin/dashboard` | Thống kê bảng điều khiển, người dùng gần đây, tin chờ duyệt |
| `/admin/users` | Quản lý toàn bộ người dùng |
| `/admin/students` | Quản lý tài khoản/hồ sơ sinh viên |
| `/admin/enterprises` | Quản lý tài khoản doanh nghiệp, KYB và GPKD |
| `/admin/jobs` và `/admin/jobs/index` | Duyệt tin tuyển dụng |
| `/admin/applications` | Trang tạm: quản lý đơn ứng tuyển đang phát triển |
| `/admin/categories` | Trang tạm: quản lý ngành nghề đang phát triển |
| `/admin/reports` | Trang tạm: báo cáo/thống kê đang phát triển |
| `/admin/settings` | Trang tạm: cài đặt hệ thống đang phát triển |

Admin có thể làm trên bảng điều khiển:

- Xem tổng số sinh viên.
- Xem tổng số doanh nghiệp.
- Xem số tin đang hoạt động đã được duyệt.
- Xem số tin chờ duyệt.
- Xem các thẻ người dùng gần đây theo loại tài khoản:
  - tất cả,
  - admin,
  - sinh viên,
  - doanh nghiệp.
- Xem hoạt động người dùng gần đây.
- Xem thông báo tin tuyển dụng chờ duyệt.
- Điều hướng tới các trang quản lý.

Admin có thể quản lý người dùng:

- Xem danh sách tất cả người dùng.
- Lọc người dùng theo role.
- Lọc người dùng theo trạng thái tài khoản.
- Tìm kiếm người dùng.
- Xem chi tiết người dùng.
- Sửa email tài khoản không phải admin.
- Sửa trạng thái tài khoản không phải admin:
  - `ACTIVE`,
  - `INACTIVE`,
  - `BANNED`.
- Sửa dữ liệu hồ sơ theo role thông qua endpoint cập nhật user thống nhất.
- Tài khoản admin được bảo vệ:
  - frontend không nên hiển thị control đổi trạng thái cho admin,
  - backend từ chối đổi trạng thái đối với user có role `ADMIN`.

Admin có thể quản lý sinh viên:

- Xem danh sách tài khoản sinh viên.
- Tìm kiếm/lọc sinh viên.
- Xem chi tiết sinh viên.
- Cập nhật trạng thái tài khoản sinh viên.
- Sửa email sinh viên.
- Sửa các trường hồ sơ sinh viên:
  - tên,
  - số điện thoại,
  - URL avatar,
  - URL CV.
- Xem các chỉ số hoàn thiện hồ sơ:
  - có hồ sơ,
  - có số điện thoại,
  - có kỹ năng,
  - có CV.

Admin có thể quản lý doanh nghiệp:

- Xem danh sách tài khoản doanh nghiệp.
- Tìm kiếm/lọc doanh nghiệp theo KYB và trạng thái tài khoản.
- Xem chi tiết doanh nghiệp.
- Cập nhật trạng thái tài khoản doanh nghiệp.
- Sửa email doanh nghiệp.
- Sửa các trường hồ sơ doanh nghiệp:
  - tên công ty,
  - số điện thoại liên hệ,
  - mã số thuế,
  - URL GPKD,
  - trạng thái KYB.
- Xem file GPKD/giấy phép kinh doanh.
- Yêu cầu doanh nghiệp nộp GPKD.
- Duyệt KYB doanh nghiệp.
- Từ chối KYB doanh nghiệp.
- Đưa KYB về trạng thái chờ duyệt.
- Xem số lượng tin tuyển dụng của doanh nghiệp:
  - tổng,
  - đã duyệt,
  - chờ duyệt,
  - bị từ chối,
  - đã đóng,
  - bản nháp.

Quy tắc admin với KYB doanh nghiệp:

- Admin không được duyệt KYB nếu URL GPKD trống.
- Khi yêu cầu nộp GPKD, backend tạo bản ghi trong `notifications` và `messages`.
- Nếu `kyb_status` trống, backend fallback sang `status_kyb`.

Admin có thể duyệt tin tuyển dụng:

- Xem danh sách tin chờ duyệt.
- Mở modal duyệt tin.
- Duyệt tin chờ duyệt.
- Từ chối tin chờ duyệt.
- Thêm lý do từ chối khi từ chối tin.
- Khi duyệt không phải trạng thái từ chối, backend xóa `reject_reason`.

API của admin:

| Chức năng | API |
| --- | --- |
| Lấy thống kê dashboard | `GET /admin/dashboard/stats` |
| Lấy người dùng gần đây | `GET /admin/users/recent` |
| Lấy danh sách người dùng | `GET /admin/users` |
| Lấy danh sách sinh viên | `GET /admin/students` |
| Lấy danh sách doanh nghiệp | `GET /admin/enterprises` |
| Cập nhật user/hồ sơ | `PUT /admin/users/:id` |
| Cập nhật trạng thái user | `PUT /admin/users/:id/status` |
| Cập nhật KYB doanh nghiệp | `PUT /admin/enterprises/:id/kyb` |
| Yêu cầu nộp GPKD | `POST /admin/enterprises/:id/request-gpkd` |
| Lấy danh sách tin để duyệt | `GET /admin/jobs` |
| Duyệt/từ chối tin | `PUT /admin/jobs/:id/review` |

## Tóm tắt luồng liên vai trò

```text
Khách xem việc làm
  -> đăng ký/đăng nhập với role STUDENT
  -> ứng tuyển việc làm đã duyệt
  -> đơn ứng tuyển chuyển thành APPLIED

Doanh nghiệp đăng ký
  -> chờ admin duyệt KYB
  -> đăng nhập sau khi được duyệt
  -> tạo tin ở trạng thái DRAFT hoặc PENDING
  -> admin duyệt tin
  -> tin hiển thị công khai nếu APPROVED và slots > 0

Doanh nghiệp xử lý đơn ứng tuyển
  -> ACCEPTED hoặc REJECTED
  -> đơn ACCEPTED có thể được đặt lịch phỏng vấn
  -> sau thời gian phỏng vấn, kết quả là HIRED / REJECTED / NO_SHOW
  -> HIRED làm giảm slots
  -> slots = 0 thì tin tuyển dụng đóng
  -> sinh viên nhận thông báo về lịch/kết quả phỏng vấn
```

## Bảng trạng thái tham chiếu

Trạng thái người dùng:

- `ACTIVE`: được đăng nhập và dùng API protected.
- `INACTIVE`: không được đăng nhập; request protected hiện có cũng bị từ chối.
- `BANNED`: không được đăng nhập; request protected hiện có cũng bị từ chối.

Trạng thái KYB doanh nghiệp:

- `PENDING`: chờ admin duyệt, chưa được hoàn tất đăng nhập doanh nghiệp.
- `APPROVED`: được vào khu doanh nghiệp nếu có GPKD.
- `REJECTED`: không được hoàn tất đăng nhập doanh nghiệp.

Trạng thái tin tuyển dụng:

- `DRAFT`: bản nháp của doanh nghiệp.
- `PENDING`: chờ admin duyệt.
- `APPROVED`: hiển thị công khai nếu `slots > 0`.
- `REJECTED`: cần chỉnh sửa và gửi lại.
- `CLOSED`: không còn công khai và không nhận đơn ứng tuyển mới.

Trạng thái đơn ứng tuyển:

- `APPLIED`: sinh viên đã nộp đơn, chờ doanh nghiệp xử lý.
- `ACCEPTED`: doanh nghiệp đã chấp nhận đơn, có thể đặt lịch phỏng vấn.
- `REJECTED`: doanh nghiệp đã từ chối đơn.

Kết quả phỏng vấn:

- `HIRED`: ứng viên được nhận sau phỏng vấn.
- `REJECTED`: ứng viên không được nhận sau phỏng vấn; bắt buộc có ghi chú.
- `NO_SHOW`: ứng viên không đến phỏng vấn.

## Nguồn tham chiếu chính

Khi cập nhật tài liệu này, đối chiếu các file sau:

- Route runtime: `backend/cmd/api/main.go`
- Auth backend và quy tắc nghiệp vụ: `backend/internal/services/auth_service.go`
- Tin tuyển dụng/đơn ứng tuyển phía doanh nghiệp: `backend/internal/handlers/enterprise_job_handler.go`
- Admin backend: `backend/internal/handlers/admin_handler.go`
- Service API phía frontend: `frontend/app/services/*.ts`
- Điều hướng sau đăng nhập: `frontend/app/utils/authRedirect.ts`
- Guard route phía frontend: `frontend/app/middleware/*.ts`
- Layout/trang theo role:
  - `frontend/app/pages/index.vue`
  - `frontend/app/pages/student/index.vue`
  - `frontend/app/pages/enterprise/**/*.vue`
  - `frontend/app/pages/admin/**/*.vue`
