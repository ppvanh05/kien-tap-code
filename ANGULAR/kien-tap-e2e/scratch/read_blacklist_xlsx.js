const XLSX = require('c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/scripts/convert_excel/node_modules/xlsx');
const path = require('path');

const xlsxPath = 'c:/Users/PC/kien-tap-code/ANGULAR/kien-tap-e2e/practices/testcases/testcases_admin_blacklist_v2 (1).xlsx';
const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(JSON.stringify(data, null, 2));
