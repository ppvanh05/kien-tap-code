import { test, expect, ENV } from '../../fixtures/base.fixture';

test.describe('Phân Hệ Khách Hàng - Module Đánh Giá & Nhận Xét (Customer Reviews)', () => {
  // Mock data danh sách reviews cho trang /danh-gia
  const mockReviewsSummary = {
    averageOverall: 4.6,
    totalReviews: 10,
    criteriaAverage: {
      anToan: 4.8,
      sachSe: 4.5,
      thaiDoNhanVien: 4.7,
      dungGio: 4.4,
      thongTinDayDu: 4.6,
      tienNghi: 4.5
    },
    ratingCount: {
      five: 6,
      four: 2,
      three: 1,
      two: 1,
      one: 0
    },
    commentCount: 8,
    imageCount: 4
  };

  const mockReviewItems = [
    {
      author: 'Nguyễn Văn A',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      date: '2026-05-29T10:00:00.000Z',
      rating: 5,
      content: 'Xe chạy rất êm, nhân viên thân thiện, sạch sẽ.',
      images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957'],
      route: 'Bình Định - TP. HCM',
      isVerified: true
    },
    {
      author: 'Trần Thị B',
      avatar: '', // Không có avatar để test placeholder
      date: '2026-05-28T09:00:00.000Z',
      rating: 4,
      content: 'Đúng giờ khởi hành, tài xế lái xe cẩn thận, an toàn.',
      images: [],
      route: 'Bình Định - Bình Dương',
      isVerified: true
    },
    {
      author: 'Lê Văn C',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
      date: '2026-05-27T08:00:00.000Z',
      rating: 3,
      content: 'Chất lượng phục vụ tạm ổn nhưng tiện nghi xe hơi cũ.',
      images: [],
      route: 'Phú Yên - TP. HCM',
      isVerified: true
    },
    {
      author: 'Phạm Minh D',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      date: '2026-05-26T07:00:00.000Z',
      rating: 2,
      content: 'Xe khởi hành trễ 15 phút, khoang xe hơi có mùi.',
      images: [],
      route: 'Bình Định - TP. HCM',
      isVerified: true
    },
    {
      author: 'Hoàng Văn E',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      date: '2026-05-25T06:00:00.000Z',
      rating: 5,
      content: 'Rất hài lòng, xe sạch, máy lạnh mát mẻ, sẽ ủng hộ tiếp.',
      images: [],
      route: 'Phú Yên - TP. HCM',
      isVerified: true
    }
  ];

  const mockReviewItemsPage2 = [
    {
      author: 'Ngô Thị F',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      date: '2026-05-24T05:00:00.000Z',
      rating: 5,
      content: 'Chuyến đi tuyệt vời!',
      images: [],
      route: 'Bình Định - TP. HCM',
      isVerified: true
    }
  ];

  // Khởi tạo router interceptor chung
  test.beforeEach(async ({ page }) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Intercept OPTIONS requests
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

    // Intercept API GET Reviews List & Summary
    await page.route(/customer\/reviews(?!\/home)/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        const url = new URL(route.request().url());
        const pageParam = url.searchParams.get('page') || '1';
        const ratingParam = url.searchParams.get('rating') || '';
        const hasCommentParam = url.searchParams.get('hasComment') || '';
        const hasImageParam = url.searchParams.get('hasImage') || '';

        // Xử lý bộ lọc "5 sao"
        if (ratingParam === '5') {
          const filtered = mockReviewItems.filter(item => item.rating === 5);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: {
                items: filtered,
                summary: mockReviewsSummary,
                meta: { currentPage: 1, totalPages: 1 }
              }
            })
          });
          return;
        }

        // Xử lý bộ lọc "Có bình luận"
        if (hasCommentParam === 'true') {
          const filtered = mockReviewItems.filter(item => item.content !== '');
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: {
                items: filtered,
                summary: mockReviewsSummary,
                meta: { currentPage: 1, totalPages: 1 }
              }
            })
          });
          return;
        }

        // Xử lý bộ lọc "Có hình ảnh"
        if (hasImageParam === 'true') {
          const filtered = mockReviewItems.filter(item => item.images && item.images.length > 0);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: {
                items: filtered,
                summary: mockReviewsSummary,
                meta: { currentPage: 1, totalPages: 1 }
              }
            })
          });
          return;
        }

        // Xử lý Paging Trang 2
        if (pageParam === '2') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: {
                items: mockReviewItemsPage2,
                summary: mockReviewsSummary,
                meta: { currentPage: 2, totalPages: 2 }
              }
            })
          });
          return;
        }

        // Trạng thái trống (Không có đánh giá)
        if (url.searchParams.get('limit') === 'empty') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: {
                items: [],
                summary: {
                  averageOverall: 0,
                  totalReviews: 0,
                  criteriaAverage: { anToan: 0, sachSe: 0, thaiDoNhanVien: 0, dungGio: 0, thongTinDayDu: 0, tienNghi: 0 },
                  ratingCount: { five: 0, four: 0, three: 0, two: 0, one: 0 },
                  commentCount: 0,
                  imageCount: 0
                },
                meta: { currentPage: 1, totalPages: 1 }
              }
            })
          });
          return;
        }

        // Mặc định trả về trang 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              items: mockReviewItems,
              summary: mockReviewsSummary,
              meta: { currentPage: 1, totalPages: 2 }
            }
          })
        });
      } else if (method === 'POST') {
        // Intercept POST submit review
        const payload = route.request().postDataJSON();

        // Validation - Bỏ trống mã vé
        if (!payload.MaVe || payload.MaVe.trim() === '') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: false,
              message: 'Yêu cầu cung cấp mã vé hợp lệ, không tạo đánh giá.'
            })
          });
          return;
        }

        // Validation - Bỏ trống mã khách hàng
        if (!payload.MaKhachHang || payload.MaKhachHang.trim() === '') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: false,
              message: 'Mã khách hàng không hợp lệ, không thể tạo đánh giá.'
            })
          });
          return;
        }

        // Validation - Chấm sao ngoài khoảng hợp lệ
        if (payload.SoSao < 1 || payload.SoSao > 5) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: false,
              message: 'Số sao phải nằm trong khoảng từ 1 đến 5.'
            })
          });
          return;
        }

        // Validation - Vé xe không tồn tại
        if (payload.MaVe === 'VE999999') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: false,
              message: 'Không tìm thấy vé xe hợp lệ, từ chối tạo đánh giá.'
            })
          });
          return;
        }

        // Security - Đánh giá trùng lặp
        if (payload.MaVe === 'VE100001_DUPLICATE') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            headers: corsHeaders,
            body: JSON.stringify({
              success: false,
              message: 'Không cho phép đánh giá lại hoặc vé xe đã được đánh giá trước đó.'
            })
          });
          return;
        }

        // Gửi thành công
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: 'Tạo đánh giá thành công!',
            data: {
              MaDanhGia: 'DG100001',
              TrangThaiPhanHoi: 'ChuaPhanHoi'
            }
          })
        });
      }
    });

    // Intercept API GET Reviews Home (Widget Trang Chủ)
    await page.route(/customer\/reviews\/home/, async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('empty') === 'true') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: []
          })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockReviewItems.slice(0, 5) // Trả về 5 reviews 5 sao
        })
      });
    });

    // Intercept Ticket Lookup API
    await page.route(/customer\/tra-cuu-ve\/lookup/, async (route) => {
      const url = new URL(route.request().url());
      const bookingCode = url.searchParams.get('maDonHang') || '';

      if (bookingCode === 'DH_ERR') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            message: 'Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!'
          })
        });
        return;
      }

      // Vé chưa đánh giá, có thể gửi review
      const ticketStatus = bookingCode === 'DH10000001_REVIEWED' ? 'Đã đánh giá' : 'Đã hoàn thành';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            MaDonHang: bookingCode,
            MaKhachHang: 'KH001',
            HoTenNguoiDi: 'Nguyễn Văn A',
            SdtNguoiDi: '0982541160',
            EmailNguoiDi: 'customer@test.com',
            ThoiGianDat: '2026-05-28T08:00:00.000Z',
            TenTuyen: 'Bình Định - TP. HCM',
            GioKhoiHanh: '19:00',
            GioTra: '05:00',
            NgayXuatBen: '2026-05-29',
            DiemDon: 'Bến xe Quy Nhơn',
            DiemTra: 'Bến xe Miền Đông Cũ',
            TongGiaVe: 250000,
            PhuongThucThanhToan: 'Chuyển khoản',
            TrangThaiDonHang: ticketStatus,
            tickets: [
              {
                MaVe: bookingCode === 'DH_DUPLICATE' ? 'VE100001_DUPLICATE' : (bookingCode === 'DH_NOT_EXIST' ? 'VE999999' : 'VE100001'),
                SoGhe: 'A12',
                BienSoXe: '77B-012.34',
                DiemDon: 'Bến xe Quy Nhơn',
                DiemTra: 'Bến xe Miền Đông Cũ',
                GiaVe: 250000,
                TrangThaiVe: ticketStatus
              }
            ]
          }
        })
      });
    });
  });

  // =========================================================================
  // PHẦN 1: GỬI ĐÁNH GIÁ (TICKET LOOKUP MODAL SUBMISSION) - HIGH RISK
  // =========================================================================

  test('TXP_REV_TC_001: Gửi đánh giá 5 sao hợp lệ với đầy đủ thông tin nhận xét và ảnh', async ({ ticketLookupPage }) => {
    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0982541160', 'DH10000001');

    // Chờ thông tin đơn hàng hiển thị
    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();
    await expect(ticketLookupPage.openReviewModalBtn).toBeEnabled();

    // Mở modal đánh giá
    await ticketLookupPage.clickOn(ticketLookupPage.openReviewModalBtn);
    await expect(ticketLookupPage.reviewModal).toBeVisible();

    // Điền đánh giá
    await ticketLookupPage.setCriteriaScore(0, 5); // An toàn: 5 sao
    await ticketLookupPage.setCriteriaScore(1, 5); // Sạch sẽ: 5 sao
    await ticketLookupPage.typeText(ticketLookupPage.reviewCommentInput, 'Xe chạy rất êm, nhân viên thân thiện.');

    // Giả lập upload ảnh
    await ticketLookupPage.fileUploadInput.setInputFiles({
      name: 'image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-base64')
    });
    await expect(ticketLookupPage.selectedFilesList).toHaveCount(1);

    // Gửi đánh giá
    await ticketLookupPage.clickOn(ticketLookupPage.submitReviewBtn);

    // Xác nhận toast thành công
    const toast = ticketLookupPage.page.locator('.fixed.top-24');
    await expect(toast).toContainText('Đánh giá đã được gửi thành công.');
  });

  test('TXP_REV_TC_002: Gửi đánh giá chỉ có số sao (không nhận xét, không ảnh)', async ({ ticketLookupPage }) => {
    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0982541160', 'DH10000002');
    await ticketLookupPage.clickOn(ticketLookupPage.openReviewModalBtn);

    // Chỉ chọn 3 sao cho tiêu chí An toàn, bỏ trống văn bản & ảnh
    await ticketLookupPage.setCriteriaScore(0, 3);
    await expect(ticketLookupPage.submitReviewBtn).toBeEnabled();

    await ticketLookupPage.clickOn(ticketLookupPage.submitReviewBtn);
    const toast = ticketLookupPage.page.locator('.fixed.top-24');
    await expect(toast).toContainText('Đánh giá đã được gửi thành công.');
  });

  test('TXP_REV_TC_003: Gửi đánh giá tiêu cực (1 sao) kèm chấm điểm các tiêu chí phụ', async ({ ticketLookupPage }) => {
    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0982541160', 'DH10000003');
    await ticketLookupPage.clickOn(ticketLookupPage.openReviewModalBtn);

    // Chấm điểm thấp cho tất cả các tiêu chí phụ
    await ticketLookupPage.setCriteriaScore(0, 1); // An toàn: 1 sao
    await ticketLookupPage.setCriteriaScore(1, 1); // Sạch sẽ: 1 sao
    await ticketLookupPage.setCriteriaScore(3, 1); // Đúng giờ: 1 sao

    await ticketLookupPage.clickOn(ticketLookupPage.submitReviewBtn);
    const toast = ticketLookupPage.page.locator('.fixed.top-24');
    await expect(toast).toContainText('Đánh giá đã được gửi thành công.');
  });

  test('TXP_REV_TC_012: Security - Không cho phép đánh giá trùng lặp trên một vé xe đã được đánh giá', async ({ ticketLookupPage }) => {
    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    
    // Tra cứu vé đã đánh giá trước đó (DH10000001_REVIEWED)
    await ticketLookupPage.lookupOrder('0982541160', 'DH10000001_REVIEWED');
    await expect(ticketLookupPage.orderDetailsSection).toBeVisible();

    // Nút "Đánh giá dịch vụ" phải bị disabled
    await expect(ticketLookupPage.openReviewModalBtn).toBeDisabled();
  });

  test('TXP_REV_TC_029: Validation - Gửi đánh giá với ID vé xe không tồn tại', async ({ ticketLookupPage }) => {
    await ticketLookupPage.navigateTo(ENV.CUSTOMER_URL + '/tra-cuu-ve');
    await ticketLookupPage.lookupOrder('0982541160', 'DH_NOT_EXIST');
    await ticketLookupPage.clickOn(ticketLookupPage.openReviewModalBtn);

    await ticketLookupPage.setCriteriaScore(0, 5);
    await ticketLookupPage.clickOn(ticketLookupPage.submitReviewBtn);

    // Báo lỗi không tìm thấy vé xe hợp lệ
    const toast = ticketLookupPage.page.locator('.fixed.top-24');
    await expect(toast).toContainText('Không tìm thấy vé xe hợp lệ');
  });

  // =========================================================================
  // PHẦN 2: XEM DANH SÁCH & BỘ LỌC (REVIEWS LIST PAGE) - MEDIUM RISK
  // =========================================================================

  test('TXP_REV_TC_013: Xem danh sách đánh giá mặc định không có bộ lọc', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click(); // Force Angular CD

    // Hiển thị tối đa đúng 5 đánh giá trên một trang
    await expect(reviewPage.reviewItems).toHaveCount(5);
    await expect(reviewPage.paginationContainer).toBeVisible(); // Vì meta totalPages=2 nên phải visible
    // Đảm bảo nút Trang trước bị disabled ở trang 1
    await expect(reviewPage.prevPageBtn).toBeDisabled();
  });

  test('TXP_REV_TC_014: Hiển thị đầy đủ thông tin một đánh giá trong danh sách', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    const firstItem = reviewPage.reviewItems.first();
    await expect(firstItem.locator('h4.text-navy')).toHaveText('Nguyễn Văn A');
    await expect(firstItem.locator('p.text-outline')).toHaveText('29/05/2026');
    await expect(firstItem.locator('.text-title-md.font-bold.text-secondary')).toHaveText('5.0');
    await expect(firstItem.locator('p.text-on-surface')).toContainText('Xe chạy rất êm, nhân viên thân thiện, sạch sẽ.');
    await expect(firstItem.locator('.w-28.h-28.rounded-2xl img')).toBeVisible();
    await expect(firstItem.locator('.text-body-sm.italic')).toContainText('Tuyến: Bình Định - TP. HCM');
  });

  test('TXP_REV_TC_015: Hiển thị đúng số liệu thống kê tổng quan ở đầu trang', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Điểm trung bình tổng thể
    await expect(reviewPage.averageScoreText).toHaveText('4.6');
    // Tổng số lượng đánh giá
    await expect(reviewPage.totalReviewsText).toHaveText('10 đánh giá');
    // Điểm các tiêu chí phụ
    await expect(reviewPage.criteriaScores.nth(0)).toHaveText('4.8'); // An toàn
    await expect(reviewPage.criteriaScores.nth(1)).toHaveText('4.5'); // Sạch sẽ
  });

  test('TXP_REV_TC_016: Lọc danh sách đánh giá theo mức 5 sao', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Click tab bộ lọc "5 Sao"
    await reviewPage.selectFilter('5 Sao');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Danh sách chỉ hiển thị các đánh giá 5 sao
    const count = await reviewPage.reviewItems.count();
    for (let i = 0; i < count; i++) {
      await expect(reviewPage.reviewItems.nth(i).locator('.text-title-md.font-bold.text-secondary')).toHaveText('5.0');
    }
  });

  test('TXP_REV_TC_017: Lọc danh sách đánh giá chỉ hiện những đánh giá có bình luận', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    await reviewPage.selectFilter('Có bình luận');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Đảm bảo tất cả các review hiển thị đều có text content không rỗng
    const count = await reviewPage.reviewItems.count();
    for (let i = 0; i < count; i++) {
      const text = await reviewPage.reviewItems.nth(i).locator('p.text-on-surface').innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('TXP_REV_TC_018: Lọc danh sách đánh giá chỉ hiện những đánh giá có ảnh đính kèm', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    await reviewPage.selectFilter('Có hình ảnh');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Đảm bảo tất cả review hiển thị đều chứa ảnh đính kèm
    const count = await reviewPage.reviewItems.count();
    for (let i = 0; i < count; i++) {
      await expect(reviewPage.reviewItems.nth(i).locator('.w-28.h-28.rounded-2xl img')).toBeVisible();
    }
  });

  test('TXP_REV_TC_020: Phân trang: Xem đánh giá trang 2', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Click trang 2
    const page2Btn = reviewPage.getPageNumberBtn(2);
    await reviewPage.clickOn(page2Btn);
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Xác nhận nội dung trang 2
    await expect(reviewPage.reviewItems).toHaveCount(1);
    await expect(reviewPage.reviewItems.first().locator('h4.text-navy')).toHaveText('Ngô Thị F');
  });

  test('TXP_REV_TC_021: Boundary - Xem đánh giá khi không có đánh giá nào (Danh sách trống)', async ({ reviewPage, page }) => {
    // Intercept cục bộ cho API reviews trả về trống
    await page.route(/customer\/reviews(?!\/home)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
            summary: {
              averageOverall: 0,
              totalReviews: 0,
              criteriaAverage: { anToan: 0, sachSe: 0, thaiDoNhanVien: 0, dungGio: 0, thongTinDayDu: 0, tienNghi: 0 },
              ratingCount: { five: 0, four: 0, three: 0, two: 0, one: 0 },
              commentCount: 0,
              imageCount: 0
            },
            meta: { currentPage: 1, totalPages: 1 }
          }
        })
      });
    });

    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Xác nhận hiển thị thông báo trống
    await expect(reviewPage.emptyStateText).toBeVisible();
    await expect(reviewPage.emptyStateText).toContainText('Chưa có đánh giá nào phù hợp với bộ lọc này.');
  });

  test('TXP_REV_TC_022: UI - Hiển thị ảnh đại diện user.png mặc định cho khách hàng không có avatar', async ({ reviewPage }) => {
    await reviewPage.navigateTo(ENV.CUSTOMER_URL + '/danh-gia');
    await reviewPage.page.locator('h1:has-text("Phản hồi từ khách hàng")').click();

    // Thẻ đánh giá thứ 2 (Trần Thị B) không có avatar
    const secondItem = reviewPage.reviewItems.nth(1);
    await expect(secondItem.locator('h4.text-navy')).toHaveText('Trần Thị B');
    
    // Phải hiển thị ảnh placeholder /user.png mặc định
    const avatarImg = secondItem.locator('img');
    await expect(avatarImg).toHaveAttribute('src', /\/user\.png/);
  });
});
