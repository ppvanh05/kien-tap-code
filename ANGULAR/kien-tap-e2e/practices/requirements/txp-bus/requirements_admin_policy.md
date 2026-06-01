# TÀI LIỆU YÊU CẦU - MODULE QUẢN LÝ CHÍNH SÁCH & QUY ĐỊNH (POLICY MANAGEMENT)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Quản lý Chính sách & Điều khoản hoàn hủy |
| Hệ thống | TXP Limousine |
| URL | `/admin/quan-ly-chinh-sach` |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Quản lý Chính sách & Quy định** cho phép Quản trị viên (`QuanTriVien`) và Ban quản lý thiết lập các chính sách nền tảng cho hệ thống, đặc biệt là **Chính sách hoàn trả / hủy vé xe** (`cancellation`), **Chính sách bảo hiểm hành trình** (`insurance`), và **Chính sách thanh toán** (`payment`). Khách hàng trên Portal và Nhân viên bán vé ở Admin Portal sẽ được áp dụng tự động các chính sách này khi tiến hành giao dịch.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Cấu hình Chính sách Chung (insurance, payment, other)
* **AC-01 (Phân loại chính sách):** Biên tập bài viết chính sách và gán danh mục:
  * `insurance` (Chính sách bảo hiểm hành khách)
  * `payment` (Chính sách quy định thanh toán trực tuyến)
  * `other` (Các chính sách/quy định khác như hành lý ký gửi, vận chuyển thú cưng...)
* **AC-02 (WYSIWYG Editor):** Soạn thảo tài liệu bằng bộ Editor phong phú: Định dạng chữ (đậm, nghiêng, gạch chân), chọn kiểu Font chữ (Inter, Roboto, Arial,...), chèn liên kết hyperlink, chèn ảnh, căn lề và co giãn độ rộng ảnh (%) thông qua slider/kéo thả.
* **AC-03 (Bật/Tắt chính sách):** Có thể bật `DangApDung` hoặc tắt sang `VoHieuHoa` (Ngừng áp dụng) chính sách kèm theo **hộp thoại xác nhận (Confirmation Dialog)** trước khi đổi trạng thái.

### 2.2. Cấu hình Mốc hoàn tiền Hủy vé động (Cancellation Policy Milestones)
* **AC-04 (Cấu hình mốc giờ):** Chỉ riêng đối với loại chính sách hủy vé (`cancellation`), giao diện mở thêm tính năng thêm/bớt hàng loạt **Mốc giờ hoàn tiền động** (`milestones`).
* **AC-05 (Ràng buộc mốc):** Mỗi mốc gồm:
  * **Số giờ trước khởi hành** (hoursBeforeDeparture): ví dụ `24` giờ.
  * **Tỷ lệ hoàn trả tiền vé** (refundPercentage): ví dụ `100`% (Hoàn tiền đầy đủ).
* **AC-06 (Tính toán tự động ở Backend):** Các mốc giờ này sẽ được Backend lưu trữ trực tiếp vào bảng `CHINH_SACH_HUY_VE` để tự động tính toán tiền hoàn và phí hủy vé khi nhân viên bấm Hủy vé.

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Form Cấu hình Chính sách hủy vé (Cancellation Policy Form)

| Tên trường | Loại UI | HTML Type | Bắt buộc | Ghi chú |
|------------|---------|-----------|----------|---------|
| **Tiêu đề** | Textbox | text | Có | Tên chính sách hủy vé |
| **Ngày áp dụng** | Date Picker | date | Có | Ngày bắt đầu có hiệu lực |
| **Số giờ trước chạy**| Number Input | number | Có | Ví dụ: 24, 12, 6 tiếng |
| **Tỷ lệ hoàn trả** | Number Input | number | Có | Giá trị phần trăm từ 0 - 100% |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Thiết lập Chính sách Hủy vé 3 Mốc hoàn tiền mới (Happy Path)

1. Quản trị viên truy cập `/admin/quan-ly-chinh-sach`.
2. Click nút "Thêm mới" -> Chọn "Chính sách hủy vé".
3. Nhập tiêu đề: "Chính sách hủy vé mùa cao điểm hè 2026".
4. Chọn ngày áp dụng: `2026-06-01`.
5. Tại bảng Mốc hoàn trả, bấm "Thêm mốc" để nhập 3 dòng:
   * Mốc 1: `24` giờ trước khởi hành -> Hoàn trả `100`%.
   * Mốc 2: `12` giờ trước khởi hành -> Hoàn trả `50`%.
   * Mốc 3: `6` giờ trước khởi hành -> Hoàn trả `20`%.
6. Click "Lưu chính sách".
7. Backend kiểm tra tính hợp lý của ngày và dữ liệu -> Lưu thành công vào DB bảng `CHINH_SACH_HUY_VE` và cập nhật chính sách sang trạng thái `DangApDung`.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Mốc thời gian hoàn tiền không được để trống | Form warning | Không nhập số giờ hoặc tỷ lệ ở bảng mốc |
| 2 | Tỷ lệ hoàn trả phải nằm trong khoảng từ 0% đến 100% | Form validation | Nhập tỷ lệ vượt quá 100% |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Khi kích hoạt một chính sách hủy vé mới, các chính sách hủy vé cũ có tự động chuyển sang trạng thái `VoHieuHoa` hay không (vì hệ thống chỉ được áp dụng 1 chính sách hủy tại 1 thời điểm)? |
