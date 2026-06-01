import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env.config';

test.describe('Phân Hệ Quản Trị - Module Quản Lý Nhật Ký Hoạt Động (Admin Logs Management)', () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Mock dữ liệu logs mẫu đầy đủ các vai trò, thao tác
  const mockLogs = [
    {
      MaNhatKy: 'TXP_LOG_1780232078478_K5ZFZ9',
      MaKhachHang: 'KH100001',
      MaNhanVien: null,
      LoaiThaoTac: 'Đăng nhập',
      ThoiGian: '2026-05-31T12:54:38.478Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Khách hàng đăng nhập thành công vào hệ thống.',
      DuLieuThayDoi: null,
      MaVe: null,
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: null,
      TrangThaiMoi: null,
      TuyenXe: null,
      KHACH_HANG: {
        HoTenKhachHang: 'Đỗ Thanh Phương',
        SoDienThoai: '0912345678'
      },
      NHAN_VIEN: null
    },
    {
      MaNhatKy: 'TXP_LOG_1780231434397_V71HZU',
      MaKhachHang: null,
      MaNhanVien: 'QTV100001',
      LoaiThaoTac: 'Đăng nhập',
      ThoiGian: '2026-05-31T12:43:54.397Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Quản trị viên đăng nhập thành công.',
      DuLieuThayDoi: null,
      MaVe: null,
      ThietBiTrinhDuyet: 'Firefox / macOS',
      TrangThai: 'Thành công',
      TrangThaiCu: null,
      TrangThaiMoi: null,
      TuyenXe: null,
      KHACH_HANG: null,
      NHAN_VIEN: {
        TenHienThi: 'Nguyen An Ninh',
        SoDienThoai: '0988888888',
        LoaiTaiKhoan: 'QuanTriVien'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_1780231172366_RU2BIX',
      MaKhachHang: 'KH100132',
      MaNhanVien: null,
      LoaiThaoTac: 'Chỉnh sửa thông tin vé',
      ThoiGian: '2026-05-31T12:39:32.366Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Khách hàng chỉnh sửa thông tin vé.',
      DuLieuThayDoi: [
        { truong: 'TenNguoiDi', giaTriCu: 'Mỹ Mỹ', giaTriMoi: 'Mỹ Mỹ Sửa' }
      ],
      MaVe: 'VE-00987',
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: 'ChoKhoiHanh',
      TrangThaiMoi: 'ChoKhoiHanh',
      TuyenXe: 'Bình Định - TP. Hồ Chí Minh',
      KHACH_HANG: {
        HoTenKhachHang: 'Mỹ Mỹ',
        SoDienThoai: '0977777777'
      },
      NHAN_VIEN: null
    },
    {
      MaNhatKy: 'TXP_LOG_1780230962537_N9P525',
      MaKhachHang: 'KH100132',
      MaNhanVien: null,
      LoaiThaoTac: 'Đặt vé',
      ThoiGian: '2026-05-31T12:36:02.537Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Đặt vé xe thành công.',
      DuLieuThayDoi: null,
      MaVe: 'VE-00988',
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: null,
      TrangThaiMoi: 'ChoThanhToan',
      TuyenXe: 'Bình Định - TP. Hồ Chí Minh',
      KHACH_HANG: {
        HoTenKhachHang: 'Mỹ Mỹ',
        SoDienThoai: '0977777777'
      },
      NHAN_VIEN: null
    },
    {
      MaNhatKy: 'TXP_LOG_1780228841399_BDOFQY',
      MaKhachHang: null,
      MaNhanVien: 'CL100303',
      LoaiThaoTac: 'Đăng nhập',
      ThoiGian: '2026-05-31T12:00:41.399Z',
      DiaChiIP: '192.168.1.100',
      NoiDungChiTiet: 'Nhân viên bán vé đăng nhập hệ thống.',
      DuLieuThayDoi: null,
      MaVe: null,
      ThietBiTrinhDuyet: 'Safari / iOS',
      TrangThai: 'Thành công',
      TrangThaiCu: null,
      TrangThaiMoi: null,
      TuyenXe: null,
      KHACH_HANG: null,
      NHAN_VIEN: {
        TenHienThi: 'Trần Thị Trang',
        SoDienThoai: '0966666666',
        LoaiTaiKhoan: 'NhanVienBanVe'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_1780228813305_S6CW6N',
      MaKhachHang: null,
      MaNhanVien: 'CL100303',
      LoaiThaoTac: 'Quản lý vé (thay khách)',
      ThoiGian: '2026-05-30T12:00:13.305Z',
      DiaChiIP: '192.168.1.100',
      NoiDungChiTiet: 'Hủy vé thay khách thất bại do quá hạn.',
      DuLieuThayDoi: null,
      MaVe: 'VE-00989',
      ThietBiTrinhDuyet: 'Safari / iOS',
      TrangThai: 'Thất bại',
      TrangThaiCu: 'ChoKhoiHanh',
      TrangThaiMoi: 'ChoKhoiHanh',
      TuyenXe: 'Gia Lai - Sài Gòn',
      KHACH_HANG: null,
      NHAN_VIEN: {
        TenHienThi: 'Trần Thị Trang',
        SoDienThoai: '0966666666',
        LoaiTaiKhoan: 'NhanVienBanVe'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_1780228806940_2PZ5TF',
      MaKhachHang: null,
      MaNhanVien: 'NV001',
      LoaiThaoTac: 'Đổi mật khẩu',
      ThoiGian: '2026-05-29T12:00:06.940Z',
      DiaChiIP: '192.168.1.100',
      NoiDungChiTiet: 'Nhan vien doi mat khau tai khoan Admin.',
      DuLieuThayDoi: null,
      MaVe: null,
      ThietBiTrinhDuyet: 'Chrome / Linux',
      TrangThai: 'Thành công',
      TrangThaiCu: null,
      TrangThaiMoi: null,
      TuyenXe: null,
      KHACH_HANG: null,
      NHAN_VIEN: {
        TenHienThi: 'Trần Văn Anh',
        SoDienThoai: '0955555555',
        LoaiTaiKhoan: 'NhanVienBanVe'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_1748649600000_ABC123',
      MaKhachHang: 'KH100001',
      MaNhanVien: 'QTV100001',
      LoaiThaoTac: 'Quản lý tài khoản',
      ThoiGian: '2026-05-28T05:00:00.000Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Khóa tài khoản khách hàng: KH100001. Lý do: Spam đặt vé',
      DuLieuThayDoi: [
        { truong: 'TrangThaiTaiKhoan', giaTriCu: 'HoatDong', giaTriMoi: 'DaKhoa' },
        { truong: 'LyDoKhoa', giaTriCu: null, giaTriMoi: 'Spam đặt vé' }
      ],
      MaVe: null,
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: 'HoatDong',
      TrangThaiMoi: 'DaKhoa',
      TuyenXe: null,
      KHACH_HANG: {
        HoTenKhachHang: 'Đỗ Thanh Phương',
        SoDienThoai: '0912345678'
      },
      NHAN_VIEN: {
        TenHienThi: 'Nguyen An Ninh',
        SoDienThoai: '0988888888',
        LoaiTaiKhoan: 'QuanTriVien'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_1780228806940_3PZ5TF',
      MaKhachHang: 'KH100002',
      MaNhanVien: 'QTV100001',
      LoaiThaoTac: 'Quản lý tài khoản',
      ThoiGian: '2026-05-27T03:00:00.000Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Mở khóa tài khoản khách hàng KH100002',
      DuLieuThayDoi: [
        { truong: 'TrangThaiTaiKhoan', giaTriCu: 'DaKhoa', giaTriMoi: 'HoatDong' }
      ],
      MaVe: null,
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: 'DaKhoa',
      TrangThaiMoi: 'HoatDong',
      TuyenXe: null,
      KHACH_HANG: {
        HoTenKhachHang: 'Nguyễn Văn B',
        SoDienThoai: '0922222222'
      },
      NHAN_VIEN: {
        TenHienThi: 'Nguyen An Ninh',
        SoDienThoai: '0988888888',
        LoaiTaiKhoan: 'QuanTriVien'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_1780228806940_4PZ5TF',
      MaKhachHang: 'KH100003',
      MaNhanVien: 'QTV100001',
      LoaiThaoTac: 'Tạo mới',
      ThoiGian: '2026-05-26T02:30:00.000Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Tạo mới tài khoản khách hàng: Nguyễn Văn Test',
      DuLieuThayDoi: null,
      MaVe: null,
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: null,
      TrangThaiMoi: 'HoatDong',
      TuyenXe: null,
      KHACH_HANG: {
        HoTenKhachHang: 'Nguyễn Văn Test',
        SoDienThoai: '0933333333'
      },
      NHAN_VIEN: {
        TenHienThi: 'Nguyen An Ninh',
        SoDienThoai: '0988888888',
        LoaiTaiKhoan: 'QuanTriVien'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_1780228806940_5PZ5TF',
      MaKhachHang: 'KH100001',
      MaNhanVien: 'QTV100001',
      LoaiThaoTac: 'Cập nhật thông tin cá nhân',
      ThoiGian: '2026-05-25T01:20:00.000Z',
      DiaChiIP: '127.0.0.1',
      NoiDungChiTiet: 'Cập nhật thông tin khách hàng KH100001',
      DuLieuThayDoi: [
        { truong: 'HoTen', giaTriCu: 'Nguyễn Văn A', giaTriMoi: 'Nguyễn Văn A Sửa' }
      ],
      MaVe: null,
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: 'Nguyễn Văn A',
      TrangThaiMoi: 'Nguyễn Văn A Sửa',
      TuyenXe: null,
      KHACH_HANG: {
        HoTenKhachHang: 'Nguyễn Văn A Sửa',
        SoDienThoai: '0912345678'
      },
      NHAN_VIEN: {
        TenHienThi: 'Nguyen An Ninh',
        SoDienThoai: '0988888888',
        LoaiTaiKhoan: 'QuanTriVien'
      }
    },
    {
      MaNhatKy: 'TXP_LOG_OTHER_001',
      MaKhachHang: null,
      MaNhanVien: 'DP100002',
      LoaiThaoTac: 'Quản lý lịch trình',
      ThoiGian: '2026-05-02T03:00:00.000Z',
      DiaChiIP: '192.168.1.50',
      NoiDungChiTiet: 'Cập nhật lịch trình xe chạy.',
      DuLieuThayDoi: null,
      MaVe: null,
      ThietBiTrinhDuyet: 'Chrome / Windows',
      TrangThai: 'Thành công',
      TrangThaiCu: null,
      TrangThaiMoi: null,
      TuyenXe: null,
      KHACH_HANG: null,
      NHAN_VIEN: {
        TenHienThi: 'Lê Điều Phối',
        SoDienThoai: '0944444444',
        LoaiTaiKhoan: 'NhanVienDieuPhoi'
      }
    }
  ];

  // Helper thực hiện login an toàn bằng form UI thực tế và điều hướng như news module
  async function loginAndNavigateToLogs(page: any, loginPage: any) {
    // Dọn dẹp session cũ để tránh tự động đăng nhập sai trạng thái
    await page.context().clearCookies();
    await page.goto(ENV.ADMIN_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Nạp lại trang đăng nhập sau khi dọn sạch storage
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-nhat-ky`);
    // Đợi tiêu đề trang xuất hiện rõ ràng để thay thế networkidle dễ bị timeout
    await expect(page.getByRole('heading', { name: 'Quản lý nhật ký hoạt động' })).toBeVisible({ timeout: 15000 });
  }

  test.beforeEach(async ({ page }) => {
    // Mock API Auth và Nhật ký hệ thống
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

      // Mock login
      if (url.includes('/auth/login')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            token: 'mock_jwt_token_admin',
            admin: {
              MaNhanVien: 'NV001',
              TenTruyCap: 'admin1',
              Email: 'admin1@txp.com',
              TrangThai: 'HoatDong',
              Quyen: ['news', 'customer', 'employee', 'policy', 'review', 'log']
            }
          })
        });
        return;
      }

      // Mock GET /nhat-ky
      if (url.includes('/nhat-ky') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify(mockLogs)
        });
        return;
      }

      await route.continue();
    });
  });

  // ==========================================
  // PHẦN 1: HAPPY PATH - TẢI DANH SÁCH & STATS (TC_001 -> TC_008)
  // ==========================================

  test('TXP_ADMIN_LOGS_TC_001: Happy Path - Tải danh sách toàn bộ nhật ký hệ thống thành công', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Assert
    await expect(page.getByRole('heading', { name: 'Quản lý nhật ký hoạt động' })).toBeVisible();
    const rows = logsAdminPage.tableRows;
    await expect(rows).toHaveCount(10); // Trang 1 mặc định hiển thị tối đa 10 bản ghi
    
    // Kiểm tra dòng đầu tiên hiển thị đúng sắp xếp giảm dần theo thời gian (2026-05-31 19:54:38)
    const firstRowText = await rows.first().innerText();
    expect(firstRowText).toContain('TXP_LOG_1780232078478_K5ZFZ9');
    expect(firstRowText).toContain('Đỗ Thanh Phương');
  });

  test('TXP_ADMIN_LOGS_TC_002: Happy Path - Dashboard stats hiển thị đúng thống kê nhật ký trong ngày hôm nay', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Assert
    await expect(logsAdminPage.totalTodayStat).toBeVisible();
    await expect(logsAdminPage.loginSuccessStat).toBeVisible();
    await expect(logsAdminPage.failedActionStat).toBeVisible();
    await expect(logsAdminPage.ticketTodayStat).toBeVisible();
  });

  test('TXP_ADMIN_LOGS_TC_003: Happy Path - Tự động ghi log khi nhân viên đăng nhập thành công', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Tìm kiếm banve1 (mã nhân viên banve1 hoặc thông tin đăng nhập)
    await logsAdminPage.filterLogs({ searchTerm: 'CL100303' });

    // Assert: Có 1 bản ghi log mới của nhân viên bán vé đăng nhập
    const row = logsAdminPage.tableRows.first();
    await expect(row).toContainText('Trần Thị Trang');
    await expect(row).toContainText('Đăng nhập');
    await expect(row).toContainText('Thành công');
  });

  test('TXP_ADMIN_LOGS_TC_004: Happy Path - Tự động ghi log khi khóa tài khoản khách hàng', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'TXP_LOG_1748649600000_ABC123' });

    // Assert
    const row = logsAdminPage.tableRows.first();
    await expect(row).toContainText('Quản lý tài khoản');
    await expect(row).toContainText('Thành công');
    await expect(row).toContainText('KH100001');
  });

  test('TXP_ADMIN_LOGS_TC_005: Happy Path - Tự động ghi log khi mở khóa tài khoản khách hàng', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'KH100002' });

    // Assert
    const row = logsAdminPage.tableRows.first();
    await expect(row).toContainText('Quản lý tài khoản');
    await expect(row).toContainText('Thành công');
  });

  test('TXP_ADMIN_LOGS_TC_006: Happy Path - Tự động ghi log khi tạo mới khách hàng', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'Nguyễn Văn Test' });

    // Assert
    const row = logsAdminPage.tableRows.first();
    await expect(row).toContainText('Tạo mới');
    await expect(row).toContainText('Thành công');
  });

  test('TXP_ADMIN_LOGS_TC_007: Happy Path - Tự động ghi log khi cập nhật thông tin khách hàng', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'Nguyễn Văn A Sửa' });

    // Assert
    const row = logsAdminPage.tableRows.first();
    await expect(row).toContainText('Cập nhật thông tin cá nhân');
    await expect(row).toContainText('Thành công');
  });

  test('TXP_ADMIN_LOGS_TC_008: Happy Path - Tự động ghi log khi nhân viên đổi mật khẩu', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'Trần Văn Anh' });

    // Assert
    const row = logsAdminPage.tableRows.first();
    await expect(row).toContainText('Đổi mật khẩu');
    await expect(row).toContainText('Thành công');
  });

  // ==========================================
  // PHẦN 2: HAPPY PATH - BỘ LỌC (TC_009 -> TC_013 & TC_021, TC_022, TC_033)
  // ==========================================

  test('TXP_ADMIN_LOGS_TC_009: Happy Path - Lọc nhật ký theo khoảng thời gian hợp lệ', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Chọn khoảng thời gian từ 2026-05-28 đến 2026-05-29
    await logsAdminPage.filterLogs({ fromDate: '2026-05-28', toDate: '2026-05-29' });

    // Assert: chỉ chứa các log phát sinh trong khoảng thời gian này
    await expect(logsAdminPage.tableRows).toHaveCount(2);
    const row1 = await logsAdminPage.tableRows.nth(0).innerText();
    const row2 = await logsAdminPage.tableRows.nth(1).innerText();
    expect(row1).toContain('2026-05-29');
    expect(row2).toContain('2026-05-28');
  });

  test('TXP_ADMIN_LOGS_TC_010: Happy Path - Lọc nhật ký theo Vai trò người thực hiện (Khách hàng)', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ role: 'Khách hàng' });

    // Assert: các log có vai trò khách hàng được hiển thị
    const count = await logsAdminPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(logsAdminPage.tableRows.nth(i)).toContainText('Khách hàng');
    }
  });

  test('TXP_ADMIN_LOGS_TC_011: Happy Path - Lọc nhật ký theo Vai trò người thực hiện (Bán vé)', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ role: 'Bán vé' });

    // Assert
    const count = await logsAdminPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(logsAdminPage.tableRows.nth(i)).toContainText('Bán vé');
    }
  });

  test('TXP_ADMIN_LOGS_TC_012: Happy Path - Lọc nhật ký theo Loại thao tác (Đăng nhập)', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ action: 'Đăng nhập' });

    // Assert
    const count = await logsAdminPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(logsAdminPage.tableRows.nth(i)).toContainText('Đăng nhập');
    }
  });

  test('TXP_ADMIN_LOGS_TC_013: Happy Path - Lọc nhật ký theo Trạng thái Thất bại', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ status: 'Thất bại' });

    // Assert
    const count = await logsAdminPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(logsAdminPage.tableRows.nth(i)).toContainText('Thất bại');
    }
  });

  // ==========================================
  // PHẦN 3: HAPPY PATH - TÌM KIẾM (TC_014 -> TC_020)
  // ==========================================

  test('TXP_ADMIN_LOGS_TC_014: Happy Path - Tìm kiếm nhật ký theo Mã nhật ký (MaNhatKy)', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'TXP_LOG_1748649600000_ABC123' });

    // Assert
    await expect(logsAdminPage.tableRows).toHaveCount(1);
    await expect(logsAdminPage.tableRows.first()).toContainText('TXP_LOG_1748649600000_ABC123');
  });

  test('TXP_ADMIN_LOGS_TC_015: Happy Path - Tìm kiếm nhật ký theo tên người thực hiện', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'Trần Văn Anh' });

    // Assert
    await expect(logsAdminPage.tableRows.first()).toContainText('Trần Văn Anh');
  });

  test('TXP_ADMIN_LOGS_TC_016: Happy Path - Tìm kiếm nhật ký theo Mã nhân viên', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'NV001' });

    // Assert
    await expect(logsAdminPage.tableRows.first()).toContainText('Trần Văn Anh');
  });

  test('TXP_ADMIN_LOGS_TC_017: Happy Path - Tìm kiếm nhật ký theo Số điện thoại', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: '0912345678' });

    // Assert
    await expect(logsAdminPage.tableRows.first()).toContainText('Đỗ Thanh Phương');
  });

  test('TXP_ADMIN_LOGS_TC_018: Happy Path - Tìm kiếm nhật ký theo Địa chỉ IP', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: '192.168.1.100' });

    // Assert
    const count = await logsAdminPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(logsAdminPage.tableRows.nth(i)).toContainText('192.168.1.100');
    }
  });

  test('TXP_ADMIN_LOGS_TC_019: Happy Path - Tìm kiếm nhật ký theo Mã vé', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'VE-00987' });

    // Assert
    await expect(logsAdminPage.tableRows).toHaveCount(1);
    await expect(logsAdminPage.tableRows.first()).toContainText('Mỹ Mỹ');
  });

  test('TXP_ADMIN_LOGS_TC_020: Alternate Path - Tìm kiếm từ khóa không tồn tại trong nhật ký', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({ searchTerm: 'NOTEXIST_XYZ_999' });

    // Assert: Bảng không hiển thị dòng nào hoặc hiện "không tìm thấy kết quả"
    await expect(logsAdminPage.tableRows).toHaveCount(0);
  });

  test('TXP_ADMIN_LOGS_TC_021: Happy Path - Kết hợp nhiều filter cùng lúc (Vai trò + Loại thao tác + Khoảng ngày)', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    await logsAdminPage.filterLogs({
      role: 'Bán vé',
      action: 'Quản lý vé (thay khách)',
      fromDate: '2026-05-01',
      toDate: '2026-05-31'
    });

    // Assert: chỉ chứa bản ghi thỏa đồng thời
    await expect(logsAdminPage.tableRows).toHaveCount(1);
    await expect(logsAdminPage.tableRows.first()).toContainText('CL100303');
    await expect(logsAdminPage.tableRows.first()).toContainText('Quản lý vé (thay khách)');
  });

  test('TXP_ADMIN_LOGS_TC_022: Happy Path - Reset filter về mặc định', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Gán filter
    await logsAdminPage.filterLogs({ role: 'Bán vé', status: 'Thất bại' });
    await expect(logsAdminPage.tableRows).toHaveCount(1);

    // Reset
    await logsAdminPage.resetFilters();

    // Assert: bộ lọc quay về mặc định và danh sách lại đầy đủ
    await expect(logsAdminPage.searchInput).toHaveValue('');
    await expect(logsAdminPage.tableRows).toHaveCount(10);
  });

  // ==========================================
  // PHẦN 4: VALIDATION KHOẢNG NGÀY & XEM CHI TIẾT (TC_023 -> TC_025)
  // ==========================================

  test('TXP_ADMIN_LOGS_TC_023: Validation - Chọn khoảng thời gian Từ ngày lớn hơn Đến ngày', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Đăng ký dialog listener TRƯỚC khi thực hiện hành động kích hoạt dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Từ ngày không được lớn hơn Đến ngày');
      await dialog.accept();
    });

    // Đặt từ ngày > đến ngày
    await logsAdminPage.filterLogs({ fromDate: '2026-05-30', toDate: '2026-05-28' });
  });

  test('TXP_ADMIN_LOGS_TC_024: Happy Path - Xem chi tiết bản ghi nhật ký (modal)', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Click xem chi tiết bản ghi có dữ liệu thay đổi
    await logsAdminPage.viewDetailBtnForLog('TXP_LOG_1748649600000_ABC123').click();

    // Assert: modal chi tiết nhật ký mở ra với đầy đủ thông tin
    await expect(logsAdminPage.detailModal).toBeVisible();
    await expect(logsAdminPage.detailModalTitle).toContainText('Chi tiết nhật ký hoạt động');
    await expect(logsAdminPage.detailModalContent).toContainText('TXP_LOG_1748649600000_ABC123');
    await expect(logsAdminPage.detailModalContent).toContainText('Đỗ Thanh Phương');
    await expect(logsAdminPage.detailModalContent).toContainText('TrangThaiTaiKhoan');
  });

  test('TXP_ADMIN_LOGS_TC_025: Happy Path - Đóng modal chi tiết nhật ký', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Mở modal
    await logsAdminPage.viewDetailBtnForLog('TXP_LOG_1748649600000_ABC123').click();
    await expect(logsAdminPage.detailModal).toBeVisible();

    // Click đóng
    await logsAdminPage.closeDetailBtn.first().click();

    // Assert: modal đóng lại
    await expect(logsAdminPage.detailModal).toBeHidden();
  });

  // ==========================================
  // PHẦN 5: PHÂN TRANG & XUẤT EXCEL (TC_026 -> TC_029 & TC_033)
  // ==========================================

  test('TXP_ADMIN_LOGS_TC_026: Happy Path - Phân trang danh sách nhật ký', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Assert: Trang 1 hiển thị 10 dòng đầu
    await expect(logsAdminPage.tableRows).toHaveCount(10);

    // Chuyển trang 2
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    await page2Btn.click();

    // Assert: Trang 2 hiển thị các dòng tiếp theo (hệ thống có 12 logs mock)
    await expect(logsAdminPage.tableRows).toHaveCount(2);
  });

  test('TXP_ADMIN_LOGS_TC_027: Happy Path - Thay đổi số bản ghi hiển thị mỗi trang', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Chọn hiển thị 20/trang
    const sizeSelect = page.locator('select').nth(3); // Combobox số hàng hiển thị
    await sizeSelect.selectOption({ label: '20 / trang' });

    // Assert: Danh sách hiển thị toàn bộ 12 bản ghi trên 1 trang
    await expect(logsAdminPage.tableRows).toHaveCount(12);
  });

  test('TXP_ADMIN_LOGS_TC_028: Happy Path - Xuất nhật ký ra file CSV thành công', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Lắng nghe sự kiện download
    const downloadPromise = page.waitForEvent('download');
    await logsAdminPage.exportBtn.click();
    const download = await downloadPromise;

    // Assert
    expect(download.suggestedFilename()).toContain('TXP_Combined_Logs_');
  });

  test('TXP_ADMIN_LOGS_TC_029: Happy Path - Xuất CSV khi đang áp dụng filter chỉ xuất dữ liệu đã lọc', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Lọc vai trò Bán vé
    await logsAdminPage.filterLogs({ role: 'Bán vé' });
    await expect(logsAdminPage.tableRows).toHaveCount(3); // 3 bản ghi Bán vé

    // Lắng nghe sự kiện download
    const downloadPromise = page.waitForEvent('download');
    await logsAdminPage.exportBtn.click();
    const download = await downloadPromise;

    // Assert
    expect(download.suggestedFilename()).toContain('TXP_Combined_Logs_');
  });

  test('TXP_ADMIN_LOGS_TC_033: Happy Path - Filter ngày mặc định tự động set từ đầu tháng đến hôm nay', async ({ page, loginPage, logsAdminPage }) => {
    // Arrange & Act
    await loginAndNavigateToLogs(page, loginPage);

    // Assert: Giá trị mặc định của 2 ô input ngày
    const fromDateValue = await logsAdminPage.fromDateInput.inputValue();
    const toDateValue = await logsAdminPage.toDateInput.inputValue();

    expect(fromDateValue).toMatch(/^\d{4}-\d{2}-01$/); // ngày đầu tiên của tháng
    expect(toDateValue).not.toBeNull();
  });
});
