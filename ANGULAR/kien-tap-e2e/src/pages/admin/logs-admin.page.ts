import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object cho trang Quản lý Nhật ký của Admin.
 */
export class LogsAdminPage extends BasePage {
  // Thẻ thống kê
  readonly totalTodayStat: Locator;
  readonly loginSuccessStat: Locator;
  readonly failedActionStat: Locator;
  readonly ticketTodayStat: Locator;

  // Bộ lọc
  readonly searchInput: Locator;
  readonly roleSelect: Locator;
  readonly actionSelect: Locator;
  readonly statusSelect: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;

  // Nút chức năng
  readonly filterBtn: Locator;
  readonly resetBtn: Locator;
  readonly exportBtn: Locator;

  // Danh sách dữ liệu nhật ký
  readonly tableRows: Locator;
  readonly firstRowLogCode: Locator;
  readonly viewDetailBtnForLog: (logCode: string) => Locator;

  // Modal Chi tiết Nhật ký
  readonly detailModal: Locator;
  readonly detailModalTitle: Locator;
  readonly detailModalContent: Locator;
  readonly closeDetailBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Stats cards
    this.totalTodayStat = this.page.locator('div, .stat-card').filter({ hasText: /^Tổng log hôm nay$/ }).locator('span, .stat-value, p').first().or(this.page.locator('div').filter({ hasText: 'Tổng log hôm nay' }).locator('span, p').last());
    this.loginSuccessStat = this.page.locator('div, .stat-card').filter({ hasText: /^Đăng nhập thành công$/ }).locator('span, .stat-value, p').first().or(this.page.locator('div').filter({ hasText: 'Đăng nhập thành công' }).locator('span, p').last());
    this.failedActionStat = this.page.locator('div, .stat-card').filter({ hasText: /^Thao tác thất bại$/ }).locator('span, .stat-value, p').first().or(this.page.locator('div').filter({ hasText: 'Thao tác thất bại' }).locator('span, p').last());
    this.ticketTodayStat = this.page.locator('div, .stat-card').filter({ hasText: /^Lượt đặt vé hôm nay$/ }).locator('span, .stat-value, p').first().or(this.page.locator('div').filter({ hasText: 'Lượt đặt vé hôm nay' }).locator('span, p').last());

    // Filters
    this.searchInput = this.page.getByPlaceholder('Tìm ID log, tài khoản, IP, mã vé...');
    this.roleSelect = this.page.locator('select').nth(0);
    this.actionSelect = this.page.locator('select').nth(1);
    this.statusSelect = this.page.locator('select').nth(2);
    this.fromDateInput = this.page.locator('input[type="date"]').first();
    this.toDateInput = this.page.locator('input[type="date"]').last();

    // Buttons
    this.filterBtn = this.page.getByRole('button', { name: /Lọc dữ liệu/ });
    this.resetBtn = this.page.getByRole('button', { name: /Làm mới bộ lọc/ });
    this.exportBtn = this.page.getByRole('button', { name: /Xuất Excel/ });

    // Table elements
    this.tableRows = this.page.locator('tbody tr');
    this.firstRowLogCode = this.tableRows.first().locator('td').first();
    this.viewDetailBtnForLog = (logCode: string) =>
      this.page.locator(`tr:has-text("${logCode}")`).locator('button:has-text("Xem chi tiết")');

    // Detail Modal
    this.detailModal = this.page.locator('.modal-overlay, .modal-window');
    this.detailModalTitle = this.detailModal.locator('.modal-header-title, .modal-header h3, h3').first();
    this.detailModalContent = this.detailModal.locator('.modal-body').first();
    this.closeDetailBtn = this.detailModal.locator('.btn-close, .btn-cancel, button:has-text("Đóng")');
  }

  async filterLogs(filters: {
    searchTerm?: string;
    role?: string;
    action?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    if (filters.searchTerm !== undefined) {
      await this.searchInput.fill(filters.searchTerm);
    }
    if (filters.role !== undefined) {
      await this.roleSelect.selectOption({ label: filters.role });
    }
    if (filters.action !== undefined) {
      await this.actionSelect.selectOption({ label: filters.action });
    }
    if (filters.status !== undefined) {
      await this.statusSelect.selectOption({ label: filters.status });
    }
    if (filters.fromDate !== undefined) {
      await this.fromDateInput.fill(filters.fromDate);
    }
    if (filters.toDate !== undefined) {
      await this.toDateInput.fill(filters.toDate);
    }

    await this.filterBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async resetFilters() {
    await this.resetBtn.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.searchInput).toHaveValue('');
  }
}
