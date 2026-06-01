# TÀI LIỆU YÊU CẦU - MODULE QUẢN LÝ TỪ KHÓA CẤM (BLACKLIST KEYWORDS)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Quản lý Từ khóa cấm & Hạn chế (Blacklist Keywords) |
| Hệ thống | TXP Limousine |
| URL | `/admin/quan-ly-tu-khoa-cam` |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Quản lý Từ khóa cấm & Hạn chế** cung cấp cho Quản trị viên (`QuanTriVien`) công cụ thiết lập bộ lọc từ ngữ nhạy cảm, thô tục, quảng cáo rác (spam) hoặc bôi nhọ dịch vụ. Hệ thống tự động quét và chặn/đánh dấu các Đánh giá (`DANH_GIA`) có chứa từ khóa vi phạm này ở cả Backend trước khi hiển thị cho khách hàng khác trên Portal.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Quản lý Từ khóa (CRUD Keywords)
* **AC-01 (Mã từ khóa tự động):** Mã từ khóa dạng số tăng dần tự động quản lý bởi cơ sở dữ liệu.
* **AC-02 (Cấu hình mức độ vi phạm):** Phân loại mức độ nghiêm trọng vi phạm của từ khóa:
  * `Cao` (High): Vi phạm nặng, tục tĩu, chính trị nhạy cảm. Hệ thống tự động ẩn ngay lập tức.
  * `TrungBinh` (Medium): Chứa nội dung quảng cáo, spam liên kết. Đánh dấu chờ duyệt.
  * `Thap` (Low): Từ ngữ lóng, không lịch sự. Hệ thống cảnh báo thay thế từ ngữ.
* **AC-03 (Chống trùng lặp từ khóa):** 
  * Khi lưu, hệ thống tự động loại bỏ khoảng trắng thừa đầu cuối và đưa về chữ thường (lowercase) để đối chiếu.
  * Nếu từ khóa đã tồn tại trong DB, chặn và báo lỗi Toast: `"Từ khóa 'xxx' đã tồn tại trong danh sách."`
* **AC-04 (Bật/Tắt trạng thái áp dụng):** Cho phép đổi trạng thái nhanh từ `DangApDung` sang `NgungApDung` và ngược lại. Chỉ có từ khóa `DangApDung` mới có hiệu lực quét trong luồng đánh giá của khách hàng.

### 2.2. KPIs & Thống kê từ khóa (Stats Widgets)
* **AC-05:** Hiển thị thời gian thực tổng số lượng từ khóa trong danh sách và phân loại chi tiết theo mức độ (Cao, Trung bình, Thấp) để Quản trị viên theo dõi nhanh.

### 2.3. Lọc và Tìm kiếm nhanh (Query & Tab Filters)
* **AC-06 (Tab Lọc trạng thái):** Gồm 3 Tab:
  * **Tất cả:** Hiển thị toàn bộ từ khóa.
  * **Đang áp dụng:** Chỉ hiển thị từ khóa có trạng thái `DangApDung`.
  * **Ngưng áp dụng:** Chỉ hiển thị từ khóa có trạng thái `NgungApDung`.
* **AC-07 (Bộ lọc nâng cao):** Tìm kiếm text theo nội dung từ khóa, kết hợp lọc theo Mức độ vi phạm (Cao, Trung bình, Thấp) và phân trang 10 dòng/trang.

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Form Thiết lập Từ khóa (Form Model)

| Tên trường | Loại UI | HTML Type | Bắt buộc | Ghi chú |
|------------|---------|-----------|----------|---------|
| **Nội dung từ khóa** | Textbox | text | Có | Không chứa ký tự đặc biệt |
| **Mức độ vi phạm** | Radio/Select | select | Có | Gồm: Cao, Trung bình, Thấp |
| **Trạng thái** | Toggle Switch | button | Có | Mặc định: Đang áp dụng |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Khởi tạo từ khóa cấm thành công (Happy Path)

1. Quản trị viên truy cập `/admin/quan-ly-tu-khoa-cam`.
2. Click nút "Thêm từ khóa mới".
3. Form nhập liệu hiển thị.
4. Nhập nội dung: "lừa đảo".
5. Chọn mức độ vi phạm: "Cao".
6. Click nút "Lưu từ khóa".
7. Backend kiểm duyệt trùng lặp -> Lưu thành công vào DB bảng `TU_KHOA_HAN_CHE` và trả Toast thông báo: `"Đã thêm từ khóa mới 'lừa đảo' vào danh sách."`.
8. Hệ thống tự động cập nhật thống kê KPIs tăng thêm 1 từ khóa mức độ Cao, đưa bài viết hiển thị ở dòng đầu tiên của bảng.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Vui lòng nhập nội dung từ khóa hạn chế. | Toast Warning | Bỏ trống nội dung từ khóa khi bấm Lưu |
| 2 | Từ khóa "xxx" đã tồn tại trong danh sách. | Toast Error | Nhập trùng lặp từ khóa bất kể chữ hoa/thường |
| 3 | Không thể tải danh sách từ khóa cấm từ backend! | Toast Error | Lỗi kết nối máy chủ |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Khi khách hàng viết đánh giá có chứa từ khóa cấm ở mức độ `Cao`, hệ thống sẽ chặn không cho submit luôn ở màn hình khách hàng hay vẫn cho submit nhưng ẩn ở backend? |
| Q-02 | Có hỗ trợ cơ chế quét theo biểu thức chính quy (Regex) hay chỉ so khớp chuỗi tuyệt đối? |
