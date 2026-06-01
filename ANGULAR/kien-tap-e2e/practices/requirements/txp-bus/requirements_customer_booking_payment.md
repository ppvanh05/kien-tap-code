# Tài liệu Yêu cầu - Module Đặt Vé và Thanh Toán (Customer Booking & Payment)

- Module: Đặt Vé và Thanh Toán
- Hệ thống: Bán vé xe khách TXP Bus
- Phạm vi: Giao diện khách hàng — giữ ghế, tạo đơn hàng, xử lý thanh toán
- URL liên quan: https://kien-tap-code.vercel.app/thong-tin-don-hang, https://kien-tap-code.vercel.app/thanh-toan
- Nguồn phân tích: backend/src/customer/thong-tin-don-hang/thong-tin-don-hang.service.ts, thanh-toan/thanh-toan.service.ts
- Ngày tạo: 2026-05-30

---

## 1. Mô tả tổng quan module

Module Đặt Vé và Thanh Toán xử lý toàn bộ luồng mua vé xe khách: từ giữ ghế tạm thời → nhập thông tin người đi → tạo đơn hàng → thanh toán → xác nhận vé. Hệ thống hỗ trợ đặt vé cho khách hàng đã đăng nhập và khách vãng lai (tự động tạo tài khoản guest). Ghế giữ tạm thời được tự động giải phóng sau 15 phút nếu chưa thanh toán.

---

## 2. Danh sách yêu cầu chức năng

### UC-BK-01: Giữ ghế tạm thời 15 phút

- Tiêu đề: Khách hàng giữ ghế trước khi hoàn tất thanh toán
- Tác nhân: Khách hàng (đăng nhập hoặc vãng lai)

Luồng chính:
1. Sau khi chọn ghế từ sơ đồ chuyến xe, hệ thống nhận yêu cầu giữ ghế.
2. Hệ thống kiểm tra từng ghế trong danh sách DanhSachMaGheChuyen:
   - Nếu ghế tồn tại trong lịch trình → tiếp tục.
   - Nếu ghế đang trong trạng thái "GiuCho" và còn hiệu lực (cập nhật trong vòng 15 phút) → báo lỗi.
   - Nếu ghế đã bán (DaBan) → báo lỗi.
3. Hệ thống cập nhật trạng thái tất cả ghế sang "GiuCho" và ghi ThoiGianCapNhatTrangThai = thời điểm hiện tại.
4. Trả về thông báo thành công: "Giữ ghế tạm thời thành công trong 15 phút!"

Payload đầu vào:
- MaLichTrinh: string — mã lịch trình (bắt buộc)
- DanhSachMaGheChuyen: string[] — danh sách mã ghế (bắt buộc, ít nhất 1)
- MaKhachHang: string — mã khách hàng (tùy chọn, chưa áp dụng xác thực)

Luồng ngoại lệ:
- Số ghế yêu cầu không khớp với dữ liệu trong DB → lỗi 404: "Một số ghế được chọn không tồn tại trong chuyến xe này!"
- Ghế đã bị giữ hoặc đã bán → lỗi 400: "Ghế [X] đã có người giữ hoặc đã được bán!"

---

### UC-BK-02: Tự động giải phóng ghế hết hạn giữ

- Tiêu đề: Hệ thống tự động giải phóng ghế quá hạn giữ chỗ
- Tác nhân: Hệ thống (cron job tự động mỗi 60 giây)

Luồng chính:
1. Mỗi 60 giây, hệ thống quét danh sách ghế có trạng thái "GiuCho" và ThoiGianCapNhatTrangThai cách đây hơn 15 phút.
2. Hệ thống lọc chỉ những ghế chưa gắn với đơn hàng có trạng thái ChoKhoiHanh hoặc DaHoanThanh.
3. Hệ thống giải phóng các ghế đó về trạng thái "Trong".
4. Hệ thống tìm các đơn hàng ChoThanhToan liên quan đến các ghế vừa giải phóng.
5. Cập nhật trạng thái các đơn hàng đó và vé điện tử sang "DaHuy".
6. Ghi log: "Hệ thống tự động hủy đơn hàng [X] do hết hạn 15 phút chưa thanh toán."

---

### UC-BK-03: Tạo đơn hàng và vé điện tử

- Tiêu đề: Khách hàng hoàn tất thông tin và tạo đơn hàng
- Tác nhân: Khách hàng (đăng nhập hoặc vãng lai)

Luồng chính:
1. Hệ thống nhận thông tin đặt vé: khách hàng, lịch trình, danh sách ghế, thông tin người đi, điểm đón/trả, phương thức thanh toán.
2. Hệ thống kiểm tra MaKhachHang:
   - Nếu khách hàng tồn tại → sử dụng trực tiếp.
   - Nếu không tìm thấy → tìm kiếm theo số điện thoại SdtNguoiDi.
   - Nếu có khách cùng SĐT → dùng tài khoản đó.
   - Nếu hoàn toàn mới → tự động tạo khách hàng mới (mã KH + 3 chữ số, MatKhau = "GUEST_NO_PASSWORD").
3. Hệ thống xác minh MaLichTrinh tồn tại.
4. Hệ thống resolve điểm đón/điểm trả:
   - Nếu MaDiemDon là ID thực (có trong DIEM_DON_TRA_DUNG) → dùng trực tiếp.
   - Nếu MaDiemDon = "PICKUP_{MaLichTrinh}" (fallback) → tìm điểm tương ứng theo tên hoặc tự tạo mới.
5. Hệ thống kiểm tra tất cả ghế:
   - Số ghế khớp DB → tiếp tục.
   - Không ghế nào ở trạng thái DaBan → tiếp tục.
6. Hệ thống tính tổng giá vé (cộng từng ghế).
7. Hệ thống sinh mã đơn hàng theo định dạng DH + số tăng dần (ví dụ: DH10000001).
8. Trong giao dịch:
   a. Tạo DON_HANG với trạng thái "ChoKhoiHanh" (đã thanh toán ngay).
   b. Tạo VE_DIEN_TU cho mỗi ghế: mã VE + 6 chữ số, QR = "QR_{MaVe}_{MaLichTrinh}_{SoGhe}".
   c. Cập nhật trạng thái ghế sang "DaBan".
   d. Tạo bản ghi THANH_TOAN (LoaiGiaoDich = "ThanhToan", TrangThai = "DaThanhToan").
9. Ghi log thao tác đặt vé.
10. Trả về kết quả: đơn hàng, danh sách vé, thông tin thanh toán.

Payload đầu vào:
- MaKhachHang: string — mã khách hàng (có thể là guest ID)
- MaLichTrinh: string — mã lịch trình
- DanhSachMaGheChuyen: string[] — danh sách ghế đã chọn
- HoTenNguoiDi: string — tên người đi (bắt buộc)
- SdtNguoiDi: string — số điện thoại (bắt buộc)
- EmailNguoiDi: string — email (tùy chọn)
- MaDiemDon: string — mã điểm đón (bắt buộc)
- MaDiemTra: string — mã điểm trả (bắt buộc)
- PhuongThucThanhToan: string — phương thức thanh toán (bắt buộc)

Luồng ngoại lệ:
- Không tìm thấy lịch trình → lỗi 404
- Ghế không tồn tại → lỗi 404
- Ghế đã bán → lỗi 400: "Ghế đã được đặt bởi người khác!"

---

### UC-BK-04: Tạo giao dịch thanh toán (luồng 2 bước)

- Tiêu đề: Tạo giao dịch chờ xử lý từ cổng thanh toán bên ngoài
- Tác nhân: Hệ thống (sau khi tạo đơn)

Luồng chính:
1. Hệ thống nhận yêu cầu tạo giao dịch với MaDonHang, PhuongThucThanhToan, SoTien.
2. Hệ thống kiểm tra đơn hàng tồn tại.
3. Hệ thống kiểm tra trạng thái đơn hàng phải là "ChoThanhToan" → nếu không → lỗi.
4. Hệ thống tạo bản ghi THANH_TOAN với trạng thái "ChoThanhToan".
5. Mã giao dịch theo định dạng GD_TT_ + 6 chữ số (ví dụ: GD_TT_100001).
6. Trả về thông tin giao dịch.

Luồng ngoại lệ:
- Đơn hàng không ở trạng thái ChoThanhToan → lỗi 400: "Đơn hàng đã ở trạng thái X, không thể thực hiện thanh toán!"

---

### UC-BK-05: Xử lý callback thanh toán thành công

- Tiêu đề: Xác nhận thanh toán thành công và kích hoạt vé
- Tác nhân: Cổng thanh toán (callback)

Luồng chính:
1. Hệ thống nhận callback từ cổng thanh toán với MaDonHang và MaGiaoDich.
2. Hệ thống kiểm tra giao dịch tồn tại.
3. Nếu giao dịch đã ở trạng thái "DaThanhToan" → trả về thành công (idempotent).
4. Trong giao dịch:
   a. Cập nhật THANH_TOAN → "DaThanhToan".
   b. Cập nhật DON_HANG → "ChoKhoiHanh".
   c. Cập nhật tất cả VE_DIEN_TU → "ChoKhoiHanh".
   d. Khóa ghế vĩnh viễn: GHE_CHUYEN_XE → "DaBan".
5. Ghi log thao tác thanh toán thành công.
6. Trả về thông báo: "Xác nhận đơn hàng và thanh toán thành công!"

---

### UC-BK-06: Xử lý callback thanh toán thất bại

- Tiêu đề: Hủy đơn hàng và giải phóng ghế khi thanh toán thất bại
- Tác nhân: Cổng thanh toán (callback)

Luồng chính:
1. Hệ thống nhận callback thanh toán thất bại với MaDonHang và MaGiaoDich.
2. Hệ thống kiểm tra giao dịch và đơn hàng tồn tại.
3. Trong giao dịch:
   a. Cập nhật THANH_TOAN → "DaHuy".
   b. Cập nhật DON_HANG → "DaHuy".
   c. Cập nhật tất cả VE_DIEN_TU → "DaHuy".
   d. Giải phóng ghế: GHE_CHUYEN_XE → "Trong".
4. Ghi log thao tác thanh toán thất bại.
5. Trả về thông báo: "Hủy đơn hàng và giải phóng ghế thành công do thanh toán thất bại!"

---

## 3. Phương thức thanh toán được hỗ trợ

| Giá trị gửi lên | Giá trị lưu DB | Hiển thị |
|---|---|---|
| vietqr / chuyenkhoan | VietQR | VietQR |
| momo | MoMo | Ví MoMo |
| vnpay | VNPay | VNPay |
| zalopay | ZaloPay | ZaloPay |
| atm / nội địa | ATM_noi_dia | ATM nội địa |
| visa / master / jcb / thẻ quốc tế | Visa_Master_JCB | Thẻ Quốc Tế |
| tiền mặt / cash | TienMat | Tiền mặt |

---

## 4. Các ràng buộc nghiệp vụ

| Mã ràng buộc | Nội dung |
|---|---|
| RB-BK-01 | Ghế giữ tạm thời có hiệu lực trong 15 phút kể từ thời điểm gọi API hold-seats. |
| RB-BK-02 | Hệ thống tự động giải phóng ghế quá hạn mỗi 60 giây (cron job nội bộ). |
| RB-BK-03 | Đơn hàng tự động hủy nếu các ghế liên quan được giải phóng do hết hạn giữ chỗ. |
| RB-BK-04 | Mã đơn hàng theo định dạng DH + số nguyên tăng dần (DH10000001 trở đi). |
| RB-BK-05 | Mã vé điện tử theo định dạng VE + 6 chữ số (VE100001 trở đi). |
| RB-BK-06 | Mã giao dịch thanh toán theo định dạng GD_TT_ + 6 chữ số (GD_TT_100001 trở đi). |
| RB-BK-07 | Khách vãng lai chưa có tài khoản sẽ được tự động tạo với MatKhau = "GUEST_NO_PASSWORD". |
| RB-BK-08 | Nếu ghế ở trạng thái "GiuCho" nhưng đã hết hạn 15 phút thì coi như trống và có thể giữ lại. |
| RB-BK-09 | Ghế ở trạng thái "DaBan" không thể giữ hoặc đặt lại. |
| RB-BK-10 | Callback thanh toán phải idempotent: nếu đã xử lý → trả về thành công không tạo bản ghi thứ 2. |
| RB-BK-11 | Mã QR vé có định dạng: QR_{MaVe}_{MaLichTrinh}_{SoGhe}. |

---

## 5. Các API endpoint liên quan

| Phương thức | Đường dẫn | Mô tả | Xác thực |
|---|---|---|---|
| POST | /customer/thong-tin-don-hang/hold-seats | Giữ ghế tạm thời 15 phút | Không |
| POST | /customer/thong-tin-don-hang/create-order | Tạo đơn hàng + vé điện tử | Không |
| POST | /customer/thanh-toan/create-transaction | Tạo giao dịch chờ thanh toán | Không |
| POST | /customer/thanh-toan/callback/success | Xử lý callback thanh toán thành công | Không (internal) |
| POST | /customer/thanh-toan/callback/failure | Xử lý callback thanh toán thất bại | Không (internal) |

---

## 6. Luồng nghiệp vụ tổng thể (Happy Path)

Bước 1: Khách chọn ghế → Gọi hold-seats → Ghế chuyển sang "GiuCho" (hết hạn sau 15 phút)

Bước 2: Khách nhập thông tin → Gọi create-order → Hệ thống tạo DON_HANG + VE_DIEN_TU + THANH_TOAN (DaThanhToan) → Ghế chuyển sang "DaBan" → Trạng thái đơn: "ChoKhoiHanh"

Hoặc luồng 2 bước (tích hợp cổng thanh toán bên ngoài):

Bước 1: hold-seats → Bước 2: create-transaction → Bước 3: Redirect đến cổng thanh toán → Bước 4: callback/success hoặc callback/failure → Bước 5: Cập nhật trạng thái tương ứng

---

## 7. Danh sách test scenarios đề xuất

| Mã | Tên test case | Độ ưu tiên |
|---|---|---|
| TC_BK_01 | Giữ ghế trống hợp lệ thành công | Cao |
| TC_BK_02 | Giữ ghế đã bị giữ bởi người khác → 400 | Cao |
| TC_BK_03 | Giữ ghế đã bán → 400 | Cao |
| TC_BK_04 | Giữ ghế không tồn tại trong lịch trình → 404 | Trung bình |
| TC_BK_05 | Tạo đơn hàng hợp lệ cho khách đã đăng nhập | Cao |
| TC_BK_06 | Tạo đơn hàng cho khách vãng lai → hệ thống tạo tài khoản guest | Cao |
| TC_BK_07 | Tạo đơn hàng khi ghế đã bán → 400 | Cao |
| TC_BK_08 | Kiểm tra ghế chuyển sang DaBan sau khi tạo đơn | Cao |
| TC_BK_09 | Kiểm tra mã QR vé có đúng định dạng | Trung bình |
| TC_BK_10 | Kiểm tra mã đơn hàng đúng định dạng DH + số | Trung bình |
| TC_BK_11 | Thanh toán callback thành công → vé chuyển ChoKhoiHanh | Cao |
| TC_BK_12 | Thanh toán callback thất bại → vé hủy, ghế giải phóng | Cao |
| TC_BK_13 | Callback thanh toán thành công lần 2 (idempotent) → không tạo bản ghi mới | Trung bình |
| TC_BK_14 | Ghế tự động giải phóng sau 15 phút không thanh toán | Cao |
| TC_BK_15 | Đơn hàng ChoThanhToan tự động hủy khi ghế hết hạn giữ chỗ | Cao |
