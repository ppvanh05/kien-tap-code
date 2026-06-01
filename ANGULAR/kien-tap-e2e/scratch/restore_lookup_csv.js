const fs = require('fs');
const path = require('path');

const logPath = path.join('C:/Users/PC/.gemini/antigravity-ide/brain/7f44394b-3dcf-46a5-b82a-495d84d21e50/.system_generated/logs/transcript.jsonl');
const destPath = path.join(__dirname, '../practices/testcases/testcases_customer_ticket_lookup.csv');

if (!fs.existsSync(logPath)) {
  console.error('Không tìm thấy file transcript.jsonl');
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let originalCsvContent = null;

for (let line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // Tìm output của view_file chứa testcases_customer_ticket_lookup_v2.csv
    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('testcases_customer_ticket_lookup_v2.csv')) {
      originalCsvContent = obj.content;
      break;
    }
    // Hoặc tìm trong tool_calls / output
    if (obj.tool_calls) {
      for (let tc of obj.tool_calls) {
        if (tc.output && tc.output.includes('testcases_customer_ticket_lookup_v2.csv')) {
          originalCsvContent = tc.output;
        }
      }
    }
  } catch (e) {
    // Ignore parse error
  }
}

if (!originalCsvContent) {
  // Tìm kiếm bằng regex đơn giản nếu parse JSON không ra
  const rawLog = fs.readFileSync(logPath, 'utf8');
  const match = rawLog.match(/File Path: `file:\/\/\/c:\/Users\/PC\/kien-tap-code\/ANGULAR\/kien-tap-e2e\/practices\/testcases\/testcases_customer_ticket_lookup_v2\.csv`[\s\S]*?Showing lines 1 to 170\s*\n([\s\S]*?)(?=\n\n|\n\s*The above content shows)/);
  if (match) {
    originalCsvContent = match[1];
  }
}

if (originalCsvContent) {
  // Loại bỏ số dòng (ví dụ "1: ", "2: ") ở đầu mỗi dòng
  const csvLines = originalCsvContent.split('\n');
  const cleanedLines = [];
  for (let line of csvLines) {
    // Tìm format "number: content"
    const match = line.match(/^\s*\d+:\s*(.*)$/);
    if (match) {
      cleanedLines.push(match[1]);
    } else if (line.trim().startsWith('TC ID,')) {
      cleanedLines.push(line);
    }
  }

  const finalCsv = cleanedLines.join('\n');
  fs.writeFileSync(destPath, finalCsv, 'utf8');
  console.log('Khôi phục file CSV gốc thành công vào: ' + destPath);
} else {
  console.error('Không tìm thấy nội dung CSV gốc trong logs!');
}
