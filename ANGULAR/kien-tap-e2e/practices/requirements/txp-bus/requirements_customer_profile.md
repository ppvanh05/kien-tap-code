# TÀI LIỆU YÊU CẦU - MODULE HỒ SƠ CÁ NHÂN KHÁCH HÀNG (CUSTOMER PROFILE)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Hồ sơ cá nhân & Đổi mật khẩu |
| Hệ thống | TXP Limousine |
| URL | https://txp-bus.example.com/profile |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Hồ sơ cá nhân & Đổi mật khẩu** cung cấp cho khách hàng đã đăng nhập công cụ quản lý thông tin tài khoản của họ (bao gồm họ tên, giới tính, email, ngày sinh, ảnh đại diện), xem lịch sử các đơn hàng/vé xe đã đặt dưới dạng bảng phân trang và thực hiện đổi mật khẩu có xác thực OTP để đảm bảo an toàn tối đa.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Quản lý thông tin hồ sơ (View & Edit Profile)
* **AC-01 (View Mode):** Hiển thị các thông tin: Họ và tên, Số điện thoại, Giới tính, Email, Ngày sinh.
* **AC-02 (Edit Mode):** Click "Chỉnh sửa hồ sơ" để chuyển sang chế độ chỉnh sửa:
  * Cho phép sửa: Họ tên, Giới tính, Email, Ngày sinh.
  * **Số điện thoại:** Trường khóa, bị disable và không được phép sửa (vì là định danh tài khoản).
* **AC-03 (Avatar upload):** Cho phép tải lên ảnh chân dung. Giới hạn dung lượng tối đa **1MB**, định dạng chấp nhận: `.JPEG`, `.PNG`, `.JPG`. Nếu file quá lớn, hiển thị lỗi: `"File quá lớn, tối đa 1MB"`.
* **AC-04 (Validation):**
  * Họ tên để trống -> Báo lỗi: `"Vui lòng nhập họ tên"`.
  * Email sai định dạng -> Báo lỗi: `"Email không hợp lệ"`.
  * Nút "Cập nhật" chỉ active khi toàn bộ dữ liệu form hợp lệ.

### 2.2. Đổi mật khẩu có xác thực OTP (Password Change with OTP)
* **AC-05 (Nhập mật khẩu mới):** Nhập Mật khẩu hiện tại, Mật khẩu mới và Xác nhận mật khẩu mới. Hỗ trợ nút toggle (icon con mắt) để ẩn/hiện văn bản mật khẩu.
* **AC-06 (Xác thực OTP):** Click "Xác nhận đổi mật khẩu" -> Kích hoạt gửi mã OTP về số điện thoại và mở popup yêu cầu nhập mã OTP xác thực (Đếm ngược 90 giây).
* **AC-07 (Đổi thành công):** Nhập đúng OTP -> Hiển thị Modal thông báo thành công: `"Đổi mật khẩu thành công!"`, đếm ngược 3 giây tự động redirect và yêu cầu khách hàng đăng nhập lại bằng mật khẩu mới tại trang `/login`.

### 2.3. Lịch sử mua vé (Trip Booking History)
* **AC-08 (Bảng lịch sử):** Hiển thị danh sách vé xe đã mua dạng bảng (Mã đơn hàng, Số vé, Tuyến đường, Ngày đi, Số tiền, Trạng thái, Thao tác).
* **AC-09 (Bộ lọc):** Cho phép lọc nhanh theo Mã đơn hàng, Thời gian đi, Tuyến đường và Trạng thái vé (`Chờ thanh toán`, `Chờ khởi hành`, `Đã hoàn thành`, `Đã đánh giá`, `Đã hủy`).
* **AC-10 (Phân trang):** Hiển thị tối đa 10 kết quả/trang. Có phân trang tiến/lùi và nhảy trang trực tiếp.

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Trang Thay đổi mật khẩu (Password Reset Form)

| Tên trường | Loại UI | HTML Type | Bắt buộc | Ghi chú |
|------------|---------|-----------|----------|---------|
| **Mật khẩu hiện tại** | Textbox | password | Có | Hỗ trợ nút ẩn/hiện password |
| **Mật khẩu mới** | Textbox | password | Có | Hỗ trợ nút ẩn/hiện password |
| **Xác nhận mật khẩu** | Textbox | password | Có | Phải trùng khớp với Mật khẩu mới |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Đổi mật khẩu thành công (Happy Path)

1. Khách hàng truy cập `/profile?tab=password`.
2. Nhập Mật khẩu hiện tại: `OldPass123`.
3. Nhập Mật khẩu mới: `NewPass123`, Xác nhận mật khẩu mới: `NewPass123`.
4. Click "Xác nhận đổi mật khẩu".
5. Popup OTP hiển thị và đồng hồ 90s đếm ngược.
6. Nhập đúng mã OTP 6 chữ số gửi về điện thoại.
7. Click "Xác nhận".
8. Modal Thành công hiển thị đếm ngược: 3... 2... 1...
9. Chuyển hướng về trang `/login` và làm sạch form mật khẩu.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Vui lòng nhập họ tên | Client validation | Họ tên để trống khi chỉnh sửa |
| 2 | Email không hợp lệ | Client validation | Nhập email sai định dạng |
| 3 | File quá lớn, tối đa 1MB | Client validation | Upload avatar vượt quá 1MB |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Số lần được phép yêu cầu gửi lại OTP trong màn hình đổi mật khẩu tối đa là bao nhiêu? |
| Q-02 | Lịch sử mua vé có lưu trữ và cho phép xem các đơn hàng đã đặt cách đây bao nhiêu năm (archive policy)? |
