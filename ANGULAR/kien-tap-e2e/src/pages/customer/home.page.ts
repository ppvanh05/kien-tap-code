import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho Trang Chủ (Customer Home Page)
 */
export class HomePage extends BasePage {
  // Loại hành trình
  readonly oneWayToggle: Locator;
  readonly roundTripToggle: Locator;

  // Điểm đi / Điểm đến
  readonly departureInput: Locator;
  readonly destinationInput: Locator;
  readonly departureDropdown: Locator;
  readonly destinationDropdown: Locator;
  readonly swapBtn: Locator;

  // Ngày đi / Ngày về
  readonly departureDateInput: Locator;
  readonly returnDateInput: Locator;
  readonly departureCalendarContainer: Locator;
  readonly returnCalendarContainer: Locator;

  // Số vé
  readonly ticketSelect: Locator;

  // Nút Tìm kiếm
  readonly searchBtn: Locator;

  // Tìm kiếm gần đây
  readonly recentSearchesTitle: Locator;
  readonly recentSearchItems: Locator;

  // Tuyến xe phổ biến
  readonly popularRoutesTitle: Locator;
  readonly popularRouteCards: Locator;

  // Đánh giá
  readonly reviewsSectionTitle: Locator;
  readonly reviewCards: Locator;
  readonly viewAllReviewsLink: Locator;

  // Tin tức mới
  readonly newsSectionTitle: Locator;
  readonly newsCards: Locator;
  readonly viewAllNewsLink: Locator;

  constructor(page: Page) {
    super(page);

    // Loại hành trình
    this.oneWayToggle = this.page.getByRole('button', { name: /Một chiều/ });
    this.roundTripToggle = this.page.getByRole('button', { name: /Khứ hồi/ });

    // Điểm đi / Điểm đến
    this.departureInput = this.page.getByPlaceholder('Nhập điểm đi');
    this.destinationInput = this.page.getByPlaceholder('Nhập điểm đến');
    this.departureDropdown = this.page.locator('.relative:has(input[placeholder="Nhập điểm đi"]) .absolute.z-30'); // dropdown của điểm đi
    this.destinationDropdown = this.page.locator('.relative:has(input[placeholder="Nhập điểm đến"]) .absolute.z-30'); // dropdown của điểm đến
    
    // Nút hoán đổi (sync_alt)
    this.swapBtn = this.page.locator('button:has-text("sync_alt")');

    // Ngày đi / Ngày về
    this.departureDateInput = this.page.getByPlaceholder('Thêm ngày đi');
    this.returnDateInput = this.page.getByPlaceholder('Thêm ngày về');
    this.departureCalendarContainer = this.page.locator('.departure-calendar-container .absolute.z-50');
    this.returnCalendarContainer = this.page.locator('.return-calendar-container .absolute.z-50');

    // Số vé
    this.ticketSelect = this.page.locator('select');

    // Nút Tìm kiếm
    this.searchBtn = this.page.getByRole('button', { name: 'TÌM KIẾM' });

    // Tìm kiếm gần đây
    this.recentSearchesTitle = this.page.locator('text=Tìm kiếm gần đây:');
    this.recentSearchItems = this.page.locator('span:has-text("Tìm kiếm gần đây:") + div > span');

    // Tuyến xe phổ biến
    this.popularRoutesTitle = this.page.getByRole('heading', { name: 'Tuyến xe phổ biến', exact: true });
    this.popularRouteCards = this.page.locator('section.bg-surface-container-low').first().locator('.group');

    // Đánh giá
    this.reviewsSectionTitle = this.page.getByRole('heading', { name: 'Khách hàng nói gì về Tân Xuân Phúc?', exact: true });
    this.reviewCards = this.page.locator('main > section:has-text("Khách hàng nói gì") .bg-surface-container-lowest');
    this.viewAllReviewsLink = this.page.getByRole('link', { name: 'Xem tất cả >', exact: true }).first();

    // Tin tức mới
    this.newsSectionTitle = this.page.getByRole('heading', { name: 'TIN TỨC MỚI', exact: true });
    this.newsCards = this.page.locator('main > section:has-text("TIN TỨC MỚI") .group');
    this.viewAllNewsLink = this.page.getByRole('link', { name: 'Xem tất cả >', exact: true }).last();
  }

  /**
   * Điều hướng trực tiếp đến trang chủ
   */
  async navigate(): Promise<void> {
    await this.navigateTo('/home');
    await this.page.waitForLoadState('networkidle').catch(() => null);
  }

  /**
   * Chọn loại hành trình
   */
  async selectJourneyType(type: 'one-way' | 'round-trip'): Promise<void> {
    if (type === 'one-way') {
      await this.clickOn(this.oneWayToggle);
    } else {
      await this.clickOn(this.roundTripToggle);
    }
  }

  /**
   * Chọn địa điểm trong dropdown
   */
  async selectDeparture(loc: string): Promise<void> {
    await this.departureInput.focus();
    // Dropdown chứa các phần tử mousedown chọn địa điểm
    const item = this.page.locator('.relative:has(input[placeholder="Nhập điểm đi"]) .absolute.z-30 div').filter({ hasText: loc });
    await this.clickOn(item);
  }

  async selectDestination(loc: string): Promise<void> {
    await this.destinationInput.focus();
    const item = this.page.locator('.relative:has(input[placeholder="Nhập điểm đến"]) .absolute.z-30 div').filter({ hasText: loc });
    await this.clickOn(item);
  }

  /**
   * Chọn ngày đi (dương lịch) trong lịch
   */
  async selectDepartureDate(day: number): Promise<void> {
    await this.clickOn(this.departureDateInput);
    // Tìm ô chứa ngày dương lịch tương ứng
    const dayCell = this.departureCalendarContainer.locator('.grid-cols-7 > div').filter({
      has: this.page.locator('span.text-body-sm').filter({ hasText: new RegExp(`^${day}$`) })
    });
    await this.clickOn(dayCell);
  }

  /**
   * Chọn ngày về (dương lịch) trong lịch
   */
  async selectReturnDate(day: number): Promise<void> {
    await this.clickOn(this.returnDateInput);
    // Tìm ô chứa ngày dương lịch tương ứng
    const dayCell = this.returnCalendarContainer.locator('.grid-cols-7 > div').filter({
      has: this.page.locator('span.text-body-sm').filter({ hasText: new RegExp(`^${day}$`) })
    });
    await this.clickOn(dayCell);
  }

  /**
   * Chọn số vé
   */
  async selectTicketCount(count: number): Promise<void> {
    await this.ticketSelect.selectOption(count.toString());
  }

  /**
   * Hoán đổi vị trí điểm đi và điểm đến
   */
  async swap(): Promise<void> {
    await this.clickOn(this.swapBtn);
  }

  /**
   * Click nút TÌM KIẾM
   */
  async clickSearch(): Promise<void> {
    await this.clickOn(this.searchBtn);
  }
}
