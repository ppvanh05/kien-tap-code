import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho Trang Danh Sách Đánh Giá (Customer Review Page)
 */
export class ReviewPage extends BasePage {
  // --- THỐNG KÊ TỔNG QUAN ---
  readonly averageScoreText: Locator;
  readonly totalReviewsText: Locator;
  readonly criteriaLabels: Locator;
  readonly criteriaScores: Locator;

  // --- BỘ LỌC (FILTERS) ---
  readonly filterButtons: Locator;

  // --- DANH SÁCH ĐÁNH GIÁ (REVIEWS LIST) ---
  readonly reviewItems: Locator;
  readonly emptyStateText: Locator;

  // --- PHÂN TRANG ---
  readonly paginationContainer: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;
  readonly pageNumberBtns: Locator;

  constructor(page: Page) {
    super(page);

    // Thống kê tổng quan
    this.averageScoreText = this.page.locator('.bg-white .text-headline-lg');
    this.totalReviewsText = this.page.locator('.bg-white p.text-on-surface-variant').first();
    this.criteriaLabels = this.page.locator('.bg-white .w-24');
    this.criteriaScores = this.page.locator('.bg-white .w-10');

    // Bộ lọc
    this.filterButtons = this.page.locator('main > div.flex-wrap > button');

    // Danh sách đánh giá
    this.reviewItems = this.page.locator('.divide-y > .p-8');
    this.emptyStateText = this.page.locator('.divide-y > .p-12');

    // Phân trang
    this.paginationContainer = this.page.locator('main > div.flex.justify-center');
    this.prevPageBtn = this.page.locator('main > div.flex.justify-center button').first();
    this.nextPageBtn = this.page.locator('main > div.flex.justify-center button').last();
    this.pageNumberBtns = this.page.locator('main > div.flex.justify-center button').filter({ hasNotText: '‹' }).filter({ hasNotText: '›' });
  }

  /**
   * Lấy nút lọc theo nhãn hiển thị (ví dụ: "Tất cả (10)", "Có bình luận (5)", "5 Sao (8)")
   */
  getFilterBtn(label: string): Locator {
    return this.page.locator('main > div.flex-wrap > button').filter({ hasText: label });
  }

  /**
   * Click chọn bộ lọc
   */
  async selectFilter(label: string): Promise<void> {
    const btn = this.getFilterBtn(label);
    await this.clickOn(btn);
  }

  /**
   * Lấy nút số trang phân trang
   */
  getPageNumberBtn(pageNum: number): Locator {
    return this.pageNumberBtns.filter({ hasText: pageNum.toString() });
  }
}
