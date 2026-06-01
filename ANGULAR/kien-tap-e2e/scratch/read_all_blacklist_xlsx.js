const XLSX = require('c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/scripts/convert_excel/node_modules/xlsx');
const fs = require('fs');
const path = require('path');

const xlsxPath = 'c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/practices/testcases/testcases_admin_blacklist_v2 (1).xlsx';
const destJson = 'c:/Users/PC/.gemini/antigravity-ide/brain/7f44394b-3dcf-46a5-b82a-495d84d21e50/scratch/blacklist_cases.json';

const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

fs.writeFileSync(destJson, JSON.stringify(data, null, 2), 'utf8');
console.log('Đã xuất toàn bộ dữ liệu ra JSON!');
