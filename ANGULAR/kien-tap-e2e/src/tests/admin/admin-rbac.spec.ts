import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env.config';

test.describe('Phân Hệ Quản Trị - Đăng nhập & Kiểm soát phân quyền (Admin RBAC)', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    // Tăng timeout lên 80s để tránh cold start từ server Render backend
    test.setTimeout(80000);
    // 1. Điều hướng đến URL đăng nhập quản trị
    await loginPage.navigateTo(ENV.ADMIN_URL);
  });

  test('TXP_ADMIN_RBAC_TC_001: Happy Path - Đăng nhập thành công với tài khoản Ban Quản Lý (quyền report)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Sử dụng tài khoản Ban Quản Lý (quyền report)
    const username = 'quanly1';
    const password = 'Quanly@123';

    // Act: Thực hiện đăng nhập
    await loginPage.login(username, password);

    // Assert: Xác minh chuyển hướng thành công sang trang chủ admin
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
    
    // Assert: Sidebar hiển thị đúng vai trò và quyền (Báo cáo)
    await expect(adminDashboardPage.userNameLabel).toHaveText(/.*Tuan.*/i);
    await expect(adminDashboardPage.userRoleLabel).toHaveText('Ban quản lý');
    await expect(adminDashboardPage.getMenuItem('Báo cáo')).toBeVisible();
    
    // Assert: Các phân hệ khác không hiển thị
    await expect(adminDashboardPage.getMenuItem('Quản lý vé')).toBeHidden();
    await expect(adminDashboardPage.getMenuItem('Quản lý điều hành')).toBeHidden();
    await expect(adminDashboardPage.getMenuItem('Quản lý nhân viên')).toBeHidden();
  });

  test('TXP_ADMIN_RBAC_TC_002: Happy Path - Đăng nhập thành công với tài khoản Nhân viên bán vé (quyền ticket)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Sử dụng tài khoản Nhân viên bán vé (quyền ticket) đang hoạt động
    const username = 'trangpt';
    const password = '123456';

    // Act: Thực hiện đăng nhập
    await loginPage.login(username, password);

    // Assert: Xác minh chuyển hướng và sidebar hiển thị đúng phân hệ
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
    await expect(adminDashboardPage.getMenuItem('Quản lý vé')).toBeVisible();
    await expect(adminDashboardPage.getMenuItem('Quản lý khách hàng')).toBeVisible();
  });

  test('TXP_ADMIN_RBAC_TC_003: Happy Path - Đăng nhập thành công với tài khoản Nhân viên điều phối (quyền dispatch)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Sử dụng tài khoản Nhân viên điều phối (quyền dispatch)
    const username = 'dieuphoi1';
    const password = 'Default@123';

    // Act: Thực hiện đăng nhập
    await loginPage.login(username, password);

    // Assert: Xác minh hiển thị phân hệ điều hành, ẩn vé xe
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
    await expect(adminDashboardPage.getMenuItem('Quản lý điều hành')).toBeVisible();
    await expect(adminDashboardPage.getMenuItem('Quản lý vé')).toBeHidden();
  });

  test('TXP_ADMIN_RBAC_TC_004: Validation - Bỏ trống Tên truy cập', async ({ loginPage }) => {
    // Act: Bỏ trống tên đăng nhập
    await loginPage.login('', 'SecurePass123');

    // Assert: Báo lỗi validation client-side
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Vui lòng nhập tài khoản hoặc email');
  });

  test('TXP_ADMIN_RBAC_TC_005: Validation - Bỏ trống Mật khẩu', async ({ loginPage }) => {
    // Act: Bỏ trống mật khẩu
    await loginPage.login('banve1', '');

    // Assert: Báo lỗi validation client-side
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Vui lòng nhập mật khẩu');
  });

  test('TXP_ADMIN_RBAC_TC_006: Negative - Nhập sai Tên truy cập', async ({ loginPage }) => {
    // Act: Nhập sai tên truy cập
    await loginPage.login('wrong_user_99', 'SecurePass123');

    // Assert: Báo lỗi thông tin không chính xác từ Server
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 60000 });
    await expect(loginPage.errorMessage).toContainText('Tên truy cập hoặc mật khẩu không chính xác');
  });

  test('TXP_ADMIN_RBAC_TC_007: Negative - Nhập sai Mật khẩu', async ({ loginPage }) => {
    // Act: Nhập sai mật khẩu
    await loginPage.login('banve1', 'WrongPassword@123');

    // Assert: Báo lỗi thông tin không chính xác từ Server
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 60000 });
    await expect(loginPage.errorMessage).toContainText('Tên truy cập hoặc mật khẩu không chính xác');
  });

  test('TXP_ADMIN_RBAC_TC_008: Negative - Đăng nhập với tài khoản đang bị khóa (DaKhoa)', async ({ loginPage }) => {
    // Arrange: banve1 là tài khoản đang bị khóa
    const username = 'banve1';
    const password = 'Banve@123';

    // Act: Thực hiện đăng nhập
    await loginPage.login(username, password);

    // Assert: Báo lỗi tài khoản bị khóa từ server
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 60000 });
    await expect(loginPage.errorMessage).toContainText('Tài khoản của bạn đã bị khóa');
  });

  test('TXP_ADMIN_RBAC_TC_009: Security - Tấn công SQL Injection vào ô Tên truy cập', async ({ loginPage }) => {
    // Arrange: Tên đăng nhập chứa SQL Injection
    const sqlInjectionPayload = "' OR '1'='1";
    const password = 'randompassword';

    // Act: Gửi yêu cầu đăng nhập với payload
    await loginPage.login(sqlInjectionPayload, password);

    // Assert: Hệ thống báo lỗi bảo mật/tài khoản mật khẩu không chính xác và không cho bypass
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 60000 });
    await expect(loginPage.errorMessage).toContainText('Tên truy cập hoặc mật khẩu không chính xác');
  });

  test('TXP_ADMIN_RBAC_TC_010: Security - Nhập chuỗi Script XSS vào ô Tên truy cập', async ({ loginPage }) => {
    // Arrange: Tên đăng nhập chứa mã Script XSS
    const xssPayload = "<script>alert('XSS')</script>";
    const password = 'randompassword';

    // Act: Gửi yêu cầu đăng nhập
    await loginPage.login(xssPayload, password);

    // Assert: Hệ thống xử lý an toàn (sanitize) hoặc báo lỗi tài khoản không chính xác
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 60000 });
    await expect(loginPage.errorMessage).toContainText('Tên truy cập hoặc mật khẩu không chính xác');
  });

  test('TXP_ADMIN_RBAC_TC_011: RBAC - Kiểm tra phân quyền hiển thị sidebar cho nhóm Ticket (banve1)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Đăng nhập bằng tài khoản bán vé đang hoạt động
    await loginPage.login('trangpt', '123456');
    
    // Assert: Check chuyển hướng và kiểm tra sidebar
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
    await expect(adminDashboardPage.getMenuItem('Quản lý vé')).toBeVisible();
    await expect(adminDashboardPage.getMenuItem('Quản lý khách hàng')).toBeVisible();
    await expect(adminDashboardPage.getMenuItem('Quản lý điều hành')).toBeHidden();
  });

  test('TXP_ADMIN_RBAC_TC_012: RBAC - Kiểm tra phân quyền hiển thị sidebar cho nhóm Dispatch (dieuphoi1)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Đăng nhập bằng tài khoản điều phối
    await loginPage.login('dieuphoi1', 'Default@123');
    
    // Assert: Kiểm tra sidebar hiển thị đúng mục điều phối, ẩn các mục khác
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
    await expect(adminDashboardPage.getMenuItem('Quản lý điều hành')).toBeVisible();
    await expect(adminDashboardPage.getMenuItem('Quản lý vé')).toBeHidden();
    await expect(adminDashboardPage.getMenuItem('Quản lý nhân viên')).toBeHidden();
  });

  test('TXP_ADMIN_RBAC_TC_013: RBAC - Kiểm tra phân quyền hiển thị sidebar cho nhóm Report (quanly1)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Đăng nhập tài khoản quản lý
    await loginPage.login('quanly1', 'Quanly@123');
    
    // Assert: Sidebar hiển thị đúng menu báo cáo
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
    await expect(adminDashboardPage.getMenuItem('Báo cáo')).toBeVisible();
    await expect(adminDashboardPage.getMenuItem('Quản lý điều hành')).toBeHidden();
  });

  test('TXP_ADMIN_RBAC_TC_014: RBAC - Kiểm tra phân quyền hiển thị sidebar cho nhóm nhiều quyền (admin1)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Đăng nhập với tài khoản admin
    await loginPage.login('admin1', 'Admin@123');

    // Assert: Admin1 có đầy đủ quyền hiển thị các menu quản lý nâng cao
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });
    await expect(adminDashboardPage.getMenuItem('Quản lý nhân viên')).toBeVisible();
    await expect(adminDashboardPage.getMenuItem('Quản lý nhật ký')).toBeVisible();
  });

  test('TXP_ADMIN_RBAC_TC_015: Security - Chặn truy cập trực tiếp bằng URL của phân hệ không có quyền (AdminGuard)', async ({ loginPage, page }) => {
    // Arrange: Login bằng tài khoản bán vé hoạt động (không có quyền điều hành)
    await loginPage.login('trangpt', '123456');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });

    // Act: Nhập trực tiếp URL trang điều hành
    await page.goto(ENV.ADMIN_URL.replace('/admin-login', '/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe'));

    // Assert: AdminGuard chuyển hướng ngược lại trang chủ
    await expect(page).not.toHaveURL(/.*\/quan-ly-tuyen-xe/);
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/);
  });

  test('TXP_ADMIN_RBAC_TC_016: Security - Chặn truy cập trực tiếp bằng URL của Admin khi chưa đăng nhập', async ({ page }) => {
    // Act: Truy cập trực tiếp trang chủ admin khi chưa đăng nhập
    await page.goto(ENV.ADMIN_URL.replace('/admin-login', '/admin/trang-chu'));

    // Assert: Hệ thống chặn và chuyển hướng về trang login
    await expect(page).toHaveURL(/.*\/admin-login/);
  });

  test('TXP_ADMIN_RBAC_TC_017: Security - Kiểm tra phân quyền ở API level (gọi API trực tiếp từ bên ngoài)', async ({ loginPage, page, request }) => {
    // Arrange & Act: Gửi request trực tiếp đến API endpoint nhân viên mà không có token hợp lệ hoặc kèm token sai
    const response = await request.get(`${ENV.BASE_URL}/api/employees`, {
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });

    // Assert: API trả về lỗi unauthorized / forbidden
    // Ghi chú: Nếu server thực tế chưa chặn API, test case này mong đợi lỗi nhưng có thể nhận về 200.
    expect([401, 403]).toContain(response.status());
  });

  test('TXP_ADMIN_RBAC_TC_018: Session/Token - Xử lý khi token đăng nhập hết hạn', async ({ loginPage, page }) => {
    // Mô phỏng token hết hạn bằng cách xóa token/user session trong localStorage và thực hiện một thao tác gọi API
    await loginPage.login('quanly1', 'Quanly@123');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });

    // Act: Clear credentials trong Storage để giả lập hết hạn
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Reload trang hoặc click gọi API
    await page.reload();

    // Assert: Hệ thống tự động redirect về trang login
    await expect(page).toHaveURL(/.*\/admin-login/, { timeout: 15000 });
  });

  test('TXP_ADMIN_RBAC_TC_019: State Transition - Đăng xuất khỏi hệ thống (Logout)', async ({ loginPage, adminDashboardPage, page }) => {
    // Arrange: Đăng nhập thành công với quanly1
    await loginPage.login('quanly1', 'Quanly@123');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });

    // Act: Thực hiện đăng xuất
    await adminDashboardPage.logout();

    // Assert: Chuyển hướng về trang đăng nhập
    await expect(page).toHaveURL(/.*\/admin-login/);

    // Act: Nhấn nút Back của trình duyệt
    await page.goBack();

    // Assert: Vẫn ở login vì session đã bị xóa
    await expect(page).toHaveURL(/.*\/admin-login/);
  });

  test('TXP_ADMIN_RBAC_TC_020: Edge case - Thay đổi quyền của tài khoản trong database khi đang login', async ({ loginPage, page }) => {
    // Mô phỏng bằng cách thay đổi giá trị quyền trong localStorage (frontend role state) sau đó thực hiện gọi API / điều hướng
    await loginPage.login('quanly1', 'Quanly@123');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });

    // Act: Giả lập dev thay đổi role state trực tiếp trên client để cố tình hack/gọi phân hệ không có quyền
    await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      user.roles = []; // Xóa hết quyền
      localStorage.setItem('currentUser', JSON.stringify(user));
    });

    // Thực hiện reload hoặc điều hướng
    await page.goto(ENV.ADMIN_URL.replace('/admin-login', '/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe'));

    // Assert: Backend hoặc frontend guard chặn lại chuyển hướng về trang chủ/login
    await expect(page).not.toHaveURL(/.*\/quan-ly-tuyen-xe/);
  });

});
