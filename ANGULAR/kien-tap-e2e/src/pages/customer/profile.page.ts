import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho trang Hồ Sơ Cá Nhân (Customer Profile)
 */
export class ProfilePage extends BasePage {
  // Sidebar tabs
  readonly profileTabBtn: Locator;
  readonly historyTabBtn: Locator;
  readonly passwordTabBtn: Locator;
  readonly logoutTabBtn: Locator;

  // View Mode Profile
  readonly fullNameViewText: Locator;
  readonly phoneViewText: Locator;
  readonly genderViewText: Locator;
  readonly emailViewText: Locator;
  readonly dobViewText: Locator;
  readonly editProfileBtn: Locator;
  readonly avatarImg: Locator;

  // Edit Mode Profile
  readonly fullNameInput: Locator;
  readonly readonlyPhoneInput: Locator;
  readonly genderSelect: Locator;
  readonly emailInput: Locator;
  readonly dobInput: Locator;
  readonly updateProfileBtn: Locator;
  readonly cancelEditBtn: Locator;
  readonly selectAvatarBtn: Locator;
  readonly avatarFileInput: Locator;

  // Profile Errors
  readonly fullNameError: Locator;
  readonly emailError: Locator;
  readonly dobError: Locator;
  readonly avatarError: Locator;

  // Password tab
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly toggleCurrentPasswordBtn: Locator;
  readonly toggleNewPasswordBtn: Locator;
  readonly toggleConfirmPasswordBtn: Locator;
  readonly submitChangePasswordBtn: Locator;
  
  // Password Errors & Messages
  readonly currentPasswordError: Locator;
  readonly newPasswordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly changePasswordSuccessMsg: Locator;
  readonly changePasswordFailureMsg: Locator;

  // OTP Change Password Modal
  readonly otpModalHeader: Locator;
  readonly otpModalInput: Locator;
  readonly otpModalCloseBtn: Locator;
  readonly otpModalConfirmBtn: Locator;
  readonly otpModalError: Locator;
  readonly otpModalCountdown: Locator;
  readonly otpModalResendLink: Locator;

  // Booking History tab
  readonly filterOrderIdInput: Locator;
  readonly filterDateInput: Locator;
  readonly filterRouteInput: Locator;
  readonly filterStatusSelect: Locator;
  readonly searchHistoryBtn: Locator;
  readonly resetFilterBtn: Locator;
  readonly historyTableRows: Locator;
  readonly emptyHistoryRow: Locator;

  // Pagination
  readonly paginationPrevBtn: Locator;
  readonly paginationNextBtn: Locator;
  readonly paginationPages: Locator;

  constructor(page: Page) {
    super(page);

    // Sidebar
    this.profileTabBtn = this.page.locator('button:has-text("Thông tin cá nhân")');
    this.historyTabBtn = this.page.locator('button:has-text("Lịch sử mua vé")');
    this.passwordTabBtn = this.page.locator('button:has-text("Đổi mật khẩu")');
    this.logoutTabBtn = this.page.locator('button:has-text("Đăng xuất")');

    // View Mode Profile
    this.fullNameViewText = this.page.locator('p:has-text("Họ và tên") + p');
    this.phoneViewText = this.page.locator('p:has-text("Số điện thoại") + p');
    this.genderViewText = this.page.locator('p:has-text("Giới tính") + p');
    this.emailViewText = this.page.locator('p:has-text("Email") + p');
    this.dobViewText = this.page.locator('p:has-text("Ngày sinh") + p');
    this.editProfileBtn = this.page.locator('button:has-text("Chỉnh sửa hồ sơ")');
    this.avatarImg = this.page.locator('app-profile img[alt="Avatar"]');

    // Edit Mode Profile
    this.fullNameInput = this.page.locator('label:has-text("Họ và tên") + input');
    this.readonlyPhoneInput = this.page.locator('input[disabled]');
    this.genderSelect = this.page.locator('label:has-text("Giới tính") + select');
    this.emailInput = this.page.locator('label:has-text("Email") + input');
    this.dobInput = this.page.locator('label:has-text("Ngày sinh") + input');
    this.updateProfileBtn = this.page.locator('button:has-text("Cập nhật")');
    this.cancelEditBtn = this.page.locator('button:has-text("Hủy bỏ")');
    this.selectAvatarBtn = this.page.locator('button:has-text("Chọn ảnh")');
    this.avatarFileInput = this.page.locator('input[type="file"]');

    // Errors profile
    this.fullNameError = this.page.locator('p.text-danger').filter({ hasText: 'họ tên' });
    this.emailError = this.page.locator('p.text-danger').filter({ hasText: 'Email không hợp lệ' });
    this.dobError = this.page.locator('p.text-danger').filter({ hasText: 'Ngày sinh' });
    this.avatarError = this.page.locator('p.text-danger').filter({ hasText: 'tối đa 1MB' });

    // Password tab
    this.currentPasswordInput = this.page.locator('input[placeholder="Nhập mật khẩu hiện tại"]');
    this.newPasswordInput = this.page.locator('input[placeholder="Nhập mật khẩu mới"]');
    this.confirmPasswordInput = this.page.locator('input[placeholder="Xác nhận mật khẩu mới"]');
    
    this.toggleCurrentPasswordBtn = this.page.locator('input[placeholder="Nhập mật khẩu hiện tại"] + button');
    this.toggleNewPasswordBtn = this.page.locator('input[placeholder="Nhập mật khẩu mới"] + button');
    this.toggleConfirmPasswordBtn = this.page.locator('input[placeholder="Xác nhận mật khẩu mới"] + button');
    
    this.submitChangePasswordBtn = this.page.locator('button:has-text("Xác nhận đổi mật khẩu")');

    // Errors & Success
    this.currentPasswordError = this.page.locator('p.text-danger').filter({ hasText: 'hiện tại' });
    this.newPasswordError = this.page.locator('p.text-danger').filter({ hasText: 'mật khẩu mới' });
    this.confirmPasswordError = this.page.locator('p.text-danger').filter({ hasText: 'xác nhận' });
    this.changePasswordSuccessMsg = this.page.locator('.bg-success-light');
    this.changePasswordFailureMsg = this.page.locator('.bg-danger-light');

    // OTP Modal
    this.otpModalHeader = this.page.locator('h2:has-text("Nhập mã xác thực")');
    this.otpModalInput = this.page.locator('input[maxlength="6"]');
    this.otpModalCloseBtn = this.page.locator('div.fixed.inset-0:has(h2:has-text("Nhập mã xác thực")) button:has(span:has-text("close"))');
    this.otpModalConfirmBtn = this.page.locator('div.fixed.inset-0:has(h2:has-text("Nhập mã xác thực")) button:has-text("Xác nhận")');
    this.otpModalError = this.page.locator('div.fixed.inset-0:has(h2:has-text("Nhập mã xác thực")) p.text-danger');
    this.otpModalCountdown = this.page.locator('span:has-text("Thời gian còn lại:")');
    this.otpModalResendLink = this.page.locator('button:has-text("Gửi lại mã")');

    // History Tab
    this.filterOrderIdInput = this.page.locator('input[placeholder="Nhập mã đơn hàng"]');
    this.filterDateInput = this.page.locator('div:has(input[placeholder="Nhập mã đơn hàng"]) input[type="date"]');
    this.filterRouteInput = this.page.locator('input[placeholder="Nhập tuyến đường"]');
    this.filterStatusSelect = this.page.locator('div:has(input[placeholder="Nhập mã đơn hàng"]) select');
    this.searchHistoryBtn = this.page.locator('button:has-text("Tìm")');
    this.resetFilterBtn = this.page.locator('button:has-text("Xóa lọc")');
    this.historyTableRows = this.page.locator('tbody tr:not(.animate-pulse)');
    this.emptyHistoryRow = this.page.locator('tbody tr:has-text("Không có vé nào"), tbody tr:has-text("Không có lịch sử đặt vé")');

    // Pagination
    this.paginationPrevBtn = this.page.locator('button:has(span:has-text("chevron_left"))');
    this.paginationNextBtn = this.page.locator('button:has(span:has-text("chevron_right"))');
    this.paginationPages = this.page.locator('div.flex.items-center button:not(:has(span))');
  }

  /**
   * Switch to profile tab
   */
  async switchTab(tab: 'profile' | 'history' | 'password') {
    if (tab === 'profile') {
      await this.clickOn(this.profileTabBtn);
    } else if (tab === 'history') {
      await this.clickOn(this.historyTabBtn);
    } else if (tab === 'password') {
      await this.clickOn(this.passwordTabBtn);
    }
  }

  /**
   * Start Edit Profile mode
   */
  async startEdit() {
    await this.clickOn(this.editProfileBtn);
  }

  /**
   * Edit profile info
   */
  async editInfo(fullName: string, gender: 'Nam' | 'Nu', email: string, dob: string) {
    if (fullName !== null) {
      await this.typeText(this.fullNameInput, fullName);
    }
    if (gender !== null) {
      await this.genderSelect.selectOption(gender);
    }
    if (email !== null) {
      await this.typeText(this.emailInput, email);
    }
    if (dob !== null) {
      await this.dobInput.fill(dob);
    }
  }

  /**
   * Save profile changes
   */
  async save() {
    await this.clickOn(this.updateProfileBtn);
  }

  /**
   * Cancel profile changes
   */
  async cancel() {
    await this.clickOn(this.cancelEditBtn);
  }

  /**
   * Change password
   */
  async changePasswordFill(currentPass: string, newPass: string, confirmPass: string) {
    if (currentPass !== null) await this.typeText(this.currentPasswordInput, currentPass);
    if (newPass !== null) await this.typeText(this.newPasswordInput, newPass);
    if (confirmPass !== null) await this.typeText(this.confirmPasswordInput, confirmPass);
  }

  /**
   * Submit change password request to open OTP popup
   */
  async submitChangePassword() {
    await this.clickOn(this.submitChangePasswordBtn);
  }

  /**
   * Submit OTP in Change Password flow
   */
  async submitOtp(otp: string) {
    await this.typeText(this.otpModalInput, otp);
    await this.clickOn(this.otpModalConfirmBtn);
  }

  /**
   * Close OTP modal
   */
  async closeOtpModal() {
    await this.clickOn(this.otpModalCloseBtn);
  }

  /**
   * Filter history
   */
  async filterHistory(orderId: string, date: string, route: string, status: string) {
    if (orderId !== null) await this.typeText(this.filterOrderIdInput, orderId);
    if (date !== null) await this.filterDateInput.fill(date);
    if (route !== null) await this.typeText(this.filterRouteInput, route);
    if (status !== null) await this.filterStatusSelect.selectOption(status);
    await this.clickOn(this.searchHistoryBtn);
  }

  /**
   * Clear history filters
   */
  async clearFilters() {
    await this.clickOn(this.resetFilterBtn);
  }
}
