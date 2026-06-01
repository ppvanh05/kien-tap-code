import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export type ViolationLevel = 'Thap' | 'TrungBinh' | 'Cao';
export type StatusTab = 'all' | 'active' | 'inactive';
export type KpiType = 'total' | 'active' | 'high' | 'medium' | 'low';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Page Object cho màn hình Quản lý từ khóa hạn chế.
 * Locator được verify bằng Playwright runtime trên DOM thật.
 */
export class BlacklistPage extends BasePage {
  readonly heading: Locator;

  // Tabs trạng thái
  readonly tabAll: Locator;
  readonly tabActive: Locator;
  readonly tabInactive: Locator;

  // Bộ lọc và hành động
  readonly addKeywordButton: Locator;
  readonly searchInput: Locator;
  readonly levelFilterSelect: Locator;
  readonly searchButton: Locator;

  // Bảng danh sách
  readonly table: Locator;
  readonly keywordsTableRows: Locator;
  readonly editButtons: Locator;
  readonly emptyState: Locator;
  readonly paginationSummary: Locator;
  readonly pageSizeSelect: Locator;

  // KPI widgets
  readonly totalKeywordsWidget: Locator;
  readonly activeKeywordsWidget: Locator;
  readonly highKeywordsWidget: Locator;
  readonly mediumKeywordsWidget: Locator;
  readonly lowKeywordsWidget: Locator;

  // Modal thêm/sửa
  readonly modalOverlay: Locator;
  readonly modalTitle: Locator;
  readonly keywordInput: Locator;
  readonly levelSelect: Locator;
  readonly modalStatusToggleButton: Locator;
  readonly modalCancelButton: Locator;
  readonly modalSaveButton: Locator;
  readonly modalCloseIcon: Locator;

  // Alert custom
  readonly alertOverlay: Locator;
  readonly alertTitle: Locator;
  readonly alertMessage: Locator;
  readonly alertOkButton: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = this.page.getByRole('heading', { name: 'Quản lý từ khóa hạn chế' });

    this.tabAll = this.page.getByRole('button', { name: 'Tất cả' });
    this.tabActive = this.page.getByRole('button', { name: 'Đang áp dụng' });
    this.tabInactive = this.page.getByRole('button', { name: 'Ngưng áp dụng' });

    this.addKeywordButton = this.page.getByRole('button', { name: /Thêm từ khóa mới/ });
    this.searchInput = this.page.getByPlaceholder('Tìm kiếm theo từ khóa hoặc mã số...');
    this.levelFilterSelect = this.page.getByRole('combobox').first();
    this.searchButton = this.page.getByRole('button', { name: 'Tìm kiếm' });

    this.table = this.page.getByRole('table');
    this.keywordsTableRows = this.table.locator('tbody tr');
    this.editButtons = this.table.getByRole('button', { name: 'edit_note' });
    this.emptyState = this.page.locator('.empty-state');
    this.paginationSummary = this.page.getByText(/Hiển thị \d+ - \d+ trong tổng số \d+ kết quả/);
    this.pageSizeSelect = this.page.getByRole('combobox').last();

    // Fallback CSS: các KPI không có role/name semantic trên DOM thật.
    this.totalKeywordsWidget = this.page.locator('.stat-total .stat-value');
    this.activeKeywordsWidget = this.page.locator('.stat-active .stat-value');
    this.highKeywordsWidget = this.page.locator('.stat-high .stat-value');
    this.mediumKeywordsWidget = this.page.locator('.stat-medium .stat-value');
    this.lowKeywordsWidget = this.page.locator('.stat-low .stat-value');

    // Fallback CSS cho overlay vì modal chưa khai báo role="dialog".
    this.modalOverlay = this.page.locator('.modal-overlay');
    this.modalTitle = this.page.getByRole('heading', {
      name: /Thêm từ khóa hạn chế mới|Chỉnh sửa từ khóa hạn chế/,
    });
    this.keywordInput = this.page.getByLabel('Nội dung từ khóa');
    this.levelSelect = this.page.getByLabel('Mức độ vi phạm');
    this.modalStatusToggleButton = this.page.getByRole('button', {
      name: /Khóa từ khóa|Mở khóa từ khóa/,
    });
    this.modalCancelButton = this.page.getByRole('button', { name: 'Hủy' });
    this.modalSaveButton = this.page.getByRole('button', { name: /Lưu thông tin/ });
    this.modalCloseIcon = this.page.getByRole('button', { name: 'close' });

    // Fallback CSS cho alert custom vì component không có role alert/dialog.
    this.alertOverlay = this.page.locator('.custom-alert-overlay');
    this.alertTitle = this.page.locator('.custom-alert-title');
    this.alertMessage = this.page.locator('.custom-alert-message');
    this.alertOkButton = this.page.getByRole('button', { name: 'Đồng ý' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.table).toBeVisible();
  }

  async openAddModal(): Promise<void> {
    await this.clickOn(this.addKeywordButton);
    await expect(this.modalOverlay).toBeVisible();
    await expect(this.modalTitle).toHaveText('Thêm từ khóa hạn chế mới');
  }

  async fillKeywordForm(data: { keyword: string; violationLevel?: ViolationLevel }): Promise<void> {
    await this.typeText(this.keywordInput, data.keyword);
    if (data.violationLevel) {
      await this.levelSelect.selectOption(data.violationLevel);
    }
  }

  async saveKeyword(): Promise<void> {
    await this.clickOn(this.modalSaveButton);
  }

  async createKeyword(keyword: string, violationLevel: ViolationLevel): Promise<void> {
    await this.openAddModal();
    await this.fillKeywordForm({ keyword, violationLevel });
    await this.saveKeyword();
  }

  async dismissAlert(): Promise<void> {
    await expect(this.alertOverlay).toBeVisible();
    await this.clickOn(this.alertOkButton);
    await expect(this.alertOverlay).toBeHidden();
  }

  async searchKeyword(query: string): Promise<void> {
    await this.typeText(this.searchInput, query);
    await this.clickOn(this.searchButton);
    await expect(this.table.or(this.emptyState)).toBeVisible();
  }

  async filterByLevel(level: ViolationLevel | 'all'): Promise<void> {
    await this.levelFilterSelect.selectOption(level);
  }

  async selectStatusTab(tab: StatusTab): Promise<void> {
    const target = tab === 'active' ? this.tabActive : tab === 'inactive' ? this.tabInactive : this.tabAll;
    await this.clickOn(target);
    await expect(this.table.or(this.emptyState)).toBeVisible();
  }

  keywordRow(keyword: string): Locator {
    return this.keywordsTableRows.filter({
      has: this.page.locator('td.keyword-text').filter({
        hasText: new RegExp(`^\\s*${escapeRegExp(keyword)}\\s*$`, 'i'),
      }),
    });
  }

  firstDataRow(): Locator {
    return this.keywordsTableRows.first();
  }

  levelCell(row: Locator): Locator {
    return row.getByRole('cell').nth(2);
  }

  statusCell(row: Locator): Locator {
    return row.getByRole('cell').nth(3);
  }

  async openEditModalForKeyword(keyword: string): Promise<void> {
    const row = this.keywordRow(keyword);
    await expect(row).toBeVisible();
    await this.clickOn(row.getByRole('button', { name: 'edit_note' }));
    await expect(this.modalOverlay).toBeVisible();
    await expect(this.modalTitle).toHaveText('Chỉnh sửa từ khóa hạn chế');
  }

  async toggleStatusAndSave(): Promise<void> {
    await this.clickOn(this.modalStatusToggleButton);
    await this.saveKeyword();
  }

  async getKpiValue(type: KpiType): Promise<number> {
    const locatorMap: Record<KpiType, Locator> = {
      total: this.totalKeywordsWidget,
      active: this.activeKeywordsWidget,
      high: this.highKeywordsWidget,
      medium: this.mediumKeywordsWidget,
      low: this.lowKeywordsWidget,
    };
    const text = await locatorMap[type].innerText();
    return Number.parseInt(text.trim(), 10);
  }

  pageButton(pageNumber: number): Locator {
    return this.page.getByRole('button', { name: String(pageNumber), exact: true });
  }
}
