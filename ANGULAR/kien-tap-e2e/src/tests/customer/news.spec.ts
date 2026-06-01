import { test, expect, ENV } from '../../fixtures/base.fixture';

test.describe('Phân Hệ Khách Hàng - Module Tin Tức (Customer News)', () => {
  // Mock Data theo đúng cấu trúc của Database/API
  const mockFeaturedNews = {
    MaTinTuc: 'TT100011',
    TieuDe: 'TXP mo them chuyen Ha Noi - Quang Ninh',
    NgayDang: '2026-05-28T00:00:00.000Z',
    MoTaNgan: 'Tang cuong chuyen cuoi tuan phuc vu nhu cau di lai.',
    AnhBia: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
    LoaiTinTuc: 'ThongBao'
  };

  const mockLatestNews = [
    {
      MaTinTuc: 'TT100011',
      TieuDe: 'TXP mo them chuyen Ha Noi - Quang Ninh',
      NgayDang: '2026-05-28T00:00:00.000Z',
      MoTaNgan: 'Tang cuong chuyen cuoi tuan phuc vu nhu cau di lai.',
      AnhBia: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
      LoaiTinTuc: 'ThongBao'
    },
    {
      MaTinTuc: 'TT100012',
      TieuDe: 'Tân Xuân Phúc Cập Nhật Lịch Trình 6 Chuyến Cố Định Mỗi Ngày Tăng Cường Phục Vụ Hành Khách',
      NgayDang: '2026-05-24T00:00:00.000Z',
      MoTaNgan: 'Nhằm đáp ứng nhu cầu đi lại ngày càng cao của hành khách, nhà xe Tân Xuân Phúc chính thức vận hành ổn định tần suất 6 chuyến/ngày cả hai chiều đi và về.',
      AnhBia: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e',
      LoaiTinTuc: 'ThongBao'
    },
    {
      MaTinTuc: 'TT100013',
      TieuDe: 'Ưu Đãi Hè Rực Rỡ: Giảm Ngay 10% Giá Vé Phòng Limousine Khi Đặt Vé Khứ Hồi',
      NgayDang: '2026-05-24T00:00:00.000Z',
      MoTaNgan: 'Đón mùa du lịch hè 2026, Tân Xuân Phúc tung chương trình ưu đãi cực lớn, giảm thẳng 10% giá vé cho chiều về khi khách hàng đặt combo vé khứ hồi.',
      AnhBia: 'https://images.unsplash.com/photo-1562618956-4293e6801aa4',
      LoaiTinTuc: 'KhuyenMai'
    }
  ];

  const mockSubFeaturedNews = [
    {
      MaTinTuc: 'TT100014',
      TieuDe: 'Mở Rộng Lộ Trình Đón Trả Khách Tận Nơi Tại Khu Vực Bến Xe Bến Cát (Bình Dương)',
      NgayDang: '2026-05-24T00:00:00.000Z',
      MoTaNgan: 'Tin vui cho bà con Bình Định - Phú Yên đang sinh sống và làm việc tại Bình Dương: Tân Xuân Phúc hiện đã chính thức mở rộng điểm đón trả khách tại Bến xe Bến Cát.',
      AnhBia: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f',
      LoaiTinTuc: 'ThongBao'
    },
    {
      MaTinTuc: 'TT100015',
      TieuDe: 'Tân Xuân Phúc Chính Thức Vận Hành Dòng Xe THACO Mobihome 22 Phòng Premium Cao Cấp',
      NgayDang: '2026-05-24T00:00:00.000Z',
      MoTaNgan: 'Đánh dấu bước chuyển mình, Tân Xuân Phúc tự hào đưa vào phục vụ hành khách dàn chuyên cơ mặt đất THACO Mobihome 22 Phòng Premium thế hệ mới trên tuyến Bình Định - Phú Yên đi TP.HCM và Bình Dương.',
      AnhBia: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
      LoaiTinTuc: 'TinTucChung'
    }
  ];

  const mockAllNewsItemsPage1 = [
    ...mockLatestNews,
    ...mockSubFeaturedNews
  ];

  const mockAllNewsItemsPage2 = [
    {
      MaTinTuc: 'TT100016',
      TieuDe: 'Cẩm nang đi du lịch Quy Nhơn bằng xe giường nằm Tân Xuân Phúc siêu tiết kiệm',
      NgayDang: '2026-05-20T00:00:00.000Z',
      MoTaNgan: 'Quy Nhơn - thiên đường biển xanh cát trắng nắng vàng đang chờ đón bạn. Lưu ngay cẩm nang di chuyển này nhé!',
      AnhBia: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
      LoaiTinTuc: 'HuongDan'
    }
  ];

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message, err.stack));
    page.on('request', request => console.log('>> REQUEST:', request.method(), request.url()));
    page.on('response', response => console.log('<< RESPONSE:', response.status(), response.url()));

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    await page.route(/customer\/tin-tuc/, async (route) => {
      console.log('INTERCEPTED:', route.request().url());
      const url = new URL(route.request().url());
      
      const pageParam = url.searchParams.get('page') || '1';
      const categoryParam = url.searchParams.get('loai') || '';
      const searchParam = url.searchParams.get('search') || '';

      // Tách phần cuối cùng của đường dẫn để kiểm tra xem có phải ID chi tiết không
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      console.log('PATHNAME:', url.pathname, 'LASTPART:', lastPart);

      // Nếu phần cuối cùng khác với 'tin-tuc' thì đó chính là ID tin tức
      if (lastPart !== 'tin-tuc' && lastPart !== '') {
        console.log('FULFILLING DETAIL FOR:', lastPart);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              news: {
                MaTinTuc: lastPart,
                TieuDe: lastPart === 'TT100011' ? 'TXP mo them chuyen Ha Noi - Quang Ninh' : (lastPart === 'TT100014' ? 'Mở Rộng Lộ Trình Đón Trả Khách Tận Nơi Tại Khu Vực Bến Xe Bến Cát (Bình Dương)' : (lastPart === 'TT100015' ? 'Tân Xuân Phúc Chính Thức Vận Hành Dòng Xe THACO Mobihome 22 Phòng Premium Cao Cấp' : 'Bài viết chi tiết ' + lastPart)),
                LoaiTinTuc: lastPart === 'TT100013' ? 'KhuyenMai' : 'ThongBao',
                NgayDang: '2026-05-28T00:00:00.000Z',
                AnhBia: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
                MoTaNgan: 'Bản tin cập nhật hoạt động nâng cao chất lượng dịch vụ vận tải của TXP Bus.',
                NoiDungChiTiet: '<p>Nội dung chi tiết bài viết được render từ HTML thô của backend TXP Bus cực kỳ chất lượng.</p>'
              },
              latestNews: mockLatestNews,
              relatedNews: mockSubFeaturedNews
            }
          })
        });
        console.log('FULFILLED DETAIL SUCCESS');
        return;
      }

      // --- TRANG DANH SÁCH ---
      
      // Tìm kiếm không có kết quả
      if (searchParam === 'khongtimthay') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              featuredNews: null,
              items: [],
              meta: { totalPages: 1 }
            }
          })
        });
        return;
      }

      // Tìm kiếm có kết quả
      if (searchParam !== '') {
        const filtered = mockAllNewsItemsPage1.filter(item => 
          item.TieuDe.toLowerCase().includes(searchParam.toLowerCase())
        );
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              featuredNews: null,
              items: filtered,
              meta: { totalPages: 1 }
            }
          })
        });
        return;
      }

      // Lọc theo danh mục
      if (categoryParam === 'KhuyenMai') {
        const filtered = mockAllNewsItemsPage1.filter(item => item.LoaiTinTuc === 'KhuyenMai');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              featuredNews: null,
              items: filtered,
              meta: { totalPages: 1 }
            }
          })
        });
        return;
      }

      // Mặc định phân trang
      if (pageParam === '2') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              featuredNews: mockFeaturedNews,
              items: mockAllNewsItemsPage2,
              meta: { totalPages: 2 }
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              featuredNews: mockFeaturedNews,
              items: mockAllNewsItemsPage1,
              meta: { totalPages: 2 }
            }
          })
        });
      }
    });
  });

  // ==========================================
  // PHẦN 1: TRANG DANH SÁCH (TC_NT_01 - TC_NT_09)
  // ==========================================

  test('TC_NT_01: Trang /tin-tuc load thành công, hiển thị tin nổi bật và tin mới nhất', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    
    // Verify layout phân vùng
    await expect(newsPage.featuredNewsCard).toBeVisible();
    await expect(newsPage.featuredNewsTitle).toHaveText('TXP mo them chuyen Ha Noi - Quang Ninh');
    
    // Đảm bảo tin mới nhất hiển thị đủ 3 tin
    await expect(newsPage.latestNewsItems).toHaveCount(3);
    
    // Đảm bảo tin phụ nổi bật hiển thị đủ 2 tin
    await expect(newsPage.subFeaturedNewsItems).toHaveCount(2);

    // Section allNewsTitle phải hiển thị
    await expect(newsPage.allNewsSectionTitle).toBeVisible();
    await expect(newsPage.allNewsItems).toHaveCount(5);
  });

  test('TC_NT_02: Click tab "KHUYẾN MÃI" -> hiển thị chỉ tin khuyến mãi, ẩn featured/latest', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    await newsPage.selectCategory('KHUYẾN MÃI');

    // Chuyển sang lưới đơn -> Phải ẩn tin nổi bật, tin mới nhất, tin phụ nổi bật
    await expect(newsPage.featuredNewsCard).toBeHidden();
    await expect(newsPage.latestNewsItems).toBeHidden();
    await expect(newsPage.subFeaturedNewsItems).toBeHidden();

    // Chỉ hiển thị tin khuyến mãi trong grid allNews
    await expect(newsPage.allNewsItems).toHaveCount(1);
    await expect(newsPage.allNewsItems.first().locator('h4')).toContainText('Ưu Đãi Hè Rực Rỡ');
  });

  test('TC_NT_03: Click lại tab đang active -> quay về trang tổng với layout đầy đủ', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    
    // Chọn KHUYẾN MÃI
    await newsPage.selectCategory('KHUYẾN MÃI');
    await expect(newsPage.featuredNewsCard).toBeHidden();

    // Click lại KHUYẾN MÃI lần nữa để hủy lọc
    await newsPage.selectCategory('KHUYẾN MÃI');

    // Quay lại layout đầy đủ
    await expect(newsPage.featuredNewsCard).toBeVisible();
    await expect(newsPage.latestNewsItems).toHaveCount(3);
    await expect(newsPage.subFeaturedNewsItems).toHaveCount(2);
  });

  test('TC_NT_04: Tìm kiếm từ khóa có kết quả -> hiển thị tin khớp', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    await newsPage.searchFor('Lịch Trình');

    // Chuyển sang lưới đơn -> Ẩn các mục đặc biệt
    await expect(newsPage.featuredNewsCard).toBeHidden();
    
    // Kiểm tra tin khớp hiển thị
    await expect(newsPage.allNewsItems).toHaveCount(1);
    await expect(newsPage.allNewsItems.first().locator('h4')).toContainText('Lịch Trình 6 Chuyến Cố Định');
  });

  test('TC_NT_05: Tìm kiếm từ khóa không có kết quả -> hiển thị trạng thái empty state', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    await newsPage.searchFor('khongtimthay');

    // Xác nhận giao diện Empty State
    await expect(newsPage.emptyStateContainer).toBeVisible();
    await expect(newsPage.emptyStateTitle).toBeVisible();
    await expect(newsPage.emptyStateDescription).toBeVisible();
    await expect(newsPage.emptyStateIcon).toBeVisible();

    // Ẩn tất cả các grid tin tức
    await expect(newsPage.featuredNewsCard).toBeHidden();
    await expect(newsPage.allNewsItems).toHaveCount(0);
  });

  test('TC_NT_06: Đổi tab -> ô tìm kiếm tự động reset về rỗng', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    
    // Nhập từ khóa tìm kiếm
    await newsPage.searchFor('Lịch Trình');
    await expect(newsPage.searchInput).toHaveValue('Lịch Trình');

    // Đổi tab
    await newsPage.selectCategory('KHUYẾN MÃI');

    // Ô tìm kiếm phải tự động reset về rỗng
    await expect(newsPage.searchInput).toHaveValue('');
  });

  test('TC_NT_07: Phân trang: click trang 2 -> tải nội dung trang 2', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    
    // Chờ phân trang hiển thị
    await expect(newsPage.paginationContainer).toBeVisible();

    // Click trang 2
    const page2Btn = newsPage.getPageNumberBtn(2);
    await newsPage.clickOn(page2Btn);

    // Xác nhận nội dung trang 2
    await expect(newsPage.allNewsItems).toHaveCount(1);
    await expect(newsPage.allNewsItems.first().locator('h4')).toContainText('Cẩm nang đi du lịch Quy Nhơn');
  });

  test('TC_NT_08: Phân trang: nút < disabled khi ở trang 1', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    
    // Nút Trang trước (<) phải bị disabled ở trang 1
    await expect(newsPage.prevPageBtn).toBeDisabled();
    await expect(newsPage.nextPageBtn).toBeEnabled();
  });

  test('TC_NT_09: Phân trang: nút > disabled khi ở trang cuối', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    
    // Điều hướng sang trang 2 (trang cuối của mock)
    const page2Btn = newsPage.getPageNumberBtn(2);
    await newsPage.clickOn(page2Btn);

    // Nút Trang sau (>) phải bị disabled ở trang 2
    await expect(newsPage.nextPageBtn).toBeDisabled();
    await expect(newsPage.prevPageBtn).toBeEnabled();
  });

  // ==========================================
  // PHẦN 2: TRANG CHI TIẾT & ĐIỀU HƯỚNG (TC_NT_10 - TC_NT_15)
  // ==========================================

  test('TC_NT_10: Click vào tin tức -> điều hướng đến /tin-tuc/chi-tiet/:id', async ({ page, newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc');
    
    // Click vào tiêu đề tin nổi bật
    await newsPage.clickOn(newsPage.featuredNewsTitle);

    // Xác nhận chuyển trang thành công
    await expect(page).toHaveURL(/.*\/tin-tuc\/chi-tiet\/TT100011/);
    await newsPage.page.locator('span:has-text("Chi tiết tin tức")').click();
    await expect(newsPage.detailTitle).toBeVisible();
    await expect(newsPage.detailTitle).toHaveText('TXP mo them chuyen Ha Noi - Quang Ninh');
  });

  test('TC_NT_11: Trang chi tiết hiển thị đúng tiêu đề, ngày, nội dung bài viết', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc/chi-tiet/TT100011');
    await newsPage.page.locator('span:has-text("Chi tiết tin tức")').click();

    // Xác nhận hiển thị đúng chi tiết
    await expect(newsPage.detailCategoryBadge).toHaveText('THÔNG BÁO');
    await expect(newsPage.detailTitle).toHaveText('TXP mo them chuyen Ha Noi - Quang Ninh');
    await expect(newsPage.detailPublishDate).toContainText('28/05/2026');
    await expect(newsPage.summaryBox).toBeVisible();
    await expect(newsPage.detailCoverImage).toBeVisible();
    await expect(newsPage.detailHtmlContent).toContainText('Nội dung chi tiết bài viết');
  });

  test('TC_NT_12: Trang chi tiết: sidebar "Tin tức khác" hiển thị tối đa 5 tin', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc/chi-tiet/TT100011');
    await newsPage.page.locator('span:has-text("Chi tiết tin tức")').click();

    // Đảm bảo sidebar hiển thị tối đa 5 tin mới nhất khác
    await expect(newsPage.sidebarNewsItems.first()).toBeVisible();
    const count = await newsPage.sidebarNewsItems.count();
    expect(count).toBeLessThanOrEqual(5);
  });

  test('TC_NT_13: Trang chi tiết: section "Bài viết liên quan" hiển thị khi có dữ liệu', async ({ newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc/chi-tiet/TT100011');
    await newsPage.page.locator('span:has-text("Chi tiết tin tức")').click();

    // Xác nhận hiện thị bài viết liên quan
    await expect(newsPage.relatedNewsSectionTitle).toBeVisible();
    await expect(newsPage.relatedNewsItems).toHaveCount(2);
  });

  test('TC_NT_14: Breadcrumb: click "Tin tức" -> điều hướng về /tin-tuc', async ({ page, newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc/chi-tiet/TT100011');

    // Click vào link "Tin tức" trên breadcrumb
    await newsPage.clickOn(newsPage.breadcrumbNewsLink);

    // Xác nhận quay lại danh sách
    await expect(page).toHaveURL(/.*\/tin-tuc$/);
    await expect(newsPage.searchInput).toBeVisible();
  });

  test('TC_NT_15: Trang chi tiết: click bài viết liên quan -> điều hướng đến chi tiết bài đó', async ({ page, newsPage }) => {
    await newsPage.navigateTo(ENV.CUSTOMER_URL + '/tin-tuc/chi-tiet/TT100011');
    await newsPage.page.locator('span:has-text("Chi tiết tin tức")').click();

    // Lấy tiêu đề của bài liên quan đầu tiên
    const firstRelatedTitle = await newsPage.relatedNewsItems.first().locator('h4').innerText();

    // Click vào bài viết liên quan đầu tiên
    await newsPage.clickOn(newsPage.relatedNewsItems.first());

    // Xác nhận điều hướng thành công
    await expect(page).toHaveURL(/.*\/tin-tuc\/chi-tiet\/TT100014/);
    await newsPage.page.locator('span:has-text("Chi tiết tin tức")').click();
    await expect(newsPage.detailTitle).toBeVisible();
    await expect(newsPage.detailTitle).toHaveText(firstRelatedTitle);
  });
});
