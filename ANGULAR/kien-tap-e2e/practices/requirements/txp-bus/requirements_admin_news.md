# TÀI LIỆU YÊU CẦU - MODULE QUẢN LÝ TIN TỨC & HƯỚNG DẪN (NEWS MANAGEMENT)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Quản lý Tin tức, Hướng dẫn & Sự kiện |
| Hệ thống | TXP Limousine |
| URL | `/admin/quan-ly-tin-tuc` |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Quản lý Tin tức & Hướng dẫn** cho phép Quản trị viên (`QuanTriVien`) và Ban quản lý biên tập, định dạng phong phú (WYSIWYG Rich Text) và đăng tải các bài viết về sự kiện, hướng dẫn đặt vé, tuyển dụng hoặc chương trình khuyến mãi của TXP Limousine lên trang chủ của khách hàng. Module cũng tích hợp tính năng Hẹn giờ đăng bài tự động và theo dõi lịch sử hoạt động ghi chép nhật ký của bài viết.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Quản lý nội dung bài viết (CRUD News)
* **AC-01 (Mã bài viết tự động):** Mã bài viết dạng `TTxxx` (Ví dụ: `TT001`, `TT002`) được hệ thống tự động tính toán sinh ra khi bấm thêm mới dựa trên mã lớn nhất hiện tại cộng thêm 1.
* **AC-02 (Phân loại bài viết):** Người dùng có thể phân loại bài viết vào các danh mục:
  * `TinTuc` (Tin tức chung)
  * `ThongBao` (Thông báo)
  * `KhuyenMai` (Khuyến mãi)
  * `SuKien` (Sự kiện)
  * `HuongDan` (Hướng dẫn)
  * `TuyenDung` (Tuyển dụng)
* **AC-03 (Ảnh đại diện bài viết - Cover Image):** Hỗ trợ 2 phương án:
  * Chọn từ danh sách các ảnh đẹp có sẵn (Preset Images).
  * Tải ảnh lên trực tiếp từ thiết bị (Hỗ trợ dung lượng ảnh dưới **2MB**). Hệ thống tự động chuyển đổi sang chuỗi base64 hoặc lưu trữ để hiển thị.
* **AC-04 (WYSIWYG Rich Text Editor):**
  * Hỗ trợ định dạng đầy đủ: Chữ đậm (Bold), Chữ nghiêng (Italic), Gạch chân (Underline), Đổi kiểu Font chữ, Cỡ chữ, Căn lề đoạn văn bản, Chèn Danh sách thứ tự/không thứ tự.
  * Hỗ trợ nút chèn liên kết custom: Mở Modal nhập mô tả văn bản liên kết và địa chỉ URL.
  * Hỗ trợ chèn ảnh nội dung (Inline Image): Dán URL ảnh hoặc upload trực tiếp từ máy tính.
  * **Cơ chế tương tác ảnh trong editor:** Khi nhấp chọn ảnh nội dung, ảnh hiển thị đường viền cam nổi bật cùng 4 góc resize. Kéo thả góc resize để thay đổi kích thước ảnh co dãn linh hoạt theo tỷ lệ phần trăm rộng (%) của khung editor.

### 2.2. Trạng thái bài viết & Hẹn giờ đăng (Status & Scheduler)
* **AC-05 (Trạng thái bài viết):** Gồm 4 trạng thái:
  * `BanNhap` (Bản nháp): Chưa hiển thị cho khách hàng.
  * `DaDang` (Đã đăng): Hiển thị ngay trên trang chủ khách hàng.
  * `NgungHienThi` (Ngừng hiển thị): Ẩn bài viết khỏi trang chủ.
  * `HenGio` (Hẹn giờ): Tự động đổi trạng thái sang `DaDang` khi đến đúng giờ cấu hình.
* **AC-06 (Hẹn giờ đăng bài):** Khi chọn trạng thái `HenGio`, bắt buộc người dùng cấu hình Ngày hẹn giờ và Giờ hẹn giờ cụ thể trong tương lai.
* **AC-07 (Bài viết nổi bật):** Tích chọn `Nổi bật (NoiBat = true)` bài viết sẽ được ưu tiên đưa lên banner đầu trang chủ khách hàng.

### 2.3. Lọc nâng cao & Nhật ký thao tác (Logs & Filters)
* **AC-08 (Advanced filters):** Lọc bài viết theo trạng thái thông qua các Tabs điều hướng nhanh: Tất cả, Đã đăng, Bản nháp, Ngừng hiển thị, Hẹn giờ. Kết hợp ô tìm kiếm và sắp xếp (Mới nhất, Cũ nhất, Bảng chữ cái).
* **AC-09 (Nhật ký thao tác chi tiết):** Mỗi thay đổi của bài viết được hiển thị cụ thể tại Tab nhật ký hoạt động (Ghi nhận mã thao tác, thời gian, IP, người thực hiện và nội dung chi tiết).

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Form Thiết lập bài viết (Form Model)

| Tên trường | Loại UI | HTML Type | Bắt buộc | Ghi chú |
|------------|---------|-----------|----------|---------|
| **Tiêu đề** | Textbox | text | Có | Tiêu đề lớn hiển thị bài viết |
| **Ảnh bìa** | Textbox/File Input | text | Có | URL ảnh bìa hoặc file upload |
| **Loại tin tức**| Dropdown Select | select | Có | Mặc định: Tin tức chung |
| **Mô tả ngắn** | Textarea | textarea | Có | Tối đa 255 ký tự hiển thị xem trước |
| **Nội dung** | Rich Text Editor | contenteditable | Có | Nội dung đầy đủ của bài viết |
| **Hẹn giờ đăng**| Date & Time Picker | date / time | Chỉ khi chọn trạng thái Hẹn giờ | Phải lớn hơn thời gian hiện tại |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Tạo mới và Hẹn giờ đăng bài viết (Happy Path)

1. Quản trị viên truy cập `/admin/quan-ly-tin-tuc`.
2. Click nút "Thêm bài viết".
3. Mã bài viết tự động sinh ra (Ví dụ: `TT025`).
4. Nhập tiêu đề: "Chương trình khuyến mãi hè 2026 cùng TXP".
5. Chọn ảnh bìa từ danh sách preset đề xuất.
6. Chọn Loại tin tức: "Khuyến mãi".
7. Nhập nội dung chi tiết bài viết, định dạng chữ đậm và chèn link liên kết.
8. Chọn Trạng thái: "Hẹn giờ".
9. Nhập Ngày hẹn giờ: `2026-06-01`, Giờ hẹn giờ: `08:00` sáng.
10. Click nút "Lưu bài viết".
11. Bài viết được lưu vào cơ sở dữ liệu ở trạng thái `HenGio`. Giao dịch ghi nhật ký hoạt động `"Tạo bài viết TT025 ở trạng thái Hẹn giờ"` được tạo. Giao diện đưa người dùng về Tab "Hẹn giờ".

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Vui lòng nhập tiêu đề bài viết | Form validation | Tiêu đề bị bỏ trống |
| 2 | Ảnh đại diện bài viết không được vượt quá 2MB | Form warning | Upload file ảnh quá nặng |
| 3 | Thời gian hẹn giờ đăng phải nằm trong tương lai | Form validation | Chọn giờ hẹn bé hơn thời gian hiện tại |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Khi bài viết đang ở trạng thái `HenGio`, nếu thay đổi sang `BanNhap` thì cron job quét bài viết hẹn giờ ở backend có tự động hủy lịch quét cho bài viết này không? |
| Q-02 | Có giới hạn số lượng bài viết tối đa được cấu hình `NoiBat = true` để hiển thị trên slider của khách hàng không (VD: chỉ hiển thị tối đa 5 bài nổi bật nhất)? |
