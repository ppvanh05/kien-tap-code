import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Page Object Model đại diện cho modal Quên mật khẩu (Forgot Password Modal)
 */
export class ForgotPasswordPage extends BasePage {
  // Quy tắc chung của modal
  readonly modalTitle: Locator;
  readonly closeBtn: Locator;
  readonly backToLoginBtn: Locator;
  readonly modalOverlay: Locator;

  // Bước 1: Nhập SĐT
  readonly phoneNumberInput: Locator;
  readonly sendOtpBtn: Locator;
  readonly phoneNumberError: Locator;

  // Bước 2: Xác thực OTP
  readonly otpDigitsInput: Locator;
  readonly otpBoxes: Locator;
  readonly otpCountdownText: Locator;
  readonly resendOtpLink: Locator;
  readonly otpError: Locator;
  readonly continueOtpBtn: Locator;

  // Bước 3: Đặt mật khẩu mới
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly toggleNewPasswordBtn: Locator;
  readonly toggleConfirmPasswordBtn: Locator;
  readonly newPasswordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly resetError: Locator;
  readonly submitResetBtn: Locator;

  // Toast thành công
  readonly toastSuccessAlert: Locator;

  constructor(page: Page) {
    super(page);

    // Quy tắc chung
    this.modalTitle = this.page.locator('h2.text-title-lg');
    this.closeBtn = this.page.locator('button:has(span:has-text("close"))');
    this.backToLoginBtn = this.page.locator('button:has-text("Đăng nhập")').last(); // Nút đăng nhập quay lại ở footer
    this.modalOverlay = this.page.locator('div.fixed.inset-0.bg-black\\/40');

    // Bước 1
    this.phoneNumberInput = this.page.locator('input[placeholder="Nhập số điện thoại"]');
    this.sendOtpBtn = this.page.locator('button:has-text("Gửi mã xác thực")');
    this.phoneNumberError = this.page.locator('p.text-danger').first();

    // Bước 2
    this.otpDigitsInput = this.page.locator('input[maxlength="6"]');
    this.otpBoxes = this.page.locator('div.grid-cols-6 div');
    this.otpCountdownText = this.page.locator('span:has-text("Thời gian còn lại:")');
    this.resendOtpLink = this.page.locator('button:has-text("Gửi lại mã")');
    this.otpError = this.page.locator('p.text-danger');
    this.continueOtpBtn = this.page.locator('button:has-text("Tiếp tục")');

    // Bước 3
    this.newPasswordInput = this.page.locator('input[placeholder="Mật khẩu mới (ít nhất 6 ký tự)"]');
    this.confirmPasswordInput = this.page.locator('input[placeholder="Nhập lại mật khẩu"]');
    this.toggleNewPasswordBtn = this.page.locator('input[placeholder="Mật khẩu mới (ít nhất 6 ký tự)"] + button');
    this.toggleConfirmPasswordBtn = this.page.locator('input[placeholder="Nhập lại mật khẩu"] + button');
    
    this.newPasswordError = this.page.locator('p.text-danger').first(); // phoneNumberError không còn hiển thị nên first() là newPasswordError
    this.confirmPasswordError = this.page.locator('p.text-danger');
    this.resetError = this.page.locator('p.text-danger');
    this.submitResetBtn = this.page.locator('button:has-text("Xác nhận")');

    // Toast
    this.toastSuccessAlert = this.page.locator('div.bg-success');
  }

  /**
   * Mở modal Quên mật khẩu từ trang chủ
   */
  async openForgotPasswordModal(): Promise<void> {
    const registerMenuBtn = this.page.locator('button:has-text("Đăng nhập / Đăng ký")');
    await this.clickOn(registerMenuBtn);
    const forgotPasswordLink = this.page.locator('text=Quên mật khẩu?');
    await this.clickOn(forgotPasswordLink);
  }

  /**
   * Bước 1: Nhập Số điện thoại và gửi yêu cầu OTP
   */
  async submitPhoneNumber(phone: string): Promise<void> {
    await this.typeText(this.phoneNumberInput, phone);
    await this.clickOn(this.sendOtpBtn);
  }

  /**
   * Bước 2: Điền OTP 6 chữ số
   */
  async submitOtp(otp: string): Promise<void> {
    await this.typeText(this.otpDigitsInput, otp);
    await this.clickOn(this.continueOtpBtn);
  }

  /**
   * Bước 3: Đặt mật khẩu mới
   */
  async fillNewPassword(newPass: string, confirmPass: string): Promise<void> {
    if (newPass !== null) {
      await this.typeText(this.newPasswordInput, newPass);
    }
    if (confirmPass !== null) {
      await this.typeText(this.confirmPasswordInput, confirmPass);
    }
  }

  /**
   * Bấm nút Xác nhận hoàn tất đổi mật khẩu
   */
  async submitResetPassword(): Promise<void> {
    await this.clickOn(this.submitResetBtn);
  }
}
