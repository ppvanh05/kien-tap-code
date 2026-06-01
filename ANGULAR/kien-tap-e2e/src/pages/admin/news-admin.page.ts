import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object cho trang Quản lý Tin tức của Admin.
 */
export class NewsAdminPage extends BasePage {
  // Tab lọc
  readonly allTab: Locator;
  readonly publishedTab: Locator;
  readonly scheduledTab: Locator;
  readonly draftTab: Locator;
  readonly hiddenTab: Locator;

  // Tìm kiếm & lọc
  readonly searchInput: Locator;
  readonly sortSelect: Locator;

  // Nút thêm mới
  readonly addNewBtn: Locator;

  // Bảng dữ liệu bài viết
  readonly tableRows: Locator;
  readonly editBtnForCode: (code: string) => Locator;

  // Form Modal thêm/sửa
  readonly modalOverlay: Locator;
  readonly codeInput: Locator;
  readonly statusSelect: Locator;
  readonly typeChips: Locator;
  readonly featuredToggle: Locator;
  readonly featuredInput: Locator;
  readonly scheduleToggle: Locator;
  readonly scheduleInput: Locator;
  readonly scheduleDateInput: Locator;
  readonly scheduleTimeInput: Locator;
  readonly titleInput: Locator;
  readonly descTextarea: Locator;
  readonly coverInput: Locator;
  readonly localUploadBtn: Locator;
  readonly editorCanvas: Locator;
  readonly saveBtn: Locator;

  // Preview Modal
  readonly previewModal: Locator;
  readonly previewTitle: Locator;
  readonly previewCategory: Locator;
  readonly previewPublishDate: Locator;
  readonly previewSummary: Locator;
  readonly previewCoverImage: Locator;
  readonly previewHtmlContent: Locator;
  readonly previewCloseBtn: Locator;

  // Custom Alert Popup
  readonly alertOverlay: Locator;
  readonly alertTitle: Locator;
  readonly alertMessage: Locator;
  readonly alertOkBtn: Locator;

  // Confirm Status Modal
  readonly confirmModal: Locator;
  readonly confirmBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Tab lọc
    this.allTab = this.page.locator('.tab-btn').filter({ hasText: 'Tất cả bài viết' });
    this.publishedTab = this.page.locator('.tab-btn').filter({ hasText: 'Đang hiển thị' });
    this.scheduledTab = this.page.locator('.tab-btn').filter({ hasText: 'Lịch hẹn đăng' });
    this.draftTab = this.page.locator('.tab-btn').filter({ hasText: 'Bản nháp' });
    this.hiddenTab = this.page.locator('.tab-btn').filter({ hasText: 'Đã ẩn' });

    // Tìm kiếm
    this.searchInput = this.page.locator('.form-control-search');
    this.sortSelect = this.page.locator('.form-select-sort');

    // Nút thêm mới
    this.addNewBtn = this.page.locator('.btn-add-new');

    // Bảng dữ liệu
    this.tableRows = this.page.locator('table.premium-table tbody tr');
    this.editBtnForCode = (code: string) =>
      this.page.locator(`tr:has-text("${code}")`).locator('.btn-action-edit');

    // Form Modal
    this.modalOverlay = this.page.locator('.modal-overlay').filter({ hasNotClass: 'large-view-overlay' }).filter({ hasNotClass: 'image-upload-overlay' }).filter({ hasNotClass: 'lock-modal-overlay' });
    this.codeInput = this.page.locator('input[value*="TT"]');
    this.statusSelect = this.modalOverlay.locator('select.form-control');
    this.typeChips = this.page.locator('.loai-chip-btn');
    this.featuredToggle = this.page.locator('.facebook-scheduler-card').first().locator('.switch-toggle span.slider-round');
    this.featuredInput = this.page.locator('.facebook-scheduler-card').first().locator('.switch-toggle input');
    this.scheduleToggle = this.page.locator('.facebook-scheduler-card').last().locator('.switch-toggle span.slider-round');
    this.scheduleInput = this.page.locator('.facebook-scheduler-card').last().locator('.switch-toggle input');
    this.scheduleDateInput = this.page.locator('input[type="date"]');
    this.scheduleTimeInput = this.page.locator('input[type="time"]');
    this.titleInput = this.page.locator('input[placeholder*="Khai trương tuyến mới"]');
    this.descTextarea = this.page.locator('textarea[placeholder*="Tóm tắt giới thiệu"]');
    this.coverInput = this.page.locator('input[placeholder*="Dán URL ảnh"]');
    this.localUploadBtn = this.page.locator('.btn-local-upload');
    this.editorCanvas = this.page.locator('.editor-canvas');
    this.saveBtn = this.page.locator('.btn-save-confirm');

    // Preview Modal
    this.previewModal = this.page.locator('.large-view-overlay');
    this.previewTitle = this.page.locator('.preview-title-large');
    this.previewCategory = this.page.locator('.preview-mode-pane .preview-meta-row').first(); // Cần linh hoạt
    this.previewPublishDate = this.page.locator('.preview-meta-row strong').nth(1);
    this.previewSummary = this.page.locator('.preview-summary-box .summary-text');
    this.previewCoverImage = this.page.locator('.preview-banner-wide img');
    this.previewHtmlContent = this.page.locator('.preview-article-body-rendered');
    this.previewCloseBtn = this.page.locator('.large-view-overlay .btn-cancel');

    // Custom Alert Overlay
    this.alertOverlay = this.page.locator('.custom-alert-overlay');
    this.alertTitle = this.page.locator('.custom-alert-title');
    this.alertMessage = this.page.locator('.custom-alert-message');
    this.alertOkBtn = this.page.locator('.btn-alert-ok');

    // Confirm Modal
    this.confirmModal = this.page.locator('.lock-modal-overlay');
    this.confirmBtn = this.page.locator('.btn-confirm-action');
  }

  async selectTypeChip(label: string) {
    await this.typeChips.filter({ hasText: label }).click();
  }

  async createNews(data: {
    maTinTuc?: string;
    tieuDe: string;
    moTaNgan: string;
    anhBia: string;
    noiDungChiTiet: string;
    loaiTinTuc?: string;
    trangThai?: 'BanNhap' | 'DaDang';
    noiBat?: boolean;
    henGioDang?: boolean;
    ngayHenGio?: string;
    gioHenGio?: string;
  }) {
    await this.addNewBtn.click();
    await expect(this.modalOverlay).toBeVisible();

    if (data.maTinTuc) {
      await this.codeInput.fill(data.maTinTuc);
    }
    if (data.loaiTinTuc) {
      await this.selectTypeChip(data.loaiTinTuc);
    }
    if (data.trangThai) {
      await this.statusSelect.selectOption(data.trangThai);
    }
    if (data.noiBat !== undefined) {
      const isChecked = await this.featuredInput.isChecked();
      if (isChecked !== data.noiBat) {
        await this.featuredToggle.click();
      }
    }
    if (data.henGioDang !== undefined) {
      const isChecked = await this.scheduleInput.isChecked();
      if (isChecked !== data.henGioDang) {
        await this.scheduleToggle.click();
      }
      if (data.henGioDang) {
        if (data.ngayHenGio) await this.scheduleDateInput.fill(data.ngayHenGio);
        if (data.gioHenGio) await this.scheduleTimeInput.fill(data.gioHenGio);
      }
    }

    await this.titleInput.fill(data.tieuDe);
    await this.descTextarea.fill(data.moTaNgan);
    await this.coverInput.fill(data.anhBia);
    await this.editorCanvas.fill(data.noiDungChiTiet);

    await this.saveBtn.click();
  }

  async dismissAlert() {
    await expect(this.alertOverlay).toBeVisible({ timeout: 5000 });
    await this.alertOkBtn.click();
    await expect(this.alertOverlay).toBeHidden();
  }
}
