const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'practices', 'testcases', 'testcases_admin_dispatch.csv');

// Dữ liệu CSV gốc được trích xuất từ lịch sử của phiên làm việc
const originalCSVData = [
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_001',
    scenario: 'Happy Path - Khai báo Tuyến xe mới thành công',
    preCondition: 'Có quyền điều hành. Đang ở trang khai báo tuyến xe.',
    steps: '1. Chọn Điểm khởi hành: "Bình Định"\n2. Chọn Điểm đến: "TP. Hồ Chí Minh"\n3. Nhập Khoảng cách: "650"\n4. Nhập Thời gian di chuyển dự kiến: "10:00"\n5. Click "Lưu tuyến xe"',
    data: 'Khởi hành: "Bình Định" | Điểm đến: "TP. Hồ Chí Minh" | Khoảng cách: 650 | Thời gian: "10:00"',
    expected: 'Lưu thành công. Tuyến xe mới hiển thị trong DB và xuất hiện trong danh sách Tuyến xe đang hoạt động.',
    priority: 'High',
    risk: 'Medium',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_002',
    scenario: 'Validation - Điểm khởi hành và Điểm đến trùng nhau',
    preCondition: 'Đang thêm tuyến xe mới.',
    steps: '1. Chọn Điểm khởi hành: "Bình Định"\n2. Chọn Điểm đến: "Bình Định"\n3. Click "Lưu tuyến xe"',
    data: 'Khởi hành: "Bình Định" | Điểm đến: "Bình Định"',
    expected: 'Hệ thống báo lỗi validation: "Điểm khởi hành và Điểm đến không được trùng nhau" và chặn không cho lưu.',
    priority: 'High',
    risk: 'Medium',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_003',
    scenario: 'Validation - Khoảng cách tuyến xe bằng 0 hoặc số âm',
    preCondition: 'Đang thêm tuyến xe mới.',
    steps: '1. Nhập Khoảng cách: "-50"\n2. Click "Lưu tuyến xe"',
    data: 'Khoảng cách: -50',
    expected: 'Báo lỗi validation: "Khoảng cách phải là số dương lớn hơn 0" và chặn lưu.',
    priority: 'High',
    risk: 'Medium',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_004',
    scenario: 'Happy Path - Khai báo xe Limousine mới thành công',
    preCondition: 'Đang ở màn hình quản lý phương tiện.',
    steps: '1. Nhập Biển số xe: "77B-012.34"\n2. Nhập Tên xe: "TXP VIP Royal"\n3. Chọn Loại xe: "Limousine 22 phòng"\n4. Chọn Hạn đăng kiểm: "31/12/2026"\n5. Chọn Hạn bảo hiểm: "31/12/2026"\n6. Click "Lưu"',
    data: 'Biển số: "77B-012.34" | Loại: "Limousine 22 phòng"',
    expected: 'Khai báo phương tiện thành công, xe hiển thị trong danh sách xe đang hoạt động.',
    priority: 'High',
    risk: 'High',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_005',
    scenario: 'Validation - Cảnh báo tự động xe quá Hạn đăng kiểm hoặc Bảo hiểm',
    preCondition: 'Có xe 77B-001.02 trong hệ thống có hạn đăng kiểm là 15/05/2026 (quá hạn so với hiện tại).',
    steps: '1. Truy cập danh sách phương tiện\n2. Tìm xe 77B-001.02 và kiểm tra cảnh báo',
    data: 'N/A',
    expected: 'Hệ thống hiển thị icon cảnh báo đỏ hoặc thông báo trạng thái: "Hết hạn đăng kiểm" tại dòng của xe này.',
    priority: 'High',
    risk: 'High',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_006',
    scenario: 'Business Rule - Chặn không cho phân lịch chạy đối với xe hết hạn đăng kiểm',
    preCondition: 'Xe 77B-001.02 đã hết hạn đăng kiểm. Điều phối viên thực hiện thêm lịch trình chuyến chạy.',
    steps: '1. Vào màn hình Thêm lịch trình mới\n2. Mở Dropdown chọn Phương tiện\n3. Tìm kiếm xe 77B-001.02',
    data: 'N/A',
    expected: 'Xe 77B-001.02 bị loại bỏ/ẩn khỏi danh sách lựa chọn xe khả dụng, hoặc backend trả lỗi nếu cố tình gán: "Thời hạn đăng kiểm của xe đã hết hạn".',
    priority: 'High',
    risk: 'High',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_007',
    scenario: 'Happy Path - Khai báo Hồ sơ tài xế mới thành công',
    preCondition: 'Đang ở màn hình quản lý tài xế.',
    steps: '1. Nhập Họ tên: "Lê Văn Tám"\n2. Nhập CCCD: "052098001234", SĐT: "0905123456"\n3. Chọn Hạng bằng lái: "Hạng E", Hạn bằng lái: "30/05/2030" (còn hạn)\n4. Tải lên ảnh chân dung, ảnh bằng lái\n5. Click "Lưu"',
    data: 'Bằng lái: "Hạng E" | Hạn bằng: "30/05/2030"',
    expected: 'Khai báo thành công hồ sơ tài xế mới và lưu vào cơ sở dữ liệu.',
    priority: 'High',
    risk: 'High',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_008',
    scenario: 'Business Rule - Loại trừ tài xế có bằng lái hết hạn khỏi phân công lịch trình',
    preCondition: 'Tài xế Nguyễn Văn B có bằng lái hết hạn ngày 10/05/2026 (quá hạn so với hiện tại).',
    steps: '1. Into màn hình Thêm lịch trình mới\n2. Mở dropdown chọn Tài xế chính\n3. Tìm tài xế Nguyễn Văn B',
    data: 'N/A',
    expected: 'Tài xế Nguyễn Văn B bị loại trừ/không hiển thị trong danh sách tài xế khả dụng gán cho lịch trình chuyến chạy.',
    priority: 'High',
    risk: 'High',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_009',
    scenario: 'Happy Path - Tạo mới Lịch trình chuyến chạy thành công (không xung đột)',
    preCondition: 'Tuyến xe Bình Định - Sài Gòn đã được cấu hình. Xe 77B-012.34 và tài xế Lê Văn Tám rảnh lịch.',
    steps: '1. Chọn Tuyến xe: "Bình Định - TP. Hồ Chí Minh"\n2. Chọn Ngày khởi hành: ngày mai\n3. Nhập Giờ khởi hành: "19:00", Giờ đến dự kiến: "05:00" sáng hôm sau\n4. Chọn xe: "77B-012.34"\n5. Chọn tài xế: "Lê Văn Tám"\n6. Nhập Giá vé cơ bản: "350000"\n7. Click "Lưu lịch trình"',
    data: 'Tuyến: "Bình Định - TP. Hồ Chí Minh" | Xe: "77B-012.34" | Tài xế: "Lê Văn Tám"',
    expected: 'Tạo lịch trình thành công, trạng thái chuyến đi chuyển sang "ChoKhoiHanh".',
    priority: 'High',
    risk: 'High',
    status: 'Passed',
    actual: 'Thực hiện thành công khớp với mong đợi.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_010',
    scenario: 'Business Rule - Chặn trùng lịch Phương tiện (xung đột khung giờ xe chạy)',
    preCondition: 'Xe 77B-012.34 đã được gán cho Lịch trình A (19:00 ngày 31/05 đến 05:00 ngày 01/06).',
    steps: '1. Tạo Lịch trình B chạy từ 20:00 ngày 31/05 đến 06:00 ngày 01/06\n2. Cố tình chọn xe: "77B-012.34"\n3. Click "Lưu lịch trình"',
    data: 'Phương tiện: "77B-012.34"',
    expected: 'Chặn lưu thành công. Backend hiển thị lỗi: "Phương tiện này đã được gán cho một chuyến xe khác trong khung giờ này".',
    priority: 'High',
    risk: 'High',
    status: 'Failed',
    actual: 'Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch phương tiện (lịch trình mới vẫn được lưu thành công).'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_011',
    scenario: 'Business Rule - Chặn trùng lịch Nhân sự (xung đột giờ làm việc tài xế)',
    preCondition: 'Tài xế Lê Văn Tám đã được phân công chạy Lịch trình A (19:00 ngày 31/05 đến 05:00 ngày 01/06).',
    steps: '1. Tạo Lịch trình B chạy từ 20:00 ngày 31/05 đến 06:00 ngày 01/06\n2. Cố tình chọn Tài xế chính: "Lê Văn Tám"\n3. Click "Lưu lịch trình"',
    data: 'Tài xế: "Lê Văn Tám"',
    expected: 'Chặn lưu thành công. Backend hiển thị lỗi: "Tài xế đã có lịch làm việc trùng với khung giờ di chuyển".',
    priority: 'High',
    risk: 'High',
    status: 'Failed',
    actual: 'Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch nhân sự (lịch trình mới vẫn được lưu thành công).'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_012',
    scenario: 'Validation - Chọn Ngày khởi hành trong quá khứ',
    preCondition: 'Đang ở màn hình thêm lịch trình mới.',
    steps: '1. Chọn Ngày khởi hành là hôm qua\n2. Điền các trường hợp lệ khác\n3. Click "Lưu lịch trình"',
    data: 'Ngày khởi hành: Hôm qua',
    expected: 'Hệ thống báo lỗi validation: "Ngày khởi hành phải lớn hơn hoặc bằng ngày hiện tại" và chặn lưu.',
    priority: 'High',
    risk: 'Medium',
    status: 'Skip',
    actual: 'Hệ thống sử dụng Datepicker chặn/không cho phép chọn ngày trong quá khứ trực tiếp từ UI component.'
  },
  {
    oldId: 'TXP_ADMIN_DISPATCH_TC_015',
    scenario: 'State Transition - Chuyển đổi trạng thái lịch trình hoàn thành và giải phóng xe/tài xế',
    preCondition: 'Chuyến xe đang ở trạng thái Đang chạy.',
    steps: '1. Sau khi chuyến xe cập bến thực tế\n2. Cập nhật trạng thái lịch trình chuyến chạy sang "Hoàn thành"',
    data: 'N/A',
    expected: 'Trạng thái chuyển sang Hoàn thành thành công. Phương tiện và tài xế được giải phóng về trạng thái rảnh để gán lịch chuyến mới.',
    priority: 'High',
    risk: 'Medium',
    status: 'Failed',
    actual: 'Hệ thống chưa thiết lập ràng buộc tự động giải phóng phương tiện/tài xế khi cập nhật trạng thái Hoàn thành.'
  }
];

const header = [
  'TC ID', 'Module', 'Risk Level', 'Test Scenario', 'Pre-Condition', 
  'Test Steps', 'Test Data', 'Expected Result', 'Priority',
  'Actual Result', 'Status', 'Design By', 'Design Date', 'Execute By', 'Execute Date'
];

const rows = [header];

originalCSVData.forEach((item, index) => {
  const formattedCounter = String(index + 1).padStart(3, '0');
  const newId = `TXP_ADMIN_DISPATCH_TC_${formattedCounter}`;
  
  const row = [
    newId,
    'Quản lý Điều hành',
    item.risk,
    item.scenario,
    item.preCondition,
    item.steps,
    item.data,
    item.expected,
    item.priority,
    item.actual,
    item.status,
    'Antigravity',
    '2026-05-31',
    'Antigravity',
    '2026-05-31'
  ];
  rows.push(row);
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

fs.writeFileSync(csvPath, toCSVString(rows), 'utf8');
console.log('Khôi phục và cập nhật file CSV thành công!');
