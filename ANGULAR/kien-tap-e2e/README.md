# TXP Limousine E2E Automation Testing Framework

> **Công nghệ:** Playwright + TypeScript + Page Object Model (POM)  
> **Ngôn ngữ:** TypeScript  
> **Runner:** Playwright Test  
> **Báo cáo:** Playwright HTML + Allure Report  

Bộ kiểm thử tự động E2E (End-to-End) được thiết kế chuyên biệt để kiểm thử các luồng nghiệp vụ trên hệ thống đặt vé xe trực tuyến & Quản trị điều hành **TXP Limousine**.

---

## 🛠️ Yêu cầu cài đặt trước (Prerequisites)

- [Node.js](https://nodejs.org/) phiên bản **18** trở lên.
- Trình quản lý gói **npm** (đã đi kèm khi cài Node.js).

---

## 🚀 Cài đặt & Thiết lập ban đầu

1. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

2. **Cài đặt môi trường duyệt web Playwright (Browsers):**
   ```bash
   npx playwright install
   ```

3. **Cấu hình biến môi trường (`.env`):**
   - Nhân bản file mẫu `.env.example` thành file cấu hình thực tế `.env`:
     ```bash
     cp .env.example .env
     ```
   - Điền thông tin URL ứng dụng local và tài khoản admin thử nghiệm của bạn vào file `.env`.

---

## 🏃 Chạy kịch bản kiểm thử (Run Tests)

* **Chạy toàn bộ kịch bản E2E (mặc định headless):**
   ```bash
   npm run test
   ```

* **Chạy chế độ Headed mở trình duyệt thực tế (chuẩn Debug UI):**
   ```bash
   npm run test:headed
   ```

* **Chạy giao diện trực quan Playwright UI mode (Khuyến nghị khi code test):**
   ```bash
   npm run test:ui
   ```

* **Chạy chế độ Debug chi tiết:**
   ```bash
   npm run test:debug
   ```

---

## 📊 Xem báo cáo kiểm thử (Test Reports)

### 1. Báo cáo HTML Playwright mặc định
Sau khi chạy test xong, mở báo cáo HTML trực quan bằng lệnh:
```bash
npm run test:report
```

### 2. Allure Report nâng cao
- **Tạo báo cáo Allure từ kết quả chạy:**
  ```bash
  npm run allure:generate
  ```
- **Mở giao diện báo cáo Allure trên cổng Localhost:**
  ```bash
  npm run allure:open
  ```

---

## 📁 Cấu trúc thư mục Framework

```
txp-limousine-e2e-tests/
├── playwright.config.ts        # Cấu hình chính của Playwright (viewport, timeout, parallel)
├── package.json                # Danh sách dependencies & lệnh chạy test script
├── tsconfig.json               # Cấu hình biên dịch ngôn ngữ TypeScript
├── .env.example                # File mẫu cấu hình biến môi trường
├── .env                        # File cấu hình môi trường thực tế (Local)
├── .gitignore
├── README.md                   # Tài liệu hướng dẫn sử dụng này
├── src/
│   ├── pages/                  # Lớp Page Object Model (POM)
│   │   ├── base.page.ts        # Base Page định nghĩa các smart wait chung (không dùng hard sleep)
│   │   └── login.page.ts       # Page Object mẫu cho module Admin Login
│   ├── fixtures/               # Fixtures để cô lập và tự động hóa vòng đời Page Objects
│   │   └── base.fixture.ts     # Khởi tạo tự động page objects
│   ├── utils/                  # Thư mục chứa các tệp tin hỗ trợ chung
│   │   ├── env.config.ts       # Bộ đọc biến môi trường an toàn kiểu tĩnh (Typed)
│   │   └── test-data.ts        # Bộ phát sinh dữ liệu traceable E2E unique (GEMINI rule)
│   └── tests/                  # Thư mục chứa các tệp kiểm thử (.spec.ts)
│       └── auth/
│           └── admin-login.spec.ts  # Test case mẫu đăng nhập quản trị
└── .github/
    └── workflows/
        └── playwright.yml      # CI/CD Pipeline tự động chạy test trên GitHub Actions
```

---

## 🛡️ Quy tắc viết kịch bản kiểm thử (Coding Conventions)

1. **Page Object Model (POM):**
   - **Tất cả locators** phải khai báo tại constructor của Page class. Tuyệt đối **không viết locator inline** trong file `.spec.ts`.
   - Các hành động trong Page Class phải mô tả hành vi người dùng (ví dụ: `login()`, `bookTicket()`), không mô tả click thẻ HTML cụ thể.
2. **Smart Waits:**
   - **Tuyệt đối không sử dụng** `page.waitForTimeout()` hay `Thread.sleep()`.
   - Chỉ sử dụng Smart Wait tự động tích hợp trong `expect()` của Playwright (ví dụ: `await expect(locator).toBeVisible()`).
3. **Traceable Test Data:**
   - Sử dụng `TestDataGenerator` để sinh ngẫu nhiên số điện thoại, email, họ tên hoặc mã giao dịch duy nhất nhằm tránh trùng lặp dữ liệu trên DB.