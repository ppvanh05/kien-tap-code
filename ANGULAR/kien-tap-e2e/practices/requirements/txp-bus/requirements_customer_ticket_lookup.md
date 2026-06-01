# Tài liệu Yêu cầu - Module Tra Cứu Vé và Quản Lý Đơn Hàng (Customer Ticket Lookup)

- Module: Tra Cứu Vé và Quản Lý Đơn Hàng
- Hệ thống: Bán vé xe khách TXP Bus
- Phạm vi: Giao diện khách hàng — tra cứu, sửa thông tin và hủy vé
- URL liên quan: https://kien-tap-code.vercel.app/tra-cuu-ve
- Nguồn phân tích: backend/src/customer/tra-cuu-ve/tra-cuu-ve.service.ts, tra-cuu-ve.controller.ts
- Ngày tạo: 2026-05-30

---

## 1. Mô tả tổng quan module

Module Tra Cứu Vé cho phép khách hàng kiểm tra thông tin đơn đặt vé mà không cần đăng nhập (chỉ cần mã đơn/mã vé + số điện thoại). Ngoài ra, khách hàng đã đăng nhập có thể xem lịch sử đặt vé, chỉnh sửa thông tin vé (tối đa 2 lần, trước khởi hành 2 tiếng), và hủy vé có tính phí theo chính sách.

---

## 2. Danh sách yêu cầu chức năng

### UC-TC-01: Tra cứu vé không cần đăng nhập

- Tiêu đề: Tìm kiếm thông tin đơn hàng bằng mã vé hoặc mã đơn hàng kết hợp số điện thoại
- Tác nhân: Khách vãng lai (không cần đăng nhập)

Luồng chính:
1. Người dùng truy cập trang tra cứu vé.
2. Người dùng nhập mã đơn hàng hoặc mã vé điện tử (không phân biệt hoa thường).
3. Người dùng nhập số điện thoại người đặt.
4. Hệ thống tìm kiếm đơn hàng khớp điều kiện: mã đơn hoặc mã vé + số điện thoại.
5. Hệ thống trả về thông tin chi tiết đơn hàng:
   - Mã đơn hàng, tên người đi, số điện thoại, email
   - Thời gian đặt vé
   - Tên tuyến xe, giờ khởi hành, giờ đến dự kiến, ngày khởi hành
   - Điểm đón, điểm trả (tên điểm, thời gian)
   - Tổng giá vé, phương thức thanh toán
   - Trạng thái đơn hàng (Chờ thanh toán / Chờ khởi hành / Đã hoàn thành / Đã hủy / Đã đánh giá)
   - Biển số xe, số lần đã sửa, giới hạn chỉnh sửa (2 lần)
   - Danh sách vé: mã vé, số ghế, điểm đón, điểm trả, giá vé, trạng thái, mã QR
6. Hệ thống map trạng thái từ giá trị DB sang tiếng Việt hiển thị.

Điều kiện đầu vào bắt buộc:
- maDonHang (query param): mã đơn hàng hoặc mã vé
- soDienThoai (query param): số điện thoại người đặt

Luồng ngoại lệ:
- Không cung cấp mã hoặc số điện thoại → lỗi 400: "Vui lòng cung cấp đầy đủ mã vé/mã đơn hàng và số điện thoại!"
- Không tìm thấy đơn khớp → lỗi 404: "Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!"

---

### UC-TC-02: Xem lịch sử đặt vé (cần đăng nhập)

- Tiêu đề: Khách hàng xem danh sách toàn bộ đơn hàng của mình
- Tác nhân: Khách hàng đã đăng nhập (JWT)

Luồng chính:
1. Hệ thống xác thực JWT, lấy MaKhachHang từ token.
2. Hệ thống truy vấn tất cả đơn hàng của khách hàng, sắp xếp theo ThoiGianDat mới nhất.
3. Mỗi đơn hàng trả về:
   - Mã đơn hàng, tên tuyến (dạng Điểm A - Điểm B), ngày khởi hành, giờ khởi hành
   - Số điện thoại, tổng giá vé, số lượng vé
   - Trạng thái đơn hàng (tiếng Việt)
   - Danh sách vé rút gọn: mã vé, giá vé, trạng thái

Yêu cầu xác thực:
- Bearer JWT Token hợp lệ trong header Authorization

---

### UC-TC-03: Cập nhật thông tin đơn hàng

- Tiêu đề: Khách hàng chỉnh sửa thông tin vé đã đặt
- Tác nhân: Khách hàng (không yêu cầu JWT ở controller, nhưng cần mã đơn hàng hợp lệ)

Luồng chính:
1. Khách hàng cung cấp mã đơn hàng và thông tin muốn chỉnh sửa.
2. Hệ thống kiểm tra đơn hàng tồn tại và có vé điện tử.
3. Hệ thống kiểm tra số lần đã sửa: nếu >= 2 lần → từ chối.
4. Hệ thống kiểm tra thời gian: nếu còn dưới 2 tiếng trước khởi hành → từ chối.
5. Hệ thống cập nhật DON_HANG: HoTenNguoiDi, SdtNguoiDi, EmailNguoiDi.
6. Hệ thống cập nhật VE_DIEN_TU: MaDiemDon, MaDiemTra, SoLanDaSua + 1.
7. Hệ thống tạo bản ghi lịch sử LICH_SU_VE với mã LSV + 6 chữ số.
8. Hệ thống ghi log thao tác.
9. Trả về thông tin đơn hàng sau cập nhật (full detail).

Payload đầu vào:
- HoTenNguoiDi: string — tên người đi (bắt buộc)
- SdtNguoiDi: string — số điện thoại (bắt buộc)
- EmailNguoiDi: string — email (tùy chọn)
- MaDiemDon: string — mã điểm đón mới (bắt buộc)
- MaDiemTra: string — mã điểm trả mới (bắt buộc)

Luồng ngoại lệ:
- Không tìm thấy đơn hàng → lỗi 404
- Đơn hàng không chứa vé → lỗi 400: "Đơn hàng không chứa vé điện tử nào!"
- Đã sửa >= 2 lần → lỗi 400: "Bạn đã hết lượt chỉnh sửa thông tin cho vé này (tối đa 2 lần)!"
- Còn dưới 2 tiếng trước khởi hành → lỗi 400: "Chỉ có thể sửa thông tin vé trước giờ khởi hành tối thiểu 2 tiếng!"

---

### UC-TC-04: Hủy vé điện tử

- Tiêu đề: Khách hàng hủy vé và nhận hoàn tiền theo chính sách
- Tác nhân: Khách hàng

Luồng chính:
1. Khách hàng cung cấp mã vé (MaVe) và lý do hủy (lyDo).
2. Hệ thống kiểm tra vé tồn tại.
3. Nếu vé đã có trạng thái "DaHuy" → báo lỗi.
4. Hệ thống lấy chính sách hủy vé đang áp dụng (TrangThai = "DangApDung").
5. Hệ thống tính thời gian còn lại trước khởi hành (diffHours).
6. Áp dụng chính sách phí hủy:
   - Nếu có chính sách tùy chỉnh: dùng GioiHanGioTruocKhoiHanh và TyLePhiHuy của chính sách.
   - Nếu không có chính sách: dùng logic mặc định:
     - Còn >= 24 giờ: phí hủy 0%, hoàn 100%
     - Còn >= 12 giờ đến < 24 giờ: phí hủy 50%, hoàn 50%
     - Còn < 12 giờ: phí hủy 100%, từ chối hủy
7. Hệ thống thực hiện giao dịch:
   a. Cập nhật trạng thái VE_DIEN_TU → "DaHuy"
   b. Giải phóng ghế: cập nhật GHE_CHUYEN_XE → "Trong"
   c. Tạo giao dịch hoàn tiền THANH_TOAN (LoaiGiaoDich = "HoanTien")
   d. Tạo bản ghi LICH_SU_HUY_VE (mã LSH + 6 chữ số)
   e. Tạo bản ghi LICH_SU_VE
   f. Kiểm tra nếu tất cả vé trong đơn đã hủy → cập nhật DON_HANG → "DaHuy"
8. Hệ thống ghi log thao tác hủy vé.
9. Trả về kết quả: refundAmount, feeAmount, maGiaoDichHoan.

Luồng ngoại lệ:
- Không tìm thấy vé → lỗi 404
- Vé đã hủy → lỗi 400: "Vé này đã được huỷ bỏ trước đó!"
- Còn ít hơn giới hạn giờ và phí = 100% → lỗi 400: "Không được phép hủy vé trước giờ khởi hành dưới X tiếng!"

---

## 3. Các ràng buộc nghiệp vụ

| Mã ràng buộc | Nội dung |
|---|---|
| RB-TC-01 | Tra cứu vé không yêu cầu đăng nhập, chỉ cần mã đơn/mã vé + số điện thoại. |
| RB-TC-02 | Mã tra cứu không phân biệt hoa thường (insensitive). |
| RB-TC-03 | Giới hạn chỉnh sửa thông tin: tối đa 2 lần cho mỗi đơn hàng. |
| RB-TC-04 | Chỉ được sửa thông tin khi còn hơn 2 tiếng trước khởi hành. |
| RB-TC-05 | Phí hủy vé dựa theo chính sách hủy đang áp dụng, mặc định 0% nếu còn >= 24h, 50% nếu >= 12h, 100% nếu < 12h. |
| RB-TC-06 | Khi hủy vé, ghế phải được giải phóng ngay (trở về trạng thái "Trong"). |
| RB-TC-07 | Nếu tất cả vé trong đơn đã hủy, đơn hàng cũng chuyển sang "DaHuy". |
| RB-TC-08 | Mã giao dịch hoàn tiền theo định dạng GD_HOAN_ + timestamp. |
| RB-TC-09 | Mã lịch sử hủy vé theo định dạng LSH + 6 chữ số, bắt đầu từ LSH100001. |
| RB-TC-10 | Thông tin hiển thị trạng thái đơn hàng bằng tiếng Việt đầy đủ. |

---

## 4. Các API endpoint liên quan

| Phương thức | Đường dẫn | Mô tả | Xác thực |
|---|---|---|---|
| GET | /customer/tra-cuu-ve/lookup?maDonHang=&soDienThoai= | Tra cứu vé không cần đăng nhập | Không |
| GET | /customer/tra-cuu-ve/history | Xem lịch sử đặt vé của khách hàng | JWT bắt buộc |
| PUT | /customer/tra-cuu-ve/update-info/:maDonHang | Cập nhật thông tin vé | Không (kiểm tra qua mã đơn) |
| POST | /customer/tra-cuu-ve/cancel/:maVe | Hủy vé điện tử | Không |

---

## 5. Bảng map trạng thái đơn hàng

| Giá trị DB | Hiển thị tiếng Việt |
|---|---|
| ChoThanhToan | Chờ thanh toán |
| ChoKhoiHanh | Chờ khởi hành |
| DaHoanThanh | Đã hoàn thành |
| DaHuy | Đã hủy |
| DaDanhGia | Đã đánh giá |

---

## 6. Danh sách test scenarios đề xuất

| Mã | Tên test case | Độ ưu tiên |
|---|---|---|
| TC_LOOKUP_01 | Tra cứu vé bằng mã đơn hàng hợp lệ + SĐT đúng | Cao |
| TC_LOOKUP_02 | Tra cứu vé bằng mã vé điện tử hợp lệ + SĐT đúng | Cao |
| TC_LOOKUP_03 | Tra cứu với SĐT sai → không tìm thấy đơn | Cao |
| TC_LOOKUP_04 | Tra cứu với mã không tồn tại → 404 | Trung bình |
| TC_LOOKUP_05 | Tra cứu không nhập mã hoặc SĐT → 400 | Trung bình |
| TC_HISTORY_01 | Xem lịch sử đặt vé khi đã đăng nhập | Cao |
| TC_HISTORY_02 | Xem lịch sử khi chưa đăng nhập → 401 | Cao |
| TC_UPDATE_01 | Cập nhật thông tin hợp lệ lần đầu (còn > 2h) | Cao |
| TC_UPDATE_02 | Cập nhật lần thứ 2 thành công | Trung bình |
| TC_UPDATE_03 | Cập nhật lần thứ 3 → 400 hết lượt | Cao |
| TC_UPDATE_04 | Cập nhật khi chỉ còn < 2h trước khởi hành → 400 | Cao |
| TC_CANCEL_01 | Hủy vé hợp lệ khi còn >= 24h → hoàn 100% | Cao |
| TC_CANCEL_02 | Hủy vé khi còn 12 - 24h → phí 50% | Trung bình |
| TC_CANCEL_03 | Hủy vé khi còn < 12h → bị từ chối | Cao |
| TC_CANCEL_04 | Hủy vé đã hủy trước đó → 400 | Trung bình |
| TC_CANCEL_05 | Sau hủy: kiểm tra ghế được giải phóng | Cao |
| TC_CANCEL_06 | Sau hủy tất cả vé trong đơn: kiểm tra đơn hàng chuyển DaHuy | Trung bình |
