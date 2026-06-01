# TÀI LIỆU YÊU CẦU - MODULE ĐĂNG NHẬP & PHÂN QUYỀN ADMIN (RBAC)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Đăng nhập & Phân quyền Admin (RBAC) |
| Hệ thống | TXP Limousine |
| URL | https://txp-bus.example.com/admin-login |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Đăng nhập & Phân quyền Admin** là cổng xác thực duy nhất cho toàn bộ nhân sự vận hành hệ thống TXP Limousine (Ban quản lý, nhân viên bán vé, nhân viên điều phối, quản trị viên). Sau khi xác thực thành công, hệ thống sẽ căn cứ vào danh sách quyền cụ thể (`Quyen`) lưu trong Database để kết xuất động các menu chức năng tương ứng tại sidebar điều hướng.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Đăng nhập Admin (Admin Authentication)

> Là một nhân viên hệ thống, tôi muốn đăng nhập bằng tài khoản và mật khẩu được cấp để truy cập vào cổng quản trị.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-01 | Nhập đúng Tên truy cập và Mật khẩu hợp lệ -> Đăng nhập thành công và chuyển hướng đến Trang chủ Admin (`/admin/trang-chu`) |
| AC-02 | Để trống Tên truy cập -> Báo lỗi validation thực tế trên form |
| AC-03 | Để trống Mật khẩu -> Báo lỗi validation thực tế trên form |
| AC-04 | Nhập sai tài khoản hoặc mật khẩu -> Hiển thị thông báo Toast error hoặc cảnh báo trên trang |

### 2.2. Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC)

> Là hệ thống quản trị, tôi muốn kiểm soát quyền truy cập của nhân viên dựa trên vai trò thực tế nhằm bảo mật dữ liệu.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-05 | Tài khoản có quyền `ticket` -> Hiển thị menu **Quản lý vé** (gồm: Đặt vé mới, Danh sách vé). Ẩn/Chặn truy cập toàn bộ menu điều hành, nhân viên khác |
| AC-06 | Tài khoản có quyền `dispatch` -> Hiển thị menu **Quản lý điều hành** (gồm: Tuyến xe, Lịch trình, Phương tiện, Tài xế, Điểm đón trả) |
| AC-07 | Tài khoản có quyền `employee` hoặc vai trò `BanQuanLy` -> Hiển thị menu **Quản lý nhân viên** |
| AC-08 | Tài khoản có quyền `log` -> Hiển thị menu **Quản lý nhật ký** (System Auditing Log) |
| AC-09 | Tài khoản có quyền `news`, `policy`, `blacklist` -> Hiển thị menu Quản lý tin tức, Chính sách và Từ khóa cấm |
| AC-10 | Tài khoản có quyền `report` -> Hiển thị menu **Báo cáo** chi tiết và tổng hợp |
| AC-11 | Truy cập trực tiếp bằng URL vào các phân hệ không có quyền -> Bị chặn bởi `AdminGuard` và chuyển hướng ngược lại trang trước hoặc trang lỗi quyền |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Trang Đăng nhập Admin

| Tên trường | Loại UI | HTML Type | Bắt buộc | Ghi chú |
|------------|---------|-----------|----------|---------|
| **Tên truy cập** | Textbox | text | Có | Không dùng định dạng Email |
| **Mật khẩu** | Textbox | password | Có | Masked password mặc định |
| **Đăng nhập** | Button | submit | N/A | Trigger POST request xác thực |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Đăng nhập thành công & Phân phối giao diện theo quyền (NhanVienBanVe)

1. Người dùng truy cập trang `/admin-login`.
2. Nhập Tên truy cập của nhân viên bán vé (VD: `nhanvienbanve1`).
3. Nhập mật khẩu hợp lệ.
4. Click "Đăng nhập".
5. Backend xác thực tài khoản có thuộc tính `Quyen: ["ticket"]`.
6. Chuyển hướng thành công sang `/admin/trang-chu`.
7. Sidebar điều hướng chỉ hiển thị duy nhất menu:
   - **Trang chủ**
   - **Quản lý vé** (Đặt vé mới, Danh sách vé)
8. Các menu Quản lý điều hành, Quản lý nhân viên, Báo cáo, Nhật ký hoàn toàn biến mất khỏi giao diện của nhân viên này.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Vui lòng nhập tên truy cập | Client validation | Tên truy cập để trống |
| 2 | Vui lòng nhập mật khẩu | Client validation | Mật khẩu để trống |
| 3 | Tên truy cập hoặc mật khẩu không chính xác | Server-side alert | Sai tài khoản/mật khẩu khi submit |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Có khóa tài khoản nhân viên tạm thời nếu nhập sai mật khẩu quá 5 lần hay không? |
| Q-02 | Token đăng nhập của nhân viên có thời gian hết hạn sau bao lâu? |
