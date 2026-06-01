# TXP Bus - Detailed Bug Report

- Generated at: 01/06/2026 11:16
- Design By: Đỗ Thị Phương
- Execute By: Playwright
- Evidence source: consolidated CSV testcase status, Playwright E2E notes, and code review of `backend/` + `kien-tap/`.

## Executive Summary
- Total testcase rows reviewed: 479
- Passed: 466
- Failed: 9
- Skip: 4
- Not Run: 0
- Reported issues/gaps: 13
- Bugs: 9
- Requirement gaps: 1
- Test gaps: 3
- High/Critical items: 9

## Risk Focus
- Fix first: seat/booking validation, held-seat handling, dispatch resource conflicts, and blacklist input validation.
- Medium priority: OTP request state, location search normalization, and UX behaviors that can cause duplicated actions or confusing flows.
- Test follow-up: skipped/not-run search-trip scenarios should be revisited after product rules are confirmed.

## Admin Summary
- Testcase rows: 186
- Passed / Failed / Skip / Not Run: 180 / 4 / 2 / 0
- Issues in report: 6
- Bug / Requirement Gap / Test Gap: 4 / 0 / 2

## Customer Summary
- Testcase rows: 293
- Passed / Failed / Skip / Not Run: 286 / 5 / 2 / 0
- Issues in report: 7
- Bug / Requirement Gap / Test Gap: 5 / 1 / 1

## Detailed Admin Issues
### BUG-ADMIN-001 - Security - Nhập ký tự đặc biệt / XSS vào Nội dung từ khóa
- Issue Type: Bug
- Severity / Priority: High / P1
- Status in testcase: Failed
- Module: Quản lý Từ khóa cấm
- Related testcase: TXP_ADMIN_BLACKLIST_TC_006 (`testcases_admin_blacklist.csv`)
- Suspected area: `kien-tap/src/app/featured/admin/QuanLyTuKhoaCam/quan-ly-tu-khoa-cam.component.ts; backend/src/admin/tu-khoa-cam/tu-khoa-cam.service.ts`

**Steps / Trigger**
1. Nhập Nội dung: <script>alert(1)</script>2. Chọn Mức độ: Cao3. Click Lưu từ khóa

**Actual Result**
Bug: Hệ thống cho phép lưu từ khóa rỗng sau khi sanitize (Thông báo alert hiển thị: Đã thêm từ khóa mới "" vào danh sách).

**Expected Result**
Hệ thống sanitize input, không thực thi script. Nội dung được lưu dưới dạng plain text hoặc bị từ chối. Không xuất hiện popup alert.

**Evidence**
CSV: testcases_admin_blacklist.csv; TC: TXP_ADMIN_BLACKLIST_TC_006; Status: Failed; Actual: Bug: Hệ thống cho phép lưu từ khóa rỗng sau khi sanitize (Thông báo alert hiển thị: Đã thêm từ khóa mới "" vào danh sách).

**Recommendation**
Kiểm tra và làm sạch từ khóa đã chuẩn hóa; từ chối nội dung rỗng hoặc không an toàn ở cả UI và API; thêm kiểm thử hồi quy cho payload dạng script.

**Regression Scope**
Chạy file test src/tests/admin/blacklist.spec.ts, đặc biệt là TXP_ADMIN_BLACKLIST_TC_006; test lại quyền tạo/sửa/xóa từ khóa cấm.

### BUG-ADMIN-002 - Validation - Nhập từ khóa vượt quá giới hạn ký tự cho phép
- Issue Type: Test Gap
- Severity / Priority: Medium / P2
- Status in testcase: Skip
- Module: Quản lý Từ khóa cấm
- Related testcase: TXP_ADMIN_BLACKLIST_TC_007 (`testcases_admin_blacklist.csv`)
- Suspected area: `kien-tap/src/app/featured/admin/QuanLyTuKhoaCam/quan-ly-tu-khoa-cam.component.ts; backend/src/admin/tu-khoa-cam/tu-khoa-cam.service.ts`

**Steps / Trigger**
1. Nhập nội dung dài đúng 256 ký tự (a...a)2. Click Lưu từ khóa

**Actual Result**
Skip: Hệ thống hiện tại chưa chặn kiểm tra độ dài đầu vào 255 ký tự ở mức frontend.

**Expected Result**
Hệ thống chặn không cho nhập tiếp quá 255 ký tự hoặc báo lỗi validation: 'Nội dung từ khóa tối đa 255 ký tự.'

**Evidence**
CSV: testcases_admin_blacklist.csv; TC: TXP_ADMIN_BLACKLIST_TC_007; Status: Skip; Actual: Skip: Hệ thống hiện tại chưa chặn kiểm tra độ dài đầu vào 255 ký tự ở mức frontend.

**Recommendation**
Thêm xác thực độ dài tối đa (max-length) rõ ràng trên cả frontend và backend, trả về lỗi chi tiết thay vì chỉ dựa vào hành vi chặn của UI.

**Regression Scope**
Chạy file test src/tests/admin/blacklist.spec.ts, đặc biệt là TXP_ADMIN_BLACKLIST_TC_007; test lại quyền tạo/sửa/xóa từ khóa cấm.

### BUG-ADMIN-003 - Business Rule - Chặn trùng lịch Phương tiện (xung đột khung giờ xe chạy)
- Issue Type: Bug
- Severity / Priority: High / P1
- Status in testcase: Failed
- Module: Quản lý Điều hành
- Related testcase: TXP_ADMIN_DISPATCH_TC_010 (`testcases_admin_dispatch.csv`)
- Suspected area: `kien-tap/src/app/featured/admin/QuanLyDieuHanh/QuanLyLichTrinh/quan-ly-lich-trinh.component.ts; backend/src/admin/dieu-hanh/dieu-hanh.service.ts`

**Steps / Trigger**
1. Tạo Lịch trình B chạy từ 20:00 ngày 31/05 đến 06:00 ngày 01/062. Cố tình chọn xe: "77B-012.34"3. Click "Lưu lịch trình"

**Actual Result**
Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch phương tiện (lịch trình mới vẫn được lưu thành công).

**Expected Result**
Chặn lưu thành công. Backend hiển thị lỗi: "Phương tiện này đã được gán cho một chuyến xe khác trong khung giờ này".

**Evidence**
CSV: testcases_admin_dispatch.csv; TC: TXP_ADMIN_DISPATCH_TC_010; Status: Failed; Actual: Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch phương tiện (lịch trình mới vẫn được lưu thành công).

**Recommendation**
Trước khi tạo hoặc cập nhật lịch trình, hãy truy vấn kiểm tra trùng lịch của cùng một xe và trả về mã lỗi 409 hoặc lỗi xác thực nếu xe đã bận.

**Regression Scope**
Chạy file test src/tests/admin/dispatch.spec.ts, đặc biệt là TXP_ADMIN_DISPATCH_TC_010; test lại việc tạo/sửa lịch trình và phân công tài nguyên.

### BUG-ADMIN-004 - Business Rule - Chặn trùng lịch Nhân sự (xung đột giờ làm việc tài xế)
- Issue Type: Bug
- Severity / Priority: High / P1
- Status in testcase: Failed
- Module: Quản lý Điều hành
- Related testcase: TXP_ADMIN_DISPATCH_TC_011 (`testcases_admin_dispatch.csv`)
- Suspected area: `kien-tap/src/app/featured/admin/QuanLyDieuHanh/QuanLyLichTrinh/quan-ly-lich-trinh.component.ts; backend/src/admin/dieu-hanh/dieu-hanh.service.ts`

**Steps / Trigger**
1. Tạo Lịch trình B chạy từ 20:00 ngày 31/05 đến 06:00 ngày 01/062. Cố tình chọn Tài xế chính: "Lê Văn Tám"3. Click "Lưu lịch trình"

**Actual Result**
Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch nhân sự (lịch trình mới vẫn được lưu thành công).

**Expected Result**
Chặn lưu thành công. Backend hiển thị lỗi: "Tài xế đã có lịch làm việc trùng với khung giờ di chuyển".

**Evidence**
CSV: testcases_admin_dispatch.csv; TC: TXP_ADMIN_DISPATCH_TC_011; Status: Failed; Actual: Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch nhân sự (lịch trình mới vẫn được lưu thành công).

**Recommendation**
Áp dụng cùng một cơ chế xác thực trùng lịch cho tài xế/phụ xe được phân công và giữ kiểm tra này ở backend làm nguồn xác thực chuẩn (source of truth).

**Regression Scope**
Chạy file test src/tests/admin/dispatch.spec.ts, đặc biệt là TXP_ADMIN_DISPATCH_TC_011; test lại việc tạo/sửa lịch trình và phân công tài nguyên.

### BUG-ADMIN-005 - Validation - Chọn Ngày khởi hành trong quá khứ
- Issue Type: Test Gap
- Severity / Priority: High / P1
- Status in testcase: Skip
- Module: Quản lý Điều hành
- Related testcase: TXP_ADMIN_DISPATCH_TC_012 (`testcases_admin_dispatch.csv`)
- Suspected area: `kien-tap/src/app/featured/admin/QuanLyDieuHanh/QuanLyLichTrinh/quan-ly-lich-trinh.component.ts; backend/src/admin/dieu-hanh/dieu-hanh.service.ts`

**Steps / Trigger**
1. Chọn Ngày khởi hành là hôm qua2. Điền các trường hợp lệ khác3. Click "Lưu lịch trình"

**Actual Result**
Hệ thống sử dụng Datepicker chặn/không cho phép chọn ngày trong quá khứ trực tiếp từ UI component.

**Expected Result**
Hệ thống báo lỗi validation: "Ngày khởi hành phải lớn hơn hoặc bằng ngày hiện tại" và chặn lưu.

**Evidence**
CSV: testcases_admin_dispatch.csv; TC: TXP_ADMIN_DISPATCH_TC_012; Status: Skip; Actual: Hệ thống sử dụng Datepicker chặn/không cho phép chọn ngày trong quá khứ trực tiếp từ UI component.

**Recommendation**
Xác nhận lại quy tắc nghiệp vụ mong muốn với Product Owner, sửa lỗi xác thực nguồn, sau đó bổ sung test case Playwright để kiểm thử hồi quy.

**Regression Scope**
Chạy file test src/tests/admin/dispatch.spec.ts, đặc biệt là TXP_ADMIN_DISPATCH_TC_012; test lại việc tạo/sửa lịch trình và phân công tài nguyên.

### BUG-ADMIN-006 - State Transition - Chuyển đổi trạng thái lịch trình hoàn thành và giải phóng xe/tài xế
- Issue Type: Bug
- Severity / Priority: High / P1
- Status in testcase: Failed
- Module: Quản lý Điều hành
- Related testcase: TXP_ADMIN_DISPATCH_TC_013 (`testcases_admin_dispatch.csv`)
- Suspected area: `kien-tap/src/app/featured/admin/QuanLyDieuHanh/QuanLyLichTrinh/quan-ly-lich-trinh.component.ts; backend/src/admin/dieu-hanh/dieu-hanh.service.ts`

**Steps / Trigger**
1. Sau khi chuyến xe cập bến thực tế2. Cập nhật trạng thái lịch trình chuyến chạy sang "Hoàn thành"

**Actual Result**
Hệ thống chưa thiết lập ràng buộc tự động giải phóng phương tiện/tài xế khi cập nhật trạng thái Hoàn thành.

**Expected Result**
Trạng thái chuyển sang Hoàn thành thành công. Phương tiện và tài xế được giải phóng về trạng thái rảnh để gán lịch chuyến mới.

**Evidence**
CSV: testcases_admin_dispatch.csv; TC: TXP_ADMIN_DISPATCH_TC_013; Status: Failed; Actual: Hệ thống chưa thiết lập ràng buộc tự động giải phóng phương tiện/tài xế khi cập nhật trạng thái Hoàn thành.

**Recommendation**
Áp dụng cùng một cơ chế xác thực trùng lịch cho tài xế/phụ xe được phân công và giữ kiểm tra này ở backend làm nguồn xác thực chuẩn (source of truth).

**Regression Scope**
Chạy file test src/tests/admin/dispatch.spec.ts, đặc biệt là TXP_ADMIN_DISPATCH_TC_013; test lại việc tạo/sửa lịch trình và phân công tài nguyên.

## Detailed Customer Issues
### BUG-CUSTOMER-001 - Security - Nút gửi bị vô hiệu hóa khi đang gửi OTP để phòng chống spam
- Issue Type: Bug
- Severity / Priority: High / P1
- Status in testcase: Failed
- Module: Bước 1 - Nhập SĐT
- Related testcase: TXP_FP_TC_008 (`testcases_customer_forgot_password.csv`)
- Suspected area: `kien-tap/src/app/featured/customer/auth/forgot-password/forgot-password.component.ts; kien-tap/src/app/featured/customer/auth/forgot-password/forgot-password.component.html; backend/src/customer/auth/auth.service.ts`

**Steps / Trigger**
1. Nhập SĐT hợp lệ2. Click nút "Gửi mã xác thực" và quan sát trạng thái của nút ngay lập tức

**Actual Result**
Phát hiện Dev Bug: Nút gửi không bị disabled khi đang gọi API gửi OTP.

**Expected Result**
1. Trong thời gian gọi API, trạng thái isSendingOtp chuyển sang true.2. Nút "Gửi mã xác thực" bị vô hiệu hóa (disabled) tạm thời để tránh người dùng nhấn liên tục.

**Evidence**
CSV: testcases_customer_forgot_password.csv; TC: TXP_FP_TC_008; Status: Failed; Actual: Phát hiện Dev Bug: Nút gửi không bị disabled khi đang gọi API gửi OTP.

**Recommendation**
Ràng buộc trạng thái disabled/loading của nút gửi OTP với biến isSendingOtp và thêm guard return sớm trong hàm sendOtp().

**Regression Scope**
Chạy file test src/tests/customer/forgot-password.spec.ts, đặc biệt là TXP_FP_TC_008; test lại việc gửi lại OTP và đóng modal.

### BUG-CUSTOMER-002 - UI - Phím ESC đóng modal Quên mật khẩu
- Issue Type: Bug
- Severity / Priority: Medium / P2
- Status in testcase: Failed
- Module: Quy tắc chung của modal
- Related testcase: TXP_FP_TC_029 (`testcases_customer_forgot_password.csv`)
- Suspected area: `kien-tap/src/app/featured/customer/auth/forgot-password/forgot-password.component.ts; kien-tap/src/app/featured/customer/auth/forgot-password/forgot-password.component.html; backend/src/customer/auth/auth.service.ts`

**Steps / Trigger**
1. Nhấn phím ESC trên bàn phím

**Actual Result**
Phát hiện Dev Bug: Nhấn phím ESC không đóng được modal Quên mật khẩu.

**Expected Result**
Modal Quên mật khẩu tự động đóng và reset toàn bộ trạng thái giống như click nút X.

**Evidence**
CSV: testcases_customer_forgot_password.csv; TC: TXP_FP_TC_029; Status: Failed; Actual: Phát hiện Dev Bug: Nhấn phím ESC không đóng được modal Quên mật khẩu.

**Recommendation**
Xử lý phím Escape ở cấp độ modal để đóng hoặc reset modal quên mật khẩu một cách nhất quán.

**Regression Scope**
Chạy file test src/tests/customer/forgot-password.spec.ts, đặc biệt là TXP_FP_TC_029; test lại việc gửi lại OTP và đóng modal.

### BUG-CUSTOMER-003 - Alternate Path - Tra cứu với mã có khoảng trắng đầu/cuối (Trim whitespace)
- Issue Type: Bug
- Severity / Priority: Low / P2
- Status in testcase: Failed
- Module: Tra cứu vé
- Related testcase: TXP_LOOK_TC_033 (`testcases_customer_ticket_lookup.csv`)
- Suspected area: `Frontend component and corresponding backend validation/API service for this module.`

**Steps / Trigger**
1. Nhập mã đơn hàng có khoảng trắng đầu/cuối: "  DH10000001  "2. Nhập SĐT: 09123456783. Click "Tra cứu"

**Actual Result**
Failed/Bug: Backend có biến trimmedCode nhưng truy vấn lookup vẫn dùng code gốc, nên mã có khoảng trắng đầu/cuối không tra cứu thành công. Cần dùng trimmedCode trong điều kiện Prisma.

**Expected Result**
Hệ thống trim khoảng trắng và tìm kiếm thành công, trả về thông tin đơn hàng DH10000001.

**Evidence**
CSV: testcases_customer_ticket_lookup.csv; TC: TXP_LOOK_TC_033; Status: Failed; Actual: Failed/Bug: Backend có biến trimmedCode nhưng truy vấn lookup vẫn dùng code gốc, nên mã có khoảng trắng đầu/cuối không tra cứu thành công. Cần dùng trimmedCode trong điều kiện Prisma.

**Recommendation**
Xác nhận lại quy tắc nghiệp vụ mong muốn với Product Owner, sửa lỗi xác thực nguồn, sau đó bổ sung test case Playwright để kiểm thử hồi quy.

**Regression Scope**
Chạy các test case Playwright của file testcases_customer_ticket_lookup.csv, đặc biệt là TXP_LOOK_TC_033.

### BUG-CUSTOMER-004 - Known Gap - Nút hoán đổi chưa cập nhật đúng giá trị input tìm kiếm
- Issue Type: Requirement Gap
- Severity / Priority: High / P1
- Status in testcase: Skip
- Module: Tìm kiếm chuyến chạy
- Related testcase: TXP_SEARCH_TC_003 (`testcases_search_trip.csv`)
- Suspected area: `kien-tap/src/app/featured/customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe.ts; backend/src/customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe.service.ts; backend/src/customer/thong-tin-don-hang/thong-tin-don-hang.service.ts`

**Steps / Trigger**
1. Chọn Điểm đi2. Chọn Điểm đến khác Điểm đi3. Click nút swap sync_alt4. Quan sát hai input và thử click TÌM KIẾM

**Actual Result**
Nút swap chỉ hoán đổi biến trong controller mà không cập nhật giá trị hiển thị trên UI. Khi click Tìm kiếm, chiều đi/về vẫn được giữ nguyên như cũ.

**Expected Result**
Theo frontend hiện tại, swapLocations() chỉ hoán đổi biến departure/destination, chưa hoán đổi departureSearch/destinationSearch đang bind với input. Khi bấm TÌM KIẾM, searchTrip() lấy lại dữ liệu từ departureSearch/destinationSearch nên có thể giữ nguyên chiều tìm kiếm cũ. Testcase phải ghi nhận đây là gap hiện tại, không kỳ vọng UI swap thành công.

**Evidence**
CSV: testcases_search_trip.csv; TC: TXP_SEARCH_TC_003; Status: Skip; Actual: Nút swap chỉ hoán đổi biến trong controller mà không cập nhật giá trị hiển thị trên UI. Khi click Tìm kiếm, chiều đi/về vẫn được giữ nguyên như cũ.

**Recommendation**
Hoán đổi cả hai giá trị đã chọn và dữ liệu hiển thị trên input tìm kiếm, sau đó cập nhật hoặc xóa trạng thái tìm kiếm phụ thuộc một cách nhất quán.

**Regression Scope**
Chạy file test src/tests/customer/search-trip.spec.ts, đặc biệt là TXP_SEARCH_TC_003; đồng thời test lại luồng thanh toán đặt vé với các ghế đã bán/đang giữ.

### BUG-CUSTOMER-005 - Boundary - Màn tìm chuyến chỉ chặn khi chọn quá 5 cabin trong cùng trip
- Issue Type: Bug
- Severity / Priority: High / P1
- Status in testcase: Failed
- Module: Đặt cabin & Dịch vụ
- Related testcase: TXP_SEARCH_TC_014 (`testcases_search_trip.csv`)
- Suspected area: `kien-tap/src/app/featured/customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe.ts; backend/src/customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe.service.ts; backend/src/customer/thong-tin-don-hang/thong-tin-don-hang.service.ts`

**Steps / Trigger**
1. Chọn liên tiếp 5 cabin available2. Click cabin available thứ 6

**Actual Result**
Chọn 5 cabin, click cabin thứ 6 vẫn unselected và hiển thị toast "Bạn chỉ được chọn tối đa 5 ghế". Hiện tại hệ thống không giới hạn số cabin được chọn (cho phép chọn không giới hạn).

**Expected Result**
1. toggleSeat() tính currentlySelectedCount từ trip.seats.2. Khi currentlySelectedCount >= 5, hiển thị toast warning: Bạn chỉ được chọn tối đa 5 ghế.3. Cabin thứ 6 giữ trạng thái available.4. Rule này chỉ là giới hạn 5 ghế trên màn tìm chuyến, không phải giới hạn theo dropdown Số vé/passengers.

**Evidence**
CSV: testcases_search_trip.csv; TC: TXP_SEARCH_TC_014; Status: Failed; Actual: Chọn 5 cabin, click cabin thứ 6 vẫn unselected và hiển thị toast "Bạn chỉ được chọn tối đa 5 ghế". Hiện tại hệ thống không giới hạn số cabin được chọn (cho phép chọn không giới hạn).

**Recommendation**
Xác định quy tắc nghiệp vụ cho tỷ lệ số lượng khách hàng so với số ghế và thực thi kiểm tra này ở cả UI và API validation khi tạo đơn hàng.

**Regression Scope**
Chạy file test src/tests/customer/search-trip.spec.ts, đặc biệt là TXP_SEARCH_TC_014; đồng thời test lại luồng thanh toán đặt vé với các ghế đã bán/đang giữ.

### BUG-CUSTOMER-006 - Current Behavior - Dropdown địa điểm không hỗ trợ tìm không dấu
- Issue Type: Test Gap
- Severity / Priority: Medium / P2
- Status in testcase: Skip
- Module: Tìm kiếm chuyến chạy
- Related testcase: TXP_SEARCH_TC_025 (`testcases_search_trip.csv`)
- Suspected area: `kien-tap/src/app/featured/admin/QuanLyTuKhoaCam/quan-ly-tu-khoa-cam.component.ts; backend/src/admin/tu-khoa-cam/tu-khoa-cam.service.ts`

**Steps / Trigger**
1. Focus ô Điểm đi2. Gõ từ khóa không dấu tương ứng với địa điểm có dấu3. Quan sát dropdown

**Actual Result**
Gõ "dap da" không dấu trong input Điểm đi không hiển thị kết quả gợi ý "Đập Đá" (dropdown chỉ hỗ trợ tìm kiếm chính xác có dấu).

**Expected Result**
1. filteredDepartures/filteredDestinations chỉ dùng toLowerCase().includes(search), không normalize dấu.2. Từ khóa không dấu không match địa điểm có dấu.3. Đây là behavior hiện tại; testcase không kỳ vọng dropdown hiển thị kết quả không dấu.

**Evidence**
CSV: testcases_search_trip.csv; TC: TXP_SEARCH_TC_025; Status: Skip; Actual: Gõ "dap da" không dấu trong input Điểm đi không hiển thị kết quả gợi ý "Đập Đá" (dropdown chỉ hỗ trợ tìm kiếm chính xác có dấu).

**Recommendation**
Chuẩn hóa bỏ dấu tiếng Việt cho cả từ khóa tìm kiếm và văn bản của các tùy chọn trước khi thực hiện lọc kết quả tự động hoàn thành (autocomplete/dropdown).

**Regression Scope**
Chạy file test src/tests/customer/search-trip.spec.ts, đặc biệt là TXP_SEARCH_TC_025; đồng thời test lại luồng thanh toán đặt vé với các ghế đã bán/đang giữ.

### BUG-CUSTOMER-007 - State Transition - Collapse trip card hoàn tác selection chưa đi tiếp
- Issue Type: Bug
- Severity / Priority: High / P1
- Status in testcase: Failed
- Module: Đặt cabin & Dịch vụ
- Related testcase: TXP_SEARCH_TC_032 (`testcases_search_trip.csv`)
- Suspected area: `kien-tap/src/app/featured/customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe.ts; backend/src/customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe.service.ts; backend/src/customer/thong-tin-don-hang/thong-tin-don-hang.service.ts`

**Steps / Trigger**
1. Click lại trip card để collapse2. Quan sát trạng thái cabin và activeTrip

**Actual Result**
Collapse trip card và mở lại hoàn tác cabin đã chọn về available thành công. Tuy nhiên, hệ thống không đóng được trip card khi bấm vào vùng p-6.cursor-pointer do click handler.

**Expected Result**
1. toggleTripDetails() vào nhánh collapse.2. revertTripSelection(trip) khôi phục snapshot.3. Cabin đã chọn trở về trạng thái ban đầu.4. selectedSeatsList=[], totalPrice=0, selectedRoomGuests={} nếu trip đang là activeTrip.5. Nếu có server hold trong localStorage serverSeatHoldsKey thì gọi releaseSeats, nhưng luồng Chọn ghế hiện tại không tạo server hold vì withSeats=false.

**Evidence**
CSV: testcases_search_trip.csv; TC: TXP_SEARCH_TC_032; Status: Failed; Actual: Collapse trip card và mở lại hoàn tác cabin đã chọn về available thành công. Tuy nhiên, hệ thống không đóng được trip card khi bấm vào vùng p-6.cursor-pointer do click handler.

**Recommendation**
Xác định trạng thái rảnh/bận của tài nguyên dựa trên trạng thái hoặc thời gian lịch trình hoặc cập nhật trạng thái tài nguyên khi lịch trình hoàn tất.

**Regression Scope**
Chạy file test src/tests/customer/search-trip.spec.ts, đặc biệt là TXP_SEARCH_TC_032; đồng thời test lại luồng thanh toán đặt vé với các ghế đã bán/đang giữ.

## Suggested Dev Ticket Format
Use one ticket per `Bug ID` and keep the title format: `[Severity][Module] Short failing behavior`.

Required fields:
- Environment: branch/build, frontend URL, backend URL, browser, viewport, test account/role.
- Related testcase: TC ID + CSV file + Playwright spec if available.
- Steps to reproduce: copy from this report, then add exact test data if the dev needs it.
- Actual result: observed UI/API/DB behavior.
- Expected result: business rule or agreed behavior.
- Evidence: HTML report, screenshot/video/trace, API payload/response, console/network logs.
- Acceptance criteria: bug is fixed, affected Playwright case passes, and linked regression scope passes.
