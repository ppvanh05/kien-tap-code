# NHẬT KÝ PHÁT TRIỂN HỆ THỐNG QUẢN TRỊ (ADMIN)
**Dự án:** Hệ thống quản lý bán vé xe khách
**Thời gian cập nhật:** 16/05/2026

---

## 1. Module Quản lý Chính sách (QuanLyChinhSach)
- **Cấu trúc dữ liệu**: Xây dựng Model `ChinhSach` tích hợp các mốc hủy vé động.
- **Trình soạn thảo văn bản (Rich Text Editor)**:
    - Triển khai bộ soạn thảo mô phỏng chuyên nghiệp với 2 dòng công cụ (Toolbar).
    - **Tính năng**: In đậm, in nghiêng, gạch chân, danh sách, chỉ số trên/dưới ($X^2, X_2$), màu sắc, font chữ.
    - **Cải tiến kỹ thuật**: 
        - Sử dụng `mousedown` thay vì `click` để giữ tiêu điểm (focus) cho trình soạn thảo.
        - Ép hướng văn bản **LTR (Trái sang Phải)** và sửa lỗi con trỏ chuột bị nhảy ngược.
        - Kích hoạt tính năng chèn Link, chèn Ảnh và chèn Bảng (Table).

## 2. Module Quản lý Tài khoản Khách hàng (QuanLyTaiKhoanKhachHang)
- **Đồng bộ DB**: Xây dựng dựa trên thực thể `KHACH_HANG` gồm: Mã KH, Họ tên, SĐT, Email, Giới tính, Ngày sinh, Ngày đăng ký.
- **Bổ sung thông tin**: Thêm các trường quan trọng như **Địa chỉ**, **Số CCCD** và **Ghi chú** khách hàng.
- **Giao diện**:
    - Bảng danh sách hỗ trợ hiển thị Avatar và Trạng thái tài khoản.
    - Modal chi tiết hỗ trợ thêm mới, chỉnh sửa và Khóa/Mở khóa tài khoản.
    - Thiết kế cột Địa chỉ có tính năng rút gọn (truncate) để giữ bố cục bảng đẹp.

## 3. Module Quản lý Tài khoản Nhân viên (QuanLyTaiKhoanNhanVien)
- **Hoàn thiện**: Cập nhật file `README.md`, fix lỗi phân trang và vị trí các nút bấm (nút Hủy bên trái, nút Lưu bên phải).
- **Trải nghiệm người dùng**: Điều chỉnh giao diện bớt "AI" hơn, tinh tế và thân thiện với người dùng thực tế.

## 4. Hệ thống & Routing
- **Đăng ký Route**: Thiết lập các đường dẫn `/admin/quan-ly-khach-hang`, `/admin/quan-ly-nhan-vien`, `/admin/quan-ly-chinh-sach`.
- **Sửa lỗi Code**: Khắc phục các lỗi cú pháp nghiêm trọng trong file `admin.routes.ts` do xung đột lệnh import.
- **Thiết kế**: Duy trì mã màu chủ đạo `#009ba1` (Turquoise) và font chữ hiện đại (Roboto, Open Sans) trên toàn bộ các module.

---
**Ghi chú**: Các tính năng hiện đang sử dụng dữ liệu mẫu (Mock data), đã sẵn sàng để kết nối với API Backend.
