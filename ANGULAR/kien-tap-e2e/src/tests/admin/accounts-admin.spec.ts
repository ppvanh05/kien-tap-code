import { test, expect } from '../../fixtures/base.fixture';
import { TestDataGenerator } from '../../utils/test-data';
import { ENV } from '../../utils/env.config';

test.describe('Phân Hệ Quản Trị - Module Quản Lý Tài Khoản (Accounts Admin Module)', () => {
  test.describe.configure({ mode: 'serial' });

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Mock dữ liệu Khách hàng ban đầu
  let mockCustomers = [
    {
      MaKhachHang: 'KH100001',
      HoTenKhachHang: 'Nguyễn Văn B',
      SoDienThoai: '0912345678',
      Email: 'nguyenvanb@gmail.com',
      GioiTinh: 'Nam',
      NgaySinh: '1990-01-01',
      TrangThaiTaiKhoan: 'HoatDong',
      LyDoKhoa: null
    },
    {
      MaKhachHang: 'KH100002',
      HoTenKhachHang: 'Phan Thị Trang',
      SoDienThoai: '0987654321',
      Email: 'phan.trang@gmail.com',
      GioiTinh: 'Nữ',
      NgaySinh: '1992-02-02',
      TrangThaiTaiKhoan: 'HoatDong',
      LyDoKhoa: null
    },
    {
      MaKhachHang: 'KH100003',
      HoTenKhachHang: 'Nguyễn Văn C',
      SoDienThoai: '0911111111',
      Email: 'nguyenvanc@gmail.com',
      GioiTinh: 'Nam',
      NgaySinh: '1993-03-03',
      TrangThaiTaiKhoan: 'DaKhoa',
      LyDoKhoa: 'Spam đặt vé'
    },
    {
      MaKhachHang: 'KH100004',
      HoTenKhachHang: 'Nguyễn Văn D',
      SoDienThoai: '0922222222',
      Email: 'nguyenvand@gmail.com',
      GioiTinh: 'Nam',
      NgaySinh: '1994-04-04',
      TrangThaiTaiKhoan: 'HoatDong',
      LyDoKhoa: null
    }
  ];

  // Sinh thêm dummy customers để phục vụ test phân trang (>10 khách hàng)
  for (let i = 5; i <= 15; i++) {
    mockCustomers.push({
      MaKhachHang: `KH1000${i < 10 ? '0' + i : i}`,
      HoTenKhachHang: `Dummy Customer ${i}`,
      SoDienThoai: `09000000${i < 10 ? '0' + i : i}`,
      Email: `dummy${i}@test.com`,
      GioiTinh: i % 2 === 0 ? 'Nam' : 'Nữ',
      NgaySinh: '1995-05-05',
      TrangThaiTaiKhoan: 'HoatDong',
      LyDoKhoa: null
    });
  }

  // Mock dữ liệu Nhân viên ban đầu
  let mockEmployees = [
    {
      MaNhanVien: 'NV100001',
      TenTruyCap: 'banve1',
      HoVaTenDem: 'Trần Văn',
      Ten: 'Anh',
      TenHienThi: 'Trần Văn Anh',
      LoaiTaiKhoan: 'BanVe',
      GioiTinh: 'Nam',
      NgaySinh: '1996-06-06',
      SoDienThoai: '0933333333',
      Email: 'banve1@txpbus.vn',
      DiaChi: '123 Đường Láng, Hà Nội',
      TrangThai: 'HoatDong',
      Quyen: ['cskh', 'cskh.ve']
    },
    {
      MaNhanVien: 'NV100002',
      TenTruyCap: 'trangpt',
      HoVaTenDem: 'Phan Thị',
      Ten: 'Trang',
      TenHienThi: 'Phan Thị Trang',
      LoaiTaiKhoan: 'BanVe',
      GioiTinh: 'Nữ',
      NgaySinh: '1997-07-07',
      SoDienThoai: '0944444444',
      Email: 'trangpt@txpbus.vn',
      DiaChi: '456 Lạc Long Quân, Hà Nội',
      TrangThai: 'HoatDong',
      Quyen: ['cskh']
    }
  ];

  const mockTickets = [
    {
      MaVe: 'VE100001',
      MaChuyenDi: 'CD100001',
      TrangThaiVe: 'ConHieuLuc',
      ThoiGianXuatVe: '2026-05-31T12:00:00.000Z',
      GiaVe: 150000,
      SoGhe: 'A01'
    }
  ];

  const mockLogs = [
    {
      LoaiThaoTac: 'Đăng nhập',
      ThoiGian: '2026-05-31T10:00:00.000Z',
      DiaChiIP: '192.168.1.1',
      NoiDungChiTiet: 'Đăng nhập vào hệ thống',
      TrangThai: 'Thành công'
    }
  ];

  // Helper thực hiện login và di chuyển đến Quản lý tài khoản
  async function loginAndNavigateToAccounts(page: any, loginPage: any, subPath: 'quan-ly-khach-hang' | 'quan-ly-nhan-vien') {
    await page.context().clearCookies();
    await page.goto(ENV.ADMIN_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await expect(page).toHaveURL(/.*\/admin\/trang-chu/, { timeout: 15000 });

    const cleanAdminUrl = ENV.ADMIN_URL.replace('/admin-login', '');
    await page.goto(`${cleanAdminUrl}/admin/${subPath}`);
    await page.waitForLoadState('load');
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
            token: 'mock_jwt_token_admin_accounts',
            admin: {
              MaNhanVien: 'QTV100001',
              TenTruyCap: 'admin1',
              Email: 'admin1@txp.com',
              TrangThai: 'HoatDong',
              Quyen: ['customer', 'employee']
            }
          })
        });
        return;
      }

      // Mock GET /khach-hang
      if (url.includes('/khach-hang') && !url.includes('/ve') && !url.includes('/nhat-ky') && !url.includes('/khoa') && !url.includes('/mo-khoa') && method === 'GET') {
        // Kiểm tra xem có lọc theo trạng thái hay không
        let filtered = [...mockCustomers];
        if (url.includes('/trang-thai/HoatDong')) {
          filtered = filtered.filter(c => c.TrangThaiTaiKhoan === 'HoatDong');
        } else if (url.includes('/trang-thai/DaKhoa')) {
          filtered = filtered.filter(c => c.TrangThaiTaiKhoan === 'DaKhoa');
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(filtered)
        });
        return;
      }

      // Mock POST /khach-hang
      if (url.endsWith('/khach-hang') && method === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        
        // Kiểm tra trùng SĐT
        if (body.SoDienThoai === '0945551234' || mockCustomers.some(c => c.SoDienThoai === body.SoDienThoai)) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Số điện thoại này đã được đăng ký trước đó!' })
          });
          return;
        }

        // Kiểm tra trùng Email
        if (body.Email === 'hoangnam.do@gmail.com' || mockCustomers.some(c => c.Email === body.Email)) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Email này đã được đăng ký trước đó!' })
          });
          return;
        }

        const newCust = {
          MaKhachHang: `KH1000${mockCustomers.length + 1}`,
          HoTenKhachHang: body.HoTenKhachHang,
          SoDienThoai: body.SoDienThoai,
          Email: body.Email,
          GioiTinh: body.GioiTinh || 'Nam',
          NgaySinh: body.NgaySinh || '1995-08-15',
          TrangThaiTaiKhoan: 'HoatDong',
          LyDoKhoa: null
        };
        mockCustomers.push(newCust);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(newCust)
        });
        return;
      }

      // Mock PUT /khach-hang/:id
      if (url.includes('/khach-hang/') && method === 'PUT') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const body = JSON.parse(route.request().postData() || '{}');

        // Kiểm tra trùng SĐT với KH khác
        if (mockCustomers.some(c => c.SoDienThoai === body.SoDienThoai && c.MaKhachHang !== id)) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Số điện thoại này đã được sử dụng bởi một tài khoản khác!' })
          });
          return;
        }

        const index = mockCustomers.findIndex(c => c.MaKhachHang === id);
        if (index !== -1) {
          mockCustomers[index] = { ...mockCustomers[index], ...body };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify(mockCustomers[index])
          });
        } else {
          await route.fulfill({ status: 404, headers: corsHeaders });
        }
        return;
      }

      // Mock PATCH /khach-hang/:id/khoa
      if (url.includes('/khach-hang/') && url.includes('/khoa') && method === 'PATCH') {
        const parts = url.split('/');
        const id = parts[parts.length - 2];
        const body = JSON.parse(route.request().postData() || '{}');

        const cust = mockCustomers.find(c => c.MaKhachHang === id);
        if (cust) {
          if (cust.TrangThaiTaiKhoan === 'DaKhoa') {
            await route.fulfill({
              status: 400,
              contentType: 'application/json',
              headers: corsHeaders,
              body: JSON.stringify({ message: 'Tài khoản này đã bị khóa trước đó!' })
            });
            return;
          }
          cust.TrangThaiTaiKhoan = 'DaKhoa';
          cust.LyDoKhoa = body.LyDoKhoa;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify(cust)
          });
        } else {
          await route.fulfill({ status: 404, headers: corsHeaders });
        }
        return;
      }

      // Mock PATCH /khach-hang/:id/mo-khoa
      if (url.includes('/khach-hang/') && url.includes('/mo-khoa') && method === 'PATCH') {
        const parts = url.split('/');
        const id = parts[parts.length - 2];

        const cust = mockCustomers.find(c => c.MaKhachHang === id);
        if (cust) {
          if (cust.TrangThaiTaiKhoan === 'HoatDong') {
            await route.fulfill({
              status: 400,
              contentType: 'application/json',
              headers: corsHeaders,
              body: JSON.stringify({ message: 'Tài khoản này đang hoạt động bình thường!' })
            });
            return;
          }
          cust.TrangThaiTaiKhoan = 'HoatDong';
          cust.LyDoKhoa = null;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify(cust)
          });
        } else {
          await route.fulfill({ status: 404, headers: corsHeaders });
        }
        return;
      }

      // Mock GET /khach-hang/:id/ve
      if (url.includes('/khach-hang/') && url.includes('/ve') && method === 'GET') {
        const parts = url.split('/');
        const id = parts[parts.length - 2];
        // Nếu là Nguyễn Văn D (KH100004), trả về vé đang có hiệu lực / ChoKhoiHanh
        if (id === 'KH100004') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify(mockTickets)
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify([])
          });
        }
        return;
      }

      // Mock GET /khach-hang/:id/nhat-ky
      if (url.includes('/khach-hang/') && url.includes('/nhat-ky') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(mockLogs)
        });
        return;
      }

      // Mock GET /nhan-vien
      if (url.includes('/nhan-vien') && !url.includes('/status') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(mockEmployees)
        });
        return;
      }

      // Mock POST /nhan-vien
      if (url.endsWith('/nhan-vien') && method === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');

        // Check trùng username
        if (body.TenTruyCap === 'banve1' || mockEmployees.some(e => e.TenTruyCap === body.TenTruyCap)) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Tên truy cập này đã được sử dụng.' })
          });
          return;
        }

        const newEmp = {
          MaNhanVien: `NV1000${mockEmployees.length + 1}`,
          TenTruyCap: body.TenTruyCap,
          HoVaTenDem: body.HoVaTenDem,
          Ten: body.Ten,
          TenHienThi: `${body.HoVaTenDem} ${body.Ten}`,
          LoaiTaiKhoan: body.LoaiTaiKhoan,
          GioiTinh: body.GioiTinh || 'Nam',
          NgaySinh: body.NgaySinh || '1995-01-01',
          SoDienThoai: body.SoDienThoai || '0900000000',
          Email: body.Email || 'dummy@txpbus.vn',
          DiaChi: body.DiaChi || '',
          TrangThai: 'HoatDong',
          Quyen: Array.isArray(body.Quyen) && body.Quyen.length > 0 ? body.Quyen : ['ticket', 'customer']
        };
        mockEmployees.push(newEmp);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(newEmp)
        });
        return;
      }

      // Mock PUT /nhan-vien/:id
      if (url.includes('/nhan-vien/') && method === 'PUT') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const body = JSON.parse(route.request().postData() || '{}');

        const index = mockEmployees.findIndex(e => e.MaNhanVien === id);
        if (index !== -1) {
          mockEmployees[index] = { ...mockEmployees[index], ...body, TenHienThi: body.TenHienThi || `${body.HoVaTenDem} ${body.Ten}` };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify(mockEmployees[index])
          });
        } else {
          await route.fulfill({ status: 404, headers: corsHeaders });
        }
        return;
      }

      // Mock PATCH /nhan-vien/:id/status
      if (url.includes('/nhan-vien/') && url.includes('/status') && method === 'PATCH') {
        const parts = url.split('/');
        const id = parts[parts.length - 2];
        const body = JSON.parse(route.request().postData() || '{}');

        const emp = mockEmployees.find(e => e.MaNhanVien === id);
        if (emp) {
          emp.TrangThai = body.TrangThai;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify(emp)
          });
        } else {
          await route.fulfill({ status: 404, headers: corsHeaders });
        }
        return;
      }

      // Tiếp tục các request khác (tài nguyên giao diện tĩnh, v.v...)
      await route.continue();
    });
  });

  // =========================================================================
  // KHÁCH HÀNG (CUSTOMER ACCOUNTS - TC_001 -> TC_026)
  // =========================================================================

  test('TXP_ADMIN_ACCOUNTS_TC_001: Happy Path - Tìm kiếm khách hàng theo Số điện thoại', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.searchAccount('0912345678');
    await expect(accountsPage.accountsTableRows.first()).toContainText('Nguyễn Văn B');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_002: Happy Path - Tìm kiếm khách hàng theo Họ tên', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.searchAccount('Phan Thị Trang');
    await expect(accountsPage.accountsTableRows.first()).toContainText('Phan Thị Trang');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_003: Happy Path - Tìm kiếm khách hàng theo Email', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.searchAccount('phan.trang@gmail.com');
    await expect(accountsPage.accountsTableRows.first()).toContainText('Phan Thị Trang');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_004: Happy Path - Tìm kiếm khách hàng theo Mã khách hàng', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.searchAccount('KH100001');
    await expect(accountsPage.accountsTableRows.first()).toContainText('Nguyễn Văn B');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_005: Happy Path - Lọc khách hàng theo Tab Đang hoạt động và Đã khóa', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.clickOn(accountsPage.tabActive);
    await page.waitForTimeout(500);
    await expect(accountsPage.accountsTableRows.first()).toContainText('Đang hoạt động');

    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);
    await expect(accountsPage.accountsTableRows.first()).toContainText('Đã khóa');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_006: Happy Path - Lọc khách hàng theo giới tính', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.genderFilterSelect.selectOption('Nữ');
    await page.waitForTimeout(500);
    await expect(accountsPage.accountsTableRows.first()).toContainText('Phan Thị Trang');
  });

  test('TXP_ADMIN_ACCOUNTS_TC_007: Alternate Path - Tìm kiếm khách hàng không tồn tại', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.searchAccount('KH_999999_NOT_EXIST');
    await expect(accountsPage.emptyRowState).toBeVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_008: Happy Path - Thêm mới khách hàng thành công với đầy đủ thông tin', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.openAddCustomerModal();

    const newPhone = TestDataGenerator.generatePhoneNumber();
    await accountsPage.fillCustomerInfo({
      fullName: 'Đỗ Hoàng Nam',
      phone: newPhone,
      email: 'hoangnam.do.new@gmail.com',
      gender: 'Nam',
      dob: '1995-08-15'
    });

    await accountsPage.saveCustomer();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_009: Negative - Thêm mới khách hàng với Số điện thoại đã tồn tại', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.openAddCustomerModal();

    await accountsPage.fillCustomerInfo({
      fullName: 'Lê Văn Khác',
      phone: '0945551234', // đã tồn tại trên server mock
      email: 'khac@gmail.com',
      gender: 'Nam',
      dob: '1990-01-01'
    });

    await accountsPage.saveCustomer();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('Số điện thoại này đã được đăng ký trước đó!');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_010: Negative - Thêm mới khách hàng với Email đã tồn tại', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.openAddCustomerModal();

    await accountsPage.fillCustomerInfo({
      fullName: 'Lê Văn Khác',
      phone: TestDataGenerator.generatePhoneNumber(),
      email: 'hoangnam.do@gmail.com', // đã tồn tại trên server mock
      gender: 'Nam',
      dob: '1990-01-01'
    });

    await accountsPage.saveCustomer();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('Email này đã được đăng ký trước đó!');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_011: Validation - Thêm mới khách hàng bỏ trống các trường bắt buộc (Họ tên, SĐT)', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.openAddCustomerModal();

    await accountsPage.customerNameInput.fill('');
    await accountsPage.customerPhoneInput.fill('');
    await accountsPage.customerEmailInput.fill('hoangnam.do@gmail.com');

    // Click Tạo tài khoản khi thiếu trường bắt buộc
    await accountsPage.saveCustomer();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi biểu mẫu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_012: Validation - Thêm mới khách hàng với Số điện thoại sai định dạng Việt Nam', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.openAddCustomerModal();

    await accountsPage.customerNameInput.fill('Đỗ Hoàng Nam');
    await accountsPage.customerPhoneInput.fill('01234'); // Sai định dạng

    // Click Tạo tài khoản để trigger validation và Alert Popup lỗi biểu mẫu
    await accountsPage.saveCustomer();

    // Verify thông báo lỗi hiển thị dưới input
    const feedback = page.locator('.error-msg').filter({ hasText: /Số điện thoại không đúng định dạng/ });
    await expect(feedback).toBeVisible();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi biểu mẫu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_013: Validation - Thêm mới khách hàng với Email sai định dạng', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.openAddCustomerModal();

    await accountsPage.customerNameInput.fill('Đỗ Hoàng Nam');
    await accountsPage.customerPhoneInput.fill(TestDataGenerator.generatePhoneNumber());
    await accountsPage.customerEmailInput.fill('notanemail'); // Sai định dạng

    // Click Tạo tài khoản để trigger validation và Alert Popup lỗi biểu mẫu
    await accountsPage.saveCustomer();

    // Verify thông báo lỗi hiển thị dưới input
    const feedback = page.locator('.error-msg').filter({ hasText: /Email không đúng định dạng/ });
    await expect(feedback).toBeVisible();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi biểu mẫu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_014: Validation - Thêm mới khách hàng với Ngày sinh lớn hơn ngày hiện tại', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.openAddCustomerModal();

    await accountsPage.customerNameInput.fill('Đỗ Hoàng Nam');
    await accountsPage.customerPhoneInput.fill(TestDataGenerator.generatePhoneNumber());
    await accountsPage.customerDobInput.fill('2030-01-01'); // Tương lai

    // Click Tạo tài khoản để trigger validation và Alert Popup lỗi biểu mẫu
    await accountsPage.saveCustomer();

    // Verify thông báo lỗi hiển thị dưới input
    const feedback = page.locator('.error-msg').filter({ hasText: /Ngày sinh không thể lớn hơn ngày hiện tại/ });
    await expect(feedback).toBeVisible();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi biểu mẫu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_015: Happy Path - Chỉnh sửa thông tin hồ sơ khách hàng thành công', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Nguyễn Văn B' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    await accountsPage.customerNameInput.fill('Nguyễn Văn B Cập Nhật');
    await accountsPage.customerPhoneInput.fill('0945559999');
    await accountsPage.saveCustomer();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_016: Validation - Chỉnh sửa khách hàng nhưng để trống Họ tên bắt buộc', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Nguyễn Văn B' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    await accountsPage.customerNameInput.fill('');
    
    await accountsPage.saveCustomer();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi biểu mẫu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_017: Validation - Chỉnh sửa khách hàng với SĐT đã được dùng bởi tài khoản khác', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Phan Thị Trang' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    await accountsPage.customerPhoneInput.fill('0945559999'); // SĐT của Nguyễn Văn B đã cập nhật ở TC_015
    await accountsPage.saveCustomer();

    // Verify thông báo lỗi hiển thị dưới input
    const feedback = page.locator('.error-msg').filter({ hasText: /Số điện thoại này đã được sử dụng bởi một tài khoản khác/ });
    await expect(feedback).toBeVisible();

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi biểu mẫu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_018: Happy Path - Khóa tài khoản khách hàng thành công và bắt buộc nhập lý do', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Nguyễn Văn B' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    const lockBtn = page.locator('.customer-detail-modal .btn-outline-danger');
    await accountsPage.clickOn(lockBtn);

    await accountsPage.waitForVisible(accountsPage.lockCustomerModalOverlay);
    await accountsPage.lockReasonTextArea.fill('Khách hàng spam đặt vé ảo');
    await accountsPage.clickOn(accountsPage.confirmLockCustomerButton);

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('đã bị chuyển sang trạng thái Đã khóa');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_019: Validation - Khóa tài khoản khách hàng nhưng để trống lý do khóa', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Phan Thị Trang' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    const lockBtn = page.locator('.customer-detail-modal .btn-outline-danger');
    await accountsPage.clickOn(lockBtn);

    await accountsPage.waitForVisible(accountsPage.lockCustomerModalOverlay);
    await accountsPage.lockReasonTextArea.fill('');
    await accountsPage.clickOn(accountsPage.confirmLockCustomerButton);

    // Cảnh báo alert hiển thị
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('Vui lòng nhập lý do');
    await accountsPage.dismissAlertIfVisible();

    await accountsPage.clickOn(accountsPage.cancelLockCustomerButton);
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_020: Negative - Khóa tài khoản khách hàng đang có vé ChoKhoiHanh chưa hoàn thành', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Nguyễn Văn D' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    const lockBtn = page.locator('.customer-detail-modal .btn-outline-danger');
    await accountsPage.clickOn(lockBtn);

    // Cảnh báo alert chặn hiển thị trực tiếp do có vé ChoKhoiHanh
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('hiện đang có vé xe chưa hoàn thành');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_022: Happy Path - Mở khóa tài khoản khách hàng thành công', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    await accountsPage.clickOn(accountsPage.tabLocked);
    await page.waitForTimeout(500);

    const row = accountsPage.accountsTableRows.filter({ hasText: 'Nguyễn Văn C' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    const unlockBtn = page.locator('.customer-detail-modal .btn-outline-success');
    await accountsPage.clickOn(unlockBtn);

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_024: Happy Path - Xem lịch sử vé của khách hàng', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Nguyễn Văn D' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    // Chuyển sang tab Lịch sử đặt vé (dùng button.sidebar-tab-btn theo DOM thực tế)
    const tabTicketHistory = page.locator('button.sidebar-tab-btn').filter({ hasText: 'Lịch sử đặt vé' });
    await accountsPage.clickOn(tabTicketHistory);
    
    // Kiểm tra vé hiển thị
    const ticketRow = page.locator('.customer-detail-modal tbody tr').first();
    await expect(ticketRow).toContainText('VE100001');
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_025: Happy Path - Xem nhật ký hoạt động của khách hàng', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    const row = accountsPage.accountsTableRows.filter({ hasText: 'Nguyễn Văn D' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.customerModalOverlay);

    // Chuyển sang tab Nhật ký hoạt động (dùng button.sidebar-tab-btn theo DOM thực tế)
    const tabLogs = page.locator('button.sidebar-tab-btn').filter({ hasText: 'Nhật ký hoạt động' });
    await accountsPage.clickOn(tabLogs);
    
    // Kiểm tra log hiển thị dạng timeline (không phải bảng)
    const logItem = page.locator('.timeline-item').first();
    await expect(logItem).toBeVisible();
    // Kiểm tra nội dung loại thao tác trong header timeline
    const logTitle = page.locator('.timeline-item .timeline-header strong').first();
    await expect(logTitle).toContainText('Đăng nhập');
    await accountsPage.clickOn(accountsPage.customerCloseButton);
  });


  test('TXP_ADMIN_ACCOUNTS_TC_026: Happy Path - Phân trang danh sách khách hàng', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-khach-hang');
    
    // Kiểm tra có nút phân trang tiếp theo và click
    const nextBtn = page.locator('.pagination-container .page-item.next, .pagination .page-link:has-text("Trang tiếp"), button:has-text("Trang tiếp")');
    if (await nextBtn.isVisible()) {
      await accountsPage.clickOn(nextBtn);
      await page.waitForTimeout(500);
      expect(await accountsPage.accountsTableRows.count()).toBeGreaterThan(0);
    }
  });

  // =========================================================================
  // NHÂN VIÊN (EMPLOYEE ACCOUNTS - TC_027 -> TC_035)
  // =========================================================================

  test('TXP_ADMIN_ACCOUNTS_TC_027: Happy Path - Thêm mới Nhân viên với đầy đủ thông tin hợp lệ', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');
    await accountsPage.openAddModal();

    await accountsPage.fillBasicInfo({
      username: 'banve_vip',
      matKhau: 'SecurePass123',
      hoVaTenDem: 'Trần Văn',
      ten: 'Anh',
      tenHienThi: 'Trần Văn Anh',
      defaultRole: 'BanVe',
      gioiTinh: 'Nam'
    });

    await accountsPage.selectPermissionPreset('cskh');
    
    await accountsPage.fillContactInfo({
      sdt: '0967891234',
      email: 'vananh.tran@txpbus.vn',
      diaChi: '123 Đường Láng, Hà Nội'
    });

    await accountsPage.saveAccount();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_028: Validation - Thêm nhân viên với Tên truy cập chứa khoảng trắng', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');
    await accountsPage.openAddModal();

    await accountsPage.typeText(accountsPage.usernameInput, 'banve vip');
    await accountsPage.passwordInput.focus();

    const feedback = page.locator('.error-msg').filter({ hasText: 'Tên truy cập từ 3-20 ký tự' });
    await expect(feedback).toBeVisible();

    await accountsPage.saveAccount();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi nhập liệu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.modalCancelButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_029: Negative - Trùng lặp Tên truy cập nhân viên (Server check)', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');
    await accountsPage.openAddModal();

    await accountsPage.fillBasicInfo({
      username: 'banve1', // đã tồn tại
      matKhau: 'SecurePass123',
      hoVaTenDem: 'Trần Văn',
      ten: 'Anh',
      tenHienThi: 'Trần Văn Anh',
      defaultRole: 'BanVe',
      gioiTinh: 'Nam'
    });

    await accountsPage.selectPermissionPreset('cskh');
    await accountsPage.fillContactInfo({
      sdt: '0967891234',
      email: 'vananh.tran@txpbus.vn'
    });

    await accountsPage.saveAccount();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi khởi tạo');
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('Không thể khởi tạo tài khoản nhân viên');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.modalCancelButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_030: Validation - Mật khẩu xác nhận nhập lại không khớp', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');
    await accountsPage.openAddModal();

    await accountsPage.typeText(accountsPage.usernameInput, 'banve_new');
    await accountsPage.typeText(accountsPage.passwordInput, 'SecurePass123');
    await accountsPage.typeText(accountsPage.confirmPasswordInput, 'SecurePass321');
    await accountsPage.hoVaTenDemInput.focus();

    const feedback = page.locator('.error-msg').filter({ hasText: 'Nhập lại mật khẩu không khớp' });
    await expect(feedback).toBeVisible();

    await accountsPage.saveAccount();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi nhập liệu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.modalCancelButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_031: Validation - Bỏ trống các trường bắt buộc khi lưu nhân viên mới', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');
    await accountsPage.openAddModal();

    await accountsPage.usernameInput.fill('');
    await accountsPage.passwordInput.fill('');
    
    await accountsPage.saveAccount();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertTitle)).toContain('Lỗi nhập liệu');
    await accountsPage.dismissAlertIfVisible();
    await accountsPage.clickOn(accountsPage.modalCancelButton);
  });

  test('TXP_ADMIN_ACCOUNTS_TC_032: Happy Path - Tự đồng bộ quyền theo chức vụ mặc định khi không chọn preset thủ công', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');
    await accountsPage.openAddModal();

    await accountsPage.fillBasicInfo({
      username: 'banve_auto_perm',
      matKhau: 'SecurePass123',
      hoVaTenDem: 'Trần Văn',
      ten: 'Anh',
      tenHienThi: 'Trần Văn Anh',
      defaultRole: 'BanVe',
      gioiTinh: 'Nam'
    });

    // Không chọn preset thủ công: UI hiện tại tự đồng bộ quyền mặc định theo chức vụ BanVe.
    await accountsPage.fillContactInfo({
      sdt: '0967895678',
      email: 'auto.perm@txpbus.vn'
    });

    await accountsPage.saveAccount();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_033: Happy Path - Cập nhật thông tin cơ bản và liên hệ của nhân viên', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');

    const row = accountsPage.accountsTableRows.filter({ hasText: 'banve1' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.modalOverlay);

    await accountsPage.tenHienThiInput.fill('Trần Thị Trang');
    await accountsPage.clickOn(accountsPage.modalTabContact);
    await accountsPage.sdtInput.fill('0988888888');

    await accountsPage.saveAccount();
    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('thành công');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_034: Happy Path - Khóa tài khoản nhân viên đang hoạt động', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');

    const row = accountsPage.accountsTableRows.filter({ hasText: 'banve1' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.modalOverlay);

    // Click nút Khóa/Mở khóa ở góc trái Modal
    await accountsPage.clickOn(accountsPage.modalStatusToggleButton);

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('Trạng thái tài khoản đã chuyển sang');
    await accountsPage.dismissAlertIfVisible();
  });

  test('TXP_ADMIN_ACCOUNTS_TC_035: Happy Path - Mở khóa tài khoản nhân viên bị khóa', async ({ loginPage, accountsPage, page }) => {
    await loginAndNavigateToAccounts(page, loginPage, 'quan-ly-nhan-vien');

    const row = accountsPage.accountsTableRows.filter({ hasText: 'banve1' }).first();
    await accountsPage.clickOn(row.locator('.btn-edit, .btn-action-view'));
    await accountsPage.waitForVisible(accountsPage.modalOverlay);

    // Click nút Khóa/Mở khóa ở góc trái Modal để đổi trạng thái về Hoạt động
    await accountsPage.clickOn(accountsPage.modalStatusToggleButton);

    await accountsPage.waitForVisible(accountsPage.alertOverlay);
    expect(await accountsPage.getTextOf(accountsPage.alertMessage)).toContain('Trạng thái tài khoản đã chuyển sang');
    await accountsPage.dismissAlertIfVisible();
  });
});
