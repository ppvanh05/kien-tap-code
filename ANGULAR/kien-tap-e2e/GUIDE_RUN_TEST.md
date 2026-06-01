# HƯỚNG DẪN THỰC THI TEST AUTOMATION & XEM BÁO CÁO (PLAYWRIGHT)

Tài liệu này hướng dẫn chi tiết cách chạy kiểm thử tự động, giải thích các file/thư mục được sinh ra, và cách mở báo cáo kết quả kiểm thử.

---

## 1. Thư Mục Làm Việc (Terminal Path)

> [!IMPORTANT]
> **ĐÂY LÀ ĐIỀU QUAN TRỌNG NHẤT:** 
> Tất cả các câu lệnh bên dưới đều **phải được chạy từ thư mục gốc của dự án E2E**: 
> `c:\Users\PC\kien-tap-code\ANGULAR\kien-tap-e2e`
> 
> Bạn **không cần** và **không được** `cd` vào các thư mục con như `src`, `tests` hay `playwright-report` khi thực thi lệnh. Hãy giữ nguyên đường dẫn terminal ở thư mục gốc này để chạy lệnh.

---

## 2. Cách Chạy Test Automation (Playwright)

Mở Terminal tại thư mục gốc của dự án (`kien-tap-e2e`) và sử dụng các câu lệnh sau tùy theo nhu cầu:

### Chạy toàn bộ Test Suite (Mặc định)
Lệnh này sẽ chạy toàn bộ các file test trên cả 3 trình duyệt được cấu hình (Chromium, Firefox, WebKit):
```bash
npm run test
# Hoặc: npx playwright test
```

### Chạy trên một trình duyệt cụ thể (Khuyên Dùng khi test online)
Để tránh quá tải cho server backend miễn phí (Render.com), bạn nên giới hạn chạy trên trình duyệt **Chrome (chromium)**:
```bash
npx playwright test --project=chromium
```

### Chạy một file test cụ thể
Ví dụ bạn chỉ muốn chạy riêng file phân quyền Admin RBAC:
```bash
npx playwright test src/tests/admin/admin-rbac.spec.ts --project=chromium
```

### Chạy riêng một Test Case (theo tên kịch bản)
Dùng cờ `-g` kèm theo từ khóa hoặc mã TC ID để chạy riêng ca kiểm thử đó:
```bash
npx playwright test src/tests/admin/admin-rbac.spec.ts -g "TXP_ADMIN_RBAC_TC_003" --project=chromium
```

### Chạy chế độ có giao diện trực quan (UI Mode)
Mở giao diện tương tác của Playwright để bạn có thể nhấn nút Run trực tiếp, xem từng bước hành động, và debug dòng code trực quan:
```bash
npm run test:ui
# Hoặc: npx playwright test --ui
```

---

## 3. Cách Xem Báo Cáo Kết Quả (Reports)

Dự án hiện tại được tích hợp sẵn 2 loại báo cáo: **Playwright HTML Report** (Mặc định) và **Allure Report** (Báo cáo chuyên nghiệp).

### Cách 1: Playwright HTML Report (Mặc định & Đơn giản)
Đứng tại thư mục gốc `kien-tap-e2e`, chạy lệnh sau để mở báo cáo trên trình duyệt:
```bash
npm run test:report
# Hoặc: npx playwright show-report
```
* **Giao diện:** Hiển thị danh sách các test case (Pass/Fail) và các bước thực thi chi tiết.
* **Đính kèm:** Tự động đính kèm **Screenshot** (Ảnh chụp màn hình thực tế) tại vị trí bị lỗi nếu test case đó bị thất bại. *(Video và Trace đã được tắt đi theo yêu cầu để giảm tải dung lượng).*

### Cách 2: Allure Report (Chuyên nghiệp, Đẹp mắt, Đầy đủ biểu đồ)

> [!WARNING]
> **YÊU CẦU ĐẶC BIỆT:** Allure chạy trên nền tảng **Java**, nên máy bạn **bắt buộc phải cài đặt Java (JRE/JDK)** và cấu hình biến môi trường `JAVA_HOME` thì lệnh này mới hoạt động.
> 
> Nếu chạy lệnh gặp lỗi `ERROR: JAVA_HOME is not set...` hoặc lỗi Java, **bạn nên dùng Cách 1 (Playwright HTML Report)** vì nó hoàn toàn không cần cài Java và vẫn hiển thị đầy đủ Screenshot lỗi.
> 
> Nếu vẫn muốn dùng Allure, hãy cài đặt Allure CLI cục bộ trước:
> ```bash
> npm install -D allure-commandline
> ```

Để sinh và xem Allure Report, đứng tại thư mục gốc `kien-tap-e2e` và chạy lần lượt 2 lệnh sau:
1. **Sinh báo cáo từ dữ liệu chạy test:**
   ```bash
   npm run allure:generate
   ```
2. **Mở giao diện báo cáo Allure trên trình duyệt:**
   ```bash
   npm run allure:open
   ```
* **Giao diện:** Cung cấp Dashboard trực quan với các biểu đồ tròn tỉ lệ pass/fail, thời gian chạy chi tiết, phân loại lỗi... rất trực quan và chuyên nghiệp.

---

## 4. Giải Thích Ý Nghĩa Các Thư Mục & File Được Sinh Ra

Sau khi bạn chạy kiểm thử tự động, Playwright và Allure sẽ tự động sinh ra một số thư mục phục vụ lưu trữ kết quả:

| Tên Thư Mục / File | Ý nghĩa & Vai trò |
| :--- | :--- |
| `playwright-report/` | Thư mục chứa toàn bộ mã nguồn của trang báo cáo HTML mặc định. Lệnh `npx playwright show-report` sẽ mở dữ liệu từ thư mục này. |
| `allure-results/` | Chứa dữ liệu thô (file JSON, XML) ghi lại kết quả trong lúc chạy test. Đây là đầu vào để Allure vẽ biểu đồ báo cáo. |
| `allure-report/` | Thư mục chứa giao diện báo cáo Allure hoàn chỉnh sau khi chạy lệnh sinh báo cáo. |
| `test-results/` | Thư mục lưu trữ bằng chứng kiểm thử của các test case bị **thất bại (Fail)**. Hiện tại thư mục này chỉ lưu duy nhất tệp ảnh chụp màn hình **`test-failed-1.png`** chụp lại giao diện ngay tại thời điểm xảy ra lỗi để giúp bạn nhanh chóng phát hiện ra nguyên nhân. |

---

## 5. Lưu Ý Khi Chạy Test
Do ứng dụng kiểm thử sử dụng **server API Render.com miễn phí**, server này tự động ngủ (cold start) sau 15 phút không hoạt động. 
* **Hiện tượng:** Lần chạy đầu tiên có thể mất từ 20-30 giây để hoàn thành đăng nhập (do phải chờ server thức dậy).
* **Lời khuyên:** 
  1. Khi chạy nhiều testcase, hãy giới hạn số lượng workers chạy cùng lúc để tránh làm nghẽn server bằng cờ `--workers=2`:
     `npx playwright test src/tests/admin/admin-rbac.spec.ts --project=chromium --workers=2`
  2. Chúng tôi đã tăng timeout của mỗi testcase lên **80 giây** và cấu hình **tự động thử lại (retries) 2 lần** nếu gặp sự cố mạng hoặc lỗi chập chờn để đảm bảo test suite luôn vượt qua và hoạt động bền bỉ nhất.
