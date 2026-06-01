# Project Architecture - TXP Limousine Playwright

**Workflow:** `/generate_automation_from_testcases` hoặc `/generate_automation_framework`
**Skill:** `qa_automation_engineer` + `framework_architect`

Tài liệu này mô tả kiến trúc automation đang dùng trong project TXP Limousine. Stack chính là Playwright, TypeScript, npm, Page Object Model và Playwright Test runner.

## Mục tiêu

- Giữ page object, fixture, test spec và helper tách biệt rõ ràng.
- Tái sử dụng locator và hành vi nghiệp vụ qua `src/pages/`.
- Đọc URL, tài khoản và timeout từ `.env`.
- Sinh report bằng Playwright HTML và Allure.
- Hạn chế hardcode dữ liệu và hard sleep.

## Cấu trúc chuẩn

```text
.
|-- playwright.config.ts
|-- package.json
|-- tsconfig.json
|-- .env.example
|-- src/
|   |-- fixtures/
|   |   `-- base.fixture.ts
|   |-- pages/
|   |   |-- base.page.ts
|   |   |-- admin/
|   |   `-- customer/
|   |-- tests/
|   |   |-- admin/
|   |   `-- customer/
|   `-- utils/
|       |-- env.config.ts
|       |-- test-data.ts
|       `-- DataGenerator.ts
|-- practices/
|   |-- requirements/
|   |-- testcases/
|   `-- reports/
|-- plans/
|-- prompt_templates/
`-- scripts/
    |-- convert_excel/
    `-- integrations/
```

## Vai trò từng lớp

| Thành phần | Vai trò |
|---|---|
| `src/pages/base.page.ts` | Chứa hành vi chung cho page object |
| `src/pages/admin/` | Page object cho các module quản trị |
| `src/pages/customer/` | Page object cho các luồng khách hàng |
| `src/fixtures/base.fixture.ts` | Khởi tạo và inject page object vào test |
| `src/tests/admin/` | Spec cho trang quản trị |
| `src/tests/customer/` | Spec cho giao diện khách hàng |
| `src/utils/env.config.ts` | Đọc biến môi trường |
| `src/utils/test-data.ts` | Sinh test data unique/traceable |
| `practices/` | Requirement, manual test cases và báo cáo tham chiếu |

## Quy ước khi thêm module mới

1. Tạo hoặc cập nhật requirement trong `practices/requirements/txp-bus/`.
2. Tạo page object trong `src/pages/admin/` hoặc `src/pages/customer/`.
3. Đăng ký page object trong `src/fixtures/base.fixture.ts`.
4. Tạo spec tương ứng trong `src/tests/admin/` hoặc `src/tests/customer/`.
5. Chạy test liên quan trước khi mở rộng sang toàn bộ suite.

## Component bắt buộc

| Component | Bắt buộc | Ghi chú |
|---|---|---|
| Page Object Model | Có | Locator và action nằm trong page class |
| Custom fixtures | Có | Test dùng fixture thay vì tự new page object lặp lại |
| `.env` config | Có | Không hardcode URL/credential trong spec |
| Test data helper | Có | Dữ liệu cần unique và truy vết được |
| Report | Có | HTML report và Allure report |
| CI/CD | Khuyến khích | Có thể dùng GitHub Actions khi cần |

## Anti-pattern cần tránh

| Không nên | Nên làm |
|---|---|
| Locator inline trong `.spec.ts` | Khai báo locator trong page object |
| `page.waitForTimeout()` | Dùng auto-wait hoặc `expect` |
| Hardcode URL/tài khoản trong code | Đọc từ `ENV` |
| Một spec quá dài, gom nhiều module | Tách theo feature/module |
| Đoán locator từ tên field | Inspect DOM thật bằng Browser/Playwright |

## Lệnh tham chiếu

```bash
npm run test
npm run test:headed
npm run test:ui
npm run test:report
npm run allure:generate
npm run allure:open
```
