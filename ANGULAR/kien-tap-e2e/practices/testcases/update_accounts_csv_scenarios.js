const fs = require('fs');
const path = require('path');

const csvPath = 'c:\\Users\\PC\\kien-tap-code\\ANGULAR\\kien-tap-e2e\\practices\\testcases\\testcases_admin_accounts.csv';
let content = fs.readFileSync(csvPath, 'utf8');
let lines = content.split('\n');

const filteredLines = lines.filter(line => {
  if (!line.trim()) return false;
  // Chúng ta có thể kiểm tra xem dòng đó có chứa TXP_ADMIN_ACCOUNTS_TC_036, TC_037, TC_038 không
  const match = line.match(/"(TXP_ADMIN_ACCOUNTS_TC_\d+)"/);
  if (match) {
    const tcId = match[1];
    const num = parseInt(tcId.replace('TXP_ADMIN_ACCOUNTS_TC_', ''), 10);
    if (num >= 36 && num <= 38) {
      return false;
    }
  }
  return true;
});

fs.writeFileSync(csvPath, filteredLines.join('\n') + '\n', 'utf8');
console.log('Đã xoá các test case từ 36 đến 38 trong CSV!');
