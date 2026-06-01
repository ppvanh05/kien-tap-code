import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho Module Tin Tức (Customer News Page)
 */
export class NewsPage extends BasePage {
  // --- TRANG DANH SÁCH ---
  readonly searchInput: Locator;
  readonly allNewsSectionTitle: Locator;
  readonly featuredNewsCard: Locator;
  readonly featuredNewsTitle: Locator;
  readonly latestNewsItems: Locator;
  readonly subFeaturedNewsItems: Locator;
  readonly allNewsItems: Locator;

  // Trạng thái không có kết quả (Empty State)
  readonly emptyStateContainer: Locator;
  readonly emptyStateTitle: Locator;
  readonly emptyStateDescription: Locator;
  readonly emptyStateIcon: Locator;

  // Phân trang
  readonly paginationContainer: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;
  readonly pageNumberBtns: Locator;

  // --- TRANG CHI TIẾT ---
  readonly breadcrumbHomeLink: Locator;
  readonly breadcrumbNewsLink: Locator;
  readonly breadcrumbDetailText: Locator;
  readonly detailCategoryBadge: Locator;
  readonly detailTitle: Locator;
  readonly detailPublishDate: Locator;
  readonly summaryBox: Locator;
  readonly detailCoverImage: Locator;
  readonly detailHtmlContent: Locator;
  
  // Sidebar
  readonly sidebarNewsItems: Locator;
  
  // Bài viết liên quan
  readonly relatedNewsSectionTitle: Locator;
  readonly relatedNewsItems: Locator;
  readonly viewAllRelatedBtn: Locator;

  constructor(page: Page) {
    super(page);

    // --- TRANG DANH SÁCH ---
    this.searchInput = this.page.getByPlaceholder('Tìm kiếm tin tức');
    this.allNewsSectionTitle = this.page.getByRole('heading', { name: 'TẤT CẢ TIN TỨC', exact: true });
    
    // Tin nổi bật & Tin mới nhất (Sử dụng selector class DOM thực tế thay vì thuộc tính Angular routerLink)
    this.featuredNewsCard = this.page.locator('.lg\\:col-span-8 .cursor-pointer');
    this.featuredNewsTitle = this.page.locator('.lg\\:col-span-8 h3');
    this.latestNewsItems = this.page.locator('.lg\\:col-span-4 .cursor-pointer');
    this.subFeaturedNewsItems = this.page.locator('main > div').nth(2).locator('.cursor-pointer');
    this.allNewsItems = this.page.locator('div.grid-cols-1.md\\:grid-cols-2').last().locator('.cursor-pointer');

    // Empty state
    this.emptyStateContainer = this.page.locator('main > div.py-20');
    this.emptyStateTitle = this.page.getByRole('heading', { name: 'Không tìm thấy tin tức' });
    this.emptyStateDescription = this.page.locator('p:has-text("Vui lòng thử lại với từ khóa tìm kiếm hoặc danh mục khác.")');
    this.emptyStateIcon = this.page.locator('span.material-symbols-outlined:has-text("newspaper")');

    // Phân trang
    this.paginationContainer = this.page.locator('main > div.flex.justify-center.items-center.gap-2');
    this.prevPageBtn = this.paginationContainer.locator('button').first();
    this.nextPageBtn = this.paginationContainer.locator('button').last();
    this.pageNumberBtns = this.paginationContainer.locator('button').filter({ hasNotText: 'chevron_left' }).filter({ hasNotText: 'chevron_right' });

    // --- TRANG CHI TIẾT ---
    this.breadcrumbHomeLink = this.page.locator('a[routerLink="/home"]');
    this.breadcrumbNewsLink = this.page.locator('a[routerLink="/tin-tuc"]');
    this.breadcrumbDetailText = this.page.locator('span:has-text("Chi tiết tin tức")');
    this.detailCategoryBadge = this.page.locator('main span.bg-primary\\/10');
    this.detailTitle = this.page.locator('main h1');
    this.detailPublishDate = this.page.locator('main .material-symbols-outlined:has-text("calendar_month")').locator('xpath=..');
    this.summaryBox = this.page.locator('main .border-l-4.border-primary');
    this.detailCoverImage = this.page.locator('.lg\\:col-span-8 img');
    this.detailHtmlContent = this.page.locator('.prose');

    // Sidebar
    this.sidebarNewsItems = this.page.locator('.lg\\:col-span-4 .cursor-pointer');

    // Bài viết liên quan
    this.relatedNewsSectionTitle = this.page.getByRole('heading', { name: 'Bài viết liên quan', exact: true });
    this.relatedNewsItems = this.page.locator('.grid-cols-1.md\\:grid-cols-3 .cursor-pointer');
    this.viewAllRelatedBtn = this.page.locator('main a:has-text("Xem tất cả")');
  }

  /**
   * Lấy nút tab danh mục theo tên danh mục hiển thị
   */
  getCategoryTab(catName: string): Locator {
    return this.page.getByRole('button', { name: catName, exact: true });
  }

  /**
   * Lấy nút phân trang theo số trang
   */
  getPageNumberBtn(pageNum: number): Locator {
    return this.pageNumberBtns.filter({ hasText: pageNum.toString() });
  }

  /**
   * Nhập từ khóa tìm kiếm
   */
  async searchFor(query: string): Promise<void> {
    await this.typeText(this.searchInput, query);
  }

  /**
   * Chọn tab danh mục
   */
  async selectCategory(catName: string): Promise<void> {
    const tab = this.getCategoryTab(catName);
    await this.clickOn(tab);
  }
}
