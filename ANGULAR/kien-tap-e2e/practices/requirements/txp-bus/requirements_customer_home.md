# Tài liệu Yêu cầu - Module Trang Chủ (Home Page)

- Module: Trang Chủ
- Hệ thống: Bán vé xe khách TXP Bus
- Phạm vi: Giao diện khách hàng — trang chủ với form tìm kiếm, tuyến phổ biến, đánh giá và tin tức
- URL: https://kien-tap-code.vercel.app/home
- Route component: app-home
- Nguồn phân tích: kien-tap/src/app/featured/customer/home/home.component.ts và .html
- Ngày tạo: 2026-05-30

---

## 1. Mô tả tổng quan module

Trang chủ là điểm vào chính của hệ thống. Trang cung cấp form tìm kiếm chuyến xe nhanh (hỗ trợ một chiều và khứ hồi), lịch hiển thị tháng hiện tại kèm ngày âm lịch, danh sách tuyến phổ biến, tìm kiếm gần đây, đánh giá khách hàng nổi bật và tin tức mới nhất.

---

## 2. Các thành phần giao diện

### 2.1. Form tìm kiếm chuyến xe

Loại hành trình:
- Hai nút radio/toggle: "Một chiều" (mặc định) và "Khứ hồi".
- Khi chọn "Khứ hồi": hiện thêm trường chọn Ngày về.
- Khi chuyển từ "Khứ hồi" sang "Một chiều": ẩn và reset trường Ngày về.

Trường Điểm đi:
- Input type text, placeholder: "Điểm đi"
- Khi focus: dropdown hiển thị danh sách địa điểm (lấy từ API getActiveRoutes, lọc trừ Điểm đến đang chọn).
- Khi nhập ký tự: lọc danh sách theo từ khóa (case-insensitive).
- Khi blur: đóng dropdown sau 250ms.
- Khi chọn một địa điểm: điền vào input, đóng dropdown.

Trường Điểm đến:
- Tương tự Điểm đi nhưng lọc trừ giá trị Điểm đi đang chọn.

Nút hoán đổi:
- Icon swap giữa Điểm đi và Điểm đến.
- Click: đổi chỗ giá trị Điểm đi và Điểm đến.

Trường Ngày đi:
- Input hiển thị ngày đã chọn, dạng DD/MM/YYYY.
- Click: mở lịch tháng hiện tại (inline calendar component).
- Lịch hiển thị ngày dương và ngày âm lịch tương ứng bên dưới.
- Ngày hôm nay được tô sáng.
- Chọn ngày trong quá khứ: toast error "Không thể chọn ngày trong quá khứ".
- Click ngoài vùng lịch: tự động đóng lịch.

Trường Ngày về (chỉ hiện khi Khứ hồi):
- Tương tự Ngày đi.
- Không thể chọn ngày trước Ngày đi → toast error "Ngày về phải sau ngày đi".
- Nếu sau khi chọn Ngày đi mà Ngày về cũ nhỏ hơn → tự động xóa Ngày về và hiển thị toast warning "Ngày về phải sau ngày đi. Vui lòng chọn lại ngày về."

Popover hành khách:
- Input hiển thị "X hành khách", click để mở popover.
- Popover có 3 loại hành khách:
  a. Người lớn: tối thiểu 1, tối đa 5. Nút - và +.
  b. Trẻ em: tối thiểu 0, tối đa 5. Nút - và +.
  c. Em bé: tối thiểu 0, tối đa 5. Nút - và +.
- Tổng hành khách = người lớn + trẻ em + em bé.
- Click ngoài popover: đóng popover.

Nút TÌM KIẾM:
- Validation khi nhấn: bắt buộc điền Điểm đi, Điểm đến và Ngày đi.
- Nếu thiếu → toast warning "Vui lòng nhập đầy đủ thông tin tìm kiếm".
- Nếu đủ → lưu vào recentSearches (localStorage, giữ tối đa 5 bản ghi mới nhất) → điều hướng đến /tim-kiem-chuyen với query params: diemDi, diemDen, ngayDi, ngayVe, isRoundTrip, passengers, adults, children, infants.

---

### 2.2. Tìm kiếm gần đây

- Hiển thị tối đa 5 lịch sử tìm kiếm gần nhất từ localStorage.
- Mỗi mục gồm: Điểm đi, Điểm đến, Ngày đi.
- Click vào một mục: tự động điền Điểm đi, Điểm đến, Ngày đi vào form.

---

### 2.3. Tuyến xe phổ biến

- Hiển thị danh sách tuyến phổ biến (hardcoded hoặc từ API):
  - Bình Định → Bình Dương: 250.000đ
  - Bình Định → TP. Hồ Chí Minh: 250.000đ
  - Phú Yên → TP. Hồ Chí Minh: 250.000đ
- Click vào một tuyến: tự động điền Điểm đi và Điểm đến rồi thực hiện tìm kiếm ngay.

---

### 2.4. Widget đánh giá khách hàng

- Gọi API GET /customer/reviews/home để lấy tối đa 5 đánh giá 5 sao mới nhất.
- Mỗi đánh giá hiển thị: tên khách hàng, avatar, ngày đánh giá, số sao (5 sao), nội dung nhận xét, tên tuyến xe.
- Trong khi chờ API: hiển thị trạng thái loading.
- Nếu API lỗi: không hiển thị section đánh giá.

---

### 2.5. Widget tin tức mới

- Gọi API GET /customer/tin-tuc/home để lấy tin tức trang chủ.
- Hiển thị danh sách tin tức mới (hình ảnh, tiêu đề, ngày đăng, danh mục).
- Click vào tin: điều hướng đến trang chi tiết tin tức /tin-tuc/chi-tiet/:id.
- Trong khi chờ API: hiển thị trạng thái loading.

---

## 3. Quy tắc lịch hiển thị

- Lịch hiển thị tháng hiện tại, tiêu đề dạng "THÁNG M/YYYY".
- Hiển thị các ô trống đầu tháng dựa theo thứ ngày đầu tháng (Thứ 2 = 0 ô trống, Thứ 3 = 1 ô trống, ..., Chủ nhật = 6 ô trống).
- Mỗi ngày hiển thị: ngày dương lịch (to) + ngày âm lịch (nhỏ, bên dưới, định dạng "d" hoặc "1/m" nếu là mùng 1).
- Ngày hôm nay: được tô nền khác biệt (highlighted = true).

---

## 4. Bảng query params tìm kiếm

| Param | Kiểu | Mô tả |
|---|---|---|
| diemDi | string | Điểm khởi hành (bắt buộc) |
| diemDen | string | Điểm đến (bắt buộc) |
| ngayDi | string | Ngày đi định dạng DD/MM/YYYY (bắt buộc) |
| ngayVe | string | Ngày về định dạng DD/MM/YYYY (chỉ khi khứ hồi) |
| isRoundTrip | boolean | true nếu là khứ hồi |
| passengers | number | Tổng số hành khách |
| adults | number | Số người lớn |
| children | number | Số trẻ em |
| infants | number | Số em bé |

---

## 5. Bảng các thông báo lỗi và cảnh báo

| Mã | Thông báo | Loại | Điều kiện |
|---|---|---|---|
| ERR-HOME-01 | Không thể chọn ngày trong quá khứ | Toast error | Chọn ngày quá khứ trong lịch đi hoặc về |
| ERR-HOME-02 | Ngày về phải sau ngày đi | Toast error | Ngày về < Ngày đi |
| ERR-HOME-03 | Ngày về phải sau ngày đi. Vui lòng chọn lại ngày về. | Toast warning | Tự động xóa ngày về khi ngày đi thay đổi làm ngày về không hợp lệ |
| ERR-HOME-04 | Vui lòng nhập đầy đủ thông tin tìm kiếm | Toast warning | Nhấn Tìm kiếm khi thiếu điểm đi, điểm đến hoặc ngày đi |

---

## 6. Danh sách test scenarios đề xuất

| Mã | Tên test case | Độ ưu tiên |
|---|---|---|
| TC_HOME_01 | Trang chủ load thành công, hiển thị form tìm kiếm và tuyến phổ biến | Cao |
| TC_HOME_02 | Tìm kiếm hợp lệ một chiều → điều hướng đến /tim-kiem-chuyen với đúng params | Cao |
| TC_HOME_03 | Chọn loại "Khứ hồi" → hiện trường Ngày về | Trung bình |
| TC_HOME_04 | Tìm kiếm khi chưa nhập đủ thông tin → toast warning ERR-HOME-04 | Cao |
| TC_HOME_05 | Chọn ngày đi trong quá khứ → toast error ERR-HOME-01 | Cao |
| TC_HOME_06 | Chọn Ngày về trước Ngày đi → toast error ERR-HOME-02 | Cao |
| TC_HOME_07 | Thay đổi Ngày đi làm Ngày về không hợp lệ → tự động xóa, toast warning ERR-HOME-03 | Trung bình |
| TC_HOME_08 | Hoán đổi Điểm đi và Điểm đến → giá trị đổi chỗ | Trung bình |
| TC_HOME_09 | Dropdown Điểm đi lọc theo từ khóa tìm kiếm | Trung bình |
| TC_HOME_10 | Dropdown Điểm đi không hiển thị giá trị Điểm đến đang chọn | Trung bình |
| TC_HOME_11 | Click tuyến phổ biến → điền form và tìm kiếm ngay | Trung bình |
| TC_HOME_12 | Lịch sử tìm kiếm được lưu và hiển thị khi quay lại trang | Thấp |
| TC_HOME_13 | Click lịch sử tìm kiếm → tự động điền form | Thấp |
| TC_HOME_14 | Hành khách: nút + không vượt quá 5, nút - không dưới giới hạn tối thiểu | Trung bình |
| TC_HOME_15 | Widget đánh giá hiển thị tối đa 5 đánh giá 5 sao | Thấp |
| TC_HOME_16 | Widget tin tức hiển thị tin tức mới nhất | Thấp |
