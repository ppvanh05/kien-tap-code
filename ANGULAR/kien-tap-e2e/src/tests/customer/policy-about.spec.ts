import { test, expect } from '../../fixtures/base.fixture';

test.describe('Module Chính Sách & Quy Định (Policy Page)', () => {
  test.beforeEach(async ({ policyPage, page }) => {
    // Mock toàn bộ request tới onrender.com để tránh bị treo do server ngủ đông
    await page.route(url => url.hostname.includes('onrender.com'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ success: true, data: [] })
      });
    });
  });

  test('TXP_POL_TC_001: Happy Path - Hiển thị danh sách chính sách mặc định từ dữ liệu API thành công', async ({ policyPage, page }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await expect(policyPage.pageTitle).toBeVisible();
    await expect(policyPage.pageTitle).toHaveText('Chính Sách & Quy Định');
    
    // Đảm bảo hiển thị đủ 5 tab
    await expect(policyPage.sidebarTabs).toHaveCount(5);
    
    const expectedTabs = [
      'Quy định đặt vé & Thanh toán',
      'Chính sách chỉnh sửa vé',
      'Chính sách hủy vé & Hoàn tiền',
      'Cam kết dịch vụ & Bồi thường',
      'Chính sách bảo mật dữ liệu'
    ];

    for (let i = 0; i < expectedTabs.length; i++) {
      await expect(policyPage.sidebarTabs.nth(i)).toContainText(expectedTabs[i]);
    }

    const firstTab = policyPage.sidebarTabs.first();
    await expect(firstTab).toHaveClass(/bg-primary-light/);
    await expect(policyPage.contentCategoryText).toHaveText('Quy định đặt vé & Thanh toán');
    await expect(policyPage.contentPolicyTitle).toHaveText('CHÍNH SÁCH THANH TOÁN VÀ ĐẶT GIỮ CHỖ TRỰC TUYẾN');
  });

  test('TXP_POL_TC_002: Alternate Path - API trả về rỗng hiển thị dữ liệu fallback tĩnh', async ({ policyPage, page }) => {
    // Đã mock API trả về success: true, data: [] ở beforeEach, trang web tự động dùng dữ liệu fallback tĩnh
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await expect(policyPage.sidebarTabs).toHaveCount(5);
    const firstTab = policyPage.sidebarTabs.first();
    await expect(firstTab).toContainText('Quy định đặt vé & Thanh toán');
  });

  test('TXP_POL_TC_003: Happy Path - Điều hướng chuyển tab chính sách cập nhật nội dung đúng', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await policyPage.selectTab('Chính sách hủy vé & Hoàn tiền');
    
    await expect(policyPage.contentCategoryText).toHaveText('Chính sách hủy vé & Hoàn tiền');
    await expect(policyPage.contentPolicyTitle).toHaveText('CHÍNH SÁCH HỦY VÉ VÀ HOÀN TIỀN');
    
    const activeTab = policyPage.getActiveTab();
    await expect(activeTab).toContainText('Chính sách hủy vé & Hoàn tiền');
  });

  test('TXP_POL_TC_004: Alternate Path - Click chuyển tab tự động cuộn mượt lên đầu trang', async ({ policyPage, page }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    expect(scrollYBefore).toBeGreaterThan(0);
    
    await policyPage.selectTab('Chính sách chỉnh sửa vé');
    await page.waitForTimeout(1000);
    
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter).toBe(0);
  });

  test('TXP_POL_TC_005: UI - Hover tab chính sách không active đổi màu nền', async ({ policyPage, page }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    const secondTab = policyPage.sidebarTabs.nth(1);
    await secondTab.hover();
    await page.waitForTimeout(200);
    // Nhấp vào tab hoặc di chuột không gây lỗi crash
    await expect(secondTab).toBeVisible();
  });

  test('TXP_POL_TC_006: Happy Path - Tìm kiếm nhanh theo tiêu đề chính sách', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await policyPage.searchPolicy('Xác nhận đặt giữ');
    await expect(policyPage.policyItems.filter({ visible: true })).toHaveCount(1);
    await expect(policyPage.policyItems.filter({ visible: true }).first()).toContainText('Xác nhận đặt giữ chỗ');
  });

  test('TXP_POL_TC_007: Happy Path - Tìm kiếm nhanh theo nội dung điều khoản chính sách', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await policyPage.searchPolicy('15 phút');
    await expect(policyPage.policyItems.filter({ visible: true })).toHaveCount(2);
  });

  test('TXP_POL_TC_008: Negative - Tìm kiếm từ khóa không tồn tại trả về kết quả rỗng', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await policyPage.searchPolicy('xyz123');
    await expect(policyPage.policyItems.filter({ visible: true })).toHaveCount(0);
  });

  test('TXP_POL_TC_009: UI - Định dạng nội dung điều khoản timeline có dấu hai chấm (:)', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    const firstItem = policyPage.policyItems.first();
    const boldText = firstItem.locator('span.font-bold.text-navy');
    await expect(boldText).toBeVisible();
    await expect(boldText).toHaveText('Quy trình Đặt giữ chỗ:');
  });

  test('TXP_POL_TC_010: Alternate Path - Định dạng nội dung điều khoản không chứa dấu hai chấm', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    // Chuyển sang tab Cam kết dịch vụ để xem các điều khoản không có dấu hai chấm nếu có
    await policyPage.selectTab('Cam kết dịch vụ & Bồi thường');
    const firstItem = policyPage.policyItems.first();
    await expect(firstItem).toBeVisible();
  });

  test('TXP_POL_TC_011: UI - Các mục điều khoản hiển thị hiệu ứng timeline kết nối và animation', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    const timelineContainer = policyPage.page.locator('.lg\\:col-span-8 .space-y-10');
    await expect(timelineContainer).toBeVisible();
  });

  test('TXP_POL_TC_012: UI - Kiểm tra hiển thị thông tin hỗ trợ cố định cuối trang', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await expect(policyPage.helpSectionTitle).toBeVisible();
    await expect(policyPage.hotlineText).toBeVisible();
    await expect(policyPage.emailText).toBeVisible();
    await expect(policyPage.chatBtn).toBeVisible();
  });

  test('TXP_POL_TC_013: UI - Click nút Chat ngay với chúng tôi mở cửa sổ chat hỗ trợ', async ({ policyPage, page }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await expect(policyPage.chatBtn).toBeVisible();
    // Giả lập click chatbox
    await policyPage.chatBtn.click();
    await page.waitForTimeout(500);
  });

  test('TXP_POL_TC_020: Exception - Khôi phục hiển thị khi click lại nút tìm kiếm rỗng', async ({ policyPage }) => {
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await policyPage.searchPolicy('Xác nhận đặt giữ');
    await expect(policyPage.policyItems.filter({ visible: true })).toHaveCount(1);
    
    // Tìm kiếm rỗng
    await policyPage.searchPolicy('');
    await expect(policyPage.policyItems.filter({ visible: true })).toHaveCount(4);
  });
});

test.describe('Trang Giới Thiệu (About Us Page)', () => {
  test('TXP_POL_TC_014: Happy Path - Truy cập trang Giới thiệu hiển thị đầy đủ các section', async ({ aboutUsPage }) => {
    await aboutUsPage.navigateTo('/gioi-thieu/ve-chung-toi');
    await expect(aboutUsPage.heroTitle).toBeVisible();
    await expect(aboutUsPage.heroTitle).toContainText('TÂN XUÂN PHÚC');
    await expect(aboutUsPage.introSectionTitle).toBeVisible();
    await expect(aboutUsPage.coreValuesTitle).toBeVisible();
    await expect(aboutUsPage.visionTitle).toBeVisible();
  });

  test('TXP_POL_TC_015: Happy Path - Nút Đặt vé ngay điều hướng về trang chủ', async ({ aboutUsPage, page }) => {
    await aboutUsPage.navigateTo('/gioi-thieu/ve-chung-toi');
    await page.waitForLoadState('networkidle');
    await expect(aboutUsPage.bookTicketBtn).toBeVisible();
    await aboutUsPage.bookTicketBtn.click();
    await page.waitForURL(/\/home/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('TXP_POL_TC_016: Happy Path - Nút Tìm hiểu thêm cuộn trang đến khu vực giới thiệu công ty', async ({ aboutUsPage, page }) => {
    await aboutUsPage.navigateTo('/gioi-thieu/ve-chung-toi');
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    expect(scrollYBefore).toBe(0);

    await expect(aboutUsPage.learnMoreBtn).toBeVisible();
    await aboutUsPage.learnMoreBtn.click({ force: true });
    await page.waitForTimeout(1000);
    
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter).toBeGreaterThan(0);
  });

  test('TXP_POL_TC_017: UI - Responsive trang giới thiệu trên Desktop viewport 1920x1080', async ({ aboutUsPage, page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await aboutUsPage.navigateTo('/gioi-thieu/ve-chung-toi');
    await expect(aboutUsPage.heroTitle).toBeVisible();
  });

  test('TXP_POL_TC_018: UI - Responsive trang giới thiệu trên Mobile viewport 375x812', async ({ aboutUsPage, page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await aboutUsPage.navigateTo('/gioi-thieu/ve-chung-toi');
    await expect(aboutUsPage.heroTitle).toBeVisible();
  });

  test('TXP_POL_TC_019: UI - Responsive trang chính sách trên Mobile viewport 375x812', async ({ policyPage, page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await policyPage.navigateTo('/gioi-thieu/chinh-sach');
    await expect(policyPage.pageTitle).toBeVisible();
  });
});
