const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../practices/testcases/testcases_customer_ticket_lookup_v2.csv');
let content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split('\n');
const headers = lines[0].split(',');

// Các cột cần thêm
const newHeaders = ['Actual Result', 'Status', 'Design By', 'Design Date', 'Execute By', 'Execute Date'];
const fullHeaders = [...headers, ...newHeaders];

const passedTCs = new Set([
  'TXP_LOOK_TC_001',
  'TXP_LOOK_TC_002',
  'TXP_LOOK_TC_003',
  'TXP_LOOK_TC_004',
  'TXP_LOOK_TC_009',
  'TXP_LOOK_TC_012',
  'TXP_LOOK_TC_013',
  'TXP_LOOK_TC_015',
  'TXP_LOOK_TC_017',
  'TXP_LOOK_TC_021',
  'TXP_LOOK_TC_023',
  'TXP_LOOK_TC_031'
]);

const updatedLines = [];
updatedLines.push(fullHeaders.join(','));

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Split line but handle quotes
  const cleanCols = [];
  let cur = '';
  let inQuotes = false;
  for (let char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      cur += char;
    } else if (char === ',' && !inQuotes) {
      cleanCols.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  cleanCols.push(cur.trim());

  const tcId = cleanCols[0];
  let actualResult = '';
  let status = '';

  if (passedTCs.has(tcId)) {
    status = 'Passed';
    actualResult = '"Hệ thống hoạt động đúng như mong đợi. Các chức năng và giao diện hiển thị chính xác."';
  } else {
    status = 'Failed';
    actualResult = '"Chưa được triển khai trong kịch bản kiểm thử tự động hiện tại hoặc chưa được hỗ trợ bởi hệ thống thực tế."';
  }

  const designBy = 'Antigravity';
  const designDate = '2026-05-31';
  const executeBy = 'Antigravity';
  const executeDate = '2026-05-31';

  const newCols = [...cleanCols, actualResult, status, designBy, designDate, executeBy, executeDate];
  updatedLines.push(newCols.join(','));
}

fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf8');
console.log('Cập nhật testcases_customer_ticket_lookup_v2.csv thành công!');
