const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../playwright-report');
const destDir = path.join(__dirname, '../practices/reports/customer/testcases_customer_booking_payment');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    } else {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    }
  });
}

if (fs.existsSync(srcDir)) {
  copyFolderSync(srcDir, destDir);
  console.log('Copy báo cáo thành công vào ' + destDir);
} else {
  console.log('Không tìm thấy thư mục báo cáo ' + srcDir);
}
