# Prompt Workflow Templates - TXP Limousine QA

Thư mục này chứa prompt đã gắn sẵn slash command ở dòng đầu tiên. Dùng các file này khi AI agent có hỗ trợ workflow tương ứng, ví dụ `/generate_requirements_from_website` hoặc `/generate_automation_from_testcases`.

Nếu AI chat không hỗ trợ slash command, dùng prompt ở `prompt_templates/` thay vì thư mục này.

## Danh sách

| # | File | Workflow | Skill tham chiếu |
|---|---|---|---|
| 01 | [`prompt_01_generate_requirements.txt`](prompt_01_generate_requirements.txt) | `/generate_requirements_from_website` | `requirements_analyzer` |
| 02 | [`prompt_02_generate_test_cases.txt`](prompt_02_generate_test_cases.txt) | `/generate_manual_testcases_rbt` | `rbt_manual_testing` |
| 03 | [`prompt_03_create_framework_playwright.txt`](prompt_03_create_framework_playwright.txt) | `/generate_automation_framework` | `qa_automation_engineer` |
| 04 | [`prompt_04_generate_script_playwright.txt`](prompt_04_generate_script_playwright.txt) | `/generate_automation_from_testcases` | `qa_automation_engineer` |
| 05 | [`prompt_05_convert_manual_to_automation.txt`](prompt_05_convert_manual_to_automation.txt) | `/generate_automation_from_testcases` | `qa_automation_engineer` |
| 07 | [`prompt_07_generate_test_data.txt`](prompt_07_generate_test_data.txt) | `/generate_test_data` | `test_data_generator` |
| 08 | [`prompt_08_analyze_flaky_tests.txt`](prompt_08_analyze_flaky_tests.txt) | `/analyze_flaky_tests` | `flaky_test_analyzer` |
| 09 | [`prompt_09_generate_api_tests.txt`](prompt_09_generate_api_tests.txt) | `/generate_api_tests_from_swagger` | `qa_automation_engineer` |

`prompt_06_review_automation_code.txt` không có workflow riêng nên chỉ nằm ở thư mục `prompt_templates/`.

## Cách dùng

1. Chọn prompt đúng tác vụ.
2. Mở file `.txt`.
3. Thay `[...]` bằng thông tin thực tế của TXP Limousine.
4. Paste toàn bộ nội dung vào AI agent có hỗ trợ workflow.
