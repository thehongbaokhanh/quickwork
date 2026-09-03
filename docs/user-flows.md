# Luồng hoạt động người dùng QuickWork

## Enterprise profile media update (2026-08-13)

- Enterprise users can pick or drag/drop GPKD, logo, and cover images, preview images, upload through the existing Cloudinary flow, then save the profile so URLs survive navigation and refresh.
- Industry, company size, and work model have backend storage but still show a developing-feature notice in the frontend.
- Enterprise Message Center now exposes only All, Unread, and Archived filters; the Waiting-for-response UI state was removed without changing conversation data.
- Company profile shows persisted industry/size/work-model values above a full-width location/map card, and an unclipped cover/logo hero. Each editable facts/location section has its own cancel/save actions, summary chips include semantic icons, and the legal-information upload card is no longer shown on this page. Business location search follows country → province/city → district → ward dependencies, filters out non-administrative results, resets descendants when a parent changes, and validates ownership before save. Satellite-map click/drag is reverse-geocoded from structured address components and the preview keeps canonical detail-to-country order.
- Student personal profile uses persisted profile data for its completion score and supports editing skills, work experience, education, CV, and portfolio instead of development-only placeholders.

## Cập nhật luồng ENTERPRISE và KYB (2026-07-29)

- Mọi tài khoản `ENTERPRISE` có trạng thái user `ACTIVE` đều đăng nhập được và được vào dashboard `/enterprise`.
- Chỉ doanh nghiệp có KYB `APPROVED` mới dùng được các chức năng quan trọng như đăng việc, quản lý tin tuyển dụng, ứng viên và lịch phỏng vấn.
- Doanh nghiệp `PENDING` thấy thông báo hồ sơ đang chờ admin duyệt trên dashboard.
- Doanh nghiệp `REJECTED` thấy lý do từ chối lấy từ `enterprise_profiles.kyb_reject_reason` và có nút gửi lại hồ sơ qua trang cài đặt/GPKD.
- Khi doanh nghiệp chưa được duyệt cố mở `/enterprise/jobs`, `/enterprise/jobs/create`, `/enterprise/applications` hoặc `/enterprise/interviews`, frontend chuyển về dashboard và hiển thị cảnh báo KYB.
- Sidebar doanh nghiệp giữ trạng thái thu gọn/mở rộng và trạng thái nhóm Ứng viên trong trình duyệt. Hồ sơ công ty được mở từ tab trong `/enterprise/settings`, không còn mục sidebar trùng lặp.
- Tab Hồ sơ công ty cập nhật các trường backend hiện hỗ trợ gồm tên công ty, số điện thoại và URL GPKD; trường mở rộng chưa có API hiển thị thông báo đang phát triển thay vì giả lập lưu dữ liệu.
- Trung tâm hội thoại desktop giữ ba cột trong chiều cao viewport; danh sách, nội dung chat và thông tin ứng viên cuộn độc lập, trong khi ô soạn tin cố định ở đáy cột chat.

Cập nhật lần cuối: 2026-07-29

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
- Tài khoản doanh nghiệp vẫn hoàn tất đăng nhập khi KYB `PENDING` hoặc `REJECTED`; chỉ các chức năng tuyển dụng quan trọng bị khóa cho đến khi KYB `APPROVED` và có GPKD.

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
- `/jobs/:id`: trang chi tiết đầy đủ của một việc làm công khai.
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
- Nếu bấm ứng tuyển, lưu/yêu thích, xem việc đã lưu hoặc mở tin nhắn từ bề mặt công khai, UI chỉ hiển thị cảnh báo cần đăng nhập và giữ nguyên trang hiện tại; người dùng chủ động chọn đăng nhập khi cần.

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
4. Trang chủ gọi `GET /student/job-recommendations` để hiển thị việc làm theo hồ sơ; nếu API cá nhân hóa lỗi thì tự động dùng danh sách công khai. Bảng `/student` vẫn là bảng việc làm công khai.

Route chính:

| Route | Mục đích |
| --- | --- |
| `/` | Trang chủ có việc làm công khai, hành động sinh viên và dropdown hồ sơ trên header |
| `/student` | Bảng việc làm ba cột với hero tìm kiếm, bộ lọc trái, thẻ việc làm ở giữa và xem nhanh việc đã lưu bên phải; phân trang tối đa 5 việc mỗi trang, còn `?view=saved` chỉ hiện việc sinh viên đã lưu |
| `/jobs/:id` | Trang chi tiết việc làm công khai, mở khi bấm tên việc làm từ trang chủ hoặc bảng `/student` |
| `/student/applications` | Trang theo dõi đơn ứng tuyển với thống kê trạng thái, tìm kiếm/lọc, timeline xét duyệt-phỏng vấn-kết quả và chi tiết phản hồi thật |
| `/student/messages` | Trang tin nhắn sinh viên, dùng shell có sidebar nhóm, header thông báo/tin nhắn và dữ liệu hội thoại thật từ API |
| `/profile` | Hồ sơ cá nhân dạng cover + bento, tải dữ liệu thật từ `student_profile`; cho phép sửa thông tin cơ bản, kỹ năng theo nhóm danh mục, CRUD kinh nghiệm/học vấn/portfolio, kéo-thả hoặc chọn CV, xem/xóa CV và chia sẻ hồ sơ. Các nút thêm/sửa/xóa dùng icon-only gọn, có tooltip và trạng thái hover/focus đổi màu nổi bật; khoảng thời gian kinh nghiệm/học vấn được hiển thị ngắn theo `dd/mm/yy – dd/mm/yy`. Độ mạnh hồ sơ được tính lại từ dữ liệu đã persist. |
| `/settings` | Trang cài đặt sinh viên với bốn mục: tài khoản, bảo mật, tùy chọn tìm việc và quyền riêng tư; dữ liệu được tải/lưu qua API hồ sơ và đổi mật khẩu bảo vệ |

The homepage account dropdown groups the requested real destinations: saved jobs (`/student?view=saved`), applications (`/student/applications`), matching jobs (`/student`), profile (`/profile`), and the four account/security/job/privacy settings panels through `/settings?section=...`. Its three headings are collapsed whenever the menu opens and reveal child links only after a heading is selected. The student sidebar omits duplicate saved-job, matching-job, and personal-CV shortcuts. The dropdown omits the duplicate message shortcut; messaging remains available from the header button and student sidebar. Password recovery remains available through `/forgot-password` from the login flow.

Sinh viên có thể:

- Cập nhật tên, số điện thoại, ảnh đại diện và CV mặc định tại `/settings`. Người dùng có thể chọn ảnh JPG/JPEG/PNG tối đa 5MB, chọn hoặc kéo-thả CV PDF/DOC/DOCX tối đa 10MB, xóa tệp rồi nhấn lưu để cập nhật URL vào hồ sơ.
- Đổi mật khẩu bằng mật khẩu hiện tại và chính sách mật khẩu mạnh trong mục `Bảo mật`. Yêu cầu và lỗi xác thực nằm ngay dưới nhóm ô nhập; backend phải xác minh đúng mật khẩu hiện tại trước khi ghi mật khẩu mới.
- Lưu địa điểm, ngành nghề, mức lương, hình thức làm việc mong muốn và các quyền hiển thị/liên hệ trong hồ sơ sinh viên. Địa điểm mong muốn được chọn theo hai bước thành phố rồi phường/xã; hình thức làm việc dùng dropdown có menu và option bo góc đồng nhất.
- Khi thêm hoặc sửa kinh nghiệm, lựa chọn `Tôi đang làm việc tại đây` căn giữa ô chọn, biểu tượng và nội dung; bật lựa chọn này vẫn ẩn ngày kết thúc mà không xóa giá trị chưa lưu trong phiên chỉnh sửa.
- Sau khi lưu tùy chọn/hồ sơ, tải lại trang chủ để nhận danh sách được xếp theo bảy tiêu chí. Mỗi thẻ cá nhân hóa hiển thị phần trăm phù hợp; rê chuột hoặc focus badge mở bảng nổi tự chọn phía trên/dưới, hiển thị điểm từng tiêu chí trên thang 10 cùng điểm mạnh và khoảng thiếu. Bảng giữ mở khi con trỏ còn ở badge hoặc nội dung và trang việc làm không tự chuyển trong lúc người dùng đang xem. Liên kết hoàn thiện hồ sơ xuất hiện khi bảy nhóm dữ liệu chưa đủ.

- Sau khi đăng nhập, dùng cụm điều khiển sát phải trên header gồm thông báo, tin nhắn và pill tài khoản hiển thị tên/vai trò; menu `Việc làm`, `Công ty`, `Mức lương`, `Công cụ nghề nghiệp`, `Blog` được căn giữa vùng header và header sinh viên không hiển thị lời mời `Đăng tuyển ngay`. Trên desktop, `Công cụ nghề nghiệp` mở cùng một danh sách dọc tại cả `HomeHeader` và dashboard shell của Tin nhắn, Ứng tuyển, Hồ sơ, Cài đặt; mỗi tên, mô tả và trạng thái `Sắp có` giữ trên một dòng.
- Tại trang chủ `/`, tài khoản `STUDENT` có công cụ lập kế hoạch nghề nghiệp bằng AI. Sinh viên nhập mục tiêu hoặc chọn một gợi ý đa ngành rồi bấm `Lập kế hoạch bằng AI`; frontend gọi `POST /student/career-guidance` với mục tiêu đó và ngữ cảnh hướng dẫn công khai cố định, sau đó hiển thị hướng đi, bước tiếp theo, kỹ năng ưu tiên và chủ đề nên đọc. Nội dung nhập/kết quả không được lưu; khi AI chưa cấu hình hoặc lỗi, giao diện hiển thị lỗi thật thay vì câu trả lời mẫu.
- Tại `/blog`, mọi người có thể tìm kiếm, lọc chủ đề, đọc bài và lưu bài trên trình duyệt. Chọn category chỉ thay dữ liệu tại chỗ, không tự cuộn trang; kết quả mặc định trải rộng qua nhiều nhóm nghề thay vì chỉ tập trung vào IT. Bài đã lưu có nút màu xanh, viền nhấn và xuất hiện nổi bật trong danh sách đọc sau. Khi mở `Đọc ngay`, modal hiển thị nội dung ở cột chính và trợ lý định hướng ở cột phụ. Khách được yêu cầu đăng nhập; tài khoản `STUDENT` nhập mục tiêu rồi gọi `POST /student/career-guidance` để nhận định hướng, bước tiếp theo, kỹ năng ưu tiên và chủ đề liên quan. Yêu cầu AI không gửi hồ sơ, CV hay thông tin liên hệ và không được lưu vào database.
- Lọc và sắp xếp bảng việc làm bằng dropdown có menu/option bo góc; sinh viên đăng nhập mặc định thấy `Phù hợp nhất`, mỗi thẻ có tổng điểm và bảng hover/focus gồm điểm địa điểm, ngành nghề, lương, loại hình, kỹ năng, kinh nghiệm và học vấn trên thang 10; nút lưu việc luôn giữ dạng hình tròn.
- Trên `/student`, nhập từ khóa hoặc chọn địa điểm/loại hình ngay trong hero rồi bấm `Tìm kiếm` để cuộn tới kết quả đã lọc tại client, không phát sinh request tìm kiếm bổ sung. Bộ lọc nhanh, bộ lọc nhóm bên trái và sắp xếp dùng chung tập dữ liệu đang tải. Các tiêu đề loại việc, kinh nghiệm, địa điểm và mức lương mặc định thu gọn; bấm tiêu đề để mở option tích chọn và xem badge số lựa chọn. Shortcut/count trong hero và card xem nhanh việc đã lưu chỉ xuất hiện khi có favorite thật; cột phải khi đó hiển thị tối đa ba việc cùng liên kết tới toàn bộ danh sách, hồ sơ cá nhân và tùy chọn tìm việc.

- Xem việc làm công khai trên trang chủ và `/student`.
- Lọc nhóm `Việc làm tốt nhất` theo tỉnh/thành phố thay vì phường, quận hoặc địa chỉ chi tiết; thẻ việc làm chỉ hiện nhãn tỉnh/thành phố rút gọn để giữ bố cục đồng đều.
- Tìm kiếm/lọc việc làm.
- Bấm tên việc làm trên trang chủ hoặc `/student` để mở trang `/jobs/:id`. Trang mặc định hiển thị mô tả và hồ sơ doanh nghiệp; bấm `Thông tin công việc` mới mở đồng thời metadata và kỹ năng, còn các tab khác đổi trạng thái tại chỗ mà không tự cuộn trang. Địa điểm trong bảng thông tin hiển thị tỉnh/thành phố nổi bật ở dòng trên và khu vực chi tiết màu nhạt ở dòng dưới. Các liên kết hỗ trợ chưa triển khai hiển thị toast thông báo thay vì im lặng.
- Ứng tuyển vào việc làm.
- Lưu/yêu thích việc làm bằng nút tim được căn cố định và hiển thị trọn vẹn trong phần chân mỗi thẻ.
- Bỏ lưu/bỏ yêu thích việc làm.
- Xem trạng thái đã ứng tuyển và đã lưu của các việc làm.
- Xem danh sách việc đã ứng tuyển tại `/student/applications`; trang chỉ tải một lần `GET /student/applied-jobs` khi mở, cho phép lọc theo trạng thái/thời gian bằng dropdown bo góc, tìm kiếm không che lựa chọn `Tất cả`, phân trang và chọn đơn để xem timeline, lịch phỏng vấn, kết quả, kỹ năng vị trí cùng ghi chú nhà tuyển dụng. Dòng thời gian `Cập nhật` của hồ sơ đã gửi chỉ xuất hiện sau khi có trạng thái hoặc dữ liệu phản hồi từ doanh nghiệp. Nút `Nhắn tin` mở hoặc tái sử dụng hội thoại của đúng đơn, còn `Xem chi tiết việc làm` đi tới `/jobs/:id`.
- Chỉnh sửa hồ sơ bằng các form chia nhóm rõ ràng; icon sửa/xóa có trạng thái hover/focus riêng và thao tác xóa dùng hộp xác nhận trong giao diện. Khung modal giữ góc bo bằng vùng cuộn nội bộ có track/thumb bo tròn; nhãn, control và dòng hướng dẫn giữ cùng chiều cao giữa các cột. Dropdown trong form dùng nút, panel và option bo góc thay cho giao diện native. Khi chọn `Tôi đang làm việc tại đây`, trường ngày kết thúc được ẩn nhưng giá trị đang nhập được giữ để khôi phục nếu bỏ chọn. Kỹ năng được hiển thị theo danh mục; dropdown nhận đúng cặp `value`/`label`, hiển thị đầy đủ danh mục và cho phép chuyển rõ ràng sang chế độ tạo danh mục mới cùng kỹ năng đầu tiên trước khi lưu hồ sơ.
- Xem danh sách việc đã yêu thích.
- Bấm icon chat trên header để mở tối đa sáu hội thoại gần đây ngay tại chỗ, kèm tin cuối, thời gian, số chưa đọc và đường phân cách mảnh giữa từng hội thoại; vùng danh sách có chiều cao giới hạn cùng track/thumb scrollbar bo tròn và không hiện nút mũi tên native. Dữ liệu chỉ được tải ở lần mở đầu tiên của header, không polling. Chỉ khi chọn một hội thoại hoặc `Xem tất cả` mới chuyển tới trang tin nhắn. Sidebar sinh viên vẫn dẫn trực tiếp tới trung tâm tin nhắn, dropdown người dùng không lặp lại mục này và thanh cuộn sidebar không hiển thị nút mũi tên lên/xuống.
- Xem danh sách hội thoại, lọc hội thoại, đọc tin nhắn, gửi tin nhắn trong hội thoại ứng tuyển bằng dữ liệu từ `ConversationService`.
- Nhận biết hội thoại chưa đọc bằng chấm xanh lá ở mép dưới bên trái avatar; chấm biến mất khi `unread_count` về `0`.
- Mở hoặc tạo lazy hội thoại từ danh sách đơn đã ứng tuyển ngay trong trang tin nhắn; mỗi đơn vẫn chỉ có một hội thoại.
- Cuộn lên đầu khung chat để tải thêm lịch sử bằng cursor, giữ nguyên vị trí cuộn và không hiển thị trùng tin.
- Vào hồ sơ và cài đặt từ dropdown người dùng hoặc sidebar sinh viên.
- Nhận thông báo do doanh nghiệp tạo khi đặt lịch phỏng vấn hoặc xử lý kết quả phỏng vấn.
- Trong dropdown thông báo, chỉ các tin nhắn từ cùng một người gửi trong 24 giờ gần nhất được gộp thành một thẻ; phần mô tả và huy hiệu chỉ đếm số tin chưa đọc trong khoảng này. Một tin chưa đọc hiện chấm xanh; nhiều tin chưa đọc hiện huy hiệu xanh kèm số lượng. Mở thẻ sẽ đánh dấu đã đọc toàn bộ tin thuộc nhóm và chuyển đến hội thoại mới nhất.

Quy tắc hành động việc làm của sinh viên:

- Ứng tuyển yêu cầu người dùng đã đăng nhập với role `STUDENT`.
- Lưu/yêu thích việc làm yêu cầu người dùng đã đăng nhập với role `STUDENT`.
- Các hành động cần dữ liệu sinh viên trên trang chủ, danh sách việc làm và chi tiết việc làm dùng chung `useStudentLoginPrompt`; khách nhìn thấy cảnh báo nhưng không bị tự động chuyển sang trang đăng nhập.
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
| Lấy việc làm gợi ý theo hồ sơ | `GET /student/job-recommendations?limit=1..100&refresh=false` |
| Lấy danh sách việc đã ứng tuyển | `GET /student/applied-jobs` |
| Lấy danh sách việc đã yêu thích | `GET /student/favorite-jobs` |
| Ứng tuyển việc làm | `POST /student/jobs/:id/apply` |
| Lưu/yêu thích việc làm | `POST /student/jobs/:id/favorite` |
| Bỏ lưu/bỏ yêu thích việc làm | `DELETE /student/jobs/:id/favorite` |
| Lấy danh sách hội thoại | `GET /conversations` |
| Lấy tin nhắn trong hội thoại | `GET /conversations/:id/messages` |
| Gửi tin nhắn trong hội thoại | `POST /conversations/:id/messages` |
| Đánh dấu hội thoại đã đọc | `PUT /conversations/:id/read` |

Các method service của sinh viên đang có nhưng cần kiểm tra runtime route trước khi dựa vào:

- `StudentService.getProfile()`
- `StudentService.updateProfile()`

## Nhà tuyển dụng / Doanh nghiệp

Tài khoản doanh nghiệp có role `ENTERPRISE`.

Luồng đăng ký và truy cập:

1. Doanh nghiệp đăng ký bằng email, mật khẩu, tên công ty, số điện thoại liên hệ, mã số thuế và URL GPKD.
2. Backend tạo user với role `ENTERPRISE`.
3. Backend tạo hồ sơ doanh nghiệp với KYB status `PENDING`.
4. Doanh nghiệp hoàn tất đăng nhập và được điều hướng tới dashboard `/enterprise` dù KYB đang `PENDING`, `APPROVED` hoặc `REJECTED`.
5. Admin kiểm tra KYB và GPKD.
6. Chỉ khi KYB `APPROVED` và GPKD không rỗng, doanh nghiệp mới dùng được các chức năng tuyển dụng quan trọng như đăng tin, quản lý ứng viên và lịch phỏng vấn.
7. API hồ sơ doanh nghiệp `GET/PUT /enterprise/profile` mở cho tài khoản chưa duyệt để doanh nghiệp xem trạng thái và gửi lại GPKD; các API nghiệp vụ tuyển dụng vẫn yêu cầu KYB `APPROVED`.

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
- Dropdown thông báo gộp các tin nhắn của cùng một ứng viên trong 24 giờ gần nhất thành một thẻ; nội dung chỉ nêu số tin chưa đọc trong khoảng này. Dấu chấm xanh biểu thị một tin chưa đọc, còn huy hiệu xanh có số biểu thị nhiều tin chưa đọc.
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
- Bấm `Nhắn tin` trên dòng ứng viên để mở hoặc tái sử dụng hội thoại gắn với đơn ứng tuyển rồi chuyển vào trung tâm tin nhắn.

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
| `/admin/categories` | Quản lý danh mục kỹ năng, xem kỹ năng và mức sử dụng trong tin tuyển dụng |
| `/admin/reports` | Báo cáo KPI, tăng trưởng, cơ cấu tài khoản, kiểm duyệt và xếp hạng từ dữ liệu hệ thống |
| `/admin/settings` | Cấu hình giao diện quản trị theo nhóm nền tảng, kiểm duyệt, thông báo và bảo mật |

Sidebar admin không hiển thị mục đơn ứng tuyển riêng; dữ liệu ứng tuyển được tổng hợp trong trang báo cáo và vẫn được doanh nghiệp xử lý trong luồng tuyển dụng hiện có.

Trong `/admin/settings`, các form `Thông tin nền tảng`, `Kiểm duyệt nội dung` và `Bảo mật & truy cập` tự chuyển giữa một và hai cột theo chiều rộng thực của từng card. Khi sidebar thu gọn và card có đủ chỗ, các trường chuyển sang hai cột như giao diện tham chiếu; khi sidebar mở hoặc viewport hẹp, chúng trở lại một cột để không bị ép. Trong tab `Nền tảng`, hai card `Thông tin nền tảng` và `Đăng ký & xác minh` tự giãn bằng chiều cao; tab `Bảo mật` áp dụng tương tự cho `Bảo mật & truy cập` và `Sao lưu & nhật ký`, không dùng chiều cao pixel cố định và không thay đổi chiều cao tự nhiên ở Tổng quan. Các hàng công tắc có cùng footprint, còn thống kê/công tắc/nút sao lưu được cân giữa trong phần thân card để tránh dồn nội dung lên trên. Tab `Vận hành` đặt `Kiểm duyệt nội dung` và `Thông báo hệ thống` trong hai card bo góc độc lập nhưng cùng một hàng responsive; các state kiểm duyệt/thông báo và hành động lưu chung vẫn giữ nguyên. Thanh hành động nằm cuối nội dung và cuộn tự nhiên, không cố định trên viewport. Admin chọn múi giờ từ danh sách IANA quốc tế có tìm kiếm; dropdown ngôn ngữ, thời hạn duyệt và thời hạn phiên dùng cùng option panel bo góc. Tổng quan vẫn dùng các card compact ba cột và không hiển thị phần `Bảo mật & truy cập`; phần này chỉ xuất hiện sau khi admin chọn tab `Bảo mật`. Sidebar thu gọn thành rail icon 72px với vùng bấm vuông đồng đều.

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

Admin có thể dùng báo cáo và danh mục:

- Chọn kỳ 7 ngày, 30 ngày, quý hoặc năm để xem tăng trưởng người dùng, tin đăng và ứng tuyển.
- Xem KPI, cơ cấu vai trò, hiệu suất kiểm duyệt, doanh nghiệp/ngành nghề/địa điểm nổi bật và tỷ lệ hoàn thiện hồ sơ từ dữ liệu thật.
- In báo cáo thành PDF qua trình duyệt hoặc tải bản CSV của KPI và bảng doanh nghiệp.
- Tìm kiếm danh mục và kỹ năng, mở rộng danh mục để xem mức sử dụng từng kỹ năng.
- Tạo hoặc đổi tên danh mục; chỉ xóa được danh mục chưa chứa kỹ năng.

Admin có thể dùng trang cài đặt:

- Chuyển giữa bốn tab Tổng quan, Nền tảng, Vận hành và Bảo mật; mỗi tab hiển thị đúng nhóm card liên quan.
- Kiểm tra validation email hỗ trợ, giới hạn tin nháp, số lần đăng nhập sai và allowlist IP.
- Tải một snapshot dùng chung từ `GET /admin/settings` khi mở trang; lưu hoặc khôi phục mặc định bằng đúng một `PUT` cho mỗi thao tác, không autosave, polling hay gọi lại sau khi lưu.
- Nhận biết thay đổi chưa lưu, khóa submit trùng, và xử lý `409` bằng snapshot mới nhất có sẵn trong response: dùng bản máy chủ hoặc giữ bản đang chỉnh rồi chủ động lưu lại.
- Bật/tắt các policy backend đang hỗ trợ: đăng ký học viên/doanh nghiệp, cổng KYB, duyệt tin thủ công/tự động, giới hạn tin nháp, thông báo trong ứng dụng/cảnh báo KYB, mật khẩu mạnh, thời hạn access token, giới hạn đăng nhập sai và admin IP allowlist.
- Thấy ghi chú `stored_only` cho thời gian chờ duyệt; các control email verification/email delivery/2FA/reported jobs/daily backup bị khóa vì runtime chưa có provider/flow; public rejected visibility bị cố định ẩn.
- Xem tổng tài khoản admin, phiên bản, uptime, Go memory, goroutine và trạng thái database từ cùng Settings snapshot. Backup/log actions hiển thị không khả dụng thay vì dữ liệu giả.
- Sau lần tải/lưu server thành công, key `quickwork:admin-settings-local` cũ được xóa; server là nguồn sự thật và dữ liệu local cũ không tự merge/ghi đè.

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
- Khi chọn từ chối KYB từ bảng doanh nghiệp, admin nhập lý do bắt buộc trong modal xác nhận; modal hiển thị doanh nghiệp bị tác động và trạng thái đang gửi.
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
- Khi yêu cầu nộp GPKD, backend chỉ tạo bản ghi trong `notifications`; bảng `messages` chỉ dành cho chat giữa sinh viên và doanh nghiệp gắn với đơn ứng tuyển.
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

- `PENDING`: chờ admin duyệt, vẫn được vào dashboard doanh nghiệp để xem thông báo và cập nhật GPKD; chưa được dùng chức năng tuyển dụng quan trọng.
- `APPROVED`: được dùng đầy đủ khu doanh nghiệp nếu có GPKD.
- `REJECTED`: được vào dashboard, thấy lý do từ chối và nút gửi lại hồ sơ; chưa được dùng chức năng tuyển dụng quan trọng.

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
