import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho modal Đăng ký tài khoản (Register Modal)
 */
export class RegisterPage extends BasePage {
  // BƯỚC 1: Nhập Số điện thoại
  readonly registerHeader: Locator;
  readonly phoneInput: Locator;
  readonly continuePhoneBtn: Locator;
  readonly phoneErrorMsg: Locator;
  readonly openLoginBtn: Locator;

  // BƯỚC 2: Nhập OTP
  readonly otpHeader: Locator;
  readonly otpHiddenInput: Locator;
  readonly otpCountdownText: Locator;
  readonly resendOtpLink: Locator;
  readonly otpErrorMsg: Locator;
  readonly continueOtpBtn: Locator;

  // BƯỚC 3: Cài đặt thông tin cá nhân
  readonly profileHeader: Locator;
  readonly fullNameInput: Locator;
  readonly readonlyPhoneInput: Locator;
  readonly emailInput: Locator;
  readonly emailErrorMsg: Locator;
  readonly passwordInput: Locator;
  readonly passwordErrorMsg: Locator;
  readonly confirmPasswordInput: Locator;
  readonly confirmPasswordErrorMsg: Locator;
  readonly togglePasswordBtn: Locator;
  readonly toggleConfirmPasswordBtn: Locator;
  readonly submitProfileBtn: Locator;
  readonly registrationErrorMsg: Locator;
  readonly toastSuccessAlert: Locator;
  readonly otpBoxes: Locator;
  readonly closeModalBtn: Locator;

  constructor(page: Page) {
    super(page);

    // BƯỚC 1
    this.registerHeader = this.page.locator('h2:has-text("Đăng ký")');
    this.phoneInput = this.page.locator('input[placeholder="Nhập số điện thoại"]');
    this.continuePhoneBtn = this.page.locator('button:has-text("Tiếp tục")');
    this.phoneErrorMsg = this.page.locator('p.text-danger').first(); // phoneNumberError
    this.openLoginBtn = this.page.locator('.fixed button:has-text("Đăng nhập")').filter({ hasNotText: 'Đăng ký' });

    // BƯỚC 2
    this.otpHeader = this.page.locator('h2:has-text("Nhập mã xác thực")');
    this.otpHiddenInput = this.page.locator('input[maxlength="6"]');
    this.otpCountdownText = this.page.locator('span:has-text("Thời gian còn lại:")');
    this.resendOtpLink = this.page.locator('button:has-text("Gửi lại mã")');
    this.otpErrorMsg = this.page.locator('p.text-danger');
    this.continueOtpBtn = this.page.locator('button:has-text("Tiếp tục")');
    
    // 6 ô OTP hiển thị trên UI
    this.otpBoxes = this.page.locator('.grid.grid-cols-6 > div');

    // BƯỚC 3
    this.profileHeader = this.page.locator('h2:has-text("Thiết lập thông tin")');
    this.fullNameInput = this.page.locator('input[placeholder="Nhập họ tên"]');
    this.readonlyPhoneInput = this.page.locator('input[type="tel"][readonly]');
    this.emailInput = this.page.locator('input[placeholder="Nhập email (không bắt buộc)"]');
    this.emailErrorMsg = this.page.locator('p.text-danger').first(); // emailError / fullNameError tùy hiển thị
    this.passwordInput = this.page.locator('input[placeholder="Tạo mật khẩu"]');
    this.passwordErrorMsg = this.page.locator('p.text-danger');
    this.confirmPasswordInput = this.page.locator('input[placeholder="Nhập lại mật khẩu"]');
    this.confirmPasswordErrorMsg = this.page.locator('p.text-danger');
    
    // Nút toggle password dựa vào icon visibility/visibility_off
    this.togglePasswordBtn = this.page.locator('button:has(span:has-text("visibility"))').first();
    this.toggleConfirmPasswordBtn = this.page.locator('button:has(span:has-text("visibility"))').last();
    
    this.submitProfileBtn = this.page.locator('button:has-text("Hoàn tất")');
    this.registrationErrorMsg = this.page.locator('p.text-danger');
    this.toastSuccessAlert = this.page.locator('div.bg-success');
    this.closeModalBtn = this.page.locator('button:has(span:has-text("close"))');
  }

  /**
   * Mở modal Đăng ký từ trang chủ
   */
  async openRegisterModal(): Promise<void> {
    const registerMenuBtn = this.page.locator('button:has-text("Đăng nhập / Đăng ký")');
    await this.clickOn(registerMenuBtn);
    const registerLink = this.page.locator('text=Đăng ký ngay');
    await this.clickOn(registerLink);
  }

  /**
   * Bước 1: Điền số điện thoại và tiếp tục
   */
  async submitPhoneNumber(phone: string): Promise<void> {
    await this.typeText(this.phoneInput, phone);
    await this.clickOn(this.continuePhoneBtn);
  }

  /**
   * Bước 2: Điền OTP 6 chữ số
   */
  async submitOtp(otp: string): Promise<void> {
    await this.typeText(this.otpHiddenInput, otp);
    await this.clickOn(this.continueOtpBtn);
  }

  /**
   * Bước 3: Hoàn thiện thông tin cá nhân
   */
  async fillProfileInfo(fullName: string, email: string, pass: string, confirmPass: string): Promise<void> {
    await this.typeText(this.fullNameInput, fullName);
    if (email) {
      await this.typeText(this.emailInput, email);
    }
    await this.typeText(this.passwordInput, pass);
    await this.typeText(this.confirmPasswordInput, confirmPass);
    await this.clickOn(this.submitProfileBtn);
  }
}
