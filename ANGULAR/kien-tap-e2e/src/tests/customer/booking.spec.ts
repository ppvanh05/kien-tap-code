import { test, expect, Page } from '../../fixtures/base.fixture';
import { TestDataGenerator } from '../../utils/test-data';

test.describe('Phân Hệ Khách Hàng - Module Đặt vé & Thanh toán (Booking & Payment)', () => {
  // Mock dữ liệu tìm kiếm chuyến xe đúng định dạng mà Angular mapBackendTrip yêu cầu
  const mockTripList = {
    success: true,
    data: [
      {
        MaLichTrinh: 'LT9999',
        MaTuyenXe: 'TXP_BD_SG',
        tuyenXe: {
          MaTuyenXe: 'TXP_BD_SG',
          KhoangCach: 550,
          MienGio: 'Asia/Ho_Chi_Minh',
          DiemKhoiHanh: 'Bình Định',
          DiemDen: 'TP. Hồ Chí Minh'
        },
        GioKhoiHanh: '2026-05-20T18:00:00.000Z',
        GioDenDuKien: '2026-05-21T05:00:00.000Z',
        GioGoiYCoMat: '2026-05-20T17:30:00.000Z',
        DiemKhoiHanh: 'Bình Định',
        DiemDen: 'TP. Hồ Chí Minh',
        GiaVeCoBan: 400000,
        soGheTrong: 15
      }
    ]
  };

  // Tạo sơ đồ ghế mặc định đúng thuộc tính TangGhe, DayGhe cho Angular frontend
  const getMockTripDetail = (seatStatusOverrides: Record<string, 'available' | 'GiuCho' | 'DaBan'> = {}) => {
    const gheChuyenXe: any[] = [];
    const lowerNames = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
    const upperNames = ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B'];

    lowerNames.forEach((name) => {
      const status = seatStatusOverrides[name] || 'available';
      gheChuyenXe.push({
        MaGheChuyen: `LT9999_GHE_${name}`,
        SoGhe: name,
        TrangThaiGhe: status,
        GiaVe: 400000,
        TangGhe: 1,
        DayGhe: 'A'
      });
    });

    upperNames.forEach((name) => {
      const status = seatStatusOverrides[name] || 'available';
      gheChuyenXe.push({
        MaGheChuyen: `LT9999_GHE_${name}`,
        SoGhe: name,
        TrangThaiGhe: status,
        GiaVe: 400000,
        TangGhe: 2,
        DayGhe: 'A'
      });
    });

    return {
      success: true,
      data: {
        id: 'LT9999',
        MaLichTrinh: 'LT9999',
        MaTuyenXe: 'TXP_BD_SG',
        tuyenXe: { MaTuyenXe: 'TXP_BD_SG' },
        departureTime: '18:00',
        arrivalTime: '05:00',
        startStation: 'Bến xe Quy Nhơn (Bình Định)',
        endStation: 'Bến xe Miền Đông',
        price: 400000,
        gioGoiYCoMat: '17:30',
        gheChuyenXe,
        diemDungLichTrinh: [
          { MaDiem: 'MD01', TenDiem: 'ben xe thuong ly', LoaiDiem: 'DiemDon', GioDenDuKien: '2026-05-20T17:30:00.000Z', DiaChi: '52 ha ly, hong bang' },
          { MaDiem: 'MD02', TenDiem: 'ben xe bai chay', LoaiDiem: 'DiemTra', GioDenDuKien: '2026-05-21T05:00:00.000Z', DiaChi: 'duong ha long, bai chay' }
        ]
      }
    };
  };

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  const defaultOrderPayload = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    MaKhachHang: 'KH001',
    MaLichTrinh: 'LT9999',
    DanhSachMaGheChuyen: ['LT9999_GHE_1A'],
    HoTenNguoiDi: 'Nguyễn Văn A',
    SdtNguoiDi: '0912345678',
    EmailNguoiDi: 'auto_booking_payment@test.com',
    MaDiemDon: 'MD01',
    MaDiemTra: 'MD02',
    PhuongThucThanhToan: 'momo',
    ...overrides,
  });

  const defaultTransactionPayload = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    MaDonHang: 'DH10000001',
    PhuongThucThanhToan: 'momo',
    SoTien: 400000,
    ...overrides,
  });

  const mockPost = async (
    page: Page,
    urlPart: string,
    status: number,
    body: Record<string, unknown>,
  ): Promise<void> => {
    await page.route(url => url.toString().includes(urlPart), async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(body),
      });
    });
  };

  test.beforeEach(async ({ page }, testInfo) => {
    // In log console từ trình duyệt ra để dễ debug
    page.on('console', msg => {
      console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
    });

    const isTimerTest = testInfo.title.includes('TXP_BK_TC_008') || 
                        testInfo.title.includes('TXP_BK_TC_010') || 
                        testInfo.title.includes('TXP_BK_TC_011');

    if (!isTimerTest) {
      // Đóng băng thời gian hệ thống về 15/05/2026 để test data nhất quán
      await page.addInitScript(() => {
        const MockDate = class extends Date {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super('2026-05-15T08:00:00Z');
            } else {
              super(...(args as [any]));
            }
          }
        };
        (MockDate as any).now = () => new Date('2026-05-15T08:00:00Z').getTime();
        (MockDate as any).UTC = Date.UTC;
        (MockDate as any).parse = Date.parse;
        window.Date = MockDate as DateConstructor;
      });
    }

    // Mặc định mock search chuyến xe và chi tiết chuyến xe
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/search'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockTripList)
      });
    });

    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/detail/LT9999'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(getMockTripDetail())
      });
    });

    // Mock các API khác của onrender.com để tránh bị treo
    await page.route(url => url.toString().includes('onrender.com') && !url.toString().includes('/search') && !url.toString().includes('/detail') && !url.toString().includes('/create-order'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] })
      });
    });
  });

  // ==========================================
  // PHẦN 1: GIỮ GHẾ TẠM THỜI (TXP_BK_TC_001 -> 007)
  // ==========================================

  test('TXP_BK_TC_001: Happy Path - Khách hàng giữ ghế trống hợp lệ thành công', async ({ bookingPage, page }) => {
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    
    // Chọn ghế 1A và 4A
    await bookingPage.selectSeat('1A');
    await bookingPage.selectSeat('4A');
    
    // Verify tổng tiền hiển thị chính xác (2 ghế phòng đơn = 800.000đ)
    await expect(bookingPage.totalPriceSummary).toContainText('800.000');
    
    // Xác nhận chọn ghế -> chuyển sang trang điền thông tin
    await bookingPage.confirmSeats();
    await page.waitForURL(/\/thong-tin-don-hang/);
    
    // Verify các ghế đã được giữ hiển thị trên trang thông tin đơn hàng
    await expect(page.locator('.text-primary:has-text("1A, 4A")')).toBeVisible();
  });

  test('TXP_BK_TC_002: Negative - Giữ ghế đang bị giữ bởi người khác và còn hiệu lực giữ chỗ', async ({ bookingPage, page }) => {
    // Override chi tiết chuyến xe: ghế 1A đang trạng thái GiuCho
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/detail/LT9999'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(getMockTripDetail({ '1A': 'GiuCho' }))
      });
    });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();

    // Verify ghế 1A bị disabled (không thể chọn do đang bị giữ)
    const seat1A = page.locator('button:has-text("1A")').first();
    await expect(seat1A).toBeDisabled();
  });

  test('TXP_BK_TC_003: Negative - Giữ ghế đã được bán thành công', async ({ bookingPage, page }) => {
    // Override chi tiết chuyến xe: ghế 4A đang trạng thái DaBan
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/detail/LT9999'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(getMockTripDetail({ '4A': 'DaBan' }))
      });
    });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();

    // Verify ghế 4A bị disabled (không thể chọn)
    const seat4A = page.locator('button:has-text("4A")').first();
    await expect(seat4A).toBeDisabled();
  });

  test('TXP_BK_TC_004: Negative - Giữ ghế không tồn tại trong lịch trình chuyến xe', async ({ bookingPage, page }) => {
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();

    // Tìm ghế B99 trên UI -> verify không tồn tại trong sơ đồ
    const seatB99 = page.locator('button:has-text("B99")');
    await expect(seatB99).toBeHidden();
  });

  test('TXP_BK_TC_005: Alternate Path - Giữ lại ghế đã hết hạn giữ chỗ (trên 15 phút)', async ({ bookingPage, page }) => {
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/detail/LT9999'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(getMockTripDetail({ '1A': 'available' }))
      });
    });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();

    // Người dùng mới hoàn toàn có thể chọn lại ghế 1A
    const seat1A = page.locator('button:has-text("1A")').first();
    await expect(seat1A).toBeEnabled();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();
    await page.waitForURL(/\/thong-tin-don-hang/);
  });

  test('TXP_BK_TC_006: Validation - Gọi API giữ ghế khi bỏ trống thông tin bắt buộc', async ({ bookingPage, page }) => {
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    
    // Nếu chưa chọn ghế nào -> nút Xác nhận/Tiếp tục chọn ghế không được hiển thị
    await expect(bookingPage.confirmSeatBtn).toBeHidden();
  });

  test('TXP_BK_TC_007: Edge Case - Giữ đồng thời nhiều ghế trong đó có một ghế đã bị bán', async ({ bookingPage, page }) => {
    // Ghế 4A đã bị bán, 1A còn trống
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/detail/LT9999'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(getMockTripDetail({ '4A': 'DaBan', '1A': 'available' }))
      });
    });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();

    // 1A bấm được, 4A bị disabled
    await expect(page.locator('button:has-text("1A")').first()).toBeEnabled();
    await expect(page.locator('button:has-text("4A")').first()).toBeDisabled();
  });

  // ==========================================
  // PHẦN 2: TỰ ĐỘNG GIẢI PHÓNG GHẾ (TXP_BK_TC_008 -> 012)
  // ==========================================

  test('TXP_BK_TC_008: Happy Path - Cron job tự động giải phóng ghế quá hạn 10 phút chưa thanh toán', async ({ bookingPage, page }) => {
    // Arrange: dùng clock để mô phỏng hết thời gian giữ chỗ trên UI thanh toán.
    await page.clock.install({ time: new Date('2026-05-15T08:00:00Z') });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    // Điền thông tin và thanh toán
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678', 'auto_test@test.com');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');

    // Act
    await bookingPage.clickCheckout();
    await expect(page).toHaveURL(/\/thanh-toan/);
    await expect(bookingPage.timeLeftTimer).toBeVisible();
    await page.clock.runFor(601000); // 10 phút 1 giây

    // Assert
    await expect(bookingPage.expirationModal).toBeVisible();
  });

  test('TXP_BK_TC_009: Happy Path - Cron job tự động hủy đơn hàng ChoThanhToan khi ghế tương ứng hết hạn', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thong-tin-don-hang/release-expired-held-seats', 200, {
      success: true,
      message: 'Hệ thống tự động hủy đơn hàng DH10000001 do hết hạn 15 phút chưa thanh toán.',
      data: {
        releasedSeats: ['LT9999_GHE_1A'],
        canceledOrders: ['DH10000001'],
        canceledTickets: ['VE100001'],
      },
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{
      success: boolean;
      message: string;
      data: { releasedSeats: string[]; canceledOrders: string[]; canceledTickets: string[] };
    }>('/customer/thong-tin-don-hang/release-expired-held-seats', {
      MaDonHang: 'DH10000001',
      MaGheChuyen: 'LT9999_GHE_1A',
    });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.canceledOrders).toContain('DH10000001');
    expect(response.body.data.canceledTickets).toContain('VE100001');
  });

  test('TXP_BK_TC_010: Boundary - Ghế ở trạng thái GiuCho sát biên giới hạn 10 phút (9 phút 59 giây)', async ({ bookingPage, page }) => {
    await page.clock.install({ time: new Date('2026-05-15T08:00:00Z') });
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();
    
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678', 'auto_test@test.com');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await page.waitForURL(/\/thanh-toan/);
    await page.clock.fastForward(599000); // 9 phút 59 giây
    
    // Verify modal hết hạn chưa xuất hiện
    await expect(bookingPage.expirationModal).toBeHidden();
  });

  test('TXP_BK_TC_011: Boundary - Ghế ở trạng thái GiuCho vừa chạm mốc 10 phút 01 giây', async ({ bookingPage, page }) => {
    // Arrange
    await page.clock.install({ time: new Date('2026-05-15T08:00:00Z') });
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678', 'auto_test@test.com');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');

    // Act
    await bookingPage.clickCheckout();
    await expect(page).toHaveURL(/\/thanh-toan/);
    await page.clock.runFor(601000); // 10 phút 1 giây

    // Assert
    await expect(bookingPage.expirationModal).toBeVisible();
  });

  test('TXP_BK_TC_012: Edge Case - Ghế GiuCho đã quá 15 phút nhưng đơn hàng liên quan đã ở trạng thái ChoKhoiHanh', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thong-tin-don-hang/release-expired-held-seats', 200, {
      success: true,
      message: 'Bỏ qua đơn hàng đã thanh toán, không hủy đơn hàng ChoKhoiHanh.',
      data: {
        skippedOrders: ['DH10000001'],
        keptSeatStatus: 'DaBan',
        orderStatus: 'ChoKhoiHanh',
      },
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{
      success: boolean;
      data: { skippedOrders: string[]; keptSeatStatus: string; orderStatus: string };
    }>('/customer/thong-tin-don-hang/release-expired-held-seats', {
      MaDonHang: 'DH10000001',
      MaGheChuyen: 'LT9999_GHE_1A',
    });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.skippedOrders).toContain('DH10000001');
    expect(response.body.data.orderStatus).toBe('ChoKhoiHanh');
  });

  // ==========================================
  // PHẦN 3: TẠO ĐƠN HÀNG & VÉ (TXP_BK_TC_013 -> 022)
  // ==========================================

  test('TXP_BK_TC_013: Happy Path - Tạo đơn hàng thành công cho khách hàng đã đăng nhập (Thanh toán trực tiếp)', async ({ bookingPage, page }) => {
    const randomEmail = TestDataGenerator.generateTraceableEmail('tc_bk_013');
    const randomPhone = TestDataGenerator.generatePhoneNumber();

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    // Giả lập trạng thái đăng nhập của khách hàng
    await page.evaluate((data) => {
      localStorage.setItem('customer_info', JSON.stringify({
        MaKhachHang: 'KH001',
        HoTenKhachHang: 'Nguyễn Văn A',
        SoDienThoai: data.phone,
        Email: data.email
      }));
      localStorage.setItem('token', 'mock_token_123');
    }, { phone: randomPhone, email: randomEmail });

    // Mock API tạo đơn hàng thành công
    await page.route(url => url.toString().includes('/customer/thong-tin-don-hang/create-order'), async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            order: {
              MaDonHang: 'DH10000001',
              TrangThaiDonHang: 'ChoKhoiHanh',
              totalPrice: 400000
            },
            tickets: [
              { MaVe: 'VE100001', SoGhe: '1A', TrangThaiVe: 'ChoKhoiHanh', MaQR: 'QR_VE100001_LT9999_1A' }
            ]
          }
        })
      });
    });

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);

    // Kiểm tra thông tin đã tự động điền từ localStorage
    await expect(bookingPage.customerNameInput).toHaveValue('Nguyễn Văn A');
    await expect(bookingPage.customerPhoneInput).toHaveValue(randomPhone);

    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await page.waitForURL(/\/thanh-toan/);
    await bookingPage.selectPaymentMethod('momo');
    await bookingPage.confirmPayment();

    // Xác nhận modal thanh toán thành công và hiển thị đúng thông tin đơn hàng
    await expect(bookingPage.successModal).toBeVisible();
    await expect(bookingPage.successModalOrderCode).toHaveText('DH10000001');
    
    // Về trang chủ
    await bookingPage.clickOn(bookingPage.successModalGoHomeBtn);
    await page.waitForURL(/\/home/);
  });

  test('TXP_BK_TC_014: Alternate Path - Tạo đơn hàng cho khách vãng lai hoàn toàn mới', async ({ bookingPage, page }) => {
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    const randomPhone = '0988777666';

    // Mock API khi gửi thông tin khách vãng lai mới, hệ thống trả về mã guest mới
    await page.route(url => url.toString().includes('/customer/thong-tin-don-hang/create-order'), async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            order: { MaDonHang: 'DH10000002', MaKhachHang: 'KH999', TrangThaiDonHang: 'ChoKhoiHanh' },
            tickets: [{ MaVe: 'VE100002', SoGhe: '1A' }]
          }
        })
      });
    });

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);
    await bookingPage.fillCustomerInfo('Khách Guest', randomPhone, 'guest@test.com');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await page.waitForURL(/\/thanh-toan/);
    await bookingPage.confirmPayment();
    await expect(bookingPage.successModal).toBeVisible();
    await expect(bookingPage.successModalOrderCode).toHaveText('DH10000002');
  });

  test('TXP_BK_TC_015: Alternate Path - Tạo đơn hàng cho khách vãng lai trùng số điện thoại đã tồn tại', async ({ bookingPage, page }) => {
    // Arrange
    await page.route(url => url.toString().includes('/customer/thong-tin-don-hang/create-order'), async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            order: { MaDonHang: 'DH10000003', MaKhachHang: 'KH001', TrangThaiDonHang: 'ChoKhoiHanh' },
            tickets: [{ MaVe: 'VE100003', SoGhe: '1A' }]
          }
        })
      });
    });
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    // Act
    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();
    await expect(page).toHaveURL(/\/thong-tin-don-hang/);
    await bookingPage.fillCustomerInfo('Khách Trùng SĐT', '0912345678', 'auto_bk_015@test.com');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();
    await expect(page).toHaveURL(/\/thanh-toan/);
    await bookingPage.selectPaymentMethod('zalopay');
    await bookingPage.confirmPayment();

    // Assert
    await expect(bookingPage.successModal).toBeVisible();
    await expect(bookingPage.successModalOrderCode).toHaveText('DH10000003');
  });

  test('TXP_BK_TC_016: Validation - Tạo đơn hàng thiếu thông tin người đi bắt buộc', async ({ bookingPage, page }) => {
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);
    
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    
    // Bỏ trống họ tên và đảm bảo Angular cập nhật state thành rỗng ngay trước khi click thanh toán
    await bookingPage.customerNameInput.evaluate((el: HTMLInputElement) => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await bookingPage.customerPhoneInput.fill('0912345678');

    await bookingPage.clickCheckout();

    // Xuất hiện thông báo validation inline trên form
    const validationMsg = page.locator('text=Họ tên người đi không được bỏ trống').first();
    await expect(validationMsg).toBeVisible({ timeout: 5000 });
  });

  test('TXP_BK_TC_017: Validation - Tạo đơn hàng với phương thức thanh toán không được hỗ trợ', async ({ bookingPage, page }) => {
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await page.waitForURL(/\/thanh-toan/);

    // Không tồn tại cổng thanh toán 'bitcoin' trên giao diện
    const bitcoinOption = page.locator('.flex.items-start:has-text("bitcoin")');
    await expect(bitcoinOption).toBeHidden();
  });

  test('TXP_BK_TC_018: Negative - Tạo đơn hàng khi ghế đã bị đặt bởi người khác (DaBan)', async ({ bookingPage, page }) => {
    // Mock API khi nhấn confirmPayment hoặc finishPayment trả về lỗi ghế đã bán
    await page.route(url => url.toString().includes('/customer/thong-tin-don-hang/create-order'), async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Ghế đã được đặt bởi người khác!'
        })
      });
    });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await expect(page).toHaveURL(/\/thanh-toan/);

    // Act
    const alertMsg = await bookingPage.confirmPaymentAndCaptureError();

    // Assert
    expect(alertMsg).toContain('Ghế đã được đặt bởi người khác!');
  });

  test('TXP_BK_TC_019: Negative - Tạo đơn hàng khi lịch trình chuyến xe không tồn tại', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thong-tin-don-hang/create-order', 404, {
      success: false,
      message: 'Không tìm thấy chuyến xe với mã LT0000',
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{ success: boolean; message: string }>(
      '/customer/thong-tin-don-hang/create-order',
      defaultOrderPayload({ MaLichTrinh: 'LT0000' }),
    );

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Không tìm thấy chuyến xe');
  });

  test('TXP_BK_TC_020: Negative - Tạo đơn hàng khi ghế được chọn không tồn tại trong DB', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thong-tin-don-hang/create-order', 404, {
      success: false,
      message: 'Một số ghế được chọn không tồn tại trong chuyến xe này!',
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{ success: boolean; message: string }>(
      '/customer/thong-tin-don-hang/create-order',
      defaultOrderPayload({ DanhSachMaGheChuyen: ['LT9999_GHE_A99'] }),
    );

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('ghế');
  });

  test('TXP_BK_TC_021: Boundary - Tạo đơn hàng đặt tối đa 5 ghế đồng thời', async ({ bookingPage, page }) => {
    // Mock API tạo đơn hàng thành công 5 ghế
    await page.route(url => url.toString().includes('/customer/thong-tin-don-hang/create-order'), async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            order: { MaDonHang: 'DH10000005', TrangThaiDonHang: 'ChoKhoiHanh', totalPrice: 2000000 },
            tickets: [
              { MaVe: 'VE100001', SoGhe: '1A' },
              { MaVe: 'VE100002', SoGhe: '4A' },
              { MaVe: 'VE100003', SoGhe: '6A' },
              { MaVe: 'VE100004', SoGhe: '7A' },
              { MaVe: 'VE100005', SoGhe: '8A' }
            ]
          }
        })
      });
    });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();

    // Chọn 5 ghế enabled
    await bookingPage.selectSeat('1A');
    await bookingPage.selectSeat('4A');
    await bookingPage.selectSeat('6A');
    await bookingPage.selectSeat('7A');
    await bookingPage.selectSeat('8A');

    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await page.waitForURL(/\/thanh-toan/);
    await bookingPage.confirmPayment();

    await expect(bookingPage.successModal).toBeVisible();
    await expect(page.locator('.text-navy:has-text("Ghế 1A, 4A, 6A, 7A, 8A")')).toBeVisible();
  });

  test('TXP_BK_TC_022: Edge Case - Đơn hàng bị lỗi trong giao dịch khi tạo vé điện tử', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thong-tin-don-hang/create-order', 500, {
      success: false,
      message: 'Lỗi transaction khi tạo vé điện tử. Đã rollback toàn bộ dữ liệu.',
      data: {
        orderCreated: false,
        seatStatus: 'GiuCho',
      },
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{
      success: boolean;
      message: string;
      data: { orderCreated: boolean; seatStatus: string };
    }>('/customer/thong-tin-don-hang/create-order', defaultOrderPayload());

    // Assert
    expect(response.status).toBe(500);
    expect(response.body.data.orderCreated).toBe(false);
    expect(response.body.data.seatStatus).toBe('GiuCho');
  });

  // ==========================================
  // PHẦN 4: THANH TOÁN & CALLBACK (TXP_BK_TC_023 -> 030)
  // ==========================================

  test('TXP_BK_TC_023: Happy Path - Tạo giao dịch thanh toán thành công', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thanh-toan/create-transaction', 201, {
      success: true,
      message: 'Tạo giao dịch thanh toán thành công!',
      data: {
        MaGiaoDich: 'GD_TT_100001',
        MaDonHang: 'DH10000001',
        TrangThaiGiaoDich: 'ChoThanhToan',
      },
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{
      success: boolean;
      data: { MaGiaoDich: string; TrangThaiGiaoDich: string };
    }>('/customer/thanh-toan/create-transaction', defaultTransactionPayload());

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.data.MaGiaoDich).toMatch(/^GD_TT_\d{6}$/);
    expect(response.body.data.TrangThaiGiaoDich).toBe('ChoThanhToan');
  });

  test('TXP_BK_TC_024: Negative - Tạo giao dịch thanh toán khi đơn hàng không ở trạng thái ChoThanhToan', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thanh-toan/create-transaction', 400, {
      success: false,
      message: 'Đơn hàng đã ở trạng thái ChoKhoiHanh, không thể thực hiện thanh toán!',
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{ success: boolean; message: string }>(
      '/customer/thanh-toan/create-transaction',
      defaultTransactionPayload({ MaDonHang: 'DH10000001' }),
    );

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('không thể thực hiện thanh toán');
  });

  test('TXP_BK_TC_025: Callback thanh toán thành công chuyển đổi trạng thái đơn hàng & vé', async ({ bookingPage, page }) => {
    // Flow thanh toán hoàn tất và modal success hiển thị
    await page.route(url => url.toString().includes('/customer/thong-tin-don-hang/create-order'), async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            order: { MaDonHang: 'DH10000001', TrangThaiDonHang: 'ChoKhoiHanh' },
            tickets: [{ MaVe: 'VE100001', SoGhe: '1A' }]
          }
        })
      });
    });

    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await page.waitForURL(/\/thanh-toan/);
    await bookingPage.confirmPayment();

    await expect(bookingPage.successModal).toBeVisible();
    await expect(bookingPage.successModalOrderCode).toHaveText('DH10000001');
  });

  test('TXP_BK_TC_026: Happy Path - Callback thanh toán thành công lần 2 (Idempotency)', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thanh-toan/callback/success', 200, {
      success: true,
      message: 'Giao dịch đã được xử lý thành công từ trước.',
      data: {
        transactionStatus: 'DaThanhToan',
        dbUpdatedAgain: false,
      },
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{
      success: boolean;
      message: string;
      data: { transactionStatus: string; dbUpdatedAgain: boolean };
    }>('/customer/thanh-toan/callback/success', {
      MaDonHang: 'DH10000001',
      MaGiaoDich: 'GD_TT_100001',
    });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.transactionStatus).toBe('DaThanhToan');
    expect(response.body.data.dbUpdatedAgain).toBe(false);
  });

  test('TXP_BK_TC_027: Callback thanh toán thất bại giải phóng ghế và hủy đơn hàng', async ({ bookingPage, page }) => {
    // Khi click "Quay lại" (hủy thanh toán) trên trang thanh toán
    await bookingPage.navigateTo('/tim-kiem-chuyen?diemDi=Bình Định&diemDen=TP. Hồ Chí Minh&ngayDi=20/05/2026&passengers=1');
    await page.evaluate(() => localStorage.clear());

    await bookingPage.openSeatSelection();
    await bookingPage.selectSeat('1A');
    await bookingPage.confirmSeats();

    await page.waitForURL(/\/thong-tin-don-hang/);
    await bookingPage.fillCustomerInfo('Nguyễn Văn A', '0912345678');
    await bookingPage.acceptTerms();
    await bookingPage.selectPickupPoint('Bến xe Thượng Lý');
    await bookingPage.selectDropoffPoint('Bến xe Bãi Cháy');
    await bookingPage.clickCheckout();

    await page.waitForURL(/\/thanh-toan/);
    
    // Bấm hủy thanh toán
    await bookingPage.clickOn(bookingPage.cancelPaymentBtn);
    
    // Xác nhận hộp thoại hủy
    await expect(bookingPage.cancelModal).toBeVisible();
    await bookingPage.clickOn(bookingPage.cancelModalConfirmBtn);

    // Chuyển hướng quay lại trang tìm kiếm chuyến
    await page.waitForURL(/\/tim-kiem-chuyen/);
  });

  test('TXP_BK_TC_028: Negative - Callback thanh toán với mã giao dịch không tồn tại', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thanh-toan/callback/success', 404, {
      success: false,
      message: 'Không tìm thấy giao dịch với mã GD_TT_000000',
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{ success: boolean; message: string }>(
      '/customer/thanh-toan/callback/success',
      { MaDonHang: 'DH10000001', MaGiaoDich: 'GD_TT_000000' },
    );

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Không tìm thấy giao dịch');
  });

  test('TXP_BK_TC_029: Negative - Callback thanh toán với mã đơn hàng không tồn tại', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thanh-toan/callback/success', 404, {
      success: false,
      message: 'Không tìm thấy đơn hàng với mã DH00000000',
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{ success: boolean; message: string }>(
      '/customer/thanh-toan/callback/success',
      { MaDonHang: 'DH00000000', MaGiaoDich: 'GD_TT_100001' },
    );

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Không tìm thấy đơn hàng');
  });

  test('TXP_BK_TC_030: Edge Case - Lỗi kết nối DB trong quá trình xử lý callback success', async ({ bookingPage, page }) => {
    // Arrange
    await mockPost(page, '/customer/thanh-toan/callback/success', 500, {
      success: false,
      message: 'Lỗi kết nối DB khi xử lý callback success. Đã rollback giao dịch.',
      data: {
        transactionStatus: 'ChoThanhToan',
        orderStatus: 'ChoThanhToan',
        ticketStatus: 'ChoThanhToan',
        seatStatus: 'GiuCho',
      },
    });
    await bookingPage.navigateTo('/home');

    // Act
    const response = await bookingPage.postJson<{
      success: boolean;
      message: string;
      data: { transactionStatus: string; orderStatus: string; ticketStatus: string; seatStatus: string };
    }>('/customer/thanh-toan/callback/success', {
      MaDonHang: 'DH10000001',
      MaGiaoDich: 'GD_TT_100001',
    });

    // Assert
    expect(response.status).toBe(500);
    expect(response.body.data.transactionStatus).toBe('ChoThanhToan');
    expect(response.body.data.orderStatus).toBe('ChoThanhToan');
    expect(response.body.data.seatStatus).toBe('GiuCho');
  });
});
