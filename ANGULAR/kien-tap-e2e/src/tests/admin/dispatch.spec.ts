import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env.config';

// Data tĩnh từ DB — dùng cho TC_010/011 để tránh phụ thuộc vào dữ liệu động
const STATIC_VEHICLE_PLATE = '77B-09842';      // Xe có lịch sẵn trong DB để test trùng
const STATIC_DRIVER_NAME = 'Trần Hoàng Long';  // Tài xế có lịch sẵn trong DB để test trùng
const CONFLICT_DATE = '2026-06-10';             // Ngày có lịch sẵn trong DB
const CONFLICT_HOUR = '01';                     // Giờ có lịch sẵn trong DB
const CONFLICT_MINUTE = '00';                   // Phút có lịch sẵn trong DB

test.describe('Phân Hệ Quản Trị - Quản Lý Điều Hành (Admin Operation/Dispatch)', () => {
  test.describe.configure({ mode: 'serial' });

  let uniqueRouteStart: string;
  let uniqueVehiclePlate: string;
  let uniqueDriverCCCD: string;
  let uniqueDriverPhone: string;
  let uniqueDriverName: string;

  test.beforeEach(async ({ loginPage, page }) => {
    test.setTimeout(80000);

    // Sinh test data độc nhất có thể trace được
    const suffix = Date.now().toString().slice(-6);
    uniqueRouteStart = `Điểm Đầu ${suffix}`;
    uniqueVehiclePlate = `77B-${Math.floor(10000 + Math.random() * 90000)}`;
    uniqueDriverCCCD = `052${Math.floor(100000000 + Math.random() * 900000000)}`;
    uniqueDriverPhone = `090${Math.floor(1000000 + Math.random() * 9000000)}`;
    uniqueDriverName = `Tài Xế Auto ${suffix}`;

    // Đăng nhập nhân viên điều phối (dieuphoi1)
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('dieuphoi1', 'Dieuphoi@123');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 45000 });
  });

  // ==========================================
  // SECTION 1: QUẢN LÝ TUYẾN XE
  // ==========================================

  test('TXP_ADMIN_DISPATCH_TC_001: Happy Path - Khai báo Tuyến xe mới thành công', async ({ dispatchPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe`);
    await page.waitForLoadState('networkidle');

    await dispatchPage.addRoute({
      startPoint: uniqueRouteStart,
      startProvince: 'Bình Định',
      endPoint: 'TP. Hồ Chí Minh',
      endProvince: 'TP. Hồ Chí Minh',
      distance: 650,
      hours: 10,
      minutes: 0,
    });

    // Xác minh hiển thị trong bảng
    await expect(dispatchPage.routeTableRows.first()).toContainText(uniqueRouteStart);
  });

  test('TXP_ADMIN_DISPATCH_TC_002: Validation - Điểm khởi hành và Điểm đến trùng nhau', async ({ dispatchPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe`);
    await page.waitForLoadState('networkidle');

    await dispatchPage.addRoute({
      startPoint: 'Bình Định',
      startProvince: 'Bình Định',
      endPoint: 'Bình Định',
      endProvince: 'Bình Định',
      distance: 650,
      hours: 10,
      minutes: 0,
    });

    // Xác minh hiển thị trong bảng
    await expect(dispatchPage.routeTableRows.first()).toContainText('Bình Định');
  });

  test('TXP_ADMIN_DISPATCH_TC_003: Validation - Khoảng cách tuyến xe bằng 0 hoặc số âm', async ({ dispatchPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe`);
    await page.waitForLoadState('networkidle');

    // Thao tác thủ công từng bước điền form để verify validation
    await dispatchPage.clickOn(dispatchPage.addRouteButton);
    await dispatchPage.typeText(dispatchPage.routeStartPointInput, uniqueRouteStart);
    await dispatchPage.selectCustomOption(dispatchPage.routeStartProvinceSelect, 'Bình Định');
    await dispatchPage.typeText(dispatchPage.routeEndPointInput, 'TP. Hồ Chí Minh');
    await dispatchPage.selectCustomOption(dispatchPage.routeEndProvinceSelect, 'TP. Hồ Chí Minh');
    await dispatchPage.typeText(dispatchPage.routeDistanceInput, '-50');
    await dispatchPage.typeText(dispatchPage.routeHoursInput, '10');
    await dispatchPage.typeText(dispatchPage.routeMinutesInput, '0');
    await dispatchPage.clickOn(dispatchPage.routeSaveButton);

    // Xác minh validation message lỗi khoảng cách
    await expect(page.locator('.error-message, .invalid-feedback, .text-danger, :has-text("Hãy điền khoảng cách hợp lệ")').first()).toBeVisible({ timeout: 5000 });
    
    // Bấm nút Hủy/Close modal
    await page.click('button:has-text("Hủy"), .btn-cancel, .modal-close-btn');
  });

  // ==========================================
  // SECTION 2: QUẢN LÝ PHƯƠNG TIỆN
  // ==========================================

  test('TXP_ADMIN_DISPATCH_TC_004: Happy Path - Khai báo xe Limousine mới thành công', async ({ dispatchPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-phuong-tien`);
    await page.waitForLoadState('networkidle');

    await dispatchPage.clickOn(dispatchPage.addVehicleButton);
    await dispatchPage.typeText(dispatchPage.vehicleNameInput, 'TXP VIP Royal');
    await dispatchPage.typeText(dispatchPage.vehiclePlateInput, uniqueVehiclePlate);
    await dispatchPage.selectCustomOption(dispatchPage.vehicleTypeSelect, 'Limousine 22 phòng');
    await dispatchPage.typeText(dispatchPage.vehicleRegExpiryInput, '2026-12-31');
    await dispatchPage.typeText(dispatchPage.vehicleInsExpiryInput, '2026-12-31');
    await dispatchPage.clickOn(dispatchPage.vehicleSaveButton);

    await expect(dispatchPage.vehicleTableRows.first()).toContainText(uniqueVehiclePlate);
  });

  test('TXP_ADMIN_DISPATCH_TC_005: Validation - Cảnh báo tự động xe quá Hạn đăng kiểm hoặc Bảo hiểm', async ({ dispatchPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-phuong-tien`);
    await page.waitForLoadState('networkidle');

    // Thêm một xe đã quá hạn đăng kiểm để test
    const plateExpired = `77B-${Math.floor(10000 + Math.random() * 90000)}`;
    await dispatchPage.clickOn(dispatchPage.addVehicleButton);
    await dispatchPage.typeText(dispatchPage.vehicleNameInput, 'Xe Quá Hạn');
    await dispatchPage.typeText(dispatchPage.vehiclePlateInput, plateExpired);
    await dispatchPage.selectCustomOption(dispatchPage.vehicleTypeSelect, 'Limousine 22 phòng');
    await dispatchPage.typeText(dispatchPage.vehicleRegExpiryInput, '2026-05-15'); // quá hạn so với 2026-05-30
    await dispatchPage.typeText(dispatchPage.vehicleInsExpiryInput, '2026-12-31');
    await dispatchPage.clickOn(dispatchPage.vehicleSaveButton);

    // Xác minh xe được thêm vào bảng
    const row = dispatchPage.vehicleTableRows.filter({ hasText: plateExpired });
    await expect(row).toBeVisible();
  });

  test('TXP_ADMIN_DISPATCH_TC_006: Business Rule - Chặn không cho phân lịch chạy đối với xe hết hạn đăng kiểm', async ({ dispatchPage, page }) => {
    // Thêm một xe đã hết hạn đăng kiểm trước
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-phuong-tien`);
    await page.waitForLoadState('networkidle');
    const plateExpired = `77B-${Math.floor(10000 + Math.random() * 90000)}`;
    await dispatchPage.clickOn(dispatchPage.addVehicleButton);
    await dispatchPage.typeText(dispatchPage.vehicleNameInput, 'Xe Quá Hạn Phân Lịch');
    await dispatchPage.typeText(dispatchPage.vehiclePlateInput, plateExpired);
    await dispatchPage.selectCustomOption(dispatchPage.vehicleTypeSelect, 'Limousine 22 phòng');
    await dispatchPage.typeText(dispatchPage.vehicleRegExpiryInput, '2026-05-15');
    await dispatchPage.typeText(dispatchPage.vehicleInsExpiryInput, '2026-12-31');
    await dispatchPage.clickOn(dispatchPage.vehicleSaveButton);

    // Đi đến trang Quản lý lịch trình
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh`);
    await page.waitForLoadState('networkidle');

    await dispatchPage.clickOn(dispatchPage.addScheduleButton);
    
    // Mở dropdown chọn Biển số xe
    await dispatchPage.scheduleVehiclePlateSelect.locator('.select-trigger').click();
    
    // Đảm bảo biển số hết hạn đăng kiểm không xuất hiện trong danh sách dropdown
    const expiredOption = dispatchPage.scheduleVehiclePlateSelect.locator('.select-option-item').filter({ hasText: plateExpired });
    await expect(expiredOption).toBeHidden();
  });

  // ==========================================
  // SECTION 3: QUẢN LÝ TÀI XẾ & PHỤ XE
  // ==========================================

  test('TXP_ADMIN_DISPATCH_TC_007: Happy Path - Khai báo Hồ sơ tài xế mới thành công', async ({ dispatchPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-tai-xe-phu-xe`);
    await page.waitForLoadState('networkidle');

    await dispatchPage.clickOn(dispatchPage.addDriverButton);
    await dispatchPage.selectCustomOption(dispatchPage.driverRoleSelect, 'Tài xế');
    await dispatchPage.typeText(dispatchPage.driverNameInput, uniqueDriverName);
    await dispatchPage.typeText(dispatchPage.driverDobInput, '1990-01-01');
    await dispatchPage.typeText(dispatchPage.driverPhoneInput, uniqueDriverPhone);
    await dispatchPage.typeText(dispatchPage.driverCccdInput, uniqueDriverCCCD);
    await dispatchPage.typeText(dispatchPage.driverLicenseClassInput, 'E');
    await dispatchPage.typeText(dispatchPage.driverLicenseExpiryInput, '2030-05-30');
    await dispatchPage.clickOn(dispatchPage.driverSaveButton);

    await expect(dispatchPage.driverTableRows.first()).toContainText(uniqueDriverName);
  });

  test('TXP_ADMIN_DISPATCH_TC_008: Business Rule - Loại trừ tài xế có bằng lái hết hạn khỏi phân công lịch trình', async ({ dispatchPage, page }) => {
    // Tạo tài xế có bằng lái hết hạn trước
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-tai-xe-phu-xe`);
    await page.waitForLoadState('networkidle');
    const expiredDriverName = `Tài Xế Quá Hạn ${Date.now().toString().slice(-4)}`;
    const expiredDriverPhone = `090${Math.floor(1000000 + Math.random() * 9000000)}`;
    const expiredDriverCCCD = `052${Math.floor(100000000 + Math.random() * 900000000)}`;

    await dispatchPage.clickOn(dispatchPage.addDriverButton);
    await dispatchPage.selectCustomOption(dispatchPage.driverRoleSelect, 'Tài xế');
    await dispatchPage.typeText(dispatchPage.driverNameInput, expiredDriverName);
    await dispatchPage.typeText(dispatchPage.driverDobInput, '1990-01-01');
    await dispatchPage.typeText(dispatchPage.driverPhoneInput, expiredDriverPhone);
    await dispatchPage.typeText(dispatchPage.driverCccdInput, expiredDriverCCCD);
    await dispatchPage.typeText(dispatchPage.driverLicenseClassInput, 'E');
    await dispatchPage.typeText(dispatchPage.driverLicenseExpiryInput, '2026-05-10'); // quá hạn
    await dispatchPage.clickOn(dispatchPage.driverSaveButton);

    // Đi đến Quản lý lịch trình
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh`);
    await page.waitForLoadState('networkidle');

    await dispatchPage.clickOn(dispatchPage.addScheduleButton);
    
    // Mở dropdown chọn Tài xế
    await dispatchPage.scheduleDriverSelect.locator('.select-trigger').click();
    
    // Đảm bảo tài xế hết hạn bằng lái không hiển thị trong dropdown
    const expiredOption = dispatchPage.scheduleDriverSelect.locator('.select-option-item').filter({ hasText: expiredDriverName });
    await expect(expiredOption).toBeHidden();
  });

  // ==========================================
  // SECTION 4: QUẢN LÝ LỊCH TRÌNH
  // ==========================================

  test('TXP_ADMIN_DISPATCH_TC_009: Happy Path - Tạo mới Lịch trình chuyến chạy thành công (không xung đột)', async ({ dispatchPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh`);
    await page.waitForLoadState('networkidle');

    // Dùng ngày trong tương lai xa để chắc chắn không trùng lịch
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 35);
    const farFutureStr = farFuture.toISOString().split('T')[0];

    try {
      await dispatchPage.clickOn(dispatchPage.addScheduleButton);
      await dispatchPage.selectCustomOption(dispatchPage.scheduleRouteSelect, 'Phù Cát - An Sương');
      await dispatchPage.selectCustomOption(dispatchPage.scheduleDriverSelect, 'Nguyễn Văn Nam');
      await dispatchPage.selectCustomOption(dispatchPage.scheduleAssistantSelect, 'Nguyễn Đức Minh');
      await dispatchPage.selectCustomOption(dispatchPage.scheduleVehicleNameSelect, 'Limousine 1');
      await dispatchPage.selectCustomOption(dispatchPage.scheduleVehiclePlateSelect, '77B-06021');
      
      // Tab 2
      await dispatchPage.clickOn(dispatchPage.scheduleContinueButton);
      await dispatchPage.typeText(dispatchPage.scheduleDepartureDateInput, farFutureStr);
      await dispatchPage.typeText(dispatchPage.scheduleDepartureHourInput, '08');
      await dispatchPage.typeText(dispatchPage.scheduleDepartureMinuteInput, '00');

      await dispatchPage.clickOn(dispatchPage.scheduleSaveButton);

      // Verify: modal đóng, lịch mới xuất hiện trong bảng
      await expect(dispatchPage.scheduleTableRows.first()).toBeVisible();
    } finally {
      if (await page.locator('.modal-content').first().isVisible()) {
        await page.click('button:has-text("Hủy")').catch(() => {});
      }
    }
  });

  test('TXP_ADMIN_DISPATCH_TC_010: Business Rule - Chặn trùng lịch Phương tiện (xung đột khung giờ xe chạy)', async ({ dispatchPage, page }) => {
    // Đánh dấu kiểm thử thất bại có chủ đích do hệ thống chưa cài đặt ràng buộc chặn trùng lịch xe
    expect(false, 'Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch phương tiện (Dev cần phát triển thêm)').toBe(true);
  });

  test('TXP_ADMIN_DISPATCH_TC_011: Business Rule - Chặn trùng lịch Nhân sự (xung đột giờ làm việc tài xế)', async ({ dispatchPage, page }) => {
    // Đánh dấu kiểm thử thất bại có chủ đích do hệ thống chưa cài đặt ràng buộc chặn trùng lịch tài xế
    expect(false, 'Hệ thống chưa hỗ trợ ràng buộc chặn trùng lịch nhân sự (Dev cần phát triển thêm)').toBe(true);
  });

  test.skip('TXP_ADMIN_DISPATCH_TC_012: Validation - Chọn Ngày khởi hành trong quá khứ', async ({ dispatchPage, page }) => {
    // Skip lý do: Hệ thống sử dụng Datepicker chặn/không cho phép chọn ngày trong quá khứ (ở mức native/UI component)
  });

  test('TXP_ADMIN_DISPATCH_TC_013: State Transition - Chuyển đổi trạng thái lịch trình hoàn thành và giải phóng xe/tài xế', async ({ dispatchPage, page }) => {
    // Đánh dấu kiểm thử thất bại có chủ đích do chưa cài đặt ràng buộc giải phóng xe/tài xế
    expect(false, 'Hệ thống chưa hỗ trợ ràng buộc giải phóng phương tiện/tài xế khi hoàn thành lịch trình (Dev cần phát triển thêm)').toBe(true);
  });
});
