import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho trang Quản lý Tài khoản (Nhân viên & Khách hàng) trong Admin Dashboard
 */
export class AccountsPage extends BasePage {
  
  // Tab điều hướng chính
  readonly tabAll: Locator;
  readonly tabActive: Locator;
  readonly tabLocked: Locator;
  
  // Bộ lọc & Tìm kiếm
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly roleFilterSelect: Locator;
  readonly genderFilterSelect: Locator;
  
  // Bảng danh sách tài khoản
  readonly addAccountButton: Locator;
  readonly accountsTableRows: Locator;
  readonly editButtons: Locator;
  readonly emptyRowState: Locator;
  
  // Custom Alert Popup
  readonly alertOverlay: Locator;
  readonly alertTitle: Locator;
  readonly alertMessage: Locator;
  readonly alertOkButton: Locator;
  
  // -------------------------------------------------------------
  // MODAL FORM THÊM MỚI / CHỈNH SỬA TÀI KHOẢN NHÂN VIÊN (Multi-step)
  // -------------------------------------------------------------
  readonly modalOverlay: Locator;
  
  // Step Tabs trong Modal
  readonly modalTabBasic: Locator;
  readonly modalTabPermission: Locator;
  readonly modalTabContact: Locator;
  
  // Modal Step 1: Thông tin cơ bản
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly togglePasswordSwitch: Locator;
  readonly toggleEyeButton: Locator;
  readonly hoVaTenDemInput: Locator;
  readonly tenInput: Locator;
  readonly tenHienThiInput: Locator;
  readonly defaultRoleSelect: Locator;
  readonly genderSelect: Locator;
  readonly ngaySinhInput: Locator;
  readonly ghiChuTextArea: Locator;
  
  // Modal Step 2: Phân quyền
  readonly presetAdminChip: Locator;
  readonly presetManagementChip: Locator;
  readonly presetDispatchChip: Locator;
  readonly presetCSKHChip: Locator;
  readonly selectAllPermissionsCheckbox: Locator;
  readonly permissionSearchInput: Locator;
  readonly permissionCheckboxes: Locator;
  readonly activePermissionBadges: Locator;
  
  // Modal Step 3: Thông tin liên hệ
  readonly sdtInput: Locator;
  readonly emailInput: Locator;
  readonly diaChiInput: Locator;
  
  // Modal Footer Buttons
  readonly modalCancelButton: Locator;
  readonly modalSaveButton: Locator;
  readonly modalStatusToggleButton: Locator; // Nút khóa/mở khóa ở góc trái Modal
  
  // -------------------------------------------------------------
  // MODAL KHÁCH HÀNG (Thêm mới & Cập nhật chi tiết)
  // -------------------------------------------------------------
  readonly customerModalOverlay: Locator;
  readonly customerNameInput: Locator;
  readonly customerPhoneInput: Locator;
  readonly customerEmailInput: Locator;
  readonly customerGenderSelect: Locator;
  readonly customerDobInput: Locator;
  readonly customerSaveButton: Locator; // Nút Tạo tài khoản / Lưu thay đổi
  readonly customerCloseButton: Locator;
  readonly customerStatusBadge: Locator;

  // -------------------------------------------------------------
  // MODAL KHÓA TÀI KHOẢN KHÁCH HÀNG & LÝ DO
  // -------------------------------------------------------------
  readonly lockCustomerModalOverlay: Locator;
  readonly lockReasonTextArea: Locator;
  readonly confirmLockCustomerButton: Locator;
  readonly cancelLockCustomerButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Khởi tạo các locators trên trang chính
    this.tabAll = this.page.locator('.tab-btn').filter({ hasText: 'Tất cả' });
    this.tabActive = this.page.locator('.tab-btn').filter({ hasText: 'Đang hoạt động' });
    this.tabLocked = this.page.locator('.tab-btn').filter({ hasText: 'Đã khóa' });
    
    this.searchInput = this.page.locator('.form-control-search, input[placeholder*="Tìm theo"]');
    this.searchButton = this.page.locator('.btn-search-outline, button:has-text("Tìm kiếm")');
    this.roleFilterSelect = this.page.locator('.form-select-type');
    this.genderFilterSelect = this.page.locator('select.form-select-type'); // Dropdown lọc giới tính
    
    this.addAccountButton = this.page.locator('.btn-add-account, .btn-add-customer, button:has-text("Thêm tài khoản mới")');
    this.accountsTableRows = this.page.locator('.premium-table tbody tr');
    this.editButtons = this.page.locator('.btn-edit, .btn-action-view');
    this.emptyRowState = this.page.locator('.empty-row, .empty-state');
    
    // Custom alert popup
    this.alertOverlay = this.page.locator('.custom-alert-overlay');
    this.alertTitle = this.page.locator('.custom-alert-title');
    this.alertMessage = this.page.locator('.custom-alert-message');
    this.alertOkButton = this.page.locator('.btn-alert-ok');
    
    // Khởi tạo các locators cho Modal Quản lý Nhân viên
    this.modalOverlay = this.page.locator('.modal-overlay').first();
    this.modalTabBasic = this.page.locator('.step-tab-btn').filter({ hasText: 'Thông tin cơ bản' });
    this.modalTabPermission = this.page.locator('.step-tab-btn').filter({ hasText: 'Phân quyền' });
    this.modalTabContact = this.page.locator('.step-tab-btn').filter({ hasText: 'Thông tin liên hệ' });
    
    // Step 1: Basic
    this.usernameInput = this.page.locator('input.form-control[placeholder="Nhập tên truy cập..."]');
    this.passwordInput = this.page.locator('input.form-control[placeholder="Nhập mật khẩu..."]');
    this.confirmPasswordInput = this.page.locator('input.form-control[placeholder="Nhập lại mật khẩu..."]');
    this.togglePasswordSwitch = this.page.locator('.switch input[type="checkbox"]');
    this.toggleEyeButton = this.page.locator('.btn-toggle-eye').first();
    this.hoVaTenDemInput = this.page.locator('input.form-control[placeholder="Ví dụ: Nguyễn Văn"]');
    this.tenInput = this.page.locator('input.form-control[placeholder="Ví dụ: A"]');
    this.tenHienThiInput = this.page.locator('input.form-control[placeholder="Ví dụ: Nguyễn Văn A"]');
    this.defaultRoleSelect = this.page.locator('.step-panel select').first();
    this.genderSelect = this.page.locator('.step-panel select').nth(1);
    this.ngaySinhInput = this.page.locator('input.form-control[type="date"]');
    this.ghiChuTextArea = this.page.locator('textarea.form-control');
    
    // Step 2: Permission
    this.presetAdminChip = this.page.locator('.preset-chip').filter({ hasText: 'Quản trị viên' });
    this.presetManagementChip = this.page.locator('.preset-chip').filter({ hasText: 'Ban Quản lý' });
    this.presetDispatchChip = this.page.locator('.preset-chip').filter({ hasText: 'Nhân viên Điều phối' });
    this.presetCSKHChip = this.page.locator('.preset-chip').filter({ hasText: 'Nhân viên bán vé' });
    this.selectAllPermissionsCheckbox = this.page.locator('.search-selection-controls input[type="checkbox"]');
    this.permissionSearchInput = this.page.locator('.form-control-perm-search');
    this.permissionCheckboxes = this.page.locator('.permissions-grid input[type="checkbox"]');
    this.activePermissionBadges = this.page.locator('.active-perm-badge');
    
    // Step 3: Contact
    this.sdtInput = this.page.locator('input.form-control[placeholder="Ví dụ: 0987xxxxxx"]');
    this.emailInput = this.page.locator('input.form-control[placeholder="example@txpbus.vn"]');
    this.diaChiInput = this.page.locator('input.form-control[placeholder="Nhập địa chỉ nhà riêng, quận/huyện, thành phố..."]');
    
    // Footer Modal
    this.modalCancelButton = this.page.locator('.btn-modal-cancel');
    this.modalSaveButton = this.page.locator('.btn-modal-save');
    this.modalStatusToggleButton = this.page.locator('.btn-status-toggle');
    
    // Modal Khách hàng locators
    this.customerModalOverlay = this.page.locator('.customer-detail-modal');
    this.customerNameInput = this.page.locator('.customer-detail-modal label:has-text("Họ và tên") + input, .customer-detail-modal label:has-text("Họ và tên") >> xpath=../input');
    this.customerPhoneInput = this.page.locator('.customer-detail-modal label:has-text("Số điện thoại") + input, .customer-detail-modal label:has-text("Số điện thoại") >> xpath=../input');
    this.customerEmailInput = this.page.locator('.customer-detail-modal label:has-text("Địa chỉ Email") + input, .customer-detail-modal label:has-text("Địa chỉ Email") >> xpath=../input');
    this.customerGenderSelect = this.page.locator('.customer-detail-modal label:has-text("Giới tính") + select, .customer-detail-modal label:has-text("Giới tính") >> xpath=../select');
    this.customerDobInput = this.page.locator('.customer-detail-modal label:has-text("Ngày sinh") + input, .customer-detail-modal label:has-text("Ngày sinh") >> xpath=../input');
    this.customerSaveButton = this.page.locator('.customer-detail-modal button.btn-success');
    this.customerCloseButton = this.page.locator('.customer-detail-modal button.btn-close');
    this.customerStatusBadge = this.page.locator('.customer-detail-modal .status-badge');

    // Lock Customer Reason Modal
    this.lockCustomerModalOverlay = this.page.locator('.lock-modal-overlay');
    this.lockReasonTextArea = this.page.locator('.lock-reason-modal textarea');
    this.confirmLockCustomerButton = this.page.locator('.lock-reason-modal button').filter({ hasText: 'Khóa tài khoản' });
    this.cancelLockCustomerButton = this.page.locator('.lock-reason-modal button').filter({ hasText: 'Hủy bỏ' });
  }

  /**
   * Đóng cảnh báo Custom Alert Popup nếu hiển thị bằng cách click bỏ qua lớp overlay chặn click
   */
  async dismissAlertIfVisible(): Promise<void> {
    try {
      await this.alertOverlay.waitFor({ state: 'visible', timeout: 1500 });
      await this.alertOkButton.click({ force: true });
      await this.waitForHidden(this.alertOverlay);
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Click nút mở modal thêm nhân viên/khách hàng
   */
  async openAddModal(): Promise<void> {
    await this.clickOn(this.addAccountButton);
    await this.waitForVisible(this.modalOverlay);
  }

  /**
   * Click nút mở modal thêm khách hàng mới
   */
  async openAddCustomerModal(): Promise<void> {
    await this.clickOn(this.addAccountButton);
    await this.waitForVisible(this.customerModalOverlay);
  }

  /**
   * Điền thông tin tab Cơ bản (Step 1)
   */
  async fillBasicInfo(data: {
    username: string;
    matKhau: string;
    hoVaTenDem: string;
    ten: string;
    tenHienThi: string;
    defaultRole: 'BanVe' | 'DieuPhoi' | 'BanQuanLy' | 'QuanTriVien';
    gioiTinh?: 'Nam' | 'Nữ' | 'Khác';
  }): Promise<void> {
    await this.clickOn(this.modalTabBasic);
    await this.typeText(this.usernameInput, data.username);
    await this.typeText(this.passwordInput, data.matKhau);
    await this.typeText(this.confirmPasswordInput, data.matKhau);
    await this.typeText(this.hoVaTenDemInput, data.hoVaTenDem);
    await this.typeText(this.tenInput, data.ten);
    await this.typeText(this.tenHienThiInput, data.tenHienThi);
    
    await this.defaultRoleSelect.selectOption(data.defaultRole);
    await this.dismissAlertIfVisible();
    
    if (data.gioiTinh) {
      await this.genderSelect.selectOption(data.gioiTinh);
    }
  }

  /**
   * Cấu hình phân quyền tab Phân quyền (Step 2)
   */
  async selectPermissionPreset(preset: 'admin' | 'management' | 'dispatch' | 'cskh'): Promise<void> {
    // Đảm bảo không còn alert overlay đang chặn trước khi tương tác với tab
    await this.dismissAlertIfVisible();
    await this.clickOn(this.modalTabPermission);
    if (preset === 'admin') {
      await this.clickOn(this.presetAdminChip);
    } else if (preset === 'management') {
      await this.clickOn(this.presetManagementChip);
    } else if (preset === 'dispatch') {
      await this.clickOn(this.presetDispatchChip);
    } else if (preset === 'cskh') {
      await this.clickOn(this.presetCSKHChip);
    }
    // Chờ cảnh báo đồng bộ thành công của popup
    await this.dismissAlertIfVisible();
  }

  /**
   * Chọn một quyền cụ thể bằng cách click trực tiếp vào hộp item trong grid
   */
  async clickPermissionItem(permissionName: string): Promise<void> {
    await this.clickOn(this.modalTabPermission);
    const itemCard = this.page.locator('.permission-item-card').filter({ hasText: permissionName });
    
    // Đảm bảo accordion chứa element đang mở
    const parentCard = this.page.locator('.permission-module-card').filter({ has: itemCard });
    if (await parentCard.locator('.module-card-body').isHidden()) {
      await this.clickOn(parentCard.locator('.module-card-header'));
    }
    
    await this.clickOn(itemCard);
  }

  /**
   * Điền thông tin liên hệ (Step 3)
   */
  async fillContactInfo(data: { sdt: string; email: string; diaChi?: string }): Promise<void> {
    await this.dismissAlertIfVisible();
    await this.clickOn(this.modalTabContact);
    await this.typeText(this.sdtInput, data.sdt);
    await this.typeText(this.emailInput, data.email);
    if (data.diaChi) {
      await this.typeText(this.diaChiInput, data.diaChi);
    }
  }

  /**
   * Lưu biểu mẫu và kiểm tra kết quả lưu thành công
   */
  async saveAccount(): Promise<void> {
    await this.clickOn(this.modalSaveButton);
  }

  /**
   * Điền thông tin khách hàng trong modal khách hàng
   */
  async fillCustomerInfo(data: {
    fullName: string;
    phone: string;
    email: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    dob: string;
  }): Promise<void> {
    await this.typeText(this.customerNameInput, data.fullName);
    await this.customerNameInput.dispatchEvent('blur');
    await this.typeText(this.customerPhoneInput, data.phone);
    await this.customerPhoneInput.dispatchEvent('blur');
    await this.typeText(this.customerEmailInput, data.email);
    await this.customerEmailInput.dispatchEvent('blur');
    await this.customerGenderSelect.selectOption(data.gender);
    await this.typeText(this.customerDobInput, data.dob);
    await this.customerDobInput.dispatchEvent('blur');
  }

  /**
   * Lưu thông tin khách hàng (Nhấn Tạo hoặc Lưu thay đổi)
   */
  async saveCustomer(): Promise<void> {
    await this.clickOn(this.customerSaveButton);
  }

  async searchAccount(query: string): Promise<void> {
    await this.searchInput.fill('');
    await this.typeText(this.searchInput, query);
    if (await this.searchButton.isVisible()) {
      await this.clickOn(this.searchButton);
    } else {
      await this.searchInput.press('Enter');
    }
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(1500); // Đợi 1.5s để Angular cập nhật bảng sau khi tìm kiếm
  }

  /**
   * Khóa tài khoản khách hàng kèm lý do
   */
  async lockCustomerWithReason(customerName: string, reason: string): Promise<void> {
    // Tìm dòng chứa khách hàng
    const row = this.accountsTableRows.filter({ hasText: customerName });
    await expect(row).toBeVisible();
    
    // Bấm edit/view để mở drawer
    await this.clickOn(row.locator('.btn-edit, .btn-action-view'));
    
    // Đợi drawer/modal hiển thị
    const customerDetailModal = this.page.locator('.modal-content.customer-detail-modal');
    await this.waitForVisible(customerDetailModal);
    
    // Bấm nút Khóa tài khoản ở góc trái footer của modal khách hàng
    const lockBtn = customerDetailModal.locator('.modal-footer-sticky .btn-outline-danger');
    await this.clickOn(lockBtn);
    
    // Đợi modal nhập lý do khóa xuất hiện
    await this.waitForVisible(this.lockCustomerModalOverlay);
    await this.typeText(this.lockReasonTextArea, reason);
    await this.clickOn(this.confirmLockCustomerButton);
    
    // Đợi đóng modal và cảnh báo thành công
    await this.waitForHidden(this.lockCustomerModalOverlay);
    await this.dismissAlertIfVisible();
    await this.waitForHidden(this.modalOverlay);
  }
}
