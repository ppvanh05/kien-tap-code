import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model cho trang Quản lý nhật ký hoạt động.
 */
export class LogsPage extends BasePage {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly roleSelect: Locator;
  readonly actionSelect: Locator;
  readonly statusSelect: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly filterButton: Locator;
  readonly resetButton: Locator;
  readonly exportButton: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly noDataState: Locator;
  readonly resultCount: Locator;
  readonly detailButtons: Locator;
  readonly detailModal: Locator;
  readonly closeModalButton: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = this.page.getByRole('heading', { name: 'Quản lý nhật ký hoạt động' });
    this.searchInput = this.page.getByPlaceholder('Tìm ID log, tài khoản, IP, mã vé...');

    const roleGroup = this.page.locator('.form-group').filter({ hasText: 'Vai trò người thực hiện' });
    const actionGroup = this.page.locator('.form-group').filter({ hasText: 'Loại thao tác' });
    const statusGroup = this.page.locator('.form-group').filter({ hasText: 'Trạng thái' });
    const dateGroup = this.page.locator('.form-group').filter({ hasText: 'Khoảng thời gian' });

    this.roleSelect = roleGroup.locator('select');
    this.actionSelect = actionGroup.locator('select');
    this.statusSelect = statusGroup.locator('select');
    this.fromDateInput = dateGroup.locator('input[type="date"]').nth(0);
    this.toDateInput = dateGroup.locator('input[type="date"]').nth(1);

    this.filterButton = this.page.getByRole('button', { name: /Lọc dữ liệu/ });
    this.resetButton = this.page.getByRole('button', { name: /Làm mới bộ lọc/ });
    this.exportButton = this.page.getByRole('button', { name: /Xuất Excel/ });

    this.table = this.page.getByRole('table').first();
    this.tableRows = this.page.locator('tbody tr');
    this.noDataState = this.page.locator('.no-data-container');
    this.resultCount = this.page.locator('.table-card-header .count');
    this.detailButtons = this.page.getByRole('button', { name: 'Xem chi tiết' });
    this.detailModal = this.page.locator('.modal-window');
    this.closeModalButton = this.page.getByRole('button', { name: 'Đóng cửa sổ' });
  }

  async navigateToLogs(baseAdminUrl: string): Promise<void> {
    await this.page.goto(baseAdminUrl.replace('/admin-login', '/admin/quan-ly-nhat-ky'));
    await expect(this.heading).toBeVisible({ timeout: 60000 });
    await expect(this.resultCount.or(this.noDataState)).toBeVisible({ timeout: 60000 });
  }

  async search(term: string): Promise<void> {
    await this.typeText(this.searchInput, term);
    await this.clickOn(this.filterButton);
  }

  async selectRole(role: string): Promise<void> {
    await expect(this.roleSelect).toBeVisible();
    await this.roleSelect.selectOption({ label: role });
  }

  async selectAction(action: string): Promise<void> {
    await expect(this.actionSelect).toBeVisible();
    await this.actionSelect.selectOption({ label: action });
  }

  async selectStatus(status: string): Promise<void> {
    await expect(this.statusSelect).toBeVisible();
    await this.statusSelect.selectOption({ label: status });
  }

  async setDateRange(fromDate: string, toDate: string): Promise<void> {
    await this.fromDateInput.fill(fromDate);
    await this.toDateInput.fill(toDate);
    await this.clickOn(this.filterButton);
  }

  getRowByText(text: string): Locator {
    return this.tableRows.filter({ hasText: text }).first();
  }

  getCell(row: Locator, index: number): Locator {
    return row.locator('td').nth(index);
  }

  async openDetailFor(text: string): Promise<void> {
    const row = this.getRowByText(text);
    await expect(row).toBeVisible({ timeout: 15000 });
    await this.clickOn(row.getByRole('button', { name: 'Xem chi tiết' }));
    await expect(this.detailModal).toBeVisible();
  }

  async resetFilters(): Promise<void> {
    await this.clickOn(this.resetButton);
    await expect(this.searchInput).toHaveValue('');
  }
}
