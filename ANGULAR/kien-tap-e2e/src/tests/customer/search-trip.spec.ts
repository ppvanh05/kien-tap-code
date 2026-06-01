import { test, expect } from '../../fixtures/base.fixture';

test.describe('Phân Hệ Khách Hàng - Module Tìm Kiếm & Chọn Cabin (Search Trip)', () => {
  // Mock Data cho chuyến xe Limousine 22 phòng hợp lệ theo thực tế (1A - 12A và 1B - 10B)
  const mockSeats = [];
  for (let i = 1; i <= 22; i++) {
    const seatName = i <= 12 ? `${i}A` : `${i - 12}B`;
    mockSeats.push({
      SoGhe: seatName,
      TangGhe: i <= 12 ? 1 : 2, // 1-12 tầng dưới, 13-22 tầng trên
      DayGhe: 'A',
      GiaVe: 240000,
      TrangThaiGhe: seatName === '2A' ? 'DaBan' : 'Trong' // cabin 2A đã bán
    });
  }

  const mockTrips = {
    success: true,
    data: [
      {
        maLichTrinh: 'trip-01',
        GioKhoiHanh: '2026-05-31T12:00:00.000Z',
        GioDenDuKien: '2026-05-31T23:00:00.000Z',
        GiaVeCoBan: 240000,
        soGheTrong: 21,
        diemKhoiHanh: 'Đập Đá',
        diemDen: 'Bến xe Miền Đông',
        tuyenXe: {
          MaTuyenXe: 'tuyen-01',
          DiemKhoiHanh: 'Đập Đá',
          DiemDen: 'Bến xe Miền Đông',
          KhoangCach: 650,
          MienGio: 'Asia/Ho_Chi_Minh'
        },
        seats: mockSeats
      }
    ]
  };

  const mockTripDetail = {
    success: true,
    data: {
      maLichTrinh: 'trip-01',
      diemDungLichTrinh: [
        { TenDiem: 'Bến xe Quy Nhơn', DiaChi: 'Quy Nhơn, Bình Định', GhiChu: 'Điểm xuất phát' },
        { TenDiem: 'Bến xe Miền Đông', DiaChi: 'Bình Thạnh, TP. HCM', GhiChu: 'Điểm trả khách' }
      ],
      gheChuyenXe: mockSeats
    }
  };

  test.beforeEach(async ({ page }) => {
    // Đóng băng thời gian hệ thống trong trình duyệt về ngày 30/05/2026
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

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Catch-all mock API tới onrender.com
    await page.route(url => url.toString().includes('onrender.com'), async (route) => {
      const u = route.request().url();
      if (u.includes('/customer/tim-kiem-chuyen-xe/search')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(mockTrips)
        });
      } else if (u.includes('/customer/tim-kiem-chuyen-xe/detail/trip-01')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(mockTripDetail)
        });
      } else if (u.includes('/customer/home/routes')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: [{ DiemKhoiHanh: 'Đập Đá', DiemDen: 'Bến xe Miền Đông' }]
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({ success: true, data: [] })
        });
      }
    });
  });

  test('TXP_SEARCH_TC_001: Happy Path - Tìm kiếm chuyến một chiều hợp lệ thành công', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectDeparture('Đập Đá');
    await searchTripPage.selectDestination('Bến xe Miền Đông');
    await searchTripPage.selectDepartureDate(31);
    await searchTripPage.selectTicketCount(2);
    await searchTripPage.clickSearch();

    await page.waitForURL(/\/tim-kiem-chuyen/);
    const url = decodeURIComponent(page.url());
    expect(url).toContain('diemDi=Đập Đá');
    expect(url).toContain('diemDen=Bến xe Miền Đông');
    expect(url).toContain('ngayDi=31/05/2026');
    expect(url).toContain('passengers=2');
  });

  test('TXP_SEARCH_TC_002: Happy Path - Tìm kiếm chuyến khứ hồi hợp lệ thành công', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectJourneyType('round-trip');
    await searchTripPage.selectDeparture('Bến xe Miền Đông');
    await searchTripPage.selectDestination('Đập Đá');
    await searchTripPage.selectDepartureDate(31);
    await searchTripPage.selectReturnDate(3); // 03/06/2026
    await searchTripPage.clickSearch();

    await page.waitForURL(/\/tim-kiem-chuyen/);
    const url = decodeURIComponent(page.url());
    expect(url).toContain('isRoundTrip=true');
    expect(url).toContain('ngayVe=03/06/2026');
  });

  test.skip('TXP_SEARCH_TC_003: Alternate Path - Click nút hoán đổi swap vị trí Điểm đi và Điểm đến', async ({ searchTripPage }) => {
    // BUG: Nút swap (sync_alt) không thay đổi giá trị input Điểm đi và Điểm đến trên UI
    // Đã xác nhận Failed - bỏ qua theo yêu cầu
    await searchTripPage.navigate();
    await searchTripPage.selectDeparture('Đập Đá');
    await searchTripPage.selectDestination('Bến xe Miền Đông');
    await searchTripPage.swap();

    await expect(searchTripPage.departureInput).toHaveValue('Bến xe Miền Đông');
    await expect(searchTripPage.destinationInput).toHaveValue('Đập Đá');
  });

  test('TXP_SEARCH_TC_004: Alternate Path - Click chọn Một chiều ẩn trường Ngày về', async ({ searchTripPage }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectJourneyType('round-trip');
    await searchTripPage.selectReturnDate(31);
    await searchTripPage.selectJourneyType('one-way');

    await expect(searchTripPage.returnDateInput).toBeHidden();
  });

  test('TXP_SEARCH_TC_005: Negative - Chọn Ngày đi trong quá khứ', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await searchTripPage.clickOn(searchTripPage.departureDateInput);
    await page.waitForTimeout(500);

    // Inspect DOM: ngày quá khứ là generic không có [cursor=pointer]
    // Ngày tương lai có [cursor=pointer], ngày quá khứ không có
    // Cấu trúc: generic > generic(ngày-tuan) + generic(ngày-thang)
    // Ngày quá khứ không có cursor-pointer nên không thể click
    // Đưa ra assert: calendar container hiển thị và ngày 30 (hôm nay) là ngày đầu tiên có thể chọn
    const calendarPopup = searchTripPage.departureCalendarContainer.locator('.absolute.z-50, [class*="absolute"]').filter({ has: page.locator('button:has-text("chevron_right")') }).first();
    // Verify: calendar đã mở
    await expect(calendarPopup).toBeVisible({ timeout: 5000 });

    // Ngày quá khứ (29) hiển thị trong calendar nhưng không có cursor=pointer => không click được
    // Ngày tương lai (31) có cursor=pointer => có thể click
    const pastDayCell = searchTripPage.departureCalendarContainer
      .locator('.absolute.z-50 .cursor-not-allowed')
      .filter({ has: page.locator(':last-child').filter({ hasText: /^29$/ }) })
      .first();
    await expect(pastDayCell).toBeVisible({ timeout: 5000 });
    await pastDayCell.click();

    // Toast message tồn tại trong DOM (hidden) trước khi click
    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Không thể chọn ngày trong quá khứ');
  });

  test('TXP_SEARCH_TC_006: Negative - Chọn Ngày về trước Ngày đi ở chế độ Khứ hồi', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectJourneyType('round-trip');
    await searchTripPage.selectDepartureDate(31); // 31/05

    await searchTripPage.clickOn(searchTripPage.returnDateInput);
    await page.waitForTimeout(300);

    // Chọn ngày 30/05 (trước ngày 31/05 - so sánh với span con thứ 2)
    const invalidReturnCell = searchTripPage.returnCalendarContainer.locator('.absolute.z-50 .cursor-pointer, .absolute.z-50 [cursor=pointer]')
      .filter({ has: page.locator(':last-child').filter({ hasText: /^30$/ }) }).first();
    await searchTripPage.clickOn(invalidReturnCell);

    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Ngày về phải sau ngày đi');
  });

  test('TXP_SEARCH_TC_007: Validation - Điểm đi và Điểm đến trùng nhau', async ({ searchTripPage }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectDeparture('Đập Đá');
    await searchTripPage.destinationInput.focus();

    await expect(searchTripPage.destinationDropdown).toBeVisible();
    const dropdownTexts = await searchTripPage.destinationDropdown.locator('div').allInnerTexts();
    expect(dropdownTexts.includes('Đập Đá')).toBe(false);
  });

  test('TXP_SEARCH_TC_008: Validation - Bấm Tìm kiếm khi bỏ trống thông tin bắt buộc', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await page.evaluate(() => localStorage.clear());
    await searchTripPage.navigate();
    await searchTripPage.clearForm();
    await searchTripPage.clickSearch();

    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Vui lòng nhập đủ Điểm đi, Điểm đến và Ngày đi');
  });

  test('TXP_SEARCH_TC_009: Đặt cabin & Dịch vụ - Happy Path - Chọn cabin trống ở tầng dưới chuyển sang trạng thái đang chọn', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=2');
    
    await searchTripPage.selectTrip();

    // Chọn cabin 3A (Tầng dưới)
    await searchTripPage.selectCabin('3A');
    await expect(searchTripPage.selectCabinBtn('3A')).toHaveClass(/bg-secondary/); // Chuyển màu cam của bg-secondary
  });

  test('TXP_SEARCH_TC_010: Đặt cabin & Dịch vụ - Happy Path - Chọn cabin trống ở tầng trên chuyển sang trạng thái đang chọn', async ({ searchTripPage }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=2');
    
    await searchTripPage.selectTrip();

    // Chọn cabin 3B (Tầng trên)
    await searchTripPage.selectCabin('3B');
    await expect(searchTripPage.selectCabinBtn('3B')).toHaveClass(/bg-secondary/);
  });

  test('TXP_SEARCH_TC_011: Đặt cabin & Dịch vụ - Happy Path - Chọn phòng đơn giữ nguyên giá vé gốc của lịch trình', async ({ searchTripPage }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    
    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');

    // Mặc định là Phòng đơn, tổng tiền phải giữ nguyên 240.000đ
    await expect(searchTripPage.totalPriceText).toContainText('240.000đ');
  });

  test('TXP_SEARCH_TC_012: Đặt cabin & Dịch vụ - Happy Path - Chọn phòng đôi cộng phụ thu 200.000đ vào tổng tiền', async ({ searchTripPage }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    
    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');
    await searchTripPage.selectGuestType('3A', '2'); // Phòng đôi (2 khách)

    // Giá gốc 240.000 + 200.000 = 440.000đ
    await expect(searchTripPage.totalPriceText).toContainText('440.000đ');
  });

  test('TXP_SEARCH_TC_013: Đặt cabin & Dịch vụ - Happy Path - Xác nhận ghế lưu thông tin tạm thời chuyển sang màn hình tiếp theo', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    
    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');
    await searchTripPage.confirmSeats();

    // Điều hướng đến trang thông tin đặt vé/thanh toán
    await page.waitForURL(/\/thong-tin-don-hang/, { timeout: 10000 });
  });

  test('TXP_SEARCH_TC_014: Đặt cabin & Dịch vụ - Boundary - Chặn chọn thêm khi đã đủ 5 cabin trong cùng trip', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=5');

    await searchTripPage.selectTrip();

    // Chọn lần lượt 5 cabin available (1A, 3A, 4A, 5A, 6A)
    await searchTripPage.selectCabin('1A');
    await searchTripPage.selectCabin('3A');
    await searchTripPage.selectCabin('4A');
    await searchTripPage.selectCabin('5A');
    await searchTripPage.selectCabin('6A');

    // Thử chọn cabin thứ 6
    await searchTripPage.selectCabin('7A');

    // Toast warning xuất hiện khi vượt quá 5 ghế
    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast).toContainText('tối đa 5 ghế');

    // Cabin thứ 6 vẫn không được chọn (không có class bg-secondary)
    await expect(searchTripPage.selectCabinBtn('7A')).not.toHaveClass(/bg-secondary/);
  });

  test('TXP_SEARCH_TC_015: Đặt cabin & Dịch vụ - Negative - Click chọn cabin đã bán (DaBan) không có phản hồi', async ({ searchTripPage }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    
    await searchTripPage.selectTrip();
    
    // Cabin 2A đã bán: button có disabled attribute + class cursor-not-allowed
    // Button text có khoảng trắng xung quanh (" 2A ") nên dùng hasText với regex hoặc trim
    const soldBtn = searchTripPage.page
      .locator('button.cursor-not-allowed[disabled]')
      .filter({ hasText: /2A/ });
    await expect(soldBtn).toBeDisabled({ timeout: 10000 });
    // Cabin không thể click (cursor-not-allowed)
    await expect(soldBtn).toHaveClass(/cursor-not-allowed/);
  });

  test('TXP_SEARCH_TC_016: Boundary - Chọn ngày đi vừa chạm biên ngày hiện tại (Hôm nay)', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectDeparture('Đập Đá');
    await searchTripPage.selectDestination('Bến xe Miền Đông');
    await searchTripPage.selectDepartureDate(30); // Hôm nay (Mocked 30/05)
    await searchTripPage.clickSearch();

    await page.waitForURL(/\/tim-kiem-chuyen/);
    const url = decodeURIComponent(page.url());
    expect(url).toContain('ngayDi=30/05/2026');
  });

  test('TXP_SEARCH_TC_017: Boundary - Chọn số lượng vé ở biên tối thiểu (1 vé)', async ({ searchTripPage }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectTicketCount(1);
    // Select value là "1" (số), option text hiển thị "1 vé"
    await expect(searchTripPage.ticketSelect).toHaveValue('1');
  });

  test('TXP_SEARCH_TC_018: Boundary - Chọn số lượng vé ở biên tối đa (5 vé)', async ({ searchTripPage }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectTicketCount(5);
    // Select value là "5" (số), option text hiển thị "5 vé"
    await expect(searchTripPage.ticketSelect).toHaveValue('5');
  });

  test('TXP_SEARCH_TC_019: Tìm kiếm chuyến chạy - Happy Path - Lưu tối đa 5 lượt tìm kiếm gần nhất vào localStorage', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await page.evaluate(() => localStorage.clear());
    await searchTripPage.navigate();

    await searchTripPage.selectDeparture('Đập Đá');
    await searchTripPage.selectDestination('Bến xe Miền Đông');
    await searchTripPage.selectDepartureDate(31);
    await searchTripPage.clickSearch();
    await page.waitForURL(/\/tim-kiem-chuyen/);

    await searchTripPage.navigate();
    const stored = await page.evaluate(() => localStorage.getItem('recentSearches'));
    const parsed = JSON.parse(stored || '[]');
    expect(parsed.length).toBe(1);
  });

  test('TXP_SEARCH_TC_020: Tìm kiếm chuyến chạy - Edge Case - Tìm kiếm khi API không phản hồi', async ({ searchTripPage, page }) => {
    // Giả lập lỗi API 500
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/search'), async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false })
      });
    });

    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    await expect(searchTripPage.emptyState).toBeVisible();
  });

  test('TXP_SEARCH_TC_021: Đặt cabin & Dịch vụ - Current Behavior - Số vé tìm kiếm không giới hạn số ghế được chọn', async ({ searchTripPage }) => {
    // Tìm với passengers=2 nhưng frontend cho phép chọn đến 3 cabin (không bị chặn)
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=2');

    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');
    await searchTripPage.selectCabin('4A');
    await searchTripPage.selectCabin('5A'); // Cabin thứ 3 — vượt passengers=2

    // Current Behavior / Gap: Frontend KHÔNG chặn chọn cabin thứ 3
    await expect(searchTripPage.selectCabinBtn('5A')).toHaveClass(/bg-secondary/);
  });


  test('TXP_SEARCH_TC_023: Đặt cabin & Dịch vụ - State Transition - Hủy chọn cabin đang chọn trả về trạng thái trống', async ({ searchTripPage }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=2');
    
    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');
    await expect(searchTripPage.selectCabinBtn('3A')).toHaveClass(/bg-secondary/);

    // Hủy chọn
    await searchTripPage.selectCabin('3A');
    await expect(searchTripPage.selectCabinBtn('3A')).not.toHaveClass(/bg-secondary/);
  });

  test('TXP_SEARCH_TC_024: Boundary - Thay đổi Ngày đi khiến Ngày về đã chọn trước đó trở thành nhỏ hơn ngày đi mới', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectJourneyType('round-trip');
    await searchTripPage.selectDepartureDate(30); // ngày 30
    await searchTripPage.selectReturnDate(31); // ngày 31

    // Đổi ngày đi thành 01/06 (June 1st), tức là sau ngày về cũ (31/05)
    await searchTripPage.clickOn(searchTripPage.departureDateInput);
    await searchTripPage.clickOn(searchTripPage.departureCalendarContainer.locator('button:has-text("chevron_right")'));
    await page.waitForTimeout(300);
    
    const firstDayCell = searchTripPage.departureCalendarContainer.locator('.absolute.z-50 .cursor-pointer, .absolute.z-50 [cursor=pointer]')
      .filter({ has: page.locator(':last-child').filter({ hasText: /^1$/ }) }).first();
    await searchTripPage.clickOn(firstDayCell);

    await expect(searchTripPage.returnDateInput).toHaveValue('');
    const toast = page.locator('.animate-slide-in').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Ngày về phải sau ngày đi. Vui lòng chọn lại ngày về.');
  });

  test('TXP_SEARCH_TC_025: Current Behavior - Dropdown địa điểm không hỗ trợ tìm kiếm không dấu', async ({ searchTripPage }) => {
    // Tài liệu hóa gap: gõ "dap da" (không dấu) không hiển thị "Đập Đá" trong dropdown
    await searchTripPage.navigate();
    await searchTripPage.departureInput.focus();
    await searchTripPage.departureInput.fill('dap da'); // Gõ không dấu

    await searchTripPage.page.waitForTimeout(500);

    // Dropdown không mở hoặc không có item khớp → Current Behavior Gap
    const isVisible = await searchTripPage.departureDropdown.isVisible().catch(() => false);
    if (isVisible) {
      const items = await searchTripPage.departureDropdown.locator('div').allInnerTexts();
      // Confirm: Không có địa điểm "Đập Đá" khi gõ không dấu
      expect(items.join('')).not.toContain('Đập Đá');
    } else {
      // Dropdown không hiển thị = không có gợi ý → Behavior Gap confirmed
      expect(isVisible).toBe(false);
    }
  });

  test('TXP_SEARCH_TC_026: Đặt cabin & Dịch vụ - Happy Path - Chỉ thực hiện giữ chỗ (hold-seats) khi chuyển sang màn thanh toán', async ({ searchTripPage, page }) => {
    // Chỉ giữ chỗ khi vào luồng thanh toán, luồng Chọn ghế chưa gọi API hold-seats
    const holdRequests: string[] = [];
    await page.route(
      url => url.toString().includes('/hold-seats') || url.toString().includes('/reserve'),
      async (route) => {
        holdRequests.push(route.request().url());
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      }
    );

    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');
    await searchTripPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/, { timeout: 10000 });

    // Khẳng định đúng: Luồng Chọn ghế chưa gọi API hold-seats (chỉ gọi khi tiến hành thanh toán)
    expect(holdRequests.length).toBe(0);
  });


  test('TXP_SEARCH_TC_027: UI - Hiển thị sơ đồ xe trên Desktop viewport 1920x1080', async ({ searchTripPage, page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    await searchTripPage.selectTrip();

    // Verify cả 2 tầng và cabin từ mỗi tầng hiển thị trên Desktop viewport
    await expect(page.locator('p.uppercase:has-text("Tầng dưới")').first()).toBeVisible();
    await expect(page.locator('p.uppercase:has-text("Tầng trên")').first()).toBeVisible();
    await expect(searchTripPage.selectCabinBtn('1A')).toBeVisible();
    await expect(searchTripPage.selectCabinBtn('1B')).toBeVisible();
  });

  test('TXP_SEARCH_TC_028: UI - Hiển thị sơ đồ xe trên Mobile viewport 375x812', async ({ searchTripPage, page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');
    await searchTripPage.selectTrip();

    // Verify tầng dưới và cabin hiển thị được trên mobile viewport
    await expect(page.locator('p.uppercase:has-text("Tầng dưới")').first()).toBeVisible();
    await expect(searchTripPage.selectCabinBtn('1A')).toBeVisible();
  });

  test('TXP_SEARCH_TC_029: Đặt cabin & Dịch vụ - Decision Table - Cấu hình 2 cabin trong đó 1 phòng đơn và 1 phòng đôi', async ({ searchTripPage }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=2');
    
    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');
    await searchTripPage.selectCabin('4A');

    await searchTripPage.selectGuestType('3A', '1'); // Phòng đơn (240.000)
    await searchTripPage.selectGuestType('4A', '2'); // Phòng đôi (440.000)

    // Tổng: 240.000 + 440.000 = 680.000đ
    await expect(searchTripPage.totalPriceText).toContainText('680.000đ');
  });

  test('TXP_SEARCH_TC_030: Boundary - Chọn ngày đi xa tương lai (ví dụ: sau 6 tháng)', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate();
    await searchTripPage.selectDeparture('Đập Đá');
    await searchTripPage.selectDestination('Bến xe Miền Đông');

    // Chuyển lịch sang 6 tháng sau
    await searchTripPage.clickOn(searchTripPage.departureDateInput);
    for (let i = 0; i < 6; i++) {
      await searchTripPage.clickOn(searchTripPage.departureCalendarContainer.locator('button:has-text("chevron_right")'));
      await page.waitForTimeout(300);
    }

    // Chọn ngày 30 tháng đó
    const futureDayCell = searchTripPage.departureCalendarContainer.locator('.absolute.z-50 .cursor-pointer, .absolute.z-50 [cursor=pointer]')
      .filter({ has: page.locator(':last-child').filter({ hasText: /^30$/ }) }).first();
    await searchTripPage.clickOn(futureDayCell);
    await searchTripPage.clickSearch();

    await page.waitForURL(/\/tim-kiem-chuyen/);
    const url = decodeURIComponent(page.url());
    expect(url).toContain('ngayDi=30/');
  });

  test('TXP_SEARCH_TC_031: UI - Chưa chọn cabin thì nút Chọn ghế không hiển thị ở cuối panel sơ đồ ghế', async ({ searchTripPage }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');

    await searchTripPage.selectTrip();

    // Chưa chọn cabin nào → nút "Chọn ghế" màu cam cuối panel KHÔNG hiển thị (*ngIf ẩn)
    await expect(searchTripPage.confirmSeatsBtn).toBeHidden();
  });

  test('TXP_SEARCH_TC_032: State Transition - Collapse trip card hoàn tác cabin đã chọn chưa xác nhận', async ({ searchTripPage, page }) => {
    await searchTripPage.navigate('?diemDi=Đập Đá&diemDen=Bến xe Miền Đông&ngayDi=31/05/2026&isRoundTrip=false&passengers=1');

    // Mở trip card và chọn cabin
    await searchTripPage.selectTrip();
    await searchTripPage.selectCabin('3A');
    await expect(searchTripPage.selectCabinBtn('3A')).toHaveClass(/bg-secondary/);

    // Collapse trip card bằng cách click vào vùng header (p-6.cursor-pointer)
    const tripCardHeader = page.locator('.p-6.cursor-pointer').first();
    await searchTripPage.clickOn(tripCardHeader);
    await page.waitForTimeout(400);

    // Mở lại trip card
    await searchTripPage.selectTrip();

    // Cabin phải trở về trạng thái available (selection bị reset khi collapse)
    await expect(searchTripPage.selectCabinBtn('3A')).not.toHaveClass(/bg-secondary/);
  });
});
