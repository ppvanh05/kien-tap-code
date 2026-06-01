import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho Trang Tra Cứu Vé & Gửi Đánh Giá (Ticket Lookup & Review Submission Page)
 */
export class TicketLookupPage extends BasePage {
  // --- FORM TRA CỨU ---
  readonly phoneInput: Locator;
  readonly bookingCodeInput: Locator;
  readonly lookupBtn: Locator;
  readonly searchErrorAlert: Locator;

  // --- KẾT QUẢ TRA CỨU & KHU VỰC CHỨC NĂNG ---
  readonly orderDetailsSection: Locator;
  readonly orderStatusBadge: Locator;
  readonly ticketItems: Locator;
  readonly openReviewModalBtn: Locator;
  readonly openEditModalBtn: Locator;
  readonly openCancelModalBtn: Locator;

  // --- MODAL CHỈNH SỬA VÉ (EDIT MODAL) ---
  readonly editModal: Locator;
  readonly editFullNameInput: Locator;
  readonly editPhoneInput: Locator;
  readonly editEmailInput: Locator;
  readonly editDiemDonInput: Locator;
  readonly editDiemTraInput: Locator;
  readonly editSaveBtn: Locator;
  readonly editCancelBtn: Locator;
  readonly editFullNameError: Locator;
  readonly editPhoneError: Locator;
  readonly editDiemTraError: Locator;

  // --- MODAL XÁC NHẬN CHỈNH SỬA (CONFIRMATION STEPS) ---
  readonly editConfirmationSummaryModal: Locator;
  readonly editConfirmationSummaryConfirmBtn: Locator;
  readonly editConfirmationDialogModal: Locator;
  readonly editConfirmationDialogSaveBtn: Locator;

  // --- MODAL HỦY VÉ ---
  readonly cancelModal: Locator;
  readonly cancelReasonSelect: Locator;
  readonly cancelConfirmBtn: Locator;
  readonly cancelCloseBtn: Locator;
  readonly cancelConfirmDialogModal: Locator;
  readonly cancelConfirmDialogConfirmBtn: Locator;

  // --- MODAL ĐÁNH GIÁ (REVIEW MODAL) ---
  readonly reviewModal: Locator;
  readonly reviewCommentInput: Locator;
  readonly fileUploadInput: Locator;
  readonly selectedFilesList: Locator;
  readonly cancelReviewBtn: Locator;
  readonly submitReviewBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Form tra cứu
    this.phoneInput = this.page.locator('input[type="tel"]');
    this.bookingCodeInput = this.page.locator('input[placeholder*="đơn hàng"]');
    this.lookupBtn = this.page.getByRole('button', { name: 'Tra cứu', exact: true });
    this.searchErrorAlert = this.page.locator('.bg-danger-light p');

    // Kết quả tra cứu
    this.orderDetailsSection = this.page.locator('section:has-text("THÔNG TIN ĐƠN HÀNG")');
    this.orderStatusBadge = this.page.locator('section:has-text("THÔNG TIN ĐƠN HÀNG") span').last();
    this.ticketItems = this.page.locator('section:has-text("THÔNG TIN VÉ ĐIỆN TỬ") .bg-white');
    this.openReviewModalBtn = this.page.getByRole('button', { name: 'star Đánh giá dịch vụ' });
    this.openEditModalBtn = this.page.getByRole('button', { name: 'edit Chỉnh sửa thông tin vé' });
    this.openCancelModalBtn = this.page.getByRole('button', { name: 'cancel Hủy vé' });

    // Modal chỉnh sửa vé
    this.editModal = this.page.locator('div.fixed.inset-0:has-text("CHỈNH SỬA THÔNG TIN VÉ")');
    this.editFullNameInput = this.editModal.locator('input[placeholder*="Họ tên"], input[placeholder*="họ tên"]');
    this.editPhoneInput = this.editModal.locator('input[type="tel"]');
    this.editEmailInput = this.editModal.locator('input[type="email"]');
    this.editDiemDonInput = this.editModal.locator('input[placeholder*="điểm đón"]');
    this.editDiemTraInput = this.editModal.locator('input[placeholder*="điểm trả"]');
    this.editSaveBtn = this.editModal.getByRole('button', { name: 'Lưu thay đổi', exact: true });
    this.editCancelBtn = this.editModal.getByRole('button', { name: 'Hủy', exact: true });
    this.editFullNameError = this.editModal.locator('.text-danger').first();
    this.editPhoneError = this.editModal.locator('.text-danger').nth(1);
    this.editDiemTraError = this.editModal.locator('.text-danger').last();

    // Modal xác nhận chỉnh sửa
    this.editConfirmationSummaryModal = this.page.locator('div.fixed.inset-0:has-text("XÁC NHẬN THAY ĐỔI")');
    this.editConfirmationSummaryConfirmBtn = this.editConfirmationSummaryModal.getByRole('button', { name: 'Xác nhận', exact: true });
    
    this.editConfirmationDialogModal = this.page.locator('div.fixed.inset-0:has-text("XÁC NHẬN LƯU")');
    this.editConfirmationDialogSaveBtn = this.editConfirmationDialogModal.getByRole('button', { name: 'Xác nhận lưu', exact: true });

    // Modal hủy vé
    this.cancelModal = this.page.locator('div.fixed.inset-0:has-text("XÁC NHẬN HỦY VÉ")');
    this.cancelReasonSelect = this.cancelModal.locator('select');
    this.cancelConfirmBtn = this.cancelModal.getByRole('button', { name: 'Xác nhận hủy', exact: true });
    this.cancelCloseBtn = this.cancelModal.getByRole('button', { name: 'Đóng', exact: true });
    
    this.cancelConfirmDialogModal = this.cancelModal.locator('div.absolute.inset-0:has-text("Xác nhận hủy vé")');
    this.cancelConfirmDialogConfirmBtn = this.cancelConfirmDialogModal.getByRole('button', { name: 'Xác nhận hủy', exact: true });

    // Modal đánh giá
    this.reviewModal = this.page.locator('div.fixed.inset-0:has-text("Đánh giá chuyến đi")');
    this.reviewCommentInput = this.page.locator('#reviewComment');
    this.fileUploadInput = this.page.locator('input[type="file"]');
    this.selectedFilesList = this.page.locator('.flex.flex-wrap.gap-2.mt-1 > div');
    this.cancelReviewBtn = this.page.getByRole('button', { name: 'Hủy bỏ', exact: true });
    this.submitReviewBtn = this.page.getByRole('button', { name: 'Gửi đánh giá', exact: true });
  }

  /**
   * Thực hiện tra cứu đơn hàng
   */
  async lookupOrder(phone: string, code: string): Promise<void> {
    await this.typeText(this.phoneInput, phone);
    await this.typeText(this.bookingCodeInput, code);
    await this.clickOn(this.lookupBtn);
  }

  /**
   * Set điểm đánh giá (sao) cho một tiêu chí dựa vào index (0 - 5) và số sao (1 - 5)
   * Tiêu chí:
   * 0: An toàn
   * 1: Sạch sẽ
   * 2: Thái độ Nhân viên
   * 3: Đúng giờ
   * 4: Thông tin đầy đủ
   * 5: Tiện nghi
   */
  async setCriteriaScore(criteriaIndex: number, stars: number): Promise<void> {
    const starBtn = this.reviewModal
      .locator('.grid-cols-2 > div').nth(criteriaIndex)
      .locator('span.material-symbols-outlined').nth(stars - 1);
    await this.clickOn(starBtn);
  }

  /**
   * Chọn điểm đón gợi ý trong Edit Modal
   */
  async selectEditPickupPoint(name: string): Promise<void> {
    await this.editDiemDonInput.focus();
    await this.editDiemDonInput.fill(name);
    const option = this.editModal.locator('.absolute.z-10 .cursor-pointer').filter({ hasText: name }).first();
    await this.clickOn(option);
  }

  /**
   * Chọn điểm trả gợi ý trong Edit Modal
   */
  async selectEditDropoffPoint(name: string): Promise<void> {
    await this.editDiemTraInput.focus();
    await this.editDiemTraInput.fill(name);
    const option = this.editModal.locator('.absolute.z-10 .cursor-pointer').filter({ hasText: name }).first();
    await this.clickOn(option);
  }
}
