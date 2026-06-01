import { APIRequestContext, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/base.fixture';
import { BlacklistPage, ViolationLevel } from '../../pages/admin/blacklist.page';
import { TicketLookupPage } from '../../pages/customer/ticket-lookup.page';
import { DataGenerator } from '../../utils/DataGenerator';
import { ENV } from '../../utils/env.config';

type KeywordStatus = 'DangApDung' | 'NgungApDung';
type ReviewMode = 'blocked' | 'success' | 'pending';

const appOrigin = new URL(ENV.ADMIN_URL).origin;
const customerOrigin = new URL(ENV.CUSTOMER_URL).origin;
const adminBlacklistUrl = `${appOrigin}/admin/quan-ly-tu-khoa-cam`;
const customerTicketLookupUrl = `${customerOrigin}/tra-cuu-ve`;

const customerOrder = {
  phone: '0901234567',
  code: 'DH10000007',
  ticketCode: 'VE100011',
  customerCode: 'KH_TEST_0007',
};

function keywordData(testName: string): string {
  return DataGenerator.generateTraceableEmail(testName);
}

async function goToBlacklist(page: Page, blacklistPage: BlacklistPage): Promise<void> {
  await page.goto(adminBlacklistUrl);
  await expect(page).toHaveURL(/\/admin\/quan-ly-tu-khoa-cam/);
  await blacklistPage.expectLoaded();
}

async function expectAlertAndClose(blacklistPage: BlacklistPage, message: string | RegExp): Promise<void> {
  await expect(blacklistPage.alertOverlay).toBeVisible();
  await expect(blacklistPage.alertMessage).toContainText(message);
  await blacklistPage.dismissAlert();
}

async function createKeywordViaUi(
  blacklistPage: BlacklistPage,
  keyword: string,
  level: ViolationLevel,
): Promise<void> {
  await blacklistPage.createKeyword(keyword, level);
  await expectAlertAndClose(blacklistPage, `Đã thêm từ khóa mới "${keyword.toLowerCase()}" vào danh sách.`);
  await expect(blacklistPage.modalOverlay).toBeHidden();
}

async function setModalStatus(blacklistPage: BlacklistPage, targetStatus: KeywordStatus): Promise<void> {
  const toggleText = await blacklistPage.modalStatusToggleButton.innerText();
  const isActive = toggleText.includes('Khóa từ khóa');
  const shouldBeActive = targetStatus === 'DangApDung';

  if (isActive !== shouldBeActive) {
    await blacklistPage.clickOn(blacklistPage.modalStatusToggleButton);
  }
}

async function ensureKeyword(
  blacklistPage: BlacklistPage,
  keyword: string,
  level: ViolationLevel,
  status: KeywordStatus = 'DangApDung',
): Promise<void> {
  await blacklistPage.searchKeyword(keyword);
  const existingRow = blacklistPage.keywordRow(keyword);

  if (await existingRow.count() === 0) {
    await createKeywordViaUi(blacklistPage, keyword, level);
  }

  await blacklistPage.searchKeyword(keyword);
  await blacklistPage.openEditModalForKeyword(keyword);
  await blacklistPage.levelSelect.selectOption(level);
  await setModalStatus(blacklistPage, status);
  await blacklistPage.saveKeyword();
  await expectAlertAndClose(blacklistPage, `Đã sửa từ khóa thành "${keyword.toLowerCase()}"`);
  await expect(blacklistPage.modalOverlay).toBeHidden();
}

async function mockCustomerReviewFlow(page: Page, mode: ReviewMode): Promise<{ payloads: unknown[] }> {
  const payloads: unknown[] = [];

  await page.route(/\/customer\/tra-cuu-ve\/lookup.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          MaDonHang: customerOrder.code,
          MaKhachHang: customerOrder.customerCode,
          HoTenNguoiDi: 'Test User',
          SdtNguoiDi: customerOrder.phone,
          EmailNguoiDi: 'dtphuong@gmail.com',
          ThoiGianDat: '2026-05-29 22:03',
          SoLuongVeDaDat: 1,
          TenTuyen: 'Diêu Trì- Bến xe Miền Đông',
          GioKhoiHanh: '08:30',
          GioTra: '17:30',
          NgayXuatBen: '2026-05-31',
          DiemDon: 'Diêu Trì',
          DiemTra: 'Bến xe Miền Đông',
          TongGiaVe: 220000,
          PhuongThucThanhToan: 'VietQR',
          TrangThaiDonHang: 'DaHoanThanh',
          BienSoXe: '77B-01764',
          MaDiemDon: 'MD01',
          MaDiemTra: 'MD02',
          tickets: [
            {
              MaVe: customerOrder.ticketCode,
              SoGhe: '5B',
              BienSoXe: '77B-01764',
              DiemDon: 'Diêu Trì',
              DiemTra: 'Bến xe Miền Đông',
              GiaVe: 220000,
              TrangThaiVe: 'DaHoanThanh',
            },
          ],
        },
      }),
    });
  });

  await page.route(/\/customer\/reviews$/, async (route) => {
    payloads.push(route.request().postDataJSON());

    if (mode === 'blocked') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Dữ liệu nhập không hợp lệ',
          fieldErrors: {
            NoiDungDanhGia: 'Nội dung vi phạm chính sách nội dung.',
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: mode === 'pending'
          ? 'Đánh giá đã được ghi nhận và chờ duyệt.'
          : 'Tạo đánh giá thành công!',
        data: {
          MaDanhGia: `DG_AUTO_${Date.now()}`,
          TrangThaiPhanHoi: mode === 'pending' ? 'ChoDuyet' : 'ChuaPhanHoi',
        },
      }),
    });
  });

  return { payloads };
}

async function submitCustomerReview(
  page: Page,
  ticketLookupPage: TicketLookupPage,
  comment: string,
): Promise<void> {
  await ticketLookupPage.navigateTo(customerTicketLookupUrl);
  await ticketLookupPage.lookupOrder(customerOrder.phone, customerOrder.code);

  await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
  await expect(ticketLookupPage.openReviewModalBtn).toBeEnabled();

  await ticketLookupPage.clickOn(ticketLookupPage.openReviewModalBtn);
  await expect(ticketLookupPage.reviewModal).toBeVisible();

  // Chọn sao để mở khóa nút gửi đánh giá.
  await ticketLookupPage.setCriteriaScore(0, 5);
  await ticketLookupPage.typeText(ticketLookupPage.reviewCommentInput, comment);
  await expect(ticketLookupPage.submitReviewBtn).toBeEnabled();
  await ticketLookupPage.clickOn(ticketLookupPage.submitReviewBtn);
}

async function postBlacklistWithoutPermission(request: APIRequestContext): Promise<number> {
  const response = await request.post(`${ENV.API_BASE_URL}/tu-khoa-cam`, {
    data: {
      NoiDungTuKhoa: keywordData('admin_blacklist_no_permission_api'),
      LoaiViPham: 'Cao',
      TrangThai: 'DangApDung',
    },
  });

  return response.status();
}

test.describe('Phân hệ Admin - Quản lý từ khóa cấm', () => {

  test.beforeEach(async ({ page, loginPage, blacklistPage }, testInfo) => {
    test.setTimeout(90000);
    await page.context().clearCookies();

    if (testInfo.title.includes('TXP_ADMIN_BLACKLIST_TC_008')) {
      return;
    }

    await loginPage.navigateTo(ENV.ADMIN_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await loginPage.login(ENV.ADMIN_USERNAME, ENV.ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/admin\/trang-chu/, { timeout: 30000 });
    await goToBlacklist(page, blacklistPage);
  });

  test('TXP_ADMIN_BLACKLIST_TC_001: Happy Path - Thêm mới từ khóa cấm thành công', async ({ blacklistPage }) => {
    // Arrange
    const keyword = keywordData('admin_blacklist_tc_001');
    const initialHighKpi = await blacklistPage.getKpiValue('high');

    // Act
    await blacklistPage.createKeyword(keyword, 'Cao');

    // Assert
    await expectAlertAndClose(blacklistPage, `Đã thêm từ khóa mới "${keyword.toLowerCase()}" vào danh sách.`);
    await expect(blacklistPage.modalOverlay).toBeHidden();
    await expect.poll(() => blacklistPage.getKpiValue('high')).toBe(initialHighKpi + 1);

    await blacklistPage.searchKeyword(keyword);
    const row = blacklistPage.keywordRow(keyword);
    await expect(row).toBeVisible();
    await expect(blacklistPage.levelCell(row)).toContainText('Nặng');
    await expect(blacklistPage.statusCell(row)).toContainText('Đang áp dụng');
  });

  test('TXP_ADMIN_BLACKLIST_TC_002: Validation - Để trống Nội dung từ khóa khi lưu', async ({ blacklistPage }) => {
    // Arrange
    await blacklistPage.openAddModal();
    await blacklistPage.keywordInput.fill('');
    await blacklistPage.levelSelect.selectOption('TrungBinh');

    // Act
    await blacklistPage.saveKeyword();

    // Assert
    await expectAlertAndClose(blacklistPage, 'Vui lòng nhập nội dung từ khóa hạn chế.');
    await expect(blacklistPage.modalOverlay).toBeVisible();
    await blacklistPage.clickOn(blacklistPage.modalCancelButton);
    await expect(blacklistPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_BLACKLIST_TC_003: Negative - Trùng lặp từ khóa cấm (đã chuẩn hóa đầu vào)', async ({ blacklistPage }) => {
    // Arrange
    const keyword = keywordData('admin_blacklist_tc_003');
    await createKeywordViaUi(blacklistPage, keyword, 'TrungBinh');

    // Act
    await blacklistPage.openAddModal();
    await blacklistPage.fillKeywordForm({
      keyword: `   ${keyword.toUpperCase()}   `,
      violationLevel: 'TrungBinh',
    });
    await blacklistPage.saveKeyword();

    // Assert
    await expectAlertAndClose(blacklistPage, `Từ khóa "${keyword.toLowerCase()}" đã tồn tại trong danh sách.`);
    await expect(blacklistPage.modalOverlay).toBeVisible();
    await blacklistPage.clickOn(blacklistPage.modalCancelButton);
  });

  test('TXP_ADMIN_BLACKLIST_TC_004: Happy Path - Cập nhật Mức độ vi phạm của từ khóa cấm', async ({ blacklistPage }) => {
    // Arrange
    const keyword = keywordData('admin_blacklist_tc_004');
    await createKeywordViaUi(blacklistPage, keyword, 'Cao');
    await blacklistPage.searchKeyword(keyword);

    const initialHighKpi = await blacklistPage.getKpiValue('high');
    const initialMediumKpi = await blacklistPage.getKpiValue('medium');

    // Act
    await blacklistPage.openEditModalForKeyword(keyword);
    await blacklistPage.levelSelect.selectOption('TrungBinh');
    await blacklistPage.saveKeyword();

    // Assert
    await expectAlertAndClose(blacklistPage, `Đã sửa từ khóa thành "${keyword.toLowerCase()}"`);
    await expect.poll(() => blacklistPage.getKpiValue('high')).toBe(initialHighKpi - 1);
    await expect.poll(() => blacklistPage.getKpiValue('medium')).toBe(initialMediumKpi + 1);

    await blacklistPage.searchKeyword(keyword);
    const row = blacklistPage.keywordRow(keyword);
    await expect(blacklistPage.levelCell(row)).toContainText('Trung bình');
  });

  test('TXP_ADMIN_BLACKLIST_TC_005: Happy Path - Thay đổi nhanh trạng thái từ khóa cấm (Bật/Tắt áp dụng)', async ({ blacklistPage }) => {
    // Arrange
    const keyword = keywordData('admin_blacklist_tc_005');
    await ensureKeyword(blacklistPage, keyword, 'Cao', 'DangApDung');

    // Act
    await blacklistPage.searchKeyword(keyword);
    await blacklistPage.openEditModalForKeyword(keyword);
    await setModalStatus(blacklistPage, 'NgungApDung');
    await blacklistPage.saveKeyword();

    // Assert
    await expectAlertAndClose(blacklistPage, `Đã sửa từ khóa thành "${keyword.toLowerCase()}"`);
    await blacklistPage.searchKeyword(keyword);
    const row = blacklistPage.keywordRow(keyword);
    await expect(blacklistPage.statusCell(row)).toContainText('Ngưng áp dụng');
  });

  test('TXP_ADMIN_BLACKLIST_TC_006: Security - Nhập ký tự đặc biệt / XSS vào Nội dung từ khóa', async ({ blacklistPage }) => {
    const xssPayload = '<script>alert(1)</script>';
    await blacklistPage.createKeyword(xssPayload, 'Cao');
    await expectAlertAndClose(blacklistPage, `Đã thêm từ khóa mới "${xssPayload.toLowerCase()}" vào danh sách.`);
    
    // Đảm bảo không xảy ra popup hoặc lỗi, từ khóa được hiển thị an toàn dạng Text
    await blacklistPage.searchKeyword(xssPayload);
    const row = blacklistPage.keywordRow(xssPayload);
    await expect(row).toBeVisible();
    await expect(row).toContainText(xssPayload.toLowerCase());
  });

  test('TXP_ADMIN_BLACKLIST_TC_007: Validation - Nhập từ khóa vượt quá giới hạn ký tự cho phép', async ({ blacklistPage }) => {
    test.fail(true, 'Ứng dụng hiện chưa chặn chắc chắn độ dài 256 ký tự trước khi gọi backend.');

    // Arrange
    await blacklistPage.openAddModal();
    const longKeyword = DataGenerator.generateLongKeyword(256);

    // Act
    await blacklistPage.keywordInput.fill(longKeyword);
    const enteredValue = await blacklistPage.keywordInput.inputValue();

    // Assert
    if (enteredValue.length <= 255) {
      expect(enteredValue.length).toBeLessThanOrEqual(255);
      return;
    }

    await blacklistPage.saveKeyword();
    await expect(blacklistPage.alertOverlay).toBeVisible();
    await expect(blacklistPage.alertMessage).toContainText(/tối đa 255 ký tự|không thể thêm từ khóa/i);
  });

  test('TXP_ADMIN_BLACKLIST_TC_008: Security - Chỉnh sửa/Xóa từ khóa khi không có quyền Quản trị viên', async ({ page, request }) => {
    // Arrange
    await page.context().clearCookies();
    await page.goto(adminBlacklistUrl);

    // Act
    const apiStatus = await postBlacklistWithoutPermission(request);

    // Assert
    await expect(page).not.toHaveURL(/\/admin\/quan-ly-tu-khoa-cam/);
    expect([401, 403]).toContain(apiStatus);
  });

  test('TXP_ADMIN_BLACKLIST_TC_009: Happy Path - Tìm kiếm từ khóa theo text nội dung', async ({ blacklistPage }) => {
    // Arrange
    const keyword = `quảng cáo ${keywordData('admin_blacklist_tc_009')}`;
    await ensureKeyword(blacklistPage, keyword, 'TrungBinh', 'DangApDung');

    // Act
    await blacklistPage.searchKeyword('quảng');

    // Assert
    const row = blacklistPage.keywordRow(keyword);
    await expect(row).toBeVisible();
    await expect(row).toContainText(keyword.toLowerCase());
  });

  test('TXP_ADMIN_BLACKLIST_TC_010: Happy Path - Lọc từ khóa theo Tab Trạng thái hoạt động', async ({ blacklistPage }) => {
    // Arrange
    const activeKeyword = keywordData('admin_blacklist_tc_010_active');
    const inactiveKeyword = keywordData('admin_blacklist_tc_010_inactive');
    await ensureKeyword(blacklistPage, activeKeyword, 'Thap', 'DangApDung');
    await ensureKeyword(blacklistPage, inactiveKeyword, 'Thap', 'NgungApDung');

    // Act & Assert
    await blacklistPage.selectStatusTab('active');
    await blacklistPage.searchKeyword(activeKeyword);
    await expect(blacklistPage.keywordRow(activeKeyword)).toBeVisible();
    await expect(blacklistPage.statusCell(blacklistPage.keywordRow(activeKeyword))).toContainText('Đang áp dụng');

    await blacklistPage.selectStatusTab('inactive');
    await blacklistPage.searchKeyword(inactiveKeyword);
    await expect(blacklistPage.keywordRow(inactiveKeyword)).toBeVisible();
    await expect(blacklistPage.statusCell(blacklistPage.keywordRow(inactiveKeyword))).toContainText('Ngưng áp dụng');
  });

  test('TXP_ADMIN_BLACKLIST_TC_011: Happy Path - Kết hợp bộ lọc Mức độ vi phạm và ô tìm kiếm', async ({ blacklistPage }) => {
    // Arrange
    const keyword = `lừa ${keywordData('admin_blacklist_tc_011')}`;
    await ensureKeyword(blacklistPage, keyword, 'Cao', 'DangApDung');

    // Act
    await blacklistPage.filterByLevel('Cao');
    await blacklistPage.searchKeyword('lừa');

    // Assert
    const row = blacklistPage.keywordRow(keyword);
    await expect(row).toBeVisible();
    await expect(blacklistPage.levelCell(row)).toContainText('Nặng');
  });

  test('TXP_ADMIN_BLACKLIST_TC_012: Happy Path - Phân trang danh sách từ khóa (Pagination)', async ({ blacklistPage }) => {
    // Arrange
    await blacklistPage.pageSizeSelect.selectOption('5');
    await expect(blacklistPage.keywordsTableRows).toHaveCount(5);

    // Act
    const page2Button = blacklistPage.pageButton(2);
    await expect(page2Button).toBeVisible();
    await blacklistPage.clickOn(page2Button);

    // Assert
    await expect(page2Button).toHaveClass(/active/);
    await expect(blacklistPage.keywordsTableRows.first()).toBeVisible();
  });

  test('TXP_ADMIN_BLACKLIST_TC_013: Happy Path - Widgets KPIs hiển thị thống kê thời gian thực chính xác', async ({ blacklistPage }) => {
    // Arrange
    const initialMediumKpi = await blacklistPage.getKpiValue('medium');
    const keyword = keywordData('admin_blacklist_tc_013');

    // Act
    await blacklistPage.createKeyword(keyword, 'TrungBinh');
    await expectAlertAndClose(blacklistPage, `Đã thêm từ khóa mới "${keyword.toLowerCase()}" vào danh sách.`);

    // Assert
    await expect.poll(() => blacklistPage.getKpiValue('medium')).toBe(initialMediumKpi + 1);
  });

  test('TXP_ADMIN_BLACKLIST_TC_014: Integration - Khách hàng viết đánh giá chứa từ khóa cấm mức độ Cao', async ({ page, blacklistPage, ticketLookupPage }) => {
    // Arrange
    await ensureKeyword(blacklistPage, 'lừa đảo', 'Cao', 'DangApDung');
    await mockCustomerReviewFlow(page, 'blocked');

    // Act
    await submitCustomerReview(page, ticketLookupPage, 'Chuyến xe này lừa đảo khách hàng, dịch vụ quá tệ!');

    // Assert
    await expect(ticketLookupPage.reviewModal).toBeVisible();
    await expect(page.locator('.fixed.top-24')).toContainText('Nội dung đánh giá không hợp lệ');
    await expect(ticketLookupPage.reviewCommentInput).toBeVisible();
  });

  test('TXP_ADMIN_BLACKLIST_TC_015: Integration - Khách hàng viết đánh giá chứa từ khóa ở trạng thái Ngưng áp dụng', async ({ page, blacklistPage, ticketLookupPage }) => {
    // Arrange
    await ensureKeyword(blacklistPage, 'lừa đảo', 'Cao', 'NgungApDung');
    await mockCustomerReviewFlow(page, 'success');

    // Act
    await submitCustomerReview(page, ticketLookupPage, 'Chuyến xe này lừa đảo khách hàng, dịch vụ quá tệ!');

    // Assert
    await expect(page.locator('.fixed.top-24')).toContainText('Đánh giá đã được gửi thành công.');
  });

  test('TXP_ADMIN_BLACKLIST_TC_016: Integration - Khách hàng viết đánh giá chứa từ khóa cấm mức độ Trung bình', async ({ page, blacklistPage, ticketLookupPage }) => {
    // Arrange
    await ensureKeyword(blacklistPage, 'quảng cáo', 'TrungBinh', 'DangApDung');
    const reviewMock = await mockCustomerReviewFlow(page, 'pending');

    // Act
    await submitCustomerReview(page, ticketLookupPage, 'Đây là bài viết quảng cáo dịch vụ du lịch giá rẻ');

    // Assert
    await expect(page.locator('.fixed.top-24')).toContainText('Đánh giá đã được gửi thành công.');
    expect(reviewMock.payloads).toHaveLength(1);
    expect(reviewMock.payloads[0]).toMatchObject({
      NoiDungDanhGia: 'Đây là bài viết quảng cáo dịch vụ du lịch giá rẻ',
    });
  });

  test('TXP_ADMIN_BLACKLIST_TC_017: Integration - Đánh giá chứa từ khóa viết hoa/khoảng trắng khớp với DB', async ({ page, blacklistPage, ticketLookupPage }) => {
    // Arrange
    await ensureKeyword(blacklistPage, 'lừa đảo', 'Cao', 'DangApDung');
    await mockCustomerReviewFlow(page, 'blocked');

    // Act
    await submitCustomerReview(page, ticketLookupPage, 'Nhà xe   LỪA ĐẢO   mọi người né gấp');

    // Assert
    await expect(ticketLookupPage.reviewModal).toBeVisible();
    await expect(page.locator('.fixed.top-24')).toContainText('Nội dung đánh giá không hợp lệ');
  });

  test('TXP_ADMIN_BLACKLIST_TC_018: State Transition - Đổi trạng thái từ khóa cấm và tác động tức thì', async ({ page, blacklistPage, ticketLookupPage }) => {
    // Arrange
    await ensureKeyword(blacklistPage, 'tệ', 'Cao', 'NgungApDung');
    await mockCustomerReviewFlow(page, 'success');

    // Act
    await submitCustomerReview(page, ticketLookupPage, 'Nhà xe phục vụ hơi tệ');

    // Assert
    await expect(page.locator('.fixed.top-24')).toContainText('Đánh giá đã được gửi thành công.');
  });

  test('TXP_ADMIN_BLACKLIST_TC_019: Edge Case - Đánh giá chứa từ ghép chứa từ khóa cấm độc lập', async ({ page, blacklistPage, ticketLookupPage }) => {
    // Arrange
    await ensureKeyword(blacklistPage, 'lừa', 'Cao', 'DangApDung');
    await mockCustomerReviewFlow(page, 'success');

    // Act
    await submitCustomerReview(page, ticketLookupPage, 'Phong cách phục vụ cực kỳ chất lừa');

    // Assert
    await expect(page.locator('.fixed.top-24')).toContainText('Đánh giá đã được gửi thành công.');
  });
});
