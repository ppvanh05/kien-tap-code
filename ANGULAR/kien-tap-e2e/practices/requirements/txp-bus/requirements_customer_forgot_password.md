# Tài liệu Yêu cầu - Module Quên Mật Khẩu (Forgot Password)

- Module: Quên Mật Khẩu
- Hệ thống: Bán vé xe khách TXP Bus
- Phạm vi: Giao diện khách hàng — luồng đặt lại mật khẩu qua OTP
- URL liên quan: https://kien-tap-code.vercel.app/home (modal toàn màn hình)
- Route component: app-forgot-password (modal overlay)
- Nguồn phân tích: kien-tap/src/app/featured/customer/auth/forgot-password/forgot-password.component.html và .ts
- Ngày tạo: 2026-05-30

---

## 1. Mô tả tổng quan module

Module Quên Mật Khẩu cho phép khách hàng lấy lại quyền truy cập tài khoản qua luồng 3 bước: nhập số điện thoại → xác thực OTP 6 chữ số → đặt mật khẩu mới. Chức năng hiển thị dưới dạng modal overlay, tiêu đề thay đổi động theo từng bước. Khách hàng có thể quay lại màn hình đăng nhập bất kỳ lúc nào.

---

## 2. Luồng xử lý 3 bước

### Bước 1: Nhập số điện thoại (step = 'phone')

Giao diện hiển thị:
- Tiêu đề modal: "Quên mật khẩu"
- Trường nhập liệu: "Nhập số điện thoại" (type text, icon điện thoại bên trái)
- Nút bấm: "Gửi mã xác thực" (màu secondary)
- Link cuối modal: "Quay lại Đăng nhập"

Quy tắc validation:
- Số điện thoại bắt buộc nhập.
- Định dạng hợp lệ: bắt đầu bằng 0 hoặc +84, theo sau là 9 chữ số (tổng 10 chữ số hoặc +84 + 9 chữ số).
- Regex: /^(0|\+84)\d{9}$/
- Nếu không hợp lệ → hiển thị lỗi inline: "Vui lòng nhập đúng số điện thoại gồm 10 chữ số."
- Hệ thống gọi API forgotPassword với payload: { SoDienThoai: string }
- Nếu số điện thoại chưa đăng ký → hiển thị lỗi inline: "Số điện thoại này chưa được đăng ký." (hoặc message từ backend).
- Nếu thành công → chuyển sang bước 2 (step = 'otp'), khởi động đồng hồ đếm ngược.
- Trong thời gian gửi OTP, nút bị chặn (isSendingOtp = true) để tránh spam.
- Môi trường development: OTP tự động điền vào ô nhập liệu để tiện kiểm thử.

---

### Bước 2: Xác thực mã OTP (step = 'otp')

Giao diện hiển thị:
- Tiêu đề modal: "Nhập mã xác thực"
- Thông báo: "Mã xác thực đã được gửi về số [số điện thoại]."
- Ô nhập OTP: 6 ô riêng biệt (hiển thị từng ký tự), thực chất là 1 input ẩn maxlength 6 với inputmode numeric, type text.
- Ô hiện tại (vị trí con trỏ) có viền primary và hiệu ứng scale-105.
- Ô đã nhập có viền primary/50.
- Ô chưa nhập có viền outline-variant/50.
- Thời gian còn lại: "Thời gian còn lại: MM:SS" (đếm ngược từ 180 giây = 3 phút).
- Link "Gửi lại mã" (bên phải đồng hồ) để gửi lại OTP.
- Nút "Tiếp tục" (màu secondary).

Quy tắc validation:
- Chỉ chấp nhận chữ số (tự động loại bỏ ký tự không phải số).
- Phải nhập đủ 6 chữ số → nếu chưa đủ: "Vui lòng nhập đủ 6 chữ số mã xác thực."
- Hệ thống gọi API verifyOtp với payload: { SoDienThoai, otp, MucDich: 'QuenMatKhau', markUsed: false }
- Nếu OTP sai: hiển thị lỗi inline: "Mã xác thực không đúng. Vui lòng thử lại." (hoặc message backend).
- Nếu đúng: dừng đồng hồ, lưu OTP đã xác thực (verifiedOtp), chuyển sang bước 3.
- Nút "Gửi lại mã": gọi lại hàm sendOtp, khởi động lại đồng hồ 180 giây.

---

### Bước 3: Đặt mật khẩu mới (step = 'reset')

Giao diện hiển thị:
- Tiêu đề modal: "Cài đặt mật khẩu mới"
- Hướng dẫn: "Vui lòng nhập mật khẩu mới của bạn."
- Trường 1: "Mật khẩu mới (ít nhất 6 ký tự)" (type password/text toggle, icon khóa trái, icon mắt phải)
- Trường 2: "Nhập lại mật khẩu" (type password/text toggle, icon khóa trái, icon mắt phải)
- Nút "Xác nhận" (màu secondary)
- Cả hai trường đều hỗ trợ toggle hiển thị/ẩn mật khẩu qua icon visibility/visibility_off.
- autocomplete: new-password cho cả hai trường.

Quy tắc validation:
- Mật khẩu mới: bắt buộc, tối thiểu 6 ký tự → nếu không đủ: "Mật khẩu mới phải có ít nhất 6 ký tự."
- Nhập lại mật khẩu: bắt buộc → nếu để trống: "Vui lòng nhập lại mật khẩu mới."
- Hai mật khẩu phải khớp nhau → nếu không khớp: "Mật khẩu nhập lại không khớp."
- Validation tuần tự: kiểm tra mật khẩu mới trước, sau đó mới kiểm tra nhập lại.
- Hệ thống gọi API resetPassword với payload: { SoDienThoai, otp: verifiedOtp, MatKhauMoi }
- Nếu thành công:
  a. Hiển thị toast thành công màu xanh: "Đặt lại mật khẩu thành công!" (slideDown animation).
  b. Lưu lastLoggedInUser vào localStorage.
  c. Sau 1,5 giây: đóng modal và mở lại modal đăng nhập.
- Nếu thất bại: hiển thị lỗi inline: "Đặt lại mật khẩu không thành công. Vui lòng thử lại." (hoặc message backend).

---

## 3. Quy tắc chung của modal

- Nút X (close) ở góc trên phải → đóng modal và reset toàn bộ trạng thái.
- Link "Quay lại Đăng nhập" ở cuối modal → đóng modal hiện tại, mở modal đăng nhập.
- Modal có overlay nền đen mờ (bg-black/40).
- Modal hiển thị trên tất cả các phần tử (z-index 100).
- Toast thành công hiển thị cố định ở giữa màn hình trên cùng (z-index 200).

---

## 4. Bảng các trường dữ liệu

| Trường | Bước | Kiểu | Bắt buộc | Validation |
|---|---|---|---|---|
| Số điện thoại | 1 | text | Có | /^(0\|\+84)\d{9}$/ |
| Mã OTP | 2 | text (6 chữ số) | Có | Đúng 6 ký tự số |
| Mật khẩu mới | 3 | password/text | Có | Tối thiểu 6 ký tự |
| Nhập lại mật khẩu | 3 | password/text | Có | Phải khớp mật khẩu mới |

---

## 5. Bảng các thông báo lỗi

| Mã | Thông báo | Loại | Điều kiện |
|---|---|---|---|
| ERR-FP-01 | Vui lòng nhập đúng số điện thoại gồm 10 chữ số. | Inline error (bước 1) | Sai định dạng SĐT |
| ERR-FP-02 | Số điện thoại này chưa được đăng ký. | Inline error (bước 1) | SĐT không tồn tại trong hệ thống |
| ERR-FP-03 | Vui lòng nhập đủ 6 chữ số mã xác thực. | Inline error (bước 2) | OTP chưa đủ 6 chữ số |
| ERR-FP-04 | Mã xác thực không đúng. Vui lòng thử lại. | Inline error (bước 2) | OTP sai |
| ERR-FP-05 | Mật khẩu mới phải có ít nhất 6 ký tự. | Inline error (bước 3) | Mật khẩu ngắn hơn 6 ký tự |
| ERR-FP-06 | Vui lòng nhập lại mật khẩu mới. | Inline error (bước 3) | Để trống nhập lại mật khẩu |
| ERR-FP-07 | Mật khẩu nhập lại không khớp. | Inline error (bước 3) | Hai mật khẩu không giống nhau |
| ERR-FP-08 | Đặt lại mật khẩu không thành công. Vui lòng thử lại. | Inline error (bước 3) | API reset trả về lỗi |
| SUCCESS-FP-01 | Đặt lại mật khẩu thành công! | Toast success (xanh) | Reset thành công |

---

## 6. Danh sách test scenarios đề xuất

| Mã | Tên test case | Bước | Độ ưu tiên |
|---|---|---|---|
| TC_FP_01 | Nhập SĐT không đúng định dạng (ví dụ: 123) → hiển thị lỗi ERR-FP-01 | 1 | Cao |
| TC_FP_02 | Nhập SĐT chưa đăng ký → hiển thị lỗi ERR-FP-02 | 1 | Cao |
| TC_FP_03 | Nhập SĐT hợp lệ đã đăng ký → chuyển sang bước 2 | 1 | Cao |
| TC_FP_04 | Kiểm tra đồng hồ đếm ngược 3 phút hiển thị đúng | 2 | Trung bình |
| TC_FP_05 | Nhập OTP chưa đủ 6 số → hiển thị lỗi ERR-FP-03 | 2 | Cao |
| TC_FP_06 | Nhập OTP sai → hiển thị lỗi ERR-FP-04 | 2 | Cao |
| TC_FP_07 | Nhập OTP đúng → chuyển sang bước 3 | 2 | Cao |
| TC_FP_08 | Click "Gửi lại mã" → đồng hồ reset về 3 phút | 2 | Trung bình |
| TC_FP_09 | Mật khẩu mới dưới 6 ký tự → hiển thị lỗi ERR-FP-05 | 3 | Cao |
| TC_FP_10 | Để trống nhập lại mật khẩu → hiển thị lỗi ERR-FP-06 | 3 | Cao |
| TC_FP_11 | Nhập lại mật khẩu không khớp → hiển thị lỗi ERR-FP-07 | 3 | Cao |
| TC_FP_12 | Đặt lại mật khẩu thành công → toast "Đặt lại mật khẩu thành công!" → chuyển sang màn hình đăng nhập | 3 | Cao |
| TC_FP_13 | Click nút X đóng modal ở bất kỳ bước nào → modal đóng | 1,2,3 | Trung bình |
| TC_FP_14 | Click "Quay lại Đăng nhập" → mở modal đăng nhập | 1,2,3 | Trung bình |
| TC_FP_15 | Kiểm tra toggle hiển thị/ẩn mật khẩu mới và nhập lại | 3 | Thấp |
