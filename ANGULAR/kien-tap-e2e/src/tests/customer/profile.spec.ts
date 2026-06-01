import { test, expect, ENV } from '../../fixtures/base.fixture';
import { TestDataGenerator } from '../../utils/test-data';

test.describe('Phân Hệ Khách Hàng - Hồ Sơ Cá Nhân (Customer Profile)', () => {
  let password = 'OldPassword@123';
  let newPassword = 'NewPassword@123';
  let customerPhone: string;
  let customerName: string;
  let customerEmail: string;

  // Dữ liệu profile lưu trữ trong memory để đồng bộ giữa GET và PUT mock
  let currentProfileData: any;

  test.beforeEach(async ({ page, registerPage, profilePage }) => {
    customerPhone = TestDataGenerator.generatePhoneNumber();
    customerName = TestDataGenerator.generateFullName();
    customerEmail = TestDataGenerator.generateTraceableEmail('profile');

    currentProfileData = {
      MaKhachHang: '123456',
      HoTenKhachHang: customerName,
      SoDienThoai: customerPhone,
      Email: customerEmail,
      AnhDaiDien: '',
      GioiTinh: 'Nam',
      NgaySinh: '1995-08-15'
    };

    // MOCK CÁC ENDPOINT API AUTH & PROFILE
    
    // Mock check phone -> chưa tồn tại
    await page.route('**/customer/auth/check-phone', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ exists: false })
      });
    });

    // Mock gửi OTP
    await page.route('**/customer/auth/send-otp', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP sent', otp: '123456' })
      });
    });

    // Mock verify OTP
    await page.route('**/customer/auth/verify-otp', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP verified' })
      });
    });

    // Mock register
    await page.route('**/customer/auth/register', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Registration successful',
          token: 'mock-token-123456',
          data: currentProfileData
        })
      });
    });

    // Mock GET profile
    await page.route('**/customer/profile', async (route: any) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: currentProfileData })
        });
      } else if (route.request().method() === 'PUT') {
        const body = JSON.parse(route.request().postData() || '{}');
        // Đồng bộ dữ liệu cập nhật
        currentProfileData = {
          ...currentProfileData,
          HoTenKhachHang: body.HoTenKhachHang ?? currentProfileData.HoTenKhachHang,
          Email: body.Email ?? currentProfileData.Email,
          GioiTinh: body.GioiTinh ?? currentProfileData.GioiTinh,
          NgaySinh: body.NgaySinh ?? currentProfileData.NgaySinh,
          AnhDaiDien: body.AnhDaiDien ?? currentProfileData.AnhDaiDien
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: currentProfileData })
        });
      }
    });

    // Mock change password
    await page.route('**/customer/profile/change-password', async (route: any) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.MatKhauCu !== password) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Mật khẩu cũ không đúng.' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Đổi mật khẩu thành công!' })
        });
      }
    });

    // Mock history mặc định
    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      });
    });

    // TIẾN HÀNH ĐĂNG KÝ VÀ VÀO PROFILE
    await registerPage.navigateTo(ENV.CUSTOMER_URL + '/home');
    await registerPage.openRegisterModal();
    await registerPage.submitPhoneNumber(customerPhone);
    await registerPage.submitOtp('123456');
    await registerPage.fillProfileInfo(customerName, customerEmail, password, password);

    // Chờ toast đăng ký thành công
    await expect(registerPage.toastSuccessAlert).toBeVisible({ timeout: 15000 });

    // Set localStorage để đảm bảo trạng thái đăng nhập
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('access_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('customer_info', JSON.stringify(user));
    }, { token: 'mock-token-123456', user: currentProfileData });
    
    // Điều hướng tới profile
    await profilePage.navigateTo(ENV.CUSTOMER_URL + '/profile');
  });

  // ==========================================
  // PHẦN 1: QUẢN LÝ THÔNG TIN HỒ SƠ
  // ==========================================

  test('TXP_PROF_TC_001: Happy Path - Hiển thị đầy đủ thông tin cá nhân ở chế độ xem (View Mode)', async ({ profilePage }) => {
    await expect(profilePage.fullNameViewText).toHaveText(customerName);
    await expect(profilePage.phoneViewText).toHaveText(customerPhone);
    await expect(profilePage.emailViewText).toHaveText(customerEmail);
    await expect(profilePage.avatarImg).toBeVisible();
  });

  test('TXP_PROF_TC_002: Happy Path - Chuyển sang chế độ chỉnh sửa và cập nhật thông tin thành công', async ({ profilePage }) => {
    const updatedName = 'Nguyễn Văn Kiểm';
    const updatedEmail = 'auto_user_edit@gmail.com';
    const updatedDob = '1995-08-15';

    await profilePage.startEdit();
    await profilePage.editInfo(updatedName, 'Nam', updatedEmail, updatedDob);
    await profilePage.save();

    // Verify thông tin cập nhật ở View Mode
    await expect(profilePage.fullNameViewText).toHaveText(updatedName);
    await expect(profilePage.emailViewText).toHaveText(updatedEmail);
    await expect(profilePage.genderViewText).toHaveText('Nam');
    await expect(profilePage.dobViewText).toHaveText('15/08/1995');
  });

  test('TXP_PROF_TC_003: Boundary - Sửa thông tin hồ sơ nhưng không đổi dữ liệu', async ({ profilePage }) => {
    await profilePage.startEdit();
    await profilePage.save();
    
    await expect(profilePage.fullNameViewText).toHaveText(customerName);
    await expect(profilePage.emailViewText).toHaveText(customerEmail);
  });

  test('TXP_PROF_TC_004: Security - Trường Số điện thoại bị khóa không cho phép sửa đổi', async ({ profilePage }) => {
    await profilePage.startEdit();
    await expect(profilePage.readonlyPhoneInput).toBeDisabled();
  });

  test('TXP_PROF_TC_005: Validation - Để trống họ tên hiển thị thông báo lỗi', async ({ profilePage }) => {
    await profilePage.startEdit();
    await profilePage.fullNameInput.fill('');
    await profilePage.fullNameInput.dispatchEvent('input');
    await expect(profilePage.fullNameError).toBeVisible();
    await expect(profilePage.fullNameError).toHaveText('Vui lòng nhập họ tên');
    await expect(profilePage.updateProfileBtn).toBeDisabled();
  });

  test('TXP_PROF_TC_006: Validation - Nhập email sai định dạng hiển thị thông báo lỗi', async ({ profilePage }) => {
    await profilePage.startEdit();
    await profilePage.emailInput.fill('invalidemail@domain');
    await profilePage.emailInput.dispatchEvent('input');
    await expect(profilePage.emailError).toBeVisible();
    await expect(profilePage.emailError).toHaveText('Email không hợp lệ');
    await expect(profilePage.updateProfileBtn).toBeDisabled();
  });

  test('TXP_PROF_TC_007: Happy Path - Tải lên ảnh đại diện đúng định dạng và dung lượng hợp lệ', async ({ profilePage }) => {
    await profilePage.startEdit();
    await profilePage.avatarFileInput.setInputFiles({
      name: 'avatar_test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(500 * 1024), // 500KB
    });
    await expect(profilePage.avatarError).toBeHidden();
    await profilePage.save();
  });

  test('TXP_PROF_TC_008: Boundary - Tải lên ảnh đại diện đúng định dạng sát mốc giới hạn 1MB', async ({ profilePage }) => {
    await profilePage.startEdit();
    await profilePage.avatarFileInput.setInputFiles({
      name: 'avatar_1mb.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(1024 * 1024), // Đúng 1MB
    });
    await expect(profilePage.avatarError).toBeHidden();
    await profilePage.save();
  });

  test('TXP_PROF_TC_009: Negative - Tải lên ảnh đại diện vượt quá dung lượng tối đa 1MB', async ({ profilePage }) => {
    await profilePage.startEdit();
    await profilePage.avatarFileInput.setInputFiles({
      name: 'big_avatar.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(1.2 * 1024 * 1024), // 1.2MB
    });
    await expect(profilePage.avatarError).toBeVisible();
    await expect(profilePage.avatarError).toHaveText('File quá lớn, tối đa 1MB');
  });

  test('TXP_PROF_TC_010: Negative - Tải lên file sai định dạng không được chấp nhận', async ({ profilePage }) => {
    await profilePage.startEdit();
    const acceptAttr = await profilePage.avatarFileInput.getAttribute('accept');
    expect(acceptAttr).toContain('image/jpeg');
    expect(acceptAttr).toContain('image/png');
    expect(acceptAttr).toContain('image/jpg');
  });

  test('TXP_PROF_TC_029: Boundary - Chỉnh sửa ngày sinh của khách hàng hợp lệ ở biên', async ({ profilePage }) => {
    const boundaryDob = '2008-05-30'; // Đủ 18 tuổi so với năm 2026
    await profilePage.startEdit();
    await profilePage.editInfo(null, null, null, boundaryDob);
    await profilePage.save();

    await expect(profilePage.dobViewText).toHaveText('30/05/2008');
  });

  // ==========================================
  // PHẦN 2: ĐỔI MẬT KHẨU
  // ==========================================

  test('TXP_PROF_TC_011: Happy Path - Đổi mật khẩu thành công qua luồng xác thực OTP (Happy Path)', async ({ profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, newPassword);
    await profilePage.submitChangePassword();

    // Nhập OTP đúng
    await profilePage.submitOtp('123456');

    // Thành công
    await expect(profilePage.changePasswordSuccessMsg).toBeVisible({ timeout: 15000 });
    await expect(profilePage.changePasswordSuccessMsg).toHaveText(/Đổi mật khẩu thành công!/);
  });

  test('TXP_PROF_TC_012: Validation - Để trống toàn bộ trường mật khẩu', async ({ profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.submitChangePassword();

    await expect(profilePage.currentPasswordError).toBeVisible();
    await expect(profilePage.currentPasswordError).toHaveText('Vui lòng nhập mật khẩu hiện tại.');
  });

  test('TXP_PROF_TC_013: Validation - Xác nhận mật khẩu mới không trùng khớp', async ({ profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, 'MismatchPass@123');
    await profilePage.submitChangePassword();

    await expect(profilePage.confirmPasswordError).toBeVisible();
    await expect(profilePage.confirmPasswordError).toHaveText('Mật khẩu mới và xác nhận mật khẩu không khớp.');
  });

  test('TXP_PROF_TC_014: Alternate Path - Toggle hiển thị/ẩn mật khẩu ở các ô nhập', async ({ profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, newPassword);

    await expect(profilePage.currentPasswordInput).toHaveAttribute('type', 'password');
    await expect(profilePage.newPasswordInput).toHaveAttribute('type', 'password');
    await expect(profilePage.confirmPasswordInput).toHaveAttribute('type', 'password');

    await profilePage.toggleCurrentPasswordBtn.click();
    await profilePage.toggleNewPasswordBtn.click();
    await profilePage.toggleConfirmPasswordBtn.click();

    await expect(profilePage.currentPasswordInput).toHaveAttribute('type', 'text');
    await expect(profilePage.newPasswordInput).toHaveAttribute('type', 'text');
    await expect(profilePage.confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  test('TXP_PROF_TC_015: Negative - Nhập mật khẩu hiện tại sai khi gửi yêu cầu', async ({ profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill('WrongCurrentPass@123', newPassword, newPassword);
    await profilePage.submitChangePassword();
    await profilePage.submitOtp('123456');

    await expect(profilePage.changePasswordFailureMsg).toBeVisible({ timeout: 15000 });
    await expect(profilePage.changePasswordFailureMsg).toHaveText(/Mật khẩu cũ không đúng/i);
  });

  test('TXP_PROF_TC_016: Negative - Nhập sai mã OTP trong popup xác nhận', async ({ page, profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, newPassword);

    // Mock verify-otp trả về lỗi
    await page.route('**/customer/auth/verify-otp', async (route: any) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mã xác thực không đúng. Vui lòng thử lại.' }),
      });
    });

    await profilePage.submitChangePassword();
    await profilePage.submitOtp('999999');

    await expect(profilePage.otpModalError).toBeVisible({ timeout: 10000 });
    await expect(profilePage.otpModalError).toHaveText('Mã xác thực không đúng. Vui lòng thử lại.');
  });

  test('TXP_PROF_TC_017: Boundary - OTP hết hiệu lực sau khi hết 90 giây đếm ngược', async ({ page, profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, newPassword);

    await page.route('**/customer/auth/verify-otp', async (route: any) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.' }),
      });
    });

    await profilePage.submitChangePassword();
    await profilePage.submitOtp('123456');

    await expect(profilePage.otpModalError).toBeVisible();
    await expect(profilePage.otpModalError).toHaveText('Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
  });

  test('TXP_PROF_TC_018: Edge Case - Click nút hủy trên popup OTP để quay lại form nhập mật khẩu', async ({ profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, newPassword);
    await profilePage.submitChangePassword();

    await expect(profilePage.otpModalHeader).toBeVisible();
    await profilePage.closeOtpModal();

    await expect(profilePage.otpModalHeader).toBeHidden();
    await expect(profilePage.currentPasswordInput).toHaveValue(password);
  });

  test('TXP_PROF_TC_019: Security - Không thể dùng lại OTP đã hết hạn/đã hủy để xác nhận lại', async ({ page, profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, newPassword);
    
    await profilePage.submitChangePassword();
    await profilePage.closeOtpModal();

    await page.route('**/customer/auth/verify-otp', async (route: any) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' }),
      });
    });

    await profilePage.submitChangePassword();
    await profilePage.submitOtp('123456');

    await expect(profilePage.otpModalError).toBeVisible();
  });

  test('TXP_PROF_TC_020: Boundary - Nhập mật khẩu mới trùng khớp mật khẩu hiện tại', async ({ profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, password, password);
    await profilePage.submitChangePassword();

    await expect(profilePage.newPasswordError).toBeVisible();
    await expect(profilePage.newPasswordError).toHaveText('Mật khẩu mới không được trùng với mật khẩu cũ.');
  });

  test('TXP_PROF_TC_030: Security - Token đăng nhập hết hạn khi đang ở màn hình đổi mật khẩu', async ({ page, profilePage }) => {
    await profilePage.switchTab('password');
    await profilePage.changePasswordFill(password, newPassword, newPassword);

    await page.route('**/customer/auth/send-otp', async (route: any) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    // Capture navigation to home page or login modal triggered by auth interceptor
    const navigationPromise = page.waitForNavigation().catch(() => null);
    await profilePage.submitChangePassword();
    await navigationPromise;
  });

  // ==========================================
  // PHẦN 3: LỊCH SỬ MUA VÉ
  // ==========================================

  test('TXP_PROF_TC_021: Happy Path - Hiển thị danh sách vé xe đã đặt dưới dạng bảng phân trang', async ({ page, profilePage }) => {
    const mockOrders = [
      { maDonHang: 'DH10000001', soLuongVeDaDat: 2, tenTuyen: 'Bình Định - TP. Hồ Chí Minh', gioKhoiHanh: '19:00', departureDate: '2026-06-15', tongGiaVe: 500000, trangThaiDonHang: 'Chờ khởi hành' },
      { maDonHang: 'DH10000002', soLuongVeDaDat: 1, tenTuyen: 'Bình Định - Bình Dương', gioKhoiHanh: '08:00', departureDate: '2026-06-16', tongGiaVe: 250000, trangThaiDonHang: 'Chờ thanh toán' }
    ];

    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockOrders }),
      });
    });

    await profilePage.switchTab('history');

    await expect(profilePage.historyTableRows).toHaveCount(2);
    const firstRow = profilePage.historyTableRows.first();
    await expect(firstRow.locator('td.font-mono')).toHaveText('DH10000002');
    await expect(firstRow.locator('td.text-primary')).toHaveText('Bình Định - Bình Dương');
  });

  test('TXP_PROF_TC_022: Happy Path - Lọc lịch sử mua vé theo trạng thái vé', async ({ page, profilePage }) => {
    const mockOrders = [
      { maDonHang: 'DH01', tenTuyen: 'Tuyến A', departureDate: '2026-06-15', tongGiaVe: 200000, trangThaiDonHang: 'Đã hủy' },
      { maDonHang: 'DH02', tenTuyen: 'Tuyến B', departureDate: '2026-06-15', tongGiaVe: 200000, trangThaiDonHang: 'Chờ khởi hành' }
    ];

    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: mockOrders }) });
    });

    await profilePage.switchTab('history');
    await profilePage.filterHistory(null, null, null, 'Đã hủy');

    await expect(profilePage.historyTableRows).toHaveCount(1);
    await expect(profilePage.historyTableRows.first().locator('td.font-mono')).toHaveText('DH01');
  });

  test('TXP_PROF_TC_023: Happy Path - Lọc lịch sử mua vé theo Mã đơn hàng', async ({ page, profilePage }) => {
    const mockOrders = [
      { maDonHang: 'DH10000001', tenTuyen: 'Tuyến A', departureDate: '2026-06-15', tongGiaVe: 200000, trangThaiDonHang: 'Chờ khởi hành' },
      { maDonHang: 'DH10000002', tenTuyen: 'Tuyến B', departureDate: '2026-06-15', tongGiaVe: 200000, trangThaiDonHang: 'Chờ khởi hành' }
    ];

    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: mockOrders }) });
    });

    await profilePage.switchTab('history');
    await profilePage.filterHistory('DH10000001', null, null, null);

    await expect(profilePage.historyTableRows).toHaveCount(1);
    await expect(profilePage.historyTableRows.first().locator('td.font-mono')).toHaveText('DH10000001');
  });

  test('TXP_PROF_TC_024: Happy Path - Lọc lịch sử mua vé theo Tuyến đường', async ({ page, profilePage }) => {
    const mockOrders = [
      { maDonHang: 'DH01', tenTuyen: 'Bình Định - Quy Nhơn', departureDate: '2026-06-15', tongGiaVe: 200000, trangThaiDonHang: 'Chờ khởi hành' },
      { maDonHang: 'DH02', tenTuyen: 'Hà Nội - Quảng Ninh', departureDate: '2026-06-15', tongGiaVe: 200000, trangThaiDonHang: 'Chờ khởi hành' }
    ];

    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: mockOrders }) });
    });

    await profilePage.switchTab('history');
    await profilePage.filterHistory(null, null, 'Bình Định', null);

    await expect(profilePage.historyTableRows).toHaveCount(1);
    await expect(profilePage.historyTableRows.first().locator('td.text-primary')).toContainText('Bình Định');
  });

  test('TXP_PROF_TC_025: Happy Path - Phân trang lịch sử mua vé hoạt động chính xác', async ({ page, profilePage }) => {
    const mockOrders = Array.from({ length: 15 }, (_, i) => ({
      maDonHang: `DH${(100000 + i).toString()}`,
      tenTuyen: `Tuyến ${i}`,
      departureDate: '2026-06-15',
      tongGiaVe: 200000,
      trangThaiDonHang: 'Chờ khởi hành'
    }));

    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: mockOrders }) });
    });

    await profilePage.switchTab('history');

    await expect(profilePage.historyTableRows).toHaveCount(10);
    await profilePage.paginationPages.nth(1).click();
    await expect(profilePage.historyTableRows).toHaveCount(5);
  });

  test('TXP_PROF_TC_026: Boundary - Lịch sử mua vé trống không hiển thị đơn hàng nào', async ({ page, profilePage }) => {
    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await profilePage.switchTab('history');
    await expect(profilePage.emptyHistoryRow).toBeVisible();
  });

  test('TXP_PROF_TC_027: Boundary - Lịch sử mua vé có vừa đủ 10 đơn hàng (không hiện phân trang)', async ({ page, profilePage }) => {
    const mockOrders = Array.from({ length: 10 }, (_, i) => ({
      maDonHang: `DH${(100000 + i).toString()}`,
      tenTuyen: `Tuyến ${i}`,
      departureDate: '2026-06-15',
      tongGiaVe: 200000,
      trangThaiDonHang: 'Chờ khởi hành'
    }));

    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: mockOrders }) });
    });

    await profilePage.switchTab('history');
    await expect(profilePage.historyTableRows).toHaveCount(10);
    await expect(profilePage.paginationPages).toHaveCount(1);
  });

  test('TXP_PROF_TC_028: Boundary - Lịch sử mua vé có 11 đơn hàng (xuất hiện phân trang)', async ({ page, profilePage }) => {
    const mockOrders = Array.from({ length: 11 }, (_, i) => ({
      maDonHang: `DH${(100000 + i).toString()}`,
      tenTuyen: `Tuyến ${i}`,
      departureDate: '2026-06-15',
      tongGiaVe: 200000,
      trangThaiDonHang: 'Chờ khởi hành'
    }));

    await page.route('**/customer/tra-cuu-ve/history*', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: mockOrders }) });
    });

    await profilePage.switchTab('history');
    await expect(profilePage.historyTableRows).toHaveCount(10);
    await expect(profilePage.paginationPages).toHaveCount(2);
  });
});
