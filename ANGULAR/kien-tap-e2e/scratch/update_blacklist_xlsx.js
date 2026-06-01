const XLSX = require('c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/scripts/convert_excel/node_modules/xlsx');
const path = require('path');

const xlsxPath = 'c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/practices/testcases/testcases_admin_blacklist_v2 (1).xlsx';
const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const today = '2026-05-31';

data.forEach(row => {
  const tcId = row['TC ID'];
  row['Design By'] = 'Antigravity';
  row['Design Date'] = today;
  row['Execute By'] = 'Antigravity';
  row['Execute Date'] = today;

  if (tcId === 'TXP_ADMIN_BLACKLIST_TC_001' || tcId === 'TXP_ADMIN_BLACKLIST_TC_002' || tcId === 'TXP_ADMIN_BLACKLIST_TC_003') {
    row['Status'] = 'Passed';
    row['Actual Result'] = 'Thực hiện thành công khớp với mong đợi.';
  } else if (tcId === 'TXP_ADMIN_BLACKLIST_TC_004') {
    row['Status'] = 'Failed';
    row['Actual Result'] = 'Thất bại: UI hệ thống không hỗ trợ nút Xóa từ khóa cấm (Chỉ có chức năng Sửa/Ngưng áp dụng).';
  } else {
    row['Status'] = 'Pending';
    row['Actual Result'] = 'Chưa thực hiện do kiểm thử chế độ serial bị dừng ở bước trước.';
  }
});

// Ghi đè lại dữ liệu vào sheet
const newSheet = XLSX.utils.json_to_sheet(data);

// Sao chép độ rộng cột từ sheet cũ nếu có
if (sheet['!cols']) {
  newSheet['!cols'] = sheet['!cols'];
} else {
  newSheet['!cols'] = [
    { wch: 28 }, // TC ID
    { wch: 20 }, // Module
    { wch: 12 }, // Risk Level
    { wch: 45 }, // Test Scenario
    { wch: 40 }, // Pre-Condition
    { wch: 55 }, // Test Steps
    { wch: 35 }, // Test Data
    { wch: 55 }, // Expected Result
    { wch: 10 }, // Priority
    { wch: 55 }, // Actual Result
    { wch: 12 }, // Status
    { wch: 18 }, // Design By
    { wch: 12 }, // Design Date
    { wch: 18 }, // Execute By
    { wch: 12 }  // Execute Date
  ];
}

workbook.Sheets[sheetName] = newSheet;
XLSX.writeFile(workbook, xlsxPath);
console.log('Đã cập nhật kết quả kiểm thử vào file Excel!');
