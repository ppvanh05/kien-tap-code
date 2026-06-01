# Tài liệu Yêu cầu - Module Đánh Giá Dịch Vụ (Customer Review)

- Module: Đánh Giá Dịch Vụ
- Hệ thống: Bán vé xe khách TXP Bus
- Phạm vi: Giao diện khách hàng — trang đánh giá chuyến đi
- URL liên quan: https://kien-tap-code.vercel.app/home (xem review trang chủ), https://kien-tap-code.vercel.app/reviews (xem toàn bộ đánh giá)
- Nguồn phân tích: backend/src/customer/review/review.service.ts, review.controller.ts
- Ngày tạo: 2026-05-30

---

## 1. Mô tả tổng quan module

Module Đánh Giá Dịch Vụ cho phép khách hàng gửi đánh giá sau khi hoàn thành chuyến đi. Hệ thống lưu trữ, thống kê và hiển thị các đánh giá công khai. Trang chủ hiển thị 5 đánh giá 5 sao mới nhất. Trang đánh giá cung cấp bộ lọc nâng cao và thống kê chi tiết.

---

## 2. Danh sách yêu cầu chức năng

### UC-RV-01: Gửi đánh giá chuyến đi

- Tiêu đề: Khách hàng gửi đánh giá sau chuyến đi
- Tác nhân: Khách hàng đã mua vé và hoàn thành chuyến đi

Luồng chính:
1. Khách hàng truy cập trang lịch sử đơn hàng hoặc nhận link đánh giá.
2. Hệ thống hiển thị form đánh giá gắn với mã vé điện tử (MaVe) cụ thể.
3. Khách hàng chọn số sao tổng thể (1 đến 5 sao), bắt buộc.
4. Khách hàng có thể chấm điểm theo 6 tiêu chí: An toàn, Sạch sẽ, Thái độ nhân viên, Đúng giờ, Thông tin đầy đủ, Tiện nghi.
5. Khách hàng nhập nội dung nhận xét (tùy chọn, văn bản tự do).
6. Khách hàng có thể đính kèm hình ảnh dưới dạng danh sách URL (mediaUrls, tùy chọn).
7. Hệ thống tự sinh mã đánh giá theo định dạng DG + 6 chữ số (ví dụ: DG100001), bắt đầu từ DG100001.
8. Hệ thống lưu thông tin: MaDanhGia, SoSao, NoiDungDanhGia, ThoiGianDanhGia, TrangThaiPhanHoi = "ChuaPhanHoi".
9. Nếu có mediaUrls, hệ thống lưu vào bảng MEDIA_DANH_GIA.
10. Hệ thống cập nhật trạng thái đơn hàng (DON_HANG) và vé điện tử (VE_DIEN_TU) sang "DaDanhGia".
11. Hệ thống ghi log: "Khách hàng đánh giá chuyến xe với X sao."
12. Hệ thống trả về thông báo thành công: "Tạo đánh giá thành công!"

Điều kiện đầu vào bắt buộc:
- MaVe: mã vé điện tử hợp lệ đã mua
- MaKhachHang: mã khách hàng đang đăng nhập
- SoSao: số nguyên từ 1 đến 5

Luồng ngoại lệ:
- Nếu không cung cấp MaVe hoặc MaKhachHang hợp lệ → hệ thống báo lỗi không tạo được đánh giá.
- Nếu trùng mã đánh giá (MaDanhGia) → hệ thống tự động thử lại tối đa 5 lần.

---

### UC-RV-02: Xem danh sách đánh giá với bộ lọc và thống kê

- Tiêu đề: Hiển thị trang đánh giá khách hàng có bộ lọc
- Tác nhân: Khách truy cập (không cần đăng nhập)

Luồng chính:
1. Người dùng truy cập trang đánh giá (ví dụ /reviews).
2. Hệ thống trả về dữ liệu thống kê tổng quan:
   - Điểm trung bình tổng thể (averageOverall)
   - Tổng số đánh giá (totalReviews)
   - Điểm trung bình 6 tiêu chí: An toàn, Sạch sẽ, Thái độ, Đúng giờ, Thông tin, Tiện nghi
   - Phân bổ số đánh giá theo từng mức sao (1 đến 5 sao)
   - Số đánh giá có bình luận (commentCount)
   - Số đánh giá có hình ảnh (imageCount)
3. Hệ thống hiển thị danh sách đánh giá với phân trang (mặc định 5 item/trang).
4. Mỗi đánh giá hiển thị: tên tác giả, avatar, ngày đánh giá, số sao, nội dung nhận xét, hình ảnh, tên tuyến xe.
5. Người dùng có thể lọc theo:
   - Số sao (rating = 1, 2, 3, 4, 5)
   - Chỉ hiện đánh giá có bình luận (hasComment = true/false)
   - Chỉ hiện đánh giá có hình ảnh (hasImage = true/false)
6. Danh sách sắp xếp theo thời gian đánh giá mới nhất (desc).
7. Hệ thống trả về metadata phân trang: currentPage, limit, totalItems, totalPages.

---

### UC-RV-03: Hiển thị đánh giá nổi bật trang chủ

- Tiêu đề: Widget đánh giá 5 sao trên trang chủ
- Tác nhân: Khách truy cập

Luồng chính:
1. Trang chủ gọi API GET /customer/reviews/home.
2. Hệ thống lấy tối đa 5 đánh giá có SoSao = 5, sắp xếp theo ThoiGianDanhGia mới nhất.
3. Mỗi đánh giá hiển thị: tên khách hàng, avatar, ngày đánh giá, số sao (5), nội dung, tên tuyến xe.
4. Nếu không có ảnh đại diện → hiển thị ảnh mặc định.

---

### UC-RV-04: Xem chi tiết một đánh giá

- Tiêu đề: Xem thông tin chi tiết của một đánh giá
- Tác nhân: Quản trị viên hoặc hệ thống nội bộ

Luồng chính:
1. Hệ thống truy vấn đánh giá theo MaDanhGia.
2. Trả về toàn bộ thông tin bao gồm MEDIA_DANH_GIA.
3. Nếu không tìm thấy → trả về null.

---

## 3. Các ràng buộc nghiệp vụ

| Mã ràng buộc | Nội dung |
|---|---|
| RB-RV-01 | Mã đánh giá (MaDanhGia) có định dạng DG + 6 chữ số, bắt đầu từ DG100001. |
| RB-RV-02 | Trạng thái phản hồi mặc định khi tạo mới là "ChuaPhanHoi". |
| RB-RV-03 | Sau khi đánh giá thành công, trạng thái đơn hàng và vé điện tử chuyển sang "DaDanhGia". |
| RB-RV-04 | Trang chủ chỉ hiển thị tối đa 5 đánh giá 5 sao mới nhất. |
| RB-RV-05 | Điểm trung bình làm tròn đến 1 chữ số thập phân. |
| RB-RV-06 | Nếu khách hàng không có avatar → hiển thị ảnh mặc định "asset/images/customer/avatar_placeholder.png". |
| RB-RV-07 | Hệ thống thử lại tối đa 5 lần nếu phát sinh lỗi trùng mã đánh giá (unique constraint P2002). |

---

## 4. Các API endpoint liên quan

| Phương thức | Đường dẫn | Mô tả | Xác thực |
|---|---|---|---|
| POST | /customer/reviews | Tạo đánh giá mới | Không bắt buộc JWT |
| GET | /customer/reviews?page=&limit=&rating=&hasComment=&hasImage= | Lấy danh sách đánh giá với bộ lọc | Không |
| GET | /customer/reviews/home | Lấy 5 đánh giá 5 sao cho trang chủ | Không |
| GET | /customer/reviews/all | Lấy toàn bộ đánh giá (không phân trang) | Không |
| GET | /customer/reviews/:id | Lấy chi tiết một đánh giá | Không |
| PATCH | /customer/reviews/:id | Cập nhật đánh giá | Không |
| DELETE | /customer/reviews/:id | Xóa đánh giá | Không |

---

## 5. Cấu trúc dữ liệu

Payload tạo đánh giá (POST /customer/reviews):
- MaVe: string — mã vé điện tử (bắt buộc)
- MaKhachHang: string — mã khách hàng (bắt buộc)
- SoSao: number — số sao (1-5, bắt buộc)
- NoiDungDanhGia: string — nội dung nhận xét (tùy chọn)
- mediaUrls: string[] — danh sách URL hình ảnh (tùy chọn)

Response thống kê (GET /customer/reviews):
- summary.averageOverall: number — điểm trung bình tổng
- summary.totalReviews: number — tổng số đánh giá
- summary.criteriaAverage: object — điểm TB 6 tiêu chí
- summary.ratingCount: object — phân bổ theo số sao (one đến five)
- summary.commentCount: number — số đánh giá có bình luận
- summary.imageCount: number — số đánh giá có hình ảnh
- items: array — danh sách đánh giá
- meta: object — thông tin phân trang

---

## 6. Danh sách test scenarios đề xuất

| Mã | Tên test case | Độ ưu tiên |
|---|---|---|
| TC_RV_01 | Gửi đánh giá 5 sao hợp lệ có kèm ảnh và nhận xét | Cao |
| TC_RV_02 | Gửi đánh giá chỉ có số sao (không nhận xét, không ảnh) | Cao |
| TC_RV_03 | Gửi đánh giá với SoSao = 1 (đánh giá tiêu cực) | Trung bình |
| TC_RV_04 | Kiểm tra trạng thái đơn hàng chuyển sang "DaDanhGia" sau khi đánh giá | Cao |
| TC_RV_05 | Xem danh sách đánh giá không lọc, kiểm tra phân trang | Cao |
| TC_RV_06 | Lọc đánh giá theo rating = 5 sao | Trung bình |
| TC_RV_07 | Lọc đánh giá có hasComment = true | Trung bình |
| TC_RV_08 | Lọc đánh giá có hasImage = true | Trung bình |
| TC_RV_09 | Kiểm tra widget trang chủ hiển thị tối đa 5 đánh giá 5 sao | Trung bình |
| TC_RV_10 | Kiểm tra thống kê: averageOverall, ratingCount, criteriaAverage | Trung bình |
