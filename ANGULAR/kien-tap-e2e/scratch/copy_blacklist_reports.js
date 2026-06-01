const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'playwright-report');
const destDir = path.join(__dirname, '..', 'practices', 'reports', 'admin', 'testcases_admin_blacklist');

function copyFolderRecursiveSync(source, target) {
  let files = [];

  const targetFolder = target;
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      const curTarget = path.join(targetFolder, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
      }
    });
  }
}

try {
  copyFolderRecursiveSync(srcDir, destDir);
  console.log('Sao chép báo cáo HTML thành công!');
} catch (e) {
  console.error('Lỗi khi sao chép báo cáo:', e);
}
