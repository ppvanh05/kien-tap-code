import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class PolicyAdminPage extends BasePage {
  // Tabs
  readonly allTab: Locator;
  readonly activeTab: Locator;
  readonly lockedTab: Locator;

  // Actions
  readonly addPolicyBtn: Locator;
  readonly dropdownMenu: Locator;
  readonly insuranceOptionBtn: Locator;
  readonly paymentOptionBtn: Locator;
  readonly cancellationOptionBtn: Locator;
  readonly otherOptionBtn: Locator;

  // Search & Filter
  readonly searchInput: Locator;
  readonly filterTypeSelect: Locator;
  readonly searchBtn: Locator;

  // Data Table
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly firstRowIdCell: Locator;
  readonly firstRowTitleCell: Locator;
  readonly firstRowStatusCell: Locator;
  readonly editBtn: Locator;

  // Pagination
  readonly pageButtons: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;
  readonly pageSizeSelect: Locator;

  // Modal
  readonly modalOverlay: Locator;
  readonly modalTitle: Locator;
  readonly titleInput: Locator;
  readonly effectiveDateInput: Locator;
  readonly editorCanvas: Locator;
  readonly statusToggleBtn: Locator;
  readonly modalCancelBtn: Locator;
  readonly modalSaveBtn: Locator;
  readonly modalCloseBtn: Locator;

  // Cancellation (Milestones)
  readonly cancellationSection: Locator;
  readonly addMilestoneBtn: Locator;
  readonly milestoneRows: Locator;
  readonly removeMilestoneBtns: Locator;

  // Custom Alert / Notification
  readonly customAlertOverlay: Locator;
  readonly customAlertMessage: Locator;
  readonly customAlertOkBtn: Locator;

  // Custom Confirm Modal
  readonly confirmModalTitle: Locator;
  readonly confirmModalMessage: Locator;
  readonly confirmModalCancelBtn: Locator;
  readonly confirmModalOkBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Tabs
    this.allTab = this.page.locator('button.tab-btn').filter({ hasText: 'Tất cả' });
    this.activeTab = this.page.locator('button.tab-btn').filter({ hasText: 'Đang hoạt động' });
    this.lockedTab = this.page.locator('button.tab-btn').filter({ hasText: 'Đã khóa' });

    // Actions dropdown
    this.addPolicyBtn = this.page.locator('button.btn-add-policy');
    this.dropdownMenu = this.page.locator('.dropdown-menu');
    this.insuranceOptionBtn = this.page.locator('.dropdown-menu button').filter({ hasText: 'Chính sách bảo hiểm' });
    this.paymentOptionBtn = this.page.locator('.dropdown-menu button').filter({ hasText: 'Chính sách thanh toán' });
    this.cancellationOptionBtn = this.page.locator('.dropdown-menu button').filter({ hasText: 'Chính sách hủy vé' });
    this.otherOptionBtn = this.page.locator('.dropdown-menu button').filter({ hasText: 'Chính sách khác' });

    // Search and Filters
    this.searchInput = this.page.locator('input.form-control-search');
    this.filterTypeSelect = this.page.locator('select.form-select-type');
    this.searchBtn = this.page.locator('button.btn-search-outline');

    // Table
    this.table = this.page.locator('table');
    this.tableRows = this.page.locator('tbody tr');
    this.firstRowIdCell = this.tableRows.first().locator('td').first();
    this.firstRowTitleCell = this.tableRows.first().locator('td.policy-name-col');
    this.firstRowStatusCell = this.tableRows.first().locator('td span.badge');
    this.editBtn = this.page.locator('button.btn-edit');

    // Pagination
    this.pageButtons = this.page.locator('.pagination-controls button.btn-page').filter({ hasNotText: 'chevron' });
    this.prevPageBtn = this.page.locator('.pagination-controls button.btn-page').filter({ hasText: 'chevron_left' });
    this.nextPageBtn = this.page.locator('.pagination-controls button.btn-page').filter({ hasText: 'chevron_right' });
    this.pageSizeSelect = this.page.locator('select.form-control-page-size');

    // Modal
    this.modalOverlay = this.page.locator('.modal-overlay');
    this.modalTitle = this.page.locator('.modal-header h3');
    this.titleInput = this.page.locator('.modal-body input[placeholder="Nhập tên chính sách"]');
    this.effectiveDateInput = this.page.locator('.modal-body input[type="date"]');
    this.editorCanvas = this.page.locator('.editor-canvas');
    this.statusToggleBtn = this.page.locator('button.btn-status-toggle');
    this.modalCancelBtn = this.page.locator('button.btn-modal-cancel');
    this.modalSaveBtn = this.page.locator('button.btn-modal-save');
    this.modalCloseBtn = this.page.locator('button.btn-close');

    // Cancellation Specific
    this.cancellationSection = this.page.locator('.cancellation-section');
    this.addMilestoneBtn = this.page.locator('button.btn-add-milestone');
    this.milestoneRows = this.page.locator('.milestone-row');
    this.removeMilestoneBtns = this.page.locator('button.btn-remove-milestone');

    // Alerts
    this.customAlertOverlay = this.page.locator('.custom-alert-overlay').filter({ hasNotText: 'Hủy bỏ' });
    this.customAlertMessage = this.customAlertOverlay.locator('.custom-alert-message');
    this.customAlertOkBtn = this.customAlertOverlay.locator('.btn-alert-ok');

    // Confirms
    this.confirmModalCancelBtn = this.page.locator('.custom-alert-overlay .btn-sub-cancel');
    this.confirmModalOkBtn = this.page.locator('.custom-alert-overlay .btn-alert-ok.warning');
    this.confirmModalTitle = this.page.locator('.custom-alert-overlay h4');
    this.confirmModalMessage = this.page.locator('.custom-alert-overlay .custom-alert-message');
  }

  // Common Business Actions
  async openAddPolicyDropdown() {
    await this.clickOn(this.addPolicyBtn);
    await expect(this.dropdownMenu).toBeVisible({ timeout: 5000 });
  }

  async selectAddPolicyType(type: 'insurance' | 'payment' | 'cancellation' | 'other') {
    await this.openAddPolicyDropdown();
    if (type === 'insurance') {
      await this.clickOn(this.insuranceOptionBtn);
    } else if (type === 'payment') {
      await this.clickOn(this.paymentOptionBtn);
    } else if (type === 'cancellation') {
      await this.clickOn(this.cancellationOptionBtn);
    } else {
      await this.clickOn(this.otherOptionBtn);
    }
    await expect(this.modalOverlay).toBeVisible({ timeout: 5000 });
  }

  async searchPolicy(keyword: string) {
    await this.typeText(this.searchInput, keyword);
    await this.clickOn(this.searchBtn);
  }

  async filterByType(typeValue: 'all' | 'insurance' | 'payment' | 'cancellation' | 'other') {
    await this.filterTypeSelect.selectOption(typeValue);
  }

  async fillForm(data: { title?: string; date?: string; content?: string }) {
    if (data.title !== undefined) {
      await this.typeText(this.titleInput, data.title);
    }
    if (data.date !== undefined) {
      await this.typeText(this.effectiveDateInput, data.date);
    }
    if (data.content !== undefined) {
      await this.editorCanvas.fill('');
      await this.editorCanvas.fill(data.content);
    }
  }

  async addMilestone(hours: number, refund: number) {
    await this.clickOn(this.addMilestoneBtn);
    const lastRow = this.milestoneRows.last();
    const hoursInput = lastRow.locator('input[type="number"]').first();
    const refundInput = lastRow.locator('input[type="number"]').last();
    await this.typeText(hoursInput, hours.toString());
    await this.typeText(refundInput, refund.toString());
  }

  async fillMilestoneAt(index: number, hours: number, refund: number) {
    const row = this.milestoneRows.nth(index);
    const hoursInput = row.locator('input[type="number"]').first();
    const refundInput = row.locator('input[type="number"]').last();
    await this.typeText(hoursInput, hours.toString());
    await this.typeText(refundInput, refund.toString());
  }

  async saveForm() {
    await this.clickOn(this.modalSaveBtn);
  }

  async cancelForm() {
    await this.clickOn(this.modalCancelBtn);
  }

  async closeAlert() {
    await this.clickOn(this.customAlertOkBtn);
    await expect(this.customAlertOverlay).toBeHidden({ timeout: 5000 });
  }

  async confirmAction() {
    await this.clickOn(this.confirmModalOkBtn);
  }

  async cancelConfirmAction() {
    await this.clickOn(this.confirmModalCancelBtn);
  }
}
