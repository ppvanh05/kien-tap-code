import { Component, EventEmitter, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthModalService } from '../auth-modal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<string>();

  step: 'phone' | 'otp' | 'reset' = 'phone';
  phoneNumber = '';
  otpDigits = Array(6).fill('');
  otpDigitsString = '';
  otpError = '';
  phoneNumberError = '';
  newPasswordError = '';
  confirmPasswordError = '';
  resetError = '';
  otpCountdown = 180;
  otpTimer: ReturnType<typeof setInterval> | null = null;
  generatedOtp = '';

  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  showToast = false;
  toastMessage = '';

  constructor(
    private authModalService: AuthModalService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnDestroy() {
    this.clearOtpTimer();
  }

  getMockUsers(): any[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const usersJson = localStorage.getItem('mock_users');
    if (!usersJson) {
      const defaultUsers = [
        {
          phoneNumber: '0987654321',
          fullName: 'Nguyễn Văn An',
          email: 'an.nguyen@example.com',
          password: '123456'
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(usersJson);
  }

  closeModal() {
    this.clearOtpTimer();
    this.authModalService.closeModal();
    this.close.emit();
  }

  startOtpTimer() {
    this.clearOtpTimer();
    this.otpCountdown = 180;
    this.otpTimer = setInterval(() => {
      if (this.otpCountdown > 0) {
        this.otpCountdown -= 1;
        this.cdr.detectChanges();
      } else {
        this.clearOtpTimer();
      }
    }, 1000);
  }

  formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  clearOtpTimer() {
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
      this.otpTimer = null;
    }
  }

  sendOtp() {
    this.phoneNumberError = '';
    this.otpError = '';
    this.resetError = '';

    const cleaned = this.phoneNumber.trim();
    const phoneRegex = /^(0|\+84)\d{9}$/;

    if (!phoneRegex.test(cleaned)) {
      this.phoneNumberError = 'Vui lòng nhập đúng số điện thoại gồm 10 chữ số.';
      return;
    }

    const users = this.getMockUsers();
    const userExists = users.some(u => u.phoneNumber === cleaned);
    if (!userExists) {
      this.phoneNumberError = 'Số điện thoại này chưa được đăng ký.';
      return;
    }

    this.phoneNumber = cleaned;
    this.generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    this.otpDigitsString = '';
    this.otpDigits = Array(6).fill('');
    this.otpError = '';
    this.step = 'otp';
    this.startOtpTimer();
  }

  onOtpChange(val: string) {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
    this.otpDigitsString = cleaned;
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = cleaned[i] || '';
    }
  }

  get isOtpValid(): boolean {
    return this.otpDigitsString.length === 6;
  }

  verifyOtp() {
    this.otpError = '';
    this.resetError = '';

    if (!this.otpDigitsString || this.otpDigitsString.length !== 6) {
      this.otpError = 'Vui lòng nhập đủ 6 chữ số mã xác thực.';
      return;
    }
    if (this.otpDigitsString !== this.generatedOtp) {
      this.otpError = 'Mã xác thực không đúng. Vui lòng thử lại.';
      return;
    }
    this.clearOtpTimer();
    this.otpError = '';
    this.step = 'reset';
  }

  resendOtp() {
    this.generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    this.otpDigitsString = '';
    this.otpDigits = Array(6).fill('');
    this.otpError = '';
    this.startOtpTimer();

  }

  toggleShowNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  openLoginFromForgot() {
    this.authModalService.closeModal();
    this.authModalService.openLoginModal();
  }

  resetPassword() {
    this.newPasswordError = '';
    this.confirmPasswordError = '';
    this.resetError = '';

    if (!this.newPassword || this.newPassword.length < 6) {
      this.newPasswordError = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Vui lòng nhập lại mật khẩu mới.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.confirmPasswordError = 'Mật khẩu nhập lại không khớp.';
      return;
    }

    const users = this.getMockUsers();
    const userIndex = users.findIndex(u => u.phoneNumber === this.phoneNumber);
    if (userIndex !== -1) {
      users[userIndex].password = this.newPassword;
      localStorage.setItem('mock_users', JSON.stringify(users));
      localStorage.setItem('lastLoggedInUser', JSON.stringify({
        phoneOrEmail: this.phoneNumber,
        password: this.newPassword
      }));
    } else {
      this.otpError = 'Có lỗi xảy ra, không tìm thấy tài khoản để cập nhật.';
      return;
    }

    this.otpError = '';
    this.toastMessage = 'Đặt lại mật khẩu thành công!';
    this.showToast = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showToast = false;
      this.authModalService.closeModal();
      this.authModalService.openLoginModal();
    }, 1500);
  }
}
