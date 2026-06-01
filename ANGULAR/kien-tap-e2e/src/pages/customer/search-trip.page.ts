import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho Trang Tìm kiếm chuyến & Đặt Cabin (Customer Search Trip Page)
 */
export class SearchTripPage extends BasePage {
  // 1. Top Search Form
  readonly oneWayToggle: Locator;
  readonly roundTripToggle: Locator;
  readonly departureInput: Locator;
  readonly destinationInput: Locator;
  readonly departureDropdown: Locator;
  readonly destinationDropdown: Locator;
  readonly swapBtn: Locator;
  readonly departureDateInput: Locator;
  readonly returnDateInput: Locator;
  readonly departureCalendarContainer: Locator;
  readonly returnCalendarContainer: Locator;
  readonly ticketSelect: Locator;
  readonly searchBtn: Locator;

  // 2. Sidebar Filters
  readonly clearFiltersBtn: Locator;
  readonly filterEarlyCheckbox: Locator;
  readonly filterMorningCheckbox: Locator;
  readonly filterAfternoonCheckbox: Locator;
  readonly filterEveningCheckbox: Locator;
  readonly filterUpperFloorBtn: Locator;
  readonly filterLowerFloorBtn: Locator;
  readonly filterFrontRowCheckbox: Locator;
  readonly filterMiddleRowCheckbox: Locator;
  readonly filterBackRowCheckbox: Locator;
  readonly filterUnder500Checkbox: Locator;
  readonly filterAbove500Checkbox: Locator;

  // 3. Search Results
  readonly resultsTitle: Locator;
  readonly tripCards: Locator;
  readonly emptyState: Locator;
  readonly resetFiltersBtn: Locator;

  // 4. Seat selection area (trong Active Trip card)
  readonly activeTripCard: Locator;
  readonly selectCabinBtn: (cabinName: string) => Locator;
  readonly guestTypeSelect: (cabinName: string) => Locator;
  readonly confirmSeatsBtn: Locator;
  readonly totalPriceText: Locator;

  constructor(page: Page) {
    super(page);

    // 1. Top Search Form
    this.oneWayToggle = this.page.getByRole('button', { name: /Một chiều/ });
    this.roundTripToggle = this.page.getByRole('button', { name: /Khứ hồi/ });
    this.departureInput = this.page.getByPlaceholder('Nhập điểm đi');
    this.destinationInput = this.page.getByPlaceholder('Nhập điểm đến');
    this.departureDropdown = this.page.locator('.relative:has(input[placeholder="Nhập điểm đi"]) .absolute.z-30');
    this.destinationDropdown = this.page.locator('.relative:has(input[placeholder="Nhập điểm đến"]) .absolute.z-30');
    this.swapBtn = this.page.locator('button:has-text("sync_alt")');
    this.departureDateInput = this.page.locator('input[placeholder="Thêm ngày đi"], .departure-calendar-container input');
    this.returnDateInput = this.page.locator('input[placeholder="Thêm ngày về"], .return-calendar-container input');
    this.departureCalendarContainer = this.page.locator('.relative:has(input[placeholder="Thêm ngày đi"]), .departure-calendar-container');
    this.returnCalendarContainer = this.page.locator('.relative:has(input[placeholder="Thêm ngày về"]), .return-calendar-container');
    this.ticketSelect = this.page.locator('select').first();
    this.searchBtn = this.page.getByRole('button', { name: 'TÌM KIẾM' });

    // 2. Sidebar Filters
    this.clearFiltersBtn = this.page.getByRole('button', { name: 'Bỏ lọc' });
    this.filterEarlyCheckbox = this.page.locator('label:has-text("Sáng sớm") input');
    this.filterMorningCheckbox = this.page.locator('label:has-text("Buổi sáng") input');
    this.filterAfternoonCheckbox = this.page.locator('label:has-text("Buổi chiều") input');
    this.filterEveningCheckbox = this.page.locator('label:has-text("Buổi tối") input');
    this.filterUpperFloorBtn = this.page.getByRole('button', { name: 'Tầng trên' });
    this.filterLowerFloorBtn = this.page.getByRole('button', { name: 'Tầng dưới' });
    this.filterFrontRowCheckbox = this.page.locator('label:has-text("Hàng đầu") input');
    this.filterMiddleRowCheckbox = this.page.locator('label:has-text("Hàng giữa") input');
    this.filterBackRowCheckbox = this.page.locator('label:has-text("Hàng cuối") input');
    this.filterUnder500Checkbox = this.page.locator('label:has-text("Dưới 500.000đ") input');
    this.filterAbove500Checkbox = this.page.locator('label:has-text("Từ 500.000đ trở lên") input');

    // 3. Search Results
    this.resultsTitle = this.page.locator('h2.text-headline-sm, h2:has-text("chuyến")');
    this.tripCards = this.page.locator('.border-outline-variant\\/15, div.cursor-pointer').filter({ has: this.page.locator('button:has-text("Chọn ghế")') });
    this.emptyState = this.page.locator('h3.text-headline-sm:has-text("Không tìm thấy chuyến xe"), h3:has-text("Không tìm thấy chuyến xe")').first();
    this.resetFiltersBtn = this.page.getByRole('button', { name: 'Đặt lại bộ lọc' });

    // 4. Seat selection area
    this.activeTripCard = this.page.locator('.border-outline-variant\\/15').filter({ has: this.page.locator('button:has-text("Chọn ghế")') });
    this.selectCabinBtn = (cabinName: string) => this.page.locator('button').locator(`text=/^\\s*${cabinName}\\s*$/`);
    this.guestTypeSelect = (cabinName: string) =>
      this.page.locator(`xpath=//span[contains(normalize-space(), "${cabinName}")]/following-sibling::select[1]`).first();
    this.confirmSeatsBtn = this.page.locator('button.bg-secondary:has-text("Chọn ghế")');
    this.totalPriceText = this.page.locator('p.text-title-lg.font-bold.text-navy span.text-secondary').first();
  }

  /**
   * Điều hướng trực tiếp đến trang tìm kiếm
   */
  async navigate(queryParams: string = ''): Promise<void> {
    await this.navigateTo(`/tim-kiem-chuyen${queryParams}`);
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
   * Điền form tìm kiếm bằng cách gõ và chọn dropdown
   */
  async selectDeparture(loc: string): Promise<void> {
    await this.departureInput.focus();
    await this.departureInput.fill(loc);
    await this.page.waitForTimeout(300);
    const item = this.page.locator('div.absolute.z-30 div').filter({ hasText: loc }).first();
    await this.clickOn(item);
    await this.departureInput.blur();
    await this.page.waitForTimeout(200);
  }

  async selectDestination(loc: string): Promise<void> {
    await this.destinationInput.focus();
    await this.destinationInput.fill(loc);
    await this.page.waitForTimeout(300);
    const item = this.page.locator('div.absolute.z-30 div').filter({ hasText: loc }).first();
    await this.clickOn(item);
    await this.destinationInput.blur();
    await this.page.waitForTimeout(200);
  }

  /**
   * Chọn ngày đi
   */
  async selectDepartureDate(day: number): Promise<void> {
    await this.clickOn(this.departureDateInput);
    await this.page.waitForTimeout(300);
    // Chọn cursor-pointer cell có phần tử con cuối cùng (solar date) khớp chính xác với day
    const dayCell = this.departureCalendarContainer.locator('.absolute.z-50 .cursor-pointer, .absolute.z-50 [cursor=pointer]')
      .filter({ has: this.page.locator(':last-child').filter({ hasText: new RegExp(`^${day}$`) }) }).first();
    await this.clickOn(dayCell);
    await this.page.waitForTimeout(300);
  }

  /**
   * Chọn ngày về
   */
  async selectReturnDate(day: number): Promise<void> {
    await this.clickOn(this.returnDateInput);
    await this.page.waitForTimeout(300);
    
    // Nếu chọn ngày 3 (tức là 03/06) khi đang ở tháng 5, cần click chevron_right để sang tháng 6
    if (day < 10) {
      const nextMonthBtn = this.returnCalendarContainer.locator('button:has-text("chevron_right"), button .material-symbols-outlined:has-text("chevron_right")').first();
      if (await nextMonthBtn.isVisible()) {
        await this.clickOn(nextMonthBtn);
        await this.page.waitForTimeout(300);
      }
    }
    
    const dayCell = this.returnCalendarContainer.locator('.absolute.z-50 .cursor-pointer, .absolute.z-50 [cursor=pointer]')
      .filter({ has: this.page.locator(':last-child').filter({ hasText: new RegExp(`^${day}$`) }) }).first();
    await this.clickOn(dayCell);
    await this.page.waitForTimeout(300);
  }

  /**
   * Chọn số vé
   */
  async selectTicketCount(count: number): Promise<void> {
    await this.ticketSelect.selectOption(count.toString() + ' vé');
  }

  /**
   * Click nút TÌM KIẾM
   */
  async clickSearch(): Promise<void> {
    await this.clickOn(this.searchBtn);
  }

  /**
   * Click hoán đổi Điểm đi / Điểm đến
   */
  async swap(): Promise<void> {
    await this.clickOn(this.swapBtn);
    await this.page.waitForTimeout(500); // Đợi Angular cập nhật model
  }

  /**
   * Bỏ bộ lọc
   */
  async clearFilters(): Promise<void> {
    await this.clickOn(this.clearFiltersBtn);
  }

  /**
   * Xóa sạch form tìm kiếm để test validation
   */
  async clearForm(): Promise<void> {
    await this.departureInput.fill('');
    await this.departureInput.dispatchEvent('input');
    await this.destinationInput.fill('');
    await this.destinationInput.dispatchEvent('input');
    await this.page.waitForTimeout(300);
  }

  /**
   * Chọn cabin trong sơ đồ của chuyến chạy active
   */
  async selectCabin(cabinName: string): Promise<void> {
    await this.clickOn(this.selectCabinBtn(cabinName));
  }

  /**
   * Chọn dịch vụ Phòng đơn / Phòng đôi
   */
  async selectGuestType(cabinName: string, type: '1' | '2'): Promise<void> {
    const sel = this.guestTypeSelect(cabinName);
    await expect(sel).toBeVisible({ timeout: 5000 });
    await sel.selectOption({ value: type });
    await expect(sel).toHaveValue(type);
  }

  /**
   * Click Xác nhận ghế
   */
  async confirmSeats(): Promise<void> {
    await this.clickOn(this.confirmSeatsBtn);
  }

  /**
   * Mở phần chọn ghế/cabin cho chuyến xe đầu tiên
   */
  async selectTrip(): Promise<void> {
    const btn = this.page.locator('button:has-text("Chọn ghế")').first();
    await this.clickOn(btn);
    await this.page.waitForTimeout(300);
  }
}
