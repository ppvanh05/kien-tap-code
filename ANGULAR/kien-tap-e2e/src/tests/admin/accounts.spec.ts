import { test, expect } from '../../fixtures/base.fixture';
import { TestDataGenerator } from '../../utils/test-data';
import { ENV } from '../../utils/env.config';

test.describe('Phân Hệ Quản Trị - Quản Lý Tài Khoản Nhân Viên & Khách Hàng (Accounts)', () => {
  // Cấu hình chạy tuần tự các test case để tránh xung đột session khi đăng nhập chung tài khoản admin1
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ loginPage, page }) => {
    test.setTimeout(80000);
    // 1. Đăng nhập với tư cách quản trị viên admin1
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
  });

  // =========================================================================
  // KHÁCH HÀNG (CUSTOMER ACCOUNTS - TC_001 -> TC_011)
  // =========================================================================

  test('TXP_ADMIN_ACCOUNTS_TC_001: Happy Path - Tìm kiếm khách hàng theo Số điện thoại', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');
    
    // Nhảy tab kích hoạt dữ liệu load do Angular load chậm
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(1500);

    // Lấy SĐT của khách hàng đầu tiên trên tab Đang hoạt động để tìm kiếm động
    const firstRow = accountsPage.accountsTableRows.first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const phoneCell = firstRow.locator('td').nth(2);
    const actualPhone = (await phoneCell.innerText()).trim();

    await accountsPage.searchAccount(actualPhone);
    await expect(accountsPage.accountsTableRows.first()).toContainText(actualPhone);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_002: Happy Path - Tìm kiếm khách hàng theo Họ tên', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');
    
    // Nhảy tab kích hoạt dữ liệu load do Angular load chậm
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(1500);

    // Lấy tên khách hàng đầu tiên - innerText trả về "VK\nPhan Văn Khoa", cần lấy phần sau newline
    const firstRow = accountsPage.accountsTableRows.first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const nameCell = firstRow.locator('td').nth(1);
    const rawName = (await nameCell.innerText()).trim();
    // Bỏ phần avatar abbreviation (2-3 ký tự in hoa đầu dòng, ví dụ "VK\n")
    const actualName = rawName.includes('\n') ? rawName.split('\n').slice(1).join(' ').trim() : rawName;

    await accountsPage.searchAccount(actualName);
    await expect(accountsPage.accountsTableRows.first()).toContainText(actualName);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_003: Happy Path - Lọc khách hàng theo Tab Trạng thái hoạt động và khóa', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');
    
    // Nhảy tab kích hoạt dữ liệu load do Angular load chậm
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(1000);

    await expect(accountsPage.accountsTableRows.first()).toContainText('Đang hoạt động');

    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const rowCount = await accountsPage.accountsTableRows.count();
    if (rowCount > 0 && !await accountsPage.emptyRowState.isVisible()) {
      await expect(accountsPage.accountsTableRows.first()).toContainText('Đã khóa');
    }
  });

  test('TXP_ADMIN_ACCOUNTS_TC_004: Happy Path - Khóa tài khoản khách hàng thành công và bắt buộc nhập lý do', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');

    // Nhảy tab kích hoạt dữ liệu load do Angular load chậm
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(1000);

    const rowsCount = await accountsPage.accountsTableRows.count();
    if (rowsCount === 0 || await accountsPage.emptyRowState.isVisible()) {
      return;
    }

    const customerRow = accountsPage.accountsTableRows.first();
    const customerId = await customerRow.locator('td').nth(0).innerText();
    const cleanCustomerId = customerId.replace(/\n/g, '').replace(/check_circle|block/g, '').trim();

    await accountsPage.clickOn(customerRow.locator('.btn-action-view'));
    const customerDetailModal = page.locator('.modal-content.customer-detail-modal');
    await accountsPage.waitForVisible(customerDetailModal);

    const lockBtn = customerDetailModal.locator('.modal-footer-sticky .btn-outline-danger');
    await accountsPage.clickOn(lockBtn);

    await accountsPage.waitForVisible(accountsPage.lockCustomerModalOverlay);
    const reason = 'Khách hàng spam đặt vé ảo auto test';
    await accountsPage.typeText(accountsPage.lockReasonTextArea, reason);
    await accountsPage.clickOn(accountsPage.confirmLockCustomerButton);

    await accountsPage.waitForHidden(accountsPage.lockCustomerModalOverlay);
    await accountsPage.dismissAlertIfVisible();

    const closeBtn = customerDetailModal.locator('.btn-close').first();
    await accountsPage.clickOn(closeBtn);
    await accountsPage.waitForHidden(customerDetailModal);

    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForLoadState('networkidle');
    await accountsPage.searchAccount(cleanCustomerId);
    await expect(accountsPage.accountsTableRows.first()).toContainText(cleanCustomerId);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_005: Validation - Khóa tài khoản khách hàng nhưng để trống lý do khóa', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');

    // Nhảy tab kích hoạt dữ liệu load do Angular load chậm
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(1000);

    const customerRow = accountsPage.accountsTableRows.first();
    await accountsPage.clickOn(customerRow.locator('.btn-action-view'));

    const customerDetailModal = page.locator('.modal-content.customer-detail-modal');
    await accountsPage.waitForVisible(customerDetailModal);

    const lockBtn = customerDetailModal.locator('.modal-footer-sticky .btn-outline-danger');
    await accountsPage.clickOn(lockBtn);

    await accountsPage.waitForVisible(accountsPage.lockCustomerModalOverlay);
    
    // Để trống textarea (không nhập gì)
    await accountsPage.lockReasonTextArea.fill('');

    // Click Khóa tài khoản khi lý do để trống
    await accountsPage.clickOn(accountsPage.confirmLockCustomerButton);

    // Hệ thống hiện custom alert "Yêu cầu lý do" thay vì disable button
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertTitle = await accountsPage.getTextOf(accountsPage.alertTitle);
    expect(alertTitle).toContain('Yêu cầu lý do');
    const alertMsg = await accountsPage.getTextOf(accountsPage.alertMessage);
    expect(alertMsg).toContain('Vui lòng nhập lý do');

    // Đóng alert và hủy thao tác khóa
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.cancelLockCustomerButton);
    await accountsPage.waitForHidden(accountsPage.lockCustomerModalOverlay);
    
    const closeBtn = customerDetailModal.locator('.btn-close').first();
    await accountsPage.clickOn(closeBtn);
    await accountsPage.waitForHidden(customerDetailModal);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_006: Happy Path - Mở khóa tài khoản khách hàng thành công', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');

    // Nhảy tab kích hoạt dữ liệu load do Angular load chậm
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(1500);

    const rowsCount = await accountsPage.accountsTableRows.count();
    if (rowsCount === 0 || await accountsPage.emptyRowState.isVisible()) {
      return; // Skip nếu không có khách hàng nào bị khóa
    }

    const customerRow = accountsPage.accountsTableRows.first();
    // Lấy phone number (td.nth(2)) để search sau unlock - unique hơn KH ID
    const phoneText = (await customerRow.locator('td').nth(2).innerText()).trim();

    await accountsPage.clickOn(customerRow.locator('.btn-action-view'));

    const customerDetailModal = page.locator('.modal-content.customer-detail-modal');
    await accountsPage.waitForVisible(customerDetailModal);

    // Button Mở khóa: success hoặc text Mở khóa trong footer
    const unlockBtn = customerDetailModal.locator('.modal-footer-sticky').locator('button').filter({
      hasText: /Mở khóa/
    });
    const unlockBtnAlt = customerDetailModal.locator('.modal-footer-sticky .btn-outline-success');
    
    if (await unlockBtn.count() > 0) {
      await accountsPage.clickOn(unlockBtn.first());
    } else if (await unlockBtnAlt.count() > 0) {
      await accountsPage.clickOn(unlockBtnAlt.first());
    }

    // Chờ alert thành công
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertMsg = await accountsPage.getTextOf(accountsPage.alertMessage);
    expect(alertMsg).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();

    const closeBtn = customerDetailModal.locator('.btn-close').first();
    await accountsPage.clickOn(closeBtn);
    await accountsPage.waitForHidden(customerDetailModal);

    // Search bằng phone number (unique) trên tab Active để verify unlock thành công
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await accountsPage.searchAccount(phoneText);
    await expect(accountsPage.accountsTableRows.first()).toContainText(phoneText);
  });


  test('TXP_ADMIN_ACCOUNTS_TC_007: Alternate Path - Tìm kiếm khách hàng không tồn tại', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');
    await accountsPage.searchAccount('KH_999999_NOT_EXIST');
    
    // Web bị lag, click chuyển tab qua lại để trigger update kết quả tìm kiếm
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabAll);
    await page.waitForTimeout(1000);
    
    await expect(accountsPage.emptyRowState.first()).toBeVisible({ timeout: 5000 });
  });

  test('TXP_ADMIN_ACCOUNTS_TC_008: Happy Path - Thêm mới khách hàng thành công với đầy đủ thông tin', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddCustomerModal();

    const uniquePhone = TestDataGenerator.generatePhoneNumber();
    const uniqueEmail = `auto_customer_${Date.now()}@test.com`;
    const customerData = {
      fullName: 'Đỗ Hoàng Nam',
      phone: uniquePhone,
      email: uniqueEmail,
      gender: 'Nam' as const,
      dob: '1995-08-15'
    };

    await accountsPage.fillCustomerInfo(customerData);
    await accountsPage.saveCustomer();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertMsg = await accountsPage.getTextOf(accountsPage.alertMessage);
    expect(alertMsg).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();

    await accountsPage.searchAccount(uniquePhone);
    await expect(accountsPage.accountsTableRows.first()).toContainText('Đỗ Hoàng Nam');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_009: Validation - Thêm mới khách hàng bỏ trống các trường bắt buộc', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddCustomerModal();

    await accountsPage.customerNameInput.fill('');
    await accountsPage.customerPhoneInput.fill('');
    await accountsPage.customerEmailInput.fill('test_valid@gmail.com');

    // Click Tạo tài khoản khi để trống trường bắt buộc
    await accountsPage.saveCustomer();

    // Hệ thống sẽ hiện custom alert cảnh báo "Lỗi biểu mẫu"
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertTitle = await accountsPage.getTextOf(accountsPage.alertTitle);
    expect(alertTitle).toContain('Lỗi biểu mẫu');
    const alertMsg = await accountsPage.getTextOf(accountsPage.alertMessage);
    expect(alertMsg).toContain('Vui lòng kiểm tra lại');
    await accountsPage.dismissAlertIfVisible();

    await accountsPage.clickOn(accountsPage.customerCloseButton);
    await accountsPage.waitForHidden(accountsPage.customerModalOverlay);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_010: Happy Path - Chỉnh sửa thông tin hồ sơ khách hàng thành công', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');

    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(1000);

    const row = accountsPage.accountsTableRows.first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));

    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    const updatedName = 'Đỗ Hoàng Nam Cập Nhật';
    const updatedPhone = TestDataGenerator.generatePhoneNumber();

    await accountsPage.customerNameInput.fill(updatedName);
    await accountsPage.customerPhoneInput.fill(updatedPhone);

    await accountsPage.saveCustomer();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertMsg = await accountsPage.getTextOf(accountsPage.alertMessage);
    expect(alertMsg).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();

    await accountsPage.waitForHidden(accountsPage.customerModalOverlay);

    await accountsPage.searchAccount(updatedPhone);
    await expect(accountsPage.accountsTableRows.first()).toContainText(updatedName);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_011: Validation - Chỉnh sửa khách hàng nhưng để trống Họ tên bắt buộc', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-khach-hang`);
    await page.waitForLoadState('networkidle');

    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(1000);

    const row = accountsPage.accountsTableRows.first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));

    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    await accountsPage.customerNameInput.fill('');
    await accountsPage.customerPhoneInput.focus();

    // Click Lưu thay đổi khi để trống họ tên bắt buộc
    await accountsPage.saveCustomer();

    // Hệ thống sẽ hiện custom alert cảnh báo "Lỗi biểu mẫu"
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertTitle = await accountsPage.getTextOf(accountsPage.alertTitle);
    expect(alertTitle).toContain('Lỗi biểu mẫu');
    await accountsPage.dismissAlertIfVisible();

    await accountsPage.clickOn(accountsPage.customerCloseButton);
    await accountsPage.waitForHidden(accountsPage.customerModalOverlay);
  });

  // =========================================================================
  // NHÂN VIÊN (EMPLOYEE ACCOUNTS - TC_012 -> TC_026)
  // =========================================================================

  test('TXP_ADMIN_ACCOUNTS_TC_012: Happy Path - Thêm mới Nhân viên với đầy đủ thông tin hợp lệ', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();

    const timestamp = Date.now();
    const username = `banve_${timestamp}`;
    const hoVaTenDem = 'Trần Văn';
    const ten = `Anh ${timestamp.toString().slice(-4)}`;
    const tenHienThi = `${hoVaTenDem} ${ten}`;
    const matKhau = 'SecurePass123';

    await accountsPage.fillBasicInfo({
      username,
      matKhau,
      hoVaTenDem,
      ten,
      tenHienThi,
      defaultRole: 'BanVe',
      gioiTinh: 'Nam'
    });

    await accountsPage.selectPermissionPreset('cskh');

    const sdt = TestDataGenerator.generatePhoneNumber();
    const email = `${username}@txpbus.vn`;
    await accountsPage.fillContactInfo({
      sdt,
      email,
      diaChi: '123 Đường Láng, Hà Nội'
    });

    await accountsPage.saveAccount();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertMsg = await accountsPage.getTextOf(accountsPage.alertMessage);
    expect(alertMsg).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();

    await accountsPage.searchAccount(username);
    await expect(accountsPage.accountsTableRows.first()).toContainText(username);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_013: Validation - Thêm nhân viên với Tên truy cập chứa khoảng trắng', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.typeText(accountsPage.usernameInput, 'banve vip');
    await accountsPage.passwordInput.focus();

    const feedback = page.locator('.invalid-feedback').filter({ hasText: 'Tên truy cập không được chứa khoảng trắng' });
    await expect(feedback).toBeVisible();
    await expect(accountsPage.modalSaveButton).toBeDisabled();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_014: Negative - Trùng lặp Tên truy cập nhân viên (Server check)', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();

    const timestamp = Date.now();
    await accountsPage.fillBasicInfo({
      username: 'admin1',
      matKhau: 'SecurePass123',
      hoVaTenDem: 'Nguyễn Trùng',
      ten: 'Lặp',
      tenHienThi: 'Nguyễn Trùng Lặp',
      defaultRole: 'BanVe',
      gioiTinh: 'Nam'
    });

    await accountsPage.selectPermissionPreset('cskh');

    await accountsPage.fillContactInfo({
      sdt: TestDataGenerator.generatePhoneNumber(),
      email: `trunglap_${timestamp}@txpbus.vn`,
      diaChi: '123 Láng, Hà Nội'
    });

    await accountsPage.saveAccount();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    const alertMsg = await accountsPage.getTextOf(accountsPage.alertMessage);
    expect(alertMsg).toContain('đã được sử dụng');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_015: Validation - Thêm nhân viên với Mật khẩu yếu (Dưới 8 ký tự)', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.typeText(accountsPage.passwordInput, '12345');
    await accountsPage.confirmPasswordInput.focus();

    const feedback = page.locator('.invalid-feedback').filter({ hasText: 'Mật khẩu tối thiểu 8 ký tự' });
    await expect(feedback).toBeVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_016: Validation - Thêm nhân viên với Mật khẩu không chứa số/chữ hoa', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.typeText(accountsPage.passwordInput, 'securepass');
    await accountsPage.confirmPasswordInput.focus();

    const feedback = page.locator('.invalid-feedback').filter({ hasText: 'Mật khẩu tối thiểu 8 ký tự, có số, chữ hoa' });
    await expect(feedback).toBeVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_017: Validation - Mật khẩu xác nhận nhập lại không khớp', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.typeText(accountsPage.passwordInput, 'SecurePass123');
    await accountsPage.typeText(accountsPage.confirmPasswordInput, 'SecurePass321');
    await accountsPage.hoVaTenDemInput.focus();

    const feedback = page.locator('.invalid-feedback').filter({ hasText: 'Mật khẩu nhập lại không khớp' });
    await expect(feedback).toBeVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_018: Happy Path - Cập nhật thông tin cơ bản và liên hệ của nhân viên', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.searchAccount('trangpt');
    const row = accountsPage.accountsTableRows.first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));

    const updatedName = 'Trần Thị Trang';
    await accountsPage.typeText(accountsPage.tenHienThiInput, updatedName);
    
    await accountsPage.clickOn(accountsPage.modalTabContact);
    const updatedPhone = TestDataGenerator.generatePhoneNumber();
    await accountsPage.typeText(accountsPage.sdtInput, updatedPhone);

    await accountsPage.saveAccount();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_019: Happy Path - Khóa tài khoản nhân viên hoạt động', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.searchAccount('banve1');
    const row = accountsPage.accountsTableRows.first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));

    await accountsPage.clickOn(accountsPage.modalStatusToggleButton);
    await accountsPage.saveAccount();

    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_020: Happy Path - Mở khóa tài khoản nhân viên bị khóa', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.searchAccount('banve1');
    const row = accountsPage.accountsTableRows.first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));

    await accountsPage.clickOn(accountsPage.modalStatusToggleButton);
    await accountsPage.saveAccount();

    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_021: RBAC - Áp dụng Preset quyền Quản trị viên trong Modal', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.selectPermissionPreset('admin');

    const activeBadgesCount = await accountsPage.activePermissionBadges.count();
    expect(activeBadgesCount).toBeGreaterThan(5);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_022: RBAC - Áp dụng Preset quyền Nhân viên điều phối trong Modal', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.selectPermissionPreset('dispatch');

    const activeBadgesText = await accountsPage.activePermissionBadges.first().innerText();
    expect(activeBadgesText).toContain('dispatch');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_023: RBAC - Phân quyền chức năng thủ công cho nhân viên', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.clickPermissionItem('Quản lý tin tức');
    await accountsPage.clickPermissionItem('Quản lý chính sách');

    const activeBadges = await accountsPage.activePermissionBadges.allInnerTexts();
    expect(activeBadges).toContain('news');
    expect(activeBadges).toContain('policy');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_024: Validation - Thêm nhân viên nhưng để trống quyền chức năng', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await expect(accountsPage.modalSaveButton).toBeDisabled();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_025: Validation - Bỏ trống các trường bắt buộc khi lưu nhân viên mới', async ({ accountsPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await page.waitForLoadState('networkidle');

    await accountsPage.openAddModal();
    await accountsPage.typeText(accountsPage.tenInput, '');
    await accountsPage.typeText(accountsPage.tenHienThiInput, '');
    
    await expect(accountsPage.modalSaveButton).toBeDisabled();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_026: Security - Chỉnh sửa nhân viên khi không có quyền quản trị nhân sự', async ({ loginPage, page }) => {
    await page.goto(`${ENV.CUSTOMER_URL}/admin-login`);
    await loginPage.login('trangpt', '123456');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });

    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhan-vien`);
    await expect(page).not.toHaveURL(/.*\/quan-ly-nhan-vien/);
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/);
  });
});
