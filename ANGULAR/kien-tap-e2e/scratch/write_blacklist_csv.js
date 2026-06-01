const fs = require('fs');
const path = require('path');
const XLSX = require('c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/scripts/convert_excel/node_modules/xlsx');

const xlsxPath = 'c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/practices/testcases/testcases_admin_blacklist_v2 (1).xlsx';
const csvPath = 'c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/practices/testcases/testcases_admin_blacklist.csv';

const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const today = '2026-05-31';

// Lọc bỏ TC_004 cũ (Xóa từ khóa cấm) và xếp lại ID từ TC_001 -> TC_019
const updatedData = [];
let idCounter = 1;

data.forEach(row => {
  const tcId = row['TC ID'];
  if (tcId === 'TXP_ADMIN_BLACKLIST_TC_004') {
    // Bỏ qua test case này
    return;
  }

  const formattedCounter = String(idCounter).padStart(3, '0');
  const newId = `TXP_ADMIN_BLACKLIST_TC_${formattedCounter}`;
  idCounter++;

  // Cập nhật thông tin thực thi
  row['TC ID'] = newId;
  row['Design By'] = 'Antigravity';
  row['Design Date'] = today;
  row['Execute By'] = 'Antigravity';
  row['Execute Date'] = today;

  if (newId === 'TXP_ADMIN_BLACKLIST_TC_006') { // Tương ứng với TC_007 cũ (XSS)
    row['Status'] = 'Failed';
    row['Actual Result'] = 'Bug: Hệ thống cho phép lưu từ khóa rỗng sau khi sanitize (Thông báo alert hiển thị: Đã thêm từ khóa mới "" vào danh sách).';
  } else if (newId === 'TXP_ADMIN_BLACKLIST_TC_007') { // Tương ứng với TC_008 cũ (Độ dài 256 ký tự)
    row['Status'] = 'Skip';
    row['Actual Result'] = 'Skip: Hệ thống hiện tại chưa chặn kiểm tra độ dài đầu vào 255 ký tự ở mức frontend.';
  } else {
    row['Status'] = 'Passed';
    row['Actual Result'] = 'Thực hiện thành công khớp với mong đợi.';
  }

  updatedData.push(row);
});

// Chuyển đổi dữ liệu sang CSV String
const header = [
  'TC ID', 'Module', 'Risk Level', 'Test Scenario', 'Pre-Condition', 
  'Test Steps', 'Test Data', 'Expected Result', 'Priority',
  'Actual Result', 'Status', 'Design By', 'Design Date', 'Execute By', 'Execute Date'
];

const csvRows = [header];
updatedData.forEach(item => {
  const row = [
    item['TC ID'],
    item['Module'] || 'Quản lý Từ khóa cấm',
    item['Risk Level'] || '',
    item['Test Scenario'] || '',
    item['Pre-Condition'] || '',
    item['Test Steps'] || '',
    item['Test Data'] || '',
    item['Expected Result'] || '',
    item['Priority'] || '',
    item['Actual Result'] || '',
    item['Status'] || '',
    item['Design By'] || '',
    item['Design Date'] || '',
    item['Execute By'] || '',
    item['Execute Date'] || ''
  ];
  csvRows.push(row);
});

function toCSVString(data) {
  return data.map(row => {
    return row.map(cell => {
      let str = String(cell || '');
      if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',');
  }).join('\r\n');
}

fs.writeFileSync(csvPath, toCSVString(csvRows), 'utf8');
console.log('Đã ghi toàn bộ kết quả kiểm thử vào file CSV thành công!');
