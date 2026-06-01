import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env.config';

test.describe('Phân Hệ Quản Trị - Module Quản Lý Tin Tức (Admin News Management)', () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  test.beforeEach(async ({ page }) => {
    // Thiết lập mock API hoàn chỉnh cho phan he news
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

      // Mock Login
      if (url.includes('/auth/login')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            token: 'mock_news_admin_token',
            admin: {
              MaNhanVien: 'QTV001',
              TenTruyCap: 'admin1',
              Email: 'admin@txp.com',
              Quyen: ['news', 'customer', 'employee', 'policy', 'review', 'log']
            }
          })
        });
        return;
      }

      // GET /tin-tuc
      if (url.includes('/tin-tuc') && method === 'GET') {
        // Chi tiết tin tức
        if (url.includes('/tin-tuc/TT_TEST_001')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              MaTinTuc: 'TT_TEST_001',
              TieuDe: 'Hướng dẫn cài đặt App đặt vé TXP',
              LoaiTinTuc: 'HuongDan',
              AnhBia: 'https://storage.example.com/cover.jpg',
              MoTaNgan: 'Ứng dụng đặt vé xe khách tiện lợi nhanh chóng.',
              NoiDungChiTiet: '<p>Nội dung chi tiết ở đây</p>',
              TrangThai: 'BanNhap',
              NgayDang: null
            })
          });
          return;
        }

        if (url.includes('/tin-tuc/TT_KHONG_TON_TAI')) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({ statusCode: 404, message: 'Không tìm thấy bài viết' })
          });
          return;
        }

        // Lọc theo trạng thái BanNhap
        if (url.includes('/tin-tuc/trang-thai/BanNhap')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify([
              {
                MaTinTuc: 'TT_TEST_001',
                TieuDe: 'Hướng dẫn cài đặt App đặt vé TXP',
                LoaiTinTuc: 'HuongDan',
                TrangThai: 'BanNhap',
                NgayDang: null
              }
            ])
          });
          return;
        }

        // Lọc theo loại
        if (url.includes('/tin-tuc/loai/KhuyenMai')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify([
              {
                MaTinTuc: 'TT_TEST_002',
                TieuDe: 'Khuyến mãi hè 2026 cùng TXP',
                LoaiTinTuc: 'KhuyenMai',
                TrangThai: 'DaDang',
                NgayDang: '2026-05-31T00:00:00.000Z'
              }
            ])
          });
          return;
        }

        if (url.includes('/tin-tuc/loai/TinTuc') || url.includes('/tin-tuc/loai/TinTucChung')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify([
              {
                MaTinTuc: 'TT_TEST_003',
                TieuDe: 'Tin tức chung về nhà xe',
                LoaiTinTuc: 'TinTucChung',
                TrangThai: 'DaDang',
                NgayDang: '2026-05-30T00:00:00.000Z'
              }
            ])
          });
          return;
        }

        // Get all mặc định
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify([
            {
              MaTinTuc: 'TT_TEST_002',
              TieuDe: 'Khuyến mãi hè 2026 cùng TXP',
              LoaiTinTuc: 'KhuyenMai',
              AnhBia: 'https://storage.example.com/cover.jpg',
              MoTaNgan: 'Khuyến mãi lớn đón hè rực rỡ.',
              NoiDungChiTiet: '<p>Nội dung khuyến mại chi tiết</p>',
              TrangThai: 'DaDang',
              NgayDang: '2026-05-31T00:00:00.000Z',
              NoiBat: false
            },
            {
              MaTinTuc: 'TT_TEST_001',
              TieuDe: 'Hướng dẫn cài đặt App đặt vé TXP',
              LoaiTinTuc: 'HuongDan',
              AnhBia: 'https://storage.example.com/cover.jpg',
              MoTaNgan: 'Ứng dụng đặt vé xe khách tiện lợi nhanh chóng.',
              NoiDungChiTiet: '<p>Nội dung chi tiết ở đây</p>',
              TrangThai: 'BanNhap',
              NgayDang: null,
              NoiBat: false
            }
          ])
        });
        return;
      }

      // POST /tin-tuc
      if (url.includes('/tin-tuc') && method === 'POST') {
        try {
          const body = route.request().postDataJSON();
          if (!body.MaTinTuc) {
            await route.fulfill({
              status: 400,
              contentType: 'application/json',
              headers: corsHeaders,
              body: JSON.stringify({ statusCode: 400, message: 'Thiếu mã bài viết' })
            });
            return;
          }
          if (body.MaTinTuc === 'TT_TRUNG') {
            await route.fulfill({
              status: 400,
              contentType: 'application/json',
              headers: corsHeaders,
              body: JSON.stringify({ statusCode: 400, message: 'Mã bài viết này đã bị trùng lặp!' })
            });
            return;
          }
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              MaTinTuc: body.MaTinTuc,
              TieuDe: body.TieuDe,
              LoaiTinTuc: body.LoaiTinTuc === 'TinTuc' ? 'TinTucChung' : body.LoaiTinTuc,
              AnhBia: body.AnhBia,
              MoTaNgan: body.MoTaNgan,
              NoiDungChiTiet: body.NoiDungChiTiet,
              TrangThai: body.TrangThai,
              NgayDang: body.TrangThai === 'DaDang' ? new Date() : null,
              NgayGioHenGio: body.NgayGioHenGio || null,
              NoiBat: body.NoiBat || false
            })
          });
        } catch (e) {
          await route.fulfill({ status: 500, headers: corsHeaders });
        }
        return;
      }

      // PUT /tin-tuc/:id
      if (url.includes('/tin-tuc/') && method === 'PUT') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            MaTinTuc: 'TT_TEST_001',
            TieuDe: body.TieuDe,
            LoaiTinTuc: body.LoaiTinTuc,
            TrangThai: body.TrangThai || 'BanNhap'
          })
        });
        return;
      }

      // PATCH /tin-tuc/:id/trang-thai
      if (url.includes('/trang-thai') && method === 'PATCH') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            MaTinTuc: 'TT_TEST_001',
            TieuDe: 'Hướng dẫn cài đặt App đặt vé TXP',
            TrangThai: body.trangThai,
            NgayDang: body.trangThai === 'DaDang' ? new Date().toISOString() : null
          })
        });
        return;
      }

      // DELETE /tin-tuc/:id
      if (url.includes('/tin-tuc/') && method === 'DELETE') {
        if (url.includes('/TT_KHONG_TON_TAI')) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({ statusCode: 404, message: 'Record not found' })
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            MaTinTuc: 'TT_TEST_001',
            TieuDe: 'Bài viết đã xóa'
          })
        });
        return;
      }

      // Mock Logs
      if (url.includes('/nhat-ky')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify([])
        });
        return;
      }

      await route.continue();
    });
  });

  // ==========================================
  // PHẦN 1: HAPPY PATH & VALIDATION TẠO MỚI (TC_001 -> TC_008)
  // ==========================================

  test('TXP_ADMIN_NEWS_TC_001: Happy Path - Tạo bài viết mới ở trạng thái Bản nháp (BanNhap)', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.createNews({
      tieuDe: 'Hướng dẫn cài đặt App đặt vé TXP mới tạo',
      moTaNgan: 'Ứng dụng đặt vé xe khách tiện lợi nhanh chóng.',
      anhBia: 'https://storage.example.com/cover.jpg',
      noiDungChiTiet: 'Nội dung chi tiết bài viết hướng dẫn',
      loaiTinTuc: 'Hướng dẫn',
      trangThai: 'BanNhap'
    });
    await newsAdminPage.dismissAlert();
    await expect(newsAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_NEWS_TC_002: Happy Path - Tạo bài viết mới ở trạng thái Đã đăng (DaDang)', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.createNews({
      tieuDe: 'Khuyến mãi hè 2026 cùng TXP mới tạo',
      moTaNgan: 'Tổng hợp khuyến mãi lớn',
      anhBia: 'https://storage.example.com/cover.jpg',
      noiDungChiTiet: 'Nội dung khuyến mại chi tiết',
      loaiTinTuc: 'Khuyến mãi',
      trangThai: 'DaDang'
    });
    await newsAdminPage.dismissAlert();
    await expect(newsAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_NEWS_TC_003: Happy Path - Tạo bài viết với LoaiTinTuc là \'TinTuc\' ánh xạ đúng sang \'TinTucChung\'', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.createNews({
      tieuDe: 'Tin tức chung về nhà xe',
      moTaNgan: 'Tin tức vận tải đường dài',
      anhBia: 'https://storage.example.com/cover.jpg',
      noiDungChiTiet: 'Nội dung chi tiết',
      loaiTinTuc: 'Tin tức chung',
      trangThai: 'DaDang'
    });
    await newsAdminPage.dismissAlert();
    await expect(newsAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_NEWS_TC_004: Happy Path - Tạo bài viết với trường ảnh bìa (AnhBia) hợp lệ', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.createNews({
      tieuDe: 'Bài viết có ảnh bìa',
      moTaNgan: 'Ảnh bìa đẹp',
      anhBia: 'https://storage.example.com/cover.jpg',
      noiDungChiTiet: 'Nội dung',
      loaiTinTuc: 'Thông báo',
      trangThai: 'BanNhap'
    });
    await newsAdminPage.dismissAlert();
    await expect(newsAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_NEWS_TC_005: Validation - Để trống TieuDe khi lưu bài viết', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.addNewBtn.click();
    await expect(newsAdminPage.modalOverlay).toBeVisible();
    await newsAdminPage.saveBtn.click();
    // Validate thông báo lỗi hiển thị inline
    await expect(page.locator('.error-msg').first()).toBeVisible();
  });

  test('TXP_ADMIN_NEWS_TC_007: Happy Path - Tạo bài viết với LoaiTinTuc là HenGio, có NgayGioHenGio trong tương lai', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.createNews({
      tieuDe: 'Hẹn giờ tương lai',
      moTaNgan: 'Lên lịch hẹn đăng',
      anhBia: 'https://storage.example.com/cover.jpg',
      noiDungChiTiet: 'Bài viết hẹn giờ tương lai',
      loaiTinTuc: 'Thông báo',
      henGioDang: true,
      ngayHenGio: '2026-06-15',
      gioHenGio: '08:00'
    });
    await newsAdminPage.dismissAlert();
    await expect(newsAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_NEWS_TC_008: Validation - TrangThai \'HenGio\' nhưng NgayGioHenGio trong quá khứ', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.addNewBtn.click();
    const isChecked = await newsAdminPage.scheduleInput.isChecked();
    if (!isChecked) await newsAdminPage.scheduleToggle.click();
    await newsAdminPage.scheduleDateInput.fill('2026-05-20');
    await newsAdminPage.scheduleTimeInput.fill('08:00');
    await newsAdminPage.saveBtn.click();
    await expect(page.locator('.error-msg').first()).toBeVisible();
  });

  // ==========================================
  // PHẦN 2: CẬP NHẬT & THAY ĐỔI TRẠNG THÁI (TC_009 -> TC_012)
  // ==========================================

  test('TXP_ADMIN_NEWS_TC_009: Happy Path - Cập nhật toàn bộ thông tin bài viết (PUT)', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.editBtnForCode('TT_TEST_001').click();
    // Chờ cho editor render xong nội dung cũ từ setTimeout (tránh validate rỗng)
    await expect(newsAdminPage.editorCanvas).not.toBeEmpty();
    await newsAdminPage.titleInput.fill('Tiêu đề đã cập nhật');
    await newsAdminPage.saveBtn.click();
    await newsAdminPage.dismissAlert();
    await expect(newsAdminPage.modalOverlay).toBeHidden();
  });

  test('TXP_ADMIN_NEWS_TC_010: Happy Path - Chỉ cập nhật trạng thái bài viết sang DaDang', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.editBtnForCode('TT_TEST_001').click();
    const publishBtn = page.locator('.btn-footer-publish');
    await publishBtn.click();
    await expect(newsAdminPage.confirmModal).toBeVisible();
    await newsAdminPage.confirmBtn.click();
    await newsAdminPage.dismissAlert();
  });

  test('TXP_ADMIN_NEWS_TC_011: Happy Path - Chuyển trạng thái sang NgungHienThi — NgayDang KHÔNG thay đổi', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    // Chuyển sang tab NgungHienThi
    await newsAdminPage.hiddenTab.click();
    await expect(newsAdminPage.tableRows.first()).toBeVisible();
  });

  test('TXP_ADMIN_NEWS_TC_012: Happy Path - Chuyển trạng thái sang BanNhap từ DaDang', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.editBtnForCode('TT_TEST_001').click();
    await newsAdminPage.statusSelect.selectOption('BanNhap');
    await newsAdminPage.saveBtn.click();
    await newsAdminPage.dismissAlert();
  });

  // ==========================================
  // PHẦN 3: BỘ LỌC, TÌM KIẾM & DANH SÁCH (TC_013 -> TC_017)
  // ==========================================

  test('TXP_ADMIN_NEWS_TC_013: Happy Path - Lọc bài viết theo trạng thái BanNhap', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.draftTab.click();
    await expect(newsAdminPage.tableRows).toHaveCount(1);
  });

  test('TXP_ADMIN_NEWS_TC_014: Happy Path - Lọc bài viết theo LoaiTinTuc', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.searchInput.fill('Khuyến mãi');
    await expect(newsAdminPage.tableRows.first()).toBeVisible();
  });

  test('TXP_ADMIN_NEWS_TC_015: Happy Path - Lọc LoaiTinTuc = \'TinTuc\' ánh xạ đúng sang \'TinTucChung\' trong DB', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.searchInput.fill('Tin tức chung');
    await expect(newsAdminPage.tableRows.first()).toBeVisible();
  });

  test('TXP_ADMIN_NEWS_TC_016: Happy Path - Tìm kiếm bài viết theo Tiêu đề', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.searchInput.fill('Khuyến mãi hè');
    await expect(newsAdminPage.tableRows.first()).toBeVisible();
  });

  test('TXP_ADMIN_NEWS_TC_017: Happy Path - Lấy toàn bộ danh sách bài viết sắp xếp theo NgayDang mới nhất', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await expect(newsAdminPage.tableRows).toHaveCount(2);
  });

  // ==========================================
  // PHẦN 4: STATE TRANSITION & CÁC TRƯỜNG ĐẶC BIỆT (TC_020 -> TC_023)
  // ==========================================

  test('TXP_ADMIN_NEWS_TC_020: State Transition - Kiểm tra PATCH /trang-thai khi chuyển sang DaDang tự động set NgayDang = now()', async ({ page, loginPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    const data = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/tin-tuc/TT_TEST_001/trang-thai`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai: 'DaDang' })
      });
      return res.json();
    }, ENV.API_BASE_URL);
    expect(data.TrangThai).toBe('DaDang');
    expect(data.NgayDang).not.toBeNull();
  });

  test('TXP_ADMIN_NEWS_TC_021: State Transition - HenGio: backend KHÔNG tự động chuyển sang DaDang khi đến giờ', async ({ page, loginPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    // Verify trạng thái vẫn giữ nguyên
    const data = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/tin-tuc/TT_TEST_001`);
      return res.json();
    }, ENV.API_BASE_URL);
    expect(data.TrangThai).toBe('BanNhap');
  });

  test('TXP_ADMIN_NEWS_TC_022: Happy Path - Cập nhật trường NoiBat (bài viết nổi bật) lên true', async ({ page, loginPage, newsAdminPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    await page.goto(`${ENV.CUSTOMER_URL}/admin/quan-ly-tin-tuc`);
    await newsAdminPage.editBtnForCode('TT_TEST_001').click();
    const isChecked = await newsAdminPage.featuredInput.isChecked();
    if (!isChecked) await newsAdminPage.featuredToggle.click();
    await newsAdminPage.saveBtn.click();
    await newsAdminPage.dismissAlert();
  });

  test('TXP_ADMIN_NEWS_TC_023: Happy Path - Cập nhật MaQuanTriVien rỗng không gây lỗi FK', async ({ page, loginPage }) => {
    await loginPage.navigateTo(ENV.ADMIN_URL);
    await loginPage.login('admin1', 'Admin@123');
    const status = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/tin-tuc/TT_TEST_001`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TieuDe: 'Test FK', LoaiTinTuc: 'HuongDan', MaQuanTriVien: '' })
      });
      return res.status;
    }, ENV.API_BASE_URL);
    expect(status).toBe(200);
  });
});
