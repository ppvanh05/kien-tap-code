# TXP Limousine E2E Automation Testing Framework

Project này chứa bộ kiểm thử E2E cho hệ thống TXP Limousine bằng Playwright và TypeScript. Test tập trung vào luồng khách hàng và trang quản trị, tổ chức theo Page Object Model để dễ bảo trì khi UI thay đổi.

## Stack chính

- Playwright Test
- TypeScript
- Page Object Model
- Custom fixtures cho page objects
- Playwright HTML report và Allure report

## Cài đặt

Yêu cầu Node.js 18 trở lên và npm.

```bash
npm install
npx playwright install
```

Tạo file cấu hình môi trường:

```powershell
Copy-Item .env.example .env
```

Trên macOS/Linux:

```bash
cp .env.example .env
```

Các biến thường dùng trong `.env`:

| Biến | Mục đích |
|---|---|
| `CUSTOMER_URL` | URL giao diện khách hàng |
| `ADMIN_URL` | URL trang đăng nhập/admin |
| `API_BASE_URL` | URL API nếu test cần gọi backend trực tiếp |
| `ADMIN_USERNAME` | Tài khoản admin test |
| `ADMIN_PASSWORD` | Mật khẩu admin test |
| `DEFAULT_TIMEOUT` | Timeout mặc định |
| `EXPECT_TIMEOUT` | Timeout cho assertion |

## Chạy test

| Lệnh | Mục đích |
|---|---|
| `npm run test` | Chạy toàn bộ test headless |
| `npm run test:headed` | Chạy test có mở browser |
| `npm run test:ui` | Mở Playwright UI mode |
| `npm run test:debug` | Chạy chế độ debug |
| `npm run test:report` | Mở Playwright HTML report |
| `npm run allure:generate` | Sinh Allure report từ `allure-results/` |
| `npm run allure:open` | Mở Allure report |

Có thể chạy riêng một spec:

```bash
npx playwright test src/tests/customer/booking.spec.ts
npx playwright test src/tests/admin/login.spec.ts --headed
```

## Cấu trúc project

```text
.
├── playwright.config.ts
├── package.json
├── .env.example
├── src/
│   ├── fixtures/
│   │   └── base.fixture.ts
│   ├── pages/
│   │   ├── base.page.ts
│   │   ├── admin/
│   │   └── customer/
│   ├── tests/
│   │   ├── admin/
│   │   └── customer/
│   └── utils/
├── practices/
│   ├── requirements/
│   ├── testcases/
│   └── reports/
├── plans/
│   ├── manual/
│   ├── automation/
│   └── cross-module/
├── prompt_templates/
└── scripts/
    ├── convert_excel/
    └── integrations/
```

## Module test hiện có

Nhóm admin:

- Login, dashboard, RBAC
- Accounts
- Tickets
- Dispatch
- Blacklist
- Logs
- News
- Policy

Nhóm customer:

- Home
- Register, forgot password, profile
- Search trip, booking/payment, ticket lookup
- News
- Policy/About
- Review

## Tài liệu và dữ liệu thực hành

- `practices/requirements/txp-bus/`: requirement theo từng module TXP.
- `practices/testcases/`: manual test cases dạng CSV/XLSX.
- `practices/reports/`: báo cáo bug và kết quả rà soát.
- `plans/`: quy trình prompt cho manual testing, automation và cross-module testing.
- `prompt_templates/`: prompt dùng nhanh cho các tác vụ QA trong project này.

## Quy ước viết test

- Locator đặt trong page object, không viết rải rác trong file `.spec.ts`.
- Test chỉ gọi hành vi nghiệp vụ từ page object, ví dụ `login()`, `searchTrip()`, `createTicket()`.
- Không dùng hard sleep như `page.waitForTimeout()` nếu có thể thay bằng auto-wait hoặc `expect`.
- Test data cần có tính duy nhất và truy vết được khi tạo dữ liệu mới.
- Artifact sau khi chạy test như `playwright-report/`, `allure-results/`, `test-results/`, `allure-report/` là output sinh ra, không commit.
