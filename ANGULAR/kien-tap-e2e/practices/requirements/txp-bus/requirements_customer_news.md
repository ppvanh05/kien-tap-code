# Tài liệu Yêu cầu - Module Tin Tức (News Module)

- Module: Tin Tức và Chi Tiết Tin Tức
- Hệ thống: Bán vé xe khách TXP Bus
- Phạm vi: Giao diện khách hàng — danh sách tin tức, bộ lọc, phân trang và chi tiết bài viết
- URL danh sách: https://kien-tap-code.vercel.app/tin-tuc
- URL chi tiết: https://kien-tap-code.vercel.app/tin-tuc/chi-tiet/:id
- Route components: TintucComponent, TintucDetailComponent
- Nguồn phân tích: kien-tap/src/app/featured/customer/tintuc/*.ts và *.html
- Ngày tạo: 2026-05-30

---

## 1. Mô tả tổng quan module

Module Tin Tức hiển thị toàn bộ tin tức công khai từ nhà xe, phân loại theo danh mục và hỗ trợ tìm kiếm theo từ khóa. Trang danh sách có bố cục phân chia: tin nổi bật (trái), tin mới nhất (phải), tin phụ nổi bật (2 cột) và lưới tất cả tin tức. Trang chi tiết hiển thị nội dung HTML đầy đủ kèm sidebar tin khác và bài viết liên quan.

---

## 2. Trang danh sách tin tức (/tin-tuc)

### UC-NT-01: Hiển thị trang danh sách mặc định (không lọc)

Luồng chính:
1. Khách truy cập trang /tin-tuc.
2. Hệ thống gọi API lấy tin tức: trang 1, limit 10, không lọc danh mục, không tìm kiếm.
3. Trang hiển thị theo bố cục phân vùng:
   - Tin nổi bật (featuredNews): 1 tin lớn chiếm 8/12 cột, hiển thị: ảnh bìa cao 400px, tag danh mục (góc trên trái), ngày đăng, tiêu đề (headline-md), mô tả ngắn (line-clamp-2).
   - Tin mới nhất (latestNews): 3 tin đầu tiên, hiển thị dạng list nhỏ (4/12 cột): ảnh 96x80, danh mục, tiêu đề (line-clamp-2), ngày đăng.
   - Tin phụ nổi bật (subFeaturedNews): 2 tin tiếp theo (index 3-4), dạng 2 cột: ảnh cao 240px, ngày đăng, tiêu đề.
   - Tất cả tin tức (allNews): toàn bộ tin trong trang, dạng 2 cột: ảnh vuông 1/3 chiều rộng, ngày đăng, tiêu đề, mô tả ngắn (line-clamp-2).
4. Tiêu đề section "TẤT CẢ TIN TỨC" chỉ hiện khi không lọc và không tìm kiếm.

---

### UC-NT-02: Lọc tin tức theo danh mục

Tab danh mục:
- Hệ thống hiển thị 6 tab ở đầu trang: THÔNG BÁO | SỰ KIỆN | KHUYẾN MÃI | TIN NHÀ XE | CẨM NANG DI CHUYỂN | TUYỂN DỤNG.
- Tab đang active: viền dưới màu primary, chữ primary.
- Tab không active: viền trong suốt, chữ mặc định.

Luồng lọc:
1. Click vào một tab → hệ thống lọc tin tức theo danh mục tương ứng.
2. Tự động reset ô tìm kiếm về rỗng khi đổi tab.
3. Reset về trang 1.
4. Layout chuyển sang chế độ lưới đơn (allNews): ẩn featuredNews, latestNews, subFeaturedNews.
5. Click lại tab đang active → bỏ lọc, quay về trang tổng.

Mapping danh mục:
- THÔNG BÁO → ThongBao
- SỰ KIỆN → SuKien
- KHUYẾN MÃI → KhuyenMai
- TIN NHÀ XE → TinTucChung
- CẨM NANG DI CHUYỂN → HuongDan
- TUYỂN DỤNG → TuyenDung

---

### UC-NT-03: Tìm kiếm tin tức theo từ khóa

Giao diện:
- Ô tìm kiếm ở góc phải header: input type text, placeholder "Tìm kiếm tin tức", icon search bên trái.
- Kiểu tìm kiếm: realtime (sự kiện input), mỗi lần nhập ký tự đều gọi API.
- Reset về trang 1 khi tìm kiếm.
- Layout chuyển sang chế độ lưới đơn (allNews), ẩn các mục đặc biệt.

Trạng thái không có kết quả:
- Icon tờ báo (material symbol: newspaper) kích thước 6xl.
- Tiêu đề: "Không tìm thấy tin tức".
- Mô tả: "Vui lòng thử lại với từ khóa tìm kiếm hoặc danh mục khác."

---

### UC-NT-04: Phân trang

Điều kiện hiển thị: chỉ hiện khi totalPages > 1.

Giao diện phân trang:
- Nút mũi tên trái (<): disabled và opacity-50 khi ở trang 1.
- Nút số trang: trang hiện tại tô nền primary, chữ trắng.
- Nút mũi tên phải (>): disabled và opacity-50 khi ở trang cuối.
- Click vào số trang: tải nội dung trang tương ứng.
- Click "...": không làm gì (bỏ qua).

Logic tạo số trang:
- Tổng số trang <= 5: hiển thị tất cả số trang.
- Trang hiện tại <= 3: [1, 2, 3, 4, ..., total]
- Trang hiện tại >= total-2: [1, ..., total-3, total-2, total-1, total]
- Trang khác: [1, ..., current-1, current, current+1, ..., total]

---

## 3. Trang chi tiết tin tức (/tin-tuc/chi-tiet/:id)

### UC-NT-05: Xem chi tiết bài viết

Luồng chính:
1. Người dùng click vào một tin từ trang danh sách hoặc truy cập trực tiếp URL với MaTinTuc.
2. Hệ thống gọi API getNewsById(id).
3. Trong khi chờ API: hiển thị spinner loading (vòng xoay border-primary).
4. Khi có dữ liệu, bố cục gồm:

Breadcrumb:
- Trang chủ → Tin tức → Chi tiết tin tức (link clickable)

Header bài viết:
- Badge danh mục (in hoa).
- Tiêu đề h1 (headline-md → headline-lg trên desktop).
- Ngày đăng (format DD/MM/YYYY) với icon calendar.
- Nút chia sẻ: icon share, icon workspace_premium, icon link (hiển thị UI nhưng chưa có chức năng backend).

Cột trái (8/12):
- Hộp tóm tắt (nếu có MoTaNgan): khung trắng, viền trái 4px màu primary, chữ in nghiêng.
- Ảnh bìa (nếu có AnhBia): cao tối đa 480px, object-cover.
- Nội dung bài viết (NoiDungChiTiet): render HTML thô qua [innerHTML].

Cột phải (4/12) - Sidebar:
- Tiêu đề: "Tin tức khác"
- Hiển thị tối đa 5 tin mới nhất khác (otherNews), mỗi tin: số thứ tự (01, 02..., màu primary/20), tiêu đề, ngày đăng dạng "D Tháng M, YYYY".
- Click vào tin: điều hướng đến /tin-tuc/chi-tiet/:id tương ứng.

Bài viết liên quan (cuối trang):
- Tiêu đề: "BÀI VIẾT LIÊN QUAN" (hiện khi có relatedNews).
- Link "Xem tất cả" → /tin-tuc.
- Grid 3 cột: ảnh, danh mục, tiêu đề, mô tả ngắn, ngày đăng.
- Click: điều hướng đến /tin-tuc/chi-tiet/:id.

---

## 4. Bảng mapping danh mục hiển thị

| Giá trị API (LoaiTinTuc) | Hiển thị giao diện |
|---|---|
| ThongBao | THÔNG BÁO |
| SuKien | SỰ KIỆN |
| KhuyenMai | KHUYẾN MÃI |
| TinTucChung / TinTuc | TIN NHÀ XE |
| HuongDan | CẨM NANG DI CHUYỂN |
| TuyenDung | TUYỂN DỤNG |
| Giá trị khác | TIN NHÀ XE (mặc định) |

---

## 5. Cấu trúc dữ liệu API

Trang danh sách (GET /customer/tin-tuc/public?page=&limit=&loai=&search=):
- data.featuredNews: object — tin nổi bật (nullable)
- data.items: array — danh sách tin (phân trang)
- data.meta.totalPages: number — tổng số trang

Mỗi item tin tức:
- MaTinTuc: string — mã tin tức
- TieuDe: string — tiêu đề
- NgayDang: datetime — ngày đăng (format DD/MM/YYYY khi hiển thị)
- MoTaNgan: string — mô tả ngắn (tùy chọn)
- AnhBia: string — URL ảnh bìa (fallback: ảnh Unsplash)
- LoaiTinTuc: string — loại danh mục

Trang chi tiết (GET /customer/tin-tuc/public/:id):
- data.news: object — chi tiết bài viết (thêm NoiDungChiTiet)
- data.latestNews: array — tối đa 5 tin mới nhất khác
- data.relatedNews: array — bài viết liên quan cùng danh mục

---

## 6. Danh sách test scenarios đề xuất

| Mã | Tên test case | Độ ưu tiên |
|---|---|---|
| TC_NT_01 | Trang /tin-tuc load thành công, hiển thị tin nổi bật và tin mới nhất | Cao |
| TC_NT_02 | Click tab "KHUYẾN MÃI" → hiển thị chỉ tin khuyến mãi, ẩn featured/latest | Cao |
| TC_NT_03 | Click lại tab đang active → quay về trang tổng với layout đầy đủ | Trung bình |
| TC_NT_04 | Tìm kiếm từ khóa có kết quả → hiển thị tin khớp | Cao |
| TC_NT_05 | Tìm kiếm từ khóa không có kết quả → hiển thị trạng thái empty state | Cao |
| TC_NT_06 | Đổi tab → ô tìm kiếm tự động reset về rỗng | Trung bình |
| TC_NT_07 | Phân trang: click trang 2 → tải nội dung trang 2 | Trung bình |
| TC_NT_08 | Phân trang: nút < disabled khi ở trang 1 | Trung bình |
| TC_NT_09 | Phân trang: nút > disabled khi ở trang cuối | Trung bình |
| TC_NT_10 | Click vào tin tức → điều hướng đến /tin-tuc/chi-tiet/:id | Cao |
| TC_NT_11 | Trang chi tiết hiển thị đúng tiêu đề, ngày, nội dung bài viết | Cao |
| TC_NT_12 | Trang chi tiết: sidebar "Tin tức khác" hiển thị tối đa 5 tin | Trung bình |
| TC_NT_13 | Trang chi tiết: section "Bài viết liên quan" hiển thị khi có dữ liệu | Trung bình |
| TC_NT_14 | Breadcrumb: click "Tin tức" → điều hướng về /tin-tuc | Thấp |
| TC_NT_15 | Trang chi tiết: click bài viết liên quan → điều hướng đến chi tiết bài đó | Trung bình |
