import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env.config';

test.describe('Phân Hệ Quản Trị - Module Quản Lý Chính Sách (Admin Policy Management)', () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Mock dữ liệu chính sách ban đầu
  const mockChinhSachChung = [
    {
      MaChinhSach_ND: 'CS100002',
      TieuDe: 'CHÍNH SÁCH CHỈNH SỬA THÔNG TIN VÉ ĐÃ ĐẶT',
      LoaiChinhSach: 'Chính sách khác',
      NoiDung: '<p>Nội dung chính sách chỉnh sửa thông tin vé đã đặt...</p>',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      MaQuanTriVien: 'QTV100001'
    },
    {
      MaChinhSach_ND: 'CS100004',
      TieuDe: 'CHÍNH SÁCH CAM KẾT DỊCH VỤ VÀ BỒI THƯỜNG TRƯỜNG HỢP SỰ CỐ',
      LoaiChinhSach: 'Chính sách khác',
      NoiDung: '<p>Nội dung chính sách bồi thường...</p>',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      MaQuanTriVien: 'QTV100001'
    },
    {
      MaChinhSach_ND: 'CS100005',
      TieuDe: 'CHÍNH SÁCH PHẢN HỒI VÀ ĐÁNH GIÁ CHUYẾN ĐI',
      LoaiChinhSach: 'Chính sách khác',
      NoiDung: '<p>Nội dung chính sách phản hồi đánh giá...</p>',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      MaQuanTriVien: 'QTV100001'
    },
    {
      MaChinhSach_ND: 'CS100006',
      TieuDe: 'CHÍNH SÁCH THU THẬP VÀ PHÂN LOẠI DỮ LIỆU CÁ NHÂN',
      LoaiChinhSach: 'Chính sách khác',
      NoiDung: '<p>Nội dung chính sách bảo mật thông tin...</p>',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      MaQuanTriVien: 'QTV100001'
    },
    {
      MaChinhSach_ND: 'CS100007',
      TieuDe: 'MỤC ĐÍCH SỬ DỤNG VÀ XỬ LÝ DỮ LIỆU HỆ THỐNG',
      LoaiChinhSach: 'Chính sách khác',
      NoiDung: '<p>Nội dung mục đích xử lý dữ liệu...</p>',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      MaQuanTriVien: 'QTV100001'
    },
    {
      MaChinhSach_ND: 'CS100008',
      TieuDe: 'CHÍNH SÁCH CHIA SẺ VÀ TIẾT LỘ THÔNG TIN BẢO MẬT',
      LoaiChinhSach: 'Chính sách khác',
      NoiDung: '<p>Nội dung chia sẻ thông tin...</p>',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      MaQuanTriVien: 'QTV100001'
    },
    {
      MaChinhSach_ND: 'CS100009',
      TieuDe: 'Chính sách bảo hiểm hành trình 2026 - cũ',
      LoaiChinhSach: 'Chính sách bảo hiểm',
      NoiDung: '<p>Nội dung chính sách bảo hiểm hành trình...</p>',
      NgayApDung: '2026-05-22T00:00:00.000Z',
      TrangThai: 'VoHieuHoa',
      MaQuanTriVien: 'QTV100001'
    }
  ];

  const mockChinhSachHuyVe = [
    {
      MaChinhSach: 'CSHV100001',
      TenChinhSach: 'Hủy vé trước 24h',
      MoTa: 'Hoàn tiền 100% khi khách hàng hủy vé trước giờ khởi hành 24 giờ.',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      GioiHanGioTruocKhoiHanh: 24,
      TyLePhiHuy: 0.0 // tương ứng phí hủy 0% -> hoàn trả 100%
    },
    {
      MaChinhSach: 'CSHV100002',
      TenChinhSach: 'Hủy vé từ 12h đến dưới 24h',
      MoTa: 'Hoàn tiền 50% khi hủy vé trong khoảng 12h-24h trước giờ xe chạy.',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      GioiHanGioTruocKhoiHanh: 12,
      TyLePhiHuy: 0.5 // phí hủy 50%
    },
    {
      MaChinhSach: 'CSHV100003',
      TenChinhSach: 'Hủy vé thường dưới 12h (sát giờ xe chạy)',
      MoTa: 'Không hoàn tiền khi hủy vé sát giờ khởi hành.',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      GioiHanGioTruocKhoiHanh: 6,
      TyLePhiHuy: 1.0 // phí hủy 100%
    },
    {
      MaChinhSach: 'CS100003',
      TenChinhSach: 'CHÍNH SÁCH HỦY VÉ VÀ HOÀN TIỀN',
      MoTa: 'Chính sách hủy vé hoàn tiền tổng quan.',
      NgayApDung: '2026-05-23T00:00:00.000Z',
      TrangThai: 'DangApDung',
      GioiHanGioTruocKhoiHanh: 24,
      TyLePhiHuy: 0.0
    }
  ];

  // Helper thực hiện login và di chuyển đến Quản lý chính sách
  async function loginAndNavigateToPolicies(page: any, loginPage: any) {
    await page.context().clearCookies();
    await page.goto(ENV.ADMIN_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');

    // Chuyển sang URL admin quan ly chinh sach
    const cleanAdminUrl = ENV.ADMIN_URL.replace('/admin-login', '');
    await page.goto(`${cleanAdminUrl}/admin/quan-ly-chinh-sach`);
    await expect(page.getByRole('heading', { name: 'Chính sách nhà xe' })).toBeVisible({ timeout: 15000 });
  }

  test.beforeEach(async ({ page }) => {
    // Thiết lập route mock API
    await page.route(/.*/, async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (method === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: corsHeaders
        });
        return;
      }

      // Mock auth login
      if (url.includes('/auth/login')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            token: 'mock_jwt_token_admin_policy',
            admin: {
              MaNhanVien: 'QTV100001',
              TenTruyCap: 'admin1',
              Email: 'admin1@txp.com',
              TrangThai: 'HoatDong',
              Quyen: ['policy', 'policy.update', 'policy.manage']
            }
          })
        });
        return;
      }

      // Mock GET /admin/chinh-sach
      if (url.includes('/admin/chinh-sach') && !url.includes('/huy-ve') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(mockChinhSachChung)
        });
        return;
      }

      // Mock GET /admin/chinh-sach/huy-ve/all
      if (url.includes('/admin/chinh-sach/huy-ve/all') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(mockChinhSachHuyVe)
        });
        return;
      }

      // Mock POST /admin/chinh-sach
      if (url.includes('/admin/chinh-sach') && !url.includes('/huy-ve') && method === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        // Trả về đối tượng vừa tạo kèm MaChinhSach_ND
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            ...body,
            MaChinhSach_ND: `CS${Date.now().toString().slice(-4)}`
          })
        });
        return;
      }

      // Mock POST /admin/chinh-sach/huy-ve
      if (url.includes('/admin/chinh-sach/huy-ve') && method === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            ...body,
            MaChinhSach: `CSH${Date.now().toString().slice(-4)}`
          })
        });
        return;
      }

      // Mock PUT /admin/chinh-sach/:id
      if (url.includes('/admin/chinh-sach/') && !url.includes('/huy-ve') && method === 'PUT') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(body)
        });
        return;
      }

      // Mock PUT /admin/chinh-sach/huy-ve/:id
      if (url.includes('/admin/chinh-sach/huy-ve/') && method === 'PUT') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(body)
        });
        return;
      }

      await route.continue();
    });
  });

  // ==========================================
  // THÊM MỚI CHÍNH SÁCH (TC_001 -> TC_003)
  // ==========================================

  test('TXP_ADMIN_POLICY_TC_001: Happy Path - Thêm mới Chính sách Bảo hiểm thành công', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Click nút thêm mới và chọn bảo hiểm
    await policyAdminPage.selectAddPolicyType('insurance');

    const testTitle = `Chính sách bảo hiểm hành trình an toàn auto_${Date.now()}`;
    await policyAdminPage.fillForm({
      title: testTitle,
      date: '2026-06-01',
      content: 'Nội dung soạn thảo bằng rich text editor.'
    });

    // Lưu chính sách
    await policyAdminPage.saveForm();

    // Verify thông báo lưu thành công và modal đóng
    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Đã thêm chính sách thành công!');
    await policyAdminPage.closeAlert();

    await expect(policyAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_POLICY_TC_002: Happy Path - Thêm mới Chính sách Thanh toán thành công', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Chọn thêm chính sách thanh toán
    await policyAdminPage.selectAddPolicyType('payment');

    const testTitle = `Chính sách thanh toán trực tuyến auto_${Date.now()}`;
    await policyAdminPage.fillForm({
      title: testTitle,
      date: '2026-06-01',
      content: 'Chính sách thanh toán QR Pay và các thẻ nội địa.'
    });

    await policyAdminPage.saveForm();

    // Verify thành công
    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Đã thêm chính sách thành công!');
    await policyAdminPage.closeAlert();

    await expect(policyAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_POLICY_TC_003: Happy Path - Thiết lập Chính sách Hủy vé với mốc hoàn tiền hợp lệ', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Chọn thêm chính sách hủy vé
    await policyAdminPage.selectAddPolicyType('cancellation');

    const testTitle = `Chính sách hủy vé hè auto_${Date.now()}`;
    await policyAdminPage.fillForm({
      title: testTitle,
      date: '2026-06-01'
    });

    // Điền mốc đầu tiên
    await policyAdminPage.fillMilestoneAt(0, 24, 100);

    await policyAdminPage.saveForm();

    // Verify thành công
    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Đã thêm chính sách hủy vé thành công!');
    await policyAdminPage.closeAlert();

    await expect(policyAdminPage.modalOverlay).toBeHidden();
  });

  // ==========================================
  // THAY ĐỔI TRẠNG THÁI (TC_004 -> TC_006)
  // ==========================================

  test('TXP_ADMIN_POLICY_TC_004: Happy Path - Chuyển trạng thái DangApDung → VoHieuHoa kèm Confirmation Dialog', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Mở form chỉnh sửa của dòng đầu tiên (CSHV100001 - Hủy vé trước 24h đang hiển thị)
    await policyAdminPage.editBtn.first().click();
    await expect(policyAdminPage.modalOverlay).toBeVisible();

    // Click toggle trạng thái
    await policyAdminPage.statusToggleBtn.click();

    // Verify confirmation modal xuất hiện
    await expect(policyAdminPage.confirmModalTitle).toContainText('Xác nhận khóa chính sách');
    await policyAdminPage.confirmAction();

    // Lưu form
    await policyAdminPage.saveForm();

    // Verify lưu thành công
    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Đã cập nhật chính sách thành công!');
    await policyAdminPage.closeAlert();

    await expect(policyAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_POLICY_TC_005: Alternate Path - Hủy bỏ hành động thay đổi trạng thái qua Confirmation Dialog', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.editBtn.first().click();
    await expect(policyAdminPage.modalOverlay).toBeVisible();

    // Click toggle trạng thái
    await policyAdminPage.statusToggleBtn.click();

    // Hủy bỏ xác nhận
    await policyAdminPage.cancelConfirmAction();

    // Đóng modal
    await policyAdminPage.cancelForm();
    await expect(policyAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_POLICY_TC_006: Happy Path - Chuyển trạng thái VoHieuHoa → DangApDung (kích hoạt lại)', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Chuyển sang Tab Đã khóa
    await policyAdminPage.lockedTab.click();

    // Dòng đầu tiên trong tab đã khóa (CS100009 - Chính sách bảo hiểm hành trình 2026 - cũ)
    await policyAdminPage.editBtn.first().click();
    await expect(policyAdminPage.modalOverlay).toBeVisible();

    // Kích hoạt lại
    await policyAdminPage.statusToggleBtn.click();
    await expect(policyAdminPage.confirmModalTitle).toContainText('Xác nhận kích hoạt chính sách');
    await policyAdminPage.confirmAction();

    await policyAdminPage.saveForm();

    // Verify thành công
    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Đã cập nhật chính sách thành công!');
    await policyAdminPage.closeAlert();
  });

  // ==========================================
  // VALIDATION FORM (TC_007 -> TC_012)
  // ==========================================

  test('TXP_ADMIN_POLICY_TC_007: Validation - Lưu chính sách khi bỏ trống Tiêu đề', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.selectAddPolicyType('insurance');

    // Để trống tiêu đề
    await policyAdminPage.fillForm({
      title: '',
      date: '2026-06-01',
      content: 'Chính sách bảo hiểm rỗng tiêu đề.'
    });

    await policyAdminPage.saveForm();

    // Cảnh báo xuất hiện
    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Vui lòng nhập tên chính sách!');
    await policyAdminPage.closeAlert();
  });

  test('TXP_ADMIN_POLICY_TC_008: Validation - Lưu chính sách khi bỏ trống Ngày áp dụng', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.selectAddPolicyType('insurance');

    await policyAdminPage.fillForm({
      title: 'Chính sách rỗng ngày áp dụng',
      date: '',
      content: 'Nội dung test.'
    });

    await policyAdminPage.saveForm();

    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Ngày áp dụng không hợp lệ!');
    await policyAdminPage.closeAlert();
  });

  test('TXP_ADMIN_POLICY_TC_009: Validation - Lưu Chính sách Hủy vé khi không có mốc hoàn tiền nào', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.selectAddPolicyType('cancellation');

    await policyAdminPage.fillForm({
      title: 'Hủy vé không mốc hoàn tiền',
      date: '2026-06-01'
    });

    // Xóa các mốc mặc định đi
    const count = await policyAdminPage.milestoneRows.count();
    for (let i = 0; i < count; i++) {
      await policyAdminPage.removeMilestoneBtns.first().click();
    }

    await policyAdminPage.saveForm();

    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Vui lòng thêm ít nhất một mốc thời gian hủy vé!');
    await policyAdminPage.closeAlert();
  });

  test('TXP_ADMIN_POLICY_TC_010: Validation - Mốc hoàn tiền có GioiHanGioTruocKhoiHanh = 0 hoặc âm', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.selectAddPolicyType('cancellation');

    await policyAdminPage.fillForm({
      title: 'Hủy vé mốc sai giờ',
      date: '2026-06-01'
    });

    // Nhập mốc thứ nhất giờ là 0
    await policyAdminPage.fillMilestoneAt(0, 0, 100);

    await policyAdminPage.saveForm();

    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Trước giờ khởi hành phải lớn hơn 0 Giờ!');
    await policyAdminPage.closeAlert();
  });

  test('TXP_ADMIN_POLICY_TC_011: Validation - Mốc hoàn tiền có TyLeHoan > 100%', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.selectAddPolicyType('cancellation');

    await policyAdminPage.fillForm({
      title: 'Hủy vé phí hủy lớn hơn 100',
      date: '2026-06-01'
    });

    // Nhập mốc thứ nhất tỷ lệ phí hủy/hoàn trả = 150
    await policyAdminPage.fillMilestoneAt(0, 24, 150);

    await policyAdminPage.saveForm();

    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Phí hủy phải nằm trong khoảng 0% - 100%!');
    await policyAdminPage.closeAlert();
  });

  test('TXP_ADMIN_POLICY_TC_012: Validation - Thêm mới chính sách với Tiêu đề trùng với chính sách đã tồn tại', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.selectAddPolicyType('insurance');

    // Nhập tiêu đề trùng chính sách đã có
    await policyAdminPage.fillForm({
      title: 'CHÍNH SÁCH PHẢN HỒI VÀ ĐÁNH GIÁ CHUYẾN ĐI',
      date: '2026-06-01',
      content: 'Chính sách bị trùng tiêu đề.'
    });

    await policyAdminPage.saveForm();

    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Tiêu đề chính sách bị trùng, vui lòng kiểm tra lại nội dung!');
    await policyAdminPage.closeAlert();
  });

  // ==========================================
  // CẬP NHẬT CHÍNH SÁCH (TC_013 -> TC_014)
  // ==========================================

  test('TXP_ADMIN_POLICY_TC_013: Happy Path - Cập nhật Tiêu đề và Nội dung chính sách chung', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Sửa chính sách thứ 4 (CS100002)
    const targetRow = policyAdminPage.tableRows.filter({ hasText: 'CS100002' });
    await targetRow.locator('button.btn-edit').click();

    const newTitle = 'Chính sách bảo hiểm hành trình 2026 - cập nhật';
    await policyAdminPage.fillForm({
      title: newTitle,
      content: 'Cập nhật lại nội dung chính sách chung...'
    });

    await policyAdminPage.saveForm();

    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Đã cập nhật chính sách thành công!');
    await policyAdminPage.closeAlert();
  });

  test('TXP_ADMIN_POLICY_TC_014: Happy Path - Cập nhật mốc hoàn tiền của Chính sách Hủy vé', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Tìm dòng CSHV100001 và click sửa
    const targetRow = policyAdminPage.tableRows.filter({ hasText: 'CSHV100001' });
    await targetRow.locator('button.btn-edit').click();

    // Sửa mốc từ 24 thành 48 và tỷ lệ từ 100 thành 80
    await policyAdminPage.fillMilestoneAt(0, 48, 80);

    await policyAdminPage.saveForm();

    await expect(policyAdminPage.customAlertOverlay).toBeVisible();
    await expect(policyAdminPage.customAlertMessage).toContainText('Đã cập nhật chính sách hủy vé thành công!');
    await policyAdminPage.closeAlert();
  });

  // ==========================================
  // TÌM KIẾM & BỘ LỌC (TC_016 -> TC_022)
  // ==========================================

  test('TXP_ADMIN_POLICY_TC_016: Happy Path - Tìm kiếm chính sách theo từ khóa Tiêu đề', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.searchPolicy('bảo hiểm');

    // Chỉ hiển thị các chính sách có chứa "bảo hiểm"
    const count = await policyAdminPage.tableRows.count();
    expect(count).toBe(1);
    await expect(policyAdminPage.firstRowTitleCell).toContainText('bảo hiểm');
  });

  test('TXP_ADMIN_POLICY_TC_017: Happy Path - Tìm kiếm chính sách theo Mã chính sách (ID)', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.searchPolicy('CS100002');

    const count = await policyAdminPage.tableRows.count();
    expect(count).toBe(1);
    await expect(policyAdminPage.firstRowIdCell).toContainText('CS100002');
  });

  test('TXP_ADMIN_POLICY_TC_018: Happy Path - Lọc danh sách theo loại Chính sách Bảo hiểm', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.filterByType('insurance');
    await policyAdminPage.searchBtn.click(); // Trigger tìm kiếm lọc

    // Chỉ hiển thị dòng bảo hiểm
    const rows = policyAdminPage.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(2)).toContainText('Chính sách bảo hiểm');
    }
  });

  test('TXP_ADMIN_POLICY_TC_019: Happy Path - Lọc danh sách theo tab Đang Áp dụng', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.activeTab.click();

    // Chờ UI cập nhật xong
    await expect(policyAdminPage.firstRowStatusCell).toContainText('Đang hiển thị');

    // Chỉ hiển thị dòng có status DangApDung
    const rows = policyAdminPage.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(4)).toContainText('Đang hiển thị');
    }
  });

  test('TXP_ADMIN_POLICY_TC_020: Happy Path - Lọc danh sách theo tab Vô hiệu hóa', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    await policyAdminPage.lockedTab.click();

    // Chờ UI cập nhật xong
    await expect(policyAdminPage.firstRowStatusCell).toContainText('Ngừng hiển thị');

    const rows = policyAdminPage.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(4)).toContainText('Ngừng hiển thị');
    }
  });

  test('TXP_ADMIN_POLICY_TC_021: Happy Path - Kết hợp lọc loại + tab trạng thái + từ khóa tìm kiếm', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // tab active
    await policyAdminPage.activeTab.click();
    // type insurance
    await policyAdminPage.filterByType('insurance');
    // search keyword
    await policyAdminPage.typeText(policyAdminPage.searchInput, 'auto');
    await policyAdminPage.searchBtn.click();

    // Mock không có chính sách nào chứa 'auto' đang hiển thị nên kết quả là no-data
    await expect(page.locator('.no-data')).toBeVisible();
  });

  test('TXP_ADMIN_POLICY_TC_022: Happy Path - Phân trang khi có nhiều hơn 10 chính sách', async ({ page, loginPage, policyAdminPage }) => {
    await loginAndNavigateToPolicies(page, loginPage);

    // Set page size = 5 để tạo phân trang (do mock data có 11 dòng tổng cộng)
    await policyAdminPage.pageSizeSelect.selectOption('5');

    // Trang 1
    await expect(policyAdminPage.tableRows).toHaveCount(5);

    // Click trang 2
    const page2Btn = policyAdminPage.pageButtons.filter({ hasText: '2' });
    await page2Btn.click();

    // Kiểm tra trang 2 hiển thị các dòng tiếp theo
    await expect(policyAdminPage.tableRows).toHaveCount(5);
  });
});
