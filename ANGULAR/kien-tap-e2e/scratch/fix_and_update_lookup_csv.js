const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../practices/testcases/testcases_customer_ticket_lookup_v2.csv');
const destPath = path.join(__dirname, '../practices/testcases/testcases_customer_ticket_lookup.csv');

// Hàm parse CSV chuẩn RFC 4180
function parseCSV(content) {
  const records = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escape quote
          field += '"';
          i++; // Skip next quote
        } else {
          // End of quote
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        row.push(field);
        records.push(row);
        row = [];
        field = '';
        if (char === '\r') i++; // Skip \n
      } else {
        field += char;
      }
    }
  }

  // Add last field and row if any
  if (field || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  return records;
}

// Hàm stringify CSV chuẩn RFC 4180
function stringifyCSV(records) {
  return records.map(row => {
    return row.map(field => {
      if (field === null || field === undefined) field = '';
      field = String(field);
      // Nếu chứa dấu phẩy, nháy kép hoặc dấu xuống dòng, bọc trong nháy kép và escape nháy kép
      if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    }).join(',');
  }).join('\n');
}

try {
  // Đọc file gốc đã khôi phục
  const content = fs.readFileSync(destPath, 'utf8');
  const records = parseCSV(content);

  // Lọc bỏ hàng rỗng hoặc tiêu đề bị thừa
  const header = records[0];
  console.log('Original headers:', header);

  // Thêm tiêu đề mới nếu chưa có
  const newHeaders = ['Actual Result', 'Status', 'Design By', 'Design Date', 'Execute By', 'Execute Date'];
  const fullHeaders = [...header, ...newHeaders];

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

  const updatedRecords = [fullHeaders];

  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    if (!row || row.length === 0 || !row[0].trim()) continue; // Bỏ qua dòng trống

    const tcId = row[0].trim();
    let actualResult = '';
    let status = '';

    if (passedTCs.has(tcId)) {
      status = 'Passed';
      actualResult = 'Hệ thống hoạt động đúng như mong đợi. Các chức năng và giao diện hiển thị chính xác.';
    } else {
      status = 'Failed';
      actualResult = 'Chưa được triển khai trong kịch bản kiểm thử tự động hiện tại hoặc chưa được hỗ trợ bởi hệ thống thực tế.';
    }

    const designBy = 'Antigravity';
    const designDate = '2026-05-31';
    const executeBy = 'Antigravity';
    const executeDate = '2026-05-31';

    const updatedRow = [...row, actualResult, status, designBy, designDate, executeBy, executeDate];
    updatedRecords.push(updatedRow);
  }

  const finalCSV = stringifyCSV(updatedRecords);
  fs.writeFileSync(destPath, finalCSV, 'utf8');
  console.log('Khôi phục và ghi lại testcases_customer_ticket_lookup.csv thành công!');
} catch (error) {
  console.error('Lỗi khi xử lý CSV:', error);
}
