# TÀI LIỆU YÊU CẦU - MODULE QUẢN LÝ TÀI KHOẢN (ACCOUNTS MANAGEMENT)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Quản lý Tài khoản Khách hàng & Nhân viên |
| Hệ thống | TXP Limousine |
| URL | `/admin/quan-ly-khach-hang` và `/admin/quan-ly-nhan-vien` |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Quản lý Tài khoản** cung cấp cho Ban quản lý (`BanQuanLy`) công cụ kiểm soát và phân quyền toàn bộ người dùng trong hệ thống bao gồm: hồ sơ khách hàng đã đăng ký từ cổng Portal và hồ sơ của toàn bộ nhân viên vận hành bến xe (phân bổ mảng quyền chức năng và phân cấp vai trò).

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Quản lý Tài khoản Khách hàng (Customer Accounts)
* **AC-01 (Danh sách khách hàng):** Hiển thị bảng danh sách khách hàng gồm: Họ tên, Số điện thoại, Email, Giới tính, Ngày đăng ký, và Trạng thái hoạt động.
* **AC-02 (Khóa/Mở khóa tài khoản):** 
  * Khi phát hiện khách hàng có hành vi spam, đặt vé ảo hoặc quấy phá hệ thống, Ban quản lý được phép **Khóa tài khoản** (`DaKhoa`). Khi chọn Khóa, bắt buộc phải nhập **Lý do khóa** (Lưu vào DB).
  * Cho phép Mở khóa lại tài khoản về trạng thái `HoatDong`.
* **AC-03 (Tìm kiếm & Bộ lọc):** Tìm kiếm nhanh theo Số điện thoại hoặc Họ tên khách hàng, kết hợp lọc theo Trạng thái tài khoản (Hoạt động / Đã khóa).

### 2.2. Quản lý Tài khoản Nhân viên & Phân quyền RBAC (Employee & Permission Settings)
* **AC-04 (Danh sách nhân viên):** Quản lý toàn bộ nhân viên vận hành bến.
* **AC-05 (Thêm mới / Cập nhật Nhân viên):** Nhập Tên truy cập, Mật khẩu (masked), Họ tên, Số điện thoại, Email, Giới tính, Địa chỉ và cấu hình **Vai trò** (Ban quản lý, Nhân viên bán vé, Nhân viên điều phối, Quản trị viên).
* **AC-06 (Phân quyền chức năng động - Permissions Setup):** 
  * Cho phép Ban quản lý tích chọn phân bổ trực tiếp từng quyền chức năng cụ thể vào danh sách quyền (`Quyen`) của nhân viên:
    * `ticket` (Quản lý vé)
    * `dispatch` (Quản lý điều hành)
    * `news` (Quản lý tin tức)
    * `policy` (Quản lý chính sách)
    * `blacklist` (Quản lý từ khóa cấm)
    * `report` (Xem báo cáo)
    * `log` (Xem nhật ký hệ thống)
* **AC-07 (Khóa tài khoản nhân viên):** Cho phép khóa tài khoản nhân viên nghỉ việc hoặc vi phạm quy chế để chặn đăng nhập ngay lập tức.

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Form Phân quyền & Thiết lập Nhân viên (Employee Form Model)

| Tên trường | Loại UI | HTML Type | Bắt buộc | Ghi chú |
|------------|---------|-----------|----------|---------|
| **Tên truy cập** | Textbox | text | Có | Không chứa khoảng trắng |
| **Mật khẩu** | Textbox | password | Chỉ khi thêm mới | Tối thiểu 8 ký tự, có số, chữ hoa |
| **Vai trò** | Dropdown | select | Có | Quyết định vai trò mặc định |
| **Quyền cụ thể**| Checkbox List | checkbox | Có | Mảng `Quyen` của nhân viên |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Thêm mới Nhân viên Bán vé & Phân quyền chức năng (Happy Path)

1. Ban quản lý truy cập `/admin/quan-ly-nhan-vien`.
2. Click nút "Thêm nhân viên mới".
3. Nhập Tên truy cập: `banve_premium`, Mật khẩu: `SecurePass123`.
4. Nhập Họ tên: "Trần Thị C", Số điện thoại: `0912345678`, Email: `c.tran@example.com`.
5. Chọn Vai trò: "Nhân viên bán vé".
6. Tại danh sách quyền, tích chọn duy nhất quyền: `ticket` (Quản lý vé).
7. Click "Lưu thông tin".
8. Backend kiểm tra không trùng lặp Tên truy cập -> Lưu thành công vào DB bảng `NHAN_VIEN` và ghi mảng `Quyen: ["ticket"]`.
9. Khi nhân viên `banve_premium` đăng nhập, họ chỉ nhìn thấy duy nhất menu bán vé trên giao diện.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Tên truy cập này đã được sử dụng | Server-side alert | Trùng tên đăng nhập của nhân sự khác |
| 2 | Vui lòng nhập lý do khóa tài khoản khách hàng | Client validation | Không nhập lý do khi bấm khóa |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Khi tài khoản khách hàng bị khóa, họ có thể sử dụng SĐT cũ để đăng ký tài khoản mới khác không? (Thông thường là chặn đăng ký bằng SĐT đã bị khóa). |
