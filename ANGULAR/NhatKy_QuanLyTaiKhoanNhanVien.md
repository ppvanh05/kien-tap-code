# Nhật ký phát triển chức năng Quản lý Tài khoản Nhân viên

## 1. Thông tin chung
- **Chức năng**: Quản lý Tài khoản Nhân viên
- **Framework**: Angular (TypeScript)
- **Ngày bắt đầu**: 2026-05-16

## 2. Phân tích yêu cầu & Brainstorming
### Giao diện chính:
- Danh sách nhân viên với các cột: ID, Tên truy cập, Tên hiển thị, Loại tài khoản, Chức năng.
- Bộ lọc: Theo trạng thái (Tất cả, Đang hoạt động, Đã khóa), Tìm kiếm theo ID/Tên.
- Nút "Thêm tài khoản mới".

### Giao diện Modal (Thêm/Sửa):
- **Tab 1: Thông tin cơ bản**
    - Tên truy cập (bắt buộc)
    - Mật khẩu (bắt buộc khi thêm mới, có toggle đổi mật khẩu khi sửa)
    - Họ và tên đệm, Tên, Tên hiển thị
    - Giới tính, Ngày sinh
    - Loại tài khoản (Văn phòng/Đại lý - Theo hình mẫu)
    - Ảnh đại diện, Ghi chú
    - Trạng thái: Hoạt động/Vô hiệu hóa (Khóa tài khoản)
- **Tab 2: Phân quyền**
    - Phân quyền theo vai trò: Bán vé, Điều phối, Ban quản lý, Quản trị viên.
- **Tab 3: Thông tin liên hệ**
    - Địa chỉ, Số điện thoại, Email, Fax, WhatsApp, Skype.

### Ý tưởng bổ sung (Brainstorming):
1. **Lịch sử hoạt động**: Xem nhật ký thao tác riêng của từng nhân viên (từ bảng `NHAT_KY_HE_THONG`).
2. **Quản lý thiết bị**: Cho phép xem các IP/Thiết bị đã đăng nhập.
3. **Phân công tuyến**: Đối với nhân viên điều phối (liên kết với bảng `NHAN_VIEN_DIEU_PHOI`).
4. **Báo cáo hiệu suất**: Đối với nhân viên bán vé (doanh thu, số lượng vé đã bán).
5. **Cảnh báo bảo mật**: Cảnh báo khi tài khoản đăng nhập từ vị trí lạ.

### Giao diện đề xuất mở rộng cho hệ thống:
1. **Dashboard Tổng hợp**: Biểu đồ doanh thu, thống kê vé bán chạy theo tuyến, tỷ lệ lấp đầy ghế.
2. **Quản lý Chuyến xe & Lịch trình**: Chế độ xem Calendar, kéo thả tài xế/phụ xe vào chuyến.
3. **Thiết kế Sơ đồ Ghế**: Công cụ kéo thả để tạo layout ghế cho các dòng xe khác nhau (Gường nằm, Limousine).
4. **Quản lý Khuyến mãi & Voucher**: Tạo mã giảm giá, thiết lập điều kiện áp dụng và thời hạn.
5. **Hệ thống Kiểm duyệt Đánh giá**: Tự động lọc đánh giá dựa trên `TU_KHOA_HAN_CHE`, phản hồi khách hàng.
6. **Báo cáo Tài chính**: Xuất file Excel/PDF doanh thu đại lý, chi phí vận hành.

## 3. Cấu trúc thư mục (Dự kiến)
- `models/nhan-vien.model.ts`
- `services/nhan-vien.service.ts`
- `components/nhan-vien-list/`
- `components/nhan-vien-form/`
- `components/nhan-vien-detail/`

## 4. Nhật ký thực hiện
- **2026-05-16**: 
    - Khởi tạo nhật ký, phân tích schema DB và thiết kế giao diện.
    - Định nghĩa models (TypeScript interfaces) dựa trên schema.
    - Xây dựng `NhanVienService` với dữ liệu giả lập (mock data).
    - Triển khai Component `QuanLyTaiKhoanNhanVien`:
        - HTML: Cấu trúc danh sách và Modal 3 tab (Thông tin cơ bản, Phân quyền, Liên hệ).
        - CSS: Sử dụng biến màu từ layout chính, thiết kế giao diện premium với hiệu ứng glassmorphism nhẹ và transitions mượt mà.
        - TS: Xử lý logic lọc, tìm kiếm, phân trang và CRUD cơ bản trên giao diện.
    - Cấu hình Route cho chức năng mới trong `admin.routes.ts`.
    - **Tối ưu hóa UI/UX & Hoàn thiện Giao diện**:
        - Gọn gàng hóa danh sách: Chỉ hiển thị nút Chỉnh sửa ở cột chức năng.
        - Tái cấu trúc Tab Phân quyền: Chuyển sang bố cục dọc (Sidebar trái + Danh sách Toggle bên phải) theo mẫu yêu cầu.
        - Sử dụng Toggle Switch thay cho checkbox truyền thống để tăng tính hiện đại.
        - Thiết kế Radio Cards cho việc chọn vai trò (Role Selection) trực quan hơn.
        - Đảm bảo đầy đủ trường "Tên hiển thị" (TenHienThi) trong toàn bộ quy trình quản lý.
        - Nâng cấp CSS với hiệu ứng hover, transition mượt mà, tối ưu hóa cho trải nghiệm người dùng.
