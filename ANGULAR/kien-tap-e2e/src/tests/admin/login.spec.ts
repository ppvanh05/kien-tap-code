import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env.config';

test.describe('Phân Hệ Quản Trị - Đăng nhập (Admin Login)', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    // Điều hướng đến URL đăng nhập quản trị
    await loginPage.navigateTo(ENV.ADMIN_URL);
  });

  test('TC_LOGIN_001: Đăng nhập thành công với tài khoản Quản trị viên (Happy Path)', async ({ loginPage, page }) => {
    // Thực hiện đăng nhập
    await loginPage.login(ENV.ADMIN_USERNAME, ENV.ADMIN_PASSWORD);
    
    // Verify: Chuyển hướng thành công đến dashboard admin
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
  });

  test('TC_LOGIN_002: Đăng nhập thất bại khi bỏ trống Tên truy cập', async ({ loginPage }) => {
    // Nhập mật khẩu nhưng bỏ trống tên
    await loginPage.login('', ENV.ADMIN_PASSWORD);
    
    // Verify: Hiển thị cảnh báo lỗi (Client hoặc Server validation)
    const err = await loginPage.getErrorMessage();
    expect(err.length).toBeGreaterThan(0);
  });
});
