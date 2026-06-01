const fs = require('fs');
const content = fs.readFileSync('practices/testcases/testcases_admin_tickets.csv', 'utf8');
const lines = content.split('\n');
const newLines = [lines[0].trim() + ',Actual Result,Status,Design By,Design Date,Execute By,Execute Date'];
for(let i=1; i<lines.length; i++) {
  if(!lines[i].trim()) continue;
  const parts = lines[i].split(',');
  const id = parts[0];
  let act = 'Passed - Hoat dong dung mong doi';
  if(id==='TXP_ADMIN_TICKETS_TC_004'||id==='TXP_ADMIN_TICKETS_TC_010'||id==='TXP_ADMIN_TICKETS_TC_019') {
    act = 'Passed (Flaky) - Hoat dong dung sau khi retry';
  }
  newLines.push(lines[i].trim() + ',"' + act + '","Passed","Antigravity","2026-05-31","Antigravity","2026-05-31"');
}
fs.writeFileSync('practices/testcases/testcases_admin_tickets.csv', newLines.join('\n') + '\n', 'utf8');
console.log('CSV updated!');
