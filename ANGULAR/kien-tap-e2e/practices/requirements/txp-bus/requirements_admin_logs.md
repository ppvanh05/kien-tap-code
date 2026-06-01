# TÀI LIỆU YÊU CẦU - MODULE QUẢN LÝ NHẬT KÝ HỆ THỐNG (SYSTEM AUDIT LOG)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Quản lý Nhật ký Hệ thống (System Audit Log) |
| Hệ thống | TXP Limousine |
| URL | https://txp-bus.example.com/admin/quan-ly-nhat-ky |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Quản lý Nhật ký Hệ thống** cung cấp giải pháp lưu trữ, theo dõi và truy vết (Audit Trail) toàn bộ các hoạt động thay đổi cấu trúc dữ liệu phát sinh trên hệ thống bởi nhân viên, ban quản lý hoặc khách hàng. Module này đóng vai trò quan trọng trong việc giám sát bảo mật, điều tra lỗi nghiệp vụ và khôi phục trạng thái khi cần thiết.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Tự động ghi nhận Nhật ký (Auto Auditing)
* **Ghi nhận mọi giao dịch ghi (Write Actions):** Hệ thống tự động ghi lại nhật ký khi có hành động Thêm mới (Create), Chỉnh sửa (Update), Xoá (Delete), Đăng nhập/Đăng xuất (Login/Logout), hoặc Thay đổi trạng thái tài khoản.
* **Thông tin thu thập bắt buộc:**
  * **Định danh:** ID Người thực hiện (`MaNhanVien` hoặc `MaKhachHang`).
  * **Loại thao tác:** `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`.
  * **Nội dung thao tác:** Mô tả chi tiết hành động thực hiện.
  * **Thời gian:** Mốc thời gian chính xác phát sinh sự kiện (`ThoiGian`).
  * **Địa chỉ IP:** Địa chỉ IP mạng của thiết bị thực hiện thao tác.
  * **Trình duyệt & Thiết bị:** Chuỗi User-Agent chi tiết của thiết bị/trình duyệt đang dùng.

### 2.2. So sánh thay đổi dữ liệu (Data Diff Tracking)
* **Lưu trữ sự thay đổi:** Với mỗi thao tác `UPDATE`, hệ thống bắt buộc phải bắt gói cấu trúc dữ liệu cũ và mới lưu dưới dạng JSON tại trường `DuLieuThayDoi`.
* **Cột so sánh trạng thái:** Ghi nhận rõ `TrangThaiCu` và `TrangThaiMoi` để theo dõi nhanh tiến trình chuyển đổi vòng đời của đối tượng dữ liệu (Ví dụ: trạng thái vé đổi từ `ChoKhoiHanh` sang `DaHuy`).

### 2.3. Tra cứu và Bộ lọc Nhật ký (Audit Querying & Filters)
* **Bộ lọc nâng cao:** Hỗ trợ lọc nhật ký theo Nhân viên thực hiện, Khoảng thời gian (Từ ngày - Đến ngày), Loại thao tác (Thêm/Sửa/Xóa), hoặc tìm kiếm trực tiếp theo Nội dung chi tiết.

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Cấu trúc bảng ghi Nhật ký Hệ thống

| Tên trường | Loại UI | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|---------|--------------|----------|---------|
| **Mã Nhật ký** | Label | String (VarChar) | Có | Khoá chính duy nhất tự động sinh |
| **Tài khoản thực hiện**| Link | String (VarChar) | Không | Liên kết đến bảng Khách hàng hoặc Nhân viên |
| **Loại thao tác** | Label | String | Có | Ví dụ: UPDATE, DELETE, CREATE |
| **Thời gian** | Label | DateTime | Có | Mốc thời gian chính xác hệ thống |
| **Địa chỉ IP** | Label | String | Có | IP thiết bị ghi nhận từ Header request |
| **Dữ liệu thay đổi** | JSON Viewer | Json | Không | Chứa diff dữ liệu cũ và mới của bản ghi |
| **Trạng thái cũ** | Label | String | Không | Trạng thái trước khi cập nhật |
| **Trạng thái mới** | Label | String | Không | Trạng thái sau khi cập nhật |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Ghi nhận Nhật ký tự động khi Huỷ vé xe (Happy Path)

1. Nhân viên bán vé click nút "Huỷ vé" của vé có mã `VE-00987`.
2. Hệ thống xử lý cập nhật trạng thái vé từ `ChoKhoiHanh` sang `DaHuy`.
3. Song song với việc cập nhật dữ liệu vé, Backend kích hoạt interceptor ghi nhật ký hệ thống:
   - Tạo mã nhật ký mới.
   - Ghi nhận `MaNhanVien` thực hiện.
   - Ghi nhận loại thao tác: `UPDATE_TICKET_STATUS`.
   - Ghi nhận `TrangThaiCu: "ChoKhoiHanh"`, `TrangThaiMoi: "DaHuy"`.
   - Bắt gói thông tin IP, Thiết bị của nhân viên bán vé.
4. Lưu bản ghi nhật ký vào database.
5. Ban quản lý truy cập trang Nhật ký Hệ thống ngay lập tức nhìn thấy dòng log ghi nhận hoạt động huỷ vé vừa thực hiện.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

* *Lưu ý:* Module Nhật ký hệ thống mang tính chất ghi nhận tự động (Read-only đối với nhân sự vận hành), do đó không có validation form hay thông báo lỗi nhập liệu cho người dùng.

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Nhật ký hệ thống có cơ chế tự động dọn dẹp hoặc lưu trữ (archive) ra tệp tin độc lập sau bao nhiêu tháng hay không (VD: Giữ log tối đa 6 tháng)? |
| Q-02 | Có cần phân quyền xem nhật ký cụ thể theo từng loại thao tác (nhân viên chỉ xem log của chính mình, Ban quản lý xem toàn bộ) hay không? |
