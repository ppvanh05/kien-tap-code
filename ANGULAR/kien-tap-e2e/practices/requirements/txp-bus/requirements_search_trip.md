# TÀI LIỆU YÊU CẦU - MODULE TÌM KIẾM CHUYẾN XE (KHÁCH HÀNG)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | Tìm kiếm chuyến xe (Khách hàng) |
| Hệ thống | TXP Limousine |
| URL | https://txp-bus.example.com/tim-kiem-chuyen |
| Ngày tạo | 2026-05-29 |

---

## 1. TỔNG QUAN

Module **Tìm kiếm chuyến xe** cho phép hành khách tìm kiếm các chuyến xe Limousine dựa trên điểm đi, điểm đến, ngày đi, ngày về (nếu chọn khứ hồi), và số lượng vé. Hệ thống hiển thị danh sách các chuyến chạy phù hợp cùng sơ đồ 22 cabin VIP trực quan để người dùng thực hiện đặt chỗ.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Tìm kiếm chuyến chạy (Trip Search)

> Là một khách hàng, tôi muốn nhập thông tin điểm đi, điểm đến, ngày đi để tìm các chuyến chạy phù hợp.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-01 | Click chọn "Một chiều" -> Form ẩn ô chọn "Ngày về" |
| AC-02 | Click chọn "Khứ hồi" -> Form hiển thị thêm ô chọn "Ngày về" |
| AC-03 | Chọn Ngày đi trong quá khứ -> Hiển thị thông báo Toast error: "Không thể chọn ngày trong quá khứ" |
| AC-04 | Chọn Ngày về nằm trước Ngày đi -> Tự động xoá Ngày về và thông báo Toast warning: "Ngày về phải sau ngày đi. Vui lòng chọn lại ngày về." |
| AC-05 | Bấm nút chuyển đổi vị trí (swap) -> Hoán đổi Điểm đi và Điểm đến cho nhau |
| AC-06 | Điểm đi và Điểm đến trùng nhau -> Không hiển thị địa điểm đã chọn ở dropdown đối diện hoặc thông báo cảnh báo |
| AC-07 | Tìm kiếm thành công -> Lưu lượt tìm kiếm vào danh sách "Tìm kiếm gần đây" (tối đa 5 lượt trong localStorage) |
| AC-08 | Không nhập đủ thông tin (Điểm đi/đến/ngày đi) + Click "Tìm kiếm" -> Toast warning "Vui lòng nhập đầy đủ thông tin tìm kiếm" |

### 2.2. Đặt cabin và cấu hình dịch vụ (Seat & Cabin Reservation)

> Là một hành khách, tôi muốn chọn khoang cabin trống trên sơ đồ xe Limousine 22 chỗ và thiết lập phòng đơn/đôi để đặt chỗ.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-09 | Nhấp vào khoang cabin trống (Tầng dưới: phòng 1-12, Tầng trên: phòng 13-22) -> Trạng thái cabin chuyển sang "Đang chọn" (Màu cam) |
| AC-10 | Số lượng cabin chọn vượt quá số lượng vé đã đăng ký -> Không cho phép chọn thêm cabin mới |
| AC-11 | Nhấp vào cabin có trạng thái "Đã bán" (Disable) -> Không có phản hồi |
| AC-12 | Chọn phòng đơn -> Tính giá vé gốc của lịch trình |
| AC-13 | Chọn phòng đôi -> Cộng phụ thu **+200.000đ** vào tổng tiền vé của cabin đó |
| AC-14 | Bấm "Xác nhận ghế" -> Lưu thông tin tạm thời và chuyển đến màn hình điền thông tin hành khách |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Form Tìm kiếm (Search Card)

| Tên trường | Loại UI | HTML Type | Bắt buộc | Mặc định | Ghi chú |
|------------|---------|-----------|----------|----------|---------|
| **Loại vé** | Radio/Button Tab | button | Có | Một chiều | Gồm: Một chiều, Khứ hồi |
| **Điểm đi** | Autocomplete Input | text | Có | Trống | Lọc theo danh sách hoạt động thực tế |
| **Điểm đến** | Autocomplete Input | text | Có | Trống | Lọc theo danh sách hoạt động thực tế |
| **Ngày đi** | Calendar Popover | text (readonly)| Có | Ngày hiện tại | Định dạng DD/MM/YYYY. Phải $\ge$ Hôm nay |
| **Ngày về** | Calendar Popover | text (readonly)| Chỉ khứ hồi| Trống | Định dạng DD/MM/YYYY. Phải $\ge$ Ngày đi |
| **Số lượng vé**| Select Dropdown | select | Có | 1 vé | Giá trị từ 1 đến 5 vé |

---

## 4. LUỒNG XỬ LÝ (WORKFLOWS)

### 4.1. Đăng nhập thành công (Happy Path - Một chiều)

1. Khách hàng truy cập trang chủ hệ thống.
2. Form tìm kiếm mặc định chọn "Một chiều", Số lượng vé là "1 vé".
3. Nhập "Bình Định" vào ô Điểm đi.
4. Nhập "TP. Hồ Chí Minh" vào ô Điểm đến.
5. Click chọn Ngày đi là ngày mai.
6. Click nút "TÌM KIẾM".
7. Giao diện hiển thị danh sách các chuyến chạy phù hợp kèm số chỗ trống, thời gian chạy và giá vé gốc.
8. Click chọn chuyến chạy mong muốn -> Hệ thống bung sơ đồ xe.
9. Click chọn 1 Cabin trống (VD: Cabin 02) -> Cabin đổi sang màu cam.
10. Click chọn loại cabin: "Phòng đôi" -> Tổng tiền hiển thị tăng thêm 200.000đ.
11. Click nút "Chọn chuyến" để chuyển đến màn hình nhập thông tin đặt vé.

---

## 5. TỔNG HỢP THÔNG BÁO LỖI VÀ CẢNH BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Không thể chọn ngày trong quá khứ | Toast Error | Chọn ngày trước ngày hiện tại ở Date Picker |
| 2 | Ngày về phải sau ngày đi. Vui lòng chọn lại ngày về. | Toast Warning | Chọn ngày về trước ngày đi |
| 3 | Vui lòng nhập đầy đủ thông tin tìm kiếm | Toast Warning | Điểm đi, điểm đến hoặc ngày đi bị để trống khi submit |

---

## 6. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-01 | Thời gian giữ ghế tạm thời (`GiuCho`) trên sơ đồ xe trước khi tự động giải phóng là bao nhiêu phút? |
| Q-02 | Trẻ em dưới bao nhiêu tuổi được miễn phí vé nếu nằm chung phòng cabin đôi với người lớn? |
