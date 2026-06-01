# TÀI LIỆU YÊU CẦU - MODULE QUẢN LÝ ĐIỀU HÀNH (ADMIN OPERATION)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Quản lý Điều hành (Admin Operation) |
| Hệ thống | TXP Limousine |
| URL | https://txp-bus.example.com/admin/quan-ly-dieu-hanh |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Quản lý Điều hành** cung cấp công cụ toàn diện cho Nhân viên điều phối (`NhanVienDieuPhoi`) và Ban quản lý thiết lập hạ tầng dịch vụ vận tải của TXP Limousine bao gồm: Tuyến đường chạy, Chuyến chạy chi tiết theo ngày, Hồ sơ xe Limousine, Danh sách Tài xế/Phụ xe, và các Điểm dừng đón/trả khách dọc tuyến.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Quản lý Tuyến xe (Route Management)
* **Khai báo Tuyến xe:** Nhập Điểm khởi hành, Điểm đến, Khoảng cách (km), và Thời gian di chuyển dự kiến.
* **Ràng buộc nghiệp vụ:**
  * Điểm khởi hành và Điểm đến bắt buộc không được trùng khớp nhau.
  * Khoảng cách phải là số dương lớn hơn 0.

### 2.2. Quản lý Lịch trình chuyến chạy (Schedule & Trips)
* **Tạo Lịch trình chạy xe:** Gán Tuyến xe cụ thể, chọn Ngày khởi hành, Giờ khởi hành, Giờ đến dự kiến, và cấu hình Giá vé cơ bản của chuyến chạy.
* **Ràng buộc nghiệp vụ chống xung đột lịch chạy (Strict Conflicts validation):**
  * **Tránh xung đột Phương tiện:** Một đầu xe Limousine không được gán đồng thời cho hai Lịch trình có thời gian di chuyển đè lên nhau.
  * **Tránh xung đột Nhân sự:** Một Tài xế/Phụ xe chỉ được phân công làm việc trên một chuyến xe tại một thời điểm nhất định. Khoảng thời gian nghỉ giữa 2 chuyến đi của cùng một tài xế phải tuân thủ quy định tối thiểu của bến xe.

### 2.3. Quản lý Phương tiện (Vehicle Management)
* **Khai báo xe Limousine:** Quản lý Biển số xe, Tên xe, Số tầng, Số dãy ghế, và Tổng số phòng cabin VIP thực tế.
* **Theo dõi đăng kiểm và bảo hiểm:**
  * Cảnh báo tự động nếu ngày hiện tại vượt quá Hạn đăng kiểm (`HanDangKiem`) hoặc Hạn bảo hiểm (`HanBaoHiem`).
  * Xe hết hạn kiểm định/bảo hiểm sẽ tự động bị chặn không cho phép phân lịch chạy mới.

### 2.4. Quản lý Tài xế & Phụ xe (Driver & Crew Management)
* **Hồ sơ tài xế:** Họ tên, Ngày sinh, Số điện thoại, CCCD, Loại bằng lái (Hạng D, E trở lên cho xe khách), Thời hạn bằng lái, Ảnh chân dung, Ảnh bằng lái hai mặt.
* **Ràng buộc bằng lái:** Tài xế có Thời hạn bằng lái sắp hết hạn hoặc đã quá hạn sẽ bị hệ thống cảnh báo và loại trừ khỏi danh sách phân công lịch chạy chuyến.

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Thêm mới Lịch trình chạy (Add Trip)

| Tên trường | Loại UI | HTML Type | Bắt buộc | Ghi chú |
|------------|---------|-----------|----------|---------|
| **Tuyến xe** | Dropdown Select | select | Có | Chọn từ danh sách Tuyến xe đang hoạt động |
| **Ngày khởi hành**| Date Picker | date | Có | Phải $\ge$ Ngày hiện tại |
| **Giờ khởi hành** | Time Picker | time | Có | Định dạng hh:mm |
| **Giờ đến dự kiến**| Time Picker | time | Có | Phải sau Giờ khởi hành |
| **Phương tiện** | Dropdown Select | select | Có | Chỉ hiển thị các xe rảnh lịch và còn hạn đăng kiểm |
| **Tài xế chính** | Dropdown Select | select | Có | Chỉ hiển thị tài xế rảnh lịch và có bằng lái hợp lệ |
| **Phụ xe** | Dropdown Select | select | Không | Phân công phụ tá chuyến |
| **Giá vé cơ bản** | Number Input | number | Có | Giá phòng đơn cabin VIP. Phải > 0 |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Tạo mới Chuyến chạy thành công (Happy Path)

1. Người dùng (nhân viên điều phối) truy cập `/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh`.
2. Click nút "Thêm lịch trình mới".
3. Form nhập liệu hiển thị.
4. Chọn Tuyến xe: "Bình Định - TP. Hồ Chí Minh".
5. Chọn Ngày khởi hành: ngày mai.
6. Nhập Giờ khởi hành: `19:00`, Giờ đến dự kiến: `05:00` sáng hôm sau.
7. Chọn Phương tiện: Xe Limousine biển số `77B-012.34`.
8. Chọn Tài xế: `Nguyễn Văn A`.
9. Nhập Giá vé cơ bản: `350.000` VNĐ.
10. Click "Lưu lịch trình".
11. Hệ thống xác thực không có xung đột lịch hoạt động của xe và tài xế -> Tạo lịch trình thành công và đổi trạng thái chuyến sang `ChoKhoiHanh`.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Phương tiện này đã được gán cho một chuyến xe khác trong khung giờ này | Server-side error | Trùng lịch xe chạy |
| 2 | Tài xế đã có lịch làm việc trùng với khung giờ di chuyển | Server-side error | Trùng lịch tài xế chạy |
| 3 | Thời hạn đăng kiểm của xe đã hết hạn | Validation warning | Phân bổ xe hết hạn đăng kiểm |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Khoảng thời gian nghỉ tối thiểu yêu cầu giữa hai chuyến liên tiếp của cùng một tài xế là mấy tiếng? |
| Q-02 | Xe chuẩn bị hết hạn đăng kiểm bao nhiêu ngày thì hệ thống bắt đầu hiển thị cảnh báo đỏ? |
