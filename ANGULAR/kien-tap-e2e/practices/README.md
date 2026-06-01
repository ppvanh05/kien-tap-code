# Practices - TXP Limousine QA Assets

Thư mục này chứa tài liệu phục vụ kiểm thử cho project TXP Limousine: requirement theo module, manual test cases, file Excel/CSV tổng hợp và báo cáo bug. Nội dung ở đây là nguồn tham chiếu để viết hoặc rà soát automation trong `src/tests/`.

Nội dung chỉ dành cho TXP Limousine, không phải danh sách web demo hay tài khoản demo bên ngoài.

## Cấu trúc

```text
practices/
├── requirements/
│   └── txp-bus/
│       ├── requirements_admin_accounts.md
│       ├── requirements_admin_blacklist.md
│       ├── requirements_admin_dispatch.md
│       ├── requirements_admin_logs.md
│       ├── requirements_admin_news.md
│       ├── requirements_admin_policy.md
│       ├── requirements_admin_rbac.md
│       ├── requirements_admin_tickets.md
│       ├── requirements_customer_booking_payment.md
│       ├── requirements_customer_forgot_password.md
│       ├── requirements_customer_home.md
│       ├── requirements_customer_news.md
│       ├── requirements_customer_policy_about.md
│       ├── requirements_customer_profile.md
│       ├── requirements_customer_register.md
│       ├── requirements_customer_review.md
│       ├── requirements_customer_ticket_lookup.md
│       └── requirements_search_trip.md
├── testcases/
│   ├── testcases_*.csv
│   ├── testcases_customer_register.xlsx
│   ├── testcase_template.xlsx
│   └── compiled/
└── reports/
    ├── admin/
    ├── customer/
    └── txp_bug_report_detailed_2026-06-01.md
```

## Nhóm tài liệu

Requirements:

- Mô tả chức năng theo module admin và customer.
- Ghi nhận acceptance criteria, validation, luồng chính, luồng lỗi và điểm cần làm rõ.
- Là đầu vào chính khi sinh manual test case hoặc kiểm tra coverage automation.

Test cases:

- Các file `testcases_*.csv` là manual test cases theo từng module.
- File trong `compiled/` là bản tổng hợp theo nhóm admin/customer.
- `testcase_template.xlsx` là mẫu Excel để chuẩn hóa khi cần import hoặc chia sẻ.

Reports:

- Chứa báo cáo bug, kết quả kiểm thử và tài liệu rà soát theo module.
- Dùng để đối chiếu lỗi đã phát hiện với automation test tương ứng.

## Module đang được cover

Admin:

- Accounts
- Blacklist
- Dispatch
- Logs
- News
- Policy
- RBAC
- Tickets

Customer:

- Home
- Register
- Forgot password
- Profile
- Search trip
- Booking/payment
- Ticket lookup
- News
- Policy/About
- Review

## Cách dùng trong project

1. Đọc requirement trong `practices/requirements/txp-bus/`.
2. Đối chiếu manual test case tương ứng trong `practices/testcases/`.
3. Viết hoặc cập nhật page object trong `src/pages/`.
4. Viết automation spec trong `src/tests/admin/` hoặc `src/tests/customer/`.
5. Sau khi chạy test, đối chiếu lỗi với `practices/reports/` nếu cần.

Script hỗ trợ tổng hợp workbook:

```bash
python scripts/build_consolidated_testcase_workbooks.py
```

Script chuyển Markdown test case sang Excel:

```bash
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```
