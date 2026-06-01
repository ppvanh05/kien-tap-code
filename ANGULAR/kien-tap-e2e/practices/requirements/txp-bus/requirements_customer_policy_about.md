# Tài liệu Yêu cầu - Module Chính Sách & Quy Định (Policy Page)

- Module: Chính Sách và Quy Định
- Hệ thống: Bán vé xe khách TXP Bus
- Phạm vi: Giao diện khách hàng — trang xem chính sách nhà xe
- URL: https://kien-tap-code.vercel.app/gioi-thieu/chinh-sach
- Route component: ChinhSachComponent
- Nguồn phân tích: kien-tap/src/app/featured/customer/gioi-thieu/chinh-sach/chinh-sach.component.ts và .html
- Ngày tạo: 2026-05-30

---

## 1. Mô tả tổng quan module

Trang Chính Sách & Quy Định hiển thị các chính sách vận hành của nhà xe TXP Bus cho khách hàng tham khảo. Nội dung được load từ backend (thông qua 2 API: chính sách chung và chính sách hủy vé). Nếu backend trả về rỗng, hệ thống hiển thị dữ liệu fallback tĩnh. Trang có bố cục sidebar + content với tính năng tìm kiếm nhanh và điều hướng tab theo danh mục.

---

## 2. Danh sách các nhóm chính sách

Hệ thống có 5 nhóm chính sách mặc định (fallback):

1. Chính sách Thanh Toán và Đặt Giữ Chỗ Trực Tuyến (icon: payments)
   - Danh mục: Quy định đặt vé & Thanh toán
   - Nội dung: Quy trình đặt giữ chỗ 15 phút, xác nhận đặt vé, thông tin hành khách, nguyên tắc xếp chỗ.

2. Chính sách Chỉnh Sửa Thông Tin Vé Đã Đặt (icon: edit_note)
   - Danh mục: Chính sách chỉnh sửa vé
   - Nội dung: Điều kiện áp dụng, giới hạn thời gian (trước 2 tiếng), giới hạn số lần (tối đa 2 lần), phạm vi thông tin được sửa, biểu phí chỉnh sửa (miễn phí).

3. Chính sách Hủy Vé và Hoàn Tiền (icon: account_balance_wallet)
   - Danh mục: Chính sách hủy vé & Hoàn tiền
   - Nội dung: Điều kiện hủy vé, tính toán số tiền hoàn, cơ chế hoàn tiền, trường hợp lỗi giao dịch, trường hợp không hoàn tiền.

4. Chính sách Cam Kết Dịch Vụ và Bồi Thường Trường Hợp Sự Cố (icon: verified_user)
   - Danh mục: Cam kết dịch vụ & Bồi thường
   - Nội dung: Cam kết giữ chỗ, xử lý khi không có chỗ (điều phối hoặc hoàn 100% + voucher), miễn trừ trách nhiệm bất khả kháng.

5. Chính sách Bảo Mật Dữ Liệu Cá Nhân (icon: security)
   - Danh mục: Chính sách bảo mật dữ liệu
   - Nội dung: Thu thập và phân loại dữ liệu, mục đích sử dụng, chia sẻ thông tin, biện pháp an toàn, quyền của khách hàng.

---

## 3. Yêu cầu chức năng

### UC-CS-01: Tải và hiển thị chính sách

Luồng chính:
1. Trang load, gọi đồng thời 2 API:
   - GET /customer/chinh-sach (chính sách chung đang áp dụng)
   - GET /customer/chinh-sach-huy-ve (chính sách hủy vé đang áp dụng)
2. Gộp kết quả và map sang cấu trúc PolicySection.
3. Nếu API trả về rỗng → giữ nguyên dữ liệu fallback tĩnh.
4. Tab mặc định: tab đầu tiên trong danh sách.
5. Sidebar hiển thị danh sách tab: icon + tên danh mục.
6. Vùng nội dung chính hiển thị chính sách đang active: tiêu đề, danh mục (text nhỏ phía trên).

---

### UC-CS-02: Điều hướng tab chính sách

Luồng chính:
1. Click vào một tab trong sidebar → hiển thị nội dung chính sách tương ứng ở cột phải.
2. Tab đang active: nền primary-light, chữ primary, viền trái 4px màu primary.
3. Tab không active: nền trắng, hover nền surface-container-low.
4. Khi chuyển tab: trang tự động cuộn về đầu trang (window.scrollTo top, smooth).

---

### UC-CS-03: Tìm kiếm nhanh trong chính sách đang xem

Luồng chính:
1. Ô tìm kiếm nằm trong vùng nội dung chính, bên phải tiêu đề, placeholder "Tìm nhanh..."
2. Tìm kiếm lọc danh sách policies theo:
   - Tiêu đề chính sách (không phân biệt hoa thường)
   - Hoặc nội dung bất kỳ trong mảng content (không phân biệt hoa thường)
3. Kết quả lọc hiển thị ngay lập tức (computed property filteredPolicies).

---

### UC-CS-04: Hiển thị nội dung chi tiết từng chính sách

Cấu trúc hiển thị:
- Mỗi mục trong mảng content được hiển thị dạng timeline đánh số (1, 2, 3...).
- Số thứ tự: vòng tròn nền primary/10, chữ primary, kích thước 40x40px.
- Đường kẻ dọc nối các mục (trừ mục cuối).
- Nội dung văn bản: phần trước dấu ":" in đậm màu navy, phần sau dấu ":" text thường.
- Hiệu ứng animation: fade-in + slide-in-from-bottom-2, delay tăng dần 100ms mỗi mục.

---

### UC-CS-05: Phần hỗ trợ cuối trang

Nội dung cố định ở cuối vùng nội dung chính:
- Tiêu đề: "Bạn vẫn còn thắc mắc về chính sách?"
- Hotline: 1900 1234 (icon điện thoại)
- Email: hotro@tanxuanphuc.vn (icon email)
- Nút "Chat ngay với chúng tôi" (btn-primary, icon chat).

---

## 4. Bảng các trường dữ liệu PolicySection

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | string | Định danh duy nhất của chính sách |
| title | string | Tiêu đề đầy đủ của chính sách (in hoa) |
| category | string | Tên danh mục hiển thị trong sidebar |
| icon | string | Tên icon Material Symbols |
| content | string[] | Danh sách các điều khoản nội dung |

---

## 5. Quy tắc hiển thị nội dung

- Mỗi phần tử trong mảng content được chia thành 2 phần bởi dấu ":" đầu tiên.
- Phần trước dấu ":": in đậm, màu navy.
- Phần sau dấu ":": chữ thường, màu on-surface.
- Nếu nội dung không có dấ ":": hiển thị toàn bộ dưới dạng text thường.

---

## 6. Danh sách test scenarios đề xuất

| Mã | Tên test case | Độ ưu tiên |
|---|---|---|
| TC_CS_01 | Trang chính sách load thành công, hiển thị 5 tab mặc định | Cao |
| TC_CS_02 | Tab đầu tiên được active mặc định khi vào trang | Trung bình |
| TC_CS_03 | Click tab "Chính sách hủy vé & Hoàn tiền" → hiển thị nội dung đúng | Cao |
| TC_CS_04 | Tab active có viền trái màu primary và nền primary-light | Trung bình |
| TC_CS_05 | Click tab → trang cuộn về đầu trang | Thấp |
| TC_CS_06 | Tìm kiếm từ khóa có trong tiêu đề → hiển thị chính sách tương ứng | Trung bình |
| TC_CS_07 | Tìm kiếm từ khóa có trong nội dung → hiển thị chính sách tương ứng | Trung bình |
| TC_CS_08 | Tìm kiếm không khớp → không hiển thị chính sách nào | Trung bình |
| TC_CS_09 | Nội dung chính sách hiển thị đúng định dạng: phần trước ":" in đậm | Thấp |
| TC_CS_10 | Phần hỗ trợ hiển thị hotline và email đúng | Thấp |

---

## 7. Trang Giới Thiệu (Ve Chung Toi - /gioi-thieu/ve-chung-toi)

Mô tả: Trang tĩnh giới thiệu về nhà xe Tân Xuân Phúc, không có tính năng nghiệp vụ đặc biệt.

Các section chính:
- Hero section: ảnh nền xe khách, tiêu đề "TÂN XUÂN PHÚC - VẠN DẶM BÌNH AN", mô tả sứ mệnh, nút "Đặt vé ngay" (link về /home) và nút "Tìm hiểu thêm" (scroll đến section giới thiệu).
- Giới thiệu công ty: câu chuyện 15+ năm kinh nghiệm, ảnh xe, số liệu nổi bật.
- Giá trị cốt lõi: 4 giá trị (An Toàn Là Trên Hết, Trách Nhiệm & Chu Đáo, Hiện Đại & Tiện Nghi, Công Bằng & Minh Bạch).
- Tầm nhìn 2030: mục tiêu phát triển.

Test scenarios đề xuất:
- TC_VCT_01: Trang /gioi-thieu/ve-chung-toi load thành công, hiển thị đầy đủ các section.
- TC_VCT_02: Nút "Đặt vé ngay" điều hướng về /home.
- TC_VCT_03: Nút "Tìm hiểu thêm" cuộn đến section giới thiệu.
