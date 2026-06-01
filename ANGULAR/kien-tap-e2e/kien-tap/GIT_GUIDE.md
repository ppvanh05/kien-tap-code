# Hướng dẫn Quy trình Làm việc với Git & Branch (Dành cho Nhóm)

Để đảm bảo dự án hoạt động trơn tru và tránh xung đột code (conflict) khi nhiều người cùng làm việc, tất cả thành viên vui lòng tuân thủ quy trình sau:

---

### 🟢 Bước 1: Mở Terminal trong Project
Mở VS Code tại thư mục project: `c:\Users\nhune\kien-tap-code\ANGULAR\kien-tap`
Mở Terminal bằng cách:
- Menu: `Terminal` → `New Terminal`
- Phím tắt: `Ctrl + ``

### 🔵 Bước 2: Kiểm tra Branch hiện tại
Trước khi làm bất cứ việc gì, hãy kiểm tra xem bạn đang đứng ở đâu:
```bash
git branch
```
- Nếu thấy dấu `* main` nghĩa là bạn đang ở nhánh chính. **KHÔNG** nên code trực tiếp trên nhánh này.

### 🟡 Bước 3: Tạo Branch mới cho tính năng
Mỗi khi làm một chức năng mới, hãy tạo một nhánh (branch) riêng.
**Công thức:** `feature/ten-chuc-nang`

Ví dụ (Chức năng quản lý nhân viên):
```bash
git checkout -b feature/quanlytaikhoan-nhanvien
```
*Hệ thống sẽ báo: `Switched to a new branch 'feature/quanlytaikhoan-nhanvien'`*

### 🟠 Bước 4: Kiểm tra lại Branch
Gõ lại lệnh để chắc chắn:
```bash
git branch
```
*Kết quả đúng:*
```text
  main
* feature/quanlytaikhoan-nhanvien
```

### 🟣 Bước 5: Đưa Branch lên GitHub (Lần đầu tiên)
Sau khi tạo branch, hãy đẩy nó lên remote server để mọi người cùng thấy:
```bash
git push -u origin feature/quanlytaikhoan-nhanvien
```

---

## 🛠 Workflow Hằng Ngày (Quy tắc Vàng)

### 1. Cập nhật code mới nhất từ nhóm
Trước khi bắt đầu code mỗi ngày, hãy lấy code mới nhất về:
```bash
git pull
```

### 2. Lưu lại công việc (Add & Commit)
Sau khi code xong một phần:
```bash
git add .
git commit -m "Mô tả ngắn gọn việc bạn vừa làm (ví dụ: thêm giao diện modal)"
```

### 3. Đẩy code lên GitHub
```bash
git push
```

---

## 🔄 Di chuyển giữa các Branch
- **Quay lại nhánh chính:** `git checkout main`
- **Quay lại nhánh tính năng của bạn:** `git checkout feature/ten-chuc-nang`

## 📝 Quy tắc đặt tên Branch (Khuyên dùng)
Hãy đặt tên dễ hiểu để quản lý:
- `feature/admin-dashboard`
- `feature/booking-ui`
- `feature/payment-integration`
- `feature/login-logic`

---
> [!IMPORTANT]
> **Lưu ý:** Tuyệt đối không `merge` code vào `main` nếu chưa được sự đồng ý của leader hoặc chưa qua kiểm tra! Code chỉ đưa lên các branch feature tương ứng.
