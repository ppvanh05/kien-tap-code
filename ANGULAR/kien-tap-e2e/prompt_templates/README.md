# Prompt Templates - TXP Limousine QA

Thư mục này chứa prompt dùng nhanh cho các tác vụ QA trong project TXP Limousine. Các prompt ở đây phù hợp khi cần copy một lần vào AI chat/agent đang dùng để phân tích requirement, sinh test case, viết Playwright test hoặc review automation code.

Nếu cần làm theo quy trình nhiều bước, xem thêm `plans/manual/`, `plans/automation/` và `plans/cross-module/`.

## Danh sách prompt

| # | File | Mục đích |
|---|---|---|
| 01 | [`prompt_01_generate_requirements.txt`](prompt_01_generate_requirements.txt) | Phân tích website hoặc module để viết requirement |
| 02 | [`prompt_02_generate_test_cases.txt`](prompt_02_generate_test_cases.txt) | Sinh manual test cases từ requirement |
| 03 | [`prompt_03_create_framework_playwright.txt`](prompt_03_create_framework_playwright.txt) | Dựng hoặc rà soát framework Playwright TypeScript |
| 04 | [`prompt_04_generate_script_playwright.txt`](prompt_04_generate_script_playwright.txt) | Viết automation script Playwright từ test case |
| 05 | [`prompt_05_convert_manual_to_automation.txt`](prompt_05_convert_manual_to_automation.txt) | Chuyển manual test case sang automation |
| 06 | [`prompt_06_review_automation_code.txt`](prompt_06_review_automation_code.txt) | Review code automation |
| 07 | [`prompt_07_generate_test_data.txt`](prompt_07_generate_test_data.txt) | Sinh test data có cấu trúc |
| 08 | [`prompt_08_analyze_flaky_tests.txt`](prompt_08_analyze_flaky_tests.txt) | Phân tích test flaky |
| 09 | [`prompt_09_generate_api_tests.txt`](prompt_09_generate_api_tests.txt) | Viết API test từ Swagger/OpenAPI |

## Cách dùng

1. Chọn prompt phù hợp với tác vụ.
2. Mở file `.txt`.
3. Thay các phần trong `[...]` bằng thông tin thực tế của TXP Limousine.
4. Paste nội dung vào AI chat/agent và chạy.

## Khi nào dùng `prompt_workflow_template/`

`prompt_workflow_template/` chứa các prompt có sẵn dòng slash command ở đầu. Chỉ dùng thư mục đó nếu AI agent của bạn có cấu hình workflow tương ứng. Nếu không, dùng các prompt ở thư mục hiện tại.
