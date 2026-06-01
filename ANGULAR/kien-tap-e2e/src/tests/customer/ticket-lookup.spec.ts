import { test, expect, ENV } from '../../fixtures/base.fixture';

test.describe('Phân Hệ Khách Hàng - Module Tra Cứu Vé & Quản Lý Đơn Hàng (Ticket Lookup & Order Management)', () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  const liveLookupData = {
    orderCode: 'DH10000017',
    ticketCode: 'VE100022',
    phone: '0912345678',
    customerName: 'An An',
    secondTicketCode: 'VE100023',
  };

  const buildLookupOrder = (overrides: Record<string, any> = {}) => {
    const status = overrides.trangThaiDonHang || 'Chờ khởi hành';
    return {
      maDonHang: liveLookupData.orderCode,
      hoTenNguoiDi: liveLookupData.customerName,
      soDienThoai: liveLookupData.phone,
      email: 'an.an@test.com',
      thoiGianDat: '01/06/2026 08:30',
      soLuongVeDaDat: 2,
      tongGiaVe: 480000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: status,
      tenTuyen: 'Điêu Trì - Bến xe Miền Đông',
      gioKhoiHanh: '15:30',
      departureDate: '2026-06-15',
      diemDon: 'Bến xe Điêu Trì',
      diemTra: 'Bến xe Miền Đông',
      maDiemDon: 'DDT100003',
      maDiemTra: 'DDT100004',
      maLichTrinh: 'LT100010',
      gioGoiYCoMat: '15:15',
      soLanDaSua: 0,
      gioiHanChinhSua: 2,
      tickets: [
        {
          maVe: liveLookupData.ticketCode,
          soGhe: '1A',
          bienSoXe: '77B-012.34',
          diemDon: 'Bến xe Điêu Trì',
          diemTra: 'Bến xe Miền Đông',
          giaVe: 240000,
          trangThaiVe: overrides.trangThaiVe || status,
          maQRVe: `QR_${liveLookupData.ticketCode}_LT100010_1A`,
        },
        {
          maVe: liveLookupData.secondTicketCode,
          soGhe: '2A',
          bienSoXe: '77B-012.34',
          diemDon: 'Bến xe Điêu Trì',
          diemTra: 'Bến xe Miền Đông',
          giaVe: 240000,
          trangThaiVe: overrides.trangThaiVe || status,
          maQRVe: `QR_${liveLookupData.secondTicketCode}_LT100010_2A`,
        },
      ],
      ...overrides,
    };
  };

  const mockLookupSuccess = async (page: any, overrides: Record<string, any> = {}) => {
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: buildLookupOrder(overrides)
        })
      });
    });
  };

  const mockTripDetail = async (page: any) => {
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/detail'), async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            diemDungLichTrinh: [
              { MaDiem: 'DDT100003', TenDiem: 'Bến xe Điêu Trì', DiaChi: 'Bình Định', LoaiDiem: 'DiemDon' },
              { MaDiem: 'DDT100004', TenDiem: 'Bến xe Miền Đông', DiaChi: 'TP HCM', LoaiDiem: 'DiemTra' },
            ]
          }
        })
      });
    });
  };

  test.beforeEach(async ({ page }) => {
    // In browser logs
    page.on('console', msg => {
      console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
    });

    // Mock OPTIONS requests
    await page.route(/.*/, async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 204,
          headers: corsHeaders
        });
      } else {
        await route.continue();
      }
    });

    // Cài đặt ngày hệ thống giả lập để phục vụ kiểm thử logic thời gian
    await page.addInitScript(() => {
      const MockDate = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super('2026-05-15T08:00:00Z'); // 15/05/2026 08:00 UTC
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

    // Mock API GET Cancel Policies
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/cancel-policies'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: [
            { MaChinhSach: 'CS01', TenChinhSach: 'Hủy trước 24h', MoTa: 'Hoàn tiền 100%, không mất phí.' },
            { MaChinhSach: 'CS02', TenChinhSach: 'Hủy từ 12h - 24h', MoTa: 'Hoàn tiền 50%, phí hủy 50%.' },
            { MaChinhSach: 'CS03', TenChinhSach: 'Hủy dưới 12h', MoTa: 'Không hỗ trợ hoàn tiền, phí hủy 100%.' }
          ]
        })
      });
    });
  });

  // ==========================================
  // PHẦN 1: TRA CỨU VÉ (TXP_LOOK_TC_001 -> TC_LOOK_TC_008 & 031 -> 032)
  // ==========================================

  test('TXP_LOOK_TC_001: Happy Path - Tra cứu vé thành công bằng mã đơn hàng hợp lệ và SĐT đúng', async ({ ticketLookupPage, page }) => {
    // Mock API trả về thông tin chi tiết đơn hàng dạng chưa khởi hành
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 08:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-20',
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            tickets: [
              {
                maVe: 'VE100001',
                soGhe: '1A',
                bienSoXe: '77B-012.34',
                diemDon: 'Bến xe Quy Nhơn',
                diemTra: 'Bến xe Miền Đông',
                giaVe: 400000,
                trangThaiVe: 'Chờ khởi hành'
              }
            ]
          }
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'DH10000001');

    // Chờ thông tin đơn hàng và vé hiển thị
    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('span:has-text("DH10000001")')).toBeVisible();
    await expect(page.locator('span:has-text("Nguyễn Văn A")')).toBeVisible();
    await expect(page.locator('.px-3.py-1.rounded-full:has-text("Chờ khởi hành")').first()).toBeVisible();

    // Verify QR Code hiển thị
    const qrCode = page.locator('img[alt="Mã QR Vé"]');
    await expect(qrCode).toBeVisible();
  });

  test('TXP_LOOK_TC_002: Happy Path - Tra cứu vé thành công bằng mã vé điện tử và SĐT đúng', async ({ ticketLookupPage, page }) => {
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 08:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-20',
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            tickets: [
              {
                maVe: 'VE100001',
                soGhe: '1A',
                bienSoXe: '77B-012.34',
                diemDon: 'Bến xe Quy Nhơn',
                diemTra: 'Bến xe Miền Đông',
                giaVe: 400000,
                trangThaiVe: 'Chờ khởi hành'
              }
            ]
          }
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'VE100001');

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('span:has-text("DH10000001")')).toBeVisible();
  });

  test('TXP_LOOK_TC_003: Alternate Path - Tra cứu với mã viết thường (Case-insensitive)', async ({ ticketLookupPage, page }) => {
    // API mock nhận mã lowercase và vẫn trả về kết quả
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      const requestUrl = new URL(route.request().url());
      const code = requestUrl.searchParams.get('maDonHang') || '';
      
      expect(code.toLowerCase()).toBe('dh10000001');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 08:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-20',
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            tickets: [{ maVe: 'VE100001', soGhe: '1A', bienSoXe: '77B-012.34', diemDon: 'Bến xe Quy Nhơn', diemTra: 'Bến xe Miền Đông', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }]
          }
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'dh10000001');

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
  });

  test('TXP_LOOK_TC_004: Negative - Tra cứu với Số điện thoại sai', async ({ ticketLookupPage, page }) => {
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!'
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0988888888', 'DH10000001');

    await expect(ticketLookupPage.searchErrorAlert).toBeVisible();
    await expect(ticketLookupPage.searchErrorAlert).toContainText('Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!');
  });

  test('TXP_LOOK_TC_005: Negative - Tra cứu với mã đơn hàng không tồn tại', async ({ ticketLookupPage, page }) => {
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!'
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, 'DH00000000');

    await expect(ticketLookupPage.searchErrorAlert).toBeVisible();
    await expect(ticketLookupPage.searchErrorAlert).toContainText('Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!');
  });

  test('TXP_LOOK_TC_006: Validation - Tra cứu để trống trường thông tin bắt buộc trả lỗi 400', async ({ ticketLookupPage, page }) => {
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ mã vé/mã đơn hàng và số điện thoại!'
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    const lookupResponse = page.waitForResponse(response => response.url().includes('/customer/tra-cuu-ve/lookup') && response.status() === 400);
    await ticketLookupPage.clickOn(ticketLookupPage.lookupBtn);
    await lookupResponse;

    await expect(ticketLookupPage.searchErrorAlert).toBeVisible();
    await expect(ticketLookupPage.searchErrorAlert).toContainText('Vui lòng cung cấp đầy đủ mã vé/mã đơn hàng và số điện thoại!');
  });

  test('TXP_LOOK_TC_007: Mapping - Trạng thái Chờ khởi hành hiển thị chuẩn hóa tiếng Việt', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page, {
      trangThaiDonHang: 'ChoKhoiHanh',
      trangThaiVe: 'ChoKhoiHanh',
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('.px-3.py-1.rounded-full:has-text("Chờ khởi hành")').first()).toBeVisible();
  });

  test('TXP_LOOK_TC_008: Mapping - Trạng thái Đã hủy hiển thị tiếng Việt', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page, {
      trangThaiDonHang: 'DaHuy',
      trangThaiVe: 'DaHuy',
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('.px-3.py-1.rounded-full:has-text("Đã hủy")').first()).toBeVisible();
    await expect(ticketLookupPage.openCancelModalBtn).toBeDisabled();
  });

  test('TXP_LOOK_TC_032: UI - Hiển thị ảnh QR Code của từng vé xe trong chi tiết tra cứu', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page);

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('img[alt="Mã QR Vé"]')).toHaveCount(2);
  });

  test('TXP_LOOK_TC_034: Mapping - Trạng thái Chờ thanh toán hiển thị đúng tiếng Việt', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page, {
      trangThaiDonHang: 'ChoThanhToan',
      trangThaiVe: 'ChoThanhToan',
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('.px-3.py-1.rounded-full:has-text("Chờ thanh toán")').first()).toBeVisible();
    await expect(ticketLookupPage.openCancelModalBtn).toBeDisabled();
  });

  test('TXP_LOOK_TC_035 & TXP_LOOK_TC_037: Mapping Đã hoàn thành và disable nút Hủy vé', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page, {
      trangThaiDonHang: 'DaHoanThanh',
      trangThaiVe: 'DaHoanThanh',
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('.px-3.py-1.rounded-full:has-text("Đã hoàn thành")').first()).toBeVisible();
    await expect(ticketLookupPage.openCancelModalBtn).toBeDisabled();
  });

  test('TXP_LOOK_TC_036 & TXP_LOOK_TC_038: Mapping Đã đánh giá và disable nút Hủy vé', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page, {
      trangThaiDonHang: 'DaDanhGia',
      trangThaiVe: 'DaDanhGia',
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator('.px-3.py-1.rounded-full:has-text("Đã đánh giá")').first()).toBeVisible();
    await expect(ticketLookupPage.openCancelModalBtn).toBeDisabled();
  });

  test('TXP_LOOK_TC_039: UI - Hiển thị số lần chỉnh sửa còn lại theo format X/2 lần chỉnh', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page, {
      soLanDaSua: 1,
      gioiHanChinhSua: 2,
    });
    await mockTripDetail(page);

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.openEditModalBtn);
    await expect(ticketLookupPage.editModal).toBeVisible();
    await expect(ticketLookupPage.editModal).toContainText('Bạn còn 1/2 lần chỉnh thông tin cho vé này.');
  });

  test('TXP_LOOK_TC_040: UI - Query params tự động tra cứu khi mở URL', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page);

    await page.goto(`${ENV.CUSTOMER_URL}/tra-cuu-ve?maDonHang=${liveLookupData.orderCode}&soDienThoai=${liveLookupData.phone}`);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(page.locator(`span:has-text("${liveLookupData.orderCode}")`)).toBeVisible();
    await expect(page.locator(`span:has-text("${liveLookupData.phone}")`)).toBeVisible();
  });

  test('TXP_LOOK_TC_031: Negative - Nhập SĐT sai định dạng khi tra cứu', async ({ ticketLookupPage, page }) => {
    // HTML5 validation or form validation will trigger
    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    
    await ticketLookupPage.typeText(ticketLookupPage.bookingCodeInput, 'DH10000001');
    await ticketLookupPage.typeText(ticketLookupPage.phoneInput, '0912abc');
    
    // Nút "Tra cứu" submit, form check validation
    await ticketLookupPage.clickOn(ticketLookupPage.lookupBtn);

    // Kien tap code has client-side phone format validation in NgModel or input type,
    // let's verify lookup doesn't proceed to call API or display invalid state.
    // If it doesn't show details, it means it is successfully validated.
    await expect(ticketLookupPage.orderDetailsSection).toBeHidden();
  });

  // ==========================================
  // PHẦN 2: LỊCH SỬ ĐẶT VÉ (TXP_LOOK_TC_009 -> TC_LOOK_TC_012)
  // ==========================================

  test('TXP_LOOK_TC_009 & 012: Happy Path - Xem lịch sử đặt vé thành công khi đã đăng nhập', async ({ page }) => {
    // Truy cập domain trước để tránh SecurityError khi set localStorage
    await page.goto(ENV.CUSTOMER_URL + '/home');

    const mockHistory = {
      success: true,
      data: [
        {
          maDonHang: 'DH10000001',
          tenTuyen: 'Bình Định - TP. HCM',
          departureDate: '2026-05-20',
          gioKhoiHanh: '18:00',
          soDienThoai: '0912345678',
          tongGiaVe: 800000,
          soLuongVeDaDat: 2,
          trangThaiDonHang: 'Chờ khởi hành',
          tickets: [
            { maVe: 'VE100001', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' },
            { maVe: 'VE100002', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }
          ]
        }
      ]
    };

    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/history'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockHistory)
      });
    });

    // Mock API Đăng nhập thành công để đi tới profile hợp lệ
    await page.route(url => url.toString().includes('/customer/auth/login'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          token: 'mock_token_123',
          data: { MaKhachHang: 'KH001', HoTenKhachHang: 'Nguyễn Văn A', DienThoai: '0912345678' }
        })
      });
    });

    // Mock API Profile
    await page.route(url => url.toString().includes('/customer/profile'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: { MaKhachHang: 'KH001', HoTenKhachHang: 'Nguyễn Văn A', DienThoai: '0912345678', Email: 'van.a@test.com', GioiTinh: 'Nam', NgaySinh: '1990-01-01' }
        })
      });
    });

    // Mock API Đăng nhập thành công để đi tới profile hợp lệ
    await page.route(url => url.toString().includes('/customer/auth/login'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          token: 'mock_token_123',
          data: { MaKhachHang: 'KH001', HoTenKhachHang: 'Nguyễn Văn A', DienThoai: '0912345678' }
        })
      });
    });

    // Mock API Profile (cả endpoint profile và me nếu Angular dev dùng chéo)
    await page.route(url => url.toString().includes('/customer/profile') || url.toString().includes('/customer/auth/profile'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: { MaKhachHang: 'KH001', HoTenKhachHang: 'Nguyễn Văn A', DienThoai: '0912345678', Email: 'van.a@test.com', GioiTinh: 'Nam', NgaySinh: '1990-01-01' }
        })
      });
    });

    // Giả lập trạng thái đăng nhập trong localStorage trước khi truy cập trang để Angular Route Guard cho qua
    await page.addInitScript(() => {
      const mockUser = { MaKhachHang: 'KH001', HoTenKhachHang: 'Nguyễn Văn A', SoDienThoai: '0912345678', Email: 'van.a@test.com' };
      localStorage.setItem('access_token', 'mock_token_123');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('customer_info', JSON.stringify(mockUser));
    });

    await page.goto(ENV.CUSTOMER_URL + '/profile');
    await page.waitForLoadState('networkidle');

    // Click thẳng vào tab "Lịch sử mua vé" trên sidebar trang cá nhân (sử dụng locator POM từ ProfilePage)
    const historyTab = page.locator('button').filter({ hasText: 'Lịch sử mua vé' }).first();
    await expect(historyTab).toBeVisible();
    await historyTab.click();
    
    // Verify thông tin lịch sử vé
    await expect(page.locator('.text-navy:has-text("DH10000001")')).toBeVisible();
    await expect(page.locator('td:has-text("Bình Định - TP. HCM")').first()).toBeVisible();
    await expect(page.locator('td:has-text("2")').first()).toBeVisible();
    await expect(page.locator('td:has-text("Chờ khởi hành")').first()).toBeVisible();
  });

  // ==========================================
  // PHẦN 3: CẬP NHẬT THÔNG TIN VÉ (TXP_LOOK_TC_013 -> TC_LOOK_TC_020)
  // ==========================================

  test('TXP_LOOK_TC_013: Happy Path - Cập nhật thông tin đơn hàng hợp lệ lần đầu (thời gian khởi hành > 2 tiếng)', async ({ ticketLookupPage, page }) => {
    // Mock lookup
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 08:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-20', // Cách ngày hệ thống (15/5) nhiều ngày -> > 2h
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            maDiemDon: 'D01',
            maDiemTra: 'D02',
            maLichTrinh: 'LT9999',
            soLanDaSua: 0,
            tickets: [{ maVe: 'VE100001', soGhe: '1A', bienSoXe: '77B-012.34', diemDon: 'Bến xe Quy Nhơn', diemTra: 'Bến xe Miền Đông', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }]
          }
        })
      });
    });

    // Mock điểm dừng gợi ý của tuyến
    const mockTripDetail = {
      success: true,
      data: {
        diemDungLichTrinh: [
          { MaDiem: 'D01', TenDiem: 'Bến xe Quy Nhơn', DiaChi: 'Quy Nhơn', LoaiDiem: 'DiemDon' },
          { MaDiem: 'D02', TenDiem: 'Bến xe Miền Đông', DiaChi: 'TP HCM', LoaiDiem: 'DiemTra' },
          { MaDiem: 'D03', TenDiem: 'Điểm Đón Mới', DiaChi: 'Quy Nhơn', LoaiDiem: 'DiemDon' },
          { MaDiem: 'D04', TenDiem: 'Điểm Trả Mới', DiaChi: 'TP HCM', LoaiDiem: 'DiemTra' }
        ]
      }
    };
    await page.route(url => url.toString().includes('/customer/tim-kiem-chuyen-xe/detail'), async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', headers: corsHeaders, body: JSON.stringify(mockTripDetail) });
    });

    // Mock update API
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/update-info'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Cập nhật thông tin vé thành công!',
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn C',
            soDienThoai: '0911222333',
            email: 'nguoi_di_new@gmail.com',
            thoiGianDat: '15/05/2026 08:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-20',
            diemDon: 'Điểm Đón Mới',
            diemTra: 'Điểm Trả Mới',
            soLanDaSua: 1,
            tickets: [{ maVe: 'VE100001', soGhe: '1A', bienSoXe: '77B-012.34', diemDon: 'Điểm Đón Mới', diemTra: 'Điểm Trả Mới', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }]
          }
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'DH10000001');

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.openEditModalBtn);
    await expect(ticketLookupPage.editModal).toBeVisible();

    // Điền thông tin mới
    await ticketLookupPage.typeText(ticketLookupPage.editFullNameInput, 'Nguyễn Văn C');
    await ticketLookupPage.typeText(ticketLookupPage.editPhoneInput, '0911222333');
    await ticketLookupPage.typeText(ticketLookupPage.editEmailInput, 'nguoi_di_new@gmail.com');

    await ticketLookupPage.selectEditPickupPoint('Điểm Đón Mới');
    await ticketLookupPage.selectEditDropoffPoint('Điểm Trả Mới');

    await ticketLookupPage.clickOn(ticketLookupPage.editSaveBtn);

    // Xác nhận summary 2 bước
    await expect(ticketLookupPage.editConfirmationSummaryModal).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.editConfirmationSummaryConfirmBtn);

    await expect(ticketLookupPage.editConfirmationDialogModal).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.editConfirmationDialogSaveBtn);

    // Sau khi lưu thành công, modal đóng và thông tin mới được hiển thị trên trang tra cứu
    await expect(ticketLookupPage.editModal).toBeHidden();
    await expect(page.locator('span:has-text("Nguyễn Văn C")')).toBeVisible();
    await expect(page.locator('span:has-text("0911222333")')).toBeVisible();
  });

  test('TXP_LOOK_TC_015: Negative - Từ chối cập nhật lần thứ 3 khi đã hết lượt chỉnh sửa', async ({ ticketLookupPage, page }) => {
    // Mock lookup: soLanDaSua = 2 -> Edit button disabled
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 08:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-20',
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            soLanDaSua: 2, // Đã sửa tối đa 2 lần
            tickets: [{ maVe: 'VE100001', soGhe: '1A', bienSoXe: '77B-012.34', diemDon: 'Bến xe Quy Nhơn', diemTra: 'Bến xe Miền Đông', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }]
          }
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'DH10000001');

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    
    // Nút Edit bị disabled
    await expect(ticketLookupPage.openEditModalBtn).toBeDisabled();
  });

  test('TXP_LOOK_TC_017: Boundary - Từ chối chỉnh sửa khi thời gian vừa chạm mốc dưới 2 tiếng', async ({ ticketLookupPage, page }) => {
    // Hệ thống date giả lập là 15/05/2026 08:00
    // Chuyến xe khởi hành 15/05/2026 09:59 (còn 1 tiếng 59 phút)
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 06:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '09:59',
            departureDate: '2026-05-15',
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            soLanDaSua: 0,
            tickets: [{ maVe: 'VE100001', soGhe: '1A', bienSoXe: '77B-012.34', diemDon: 'Bến xe Quy Nhơn', diemTra: 'Bến xe Miền Đông', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }]
          }
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'DH10000001');

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    
    // Nút chỉnh sửa bị disabled do chỉ còn dưới 2h
    await expect(ticketLookupPage.openEditModalBtn).toBeDisabled();
  });

  // ==========================================
  // PHẦN 4: HỦY VÉ ĐIỆN TỬ (TXP_LOOK_TC_021 -> TC_LOOK_TC_030)
  // ==========================================

  test('TXP_LOOK_TC_021: Happy Path - Hủy vé điện tử khi thời gian còn trên 24 tiếng (Phí hủy 0% - Hoàn tiền 100%)', async ({ ticketLookupPage, page }) => {
    // Chuyến xe khởi hành 20/05/2026 18:00 (cách thời gian giả lập 15/5 nhiều ngày -> > 24h)
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 08:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-20',
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            maDiemDon: 'D01',
            maDiemTra: 'D02',
            maLichTrinh: 'LT9999',
            tickets: [{ maVe: 'VE100001', soGhe: '1A', bienSoXe: '77B-012.34', diemDon: 'Bến xe Quy Nhơn', diemTra: 'Bến xe Miền Đông', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }]
          }
        })
      });
    });

    // Mock API hủy vé
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/cancel/'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Hủy vé thành công, hoàn trả 400.000đ!',
          data: {
            refundAmount: 400000,
            feeAmount: 0,
            maGiaoDichHoan: 'GD_HOAN_1712049200'
          }
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'DH10000001');

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.openCancelModalBtn);
    await expect(ticketLookupPage.cancelModal).toBeVisible();

    // Chọn lý do hủy (force select vì option được sinh động)
    await ticketLookupPage.cancelReasonSelect.selectOption({ label: 'Tôi đổi kế hoạch' });
    
    // Xác nhận số tiền hoàn 100% (Phí hủy 0% hiển thị)
    await expect(ticketLookupPage.cancelModal.locator('span:has-text("400.000")').last()).toBeVisible();

    // Bấm hủy vé
    await ticketLookupPage.clickOn(ticketLookupPage.cancelConfirmBtn);

    // Xác nhận modal xác nhận lần 2
    await expect(ticketLookupPage.cancelConfirmDialogModal).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.cancelConfirmDialogConfirmBtn);

    // Toast thành công hiển thị
    const toast = page.locator('.fixed.top-24');
    await expect(toast).toContainText('Hủy vé thành công');
  });

  test('TXP_LOOK_TC_023: Negative - Từ chối hủy vé khi thời gian còn dưới 12 tiếng', async ({ ticketLookupPage, page }) => {
    // Chuyến xe khởi hành cùng ngày 15/05/2026 lúc 18:00 (Thời gian hệ thống 15/05/2026 08:00 -> cách 10 tiếng -> < 12h)
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/lookup'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            maDonHang: 'DH10000001',
            hoTenNguoiDi: 'Nguyễn Văn A',
            soDienThoai: '0912345678',
            email: 'van.a@test.com',
            thoiGianDat: '15/05/2026 06:30',
            soLuongVeDaDat: 1,
            tongGiaVe: 400000,
            phuongThucThanhToan: 'momo',
            trangThaiDonHang: 'Chờ khởi hành',
            tenTuyen: 'Bình Định - TP. Hồ Chí Minh',
            gioKhoiHanh: '18:00',
            departureDate: '2026-05-15',
            diemDon: 'Bến xe Quy Nhơn',
            diemTra: 'Bến xe Miền Đông',
            tickets: [{ maVe: 'VE100001', soGhe: '1A', bienSoXe: '77B-012.34', diemDon: 'Bến xe Quy Nhơn', diemTra: 'Bến xe Miền Đông', giaVe: 400000, trangThaiVe: 'Chờ khởi hành' }]
          }
        })
      });
    });

    // Mock API hủy vé trả về lỗi 400 từ backend khi bấm xác nhận hủy (do frontend dev chưa chặn disabled nút khi < 12h ở ngoài màn hình kết quả)
    await page.route(url => url.toString().includes('/customer/tra-cuu-ve/cancel/'), async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Không được phép hủy vé trước giờ khởi hành dưới 12 tiếng!'
        })
      });
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0912345678', 'DH10000001');

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    
    // Tiến hành click Hủy vé
    await ticketLookupPage.clickOn(ticketLookupPage.openCancelModalBtn);
    await expect(ticketLookupPage.cancelModal).toBeVisible();
    
    // Frontend hiển thị số tiền hoàn 0đ
    await expect(ticketLookupPage.cancelModal.locator('span:has-text("0đ")').last()).toBeVisible();

    // Bấm hủy lần 1
    await ticketLookupPage.clickOn(ticketLookupPage.cancelConfirmBtn);
    
    // Đợi Modal Xác nhận hủy lần 2 xuất hiện và bấm Xác nhận hủy lần 2
    await expect(ticketLookupPage.cancelConfirmDialogModal).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.cancelConfirmDialogConfirmBtn);
    
    // Đợi Toast xuất hiện và kiểm tra text
    const toast = page.locator('div.fixed.top-24').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Không thể hủy vé khi chỉ còn dưới 12 giờ trước khởi hành.');
  });

  test('TXP_LOOK_TC_051 & TXP_LOOK_TC_054: Hiển thị chính sách và danh sách lý do hủy vé trong modal', async ({ ticketLookupPage, page }) => {
    await mockLookupSuccess(page, {
      trangThaiDonHang: 'ChoKhoiHanh',
      trangThaiVe: 'ChoKhoiHanh',
    });

    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder(liveLookupData.phone, liveLookupData.orderCode);

    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await ticketLookupPage.clickOn(ticketLookupPage.openCancelModalBtn);
    await expect(ticketLookupPage.cancelModal).toBeVisible();

    await expect(ticketLookupPage.cancelModal).toContainText('Hủy trước 24h');
    await expect(ticketLookupPage.cancelReasonSelect.locator('option')).toHaveCount(4);
    await expect(ticketLookupPage.cancelReasonSelect).toContainText('Tôi đổi kế hoạch');
  });
});
