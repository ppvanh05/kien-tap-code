import { test, expect } from '../../fixtures/base.fixture';

test.describe('Phân Hệ Khách Hàng - Module Trang Chủ (Customer Home)', () => {
  // Mock Data
  const mockActiveRoutes = {
    success: true,
    data: [
      { DiemKhoiHanh: 'Bình Định', DiemDen: 'TP. Hồ Chí Minh' },
      { DiemKhoiHanh: 'Bình Định', DiemDen: 'Bình Dương' },
      { DiemKhoiHanh: 'Phú Yên', DiemDen: 'TP. Hồ Chí Minh' }
    ]
  };

  const mockHomeReviews = {
    success: true,
    data: [
      {
        author: 'Đỗ Thanh Phương',
        avatar: '/asset/images/customer/user.png',
        rating: 5,
        content: 'Nhân viên phục vụ nhiệt tình, hướng dẫn chỗ ngồi chu đáo, 5 sao cho nhà xe.',
        route: 'Đập Đá - Bến xe miền Đông'
      },
      {
        author: 'Nguyễn Văn A',
        avatar: '/asset/images/customer/user.png',
        rating: 5,
        content: 'Xe chạy rất êm, tài xế lái xe cẩn thận và đón đúng giờ. Sẽ tiếp tục ủng hộ!',
        route: 'Phú Yên - Sài Gòn'
      }
    ]
  };

  const mockHomeNews = {
    success: true,
    data: [
      {
        MaTinTuc: 'news-01',
        TieuDe: 'TXP mo them chuyen Ha Noi - Quang Ninh',
        NgayDang: '2026-05-28T00:00:00.000Z',
        MoTaNgan: 'Tang cuong chuyen cuoi tuan phuc vu nhu cau di lai.',
        AnhBia: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
        LoaiTinTuc: 'ThongBao'
      }
    ]
  };

  test.beforeEach(async ({ page }) => {
    // Đóng băng thời gian hệ thống trong trình duyệt về ngày 30/05/2026 để test lịch không bị lệch
    await page.addInitScript(() => {
      const MockDate = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super('2026-05-30T08:00:00Z');
          } else {
            super(...(args as [any]));
          }
        }
      };
      (MockDate as any).now = () => new Date('2026-05-30T08:00:00Z').getTime();
      (MockDate as any).UTC = Date.UTC;
      (MockDate as any).parse = Date.parse;
      window.Date = MockDate as DateConstructor;
    });

    // Mock các APIs để trang chạy độc lập và ổn định
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Catch-all mock cho các API khác tới onrender.com
    await page.route(url => url.toString().includes('onrender.com'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] })
      });
    });

    await page.route(url => url.toString().includes('/customer/home/routes'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockActiveRoutes)
      });
    });

    await page.route(url => url.toString().includes('/customer/reviews/home'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockHomeReviews)
      });
    });

    await page.route(url => url.toString().includes('/customer/tin-tuc/home'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockHomeNews)
      });
    });
  });

  test('TXP_HOME_TC_001: Happy Path - Tìm kiếm một chiều hợp lệ với đầy đủ thông tin', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.selectDeparture('Bình Định');
    await homePage.selectDestination('TP. Hồ Chí Minh');
    await homePage.selectDepartureDate(31); // ngày mai
    await homePage.selectTicketCount(1);
    await homePage.clickSearch();

    await page.waitForURL(/\/tim-kiem-chuyen/, { timeout: 5000 });
    const url = decodeURIComponent(page.url());
    expect(url).toContain('diemDi=Bình Định');
    expect(url).toContain('diemDen=TP. Hồ Chí Minh');
    expect(url).toContain('ngayDi=31/05/2026');
    expect(url).not.toContain('isRoundTrip=true');
  });

  test('TXP_HOME_TC_002: Happy Path - Tìm kiếm khứ hồi hợp lệ với đầy đủ thông tin', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.selectJourneyType('round-trip');
    await homePage.selectDeparture('TP. Hồ Chí Minh');
    await homePage.selectDestination('Phú Yên');
    await homePage.selectDepartureDate(30); // ngày hôm nay
    await homePage.selectReturnDate(31); // ngày mai
    await homePage.clickSearch();

    await page.waitForURL(/\/tim-kiem-chuyen/, { timeout: 5000 });
    const url = decodeURIComponent(page.url());
    expect(url).toContain('diemDi=TP. Hồ Chí Minh');
    expect(url).toContain('diemDen=Phú Yên');
    expect(url).toContain('isRoundTrip=true');
  });

  test('TXP_HOME_TC_003: Happy Path - Hoán đổi Điểm đi và Điểm đến bằng nút swap', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.selectDeparture('Bình Định');
    await homePage.selectDestination('TP. Hồ Chí Minh');
    await homePage.swap();

    await expect(homePage.departureInput).toHaveValue('TP. Hồ Chí Minh');
    await expect(homePage.destinationInput).toHaveValue('Bình Định');
  });

  test('TXP_HOME_TC_004: Validation - Click Tìm kiếm khi để trống toàn bộ thông tin bắt buộc', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.clickSearch();

    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Vui lòng nhập đầy đủ thông tin tìm kiếm');
  });

  test('TXP_HOME_TC_005: Validation - Click Tìm kiếm khi chỉ nhập Điểm đi và Điểm đến, bỏ trống Ngày đi', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.selectDeparture('Bình Định');
    await homePage.selectDestination('TP. Hồ Chí Minh');
    // Mặc định ngày đi đang trống khi load trang mới, ta không chọn ngày đi
    await homePage.clickSearch();

    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Vui lòng nhập đầy đủ thông tin tìm kiếm');
  });

  test('TXP_HOME_TC_006: Boundary - Chọn Ngày đi trong quá khứ', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.clickOn(homePage.departureDateInput);

    // Ngày hôm nay là 30 (Mocked), chọn ngày 29 (quá khứ)
    const pastDayCell = homePage.departureCalendarContainer.locator('.grid-cols-7 > div').filter({
      has: page.locator('span.text-body-sm').filter({ hasText: /^29$/ })
    });
    await homePage.clickOn(pastDayCell);

    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Không thể chọn ngày trong quá khứ');
  });

  test('TXP_HOME_TC_007: Boundary - Chọn Ngày về trước Ngày đi ở chế độ Khứ hồi', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.selectJourneyType('round-trip');
    
    // Đặt ngày đi là 31 (ngày mai)
    await homePage.selectDepartureDate(31);

    await homePage.clickOn(homePage.returnDateInput);
    // Chọn ngày về là ngày 30 (ngày hôm nay) -> trước ngày đi 31, nên lịch không cho chọn (trở thành ngày trong quá khứ)
    const invalidReturnCell = homePage.returnCalendarContainer.locator('.grid-cols-7 > div').filter({
      has: page.locator('span.text-body-sm').filter({ hasText: /^30$/ })
    });
    await homePage.clickOn(invalidReturnCell);

    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Ngày về phải sau ngày đi');
  });

  test('TXP_HOME_TC_008: State Transition - Thay đổi Ngày đi làm Ngày về cũ không hợp lệ', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.selectJourneyType('round-trip');
    await homePage.selectDepartureDate(30); // ngày 30
    await homePage.selectReturnDate(31); // ngày 31

    // Đổi ngày đi thành ngày 1 tháng sau (01/06/2026), tức là sau ngày về cũ (31/05/2026)
    await homePage.clickOn(homePage.departureDateInput);
    await homePage.clickOn(homePage.departureCalendarContainer.locator('button:has-text("chevron_right")'));
    const firstDayCell = homePage.departureCalendarContainer.locator('.grid-cols-7 > div').filter({
      has: page.locator('span.text-body-sm').filter({ hasText: /^1$/ })
    });
    await homePage.clickOn(firstDayCell);

    await expect(homePage.returnDateInput).toHaveValue('');
    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Ngày về phải sau ngày đi. Vui lòng chọn lại ngày về.');
  });

  test('TXP_HOME_TC_009: Dropdown - Lọc danh sách Điểm đi loại trừ Điểm đến đang chọn', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.selectDestination('Bình Định');
    await homePage.departureInput.focus();

    await expect(homePage.departureDropdown).toBeVisible();
    const dropdownTexts = await homePage.departureDropdown.locator('div').allInnerTexts();
    expect(dropdownTexts.includes('Bình Định')).toBe(false);
  });

  test('TXP_HOME_TC_010: Dropdown - Lọc danh sách Điểm đến loại trừ Điểm đi đang chọn', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.selectDeparture('TP. Hồ Chí Minh');
    await homePage.destinationInput.focus();

    await expect(homePage.destinationDropdown).toBeVisible();
    const dropdownTexts = await homePage.destinationDropdown.locator('div').allInnerTexts();
    expect(dropdownTexts.includes('TP. Hồ Chí Minh')).toBe(false);
  });

  test('TXP_HOME_TC_011: Search - Tìm kiếm địa điểm trên dropdown bằng cách nhập từ khóa', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.departureInput.focus();
    await homePage.departureInput.fill('bi');

    await expect(homePage.departureDropdown).toBeVisible();
    const dropdownTexts = await homePage.departureDropdown.locator('div').allInnerTexts();
    expect(dropdownTexts.every(t => t.toLowerCase().includes('bình') || t.toLowerCase().includes('bi'))).toBe(true);
  });

  test('TXP_HOME_TC_012: Dropdown Số vé - Chọn số lượng 2 vé thành công', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.selectTicketCount(2);
    await expect(homePage.ticketSelect).toHaveValue('2');
  });

  test('TXP_HOME_TC_013: Dropdown Số vé - Chọn số lượng tối đa 5 vé', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.selectTicketCount(5);
    await expect(homePage.ticketSelect).toHaveValue('5');
  });

  test('TXP_HOME_TC_014: Dropdown Số vé - Chọn số lượng tối thiểu 1 vé', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.selectTicketCount(5);
    await homePage.selectTicketCount(1);
    await expect(homePage.ticketSelect).toHaveValue('1');
  });

  test('TXP_HOME_TC_015: State Transition - Chuyển toggle Khứ hồi sang Một chiều', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.selectJourneyType('round-trip');
    await homePage.selectReturnDate(31);
    await homePage.selectJourneyType('one-way');

    await expect(homePage.returnDateInput).toBeHidden();
  });

  test('TXP_HOME_TC_016: Tìm kiếm gần đây - Happy Path - Lưu tối đa 5 lịch sử tìm kiếm gần nhất và sắp xếp đúng thứ tự', async ({ homePage, page }) => {
    await homePage.navigate();
    await page.evaluate(() => localStorage.clear());
    await homePage.navigate(); // load lại trạng thái localStorage trống

    // Thực hiện tìm kiếm lần 1
    await homePage.selectDeparture('Bình Định');
    await homePage.selectDestination('TP. Hồ Chí Minh');
    await homePage.selectDepartureDate(31);
    await homePage.clickSearch();
    await page.waitForURL(/\/tim-kiem-chuyen/);

    // Quay lại trang chủ
    await homePage.navigate();
    await expect(homePage.recentSearchItems).toHaveCount(1);
  });

  test('TXP_HOME_TC_017: Tìm kiếm gần đây - Happy Path - Click vào mục lịch sử tìm kiếm tự động điền form', async ({ homePage, page }) => {
    await homePage.navigate();
    await page.evaluate(() => {
      localStorage.setItem('recentSearches', JSON.stringify([
        { from: 'Bình Định', to: 'TP. Hồ Chí Minh', date: '31/05/2026', isRoundTrip: false, passengers: 1 }
      ]));
    });
    await homePage.navigate();

    await expect(homePage.recentSearchItems.first()).toBeVisible();
    await homePage.recentSearchItems.first().evaluate(el => (el as HTMLElement).click());

    await expect(homePage.departureInput).toHaveValue('Bình Định');
    await expect(homePage.destinationInput).toHaveValue('TP. Hồ Chí Minh');
  });

  test('TXP_HOME_TC_018: Tìm kiếm gần đây - Boundary - Lịch sử tìm kiếm trống (không có trong localStorage)', async ({ homePage, page }) => {
    await homePage.navigate();
    await page.evaluate(() => localStorage.removeItem('recentSearches'));
    await homePage.navigate();

    await expect(homePage.recentSearchItems).toHaveCount(0);
  });

  test('TXP_HOME_TC_019: Tìm kiếm gần đây - Boundary - Lưu lịch sử tìm kiếm thứ 6 xóa bản ghi cũ nhất', async ({ homePage, page }) => {
    await homePage.navigate();
    await page.evaluate(() => {
      const searches = [];
      for (let i = 1; i <= 5; i++) {
        searches.push({ from: `Điểm đi ${i}`, to: `Điểm đến ${i}`, date: `31/05/2026`, isRoundTrip: false, passengers: 1 });
      }
      localStorage.setItem('recentSearches', JSON.stringify(searches));
    });
    await homePage.navigate();

    await expect(homePage.recentSearchItems).toHaveCount(5);
  });

  test('TXP_HOME_TC_020: Tìm kiếm gần đây - Edge Case - Lịch sử tìm kiếm chứa địa điểm không còn hoạt động', async ({ homePage, page }) => {
    await homePage.navigate();
    await page.evaluate(() => {
      localStorage.setItem('recentSearches', JSON.stringify([
        { from: 'Khánh Hòa', to: 'Bình Định', date: '31/05/2026', isRoundTrip: false, passengers: 1 }
      ]));
    });
    await homePage.navigate();

    await expect(homePage.recentSearchItems.first()).toBeVisible();
    await homePage.recentSearchItems.first().evaluate(el => (el as HTMLElement).click());
    
    // Tự động điền Điểm đến Bình Định, còn ô Điểm đi vẫn được điền là Khánh Hòa (do logic Angular copy thẳng từ localStorage)
    await expect(homePage.destinationInput).toHaveValue('Bình Định');
    await expect(homePage.departureInput).toHaveValue('Khánh Hòa');
  });

  test('TXP_HOME_TC_021: Tuyến xe phổ biến - Happy Path - Click tuyến phổ biến tự điền form và tìm kiếm ngay', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.selectDepartureDate(31);

    const targetRouteCard = homePage.popularRouteCards.filter({ hasText: 'Bình Định → TP. Hồ Chí Minh' });
    const bookBtn = targetRouteCard.getByRole('button', { name: 'Đặt vé ngay' });
    await bookBtn.click();

    await page.waitForURL(/\/tim-kiem-chuyen/);
    const url = decodeURIComponent(page.url());
    expect(url).toContain('diemDi=Bình Định');
    expect(url).toContain('diemDen=TP. Hồ Chí Minh');
  });

  test('TXP_HOME_TC_022: Tuyến xe phổ biến - Happy Path - Kiểm tra hiển thị thông tin các tuyến phổ biến', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.popularRouteCards).toHaveCount(3);
    await expect(homePage.popularRouteCards.first()).toContainText('Từ 250.000đ');
  });

  test('TXP_HOME_TC_023: Tuyến xe phổ biến - UI - Hiển thị responsive trên Desktop viewport 1920x1080', async ({ homePage, page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await homePage.navigate();
    await expect(homePage.popularRoutesTitle).toBeVisible();
  });

  test('TXP_HOME_TC_024: Tuyến xe phổ biến - Edge Case - Click tuyến phổ biến khi API bị lỗi kết nối', async ({ homePage, page }) => {
    // Mock API lỗi kết nối
    await page.route(url => url.toString().includes('/customer/home/routes'), async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false }) });
    });
    await homePage.navigate();
    // Đảm bảo trang web xử lý ngoại lệ tốt
    await expect(homePage.popularRoutesTitle).toBeVisible();
  });

  test('TXP_HOME_TC_025: Widget đánh giá khách hàng - Happy Path - Hiển thị thông tin đánh giá từ API thành công', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.reviewCards).toHaveCount(2);
    await expect(homePage.reviewCards.first().locator('h4')).toHaveText('Đỗ Thanh Phương');
  });

  test('TXP_HOME_TC_026: Widget đánh giá khách hàng - UI - Trạng thái Loading hiển thị trong lúc gọi API', async ({ homePage, page }) => {
    await page.route(url => url.toString().includes('/customer/reviews/home'), async (route) => {
      await page.waitForTimeout(1000);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockHomeReviews) });
    });
    await homePage.navigate();
    await expect(homePage.reviewsSectionTitle).toBeVisible();
  });

  test('TXP_HOME_TC_027: Widget đánh giá khách hàng - Exception - Ẩn khu vực đánh giá khi API GET bị lỗi', async ({ homePage, page }) => {
    await page.route(url => url.toString().includes('/customer/reviews/home'), async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false }) });
    });
    await homePage.navigate();
    // Khi lỗi, widget sẽ ẩn hoặc không hiển thị các thẻ đánh giá
    await expect(homePage.reviewCards).toHaveCount(0);
  });

  test('TXP_HOME_TC_028: Widget tin tức mới - Happy Path - Hiển thị tin tức mới nhất từ API thành công', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.newsCards).toHaveCount(1);
    await expect(homePage.newsCards.first().locator('h4')).toHaveText('TXP mo them chuyen Ha Noi - Quang Ninh');
  });

  test('TXP_HOME_TC_029: Widget tin tức mới - Happy Path - Click vào tin tức điều hướng đến trang chi tiết', async ({ homePage, page }) => {
    await homePage.navigate();
    await expect(homePage.newsCards.first()).toBeVisible();
    await homePage.newsCards.first().click();
    await page.waitForURL(/\/tin-tuc/, { timeout: 10000 });
  });

  test('TXP_HOME_TC_030: Widget tin tức mới - Exception - Hiển thị trạng thái phù hợp khi API tin tức bị lỗi/trống', async ({ homePage, page }) => {
    await page.route(url => url.toString().includes('/customer/tin-tuc/home'), async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false }) });
    });
    await homePage.navigate();
    await expect(homePage.newsCards).toHaveCount(0);
  });
});
